"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Radio, Video, ShieldAlert, RefreshCw, Power, 
  Maximize2, Eye, Signal, AlertTriangle, Play, Sparkles,
  Wifi, CheckCircle2, Lock, Activity, Users, BookOpen
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
  const [motionActive, setMotionActive] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  // Real-Time High-Definition CCTV Canvas Rendering Engine
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

      // Floor Tiles Perspective Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      for (let i = -w; i < w * 2; i += 60) {
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.62);
        ctx.lineTo(i, h);
        ctx.stroke();
      }

      // 3. Smart Whiteboard / Green Chalkboard
      const boardW = w * 0.55;
      const boardH = h * 0.42;
      const boardX = (w - boardW) / 2;
      const boardY = h * 0.12;

      // Board Frame
      ctx.fillStyle = "#78716c";
      ctx.fillRect(boardX - 4, boardY - 4, boardW + 8, boardH + 8);
      // Board Surface (Dark Green Ceramic)
      ctx.fillStyle = "#064e3b";
      ctx.fillRect(boardX, boardY, boardW, boardH);

      // Chalkboard Heading Text
      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`🏫 CRAYON BOX SCHOOL • ${classroomName.toUpperCase()}`, w / 2, boardY + 22);

      // Subject & Topic Chalk Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(`Subject: ${classInfo.subject}`, w / 2, boardY + 45);

      ctx.fillStyle = "#93c5fd";
      ctx.font = "11px sans-serif";
      ctx.fillText(`Topic: ${classInfo.topic}`, w / 2, boardY + 68);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "10px sans-serif";
      ctx.fillText(`Teacher: ${classInfo.teacher} • ${classInfo.students} Students Present`, w / 2, boardY + 90);

      // Subtle chalk formula notes
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "9px monospace";
      ctx.fillText("2x + 5y = 10 • E = mc² • ∑(k=1..n)", w / 2, boardY + 112);

      // 4. Classroom Windows (Daylight Ambient Effect)
      ctx.fillStyle = "rgba(147, 197, 253, 0.12)";
      ctx.fillRect(15, h * 0.15, w * 0.12, h * 0.35);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.strokeRect(15, h * 0.15, w * 0.12, h * 0.35);

      // 5. Student Desks Rows in Perspective
      ctx.fillStyle = "#78350f";
      for (let row = 0; row < 3; row++) {
        const rowY = h * 0.68 + row * 24;
        const deskW = w * 0.22 + row * 18;
        const deskH = 10 + row * 2;

        // Left Desk
        ctx.fillStyle = "#854d0e";
        ctx.fillRect(w * 0.15 - row * 10, rowY, deskW, deskH);
        // Right Desk
        ctx.fillRect(w * 0.60 - row * 5, rowY, deskW, deskH);
      }

      // 6. Teacher Podium / Silhouette
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(w * 0.25, h * 0.52, 28, 38);
      // Teacher Head
      ctx.beginPath();
      ctx.arc(w * 0.25 + 14, h * 0.48, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#334155";
      ctx.fill();

      // 7. Motion Detection Radar Box
      const pulseAlpha = 0.4 + Math.sin(frame * 0.05) * 0.25;
      ctx.strokeStyle = `rgba(34, 197, 94, ${pulseAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w * 0.20, h * 0.42, 40, 60);

      ctx.fillStyle = "rgba(34, 197, 94, 0.9)";
      ctx.font = "9px monospace";
      ctx.fillText("MOTION: ACTIVE", w * 0.20 + 20, h * 0.40);

      // 8. Subtle CCTV Scanlines
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
      }

      // 9. Camera Sensor Timestamp & Live Badge
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(10, 10, 180, 24);
      ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
      ctx.strokeRect(10, 10, 180, 24);

      ctx.fillStyle = "#4ade80";
      ctx.beginPath();
      ctx.arc(20, 22, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`REC • LIVE ${new Date().toLocaleTimeString("en-IN")}`, 30, 26);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [classroomName, classInfo]);

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

      {/* Main Video Stage Canvas */}
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
          /* Animated Classroom CCTV Canvas */
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-full object-cover"
          />
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
            Stream Online
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
