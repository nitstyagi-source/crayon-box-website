"use client";

import React, { useState } from 'react';
import {
  QrCode, UserCheck, ShieldCheck, Clock, Download,
  Plus, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function EarlyDepartureGatePassPage() {
  const [selectedInst, setSelectedInst] = useState<string>('CBS');

  const gatePasses = [
    {
      id: 'EPASS-2026-041',
      studentName: 'Aarav Sharma (Grade 4B - CBS)',
      departureReason: 'Scheduled Doctor Appointment (Orthodontist)',
      pickupPerson: 'Rajesh Sharma (Father • Aadhaar Verified)',
      authorizedBy: 'Dr. Ananya Roy (Principal)',
      gateDepartureTime: '01:30 PM (Regular End: 03:30 PM)',
      securityScanStatus: 'DEPARTED_GATE_1',
    },
    {
      id: 'EPASS-2026-042',
      studentName: 'Vihaan Gupta (Grade 7A - AS)',
      departureReason: 'Mild Fever & Headache (Infirmary Referral)',
      pickupPerson: 'Sunita Gupta (Mother • Verified)',
      authorizedBy: 'Nurse Rita D\'Souza & Class Teacher',
      gateDepartureTime: '12:15 PM',
      securityScanStatus: 'DEPARTED_GATE_1',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Student Safeguarding
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Authorized Escort Verification</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Student Early Departure & Pickup Gate Pass</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Principal/Coordinator digital authorization, biometric/ID verification of pickup guardian, and gate checkout scanning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Departure Register
          </button>
        </div>
      </div>

      {/* Early Departure Passes Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-indigo-600" /> Today's Authorized Early Departure Gate Passes
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Pass ID & Student</th>
                <th className="p-3.5">Departure Reason</th>
                <th className="p-3.5">Authorized Pickup Escort</th>
                <th className="p-3.5">Authorized By</th>
                <th className="p-3.5">Departure Time</th>
                <th className="p-3.5 text-right">Gate Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {gatePasses.map((pass) => (
                <tr key={pass.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-stone-900 block">{pass.id}</span>
                    <span className="font-bold text-stone-800 text-sm">{pass.studentName}</span>
                  </td>
                  <td className="p-3.5 text-stone-700 font-medium">{pass.departureReason}</td>
                  <td className="p-3.5 font-bold text-indigo-700">{pass.pickupPerson}</td>
                  <td className="p-3.5 font-semibold text-stone-700">{pass.authorizedBy}</td>
                  <td className="p-3.5 font-bold text-stone-900">{pass.gateDepartureTime}</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-[10px] uppercase">
                      ✓ {pass.securityScanStatus}
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
