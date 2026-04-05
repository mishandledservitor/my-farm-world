#!/usr/bin/env bash
# "Launch My Farm World.command"
# Double-click this file in Finder to start the game in your browser.
# macOS may ask you to allow it the first time — open System Settings →
# Privacy & Security → scroll down → click "Allow Anyway".

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Node.js check ─────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  osascript -e 'display alert "Node.js not found" message "Please install Node.js 18+ from https://nodejs.org/ then try again." as critical'
  exit 1
fi

# ── Install dependencies if missing or stale ──────────────────────────────────
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  echo "Installing dependencies (first run only)..."
  npm install
fi

# ── Pick a free port (default 3000, fall back if busy) ───────────────────────
PORT=3000
if lsof -iTCP:"$PORT" -sTCP:LISTEN &>/dev/null; then
  PORT=3001
fi

# ── Start dev server in the background ───────────────────────────────────────
VITE_PORT=$PORT npm run dev &
SERVER_PID=$!

# ── Wait for server to be ready, then open browser ───────────────────────────
echo "Waiting for server on port $PORT..."
for i in $(seq 1 20); do
  if curl -s "http://localhost:$PORT" &>/dev/null; then
    break
  fi
  sleep 0.5
done

open "http://localhost:$PORT"

echo ""
echo "My Farm World is running at http://localhost:$PORT"
echo "Close this window (or press Ctrl+C) to stop the server."
echo ""

# Keep terminal open so closing it stops the server
wait "$SERVER_PID"
