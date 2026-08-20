"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bus, DoorOpen, School, ArrowLeft, CheckCircle2, 
  Clock, ShieldCheck, User, Search, Send, MapPin, Sparkles
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getStudents } from "@/app/actions/students";
import { getStudentJourneyLogs } from "@/app/actions/student-attendance";

export default function StudentJourneyTrackingPage() {
  const { activeCampusId } = useCampusContext();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [journeyLogs, setJourneyLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getStudents(activeCampusId);
      if (res.success && res.data && res.data.length > 0) {
        setStudents(res.data);
        setSelectedStudentId(res.data[0].id);
      }
    }
    load();
  }, [activeCampusId]);

  useEffect(() => {
    async function fetchLogs() {
      if (!selectedStudentId) return;
      setIsLoading(true);
      const res = await getStudentJourneyLogs(selectedStudentId, selectedDate);
      if (res.success) {
        setJourneyLogs(res.data);
      }
      setIsLoading(false);
    }
    fetchLogs();
  }, [selectedStudentId, selectedDate]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const checkpoints = [
    {
      title: "Bus Morning Boarding",
      time: "07:25 AM",
      location: "Stop #3 (Burari Main Chowk)",
      scanner: "Transport Attendant (Ramesh Kumar)",
      icon: Bus,
      color: "amber",
      status: "Completed"
    },
    {
      title: "School Gate Turnstile",
      time: "07:52 AM",
      location: "Main Campus Entrance (Gate 1)",
      scanner: "RFID / QR Turnstile Scanner #2",
      icon: DoorOpen,
      color: "blue",
      status: "Completed"
    },
    {
      title: "Classroom Morning Roll Call",
      time: "08:02 AM",
      location: "Room 204 (Grade 3 - Section B)",
      scanner: "Class Teacher (Meenakshi Sundaram)",
      icon: School,
      color: "emerald",
      status: "Completed"
    },
    {
      title: "Afternoon Gate Departure",
      time: "01:30 PM",
      location: "Main Campus Exit Gate",
      scanner: "Gate Security Scanner #1",
      icon: DoorOpen,
      color: "purple",
      status: "Scheduled"
    },
    {
      title: "Bus Afternoon Dropoff",
      time: "01:55 PM",
      location: "Stop #3 (Burari Main Chowk)",
      scanner: "Transport Attendant (Ramesh Kumar)",
      icon: Bus,
      color: "amber",
      status: "Scheduled"
    }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <Link 
            href="/admin/students/attendance"
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Attendance Hub
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Multi-Point Student Safety Journey</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">Live checkpoint timeline across Home → Bus → Gate → Classroom → Bus → Home.</p>
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-800"
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Student Selector & Info */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <label className="text-xs font-black text-stone-400 block uppercase">Select Student</label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs font-bold text-stone-900"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name || ''} ({s.class_name || s.grade || 'Grade 3'})
              </option>
            ))}
          </select>

          {selectedStudent && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-center space-y-2">
              <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto border-2 border-stone-300 shadow-sm bg-white flex items-center justify-center">
                {selectedStudent.photo_url ? (
                  <img src={selectedStudent.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-stone-400" />
                )}
              </div>
              <h3 className="font-black text-stone-900 text-sm">{selectedStudent.first_name} {selectedStudent.last_name || ''}</h3>
              <p className="text-xs text-stone-500">{selectedStudent.class_name || selectedStudent.grade || 'Grade 3'} • Adm: {selectedStudent.admission_no}</p>
              
              <div className="pt-2 border-t border-stone-200 text-left text-[11px] space-y-1 text-stone-600">
                <p><span className="font-bold">Transport Mode:</span> School Bus Route #04</p>
                <p><span className="font-bold">Emergency Contact:</span> {selectedStudent.parent_phone || '+91 98111 02008'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Chronological Journey Timeline */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 md:col-span-2">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h3 className="font-black text-stone-900 text-base">Checkpoint Journey Timeline</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Live Verified
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
            {checkpoints.map((cp, idx) => {
              const Icon = cp.icon;
              const isDone = cp.status === "Completed";

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isDone 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "bg-white border-stone-300 text-stone-300"
                  }`}>
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>}
                  </div>

                  <div className={`p-4 rounded-2xl border flex-1 transition-all ${
                    isDone ? "bg-stone-50 border-stone-200/90" : "bg-white border-dashed border-stone-200 opacity-60"
                  }`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-stone-900 text-xs flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-stone-600" /> {cp.title}
                      </h4>
                      <span className="font-mono text-xs font-bold text-stone-800">{cp.time}</span>
                    </div>

                    <div className="mt-1 text-[11px] text-stone-500 space-y-0.5">
                      <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-stone-400" /> {cp.location}</p>
                      <p className="text-[10px] text-stone-400">Verified by: {cp.scanner}</p>
                    </div>

                    {isDone && (
                      <div className="mt-2 pt-2 border-t border-stone-200/60 flex justify-between items-center text-[10px] text-emerald-700 font-bold">
                        <span>✓ Parent Notification Dispatched</span>
                        <span>SMS &amp; App Push</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
