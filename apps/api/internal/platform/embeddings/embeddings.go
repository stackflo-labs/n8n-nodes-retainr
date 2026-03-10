package embeddings

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

// Embedder is the interface for generating vector embeddings.
// Abstracted so Voyage AI can be swapped without touching feature code.
type Embedder interface {
	Embed(ctx context.Context, text string) ([]float32, error)
}

// VoyageEmbedder calls the Voyage AI API (voyage-3-lite, 1536 dims).
type VoyageEmbedder struct {
	apiKey string
	client *http.Client
}

func NewVoyage(apiKey string) *VoyageEmbedder {
	return &VoyageEmbedder{
		apiKey: apiKey,
		client: &http.Client{},
	}
}

type voyageRequest struct {
	Input []string `json:"input"`
	Model string   `json:"model"`
}

type voyageResponse struct {
	Data []struct {
		Embedding []float32 `json:"embedding"`
	} `json:"data"`
}

func (v *VoyageEmbedder) Embed(ctx context.Context, text string) ([]float32, error) {
	body, _ := json.Marshal(voyageRequest{
		Input: []string{text},
		Model: "voyage-3-lite",
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://api.voyageai.com/v1/embeddings", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create voyage request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+v.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := v.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("voyage api call: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("voyage api returned status %d", resp.StatusCode)
	}

	var result voyageResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode voyage response: %w", err)
	}

	if len(result.Data) == 0 {
		return nil, fmt.Errorf("voyage api returned no embeddings")
	}

	return result.Data[0].Embedding, nil
}

// NoopEmbedder returns a zero vector. Used in tests to avoid external API calls.
type NoopEmbedder struct{}

func (n *NoopEmbedder) Embed(_ context.Context, _ string) ([]float32, error) {
	return make([]float32, 1536), nil
}
