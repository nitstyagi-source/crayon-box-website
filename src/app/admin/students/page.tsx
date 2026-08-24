"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Search, Filter, Download, Plus, ArrowRight,
  Eye, Phone, CreditCard, Sparkles, UserCheck, RefreshCw,
  Trash2, CheckCircle2, AlertTriangle, Building2, ShieldCheck,
  ChevronRight, ArrowLeft, Check, Lock, Archive, RotateCcw, CheckCheck, History, X
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getFilteredUniversalStudentsAction,
  enrollUniversalStudentTransactionalAction,
  deleteTestStudentTransactionalAction,
  archiveStudentAction,
  checkStudentDuplicateAction,
  readmitStudentAction,
  UniversalStudentEnrollmentInput,
  StudentFilterQuery
} from '@/app/actions/universal-student-actions';

export default function UniversalStudentsDirectoryPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  // Filter State
  const [filters, setFilters] = useState<StudentFilterQuery>({
    institutionCode: currentInstitution,
    academicSession: '2026-2027',
    academicStage: 'ALL',
    className: 'ALL',
    sectionName: 'ALL',
    status: 'ACTIVE',
    search: '',
    showTestRecords: true,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    totalAll: 0,
    totalActive: 0,
    totalArchivedHub: 0,
    totalTransferred: 0,
    totalWithdrawn: 0,
    totalArchived: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [targetStudentForArchive, setTargetStudentForArchive] = useState<any>(null);
  const [archiveReason, setArchiveReason] = useState('Parent relocation');

  // Debounce search input to eliminate typing lag
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => (prev.search === searchTerm ? prev : { ...prev, search: searchTerm }));
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Multi-Step Modal Wizard State (Step 1 to 4)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [isManualAdmissionNo, setIsManualAdmissionNo] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UniversalStudentEnrollmentInput>({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '2016-05-15',
    gender: 'Male',
    bloodGroup: 'O+',
    nationality: 'Indian',
    category: 'General',
    aadhaarNo: '',
    isTestRecord: false,

    institutionCode: currentInstitution === 'ALL' ? 'CBS' : currentInstitution,
    academicSession: '2026-2027',
    academicStage: selectedInstitutionObj?.institutionType === 'PRE_SCHOOL' ? 'FOUNDATION' : 'PRIMARY',
    className: selectedInstitutionObj?.institutionType === 'PRE_SCHOOL' ? 'Nursery' : 'Class 4',
    sectionName: 'A',
    rollNumber: '1',
    admissionNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],

    parentName: '',
    parentRelationship: 'FATHER',
    parentPhone: '',
    parentEmail: '',
    parentOccupation: '',
    parentAddress: '',
  });

  // Keep filters in sync with top header switcher
  useEffect(() => {
    setFilters(prev => ({ ...prev, institutionCode: currentInstitution }));
    setFormData(prev => ({
      ...prev,
      institutionCode: currentInstitution === 'ALL' ? 'CBS' : currentInstitution,
      academicStage: selectedInstitutionObj?.institutionType === 'PRE_SCHOOL' ? 'FOUNDATION' : 'PRIMARY',
      className: selectedInstitutionObj?.institutionType === 'PRE_SCHOOL' ? 'Nursery' : 'Class 4',
    }));
  }, [currentInstitution, selectedInstitutionObj]);

  const fetchStudents = async () => {
    setIsLoading(true);
    const res = await getFilteredUniversalStudentsAction(filters);
    if (res.success) {
      setStudents(res.data);
      if (res.counts) {
        setCounts(res.counts);
      }
    } else {
      setStudents([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  // Stage-Aware Class Options Engine
  const getClassOptionsForStage = (stage: string, instCode: string) => {
    if (instCode === 'AS' || instCode === 'CBPS' || stage === 'FOUNDATION') {
      return [
        { value: 'Pre-Nursery', label: 'Pre-Nursery' },
        { value: 'Nursery', label: 'Nursery' },
        { value: 'LKG', label: 'LKG' },
        { value: 'UKG', label: 'UKG' },
        { value: 'Class 1', label: 'Class 1' },
        { value: 'Class 2', label: 'Class 2' },
      ];
    }
    if (stage === 'PRIMARY') {
      return [
        { value: 'Class 3', label: 'Class 3' },
        { value: 'Class 4', label: 'Class 4' },
        { value: 'Class 5', label: 'Class 5' },
      ];
    }
    if (stage === 'MIDDLE') {
      return [
        { value: 'Class 6', label: 'Class 6' },
        { value: 'Class 7', label: 'Class 7' },
        { value: 'Class 8', label: 'Class 8' },
      ];
    }
    if (stage === 'SECONDARY') {
      return [
        { value: 'Class 9', label: 'Class 9' },
        { value: 'Class 10', label: 'Class 10' },
      ];
    }
    if (stage === 'SENIOR_SECONDARY') {
      return [
        { value: 'Class 11 (Science - PCM)', label: 'Class 11 (Science - PCM)' },
        { value: 'Class 11 (Science - PCB)', label: 'Class 11 (Science - PCB)' },
        { value: 'Class 11 (Commerce)', label: 'Class 11 (Commerce)' },
        { value: 'Class 11 (Humanities)', label: 'Class 11 (Humanities)' },
        { value: 'Class 12 (Science - PCM)', label: 'Class 12 (Science - PCM)' },
        { value: 'Class 12 (Science - PCB)', label: 'Class 12 (Science - PCB)' },
        { value: 'Class 12 (Commerce)', label: 'Class 12 (Commerce)' },
        { value: 'Class 12 (Humanities)', label: 'Class 12 (Humanities)' },
      ];
    }
    return [
      { value: 'Class 1', label: 'Class 1' },
      { value: 'Class 4', label: 'Class 4' },
      { value: 'Class 8', label: 'Class 8' },
    ];
  };

  // Step 3 Live Duplicate Pre-Check
  const handleCheckDuplicates = async () => {
    if (formData.parentPhone && formData.firstName && formData.lastName) {
      const res = await checkStudentDuplicateAction(formData.firstName, formData.lastName, formData.dob, formData.parentPhone);
      if (res.success && (res.hasDuplicateStudent || res.hasExistingFamily)) {
        setDuplicateWarning(res);
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  // Transactional Submit Action
  const handleCompleteEnrollment = async () => {
    setIsSubmitting(true);
    const res = await enrollUniversalStudentTransactionalAction(formData);
    if (res.success) {
      setIsEnrollModalOpen(false);
      setWizardStep(1);
      setDuplicateWarning(null);
      setIsManualAdmissionNo(false);
      // Reset form
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        dob: '2016-05-15',
        gender: 'Male',
        bloodGroup: 'O+',
        nationality: 'Indian',
        category: 'General',
        aadhaarNo: '',
        isTestRecord: false,

        institutionCode: currentInstitution === 'ALL' ? 'CBS' : currentInstitution,
        academicSession: '2026-2027',
        academicStage: selectedInstitutionObj?.institutionType === 'PRE_SCHOOL' ? 'FOUNDATION' : 'PRIMARY',
        className: selectedInstitutionObj?.institutionType === 'PRE_SCHOOL' ? 'Nursery' : 'Class 4',
        sectionName: 'A',
        rollNumber: '1',
        admissionNumber: '',
        admissionDate: new Date().toISOString().split('T')[0],

        parentName: '',
        parentRelationship: 'FATHER',
        parentPhone: '',
        parentEmail: '',
        parentOccupation: '',
        parentAddress: '',
      });
      fetchStudents();
    } else {
      alert(`Enrollment Failed: ${res.error}`);
    }
    setIsSubmitting(false);
  };

  const handleDeleteTestStudent = async (studentId: string) => {
    await deleteTestStudentTransactionalAction(studentId);
    fetchStudents();
  };

  // Re-Admission State
  const [isReadmitModalOpen, setIsReadmitModalOpen] = useState(false);
  const [targetStudentForReadmit, setTargetStudentForReadmit] = useState<any>(null);
  const [readmitForm, setReadmitForm] = useState({
    institutionCode: 'CBS',
    academicSession: '2026-2027',
    className: 'Class 3',
    sectionName: 'A',
    academicStage: 'PRIMARY',
    admissionNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    remarks: 'Student re-admitted to active roster.'
  });
  const [isSubmittingReadmit, setIsSubmittingReadmit] = useState(false);
  const [readmitToastMsg, setReadmitToastMsg] = useState<string | null>(null);

  const handleConfirmArchive = async () => {
    if (targetStudentForArchive) {
      await archiveStudentAction(targetStudentForArchive.id, archiveReason);
      setIsArchiveModalOpen(false);
      setTargetStudentForArchive(null);
      fetchStudents();
    }
  };

  const handleOpenReadmitModal = (row: any) => {
    setTargetStudentForReadmit(row);
    setReadmitForm({
      institutionCode: row.institution_code || (currentInstitution === 'ALL' ? 'CBS' : currentInstitution),
      academicSession: '2026-2027',
      className: row.class_name || 'Class 3',
      sectionName: row.section_name || 'A',
      academicStage: row.academic_stage || 'PRIMARY',
      admissionNumber: row.admission_number || row.admission_no || '',
      admissionDate: new Date().toISOString().split('T')[0],
      remarks: `Student re-admitted after previous departure period (Session ${row.academic_session || '2025-2026'}).`
    });
    setIsReadmitModalOpen(true);
  };

  const handleConfirmReadmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentForReadmit) return;

    setIsSubmittingReadmit(true);
    const res = await readmitStudentAction({
      studentId: targetStudentForReadmit.id,
      institutionCode: readmitForm.institutionCode,
      academicSession: readmitForm.academicSession,
      className: readmitForm.className,
      sectionName: readmitForm.sectionName,
      academicStage: readmitForm.academicStage,
      admissionNumber: readmitForm.admissionNumber,
      admissionDate: readmitForm.admissionDate,
      remarks: readmitForm.remarks
    });
    setIsSubmittingReadmit(false);

    if (res.success) {
      setReadmitToastMsg(res.message || 'Student re-admitted successfully!');
      setIsReadmitModalOpen(false);
      setTargetStudentForReadmit(null);
      fetchStudents();
      setTimeout(() => setReadmitToastMsg(null), 6000);
    } else {
      alert(`Error re-admitting student: ${res.error}`);
    }
  };

  const columns = [
    {
      key: 'student',
      header: 'Student & Universal ID',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs overflow-hidden border border-slate-200">
            {row.photo_url ? (
              <img src={row.photo_url} alt={row.first_name} className="w-full h-full object-cover" />
            ) : (
              <span>{row.first_name?.[0]}{row.last_name?.[0]}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 block text-sm">
                {row.first_name} {row.middle_name ? `${row.middle_name} ` : ''}{row.last_name}
              </span>
              {row.is_test_record && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  TEST
                </span>
              )}
            </div>
            <span className="text-indigo-600 font-mono font-bold text-[10px]">
              {row.universal_id || `STU-VET-${row.id.slice(0, 6).toUpperCase()}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'admission_no',
      header: 'Admission Number',
      render: (row: any) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
          {row.admission_number || 'N/A'}
        </span>
      ),
    },
    {
      key: 'enrollment',
      header: 'School & Stage',
      render: (row: any) => (
        <div>
          <span className="font-bold text-slate-800 block text-xs">
            {row.institution_code} • {row.academic_stage || 'PRIMARY'}
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">
            {row.class_name || 'Class Unallocated'} ({row.section_name || 'A'})
          </span>
        </div>
      ),
    },
    {
      key: 'transport',
      header: 'Transport Mode',
      render: (row: any) => (
        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 inline-flex items-center gap-1">
          🚌 {row.transport_mode ? row.transport_mode.replace('_', ' ') : 'SCHOOL BUS'}
        </span>
      ),
    },
    {
      key: 'parent',
      header: 'Family / Guardian',
      render: (row: any) => (
        <div>
          <span className="font-bold text-slate-800 block text-xs">
            {row.guardian_first ? `${row.guardian_first} ${row.guardian_last}` : row.family_name || 'Primary Contact'}
          </span>
          <span className="text-slate-500 text-[10px]">📞 {row.guardian_phone || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Student Status',
      render: (row: any) => {
        const subStatus = row.subStatus || (row.student_status === 'TRANSFERRED' || row.tc_number ? 'TRANSFERRED' : row.student_status === 'WITHDRAWN' ? 'WITHDRAWN' : row.student_status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE');

        if (subStatus === 'TRANSFERRED') {
          return (
            <div className="flex flex-col gap-0.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border bg-purple-50 text-purple-700 border-purple-200 inline-flex items-center gap-1 w-fit">
                <span>🔄</span> Transferred
              </span>
              {row.tc_number ? (
                <span className="text-[10px] text-purple-700 font-mono font-medium flex items-center gap-0.5">
                  <span>📜</span> {row.tc_number}
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 font-medium">TC Generated</span>
              )}
            </div>
          );
        }
        if (subStatus === 'WITHDRAWN') {
          return (
            <div className="flex flex-col gap-0.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border bg-rose-50 text-rose-700 border-rose-200 inline-flex items-center gap-1 w-fit">
                <span>⚠️</span> Withdrawn
              </span>
              <span className="text-[9px] text-rose-500 font-medium">Admission Cancelled</span>
            </div>
          );
        }
        if (subStatus === 'ARCHIVED') {
          return (
            <div className="flex flex-col gap-0.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border bg-slate-100 text-slate-600 border-slate-300 inline-flex items-center gap-1 w-fit">
                <span>📁</span> Archived
              </span>
              <span className="text-[9px] text-slate-400 font-medium">Administrative</span>
            </div>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
          </span>
        );
      },
    },
    {
      key: 'dues',
      header: 'Fee Ledger / Dues',
      render: (row: any) => {
        const pending = Number(row.pending_balance || 0);
        if (pending > 0) {
          return (
            <Link href="/admin/finance/collections" title="Click to Collect Fee in Finance POS">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-amber-50 text-amber-800 border-amber-300 inline-flex items-center gap-1 hover:bg-amber-100 transition cursor-pointer">
                <span>⚠️</span> ₹{pending.toLocaleString('en-IN')} Due
              </span>
            </Link>
          );
        }
        return (
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
            <span className="text-emerald-500">✓</span> Cleared
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (row: any) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.subStatus !== 'ACTIVE' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleOpenReadmitModal(row)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Re-Admit
            </Button>
          )}

          <Link href={`/admin/students/${row.id}`}>
            <Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />}>
              Dossier
            </Button>
          </Link>
          
          {row.is_test_record ? (
            <button
              onClick={() => handleDeleteTestStudent(row.id)}
              title="Delete Test Student (Permanent Cleanup)"
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : row.subStatus === 'ACTIVE' ? (
            <button
              onClick={() => {
                setTargetStudentForArchive(row);
                setIsArchiveModalOpen(true);
              }}
              title="Archive / Deactivate Student"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <Archive className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Universal Student Master V1 (ACID Transactional)
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">{students.length} Enrolled in Scope</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Universal Student Master Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Permanent universal student identities with decoupled institutional enrollments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchStudents} isLoading={isLoading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Live DB
          </Button>
          <Button variant="secondary" size="md" onClick={() => { setWizardStep(1); setIsEnrollModalOpen(true); }} leftIcon={<Plus className="w-4 h-4" />}>
            Enroll New Student
          </Button>
        </div>
      </div>

      {/* Top Segmented Status Category Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
        <button
          type="button"
          onClick={() => setFilters(prev => ({ ...prev, status: 'ACTIVE' }))}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap border shadow-2xs ${
            filters.status === 'ACTIVE'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${filters.status === 'ACTIVE' ? 'bg-white' : 'bg-emerald-500'}`} />
          Active Enrolled Students
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            filters.status === 'ACTIVE' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-600'
          }`}>
            {counts.totalActive}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilters(prev => ({ ...prev, status: 'ARCHIVED_HUB' }))}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap border shadow-2xs ${
            filters.status === 'ARCHIVED_HUB'
              ? 'bg-slate-800 text-white border-slate-800 shadow-slate-200'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <span>📁</span>
          Archived & Departed Hub
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            filters.status === 'ARCHIVED_HUB' ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {counts.totalArchivedHub}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilters(prev => ({ ...prev, status: 'TRANSFERRED' }))}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap border shadow-2xs ${
            filters.status === 'TRANSFERRED'
              ? 'bg-purple-600 text-white border-purple-600 shadow-purple-200'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <span>📜</span>
          TC Generated (Transferred)
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            filters.status === 'TRANSFERRED' ? 'bg-purple-700 text-purple-100' : 'bg-slate-100 text-slate-600'
          }`}>
            {counts.totalTransferred}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilters(prev => ({ ...prev, status: 'WITHDRAWN' }))}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap border shadow-2xs ${
            filters.status === 'WITHDRAWN'
              ? 'bg-rose-600 text-white border-rose-600 shadow-rose-200'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <span>⚠️</span>
          Withdrawn Students
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            filters.status === 'WITHDRAWN' ? 'bg-rose-700 text-rose-100' : 'bg-slate-100 text-slate-600'
          }`}>
            {counts.totalWithdrawn}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilters(prev => ({ ...prev, status: 'ALL' }))}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap border shadow-2xs ${
            filters.status === 'ALL'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <span>🌐</span>
          All Directory Records
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            filters.status === 'ALL' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
          }`}>
            {counts.totalAll}
          </span>
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Top Search Bar with Instant Debouncing & Clear */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Instant Search: Type student name, Universal ID (STU-VET-XXXX), admission no, TC no, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-slate-200/60 hover:bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition"
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          {(filters.search || filters.className !== 'ALL' || filters.sectionName !== 'ALL' || filters.status !== 'ACTIVE' || filters.academicStage !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilters(prev => ({
                  ...prev,
                  search: '',
                  academicStage: 'ALL',
                  className: 'ALL',
                  sectionName: 'ALL',
                  status: 'ACTIVE',
                }));
              }}
              className="shrink-0 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Dynamic Filter Dropdowns (School - Session - Stage - Class - Section - Status) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <Select
            label="School"
            options={[
              { value: 'ALL', label: 'All Schools' },
              { value: 'CBS', label: 'CBS (K-12 CBSE)' },
              { value: 'AVM', label: 'AVM (K-12 CBSE)' },
              { value: 'AS', label: 'AS (Kindergarten)' },
              { value: 'CBPS', label: 'CBPS (Kindergarten)' },
            ]}
            value={filters.institutionCode || 'ALL'}
            onChange={(e) => setFilters(prev => ({ ...prev, institutionCode: e.target.value }))}
          />

          <Select
            label="Session"
            options={[
              { value: '2026-2027', label: '2026–2027 (Active)' },
              { value: '2025-2026', label: '2025–2026' },
              { value: 'ALL', label: 'All Sessions' },
            ]}
            value={filters.academicSession || '2026-2027'}
            onChange={(e) => setFilters(prev => ({ ...prev, academicSession: e.target.value }))}
          />

          <Select
            label="Stage"
            options={[
              { value: 'ALL', label: 'All Stages' },
              { value: 'FOUNDATION', label: 'Foundation (Pre-K - 2)' },
              { value: 'PRIMARY', label: 'Primary (3 - 5)' },
              { value: 'MIDDLE', label: 'Middle (6 - 8)' },
              { value: 'SECONDARY', label: 'Secondary (9 - 10)' },
              { value: 'SENIOR_SECONDARY', label: 'Senior Sec (11 - 12)' },
            ]}
            value={filters.academicStage || 'ALL'}
            onChange={(e) => setFilters(prev => ({ ...prev, academicStage: e.target.value }))}
          />

          <Select
            label="Class"
            options={[
              { value: 'ALL', label: 'All Classes' },
              { value: 'Pre-Nursery', label: 'Pre-Nursery' },
              { value: 'Nursery', label: 'Nursery' },
              { value: 'LKG', label: 'LKG' },
              { value: 'UKG', label: 'UKG' },
              { value: 'Class 1', label: 'Class 1' },
              { value: 'Class 2', label: 'Class 2' },
              { value: 'Class 3', label: 'Class 3' },
              { value: 'Class 4', label: 'Class 4' },
              { value: 'Class 5', label: 'Class 5' },
              { value: 'Class 6', label: 'Class 6' },
              { value: 'Class 7', label: 'Class 7' },
              { value: 'Class 8', label: 'Class 8' },
              { value: 'Class 9', label: 'Class 9' },
              { value: 'Class 10', label: 'Class 10' },
              { value: 'Class 11', label: 'Class 11' },
              { value: 'Class 12', label: 'Class 12' },
            ]}
            value={filters.className || 'ALL'}
            onChange={(e) => setFilters(prev => ({ ...prev, className: e.target.value }))}
          />

          <Select
            label="Section"
            options={[
              { value: 'ALL', label: 'All Sections' },
              { value: 'A', label: 'Section A' },
              { value: 'B', label: 'Section B' },
              { value: 'C', label: 'Section C' },
            ]}
            value={filters.sectionName || 'ALL'}
            onChange={(e) => setFilters(prev => ({ ...prev, sectionName: e.target.value }))}
          />

          <Select
            label="Status Lifecycle"
            options={[
              { value: 'ACTIVE', label: 'Active Enrolled (Default)' },
              { value: 'ARCHIVED_HUB', label: '📁 Archived & Departed Hub' },
              { value: 'TRANSFERRED', label: '📜 TC Generated / Transferred' },
              { value: 'WITHDRAWN', label: '⚠️ Withdrawn (Cancelled)' },
              { value: 'ARCHIVED', label: '📁 Archived (Administrative)' },
              { value: 'ALL', label: '🌐 All Records (Active & Inactive)' },
            ]}
            value={filters.status || 'ACTIVE'}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          />
        </div>

        {/* Live Filter Metric Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-medium gap-2">
          <div className="flex items-center flex-wrap gap-2">
            <span>Showing <strong className="text-slate-900 font-bold">{students.length}</strong> students</span>
            {filters.status === 'ACTIVE' && (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                ✓ Transferred & Withdrawn students excluded from Active list
              </span>
            )}
            {filters.status === 'ARCHIVED_HUB' && (
              <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300 font-bold flex items-center gap-1">
                <span>📁</span> Archived & Departed Student Master Head (Transferred, Withdrawn, Archived)
              </span>
            )}
            {filters.status === 'TRANSFERRED' && (
              <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 font-bold flex items-center gap-1">
                <span>📜</span> TC Generated / Transferred Out Students
              </span>
            )}
            {filters.status === 'WITHDRAWN' && (
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-bold flex items-center gap-1">
                <span>⚠️</span> Withdrawn / Cancelled Admissions
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {students.some((s: any) => Number(s.pending_balance || 0) > 0 && (s.subStatus === 'TRANSFERRED' || s.subStatus === 'WITHDRAWN' || s.subStatus === 'ARCHIVED')) && (
              <Link href="/admin/finance/collections" className="text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200 font-bold flex items-center gap-1 transition">
                <span>⚠️</span> Departed Students Arrears in Finance →
              </Link>
            )}
            {isLoading && (
              <span className="text-indigo-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" /> Loading live data...
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Live Data Table with Clean Empty State */}
      <DataTable
        title="Universal Student Master Directory (Live Database)"
        subtitle="Direct records from PostgreSQL `students`, `student_enrollments`, and `families` tables"
        columns={columns}
        data={students}
        searchKey="first_name"
        searchPlaceholder="Search student in scope..."
        emptyTitle="No Students Enrolled in Database"
        emptyDescription="Your database currently has 0 student records matching your filters. Click 'Enroll New Student' above to start enrollment."
        addLabel="Enroll First Student"
        onAddFirst={() => { setWizardStep(1); setIsEnrollModalOpen(true); }}
      />

      {/* 4-Step Transactional Enrollment Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll New Student (Universal Master V1)"
        description="Creates Student Master + Family + Institutional Enrollment in a single transactional commit."
        maxWidth="xl"
      >
        <div className="space-y-5 font-sans">
          
          {/* Wizard Step Progress Bar */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold border-b border-slate-100 pb-3">
            {[
              { step: 1, label: '1. Student Demographics' },
              { step: 2, label: '2. School & Class' },
              { step: 3, label: '3. Guardian & Family' },
              { step: 4, label: '4. Review & Commit' },
            ].map((s) => (
              <div
                key={s.step}
                className={`py-1.5 rounded-xl transition ${
                  wizardStep === s.step
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : wizardStep > s.step
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>

          {/* STEP 1: Student Information */}
          {wizardStep === 1 && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 1 — Student Demographics</h4>
              
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="First Name *"
                  placeholder="e.g. Aarav"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                  label="Middle Name"
                  placeholder="e.g. Kumar"
                  value={formData.middleName || ''}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                />
                <Input
                  label="Last Name *"
                  placeholder="e.g. Sharma"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Date of Birth *"
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
                <Select
                  label="Gender *"
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                />
                <Select
                  label="Blood Group"
                  options={[
                    { value: 'O+', label: 'O+' },
                    { value: 'A+', label: 'A+' },
                    { value: 'B+', label: 'B+' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'O-', label: 'O-' },
                  ]}
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Nationality"
                  placeholder="Indian"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                />
                <Select
                  label="Social Category"
                  options={[
                    { value: 'General', label: 'General' },
                    { value: 'OBC', label: 'OBC' },
                    { value: 'SC', label: 'SC' },
                    { value: 'ST', label: 'ST' },
                    { value: 'EWS', label: 'EWS' },
                  ]}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                <Input
                  label="Aadhaar / Government ID"
                  placeholder="XXXX-XXXX-XXXX"
                  value={formData.aadhaarNo}
                  onChange={(e) => setFormData({ ...formData, aadhaarNo: e.target.value })}
                />
              </div>

              {/* Test Data Flag */}
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <input
                  type="checkbox"
                  id="testRecordCheck"
                  checked={formData.isTestRecord}
                  onChange={(e) => setFormData({ ...formData, isTestRecord: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="testRecordCheck" className="text-amber-900 font-semibold cursor-pointer">
                  Mark as Test Record (enables 1-click permanent cleanup for development/testing)
                </label>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!formData.firstName || !formData.lastName) {
                      alert('Please provide student first and last name.');
                      return;
                    }
                    setWizardStep(2);
                  }}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Continue to Enrollment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Enrollment Information */}
          {wizardStep === 2 && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 2 — Institutional Enrollment</h4>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Operating Institution *"
                  options={[
                    { value: 'CBS', label: 'CBS (Crayon Box School - K-12 CBSE)' },
                    { value: 'AVM', label: 'AVM (Avinya Vidya Mandir - K-12 CBSE)' },
                    { value: 'AS', label: 'AS (Avinya School - Kindergarten Montessori)' },
                    { value: 'CBPS', label: 'CBPS (Crayon Box Pre School - Kindergarten)' },
                  ]}
                  value={formData.institutionCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const isPre = code === 'AS' || code === 'CBPS';
                    setFormData({
                      ...formData,
                      institutionCode: code,
                      academicStage: isPre ? 'FOUNDATION' : 'PRIMARY',
                      className: isPre ? 'Nursery' : 'Class 4',
                    });
                  }}
                />

                <Select
                  label="Academic Session *"
                  options={[
                    { value: '2026-2027', label: '2026–2027 (Active Session)' },
                    { value: '2025-2026', label: '2025–2026 (Previous)' },
                  ]}
                  value={formData.academicSession}
                  onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="Academic Stage *"
                  options={
                    formData.institutionCode === 'AS' || formData.institutionCode === 'CBPS'
                      ? [{ value: 'FOUNDATION', label: 'Foundation (Montessori)' }]
                      : [
                          { value: 'PRIMARY', label: 'Primary (Classes 3-5)' },
                          { value: 'MIDDLE', label: 'Middle (Classes 6-8)' },
                          { value: 'SECONDARY', label: 'Secondary (Classes 9-10)' },
                          { value: 'SENIOR_SECONDARY', label: 'Senior Secondary (11-12)' },
                        ]
                  }
                  value={formData.academicStage}
                  onChange={(e) => setFormData({ ...formData, academicStage: e.target.value })}
                />

                <Select
                  label="Class / Grade *"
                  options={getClassOptionsForStage(formData.academicStage, formData.institutionCode)}
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                />

                <Select
                  label="Section *"
                  options={[
                    { value: 'A', label: 'Section A' },
                    { value: 'B', label: 'Section B' },
                    { value: 'C', label: 'Section C' },
                    { value: 'D', label: 'Section D' },
                  ]}
                  value={formData.sectionName}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Roll Number"
                  placeholder="e.g. 1"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                />
                <Input
                  label="Admission Date *"
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                />
              </div>

              {/* Admission Number Mode Selector */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Admission Number Assignment</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="admissionNoMode"
                        checked={!isManualAdmissionNo}
                        onChange={() => {
                          setIsManualAdmissionNo(false);
                          setFormData({ ...formData, admissionNumber: '' });
                        }}
                        className="text-indigo-600"
                      />
                      Auto-Generate
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="admissionNoMode"
                        checked={isManualAdmissionNo}
                        onChange={() => setIsManualAdmissionNo(true)}
                        className="text-indigo-600"
                      />
                      Enter Manually
                    </label>
                  </div>
                </div>

                {isManualAdmissionNo ? (
                  <Input
                    label="Custom Admission Number *"
                    placeholder="e.g. CBS-2026-0042, 1253481/09, ADM-9021"
                    value={formData.admissionNumber || ''}
                    onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                  />
                ) : (
                  <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 font-mono font-medium">
                    Auto-generated format: <strong className="text-slate-800">{formData.institutionCode}-2026-XXXX</strong>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-3">
                <Button variant="outline" onClick={() => setWizardStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button variant="secondary" onClick={() => setWizardStep(3)} rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Continue to Guardian & Family
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Guardian & Family Linking */}
          {wizardStep === 3 && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 3 — Primary Guardian & Family 360</h4>

              {/* Live Duplicate / Existing Family Alert Banner */}
              {duplicateWarning?.hasExistingFamily && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Existing Family Profile Detected!
                  </div>
                  <p className="text-indigo-800">
                    Found <strong>{duplicateWarning.existingFamily.family_name}</strong> ({duplicateWarning.existingFamily.family_code}). 
                    This student will automatically be linked as a sibling under this household!
                  </p>
                </div>
              )}

              {duplicateWarning?.hasDuplicateStudent && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Possible Duplicate Student Warning
                  </div>
                  <p className="text-amber-800">
                    A student named <strong>{duplicateWarning.existingStudent.first_name} {duplicateWarning.existingStudent.last_name}</strong> with same DOB is already enrolled in {duplicateWarning.existingStudent.institution_code} ({duplicateWarning.existingStudent.class_name}).
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Primary Guardian Full Name *"
                  placeholder="e.g. Rahul Sharma"
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                />
                <Select
                  label="Relationship *"
                  options={[
                    { value: 'FATHER', label: 'Father' },
                    { value: 'MOTHER', label: 'Mother' },
                    { value: 'LEGAL_GUARDIAN', label: 'Legal Guardian' },
                  ]}
                  value={formData.parentRelationship}
                  onChange={(e) => setFormData({ ...formData, parentRelationship: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Primary Mobile Number *"
                  placeholder="e.g. 9810012345"
                  required
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  onBlur={handleCheckDuplicates}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. rahul.sharma@example.com"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Occupation / Profession"
                  placeholder="e.g. Software Architect"
                  value={formData.parentOccupation}
                  onChange={(e) => setFormData({ ...formData, parentOccupation: e.target.value })}
                />
                <Input
                  label="Residential Address"
                  placeholder="e.g. Flat 402, Royal Residency, Delhi NCR"
                  value={formData.parentAddress}
                  onChange={(e) => setFormData({ ...formData, parentAddress: e.target.value })}
                />
              </div>

              <div className="flex justify-between pt-3">
                <Button variant="outline" onClick={() => setWizardStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!formData.parentName || !formData.parentPhone) {
                      alert('Please provide Guardian Name and Mobile.');
                      return;
                    }
                    handleCheckDuplicates();
                    setWizardStep(4);
                  }}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Review & Final Commit
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Transactional Commit */}
          {wizardStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 4 — Review & Commit to PostgreSQL</h4>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {formData.firstName} {formData.middleName ? `${formData.middleName} ` : ''}{formData.lastName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                    {formData.institutionCode} • {formData.academicSession}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><strong>DOB:</strong> {formData.dob} ({formData.gender})</div>
                  <div><strong>Blood Group:</strong> {formData.bloodGroup}</div>
                  <div><strong>Stage & Class:</strong> {formData.academicStage} — {formData.className} ({formData.sectionName})</div>
                  <div><strong>Admission Date:</strong> {formData.admissionDate}</div>
                  <div><strong>Primary Guardian:</strong> {formData.parentName} ({formData.parentRelationship})</div>
                  <div><strong>Mobile:</strong> 📞 {formData.parentPhone}</div>
                </div>

                {formData.isTestRecord && (
                  <div className="p-2 bg-amber-100/70 border border-amber-300 rounded-lg text-amber-900 font-bold">
                    ⚠️ Marked as TEST RECORD. You can permanently wipe this test entry anytime.
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setWizardStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Guardian
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCompleteEnrollment}
                  isLoading={isSubmitting}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Commit Enrollment (ACID Transaction)
                </Button>
              </div>
            </div>
          )}

        </div>
      </Modal>

      {/* Production Archive Confirmation Modal */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title="Archive / Deactivate Student Record"
        description="Preserves student academic, attendance, and financial history for audits while revoking active status."
        maxWidth="md"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-slate-700 font-medium">
            Are you sure you want to archive <strong>{targetStudentForArchive?.first_name} {targetStudentForArchive?.last_name}</strong>?
          </p>

          <Input
            label="Reason for Archival *"
            placeholder="e.g. TC Issued / Parent Relocation"
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsArchiveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmArchive}>
              Confirm Archive
            </Button>
          </div>
        </div>
      </Modal>

      {/* 🌟 RE-ADMIT / RESTORE DEPARTED STUDENT MODAL */}
      {isReadmitModalOpen && targetStudentForReadmit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Re-Admit & Restore Student to Active Roster
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Creates a separate new enrollment period while preserving historical records
                  </span>
                </div>
              </div>
              <button onClick={() => setIsReadmitModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <span className="font-extrabold text-sm block">
                Student: {targetStudentForReadmit.first_name} {targetStudentForReadmit.last_name} ({targetStudentForReadmit.universal_id})
              </span>
              <p className="text-slate-600 font-medium">
                Departed Status: <strong className="uppercase text-amber-700">{targetStudentForReadmit.subStatus || targetStudentForReadmit.student_status}</strong> • Previous Admission No: <strong className="font-mono">{targetStudentForReadmit.admission_number || targetStudentForReadmit.admission_no}</strong>.
              </p>
            </div>

            <form onSubmit={handleConfirmReadmit} className="space-y-4 text-xs">
              
              {/* Row 1: Target Campus & Academic Session */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Campus / School *</label>
                  <select
                    value={readmitForm.institutionCode}
                    onChange={(e) => setReadmitForm({ ...readmitForm, institutionCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="CBS">Crayon Box School (CBS)</option>
                    <option value="CBPS">Crayon Box Play School (CBPS)</option>
                    <option value="AS">Ananda School (AS)</option>
                    <option value="AVM">Ananda Vidya Mandir (AVM)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Re-Admission Academic Session *</label>
                  <select
                    value={readmitForm.academicSession}
                    onChange={(e) => setReadmitForm({ ...readmitForm, academicSession: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="2026-2027">2026–2027 (Active Master Session)</option>
                    <option value="2027-2028">2027–2028 (Upcoming Session)</option>
                    <option value="2025-2026">2025–2026 (Past Session)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Class & Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Enrolling Class *</label>
                  <select
                    value={readmitForm.className}
                    onChange={(e) => setReadmitForm({ ...readmitForm, className: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="Pre-Nursery">Pre-Nursery (Early Years)</option>
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG / KG-1</option>
                    <option value="UKG">UKG / KG-2</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Section</label>
                  <select
                    value={readmitForm.sectionName}
                    onChange={(e) => setReadmitForm({ ...readmitForm, sectionName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Admission Number & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Admission Number (Retained or New)</label>
                  <input
                    type="text"
                    value={readmitForm.admissionNumber}
                    onChange={(e) => setReadmitForm({ ...readmitForm, admissionNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. CBS-2026-0042"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date of Re-Admission *</label>
                  <input
                    type="date"
                    value={readmitForm.admissionDate}
                    onChange={(e) => setReadmitForm({ ...readmitForm, admissionDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Row 4: Remarks / Reason */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Re-Admission Remarks / Family Reason</label>
                <textarea
                  rows={2}
                  value={readmitForm.remarks}
                  onChange={(e) => setReadmitForm({ ...readmitForm, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Family relocated back to city; student re-admitted to Class 3."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsReadmitModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  isLoading={isSubmittingReadmit}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Confirm Re-Admission & Activate Profile
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {readmitToastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          <span>{readmitToastMsg}</span>
        </div>
      )}

    </div>
  );
}
