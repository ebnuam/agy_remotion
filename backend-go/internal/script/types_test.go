package script

import "testing"

func TestValidateScript_Valid(t *testing.T) {
	s := &ScriptData{
		Title:      "Test Title",
		Hook:       "Test Hook",
		Narration:  "Test Narration",
		Punchline:  "Test Punchline",
		ThemeColor: "#ffffff",
		Scenes: []Scene{
			{Index: 1, Text: "Scene 1", Visual: "v1"},
		},
	}
	if err := ValidateScript(s); err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
}

func TestValidateScript_EmptyTitle(t *testing.T) {
	s := &ScriptData{
		Title:      "",
		Hook:       "Test Hook",
		Narration:  "Test Narration",
		Punchline:  "Test Punchline",
		Scenes: []Scene{
			{Index: 1, Text: "Scene 1"},
		},
	}
	if err := ValidateScript(s); err == nil {
		t.Fatalf("expected error for empty title, got nil")
	}
}
