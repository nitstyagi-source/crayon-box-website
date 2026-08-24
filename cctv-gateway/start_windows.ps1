$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  CRAYON BOX SCHOOL - 16-CHANNEL CCTV STREAMING GATEWAY (WINDOWS)" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "🚀 Checking Prerequisites & Initializing CCTV Sidecar..." -ForegroundColor Yellow

# 1. Load Configuration
$configFile = "$ScriptDir\gateway-config.json"
$dvrIp = "192.168.1.90"
$dvrPort = "10554"
$dvrUser = "admin"
$dvrPass = "master123"
$erpEndpoints = @(
    "http://localhost:3000/api/gateway/heartbeat",
    "https://crayonboxschool.com/api/gateway/heartbeat"
)

if (Test-Path $configFile) {
    try {
        $json = Get-Content $configFile -Raw | ConvertFrom-Json
        if ($json.dvr_ip) { $dvrIp = $json.dvr_ip }
        if ($json.dvr_port) { $dvrPort = $json.dvr_port }
        if ($json.dvr_username) { $dvrUser = $json.dvr_username }
        if ($json.dvr_password) { $dvrPass = $json.dvr_password }
        if ($json.erp_heartbeat_urls) { $erpEndpoints = $json.erp_heartbeat_urls }
        Write-Host "✓ Loaded settings from gateway-config.json (DVR: $dvrIp:$dvrPort)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Warning: Failed to parse gateway-config.json, using defaults." -ForegroundColor DarkYellow
    }
}

# 2. Download MediaMTX for Windows if missing
if (-not (Test-Path "$ScriptDir\mediamtx.exe")) {
    Write-Host "📥 Downloading MediaMTX Ingestion Server for Windows..." -ForegroundColor Yellow
    $url = "https://github.com/bluenviron/mediamtx/releases/latest/download/mediamtx_v1.9.3_windows_amd64.zip"
    Invoke-WebRequest -Uri $url -OutFile "$ScriptDir\mediamtx.zip"
    Expand-Archive -Path "$ScriptDir\mediamtx.zip" -DestinationPath "$ScriptDir" -Force
    Remove-Item "$ScriptDir\mediamtx.zip" -ErrorAction SilentlyContinue
    Write-Host "✅ MediaMTX downloaded successfully!" -ForegroundColor Green
}

# 3. Download Cloudflared for Windows if missing
if (-not (Test-Path "$ScriptDir\cloudflared.exe")) {
    Write-Host "📥 Downloading Cloudflare Secure Tunnel for Windows..." -ForegroundColor Yellow
    $url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    Invoke-WebRequest -Uri $url -OutFile "$ScriptDir\cloudflared.exe"
    Write-Host "✅ Cloudflared downloaded successfully!" -ForegroundColor Green
}

# 4. Generate mediamtx.yml with current DVR settings
$channels = @(
    @{ key = "nursery_cam"; ch = "102"; name = "Nursery Play Wing" },
    @{ key = "lkg_cam"; ch = "202"; name = "LKG Activity Room" },
    @{ key = "ukg_cam"; ch = "302"; name = "UKG Classroom" },
    @{ key = "grade1_cam"; ch = "402"; name = "Grade 1 Classroom" },
    @{ key = "grade2_cam"; ch = "502"; name = "Grade 2 Classroom" },
    @{ key = "grade3_cam"; ch = "602"; name = "Grade 3 Classroom" },
    @{ key = "grade4_cam"; ch = "702"; name = "Grade 4 Classroom" },
    @{ key = "grade5_cam"; ch = "802"; name = "Grade 5 Classroom" },
    @{ key = "grade6_cam"; ch = "902"; name = "Grade 6 Classroom" },
    @{ key = "grade7_cam"; ch = "1002"; name = "Grade 7 Classroom" },
    @{ key = "grade8_cam"; ch = "1102"; name = "Grade 8 Classroom" },
    @{ key = "grade9_cam"; ch = "1202"; name = "Grade 9 Classroom" },
    @{ key = "grade10_cam"; ch = "1302"; name = "Grade 10 Board Room" },
    @{ key = "science_lab"; ch = "1402"; name = "Science & Bio Laboratory" },
    @{ key = "computer_lab"; ch = "1502"; name = "AI & Robotics Tech Hub" },
    @{ key = "activity_hall"; ch = "1602"; name = "Indoor Sports & Activity Hall" }
)

$ymlContent = @"
# MediaMTX Configuration for Crayon Box School 16-Channel CCTV Gateway
# DVR Target: $dvrIp:$dvrPort | Auth: $dvrUser

logLevel: info
logDestinations: [stdout]

rtsp: no
rtmp: no
webrtc: no
srt: no

hls: yes
hlsAddress: :8888
hlsVariant: mpegts
hlsSegmentCount: 5
hlsSegmentDuration: 1s
hlsAlwaysRemux: yes

paths:
"@

foreach ($c in $channels) {
    $ymlContent += @"

  $($c.key):
    source: rtsp://$dvrUser`:$dvrPass@$dvrIp`:$dvrPort/Streaming/Channels/$($c.ch)
    rtspTransport: tcp
"@
}

Set-Content -Path "$ScriptDir\mediamtx.yml" -Value $ymlContent
Write-Host "✓ Generated mediamtx.yml with 16 mapped RTSP camera paths." -ForegroundColor Green

# 5. Terminate previous running instances
Stop-Process -Name "mediamtx" -ErrorAction SilentlyContinue
Stop-Process -Name "cloudflared" -ErrorAction SilentlyContinue

# 6. Start MediaMTX Ingestion Server
Write-Host "▶️ Starting MediaMTX 16-Channel Ingestion Server on Port 8888..." -ForegroundColor Green
Start-Process -FilePath "$ScriptDir\mediamtx.exe" -ArgumentList "$ScriptDir\mediamtx.yml" -WindowStyle Hidden

Start-Sleep -Seconds 2

# 7. Start Cloudflare Tunnel
Write-Host "🌐 Opening Secure Outbound Cloudflare Tunnel..." -ForegroundColor Green
$logFile = "$ScriptDir\tunnel.log"
if (Test-Path $logFile) { Remove-Item $logFile }

$tunnelProc = Start-Process -FilePath "$ScriptDir\cloudflared.exe" -ArgumentList "tunnel --url http://localhost:8888" -RedirectStandardError $logFile -WindowStyle Hidden -PassThru

Write-Host "⏳ Establishing HTTPS Bridge to Crayon Box Cloud ERP..." -ForegroundColor Yellow

$gatewayUrl = ""
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw
        if ($content -match "https://[a-zA-Z0-9-]+\.trycloudflare\.com") {
            $gatewayUrl = $matches[0]
            break
        }
    }
}

if ($gatewayUrl) {
    Write-Host "`n======================================================================" -ForegroundColor Cyan
    Write-Host "🎉 16-CHANNEL CCTV LIVE STREAMING GATEWAY ACTIVE & BROADCASTING!" -ForegroundColor Green
    Write-Host "🌐 Public HTTPS Gateway URL: $gatewayUrl" -ForegroundColor White
    Write-Host "======================================================================`n" -ForegroundColor Cyan

    # Send automated heartbeat to Cloud ERP
    foreach ($ep in $erpEndpoints) {
        try {
            $body = @{ 
                gatewayUrl = $gatewayUrl
                dvrIp = $dvrIp
                dvrPort = $dvrPort
            } | ConvertTo-Json
            $response = Invoke-RestMethod -Uri $ep -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10
            Write-Host "✅ Synced with ERP: $ep" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Note: Could not sync to $ep (offline or unreachable)" -ForegroundColor DarkGray
        }
    }

    Write-Host "`n💡 All 16 cameras are live streaming 24/7. You can minimize this window." -ForegroundColor Yellow
} else {
    Write-Host "❌ Error: Could not obtain tunnel URL. Check internet connection and tunnel.log" -ForegroundColor Red
}

# Keep script running in monitoring loop
while ($true) {
    Start-Sleep -Seconds 30
}
