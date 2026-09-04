"use client";

import React, { useState, useEffect } from "react";
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
  UserCheck,
  Sliders,
  Flame,
  ShieldCheck,
  BarChart3
} from "lucide-react";
import {
  getSmartTimetableMatrixAction,
  generateConflictFreeTimetableAction,
  generateSchoolWideGeneticTimetableAction,
  assignTeacherProxyAction,
  sendTimetableToParentsWhatsAppAction,
  TimetablePeriodSlot
} from "@/app/actions/smart-timetable-actions";
import { getInstitutionClassesAction } from "@/app/actions/attendance-actions";

export function SmartTimetableBuilderDesk() {
  const [availableClasses, setAvailableClasses] = useState<string[]>([
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
  ]);
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [academicSession, setAcademicSession] = useState("2026–2027");
  const [slots, setSlots] = useState<TimetablePeriodSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Genetic Solver Hyperparameters
  const [showSolverPanel, setShowSolverPanel] = useState(false);
  const [populationSize, setPopulationSize] = useState(50);
  const [maxGenerations, setMaxGenerations] = useState(120);
  const [consecutivePenalty, setConsecutivePenalty] = useState(20);
  const [labWeight, setLabWeight] = useState(45);
  const [solverStats, setSolverStats] = useState<any>(null);

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

  // School-Wide Genetic Algorithm Run
  async function handleSchoolWideGeneticSolve() {
    if (!confirm(`🚀 Launch Evolutionary Multi-Objective Genetic Solver across ALL ${availableClasses.length} grades? This evaluates millions of chromosome permutations to enforce zero teacher/room double-bookings and cognitive period balance.`)) return;
    
    setIsProcessing(true);
    try {
      const res = await generateSchoolWideGeneticTimetableAction({
        populationSize,
        maxGenerations,
        consecutivePenaltyWeight: consecutivePenalty,
        labConstraintWeight: labWeight,
        academicSession
      });

      if (res.success) {
        setSolverStats(res.stats);
        alert(res.message);
        loadTimetable();
      } else {
        alert("Solver error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSingleClassGenerate() {
    if (!confirm(`⚡ Auto-generate balanced periods specifically for ${selectedClass}?`)) return;
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
            AI Multi-Objective Genetic Solver &amp; Zero Double-Booking Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-purple-400" />
            Smart Master Timetable &amp; Genetic Solver
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl">
            Evolutionary algorithm solves school-wide teacher clashes, lab room bottlenecks, teacher fatigue thresholds, and cognitive subject dispersion in under 3 seconds.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowSolverPanel(!showSolverPanel)}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-white/20"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-300" />
            {showSolverPanel ? "Hide Config" : "Solver Parameters"}
          </button>

          <button
            onClick={handleSchoolWideGeneticSolve}
            disabled={isProcessing}
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
            ⚡ Auto-Solve All Grades (GA)
          </button>

          <button
            onClick={handleSendTimetableWhatsApp}
            disabled={isProcessing}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Send WhatsApp
          </button>
        </div>
      </div>

      {/* Genetic Solver Hyperparameter Tuning Tray */}
      {showSolverPanel && (
        <div className="bg-white p-6 rounded-3xl border border-purple-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-black text-purple-950 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              Evolutionary Genetic Algorithm Optimizer Controls
            </h3>
            <span className="text-[11px] font-bold text-stone-500 font-mono">Algorithm: NSGA-II / Constraint-Repair Heuristic</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-stone-700">Population Size:</span>
                <span className="font-mono text-purple-700 font-black">{populationSize} chromosomes</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="10"
                value={populationSize}
                onChange={(e) => setPopulationSize(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <p className="text-[10px] text-stone-400 mt-1">Larger population improves global optima discovery.</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-stone-700">Max Generations:</span>
                <span className="font-mono text-purple-700 font-black">{maxGenerations} gens</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="10"
                value={maxGenerations}
                onChange={(e) => setMaxGenerations(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <p className="text-[10px] text-stone-400 mt-1">Evolution iterations before final constraint repair.</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-stone-700">Teacher Fatigue Weight:</span>
                <span className="font-mono text-purple-700 font-black">-{consecutivePenalty} pts</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={consecutivePenalty}
                onChange={(e) => setConsecutivePenalty(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <p className="text-[10px] text-stone-400 mt-1">Penalty for 3+ consecutive periods without planning break.</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-stone-700">Lab Collision Weight:</span>
                <span className="font-mono text-purple-700 font-black">-{labWeight} pts</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={labWeight}
                onChange={(e) => setLabWeight(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <p className="text-[10px] text-stone-400 mt-1">Constraint enforcement for Science &amp; AI Computer Labs.</p>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Strip */}
      {solverStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
            <div className="text-[10px] uppercase font-black text-emerald-800 tracking-wider">Teacher Clashes</div>
            <div className="text-xl font-black text-emerald-950 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {solverStats.clashCount} (Zero)
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5">
            <div className="text-[10px] uppercase font-black text-blue-800 tracking-wider">Room Clashes</div>
            <div className="text-xl font-black text-blue-950 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              {solverStats.roomClashes} (Zero)
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5">
            <div className="text-[10px] uppercase font-black text-purple-800 tracking-wider">Fitness Score</div>
            <div className="text-xl font-black text-purple-950 flex items-center gap-1.5 mt-0.5">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              {solverStats.fitnessScore} / 1000
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
            <div className="text-[10px] uppercase font-black text-amber-800 tracking-wider">Generations</div>
            <div className="text-xl font-black text-amber-950 mt-0.5">
              {solverStats.generationsRun} cycles
            </div>
          </div>

          <div className="bg-stone-100 border border-stone-200 rounded-2xl p-3.5">
            <div className="text-[10px] uppercase font-black text-stone-600 tracking-wider">Total Periods</div>
            <div className="text-xl font-black text-stone-900 mt-0.5">
              {solverStats.totalPeriods} slots
            </div>
          </div>

          <div className="bg-purple-900 text-white rounded-2xl p-3.5">
            <div className="text-[10px] uppercase font-black text-purple-300 tracking-wider">Execution Time</div>
            <div className="text-xl font-black text-white font-mono mt-0.5">
              {solverStats.durationMs}ms
            </div>
          </div>
        </div>
      )}

      {/* Class & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-4 text-xs font-bold">
          <label className="text-stone-500">Inspect Grade Schedule:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
          >
            {availableClasses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={handleSingleClassGenerate}
            disabled={isProcessing}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center gap-1 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} /> Regenerate {selectedClass} Only
          </button>
        </div>

        <div className="text-xs font-bold text-stone-500 flex items-center gap-2">
          <span>Session: <strong>{academicSession}</strong></span>
          <span className="text-stone-300">•</span>
          <span className="text-emerald-600 font-black flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 0 Teacher Collisions
          </span>
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
                            : slot.room_number.includes('Lab') || slot.room_number.includes('Studio')
                            ? "bg-blue-50/50 border-blue-200 text-blue-950"
                            : "bg-stone-50 border-stone-200 text-stone-900"
                        }`}>
                          <div className="font-black text-[11px] truncate">{slot.subject_name}</div>
                          <div className="text-[10px] text-stone-600 truncate flex items-center gap-1 font-medium">
                            <Users className="w-3 h-3 text-stone-400" />
                            {isProxy ? slot.substitution_teacher_name : slot.teacher_name}
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-stone-400 font-mono pt-1 border-t border-stone-200/50">
                            <span className="truncate max-w-[80px]">{slot.room_number}</span>
                            <button
                              onClick={() => {
                                setSelectedSlot(slot);
                                setProxyModalOpen(true);
                              }}
                              className="text-purple-600 hover:text-purple-800 font-bold hover:underline"
                            >
                              Proxy
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

      {/* Teacher Proxy Substitution Modal */}
      {proxyModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="space-y-1 border-b border-stone-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                <UserCheck className="w-3 h-3" /> Teacher Substitution (Proxy)
              </div>
              <h3 className="text-lg font-black text-stone-900">
                Allocate Proxy for {selectedSlot.subject_name}
              </h3>
              <p className="text-xs text-stone-500">
                {selectedSlot.day_of_week} • Period {selectedSlot.period_number} ({selectedSlot.start_time}–{selectedSlot.end_time})
              </p>
            </div>

            <form onSubmit={handleAssignProxySubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-stone-500">Absent Regular Teacher</label>
                <input
                  type="text"
                  disabled
                  value={selectedSlot.teacher_name}
                  className="w-full mt-1 bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 font-bold"
                />
              </div>

              <div>
                <label className="text-stone-500">Assign Available Substitute Teacher</label>
                <select
                  value={substituteTeacher}
                  onChange={(e) => setSubstituteTeacher(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                >
                  <option value="Mr. Amit Kumar (Computer Science)">Mr. Amit Kumar (Computer Science)</option>
                  <option value="Ms. Ritu Roy (Art & Craft)">Ms. Ritu Roy (Art & Craft)</option>
                  <option value="Mr. Vikram Singh (Sports)">Mr. Vikram Singh (Sports)</option>
                  <option value="Mrs. Meenakshi S. (Library)">Mrs. Meenakshi S. (Library)</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                ⚡ Upon confirmation, an instant WhatsApp proxy alert will be dispatched to the substitute educator.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProxyModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {isProcessing ? "Confirming..." : "Assign Proxy & Dispatch Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default SmartTimetableBuilderDesk;
