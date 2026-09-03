"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Shuffle, Users, UserCheck, AlertTriangle, Clock,
  ArrowRight, ArrowLeft, RefreshCw, Sparkles, CheckCircle2,
  Calendar, Building2, BookOpen, Printer, Send, ShieldAlert,
  ChevronRight, Check, X, FileText, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getDailySubstitutionsDashboardAction,
  assignTeacherSubstitutionAction,
  autoAssignAllSubstitutionsAction
} from '@/app/actions/faculty-substitution-actions';

export function FacultySubstitutionEngineDesk() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [data, setData] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    totalAbsentToday: 0,
    totalVacantPeriods: 0,
    assignedCount: 0,
    uncoveredCount: 0,
  });
  const [absentStaffList, setAbsentStaffList] = useState<any[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<string>('Monday');
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Selected Period for manual assignment modal
  const [activeSlot, setActiveSlot] = useState<any | null>(null);
  const [selectedProxyId, setSelectedProxyId] = useState<string>('');
  const [isAssigningSingle, setIsAssigningSingle] = useState(false);

  // Printable Proxy Slip Modal
  const [slipModalItem, setSlipModalItem] = useState<any | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    const res = await getDailySubstitutionsDashboardAction({
      date: selectedDate,
      institutionCode: currentInstitution,
    });
    if (res.success) {
      setData(res.data || []);
      setCounts(res.counts || { totalAbsentToday: 0, totalVacantPeriods: 0, assignedCount: 0, uncoveredCount: 0 });
      setAbsentStaffList(res.absentStaffList || []);
      setDayOfWeek(res.dayOfWeek || 'Monday');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentInstitution, selectedDate]);

  // Handle 1-Click Auto-Assign All
  const handleAutoAssignAll = async () => {
    setIsAutoAssigning(true);
    const res = await autoAssignAllSubstitutionsAction({
      date: selectedDate,
      institutionCode: currentInstitution,
    });
    setIsAutoAssigning(false);
    if (res.success) {
      setFeedbackMessage(res.message || 'Auto-substitution complete!');
      fetchDashboard();
    }
  };

  // Handle Assign Single Substitution
  const handleAssignSingleProxy = async (slot: any, proxyTeacherId: string) => {
    setIsAssigningSingle(true);
    const res = await assignTeacherSubstitutionAction({
      date: selectedDate,
      absentStaffId: slot.absentStaff.id,
      substituteStaffId: proxyTeacherId,
      periodNumber: slot.periodNumber,
      className: slot.className,
      sectionName: slot.sectionName,
      subjectName: slot.subjectName,
      reason: 'Morning Proxy Assignment via Substitution Engine',
    });
    setIsAssigningSingle(false);
    setActiveSlot(null);
    if (res.success) {
      setFeedbackMessage(res.message || 'Substitution assigned!');
      fetchDashboard();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              Automated Teacher Substitution Engine
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Shuffle className="w-8 h-8 text-amber-400" />
            Proxy Teacher & Timetable Conflict Resolver
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Scans morning staff attendance logs, detects vacant timetable periods, and automatically matches free proxy teachers with zero scheduling conflicts.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAutoAssignAll}
            isLoading={isAutoAssigning}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20"
            leftIcon={<Zap className="w-4 h-4" />}
          >
            ⚡ Auto-Assign All ({counts.uncoveredCount} Slots)
          </Button>

          <Link href="/admin/timetable">
            <Button variant="outline" size="sm" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700" leftIcon={<Clock className="w-4 h-4" />}>
              Full Master Timetable
            </Button>
          </Link>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Absent Faculty Today</span>
            <span className="text-3xl font-black text-rose-600 mt-1 block">{counts.totalAbsentToday}</span>
            <span className="text-[11px] text-rose-700 font-bold">On Leave / Late / Absent</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Vacant Class Periods</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{counts.totalVacantPeriods}</span>
            <span className="text-[11px] text-slate-500 font-semibold">{dayOfWeek} Schedule</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Substitutions Covered</span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">{counts.assignedCount}</span>
            <span className="text-[11px] text-emerald-700 font-bold">Proxy Assigned</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Uncovered Slots</span>
            <span className="text-3xl font-black text-amber-600 mt-1 block">{counts.uncoveredCount}</span>
            <span className="text-[11px] text-amber-700 font-bold">Action Required</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Date & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-56">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl">
            📅 Operating Day: <strong className="text-slate-900">{dayOfWeek}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchDashboard} isLoading={isLoading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Matrix
          </Button>
        </div>
      </div>

      {/* 🌟 VACANT PERIODS & SUBSTITUTION MATRIX */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Vacant Class Periods & Smart Recommendations ({data.length})
            </h3>
            <p className="text-xs text-slate-500">
              Matched based on free period slots, subject specialization, and daily teaching load.
            </p>
          </div>
        </div>

        {data.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-10 h-10 text-emerald-500" />}
            title="All Timetable Slots Are Fully Covered!"
            description="No faculty members are marked absent or on leave for this operating date."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((slot, idx) => {
              const isAssigned = slot.assignedSubstitution !== null;
              return (
                <div
                  key={slot.slotId || idx}
                  className={`bg-white rounded-3xl border shadow-xs overflow-hidden transition ${
                    isAssigned ? 'border-emerald-200/80 bg-emerald-50/10' : 'border-amber-200/90'
                  }`}
                >
                  
                  {/* Card Header Bar */}
                  <div className={`p-4 border-b flex items-center justify-between ${
                    isAssigned ? 'bg-emerald-50/60 border-emerald-100 text-emerald-950' : 'bg-amber-50/60 border-amber-100 text-amber-950'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md font-black text-xs uppercase tracking-wider bg-white shadow-2xs">
                        {slot.periodLabel}
                      </span>
                      <span className="text-xs font-mono font-bold">
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isAssigned ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {isAssigned ? '✓ Proxy Assigned' : '⚠️ Uncovered'}
                    </span>
                  </div>

                  {/* Period Details */}
                  <div className="p-5 space-y-4 text-xs">
                    
                    {/* Class & Subject */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class & Subject</span>
                        <h4 className="font-black text-slate-900 text-sm">
                          {slot.className} ({slot.sectionName}) • <span className="text-indigo-600">{slot.subjectName}</span>
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">{slot.roomNumber}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled Faculty</span>
                        <strong className="text-rose-700 block font-bold">{slot.absentStaff.name}</strong>
                        <span className="text-[10px] text-rose-600 font-medium">({slot.absentStaff.department})</span>
                      </div>
                    </div>

                    {/* ASSIGNED PROXY SECTION */}
                    {isAssigned ? (
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-emerald-800 block">Assigned Proxy Faculty</span>
                          <strong className="text-emerald-950 text-xs block font-extrabold">
                            {slot.assignedSubstitution.substituteName}
                          </strong>
                          <span className="text-[10px] text-emerald-700">{slot.assignedSubstitution.substituteDepartment}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSlipModalItem(slot)}
                          className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-[11px]"
                          leftIcon={<Printer className="w-3.5 h-3.5" />}
                        >
                          Print Slip
                        </Button>
                      </div>
                    ) : (
                      /* SMART CANDIDATE RECOMMENDATIONS */
                      <div className="space-y-2 pt-1 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Recommended Free Teachers (No Conflict)
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {slot.topRecommendations?.slice(0, 2).map((cand: any, cIdx: number) => (
                            <div
                              key={cand.id}
                              className="p-2.5 bg-slate-50 hover:bg-indigo-50/60 rounded-xl border border-slate-200 hover:border-indigo-300 transition flex items-center justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <strong className="text-slate-900">{cand.name}</strong>
                                  {cand.isSameDept && (
                                    <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[9px] font-extrabold">
                                      Same Dept
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500">
                                  {cand.designation} • Today Load: <strong>{cand.dailyPeriodsCount} / 8</strong>
                                </span>
                              </div>

                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleAssignSingleProxy(slot, cand.id)}
                                className="text-[11px] py-1 px-3 bg-indigo-600 hover:bg-indigo-500"
                              >
                                Assign
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🌟 DIGITAL PROXY SLIP MODAL */}
      {slipModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200 text-slate-900 font-sans">
            
            {/* Slip Header */}
            <div className="border-b border-slate-200 pb-4 text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-sm uppercase tracking-wider">
                  {selectedInstitutionObj?.name || 'CRAYON BOX SCHOOL'}
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block">
                OFFICIAL PROXY / SUBSTITUTION SLIP
              </span>
              <p className="text-[11px] text-slate-500">
                Date: <strong>{selectedDate} ({dayOfWeek})</strong> • Session: 2026–2027
              </p>
            </div>

            {/* Slip Body */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] block">Assigned Substitute</span>
                  <strong className="text-slate-900 text-sm">{slipModalItem.assignedSubstitution?.substituteName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Regular Faculty On Leave</span>
                  <strong className="text-rose-700 text-sm">{slipModalItem.absentStaff.name}</strong>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block">Class / Section</span>
                  <strong className="text-slate-900">{slipModalItem.className} ({slipModalItem.sectionName})</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Period Slot</span>
                  <strong className="text-slate-900">{slipModalItem.periodLabel}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Time</span>
                  <strong className="font-mono text-slate-900">{slipModalItem.startTime} – {slipModalItem.endTime}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 text-[10px] block">Subject / Instructions</span>
                <strong className="text-indigo-700 font-bold block">{slipModalItem.subjectName}</strong>
                <p className="text-[11px] text-slate-600 italic mt-0.5">
                  "Please maintain classroom discipline and oversee student curriculum revision."
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 pt-4 text-center text-[10px] text-slate-500 font-bold">
              <div>
                <div className="h-6 border-b border-dashed border-slate-400 mb-1" />
                <span>Substitute Faculty Signature</span>
              </div>
              <div>
                <div className="h-6 border-b border-dashed border-slate-400 mb-1" />
                <span>Academic Dean / Principal</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSlipModalItem(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                Print Official Slip
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function FacultySubstitutionEnginePage() {
  redirect('/admin/timetable?tab=substitutions');
}
