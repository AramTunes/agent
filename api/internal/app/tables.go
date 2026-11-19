package app

import (
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"agent/internal/booking"
)

func diningCategory(id string) bool {
	switch id {
	case "cat-restaurant", "cat-cafe", "cat-fastfood":
		return true
	default:
		return false
	}
}

func tableNumber(raw string) (string, error) {
	var b strings.Builder
	for _, r := range latinDigits(strings.TrimSpace(raw)) {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	if b.Len() == 0 || b.Len() > 4 {
		return "", fail(400, "VALIDATION", "شماره میز را درست وارد کنید")
	}
	n, err := strconv.Atoi(b.String())
	if err != nil || n < 1 || n > 9999 {
		return "", fail(400, "VALIDATION", "شماره میز را درست وارد کنید")
	}
	return strconv.Itoa(n), nil
}

func (s *Service) SaveDiningTable(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner"); err != nil {
		return nil, err
	}
	b, err := loadBiz(s.db, "id = ?", businessID)
	if err != nil {
		return nil, err
	}
	if !b.CategoryID.Valid || !diningCategory(b.CategoryID.String) {
		return nil, fail(400, "VALIDATION", "رزرو میز فقط برای کافه، رستوران و فست‌فود است")
	}
	number, err := tableNumber(mustString(raw, "number"))
	if err != nil {
		return nil, err
	}
	id := newID()
	now := s.now().UTC().Format(time.RFC3339)
	if _, err := s.db.Exec(`INSERT INTO dining_tables (id, business_id, number, active, created_at) VALUES (?,?,?,1,?)`, id, businessID, number, now); err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			return nil, fail(409, "CONFLICT", "این شماره میز هست")
		}
		return nil, err
	}
	_ = s.audit(s.db, userID, "table_save", "dining_table", strPtr(id), strPtr(businessID), number)
	return map[string]any{"id": id, "number": number}, nil
}

func (s *Service) DeleteDiningTable(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	tableID, err := textOf(raw, "id", 80, "")
	if err != nil {
		return nil, err
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner"); err != nil {
		return nil, err
	}
	var held int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM table_reservations WHERE table_id = ? AND business_id = ? AND status = 'held'`, tableID, businessID).Scan(&held); err != nil {
		return nil, err
	}
	if held > 0 {
		return nil, fail(409, "CONFLICT", "اول این میز را آزاد کنید")
	}
	res, err := s.db.Exec(`DELETE FROM dining_tables WHERE id = ? AND business_id = ?`, tableID, businessID)
	if err != nil {
		return nil, err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return nil, fail(404, "NOT_FOUND", "میز پیدا نشد")
	}
	_ = s.audit(s.db, userID, "table_delete", "dining_table", strPtr(tableID), strPtr(businessID), "")
	return map[string]any{"id": tableID}, nil
}

func (s *Service) ListDiningTables(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff"); err != nil {
		return nil, err
	}
	return s.diningTables(s.db, businessID), nil
}

func (s *Service) diningTables(q querier, businessID string) []map[string]any {
	rows, err := q.Query(`SELECT t.id, t.number, EXISTS(SELECT 1 FROM table_reservations r WHERE r.table_id = t.id AND r.status = 'held')
		FROM dining_tables t WHERE t.business_id = ? AND t.active = 1 ORDER BY CAST(t.number AS INTEGER), t.number`, businessID)
	if err != nil {
		return []map[string]any{}
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, number string
		var held int
		if rows.Scan(&id, &number, &held) != nil {
			continue
		}
		out = append(out, map[string]any{"id": id, "number": number, "held": held == 1})
	}
	return out
}

func (s *Service) PublicDining(slug string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	b, err := loadBiz(s.db, "slug = ?", clip(slug, 80))
	if err != nil {
		return nil, err
	}
	if b.Status != "active" || !b.CategoryID.Valid || !diningCategory(b.CategoryID.String) {
		return nil, fail(404, "NOT_FOUND", "این صفحه رزرو میز ندارد")
	}
	free := []map[string]any{}
	for _, table := range s.diningTables(s.db, b.ID) {
		if held, _ := table["held"].(bool); held {
			continue
		}
		free = append(free, map[string]any{"id": table["id"], "number": table["number"]})
	}
	return map[string]any{
		"name": b.Name, "timezone": b.Timezone,
		"hours": s.shopHours(s.db, b.ID), "tables": free,
	}, nil
}

func (s *Service) ReserveTable(raw map[string]any) (any, error) {
	unlock := s.lock()
	defer unlock()
	slug := strings.TrimSpace(mustString(raw, "slug"))
	if slug == "" || !s.rate("table:"+slug, 40, time.Hour) {
		if slug == "" {
			return nil, fail(400, "VALIDATION", "صفحه مشخص نیست")
		}
		return nil, fail(429, "RATE", "چند لحظه بعد دوباره تلاش کنید")
	}
	b, err := loadBiz(s.db, "slug = ?", slug)
	if err != nil {
		return nil, err
	}
	if b.Status != "active" || !b.CategoryID.Valid || !diningCategory(b.CategoryID.String) {
		return nil, fail(404, "NOT_FOUND", "این صفحه رزرو میز ندارد")
	}
	if err := s.commerceOpen(s.db, b.ID); err != nil {
		return nil, err
	}
	name := clip(strings.ReplaceAll(strings.TrimSpace(mustString(raw, "name")), "\n", " "), 80)
	if utf8.RuneCountInString(name) < 2 {
		return nil, fail(400, "VALIDATION", "نام و نام خانوادگی را وارد کنید")
	}
	phone, err := normalizePhone(mustString(raw, "phone"))
	if err != nil {
		return nil, err
	}
	if !s.rate("table-phone:"+phone, 8, time.Hour) {
		return nil, fail(429, "RATE", "چند لحظه بعد دوباره تلاش کنید")
	}
	tableID, err := textOf(raw, "tableId", 80, "")
	if err != nil {
		return nil, err
	}
	var number string
	if err := s.db.QueryRow(`SELECT number FROM dining_tables WHERE id = ? AND business_id = ? AND active = 1`, tableID, b.ID).Scan(&number); err != nil {
		return nil, fail(400, "VALIDATION", "میز را انتخاب کنید")
	}
	var held int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM table_reservations WHERE table_id = ? AND status = 'held'`, tableID).Scan(&held); err != nil {
		return nil, err
	}
	if held > 0 {
		return nil, fail(409, "CONFLICT", "این میز هنوز آزاد نشده")
	}
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
	horizon := 30
	_ = s.db.QueryRow(`SELECT max_horizon_days FROM businesses WHERE id = ?`, b.ID).Scan(&horizon)
	if horizon <= 0 {
		horizon = 30
	}
	if day > booking.AddDaysYMD(today, horizon, loc) {
		return nil, fail(400, "VALIDATION", "این تاریخ خیلی دور است")
	}
	if err := s.checkDelivery(b.ID, day, clock, loc); err != nil {
		return nil, err
	}
	note := clip(strings.TrimSpace(mustString(raw, "note")), 200)
	if _, err := s.customerManual(s.db, b.ID, name, phone); err != nil {
		return nil, err
	}
	id := newID()
	now := s.now().UTC().Format(time.RFC3339)
	starts := day + " " + clock
	if _, err := s.db.Exec(`INSERT INTO table_reservations (id, business_id, table_id, table_number, customer_name, phone, starts_at, note, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,'held',?,?)`,
		id, b.ID, tableID, number, name, phone, starts, note, now, now); err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			return nil, fail(409, "CONFLICT", "این میز هنوز آزاد نشده")
		}
		return nil, err
	}
	body := name + "\nتلفن: " + phone + "\nمیز " + number + "\n" + fulfillLabel(starts)
	if note != "" {
		body += "\nیادداشت: " + note
	}
	s.notify(s.db, s.orderWatchers(s.db, b.ID), b.ID, id, "table_reservation", "رزرو میز", body)
	bizID, bizName, zone := b.ID, b.Name, b.Timezone
	unlock()
	date, clock := smsWhen(starts, zone)
	s.sendCustomerSMS(bizID, phone, "table", map[string]string{
		"token":   faDigits(number),
		"token20": cleanToken(bizName, 8, 18),
		"token2":  date,
		"token3":  clock,
	})
	s.mu.Lock()
	_ = s.audit(s.db, "", "table_reserve", "table_reservation", strPtr(id), strPtr(bizID), number)
	s.mu.Unlock()
	return map[string]any{"id": id, "number": number, "startsAt": starts}, nil
}

func (s *Service) ListTableReservations(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff"); err != nil {
		return nil, err
	}
	return s.tableReservations(s.db, businessID, ""), nil
}

func (s *Service) tableReservations(q querier, businessID, only string) []map[string]any {
	query := `SELECT id, table_number, customer_name, phone, starts_at, note, status, cancel_reason, created_at
		FROM table_reservations WHERE business_id = ?`
	args := []any{businessID}
	if only != "" {
		query += ` AND status = ?`
		args = append(args, only)
	}
	query += ` ORDER BY CASE status WHEN 'held' THEN 0 ELSE 1 END, starts_at DESC LIMIT 100`
	rows, err := q.Query(query, args...)
	if err != nil {
		return []map[string]any{}
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, number, customer, phone, starts, note, status, reason, created string
		if rows.Scan(&id, &number, &customer, &phone, &starts, &note, &status, &reason, &created) != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "number": number, "customer": customer, "phone": phone,
			"startsAt": starts, "note": note, "status": status, "cancelReason": reason, "createdAt": created,
		})
	}
	return out
}

func (s *Service) heldTables(businessID string) []map[string]any {
	return s.tableReservations(s.db, businessID, "held")
}

func (s *Service) ReleaseTable(userID string, raw map[string]any) (any, error) {
	return s.finishTable(userID, raw, "released", "")
}

func (s *Service) CancelTable(userID string, raw map[string]any) (any, error) {
	reason, _ := textOf(raw, "reason", 200, "")
	reason = strings.TrimSpace(reason)
	if utf8.RuneCountInString(reason) < 2 {
		return nil, fail(400, "VALIDATION", "دلیل لغو را بنویسید")
	}
	return s.finishTable(userID, raw, "cancelled", reason)
}

func (s *Service) finishTable(userID string, raw map[string]any, status, reason string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	id, err := textOf(raw, "id", 80, "")
	if err != nil {
		return nil, err
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff"); err != nil {
		return nil, err
	}
	now := s.now().UTC().Format(time.RFC3339)
	res, err := s.db.Exec(`UPDATE table_reservations SET status = ?, cancel_reason = ?, updated_at = ? WHERE id = ? AND business_id = ? AND status = 'held'`, status, reason, now, id, businessID)
	if err != nil {
		return nil, err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return nil, fail(409, "POLICY", "این رزرو قبلاً بسته شده")
	}
	action := "table_release"
	if status == "cancelled" {
		action = "table_cancel"
	}
	_ = s.audit(s.db, userID, action, "table_reservation", strPtr(id), strPtr(businessID), status)
	return map[string]any{"id": id, "status": status}, nil
}
