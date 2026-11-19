package app

import (
	"net/url"
	"path/filepath"
	"testing"
	"time"
)

func TestCommerceLockAndPaymentExtend(t *testing.T) {
	t.Setenv("ZARINPAL_MERCHANT_ID", "merchant-test")
	db, err := Open(filepath.Join(t.TempDir(), "agent.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	svc := New(db)
	userID, biz := diningOwner(t, svc, "09127770011", "bill_cafe", "cat-cafe")
	if err := svc.commerceOpen(svc.db, biz); err != nil {
		t.Fatal(err)
	}
	var trial string
	if err := db.QueryRow(`SELECT trial_ends_at FROM subscriptions WHERE business_id = ?`, biz).Scan(&trial); err != nil {
		t.Fatal(err)
	}
	if trial != "" {
		t.Fatal("trial started before a gateway was enabled")
	}
	if _, err := db.Exec(`INSERT INTO platform_settings (key, value, updated_at) VALUES ('gateway_zarinpal','1', ?)`, time.Now().UTC().Format(time.RFC3339)); err != nil {
		t.Fatal(err)
	}
	if err := svc.commerceOpen(svc.db, biz); err != nil {
		t.Fatal(err)
	}
	if err := db.QueryRow(`SELECT trial_ends_at FROM subscriptions WHERE business_id = ?`, biz).Scan(&trial); err != nil || trial == "" {
		t.Fatal(trial, err)
	}
	past := time.Now().Add(-time.Hour).UTC().Format(time.RFC3339)
	if _, err := db.Exec(`UPDATE subscriptions SET trial_ends_at = ? WHERE business_id = ?`, past, biz); err != nil {
		t.Fatal(err)
	}
	if err := svc.commerceOpen(svc.db, biz); err == nil {
		t.Fatal("expired trial still open")
	}
	pay := newID()
	if _, err := db.Exec(`INSERT INTO payments (id, business_id, user_id, gateway, kind, term_months, sms_count, amount_toman, status, return_origin, created_at) VALUES (?,?,?,'zarinpal','plan',1,0,100000,'pending','https://example.com',?)`,
		pay, biz, userID, time.Now().UTC().Format(time.RFC3339)); err != nil {
		t.Fatal(err)
	}
	if err := svc.applyPaid(db, pay, "100"); err != nil {
		t.Fatal(err)
	}
	if err := svc.applyPaid(db, pay, "100"); err != nil {
		t.Fatal(err)
	}
	if err := svc.commerceOpen(svc.db, biz); err != nil {
		t.Fatal(err)
	}
	var ends string
	var balance int
	if err := db.QueryRow(`SELECT plan_ends_at FROM subscriptions WHERE business_id = ?`, biz).Scan(&ends); err != nil || ends == "" {
		t.Fatal(ends, err)
	}
	sms := newID()
	if _, err := db.Exec(`INSERT INTO payments (id, business_id, user_id, gateway, kind, term_months, sms_count, amount_toman, status, return_origin, created_at) VALUES (?,?,?,'zarinpal','sms',0,100,170000,'pending','https://example.com',?)`,
		sms, biz, userID, time.Now().UTC().Format(time.RFC3339)); err != nil {
		t.Fatal(err)
	}
	if err := svc.applyPaid(db, sms, "200"); err != nil {
		t.Fatal(err)
	}
	if err := db.QueryRow(`SELECT balance FROM sms_wallets WHERE business_id = ?`, biz).Scan(&balance); err != nil || balance != 100 {
		t.Fatalf("balance %d %v", balance, err)
	}
	if cleanToken("کافه  نیل  ۱۲!", 8, 18) != "کافه نیل ۱۲" {
		t.Fatal(cleanToken("کافه  نیل  ۱۲!", 8, 18))
	}
	foreign := newID()
	if _, err := db.Exec(`INSERT INTO payments (id, business_id, user_id, gateway, kind, term_months, sms_count, amount_toman, authority, status, return_origin, created_at) VALUES (?,?,?,'zarinpal','plan',1,0,100000,'AUTH1','pending','https://example.com',?)`,
		foreign, biz, userID, time.Now().UTC().Format(time.RFC3339)); err != nil {
		t.Fatal(err)
	}
	loc := svc.FinishPayment("zarinpal", mapValues("payment", foreign, "Status", "OK", "Authority", "OTHER"))
	if loc != "https://example.com/panel/settings?pay=failed" {
		t.Fatal(loc)
	}
	var status string
	if err := db.QueryRow(`SELECT status FROM payments WHERE id = ?`, foreign).Scan(&status); err != nil || status != "pending" {
		t.Fatalf("status %s %v", status, err)
	}
}

func mapValues(pairs ...string) url.Values {
	v := url.Values{}
	for i := 0; i+1 < len(pairs); i += 2 {
		v.Set(pairs[i], pairs[i+1])
	}
	return v
}
