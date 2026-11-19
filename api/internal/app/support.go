package app

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"
	"time"
)

func (s *Service) SupportTickets(userID string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.supportTickets(userID)
}

func (s *Service) supportTickets(userID string) ([]map[string]any, error) {
	rows, err := s.db.Query(`
		SELECT t.id, t.code, t.subject, t.status, t.created_at, t.updated_at,
		       COALESCE(m.id, ''), COALESCE(m.author, ''), COALESCE(m.body, ''), COALESCE(m.created_at, '')
		FROM support_tickets t
		LEFT JOIN support_messages m ON m.ticket_id = t.id
		WHERE t.user_id = ?
		ORDER BY t.updated_at DESC, m.created_at ASC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	order := []string{}
	byID := map[string]map[string]any{}
	for rows.Next() {
		var id, code, subject, status, created, updated, mid, author, body, at string
		if err := rows.Scan(&id, &code, &subject, &status, &created, &updated, &mid, &author, &body, &at); err != nil {
			return nil, err
		}
		item, ok := byID[id]
		if !ok {
			item = map[string]any{
				"id": id, "code": code, "subject": subject, "status": status,
				"createdAt": created, "updatedAt": updated, "messages": []map[string]any{},
			}
			byID[id] = item
			order = append(order, id)
		}
		if mid == "" {
			continue
		}
		item["messages"] = append(item["messages"].([]map[string]any), map[string]any{
			"id": mid, "author": author, "body": body, "at": at,
		})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	out := make([]map[string]any, 0, len(order))
	for _, id := range order {
		out = append(out, byID[id])
	}
	return out, nil
}

func (s *Service) CreateSupportTicket(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	subject, err := textOf(raw, "subject", 120, "")
	if err != nil {
		return nil, err
	}
	if len([]rune(subject)) < 3 {
		return nil, fail(400, "VALIDATION", "موضوع تیکت را بنویسید")
	}
	body, err := textOf(raw, "body", 1000, "")
	if err != nil {
		return nil, err
	}
	if len([]rune(body)) < 2 {
		return nil, fail(400, "VALIDATION", "متن پیام را بنویسید")
	}
	id := newID()
	now := s.now().UTC().Format(time.RFC3339)
	err = s.tx(func(tx *sql.Tx) error {
		code, err := nextTicketCode(tx)
		if err != nil {
			return err
		}
		if _, err := tx.Exec(`INSERT INTO support_tickets (id, user_id, code, subject, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)`,
			id, userID, code, subject, "waiting", now, now); err != nil {
			return err
		}
		if _, err := tx.Exec(`INSERT INTO support_messages (id, ticket_id, author, body, created_at) VALUES (?,?,?,?,?)`,
			newID(), id, "user", body, now); err != nil {
			return err
		}
		s.notify(tx, withoutID(s.adminIDs(tx), userID), "", "", "support_waiting", "تیکت جدید", subject)
		_ = s.audit(tx, userID, "support_open", "ticket", strPtr(id), nil, subject)
		return nil
	})
	if err != nil {
		return nil, err
	}
	return map[string]any{"id": id}, nil
}

func (s *Service) ReplySupportTicket(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	id, err := textOf(raw, "id", 80, "")
	if err != nil || id == "" {
		return nil, fail(400, "VALIDATION", "تیکت پیدا نشد")
	}
	body, err := textOf(raw, "body", 1000, "")
	if err != nil {
		return nil, err
	}
	if len([]rune(body)) < 2 {
		return nil, fail(400, "VALIDATION", "متن پیام را بنویسید")
	}
	var status string
	err = s.db.QueryRow(`SELECT status FROM support_tickets WHERE id = ? AND user_id = ?`, id, userID).Scan(&status)
	if err == sql.ErrNoRows {
		return nil, fail(404, "NOT_FOUND", "تیکت پیدا نشد")
	}
	if err != nil {
		return nil, err
	}
	if status == "done" {
		return nil, fail(400, "VALIDATION", "این تیکت بسته است")
	}
	now := s.now().UTC().Format(time.RFC3339)
	err = s.tx(func(tx *sql.Tx) error {
		if _, err := tx.Exec(`INSERT INTO support_messages (id, ticket_id, author, body, created_at) VALUES (?,?,?,?,?)`,
			newID(), id, "user", body, now); err != nil {
			return err
		}
		if _, err := tx.Exec(`UPDATE support_tickets SET status = 'waiting', updated_at = ? WHERE id = ?`, now, id); err != nil {
			return err
		}
		var subject string
		_ = tx.QueryRow(`SELECT subject FROM support_tickets WHERE id = ?`, id).Scan(&subject)
		s.notify(tx, withoutID(s.adminIDs(tx), userID), "", "", "support_waiting", "پاسخ جدید روی تیکت", subject)
		_ = s.audit(tx, userID, "support_reply", "ticket", strPtr(id), nil, "user")
		return nil
	})
	if err != nil {
		return nil, err
	}
	return map[string]any{"ok": true}, nil
}

func (s *Service) CloseSupportTicket(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	id, err := textOf(raw, "id", 80, "")
	if err != nil || id == "" {
		return nil, fail(400, "VALIDATION", "تیکت پیدا نشد")
	}
	return s.closeTicket(userID, id, true)
}

func (s *Service) ReopenSupportTicket(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	id, err := textOf(raw, "id", 80, "")
	if err != nil || id == "" {
		return nil, fail(400, "VALIDATION", "تیکت پیدا نشد")
	}
	return s.reopenTicket(userID, id, true)
}

func (s *Service) AdminSupportTickets(userID string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	rows, err := s.db.Query(`
		SELECT t.id, t.code, t.subject, t.status, t.created_at, t.updated_at, t.user_id,
		       COALESCE(p.display_name, ''), COALESCE(p.phone, ''),
		       COALESCE(m.id, ''), COALESCE(m.author, ''), COALESCE(m.body, ''), COALESCE(m.created_at, '')
		FROM support_tickets t
		LEFT JOIN profiles p ON p.user_id = t.user_id
		LEFT JOIN support_messages m ON m.ticket_id = t.id
		ORDER BY CASE t.status WHEN 'waiting' THEN 0 WHEN 'open' THEN 1 ELSE 2 END, t.updated_at DESC, m.created_at ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	order := []string{}
	byID := map[string]map[string]any{}
	for rows.Next() {
		var id, code, subject, status, created, updated, owner, name, phone, mid, author, body, at string
		if err := rows.Scan(&id, &code, &subject, &status, &created, &updated, &owner, &name, &phone, &mid, &author, &body, &at); err != nil {
			return nil, err
		}
		item, ok := byID[id]
		if !ok {
			item = map[string]any{
				"id": id, "code": code, "subject": subject, "status": status,
				"createdAt": created, "updatedAt": updated, "userId": owner, "userName": name, "userPhone": phone,
				"messages": []map[string]any{},
			}
			byID[id] = item
			order = append(order, id)
		}
		if mid == "" {
			continue
		}
		item["messages"] = append(item["messages"].([]map[string]any), map[string]any{
			"id": mid, "author": author, "body": body, "at": at,
		})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	out := make([]map[string]any, 0, len(order))
	for _, id := range order {
		out = append(out, byID[id])
	}
	return out, nil
}

func (s *Service) AdminReplySupportTicket(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	id, err := textOf(raw, "id", 80, "")
	if err != nil || id == "" {
		return nil, fail(400, "VALIDATION", "تیکت پیدا نشد")
	}
	body, err := textOf(raw, "body", 1000, "")
	if err != nil {
		return nil, err
	}
	if len([]rune(body)) < 2 {
		return nil, fail(400, "VALIDATION", "متن پیام را بنویسید")
	}
	var owner, status, subject string
	err = s.db.QueryRow(`SELECT user_id, status, subject FROM support_tickets WHERE id = ?`, id).Scan(&owner, &status, &subject)
	if err == sql.ErrNoRows {
		return nil, fail(404, "NOT_FOUND", "تیکت پیدا نشد")
	}
	if err != nil {
		return nil, err
	}
	if status == "done" {
		return nil, fail(400, "VALIDATION", "این تیکت بسته است")
	}
	now := s.now().UTC().Format(time.RFC3339)
	err = s.tx(func(tx *sql.Tx) error {
		if _, err := tx.Exec(`INSERT INTO support_messages (id, ticket_id, author, body, created_at) VALUES (?,?,?,?,?)`,
			newID(), id, "agent", body, now); err != nil {
			return err
		}
		if _, err := tx.Exec(`UPDATE support_tickets SET status = 'open', updated_at = ? WHERE id = ?`, now, id); err != nil {
			return err
		}
		s.notify(tx, []string{owner}, "", "", "support_reply", "پشتیبانی جواب داد", subject)
		_ = s.audit(tx, userID, "support_reply", "ticket", strPtr(id), nil, "agent")
		return nil
	})
	if err != nil {
		return nil, err
	}
	return map[string]any{"ok": true}, nil
}

func (s *Service) AdminCloseSupportTicket(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	id, err := textOf(raw, "id", 80, "")
	if err != nil || id == "" {
		return nil, fail(400, "VALIDATION", "تیکت پیدا نشد")
	}
	return s.closeTicket(userID, id, false)
}

func (s *Service) AdminReopenSupportTicket(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := s.requireAdmin(userID); err != nil {
		return nil, err
	}
	id, err := textOf(raw, "id", 80, "")
	if err != nil || id == "" {
		return nil, fail(400, "VALIDATION", "تیکت پیدا نشد")
	}
	return s.reopenTicket(userID, id, false)
}

func (s *Service) closeTicket(actor, id string, ownerOnly bool) (any, error) {
	now := s.now().UTC().Format(time.RFC3339)
	query := `UPDATE support_tickets SET status = 'done', updated_at = ? WHERE id = ? AND status <> 'done'`
	args := []any{now, id}
	if ownerOnly {
		query = `UPDATE support_tickets SET status = 'done', updated_at = ? WHERE id = ? AND user_id = ? AND status <> 'done'`
		args = append(args, actor)
	}
	res, err := s.db.Exec(query, args...)
	if err != nil {
		return nil, err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		var status string
		lookup := `SELECT status FROM support_tickets WHERE id = ?`
		lookArgs := []any{id}
		if ownerOnly {
			lookup = `SELECT status FROM support_tickets WHERE id = ? AND user_id = ?`
			lookArgs = append(lookArgs, actor)
		}
		err = s.db.QueryRow(lookup, lookArgs...).Scan(&status)
		if err == sql.ErrNoRows {
			return nil, fail(404, "NOT_FOUND", "تیکت پیدا نشد")
		}
		if err != nil {
			return nil, err
		}
		return nil, fail(409, "POLICY", "این تیکت بسته است")
	}
	who := "user"
	if !ownerOnly {
		who = "agent"
	}
	_ = s.audit(s.db, actor, "support_close", "ticket", strPtr(id), nil, who)
	return map[string]any{"ok": true}, nil
}

func (s *Service) reopenTicket(actor, id string, ownerOnly bool) (any, error) {
	var status string
	lookup := `SELECT status FROM support_tickets WHERE id = ?`
	args := []any{id}
	if ownerOnly {
		lookup = `SELECT status FROM support_tickets WHERE id = ? AND user_id = ?`
		args = append(args, actor)
	}
	err := s.db.QueryRow(lookup, args...).Scan(&status)
	if err == sql.ErrNoRows {
		return nil, fail(404, "NOT_FOUND", "تیکت پیدا نشد")
	}
	if err != nil {
		return nil, err
	}
	if status != "done" {
		return nil, fail(409, "POLICY", "این تیکت باز است")
	}
	next := "waiting"
	var author string
	if s.db.QueryRow(`SELECT author FROM support_messages WHERE ticket_id = ? ORDER BY created_at DESC LIMIT 1`, id).Scan(&author) == nil && author == "agent" {
		next = "open"
	}
	now := s.now().UTC().Format(time.RFC3339)
	if _, err := s.db.Exec(`UPDATE support_tickets SET status = ?, updated_at = ? WHERE id = ?`, next, now, id); err != nil {
		return nil, err
	}
	who := "user"
	if !ownerOnly {
		who = "agent"
	}
	_ = s.audit(s.db, actor, "support_reopen", "ticket", strPtr(id), nil, who)
	return map[string]any{"ok": true, "status": next}, nil
}

func nextTicketCode(q querier) (string, error) {
	var n sql.NullInt64
	if err := q.QueryRow(`SELECT MAX(CAST(code AS INTEGER)) FROM support_tickets`).Scan(&n); err != nil {
		return "", err
	}
	return fmt.Sprintf("%04d", n.Int64+1), nil
}

func (s *Service) adminIDs(q querier) []string {
	rows, err := q.Query(`SELECT user_id FROM platform_admins`)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var ids []string
	for rows.Next() {
		var id string
		if rows.Scan(&id) == nil && id != "" {
			ids = append(ids, id)
		}
	}
	return ids
}

func withoutID(ids []string, skip string) []string {
	out := make([]string, 0, len(ids))
	for _, id := range ids {
		if id != skip {
			out = append(out, id)
		}
	}
	return out
}

func uniqueTicketCodes(db *sql.DB) error {
	rows, err := db.Query(`SELECT id, code FROM support_tickets ORDER BY created_at, id`)
	if err != nil {
		return err
	}
	defer rows.Close()
	used := map[string]bool{}
	next := 1
	type fix struct{ id, code string }
	var fixes []fix
	for rows.Next() {
		var id, code string
		if err := rows.Scan(&id, &code); err != nil {
			return err
		}
		if code != "" && !used[code] {
			used[code] = true
			if n, err := strconv.Atoi(strings.TrimLeft(code, "0")); err == nil && n >= next {
				next = n + 1
			}
			continue
		}
		for used[fmt.Sprintf("%04d", next)] {
			next++
		}
		code = fmt.Sprintf("%04d", next)
		used[code] = true
		next++
		fixes = append(fixes, fix{id: id, code: code})
	}
	if err := rows.Err(); err != nil {
		return err
	}
	for _, item := range fixes {
		if _, err := db.Exec(`UPDATE support_tickets SET code = ? WHERE id = ?`, item.code, item.id); err != nil {
			return err
		}
	}
	return nil
}
