"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User, Users, BookOpen, Clock, Calendar, CheckSquare,
  CreditCard, Bus, Library, HeartPulse, AlertTriangle, FileText,
  MessageSquare, ShieldCheck, History, ArrowLeft, Download, Phone,
  Mail, MapPin, Sparkles, ExternalLink, RefreshCw, FileCheck
} from 'lucide-react';
import { getStudent360Dossier } from '@/app/actions/student-360';

type TabKey =
  | 'overview'
  | 'family'
  | 'academics'
  | 'attendance'
  | 'timetable'
  | 'homework'
  | 'exams'
  | 'fees'
  | 'transport'
  | 'library'
  | 'medical'
  | 'incidents'
  | 'documents'
  | 'communications'
  | 'changerequests'
  | 'audit';

export default function Student360Page({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDossier();
  }, [params.id]);

  async function loadDossier() {
    setIsLoading(true);
    const res = await getStudent360Dossier(params.id);
    if (res.success) setStudent(res.data);
    setIsLoading(false);
  }

  if (isLoading || !student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-stone-600">Aggregating Student 360° Unified Dossier...</p>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'overview', label: 'Overview', icon: User },
    { key: 'family', label: 'Family 360°', icon: Users },
    { key: 'academics', label: 'Academics', icon: BookOpen },
    { key: 'attendance', label: 'Attendance', icon: Clock },
    { key: 'timetable', label: 'Timetable', icon: Calendar },
    { key: 'homework', label: 'Homework', icon: CheckSquare },
    { key: 'exams', label: 'Exams & GPA', icon: FileCheck },
    { key: 'fees', label: 'Fees & Ledger', icon: CreditCard },
    { key: 'transport', label: 'Transport GPS', icon: Bus },
    { key: 'library', label: 'Library', icon: Library },
    { key: 'medical', label: 'Medical & Allergies', icon: HeartPulse },
    { key: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { key: 'documents', label: 'Document Vault', icon: FileText },
    { key: 'communications', label: 'Timeline', icon: MessageSquare },
    { key: 'changerequests', label: 'Change Requests', icon: ShieldCheck },
    { key: 'audit', label: 'Audit Trail', icon: History },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/students"
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                Student 360° Master
              </span>
              <span className="text-stone-400 text-xs">•</span>
              <span className="text-stone-500 text-xs font-bold">{student.admissionNo}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {student.fullName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/families/${student.familyId}`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition border border-purple-200"
          >
            <Users className="w-3.5 h-3.5" />
            View Family 360°
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Dossier (PDF)
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-md">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-stone-900">{student.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                {student.status}
              </span>
            </div>
            <p className="text-xs font-semibold text-stone-500">
              {student.currentGrade} - Section {student.currentSection} • Roll No: {student.rollNo} • Class Teacher: {student.classTeacher}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1">
              <span className="flex items-center gap-1 font-medium"><Phone className="w-3 h-3 text-stone-400" /> {student.father.phone}</span>
              <span className="flex items-center gap-1 font-medium"><Mail className="w-3 h-3 text-stone-400" /> {student.father.email}</span>
              <span className="flex items-center gap-1 font-medium"><HeartPulse className="w-3 h-3 text-rose-500" /> Blood Group: {student.bloodGroup}</span>
            </div>
          </div>
        </div>

        {/* Quick Snapshot KPIs */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Attendance</span>
            <p className="text-xl font-black text-emerald-600">{student.attendanceSummary.overallPercentage}%</p>
            <span className="text-[10px] text-emerald-700 font-semibold">{student.attendanceSummary.statusBadge}</span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">CGPA</span>
            <p className="text-xl font-black text-indigo-600">{student.cgpaScore} <span className="text-xs font-bold text-stone-400">/ 4.0</span></p>
            <span className="text-[10px] text-indigo-700 font-semibold">{student.totalPercentage}% Score</span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Fee Balance</span>
            <p className="text-xl font-black text-stone-900">₹{student.financialSummary.outstandingBalance}</p>
            <span className="text-[10px] text-emerald-600 font-bold">100% Cleared</span>
          </div>
        </div>
      </div>

      {/* 16-Tab Navigation Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 scrollbar-none">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}

      {/* 1. Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Basic Demographics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div><span className="text-stone-400 font-medium">Date of Birth:</span> <p className="font-bold text-stone-800">{student.dob} (Age 10)</p></div>
                <div><span className="text-stone-400 font-medium">Gender:</span> <p className="font-bold text-stone-800">{student.gender}</p></div>
                <div><span className="text-stone-400 font-medium">Admission Date:</span> <p className="font-bold text-stone-800">{student.admissionDate}</p></div>
                <div><span className="text-stone-400 font-medium">Enrollment Token:</span> <p className="font-bold text-stone-800">{student.enrollmentNo}</p></div>
                <div><span className="text-stone-400 font-medium">School House:</span> <p className="font-bold text-stone-800">{student.house}</p></div>
                <div><span className="text-stone-400 font-medium">Category:</span> <p className="font-bold text-stone-800">{student.category}</p></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" /> Academic Progression
              </h3>
              <div className="space-y-3">
                {student.academicProgression.map((prog: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-xs">
                    <div>
                      <span className="font-black text-stone-900">{prog.grade} ({prog.year})</span>
                      <p className="text-stone-500 font-medium">{prog.result}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-purple-600">{prog.gpa}</span>
                      <p className="text-stone-400">{prog.rank}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Siblings Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" /> Linked Siblings
              </h3>
              {student.siblings.map((sib: any) => (
                <div key={sib.id} className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-emerald-900">{sib.name}</h4>
                    <p className="text-[11px] text-emerald-700 font-semibold">{sib.grade} • {sib.relation}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                      {sib.concessionApplied}
                    </span>
                  </div>
                  <Link href={`/admin/students/${sib.id}`} className="p-2 bg-white text-emerald-700 rounded-xl shadow-xs hover:bg-emerald-100">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Transport Snapshot */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Bus className="w-4 h-4 text-amber-600" /> Transport Telemetry
              </h3>
              <div className="text-xs space-y-2">
                <div className="flex justify-between"><span className="text-stone-400">Assigned Bus:</span> <span className="font-bold text-stone-800">{student.transport.busNo}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Route:</span> <span className="font-bold text-stone-800">{student.transport.routeNo}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Stop:</span> <span className="font-bold text-stone-800">{student.transport.stopName}</span></div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 font-bold text-[11px]">
                  Status: {student.transport.currentStatus}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Family 360 */}
      {activeTab === 'family' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-stone-900">Family Master: {student.familyName} ({student.familyId})</h3>
            <Link href={`/admin/families/${student.familyId}`} className="text-xs text-blue-600 font-bold hover:underline">
              Open Full Household Page →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-stone-400">Father / Primary Guardian</span>
              <h4 className="text-sm font-black text-stone-900">{student.father.name}</h4>
              <p className="text-stone-600 font-semibold">{student.father.occupation}</p>
              <p className="text-stone-500 font-medium">📞 {student.father.phone}</p>
              <p className="text-stone-500 font-medium">✉️ {student.father.email}</p>
            </div>
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-stone-400">Mother / Guardian</span>
              <h4 className="text-sm font-black text-stone-900">{student.mother.name}</h4>
              <p className="text-stone-600 font-semibold">{student.mother.occupation}</p>
              <p className="text-stone-500 font-medium">📞 {student.mother.phone}</p>
              <p className="text-stone-500 font-medium">✉️ {student.mother.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. Fees & Ledger */}
      {activeTab === 'fees' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-stone-900">Student Double-Entry Fee Ledger</h3>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl">
              Zero Outstanding Balance
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Particulars</th>
                  <th className="p-3">Voucher Ref</th>
                  <th className="p-3 text-right">Debit (+)</th>
                  <th className="p-3 text-right">Credit (-)</th>
                  <th className="p-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {student.financialSummary.ledgerEntries.map((l: any, i: number) => (
                  <tr key={i}>
                    <td className="p-3">{l.date}</td>
                    <td className="p-3 font-bold text-stone-900">{l.particular}</td>
                    <td className="p-3 font-mono text-stone-500">{l.voucher}</td>
                    <td className="p-3 text-right text-stone-900">{l.debit > 0 ? `₹${l.debit.toLocaleString()}` : '-'}</td>
                    <td className="p-3 text-right text-emerald-600">{l.credit > 0 ? `₹${l.credit.toLocaleString()}` : '-'}</td>
                    <td className="p-3 text-right font-black text-stone-900">₹{l.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 11. Medical & Allergies */}
      {activeTab === 'medical' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-600" /> Medical & Allergy Profile
          </h3>
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-rose-900">CRITICAL ALLERGY FLAGS</h4>
              <p className="text-xs text-rose-700 font-semibold mt-1">
                {student.medicalProfile.allergies.join(' • ')}
              </p>
              <p className="text-[11px] text-rose-600 mt-1">
                Location of Epipen: {student.medicalProfile.epipenLocation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 14. Communication Timeline */}
      {activeTab === 'communications' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" /> Omnichannel Communication Timeline
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-stone-800">📱 SMS — Absentee Alert Dispatched</span>
                <p className="text-stone-500 font-medium">Recipient: Rajesh Sharma (+91 98100 12345)</p>
              </div>
              <span className="text-stone-400">Aug 18, 2026</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-800">💬 WhatsApp — Fee Payment Receipt Confirmed</span>
                <p className="text-stone-500 font-medium">Receipt #REC-2026-9021 (₹40,200)</p>
              </div>
              <span className="text-stone-400">Apr 05, 2026</span>
            </div>
          </div>
        </div>
      )}

      {/* 16. Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <History className="w-5 h-5 text-stone-700" /> Immutable Student Audit Trail
          </h3>
          <p className="text-xs text-stone-500">Chronological log of all administrative, financial, and academic record adjustments.</p>
          <div className="p-4 bg-stone-50 rounded-2xl font-mono text-[11px] text-stone-700 space-y-2 border border-stone-200">
            <p>• [2026-08-22 14:30:10 UTC] [UPDATE] Sibling 15% concession granted by Admin (Dr. Ananya Roy) from IP 192.168.1.45</p>
            <p>• [2026-04-05 09:12:44 UTC] [PAYMENT] ₹40,200 settled via Razorpay Webhook (Payment ID: pay_2026_042)</p>
            <p>• [2026-04-01 08:00:00 UTC] [CREATE] Student enrolled in Grade 4-B by Admissions Desk</p>
          </div>
        </div>
      )}

    </div>
  );
}
