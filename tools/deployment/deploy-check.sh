#!/usr/bin/env bash
# TGND – pre-deployment checks: run tests and verify env. Use from repo root.
# M4.5 – Quinn/Jordan. See tools/deployment/README.md.
set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "=== TGND deployment check ==="

# Load .env if present (do not fail if missing)
if [ -f .env ]; then
  set -a
  # shellcheck source=../../.env
  . .env 2>/dev/null || true
  set +a
fi

# 1. Env checks (warn only; do not block)
WARN=""
[ -z "${DATABASE_URL:-}" ] && WARN="${WARN}DATABASE_URL not set (API and API tests need it). "
[ -z "${PORT:-}" ] && [ -z "${WARN}" ] && true || true
[ -n "$WARN" ] && echo "Note: $WARN"

# 2. Run full test suite
echo "=== Running test suite ==="
if ! ./tools/testing/tgnd-test-run.sh; then
  echo "Deploy check FAILED: test run reported failures."
  exit 1
fi

echo "=== Deployment check passed ==="
exit 0
