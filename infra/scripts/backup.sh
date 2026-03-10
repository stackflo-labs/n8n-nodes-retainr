#!/bin/bash
# backup.sh — daily PostgreSQL backup, runs at 02:00 UTC via cron
# Keeps 7 daily backups, deletes older ones

set -euo pipefail

BACKUP_DIR="/opt/retainr/backups"
DB_NAME="${POSTGRES_DB:-retainr}"
DB_USER="${POSTGRES_USER:-retainr}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/retainr_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Dump and compress
pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) backup created: $BACKUP_FILE ($(du -sh "$BACKUP_FILE" | cut -f1))"

# Rotate: keep last 7
find "$BACKUP_DIR" -name "retainr_*.sql.gz" -mtime +7 -delete
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) old backups pruned"
