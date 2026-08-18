"use client";

import { useState } from "react";
import { Check, X, Clock, Search, Filter, Save } from "lucide-react";
import Image from "next/image";

type Student = {
  id: string;
  name: string;
  rollNumber: string;
  photoUrl: string;
  status: "Present" | "Absent" | "Late" | null;
};

const mockStudents: Student[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `S${i + 1}`,
  name: `Student ${i + 1}`,
  rollNumber: `2026-${(100 + i).toString()}`,
  photoUrl: `https://i.pravatar.cc/150?u=student${i}`,
  status: null,
}));

export default function AttendanceGrid() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = (id: string, status: "Present" | "Absent" | "Late") => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
  };

  const markAll = (status: "Present" | "Absent") => {
    setStudents(students.map(s => ({ ...s, status })));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Attendance Saved to Database successfully!");
      setIsSubmitting(false);
    }, 1000);
  };

  const presentCount = students.filter(s => s.status === "Present").length;
  const absentCount = students.filter(s => s.status === "Absent").length;
  const lateCount = students.filter(s => s.status === "Late").length;
  const pendingCount = students.filter(s => s.status === null).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Grade 4A • Homeroom</h1>
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search student..." className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-48" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-sm font-bold">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">{presentCount}</div>
            Present
          </div>
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">{absentCount}</div>
            Absent
          </div>
          <div className="flex items-center gap-2 text-amber-600">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">{lateCount}</div>
            Late
          </div>
          <div className="flex items-center gap-2 text-slate-500 border-l border-slate-200 pl-6">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">{pendingCount}</div>
            Pending
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => markAll("Present")} className="px-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">Mark All Present</button>
        </div>
      </div>

      {/* Interactive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {students.map((student) => (
          <div 
            key={student.id} 
            className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col items-center p-4 shadow-sm group ${
              student.status === "Present" ? "border-emerald-500 ring-1 ring-emerald-500" :
              student.status === "Absent" ? "border-red-500 ring-1 ring-red-500" :
              student.status === "Late" ? "border-amber-500 ring-1 ring-amber-500" :
              "border-slate-200 hover:border-slate-300"
            }`}
          >
            {/* Status Indicator Icon (Top Right) */}
            <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white scale-0 transition-transform ${student.status ? 'scale-100' : ''} ${
              student.status === "Present" ? "bg-emerald-500" :
              student.status === "Absent" ? "bg-red-500" :
              student.status === "Late" ? "bg-amber-500" : ""
            }`}>
              {student.status === "Present" && <Check className="w-3 h-3" />}
              {student.status === "Absent" && <X className="w-3 h-3" />}
              {student.status === "Late" && <Clock className="w-3 h-3" />}
            </div>

            <div className="w-16 h-16 rounded-full overflow-hidden mb-3 ring-2 ring-white shadow-sm">
              <Image src={student.photoUrl} alt={student.name} width={64} height={64} className="object-cover" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm text-center line-clamp-1">{student.name}</h3>
            <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">{student.rollNumber}</p>

            {/* Quick Actions Hover State */}
            <div className={`absolute inset-x-0 bottom-0 p-2 bg-white/95 backdrop-blur-sm border-t border-slate-100 flex justify-center gap-1 transition-transform duration-200 ${student.status ? 'translate-y-full group-hover:translate-y-0' : 'translate-y-0'}`}>
              <button onClick={() => handleStatusChange(student.id, "Present")} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
              <button onClick={() => handleStatusChange(student.id, "Absent")} className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
              <button onClick={() => handleStatusChange(student.id, "Late")} className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-colors"><Clock className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={handleSubmit}
          disabled={pendingCount === students.length || isSubmitting}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-full shadow-2xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">Saving...</span>
          ) : (
            <span className="flex items-center gap-2"><Save className="w-5 h-5" /> Submit Attendance</span>
          )}
        </button>
      </div>

    </div>
  );
}
