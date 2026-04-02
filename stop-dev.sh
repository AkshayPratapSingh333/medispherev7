#!/bin/bash

# ============================================================
# Medisphere - Stop Development Environment (macOS/Linux)
# Stops all Medisphere processes gracefully
# ============================================================

echo ""
echo "============================================================"
echo "Medisphere - Stopping Development Environment"
echo "============================================================"
echo ""

# Kill any Node.js processes related to medisphere
echo "Stopping Node.js services..."

# Find and kill node processes
if pgrep -f "node.*server.js" > /dev/null; then
    pkill -f "node.*server.js"
    echo "✓ Stopped signaling server"
fi

if pgrep -f "next dev" > /dev/null; then
    pkill -f "next dev"
    echo "✓ Stopped frontend server"
fi

# Try other common patterns
if pgrep -f "npm run dev" > /dev/null; then
    pkill -f "npm run dev"
    echo "✓ Stopped npm dev processes"
fi

# Give it a moment to shut down gracefully
sleep 1

# Force kill any remaining node processes if needed
if pgrep -f "medisphere" > /dev/null; then
    pkill -9 -f "medisphere"
    echo "✓ Force stopped remaining processes"
fi

echo ""
echo "============================================================"
echo "✓ Medisphere has been stopped"
echo "============================================================"
echo ""
echo "All services have been terminated."
echo ""
echo "To start again:"
echo "  Run: ./start-dev.sh"
echo ""
echo "============================================================"
echo ""
