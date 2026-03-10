#!/bin/bash
# backup.sh — daily PostgreSQL backup at 02:00 UTC via cron
#
# 1. pg_dump → gzip → local volume  (7-day rotation)
# 2. Verify backup file is non-zero; dispatch GH alert if it fails
#
# Offsite backup: add rclone + Scaleway Object Storage when you have paying customers.

set -euo pipefail

BACKUP_DIR="/opt/retainr/data/backups"
DB_NAME="${POSTGRES_DB:-retainr}"
DB_USER="${POSTGRES_USER:-retainr}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/retainr_${TIMESTAMP}.sql.gz"
LOG_FILE="/opt/retainr/logs/backup.log"

# Load env
[ -f /opt/retainr/.env ] && . /opt/retainr/.env

log() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $*" >> "$LOG_FILE"; }

mkdir -p "$BACKUP_DIR"

# ── 1. Dump ───────────────────────────────────────────────────────────────────

log "Starting backup of $DB_NAME..."
PGPASSWORD="${POSTGRES_PASSWORD:-}" \
    pg_dump -U "$DB_USER" -h localhost "$DB_NAME" | gzip > "$BACKUP_FILE"

# Verify non-empty
SIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || echo "0")
if [ "$SIZE" -lt 1024 ]; then
    log "ERROR: backup file is suspiciously small (${SIZE} bytes) — possible dump failure"
    _dispatch_alert "backup-failed" "Backup file $BACKUP_FILE is only ${SIZE} bytes"
    exit 1
fi

log "Backup created: $BACKUP_FILE ($(du -sh "$BACKUP_FILE" | cut -f1))"

# ── 2. Local rotation (7 days) ────────────────────────────────────────────────

find "$BACKUP_DIR" -name "retainr_*.sql.gz" -mtime +7 -delete
log "Local rotation complete"

log "Backup finished successfully"

# ── Helpers ───────────────────────────────────────────────────────────────────

_dispatch_alert() {
    local event_type="$1"
    local message="$2"
    [ -n "${GITHUB_DISPATCH_TOKEN:-}" ] && [ -n "${GITHUB_REPO:-}" ] || return 0
    curl -sf --max-time 10 \
        -X POST \
        -H "Authorization: token ${GITHUB_DISPATCH_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/${GITHUB_REPO}/dispatches" \
        -d "{\"event_type\": \"$event_type\", \"client_payload\": {\"message\": \"$message\"}}" \
        > /dev/null 2>&1 || true
}
