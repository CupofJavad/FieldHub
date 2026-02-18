#!/usr/bin/env bash
# TGND Version Copy – creates a versioned copy of a file per project naming convention.
# Usage: tgnd_version_copy.sh <file> [MAJOR.MINOR.PATCH]
set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CONFIG="$REPO_ROOT/tools/versioning/config.json"
FILE="$1"
VERSION="${2:-1.0.0}"
if [ -z "$FILE" ] || [ ! -f "$REPO_ROOT/$FILE" ]; then
  echo "Usage: $0 <path/to/file> [MAJOR.MINOR.PATCH]"
  exit 1
fi
BASE=$(basename "$FILE")
EXT="${BASE##*.}"
BASE_NAME="${BASE%.*}"
# Normalize base name: lowercase, spaces to underscores
BASE_NAME=$(echo "$BASE_NAME" | tr '[:upper:]' '[:lower:]' | tr -s ' ' '_')
NOW=$(date -u +%Y%m%d.%H%M%S)
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"
PATCH="${PATCH:-0}"
OUT_NAME="${BASE_NAME}.v${MAJOR}.${MINOR}.${PATCH}.${NOW}.${EXT}"
# Map path prefix to version output dir (must match tools/versioning/config.json paths)
case "$FILE" in
  docs/*)   DEST_DIR="docs/versions" ;;
  config/*) DEST_DIR="config/versions" ;;
  db/*)     DEST_DIR="db/schema_versions" ;;
  logs/*)   DEST_DIR="logs/reports" ;;
  *)        DEST_DIR="docs/versions" ;;
esac
mkdir -p "$REPO_ROOT/$DEST_DIR"
cp "$REPO_ROOT/$FILE" "$REPO_ROOT/$DEST_DIR/$OUT_NAME"
echo "Created: $DEST_DIR/$OUT_NAME"
