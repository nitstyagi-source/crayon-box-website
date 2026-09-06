"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Plus,
  Edit3,
  Eye,
  Filter,
  Calendar,
  Clock,
  Star,
  GraduationCap,
  ChevronRight,
  PenTool,
  Hash
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
import { printIsolatedElement } from "@/lib/printUtils";
import WritingGuideRenderer from "@/components/ui/WritingGuideRenderer";

interface NormalizedQuestion {
  qNum: number | string;
  question: string;
  type?: string;
  marks: number;
  options?: string[];
  answer?: string;
  markingScheme?: string;
  linesCount?: number;
  hasDrawingBox?: boolean;
  hasMathWorkingBox?: boolean;
}

interface NormalizedSection {
  sectionCode: string;
  title: string;
  marksPerQuestion?: number;
  totalSectionMarks?: number;
  questions: NormalizedQuestion[];
}

export function AIQuestionPaperGeneratorDesk({ embedded = false }: { embedded?: boolean }) {
  const { activeCampusId } = useCampusContext();
  const { currentInstitution, selectedInstitutionObj } = useInstitution();
  const activeInst = currentInstitution || activeCampusId || 'CBS';

  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("Class 4");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [subjectName, setSubjectName] = useState("Mathematics Core");
  const [examTerm, setExamTerm] = useState("Periodic Assessment 2");
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
  const [recentFilter, setRecentFilter] = useState<string>("ALL");

  // Primary School (Class 3 to 5) Interactive Controls
  const [layoutMode, setLayoutMode] = useState<"WORKSHEET" | "STANDARD">("WORKSHEET");
  const [writingGuide, setWritingGuide] = useState<"dotted" | "english_4lines" | "hindi_2lines" | "math_grid" | "plain">("dotted");

  // Printable Reference for A4 printing
  const printPaperRef = useRef<HTMLDivElement>(null);

  // Detect if current paper is for Primary Stage (Class 3 to 5)
  const currentGrade = generatedPaper?.class_name || selectedClass;
  const isPrimaryGrade = /class\s*[345]|grade\s*[345]/i.test(currentGrade);

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
          setAvailableClasses(["Class 3", "Class 4", "Class 5", "Class 1", "Class 2", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]);
        }
      } catch {
        setAvailableClasses(["Class 3", "Class 4", "Class 5", "Class 1", "Class 2", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]);
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
          // Default subjects based on Class level
          if (/class\s*[345]/i.test(selectedClass)) {
            setAvailableSubjects(["Mathematics Core", "Environmental Studies (EVS)", "General Science", "English Literature", "Hindi Core", "Social Studies"]);
            if (/class\s*3/i.test(selectedClass)) {
              setDbChapters(["Poonam's Day Out", "The Plant Fairy", "Water O Water", "Our First School", "Chhotu's House"]);
              setSelectedChapters(["Poonam's Day Out", "The Plant Fairy", "Water O Water"]);
            } else if (/class\s*4/i.test(selectedClass)) {
              setDbChapters(["Building with Bricks", "Long and Short", "A Trip to Bhopal", "Tick-Tick-Tick", "The Way The World Looks"]);
              setSelectedChapters(["Building with Bricks", "Long and Short", "A Trip to Bhopal"]);
            } else {
              setDbChapters(["Super Senses", "A Snake Charmer's Story", "From Tasting to Digesting", "Seeds and Seeds", "Every Drop Counts"]);
              setSelectedChapters(["Super Senses", "A Snake Charmer's Story", "From Tasting to Digesting"]);
            }
          } else {
            setAvailableSubjects(["Science & Technology", "Mathematics Core", "English Literature", "Social Science", "Hindi Core"]);
            setDbChapters(["Forces & Motion", "Cell Structure", "Microorganisms", "Light & Sound"]);
            setSelectedChapters(["Forces & Motion", "Cell Structure"]);
          }
        }
      } catch {
        setAvailableSubjects(["Mathematics Core", "Environmental Studies (EVS)", "General Science", "English Literature", "Hindi Core"]);
        setDbChapters(["Building with Bricks", "Long and Short", "A Trip to Bhopal"]);
        setSelectedChapters(["Building with Bricks", "Long and Short"]);
      } finally {
        setIsLoadingMeta(false);
      }
    }
    loadSubjectsAndChapters();
  }, [selectedClass, activeInst]);

  // Load Recent Papers from Database
  useEffect(() => {
    loadRecentPapers();
  }, []);

  async function loadRecentPapers() {
    try {
      const res = await getQuestionBankListAction();
      if (res.success && res.papers.length > 0) {
        setRecentPapers(res.papers);
        if (!generatedPaper) {
          // Prefer Class 3, 4, or 5 paper if available
          const primaryPaper = res.papers.find((p) => /class\s*[345]/i.test(p.class_name)) || res.papers[0];
          setGeneratedPaper(primaryPaper);
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

  // Print A4 Document Cleanly
  function handlePrintIsolated() {
    if (!printPaperRef.current) {
      window.print();
      return;
    }
    const docTitle = `${generatedPaper?.title || 'Question-Paper'}-A4-Print`;
    printIsolatedElement(printPaperRef.current, docTitle, {
      pageSize: "A4 portrait",
      margin: "0mm"
    });
  }

  // Normalize sections across both data formats (array and legacy object)
  function normalizeSections(paperData: any): NormalizedSection[] {
    if (!paperData) return [];
    let raw = paperData.sections_data;
    if (!raw) return [];

    if (typeof raw === "string") {
      try { raw = JSON.parse(raw); } catch { return []; }
    }

    if (Array.isArray(raw)) {
      return raw.map((s: any, idx: number) => ({
        sectionCode: s.sectionCode || `Section ${String.fromCharCode(65 + idx)}`,
        title: s.title || `Section ${String.fromCharCode(65 + idx)}`,
        marksPerQuestion: s.marksPerQuestion,
        totalSectionMarks: s.totalSectionMarks,
        questions: (s.questions || []).map((q: any, qIdx: number) => normalizeQuestion(q, qIdx + 1))
      }));
    }

    if (raw.sections && Array.isArray(raw.sections)) {
      return raw.sections.map((s: any, idx: number) => ({
        sectionCode: s.sectionCode || `Section ${String.fromCharCode(65 + idx)}`,
        title: s.title || `Section ${String.fromCharCode(65 + idx)}`,
        marksPerQuestion: s.marksPerQuestion,
        totalSectionMarks: s.totalSectionMarks,
        questions: (s.questions || []).map((q: any, qIdx: number) => normalizeQuestion(q, qIdx + 1))
      }));
    }

    // Legacy object format: { sectionA: [...], sectionB: [...] }
    const titleMap: Record<string, string> = {
      sectionA: "SECTION A: Objective Type Questions (1 Mark Each)",
      sectionB: "SECTION B: Conceptual Short Answer (2 Marks Each)",
      sectionC: "SECTION C: Analytical Long Answer (3-4 Marks Each)",
      sectionD: "SECTION D: HOTS & Competency-Based Case Studies"
    };

    const res: NormalizedSection[] = [];
    ['sectionA', 'sectionB', 'sectionC', 'sectionD'].forEach((secKey, idx) => {
      const qList = raw[secKey];
      if (Array.isArray(qList) && qList.length > 0) {
        res.push({
          sectionCode: `Section ${String.fromCharCode(65 + idx)}`,
          title: titleMap[secKey] || `Section ${String.fromCharCode(65 + idx)}`,
          questions: qList.map((q: any, qIdx: number) => normalizeQuestion(q, qIdx + 1))
        });
      }
    });

    return res;
  }

  function normalizeQuestion(q: any, fallbackNum: number): NormalizedQuestion {
    const rawQ = q.question || q.q || "";
    const marks = Number(q.marks || 1);
    const ans = q.answer || q.ans || "";
    const markingScheme = q.markingScheme || `${marks} mark${marks > 1 ? 's' : ''} for correct response.`;
    
    // Auto detect question types
    let type = q.type;
    if (!type) {
      if (q.options && Array.isArray(q.options) && q.options.length > 0) {
        type = "MCQ";
      } else if (/true\s*or\s*false/i.test(rawQ)) {
        type = "TRUE_FALSE";
      } else if (/fill\s*in\s*the\s*blank/i.test(rawQ) || rawQ.includes("..........") || rawQ.includes("_____")) {
        type = "FILL_BLANK";
      } else if (/draw\s*and\s*label|neat\s*diagram/i.test(rawQ)) {
        type = "DRAWING";
      } else if (/calculate|find\s*the\s*sum|subtract|multiply|divide|perimeter|area|cost\s*of/i.test(rawQ)) {
        type = "MATH_COLUMN";
      } else {
        type = marks <= 2 ? "SHORT_ANSWER" : "LONG_ANSWER";
      }
    }

    const hasDrawingBox = q.hasDrawingBox !== undefined ? q.hasDrawingBox : type === "DRAWING" || /draw|diagram|illustrate/i.test(rawQ);
    const hasMathWorkingBox = q.hasMathWorkingBox !== undefined ? q.hasMathWorkingBox : type === "MATH_COLUMN" || /calculate|solve|word\s*problem|find/i.test(rawQ);
    const linesCount = q.linesCount || (marks <= 1 ? 1 : marks <= 2 ? 3 : marks <= 4 ? 4 : 6);

    return {
      qNum: q.qNum || fallbackNum,
      question: rawQ,
      type,
      marks,
      options: q.options,
      answer: ans,
      markingScheme,
      linesCount,
      hasDrawingBox,
      hasMathWorkingBox
    };
  }

  const normalizedSections = normalizeSections(generatedPaper);

  // General Instructions from paper or default
  const generalInstructions: string[] = 
    generatedPaper?.sections_data?.generalInstructions || [
      "Write your Full Name, Roll Number, and Section clearly on the booklet before starting.",
      "Read each question carefully before attempting the answer.",
      "All questions are compulsory. Write answers in neat handwriting in the space provided.",
      "For Multiple Choice Questions (MCQs), put a neat tick mark [ ✓ ] in the correct option box.",
      "For calculations or rough work, use the designated working boxes.",
      "Re-check all answers carefully before handing over your paper."
    ];

  // Filtered recent papers
  const filteredRecentPapers = recentPapers.filter((p) => {
    if (recentFilter === "ALL") return true;
    if (recentFilter === "CLASS_3") return /class\s*3/i.test(p.class_name);
    if (recentFilter === "CLASS_4") return /class\s*4/i.test(p.class_name);
    if (recentFilter === "CLASS_5") return /class\s*5/i.test(p.class_name);
    if (recentFilter === "SECONDARY") return !/class\s*[345]/i.test(p.class_name);
    return true;
  });

  return (
    <div className={`space-y-6 ${embedded ? '' : 'p-4 sm:p-8 max-w-7xl mx-auto min-h-screen text-slate-900 font-sans'}`}>
      
      {/* Top Banner Header (if not embedded) */}
      {!embedded && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF7F2] border border-[#E8DFC8] text-slate-900 p-6 sm:p-8 rounded-3xl shadow-xs">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 text-xs font-bold border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              NEP 2020 &amp; CBSE Examination Blueprint Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-amber-600" />
              Examination Question Paper &amp; Worksheet Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Authentic Board-Pattern Question Papers, Question-cum-Answer Worksheets for Primary Wing (Classes 3 to 5), and Senior High School Blueprints with Teacher Solution Keys.
            </p>
          </div>

          {generatedPaper && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintIsolated}
                className="px-4 py-2.5 bg-[#0F2942] hover:bg-[#1A365D] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" /> Print A4 Paper
              </button>
            </div>
          )}
        </div>
      )}

      {/* Generator Form Studio */}
      <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8DFC8] pb-3 gap-2">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Configure Examination Blueprint (Dynamic DB Connected)
          </h3>
          <div className="flex items-center gap-2">
            {isPrimaryGrade && (
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                Primary Preparatory Stage (Class 3–5)
              </span>
            )}
            <span className="text-[11px] font-bold text-slate-500">
              Board &amp; NEP 2020 Standard
            </span>
          </div>
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
                <optgroup label="Primary Wing (Preparatory Stage)">
                  <option value="Class 3">Class 3 (Grade 3)</option>
                  <option value="Class 4">Class 4 (Grade 4)</option>
                  <option value="Class 5">Class 5 (Grade 5)</option>
                </optgroup>
                <optgroup label="Middle &amp; Secondary Wing">
                  {availableClasses.filter(c => !['Class 3', 'Class 4', 'Class 5'].includes(c)).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
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
                <option value="Periodic Assessment 1">Periodic Assessment 1 (20 Marks)</option>
                <option value="Periodic Assessment 2">Periodic Assessment 2 (20-25 Marks)</option>
                <option value="Mid-Term Examination (Term 1)">Mid-Term Examination (40-50 Marks)</option>
                <option value="Annual Examination (Final Term)">Annual Examination (50-80 Marks)</option>
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
                <option value={25}>25 Marks (Periodic Test - 45 mins)</option>
                <option value={40}>40 Marks (Primary Mid-Term - 90 mins)</option>
                <option value={50}>50 Marks (Standard Board Exam - 90/120 mins)</option>
                <option value={80}>80 Marks (Annual Examination - 180 mins)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Syllabus Chapter Selection */}
          <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                Select Syllabus Chapters ({selectedClass} • {subjectName}):
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">
                {selectedChapters.length} chapters selected
              </span>
            </div>

            {isLoadingMeta ? (
              <div className="text-xs text-slate-400 py-2 flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                Loading syllabus chapters...
              </div>
            ) : dbChapters.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-1">
                Type custom chapters below or use general curriculum overview.
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
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
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
                placeholder="e.g. Word Problems, Mental Arithmetic, Diagram Observation, Fill in the blanks"
                className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-md flex items-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  Generating AI Question Paper &amp; Blueprint...
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

      {/* Switcher & Results Preview Canvas */}
      {generatedPaper && (
        <div className="space-y-4">
          
          {/* Action Ribbon & Layout Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-3 rounded-2xl border border-[#E8DFC8] shadow-xs gap-3">
            
            {/* Left: View Mode Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setViewMode("QUESTION_PAPER")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "QUESTION_PAPER"
                    ? "bg-[#0F2942] text-white shadow-xs"
                    : "bg-[#FAF7F2] text-slate-700 hover:bg-slate-100"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Student Question Paper (Printable)
              </button>
              
              <button
                type="button"
                onClick={() => setViewMode("SOLUTION_KEY")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "SOLUTION_KEY"
                    ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                    : "bg-[#FAF7F2] text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Key className="w-3.5 h-3.5 text-slate-950" />
                Teacher Marking Scheme &amp; Solution Key
              </button>
            </div>

            {/* Middle: Primary Class Controls (When viewing Class 3-5) */}
            {isPrimaryGrade && (
              <div className="flex items-center gap-2 flex-wrap border-t md:border-t-0 md:border-l border-[#E8DFC8] pt-2 md:pt-0 md:pl-3">
                <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  Class 3–5 Format:
                </span>

                <div className="flex items-center bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setLayoutMode("WORKSHEET")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                      layoutMode === "WORKSHEET"
                        ? "bg-white text-slate-900 shadow-xs border border-stone-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Includes ruled lines for students to write answers directly on the paper"
                  >
                    ✏️ Worksheet with Lines
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode("STANDARD")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                      layoutMode === "STANDARD"
                        ? "bg-white text-slate-900 shadow-xs border border-stone-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Standard question paper format without writing lines"
                  >
                    📄 Paper Only
                  </button>
                </div>

                {layoutMode === "WORKSHEET" && (
                  <select
                    value={writingGuide}
                    onChange={(e) => setWritingGuide(e.target.value as any)}
                    className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-2 py-1 text-[11px] font-bold text-slate-800"
                  >
                    <option value="dotted">Dotted Lines (Standard)</option>
                    <option value="english_4lines">English 4-Lines Guide</option>
                    <option value="hindi_2lines">Hindi 2-Lines (Shirorekha)</option>
                    <option value="math_grid">Math Square Grid</option>
                    <option value="plain">Solid Ruled Lines</option>
                  </select>
                )}
              </div>
            )}

            {/* Right: Direct Isolated A4 Print */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintIsolated}
                className="px-4 py-2 bg-[#0F2942] hover:bg-[#1A365D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" /> Print A4 Paper
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PRINTABLE A4 QUESTION PAPER CANVAS (CLASS 3 TO 5 PRIMARY SPECIALIZED)     */}
          {/* ========================================================================= */}
          <div
            ref={printPaperRef}
            className="bg-white p-6 sm:p-10 lg:p-12 rounded-3xl border-2 border-[#0F2942] shadow-xl text-slate-900 font-sans space-y-6 print:m-0 print:p-6 print:border-2 print:border-black print:shadow-none"
            style={{ maxWidth: "860px", margin: "0 auto" }}
          >
            {/* 1. TOP INSTITUTIONAL LETTERHEAD */}
            <div className="border-b-2 border-[#0F2942] pb-3 space-y-2">
              <div className="flex items-center justify-between gap-4">
                
                {/* Left Shield Emblem Logo */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#0F2942] flex flex-col items-center justify-center p-1 bg-[#FAF7F2] shrink-0">
                  {selectedInstitutionObj?.logoUrl ? (
                    <img
                      src={selectedInstitutionObj.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full bg-amber-500/30 flex items-center justify-center mb-0.5">
                        <span className="text-amber-700 text-[9px] font-black">🔥</span>
                      </div>
                      <BookOpen className="w-7 h-7 text-[#0F2942]" />
                    </>
                  )}
                </div>

                {/* Center Institutional Typography */}
                <div className="flex-1 text-center px-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black tracking-wider text-[#0F2942] uppercase leading-tight">
                    {selectedInstitutionObj?.name || (currentInstitution === "CBS" ? "CRAYON BOX ACADEMY" : "SCHOOL OF EXCELLENCE")}
                  </h1>
                  <p className="text-[10px] sm:text-[11px] font-bold text-stone-700 tracking-wider uppercase mt-0.5">
                    {selectedInstitutionObj?.affiliation || "MANAGED BY VANI EDUCATIONAL TRUST • RECOGNISED BY DIRECTORATE OF EDUCATION"}
                  </p>
                  <p className="text-[9.5px] font-semibold text-stone-500 tracking-wide mt-0.5">
                    {selectedInstitutionObj?.address || "CAMPUS ROAD, NEW DELHI - 110084"}
                  </p>
                </div>

                {/* Right Academic Session & Wing Badge */}
                <div className="text-right shrink-0 border border-stone-300 rounded-xl p-2 bg-[#FAF7F2] text-[10px] space-y-0.5 hidden sm:block">
                  <span className="font-black text-[#0F2942] block uppercase tracking-wider">
                    SESSION 2026-27
                  </span>
                  <span className="text-amber-800 font-bold block">
                    {isPrimaryGrade ? "PRIMARY WING" : "SECONDARY WING"}
                  </span>
                  <span className="text-[9px] text-stone-400 font-mono block">
                    NEP-2020 COMPLIANT
                  </span>
                </div>
              </div>

              {/* 2. EXAMINATION TITLE RIBBON */}
              <div className="bg-[#EAEFF5] border-y-2 border-[#0F2942] py-2 px-4 text-center mt-2">
                <h2 className="text-sm sm:text-base font-serif font-black tracking-widest text-[#0F2942] uppercase">
                  {generatedPaper.title || `${generatedPaper.class_name} ${generatedPaper.subject_name} Examination`}
                </h2>
                <div className="flex items-center justify-center gap-2 text-[10.5px] font-bold text-stone-700 uppercase tracking-wider mt-0.5">
                  <span>◆</span>
                  <span>
                    {isPrimaryGrade && layoutMode === "WORKSHEET"
                      ? "QUESTION-CUM-ANSWER BOOKLET"
                      : "OFFICIAL EXAMINATION QUESTION PAPER"}
                  </span>
                  <span>◆</span>
                </div>
              </div>

              {/* 3. EXAM VITALS STRIP (Class, Subject, Duration, Max Marks) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-black text-[#0F2942] border-t border-stone-200">
                <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <span className="text-stone-500 block text-[9.5px] font-semibold uppercase">Class &amp; Section:</span>
                  <strong className="text-sm">{generatedPaper.class_name || selectedClass}</strong>
                </div>
                <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <span className="text-stone-500 block text-[9.5px] font-semibold uppercase">Subject:</span>
                  <strong className="text-sm">{generatedPaper.subject_name || subjectName}</strong>
                </div>
                <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <span className="text-stone-500 block text-[9.5px] font-semibold uppercase">Time Allowed:</span>
                  <strong className="text-sm">{generatedPaper.duration_minutes || 90} Minutes</strong>
                </div>
                <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <span className="text-stone-500 block text-[9.5px] font-semibold uppercase">Maximum Marks:</span>
                  <strong className="text-sm text-amber-800">{generatedPaper.total_marks || 50} Marks</strong>
                </div>
              </div>
            </div>

            {/* 4. CANDIDATE DETAILS & OFFICIAL MARKS MATRIX (PRIMARY SCHOOL FORMAT) */}
            {isPrimaryGrade && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 border-2 border-stone-300 rounded-2xl p-3.5 bg-[#FAF7F2] text-xs">
                
                {/* Left 7 Cols: Student Fill-In Credentials */}
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center gap-1 pb-1 border-b border-stone-200">
                    <Edit3 className="w-3.5 h-3.5 text-[#0F2942]" />
                    <strong className="text-[11px] font-black uppercase tracking-wider text-[#0F2942]">
                      Candidate Information (To be filled by Student):
                    </strong>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-700 w-28 shrink-0 text-[11px]">Student&apos;s Name:</span>
                      <div className="flex-1 border-b-2 border-dotted border-stone-400 h-5" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-700 w-16 shrink-0 text-[11px]">Roll No.:</span>
                        <div className="flex-1 border-b-2 border-dotted border-stone-400 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-700 w-16 shrink-0 text-[11px]">Section:</span>
                        <div className="flex-1 border-b-2 border-dotted border-stone-400 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-700 w-16 shrink-0 text-[11px]">Date:</span>
                        <div className="flex-1 border-b-2 border-dotted border-stone-400 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-700 w-16 shrink-0 text-[11px]">Day:</span>
                        <div className="flex-1 border-b-2 border-dotted border-stone-400 h-5" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-bold text-stone-700 w-36 shrink-0 text-[11px]">Invigilator&apos;s Sign:</span>
                      <div className="flex-1 border-b-2 border-stone-400 h-5" />
                    </div>
                  </div>
                </div>

                {/* Right 5 Cols: Teacher Evaluation Scoring Matrix */}
                <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-stone-300 pt-2 md:pt-0 md:pl-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                      <strong className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                        Teacher Evaluation Matrix
                      </strong>
                      <span className="text-[9px] font-mono text-stone-500">Official</span>
                    </div>

                    {/* Section Marks Table */}
                    <table className="w-full text-center border-collapse border border-stone-300 mt-1.5 text-[10px]">
                      <thead>
                        <tr className="bg-stone-200 text-[#0F2942] font-black uppercase">
                          <th className="border border-stone-300 py-1 px-1">Sec A</th>
                          <th className="border border-stone-300 py-1 px-1">Sec B</th>
                          <th className="border border-stone-300 py-1 px-1">Sec C</th>
                          <th className="border border-stone-300 py-1 px-1">Sec D</th>
                          <th className="border border-stone-300 py-1 px-1 bg-amber-100 text-amber-950 font-black">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-stone-600 font-bold bg-white">
                          <td className="border border-stone-300 py-1">/ 15</td>
                          <td className="border border-stone-300 py-1">/ 10</td>
                          <td className="border border-stone-300 py-1">/ 15</td>
                          <td className="border border-stone-300 py-1">/ 10</td>
                          <td className="border border-stone-300 py-1 bg-amber-50 font-black text-amber-900">
                            / {generatedPaper.total_marks || 50}
                          </td>
                        </tr>
                        <tr className="h-6 font-mono font-bold bg-white">
                          <td className="border border-stone-300"></td>
                          <td className="border border-stone-300"></td>
                          <td className="border border-stone-300"></td>
                          <td className="border border-stone-300"></td>
                          <td className="border border-stone-300 bg-amber-50/50"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-[10px] text-stone-600 font-bold">
                    <span>Evaluator Sign: ____________</span>
                    <span>Checker Sign: ____________</span>
                  </div>
                </div>

              </div>
            )}

            {/* 5. GENERAL INSTRUCTIONS (CHILD-FRIENDLY) */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFC8] text-xs space-y-1.5">
              <strong className="block font-black text-[#0F2942] uppercase tracking-wider flex items-center gap-1.5">
                <span>✏️</span> General Instructions for Candidates:
              </strong>
              <ol className="list-decimal pl-5 space-y-1 text-stone-800 font-medium text-[11px] leading-relaxed">
                {generalInstructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ol>
            </div>

            {/* 6. QUESTION SECTIONS */}
            <div className="space-y-6 pt-2">
              {normalizedSections.map((sec, secIdx) => (
                <div key={secIdx} className="space-y-4">
                  
                  {/* Section Title Ribbon */}
                  <div className="flex items-center justify-between bg-[#0F2942] text-white px-3.5 py-2 rounded-lg">
                    <h3 className="font-serif font-black text-xs uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      {sec.title}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-amber-300">
                      {sec.totalSectionMarks ? `[Total: ${sec.totalSectionMarks} Marks]` : ''}
                    </span>
                  </div>

                  {/* Question Items in this Section */}
                  <div className="space-y-4 pl-1">
                    {sec.questions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="space-y-2 border-b border-stone-200/90 pb-3 break-inside-avoid text-xs"
                      >
                        {/* Question Prompt Line */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <span className="font-black text-[#0F2942] shrink-0 font-serif text-sm">
                              Q.{q.qNum}
                            </span>
                            <div className="font-bold text-slate-900 leading-relaxed whitespace-pre-line text-[12px]">
                              {q.question}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-[#0F2942] shrink-0 bg-stone-100 border border-stone-300 px-2 py-0.5 rounded text-[11px]">
                            [{q.marks} Mark{q.marks > 1 ? 's' : ''}]
                          </span>
                        </div>

                        {/* MCQ Options with checkable boxes */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7 pt-1">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className="flex items-center gap-2 p-1.5 rounded-lg border border-stone-200 bg-white font-medium text-stone-800 text-[11.5px]"
                              >
                                <div className="w-4 h-4 rounded border-2 border-stone-400 shrink-0 flex items-center justify-center font-mono text-[9px] text-stone-400">
                                </div>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* True / False Pill Options */}
                        {q.type === "TRUE_FALSE" && (
                          <div className="flex items-center gap-3 pl-7 pt-1">
                            <div className="flex items-center gap-1.5 px-3 py-1 border-2 border-dashed border-stone-400 rounded-lg text-[11px] font-bold text-stone-700">
                              <div className="w-3.5 h-3.5 rounded border border-stone-400" />
                              <span>TRUE</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 border-2 border-dashed border-stone-400 rounded-lg text-[11px] font-bold text-stone-700">
                              <div className="w-3.5 h-3.5 rounded border border-stone-400" />
                              <span>FALSE</span>
                            </div>
                          </div>
                        )}

                        {/* Mathematics Working / Calculation Box */}
                        {isPrimaryGrade && q.hasMathWorkingBox && layoutMode === "WORKSHEET" && (
                          <div className="pl-7 pt-1">
                            <div className="border-2 border-dashed border-stone-300 rounded-xl p-3 bg-stone-50/50 space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase text-stone-500 border-b border-stone-200 pb-1">
                                <span>Show Rough Work / Step-by-Step Calculation:</span>
                                <span>[ Working Space ]</span>
                              </div>
                              <div className="h-16 flex items-center justify-center text-stone-300 text-xs italic">
                                [ Space for carry-overs, column addition, subtraction or multiplication steps ]
                              </div>
                              <div className="pt-1 border-t border-stone-200 flex items-center gap-2">
                                <span className="font-black text-[#0F2942] text-[11px]">Final Answer:</span>
                                <div className="flex-1 border-b-2 border-stone-400 h-5" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Drawing / Diagram Box */}
                        {isPrimaryGrade && q.hasDrawingBox && layoutMode === "WORKSHEET" && (
                          <div className="pl-7 pt-1">
                            <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 bg-stone-50/40 text-center space-y-1 h-36 flex flex-col items-center justify-center">
                              <PenTool className="w-5 h-5 text-stone-400" />
                              <span className="text-stone-400 text-xs font-bold">
                                [ Space for Drawing &amp; Labeling Diagram with Pencil ]
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Ruled Handwriting Answer Lines (for Primary School Worksheets) */}
                        {isPrimaryGrade && layoutMode === "WORKSHEET" && !q.hasDrawingBox && !q.hasMathWorkingBox && q.type !== "MCQ" && (
                          <div className="pl-7 pt-1 space-y-1.5">
                            {writingGuide === "english_4lines" ? (
                              <WritingGuideRenderer type="english_4lines" rows={Math.min(3, q.linesCount || 2)} />
                            ) : writingGuide === "hindi_2lines" ? (
                              <WritingGuideRenderer type="hindi_2lines" rows={Math.min(3, q.linesCount || 2)} />
                            ) : writingGuide === "math_grid" ? (
                              <WritingGuideRenderer type="math_grid" rows={Math.min(3, q.linesCount || 2)} />
                            ) : (
                              // Clean Dotted or Solid Handwriting Lines
                              <div className="space-y-2 pt-1 select-none">
                                {Array.from({ length: q.linesCount || 2 }).map((_, lIdx) => (
                                  <div key={lIdx} className="flex items-center gap-2">
                                    {lIdx === 0 && (
                                      <span className="font-bold text-stone-500 text-[11px] shrink-0">
                                        Ans:
                                      </span>
                                    )}
                                    <div
                                      className={`flex-1 border-b-2 ${
                                        writingGuide === "plain" ? "border-stone-300" : "border-dotted border-stone-400"
                                      } h-4`}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* TEACHER SOLUTION KEY DISPLAY (IF ACTIVE) */}
                        {viewMode === "SOLUTION_KEY" && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 mt-2 pl-4">
                            <strong className="text-amber-900 flex items-center gap-1.5 font-bold">
                              <Key className="w-3.5 h-3.5 text-amber-700" />
                              Official Teacher Solution &amp; Marking Breakdown:
                            </strong>
                            <p className="text-amber-950 font-medium whitespace-pre-line pl-5 leading-relaxed">
                              {q.answer}
                            </p>
                            <div className="text-[10.5px] font-mono text-amber-800/90 pl-5 pt-0.5">
                              Rubric: {q.markingScheme}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            {/* 7. FOOTER MOTTO & SIGNATURE RULE */}
            <div className="pt-4 border-t-2 border-[#0F2942] space-y-3">
              <div className="text-center font-serif font-black text-xs uppercase tracking-widest text-[#0F2942] bg-[#FAF7F2] py-1.5 rounded-lg border border-stone-200">
                ★ ★ ★ All The Best! ★ Read Carefully &amp; Write Neatly! ★ ★ ★
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-stone-700 pt-2">
                <div className="flex items-center gap-2">
                  <span>Teacher&apos;s Remark:</span>
                  <div className="border-b border-stone-400 w-48 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span>Examiner&apos;s Signature:</span>
                  <div className="border-b-2 border-stone-800 w-36 h-4" />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Recent Papers Repository Gallery */}
      {recentPapers.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8DFC8] pb-3 gap-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              School Question Paper Repository &amp; Blueprints ({recentPapers.length})
            </h4>

            {/* Quick Grade Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "ALL", label: "All Papers" },
                { id: "CLASS_3", label: "Class 3" },
                { id: "CLASS_4", label: "Class 4" },
                { id: "CLASS_5", label: "Class 5" },
                { id: "SECONDARY", label: "Middle/Secondary" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRecentFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition cursor-pointer ${
                    recentFilter === tab.id
                      ? "bg-[#0F2942] text-white shadow-xs"
                      : "bg-[#FAF7F2] text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRecentPapers.slice(0, 9).map((p) => {
              const isPPrimary = /class\s*[345]/i.test(p.class_name);
              const isSelected = generatedPaper?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setGeneratedPaper(p)}
                  className={`p-3.5 rounded-2xl border transition space-y-1.5 cursor-pointer ${
                    isSelected
                      ? "border-[#0F2942] bg-amber-50/40 shadow-sm"
                      : "border-[#E8DFC8] bg-[#FAF7F2] hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      isPPrimary ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "bg-amber-100 text-amber-900"
                    }`}>
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

                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-200/60 font-medium">
                    <span>{p.exam_term}</span>
                    <span className="text-amber-800 font-bold flex items-center gap-0.5">
                      Preview <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
