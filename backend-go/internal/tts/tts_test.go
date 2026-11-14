package tts

import (
	"math"
	"testing"
	"video-factory/internal/script"
)

func TestAlignSceneTimings(t *testing.T) {
	scenes := []script.Scene{
		{Index: 1, Text: "Short"},
		{Index: 2, Text: "This is a much longer second scene text"},
	}

	totalDuration := 10.0
	aligned := AlignSceneTimings(scenes, totalDuration)

	if len(aligned) != 2 {
		t.Fatalf("expected 2 scenes, got %d", len(aligned))
	}
	if aligned[0].StartSeconds != 0.0 {
		t.Errorf("expected scene 0 start to be 0.0, got %f", aligned[0].StartSeconds)
	}
	if aligned[1].EndSeconds != 10.0 {
		t.Errorf("expected scene 1 end to be 10.0, got %f", aligned[1].EndSeconds)
	}
	if aligned[0].EndSeconds != aligned[1].StartSeconds {
		t.Errorf("expected scene 0 end to match scene 1 start, got %f and %f", aligned[0].EndSeconds, aligned[1].StartSeconds)
	}
	if math.Abs((aligned[0].EndSeconds-aligned[0].StartSeconds)-(aligned[1].EndSeconds-aligned[1].StartSeconds)) < 1.0 {
		t.Errorf("expected scene 2 to be noticeably longer than scene 1")
	}
}
