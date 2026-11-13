package app

import (
	"encoding/json"
	"regexp"
	"strings"
	"time"
)

var receiptTokenRe = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)

func safeOrigin(value string) string {
	origin := strings.TrimRight(strings.TrimSpace(value), "/")
	if strings.HasPrefix(origin, "https://") || strings.HasPrefix(origin, "http://") {
		return origin
	}
	return ""
}

func receiptLink(origin, token string) string {
	if origin == "" || token == "" {
		return ""
	}
	return origin + "/r/" + token
}

func customerReceiptText(kind, link string) string {
	word := "درخواستتون"
	if kind == "order" {
		word = "سفارشتون"
	}
	if kind == "booking" {
		word = "نوبتتون"
	}
	text := word + " ثبت شد. جزئیاتش رو می‌تونید از لینک زیر ببینید."
	if link != "" {
		text += "\n" + link
	}
	return text
}

func (s *Service) queueSMS(phone, text string, ref string) {
	status, last := "skipped", "no_phone"
	if strings.TrimSpace(phone) != "" {
		status, last = deliverSMS(phone, text)
	}
	payload, _ := json.Marshal(map[string]string{"to": phone, "text": text, "ref": ref})
	_, _ = s.db.Exec(`INSERT INTO notification_jobs (id, channel, payload, status, last_error, created_at) VALUES (?,?,?,?,?,?)`,
		newID(), "sms", string(payload), status, last, s.now().UTC().Format(time.RFC3339))
}

func (s *Service) sendBookingReceipt(out map[string]any, origin string) {
	if out == nil {
		return
	}
	token, _ := out["receiptToken"].(string)
	phone, _ := out["customerPhone"].(string)
	id, _ := out["id"].(string)
	if !smsReady() {
		return
	}
	s.queueSMS(phone, customerReceiptText("booking", receiptLink(origin, token)), id)
}

func (s *Service) attachReceipt(out map[string]any, id string) {
	var token string
	_ = s.db.QueryRow(`SELECT receipt_token FROM bookings WHERE id = ?`, id).Scan(&token)
	if token != "" {
		out["receiptToken"] = token
	}
}

func (s *Service) Receipt(token string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	token = strings.TrimSpace(token)
	if !receiptTokenRe.MatchString(token) || !s.rate("receipt:"+token, 40, time.Hour) {
		return nil, fail(404, "NOT_FOUND", "این لینک پیدا نشد")
	}
	if order, ok, err := s.orderReceipt(token); err != nil || ok {
		return order, err
	}
	if visit, ok, err := s.bookingReceipt(token); err != nil || ok {
		return visit, err
	}
	return nil, fail(404, "NOT_FOUND", "این لینک پیدا نشد")
}

func (s *Service) orderReceipt(token string) (any, bool, error) {
	var business, name, phone, address, note, status, whenKind, fulfill, created, currency, lines string
	var price, priced int
	err := s.db.QueryRow(`
		SELECT b.name, o.customer_name, o.phone, o.address, o.note, o.status, o.when_kind, o.fulfill_at, o.created_at, o.price, o.currency, o.priced, o.lines
		FROM menu_orders o JOIN businesses b ON b.id = o.business_id
		WHERE o.receipt_token = ?`, token).Scan(&business, &name, &phone, &address, &note, &status, &whenKind, &fulfill, &created, &price, &currency, &priced, &lines)
	if err != nil {
		return nil, false, nil
	}
	var parsed []map[string]any
	_ = json.Unmarshal([]byte(lines), &parsed)
	items := []map[string]any{}
	for _, line := range parsed {
		title, _ := line["title"].(string)
		variant, _ := line["variant"].(string)
		qty := 1
		priceTo := 0
		switch n := line["qty"].(type) {
		case float64:
			qty = int(n)
		}
		switch n := line["priceTo"].(type) {
		case float64:
			priceTo = int(n)
		}
		items = append(items, map[string]any{
			"title": title, "variant": variant, "qty": qty,
			"priceType": line["priceType"], "price": line["price"], "priceTo": priceTo,
		})
	}
	when := "هرچه زودتر"
	if whenKind == "later" && fulfill != "" {
		when = fulfill
	}
	return map[string]any{
		"kind": "order", "word": "سفارش", "business": business, "name": name, "phone": phone,
		"address": address, "note": note, "status": status, "when": when,
		"createdAt": created, "price": price, "currency": currency, "priced": priced != 0, "lines": items,
	}, true, nil
}

func (s *Service) bookingReceipt(token string) (any, bool, error) {
	var service, staff, business, address, bizPhone, zone, name, phone, note, customerNote, status, starts, reason string
	var price, duration int
	err := s.db.QueryRow(`
		SELECT s.name, st.name, biz.name, biz.address, biz.phone, biz.timezone,
		       COALESCE(NULLIF(c.name, ''), b.customer_name, ''), COALESCE(NULLIF(c.phone, ''), b.customer_phone, ''),
		       b.note, COALESCE(c.customer_note, ''), b.status, b.starts_at, b.cancel_reason, COALESCE(b.price_toman, s.price_toman), s.duration_minutes
		FROM bookings b
		JOIN services s ON s.id = b.service_id
		JOIN staff st ON st.id = b.staff_id
		JOIN businesses biz ON biz.id = b.business_id
		LEFT JOIN customers c ON c.id = b.customer_id
		WHERE b.receipt_token = ?`, token).Scan(&service, &staff, &business, &address, &bizPhone, &zone, &name, &phone, &note, &customerNote, &status, &starts, &reason, &price, &duration)
	if err != nil {
		return nil, false, nil
	}
	return map[string]any{
		"kind": "booking", "word": "نوبت", "business": business, "businessAddress": address, "businessPhone": bizPhone,
		"timezone": zone, "name": name, "phone": phone, "note": note, "customerNote": customerNote,
		"status": status, "cancelReason": reason, "startsAt": starts, "service": service, "staff": staff,
		"price": price, "durationMinutes": duration,
	}, true, nil
}
