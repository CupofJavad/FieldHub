#!/usr/bin/env bash
# TGND – Server check: Lacie_Free space and mount. Run from repo root.
# Uses .env: LUNAVERSE_HOST, LUNAVERSE_SSH_USER, LUNAVERSE_SSH_PORT
set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi
HOST="${LUNAVERSE_HOST:-192.168.8.2}"
USER="${LUNAVERSE_SSH_USER:-luna}"
PORT="${LUNAVERSE_SSH_PORT:-22}"
echo "Checking server $USER@$HOST:$PORT for Lacie_Free / external drive..."
ssh -o ConnectTimeout=10 -o BatchMode=yes -p "$PORT" "$USER@$HOST" "df -h | grep -E 'lacie|mnt'; echo '---'; ls -la /mnt/lacie_external 2>/dev/null || true"
echo "Done."
