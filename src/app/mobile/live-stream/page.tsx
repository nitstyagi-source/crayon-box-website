"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Video, ArrowLeft, ShieldAlert, Lock, 
  Sparkles, Maximize2, Radio, CheckCircle2, Clock
} from "lucide-react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";
import CctvStreamPlayer from "@/components/ui/CctvStreamPlayer";

export default function MobileLiveStreamPage() {
  const { user, activeChild } = useMobileAuth();
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    // Dynamic Timestamp for DRM overlay
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    // Fetch active stream URL from gateway or fallback
    const targetClass = (activeChild?.classroomCamera || "Grade 5").toLowerCase().replace(/\s+/g, "");
    setStreamUrl(`https://bibliographic-wales-qualifying-variety.trycloudflare.com/${targetClass}_cam/`);

    return () => clearInterval(interval);
  }, [activeChild]);

  const classroomName = activeChild?.grade || "Grade 5A";
  const viewerName = user?.fullName || "Parent User";
  const viewerPhone = user?.phoneNumber || "+91 98765 43210";

  return (
    <div className="space-y-5 pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/mobile" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-tight">Live Classroom</h1>
            <p className="text-[11px] text-slate-500">{classroomName} &bull; {activeChild?.firstName}'s Desk</p>
          </div>
        </div>

        <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
          <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> LIVE HD
        </span>
      </div>

      {/* Video Player Container with DRM Watermark */}
      <div className="relative aspect-video w-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 flex items-center justify-center">
        
        {/* Actual Video Stream Feed */}
        <CctvStreamPlayer 
          streamUrl={streamUrl}
          cameraName={classroomName}
          roomNumber="Room 201"
          classroomName={classroomName}
        />

        {/* Dynamic Anti-Piracy Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between select-none">
          <div className="flex items-center justify-between text-[10px] font-mono text-white/80 bg-slate-950/60 backdrop-blur-sm px-2.5 py-1 rounded-full w-fit">
            <span className="font-bold text-amber-400">{classroomName}</span>
            <span className="mx-1.5">&bull;</span>
            <span>{timestamp}</span>
          </div>

          {/* Floating User Watermark */}
          <div className="text-center my-auto opacity-30 text-white font-mono text-[11px] uppercase tracking-widest font-extrabold rotate-[-12deg]">
            {viewerName} &bull; {viewerPhone} &bull; 192.168.1.90
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-white/70 bg-slate-950/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <span className="flex items-center gap-1"><Lock className="w-2.5 h-2.5 text-emerald-400" /> Authorized Parent Session</span>
            <span>FPS: 25.0</span>
          </div>
        </div>
      </div>

      {/* Classroom Context Details */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Current Period: Mathematics</h3>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            Period 2 &bull; 09:15 - 10:00 AM
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Teacher: <strong>Neha Sharma (TGT Math)</strong> &bull; Topic: Fractions & Number Line Representation.
        </p>

        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60 flex items-start gap-2.5 text-amber-900 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-tight">
            Classroom live video is restricted to active school hours and authorized parents only. Recording or redistribution is strictly prohibited.
          </p>
        </div>
      </div>

    </div>
  );
}
