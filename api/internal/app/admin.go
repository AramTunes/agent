package app

import (
	"database/sql"
	"strings"
	"time"
)

func (s *Service) AdminOverview(userID string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	return s.overview()
}

func (s *Service) overview() (map[string]any, error) {
	var users int
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM users`).Scan(&users)
	biz := map[string]int{}
	rows, err := s.db.Query(`SELECT status, COUNT(*) FROM businesses GROUP BY status`)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var k string
		var n int
		_ = rows.Scan(&k, &n)
		biz[k] = n
	}
	rows.Close()
	books := map[string]int{}
	brows, err := s.db.Query(`SELECT status, COUNT(*) FROM bookings GROUP BY status`)
	if err != nil {
		return nil, err
	}
	for brows.Next() {
		var k string
		var n int
		_ = brows.Scan(&k, &n)
		books[k] = n
	}
	brows.Close()
	var orders int
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM menu_orders`).Scan(&orders)
	settings := []map[string]any{}
	srows, err := s.db.Query(`SELECT key, value FROM platform_settings ORDER BY key`)
	if err != nil {
		return nil, err
	}
	for srows.Next() {
		var k, v string
		_ = srows.Scan(&k, &v)
		settings = append(settings, map[string]any{"key": k, "value": v})
	}
	srows.Close()
	note := "درگاه پرداخت خاموش است. تا روشن شدنش اشتراک قفل نمی‌شود."
	if s.billingLive(s.db) {
		note = "حداقل یک درگاه روشن است. آزمایش هفت‌روزه و قفل اشتراک فعال است."
	}
	if kavenegarReady() {
		note += " پیامک کاوه‌نگار از روی کلید محیط برنامه آماده است."
	} else {
		note += " کلید کاوه‌نگار هنوز نیست و کد ورود روی صفحه نشان داده می‌شود."
	}
	return map[string]any{
		"users": users, "businesses": biz, "bookings": books, "orders": orders, "settings": settings,
		"gateways": s.gatewayView(s.db), "smsReady": kavenegarReady(), "queue": s.deskQueue(),
		"note": note,
	}, nil
}

func (s *Service) AdminUsers(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	q, _ := textOf(raw, "q", 80, "")
	before, beforeID := adminCursor(raw)
	rows, err := s.db.Query(`
		SELECT u.id, u.name, u.email, u.created_at, u.disabled,
			COALESCE(NULLIF(p.phone, ''), NULLIF(u.phone, ''), ''),
			COALESCE(NULLIF(p.display_name, ''), u.name, ''),
			EXISTS(SELECT 1 FROM platform_admins a WHERE a.user_id = u.id)
		FROM users u LEFT JOIN profiles p ON p.user_id = u.id
		WHERE (? = '' OR u.name LIKE ? ESCAPE '\' OR p.display_name LIKE ? ESCAPE '\' OR p.phone LIKE ? ESCAPE '\' OR u.phone LIKE ? ESCAPE '\' OR u.email LIKE ? ESCAPE '\')
			AND (? = '' OR u.created_at < ? OR (u.created_at = ? AND u.id < ?))
		ORDER BY u.created_at DESC, u.id DESC LIMIT ?`,
		q, like(q), like(q), like(q), like(q), like(q), before, before, before, beforeID, adminPage+1)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	type row struct {
		id, name, phone, created string
		disabled, admin          int
	}
	var list []row
	for rows.Next() {
		var item row
		var email, display string
		if err := rows.Scan(&item.id, &item.name, &email, &item.created, &item.disabled, &item.phone, &display, &item.admin); err != nil {
			return nil, err
		}
		if display != "" {
			item.name = display
		}
		if item.phone == "" && strings.HasSuffix(email, "@phone.agent.ir") {
			item.phone = strings.TrimSuffix(email, "@phone.agent.ir")
		}
		list = append(list, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	more := len(list) > adminPage
	if more {
		list = list[:adminPage]
	}
	pages := map[string][]map[string]any{}
	if len(list) > 0 {
		holders := make([]string, len(list))
		args := make([]any, len(list))
		for i, item := range list {
			holders[i] = "?"
			args[i] = item.id
		}
		prows, err := s.db.Query(`SELECT m.user_id, b.name, b.slug, m.role FROM memberships m JOIN businesses b ON b.id = m.business_id WHERE m.user_id IN (`+strings.Join(holders, ",")+`) ORDER BY b.name`, args...)
		if err != nil {
			return nil, err
		}
		for prows.Next() {
			var uid, name, slug, role string
			if err := prows.Scan(&uid, &name, &slug, &role); err != nil {
				prows.Close()
				return nil, err
			}
			pages[uid] = append(pages[uid], map[string]any{"name": name, "slug": slug, "role": role})
		}
		prows.Close()
	}
	out := []map[string]any{}
	for _, item := range list {
		out = append(out, map[string]any{
			"id": item.id, "name": item.name, "phone": item.phone, "createdAt": item.created,
			"disabled": item.disabled != 0, "isAdmin": item.admin != 0, "pages": pages[item.id],
		})
	}
	return map[string]any{"rows": out, "more": more}, nil
}

func (s *Service) AdminBusinesses(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	q, _ := textOf(raw, "q", 80, "")
	before, beforeID := adminCursor(raw)
	demo, _ := textOf(raw, "demo", 10, "")
	statusFilter, _ := textOf(raw, "status", 20, "")
	where := []string{`(? = '' OR b.name LIKE ? ESCAPE '\' OR b.city LIKE ? ESCAPE '\' OR b.slug LIKE ? ESCAPE '\' OR b.phone LIKE ? ESCAPE '\' OR u.phone LIKE ? ESCAPE '\' OR p.phone LIKE ? ESCAPE '\')`}
	args := []any{q, like(q), like(q), like(q), like(q), like(q), like(q)}
	if demo == "real" {
		where = append(where, "b.is_demo = 0")
	} else if demo == "demo" {
		where = append(where, "b.is_demo = 1")
	}
	if statusFilter == "active" || statusFilter == "inactive" || statusFilter == "suspended" {
		where = append(where, "b.status = ?")
		args = append(args, statusFilter)
	}
	if before != "" && beforeID != "" {
		where = append(where, "(b.created_at < ? OR (b.created_at = ? AND b.id < ?))")
		args = append(args, before, before, beforeID)
	}
	args = append(args, adminPage+1)
	rows, err := s.db.Query(`
		SELECT b.id, b.name, b.slug, b.status, b.status_reason, b.city, b.is_demo, b.avatar, b.created_at,
			COALESCE(c.name, ''),
			COALESCE(NULLIF(p.display_name, ''), u.name, ''),
			COALESCE(NULLIF(p.phone, ''), NULLIF(u.phone, ''), ''),
			COALESCE((SELECT trial_ends_at FROM subscriptions WHERE business_id = b.id ORDER BY created_at DESC LIMIT 1), ''),
			COALESCE((SELECT plan_ends_at FROM subscriptions WHERE business_id = b.id ORDER BY created_at DESC LIMIT 1), ''),
			COALESCE((SELECT appearance_ends_at FROM subscriptions WHERE business_id = b.id ORDER BY created_at DESC LIMIT 1), ''),
			COALESCE((SELECT balance FROM sms_wallets WHERE business_id = b.id), 0)
		FROM businesses b
		LEFT JOIN users u ON u.id = b.owner_user_id
		LEFT JOIN profiles p ON p.user_id = b.owner_user_id
		LEFT JOIN categories c ON c.id = b.category_id
		WHERE `+strings.Join(where, " AND ")+`
		ORDER BY b.created_at DESC, b.id DESC LIMIT ?`, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, name, slug, status, reason, city, avatar, created, category, owner, phone, trial, plan, look string
		var demo, balance int
		if err := rows.Scan(&id, &name, &slug, &status, &reason, &city, &demo, &avatar, &created, &category, &owner, &phone, &trial, &plan, &look, &balance); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{
			"id": id, "name": name, "slug": slug, "status": status, "status_reason": reason, "city": city,
			"is_demo": demo != 0, "avatar": avatar, "createdAt": created, "categoryName": category,
			"ownerName": owner, "ownerPhone": phone, "trialEndsAt": trial, "planEndsAt": plan,
			"appearanceEndsAt": look, "smsBalance": balance,
		})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	more := len(out) > adminPage
	if more {
		out = out[:adminPage]
	}
	return map[string]any{"rows": out, "more": more}, nil
}

func (s *Service) Moderate(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	businessID, _ := textOf(raw, "businessId", 80, "")
	status, _ := textOf(raw, "status", 20, "")
	reason, _ := textOf(raw, "reason", 300, "")
	if status != "active" && status != "inactive" && status != "suspended" {
		return nil, fail(400, "VALIDATION", "وضعیت نامعتبر است")
	}
	if status != "active" && len([]rune(reason)) < 3 {
		return nil, fail(400, "VALIDATION", "دلیل غیرفعال‌سازی یا تعلیق را بنویسید")
	}
	if status == "active" {
		reason = ""
	}
	res, err := s.db.Exec(`UPDATE businesses SET status = ?, status_reason = ? WHERE id = ?`, status, reason, businessID)
	if err != nil {
		return nil, err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, fail(404, "NOT_FOUND", "کسب‌وکار پیدا نشد")
	}
	_ = s.audit(s.db, userID, "moderate_business", "business", strPtr(businessID), strPtr(businessID), status+": "+reason)
	return map[string]any{"businessId": businessID, "status": status}, nil
}

func (s *Service) AdminCategories(userID string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	return s.listCategories()
}

func (s *Service) listCategories() ([]map[string]any, error) {
	rows, err := s.db.Query(`SELECT c.id, c.name, c.slug, c.active, c.sort,
		(SELECT COUNT(*) FROM businesses b WHERE b.category_id = c.id)
		FROM categories c ORDER BY c.sort, c.name, c.id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, name, slug string
		var active, sort, pages int
		if err := rows.Scan(&id, &name, &slug, &active, &sort, &pages); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{"id": id, "name": name, "slug": slug, "active": active != 0, "sort": sort, "pages": pages})
	}
	return out, rows.Err()
}

func (s *Service) SaveCategory(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	name, err := textOf(raw, "name", 60, "")
	if err != nil || len([]rune(name)) < 2 {
		if err != nil {
			return nil, err
		}
		return nil, fail(400, "VALIDATION", "نام دسته را وارد کنید")
	}
	slug, _ := textOf(raw, "slug", 40, "")
	slug = strings.ToLower(slug)
	clean := strings.Builder{}
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			clean.WriteRune(r)
		}
	}
	slug = clean.String()
	if slug == "" {
		slug = "cat-" + shortID()
	}
	categoryID, _ := textOf(raw, "id", 40, "")
	if categoryID == "" {
		categoryID = newID()
	}
	active := bint(notFalse(raw, "active"))
	var existing string
	err = s.db.QueryRow(`SELECT id FROM categories WHERE id = ?`, categoryID).Scan(&existing)
	if err == nil {
		_, err = s.db.Exec(`UPDATE categories SET name=?, slug=?, active=? WHERE id=?`, name, slug, active, categoryID)
	} else if err == sql.ErrNoRows {
		var sort int
		_ = s.db.QueryRow(`SELECT COALESCE(MAX(sort), 0) + 1 FROM categories`).Scan(&sort)
		_, err = s.db.Exec(`INSERT INTO categories (id, name, slug, sort, active) VALUES (?,?,?,?,?)`, categoryID, name, slug, sort, active)
	}
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			return nil, fail(409, "CONFLICT", "این نشانی دسته قبلاً استفاده شده")
		}
		return nil, err
	}
	_ = s.audit(s.db, userID, "save_category", "category", strPtr(categoryID), nil, name)
	return map[string]any{"categoryId": categoryID}, nil
}

func (s *Service) AdminAudit(userID string) (any, error) {
	return s.AdminAuditPage(userID, map[string]any{})
}

func (s *Service) AdminAuditPage(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	action, _ := textOf(raw, "action", 40, "")
	before, beforeID := adminCursor(raw)
	rows, err := s.db.Query(`
		SELECT a.id, a.actor_user_id, COALESCE(NULLIF(p.display_name, ''), u.name, ''),
			COALESCE(NULLIF(p.phone, ''), NULLIF(u.phone, ''), ''),
			a.action, a.entity, a.entity_id, a.detail, a.created_at, a.business_id,
			COALESCE(b.name, ''), COALESCE(b.slug, '')
		FROM audit_logs a
		LEFT JOIN users u ON u.id = a.actor_user_id
		LEFT JOIN profiles p ON p.user_id = a.actor_user_id
		LEFT JOIN businesses b ON b.id = a.business_id
		WHERE (? = '' OR a.action = ?)
			AND (? = '' OR a.created_at < ? OR (a.created_at = ? AND a.id < ?))
		ORDER BY a.created_at DESC, a.id DESC LIMIT ?`,
		action, action, before, before, before, beforeID, adminPage+1)
	if err != nil {
		return nil, err
	}
	logs := []map[string]any{}
	for rows.Next() {
		var id, actor, actorName, actorPhone, actionName, entity, detail, created, bizName, bizSlug string
		var entityID, businessID sql.NullString
		if err := rows.Scan(&id, &actor, &actorName, &actorPhone, &actionName, &entity, &entityID, &detail, &created, &businessID, &bizName, &bizSlug); err != nil {
			rows.Close()
			return nil, err
		}
		if actorName == "" {
			actorName = "سامانه"
		}
		var eid any
		if entityID.Valid {
			eid = entityID.String
		}
		logs = append(logs, map[string]any{
			"id": id, "actorUserId": actor, "actorName": actorName, "actorPhone": actorPhone,
			"action": actionName, "entity": entity, "entityId": eid, "detail": detail, "createdAt": created,
			"businessId": businessID.String, "businessName": bizName, "businessSlug": bizSlug,
		})
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return nil, err
	}
	rows.Close()
	more := len(logs) > adminPage
	if more {
		logs = logs[:adminPage]
	}
	jrows, err := s.db.Query(`SELECT channel, status, COUNT(*) FROM notification_jobs GROUP BY channel, status`)
	if err != nil {
		return nil, err
	}
	jobs := []map[string]any{}
	for jrows.Next() {
		var channel, status string
		var n int
		_ = jrows.Scan(&channel, &status, &n)
		jobs = append(jobs, map[string]any{"channel": channel, "status": status, "n": n})
	}
	jrows.Close()
	return map[string]any{
		"logs": logs, "more": more, "jobs": jobs,
		"errorLog": "پیامک فقط وقتی اینجا می‌آید که کاوه‌نگار آن را قبول یا رد کرده باشد. اعلان داخل برنامه جداست.",
	}, nil
}

func (s *Service) SaveSettings(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	now := s.now().UTC().Format(time.RFC3339)
	for _, key := range []string{"platform_name", "support_email"} {
		if _, ok := raw[key].(string); !ok {
			continue
		}
		value, _ := textOf(raw, key, 120, "")
		if _, err := s.db.Exec(`INSERT INTO platform_settings (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`, key, value, now); err != nil {
			return nil, err
		}
	}
	_ = s.audit(s.db, userID, "save_settings", "platform_settings", nil, nil, "")
	return s.overview()
}
