package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"video-factory/internal/channel"
	"video-factory/internal/config"
	"video-factory/internal/llm"
	"video-factory/internal/render"
	"video-factory/internal/script"
	"video-factory/internal/tts"
)

func main() {
	channelFlag := flag.String("channel", "otak-receh", "Channel ID (e.g. otak-receh, santri-ai, oddly-known)")
	topicFlag := flag.String("topic", "Kenapa Kita Suka Menunda Pekerjaan Padahal Deadline Sudah Mepet?", "Topic for video generation")
	scriptFlag := flag.String("script", "", "Path to manual script JSON file (bypasses LLM, saves 100% tokens)")
	durationFlag := flag.Int("duration", 0, "Target duration in seconds (0 uses channel default)")
	flag.Parse()

	log.Println("==================================================")
	log.Println("  AUTOMATED VIDEO FACTORY - ORCHESTRATOR (FASE 3) ")
	log.Println("==================================================")

	// 1. Load Environment Configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("[FATAL] Failed to load configuration: %v", err)
	}
	log.Printf("[INFO] Config loaded | LLM Base URL: %s | Model: %s", cfg.LLMBaseURL, cfg.LLMModel)

	// 2. Load Channel Configuration
	chConfig, err := channel.LoadChannelConfig(cfg.ChannelsDir, *channelFlag)
	if err != nil {
		log.Fatalf("[FATAL] Failed to load channel config: %v", err)
	}
	if *durationFlag > 0 {
		chConfig.DurationTargetSeconds = *durationFlag
		log.Printf("[INFO] Overriding duration target from flag: %d seconds", *durationFlag)
	}
	log.Printf("[INFO] Channel: %s (%s) | Voice: %s | Target: %ds", chConfig.DisplayName, chConfig.ID, chConfig.Voice, chConfig.DurationTargetSeconds)

	// 3. Create Unique Job Directory
	timestamp := time.Now().Format("20060102-150405")
	jobID := fmt.Sprintf("%s-%s", *channelFlag, timestamp)
	jobDir := filepath.Join(cfg.JobsDir, *channelFlag, jobID)

	if err := os.MkdirAll(jobDir, 0755); err != nil {
		log.Fatalf("[FATAL] Failed to create job directory %s: %v", jobDir, err)
	}
	log.Printf("[INFO] Created Job Directory: %s", jobDir)

	ctx := context.Background()

	var scriptData *script.ScriptData

	// 4. Step 1/3: Obtain Script (Manual Script File OR via AGYBridge LLM)
	if *scriptFlag != "" {
		log.Printf("[INFO] [Step 1/3] Using MANUAL script from file: %s (Bypassing LLM, 0 Token consumed)...", *scriptFlag)
		rawBytes, err := os.ReadFile(*scriptFlag)
		if err != nil {
			log.Fatalf("[FATAL] Failed to read manual script file: %v", err)
		}

		scriptData = &script.ScriptData{}
		if err := json.Unmarshal(rawBytes, scriptData); err != nil {
			log.Fatalf("[FATAL] Invalid JSON in manual script file: %v", err)
		}

		if err := script.ValidateScript(scriptData); err != nil {
			log.Fatalf("[FATAL] Manual script validation failed: %v", err)
		}

		if scriptData.ChannelID == "" {
			scriptData.ChannelID = *channelFlag
		}
		log.Printf("[SUCCESS] Manual script loaded & validated: \"%s\" (%d scenes)", scriptData.Title, len(scriptData.Scenes))
	} else {
		log.Printf("[INFO] [Step 1/3] Generating script via AGYBridge for topic: \"%s\"...", *topicFlag)
		llmClient := llm.NewLLMClient(cfg)

		var genErr error
		scriptData, genErr = llmClient.GenerateScript(ctx, chConfig, *topicFlag)
		if genErr != nil {
			log.Fatalf("[FATAL] Script generation failed: %v", genErr)
		}
		log.Printf("[SUCCESS] Script generated: \"%s\"", scriptData.Title)
	}

	// 5. Generate Narration Audio via Edge TTS with 100% per-scene synchronization
	audioPath := filepath.Join(jobDir, "audio.mp3")
	scenesAudioDir := filepath.Join(jobDir, "scenes_audio")
	log.Printf("[INFO] [Step 2/3] Generating synchronized audio narration with voice '%s'...", chConfig.Voice)
	ttsClient := tts.NewTTSClient(cfg.PythonPath)

	var audioDuration float64
	if len(scriptData.Scenes) > 0 {
		var syncScenes []script.Scene
		syncScenes, audioDuration, err = ttsClient.GenerateSceneAudios(ctx, scriptData.Scenes, chConfig.Voice, scenesAudioDir, audioPath)
		if err != nil {
			log.Printf("[WARN] Per-scene audio failed: %v. Falling back to single audio...", err)
			audioResult, fbErr := ttsClient.GenerateAudio(ctx, scriptData.Narration, chConfig.Voice, audioPath)
			if fbErr != nil {
				log.Fatalf("[FATAL] Audio generation failed: %v", fbErr)
			}
			audioDuration = audioResult.DurationSeconds
			scriptData.Scenes = tts.AlignSceneTimings(scriptData.Scenes, audioDuration)
		} else {
			scriptData.Scenes = syncScenes
		}
	} else {
		audioResult, aErr := ttsClient.GenerateAudio(ctx, scriptData.Narration, chConfig.Voice, audioPath)
		if aErr != nil {
			log.Fatalf("[FATAL] Audio generation failed: %v", aErr)
		}
		audioDuration = audioResult.DurationSeconds
		scriptData.Scenes = tts.AlignSceneTimings(scriptData.Scenes, audioDuration)
	}
	log.Printf("[SUCCESS] Audio created: %s (Duration: %.2fs for %d scenes)", audioPath, audioDuration, len(scriptData.Scenes))

	// 6. Save Final Script with Audio Timings
	scriptPath := filepath.Join(jobDir, "script.json")
	scriptBytes, err := json.MarshalIndent(scriptData, "", "  ")
	if err != nil {
		log.Fatalf("[FATAL] Failed to marshal script data: %v", err)
	}

	if err := os.WriteFile(scriptPath, scriptBytes, 0644); err != nil {
		log.Fatalf("[FATAL] Failed to save script to %s: %v", scriptPath, err)
	}

	// 7. Render Video via Remotion CLI
	log.Printf("[INFO] [Step 3/3] Rendering vertical video (1080x1920) via Remotion...")
	renderEngine := render.NewRenderEngine(cfg.RemotionProjectDir, cfg.OutputDir)

	renderResult, err := renderEngine.RenderVideo(
		ctx,
		jobID,
		jobDir,
		scriptData,
		audioPath,
		audioDuration,
		chConfig.DisplayName,
	)
	if err != nil {
		log.Fatalf("[FATAL] Video rendering failed: %v", err)
	}

	// 9. Final Output Report
	log.Println("==================================================")
	log.Printf("[SUCCESS] VIDEO PIPELINE COMPLETED SUCCESSFULLY!")
	log.Printf("[OUTPUT] Final Video MP4 : %s", renderResult.VideoPath)
	log.Printf("[OUTPUT] File Size       : %.2f MB (%d bytes)", float64(renderResult.FileSize)/(1024*1024), renderResult.FileSize)
	log.Printf("[OUTPUT] Script File     : %s", scriptPath)
	log.Printf("[OUTPUT] Audio File      : %s", audioPath)
	fmt.Println("--------------------------------------------------")
	fmt.Printf("Channel        : %s\n", chConfig.DisplayName)
	fmt.Printf("Title          : %s\n", scriptData.Title)
	fmt.Printf("Audio Duration : %.2f seconds\n", audioDuration)
	fmt.Printf("Total Scenes   : %d\n", len(scriptData.Scenes))
	fmt.Println("--------------------------------------------------")
	log.Println("[INFO] FASE 3 execution finished successfully.")
}
