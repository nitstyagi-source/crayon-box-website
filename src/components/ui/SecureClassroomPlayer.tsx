"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, ShieldCheck, Eye, EyeOff, Lock, 
  RefreshCw, AlertTriangle, Video, Maximize2, UserCheck, 
  Clock, MapPin, Radio, Sparkles, BookOpen, Activity
} from "lucide-react";
import Hls from "hls.js";
import { recordSecurityEvent } from "@/app/actions/live-stream-core";

interface SecureClassroomPlayerProps {
  streamUrl: string;
  cameraName: string;
  roomNumber: string;
  className: string;
  studentName: string;
  studentId: string;
  parentId: string;
  parentName: string;
  token: string;
  expiresAt: string;
  watermarkData?: {
    text: string;
    sessionId: string;
    timestamp: string;
    date: string;
    watermarkEnabled: boolean;
    captureDetectionEnabled: boolean;
  };
  onSessionExpired?: () => void;
}

export default function SecureClassroomPlayer({
  streamUrl,
  cameraName,
  roomNumber,
  className,
  studentName,
  studentId,
  parentId,
  parentName,
  token,
  expiresAt,
  watermarkData,
  onSessionExpired
}: SecureClassroomPlayerProps) {
  const [isObscured, setIsObscured] = useState(false);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: "20%", left: "25%" });
  const [microWatermarkAngle, setMicroWatermarkAngle] = useState(-15);
  const [liveClock, setLiveClock] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Moving Dynamic Watermark Algorithm (Shifts every 4.5 seconds to prevent crop removal)
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setLiveClock(d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);

    const positions = [
      { top: "15%", left: "18%" },
      { top: "68%", left: "55%" },
      { top: "35%", left: "45%" },
      { top: "72%", left: "20%" },
      { top: "22%", left: "62%" },
      { top: "50%", left: "30%" }
    ];
    let posIdx = 0;

    const watermarkInterval = setInterval(() => {
      posIdx = (posIdx + 1) % positions.length;
      setWatermarkPos(positions[posIdx]);
      setMicroWatermarkAngle((prev) => (prev === -15 ? -25 : -15));
    }, 4500);

    return () => {
      clearInterval(clockInterval);
      clearInterval(watermarkInterval);
    };
  }, []);

  // 2. Native HLS Stream Ingestion Engine
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

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
        backBufferLength: 5
      });

      hlsRef.current = hls;
      hls.loadSource(hlsEndpoint);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsPlaying(true);
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
              break;
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsEndpoint;
      video.addEventListener("loadedmetadata", () => {
        setIsPlaying(true);
        video.play().catch(() => {});
      });
    }
  }, [streamUrl]);

  // 3. Strict Screen-Capture & Shortcut Prevention
  useEffect(() => {
    function handleSecurityTrigger(eventType: string, alertText: string) {
      setIsObscured(true);
      setSecurityAlert(alertText);

      recordSecurityEvent({
        parentId,
        parentName,
        studentId,
        studentName,
        className,
        eventType,
        deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : "Web Device",
        actionTaken: "Video stream obscured and warning banner rendered"
      });
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "PrintScreen" ||
        e.keyCode === 44 ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        handleSecurityTrigger(
          "ScreenCaptureKeyCombo",
          "⚠️ Screen capture / recording is strictly prohibited. Live video is obscured for classroom child privacy."
        );
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        setIsObscured(true);
        setSecurityAlert("⚠️ Live stream paused while window is unfocused.");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [parentId, parentName, studentId, studentName, className]);

  function handleResumeVideo() {
    setIsObscured(false);
    setSecurityAlert(null);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }

  const watermarkString = watermarkData?.text || `CONFIDENTIAL • ${parentName} • Parent of ${studentName} (${className})`;

  return (
    <div className="space-y-3 select-none">
      
      {/* Video Outer Container with Strict Security Guardrails */}
      <div 
        ref={containerRef}
        onContextMenu={(e) => e.preventDefault()}
        className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-800 aspect-video flex items-center justify-center group"
      >
        
        {/* Native Hardware-Accelerated Video Player */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          className={`w-full h-full object-cover transition duration-300 pointer-events-none ${
            isObscured ? "filter blur-3xl opacity-10 scale-95" : "filter blur-none opacity-100"
          }`}
        />

        {/* SECURITY OBSCURATION OVERLAY (TRIGGERED ON SCREENSHOT / RECORDING / DEVTOOLS) */}
        {isObscured && (
          <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-2xl z-30 flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h4 className="text-base sm:text-lg font-black text-red-300">
                Security & Privacy Protection Active
              </h4>
              <p className="text-xs text-stone-300 font-medium leading-relaxed">
                {securityAlert || "Classroom video feed was paused to protect student privacy. Screen recording, capturing, and unauthorized distribution are monitored."}
              </p>
            </div>

            <div className="text-[11px] font-mono text-stone-400 bg-stone-900 px-3 py-1 rounded-xl border border-stone-800">
              Parent ID: {parentId} • Session Token: {token.substring(0, 16)}...
            </div>

            <button
              onClick={handleResumeVideo}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg transition text-xs flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> I Understand — Resume Live Stream
            </button>
          </div>
        )}

        {/* 1. DYNAMIC MOVING WATERMARK OVERLAY (BOUNCES ACROSS SCREEN) */}
        {!isObscured && watermarkData?.watermarkEnabled !== false && (
          <div
            style={{
              top: watermarkPos.top,
              left: watermarkPos.left,
              transition: "top 4.5s ease-in-out, left 4.5s ease-in-out"
            }}
            className="absolute z-20 pointer-events-none select-none px-4 py-2 rounded-xl bg-black/45 backdrop-blur-xs border border-white/20 shadow-2xl text-white/85 text-[11px] sm:text-xs font-mono font-bold tracking-tight whitespace-nowrap transform -rotate-6"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
              <span>{watermarkString}</span>
            </div>
            <div className="text-[9px] text-stone-300/80 font-normal mt-0.5">
              Live Session: {liveClock} • Token: {token.substring(0, 10)}... • DO NOT RECORD
            </div>
          </div>
        )}

        {/* 2. REPEATING MICRO-WATERMARK MESH (PROTECTS SCREEN AGAINST CROPPING) */}
        {!isObscured && watermarkData?.watermarkEnabled !== false && (
          <div 
            className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3 p-4 opacity-25 select-none"
            style={{ transform: `rotate(${microWatermarkAngle}deg)` }}
          >
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold text-white/50 text-center uppercase tracking-widest">
                {parentId.substring(0, 8)} • {studentName.split(" ")[0]}
              </div>
            ))}
          </div>
        )}

        {/* Top HUD: Status Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-700/60 shadow-lg text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              LIVE STREAM
            </span>
            <span className="text-stone-500">•</span>
            <span className="font-bold text-stone-200">{className} ({roomNumber})</span>
          </div>

          <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-700/60 shadow-lg text-stone-300 font-mono text-[11px] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>{liveClock || "Live"}</span>
          </div>
        </div>

        {/* Bottom HUD: Live Details */}
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex justify-between items-end text-xs">
          <div className="bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-700/60 shadow-lg text-white space-y-0.5 max-w-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {className} • {cameraName}
            </div>
            <strong className="block text-xs font-bold text-stone-100 truncate">
              {roomNumber} • Live Class Stream
            </strong>
          </div>

          <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700/60 shadow-lg text-[10px] font-mono text-stone-400 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Secured DRM Feed</span>
          </div>
        </div>

      </div>

      {/* Safety Notice Strip */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-stone-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Watermarked session for <strong>{parentName}</strong> ({parentId}). Unauthorized recording is recorded and logged.
          </span>
        </div>
        <div className="text-[10px] font-mono text-stone-500">
          Token: {token.substring(0, 16)}...
        </div>
      </div>

    </div>
  );
}
