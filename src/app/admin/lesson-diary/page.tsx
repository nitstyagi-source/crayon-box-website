"use client";

import React, { useState } from 'react';
import {
  BookOpen, CheckSquare, Plus, Calendar, Clock,
  User, CheckCircle2, AlertCircle, Sparkles, Download, ArrowRight
} from 'lucide-react';

interface LessonPlanEntry {
  id: string;
  date: string;
  period: number;
  gradeLevel: string;
  subject: string;
  teacherName: string;
  topic: string;
  learningOutcome: string;
  teachingMethodology: string;
  differentiatedSupport: string;
  assignedHomework: string;
  isReviewedByCoordinator: boolean;
  coordinatorRemarks?: string;
}

export default function LessonDiaryPage() {
  const [diaryEntries, setDiaryEntries] = useState<LessonPlanEntry[]>([
    {
      id: 'LP-2026-042',
      date: '2026-08-22',
      period: 1,
      gradeLevel: 'Grade 4-B',
      subject: 'Mathematics',
      teacherName: 'Dr. Meenakshi Sundaram',
      topic: 'Fractions: Conversion of Mixed Numbers to Improper Fractions',
      learningOutcome: 'Students will accurately convert visual fraction strips into improper fractions with 90% accuracy.',
      teachingMethodology: 'Hands-on fraction tiles + Interactive Smartboard demo + Pair problem solving.',
      differentiatedSupport: 'Peer scaffolding provided for Aarav & Vihaan; advanced extension worksheet for top group.',
      assignedHomework: 'Exercise 4.2 Questions 1 to 8 in Student Workbook.',
      isReviewedByCoordinator: true,
      coordinatorRemarks: 'Well structured pedagogy. Clear instructional alignment.',
    },
    {
      id: 'LP-2026-043',
      date: '2026-08-22',
      period: 2,
      gradeLevel: 'Grade 5-A',
      subject: 'Science & Robotics',
      teacherName: 'Prof. Anil Gupta',
      topic: 'Sensors in Automation: Ultrasonic Distance Measurement',
      learningOutcome: 'Explain ultrasonic echo timing and compute distance using speed-of-sound formula.',
      teachingMethodology: 'Robotics Lab breadboard wiring + Live distance sensing oscilloscope test.',
      differentiatedSupport: 'Visual circuit diagrams provided for visual learners.',
      assignedHomework: 'Complete sensor timing calculation sheet.',
      isReviewedByCoordinator: false,
    },
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Teacher Instructional Diary
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Academic Session 2026–2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Teacher Daily Lesson Planning Diary</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Targeted learning outcomes, classroom methodologies, differentiated learner support, and coordinator reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Diary Records
          </button>
        </div>
      </div>

      {/* Diary Entries List */}
      <div className="space-y-6">
        {diaryEntries.map((entry) => (
          <div key={entry.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            
            {/* Entry Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-sm">
                  P{entry.period}
                </span>
                <div>
                  <h3 className="text-base font-black text-stone-900">{entry.subject} ({entry.gradeLevel})</h3>
                  <p className="text-xs text-stone-500 font-semibold">{entry.teacherName} • Date: {entry.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {entry.isReviewedByCoordinator ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed by Coordinator
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-xl text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" /> Awaiting Coordinator Review
                  </span>
                )}
              </div>
            </div>

            {/* Topic & Learning Outcome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-400">Classroom Topic</span>
                <p className="font-bold text-stone-900">{entry.topic}</p>
              </div>
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-700">Targeted Learning Outcome</span>
                <p className="font-bold text-indigo-950">{entry.learningOutcome}</p>
              </div>
            </div>

            {/* Pedagogy & Differentiated Support */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-400">Teaching Method</span>
                <p className="text-stone-700 font-medium leading-relaxed">{entry.teachingMethodology}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-400">Differentiated Support</span>
                <p className="text-stone-700 font-medium leading-relaxed">{entry.differentiatedSupport}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-400">Assigned Homework Rubric</span>
                <p className="text-stone-700 font-medium leading-relaxed">{entry.assignedHomework}</p>
              </div>
            </div>

            {/* Coordinator Remarks if present */}
            {entry.coordinatorRemarks && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 font-semibold">
                💬 <strong>Academic Coordinator Feedback:</strong> {entry.coordinatorRemarks}
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
