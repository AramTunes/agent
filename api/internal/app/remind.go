package app

import (
	"time"
)

func (s *Service) RunReminders() {
	s.RemindDue()
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		s.RemindDue()
	}
}

type dueReminder struct {
	id, businessID, phone, service, business, zone string
	start                                          time.Time
}

func (s *Service) RemindDue() {
	s.mu.Lock()
	ready := s.dueReminders()
	s.mu.Unlock()
	stamp := s.now().UTC().Format(time.RFC3339)
	for _, item := range ready {
		date, clock := smsWhen(item.start.UTC().Format(time.RFC3339), item.zone)
		if !s.sendCustomerSMS(item.businessID, item.phone, "remind", map[string]string{
			"token10": cleanToken(item.service, 5, 12),
			"token20": cleanToken(item.business, 8, 18),
			"token2":  date,
			"token3":  clock,
		}) {
			continue
		}
		s.mu.Lock()
		_, _ = s.db.Exec(`UPDATE bookings SET reminded_at = ? WHERE id = ? AND reminded_at = ''`, stamp, item.id)
		s.mu.Unlock()
	}
}

func (s *Service) dueReminders() []dueReminder {
	now := s.now()
	rows, err := s.db.Query(`
		SELECT b.id, b.business_id, b.starts_at, COALESCE(c.phone, ''), s.name, biz.name, biz.timezone, biz.remind_hours
		FROM bookings b
		JOIN services s ON s.id = b.service_id
		JOIN staff st ON st.id = b.staff_id
		JOIN businesses biz ON biz.id = b.business_id
		LEFT JOIN customers c ON c.id = b.customer_id
		WHERE b.status IN ('confirmed','pending') AND b.reminded_at = ''
		ORDER BY b.starts_at
		LIMIT 100`)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var ready []dueReminder
	for rows.Next() {
		var id, businessID, starts, phone, service, business, zone string
		var hours int
		if err := rows.Scan(&id, &businessID, &starts, &phone, &service, &business, &zone, &hours); err != nil {
			return nil
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
		ready = append(ready, dueReminder{id: id, businessID: businessID, phone: phone, service: service, business: business, zone: zone, start: start})
	}
	if err := rows.Err(); err != nil {
		return nil
	}
	return ready
}
