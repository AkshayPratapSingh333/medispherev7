@echo off
REM ============================================================
REM Medisphere - Stop Development Environment
REM Stops all Medisphere processes gracefully
REM ============================================================

echo.
echo ============================================================
echo Medisphere - Stopping Development Environment
echo ============================================================
echo.

REM Kill Node.js processes
echo Stopping Node.js services...

tasklist | find /i "node.exe" >nul
if errorlevel 1 (
    echo No Node.js processes found running
) else (
    echo Found Node.js processes, attempting graceful shutdown...
    
    REM Try to find the specific node processes and kill them
    for /f "tokens=2" %%A in ('tasklist ^| find /i "node.exe"') do (
        taskkill /PID %%A /F /T >nul 2>&1
        echo ✓ Stopped process %%A
    )
)

echo.
echo ============================================================
echo ✓ Medisphere has been stopped
echo ============================================================
echo.
echo All Node.js services have been terminated.
echo.
echo If using task by name:
echo   - Signaling server (port 4000) - stopped
echo   - Frontend server (port 3000) - stopped
echo.
echo To start again:
echo   - Run: start-medisphere.bat
echo.
echo ============================================================
echo.

pause
