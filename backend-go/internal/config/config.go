package config

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	LLMBaseURL         string
	LLMAPIKey          string
	LLMModel           string
	RemotionProjectDir string
	OutputDir          string
	JobsDir            string
	ChannelsDir        string
	PythonPath         string
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

// manualLoadEnv reads an .env file directly if godotenv fails or skips
func manualLoadEnv(path string) {
	file, err := os.Open(path)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			k := strings.TrimSpace(parts[0])
			v := strings.TrimSpace(parts[1])
			v = strings.Trim(v, `"'`)
			if os.Getenv(k) == "" {
				os.Setenv(k, v)
			}
		}
	}
}

// LoadConfig loads environment variables from .env files and environment
func LoadConfig() (*Config, error) {
	// Search upwards for .env
	cwd, _ := os.Getwd()
	curr := cwd
	for i := 0; i < 4; i++ {
		envPath := filepath.Join(curr, ".env")
		if info, err := os.Stat(envPath); err == nil && !info.IsDir() {
			_ = godotenv.Load(envPath)
			manualLoadEnv(envPath)
			break
		}
		curr = filepath.Dir(curr)
	}

	llmBaseURL := os.Getenv("LLM_BASE_URL")
	if llmBaseURL == "" {
		llmBaseURL = os.Getenv("OPENAI_BASE_URL")
	}
	if llmBaseURL == "" {
		llmBaseURL = "https://agybridge.onrender.com/v1"
	}

	llmAPIKey := os.Getenv("LLM_API_KEY")
	if llmAPIKey == "" {
		llmAPIKey = os.Getenv("OPENAI_API_KEY")
	}
	if llmAPIKey == "" {
		return nil, errors.New("LLM_API_KEY or OPENAI_API_KEY is required in environment or .env")
	}

	llmModel := os.Getenv("LLM_MODEL")
	if llmModel == "" {
		llmModel = os.Getenv("OPENAI_MODEL")
	}
	if llmModel == "" {
		llmModel = "gemini-3.8-flash-high"
	}

	remotionDir := getEnv("REMOTION_PROJECT_DIR", "../frontend-remotion")
	outputDir := getEnv("OUTPUT_DIR", "../output")
	jobsDir := getEnv("JOBS_DIR", "../jobs")
	channelsDir := getEnv("CHANNELS_DIR", "../channels")

	// Resolve channelsDir relative to workspace root if needed
	if _, err := os.Stat(channelsDir); err != nil {
		altChannelsDir := filepath.Join(filepath.Dir(cwd), "channels")
		if _, err := os.Stat(altChannelsDir); err == nil {
			channelsDir = altChannelsDir
		}
	}

	pythonPath := os.Getenv("PYTHON_PATH")
	if pythonPath == "" {
		localAppData := os.Getenv("LOCALAPPDATA")
		installedPy := filepath.Join(localAppData, "Programs", "Python", "Python312", "python.exe")
		if _, err := os.Stat(installedPy); err == nil {
			pythonPath = installedPy
		} else {
			pythonPath = "python"
		}
	}

	fmt.Printf("[DEBUG] Channels Dir: %s | Jobs Dir: %s\n", channelsDir, jobsDir)

	return &Config{
		LLMBaseURL:         llmBaseURL,
		LLMAPIKey:          llmAPIKey,
		LLMModel:           llmModel,
		RemotionProjectDir: remotionDir,
		OutputDir:          outputDir,
		JobsDir:            jobsDir,
		ChannelsDir:        channelsDir,
		PythonPath:         pythonPath,
	}, nil
}
