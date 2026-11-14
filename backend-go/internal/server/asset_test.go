package server

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"video-factory/internal/config"
)

func TestAssetEndpoints(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "video_factory_assets_test_*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	s := &Server{
		cfg: &config.Config{
			RemotionProjectDir: tempDir,
		},
	}

	// 1. Test Upload Valid SVG
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	part, err := writer.CreateFormFile("file", "test car space.svg")
	if err != nil {
		t.Fatalf("Failed to create form file: %v", err)
	}
	svgContent := `<svg width="100" height="100"><rect fill="red"/></svg>`
	_, _ = io.WriteString(part, svgContent)
	_ = writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/assets/upload", &buf)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	s.handleUploadAsset(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d: %s", resp.StatusCode, w.Body.String())
	}

	var uploadResp map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &uploadResp); err != nil {
		t.Fatalf("Failed to parse upload json: %v", err)
	}

	fn, ok := uploadResp["filename"].(string)
	if !ok || fn != "test_car_space.svg" {
		t.Fatalf("Expected sanitized filename 'test_car_space.svg', got '%v'", uploadResp["filename"])
	}

	savedPath := filepath.Join(tempDir, "public", "assets", "test_car_space.svg")
	if _, err := os.Stat(savedPath); err != nil {
		t.Fatalf("Saved asset file does not exist on disk: %v", err)
	}

	// 2. Test Invalid Extension Rejection
	var invalidBuf bytes.Buffer
	invalidWriter := multipart.NewWriter(&invalidBuf)
	invalidPart, _ := invalidWriter.CreateFormFile("file", "hack.exe")
	_, _ = io.WriteString(invalidPart, "binary data")
	_ = invalidWriter.Close()

	reqInvalid := httptest.NewRequest(http.MethodPost, "/api/assets/upload", &invalidBuf)
	reqInvalid.Header.Set("Content-Type", invalidWriter.FormDataContentType())
	wInvalid := httptest.NewRecorder()

	s.handleUploadAsset(wInvalid, reqInvalid)
	if wInvalid.Result().StatusCode != http.StatusBadRequest {
		t.Fatalf("Expected status 400 for invalid extension, got %d", wInvalid.Result().StatusCode)
	}

	// 3. Test List Assets
	reqList := httptest.NewRequest(http.MethodGet, "/api/assets", nil)
	wList := httptest.NewRecorder()
	s.handleListAssets(wList, reqList)

	if wList.Result().StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200 from list, got %d", wList.Result().StatusCode)
	}

	var listResp map[string]interface{}
	if err := json.Unmarshal(wList.Body.Bytes(), &listResp); err != nil {
		t.Fatalf("Failed to parse list json: %v", err)
	}

	total, ok := listResp["total"].(float64)
	if !ok || total < 1 {
		t.Fatalf("Expected at least 1 asset in list, got: %v", listResp)
	}
}
