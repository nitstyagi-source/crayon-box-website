"use client";

import { useState, useEffect } from "react";
import { 
  Radio, Video, ShieldAlert, RefreshCw, Power, 
  Maximize2, Eye, Signal, AlertTriangle, Play, Sparkles,
  Wifi, CheckCircle2, Lock, Activity, Users, BookOpen, Camera
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
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setLiveTimestamp(d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine iframe vs mjpeg URL
  let resolvedUrl = streamUrl ? streamUrl.trim() : "";
  const isMjpeg = resolvedUrl.startsWith("/api/cameras/");

  let iframeSrc = "";
  if (!isMjpeg && resolvedUrl) {
    let clean = resolvedUrl.replace(/\/index\.m3u8\??.*$/, "");
    if (!clean.endsWith("/")) clean += "/";
    iframeSrc = `${clean}?autoplay=true&muted=true&controls=false`;
  }

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

      {/* Main Video Stage */}
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
          /* Native MJPEG Live Stream */
          <img
            src={resolvedUrl}
            alt={`${classroomName} Live Feed`}
            className="w-full h-full object-cover select-none"
          />
        ) : iframeSrc ? (
          /* Direct Embedded MediaMTX / Cloudflare Stream Iframe */
          <div className="w-full h-full relative">
            <iframe
              src={iframeSrc}
              title={`${classroomName} Live Feed`}
              allow="autoplay; encrypted-media; fullscreen"
              className="w-full h-full border-0 pointer-events-auto select-none bg-black"
              onLoad={() => setIsIframeLoaded(true)}
            />
            {!isIframeLoaded && (
              <div className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center space-y-2 text-stone-400 pointer-events-none">
                <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                <span className="text-[11px] font-mono">Connecting to Live Camera...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-4 text-stone-500 text-xs">
            No live camera feed URL available.
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
            Live DVR Stream Active
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
