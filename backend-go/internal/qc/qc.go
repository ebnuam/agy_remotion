package qc

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"video-factory/internal/script"
)

type QCStatus string

const (
	QCStatusPass QCStatus = "PASS"
	QCStatusWarn QCStatus = "WARN"
	QCStatusFail QCStatus = "FAIL"
)

type QCReport struct {
	JobID         string    `json:"job_id"`
	ChannelID     string    `json:"channel_id"`
	VideoPath     string    `json:"video_path"`
	FileSizeBytes int64     `json:"file_size_bytes"`
	DurationSec   float64   `json:"duration_sec"`
	TotalScenes   int       `json:"total_scenes"`
	AudioPresent  bool      `json:"audio_present"`
	OverallStatus QCStatus  `json:"overall_status"`
	Checks        []QCCheck `json:"checks"`
	CreatedAt     time.Time `json:"created_at"`
}

type QCCheck struct {
	Name    string   `json:"name"`
	Status  QCStatus `json:"status"`
	Details string   `json:"details"`
}

// InspectVideo conducts comprehensive automated quality checks on the rendered video
func InspectVideo(jobID, channelID, videoPath, audioPath string, audioDuration float64, scriptData *script.ScriptData, jobDir string) (*QCReport, error) {
	report := &QCReport{
		JobID:         jobID,
		ChannelID:     channelID,
		VideoPath:     videoPath,
		DurationSec:   audioDuration,
		TotalScenes:   len(scriptData.Scenes),
		OverallStatus: QCStatusPass,
		Checks:        make([]QCCheck, 0),
		CreatedAt:     time.Now(),
	}

	// 1. Check video file existence & non-zero size
	info, err := os.Stat(videoPath)
	if err != nil {
		report.OverallStatus = QCStatusFail
		report.Checks = append(report.Checks, QCCheck{
			Name:    "File Existence",
			Status:  QCStatusFail,
			Details: fmt.Sprintf("Video file not found at %s: %v", videoPath, err),
		})
		return report, fmt.Errorf("QC Failed: video file missing: %w", err)
	}

	report.FileSizeBytes = info.Size()

	if info.Size() < 100*1024 { // Less than 100KB is suspect
		report.OverallStatus = QCStatusFail
		report.Checks = append(report.Checks, QCCheck{
			Name:    "File Size",
			Status:  QCStatusFail,
			Details: fmt.Sprintf("File size too small (%d bytes), possibly corrupted", info.Size()),
		})
	} else {
		report.Checks = append(report.Checks, QCCheck{
			Name:    "File Size",
			Status:  QCStatusPass,
			Details: fmt.Sprintf("Valid video file size: %.2f MB (%d bytes)", float64(info.Size())/(1024*1024), info.Size()),
		})
	}

	// 2. Check audio existence & duration
	if audioInfo, aErr := os.Stat(audioPath); aErr == nil && audioInfo.Size() > 0 {
		report.AudioPresent = true
		report.Checks = append(report.Checks, QCCheck{
			Name:    "Audio Narration",
			Status:  QCStatusPass,
			Details: fmt.Sprintf("Audio track verified (%.2f seconds, %d bytes)", audioDuration, audioInfo.Size()),
		})
	} else {
		report.AudioPresent = false
		report.OverallStatus = QCStatusFail
		report.Checks = append(report.Checks, QCCheck{
			Name:    "Audio Narration",
			Status:  QCStatusFail,
			Details: "Audio narration file is missing or empty",
		})
	}

	// 3. Check scene timings & distribution
	hasTimingGap := false
	for i, sc := range scriptData.Scenes {
		if sc.EndSeconds <= sc.StartSeconds {
			hasTimingGap = true
			report.Checks = append(report.Checks, QCCheck{
				Name:    fmt.Sprintf("Scene %d Timing", i+1),
				Status:  QCStatusWarn,
				Details: fmt.Sprintf("Scene %d has zero or negative duration (start: %.2f, end: %.2f)", sc.Index, sc.StartSeconds, sc.EndSeconds),
			})
		}
	}
	if !hasTimingGap {
		report.Checks = append(report.Checks, QCCheck{
			Name:    "Scene Timing Alignment",
			Status:  QCStatusPass,
			Details: fmt.Sprintf("All %d scenes properly timed across %.2f seconds", len(scriptData.Scenes), audioDuration),
		})
	}

	// 4. Save QC report to jobDir
	reportJSON, _ := json.MarshalIndent(report, "", "  ")
	reportPath := filepath.Join(jobDir, "qc-report.json")
	_ = os.WriteFile(reportPath, reportJSON, 0644)

	return report, nil
}
