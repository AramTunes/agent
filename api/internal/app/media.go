package app

import (
	"io"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"unicode/utf8"
)

func mediaRoot() string {
	if value := strings.TrimSpace(os.Getenv("AGENT_MEDIA")); value != "" {
		return value
	}
	if value := strings.TrimSpace(os.Getenv("NOBAT_MEDIA")); value != "" {
		return value
	}
	db := strings.TrimSpace(os.Getenv("AGENT_DB"))
	if db == "" {
		db = strings.TrimSpace(os.Getenv("NOBAT_DB"))
	}
	if db == "" {
		return "/workspace/data/media"
	}
	return filepath.Join(filepath.Dir(db), "media")
}

var mediaID = regexp.MustCompile(`^[A-Za-z0-9_-]{1,80}$`)
var mediaVideo = regexp.MustCompile(`^[a-f0-9]{16,64}\.(mp4|webm|mov)$`)
var mediaDoc = regexp.MustCompile(`^[a-f0-9]{16,64}\.(pdf|png|jpe?g|webp|gif|txt|csv|zip|docx?|xlsx?|pptx?|mp3|wav|ogg|m4a)$`)

func mediaStored(name string) bool {
	return mediaVideo.MatchString(name) || mediaDoc.MatchString(name)
}

func (s *Service) SavePageVideo(userID, businessID string, src io.Reader, ext string) (string, error) {
	businessID = strings.TrimSpace(businessID)
	if !mediaID.MatchString(businessID) {
		return "", fail(400, "VALIDATION", "کسب‌وکار معتبر نیست")
	}
	if ext != ".mp4" && ext != ".webm" && ext != ".mov" {
		return "", fail(400, "VALIDATION", "فقط فیلم mp4 یا webm یا mov مجاز است")
	}
	s.mu.Lock()
	_, err := s.requireRole(s.db, userID, businessID, "owner", "manager")
	s.mu.Unlock()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(mediaRoot(), businessID)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	name := newToken()[:32] + ext
	dest := filepath.Join(dir, name)
	file, err := os.Create(dest)
	if err != nil {
		return "", err
	}
	defer file.Close()
	n, err := io.Copy(file, io.LimitReader(src, 40<<20+1))
	if err != nil {
		_ = os.Remove(dest)
		return "", err
	}
	if n > 40<<20 {
		_ = os.Remove(dest)
		return "", fail(400, "VALIDATION", "حجم فیلم بیشتر از ۴۰ مگابایت است")
	}
	if n == 0 {
		_ = os.Remove(dest)
		return "", fail(400, "VALIDATION", "فیلم خالی است")
	}
	return "/api/v1/media/" + businessID + "/" + name, nil
}

func (s *Service) SavePageFile(userID, businessID string, src io.Reader, ext string) (string, int64, error) {
	businessID = strings.TrimSpace(businessID)
	if !mediaID.MatchString(businessID) {
		return "", 0, fail(400, "VALIDATION", "کسب‌وکار معتبر نیست")
	}
	if !mediaDoc.MatchString("abcdef0123456789" + ext) {
		return "", 0, fail(400, "VALIDATION", "این نوع فایل مجاز نیست")
	}
	s.mu.Lock()
	_, err := s.requireRole(s.db, userID, businessID, "owner", "manager")
	s.mu.Unlock()
	if err != nil {
		return "", 0, err
	}
	dir := filepath.Join(mediaRoot(), businessID)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", 0, err
	}
	name := newToken()[:32] + ext
	dest := filepath.Join(dir, name)
	file, err := os.Create(dest)
	if err != nil {
		return "", 0, err
	}
	defer file.Close()
	n, err := io.Copy(file, io.LimitReader(src, 40<<20+1))
	if err != nil {
		_ = os.Remove(dest)
		return "", 0, err
	}
	if n > 40<<20 {
		_ = os.Remove(dest)
		return "", 0, fail(400, "VALIDATION", "حجم فایل بیشتر از ۴۰ مگابایت است. فایل را جای دیگری بگذارید و نشانی‌اش را وارد کنید")
	}
	if n == 0 {
		_ = os.Remove(dest)
		return "", 0, fail(400, "VALIDATION", "فایل خالی است")
	}
	return "/api/v1/media/" + businessID + "/" + name, n, nil
}

func MediaError(msg string) error {
	return fail(400, "VALIDATION", msg)
}

func (s *Service) PageVideoPath(businessID, name string) (string, error) {
	if !mediaID.MatchString(businessID) || !mediaStored(name) {
		return "", fail(404, "NOT_FOUND", "فیلم پیدا نشد")
	}
	root, err := filepath.Abs(mediaRoot())
	if err != nil {
		return "", err
	}
	path := filepath.Join(root, businessID, name)
	if !strings.HasPrefix(path, root+string(os.PathSeparator)) {
		return "", fail(404, "NOT_FOUND", "فیلم پیدا نشد")
	}
	info, err := os.Stat(path)
	if err != nil || info.IsDir() {
		return "", fail(404, "NOT_FOUND", "فیلم پیدا نشد")
	}
	return path, nil
}

func mediaURL(value string) bool {
	return mediaKind(value, mediaVideo)
}

func docURL(value string) bool {
	return mediaKind(value, mediaDoc)
}

func IsDocument(path string) bool {
	return mediaDoc.MatchString(strings.ToLower(filepath.Base(path)))
}

func AttachmentName(raw string) string {
	raw = strings.TrimSpace(raw)
	raw = strings.ReplaceAll(raw, "\\", " ")
	raw = filepath.Base(raw)
	raw = strings.Map(func(r rune) rune {
		if r < 32 || r == '"' || r == '/' || r == '\\' {
			return -1
		}
		return r
	}, raw)
	raw = strings.TrimSpace(raw)
	if raw == "" || raw == "." || raw == ".." {
		return "file"
	}
	if utf8.RuneCountInString(raw) > 120 {
		raw = string([]rune(raw)[:120])
	}
	return raw
}

func mediaKind(value string, pattern *regexp.Regexp) bool {
	if !strings.HasPrefix(value, "/api/v1/media/") {
		return false
	}
	parts := strings.Split(strings.TrimPrefix(value, "/api/v1/media/"), "/")
	return len(parts) == 2 && mediaID.MatchString(parts[0]) && pattern.MatchString(parts[1])
}

func youtubeWatch(raw string) string {
	parsed, err := url.Parse(strings.TrimSpace(raw))
	if err != nil || parsed.Host == "" {
		return ""
	}
	host := strings.TrimPrefix(strings.ToLower(parsed.Hostname()), "www.")
	id := ""
	switch host {
	case "youtu.be":
		id = strings.Trim(parsed.Path, "/")
	case "youtube.com", "m.youtube.com":
		parts := strings.Split(strings.Trim(parsed.Path, "/"), "/")
		if parsed.Path == "/watch" || (len(parts) > 0 && parts[0] == "watch") {
			id = parsed.Query().Get("v")
		} else if len(parts) >= 2 && (parts[0] == "shorts" || parts[0] == "embed" || parts[0] == "live") {
			id = parts[1]
		}
	}
	if !regexp.MustCompile(`^[A-Za-z0-9_-]{6,20}$`).MatchString(id) {
		return ""
	}
	return "https://www.youtube.com/watch?v=" + id
}

func aparatWatch(raw string) string {
	parsed, err := url.Parse(strings.TrimSpace(raw))
	if err != nil || parsed.Host == "" {
		return ""
	}
	host := strings.TrimPrefix(strings.ToLower(parsed.Hostname()), "www.")
	if host != "aparat.com" {
		return ""
	}
	parts := strings.Split(strings.Trim(parsed.Path, "/"), "/")
	hash := ""
	if len(parts) >= 2 && parts[0] == "v" {
		hash = parts[1]
	}
	for i, part := range parts {
		if part == "videohash" && i+1 < len(parts) {
			hash = parts[i+1]
		}
	}
	if !regexp.MustCompile(`^[A-Za-z0-9]{4,20}$`).MatchString(hash) {
		return ""
	}
	return "https://www.aparat.com/v/" + hash
}
