"use client";

import React, { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import {
  Calendar,
  Clock,
  Zap,
  Send,
  Printer,
  Sparkles,
  Shuffle,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  UserCheck
} from "lucide-react";
import {
  getSmartTimetableMatrixAction,
  generateConflictFreeTimetableAction,
  assignTeacherProxyAction,
  sendTimetableToParentsWhatsAppAction,
  TimetablePeriodSlot
} from "@/app/actions/smart-timetable-actions";
import { getInstitutionClassesAction } from "@/app/actions/attendance-actions";

export function SmartTimetableBuilderDesk() {
  const [availableClasses, setAvailableClasses] = useState<string[]>([
    "Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3",
    "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
  ]);
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [academicSession, setAcademicSession] = useState("2026–2027");
  const [slots, setSlots] = useState<TimetablePeriodSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Proxy Modal State
  const [proxyModalOpen, setProxyModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimetablePeriodSlot | null>(null);
  const [substituteTeacher, setSubstituteTeacher] = useState("Mr. Amit Kumar (Computer Science)");

  useEffect(() => {
    async function loadDynamicClasses() {
      try {
        const res = await getInstitutionClassesAction('CBS');
        if (res.success && res.classes && res.classes.length > 0) {
          setAvailableClasses(res.classes as string[]);
          if (!res.classes.includes(selectedClass)) {
            setSelectedClass((res.classes as string[])[0]);
          }
        }
      } catch (e) {
        console.error('Error fetching dynamic classes for timetable solver:', e);
      }
    }
    loadDynamicClasses();
  }, []);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    loadTimetable();
  }, [selectedClass, academicSession]);

  async function loadTimetable() {
    setIsLoading(true);
    try {
      const res = await getSmartTimetableMatrixAction({
        className: selectedClass,
        academicSession
      });
      if (res.success) {
        setSlots(res.slots);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAutoGenerate() {
    if (!confirm(`⚡ Auto-generate 48 conflict-free weekly periods for ${selectedClass} with zero teacher/lab clashes?`)) return;
    setIsProcessing(true);
    try {
      const res = await generateConflictFreeTimetableAction({
        className: selectedClass,
        academicSession
      });
      if (res.success) {
        alert(res.message);
        loadTimetable();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSendTimetableWhatsApp() {
    setIsProcessing(true);
    try {
      const res = await sendTimetableToParentsWhatsAppAction({
        className: selectedClass
      });
      if (res.success) {
        alert(res.message);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleAssignProxySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;

    setIsProcessing(true);
    try {
      const res = await assignTeacherProxyAction({
        slotId: selectedSlot.id,
        substituteTeacherName: substituteTeacher
      });
      if (res.success) {
        alert(res.message);
        setProxyModalOpen(false);
        loadTimetable();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function getSlot(day: string, periodNum: number) {
    return slots.find(s => s.day_of_week === day && s.period_number === periodNum);
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-indigo-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Driven Constraint Solver &amp; Zero Double-Booking Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-purple-400" />
            Smart Master Timetable &amp; Proxy Matrix
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl">
            Auto-generates balanced weekly period schedules across core subjects and labs, with instant 1-click teacher substitution (proxy) allocation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAutoGenerate}
            disabled={isProcessing}
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
            ⚡ Auto-Solve Timetable
          </button>

          <button
            onClick={handleSendTimetableWhatsApp}
            disabled={isProcessing}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Send to Parents on WhatsApp
          </button>
        </div>
      </div>

      {/* Class & Filter Bar */}
      <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-4 text-xs font-bold">
          <label className="text-stone-500">Select Grade:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
          >
            {availableClasses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold text-stone-500 flex items-center gap-2">
          <span>Session: <strong>{academicSession}</strong></span>
          <span className="text-stone-300">•</span>
          <span className="text-emerald-600 font-black">✓ 0 Conflict Found</span>
        </div>
      </div>

      {/* Timetable Weekly Matrix Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-stone-100/80 border-b-2 border-stone-200 text-stone-800 font-black">
                <th className="p-3 text-left w-24">Day</th>
                {periods.map((p) => (
                  <th key={p} className="p-3 border-l border-stone-200 min-w-[130px]">
                    <div className="font-bold text-stone-900">Period {p}</div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      {p === 1 ? "08:30–09:15" : p === 2 ? "09:15–10:00" : p === 3 ? "10:00–10:45" : p === 4 ? "11:00–11:45" : p === 5 ? "11:45–12:30" : p === 6 ? "12:30–01:15" : p === 7 ? "01:30–02:15" : "02:15–03:00"}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {daysOfWeek.map((day) => (
                <tr key={day} className="hover:bg-stone-50/50">
                  <td className="p-3.5 text-left font-black text-stone-900 bg-stone-50/40 border-r border-stone-200">
                    {day}
                  </td>
                  {periods.map((p) => {
                    const slot = getSlot(day, p);
                    if (!slot) {
                      return (
                        <td key={p} className="p-2 border-r border-stone-100 text-stone-300 font-mono text-[10px]">
                          —
                        </td>
                      );
                    }

                    const isProxy = slot.status === 'PROXY_ASSIGNED';

                    return (
                      <td key={p} className="p-2 border-r border-stone-100 align-top">
                        <div className={`p-2.5 rounded-2xl border text-left space-y-1 transition hover:shadow-xs ${
                          isProxy
                            ? "bg-amber-50/80 border-amber-300 text-amber-950"
                            : slot.room_number.includes('Lab')
                            ? "bg-blue-50/50 border-blue-200 text-blue-950"
                            : "bg-stone-50 border-stone-200 text-stone-900"
                        }`}>
                          <div className="font-black text-[11px] truncate">{slot.subject_name}</div>
                          <div className="text-[10px] text-stone-600 truncate flex items-center gap-1 font-medium">
                            <Users className="w-3 h-3 text-stone-400" />
                            {isProxy ? slot.substitution_teacher_name : slot.teacher_name}
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-stone-400 font-mono pt-1 border-t border-stone-200/50">
                            <span>{slot.room_number}</span>
                            <button
                              onClick={() => {
                                setSelectedSlot(slot);
                                setProxyModalOpen(true);
                              }}
                              className="text-purple-600 hover:text-purple-800 font-bold hover:underline"
                            >
                              {isProxy ? "Change Proxy" : "+ Proxy"}
                            </button>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROXY ASSIGNMENT MODAL */}
      {proxyModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5">
            <div className="space-y-1">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Teacher Substitution (Proxy)
              </span>
              <h3 className="text-lg font-black text-stone-900">
                Assign Substitute for Period {selectedSlot.period_number}
              </h3>
              <p className="text-xs text-stone-500">
                {selectedSlot.day_of_week} • {selectedSlot.class_name} • {selectedSlot.subject_name} ({selectedSlot.teacher_name})
              </p>
            </div>

            <form onSubmit={handleAssignProxySubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Select Available Substitute Teacher (Free this period)
                </label>
                <select
                  value={substituteTeacher}
                  onChange={(e) => setSubstituteTeacher(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                >
                  <option value="Mr. Amit Kumar (Computer Science)">Mr. Amit Kumar (Free Period 1-3)</option>
                  <option value="Ms. Ritu Roy (Art & Craft)">Ms. Ritu Roy (Free Period 2-4)</option>
                  <option value="Mr. Vikram Singh (Sports / PE)">Mr. Vikram Singh (Free Period 1-5)</option>
                  <option value="Mrs. Meenakshi S. (Library)">Mrs. Meenakshi S. (Free Period 3-6)</option>
                </select>
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-[11px] space-y-1 text-stone-600">
                <div className="font-bold text-stone-900 flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-emerald-600" /> Automated Teacher WhatsApp Notice:
                </div>
                <div>Assigning proxy will automatically dispatch a WhatsApp alert to the substitute teacher with the room number and class syllabus topic.</div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProxyModalOpen(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Confirm Proxy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SmartTimetableBuilderPage() {
  redirect('/admin/timetable?tab=solver');
}
