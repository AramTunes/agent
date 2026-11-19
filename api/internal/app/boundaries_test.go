package app

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestDeleteBusinessKeepsMoneyAndDropsTheRest(t *testing.T) {
	media := t.TempDir()
	t.Setenv("AGENT_MEDIA", media)
	db, err := Open(filepath.Join(t.TempDir(), "agent.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	svc := New(db)
	userID, biz, token := signupOwner(t, svc, "09124440001")
	now := svc.now().UTC().Format("2006-01-02T15:04:05Z")
	if _, err := db.Exec(`INSERT INTO customers (id, business_id, name, phone, created_at) VALUES (?,?,?,?,?)`, "cust-1", biz, "مشتری", "09120000000", now); err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`INSERT INTO services (id, business_id, name, duration_minutes) VALUES (?,?,?,30)`, "svc-1", biz, "اصلاح"); err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`INSERT INTO payments (id, business_id, user_id, gateway, kind, amount_toman, status, created_at) VALUES (?,?,?,'zarinpal','plan',100000,'paid',?)`, "pay-1", biz, userID, now); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Join(media, biz), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(media, biz, "note.txt"), []byte("secret"), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := svc.DeleteBusiness(userID, biz); err != nil {
		t.Fatal(err)
	}
	for _, table := range []string{"businesses", "customers", "services", "memberships", "sms_wallets"} {
		var n int
		query := `SELECT COUNT(*) FROM ` + table + ` WHERE id = ?`
		if table != "businesses" {
			query = `SELECT COUNT(*) FROM ` + table + ` WHERE business_id = ?`
		}
		if err := db.QueryRow(query, biz).Scan(&n); err != nil {
			t.Fatal(table, err)
		}
		if n != 0 {
			t.Fatalf("%s still has %d rows", table, n)
		}
	}
	var payments int
	if err := db.QueryRow(`SELECT COUNT(*) FROM payments WHERE business_id = ?`, biz).Scan(&payments); err != nil || payments != 1 {
		t.Fatalf("payment %d %v", payments, err)
	}
	var audits int
	if err := db.QueryRow(`SELECT COUNT(*) FROM audit_logs WHERE business_id = ? AND action = 'delete_business'`, biz).Scan(&audits); err != nil || audits != 1 {
		t.Fatalf("audit %d %v", audits, err)
	}
	if _, err := os.Stat(filepath.Join(media, biz)); !os.IsNotExist(err) {
		t.Fatalf("media dir still there: %v", err)
	}
	if _, err := svc.SaveService(userID, map[string]any{"businessId": biz, "name": "بعد از حذف", "durationMinutes": 30}); err == nil {
		t.Fatal("deleted business still accepts services")
	}
	_ = token
}

func TestManagerIsStaffAndFilesStayTyped(t *testing.T) {
	t.Setenv("AGENT_MEDIA", t.TempDir())
	db, err := Open(filepath.Join(t.TempDir(), "agent.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	svc := New(db)
	userID, biz, token := signupOwner(t, svc, "09124440002")
	if _, err := db.Exec(`UPDATE memberships SET role = 'manager' WHERE user_id = ? AND business_id = ?`, userID, biz); err != nil {
		t.Fatal(err)
	}
	if _, err := svc.SaveService(userID, map[string]any{"businessId": biz, "name": "خدمت مدیر", "durationMinutes": 30}); err == nil {
		t.Fatal("manager edited a service")
	}
	if _, _, err := svc.SavePageFile(userID, biz, strings.NewReader("<html><script>bad</script></html>"), ".jpg"); err == nil {
		t.Fatal("html accepted as jpeg")
	}
	if _, err := db.Exec(`UPDATE memberships SET role = 'owner' WHERE user_id = ? AND business_id = ?`, userID, biz); err != nil {
		t.Fatal(err)
	}
	pdfURL, _, err := svc.SavePageFile(userID, biz, strings.NewReader("%PDF-1.4\n%test"), ".pdf")
	if err != nil {
		t.Fatal(err)
	}
	pdfName := filepath.Base(pdfURL)
	if _, err := svc.OpenMedia("", biz, pdfName); err == nil {
		t.Fatal("pdf opened without login")
	}
	if _, err := svc.OpenMedia(token, biz, pdfName); err != nil {
		t.Fatal(err)
	}
	jpg := []byte{0xFF, 0xD8, 0xFF, 0xD9}
	imgURL, _, err := svc.SavePageFile(userID, biz, strings.NewReader(string(jpg)), ".jpg")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := svc.OpenMedia("", biz, filepath.Base(imgURL)); err != nil {
		t.Fatal(err)
	}
}

func TestClientIPIgnoresForwardedHeader(t *testing.T) {
	t.Setenv("AGENT_TRUST_PROXY", "")
	if got := ClientIP("1.2.3.4:9", "9.9.9.9"); got != "1.2.3.4" {
		t.Fatal(got)
	}
	t.Setenv("AGENT_TRUST_PROXY", "1")
	if got := ClientIP("1.2.3.4:9", "9.9.9.9, 8.8.8.8"); got != "9.9.9.9" {
		t.Fatal(got)
	}
}

func signupOwner(t *testing.T, svc *Service, phone string) (string, string, string) {
	t.Helper()
	sent, err := svc.SendCode(map[string]any{"phone": phone, "purpose": "signup"})
	if err != nil {
		t.Fatal(err)
	}
	code := sent.(map[string]any)["code"].(string)
	started, err := svc.StartAccount(map[string]any{
		"categoryId": "cat-beauty",
		"pageFor":    "business",
		"pageName":   "صفحه آزمون",
		"username":   "own_" + phone[7:],
		"phone":      phone,
		"code":       code,
	})
	if err != nil {
		t.Fatal(err)
	}
	token := started.(map[string]any)["token"].(string)
	userID, err := svc.UserID(token)
	if err != nil {
		t.Fatal(err)
	}
	me, err := svc.Me(userID)
	if err != nil {
		t.Fatal(err)
	}
	biz := me.(map[string]any)["memberships"].([]map[string]any)[0]["businessId"].(string)
	return userID, biz, token
}
