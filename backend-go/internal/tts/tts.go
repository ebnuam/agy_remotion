package tts

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"video-factory/internal/script"
)

type TTSClient struct {
	pythonPath string
}

type AudioResult struct {
	FilePath        string  `json:"file_path"`
	DurationSeconds float64 `json:"duration_seconds"`
	Voice           string  `json:"voice"`
	FileSize        int64   `json:"file_size"`
}

func NewTTSClient(pythonPath string) *TTSClient {
	if pythonPath == "" {
		pythonPath = "python"
	}
	return &TTSClient{
		pythonPath: pythonPath,
	}
}

// GenerateAudio creates an MP3 narration using edge-tts
func (t *TTSClient) GenerateAudio(ctx context.Context, text, voice, outputFile string) (*AudioResult, error) {
	if strings.TrimSpace(text) == "" {
		return nil, fmt.Errorf("narration text cannot be empty")
	}
	if strings.TrimSpace(voice) == "" {
		voice = "id-ID-ArdiNeural"
	}

	ctx, cancel := context.WithTimeout(ctx, 90*time.Second)
	defer cancel()

	// Safe command execution with separated arguments
	args := []string{
		"-m",
		"edge_tts",
		"--voice",
		voice,
		"--text",
		text,
		"--write-media",
		outputFile,
	}

	cmd := exec.CommandContext(ctx, t.pythonPath, args...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("edge-tts command failed: %w, stderr: %s", err, stderr.String())
	}

	// Verify output file existence
	info, err := os.Stat(outputFile)
	if err != nil {
		return nil, fmt.Errorf("audio file was not created at %s: %w", outputFile, err)
	}
	if info.Size() == 0 {
		return nil, fmt.Errorf("audio file created at %s is empty (0 bytes)", outputFile)
	}

	// Calculate audio duration
	duration, err := t.GetAudioDuration(ctx, outputFile)
	if err != nil {
		// Fallback duration estimation if metadata parsing fails
		duration = math.Round((float64(len(text))/15.0)*10) / 10
	}

	return &AudioResult{
		FilePath:        outputFile,
		DurationSeconds: duration,
		Voice:           voice,
		FileSize:        info.Size(),
	}, nil
}

// GetAudioDuration extracts precise duration in seconds using mutagen
func (t *TTSClient) GetAudioDuration(ctx context.Context, audioPath string) (float64, error) {
	pyCode := "import sys; from mutagen.mp3 import MP3; print(f'{MP3(sys.argv[1]).info.length:.3f}')"
	cmd := exec.CommandContext(ctx, t.pythonPath, "-c", pyCode, audioPath)
	var out, stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return 0, fmt.Errorf("failed to extract audio duration: %w, stderr: %s", err, stderr.String())
	}

	valStr := strings.TrimSpace(out.String())
	duration, err := strconv.ParseFloat(valStr, 64)
	if err != nil {
		return 0, fmt.Errorf("failed to parse audio duration output '%s': %w", valStr, err)
	}

	return duration, nil
}

// GenerateSceneAudios generates individual MP3 voiceover files for every scene,
// measures their exact audio durations via mutagen, assigns 100% synchronized StartSeconds
// and EndSeconds to each scene, and concatenates all audio files into finalOutputFile.
func (t *TTSClient) GenerateSceneAudios(ctx context.Context, scenes []script.Scene, voice, outDir, finalOutputFile string) ([]script.Scene, float64, error) {
	if len(scenes) == 0 {
		return scenes, 0, fmt.Errorf("scenes list cannot be empty")
	}

	if err := os.MkdirAll(outDir, 0755); err != nil {
		return scenes, 0, fmt.Errorf("failed to create scene audio dir: %w", err)
	}

	if strings.TrimSpace(voice) == "" {
		voice = "id-ID-ArdiNeural"
	}

	var sceneAudioPaths []string
	cumulative := 0.0

	for i := range scenes {
		text := strings.TrimSpace(scenes[i].Text)
		if text == "" {
			text = strings.TrimSpace(scenes[i].Visual)
		}
		if text == "" {
			text = fmt.Sprintf("Adegan ke %d", scenes[i].Index)
		}

		sceneFile := filepath.Join(outDir, fmt.Sprintf("scene_%02d.mp3", i+1))
		res, err := t.GenerateAudio(ctx, text, voice, sceneFile)
		if err != nil {
			return scenes, 0, fmt.Errorf("failed generating audio for scene %d: %w", i+1, err)
		}

		dur := res.DurationSeconds
		if dur <= 0 {
			dur = 3.0 // safe minimum duration
		}

		scenes[i].StartSeconds = math.Round(cumulative*100) / 100
		cumulative += dur
		scenes[i].EndSeconds = math.Round(cumulative*100) / 100

		sceneAudioPaths = append(sceneAudioPaths, sceneFile)
	}

	// Concatenate all scene audio files into finalOutputFile
	if err := concatAudioFiles(sceneAudioPaths, finalOutputFile); err != nil {
		return scenes, 0, fmt.Errorf("failed to concatenate scene audio files: %w", err)
	}

	// Verify final audio duration
	finalDur, err := t.GetAudioDuration(ctx, finalOutputFile)
	if err != nil || finalDur <= 0 {
		finalDur = cumulative
	}

	// Pin the last scene's end to the exact total duration
	if len(scenes) > 0 {
		scenes[len(scenes)-1].EndSeconds = math.Round(finalDur*100) / 100
	}

	return scenes, finalDur, nil
}

// concatAudioFiles combines multiple MP3 files into a single output file
func concatAudioFiles(inputPaths []string, outputPath string) error {
	out, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer out.Close()

	for _, p := range inputPaths {
		in, err := os.Open(p)
		if err != nil {
			return fmt.Errorf("failed to open %s for concat: %w", p, err)
		}
		_, err = io.Copy(out, in)
		in.Close()
		if err != nil {
			return fmt.Errorf("failed copying audio data from %s: %w", p, err)
		}
	}

	return out.Sync()
}

// AlignSceneTimings sets StartSeconds and EndSeconds for each scene proportional to text length
func AlignSceneTimings(scenes []script.Scene, totalDuration float64) []script.Scene {
	if len(scenes) == 0 || totalDuration <= 0 {
		return scenes
	}

	// Calculate total text length
	totalChars := 0
	for _, sc := range scenes {
		totalChars += len(strings.TrimSpace(sc.Text))
	}

	if totalChars == 0 {
		// Divide evenly if no text
		evenDur := totalDuration / float64(len(scenes))
		for i := range scenes {
			scenes[i].StartSeconds = math.Round(float64(i)*evenDur*100) / 100
			scenes[i].EndSeconds = math.Round(float64(i+1)*evenDur*100) / 100
		}
		return scenes
	}

	currentStart := 0.0
	for i := range scenes {
		charCount := len(strings.TrimSpace(scenes[i].Text))
		ratio := float64(charCount) / float64(totalChars)
		sceneDur := totalDuration * ratio

		scenes[i].StartSeconds = math.Round(currentStart*100) / 100
		currentStart += sceneDur
		scenes[i].EndSeconds = math.Round(currentStart*100) / 100

		// Ensure last scene extends to exact total duration
		if i == len(scenes)-1 {
			scenes[i].EndSeconds = math.Round(totalDuration*100) / 100
		}
	}

	return scenes
}
