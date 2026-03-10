#!/bin/bash
# health-check.sh — runs every 15 minutes via cron
# If health check fails, triggers Claude Code self-healing

set -euo pipefail

HEALTH_URL="https://api.retainr.dev/health"
LOG_FILE="/var/log/retainr/health.log"
MAX_FAILURES=3
FAILURE_FILE="/tmp/retainr-health-failures"

log() {
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $1" >> "$LOG_FILE"
}

# Check health endpoint
if curl -sf --max-time 10 "$HEALTH_URL" > /dev/null 2>&1; then
    # Healthy — reset failure counter
    rm -f "$FAILURE_FILE"
    log "OK"
    exit 0
fi

# Failed — increment counter
FAILURES=$(cat "$FAILURE_FILE" 2>/dev/null || echo "0")
FAILURES=$((FAILURES + 1))
echo "$FAILURES" > "$FAILURE_FILE"
log "FAIL (consecutive: $FAILURES)"

if [ "$FAILURES" -ge "$MAX_FAILURES" ]; then
    log "ALERT: $MAX_FAILURES consecutive failures — triggering self-heal"
    rm -f "$FAILURE_FILE"

    # Capture recent logs for context
    RECENT_LOGS=$(journalctl -u retainr-api -n 100 --no-pager 2>/dev/null || echo "no logs available")

    # Trigger Claude Code repair
    cd /opt/retainr
    claude --dangerously-skip-permissions \
        "The retainr API health check has failed $MAX_FAILURES times. Recent logs: $RECENT_LOGS

        Please:
        1. Check if the process is running: systemctl status retainr-api
        2. Identify the root cause from the logs
        3. Fix the issue (restart service, fix code, or redeploy)
        4. Verify health: curl https://api.retainr.dev/health
        5. Write a brief incident report to docs/incidents/\$(date +%Y-%m-%d)-auto-repair.md

        Only fix what is broken. Do not make unrelated changes." \
        >> "$LOG_FILE" 2>&1 &

    log "Self-heal triggered (PID: $!)"
fi
