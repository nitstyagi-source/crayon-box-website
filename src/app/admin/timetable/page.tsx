"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Calendar, Clock, BookOpen, Users, UserCheck,
  RefreshCw, Filter, Sparkles, Building2, CheckCircle2,
  Settings, AlertTriangle, ShieldCheck, Plus, Edit2,
  Trash2, X, ArrowRight, Heart, Sparkle, Layers, Check,
  ArrowUp, ArrowDown, MoveVertical, Coffee, UtensilsCrossed,
  Sun, Bell, Zap, Sliders, Shuffle, Printer
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import { getInstitutionClassesAction } from '@/app/actions/attendance-actions';
import { SmartTimetableBuilderDesk } from './smart-builder/page';
import { FacultySubstitutionEngineDesk } from '../faculty/substitutions/page';
import {
  getTimetableSettingsAction,
  saveTimetableSettingsAction,
  updatePeriodTimingsAction,
  getMotherTeacherAllocationAction,
  saveMotherTeacherAllocationAction,
  checkTimetableConflictAction,
  saveTimetableSlotWithConflictProtectionAction,
  autoGenerateTimetableAction,
  getFacultyListForTimetableAction
} from '@/app/actions/timetable-management-actions';
import {
  getDefaultPeriodTimings,
  PeriodTimingConfig,
  TimetableSettingsInput,
  parseTimeToMinutes,
  formatMinutesToTime,
  calculateDuration,
  addMinutesToTime,
  recalculateCascadingTimings
} from '@/lib/timetable-utils';
import { getMasterTimetableGridAction } from '@/app/actions/academic-operations-actions';

const EARLY_GRADES = ['Pre-Nursery', 'Nursery', 'LKG', 'UKG', 'Kindergarten', 'Class 1', 'Class 2'];

const ALL_GRADES = [
  'Pre-Nursery', 'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

const STANDARD_SUBJECTS_EARLY = [
  'English Phonics & Literacy',
  'Mathematics & Numbers',
  'Environmental Studies (EVS)',
  'Hindi Language',
  'Art & Creative Craft',
  'Rhymes & Storytelling',
  'Phonics & Handwriting',
  'General Knowledge (GK)'
];

function MasterTimetableContent() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();
  const activeInst = currentInstitution === 'ALL' ? 'CBS' : currentInstitution;
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get('tab') || 'grid').toLowerCase();
  const [activeTab, setActiveTab] = useState<'GRID' | 'SOLVER' | 'PROXIES' | 'SETTINGS'>(
    tabParam === 'solver' ? 'SOLVER' :
    tabParam === 'substitutions' || tabParam === 'proxies' ? 'PROXIES' :
    tabParam === 'settings' ? 'SETTINGS' : 'GRID'
  );

  const [dynamicGrades, setDynamicGrades] = useState<string[]>(ALL_GRADES);

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await getInstitutionClassesAction(activeInst);
        if (res.success && res.classes && res.classes.length > 0) {
          setDynamicGrades(res.classes as string[]);
        }
      } catch (e) {
        console.error('Error loading timetable classes:', e);
      }
    }
    loadClasses();
  }, [activeInst]);

  const handleTabChange = (tab: 'GRID' | 'SOLVER' | 'PROXIES' | 'SETTINGS') => {
    setActiveTab(tab);
    const paramMap = { GRID: 'grid', SOLVER: 'solver', PROXIES: 'substitutions', SETTINGS: 'settings' };
    router.replace(`/admin/timetable?tab=${paramMap[tab]}`, { scroll: false });
  };

  const [selectedGrade, setSelectedGrade] = useState('Class 1');
  const [selectedSection, setSelectedSection] = useState('A');
  const [timetableData, setTimetableData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Settings State
  const [settings, setSettings] = useState<TimetableSettingsInput | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Period Timings Customizer State
  const [isPeriodCustomizerOpen, setIsPeriodCustomizerOpen] = useState(false);
  const [customPeriodTimings, setCustomPeriodTimings] = useState<PeriodTimingConfig[]>([]);
  const [isSavingCustomTimings, setIsSavingCustomTimings] = useState(false);
  const [targetPeriodIndex, setTargetPeriodIndex] = useState<number | null>(null);

  // Mother Teacher State
  const [motherTeacherData, setMotherTeacherData] = useState<any | null>(null);
  const [isMotherTeacherOpen, setIsMotherTeacherOpen] = useState(false);
  const [isSavingMotherTeacher, setIsSavingMotherTeacher] = useState(false);
  const [selectedMtStaffId, setSelectedMtStaffId] = useState('');
  const [selectedMtSubjects, setSelectedMtSubjects] = useState<string[]>(STANDARD_SUBJECTS_EARLY);

  // Auto Generate State
  const [isAutoGenerateOpen, setIsAutoGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoGenScope, setAutoGenScope] = useState<'SINGLE_CLASS' | 'ALL_CLASSES'>('SINGLE_CLASS');

  // Edit Slot State
  const [editingSlot, setEditingSlot] = useState<any | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [slotConflict, setSlotConflict] = useState<string | null>(null);

  // Faculty List
  const [facultyList, setFacultyList] = useState<any[]>([]);

  // Toast / Feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4500);
  };

  // Load Timetable Grid
  const fetchTimetable = async () => {
    setIsLoading(true);
    try {
      const res = await getMasterTimetableGridAction({
        grade: selectedGrade,
        section: selectedSection
      });
      if (res.success) {
        setTimetableData(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Settings
  const fetchSettings = async () => {
    const res = await getTimetableSettingsAction(activeInst);
    if (res.success && res.settings) {
      setSettings(res.settings);
    }
  };

  // Load Mother Teacher
  const fetchMotherTeacher = async () => {
    if (EARLY_GRADES.includes(selectedGrade)) {
      const res = await getMotherTeacherAllocationAction(activeInst, selectedGrade, selectedSection);
      if (res.success && res.data) {
        setMotherTeacherData(res.data);
        setSelectedMtStaffId(res.data.motherTeacherId || '');
        setSelectedMtSubjects(res.data.subjectsTaught || STANDARD_SUBJECTS_EARLY);
      } else {
        setMotherTeacherData(null);
      }
    } else {
      setMotherTeacherData(null);
    }
  };

  // Load Faculty List
  const fetchFaculty = async () => {
    const res = await getFacultyListForTimetableAction();
    if (res.success) {
      setFacultyList(res.faculty || []);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchFaculty();
  }, [activeInst]);

  useEffect(() => {
    fetchTimetable();
    fetchMotherTeacher();
  }, [selectedGrade, selectedSection, activeInst]);

  // Working Days & Periods from Settings
  const workingDays = settings?.workingDays && settings.workingDays.length > 0
    ? settings.workingDays
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const periodCount = settings?.periodsPerDay || 8;
  const rawTimings = settings?.periodTimings && settings.periodTimings.length > 0
    ? settings.periodTimings
    : getDefaultPeriodTimings(periodCount);

  const periodTimingsList = rawTimings;

  // Group slots by Day and Period
  const getSlot = (day: string, periodNumber: number) => {
    if (!timetableData?.slots) return null;
    return timetableData.slots.find(
      (s: any) => s.day_of_week === day && Number(s.period_number) === Number(periodNumber)
    );
  };

  // -------------------------------------------------------------
  // PERIOD TIMINGS CUSTOMIZER HANDLERS
  // -------------------------------------------------------------
  const handleOpenPeriodCustomizer = (focusIndex?: number) => {
    const currentList = settings?.periodTimings && settings.periodTimings.length > 0
      ? JSON.parse(JSON.stringify(settings.periodTimings))
      : getDefaultPeriodTimings(settings?.periodsPerDay || 8);
    setCustomPeriodTimings(currentList);
    setTargetPeriodIndex(focusIndex !== undefined ? focusIndex : null);
    setIsPeriodCustomizerOpen(true);
  };

  const handleUpdatePeriodField = (index: number, field: keyof PeriodTimingConfig, value: any) => {
    const copy = [...customPeriodTimings];
    const target = { ...copy[index] };

    if (field === 'durationMinutes') {
      const dur = Math.max(5, parseInt(value, 10) || 0);
      target.durationMinutes = dur;
      target.endTime = addMinutesToTime(target.startTime, dur);
    } else if (field === 'startTime') {
      target.startTime = value;
      if (target.durationMinutes > 0) {
        target.endTime = addMinutesToTime(value, target.durationMinutes);
      }
    } else if (field === 'endTime') {
      target.endTime = value;
      target.durationMinutes = calculateDuration(target.startTime, value);
    } else if (field === 'isBreak') {
      target.isBreak = Boolean(value);
      if (target.isBreak && target.periodNumber > 0) {
        target.periodNumber = 0;
        target.breakType = target.breakType || 'Short Break';
      } else if (!target.isBreak) {
        target.breakType = 'None';
      }
    } else {
      (target as any)[field] = value;
    }

    copy[index] = target;
    setCustomPeriodTimings(copy);
  };

  const handleAddCustomPeriod = (type: 'Regular' | 'Short Break' | 'Lunch Break' | 'Assembly' | 'Zero Period') => {
    const copy = [...customPeriodTimings];
    const lastPeriod = copy[copy.length - 1];
    const lastEndTime = lastPeriod ? lastPeriod.endTime : '02:00 PM';

    let newEntry: PeriodTimingConfig;

    if (type === 'Regular') {
      const maxPNum = Math.max(0, ...copy.filter(p => !p.isBreak).map(p => p.periodNumber || 0));
      const nextNum = maxPNum + 1;
      newEntry = {
        periodNumber: nextNum,
        periodLabel: `Period ${nextNum}`,
        startTime: lastEndTime,
        endTime: addMinutesToTime(lastEndTime, 40),
        durationMinutes: 40,
        isBreak: false,
        breakType: 'None'
      };
    } else if (type === 'Short Break') {
      newEntry = {
        periodNumber: 0,
        periodLabel: 'Short Recess',
        startTime: lastEndTime,
        endTime: addMinutesToTime(lastEndTime, 15),
        durationMinutes: 15,
        isBreak: true,
        breakType: 'Short Break'
      };
    } else if (type === 'Lunch Break') {
      newEntry = {
        periodNumber: 0,
        periodLabel: 'Lunch Break',
        startTime: lastEndTime,
        endTime: addMinutesToTime(lastEndTime, 30),
        durationMinutes: 30,
        isBreak: true,
        breakType: 'Lunch Break'
      };
    } else if (type === 'Assembly') {
      newEntry = {
        periodNumber: 0,
        periodLabel: 'Morning Assembly',
        startTime: '08:00 AM',
        endTime: '08:30 AM',
        durationMinutes: 30,
        isBreak: true,
        breakType: 'Assembly'
      };
    } else {
      newEntry = {
        periodNumber: 0,
        periodLabel: 'Zero Period / Remedial',
        startTime: '07:45 AM',
        endTime: '08:25 AM',
        durationMinutes: 40,
        isBreak: false,
        breakType: 'None'
      };
    }

    setCustomPeriodTimings([...copy, newEntry]);
  };

  const handleDeletePeriod = (index: number) => {
    const copy = customPeriodTimings.filter((_, i) => i !== index);
    // Renumber remaining regular periods sequentially
    let pCount = 1;
    const renumbered = copy.map(p => {
      if (!p.isBreak && p.periodNumber > 0) {
        const updated = { ...p, periodNumber: pCount, periodLabel: p.periodLabel.startsWith('Period ') ? `Period ${pCount}` : p.periodLabel };
        pCount++;
        return updated;
      }
      return p;
    });
    setCustomPeriodTimings(renumbered);
  };

  const handleMovePeriod = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= customPeriodTimings.length) return;

    const copy = [...customPeriodTimings];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setCustomPeriodTimings(copy);
  };

  const handleAutoCascadeTimings = () => {
    const initialStart = settings?.schoolStartTime || customPeriodTimings[0]?.startTime || '08:00 AM';
    const cascaded = recalculateCascadingTimings(customPeriodTimings, initialStart);
    setCustomPeriodTimings(cascaded);
    showFeedback('⚡ Auto-cascaded sequential start & end timings based on period durations!');
  };

  const handleApplyPresetDuration = (duration: number) => {
    const updated = customPeriodTimings.map(p => {
      if (!p.isBreak) {
        return {
          ...p,
          durationMinutes: duration,
          endTime: addMinutesToTime(p.startTime, duration)
        };
      }
      return p;
    });
    const cascaded = recalculateCascadingTimings(updated, settings?.schoolStartTime || '08:00 AM');
    setCustomPeriodTimings(cascaded);
    showFeedback(`⏱️ Applied ${duration}-minute duration to all academic periods!`);
  };

  const handleSaveCustomPeriodTimings = async () => {
    setIsSavingCustomTimings(true);
    try {
      const res = await updatePeriodTimingsAction({
        institutionCode: activeInst,
        periodTimings: customPeriodTimings
      });

      if (res.success) {
        showFeedback('✅ Custom period timings saved & synced across the timetable grid!');
        setIsPeriodCustomizerOpen(false);
        await fetchSettings();
        await fetchTimetable();
      } else {
        alert('Error saving period timings: ' + res.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsSavingCustomTimings(false);
    }
  };

  // -------------------------------------------------------------
  // OTHER TIMETABLE HANDLERS
  // -------------------------------------------------------------
  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSavingSettings(true);
    const res = await saveTimetableSettingsAction(settings);
    if (res.success) {
      showFeedback('✅ School timings and working days successfully saved!');
      setIsSettingsOpen(false);
      fetchTimetable();
    } else {
      alert('Error saving settings: ' + res.error);
    }
    setIsSavingSettings(false);
  };

  const handleSaveMotherTeacher = async () => {
    const staff = facultyList.find(f => f.id === selectedMtStaffId);
    if (!staff) {
      alert('Please select a Mother Teacher from the faculty list.');
      return;
    }

    setIsSavingMotherTeacher(true);
    const res = await saveMotherTeacherAllocationAction({
      institutionCode: activeInst,
      className: selectedGrade,
      sectionName: selectedSection,
      motherTeacherId: staff.id,
      motherTeacherName: staff.name,
      subjectsTaught: selectedMtSubjects
    });

    if (res.success) {
      showFeedback(`👩‍🏫 Mother Teacher ${staff.name} successfully assigned to ${selectedGrade} (${selectedSection})!`);
      setIsMotherTeacherOpen(false);
      fetchMotherTeacher();
      fetchTimetable();
    } else {
      alert('Error saving Mother Teacher: ' + res.error);
    }
    setIsSavingMotherTeacher(false);
  };

  const handleExecuteAutoGenerate = async () => {
    setIsGenerating(true);
    const res = await autoGenerateTimetableAction({
      institutionCode: activeInst,
      scope: autoGenScope,
      className: selectedGrade,
      sectionName: selectedSection,
      targetWorkingDays: workingDays,
      periodsPerDay: periodCount
    });

    if (res.success) {
      showFeedback(`⚡ ${res.message}`);
      setIsAutoGenerateOpen(false);
      fetchTimetable();
    } else {
      alert('Error auto-generating timetable: ' + res.error);
    }
    setIsGenerating(false);
  };

  const handleOpenEditSlot = (day: string, periodNumber: number) => {
    const existing = getSlot(day, periodNumber);
    const pt = periodTimingsList.find(p => p.periodNumber === periodNumber);

    setEditingSlot({
      id: existing?.id,
      className: selectedGrade,
      sectionName: selectedSection,
      dayOfWeek: day,
      periodNumber: periodNumber,
      periodLabel: pt?.periodLabel || `Period ${periodNumber}`,
      startTime: existing?.start_time || pt?.startTime || '08:30 AM',
      endTime: existing?.end_time || pt?.endTime || '09:15 AM',
      durationMinutes: pt?.durationMinutes || 40,
      subjectName: existing?.subject_name || (EARLY_GRADES.includes(selectedGrade) ? 'English Phonics & Literacy' : 'Mathematics'),
      teacherId: existing?.teacher_id || (motherTeacherData?.motherTeacherId || ''),
      teacherName: existing?.teacher_name || (motherTeacherData?.motherTeacherName || ''),
      roomNumber: existing?.room_number || (EARLY_GRADES.includes(selectedGrade) ? `${selectedGrade} Homeroom` : `Room ${100 + periodNumber}`),
      breakType: existing?.break_type || 'None'
    });
    setSlotConflict(null);
    setIsSlotModalOpen(true);
  };

  const handleCheckConflict = async (teacherId: string, roomNumber: string) => {
    if (!editingSlot) return;
    const staff = facultyList.find(f => f.id === teacherId);
    const res = await checkTimetableConflictAction({
      slotId: editingSlot.id,
      className: selectedGrade,
      sectionName: selectedSection,
      dayOfWeek: editingSlot.dayOfWeek,
      periodNumber: editingSlot.periodNumber,
      teacherId,
      teacherName: staff?.name,
      roomNumber
    });

    if (res.hasConflict) {
      setSlotConflict(res.conflicts[0]?.message || 'Conflict detected');
    } else {
      setSlotConflict(null);
    }
  };

  const handleSaveSlot = async () => {
    if (!editingSlot) return;
    setIsSavingSlot(true);
    const staff = facultyList.find(f => f.id === editingSlot.teacherId);

    const res = await saveTimetableSlotWithConflictProtectionAction({
      ...editingSlot,
      teacherName: staff?.name || editingSlot.teacherName
    });

    if (res.success) {
      showFeedback(`✅ Period ${editingSlot.periodNumber} (${editingSlot.dayOfWeek}) successfully updated!`);
      setIsSlotModalOpen(false);
      fetchTimetable();
    } else if (res.hasConflict) {
      setSlotConflict(res.error || 'Conflict detected');
    } else {
      alert('Error saving slot: ' + res.error);
    }
    setIsSavingSlot(false);
  };

  const isCurrentEarlyGrade = EARLY_GRADES.includes(selectedGrade);
  const regularPeriodCount = periodTimingsList.filter(p => !p.isBreak && p.periodNumber > 0).length;
  const breakCount = periodTimingsList.filter(p => p.isBreak).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-20">
      
      {/* Option 6 Sattva-Digital Vastu Header Banner */}
      <VastuModuleBanner
        badgeText="Statutory Institutional Schedule"
        badgeIcon={<Clock className="w-3.5 h-3.5 text-[#D97706]" />}
        institutionText={`Campus: ${activeInst} • ${workingDays.length}-Day Week • Session 2026–2027`}
        title="Timetable, Smart Solver & Substitutions Hub"
        titleIcon={<Clock className="w-7 h-7 text-[#D97706]" />}
        description="Master timetable command center uniting Class & Room Schedule Grids, AI Conflict-Free Solver, Morning Absent Teacher Proxy Substitutions, and Bell Timings."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTimetable}
              isLoading={isLoading}
              className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-[#FAF7F2] text-xs font-bold shadow-2xs"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-stone-500" />}
            >
              Sync Live DB
            </Button>
            <Button
              variant="saffron"
              size="sm"
              onClick={() => handleOpenPeriodCustomizer()}
              className="bg-[#D97706] hover:bg-[#B45309] text-white font-black text-xs shadow-md"
              leftIcon={<Sliders className="w-3.5 h-3.5" />}
            >
              Period Timings ({regularPeriodCount}P)
            </Button>
          </>
        }
        tabs={[
          { id: 'GRID', label: '1. Master Class & Room Grid', icon: <Calendar className="w-4 h-4 text-blue-600" /> },
          { id: 'SOLVER', label: '2. AI Smart Conflict-Free Solver', icon: <Sparkles className="w-4 h-4 text-amber-600" /> },
          { id: 'PROXIES', label: '3. Daily Teacher Substitutions', icon: <Shuffle className="w-4 h-4 text-emerald-600" /> },
          { id: 'SETTINGS', label: '4. Bell Timings & Config', icon: <Settings className="w-4 h-4 text-stone-600" /> },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => handleTabChange(id as any)}
      />

      {activeTab === 'SOLVER' && (
        <div className="animate-in fade-in duration-200">
          <SmartTimetableBuilderDesk />
        </div>
      )}

      {activeTab === 'PROXIES' && (
        <div className="animate-in fade-in duration-200">
          <FacultySubstitutionEngineDesk />
        </div>
      )}

      {(activeTab === 'GRID' || activeTab === 'SETTINGS') && (
        <div className="space-y-6 animate-in fade-in duration-200">

      {/* Toast Feedback */}
      {feedback && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Cohort Selector & Mother Teacher Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Class Cohort:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {dynamicGrades.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          {/* Quick Customize Period Timings Pill */}
          <button
            type="button"
            onClick={() => handleOpenPeriodCustomizer()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            Custom Period Timings ({regularPeriodCount} Periods)
          </button>

          {/* Auto-Generate Timetable Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsAutoGenerateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            Auto-Generate Timetable
          </button>
        </div>

        {/* Mother Teacher Status Indicator (if early grade) */}
        {isCurrentEarlyGrade ? (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 px-4 py-2 rounded-2xl">
            <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
              👩‍🏫
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                Mother Teacher (Homeroom Lead)
              </span>
              <span className="text-xs font-black text-rose-950">
                {motherTeacherData?.motherTeacherName ? motherTeacherData.motherTeacherName : 'Not Assigned Yet'}
              </span>
            </div>
            <button
              onClick={() => setIsMotherTeacherOpen(true)}
              className="ml-2 text-[11px] font-bold text-rose-700 hover:text-rose-900 underline"
            >
              Configure
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong>{timetableData?.totalSlots || 0} Active Period Slots</strong> for {selectedGrade} - {selectedSection}
          </div>
        )}
      </div>

      {/* 🌟 MASTER TIMETABLE MULTI-DAY MATRIX WITH CUSTOM PERIOD TIMINGS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Weekly Schedule Matrix:</span>
            <span className="text-slate-500">
              {workingDays.length} Working Days • {regularPeriodCount} Teaching Periods ({breakCount} Breaks) • Hover column header to edit period time.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenPeriodCustomizer()}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              Customize Each Period Time
            </button>
            <span className="font-mono text-slate-400 font-bold">{selectedGrade} - Section {selectedSection}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-32 border-r border-slate-800">Day / Period</th>
                {periodTimingsList.map((pt, idx) => (
                  <th
                    key={pt.periodNumber ? `p-${pt.periodNumber}` : `b-${idx}`}
                    className={`py-3 px-3 border-r border-slate-800 text-center min-w-[135px] group ${
                      pt.isBreak ? 'bg-slate-950/80' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className={`block font-black ${pt.isBreak ? 'text-amber-400' : 'text-indigo-300'}`}>
                        {pt.isBreak ? (pt.breakType === 'Lunch Break' ? '🍱 ' : '🥪 ') : ''}
                        {pt.periodLabel || `Period ${pt.periodNumber}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenPeriodCustomizer(idx)}
                        title="Customize this period's start & end time"
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition p-0.5"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-slate-400 font-mono">{pt.startTime} – {pt.endTime}</span>
                      <span className="text-[8px] bg-slate-800 text-slate-300 px-1 py-0.2 rounded font-mono font-bold">
                        {pt.durationMinutes}m
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {workingDays.map(day => (
                <tr key={day} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-4 font-bold text-slate-900 bg-slate-50/80 border-r border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span>{day}</span>
                    </div>
                  </td>

                  {periodTimingsList.map((pt, idx) => {
                    // If this is a break (Recess / Lunch), render a vertical break column
                    if (pt.isBreak) {
                      return (
                        <td
                          key={`break-${idx}`}
                          className="py-2.5 px-2 bg-amber-50/30 border-r border-amber-100/60 text-center align-middle"
                        >
                          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-100/30 text-amber-800/80 border border-amber-200/40">
                            <span className="text-xs">{pt.breakType === 'Lunch Break' ? '🍱' : '🥪'}</span>
                            <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">{pt.periodLabel}</span>
                            <span className="text-[8px] font-mono text-amber-700/70">{pt.durationMinutes}m</span>
                          </div>
                        </td>
                      );
                    }

                    const slot = getSlot(day, pt.periodNumber);
                    const isMotherTeacherSlot = isCurrentEarlyGrade && slot?.teacher_name === motherTeacherData?.motherTeacherName;

                    return (
                      <td key={`period-${pt.periodNumber}`} className="py-2.5 px-2.5 border-r border-slate-100 align-top">
                        {slot ? (
                          <div
                            onClick={() => handleOpenEditSlot(day, pt.periodNumber)}
                            className={`p-2.5 rounded-2xl border transition group cursor-pointer hover:shadow-md ${
                              isMotherTeacherSlot
                                ? 'bg-rose-50/70 border-rose-200/80 hover:bg-rose-100/70'
                                : 'bg-slate-50/80 border-slate-200/80 hover:bg-indigo-50/60 hover:border-indigo-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-extrabold text-[11px] text-slate-900 leading-tight block truncate">
                                {slot.subject_name}
                              </span>
                              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-600 font-semibold block truncate">
                                👤 {slot.teacher_name}
                              </span>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] font-mono text-slate-400">
                                  📍 {slot.room_number || 'Homeroom'}
                                </span>
                                {isMotherTeacherSlot && (
                                  <span className="text-[8px] font-black uppercase tracking-wider bg-rose-200 text-rose-800 px-1 py-0.2 rounded">
                                    Mother Teacher
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenEditSlot(day, pt.periodNumber)}
                            className="w-full h-20 rounded-2xl border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-[9px] font-bold mt-0.5">Assign</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌟 MODAL 1: CUSTOMIZE EACH PERIOD WITH DIFFERENT TIME */}
      {isPeriodCustomizerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    Bell Schedule & Custom Period Configurator
                  </span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-slate-300 text-xs font-semibold">
                    {customPeriodTimings.filter(p => !p.isBreak).length} Academic Periods • {customPeriodTimings.filter(p => p.isBreak).length} Breaks
                  </span>
                </div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Customize Each Period Time & Schedule
                </h3>
                <p className="text-xs text-slate-300">
                  Set unique start & end times and duration for each period individually. Add or remove breaks & zero periods.
                </p>
              </div>
              <button onClick={() => setIsPeriodCustomizerOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            {/* Toolbar: Auto-Cascade & Presets */}
            <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-700 text-[11px]">Quick Tools:</span>
                <button
                  type="button"
                  onClick={handleAutoCascadeTimings}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition"
                >
                  <Zap className="w-3 h-3 text-amber-300" />
                  Auto-Cascade Sequential Times
                </button>

                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold px-1.5">Preset:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetDuration(40)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-[11px]"
                  >
                    40m Each
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetDuration(45)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-[11px]"
                  >
                    45m Each
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetDuration(50)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-[11px]"
                  >
                    50m Each
                  </button>
                </div>
              </div>

              {/* Add Period Dropdown / Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAddCustomPeriod('Regular')}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  Add Teaching Period
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCustomPeriod('Short Break')}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1 shadow-2xs"
                >
                  🥪 Add Recess
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCustomPeriod('Lunch Break')}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1 shadow-2xs"
                >
                  🍱 Add Lunch
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCustomPeriod('Assembly')}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-1 shadow-2xs"
                >
                  🧘 Add Assembly
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCustomPeriod('Zero Period')}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 shadow-2xs"
                >
                  ⚡ Zero Period
                </button>
              </div>
            </div>

            {/* List of Periods to customize */}
            <div className="p-6 space-y-3 overflow-y-auto flex-1 text-xs">
              {customPeriodTimings.map((pt, idx) => {
                const isHighlighted = targetPeriodIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition ${
                      pt.isBreak
                        ? 'bg-amber-50/50 border-amber-200'
                        : isHighlighted
                        ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      
                      {/* Period Label & Category */}
                      <div className="flex items-center gap-2.5 min-w-[200px]">
                        <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                          pt.isBreak ? 'bg-amber-200 text-amber-900' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {pt.isBreak ? (pt.breakType === 'Lunch Break' ? '🍱' : '🥪') : (pt.periodNumber || '0')}
                        </span>

                        <div className="flex-1">
                          <input
                            type="text"
                            value={pt.periodLabel}
                            onChange={e => handleUpdatePeriodField(idx, 'periodLabel', e.target.value)}
                            placeholder="Period Label"
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Start Time, End Time & Duration */}
                      <div className="flex items-center gap-2 flex-wrap flex-1">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Start Time</label>
                          <input
                            type="text"
                            value={pt.startTime}
                            onChange={e => handleUpdatePeriodField(idx, 'startTime', e.target.value)}
                            className="w-28 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold font-mono text-slate-900"
                            placeholder="08:30 AM"
                          />
                        </div>

                        <span className="text-slate-400 font-bold pt-4">–</span>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">End Time</label>
                          <input
                            type="text"
                            value={pt.endTime}
                            onChange={e => handleUpdatePeriodField(idx, 'endTime', e.target.value)}
                            className="w-28 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold font-mono text-slate-900"
                            placeholder="09:15 AM"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Duration (Mins)</label>
                          <input
                            type="number"
                            value={pt.durationMinutes}
                            onChange={e => handleUpdatePeriodField(idx, 'durationMinutes', e.target.value)}
                            className="w-20 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold font-mono text-indigo-700"
                            min={5}
                            max={180}
                          />
                        </div>

                        {/* Break Toggle */}
                        <div className="pt-4 flex items-center gap-1.5">
                          <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pt.isBreak}
                              onChange={e => handleUpdatePeriodField(idx, 'isBreak', e.target.checked)}
                              className="rounded text-indigo-600"
                            />
                            Is Break?
                          </label>
                        </div>
                      </div>

                      {/* Reorder & Delete Buttons */}
                      <div className="flex items-center gap-1 pt-1 md:pt-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMovePeriod(idx, 'up')}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-600 transition"
                          title="Move Period Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === customPeriodTimings.length - 1}
                          onClick={() => handleMovePeriod(idx, 'down')}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-600 transition"
                          title="Move Period Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePeriod(idx)}
                          className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition ml-1"
                          title="Delete Period"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Changes will synchronize start and end times for all slots across the timetable.
              </span>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setIsPeriodCustomizerOpen(false)}>Cancel</Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveCustomPeriodTimings}
                  isLoading={isSavingCustomTimings}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Save & Apply Custom Period Timings
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 MODAL 2: SCHOOL TIMINGS & WORKING DAYS */}
      {isSettingsOpen && settings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  School Timings & Working Days Settings
                </h3>
                <p className="text-xs text-slate-300">
                  Configure bell schedule, period duration, daily working days, and break timings.
                </p>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* Working Days Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block uppercase tracking-wider">
                  Weekly Working Days
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => {
                    const isChecked = settings.workingDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          const updated = isChecked
                            ? settings.workingDays.filter(day => day !== d)
                            : [...settings.workingDays, d];
                          setSettings({ ...settings, workingDays: updated });
                        }}
                        className={`p-3 rounded-2xl border font-bold text-xs transition text-center ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {d.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* School Overall Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">School Start Time</label>
                  <input
                    type="text"
                    value={settings.schoolStartTime}
                    onChange={e => setSettings({ ...settings, schoolStartTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">School End Time</label>
                  <input
                    type="text"
                    value={settings.schoolEndTime}
                    onChange={e => setSettings({ ...settings, schoolEndTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Morning Assembly Start</label>
                  <input
                    type="text"
                    value={settings.assemblyStartTime}
                    onChange={e => setSettings({ ...settings, assemblyStartTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Morning Assembly End</label>
                  <input
                    type="text"
                    value={settings.assemblyEndTime}
                    onChange={e => setSettings({ ...settings, assemblyEndTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Period Timings Customizer Ribbon */}
              <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <strong className="text-xs font-black text-indigo-950 block">Individual Period Timings Customizer</strong>
                  <p className="text-[11px] text-indigo-800 mt-0.5">
                    Customize each period with different start/end times, durations, and break types.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    handleOpenPeriodCustomizer();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  ⏰ Open Period Customizer
                </Button>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSettings}
                isLoading={isSavingSettings}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Save School Timetable Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 MODAL 3: MOTHER TEACHER CONFIGURATION (PRE-NURSERY TO CLASS 2) */}
      {isMotherTeacherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-rose-950 text-white flex items-center justify-between">
              <div>
                <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-rose-500/30">
                  Early Years Mother Teacher Model
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Assign Mother Teacher for {selectedGrade} ({selectedSection})
                </h3>
                <p className="text-xs text-rose-200/80">
                  Mother teachers stay with early-grade children for major core foundational subjects.
                </p>
              </div>
              <button onClick={() => setIsMotherTeacherOpen(false)} className="text-rose-300 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Select Lead Mother Teacher (Faculty)
                </label>
                <select
                  value={selectedMtStaffId}
                  onChange={e => setSelectedMtStaffId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="">-- Choose Faculty Member --</option>
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.designation} - {f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block uppercase tracking-wider">
                  Core Subjects Taught by Mother Teacher
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STANDARD_SUBJECTS_EARLY.map(subj => {
                    const isChecked = selectedMtSubjects.includes(subj);
                    return (
                      <div
                        key={subj}
                        onClick={() => {
                          const updated = isChecked
                            ? selectedMtSubjects.filter(s => s !== subj)
                            : [...selectedMtSubjects, subj];
                          setSelectedMtSubjects(updated);
                        }}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                          isChecked
                            ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span className="text-xs">{subj}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-slate-600">
                <strong className="text-slate-900 block font-bold">ℹ️ How Specialist Subjects Work:</strong>
                <p className="text-[11px]">
                  Non-core subjects (Physical Education, Music, Computer, Yoga) will be taught by dedicated Specialist Faculty and scheduled into open periods without clashes.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsMotherTeacherOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveMotherTeacher}
                isLoading={isSavingMotherTeacher}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Save Mother Teacher Assignment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 MODAL 4: AUTO-GENERATE TIMETABLE */}
      {isAutoGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Auto-Generate Clash-Free Timetable
                </h3>
                <p className="text-xs text-slate-300">
                  Algorithmic timetable generator with Mother Teacher priority & zero faculty clash.
                </p>
              </div>
              <button onClick={() => setIsAutoGenerateOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Generation Scope</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAutoGenScope('SINGLE_CLASS')}
                    className={`p-3 rounded-2xl border text-center font-bold text-xs transition ${
                      autoGenScope === 'SINGLE_CLASS'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🎯 {selectedGrade} ({selectedSection}) Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoGenScope('ALL_CLASSES')}
                    className={`p-3 rounded-2xl border text-center font-bold text-xs transition ${
                      autoGenScope === 'ALL_CLASSES'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🏛️ Entire School (All Classes)
                  </button>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2 text-indigo-950">
                <span className="font-bold block flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Zero Clash Guarantee:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-indigo-900">
                  <li>Respects configured {workingDays.length} working days ({workingDays.join(', ')}).</li>
                  <li>Early grades (Pre-K to Gr 2) automatically assign the Mother Teacher to her chosen subjects.</li>
                  <li>Specialist faculty assigned to open periods without teacher overlap across sections.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsAutoGenerateOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteAutoGenerate}
                isLoading={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              >
                Generate Timetable
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 MODAL 5: EDIT SINGLE PERIOD SLOT WITH CONFLICT PROTECTION */}
      {isSlotModalOpen && editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  Edit Period {editingSlot.periodNumber} • {editingSlot.dayOfWeek}
                </h3>
                <p className="text-xs text-slate-300 font-mono">
                  {selectedGrade} ({selectedSection}) • {editingSlot.startTime} – {editingSlot.endTime} ({editingSlot.durationMinutes} mins)
                </p>
              </div>
              <button onClick={() => setIsSlotModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              {/* Conflict Alert Box */}
              {slotConflict && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-950 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-xs font-bold">Scheduling Conflict:</strong>
                    <p className="text-[11px] text-rose-800 mt-0.5">{slotConflict}</p>
                  </div>
                </div>
              )}

              {/* Subject Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Subject Name</label>
                <input
                  type="text"
                  value={editingSlot.subjectName}
                  onChange={e => setEditingSlot({ ...editingSlot, subjectName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  placeholder="e.g. Mathematics"
                />
              </div>

              {/* Teacher Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Assigned Faculty / Teacher</label>
                <select
                  value={editingSlot.teacherId}
                  onChange={e => {
                    const newTeacherId = e.target.value;
                    setEditingSlot({ ...editingSlot, teacherId: newTeacherId });
                    handleCheckConflict(newTeacherId, editingSlot.roomNumber);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="">-- Choose Teacher --</option>
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.designation} - {f.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Room Number / Lab</label>
                <input
                  type="text"
                  value={editingSlot.roomNumber}
                  onChange={e => {
                    const newRoom = e.target.value;
                    setEditingSlot({ ...editingSlot, roomNumber: newRoom });
                    handleCheckConflict(editingSlot.teacherId, newRoom);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  placeholder="e.g. Room 101, Science Lab"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsSlotModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSlot}
                isLoading={isSavingSlot}
                disabled={Boolean(slotConflict)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Save Period Slot
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Close GRID & SETTINGS tab wrapper */}
      </div>
      )}

    </div>
  );
}

export default function MasterTimetablePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500 font-bold">Loading Master Timetable Hub...</div>}>
      <MasterTimetableContent />
    </Suspense>
  );
}
