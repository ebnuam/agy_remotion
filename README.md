# Automated Video Factory — 2.5D Motion Graphics Storytelling Engine

> **A self-hosted, agentic text-to-video production pipeline built with Golang, Edge TTS, and Remotion.**
> Generates vertical short-form videos (1080×1920 @ 30 FPS) with 100% audio-visual synchronization, fast-beat rhythm, kinetic typography, and 2.5D layered parallax compositing.

---

## 🌟 Key Features

1. **Local Studio Web Dashboard (`http://localhost:8080`)**:
   - Modern dark UI for channel selection, prompt generation, duration targeting, and live video previews.
   - **Asset Manager**: Drag-and-drop uploader for custom backgrounds (`.jpg`, `.png`), character vectors (`.svg`), and Lottie animations (`.json`).
   - **Manual Script Mode**: 0-token production using prepared JSON scripts from ChatGPT/Gemini.

2. **100% Precision Audio-Visual Synchronization (Beat-by-Beat TTS)**:
   - Eliminates timing drift by synthesizing narration audio scene-by-scene via Edge TTS.
   - Measures exact duration down to the millisecond (`mutagen`) and concatenates seamless MP3 playback.

3. **2.5D Parallax Compositing & Motion Design Engine**:
   - **Layer 1 (Background)**: Continuous horizontal panning, subtle zoom, and noir vignette.
   - **Layer 2 (Actor/Karakter)**: Spring-based entrance, vertical floating breathing (`Math.sin`), and cinematic drop-shadows.
   - **Layer 3 (Foreground UI)**: Dynamic punchy word-by-word kinetic subtitles (3–4 words per card), recording indicator, and case headlines.

4. **Multi-Channel Identity Presets**:
   - **Otak Receh**: Everyday psychology & humor (money rain, empty wallet, cafe coffee vs saset, impulsive checkout, panic alarms).
   - **Santri AI**: Islamic history & Golden Age science (Al-Jazari elephant clock, crankshaft water pump, astrolabe, manuscript scrolls).
   - **Oddly Known**: Deep sea mysteries & science facts (underwater sonar radar, 52 Hz whale anomaly, spectrograms, classified dossiers).

---

## 🏗️ Architecture

```
REMOTION/
├── backend-go/             # Go Orchestration Server & REST API
│   ├── cmd/server/         # Web Studio daemon (`video-factory-studio.exe`)
│   ├── cmd/factory/        # CLI video generation pipeline
│   ├── internal/           # Channels, Script, LLM Director, TTS, Remotion Renderer, QC
│   └── web/                # Localhost Web Dashboard frontend (HTML/CSS/JS)
├── frontend-remotion/      # Remotion React Engine (1080x1920 Vertikal)
│   ├── src/components/     # MainVideo, StagedScene, 2.5D Compositor
│   ├── src/motion/         # DynamicVisualCenter, KineticSubtitle, KineticHeadline
│   └── public/assets/      # Dynamic asset storage (images, vectors, Lottie)
├── channels/               # Channel configs & visual styling (Otak Receh, Santri AI, Oddly Known)
├── sample_scripts/         # Ready-to-render verified test scripts
└── run_studio.bat          # 1-Click launcher script for Windows
```

---

## 🚀 Quick Start

### Prerequisites
- [Go 1.22+](https://golang.org/)
- [Node.js 18+](https://nodejs.org/) & npm
- [Python 3.10+](https://python.org/) with `edge-tts` and `mutagen` installed:
  ```bash
  pip install edge-tts mutagen
  ```

### 1. Installation
Clone the repository:
```bash
git clone https://github.com/ebnuam/remotion.git
cd remotion
```

Install frontend Remotion dependencies:
```bash
cd frontend-remotion
npm install
cd ..
```

### 2. Run the Studio Dashboard
Simply double-click `run_studio.bat` or run:
```powershell
cd backend-go
go run ./cmd/server
```

Open your browser at **`http://localhost:8080`**.

---

## 🎬 CLI Production

You can also render videos directly via CLI:
```powershell
cd backend-go
go run ./cmd/factory -channel otak-receh -script ../sample_scripts/video_1_otak_receh_gaji.json
```

Outputs are automatically saved to `output/<channel_id>/<job_id>.mp4`.

---

## 📄 License
MIT License.
