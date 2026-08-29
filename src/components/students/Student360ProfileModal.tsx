"use client";

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  FileText,
  Printer,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Bus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export interface Student360ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any | null;
}

export function Student360ProfileModal({
  isOpen,
  onClose,
  student
}: Student360ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'family' | 'academics' | 'attendance' | 'fees' | 'transport' | 'documents'
  >('overview');

  if (!isOpen || !student) return null;

  const fullName = student.name || `${student.firstName || student.first_name || ''} ${student.lastName || student.last_name || ''}`.trim() || 'Student Profile';
  const universalId = student.universalId || student.universal_id || `STU-${student.admissionNumber || student.admission_number || '001092'}`;
  const className = student.grade || student.className || student.class_name || 'Class 5';
  const section = student.section || student.sectionName || student.section_name || 'A';
  const rollNo = student.rollNo || student.rollNumber || student.roll_number || '12';
  const academicYear = student.academicYear || student.academicSession || 'AY 2026–27';
  const status = student.status || 'Active';
  const attendancePct = student.attendancePct || student.attendancePercent || '98.9%';
  const feeStatus = student.feeStatus || '₹0';
  const bloodGroup = student.bloodGroup || student.blood_group || 'O+';
  const dob = student.dob || '2015-11-20';
  const gender = student.gender || 'Male';
  const enrolledOn = student.admissionDate || student.enrolledOn || '2021-04-05';
  const fatherName = student.fatherName || student.parentName || student.parent_name || 'Venkatesh Raman';
  const motherName = student.motherName || 'Mrs. Sunita Raman';
  const phone = student.parentPhone || student.parent_phone || '+91 98200 44551';
  const email = student.parentEmail || student.parent_email || 'v.raman@example.com';
  const address = student.address || 'Tower 4, ATS Greens, Expressway, Greater Noida';
  const avatarUrl = student.avatar || student.avatarUrl || student.photo_url || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. DARK MODAL HEADER */}
        <div className="bg-[#0B1120] text-white p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            {/* Standardized Studio Avatar Frame */}
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-lg bg-slate-900 flex-shrink-0">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={fullName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 flex items-center justify-center text-amber-300 font-black text-xl">
                  {fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
            </div>

            {/* Student Titles */}
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {fullName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {status}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium flex flex-wrap items-center gap-2">
                <span className="text-amber-300/90 font-mono font-bold">{universalId}</span>
                <span>•</span>
                <span>{className} (Roll #{rollNo})</span>
                <span>•</span>
                <span className="text-slate-400">{academicYear}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>ID Card</span>
            </button>

            <button
              type="button"
              onClick={() => alert(`Generating School Leaving Certificate for ${fullName}...`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-700 transition shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>SLC / TC</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. HORIZONTAL TAB NAVIGATION BAR */}
        <div className="bg-white border-b border-slate-200 px-6 overflow-x-auto flex gap-6 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'family', label: 'Family & Guardian' },
            { id: 'academics', label: 'Academics & NEP 360°' },
            { id: 'attendance', label: `Attendance (${attendancePct})` },
            { id: 'fees', label: 'Fee Ledger' },
            { id: 'transport', label: 'Transport & Route' },
            { id: 'documents', label: 'Documents & Certs' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition relative ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 3. SCROLLABLE TAB CONTENT */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 bg-slate-50/50 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Top 3 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                    ATTENDANCE RATE
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    {attendancePct}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Excellent • 0 Unexcused Leaves
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                    FEE STATUS
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    {feeStatus}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    All Dues Cleared
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                    NEP HOLISTIC GPA
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    A+ (9.4 / 10)
                  </div>
                  <div className="text-xs font-bold text-amber-600 mt-1.5 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Top 5% in {className}
                  </div>
                </div>
              </div>

              {/* Lower 2 Details Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Bio Data */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
                  <h3 className="text-xs font-black tracking-wider text-slate-900 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    STUDENT BIO DATA
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2 flex justify-between items-center">
                      <span className="text-slate-500">Date of Birth:</span>
                      <span className="font-bold text-slate-900 font-mono">{dob}</span>
                    </div>
                    <div className="py-2 flex justify-between items-center">
                      <span className="text-slate-500">Gender:</span>
                      <span className="font-bold text-slate-900">{gender}</span>
                    </div>
                    <div className="py-2 flex justify-between items-center">
                      <span className="text-slate-500">Blood Group:</span>
                      <span className="font-black text-rose-600">{bloodGroup}</span>
                    </div>
                    <div className="py-2 flex justify-between items-center">
                      <span className="text-slate-500">Enrolled On:</span>
                      <span className="font-bold text-slate-900 font-mono">{enrolledOn}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Guardian */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
                  <h3 className="text-xs font-black tracking-wider text-slate-900 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    PRIMARY GUARDIAN
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2 flex justify-between items-center">
                      <span className="text-slate-500">Father’s Name:</span>
                      <span className="font-bold text-slate-900">{fatherName}</span>
                    </div>
                    <div className="py-2 flex justify-between items-center">
                      <span className="text-slate-500">Mobile Phone:</span>
                      <a href={`tel:${phone}`} className="font-bold text-indigo-600 hover:underline flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-indigo-500" />
                        {phone}
                      </a>
                    </div>
                    <div className="py-2 flex justify-between items-center">
                      <span className="text-slate-500">Email:</span>
                      <a href={`mailto:${email}`} className="font-bold text-indigo-600 hover:underline">
                        {email}
                      </a>
                    </div>
                    <div className="py-2 flex justify-between items-center">
                      <span className="text-slate-500">Residence:</span>
                      <span className="font-medium text-slate-700 text-right max-w-[200px] truncate" title={address}>
                        {address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'family' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="font-black text-slate-900 uppercase tracking-wider">Family & Emergency Contacts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm">{fatherName} (Father)</div>
                  <div className="text-slate-500 mt-1">Phone: {phone}</div>
                  <div className="text-slate-500">Occupation: Corporate Executive</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm">{motherName} (Mother)</div>
                  <div className="text-slate-500 mt-1">Phone: +91 98112 33441</div>
                  <div className="text-slate-500">Occupation: Architect</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academics' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="font-black text-slate-900 uppercase tracking-wider">CBSE NEP 360° Academic Evaluation</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                  <div className="text-slate-500 font-bold">Mathematics</div>
                  <div className="text-lg font-black text-indigo-700 mt-1">96 / 100</div>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                  <div className="text-slate-500 font-bold">Science</div>
                  <div className="text-lg font-black text-indigo-700 mt-1">94 / 100</div>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                  <div className="text-slate-500 font-bold">English</div>
                  <div className="text-lg font-black text-indigo-700 mt-1">92 / 100</div>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                  <div className="text-slate-500 font-bold">Social Studies</div>
                  <div className="text-lg font-black text-indigo-700 mt-1">90 / 100</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <h3 className="font-black text-slate-900 uppercase tracking-wider">Attendance Logs (Term 1 & 2)</h3>
              <p className="text-slate-600">Total Working Days: 184 | Days Present: 182 | Unexcused Leaves: 0</p>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98.9%' }} />
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <h3 className="font-black text-slate-900 uppercase tracking-wider">Fee Realization & Invoices</h3>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-between">
                <span>Tuition & Campus Services (2026-27): Fully Settled</span>
                <span className="font-mono text-sm">Receipt #REC-2026-8819</span>
              </div>
            </div>
          )}

          {activeTab === 'transport' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <h3 className="font-black text-slate-900 uppercase tracking-wider">Transport & Bus Route</h3>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <Bus className="w-6 h-6 text-indigo-600" />
                <div>
                  <div className="font-bold text-slate-900">Bus 04 (Noida Sector 62 Loop)</div>
                  <div className="text-slate-500">Pick-up: 07:15 AM | Drop-off: 03:45 PM | Driver: Mr. Rajinder (+91 98711 20044)</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <h3 className="font-black text-slate-900 uppercase tracking-wider">Uploaded KYC & Certificates</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">Birth Certificate (Verified)</span>
                  <span className="text-emerald-600 font-bold">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">Aadhaar Card (Verified)</span>
                  <span className="text-emerald-600 font-bold">✓ Verified</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. MODAL FOOTER */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-slate-400">
            360° Academic Record Verified
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
