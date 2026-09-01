#!/bin/bash
echo "=========================================================="
echo " Starting Crayon Box School go2rtc 16-Channel CCTV Gateway"
echo "=========================================================="

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Download go2rtc binary if not present
if [ ! -f "./go2rtc" ]; then
  ARCH=$(uname -m)
  echo "Downloading go2rtc for $ARCH..."
  if [ "$ARCH" = "arm64" ]; then
    curl -L -o go2rtc https://github.com/AlexxIT/go2rtc/releases/latest/download/go2rtc_mac_arm64
  else
    curl -L -o go2rtc https://github.com/AlexxIT/go2rtc/releases/latest/download/go2rtc_mac_amd64
  fi
  chmod +x go2rtc
fi

echo "Starting go2rtc with go2rtc.yaml..."
./go2rtc -config go2rtc.yaml
