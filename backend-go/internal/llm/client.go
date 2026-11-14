package llm

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"video-factory/internal/channel"
	"video-factory/internal/config"
	"video-factory/internal/script"

	openai "github.com/sashabaranov/go-openai"
)

type LLMClient struct {
	client *openai.Client
	model  string
}

func NewLLMClient(cfg *config.Config) *LLMClient {
	clientConfig := openai.DefaultConfig(cfg.LLMAPIKey)
	clientConfig.BaseURL = cfg.LLMBaseURL

	return &LLMClient{
		client: openai.NewClientWithConfig(clientConfig),
		model:  cfg.LLMModel,
	}
}

// GenerateScript prompts AGYBridge to produce a structured video script tailored to the channel's visual identity
func (l *LLMClient) GenerateScript(ctx context.Context, ch *channel.ChannelConfig, topic string) (*script.ScriptData, error) {
	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	styleGuide := "Cinematic 2D Motion Graphics"
	themeColor := "#FF7A00"
	if ch.VisualIdentity != nil {
		if st := ch.VisualIdentity.Style; st != "" {
			styleGuide = st
		}
		if pal := ch.VisualIdentity.Palette; pal != nil && pal["primary"] != "" {
			themeColor = pal["primary"]
		}
	}

	systemPrompt := fmt.Sprintf(`Kamu adalah Visual Director & Scriptwriter kelas dunia untuk video vertikal viral (Shorts / Reels / TikTok).
Channel ID: %s
Channel Name: %s
Language: %s
Niche: %s
Tone: %s
Visual Style Identity: %s
Duration Target: %d detik

PANDUAN VISUAL STORYTELLING & MOTION BEATS:
Video ini BUKAN slideshow membosankan. Video harus memiliki ritme cepat (pacing dinamis), visual yang berganti setiap 3-5 detik, dan sinkronisasi audio-visual sempurna!
- OtakReceh: Humor sehari-hari, ekspresif, metafora visual komikal (uang melayang, dompet kempes, kopi saset vs kafe, checkout e-commerce, alarm panik, otak dopamin, timbangan vs).
- Santri AI: Kisah & sains sejarah Islam, berbobot, elegan, manuskrip emas berornamen, jam gajah Al-Jazari, crankshaft mesin air, astrolabe astronomi, lentera Qandil, kaligrafi.
- Oddly Known: Fakta mencengangkan, misteri, telemetry HUD, kartu polaroid tersangka (seperti berkas kriminal), sonar radar, spektrum frekuensi, blueprint ilmiah.

ATURAN STRUKTUR BEAT (SANGAT PENTING):
1. Buat antara 8 hingga 12 ADEGAN/BEAT CEPAT (masing-masing 3 hingga 5 detik). Jangan buat sedikit adegan berdurasi panjang karena akan terasa lambat dan monoton!
2. Setiap adegan memiliki narasi 'text' yang SINGKAT, PADAT, dan BERBOBOT (maksimal 12-18 kata per adegan).
3. 'narration' utama adalah gabungan persis dari seluruh kalimat 'text' setiap adegan.
4. Di setiap adegan, variasikan 'visual_cue' dan komposisi 2.5D:
   - 'environment_asset': Latar tempat spesifik (e.g. "parkiran_malam.svg", "kamar_kos.jpg", "kafe_estetik.png", "lab_sonar.jpg", "baghdad_1206.png").
   - 'actor_asset': Objek/karakter fokus (e.g. "mobil_putih.svg", "dompet_kosong.png", "cangkir_kopi.png", "polaroid_tersangka.png", "stickman_panik.png").
   - 'visual_cue': Kata kunci visual spesifik (pilih dari: sultan_money, dompet_kempes, kopi_kafe, checkout_belanja, alarm_panik, kalender_deadline, jam_gajah, crankshaft_mesin, astrolabe_bintang, radar_sonar, polaroid_tersangka, timbangan_vs, grafik_naik, spectrogram).
   - 'camera_shot': Berganti-ganti di setiap adegan (pilih dari: "zoom_punch", "pan_left", "pan_right", "tracking", "dramatic_pull", "shake_punch").
   - 'headline_line1' & 'headline_line2': Teks judul tebal kapital yang menarik perhatian dalam 1 detik.
5. Kembalikan HANYA format JSON valid tanpa backtick markdown codeblock.

FORMAT JSON:
{
  "title": "Judul Menarik Singkat",
  "hook": "Kalimat pembuka hook 3 detik pertama",
  "narration": "Gabungan lengkap teks narasi seluruh adegan",
  "punchline": "Kalimat penutup punchline / pesan inti yang berkesan",
  "theme_color": "%s",
  "scenes": [
    {
      "index": 1,
      "text": "Kalimat narasi singkat adegan 1 (10-15 kata).",
      "tag": "KASUS #1 / FAKTA #1 / TAHUKAH KAMU",
      "headline_line1": "HEADLINE BARIS 1 TEBAL KAPITAL",
      "headline_line2": "HEADLINE BARIS 2 WARNA AKSEN",
      "environment_asset": "nama_latar.png",
      "actor_asset": "nama_objek.png",
      "visual_cue": "kata_kunci_visual_spesifik",
      "visual": "Deskripsi komposisi visual",
      "objects": ["objek_1", "objek_2"],
      "camera_shot": "zoom_punch",
      "sound_cue": "whoosh"
    }
  ],
  "sources": []
}`, ch.ID, ch.DisplayName, ch.Language, ch.Niche, ch.Tone, styleGuide, ch.DurationTargetSeconds, themeColor)

	if len(ch.EditorialRules) > 0 {
		systemPrompt += "\nAturan Khusus:\n- " + strings.Join(ch.EditorialRules, "\n- ")
	}

	userPrompt := fmt.Sprintf("Topik: %s\nBuat naskah dan sutradarai animasi visual kartun sesuai format JSON.", topic)

	req := openai.ChatCompletionRequest{
		Model: l.model,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: systemPrompt,
			},
			{
				Role:    openai.ChatMessageRoleUser,
				Content: userPrompt,
			},
		},
		Temperature: 0.7,
	}

	resp, err := l.client.CreateChatCompletion(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("AGYBridge request failed: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("empty response received from AGYBridge")
	}

	rawContent := strings.TrimSpace(resp.Choices[0].Message.Content)

	// Clean markdown code blocks if the model wrapped output in ```json ... ```
	cleaned := rawContent
	if strings.HasPrefix(cleaned, "```") {
		lines := strings.Split(cleaned, "\n")
		if len(lines) >= 2 {
			lines = lines[1:]
			if len(lines) > 0 && strings.HasPrefix(strings.TrimSpace(lines[len(lines)-1]), "```") {
				lines = lines[:len(lines)-1]
			}
			cleaned = strings.TrimSpace(strings.Join(lines, "\n"))
		}
	}

	var scriptData script.ScriptData
	if err := json.Unmarshal([]byte(cleaned), &scriptData); err != nil {
		return nil, fmt.Errorf("failed to parse AI JSON response: %w\nRaw content: %s", err, rawContent)
	}

	scriptData.ChannelID = ch.ID
	scriptData.Topic = topic

	if err := script.ValidateScript(&scriptData); err != nil {
		return nil, fmt.Errorf("script validation failed: %w", err)
	}

	return &scriptData, nil
}
