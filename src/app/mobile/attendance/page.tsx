"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckSquare, ArrowLeft, CheckCircle2, XCircle, 
  Clock, AlertCircle, Sparkles, Wifi, WifiOff, Users, Save
} from "lucide-react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";

interface StudentAttendanceItem {
  id: string;
  rollNo: string;
  name: string;
  status: "present" | "absent" | "late";
}

const INITIAL_STUDENTS: StudentAttendanceItem[] = [
  { id: "STU-01", rollNo: "01", name: "Aarav Sharma", status: "present" },
  { id: "STU-02", rollNo: "02", name: "Aditi Rao", status: "present" },
  { id: "STU-03", rollNo: "03", name: "Ananya Mishra", status: "present" },
  { id: "STU-04", rollNo: "04", name: "Dhruv Kapoor", status: "absent" },
  { id: "STU-05", rollNo: "05", name: "Diya Verma", status: "present" },
  { id: "STU-06", rollNo: "06", name: "Kabir Mehta", status: "late" },
  { id: "STU-07", rollNo: "07", name: "Meera Nair", status: "present" },
  { id: "STU-08", rollNo: "08", name: "Rohan Das", status: "present" },
  { id: "STU-09", rollNo: "09", name: "Sara Khan", status: "present" },
  { id: "STU-10", rollNo: "10", name: "Vivaan Joshi", status: "present" },
];

export default function MobileAttendancePage() {
  const { user } = useMobileAuth();
  const [students, setStudents] = useState<StudentAttendanceItem[]>(INITIAL_STUDENTS);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Period 2 (09:15 AM)");
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleStatus = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      if (s.status === "present") return { ...s, status: "absent" };
      if (s.status === "absent") return { ...s, status: "late" };
      return { ...s, status: "present" };
    }));
    setIsSaved(false);
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: "present" })));
    setIsSaved(false);
  };

  const handleSaveAttendance = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSaved(true);
    }, 1000);
  };

  const presentCount = students.filter(s => s.status === "present").length;
  const absentCount = students.filter(s => s.status === "absent").length;
  const lateCount = students.filter(s => s.status === "late").length;

  return (
    <div className="space-y-5 pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/mobile" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-tight">Mark Attendance</h1>
            <p className="text-[11px] text-slate-500">Grade 5A &bull; Mathematics</p>
          </div>
        </div>

        <button
          onClick={markAllPresent}
          className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
        >
          Mark All Present
        </button>
      </div>

      {/* Timetable Period Context Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-4 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-amber-300">Teacher &bull; {user?.fullName || "Neha Sharma"}</span>
          <span className="text-xs text-slate-400 font-mono">Today &bull; 22 Aug</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">Period 2 &bull; Mathematics</h3>
            <p className="text-xs text-slate-300">Room 201 &bull; 09:15 - 10:00 AM</p>
          </div>
          <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
            ACTIVE NOW
          </span>
        </div>

        {/* Counter Pills */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center font-bold text-xs">
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-2 text-emerald-400">
            <div className="text-base">{presentCount}</div>
            <span className="text-[10px] uppercase">Present</span>
          </div>
          <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-2 text-rose-400">
            <div className="text-base">{absentCount}</div>
            <span className="text-[10px] uppercase">Absent</span>
          </div>
          <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-2 text-amber-300">
            <div className="text-base">{lateCount}</div>
            <span className="text-[10px] uppercase">Late</span>
          </div>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Student Roster ({students.length})
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Tap student to cycle status</span>
        </div>

        <div className="space-y-2">
          {students.map(stu => (
            <div
              key={stu.id}
              onClick={() => toggleStatus(stu.id)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                  {stu.rollNo}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">{stu.name}</h4>
                  <p className="text-[10px] text-slate-400">Roll #{stu.rollNo} &bull; Grade 5A</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  stu.status === "present" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                  stu.status === "absent" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                  "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {stu.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Action */}
      <div className="sticky bottom-20 pt-2">
        <button
          onClick={handleSaveAttendance}
          disabled={isSubmitting}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          {isSubmitting ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>Saving to ERP Cloud...</span>
            </>
          ) : isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Attendance Submitted ✓</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-amber-400" />
              <span>Submit Period Attendance</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
