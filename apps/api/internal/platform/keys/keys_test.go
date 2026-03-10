package keys_test

import (
	"strings"
	"testing"

	"github.com/alexedwards/argon2id"
	"github.com/retainr/api/internal/platform/keys"
)

func TestGenerate(t *testing.T) {
	raw, hash, prefix, err := keys.Generate()
	if err != nil {
		t.Fatalf("Generate() error: %v", err)
	}
	if !strings.HasPrefix(raw, "rec_live_") {
		t.Errorf("expected rec_live_ prefix, got: %s", raw[:min(20, len(raw))])
	}
	if prefix != raw[:12] {
		t.Errorf("prefix mismatch: %q != %q", prefix, raw[:12])
	}
	match, err := argon2id.ComparePasswordAndHash(raw, hash)
	if err != nil || !match {
		t.Errorf("hash verification failed: err=%v match=%v", err, match)
	}
}

func TestGenerate_Unique(t *testing.T) {
	seen := map[string]bool{}
	for i := 0; i < 10; i++ {
		raw, _, _, err := keys.Generate()
		if err != nil {
			t.Fatal(err)
		}
		if seen[raw] {
			t.Errorf("duplicate key generated: %s", raw)
		}
		seen[raw] = true
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
