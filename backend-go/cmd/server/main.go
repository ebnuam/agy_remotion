package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"video-factory/internal/config"
	"video-factory/internal/server"
)

func main() {
	portFlag := flag.Int("port", 8080, "Port for Video Factory Studio web server")
	flag.Parse()

	log.Println("==================================================")
	log.Println("       VIDEO FACTORY STUDIO - WEB SERVER          ")
	log.Println("==================================================")

	// 1. Load Configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("[FATAL] Failed to load configuration: %v", err)
	}

	// 2. Resolve Web Assets Directory
	webDir := "web"
	if _, err := os.Stat(webDir); os.IsNotExist(err) {
		// Try relative to project root
		webDir = filepath.Join("..", "backend-go", "web")
		if _, err := os.Stat(webDir); os.IsNotExist(err) {
			webDir = "backend-go/web"
		}
	}

	absWebDir, _ := filepath.Abs(webDir)
	log.Printf("[INFO] Web Dashboard Assets Path: %s", absWebDir)

	// 3. Initialize Server
	srv, err := server.NewServer(cfg, absWebDir)
	if err != nil {
		log.Fatalf("[FATAL] Failed to initialize server: %v", err)
	}

	addr := fmt.Sprintf(":%d", *portFlag)
	url := fmt.Sprintf("http://localhost:%d", *portFlag)

	fmt.Println("--------------------------------------------------")
	fmt.Printf("🚀 STUDIO WEB DASHBOARD SIAP DIBUKA DI:\n")
	fmt.Printf("👉 %s\n", url)
	fmt.Println("--------------------------------------------------")
	log.Printf("[INFO] Server listening on %s (Press Ctrl+C to stop)", addr)

	if err := http.ListenAndServe(addr, srv.Routes()); err != nil && err != http.ErrServerClosed {
		log.Fatalf("[FATAL] Server error: %v", err)
	}
}
