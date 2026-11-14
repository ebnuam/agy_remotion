package job

import (
	"fmt"
	"sync"
	"time"

	"video-factory/internal/script"
)

type JobPhase string

const (
	PhasePending         JobPhase = "PENDING"
	PhaseGeneratingConcept JobPhase = "GENERATING_CONCEPT"
	PhaseWritingScript   JobPhase = "WRITING_SCRIPT"
	PhaseGeneratingAudio JobPhase = "GENERATING_AUDIO"
	PhaseAligningTimings JobPhase = "ALIGNING_TIMINGS"
	PhaseRenderingVideo  JobPhase = "RENDERING_VIDEO"
	PhaseQualityCheck    JobPhase = "QUALITY_CHECK"
	PhaseCompleted       JobPhase = "COMPLETED"
	PhaseFailed          JobPhase = "FAILED"
)

type JobRequest struct {
	ChannelID    string             `json:"channel_id"`
	Topic        string             `json:"topic"`
	TargetDuration int              `json:"target_duration"`
	AspectRatio  string             `json:"aspect_ratio"`
	Voice        string             `json:"voice"`
	ManualScript *script.ScriptData `json:"manual_script,omitempty"`
}

type Job struct {
	ID             string             `json:"id"`
	ChannelID      string             `json:"channel_id"`
	ChannelName    string             `json:"channel_name"`
	Topic          string             `json:"topic"`
	Phase          JobPhase           `json:"phase"`
	Progress       int                `json:"progress"` // 0 to 100
	StatusMessage  string             `json:"status_message"`
	CreatedAt      time.Time          `json:"created_at"`
	UpdatedAt      time.Time          `json:"updated_at"`
	CompletedAt    *time.Time         `json:"completed_at,omitempty"`
	JobDir         string             `json:"job_dir"`
	AudioPath      string             `json:"audio_path,omitempty"`
	AudioDuration  float64            `json:"audio_duration,omitempty"`
	VideoPath      string             `json:"video_path,omitempty"`
	VideoURL       string             `json:"video_url,omitempty"`
	FileSize       int64              `json:"file_size,omitempty"`
	TotalScenes    int                `json:"total_scenes,omitempty"`
	ScriptData     *script.ScriptData `json:"script_data,omitempty"`
	Logs           []string           `json:"logs"`
	Error          string             `json:"error,omitempty"`
}

type JobManager struct {
	mu        sync.RWMutex
	jobs      map[string]*Job
	listeners map[string][]chan *Job
}

func NewJobManager() *JobManager {
	return &JobManager{
		jobs:      make(map[string]*Job),
		listeners: make(map[string][]chan *Job),
	}
}

func (jm *JobManager) CreateJob(channelID, channelName, topic, jobDir string) *Job {
	jm.mu.Lock()
	defer jm.mu.Unlock()

	timestamp := time.Now().Format("20060102-150405")
	jobID := fmt.Sprintf("%s-%s", channelID, timestamp)

	j := &Job{
		ID:            jobID,
		ChannelID:     channelID,
		ChannelName:   channelName,
		Topic:         topic,
		Phase:         PhasePending,
		Progress:      0,
		StatusMessage: "Job antre di sistem...",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
		JobDir:        jobDir,
		Logs:          []string{fmt.Sprintf("[%s] Job dibuat untuk channel %s: %s", time.Now().Format("15:04:05"), channelName, topic)},
	}

	jm.jobs[jobID] = j
	jm.notifyListeners(j)
	return j
}

func (jm *JobManager) GetJob(id string) (*Job, bool) {
	jm.mu.RLock()
	defer jm.mu.RUnlock()

	j, ok := jm.jobs[id]
	if !ok {
		return nil, false
	}
	// Return a copy
	jobCopy := *j
	return &jobCopy, true
}

func (jm *JobManager) ListJobs() []*Job {
	jm.mu.RLock()
	defer jm.mu.RUnlock()

	list := make([]*Job, 0, len(jm.jobs))
	for _, j := range jm.jobs {
		jobCopy := *j
		list = append(list, &jobCopy)
	}
	return list
}

func (jm *JobManager) UpdatePhase(id string, phase JobPhase, progress int, msg string) {
	jm.mu.Lock()
	defer jm.mu.Unlock()

	if j, ok := jm.jobs[id]; ok {
		j.Phase = phase
		j.Progress = progress
		j.StatusMessage = msg
		j.UpdatedAt = time.Now()
		j.Logs = append(j.Logs, fmt.Sprintf("[%s] [%s] %s (%d%%)", time.Now().Format("15:04:05"), phase, msg, progress))
		jm.notifyListeners(j)
	}
}

func (jm *JobManager) AppendLog(id string, logMsg string) {
	jm.mu.Lock()
	defer jm.mu.Unlock()

	if j, ok := jm.jobs[id]; ok {
		j.Logs = append(j.Logs, fmt.Sprintf("[%s] %s", time.Now().Format("15:04:05"), logMsg))
		j.UpdatedAt = time.Now()
		jm.notifyListeners(j)
	}
}

func (jm *JobManager) MarkComplete(id string, videoPath, videoURL string, fileSize int64) {
	jm.mu.Lock()
	defer jm.mu.Unlock()

	if j, ok := jm.jobs[id]; ok {
		now := time.Now()
		j.Phase = PhaseCompleted
		j.Progress = 100
		j.StatusMessage = "Produksi video selesai dengan sukses!"
		j.VideoPath = videoPath
		j.VideoURL = videoURL
		j.FileSize = fileSize
		j.CompletedAt = &now
		j.UpdatedAt = now
		j.Logs = append(j.Logs, fmt.Sprintf("[%s] [COMPLETED] Video MP4 siap: %s (%.2f MB)", now.Format("15:04:05"), videoPath, float64(fileSize)/(1024*1024)))
		jm.notifyListeners(j)
	}
}

func (jm *JobManager) MarkFailed(id string, errMsg string) {
	jm.mu.Lock()
	defer jm.mu.Unlock()

	if j, ok := jm.jobs[id]; ok {
		now := time.Now()
		j.Phase = PhaseFailed
		j.StatusMessage = fmt.Sprintf("Produksi gagal: %s", errMsg)
		j.Error = errMsg
		j.UpdatedAt = now
		j.Logs = append(j.Logs, fmt.Sprintf("[%s] [FAILED] Error: %s", now.Format("15:04:05"), errMsg))
		jm.notifyListeners(j)
	}
}

func (jm *JobManager) Subscribe(id string) chan *Job {
	jm.mu.Lock()
	defer jm.mu.Unlock()

	ch := make(chan *Job, 20)
	jm.listeners[id] = append(jm.listeners[id], ch)
	return ch
}

func (jm *JobManager) Unsubscribe(id string, ch chan *Job) {
	jm.mu.Lock()
	defer jm.mu.Unlock()

	list := jm.listeners[id]
	for i, listener := range list {
		if listener == ch {
			jm.listeners[id] = append(list[:i], list[i+1:]...)
			close(ch)
			break
		}
	}
}

func (jm *JobManager) notifyListeners(j *Job) {
	for _, ch := range jm.listeners[j.ID] {
		select {
		case ch <- j:
		default:
		}
	}
}
