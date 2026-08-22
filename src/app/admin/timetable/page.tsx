"use client";

import React, { useState } from 'react';
import {
  Clock, Calendar, Users, UserCheck, AlertTriangle,
  CheckCircle2, Plus, Download, ArrowRight, Sparkles, Filter
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function MasterTimetablePage() {
  const [selectedInst, setSelectedInst] = useState<string>('CBS');
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 4-B');

  const timetableSlots = [
    { period: 1, time: '08:00 - 08:45 AM', mon: 'Mathematics (Dr. Sundaram)', tue: 'Mathematics (Dr. Sundaram)', wed: 'Science Lab (Prof. Gupta)', thu: 'Mathematics (Dr. Sundaram)', fri: 'English Lit (Ms. Jenkins)' },
    { period: 2, time: '08:45 - 09:30 AM', mon: 'Science & Robotics (Prof. Gupta)', tue: 'Computer Science (Mr. Singh)', wed: 'Mathematics (Dr. Sundaram)', thu: 'Social Studies (Ms. Nair)', fri: 'Mathematics (Dr. Sundaram)' },
    { period: 3, time: '09:30 - 10:15 AM', mon: 'English Literature (Ms. Jenkins)', tue: 'English Literature (Ms. Jenkins)', wed: 'English Lit (Ms. Jenkins)', thu: 'Science & Robotics (Prof. Gupta)', fri: 'Social Studies (Ms. Nair)' },
    { period: 4, time: '10:15 - 11:00 AM', mon: 'Computer & AI (Mr. Singh)', tue: 'Social Studies (Ms. Nair)', wed: 'Robotics Lab (Prof. Gupta)', thu: 'Music & Arts (Mr. Roy)', fri: 'Physical Ed & Sports' },
    { period: 5, time: '11:45 - 12:30 PM', mon: 'Social Studies (Ms. Nair)', tue: 'Science (Prof. Gupta)', wed: 'Mathematics (Dr. Sundaram)', thu: 'English Lit (Ms. Jenkins)', fri: 'Computer & AI (Mr. Singh)' },
    { period: 6, time: '12:30 - 01:15 PM', mon: 'Library & Reading (Mrs. Joshi)', tue: 'Mathematics (Dr. Sundaram)', wed: 'Social Studies (Ms. Nair)', thu: 'Science (Prof. Gupta)', fri: 'STEAM Innovation Lab' },
  ];

  const pendingSubstitutions = [
    {
      id: 'SUB-01',
      absentFaculty: 'Dr. S. K. Roy (Grade 5A - Math P2)',
      reason: 'Approved Medical Leave',
      recommendedSubstitute: 'Dr. Meenakshi Sundaram (Qualified • Free Period 2 • Workload: 4/6)',
      status: 'ASSIGNED',
    },
    {
      id: 'SUB-02',
      absentFaculty: 'Prof. R. K. Varma (Grade 9B - Physics P4)',
      reason: 'Personal Leave',
      recommendedSubstitute: 'Prof. Anil Gupta (Qualified • Free Period 4 • Workload: 3/6)',
      status: 'PENDING_CONFIRMATION',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Conflict-Free Scheduling
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Timetable Version: Published (v2.1)</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Master Timetable & Substitution Engine</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            8-period weekly schedule builder with automatic teacher clash detection and intelligent substitute ranking.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl">
          {VANI_TRUST_INSTITUTIONS.map((inst) => (
            <button
              key={inst.code}
              onClick={() => setSelectedInst(inst.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedInst === inst.code ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {inst.code}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Faculty Substitutions Alert Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" /> Today's Intelligent Faculty Substitutions ({pendingSubstitutions.length})
          </h2>
          <span className="text-xs text-stone-400 font-semibold">Ranked by Subject Match & Lowest Workload</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingSubstitutions.map((sub) => (
            <div key={sub.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-stone-900 text-sm">{sub.absentFaculty}</h3>
                  <p className="text-stone-500 font-medium">{sub.reason}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                  sub.status === 'ASSIGNED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {sub.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-indigo-900 font-semibold pt-1 border-t border-stone-200">
                🎯 Best Substitute: {sub.recommendedSubstitute}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Timetable Schedule Grid */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Weekly Schedule for {selectedGrade} ({selectedInst})
            </h2>
            <p className="text-xs text-stone-400 font-semibold mt-0.5">Room 402 • Class Teacher: Dr. Meenakshi Sundaram</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition"
          >
            <Download className="w-3.5 h-3.5" /> Print Timetable
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Period & Time</th>
                <th className="p-3.5">Monday</th>
                <th className="p-3.5">Tuesday</th>
                <th className="p-3.5">Wednesday</th>
                <th className="p-3.5">Thursday</th>
                <th className="p-3.5">Friday</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {timetableSlots.map((slot) => (
                <tr key={slot.period} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5 font-bold text-stone-900">
                    <span className="font-black text-indigo-600 block">Period {slot.period}</span>
                    <span className="text-stone-400 text-[10px]">{slot.time}</span>
                  </td>
                  <td className="p-3.5 font-semibold text-stone-800">{slot.mon}</td>
                  <td className="p-3.5 font-semibold text-stone-800">{slot.tue}</td>
                  <td className="p-3.5 font-semibold text-stone-800">{slot.wed}</td>
                  <td className="p-3.5 font-semibold text-stone-800">{slot.thu}</td>
                  <td className="p-3.5 font-semibold text-stone-800">{slot.fri}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
