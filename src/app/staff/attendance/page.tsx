"use client";

import { useState, useEffect } from "react";
import { Check, X, Clock, Search, Filter, Save, CheckCircle2 } from "lucide-react";
import {
  getClassStudentRosterForAttendance,
  batchSubmitClassAttendance
} from "@/app/actions/student-attendance";

type Student = {
  id: string;
  name: string;
  rollNumber: string;
  photoUrl: string;
  status: "Present" | "Absent" | "Late" | null;
};

export default function AttendanceGrid() {
  const [students, setStudents] = useState<Student[]>([]);
  const [className, setClassName] = useState("Grade 4");
  const [sectionName, setSectionName] = useState("A");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);

  useEffect(() => {
    loadClassRoster();
  }, [className, sectionName]);

  async function loadClassRoster() {
    setIsLoading(true);
    try {
      const res = await getClassStudentRosterForAttendance(className, sectionName);
      if (res.success && res.data && res.data.length > 0) {
        setStudents(
          res.data.map((s: any) => ({
            id: s.id,
            name: `${s.first_name} ${s.last_name || ''}`.trim(),
            rollNumber: s.admission_no || s.roll_no || 'ADM-2026',
            photoUrl: s.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${s.first_name}`,
            status: (s.current_attendance_status as any) || null
          }))
        );
      } else {
        setStudents([]);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleStatusChange = (id: string, status: "Present" | "Absent" | "Late") => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
  };

  const markAll = (status: "Present" | "Absent") => {
    setStudents(students.map(s => ({ ...s, status })));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitNotice(null);
    try {
      const attendanceMap: Record<string, string> = {};
      students.forEach(s => {
        attendanceMap[s.id] = s.status || 'Present';
      });

      const res = await batchSubmitClassAttendance({
        className,
        sectionName,
        date: new Date().toISOString().split('T')[0],
        attendanceMap
      });

      if (res.success) {
        setSubmitNotice(`✓ Attendance register saved to database! Recorded ${res.count} student records.`);
      } else {
        alert(res.error || "Failed to save attendance");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentCount = students.filter(s => s.status === "Present").length;
  const absentCount = students.filter(s => s.status === "Absent").length;
  const lateCount = students.filter(s => s.status === "Late").length;
  const pendingCount = students.filter(s => s.status === null).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{className} {sectionName} • Homeroom Register</h1>
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-semibold">
            <span className="text-stone-400">Class:</span>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="bg-transparent font-bold text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
            </select>
          </div>

          <button 
            onClick={() => markAll("Present")}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Mark All Present
          </button>
          <button 
            onClick={() => markAll("Absent")}
            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Mark All Absent
          </button>
        </div>
      </div>

      {submitNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{submitNotice}</span>
        </div>
      )}

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-emerald-700 block">Present</span>
          <strong className="text-2xl font-black text-emerald-900">{presentCount}</strong>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Students in class</span>
        </div>
        <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-rose-700 block">Absent</span>
          <strong className="text-2xl font-black text-rose-900">{absentCount}</strong>
          <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">Alerts staged</span>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-amber-700 block">Late Arrival</span>
          <strong className="text-2xl font-black text-amber-900">{lateCount}</strong>
          <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">Time logged</span>
        </div>
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-stone-500 block">Pending Roll Call</span>
          <strong className="text-2xl font-black text-stone-900">{pendingCount}</strong>
          <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">Of {students.length} total</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <div 
            key={student.id}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              student.status === "Present" 
                ? "bg-emerald-50/50 border-emerald-200" 
                : student.status === "Absent"
                ? "bg-rose-50/50 border-rose-200"
                : student.status === "Late"
                ? "bg-amber-50/50 border-amber-200"
                : "bg-white border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-700 text-xs shrink-0 overflow-hidden relative">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  student.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <strong className="text-xs font-bold text-stone-900 block truncate">{student.name}</strong>
                <span className="text-[10px] text-stone-500 font-mono block truncate">{student.rollNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleStatusChange(student.id, "Present")}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  student.status === "Present" 
                    ? "bg-emerald-600 text-white shadow-xs" 
                    : "bg-stone-100 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50"
                }`}
                title="Mark Present"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStatusChange(student.id, "Absent")}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  student.status === "Absent" 
                    ? "bg-rose-600 text-white shadow-xs" 
                    : "bg-stone-100 text-stone-400 hover:text-rose-700 hover:bg-rose-50"
                }`}
                title="Mark Absent"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStatusChange(student.id, "Late")}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  student.status === "Late" 
                    ? "bg-amber-500 text-white shadow-xs" 
                    : "bg-stone-100 text-stone-400 hover:text-amber-700 hover:bg-amber-50"
                }`}
                title="Mark Late"
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {students.length === 0 && !isLoading && (
          <div className="col-span-full p-12 text-center text-stone-400 text-xs border border-dashed border-stone-200 rounded-2xl">
            No student enrollment records found for {className} {sectionName}.
          </div>
        )}
      </div>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-slate-700/50 z-40">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span>Total: <strong>{students.length}</strong></span>
          <span className="text-emerald-400">P: <strong>{presentCount}</strong></span>
          <span className="text-rose-400">A: <strong>{absentCount}</strong></span>
          <span className="text-amber-400">L: <strong>{lateCount}</strong></span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || students.length === 0}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSubmitting ? "Saving..." : "Submit to Database"}</span>
        </button>
      </div>

    </div>
  );
}
