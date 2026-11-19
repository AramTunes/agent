package app

import (
	"database/sql"
	"encoding/json"
	"strings"
	"time"

	"agent/internal/booking"
)

func (s *Service) Reports(userID string, raw map[string]any) (any, error) {
	businessID, _ := textOf(raw, "businessId", 80, "")
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
	loc := mustZone(b.Timezone)
	today := booking.TodayYMD(loc, s.now())
	from, _ := textOf(raw, "from", 10, "")
	to, _ := textOf(raw, "to", 10, "")
	if from == "" {
		from = booking.AddDaysYMD(today, -29, loc)
	}
	if to == "" {
		to = today
	}
	from, err = dayOf(from)
	if err != nil {
		return nil, err
	}
	to, err = dayOf(to)
	if err != nil {
		return nil, err
	}
	if from > to {
		from, to = to, from
	}
	compare := true
	if flag, ok := raw["compare"].(bool); ok {
		compare = flag
	}
	kind := pageKind(b.CategoryID.String)
	slice := s.reportSlice(businessID, ownStaff, from, to, compare, loc, kind)
	return map[string]any{
		"from": from, "to": to, "compare": compare, "staff": role == "staff", "kind": kind,
		"timezone": b.Timezone, "today": today,
		"range": slice,
	}, nil
}

func pageKind(categoryID string) string {
	switch categoryID {
	case "cat-restaurant", "cat-cafe", "cat-fastfood":
		return "menu"
	case "cat-shop":
		return "products"
	case "cat-service":
		return "services"
	default:
		return "booking"
	}
}

func (s *Service) reportSlice(businessID, ownStaff, from, to string, compare bool, loc *time.Location, kind string) map[string]any {
	days := daysBetween(from, to, loc)
	biz, hours, weekdays := s.bookingStats(businessID, ownStaff, from, to, days, loc)
	openHours, openDays := s.openSchedule(businessID)
	if kind != "booking" {
		if shopHours, shopDays := s.shopSchedule(businessID); len(shopHours) > 0 || len(shopDays) > 0 {
			openHours, openDays = shopHours, shopDays
		}
	}
	out := map[string]any{
		"from": from, "to": to,
		"business":    biz,
		"salesHours":  packHours(hours, openHours),
		"salesDays":   packDays(weekdays, openDays),
		"scheduled":   len(openHours) > 0 || len(openDays) > 0,
		"topServices": s.topNames(businessID, ownStaff, from, to, loc, "service"),
		"topStaff":    s.topNames(businessID, ownStaff, from, to, loc, "staff"),
		"services":    s.serviceBreakdown(businessID, ownStaff, from, to, loc),
		"staffStats":  s.staffBreakdown(businessID, ownStaff, from, to, loc),
		"groups":      s.groupBreakdown(businessID, ownStaff, from, to, loc),
		"customers":   s.customerSplit(businessID, ownStaff, from, to, loc),
	}
	if kind != "booking" {
		orders, orderHours, orderDays := s.orderStats(businessID, from, to, days, loc)
		out["orders"] = orders
		out["salesHours"] = packHours(orderHours, openHours)
		out["salesDays"] = packDays(orderDays, openDays)
		out["topItems"] = s.topItems(businessID, from, to, loc)
	}
	var visits map[string]any
	if ownStaff == "" {
		visits = s.visitStats(businessID, from, to, days, loc)
		if kind == "booking" {
			visits["converted"] = s.onlineBookings(businessID, from, to, loc)
		} else if orders, ok := out["orders"].(map[string]any); ok {
			visits["converted"] = orders["total"]
		}
		visits["unique"] = s.uniqueVisitors(businessID, from, to)
		out["visits"] = visits
	} else {
		out["visits"] = nil
	}
	if !compare || len(days) == 0 {
		return out
	}
	prevTo := booking.AddDaysYMD(from, -1, loc)
	prevFrom := booking.AddDaysYMD(prevTo, -(len(days) - 1), loc)
	prevDays := daysBetween(prevFrom, prevTo, loc)
	prevBiz, _, _ := s.bookingStats(businessID, ownStaff, prevFrom, prevTo, prevDays, loc)
	biz["prev"] = map[string]any{
		"total": prevBiz["total"], "cancelled": prevBiz["cancelled"], "completed": prevBiz["completed"],
		"missed": prevBiz["missed"], "revenue": prevBiz["revenue"],
	}
	if visits != nil {
		prevVisits := s.visitStats(businessID, prevFrom, prevTo, prevDays, loc)
		visits["prev"] = map[string]any{
			"views": prevVisits["views"], "visitors": prevVisits["visitors"], "clicks": prevVisits["clicks"],
		}
		if kind == "booking" {
			visits["prevConverted"] = s.onlineBookings(businessID, prevFrom, prevTo, loc)
		} else {
			prevOrders, _, _ := s.orderStats(businessID, prevFrom, prevTo, prevDays, loc)
			if orders, ok := out["orders"].(map[string]any); ok {
				orders["prev"] = map[string]any{
					"total": prevOrders["total"], "revenue": prevOrders["revenue"],
					"cancelled": prevOrders["cancelled"], "average": prevOrders["average"], "repeat": prevOrders["repeat"],
				}
			}
			visits["prevConverted"] = prevOrders["total"]
		}
		visits["prevUnique"] = s.uniqueVisitors(businessID, prevFrom, prevTo)
	} else if kind != "booking" {
		prevOrders, _, _ := s.orderStats(businessID, prevFrom, prevTo, prevDays, loc)
		if orders, ok := out["orders"].(map[string]any); ok {
			orders["prev"] = map[string]any{
				"total": prevOrders["total"], "revenue": prevOrders["revenue"],
				"cancelled": prevOrders["cancelled"], "average": prevOrders["average"], "repeat": prevOrders["repeat"],
			}
		}
	}
	return out
}

func daysBetween(from, to string, loc *time.Location) []string {
	out := []string{}
	for day := from; day <= to && len(out) < 8000; day = booking.AddDaysYMD(day, 1, loc) {
		out = append(out, day)
		if day == to {
			break
		}
	}
	return out
}

func bucketIndex(days []string) (map[string]int, int) {
	n := len(days)
	buckets := n
	if buckets > 366 {
		buckets = 366
	}
	index := map[string]int{}
	if n == 0 {
		return index, 0
	}
	for i, day := range days {
		index[day] = i * buckets / n
	}
	return index, buckets
}

func (s *Service) bookingStats(businessID, ownStaff, from, to string, days []string, loc *time.Location) (map[string]any, []int, []int) {
	index, n := bucketIndex(days)
	series := make([]int, n)
	doneSeries := make([]int, n)
	hours := make([]int, 24)
	weekdays := make([]int, 7)
	total, cancelled, completed, missed, revenue := 0, 0, 0, 0, 0
	start := booking.ISO(booking.AtLocalMinute(from, 0, loc))
	end := booking.ISO(booking.AtLocalMinute(to, 1440, loc))
	query := `SELECT b.status, b.starts_at, COALESCE(b.price_toman, 0)
		FROM bookings b LEFT JOIN services sv ON sv.id = b.service_id
		WHERE b.business_id = ? AND b.starts_at >= ? AND b.starts_at < ?`
	args := []any{businessID, start, end}
	if ownStaff != "" {
		query += ` AND b.staff_id = ?`
		args = append(args, ownStaff)
	}
	rows, err := s.db.Query(query, args...)
	if err == nil {
		for rows.Next() {
			var status, at string
			var price int
			if rows.Scan(&status, &at, &price) != nil {
				continue
			}
			when, err := time.Parse(time.RFC3339Nano, at)
			if err != nil {
				when, err = time.Parse(time.RFC3339, at)
			}
			if err != nil {
				continue
			}
			local := when.In(loc)
			day := booking.TodayYMD(loc, local)
			total++
			switch status {
			case "cancelled":
				cancelled++
			case "no_show":
				missed++
			case "completed":
				completed++
				revenue += price
			}
			if status != "cancelled" && status != "no_show" {
				hours[local.Hour()]++
				weekdays[int(local.Weekday())]++
			}
			if i, ok := index[day]; ok {
				series[i]++
				if status == "completed" {
					doneSeries[i]++
				}
			}
		}
		rows.Close()
	}
	return map[string]any{
		"total": total, "cancelled": cancelled, "completed": completed, "missed": missed, "revenue": revenue,
		"series": series, "done": doneSeries,
	}, hours, weekdays
}

func (s *Service) visitStats(businessID, from, to string, days []string, loc *time.Location) map[string]any {
	index, n := bucketIndex(days)
	viewsSeries := make([]int, n)
	visitorSeries := make([]int, n)
	views, visitors := 0, 0
	weekdays := make([]int, 7)
	rows, err := s.db.Query(`SELECT day, views, visitors FROM page_view_days WHERE business_id = ? AND day >= ? AND day <= ?`, businessID, from, to)
	if err == nil {
		for rows.Next() {
			var day string
			var v, u int
			if rows.Scan(&day, &v, &u) != nil {
				continue
			}
			views += v
			visitors += u
			if i, ok := index[day]; ok {
				viewsSeries[i] += v
				visitorSeries[i] += u
			}
			if len(day) >= 10 {
				weekdays[booking.WeekdayOfYMD(day, loc)] += v
			}
		}
		rows.Close()
	}
	clicks := 0
	_ = s.db.QueryRow(`SELECT COALESCE(SUM(clicks), 0) FROM page_clicks WHERE business_id = ? AND day >= ? AND day <= ?`, businessID, from, to).Scan(&clicks)
	dwellSeconds, dwellSamples := 0, 0
	_ = s.db.QueryRow(`SELECT COALESCE(SUM(seconds), 0), COALESCE(SUM(samples), 0) FROM page_dwell WHERE business_id = ? AND day >= ? AND day <= ?`, businessID, from, to).Scan(&dwellSeconds, &dwellSamples)
	hours := make([]int, 24)
	hrows, herr := s.db.Query(`SELECT hour, SUM(views) FROM page_view_hours WHERE business_id = ? AND day >= ? AND day <= ? GROUP BY hour`, businessID, from, to)
	if herr == nil {
		for hrows.Next() {
			var hour, n int
			if hrows.Scan(&hour, &n) == nil && hour >= 0 && hour < 24 {
				hours[hour] = n
			}
		}
		hrows.Close()
	}
	return map[string]any{
		"views": views, "visitors": visitors, "clicks": clicks,
		"dwellSeconds": dwellSeconds, "dwellSamples": dwellSamples,
		"series": viewsSeries, "visitorsSeries": visitorSeries,
		"hours": hours, "weekdays": weekdays,
		"sources":   s.facetList(businessID, "source", from, to),
		"countries": s.facetList(businessID, "country", from, to),
		"cities":    s.facetList(businessID, "city", from, to),
		"devices":   s.facetList(businessID, "device", from, to),
		"blocks":    s.blockViews(businessID, from, to),
	}
}

func (s *Service) facetList(businessID, kind, from, to string) []map[string]any {
	out := []map[string]any{}
	rows, err := s.db.Query(`SELECT label, SUM(views) FROM page_facets WHERE business_id = ? AND kind = ? AND day >= ? AND day <= ? GROUP BY label ORDER BY SUM(views) DESC LIMIT 8`, businessID, kind, from, to)
	if err != nil {
		return out
	}
	for rows.Next() {
		var label string
		var n int
		if rows.Scan(&label, &n) == nil && label != "" {
			out = append(out, map[string]any{"label": label, "value": n})
		}
	}
	rows.Close()
	return out
}

func (s *Service) blockViews(businessID, from, to string) []map[string]any {
	out := []map[string]any{}
	rows, err := s.db.Query(`SELECT label, SUM(views) FROM page_block_views WHERE business_id = ? AND day >= ? AND day <= ? GROUP BY block_id ORDER BY SUM(views) DESC LIMIT 8`, businessID, from, to)
	if err != nil {
		return out
	}
	for rows.Next() {
		var label string
		var n int
		if rows.Scan(&label, &n) == nil && label != "" {
			out = append(out, map[string]any{"label": label, "value": n})
		}
	}
	rows.Close()
	return out
}

func (s *Service) openSchedule(businessID string) ([]int, []int) {
	hours := map[int]bool{}
	days := map[int]bool{}
	rows, err := s.db.Query(`SELECT wh.weekday, wh.start_min, wh.end_min FROM working_hours wh JOIN staff st ON st.id = wh.staff_id WHERE st.business_id = ?`, businessID)
	if err != nil {
		return nil, nil
	}
	for rows.Next() {
		var weekday, start, end int
		if rows.Scan(&weekday, &start, &end) != nil {
			continue
		}
		if weekday >= 0 && weekday < 7 {
			days[weekday] = true
		}
		for minute := start; minute < end; minute += 60 {
			hour := minute / 60
			if hour >= 0 && hour < 24 {
				hours[hour] = true
			}
		}
	}
	rows.Close()
	return keysOf(hours), keysOf(days)
}

func (s *Service) shopSchedule(businessID string) ([]int, []int) {
	hours := map[int]bool{}
	days := map[int]bool{}
	rows, err := s.db.Query(`SELECT weekday, start_min, end_min FROM shop_hours WHERE business_id = ?`, businessID)
	if err != nil {
		return nil, nil
	}
	for rows.Next() {
		var weekday, start, end int
		if rows.Scan(&weekday, &start, &end) != nil {
			continue
		}
		if weekday >= 0 && weekday < 7 {
			days[weekday] = true
		}
		for minute := start; minute < end; minute += 60 {
			hour := minute / 60
			if hour >= 0 && hour < 24 {
				hours[hour] = true
			}
		}
	}
	rows.Close()
	return keysOf(hours), keysOf(days)
}

func keysOf(set map[int]bool) []int {
	out := make([]int, 0, len(set))
	for i := 0; i < 24; i++ {
		if set[i] {
			out = append(out, i)
		}
	}
	return out
}

func packHours(counts []int, hours []int) []map[string]any {
	if len(hours) == 0 {
		for i, n := range counts {
			if n > 0 {
				hours = append(hours, i)
			}
		}
	}
	out := []map[string]any{}
	for _, hour := range hours {
		value := 0
		if hour >= 0 && hour < len(counts) {
			value = counts[hour]
		}
		out = append(out, map[string]any{"label": hour, "value": value})
	}
	return out
}

func packDays(counts []int, days []int) []map[string]any {
	out := []map[string]any{}
	order := []int{6, 0, 1, 2, 3, 4, 5}
	open := map[int]bool{}
	if len(days) == 0 {
		for i, n := range counts {
			if n > 0 {
				open[i] = true
			}
		}
	}
	for _, day := range days {
		open[day] = true
	}
	for _, day := range order {
		if !open[day] {
			continue
		}
		value := 0
		if day >= 0 && day < len(counts) {
			value = counts[day]
		}
		out = append(out, map[string]any{"label": day, "value": value})
	}
	return out
}

func (s *Service) onlineBookings(businessID, from, to string, loc *time.Location) int {
	start := booking.ISO(booking.AtLocalMinute(from, 0, loc))
	end := booking.ISO(booking.AtLocalMinute(to, 1440, loc))
	var n int
	_ = s.db.QueryRow(`SELECT COUNT(*) FROM bookings WHERE business_id = ? AND source = 'online' AND status <> 'cancelled' AND starts_at >= ? AND starts_at < ?`, businessID, start, end).Scan(&n)
	return n
}

func (s *Service) uniqueVisitors(businessID, from, to string) int {
	var n int
	_ = s.db.QueryRow(`SELECT COUNT(DISTINCT visitor) FROM page_view_visitors WHERE business_id = ? AND day >= ? AND day <= ?`, businessID, from, to).Scan(&n)
	return n
}

func (s *Service) topNames(businessID, ownStaff, from, to string, loc *time.Location, which string) []map[string]any {
	start := booking.ISO(booking.AtLocalMinute(from, 0, loc))
	end := booking.ISO(booking.AtLocalMinute(to, 1440, loc))
	column := "sv.name"
	join := "JOIN services sv ON sv.id = b.service_id"
	if which == "staff" {
		column = "st.name"
		join = "JOIN staff st ON st.id = b.staff_id"
	}
	query := `SELECT ` + column + `, COUNT(*) FROM bookings b ` + join + ` WHERE b.business_id = ? AND b.status <> 'cancelled' AND b.starts_at >= ? AND b.starts_at < ?`
	args := []any{businessID, start, end}
	if ownStaff != "" {
		query += ` AND b.staff_id = ?`
		args = append(args, ownStaff)
	}
	query += ` GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 6`
	return s.pairQuery(query, args...)
}

func (s *Service) pairQuery(query string, args ...any) []map[string]any {
	out := []map[string]any{}
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return out
	}
	for rows.Next() {
		var label string
		var n int
		if rows.Scan(&label, &n) == nil && label != "" {
			out = append(out, map[string]any{"label": label, "value": n})
		}
	}
	rows.Close()
	return out
}

func (s *Service) orderStats(businessID, from, to string, days []string, loc *time.Location) (map[string]any, []int, []int) {
	index, n := bucketIndex(days)
	series := make([]int, n)
	hours := make([]int, 24)
	weekdays := make([]int, 7)
	total, revenue, cancelled, pricedCount := 0, 0, 0, 0
	exact := true
	start := booking.ISO(booking.AtLocalMinute(from, 0, loc))
	end := booking.ISO(booking.AtLocalMinute(to, 1440, loc))
	rows, err := s.db.Query(`SELECT created_at, COALESCE(fulfill_at, ''), price, status, priced, currency FROM menu_orders WHERE business_id = ? AND created_at >= ? AND created_at < ?`, businessID, start, end)
	if err == nil {
		for rows.Next() {
			var at, fulfill, status, currency string
			var price, priced int
			if rows.Scan(&at, &fulfill, &price, &status, &priced, &currency) != nil {
				continue
			}
			created, ok := parseInstant(at)
			if !ok {
				continue
			}
			if status == "cancelled" {
				cancelled++
				continue
			}
			local := created.In(loc)
			day := booking.TodayYMD(loc, local)
			total++
			if amount, counted := countableToman(price, priced, currency); counted {
				revenue += amount
				pricedCount++
			} else {
				exact = false
			}
			busy := local
			if when, ok := parseLocalClock(fulfill, loc); ok {
				busy = when
			}
			hours[busy.Hour()]++
			weekdays[int(busy.Weekday())]++
			if i, ok := index[day]; ok {
				series[i]++
			}
		}
		rows.Close()
	}
	average := 0
	if pricedCount > 0 {
		average = revenue / pricedCount
	}
	peak, peakValue := -1, 0
	for hour, value := range hours {
		if value > peakValue {
			peak, peakValue = hour, value
		}
	}
	return map[string]any{
		"total": total, "revenue": revenue, "series": series, "exact": exact,
		"cancelled": cancelled, "average": average, "peakHour": peak, "repeat": s.repeatBuyers(businessID, start, end),
	}, hours, weekdays
}

func (s *Service) topItems(businessID, from, to string, loc *time.Location) []map[string]any {
	start := booking.ISO(booking.AtLocalMinute(from, 0, loc))
	end := booking.ISO(booking.AtLocalMinute(to, 1440, loc))
	counts := map[string]int{}
	rows, err := s.db.Query(`SELECT lines, item_title FROM menu_orders WHERE business_id = ? AND status <> 'cancelled' AND created_at >= ? AND created_at < ?`, businessID, start, end)
	if err != nil {
		return []map[string]any{}
	}
	for rows.Next() {
		var lines, title string
		if rows.Scan(&lines, &title) != nil {
			continue
		}
		var parsed []struct {
			Title string `json:"title"`
			Qty   int    `json:"qty"`
		}
		if json.Unmarshal([]byte(lines), &parsed) == nil && len(parsed) > 0 {
			for _, line := range parsed {
				n := line.Qty
				if n < 1 {
					n = 1
				}
				if line.Title != "" {
					counts[line.Title] += n
				}
			}
			continue
		}
		if title != "" && !strings.Contains(title, "مورد دیگر") {
			counts[title]++
		}
	}
	rows.Close()
	out := []map[string]any{}
	for len(out) < 6 && len(counts) > 0 {
		best, n := "", 0
		for label, value := range counts {
			if value > n {
				best, n = label, value
			}
		}
		out = append(out, map[string]any{"label": best, "value": n})
		delete(counts, best)
	}
	return out
}

func parseInstant(value string) (time.Time, bool) {
	if t, err := time.Parse(time.RFC3339Nano, value); err == nil {
		return t, true
	}
	if t, err := time.Parse(time.RFC3339, value); err == nil {
		return t, true
	}
	return time.Time{}, false
}

func parseLocalClock(value string, loc *time.Location) (time.Time, bool) {
	if strings.TrimSpace(value) == "" {
		return time.Time{}, false
	}
	if t, err := time.ParseInLocation("2006-01-02 15:04", value, loc); err == nil {
		return t, true
	}
	return time.Time{}, false
}

func (s *Service) repeatBuyers(businessID, start, end string) int {
	rows, err := s.db.Query(`SELECT phone, MIN(CASE WHEN status <> 'cancelled' THEN created_at END), SUM(CASE WHEN created_at >= ? AND created_at < ? AND status <> 'cancelled' THEN 1 ELSE 0 END) FROM menu_orders WHERE business_id = ? GROUP BY phone`, start, end, businessID)
	if err != nil {
		return 0
	}
	repeat := 0
	for rows.Next() {
		var phone string
		var first sql.NullString
		var inRange int
		if rows.Scan(&phone, &first, &inRange) != nil || phone == "" || inRange == 0 || !first.Valid {
			continue
		}
		if inRange > 1 || first.String < start {
			repeat++
		}
	}
	rows.Close()
	return repeat
}

func (s *Service) serviceBreakdown(businessID, ownStaff, from, to string, loc *time.Location) []map[string]any {
	start := booking.ISO(booking.AtLocalMinute(from, 0, loc))
	end := booking.ISO(booking.AtLocalMinute(to, 1440, loc))
	query := `SELECT sv.name,
		SUM(CASE WHEN b.status = 'completed' THEN COALESCE(b.price_toman, 0) ELSE 0 END),
		SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END),
		COUNT(*)
		FROM bookings b JOIN services sv ON sv.id = b.service_id
		WHERE b.business_id = ? AND b.starts_at >= ? AND b.starts_at < ?`
	args := []any{businessID, start, end}
	if ownStaff != "" {
		query += ` AND b.staff_id = ?`
		args = append(args, ownStaff)
	}
	query += ` GROUP BY sv.id ORDER BY 2 DESC`
	rows, err := s.db.Query(query, args...)
	out := []map[string]any{}
	if err != nil {
		return out
	}
	for rows.Next() {
		var label string
		var revenue, cancelled, total int
		if rows.Scan(&label, &revenue, &cancelled, &total) != nil || label == "" {
			continue
		}
		out = append(out, map[string]any{"label": label, "revenue": revenue, "cancelled": cancelled, "total": total})
	}
	rows.Close()
	return out
}

func (s *Service) staffBreakdown(businessID, ownStaff, from, to string, loc *time.Location) []map[string]any {
	start := booking.ISO(booking.AtLocalMinute(from, 0, loc))
	end := booking.ISO(booking.AtLocalMinute(to, 1440, loc))
	query := `SELECT st.id, st.name,
		SUM(CASE WHEN b.status = 'completed' THEN COALESCE(b.price_toman, 0) ELSE 0 END),
		SUM(CASE WHEN b.status = 'no_show' THEN 1 ELSE 0 END),
		COUNT(*)
		FROM bookings b JOIN staff st ON st.id = b.staff_id
		LEFT JOIN services sv ON sv.id = b.service_id
		WHERE b.business_id = ? AND b.starts_at >= ? AND b.starts_at < ?`
	args := []any{businessID, start, end}
	if ownStaff != "" {
		query += ` AND b.staff_id = ?`
		args = append(args, ownStaff)
	}
	query += ` GROUP BY st.id ORDER BY 3 DESC`
	rows, err := s.db.Query(query, args...)
	out := []map[string]any{}
	if err != nil {
		return out
	}
	type staffRow struct {
		id, label          string
		revenue, missed, n int
	}
	parsed := []staffRow{}
	for rows.Next() {
		var row staffRow
		if rows.Scan(&row.id, &row.label, &row.revenue, &row.missed, &row.n) != nil || row.label == "" {
			continue
		}
		parsed = append(parsed, row)
	}
	rows.Close()
	hours := s.staffHours(businessID, ownStaff, start, end, loc)
	for _, row := range parsed {
		out = append(out, map[string]any{
			"label": row.label, "revenue": row.revenue, "missed": row.missed, "total": row.n,
			"hours": hours[row.id],
		})
	}
	return out
}

func (s *Service) staffHours(businessID, ownStaff, start, end string, loc *time.Location) map[string][]map[string]any {
	open := map[string]map[int]bool{}
	rows, err := s.db.Query(`SELECT wh.staff_id, wh.start_min, wh.end_min FROM working_hours wh JOIN staff st ON st.id = wh.staff_id WHERE st.business_id = ?`, businessID)
	if err == nil {
		for rows.Next() {
			var id string
			var startMin, endMin int
			if rows.Scan(&id, &startMin, &endMin) != nil {
				continue
			}
			if open[id] == nil {
				open[id] = map[int]bool{}
			}
			for minute := startMin; minute < endMin; minute += 60 {
				hour := minute / 60
				if hour >= 0 && hour < 24 {
					open[id][hour] = true
				}
			}
		}
		rows.Close()
	}
	counts := map[string][]int{}
	query := `SELECT staff_id, starts_at FROM bookings WHERE business_id = ? AND status <> 'cancelled' AND starts_at >= ? AND starts_at < ?`
	args := []any{businessID, start, end}
	if ownStaff != "" {
		query += ` AND staff_id = ?`
		args = append(args, ownStaff)
	}
	brows, err := s.db.Query(query, args...)
	if err == nil {
		for brows.Next() {
			var id, at string
			if brows.Scan(&id, &at) != nil {
				continue
			}
			when, err := time.Parse(time.RFC3339Nano, at)
			if err != nil {
				when, err = time.Parse(time.RFC3339, at)
			}
			if err != nil {
				continue
			}
			if counts[id] == nil {
				counts[id] = make([]int, 24)
			}
			counts[id][when.In(loc).Hour()]++
		}
		brows.Close()
	}
	out := map[string][]map[string]any{}
	seen := map[string]bool{}
	for id := range counts {
		seen[id] = true
	}
	for id := range open {
		seen[id] = true
	}
	for id := range seen {
		slots := []map[string]any{}
		allowed := open[id]
		for hour := 0; hour < 24; hour++ {
			if allowed != nil && !allowed[hour] {
				continue
			}
			value := 0
			if counts[id] != nil {
				value = counts[id][hour]
			}
			if allowed == nil && value == 0 {
				continue
			}
			slots = append(slots, map[string]any{"label": hour, "value": value})
		}
		out[id] = slots
	}
	return out
}

func (s *Service) groupBreakdown(businessID, ownStaff, from, to string, loc *time.Location) []map[string]any {
	start := booking.ISO(booking.AtLocalMinute(from, 0, loc))
	end := booking.ISO(booking.AtLocalMinute(to, 1440, loc))
	query := `SELECT CASE WHEN TRIM(c.group_name) = '' OR c.group_name = 'بدون گروه' THEN 'بدون گروه' ELSE c.group_name END,
		COUNT(*),
		SUM(CASE WHEN b.status = 'completed' THEN COALESCE(b.price_toman, 0) ELSE 0 END)
		FROM bookings b
		JOIN customers c ON c.id = b.customer_id
		LEFT JOIN services sv ON sv.id = b.service_id
		WHERE b.business_id = ? AND b.status <> 'cancelled' AND b.starts_at >= ? AND b.starts_at < ?`
	args := []any{businessID, start, end}
	if ownStaff != "" {
		query += ` AND b.staff_id = ?`
		args = append(args, ownStaff)
	}
	query += ` GROUP BY 1 ORDER BY 2 DESC`
	rows, err := s.db.Query(query, args...)
	out := []map[string]any{}
	if err != nil {
		return out
	}
	for rows.Next() {
		var label string
		var total, revenue int
		if rows.Scan(&label, &total, &revenue) != nil {
			continue
		}
		out = append(out, map[string]any{"label": label, "total": total, "revenue": revenue})
	}
	rows.Close()
	return out
}

func (s *Service) customerSplit(businessID, ownStaff, from, to string, loc *time.Location) map[string]any {
	start := booking.ISO(booking.AtLocalMinute(from, 0, loc))
	end := booking.ISO(booking.AtLocalMinute(to, 1440, loc))
	query := `SELECT MIN(starts_at), SUM(CASE WHEN starts_at >= ? AND starts_at < ? THEN 1 ELSE 0 END) FROM bookings WHERE business_id = ? AND status <> 'cancelled'`
	args := []any{start, end, businessID}
	if ownStaff != "" {
		query += ` AND staff_id = ?`
		args = append(args, ownStaff)
	}
	query += ` GROUP BY customer_id`
	rows, err := s.db.Query(query, args...)
	fresh, returning := 0, 0
	if err != nil {
		return map[string]any{"fresh": 0, "returning": 0}
	}
	for rows.Next() {
		var first string
		var inRange int
		if rows.Scan(&first, &inRange) != nil || inRange == 0 {
			continue
		}
		if first >= start {
			fresh++
		} else {
			returning++
		}
	}
	rows.Close()
	return map[string]any{"fresh": fresh, "returning": returning}
}
