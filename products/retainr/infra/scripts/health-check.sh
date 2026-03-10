#!/bin/bash
# health-check.sh — runs every 5 minutes via cron on the VPS
#
# Strategy:
#   1. Check health endpoint — if OK, done.
#   2. 2 consecutive failures → try service restart.
#   3. 3+ consecutive failures + restart failed → collect enriched context
#      and dispatch to GitHub Actions investigate.yml.
#
# Claude Code does NOT run on this machine.

set -euo pipefail

HEALTH_URL="https://api.retainr.dev/health"
LOG_FILE="/opt/retainr/logs/health.log"
FAILURE_FILE="/tmp/retainr-health-failures"
MAX_FAILURES_BEFORE_RESTART=2
MAX_FAILURES_BEFORE_DISPATCH=3

# Load env for GITHUB_DISPATCH_TOKEN, GITHUB_REPO, POSTGRES_USER, POSTGRES_DB
[ -f /opt/retainr/.env ] && . /opt/retainr/.env

log() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $*" >> "$LOG_FILE"; }

# ── Healthy path ──────────────────────────────────────────────────────────────

if curl -sf --max-time 10 "$HEALTH_URL" > /dev/null 2>&1; then
    rm -f "$FAILURE_FILE"
    log "OK"
    exit 0
fi

# ── Failure path ──────────────────────────────────────────────────────────────

FAILURES=$(cat "$FAILURE_FILE" 2>/dev/null || echo "0")
FAILURES=$((FAILURES + 1))
echo "$FAILURES" > "$FAILURE_FILE"
log "FAIL (consecutive: $FAILURES)"

# ── Step 1: restart ───────────────────────────────────────────────────────────

if [ "$FAILURES" -eq "$MAX_FAILURES_BEFORE_RESTART" ]; then
    log "Attempting service restart..."
    cd /opt/retainr
    docker compose -f infra/docker-compose.prod.yml restart api worker 2>/dev/null || \
        systemctl restart retainr-api retainr-worker 2>/dev/null || true
    sleep 15
    if curl -sf --max-time 10 "$HEALTH_URL" > /dev/null 2>&1; then
        log "Restart recovered the service"
        rm -f "$FAILURE_FILE"
        exit 0
    fi
    log "Restart did not recover"
fi

# ── Step 2: dispatch to GitHub Actions ───────────────────────────────────────

if [ "$FAILURES" -ge "$MAX_FAILURES_BEFORE_DISPATCH" ]; then
    log "ALERT: $FAILURES failures — dispatching to GitHub Actions"
    rm -f "$FAILURE_FILE"

    # Collect enriched context for Claude
    API_LOGS=$(journalctl -u retainr-api -n 100 --no-pager 2>/dev/null | tail -100 | jq -Rs '.' 2>/dev/null || echo '"unavailable"')
    DOCKER_LOGS=$(docker compose -f /opt/retainr/infra/docker-compose.prod.yml logs --tail=50 2>/dev/null | jq -Rs '.' 2>/dev/null || echo '"unavailable"')

    # Enriched system state: disk, RAM, recent git commits
    DISK=$(df -h /opt/retainr/data 2>/dev/null | tail -1 || df -h / | tail -1)
    RAM=$(free -m 2>/dev/null | awk 'NR==2{printf "total=%sMB used=%sMB free=%sMB", $2, $3, $4}')
    GIT_LOG=$(git -C /opt/retainr log --oneline -5 2>/dev/null || echo "unavailable")

    SYSTEM_STATE=$(printf "disk: %s\nram: %s\nrecent_deploys:\n%s" \
        "$DISK" "$RAM" "$GIT_LOG" | jq -Rs '.' 2>/dev/null || echo '"unavailable"')

    if [ -n "${GITHUB_DISPATCH_TOKEN:-}" ] && [ -n "${GITHUB_REPO:-}" ]; then
        HTTP_STATUS=$(curl -sf --max-time 15 \
            -X POST \
            -H "Authorization: token ${GITHUB_DISPATCH_TOKEN}" \
            -H "Accept: application/vnd.github.v3+json" \
            -H "Content-Type: application/json" \
            "https://api.github.com/repos/${GITHUB_REPO}/dispatches" \
            -d "{
                \"event_type\": \"api-failure\",
                \"client_payload\": {
                    \"failures\": ${FAILURES},
                    \"api_logs\": ${API_LOGS},
                    \"docker_logs\": ${DOCKER_LOGS},
                    \"system_state\": ${SYSTEM_STATE},
                    \"triggered_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
                }
            }" \
            -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")

        if [ "$HTTP_STATUS" = "204" ]; then
            log "GitHub Actions dispatch succeeded"
        else
            log "GitHub Actions dispatch failed (HTTP $HTTP_STATUS)"
        fi
    else
        log "GITHUB_DISPATCH_TOKEN or GITHUB_REPO not set — cannot dispatch"
    fi
fi
