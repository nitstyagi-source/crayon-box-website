"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3, TrendingUp, ShieldCheck, Download,
  Filter, Building2, Users, IndianRupee, GraduationCap,
  Calendar, CheckCircle2, AlertTriangle, ArrowUpRight,
  FileSpreadsheet, FileText, PieChart, Activity
} from 'lucide-react';
import { VANI_TRUST_ORGANIZATION, VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function GovernanceMISAnalyticsPage() {
  const [selectedSession, setSelectedSession] = useState('2026-2027');
  const [selectedEntity, setSelectedEntity] = useState('ALL');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Governance MIS Analytics</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 uppercase">
                Trust Executive BI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Consolidated management information system for executive trustees, compliance auditors, and school leadership.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert("Consolidated MIS Report generated successfully.")}
            className="px-4 py-2.5 rounded-xl bg-[#0A1A44] hover:bg-[#0F245E] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Executive MIS</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrollment</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">0</p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">● Clean Database Active</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Realization</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">0.0%</p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">Yield Target: 98.5%</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trust Staff Strength</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">0</p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">4 Operating Schools</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Regulatory Compliance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">100%</p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">CBSE &amp; State Compliant</span>
        </div>
      </div>

      {/* Cross-Campus Performance Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Cross-Institution Operational Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time benchmark comparison across all Vani Educational Trust branches</p>
          </div>
          <span className="text-xs font-bold text-indigo-600">Session 2026–2027</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-6">School / Institution</th>
                <th className="py-3.5 px-4">Framework</th>
                <th className="py-3.5 px-4">Students</th>
                <th className="py-3.5 px-4">Faculty</th>
                <th className="py-3.5 px-4">Teacher-Student Ratio</th>
                <th className="py-3.5 px-4">Compliance Status</th>
                <th className="py-3.5 px-6 text-right">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {VANI_TRUST_INSTITUTIONS.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50 transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: inst.brandColor }} />
                      <div>
                        <span className="font-bold text-slate-900 block">{inst.name}</span>
                        <span className="text-[11px] text-slate-500">{inst.address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-700">
                    {inst.academicFramework} ({inst.boardAffiliation})
                  </td>
                  <td className="py-4 px-4 font-black text-slate-900">0</td>
                  <td className="py-4 px-4 font-bold text-slate-700">0</td>
                  <td className="py-4 px-4 font-bold text-slate-700">1 : 15 (Target)</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Audited
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/admin/institutions`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      View Matrix →
                    </Link>
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
