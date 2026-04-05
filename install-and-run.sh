#!/usr/bin/env bash
# install-and-run.sh — Install dependencies and start the My Farm World dev server.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=================================="
echo "  My Farm World — Setup & Launch"
echo "=================================="
echo ""

# Check for Node.js
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Download it from https://nodejs.org/ (v18 or later) and re-run this script."
  exit 1
fi

NODE_VERSION=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js 18+ is required (found v$(node -v))."
  echo "Download a newer version from https://nodejs.org/"
  exit 1
fi

echo "Node.js $(node -v) found."
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  echo "Installing dependencies..."
  npm install
  echo ""
else
  echo "Dependencies already installed."
  echo ""
fi

echo "Starting dev server at http://localhost:3000"
echo "Press Ctrl+C to stop."
echo ""

npm run dev
