# PORTABILITY GUIDE: WINDOWS, LINUX, & CLOUD VPS RENDERING

This guide provides reproducible, copy-paste terminal instructions to build, preview, and render the **Kok Iso Yo?** 60-second pilot across different operating systems and headless cloud environments.

---

## 1. SYSTEM REQUIREMENTS & DEPENDENCIES

### 1.1 Locked Runtime Versions
- **Node.js:** v18.x – v24.x (Tested on v24.22.1)
- **Remotion:** 4.0.543
- **Three.js:** `0.161.0` (Must be exact version to avoid shader chunk breakages)
- **React / React-DOM:** 18.3.1
- **Python:** 3.10+ (Used for Edge-TTS voice generation & audio verification)
- **FFmpeg:** Automatically bundled via `@remotion/compositor-win32-x64-msvc` or system ffmpeg.

---

## 2. WINDOWS INSTRUCTIONS (LOCAL DEVELOPMENT & WORKSTATION)

### 2.1 One-Time Environment Setup
Ensure Node.js and Python are installed:
```powershell
# 1. Install Edge-TTS and Mutagen for narration generation
pip install edge-tts mutagen

# 2. Navigate to frontend-remotion and install packages
cd frontend-remotion
npm install
```

### 2.2 Audio Voiceover Generation (If Re-synthesizing)
```powershell
python -c "
import asyncio, edge_tts, os
texts = [
    ('vo_scene1.mp3', 'Kok es batu bisa mengapung?'),
    ('vo_scene2.mp3', 'Padahal, bukannya benda padat harusnya tenggelam?'),
    ('vo_scene3.mp3', 'Saat membeku, molekul air membentuk susunan yang lebih renggang. Akibatnya, volume air bertambah dan massa jenisnya justru turun.'),
    ('vo_scene4.mp3', 'Itulah sebabnya es bisa mengapung di atas air.'),
    ('vo_scene5.mp3', 'Dingin-dingin malah makan tempat!')
]
for fn, txt in texts:
    asyncio.run(edge_tts.Communicate(txt, 'id-ID-ArdiNeural').save(os.path.join('public/assets/kok_iso_yo', fn)))
"
```

### 2.3 Rendering Commands

#### A. Single Still Frame Audit (Fast Quality Check)
```cmd
cmd /c "set TEMP=D:\remotion_tmp& set TMP=D:\remotion_tmp& cd /d C:\Users\USER\Documents\REMOTION\frontend-remotion& node node_modules/@remotion/cli/remotion-cli.js still src/sandboxes/kok-iso-yo-pilot/entry.tsx KokIsoYoPilot01 D:\remotion_output\still_audit.png --frame=120 --gl=angle"
```

#### B. 60-Second Preview Video (540×960 @ 30 FPS, 1,800 frames)
```cmd
cmd /c "set TEMP=D:\remotion_tmp& set TMP=D:\remotion_tmp& cd /d C:\Users\USER\Documents\REMOTION\frontend-remotion& node node_modules/@remotion/cli/remotion-cli.js render src/sandboxes/kok-iso-yo-pilot/entry.tsx KokIsoYoPilot01 D:\remotion_output\kok_iso_yo_pilot_preview_540p.mp4 --concurrency=1 --gl=angle"
```

#### C. 60-Second Production Master (1080×1920 @ 30 FPS, 1,800 frames)
```cmd
cmd /c "set TEMP=D:\remotion_tmp& set TMP=D:\remotion_tmp& cd /d C:\Users\USER\Documents\REMOTION\frontend-remotion& node node_modules/@remotion/cli/remotion-cli.js render src/sandboxes/kok-iso-yo-pilot/entry.tsx KokIsoYoPilot01-1080p D:\remotion_output\kok_iso_yo_pilot_final_1080p.mp4 --concurrency=1 --gl=angle"
```

---

## 3. LINUX & CLOUD VPS INSTRUCTIONS (HEADLESS CONTAINER / VM)

Because cloud servers usually lack physical display servers and hardware GPUs, rendering Three.js WebGL requires a virtual framebuffer (`xvfb`) and software rasterizer (`swiftshader`).

### 3.1 Install OS Prerequisites (Ubuntu 22.04 / 24.04 LTS)
```bash
sudo apt update && sudo apt install -y \
  ffmpeg \
  xvfb \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpangocairo-1.0-0 \
  python3 \
  python3-pip
```

### 3.2 Install Project Dependencies
```bash
cd REMOTION/frontend-remotion
npm install
pip3 install edge-tts mutagen
```

### 3.3 Headless Rendering Execution
```bash
# Set output directory
mkdir -p out

# Render using Xvfb virtual framebuffer and SwiftShader software OpenGL
xvfb-run -s "-screen 0 1080x1920x24" node node_modules/@remotion/cli/remotion-cli.js render \
  src/sandboxes/kok-iso-yo-pilot/entry.tsx \
  KokIsoYoPilot01-1080p \
  out/kok_iso_yo_pilot_final_1080p.mp4 \
  --gl=angle \
  --angle-backend=swiftshader \
  --concurrency=1
```

---

## 4. VERIFICATION CHECKLIST

Before deploying or releasing:
- [x] Full video duration is 60.00 seconds (1,800 frames @ 30 FPS).
- [x] Subtitles are synchronized with speech start and stop times.
- [x] All 5 scenes transition smoothly without abrupt camera teleportation.
- [x] Character is visually grounded with contact shadows.
- [x] Bridge Test C postprocessing stack is active (InkPass, LensBlur, Bloom, ACES Filmic, Day Grade).
- [x] Audio tracks are mixed with balanced levels (VO: 1.0, BGM: 0.24, SFX: 0.4–0.85).
