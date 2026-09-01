"use client";

import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { 
  Radio, Video, ShieldAlert, RefreshCw, Power, 
  Maximize2, Eye, Signal, AlertTriangle, Play, Sparkles,
  Wifi, CheckCircle2, Lock, Activity, Users, BookOpen, Camera,
  Volume2, VolumeX, Zap, Settings
} from "lucide-react";

interface CctvStreamPlayerProps {
  streamUrl: string;
  cameraName: string;
  roomNumber: string;
  classroomName: string;
  isPaused?: boolean;
  onTogglePause?: () => void;
  onSpotlight?: () => void;
  isSpotlight?: boolean;
}

const CAM_CHANNEL_MAP: Record<string, string> = {
  nursery_cam: "102",
  lkg_cam: "202",
  ukg_cam: "302",
  grade1_cam: "402",
  grade2_cam: "502",
  grade3_cam: "602",
  grade4_cam: "702",
  grade5_cam: "802",
  grade6_cam: "902",
  grade7_cam: "1002",
  grade8_cam: "1102",
  grade9_cam: "1202",
  grade10_cam: "1302",
  science_lab: "1402",
  computer_lab: "1502",
  activity_hall: "1602",
};

export default function CctvStreamPlayer({
  streamUrl,
  cameraName,
  roomNumber,
  classroomName,
  isPaused = false,
  onTogglePause,
  onSpotlight,
  isSpotlight = false
}: CctvStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [liveTimestamp, setLiveTimestamp] = useState("");
  const [streamMode, setStreamMode] = useState<"WEBRTC" | "HLS" | "PROXY">("WEBRTC");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [fps, setFps] = useState(25);
  const [gatewayHost, setGatewayHost] = useState("192.168.1.50");
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Live timestamp timer & load gateway host
  useEffect(() => {
    const saved = localStorage.getItem("cctv_gateway_host");
    if (saved) setGatewayHost(saved);

    const timer = setInterval(() => {
      const d = new Date();
      setLiveTimestamp(d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute camera path name from streamUrl or roomNumber
  const resolvedUrl = streamUrl ? streamUrl.trim() : "";
  const matchCam = resolvedUrl.match(/[\/:]([a-zA-Z0-9_-]+)(?:\/index\.m3u8|\/whep|\/)?$/);
  const camPath = matchCam ? matchCam[1] : (roomNumber ? roomNumber.toLowerCase().replace(/[^a-z0-9]/g, "_") : "nursery_cam");
  const channelCode = CAM_CHANNEL_MAP[camPath] || (roomNumber ? roomNumber.replace(/[^0-9]/g, "") || "102" : "102");

  // Determine base gateway endpoint
  let baseGateway = gatewayHost.trim();
  if (!baseGateway.startsWith("http://") && !baseGateway.startsWith("https://")) {
    baseGateway = `http://${baseGateway}`;
  }

  // Construct go2rtc & MediaMTX endpoints
  const isGo2RtcPort = baseGateway.includes(":1984");
  const go2rtcHost = isGo2RtcPort ? baseGateway : baseGateway.replace(/:\d+$/, "") + ":1984";

  const webrtcUrl = resolvedUrl.startsWith("http") && resolvedUrl.includes("/webrtc")
    ? resolvedUrl
    : `${go2rtcHost}/api/webrtc?src=${camPath}`;

  const hlsUrl = resolvedUrl.startsWith("http") && resolvedUrl.includes(".m3u8")
    ? resolvedUrl
    : `${go2rtcHost}/api/stream.m3u8?src=${camPath}`;

  const proxyUrl = `/api/cctv/stream?channel=${channelCode}`;

  // Start Video Stream with auto-failover
  useEffect(() => {
    if (isPaused) {
      cleanupStream();
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    // Timeout: if current mode doesn't play within 3 seconds, auto-fallback
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isPlaying && !isCancelled) {
        if (streamMode === "WEBRTC") {
          setStreamMode("HLS");
        } else if (streamMode === "HLS") {
          setStreamMode("PROXY");
        }
      }
    }, 3000);

    async function initStream() {
      if (streamMode === "WEBRTC") {
        try {
          await startWebRTCStream();
        } catch (err: any) {
          if (!isCancelled) setStreamMode("HLS");
        }
      } else if (streamMode === "HLS") {
        startHlsStream();
      } else if (streamMode === "PROXY") {
        cleanupStream();
        setIsLoading(false);
      }
    }

    initStream();

    return () => {
      isCancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cleanupStream();
    };
  }, [streamMode, camPath, isPaused, gatewayHost, resolvedUrl]);

  const cleanupStream = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = "";
    }
    setIsPlaying(false);
  };

  // 1. go2rtc WebRTC Ultra-Low-Latency Stream Initiator (<200ms)
  const startWebRTCStream = async () => {
    cleanupStream();

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });
    peerConnectionRef.current = pc;

    pc.ontrack = (event) => {
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
        setIsLoading(false);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
        setStreamMode("HLS");
      }
    };

    pc.addTransceiver("video", { direction: "recvonly" });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Send SDP Offer to go2rtc WebRTC endpoint
    const res = await fetch(webrtcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/sdp" },
      body: offer.sdp
    });

    if (!res.ok) throw new Error(`go2rtc WebRTC returned ${res.status}`);

    const answerSdp = await res.text();
    await pc.setRemoteDescription(new RTCSessionDescription({
      type: "answer",
      sdp: answerSdp
    }));
  };

  // 2. HLS.js Low-Latency Stream Initiator
  const startHlsStream = () => {
    cleanupStream();
    if (!videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 3,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 0
      });
      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(() => {});
        setIsPlaying(true);
        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setStreamMode("PROXY");
        }
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = hlsUrl;
      videoRef.current.addEventListener("loadedmetadata", () => {
        videoRef.current?.play().catch(() => {});
        setIsPlaying(true);
        setIsLoading(false);
      });
    } else {
      setStreamMode("PROXY");
    }
  };

  return (
    <div className={`bg-stone-950 text-white rounded-2xl overflow-hidden border shadow-lg flex flex-col justify-between transition ${
      isPaused ? "border-red-500 opacity-80" : "border-stone-800 hover:border-purple-500/80"
    }`}>
      
      {/* Top CCTV Header */}
      <div className="p-3 bg-stone-900/95 flex justify-between items-center text-xs border-b border-stone-800/80 select-none">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${
            isPlaying ? "bg-emerald-400 animate-ping" : "bg-amber-400"
          }`} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-900/90 text-purple-200 px-2 py-0.5 rounded">
                {classroomName}
              </span>
              <span className="text-[10px] font-mono text-stone-400">{roomNumber}</span>
              
              {/* Protocol Badge */}
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                streamMode === "WEBRTC" 
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40" 
                  : streamMode === "HLS"
                  ? "bg-blue-950 text-blue-300 border border-blue-500/40"
                  : "bg-amber-950 text-amber-300 border border-amber-500/40"
              }`}>
                {streamMode === "WEBRTC" ? "⚡ WebRTC <0.5s" : streamMode === "HLS" ? "📡 HLS 25FPS" : "🎥 Direct NVR Stream"}
              </span>
            </div>
            <strong className="block text-xs font-bold text-stone-200 mt-0.5 truncate max-w-[170px]">
              {cameraName}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Stream Mode Switcher */}
          <button
            type="button"
            onClick={() => {
              const nextMode = streamMode === "WEBRTC" ? "HLS" : streamMode === "HLS" ? "PROXY" : "WEBRTC";
              setStreamMode(nextMode);
            }}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[10px] font-bold transition flex items-center gap-1"
            title="Switch Stream Engine"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            {streamMode === "WEBRTC" ? "WebRTC" : streamMode === "HLS" ? "HLS" : "Proxy"}
          </button>

          {/* Gateway Config Toggle */}
          <button
            type="button"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-300 transition"
            title="Gateway Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
              }
            }}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-300 transition"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {onSpotlight && (
            <button
              type="button"
              onClick={onSpotlight}
              className="p-1.5 bg-stone-800 hover:bg-purple-600 rounded-lg text-stone-300 hover:text-white transition"
              title="Expand Camera View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onTogglePause && (
            <button
              type="button"
              onClick={onTogglePause}
              className={`p-1.5 rounded-lg transition ${
                isPaused ? "bg-emerald-600 text-white" : "bg-red-600/80 hover:bg-red-600 text-white"
              }`}
              title={isPaused ? "Resume Live Stream" : "Pause Camera"}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Gateway Settings Inline Drawer */}
      {isConfigOpen && (
        <div className="p-3 bg-stone-900 border-b border-stone-800 flex items-center gap-2">
          <span className="text-[10px] text-stone-400 font-bold whitespace-nowrap">Gateway IP:</span>
          <input
            type="text"
            value={gatewayHost}
            onChange={(e) => {
              setGatewayHost(e.target.value);
              localStorage.setItem("cctv_gateway_host", e.target.value);
            }}
            placeholder="192.168.1.50 or streaming.domain.com"
            className="bg-stone-950 border border-stone-700 text-white text-xs px-2 py-1 rounded flex-1 font-mono"
          />
          <button
            onClick={() => setIsConfigOpen(false)}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold"
          >
            Apply
          </button>
        </div>
      )}

      {/* Main Video Stage */}
      <div className="relative bg-black overflow-hidden flex items-center justify-center select-none aspect-video">
        
        {isPaused ? (
          /* Stream Paused Screen */
          <div className="text-center p-6 space-y-2 z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xs font-black text-red-300 block uppercase tracking-wider">
              Classroom Stream Paused
            </span>
            <p className="text-[10px] text-stone-400">Feed is offline for student privacy / examination hours.</p>
          </div>
        ) : streamMode === "PROXY" ? (
          /* Direct NVR Live Stream Proxy with Offline Fallback */
          <div className="w-full h-full relative bg-stone-950 flex items-center justify-center">
            <img
              src={proxyUrl}
              alt={`${classroomName} Live Feed`}
              className="w-full h-full object-cover select-none"
              onLoad={() => {
                setIsPlaying(true);
                setIsLoading(false);
              }}
              onError={() => {
                setIsPlaying(false);
                setIsLoading(false);
              }}
            />
            {!isPlaying && !isLoading && (
              <div className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Local NVR Feed Offline / Gateway Unreachable
                  </h4>
                  <p className="text-[10px] text-stone-400 max-w-sm mt-1">
                    To view 25 FPS live streams from the cloud, run <code className="text-purple-300 font-mono">start_both_windows.bat</code> on the school network PC or enter your Gateway / Tunnel URL in Settings.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsConfigOpen(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <Settings className="w-3 h-3" /> Set Gateway URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      setStreamMode("WEBRTC");
                    }}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-[10px] font-bold transition flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Stream
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Real-Time HTML5 Video Player (Hardware Accelerated WebRTC / HLS) */
          <div className="w-full h-full relative bg-stone-950 flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover bg-black select-none pointer-events-auto"
              onPlaying={() => {
                setIsPlaying(true);
                setIsLoading(false);
              }}
              onWaiting={() => setIsLoading(true)}
            />

            {/* Loading / Buffering Overlay */}
            {isLoading && !isPaused && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-10">
                <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-emerald-400 animate-spin mb-2" />
                <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider uppercase">
                  Connecting {streamMode} Stream...
                </span>
                <span className="text-[9px] font-mono text-stone-400 mt-0.5">
                  Hikvision NVR → MediaMTX Gateway ({gatewayHost})
                </span>
              </div>
            )}
          </div>
        )}

        {/* CCTV Top Left OSD (Live Clock + Recording) */}
        {!isPaused && (
          <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none flex items-center gap-1.5 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="font-bold tracking-wider">REC • LIVE {liveTimestamp || "14:15:00"}</span>
          </div>
        )}

        {/* CCTV Top Right OSD (Resolution & FPS) */}
        {!isPaused && (
          <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none bg-black/75 backdrop-blur-xs px-2 py-1 rounded-md text-[9px] font-mono text-stone-300 border border-stone-700/50 flex items-center gap-2">
            <span>1080p HD</span>
            <span className="text-stone-500">•</span>
            <span className="text-purple-300">{fps} FPS</span>
          </div>
        )}

        {/* CCTV Bottom Left OSD (Hardware Specs) */}
        {!isPaused && (
          <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none bg-black/75 backdrop-blur-xs px-2 py-1 rounded-md text-[9px] font-mono text-stone-300 border border-stone-700/50 flex items-center gap-1.5">
            <Activity className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            <span>NVR 192.168.1.90 • {camPath}</span>
          </div>
        )}

      </div>

      {/* Bottom Status Strip */}
      <div className="px-3 py-2 bg-stone-900/95 flex justify-between items-center text-[10px] text-stone-400 border-t border-stone-800/80 select-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Signal className="w-3 h-3" />
            {streamMode === "WEBRTC" ? "WebRTC Low-Latency" : streamMode === "HLS" ? "HLS Live Stream" : "Live Proxy Stream"}
          </span>
          <span className="text-stone-600">•</span>
          <span className="font-mono text-[9px] text-stone-400">{roomNumber}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            cleanupStream();
            setStreamMode("PROXY");
          }}
          className="text-stone-400 hover:text-white flex items-center gap-1 text-[9px] font-mono transition"
        >
          <RefreshCw className="w-2.5 h-2.5" /> Direct Proxy
        </button>
      </div>

    </div>
  );
}
