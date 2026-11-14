package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

func main() {
	renderType := flag.String("type", "all", "Render type: 'all', 'stills', or 'video'")
	compositionID := flag.String("comp", "CinematicRiddle", "Composition ID to render")
	flag.Parse()

	cwd, err := os.Getwd()
	if err != nil {
		log.Fatalf("Failed to get cwd: %v", err)
	}

	// Resolve directories
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
	log.Printf("  CINEMATIC 2D MOTION GRAPHICS RENDERER (%s)\n", *compositionID)
	log.Println("==================================================")
	log.Printf("[INFO] Remotion Dir : %s\n", remotionDir)
	log.Printf("[INFO] Output Dir   : %s\n", outputDir)

	ctx := context.Background()

	// 1. Render Stills (Minimum 8 frames for Quality Control)
	if *renderType == "all" || *renderType == "stills" {
		stills := []struct {
			Name  string
			Frame int
			Desc  string
		}{
			{"riddle_frame_01_hook.png", 45, "Frame 45 (01.5s): Hook Headline 1 Dari 3 Anak Kos Maling HP"},
			{"riddle_frame_02_lineup.png", 95, "Frame 95 (03.1s): Suspect silhouettes with glowing contours"},
			{"riddle_frame_03_folder.png", 140, "Frame 140 (04.6s): Manila Detective Folder Kasus #1"},
			{"riddle_frame_04_stamp.png", 185, "Frame 185 (06.1s): Magnifying glass & Red Stamp TANPA TRIK"},
			{"riddle_frame_05_tkp.png", 250, "Frame 250 (08.3s): TKP Mati Lampu & Wall Clock Friday 21.00"},
			{"riddle_frame_06_dinda.png", 300, "Frame 300 (10.0s): Dinda silhouette behind table with powerbank"},
			{"riddle_frame_07_polaroid.png", 370, "Frame 370 (12.3s): Polaroid Suspect Photo Card KS-01 DINDA"},
			{"riddle_frame_08_alibi.png", 420, "Frame 420 (14.0s): Question Mark Mystery Alibi #2 Card"},
		}

		for _, st := range stills {
			outPath := filepath.Join(outputDir, st.Name)
			log.Printf("[STILL] Rendering Frame %d (%s)...", st.Frame, st.Desc)

			stillCtx, cancel := context.WithTimeout(ctx, 60*time.Second)
			cmd := exec.CommandContext(stillCtx, "npx.cmd", "remotion", "still", "src/index.ts", *compositionID, outPath, fmt.Sprintf("--frame=%d", st.Frame))
			cmd.Dir = remotionDir
			output, err := cmd.CombinedOutput()
			cancel()

			if err != nil {
				log.Printf("[ERROR] Still render failed for %s: %v\nOutput: %s\n", st.Name, err, string(output))
			} else {
				if fi, err := os.Stat(outPath); err == nil {
					log.Printf("[SUCCESS] Still saved: %s (%.2f KB)\n", st.Name, float64(fi.Size())/1024.0)
				}
			}
		}
	}

	// 2. Render MP4 Video
	if *renderType == "all" || *renderType == "video" {
		videoPath := filepath.Join(outputDir, "cinematic_riddle_prototype.mp4")
		log.Printf("[VIDEO] Rendering 15.0s MP4 (450 frames @ 30fps) to %s...\n", videoPath)

		videoCtx, cancel := context.WithTimeout(ctx, 300*time.Second)
		defer cancel()

		cmd := exec.CommandContext(videoCtx, "npx.cmd", "remotion", "render", "src/index.ts", *compositionID, videoPath)
		cmd.Dir = remotionDir
		output, err := cmd.CombinedOutput()

		if err != nil {
			log.Fatalf("[FATAL] Video render failed: %v\nOutput: %s\n", err, string(output))
		}

		fi, err := os.Stat(videoPath)
		if err != nil {
			log.Fatalf("[FATAL] Video file not found: %v", err)
		}

		log.Println("==================================================")
		log.Println("[SUCCESS] CINEMATIC MOTION GRAPHICS PROTOTYPE RENDERED!")
		log.Printf("Output Path : %s\n", videoPath)
		log.Printf("File Size   : %.2f MB (%d bytes)\n", float64(fi.Size())/(1024*1024), fi.Size())
		log.Println("Duration    : 15.0 seconds (450 frames @ 30fps)")
		log.Println("Resolution  : 1080 x 1920 (Vertical 9:16)")
		log.Println("==================================================")
	}
}
