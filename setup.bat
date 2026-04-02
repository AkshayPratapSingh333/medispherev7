@echo off
REM ============================================================
REM Medisphere - Initial Setup Script
REM Installs dependencies and configures environment variables
REM Run this once before first use
REM ============================================================

echo.
echo ============================================================
echo Medisphere - Initial Setup
echo ============================================================
echo.
echo This script will:
echo   1. Check Node.js and npm installation
echo   2. Install frontend dependencies
echo   3. Install signaling server dependencies
echo   4. Create environment configuration files
echo   5. Display next steps
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo Then run this script again
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js found: %NODE_VERSION%

REM Check if npm is installed
echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ✗ ERROR: npm is not installed
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm found: %NPM_VERSION%
echo.

REM Install frontend dependencies
echo ============================================================
echo Installing frontend dependencies...
echo ============================================================
cd /d "%~dp0medisphere-app"
if errorlevel 1 (
    echo ✗ ERROR: Could not navigate to medisphere-app directory
    pause
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo ✗ ERROR: Frontend installation failed
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed
echo.

REM Create frontend .env.local if it doesn't exist
echo Creating frontend environment configuration...
if not exist ".env.local" (
    if exist ".env.example" (
        copy ".env.example" ".env.local"
        echo ✓ Created .env.local from .env.example
        echo.
        echo ⚠️  IMPORTANT: Edit medisphere-app/.env.local and set:
        echo    - DATABASE_URL (MySQL connection string)
        echo    - NEXTAUTH_SECRET (random string, use: openssl rand -base64 32)
        echo    - NEXT_PUBLIC_SIGNALING_SERVER (should be http://localhost:4000)
        echo.
    ) else (
        echo ✗ WARNING: .env.example not found in medisphere-app/
        echo Please manually create .env.local with required variables
    )
) else (
    echo ✓ .env.local already exists
)
echo.

REM Install signaling server dependencies
echo ============================================================
echo Installing signaling server dependencies...
echo ============================================================
cd /d "%~dp0medisphere-signaling-server"
if errorlevel 1 (
    echo ✗ ERROR: Could not navigate to medisphere-signaling-server directory
    pause
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo ✗ ERROR: Signaling server installation failed
    pause
    exit /b 1
)
echo ✓ Signaling server dependencies installed
echo.

REM Create signaling server .env if it doesn't exist
echo Creating signaling server environment configuration...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✓ Created .env from .env.example
        echo.
        echo ⚠️  IMPORTANT: Edit medisphere-signaling-server/.env and set:
        echo    - PORT (default: 4000)
        echo    - NEXTAUTH_SECRET (must match frontend value)
        echo    - CORS_ORIGIN (default: http://localhost:3000)
        echo.
    ) else (
        echo ✗ WARNING: .env.example not found in medisphere-signaling-server/
        echo Please manually create .env with required variables
    )
) else (
    echo ✓ .env already exists
)
echo.

REM Return to root directory
cd /d "%~dp0"

REM Display next steps
echo ============================================================
echo ✓ Setup Complete!
echo ============================================================
echo.
echo NEXT STEPS:
echo.
echo 1. Configure Environment Variables
echo    - Edit: medisphere-app/.env.local
echo    - Edit: medisphere-signaling-server/.env
echo.
echo 2. Setup Database (at least once):
echo    - Ensure MySQL is running
echo    - Run Prisma migrations:
echo      cd medisphere-app
echo      npx prisma migrate dev --name init
echo      npx prisma generate
echo.
echo 3. Start the Application
echo    - Run: start-medisphere.bat
echo    OR manually in two terminals:
echo      Terminal 1: cd medisphere-signaling-server && npm run dev
echo      Terminal 2: cd medisphere-app && npm run dev
echo.
echo 4. Access the Application
echo    - Frontend:  http://localhost:3000
echo    - Signaling: http://localhost:4000/health
echo.
echo 5. Test the Features
echo    - Create test appointment
echo    - Test video call between doctor and patient
echo.
echo For detailed instructions, see STARTUP_GUIDE.md
echo.
echo ============================================================
echo.

pause
