package app

import (
	"database/sql"
	"fmt"
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
	var n int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM support_tickets WHERE user_id = ?`, userID).Scan(&n); err != nil {
		return nil, err
	}
	id := newID()
	now := s.now().UTC().Format(time.RFC3339)
	code := fmt.Sprintf("%04d", n+1)
	err = s.tx(func(tx *sql.Tx) error {
		if _, err := tx.Exec(`INSERT INTO support_tickets (id, user_id, code, subject, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)`,
			id, userID, code, subject, "waiting", now, now); err != nil {
			return err
		}
		_, err := tx.Exec(`INSERT INTO support_messages (id, ticket_id, author, body, created_at) VALUES (?,?,?,?,?)`,
			newID(), id, "user", body, now)
		return err
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
		_, err := tx.Exec(`UPDATE support_tickets SET status = 'waiting', updated_at = ? WHERE id = ?`, now, id)
		return err
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
	now := s.now().UTC().Format(time.RFC3339)
	res, err := s.db.Exec(`UPDATE support_tickets SET status = 'done', updated_at = ? WHERE id = ? AND user_id = ? AND status <> 'done'`, now, id, userID)
	if err != nil {
		return nil, err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		var exists string
		err = s.db.QueryRow(`SELECT id FROM support_tickets WHERE id = ? AND user_id = ?`, id, userID).Scan(&exists)
		if err == sql.ErrNoRows {
			return nil, fail(404, "NOT_FOUND", "تیکت پیدا نشد")
		}
		if err != nil {
			return nil, err
		}
	}
	return map[string]any{"ok": true}, nil
}
