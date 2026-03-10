FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go workspace manifests first for layer caching
COPY go.work go.work.sum ./
COPY apps/api/go.mod apps/api/go.sum ./apps/api/
COPY apps/worker/go.mod apps/worker/go.sum ./apps/worker/
RUN go work sync

# Copy source
COPY apps/api ./apps/api
COPY apps/worker ./apps/worker

# BuildKit cache mounts — persist between Dokploy builds on the same host
# Cuts rebuild time from ~3 min → ~20 s when only source files change
RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg/mod \
    CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o /api ./apps/api/cmd/api

# Minimal runtime image
FROM gcr.io/distroless/static-debian12

COPY --from=builder /api /api

EXPOSE 8080

ENTRYPOINT ["/api"]
