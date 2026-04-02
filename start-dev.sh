#!/bin/bash

# ============================================================
# Medisphere - Start Development Environment (macOS/Linux)
# Starts both Next.js frontend (port 3000) and Express 
# signaling server (port 4000)
# ============================================================

set -e  # Exit on any error

echo ""
echo "============================================================"
echo "Medisphere - Starting Development Environment"
echo "============================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "✗ ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✓ Node.js found: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "✗ ERROR: npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✓ npm found: $NPM_VERSION"
echo ""

# Check ports availability
echo "Checking port availability..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  WARNING: Port 3000 is already in use"
fi

if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  WARNING: Port 4000 is already in use"
fi

echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start signaling server in background
echo "Starting Signaling Server (Port 4000)..."
cd "$SCRIPT_DIR/medisphere-signaling-server"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file not found in signaling server"
    echo "Copy .env.example to .env and configure it first"
    echo "Run: cp .env.example .env"
fi

npm run dev > /tmp/medisphere-server.log 2>&1 &
SERVER_PID=$!
echo "✓ Signaling Server started (PID: $SERVER_PID)"

# Wait for server to start
sleep 2

# Start Next.js frontend in background
echo "Starting Next.js Frontend (Port 3000)..."
cd "$SCRIPT_DIR/medisphere-app"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  WARNING: .env.local file not found in frontend"
    echo "Copy .env.example to .env.local and configure it first"
    echo "Run: cp .env.example .env.local"
fi

npm run dev > /tmp/medisphere-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✓ Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend to start
sleep 3

echo ""
echo "============================================================"
echo "✓ Medisphere is starting!"
echo "============================================================"
echo ""
echo "Access the application at:"
echo "  Frontend:  http://localhost:3000"
echo "  Signaling: http://localhost:4000/health"
echo ""
echo "Processes running:"
echo "  Signaling Server (PID: $SERVER_PID)"
echo "  Frontend Server (PID: $FRONTEND_PID)"
echo ""
echo "To view logs:"
echo "  Frontend:  tail -f /tmp/medisphere-frontend.log"
echo "  Signaling: tail -f /tmp/medisphere-server.log"
echo ""
echo "To stop the application:"
echo "  Run: ./stop-dev.sh"
echo "  OR: kill $SERVER_PID $FRONTEND_PID"
echo ""
echo "============================================================"
echo ""

# Keep script running and handle Ctrl+C gracefully
trap "echo 'Stopping Medisphere...'; kill $SERVER_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT

# Wait for processes
wait $SERVER_PID $FRONTEND_PID 2>/dev/null || true
