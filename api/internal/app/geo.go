package app

import (
	"encoding/json"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type geoHit struct {
	country string
	city    string
}

var (
	geoMu    sync.Mutex
	geoCache = map[string]geoHit{}
	geoHTTP  = &http.Client{Timeout: 1200 * time.Millisecond}
)

func ClientIP(remoteAddr, forwarded string) string {
	if strings.TrimSpace(os.Getenv("AGENT_TRUST_PROXY")) == "1" {
		if hop := strings.TrimSpace(strings.Split(forwarded, ",")[0]); hop != "" {
			return hop
		}
	}
	host, _, err := net.SplitHostPort(strings.TrimSpace(remoteAddr))
	if err != nil {
		return strings.TrimSpace(remoteAddr)
	}
	return host
}

func LookupPlace(ip string) (string, string) {
	ip = strings.TrimSpace(ip)
	if host, _, err := net.SplitHostPort(ip); err == nil {
		ip = host
	}
	ip = strings.Trim(ip, "[]")
	parsed := net.ParseIP(ip)
	if parsed == nil || parsed.IsLoopback() || parsed.IsPrivate() || parsed.IsUnspecified() {
		return "", ""
	}
	geoMu.Lock()
	if hit, ok := geoCache[ip]; ok {
		geoMu.Unlock()
		return hit.country, hit.city
	}
	geoMu.Unlock()
	req, err := http.NewRequest(http.MethodGet, "http://ip-api.com/json/"+ip+"?fields=status,country,city&lang=fa", nil)
	if err != nil {
		return "", ""
	}
	res, err := geoHTTP.Do(req)
	if err != nil {
		return "", ""
	}
	defer res.Body.Close()
	var body struct {
		Status  string `json:"status"`
		Country string `json:"country"`
		City    string `json:"city"`
	}
	if json.NewDecoder(res.Body).Decode(&body) != nil || body.Status != "success" {
		return "", ""
	}
	country := clip(strings.TrimSpace(body.Country), 40)
	city := clip(strings.TrimSpace(body.City), 40)
	geoMu.Lock()
	if len(geoCache) > 500 {
		geoCache = map[string]geoHit{}
	}
	geoCache[ip] = geoHit{country: country, city: city}
	geoMu.Unlock()
	return country, city
}

func CountryFromZone(zone string) string {
	zone = strings.TrimSpace(zone)
	if zone == "" || len(zone) > 64 {
		return ""
	}
	if _, err := time.LoadLocation(zone); err != nil {
		return ""
	}
	if country, ok := zoneCountries[zone]; ok {
		return country
	}
	return ""
}

var zoneCountries = map[string]string{
	"Asia/Tehran": "ایران", "Iran": "ایران",
	"Asia/Kabul":    "افغانستان",
	"Asia/Dubai":    "امارات",
	"Asia/Baghdad":  "عراق",
	"Asia/Riyadh":   "عربستان",
	"Asia/Kuwait":   "کویت",
	"Asia/Qatar":    "قطر",
	"Asia/Bahrain":  "بحرین",
	"Asia/Muscat":   "عمان",
	"Asia/Karachi":  "پاکستان",
	"Asia/Baku":     "آذربایجان",
	"Asia/Yerevan":  "ارمنستان",
	"Asia/Tbilisi":  "گرجستان",
	"Asia/Istanbul": "ترکیه", "Europe/Istanbul": "ترکیه",
	"Europe/London":    "بریتانیا",
	"Europe/Paris":     "فرانسه",
	"Europe/Berlin":    "آلمان",
	"Europe/Rome":      "ایتالیا",
	"Europe/Madrid":    "اسپانیا",
	"Europe/Amsterdam": "هلند",
	"Europe/Stockholm": "سوئد",
	"Europe/Moscow":    "روسیه",
	"America/New_York": "آمریکا", "America/Chicago": "آمریکا", "America/Denver": "آمریکا", "America/Los_Angeles": "آمریکا",
	"America/Toronto": "کانادا", "America/Vancouver": "کانادا",
	"America/Sao_Paulo": "برزیل",
	"Australia/Sydney":  "استرالیا",
}
