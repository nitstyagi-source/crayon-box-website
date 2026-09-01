@echo off
title CRAYON BOX SCHOOL - 24/7 CCTV LIVE GATEWAY
color 0B

echo ==============================================================================
echo    CRAYON BOX SCHOOL - 16-CHANNEL CCTV LIVE STREAMING GATEWAY
echo ==============================================================================
echo DVR Target: 192.168.1.90:10554 | User: admin
echo.

cd /d "%~dp0"

echo [1/2] Launching MediaMTX RTSP-to-HLS Video Transcoder...
start "MediaMTX Video Server" cmd /k ""%~dp0mediamtx.exe" "%~dp0mediamtx.yml""

timeout /t 2 /nobreak >nul

echo [2/2] Launching Cloudflare Secure HTTPS Cloud Tunnel...
start "Cloudflare Secure Tunnel" cmd /k ""%~dp0cloudflared.exe" tunnel --protocol http2 --url http://localhost:8888"

echo.
echo ==============================================================================
echo  [SUCCESS] Both Video Server & Cloud Tunnel are running!
echo  
echo  1. In the Cloudflare window, find your "https://xxxx.trycloudflare.com" link.
echo  2. Open https://crayonboxschool.com/admin/live-stream to view cameras live!
echo ==============================================================================
echo.
pause
