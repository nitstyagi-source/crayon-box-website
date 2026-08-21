"use client";

import { useState, useEffect } from "react";
import { 
  Radio, Video, ShieldAlert, RefreshCw, Power, 
  Maximize2, Eye, Signal, AlertTriangle, Play, Sparkles
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
  const [hasError, setHasError] = useState(false);
  const [useSimulation, setUseSimulation] = useState(false);
  const [liveTimestamp, setLiveTimestamp] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setLiveTimestamp(d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Demo classroom video loop when DVR is not directly reachable over public cloud
  const sampleVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className={`bg-stone-950 text-white rounded-2xl overflow-hidden border shadow-sm flex flex-col justify-between transition ${
      isPaused ? "border-red-500 opacity-75" : "border-stone-800 hover:border-purple-500"
    }`}>
      
      {/* Top HUD Header */}
      <div className="p-3 bg-stone-900/90 flex justify-between items-center text-xs border-b border-stone-800">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-purple-900/90 text-purple-200 px-2 py-0.5 rounded">
            {classroomName}
          </span>
          <strong className="block text-xs font-bold text-stone-200 mt-1 truncate max-w-[170px]">
            {roomNumber} • {cameraName}
          </strong>
        </div>

        <div className="flex items-center gap-1.5">
          {onSpotlight && (
            <button
              type="button"
              onClick={onSpotlight}
              className="p-1.5 bg-stone-800 hover:bg-purple-600 rounded-lg text-stone-300 hover:text-white transition"
              title="Spotlight Full View"
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
              title={isPaused ? "Resume Feed" : "Pause Camera"}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Video Stream Stage */}
      <div className={`relative bg-black overflow-hidden flex items-center justify-center ${
        isSpotlight ? "aspect-video" : "aspect-video"
      }`}>
        
        {isPaused ? (
          /* Stream Paused State */
          <div className="text-center p-6 space-y-2 z-10">
            <ShieldAlert className="w-8 h-8 text-red-400 mx-auto animate-pulse" />
            <span className="text-xs font-black text-red-300 block uppercase tracking-wider">
              Stream Paused by Admin
            </span>
            <p className="text-[10px] text-stone-400">Classroom feed is temporarily offline for privacy/exams.</p>
          </div>
        ) : useSimulation ? (
          /* High-Quality Simulated Classroom Loop */
          <video
            src={sampleVideoUrl}
            autoPlay
            playsInline
            muted
            loop
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          /* Direct Web Stream Embed */
          <iframe
            src={streamUrl}
            title={cameraName}
            onError={() => setHasError(true)}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        )}

        {/* CCTV OSD Overlay (Time, Channel, Live Status) */}
        <div className="absolute top-2 left-2 z-20 pointer-events-none flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>LIVE • {liveTimestamp || "13:40:00"}</span>
        </div>

        <div className="absolute bottom-2 left-2 z-20 pointer-events-none bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-stone-300">
          DVR 192.168.1.90:10554 • {roomNumber}
        </div>

      </div>

      {/* Bottom Mode Switcher */}
      <div className="p-2 bg-stone-950 flex justify-between items-center text-[10px] text-stone-400 border-t border-stone-800">
        <span className="flex items-center gap-1">
          <Signal className="w-3 h-3 text-emerald-400" />
          {useSimulation ? "Simulation Preview" : "Hikvision RTSP Port 10554"}
        </span>

        <button
          type="button"
          onClick={() => setUseSimulation(!useSimulation)}
          className={`px-2 py-0.5 rounded font-bold transition text-[10px] ${
            useSimulation 
              ? "bg-purple-900 text-purple-200 border border-purple-700" 
              : "bg-stone-800 text-stone-300 hover:bg-stone-700"
          }`}
        >
          {useSimulation ? "Switch to Live DVR" : "Test Simulation"}
        </button>
      </div>

    </div>
  );
}
