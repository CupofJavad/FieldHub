#!/usr/bin/env bash
# M4.4 – Backup Postgres DB and optional config. Run from repo root; load .env for connection.
# Usage: ./scripts/backup-db.sh [output_dir]
# Output: output_dir/tgnd_db_YYYYMMDD_HHMMSS.sql (and optionally config tarball).
set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
if [ -f .env ]; then
  set -a
  source <(grep -v '^#' .env | grep -E '^[A-Za-z_][A-Za-z0-9_]*=' || true)
  set +a
fi
OUT_DIR="${1:-$REPO_ROOT/backups}"
mkdir -p "$OUT_DIR"
STAMP=$(date +%Y%m%d_%H%M%S)
FILE="$OUT_DIR/tgnd_db_$STAMP.sql"
if [ -n "$DATABASE_URL" ]; then
  pg_dump "$DATABASE_URL" --no-owner --no-acl -f "$FILE"
  echo "Backup: $FILE"
else
  echo "DATABASE_URL not set; skipping DB backup. Export DATABASE_URL or set in .env."
fi
# Optional: backup config (no secrets)
if [ -d config ]; then
  tar -czf "$OUT_DIR/tgnd_config_$STAMP.tar.gz" -C "$REPO_ROOT" config 2>/dev/null || true
  echo "Config backup: $OUT_DIR/tgnd_config_$STAMP.tar.gz"
fi
