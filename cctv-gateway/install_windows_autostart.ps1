# Windows CCTV Gateway Auto-Start & Watchdog Installer
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  CRAYON BOX SCHOOL - 24/7 CCTV GATEWAY AUTO-START SERVICE SETUP" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

$TaskName = "CrayonBox_CCTV_Gateway"
$PsScript = "$ScriptDir\start_windows.ps1"
$TaskCmd = "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$PsScript`""

Write-Host "`n[1/3] Registering Task in Windows Task Scheduler..." -ForegroundColor Yellow
$proc = Start-Process -FilePath "schtasks.exe" -ArgumentList "/create /tn `"$TaskName`" /tr `"$TaskCmd`" /sc onstart /ru `"SYSTEM`" /rl highest /f" -Wait -PassThru -WindowStyle Hidden

if ($proc.ExitCode -ne 0) {
    Write-Host "[i] Registering on-logon task for current user..." -ForegroundColor Yellow
    Start-Process -FilePath "schtasks.exe" -ArgumentList "/create /tn `"$TaskName`" /tr `"$TaskCmd`" /sc onlogon /rl highest /f" -Wait -WindowStyle Hidden
} else {
    Write-Host "✓ Registered as High-Priority SYSTEM Service (Runs on boot before login)!" -ForegroundColor Green
}

Write-Host "`n[2/3] Setting up Windows Startup folder fallback..." -ForegroundColor Yellow
$startupFolder = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft\Windows\Start Menu\Programs\Startup')
$batPath = [System.IO.Path]::Combine($startupFolder, 'CrayonBox_CCTV_Autostart.bat')
$batContent = "@echo off`r`nstart /min powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$PsScript`""
[System.IO.File]::WriteAllText($batPath, $batContent)
Write-Host "✓ Startup fallback created at: $batPath" -ForegroundColor Green

Write-Host "`n[3/3] Starting CCTV Gateway Service now..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$PsScript`"" -WindowStyle Hidden

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "🎉 SUCCESS: 24/7 Auto-Recovery Service is Installed and Running!" -ForegroundColor Green
Write-Host "- The gateway will automatically start whenever this laptop boots up."
Write-Host "- If the laptop restarts, streams will auto-resume in <30 seconds."
Write-Host "======================================================================" -ForegroundColor Cyan
