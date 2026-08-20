"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Clock, Calendar, BookOpen, Users, DoorOpen, Sparkles, 
  Printer, Edit3, CheckCircle2, AlertCircle, Plus, RefreshCw, 
  Layers, ChevronRight, UserCheck, ShieldAlert, Coffee, Sun, BellRing, Filter
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getTimetable, saveTimetableSlot, assignSubstitutionToSlot, bulkGenerateStandardTimetable } from "@/app/actions/timetable";
import { getFacultyList } from "@/app/actions/faculty";
import { getClasses } from "@/app/actions/classes";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const AGE_RECOMMENDATIONS = [
  { wing: "Pre-Nursery – KG", duration: "25–30 min blocks", desc: "Short learning blocks with snack, movement & play", badge: "Early Years" },
  { wing: "Classes 1–2", duration: "35–40 min periods", desc: "Foundation numeracy, literacy & motor development", badge: "Lower Primary" },
  { wing: "Classes 3–5", duration: "40 min standard", desc: "Core subjects (Math, EVS, Hindi, Eng) + Sports & STEM", badge: "Upper Primary" }
];

export default function TimetableManagementPage() {
  const { activeCampusId } = useCampusContext();
  const [timetableSlots, setTimetableSlots] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Filters
  const [selectedClass, setSelectedClass] = useState("Grade 3");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [viewMode, setViewMode] = useState<"class" | "teacher" | "matrix">("class");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("All");

  // Edit / Substitution Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [substituteTeacherId, setSubstituteTeacherId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [activeCampusId, selectedClass, selectedSection, selectedDay, selectedTeacherId]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [ttRes, facRes, clsRes] = await Promise.all([
        getTimetable(activeCampusId, {
          class_name: viewMode === "class" ? selectedClass : undefined,
          section_name: viewMode === "class" ? selectedSection : undefined,
          day_of_week: viewMode === "matrix" ? undefined : selectedDay,
          teacher_id: viewMode === "teacher" && selectedTeacherId !== "All" ? selectedTeacherId : undefined
        }),
        getFacultyList(activeCampusId),
        getClasses(activeCampusId)
      ]);

      if (ttRes.success) setTimetableSlots(ttRes.data || []);
      if (facRes.success) setFacultyList(facRes.data || []);
      if (clsRes.success) setClassesList(clsRes.data || []);
    } catch (e) {
      console.error("Error loading timetable data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAutoRegenerate() {
    if (!confirm("This will auto-optimize and provision standard 8:00 AM – 2:05 PM (40-min periods) schedule for all 11 classes across Monday–Friday. Proceed?")) return;
    setIsRegenerating(true);
    const res = await bulkGenerateStandardTimetable(activeCampusId);
    setIsRegenerating(false);
    if (res.success) {
      alert("🎉 Timetable schedule optimized & provisioned successfully!");
      loadData();
    } else {
      alert("Error: " + res.error);
    }
  }

  function handleOpenEdit(slot: any) {
    setSelectedSlot(slot);
    setEditFormData({
      id: slot.id,
      campus_id: slot.campus_id,
      day_of_week: slot.day_of_week,
      period_number: slot.period_number,
      period_label: slot.period_label,
      start_time: slot.start_time,
      end_time: slot.end_time,
      duration_minutes: slot.duration_minutes,
      break_type: slot.break_type,
      class_name: slot.class_name,
      section_name: slot.section_name,
      subject_name: slot.subject_name,
      teacher_id: slot.teacher_id || "",
      teacher_name: slot.teacher_name || "",
      room_number: slot.room_number || "Room 101",
      status: slot.status || "Active"
    });
    setEditModalOpen(true);
  }

  async function handleSaveSlot(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const assignedTeacher = facultyList.find(f => f.id === editFormData.teacher_id);
    const payload = {
      ...editFormData,
      teacher_name: assignedTeacher ? `${assignedTeacher.first_name} ${assignedTeacher.last_name || ''}`.trim() : editFormData.teacher_name
    };

    const res = await saveTimetableSlot(payload);
    setIsSaving(false);
    if (res.success) {
      setEditModalOpen(false);
      loadData();
    } else {
      alert("Failed to save slot: " + res.error);
    }
  }

  function handleOpenSubstitution(slot: any) {
    setSelectedSlot(slot);
    setSubstituteTeacherId("");
    setSubModalOpen(true);
  }

  async function handleAssignSubstitute(e: React.FormEvent) {
    e.preventDefault();
    if (!substituteTeacherId) {
      alert("Please select a substitute teacher.");
      return;
    }
    setIsSaving(true);
    const subTeacher = facultyList.find(f => f.id === substituteTeacherId);
    const subName = subTeacher ? `${subTeacher.first_name} ${subTeacher.last_name || ''}`.trim() : 'Substitute Teacher';
    
    const res = await assignSubstitutionToSlot(selectedSlot.id, substituteTeacherId, subName);
    setIsSaving(false);
    if (res.success) {
      setSubModalOpen(false);
      loadData();
    } else {
      alert("Failed to assign substitute: " + res.error);
    }
  }

  function getSubjectColor(subject: string, breakType: string) {
    if (breakType === "Assembly") return "bg-amber-500/10 border-amber-300 text-amber-900";
    if (breakType === "Short Break") return "bg-emerald-500/10 border-emerald-300 text-emerald-900";
    if (breakType === "Dispersal") return "bg-slate-500/10 border-slate-300 text-slate-800";
    
    const s = subject.toLowerCase();
    if (s.includes("math") || s.includes("number")) return "bg-blue-50 border-blue-200 text-blue-900";
    if (s.includes("science") || s.includes("evs") || s.includes("discovery")) return "bg-teal-50 border-teal-200 text-teal-900";
    if (s.includes("english") || s.includes("phonics")) return "bg-indigo-50 border-indigo-200 text-indigo-900";
    if (s.includes("hindi")) return "bg-orange-50 border-orange-200 text-orange-900";
    if (s.includes("computer") || s.includes("robotics") || s.includes("coding")) return "bg-cyan-50 border-cyan-200 text-cyan-900";
    if (s.includes("sport") || s.includes("physical") || s.includes("yoga")) return "bg-emerald-50 border-emerald-200 text-emerald-900";
    if (s.includes("art") || s.includes("craft")) return "bg-rose-50 border-rose-200 text-rose-900";
    if (s.includes("music") || s.includes("dance")) return "bg-purple-50 border-purple-200 text-purple-900";
    return "bg-stone-50 border-stone-200 text-stone-900";
  }

  function handlePrint() {
    window.print();
  }

  const distinctClasses = Array.from(new Set(classesList.map(c => c.grade))).filter(Boolean);
  const currentSections = classesList.filter(c => c.grade === selectedClass).map(c => c.section);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Academic Operations & Timetable
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Standard 8:00 AM – 2:30 PM (40-Min Periods + 1-Hour Sports & Activities)</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">School Master Timetable Hub</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Class schedules, teacher allocations, age-tailored learning blocks, and live substitute management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAutoRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? "Optimizing..." : "Auto-Optimize Schedule"}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Timetable Slip
          </button>
        </div>
      </div>

      {/* Age-Specific Learning Blocks Reference Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AGE_RECOMMENDATIONS.map((rec, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-stone-900">{rec.wing}</span>
                <span className="text-[10px] bg-stone-100 text-stone-600 font-semibold px-2 py-0.5 rounded-full">{rec.badge}</span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">{rec.desc}</p>
            </div>
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">
              {rec.duration}
            </span>
          </div>
        ))}
      </div>

      {/* Control & Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("class")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === "class" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"}`}
            >
              Class Schedule
            </button>
            <button
              onClick={() => setViewMode("teacher")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === "teacher" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"}`}
            >
              Teacher Workload
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === "matrix" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"}`}
            >
              Full Week Matrix
            </button>
          </div>

          {/* Class / Section / Teacher Selectors */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {viewMode === "class" || viewMode === "matrix" ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500">Class:</span>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      const secs = classesList.filter(c => c.grade === e.target.value).map(c => c.section);
                      if (secs.length > 0 && !secs.includes(selectedSection)) setSelectedSection(secs[0]);
                    }}
                    className="text-xs font-bold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {distinctClasses.map((c: any) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500">Section:</span>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="text-xs font-bold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currentSections.map((s: any) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-500">Faculty:</span>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="text-xs font-bold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Active Faculty ({facultyList.length})</option>
                  {facultyList.map((f: any) => (
                    <option key={f.id} value={f.id}>{f.first_name} {f.last_name || ''} ({f.designation})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Day Selector Tabs (When not in matrix mode) */}
        {viewMode !== "matrix" && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-stone-100">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  selectedDay === day 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/60"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {day}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Schedule Container */}
      <div ref={printRef} className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Printable Header Details */}
        <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-black text-stone-900">
              {viewMode === "teacher" 
                ? `Faculty Schedule — ${facultyList.find(f => f.id === selectedTeacherId)?.first_name || 'All Faculty'}`
                : `${selectedClass} • Section ${selectedSection} Master Schedule`}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {viewMode === "matrix" ? "Weekly Complete Period Matrix" : `Day Schedule for ${selectedDay}`} • Academic Session 2026-2027
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-bold text-stone-700">08:00 AM – 02:30 PM</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-stone-500">Loading period allocations...</p>
          </div>
        ) : timetableSlots.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800">No timetable entries found</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                Click "Auto-Optimize Schedule" to generate standard 40-minute periods for this class.
              </p>
            </div>
            <button
              onClick={handleAutoRegenerate}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700"
            >
              Generate Standard Timetable
            </button>
          </div>
        ) : viewMode === "matrix" ? (
          
          /* Full Week Matrix View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/50">
                  <th className="py-3 px-3 text-[11px] font-black uppercase tracking-wider text-stone-500 w-32">Time / Period</th>
                  {DAYS.map(d => (
                    <th key={d} className="py-3 px-3 text-[11px] font-black uppercase tracking-wider text-stone-700">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {Array.from(new Set(timetableSlots.map(s => s.period_number))).sort((a,b) => a-b).map(pNum => {
                  const sample = timetableSlots.find(s => s.period_number === pNum);
                  return (
                    <tr key={pNum} className={sample?.break_type !== 'None' ? 'bg-amber-50/30' : ''}>
                      <td className="py-3 px-3 font-bold text-stone-900 border-r border-stone-100">
                        <div>{sample?.period_label}</div>
                        <div className="text-[10px] text-stone-400 font-normal">{sample?.start_time} - {sample?.end_time}</div>
                      </td>
                      {DAYS.map(day => {
                        const slot = timetableSlots.find(s => s.period_number === pNum && s.day_of_week === day);
                        if (!slot) return <td key={day} className="p-3 text-stone-300">-</td>;
                        const isBreak = slot.break_type !== 'None';
                        return (
                          <td key={day} className="p-2.5">
                            <div className={`p-2.5 rounded-xl border ${getSubjectColor(slot.subject_name, slot.break_type)} transition hover:shadow-xs`}>
                              <div className="font-bold text-xs">{slot.subject_name}</div>
                              {!isBreak && (
                                <div className="text-[11px] opacity-80 mt-0.5 flex items-center justify-between">
                                  <span>{slot.teacher_name}</span>
                                  <span className="font-mono text-[9px] bg-white/60 px-1 rounded">{slot.room_number}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          
          /* Single Day Linear Flow with Period Cards */
          <div className="space-y-3">
            {timetableSlots.map((slot) => {
              const isBreak = slot.break_type !== "None";
              const isSubstitution = slot.status === "Substitution Active";

              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isBreak 
                      ? getSubjectColor(slot.subject_name, slot.break_type)
                      : isSubstitution
                        ? "bg-amber-50/40 border-amber-200 text-stone-900"
                        : "bg-white border-stone-200 text-stone-900 hover:border-blue-300 shadow-xs"
                  }`}
                >
                  {/* Left: Period & Time info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-stone-100 flex flex-col items-center justify-center shrink-0 border border-stone-200/60">
                      {isBreak ? (
                        slot.break_type === "Assembly" ? <Sun className="w-5 h-5 text-amber-600" /> : <Coffee className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <>
                          <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">P</span>
                          <span className="text-sm font-black text-stone-900 leading-none">{slot.period_number}</span>
                        </>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-stone-900">{slot.subject_name}</h4>
                        {isSubstitution && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Substitute Assigned
                          </span>
                        )}
                        <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                          {slot.duration_minutes} min
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                        <span className="font-semibold text-stone-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          {slot.start_time} – {slot.end_time}
                        </span>
                        {!isBreak && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-stone-400" />
                              {isSubstitution ? `${slot.substitution_teacher_name} (Sub)` : slot.teacher_name}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <DoorOpen className="w-3 h-3 text-stone-400" />
                              {slot.room_number}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  {!isBreak && (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenSubstitution(slot)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-lg transition"
                      >
                        Substitute
                      </button>
                      <button
                        onClick={() => handleOpenEdit(slot)}
                        className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Slot Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900">Edit Period Allocation</h3>
                <p className="text-xs text-stone-400">{editFormData.class_name} • Section {editFormData.section_name} ({editFormData.day_of_week})</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Subject Name</label>
                <input
                  type="text"
                  value={editFormData.subject_name}
                  onChange={(e) => setEditFormData({ ...editFormData, subject_name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Assigned Teacher</label>
                <select
                  value={editFormData.teacher_id}
                  onChange={(e) => setEditFormData({ ...editFormData, teacher_id: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Faculty...</option>
                  {facultyList.map((f: any) => (
                    <option key={f.id} value={f.id}>{f.first_name} {f.last_name || ''} ({f.designation})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={editFormData.start_time}
                    onChange={(e) => setEditFormData({ ...editFormData, start_time: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={editFormData.end_time}
                    onChange={(e) => setEditFormData({ ...editFormData, end_time: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Room / Lab</label>
                  <input
                    type="text"
                    value={editFormData.room_number}
                    onChange={(e) => setEditFormData({ ...editFormData, room_number: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={editFormData.duration_minutes}
                    onChange={(e) => setEditFormData({ ...editFormData, duration_minutes: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Period"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Substitution Modal */}
      {subModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900">Assign Smart Substitute</h3>
                <p className="text-xs text-stone-400">{selectedSlot.class_name}-{selectedSlot.section_name} • {selectedSlot.subject_name} ({selectedSlot.start_time})</p>
              </div>
              <button onClick={() => setSubModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleAssignSubstitute} className="space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  Primary Teacher: {selectedSlot.teacher_name}
                </div>
                <p className="text-[11px] opacity-80">Select an available faculty member with free period capacity.</p>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Available Substitute Faculty</label>
                <select
                  value={substituteTeacherId}
                  onChange={(e) => setSubstituteTeacherId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Faculty Substitute...</option>
                  {facultyList
                    .filter(f => f.id !== selectedSlot.teacher_id)
                    .map((f: any) => (
                      <option key={f.id} value={f.id}>
                        {f.first_name} {f.last_name || ''} ({f.designation} • {f.department})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSaving ? "Assigning..." : "Confirm Substitution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
