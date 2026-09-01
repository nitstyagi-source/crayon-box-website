@echo off
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [!] Administrator privileges required. Requesting elevation...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

title Remove Crayon Box CCTV Auto-Start
echo Removing Crayon Box CCTV Scheduled Task...
powershell -Command "Unregister-ScheduledTask -TaskName 'CrayonBox_CCTV_Gateway_Service' -Confirm:$false -ErrorAction SilentlyContinue"
taskkill /F /IM mediamtx.exe 2>nul
taskkill /F /IM cloudflared.exe 2>nul
echo Auto-Start Task removed.
pause
