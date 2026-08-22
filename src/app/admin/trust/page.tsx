"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2, Users, CreditCard, GraduationCap, TrendingUp,
  ShieldCheck, ArrowRight, ExternalLink, Download, Sparkles,
  BarChart3, RefreshCw, Layers, CheckCircle2
} from 'lucide-react';
import {
  VANI_TRUST_ORGANIZATION,
  VANI_TRUST_INSTITUTIONS,
  VANI_TRUST_CAMPUSES,
  InstitutionMaster
} from '@/lib/core/institution/trust-hierarchy';

export default function TrustCommandCenterPage() {
  const totalStudents = VANI_TRUST_INSTITUTIONS.reduce((acc, curr) => acc + curr.totalStudents, 0);
  const totalStaff = VANI_TRUST_INSTITUTIONS.reduce((acc, curr) => acc + curr.totalStaff, 0);

  // Consolidated Financials
  const consolidatedFinancials = {
    grossBilled: '₹14.85 Cr',
    totalCollected: '₹13.42 Cr',
    collectionRate: '90.37%',
    totalOutstanding: '₹1.43 Cr',
    totalAdmissionsThisYear: 635,
  };

  // Cross-Institution Benchmarking Matrix
  const institutionComparisonKPIs = [
    {
      code: 'CBS',
      name: 'Crayon Box School',
      campus: 'CBS — Shastri Park Extn.',
      framework: 'K-12 CBSE',
      students: 1250,
      studentAttendance: '94.2%',
      feeCollection: '94.8%',
      admissionsEnrolled: '182 / 200 (91%)',
      staffAttendance: '96.5%',
    },
    {
      code: 'CBPS',
      name: 'Crayon Box Pre School',
      campus: 'CBPS — Shastri Park Extn.',
      framework: 'Montessori Early Childhood',
      students: 320,
      studentAttendance: '96.8%',
      feeCollection: '97.2%',
      admissionsEnrolled: '96 / 100 (96%)',
      staffAttendance: '98.0%',
    },
    {
      code: 'AS',
      name: 'Avinya School',
      campus: 'AS — Virender Nagar Burari',
      framework: 'K-12 CBSE',
      students: 780,
      studentAttendance: '92.4%',
      feeCollection: '89.5%',
      admissionsEnrolled: '214 / 250 (85.6%)',
      staffAttendance: '94.0%',
    },
    {
      code: 'AVM',
      name: 'Avinya Vidya Mandir',
      campus: 'AVM — Virender Nagar Burari',
      framework: 'K-12 State Board',
      students: 500,
      studentAttendance: '91.0%',
      feeCollection: '86.4%',
      admissionsEnrolled: '143 / 160 (89.3%)',
      staffAttendance: '92.5%',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Top Banner - VANI EDUCATIONAL TRUST */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-stone-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Trust Executive HQ
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-300 text-xs font-bold">{VANI_TRUST_ORGANIZATION.registrationNumber}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{VANI_TRUST_ORGANIZATION.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
            Central Institutional Governance, Consolidated Financial Ledgers, Cross-Campus Admissions & Shared Services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition border border-white/20 backdrop-blur-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Consolidated Trust Report (PDF)
          </button>
        </div>
      </div>

      {/* Trust-Wide Key Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-black uppercase tracking-wider">Total Institutions</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Building2 className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-stone-900">4 <span className="text-xs font-bold text-stone-400">Institutions</span></h3>
          <p className="text-xs text-stone-500 font-medium">Shastri Park & Burari Campuses</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-black uppercase tracking-wider">Total Enrolled Students</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><GraduationCap className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-blue-600">{totalStudents.toLocaleString()}</h3>
          <p className="text-xs text-emerald-700 font-bold">🟢 93.6% Trust Average Attendance</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-black uppercase tracking-wider">Faculty & Staff Force</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Users className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-purple-600">{totalStaff} <span className="text-xs font-bold text-stone-400">Members</span></h3>
          <p className="text-xs text-stone-500 font-medium">1:12 Teacher-to-Student Ratio</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-black uppercase tracking-wider">Consolidated Collections</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CreditCard className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-emerald-600">{consolidatedFinancials.totalCollected}</h3>
          <p className="text-xs text-stone-500 font-medium">{consolidatedFinancials.collectionRate} Collection Yield</p>
        </div>

      </div>

      {/* Cross-Institution KPI Benchmarking Matrix Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Trust vs. Member Institutions KPI Benchmarking
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Live comparison across academic frameworks, student attendance, fee collections, and admissions yield.
            </p>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
            Session 2026–2027 Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Institution & Campus</th>
                <th className="p-3.5">Academic Framework</th>
                <th className="p-3.5 text-right">Students</th>
                <th className="p-3.5 text-right">Attendance</th>
                <th className="p-3.5 text-right">Fee Collection</th>
                <th className="p-3.5 text-right">Admissions Yield</th>
                <th className="p-3.5 text-right">Staff Strength</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {institutionComparisonKPIs.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-black text-stone-900 block text-sm">{row.name}</span>
                    <span className="text-stone-400 text-[11px] font-semibold">{row.campus}</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      row.code === 'CBPS' ? 'bg-pink-100 text-pink-800' :
                      row.code === 'AVM' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {row.framework}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-black text-stone-900">{row.students.toLocaleString()}</td>
                  <td className="p-3.5 text-right font-black text-emerald-600">{row.studentAttendance}</td>
                  <td className="p-3.5 text-right font-black text-indigo-600">{row.feeCollection}</td>
                  <td className="p-3.5 text-right font-bold text-stone-800">{row.admissionsEnrolled}</td>
                  <td className="p-3.5 text-right font-black text-purple-600">{row.staffAttendance}</td>
                </tr>
              ))}
              <tr className="bg-stone-50 font-black text-stone-900 border-t-2 border-stone-200">
                <td className="p-3.5">Vani Educational Trust (Total Consolidated)</td>
                <td className="p-3.5">Multi-Framework (CBSE / Montessori / State)</td>
                <td className="p-3.5 text-right text-blue-600">{totalStudents.toLocaleString()}</td>
                <td className="p-3.5 text-right text-emerald-600">93.6%</td>
                <td className="p-3.5 text-right text-indigo-600">90.37%</td>
                <td className="p-3.5 text-right">635 / 710 (89.4%)</td>
                <td className="p-3.5 text-right text-purple-600">95.2%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Member Institutions Master Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" /> Member Institutions Directory (4)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VANI_TRUST_INSTITUTIONS.map((inst) => (
            <div
              key={inst.id}
              className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 hover:border-indigo-400 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {inst.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      inst.code === 'CBPS' ? 'bg-pink-50 text-pink-700' :
                      inst.code === 'AVM' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {inst.academicFramework}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-stone-900">{inst.name}</h3>
                  <p className="text-xs text-stone-500 font-medium">{inst.address}</p>
                </div>

                <Link
                  href="/admin/operations"
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Snapshot Stats */}
              <div className="grid grid-cols-3 gap-2 p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase">Students</span>
                  <p className="font-black text-stone-900 text-sm">{inst.totalStudents.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase">Staff</span>
                  <p className="font-black text-stone-900 text-sm">{inst.totalStaff}</p>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase">Principal</span>
                  <p className="font-bold text-stone-800 truncate">{inst.principalName}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span>✉️ {inst.principalEmail}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {inst.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
