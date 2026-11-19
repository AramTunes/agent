package app

import (
	"bytes"
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
	name, _, err := storeUpload(businessID, ext, src, 40<<20, "حجم فیلم بیشتر از ۴۰ مگابایت است")
	if err != nil {
		return "", err
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
	name, n, err := storeUpload(businessID, ext, src, 40<<20, "حجم فایل بیشتر از ۴۰ مگابایت است. فایل را جای دیگری بگذارید و نشانی‌اش را وارد کنید")
	if err != nil {
		return "", 0, err
	}
	return "/api/v1/media/" + businessID + "/" + name, n, nil
}

func storeUpload(businessID, ext string, src io.Reader, limit int64, tooBig string) (string, int64, error) {
	head := make([]byte, 512)
	n, err := io.ReadAtLeast(src, head, 1)
	if n == 0 {
		return "", 0, fail(400, "VALIDATION", "فایل خالی است")
	}
	if err != nil && err != io.ErrUnexpectedEOF {
		return "", 0, fail(400, "VALIDATION", "فایل درست نرسید. دوباره انتخاب کنید")
	}
	head = head[:n]
	if !extMatches(ext, contentKind(head)) {
		return "", 0, fail(400, "VALIDATION", "نوع فایل با محتوا یکی نیست")
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
	written, err := io.Copy(file, io.LimitReader(io.MultiReader(bytes.NewReader(head), src), limit+1))
	if err != nil {
		_ = os.Remove(dest)
		return "", 0, fail(400, "VALIDATION", "فایل درست نرسید. دوباره انتخاب کنید")
	}
	if written > limit {
		_ = os.Remove(dest)
		return "", 0, fail(400, "VALIDATION", tooBig)
	}
	return name, written, nil
}

func contentKind(head []byte) string {
	if len(head) >= 3 && head[0] == 0xFF && head[1] == 0xD8 && head[2] == 0xFF {
		return "jpeg"
	}
	if len(head) >= 8 && string(head[:8]) == "\x89PNG\r\n\x1a\n" {
		return "png"
	}
	if len(head) >= 6 && (string(head[:6]) == "GIF87a" || string(head[:6]) == "GIF89a") {
		return "gif"
	}
	if len(head) >= 12 && string(head[:4]) == "RIFF" && string(head[8:12]) == "WEBP" {
		return "webp"
	}
	if len(head) >= 12 && string(head[:4]) == "RIFF" && string(head[8:12]) == "WAVE" {
		return "wav"
	}
	if len(head) >= 5 && string(head[:5]) == "%PDF-" {
		return "pdf"
	}
	if len(head) >= 4 && head[0] == 'P' && head[1] == 'K' && (head[2] == 3 || head[2] == 5 || head[2] == 7) {
		return "zip"
	}
	if len(head) >= 4 && head[0] == 0xD0 && head[1] == 0xCF && head[2] == 0x11 && head[3] == 0xE0 {
		return "ole"
	}
	if len(head) >= 4 && string(head[:4]) == "OggS" {
		return "ogg"
	}
	if len(head) >= 3 && string(head[:3]) == "ID3" {
		return "mp3"
	}
	if len(head) >= 2 && head[0] == 0xFF && head[1]&0xE0 == 0xE0 {
		return "mp3"
	}
	if len(head) >= 4 && head[0] == 0x1A && head[1] == 0x45 && head[2] == 0xDF && head[3] == 0xA3 {
		return "webm"
	}
	if len(head) >= 12 && string(head[4:8]) == "ftyp" {
		return "mp4"
	}
	if looksHTML(head) {
		return "html"
	}
	if looksText(head) {
		return "text"
	}
	return "bin"
}

func looksHTML(head []byte) bool {
	s := strings.ToLower(strings.TrimSpace(string(head)))
	return strings.HasPrefix(s, "<!doctype html") || strings.HasPrefix(s, "<html") || strings.HasPrefix(s, "<script") || strings.HasPrefix(s, "<?php")
}

func looksText(head []byte) bool {
	if !utf8.Valid(head) {
		return false
	}
	return !bytes.Contains(head, []byte{0})
}

func extMatches(ext, kind string) bool {
	switch strings.ToLower(ext) {
	case ".jpg", ".jpeg":
		return kind == "jpeg"
	case ".png":
		return kind == "png"
	case ".gif":
		return kind == "gif"
	case ".webp":
		return kind == "webp"
	case ".pdf":
		return kind == "pdf"
	case ".zip", ".docx", ".xlsx", ".pptx":
		return kind == "zip"
	case ".doc", ".xls", ".ppt":
		return kind == "ole"
	case ".txt", ".csv":
		return kind == "text"
	case ".mp3":
		return kind == "mp3"
	case ".wav":
		return kind == "wav"
	case ".ogg":
		return kind == "ogg"
	case ".mp4", ".mov", ".m4a":
		return kind == "mp4"
	case ".webm":
		return kind == "webm"
	default:
		return false
	}
}

func ContentKind(head []byte) string { return contentKind(head) }

func MediaPublic(name string) bool { return mediaPublicName(name) }

func mediaPublicName(name string) bool {
	switch strings.ToLower(filepath.Ext(name)) {
	case ".mp4", ".webm", ".mov", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp3", ".wav", ".ogg", ".m4a":
		return true
	default:
		return false
	}
}

func MediaType(kind string) string {
	switch kind {
	case "jpeg":
		return "image/jpeg"
	case "png":
		return "image/png"
	case "gif":
		return "image/gif"
	case "webp":
		return "image/webp"
	case "pdf":
		return "application/pdf"
	case "mp4":
		return "video/mp4"
	case "webm":
		return "video/webm"
	case "mp3":
		return "audio/mpeg"
	case "wav":
		return "audio/wav"
	case "ogg":
		return "audio/ogg"
	case "text":
		return "text/plain; charset=utf-8"
	case "zip":
		return "application/octet-stream"
	default:
		return "application/octet-stream"
	}
}

func (s *Service) OpenMedia(token, businessID, name string) (string, error) {
	path, err := s.PageVideoPath(businessID, name)
	if err != nil {
		return "", err
	}
	if mediaPublicName(name) {
		return path, nil
	}
	if !s.canReadMedia(token, businessID) {
		return "", fail(404, "NOT_FOUND", "فایل پیدا نشد")
	}
	return path, nil
}

func (s *Service) canReadMedia(token, businessID string) bool {
	userID, err := s.UserID(token)
	if err != nil {
		return false
	}
	if ok, _ := s.isAdmin(s.db, userID); ok {
		return true
	}
	role, err := s.roleOf(s.db, userID, businessID)
	if err != nil || role == "" {
		return false
	}
	if role == "manager" {
		role = "staff"
	}
	return role == "owner" || role == "staff"
}

func removeBusinessMedia(businessID string) {
	if !mediaID.MatchString(businessID) {
		return
	}
	root, err := filepath.Abs(mediaRoot())
	if err != nil {
		return
	}
	dir := filepath.Join(root, businessID)
	if !strings.HasPrefix(dir, root+string(os.PathSeparator)) {
		return
	}
	_ = os.RemoveAll(dir)
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
