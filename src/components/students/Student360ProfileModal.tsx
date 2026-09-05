"use client";

import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Edit3,
  Save,
  ArrowLeft,
  Download,
  QrCode,
  Check,
  User
} from 'lucide-react';

import { useInstitution } from '@/components/providers/InstitutionContext';
import { StudentIDCard } from '@/components/id-cards/StudentIDCard';

export interface Student360ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any | null;
  onSaveProfile?: (updatedData: any) => void;
}

export function Student360ProfileModal({
  isOpen,
  onClose,
  student,
  onSaveProfile
}: Student360ProfileModalProps) {
  const { selectedInstitutionObj } = useInstitution();
  const [modalView, setModalView] = useState<'dossier' | 'edit' | 'id_card' | 'tc'>('dossier');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'family' | 'academics' | 'attendance' | 'fees' | 'transport' | 'documents' | 'lifecycle'
  >('overview');

  // Form State for Edit Mode
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    className: '',
    section: '',
    rollNo: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    fatherName: '',
    motherName: '',
    phone: '',
    email: '',
    address: '',
    transportRoute: '',
    feeCategory: 'General',
  });

  const [isSavedToast, setIsSavedToast] = useState(false);

  useEffect(() => {
    if (student) {
      const parts = (student.name || '').split(' ');
      setFormData({
        firstName: student.firstName || student.first_name || parts[0] || 'Pranav',
        lastName: student.lastName || student.last_name || parts.slice(1).join(' ') || 'Venkatesh',
        className: student.grade || student.className || student.class_name || 'Class 11-Science-A',
        section: student.section || student.sectionName || student.section_name || 'A',
        rollNo: student.rollNo || student.rollNumber || student.roll_number || '12',
        dob: student.dob || '2009-11-20',
        gender: student.gender || 'Male',
        bloodGroup: student.bloodGroup || student.blood_group || 'O+',
        fatherName: student.fatherName || student.parentName || student.parent_name || 'Venkatesh Raman',
        motherName: student.motherName || 'Mrs. Sunita Raman',
        phone: student.parentPhone || student.parent_phone || '+91 98200 44551',
        email: student.parentEmail || student.parent_email || 'v.raman@example.com',
        address: student.address || 'Tower 4, ATS Greens, Expressway, Greater Noida',
        transportRoute: student.transportRoute || 'Bus 04 (Sector 62 Loop)',
        feeCategory: 'Regular General',
      });
      setModalView('dossier');
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || student.name || 'Student Profile';
  const universalId = student.universalId || student.universal_id || `STU-AVM-001092`;
  const admissionNo = student.admissionNumber || student.admission_number || student.admissionNo || 'CBS-2026-0057';
  const academicYear = student.academicYear || student.academicSession || 'AY 2026–27';
  const status = student.status || 'Active';
  const attendancePct = student.attendancePct || student.attendancePercent || '98.9%';
  const feeStatus = student.feeStatus || '₹0';
  const avatarUrl = student.avatar || student.avatarUrl || student.photo_url || null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveProfile) {
      onSaveProfile(formData);
    }
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      setModalView('dossier');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* VIEW 1: STANDARD 360° DOSSIER PROFILE                                     */}
        {/* ========================================================================= */}
        {modalView === 'dossier' && (
          <>
            {/* 1. DARK MODAL HEADER */}
            <div className="bg-[#0B1120] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80">
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
                    <span>{formData.className} (Roll #{formData.rollNo})</span>
                    <span>•</span>
                    <span className="text-slate-400">{academicYear}</span>
                  </p>
                </div>
              </div>

              {/* Quick Header Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                <button
                  type="button"
                  onClick={() => setModalView('edit')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Data</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalView('id_card')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>ID Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalView('tc')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-700 transition shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>SLC / TC</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition ml-1 cursor-pointer"
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
                { id: 'lifecycle', label: '🔄 Lifecycle & Progression' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition relative cursor-pointer ${
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
                            {activeTab === 'lifecycle' && (
                <div className="space-y-6">
                  {/* Action Bar */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Student Lifecycle & Progression Governance</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Permanent Universal ID: <strong className="text-indigo-600 font-mono">{universalId}</strong> • Immutable audit history
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => alert(`Promoting ${fullName} to next academic session with historical snapshot retention.`)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        🎓 Promote Session
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Transferring ${fullName} to sister institution within Vaani Trust.`)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        🔄 Transfer School
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Marking ${fullName} as WITHDRAWN. All historical data & Universal ID will remain preserved.`)}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        ⛔ Mark Withdrawal
                      </button>
                    </div>
                  </div>

                  {/* Progression Timeline */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Historical Progression Snapshots</h4>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                      {[
                        { date: '01 Apr 2026', state: 'ACTIVE', title: 'Enrolled in AY 2026-2027 (Class 11-Science-A)', by: 'Registrar (Admin)' },
                        { date: '15 Mar 2026', state: 'PROMOTED', title: 'Successfully Promoted from Class 10-A (AY 2025-26)', by: 'Academic Council' },
                        { date: '10 Apr 2025', state: 'ACTIVE', title: 'Session AY 2025-2026 Started', by: 'System Automation' },
                        { date: '05 Jan 2024', state: 'ADMISSION', title: 'Initial Admission Confirmed under Universal ID STU-AVM-001092', by: 'Admissions Officer' },
                      ].map((item, idx) => (
                        <div key={idx} className="relative flex items-start gap-4 pl-8">
                          <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200" />
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex-1">
                            <div className="flex items-center justify-between text-xs">
                              <strong className="text-slate-900 font-bold">{item.title}</strong>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">{item.state}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Recorded on {item.date} • Action by: {item.by}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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
                        Top 5% in {formData.className}
                      </div>
                    </div>
                  </div>

                  {/* Lower 2 Details Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Student Bio Data */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black tracking-wider text-slate-900 uppercase flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          STUDENT BIO DATA
                        </h3>
                        <button
                          type="button"
                          onClick={() => setModalView('edit')}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        <div className="py-2 flex justify-between items-center">
                          <span className="text-slate-500">Date of Birth:</span>
                          <span className="font-bold text-slate-900 font-mono">{formData.dob}</span>
                        </div>
                        <div className="py-2 flex justify-between items-center">
                          <span className="text-slate-500">Gender:</span>
                          <span className="font-bold text-slate-900">{formData.gender}</span>
                        </div>
                        <div className="py-2 flex justify-between items-center">
                          <span className="text-slate-500">Blood Group:</span>
                          <span className="font-black text-rose-600">{formData.bloodGroup}</span>
                        </div>
                        <div className="py-2 flex justify-between items-center">
                          <span className="text-slate-500">Enrolled On:</span>
                          <span className="font-bold text-slate-900 font-mono">2021-04-05</span>
                        </div>
                      </div>
                    </div>

                    {/* Primary Guardian */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black tracking-wider text-slate-900 uppercase flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          PRIMARY GUARDIAN
                        </h3>
                        <button
                          type="button"
                          onClick={() => setModalView('edit')}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        <div className="py-2 flex justify-between items-center">
                          <span className="text-slate-500">Father’s Name:</span>
                          <span className="font-bold text-slate-900">{formData.fatherName}</span>
                        </div>
                        <div className="py-2 flex justify-between items-center">
                          <span className="text-slate-500">Mobile Phone:</span>
                          <a href={`tel:${formData.phone}`} className="font-bold text-indigo-600 hover:underline flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-indigo-500" />
                            {formData.phone}
                          </a>
                        </div>
                        <div className="py-2 flex justify-between items-center">
                          <span className="text-slate-500">Email:</span>
                          <a href={`mailto:${formData.email}`} className="font-bold text-indigo-600 hover:underline">
                            {formData.email}
                          </a>
                        </div>
                        <div className="py-2 flex justify-between items-center">
                          <span className="text-slate-500">Residence:</span>
                          <span className="font-medium text-slate-700 text-right max-w-[200px] truncate" title={formData.address}>
                            {formData.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'family' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-slate-900 uppercase tracking-wider">Family & Emergency Contacts</h3>
                    <button
                      type="button"
                      onClick={() => setModalView('edit')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Contacts
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-900 text-sm">{formData.fatherName} (Father)</div>
                      <div className="text-slate-500 mt-1">Phone: {formData.phone}</div>
                      <div className="text-slate-500">Email: {formData.email}</div>
                      <div className="text-slate-500">Occupation: Corporate Executive</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-900 text-sm">{formData.motherName} (Mother)</div>
                      <div className="text-slate-500 mt-1">Phone: +91 98112 33441</div>
                      <div className="text-slate-500">Email: sunita.raman@example.com</div>
                      <div className="text-slate-500">Occupation: Architect</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'academics' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider">Holistic &amp; NEP 360° Academic Evaluation</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                      <div className="text-slate-500 font-bold">Mathematics</div>
                      <div className="text-lg font-black text-indigo-700 mt-1">96 / 100</div>
                    </div>
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                      <div className="text-slate-500 font-bold">Science / Physics</div>
                      <div className="text-lg font-black text-indigo-700 mt-1">94 / 100</div>
                    </div>
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                      <div className="text-slate-500 font-bold">English Literature</div>
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
                  <h3 className="font-black text-slate-900 uppercase tracking-wider">Attendance Logs (AY 2026-27)</h3>
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
                      <div className="font-bold text-slate-900">{formData.transportRoute}</div>
                      <div className="text-slate-500">Pick-up: 07:15 AM | Drop-off: 03:45 PM | Driver: Mr. Rajinder (+91 98711 20044)</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider">Digital Certificates & ID Passes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setModalView('id_card')}
                      className="p-4 bg-indigo-50/60 hover:bg-indigo-100/60 rounded-xl border border-indigo-200 text-left transition flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-indigo-900">Student Identity & Enrollment Card</div>
                        <div className="text-[11px] text-indigo-600 mt-0.5">Scannable QR • Active Pass</div>
                      </div>
                      <Printer className="w-4 h-4 text-indigo-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalView('tc')}
                      className="p-4 bg-amber-50/60 hover:bg-amber-100/60 rounded-xl border border-amber-200 text-left transition flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-amber-900">School Leaving Certificate (SLC / TC)</div>
                        <div className="text-[11px] text-amber-600 mt-0.5">Official Standardized Format</div>
                      </div>
                      <FileText className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. MODAL FOOTER */}
            <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400">
                360° Academic Record Verified
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalView('edit')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: EDIT STUDENT PROFILE DATA FORM                                    */}
        {/* ========================================================================= */}
        {modalView === 'edit' && (
          <form onSubmit={handleSave} className="flex flex-col h-full">
            <div className="bg-[#0B1120] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalView('dossier')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-indigo-400" />
                    Edit Student Data
                  </h2>
                  <p className="text-xs text-slate-400">Update academic, bio-data & guardian records</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-7 overflow-y-auto flex-1 bg-slate-50 space-y-6 text-xs">
              {/* Personal Details */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="font-black text-slate-900 uppercase tracking-wider">Student Bio Data</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Class / Grade</label>
                    <input
                      type="text"
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Section</label>
                      <input
                        type="text"
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Roll Number</label>
                      <input
                        type="text"
                        value={formData.rollNo}
                        onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Blood Group</label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guardian & Contact Info */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="font-black text-slate-900 uppercase tracking-wider">Guardian & Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Father's Full Name</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Mother's Full Name</label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Primary Mobile Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-bold mb-1">Residence Address</label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-indigo-600 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              {isSavedToast ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <Check className="w-4 h-4" />
                  <span>Profile Changes Saved Successfully!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setModalView('dossier')}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Profile
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: PRINTABLE DIGITAL ID & ENROLLMENT CARD (FRONT & BACK SIDE)         */}
        {/* ========================================================================= */}
        {modalView === 'id_card' && (
          <div className="flex flex-col h-full">
            <div className="bg-[#0A2558] text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalView('dossier')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Printer className="w-4 h-4 text-amber-400" />
                  Official Student ID Card (Front & Back)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print ID Cards
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex flex-wrap items-center justify-center gap-8">
              <StudentIDCard
                student={{
                  ...student,
                  first_name: formData.firstName,
                  last_name: formData.lastName,
                  admission_number: admissionNo,
                  class_name: formData.className,
                  roll_no: formData.rollNo,
                  dob: formData.dob,
                  blood_group: formData.bloodGroup,
                  guardian_phone: formData.phone,
                  photo_url: avatarUrl,
                  address: formData.address,
                  father_name: student?.father_name || (formData as any).fatherName,
                  mother_name: student?.mother_name || (formData as any).motherName,
                  bus_route_no: student?.bus_route_no || 'Route 04 (Burari)',
                  valid_upto: '31 Mar 2027',
                }}
                schoolInfo={selectedInstitutionObj}
                layoutMode="DUAL"
              />
            </div>

            <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setModalView('dossier')}
                className="font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                ← Back to 360° Dossier
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#0A2558] text-white font-bold transition hover:bg-slate-800 cursor-pointer"
              >
                Print Front & Back Badges
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: FORMAL STATUTORY SCHOOL LEAVING / TRANSFER CERTIFICATE (SLC / TC)   */}
        {/* ========================================================================= */}
        {modalView === 'tc' && (
          <div className="flex flex-col h-full">
            <div className="bg-[#0B1120] text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalView('dossier')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  School Leaving & Transfer Certificate (SLC / TC)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print TC
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center">
              {/* Formal Transfer Certificate Document */}
              <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-slate-300 text-slate-900">
                {/* Certificate Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
                  <div className="text-lg font-black tracking-wider uppercase text-slate-900">
                    {selectedInstitutionObj?.name || "EDUCATIONAL INSTITUTION"}
                  </div>
                  <div className="text-[11px] font-medium text-slate-600">
                    {selectedInstitutionObj?.affiliationNumber ? `Affiliation No. ${selectedInstitutionObj.affiliationNumber}` : (selectedInstitutionObj?.boardAffiliation || "Official Student Record")}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {[selectedInstitutionObj?.address, selectedInstitutionObj?.phone ? `Ph: ${selectedInstitutionObj.phone}` : null].filter(Boolean).join(" • ") || "Campus Administration"}
                  </div>
                  <div className="inline-block mt-3 px-4 py-1 bg-slate-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-md">
                    TRANSFER CERTIFICATE / SCHOOL LEAVING CERTIFICATE
                  </div>
                </div>

                {/* Serial Details */}
                <div className="flex justify-between items-center text-xs font-bold font-mono text-slate-700 mb-4 pb-2 border-b border-slate-200">
                  <span>Certificate No: TC/2026/089</span>
                  <span>Admission No: {admissionNo}</span>
                  <span>Universal ID: {universalId}</span>
                </div>

                {/* 14-Point Certificate Details Table */}
                <div className="divide-y divide-slate-200 text-xs space-y-1">
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">1. Name of Pupil:</span>
                    <span className="font-black text-slate-900 uppercase">{fullName}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">2. Father's / Guardian's Name:</span>
                    <span className="font-bold text-slate-900">{formData.fatherName}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">3. Mother's Name:</span>
                    <span className="font-bold text-slate-900">{formData.motherName}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">4. Nationality:</span>
                    <span className="font-bold text-slate-900">Indian</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">5. Date of First Admission in School with Class:</span>
                    <span className="font-bold text-slate-900 font-mono">05-04-2021 in Class 6</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">6. Date of Birth (in figures & words):</span>
                    <span className="font-bold text-slate-900 font-mono">{formData.dob}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">7. Class in which pupil last studied:</span>
                    <span className="font-bold text-slate-900">{formData.className}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">8. School / Board Annual Examination Result:</span>
                    <span className="font-bold text-emerald-700">Passed with Distinction</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">9. Whether qualified for promotion to higher class:</span>
                    <span className="font-bold text-slate-900">Yes, Promoted</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">10. Total working days & days present:</span>
                    <span className="font-bold text-slate-900 font-mono">184 / 182 Days</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">11. General Conduct:</span>
                    <span className="font-bold text-emerald-700">Exemplary</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">12. Reason for leaving the school:</span>
                    <span className="font-bold text-slate-900">Parent Relocation / Academic Progression</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600 font-medium">13. Date of Issue of Certificate:</span>
                    <span className="font-bold text-slate-900 font-mono">29-08-2026</span>
                  </div>
                </div>

                {/* Signatures & Seal */}
                <div className="grid grid-cols-3 gap-4 pt-12 text-center text-[10px] font-bold text-slate-700">
                  <div className="border-t border-slate-400 pt-1">Class Teacher</div>
                  <div className="border-t border-slate-400 pt-1">Checked By (Office)</div>
                  <div className="border-t border-slate-900 pt-1 text-slate-900 font-black">Principal & Seal</div>
                </div>
              </div>
            </div>

            <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setModalView('dossier')}
                className="font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                ← Back to 360° Dossier
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold transition hover:bg-slate-800 cursor-pointer"
              >
                Print Formal Certificate
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
