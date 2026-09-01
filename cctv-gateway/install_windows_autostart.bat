@echo off
setlocal EnableDelayedExpansion
title Crayon Box CCTV Gateway - 24/7 Auto-Start Setup

cd /d "%~dp0"
set "GATEWAY_DIR=%~dp0"
if "%GATEWAY_DIR:~-1%"=="\" set "GATEWAY_DIR=%GATEWAY_DIR:~0,-1%"

echo ==============================================================================
echo    CRAYON BOX SCHOOL - 24/7 CCTV GATEWAY AUTO-START SERVICE SETUP
echo ==============================================================================
echo Folder: %GATEWAY_DIR%
echo.

echo [1/3] Registering 24/7 Auto-Start Task in Windows Task Scheduler...
schtasks /create /tn "CrayonBox_CCTV_Gateway" /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%GATEWAY_DIR%\start_windows.ps1\"" /sc onstart /ru "SYSTEM" /rl highest /f >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [i] Registering on-logon task for user account...
    schtasks /create /tn "CrayonBox_CCTV_Gateway" /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%GATEWAY_DIR%\start_windows.ps1\"" /sc onlogon /rl highest /f >nul 2>&1
) else (
    echo [OK] Registered as High-Priority SYSTEM Service (Runs on boot before login).
)

echo.
echo [2/3] Adding Windows Startup folder launcher...
set STARTUP_BAT=%appdata%\Microsoft\Windows\Start Menu\Programs\Startup\CrayonBox_CCTV_Autostart.bat
echo @echo off > "%STARTUP_BAT%"
echo start /min powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "%GATEWAY_DIR%\start_windows.ps1" >> "%STARTUP_BAT%"
echo [OK] Startup launcher created!

echo.
echo [3/3] Starting CCTV Gateway live streaming now...
start /min powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "%GATEWAY_DIR%\start_windows.ps1"

echo.
echo ==============================================================================
echo [SUCCESS] 24/7 Auto-Recovery Service is Installed and Running!
echo.
echo - The camera gateway will automatically start whenever this laptop boots up.
echo - If the laptop restarts, streams will auto-resume in 30 seconds.
echo ==============================================================================
echo.
pause
