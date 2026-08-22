"use client";

import React, { useState } from 'react';
import {
  FileBarChart, BarChart3, TrendingUp, AlertTriangle,
  Download, ArrowRight, Filter, Layers, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function TrustIntelligenceReportsPage() {
  const [selectedInst, setSelectedInst] = useState<string>('ALL');

  const earlyWarningAnomalies = [
    {
      studentName: 'Rohan Verma (AVM-2026-0442)',
      institution: 'Avinya Vidya Mandir (AVM)',
      category: 'FEE_DEFAULTER_&_ATTENDANCE_DROP',
      details: 'Quarter 1 Fee ₹45,000 overdue (42 days) • Attendance dropped from 94% to 71% over last 3 weeks.',
      recommendedAction: 'Parent welfare call + Financial counselling meeting.',
      riskLevel: 'HIGH_RISK',
    },
    {
      studentName: 'Pooja Hegde (CBS-2026-0045)',
      institution: 'Crayon Box School (CBS)',
      category: 'ACADEMIC_BOUNDARY_RISK',
      details: 'Mathematics Mid-Term score at 31% (Below passing threshold of 33%).',
      recommendedAction: 'Remedial intervention assigned + Peer scaffolding.',
      riskLevel: 'MEDIUM_RISK',
    },
  ];

  const drilldownMetrics = [
    { institution: 'Crayon Box School (CBS)', students: 1250, attendance: '94.2%', feesCollected: '₹5.98 Cr (94.8%)', admissionsYield: '91.0%', syllabusProgress: '88.0%' },
    { institution: 'Crayon Box Pre School (CBPS)', students: 320, attendance: '96.8%', feesCollected: '₹1.88 Cr (97.2%)', admissionsYield: '96.0%', syllabusProgress: '88.5%' },
    { institution: 'Avinya School (AS)', students: 780, attendance: '92.4%', feesCollected: '₹3.45 Cr (89.5%)', admissionsYield: '85.6%', syllabusProgress: '79.0%' },
    { institution: 'Avinya Vidya Mandir (AVM)', students: 500, attendance: '91.0%', feesCollected: '₹2.11 Cr (86.4%)', admissionsYield: '89.3%', syllabusProgress: '82.0%' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Executive Business Intelligence
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Consolidated Trust Analytics</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Trust Intelligence & Early Warning Radar</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Drillable cross-institution KPIs, student risk radars, fee collection benchmarking, and syllabus completion analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Executive BI Pack (PDF)
          </button>
        </div>
      </div>

      {/* Early Warning Anomaly Radar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-rose-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" /> Early Warning Student At-Risk Radar ({earlyWarningAnomalies.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earlyWarningAnomalies.map((a, i) => (
            <div key={i} className="p-5 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-stone-900 text-sm">{a.studentName}</h3>
                  <span className="text-stone-500 font-semibold">{a.institution}</span>
                </div>
                <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded-md uppercase">
                  {a.riskLevel}
                </span>
              </div>
              <p className="text-stone-800 font-medium">{a.details}</p>
              <p className="text-indigo-900 font-bold pt-1 border-t border-rose-200">
                🎯 <strong>Intervention:</strong> {a.recommendedAction}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Drillable Multi-Level Benchmarking Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" /> Cross-Institution Consolidated Performance Ledger
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Institution</th>
                <th className="p-3.5 text-right">Students</th>
                <th className="p-3.5 text-right">Avg Attendance</th>
                <th className="p-3.5 text-right">Fee Yield</th>
                <th className="p-3.5 text-right">Admissions Conversion</th>
                <th className="p-3.5 text-right">Syllabus Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {drilldownMetrics.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5 font-black text-stone-900">{row.institution}</td>
                  <td className="p-3.5 text-right font-bold text-stone-800">{row.students}</td>
                  <td className="p-3.5 text-right font-black text-emerald-600">{row.attendance}</td>
                  <td className="p-3.5 text-right font-black text-indigo-600">{row.feesCollected}</td>
                  <td className="p-3.5 text-right font-bold text-stone-800">{row.admissionsYield}</td>
                  <td className="p-3.5 text-right font-black text-purple-600">{row.syllabusProgress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
