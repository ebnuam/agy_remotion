# PANDUAN PENGGUNAAN VIDEO FACTORY STUDIO (LOCAL WEB APP)

Selamat datang di **Video Factory Studio**, aplikasi web lokal untuk memproduksi video vertikal (*Shorts / Reels / TikTok*) secara otomatis berbasis AI dan Motion Graphics Cinematic Engine.

---

## 1. Cara Menjalankan Studio

Aplikasi web studio saat ini **sudah aktif berjalan di background**. Anda dapat langsung membukanya di browser:

👉 **[http://localhost:8080](http://localhost:8080)**

Jika di kemudian hari server belum berjalan, cukup jalankan salah satu dari cara berikut:

### Opsi A (Paling Mudah — 1 Klik):
Klik dua kali file:
```
C:\Users\USER\Documents\REMOTION\run_studio.bat
```
File ini akan otomatis menyalakan server Go dan membuka browser ke `http://localhost:8080`.

### Opsi B (Terminal / PowerShell):
```powershell
cd C:\Users\USER\Documents\REMOTION\backend-go
.\video-factory-studio.exe -port 8080
```

---

## 2. Fitur-Fitur Utama Dashboard

### A. Tab "Create Video" (Studio Produksi)
1. **Pilih Channel**:
   - **Otak Receh**: Niche psikologi & humor sehari-hari. Visual playful, animated brain, smartphone scrolling, alarm panik, kinetic typography.
   - **Santri AI**: Niche khazanah & sejarah Islam. Visual manuskrip kuno berornamen emas, astrolabe mekanik, lentera qandil.
   - **Oddly Known**: Niche sains & fakta anomali. Visual radar sonar, grafik spektrogram 52 Hz, HUD telemetri kosmik.
2. **Pilih Mode Pembuatan Naskah**:
   - **AI Director**: Cukup masukkan satu kalimat ide/topik. AI Director akan otomatis menyusun hook, alur naskah, pembagian adegan, dan arahan visual.
   - **Naskah Manual JSON**: Bagi Anda yang membuat naskah di web ChatGPT/Gemini, cukup paste RAW JSON ke area teks untuk memproduksi video dengan **0 token LLM**!
3. **Pengaturan Produksi**:
   - Target Durasi: 30 detik, 45 detik, atau 60 detik.
   - Format: Vertikal 9:16 (1080 × 1920).
   - Pengisi Suara: `id-ID-ArdiNeural` (Pria) atau `id-ID-GadisNeural` (Wanita).
4. **Tombol "Mulai Generate Video Sekarang"**:
   - Sekali klik, pipeline produksi akan berjalan otomatis di background.

### B. Tab "Live Monitor" (Pemantau Real-time)
- **Stepper 6 Fase Produksi**:
  1. *Merumuskan Konsep & Hook*
  2. *Penyusunan Script & Storyboard*
  3. *Sintesis Audio Voiceover (Edge TTS)*
  4. *Penyelarasan Durasi & Timing Adegan (Mutagen)*
  5. *Rendering Video Remotion (1080×1920)*
  6. *Automated Quality Control (QC)*
- **Terminal Log Real-time**: Menampilkan output eksekusi backend secara langsung.
- **Tombol Tonton Preview**: Muncul seketika setelah render selesai.

### C. Tab "Video Library" (Perpustakaan Video)
- Menampilkan grid seluruh video yang pernah diproduksi lengkap dengan judul, channel badge, durasi, dan ukuran file.
- Klik video apa saja untuk membuka **Player Modal**, menonton langsung di browser, atau mengunduh file `.mp4`.

---

## 3. Hasil Pengujian Target Wajib

Dua pengujian video aktual telah selesai diproduksi dan diverifikasi:

1. **Target 1 — Otak Receh (Insomnia & Memori Memalukan)**:
   - **Topik**: *"Kenapa kita sering mengingat kejadian memalukan sebelum tidur?"*
   - **File MP4**: `output/otak-receh/otak-receh-20261114-144348.mp4` (`17.84 MB`, 32.42s)
   - **Visual Storytelling**: Adegan kamar tidur jam 2 pagi, amigdala mengoperasikan proyektor film memori memalukan (*cringe memory reel*), tameng evolusi purba, dan alarm panik.

2. **Target 2 — Otak Receh (Ilusi Waktu & Dopamin)**:
   - **Topik**: *"Kenapa waktu terasa jauh lebih cepat saat kita bersenang-senang?"*
   - **File MP4**: `output/otak-receh/otak-receh-20261114-144923.mp4` (`15.15 MB`, 30.26s)
   - **Visual Storytelling**: Paradoks waktu 4 jam vs 10 menit, karakter otak banjir pil dopamin, amigdala santai di sofa, dan jam menjerit mode bosan.
