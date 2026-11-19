package app

import (
	"path/filepath"
	"testing"
	"time"

	"agent/internal/booking"
)

func TestTableStaysHeldUntilRelease(t *testing.T) {
	db, err := Open(filepath.Join(t.TempDir(), "agent.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	svc := New(db)
	userID, biz := diningOwner(t, svc, "09125550011", "cafe_tables", "cat-cafe")
	days := []any{}
	for weekday := 0; weekday < 7; weekday++ {
		days = append(days, map[string]any{"weekday": weekday, "enabled": true, "startMin": 8 * 60, "endMin": 23 * 60})
	}
	if _, err := svc.SaveShopHours(userID, map[string]any{"businessId": biz, "days": days}); err != nil {
		t.Fatal(err)
	}
	made, err := svc.SaveDiningTable(userID, map[string]any{"businessId": biz, "number": "۴"})
	if err != nil {
		t.Fatal(err)
	}
	tableID := made.(map[string]any)["id"].(string)
	if made.(map[string]any)["number"] != "4" {
		t.Fatalf("number %v", made)
	}
	other, err := svc.SaveDiningTable(userID, map[string]any{"businessId": biz, "number": "4"})
	if err == nil {
		t.Fatal("duplicate table accepted")
	}
	_ = other
	var slug string
	if err := db.QueryRow(`SELECT slug FROM businesses WHERE id = ?`, biz).Scan(&slug); err != nil {
		t.Fatal(err)
	}
	loc, _ := booking.LoadZone("Asia/Tehran")
	day := booking.AddDaysYMD(booking.TodayYMD(loc, time.Now()), 1, loc)
	first, err := svc.ReserveTable(map[string]any{"slug": slug, "name": "مهمان تست", "phone": "09125550022", "tableId": tableID, "date": day, "time": "12:00"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := svc.ReserveTable(map[string]any{"slug": slug, "name": "مهمان دوم", "phone": "09125550033", "tableId": tableID, "date": day, "time": "18:00"}); err == nil {
		t.Fatal("held table accepted another time")
	}
	public, err := svc.PublicDining(slug)
	if err != nil {
		t.Fatal(err)
	}
	if tables, _ := public.(map[string]any)["tables"].([]map[string]any); len(tables) != 0 {
		t.Fatalf("held table still public %#v", tables)
	}
	held := svc.heldTables(biz)
	if len(held) != 1 || held[0]["id"] != first.(map[string]any)["id"] {
		t.Fatalf("follow-up %#v", held)
	}
	if _, err := svc.ReleaseTable(userID, map[string]any{"businessId": biz, "id": first.(map[string]any)["id"]}); err != nil {
		t.Fatal(err)
	}
	if again := svc.heldTables(biz); len(again) != 0 {
		t.Fatalf("still held %#v", again)
	}
	if _, err := svc.ReserveTable(map[string]any{"slug": slug, "name": "مهمان سوم", "phone": "09125550044", "tableId": tableID, "date": day, "time": "19:00"}); err != nil {
		t.Fatal(err)
	}
	beautyID, beautyBiz := diningOwner(t, svc, "09125550055", "salon_tables", "cat-beauty")
	if _, err := svc.SaveDiningTable(beautyID, map[string]any{"businessId": beautyBiz, "number": "1"}); err == nil {
		t.Fatal("salon accepted a dining table")
	}
}

func diningOwner(t *testing.T, svc *Service, phone, username, category string) (string, string) {
	t.Helper()
	sent, err := svc.SendCode(map[string]any{"phone": phone, "purpose": "signup"})
	if err != nil {
		t.Fatal(err)
	}
	started, err := svc.StartAccount(map[string]any{
		"categoryId": category,
		"pageFor":    "business",
		"pageName":   "صفحه آزمون",
		"username":   username,
		"phone":      phone,
		"code":       sent.(map[string]any)["code"],
	})
	if err != nil {
		t.Fatal(err)
	}
	userID, err := svc.UserID(started.(map[string]any)["token"].(string))
	if err != nil {
		t.Fatal(err)
	}
	me, err := svc.Me(userID)
	if err != nil {
		t.Fatal(err)
	}
	return userID, me.(map[string]any)["memberships"].([]map[string]any)[0]["businessId"].(string)
}
