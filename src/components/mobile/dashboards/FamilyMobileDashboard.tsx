"use client";

import React from "react";
import Link from "next/link";
import { 
  Users, Wallet, Bus, Video, BookOpen, 
  Calendar, CheckCircle2, AlertCircle, ArrowRight, 
  Clock, ShieldCheck, ChevronRight, Award, Bell
} from "lucide-react";
import { useMobileAuth } from "../MobileAuthProvider";

export default function FamilyMobileDashboard() {
  const { user, activeChild, setIsProfileModalOpen } = useMobileAuth();

  const childName = activeChild ? `${activeChild.firstName} ${activeChild.lastName}` : "Your Child";
  const grade = activeChild ? `${activeChild.grade} (${activeChild.section})` : "Grade 5A";
  const pendingFee = activeChild?.pendingFee || 0;
  const attendance = activeChild?.attendancePercent || 94.2;

  return (
    <div className="space-y-6 pb-24">
      
      {/* Parent Child Context Switcher Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-emerald-950/10 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              👨‍👩‍👧 Parent Portal
            </span>

            {/* Switch Child pill trigger */}
            {user?.children && user.children.length > 1 && (
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1 transition-all"
              >
                <span>Switch Child ({user.children.length})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3.5 pt-1">
            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-emerald-400 shadow-md shrink-0">
              <img src={activeChild?.avatar} alt={childName} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif leading-tight">{childName}</h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">{grade} &bull; Roll #{activeChild?.rollNo || "14"}</p>
              <span className="text-[10px] text-slate-300 font-mono">Adm: {activeChild?.admissionNo || "CB26-05421"}</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-emerald-200">Attendance</span>
              <div className="text-lg font-bold text-white mt-0.5">{attendance}%</div>
              <span className="text-[10px] text-emerald-300">Present Today ✓</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-amber-200">Fee Status</span>
              <div className="text-lg font-bold text-amber-300 mt-0.5">
                {pendingFee > 0 ? `₹${pendingFee.toLocaleString('en-IN')}` : "Paid in Full"}
              </div>
              <span className="text-[10px] text-slate-300">
                {pendingFee > 0 ? "Term 2 Due" : "Zero Balance"}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Live Classroom Stream Widget (if authorized) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <h3 className="text-sm font-bold text-slate-900">Live Classroom Feed</h3>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
            {activeChild?.grade || "Grade 5"} Stream
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Authorized secure live video for {activeChild?.firstName}'s classroom with dynamic DRM watermarking.
        </p>

        <Link
          href="/mobile/live-stream"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Video className="w-4 h-4 text-rose-400" /> Watch Live Camera Feed
        </Link>
      </div>

      {/* Live Transport GPS Tracker Preview */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">School Bus Tracker</h3>
              <p className="text-[11px] text-slate-500">{activeChild?.busRoute || "Route 4 - Sector 62"}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            ETA: 12 Mins
          </span>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold">Assigned Stop:</span>
            <div className="font-bold text-slate-800 mt-0.5">{activeChild?.busStop || "Shipra Sun City Gate 2"}</div>
          </div>
          <Link href="/mobile/transport" className="text-amber-600 font-bold hover:underline flex items-center gap-1">
            Live Map <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 px-1">Parent Services</h3>

        <div className="grid grid-cols-4 gap-2 text-center">
          <Link href="/mobile/fees" className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center hover:bg-slate-50">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Fees</span>
          </Link>

          <Link href="/parent/academics" className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center hover:bg-slate-50">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Academics</span>
          </Link>

          <Link href="/mobile/id-card" className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center hover:bg-slate-50">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Escort Pass</span>
          </Link>

          <Link href="/parent/helpdesk" className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center hover:bg-slate-50">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Help Desk</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
