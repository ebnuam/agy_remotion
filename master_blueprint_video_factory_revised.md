# MASTER BLUEPRINT
# AUTOMATED VIDEO FACTORY
**Stack:** Golang + AGYBridge (OpenAI-compatible LLM) + Edge TTS + Remotion (React/TypeScript)  
**Arsitektur:** Satu production engine, banyak konfigurasi channel  
**Strategi:** Bangun dan validasi satu channel terlebih dahulu sebelum mengaktifkan channel lainnya.

---

## 0. KEPUTUSAN PRODUK DAN RUANG LINGKUP

### 0.1 Konsep channel

| Channel | Bahasa | Fokus konten | Gaya |
|---|---|---|---|
| Santri AI | Indonesia | Edukasi Islam, ibadah, sejarah Islam, adab, Ramadan | Islamic edutainment, storytelling, humor ringan yang pantas |
| OtakReceh | Indonesia | Psychology, everyday humor, kehidupan sehari-hari, literasi keuangan, akuntansi dasar | Relatable, lucu, informatif |
| OddlyKnown | Inggris | Science, weird facts, teknologi, fenomena alam | Curious, entertaining, educational |

**Catatan strategi:** Ketiga channel adalah target pengembangan, bukan target peluncuran serentak. Mulai dari satu channel, validasi pipeline dan respons penonton, lalu aktifkan channel berikutnya melalui konfigurasi.

### 0.2 Prinsip produksi

1. Remotion menangani motion graphics 2D, typography, shape, chart sederhana, dan komposisi visual.
2. Jangan mengasumsikan Remotion dapat membuat animasi karakter 3D atau video sinematik AI dengan sendirinya.
3. Gunakan aset lokal/SVG/CSS terlebih dahulu agar biaya visual rendah.
4. AI menghasilkan naskah terstruktur, bukan sekadar paragraf bebas.
5. Klaim faktual dan keagamaan harus melewati pemeriksaan sumber sebelum dipublikasikan.
6. Video yang diproduksi otomatis tetap harus memiliki variasi substansial, nilai orisinal, dan pemeriksaan kualitas. Kuantitas bukan pengganti kualitas.

---

## 1. ARSITEKTUR SISTEM

```text
                    CONFIG CHANNEL
                          |
                          v
                 GOLANG ORCHESTRATOR
                          |
             +------------+------------+
             |                         |
             v                         v
        AGYBRIDGE / LLM            VALIDATION
        Generate script          JSON + content rules
             |                         |
             +------------+------------+
                          |
                          v
                   SCRIPT DATA JSON
                          |
              +-----------+-----------+
              |                       |
              v                       v
         EDGE TTS                 VISUAL DATA
      Generate narration       Scene / timing / theme
              |                       |
              +-----------+-----------+
                          |
                          v
                    REMOTION
              Render video from props
                          |
                          v
                  OUTPUT MP4 + LOG
                          |
                          v
                 MANUAL QUALITY CHECK
```

### Pembagian tanggung jawab

| Komponen | Tanggung jawab |
|---|---|
| Golang | Orkestrasi, konfigurasi channel, request AI, validasi JSON, pemanggilan TTS, penyiapan props, logging |
| AGYBridge | Menghubungkan backend ke model AI yang kompatibel dengan API OpenAI |
| Edge TTS | Menghasilkan file audio narasi |
| Remotion | Merender video berdasarkan props, audio, dan komponen visual |
| Operator | Memeriksa fakta, kualitas narasi, audio, visual, dan kelayakan publikasi |

### Alur data yang disarankan

Golang menyiapkan satu paket render untuk setiap video. Paket tersebut berisi:
- `script.json`
- `audio.mp3`
- metadata channel
- metadata durasi dan timing scene

Golang kemudian menjalankan Remotion CLI dengan `--props` yang menunjuk ke file props JSON. Jangan mengandalkan komponen Remotion membaca `../../channels/.../dataset.json` secara langsung saat runtime.

---

## 2. STRUKTUR FOLDER PROYEK

Struktur berikut memisahkan backend, frontend, konfigurasi channel, aset, dan hasil render.

```text
video-factory/
├── backend-go/
│   ├── cmd/
│   │   └── factory/
│   │       └── main.go
│   ├── internal/
│   │   ├── config/
│   │   ├── llm/
│   │   ├── script/
│   │   ├── tts/
│   │   ├── render/
│   │   └── storage/
│   ├── go.mod
│   └── .env.example
│
├── frontend-remotion/
│   ├── public/
│   │   └── assets/
│   ├── src/
│   │   ├── Root.tsx
│   │   ├── compositions/
│   │   ├── components/
│   │   ├── utils/
│   │   └── types/
│   └── package.json
│
├── channels/
│   ├── santri-ai/
│   │   └── channel.json
│   ├── otak-receh/
│   │   └── channel.json
│   └── oddly-known/
│       └── channel.json
│
├── jobs/
│   └── (folder kerja sementara per video)
│
├── output/
│   ├── santri-ai/
│   ├── otak-receh/
│   └── oddly-known/
│
└── README.md
```

**Penting:** File audio dan props setiap pekerjaan harus memiliki folder sendiri. Jangan memakai satu `audio.mp3` global karena proses render yang berjalan berdekatan dapat saling menimpa file.

Contoh:

```text
jobs/
└── otak-receh/
    └── 2026-11-14-001/
        ├── script.json
        ├── audio.mp3
        └── render-props.json
```

---

## 3. PERSIAPAN WORKSPACE

Contoh berikut menggunakan PowerShell di Windows. Jalankan perintah satu per satu dan pastikan setiap tahap berhasil sebelum melanjutkan.

### 3.1 Periksa tools

```powershell
go version
node --version
npm --version
python --version
git --version
```

Jika salah satu command tidak dikenali, selesaikan instalasi atau konfigurasi PATH terlebih dahulu.

### 3.2 Buat folder proyek

```powershell
mkdir video-factory
cd video-factory

mkdir backend-go
mkdir frontend-remotion
mkdir channels
mkdir jobs
mkdir output

mkdir channels/santri-ai
mkdir channels/otak-receh
mkdir channels/oddly-known

mkdir output/santri-ai
mkdir output/otak-receh
mkdir output/oddly-known
```

### 3.3 Inisialisasi Golang

```powershell
cd backend-go
go mod init video-factory
go get github.com/sashabaranov/go-openai
cd ..
```

Catatan:
- Library `go-openai` digunakan jika endpoint AGYBridge benar-benar kompatibel dengan format API OpenAI yang didukung library tersebut.
- `BaseURL`, model, dan API key harus berasal dari konfigurasi, bukan ditulis permanen di source code.
- Jangan menganggap token bebas. Ikuti mekanisme autentikasi yang disyaratkan AGYBridge.

### 3.4 Inisialisasi Remotion

```powershell
npx create-video@latest frontend-remotion
```

Ikuti pilihan template yang tersedia pada versi CLI saat dijalankan. Jika tersedia template Blank, pilih itu untuk memulai dari struktur minimal.

Setelah selesai:

```powershell
cd frontend-remotion
npm install
cd ..
```

### 3.5 Pasang Edge TTS

Disarankan memakai virtual environment Python agar dependency proyek terisolasi.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install edge-tts
```

Jika PowerShell memblokir aktivasi virtual environment, gunakan petunjuk resmi Python/PowerShell untuk mengatur execution policy yang sesuai. Jangan mengubah kebijakan keamanan sistem secara sembarangan.

---

## 4. KONFIGURASI CHANNEL

Setiap channel memiliki konfigurasi sendiri. Backend membaca konfigurasi berdasarkan channel yang dipilih.

Contoh `channels/otak-receh/channel.json`:

```json
{
  "id": "otak-receh",
  "display_name": "OtakReceh",
  "language": "id-ID",
  "voice": "id-ID-ArdiNeural",
  "niche": "Psychology & Everyday Humor",
  "tone": "santai, jenaka, relatable, tidak menggurui",
  "visual_template": "funny-explainer",
  "duration_target_seconds": 40,
  "resolution": {
    "width": 1080,
    "height": 1920,
    "fps": 30
  },
  "content_pillars": [
    "psychology",
    "everyday_humor",
    "personal_finance",
    "basic_accounting"
  ]
}
```

Contoh konfigurasi channel lain dapat memakai struktur yang sama, tetapi bahasa, voice, tone, template visual, dan pilar kontennya harus disesuaikan.

Untuk Santri AI, tambahkan aturan editorial khusus:
- Periksa ayat, hadis, dan rujukan keagamaan.
- Jangan membuat atau mengarang dalil.
- Jangan menjadikan ibadah, ayat, hadis, atau perkara akidah sebagai bahan lelucon.
- Jika ada perbedaan pendapat fikih, jangan menyajikan satu pendapat sebagai satu-satunya pendapat tanpa konteks.

Untuk OddlyKnown:
- Gunakan bahasa Inggris yang natural.
- Verifikasi fakta ilmiah.
- Hindari klaim sensasional yang tidak didukung sumber.

---

## 5. PROMPT UNTUK GOLANG BACKEND

Buka folder `backend-go` di editor AI. Minta AI membangun backend secara bertahap, bukan langsung membuat seluruh sistem tanpa pengujian.

### PROMPT GOLANG

> Kamu adalah Senior Golang Engineer. Bangun backend untuk Automated Video Factory dengan arsitektur modular.
>
> **Stack:**
> - Golang
> - `github.com/sashabaranov/go-openai`
> - AGYBridge sebagai endpoint LLM OpenAI-compatible
> - Edge TTS yang dipanggil melalui `os/exec`
> - Remotion CLI untuk rendering video
>
> **Persyaratan:**
>
> 1. Buat konfigurasi menggunakan environment variables:
>    - `LLM_BASE_URL`
>    - `LLM_API_KEY`
>    - `LLM_MODEL`
>    - `REMOTION_PROJECT_DIR`
>    - `OUTPUT_DIR`
>    - `PYTHON_PATH` atau path executable Edge TTS yang dapat dikonfigurasi.
>
> 2. Jangan menulis API key atau token di source code. Sediakan `.env.example` tanpa secret sungguhan.
>
> 3. Buat fungsi `loadChannelConfig(channelID)` untuk membaca konfigurasi dari `channels/{channelID}/channel.json`.
>
> 4. Buat fungsi `fetchScriptFromAI(channelConfig, topic)`:
>    - Gunakan konfigurasi channel untuk bahasa, niche, tone, durasi, dan aturan editorial.
>    - Minta AI menghasilkan JSON terstruktur.
>    - Validasi dan parse respons JSON.
>    - Tangani respons kosong, JSON tidak valid, timeout, dan HTTP error.
>    - Jangan menganggap keluaran AI selalu valid.
>
> 5. Gunakan struktur script yang sekurang-kurangnya berisi:
>    - `title`
>    - `hook`
>    - `narration`
>    - `punchline`
>    - `scenes`
>    - `sources` atau referensi verifikasi jika konten memuat klaim faktual.
>
> 6. Buat fungsi `generateAudio(text, outputFile, voice)`:
>    - Jalankan Edge TTS menggunakan `os/exec`.
>    - Kirim argumen command sebagai array, bukan menyusun satu command shell dari string input.
>    - Simpan audio ke folder job yang unik.
>    - Tangani error dan pastikan file output benar-benar terbentuk.
>
> 7. Buat fungsi untuk memperoleh durasi audio. Gunakan cara yang dapat diuji dan jangan menebak durasi hanya dari jumlah karakter.
>
> 8. Buat `render-props.json` untuk Remotion. Sertakan path audio yang dapat diakses oleh proses render, data script, konfigurasi visual, dan durasi komposisi.
>
> 9. Jalankan Remotion CLI melalui `os/exec` dengan argument yang terpisah dan path yang jelas. Gunakan input props JSON melalui mekanisme CLI Remotion yang sesuai dengan versi proyek.
>
> 10. Simpan hasil ke folder output berdasarkan channel dan job ID. Jangan memakai satu nama file sementara global untuk semua job.
>
> 11. Tambahkan logging, context timeout, error handling, dan status job.
>
> 12. Buat kode modular dengan struktur package yang jelas. Jangan menaruh semua logika di satu `main.go`.
>
> Mulai dengan implementasi satu alur end-to-end untuk satu channel. Pastikan setiap tahap dapat diuji sebelum menambah concurrency atau batch processing.

---

## 6. FORMAT DATA SCRIPT

Gunakan schema yang konsisten antara backend dan frontend.

Contoh `script.json`:

```json
{
  "title": "Kenapa Gaji Baru Masuk Langsung Habis?",
  "hook": "Pernah merasa gaji cuma mampir sebentar di rekening?",
  "narration": "Gaji masuk tanggal satu. Bayar tagihan, cicilan, kebutuhan, lalu tiba-tiba saldo menipis. Ini berkaitan dengan pengelolaan arus kas dan pola pengeluaran.",
  "punchline": "Gajinya bukan hilang. Dia cuma punya banyak janji temu.",
  "theme": "#172554",
  "scenes": [
    {
      "text": "Gaji baru masuk...",
      "start_seconds": 0,
      "end_seconds": 4,
      "visual": "salary-in"
    },
    {
      "text": "Tagihan mulai berdatangan",
      "start_seconds": 4,
      "end_seconds": 12,
      "visual": "bills"
    },
    {
      "text": "Saldo mulai menipis",
      "start_seconds": 12,
      "end_seconds": 20,
      "visual": "balance-drop"
    }
  ],
  "sources": []
}
```

Ini hanya contoh format. Timing scene harus disesuaikan dengan audio yang benar-benar dihasilkan. Jangan menganggap timestamp contoh sebagai timing final.

Untuk konten yang membutuhkan referensi, `sources` harus berisi sumber yang benar-benar diperiksa. Jangan meminta AI mengarang URL atau referensi.

---

## 7. PROMPT UNTUK REMOTION FRONTEND

### PROMPT REMOTION

> Kamu adalah Senior React Motion Graphics Engineer yang menguasai Remotion dan TypeScript.
>
> Bangun sistem renderer video vertikal 1080x1920, 30fps, dengan data yang diterima melalui Remotion input props.
>
> **Ketentuan teknis:**
>
> 1. Buat TypeScript types untuk `RenderProps`, `ScriptData`, `SceneData`, dan konfigurasi visual.
>
> 2. Jangan membaca `../../channels/.../dataset.json` langsung dari komponen Remotion. Backend akan mengirimkan data melalui props JSON saat menjalankan Remotion CLI.
>
> 3. Audio harus berasal dari path aset yang dapat diakses oleh proses Remotion. Gunakan mekanisme `staticFile()` hanya untuk aset yang memang berada di folder `public` dan tersedia saat bundling/rendering. Jika audio berada di folder job eksternal, siapkan mekanisme staging/copy yang aman atau gunakan URL/path yang didukung oleh workflow Remotion.
>
> 4. Buat komposisi dengan scene yang dapat berubah berdasarkan props:
>    - Hook
>    - Main explanation
>    - Supporting visual
>    - Punchline / closing
>
> 5. Gunakan `useCurrentFrame`, `useVideoConfig`, `interpolate`, dan `spring` sesuai kebutuhan.
>
> 6. Sinkronisasi subtitle menggunakan timestamp scene yang sudah disiapkan backend. Jika timing belum tersedia, sediakan fallback yang jelas; jangan mengklaim subtitle word-by-word sinkron hanya berdasarkan pembagian paragraf.
>
> 7. Buat variasi visual yang bisa dikonfigurasi:
>    - Background dan accent color
>    - Typography
>    - Shape animation
>    - Icons / SVG
>    - Charts atau angka jika relevan
>    - Character mascot sederhana jika dibutuhkan
>
> 8. Pastikan teks tidak keluar dari safe area, tidak terpotong, dan tetap terbaca di layar ponsel.
>
> 9. Durasi komposisi harus mengikuti durasi audio yang telah dihitung backend, ditambah atau disesuaikan dengan kebutuhan closing.
>
> 10. Buat satu template awal yang reusable untuk OtakReceh. Jangan membuat semua template channel sekaligus.
>
> 11. Sertakan instruksi menjalankan preview dan render melalui CLI.
>
> 12. Jangan mengklaim kode siap produksi sebelum build dan render lokal berhasil diuji.

---

## 8. AUDIO DAN SINKRONISASI

### 8.1 Edge TTS

Contoh pemanggilan konseptual:

```powershell
edge-tts --voice id-ID-ArdiNeural --text "Contoh narasi." --write-media ".\jobs\otak-receh\001\audio.mp3"
```

Untuk implementasi backend:
- Gunakan `exec.CommandContext`.
- Pisahkan setiap argumen command.
- Hindari menyusun command shell dari input AI.
- Gunakan context timeout.
- Periksa exit code dan keberadaan file output.

Nama voice pada contoh adalah pilihan awal, bukan jaminan bahwa voice selalu tersedia. Periksa daftar voice pada environment yang digunakan.

### 8.2 Sinkronisasi subtitle

Tahap awal:
1. Generate narasi.
2. Generate audio.
3. Hitung durasi audio.
4. Pecah narasi menjadi segmen.
5. Siapkan timestamp segmen.
6. Render subtitle per segmen.

Tahap lanjutan:
- Gunakan alignment/transcription tool jika membutuhkan sinkronisasi per kata.
- Jangan menyamakan pembagian teks rata dengan sinkronisasi ucapan yang akurat.

---

## 9. TESTING LOCAL

Jangan langsung menjalankan batch produksi. Uji satu video sampai selesai.

### 9.1 Backend

Dari folder `backend-go`:

```powershell
go test ./...
go run ./cmd/factory
```

Sesuaikan command run dengan entry point yang benar-benar dibuat.

### 9.2 Remotion preview

Dari folder `frontend-remotion`:

```powershell
npm run dev
```

Gunakan script yang tersedia di `package.json` hasil instalasi. Jika nama script berbeda, ikuti script yang tercantum di file tersebut.

### 9.3 Render satu video

Uji render melalui Remotion CLI dengan:
- entry point yang benar;
- composition ID yang benar;
- input props JSON;
- output MP4 ke folder job/output yang unik.

Jangan menganggap preview browser otomatis berubah ketika backend menulis JSON. Pastikan props terbaru benar-benar diberikan ke proses render.

### 9.4 Checklist hasil

- [ ] Backend berhasil memanggil LLM.
- [ ] JSON dapat diparse dan lolos validasi.
- [ ] Naskah sesuai bahasa dan identitas channel.
- [ ] Audio berhasil dibuat.
- [ ] Durasi audio berhasil diketahui.
- [ ] Props dapat dibaca Remotion.
- [ ] Subtitle tidak terlalu cepat atau lambat.
- [ ] Tidak ada teks yang terpotong.
- [ ] Audio tidak terpotong.
- [ ] Video MP4 berhasil diputar.
- [ ] Klaim faktual dan keagamaan telah diperiksa.
- [ ] Output tersimpan pada folder channel yang benar.

---

## 10. ROADMAP IMPLEMENTASI

Kerjakan berurutan. Jangan melompat ke batch processing sebelum satu video berhasil dirender dengan benar.

### Fase 1 — Fondasi
- [ ] Periksa instalasi Go, Node.js, npm, dan Python.
- [ ] Buat struktur folder.
- [ ] Inisialisasi Go module.
- [ ] Inisialisasi Remotion.
- [ ] Install Edge TTS.
- [ ] Buat konfigurasi environment.

**Output:** Workspace dapat dijalankan.

### Fase 2 — Satu video end-to-end
- [ ] Backend membaca konfigurasi OtakReceh.
- [ ] Backend meminta satu naskah ke LLM.
- [ ] Backend memvalidasi JSON.
- [ ] Backend menghasilkan satu audio.
- [ ] Backend membuat render props.
- [ ] Remotion merender satu MP4.

**Output:** Satu video selesai dari input topik sampai MP4.

### Fase 3 — Kualitas visual dan audio
- [ ] Perbaiki hook dan struktur storytelling.
- [ ] Buat subtitle yang nyaman dibaca.
- [ ] Tambahkan motion graphics.
- [ ] Atur level audio dan sound effects.
- [ ] Uji beberapa variasi naskah.

**Output:** Template video yang layak dipublikasikan.

### Fase 4 — Multi-channel
- [ ] Tambahkan konfigurasi Santri AI.
- [ ] Tambahkan aturan editorial dan verifikasi materi Islam.
- [ ] Tambahkan konfigurasi OddlyKnown.
- [ ] Pisahkan voice, prompt, tema, dan output setiap channel.
- [ ] Uji satu video per channel.

**Output:** Satu engine dapat menghasilkan video untuk beberapa channel.

### Fase 5 — Batch production
- [ ] Generate daftar topik.
- [ ] Buat antrean job.
- [ ] Tambahkan retry dan pencatatan status.
- [ ] Batasi concurrency agar CPU/RAM tidak kewalahan.
- [ ] Tambahkan quality-control sebelum publikasi.
- [ ] Pantau biaya, durasi render, dan tingkat kegagalan.

**Output:** Produksi batch yang terukur dan dapat dipantau.

---

## 11. BATASAN DAN CATATAN PENTING

1. **Remotion bukan AI video generator.** Remotion merender komposisi React menjadi video. Animasi 2D berbasis kode sangat sesuai; animasi 3D sinematik membutuhkan teknologi dan aset tambahan.
2. **Edge TTS bukan jaminan suara komersial tanpa batas.** Periksa ketentuan layanan dan penggunaan yang berlaku sebelum monetisasi.
3. **AGYBridge harus diuji kompatibilitasnya.** Pastikan Base URL, autentikasi, model, dan format respons sesuai dengan library yang dipakai.
4. **Jangan menyimpan secret di Git.** Masukkan `.env`, token, dan credential ke `.gitignore`.
5. **AI dapat menghasilkan informasi keliru.** Konten sains, keuangan, akuntansi, dan agama memerlukan pemeriksaan yang sesuai.
6. **Produksi massal bukan jaminan monetisasi.** Hindari video repetitif dengan variasi dangkal. Setiap video harus memberi nilai dan pengalaman yang cukup berbeda.
7. **Mulai dari satu channel.** Multi-channel adalah kemampuan arsitektur yang disiapkan, bukan alasan untuk mengerjakan tiga channel sekaligus.

---

## 12. DEFINISI SELESAI (DEFINITION OF DONE)

Sistem tahap pertama dinyatakan berhasil jika:

- Satu topik dapat dikirim ke backend.
- Backend menghasilkan script JSON valid.
- Audio berhasil dihasilkan.
- Props dan aset diterima Remotion.
- Remotion menghasilkan MP4 1080x1920, 30fps.
- Subtitle dan audio cukup sinkron untuk ditonton.
- Output tersimpan pada direktori job yang benar.
- Error pada setiap tahap tercatat dan dapat ditelusuri.
- Video dapat diperiksa sebelum dipublikasikan.

**Prioritas sekarang: selesaikan satu video OtakReceh dari awal sampai akhir. Jangan menambah channel, concurrency, atau target 10–30 video per hari sebelum alur dasar ini stabil.**
