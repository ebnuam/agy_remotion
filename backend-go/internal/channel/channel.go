package channel

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type Resolution struct {
	Width  int `json:"width"`
	Height int `json:"height"`
	Fps    int `json:"fps"`
}

type VisualIdentity struct {
	Palette    map[string]string `json:"palette,omitempty"`
	Style      string            `json:"style,omitempty"`
	MotionFeel string            `json:"motion_feel,omitempty"`
	Typography string            `json:"typography,omitempty"`
}

type ChannelConfig struct {
	ID                    string          `json:"id"`
	DisplayName           string          `json:"display_name"`
	Language              string          `json:"language"`
	Voice                 string          `json:"voice"`
	Niche                 string          `json:"niche"`
	Tone                  string          `json:"tone"`
	VisualTemplate        string          `json:"visual_template"`
	DurationTargetSeconds int             `json:"duration_target_seconds"`
	Resolution            Resolution      `json:"resolution"`
	ContentPillars        []string        `json:"content_pillars"`
	EditorialRules        []string        `json:"editorial_rules,omitempty"`
	VisualIdentity        *VisualIdentity `json:"visual_identity,omitempty"`
}

// LoadChannelConfig loads channel configuration from channels/{channelID}/channel.json
func LoadChannelConfig(channelsDir, channelID string) (*ChannelConfig, error) {
	configPath := filepath.Join(channelsDir, channelID, "channel.json")
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read channel config at %s: %w", configPath, err)
	}

	var cfg ChannelConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("invalid json in channel config at %s: %w", configPath, err)
	}

	if cfg.ID == "" {
		cfg.ID = channelID
	}
	if cfg.DurationTargetSeconds <= 0 {
		cfg.DurationTargetSeconds = 30
	}
	if cfg.Resolution.Width == 0 {
		cfg.Resolution.Width = 1080
	}
	if cfg.Resolution.Height == 0 {
		cfg.Resolution.Height = 1920
	}
	if cfg.Resolution.Fps == 0 {
		cfg.Resolution.Fps = 30
	}

	return &cfg, nil
}
