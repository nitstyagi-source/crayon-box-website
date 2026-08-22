"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Radio, Video, ShieldAlert, RefreshCw, Power, 
  Maximize2, Eye, Signal, AlertTriangle, Play, Sparkles,
  Wifi, CheckCircle2, Lock, Activity, Users, BookOpen, Camera
} from "lucide-react";
import Hls from "hls.js";

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
  const [liveTimestamp, setLiveTimestamp] = useState("");
  const [fps, setFps] = useState(25);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMjpeg, setIsMjpeg] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setLiveTimestamp(d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine stream type & start player
  useEffect(() => {
    if (isPaused) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    if (!streamUrl) return;

    // Check if MJPEG stream (e.g. /api/cameras/.../live or .mjpg or .mjpeg)
    const isMjpegStream = streamUrl.includes("/api/cameras/") || streamUrl.includes("/live") || streamUrl.includes(".mjpg") || streamUrl.includes(".mjpeg");
    setIsMjpeg(isMjpegStream);

    if (isMjpegStream) {
      setIsPlaying(true);
      setHasError(false);
      return;
    }

    // Otherwise handle HLS (.m3u8) Stream
    const video = videoRef.current;
    if (!video) return;

    let hlsEndpoint = streamUrl.trim();
    if (!hlsEndpoint.endsWith(".m3u8")) {
      hlsEndpoint = hlsEndpoint.replace(/\/+$/, "") + "/index.m3u8";
    }

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 5,
        manifestLoadingMaxRetry: 5,
        levelLoadingMaxRetry: 5
      });

      hlsRef.current = hls;
      hls.loadSource(hlsEndpoint);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsPlaying(true);
        setHasError(false);
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setHasError(true);
              break;
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari Native HLS
      video.src = hlsEndpoint;
      video.addEventListener("loadedmetadata", () => {
        setIsPlaying(true);
        setHasError(false);
        video.play().catch(() => {});
      });
      video.addEventListener("error", () => {
        setHasError(true);
      });
    }
  }, [streamUrl, isPaused]);

  // Derive resolved stream source
  const resolvedStreamSrc = streamUrl ? streamUrl.trim() : `/api/cameras/grade5_cam/live`;

  return (
    <div className={`bg-stone-950 text-white rounded-2xl overflow-hidden border shadow-lg flex flex-col justify-between transition ${
      isPaused ? "border-red-500 opacity-80" : "border-stone-800 hover:border-purple-500/80"
    }`}>
      
      {/* Top CCTV Header */}
      <div className="p-3 bg-stone-900/95 flex justify-between items-center text-xs border-b border-stone-800/80 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-900/90 text-purple-200 px-2 py-0.5 rounded">
                {classroomName}
              </span>
              <span className="text-[10px] font-mono text-stone-400">{roomNumber}</span>
            </div>
            <strong className="block text-xs font-bold text-stone-200 mt-0.5 truncate max-w-[170px]">
              {cameraName}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
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

      {/* Main Video Stage (Native Hardware-Accelerated MJPEG / Video Player) */}
      <div className={`relative bg-black overflow-hidden flex items-center justify-center select-none ${
        isSpotlight ? "aspect-video" : "aspect-video"
      }`}>
        
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
        ) : isMjpeg ? (
          /* NATIVE MJPEG HARDWARE-ACCELERATED LIVE STREAM */
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <img
              src={resolvedStreamSrc}
              alt={`${classroomName} Live Feed`}
              className="w-full h-full object-cover select-none"
              onLoad={() => {
                setIsPlaying(true);
                setHasError(false);
              }}
              onError={() => {
                setHasError(true);
              }}
            />
          </div>
        ) : (
          /* NATIVE HLS VIDEO PLAYER */
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-cover select-none"
            />

            {!isPlaying && !hasError && (
              <div className="absolute inset-0 bg-stone-950/80 flex flex-col items-center justify-center space-y-2 text-stone-400">
                <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                <span className="text-[11px] font-mono">Connecting to Live Camera...</span>
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
            <span>640×480</span>
            <span className="text-stone-500">•</span>
            <span className="text-purple-300">{fps} FPS</span>
          </div>
        )}

        {/* CCTV Bottom Left OSD (Hardware Specs) */}
        {!isPaused && (
          <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none bg-black/75 backdrop-blur-xs px-2 py-1 rounded-md text-[9px] font-mono text-stone-300 border border-stone-700/50 flex items-center gap-1.5">
            <Activity className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            <span>HIKVISION RTSP :10554 • {roomNumber}</span>
          </div>
        )}

      </div>

      {/* Bottom Status Strip */}
      <div className="px-3 py-2 bg-stone-900/95 flex justify-between items-center text-[10px] text-stone-400 border-t border-stone-800/80 select-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Signal className="w-3 h-3" />
            {isPlaying ? "Live DVR Stream Active" : "Connecting..."}
          </span>
          <span className="text-stone-600">•</span>
          <span className="font-mono text-[9px] text-stone-400">{roomNumber}</span>
        </div>

        <span className="font-mono text-[9px] text-purple-400">
          DVR 192.168.1.90:10554
        </span>
      </div>

    </div>
  );
}
