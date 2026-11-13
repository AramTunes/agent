package app

import (
	"encoding/json"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"agent/internal/booking"
)

var clockRe = regexp.MustCompile(`^([01]\d|2[0-3]):[0-5]\d$`)

func (s *Service) PlaceMenuOrder(raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	slug := strings.TrimSpace(mustString(raw, "slug"))
	if slug == "" || !s.rate("menu-order:"+slug, 40, time.Hour) {
		if slug == "" {
			return nil, fail(400, "VALIDATION", "صفحه مشخص نیست")
		}
		return nil, fail(429, "RATE", "چند لحظه بعد دوباره سفارش بده")
	}
	b, err := loadBiz(s.db, "slug = ?", slug)
	if err != nil {
		return nil, err
	}
	if b.Status != "active" {
		return nil, fail(404, "NOT_FOUND", "این صفحه در دسترس نیست")
	}
	name := strings.TrimSpace(mustString(raw, "name"))
	name = strings.ReplaceAll(name, "\n", " ")
	if utf8.RuneCountInString(name) < 2 {
		return nil, fail(400, "VALIDATION", "نام و نام خانوادگی را وارد کنید")
	}
	name = clip(name, 80)
	phone, err := normalizePhone(mustString(raw, "phone"))
	if err != nil {
		return nil, err
	}
	if !s.rate("menu-order-phone:"+phone, 8, time.Hour) {
		return nil, fail(429, "RATE", "چند لحظه بعد دوباره سفارش بده")
	}
	note := clip(strings.TrimSpace(mustString(raw, "note")), 300)
	address := clip(strings.ReplaceAll(strings.TrimSpace(mustString(raw, "address")), "\n", " "), 200)
	if utf8.RuneCountInString(address) < 5 {
		return nil, fail(400, "VALIDATION", "آدرس را کامل‌تر بنویسید")
	}
	lines, err := orderLines(raw)
	if err != nil {
		return nil, err
	}
	if len(lines) == 0 {
		return nil, fail(400, "VALIDATION", "سبد خالی است")
	}
	when := mustString(raw, "when")
	if when != "later" {
		when = "now"
	}
	fulfill := ""
	if when == "later" {
		day := strings.TrimSpace(mustString(raw, "date"))
		clock := strings.TrimSpace(mustString(raw, "time"))
		if !dayRe.MatchString(day) || !clockRe.MatchString(clock) {
			return nil, fail(400, "VALIDATION", "تاریخ و ساعت را مشخص کنید")
		}
		loc := mustZone(b.Timezone)
		today := booking.TodayYMD(loc, s.now())
		if day < today {
			return nil, fail(400, "VALIDATION", "این تاریخ گذشته است")
		}
		if day == today {
			now := s.now().In(loc)
			hour := int(clock[0]-'0')*10 + int(clock[1]-'0')
			min := int(clock[3]-'0')*10 + int(clock[4]-'0')
			if hour*60+min < now.Hour()*60+now.Minute() {
				return nil, fail(400, "VALIDATION", "این ساعت گذشته است")
			}
		}
		fulfill = day + " " + clock
		if err := s.checkDelivery(b.ID, day, clock, loc); err != nil {
			return nil, err
		}
	}
	stored := make([]map[string]any, 0, len(lines))
	variants := make([]string, 0, len(lines))
	total := 0
	currency := ""
	priced := true
	var firstID string
	for _, line := range lines {
		item, variant, err := findMenuItem(b.PageBlocks, line.itemID, line.variantID)
		if err != nil {
			return nil, err
		}
		if firstID == "" {
			firstID = item.ID
		}
		amount, sure := definiteLine(item.PriceType, item.Price, line.qty)
		cur := item.Currency
		if cur == "" {
			cur = "toman"
		}
		if !sure || cur != "toman" {
			priced = false
		} else {
			total += amount
		}
		stored = append(stored, map[string]any{
			"itemId": item.ID, "title": item.Title, "variant": variant, "qty": line.qty,
			"price": item.Price, "priceTo": item.PriceTo, "priceType": item.PriceType, "currency": item.Currency,
		})
		if variant != "" {
			variants = append(variants, variant)
		}
	}
	currency = "toman"
	payload, err := json.Marshal(stored)
	if err != nil {
		return nil, err
	}
	summary := stored[0]["title"].(string)
	if v, _ := stored[0]["variant"].(string); v != "" {
		summary += "، " + v
	}
	if len(stored) > 1 {
		summary = clip(summary, 40) + " و " + strconv.Itoa(len(stored)-1) + " مورد دیگر"
	}
	id := newID()
	token := newID()
	now := s.now().UTC().Format(time.RFC3339)
	customerID, err := s.customerManual(s.db, b.ID, name, phone)
	if err != nil {
		return nil, err
	}
	if address != "" {
		_, _ = s.db.Exec(`UPDATE customers SET address = ? WHERE id = ? AND address = ''`, address, customerID)
	}
	if _, err := s.db.Exec(`INSERT INTO menu_orders (id, business_id, item_id, item_title, variant_title, price, currency, customer_name, phone, email, when_kind, fulfill_at, note, status, created_at, address, lines, priced, customer_id, receipt_token) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'new',?,?,?,?,?,?)`,
		id, b.ID, firstID, clip(summary, 80), clip(strings.Join(variants, "، "), 120), total, currency, name, phone, "", when, fulfill, note, now, address, string(payload), bint(priced), customerID, token); err != nil {
		return nil, err
	}
	whenText := "هرچه زودتر"
	if when == "later" {
		whenText = fulfillLabel(fulfill)
	}
	body := name + "\nتلفن: " + phone + "\nآدرس: " + address + "\n" + clip(summary, 80) + "\n" + whenText
	if note != "" {
		body += "\nیادداشت: " + note
	}
	s.notify(s.db, s.orderWatchers(s.db, b.ID), b.ID, id, "menu_order", "سفارش جدید", body)
	if smsReady() {
		link := receiptLink(safeOrigin(mustString(raw, "origin")), token)
		s.queueSMS(phone, customerReceiptText("order", link), id)
	}
	return map[string]any{"id": id, "receiptToken": token}, nil
}

type orderLine struct {
	itemID, variantID string
	qty               int
}

func orderLines(raw map[string]any) ([]orderLine, error) {
	value, ok := raw["lines"].([]any)
	if !ok || len(value) == 0 {
		itemID := strings.TrimSpace(mustString(raw, "itemId"))
		if itemID == "" {
			return nil, nil
		}
		return []orderLine{{itemID: itemID, variantID: strings.TrimSpace(mustString(raw, "variantId")), qty: 1}}, nil
	}
	if len(value) > 20 {
		return nil, fail(400, "VALIDATION", "تعداد کالاها زیاد است")
	}
	out := make([]orderLine, 0, len(value))
	for _, row := range value {
		item, ok := row.(map[string]any)
		if !ok {
			continue
		}
		id := strings.TrimSpace(mustString(item, "itemId"))
		if id == "" {
			continue
		}
		qty := 1
		switch n := item["qty"].(type) {
		case float64:
			qty = int(n)
		case int:
			qty = n
		}
		if qty < 1 {
			qty = 1
		}
		if qty > 20 {
			qty = 20
		}
		out = append(out, orderLine{itemID: id, variantID: strings.TrimSpace(mustString(item, "variantId")), qty: qty})
	}
	return out, nil
}

type menuHit struct {
	ID, Title, Currency, PriceType string
	Price, PriceTo                 int
}

func findMenuItem(raw, itemID, variantID string) (menuHit, string, error) {
	var blocks []struct {
		Type     string `json:"type"`
		Active   *bool  `json:"active"`
		Currency string `json:"currency"`
		Items    []struct {
			ID        string `json:"id"`
			Kind      string `json:"kind"`
			Title     string `json:"title"`
			Status    string `json:"status"`
			Price     int    `json:"price"`
			PriceTo   int    `json:"priceTo"`
			PriceType string `json:"priceType"`
			Variants  []struct {
				ID     string `json:"id"`
				Title  string `json:"title"`
				Status string `json:"status"`
				Price  int    `json:"price"`
			} `json:"variants"`
		} `json:"items"`
	}
	if err := json.Unmarshal([]byte(raw), &blocks); err != nil {
		return menuHit{}, "", fail(400, "VALIDATION", "این مورد قابل سفارش نیست")
	}
	itemID = strings.TrimSpace(itemID)
	variantID = strings.TrimSpace(variantID)
	for _, block := range blocks {
		if (block.Type != "menu" && block.Type != "products" && block.Type != "services") || (block.Active != nil && !*block.Active) {
			continue
		}
		for _, item := range block.Items {
			if item.Kind != "item" || item.ID != itemID {
				continue
			}
			if item.Status == "hidden" || item.Status == "unavailable" {
				return menuHit{}, "", fail(400, "VALIDATION", "این مورد الان قابل سفارش نیست")
			}
			price := item.Price
			if item.PriceType == "free" {
				price = 0
			}
			label := ""
			if len(item.Variants) > 0 {
				found := false
				for _, variant := range item.Variants {
					if variant.ID != variantID {
						continue
					}
					if variant.Status == "hidden" || variant.Status == "unavailable" {
						return menuHit{}, "", fail(400, "VALIDATION", "این گزینه الان موجود نیست")
					}
					price = variant.Price
					label = variant.Title
					found = true
					break
				}
				if !found {
					return menuHit{}, "", fail(400, "VALIDATION", "یکی از گزینه‌ها را انتخاب کنید")
				}
			}
			currency := block.Currency
			if currency == "" {
				currency = "toman"
			}
			return menuHit{ID: item.ID, Title: item.Title, Price: price, PriceTo: item.PriceTo, PriceType: menuPriceType(item.PriceType), Currency: currency}, label, nil
		}
	}
	return menuHit{}, "", fail(404, "NOT_FOUND", "این مورد در منو نیست")
}

func definiteLine(priceType string, price, qty int) (int, bool) {
	if qty < 1 {
		qty = 1
	}
	switch priceType {
	case "", "fixed":
		if price < 0 {
			price = 0
		}
		return price * qty, true
	case "free":
		return 0, true
	default:
		return 0, false
	}
}

func (s *Service) ListOrders(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, _ := textOf(raw, "businessId", 80, "")
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff"); err != nil {
		return nil, err
	}
	rows, err := s.db.Query(`
		SELECT id, customer_name, phone, address, note, status, when_kind, fulfill_at, created_at, price, currency, priced, lines
		FROM menu_orders WHERE business_id = ? ORDER BY created_at DESC`, businessID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, name, phone, address, note, status, whenKind, fulfill, created, currency, lines string
		var price, priced int
		if err := rows.Scan(&id, &name, &phone, &address, &note, &status, &whenKind, &fulfill, &created, &price, &currency, &priced, &lines); err != nil {
			return nil, err
		}
		var parsed any
		_ = json.Unmarshal([]byte(lines), &parsed)
		if parsed == nil {
			parsed = []any{}
		}
		out = append(out, map[string]any{
			"id": id, "name": name, "phone": phone, "address": address, "note": note, "status": status,
			"whenKind": whenKind, "fulfillAt": fulfill, "createdAt": created,
			"price": price, "currency": currency, "priced": priced != 0, "lines": parsed,
		})
	}
	return out, rows.Err()
}

func (s *Service) SetOrderStatus(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, _ := textOf(raw, "businessId", 80, "")
	orderID, err := textOf(raw, "id", 80, "")
	if err != nil || orderID == "" {
		return nil, fail(400, "VALIDATION", "سفارش پیدا نشد")
	}
	status, err := textOf(raw, "status", 20, "")
	if err != nil || !orderStatus(status) {
		return nil, fail(400, "VALIDATION", "وضعیت سفارش معتبر نیست")
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff"); err != nil {
		return nil, err
	}
	res, err := s.db.Exec(`UPDATE menu_orders SET status = ? WHERE id = ? AND business_id = ?`, status, orderID, businessID)
	if err != nil {
		return nil, err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return nil, fail(404, "NOT_FOUND", "سفارش پیدا نشد")
	}
	return map[string]any{"id": orderID, "status": status}, nil
}

func orderStatus(value string) bool {
	switch value {
	case "new", "preparing", "ready", "delivered", "cancelled":
		return true
	default:
		return false
	}
}

func (s *Service) shopHours(q querier, businessID string) []map[string]any {
	rows, err := q.Query(`SELECT weekday, start_min, end_min FROM shop_hours WHERE business_id = ? ORDER BY weekday, start_min`, businessID)
	if err != nil {
		return []map[string]any{}
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var weekday, start, end int
		if rows.Scan(&weekday, &start, &end) != nil {
			continue
		}
		out = append(out, map[string]any{"weekday": weekday, "startMin": start, "endMin": end})
	}
	return out
}

func (s *Service) ShopHours(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff"); err != nil {
		return nil, err
	}
	var zone string
	_ = s.db.QueryRow(`SELECT timezone FROM businesses WHERE id = ?`, businessID).Scan(&zone)
	if zone == "" {
		zone = "Asia/Tehran"
	}
	return map[string]any{"hours": s.shopHours(s.db, businessID), "timezone": zone}, nil
}

func (s *Service) SaveShopHours(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner"); err != nil {
		return nil, err
	}
	days, _ := raw["days"].([]any)
	if len(days) > 14 {
		return nil, fail(400, "VALIDATION", "بازه‌های ساعت کاری زیاد است")
	}
	tx, err := s.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()
	if _, err := tx.Exec(`DELETE FROM shop_hours WHERE business_id = ?`, businessID); err != nil {
		return nil, err
	}
	for _, rawDay := range days {
		day, ok := rawDay.(map[string]any)
		if !ok {
			return nil, fail(400, "VALIDATION", "درخواست نامعتبر است")
		}
		weekday, err := intOf(day, "weekday", 0, 6)
		if err != nil {
			return nil, err
		}
		startMin, err := intOf(day, "startMin", 0, 1439)
		if err != nil {
			return nil, err
		}
		endMin, err := intOf(day, "endMin", 1, 1440)
		if err != nil {
			return nil, err
		}
		if endMin <= startMin {
			return nil, fail(400, "VALIDATION", "ساعت پایان باید بعد از شروع باشد")
		}
		if _, err := tx.Exec(`INSERT INTO shop_hours (business_id, weekday, start_min, end_min) VALUES (?,?,?,?)`, businessID, weekday, startMin, endMin); err != nil {
			return nil, err
		}
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return map[string]any{"hours": s.shopHours(s.db, businessID)}, nil
}

func (s *Service) SetOrderWhen(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	orderID, err := textOf(raw, "id", 80, "")
	if err != nil || orderID == "" {
		return nil, fail(400, "VALIDATION", "سفارش پیدا نشد")
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff"); err != nil {
		return nil, err
	}
	var zone string
	if err := s.db.QueryRow(`SELECT timezone FROM businesses WHERE id = ?`, businessID).Scan(&zone); err != nil {
		return nil, fail(404, "NOT_FOUND", "کسب‌وکار پیدا نشد")
	}
	when := mustString(raw, "when")
	if when != "later" {
		when = "now"
	}
	fulfill := ""
	if when == "later" {
		day := strings.TrimSpace(mustString(raw, "date"))
		clock := strings.TrimSpace(mustString(raw, "time"))
		if !dayRe.MatchString(day) || !clockRe.MatchString(clock) {
			return nil, fail(400, "VALIDATION", "تاریخ و ساعت را مشخص کنید")
		}
		loc := mustZone(zone)
		today := booking.TodayYMD(loc, s.now())
		if day < today {
			return nil, fail(400, "VALIDATION", "این تاریخ گذشته است")
		}
		if day == today {
			now := s.now().In(loc)
			hour := int(clock[0]-'0')*10 + int(clock[1]-'0')
			min := int(clock[3]-'0')*10 + int(clock[4]-'0')
			if hour*60+min < now.Hour()*60+now.Minute() {
				return nil, fail(400, "VALIDATION", "این ساعت گذشته است")
			}
		}
		if err := s.checkDelivery(businessID, day, clock, loc); err != nil {
			return nil, err
		}
		fulfill = day + " " + clock
	}
	res, err := s.db.Exec(`UPDATE menu_orders SET when_kind = ?, fulfill_at = ? WHERE id = ? AND business_id = ?`, when, fulfill, orderID, businessID)
	if err != nil {
		return nil, err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return nil, fail(404, "NOT_FOUND", "سفارش پیدا نشد")
	}
	return map[string]any{"id": orderID, "whenKind": when, "fulfillAt": fulfill}, nil
}

func (s *Service) checkDelivery(businessID, day, clock string, loc *time.Location) error {
	minute := int(clock[0]-'0')*600 + int(clock[1]-'0')*60 + int(clock[3]-'0')*10 + int(clock[4]-'0')
	when, err := time.ParseInLocation("2006-01-02", day, loc)
	if err != nil {
		return fail(400, "VALIDATION", "تاریخ و ساعت را مشخص کنید")
	}
	rows, err := s.db.Query(`SELECT weekday, start_min, end_min FROM shop_hours WHERE business_id = ?`, businessID)
	if err != nil {
		return err
	}
	defer rows.Close()
	seen := false
	open := false
	weekday := int(when.Weekday())
	for rows.Next() {
		var wd, start, end int
		if rows.Scan(&wd, &start, &end) != nil {
			continue
		}
		seen = true
		if wd == weekday && minute >= start && minute < end {
			open = true
		}
	}
	if !seen {
		return fail(400, "VALIDATION", "ساعت کاری هنوز تنظیم نشده")
	}
	if !open {
		return fail(400, "VALIDATION", "این ساعت خارج از ساعت کاری است")
	}
	return nil
}

func (s *Service) orderWatchers(q querier, businessID string) []string {
	rows, err := q.Query(`SELECT user_id FROM memberships WHERE business_id = ? AND role IN ('owner','manager','staff') AND user_id <> ''`, businessID)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var ids []string
	seen := map[string]bool{}
	for rows.Next() {
		var id string
		_ = rows.Scan(&id)
		if id == "" || seen[id] {
			continue
		}
		seen[id] = true
		ids = append(ids, id)
	}
	return ids
}

func fulfillLabel(value string) string {
	parts := strings.Fields(value)
	if len(parts) == 0 {
		return value
	}
	when, err := time.Parse("2006-01-02", parts[0])
	if err != nil {
		return value
	}
	jy, jm, jd := booking.ToJalali(when.Year(), int(when.Month()), when.Day())
	months := []string{"فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"}
	label := strconv.Itoa(jd) + " " + months[jm-1]
	if jy > 0 {
		label += " " + strconv.Itoa(jy)
	}
	if len(parts) > 1 {
		label += "، " + parts[1]
	}
	return faDigits(label)
}

func faDigits(value string) string {
	var b strings.Builder
	for _, r := range value {
		if r >= '0' && r <= '9' {
			b.WriteRune('۰' + (r - '0'))
			continue
		}
		b.WriteRune(r)
	}
	return b.String()
}

func countableToman(price, priced int, currency string) (int, bool) {
	if currency != "" && currency != "toman" {
		return 0, false
	}
	if price <= 0 && priced == 0 {
		return 0, false
	}
	return price, true
}

func minuteOpen(spans [][2]int, minute int) bool {
	for _, span := range spans {
		if minute >= span[0] && minute < span[1] {
			return true
		}
	}
	return false
}
