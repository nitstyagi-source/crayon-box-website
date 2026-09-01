#!/usr/bin/env bash
# Crayon Box School - 24/7 CCTV Gateway Launcher for Mac/Linux

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "🚀 Starting Crayon Box School CCTV Streaming Gateway..."

# Kill previous instances
pkill -f "mediamtx" 2>/dev/null || true
pkill -f "cloudflared" 2>/dev/null || true

# Start MediaMTX
if command -v mediamtx &> /dev/null; then
    mediamtx "$DIR/mediamtx.yml" &
else
    /opt/homebrew/bin/mediamtx "$DIR/mediamtx.yml" &
fi

sleep 2

# Start Cloudflare Tunnel
LOG_FILE="$DIR/tunnel.log"
rm -f "$LOG_FILE"

cloudflared tunnel --url http://localhost:8888 > "$LOG_FILE" 2>&1 &

echo "⏳ Waiting for Live Public HTTPS Gateway URL..."

GATEWAY_URL=""
for i in {1..30}; do
    sleep 1
    if [ -f "$LOG_FILE" ]; then
        GATEWAY_URL=$(grep -oE "https://[a-zA-Z0-9-]+\.trycloudflare\.com" "$LOG_FILE" | head -n 1)
        if [ ! -z "$GATEWAY_URL" ]; then
            break
        fi
    fi
done

if [ ! -z "$GATEWAY_URL" ]; then
    echo ""
    echo "============================================================"
    echo "🎉 CCTV LIVE STREAMING GATEWAY ACTIVE & BROADCASTING!"
    echo "🌐 Live Gateway URL: $GATEWAY_URL"
    echo "============================================================"
    echo ""

    # Send heartbeat
    curl -s -X POST -H "Content-Type: application/json" -d "{\"gatewayUrl\":\"$GATEWAY_URL\",\"dvrIp\":\"192.168.1.90\",\"dvrPort\":\"10554\"}" https://crayonboxschool.com/api/gateway/heartbeat > /dev/null 2>&1
    curl -s -X POST -H "Content-Type: application/json" -d "{\"gatewayUrl\":\"$GATEWAY_URL\",\"dvrIp\":\"192.168.1.90\",\"dvrPort\":\"10554\"}" http://localhost:3000/api/gateway/heartbeat > /dev/null 2>&1

    echo "✅ Automatically linked with Crayon Box School ERP Database!"
    echo "💡 You can minimize this window. Cameras are streaming 24/7."
else
    echo "❌ Error: Could not obtain tunnel URL. Check tunnel.log"
fi

wait
