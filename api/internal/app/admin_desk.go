package app

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

const adminPage = 30

func adminCursor(raw map[string]any) (string, string) {
	before, _ := textOf(raw, "before", 40, "")
	beforeID, _ := textOf(raw, "beforeId", 80, "")
	return before, beforeID
}

func (s *Service) deskQueue() map[string]any {
	var waiting, pending, suspended, failed, orders int
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM support_tickets WHERE status = 'waiting'`).Scan(&waiting)
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM payments WHERE status = 'pending'`).Scan(&pending)
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM businesses WHERE status = 'suspended'`).Scan(&suspended)
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM notification_jobs WHERE channel = 'sms' AND status = 'failed'`).Scan(&failed)
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM menu_orders`).Scan(&orders)
	rows, err := s.db.Query(`SELECT payload, last_error, created_at FROM notification_jobs WHERE channel = 'sms' AND status = 'failed' ORDER BY created_at DESC LIMIT 5`)
	list := []map[string]any{}
	if err == nil {
		for rows.Next() {
			var payload, last, at string
			if rows.Scan(&payload, &last, &at) != nil {
				continue
			}
			var body struct {
				To   string `json:"to"`
				Kind string `json:"kind"`
			}
			_ = json.Unmarshal([]byte(payload), &body)
			list = append(list, map[string]any{"phone": body.To, "kind": body.Kind, "error": last, "at": at})
		}
		rows.Close()
	}
	return map[string]any{
		"waitingTickets": waiting, "pendingPayments": pending, "suspended": suspended,
		"failedSms": failed, "orders": orders, "failedSmsRows": list,
	}
}

func (s *Service) AdminSearch(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	q, _ := textOf(raw, "q", 80, "")
	if q == "" {
		return map[string]any{"users": []any{}, "businesses": []any{}}, nil
	}
	phone, _ := normalizePhone(q)
	likeQ := like(q)
	urows, err := s.db.Query(`
		SELECT u.id, COALESCE(NULLIF(p.display_name, ''), u.name, ''),
			COALESCE(NULLIF(p.phone, ''), NULLIF(u.phone, ''), ''), u.disabled,
			EXISTS(SELECT 1 FROM platform_admins a WHERE a.user_id = u.id)
		FROM users u LEFT JOIN profiles p ON p.user_id = u.id
		WHERE (? != '' AND (p.phone = ? OR u.phone = ?))
			OR u.name LIKE ? ESCAPE '\' OR p.display_name LIKE ? ESCAPE '\' OR u.email LIKE ? ESCAPE '\'
		ORDER BY u.created_at DESC LIMIT 20`, phone, phone, phone, likeQ, likeQ, likeQ)
	if err != nil {
		return nil, err
	}
	users := []map[string]any{}
	ids := []string{}
	for urows.Next() {
		var id, name, userPhone string
		var disabled, admin int
		if err := urows.Scan(&id, &name, &userPhone, &disabled, &admin); err != nil {
			urows.Close()
			return nil, err
		}
		ids = append(ids, id)
		users = append(users, map[string]any{"id": id, "name": name, "phone": userPhone, "disabled": disabled != 0, "isAdmin": admin != 0, "pages": []map[string]any{}})
	}
	urows.Close()
	if len(ids) > 0 {
		holders := make([]string, len(ids))
		args := make([]any, len(ids))
		for i, id := range ids {
			holders[i] = "?"
			args[i] = id
		}
		prows, err := s.db.Query(`SELECT m.user_id, b.name, b.slug, m.role FROM memberships m JOIN businesses b ON b.id = m.business_id WHERE m.user_id IN (`+strings.Join(holders, ",")+`)`, args...)
		if err != nil {
			return nil, err
		}
		byUser := map[string][]map[string]any{}
		for prows.Next() {
			var uid, name, slug, role string
			if err := prows.Scan(&uid, &name, &slug, &role); err != nil {
				prows.Close()
				return nil, err
			}
			byUser[uid] = append(byUser[uid], map[string]any{"name": name, "slug": slug, "role": role})
		}
		prows.Close()
		for _, item := range users {
			if pages := byUser[item["id"].(string)]; pages != nil {
				item["pages"] = pages
			}
		}
	}
	brows, err := s.db.Query(`
		SELECT b.id, b.name, b.slug, b.status, MIN(CASE
			WHEN ? != '' AND b.phone = ? THEN 1
			WHEN ? != '' AND (u.phone = ? OR p.phone = ?) THEN 2
			WHEN ? != '' AND (st.phone = ? OR su.phone = ? OR sp.phone = ?) THEN 3
			ELSE 4 END)
		FROM businesses b
		LEFT JOIN users u ON u.id = b.owner_user_id
		LEFT JOIN profiles p ON p.user_id = b.owner_user_id
		LEFT JOIN staff st ON st.business_id = b.id
		LEFT JOIN users su ON su.id = st.user_id
		LEFT JOIN profiles sp ON sp.user_id = st.user_id
		WHERE (? != '' AND (b.phone = ? OR u.phone = ? OR p.phone = ? OR st.phone = ? OR su.phone = ? OR sp.phone = ?))
			OR b.name LIKE ? ESCAPE '\' OR b.slug LIKE ? ESCAPE '\' OR b.city LIKE ? ESCAPE '\'
		GROUP BY b.id
		ORDER BY b.created_at DESC LIMIT 20`,
		phone, phone, phone, phone, phone, phone, phone, phone, phone,
		phone, phone, phone, phone, phone, phone, phone, likeQ, likeQ, likeQ)
	if err != nil {
		return nil, err
	}
	defer brows.Close()
	vias := []string{"", "تلفن صفحه", "صاحب", "پرسنل", "نام"}
	businesses := []map[string]any{}
	for brows.Next() {
		var id, name, slug, status string
		var via int
		if err := brows.Scan(&id, &name, &slug, &status, &via); err != nil {
			return nil, err
		}
		label := "نام"
		if via >= 1 && via < len(vias) {
			label = vias[via]
		}
		businesses = append(businesses, map[string]any{"id": id, "name": name, "slug": slug, "status": status, "via": label})
	}
	return map[string]any{"users": users, "businesses": businesses}, brows.Err()
}

func (s *Service) SetUserDisabled(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	target, err := textOf(raw, "userId", 80, "")
	if err != nil || target == "" {
		return nil, fail(400, "VALIDATION", "کاربر مشخص نیست")
	}
	if target == userID && isTrue(raw, "disabled") {
		return nil, fail(400, "VALIDATION", "ورود خودتان را نمی‌توانید ببندید")
	}
	var name string
	var admin int
	err = s.db.QueryRow(`SELECT name, EXISTS(SELECT 1 FROM platform_admins a WHERE a.user_id = users.id) FROM users WHERE id = ?`, target).Scan(&name, &admin)
	if err != nil {
		return nil, fail(404, "NOT_FOUND", "کاربر پیدا نشد")
	}
	off := bint(isTrue(raw, "disabled"))
	if off == 1 && admin == 1 {
		var n int
		_ = s.db.QueryRow(`SELECT COUNT(*) FROM platform_admins`).Scan(&n)
		if n <= 1 {
			return nil, fail(400, "VALIDATION", "ورود آخرین مدیر را نمی‌شود بست")
		}
	}
	if _, err := s.db.Exec(`UPDATE users SET disabled = ? WHERE id = ?`, off, target); err != nil {
		return nil, err
	}
	if off == 1 {
		_, _ = s.db.Exec(`DELETE FROM sessions WHERE user_id = ?`, target)
	}
	detail := "باز شد"
	if off == 1 {
		detail = "بسته شد"
	}
	_ = s.audit(s.db, userID, "user_access", "user", strPtr(target), nil, detail)
	return map[string]any{"userId": target, "disabled": off == 1}, nil
}

func (s *Service) SetPlatformAdmin(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	target, err := textOf(raw, "userId", 80, "")
	if err != nil || target == "" {
		return nil, fail(400, "VALIDATION", "کاربر مشخص نیست")
	}
	var disabled int
	if err := s.db.QueryRow(`SELECT disabled FROM users WHERE id = ?`, target).Scan(&disabled); err != nil {
		return nil, fail(404, "NOT_FOUND", "کاربر پیدا نشد")
	}
	on := isTrue(raw, "admin")
	if on && disabled != 0 {
		return nil, fail(400, "VALIDATION", "اول ورود این حساب را باز کنید")
	}
	var n, mine int
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM platform_admins`).Scan(&n)
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM platform_admins WHERE user_id = ?`, target).Scan(&mine)
	if !on && mine == 1 && n <= 1 {
		return nil, fail(400, "VALIDATION", "آخرین مدیر را نمی‌شود برداشت")
	}
	if on && mine == 0 {
		if _, err := s.db.Exec(`INSERT INTO platform_admins (user_id, created_at) VALUES (?,?)`, target, s.now().UTC().Format(time.RFC3339)); err != nil {
			return nil, err
		}
	}
	if !on && mine == 1 {
		if _, err := s.db.Exec(`DELETE FROM platform_admins WHERE user_id = ?`, target); err != nil {
			return nil, err
		}
	}
	detail := "برداشته شد"
	if on {
		detail = "داده شد"
	}
	_ = s.audit(s.db, userID, "user_admin", "platform_admin", strPtr(target), nil, detail)
	return map[string]any{"userId": target, "isAdmin": on}, nil
}

func (s *Service) AdminBusinessFile(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil || businessID == "" {
		return nil, fail(400, "VALIDATION", "کسب‌وکار مشخص نیست")
	}
	var slug string
	if err := s.db.QueryRow(`SELECT slug FROM businesses WHERE id = ?`, businessID).Scan(&slug); err != nil {
		return nil, fail(404, "NOT_FOUND", "کسب‌وکار پیدا نشد")
	}
	rows, err := s.db.Query(`SELECT id, item_title, customer_name, phone, status, price, created_at FROM menu_orders WHERE business_id = ? ORDER BY created_at DESC LIMIT 8`, businessID)
	if err != nil {
		return nil, err
	}
	orders := []map[string]any{}
	for rows.Next() {
		var id, title, name, phone, status, at string
		var price int
		if err := rows.Scan(&id, &title, &name, &phone, &status, &price, &at); err != nil {
			rows.Close()
			return nil, err
		}
		orders = append(orders, map[string]any{"id": id, "title": title, "name": name, "phone": phone, "status": status, "price": price, "createdAt": at})
	}
	rows.Close()
	return map[string]any{"slug": slug, "orders": orders, "media": listMedia(businessID)}, nil
}

func listMedia(businessID string) []map[string]any {
	out := []map[string]any{}
	if !mediaID.MatchString(businessID) {
		return out
	}
	entries, err := os.ReadDir(filepath.Join(mediaRoot(), businessID))
	if err != nil {
		return out
	}
	for _, entry := range entries {
		if entry.IsDir() || !mediaStored(entry.Name()) {
			continue
		}
		info, err := entry.Info()
		size := int64(0)
		if err == nil {
			size = info.Size()
		}
		out = append(out, map[string]any{
			"name": entry.Name(),
			"url":  "/api/v1/media/" + businessID + "/" + entry.Name(),
			"size": size,
		})
	}
	return out
}

func (s *Service) AdminDeleteMedia(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	businessID, _ := textOf(raw, "businessId", 80, "")
	name, _ := textOf(raw, "name", 80, "")
	path, err := storedMediaPath(businessID, name)
	if err != nil {
		return nil, err
	}
	var blocks, avatar string
	if err := s.db.QueryRow(`SELECT page_blocks, avatar FROM businesses WHERE id = ?`, businessID).Scan(&blocks, &avatar); err != nil {
		return nil, fail(404, "NOT_FOUND", "کسب‌وکار پیدا نشد")
	}
	url := "/api/v1/media/" + businessID + "/" + name
	next := blocks
	var parsed any
	if json.Unmarshal([]byte(blocks), &parsed) == nil {
		if rawNext, err := json.Marshal(scrubValue(parsed, url)); err == nil {
			next = string(rawNext)
		}
	}
	if _, err := s.db.Exec(`UPDATE businesses SET page_blocks = ?, avatar = CASE WHEN avatar = ? THEN '' ELSE avatar END WHERE id = ?`, next, url, businessID); err != nil {
		return nil, err
	}
	_, _ = s.db.Exec(`UPDATE services SET photo = '' WHERE business_id = ? AND photo = ?`, businessID, url)
	_, _ = s.db.Exec(`UPDATE staff SET photo = '' WHERE business_id = ? AND photo = ?`, businessID, url)
	_ = os.Remove(path)
	_ = s.audit(s.db, userID, "media_delete", "media", strPtr(name), strPtr(businessID), name)
	return map[string]any{"ok": true, "media": listMedia(businessID)}, nil
}

func storedMediaPath(businessID, name string) (string, error) {
	if !mediaID.MatchString(businessID) || !mediaStored(name) {
		return "", fail(400, "VALIDATION", "فایل معتبر نیست")
	}
	root, err := filepath.Abs(mediaRoot())
	if err != nil {
		return "", err
	}
	path := filepath.Join(root, businessID, name)
	if !strings.HasPrefix(path, root+string(os.PathSeparator)) {
		return "", fail(400, "VALIDATION", "فایل معتبر نیست")
	}
	return path, nil
}

func scrubValue(v any, url string) any {
	switch t := v.(type) {
	case string:
		if t == url {
			return ""
		}
		if strings.Contains(t, url) {
			var nested any
			if json.Unmarshal([]byte(t), &nested) == nil {
				if next, err := json.Marshal(scrubValue(nested, url)); err == nil {
					return string(next)
				}
			}
			return strings.ReplaceAll(t, url, "")
		}
		return t
	case []any:
		for i := range t {
			t[i] = scrubValue(t[i], url)
		}
		return t
	case map[string]any:
		for key, val := range t {
			t[key] = scrubValue(val, url)
		}
		return t
	default:
		return v
	}
}

func (s *Service) GrantSMS(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil || businessID == "" {
		return nil, fail(400, "VALIDATION", "کسب‌وکار مشخص نیست")
	}
	count, err := intOf(raw, "count", 1, 10000)
	if err != nil {
		return nil, fail(400, "VALIDATION", "تعداد پیامک را بین ۱ تا ۱۰۰۰۰ وارد کنید")
	}
	reason, err := textOf(raw, "reason", 200, "")
	if err != nil || len([]rune(reason)) < 3 {
		return nil, fail(400, "VALIDATION", "دلیل شارژ را بنویسید")
	}
	var name string
	if err := s.db.QueryRow(`SELECT name FROM businesses WHERE id = ?`, businessID).Scan(&name); err != nil {
		return nil, fail(404, "NOT_FOUND", "کسب‌وکار پیدا نشد")
	}
	if _, err := s.db.Exec(`INSERT INTO sms_wallets (business_id, balance) VALUES (?, ?) ON CONFLICT(business_id) DO UPDATE SET balance = balance + excluded.balance`, businessID, count); err != nil {
		return nil, err
	}
	var balance int
	_ = s.db.QueryRow(`SELECT balance FROM sms_wallets WHERE business_id = ?`, businessID).Scan(&balance)
	_ = s.audit(s.db, userID, "sms_grant", "sms_wallet", strPtr(businessID), strPtr(businessID), strconv.Itoa(count)+" · "+reason)
	return map[string]any{"businessId": businessID, "smsBalance": balance}, nil
}

func (s *Service) AdminPayments(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	before, beforeID := adminCursor(raw)
	status, _ := textOf(raw, "status", 20, "")
	if status != "" && status != "pending" && status != "paid" && status != "failed" {
		status = ""
	}
	rows, err := s.db.Query(`
		SELECT p.id, p.gateway, p.kind, p.amount_toman, p.status, p.created_at, p.paid_at, COALESCE(b.name, 'حذف‌شده'), COALESCE(b.slug, '')
		FROM payments p LEFT JOIN businesses b ON b.id = p.business_id
		WHERE (? = '' OR p.status = ?)
			AND (? = '' OR p.created_at < ? OR (p.created_at = ? AND p.id < ?))
		ORDER BY p.created_at DESC, p.id DESC LIMIT ?`,
		status, status, before, before, before, beforeID, adminPage+1)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, gateway, kind, state, created, paid, name, slug string
		var amount int
		if err := rows.Scan(&id, &gateway, &kind, &amount, &state, &created, &paid, &name, &slug); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{
			"id": id, "gateway": gateway, "kind": kind, "amount": amount, "status": state,
			"createdAt": created, "paidAt": paid, "businessName": name, "slug": slug,
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

func (s *Service) MoveCategory(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	id, _ := textOf(raw, "id", 40, "")
	dir, _ := textOf(raw, "dir", 8, "")
	if id == "" || (dir != "up" && dir != "down") {
		return nil, fail(400, "VALIDATION", "جابه‌جایی دسته نامعتبر است")
	}
	rows, err := s.db.Query(`SELECT id FROM categories ORDER BY sort, name, id`)
	if err != nil {
		return nil, err
	}
	ids := []string{}
	for rows.Next() {
		var cid string
		if err := rows.Scan(&cid); err != nil {
			rows.Close()
			return nil, err
		}
		ids = append(ids, cid)
	}
	rows.Close()
	at := -1
	for i, cid := range ids {
		if cid == id {
			at = i
		}
	}
	if at < 0 {
		return nil, fail(404, "NOT_FOUND", "دسته پیدا نشد")
	}
	swap := at - 1
	if dir == "down" {
		swap = at + 1
	}
	if swap >= 0 && swap < len(ids) {
		ids[at], ids[swap] = ids[swap], ids[at]
	}
	for i, cid := range ids {
		if _, err := s.db.Exec(`UPDATE categories SET sort = ? WHERE id = ?`, i+1, cid); err != nil {
			return nil, err
		}
	}
	_ = s.audit(s.db, userID, "save_category", "category", strPtr(id), nil, dir)
	return s.listCategories()
}

func (s *Service) DeleteCategory(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	id, _ := textOf(raw, "id", 40, "")
	if id == "" {
		return nil, fail(400, "VALIDATION", "دسته مشخص نیست")
	}
	var pages, people int
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM businesses WHERE category_id = ?`, id).Scan(&pages)
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM profiles WHERE activity_id = ?`, id).Scan(&people)
	if pages > 0 || people > 0 {
		return nil, fail(409, "CONFLICT", "این دسته هنوز استفاده می‌شود و حذف نمی‌شود")
	}
	res, err := s.db.Exec(`DELETE FROM categories WHERE id = ?`, id)
	if err != nil {
		return nil, err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return nil, fail(404, "NOT_FOUND", "دسته پیدا نشد")
	}
	_ = s.audit(s.db, userID, "delete_category", "category", strPtr(id), nil, "")
	return s.listCategories()
}
