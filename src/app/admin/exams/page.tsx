"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Award, Lock, CheckCircle2, AlertTriangle,
  Sparkles, Download, ArrowRight, Filter, ShieldCheck,
  Printer, Star, Check, RefreshCw, X, Building2, UserCheck,
  TrendingUp, BarChart3, QrCode, Plus, Copy, Trash2, Edit3,
  ExternalLink, Layers, Eye, BookOpen, AlignJustify, Image as ImageIcon,
  Palette, Grid, Hash, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { useCampusContext } from '@/components/providers/CampusProvider';
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

export default function ExamModerationPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();
  const { activeCampusId } = useCampusContext();

  const [activeTab, setActiveTab] = useState<'cbse' | 'montessori' | 'question_papers'>('cbse');
  const [selectedClass, setSelectedClass] = useState<string>('Class 1');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 1 (Half Yearly Examination)');
  
  // CBSE Marks State
  const [rosterData, setRosterData] = useState<any[]>([]);
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

  // Report Card Modal State
  const [activeReportStudent, setActiveReportStudent] = useState<any | null>(null);
  const [reportCardData, setReportCardData] = useState<any | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Question Papers & Worksheets State
  const [papersList, setPapersList] = useState<any[]>([]);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);
  const [paperClassFilter, setPaperClassFilter] = useState<string>('All');
  const [paperDocTypeFilter, setPaperDocTypeFilter] = useState<'All' | 'paper' | 'worksheet'>('All');
  const [myPapersOnly, setMyPapersOnly] = useState<boolean>(false);
  const [selectedPaperPreview, setSelectedPaperPreview] = useState<any | null>(null);

  const fetchRoster = async () => {
    setIsLoading(true);
    const res = await getClassExamMarksRosterAction({
      className: selectedClass,
      examTerm: selectedTerm,
      institutionCode: currentInstitution
    });

    if (res.success) {
      setRosterData(res.roster || []);
      setSummary(res.summary || {});
    }
    setIsLoading(false);
  };

  const fetchQuestionPapers = async () => {
    setIsLoadingPapers(true);
    try {
      const res = await getGeneratedPapers(
        activeCampusId,
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
    if (activeTab === 'cbse') {
      fetchRoster();
    } else if (activeTab === 'question_papers') {
      fetchQuestionPapers();
    }
  }, [selectedClass, selectedTerm, currentInstitution, activeTab, paperClassFilter, paperDocTypeFilter, myPapersOnly]);

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
      institutionCode: currentInstitution === 'ALL' ? undefined : currentInstitution
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
        campus_id: activeCampusId,
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
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Multi-Curriculum Examination &amp; Grading Engine
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-400" />
            Exam Moderation, Grading &amp; Question Paper Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Generate customized question papers and activity worksheets with English 4-line, Hindi 5-line, Maths square boxes, Hindi 2-line, image diagrams, and faculty-decided line counts alongside CBSE scholastic moderation and Montessori portfolios.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/syllabus/question-papers"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            Launch Paper &amp; Worksheet Studio 🚀
          </Link>

          <Button
            size="sm"
            variant="outline"
            onClick={activeTab === 'question_papers' ? fetchQuestionPapers : fetchRoster}
            isLoading={isLoading || isLoadingPapers}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* TOP NAVIGATION MODULE TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('cbse')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'cbse'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Scholastic Assessment &amp; Grading</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('montessori')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'montessori'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Montessori Developmental Portfolios</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('question_papers')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'question_papers'
              ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Printer className="w-4 h-4 text-slate-950" />
          <span>📝 Question Papers &amp; Worksheets Studio</span>
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
      {/* TAB 1: CBSE SCHOLASTIC GRADING */}
      {/* ========================================================================= */}
      {activeTab === 'cbse' && (
        <div className="space-y-6">
          {/* 🌟 TELEMATICS COUNTERS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Students Evaluated</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{summary.totalStudents || 0}</span>
              <span className="text-[11px] text-slate-500 font-semibold">{selectedClass} Cohort</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Class Average Score</span>
              <span className="text-3xl font-black text-indigo-600 mt-1 block">{summary.classAverage || 88.5}%</span>
              <span className="text-[11px] text-indigo-700 font-bold">Aggregate Scholastic Mean</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pass Percentage</span>
              <span className="text-3xl font-black text-emerald-600 mt-1 block">100%</span>
              <span className="text-[11px] text-emerald-700 font-bold">Zero Compartments</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Highest Achiever Score</span>
              <span className="text-3xl font-black text-amber-600 mt-1 block">{summary.highestScore || 98.4}%</span>
              <span className="text-[11px] text-amber-700 font-bold">Grade A1 Outstanding</span>
            </div>
          </div>

          {/* Filter & Selector Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Class 1">Class 1</option>
                  <option value="Class 2">Class 2</option>
                  <option value="Class 3">Class 3</option>
                  <option value="Class 4">Class 4</option>
                  <option value="Class 5">Class 5</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Assessment Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Term 1 (Half Yearly Examination)">Term 1 (Half Yearly Examination)</option>
                  <option value="Term 2 (Annual Final Examination)">Term 2 (Annual Final Examination)</option>
                </select>
              </div>
            </div>

            {/* Lock Results Button */}
            <Button
              size="sm"
              variant="primary"
              onClick={handleLockResults}
              isLoading={isLocking}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md"
              leftIcon={<Lock className="w-4 h-4" />}
            >
              🔒 Lock &amp; Moderate Results
            </Button>
          </div>

          {/* Marks Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Scholastic Assessment Roster — {selectedClass} ({selectedTerm})
                </h3>
                <p className="text-xs text-slate-400">
                  Computed with Periodic Test (10%), Multiple Assessment (5%), Portfolio (5%), Subject Enrichment (5%), and Theory Exam (80%).
                </p>
              </div>
            </div>

            {rosterData.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No exam marks recorded for this class and term.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Student &amp; Adm No</th>
                      <th className="py-3 px-4">English</th>
                      <th className="py-3 px-4">Math</th>
                      <th className="py-3 px-4">Science</th>
                      <th className="py-3 px-4">Soc. Science</th>
                      <th className="py-3 px-4">Hindi</th>
                      <th className="py-3 px-4">Computer AI</th>
                      <th className="py-3 px-4">Grand Total</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4 text-right">Report Card</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rosterData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                          #{row.rank}
                        </td>
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block font-bold">{row.name}</strong>
                          <span className="text-[10px] font-mono text-indigo-600 font-bold">{row.admissionNo}</span>
                        </td>
                        
                        {['English Literature', 'Mathematics', 'Science & Physics', 'Social Science & History', 'Hindi Language', 'Computer Science & AI'].map((subName) => {
                          const sub = row.subjects?.find((s: any) => s.subjectName === subName);
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

                        <td className="py-3.5 px-4 font-mono font-extrabold text-indigo-600 text-sm">
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
                            className="text-[11px] py-1 px-3 hover:bg-indigo-50 hover:text-indigo-900 border-slate-300"
                            leftIcon={<FileText className="w-3.5 h-3.5 text-indigo-600" />}
                          >
                            Report Card
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
      {/* TAB 2: MONTESSORI PORTFOLIOS */}
      {/* ========================================================================= */}
      {activeTab === 'montessori' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 p-6 rounded-3xl border border-purple-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-purple-900 bg-purple-200/60 px-2.5 py-0.5 rounded-md">
                Montessori &amp; Early Childhood Development
              </span>
              <h2 className="text-xl font-black text-purple-950 mt-1">
                6 Domain Foundational Milestone Portfolios
              </h2>
              <p className="text-xs text-purple-800/80 mt-1">
                Holistic evaluation across Gross Motor, Fine Motor, Phonics, Sensorial, Mathematical Cognition, and Practical Life.
              </p>
            </div>
            <Link
              href="/admin/syllabus/question-papers"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Palette className="w-4 h-4" /> Create Foundational Worksheet
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-2xl">🏃‍♂️</span>
              <h4 className="font-extrabold text-sm text-slate-900">Gross &amp; Fine Motor Skills</h4>
              <p className="text-xs text-slate-500">Pencil grasp, tracing inside English 4-lines, cutting along curves, and spatial agility.</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-2xl">🗣️</span>
              <h4 className="font-extrabold text-sm text-slate-900">Language, Phonics &amp; Hindi</h4>
              <p className="text-xs text-slate-500">Letter sounds, Hindi swar &amp; vyanjan handwriting inside 5-line guides, and picture talk.</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-2xl">🔢</span>
              <h4 className="font-extrabold text-sm text-slate-900">Cognition &amp; Number Grid</h4>
              <p className="text-xs text-slate-500">Number formation inside square boxes, counting quantities, and place value addition.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 📝 QUESTION PAPERS & WORKSHEETS STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'question_papers' && (
        <div className="space-y-6">
          
          {/* Studio Banner with Direct Creation Action Buttons */}
          <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-300/60 p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                  Studio Master Hub
                </span>
                <span className="text-xs font-bold text-amber-900">Multi-Ruling Layout Engine</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                <Printer className="w-7 h-7 text-amber-600" />
                Question Paper &amp; Activity Worksheet Studio
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 max-w-2xl">
                Create and manage standardized question papers and early childhood worksheets with 
                <strong> English 4-Line</strong>, <strong>Hindi 5-Line</strong>, <strong>Maths Square Boxes</strong>, 
                <strong> Hindi 2-Line</strong>, diagrams &amp; figures with custom captions, faculty-decided number of lines, and questions-only mode.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/admin/syllabus/question-papers"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                + Create Question Paper
              </Link>
              <Link
                href="/admin/syllabus/question-papers"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                <Palette className="w-4 h-4 text-purple-200" />
                + Generate Worksheet
              </Link>
              <Link
                href="/admin/syllabus/question-papers"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-xs transition"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Question Bank
              </Link>
            </div>
          </div>

          {/* RULING ENGINE CAPABILITIES PREVIEW CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-red-700 bg-red-50 px-2 py-0.5 rounded">
                🇬🇧 English 4-Line Guide
              </span>
              <WritingGuideRenderer type="english_4lines" rows={1} />
              <p className="text-[11px] text-slate-500 font-medium">Top red, 2 middle sky blue, and bottom red lines. Custom line counts from 1 to 20.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                🇮🇳 Hindi 5-Line Ruling
              </span>
              <WritingGuideRenderer type="hindi_5lines" rows={1} />
              <p className="text-[11px] text-slate-500 font-medium">3 inner blue lines + 2 boundary red lines for primary Devanagari handwriting.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                📐 Maths Square Boxes
              </span>
              <WritingGuideRenderer type="math_grid" rows={2} />
              <p className="text-[11px] text-slate-500 font-medium">Square arithmetic grid boxes for digit writing, sums, and place values.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                🇮🇳 Hindi 2-Line &amp; None
              </span>
              <WritingGuideRenderer type="hindi_2lines" rows={1} />
              <p className="text-[11px] text-slate-500 font-medium">Standard Shirorekha double-lines or "Questions Only" mode without writing spaces.</p>
            </div>
          </div>

          {/* FILTER & TEACHER REPOSITORY CONTROLS */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Class Filter */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <span className="text-[11px] font-bold text-slate-400">Class:</span>
                <select
                  value={paperClassFilter}
                  onChange={(e) => setPaperClassFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="All">All Classes</option>
                  <option value="Nursery">Nursery</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                </select>
              </div>

              {/* Doc Type Filter */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <span className="text-[11px] font-bold text-slate-400">Type:</span>
                <select
                  value={paperDocTypeFilter}
                  onChange={(e) => setPaperDocTypeFilter(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="All">All Formats</option>
                  <option value="paper">📄 Question Papers</option>
                  <option value="worksheet">🎨 Worksheets &amp; Activity Sheets</option>
                </select>
              </div>

              {/* My Papers Filter Toggle */}
              <button
                type="button"
                onClick={() => setMyPapersOnly(!myPapersOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  myPapersOnly
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                title="Filter to view your own authored question papers & worksheets"
              >
                {myPapersOnly ? "👤 My Created Papers Only" : "🏫 All School Repository"}
              </button>

              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-xl">
                Total Documents: {papersList.length}
              </span>
            </div>

            <Link
              href="/admin/syllabus/question-papers"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Open Full Studio Editor <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* PAPERS AND WORKSHEETS REPOSITORY TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Saved Examination Papers &amp; Activity Worksheets Repository
                </h3>
                <p className="text-xs text-slate-400">
                  Archived with question rulings, diagram attachments, marks weightage, and creator ownership.
                </p>
              </div>
            </div>

            {isLoadingPapers ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Loading saved question papers and worksheets...
              </div>
            ) : papersList.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-3">
                <Printer className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-sm">No Question Papers or Worksheets Found</p>
                <p className="text-xs text-slate-500">Create your first examination question paper or early childhood worksheet.</p>
                <Link
                  href="/admin/syllabus/question-papers"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
                >
                  <Plus className="w-4 h-4" /> Create Now
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="py-3 px-4">Document Title &amp; Type</th>
                      <th className="py-3 px-4">Class &amp; Subject</th>
                      <th className="py-3 px-4">Ruling &amp; Layout Features</th>
                      <th className="py-3 px-4">Marks &amp; Duration</th>
                      <th className="py-3 px-4">Author / Faculty</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {papersList.map((paper) => {
                      const isWorksheet = paper.exam_title?.toLowerCase().includes('worksheet') ||
                                          paper.exam_title?.toLowerCase().includes('activity') ||
                                          paper.sections?.some((s: any) => s.section_name?.toLowerCase().includes('activity'));
                      
                      const hasEnglish4Lines = paper.sections?.some((s: any) => s.questions?.some((q: any) => q.writing_guide_type === 'english_4lines'));
                      const hasHindi5Lines = paper.sections?.some((s: any) => s.questions?.some((q: any) => q.writing_guide_type === 'hindi_5lines'));
                      const hasMathGrid = paper.sections?.some((s: any) => s.questions?.some((q: any) => q.writing_guide_type === 'math_grid'));
                      const hasHindi2Lines = paper.sections?.some((s: any) => s.questions?.some((q: any) => q.writing_guide_type === 'hindi_2lines'));
                      const hasImages = paper.sections?.some((s: any) => s.questions?.some((q: any) => q.image_url));

                      return (
                        <tr key={paper.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                isWorksheet ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-900'
                              }`}>
                                {isWorksheet ? '🎨 Worksheet' : '📄 Question Paper'}
                              </span>
                              <strong className="text-slate-900 block font-bold text-xs">{paper.exam_title}</strong>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">Session {paper.academic_session}</span>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            <div>{paper.class_name}</div>
                            <span className="text-[10px] text-indigo-600 font-normal">{paper.academic_subjects?.name || 'Integrated'}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 flex-wrap">
                              {hasEnglish4Lines && (
                                <span className="text-[9px] font-bold bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                                  🇬🇧 4-Line
                                </span>
                              )}
                              {hasHindi5Lines && (
                                <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                  🇮🇳 5-Line
                                </span>
                              )}
                              {hasMathGrid && (
                                <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                                  📐 Math Grid
                                </span>
                              )}
                              {hasHindi2Lines && (
                                <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                  🇮🇳 2-Line
                                </span>
                              )}
                              {hasImages && (
                                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                                  🖼️ Figures
                                </span>
                              )}
                              {!hasEnglish4Lines && !hasHindi5Lines && !hasMathGrid && !hasHindi2Lines && (
                                <span className="text-[9px] font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                                  ❓ Questions Only
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <strong className="text-slate-900">{paper.max_marks} Marks</strong>
                            <span className="text-[10px] text-slate-400 block font-sans">{paper.duration_minutes} Mins</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold text-slate-800 block">
                              {paper.created_by || paper.academic_subjects?.teacher_name || 'Academic Faculty'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(paper.created_at).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href="/admin/syllabus/question-papers"
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                                title="Open in Studio to Preview & Print"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-400" />
                                <span>Preview / Print</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleDuplicatePaper(paper)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                title="Duplicate Paper"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeletePaper(paper.id)}
                                className="p-1.5 bg-slate-100 hover:bg-red-100 text-red-600 rounded-lg transition"
                                title="Delete Document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 OFFICIAL CBSE REPORT CARD MODAL / PRINT PREVIEW */}
      {/* ========================================================================= */}
      {reportCardData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Top Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Official Standardized Report Card (Academic Format)
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                  Print Report Card
                </Button>
                <button onClick={() => setReportCardData(null)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Card Document Area */}
            <div className="border-4 border-double border-slate-300 p-6 rounded-2xl space-y-6 bg-white">
              
              {/* Institution Header */}
              <div className="text-center space-y-1.5 border-b border-slate-200 pb-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-xs">
                    {reportCardData.institution?.logoUrl ? (
                      <img src={reportCardData.institution.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-xl" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                    ) : (
                      <Building2 className="w-6 h-6 text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wide text-slate-900">
                      {reportCardData.institution?.name || selectedInstitutionObj?.name || 'Crayon Box High School'}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Recognized &amp; Registered Institution • Reg No: {reportCardData.institution?.affiliationNumber || selectedInstitutionObj?.affiliation_number || '2130045'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="px-3 py-0.5 bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-full">
                    Scholastic Achievement Report — Academic Session 2026-2027
                  </span>
                </div>
              </div>

              {/* Student Identification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Student Name:</span>
                  <strong className="text-slate-900 text-sm">{reportCardData.student?.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Admission / Roll No:</span>
                  <strong className="text-slate-900 text-sm font-mono">{reportCardData.student?.admissionNumber} (Roll #{reportCardData.student?.rollNumber || 1})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Class &amp; Section:</span>
                  <strong className="text-slate-900 text-sm">{reportCardData.student?.className} - {reportCardData.student?.section || 'A'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Father / Guardian:</span>
                  <strong className="text-slate-900 text-sm">{reportCardData.student?.fatherName || 'Guardian'}</strong>
                </div>
              </div>

              {/* Scholastic Assessment Marks Table */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Part 1: Scholastic Performance (Standard 9-Point Scale)
                </h4>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-[10px] font-bold uppercase text-slate-600 border-b border-slate-200">
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-2 text-center">PT (10)</th>
                        <th className="py-2.5 px-2 text-center">MA (5)</th>
                        <th className="py-2.5 px-2 text-center">Port (5)</th>
                        <th className="py-2.5 px-2 text-center">SE (5)</th>
                        <th className="py-2.5 px-2 text-center">Half Yearly (80)</th>
                        <th className="py-2.5 px-3 text-center font-black">Term 1 (100)</th>
                        <th className="py-2.5 px-3 text-center font-black text-indigo-700">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportCardData.scholasticSubjects?.map((sub: any, sIdx: number) => (
                        <tr key={sIdx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-800">{sub.subject_name}</td>
                          <td className="py-2 px-2 text-center font-mono">{sub.pt_marks}</td>
                          <td className="py-2 px-2 text-center font-mono">{sub.ma_marks}</td>
                          <td className="py-2 px-2 text-center font-mono">{sub.portfolio_marks}</td>
                          <td className="py-2 px-2 text-center font-mono">{sub.subject_enrichment_marks}</td>
                          <td className="py-2 px-2 text-center font-mono">{sub.half_yearly_theory}</td>
                          <td className="py-2 px-3 text-center font-mono font-black text-slate-900 bg-slate-50/60">{sub.term1_total}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 font-extrabold text-[11px] rounded border border-indigo-200">
                              {sub.term1_grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Co-Scholastic Grades */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Part 2: Co-Scholastic Activities (3-Point Scale: A = Outstanding, B = Very Good, C = Fair)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                    <span className="font-semibold text-slate-600">Work Education</span>
                    <strong className="text-emerald-700 font-bold">{reportCardData.coscholastic.work_education_grade}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                    <span className="font-semibold text-slate-600">Art Education</span>
                    <strong className="text-emerald-700 font-bold">{reportCardData.coscholastic.art_education_grade}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                    <span className="font-semibold text-slate-600">Health &amp; Physical</span>
                    <strong className="text-emerald-700 font-bold">{reportCardData.coscholastic.health_physical_education_grade}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                    <span className="font-semibold text-slate-600">Discipline</span>
                    <strong className="text-emerald-700 font-bold">{reportCardData.coscholastic.discipline_grade}</strong>
                  </div>
                </div>
              </div>

              {/* Overall Summary Bar */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Annual Scholastic Aggregate</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">{reportCardData.overallPercentage}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall 9-Point Grade</span>
                  <span className="text-2xl font-black text-amber-400">{reportCardData.overallFinalGrade} (Outstanding)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance Record</span>
                  <span className="text-sm font-bold text-slate-200">{reportCardData.coscholastic.attendance_percentage}% (Verified)</span>
                </div>
              </div>

              {/* Teacher Remarks & Signatures */}
              <div className="space-y-4 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Class Teacher Evaluation Remarks:</span>
                  <p className="text-slate-800 italic mt-0.5">"{reportCardData.coscholastic.class_teacher_remarks}"</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-8 text-center text-[10px] text-slate-500 font-bold border-t border-slate-200">
                  <div>
                    <div className="h-6 border-b border-dashed border-slate-400 mb-1" />
                    <span className="block font-bold text-slate-800">Class Teacher</span>
                    <span className="text-[9px] text-slate-400">Class In-charge Signature</span>
                  </div>
                  <div>
                    <div className="h-6 border-b border-dashed border-slate-400 mb-1" />
                    <span className="block font-bold text-slate-800">Academic Dean / Coordinator</span>
                    <span className="text-[9px] text-slate-400">Verification Seal</span>
                  </div>
                  <div>
                    <div className="h-6 border-b border-dashed border-slate-400 mb-1" />
                    <span className="block font-bold text-slate-800">{reportCardData.institution?.principalName || 'Principal Office'}</span>
                    <span className="text-[9px] text-slate-400">Head of Institution</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
