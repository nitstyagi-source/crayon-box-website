"use client";

import React, { useState } from 'react';
import {
  Calendar, Clock, Users, UserCheck, CheckCircle2,
  AlertCircle, Download, Plus, Filter, ArrowRight
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function PtmSchedulePage() {
  const [selectedInst, setSelectedInst] = useState<string>('CBS');

  const ptmSlots = [
    { slotTime: '09:00 - 09:15 AM', teacher: 'Dr. Meenakshi Sundaram (Math)', parent: 'Rajesh Sharma (Aarav - 4B)', mode: 'IN_PERSON_ROOM_402', status: 'CONFIRMED' },
    { slotTime: '09:15 - 09:30 AM', teacher: 'Dr. Meenakshi Sundaram (Math)', parent: 'Deepak Patel (Aditi - 4B)', mode: 'IN_PERSON_ROOM_402', status: 'CONFIRMED' },
    { slotTime: '09:30 - 09:45 AM', teacher: 'Prof. Anil Gupta (Science)', parent: 'Amit Gupta (Vihaan - 7A)', mode: 'ONLINE_GOOGLE_MEET', status: 'CONFIRMED' },
    { slotTime: '09:45 - 10:00 AM', teacher: 'Dr. Meenakshi Sundaram (Math)', parent: 'Available Open Slot', mode: 'IN_PERSON_ROOM_402', status: 'AVAILABLE' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Parent Partnership
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Term 1 PTM: Saturday, Aug 29</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Parent-Teacher Meeting (PTM) Slot Booking</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            15-minute 1-on-1 parent slots, hybrid meeting links, and post-conference actionable academic notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export PTM Master Schedule
          </button>
        </div>
      </div>

      {/* PTM Slot Schedule Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" /> Active PTM Slot Matrix (Session 1)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Time Slot</th>
                <th className="p-3.5">Faculty Member</th>
                <th className="p-3.5">Booked Parent & Student</th>
                <th className="p-3.5">Meeting Mode</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {ptmSlots.map((slot, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5 font-black text-stone-900">{slot.slotTime}</td>
                  <td className="p-3.5 font-bold text-stone-800">{slot.teacher}</td>
                  <td className="p-3.5 font-semibold text-stone-900">{slot.parent}</td>
                  <td className="p-3.5 text-stone-600 font-medium">{slot.mode.replace(/_/g, ' ')}</td>
                  <td className="p-3.5 text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      slot.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {slot.status}
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
