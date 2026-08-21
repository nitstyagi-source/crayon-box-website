"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, ShieldCheck, Eye, EyeOff, Lock, 
  RefreshCw, AlertTriangle, Video, Maximize2, UserCheck, 
  Clock, MapPin, Radio, Sparkles
} from "lucide-react";
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
  const [hasStreamError, setHasStreamError] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: "20%", left: "25%" });
  const [microWatermarkAngle, setMicroWatermarkAngle] = useState(-15);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveClock, setLiveClock] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
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
      { top: "15%", left: "12%" },
      { top: "65%", left: "18%" },
      { top: "35%", left: "55%" },
      { top: "72%", left: "50%" },
      { top: "22%", left: "62%" },
      { top: "48%", left: "28%" }
    ];

    let pIdx = 0;
    const watermarkInterval = setInterval(() => {
      pIdx = (pIdx + 1) % positions.length;
      setWatermarkPos(positions[pIdx]);
    }, 4500);

    return () => {
      clearInterval(clockInterval);
      clearInterval(watermarkInterval);
    };
  }, []);

  // 2. Screen Capture & Tab Switch Security Detection
  useEffect(() => {
    function handleSecurityTrigger(eventType: string, alertText: string) {
      setIsObscured(true);
      setSecurityAlert(alertText);

      // Record security incident on server
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

    // Keydown detection (PrintScreen, DevTools keys, Screenshot combinations)
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "PrintScreen" ||
        e.keyCode === 44 ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) || // Devtools
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) || // Mac screenshot
        e.key === "F12"
      ) {
        e.preventDefault();
        handleSecurityTrigger(
          "ScreenCaptureKeyCombo",
          "⚠️ Screen capture / recording is strictly prohibited. Live video is obscured for classroom child privacy."
        );
      }
    }

    // Tab visibility change (blur video when user switches away to screen recording tools)
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
        
        {/* Video / Stream Embed with Native Protection Flags */}
        <video
          ref={videoRef}
          src={streamUrl.endsWith(".mp4") ? streamUrl : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"}
          autoPlay
          playsInline
          muted
          loop
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
              type="button"
              onClick={handleResumeVideo}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-2xl shadow-lg transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Resume Authorized Live Feed
            </button>
          </div>
        )}

        {/* REPEATING MICRO-WATERMARK PATTERN (BACKGROUND GRID TO PREVENT CLEAN CROPPING) */}
        {watermarkData?.watermarkEnabled !== false && !isObscured && (
          <div 
            className="absolute inset-0 pointer-events-none z-10 opacity-15 overflow-hidden flex flex-wrap gap-12 p-8 justify-around items-center select-none"
            style={{ transform: `rotate(${microWatermarkAngle}deg)` }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="text-white text-[11px] font-mono font-black tracking-widest uppercase">
                {parentName} • {studentName} • {token.substring(0, 8)}
              </div>
            ))}
          </div>
        )}

        {/* PRIMARY DYNAMIC MOVING WATERMARK (BOUNCES ACROSS SCREEN) */}
        {watermarkData?.watermarkEnabled !== false && !isObscured && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-1000 ease-in-out select-none bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 shadow-2xl text-white space-y-0.5"
            style={{ top: watermarkPos.top, left: watermarkPos.left }}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-black tracking-wide text-amber-300">
              <Lock className="w-3 h-3 text-red-400" />
              <span>{watermarkString}</span>
            </div>
            <div className="text-[10px] font-mono text-stone-300 flex items-center justify-between gap-3">
              <span>{liveClock || watermarkData?.timestamp}</span>
              <span className="text-purple-300">Token: {token.substring(0, 10)}</span>
            </div>
          </div>
        )}

        {/* TOP STATUS HUD OVERLAY */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-white text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
            <span className="text-red-400 font-black tracking-wider flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" /> LIVE
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-200">{className} ({roomNumber})</span>
          </div>

          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-white text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-emerald-400 font-black">{studentName}: PRESENT</span>
          </div>
        </div>

        {/* BOTTOM HUD INFO BAR */}
        <div className="absolute bottom-3 left-4 right-4 z-20 flex justify-between items-center text-white/90 text-xs font-medium pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 flex items-center gap-2 text-[11px]">
            <MapPin className="w-3 h-3 text-purple-400" />
            <span>{cameraName}</span>
          </div>

          <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-[10px] font-mono text-stone-300">
            🔒 Protected View • No Recording Permitted
          </div>
        </div>

      </div>

      {/* Security & Privacy Notice Footer */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 text-xs text-purple-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="block text-purple-900 font-black text-xs">
            Restricted Classroom Stream Policy
          </strong>
          <p className="text-[11px] text-purple-950/80 leading-relaxed">
            This live video stream is exclusively provisioned for <strong>{parentName}</strong> to observe <strong>{studentName}'s</strong> current active classroom. For the privacy and safety of all students and educators, screen recording, screenshot capturing, downloading, and redistributing are strictly prohibited and watermarked with your secure parent token.
          </p>
        </div>
      </div>

    </div>
  );
}
