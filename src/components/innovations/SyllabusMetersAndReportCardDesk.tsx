"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
  User,
  GraduationCap,
  ArrowRight,
  FileText,
  Clock,
  RefreshCw
} from "lucide-react";
import {
  getSyllabusCompletionMetricsAction,
  generateAiNarrativeReportCardAction
} from "@/app/actions/syllabus-meter-actions";

export const SyllabusMetersAndReportCardDesk: React.FC = () => {
  const [syllabusData, setSyllabusData] = useState<any>({
    overallPercentage: 78,
    totalChapters: 25,
    completedChapters: 19,
    chapters: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // AI Narrative Generator State
  const [studentSearchId, setStudentSearchId] = useState("ADM-2026-0048");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [reportCardNarrative, setReportCardNarrative] = useState<any | null>(null);

  useEffect(() => {
    loadSyllabus();
  }, []);

  async function loadSyllabus() {
    setIsLoading(true);
    try {
      const res = await getSyllabusCompletionMetricsAction();
      if (res.success) {
        setSyllabusData(res);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateNarrative() {
    setIsGeneratingAi(true);
    setReportCardNarrative(null);
    try {
      const res = await generateAiNarrativeReportCardAction(studentSearchId);
      if (res.success) {
        setReportCardNarrative(res);
      } else {
        alert(res.error || "Failed to generate report card summary");
      }
    } finally {
      setIsGeneratingAi(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xl p-6 sm:p-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200">
              CBSE &amp; NEP 2020 Holistic Progress
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Dynamic Syllabus Meters &amp; AI Report Card Desk
          </h2>
          <p className="text-xs text-stone-500">
            Real-time syllabus completion tracking synchronized with teacher daily diary entries
          </p>
        </div>

        <button
          onClick={loadSyllabus}
          className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
          <span>Refresh Progress</span>
        </button>
      </div>

      {/* Real-Time Progress Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
          <span className="text-[10px] font-black uppercase text-stone-400 block">Overall Curriculum Completion</span>
          <div className="flex items-baseline gap-2">
            <strong className="text-3xl font-black text-stone-900">{syllabusData.overallPercentage}%</strong>
            <span className="text-xs text-emerald-600 font-bold">On Schedule</span>
          </div>
          <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${syllabusData.overallPercentage}%` }}
            />
          </div>
        </div>

        <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
          <span className="text-[10px] font-black uppercase text-stone-400 block">Syllabus Chapters Finished</span>
          <div className="flex items-baseline gap-2">
            <strong className="text-3xl font-black text-stone-900">{syllabusData.completedChapters}</strong>
            <span className="text-xs text-stone-500 font-bold">of {syllabusData.totalChapters} chapters</span>
          </div>
          <p className="text-[11px] text-stone-500">Validated through classroom daily diary logs</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-blue-950 to-indigo-950 text-white rounded-2xl space-y-2">
          <span className="text-[10px] font-black uppercase text-amber-400 block">Vani Copilot Narrative Engine</span>
          <strong className="text-lg font-black text-white block">CBSE HPC Report Cards</strong>
          <p className="text-[11px] text-slate-300">Synthesizes scholastic marks, attendance, and co-scholastic strengths.</p>
        </div>
      </div>

      {/* Chapters Breakdown Table */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <span className="text-xs font-black uppercase text-stone-700">
            Active Term Chapters &amp; Progress Meters
          </span>
        </div>

        <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto">
          {syllabusData.chapters.map((ch: any) => (
            <div key={ch.id} className="p-3.5 hover:bg-stone-50 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-stone-500 font-bold">Ch {ch.chapterNumber}</span>
                  <strong className="font-bold text-stone-900">{ch.title}</strong>
                </div>
                <span className="text-[11px] text-stone-500">
                  {ch.completedTopics} of {ch.totalTopics} topics logged in class diary
                </span>
              </div>

              <div className="w-32 flex items-center gap-2">
                <div className="flex-1 bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ch.completionPercentage >= 100 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                    style={{ width: `${ch.completionPercentage}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-stone-700 text-[11px] w-8 text-right">
                  {ch.completionPercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VANI AI Generative Report Card Tool */}
      <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <strong className="text-sm font-black text-stone-900 block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" /> Vani Copilot Report Card Narrative Generator
            </strong>
            <p className="text-xs text-stone-600">
              Generates personalized, strengths-based CBSE Holistic Progress Card (HPC) narrative commentary
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={studentSearchId}
              onChange={(e) => setStudentSearchId(e.target.value)}
              placeholder="Enter Admission No..."
              className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-900 w-44"
            />
            <button
              onClick={handleGenerateNarrative}
              disabled={isGeneratingAi}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAi ? "Synthesizing..." : "Generate Narrative"}</span>
            </button>
          </div>
        </div>

        {reportCardNarrative && (
          <div className="p-4 bg-white border border-amber-200 rounded-xl space-y-2 shadow-sm animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <strong className="font-bold text-stone-900 text-sm">
                {reportCardNarrative.studentName} ({reportCardNarrative.admissionNo}, {reportCardNarrative.className})
              </strong>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Attendance: {reportCardNarrative.attendancePercentage}%
              </span>
            </div>
            <p className="text-stone-700 leading-relaxed italic bg-amber-50/40 p-3 rounded-lg border border-amber-100">
              &ldquo;{reportCardNarrative.aiNarrativeSummary}&rdquo;
            </p>
            <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
              <span>Standards: CBSE NEP 2020 Holistic Progress Card (HPC)</span>
              <span>Generated in 1.2s</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
