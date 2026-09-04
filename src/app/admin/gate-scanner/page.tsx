"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  QrCode, ScanLine, ShieldCheck, UserCheck, AlertTriangle,
  Clock, ArrowRight, ArrowLeft, RefreshCw, Sparkles, CheckCircle2,
  Phone, Users, Bus, Building2, Eye, Printer, Send, Zap, Volume2, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  recordStudentGateScanAction,
  getTodayGateAttendanceLogsAction,
  GateScanResult
} from '@/app/actions/gate-attendance-actions';
import { getFilteredUniversalStudentsAction } from '@/app/actions/universal-student-actions';
import { OfflineAttendanceIndicator } from '@/components/attendance/OfflineAttendanceIndicator';

export default function GateAttendanceScannerPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [scanInput, setScanInput] = useState('');
  const [scanType, setScanType] = useState<'AUTO' | 'ENTRY' | 'EXIT'>('AUTO');
  const [selectedGate, setSelectedGate] = useState('Gate 1 — Main Campus Entrance');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<GateScanResult | null>(null);

  // Today's logs state
  const [logs, setLogs] = useState<any[]>([]);
  const [counts, setCounts] = useState({ totalScanned: 0, inCampus: 0, exited: 0 });
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // Quick students list for 1-click test scan
  const [quickStudents, setQuickStudents] = useState<any[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchTodayLogs = async () => {
    setIsLoadingLogs(true);
    const res = await getTodayGateAttendanceLogsAction({
      institutionCode: currentInstitution,
    });
    if (res.success) {
      setLogs(res.data || []);
      setCounts(res.counts || { totalScanned: 0, inCampus: 0, exited: 0 });
    }
    setIsLoadingLogs(false);
  };

  const fetchQuickStudents = async () => {
    const res = await getFilteredUniversalStudentsAction({
      institutionCode: currentInstitution === 'ALL' ? 'CBS' : currentInstitution,
    });
    if (res.success) {
      setQuickStudents(res.data?.slice(0, 8) || []);
    }
  };

  useEffect(() => {
    fetchTodayLogs();
    fetchQuickStudents();
    inputRef.current?.focus();
  }, [currentInstitution]);

  const handleExecuteScan = async (scannedRaw: string) => {
    if (!scannedRaw.trim()) return;
    setIsScanning(true);

    const res = await recordStudentGateScanAction({
      qrRawText: scannedRaw.trim(),
      scanType,
      gateName: selectedGate,
    });

    setLastScanResult(res);
    setScanInput('');
    setIsScanning(false);

    if (res.success) {
      fetchTodayLogs();
    }

    // Keep focus on input for next continuous barcode scanner scan
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteScan(scanInput);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Security Telematics Gate Scanner
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Campus Gates' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ScanLine className="w-8 h-8 text-indigo-400" />
            Smart QR Gate Attendance Scanner
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Scan unique student ID cards to record entry and exit timestamps, log campus presence, and trigger automated parent alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <OfflineAttendanceIndicator />
          <Link href="/admin/id-cards">
            <Button variant="outline" size="sm" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700" leftIcon={<Printer className="w-3.5 h-3.5" />}>
              Generate ID Cards
            </Button>
          </Link>
          <Link href="/admin/attendance">
            <Button variant="secondary" size="sm" leftIcon={<Users className="w-3.5 h-3.5" />}>
              Full Attendance Roster
            </Button>
          </Link>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Scans Today</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{counts.totalScanned}</span>
            <span className="text-[11px] text-indigo-600 font-bold">Entry / Exit Logged</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Currently In Campus</span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">{counts.inCampus}</span>
            <span className="text-[11px] text-emerald-700 font-bold">Active Students In School</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Exited / Dispersed</span>
            <span className="text-3xl font-black text-amber-600 mt-1 block">{counts.exited}</span>
            <span className="text-[11px] text-amber-700 font-bold">Dispersed via Gate / Bus</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 🌟 MAIN SCANNER & RESULT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SCANNER INPUT CONTROLLER (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <Card header={<h3 className="font-bold text-slate-900 text-sm">Gate Scanner Terminal</h3>}>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Gate Selector & Scan Shift Mode */}
              <div className="space-y-2">
                <Select
                  label="Active Security Gate"
                  options={[
                    { value: 'Gate 1 — Main Campus Entrance', label: 'Gate 1 — Main Campus Entrance' },
                    { value: 'Gate 2 — Pre-School Bus Gate', label: 'Gate 2 — Pre-School Bus Gate' },
                    { value: 'Gate 3 — North Pedestrian Entrance', label: 'Gate 3 — North Pedestrian Entrance' },
                  ]}
                  value={selectedGate}
                  onChange={e => setSelectedGate(e.target.value)}
                />

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Scanner Shift Mode</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                    <button
                      type="button"
                      onClick={() => setScanType('AUTO')}
                      className={`py-1.5 rounded-lg transition ${scanType === 'AUTO' ? 'bg-white text-indigo-600 shadow-2xs font-extrabold' : 'hover:text-slate-900'}`}
                    >
                      ⚡ Auto Detect
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanType('ENTRY')}
                      className={`py-1.5 rounded-lg transition ${scanType === 'ENTRY' ? 'bg-emerald-600 text-white shadow-2xs font-extrabold' : 'hover:text-slate-900'}`}
                    >
                      🟢 Entry (AM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanType('EXIT')}
                      className={`py-1.5 rounded-lg transition ${scanType === 'EXIT' ? 'bg-amber-600 text-white shadow-2xs font-extrabold' : 'hover:text-slate-900'}`}
                    >
                      🟡 Exit (PM)
                    </button>
                  </div>
                </div>
              </div>

              {/* Hardware / Barcode Scanner Input */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5 text-indigo-300">
                    <Zap className="w-4 h-4 text-amber-400" />
                    USB 2D / Camera Scanner Input
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    Ready for Scan
                  </span>
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Scan QR or paste student token..."
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  className="w-full bg-slate-800 text-white font-mono text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isScanning}
                  leftIcon={<ScanLine className="w-4 h-4" />}
                >
                  Record Gate Punch
                </Button>
              </div>

            </form>
          </Card>

          {/* 🌟 1-CLICK QUICK TEST SCANNER */}
          <Card header={<h3 className="font-bold text-slate-900 text-xs">1-Click Quick Simulator (Test Any Student QR)</h3>}>
            <div className="space-y-2">
              <p className="text-[11px] text-slate-500">
                Click any student below to simulate scanning their unique physical ID card QR code:
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                {quickStudents.map(s => (
                  <div
                    key={s.id}
                    onClick={() => handleExecuteScan(`VET:STU:${s.universal_id}:${s.id}:${s.institution_code || 'CBS'}:${s.admission_number || 'CBS-2026-0001'}`)}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] overflow-hidden">
                        {s.photo_url ? <img src={s.photo_url} alt={s.first_name} className="w-full h-full object-cover" /> : s.first_name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{s.first_name} {s.last_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{s.universal_id} • {s.class_name}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                      Scan QR <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

        </div>

        {/* 🌟 SCAN RESULT & LIVE FEED (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Last Scan Result Card */}
          {lastScanResult && (
            <div
              className={`p-6 rounded-3xl border shadow-md animate-in zoom-in-95 duration-200 ${
                !lastScanResult.success
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : lastScanResult.action === 'ENTRY_RECORDED'
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : 'bg-indigo-900 text-white border-indigo-950'
              }`}
            >
              {!lastScanResult.success ? (
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-8 h-8 text-rose-600 shrink-0" />
                  <div>
                    <h4 className="font-black text-base">QR Scan Failed</h4>
                    <p className="text-xs text-rose-700">{lastScanResult.error}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {lastScanResult.action === 'ENTRY_RECORDED' ? '🟢 MORNING CAMPUS ENTRY RECORDED' : '🟡 AFTERNOON CAMPUS EXIT RECORDED'}
                    </span>
                    <span className="font-mono text-xs font-bold text-white/90">
                      {lastScanResult.action === 'ENTRY_RECORDED' ? lastScanResult.attendance?.entryTime : lastScanResult.attendance?.exitTime}
                    </span>
                  </div>

                  {/* Student Details Card */}
                  <div className="bg-white text-slate-900 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center overflow-hidden border-2 border-slate-200">
                        {lastScanResult.student?.photoUrl ? (
                          <img src={lastScanResult.student.photoUrl} alt={lastScanResult.student.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{lastScanResult.student?.firstName?.[0]}{lastScanResult.student?.lastName?.[0]}</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-lg font-black text-slate-900 leading-tight">
                          {lastScanResult.student?.firstName} {lastScanResult.student?.lastName}
                        </h3>
                        <div className="text-xs text-slate-500 font-medium">
                          <strong>{lastScanResult.student?.className} ({lastScanResult.student?.sectionName})</strong> • Adm: <span className="font-mono font-bold">{lastScanResult.student?.admissionNumber}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Parent: <strong>{lastScanResult.student?.parentName}</strong> (📞 {lastScanResult.student?.parentPhone})
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-black text-xs">
                        {lastScanResult.student?.universalId}
                      </span>
                      {lastScanResult.attendance?.durationMinutes !== undefined && (
                        <span className="block text-[11px] text-slate-500 font-bold">
                          In School: {Math.floor(lastScanResult.attendance.durationMinutes / 60)}h {lastScanResult.attendance.durationMinutes % 60}m
                        </span>
                      )}
                    </div>
                  </div>

                  {/* SMS Alert Status */}
                  <div className="flex items-center justify-between text-xs text-white/90 font-bold pt-1">
                    <span className="flex items-center gap-1">
                      <Send className="w-3.5 h-3.5 text-white" />
                      Automated Parent SMS: <span className="text-white underline">Sent to {lastScanResult.student?.parentPhone}</span>
                    </span>
                    <span className="text-[11px] text-white/80">
                      Gate: {lastScanResult.attendance?.gateName}
                    </span>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* 🌟 TODAY'S LIVE GATE ROSTER TABLE */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">Today's Live Gate Muster Roll</h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold font-mono">
                    {logs.length} Scanned
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={fetchTodayLogs} isLoading={isLoadingLogs} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                  Refresh
                </Button>
              </div>
            }
          >
            {logs.length === 0 ? (
              <EmptyState
                icon={<ScanLine className="w-8 h-8 text-slate-400" />}
                title="No Gate Scans Recorded Today"
                description="Use the terminal on the left or scan a student ID card to record entry/exit."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Class</th>
                      <th className="py-2.5 px-3">Entry Time</th>
                      <th className="py-2.5 px-3">Exit Time</th>
                      <th className="py-2.5 px-3">Current Status</th>
                      <th className="py-2.5 px-3 text-right">Gate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 overflow-hidden">
                              {log.photo_url ? <img src={log.photo_url} alt={log.first_name} className="w-full h-full object-cover" /> : log.first_name[0]}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{log.first_name} {log.last_name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{log.universal_id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {log.class_name} ({log.section_name})
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                          {log.entry_time_fmt}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-700">
                          {log.exit_time_fmt}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              log.gate_status === 'IN_CAMPUS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {log.gate_status === 'IN_CAMPUS' ? '● IN CAMPUS' : '✓ EXITED'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-500 text-[11px]">
                          {log.entry_gate?.split('—')?.[0] || 'Gate 1'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

        </div>

      </div>

    </div>
  );
}
