package app

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"

	"agent/internal/booking"
)

var jalaliMonths = []string{"", "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"}

func kavenegarReady() bool {
	return strings.TrimSpace(os.Getenv("KAVENEGAR_API_KEY")) != ""
}

func templateName(kind string) string {
	key := map[string]string{
		"code":   "KAVENEGAR_TEMPLATE_CODE",
		"book":   "KAVENEGAR_TEMPLATE_BOOK",
		"remind": "KAVENEGAR_TEMPLATE_REMIND",
		"order":  "KAVENEGAR_TEMPLATE_ORDER",
		"table":  "KAVENEGAR_TEMPLATE_TABLE",
	}[kind]
	fallback := map[string]string{
		"code": "agent-code", "book": "agent-book", "remind": "agent-remind", "order": "agent-order", "table": "agent-table",
	}[kind]
	if key == "" {
		return ""
	}
	if value, ok := os.LookupEnv(key); ok {
		return strings.TrimSpace(value)
	}
	return fallback
}

func cleanToken(value string, spaces, max int) string {
	var b strings.Builder
	used := 0
	for _, r := range strings.TrimSpace(value) {
		if r == ' ' || r == '\n' || r == '\t' || r == '‌' {
			if spaces > 0 && used < spaces && b.Len() > 0 {
				b.WriteByte(' ')
				used++
			}
			continue
		}
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			b.WriteRune(r)
		}
	}
	out := strings.Join(strings.Fields(b.String()), " ")
	if utf8.RuneCountInString(out) > max {
		out = string([]rune(out)[:max])
	}
	out = strings.TrimSpace(out)
	if out == "" {
		return "مورد"
	}
	return out
}

func smsWhen(value, zone string) (date, clock string) {
	value = strings.TrimSpace(value)
	if len(value) >= 16 && value[10] == ' ' && value[13] == ':' {
		y, m, d, ok := booking.ParseYMD(value[:10])
		if ok {
			_, jm, jd := booking.ToJalali(y, m, d)
			month := "ماه"
			if jm >= 1 && jm <= 12 {
				month = jalaliMonths[jm]
			}
			return faDigits(strconv.Itoa(jd)) + month, faDigits(value[11:13] + value[14:16])
		}
	}
	t, err := time.Parse(time.RFC3339Nano, value)
	if err != nil {
		t, err = time.Parse(time.RFC3339, value)
	}
	if err != nil {
		return "تاریخ", "۰۰۰۰"
	}
	c := booking.CivilInZone(t, mustZone(zone))
	_, jm, jd := booking.ToJalali(c.Year, c.Month, c.Day)
	month := "ماه"
	if jm >= 1 && jm <= 12 {
		month = jalaliMonths[jm]
	}
	return faDigits(strconv.Itoa(jd)) + month, faDigits(pad2(c.Hour) + pad2(c.Minute))
}

func pad2(n int) string {
	if n < 10 {
		return "0" + strconv.Itoa(n)
	}
	return strconv.Itoa(n)
}

func lookupSMS(phone, template string, tokens map[string]string) error {
	key := strings.TrimSpace(os.Getenv("KAVENEGAR_API_KEY"))
	if key == "" || template == "" {
		return fail(400, "SMS", "پیامک هنوز وصل نشده")
	}
	form := url.Values{}
	form.Set("receptor", phone)
	form.Set("template", template)
	for name, value := range tokens {
		if value != "" {
			form.Set(name, value)
		}
	}
	req, err := http.NewRequest(http.MethodPost, "https://api.kavenegar.com/v1/"+key+"/verify/lookup.json", strings.NewReader(form.Encode()))
	if err != nil {
		return fail(502, "SMS", "ارسال پیامک ممکن نشد")
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	res, err := (&http.Client{Timeout: 12 * time.Second}).Do(req)
	if err != nil {
		return fail(502, "SMS", "ارسال پیامک ممکن نشد")
	}
	defer res.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	var parsed struct {
		Return struct {
			Status int `json:"status"`
		} `json:"return"`
	}
	if json.Unmarshal(raw, &parsed) != nil || parsed.Return.Status != 200 {
		return fail(502, "SMS", "کاوه‌نگار پیامک را نپذیرفت")
	}
	return nil
}

func (s *Service) sendPlatformCode(phone, code string) bool {
	if !kavenegarReady() {
		return false
	}
	template := templateName("code")
	if template == "" {
		return false
	}
	if err := lookupSMS(phone, template, map[string]string{"token": code}); err != nil {
		return false
	}
	s.mu.Lock()
	s.noteSMS(phone, "code", "sent", "")
	s.mu.Unlock()
	return true
}

func (s *Service) sendCustomerSMS(businessID, phone, kind string, tokens map[string]string) bool {
	phone = strings.TrimSpace(phone)
	if businessID == "" || phone == "" || !kavenegarReady() {
		return false
	}
	template := templateName(kind)
	if template == "" {
		return false
	}
	s.mu.Lock()
	var remind, receipt int
	err := s.db.QueryRow(`SELECT remind, receipt FROM sms_prefs WHERE business_id = ?`, businessID).Scan(&remind, &receipt)
	if err == nil {
		if kind == "remind" && remind == 0 {
			s.mu.Unlock()
			return false
		}
		if kind != "remind" && receipt == 0 {
			s.mu.Unlock()
			return false
		}
	}
	res, err := s.db.Exec(`UPDATE sms_wallets SET balance = balance - 1 WHERE business_id = ? AND balance > 0`, businessID)
	if err != nil {
		s.mu.Unlock()
		return false
	}
	if n, _ := res.RowsAffected(); n == 0 {
		s.mu.Unlock()
		return false
	}
	s.mu.Unlock()
	if err := lookupSMS(phone, template, tokens); err != nil {
		s.mu.Lock()
		_, _ = s.db.Exec(`UPDATE sms_wallets SET balance = balance + 1 WHERE business_id = ?`, businessID)
		s.noteSMS(phone, kind, "failed", err.Error())
		s.mu.Unlock()
		return false
	}
	s.mu.Lock()
	s.noteSMS(phone, kind, "sent", "")
	s.mu.Unlock()
	return true
}

func (s *Service) noteSMS(phone, kind, status, last string) {
	payload, _ := json.Marshal(map[string]string{"to": phone, "kind": kind})
	_, _ = s.db.Exec(`INSERT INTO notification_jobs (id, channel, payload, status, last_error, created_at) VALUES (?,?,?,?,?,?)`,
		newID(), "sms", string(payload), status, clip(last, 180), s.now().UTC().Format(time.RFC3339))
}
