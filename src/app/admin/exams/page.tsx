"use client";

import React, { useState } from 'react';
import {
  FileText, Award, Lock, CheckCircle2, AlertTriangle,
  Sparkles, Download, ArrowRight, Filter, ShieldCheck
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function ExamModerationPage() {
  const [selectedInst, setSelectedInst] = useState<string>('CBS');
  const [isResultLocked, setIsResultLocked] = useState(false);

  const assessmentSchemes = [
    { code: 'PA1', name: 'Periodic Assessment 1', maxMarks: 50, weightage: '10%', status: 'COMPLETED_&_LOCKED' },
    { code: 'MID', name: 'Mid-Term Summative Exam', maxMarks: 100, weightage: '30%', status: 'MODERATION_IN_PROGRESS' },
    { code: 'PA2', name: 'Periodic Assessment 2', maxMarks: 50, weightage: '10%', status: 'SCHEDULED' },
    { code: 'FIN', name: 'Annual Final Examination', maxMarks: 100, weightage: '50%', status: 'UPCOMING' },
  ];

  const studentMarksModeration = [
    { studentName: 'Aarav Sharma', admissionNo: 'CBS-2026-0042', rawScore: 89, graceMarks: 0, finalPercent: 89.0, grade: 'A1', status: 'VERIFIED' },
    { studentName: 'Aditi Patel', admissionNo: 'CBS-2026-0043', rawScore: 94, graceMarks: 0, finalPercent: 94.0, grade: 'A1', status: 'VERIFIED' },
    { studentName: 'Vihaan Agarwal', admissionNo: 'CBS-2026-0044', rawScore: 78, graceMarks: 2, finalPercent: 80.0, grade: 'B1', status: 'GRACE_REQUESTED' },
    { studentName: 'Pooja Hegde', admissionNo: 'CBS-2026-0045', rawScore: 31, graceMarks: 2, finalPercent: 33.0, grade: 'D', status: 'PASSING_BOUNDARY' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Assessment & Moderation
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Academic Session 2026–2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Assessment Scheme & Result Locking Engine</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Configurable evaluation schemes, marks moderation, grace policies, and immutable result publication locking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsResultLocked(!isResultLocked)}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition shadow-xs ${
              isResultLocked ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {isResultLocked ? 'Unlock Result (Principal Key)' : '🔒 Lock & Publish Results'}
          </button>
        </div>
      </div>

      {/* Assessment Schemes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {assessmentSchemes.map((scheme) => (
          <div key={scheme.code} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md font-mono">
                {scheme.code}
              </span>
              <span className="text-xs font-black text-stone-900">{scheme.weightage} Weight</span>
            </div>
            <h3 className="text-sm font-black text-stone-900">{scheme.name}</h3>
            <div className="flex justify-between text-xs text-stone-500 font-semibold pt-1 border-t border-stone-100">
              <span>Max Marks: {scheme.maxMarks}</span>
              <span className="text-indigo-600 font-bold">{scheme.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Moderation Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Mid-Term Marks Moderation Ledger (Grade 4-B)
            </h2>
            <p className="text-xs text-stone-400 font-semibold mt-0.5">Subject: Mathematics • Examiner: Dr. Meenakshi Sundaram</p>
          </div>
          <span className="text-xs text-stone-500 font-medium">CBSE 9-Point Scale Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Student & Admission No</th>
                <th className="p-3.5 text-right">Raw Marks (/100)</th>
                <th className="p-3.5 text-right">Grace Marks</th>
                <th className="p-3.5 text-right">Final Percent</th>
                <th className="p-3.5 text-center">Grade</th>
                <th className="p-3.5 text-right">Moderation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {studentMarksModeration.map((row) => (
                <tr key={row.admissionNo} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-black text-stone-900 block text-sm">{row.studentName}</span>
                    <span className="font-mono text-stone-400 text-[10px]">{row.admissionNo}</span>
                  </td>
                  <td className="p-3.5 text-right font-bold text-stone-800">{row.rawScore}</td>
                  <td className="p-3.5 text-right font-bold text-purple-600">+{row.graceMarks}</td>
                  <td className="p-3.5 text-right font-black text-stone-900">{row.finalPercent}%</td>
                  <td className="p-3.5 text-center">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-black rounded-lg text-xs">
                      {row.grade}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      row.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {row.status.replace(/_/g, ' ')}
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
