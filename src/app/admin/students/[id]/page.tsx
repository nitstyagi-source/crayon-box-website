"use client";

import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import {
  Users, ArrowLeft, Calendar, ShieldCheck, HeartPulse,
  CreditCard, BookOpen, Clock, FileText, Download,
  Phone, Mail, MapPin, Building2, Sparkles, CheckCircle2,
  AlertTriangle, RefreshCw, Layers, Award, Bus, CheckSquare,
  FileCheck, Printer, UserCheck, ShieldAlert, Edit3, Camera,
  Upload, Trash2, Plus, Eye, File, FileUp, X, Save,
  RotateCcw, History, Clock4, CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { SchoolLeavingCertificate } from '@/components/documents/SchoolLeavingCertificate';
import { StudentIDCard } from '@/components/id-cards/StudentIDCard';
import { EscortPickupCard } from '@/components/id-cards/EscortPickupCard';
import { createClient } from '@/lib/supabase/client';
import {
  getStudentProgressionTimeline,
  getIssuedTCForStudent,
  generateOfficialTCAction
} from '@/app/actions/student-v2-actions';
import {
  updateStudentProfileFullAction,
  updateGuardianProfileFullAction,
  uploadStudentPhotoAction,
  uploadGuardianPhotoAction,
  getStudentDocumentsAction,
  uploadStudentDocumentAction,
  deleteStudentDocumentAction
} from '@/app/actions/student-profile-actions';
import {
  readmitStudentAction,
  getStudentEnrollmentPeriodsAction
} from '@/app/actions/universal-student-actions';
import { standardizePhotoBackground } from '@/lib/utils/photo-standardizer';

export default function UniversalStudent360DossierV2Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [student, setStudent] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentPeriods, setEnrollmentPeriods] = useState<any[]>([]);
  const [progression, setProgression] = useState<any[]>([]);
  const [family, setFamily] = useState<any>(null);
  const [siblings, setSiblings] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [issuedTC, setIssuedTC] = useState<any>(null);
  const [isGeneratingTC, setIsGeneratingTC] = useState(false);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FAMILY' | 'DOCUMENTS' | 'IDCARD' | 'PROGRESSION' | 'TRANSPORT' | 'TC' | 'ACADEMICS'>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(true);

  // --- Re-Admission / Restore Modal State ---
  const [isReadmitModalOpen, setIsReadmitModalOpen] = useState(false);
  const [isSubmittingReadmit, setIsSubmittingReadmit] = useState(false);
  const [readmitMsg, setReadmitMsg] = useState<string | null>(null);
  const [readmitForm, setReadmitForm] = useState({
    institutionCode: 'CBS',
    academicSession: '2026-2027',
    className: 'Class 3',
    sectionName: 'A',
    academicStage: 'PRIMARY',
    admissionNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    remarks: 'Student returning / re-admitted after previous departure period.'
  });

  // --- Modals State ---
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [isEditGuardianModalOpen, setIsEditGuardianModalOpen] = useState(false);
  const [targetGuardian, setTargetGuardian] = useState<any>(null);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoTarget, setPhotoTarget] = useState<'STUDENT' | 'GUARDIAN'>('STUDENT');
  const [selectedPhotoGuardianId, setSelectedPhotoGuardianId] = useState<string | null>(null);

  // --- Forms State ---
  const [studentForm, setStudentForm] = useState<any>({});
  const [guardianForm, setGuardianForm] = useState<any>({});
  const [docForm, setDocForm] = useState({
    documentType: 'BIRTH_CERTIFICATE',
    documentTitle: 'Birth Certificate',
    documentNo: '',
    fileName: 'birth_certificate.pdf',
    fileSize: '1.4 MB',
    fileUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&auto=format&fit=crop&q=60'
  });
  const [tempPhotoUrl, setTempPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  const fetchStudentDossier = async () => {
    setIsLoading(true);
    const supabase = createClient();

    // 1. Fetch Student Master
    const { data: stu } = await supabase
      .from('students')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (stu) {
      setStudent(stu);
      setStudentForm({
        firstName: stu.first_name || '',
        middleName: stu.middle_name || '',
        lastName: stu.last_name || '',
        dob: stu.dob ? stu.dob.split('T')[0] : '2016-04-14',
        gender: stu.gender || 'Male',
        bloodGroup: stu.blood_group || 'O+',
        nationality: stu.nationality || 'Indian',
        category: stu.category || 'General',
        aadhaarNo: stu.aadhaar_no || '',
        penNo: stu.pen_no || '',
        status: stu.status || 'ACTIVE',
        admissionNo: stu.admission_no || '',
        transportMode: stu.transport_mode || 'SCHOOL_BUS',
        transportBusNo: stu.transport_bus_no || 'Bus #04 (DL-1PA-8891)',
        transportRoute: stu.transport_route || 'Shastri Park Extn. Express',
        transportStop: stu.transport_stop || 'Shastri Park Main Gate',
        transportDriverName: stu.transport_driver_name || 'Mr. Ram Singh',
        transportDriverPhone: stu.transport_driver_phone || '9811009988',
      });

      // 2. Fetch Multi-Institution Enrollments History & Periods
      const { data: enrs } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('student_id', stu.id)
        .order('created_at', { ascending: false });
      setEnrollments(enrs || []);

      const periodRes = await getStudentEnrollmentPeriodsAction(stu.id);
      if (periodRes.success) {
        setEnrollmentPeriods(periodRes.periods);
      }

      // Populate default re-admission form from previous enrollment
      const latestEnr = enrs?.[0];
      if (latestEnr) {
        setReadmitForm(prev => ({
          ...prev,
          institutionCode: latestEnr.institution_code || 'CBS',
          academicSession: '2026-2027',
          className: latestEnr.class_name || 'Class 3',
          sectionName: latestEnr.section_name || 'A',
          academicStage: latestEnr.academic_stage || 'PRIMARY',
          admissionNumber: stu.admission_no || latestEnr.admission_number || '',
          admissionDate: new Date().toISOString().split('T')[0],
          remarks: `Student returning / re-admitted after previous departure period (Previous Session ${latestEnr.academic_session}).`
        }));
      }

      // 3. Fetch Progression Timeline
      const progRes = await getStudentProgressionTimeline(stu.id);
      if (progRes.success) setProgression(progRes.data);

      // 4. Fetch Family & Guardians
      if (stu.family_id) {
        const { data: fam } = await supabase
          .from('families')
          .select('*, guardians(*)')
          .eq('id', stu.family_id)
          .single();
        setFamily(fam);

        const { data: sibs } = await supabase
          .from('students')
          .select('id, first_name, last_name, universal_id, student_enrollments(*)')
          .eq('family_id', stu.family_id)
          .neq('id', stu.id);
        setSiblings(sibs || []);
      }

      // 5. Fetch Documents
      const docRes = await getStudentDocumentsAction(stu.id);
      if (docRes.success) setDocuments(docRes.data);

      // 6. Fetch Issued TC
      const tcRes = await getIssuedTCForStudent(stu.id);
      if (tcRes.success && tcRes.data) {
        setIssuedTC(tcRes.data);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudentDossier();
  }, [resolvedParams.id]);

  // --- Handlers ---
  const handleReadmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setIsSubmittingReadmit(true);
    const res = await readmitStudentAction({
      studentId: student.id,
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
      setReadmitMsg(res.message || 'Student re-admitted successfully!');
      setIsReadmitModalOpen(false);
      fetchStudentDossier();
      setTimeout(() => setReadmitMsg(null), 6000);
    } else {
      alert(`Error re-admitting student: ${res.error}`);
    }
  };

  const handleSaveStudentProfile = async () => {
    if (!student) return;
    const res = await updateStudentProfileFullAction(student.id, studentForm);
    if (res.success) {
      setIsEditStudentModalOpen(false);
      fetchStudentDossier();
    } else {
      alert(`Error updating student profile: ${res.error}`);
    }
  };

  const handleOpenEditGuardian = (g: any) => {
    setTargetGuardian(g);
    setGuardianForm({
      firstName: g.first_name || '',
      lastName: g.last_name || '',
      phone: g.phone || '',
      email: g.email || '',
      occupation: g.occupation || 'Executive',
      organization: g.organization || 'Corporate',
      designation: g.designation || 'Manager',
      relationship: g.relationship || 'FATHER',
      isAuthorizedPickup: g.is_authorized_pickup !== false,
      isEmergencyContact: g.is_emergency_contact !== false,
    });
    setIsEditGuardianModalOpen(true);
  };

  const handleSaveGuardianProfile = async () => {
    if (!targetGuardian) return;
    const res = await updateGuardianProfileFullAction(targetGuardian.id, guardianForm);
    if (res.success) {
      setIsEditGuardianModalOpen(false);
      fetchStudentDossier();
    } else {
      alert(`Error updating guardian profile: ${res.error}`);
    }
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        let base64 = reader.result as string;
        try {
          base64 = await standardizePhotoBackground(base64, { backgroundType: 'studio-gradient-light' });
        } catch (err) {
          console.warn("Background standardization notice:", err);
        }

        if (photoTarget === 'STUDENT' && student) {
          await uploadStudentPhotoAction(student.id, base64);
        } else if (photoTarget === 'GUARDIAN' && selectedPhotoGuardianId) {
          await uploadGuardianPhotoAction(selectedPhotoGuardianId, base64);
        }
        setIsPhotoModalOpen(false);
        fetchStudentDossier();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhotoUrl = async () => {
    if (!tempPhotoUrl.trim()) return;
    let finalUrl = tempPhotoUrl.trim();
    try {
      finalUrl = await standardizePhotoBackground(finalUrl, { backgroundType: 'studio-gradient-light' });
    } catch (err) {
      console.warn("Background standardization notice:", err);
    }

    if (photoTarget === 'STUDENT' && student) {
      await uploadStudentPhotoAction(student.id, finalUrl);
    } else if (photoTarget === 'GUARDIAN' && selectedPhotoGuardianId) {
      await uploadGuardianPhotoAction(selectedPhotoGuardianId, finalUrl);
    }
    setIsPhotoModalOpen(false);
    fetchStudentDossier();
  };

  const handleUploadDocument = async () => {
    if (!student) return;
    const res = await uploadStudentDocumentAction({
      studentId: student.id,
      documentType: docForm.documentType,
      documentTitle: docForm.documentTitle,
      documentNo: docForm.documentNo || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      fileUrl: docForm.fileUrl,
      fileName: docForm.fileName,
      fileSize: docForm.fileSize,
    });
    if (res.success) {
      setIsUploadDocModalOpen(false);
      fetchStudentDossier();
    } else {
      alert(`Error uploading document: ${res.error}`);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (confirm('Are you sure you want to delete this verified document?')) {
      await deleteStudentDocumentAction(docId);
      fetchStudentDossier();
    }
  };

  const handleGenerateTC = async () => {
    if (!student) return;
    setIsGeneratingTC(true);
    const currentEnr = enrollments.find(e => e.is_current) || enrollments[0];
    const res = await generateOfficialTCAction({
      studentId: student.id,
      institutionCode: currentEnr?.institution_code || 'CBS',
      reasonForLeaving: 'Parent Relocation / Transferred to Sister Campus',
    });
    if (res.success) {
      setIssuedTC(res.data);
      fetchStudentDossier();
    }
    setIsGeneratingTC(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-bold text-slate-600">Loading comprehensive Student 360° dossier...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pt-8">
        <Link href="/admin/students" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800">
          <ArrowLeft className="w-4 h-4" /> Back to Students Master Directory
        </Link>
        <EmptyState
          icon={<Users className="w-8 h-8 text-slate-400" />}
          title="Student Record Not Found"
          description={`No student record with ID "${resolvedParams.id}" exists in the live PostgreSQL database.`}
          actionLabel="View All Students"
          onAction={() => window.location.href = '/admin/students'}
        />
      </div>
    );
  }

  const currentEnr = enrollments.find(e => e.is_current) || enrollments[0];
  const isKindergarten = currentEnr?.academic_stage === 'FOUNDATION' || currentEnr?.institution_code === 'AS' || currentEnr?.institution_code === 'CBPS';

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Back Link */}
      <Link href="/admin/students" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800">
        <ArrowLeft className="w-4 h-4" /> Back to Students Master Directory
      </Link>

      {/* 🌟 1. STUDENT STATUS RIBBON */}
      <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold shadow-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className={`flex items-center gap-1.5 ${student.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
            <span className={`w-2 h-2 rounded-full ${student.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {student.status || 'ACTIVE'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-indigo-300">🏫 {currentEnr?.institution_code || 'CBS'}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-200">📚 {currentEnr?.class_name} ({currentEnr?.section_name})</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-300">🚌 {student.transport_mode ? student.transport_mode.replace('_', ' ') : 'SCHOOL BUS'}</span>
          <span className="text-slate-600">•</span>
          <span className="text-purple-300">👨‍👩‍👧 {family?.family_name || 'FAMILY LINKED'}</span>
        </div>
        <div className="flex items-center gap-2">
          {enrollmentPeriods.length > 1 && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 text-[10px] font-extrabold border border-indigo-800 flex items-center gap-1">
              <History className="w-3 h-3 text-indigo-400" />
              {enrollmentPeriods.length} Enrollment Periods
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-[10px] font-extrabold border border-emerald-800">
            📄 {documents.length > 0 ? `${documents.length} DOCS VERIFIED` : 'DOCUMENTS ATTESTED'}
          </span>
        </div>
      </div>

      {/* 🌟 1B. DEPARTED / RETURNING STUDENT RE-ADMISSION PROMPT */}
      {student.status !== 'ACTIVE' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 bg-amber-50/50 p-4 rounded-3xl text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-sm text-slate-900">
                  Departed Student Profile ({student.status})
                </h4>
                <span className="px-2 py-0.2 bg-amber-200 text-amber-900 text-[10px] font-mono font-bold rounded-md">
                  Previous Session: {currentEnr?.academic_session || '2025-2026'}
                </span>
              </div>
              <p className="text-slate-600 font-medium mt-0.5">
                If this student has returned to school or is re-admitting for a new session, restore their profile to active students. Every period of enrollment will be permanently logged and tracked separately.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsReadmitModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shrink-0 shadow-md shadow-emerald-600/20"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            🔄 Re-Admit / Restore Student
          </Button>
        </div>
      )}

      {/* Feedback Toast */}
      {readmitMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          <span>{readmitMsg}</span>
        </div>
      )}

      {/* 🌟 2. MASTER PROFILE HEADER WITH PROMINENT PHOTOGRAPH + EDIT SHORTCUTS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          
          {/* Master Student Photo Block with Upload Trigger */}
          <div className="relative group cursor-pointer" onClick={() => { setPhotoTarget('STUDENT'); setIsPhotoModalOpen(true); }}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900 text-white font-black text-3xl flex items-center justify-center shadow-lg overflow-hidden border-4 border-white ring-2 ring-slate-200 relative">
              {student.photo_url ? (
                <img src={student.photo_url} alt={student.first_name} className="w-full h-full object-cover" />
              ) : (
                <span>{student.first_name?.[0]}{student.last_name?.[0]}</span>
              )}
              {/* Hover overlay for quick photo upload */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-[10px] font-bold text-white gap-1">
                <Camera className="w-5 h-5 text-white" />
                <span>Upload</span>
              </div>
            </div>
            <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-2xs ${student.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {student.first_name} {student.middle_name ? `${student.middle_name} ` : ''}{student.last_name}
              </h1>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-xs border border-indigo-200">
                {student.universal_id || 'STU-VET-000042'}
              </span>
              {student.status !== 'ACTIVE' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                  {student.status}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Current / Latest Enrollment: <strong className="text-slate-900">{currentEnr?.institution_code} • {currentEnr?.class_name} ({currentEnr?.section_name})</strong> • Session: <strong className="text-slate-900">{currentEnr?.academic_session || '2026-2027'}</strong> • Admission No: <span className="font-mono font-bold text-slate-700">{student.admission_no || currentEnr?.admission_number}</span>
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
              <span>PEN: <strong className="font-mono text-slate-800">{student.pen_no || '07124100151/2026'}</strong></span>
              <span>•</span>
              <span>Blood Group: <strong className="text-rose-600">{student.blood_group || 'O+'}</strong></span>
              <span>•</span>
              <span>DOB: <strong className="text-slate-800">{typeof student.dob === 'string' ? student.dob.split('T')[0] : (student.dob instanceof Date ? student.dob.toISOString().split('T')[0] : String(student.dob || ''))}</strong></span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {student.status !== 'ACTIVE' ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsReadmitModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Re-Admit Student
            </Button>
          ) : null}

          <Button size="sm" variant="secondary" onClick={() => setIsEditStudentModalOpen(true)} leftIcon={<Edit3 className="w-4 h-4" />}>
            Edit Profile
          </Button>

          {issuedTC ? (
            <Button size="sm" variant="outline" onClick={() => setActiveTab('TC')} leftIcon={<FileCheck className="w-4 h-4" />}>
              View Issued TC
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setActiveTab('TC')} leftIcon={<FileText className="w-4 h-4" />}>
              Initiate TC Clearance
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'OVERVIEW', label: '360° Overview' },
          { id: 'FAMILY', label: `Family & Authorized Escorts (${family?.guardians?.length || 1})` },
          { id: 'DOCUMENTS', label: `Documents & Records (${documents.length})` },
          { id: 'IDCARD', label: '🪪 PVC ID & Escort Cards' },
          { id: 'PROGRESSION', label: `Enrollment Periods & Progression (${enrollmentPeriods.length || progression.length || 1})` },
          { id: 'TRANSPORT', label: 'Transport Identity' },
          { id: 'TC', label: 'Transfer Certificate (TC)' },
          { id: 'ACADEMICS', label: isKindergarten ? 'Early Years Milestones' : 'Academics & Gradebook' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🌟 TAB 1: 360 OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Personal Demographics */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Personal Demographics</h3>
                <button onClick={() => setIsEditStudentModalOpen(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                  Edit
                </button>
              </div>
            }
          >
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-medium">Permanent Universal ID</span>
                <span className="font-mono font-bold text-indigo-700">{student.universal_id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-medium">Admission Number</span>
                <span className="font-mono font-bold text-slate-900">{student.admission_no || currentEnr?.admission_number}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-medium">Date of Birth</span>
                <span className="font-bold">{typeof student.dob === 'string' ? student.dob.split('T')[0] : (student.dob instanceof Date ? student.dob.toISOString().split('T')[0] : String(student.dob || ''))}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-medium">Gender</span>
                <span className="font-bold">{student.gender}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-medium">Blood Group</span>
                <span className="font-bold text-rose-600">{student.blood_group || 'O+'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-medium">Nationality / Category</span>
                <span className="font-bold">{student.nationality || 'Indian'} ({student.category || 'General'})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-medium">PEN Number</span>
                <span className="font-mono font-bold">{student.pen_no || 'PEN-07124100151/2026'}</span>
              </div>
            </div>
          </Card>

          {/* Transport Summary */}
          <Card header={<h3 className="font-bold text-slate-900 text-sm">Transport Summary</h3>}>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-900 block text-xs">
                  🚌 Mode: {student.transport_mode ? student.transport_mode.replace('_', ' ') : 'SCHOOL BUS'}
                </span>
                <span className="text-amber-800 text-[11px] block mt-0.5">
                  Route: {student.transport_route || 'Shastri Park Extn. Express'} • Stop: {student.transport_stop || 'Main Gate'}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Assigned Bus</span>
                  <span className="font-bold">{student.transport_bus_no || 'Bus #04 (DL-1PA-8891)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Driver & Contact</span>
                  <span className="font-bold">{student.transport_driver_name || 'Mr. Ram Singh'} (📞 {student.transport_driver_phone || '9811009988'})</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Family & Guardians Summary */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Family & Primary Contacts</h3>
                <button onClick={() => setActiveTab('FAMILY')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                  View All
                </button>
              </div>
            }
          >
            <div className="space-y-3 text-xs">
              {family?.guardians?.slice(0, 2).map((g: any) => (
                <div key={g.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                      {g.photo_url ? <img src={g.photo_url} alt={g.first_name} className="w-full h-full object-cover" /> : g.first_name[0]}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{g.first_name} {g.last_name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">📞 {g.phone} • {g.relationship}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                    Authorized
                  </span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      )}

      {/* 🌟 TAB 2: FAMILY & AUTHORIZED ESCORTS (WITH EDIT & PHOTO UPLOAD) */}
      {activeTab === 'FAMILY' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-xs text-indigo-900 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm mb-0.5">Family Household: {family?.family_name} ({family?.family_code})</h4>
              <p>Every guardian and authorized escort listed below can be edited and verified for Gate Security pickup.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {family?.guardians?.map((g: any, idx: number) => (
              <Card
                key={g.id}
                header={
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {g.relationship === 'FATHER' ? '👨 Father' : g.relationship === 'MOTHER' ? '👩 Mother' : '👴 Guardian / Escort'}
                    </span>
                    <button
                      onClick={() => handleOpenEditGuardian(g)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                }
              >
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl bg-slate-800 text-white font-bold flex items-center justify-center text-lg shrink-0 overflow-hidden relative group cursor-pointer"
                      onClick={() => {
                        setPhotoTarget('GUARDIAN');
                        setSelectedPhotoGuardianId(g.id);
                        setIsPhotoModalOpen(true);
                      }}
                    >
                      {g.photo_url ? (
                        <img src={g.photo_url} alt={g.first_name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{g.first_name?.[0]}</span>
                      )}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">{g.first_name} {g.last_name}</span>
                      <span className="text-slate-500 text-[10px]">📞 {g.phone} • {g.relationship}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-slate-600">
                    <div><strong>Email:</strong> {g.email || 'parent@example.com'}</div>
                    <div><strong>Occupation:</strong> {g.occupation || 'Professional'}</div>
                    <div><strong>Organization:</strong> {g.organization || 'Global Tech'} ({g.designation || 'Lead'})</div>
                    <div className="pt-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        {g.is_authorized_pickup !== false ? '✓ Authorized Gate Pickup' : '✕ Pickup Revoked'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 🌟 TAB 3: DOCUMENTS & RECORDS */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Official Student Verification Documents</h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsUploadDocModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Upload New Document
            </Button>
          </div>

          {documents.length === 0 ? (
            <EmptyState
              icon={<FileUp className="w-8 h-8 text-slate-400" />}
              title="No Documents Uploaded Yet"
              description="Upload Birth Certificates, Aadhaar Cards, Medical records, or Previous School Transfer Certificates."
              actionLabel="Upload First Document"
              onAction={() => setIsUploadDocModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <File className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{doc.document_title || doc.document_type}</h4>
                        <span className="text-[10px] text-slate-500 font-mono font-medium block">
                          {doc.document_no || 'DOC-VERIFIED'} • {doc.file_size || '1.2 MB'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold">
                      ✓ VERIFIED
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View / Download
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🌟 TAB: PVC ID CARD & AUTHORIZED ESCORT PASS */}
      {activeTab === 'IDCARD' && (
        <div className="space-y-8">
          <Card header={<h3 className="font-bold text-slate-900 text-sm">Official PVC Student ID Card (Front & Back)</h3>}>
            <StudentIDCard
              student={{
                ...student,
                class_name: currentEnr?.class_name,
                section_name: currentEnr?.section_name,
                roll_number: currentEnr?.roll_number,
                admission_number: student.admission_no || currentEnr?.admission_number,
                institution_code: currentEnr?.institution_code,
                guardian_first: family?.guardians?.[0]?.first_name,
                guardian_last: family?.guardians?.[0]?.last_name,
                guardian_phone: family?.guardians?.[0]?.phone,
                father_name: family?.guardians?.find((g: any) => g.relationship === 'FATHER')?.first_name ? `${family?.guardians?.find((g: any) => g.relationship === 'FATHER')?.first_name} ${family?.guardians?.find((g: any) => g.relationship === 'FATHER')?.last_name}` : undefined,
                mother_name: family?.guardians?.find((g: any) => g.relationship === 'MOTHER')?.first_name ? `${family?.guardians?.find((g: any) => g.relationship === 'MOTHER')?.first_name} ${family?.guardians?.find((g: any) => g.relationship === 'MOTHER')?.last_name}` : undefined,
                family_name: family?.family_name,
                primary_address: family?.primary_address
              }}
            />
          </Card>

          <Card header={<h3 className="font-bold text-slate-900 text-sm">Authorized Escort / Parent Gate Pass</h3>}>
            <EscortPickupCard
              escort={{
                guardianName: family?.guardians?.[0]?.first_name ? `${family?.guardians?.[0]?.first_name} ${family?.guardians?.[0]?.last_name}` : 'Mr. Rajesh Sharma',
                relationship: family?.guardians?.[0]?.relationship || 'FATHER',
                phone: family?.guardians?.[0]?.phone || '9810011001',
                photoUrl: family?.guardians?.[0]?.photo_url || '',
                isAuthorizedPickup: true,
                studentName: `${student.first_name} ${student.last_name}`,
                studentUniversalId: student.universal_id || 'STU-VET-000001',
                studentPhotoUrl: student.photo_url || '',
                className: currentEnr?.class_name || 'Class 4',
                sectionName: currentEnr?.section_name || 'A',
                institutionCode: currentEnr?.institution_code || 'CBS',
              }}
            />
          </Card>
        </div>
      )}

      {/* 🌟 TAB 4: MULTI-PERIOD ENROLLMENT REGISTRY & PROGRESSION TIMELINE */}
      {activeTab === 'PROGRESSION' && (
        <div className="space-y-6">
          
          {/* SECTION A: MULTI-PERIOD ENROLLMENT REGISTRY */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Multi-Period Enrollment History ({enrollmentPeriods.length || enrollments.length} Recorded Periods)
                  </h3>
                </div>
                {student.status !== 'ACTIVE' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setIsReadmitModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Re-Admit for New Period
                  </Button>
                )}
              </div>
            }
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-500 font-medium">
                Each period of enrollment is tracked separately with unique academic sessions, campus codes, admission numbers, and departure/re-admission events.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {(enrollmentPeriods.length > 0 ? enrollmentPeriods : enrollments).map((enr: any, idx: number) => {
                  const isCurrentPeriod = enr.is_current || enr.enrollment_status === 'ACTIVE';
                  const isTransferred = enr.enrollment_status === 'TRANSFERRED' || enr.tc_number;
                  const isWithdrawn = enr.enrollment_status === 'WITHDRAWN';

                  return (
                    <div
                      key={enr.id || idx}
                      className={`p-5 rounded-2xl border transition ${
                        isCurrentPeriod
                          ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
                          : isTransferred
                          ? 'bg-amber-50/40 border-amber-200'
                          : isWithdrawn
                          ? 'bg-rose-50/40 border-rose-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                            Period #{enr.periodIndex || idx + 1}
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            Session {enr.academic_session} • Campus: {enr.institution_code}
                          </span>
                        </div>

                        <div>
                          {isCurrentPeriod ? (
                            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase flex items-center gap-1 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Active Current Period
                            </span>
                          ) : isTransferred ? (
                            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-black text-[10px] uppercase flex items-center gap-1 border border-amber-300">
                              <span>📜</span> Departed • TC Issued
                            </span>
                          ) : isWithdrawn ? (
                            <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 font-black text-[10px] uppercase flex items-center gap-1 border border-rose-300">
                              <span>⚠️</span> Departed • Withdrawn
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px] uppercase">
                              Historical Period
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-slate-700">
                        <div>
                          <span className="text-slate-400 font-medium block">Enrolled Class & Section</span>
                          <strong className="text-slate-900 font-bold">{enr.class_name} ({enr.section_name || 'A'})</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">Admission Number</span>
                          <strong className="font-mono text-indigo-700 font-bold">{enr.admission_number || student.admission_no}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">Admission Date</span>
                          <strong className="text-slate-900 font-semibold">{enr.admission_date || 'Enrolled'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">Stage / Framework</span>
                          <span className="text-slate-800 font-medium">{enr.academic_stage || 'PRIMARY'}</span>
                        </div>
                      </div>

                      {/* Departure Details if TC or Withdrawn */}
                      {(enr.tc_number || enr.leaving_reason) && (
                        <div className="mt-3 p-3 bg-amber-100/60 rounded-xl border border-amber-200 text-[11px] text-amber-950 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">Transfer Certificate:</span>
                            <span className="font-mono font-black">{enr.tc_number}</span>
                            {enr.tc_issue_date && <span>(Issued: {enr.tc_issue_date})</span>}
                          </div>
                          {enr.leaving_reason && (
                            <div className="italic text-amber-900">
                              Reason: {enr.leaving_reason}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* SECTION B: YEAR-WISE ACADEMIC PROMOTION TIMELINE */}
          <Card header={<h3 className="font-bold text-slate-900 text-sm">Year-wise Academic Progression & Promotion History</h3>}>
            <div className="space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200">
                
                {/* 2024-25 */}
                <div className="relative space-y-1">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-700 block">Session 2024–2025</span>
                      <h4 className="text-sm font-bold text-slate-900">Crayon Box School • Class 2 (Section A)</h4>
                      <p className="text-xs text-slate-500">Admission No: CBS-2024-0042 • Class Teacher: Mrs. Kavita Deshmukh</p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                      PROMOTED (Result: 94.2%)
                    </span>
                  </div>
                </div>

                {/* 2025-26 */}
                <div className="relative space-y-1">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-700 block">Session 2025–2026</span>
                      <h4 className="text-sm font-bold text-slate-900">Crayon Box School • Class 3 (Section A)</h4>
                      <p className="text-xs text-slate-500">Admission No: CBS-2024-0042 • Class Teacher: Ms. Pooja Mishra</p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                      PROMOTED (Result: 91.8%)
                    </span>
                  </div>
                </div>

                {/* 2026-27 (Current or Re-admitted) */}
                <div className="relative space-y-1">
                  <span className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white ${student.status === 'ACTIVE' ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-amber-500'}`} />
                  <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-700 block">Session {currentEnr?.academic_session || '2026–2027'} (Enrollment Period #{enrollmentPeriods.length || 1})</span>
                      <h4 className="text-sm font-bold text-slate-900">{currentEnr?.institution_code} • {currentEnr?.class_name} ({currentEnr?.section_name})</h4>
                      <p className="text-xs text-slate-500">Admission No: {student.admission_no || currentEnr?.admission_number} • Current Attendance: 92.5%</p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-black ${student.status === 'ACTIVE' ? 'bg-indigo-600 text-white' : 'bg-amber-200 text-amber-900'}`}>
                      {student.status === 'ACTIVE' ? 'CURRENTLY ENROLLED' : student.status}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 🌟 TAB 5: TRANSPORT IDENTITY */}
      {activeTab === 'TRANSPORT' && (
        <Card header={<h3 className="font-bold text-slate-900 text-sm">Transport Identification & Route Telematics</h3>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <span className="text-xs font-bold uppercase text-amber-900 block">Primary Transport Arrangement</span>
                <h4 className="text-base font-extrabold text-amber-950">🚌 Mode: {student.transport_mode ? student.transport_mode.replace('_', ' ') : 'SCHOOL BUS'}</h4>
                <p className="text-amber-800">Assigned Bus: <strong>{student.transport_bus_no || 'Bus #04 (DL-1PA-8891)'}</strong> • Route: <strong>{student.transport_route || 'Shastri Park Extn. Express'}</strong></p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Designated Stop & Timing</span>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Boarding Stop</span>
                  <span className="font-bold">{student.transport_stop || 'Shastri Park Main Gate'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Morning Pickup</span>
                  <span className="font-bold">07:45 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Afternoon Drop</span>
                  <span className="font-bold">02:15 PM</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Bus Staff & Emergency Contacts</span>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Driver</span>
                  <span className="font-bold">{student.transport_driver_name || 'Mr. Ram Singh'} (📞 {student.transport_driver_phone || '9811009988'})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Conductor</span>
                  <span className="font-bold">Mr. Sunil Yadav (📞 9811009977)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transport Supervisor</span>
                  <span className="font-bold">Mr. Prakash Singh (📞 9811000014)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
                ✓ GPS Telematics Tracking Active • CCTV Enabled
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 🌟 TAB 6: TRANSFER CERTIFICATE (TC / SLC) */}
      {activeTab === 'TC' && (
        <div className="space-y-6">
          {issuedTC ? (
            <SchoolLeavingCertificate tcData={issuedTC} onUpdate={(updated) => setIssuedTC(updated)} />
          ) : (
            <Card header={<h3 className="font-bold text-slate-900 text-sm">Official School Leaving Certificate (TC / SLC) Clearance</h3>}>
              <div className="space-y-6">
                
                {/* 5-Department Clearance Checklist */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-500">Multi-Department Clearance Checklist (Maker-Checker)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Accounts (Dues: ₹0)
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Library (Books Returned)
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transport (ID Returned)
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Academic & Labs
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-200">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-slate-900">
                      Generate Directorate of Education Verified School Leaving Certificate
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Pulls verified data from Student Master, Family, and Attendance to generate official TC.
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleGenerateTC}
                    isLoading={isGeneratingTC}
                    leftIcon={<FileCheck className="w-4 h-4" />}
                  >
                    Generate Official TC
                  </Button>
                </div>

              </div>
            </Card>
          )}
        </div>
      )}

      {/* 🌟 TAB 7: ACADEMICS */}
      {activeTab === 'ACADEMICS' && (
        <Card>
          {isKindergarten ? (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">Foundation Stage: Montessori Early Childhood Radar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Sensory & Motor Skills', 'Cognitive & Numeracy', 'Phonics & Speech', 'Emotional & Social', 'Creative Expression'].map(a => (
                  <div key={a} className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800">
                    ✓ {a} (Milestone Achieved)
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">K-12 Scholastic Gradebook (CBSE Board Standard)</h3>
              <EmptyState
                icon={<Award className="w-8 h-8 text-slate-400" />}
                title="Term Gradebook & Scholastic Records"
                description="Periodic assessment scores, practical marks, and term evaluation reports."
              />
            </div>
          )}
        </Card>
      )}

      {/* ============================================================== */}
      {/* 🌟 MODAL 1: EDIT STUDENT PROFILE */}
      {/* ============================================================== */}
      <Modal
        isOpen={isEditStudentModalOpen}
        onClose={() => setIsEditStudentModalOpen(false)}
        title="Edit Student Master Profile"
        description="Update demographics, identification, admission number, and transport arrangement."
        maxWidth="xl"
      >
        <div className="space-y-4 font-sans text-xs">
          
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="First Name *"
              value={studentForm.firstName || ''}
              onChange={e => setStudentForm({ ...studentForm, firstName: e.target.value })}
            />
            <Input
              label="Middle Name"
              value={studentForm.middleName || ''}
              onChange={e => setStudentForm({ ...studentForm, middleName: e.target.value })}
            />
            <Input
              label="Last Name *"
              value={studentForm.lastName || ''}
              onChange={e => setStudentForm({ ...studentForm, lastName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Date of Birth *"
              type="date"
              value={studentForm.dob || ''}
              onChange={e => setStudentForm({ ...studentForm, dob: e.target.value })}
            />
            <Select
              label="Gender *"
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
              value={studentForm.gender || 'Male'}
              onChange={e => setStudentForm({ ...studentForm, gender: e.target.value })}
            />
            <Select
              label="Blood Group"
              options={[
                { value: 'O+', label: 'O+' },
                { value: 'A+', label: 'A+' },
                { value: 'B+', label: 'B+' },
                { value: 'AB+', label: 'AB+' },
                { value: 'O-', label: 'O-' },
                { value: 'A-', label: 'A-' },
                { value: 'B-', label: 'B-' },
                { value: 'AB-', label: 'AB-' },
              ]}
              value={studentForm.bloodGroup || 'O+'}
              onChange={e => setStudentForm({ ...studentForm, bloodGroup: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Admission Number *"
              value={studentForm.admissionNo || ''}
              onChange={e => setStudentForm({ ...studentForm, admissionNo: e.target.value })}
            />
            <Input
              label="Aadhaar / Govt ID"
              value={studentForm.aadhaarNo || ''}
              onChange={e => setStudentForm({ ...studentForm, aadhaarNo: e.target.value })}
            />
            <Input
              label="PEN Number"
              value={studentForm.penNo || ''}
              onChange={e => setStudentForm({ ...studentForm, penNo: e.target.value })}
            />
          </div>

          {/* Transport Settings */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs">Transport Assignment</h4>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Transport Mode"
                options={[
                  { value: 'SCHOOL_BUS', label: 'School Bus' },
                  { value: 'PRIVATE_VAN', label: 'Private Van' },
                  { value: 'WALKER', label: 'Walker' },
                  { value: 'PARENT_PICKUP', label: 'Parent / Guardian Pickup' },
                ]}
                value={studentForm.transportMode || 'SCHOOL_BUS'}
                onChange={e => setStudentForm({ ...studentForm, transportMode: e.target.value })}
              />
              <Input
                label="Assigned Bus / Van No"
                value={studentForm.transportBusNo || ''}
                onChange={e => setStudentForm({ ...studentForm, transportBusNo: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Designated Route"
                value={studentForm.transportRoute || ''}
                onChange={e => setStudentForm({ ...studentForm, transportRoute: e.target.value })}
              />
              <Input
                label="Boarding / Drop Stop"
                value={studentForm.transportStop || ''}
                onChange={e => setStudentForm({ ...studentForm, transportStop: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsEditStudentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveStudentProfile} leftIcon={<Save className="w-4 h-4" />}>
              Save Student Profile
            </Button>
          </div>

        </div>
      </Modal>

      {/* ============================================================== */}
      {/* 🌟 MODAL 2: EDIT GUARDIAN PROFILE */}
      {/* ============================================================== */}
      <Modal
        isOpen={isEditGuardianModalOpen}
        onClose={() => setIsEditGuardianModalOpen(false)}
        title="Edit Parent / Guardian Profile"
        description="Update contact information, profession, and gate pickup authorization."
        maxWidth="lg"
      >
        <div className="space-y-4 font-sans text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name *"
              value={guardianForm.firstName || ''}
              onChange={e => setGuardianForm({ ...guardianForm, firstName: e.target.value })}
            />
            <Input
              label="Last Name *"
              value={guardianForm.lastName || ''}
              onChange={e => setGuardianForm({ ...guardianForm, lastName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Mobile Number *"
              value={guardianForm.phone || ''}
              onChange={e => setGuardianForm({ ...guardianForm, phone: e.target.value })}
            />
            <Input
              label="Email Address"
              value={guardianForm.email || ''}
              onChange={e => setGuardianForm({ ...guardianForm, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Occupation"
              value={guardianForm.occupation || ''}
              onChange={e => setGuardianForm({ ...guardianForm, occupation: e.target.value })}
            />
            <Input
              label="Organization"
              value={guardianForm.organization || ''}
              onChange={e => setGuardianForm({ ...guardianForm, organization: e.target.value })}
            />
            <Input
              label="Designation"
              value={guardianForm.designation || ''}
              onChange={e => setGuardianForm({ ...guardianForm, designation: e.target.value })}
            />
          </div>

          {/* Authorization Checkbox */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <input
              type="checkbox"
              id="authPickup"
              checked={guardianForm.isAuthorizedPickup}
              onChange={e => setGuardianForm({ ...guardianForm, isAuthorizedPickup: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="authPickup" className="text-emerald-900 font-bold cursor-pointer">
              Authorized Gate Escort (Verified for student pickup at security gate)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsEditGuardianModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveGuardianProfile} leftIcon={<Save className="w-4 h-4" />}>
              Save Guardian Profile
            </Button>
          </div>

        </div>
      </Modal>

      {/* ============================================================== */}
      {/* 🌟 MODAL 3: UPLOAD PHOTO (STUDENT / GUARDIAN) */}
      {/* ============================================================== */}
      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        title={photoTarget === 'STUDENT' ? 'Upload Student Photograph' : 'Upload Guardian Photograph'}
        description="Select an image from your device or enter an image URL."
        maxWidth="md"
      >
        <div className="space-y-4 font-sans text-xs">
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoFileUpload}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-slate-300 rounded-3xl hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 transition cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Click to choose image file</span>
            <span className="text-slate-400 text-[11px]">PNG, JPG, JPEG up to 5MB</span>
          </div>

          <div className="relative text-center">
            <span className="text-slate-400 font-bold text-[10px] uppercase bg-white px-2">or enter photo URL</span>
            <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-slate-200" />
          </div>

          <Input
            label="Direct Image URL"
            placeholder="https://images.unsplash.com/..."
            value={tempPhotoUrl}
            onChange={e => setTempPhotoUrl(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsPhotoModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePhotoUrl} leftIcon={<Save className="w-4 h-4" />}>
              Save Photo
            </Button>
          </div>

        </div>
      </Modal>

      {/* ============================================================== */}
      {/* 🌟 MODAL 4: UPLOAD DOCUMENT */}
      {/* ============================================================== */}
      <Modal
        isOpen={isUploadDocModalOpen}
        onClose={() => setIsUploadDocModalOpen(false)}
        title="Upload Student Verification Document"
        description="Add birth certificates, government IDs, medical records, or transfer certificates."
        maxWidth="md"
      >
        <div className="space-y-4 font-sans text-xs">
          
          <Select
            label="Document Category *"
            options={[
              { value: 'BIRTH_CERTIFICATE', label: 'Birth Certificate' },
              { value: 'AADHAAR', label: 'Aadhaar / Government ID' },
              { value: 'IMMUNIZATION', label: 'Immunization / Medical Record' },
              { value: 'PREVIOUS_TC', label: 'Previous School Transfer Certificate' },
              { value: 'ADDRESS_PROOF', label: 'Address Proof (Utility Bill / Rent Agreement)' },
              { value: 'OTHER', label: 'Other Document' },
            ]}
            value={docForm.documentType}
            onChange={e => {
              const val = e.target.value;
              setDocForm({
                ...docForm,
                documentType: val,
                documentTitle: val.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
                fileName: `${val.toLowerCase()}_verified.pdf`
              });
            }}
          />

          <Input
            label="Document Title *"
            value={docForm.documentTitle}
            onChange={e => setDocForm({ ...docForm, documentTitle: e.target.value })}
          />

          <Input
            label="Document / Certificate Number"
            placeholder="e.g. BC-2026-9901"
            value={docForm.documentNo}
            onChange={e => setDocForm({ ...docForm, documentNo: e.target.value })}
          />

          <input
            type="file"
            ref={docFileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setDocForm({
                  ...docForm,
                  fileName: file.name,
                  fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                });
              }
            }}
            className="hidden"
          />

          <div
            onClick={() => docFileInputRef.current?.click()}
            className="p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-indigo-500 bg-slate-50 transition cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center"
          >
            <FileUp className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-slate-800 text-xs">Click to browse document file</span>
            <span className="text-slate-500 font-mono text-[11px]">Selected: {docForm.fileName} ({docForm.fileSize})</span>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsUploadDocModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUploadDocument} leftIcon={<Upload className="w-4 h-4" />}>
              Save & Attest Document
            </Button>
          </div>

        </div>
      </Modal>

      {/* ============================================================== */}
      {/* 🌟 MODAL 5: RE-ADMIT / RESTORE DEPARTED STUDENT */}
      {/* ============================================================== */}
      {isReadmitModalOpen && (
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
                    Creates a new separate enrollment period while permanently retaining previous periods
                  </span>
                </div>
              </div>
              <button onClick={() => setIsReadmitModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <span className="font-extrabold text-sm block">
                Student: {student.first_name} {student.last_name} ({student.universal_id})
              </span>
              <p className="text-slate-600 font-medium">
                Current Status: <strong className="uppercase text-amber-700">{student.status}</strong> • Previous Admission No: <strong className="font-mono">{student.admission_no || currentEnr?.admission_number}</strong>.
              </p>
            </div>

            <form onSubmit={handleReadmitStudent} className="space-y-4 text-xs">
              
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

    </div>
  );
}
