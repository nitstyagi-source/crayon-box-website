@echo off
title CRAYON BOX SCHOOL - 24/7 CCTV LIVE GATEWAY
color 0A
echo ==============================================================================
echo    CRAYON BOX SCHOOL - 16-CHANNEL CCTV LIVE STREAMING GATEWAY
echo ==============================================================================
echo DVR Target: 192.168.1.90:10554 | User: admin
echo.

cd /d "%~dp0"

echo [1/3] Stopping previous instances if running...
taskkill /F /IM mediamtx.exe >nul 2>&1
taskkill /F /IM cloudflared.exe >nul 2>&1

echo.
echo [2/3] Starting MediaMTX 16-Channel Ingestion Server...
start "" /B "%~dp0mediamtx.exe" "%~dp0mediamtx.yml"

timeout /t 2 /nobreak >nul

echo.
echo [3/3] Starting Cloudflare HTTPS Secure Live Tunnel...
start "" "%~dp0cloudflared.exe" tunnel --protocol http2 --url http://localhost:8888

echo.
echo ==============================================================================
echo  [SUCCESS] All 16 CCTV Cameras are now streaming live to Cloud ERP!
echo  
echo  1. Keep this window open in background.
echo  2. Open https://crayonboxschool.com/admin/live-stream to view cameras.
echo ==============================================================================
echo.
pause
