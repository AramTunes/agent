package httpapi

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"agent/internal/app"
)

type Server struct {
	App *app.Service
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		writeOK(w, map[string]any{"service": "agent", "time": "ok"})
	})
	mux.HandleFunc("POST /api/v1/media", func(w http.ResponseWriter, r *http.Request) {
		id, err := s.App.UserID(bearer(r))
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, 48<<20)
		if err := r.ParseMultipartForm(8 << 20); err != nil {
			s.ok(w, nil, uploadErr(err))
			return
		}
		file, header, err := r.FormFile("file")
		if err != nil {
			s.ok(w, nil, app.MediaError("فایل را انتخاب کنید"))
			return
		}
		defer file.Close()
		if r.FormValue("kind") == "file" {
			ext := docExt(header.Header.Get("Content-Type"), header.Filename)
			url, size, err := s.App.SavePageFile(id, r.FormValue("businessId"), file, ext)
			s.ok(w, map[string]any{"url": url, "size": size}, err)
			return
		}
		ext := videoExt(header.Header.Get("Content-Type"), header.Filename)
		url, err := s.App.SavePageVideo(id, r.FormValue("businessId"), file, ext)
		s.ok(w, map[string]any{"url": url}, err)
	})
	mux.HandleFunc("GET /api/v1/media/{businessId}/{name}", func(w http.ResponseWriter, r *http.Request) {
		path, err := s.App.OpenMedia(requestToken(r), r.PathValue("businessId"), r.PathValue("name"))
		if err != nil {
			http.NotFound(w, r)
			return
		}
		serveStored(w, r, path)
	})
	mux.HandleFunc("GET /api/v1/categories", func(w http.ResponseWriter, r *http.Request) {
		s.send(w, func() (any, error) { return s.App.ListCategories() })
	})
	mux.HandleFunc("GET /api/v1/businesses", func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		limit, _ := strconv.Atoi(q.Get("limit"))
		offset, _ := strconv.Atoi(q.Get("offset"))
		s.send(w, func() (any, error) { return s.App.ListBusinesses(q.Get("q"), q.Get("category"), limit, offset) })
	})
	mux.HandleFunc("GET /api/v1/business/{slug}", func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		country, city := app.LookupPlace(app.ClientIP(r.RemoteAddr, r.Header.Get("X-Forwarded-For")))
		if country == "" {
			country = app.CountryFromZone(q.Get("tz"))
		}
		s.send(w, func() (any, error) {
			return s.App.PublicBusiness(r.PathValue("slug"), q.Get("v"), q.Get("src"), q.Get("device"), country, city)
		})
	})
	mux.HandleFunc("POST /api/v1/business/{slug}/click", func(w http.ResponseWriter, r *http.Request) {
		s.send(w, func() (any, error) { return s.App.NoteClick(r.PathValue("slug")) })
	})
	mux.HandleFunc("POST /api/v1/business/{slug}/stay", func(w http.ResponseWriter, r *http.Request) {
		raw, err := body(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		seconds := 0
		switch n := raw["seconds"].(type) {
		case float64:
			seconds = int(n)
		}
		s.send(w, func() (any, error) { return s.App.NoteStay(r.PathValue("slug"), seconds) })
	})
	mux.HandleFunc("POST /api/v1/business/{slug}/block", func(w http.ResponseWriter, r *http.Request) {
		raw, err := body(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		id, _ := raw["id"].(string)
		label, _ := raw["label"].(string)
		s.send(w, func() (any, error) { return s.App.NoteBlock(r.PathValue("slug"), id, label) })
	})
	mux.HandleFunc("GET /api/v1/business/{slug}/tables", func(w http.ResponseWriter, r *http.Request) {
		s.send(w, func() (any, error) { return s.App.PublicDining(r.PathValue("slug")) })
	})
	mux.HandleFunc("POST /api/v1/table-reservations", func(w http.ResponseWriter, r *http.Request) {
		raw, err := body(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		s.send(w, func() (any, error) { return s.App.ReserveTable(raw) })
	})
	mux.HandleFunc("POST /api/v1/menu-orders", func(w http.ResponseWriter, r *http.Request) {
		raw, err := body(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		raw["origin"] = requestOrigin(r)
		s.send(w, func() (any, error) { return s.App.PlaceMenuOrder(raw) })
	})
	mux.HandleFunc("GET /api/v1/receipts/{token}", func(w http.ResponseWriter, r *http.Request) {
		s.send(w, func() (any, error) { return s.App.Receipt(r.PathValue("token")) })
	})
	mux.HandleFunc("GET /api/v1/availability", func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		s.send(w, func() (any, error) {
			return s.App.Availability(map[string]any{
				"businessId": q.Get("businessId"), "serviceId": q.Get("serviceId"), "staffId": q.Get("staffId"), "day": q.Get("day"), "exceptBookingId": q.Get("exceptBookingId"),
			})
		})
	})
	mux.HandleFunc("GET /api/v1/session", func(w http.ResponseWriter, r *http.Request) {
		user, _ := s.App.Session(bearer(r))
		writeOK(w, map[string]any{"user": user})
	})
	mux.HandleFunc("POST /api/v1/auth/lookup", func(w http.ResponseWriter, r *http.Request) {
		raw, err := withDevice(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		s.send(w, func() (any, error) { return s.App.LookupPhone(raw) })
	})
	mux.HandleFunc("POST /api/v1/auth/code", func(w http.ResponseWriter, r *http.Request) {
		raw, err := withDevice(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		s.send(w, func() (any, error) { return s.App.SendCode(raw) })
	})
	mux.HandleFunc("POST /api/v1/auth/password", func(w http.ResponseWriter, r *http.Request) {
		raw, err := withDevice(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		s.send(w, func() (any, error) { return s.App.SignInPassword(raw) })
	})
	mux.HandleFunc("POST /api/v1/auth/code-login", func(w http.ResponseWriter, r *http.Request) {
		raw, err := withDevice(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		s.send(w, func() (any, error) { return s.App.SignInCode(raw) })
	})
	mux.HandleFunc("POST /api/v1/auth/reset", func(w http.ResponseWriter, r *http.Request) {
		raw, err := withDevice(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		s.send(w, func() (any, error) { return s.App.ResetPassword(raw) })
	})
	mux.HandleFunc("POST /api/v1/auth/start", func(w http.ResponseWriter, r *http.Request) {
		raw, err := withDevice(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		s.send(w, func() (any, error) { return s.App.StartAccount(raw) })
	})
	mux.HandleFunc("POST /api/v1/auth/register", func(w http.ResponseWriter, r *http.Request) {
		raw, err := withDevice(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		s.send(w, func() (any, error) { return s.App.RegisterPerson(raw) })
	})
	mux.HandleFunc("GET /api/v1/invites/{token}", func(w http.ResponseWriter, r *http.Request) {
		s.send(w, func() (any, error) { return s.App.StaffInvite(r.PathValue("token")) })
	})
	mux.HandleFunc("POST /api/v1/invites/code", func(w http.ResponseWriter, r *http.Request) {
		raw, err := body(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		s.send(w, func() (any, error) { return s.App.StaffInviteCode(raw) })
	})
	mux.HandleFunc("POST /api/v1/invites/accept", func(w http.ResponseWriter, r *http.Request) {
		raw, err := withDevice(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		s.send(w, func() (any, error) { return s.App.AcceptStaffInvite(raw) })
	})
	mux.HandleFunc("GET /api/v1/me/sessions", func(w http.ResponseWriter, r *http.Request) {
		s.send(w, func() (any, error) { return s.App.ListSessions(bearer(r)) })
	})
	mux.HandleFunc("POST /api/v1/me/sessions/revoke", func(w http.ResponseWriter, r *http.Request) {
		raw, err := body(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		s.send(w, func() (any, error) { return s.App.RevokeSession(bearer(r), raw) })
	})
	mux.HandleFunc("POST /api/v1/auth/signout", func(w http.ResponseWriter, r *http.Request) {
		s.App.SignOut(bearer(r))
		writeOK(w, map[string]any{"ok": true})
	})

	auth := func(next func(userID string, raw map[string]any) (any, error)) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			id, err := s.App.UserID(bearer(r))
			if err != nil {
				s.ok(w, nil, err)
				return
			}
			raw, err := body(r)
			if err != nil {
				s.ok(w, nil, err)
				return
			}
			s.send(w, func() (any, error) { return next(id, raw) })
		}
	}
	mux.HandleFunc("GET /api/v1/me", auth(func(id string, _ map[string]any) (any, error) { return s.App.Me(id) }))
	mux.HandleFunc("POST /api/v1/me", auth(func(id string, raw map[string]any) (any, error) { return s.App.UpdateProfile(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/claim", auth(func(id string, _ map[string]any) (any, error) { return s.App.ClaimAdmin(id) }))
	mux.HandleFunc("POST /api/v1/businesses", auth(func(id string, raw map[string]any) (any, error) { return s.App.CreateBusiness(id, raw) }))
	mux.HandleFunc("POST /api/v1/pages", auth(func(id string, raw map[string]any) (any, error) { return s.App.CreatePage(id, raw) }))
	mux.HandleFunc("POST /api/v1/demo", auth(func(id string, _ map[string]any) (any, error) { return s.App.CreateDemo(id) }))
	mux.HandleFunc("POST /api/v1/businesses/update", auth(func(id string, raw map[string]any) (any, error) { return s.App.UpdateBusiness(id, raw) }))
	mux.HandleFunc("POST /api/v1/businesses/delete", auth(func(id string, raw map[string]any) (any, error) {
		bid, _ := raw["businessId"].(string)
		return s.App.DeleteBusiness(id, bid)
	}))
	mux.HandleFunc("POST /api/v1/businesses/manage", auth(func(id string, raw map[string]any) (any, error) {
		bid, _ := raw["businessId"].(string)
		return s.App.ManageBusiness(id, bid)
	}))
	mux.HandleFunc("POST /api/v1/services", auth(func(id string, raw map[string]any) (any, error) { return s.App.SaveService(id, raw) }))
	mux.HandleFunc("POST /api/v1/services/delete", auth(func(id string, raw map[string]any) (any, error) { return s.App.DeleteService(id, raw) }))
	mux.HandleFunc("POST /api/v1/staff", auth(func(id string, raw map[string]any) (any, error) { return s.App.SaveStaff(id, raw) }))
	mux.HandleFunc("POST /api/v1/staff/delete", auth(func(id string, raw map[string]any) (any, error) { return s.App.DeleteStaff(id, raw) }))
	mux.HandleFunc("POST /api/v1/schedule", auth(func(id string, raw map[string]any) (any, error) { return s.App.SaveSchedule(id, raw) }))
	mux.HandleFunc("POST /api/v1/holidays", auth(func(id string, raw map[string]any) (any, error) { return s.App.AddHoliday(id, raw) }))
	mux.HandleFunc("POST /api/v1/holidays/remove", auth(func(id string, raw map[string]any) (any, error) { return s.App.RemoveHoliday(id, raw) }))
	mux.HandleFunc("POST /api/v1/bookings", func(w http.ResponseWriter, r *http.Request) {
		id, err := s.App.UserID(bearer(r))
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		raw, err := body(r)
		if err != nil {
			s.ok(w, nil, err)
			return
		}
		raw["origin"] = requestOrigin(r)
		s.send(w, func() (any, error) { return s.App.CreateBooking(id, raw) })
	})
	mux.HandleFunc("POST /api/v1/bookings/status", auth(func(id string, raw map[string]any) (any, error) { return s.App.SetStatus(id, raw) }))
	mux.HandleFunc("POST /api/v1/bookings/resolve", auth(func(id string, raw map[string]any) (any, error) { return s.App.ResolveFollowup(id, raw) }))
	mux.HandleFunc("POST /api/v1/bookings/reschedule", auth(func(id string, raw map[string]any) (any, error) { return s.App.Reschedule(id, raw) }))
	mux.HandleFunc("GET /api/v1/me/bookings", auth(func(id string, _ map[string]any) (any, error) { return s.App.MyBookings(id) }))
	mux.HandleFunc("POST /api/v1/business-bookings", auth(func(id string, raw map[string]any) (any, error) { return s.App.BusinessBookings(id, raw) }))
	mux.HandleFunc("POST /api/v1/customers/list", auth(func(id string, raw map[string]any) (any, error) { return s.App.ListCustomers(id, raw) }))
	mux.HandleFunc("POST /api/v1/orders/list", auth(func(id string, raw map[string]any) (any, error) { return s.App.ListOrders(id, raw) }))
	mux.HandleFunc("POST /api/v1/orders/status", auth(func(id string, raw map[string]any) (any, error) { return s.App.SetOrderStatus(id, raw) }))
	mux.HandleFunc("POST /api/v1/orders/when", auth(func(id string, raw map[string]any) (any, error) { return s.App.SetOrderWhen(id, raw) }))
	mux.HandleFunc("POST /api/v1/tables/list", auth(func(id string, raw map[string]any) (any, error) { return s.App.ListDiningTables(id, raw) }))
	mux.HandleFunc("POST /api/v1/tables/save", auth(func(id string, raw map[string]any) (any, error) { return s.App.SaveDiningTable(id, raw) }))
	mux.HandleFunc("POST /api/v1/tables/delete", auth(func(id string, raw map[string]any) (any, error) { return s.App.DeleteDiningTable(id, raw) }))
	mux.HandleFunc("POST /api/v1/tables/reservations", auth(func(id string, raw map[string]any) (any, error) { return s.App.ListTableReservations(id, raw) }))
	mux.HandleFunc("POST /api/v1/tables/release", auth(func(id string, raw map[string]any) (any, error) { return s.App.ReleaseTable(id, raw) }))
	mux.HandleFunc("POST /api/v1/tables/cancel", auth(func(id string, raw map[string]any) (any, error) { return s.App.CancelTable(id, raw) }))
	mux.HandleFunc("POST /api/v1/shop-hours/get", auth(func(id string, raw map[string]any) (any, error) { return s.App.ShopHours(id, raw) }))
	mux.HandleFunc("POST /api/v1/shop-hours/save", auth(func(id string, raw map[string]any) (any, error) { return s.App.SaveShopHours(id, raw) }))
	mux.HandleFunc("POST /api/v1/customers/file", auth(func(id string, raw map[string]any) (any, error) { return s.App.CustomerFile(id, raw) }))
	mux.HandleFunc("POST /api/v1/customers", auth(func(id string, raw map[string]any) (any, error) { return s.App.SaveCustomer(id, raw) }))
	mux.HandleFunc("POST /api/v1/customers/delete", auth(func(id string, raw map[string]any) (any, error) { return s.App.DeleteCustomer(id, raw) }))
	mux.HandleFunc("POST /api/v1/customer-groups", auth(func(id string, raw map[string]any) (any, error) { return s.App.SaveCustomerGroup(id, raw) }))
	mux.HandleFunc("POST /api/v1/customer-groups/rename", auth(func(id string, raw map[string]any) (any, error) { return s.App.RenameCustomerGroup(id, raw) }))
	mux.HandleFunc("POST /api/v1/customer-groups/delete", auth(func(id string, raw map[string]any) (any, error) { return s.App.DeleteCustomerGroup(id, raw) }))
	mux.HandleFunc("POST /api/v1/dashboard", auth(func(id string, raw map[string]any) (any, error) { return s.App.Dashboard(id, raw) }))
	mux.HandleFunc("POST /api/v1/reports", auth(func(id string, raw map[string]any) (any, error) { return s.App.Reports(id, raw) }))
	mux.HandleFunc("GET /api/v1/notifications", auth(func(id string, _ map[string]any) (any, error) { return s.App.Notifications(id) }))
	mux.HandleFunc("POST /api/v1/notifications/read", auth(func(id string, raw map[string]any) (any, error) { return s.App.MarkRead(id, raw) }))
	mux.HandleFunc("GET /api/v1/support/tickets", auth(func(id string, _ map[string]any) (any, error) { return s.App.SupportTickets(id) }))
	mux.HandleFunc("POST /api/v1/support/tickets", auth(func(id string, raw map[string]any) (any, error) { return s.App.CreateSupportTicket(id, raw) }))
	mux.HandleFunc("POST /api/v1/support/tickets/reply", auth(func(id string, raw map[string]any) (any, error) { return s.App.ReplySupportTicket(id, raw) }))
	mux.HandleFunc("POST /api/v1/support/tickets/close", auth(func(id string, raw map[string]any) (any, error) { return s.App.CloseSupportTicket(id, raw) }))
	mux.HandleFunc("POST /api/v1/support/tickets/reopen", auth(func(id string, raw map[string]any) (any, error) { return s.App.ReopenSupportTicket(id, raw) }))
	mux.HandleFunc("GET /api/v1/admin/support", auth(func(id string, _ map[string]any) (any, error) { return s.App.AdminSupportTickets(id) }))
	mux.HandleFunc("POST /api/v1/admin/support/reply", auth(func(id string, raw map[string]any) (any, error) { return s.App.AdminReplySupportTicket(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/support/close", auth(func(id string, raw map[string]any) (any, error) { return s.App.AdminCloseSupportTicket(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/support/reopen", auth(func(id string, raw map[string]any) (any, error) { return s.App.AdminReopenSupportTicket(id, raw) }))
	mux.HandleFunc("GET /api/v1/admin/overview", auth(func(id string, _ map[string]any) (any, error) { return s.App.AdminOverview(id) }))
	mux.HandleFunc("POST /api/v1/admin/users", auth(func(id string, raw map[string]any) (any, error) { return s.App.AdminUsers(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/users/access", auth(func(id string, raw map[string]any) (any, error) { return s.App.SetUserDisabled(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/users/admin", auth(func(id string, raw map[string]any) (any, error) { return s.App.SetPlatformAdmin(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/search", auth(func(id string, raw map[string]any) (any, error) { return s.App.AdminSearch(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/businesses", auth(func(id string, raw map[string]any) (any, error) { return s.App.AdminBusinesses(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/business", auth(func(id string, raw map[string]any) (any, error) { return s.App.AdminBusinessFile(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/moderate", auth(func(id string, raw map[string]any) (any, error) { return s.App.Moderate(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/media/delete", auth(func(id string, raw map[string]any) (any, error) { return s.App.AdminDeleteMedia(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/sms", auth(func(id string, raw map[string]any) (any, error) { return s.App.GrantSMS(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/payments", auth(func(id string, raw map[string]any) (any, error) { return s.App.AdminPayments(id, raw) }))
	mux.HandleFunc("GET /api/v1/admin/categories", auth(func(id string, _ map[string]any) (any, error) { return s.App.AdminCategories(id) }))
	mux.HandleFunc("POST /api/v1/admin/categories", auth(func(id string, raw map[string]any) (any, error) { return s.App.SaveCategory(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/categories/move", auth(func(id string, raw map[string]any) (any, error) { return s.App.MoveCategory(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/categories/delete", auth(func(id string, raw map[string]any) (any, error) { return s.App.DeleteCategory(id, raw) }))
	mux.HandleFunc("GET /api/v1/admin/audit", auth(func(id string, _ map[string]any) (any, error) { return s.App.AdminAudit(id) }))
	mux.HandleFunc("POST /api/v1/admin/audit", auth(func(id string, raw map[string]any) (any, error) { return s.App.AdminAuditPage(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/settings", auth(func(id string, raw map[string]any) (any, error) { return s.App.SaveSettings(id, raw) }))
	mux.HandleFunc("GET /api/v1/payments/callback/{gateway}", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, s.App.FinishPayment(r.PathValue("gateway"), r.URL.Query()), http.StatusFound)
	})
	mux.HandleFunc("POST /api/v1/payments/start", auth(func(id string, raw map[string]any) (any, error) { return s.App.StartPayment(id, raw) }))
	mux.HandleFunc("POST /api/v1/sms/prefs", auth(func(id string, raw map[string]any) (any, error) { return s.App.SaveSMSPrefs(id, raw) }))
	mux.HandleFunc("POST /api/v1/admin/gateways", auth(func(id string, raw map[string]any) (any, error) { return s.App.SetGateway(id, raw) }))
	return mux
}

func docExt(contentType, name string) string {
	ext := strings.ToLower(filepath.Ext(name))
	allowed := map[string]bool{
		".pdf": true, ".png": true, ".jpg": true, ".jpeg": true, ".webp": true, ".gif": true,
		".txt": true, ".csv": true, ".zip": true, ".doc": true, ".docx": true,
		".xls": true, ".xlsx": true, ".ppt": true, ".pptx": true,
		".mp3": true, ".wav": true, ".ogg": true, ".m4a": true,
	}
	if allowed[ext] {
		return ext
	}
	kind := strings.ToLower(contentType)
	switch {
	case strings.Contains(kind, "pdf"):
		return ".pdf"
	case strings.Contains(kind, "png"):
		return ".png"
	case strings.Contains(kind, "jpeg"):
		return ".jpg"
	case strings.Contains(kind, "webp"):
		return ".webp"
	case strings.Contains(kind, "gif"):
		return ".gif"
	case strings.Contains(kind, "zip"):
		return ".zip"
	case strings.Contains(kind, "mpeg") || strings.Contains(kind, "mp3"):
		return ".mp3"
	default:
		return ""
	}
}

func videoExt(contentType, name string) string {
	kind := strings.ToLower(contentType)
	if strings.Contains(kind, "webm") || strings.HasSuffix(strings.ToLower(name), ".webm") {
		return ".webm"
	}
	if strings.Contains(kind, "quicktime") || strings.HasSuffix(strings.ToLower(name), ".mov") {
		return ".mov"
	}
	if strings.Contains(kind, "mp4") || strings.HasSuffix(strings.ToLower(name), ".mp4") || strings.HasSuffix(strings.ToLower(name), ".m4v") {
		return ".mp4"
	}
	return ""
}

func requestOrigin(r *http.Request) string {
	if origin := strings.TrimSpace(r.Header.Get("Origin")); strings.HasPrefix(origin, "https://") || strings.HasPrefix(origin, "http://") {
		return strings.TrimRight(origin, "/")
	}
	proto := strings.TrimSpace(r.Header.Get("X-Forwarded-Proto"))
	if proto == "" {
		proto = "https"
	}
	host := strings.TrimSpace(r.Header.Get("X-Forwarded-Host"))
	if host == "" {
		host = r.Host
	}
	if host == "" || strings.HasPrefix(host, "/") {
		return ""
	}
	return proto + "://" + host
}

func bearer(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if len(h) > 7 && strings.EqualFold(h[:7], "bearer ") {
		return strings.TrimSpace(h[7:])
	}
	return ""
}

func body(r *http.Request) (map[string]any, error) {
	if r.Body == nil {
		return map[string]any{}, nil
	}
	defer r.Body.Close()
	raw, err := io.ReadAll(io.LimitReader(r.Body, (2<<20)+1))
	if err != nil {
		return nil, &statusErr{400, "VALIDATION", "درخواست خوانده نشد"}
	}
	if len(raw) > 2<<20 {
		return nil, &statusErr{400, "VALIDATION", "درخواست خیلی بزرگ است"}
	}
	if len(raw) == 0 {
		return map[string]any{}, nil
	}
	var m map[string]any
	if err := json.Unmarshal(raw, &m); err != nil || m == nil {
		return nil, &statusErr{400, "VALIDATION", "درخواست نامعتبر است"}
	}
	return m, nil
}

func withDevice(r *http.Request) (map[string]any, error) {
	raw, err := body(r)
	if err != nil {
		return nil, err
	}
	raw["device"] = app.DeviceLabel(r.UserAgent())
	return raw, nil
}

type statusErr struct {
	status int
	code   string
	msg    string
}

func (e *statusErr) Error() string { return e.msg }

func (e *statusErr) Parts() (int, string, string) { return e.status, e.code, e.msg }

func uploadErr(err error) error {
	var max *http.MaxBytesError
	if errors.As(err, &max) || strings.Contains(strings.ToLower(err.Error()), "too large") {
		return app.MediaError("حجم فایل بیشتر از حد مجاز است")
	}
	return app.MediaError("فایل درست نرسید. دوباره انتخاب کنید")
}

func requestToken(r *http.Request) string {
	if token := bearer(r); token != "" {
		return token
	}
	c, err := r.Cookie("agent_token")
	if err != nil {
		return ""
	}
	return strings.TrimSpace(c.Value)
}

func serveStored(w http.ResponseWriter, r *http.Request, path string) {
	file, err := os.Open(path)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer file.Close()
	info, err := file.Stat()
	if err != nil || info.IsDir() {
		http.NotFound(w, r)
		return
	}
	head := make([]byte, 512)
	n, _ := file.Read(head)
	kind := app.ContentKind(head[:n])
	if kind == "html" {
		http.NotFound(w, r)
		return
	}
	if _, err := file.Seek(0, 0); err != nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", app.MediaType(kind))
	w.Header().Set("X-Content-Type-Options", "nosniff")
	if !app.MediaPublic(filepath.Base(path)) {
		name := app.AttachmentName(r.URL.Query().Get("name"))
		w.Header().Set("Content-Disposition", "attachment; filename=\"download\"; filename*=UTF-8''"+url.PathEscape(name))
	}
	http.ServeContent(w, r, filepath.Base(path), info.ModTime(), file)
}

func (s *Server) send(w http.ResponseWriter, fn func() (any, error)) {
	data, err := fn()
	s.ok(w, data, err)
}

func (s *Server) ok(w http.ResponseWriter, data any, err error) {
	if err != nil {
		status, msg, code := 500, "خطای داخلی. دوباره تلاش کنید.", "INTERNAL"
		if p, ok := err.(interface{ Parts() (int, string, string) }); ok {
			status, code, msg = p.Parts()
		}
		w.Header().Set("content-type", "application/json; charset=utf-8")
		w.WriteHeader(status)
		_ = json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": msg, "code": code})
		return
	}
	writeOK(w, data)
}

func writeOK(w http.ResponseWriter, data any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(map[string]any{"ok": true, "data": data})
}
