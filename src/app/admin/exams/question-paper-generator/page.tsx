"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  BookOpen,
  HelpCircle,
  Key,
  Layers,
  Award
} from "lucide-react";
import {
  generateAiQuestionPaperAction,
  getQuestionBankListAction,
  QuestionPaperItem
} from "@/app/actions/question-paper-actions";

export default function AIQuestionPaperGeneratorPage() {
  const [selectedClass, setSelectedClass] = useState("Class 8");
  const [subjectName, setSubjectName] = useState("Science & Technology");
  const [examTerm, setExamTerm] = useState("Term 1 (Half Yearly Examination)");
  const [totalMarks, setTotalMarks] = useState<number>(50);
  const [chapters, setChapters] = useState("Cell Structure, Force & Pressure, Microorganisms, Sound");

  const [isLoading, setIsLoading] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"QUESTION_PAPER" | "SOLUTION_KEY">("QUESTION_PAPER");
  const [recentPapers, setRecentPapers] = useState<QuestionPaperItem[]>([]);

  const availableClasses = [
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
  ];

  const availableSubjects = [
    "Science & Technology",
    "Mathematics Core",
    "English Language & Literature",
    "Social Science (History, Civics, Geography)",
    "Hindi Core"
  ];

  useEffect(() => {
    loadRecentPapers();
  }, []);

  async function loadRecentPapers() {
    try {
      const res = await getQuestionBankListAction();
      if (res.success) {
        setRecentPapers(res.papers);
        if (res.papers.length > 0 && !generatedPaper) {
          setGeneratedPaper(res.papers[0]);
        }
      }
    } catch {}
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await generateAiQuestionPaperAction({
        className: selectedClass,
        subjectName,
        examTerm,
        totalMarks,
        chapters
      });
      if (res.success) {
        setGeneratedPaper(res.paper);
        loadRecentPapers();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const sections = generatedPaper?.sections_data || {};

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-indigo-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered CBSE Blueprint &amp; Bloom's Taxonomy Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            AI Examination Question Paper Generator
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl">
            Generates balanced question papers (MCQs, Short, Long, and HOTS Case-Studies) with complete step-by-step teacher marking schemes and printable A4 layouts.
          </p>
        </div>

        {generatedPaper && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-white text-stone-900 hover:bg-stone-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Export PDF
            </button>
          </div>
        )}
      </div>

      {/* Generator Form Studio */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Configure Examination Blueprint
          </h3>
          <span className="text-[11px] font-bold text-stone-500">
            CBSE 2026 Assessment Pattern
          </span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Target Grade</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
              >
                {availableClasses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Academic Subject</label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
              >
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Examination Term</label>
              <input
                type="text"
                value={examTerm}
                onChange={(e) => setExamTerm(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Total Marks</label>
              <select
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
              >
                <option value={25}>25 Marks (Periodic Test - 45 min)</option>
                <option value={40}>40 Marks (Unit Test - 60 min)</option>
                <option value={50}>50 Marks (Mid-Term - 90 min)</option>
                <option value={80}>80 Marks (Annual Board - 180 min)</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="font-bold text-stone-700 block mb-1">Chapters / Syllabus Units Covered</label>
              <input
                type="text"
                value={chapters}
                onChange={(e) => setChapters(e.target.value)}
                placeholder="e.g. Chapter 1, Chapter 3, Chapter 5..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              ⚡ Generate AI Question Paper with Solution Key
            </button>
          </div>
        </form>
      </div>

      {/* Generated Paper View & Solution Toggle */}
      {generatedPaper && (
        <div className="space-y-4">
          
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between bg-white px-6 py-3 rounded-2xl border border-stone-200 text-xs">
            <div className="font-bold text-stone-700">
              Generated: <strong>{generatedPaper.title}</strong>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("QUESTION_PAPER")}
                className={`px-4 py-1.5 rounded-xl font-bold transition ${
                  viewMode === "QUESTION_PAPER"
                    ? "bg-blue-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                📄 Student Question Paper
              </button>

              <button
                onClick={() => setViewMode("SOLUTION_KEY")}
                className={`px-4 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  viewMode === "SOLUTION_KEY"
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <Key className="w-3.5 h-3.5" /> 🔑 Teacher Solution Key
              </button>
            </div>
          </div>

          {/* Printable Official A4 Examination Document */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-stone-300 shadow-xl space-y-6 text-stone-900 print:border-none print:shadow-none print:p-0">
            
            {/* School Crest & Exam Header */}
            <div className="text-center border-b-2 border-stone-900 pb-5 space-y-1">
              <div className="text-[11px] font-bold text-stone-600 tracking-widest uppercase">
                Central Board of Secondary Education (CBSE) Assessment
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-blue-950">
                CRAYON BOX SCHOOL
              </h2>
              <div className="text-xs text-stone-600 font-bold">
                {generatedPaper.exam_term} • Academic Session 2026–2027
              </div>
              
              <div className="flex justify-between items-center pt-4 text-xs font-black border-t border-stone-200 mt-3">
                <span>Class: <strong>{generatedPaper.class_name}</strong></span>
                <span>Subject: <strong>{generatedPaper.subject_name}</strong></span>
                <span>Time Allowed: <strong>{generatedPaper.duration_minutes} Minutes</strong></span>
                <span>Maximum Marks: <strong>{generatedPaper.total_marks} Marks</strong></span>
              </div>
            </div>

            {/* General Instructions */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-1 text-stone-700">
              <strong className="text-stone-900 font-black block">General Instructions:</strong>
              <div>1. All questions are compulsory. Internal choice is provided where indicated.</div>
              <div>2. Section A consists of Objective/MCQ questions carrying 1 mark each.</div>
              <div>3. Section B consists of Short Answer questions carrying 2 marks each.</div>
              <div>4. Section C consists of Long Answer questions carrying 3 marks each.</div>
              <div>5. Section D consists of High-Order Thinking Skills (HOTS) Case-Study carrying 5 marks.</div>
            </div>

            {/* SECTIONS LIST */}
            <div className="space-y-6 text-xs">
              
              {/* Section A */}
              {sections.sectionA && (
                <div className="space-y-3">
                  <div className="font-black text-sm text-blue-950 border-b border-stone-200 pb-1 flex justify-between">
                    <span>SECTION A — Objective &amp; Multiple Choice Questions (1 Mark Each)</span>
                    <span className="text-stone-500 font-mono">[{sections.sectionA.length * 1} Marks]</span>
                  </div>

                  <div className="space-y-3 pl-2">
                    {sections.sectionA.map((item: any) => (
                      <div key={item.qNum} className="space-y-1">
                        <div className="flex justify-between font-bold text-stone-900">
                          <span>Q{item.qNum}. {item.q}</span>
                          <span className="font-mono text-stone-400">[{item.marks}]</span>
                        </div>
                        {viewMode === "SOLUTION_KEY" && (
                          <div className="bg-emerald-50 text-emerald-900 p-2 rounded-xl border border-emerald-200 text-[11px] font-mono">
                            <strong>Answer / Marking Scheme:</strong> {item.ans}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section B */}
              {sections.sectionB && (
                <div className="space-y-3">
                  <div className="font-black text-sm text-blue-950 border-b border-stone-200 pb-1 flex justify-between">
                    <span>SECTION B — Short Answer Conceptual Questions (2 Marks Each)</span>
                    <span className="text-stone-500 font-mono">[{sections.sectionB.length * 2} Marks]</span>
                  </div>

                  <div className="space-y-3 pl-2">
                    {sections.sectionB.map((item: any) => (
                      <div key={item.qNum} className="space-y-1">
                        <div className="flex justify-between font-bold text-stone-900">
                          <span>Q{item.qNum}. {item.q}</span>
                          <span className="font-mono text-stone-400">[{item.marks}]</span>
                        </div>
                        {viewMode === "SOLUTION_KEY" && (
                          <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 text-[11px] font-mono whitespace-pre-line">
                            <strong>Answer / Marking Scheme:</strong> {item.ans}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section C */}
              {sections.sectionC && (
                <div className="space-y-3">
                  <div className="font-black text-sm text-blue-950 border-b border-stone-200 pb-1 flex justify-between">
                    <span>SECTION C — Long Answer Analytical Questions (3 Marks Each)</span>
                    <span className="text-stone-500 font-mono">[{sections.sectionC.length * 3} Marks]</span>
                  </div>

                  <div className="space-y-3 pl-2">
                    {sections.sectionC.map((item: any) => (
                      <div key={item.qNum} className="space-y-1">
                        <div className="flex justify-between font-bold text-stone-900">
                          <span>Q{item.qNum}. {item.q}</span>
                          <span className="font-mono text-stone-400">[{item.marks}]</span>
                        </div>
                        {viewMode === "SOLUTION_KEY" && (
                          <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 text-[11px] font-mono whitespace-pre-line">
                            <strong>Answer / Marking Scheme:</strong> {item.ans}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section D */}
              {sections.sectionD && (
                <div className="space-y-3">
                  <div className="font-black text-sm text-blue-950 border-b border-stone-200 pb-1 flex justify-between">
                    <span>SECTION D — High Order Thinking Skills (HOTS) &amp; Case Study (5 Marks)</span>
                    <span className="text-stone-500 font-mono">[{sections.sectionD.length * 5} Marks]</span>
                  </div>

                  <div className="space-y-3 pl-2">
                    {sections.sectionD.map((item: any) => (
                      <div key={item.qNum} className="space-y-1">
                        <div className="flex justify-between font-bold text-stone-900">
                          <span className="whitespace-pre-line">Q{item.qNum}. {item.q}</span>
                          <span className="font-mono text-stone-400">[{item.marks}]</span>
                        </div>
                        {viewMode === "SOLUTION_KEY" && (
                          <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 text-[11px] font-mono whitespace-pre-line">
                            <strong>Answer / Marking Scheme:</strong> {item.ans}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Paper End Seal */}
            <div className="text-center pt-8 text-[11px] font-bold text-stone-400 border-t border-stone-200">
              *** END OF EXAMINATION QUESTION PAPER ***
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
