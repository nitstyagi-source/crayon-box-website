@echo off
setlocal EnableDelayedExpansion
title Crayon Box CCTV Gateway - Diagnostic Mode
color 0F

echo ==============================================================================
echo    CRAYON BOX SCHOOL - CCTV GATEWAY DIAGNOSTIC RUNNER
echo ==============================================================================
echo Directory: %~dp0
echo.

cd /d "%~dp0"

echo [1/4] Unblocking downloaded executables (Windows Defender / SmartScreen)...
powershell -Command "Get-ChildItem -Path '%~dp0' | Unblock-File" 2>nul
echo [OK] Files unblocked.

echo.
echo [2/4] Checking file integrity:
if exist "%~dp0mediamtx.exe" (
    echo  - mediamtx.exe FOUND
) else (
    echo  - [ERROR] mediamtx.exe MISSING!
)

if exist "%~dp0cloudflared.exe" (
    echo  - cloudflared.exe FOUND
) else (
    echo  - [ERROR] cloudflared.exe MISSING!
)

if exist "%~dp0mediamtx.yml" (
    echo  - mediamtx.yml FOUND
) else (
    echo  - [ERROR] mediamtx.yml MISSING!
)

echo.
echo [3/4] Testing network reachability to DVR (192.168.1.90)...
ping -n 2 192.168.1.90
echo.

echo [4/4] Launching MediaMTX in FOREGROUND mode to view live logs:
echo ------------------------------------------------------------------------------
"%~dp0mediamtx.exe" "%~dp0mediamtx.yml"
echo ------------------------------------------------------------------------------
echo.
echo [!] MediaMTX exited. Check output above for errors.
echo.
cmd /k
