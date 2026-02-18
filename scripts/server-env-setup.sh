#!/usr/bin/env bash
# TGND – Create dev/test/prod environments on Lunaverse server (Lacie_Free).
# Run from repo root. Uses .env: LUNAVERSE_HOST, LUNAVERSE_SSH_USER, LUNAVERSE_SSH_PORT
# Does not modify other projects. Jordan / owner can run when SSH is available.
set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
if [ -f .env ]; then
  set -a
  source <(grep -v '^#' .env | grep -E '^[A-Za-z_][A-Za-z0-9_]*=' || true)
  set +a
fi
HOST="${LUNAVERSE_HOST:-192.168.8.2}"
USER="${LUNAVERSE_SSH_USER:-luna}"
PORT="${LUNAVERSE_SSH_PORT:-22}"
BASE="/mnt/lacie_external/tgnd"
echo "Creating TGND env dirs on $USER@$HOST:$PORT under $BASE (dev, test, prod)..."
ssh -o ConnectTimeout=10 -o BatchMode=yes -p "$PORT" "$USER@$HOST" "
  sudo mkdir -p $BASE/dev $BASE/test $BASE/prod
  sudo chown -R $USER:$USER $BASE
  echo '---'
  echo 'Env dirs:'
  ls -la $BASE
  echo '---'
  echo 'Dependency check (Node, Postgres client, Docker):'
  (command -v node >/dev/null && node -v) || echo 'node: not found'
  (command -v psql >/dev/null && psql --version) || echo 'psql: not found'
  (command -v docker >/dev/null && docker --version) || echo 'docker: not found'
"
echo "Done. Do not copy .env to server; use env-specific values per environment."
