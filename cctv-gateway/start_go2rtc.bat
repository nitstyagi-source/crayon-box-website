@echo off
title Crayon Box School - go2rtc 16-Channel CCTV Gateway
echo ==========================================================
echo  Starting Crayon Box School go2rtc 16-Channel CCTV Gateway
echo ==========================================================

cd /d "%~dp0"

if not exist go2rtc.exe (
    echo Downloading go2rtc.exe for Windows...
    curl -L -o go2rtc.exe https://github.com/AlexxIT/go2rtc/releases/latest/download/go2rtc_win64.zip
    tar -xf go2rtc_win64.zip
    del go2rtc_win64.zip
)

echo Starting go2rtc on Port 1984 (WebRTC + MSE + HLS)...
go2rtc.exe -config go2rtc.yaml
pause
