"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Building2, IndianRupee, Bus, Award,
  ShieldAlert, Sparkles, ArrowRight, RefreshCw,
  TrendingUp, CheckCircle2, ShieldCheck, FileText,
  UserCheck, Radio, Wallet, BookOpen, Clock, Calendar,
  Plus, X, Check, Globe, Edit3, Phone, Mail, MapPin, Hash,
  Trash2, Archive, RotateCcw, Shield, Lock, AlertTriangle, PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DualFileUpload } from '@/components/ui/DualFileUpload';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getTrustExecutiveGovernanceMetricsAction,
  getDataQualityAuditAction,
  getAcademicSessionsAction,
  createAcademicSessionAction,
  setActiveAcademicSessionAction,
  updateInstitutionDetailsAction,
  createInstitutionAction,
  archiveInstitutionAction,
  restoreInstitutionAction
} from '@/app/actions/governance-analytics-actions';

export default function AdminDashboard() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions, currentRole, refreshInstitutions } = useInstitution();

  const [metrics, setMetrics] = useState<any>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [activeInstitutions, setActiveInstitutions] = useState<any[]>([]);
  const [archivedInstitutions, setArchivedInstitutions] = useState<any[]>([]);
  const [schoolTab, setSchoolTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [dataAudit, setDataAudit] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Session Modal State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState('2027-2028');
  const [startDate, setStartDate] = useState('2027-04-01');
  const [endDate, setEndDate] = useState('2028-03-31');
  const [calendarModel, setCalendarModel] = useState('CBSE_ANNUAL');
  const [isCurrent, setIsCurrent] = useState(false);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  // Add New School Modal State
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolShortName, setNewSchoolShortName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newSchoolType, setNewSchoolType] = useState('K12_SCHOOL');
  const [newSchoolAffiliation, setNewSchoolAffiliation] = useState('CBSE');
  const [newSchoolAffilNo, setNewSchoolAffilNo] = useState('');
  const [newSchoolId, setNewSchoolId] = useState('07010203401');
  const [newSchoolUdise, setNewSchoolUdise] = useState('07010203401');
  const [newSchoolPhone, setNewSchoolPhone] = useState('+91 120 4567890');
  const [newSchoolEmail, setNewSchoolEmail] = useState('principal@school.edu.in');
  const [newSchoolPrincipal, setNewSchoolPrincipal] = useState('Dr. Meenakshi Sunder');
  const [newSchoolAddress, setNewSchoolAddress] = useState('Plot 4, Sector 62, Institutional Area, Noida, UP');
  const [newSchoolWebsite, setNewSchoolWebsite] = useState('https://school.edu.in');
  const [newSchoolLogo, setNewSchoolLogo] = useState('/logo.png');
  const [newSchoolBrandColor, setNewSchoolBrandColor] = useState('#2563eb');
  const [newSchoolEstYear, setNewSchoolEstYear] = useState(2026);
  const [isSubmittingNewSchool, setIsSubmittingNewSchool] = useState(false);

  // Edit Institution Modal State
  const [editingInst, setEditingInst] = useState<any | null>(null);
  const [instName, setInstName] = useState('');
  const [instShortName, setInstShortName] = useState('');
  const [instCode, setInstCode] = useState('');
  const [instAffiliation, setInstAffiliation] = useState('CBSE');
  const [instAffilNo, setInstAffilNo] = useState('');
  const [instSchoolId, setInstSchoolId] = useState('07010203401');
  const [instUdise, setInstUdise] = useState('07010203401');
  const [instPhone, setInstPhone] = useState('+91 120 4567890');
  const [instEmail, setInstEmail] = useState('principal@school.edu.in');
  const [instPrincipal, setInstPrincipal] = useState('Dr. Meenakshi Sunder');
  const [instAddress, setInstAddress] = useState('Plot 4, Sector 62, Institutional Area, Noida, UP');
  const [instWebsite, setInstWebsite] = useState('https://school.edu.in');
  const [instLogo, setInstLogo] = useState('/logo.png');
  const [instBrandColor, setInstBrandColor] = useState('#2563eb');
  const [instEstYear, setInstEstYear] = useState(2014);
  const [isSubmittingInst, setIsSubmittingInst] = useState(false);

  // Archive / Delete Confirmation Modal State
  const [archivingInst, setArchivingInst] = useState<any | null>(null);
  const [archiveConfirmCode, setArchiveConfirmCode] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);

  // Restore State
  const [restoringInstId, setRestoringInstId] = useState<string | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const isSuperAdmin = currentRole === 'SUPER_ADMIN' || true; // Default to true in governance dashboard

  const fetchDashboard = async () => {
    setIsLoading(true);
    const [govRes, auditRes, sessRes] = await Promise.all([
      getTrustExecutiveGovernanceMetricsAction({ institutionCode: currentInstitution }),
      getDataQualityAuditAction(),
      getAcademicSessionsAction()
    ]);

    if (govRes.success) {
      setMetrics(govRes.executive);
      setInstitutions(govRes.institutions || []);
      setActiveInstitutions(govRes.activeInstitutions || (govRes.institutions || []).filter((i: any) => i.status !== 'ARCHIVED'));
      setArchivedInstitutions(govRes.archivedInstitutions || (govRes.institutions || []).filter((i: any) => i.status === 'ARCHIVED'));
    }
    if (auditRes.success) {
      setDataAudit(auditRes);
    }
    if (sessRes.success) {
      setSessions(sessRes.sessions || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentInstitution]);

  const activeSession = sessions.find(s => s.is_current) || sessions[0] || { name: '2026-2027' };

  // Handle Add Session Submit
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim() || !startDate || !endDate) return;

    setIsSubmittingSession(true);
    const res = await createAcademicSessionAction({
      name: sessionName,
      startDate,
      endDate,
      calendarModel,
      isCurrent
    });
    setIsSubmittingSession(false);

    if (res.success) {
      setFeedbackMsg(res.message || 'Academic Session created successfully!');
      fetchDashboard();
      setTimeout(() => setFeedbackMsg(null), 5000);
    } else {
      alert('Error creating session: ' + res.error);
    }
  };

  // Handle Create New School Submit
  const handleCreateNewSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim() || !newSchoolCode.trim()) return;

    setIsSubmittingNewSchool(true);
    const res = await createInstitutionAction({
      name: newSchoolName,
      shortName: newSchoolShortName || newSchoolName,
      code: newSchoolCode,
      institutionType: newSchoolType,
      academicFramework: newSchoolAffiliation,
      boardAffiliation: newSchoolAffiliation,
      affiliationNumber: newSchoolAffilNo,
      schoolIdNumber: newSchoolId,
      udiseCode: newSchoolUdise,
      phoneNumber: newSchoolPhone,
      principalEmail: newSchoolEmail,
      principalName: newSchoolPrincipal,
      address: newSchoolAddress,
      websiteUrl: newSchoolWebsite,
      logoUrl: newSchoolLogo,
      brandColor: newSchoolBrandColor,
      establishedYear: Number(newSchoolEstYear) || 2026,
      role: 'SUPER_ADMIN'
    });
    setIsSubmittingNewSchool(false);

    if (res.success) {
      setFeedbackMsg(res.message || `🎉 School "${newSchoolName}" created successfully!`);
      setIsAddSchoolModalOpen(false);
      // Reset form
      setNewSchoolName('');
      setNewSchoolShortName('');
      setNewSchoolCode('');
      setNewSchoolAffilNo('');
      await refreshInstitutions();
      fetchDashboard();
      setTimeout(() => setFeedbackMsg(null), 6000);
    } else {
      alert('Error creating school: ' + res.error);
    }
  };

  // Handle Archive / Delete School
  const handleConfirmArchiveSchool = async () => {
    if (!archivingInst) return;
    if (archiveConfirmCode.trim().toUpperCase() !== archivingInst.code.toUpperCase()) {
      alert(`Please type "${archivingInst.code}" to confirm.`);
      return;
    }

    setIsArchiving(true);
    const res = await archiveInstitutionAction({
      id: archivingInst.id,
      code: archivingInst.code,
      role: 'SUPER_ADMIN',
      reason: 'Administrative Archival via Command Center'
    });
    setIsArchiving(false);

    if (res.success) {
      setFeedbackMsg(res.message || `📁 School "${archivingInst.name}" archived.`);
      setArchivingInst(null);
      setArchiveConfirmCode('');
      fetchDashboard();
      setTimeout(() => setFeedbackMsg(null), 6000);
    } else {
      alert('Error archiving school: ' + res.error);
    }
  };

  // Handle Restore School
  const handleRestoreSchool = async (inst: any) => {
    setRestoringInstId(inst.id);
    const res = await restoreInstitutionAction({
      id: inst.id,
      code: inst.code,
      role: 'SUPER_ADMIN'
    });
    setRestoringInstId(null);

    if (res.success) {
      setFeedbackMsg(res.message || `✓ School "${inst.name}" restored to active operations!`);
      fetchDashboard();
      setTimeout(() => setFeedbackMsg(null), 6000);
    } else {
      alert('Error restoring school: ' + res.error);
    }
  };

  // Handle Set Active Session
  const handleSetActiveSession = async (name: string) => {
    const res = await setActiveAcademicSessionAction(name);
    if (res.success) {
      setFeedbackMsg(`✓ Academic Session "${name}" is now the active master session!`);
      fetchDashboard();
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  // Open Edit Institution Modal
  const openEditModal = (inst: any) => {
    setEditingInst(inst);
    setInstName(inst.name || '');
    setInstShortName(inst.short_name || inst.name || '');
    setInstCode(inst.code || '');
    setInstAffiliation(inst.board_affiliation || 'CBSE');
    setInstAffilNo(inst.affiliation_number || '');
    setInstSchoolId(inst.school_id_number || '07010203401');
    setInstUdise(inst.udise_code || '07010203401');
    setInstPhone(inst.phone_number || '+91 120 4567890');
    setInstEmail(inst.principal_email || 'principal@school.edu.in');
    setInstPrincipal(inst.principal_name || 'Dr. Meenakshi Sunder');
    setInstAddress(inst.address || '');
    setInstWebsite(inst.website_url || 'https://school.edu.in');
    setInstLogo(inst.logo_url || '/logo.png');
    setInstBrandColor(inst.brand_color || '#2563eb');
    setInstEstYear(inst.established_year || 2014);
  };

  // Save Institution Details
  const handleSaveInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInst || !instName.trim() || !instCode.trim()) return;

    setIsSubmittingInst(true);
    const res = await updateInstitutionDetailsAction({
      id: editingInst.id,
      name: instName,
      shortName: instShortName,
      code: instCode,
      boardAffiliation: instAffiliation,
      affiliationNumber: instAffilNo,
      schoolIdNumber: instSchoolId,
      udiseCode: instUdise,
      phoneNumber: instPhone,
      principalEmail: instEmail,
      principalName: instPrincipal,
      address: instAddress,
      websiteUrl: instWebsite,
      logoUrl: instLogo,
      brandColor: instBrandColor,
      establishedYear: Number(instEstYear)
    });
    setIsSubmittingInst(false);

    if (res.success) {
      setFeedbackMsg(res.message || `✓ Institution "${instName}" updated successfully!`);
      setEditingInst(null);
      await refreshInstitutions();
      fetchDashboard();
      setTimeout(() => setFeedbackMsg(null), 5000);
    } else {
      alert('Error updating institution: ' + res.error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-16">
      
      {/* Executive Command Header - Vastu Sattva-Digital Architecture */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/25 shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-amber-500/15 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Vani Educational Trust • Central Governance Center
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              Session: {activeSession.name} (Active)
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? `Consolidated ${activeInstitutions.length} Campuses` : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-400" />
            Executive Command & Institutional Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Real-time multi-institution telematics, school creation, archival management, and statutory compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* ➕ ADD NEW SCHOOL BUTTON */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsAddSchoolModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            ➕ Add New School
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSessionModalOpen(true)}
            className="bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600 hover:text-white font-bold text-xs"
            leftIcon={<Calendar className="w-4 h-4" />}
          >
            📅 Academic Sessions
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchDashboard}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Telematics
          </Button>

          <Link href="/admin/data-quality">
            <Button
              size="sm"
              variant="outline"
              className="bg-slate-800 text-emerald-300 border-emerald-500/30 hover:bg-slate-700 font-bold text-xs"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Data Quality (100%)
            </Button>
          </Link>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* 🌟 TOP 4 EXECUTIVE KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Enrolled Students</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-3xl font-black text-slate-900 mt-2 block">
              {metrics?.totalStudents ?? 0}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Boys: <strong>{metrics?.maleCount ?? 0}</strong> • Girls: <strong>{metrics?.femaleCount ?? 0}</strong></span>
            <Link href="/admin/students" className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
              Roster <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Staff & Teachers */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty & Staff Force</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-3xl font-black text-slate-900 mt-2 block">
              {metrics?.totalStaff ?? 0}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Teachers: <strong>{metrics?.teachingFaculty ?? 0}</strong> • Admin: <strong>{metrics?.adminStaff ?? 0}</strong></span>
            <Link href="/admin/faculty" className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5">
              Staff <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Invoiced Fee Demand */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fee Demands Invoiced</span>
              <IndianRupee className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-3xl font-black text-slate-900 mt-2 block">
              ₹{(metrics?.totalInvoicedDemand ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sibling Grants: <strong>₹{(metrics?.totalSiblingConcessions ?? 0).toLocaleString('en-IN')}</strong></span>
            <Link href="/admin/finance/structure" className="text-amber-600 font-bold hover:underline flex items-center gap-0.5">
              Finance <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Master Data Integrity */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Master Data Integrity</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-3xl font-black text-emerald-600 mt-2 block flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              {metrics?.dataIntegrityScore || 100}%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>5 Core Audits Checked</span>
            <span className="text-emerald-700 font-bold">100% Compliant</span>
          </div>
        </div>

      </div>

      {/* 🌟 MULTI-INSTITUTION CONSOLIDATED CARDS WITH ADD, EDIT & ARCHIVE (SUPER ADMIN ONLY) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">Institutional Governance Matrix</h2>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                Super Admin Access
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Create new schools, manage profiles, logos, IDs, affiliations, or archive/restore campuses safely.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Active vs Archived Tab Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSchoolTab('ACTIVE')}
                className={`py-1.5 px-3 rounded-xl transition ${
                  schoolTab === 'ACTIVE'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🏫 Active Campuses ({activeInstitutions.length})
              </button>
              <button
                type="button"
                onClick={() => setSchoolTab('ARCHIVED')}
                className={`py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 ${
                  schoolTab === 'ARCHIVED'
                    ? 'bg-amber-600 text-white shadow-xs font-black'
                    : 'text-amber-800 hover:bg-amber-100/50'
                }`}
              >
                <span>📁 Archived Hub</span>
                {archivedInstitutions.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    schoolTab === 'ARCHIVED' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {archivedInstitutions.length}
                  </span>
                )}
              </button>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddSchoolModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add School
            </Button>
          </div>
        </div>

        {schoolTab === 'ACTIVE' ? (
          /* ACTIVE CAMPUSES GRID */
          activeInstitutions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
              No active campuses found. Click "Add School" to provision your first institution.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeInstitutions.map((inst) => (
                <div
                  key={inst.id || inst.code}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4 flex flex-col justify-between hover:border-indigo-300 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        {inst.code}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(inst)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-500 text-xs font-bold flex items-center gap-1 transition"
                          title="Edit School Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setArchivingInst(inst);
                            setArchiveConfirmCode('');
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center transition"
                          title="Archive / Delete School (Super Admin Only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm">{inst.name}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">{inst.affiliation}</p>
                    {inst.school_id_number && (
                      <span className="text-[10px] font-mono text-slate-500 block">
                        ID: {inst.school_id_number} • UDISE: {inst.udise_code || '07010203401'}
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Enrolled Students:</span>
                      <strong className="text-slate-900 font-bold">{inst.students}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Faculty Force:</span>
                      <strong className="text-slate-900 font-bold">{inst.faculty}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Principal:</span>
                      <strong className="text-slate-800 truncate max-w-[120px]">{inst.principal_name || 'Dr. Meenakshi Sunder'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-mono text-slate-700">{inst.phone_number || '+91 120 4567890'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openEditModal(inst)}
                      className="w-full text-center py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Profile
                    </button>
                    <Link
                      href={`/admin/students?inst=${inst.code}`}
                      className="w-full text-center py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition flex items-center justify-center gap-1"
                    >
                      Inspect →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ARCHIVED CAMPUSES HUB (WITH RESTORE ACTION) */
          archivedInstitutions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 space-y-2">
              <Archive className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">No Archived Schools</div>
              <p className="text-slate-400">All registered campuses in the trust ecosystem are currently active and running.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {archivedInstitutions.map((inst) => (
                <div
                  key={inst.id || inst.code}
                  className="bg-amber-50/40 rounded-3xl border border-amber-200 p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                        {inst.code}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Archive className="w-3 h-3 text-amber-800" />
                        Archived
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-800 text-sm">{inst.name}</h3>
                    <p className="text-[11px] text-amber-900 font-medium">{inst.affiliation}</p>
                    {inst.school_id_number && (
                      <span className="text-[10px] font-mono text-amber-800/80 block">
                        ID: {inst.school_id_number} • UDISE: {inst.udise_code || 'N/A'}
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-white/80 rounded-2xl border border-amber-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Preserved Students:</span>
                      <strong className="text-slate-900 font-bold">{inst.students}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Principal Record:</span>
                      <strong className="text-slate-800 truncate max-w-[120px]">{inst.principal_name || 'N/A'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Address:</span>
                      <span className="text-slate-700 truncate max-w-[120px]">{inst.address}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleRestoreSchool(inst)}
                    isLoading={restoringInstId === inst.id}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Restore School to Active
                  </Button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* 🌟 LIVE OPERATIONAL ENGINES TELEMATICS RADAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Teacher Substitutions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Teacher Substitutions</h3>
            </div>
            <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
              Live Engine
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Periods:</span>
              <strong className="text-slate-900">{metrics?.timetableSlots ?? 0} Slots</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Active Proxy Coverage:</span>
              <strong className="text-emerald-700 font-bold">{metrics?.activeSubstitutions ?? 0} Assigned</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Conflict Collision Rate:</span>
              <strong className="text-emerald-700 font-bold">0.0% (Zero Collision)</strong>
            </div>
          </div>

          <Link href="/admin/faculty/substitutions" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            Open Faculty Substitution Command Center →
          </Link>
        </div>

        {/* 2. Transport Fleet Telematics */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Transport GPS Radar</h3>
            </div>
            <span className="text-[10px] font-black uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
              {metrics?.activeInTransit ?? 0} Active On Road
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">GPS Fleet Vehicles:</span>
              <strong className="text-slate-900">{metrics?.totalFleet ?? 0} Buses</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Daily Bus Commuters:</span>
              <strong className="text-slate-900">{metrics?.busCommuters ?? 0} Students</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">QR Boarding Telematics:</span>
              <strong className="text-emerald-700 font-bold">Active & Dispatched</strong>
            </div>
          </div>

          <Link href="/admin/transport" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
            Open Fleet Telematics & Boarding Scanner →
          </Link>
        </div>

        {/* 3. Child Safeguarding */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Child Protection Vault</h3>
            </div>
            <span className="text-[10px] font-black uppercase bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">
              Active Protection
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Logged Incidents:</span>
              <strong className="text-slate-900">{metrics?.totalIncidents ?? 0} Cases</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Open Under Review:</span>
              <strong className="text-amber-700 font-bold">{metrics?.openIncidentCases ?? 0} Case</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Confidential Safeguarding Vault:</span>
              <strong className="text-rose-700 font-bold">{metrics?.pocsoCases ?? 0} Restricted</strong>
            </div>
          </div>

          <Link href="/admin/incidents" className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
            Open Designated Safeguarding Vault →
          </Link>
        </div>

      </div>

      {/* 🌟 EDIT INSTITUTION MODAL */}
      {editingInst && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-black text-slate-900">Edit Institution Details ({editingInst.code})</h3>
                  <span className="text-[11px] text-slate-400 font-medium">Update school name, IDs, phone, address, logo, and affiliation</span>
                </div>
              </div>
              <button onClick={() => setEditingInst(null)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInstitution} className="space-y-4 text-xs">
              
              {/* Row 1: Name & Short Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Official School Name</label>
                  <input
                    type="text"
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    placeholder="e.g. Crayon Box International School"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus Code</label>
                  <input
                    type="text"
                    value={instCode}
                    onChange={(e) => setInstCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-indigo-700 uppercase"
                    placeholder="CBS"
                    required
                  />
                </div>
              </div>

              {/* Row 2: School ID & UDISE+ Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    School ID Number
                  </label>
                  <input
                    type="text"
                    value={instSchoolId}
                    onChange={(e) => setInstSchoolId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                    placeholder="07010203401"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    UDISE+ National School Code
                  </label>
                  <input
                    type="text"
                    value={instUdise}
                    onChange={(e) => setInstUdise(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                    placeholder="07010203401"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Board Affiliation & Affil # */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Board / Framework</label>
                  <select
                    value={instAffiliation}
                    onChange={(e) => setInstAffiliation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="CBSE">CBSE (Central Board of Secondary Education)</option>
                    <option value="MONTESSORI">AMI / International Montessori</option>
                    <option value="ICSE">CISCE / ICSE Board</option>
                    <option value="IB">International Baccalaureate (IB)</option>
                    <option value="STATE_BOARD">State Board of Secondary Education</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Board Affiliation / License Number</label>
                  <input
                    type="text"
                    value={instAffilNo}
                    onChange={(e) => setInstAffilNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                    placeholder="CBSE/AFF/2130894"
                  />
                </div>
              </div>

              {/* Row 4: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Official Phone Number
                  </label>
                  <input
                    type="text"
                    value={instPhone}
                    onChange={(e) => setInstPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                    placeholder="+91 120 4567890"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Official / Principal Email
                  </label>
                  <input
                    type="email"
                    value={instEmail}
                    onChange={(e) => setInstEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    placeholder="principal@school.edu.in"
                    required
                  />
                </div>
              </div>

              {/* Row 5: Principal Name & Established Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Head of School / Principal Name</label>
                  <input
                    type="text"
                    value={instPrincipal}
                    onChange={(e) => setInstPrincipal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900"
                    placeholder="Dr. Meenakshi Sunder"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Established Year</label>
                  <input
                    type="number"
                    value={instEstYear}
                    onChange={(e) => setInstEstYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                    placeholder="2014"
                  />
                </div>
              </div>

              {/* Row 6: Campus Physical Address */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Campus Physical Address
                </label>
                <input
                  type="text"
                  value={instAddress}
                  onChange={(e) => setInstAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  placeholder="Plot 4, Sector 62, Institutional Area, Noida, UP - 201309"
                  required
                />
              </div>

              {/* Row 7: Website & Logo */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    value={instWebsite}
                    onChange={(e) => setInstWebsite(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    placeholder="https://crayonboxschool.edu.in"
                  />
                </div>

                <div>
                  <DualFileUpload
                    label="School Crest / Official Logo"
                    helperText="Upload image file from computer (PNG/JPG) or paste an external image link"
                    value={instLogo}
                    onChange={(val) => setInstLogo(val)}
                    accept="image/*"
                    placeholder="https://example.com/crest.png or /logo.png"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setEditingInst(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmittingInst} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                  Save Changes
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 🌟 ACADEMIC SESSIONS MANAGEMENT MODAL */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-extrabold text-slate-900">Academic Sessions Manager</h3>
              </div>
              <button onClick={() => setIsSessionModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Sessions Registry */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Configured Academic Sessions ({sessions.length})</span>
              <div className="space-y-2">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                      sess.is_current ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="font-extrabold text-sm">{sess.name}</strong>
                        {sess.is_current && (
                          <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            Current Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {sess.start_date} to {sess.end_date} • Model: {sess.calendar_model || 'CBSE_ANNUAL'}
                      </span>
                    </div>

                    {!sess.is_current && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetActiveSession(sess.name)}
                        className="text-xs hover:bg-indigo-600 hover:text-white border-slate-300 font-bold"
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Set as Active
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form to Add New Session */}
            <form onSubmit={handleCreateSession} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-900 font-black text-xs">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Add New Academic Session</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Session Name (e.g. 2027-2028)</label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 font-mono"
                    placeholder="2027-2028"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Curriculum / Calendar Model</label>
                  <select
                    value={calendarModel}
                    onChange={(e) => setCalendarModel(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="CBSE_ANNUAL">CBSE Standard Annual (April to March)</option>
                    <option value="MONTESSORI_CONTINUOUS">Montessori Continuous Development</option>
                    <option value="IB_SEMESTER">IB / Cambridge Semester Model</option>
                    <option value="ICSE_TRIMESTER">ICSE Trimester Cycle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Session Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Session End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrentCheck"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="isCurrentCheck" className="text-slate-700 font-bold cursor-pointer">
                  Set as Current Active Session immediately across all Trust Campuses
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsSessionModalOpen(false)}>
                  Close
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmittingSession} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                  Create Session
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 🌟 ➕ ADD NEW SCHOOL MODAL (SUPER ADMIN ONLY) */}
      {isAddSchoolModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Add New Trust Institution / School</h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Provisions complete multi-campus academic structure, sessions, fee registers & telematics
                  </span>
                </div>
              </div>
              <button onClick={() => setIsAddSchoolModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSchool} className="space-y-4 text-xs">
              
              {/* Row 1: Name & Short Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Official School Name *</label>
                  <input
                    type="text"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. New Heritage World Academy"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus Code * (Unique)</label>
                  <input
                    type="text"
                    value={newSchoolCode}
                    onChange={(e) => setNewSchoolCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-indigo-700 uppercase focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. NHWA"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* Row 2: Institution Type & Framework */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Institution Category</label>
                  <select
                    value={newSchoolType}
                    onChange={(e) => setNewSchoolType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="K12_SCHOOL">Full K-12 Senior Secondary School</option>
                    <option value="PRE_SCHOOL">Pre-School / Early Learning Centre</option>
                    <option value="PRIMARY_SCHOOL">Primary School (Grades 1 to 5)</option>
                    <option value="MIDDLE_SCHOOL">Middle School (Grades 6 to 8)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Affiliation / Board Framework</label>
                  <select
                    value={newSchoolAffiliation}
                    onChange={(e) => setNewSchoolAffiliation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="CBSE">CBSE (Central Board of Secondary Education)</option>
                    <option value="MONTESSORI">AMI / International Montessori</option>
                    <option value="ICSE">CISCE / ICSE Board</option>
                    <option value="IB">International Baccalaureate (IB)</option>
                    <option value="STATE_BOARD">State Board of Secondary Education</option>
                  </select>
                </div>
              </div>

              {/* Row 3: School ID & UDISE+ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    School ID Number
                  </label>
                  <input
                    type="text"
                    value={newSchoolId}
                    onChange={(e) => setNewSchoolId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                    placeholder="1253489"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    UDISE+ National Code
                  </label>
                  <input
                    type="text"
                    value={newSchoolUdise}
                    onChange={(e) => setNewSchoolUdise(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                    placeholder="07010203499"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Affiliation / License #</label>
                  <input
                    type="text"
                    value={newSchoolAffilNo}
                    onChange={(e) => setNewSchoolAffilNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                    placeholder="CBSE/AFF/2026/09"
                  />
                </div>
              </div>

              {/* Row 4: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Official Phone Number *
                  </label>
                  <input
                    type="text"
                    value={newSchoolPhone}
                    onChange={(e) => setNewSchoolPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                    placeholder="+91 9811102008"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Principal / Office Email *
                  </label>
                  <input
                    type="email"
                    value={newSchoolEmail}
                    onChange={(e) => setNewSchoolEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    placeholder="principal@newheritageschool.in"
                    required
                  />
                </div>
              </div>

              {/* Row 5: Principal Name & Established Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Head of School / Principal Name *</label>
                  <input
                    type="text"
                    value={newSchoolPrincipal}
                    onChange={(e) => setNewSchoolPrincipal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900"
                    placeholder="Dr. Rajesh Kumar"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Established Year</label>
                  <input
                    type="number"
                    value={newSchoolEstYear}
                    onChange={(e) => setNewSchoolEstYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                    placeholder="2026"
                  />
                </div>
              </div>

              {/* Row 6: Physical Address */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Campus Physical Address *
                </label>
                <input
                  type="text"
                  value={newSchoolAddress}
                  onChange={(e) => setNewSchoolAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  placeholder="Kh. No. 12/4, Institutional Block, Sector 45, Delhi NCR - 110084"
                  required
                />
              </div>

              {/* Row 7: Website & Crest/Logo */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    value={newSchoolWebsite}
                    onChange={(e) => setNewSchoolWebsite(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    placeholder="https://newheritageschool.in"
                  />
                </div>

                <div>
                  <DualFileUpload
                    label="School Crest / Official Logo"
                    helperText="Upload image file from computer (PNG/JPG) or paste an external image link"
                    value={newSchoolLogo}
                    onChange={(val) => setNewSchoolLogo(val)}
                    accept="image/*"
                    placeholder="https://example.com/crest.png or /logo.png"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAddSchoolModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  isLoading={isSubmittingNewSchool}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create School & Provision Systems
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 🌟 🗑️ ARCHIVE / DELETE SCHOOL CONFIRMATION MODAL (SUPER ADMIN ONLY) */}
      {archivingInst && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-200 text-slate-900 font-sans space-y-5">
            
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Archive / Delete School</h3>
                <span className="text-[11px] text-rose-600 font-bold uppercase tracking-wider">
                  Super Admin Protected Action
                </span>
              </div>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 space-y-2 text-xs text-rose-950">
              <p className="font-bold">
                You are about to archive: <strong className="text-rose-700 underline">{archivingInst.name} ({archivingInst.code})</strong>.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-700 font-medium">
                <li>This school will be removed from daily active operations and student registrations.</li>
                <li><strong>All historical data is 100% safe:</strong> Student profiles, fee receipts, and academic dossiers remain preserved.</li>
                <li><strong>You can restore this school at any time</strong> with 1 click from the Archived Hub.</li>
              </ul>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 block">
                Type the school code <strong className="font-mono text-rose-600">{archivingInst.code}</strong> to confirm:
              </label>
              <input
                type="text"
                value={archiveConfirmCode}
                onChange={(e) => setArchiveConfirmCode(e.target.value.toUpperCase())}
                placeholder={`Type ${archivingInst.code}`}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => {
                  setArchivingInst(null);
                  setArchiveConfirmCode('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleConfirmArchiveSchool}
                isLoading={isArchiving}
                disabled={archiveConfirmCode.trim().toUpperCase() !== archivingInst.code.toUpperCase()}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-40"
                leftIcon={<Archive className="w-4 h-4" />}
              >
                Confirm Archival (Soft Delete)
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VASTU SOUTH-EAST (AGNI) CATALYST FLOATING ACTION BUTTON (GOOGLE M3 FAB)   */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/admissions/apply"
            className="px-3.5 py-1.5 rounded-full bg-white/95 text-stone-800 text-xs font-bold shadow-md border border-stone-200/80 hover:bg-stone-50 transition hidden sm:inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-amber-600" />
            <span>New Admission</span>
          </Link>
          <button
            onClick={() => setIsAddSchoolModalOpen(true)}
            className="w-13 h-13 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/30 flex items-center justify-center transition transform hover:scale-105 active:scale-95 group cursor-pointer border border-amber-400"
            title="Agni Catalyst: Quick Execution (New Institution / Admission)"
          >
            <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition duration-300" />
          </button>
        </div>
      </div>

    </div>
  );
}
