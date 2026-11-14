package server

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"video-factory/internal/channel"
	"video-factory/internal/config"
	"video-factory/internal/job"
	"video-factory/internal/llm"
	"video-factory/internal/qc"
	"video-factory/internal/render"
	"video-factory/internal/script"
	"video-factory/internal/tts"
)

type Server struct {
	cfg          *config.Config
	channels     map[string]*channel.ChannelConfig
	jobManager   *job.JobManager
	llmClient    *llm.LLMClient
	ttsClient    *tts.TTSClient
	renderEngine *render.RenderEngine
	webDir       string
}

func NewServer(cfg *config.Config, webDir string) (*Server, error) {
	// 1. Load all channels from channels directory
	channelsMap := make(map[string]*channel.ChannelConfig)
	entries, err := os.ReadDir(cfg.ChannelsDir)
	if err == nil {
		for _, entry := range entries {
			if entry.IsDir() {
				ch, chErr := channel.LoadChannelConfig(cfg.ChannelsDir, entry.Name())
				if chErr == nil {
					channelsMap[ch.ID] = ch
				}
			}
		}
	}

	// 2. Fallback ensure default channels exist
	if len(channelsMap) == 0 {
		ch, chErr := channel.LoadChannelConfig(cfg.ChannelsDir, "otak-receh")
		if chErr == nil {
			channelsMap["otak-receh"] = ch
		}
	}

	return &Server{
		cfg:          cfg,
		channels:     channelsMap,
		jobManager:   job.NewJobManager(),
		llmClient:    llm.NewLLMClient(cfg),
		ttsClient:    tts.NewTTSClient(cfg.PythonPath),
		renderEngine: render.NewRenderEngine(cfg.RemotionProjectDir, cfg.OutputDir),
		webDir:       webDir,
	}, nil
}

func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()

	// API Routes
	mux.HandleFunc("GET /api/channels", s.handleGetChannels)
	mux.HandleFunc("GET /api/channels/{id}", s.handleGetChannel)
	mux.HandleFunc("POST /api/jobs", s.handleCreateJob)
	mux.HandleFunc("GET /api/jobs", s.handleListJobs)
	mux.HandleFunc("GET /api/jobs/{id}", s.handleGetJob)
	mux.HandleFunc("GET /api/jobs/{id}/events", s.handleJobEvents)
	mux.HandleFunc("GET /api/videos/{channel}/{filename}", s.handleStreamVideo)
	mux.HandleFunc("GET /api/system/status", s.handleSystemStatus)

	// Asset Manager Routes (FASE 1)
	mux.HandleFunc("POST /api/assets/upload", s.handleUploadAsset)
	mux.HandleFunc("GET /api/assets", s.handleListAssets)
	mux.HandleFunc("GET /api/assets/{filename}", s.handleServeAsset)

	// Static Web Dashboard files
	fs := http.FileServer(http.Dir(s.webDir))
	mux.Handle("GET /static/", http.StripPrefix("/static/", fs))
	mux.HandleFunc("GET /{$}", func(w http.ResponseWriter, r *http.Request) {
		indexPath := filepath.Join(s.webDir, "index.html")
		http.ServeFile(w, r, indexPath)
	})

	return enableCORS(mux)
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ============================================================================
// API Handlers
// ============================================================================

func (s *Server) handleGetChannels(w http.ResponseWriter, r *http.Request) {
	channelsList := make([]*channel.ChannelConfig, 0, len(s.channels))
	for _, ch := range s.channels {
		channelsList = append(channelsList, ch)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"channels": channelsList,
	})
}

func (s *Server) handleGetChannel(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	ch, ok := s.channels[id]
	if !ok {
		http.Error(w, `{"error":"Channel not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"channel": ch,
	})
}

func (s *Server) handleCreateJob(w http.ResponseWriter, r *http.Request) {
	var req job.JobRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Invalid request payload: %v"}`, err), http.StatusBadRequest)
		return
	}

	if req.ChannelID == "" {
		req.ChannelID = "otak-receh"
	}
	if strings.TrimSpace(req.Topic) == "" && req.ManualScript == nil {
		http.Error(w, `{"error":"Topic or Manual Script is required"}`, http.StatusBadRequest)
		return
	}

	ch, ok := s.channels[req.ChannelID]
	if !ok {
		ch = &channel.ChannelConfig{
			ID:          req.ChannelID,
			DisplayName: req.ChannelID,
			Voice:       "id-ID-ArdiNeural",
		}
	}

	timestamp := time.Now().Format("20060102-150405")
	jobID := fmt.Sprintf("%s-%s", req.ChannelID, timestamp)
	jobDir := filepath.Join(s.cfg.JobsDir, req.ChannelID, jobID)

	if err := os.MkdirAll(jobDir, 0755); err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Failed to create job dir: %v"}`, err), http.StatusInternalServerError)
		return
	}

	topicName := req.Topic
	if topicName == "" && req.ManualScript != nil {
		topicName = req.ManualScript.Title
	}

	j := s.jobManager.CreateJob(req.ChannelID, ch.DisplayName, topicName, jobDir)

	// Run production asynchronously
	go s.executeJobProduction(j.ID, req, ch, jobDir)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"job_id":  j.ID,
		"message": "Job produksi video berhasil dibuat dan sedang berjalan di studio background",
	})
}

func (s *Server) handleListJobs(w http.ResponseWriter, r *http.Request) {
	jobs := s.jobManager.ListJobs()
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"jobs":    jobs,
	})
}

func (s *Server) handleGetJob(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	j, ok := s.jobManager.GetJob(id)
	if !ok {
		http.Error(w, `{"error":"Job not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"job":     j,
	})
}

func (s *Server) handleJobEvents(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	j, ok := s.jobManager.GetJob(id)
	if !ok {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	// Send initial state
	initBytes, _ := json.Marshal(j)
	fmt.Fprintf(w, "data: %s\n\n", initBytes)
	flusher.Flush()

	ch := s.jobManager.Subscribe(id)
	defer s.jobManager.Unsubscribe(id, ch)

	for {
		select {
		case updatedJob, ok := <-ch:
			if !ok {
				return
			}
			dataBytes, _ := json.Marshal(updatedJob)
			fmt.Fprintf(w, "data: %s\n\n", dataBytes)
			flusher.Flush()
			if updatedJob.Phase == job.PhaseCompleted || updatedJob.Phase == job.PhaseFailed {
				return
			}
		case <-r.Context().Done():
			return
		}
	}
}

func (s *Server) handleStreamVideo(w http.ResponseWriter, r *http.Request) {
	channelID := r.PathValue("channel")
	filename := r.PathValue("filename")

	videoPath := filepath.Join(s.cfg.OutputDir, channelID, filename)
	if _, err := os.Stat(videoPath); err != nil {
		http.Error(w, "Video not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "video/mp4")
	http.ServeFile(w, r, videoPath)
}

func (s *Server) handleSystemStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":        true,
		"server_time":    time.Now().Format(time.RFC3339),
		"llm_model":      s.cfg.LLMModel,
		"channels_count": len(s.channels),
		"remotion_dir":   s.cfg.RemotionProjectDir,
		"output_dir":     s.cfg.OutputDir,
		"status":         "ONLINE",
	})
}

// handleUploadAsset handles multipart/form-data asset upload for images (.png, .jpg, .jpeg, .svg) and Lottie (.json)
func (s *Server) handleUploadAsset(w http.ResponseWriter, r *http.Request) {
	// Max 50 MB
	if err := r.ParseMultipartForm(50 << 20); err != nil {
		http.Error(w, `{"error":"File terlalu besar. Maksimum 50 MB"}`, http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, `{"error":"Field 'file' tidak ditemukan dalam form-data"}`, http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate extension
	ext := strings.ToLower(filepath.Ext(handler.Filename))
	allowed := map[string]bool{
		".png":  true,
		".jpg":  true,
		".jpeg": true,
		".svg":  true,
		".json": true,
	}
	if !allowed[ext] {
		http.Error(w, `{"error":"Ekstensi file tidak diizinkan. Hanya .png, .jpg, .jpeg, .svg, dan .json"}`, http.StatusBadRequest)
		return
	}

	// Sanitize filename (spaces to _, remove special characters)
	base := strings.TrimSuffix(handler.Filename, filepath.Ext(handler.Filename))
	reg := regexp.MustCompile(`[^a-zA-Z0-9_\-]`)
	cleanBase := reg.ReplaceAllString(base, "_")
	if strings.Trim(cleanBase, "_") == "" {
		cleanBase = fmt.Sprintf("asset_%d", time.Now().Unix())
	}
	finalName := fmt.Sprintf("%s%s", cleanBase, ext)

	// Save to frontend-remotion/public/assets/
	assetsDir := filepath.Join(s.cfg.RemotionProjectDir, "public", "assets")
	if err := os.MkdirAll(assetsDir, 0755); err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Gagal membuat folder assets: %v"}`, err), http.StatusInternalServerError)
		return
	}

	targetPath := filepath.Join(assetsDir, finalName)
	dst, err := os.Create(targetPath)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Gagal menyimpan file asset: %v"}`, err), http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	written, err := io.Copy(dst, file)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Gagal menulis file: %v"}`, err), http.StatusInternalServerError)
		return
	}

	log.Printf("[ASSET] Successfully uploaded asset: %s (%.2f KB) to %s", finalName, float64(written)/1024, targetPath)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"message":   "Asset berhasil diunggah!",
		"filename":  finalName,
		"size":      written,
		"asset_url": "/api/assets/" + finalName,
	})
}

// handleListAssets lists all uploaded files in frontend-remotion/public/assets/
func (s *Server) handleListAssets(w http.ResponseWriter, r *http.Request) {
	assetsDir := filepath.Join(s.cfg.RemotionProjectDir, "public", "assets")
	_ = os.MkdirAll(assetsDir, 0755)

	entries, err := os.ReadDir(assetsDir)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Gagal membaca folder assets: %v"}`, err), http.StatusInternalServerError)
		return
	}

	type AssetInfo struct {
		Name      string    `json:"name"`
		Size      int64     `json:"size"`
		Type      string    `json:"type"`
		AssetURL  string    `json:"asset_url"`
		UpdatedAt time.Time `json:"updated_at"`
	}

	assets := make([]AssetInfo, 0)
	for _, e := range entries {
		if !e.IsDir() {
			info, iErr := e.Info()
			if iErr == nil {
				ext := strings.ToLower(filepath.Ext(e.Name()))
				assetType := "image"
				if ext == ".json" {
					assetType = "lottie"
				} else if ext == ".svg" {
					assetType = "vector"
				}
				assets = append(assets, AssetInfo{
					Name:      e.Name(),
					Size:      info.Size(),
					Type:      assetType,
					AssetURL:  "/api/assets/" + e.Name(),
					UpdatedAt: info.ModTime(),
				})
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"assets":  assets,
		"total":   len(assets),
	})
}

// handleServeAsset serves files directly from frontend-remotion/public/assets/
func (s *Server) handleServeAsset(w http.ResponseWriter, r *http.Request) {
	filename := r.PathValue("filename")
	cleanName := filepath.Base(filename)
	filePath := filepath.Join(s.cfg.RemotionProjectDir, "public", "assets", cleanName)

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		http.Error(w, "Asset not found", http.StatusNotFound)
		return
	}

	http.ServeFile(w, r, filePath)
}

// ============================================================================
// Asynchronous Job Production Worker
// ============================================================================

func (s *Server) executeJobProduction(jobID string, req job.JobRequest, ch *channel.ChannelConfig, jobDir string) {
	ctx := context.Background()
	log.Printf("[SERVER] [JOB %s] Starting production pipeline...", jobID)

	var scriptData *script.ScriptData
	var err error

	// Step 1: Script & Storyboard
	if req.ManualScript != nil {
		s.jobManager.UpdatePhase(jobID, job.PhaseWritingScript, 15, "Memproses Naskah Manual (0 Token LLM)...")
		scriptData = req.ManualScript
		if valErr := script.ValidateScript(scriptData); valErr != nil {
			s.jobManager.MarkFailed(jobID, fmt.Sprintf("Validasi naskah manual gagal: %v", valErr))
			return
		}
		scriptData.ChannelID = ch.ID
	} else {
		s.jobManager.UpdatePhase(jobID, job.PhaseGeneratingConcept, 10, fmt.Sprintf("Merumuskan Konsep & Storyboard via AI Director untuk '%s'...", req.Topic))
		scriptData, err = s.llmClient.GenerateScript(ctx, ch, req.Topic)
		if err != nil {
			s.jobManager.AppendLog(jobID, fmt.Sprintf("[WARN] AI Director gagal: %v. Menggunakan Autopilot Fallback naskah...", err))
			// Fallback autopilot rule-based storyboard
			scriptData = s.buildFallbackScript(ch, req.Topic)
		}
	}

	s.jobManager.UpdatePhase(jobID, job.PhaseGeneratingAudio, 30, fmt.Sprintf("Mensintesis Voiceover Audio (%s) sinkron per adegan via Edge TTS...", ch.Voice))
	audioPath := filepath.Join(jobDir, "audio.mp3")
	scenesAudioDir := filepath.Join(jobDir, "scenes_audio")
	voiceToUse := ch.Voice
	if req.Voice != "" {
		voiceToUse = req.Voice
	}

	var audioDuration float64
	if len(scriptData.Scenes) > 0 {
		var syncScenes []script.Scene
		syncScenes, audioDuration, err = s.ttsClient.GenerateSceneAudios(ctx, scriptData.Scenes, voiceToUse, scenesAudioDir, audioPath)
		if err != nil {
			s.jobManager.AppendLog(jobID, fmt.Sprintf("[WARN] Gagal sintesis per adegan: %v. Mencoba fallback audio tunggal...", err))
			audioResult, fallbackErr := s.ttsClient.GenerateAudio(ctx, scriptData.Narration, voiceToUse, audioPath)
			if fallbackErr != nil {
				s.jobManager.MarkFailed(jobID, fmt.Sprintf("Gagal membuat narasi audio TTS: %v", fallbackErr))
				return
			}
			audioDuration = audioResult.DurationSeconds
			scriptData.Scenes = tts.AlignSceneTimings(scriptData.Scenes, audioDuration)
		} else {
			scriptData.Scenes = syncScenes
		}
	} else {
		audioResult, audioErr := s.ttsClient.GenerateAudio(ctx, scriptData.Narration, voiceToUse, audioPath)
		if audioErr != nil {
			s.jobManager.MarkFailed(jobID, fmt.Sprintf("Gagal membuat narasi audio TTS: %v", audioErr))
			return
		}
		audioDuration = audioResult.DurationSeconds
		scriptData.Scenes = tts.AlignSceneTimings(scriptData.Scenes, audioDuration)
	}

	// Step 2: Timing Alignment
	s.jobManager.UpdatePhase(jobID, job.PhaseAligningTimings, 45, fmt.Sprintf("Sinkronisasi presisi 100%% durasi audio (%.2fs) untuk %d adegan...", audioDuration, len(scriptData.Scenes)))

	// Save script.json
	scriptBytes, _ := json.MarshalIndent(scriptData, "", "  ")
	_ = os.WriteFile(filepath.Join(jobDir, "script.json"), scriptBytes, 0644)

	// Step 3: Remotion Video Rendering
	s.jobManager.UpdatePhase(jobID, job.PhaseRenderingVideo, 60, "Merender video vertikal 1080x1920 (30 FPS) dengan Remotion Cinematic Engine...")

	renderResult, err := s.renderEngine.RenderVideo(
		ctx,
		jobID,
		jobDir,
		scriptData,
		audioPath,
		audioDuration,
		ch.DisplayName,
	)
	if err != nil {
		s.jobManager.MarkFailed(jobID, fmt.Sprintf("Gagal merender video: %v", err))
		return
	}

	// Step 4: Quality Control Inspection
	s.jobManager.UpdatePhase(jobID, job.PhaseQualityCheck, 90, "Melakukan inspeksi Quality Control otomatis pada video final...")
	qcReport, qcErr := qc.InspectVideo(jobID, ch.ID, renderResult.VideoPath, audioPath, audioDuration, scriptData, jobDir)
	if qcErr != nil {
		s.jobManager.AppendLog(jobID, fmt.Sprintf("[WARN] QC Warning: %v", qcErr))
	} else {
		s.jobManager.AppendLog(jobID, fmt.Sprintf("[QC PASS] Status: %s | Ukuran File: %.2f MB", qcReport.OverallStatus, float64(qcReport.FileSizeBytes)/(1024*1024)))
	}

	// Step 5: Mark Completed
	videoURL := fmt.Sprintf("/api/videos/%s/%s.mp4", ch.ID, jobID)
	s.jobManager.MarkComplete(jobID, renderResult.VideoPath, videoURL, renderResult.FileSize)
	log.Printf("[SERVER] [JOB %s] Video production completed successfully: %s", jobID, renderResult.VideoPath)
}

func (s *Server) buildFallbackScript(ch *channel.ChannelConfig, topic string) *script.ScriptData {
	return &script.ScriptData{
		ChannelID:  ch.ID,
		Title:      topic,
		Hook:       fmt.Sprintf("Pernahkah kamu penasaran: %s?", topic),
		Narration:  fmt.Sprintf("Pernahkah kamu penasaran: %s? Fenomena ini sering kita alami tanpa disadari. Otak kita sebenarnya memiliki mekanisme unik dalam memproses emosi dan memori. Jadi jangan merasa sendirian, karena setiap orang mengalami hal serupa!", topic),
		Punchline:  "Fakta menarik pikiran kita: Mengerti diri sendiri adalah kunci kedamaian!",
		ThemeColor: "#FF7A00",
		Scenes: []script.Scene{
			{
				Index:         1,
				Text:          fmt.Sprintf("Pernahkah kamu penasaran: %s?", topic),
				Visual:        "scrolling",
				VisualCue:     "scrolling",
				Tag:           "FENOMENA KITA",
				HeadlineLine1: "PERNAHKAH KAMU",
				HeadlineLine2: "MERASAKAN INI?",
			},
			{
				Index:         2,
				Text:          "Fenomena ini sering kita alami tanpa disadari.",
				Visual:        "lazy",
				VisualCue:     "lazy",
				Tag:           "FAKTA HARI INI",
				HeadlineLine1: "OTAK KITA",
				HeadlineLine2: "LAGI BEKERJA",
			},
			{
				Index:         3,
				Text:          "Otak kita sebenarnya memiliki mekanisme unik dalam memproses emosi dan memori.",
				Visual:        "brain_dopamine",
				VisualCue:     "brain_dopamine",
				Tag:           "BIOLOGI PIKIRAN",
				HeadlineLine1: "MEKANISME UNIK",
				HeadlineLine2: "SISTEM MEMORI",
			},
			{
				Index:         4,
				Text:          "Jadi jangan merasa sendirian, karena setiap orang mengalami hal serupa!",
				Visual:        "default",
				VisualCue:     "default",
				Tag:           "KESIMPULAN",
				HeadlineLine1: "KAMU TIDAK",
				HeadlineLine2: "SENDIRIAN!",
			},
		},
	}
}
