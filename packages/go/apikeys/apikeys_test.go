package apikeys_test

import (
	"strings"
	"testing"

	"github.com/retainr/platform/apikeys"
)

func TestGenerate(t *testing.T) {
	raw, hash, prefix, err := apikeys.Generate()
	if err != nil {
		t.Fatalf("Generate() error: %v", err)
	}
	if !strings.HasPrefix(raw, "rec_live_") {
		t.Errorf("expected rec_live_ prefix, got: %s", raw[:min(20, len(raw))])
	}
	if prefix != raw[:12] {
		t.Errorf("prefix mismatch: %q != %q", prefix, raw[:12])
	}
	ok, err := apikeys.Verify(raw, hash)
	if err != nil || !ok {
		t.Errorf("Verify failed: err=%v ok=%v", err, ok)
	}
}

func TestGenerate_Unique(t *testing.T) {
	seen := map[string]bool{}
	for i := 0; i < 10; i++ {
		raw, _, _, err := apikeys.Generate()
		if err != nil {
			t.Fatal(err)
		}
		if seen[raw] {
			t.Errorf("duplicate key: %s", raw)
		}
		seen[raw] = true
	}
}
