package app

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

const (
	planMonthToman = 100_000
	smsUnitToman   = 1_700
	trialLength    = 7 * 24 * time.Hour
)

func planPrice(months int) (int, bool) {
	switch months {
	case 1, 3, 6, 12:
		return months * planMonthToman, true
	default:
		return 0, false
	}
}

func packagePrice(count int) (int, bool) {
	switch count {
	case 100, 500, 1000:
		return count * smsUnitToman, true
	default:
		return 0, false
	}
}

func merchantOf(gateway string) string {
	switch gateway {
	case "zarinpal":
		return strings.TrimSpace(os.Getenv("ZARINPAL_MERCHANT_ID"))
	case "zibal":
		return strings.TrimSpace(os.Getenv("ZIBAL_MERCHANT"))
	default:
		return ""
	}
}

func gatewayTitle(gateway string) string {
	if gateway == "zibal" {
		return "زیبال"
	}
	return "زرین‌پال"
}

func (s *Service) gatewayEnabled(q querier, gateway string) bool {
	if merchantOf(gateway) == "" {
		return false
	}
	var value string
	if err := q.QueryRow(`SELECT value FROM platform_settings WHERE key = ?`, "gateway_"+gateway).Scan(&value); err != nil {
		return false
	}
	return value == "1"
}

func (s *Service) billingLive(q querier) bool {
	return s.gatewayEnabled(q, "zarinpal") || s.gatewayEnabled(q, "zibal")
}

func (s *Service) gatewayView(q querier) []map[string]any {
	out := []map[string]any{}
	for _, id := range []string{"zarinpal", "zibal"} {
		ready := merchantOf(id) != ""
		out = append(out, map[string]any{
			"id": id, "title": gatewayTitle(id), "ready": ready, "enabled": ready && s.gatewayEnabled(q, id),
		})
	}
	return out
}

func (s *Service) ensureSub(q querier, businessID string) {
	var id string
	err := q.QueryRow(`SELECT id FROM subscriptions WHERE business_id = ? LIMIT 1`, businessID).Scan(&id)
	if err == sql.ErrNoRows {
		_, _ = q.Exec(`INSERT INTO subscriptions (id, business_id, plan, status, created_at) VALUES (?,?, 'free', 'none', ?)`, newID(), businessID, s.now().UTC().Format(time.RFC3339))
	}
}

func afterStamp(value string, now time.Time) bool {
	if strings.TrimSpace(value) == "" {
		return false
	}
	t, err := time.Parse(time.RFC3339, value)
	if err != nil {
		t, err = time.Parse(time.RFC3339Nano, value)
	}
	return err == nil && t.After(now)
}

func (s *Service) readSub(q querier, businessID string) (trial, plan, appearance string) {
	s.ensureSub(q, businessID)
	_ = q.QueryRow(`SELECT trial_ends_at, plan_ends_at, appearance_ends_at FROM subscriptions WHERE business_id = ? LIMIT 1`, businessID).Scan(&trial, &plan, &appearance)
	return trial, plan, appearance
}

func (s *Service) entitlements(q querier, businessID string, touch bool) (commerce bool, appearance bool) {
	if !s.billingLive(q) {
		return true, true
	}
	trial, plan, look := s.readSub(q, businessID)
	if touch && strings.TrimSpace(trial) == "" {
		trial = s.now().UTC().Add(trialLength).Format(time.RFC3339)
		_, _ = q.Exec(`UPDATE subscriptions SET trial_ends_at = ? WHERE business_id = ? AND trial_ends_at = ''`, trial, businessID)
	}
	now := s.now().UTC()
	trialOpen := strings.TrimSpace(trial) == "" || afterStamp(trial, now)
	return trialOpen || afterStamp(plan, now), trialOpen || afterStamp(look, now)
}

func (s *Service) commerceOpen(q querier, businessID string) error {
	ok, _ := s.entitlements(q, businessID, true)
	if ok {
		return nil
	}
	return fail(402, "PAYMENT", "اشتراک این صفحه تمام شده. برای نوبت، سفارش و رزرو میز باید تمدید شود.")
}

func (s *Service) billingView(q querier, businessID string) map[string]any {
	live := s.billingLive(q)
	trial, plan, look := "", "", ""
	balance := 0
	remind, receipt, survey := 1, 1, 0
	if live {
		_, _ = s.entitlements(q, businessID, true)
		trial, plan, look = s.readSub(q, businessID)
	} else {
		trial, plan, look = s.readSub(q, businessID)
	}
	_ = q.QueryRow(`SELECT balance FROM sms_wallets WHERE business_id = ?`, businessID).Scan(&balance)
	_ = q.QueryRow(`SELECT remind, receipt, survey FROM sms_prefs WHERE business_id = ?`, businessID).Scan(&remind, &receipt, &survey)
	commerce, appearance := s.entitlements(q, businessID, false)
	if live {
		commerce, appearance = s.entitlements(q, businessID, true)
	}
	plans := []map[string]any{}
	for _, months := range []int{1, 3, 6, 12} {
		price, _ := planPrice(months)
		plans = append(plans, map[string]any{"months": months, "price": price})
	}
	packages := []map[string]any{}
	for _, count := range []int{100, 500, 1000} {
		price, _ := packagePrice(count)
		packages = append(packages, map[string]any{"count": count, "price": price})
	}
	return map[string]any{
		"live": live, "trialEndsAt": trial, "planEndsAt": plan, "appearanceEndsAt": look,
		"commerce": commerce, "appearance": appearance, "smsBalance": balance,
		"remind": remind != 0, "receipt": receipt != 0, "survey": survey != 0,
		"gateways": s.gatewayView(q), "plans": plans, "packages": packages,
		"smsReady": kavenegarReady(),
	}
}

func (s *Service) SetGateway(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	now := s.now().UTC().Format(time.RFC3339)
	for _, id := range []string{"zarinpal", "zibal"} {
		if _, ok := raw[id]; !ok {
			continue
		}
		on := isTrue(raw, id)
		if on && merchantOf(id) == "" {
			return nil, fail(400, "VALIDATION", "مرچنت "+gatewayTitle(id)+" هنوز در محیط برنامه نیست")
		}
		value := "0"
		if on {
			value = "1"
		}
		if _, err := s.db.Exec(`INSERT INTO platform_settings (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`, "gateway_"+id, value, now); err != nil {
			return nil, err
		}
	}
	_ = s.audit(s.db, userID, "save_settings", "platform_settings", nil, nil, "gateway")
	return s.overview()
}

func (s *Service) SaveSMSPrefs(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner"); err != nil {
		return nil, err
	}
	remind := bint(notFalse(raw, "remind"))
	receipt := bint(notFalse(raw, "receipt"))
	survey := bint(isTrue(raw, "survey"))
	if _, err := s.db.Exec(`INSERT INTO sms_prefs (business_id, remind, receipt, survey) VALUES (?,?,?,?)
		ON CONFLICT(business_id) DO UPDATE SET remind = excluded.remind, receipt = excluded.receipt, survey = excluded.survey`, businessID, remind, receipt, survey); err != nil {
		return nil, err
	}
	return s.billingView(s.db, businessID), nil
}

func (s *Service) StartPayment(userID string, raw map[string]any) (any, error) {
	unlock := s.lock()
	defer unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner"); err != nil {
		return nil, err
	}
	if !s.billingLive(s.db) {
		return nil, fail(400, "PAYMENT", "درگاه پرداخت هنوز وصل نشده")
	}
	gateway, err := textOf(raw, "gateway", 20, "")
	if err != nil || (gateway != "zarinpal" && gateway != "zibal") {
		return nil, fail(400, "VALIDATION", "درگاه را انتخاب کنید")
	}
	if !s.gatewayEnabled(s.db, gateway) {
		return nil, fail(400, "PAYMENT", "این درگاه الان خاموش است")
	}
	kind, err := textOf(raw, "kind", 20, "")
	if err != nil {
		return nil, err
	}
	months, count, amount := 0, 0, 0
	switch kind {
	case "plan", "appearance":
		months, err = intOf(raw, "months", 1, 12)
		if err != nil {
			return nil, err
		}
		price, ok := planPrice(months)
		if !ok {
			return nil, fail(400, "VALIDATION", "مدت اشتراک معتبر نیست")
		}
		amount = price
	case "sms":
		count, err = intOf(raw, "count", 1, 1000)
		if err != nil {
			return nil, err
		}
		price, ok := packagePrice(count)
		if !ok {
			return nil, fail(400, "VALIDATION", "بسته پیامک معتبر نیست")
		}
		amount = price
	default:
		return nil, fail(400, "VALIDATION", "نوع خرید معتبر نیست")
	}
	origin := safeOrigin(mustString(raw, "origin"))
	if origin == "" {
		return nil, fail(400, "VALIDATION", "آدرس بازگشت پرداخت مشخص نیست")
	}
	id := newID()
	now := s.now().UTC().Format(time.RFC3339)
	if _, err := s.db.Exec(`INSERT INTO payments (id, business_id, user_id, gateway, kind, term_months, sms_count, amount_toman, status, return_origin, created_at) VALUES (?,?,?,?,?,?,?,?,'pending',?,?)`,
		id, businessID, userID, gateway, kind, months, count, amount, origin, now); err != nil {
		return nil, err
	}
	callback := origin + "/api/v1/payments/callback/" + gateway + "?payment=" + url.QueryEscape(id)
	unlock()
	authority, redirect, err := requestGateway(gateway, amount*10, callback, paymentDescription(kind, months, count), id)
	s.mu.Lock()
	defer s.mu.Unlock()
	if err != nil {
		_, _ = s.db.Exec(`UPDATE payments SET status = 'failed' WHERE id = ? AND status = 'pending'`, id)
		return nil, err
	}
	if _, err := s.db.Exec(`UPDATE payments SET authority = ? WHERE id = ?`, authority, id); err != nil {
		return nil, err
	}
	return map[string]any{"url": redirect, "id": id}, nil
}

func paymentDescription(kind string, months, count int) string {
	switch kind {
	case "appearance":
		return "ظاهر صفحه " + strconv.Itoa(months) + " ماهه"
	case "sms":
		return "بسته " + strconv.Itoa(count) + " پیامک"
	default:
		return "اشتراک " + strconv.Itoa(months) + " ماهه"
	}
}

func (s *Service) FinishPayment(gateway string, query url.Values) string {
	unlock := s.lock()
	defer unlock()
	id := strings.TrimSpace(query.Get("payment"))
	if id == "" {
		id = strings.TrimSpace(query.Get("orderId"))
	}
	if id == "" && gateway == "zarinpal" {
		auth := strings.TrimSpace(query.Get("Authority"))
		if auth != "" {
			_ = s.db.QueryRow(`SELECT id FROM payments WHERE gateway = 'zarinpal' AND authority = ? ORDER BY created_at DESC LIMIT 1`, auth).Scan(&id)
		}
	}
	if id == "" && gateway == "zibal" {
		track := strings.TrimSpace(query.Get("trackId"))
		if track != "" {
			_ = s.db.QueryRow(`SELECT id FROM payments WHERE gateway = 'zibal' AND authority = ? ORDER BY created_at DESC LIMIT 1`, track).Scan(&id)
		}
	}
	fallback := "/panel/settings?pay=failed"
	if gateway != "zarinpal" && gateway != "zibal" {
		return fallback
	}
	var origin, status, authority, storedGateway string
	var amount int
	err := s.db.QueryRow(`SELECT return_origin, status, authority, gateway, amount_toman FROM payments WHERE id = ?`, id).Scan(&origin, &status, &authority, &storedGateway, &amount)
	if err != nil || storedGateway != gateway {
		return fallback
	}
	back := strings.TrimRight(origin, "/") + "/panel/settings"
	if status == "paid" {
		return back + "?pay=paid"
	}
	if gateway == "zarinpal" && !strings.EqualFold(query.Get("Status"), "OK") {
		_, _ = s.db.Exec(`UPDATE payments SET status = 'failed' WHERE id = ? AND status = 'pending'`, id)
		return back + "?pay=failed"
	}
	if gateway == "zibal" && query.Get("success") == "0" {
		_, _ = s.db.Exec(`UPDATE payments SET status = 'failed' WHERE id = ? AND status = 'pending'`, id)
		return back + "?pay=failed"
	}
	got := ""
	if gateway == "zarinpal" {
		got = strings.TrimSpace(query.Get("Authority"))
	} else {
		got = strings.TrimSpace(query.Get("trackId"))
	}
	if got == "" || authority == "" || got != authority {
		return back + "?pay=failed"
	}
	unlock()
	ref, err := verifyGateway(gateway, got, amount*10)
	s.mu.Lock()
	defer s.mu.Unlock()
	if err != nil {
		return back + "?pay=failed"
	}
	if err := s.applyPaid(s.db, id, ref); err != nil {
		return back + "?pay=failed"
	}
	return back + "?pay=paid"
}

func (s *Service) applyPaid(q querier, id, ref string) error {
	var business, kind, status string
	var months, count int
	err := q.QueryRow(`SELECT business_id, kind, term_months, sms_count, status FROM payments WHERE id = ?`, id).Scan(&business, &kind, &months, &count, &status)
	if err != nil {
		return err
	}
	if status == "paid" {
		return nil
	}
	now := s.now().UTC()
	res, err := q.Exec(`UPDATE payments SET status = 'paid', ref_id = ?, paid_at = ? WHERE id = ? AND status = 'pending'`, ref, now.Format(time.RFC3339), id)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return nil
	}
	s.ensureSub(q, business)
	switch kind {
	case "plan", "appearance":
		column := "plan_ends_at"
		if kind == "appearance" {
			column = "appearance_ends_at"
		}
		var ends string
		_ = q.QueryRow(`SELECT `+column+` FROM subscriptions WHERE business_id = ? LIMIT 1`, business).Scan(&ends)
		base := now
		if t, err := time.Parse(time.RFC3339, ends); err == nil && t.After(now) {
			base = t
		}
		next := base.AddDate(0, months, 0).UTC().Format(time.RFC3339)
		if kind == "plan" {
			_, err = q.Exec(`UPDATE subscriptions SET plan = ?, status = 'active', plan_ends_at = ? WHERE business_id = ?`, strconv.Itoa(months)+"m", next, business)
		} else {
			_, err = q.Exec(`UPDATE subscriptions SET appearance_ends_at = ? WHERE business_id = ?`, next, business)
		}
	case "sms":
		_, err = q.Exec(`INSERT INTO sms_wallets (business_id, balance) VALUES (?, ?) ON CONFLICT(business_id) DO UPDATE SET balance = balance + excluded.balance`, business, count)
	default:
		return fail(400, "VALIDATION", "نوع خرید معتبر نیست")
	}
	if err != nil {
		return err
	}
	_ = s.audit(q, "", "payment_paid", "payment", strPtr(id), strPtr(business), kind)
	return nil
}

func requestGateway(gateway string, rial int, callback, description, orderID string) (string, string, error) {
	switch gateway {
	case "zarinpal":
		return zarinpalRequest(rial, callback, description)
	case "zibal":
		return zibalRequest(rial, callback, description, orderID)
	default:
		return "", "", fail(400, "VALIDATION", "درگاه را انتخاب کنید")
	}
}

func verifyGateway(gateway, authority string, rial int) (string, error) {
	switch gateway {
	case "zarinpal":
		return zarinpalVerify(authority, rial)
	case "zibal":
		return zibalVerify(authority, rial)
	default:
		return "", fail(400, "VALIDATION", "درگاه را انتخاب کنید")
	}
}

func zarinpalBase() string {
	if os.Getenv("ZARINPAL_SANDBOX") == "1" {
		return "https://sandbox.zarinpal.com/pg/v4/payment"
	}
	return "https://api.zarinpal.com/pg/v4/payment"
}

func zarinpalStart(authority string) string {
	if os.Getenv("ZARINPAL_SANDBOX") == "1" {
		return "https://sandbox.zarinpal.com/pg/StartPay/" + authority
	}
	return "https://www.zarinpal.com/pg/StartPay/" + authority
}

func zarinpalRequest(rial int, callback, description string) (string, string, error) {
	body, _ := json.Marshal(map[string]any{
		"merchant_id": merchantOf("zarinpal"), "amount": rial, "callback_url": callback, "description": description,
	})
	var parsed struct {
		Data struct {
			Code      int    `json:"code"`
			Authority string `json:"authority"`
			Message   string `json:"message"`
		} `json:"data"`
	}
	if err := postJSON(zarinpalBase()+"/request.json", body, &parsed); err != nil {
		return "", "", err
	}
	if parsed.Data.Code != 100 || parsed.Data.Authority == "" {
		return "", "", fail(502, "PAYMENT", "زرین‌پال پرداخت را نساخت")
	}
	return parsed.Data.Authority, zarinpalStart(parsed.Data.Authority), nil
}

func zarinpalVerify(authority string, rial int) (string, error) {
	body, _ := json.Marshal(map[string]any{"merchant_id": merchantOf("zarinpal"), "amount": rial, "authority": authority})
	var parsed struct {
		Data struct {
			Code  int `json:"code"`
			RefID int `json:"ref_id"`
		} `json:"data"`
	}
	if err := postJSON(zarinpalBase()+"/verify.json", body, &parsed); err != nil {
		return "", err
	}
	if parsed.Data.Code != 100 && parsed.Data.Code != 101 {
		return "", fail(402, "PAYMENT", "پرداخت زرین‌پال تأیید نشد")
	}
	return strconv.Itoa(parsed.Data.RefID), nil
}

func zibalRequest(rial int, callback, description, orderID string) (string, string, error) {
	body, _ := json.Marshal(map[string]any{
		"merchant": merchantOf("zibal"), "amount": rial, "callbackUrl": callback, "description": description, "orderId": orderID,
	})
	var parsed struct {
		Result  int    `json:"result"`
		TrackID int64  `json:"trackId"`
		Message string `json:"message"`
	}
	if err := postJSON("https://gateway.zibal.ir/v1/request", body, &parsed); err != nil {
		return "", "", err
	}
	if parsed.Result != 100 || parsed.TrackID == 0 {
		return "", "", fail(502, "PAYMENT", "زیبال پرداخت را نساخت")
	}
	track := strconv.FormatInt(parsed.TrackID, 10)
	return track, "https://gateway.zibal.ir/start/" + track, nil
}

func zibalVerify(track string, rial int) (string, error) {
	id, err := strconv.ParseInt(track, 10, 64)
	if err != nil {
		return "", fail(400, "VALIDATION", "شناسه پرداخت زیبال معتبر نیست")
	}
	body, _ := json.Marshal(map[string]any{"merchant": merchantOf("zibal"), "trackId": id})
	var parsed struct {
		Result    int    `json:"result"`
		RefNumber string `json:"refNumber"`
		Amount    int    `json:"amount"`
	}
	if err := postJSON("https://gateway.zibal.ir/v1/verify", body, &parsed); err != nil {
		return "", err
	}
	if parsed.Result != 100 && parsed.Result != 201 {
		return "", fail(402, "PAYMENT", "پرداخت زیبال تأیید نشد")
	}
	if parsed.Amount != rial {
		return "", fail(402, "PAYMENT", "مبلغ پرداخت با سفارش یکی نیست")
	}
	if parsed.RefNumber == "" {
		parsed.RefNumber = track
	}
	return parsed.RefNumber, nil
}

func stripCustomTheme(value any) any {
	list, ok := value.([]any)
	if !ok {
		return value
	}
	for _, item := range list {
		block, ok := item.(map[string]any)
		if !ok || block["type"] != "design" {
			continue
		}
		body, _ := block["body"].(string)
		var design map[string]any
		if json.Unmarshal([]byte(body), &design) != nil {
			continue
		}
		if theme, _ := design["theme"].(string); theme != "" && theme != "light" && theme != "dark" {
			design["theme"] = "dark"
			if next, err := json.Marshal(design); err == nil {
				block["body"] = string(next)
			}
		}
	}
	return list
}

func postJSON(endpoint string, body []byte, dest any) error {
	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return fail(502, "PAYMENT", "اتصال به درگاه ممکن نشد")
	}
	req.Header.Set("Content-Type", "application/json")
	res, err := (&http.Client{Timeout: 12 * time.Second}).Do(req)
	if err != nil {
		return fail(502, "PAYMENT", "اتصال به درگاه ممکن نشد")
	}
	defer res.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if err := json.Unmarshal(raw, dest); err != nil {
		return fail(502, "PAYMENT", "پاسخ درگاه خوانده نشد")
	}
	return nil
}
