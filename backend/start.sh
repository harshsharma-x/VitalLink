#!/bin/bash
# VitalLink Backend — Start Script
# Starts the FastAPI server with Socket.IO support

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Install dependencies if needed
if ! python3 -c "import fastapi" 2>/dev/null; then
  echo "Installing dependencies..."
  pip3 install -r requirements.txt
fi

echo "Starting VitalLink API on http://localhost:8000"
echo "Swagger docs: http://localhost:8000/docs"
echo ""
python3 -m uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload
