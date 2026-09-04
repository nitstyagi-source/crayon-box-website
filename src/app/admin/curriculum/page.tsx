"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  BookOpen, Layers, CheckCircle2, AlertTriangle, TrendingUp,
  Sparkles, Download, ArrowRight, ExternalLink, Filter, BarChart3,
  RefreshCw, Search, Eye, Plus, Check, Clock, ShieldAlert,
  GraduationCap, UserCheck, X, FileText, ChevronRight, Settings,
  Calendar, Award, Target, HelpCircle, ArrowUpRight, Send, Atom
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import { getInstitutionClassesAction } from '@/app/actions/attendance-actions';
import { TeacherLessonDiaryDesk } from '@/components/academics/TeacherLessonDiaryDesk';
import { InteractiveHomeworkLMSDesk } from '../academic/homework/page';
import { HomeworkAnnotationDesk } from '@/components/innovations/HomeworkAnnotationDesk';
import { LtiResourcePicker } from '@/components/curriculum/LtiResourcePicker';
import {
  getCurriculumRadarAction,
  getSubjectChaptersAction,
  getCurriculumTermsAction,
  saveCurriculumTermAction,
  toggleClassTermStatusAction,
  getClassTermOverridesAction,
  updateChapterTermAllocationAction,
  createOrUpdateChapterAction,
  saveTeacherLessonDiaryEntryAction,
  CurriculumSubjectRadarItem,
  CurriculumRadarMetrics,
  CurriculumTerm
} from '@/app/actions/curriculum-radar-actions';

const ASSESSMENT_MILESTONES = [
  'ALL',
  'FA-1 (Periodic Test 1)',
  'FA-2 (Periodic Test 2)',
  'SA-1 (Half-Yearly Exam)',
  'FA-3 (Periodic Test 3)',
  'FA-4 (Periodic Test 4)',
  'SA-2 (Annual Final Exam)'
];

function CurriculumRadarContent() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();
  const activeInst = currentInstitution === 'ALL' ? 'CBS' : currentInstitution;
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get('tab') || 'radar').toLowerCase();
  const [activeTab, setActiveTab] = useState<'RADAR' | 'DIARY' | 'HOMEWORK' | 'GRADING' | 'DIGITAL_RESOURCES'>(
    tabParam === 'diary' ? 'DIARY' :
    tabParam === 'homework' ? 'HOMEWORK' :
    tabParam === 'grading' ? 'GRADING' :
    tabParam === 'digital-resources' || tabParam === 'lti' ? 'DIGITAL_RESOURCES' : 'RADAR'
  );

  const [dynamicClasses, setDynamicClasses] = useState<string[]>([
    'All', 'Pre-Nursery', 'Nursery', 'LKG', 'UKG',
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ]);

  // Load dynamic classes
  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await getInstitutionClassesAction(activeInst);
        if (res.success && res.classes && res.classes.length > 0) {
          setDynamicClasses(['All', ...(res.classes as string[])]);
        }
      } catch (e) {
        console.error('Error fetching classes for curriculum:', e);
      }
    }
    loadClasses();
  }, [activeInst]);

  const handleTabChange = (tab: 'RADAR' | 'DIARY' | 'HOMEWORK' | 'GRADING') => {
    setActiveTab(tab);
    const paramMap = { RADAR: 'radar', DIARY: 'diary', HOMEWORK: 'homework', GRADING: 'grading' };
    router.replace(`/admin/curriculum?tab=${paramMap[tab]}`, { scroll: false });
  };

  const [subjects, setSubjects] = useState<CurriculumSubjectRadarItem[]>([]);
  const [metrics, setMetrics] = useState<CurriculumRadarMetrics | null>(null);
  const [terms, setTerms] = useState<CurriculumTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedGradeGroup, setSelectedGradeGroup] = useState('ALL');
  const [selectedTerm, setSelectedTerm] = useState('ALL'); // 'ALL' | 'Term 1' | 'Term 2'
  const [selectedMilestone, setSelectedMilestone] = useState('ALL');
  const [pacingFilter, setPacingFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'at_risk'>('cards');

  // Chapter Breakdown Drawer
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<any | null>(null);
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);

  // Term Configuration & Class Exemption Modal
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [termManagerClass, setTermManagerClass] = useState('All');
  const [classOverrides, setClassOverrides] = useState<any[]>([]);
  const [isTogglingTerm, setIsTogglingTerm] = useState(false);
  const [newTermForm, setNewTermForm] = useState({
    termName: 'Term 1',
    termCode: 'T1_FA1',
    assessmentType: 'FORMATIVE' as 'FORMATIVE' | 'SUMMATIVE',
    milestoneLabel: 'Formative Assessment 1 (FA-1 / Periodic Test 1)',
    startDate: '2026-04-01',
    targetCompletionDate: '2026-07-15',
    weightagePercentage: 10
  });
  const [isSavingTerm, setIsSavingTerm] = useState(false);

  // Chapter Term Re-allocation Modal
  const [editingChapterAllocation, setEditingChapterAllocation] = useState<any | null>(null);
  const [allocTerm, setAllocTerm] = useState('Term 1');
  const [allocMilestone, setAllocMilestone] = useState('FA-1 (Periodic Test 1)');
  const [allocTargetMonth, setAllocTargetMonth] = useState('April - July');
  const [isSavingAlloc, setIsSavingAlloc] = useState(false);

  // Quick Log Modal (Connected directly to Teacher Diary)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logTargetChapter, setLogTargetChapter] = useState<any | null>(null);
  const [logPeriodsToAdd, setLogPeriodsToAdd] = useState(1);
  const [logTopicTitle, setLogTopicTitle] = useState('');
  const [logTeachingMethod, setLogTeachingMethod] = useState('Smartboard & Concept Discussion');
  const [logTeachingAids, setLogTeachingAids] = useState('Smartboard, Flashcards, Manipulatives');
  const [logClasswork, setLogClasswork] = useState('Concept explanation and classroom textbook exercise');
  const [logHomework, setLogHomework] = useState('Complete practice questions in workbook');
  const [logRealWorld, setLogRealWorld] = useState('Applied practical demonstration to daily life');
  const [logAssignmentTitle, setLogAssignmentTitle] = useState('');
  const [logAssignmentDueDate, setLogAssignmentDueDate] = useState('');
  const [logImportantNotes, setLogImportantNotes] = useState('');
  const [logRemedialRequired, setLogRemedialRequired] = useState(false);
  const [logRemedialPlan, setLogRemedialPlan] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  // New Chapter Modal
  const [isNewChapterModalOpen, setIsNewChapterModalOpen] = useState(false);
  const [newChapterForm, setNewChapterForm] = useState({
    chapterNumber: 1,
    chapterName: '',
    estimatedPeriods: 8,
    termName: 'Term 1',
    assessmentMilestone: 'Formative Assessment 1 (FA-1 / Periodic Test 1)',
    targetMonth: 'April - July',
    learningObjectives: 'Understand foundational concepts and complete textbook exercises.',
    keyConcepts: 'Theory, formulas, and practical exercises.'
  });
  const [isSavingNewChapter, setIsSavingNewChapter] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchRadar = async () => {
    setIsLoading(true);
    try {
      const [radarRes, termsRes, overridesRes] = await Promise.all([
        getCurriculumRadarAction({
          institutionCode: activeInst,
          className: selectedClass,
          subjectSearch: searchQuery,
          pacingFilter: pacingFilter,
          termFilter: selectedTerm,
          milestoneFilter: selectedMilestone
        }),
        getCurriculumTermsAction(activeInst, '2026-2027', selectedClass !== 'All' ? selectedClass : undefined),
        getClassTermOverridesAction(activeInst, '2026-2027')
      ]);

      if (radarRes.success) {
        setSubjects(radarRes.data || []);
        setMetrics(radarRes.metrics || null);
      }
      if (termsRes.success) {
        setTerms(termsRes.terms || []);
      }
      if (overridesRes.success) {
        setClassOverrides(overridesRes.overrides || []);
      }
    } catch (e) {
      console.error('Error loading curriculum radar:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRadar();
  }, [activeInst, selectedClass, selectedTerm, selectedMilestone, pacingFilter, searchQuery]);

  const handleOpenChapters = async (subject: CurriculumSubjectRadarItem) => {
    setIsLoadingChapters(true);
    setIsChapterDrawerOpen(true);
    try {
      const res = await getSubjectChaptersAction(subject.id);
      if (res.success) {
        setSelectedSubjectDetail(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingChapters(false);
    }
  };

  const handleOpenLogModal = (chapter: any, subjectId?: string) => {
    setLogTargetChapter({ ...chapter, subjectId: subjectId || selectedSubjectDetail?.subject?.id });
    setLogPeriodsToAdd(1);
    setLogTopicTitle(`${chapter.chapterName} - Concept Mastery & Problem Sets`);
    setLogClasswork(`Completed textbook chapter exercises and collaborative discussion on ${chapter.chapterName}`);
    setLogHomework(`Workbook practice set Q1-Q8 on page 32`);
    setLogRealWorld(`Explored practical daily life applications of ${chapter.chapterName}`);
    setLogAssignmentTitle(`${chapter.chapterName} Practice Worksheet`);
    setLogAssignmentDueDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setLogImportantNotes('');
    setLogRemedialRequired(false);
    setLogRemedialPlan('');
    setIsLogModalOpen(true);
  };

  const handleSaveLessonDiary = async () => {
    if (!logTargetChapter) return;
    setIsLogging(true);
    try {
      const res = await saveTeacherLessonDiaryEntryAction({
        institutionCode: activeInst,
        lessonDate: new Date().toISOString().split('T')[0],
        className: selectedSubjectDetail?.subject?.className || 'Grade 1',
        sectionName: 'A',
        subjectId: logTargetChapter.subjectId,
        subjectName: selectedSubjectDetail?.subject?.name,
        chapterId: logTargetChapter.id,
        chapterName: logTargetChapter.chapterName,
        termName: logTargetChapter.termName,
        assessmentMilestone: logTargetChapter.assessmentMilestone,
        periodNumber: 1,
        teacherName: selectedSubjectDetail?.subject?.teacherName || 'Staff Facilitator',
        topicTitle: logTopicTitle,
        learningObjectives: logTargetChapter.learningObjectives,
        teachingPedagogy: logTeachingMethod,
        teachingAids: logTeachingAids,
        classworkSummary: logClasswork,
        homeworkAssigned: logHomework,
        realWorldApplication: logRealWorld,
        assignmentTitle: logAssignmentTitle,
        assignmentDueDate: logAssignmentDueDate,
        assignmentSubmissionType: 'Physical Notebook / Diary',
        attachmentName: logAssignmentTitle ? `${logAssignmentTitle.replace(/\s+/g, '_')}.pdf` : undefined,
        attachmentSize: logAssignmentTitle ? '1.2 MB' : undefined,
        importantNotes: logImportantNotes,
        remedialRequired: logRemedialRequired,
        remedialPlan: logRemedialPlan,
        assessmentMode: 'Classroom Worksheet',
        periodsDelivered: Number(logPeriodsToAdd)
      });

      if (res.success) {
        showToast(res.message || 'Lesson logged & Curriculum Radar synced!');
        setIsLogModalOpen(false);
        if (selectedSubjectDetail?.subject?.id) {
          const updated = await getSubjectChaptersAction(selectedSubjectDetail.subject.id);
          if (updated.success) setSelectedSubjectDetail(updated);
        }
        fetchRadar();
      } else {
        alert('Error logging lesson: ' + res.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsLogging(false);
    }
  };

  const handleSaveTermConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTerm(true);
    try {
      const res = await saveCurriculumTermAction({
        institutionCode: activeInst,
        ...newTermForm
      });
      if (res.success) {
        showToast(res.message || 'Academic Term successfully saved!');
        setIsTermModalOpen(false);
        fetchRadar();
      } else {
        alert('Error saving term: ' + res.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsSavingTerm(false);
    }
  };

  const handleToggleClassTermStatus = async (termCode: string, termName: string, currentEnabled: boolean) => {
    setIsTogglingTerm(true);
    try {
      const res = await toggleClassTermStatusAction({
        institutionCode: activeInst,
        session: '2026-2027',
        className: termManagerClass,
        termCode,
        termName,
        isEnabled: !currentEnabled,
        disabledReason: !currentEnabled ? 'Term activated' : `Turned OFF for ${termManagerClass}`
      });
      if (res.success) {
        showToast(res.message || 'Term status updated!');
        fetchRadar();
      } else {
        alert('Error updating term status: ' + res.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsTogglingTerm(false);
    }
  };

  const handleSaveChapterAllocation = async () => {
    if (!editingChapterAllocation) return;
    setIsSavingAlloc(true);
    try {
      const res = await updateChapterTermAllocationAction({
        chapterId: editingChapterAllocation.id,
        termName: allocTerm,
        assessmentMilestone: allocMilestone,
        targetMonth: allocTargetMonth
      });
      if (res.success) {
        showToast(res.message || 'Chapter Term Allocation updated!');
        setEditingChapterAllocation(null);
        if (selectedSubjectDetail?.subject?.id) {
          const updated = await getSubjectChaptersAction(selectedSubjectDetail.subject.id);
          if (updated.success) setSelectedSubjectDetail(updated);
        }
        fetchRadar();
      } else {
        alert('Error: ' + res.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsSavingAlloc(false);
    }
  };

  const handleSaveNewChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectDetail?.subject?.id || !newChapterForm.chapterName.trim()) {
      alert('Please enter a chapter name.');
      return;
    }

    setIsSavingNewChapter(true);
    try {
      const res = await createOrUpdateChapterAction({
        subjectId: selectedSubjectDetail.subject.id,
        ...newChapterForm
      });
      if (res.success) {
        showToast(res.message || 'New Chapter successfully added!');
        setIsNewChapterModalOpen(false);
        const updated = await getSubjectChaptersAction(selectedSubjectDetail.subject.id);
        if (updated.success) setSelectedSubjectDetail(updated);
        fetchRadar();
      } else {
        alert('Error adding chapter: ' + res.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsSavingNewChapter(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-20">
      
      {/* Option 6 Sattva-Digital Vastu Header Banner */}
      <VastuModuleBanner
        badgeText="Academic Session 2026–2027"
        badgeIcon={<BookOpen className="w-3.5 h-3.5 text-[#D97706]" />}
        institutionText={`Campus: ${activeInst} • Curriculum, Lesson Diary & Homework LMS`}
        title="Curriculum, Lesson Diary & Homework LMS"
        titleIcon={<BookOpen className="w-7 h-7 text-[#D97706]" />}
        description="Unified academic teaching cockpit uniting Curriculum Pacing Radar, Teacher Lesson Planning Diary, Homework LMS Assignments, and Digital Ink Notebook Annotation."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRadar}
              isLoading={isLoading}
              className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-[#FAF7F2] text-xs font-bold shadow-2xs"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-stone-500" />}
            >
              Sync Live DB
            </Button>
            {activeTab === 'RADAR' && (
              <Button
                variant="saffron"
                size="sm"
                onClick={() => setIsTermModalOpen(true)}
                className="bg-[#D97706] hover:bg-[#B45309] text-white font-black text-xs shadow-md"
                leftIcon={<Settings className="w-3.5 h-3.5" />}
              >
                Terms &amp; Milestones
              </Button>
            )}
          </>
        }
        tabs={[
          { id: 'RADAR', label: '1. Curriculum Pacing Radar', icon: <BookOpen className="w-4 h-4 text-purple-600" /> },
          { id: 'DIARY', label: '2. Teacher Lesson Diary', icon: <FileText className="w-4 h-4 text-emerald-600" /> },
          { id: 'HOMEWORK', label: '3. Homework & Assignments LMS', icon: <Send className="w-4 h-4 text-blue-600" /> },
          { id: 'GRADING', label: '4. Digital Ink Annotation Desk', icon: <Award className="w-4 h-4 text-amber-600" /> },
          { id: 'DIGITAL_RESOURCES', label: '5. LTI 1.3 & DIKSHA Hub', icon: <Atom className="w-4 h-4 text-[#D97706]" /> },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => handleTabChange(id as any)}
      />

      {activeTab === 'DIGITAL_RESOURCES' && (
        <div className="animate-in fade-in duration-200">
          <LtiResourcePicker />
        </div>
      )}

      {activeTab === 'DIARY' && (
        <div className="animate-in fade-in duration-200">
          <TeacherLessonDiaryDesk />
        </div>
      )}

      {activeTab === 'HOMEWORK' && (
        <div className="animate-in fade-in duration-200">
          <InteractiveHomeworkLMSDesk />
        </div>
      )}

      {activeTab === 'GRADING' && (
        <div className="animate-in fade-in duration-200 bg-white/95 rounded-3xl border border-[#E8DFC8] p-6 shadow-xs">
          <HomeworkAnnotationDesk />
        </div>
      )}

      {activeTab === 'RADAR' && (
        <div className="space-y-6 animate-in fade-in duration-200">

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* 🌟 1. MASTER OVERALL DELIVERY & ACADEMIC PACING HERO CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left: Overall School Pacing Meter */}
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-purple-200">
                Academic Delivery Health
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-500">
                {selectedTerm === 'ALL' ? 'Full Session 2026-2027' : selectedTerm}
              </span>
            </div>
            
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {metrics?.averageCompletionRate || 0}%
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-500">
                Overall Syllabus Delivered
              </span>
            </div>

            {/* Master Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    (metrics?.averageCompletionRate || 0) >= 70
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : (metrics?.averageCompletionRate || 0) >= 45
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-rose-500 to-red-500'
                  }`}
                  style={{ width: `${metrics?.averageCompletionRate || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 font-semibold">
                <span>🎯 {metrics?.completedChapters || 0} of {metrics?.totalChapters || 0} Units Completed</span>
                <span>⏱️ {metrics?.totalDeliveredPeriods || 0} Teaching Hours Logged</span>
              </div>
            </div>
          </div>

          {/* Right: Academic Term Selector & Pacing Status Quick Filter Chips */}
          <div className="flex flex-col gap-3 lg:items-end">
            
            {/* Term Selector Pills */}
            {(() => {
              const t1Status = terms.find(t => t.termName === 'Term 1');
              const isT1DisabledForClass = t1Status ? (t1Status.isClassEnabled === false || t1Status.isEnabled === false) : false;
              const t2Status = terms.find(t => t.termName === 'Term 2');
              const isT2DisabledForClass = t2Status ? (t2Status.isClassEnabled === false || t2Status.isEnabled === false) : false;

              return (
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 flex-wrap">
                  <button
                    type="button"
                    onClick={() => { setSelectedTerm('ALL'); setSelectedMilestone('ALL'); }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      selectedTerm === 'ALL'
                        ? 'bg-white text-purple-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Full Year
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedTerm('Term 1'); setSelectedMilestone('ALL'); }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      selectedTerm === 'Term 1'
                        ? 'bg-white text-purple-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Term 1 (FA 1-2, SA 1)
                    {isT1DisabledForClass && (
                      <span className="bg-rose-500 text-white text-[8.5px] font-black uppercase px-1 py-0.2 rounded">
                        Off
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedTerm('Term 2'); setSelectedMilestone('ALL'); }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      selectedTerm === 'Term 2'
                        ? 'bg-white text-purple-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5 text-emerald-500" /> Term 2 (FA 3-4, SA 2)
                    {isT2DisabledForClass && (
                      <span className="bg-rose-500 text-white text-[8.5px] font-black uppercase px-1 py-0.2 rounded">
                        Off
                      </span>
                    )}
                  </button>
                </div>
              );
            })()}

            {/* Pacing Health Chips (1-Click Filters) */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setPacingFilter(pacingFilter === 'ON_SCHEDULE' ? 'ALL' : 'ON_SCHEDULE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  pacingFilter === 'ON_SCHEDULE'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>On Track: <strong>{metrics?.onScheduleCount || 0}</strong></span>
              </button>

              <button
                type="button"
                onClick={() => setPacingFilter(pacingFilter === 'SLIGHTLY_BEHIND' ? 'ALL' : 'SLIGHTLY_BEHIND')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  pacingFilter === 'SLIGHTLY_BEHIND'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Slight Delay: <strong>{metrics?.slightlyBehindCount || 0}</strong></span>
              </button>

              <button
                type="button"
                onClick={() => setPacingFilter(pacingFilter === 'SIGNIFICANTLY_BEHIND' ? 'ALL' : 'SIGNIFICANTLY_BEHIND')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  pacingFilter === 'SIGNIFICANTLY_BEHIND'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Needs Action: <strong>{metrics?.significantlyBehindCount || 0}</strong></span>
              </button>

              {pacingFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setPacingFilter('ALL')}
                  className="text-xs text-slate-400 hover:text-slate-700 font-bold underline px-1"
                >
                  Clear Filter
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 🌟 2. FAST GRADE COHORT BAR & VIEW TOGGLE */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Grade Level Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Classes' },
            { id: 'PRE_PRIMARY', label: 'Pre-Primary (Pre-Nur - UKG)' },
            { id: 'PRIMARY', label: 'Primary (Grades 1-5)' },
            { id: 'MIDDLE', label: 'Middle (Grades 6-8)' },
            { id: 'SENIOR', label: 'Senior (Grades 9-12)' }
          ].map(grp => (
            <button
              key={grp.id}
              type="button"
              onClick={() => {
                setSelectedGradeGroup(grp.id);
                setSelectedClass('All');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedGradeGroup === grp.id && selectedClass === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {grp.label}
            </button>
          ))}
        </div>

        {/* Right: Individual Class Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Specific Class Dropdown */}
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedGradeGroup('ALL');
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
          >
            <option value="All">All Grades (Specific)</option>
            {dynamicClasses.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* View Mode Buttons */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Visual Cards View"
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Spreadsheet Table View"
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Table</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('at_risk')}
              title="Attention Spotlight"
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'at_risk' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Action List</span>
            </button>
          </div>

        </div>

      </div>

      {/* 🌟 3. SEARCH & SUBJECT ROSTER DISPLAY */}
      {(() => {
        const GRADE_MAP: Record<string, string[]> = {
          PRE_PRIMARY: ['Pre-Nursery', 'Nursery', 'LKG', 'UKG'],
          PRIMARY: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
          MIDDLE: ['Grade 6', 'Grade 7', 'Grade 8'],
          SENIOR: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
        };

        const displayedSubjects = subjects.filter(sub => {
          if (selectedGradeGroup !== 'ALL') {
            const allowed = GRADE_MAP[selectedGradeGroup] || [];
            if (!allowed.includes(sub.className)) return false;
          }
          if (viewMode === 'at_risk') {
            return sub.pacingStatus === 'SIGNIFICANTLY_BEHIND' || sub.pacingStatus === 'SLIGHTLY_BEHIND';
          }
          return true;
        });

        if (displayedSubjects.length === 0) {
          return (
            <EmptyState
              icon={<BookOpen className="w-8 h-8 text-slate-400" />}
              title="No Curriculum Subjects Found"
              description="No subjects match your selected filters. Try switching the cohort or clearing search."
              actionLabel="Reset Filters"
              onAction={() => {
                setSelectedClass('All');
                setSelectedGradeGroup('ALL');
                setSelectedTerm('ALL');
                setPacingFilter('ALL');
                setSearchQuery('');
                setViewMode('cards');
              }}
            />
          );
        }

        // VIEW MODE 1: VISUAL CARDS GRID (Modern & Highly Informative)
        if (viewMode === 'cards' || viewMode === 'at_risk') {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {viewMode === 'at_risk' ? '⚠️ Attention Required & Catchup Subjects' : 'Active Subject Curriculums'}
                  </h3>
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {displayedSubjects.length} Subjects
                  </span>
                </div>

                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search subject or teacher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedSubjects.map((sub) => {
                  const isBehind = sub.pacingStatus === 'SIGNIFICANTLY_BEHIND';
                  const isSlight = sub.pacingStatus === 'SLIGHTLY_BEHIND';

                  return (
                    <div
                      key={sub.id}
                      className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between ${
                        isBehind ? 'border-rose-300 ring-1 ring-rose-200' : isSlight ? 'border-amber-200' : 'border-slate-200/80'
                      }`}
                    >
                      {/* Card Top: Subject Name, Class & Teacher */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-xs"
                              style={{ backgroundColor: sub.colorCode || '#6366F1' }}
                            >
                              {sub.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm">{sub.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-bold text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                                  {sub.className}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[11px] text-slate-500 font-semibold">{sub.teacherName || 'Faculty'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Pacing Badge */}
                          {sub.pacingStatus === 'ON_SCHEDULE' && (
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg shrink-0">
                              🟢 On Track
                            </span>
                          )}
                          {sub.pacingStatus === 'SLIGHTLY_BEHIND' && (
                            <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg shrink-0">
                              🟡 Slight Delay
                            </span>
                          )}
                          {sub.pacingStatus === 'SIGNIFICANTLY_BEHIND' && (
                            <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-lg shrink-0">
                              🔴 Action Needed
                            </span>
                          )}
                        </div>

                        {/* Progress Bar & Key Numbers */}
                        <div className="space-y-1.5 p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700">Syllabus Completion</span>
                            <span className="font-black text-slate-900 font-mono text-sm">{sub.completionPercentage}%</span>
                          </div>
                          
                          <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                sub.completionPercentage >= 70
                                  ? 'bg-emerald-500'
                                  : sub.completionPercentage >= 45
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${sub.completionPercentage}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[10.5px] text-slate-500 font-semibold pt-0.5">
                            <span>{sub.completedChapters} / {sub.totalChapters} Units Completed</span>
                            <span className="font-mono">{sub.completedPeriods || 0} / {sub.totalPlannedPeriods || 36} Periods</span>
                          </div>
                        </div>

                        {/* Term Breakdown Pills */}
                        <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                          <div className="p-2 bg-purple-50/60 rounded-xl border border-purple-100">
                            <span className="text-purple-700 font-bold block">Term 1 (Half-Yearly)</span>
                            <strong className="text-slate-800 text-xs font-mono">
                              {sub.termBreakdown?.term1Completed || 0} / {sub.termBreakdown?.term1Total || 0} Units
                            </strong>
                          </div>

                          <div className="p-2 bg-indigo-50/60 rounded-xl border border-indigo-100">
                            <span className="text-indigo-700 font-bold block">Term 2 (Annual)</span>
                            <strong className="text-slate-800 text-xs font-mono">
                              {sub.termBreakdown?.term2Completed || 0} / {sub.termBreakdown?.term2Total || 0} Units
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenChapters(sub)}
                          className="flex-1 text-xs font-bold bg-white hover:bg-slate-50 text-slate-800"
                          leftIcon={<BookOpen className="w-3.5 h-3.5 text-purple-600" />}
                        >
                          View Chapters ({sub.totalChapters})
                        </Button>

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenChapters(sub)}
                          className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
                          leftIcon={<Plus className="w-3.5 h-3.5" />}
                        >
                          Log Class
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // VIEW MODE 2: DETAILED DATA TABLE (Spreadsheet Overview)
        return (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  Subject Curriculum Delivery Radar
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                    {selectedTerm === 'ALL' ? 'All Terms View' : selectedTerm}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Live delivery progress across {displayedSubjects.length} subjects with Term breakdown & Teacher Diary synchronization.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                {displayedSubjects.length} Subjects Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-5">Subject & Cohort</th>
                    <th className="py-3.5 px-5">Assigned Faculty</th>
                    <th className="py-3.5 px-5">Term 1 (FA 1–2, SA 1)</th>
                    <th className="py-3.5 px-5">Term 2 (FA 3–4, SA 2)</th>
                    <th className="py-3.5 px-5 w-44">Syllabus Completion</th>
                    <th className="py-3.5 px-5 text-center">Pacing Health</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {displayedSubjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-2xs"
                            style={{ backgroundColor: sub.colorCode || '#4F46E5' }}
                          >
                            {sub.name.charAt(0)}
                          </div>
                          <div>
                            <strong className="font-extrabold text-slate-900 block text-xs sm:text-sm">{sub.name}</strong>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] font-bold text-slate-500">{sub.code}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded-md">
                                {sub.className}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block text-xs">{sub.teacherName}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{sub.category}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                            <span>{sub.termBreakdown?.term1Completed || 0} / {sub.termBreakdown?.term1Total || 0} Units</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">FA-1, FA-2, SA-1</span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                            <span>{sub.termBreakdown?.term2Completed || 0} / {sub.termBreakdown?.term2Total || 0} Units</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">FA-3, FA-4, SA-2</span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-extrabold text-slate-900">{sub.completionPercentage}%</span>
                            <span className="text-slate-400 text-[10px]">{sub.completedChapters}/{sub.totalChapters} units</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                sub.completionPercentage >= 70
                                  ? 'bg-emerald-500'
                                  : sub.completionPercentage >= 45
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${sub.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-center">
                        {sub.pacingStatus === 'ON_SCHEDULE' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> On Schedule
                          </span>
                        )}
                        {sub.pacingStatus === 'SLIGHTLY_BEHIND' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Minor Delay
                          </span>
                        )}
                        {sub.pacingStatus === 'SIGNIFICANTLY_BEHIND' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 font-bold text-xs border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Action Required
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenChapters(sub)}
                          className="text-xs font-bold"
                          leftIcon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
                        >
                          Chapter Units
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* 🌟 DRAWER: UNIT-BY-UNIT CHAPTER BREAKDOWN WITH TERM ALLOCATION */}
      {isChapterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-purple-500/30">
                    {selectedSubjectDetail?.subject?.className}
                  </span>
                  <span className="text-slate-400 font-mono text-xs">{selectedSubjectDetail?.subject?.code}</span>
                </div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  {selectedSubjectDetail?.subject?.name}
                </h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Facilitator: {selectedSubjectDetail?.subject?.teacherName || 'Staff'} • {selectedSubjectDetail?.chapters?.length || 0} Syllabus Units
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    const nextNum = (selectedSubjectDetail?.chapters?.length || 0) + 1;
                    setNewChapterForm({
                      chapterNumber: nextNum,
                      chapterName: '',
                      estimatedPeriods: 8,
                      termName: nextNum <= 6 ? 'Term 1' : 'Term 2',
                      assessmentMilestone: nextNum <= 2 ? 'Formative Assessment 1 (FA-1 / Periodic Test 1)' : nextNum <= 4 ? 'Formative Assessment 2 (FA-2 / Periodic Test 2)' : 'Summative Assessment 1 (SA-1 / Half-Yearly Exam)',
                      targetMonth: nextNum <= 6 ? 'April - September' : 'October - March',
                      learningObjectives: 'Understand core competency concepts and complete problem sets.',
                      keyConcepts: 'Foundational definitions, formulas, and real-world examples.'
                    });
                    setIsNewChapterModalOpen(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  ➕ Add Unit
                </Button>
                <button
                  onClick={() => setIsChapterDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {isLoadingChapters ? (
                <div className="p-12 text-center text-slate-400">Loading syllabus chapters...</div>
              ) : selectedSubjectDetail?.chapters?.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium">No chapters configured for this subject.</div>
              ) : (
                <div className="space-y-3">
                  {selectedSubjectDetail?.chapters?.map((ch: any) => (
                    <div
                      key={ch.id}
                      className={`p-4 rounded-2xl border transition ${
                        ch.status === 'Completed'
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : ch.status === 'In Progress'
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black text-slate-600">
                              Unit {ch.chapterNumber}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                              {ch.termName}
                            </span>
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100">
                              {ch.assessmentMilestone}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              ch.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ch.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {ch.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                            {ch.chapterName}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingChapterAllocation(ch);
                              setAllocTerm(ch.termName || 'Term 1');
                              setAllocMilestone(ch.assessmentMilestone || 'FA-1 (Periodic Test 1)');
                              setAllocTargetMonth(ch.targetMonth || 'April - July');
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                            title="Edit Term & Milestone Allocation"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>

                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenLogModal(ch, selectedSubjectDetail?.subject?.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-2xs"
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                          >
                            Log in Diary
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/60 text-slate-600">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Periods Delivery</span>
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {ch.completedPeriods} / {ch.estimatedPeriods} Periods ({Math.min(100, Math.round((ch.completedPeriods / ch.estimatedPeriods) * 100))}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Timeline</span>
                          <span className="text-xs font-bold text-slate-700 block">
                            📅 {ch.targetMonth || 'Session Schedule'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsChapterDrawerOpen(false)}>
                Close Drawer
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 MODAL: CONFIGURE ACADEMIC TERMS & ASSESSMENT MILESTONES */}
      {isTermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Define Academic Terms & Assessment Milestones
                </h3>
                <p className="text-xs text-slate-300">
                  Configure Formative (FA 1–4) and Summative (SA 1–2) assessment terms and target deadlines.
                </p>
              </div>
              <button onClick={() => setIsTermModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* Class Cohort Selector for Term Exemption */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-purple-400 font-bold tracking-wider block">
                      ACADEMIC TERM LIFECYCLE & CLASS EXEMPTION
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      Target Class Cohort for Term Status
                    </h4>
                  </div>
                  <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-1 rounded-xl font-bold font-mono">
                    Session 2026-2027
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Select Class to Turn ON / Turn OFF Terms:
                  </label>
                  <select
                    value={termManagerClass}
                    onChange={e => {
                      const newClass = e.target.value;
                      setTermManagerClass(newClass);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white"
                  >
                    <option value="All">🌐 All Classes (Global Session Setting)</option>
                    {dynamicClasses.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* High-Level Terms Master Switch Cards */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Academic Terms Status for {termManagerClass === 'All' ? 'All Classes' : termManagerClass}
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Term 1 Card */}
                  {(() => {
                    const t1Term = terms.find(t => t.termName === 'Term 1');
                    const isT1Active = t1Term ? (t1Term.isClassEnabled !== false && t1Term.isEnabled !== false) : true;
                    return (
                      <div className={`p-4 rounded-2xl border transition ${
                        isT1Active ? 'bg-purple-50/70 border-purple-200' : 'bg-slate-100 border-slate-300 opacity-80'
                      }`}>
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-extrabold text-slate-900">Term 1</strong>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                            isT1Active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isT1Active ? '🟢 Active' : '🔴 Turned OFF'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium mt-1">
                          April to September • FA-1, FA-2 & SA-1
                        </p>
                        <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {termManagerClass === 'All' ? 'Global Status' : `${termManagerClass} Scope`}
                          </span>
                          <button
                            type="button"
                            disabled={isTogglingTerm}
                            onClick={() => handleToggleClassTermStatus('Term 1', 'Term 1', isT1Active)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                              isT1Active
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            {isT1Active ? '🚫 Turn OFF Term 1' : '✅ Activate Term 1'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Term 2 Card */}
                  {(() => {
                    const t2Term = terms.find(t => t.termName === 'Term 2');
                    const isT2Active = t2Term ? (t2Term.isClassEnabled !== false && t2Term.isEnabled !== false) : true;
                    return (
                      <div className={`p-4 rounded-2xl border transition ${
                        isT2Active ? 'bg-indigo-50/70 border-indigo-200' : 'bg-slate-100 border-slate-300 opacity-80'
                      }`}>
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-extrabold text-slate-900">Term 2</strong>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                            isT2Active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isT2Active ? '🟢 Active' : '🔴 Turned OFF'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium mt-1">
                          October to March • FA-3, FA-4 & SA-2
                        </p>
                        <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {termManagerClass === 'All' ? 'Global Status' : `${termManagerClass} Scope`}
                          </span>
                          <button
                            type="button"
                            disabled={isTogglingTerm}
                            onClick={() => handleToggleClassTermStatus('Term 2', 'Term 2', isT2Active)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                              isT2Active
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            {isT2Active ? '🚫 Turn OFF Term 2' : '✅ Activate Term 2'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Fine-Grained Assessment Milestones Status */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Assessment Milestones ({terms.length})
                </label>
                <div className="space-y-2">
                  {terms.map(t => {
                    const isMilestoneActive = t.isClassEnabled !== false && t.isEnabled !== false;
                    return (
                      <div key={t.id} className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                        isMilestoneActive ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/50 border-rose-200'
                      }`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{t.termName}</span>
                            <span className="text-slate-300">•</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                              t.assessmentType === 'FORMATIVE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {t.assessmentType}
                            </span>
                            {!isMilestoneActive && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                                Turned OFF
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-700 font-semibold block mt-0.5">{t.milestoneLabel}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Target: {t.targetCompletionDate || 'N/A'} • Weightage: {t.weightagePercentage}%
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isTogglingTerm}
                          onClick={() => handleToggleClassTermStatus(t.termCode, t.milestoneLabel, isMilestoneActive)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isMilestoneActive
                              ? 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs'
                          }`}
                        >
                          {isMilestoneActive ? 'Turn OFF' : 'Turn ON'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add / Edit Custom Milestone Form */}
              <form onSubmit={handleSaveTermConfig} className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-3">
                <strong className="text-xs font-bold text-purple-950 block">Add Custom Assessment Milestone</strong>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Academic Term</label>
                    <select
                      value={newTermForm.termName}
                      onChange={e => setNewTermForm({ ...newTermForm, termName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3 (Trimester)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Assessment Type</label>
                    <select
                      value={newTermForm.assessmentType}
                      onChange={e => setNewTermForm({ ...newTermForm, assessmentType: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="FORMATIVE">Formative Assessment (FA / Periodic Test)</option>
                      <option value="SUMMATIVE">Summative Assessment (SA / Term Exam)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Milestone Label</label>
                  <input
                    type="text"
                    value={newTermForm.milestoneLabel}
                    onChange={e => setNewTermForm({ ...newTermForm, milestoneLabel: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    placeholder="e.g. Formative Assessment 1 (FA-1)"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Target Completion Date</label>
                    <input
                      type="date"
                      value={newTermForm.targetCompletionDate}
                      onChange={e => setNewTermForm({ ...newTermForm, targetCompletionDate: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Weightage %</label>
                    <input
                      type="number"
                      value={newTermForm.weightagePercentage}
                      onChange={e => setNewTermForm({ ...newTermForm, weightagePercentage: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSavingTerm}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
                  >
                    Save Milestone
                  </Button>
                </div>
              </form>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsTermModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 MODAL: CHAPTER TERM ALLOCATION */}
      {editingChapterAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">Map Chapter to Assessment Term</h3>
                <p className="text-xs text-slate-300 font-mono">{editingChapterAllocation.chapterName}</p>
              </div>
              <button onClick={() => setEditingChapterAllocation(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Academic Term</label>
                <select
                  value={allocTerm}
                  onChange={e => setAllocTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Assessment Milestone</label>
                <select
                  value={allocMilestone}
                  onChange={e => setAllocMilestone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold"
                >
                  <option value="Formative Assessment 1 (FA-1 / Periodic Test 1)">Formative Assessment 1 (FA-1)</option>
                  <option value="Formative Assessment 2 (FA-2 / Periodic Test 2)">Formative Assessment 2 (FA-2)</option>
                  <option value="Summative Assessment 1 (SA-1 / Half-Yearly Exam)">Summative Assessment 1 (SA-1)</option>
                  <option value="Formative Assessment 3 (FA-3 / Periodic Test 3)">Formative Assessment 3 (FA-3)</option>
                  <option value="Formative Assessment 4 (FA-4 / Periodic Test 4)">Formative Assessment 4 (FA-4)</option>
                  <option value="Summative Assessment 2 (SA-2 / Annual Final Exam)">Summative Assessment 2 (SA-2)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Delivery Window / Month</label>
                <input
                  type="text"
                  value={allocTargetMonth}
                  onChange={e => setAllocTargetMonth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold"
                  placeholder="e.g. April - July, August, October"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setEditingChapterAllocation(null)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveChapterAllocation}
                isLoading={isSavingAlloc}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Save Allocation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 MODAL: LOG IN TEACHER LESSON DIARY (SYNCED TO RADAR) */}
      {isLogModalOpen && logTargetChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-purple-500/30">
                  Teacher Lesson Diary & Radar Sync
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Log Delivery: Unit {logTargetChapter.chapterNumber}
                </h3>
                <p className="text-xs text-slate-300 font-mono">
                  {logTargetChapter.chapterName} • {logTargetChapter.termName}
                </p>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Completed Instructional Periods to Add
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setLogPeriodsToAdd(n)}
                      className={`py-2 rounded-xl border text-center font-bold text-xs transition ${
                        logPeriodsToAdd === n
                          ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-2xs font-extrabold'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      +{n} {n === 1 ? 'Period' : 'Periods'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Topic / Sub-Topic Taught
                </label>
                <input
                  type="text"
                  value={logTopicTitle}
                  onChange={e => setLogTopicTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                  placeholder="e.g. Chapter Exercise 4.2 & Concept Questions"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Teaching Pedagogy (NEP 2020)
                </label>
                <select
                  value={logTeachingMethod}
                  onChange={e => setLogTeachingMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="Smartboard & Concept Discussion">Smartboard & Concept Discussion</option>
                  <option value="Hands-on Experiment & Lab Activity">Hands-on Experiment & Lab Activity</option>
                  <option value="Collaborative Group Activity & Problem Solving">Collaborative Group Activity & Problem Solving</option>
                  <option value="Experiential Learning & Real-world Demonstration">Experiential Learning & Real-world Demonstration</option>
                  <option value="Remedial / Revision Drill">Remedial / Revision Drill</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Classwork Summary
                </label>
                <textarea
                  value={logClasswork}
                  onChange={e => setLogClasswork(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Homework / Practice Assignment
                  </label>
                  <input
                    type="text"
                    value={logHomework}
                    onChange={e => setLogHomework(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Assigned Worksheet Title
                  </label>
                  <input
                    type="text"
                    value={logAssignmentTitle}
                    onChange={e => setLogAssignmentTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                    placeholder="e.g. Unit Worksheet (1.2 MB)"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  📌 Important Notes & Special Observations
                </label>
                <textarea
                  value={logImportantNotes}
                  onChange={e => setLogImportantNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900"
                  placeholder="e.g. Concept grasped by 85% of students. Scheduled quick recap."
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Remedial Action Required for Slow Learners?
                  </span>
                  <input
                    type="checkbox"
                    checked={logRemedialRequired}
                    onChange={e => setLogRemedialRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                </div>
                {logRemedialRequired && (
                  <input
                    type="text"
                    value={logRemedialPlan}
                    onChange={e => setLogRemedialPlan(e.target.value)}
                    placeholder="e.g. Extra 15 mins zero-period practice on formula application"
                    className="w-full bg-white border border-rose-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                  />
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsLogModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveLessonDiary}
                isLoading={isLogging}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Log Entry & Sync Radar
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 MODAL: ADD NEW CHAPTER / CURRICULUM UNIT */}
      {isNewChapterModalOpen && selectedSubjectDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-indigo-500/30">
                  Curriculum Unit Authoring
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Add Unit: {selectedSubjectDetail.subject?.name}
                </h3>
                <p className="text-xs text-slate-300 font-mono">
                  {selectedSubjectDetail.subject?.className} • {selectedSubjectDetail.subject?.code}
                </p>
              </div>
              <button onClick={() => setIsNewChapterModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveNewChapter} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unit / Chapter #</label>
                  <input
                    type="number"
                    value={newChapterForm.chapterNumber}
                    onChange={e => setNewChapterForm({ ...newChapterForm, chapterNumber: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unit / Chapter Title</label>
                  <input
                    type="text"
                    value={newChapterForm.chapterName}
                    onChange={e => setNewChapterForm({ ...newChapterForm, chapterName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                    placeholder="e.g. Fractions & Decimal Operations"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Academic Term</label>
                  <select
                    value={newChapterForm.termName}
                    onChange={e => setNewChapterForm({ ...newChapterForm, termName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold"
                  >
                    <option value="Term 1">Term 1 (April - September)</option>
                    <option value="Term 2">Term 2 (October - March)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assessment Milestone</label>
                  <select
                    value={newChapterForm.assessmentMilestone}
                    onChange={e => setNewChapterForm({ ...newChapterForm, assessmentMilestone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold"
                  >
                    <option value="Formative Assessment 1 (FA-1 / Periodic Test 1)">FA-1 (Periodic Test 1)</option>
                    <option value="Formative Assessment 2 (FA-2 / Periodic Test 2)">FA-2 (Periodic Test 2)</option>
                    <option value="Summative Assessment 1 (SA-1 / Half-Yearly Exam)">SA-1 (Half-Yearly Exam)</option>
                    <option value="Formative Assessment 3 (FA-3 / Periodic Test 3)">FA-3 (Periodic Test 3)</option>
                    <option value="Formative Assessment 4 (FA-4 / Periodic Test 4)">FA-4 (Periodic Test 4)</option>
                    <option value="Summative Assessment 2 (SA-2 / Annual Final Exam)">SA-2 (Annual Final Exam)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Periods</label>
                  <input
                    type="number"
                    value={newChapterForm.estimatedPeriods}
                    onChange={e => setNewChapterForm({ ...newChapterForm, estimatedPeriods: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Delivery Window</label>
                  <input
                    type="text"
                    value={newChapterForm.targetMonth}
                    onChange={e => setNewChapterForm({ ...newChapterForm, targetMonth: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold"
                    placeholder="e.g. April - July"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Learning Objectives (Target Competencies)</label>
                <textarea
                  value={newChapterForm.learningObjectives}
                  onChange={e => setNewChapterForm({ ...newChapterForm, learningObjectives: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsNewChapterModalOpen(false)}>Cancel</Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSavingNewChapter}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Save Unit to Curriculum
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Close RADAR tab wrapper */}
      </div>
      )}

    </div>
  );
}

export default function CurriculumRadarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500 font-bold">Loading Curriculum &amp; LMS Hub...</div>}>
      <CurriculumRadarContent />
    </Suspense>
  );
}
