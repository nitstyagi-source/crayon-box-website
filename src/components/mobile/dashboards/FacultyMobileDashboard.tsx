"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckSquare, BookOpen, Clock, Calendar, 
  Send, Users, Award, ChevronRight, CheckCircle2, 
  PlusCircle, Sparkles, QrCode
} from "lucide-react";
import { useMobileAuth } from "../MobileAuthProvider";

export default function FacultyMobileDashboard() {
  const { user } = useMobileAuth();

  const TIMETABLE_PERIODS = [
    { period: 1, time: "08:30 - 09:15 AM", subject: "Mathematics", grade: "Grade 5A", room: "Room 201", status: "completed" },
    { period: 2, time: "09:15 - 10:00 AM", subject: "Mathematics", grade: "Grade 6B", room: "Room 204", status: "active" },
    { period: 3, time: "10:00 - 10:45 AM", subject: "Free / Planning", grade: "Staff Room", room: "Desk 14", status: "upcoming" },
    { period: 4, time: "11:00 - 11:45 AM", subject: "EVS & Science", grade: "Grade 5A", room: "Room 201", status: "upcoming" },
    { period: 5, time: "11:45 - 12:30 PM", subject: "Mathematics", grade: "Grade 4A", room: "Room 105", status: "upcoming" },
  ];

  return (
    <div className="space-y-6 pb-24">
      
      {/* Faculty Welcome Card */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-blue-950/10 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-blue-400/20 text-blue-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-400/30">
              👩‍🏫 Faculty Desk
            </span>
            <span className="text-xs text-slate-300 font-mono">Today &bull; 09:30 AM</span>
          </div>

          <div>
            <h2 className="text-xl font-bold font-serif">{user?.fullName || "Neha Sharma"}</h2>
            <p className="text-xs text-slate-300 mt-0.5">TGT Mathematics &bull; Class Teacher: Grade 5A</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300">Active Period Now:</span>
              <div className="font-bold text-sm text-white mt-0.5">Period 2 &bull; Math (Grade 6B)</div>
              <span className="text-[11px] text-slate-300">Room 204 &bull; 09:15 - 10:00 AM</span>
            </div>

            <Link
              href="/mobile/attendance"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1 shrink-0"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Mark Class
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 px-1">Quick Action Shortcuts</h3>

        <div className="grid grid-cols-3 gap-2.5">
          <Link 
            href="/mobile/attendance"
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Attendance</span>
            <span className="text-[10px] text-slate-400">1-Tap Fast</span>
          </Link>

          <Link 
            href="/mobile/qr-scanner"
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Scan ID QR</span>
            <span className="text-[10px] text-slate-400">Student Scan</span>
          </Link>

          <Link 
            href="/admin/digital-diary"
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Daily Diary</span>
            <span className="text-[10px] text-slate-400">Post Notice</span>
          </Link>

          <Link 
            href="/admin/syllabus/curriculum"
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Homework</span>
            <span className="text-[10px] text-slate-400">Assign Tasks</span>
          </Link>

          <Link 
            href="/staff/academics"
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">My Students</span>
            <span className="text-[10px] text-slate-400">38 Enrolled</span>
          </Link>

          <Link 
            href="/admin/hr/attendance"
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Apply Leave</span>
            <span className="text-[10px] text-slate-400">Balance: 12</span>
          </Link>
        </div>
      </div>

      {/* Today's Timetable Schedule */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800">Today's Class Schedule</h3>
          <span className="text-xs font-bold text-blue-600">5 Periods Today</span>
        </div>

        <div className="space-y-2.5">
          {TIMETABLE_PERIODS.map(slot => (
            <div 
              key={slot.period}
              className={`p-4 rounded-2xl border transition-all ${
                slot.status === 'active'
                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 shadow-sm'
                  : 'bg-white border-slate-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                    slot.status === 'active' 
                      ? 'bg-amber-500 text-slate-950 shadow-sm' 
                      : slot.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    P{slot.period}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{slot.subject}</h4>
                    <p className="text-[11px] text-slate-500">{slot.grade} &bull; {slot.room}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    slot.status === 'active'
                      ? 'bg-amber-400 text-slate-950 font-extrabold animate-pulse'
                      : slot.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {slot.status === 'active' ? 'IN PROGRESS' : slot.status === 'completed' ? 'DONE' : slot.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
