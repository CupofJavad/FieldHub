#!/usr/bin/env bash
# M4.5 – Pre-deployment check: run tests and optional health/ready. Exit 0 only if all pass.
# Usage: ./scripts/deployment-check.sh [--skip-tests] [--api-url URL]
# Default: run tools/testing/tgnd-test-run.sh; if --api-url given, curl /health and /ready.
set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
SKIP_TESTS=""
API_URL=""
while [ $# -gt 0 ]; do
  case "$1" in
    --skip-tests) SKIP_TESTS=1; shift ;;
    --api-url)    API_URL="$2"; shift 2 ;;
    *) shift ;;
  esac
done

FAILED=0

if [ -z "$SKIP_TESTS" ]; then
  echo "=== Running TGND test suite ==="
  if [ -f tools/testing/tgnd-test-run.sh ]; then
    tools/testing/tgnd-test-run.sh || FAILED=1
  else
    (cd apps/api && npm run test 2>/dev/null) || FAILED=1
  fi
fi

if [ -n "$API_URL" ]; then
  echo "=== Checking API health and readiness ==="
  HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" 2>/dev/null || echo "000")
  READY=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/ready" 2>/dev/null || echo "000")
  if [ "$HEALTH" != "200" ]; then
    echo "FAIL: /health returned $HEALTH"
    FAILED=1
  fi
  if [ "$READY" != "200" ]; then
    echo "WARN: /ready returned $READY (DB may be down)"
  fi
fi

if [ $FAILED -eq 1 ]; then
  echo "=== Deployment check FAILED ==="
  exit 1
fi
echo "=== Deployment check passed ==="
exit 0
