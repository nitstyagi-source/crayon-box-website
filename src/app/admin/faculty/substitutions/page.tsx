"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, ArrowLeft, Clock, Calendar, AlertCircle, CheckCircle2, 
  Sparkles, UserCheck, Search, Filter, ShieldAlert, Building2
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getFacultyList } from "@/app/actions/faculty";
import { getFreeTeachersForPeriod, assignSubstitution } from "@/app/actions/faculty-enterprise";
import { getClasses } from "@/app/actions/classes";

export default function SmartSubstitutionPage() {
  const { activeCampusId } = useCampusContext();
  const [faculty, setFaculty] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(2);
  const [absentTeacherId, setAbsentTeacherId] = useState("");
  const [selectedClass, setSelectedClass] = useState("Grade 5-A");
  const [selectedSubject, setSelectedSubject] = useState("Science");
  const [reason, setReason] = useState("Casual Leave");
  
  const [freeTeachers, setFreeTeachers] = useState<any[]>([]);
  const [isLoadingFree, setIsLoadingFree] = useState(false);
  const [assignedSubs, setAssignedSubs] = useState<any[]>([
    {
      id: "sub-1",
      date: new Date().toISOString().split("T")[0],
      absent_teacher: "Meenakshi Sundaram",
      substitute_teacher: "Vikram Malhotra",
      class_name: "Grade 5-A",
      period: "Period 2 (08:40 AM)",
      subject: "Science Lab",
      status: "Active / In-Class"
    }
  ]);

  useEffect(() => {
    async function init() {
      const [facRes, classRes] = await Promise.all([
        getFacultyList(activeCampusId),
        getClasses(activeCampusId)
      ]);
      if (facRes.success) {
        setFaculty(facRes.data);
        if (facRes.data.length > 0) setAbsentTeacherId(facRes.data[0].id);
      }
      if (classRes.success) setClasses(classRes.data);
    }
    init();
  }, [activeCampusId]);

  useEffect(() => {
    async function fetchFree() {
      setIsLoadingFree(true);
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayOfWeek = dayNames[new Date(selectedDate).getDay()] || "Monday";
      const res = await getFreeTeachersForPeriod(activeCampusId, dayOfWeek, selectedPeriod, selectedDate);
      if (res.success) {
        setFreeTeachers(res.data);
      }
      setIsLoadingFree(false);
    }
    fetchFree();
  }, [activeCampusId, selectedDate, selectedPeriod]);

  async function handleAssign(substituteTeacher: any) {
    const absentTeacher = faculty.find(f => f.id === absentTeacherId);
    const absentName = absentTeacher ? `${absentTeacher.first_name} ${absentTeacher.last_name || ''}` : "Teacher";
    const subName = `${substituteTeacher.first_name} ${substituteTeacher.last_name || ''}`;

    const res = await assignSubstitution({
      campus_id: activeCampusId,
      substitution_date: selectedDate,
      absent_staff_id: absentTeacherId,
      class_name: selectedClass,
      period_number: selectedPeriod,
      subject_name: selectedSubject,
      substitute_staff_id: substituteTeacher.id,
      reason,
      auto_suggested: true
    });

    if (res.success) {
      setAssignedSubs([
        {
          id: res.data?.id || `sub-${Date.now()}`,
          date: selectedDate,
          absent_teacher: absentName,
          substitute_teacher: subName,
          class_name: selectedClass,
          period: `Period ${selectedPeriod}`,
          subject: selectedSubject,
          status: "Assigned"
        },
        ...assignedSubs
      ]);
      alert(`Successfully assigned ${subName} as substitute for ${selectedClass}!`);
    } else {
      alert("Failed to assign substitution: " + res.error);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <Link 
            href="/admin/faculty" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Faculty Hub
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Smart Substitution Engine</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">Automatic detection of present teachers with zero period assignments for full classroom coverage.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Attendance & Timetable Linked
          </span>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step 1: Absent Teacher & Period Allocation */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-black text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-3">
            <AlertCircle className="w-4 h-4 text-amber-500" /> 1. Select Absent Slot
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-stone-500 block mb-1">Date</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-500 block mb-1">Absent Teacher</label>
              <select 
                value={absentTeacherId}
                onChange={e => setAbsentTeacherId(e.target.value)}
                className="w-full border border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
              >
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.first_name} {f.last_name} ({f.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-stone-500 block mb-1">Period</label>
                <select 
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(Number(e.target.value))}
                  className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
                >
                  <option value={1}>Period 1 (08:00 AM)</option>
                  <option value={2}>Period 2 (08:40 AM)</option>
                  <option value={3}>Period 3 (09:20 AM)</option>
                  <option value={4}>Period 4 (10:20 AM)</option>
                  <option value={5}>Period 5 (11:00 AM)</option>
                  <option value={6}>Period 6 (11:40 AM)</option>
                  <option value={7}>Period 7 (12:45 PM)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-500 block mb-1">Class & Section</label>
                <select 
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="Grade 5-A">Grade 5-A</option>
                  <option value="Grade 4-A">Grade 4-A</option>
                  <option value="Grade 3-A">Grade 3-A</option>
                  <option value="Grade 2-A">Grade 2-A</option>
                  <option value="Grade 1-A">Grade 1-A</option>
                  <option value="UKG-Jupiter">UKG Jupiter</option>
                  <option value="Nursery-Earth">Nursery Earth</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-500 block mb-1">Subject</label>
              <input 
                type="text" 
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full border border-stone-200 p-2.5 rounded-xl font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Auto-Suggested Free Teachers */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" /> 2. Present Teachers (No Periods Assigned)
              </h3>
              <p className="text-[11px] text-stone-400">Educators marked present today with zero scheduled classes during Period {selectedPeriod}.</p>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {freeTeachers.length} Free & Present
            </span>
          </div>

          {isLoadingFree ? (
            <div className="py-12 text-center text-stone-400 font-bold text-xs animate-pulse">
              Scanning attendance & timetable matrices...
            </div>
          ) : freeTeachers.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              No free & present teachers found for this period. Try another slot.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {freeTeachers.map(teacher => (
                <div 
                  key={teacher.id} 
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {teacher.photo_url ? (
                      <img src={teacher.photo_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 font-black flex items-center justify-center text-xs shrink-0">
                        {teacher.first_name?.[0] || "T"}{teacher.last_name?.[0] || ""}
                      </div>
                    )}
                    <div className="truncate">
                      <p className="font-bold text-stone-900 text-xs truncate">{teacher.first_name} {teacher.last_name || ''}</p>
                      <p className="text-[11px] text-stone-500 truncate">{teacher.department}</p>
                      <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-100/60 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        🟢 {teacher.assigned_periods_today || 0} periods today
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAssign(teacher)}
                    className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm shrink-0"
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Active Substitutions Roster */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-black text-stone-900 text-lg">Active Substitution Roster</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Absent Faculty</th>
                <th className="p-3.5">Assigned Substitute</th>
                <th className="p-3.5">Class & Subject</th>
                <th className="p-3.5">Period</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {assignedSubs.map(sub => (
                <tr key={sub.id} className="hover:bg-stone-50/60">
                  <td className="p-3.5 font-bold font-mono text-stone-900">{sub.date}</td>
                  <td className="p-3.5 text-red-600 font-bold">{sub.absent_teacher}</td>
                  <td className="p-3.5 text-emerald-700 font-bold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> {sub.substitute_teacher}
                  </td>
                  <td className="p-3.5 font-bold text-stone-800">{sub.class_name} • {sub.subject}</td>
                  <td className="p-3.5 font-mono text-stone-600">{sub.period}</td>
                  <td className="p-3.5">
                    <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
