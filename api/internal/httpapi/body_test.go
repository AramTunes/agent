package httpapi

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	"agent/internal/app"
)

func TestLargeJSONIsRejected(t *testing.T) {
	db, err := app.Open(filepath.Join(t.TempDir(), "agent.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	s := &Server{App: app.New(db)}
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/lookup", bytes.NewReader(bytes.Repeat([]byte("x"), (2<<20)+8)))
	rec := httptest.NewRecorder()
	s.Handler().ServeHTTP(rec, req)
	if rec.Code != 400 || !strings.Contains(rec.Body.String(), "بزرگ") {
		t.Fatalf("%d %s", rec.Code, rec.Body.String())
	}
}
