"use client";

import React from "react";
import Link from "next/link";
import { 
  GraduationCap, BookOpen, Clock, Calendar, 
  CreditCard, Award, Library, CheckCircle2, 
  ChevronRight, Sparkles, FileText, Bus
} from "lucide-react";
import { useMobileAuth } from "../MobileAuthProvider";

export default function StudentMobileDashboard() {
  const { user } = useMobileAuth();

  return (
    <div className="space-y-6 pb-24">
      
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-purple-950/10 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-purple-400/20 text-purple-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-purple-400/30">
              🎓 Student Desk &bull; Grade 5A
            </span>
            <span className="text-xs text-slate-300 font-mono">Roll #14</span>
          </div>

          <div className="flex items-center gap-3.5 pt-1">
            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-purple-400 shadow-md shrink-0">
              <img src={user?.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150"} alt="Student" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif leading-tight">{user?.fullName || "Aarav Sharma"}</h2>
              <p className="text-xs text-purple-200/90 mt-0.5">Crayon Box School &bull; Adm: CB26-05421</p>
              <span className="text-[10px] text-emerald-300 font-bold">Attendance: 94.2% (Present Today ✓)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link 
              href="/mobile/id-card"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-bold text-white">Digital ID Card</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </Link>

            <Link 
              href="/mobile/transport"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold text-white">My Bus Route</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* Homework & Diary Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800">Today's Assignments & Diary</h3>
          <span className="text-xs font-bold text-purple-600">2 Pending</span>
        </div>

        <div className="space-y-2.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                Mathematics
              </span>
              <span className="text-[10px] text-slate-400">Due Tomorrow</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800">Fractions & Mixed Numbers Worksheet</h4>
            <p className="text-[11px] text-slate-500">Complete exercise 4.2 questions 1 to 10 in notebook.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                EVS & Science
              </span>
              <span className="text-[10px] text-slate-400">Due Friday</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800">Plant Life Cycle Diagram</h4>
            <p className="text-[11px] text-slate-500">Draw and label germination stages on chart paper.</p>
          </div>
        </div>
      </div>

      {/* Quick Academic Tools */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 px-1">Academic Resources</h3>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <Link href="/parent/academics" className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center hover:bg-slate-50">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Syllabus</span>
            <span className="text-[10px] text-slate-400">Term 2</span>
          </Link>

          <Link href="/parent/library" className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center hover:bg-slate-50">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <Library className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Library</span>
            <span className="text-[10px] text-slate-400">1 Book Issued</span>
          </Link>

          <Link href="/parent/calendar" className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center hover:bg-slate-50">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Report Card</span>
            <span className="text-[10px] text-slate-400">Grade A+</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
