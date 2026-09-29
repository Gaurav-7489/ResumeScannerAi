#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
VENV_DIR="$BACKEND_DIR/.venv"

cleanup() {
  echo ""
  echo "Stopping ResumeScannerAI..."
  kill "${BACKEND_PID:-}" "${FRONTEND_PID:-}" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "====================================================="
echo "   ResumeScannerAI — Local Interview Demo"
echo "====================================================="

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 is required."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js/npm is required."
  exit 1
fi

if [ ! -d "$VENV_DIR" ]; then
  echo "[SETUP] Creating Python virtual environment..."
  python3 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"
python -m pip install --upgrade pip -q
python -m pip install -r "$BACKEND_DIR/requirements.txt" -q

cd "$PROJECT_DIR"
if [ ! -d "node_modules" ]; then
  echo "[SETUP] Installing frontend packages..."
  npm install
fi

echo "[BACKEND] Starting at http://127.0.0.1:8000"
cd "$BACKEND_DIR"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

sleep 1

echo "[FRONTEND] Starting at http://localhost:5173"
cd "$PROJECT_DIR"
npm run dev -- --host 127.0.0.1 &
FRONTEND_PID=$!

echo ""
echo "Open: http://localhost:5173"
echo "API docs: http://127.0.0.1:8000/docs"
echo "Everything runs locally. No Supabase or cloud backend is required."
echo "Press Ctrl+C to stop."
echo ""

wait
