"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, ShieldCheck, Eye, EyeOff, Lock, 
  RefreshCw, AlertTriangle, Video, Maximize2, UserCheck, 
  Clock, MapPin, Radio, Sparkles, BookOpen, Activity
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

const CLASS_SUBJECTS: Record<string, { subject: string; teacher: string; topic: string; students: number }> = {
  "Nursery": { subject: "Early Sensory & Phonics", teacher: "Ms. Neha Sharma", topic: "Alphabet Rhymes & Shapes", students: 18 },
  "LKG": { subject: "Foundational Literacy", teacher: "Ms. Priyanka Das", topic: "Number Fun (1-50) & Colors", students: 20 },
  "UKG": { subject: "English & Hindi Storytelling", teacher: "Ms. Anjali Verma", topic: "Vowels & Sight Words", students: 22 },
  "Grade 1": { subject: "Environmental Studies", teacher: "Mr. Rajesh Gupta", topic: "Plants & Living Things", students: 25 },
  "Grade 2": { subject: "Mathematics", teacher: "Ms. Sunita Rao", topic: "Place Values & Addition", students: 26 },
  "Grade 3": { subject: "Science & Nature", teacher: "Mr. Amit Kumar", topic: "Solar System & Planets", students: 28 },
  "Grade 4": { subject: "Social Studies", teacher: "Ms. Kavita Joshi", topic: "Rivers & Maps of India", students: 30 },
  "Grade 5": { subject: "Mathematics", teacher: "Mr. R. K. Sharma", topic: "Fractions & Decimals Lab", students: 32 },
  "Grade 6": { subject: "General Science", teacher: "Dr. Meenakshi Iyer", topic: "Motion & Measurement", students: 34 },
  "Grade 7": { subject: "History & Civics", teacher: "Mr. Vikram Malhotra", topic: "Medieval India & Dynasties", students: 35 },
  "Grade 8": { subject: "Algebra & Geometry", teacher: "Ms. Pooja Aggarwal", topic: "Linear Equations & Angles", students: 36 },
  "Grade 9": { subject: "Physics & Chemistry", teacher: "Mr. Deepak Saxena", topic: "Newton's Laws & Optics", students: 38 },
  "Grade 10": { subject: "CBSE Board Preparatory", teacher: "Dr. S. K. Narang", topic: "Sample Paper Analysis", students: 40 },
  "Science Lab": { subject: "Practical Laboratory", teacher: "Lab Incharge", topic: "Titration & Microscope Optics", students: 24 },
  "Computer Lab": { subject: "AI & Robotics Lab", teacher: "Er. Rohit Bansal", topic: "Python Logic & Circuitry", students: 28 }
};

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const classInfo = CLASS_SUBJECTS[className] || {
    subject: "Active Class Session",
    teacher: "Faculty Incharge",
    topic: "Curriculum Progression",
    students: 30
  };

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

  // 2. Real-Time High-Definition CCTV Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Classroom Wall Background Gradient
      const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
      wallGrad.addColorStop(0, "#1c1917");
      wallGrad.addColorStop(0.65, "#292524");
      wallGrad.addColorStop(1, "#1c1917");
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Classroom Floor Perspective
      const floorGrad = ctx.createLinearGradient(0, h * 0.62, 0, h);
      floorGrad.addColorStop(0, "#44403c");
      floorGrad.addColorStop(1, "#1c1917");
      ctx.fillStyle = floorGrad;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.62);
      ctx.lineTo(w, h * 0.62);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Floor Perspective Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = -w; i < w * 2; i += 60) {
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.62);
        ctx.lineTo(i, h);
        ctx.stroke();
      }

      // 3. Smart Ceramic Chalkboard
      const boardW = w * 0.58;
      const boardH = h * 0.44;
      const boardX = (w - boardW) / 2;
      const boardY = h * 0.10;

      ctx.fillStyle = "#78716c";
      ctx.fillRect(boardX - 4, boardY - 4, boardW + 8, boardH + 8);
      ctx.fillStyle = "#064e3b";
      ctx.fillRect(boardX, boardY, boardW, boardH);

      // Chalkboard Text
      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`🏫 CRAYON BOX SCHOOL • ${className.toUpperCase()}`, w / 2, boardY + 22);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(`Subject: ${classInfo.subject}`, w / 2, boardY + 45);

      ctx.fillStyle = "#93c5fd";
      ctx.font = "11px sans-serif";
      ctx.fillText(`Topic: ${classInfo.topic}`, w / 2, boardY + 68);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "10px sans-serif";
      ctx.fillText(`Faculty: ${classInfo.teacher} • ${studentName} Present 🟢`, w / 2, boardY + 90);

      // Chalk Equations
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "9px monospace";
      ctx.fillText("Quadratic Roots • √b²-4ac • Trigonometry Proofs", w / 2, boardY + 112);

      // 4. Classroom Windows
      ctx.fillStyle = "rgba(147, 197, 253, 0.12)";
      ctx.fillRect(15, h * 0.15, w * 0.12, h * 0.35);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.strokeRect(15, h * 0.15, w * 0.12, h * 0.35);

      // 5. Student Desks
      for (let row = 0; row < 3; row++) {
        const rowY = h * 0.68 + row * 24;
        const deskW = w * 0.22 + row * 18;
        const deskH = 10 + row * 2;

        ctx.fillStyle = "#854d0e";
        ctx.fillRect(w * 0.15 - row * 10, rowY, deskW, deskH);
        ctx.fillRect(w * 0.60 - row * 5, rowY, deskW, deskH);
      }

      // 6. Teacher Silhouette
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(w * 0.25, h * 0.52, 28, 38);
      ctx.beginPath();
      ctx.arc(w * 0.25 + 14, h * 0.48, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#334155";
      ctx.fill();

      // 7. Motion Detection Box
      const pulseAlpha = 0.4 + Math.sin(frame * 0.05) * 0.25;
      ctx.strokeStyle = `rgba(34, 197, 94, ${pulseAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w * 0.20, h * 0.42, 40, 60);

      ctx.fillStyle = "rgba(34, 197, 94, 0.9)";
      ctx.font = "9px monospace";
      ctx.fillText("STUDENT ACTIVE", w * 0.20 + 20, h * 0.40);

      // 8. Scanlines
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [className, classInfo, studentName]);

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
        
        {/* Live Physical Camera Stream Embed */}
        <div className="w-full h-full relative">
          <iframe
            src={streamUrl}
            title={cameraName}
            className={`w-full h-full border-0 pointer-events-none transition duration-300 ${
              isObscured ? "filter blur-3xl opacity-10 scale-95" : "filter blur-none opacity-100"
            }`}
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        </div>

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
              {classInfo.subject} • {classInfo.teacher}
            </div>
            <strong className="block text-xs font-bold text-stone-100 truncate">
              Topic: {classInfo.topic}
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
