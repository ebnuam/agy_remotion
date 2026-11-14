package main

import (
	"context"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

func main() {
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatalf("Failed to get cwd: %v", err)
	}

	var remotionDir, outputDir string
	if filepath.Base(cwd) == "backend-go" {
		remotionDir = filepath.Join(filepath.Dir(cwd), "frontend-remotion")
		outputDir = filepath.Join(filepath.Dir(cwd), "output", "prototype")
	} else {
		remotionDir = filepath.Join(cwd, "frontend-remotion")
		outputDir = filepath.Join(cwd, "output", "prototype")
	}

	if err := os.MkdirAll(outputDir, 0755); err != nil {
		log.Fatalf("Failed to create output dir: %v", err)
	}

	log.Println("==================================================")
	log.Println("  MULTI-CHANNEL VISUAL IDENTITY RENDERER")
	log.Println("==================================================")

	channels := []struct {
		CompID string
		Name   string
		Desc   string
	}{
		{"OtakRecehProto", "channel_1_otak_receh.png", "Otak Receh: Playful, colorful, psychology & everyday humor"},
		{"SantriAIProto", "channel_2_santri_ai.png", "Santri AI: Majestic emerald, illuminated manuscript, Islamic knowledge"},
		{"OddlyKnownProto", "channel_3_oddly_known.png", "Oddly Known: Cosmic blueprint, sonar telemetry, science curiosity"},
	}

	ctx := context.Background()

	for _, ch := range channels {
		outPath := filepath.Join(outputDir, ch.Name)
		log.Printf("[RENDER] Rendering Still for %s (%s)...", ch.CompID, ch.Desc)

		renderCtx, cancel := context.WithTimeout(ctx, 60*time.Second)
		cmd := exec.CommandContext(renderCtx, "npx.cmd", "remotion", "still", "src/index.ts", ch.CompID, outPath, "--frame=45")
		cmd.Dir = remotionDir
		output, err := cmd.CombinedOutput()
		cancel()

		if err != nil {
			log.Fatalf("[FATAL] Render failed for %s: %v\nOutput: %s\n", ch.CompID, err, string(output))
		}

		if fi, err := os.Stat(outPath); err == nil {
			log.Printf("[SUCCESS] Still saved: %s (%.2f KB)\n", ch.Name, float64(fi.Size())/1024.0)
		}
	}

	log.Println("==================================================")
	log.Println("[SUCCESS] ALL 3 CHANNEL PROTOTYPES RENDERED CLEANLY!")
	log.Println("==================================================")
}
