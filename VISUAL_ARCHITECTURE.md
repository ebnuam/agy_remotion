# ARCHITECTURAL SPECIFICATION: 2D CARTOON STORYTELLING VIDEO FACTORY
**Document Version:** 2.0.0  
**Status:** DRAFT / PENDING REVIEW (Tahap 1 Audit & Redesign)  
**Author:** Software Architect, Golang Engineer, React/Remotion Engineer, and 2D Animation Technical Director  
**Workspace:** `C:\Users\USER\Documents\REMOTION`

---

## 1. PENDAHULUAN & TUJUAN RE-ARSITEKTUR

Sistem *Automated Video Generator* saat ini telah berhasil membangun fondasi orkestrasi Golang, integrasi LLM via AGYBridge, sintesis suara via Edge TTS (Python), dan render video vertikal via Remotion. Namun, hasil visual saat ini masih berkarakteristik **"PowerPoint / Motion Graphic Slideshow"**:
- Elemen visual terkurung di dalam kotak/kartu *rounded rectangle* di tengah layar.
- Judul permanen statis di bagian atas layar layaknya judul slide.
- Subtitle masif di dalam kotak gelap tebal di bagian bawah layar yang menyita 30–40% area visual.
- Latar belakang hanya berupa gradien abstrak dan garis grid, bukan lingkungan tempat cerita berlangsung.
- Karakter tidak terintegrasi ke dalam dunia adegan (hanya klip animasi Lottie generik yang di-loop di dalam kartu tengah).
- Tidak ada pergantian *camera shot* (wide, medium, close-up, panning, camera shake).
- Tidak ada kontinuitas karakter yang dapat disesuaikan secara granular per bagian tubuh (kepala, ekspresi wajah, tangan, tubuh, properti).

**Tujuan Redesain:**  
Mengubah paradigma visual secara fundamental menjadi **2D Cartoon Storytelling Full-Frame**:
1. Lingkungan kartun penuh (*full-frame cartoon environment*) beresolusi 1080×1920 (9:16).
2. Karakter konsisten sepanjang video dengan sistem *rigging* parametrik (bukan gambar acak yang berganti-ganti).
3. Aksi karakter ekspresif (animasi bernapas, kedipan mata, gerakan tangan memegang properti, pergantian ekspresi wajah dari bosan, santai, terkejut, hingga panik).
4. Sinematografi dinamis (*shot variation*: Wide Shot, Medium Shot, Close-Up, Extreme Close-Up, Camera Shake).
5. Subtitle modern non-intrusif yang tidak menutupi aksi karakter.
6. Hasil akhir terasa seperti serial animasi kartun pendek komedi/edukasi yang hidup dan menarik bagi audiens.

---

## 2. PERBANDINGAN ARSITEKTUR: SEKARANG VS TARGET

| Aspek | Arsitektur Saat Ini (PowerPoint / Slideshow) | Target Arsitektur Baru (2D Cartoon Storytelling) |
|---|---|---|
| **Komposisi Layar** | Layar dibagi 3 zona kaku: Top (Header Badge), Center (Card Lottie), Bottom (Subtitle Box). | **Full-Frame Cinematic Scene**: Latar belakang memenuhi seluruh 1080×1920. Karakter dan properti hidup di dalam ruangan. |
| **Latar Belakang** | Gradien radial abstrak berputar dengan overlay grid geometris. | **Illustrated Environment / Background**: Kamar tidur, meja kerja, kantor, dsb., dengan kedalaman (depth: background, midground, foreground). |
| **Karakter** | Klip Lottie Bodymovin utuh di dalam kotak, tidak dapat dipecah. | **Hierarchical 2D Rigged Character**: Terdiri atas layer terpisah (Head, Hair, Eyes, Mouth, Torso, Arms, Hands, Legs) yang dapat digerakkan secara independen via transforms. |
| **Konsistensi Karakter** | Bergantung pada ketersediaan file Lottie eksternal acak. | **Character Bible & Model Sheet**: Parameter warna HEX, bentuk rambut, pakaian, dan proporsi tubuh dikunci per video. |
| **Animasi Karakter** | Loop animasi generik bawaan file Lottie. | **Procedural 2D Action Engine**: Idle breathing, natural eye blinking, pose controller (duduk di meja, memegang ponsel, rebahan di kasur, mengetik panik), dan pergantian ekspresi wajah instan. |
| **Pergerakan Kamera** | Statis total (fixed 1.0x). | **Dynamic Virtual Camera Rig**: Interpolasi scale dan translation untuk Wide Shot, Medium Shot, Close-up emosional, Pan, dan Shake saat momen komedi/panik. |
| **Tipografi & Subtitle** | Kotak gelap solid besar ber-border tebal di area bawah. | **Cartoon Punchy Subtitles**: Tipografi tebal sans-serif/rounded ber-outline & drop-shadow kontras tinggi, diletakkan dinamis di lower third tanpa menutupi karakter. |
| **Header / Judul** | Pill badge permanen di bagian atas layar sepanjang video. | **Title Card / Hook Overlay Dinamis**: Hanya muncul 2-3 detik pertama sebagai identitas adegan, lalu menghilang agar layar 100% fokus pada animasi. |
| **Struktur Data** | `ScriptData` sederhana (text, narration, visual string). | **Production Storyboard JSON**: Memuat shot type, camera movement, location, character action, expression, pose, props, audio timing. |

---

## 3. PIPELINE PRODUKSI 10 TAHAP

```text
1. SCRIPT GENERATION (AGYBridge LLM)
   ├── Input : Channel Config, Topic
   └── Output: Title, Hook, Narration, Punchline, Scene Breakdown
           │
           ▼
2. CHARACTER BIBLE GENERATION
   ├── Input : Topic & Channel Persona
   └── Output: Character Model Sheet (Palette HEX, Hair, Face, Outfit, Proportions)
           │
           ▼
3. STORYBOARD GENERATION (AGYBridge Animation Director)
   ├── Input : Script + Character Bible
   └── Output: Scene[] (Shot, Camera Move, Environment, Actions, Expressions, Props, Timing)
           │
           ▼
4. VISUAL ASSET MANAGEMENT (AssetProvider Interface)
   ├── Input : Environment ID, Rig Parts, Props
   └── Output: Vector SVGs & Transparent PNG Layers
           │
           ▼
5. ASSET PREPARATION & STAGING
   ├── Input : Raw Assets + Job Directory
   └── Output: Staged & Validated Assets in Remotion Public Workspace
           │
           ▼
6. AUDIO & TIMELINE SYNCHRONIZATION
   ├── Input : Narration Text
   └── Output: Narration MP3 + Mutagen Duration Alignment per Scene (Seconds & Frames)
           │
           ▼
7. 2D CHARACTER RIGGING & ACTION ENGINE (Remotion / React)
   ├── Input : Rig Layers + Character Bible + Action & Expression State
   └── Output: Procedural Rig Component (Breathing, Blinking, Gestures, Poses)
           │
           ▼
8. SCENE COMPOSITION & CAMERA RIG (Remotion)
   ├── Input : Background + Rigged Character + Props + Dynamic Subtitle
   └── Output: Full-Frame 1080x1920 30FPS Composition with Virtual Camera Transforms
           │
           ▼
9. REMOTION VIDEO RENDERING
   ├── Input : RenderProps JSON + Bundled Composition
   └── Output: High-Quality MP4 Video Output
           │
           ▼
10. AUTOMATED QUALITY CONTROL (QC)
    ├── Input : MP4 Metadata, Frame Integrity, Asset Checklist
    └── Output: QC Validation Report (Pass / Reject / Revise)
```

---

## 4. SPESIFIKASI SKEMA DATA JSON

### 4.1 Character Bible (`character_bible`)
```json
{
  "character_id": "char_budi_01",
  "name": "Budi",
  "archetype": "young_procrastinator",
  "palette": {
    "skin": "#FFDCB2",
    "hair": "#2C1810",
    "eyes": "#1A1A1A",
    "shirt": "#FF7A00",
    "pants": "#1E293B",
    "shoes": "#FFFFFF",
    "accent": "#F59E0B"
  },
  "proportions": {
    "head_scale": 1.15,
    "body_height": 550,
    "eye_size": "medium_cartoon"
  },
  "base_rig": "human_male_casual_v1"
}
```

### 4.2 Storyboard Scene (`scenes[]`)
```json
{
  "scene_id": 1,
  "start_seconds": 0.0,
  "end_seconds": 6.88,
  "narrative": {
    "text": "Deadline tinggal dua jam, tapi jempolmu kok masih asyik mantau reels kucing sampai part 99?",
    "audio_segment": "narration_part_1.mp3"
  },
  "camera": {
    "shot_type": "MEDIUM_SHOT",
    "movement": "SLOW_ZOOM_IN",
    "focus_target": "character_desk",
    "zoom_start": 1.0,
    "zoom_end": 1.15
  },
  "environment": {
    "location": "bedroom_desk",
    "lighting": "night_desk_lamp",
    "background_id": "bg_bedroom_night"
  },
  "character": {
    "pose": "sitting_at_desk",
    "action": "scrolling_phone",
    "expression": "mesmerized_bored",
    "facing": "three_quarters_right",
    "head_angle_deg": 15
  },
  "props": [
    {
      "prop_id": "laptop_open",
      "position": "on_desk",
      "state": "screen_active"
    },
    {
      "prop_id": "smartphone",
      "position": "held_right_hand",
      "state": "screen_glow"
    }
  ],
  "transition": "CUT"
}
```

---

## 5. 2D RIGGING & ANIMATION TECHNICAL SPECIFICATION

### 5.1 Arsitektur Hierarki Karakter
Karakter tidak lagi berupa satu gambar flat, melainkan hierarki komponen React/SVG:
```text
<CharacterRoot transform={position, scale}>
  ├── <Shadow />
  ├── <LegsLayer pose={pose}> (leftLeg, rightLeg, shoes)
  ├── <TorsoLayer breathingOffset={sin(frame)}> (torso, shirt, collar)
  ├── <ArmsBehind /> (armLeft, handLeft)
  ├── <HeadLayer tilt={headAngle}>
  │     ├── <HeadBase skinColor={skin} />
  │     ├── <HairBase hairColor={hair} style={hairStyle} />
  │     ├── <Eyebrows expression={expression} />
  │     ├── <Eyes expression={expression} blinkFrame={isBlinking} />
  │     ├── <Nose />
  │     ├── <Mouth expression={expression} talkSync={isSpeaking} />
  │     └── <FacialFX sweatDrop={isPanicking} questionMark={isConfused} />
  ├── <ArmsFront /> (armRight, handRight holding prop)
  └── <ForegroundProps /> (smartphone / keyboard)
</CharacterRoot>
```

### 5.2 Rumus Animasi Prosedural (Deterministik Frame-by-Frame)
Remotion mensyaratkan semua animasi bersifat deterministik murni berbasis `frame`.

1. **Idle Breathing (Napas Hidup):**
   ```ts
   const breathCycle = Math.sin((frame / fps) * Math.PI * 1.5);
   const torsoScaleY = 1 + breathCycle * 0.015;
   const headTranslateY = breathCycle * 2.5; // pixel
   ```

2. **Natural Eye Blinking:**
   Kedipan mata terjadi setiap 75 frame (~2,5 detik) selama 4 frame:
   ```ts
   const blinkCycle = frame % 75;
   const isBlinking = blinkCycle >= 0 && blinkCycle <= 4;
   ```

3. **Gerakan Tangan Mengetik Panik (`panic_typing`):**
   ```ts
   const leftHandY = Math.sin(frame * 0.8) * 8;
   const rightHandY = Math.cos(frame * 0.8) * 8;
   const bodyShake = isPanicking ? (Math.random() - 0.5) * 4 : 0;
   ```

4. **Gerakan Memegang Ponsel & Scroll (`scrolling_phone`):**
   Tangan kanan memegang ponsel di depan dada, jempol melakukan gerakan rotasi berulang (swipe up):
   ```ts
   const thumbRotation = interpolate((frame % 20), [0, 10, 20], [0, -25, 0]);
   ```

5. **Ekspresi Wajah Dinamis:**
   - `bored`: Alis datar, kelopak mata setengah turun (pupil lesu), mulut garis datar miring.
   - `relaxed`: Senyum tipis, mata santai melengkung.
   - `shocked`: Mata membelalak besar (scale 1.3), pupil mengecil, mulut terbuka huruf "O", tetesan keringat muncul di dahi.
   - `panic`: Alis miring ke atas-dalam (distressed), mata bergetar, mulut terbuka lebar ekspresi histeris.

---

## 6. SINEMATOGRAFI & VIRTUAL CAMERA RIG

Komposisi vertikal (1080×1920) ditampung dalam sebuah container `<VirtualCamera>`:
```tsx
<VirtualCamera shotType={scene.camera.shot_type} movement={scene.camera.movement}>
  <EnvironmentLayer />
  <MidgroundProps />
  <CharacterRig />
  <ForegroundLayer />
</VirtualCamera>
```

### Shot Variations:
1. **Wide Shot (1.0x):** Memperlihatkan seluruh ruangan kamar (meja kerja, kasur, poster dinding, jam dinding). Digunakan untuk menetapkan konteks lokasi.
2. **Medium Shot (1.35x):** Terpusat dari pinggang ke atas karakter yang sedang duduk di meja kerja. Digunakan saat karakter mulai mengeluh atau membuka ponsel.
3. **Close-Up (1.8x – 2.0x):** Terpusat pada kepala dan ekspresi wajah karakter. Digunakan saat reaksi kaget, melihat jam, atau menyadari deadline.
4. **Extreme Close-Up (2.5x):** Terpusat pada layar ponsel/jam dinding atau mata yang membelalak.
5. **Camera Shake (Screen Shake):**
   ```ts
   const shakeX = isPanic ? Math.sin(frame * 1.5) * 12 : 0;
   const shakeY = isPanic ? Math.cos(frame * 1.7) * 8 : 0;
   ```

---

## 7. TIPOGRAFI & SUBTITLE DINAMIS

- **Masalah Lama:** Subtitle ditaruh di dalam container hitam masif 960px dengan border tebal dan padding 44px, memblokir hampir sepertiga bawah layar.
- **Arsitektur Baru:**
  - Menggunakan font bergaya kartun modern tebal (e.g. *Inter Black / Montserrat ExtraBold / Poppins Bold*).
  - Teks diberi efek **Text Stroke Kontras** (`-webkit-text-stroke: 8px #0A0F1D`) dan **Drop Shadow pekat** (`0 8px 24px rgba(0,0,0,0.8)`), sehingga terbaca jelas di atas warna latar apa pun tanpa memerlukan kotak latar belakang yang pekat dan besar.
  - Penempatan di zona aman lower-third (bottom: 160px), fleksibel, dan kata-kata penting dapat diberi highlight warna tema channel (`theme_color`).

---

## 8. STRATEGI KONSISTENSI KARAKTER & ABSTRAKSI ASET

### 8.1 Kenapa Bukan Menggunakan AI Image Gen Acak Per Scene?
Jika setiap scene memanggil AI Image Gen (DALL-E, Midjourney, Stable Diffusion tanpa ControlNet) untuk menggambar karakter secara utuh, maka:
1. Wajah, gaya rambut, dan warna pakaian akan berganti-ganti di setiap scene (halusinasi AI).
2. Karakter tidak bisa dianimasikan secara granular (tangan tidak bisa mengetik atau memegang ponsel secara terpisah).
3. Biaya API mahal dan waktu render lambat (latensi puluhan detik per frame/gambar).

### 8.2 Solusi Konsistensi: Parametric Layered Vector Rig
1. **Character Model Sheet**: Golang mendefinisikan `CharacterBible` sekali di awal job pembuatan video.
2. **Layered Vector Kit**: Pustaka komponen SVG terpisah yang diwarnai secara dinamis menggunakan nilai HEX dari `CharacterBible.palette`.
3. **Abstraksi `AssetProvider` di Golang**:
   ```go
   type AssetProvider interface {
       GetCharacterRig(ctx context.Context, bible *CharacterBible) (*RigAssets, error)
       GetEnvironment(ctx context.Context, envID string) (*EnvironmentAsset, error)
       GetProp(ctx context.Context, propID string) (*PropAsset, error)
   }
   ```
   - **Implementasi Awal (Fase 1-3):** `LocalVectorAssetProvider` menggunakan aset SVG/vector rigging lokal berkualitas tinggi yang parametrik dan bebas biaya lisensi/API.
   - **Implementasi Lanjutan (Fase Mendatang):** `GenerativeAssetProvider` dapat ditambahkan jika pengguna ingin mengintegrasikan ControlNet/IP-Adapter untuk menghasilkan background khusus via API.

---

## 9. MATRIKS QUALITY CONTROL (QC)

Setiap video hasil render harus divalidasi oleh modul QC otomatis sebelum dinyatakan selesai:
1. **Full-Frame Integrity:** Tidak ada warna hitam kosong atau aset gambar yang hilang (*broken image icon*).
2. **Character Continuity:** Karakter mempertahankan palet warna dan bentuk yang sama dari scene 1 hingga akhir.
3. **Character Prominence:** Karakter menempati setidaknya 40–60% dari tinggi viewport pada Medium Shot.
4. **Motion Verification:** Aksi karakter memiliki frame transform dinamis (bukan statis).
5. **Camera Movement:** Minimal terdapat 2 variasi shot (misal Wide ➔ Medium ➔ Close-Up) dalam satu video.
6. **Audio-Video Sync:** Durasi video pas dengan durasi audio narasi Edge TTS (toleransi maksimal ±0,5 detik).
7. **Subtitle Legibility:** Subtitle berada di zona aman (*safe area*) vertikal dan tidak menutupi wajah karakter.

---

## 10. RENCANA MIGRASI BERTAHAP

Untuk menjaga agar sistem yang sudah berjalan tidak rusak (*zero regression*), migrasi dilakukan secara bertahap:
- **Tahap 1 (Saat Ini):** Audit & Penyusunan Dokumen Arsitektur Visual (`VISUAL_ARCHITECTURE.md`). **[SELESAI]**
- **Tahap 2 (Berikutnya - Menunggu Persetujuan):** Pembuatan **Prototype Visual Remotion** (10–15 detik) untuk mendemonstrasikan adegan:
  *"Anak muda duduk di meja laptop, bosan, mengambil ponsel dan rebahan, lalu melihat jam dinding dan panik kembali mengetik."*
- **Tahap 3:** Integrasi Storyboard JSON & Character Bible ke backend Golang.
- **Tahap 4:** Pembuatan abstraksi `AssetProvider` dan staging aset.
- **Tahap 5:** End-to-end integration (Golang ➔ AGYBridge Storyboard ➔ TTS ➔ 2D Cartoon Remotion ➔ MP4).
- **Tahap 6:** Quality Review & Produksi.
