# PANDUAN PENGGUNAAN NASKAH MANUAL (HEMAT 100% TOKEN LLM)

Fitur ini memungkinkan Anda membuat naskah di **ChatGPT**, **Google Gemini**, atau **Claude** secara gratis, lalu menyimpannya dalam format JSON dan langsung merendernya menjadi video MP4 profesional via Video Factory tanpa mengonsumsi token LLM AGYBridge sama sekali.

---

## 1. Cara Menjalankan (CLI Command)

Buka PowerShell / Terminal di root proyek (`C:\Users\USER\Documents\REMOTION`), lalu jalankan perintah berikut:

### Channel 1: Otak Receh (Psikologi & Humor Sehari-hari)
```powershell
cd backend-go
go run ./cmd/factory -channel otak-receh -script ../sample_scripts/otak_receh_sample.json
```

### Channel 2: Santri AI (Khazanah Sains & Sejarah Islam)
```powershell
cd backend-go
go run ./cmd/factory -channel santri-ai -script ../sample_scripts/santri_ai_sample.json
```

### Channel 3: Oddly Known (Fakta Misterius & Sains)
```powershell
cd backend-go
go run ./cmd/factory -channel oddly-known -script ../sample_scripts/oddly_known_sample.json
```

---

## 2. Struktur Format JSON Naskah

File naskah harus disimpan dalam format `.json`. Anda dapat menyimpannya di folder `sample_scripts/` atau folder kerja Anda sendiri.

```json
{
  "channel_id": "otak-receh",
  "title": "Judul Menarik Maksimal 7 Kata",
  "hook": "Pertanyaan pemicu rasa penasaran dalam 3 detik pertama",
  "narration": "Ini adalah teks lengkap yang akan dibacakan oleh voiceover TTS dari awal sampai akhir tanpa jeda koma aneh.",
  "punchline": "Kalimat penutup atau kesimpulan tajam yang menempel di kepala penonton.",
  "theme_color": "#FF7A00",
  "scenes": [
    {
      "index": 1,
      "text": "Kalimat spesifik yang diucapkan pada adegan pertama.",
      "visual": "scrolling",
      "visual_cue": "scrolling",
      "tag": "KATEGORI TAG",
      "headline_line1": "BARIS JUDUL 1",
      "headline_line2": "BARIS JUDUL 2",
      "objects": ["objek1", "objek2"],
      "camera_shot": "zoom-in",
      "sound_cue": "whoosh"
    }
  ]
}
```

> **Catatan Penting Timings (`start_seconds` & `end_seconds`)**:
> Anda **TIDAK PERLU** menghitung detik manual! Sistem backend Go secara otomatis menggunakan mutagen untuk mengukur durasi audio Edge TTS riil dan menghitung porsi waktu (`start_seconds` dan `end_seconds`) untuk tiap scene berdasarkan jumlah kata.

---

## 3. Master Prompt untuk ChatGPT / Gemini / Claude

Copy & paste prompt di bawah ini ke ChatGPT atau Google Gemini setiap kali Anda ingin membuat naskah video baru:

```markdown
Bertindaklah sebagai Scriptwriter & Visual Director untuk video pendek vertikal (TikTok/Reels/Shorts 9:16).
Saya ingin membuat naskah video untuk Channel: [PILIH SALAH SATU: "otak-receh" | "santri-ai" | "oddly-known"]
Dengan Topik: "[TULIS TOPIK VIDEO ANDA DI SINI]"

Aturan pembuatan:
1. Durasi naskah sekitar 30 - 45 detik (sekitar 75 - 110 kata narasi).
2. Hook di 3 detik pertama harus langsung memancing rasa penasaran audiens.
3. Bahasa Indonesia yang natural, mengalir, dan enak didengar saat dibacakan TTS.
4. Pecah narasi menjadi 4 hingga 6 adegan (scenes).
5. Output HANYA boleh dalam format RAW JSON murni (tanpa teks pembuka atau penutup markdown selain blok json).

Pilihan Visual Cue sesuai Channel:
- Untuk "otak-receh": "scrolling", "lazy", "panic", "brain_dopamine", "default" (Theme Color: "#FF7A00")
- Untuk "santri-ai": "manuscript", "astrolabe", "mechanism", "default" (Theme Color: "#10B981")
- Untuk "oddly-known": "radar", "spectrogram", "diagram", "default" (Theme Color: "#06B6D4")

Format JSON yang wajib diikuti:
{
  "channel_id": "...",
  "title": "...",
  "hook": "...",
  "narration": "...",
  "punchline": "...",
  "theme_color": "...",
  "scenes": [
    {
      "index": 1,
      "text": "...",
      "visual": "...",
      "visual_cue": "...",
      "tag": "...",
      "headline_line1": "...",
      "headline_line2": "...",
      "objects": ["...", "..."],
      "camera_shot": "zoom-in",
      "sound_cue": "whoosh"
    }
  ]
}
```

---

## 4. Keuntungan Menggunakan Naskah Manual

1. **Hemat Biaya & Kuota 100%**: Tidak menggunakan token LLM AGYBridge sama sekali.
2. **Kualitas Cerita Maksimal**: Anda bisa menyempurnakan naskah di web interface ChatGPT/Gemini sebebas mungkin sampai puas.
3. **TTS Otomatis & Gratis**: Menggunakan Microsoft Edge Neural TTS kualitas tinggi bahasa Indonesia (ArdiNeural / GadisNeural).
4. **Rendering Otomatis**: Sekali tekan Enter, video MP4 1080x1920 langsung jadi di folder `output/[channel_id]/`.
