"use client";

import React, { useState } from 'react';
import {
  ShieldCheck, QrCode, UserCheck, Clock, Download,
  Plus, Search, Phone, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function VisitorGatePassPage() {
  const [selectedInst, setSelectedInst] = useState<string>('CBS');

  const activeVisitors = [
    {
      passId: 'PASS-2026-891',
      visitorName: 'Rajeev Malhotra',
      phone: '+91 98111 44556',
      purpose: 'Prospective Parent Campus Admission Tour',
      personToMeet: 'Ms. Preeti Verma (Admissions Head)',
      checkInTime: '10:30 AM',
      validUntil: '12:00 PM (1h 30m Remaining)',
      badgeNumber: 'VISITOR-04',
      status: 'ON_CAMPUS',
    },
    {
      passId: 'PASS-2026-892',
      visitorName: 'Kunal Sachdeva (RoboTech Vendor)',
      phone: '+91 98222 66778',
      purpose: 'Robotics Lab Equipment Installation',
      personToMeet: 'Prof. Anil Gupta (Robotics HOD)',
      checkInTime: '09:45 AM',
      validUntil: '01:00 PM (2h 45m Remaining)',
      badgeNumber: 'CONTRACTOR-02',
      status: 'ON_CAMPUS',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Perimeter Access Control
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Main Gate Security Desk</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Visitor Gate Pass & Campus Security</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Government ID verification, host employee approval notifications, timed QR badges, and exit departure logging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Visitor Log
          </button>
        </div>
      </div>

      {/* Active On-Campus Visitors Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Currently On-Campus Visitors ({activeVisitors.length})
          </h2>
          <span className="text-xs text-stone-400 font-semibold">Real-Time Security Desk Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Pass ID & Badge</th>
                <th className="p-3.5">Visitor & Contact</th>
                <th className="p-3.5">Purpose of Visit</th>
                <th className="p-3.5">Host Staff Member</th>
                <th className="p-3.5">Check-In Time</th>
                <th className="p-3.5">Pass Validity</th>
                <th className="p-3.5 text-right">Gate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {activeVisitors.map((v) => (
                <tr key={v.passId} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5 font-bold font-mono text-stone-900">
                    <span className="block">{v.passId}</span>
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">{v.badgeNumber}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-black text-stone-900 block text-sm">{v.visitorName}</span>
                    <span className="text-stone-500 text-[11px]">📞 {v.phone}</span>
                  </td>
                  <td className="p-3.5 font-medium text-stone-800 max-w-[200px]">{v.purpose}</td>
                  <td className="p-3.5 font-semibold text-stone-900">{v.personToMeet}</td>
                  <td className="p-3.5 font-bold text-stone-700">{v.checkInTime}</td>
                  <td className="p-3.5 font-bold text-emerald-700">{v.validUntil}</td>
                  <td className="p-3.5 text-right">
                    <button className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition">
                      Scan Departure
                    </button>
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
