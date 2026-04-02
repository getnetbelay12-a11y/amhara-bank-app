#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BASE_URL="${REMINDER_API_BASE_URL:-http://127.0.0.1:4000}"
HEALTH_URL="${BASE_URL%/}/health"
MAX_ATTEMPTS="${REMINDER_HEALTH_RETRIES:-30}"
SLEEP_SECONDS="${REMINDER_HEALTH_SLEEP_SECONDS:-2}"

cd "$BACKEND_DIR"

echo "Checking backend health at $HEALTH_URL"

attempt=1
until curl -fsS "$HEALTH_URL" >/dev/null 2>&1; do
  if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
    echo "Backend did not become healthy after $MAX_ATTEMPTS attempts."
    echo "Start it in another terminal with: npm run start:dev"
    exit 1
  fi

  echo "Backend not ready yet (attempt $attempt/$MAX_ATTEMPTS). Waiting ${SLEEP_SECONDS}s..."
  sleep "$SLEEP_SECONDS"
  attempt=$((attempt + 1))
done

echo "Backend is healthy. Running reminder flow verification..."
npm run verify:reminder
