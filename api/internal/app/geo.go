package app

import (
	"encoding/json"
	"net"
	"net/http"
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
