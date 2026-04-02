@echo off
REM ============================================================
REM MEDISPHERE - Development Startup Script (Windows)
REM ============================================================
REM This script starts both the Next.js app and Signaling server
REM ============================================================

color 0A
title MEDISPHERE Development Environment

echo.
echo ============================================================
echo  MEDISPHERE - WebRTC Telemedicine Platform
echo  Development Environment Startup
echo ============================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] Node.js found: 
node --version

echo.
echo ============================================================
echo  STEP 1: Installing Dependencies
echo ============================================================
echo.

REM Install frontend dependencies
echo [1/2] Installing medisphere-app dependencies...
cd medisphere-app
if not exist "node_modules" (
    call npm install
) else (
    echo [✓] medisphere-app dependencies already installed
)
cd ..

REM Install signaling server dependencies
echo.
echo [2/2] Installing medisphere-signaling-server dependencies...
cd medisphere-signaling-server
if not exist "node_modules" (
    call npm install
) else (
    echo [✓] medisphere-signaling-server dependencies already installed
)
cd ..

echo.
echo ============================================================
echo  STEP 2: Starting Services
echo ============================================================
echo.

REM Create separate windows for each service
echo [→] Starting Signaling Server on http://localhost:4000 ...
start "Medisphere - Signaling Server" cmd /k "cd medisphere-signaling-server && npm start"

timeout /t 3 /nobreak

echo [→] Starting Next.js App on http://localhost:3000 ...
start "Medisphere - Next.js App" cmd /k "cd medisphere-app && npm run dev"

echo.
echo ============================================================
echo  STARTUP COMPLETE!
echo ============================================================
echo.
echo Services running:
echo   • Next.js App:        http://localhost:3000
echo   • Signaling Server:   http://localhost:4000
echo   • Health Check:       http://localhost:4000/health
echo.
echo Log files:
echo   • Signaling Server console is available in the new window
echo   • Next.js console is available in the new window
echo.
echo TIPS:
echo   • Browser console (F12) shows WebRTC connection logs
echo   • Server console shows Socket.io events
echo   • Check both when debugging issues
echo.
echo To stop:
echo   • Close the command windows (Ctrl+C or close button)
echo.
pause
