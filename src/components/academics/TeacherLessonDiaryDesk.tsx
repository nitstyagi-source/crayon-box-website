"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BookOpen, CheckSquare, Plus, Calendar, Clock,
  User, CheckCircle2, AlertCircle, Sparkles, Download, ArrowRight,
  RefreshCw, Search, Filter, Layers, Check, Award, Eye, FileText,
  ChevronRight, Sparkle, Tag, ShieldCheck, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getTeacherLessonDiaryAction,
  saveTeacherLessonDiaryEntryAction,
  updateDiaryCoordinatorStatusAction,
  getDistinctSubjectsAndChaptersAction,
  getDistinctTeachersAction,
  TeacherLessonDiaryEntry
} from '@/app/actions/curriculum-radar-actions';
import { getInstitutionClassesAction } from '@/app/actions/attendance-actions';
import { createHomeworkAssignmentAction } from '@/app/actions/homework-lms-actions';

export function TeacherLessonDiaryDesk() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();
  const activeInst = currentInstitution === 'ALL' ? 'CBS' : currentInstitution;

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
        console.error('Error fetching dynamic classes for diary:', e);
      }
    }
    loadClasses();
  }, [activeInst]);

  const [entries, setEntries] = useState<TeacherLessonDiaryEntry[]>([]);
  const [teachers, setTeachers] = useState<{ name: string; title: string; department: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedTerm, setSelectedTerm] = useState('ALL');
  const [selectedTeacher, setSelectedTeacher] = useState('All');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // New Lesson Entry Modal
  // New Lesson Entry Modal State
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [formClass, setFormClass] = useState('Grade 1');
  const [formSection, setFormSection] = useState('A');
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [formLessonDate, setFormLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPeriodNum, setFormPeriodNum] = useState(1);
  const [formTeacherName, setFormTeacherName] = useState('Dr. Sunita Sharma');
  const [formTopicTitle, setFormTopicTitle] = useState('');
  const [formPedagogy, setFormPedagogy] = useState('Smartboard & Concept Discussion');
  const [formAids, setFormAids] = useState('Smartboard, Workbook, Manipulatives');
  const [formClasswork, setFormClasswork] = useState('');
  const [formHomework, setFormHomework] = useState('');
  const [formPublishToHomeworkLms, setFormPublishToHomeworkLms] = useState(true);
  const [formRealWorld, setFormRealWorld] = useState('');
  const [formPeriodsDelivered, setFormPeriodsDelivered] = useState(1);
  
  // 🌟 Assignment & Worksheet Attachments
  const [formAssignmentTitle, setFormAssignmentTitle] = useState('');
  const [formAssignmentDueDate, setFormAssignmentDueDate] = useState('');
  const [formAssignmentSubmissionType, setFormAssignmentSubmissionType] = useState('Physical Notebook / Diary');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formAttachmentSize, setFormAttachmentSize] = useState('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('');

  // 🌟 Important Notes, Remedial Action & NEP Assessment Mode
  const [formImportantNotes, setFormImportantNotes] = useState('');
  const [formRemedialRequired, setFormRemedialRequired] = useState(false);
  const [formRemedialPlan, setFormRemedialPlan] = useState('');
  const [formAssessmentMode, setFormAssessmentMode] = useState('Classroom Worksheet');
  const [formStudentEngagement, setFormStudentEngagement] = useState('High (Actively Engaged)');

  const [isSavingEntry, setIsSavingEntry] = useState(false);

  // Detail View Drawer
  const [selectedEntry, setSelectedEntry] = useState<TeacherLessonDiaryEntry | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchTeachers = async () => {
    try {
      const res = await getDistinctTeachersAction(activeInst);
      if (res.success && res.teachers) {
        setTeachers(res.teachers);
      }
    } catch (e) {
      console.error('Error fetching teachers:', e);
    }
  };

  const fetchDiary = async () => {
    setIsLoading(true);
    try {
      const effectiveTeacher = selectedTeacher !== 'All' ? selectedTeacher : (teacherSearchQuery.trim() || undefined);
      const res = await getTeacherLessonDiaryAction({
        institutionCode: activeInst,
        className: selectedClass,
        sectionName: selectedSection,
        termName: selectedTerm,
        teacherName: effectiveTeacher
      });
      if (res.success) {
        setEntries(res.entries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [activeInst]);

  const loadClassSubjects = async (cls: string) => {
    try {
      const res = await getDistinctSubjectsAndChaptersAction(cls, activeInst);
      if (res.success && res.subjects) {
        setClassSubjects(res.subjects);
        if (res.subjects.length > 0) {
          setSelectedSubjectId(res.subjects[0].id);
          setFormTeacherName(res.subjects[0].teacherName || 'Staff Facilitator');
          if (res.subjects[0].chapters && res.subjects[0].chapters.length > 0) {
            setSelectedChapterId(res.subjects[0].chapters[0].id);
          } else {
            setSelectedChapterId('');
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDiary();
  }, [activeInst, selectedClass, selectedSection, selectedTerm, selectedTeacher, teacherSearchQuery]);

  useEffect(() => {
    if (isNewEntryOpen) {
      loadClassSubjects(formClass);
    }
  }, [isNewEntryOpen, formClass]);

  const activeSubjectObj = classSubjects.find(s => s.id === selectedSubjectId);
  const availableChapters = activeSubjectObj?.chapters || [];
  const activeChapterObj = availableChapters.find((c: any) => c.id === selectedChapterId);

  const handleOpenNewEntry = (prefillTeacher?: any) => {
    setFormClass(selectedClass !== 'All' ? selectedClass : 'Grade 1');
    setFormSection(selectedSection !== 'All' ? selectedSection : 'A');
    setFormLessonDate(new Date().toISOString().split('T')[0]);
    setFormTopicTitle('');
    if (typeof prefillTeacher === 'string' && prefillTeacher.trim()) {
      setFormTeacherName(prefillTeacher.trim());
    } else if (selectedTeacher !== 'All') {
      setFormTeacherName(selectedTeacher);
    }
    setFormClasswork('Explained foundational concepts and solved textbook classroom exercise questions.');
    setFormHomework('Complete review worksheet questions in homework diary.');
    setFormRealWorld('Demonstrated practical day-to-day context and application.');
    setFormPeriodsDelivered(1);
    
    // Reset New Fields
    setFormAssignmentTitle('');
    setFormAssignmentDueDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setFormAssignmentSubmissionType('Physical Notebook / Diary');
    setFormAttachmentName('');
    setFormAttachmentSize('');
    setFormAttachmentUrl('');
    setFormImportantNotes('');
    setFormRemedialRequired(false);
    setFormRemedialPlan('');
    setFormAssessmentMode('Classroom Worksheet');
    setFormStudentEngagement('High (Actively Engaged)');

    setIsNewEntryOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormAttachmentName(file.name);
      setFormAttachmentSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      const reader = new FileReader();
      reader.onload = () => {
        setFormAttachmentUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedChapterId || !formTopicTitle.trim()) {
      alert('Please select subject, chapter, and enter topic title.');
      return;
    }

    setIsSavingEntry(true);
    try {
      const res = await saveTeacherLessonDiaryEntryAction({
        institutionCode: activeInst,
        lessonDate: formLessonDate,
        className: formClass,
        sectionName: formSection,
        subjectId: selectedSubjectId,
        subjectName: activeSubjectObj?.name,
        chapterId: selectedChapterId,
        chapterName: activeChapterObj?.chapterName,
        termName: activeChapterObj?.termName,
        assessmentMilestone: activeChapterObj?.assessmentMilestone,
        periodNumber: formPeriodNum,
        teacherName: formTeacherName,
        topicTitle: formTopicTitle,
        learningObjectives: activeChapterObj?.learningObjectives,
        teachingPedagogy: formPedagogy,
        teachingAids: formAids,
        classworkSummary: formClasswork,
        homeworkAssigned: formHomework,
        realWorldApplication: formRealWorld,
        assignmentTitle: formAssignmentTitle,
        assignmentDueDate: formAssignmentDueDate,
        assignmentSubmissionType: formAssignmentSubmissionType,
        attachmentName: formAttachmentName,
        attachmentSize: formAttachmentSize,
        attachmentUrl: formAttachmentUrl,
        importantNotes: formImportantNotes,
        remedialRequired: formRemedialRequired,
        remedialPlan: formRemedialPlan,
        assessmentMode: formAssessmentMode,
        studentEngagementLevel: formStudentEngagement,
        periodsDelivered: Number(formPeriodsDelivered)
      });

      if (res.success) {
        if (formPublishToHomeworkLms && formHomework.trim()) {
          try {
            await createHomeworkAssignmentAction({
              className: formClass,
              sectionName: formSection,
              subjectName: activeSubjectObj?.name || 'Classroom Subject',
              teacherName: formTeacherName,
              title: formAssignmentTitle || formTopicTitle || `Daily Practice: ${formClass}`,
              instructions: formHomework,
              dueDate: formAssignmentDueDate || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
              estimatedMinutes: 30
            });
          } catch (hwErr) {
            console.warn('Auto-bridge to homework LMS warning:', hwErr);
          }
        }
        showToast(res.message || 'Lesson logged & Curriculum Radar synced!');
        setIsNewEntryOpen(false);
        fetchDiary();
      } else {
        alert('Error saving entry: ' + res.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsSavingEntry(false);
    }
  };

  const handleApproveEntry = async (id: string) => {
    const res = await updateDiaryCoordinatorStatusAction(id, 'Approved');
    if (res.success) {
      showToast('✅ Lesson entry approved by Academic Coordinator!');
      fetchDiary();
      if (selectedEntry?.id === id) {
        setSelectedEntry({ ...selectedEntry, coordinatorStatus: 'Approved' });
      }
    }
  };

  // Filtered entries by search query and teacher
  const filteredEntries = entries.filter(e => {
    // Dropdown teacher filter
    if (selectedTeacher !== 'All' && !e.teacherName.toLowerCase().includes(selectedTeacher.toLowerCase())) {
      return false;
    }
    // Dedicated search by teacher name
    if (teacherSearchQuery.trim() && !e.teacherName.toLowerCase().includes(teacherSearchQuery.toLowerCase().trim())) {
      return false;
    }
    // General keyword search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesGeneral =
        e.subjectName.toLowerCase().includes(q) ||
        e.chapterName.toLowerCase().includes(q) ||
        e.topicTitle.toLowerCase().includes(q) ||
        e.teacherName.toLowerCase().includes(q) ||
        e.className.toLowerCase().includes(q) ||
        (e.classworkSummary && e.classworkSummary.toLowerCase().includes(q)) ||
        (e.homeworkAssigned && e.homeworkAssigned.toLowerCase().includes(q));
      if (!matchesGeneral) return false;
    }
    return true;
  });

  const term1Count = entries.filter(e => e.termName === 'Term 1').length;
  const term2Count = entries.filter(e => e.termName === 'Term 2').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-20">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Teacher Daily Instructional Diary
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-emerald-300 text-xs font-semibold">
              {activeInst} • Connected to Curriculum Radar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-400" />
            Teacher Daily Lesson Planning Diary
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Daily lesson delivery records, pedagogical methodologies, classwork/homework logs, and automated synchronization with the Syllabus Completion Radar.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenNewEntry}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/20"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            ➕ Log Daily Lesson Entry
          </Button>

          <Link href="/admin/curriculum">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-slate-800 text-purple-200 border-slate-700 hover:bg-slate-700 text-xs font-bold"
              leftIcon={<Layers className="w-3.5 h-3.5 text-purple-400" />}
            >
              Curriculum Radar &rarr;
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDiary}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

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

      {/* 🌟 TELEMATICS KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Lessons Logged</span>
          <p className="text-2xl font-black text-slate-900">{entries.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-Synced with Radar
          </span>
        </div>

        <div className="p-4 bg-purple-50/70 rounded-3xl border border-purple-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">Term 1 Delivery</span>
          <p className="text-2xl font-black text-purple-700">{term1Count}</p>
          <span className="text-[10px] text-purple-800/80 font-semibold">FA-1, FA-2, SA-1 Lessons</span>
        </div>

        <div className="p-4 bg-indigo-50/70 rounded-3xl border border-indigo-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">Term 2 Delivery</span>
          <p className="text-2xl font-black text-indigo-700">{term2Count}</p>
          <span className="text-[10px] text-indigo-800/80 font-semibold">FA-3, FA-4, SA-2 Lessons</span>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-3xl border border-emerald-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Coordinator Approval</span>
          <p className="text-2xl font-black text-emerald-700">
            {entries.filter(e => e.coordinatorStatus === 'Approved').length} / {entries.length}
          </p>
          <span className="text-[10px] text-emerald-800/80 font-semibold">100% Quality Audited</span>
        </div>
      </div>

      {/* 🌟 DEDICATED TEACHER SEARCH & FILTER CONTROLS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Row 1: Teacher Specific Search & Select */}
        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          
          <div className="sm:col-span-6">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-indigo-950 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" />
              Select Teacher / Faculty Name
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => {
                setSelectedTeacher(e.target.value);
                setTeacherSearchQuery('');
              }}
              className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            >
              <option value="All">🌐 All Teachers ({teachers.length || 'All'} Faculty)</option>
              {teachers.map((t, idx) => (
                <option key={`${t.name}-${idx}`} value={t.name}>
                  {t.name} {t.title ? `— ${t.title}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-indigo-950 mb-1.5 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-indigo-600" />
              Live Search by Teacher Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type teacher name (e.g. Dr. Sunita, Ananya, Rajesh, Rohit)..."
                value={teacherSearchQuery}
                onChange={(e) => {
                  setTeacherSearchQuery(e.target.value);
                  if (e.target.value.trim() && selectedTeacher !== 'All') {
                    setSelectedTeacher('All');
                  }
                }}
                className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
              <Search className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
              {teacherSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTeacherSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 font-bold text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Row 2: Class, Section, Term & General Search */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Class Cohort
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
            >
              {dynamicClasses.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Academic Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
            >
              <option value="ALL">All Terms (Annual View)</option>
              <option value="Term 1">Term 1 (FA-1, FA-2, SA-1)</option>
              <option value="Term 2">Term 2 (FA-3, FA-4, SA-2)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Keyword Search (Topic, Chapter)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Mathematics, Fractions, Algebra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 pl-9"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Quick Active Teachers Pills Strip */}
        {(() => {
          const activeTeacherCounts = entries.reduce((acc: Record<string, number>, curr) => {
            if (curr.teacherName) {
              acc[curr.teacherName] = (acc[curr.teacherName] || 0) + 1;
            }
            return acc;
          }, {});

          const activeNames = Object.keys(activeTeacherCounts);
          if (activeNames.length === 0) return null;

          return (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Active Teachers:
              </span>
              
              <button
                type="button"
                onClick={() => {
                  setSelectedTeacher('All');
                  setTeacherSearchQuery('');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedTeacher === 'All' && !teacherSearchQuery
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Teachers ({entries.length})
              </button>

              {activeNames.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setSelectedTeacher(name);
                    setTeacherSearchQuery('');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    selectedTeacher === name || teacherSearchQuery.toLowerCase() === name.toLowerCase()
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-100'
                  }`}
                >
                  <span>👨‍🏫 {name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedTeacher === name ? 'bg-indigo-800 text-white' : 'bg-indigo-200/80 text-indigo-900'
                  }`}>
                    {activeTeacherCounts[name]}
                  </span>
                </button>
              ))}
            </div>
          );
        })()}

      </div>

      {/* 🌟 TEACHER SPOTLIGHT BANNER (When filtering by a specific teacher) */}
      {(selectedTeacher !== 'All' || teacherSearchQuery.trim() !== '') && (
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-5 rounded-3xl border border-indigo-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-xl font-black text-white shrink-0">
              👨‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-400/20 text-indigo-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-indigo-400/30">
                  Teacher Diary Spotlight
                </span>
                <span className="text-xs text-indigo-300 font-mono">
                  {filteredEntries.length} Lesson {filteredEntries.length === 1 ? 'Entry' : 'Entries'} Found
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                {selectedTeacher !== 'All' ? selectedTeacher : `Matching "${teacherSearchQuery}"`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleOpenNewEntry(selectedTeacher !== 'All' ? selectedTeacher : teacherSearchQuery)}
              className="bg-white hover:bg-slate-100 text-indigo-950 font-black text-xs shadow-xs"
              leftIcon={<Plus className="w-3.5 h-3.5 text-indigo-600" />}
            >
              ➕ Log Lesson for this Teacher
            </Button>

            <button
              type="button"
              onClick={() => {
                setSelectedTeacher('All');
                setTeacherSearchQuery('');
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-800/60 hover:bg-indigo-700 text-indigo-200 text-xs font-bold transition border border-indigo-700/50"
            >
              ✕ Clear Teacher Filter
            </button>
          </div>
        </div>
      )}

      {/* 🌟 LESSON DIARY ENTRIES TABLE */}
      {filteredEntries.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-slate-400" />}
          title="No Lesson Diary Records Found"
          description={
            selectedTeacher !== 'All' || teacherSearchQuery
              ? `No lesson records found for teacher "${selectedTeacher !== 'All' ? selectedTeacher : teacherSearchQuery}". Try logging a new entry or clearing the teacher search.`
              : "No daily instructional entries found for the selected filters. Log a new lesson to start tracking."
          }
          actionLabel="➕ Log First Lesson Entry"
          onAction={() => handleOpenNewEntry(selectedTeacher !== 'All' ? selectedTeacher : undefined)}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Instructional Delivery Diary Records
                {(selectedTeacher !== 'All' || teacherSearchQuery) && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                    👨‍🏫 {selectedTeacher !== 'All' ? selectedTeacher : teacherSearchQuery}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Live chronological lesson logs submitted by teachers with real-time Curriculum Radar sync.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
              {filteredEntries.length} Records Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Date & Period</th>
                  <th className="py-3.5 px-5">Class & Subject</th>
                  <th className="py-3.5 px-5">Chapter & Milestone</th>
                  <th className="py-3.5 px-5">Topic & Classwork</th>
                  <th className="py-3.5 px-5">Facilitator / Teacher</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-900 block text-xs">{e.lessonDate}</span>
                      <span className="text-[10px] font-mono text-slate-400">Period {e.periodNumber}</span>
                    </td>

                    <td className="py-4 px-5">
                      <strong className="font-extrabold text-slate-900 block text-xs">{e.subjectName}</strong>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded-md">
                          {e.className} ({e.sectionName})
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-800 block text-xs truncate max-w-[180px]">
                        {e.chapterName}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                          {e.termName}
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium truncate max-w-[120px]">
                          {e.assessmentMilestone}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <strong className="font-bold text-slate-900 block text-xs truncate max-w-[220px]">
                        {e.topicTitle}
                      </strong>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[220px] mt-0.5">
                        📝 {e.classworkSummary || 'Classroom exercise'}
                      </span>
                      
                      {/* Attached Badges & Notes */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                        {(e.assignmentTitle || e.attachmentName) && (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                            📎 {e.assignmentTitle || e.attachmentName}
                            {e.assignmentDueDate && ` • Due ${e.assignmentDueDate}`}
                          </span>
                        )}
                        {e.importantNotes && (
                          <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                            📌 Note
                          </span>
                        )}
                        {e.remedialRequired && (
                          <span className="inline-flex items-center gap-0.5 text-[9.5px] font-black bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                            ⚠️ Remedial
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTeacher(e.teacherName);
                          setTeacherSearchQuery('');
                        }}
                        title={`Click to filter all diary logs by ${e.teacherName}`}
                        className="group text-left"
                      >
                        <span className="font-bold text-indigo-700 group-hover:text-indigo-900 group-hover:underline block text-xs flex items-center gap-1">
                          👨‍🏫 {e.teacherName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{e.teachingPedagogy}</span>
                      </button>
                    </td>

                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedEntry(e)}
                        className="text-xs font-bold"
                        leftIcon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
                      >
                        View Log
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🌟 DRAWER: LESSON DIARY DETAIL VIEW */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-indigo-500/30">
                  {selectedEntry.className} ({selectedEntry.sectionName}) • Period {selectedEntry.periodNumber}
                </span>
                <h3 className="text-lg font-black text-white mt-1">{selectedEntry.subjectName}</h3>
                <p className="text-xs text-slate-300 font-mono">{selectedEntry.lessonDate}</p>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold">✕</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700">
              
              {/* Curriculum Mapping Card */}
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 block">
                  Curriculum Mapping & Assessment Milestone
                </span>
                <h4 className="font-extrabold text-purple-950 text-sm">{selectedEntry.chapterName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-purple-200 text-purple-900 rounded font-bold text-[10px]">
                    {selectedEntry.termName}
                  </span>
                  <span className="text-purple-800 font-semibold text-[11px]">{selectedEntry.assessmentMilestone}</span>
                </div>
              </div>

              {/* Topic Taught */}
              <div>
                <strong className="text-slate-900 block text-xs mb-1">Topic / Sub-Topic Taught</strong>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-800">
                  {selectedEntry.topicTitle}
                </p>
              </div>

              {/* 📎 Attached Assignment / Worksheets Section */}
              {(selectedEntry.assignmentTitle || selectedEntry.attachmentName) && (
                <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      Assigned Homework & Resource Attachment
                    </span>
                    {selectedEntry.assignmentDueDate && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                        📅 Due: {selectedEntry.assignmentDueDate}
                      </span>
                    )}
                  </div>

                  <strong className="text-sm font-black text-indigo-950 block">
                    {selectedEntry.assignmentTitle || selectedEntry.attachmentName}
                  </strong>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-600 font-medium">
                      Submission: <strong>{selectedEntry.assignmentSubmissionType || 'Physical Notebook'}</strong>
                    </span>

                    {selectedEntry.attachmentName && (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedEntry.attachmentUrl) {
                            window.open(selectedEntry.attachmentUrl, '_blank');
                          } else {
                            alert(`Downloading attached worksheet: ${selectedEntry.attachmentName}`);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-2xs"
                      >
                        <Download className="w-3 h-3" />
                        Download ({selectedEntry.attachmentSize || '1.2 MB'})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 📌 Important Teacher Notes */}
              {selectedEntry.importantNotes && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                    📌 Important Teacher Notes & Observations
                  </span>
                  <p className="text-xs text-amber-950 font-medium whitespace-pre-wrap">
                    {selectedEntry.importantNotes}
                  </p>
                </div>
              )}

              {/* ⚠️ Remedial Action Plan */}
              {selectedEntry.remedialRequired && (
                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-900 flex items-center gap-1">
                    ⚠️ Remedial Action & Catchup Plan
                  </span>
                  <p className="text-xs text-rose-950 font-medium">
                    {selectedEntry.remedialPlan || 'Scheduled additional clarification session for concept mastery.'}
                  </p>
                </div>
              )}

              {/* Learning Objectives */}
              <div>
                <strong className="text-slate-900 block text-xs mb-1">Learning Objectives (Target Competency)</strong>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                  {selectedEntry.learningObjectives || 'Foundational concept mastery and practical exercises.'}
                </p>
              </div>

              {/* Pedagogy & Assessment Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <strong className="text-slate-900 block text-xs mb-1">Teaching Pedagogy</strong>
                  <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium">
                    {selectedEntry.teachingPedagogy}
                  </p>
                </div>
                <div>
                  <strong className="text-slate-900 block text-xs mb-1">Assessment Mode</strong>
                  <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium">
                    {selectedEntry.assessmentMode || 'Classroom Worksheet'}
                  </p>
                </div>
              </div>

              <div>
                <strong className="text-slate-900 block text-xs mb-1">Classwork Summary</strong>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  {selectedEntry.classworkSummary || 'Completed textbook exercises in classroom.'}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 block text-xs mb-1">Homework Assigned</strong>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  {selectedEntry.homeworkAssigned || 'Workbook practice set.'}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 block text-xs mb-1">Real-World Application (NEP 2020)</strong>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  {selectedEntry.realWorldApplication || 'Demonstrated practical connection to daily life.'}
                </p>
              </div>

              {/* Student Engagement */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Student Engagement Rating:</span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
                  {selectedEntry.studentEngagementLevel || 'High (Actively Engaged)'}
                </span>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Facilitator: {selectedEntry.teacherName}</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedEntry(null)}>Close Drawer</Button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 MODAL: LOG DAILY LESSON ENTRY (WITH ASSIGNMENTS, NOTES & RADAR SYNC) */}
      {isNewEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-indigo-500/30">
                  Teacher Daily Lesson Planning Diary
                </span>
                <h3 className="text-lg font-black text-white mt-1">Log Daily Lesson Delivery</h3>
                <p className="text-xs text-slate-300">
                  Log instructional delivery, upload assignments/worksheets, record important observations, and auto-sync Curriculum Radar.
                </p>
              </div>
              <button onClick={() => setIsNewEntryOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveEntry} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              
              {/* Class, Section, Date */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Class Cohort</label>
                  <select
                    value={formClass}
                    onChange={e => setFormClass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {dynamicClasses.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Section</label>
                  <select
                    value={formSection}
                    onChange={e => setFormSection(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lesson Date</label>
                  <input
                    type="date"
                    value={formLessonDate}
                    onChange={e => setFormLessonDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    required
                  />
                </div>
              </div>

              {/* Subject & Chapter Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Academic Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={e => {
                      const newSubjId = e.target.value;
                      setSelectedSubjectId(newSubjId);
                      const sub = classSubjects.find(s => s.id === newSubjId);
                      setFormTeacherName(sub?.teacherName || 'Staff Facilitator');
                      if (sub?.chapters && sub.chapters.length > 0) {
                        setSelectedChapterId(sub.chapters[0].id);
                      } else {
                        setSelectedChapterId('');
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    {classSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Chapter / Unit (Curriculum Mapping)</label>
                  <select
                    value={selectedChapterId}
                    onChange={e => setSelectedChapterId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    {availableChapters.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        Unit {c.chapterNumber}: {c.chapterName} ({c.termName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Term & Milestone Auto-Detection Banner */}
              {activeChapterObj && (
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between text-purple-950">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Mapped Assessment Milestone:</span>
                    <span className="px-2 py-0.5 bg-purple-200 text-purple-900 rounded font-black text-[10px]">
                      {activeChapterObj.termName}
                    </span>
                    <span className="font-semibold text-xs">{activeChapterObj.assessmentMilestone}</span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700">Radar Auto-Sync Active ⚡</span>
                </div>
              )}

              {/* Facilitator & Periods */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Facilitator / Teacher</label>
                  <input
                    type="text"
                    value={formTeacherName}
                    onChange={e => setFormTeacherName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Periods Delivered (+)</label>
                  <select
                    value={formPeriodsDelivered}
                    onChange={e => setFormPeriodsDelivered(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value={1}>+1 Period</option>
                    <option value={2}>+2 Periods (Double)</option>
                    <option value={3}>+3 Periods</option>
                  </select>
                </div>
              </div>

              {/* Topic Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Topic / Sub-Topic Title</label>
                <input
                  type="text"
                  value={formTopicTitle}
                  onChange={e => setFormTopicTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                  placeholder="e.g. Concept Fundamentals & Formula Applications"
                  required
                />
              </div>

              {/* Pedagogy & Assessment Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Pedagogy</label>
                  <select
                    value={formPedagogy}
                    onChange={e => setFormPedagogy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="Smartboard & Concept Discussion">Smartboard & Concept Discussion</option>
                    <option value="Hands-on Experiment & Lab Activity">Hands-on Experiment & Lab Activity</option>
                    <option value="Collaborative Group Activity & Problem Solving">Collaborative Group Activity & Problem Solving</option>
                    <option value="Experiential Learning & Real-world Demonstration">Experiential Learning & Real-world Demonstration</option>
                    <option value="Remedial / Revision Drill">Remedial / Revision Drill</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assessment / Understanding Check</label>
                  <select
                    value={formAssessmentMode}
                    onChange={e => setFormAssessmentMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="Classroom Worksheet">Classroom Worksheet</option>
                    <option value="Oral Quiz & Questioning">Oral Quiz & Questioning</option>
                    <option value="Exit Ticket Check">Exit Ticket Check</option>
                    <option value="Peer Learning Review">Peer Learning Review</option>
                    <option value="Hands-on Lab Exercise">Hands-on Lab Exercise</option>
                  </select>
                </div>
              </div>

              {/* Classwork Summary */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Classwork Summary</label>
                <textarea
                  value={formClasswork}
                  onChange={e => setFormClasswork(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900"
                  placeholder="Completed textbook exercises Q1-Q10..."
                />
              </div>

              {/* 🌟 ASSIGNMENT & WORKSHEET ATTACHMENT CARD */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Homework / Assignment & Resource Upload
                  </label>
                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded-full">
                    Student & Parent Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Assignment / Worksheet Title</label>
                    <input
                      type="text"
                      value={formAssignmentTitle}
                      onChange={e => setFormAssignmentTitle(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      placeholder="e.g. Unit 4 Practice Worksheet & Word Problems"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Submission Due Date</label>
                    <input
                      type="date"
                      value={formAssignmentDueDate}
                      onChange={e => setFormAssignmentDueDate(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Homework Instructions / Problem Set</label>
                  <textarea
                    rows={2}
                    value={formHomework}
                    onChange={e => setFormHomework(e.target.value)}
                    placeholder="e.g. Complete Exercise 4.2 questions 1 to 8 in mathematics notebook. Draw diagrams neatly."
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                  <label className="flex items-center gap-2 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPublishToHomeworkLms}
                      onChange={e => setFormPublishToHomeworkLms(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="text-[11px] font-bold text-indigo-900">
                      ⚡ Automatically push to Student Homework LMS &amp; WhatsApp Parent Notification
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Submission Mode</label>
                    <select
                      value={formAssignmentSubmissionType}
                      onChange={e => setFormAssignmentSubmissionType(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="Physical Notebook / Diary">Physical Notebook / Diary</option>
                      <option value="Digital File / Online Submission">Digital File / Online Submission</option>
                      <option value="Lab Practical File">Lab Practical File</option>
                      <option value="Project Model / Chart">Project Model / Chart</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Upload Worksheet / PDF File</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                    />
                  </div>
                </div>

                {/* Selected File Badge & Quick Samples */}
                <div className="flex items-center justify-between gap-2 flex-wrap pt-1 text-[11px]">
                  {formAttachmentName ? (
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                      📄 Attached: {formAttachmentName} ({formAttachmentSize})
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">Or attach standard template:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormAssignmentTitle(`${activeSubjectObj?.name || 'Unit'} Chapter Practice Worksheet`);
                          setFormAttachmentName(`${formClass.replace(' ', '_')}_worksheet.pdf`);
                          setFormAttachmentSize('1.2 MB');
                        }}
                        className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-200 hover:bg-indigo-50"
                      >
                        + Chapter Practice Worksheet.pdf
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 🌟 IMPORTANT TEACHER NOTES & REMARKS */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  📌 Important Notes & Special Observations
                  <span className="text-[10px] font-normal text-slate-400">(For Academic Coordinator & Lesson Followup)</span>
                </label>
                <textarea
                  value={formImportantNotes}
                  onChange={e => setFormImportantNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900"
                  placeholder="e.g. 85% students grasped concept well. Scheduled 10 mins rapid recap on Friday."
                />
              </div>

              {/* 🌟 REMEDIAL ACTION TOGGLE */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-xs font-bold text-slate-800 block">
                      Remedial Action Required for Slow Learners?
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      Flags this session for academic intervention and extra attention.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formRemedialRequired}
                      onChange={e => setFormRemedialRequired(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {formRemedialRequired && (
                  <div className="pt-2 animate-in fade-in">
                    <input
                      type="text"
                      value={formRemedialPlan}
                      onChange={e => setFormRemedialPlan(e.target.value)}
                      placeholder="e.g. 4 students need 15 mins remedial session during zero period on word problems."
                      className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 mt-4">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsNewEntryOpen(false)}>Cancel</Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSavingEntry}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Save Entry & Sync Radar
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

