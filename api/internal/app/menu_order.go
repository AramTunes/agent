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

var emailRe = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)
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
	email := strings.TrimSpace(mustString(raw, "email"))
	if email != "" && (len(email) > 80 || !emailRe.MatchString(email)) {
		return nil, fail(400, "VALIDATION", "ایمیل معتبر نیست")
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
	}
	stored := make([]map[string]any, 0, len(lines))
	total := 0
	currency := "toman"
	var firstID string
	for _, line := range lines {
		item, variant, err := findMenuItem(b.PageBlocks, line.itemID, line.variantID)
		if err != nil {
			return nil, err
		}
		if firstID == "" {
			firstID = item.ID
			currency = item.Currency
		}
		total += item.Price * line.qty
		stored = append(stored, map[string]any{
			"itemId": item.ID, "title": item.Title, "variant": variant, "qty": line.qty, "price": item.Price,
		})
	}
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
	now := s.now().UTC().Format(time.RFC3339)
	if _, err := s.db.Exec(`INSERT INTO menu_orders (id, business_id, item_id, item_title, variant_title, price, currency, customer_name, phone, email, when_kind, fulfill_at, note, status, created_at, address, lines) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'new',?,?,?)`,
		id, b.ID, firstID, clip(summary, 80), "", total, currency, name, phone, email, when, fulfill, note, now, address, string(payload)); err != nil {
		return nil, err
	}
	whenText := "هرچه زودتر"
	if when == "later" {
		whenText = fulfill
	}
	s.notify(s.db, s.memberIDs(s.db, b.ID), b.ID, id, "menu_order", "سفارش جدید منو", name+" · "+clip(summary, 80)+" · "+whenText)
	return map[string]any{"id": id}, nil
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
	ID, Title, Currency string
	Price               int
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
		if block.Type != "menu" || (block.Active != nil && !*block.Active) {
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
			return menuHit{ID: item.ID, Title: item.Title, Price: price, Currency: currency}, label, nil
		}
	}
	return menuHit{}, "", fail(404, "NOT_FOUND", "این مورد در منو نیست")
}
