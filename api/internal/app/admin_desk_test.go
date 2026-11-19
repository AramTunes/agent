package app

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestAdminDesk(t *testing.T) {
	t.Setenv("AGENT_MEDIA", t.TempDir())
	db, err := Open(filepath.Join(t.TempDir(), "agent.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	svc := New(db)
	owner, biz := diningOwner(t, svc, "09121110001", "desk_owner", "cat-cafe")
	if _, err := svc.ClaimAdmin(owner); err != nil {
		t.Fatal(err)
	}
	other, _ := diningOwner(t, svc, "09121110002", "desk_other", "cat-cafe")
	if _, err := svc.SetPlatformAdmin(owner, map[string]any{"userId": owner, "admin": false}); err == nil {
		t.Fatal("last admin was removed")
	}
	if _, err := svc.SetPlatformAdmin(owner, map[string]any{"userId": other, "admin": true}); err != nil {
		t.Fatal(err)
	}
	token, err := svc.openSession(owner, "آزمون")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := svc.SetUserDisabled(other, map[string]any{"userId": owner, "disabled": true}); err != nil {
		t.Fatal(err)
	}
	if _, err := svc.UserID(token); err == nil {
		t.Fatal("closed session still worked")
	}
	sent, err := svc.SendCode(map[string]any{"phone": "09121110001", "purpose": "login"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := svc.SignInCode(map[string]any{"phone": "09121110001", "code": sent.(map[string]any)["code"]}); err == nil {
		t.Fatal("disabled account signed in")
	}
	if _, err := svc.DeleteCategory(other, map[string]any{"id": "cat-cafe"}); err == nil {
		t.Fatal("used category was deleted")
	}
	var before int
	if err := db.QueryRow(`SELECT COALESCE(MAX(sort), 0) FROM categories`).Scan(&before); err != nil {
		t.Fatal(err)
	}
	if _, err := svc.SaveCategory(other, map[string]any{"name": "دسته آزمون", "slug": "desk-test"}); err != nil {
		t.Fatal(err)
	}
	var sort int
	var id string
	if err := db.QueryRow(`SELECT id, sort FROM categories WHERE slug = 'desk-test'`).Scan(&id, &sort); err != nil {
		t.Fatal(err)
	}
	if sort != before+1 {
		t.Fatalf("sort %d want %d", sort, before+1)
	}
	if _, err := svc.DeleteCategory(other, map[string]any{"id": id}); err != nil {
		t.Fatal(err)
	}
	if _, err := svc.GrantSMS(other, map[string]any{"businessId": biz, "count": 10, "reason": "جبران خطا"}); err != nil {
		t.Fatal(err)
	}
	var balance int
	if err := db.QueryRow(`SELECT balance FROM sms_wallets WHERE business_id = ?`, biz).Scan(&balance); err != nil || balance != 10 {
		t.Fatalf("balance %d %v", balance, err)
	}
	found, err := svc.AdminSearch(other, map[string]any{"q": "09121110002"})
	if err != nil {
		t.Fatal(err)
	}
	users := found.(map[string]any)["users"].([]map[string]any)
	if len(users) != 1 || users[0]["phone"] != "09121110002" {
		t.Fatalf("search %#v", users)
	}
	name := "abcdef0123456789abcdef0123456789.txt"
	dir := filepath.Join(os.Getenv("AGENT_MEDIA"), biz)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, name), []byte("hi"), 0o644); err != nil {
		t.Fatal(err)
	}
	url := "/api/v1/media/" + biz + "/" + name
	if _, err := db.Exec(`UPDATE businesses SET page_blocks = ?, avatar = ? WHERE id = ?`, `[{"type":"file","value":"`+url+`"}]`, url, biz); err != nil {
		t.Fatal(err)
	}
	if _, err := svc.AdminDeleteMedia(other, map[string]any{"businessId": biz, "name": name}); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(dir, name)); !os.IsNotExist(err) {
		t.Fatal("file remained", err)
	}
	var blocks, avatar string
	if err := db.QueryRow(`SELECT page_blocks, avatar FROM businesses WHERE id = ?`, biz).Scan(&blocks, &avatar); err != nil {
		t.Fatal(err)
	}
	if avatar != "" || strings.Contains(blocks, name) {
		t.Fatalf("blocks %s avatar %s", blocks, avatar)
	}
}
