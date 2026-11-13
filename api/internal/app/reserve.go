package app

import (
	"database/sql"
	"time"

	"agent/internal/booking"
)

type slotStaff struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (s *Service) calendars(q querier, b bizRow, serviceID, day string, onlyStaff, ignoreBooking *string) ([]struct {
	ID, Name string
	Cal      booking.StaffCalendar
}, error) {
	loc := mustZone(b.Timezone)
	weekday := booking.WeekdayOfYMD(day, loc)
	dayStart := booking.ISO(booking.AtLocalMinute(day, 0, loc))
	dayEnd := booking.ISO(booking.AtLocalMinute(day, 1440, loc))
	only := ""
	if onlyStaff != nil {
		only = *onlyStaff
	}
	ignore := ""
	if ignoreBooking != nil {
		ignore = *ignoreBooking
	}
	rows, err := q.Query(`
		SELECT s.id, s.name FROM staff s
		JOIN staff_services ss ON ss.staff_id = s.id AND ss.service_id = ?
		WHERE s.business_id = ? AND s.active = 1 AND (? = '' OR s.id = ?)
		ORDER BY s.id`, serviceID, b.ID, only, only)
	if err != nil {
		return nil, err
	}
	type member struct{ id, name string }
	var staff []member
	for rows.Next() {
		var m member
		if err := rows.Scan(&m.id, &m.name); err != nil {
			rows.Close()
			return nil, err
		}
		staff = append(staff, m)
	}
	rows.Close()
	if len(staff) == 0 {
		return nil, nil
	}
	hours := map[string][]booking.Span{}
	hrows, err := q.Query(`SELECT staff_id, start_min, end_min FROM working_hours WHERE weekday = ? AND staff_id IN (SELECT id FROM staff WHERE business_id = ?)`, weekday, b.ID)
	if err != nil {
		return nil, err
	}
	for hrows.Next() {
		var id string
		var a, z int
		_ = hrows.Scan(&id, &a, &z)
		hours[id] = append(hours[id], booking.Span{Start: a, End: z})
	}
	hrows.Close()
	breaks := map[string][]booking.Span{}
	brows, err := q.Query(`SELECT staff_id, start_min, end_min FROM breaks WHERE weekday = ? AND staff_id IN (SELECT id FROM staff WHERE business_id = ?)`, weekday, b.ID)
	if err != nil {
		return nil, err
	}
	for brows.Next() {
		var id string
		var a, z int
		_ = brows.Scan(&id, &a, &z)
		breaks[id] = append(breaks[id], booking.Span{Start: a, End: z})
	}
	brows.Close()
	hlist, err := q.Query(`SELECT staff_id FROM holidays WHERE business_id = ? AND date_local = ?`, b.ID, day)
	if err != nil {
		return nil, err
	}
	businessHoliday := false
	off := map[string]bool{}
	for hlist.Next() {
		var id sql.NullString
		_ = hlist.Scan(&id)
		if !id.Valid || id.String == "" {
			businessHoliday = true
		} else {
			off[id.String] = true
		}
	}
	hlist.Close()
	busy := map[string][]booking.BusyInterval{}
	urows, err := q.Query(`
		SELECT staff_id, starts_at, buffer_until FROM bookings
		WHERE business_id = ? AND status IN ('confirmed','pending') AND starts_at < ? AND buffer_until > ? AND (? = '' OR id <> ?)`,
		b.ID, dayEnd, dayStart, ignore, ignore)
	if err != nil {
		return nil, err
	}
	for urows.Next() {
		var id, a, z string
		_ = urows.Scan(&id, &a, &z)
		as, _ := time.Parse(time.RFC3339Nano, a)
		zs, _ := time.Parse(time.RFC3339Nano, z)
		busy[id] = append(busy[id], booking.BusyInterval{StartsAt: as, BufferUntil: zs})
	}
	urows.Close()
	out := make([]struct {
		ID, Name string
		Cal      booking.StaffCalendar
	}, 0, len(staff))
	for _, m := range staff {
		windows := hours[m.id]
		if windows == nil {
			windows = []booking.Span{}
		}
		rest := breaks[m.id]
		if rest == nil {
			rest = []booking.Span{}
		}
		work := busy[m.id]
		if work == nil {
			work = []booking.BusyInterval{}
		}
		out = append(out, struct {
			ID, Name string
			Cal      booking.StaffCalendar
		}{ID: m.id, Name: m.name, Cal: booking.StaffCalendar{
			StaffID: m.id, Holiday: businessHoliday || off[m.id], Windows: windows, Breaks: rest, Busy: work,
		}})
	}
	return out, nil
}

func (s *Service) Availability(raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, _ := textOf(raw, "businessId", 80, "")
	serviceID, _ := textOf(raw, "serviceId", 80, "")
	staffID, _ := textOf(raw, "staffId", 80, "")
	except, _ := textOf(raw, "exceptBookingId", 80, "")
	day, err := dayOf(raw["day"])
	if err != nil {
		return nil, err
	}
	b, err := loadBiz(s.db, "id = ?", businessID)
	if err != nil {
		return nil, err
	}
	if b.Status != "active" {
		return nil, fail(404, "NOT_FOUND", "رزرو این کسب‌وکار ممکن نیست")
	}
	var dur, buf, active int
	err = s.db.QueryRow(`SELECT duration_minutes, buffer_minutes, active FROM services WHERE id = ? AND business_id = ?`, serviceID, b.ID).Scan(&dur, &buf, &active)
	if err != nil || active == 0 {
		return nil, fail(404, "NOT_FOUND", "خدمت پیدا نشد")
	}
	var only *string
	if staffID != "" {
		only = &staffID
	}
	var ignore *string
	if except != "" {
		ignore = &except
	}
	rows, err := s.calendars(s.db, b, serviceID, day, only, ignore)
	if err != nil {
		return nil, err
	}
	cals := make([]booking.StaffCalendar, 0, len(rows))
	names := map[string]string{}
	for _, row := range rows {
		cals = append(cals, row.Cal)
		names[row.ID] = row.Name
	}
	loc := mustZone(b.Timezone)
	slots := booking.DayAvailability(day, loc, s.now(), dur, buf, b.Step, b.MinLead, b.Horizon, cals)
	open := map[string][]slotStaff{}
	for _, slot := range slots {
		people := make([]slotStaff, 0, len(slot.StaffIDs))
		for _, id := range slot.StaffIDs {
			people = append(people, slotStaff{ID: id, Name: names[id]})
		}
		open[booking.ISO(slot.Start)] = people
	}
	cleared := make([]booking.StaffCalendar, len(cals))
	for i, cal := range cals {
		cal.Busy = nil
		cleared[i] = cal
	}
	all := booking.DayAvailability(day, loc, s.now(), dur, buf, b.Step, b.MinLead, b.Horizon, cleared)
	out := []map[string]any{}
	for _, slot := range all {
		start := booking.ISO(slot.Start)
		people, free := open[start]
		if !free {
			people = make([]slotStaff, 0, len(slot.StaffIDs))
			for _, id := range slot.StaffIDs {
				people = append(people, slotStaff{ID: id, Name: names[id]})
			}
		}
		out = append(out, map[string]any{"start": start, "staff": people, "taken": !free})
	}
	return map[string]any{"timezone": b.Timezone, "slots": out}, nil
}

const bookingSelect = `
SELECT b.id, b.business_id, b.service_id, b.staff_id, b.customer_id, b.customer_user_id, b.created_by_user_id,
       b.starts_at, b.ends_at, b.status, b.source, b.note, b.cancel_reason,
       s.name, st.name, biz.name, biz.slug, biz.timezone, biz.avatar,
       COALESCE(NULLIF(c.name, ''), b.customer_name, ''), COALESCE(NULLIF(c.phone, ''), b.customer_phone, ''), COALESCE(c.email, ''), COALESCE(c.customer_note, ''),
       s.price_toman, s.duration_minutes
FROM bookings b
JOIN services s ON s.id = b.service_id
JOIN staff st ON st.id = b.staff_id
JOIN businesses biz ON biz.id = b.business_id
LEFT JOIN customers c ON c.id = b.customer_id`

type bookRow struct {
	ID, BusinessID, ServiceID, StaffID, CustomerID, CreatedBy, Starts, Ends, Status, Source, Note, Reason string
	CustomerUser                                                                                          sql.NullString
	ServiceName, StaffName, BizName, Slug, Timezone, Avatar, CustName, CustPhone, CustEmail, CustomerNote string
	Price, Duration                                                                                       int
}

func scanBook(row interface{ Scan(...any) error }) (bookRow, error) {
	var b bookRow
	err := row.Scan(&b.ID, &b.BusinessID, &b.ServiceID, &b.StaffID, &b.CustomerID, &b.CustomerUser, &b.CreatedBy,
		&b.Starts, &b.Ends, &b.Status, &b.Source, &b.Note, &b.Reason,
		&b.ServiceName, &b.StaffName, &b.BizName, &b.Slug, &b.Timezone, &b.Avatar, &b.CustName, &b.CustPhone, &b.CustEmail, &b.CustomerNote, &b.Price, &b.Duration)
	return b, err
}

func bookDTO(b bookRow, reveal bool) map[string]any {
	name, phone, email := "", "", ""
	if reveal {
		name, phone, email = b.CustName, b.CustPhone, b.CustEmail
	}
	return map[string]any{
		"id": b.ID, "businessId": b.BusinessID, "businessName": b.BizName, "businessSlug": b.Slug, "timezone": b.Timezone, "avatar": b.Avatar,
		"serviceId": b.ServiceID, "serviceName": b.ServiceName, "staffId": b.StaffID, "staffName": b.StaffName,
		"startsAt": b.Starts, "endsAt": b.Ends, "status": b.Status, "source": b.Source, "note": b.Note, "cancelReason": b.Reason,
		"priceToman": b.Price, "durationMinutes": b.Duration, "customerName": name, "customerPhone": phone, "customerEmail": email, "customerNote": b.CustomerNote, "mine": true,
	}
}

func (s *Service) loadBooking(q querier, id string) (bookRow, error) {
	b, err := scanBook(q.QueryRow(bookingSelect+` WHERE b.id = ?`, id))
	if err == sql.ErrNoRows {
		return b, fail(404, "NOT_FOUND", "نوبت پیدا نشد")
	}
	return b, err
}

func (s *Service) notify(q querier, userIDs []string, businessID, bookingID, kind, title, body string) {
	seen := map[string]bool{}
	now := s.now().UTC().Format(time.RFC3339)
	for _, id := range userIDs {
		if id == "" || seen[id] {
			continue
		}
		seen[id] = true
		_, _ = q.Exec(`INSERT INTO notifications (id, user_id, business_id, booking_id, kind, title, body, channel, status, created_at) VALUES (?,?,?,?,?,?,?,'in_app','recorded',?)`,
			newID(), id, businessID, bookingID, kind, title, body, now)
	}
}

func (s *Service) memberIDs(q querier, businessID string) []string {
	rows, err := q.Query(`SELECT user_id FROM memberships WHERE business_id = ? AND role IN ('owner','manager')`, businessID)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var ids []string
	for rows.Next() {
		var id string
		_ = rows.Scan(&id)
		ids = append(ids, id)
	}
	return ids
}

func (s *Service) customerOnline(q querier, businessID, userID string) (string, error) {
	var name, email string
	_ = q.QueryRow(`SELECT name, email FROM users WHERE id = ?`, userID).Scan(&name, &email)
	_, _ = q.Exec(`INSERT INTO profiles (user_id, display_name, created_at) VALUES (?,?,?) ON CONFLICT(user_id) DO NOTHING`, userID, clip(name, 80), s.now().UTC().Format(time.RFC3339))
	var display, phone string
	_ = q.QueryRow(`SELECT display_name, phone FROM profiles WHERE user_id = ?`, userID).Scan(&display, &phone)
	if display == "" {
		display = "مشتری"
	}
	var id, linkedUser string
	err := q.QueryRow(`SELECT id, COALESCE(user_id, '') FROM customers WHERE business_id = ? AND user_id = ?`, businessID, userID).Scan(&id, &linkedUser)
	if err == nil {
		_, err = q.Exec(`UPDATE customers SET name = ?, phone = ? WHERE id = ?`, display, phone, id)
		return id, err
	}
	if phone != "" {
		var found, foundUser string
		err = q.QueryRow(`SELECT id, COALESCE(user_id, '') FROM customers WHERE business_id = ? AND phone = ? ORDER BY created_at LIMIT 1`, businessID, phone).Scan(&found, &foundUser)
		if err == nil && (foundUser == "" || foundUser == userID) {
			_, err = q.Exec(`UPDATE customers SET user_id = ?, name = ?, phone = ? WHERE id = ?`, userID, display, phone, found)
			return found, err
		}
	}
	id = newID()
	_, err = q.Exec(`INSERT INTO customers (id, business_id, user_id, name, phone, created_at) VALUES (?,?,?,?,?,?)`,
		id, businessID, userID, display, phone, s.now().UTC().Format(time.RFC3339))
	return id, err
}

func (s *Service) customerManual(q querier, businessID, name, phone string) (string, error) {
	if phone != "" {
		if normalized, nerr := normalizePhone(phone); nerr == nil {
			phone = normalized
		}
		var id string
		err := q.QueryRow(`SELECT id FROM customers WHERE business_id = ? AND phone = ? ORDER BY created_at LIMIT 1`, businessID, phone).Scan(&id)
		if err == nil {
			_, err = q.Exec(`UPDATE customers SET name = ? WHERE id = ?`, name, id)
			return id, err
		}
	} else {
		var id string
		err := q.QueryRow(`SELECT id FROM customers WHERE business_id = ? AND phone = '' AND name = ? AND user_id IS NULL ORDER BY created_at DESC LIMIT 1`, businessID, name).Scan(&id)
		if err == nil {
			return id, nil
		}
	}
	id := newID()
	_, err := q.Exec(`INSERT INTO customers (id, business_id, name, phone, created_at) VALUES (?,?,?,?,?)`,
		id, businessID, name, phone, s.now().UTC().Format(time.RFC3339))
	return id, err
}

func (s *Service) MyBookings(userID string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	rows, err := s.db.Query(bookingSelect+` WHERE b.customer_user_id = ? ORDER BY b.starts_at DESC LIMIT 100`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		b, err := scanBook(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, bookDTO(b, true))
	}
	return out, rows.Err()
}

func (s *Service) BusinessBookings(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, _ := textOf(raw, "businessId", 80, "")
	status, _ := textOf(raw, "status", 20, "")
	day, _ := textOf(raw, "day", 10, "")
	role, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff")
	if err != nil {
		return nil, err
	}
	ownStaff := ""
	if role == "staff" {
		ownStaff, err = s.ownStaffID(s.db, userID, businessID)
		if err != nil {
			return nil, err
		}
	}
	b, err := loadBiz(s.db, "id = ?", businessID)
	if err != nil {
		return nil, err
	}
	from, to := "1970-01-01T00:00:00.000Z", "2999-01-01T00:00:00.000Z"
	fromDay, _ := textOf(raw, "from", 10, "")
	toDay, _ := textOf(raw, "to", 10, "")
	if day != "" || (fromDay != "" && toDay != "") {
		var startDay, endDay string
		if day != "" {
			startDay, err = dayOf(day)
			if err != nil {
				return nil, err
			}
			endDay = startDay
		} else {
			startDay, err = dayOf(fromDay)
			if err != nil {
				return nil, err
			}
			endDay, err = dayOf(toDay)
			if err != nil {
				return nil, err
			}
		}
		loc := mustZone(b.Timezone)
		from = booking.ISO(booking.AtLocalMinute(startDay, 0, loc))
		to = booking.ISO(booking.AtLocalMinute(endDay, 1440, loc))
	}
	rows, err := s.db.Query(bookingSelect+` WHERE b.business_id = ? AND (? = '' OR b.status = ?) AND b.starts_at >= ? AND b.starts_at < ? AND (? = '' OR b.staff_id = ?) ORDER BY b.starts_at LIMIT 200`,
		businessID, status, status, from, to, ownStaff, ownStaff)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		row, err := scanBook(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, bookDTO(row, true))
	}
	return out, rows.Err()
}
