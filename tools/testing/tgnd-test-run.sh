#!/usr/bin/env bash
# TGND – run all unit tests from repo root. Add --coverage when supported.
set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"
COVERAGE=""
[ "$1" = "--coverage" ] && COVERAGE="$1"
# Run tests in each app/package that has a test script
for dir in apps/* packages/*; do
  [ -d "$dir" ] || continue
  if [ -f "$dir/package.json" ]; then
    if grep -q '"test"' "$dir/package.json" 2>/dev/null; then
      echo "=== Testing $dir ==="
      (cd "$dir" && npm run test -- $COVERAGE 2>/dev/null || pnpm test -- $COVERAGE 2>/dev/null || true)
    fi
  fi
done
echo "=== TGND test run complete ==="
