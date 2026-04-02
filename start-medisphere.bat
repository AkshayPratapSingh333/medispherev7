@echo off
REM ============================================================
REM Medisphere - Start Development Environment
REM Starts both Next.js frontend (port 3000) and Express 
REM signaling server (port 4000) in separate windows
REM ============================================================

echo.
echo ============================================================
echo Medisphere - Starting Development Environment
echo ============================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ✓ npm found
echo.

REM Check ports availability
echo Checking port availability...
netstat -ano | findstr :3000 >nul
if not errorlevel 1 (
    echo WARNING: Port 3000 is already in use
    echo You can either:
    echo   - Close the application using port 3000
    echo   - Modify the port in the start command below
    echo.
)

netstat -ano | findstr :4000 >nul
if not errorlevel 1 (
    echo WARNING: Port 4000 is already in use
    echo You can either:
    echo   - Close the application using port 4000
    echo   - Modify the PORT environment variable below
    echo.
)

REM Start signaling server in a new window
echo Starting Signaling Server (Port 4000)...
start "Medisphere Signaling Server" /d "%CD%\medisphere-signaling-server" cmd /k "npm run dev"

REM Wait 2 seconds for server to start
timeout /t 2 /nobreak

REM Start Next.js frontend in a new window
echo Starting Next.js Frontend (Port 3000)...
start "Medisphere Frontend" /d "%CD%\medisphere-app" cmd /k "npm run dev"

REM Wait 3 seconds for frontend to start
timeout /t 3 /nobreak

echo.
echo ============================================================
echo ✓ Medisphere is starting!
echo ============================================================
echo.
echo Access the application at:
echo   Frontend:  http://localhost:3000
echo   Signaling: http://localhost:4000/health
echo.
echo Two terminal windows should have opened:
echo   1. Medisphere Signaling Server (port 4000)
echo   2. Medisphere Frontend (port 3000)
echo.
echo To stop the application:
echo   - Close both terminal windows, OR
echo   - Run: stop-medisphere.bat
echo.
echo To view logs:
echo   - Check the terminal windows for real-time output
echo.
echo ============================================================
echo.

pause
