#!/usr/bin/env bash

# Clean termination of background jobs on Ctrl+C / Exit
trap 'echo ""; echo "Shutting down..."; kill 0; exit 0' INT TERM EXIT

echo "====================================================="
echo "   Starting ResumeScannerAI Local Workspace...       "
echo "====================================================="

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. Start FastAPI Backend
echo "[BACKEND] Starting API Server on port 8000..."
cd "$PROJECT_DIR/backend"

if [ -d "venv" ]; then
    echo "[BACKEND] Activating virtual environment..."
    source venv/bin/activate
else
    echo "[BACKEND] No venv found. Using system Python."
fi

pip install -q -r requirements.txt 2>/dev/null

python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
echo "[BACKEND] Started (PID: $BACKEND_PID)"

# 2. Start Frontend Vite server
cd "$PROJECT_DIR"
echo "[FRONTEND] Starting Vite Dev Server on port 5173..."
npm run dev &
FRONTEND_PID=$!
echo "[FRONTEND] Started (PID: $FRONTEND_PID)"

echo ""
echo "====================================================="
echo "  App:  http://localhost:5173"
echo "  API:  http://localhost:8000"
echo "  Docs: http://localhost:8000/docs"
echo "  Press Ctrl+C to stop both servers."
echo "====================================================="
echo ""

wait
