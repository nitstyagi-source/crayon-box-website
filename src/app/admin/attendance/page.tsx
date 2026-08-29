"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap, Calendar, CheckCircle2, XCircle, Clock,
  Save, RefreshCw, Users, ShieldCheck, Sparkles, Plus, AlertCircle, ArrowRight,
  UserCheck, AlertTriangle, HelpCircle, Check, X, FileText
} from 'lucide-react';
import {
  getSectionAttendanceRoster,
  submitDailyAttendanceAction,
  getInstitutionClassesAction,
  getAcademicStages,
  AttendanceEntry
} from '@/app/actions/attendance-actions';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInstitution } from '@/components/providers/InstitutionContext';

export default function DailyAttendancePage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [selectedInst, setSelectedInst] = useState<string>(currentInstitution === 'ALL' ? 'CBS' : currentInstitution);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>(['A', 'B', 'C']);
  const [selectedClass, setSelectedClass] = useState<string>('Class 1');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [roster, setRoster] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Sync with top header switcher
  useEffect(() => {
    const activeCode = currentInstitution === 'ALL' ? 'CBS' : currentInstitution;
    setSelectedInst(activeCode);
  }, [currentInstitution]);

  // Load available classes whenever institution changes
  useEffect(() => {
    const loadInstitutionClasses = async () => {
      const res = await getInstitutionClassesAction(selectedInst);
      if (res.success && res.classes && res.classes.length > 0) {
        // Natural sort classes (Pre-Nursery, Nursery, LKG, UKG, Class 1, Class 2...)
        const orderWeight = (name: string) => {
          if (name.toLowerCase().includes('pre-nursery')) return 0;
          if (name.toLowerCase().includes('nursery')) return 1;
          if (name.toLowerCase().includes('lkg')) return 2;
          if (name.toLowerCase().includes('ukg') || name.toLowerCase().includes('kindergarten')) return 3;
          const match = name.match(/\d+/);
          return match ? 10 + parseInt(match[0], 10) : 50;
        };

        const classList: string[] = res.classes as string[];
        const sorted: string[] = [...classList].sort((a: string, b: string) => orderWeight(a) - orderWeight(b));
        setAvailableClasses(sorted);
        if (res.sections && res.sections.length > 0) {
          setAvailableSections(res.sections as string[]);
        }

        // Set default class if current selection is not in list
        if (!sorted.includes(selectedClass)) {
          setSelectedClass(sorted[0]);
        }
      }
    };
    loadInstitutionClasses();
  }, [selectedInst]);

  const activeInstObj = VANI_TRUST_INSTITUTIONS.find(i => i.code === selectedInst) || VANI_TRUST_INSTITUTIONS[0];

  const fetchRoster = async () => {
    if (!selectedClass) return;
    setIsLoading(true);
    const res = await getSectionAttendanceRoster(selectedInst, selectedClass, selectedSection, selectedDate);
    if (res.success) {
      setRoster(res.students || []);
    } else {
      setRoster([]);
    }
    setIsLoading(false);
  };

  const fetchStages = async () => {
    const res = await getAcademicStages();
    if (res.success) setStages(res.data);
  };

  useEffect(() => {
    fetchStages();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchRoster();
    }
  }, [selectedInst, selectedClass, selectedSection, selectedDate]);

  const handleStatusChange = (studentId: string, newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY') => {
    setRoster(prev =>
      prev.map(s => (s.studentId === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRoster(prev =>
      prev.map(s => (s.studentId === studentId ? { ...s, remarks } : s))
    );
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setRoster(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSubmitAttendance = async () => {
    if (roster.length === 0) return;
    setIsSubmitting(true);
    const entries: AttendanceEntry[] = roster.map(s => ({
      studentId: s.studentId,
      status: s.status,
      remarks: s.remarks,
    }));

    const res = await submitDailyAttendanceAction(selectedInst, selectedClass, selectedSection, selectedDate, entries);
    if (res.success) {
      setSaveFeedback(`✅ Daily Attendance successfully saved for ${res.count} students on ${selectedDate}`);
      setTimeout(() => setSaveFeedback(null), 4000);
      fetchRoster();
    } else {
      alert('Error saving attendance: ' + (res.error || 'Unknown error'));
    }
    setIsSubmitting(false);
  };

  const presentCount = roster.filter(s => s.status === 'PRESENT').length;
  const absentCount = roster.filter(s => s.status === 'ABSENT').length;
  const lateCount = roster.filter(s => s.status === 'LATE').length;
  const halfDayCount = roster.filter(s => s.status === 'HALF_DAY').length;
  const attendanceRate = roster.length > 0 ? Math.round((presentCount / roster.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {activeInstObj.name} ({activeInstObj.code})
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {activeInstObj.institutionType === 'PRE_SCHOOL' ? 'Early Childhood Daily Attendance' : 'K-12 Daily Roll Call'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-emerald-400" />
            {activeInstObj.name} Daily Attendance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            1-tap classroom muster roll marking with instant synchronization to PostgreSQL student records and parent notifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/admin/attendance/leaves">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-emerald-950/80 text-emerald-200 border-emerald-700/80 hover:bg-emerald-900 text-xs font-bold"
              leftIcon={<FileText className="w-3.5 h-3.5 text-emerald-400" />}
            >
              📝 Leave Approvals
            </Button>
          </Link>
          <Link href="/admin/gate-scanner">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-indigo-950/80 text-indigo-200 border-indigo-700/80 hover:bg-indigo-900 text-xs font-bold"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />}
            >
              🚪 Gate Entry/Exit Scanner
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRoster} 
            isLoading={isLoading} 
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Roster
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmitAttendance}
            isLoading={isSubmitting}
            disabled={roster.length === 0}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 text-xs"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Save Feedback Banner */}
      {saveFeedback && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveFeedback}</span>
          </div>
          <button onClick={() => setSaveFeedback(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Filter Ribbon: School + Dynamic Class Dropdown + Section + Date */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Select
          label="Operating Institution"
          options={[
            { value: 'CBS', label: 'Crayon Box International School (CBS)' },
            { value: 'AVM', label: 'Avinya Vidya Mandir (AVM)' },
            { value: 'AS', label: 'Avinya School (AS)' },
            { value: 'CBPS', label: 'Crayon Box Pre School (CBPS)' },
          ]}
          value={selectedInst}
          onChange={(e) => setSelectedInst(e.target.value)}
        />

        <Select
          label="Class / Grade"
          options={availableClasses.map(c => ({ value: c, label: c }))}
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        />

        <Select
          label="Section"
          options={availableSections.map(s => ({ value: s, label: `Section ${s}` }))}
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        />

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Attendance Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Roster Metric Summary */}
      {roster.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Enrolled</span>
            <p className="text-2xl font-black text-slate-900">{roster.length}</p>
            <span className="text-[10px] text-slate-500 font-semibold">{selectedClass} ({selectedSection})</span>
          </div>

          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Present</span>
            <p className="text-2xl font-black text-emerald-700">{presentCount}</p>
            <span className="text-[10px] text-emerald-800/80 font-semibold">{attendanceRate}% Present</span>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Late Arrival</span>
            <p className="text-2xl font-black text-amber-700">{lateCount}</p>
            <span className="text-[10px] text-amber-800/80 font-semibold">Tardy Students</span>
          </div>

          <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">Absent</span>
            <p className="text-2xl font-black text-rose-700">{absentCount}</p>
            <span className="text-[10px] text-rose-800/80 font-semibold">Parent SMS Alert</span>
          </div>

          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">Half Day</span>
            <p className="text-2xl font-black text-blue-700">{halfDayCount}</p>
            <span className="text-[10px] text-blue-800/80 font-semibold">Partial Attendance</span>
          </div>
        </div>
      )}

      {/* Quick Mark All Ribbon */}
      {roster.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Quick Batch Actions:</span>
            <span className="text-slate-400">Mark all students with 1 tap:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              type="button" 
              onClick={() => handleMarkAll('PRESENT')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> All Present
            </button>
            <button 
              type="button" 
              onClick={() => handleMarkAll('ABSENT')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold border border-rose-200 transition flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> All Absent
            </button>
            <button 
              type="button" 
              onClick={() => handleMarkAll('LATE')}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" /> All Late
            </button>
          </div>
        </div>
      )}

      {/* Roster Table or Clean Empty State */}
      {roster.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-slate-400" />}
          title={`No Students Enrolled in ${selectedInst} • ${selectedClass} (${selectedSection})`}
          description={`Your database currently has 0 active enrollments for ${selectedClass} (${selectedSection}) in ${activeInstObj.name}. Try selecting another class or section above.`}
          actionLabel="Go to Students Master"
          onAction={() => window.location.href = '/admin/students'}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Daily Roll Call Roster:</span>
                <span className="font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-xs">
                  {selectedInst} • {selectedClass} - Section {selectedSection}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Mark each student Present, Late, Absent, or Half Day with optional teacher notes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                📅 {selectedDate}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5 w-16">Roll #</th>
                  <th className="py-3 px-5">Student Information</th>
                  <th className="py-3 px-5">Admission #</th>
                  <th className="py-3 px-5 text-center">Daily Status</th>
                  <th className="py-3 px-5">Teacher Remarks / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {roster.map((student) => (
                  <tr key={student.studentId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-500">
                      #{student.rollNo}
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <strong className="font-bold text-slate-900 block text-xs sm:text-sm">{student.name}</strong>
                          <span className="text-[10px] text-slate-400 font-medium">{student.gender} • {student.className}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-slate-500 text-xs">
                      {student.admissionNo}
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.studentId, 'PRESENT')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            student.status === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.studentId, 'LATE')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            student.status === 'LATE'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.studentId, 'HALF_DAY')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            student.status === 'HALF_DAY'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Half Day
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.studentId, 'ABSENT')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            student.status === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. medical leave)..."
                        value={student.remarks || ''}
                        onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Showing {roster.length} students enrolled in {selectedClass} ({selectedSection}).
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitAttendance}
              isLoading={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Attendance Record
            </Button>
          </div>
        </div>
      )}

      {/* 5 Adaptive Academic Stages Radar */}
      <div className="space-y-3 pt-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" /> 5-Stage Adaptive Academic Architecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {stages.map((stg) => (
            <Card key={stg.code} padding="sm" className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                {stg.code}
              </span>
              <h4 className="text-xs font-bold text-slate-900">{stg.name}</h4>
              <p className="text-[11px] text-slate-500 font-medium">{stg.grade_range}</p>
              <span className="inline-block text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                {stg.assessment_model}
              </span>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
