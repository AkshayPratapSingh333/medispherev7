#!/bin/bash

# ============================================================
# Medisphere - Initial Setup Script (macOS/Linux)
# Installs dependencies and configures environment variables
# Run this once before first use
# ============================================================

set -e  # Exit on any error

echo ""
echo "============================================================"
echo "Medisphere - Initial Setup"
echo "============================================================"
echo ""
echo "This script will:"
echo "  1. Check Node.js and npm installation"
echo "  2. Install frontend dependencies"
echo "  3. Install signaling server dependencies"
echo "  4. Create environment configuration files"
echo "  5. Display next steps"
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "✗ ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Or using Homebrew (macOS): brew install node"
    echo "Or using apt (Linux): sudo apt-get install nodejs npm"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✓ Node.js found: $NODE_VERSION"

# Check if npm is installed
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "✗ ERROR: npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✓ npm found: $NPM_VERSION"
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Install frontend dependencies
echo "============================================================"
echo "Installing frontend dependencies..."
echo "============================================================"
cd "$SCRIPT_DIR/medisphere-app"

if [ ! -f "package.json" ]; then
    echo "✗ ERROR: package.json not found in medisphere-app/"
    exit 1
fi

npm install
echo "✓ Frontend dependencies installed"
echo ""

# Create frontend .env.local if it doesn't exist
echo "Creating frontend environment configuration..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env.local"
        echo "✓ Created .env.local from .env.example"
        echo ""
        echo "⚠️  IMPORTANT: Edit medisphere-app/.env.local and set:"
        echo "   - DATABASE_URL (MySQL connection string)"
        echo "   - NEXTAUTH_SECRET (random string, use: openssl rand -base64 32)"
        echo "   - NEXT_PUBLIC_SIGNALING_SERVER (should be http://localhost:4000)"
        echo ""
    else
        echo "✗ WARNING: .env.example not found in medisphere-app/"
        echo "Please manually create .env.local with required variables"
    fi
else
    echo "✓ .env.local already exists"
fi
echo ""

# Install signaling server dependencies
echo "============================================================"
echo "Installing signaling server dependencies..."
echo "============================================================"
cd "$SCRIPT_DIR/medisphere-signaling-server"

if [ ! -f "package.json" ]; then
    echo "✗ ERROR: package.json not found in medisphere-signaling-server/"
    exit 1
fi

npm install
echo "✓ Signaling server dependencies installed"
echo ""

# Create signaling server .env if it doesn't exist
echo "Creating signaling server environment configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env"
        echo "✓ Created .env from .env.example"
        echo ""
        echo "⚠️  IMPORTANT: Edit medisphere-signaling-server/.env and set:"
        echo "   - PORT (default: 4000)"
        echo "   - NEXTAUTH_SECRET (must match frontend value)"
        echo "   - CORS_ORIGIN (default: http://localhost:3000)"
        echo ""
    else
        echo "✗ WARNING: .env.example not found in medisphere-signaling-server/"
        echo "Please manually create .env with required variables"
    fi
else
    echo "✓ .env already exists"
fi
echo ""

# Make scripts executable
cd "$SCRIPT_DIR"
chmod +x start-dev.sh stop-dev.sh setup-dev.sh 2>/dev/null || true

# Display next steps
echo "============================================================"
echo "✓ Setup Complete!"
echo "============================================================"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Configure Environment Variables"
echo "   - Edit: medisphere-app/.env.local"
echo "   - Edit: medisphere-signaling-server/.env"
echo ""
echo "2. Setup Database (at least once):"
echo "   - Ensure MySQL is running"
echo "   - Run Prisma migrations:"
echo "     cd medisphere-app"
echo "     npx prisma migrate dev --name init"
echo "     npx prisma generate"
echo ""
echo "3. Start the Application"
echo "   - Run: ./start-dev.sh"
echo "   OR manually in two terminals:"
echo "     Terminal 1: cd medisphere-signaling-server && npm run dev"
echo "     Terminal 2: cd medisphere-app && npm run dev"
echo ""
echo "4. Access the Application"
echo "   - Frontend:  http://localhost:3000"
echo "   - Signaling: http://localhost:4000/health"
echo ""
echo "5. Test the Features"
echo "   - Create test appointment"
echo "   - Test video call between doctor and patient"
echo ""
echo "For detailed instructions, see STARTUP_GUIDE.md"
echo ""
echo "============================================================"
echo ""
