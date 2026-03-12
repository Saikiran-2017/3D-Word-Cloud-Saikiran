#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Checking prerequisites ==="

command -v node  >/dev/null 2>&1 || { echo "Error: node is not installed";   exit 1; }
command -v npm   >/dev/null 2>&1 || { echo "Error: npm is not installed";    exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Error: python3 is not installed"; exit 1; }
command -v pip3  >/dev/null 2>&1 || { echo "Error: pip3 is not installed";   exit 1; }

echo "node   $(node --version)"
echo "python $(python3 --version)"

# --- Install backend dependencies ---
echo ""
echo "=== Installing backend dependencies ==="
cd "$ROOT_DIR/backend"
pip3 install -r requirements.txt

# --- Install frontend dependencies ---
echo ""
echo "=== Installing frontend dependencies ==="
cd "$ROOT_DIR/frontend"
npm install

# --- Start both servers ---
echo ""
echo "=== Starting servers ==="
echo "Backend  - http://localhost:8000"
echo "Frontend - http://localhost:5173"
echo ""

cd "$ROOT_DIR/backend"
python3 -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait
