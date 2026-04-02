#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$BACKEND_DIR/.." && pwd)"
WEB_DIR="$REPO_ROOT/web"
MOBILE_DIR="$REPO_ROOT/mobile"

BACKEND_BASE_URL="${REMINDER_API_BASE_URL:-http://127.0.0.1:4000}"
BACKEND_HEALTH_URL="${BACKEND_BASE_URL%/}/health"

WEB_HOST="${REMINDER_WEB_HOST:-127.0.0.1}"
WEB_PORT="${REMINDER_WEB_PORT:-4180}"
WEB_URL="http://${WEB_HOST}:${WEB_PORT}"

MOBILE_PORT="${REMINDER_MOBILE_PORT:-7361}"
MOBILE_URL="http://127.0.0.1:${MOBILE_PORT}"

MAX_ATTEMPTS="${REMINDER_HEALTH_RETRIES:-30}"
SLEEP_SECONDS="${REMINDER_HEALTH_SLEEP_SECONDS:-2}"

backend_pid=""
web_pid=""
mobile_pid=""

cleanup() {
  if [ -n "${mobile_pid}" ] && kill -0 "${mobile_pid}" >/dev/null 2>&1; then
    kill "${mobile_pid}" >/dev/null 2>&1 || true
  fi

  if [ -n "${web_pid}" ] && kill -0 "${web_pid}" >/dev/null 2>&1; then
    kill "${web_pid}" >/dev/null 2>&1 || true
  fi

  if [ -n "${backend_pid}" ] && kill -0 "${backend_pid}" >/dev/null 2>&1; then
    kill "${backend_pid}" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

wait_for_url() {
  local url="$1"
  local label="$2"
  local attempt=1

  until curl -fsS "$url" >/dev/null 2>&1; do
    if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
      echo "$label did not become ready after $MAX_ATTEMPTS attempts."
      return 1
    fi

    echo "$label not ready yet (attempt $attempt/$MAX_ATTEMPTS). Waiting ${SLEEP_SECONDS}s..."
    sleep "$SLEEP_SECONDS"
    attempt=$((attempt + 1))
  done

  echo "$label is ready at $url"
}

if curl -fsS "$BACKEND_HEALTH_URL" >/dev/null 2>&1; then
  echo "Backend already running at $BACKEND_BASE_URL"
else
  echo "Starting backend from $BACKEND_DIR"
  (
    cd "$BACKEND_DIR"
    npm run start:dev
  ) &
  backend_pid=$!
  wait_for_url "$BACKEND_HEALTH_URL" "Backend"
fi

if curl -fsS "$WEB_URL" >/dev/null 2>&1; then
  echo "Web admin already running at $WEB_URL"
else
  echo "Starting web admin from $WEB_DIR"
  (
    cd "$WEB_DIR"
    VITE_API_BASE_URL="$BACKEND_BASE_URL" npm run dev -- --host "$WEB_HOST" --port "$WEB_PORT"
  ) &
  web_pid=$!
  wait_for_url "$WEB_URL" "Web admin"
fi

if curl -fsS "$MOBILE_URL" >/dev/null 2>&1; then
  echo "Mobile web app already running at $MOBILE_URL"
else
  echo "Starting mobile web app from $MOBILE_DIR"
  (
    cd "$MOBILE_DIR"
    flutter run -d chrome --web-port "$MOBILE_PORT" --dart-define=API_BASE_URL="$BACKEND_BASE_URL"
  ) &
  mobile_pid=$!
  wait_for_url "$MOBILE_URL" "Mobile web app"
fi

echo "Running reminder flow verification..."
cd "$BACKEND_DIR"
npm run verify:reminder

echo ""
echo "Admin console:"
echo "${WEB_URL}/?preview=admin"
echo ""
echo "Customer app:"
echo "${MOBILE_URL}/?preview=customer"
