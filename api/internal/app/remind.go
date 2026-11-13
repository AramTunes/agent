package app

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"agent/internal/booking"
)

func (s *Service) RunReminders() {
	s.RemindDue()
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		s.RemindDue()
	}
}

func (s *Service) RemindDue() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.remindDueLocked()
}

func (s *Service) remindDueLocked() {
	now := s.now()
	rows, err := s.db.Query(`
		SELECT b.id, b.starts_at, COALESCE(c.phone, ''), s.name, st.name, biz.name, biz.timezone, biz.remind_hours
		FROM bookings b
		JOIN services s ON s.id = b.service_id
		JOIN staff st ON st.id = b.staff_id
		JOIN businesses biz ON biz.id = b.business_id
		LEFT JOIN customers c ON c.id = b.customer_id
		WHERE b.status IN ('confirmed','pending') AND b.reminded_at = ''
		ORDER BY b.starts_at
		LIMIT 100`)
	if err != nil {
		return
	}
	type due struct {
		id, phone, service, staff, business, text string
	}
	var ready []due
	for rows.Next() {
		var id, starts, phone, service, staff, business, zone string
		var hours int
		if err := rows.Scan(&id, &starts, &phone, &service, &staff, &business, &zone, &hours); err != nil {
			rows.Close()
			return
		}
		if hours <= 0 {
			continue
		}
		start, err := time.Parse(time.RFC3339Nano, starts)
		if err != nil {
			continue
		}
		if !start.After(now) || start.After(now.Add(time.Duration(hours)*time.Hour)) {
			continue
		}
		ready = append(ready, due{id: id, phone: phone, service: service, staff: staff, business: business, text: reminderText(start, zone, business, service, staff)})
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return
	}
	rows.Close()
	stamp := now.UTC().Format(time.RFC3339)
	for _, item := range ready {
		status, last := "skipped", "no_phone"
		if strings.TrimSpace(item.phone) != "" {
			status, last = deliverSMS(item.phone, item.text)
		}
		payload, _ := json.Marshal(map[string]string{"to": item.phone, "text": item.text, "bookingId": item.id})
		_, _ = s.db.Exec(`INSERT INTO notification_jobs (id, channel, payload, status, last_error, created_at) VALUES (?,?,?,?,?,?)`,
			newID(), "sms", string(payload), status, last, stamp)
		_, _ = s.db.Exec(`UPDATE bookings SET reminded_at = ? WHERE id = ? AND reminded_at = ''`, stamp, item.id)
	}
}

func reminderText(start time.Time, zone, business, service, staff string) string {
	loc := mustZone(zone)
	civil := booking.CivilInZone(start, loc)
	return "یادآوری نوبت " + business + ": " + service + " با " + staff + "، ساعت " + two(civil.Hour) + ":" + two(civil.Minute)
}

func two(n int) string {
	if n < 10 {
		return "0" + itoa(n)
	}
	return itoa(n)
}

func deliverSMS(phone, text string) (string, string) {
	endpoint := strings.TrimSpace(os.Getenv("SMS_URL"))
	if endpoint == "" {
		return "pending", "no_provider"
	}
	body, _ := json.Marshal(map[string]string{"to": phone, "text": text})
	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return "pending", "send_failed"
	}
	req.Header.Set("Content-Type", "application/json")
	if token := strings.TrimSpace(os.Getenv("SMS_TOKEN")); token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	res, err := (&http.Client{Timeout: 8 * time.Second}).Do(req)
	if err != nil {
		return "pending", "send_failed"
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return "pending", "send_failed"
	}
	return "sent", ""
}
