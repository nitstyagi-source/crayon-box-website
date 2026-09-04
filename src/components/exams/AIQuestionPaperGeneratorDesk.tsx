"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  BookOpen,
  HelpCircle,
  Key,
  Layers,
  Award,
  Check,
  Plus
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { useInstitution } from "@/components/providers/InstitutionContext";
import {
  generateAiQuestionPaperAction,
  getQuestionBankListAction,
  QuestionPaperItem
} from "@/app/actions/question-paper-actions";
import { getInstitutionClassesAction } from "@/app/actions/attendance-actions";
import { getDistinctSubjectsAndChaptersAction } from "@/app/actions/curriculum-radar-actions";

export function AIQuestionPaperGeneratorDesk({ embedded = false }: { embedded?: boolean }) {
  const { activeCampusId } = useCampusContext();
  const { currentInstitution, selectedInstitutionObj } = useInstitution();
  const activeInst = currentInstitution || activeCampusId || 'CBS';

  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("Class 8");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [subjectName, setSubjectName] = useState("Science & Technology");
  const [examTerm, setExamTerm] = useState("Term 1 (Half Yearly Examination)");
  const [totalMarks, setTotalMarks] = useState<number>(50);

  // Dynamic syllabus chapters from DB
  const [dbChapters, setDbChapters] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [customChapters, setCustomChapters] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"QUESTION_PAPER" | "SOLUTION_KEY">("QUESTION_PAPER");
  const [recentPapers, setRecentPapers] = useState<QuestionPaperItem[]>([]);

  // 1. Load Dynamic Classes
  useEffect(() => {
    async function loadDynamicClasses() {
      try {
        const res = await getInstitutionClassesAction(activeInst);
        if (res.success && res.classes && res.classes.length > 0) {
          const clsList = res.classes as string[];
          setAvailableClasses(clsList);
          if (!clsList.includes(selectedClass)) {
            setSelectedClass(clsList[0]);
          }
        } else {
          setAvailableClasses(["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]);
        }
      } catch {
        setAvailableClasses(["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]);
      }
    }
    loadDynamicClasses();
  }, [activeInst]);

  // 2. Load Dynamic Subjects & Chapters for Selected Class
  useEffect(() => {
    async function loadSubjectsAndChapters() {
      setIsLoadingMeta(true);
      try {
        const res = await getDistinctSubjectsAndChaptersAction(selectedClass, activeInst);
        if (res.success && res.subjects && res.subjects.length > 0) {
          const subNames = res.subjects.map((s: any) => s.name as string);
          setAvailableSubjects(subNames);
          
          const matchedSub = res.subjects.find((s: any) => s.name === subjectName) || res.subjects[0];
          if (matchedSub) {
            setSubjectName(matchedSub.name);
            const chList = (matchedSub.chapters || []).map((c: any) => c.chapterName as string).filter(Boolean);
            setDbChapters(chList);
            setSelectedChapters(chList.slice(0, 3));
          }
        } else {
          setAvailableSubjects(["Science & Technology", "Mathematics Core", "English Literature", "Social Science", "Hindi Core"]);
          setDbChapters(["Forces & Motion", "Cell Structure", "Microorganisms", "Light & Sound"]);
          setSelectedChapters(["Forces & Motion", "Cell Structure"]);
        }
      } catch {
        setAvailableSubjects(["Science & Technology", "Mathematics Core", "English Literature", "Social Science", "Hindi Core"]);
        setDbChapters(["Forces & Motion", "Cell Structure", "Microorganisms", "Light & Sound"]);
        setSelectedChapters(["Forces & Motion", "Cell Structure"]);
      } finally {
        setIsLoadingMeta(false);
      }
    }
    loadSubjectsAndChapters();
  }, [selectedClass, activeInst]);

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

  function toggleChapter(ch: string) {
    if (selectedChapters.includes(ch)) {
      setSelectedChapters(selectedChapters.filter(c => c !== ch));
    } else {
      setSelectedChapters([...selectedChapters, ch]);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const mergedChapters = [
      ...selectedChapters,
      ...(customChapters.trim() ? [customChapters.trim()] : [])
    ].join(", ");

    try {
      const res = await generateAiQuestionPaperAction({
        className: selectedClass,
        subjectName,
        examTerm,
        totalMarks,
        chapters: mergedChapters || "Comprehensive Syllabus Overview"
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
    <div className={`space-y-6 ${embedded ? '' : 'p-4 sm:p-8 max-w-7xl mx-auto min-h-screen text-slate-900 font-sans'}`}>
      
      {/* Top Banner Header (if not embedded) */}
      {!embedded && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF7F2] border border-[#E8DFC8] text-slate-900 p-6 sm:p-8 rounded-3xl shadow-xs">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 text-xs font-bold border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              AI-Powered Academic Blueprint &amp; Bloom's Taxonomy Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-amber-600" />
              AI Examination Question Paper Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Generates balanced board examination question papers (MCQs, Short, Long, and HOTS Case-Studies) with complete step-by-step teacher marking schemes and printable A4 layouts.
            </p>
          </div>

          {generatedPaper && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" /> Print / Export PDF
              </button>
            </div>
          )}
        </div>
      )}

      {/* Generator Form Studio */}
      <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Configure Examination Blueprint (Dynamic DB Connected)
          </h3>
          <span className="text-[11px] font-bold text-slate-500">
            Board &amp; NEP 2020 Standard Assessment Pattern
          </span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Grade</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {availableClasses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Academic Subject</label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Examination Term</label>
              <select
                value={examTerm}
                onChange={(e) => setExamTerm(e.target.value)}
                className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="Term 1 (Half Yearly Examination)">Term 1 (Half Yearly Examination)</option>
                <option value="Term 2 (Annual Examination)">Term 2 (Annual Examination)</option>
                <option value="Periodic Assessment 1 (20 Marks)">Periodic Assessment 1 (20 Marks)</option>
                <option value="Periodic Assessment 2 (20 Marks)">Periodic Assessment 2 (20 Marks)</option>
                <option value="Pre-Board Final Exam (80 Marks)">Pre-Board Final Exam (80 Marks)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Total Marks</label>
              <select
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value={20}>20 Marks (Unit Test - 45 mins)</option>
                <option value={40}>40 Marks (Periodic Assessment - 90 mins)</option>
                <option value={50}>50 Marks (Mid-Term Exam - 120 mins)</option>
                <option value={80}>80 Marks (Annual Board Exam - 180 mins)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Syllabus Chapter Selection */}
          <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                Select Syllabus Chapters from Live Database ({selectedClass} • {subjectName}):
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">
                {selectedChapters.length} chapters selected
              </span>
            </div>

            {isLoadingMeta ? (
              <div className="text-xs text-slate-400 py-2 flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                Loading live syllabus chapters...
              </div>
            ) : dbChapters.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-1">
                No distinct chapters found in DB for this subject. Type custom chapters below.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {dbChapters.map((ch) => {
                  const isSelected = selectedChapters.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChapter(ch)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 border-amber-600 shadow-xs"
                          : "bg-[#FAF7F2] text-slate-700 border-[#E8DFC8] hover:bg-amber-50"
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                      <span>{ch}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="pt-2">
              <label className="font-bold text-slate-600 text-[11px] block mb-1">
                Additional / Custom Sub-Topics (Optional)
              </label>
              <input
                type="text"
                value={customChapters}
                onChange={(e) => setCustomChapters(e.target.value)}
                placeholder="e.g. Laboratory Experiments, Numerical Problems, Diagram Questions"
                className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-md flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  Generating AI Blueprint &amp; Bloom's Taxonomy...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  Generate AI Question Paper &amp; Marking Scheme
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Switcher & Results Preview */}
      {generatedPaper && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#E8DFC8] shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("QUESTION_PAPER")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === "QUESTION_PAPER"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-[#FAF7F2] text-slate-700 hover:bg-slate-100"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Student Question Paper (Printable)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("SOLUTION_KEY")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === "SOLUTION_KEY"
                    ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                    : "bg-[#FAF7F2] text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Key className="w-3.5 h-3.5 text-slate-950" />
                Teacher Marking Scheme &amp; Solution Key
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-white text-slate-900 hover:bg-amber-50 border border-[#E8DFC8] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5 text-amber-600" /> Print A4 Paper
            </button>
          </div>

          {/* Paper Canvas Display */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8DFC8] shadow-md space-y-6 print:m-0 print:p-0 print:border-none">
            
            {/* Header / Masthead */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
                {selectedInstitutionObj?.name || "ACADEMIC INSTITUTION"}
              </h2>
              <p className="text-xs font-bold uppercase text-slate-600">
                {selectedInstitutionObj?.affiliationNumber ? `Affiliation No. ${selectedInstitutionObj.affiliationNumber}` : (selectedInstitutionObj?.boardAffiliation || "Official Examination Blueprint")}
              </p>
              <h3 className="text-base font-black text-slate-900 pt-1">
                {generatedPaper.title}
              </h3>
              <div className="flex items-center justify-between text-xs font-black text-slate-800 pt-2 border-t border-slate-200 mt-2">
                <span>Time Allowed: {generatedPaper.duration_minutes || 90} Minutes</span>
                <span>Maximum Marks: {generatedPaper.total_marks || 50}</span>
              </div>
            </div>

            {/* General Instructions */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFC8] text-xs space-y-1">
              <strong className="block font-black text-slate-900 uppercase">General Instructions:</strong>
              <ol className="list-decimal pl-4 space-y-0.5 text-slate-700 font-medium">
                <li>This question paper contains multiple sections. All questions are compulsory.</li>
                <li>Section A contains Objective / MCQs carrying 1 mark each.</li>
                <li>Section B contains Conceptual Short Answer questions carrying 2 marks each.</li>
                <li>Section C contains Analytical Long Answer questions carrying 3 to 4 marks each.</li>
                <li>Section D contains Competency-based Higher Order Thinking (HOTS) Case Studies.</li>
              </ol>
            </div>

            {/* Render Sections */}
            {['sectionA', 'sectionB', 'sectionC', 'sectionD'].map((secKey) => {
              const secList = sections[secKey];
              if (!secList || !Array.isArray(secList) || secList.length === 0) return null;
              
              const titleMap: Record<string, string> = {
                sectionA: "SECTION A: Objective & MCQs (1 Mark Each)",
                sectionB: "SECTION B: Conceptual Short Answer (2 Marks Each)",
                sectionC: "SECTION C: Analytical Long Answer (3-4 Marks Each)",
                sectionD: "SECTION D: HOTS & Competency-Based Case Studies"
              };

              return (
                <div key={secKey} className="space-y-3 pt-2">
                  <h4 className="font-black text-xs uppercase tracking-wider bg-slate-100 p-2 rounded-lg text-slate-900 border-l-4 border-amber-500">
                    {titleMap[secKey] || secKey}
                  </h4>

                  <div className="space-y-4">
                    {secList.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-stone-50/50 rounded-xl border border-stone-200/80 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900">
                            <strong>Q{item.qNum}.</strong> {item.q}
                          </span>
                          <span className="font-mono font-bold text-slate-600 shrink-0 bg-white px-2 py-0.5 rounded border border-slate-200">
                            [{item.marks} Mark{item.marks > 1 ? 's' : ''}]
                          </span>
                        </div>

                        {/* If in Solution Key mode, show step-by-step marking */}
                        {viewMode === "SOLUTION_KEY" && (
                          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1 mt-2">
                            <strong className="text-amber-900 flex items-center gap-1 font-bold">
                              <Key className="w-3.5 h-3.5 text-amber-700" />
                              Official Teacher Solution &amp; Marking Scheme:
                            </strong>
                            <p className="text-amber-950 font-medium whitespace-pre-line pl-4">
                              {item.ans}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Papers Repository */}
      {recentPapers.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            Recently Generated Question Papers &amp; Blueprints
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentPapers.slice(0, 6).map((p) => (
              <div
                key={p.id}
                onClick={() => setGeneratedPaper(p)}
                className="p-3.5 rounded-2xl border border-[#E8DFC8] bg-[#FAF7F2] hover:bg-amber-50/60 cursor-pointer transition space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {p.class_name} • {p.total_marks}M
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
                <strong className="text-xs text-slate-900 block font-bold truncate">
                  {p.title}
                </strong>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {p.chapters}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
