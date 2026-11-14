package job

import (
	"testing"
)

func TestJobManager_Lifecycle(t *testing.T) {
	jm := NewJobManager()

	j := jm.CreateJob("otak-receh", "Otak Receh", "Test Topic", "/tmp/job1")
	if j == nil {
		t.Fatal("Expected job to be created, got nil")
	}

	if j.Phase != PhasePending {
		t.Errorf("Expected phase PENDING, got %s", j.Phase)
	}

	jm.UpdatePhase(j.ID, PhaseWritingScript, 20, "Writing script...")
	updated, ok := jm.GetJob(j.ID)
	if !ok || updated.Phase != PhaseWritingScript || updated.Progress != 20 {
		t.Errorf("Failed to update phase or progress properly")
	}

	jm.MarkComplete(j.ID, "/output/video.mp4", "/api/videos/otak-receh/video.mp4", 1024*1024*10)
	completed, ok := jm.GetJob(j.ID)
	if !ok || completed.Phase != PhaseCompleted || completed.Progress != 100 {
		t.Errorf("Failed to mark job completed properly")
	}
}
