"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Layers, CheckCircle2, AlertTriangle, TrendingUp,
  Sparkles, Download, ArrowRight, ExternalLink, Filter, BarChart3
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function CurriculumRadarPage() {
  const [selectedInst, setSelectedInst] = useState<string>('CBS');

  const syllabusRadarData = [
    {
      subject: 'Mathematics & Numeracy',
      classes: 'Grade 1 to Grade 10',
      totalUnits: 14,
      unitsCompleted: 12,
      plannedProgress: 85,
      actualProgress: 88,
      status: 'ON_TRACK',
    },
    {
      subject: 'Science & Robotics',
      classes: 'Grade 3 to Grade 10',
      totalUnits: 16,
      unitsCompleted: 11,
      plannedProgress: 80,
      actualProgress: 68,
      status: 'LAGGING', // Behind milestone
    },
    {
      subject: 'English Literature & Phonetics',
      classes: 'Grade 1 to Grade 10',
      totalUnits: 12,
      unitsCompleted: 10,
      plannedProgress: 82,
      actualProgress: 83,
      status: 'ON_TRACK',
    },
    {
      subject: 'Social Studies & World History',
      classes: 'Grade 4 to Grade 10',
      totalUnits: 10,
      unitsCompleted: 8,
      plannedProgress: 78,
      actualProgress: 79,
      status: 'ON_TRACK',
    },
    {
      subject: 'Computer Science & AI Hub',
      classes: 'Grade 1 to Grade 10',
      totalUnits: 8,
      unitsCompleted: 7,
      plannedProgress: 85,
      actualProgress: 91,
      status: 'AHEAD',
    },
  ];

  const montessoriActivities = [
    { area: 'Practical Life Skills', totalActivities: 24, masteredCount: 20, activeLearners: 320 },
    { area: 'Sensorial Exploration', totalActivities: 18, masteredCount: 15, activeLearners: 320 },
    { area: 'Language & Phonetics', totalActivities: 22, masteredCount: 17, activeLearners: 320 },
    { area: 'Mathematical Mind', totalActivities: 20, masteredCount: 16, activeLearners: 320 },
    { area: 'Cultural & Cosmic Studies', totalActivities: 14, masteredCount: 11, activeLearners: 320 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Academic Delivery Radar
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Curriculum Version 2026.1</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Curriculum Delivery & 3-Level Syllabus Radar</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Real-time tracking of planned vs. actual instructional delivery across CBSE, Montessori, and State Board frameworks.
          </p>
        </div>

        {/* Institution Framework Switcher */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl">
          {VANI_TRUST_INSTITUTIONS.map((inst) => (
            <button
              key={inst.code}
              onClick={() => setSelectedInst(inst.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedInst === inst.code ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {inst.code} ({inst.academicFramework})
            </button>
          ))}
        </div>
      </div>

      {/* 3-Level Syllabus Completion Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-stone-400">1. Teacher-Level Delivery</span>
          <h3 className="text-3xl font-black text-blue-600">84.2% Avg</h3>
          <p className="text-xs text-stone-500 font-medium">Across 85 Assigned Faculty Timetables</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-stone-400">2. School-Level Benchmark ({selectedInst})</span>
          <h3 className="text-3xl font-black text-indigo-600">
            {selectedInst === 'CBPS' ? '88.5% Milestones' : '82.8% Completed'}
          </h3>
          <p className="text-xs text-stone-500 font-medium">Session Term 1 Mid-Point Target: 80.0%</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-stone-400">3. Trust-Wide Average</span>
          <h3 className="text-3xl font-black text-emerald-600">83.4%</h3>
          <p className="text-xs text-emerald-700 font-bold">🟢 Overall Curriculum On-Track</p>
        </div>
      </div>

      {/* Curriculum Delivery Content according to Framework */}
      {selectedInst === 'CBPS' ? (
        // Montessori Early Childhood View
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-stone-900">Montessori Early Childhood Milestone Progression</h2>
              <p className="text-xs text-stone-500 font-medium">Self-directed activity presentation and sensory milestone acquisition.</p>
            </div>
            <span className="px-3 py-1 bg-pink-50 text-pink-700 font-black text-xs rounded-xl border border-pink-200">
              Montessori Framework
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {montessoriActivities.map((m, i) => (
              <div key={i} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-black text-stone-900">{m.area}</h3>
                  <span className="text-xs font-black text-pink-600">{Math.round((m.masteredCount / m.totalActivities) * 100)}%</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${(m.masteredCount / m.totalActivities) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-stone-500 font-medium pt-1">
                  <span>{m.masteredCount} / {m.totalActivities} Activities Mastered</span>
                  <span>{m.activeLearners} Toddlers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Standard CBSE / State Board K-12 Syllabus Table
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Subject-Wise Syllabus Completion Progress
            </h2>
            <span className="text-xs text-stone-400 font-semibold">Planned vs. Actual Comparison</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Subject & Coverage Scope</th>
                  <th className="p-3.5 text-right">Units / Chapters</th>
                  <th className="p-3.5">Planned Benchmark</th>
                  <th className="p-3.5">Actual Completed</th>
                  <th className="p-3.5 text-right">Delivery Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {syllabusRadarData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5">
                      <span className="font-black text-stone-900 block text-sm">{row.subject}</span>
                      <span className="text-stone-400 text-[11px] font-semibold">{row.classes}</span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-stone-800">
                      {row.unitsCompleted} / {row.totalUnits} Units
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-stone-700">{row.plannedProgress}%</span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-36 bg-stone-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              row.status === 'LAGGING' ? 'bg-rose-500' : row.status === 'AHEAD' ? 'bg-blue-600' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${row.actualProgress}%` }}
                          />
                        </div>
                        <span className="font-black text-stone-900">{row.actualProgress}%</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        row.status === 'LAGGING' ? 'bg-rose-100 text-rose-800' :
                        row.status === 'AHEAD' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {row.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
