package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	youtube "github.com/kkdai/youtube/v2"
)

type infoFormat struct {
	FormatID   string `json:"format_id"`
	Resolution string `json:"resolution"`
	Height     int    `json:"height"`
	Ext        string `json:"ext"`
	Filesize   int64  `json:"filesize"`
}

type infoResponse struct {
	Title     string       `json:"title"`
	Thumbnail string       `json:"thumbnail"`
	Duration  int          `json:"duration"`
	Formats   []infoFormat `json:"formats"`
}

type cachedInfo struct {
	ExpiresAt time.Time
	Value     infoResponse
}

type ttlCache struct {
	mu    sync.RWMutex
	items map[string]cachedInfo
	ttl   time.Duration
	max   int
}

func newTTLCache(ttl time.Duration, max int) *ttlCache {
	return &ttlCache{items: make(map[string]cachedInfo), ttl: ttl, max: max}
}

func (c *ttlCache) Get(key string) (infoResponse, bool) {
	c.mu.RLock()
	item, ok := c.items[key]
	c.mu.RUnlock()
	if !ok {
		return infoResponse{}, false
	}
	if time.Now().After(item.ExpiresAt) {
		c.mu.Lock()
		delete(c.items, key)
		c.mu.Unlock()
		return infoResponse{}, false
	}
	return item.Value, true
}

func (c *ttlCache) Set(key string, val infoResponse) {
	c.mu.Lock()
	if len(c.items) >= c.max {
		c.items = make(map[string]cachedInfo)
	}
	c.items[key] = cachedInfo{ExpiresAt: time.Now().Add(c.ttl), Value: val}
	c.mu.Unlock()
}

var (
	ytClient  youtube.Client
	infoCache = newTTLCache(5*time.Minute, 256)

	filenameRe = regexp.MustCompile(`[^A-Za-z0-9\s\-_.]+`)
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/info", withCORS(handleInfo))
	mux.HandleFunc("/api/download", withCORS(handleDownload))

	srv := &http.Server{
		Addr:              ":8001",
		Handler:           mux,
		ReadHeaderTimeout: 10 * time.Second,
	}

	_ = srv.ListenAndServe()
}

func withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

func handleInfo(w http.ResponseWriter, r *http.Request) {
	rawURL := r.URL.Query().Get("url")
	if rawURL == "" {
		writeJSONError(w, http.StatusBadRequest, "Invalid YouTube URL")
		return
	}

	normalized, err := normalizeYouTubeURL(rawURL)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "Invalid YouTube URL")
		return
	}

	if cached, ok := infoCache.Get(normalized); ok {
		writeJSON(w, http.StatusOK, cached)
		return
	}

	v, err := ytClient.GetVideo(normalized)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	resp := buildInfoResponse(v)
	infoCache.Set(normalized, resp)
	writeJSON(w, http.StatusOK, resp)
}

func handleDownload(w http.ResponseWriter, r *http.Request) {
	rawURL := r.URL.Query().Get("url")
	if rawURL == "" {
		writeJSONError(w, http.StatusBadRequest, "Invalid YouTube URL")
		return
	}

	normalized, err := normalizeYouTubeURL(rawURL)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "Invalid YouTube URL")
		return
	}

	formatParam := r.URL.Query().Get("format")
	if formatParam == "" {
		formatParam = "mp4"
	}

	v, err := ytClient.GetVideo(normalized)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	title := sanitizeFilename(v.Title)

	isAudio := formatParam == "mp3"
	qualityID := r.URL.Query().Get("quality_id")

	// Fallback to yt-dlp binary if we want to use that logic.
	// But it seems yt-dlp is not installed globally on this machine.
	// Let's use the pure Go library (github.com/kkdai/youtube/v2) to download the stream directly.
	if isAudio {
		audioFmt, ok := pickBestAudioFormat(v)
		if !ok {
			writeJSONError(w, http.StatusInternalServerError, "No audio formats available")
			return
		}
		stream, size, err := ytClient.GetStream(v, &audioFmt)
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}
		defer stream.Close()

		w.Header().Set("Content-Type", "application/octet-stream")
		w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s.m4a"`, title))
		if size > 0 {
			w.Header().Set("Content-Length", strconv.FormatInt(size, 10))
		}
		w.WriteHeader(http.StatusOK)
		_ = copyStream(r, w, stream)
		return
	}

	var chosen youtube.Format
	if qualityID != "" {
		itag, err := strconv.Atoi(qualityID)
		if err == nil {
			if fmtPicked, ok := findFormatByItag(v, itag); ok {
				chosen = fmtPicked
			}
		}
	}

	if chosen.ItagNo == 0 {
		if fmtPicked, ok := pickBestMP4(v); ok {
			chosen = fmtPicked
		} else {
			writeJSONError(w, http.StatusInternalServerError, "No MP4 formats available")
			return
		}
	}

	// Fallback to proxy stream if GetStreamURL fails
	stream, size, err := ytClient.GetStream(v, &chosen)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer stream.Close()

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s.mp4"`, title))
	if size > 0 {
		w.Header().Set("Content-Length", strconv.FormatInt(size, 10))
	}
	w.WriteHeader(http.StatusOK)
	_ = copyStream(r, w, stream)
}

func copyStream(r *http.Request, w http.ResponseWriter, src io.Reader) error {
	buf := make([]byte, 32*1024)
	done := make(chan struct{})
	go func() {
		select {
		case <-r.Context().Done():
			if c, ok := src.(io.Closer); ok {
				_ = c.Close()
			}
		case <-done:
		}
	}()
	_, err := io.CopyBuffer(w, src, buf)
	close(done)
	return err
}

func buildInfoResponse(v *youtube.Video) infoResponse {
	thumbnail := ""
	if len(v.Thumbnails) > 0 {
		best := v.Thumbnails[0]
		for _, t := range v.Thumbnails {
			if t.Width > best.Width {
				best = t
			}
		}
		thumbnail = best.URL
	}

	duration := int(v.Duration.Seconds())

	formats := make([]infoFormat, 0, 16)
	seenHeights := make(map[int]struct{})

	videoFormats := make([]youtube.Format, 0, len(v.Formats))
	for _, f := range v.Formats {
		if f.Height <= 0 {
			continue
		}
		if !strings.Contains(f.MimeType, "video/mp4") {
			continue
		}
		videoFormats = append(videoFormats, f)
	}

	sort.Slice(videoFormats, func(i, j int) bool {
		if videoFormats[i].Height == videoFormats[j].Height {
			if videoFormats[i].AudioChannels == videoFormats[j].AudioChannels {
				return videoFormats[i].Bitrate > videoFormats[j].Bitrate
			}
			return videoFormats[i].AudioChannels > videoFormats[j].AudioChannels
		}
		return videoFormats[i].Height > videoFormats[j].Height
	})

	for _, f := range videoFormats {
		if _, ok := seenHeights[f.Height]; ok {
			continue
		}
		seenHeights[f.Height] = struct{}{}
		formats = append(formats, infoFormat{
			FormatID:   strconv.Itoa(f.ItagNo),
			Resolution: fmt.Sprintf("%dp", f.Height),
			Height:     f.Height,
			Ext:        "mp4",
			Filesize:   f.ContentLength,
		})
	}

	return infoResponse{
		Title:     v.Title,
		Thumbnail: thumbnail,
		Duration:  duration,
		Formats:   formats,
	}
}

func findFormatByItag(v *youtube.Video, itag int) (youtube.Format, bool) {
	for _, f := range v.Formats {
		if f.ItagNo == itag && f.Height > 0 && strings.Contains(f.MimeType, "video/mp4") {
			return f, true
		}
	}
	return youtube.Format{}, false
}

func pickBestMP4(v *youtube.Video) (youtube.Format, bool) {
	var best youtube.Format
	for _, f := range v.Formats {
		if f.Height <= 0 {
			continue
		}
		if !strings.Contains(f.MimeType, "video/mp4") {
			continue
		}
		if best.ItagNo == 0 || f.Height > best.Height {
			best = f
			continue
		}
		if f.Height < best.Height {
			continue
		}
		if f.AudioChannels > best.AudioChannels {
			best = f
			continue
		}
		if f.AudioChannels == best.AudioChannels && f.Bitrate > best.Bitrate {
			best = f
		}
	}
	if best.ItagNo == 0 {
		return youtube.Format{}, false
	}
	return best, true
}

func pickBestAudioFormat(v *youtube.Video) (youtube.Format, bool) {
	var best youtube.Format
	for _, f := range v.Formats {
		if f.AudioChannels == 0 {
			continue
		}
		if !strings.Contains(f.MimeType, "audio/") {
			continue
		}
		if best.ItagNo == 0 || f.Bitrate > best.Bitrate {
			best = f
		}
	}
	if best.ItagNo == 0 {
		return youtube.Format{}, false
	}
	return best, true
}

func normalizeYouTubeURL(raw string) (string, error) {
	u, err := url.Parse(raw)
	if err != nil {
		return "", err
	}
	host := strings.ToLower(u.Host)
	path := strings.Trim(u.Path, "/")

	var id string

	if strings.Contains(host, "youtu.be") {
		id = path
	} else if strings.Contains(path, "shorts/") {
		parts := strings.Split(path, "/")
		for i := 0; i < len(parts)-1; i++ {
			if parts[i] == "shorts" {
				id = parts[i+1]
				break
			}
		}
	} else if strings.Contains(path, "embed/") {
		parts := strings.Split(path, "/")
		for i := 0; i < len(parts)-1; i++ {
			if parts[i] == "embed" {
				id = parts[i+1]
				break
			}
		}
	} else {
		q := u.Query()
		id = q.Get("v")
	}

	id = strings.TrimSpace(id)
	if id == "" {
		return "", errors.New("missing video id")
	}
	if strings.Contains(id, "&") {
		id = strings.Split(id, "&")[0]
	}
	return "https://www.youtube.com/watch?v=" + id, nil
}

func sanitizeFilename(title string) string {
	replacements := map[rune]rune{
		'ə': 'e', 'Ə': 'E',
		'ı': 'i', 'İ': 'I',
		'ö': 'o', 'Ö': 'O',
		'ü': 'u', 'Ü': 'U',
		'ş': 's', 'Ş': 'S',
		'ç': 'c', 'Ç': 'C',
		'ğ': 'g', 'Ğ': 'G',
	}
	var b strings.Builder
	b.Grow(len(title))
	for _, r := range title {
		if rr, ok := replacements[r]; ok {
			r = rr
		}
		if r > 127 {
			continue
		}
		b.WriteRune(r)
	}
	cleaned := filenameRe.ReplaceAllString(b.String(), "")
	cleaned = strings.TrimSpace(cleaned)
	if cleaned == "" {
		return "video"
	}
	if len(cleaned) > 120 {
		cleaned = cleaned[:120]
	}
	return cleaned
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeJSONError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]any{"detail": message})
}
