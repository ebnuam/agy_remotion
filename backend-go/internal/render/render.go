package render

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"video-factory/internal/script"
)

type RenderEngine struct {
	RemotionDir string
	OutputDir   string
}

type RemotionProps struct {
	Title         string         `json:"title"`
	Hook          string         `json:"hook"`
	Narration     string         `json:"narration"`
	Punchline     string         `json:"punchline"`
	ThemeColor    string         `json:"theme_color"`
	Scenes        []script.Scene `json:"scenes"`
	AudioFile     string         `json:"audio_file"`
	AudioDuration float64        `json:"audio_duration"`
	ChannelName   string         `json:"channel_name"`
	ChannelID     string         `json:"channel_id"`
}

type RenderResult struct {
	VideoPath string `json:"video_path"`
	FileSize  int64  `json:"file_size"`
	JobID     string `json:"job_id"`
}

func NewRenderEngine(remotionDir, outputDir string) *RenderEngine {
	return &RenderEngine{
		RemotionDir: remotionDir,
		OutputDir:   outputDir,
	}
}

// copyFile copies a file from src to dst
func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	if _, err = io.Copy(out, in); err != nil {
		return err
	}
	return out.Sync()
}

// RenderVideo stages audio, builds props JSON, executes Remotion render, and cleans up staging
func (r *RenderEngine) RenderVideo(
	ctx context.Context,
	jobID string,
	jobDir string,
	scriptData *script.ScriptData,
	audioPath string,
	audioDuration float64,
	channelName string,
) (*RenderResult, error) {
	// 1. Resolve absolute paths
	absRemotionDir, err := filepath.Abs(r.RemotionDir)
	if err != nil {
		return nil, fmt.Errorf("failed to get absolute path for remotion dir: %w", err)
	}

	absJobDir, err := filepath.Abs(jobDir)
	if err != nil {
		return nil, fmt.Errorf("failed to get absolute path for job dir: %w", err)
	}

	absOutputDir, err := filepath.Abs(r.OutputDir)
	if err != nil {
		return nil, fmt.Errorf("failed to get absolute path for output dir: %w", err)
	}

	// 2. Stage audio into frontend-remotion/public/
	stagingFileName := fmt.Sprintf("audio-%s.mp3", jobID)
	publicDir := filepath.Join(absRemotionDir, "public")
	if err := os.MkdirAll(publicDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to ensure public directory: %w", err)
	}

	stagingAudioPath := filepath.Join(publicDir, stagingFileName)
	if err := copyFile(audioPath, stagingAudioPath); err != nil {
		return nil, fmt.Errorf("failed to stage audio file to %s: %w", stagingAudioPath, err)
	}

	// Always cleanup staging audio after render completes or fails
	defer func() {
		_ = os.Remove(stagingAudioPath)
	}()

	// 3. Build & save RenderProps JSON
	props := RemotionProps{
		Title:         scriptData.Title,
		Hook:          scriptData.Hook,
		Narration:     scriptData.Narration,
		Punchline:     scriptData.Punchline,
		ThemeColor:    scriptData.ThemeColor,
		Scenes:        scriptData.Scenes,
		AudioFile:     stagingFileName,
		AudioDuration: audioDuration,
		ChannelName:   channelName,
		ChannelID:     scriptData.ChannelID,
	}

	propsBytes, err := json.MarshalIndent(props, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal render props: %w", err)
	}

	propsFilePath := filepath.Join(absJobDir, "render-props.json")
	if err := os.WriteFile(propsFilePath, propsBytes, 0644); err != nil {
		return nil, fmt.Errorf("failed to save render props to %s: %w", propsFilePath, err)
	}

	// 4. Ensure output channel directory
	channelOutputDir := filepath.Join(absOutputDir, scriptData.ChannelID)
	if err := os.MkdirAll(channelOutputDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create output channel dir: %w", err)
	}

	outputVideoPath := filepath.Join(channelOutputDir, fmt.Sprintf("%s.mp4", jobID))

	// 5. Execute Remotion CLI render
	renderCtx, cancel := context.WithTimeout(ctx, 300*time.Second) // 5 minutes timeout for render
	defer cancel()

	cmd := exec.CommandContext(
		renderCtx,
		"npx.cmd",
		"remotion",
		"render",
		"src/index.ts",
		"MainVideo",
		outputVideoPath,
		fmt.Sprintf("--props=%s", propsFilePath),
		"--gl=angle",
	)
	cmd.Dir = absRemotionDir

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("remotion render failed: %w\nStdout: %s\nStderr: %s", err, stdout.String(), stderr.String())
	}

	// 6. Verify output MP4
	info, err := os.Stat(outputVideoPath)
	if err != nil {
		return nil, fmt.Errorf("rendered video not found at %s: %w", outputVideoPath, err)
	}
	if info.Size() == 0 {
		return nil, fmt.Errorf("rendered video at %s is empty (0 bytes)", outputVideoPath)
	}

	return &RenderResult{
		VideoPath: outputVideoPath,
		FileSize:  info.Size(),
		JobID:     jobID,
	}, nil
}
