"use client";

import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, Lock, AlertTriangle, CheckCircle2,
  FileText, Download, Eye, EyeOff, UserCheck
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function SafeguardingIncidentsPage() {
  const [activeTab, setActiveTab] = useState<'ORDINARY_DISCIPLINE' | 'CONFIDENTIAL_SAFEGUARDING'>('ORDINARY_DISCIPLINE');
  const [isDsoUnlocked, setIsDsoUnlocked] = useState(false);

  const ordinaryIncidents = [
    {
      id: 'DISC-2026-041',
      date: '2026-08-20',
      studentName: 'Vihaan Agarwal (Grade 5A - CBS)',
      category: 'Playground Dispute / Minor Push',
      reportedBy: 'Physical Ed Teacher',
      actionTaken: 'Verbal counselling + Reflection note logged. Parent informed via portal.',
      status: 'RESOLVED',
    },
    {
      id: 'DISC-2026-042',
      date: '2026-08-21',
      studentName: 'Rohan Verma (Grade 9A - AVM)',
      category: 'Repeated Homework Default',
      reportedBy: 'Mathematics Teacher',
      actionTaken: 'Remedial study session assigned. Teacher-parent conference scheduled.',
      status: 'UNDER_MONITORING',
    },
  ];

  const safeguardingCases = [
    {
      caseId: 'POCSO-VET-2026-003',
      date: '2026-08-18',
      institutionCode: 'CBS',
      severity: 'HIGH_SENSITIVITY',
      leadInvestigator: 'Designated Safeguarding Officer (DSO)',
      investigationStage: 'Action Plan & External Child Welfare Support',
      caseSummary: 'Confidential peer bullying & emotional distress reported by school counselor.',
      resolutionTarget: '2026-08-28',
      status: 'ACTIVE_INVESTIGATION',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Child Protection & Discipline
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">POCSO Act 2012 Compliance</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Safeguarding & Student Incident Governance</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Strict boundary between ordinary classroom discipline and confidential Child Safeguarding (POCSO) cases.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('ORDINARY_DISCIPLINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'ORDINARY_DISCIPLINE' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Ordinary Discipline Log
          </button>
          <button
            onClick={() => setActiveTab('CONFIDENTIAL_SAFEGUARDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'CONFIDENTIAL_SAFEGUARDING' ? 'bg-rose-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Confidential Safeguarding (POCSO)
          </button>
        </div>
      </div>

      {activeTab === 'ORDINARY_DISCIPLINE' ? (
        // Ordinary Discipline View
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" /> General Classroom & Behavioral Incident Log
            </h2>
            <span className="text-xs text-stone-400 font-semibold">Logged by Teachers & Supervisors</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Incident ID & Date</th>
                  <th className="p-3.5">Student Account</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Reported By</th>
                  <th className="p-3.5">Corrective Action Taken</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {ordinaryIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-stone-900 block">{inc.id}</span>
                      <span className="text-stone-400 text-[10px]">{inc.date}</span>
                    </td>
                    <td className="p-3.5 font-bold text-stone-900">{inc.studentName}</td>
                    <td className="p-3.5 font-semibold text-amber-800">{inc.category}</td>
                    <td className="p-3.5 text-stone-600">{inc.reportedBy}</td>
                    <td className="p-3.5 text-stone-800 max-w-[280px]">{inc.actionTaken}</td>
                    <td className="p-3.5 text-right">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-[10px] uppercase">
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Confidential Child Safeguarding (POCSO) View
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs">
            <div className="space-y-1">
              <span className="font-black text-rose-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-700" /> CONFIDENTIAL CHILD SAFEGUARDING REPOSITORY
              </span>
              <p className="text-rose-700 font-medium">
                Access is strictly restricted to the Designated Safeguarding Officer (DSO) and Principal under statutory child protection law.
              </p>
            </div>

            <button
              onClick={() => setIsDsoUnlocked(!isDsoUnlocked)}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shrink-0"
            >
              {isDsoUnlocked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {isDsoUnlocked ? 'Mask Confidential Data' : 'Authorize DSO Decryption'}
            </button>
          </div>

          <div className="space-y-4">
            {safeguardingCases.map((c) => (
              <div key={c.caseId} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-md">
                      {c.caseId}
                    </span>
                    <h3 className="font-black text-stone-900 text-sm mt-1.5">{c.investigationStage}</h3>
                    <p className="text-stone-500 font-semibold">{c.institutionCode} • Logged on {c.date}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-rose-600 text-white font-black text-[10px] rounded-lg uppercase tracking-wider">
                    {c.severity}
                  </span>
                </div>

                <p className="text-stone-800 font-medium bg-white p-3.5 rounded-xl border border-stone-200">
                  {isDsoUnlocked ? c.caseSummary : '🔒 [CONFIDENTIAL ENCRYPTED RECORD] — Click "Authorize DSO Decryption" to view.'}
                </p>

                <div className="flex justify-between text-stone-500 font-semibold pt-1 border-t border-stone-200">
                  <span>Lead Investigator: {c.leadInvestigator}</span>
                  <span>Target Resolution: {c.resolutionTarget}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
