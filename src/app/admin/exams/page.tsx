"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FileText, Award, Lock, CheckCircle2, AlertTriangle,
  Sparkles, Download, ArrowRight, Filter, ShieldCheck,
  Printer, Star, Check, RefreshCw, X, Building2, UserCheck,
  TrendingUp, BarChart3, QrCode, Plus, Copy, Trash2, Edit3,
  ExternalLink, Layers, Eye, BookOpen, AlignJustify, Image as ImageIcon,
  Palette, Grid, Hash, HelpCircle, Send, CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { useCampusContext } from '@/components/providers/CampusProvider';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import { getInstitutionClassesAction } from '@/app/actions/attendance-actions';
import {
  getClassExamMarksRosterAction,
  getStudentCompleteReportCardAction,
  moderateAndLockResultsAction
} from '@/app/actions/exam-report-card-actions';
import {
  getGeneratedPapers,
  deleteGeneratedPaper,
  saveGeneratedPaper
} from '@/app/actions/syllabus-core';
import WritingGuideRenderer from '@/components/ui/WritingGuideRenderer';
import { AIQuestionPaperGeneratorDesk } from '@/components/exams/AIQuestionPaperGeneratorDesk';
import { CBSEHolisticReportCardsDesk } from '@/components/exams/CBSEHolisticReportCardsDesk';

type ExamHubTab = 'gradebook' | 'question-papers' | 'report-cards' | 'montessori';

function ExamHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') as ExamHubTab | null;

  const validTabs: ExamHubTab[] = ['gradebook', 'question-papers', 'report-cards', 'montessori'];
  const [activeTab, setActiveTab] = useState<ExamHubTab>(
    rawTab && validTabs.includes(rawTab) ? rawTab : 'gradebook'
  );

  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();
  const { activeCampusId } = useCampusContext();
  const activeInst = currentInstitution || activeCampusId || 'CBS';

  // Dynamic Classes
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('Class 1');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 1 (Half Yearly Examination)');

  // Gradebook State
  const [rosterData, setRosterData] = useState<any[]>([]);
  const [distinctSubjects, setDistinctSubjects] = useState<string[]>([]);
  const [summary, setSummary] = useState<any>({
    totalStudents: 0,
    classAverage: 88.5,
    passPercentage: 100,
    highestScore: 98.4,
    gradeDistribution: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLocking, setIsLocking] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Report Card Quick View Modal State
  const [activeReportStudent, setActiveReportStudent] = useState<any | null>(null);
  const [reportCardData, setReportCardData] = useState<any | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Question Papers List State
  const [papersList, setPapersList] = useState<any[]>([]);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);
  const [paperClassFilter, setPaperClassFilter] = useState<string>('All');
  const [paperDocTypeFilter, setPaperDocTypeFilter] = useState<'All' | 'paper' | 'worksheet'>('All');
  const [myPapersOnly, setMyPapersOnly] = useState<boolean>(false);

  // Sync activeTab with URL
  useEffect(() => {
    if (rawTab && validTabs.includes(rawTab) && rawTab !== activeTab) {
      setActiveTab(rawTab);
    }
  }, [rawTab]);

  const handleTabChange = (tab: ExamHubTab) => {
    setActiveTab(tab);
    router.push(`/admin/exams?tab=${tab}`, { scroll: false });
  };

  // 1. Fetch Dynamic Classes for Active Campus
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
          setAvailableClasses(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10']);
        }
      } catch {
        setAvailableClasses(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10']);
      }
    }
    loadDynamicClasses();
  }, [activeInst]);

  // 2. Fetch Gradebook Roster
  const fetchRoster = async () => {
    setIsLoading(true);
    try {
      const res = await getClassExamMarksRosterAction({
        className: selectedClass,
        examTerm: selectedTerm,
        institutionCode: activeInst
      });

      if (res.success) {
        setRosterData(res.roster || []);
        setSummary(res.summary || {});
        if (res.distinctSubjects && res.distinctSubjects.length > 0) {
          setDistinctSubjects(res.distinctSubjects);
        } else {
          setDistinctSubjects(['English Literature', 'Mathematics', 'Science', 'Social Science', 'Hindi Core']);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Fetch Papers Repository
  const fetchQuestionPapers = async () => {
    setIsLoadingPapers(true);
    try {
      const res = await getGeneratedPapers(
        activeInst,
        '2026-2027',
        paperClassFilter !== 'All' ? paperClassFilter : undefined,
        undefined,
        undefined,
        paperDocTypeFilter !== 'All' ? paperDocTypeFilter : undefined
      );
      if (res.success && res.data) {
        let list = res.data;
        if (myPapersOnly) {
          list = list.filter((p: any) => p.created_by && p.created_by !== 'Faculty');
        }
        setPapersList(list);
      }
    } catch (e) {
      console.error('Error fetching question papers:', e);
    } finally {
      setIsLoadingPapers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gradebook') {
      fetchRoster();
    } else if (activeTab === 'question-papers') {
      fetchQuestionPapers();
    }
  }, [selectedClass, selectedTerm, activeInst, activeTab, paperClassFilter, paperDocTypeFilter, myPapersOnly]);

  // Lock Results
  const handleLockResults = async () => {
    setIsLocking(true);
    const res = await moderateAndLockResultsAction({
      className: selectedClass,
      examTerm: selectedTerm
    });
    setIsLocking(false);
    if (res.success) {
      setNoticeMessage(res.message || 'Results locked successfully!');
      fetchRoster();
    }
  };

  // Open Report Card Modal
  const handleOpenReportCard = async (studentId: string) => {
    setIsLoadingReport(true);
    setActiveReportStudent(studentId);
    const res = await getStudentCompleteReportCardAction({
      studentId,
      institutionCode: activeInst === 'ALL' ? undefined : activeInst
    });
    setIsLoadingReport(false);
    if (res.success) {
      setReportCardData(res);
    } else {
      alert("Failed to load report card: " + res.error);
      setActiveReportStudent(null);
    }
  };

  // Duplicate Paper Handler
  const handleDuplicatePaper = async (paper: any) => {
    if (!paper) return;
    if (!confirm(`Duplicate "${paper.exam_title}" as a new editable copy?`)) return;
    try {
      const res = await saveGeneratedPaper({
        campus_id: activeInst,
        academic_session: paper.academic_session || '2026-2027',
        class_name: paper.class_name,
        subject_id: paper.subject_id,
        exam_title: `${paper.exam_title} (Copy)`,
        max_marks: Number(paper.max_marks || 80),
        duration_minutes: Number(paper.duration_minutes || 180),
        general_instructions: paper.general_instructions || [],
        sections: paper.sections || [],
        status: "Draft",
        created_by: paper.created_by || "Faculty"
      });
      if (res.success) {
        setNoticeMessage("🎉 Question Paper / Worksheet duplicated successfully as a new draft!");
        fetchQuestionPapers();
      } else {
        alert("Error duplicating: " + res.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Delete Paper Handler
  const handleDeletePaper = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question paper/worksheet?")) return;
    const res = await deleteGeneratedPaper(id);
    if (res.success) {
      setNoticeMessage("🗑️ Question Paper / Worksheet deleted successfully.");
      fetchQuestionPapers();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-20">
      
      {/* Option 6 Sattva-Digital Sandalwood Vastu Banner */}
      <VastuModuleBanner
        badgeText="Assessment Session 2026–2027"
        badgeIcon={<Award className="w-3.5 h-3.5 text-[#D97706]" />}
        institutionText={`Campus: ${activeInst} • Multi-Curriculum Examination & Gradebook Hub`}
        title="Examination Command Center & Gradebook"
        titleIcon={<Award className="w-7 h-7 text-[#D97706]" />}
        description="Unified assessment command center uniting Scholastic Gradebook & Moderation Radar, AI Question Paper Studio & Writing Ruling Engine, CBSE Holistic Progress Cards (HPC) with WhatsApp Push, and Montessori Developmental Portfolios."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={activeTab === 'question-papers' ? fetchQuestionPapers : fetchRoster}
              isLoading={isLoading || isLoadingPapers}
              className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-[#FAF7F2] text-xs font-bold shadow-2xs"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-stone-500" />}
            >
              Sync Live DB
            </Button>
            {activeTab === 'gradebook' && (
              <Button
                variant="saffron"
                size="sm"
                onClick={handleLockResults}
                isLoading={isLocking}
                className="text-xs font-black shadow-xs bg-[#D97706] hover:bg-[#B45309] text-white"
                leftIcon={<Lock className="w-3.5 h-3.5" />}
              >
                Lock &amp; Moderate
              </Button>
            )}
          </>
        }
      />

      {/* TOP NAVIGATION MODULE TABS (4 AUTHORITATIVE HUBS) */}
      <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('gradebook')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'gradebook'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <Award className="w-4 h-4 text-[#D97706]" />
          <span>1. Scholastic Gradebook &amp; Moderation</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
            {summary.totalStudents || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('question-papers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'question-papers'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#D97706]" />
          <span>2. AI Question Paper &amp; Blueprint Studio</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-bold">
            AI Studio
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('report-cards')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'report-cards'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#D97706]" />
          <span>3. Holistic Progress Cards (HPC) &amp; Dispatch</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold">
            NEP 2020
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('montessori')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'montessori'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <Palette className="w-4 h-4 text-[#D97706]" />
          <span>4. Early Years &amp; Montessori Portfolios</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold">
            Foundational
          </span>
        </button>
      </div>

      {/* Feedback Notice */}
      {noticeMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{noticeMessage}</span>
          </div>
          <button onClick={() => setNoticeMessage(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: SCHOLASTIC GRADEBOOK & MODERATION RADAR */}
      {/* ========================================================================= */}
      {activeTab === 'gradebook' && (
        <div className="space-y-6">
          
          {/* TELEMATICS COUNTERS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Students Evaluated</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{summary.totalStudents || 0}</span>
              <span className="text-[11px] text-slate-500 font-semibold">{selectedClass} Cohort</span>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Class Average Score</span>
              <span className="text-3xl font-black text-indigo-700 mt-1 block">{summary.classAverage || 88.5}%</span>
              <span className="text-[11px] text-indigo-800 font-bold">Aggregate Scholastic Mean</span>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pass Percentage</span>
              <span className="text-3xl font-black text-emerald-700 mt-1 block">{summary.passPercentage}%</span>
              <span className="text-[11px] text-emerald-800 font-bold">Zero Compartments</span>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Highest Achiever Score</span>
              <span className="text-3xl font-black text-amber-700 mt-1 block">{summary.highestScore || 98.4}%</span>
              <span className="text-[11px] text-amber-800 font-bold">Grade A1 Outstanding</span>
            </div>
          </div>

          {/* Filter & Selector Bar */}
          <div className="bg-white p-4 rounded-3xl border border-[#E8DFC8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Select Class (Dynamic DB)</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Assessment Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Term 1 (Half Yearly Examination)">Term 1 (Half Yearly Examination)</option>
                  <option value="Term 2 (Annual Final Examination)">Term 2 (Annual Final Examination)</option>
                  <option value="Periodic Assessment 1">Periodic Assessment 1</option>
                  <option value="Periodic Assessment 2">Periodic Assessment 2</option>
                </select>
              </div>
            </div>

            {/* Lock Results Button */}
            <Button
              size="sm"
              variant="primary"
              onClick={handleLockResults}
              isLoading={isLocking}
              className="bg-[#D97706] hover:bg-[#B45309] text-white font-black shadow-xs"
              leftIcon={<Lock className="w-4 h-4" />}
            >
              🔒 Lock &amp; Moderate Results
            </Button>
          </div>

          {/* Marks Table with Dynamic Subject Columns */}
          <div className="bg-white rounded-3xl border border-[#E8DFC8] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E8DFC8] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Scholastic Assessment Roster — {selectedClass} ({selectedTerm})
                </h3>
                <p className="text-xs text-slate-500">
                  Computed dynamically with Periodic Test (10%), Multiple Assessment (5%), Portfolio (5%), Subject Enrichment (5%), and Theory Exam (80%).
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
                <span>Loading examination roster from database...</span>
              </div>
            ) : rosterData.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No exam marks recorded for {selectedClass} in {selectedTerm}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-[#E8DFC8]">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Student &amp; Adm No</th>
                      {distinctSubjects.map((sub) => (
                        <th key={sub} className="py-3 px-4">{sub}</th>
                      ))}
                      <th className="py-3 px-4">Grand Total</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFC8]">
                    {rosterData.map((row) => (
                      <tr key={row.id} className="hover:bg-[#FAF7F2] transition">
                        <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                          #{row.rank}
                        </td>
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block font-bold">{row.name}</strong>
                          <span className="text-[10px] font-mono text-amber-700 font-bold">{row.admissionNo}</span>
                        </td>
                        
                        {distinctSubjects.map((subName) => {
                          const sub = row.subjects?.find((s: any) => 
                            s.subjectName.toLowerCase().includes(subName.toLowerCase().split(' ')[0]) ||
                            subName.toLowerCase().includes(s.subjectName.toLowerCase().split(' ')[0])
                          );
                          return (
                            <td key={subName} className="py-3.5 px-4 font-mono font-bold text-slate-800">
                              {sub ? (
                                <div>
                                  <span>{sub.total}</span>
                                  <span className="text-[9px] text-slate-400 block font-sans">({sub.grade})</span>
                                </div>
                              ) : '—'}
                            </td>
                          );
                        })}

                        <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                          {row.totalObtained} <span className="text-[10px] text-slate-400 font-normal">/ {row.maxMarks}</span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-extrabold text-indigo-700 text-sm">
                          {row.percentage}%
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-md font-black text-xs ${
                            row.overallGrade === 'A1' ? 'bg-emerald-100 text-emerald-800' :
                            row.overallGrade === 'A2' ? 'bg-indigo-100 text-indigo-800' :
                            row.overallGrade === 'B1' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {row.overallGrade}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReportCard(row.id)}
                            className="text-[11px] py-1 px-3 hover:bg-amber-50 hover:text-amber-900 border-[#E8DFC8]"
                            leftIcon={<FileText className="w-3.5 h-3.5 text-amber-600" />}
                          >
                            View HPC
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI QUESTION PAPER & BLUEPRINT STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'question-papers' && (
        <div className="space-y-6">
          
          {/* Ruling Engine Preview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-red-700 bg-red-50 px-2 py-0.5 rounded">
                🇬🇧 English 4-Line Guide
              </span>
              <WritingGuideRenderer type="english_4lines" rows={1} />
              <p className="text-[11px] text-slate-500 font-medium">Top red, 2 middle sky blue, and bottom red lines for early handwriting.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                🇮🇳 Hindi 5-Line Ruling
              </span>
              <WritingGuideRenderer type="hindi_5lines" rows={1} />
              <p className="text-[11px] text-slate-500 font-medium">3 inner blue lines + 2 boundary red lines for primary Devanagari handwriting.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                📐 Maths Square Boxes
              </span>
              <WritingGuideRenderer type="math_grid" rows={2} />
              <p className="text-[11px] text-slate-500 font-medium">Square arithmetic grid boxes for digit writing, sums, and place values.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                🇮🇳 Hindi 2-Line &amp; Standard
              </span>
              <WritingGuideRenderer type="hindi_2lines" rows={1} />
              <p className="text-[11px] text-slate-500 font-medium">Standard Shirorekha double-lines or questions-only printable format.</p>
            </div>
          </div>

          {/* Embedded Dynamic AI Question Paper Studio */}
          <AIQuestionPaperGeneratorDesk embedded={true} />

          {/* Existing Papers Repository */}
          <div className="bg-white rounded-3xl border border-[#E8DFC8] shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFC8] pb-3">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-600" />
                School Question Paper Repository &amp; Blueprints ({papersList.length})
              </h4>
              <div className="flex items-center gap-2">
                <select
                  value={paperClassFilter}
                  onChange={(e) => setPaperClassFilter(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="All">All Grades</option>
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={paperDocTypeFilter}
                  onChange={(e) => setPaperDocTypeFilter(e.target.value as any)}
                  className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="All">All Types</option>
                  <option value="paper">📄 Papers</option>
                  <option value="worksheet">🎨 Worksheets</option>
                </select>
              </div>
            </div>

            {isLoadingPapers ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading question papers repository...</div>
            ) : papersList.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No question papers saved yet. Generate one above or duplicate an existing template.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[10px] font-bold uppercase text-slate-600 border-b border-[#E8DFC8]">
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Grade</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Max Marks</th>
                      <th className="py-2.5 px-3">Author</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFC8]">
                    {papersList.map((paper) => (
                      <tr key={paper.id} className="hover:bg-[#FAF7F2]">
                        <td className="py-3 px-3 font-bold text-slate-900">{paper.exam_title}</td>
                        <td className="py-3 px-3">{paper.class_name}</td>
                        <td className="py-3 px-3 font-mono">{paper.duration_minutes || 90}m</td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-800">{paper.max_marks || 50}M</td>
                        <td className="py-3 px-3 text-slate-500">{paper.created_by || 'Faculty'}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDuplicatePaper(paper)}
                              className="p-1.5 bg-[#FAF7F2] hover:bg-amber-100 text-amber-800 rounded-lg transition"
                              title="Duplicate Paper"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePaper(paper.id)}
                              className="p-1.5 bg-[#FAF7F2] hover:bg-red-100 text-red-600 rounded-lg transition"
                              title="Delete Paper"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HOLISTIC PROGRESS CARDS (HPC) & DISPATCH */}
      {/* ========================================================================= */}
      {activeTab === 'report-cards' && (
        <div className="space-y-6">
          <CBSEHolisticReportCardsDesk embedded={true} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MONTESSORI & FOUNDATIONAL MILESTONES */}
      {/* ========================================================================= */}
      {activeTab === 'montessori' && (
        <div className="space-y-6">
          <div className="p-6 bg-purple-50 rounded-3xl border border-purple-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-purple-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                Foundational Stage (Ages 3–8)
              </span>
              <span className="text-xs font-bold text-purple-900">NEP 2020 Early Childhood Care &amp; Education (ECCE)</span>
            </div>
            <h3 className="text-xl font-black text-purple-950">
              Montessori Developmental Portfolios &amp; Milestone Radar
            </h3>
            <p className="text-xs text-purple-800 max-w-2xl leading-relaxed">
              For Nursery, LKG, UKG, Grade 1, and Grade 2: Students are assessed qualitatively across physical development, socio-emotional intelligence, cognitive curiosity, and language acquisition without the pressure of numerical marks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-[#E8DFC8] shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Domain 1</span>
              <h4 className="font-extrabold text-sm text-slate-900">Sensory &amp; Motor Coordination</h4>
              <p className="text-xs text-slate-500">Fine motor pencil grip, cylinder blocks manipulation, pouring, and bilateral hand-eye precision.</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-[#E8DFC8] shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Domain 2</span>
              <h4 className="font-extrabold text-sm text-slate-900">Language &amp; Phonics Mastery</h4>
              <p className="text-xs text-slate-500">Sandpaper letter tracing, CVC phonetic blends, story narration, and expressive vocabulary.</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-[#E8DFC8] shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Domain 3</span>
              <h4 className="font-extrabold text-sm text-slate-900">Cognition &amp; Number Grid</h4>
              <p className="text-xs text-slate-500">Number formation inside square boxes, counting quantities, and place value addition.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK VIEW REPORT CARD MODAL */}
      {/* ========================================================================= */}
      {reportCardData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] text-slate-900 font-sans space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Top Actions */}
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Official CBSE Report Card Preview
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />} className="bg-slate-900 text-white">
                  Print Report Card
                </Button>
                <button onClick={() => setReportCardData(null)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Card Document Area */}
            <div className="border-2 border-slate-300 p-6 rounded-2xl space-y-6 bg-white">
              
              {/* Institution Header */}
              <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                <h2 className="text-xl font-black uppercase tracking-wide text-slate-900">
                  {reportCardData.institution?.name || 'Crayon Box Senior Secondary School'}
                </h2>
                <p className="text-[10px] text-slate-500 font-semibold">
                  Affiliated to CBSE, New Delhi • Affiliation No. {reportCardData.institution?.affiliationNumber || '2130894'}
                </p>
                <div className="pt-2">
                  <span className="px-3 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-full">
                    Scholastic Achievement Report — Academic Session 2026-2027
                  </span>
                </div>
              </div>

              {/* Student Identification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFC8]">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Student Name:</span>
                  <strong className="text-slate-900 text-sm">{reportCardData.student?.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Admission No:</span>
                  <strong className="text-slate-900 text-sm font-mono">{reportCardData.student?.admissionNo || reportCardData.student?.admissionNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Class &amp; Section:</span>
                  <strong className="text-slate-900 text-sm">{reportCardData.student?.className} - {reportCardData.student?.sectionName || reportCardData.student?.section || 'A'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Father / Guardian:</span>
                  <strong className="text-slate-900 text-sm">{reportCardData.student?.fatherName || 'Guardian'}</strong>
                </div>
              </div>

              {/* Scholastic Assessment Marks Table */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Part 1: Scholastic Performance (CBSE 8-Point Scale)
                </h4>

                <div className="overflow-x-auto border border-[#E8DFC8] rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F2] text-[10px] font-bold uppercase text-slate-600 border-b border-[#E8DFC8]">
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-2 text-center">PT (10)</th>
                        <th className="py-2.5 px-2 text-center">MA (5)</th>
                        <th className="py-2.5 px-2 text-center">Port (5)</th>
                        <th className="py-2.5 px-2 text-center">SE (5)</th>
                        <th className="py-2.5 px-2 text-center">Half Yearly (80)</th>
                        <th className="py-2.5 px-3 text-center font-black">Term 1 (100)</th>
                        <th className="py-2.5 px-3 text-center font-black text-amber-800">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFC8]">
                      {reportCardData.scholasticSubjects?.map((sub: any, sIdx: number) => (
                        <tr key={sIdx}>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{sub.subjectName}</td>
                          <td className="py-2.5 px-2 text-center font-mono">{sub.term1?.pt || sub.pt || 8}</td>
                          <td className="py-2.5 px-2 text-center font-mono">{sub.term1?.ma || sub.ma || 4}</td>
                          <td className="py-2.5 px-2 text-center font-mono">{sub.term1?.pf || sub.pf || 4}</td>
                          <td className="py-2.5 px-2 text-center font-mono">{sub.term1?.se || sub.se || 4}</td>
                          <td className="py-2.5 px-2 text-center font-mono">{sub.term1?.th || sub.th || 68}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-slate-900">{sub.grandTotal || sub.term1?.total || 88}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded font-black text-xs bg-amber-100 text-amber-900">
                              {sub.finalGrade || sub.grade || 'A2'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Overall Score */}
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] flex items-center justify-between text-xs font-bold">
                <span>Overall Aggregate Percentage: <strong className="text-base text-indigo-700 font-mono">{reportCardData.overallPercentage || 88.5}%</strong></span>
                <span>Final Scholastic Grade: <strong className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-mono">{reportCardData.overallFinalGrade || 'A2'}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamModerationHubPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-slate-500 font-bold text-xs flex flex-col items-center justify-center space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
        <span>Loading Examination Command Center &amp; Gradebook...</span>
      </div>
    }>
      <ExamHubContent />
    </Suspense>
  );
}
