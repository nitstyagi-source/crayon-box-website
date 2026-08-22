"use client";

import React, { useState } from 'react';
import {
  LifeBuoy, MessageSquare, Clock, CheckCircle2,
  AlertTriangle, Download, Plus, ArrowRight, UserCheck
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function GrievanceHelpdeskPage() {
  const [selectedInst, setSelectedInst] = useState<string>('ALL');

  const tickets = [
    {
      id: 'TKT-2026-088',
      parentName: 'Rohan Singhania',
      studentName: 'Kabir (Grade 1 - CBS)',
      category: 'Transport / Bus Stop Pickup Timing',
      description: 'Morning bus arriving 10 minutes earlier than scheduled pickup time on Route 4.',
      assignedOfficer: 'Mr. Suresh Yadav (Transport Supervisor)',
      slaRemaining: '18h Remaining (Within 48h SLA)',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
    },
    {
      id: 'TKT-2026-089',
      parentName: 'Deepak Patel',
      studentName: 'Aditi (Grade 4B - CBS)',
      category: 'Fee Invoice / Sibling Concession',
      description: 'Sibling concession adjustment query for Term 2 invoice.',
      assignedOfficer: 'Mr. Rajeshwar Sen (Accounts Officer)',
      slaRemaining: 'Resolved in 4h',
      priority: 'LOW',
      status: 'RESOLVED',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Parent Care & SLA Desk
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">48-Hour Resolution Guarantee</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Parent Grievance & Helpdesk Resolution</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Categorized parent ticket management, SLA breach alarms, automated escalation, and satisfaction ratings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export SLA Report
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-indigo-600" /> Active Support Tickets & SLA Countdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Ticket ID & Parent</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Assigned Officer</th>
                <th className="p-3.5">SLA Status</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-stone-900 block">{t.id}</span>
                    <span className="text-stone-500 font-semibold">{t.parentName} ({t.studentName})</span>
                  </td>
                  <td className="p-3.5 font-bold text-indigo-700">{t.category}</td>
                  <td className="p-3.5 text-stone-800 max-w-[280px]">{t.description}</td>
                  <td className="p-3.5 font-medium text-stone-700">{t.assignedOfficer}</td>
                  <td className="p-3.5 font-black text-emerald-700">{t.slaRemaining}</td>
                  <td className="p-3.5 text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status.replace(/_/g, ' ')}
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
