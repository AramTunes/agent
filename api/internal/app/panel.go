package app

import (
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"math/big"
	"strings"
	"time"

	"agent/internal/booking"
)

func (s *Service) UpdateBusiness(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	if _, onlyBlocks := raw["pageBlocks"]; onlyBlocks && raw["name"] == nil {
		return s.writePageBlocks(userID, businessID, raw["pageBlocks"])
	}
	if _, onlyAvatar := raw["avatar"]; onlyAvatar && raw["name"] == nil {
		return s.writeAvatar(userID, businessID, raw["avatar"])
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff"); err != nil {
		return nil, err
	}
	name, err := textOf(raw, "name", 80, "")
	if err != nil || len([]rune(name)) < 2 {
		if err != nil {
			return nil, err
		}
		return nil, fail(400, "VALIDATION", "نام کسب‌وکار را وارد کنید")
	}
	timezone, err := textOf(raw, "timezone", 64, "Asia/Tehran")
	if err != nil {
		return nil, err
	}
	if err := assertZone(timezone); err != nil {
		return nil, err
	}
	categoryID, _ := textOf(raw, "categoryId", 40, "")
	desc, _ := textOf(raw, "description", 2000, "")
	city, _ := textOf(raw, "city", 60, "")
	address, _ := textOf(raw, "address", 200, "")
	phone, _ := textOf(raw, "phone", 20, "")
	cancel, err := intOf(raw, "cancelBeforeMinutes", 0, 7*24*60)
	if err != nil {
		return nil, err
	}
	lead, err := intOf(raw, "minLeadMinutes", 0, 7*24*60)
	if err != nil {
		return nil, err
	}
	horizon, err := intOf(raw, "maxHorizonDays", 1, 180)
	if err != nil {
		return nil, err
	}
	step, err := intOf(raw, "slotStepMinutes", 5, 60)
	if err != nil {
		return nil, err
	}
	var cat any
	if categoryID != "" {
		cat = categoryID
	}
	_, err = s.db.Exec(`UPDATE businesses SET name=?, description=?, category_id=?, city=?, address=?, phone=?, timezone=?, cancel_before_minutes=?, min_lead_minutes=?, max_horizon_days=?, slot_step_minutes=?, allow_any_staff=? WHERE id=?`,
		name, desc, cat, city, address, phone, timezone, cancel, lead, horizon, step, bint(isTrue(raw, "allowAnyStaff")), businessID)
	if err != nil {
		return nil, err
	}
	if _, ok := raw["avatar"]; ok {
		if _, err := s.writeAvatar(userID, businessID, raw["avatar"]); err != nil {
			return nil, err
		}
	}
	_ = s.audit(s.db, userID, "update_business", "business", strPtr(businessID), strPtr(businessID), name)
	return map[string]any{"businessId": businessID}, nil
}

func cleanAvatar(value any) (string, error) {
	s, _ := value.(string)
	s = strings.TrimSpace(s)
	if s == "" {
		return "", nil
	}
	if strings.HasPrefix(s, "beam:") && len(s) <= 80 && !strings.ContainsAny(s, " \n\r") {
		return s, nil
	}
	if strings.HasPrefix(s, "data:image/") && len(s) <= 180000 {
		return s, nil
	}
	return "", fail(400, "VALIDATION", "تصویر پروفایل معتبر نیست")
}

func cleanBlockImage(value string) (string, error) {
	value = strings.TrimSpace(value)
	if strings.HasPrefix(value, "data:image/") && len(value) <= 400000 && !strings.ContainsAny(value, " \n\r") {
		return value, nil
	}
	return "", fail(400, "VALIDATION", "تصویر بلوک معتبر نیست")
}

func (s *Service) writeAvatar(userID, businessID string, value any) (any, error) {
	role, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff")
	if err != nil {
		return nil, err
	}
	avatar, err := cleanAvatar(value)
	if err != nil {
		return nil, err
	}
	if _, err := s.db.Exec(`UPDATE businesses SET avatar = ? WHERE id = ?`, avatar, businessID); err != nil {
		return nil, err
	}
	if role != "staff" {
		_, _ = s.db.Exec(`UPDATE profiles SET avatar = ? WHERE user_id = ?`, avatar, userID)
	}
	return map[string]any{"businessId": businessID, "avatar": avatar}, nil
}

func (s *Service) writePageBlocks(userID, businessID string, value any) (any, error) {
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager"); err != nil {
		return nil, err
	}
	encoded, err := cleanPageBlocks(value)
	if err != nil {
		return nil, err
	}
	if _, err := s.db.Exec(`UPDATE businesses SET page_blocks = ? WHERE id = ?`, encoded, businessID); err != nil {
		return nil, err
	}
	return map[string]any{"businessId": businessID}, nil
}

type menuVariant struct {
	ID     string `json:"id"`
	Title  string `json:"title"`
	Price  int    `json:"price"`
	Status string `json:"status"`
}

type pageItem struct {
	ID         string        `json:"id"`
	Kind       string        `json:"kind"`
	Title      string        `json:"title"`
	Value      string        `json:"value"`
	Size       int           `json:"size"`
	Label      string        `json:"label"`
	Note       string        `json:"note"`
	Image      string        `json:"image"`
	Price      int           `json:"price"`
	PriceTo    int           `json:"priceTo"`
	Status     string        `json:"status"`
	PriceType  string        `json:"priceType"`
	SKU        string        `json:"sku"`
	Link       string        `json:"link"`
	Featured   bool          `json:"featured"`
	CategoryID string        `json:"categoryId"`
	Labels     []string      `json:"labels"`
	Variants   []menuVariant `json:"variants"`
}

func cleanPageBlocks(value any) (string, error) {
	raw, err := json.Marshal(value)
	if err != nil || len(raw) > 4000000 {
		return "", fail(400, "VALIDATION", "بلوک‌های صفحه معتبر نیست")
	}
	var items []struct {
		ID      string `json:"id"`
		Type    string `json:"type"`
		Active  bool   `json:"active"`
		Starred bool   `json:"starred"`
		Title   string `json:"title"`
		URL     string `json:"url"`
		Icon    string `json:"icon"`
		Body    string `json:"body"`
		Align   string `json:"align"`
		Image   string `json:"image"`
		ImagePos string `json:"imagePos"`
		Layout   string     `json:"layout"`
		Currency string     `json:"currency"`
		Items    []pageItem `json:"items"`
	}
	if err := json.Unmarshal(raw, &items); err != nil || len(items) > 41 {
		return "", fail(400, "VALIDATION", "بلوک‌های صفحه معتبر نیست")
	}
	allowed := map[string]bool{
		"link": true, "contact": true, "address": true, "booking": true, "products": true,
		"menu": true, "services": true, "form": true, "event": true, "course": true,
		"blog": true, "text": true, "social": true, "faq": true, "team": true,
		"gallery": true, "video": true, "resume": true, "file": true, "divider": true, "design": true,
	}
	out := make([]map[string]any, 0, len(items))
	seen := map[string]bool{}
	for _, item := range items {
		id := strings.TrimSpace(item.ID)
		if id == "" || len(id) > 80 || seen[id] || !allowed[item.Type] {
			return "", fail(400, "VALIDATION", "بلوک‌های صفحه معتبر نیست")
		}
		seen[id] = true
		if item.Type == "design" {
			body := clip(strings.TrimSpace(item.Body), 4000)
			row := map[string]any{"id": id, "type": item.Type, "active": true, "starred": false}
			if body != "" {
				row["body"] = body
			}
			out = append(out, row)
			continue
		}
		title := strings.TrimSpace(item.Title)
		title = strings.ReplaceAll(title, "\n", " ")
		title = clip(title, 80)
		var url string
		var err error
		if item.Type == "booking" {
			url, err = cleanBookingPath(item.URL)
		} else if item.Type == "menu" {
			url, err = cleanMenuPath(item.URL)
		} else {
			url, err = cleanLinkURL(item.URL)
		}
		if err != nil {
			return "", err
		}
		icon := strings.TrimSpace(item.Icon)
		if icon != "" && (len(icon) > 40 || strings.ContainsAny(icon, " /\n\r") || strings.ToLower(icon) != icon) {
			return "", fail(400, "VALIDATION", "آیکون بلوک معتبر نیست")
		}
		body := clip(strings.TrimSpace(item.Body), 500)
		row := map[string]any{"id": id, "type": item.Type, "active": item.Active, "starred": item.Starred}
		if title != "" {
			row["title"] = title
		}
		if url != "" {
			row["url"] = url
		}
		if icon != "" {
			row["icon"] = icon
		}
		if body != "" {
			row["body"] = body
		}
		if item.Type == "text" {
			align := item.Align
			if align != "center" && align != "left" {
				align = "right"
			}
			row["align"] = align
			if strings.TrimSpace(item.Image) != "" {
				img, err := cleanBlockImage(item.Image)
				if err != nil {
					return "", err
				}
				row["image"] = img
				if item.ImagePos == "after" {
					row["imagePos"] = "after"
				} else {
					row["imagePos"] = "before"
				}
			}
		}
		if item.Type == "contact" {
			cleaned, err := cleanContactItems(item.Items)
			if err != nil {
				return "", err
			}
			if len(cleaned) > 0 {
				row["items"] = cleaned
			}
		}
		if item.Type == "social" {
			cleaned, err := cleanSocialItems(item.Items)
			if err != nil {
				return "", err
			}
			if len(cleaned) > 0 {
				row["items"] = cleaned
			}
			layout := item.Layout
			if layout != "icons" && layout != "footer" {
				layout = "buttons"
			}
			row["layout"] = layout
		}
		if item.Type == "address" {
			cleaned, err := cleanAddressItems(item.Items)
			if err != nil {
				return "", err
			}
			if len(cleaned) > 0 {
				row["items"] = cleaned
			}
		}
		if item.Type == "faq" {
			cleaned, err := cleanFaqItems(item.Items)
			if err != nil {
				return "", err
			}
			if len(cleaned) > 0 {
				row["items"] = cleaned
			}
		}
		if item.Type == "gallery" {
			cleaned, err := cleanGalleryItems(item.Items)
			if err != nil {
				return "", err
			}
			if len(cleaned) > 0 {
				row["items"] = cleaned
			}
		}
		if item.Type == "video" {
			cleaned, err := cleanVideoItems(item.Items)
			if err != nil {
				return "", err
			}
			if len(cleaned) > 0 {
				row["items"] = cleaned
			}
		}
		if item.Type == "file" {
			if len(item.Items) > 0 {
				cleaned, err := cleanFileItems(item.Items)
				if err != nil {
					return "", err
				}
				row["items"] = cleaned
			} else if url == "" {
				return "", fail(400, "VALIDATION", "یک فایل آپلود کنید یا نشانی بگذارید")
			}
		}
		if item.Type == "divider" {
			delete(row, "title")
			delete(row, "url")
			delete(row, "icon")
			align := item.Align
			if align != "left" && align != "right" {
				align = "center"
			}
			row["align"] = align
			label := clip(strings.ReplaceAll(strings.TrimSpace(item.Body), "\n", " "), 40)
			if label == "" {
				delete(row, "body")
			} else {
				row["body"] = label
			}
		}
		if item.Type == "booking" {
			delete(row, "icon")
			note := clip(strings.ReplaceAll(strings.TrimSpace(item.Body), "\n", " "), 100)
			if note == "" {
				delete(row, "body")
			} else {
				row["body"] = note
			}
			if strings.TrimSpace(item.Image) != "" {
				img, err := cleanBlockImage(item.Image)
				if err != nil {
					return "", err
				}
				row["image"] = img
			}
		}
		if item.Type == "menu" {
			note := clip(strings.ReplaceAll(strings.TrimSpace(item.Body), "\n", " "), 100)
			if note == "" {
				delete(row, "body")
			} else {
				row["body"] = note
			}
			if url == "" {
				url = "menu"
			}
			row["url"] = url
			layout := item.Layout
			if layout != "grid" && layout != "card" {
				layout = "list"
			}
			row["layout"] = layout
			switch item.Currency {
			case "rial", "dollar", "euro", "dinar":
				row["currency"] = item.Currency
			default:
				row["currency"] = "toman"
			}
			cleaned, err := cleanMenuItems(item.Items)
			if err != nil {
				return "", err
			}
			if len(cleaned) > 0 {
				row["items"] = cleaned
			}
		}
		out = append(out, row)
	}
	encoded, err := json.Marshal(out)
	if err != nil {
		return "", err
	}
	return string(encoded), nil
}

func menuStatus(value string) string {
	switch value {
	case "unavailable", "hidden":
		return value
	default:
		return "available"
	}
}

func menuPriceType(value string) string {
	switch value {
	case "from", "range", "contact", "free":
		return value
	default:
		return "fixed"
	}
}

func cleanMenuItems(items []pageItem) ([]map[string]any, error) {
	if len(items) > 120 {
		return nil, fail(400, "VALIDATION", "آیتم‌های منو زیاد است")
	}
	out := make([]map[string]any, 0, len(items))
	seen := map[string]bool{}
	cats := map[string]bool{}
	for _, item := range items {
		if item.Kind != "category" {
			continue
		}
		id := strings.TrimSpace(item.ID)
		title := clip(strings.ReplaceAll(strings.TrimSpace(item.Title), "\n", " "), 80)
		if id == "" || len(id) > 80 || seen[id] || title == "" {
			continue
		}
		seen[id] = true
		cats[id] = true
		row := map[string]any{
			"id": id, "kind": "category", "title": title,
			"value": clip(strings.TrimSpace(item.Value), 100),
		}
		if strings.TrimSpace(item.Image) != "" {
			img, err := cleanBlockImage(item.Image)
			if err != nil {
				return nil, err
			}
			row["image"] = img
		}
		out = append(out, row)
	}
	for _, item := range items {
		if item.Kind != "item" {
			continue
		}
		id := strings.TrimSpace(item.ID)
		title := clip(strings.ReplaceAll(strings.TrimSpace(item.Title), "\n", " "), 80)
		if id == "" || len(id) > 80 || seen[id] || title == "" {
			return nil, fail(400, "VALIDATION", "عنوان آیتم را وارد کنید")
		}
		seen[id] = true
		row := map[string]any{
			"id": id, "kind": "item", "title": title,
			"value": clip(strings.TrimSpace(item.Value), 100),
			"price": item.Price,
			"status": menuStatus(item.Status),
			"priceType": menuPriceType(item.PriceType),
			"featured": item.Featured,
		}
		if item.Price < 0 {
			row["price"] = 0
		}
		if row["priceType"] == "range" {
			if item.PriceTo < 0 {
				row["priceTo"] = 0
			} else {
				row["priceTo"] = item.PriceTo
			}
		}
		if strings.TrimSpace(item.Image) != "" {
			img, err := cleanBlockImage(item.Image)
			if err != nil {
				return nil, err
			}
			row["image"] = img
		}
		if item.CategoryID != "" && cats[item.CategoryID] {
			row["categoryId"] = item.CategoryID
		}
		sku := clip(strings.TrimSpace(item.SKU), 40)
		if sku != "" {
			row["sku"] = sku
		}
		link, err := cleanLinkURL(item.Link)
		if err != nil {
			return nil, err
		}
		if link != "" {
			row["link"] = link
		}
		labels := make([]string, 0, len(item.Labels))
		used := map[string]bool{}
		for _, label := range item.Labels {
			text := clip(strings.ReplaceAll(strings.TrimSpace(label), "\n", " "), 24)
			if text == "" || used[text] || len(labels) >= 6 {
				continue
			}
			used[text] = true
			labels = append(labels, text)
		}
		if len(labels) > 0 {
			row["labels"] = labels
		}
		variants := make([]map[string]any, 0, len(item.Variants))
		vseen := map[string]bool{}
		for _, variant := range item.Variants {
			vid := strings.TrimSpace(variant.ID)
			vtitle := clip(strings.ReplaceAll(strings.TrimSpace(variant.Title), "\n", " "), 40)
			if vid == "" || len(vid) > 80 || vseen[vid] || vtitle == "" || len(variants) >= 12 {
				continue
			}
			vseen[vid] = true
			price := variant.Price
			if price < 0 {
				price = 0
			}
			variants = append(variants, map[string]any{"id": vid, "title": vtitle, "price": price, "status": menuStatus(variant.Status)})
		}
		if len(variants) > 0 {
			row["variants"] = variants
		}
		out = append(out, row)
	}
	return out, nil
}

func cleanContactItems(items []pageItem) ([]map[string]any, error) {
	if len(items) > 12 {
		return nil, fail(400, "VALIDATION", "راه‌های تماس زیاد است")
	}
	kinds := map[string]bool{"phone": true, "email": true, "whatsapp": true, "telegram": true, "eitaa": true, "bale": true, "rubika": true}
	out := make([]map[string]any, 0, len(items))
	seen := map[string]bool{}
	for _, item := range items {
		id := strings.TrimSpace(item.ID)
		if id == "" || len(id) > 80 || seen[id] || !kinds[item.Kind] {
			return nil, fail(400, "VALIDATION", "راه‌های تماس معتبر نیست")
		}
		seen[id] = true
		value := clip(strings.TrimSpace(strings.ReplaceAll(item.Value, "\n", " ")), 80)
		if value == "" {
			continue
		}
		title := clip(strings.ReplaceAll(strings.TrimSpace(item.Title), "\n", " "), 40)
		row := map[string]any{"id": id, "kind": item.Kind, "value": value}
		if title != "" {
			row["title"] = title
		}
		out = append(out, row)
	}
	return out, nil
}

func cleanAddressItems(items []pageItem) ([]map[string]any, error) {
	if len(items) > 12 {
		return nil, fail(400, "VALIDATION", "آدرس‌ها زیاد است")
	}
	kinds := map[string]bool{"google": true, "neshan": true, "waze": true, "balad": true, "text": true}
	out := make([]map[string]any, 0, len(items))
	seen := map[string]bool{}
	for _, item := range items {
		id := strings.TrimSpace(item.ID)
		if id == "" || len(id) > 80 || seen[id] || !kinds[item.Kind] {
			return nil, fail(400, "VALIDATION", "آدرس معتبر نیست")
		}
		seen[id] = true
		if item.Kind == "text" {
			value := clip(strings.TrimSpace(item.Value), 400)
			if value == "" {
				continue
			}
			out = append(out, map[string]any{"id": id, "kind": "text", "value": value})
			continue
		}
		url, err := cleanLinkURL(item.Value)
		if err != nil {
			return nil, err
		}
		if url == "" {
			continue
		}
		title := clip(strings.ReplaceAll(strings.TrimSpace(item.Title), "\n", " "), 40)
		row := map[string]any{"id": id, "kind": item.Kind, "value": url}
		if title != "" {
			row["title"] = title
		}
		out = append(out, row)
	}
	return out, nil
}

func cleanFaqItems(items []pageItem) ([]map[string]any, error) {
	if len(items) > 30 {
		return nil, fail(400, "VALIDATION", "سوال‌ها زیاد است")
	}
	out := make([]map[string]any, 0, len(items))
	seen := map[string]bool{}
	for _, item := range items {
		id := strings.TrimSpace(item.ID)
		if id == "" || len(id) > 80 || seen[id] {
			return nil, fail(400, "VALIDATION", "سوال معتبر نیست")
		}
		seen[id] = true
		title := clip(strings.ReplaceAll(strings.TrimSpace(item.Title), "\n", " "), 160)
		value := clip(strings.TrimSpace(item.Value), 500)
		if title == "" || value == "" {
			continue
		}
		out = append(out, map[string]any{"id": id, "kind": "qa", "title": title, "value": value})
	}
	return out, nil
}

func cleanGalleryItems(items []pageItem) ([]map[string]any, error) {
	if len(items) > 6 {
		return nil, fail(400, "VALIDATION", "عکس‌ها زیاد است")
	}
	out := make([]map[string]any, 0, len(items))
	seen := map[string]bool{}
	for _, item := range items {
		id := strings.TrimSpace(item.ID)
		if id == "" || len(id) > 80 || seen[id] {
			return nil, fail(400, "VALIDATION", "عکس معتبر نیست")
		}
		seen[id] = true
		image, err := cleanBlockImage(item.Value)
		if err != nil {
			return nil, err
		}
		out = append(out, map[string]any{"id": id, "kind": "photo", "value": image})
	}
	return out, nil
}

func cleanVideoItems(items []pageItem) ([]map[string]any, error) {
	if len(items) > 8 {
		return nil, fail(400, "VALIDATION", "فیلم‌ها زیاد است")
	}
	out := make([]map[string]any, 0, len(items))
	seen := map[string]bool{}
	files := 0
	for _, item := range items {
		id := strings.TrimSpace(item.ID)
		if id == "" || len(id) > 80 || seen[id] {
			return nil, fail(400, "VALIDATION", "فیلم معتبر نیست")
		}
		seen[id] = true
		value := strings.TrimSpace(item.Value)
		switch item.Kind {
		case "file":
			files++
			if files > 1 || !mediaURL(value) {
				return nil, fail(400, "VALIDATION", "فیلم معتبر نیست")
			}
		case "youtube":
			value = youtubeWatch(value)
			if value == "" {
				return nil, fail(400, "VALIDATION", "لینک یوتیوب معتبر نیست")
			}
		case "aparat":
			value = aparatWatch(value)
			if value == "" {
				return nil, fail(400, "VALIDATION", "لینک آپارات معتبر نیست")
			}
		default:
			return nil, fail(400, "VALIDATION", "فیلم معتبر نیست")
		}
		out = append(out, map[string]any{"id": id, "kind": item.Kind, "value": value})
	}
	return out, nil
}

func cleanFileItems(items []pageItem) ([]map[string]any, error) {
	if len(items) == 0 || len(items) > 8 {
		return nil, fail(400, "VALIDATION", "بین ۱ تا ۸ فایل بگذارید")
	}
	out := make([]map[string]any, 0, len(items))
	seen := map[string]bool{}
	for _, item := range items {
		id := strings.TrimSpace(item.ID)
		if id == "" || len(id) > 80 || seen[id] || item.Kind != "file" || !docURL(strings.TrimSpace(item.Value)) {
			return nil, fail(400, "VALIDATION", "فایل معتبر نیست")
		}
		seen[id] = true
		name := clip(strings.TrimSpace(strings.ReplaceAll(item.Title, "\n", " ")), 120)
		if name == "" || item.Size <= 0 || item.Size > 40<<20 {
			return nil, fail(400, "VALIDATION", "فایل معتبر نیست")
		}
		row := map[string]any{"id": id, "kind": "file", "title": name, "value": strings.TrimSpace(item.Value), "size": item.Size}
		if label := clip(strings.TrimSpace(strings.ReplaceAll(item.Label, "\n", " ")), 80); label != "" {
			row["label"] = label
		}
		if note := clip(strings.TrimSpace(item.Note), 200); note != "" {
			row["note"] = note
		}
		out = append(out, row)
	}
	return out, nil
}

func cleanSocialItems(items []pageItem) ([]map[string]any, error) {
	if len(items) > 20 {
		return nil, fail(400, "VALIDATION", "شبکه‌ها زیاد است")
	}
	kinds := map[string]bool{
		"instagram": true, "telegram": true, "whatsapp": true, "x": true, "youtube": true, "linkedin": true,
		"kik": true, "bale": true, "rubika": true, "igap": true, "phone": true, "email": true, "website": true,
	}
	out := make([]map[string]any, 0, len(items))
	seen := map[string]bool{}
	for _, item := range items {
		id := strings.TrimSpace(item.ID)
		if id == "" || len(id) > 80 || seen[id] || !kinds[item.Kind] {
			return nil, fail(400, "VALIDATION", "شبکه معتبر نیست")
		}
		seen[id] = true
		value := clip(strings.TrimSpace(strings.ReplaceAll(item.Value, "\n", " ")), 200)
		if value == "" {
			continue
		}
		lower := strings.ToLower(value)
		if strings.HasPrefix(lower, "javascript:") || strings.HasPrefix(lower, "data:") {
			return nil, fail(400, "VALIDATION", "اطلاعات شبکه معتبر نیست")
		}
		title := clip(strings.ReplaceAll(strings.TrimSpace(item.Title), "\n", " "), 40)
		row := map[string]any{"id": id, "kind": item.Kind, "value": value}
		if title != "" {
			row["title"] = title
		}
		out = append(out, row)
	}
	return out, nil
}

func cleanMenuPath(value string) (string, error) {
	value = strings.Trim(strings.TrimSpace(value), "/")
	if value == "" {
		return "menu", nil
	}
	if len([]rune(value)) > 40 || strings.ContainsAny(value, " \n\r?#/\\") {
		return "", fail(400, "VALIDATION", "نشانی صفحه منو معتبر نیست")
	}
	return value, nil
}

func cleanBookingPath(value string) (string, error) {
	value = strings.Trim(strings.TrimSpace(value), "/")
	if value == "" || value == "book" {
		return "", nil
	}
	if len([]rune(value)) > 40 || strings.ContainsAny(value, " \n\r?#/\\") {
		return "", fail(400, "VALIDATION", "نشانی صفحه رزرو معتبر نیست")
	}
	return value, nil
}

func cleanLinkURL(value string) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return "", nil
	}
	if len(value) > 500 {
		return "", fail(400, "VALIDATION", "نشانی لینک طولانی است")
	}
	lower := strings.ToLower(value)
	if strings.HasPrefix(lower, "javascript:") || strings.HasPrefix(lower, "data:") || (!strings.HasPrefix(lower, "http://") && !strings.HasPrefix(lower, "https://")) {
		return "", fail(400, "VALIDATION", "نشانی لینک معتبر نیست")
	}
	return value, nil
}

func (s *Service) DeleteBusiness(userID, businessID string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, err := s.requireRole(s.db, userID, businessID, "owner"); err != nil {
		return nil, err
	}
	_ = s.audit(s.db, userID, "delete_business", "business", strPtr(businessID), strPtr(businessID), "")
	_, err := s.db.Exec(`DELETE FROM businesses WHERE id = ? AND owner_user_id = ?`, businessID, userID)
	if err != nil {
		return nil, err
	}
	return map[string]any{"deleted": true}, nil
}

func (s *Service) ManageBusiness(userID, businessID string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	role, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff")
	if err != nil {
		return nil, err
	}
	b, err := loadBiz(s.db, "id = ?", businessID)
	if err != nil {
		return nil, err
	}
	snap, err := s.snapshot(s.db, b, true)
	if err != nil || role != "staff" {
		return snap, err
	}
	mine, err := s.ownStaffID(s.db, userID, businessID)
	if err != nil {
		return nil, err
	}
	people, _ := snap["staff"].([]map[string]any)
	var allowed map[string]bool
	nextPeople := []map[string]any{}
	for _, person := range people {
		if person["id"] != mine {
			continue
		}
		nextPeople = append(nextPeople, person)
		allowed = map[string]bool{}
		switch ids := person["serviceIds"].(type) {
		case []string:
			for _, id := range ids {
				allowed[id] = true
			}
		}
	}
	snap["staff"] = nextPeople
	services, _ := snap["services"].([]map[string]any)
	nextServices := []map[string]any{}
	for _, service := range services {
		if allowed[fmtID(service["id"])] {
			nextServices = append(nextServices, service)
		}
	}
	snap["services"] = nextServices
	return snap, nil
}

func fmtID(value any) string {
	id, _ := value.(string)
	return id
}

func (s *Service) SaveService(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	name, err := textOf(raw, "name", 80, "")
	if err != nil || len([]rune(name)) < 2 {
		if err != nil {
			return nil, err
		}
		return nil, fail(400, "VALIDATION", "نام خدمت را وارد کنید")
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager"); err != nil {
		return nil, err
	}
	var branch sql.NullString
	_ = s.db.QueryRow(`SELECT id FROM branches WHERE business_id = ? AND active = 1 ORDER BY name LIMIT 1`, businessID).Scan(&branch)
	serviceID, _ := textOf(raw, "id", 80, "")
	if serviceID == "" {
		serviceID = newID()
	}
	duration, err := intOf(raw, "durationMinutes", 5, 480)
	if err != nil {
		return nil, err
	}
	buffer, err := intOf(raw, "bufferMinutes", 0, 180)
	if err != nil {
		return nil, err
	}
	price, err := intOf(raw, "priceToman", 0, 100_000_000)
	if err != nil {
		return nil, err
	}
	desc, _ := textOf(raw, "description", 1000, "")
	active := bint(notFalse(raw, "active"))
	var existing string
	err = s.db.QueryRow(`SELECT id FROM services WHERE id = ? AND business_id = ?`, serviceID, businessID).Scan(&existing)
	if err == nil {
		_, err = s.db.Exec(`UPDATE services SET name=?, description=?, duration_minutes=?, buffer_minutes=?, price_toman=?, active=? WHERE id=? AND business_id=?`,
			name, desc, duration, buffer, price, active, serviceID, businessID)
	} else if err == sql.ErrNoRows {
		_, err = s.db.Exec(`INSERT INTO services (id, business_id, branch_id, name, description, duration_minutes, buffer_minutes, price_toman, active) VALUES (?,?,?,?,?,?,?,?,?)`,
			serviceID, businessID, branch, name, desc, duration, buffer, price, active)
	}
	if err != nil {
		return nil, err
	}
	return map[string]any{"serviceId": serviceID}, nil
}

func (s *Service) SaveStaff(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	name, err := textOf(raw, "name", 80, "")
	if err != nil || len([]rune(name)) < 2 {
		if err != nil {
			return nil, err
		}
		return nil, fail(400, "VALIDATION", "نام پرسنل را وارد کنید")
	}
	rawIDs, _ := raw["serviceIds"].([]any)
	var serviceIDs []string
	for _, item := range rawIDs {
		if s, ok := item.(string); ok && len(serviceIDs) < 30 {
			serviceIDs = append(serviceIDs, s)
		}
	}
	if len(serviceIDs) == 0 {
		return nil, fail(400, "VALIDATION", "حداقل یک خدمت را به پرسنل وصل کنید")
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager"); err != nil {
		return nil, err
	}
	var branch string
	if err := s.db.QueryRow(`SELECT id FROM branches WHERE business_id = ? ORDER BY name LIMIT 1`, businessID).Scan(&branch); err != nil {
		return nil, fail(400, "VALIDATION", "شعبه پیدا نشد")
	}
	allowed := map[string]bool{}
	rows, err := s.db.Query(`SELECT id FROM services WHERE business_id = ?`, businessID)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var id string
		_ = rows.Scan(&id)
		allowed[id] = true
	}
	rows.Close()
	for _, id := range serviceIDs {
		if !allowed[id] {
			return nil, fail(400, "VALIDATION", "خدمت نامعتبر است")
		}
	}
	staffID, _ := textOf(raw, "id", 80, "")
	if staffID == "" {
		staffID = newID()
	}
	title, _ := textOf(raw, "title", 80, "")
	phone, err := normalizePhone(mustString(raw, "phone"))
	if err != nil {
		return nil, fail(400, "VALIDATION", "شماره موبایل پرسنل را وارد کنید")
	}
	var other string
	err = s.db.QueryRow(`SELECT id FROM staff WHERE business_id = ? AND phone = ? AND id <> ?`, businessID, phone, staffID).Scan(&other)
	if err == nil {
		return nil, fail(409, "CONFLICT", "این شماره برای پرسنل دیگری است")
	}
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	active := bint(notFalse(raw, "active"))
	photo := ""
	if _, ok := raw["photo"]; ok {
		if rawPhoto, _ := raw["photo"].(string); strings.TrimSpace(rawPhoto) != "" {
			photo, err = cleanBlockImage(rawPhoto)
			if err != nil {
				return nil, err
			}
		}
	}
	var existing string
	err = s.db.QueryRow(`SELECT id FROM staff WHERE id = ? AND business_id = ?`, staffID, businessID).Scan(&existing)
	if err == nil {
		if _, ok := raw["photo"]; ok {
			_, err = s.db.Exec(`UPDATE staff SET name=?, title=?, active=?, photo=? WHERE id=? AND business_id=?`, name, title, active, photo, staffID, businessID)
		} else {
			_, err = s.db.Exec(`UPDATE staff SET name=?, title=?, active=? WHERE id=? AND business_id=?`, name, title, active, staffID, businessID)
		}
	} else if err == sql.ErrNoRows {
		_, err = s.db.Exec(`INSERT INTO staff (id, business_id, branch_id, name, title, active, photo) VALUES (?,?,?,?,?,?,?)`, staffID, businessID, branch, name, title, active, photo)
		if err == nil {
			for _, weekday := range []int{6, 0, 1, 2, 3, 4} {
				if _, err = s.db.Exec(`INSERT INTO working_hours (id, staff_id, weekday, start_min, end_min) VALUES (?,?,?,540,1080)`, newID(), staffID, weekday); err != nil {
					return nil, err
				}
			}
		}
	}
	if err != nil {
		return nil, err
	}
	if _, err := s.db.Exec(`DELETE FROM staff_services WHERE staff_id = ?`, staffID); err != nil {
		return nil, err
	}
	for _, sid := range serviceIDs {
		if _, err := s.db.Exec(`INSERT INTO staff_services (staff_id, service_id) VALUES (?,?)`, staffID, sid); err != nil {
			return nil, err
		}
	}
	var linked string
	_ = s.db.QueryRow(`SELECT COALESCE(user_id, '') FROM staff WHERE id = ?`, staffID).Scan(&linked)
	invite := ""
	if linked == "" {
		invite = newID()
		if _, err := s.db.Exec(`UPDATE staff SET phone = ?, invite_token = ? WHERE id = ?`, phone, invite, staffID); err != nil {
			return nil, err
		}
	} else if _, err := s.db.Exec(`UPDATE staff SET phone = ? WHERE id = ?`, phone, staffID); err != nil {
		return nil, err
	}
	return map[string]any{"staffId": staffID, "inviteToken": invite}, nil
}

func (s *Service) linkStaffLogin(phone, name, businessID, staffID string) error {
	acc, err := s.accountByPhone(phone)
	if err != nil {
		return err
	}
	userID := ""
	if acc != nil {
		userID = acc.UserID
	} else {
		userID = newID()
		secret := newID() + "Aa9!"
		hash, err := hashPassword(secret)
		if err != nil {
			return err
		}
		now := s.now().UTC().Format(time.RFC3339)
		if _, err := s.db.Exec(`INSERT INTO users (id, name, email, phone, password_hash, created_at) VALUES (?,?,?,?,?,?)`,
			userID, name, phoneEmail(phone), phone, hash, now); err != nil {
			return err
		}
		if _, err := s.db.Exec(`INSERT INTO profiles (user_id, display_name, phone, has_password, created_at) VALUES (?,?,?,0,?)`,
			userID, name, phone, now); err != nil {
			return err
		}
	}
	role, err := s.roleOf(s.db, userID, businessID)
	if err != nil {
		return err
	}
	if role == "" {
		if _, err := s.db.Exec(`INSERT INTO memberships (business_id, user_id, role) VALUES (?,?, 'staff')`, businessID, userID); err != nil {
			return err
		}
	}
	_, err = s.db.Exec(`UPDATE staff SET phone = ?, user_id = ? WHERE id = ? AND business_id = ?`, phone, userID, staffID, businessID)
	return err
}

func (s *Service) StaffInvite(token string) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	row, err := s.inviteRow(token)
	if err != nil {
		return nil, err
	}
	return map[string]any{"businessName": row.biz, "name": row.name, "title": row.title, "phone": maskPhone(row.phone)}, nil
}

func (s *Service) StaffInviteCode(raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	row, err := s.inviteRow(strings.TrimSpace(mustString(raw, "token")))
	if err != nil {
		return nil, err
	}
	if !s.rate("staff-code:"+row.phone, 5, codeTTL) {
		return nil, fail(429, "RATE", "تعداد درخواست کد زیاد است. کمی بعد دوباره بخواهید")
	}
	n, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return nil, err
	}
	code := pad6(int(n.Int64()))
	now := s.now().UTC().Format(time.RFC3339)
	if _, err := s.db.Exec(`UPDATE phone_codes SET consumed_at = ? WHERE phone = ? AND purpose = 'staff' AND consumed_at IS NULL`, now, row.phone); err != nil {
		return nil, err
	}
	exp := s.now().Add(codeTTL).UTC().Format(time.RFC3339)
	if _, err := s.db.Exec(`INSERT INTO phone_codes (id, phone, purpose, code_hash, expires_at) VALUES (?,?, 'staff', ?, ?)`,
		newID(), row.phone, hashCode(row.phone, "staff", code), exp); err != nil {
		return nil, err
	}
	return map[string]any{"sent": true, "code": code}, nil
}

func (s *Service) AcceptStaffInvite(raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	token := strings.TrimSpace(mustString(raw, "token"))
	row, err := s.inviteRow(token)
	if err != nil {
		return nil, err
	}
	name, _ := textOf(raw, "name", 80, row.name)
	if len([]rune(name)) < 2 {
		name = row.name
	}
	if err := s.consumeCode(row.phone, "staff", strings.TrimSpace(mustString(raw, "code"))); err != nil {
		return nil, err
	}
	if err := s.linkStaffLogin(row.phone, name, row.businessID, row.staffID); err != nil {
		return nil, err
	}
	if _, err := s.db.Exec(`UPDATE staff SET name = ?, invite_token = '' WHERE id = ?`, name, row.staffID); err != nil {
		return nil, err
	}
	var userID string
	if err := s.db.QueryRow(`SELECT COALESCE(user_id, '') FROM staff WHERE id = ?`, row.staffID).Scan(&userID); err != nil || userID == "" {
		return nil, fail(400, "AUTH", "حساب پرسنل ساخته نشد")
	}
	session, err := s.openSession(userID)
	if err != nil {
		return nil, err
	}
	return map[string]any{"token": session}, nil
}

type inviteRecord struct {
	staffID, businessID, phone, name, title, biz string
}

func (s *Service) inviteRow(token string) (inviteRecord, error) {
	var row inviteRecord
	if token == "" {
		return row, fail(404, "NOT_FOUND", "دعوت پیدا نشد")
	}
	err := s.db.QueryRow(`
		SELECT st.id, st.business_id, st.phone, st.name, st.title, b.name
		FROM staff st JOIN businesses b ON b.id = st.business_id
		WHERE st.invite_token = ? AND COALESCE(st.user_id, '') = ''`, token).Scan(&row.staffID, &row.businessID, &row.phone, &row.name, &row.title, &row.biz)
	if err == sql.ErrNoRows {
		return row, fail(404, "NOT_FOUND", "این دعوت دیگر معتبر نیست")
	}
	return row, err
}

func maskPhone(phone string) string {
	if len(phone) < 8 {
		return phone
	}
	return phone[:4] + "****" + phone[len(phone)-3:]
}

func (s *Service) ownStaffID(q querier, userID, businessID string) (string, error) {
	role, err := s.roleOf(q, userID, businessID)
	if err != nil {
		return "", err
	}
	if role != "staff" {
		return "", nil
	}
	var id string
	err = q.QueryRow(`SELECT id FROM staff WHERE business_id = ? AND user_id = ?`, businessID, userID).Scan(&id)
	if err == sql.ErrNoRows {
		return "", fail(403, "FORBIDDEN", "پرسنل این حساب پیدا نشد")
	}
	return id, err
}

func (s *Service) DeleteService(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	serviceID, err := textOf(raw, "id", 80, "")
	if err != nil || serviceID == "" {
		return nil, fail(400, "VALIDATION", "خدمت پیدا نشد")
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager"); err != nil {
		return nil, err
	}
	var n int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM bookings WHERE business_id = ? AND service_id = ?`, businessID, serviceID).Scan(&n); err != nil {
		return nil, err
	}
	if n > 0 {
		return nil, fail(400, "VALIDATION", "این خدمت نوبت دارد و حذف نمی‌شود")
	}
	if _, err := s.db.Exec(`DELETE FROM staff_services WHERE service_id = ?`, serviceID); err != nil {
		return nil, err
	}
	res, err := s.db.Exec(`DELETE FROM services WHERE id = ? AND business_id = ?`, serviceID, businessID)
	if err != nil {
		return nil, err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return nil, fail(404, "NOT_FOUND", "خدمت پیدا نشد")
	}
	return map[string]any{"serviceId": serviceID}, nil
}

func (s *Service) DeleteStaff(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	staffID, err := textOf(raw, "id", 80, "")
	if err != nil || staffID == "" {
		return nil, fail(400, "VALIDATION", "پرسنل پیدا نشد")
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager"); err != nil {
		return nil, err
	}
	var n int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM bookings WHERE business_id = ? AND staff_id = ?`, businessID, staffID).Scan(&n); err != nil {
		return nil, err
	}
	if n > 0 {
		return nil, fail(400, "VALIDATION", "این پرسنل نوبت دارد و حذف نمی‌شود")
	}
	for _, stmt := range []string{
		`DELETE FROM working_hours WHERE staff_id = ?`,
		`DELETE FROM breaks WHERE staff_id = ?`,
		`DELETE FROM staff_services WHERE staff_id = ?`,
		`DELETE FROM holidays WHERE staff_id = ?`,
	} {
		if _, err := s.db.Exec(stmt, staffID); err != nil {
			return nil, err
		}
	}
	res, err := s.db.Exec(`DELETE FROM staff WHERE id = ? AND business_id = ?`, staffID, businessID)
	if err != nil {
		return nil, err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return nil, fail(404, "NOT_FOUND", "پرسنل پیدا نشد")
	}
	return map[string]any{"staffId": staffID}, nil
}

func (s *Service) SaveSchedule(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	staffID, err := textOf(raw, "staffId", 80, "")
	if err != nil {
		return nil, err
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager"); err != nil {
		return nil, err
	}
	var exists string
	if err := s.db.QueryRow(`SELECT id FROM staff WHERE id = ? AND business_id = ?`, staffID, businessID).Scan(&exists); err != nil {
		return nil, fail(404, "NOT_FOUND", "پرسنل پیدا نشد")
	}
	if _, err := s.db.Exec(`DELETE FROM working_hours WHERE staff_id = ?`, staffID); err != nil {
		return nil, err
	}
	if _, err := s.db.Exec(`DELETE FROM breaks WHERE staff_id = ?`, staffID); err != nil {
		return nil, err
	}
	days, _ := raw["days"].([]any)
	if len(days) > 7 {
		days = days[:7]
	}
	for _, rawDay := range days {
		day, ok := rawDay.(map[string]any)
		if !ok {
			return nil, fail(400, "VALIDATION", "درخواست نامعتبر است")
		}
		if day["enabled"] == false {
			continue
		}
		weekday, err := intOf(day, "weekday", 0, 6)
		if err != nil {
			return nil, err
		}
		if ranges, ok := day["ranges"].([]any); ok {
			if len(ranges) > 6 {
				return nil, fail(400, "VALIDATION", "بازه‌های یک روز زیاد است")
			}
			for _, rawRange := range ranges {
				rg, ok := rawRange.(map[string]any)
				if !ok {
					return nil, fail(400, "VALIDATION", "درخواست نامعتبر است")
				}
				startMin, err := intOf(rg, "startMin", 0, 1439)
				if err != nil {
					return nil, err
				}
				endMin, err := intOf(rg, "endMin", 1, 1440)
				if err != nil {
					return nil, err
				}
				if endMin <= startMin {
					return nil, fail(400, "VALIDATION", "ساعت پایان باید بعد از شروع باشد")
				}
				if _, err := s.db.Exec(`INSERT INTO working_hours (id, staff_id, weekday, start_min, end_min) VALUES (?,?,?,?,?)`, newID(), staffID, weekday, startMin, endMin); err != nil {
					return nil, err
				}
			}
			continue
		}
		startMin, err := intOf(day, "startMin", 0, 1439)
		if err != nil {
			return nil, err
		}
		endMin, err := intOf(day, "endMin", 1, 1440)
		if err != nil {
			return nil, err
		}
		if endMin <= startMin {
			return nil, fail(400, "VALIDATION", "ساعت پایان باید بعد از شروع باشد")
		}
		if _, err := s.db.Exec(`INSERT INTO working_hours (id, staff_id, weekday, start_min, end_min) VALUES (?,?,?,?,?)`, newID(), staffID, weekday, startMin, endMin); err != nil {
			return nil, err
		}
		if day["breakStart"] == nil || day["breakEnd"] == nil || day["breakStart"] == "" || day["breakEnd"] == "" {
			continue
		}
		bs, err := intOf(day, "breakStart", 0, 1439)
		if err != nil {
			return nil, err
		}
		be, err := intOf(day, "breakEnd", 1, 1440)
		if err != nil {
			return nil, err
		}
		if be <= bs || bs < startMin || be > endMin {
			return nil, fail(400, "VALIDATION", "بازه استراحت باید داخل ساعت کاری باشد")
		}
		if _, err := s.db.Exec(`INSERT INTO breaks (id, staff_id, weekday, start_min, end_min) VALUES (?,?,?,?,?)`, newID(), staffID, weekday, bs, be); err != nil {
			return nil, err
		}
	}
	return map[string]any{"staffId": staffID}, nil
}

func (s *Service) AddHoliday(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	date, err := dayOf(raw["date"])
	if err != nil {
		return nil, err
	}
	staffID, _ := textOf(raw, "staffId", 80, "")
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff"); err != nil {
		return nil, err
	}
	var staff any
	if staffID != "" {
		var id string
		if err := s.db.QueryRow(`SELECT id FROM staff WHERE id = ? AND business_id = ?`, staffID, businessID).Scan(&id); err != nil {
			return nil, fail(404, "NOT_FOUND", "پرسنل پیدا نشد")
		}
		staff = staffID
	}
	note, _ := textOf(raw, "note", 120, "")
	holidayID := newID()
	if _, err := s.db.Exec(`INSERT INTO holidays (id, business_id, staff_id, date_local, note) VALUES (?,?,?,?,?)`, holidayID, businessID, staff, date, note); err != nil {
		return nil, err
	}
	return map[string]any{"holidayId": holidayID}, nil
}

func (s *Service) RemoveHoliday(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, err := textOf(raw, "businessId", 80, "")
	if err != nil {
		return nil, err
	}
	holidayID, err := textOf(raw, "holidayId", 80, "")
	if err != nil {
		return nil, err
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff"); err != nil {
		return nil, err
	}
	if _, err := s.db.Exec(`DELETE FROM holidays WHERE id = ? AND business_id = ?`, holidayID, businessID); err != nil {
		return nil, err
	}
	return map[string]any{"removed": true}, nil
}

func (s *Service) ListCustomers(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, _ := textOf(raw, "businessId", 80, "")
	q, _ := textOf(raw, "q", 80, "")
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff"); err != nil {
		return nil, err
	}
	rows, err := s.db.Query(`
		SELECT c.id, c.name, c.phone, c.notes, c.group_name, c.first_name, c.last_name, c.birth_date, c.address, c.customer_note, COUNT(b.id), MAX(b.starts_at)
		FROM customers c
		LEFT JOIN bookings b ON b.customer_id = c.id AND b.status <> 'cancelled'
		WHERE c.business_id = ?
		  AND (? = '' OR c.name LIKE ? ESCAPE '\' OR c.phone LIKE ? ESCAPE '\')
		GROUP BY c.id ORDER BY c.created_at DESC LIMIT 80`, businessID, q, like(q), like(q))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, name, phone, notes, groupName, firstName, lastName, birth, address, customerNote string
		var visits int
		var last sql.NullString
		if err := rows.Scan(&id, &name, &phone, &notes, &groupName, &firstName, &lastName, &birth, &address, &customerNote, &visits, &last); err != nil {
			return nil, err
		}
		if firstName == "" {
			firstName, lastName = splitPersonName(name)
		}
		var lastVal any
		if last.Valid {
			lastVal = last.String
		}
		out = append(out, map[string]any{
			"id": id, "name": name, "firstName": firstName, "lastName": lastName, "phone": phone,
			"notes": notes, "customerNote": customerNote, "birthDate": birth, "address": address,
			"group": groupName, "visits": visits, "lastVisit": lastVal,
		})
	}
	return out, rows.Err()
}

func (s *Service) SaveCustomer(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, _ := textOf(raw, "businessId", 80, "")
	firstName, _ := textOf(raw, "firstName", 40, "")
	lastName, _ := textOf(raw, "lastName", 40, "")
	name, err := textOf(raw, "name", 80, "")
	if firstName != "" || lastName != "" {
		name = strings.TrimSpace(firstName + " " + lastName)
	} else {
		firstName, lastName = splitPersonName(name)
	}
	if err != nil || len([]rune(strings.TrimSpace(name))) < 2 {
		if err != nil {
			return nil, err
		}
		return nil, fail(400, "VALIDATION", "نام مشتری را وارد کنید")
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff"); err != nil {
		return nil, err
	}
	phone, _ := textOf(raw, "phone", 20, "")
	_, hasNotes := raw["notes"]
	notes, _ := textOf(raw, "notes", 500, "")
	_, hasCustomerNote := raw["customerNote"]
	customerNote, _ := textOf(raw, "customerNote", 500, "")
	_, hasBirth := raw["birthDate"]
	birth, _ := textOf(raw, "birthDate", 10, "")
	_, hasAddress := raw["address"]
	address, _ := textOf(raw, "address", 200, "")
	groupName, _ := textOf(raw, "group", 40, "")
	if groupName != "" {
		if !defaultCustomerGroup(groupName) {
			var n int
			if err := s.db.QueryRow(`SELECT COUNT(*) FROM customer_groups WHERE business_id = ? AND name = ?`, businessID, groupName).Scan(&n); err != nil {
				return nil, err
			}
			if n == 0 {
				return nil, fail(400, "VALIDATION", "گروه مشتری پیدا نشد")
			}
		}
	}
	customerID, _ := textOf(raw, "id", 80, "")
	if customerID == "" {
		customerID = newID()
	}
	var existing string
	err = s.db.QueryRow(`SELECT id FROM customers WHERE id = ? AND business_id = ?`, customerID, businessID).Scan(&existing)
	if err == nil {
		if !hasNotes || !hasCustomerNote || !hasBirth || !hasAddress {
			var oldNotes, oldCustomer, oldBirth, oldAddress string
			_ = s.db.QueryRow(`SELECT notes, customer_note, birth_date, address FROM customers WHERE id = ?`, customerID).Scan(&oldNotes, &oldCustomer, &oldBirth, &oldAddress)
			if !hasNotes {
				notes = oldNotes
			}
			if !hasCustomerNote {
				customerNote = oldCustomer
			}
			if !hasBirth {
				birth = oldBirth
			}
			if !hasAddress {
				address = oldAddress
			}
		}
		_, err = s.db.Exec(`UPDATE customers SET name=?, first_name=?, last_name=?, phone=?, notes=?, customer_note=?, birth_date=?, address=?, group_name=? WHERE id=?`,
			name, firstName, lastName, phone, notes, customerNote, birth, address, groupName, customerID)
	} else if err == sql.ErrNoRows {
		_, err = s.db.Exec(`INSERT INTO customers (id, business_id, name, first_name, last_name, phone, notes, customer_note, birth_date, address, group_name, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
			customerID, businessID, name, firstName, lastName, phone, notes, customerNote, birth, address, groupName, s.now().UTC().Format(time.RFC3339))
	}
	if err != nil {
		return nil, err
	}
	return map[string]any{"customerId": customerID}, nil
}

func splitPersonName(full string) (string, string) {
	full = strings.TrimSpace(full)
	parts := strings.Fields(full)
	if len(parts) == 0 {
		return "", ""
	}
	if len(parts) == 1 {
		return parts[0], ""
	}
	return parts[0], strings.Join(parts[1:], " ")
}

var builtinGroups = []string{"همکاران", "کارکنان", "بستگان", "سازمانی", "مشتریان ویژه", "بدون گروه"}

func defaultCustomerGroup(name string) bool {
	for _, item := range builtinGroups {
		if item == name {
			return true
		}
	}
	return false
}

func (s *Service) SaveCustomerGroup(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, _ := textOf(raw, "businessId", 80, "")
	name, err := textOf(raw, "name", 40, "")
	if err != nil || len([]rune(name)) < 2 {
		return nil, fail(400, "VALIDATION", "نام گروه را وارد کنید")
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager"); err != nil {
		return nil, err
	}
	if defaultCustomerGroup(name) {
		return nil, fail(400, "VALIDATION", "این گروه پیش‌فرض است")
	}
	id := newID()
	if _, err := s.db.Exec(`INSERT INTO customer_groups (id, business_id, name) VALUES (?,?,?)`, id, businessID, name); err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			return nil, fail(400, "VALIDATION", "این گروه وجود دارد")
		}
		return nil, err
	}
	return map[string]any{"id": id, "name": name}, nil
}

func (s *Service) RenameCustomerGroup(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, _ := textOf(raw, "businessId", 80, "")
	id, err := textOf(raw, "id", 80, "")
	if err != nil || id == "" {
		return nil, fail(400, "VALIDATION", "گروه پیدا نشد")
	}
	name, err := textOf(raw, "name", 40, "")
	if err != nil || len([]rune(name)) < 2 {
		return nil, fail(400, "VALIDATION", "نام گروه را وارد کنید")
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager"); err != nil {
		return nil, err
	}
	if defaultCustomerGroup(name) {
		return nil, fail(400, "VALIDATION", "این گروه پیش‌فرض است")
	}
	var previous string
	if err := s.db.QueryRow(`SELECT name FROM customer_groups WHERE id = ? AND business_id = ?`, id, businessID).Scan(&previous); err != nil {
		return nil, fail(404, "NOT_FOUND", "گروه پیدا نشد")
	}
	if _, err := s.db.Exec(`UPDATE customer_groups SET name = ? WHERE id = ? AND business_id = ?`, name, id, businessID); err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			return nil, fail(400, "VALIDATION", "این گروه وجود دارد")
		}
		return nil, err
	}
	if _, err := s.db.Exec(`UPDATE customers SET group_name = ? WHERE business_id = ? AND group_name = ?`, name, businessID, previous); err != nil {
		return nil, err
	}
	return map[string]any{"id": id, "name": name}, nil
}

func (s *Service) DeleteCustomerGroup(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, _ := textOf(raw, "businessId", 80, "")
	id, err := textOf(raw, "id", 80, "")
	if err != nil || id == "" {
		return nil, fail(400, "VALIDATION", "گروه پیدا نشد")
	}
	if _, err := s.requireRole(s.db, userID, businessID, "owner", "manager"); err != nil {
		return nil, err
	}
	var name string
	if err := s.db.QueryRow(`SELECT name FROM customer_groups WHERE id = ? AND business_id = ?`, id, businessID).Scan(&name); err != nil {
		return nil, fail(404, "NOT_FOUND", "گروه پیدا نشد")
	}
	if _, err := s.db.Exec(`DELETE FROM customer_groups WHERE id = ? AND business_id = ?`, id, businessID); err != nil {
		return nil, err
	}
	if _, err := s.db.Exec(`UPDATE customers SET group_name = ? WHERE business_id = ? AND group_name = ?`, "بدون گروه", businessID, name); err != nil {
		return nil, err
	}
	return map[string]any{"ok": true}, nil
}

func (s *Service) Dashboard(userID string, raw map[string]any) (any, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	businessID, _ := textOf(raw, "businessId", 80, "")
	role, err := s.requireRole(s.db, userID, businessID, "owner", "manager", "staff")
	if err != nil {
		return nil, err
	}
	ownStaff := ""
	if role == "staff" {
		ownStaff, err = s.ownStaffID(s.db, userID, businessID)
		if err != nil {
			return nil, err
		}
	}
	b, err := loadBiz(s.db, "id = ?", businessID)
	if err != nil {
		return nil, err
	}
	loc := mustZone(b.Timezone)
	from, _ := textOf(raw, "from", 10, "")
	if from == "" {
		from = booking.TodayYMD(loc, s.now())
	}
	from, err = dayOf(from)
	if err != nil {
		return nil, err
	}
	to, _ := textOf(raw, "to", 10, "")
	if to == "" {
		to = booking.AddDaysYMD(from, 6, loc)
	}
	to, err = dayOf(to)
	if err != nil {
		return nil, err
	}
	start := booking.ISO(booking.AtLocalMinute(from, 0, loc))
	end := booking.ISO(booking.AtLocalMinute(to, 1440, loc))
	statusSQL := `SELECT status, COUNT(*) FROM bookings WHERE business_id = ? AND starts_at >= ? AND starts_at < ?`
	statusArgs := []any{businessID, start, end}
	if ownStaff != "" {
		statusSQL += ` AND staff_id = ?`
		statusArgs = append(statusArgs, ownStaff)
	}
	statusSQL += ` GROUP BY status`
	crows, err := s.db.Query(statusSQL, statusArgs...)
	if err != nil {
		return nil, err
	}
	byStatus := map[string]int{}
	for crows.Next() {
		var status string
		var n int
		_ = crows.Scan(&status, &n)
		byStatus[status] = n
	}
	crows.Close()
	var staffIDs []string
	if ownStaff != "" {
		staffIDs = []string{ownStaff}
	} else {
		srows, _ := s.db.Query(`SELECT id FROM staff WHERE business_id = ? AND active = 1`, businessID)
		for srows.Next() {
			var id string
			_ = srows.Scan(&id)
			staffIDs = append(staffIDs, id)
		}
		srows.Close()
	}
	type win struct{ staff, kind string; weekday, start, end int }
	var hours, breaks []win
	hrows, _ := s.db.Query(`SELECT staff_id, weekday, start_min, end_min FROM working_hours WHERE staff_id IN (SELECT id FROM staff WHERE business_id = ? AND active = 1)`, businessID)
	for hrows.Next() {
		var w win
		_ = hrows.Scan(&w.staff, &w.weekday, &w.start, &w.end)
		hours = append(hours, w)
	}
	hrows.Close()
	brows, _ := s.db.Query(`SELECT staff_id, weekday, start_min, end_min FROM breaks WHERE staff_id IN (SELECT id FROM staff WHERE business_id = ?)`, businessID)
	for brows.Next() {
		var w win
		_ = brows.Scan(&w.staff, &w.weekday, &w.start, &w.end)
		breaks = append(breaks, w)
	}
	brows.Close()
	type hol struct{ staff sql.NullString; date string }
	var holidays []hol
	orows, _ := s.db.Query(`SELECT staff_id, date_local FROM holidays WHERE business_id = ? AND date_local >= ? AND date_local <= ?`, businessID, from, to)
	for orows.Next() {
		var h hol
		_ = orows.Scan(&h.staff, &h.date)
		holidays = append(holidays, h)
	}
	orows.Close()
	var busy []booking.BusyInterval
	busySQL := `SELECT starts_at, buffer_until FROM bookings WHERE business_id = ? AND status IN ('pending','confirmed','completed') AND buffer_until > ? AND starts_at < ?`
	busyArgs := []any{businessID, start, end}
	if ownStaff != "" {
		busySQL += ` AND staff_id = ?`
		busyArgs = append(busyArgs, ownStaff)
	}
	urows, _ := s.db.Query(busySQL, busyArgs...)
	for urows.Next() {
		var a, z string
		_ = urows.Scan(&a, &z)
		as, _ := time.Parse(time.RFC3339Nano, a)
		zs, _ := time.Parse(time.RFC3339Nano, z)
		busy = append(busy, booking.BusyInterval{StartsAt: as, BufferUntil: zs})
	}
	urows.Close()
	available, occupied := 0, 0
	for day := from; day <= to; day = booking.AddDaysYMD(day, 1, loc) {
		weekday := booking.WeekdayOfYMD(day, loc)
		closed := false
		off := map[string]bool{}
		for _, h := range holidays {
			if len(h.date) >= 10 && h.date[:10] == day {
				if !h.staff.Valid || h.staff.String == "" {
					closed = true
				} else {
					off[h.staff.String] = true
				}
			}
		}
		for _, member := range staffIDs {
			if closed || off[member] {
				continue
			}
			minutes := 0
			var windows []win
			for _, w := range hours {
				if w.staff == member && w.weekday == weekday {
					minutes += w.end - w.start
					windows = append(windows, w)
				}
			}
			for _, rest := range breaks {
				if rest.staff != member || rest.weekday != weekday {
					continue
				}
				for _, w := range windows {
					a, z := rest.start, rest.end
					if w.start > a {
						a = w.start
					}
					if w.end < z {
						z = w.end
					}
					if z > a {
						minutes -= z - a
					}
				}
			}
			if minutes > 0 {
				available += minutes
			}
		}
		occupied += booking.OccupiedMinutesOnDay(busy, day, loc)
		if day == to {
			break
		}
	}
	today := booking.TodayYMD(loc, s.now())
	todayStart := booking.ISO(booking.AtLocalMinute(today, 0, loc))
	todayEnd := booking.ISO(booking.AtLocalMinute(today, 1440, loc))
	todaySQL := `SELECT COUNT(*) FROM bookings WHERE business_id = ? AND status IN ('confirmed','pending') AND starts_at >= ? AND starts_at < ?`
	todayArgs := []any{businessID, todayStart, todayEnd}
	if ownStaff != "" {
		todaySQL += ` AND staff_id = ?`
		todayArgs = append(todayArgs, ownStaff)
	}
	var todayN int
	_ = s.db.QueryRow(todaySQL, todayArgs...).Scan(&todayN)
	free := available - occupied
	if free < 0 {
		free = 0
	}
	booked, cancelled, completed, revenue := 0, 0, 0, 0
	viewsSeries := make([]int, 30)
	visitorSeries := make([]int, 30)
	salesSeries := make([]int, 30)
	revenueSeries := make([]int, 30)
	days := make([]string, 30)
	dayIndex := map[string]int{}
	for i := 0; i < 30; i++ {
		days[i] = booking.AddDaysYMD(today, i-29, loc)
		dayIndex[days[i]] = i
	}
	vrows, verr := s.db.Query(`SELECT day, views, visitors FROM page_view_days WHERE business_id = ? AND day >= ? AND day <= ?`, businessID, days[0], days[29])
	viewTotal, visitorTotal, clickTotal := 0, 0, 0
	prevViews, prevVisitors, prevClicks := 0, 0, 0
	prevBooked, prevCancelled, prevCompleted, prevRevenue := 0, 0, 0, 0
	prevStart := booking.AddDaysYMD(days[0], -30, loc)
	if verr == nil {
		for vrows.Next() {
			var day string
			var views, visitors int
			_ = vrows.Scan(&day, &views, &visitors)
			if i, ok := dayIndex[day]; ok {
				viewsSeries[i] = views
				visitorSeries[i] = visitors
				viewTotal += views
				visitorTotal += visitors
			}
		}
		vrows.Close()
	}
	prows, perr := s.db.Query(`SELECT day, views, visitors FROM page_view_days WHERE business_id = ? AND day >= ? AND day < ?`, businessID, prevStart, days[0])
	if perr == nil {
		for prows.Next() {
			var day string
			var views, visitors int
			_ = prows.Scan(&day, &views, &visitors)
			prevViews += views
			prevVisitors += visitors
		}
		prows.Close()
	}
	crows2, cerr := s.db.Query(`SELECT day, clicks FROM page_clicks WHERE business_id = ? AND day >= ? AND day <= ?`, businessID, prevStart, days[29])
	if cerr == nil {
		for crows2.Next() {
			var day string
			var n int
			_ = crows2.Scan(&day, &n)
			if _, ok := dayIndex[day]; ok {
				clickTotal += n
			} else if day >= prevStart && day < days[0] {
				prevClicks += n
			}
		}
		crows2.Close()
	}
	fromInstant := booking.ISO(booking.AtLocalMinute(prevStart, 0, loc))
	bookSQL := `SELECT b.status, b.starts_at, COALESCE(sv.price_toman, 0)
		FROM bookings b LEFT JOIN services sv ON sv.id = b.service_id
		WHERE b.business_id = ? AND b.starts_at >= ?`
	bookArgs := []any{businessID, fromInstant}
	if ownStaff != "" {
		bookSQL += ` AND b.staff_id = ?`
		bookArgs = append(bookArgs, ownStaff)
		viewTotal, visitorTotal, clickTotal = 0, 0, 0
		prevViews, prevVisitors, prevClicks = 0, 0, 0
		for i := range viewsSeries {
			viewsSeries[i] = 0
			visitorSeries[i] = 0
		}
	}
	brows, berr := s.db.Query(bookSQL, bookArgs...)
	if berr == nil {
		for brows.Next() {
			var status, at string
			var price int
			if err := brows.Scan(&status, &at, &price); err != nil {
				continue
			}
			when, err := time.Parse(time.RFC3339Nano, at)
			if err != nil {
				when, err = time.Parse(time.RFC3339, at)
			}
			day := ""
			if err == nil {
				day = booking.TodayYMD(loc, when)
			}
			i, ok := dayIndex[day]
			switch status {
			case "cancelled":
				if ok {
					cancelled++
				} else if day >= prevStart && day < days[0] {
					prevCancelled++
				}
			case "completed":
				if ok {
					completed++
					revenue += price
					salesSeries[i]++
					revenueSeries[i] += price
				} else if day >= prevStart && day < days[0] {
					prevCompleted++
					prevRevenue += price
				}
			case "pending", "confirmed":
				if ok {
					booked++
				} else if day >= prevStart && day < days[0] {
					prevBooked++
				}
			}
		}
		brows.Close()
	}
	booked += completed
	prevBooked += prevCompleted
	return map[string]any{
		"from": from, "to": to, "timezone": b.Timezone, "today": todayN, "byStatus": byStatus,
		"capacity": map[string]any{"availableMinutes": available, "occupiedMinutes": occupied, "freeMinutes": free, "formula": capacityFormula},
		"stats": map[string]any{
			"views": viewTotal, "visitors": visitorTotal, "clicks": clickTotal,
			"booked": booked, "cancelled": cancelled, "completed": completed, "sales": completed, "revenueToman": revenue,
			"prevViews": prevViews, "prevVisitors": prevVisitors, "prevClicks": prevClicks,
			"prevBooked": prevBooked, "prevCancelled": prevCancelled, "prevCompleted": prevCompleted, "prevRevenueToman": prevRevenue,
		},
		"series": map[string]any{
			"views": viewsSeries, "visitors": visitorSeries, "sales": salesSeries, "revenue": revenueSeries,
		},
		"overdue": s.overdueList(businessID, ownStaff),
	}, nil
}
