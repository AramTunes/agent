package app

import (
	"database/sql"

	"agent/internal/booking"
)

func (s *Service) overdueList(businessID, ownStaff string) []map[string]any {
	now := booking.ISO(s.now())
	query := `SELECT b.id, b.starts_at, b.service_id, b.staff_id, c.name, c.phone, sv.name, st.name
		FROM bookings b
		JOIN customers c ON c.id = b.customer_id
		JOIN services sv ON sv.id = b.service_id
		JOIN staff st ON st.id = b.staff_id
		WHERE b.business_id = ? AND b.status IN ('pending','confirmed') AND b.starts_at < ?`
	args := []any{businessID, now}
	if ownStaff != "" {
		query += ` AND b.staff_id = ?`
		args = append(args, ownStaff)
	}
	query += ` ORDER BY b.starts_at`
	out := []map[string]any{}
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return out
	}
	for rows.Next() {
		var id, at, serviceID, staffID, customer, phone, service, staff string
		if rows.Scan(&id, &at, &serviceID, &staffID, &customer, &phone, &service, &staff) != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "startsAt": at, "serviceId": serviceID, "staffId": staffID,
			"customer": customer, "phone": phone, "service": service, "staff": staff,
		})
	}
	rows.Close()
	return out
}

func (s *Service) ResolveFollowup(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	bookingID, _ := textOf(raw, "bookingId", 80, "")
	serviceID, _ := textOf(raw, "serviceId", 80, "")
	staffID, _ := textOf(raw, "staffId", 80, "")
	status, _ := textOf(raw, "status", 20, "")
	if status != "completed" && status != "cancelled" {
		return nil, fail(400, "VALIDATION", "وضعیت را انتخاب کنید")
	}
	var out map[string]any
	err := s.tx(func(tx *sql.Tx) error {
		row, err := s.loadBooking(tx, bookingID)
		if err != nil {
			return err
		}
		role, err := s.roleOf(tx, userID, row.BusinessID)
		if err != nil {
			return err
		}
		if role == "" {
			return fail(403, "FORBIDDEN", "به این نوبت دسترسی ندارید")
		}
		if role == "staff" {
			own, err := s.ownStaffID(tx, userID, row.BusinessID)
			if err != nil {
				return err
			}
			if own != row.StaffID {
				return fail(403, "FORBIDDEN", "فقط نوبت خودت را می‌توانی تعیین وضعیت کنی")
			}
		}
		if row.Status != "pending" && row.Status != "confirmed" {
			return fail(409, "POLICY", "وضعیت این نوبت قبلاً مشخص شده")
		}
		var serviceOK, staffOK int
		if err := tx.QueryRow(`SELECT COUNT(*) FROM services WHERE id = ? AND business_id = ?`, serviceID, row.BusinessID).Scan(&serviceOK); err != nil || serviceOK == 0 {
			return fail(400, "VALIDATION", "خدمت را انتخاب کنید")
		}
		if err := tx.QueryRow(`SELECT COUNT(*) FROM staff WHERE id = ? AND business_id = ?`, staffID, row.BusinessID).Scan(&staffOK); err != nil || staffOK == 0 {
			return fail(400, "VALIDATION", "پرسنل را انتخاب کنید")
		}
		if role == "staff" && staffID != row.StaffID {
			return fail(403, "FORBIDDEN", "پرسنل را نمی‌توانی عوض کنی")
		}
		now := s.now().UTC().Format("2006-01-02T15:04:05Z07:00")
		if _, err := tx.Exec(`UPDATE bookings SET service_id = ?, staff_id = ?, status = ?, updated_at = ? WHERE id = ?`, serviceID, staffID, status, now, bookingID); err != nil {
			return err
		}
		next, err := s.loadBooking(tx, bookingID)
		if err != nil {
			return err
		}
		out = bookDTO(next, true)
		return nil
	})
	return out, err
}
