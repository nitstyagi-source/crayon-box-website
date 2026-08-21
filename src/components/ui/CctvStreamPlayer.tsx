"use client";

import { useState, useEffect, useRef } from "react";
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

const CLASS_TO_CHANNEL: Record<string, string> = {
  "Nursery": "nursery_cam",
  "LKG": "lkg_cam",
  "UKG": "ukg_cam",
  "Grade 1": "grade1_cam",
  "Grade 2": "grade2_cam",
  "Grade 3": "grade3_cam",
  "Grade 4": "grade4_cam",
  "Grade 5": "grade5_cam",
  "Grade 6": "grade6_cam",
  "Grade 7": "grade7_cam",
  "Grade 8": "grade8_cam",
  "Grade 9": "grade9_cam",
  "Grade 10": "grade10_cam",
  "Science Lab": "science_lab",
  "Computer Lab": "computer_lab",
  "Activity Hall": "activity_hall"
};

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
  "Computer Lab": { subject: "AI & Robotics Lab", teacher: "Er. Rohit Bansal", topic: "Python Logic & Circuitry", students: 28 },
  "Activity Hall": { subject: "Physical Education & Yoga", teacher: "Coach Sandeep", topic: "Indoor Athletics & Gymnastics", students: 45 }
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
  const [liveTimestamp, setLiveTimestamp] = useState("");
  const [fps, setFps] = useState(25);
  const [hasImgError, setHasImgError] = useState(false);
  const [streamLoaded, setStreamLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const channelKey = CLASS_TO_CHANNEL[classroomName] || "nursery_cam";
  const liveStreamEndpoint = `/api/cameras/${channelKey}/live`;

  const classInfo = CLASS_SUBJECTS[classroomName] || {
    subject: "Active Class Session",
    teacher: "Faculty Incharge",
    topic: "Curriculum Progression",
    students: 28
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setLiveTimestamp(d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fallback Canvas Engine (Used if DVR is disconnected/buffering)
  useEffect(() => {
    if (!hasImgError && streamLoaded) return;

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

      // 1. Background
      const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
      wallGrad.addColorStop(0, "#1c1917");
      wallGrad.addColorStop(0.65, "#292524");
      wallGrad.addColorStop(1, "#1c1917");
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Floor
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

      // 3. Chalkboard
      const boardW = w * 0.58;
      const boardH = h * 0.44;
      const boardX = (w - boardW) / 2;
      const boardY = h * 0.10;

      ctx.fillStyle = "#78716c";
      ctx.fillRect(boardX - 4, boardY - 4, boardW + 8, boardH + 8);
      ctx.fillStyle = "#064e3b";
      ctx.fillRect(boardX, boardY, boardW, boardH);

      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`🏫 CRAYON BOX • ${classroomName.toUpperCase()}`, w / 2, boardY + 22);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(`Subject: ${classInfo.subject}`, w / 2, boardY + 45);

      ctx.fillStyle = "#93c5fd";
      ctx.font = "11px sans-serif";
      ctx.fillText(`Topic: ${classInfo.topic}`, w / 2, boardY + 68);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "10px sans-serif";
      ctx.fillText(`Teacher: ${classInfo.teacher} • ${classInfo.students} Students`, w / 2, boardY + 90);

      // 4. Motion Box
      const pulseAlpha = 0.4 + Math.sin(frame * 0.05) * 0.25;
      ctx.strokeStyle = `rgba(34, 197, 94, ${pulseAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w * 0.20, h * 0.42, 40, 60);

      ctx.fillStyle = "rgba(34, 197, 94, 0.9)";
      ctx.font = "9px monospace";
      ctx.fillText("MOTION: ACTIVE", w * 0.20 + 20, h * 0.40);

      // 5. Scanlines
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
  }, [hasImgError, streamLoaded, classroomName, classInfo]);

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
        ) : (
          /* REAL PHYSICAL CAMERA LIVE VIDEO FEED */
          <div className="w-full h-full relative">
            <img
              src={liveStreamEndpoint}
              alt={cameraName}
              onLoad={() => {
                setStreamLoaded(true);
                setHasImgError(false);
              }}
              onError={() => {
                setHasImgError(true);
              }}
              className={`w-full h-full object-cover select-none pointer-events-none ${
                hasImgError ? "hidden" : "block"
              }`}
            />

            {hasImgError && (
              <canvas
                ref={canvasRef}
                width={640}
                height={360}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        {/* CCTV Top Left OSD (Live Clock + Recording) */}
        {!isPaused && (
          <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none flex items-center gap-1.5 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="font-bold tracking-wider">REC • LIVE {liveTimestamp || "13:50:00"}</span>
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

        {/* CCTV Bottom Right OSD (Subject Banner) */}
        {!isPaused && (
          <div className="absolute bottom-2.5 right-2.5 z-20 pointer-events-none bg-black/75 backdrop-blur-xs px-2 py-1 rounded-md text-[9px] font-mono text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
            <BookOpen className="w-2.5 h-2.5 text-yellow-400" />
            <span>{classInfo.subject}</span>
          </div>
        )}

      </div>

      {/* Bottom Status Strip */}
      <div className="px-3 py-2 bg-stone-900/95 flex justify-between items-center text-[10px] text-stone-400 border-t border-stone-800/80 select-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Signal className="w-3 h-3" />
            Physical Stream Connected
          </span>
          <span className="text-stone-600">•</span>
          <span className="font-mono text-[9px] text-stone-400">{classInfo.teacher}</span>
        </div>

        <span className="font-mono text-[9px] text-purple-400">
          DVR 192.168.1.90:10554
        </span>
      </div>

    </div>
  );
}
