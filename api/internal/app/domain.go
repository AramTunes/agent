package app

import (
	"database/sql"
	"encoding/json"
	"strings"
	"time"

	"agent/internal/booking"
)

const capacityFormula = "ظرفیت = جمع دقایق ساعت کاری منهای استراحت و روز تعطیل. اشغال‌شده = مدت خدمت به‌علاوه فاصله آماده‌سازی نوبت‌های در انتظار و تأییدشده. نوبت انجام‌شده، لغوشده یا عدم مراجعه ظرفیت را اشغال نمی‌کند. نوبت چندخدمتی در این نسخه محاسبه نمی‌شود."

type querier interface {
	Exec(query string, args ...any) (sql.Result, error)
	Query(query string, args ...any) (*sql.Rows, error)
	QueryRow(query string, args ...any) *sql.Row
}

type bizRow struct {
	ID, Owner, Name, Slug, Description, City, Address, Phone, Timezone, Status, Reason string
	CategoryID                                                                         sql.NullString
	CancelBefore, MinLead, Horizon, Step, RemindHours                                  int
	AllowAny, IsDemo                                                                   bool
	Avatar, PageBlocks                                                                 string
}

func scanBiz(row interface{ Scan(...any) error }) (bizRow, error) {
	var b bizRow
	var allow, demo int
	err := row.Scan(&b.ID, &b.Owner, &b.Name, &b.Slug, &b.Description, &b.CategoryID, &b.City, &b.Address, &b.Phone, &b.Timezone, &b.Status, &b.Reason, &b.CancelBefore, &b.MinLead, &b.Horizon, &b.Step, &allow, &b.IsDemo)
	// last field scanned wrong — IsDemo is bool. Scan into ints then assign.
	_ = demo
	b.AllowAny = allow != 0
	return b, err
}

const bizCols = `id, owner_user_id, name, slug, description, category_id, city, address, phone, timezone, status, status_reason, cancel_before_minutes, min_lead_minutes, max_horizon_days, slot_step_minutes, allow_any_staff, is_demo, avatar, page_blocks, remind_hours`

func loadBiz(q querier, where string, arg any) (bizRow, error) {
	var b bizRow
	var cat sql.NullString
	var allow, demo int
	err := q.QueryRow(`SELECT `+bizCols+` FROM businesses WHERE `+where, arg).Scan(
		&b.ID, &b.Owner, &b.Name, &b.Slug, &b.Description, &cat, &b.City, &b.Address, &b.Phone, &b.Timezone,
		&b.Status, &b.Reason, &b.CancelBefore, &b.MinLead, &b.Horizon, &b.Step, &allow, &demo, &b.Avatar, &b.PageBlocks, &b.RemindHours,
	)
	if err == sql.ErrNoRows {
		return b, fail(404, "NOT_FOUND", "کسب‌وکار پیدا نشد")
	}
	if err != nil {
		return b, err
	}
	b.CategoryID = cat
	b.AllowAny = allow != 0
	b.IsDemo = demo != 0
	return b, nil
}

func pageBlocksValue(raw string) any {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return []any{}
	}
	var value any
	if err := json.Unmarshal([]byte(raw), &value); err != nil {
		return []any{}
	}
	if _, ok := value.([]any); !ok {
		return []any{}
	}
	return value
}

func (s *Service) audit(q querier, actor, action, entity string, entityID, businessID *string, detail string) error {
	_, err := q.Exec(`INSERT INTO audit_logs (id, actor_user_id, business_id, action, entity, entity_id, detail, created_at) VALUES (?,?,?,?,?,?,?,?)`,
		newID(), actor, nullable(businessID), action, entity, nullable(entityID), clip(detail, 300), s.now().UTC().Format(time.RFC3339))
	return err
}

func nullable(p *string) any {
	if p == nil || *p == "" {
		return nil
	}
	return *p
}

func strPtr(s string) *string { return &s }

func (s *Service) roleOf(q querier, userID, businessID string) (string, error) {
	var role string
	err := q.QueryRow(`SELECT role FROM memberships WHERE business_id = ? AND user_id = ?`, businessID, userID).Scan(&role)
	if err == sql.ErrNoRows {
		return "", nil
	}
	return role, err
}

func (s *Service) requireRole(q querier, userID, businessID string, roles ...string) (string, error) {
	role, err := s.roleOf(q, userID, businessID)
	if err != nil {
		return "", err
	}
	for _, want := range roles {
		if role == want {
			return role, nil
		}
	}
	return "", fail(403, "FORBIDDEN", "به این کسب‌وکار دسترسی ندارید")
}

func (s *Service) isAdmin(q querier, userID string) (bool, error) {
	var id string
	err := q.QueryRow(`SELECT user_id FROM platform_admins WHERE user_id = ?`, userID).Scan(&id)
	if err == sql.ErrNoRows {
		return false, nil
	}
	return err == nil, err
}

func (s *Service) requireAdmin(userID string) error {
	ok, err := s.isAdmin(s.db, userID)
	if err != nil {
		return err
	}
	if !ok {
		return fail(403, "FORBIDDEN", "دسترسی مدیر سامانه لازم است")
	}
	return nil
}

func (s *Service) ListCategories() (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	rows, err := s.db.Query(`SELECT id, name, slug FROM categories WHERE active = 1 ORDER BY sort, name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, name, slug string
		if err := rows.Scan(&id, &name, &slug); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{"id": id, "name": name, "slug": slug})
	}
	return out, rows.Err()
}

func (s *Service) ListBusinesses(q, category string, limit, offset int) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if limit < 1 {
		limit = 24
	}
	if limit > 24 {
		limit = 24
	}
	if offset < 0 {
		offset = 0
	}
	if offset > 500 {
		offset = 500
	}
	rows, err := s.db.Query(`
		SELECT b.id, b.name, b.slug, b.city, b.description, c.name, b.is_demo, b.avatar
		FROM businesses b LEFT JOIN categories c ON c.id = b.category_id
		WHERE b.status = 'active'
		  AND (? = '' OR b.name LIKE ? ESCAPE '\' OR b.city LIKE ? ESCAPE '\')
		  AND (? = '' OR b.category_id = ? OR c.slug = ?)
		ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
		q, like(q), like(q), category, category, category, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, name, slug, city, desc, avatar string
		var cat sql.NullString
		var demo int
		if err := rows.Scan(&id, &name, &slug, &city, &desc, &cat, &demo, &avatar); err != nil {
			return nil, err
		}
		var catVal any
		if cat.Valid {
			catVal = cat.String
		}
		items = append(items, map[string]any{
			"id": id, "name": name, "slug": slug, "city": city, "description": desc,
			"category_name": catVal, "is_demo": demo != 0, "avatar": avatar,
		})
	}
	return map[string]any{"items": items, "limit": limit, "offset": offset}, rows.Err()
}

func (s *Service) PublicBusiness(slug, visitor, source, device, country, city string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	slug = clip(slug, 80)
	b, err := loadBiz(s.db, "slug = ?", slug)
	if err != nil {
		if f, ok := err.(*Fail); ok && f.Code == "NOT_FOUND" {
			return nil, fail(404, "NOT_FOUND", "این صفحه در دسترس نیست")
		}
		return nil, err
	}
	if b.Status != "active" {
		return nil, fail(404, "NOT_FOUND", "این صفحه در دسترس نیست")
	}
	s.noteView(b.ID, b.Timezone, visitor, source, device, country, city)
	return s.snapshot(s.db, b, false)
}

func cleanVisitor(visitor string) string {
	visitor = strings.TrimSpace(visitor)
	if len(visitor) < 8 || len(visitor) > 64 {
		return ""
	}
	for _, r := range visitor {
		if (r < 'a' || r > 'z') && (r < 'A' || r > 'Z') && (r < '0' || r > '9') && r != '-' && r != '_' {
			return ""
		}
	}
	return visitor
}

func (s *Service) noteView(businessID, timezone, visitor, source, device, country, city string) {
	day := booking.TodayYMD(mustZone(timezone), s.now())
	extra := 0
	if id := cleanVisitor(visitor); id != "" {
		res, err := s.db.Exec(`INSERT INTO page_view_visitors (business_id, day, visitor) VALUES (?,?,?) ON CONFLICT DO NOTHING`, businessID, day, id)
		if err == nil {
			if n, _ := res.RowsAffected(); n == 1 {
				extra = 1
			}
		}
	}
	_, _ = s.db.Exec(`INSERT INTO page_view_days (business_id, day, views, visitors) VALUES (?, ?, 1, ?)
		ON CONFLICT(business_id, day) DO UPDATE SET views = views + 1, visitors = visitors + excluded.visitors`, businessID, day, extra)
	_, _ = s.db.Exec(`INSERT INTO page_views (business_id, views) VALUES (?, 1)
		ON CONFLICT(business_id) DO UPDATE SET views = views + 1`, businessID)
	hour := s.now().In(mustZone(timezone)).Hour()
	_, _ = s.db.Exec(`INSERT INTO page_view_hours (business_id, day, hour, views) VALUES (?, ?, ?, 1)
		ON CONFLICT(business_id, day, hour) DO UPDATE SET views = views + 1`, businessID, day, hour)
	s.bumpFacet(businessID, day, "source", sourceLabel(source))
	s.bumpFacet(businessID, day, "device", deviceLabel(device))
	s.bumpFacet(businessID, day, "country", clip(strings.TrimSpace(country), 40))
	s.bumpFacet(businessID, day, "city", clip(strings.TrimSpace(city), 40))
}

func (s *Service) bumpFacet(businessID, day, kind, label string) {
	if label == "" {
		return
	}
	_, _ = s.db.Exec(`INSERT INTO page_facets (business_id, day, kind, label, views) VALUES (?, ?, ?, ?, 1)
		ON CONFLICT(business_id, day, kind, label) DO UPDATE SET views = views + 1`, businessID, day, kind, label)
}

func sourceLabel(value string) string {
	value = strings.TrimSpace(strings.ToLower(value))
	if value == "" || value == "direct" {
		return "ورود مستقیم"
	}
	if len(value) > 40 {
		value = value[:40]
	}
	return value
}

func deviceLabel(value string) string {
	switch strings.TrimSpace(strings.ToLower(value)) {
	case "mobile":
		return "موبایل"
	case "tablet":
		return "تبلت"
	case "desktop":
		return "رایانه"
	default:
		return "نامشخص"
	}
}

func (s *Service) NoteBlock(slug, blockID, label string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	blockID = clip(strings.TrimSpace(blockID), 80)
	label = clip(strings.TrimSpace(label), 80)
	if blockID == "" || label == "" {
		return map[string]any{"ok": true}, nil
	}
	b, err := loadBiz(s.db, "slug = ?", clip(slug, 80))
	if err != nil {
		return nil, err
	}
	day := booking.TodayYMD(mustZone(b.Timezone), s.now())
	_, err = s.db.Exec(`INSERT INTO page_block_views (business_id, day, block_id, label, views) VALUES (?, ?, ?, ?, 1)
		ON CONFLICT(business_id, day, block_id) DO UPDATE SET views = views + 1, label = excluded.label`, b.ID, day, blockID, label)
	if err != nil {
		return nil, err
	}
	return map[string]any{"ok": true}, nil
}

func (s *Service) NoteStay(slug string, seconds int) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if seconds < 1 {
		seconds = 1
	}
	if seconds > 1800 {
		seconds = 1800
	}
	b, err := loadBiz(s.db, "slug = ?", clip(slug, 80))
	if err != nil {
		return nil, err
	}
	day := booking.TodayYMD(mustZone(b.Timezone), s.now())
	_, err = s.db.Exec(`INSERT INTO page_dwell (business_id, day, seconds, samples) VALUES (?, ?, ?, 1)
		ON CONFLICT(business_id, day) DO UPDATE SET seconds = seconds + excluded.seconds, samples = samples + 1`, b.ID, day, seconds)
	if err != nil {
		return nil, err
	}
	return map[string]any{"ok": true}, nil
}

func (s *Service) NoteClick(slug string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	b, err := loadBiz(s.db, "slug = ?", clip(slug, 80))
	if err != nil {
		return nil, err
	}
	day := booking.TodayYMD(mustZone(b.Timezone), s.now())
	_, err = s.db.Exec(`INSERT INTO page_clicks (business_id, day, clicks) VALUES (?, ?, 1)
		ON CONFLICT(business_id, day) DO UPDATE SET clicks = clicks + 1`, b.ID, day)
	if err != nil {
		return nil, err
	}
	return map[string]any{"ok": true}, nil
}

type spanJSON struct {
	Weekday  int `json:"weekday"`
	StartMin int `json:"startMin"`
	EndMin   int `json:"endMin"`
}

func (s *Service) snapshot(q querier, b bizRow, manage bool) (map[string]any, error) {
	catName := ""
	if b.CategoryID.Valid {
		_ = q.QueryRow(`SELECT name FROM categories WHERE id = ?`, b.CategoryID.String).Scan(&catName)
	}
	branches := []map[string]any{}
	brows, err := q.Query(`SELECT id, name, address FROM branches WHERE business_id = ? AND active = 1 ORDER BY name`, b.ID)
	if err != nil {
		return nil, err
	}
	for brows.Next() {
		var id, name, address string
		if err := brows.Scan(&id, &name, &address); err != nil {
			brows.Close()
			return nil, err
		}
		branches = append(branches, map[string]any{"id": id, "name": name, "address": address})
	}
	brows.Close()

	svcSQL := `SELECT id, name, description, duration_minutes, buffer_minutes, price_toman, active, COALESCE(photo, '') FROM services WHERE business_id = ?`
	if !manage {
		svcSQL += ` AND active = 1`
	}
	svcSQL += ` ORDER BY name`
	services := []map[string]any{}
	srows, err := q.Query(svcSQL, b.ID)
	if err != nil {
		return nil, err
	}
	for srows.Next() {
		var id, name, desc, photo string
		var dur, buf, price, active int
		if err := srows.Scan(&id, &name, &desc, &dur, &buf, &price, &active, &photo); err != nil {
			srows.Close()
			return nil, err
		}
		row := map[string]any{
			"id": id, "name": name, "description": desc, "durationMinutes": dur, "bufferMinutes": buf, "priceToman": price, "active": active != 0,
		}
		if photo != "" {
			row["photo"] = photo
		}
		services = append(services, row)
	}
	srows.Close()

	staffSQL := `SELECT id, name, title, active, COALESCE(photo, ''), COALESCE(phone, ''), COALESCE(user_id, ''), COALESCE(invite_token, '') FROM staff WHERE business_id = ?`
	if !manage {
		staffSQL += ` AND active = 1`
	}
	staffSQL += ` ORDER BY name`
	type person struct {
		id, name, title, photo, phone, userID, invite string
		active                                        bool
	}
	var people []person
	prows, err := q.Query(staffSQL, b.ID)
	if err != nil {
		return nil, err
	}
	for prows.Next() {
		var p person
		var active int
		if err := prows.Scan(&p.id, &p.name, &p.title, &active, &p.photo, &p.phone, &p.userID, &p.invite); err != nil {
			prows.Close()
			return nil, err
		}
		p.active = active != 0
		people = append(people, p)
	}
	prows.Close()

	links := map[string][]string{}
	lrows, err := q.Query(`SELECT staff_id, service_id FROM staff_services WHERE staff_id IN (SELECT id FROM staff WHERE business_id = ?)`, b.ID)
	if err != nil {
		return nil, err
	}
	for lrows.Next() {
		var sid, svc string
		if err := lrows.Scan(&sid, &svc); err != nil {
			lrows.Close()
			return nil, err
		}
		links[sid] = append(links[sid], svc)
	}
	lrows.Close()
	hours := map[string][]spanJSON{}
	hrows, err := q.Query(`SELECT staff_id, weekday, start_min, end_min FROM working_hours WHERE staff_id IN (SELECT id FROM staff WHERE business_id = ?) ORDER BY weekday, start_min`, b.ID)
	if err != nil {
		return nil, err
	}
	for hrows.Next() {
		var sid string
		var sp spanJSON
		if err := hrows.Scan(&sid, &sp.Weekday, &sp.StartMin, &sp.EndMin); err != nil {
			hrows.Close()
			return nil, err
		}
		hours[sid] = append(hours[sid], sp)
	}
	hrows.Close()
	breaks := map[string][]spanJSON{}
	krows, err := q.Query(`SELECT staff_id, weekday, start_min, end_min FROM breaks WHERE staff_id IN (SELECT id FROM staff WHERE business_id = ?)`, b.ID)
	if err != nil {
		return nil, err
	}
	for krows.Next() {
		var sid string
		var sp spanJSON
		if err := krows.Scan(&sid, &sp.Weekday, &sp.StartMin, &sp.EndMin); err != nil {
			krows.Close()
			return nil, err
		}
		breaks[sid] = append(breaks[sid], sp)
	}
	krows.Close()

	staff := []map[string]any{}
	for _, p := range people {
		svcIDs := links[p.id]
		if svcIDs == nil {
			svcIDs = []string{}
		}
		weekly := hours[p.id]
		if weekly == nil {
			weekly = []spanJSON{}
		}
		rest := breaks[p.id]
		if rest == nil {
			rest = []spanJSON{}
		}
		row := map[string]any{
			"id": p.id, "name": p.name, "title": p.title, "active": p.active,
			"pending":    p.userID == "" && p.phone != "",
			"serviceIds": svcIDs, "weekly": weekly, "breaks": rest,
		}
		if manage {
			row["phone"] = p.phone
		}
		if manage && p.userID == "" && p.invite != "" {
			row["inviteToken"] = p.invite
		}
		if p.photo != "" {
			row["photo"] = p.photo
		}
		staff = append(staff, row)
	}

	holidays := []map[string]any{}
	orows, err := q.Query(`SELECT id, staff_id, date_local, note FROM holidays WHERE business_id = ? ORDER BY date_local`, b.ID)
	if err != nil {
		return nil, err
	}
	for orows.Next() {
		var id, date, note string
		var staffID sql.NullString
		if err := orows.Scan(&id, &staffID, &date, &note); err != nil {
			orows.Close()
			return nil, err
		}
		var sid any
		if staffID.Valid && staffID.String != "" {
			sid = staffID.String
		}
		if len(date) >= 10 {
			date = date[:10]
		}
		row := map[string]any{"id": id, "staffId": sid, "date": date}
		if manage {
			row["note"] = note
		}
		holidays = append(holidays, row)
	}
	orows.Close()

	catID := ""
	if b.CategoryID.Valid {
		catID = b.CategoryID.String
	}
	reason := ""
	if manage {
		reason = b.Reason
	}
	groups := []map[string]any{}
	if manage {
		grows, err := q.Query(`SELECT id, name FROM customer_groups WHERE business_id = ? ORDER BY name`, b.ID)
		if err != nil {
			return nil, err
		}
		for grows.Next() {
			var id, name string
			if err := grows.Scan(&id, &name); err != nil {
				grows.Close()
				return nil, err
			}
			groups = append(groups, map[string]any{"id": id, "name": name})
		}
		grows.Close()
	}
	return map[string]any{
		"id": b.ID, "name": b.Name, "slug": b.Slug, "description": b.Description,
		"categoryId": catID, "categoryName": catName, "city": b.City, "address": b.Address, "phone": b.Phone,
		"timezone": b.Timezone, "status": b.Status, "statusReason": reason,
		"cancelBeforeMinutes": b.CancelBefore, "minLeadMinutes": b.MinLead, "maxHorizonDays": b.Horizon,
		"slotStepMinutes": b.Step, "allowAnyStaff": b.AllowAny, "isDemo": b.IsDemo, "avatar": b.Avatar, "remindHours": b.RemindHours,
		"pageBlocks": pageBlocksValue(b.PageBlocks),
		"branches":   branches, "services": services, "staff": staff, "holidays": holidays,
		"customerGroups": groups,
		"shopHours":      s.shopHours(q, b.ID),
	}, nil
}

func (s *Service) Me(userID string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.me(userID)
}

func (s *Service) me(userID string) (map[string]any, error) {
	var uname, email string
	if err := s.db.QueryRow(`SELECT name, email FROM users WHERE id = ?`, userID).Scan(&uname, &email); err != nil {
		return nil, err
	}
	if _, err := s.db.Exec(`INSERT INTO profiles (user_id, display_name, created_at) VALUES (?,?,?) ON CONFLICT (user_id) DO NOTHING`,
		userID, clip(uname, 80), s.now().UTC().Format(time.RFC3339)); err != nil {
		return nil, err
	}
	var display, phone, avatar string
	var username, pageFor, pageName, activity sql.NullString
	var hasPassword int
	err := s.db.QueryRow(`
		SELECT p.display_name, p.phone, p.username, p.page_for, p.page_name, c.name, p.avatar, p.has_password
		FROM profiles p LEFT JOIN categories c ON c.id = p.activity_id
		WHERE p.user_id = ?`, userID).Scan(&display, &phone, &username, &pageFor, &pageName, &activity, &avatar, &hasPassword)
	if err != nil {
		return nil, err
	}
	admin, err := s.isAdmin(s.db, userID)
	if err != nil {
		return nil, err
	}
	var admins int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM platform_admins`).Scan(&admins); err != nil {
		return nil, err
	}
	mrows, err := s.db.Query(`
		SELECT m.business_id, m.role, b.name, b.slug, b.status, b.avatar, b.category_id, COALESCE(st.id, '')
		FROM memberships m JOIN businesses b ON b.id = m.business_id
		LEFT JOIN staff st ON st.business_id = m.business_id AND st.user_id = m.user_id
		WHERE m.user_id = ? ORDER BY b.created_at`, userID)
	if err != nil {
		return nil, err
	}
	memberships := []map[string]any{}
	for mrows.Next() {
		var id, role, name, slug, status, avatarBiz, staffID string
		var categoryID sql.NullString
		if err := mrows.Scan(&id, &role, &name, &slug, &status, &avatarBiz, &categoryID, &staffID); err != nil {
			mrows.Close()
			return nil, err
		}
		memberships = append(memberships, map[string]any{
			"businessId": id, "role": role, "name": name, "slug": slug, "status": status, "avatar": avatarBiz, "categoryId": categoryID.String, "staffId": staffID,
		})
	}
	mrows.Close()
	var unread int
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM notifications WHERE user_id = ? AND read_at IS NULL`, userID).Scan(&unread)
	if display == "" {
		display = uname
	}
	return map[string]any{
		"profile": map[string]any{
			"displayName": display, "phone": phone, "email": email, "avatar": avatar, "hasPassword": hasPassword != 0,
			"username": username.String, "pageFor": pageFor.String, "pageName": pageName.String, "activityName": activity.String,
		},
		"isAdmin": admin, "canClaim": !admin && admins == 0, "unread": unread, "memberships": memberships,
	}, nil
}

func (s *Service) UpdateProfile(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	name, err := textOf(raw, "displayName", 80, "")
	if err != nil {
		return nil, err
	}
	if len([]rune(name)) < 2 {
		return nil, fail(400, "VALIDATION", "نام را وارد کنید")
	}
	if _, err := s.db.Exec(`UPDATE profiles SET display_name = ? WHERE user_id = ?`, name, userID); err != nil {
		return nil, err
	}
	if _, err := s.db.Exec(`UPDATE users SET name = ? WHERE id = ?`, name, userID); err != nil {
		return nil, err
	}
	if _, ok := raw["avatar"]; ok {
		avatar, err := cleanAvatar(raw["avatar"])
		if err != nil {
			return nil, err
		}
		if _, err := s.db.Exec(`UPDATE profiles SET avatar = ? WHERE user_id = ?`, avatar, userID); err != nil {
			return nil, err
		}
	}
	return s.me(userID)
}

func (s *Service) ClaimAdmin(userID string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var existing string
	err := s.db.QueryRow(`SELECT user_id FROM platform_admins WHERE user_id = ?`, userID).Scan(&existing)
	if err == nil {
		return map[string]any{"claimed": true}, nil
	}
	var n int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM platform_admins`).Scan(&n); err != nil {
		return nil, err
	}
	if n > 0 {
		return nil, fail(403, "FORBIDDEN", "مدیر سامانه قبلاً تعیین شده است")
	}
	if _, err := s.db.Exec(`INSERT INTO platform_admins (user_id, created_at) VALUES (?,?)`, userID, s.now().UTC().Format(time.RFC3339)); err != nil {
		return nil, err
	}
	_ = s.audit(s.db, userID, "claim_admin", "platform_admin", strPtr(userID), nil, "اولین مدیر سامانه")
	return map[string]any{"claimed": true}, nil
}

func (s *Service) insertBusiness(q querier, userID string, name, description, categoryID, city, address, phone, timezone string, demo bool) (string, string, error) {
	businessID := newID()
	branchID := newID()
	var cat any
	if categoryID != "" {
		cat = categoryID
	}
	now := s.now().UTC().Format(time.RFC3339)
	_, err := q.Exec(`INSERT INTO businesses (
		id, owner_user_id, name, slug, description, category_id, city, address, phone, timezone, is_demo, created_at
	) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
		businessID, userID, name, slugify(name), description, cat, city, address, phone, timezone, bint(demo), now)
	if err != nil {
		return "", "", err
	}
	if _, err := q.Exec(`INSERT INTO memberships (business_id, user_id, role) VALUES (?,?, 'owner')`, businessID, userID); err != nil {
		return "", "", err
	}
	if _, err := q.Exec(`INSERT INTO branches (id, business_id, name, address) VALUES (?,?, 'شعبه اصلی', ?)`, branchID, businessID, address); err != nil {
		return "", "", err
	}
	if _, err := q.Exec(`INSERT INTO subscriptions (id, business_id, plan, status, created_at) VALUES (?,?, 'free', 'none', ?)`, newID(), businessID, now); err != nil {
		return "", "", err
	}
	_ = s.audit(q, userID, "create_business", "business", strPtr(businessID), strPtr(businessID), name)
	return businessID, branchID, nil
}

func (s *Service) ensureOwnerStaff(q querier, businessID, userID string, linkAll bool) error {
	if businessID == "" || userID == "" {
		return nil
	}
	var name, phone string
	_ = q.QueryRow(`SELECT display_name, phone FROM profiles WHERE user_id = ?`, userID).Scan(&name, &phone)
	name = strings.TrimSpace(name)
	if name == "" {
		_ = q.QueryRow(`SELECT name FROM users WHERE id = ?`, userID).Scan(&name)
		name = strings.TrimSpace(name)
	}
	if name == "" {
		name = "صاحب کسب‌وکار"
	}
	var staffID string
	err := q.QueryRow(`SELECT id FROM staff WHERE business_id = ? AND user_id = ? LIMIT 1`, businessID, userID).Scan(&staffID)
	created := false
	if err == sql.ErrNoRows && phone != "" {
		err = q.QueryRow(`SELECT id FROM staff WHERE business_id = ? AND phone = ? AND COALESCE(user_id, '') = '' LIMIT 1`, businessID, phone).Scan(&staffID)
		if err == nil {
			if _, err = q.Exec(`UPDATE staff SET user_id = ? WHERE id = ?`, userID, staffID); err != nil {
				return err
			}
		}
	}
	if staffID == "" {
		var branch string
		_ = q.QueryRow(`SELECT id FROM branches WHERE business_id = ? LIMIT 1`, businessID).Scan(&branch)
		staffID = newID()
		if _, err = q.Exec(`INSERT INTO staff (id, business_id, branch_id, user_id, name, title, active, phone) VALUES (?,?,?,?,?,'',1,?)`,
			staffID, businessID, branch, userID, clip(name, 80), phone); err != nil {
			return err
		}
		created = true
	}
	var hours int
	_ = q.QueryRow(`SELECT COUNT(*) FROM working_hours WHERE staff_id = ?`, staffID).Scan(&hours)
	if hours == 0 {
		for _, weekday := range []int{6, 0, 1, 2, 3, 4} {
			if _, err = q.Exec(`INSERT INTO working_hours (id, staff_id, weekday, start_min, end_min) VALUES (?,?,?,540,1080)`, newID(), staffID, weekday); err != nil {
				return err
			}
		}
	}
	if !linkAll && !created {
		return nil
	}
	rows, err := q.Query(`SELECT id FROM services WHERE business_id = ?`, businessID)
	if err != nil {
		return err
	}
	var serviceIDs []string
	for rows.Next() {
		var serviceID string
		if err := rows.Scan(&serviceID); err != nil {
			rows.Close()
			return err
		}
		serviceIDs = append(serviceIDs, serviceID)
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return err
	}
	rows.Close()
	for _, serviceID := range serviceIDs {
		if _, err := q.Exec(`INSERT INTO staff_services (staff_id, service_id) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM staff_services WHERE staff_id = ? AND service_id = ?)`, staffID, serviceID, staffID, serviceID); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) linkOwnerToService(businessID, serviceID string) error {
	var owner string
	if err := s.db.QueryRow(`SELECT owner_user_id FROM businesses WHERE id = ?`, businessID).Scan(&owner); err != nil {
		return err
	}
	if err := s.ensureOwnerStaff(s.db, businessID, owner, false); err != nil {
		return err
	}
	var staffID string
	if err := s.db.QueryRow(`SELECT id FROM staff WHERE business_id = ? AND user_id = ? LIMIT 1`, businessID, owner).Scan(&staffID); err != nil {
		return err
	}
	_, err := s.db.Exec(`INSERT INTO staff_services (staff_id, service_id) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM staff_services WHERE staff_id = ? AND service_id = ?)`, staffID, serviceID, staffID, serviceID)
	return err
}

func (s *Service) backfillOwners() {
	rows, err := s.db.Query(`SELECT id, owner_user_id FROM businesses`)
	if err != nil {
		return
	}
	defer rows.Close()
	type pair struct{ id, owner string }
	var all []pair
	for rows.Next() {
		var item pair
		if err := rows.Scan(&item.id, &item.owner); err != nil {
			return
		}
		all = append(all, item)
	}
	rows.Close()
	for _, item := range all {
		_ = s.ensureOwnerStaff(s.db, item.id, item.owner, true)
	}
}

func (s *Service) StartAccount(raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	categoryID := strings.TrimSpace(mustString(raw, "categoryId"))
	pageFor := mustString(raw, "pageFor")
	pageName := strings.TrimSpace(mustString(raw, "pageName"))
	username, err := normalizeUsername(mustString(raw, "username"))
	if err != nil {
		return nil, err
	}
	phone, err := normalizePhone(mustString(raw, "phone"))
	if err != nil {
		return nil, err
	}
	code := strings.TrimSpace(mustString(raw, "code"))
	if pageFor != "self" && pageFor != "business" {
		return nil, fail(400, "VALIDATION", "مشخص کنید صفحه برای خودتان است یا کسب‌وکارتان")
	}
	if len([]rune(pageName)) < 2 {
		return nil, fail(400, "VALIDATION", "اسم صفحه را بنویسید")
	}
	if !s.rate("start:"+phone, 5, time.Minute) {
		return nil, fail(429, "RATE", "چند لحظه بعد دوباره تلاش کنید")
	}
	if acc, err := s.accountByPhone(phone); err != nil {
		return nil, err
	} else if acc != nil {
		return nil, fail(409, "CONFLICT", "این شماره قبلاً ثبت شده است. وارد شوید")
	}
	var taken string
	err = s.db.QueryRow(`SELECT user_id FROM profiles WHERE lower(username) = lower(?)`, username).Scan(&taken)
	if err == nil {
		return nil, fail(409, "CONFLICT", "این نام کاربری گرفته شده است")
	}
	if err != sql.ErrNoRows {
		return nil, err
	}
	var cat string
	if err := s.db.QueryRow(`SELECT id FROM categories WHERE id = ? AND active = 1`, categoryID).Scan(&cat); err != nil {
		return nil, fail(400, "VALIDATION", "حوزه فعالیت را انتخاب کنید")
	}
	if err := s.consumeCode(phone, "signup", code); err != nil {
		return nil, err
	}
	userID := newID()
	secret := newID() + "Aa9!"
	hash, err := hashPassword(secret)
	if err != nil {
		return nil, err
	}
	now := s.now().UTC().Format(time.RFC3339)
	page := clip(pageName, 80)
	desc := ""
	if pageFor == "self" {
		desc = "صفحه شخصی"
	}
	err = s.tx(func(tx *sql.Tx) error {
		if _, err := tx.Exec(`INSERT INTO users (id, name, email, phone, password_hash, created_at) VALUES (?,?,?,?,?,?)`,
			userID, page, phoneEmail(phone), phone, hash, now); err != nil {
			return err
		}
		if _, err := tx.Exec(`INSERT INTO profiles (user_id, display_name, phone, username, activity_id, page_for, page_name, has_password, created_at)
			VALUES (?,?,?,?,?,?,?,0,?)`, userID, page, phone, username, categoryID, pageFor, page, now); err != nil {
			return err
		}
		_, _, err := s.insertBusiness(tx, userID, page, desc, categoryID, "", "", phone, "Asia/Tehran", false)
		return err
	})
	if err != nil {
		_, _ = s.db.Exec(`DELETE FROM users WHERE id = ?`, userID)
		if isUnique(err) {
			return nil, fail(409, "CONFLICT", "این شماره یا نام کاربری قبلاً ثبت شده است")
		}
		if _, ok := err.(*Fail); ok {
			return nil, err
		}
		return nil, fail(400, "AUTH", "حساب ساخته نشد. دوباره تلاش کنید.")
	}
	token, err := s.openSession(userID, deviceFrom(raw))
	if err != nil {
		return nil, err
	}
	return map[string]any{"token": token}, nil
}

func (s *Service) RegisterPerson(raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	name, err := textOf(raw, "name", 80, "")
	if err != nil || len([]rune(name)) < 2 {
		if err != nil {
			return nil, err
		}
		return nil, fail(400, "VALIDATION", "نام را وارد کنید")
	}
	phone, err := normalizePhone(mustString(raw, "phone"))
	if err != nil {
		return nil, err
	}
	code := strings.TrimSpace(mustString(raw, "code"))
	if !s.rate("register:"+phone, 5, time.Minute) {
		return nil, fail(429, "RATE", "چند لحظه بعد دوباره تلاش کنید")
	}
	if acc, err := s.accountByPhone(phone); err != nil {
		return nil, err
	} else if acc != nil {
		return nil, fail(409, "CONFLICT", "این شماره قبلاً ثبت شده است. وارد شوید")
	}
	password := mustString(raw, "password")
	confirm := mustString(raw, "confirm")
	hasPassword := 0
	secret := newID() + "Aa9!"
	if strings.TrimSpace(password) != "" || strings.TrimSpace(confirm) != "" {
		if len(password) < 8 {
			return nil, fail(400, "VALIDATION", "رمز باید حداقل ۸ نویسه باشد")
		}
		if password != confirm {
			return nil, fail(400, "VALIDATION", "تکرار رمز با رمز یکی نیست")
		}
		secret = password
		hasPassword = 1
	}
	if err := s.consumeCode(phone, "signup", code); err != nil {
		return nil, err
	}
	userID := newID()
	hash, err := hashPassword(secret)
	if err != nil {
		return nil, err
	}
	now := s.now().UTC().Format(time.RFC3339)
	_, err = s.db.Exec(`INSERT INTO users (id, name, email, phone, password_hash, created_at) VALUES (?,?,?,?,?,?)`,
		userID, name, phoneEmail(phone), phone, hash, now)
	if err != nil {
		return nil, fail(400, "AUTH", "حساب ساخته نشد. دوباره تلاش کنید.")
	}
	if _, err := s.db.Exec(`INSERT INTO profiles (user_id, display_name, phone, has_password, created_at) VALUES (?,?,?,?,?)`,
		userID, name, phone, hasPassword, now); err != nil {
		_, _ = s.db.Exec(`DELETE FROM users WHERE id = ?`, userID)
		return nil, fail(400, "AUTH", "حساب ساخته نشد. دوباره تلاش کنید.")
	}
	token, err := s.openSession(userID, deviceFrom(raw))
	if err != nil {
		return nil, err
	}
	return map[string]any{"token": token}, nil
}

func (s *Service) CreatePage(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	categoryID := strings.TrimSpace(mustString(raw, "categoryId"))
	pageFor := mustString(raw, "pageFor")
	pageName := strings.TrimSpace(mustString(raw, "pageName"))
	username, err := normalizeUsername(mustString(raw, "username"))
	if err != nil {
		return nil, err
	}
	if pageFor != "self" && pageFor != "business" {
		return nil, fail(400, "VALIDATION", "مشخص کنید صفحه برای خودتان است یا کسب‌وکارتان")
	}
	var ownerName, phone string
	_ = s.db.QueryRow(`SELECT display_name, phone FROM profiles WHERE user_id = ?`, userID).Scan(&ownerName, &phone)
	ownerName = strings.TrimSpace(ownerName)
	if pageFor == "self" {
		if len([]rune(ownerName)) < 2 {
			return nil, fail(400, "VALIDATION", "اول نام خودتان را در حساب بنویسید")
		}
		pageName = ownerName
	}
	if len([]rune(pageName)) < 2 {
		return nil, fail(400, "VALIDATION", "اسم کسب‌وکار را بنویسید")
	}
	var taken string
	err = s.db.QueryRow(`SELECT user_id FROM profiles WHERE lower(username) = lower(?)`, username).Scan(&taken)
	if err == nil {
		return nil, fail(409, "CONFLICT", "این نام کاربری گرفته شده است")
	}
	if err != sql.ErrNoRows {
		return nil, err
	}
	var cat string
	if err := s.db.QueryRow(`SELECT id FROM categories WHERE id = ? AND active = 1`, categoryID).Scan(&cat); err != nil {
		return nil, fail(400, "VALIDATION", "حوزه فعالیت را انتخاب کنید")
	}
	page := clip(pageName, 80)
	desc := ""
	if pageFor == "self" {
		desc = "صفحه شخصی"
	}
	var businessID string
	err = s.tx(func(tx *sql.Tx) error {
		if _, err := tx.Exec(`UPDATE profiles SET username = ?, activity_id = ?, page_for = ?, page_name = ? WHERE user_id = ?`,
			username, categoryID, pageFor, page, userID); err != nil {
			return err
		}
		id, _, err := s.insertBusiness(tx, userID, page, desc, categoryID, "", "", phone, "Asia/Tehran", false)
		if err != nil {
			return err
		}
		businessID = id
		return s.ensureOwnerStaff(tx, businessID, userID, true)
	})
	if err != nil {
		if isUnique(err) {
			return nil, fail(409, "CONFLICT", "این نام کاربری قبلاً ثبت شده است")
		}
		if _, ok := err.(*Fail); ok {
			return nil, err
		}
		return nil, fail(400, "AUTH", "صفحه ساخته نشد. دوباره تلاش کنید.")
	}
	return map[string]any{"businessId": businessID}, nil
}

func (s *Service) tx(fn func(*sql.Tx) error) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	if err = fn(tx); err != nil {
		_ = tx.Rollback()
		return err
	}
	return tx.Commit()
}

func (s *Service) CreateBusiness(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	name, err := textOf(raw, "name", 80, "")
	if err != nil {
		return nil, err
	}
	if len([]rune(name)) < 2 {
		return nil, fail(400, "VALIDATION", "نام کسب‌وکار را وارد کنید")
	}
	timezone, err := textOf(raw, "timezone", 64, "Asia/Tehran")
	if err != nil {
		return nil, err
	}
	if err := assertZone(timezone); err != nil {
		return nil, err
	}
	categoryID, err := textOf(raw, "categoryId", 40, "")
	if err != nil {
		return nil, err
	}
	desc, _ := textOf(raw, "description", 2000, "")
	city, _ := textOf(raw, "city", 60, "")
	address, _ := textOf(raw, "address", 200, "")
	phone, _ := textOf(raw, "phone", 20, "")
	var id string
	err = s.tx(func(tx *sql.Tx) error {
		if categoryID != "" {
			var cat string
			if err := tx.QueryRow(`SELECT id FROM categories WHERE id = ? AND active = 1`, categoryID).Scan(&cat); err != nil {
				return fail(400, "VALIDATION", "دسته‌بندی نامعتبر است")
			}
		}
		var uname string
		_ = tx.QueryRow(`SELECT name FROM users WHERE id = ?`, userID).Scan(&uname)
		_, _ = tx.Exec(`INSERT INTO profiles (user_id, display_name, created_at) VALUES (?,?,?) ON CONFLICT(user_id) DO NOTHING`, userID, clip(uname, 80), s.now().UTC().Format(time.RFC3339))
		bid, _, err := s.insertBusiness(tx, userID, name, desc, categoryID, city, address, phone, timezone, false)
		if err != nil {
			return err
		}
		id = bid
		return s.ensureOwnerStaff(tx, id, userID, true)
	})
	if err != nil {
		return nil, err
	}
	return map[string]any{"businessId": id}, nil
}

func (s *Service) CreateDemo(userID string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var id string
	err := s.tx(func(tx *sql.Tx) error {
		var uname string
		_ = tx.QueryRow(`SELECT name FROM users WHERE id = ?`, userID).Scan(&uname)
		_, _ = tx.Exec(`INSERT INTO profiles (user_id, display_name, created_at) VALUES (?,?,?) ON CONFLICT(user_id) DO NOTHING`, userID, clip(uname, 80), s.now().UTC().Format(time.RFC3339))
		bid, branchID, err := s.insertBusiness(tx, userID, "آرایشگاه نمونه سرو", "داده نمونه برای آشنایی با رزرو. این کسب‌وکار واقعی نیست و می‌توانید حذفش کنید.", "cat-beauty", "تهران", "خیابان نمونه، پلاک ۱", "02100000000", "Asia/Tehran", true)
		if err != nil {
			return err
		}
		id = bid
		services := []struct {
			name            string
			dur, buf, price int
		}{{"اصلاح مو", 45, 10, 350000}, {"اصلاح ریش", 30, 5, 180000}, {"رنگ مو", 90, 15, 900000}}
		var serviceIDs []string
		for _, svc := range services {
			sid := newID()
			serviceIDs = append(serviceIDs, sid)
			if _, err := tx.Exec(`INSERT INTO services (id, business_id, branch_id, name, duration_minutes, buffer_minutes, price_toman) VALUES (?,?,?,?,?,?,?)`,
				sid, bid, branchID, svc.name, svc.dur, svc.buf, svc.price); err != nil {
				return err
			}
		}
		for _, person := range [][2]string{{"سارا کریمی", "استایلیست"}, {"رضا نوری", "اصلاح"}} {
			staffID := newID()
			if _, err := tx.Exec(`INSERT INTO staff (id, business_id, branch_id, name, title) VALUES (?,?,?,?,?)`, staffID, bid, branchID, person[0], person[1]); err != nil {
				return err
			}
			for _, sid := range serviceIDs {
				if _, err := tx.Exec(`INSERT INTO staff_services (staff_id, service_id) VALUES (?,?)`, staffID, sid); err != nil {
					return err
				}
			}
			for _, weekday := range []int{6, 0, 1, 2, 3, 4} {
				if _, err := tx.Exec(`INSERT INTO working_hours (id, staff_id, weekday, start_min, end_min) VALUES (?,?,?,540,1080)`, newID(), staffID, weekday); err != nil {
					return err
				}
				if _, err := tx.Exec(`INSERT INTO breaks (id, staff_id, weekday, start_min, end_min) VALUES (?,?,?,840,900)`, newID(), staffID, weekday); err != nil {
					return err
				}
			}
		}
		return s.ensureOwnerStaff(tx, bid, userID, true)
	})
	if err != nil {
		return nil, err
	}
	return map[string]any{"businessId": id}, nil
}
