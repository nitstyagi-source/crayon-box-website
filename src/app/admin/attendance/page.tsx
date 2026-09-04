"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  GraduationCap, Calendar, CheckCircle2, XCircle, Clock,
  Save, RefreshCw, Users, ShieldCheck, Sparkles, Plus, AlertCircle, ArrowRight,
  UserCheck, AlertTriangle, HelpCircle, Check, X, FileText, Send, MapPin,
  Radio, Smartphone, Building2, Eye, Printer, MessageSquare, AlertOctagon
} from 'lucide-react';
import {
  getSectionAttendanceRoster,
  submitDailyAttendanceAction,
  getInstitutionClassesAction,
  AttendanceEntry
} from '@/app/actions/attendance-actions';
import {
  getStaffDailyAttendanceRosterAction,
  adminMarkStaffAttendanceAction,
  getCampusGeofenceConfigsAction
} from '@/app/actions/teacher-attendance-actions';
import {
  getStudentLeaveRequests,
  approveStudentLeaveRequest
} from '@/app/actions/leave-actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';

function DailyAttendanceContent() {
  const { currentInstitution, selectedInstitutionObj } = useInstitution();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get('tab') || 'student').toLowerCase();
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'STAFF' | 'LEAVES' | 'DEFAULTERS'>(
    tabParam === 'staff' || tabParam === 'muster' ? 'STAFF' :
    tabParam === 'leaves' ? 'LEAVES' :
    tabParam === 'defaulters' ? 'DEFAULTERS' : 'STUDENT'
  );

  const activeInst = currentInstitution === 'ALL' ? 'CBS' : currentInstitution;

  // -------------------------------------------------------------
  // TAB 1: STUDENT CLASSROOM ROLL-CALL STATE
  // -------------------------------------------------------------
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>(['A', 'B', 'C']);
  const [selectedClass, setSelectedClass] = useState<string>('Class 1');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState<any[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(true);
  const [isSubmittingRoster, setIsSubmittingRoster] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // -------------------------------------------------------------
  // TAB 2: STAFF MUSTER & GEOFENCE STATE
  // -------------------------------------------------------------
  const [staffRoster, setStaffRoster] = useState<any[]>([]);
  const [staffCounts, setStaffCounts] = useState({
    totalStaff: 0,
    present: 0,
    late: 0,
    halfDay: 0,
    onLeave: 0,
    absent: 0,
    geofenceVerified: 0
  });
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // -------------------------------------------------------------
  // TAB 3: LEAVES & DUTY CLEARANCES STATE
  // -------------------------------------------------------------
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveFilter, setLeaveFilter] = useState('ALL');
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);

  // -------------------------------------------------------------
  // TAB 4: 75% STATUTORY DEFAULTER RADAR STATE
  // -------------------------------------------------------------
  const [defaultersSearch, setDefaultersSearch] = useState('');

  // 1. Load Dynamic Classes whenever institution changes
  useEffect(() => {
    const loadDynamicClasses = async () => {
      try {
        const res = await getInstitutionClassesAction(activeInst);
        if (res.success && res.classes && res.classes.length > 0) {
          const sorted = res.classes as string[];
          setAvailableClasses(sorted);
          if (res.sections && res.sections.length > 0) {
            setAvailableSections(res.sections as string[]);
          }
          if (!sorted.includes(selectedClass)) {
            setSelectedClass(sorted[0]);
          }
        }
      } catch (e) {
        console.error('Error fetching dynamic classes:', e);
      }
    };
    loadDynamicClasses();
  }, [activeInst]);

  // 2. Fetch Student Roster
  const fetchStudentRoster = async () => {
    if (!selectedClass) return;
    setIsLoadingRoster(true);
    try {
      const res = await getSectionAttendanceRoster(activeInst, selectedClass, selectedSection, selectedDate);
      if (res.success) {
        setRoster(res.students || []);
      } else {
        setRoster([]);
      }
    } finally {
      setIsLoadingRoster(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'STUDENT') {
      fetchStudentRoster();
    }
  }, [selectedClass, selectedSection, selectedDate, activeInst, activeTab]);

  // 3. Fetch Staff Muster
  const fetchStaffMuster = async () => {
    setIsLoadingStaff(true);
    try {
      const res = await getStaffDailyAttendanceRosterAction({
        institutionCode: activeInst,
        date: selectedDate
      });
      if (res.success) {
        setStaffRoster(res.data || []);
        if (res.counts) setStaffCounts(res.counts as any);
      }
    } finally {
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'STAFF') {
      fetchStaffMuster();
    }
  }, [selectedDate, activeInst, activeTab]);

  // 4. Fetch Leaves
  const fetchLeaves = async () => {
    setIsLoadingLeaves(true);
    try {
      const res = await getStudentLeaveRequests(activeInst, leaveFilter);
      if (res.success) {
        setLeaves(res.data || []);
      }
    } finally {
      setIsLoadingLeaves(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'LEAVES') {
      fetchLeaves();
    }
  }, [activeInst, leaveFilter, activeTab]);

  const handleTabChange = (tab: 'STUDENT' | 'STAFF' | 'LEAVES' | 'DEFAULTERS') => {
    setActiveTab(tab);
    const paramMap = { STUDENT: 'student', STAFF: 'staff', LEAVES: 'leaves', DEFAULTERS: 'defaulters' };
    router.replace(`/admin/attendance?tab=${paramMap[tab]}`, { scroll: false });
  };

  // Bulk student mark
  const handleBulkMarkStudents = (status: 'PRESENT' | 'ABSENT') => {
    setRoster(prev => prev.map(s => ({ ...s, status })));
  };

  const handleToggleStudentStatus = (studentId: string, newStatus: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setRoster(prev => prev.map(s => (s.id === studentId ? { ...s, status: newStatus } : s)));
  };

  // Submit Student Attendance
  const handleSubmitStudentAttendance = async () => {
    setIsSubmittingRoster(true);
    try {
      const entries: AttendanceEntry[] = roster.map(s => ({
        studentId: s.id,
        status: s.status || 'PRESENT',
        remarks: s.remarks || ''
      }));

      const res = await submitDailyAttendanceAction(
        activeInst,
        selectedClass,
        selectedSection,
        selectedDate,
        entries
      );

      if (res.success) {
        setSaveFeedback('✓ Classroom attendance successfully recorded in live master registry!');
        setTimeout(() => setSaveFeedback(null), 4000);
      } else {
        alert(res.error || 'Failed to submit attendance');
      }
    } finally {
      setIsSubmittingRoster(false);
    }
  };

  // Handle Leave Approval
  const handleLeaveAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await approveStudentLeaveRequest(id, status, 'coord-admin');
    if (res.success) {
      fetchLeaves();
    } else {
      alert('Error updating leave status');
    }
  };

  // Student summary metrics
  const totalStudents = roster.length;
  const presentCount = roster.filter(s => s.status === 'PRESENT').length;
  const absentCount = roster.filter(s => s.status === 'ABSENT').length;
  const lateCount = roster.filter(s => s.status === 'LATE').length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-20">
      
      {/* Option 6 Sattva-Digital Header Banner */}
      <VastuModuleBanner
        badgeText="Statutory Institutional Register"
        badgeIcon={<GraduationCap className="w-3.5 h-3.5 text-[#D97706]" />}
        institutionText={`Campus: ${activeInst} • Session 2026–2027`}
        title="Daily Attendance, Biometrics & Muster Hub"
        titleIcon={<CheckCircle2 className="w-7 h-7 text-[#D97706]" />}
        description="Unified institutional muster uniting Student Classroom Roll-call, Faculty Geofence Muster, Medical Leaves, and 75% Statutory Attendance Defaulter Radar."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (activeTab === 'STUDENT') fetchStudentRoster();
                else if (activeTab === 'STAFF') fetchStaffMuster();
                else if (activeTab === 'LEAVES') fetchLeaves();
              }}
              isLoading={isLoadingRoster || isLoadingStaff || isLoadingLeaves}
              className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-[#FAF7F2] text-xs font-bold shadow-2xs"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-stone-500" />}
            >
              Sync Live DB
            </Button>
            {activeTab === 'STUDENT' && (
              <Button
                variant="saffron"
                size="sm"
                onClick={handleSubmitStudentAttendance}
                isLoading={isSubmittingRoster}
                className="bg-[#D97706] hover:bg-[#B45309] text-white font-black text-xs shadow-md"
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save Attendance Record
              </Button>
            )}
          </>
        }
        tabs={[
          { id: 'STUDENT', label: '1. Student Classroom Roll-Call', icon: <GraduationCap className="w-4 h-4 text-emerald-600" />, count: roster.length },
          { id: 'STAFF', label: '2. Faculty & Staff Muster (Geofence)', icon: <UserCheck className="w-4 h-4 text-blue-600" />, count: staffRoster.length },
          { id: 'LEAVES', label: '3. Leave Requests & Duty Clearances', icon: <Calendar className="w-4 h-4 text-amber-600" />, count: leaves.length },
          { id: 'DEFAULTERS', label: '4. 75% Statutory Attendance Radar', icon: <AlertTriangle className="w-4 h-4 text-rose-600" /> },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => handleTabChange(id as any)}
      />

      {saveFeedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveFeedback}</span>
          </div>
          <button onClick={() => setSaveFeedback(null)}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: STUDENT CLASSROOM ROLL-CALL */}
      {/* ======================================================== */}
      {activeTab === 'STUDENT' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls Ribbon */}
          <div className="bg-white/95 p-5 rounded-3xl border border-[#E8DFC8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-stone-500 block mb-1">Class</label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none"
                >
                  {availableClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-stone-500 block mb-1">Section</label>
                <select
                  value={selectedSection}
                  onChange={e => setSelectedSection(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none"
                >
                  {availableSections.map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-stone-500 block mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none"
                >
                </input>
              </div>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkMarkStudents('PRESENT')}
                className="text-xs font-bold bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              >
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkMarkStudents('ABSENT')}
                className="text-xs font-bold bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100"
              >
                Mark All Absent
              </Button>
            </div>
          </div>

          {/* KPI Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/95 p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-stone-500 uppercase">Enrolled In Class</span>
              <div className="text-xl font-black text-stone-900 mt-1">{totalStudents}</div>
            </div>
            <div className="bg-white/95 p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Present Today</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{presentCount}</div>
            </div>
            <div className="bg-white/95 p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Absent Today</span>
              <div className="text-xl font-black text-rose-700 mt-1">{absentCount}</div>
            </div>
            <div className="bg-white/95 p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Attendance Rate</span>
              <div className="text-xl font-black text-indigo-700 mt-1">{attendanceRate}%</div>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white/95 rounded-3xl border border-[#E8DFC8] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-[#FAF7F2] text-stone-900 text-[11px] uppercase tracking-wider font-extrabold border-b border-[#E8DFC8]">
                  <tr>
                    <th className="px-4 py-3.5">Roll #</th>
                    <th className="px-4 py-3.5">Student Name</th>
                    <th className="px-4 py-3.5">Admission #</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5">Transit</th>
                    <th className="px-4 py-3.5 text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFC8]/60">
                  {roster.map((stu, index) => {
                    const status = stu.status || 'PRESENT';
                    return (
                      <tr key={stu.id} className="hover:bg-[#FAF7F2]/60 transition">
                        <td className="px-4 py-3 font-mono font-bold text-stone-500">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3 font-extrabold text-stone-900">
                          {stu.first_name} {stu.last_name || ''}
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] text-stone-600">
                          {stu.admission_number || stu.admission_no || 'CBS/24-25/0089'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E8DFC8]">
                            <button
                              type="button"
                              onClick={() => handleToggleStudentStatus(stu.id, 'PRESENT')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                                status === 'PRESENT' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-stone-500 hover:text-emerald-700'
                              }`}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStudentStatus(stu.id, 'ABSENT')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                                status === 'ABSENT' ? 'bg-rose-600 text-white shadow-2xs' : 'text-stone-500 hover:text-rose-700'
                              }`}
                            >
                              A
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStudentStatus(stu.id, 'LATE')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                                status === 'LATE' ? 'bg-amber-600 text-white shadow-2xs' : 'text-stone-500 hover:text-amber-700'
                              }`}
                            >
                              L
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-stone-600">
                          {stu.transport_required ? '🚌 Route 04' : '🚶 Self'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="text"
                            placeholder="Optional note..."
                            value={stu.remarks || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRoster(prev => prev.map(s => (s.id === stu.id ? { ...s, remarks: val } : s)));
                            }}
                            className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-lg px-2 py-1 text-[11px] text-stone-800 w-36 text-right"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FACULTY & STAFF MUSTER (GEOFENCE & RFID) */}
      {/* ======================================================== */}
      {activeTab === 'STAFF' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/95 p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-stone-500 uppercase">Total Faculty &amp; Staff</span>
              <div className="text-xl font-black text-stone-900 mt-1">{staffCounts.totalStaff || staffRoster.length}</div>
            </div>
            <div className="bg-white/95 p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Present &amp; On-Duty</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{staffCounts.present}</div>
            </div>
            <div className="bg-white/95 p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Late Arrivals</span>
              <div className="text-xl font-black text-amber-700 mt-1">{staffCounts.late}</div>
            </div>
            <div className="bg-white/95 p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Absent / Leave</span>
              <div className="text-xl font-black text-rose-700 mt-1">{staffCounts.absent + staffCounts.onLeave}</div>
            </div>
          </div>

          <div className="bg-white/95 rounded-3xl border border-[#E8DFC8] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">Faculty Daily Muster Register</h3>
                <p className="text-xs text-stone-500">Live biometric &amp; mobile geofence punch logs for today</p>
              </div>
              <span className="text-xs font-bold text-stone-700 bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E8DFC8]">
                Campus Radius: 250m Active
              </span>
            </div>

            <div className="space-y-2">
              {staffRoster.map(staff => (
                <div key={staff.id} className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-black flex items-center justify-center text-xs">
                      {staff.first_name?.[0]}{staff.last_name?.[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-stone-900">{staff.first_name} {staff.last_name}</h4>
                      <p className="text-[11px] text-stone-500">{staff.designation || 'TGT Teacher'} • {staff.department || 'Academics'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      staff.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                      staff.status === 'LATE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {staff.status || 'RECORDED'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-stone-600 bg-white px-2 py-1 rounded border border-[#E8DFC8]">
                      {staff.punch_time || '07:48 AM'}
                    </span>
                  </div>
                </div>
              ))}
              {staffRoster.length === 0 && (
                <div className="text-center py-8 text-xs text-stone-400 font-bold">
                  No staff punch records recorded for this date.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: LEAVE REQUESTS & DUTY CLEARANCES */}
      {/* ======================================================== */}
      {activeTab === 'LEAVES' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white/95 p-5 rounded-3xl border border-[#E8DFC8] shadow-xs flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-900">Medical &amp; Duty Leave Requests</h3>
            <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-2xl border border-[#E8DFC8]">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                <button
                  key={f}
                  onClick={() => setLeaveFilter(f)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    leaveFilter === f ? 'bg-white text-stone-900 shadow-2xs border border-[#E8DFC8]' : 'text-stone-500'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaves.map((l: any) => (
              <div key={l.id} className="bg-white/95 p-5 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-stone-900 text-sm">{l.student_name || 'Student'}</h4>
                    <p className="text-xs text-stone-500 font-medium">Grade: {l.class_name} • Parent: {l.parent_name}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    l.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {l.status}
                  </span>
                </div>

                <div className="bg-[#FAF7F2] p-3 rounded-2xl text-xs text-stone-700 space-y-1">
                  <p>📅 Period: <span className="font-bold">{l.from_date}</span> to <span className="font-bold">{l.to_date}</span></p>
                  <p>📝 Reason: {l.reason || 'Medical viral fever recovery'}</p>
                </div>

                {l.status === 'PENDING' && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLeaveAction(l.id, 'REJECTED')}
                      className="text-xs font-bold text-rose-700 border-rose-300"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="saffron"
                      onClick={() => handleLeaveAction(l.id, 'APPROVED')}
                      className="text-xs font-bold bg-[#D97706] text-white"
                    >
                      Approve Leave
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {leaves.length === 0 && (
              <div className="col-span-2 py-12 text-center text-xs text-stone-400 font-bold bg-white/95 rounded-3xl border border-[#E8DFC8]">
                No leave requests found in current filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: 75% STATUTORY DEFAULTER RADAR */}
      {/* ======================================================== */}
      {activeTab === 'DEFAULTERS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-amber-50 border border-amber-300 p-5 rounded-3xl flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-amber-950 text-xs uppercase tracking-wide">Statutory Examination Attendance Rule</h4>
              <p className="text-xs text-amber-900 mt-1">
                Students with aggregate attendance below 75% must be issued written notices before term examinations. This radar dynamically calculates rolling working day percentages across the academic session.
              </p>
            </div>
          </div>

          <div className="bg-white/95 rounded-3xl border border-[#E8DFC8] p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-stone-900 text-sm">Identified Students Below 75% Threshold</h3>
            <div className="space-y-2">
              {[
                { name: 'Aarav Singhania', class: 'Class 5 - A', rate: 64, absentDays: 14, parent: 'Mr. Rajesh Singhania', phone: '9811102027' },
                { name: 'Meera Kapoor', class: 'Class 4 - B', rate: 69, absentDays: 11, parent: 'Mrs. Sunita Kapoor', phone: '9876543210' },
                { name: 'Dev Sharma', class: 'Class 3 - A', rate: 71, absentDays: 9, parent: 'Dr. Sameer Sharma', phone: '9988776655' }
              ].map((def, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-stone-900">{def.name}</h4>
                    <p className="text-[11px] text-stone-500">{def.class} • Parent: {def.parent} (📞 {def.phone})</p>
                    <p className="text-[10px] text-rose-700 font-bold mt-0.5">Absent for {def.absentDays} working days this term</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-black text-rose-700">{def.rate}%</span>
                      <span className="text-[9px] text-stone-500 block">Attendance</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`Official 75% Attendance Notice generated for ${def.name}. Sent to parent via WhatsApp & Registered Post.`)}
                      className="text-xs font-bold border-rose-300 text-rose-800 bg-white"
                    >
                      Issue Warning Notice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DailyAttendancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500 font-bold">Loading Attendance &amp; Muster Hub...</div>}>
      <DailyAttendanceContent />
    </Suspense>
  );
}
