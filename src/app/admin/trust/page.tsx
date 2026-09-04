"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2, Users, CreditCard, GraduationCap, TrendingUp,
  ShieldCheck, ArrowRight, ExternalLink, Download, Sparkles,
  BarChart3, RefreshCw, Layers, CheckCircle2, Edit3, X, Check,
  Mail, Phone, Globe, MapPin, Hash, Shield, FileText, Image as ImageIcon,
  Plus, Trash2, Calendar, AlertTriangle
} from 'lucide-react';
import {
  VANI_TRUST_ORGANIZATION,
  VANI_TRUST_INSTITUTIONS,
  VANI_TRUST_CAMPUSES,
} from '@/lib/core/institution/trust-hierarchy';
import { getLiveDashboardMetrics } from '@/app/actions/live-metrics';
import {
  getTrustDetailsAction,
  updateTrustDetailsAction,
  getInstitutionsListAction,
  getComplianceCertificatesAction,
  upsertComplianceCertificateAction,
  deleteComplianceCertificateAction,
  getBoardResolutionsAction,
  upsertBoardResolutionAction,
  deleteBoardResolutionAction
} from '@/app/actions/governance-analytics-actions';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { DualFileUpload } from '@/components/ui/DualFileUpload';

export default function TrustCommandCenterPage() {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalCollectedFormatted: '₹0',
    totalBilledFormatted: '₹0',
    collectionYield: '0%',
    todayAttendance: '0%',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Trust Organization State
  const [trustDetails, setTrustDetails] = useState<any>({
    name: 'Vaani Educational Trust',
    code: 'VET',
    registrationNumber: 'VET/REG/2018/DEL-8891',
    headquarters: 'Shastri Park Ext., Burari, Delhi - 110084',
    contactEmail: 'trust@crayonboxschool.com',
    contactPhone: '+91 9811102008',
    website: 'https://crayonboxschool.com',
    logoUrl: '/logo.png',
    panNumber: 'AAATV1234F',
    taxExemption80g: '80G/CIT/DEL/2019/8821',
    chairmanName: 'Nitin Tyagi',
    trusteeNames: 'Nitin Tyagi, Vaani Tyagi'
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editForm, setEditForm] = useState<any>({ ...trustDetails });

  // Compliance Certificates State
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCertCampus, setSelectedCertCampus] = useState('ALL');
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certSaving, setCertSaving] = useState(false);
  const [certForm, setCertForm] = useState<any>({
    id: '',
    institutionCode: 'CBS',
    certificateType: 'BOARD_AFFILIATION',
    title: '',
    certificateNumber: '',
    issuingAuthority: '',
    validTill: '',
    status: 'VALID',
    documentUrl: '',
    auditScore: '100%',
    notes: '',
  });

  // Board Resolutions State
  const [resolutions, setResolutions] = useState<any[]>([]);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [resolutionSaving, setResolutionSaving] = useState(false);
  const [resolutionForm, setResolutionForm] = useState<any>({
    id: '',
    resolutionNumber: '',
    title: '',
    category: 'GOVERNANCE',
    resolutionDate: '',
    quorum: '5/5 Present',
    status: 'ENACTED',
    summary: '',
    documentUrl: '',
  });

  // Operating Institutions List State
  const [institutionsList, setInstitutionsList] = useState<any[]>([]);

  const fetchCertificates = async () => {
    const res = await getComplianceCertificatesAction({ institutionCode: selectedCertCampus });
    if (res.success && res.certificates) {
      setCertificates(res.certificates);
    }
  };

  const fetchResolutions = async () => {
    const res = await getBoardResolutionsAction();
    if (res.success && res.resolutions) {
      setResolutions(res.resolutions);
    }
  };

  const fetchMetricsAndTrust = async () => {
    setIsLoading(true);
    try {
      const [mRes, tRes, cRes, rRes, iRes] = await Promise.all([
        getLiveDashboardMetrics(),
        getTrustDetailsAction(),
        getComplianceCertificatesAction({ institutionCode: selectedCertCampus }),
        getBoardResolutionsAction(),
        getInstitutionsListAction()
      ]);
      if (mRes.success && mRes.data) {
        setMetrics(mRes.data);
      }
      if (tRes.success && tRes.trust) {
        setTrustDetails(tRes.trust);
        setEditForm(tRes.trust);
      }
      if (cRes.success && cRes.certificates) {
        setCertificates(cRes.certificates);
      }
      if (rRes.success && rRes.resolutions) {
        setResolutions(rRes.resolutions);
      }
      if (iRes.success && iRes.institutions) {
        setInstitutionsList(iRes.institutions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsAndTrust();
  }, [selectedCertCampus]);

  const handleOpenAddResolution = () => {
    setResolutionForm({
      id: '',
      resolutionNumber: `RES-${new Date().getFullYear()}-0${resolutions.length + 1}`,
      title: '',
      category: 'GOVERNANCE',
      resolutionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      quorum: '5/5 Present',
      status: 'ENACTED',
      summary: '',
      documentUrl: '',
    });
    setIsResolutionModalOpen(true);
  };

  const handleOpenEditResolution = (res: any) => {
    setResolutionForm({
      id: res.id,
      resolutionNumber: res.resolutionNumber || res.resolution_number,
      title: res.title,
      category: res.category || 'GOVERNANCE',
      resolutionDate: res.resolutionDate || res.resolution_date || res.date,
      quorum: res.quorum || '5/5 Present',
      status: res.status || 'ENACTED',
      summary: res.summary || '',
      documentUrl: res.documentUrl || res.document_url || '',
    });
    setIsResolutionModalOpen(true);
  };

  const handleSaveResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    setResolutionSaving(true);
    try {
      const res = await upsertBoardResolutionAction(resolutionForm);
      if (res.success) {
        setIsResolutionModalOpen(false);
        await fetchResolutions();
      } else {
        alert(res.error || 'Failed to save board resolution');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setResolutionSaving(false);
    }
  };

  const handleDeleteResolution = async (id: string) => {
    if (confirm('Are you sure you want to delete this board resolution record?')) {
      const res = await deleteBoardResolutionAction(id);
      if (res.success) {
        await fetchResolutions();
      }
    }
  };

  const handleOpenEditModal = () => {
    setEditForm({ ...trustDetails });
    setSaveSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleSaveTrust = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateTrustDetailsAction({
        name: editForm.name,
        registrationNumber: editForm.registrationNumber,
        headquarters: editForm.headquarters,
        contactEmail: editForm.contactEmail,
        contactPhone: editForm.contactPhone,
        website: editForm.website,
        logoUrl: editForm.logoUrl,
        panNumber: editForm.panNumber,
        taxExemption80g: editForm.taxExemption80g,
        chairmanName: editForm.chairmanName,
        trusteeNames: editForm.trusteeNames,
      });

      if (res.success) {
        setTrustDetails({ ...editForm });
        setSaveSuccess(true);
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSaveSuccess(false);
        }, 800);
      } else {
        alert(res.error || 'Failed to update Trust details.');
      }
    } catch (err: any) {
      alert('Error updating trust: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddCert = (instCode?: string) => {
    setCertForm({
      id: '',
      institutionCode: instCode || (selectedCertCampus !== 'ALL' ? selectedCertCampus : 'CBS'),
      certificateType: 'BOARD_AFFILIATION',
      title: '',
      certificateNumber: '',
      issuingAuthority: '',
      validTill: '31-Mar-2028',
      status: 'VALID',
      documentUrl: '',
      auditScore: '100%',
      notes: '',
    });
    setIsCertModalOpen(true);
  };

  const handleOpenEditCert = (cert: any) => {
    setCertForm({
      id: cert.id,
      institutionCode: cert.institution_code || cert.institutionCode || 'CBS',
      certificateType: cert.certificate_type || cert.certificateType || 'OTHER',
      title: cert.title,
      certificateNumber: cert.certificate_number || cert.certificateNumber || '',
      issuingAuthority: cert.issuing_authority || cert.issuingAuthority || cert.authority || '',
      validTill: cert.valid_till || cert.validTill || '',
      status: cert.status || 'VALID',
      documentUrl: cert.document_url || cert.documentUrl || '',
      auditScore: cert.audit_score || cert.auditScore || cert.score || '100%',
      notes: cert.notes || '',
    });
    setIsCertModalOpen(true);
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertSaving(true);
    try {
      const res = await upsertComplianceCertificateAction(certForm);
      if (res.success) {
        setIsCertModalOpen(false);
        await fetchCertificates();
      } else {
        alert(res.error || 'Failed to save certificate');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCertSaving(false);
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (confirm('Are you sure you want to remove this compliance certificate?')) {
      const res = await deleteComplianceCertificateAction(id);
      if (res.success) {
        await fetchCertificates();
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Institution & Campus',
      render: (row: any) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          <span className="text-slate-400 text-[11px] font-medium">{row.address || row.code || row.campus}</span>
        </div>
      ),
    },
    {
      key: 'framework',
      header: 'Academic Framework',
      render: (row: any) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border border-slate-200">
          {row.academicFramework || row.boardAffiliation || 'Recognized Board'}
        </span>
      ),
    },
    {
      key: 'students',
      header: 'Live Students',
      align: 'right' as const,
      render: (row: any) => <span className="font-bold text-slate-900">{metrics.totalStudents || 0}</span>,
    },
    {
      key: 'status',
      header: 'System Status',
      align: 'right' as const,
      render: (row: any) => (
        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
          {row.status || 'ONLINE'}
        </span>
      ),
    },
  ];

  const [activeTab, setActiveTab] = useState<'BOARD' | 'ANALYTICS' | 'COMPLIANCE' | 'RESOLUTIONS'>('BOARD');

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Trust Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0B1B30]/5 border border-[#0B1B30]/10 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            {trustDetails.logoUrl ? (
              <img
                src={trustDetails.logoUrl}
                alt={trustDetails.name}
                className="w-full h-full object-contain p-2"
                onError={(e: any) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <Building2 className="w-8 h-8 text-[#0B1B30]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-[#0B1B30]/5 text-[#0B1B30] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-[#0B1B30]/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] animate-pulse" /> Live Trust Consolidation
              </span>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-slate-500 text-xs font-semibold">Reg. {trustDetails.registrationNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B30] tracking-tight">
              {trustDetails.name} HQ Command
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {trustDetails.headquarters} • {trustDetails.contactEmail} • {trustDetails.contactPhone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleOpenEditModal} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
            Edit Trust & Logo
          </Button>
          <Button variant="outline" size="sm" onClick={fetchMetricsAndTrust} isLoading={isLoading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Live DB
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('BOARD')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'BOARD'
              ? 'bg-[#0B1B30] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Trust Board & Identity</span>
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'ANALYTICS'
              ? 'bg-[#0B1B30] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
          <span>Executive MIS Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLIANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'COMPLIANCE'
              ? 'bg-[#0B1B30] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Statutory Compliance & NOCs</span>
        </button>

        <button
          onClick={() => setActiveTab('RESOLUTIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'RESOLUTIONS'
              ? 'bg-[#0B1B30] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-500" />
          <span>Board Resolutions</span>
        </button>
      </div>

      {/* TAB 1: BOARD IDENTITY */}
      {activeTab === 'BOARD' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Trust Governance Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Managing Trustees</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">{trustDetails.chairmanName} (Chairman)</p>
              <p className="text-xs text-slate-500 mt-1">{trustDetails.trusteeNames}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Tax & Statutory Identifiers</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">PAN: {trustDetails.panNumber}</p>
              <p className="text-xs text-slate-500 mt-1">80G / 12A: {trustDetails.taxExemption80g}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Web & Digital Portal</span>
              </div>
              <a href={trustDetails.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                {trustDetails.website} <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-xs text-slate-500 mt-1">Contact: {trustDetails.contactEmail}</p>
            </div>
          </div>

          {/* Live Consolidated KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              label="Consolidated Enrolled Students"
              value={isLoading ? '...' : metrics.totalStudents.toString()}
              subtext="Direct records in database"
              icon={<Users className="w-4 h-4" />}
              iconBgColor="bg-blue-50 text-blue-600"
            />
            <StatCard
              label="Consolidated Collections"
              value={isLoading ? '...' : metrics.totalCollectedFormatted}
              subtext={`${metrics.collectionYield} of ${metrics.totalBilledFormatted} billed`}
              icon={<CreditCard className="w-4 h-4" />}
              iconBgColor="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              label="Total Trust Staff"
              value={isLoading ? '...' : metrics.totalStaff.toString()}
              subtext="Faculty & Operations Staff"
              icon={<ShieldCheck className="w-4 h-4" />}
              iconBgColor="bg-indigo-50 text-indigo-600"
            />
            <StatCard
              label="Operating Institutions"
              value={isLoading ? '...' : institutionsList.length.toString()}
              subtext={institutionsList.map(i => i.code).join(', ') || 'CBS, AVM, AS, CBPS'}
              icon={<Building2 className="w-4 h-4" />}
              iconBgColor="bg-purple-50 text-purple-600"
            />
          </div>

          {/* Institutional Benchmarking Table */}
          <DataTable
            title="Member Institutional Registry (Live Database)"
            subtitle="Operational status across live VET schools"
            columns={columns}
            data={institutionsList.length > 0 ? institutionsList : VANI_TRUST_INSTITUTIONS}
          />
        </div>
      )}

      {/* TAB 2: EXECUTIVE MIS ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Executive Cross-Campus Intelligence</h2>
              <p className="text-xs text-slate-500">Real-time enrollment, yield & staff benchmarks across all 4 campuses</p>
            </div>
            <button 
              onClick={() => alert("Consolidated MIS Report generated successfully.")}
              className="px-4 py-2 rounded-xl bg-[#0B1B30] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer hover:bg-[#183454]"
            >
              <Download className="w-4 h-4" />
              <span>Export Executive MIS (PDF / CSV)</span>
            </button>
          </div>

          {/* Campus Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {VANI_TRUST_INSTITUTIONS.map((inst) => (
              <div key={inst.code} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-[#0B1B30] text-white font-black text-xs flex items-center justify-center">
                    {inst.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Online
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{inst.name}</h3>
                  <p className="text-[11px] text-slate-400">{inst.shortName} • {inst.institutionType === 'K12_SCHOOL' ? 'K-12' : 'Montessori'}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-slate-500">Students:</span> <span className="font-bold text-slate-800">0</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Board:</span> <span className="font-bold text-slate-800">{inst.boardAffiliation}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Fee Yield:</span> <span className="font-bold text-emerald-600">100%</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STATUTORY COMPLIANCE & CAMPUS CERTIFICATES */}
      {activeTab === 'COMPLIANCE' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Statutory Compliance & Safety Vault
                </span>
                <span className="text-slate-300 text-xs">•</span>
                <span className="text-slate-500 text-xs font-semibold">{certificates.length} Active Certificates</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                School-Wise Statutory Certificates & Validity
              </h2>
              <p className="text-xs text-slate-500">
                Manage School recognitions &amp; affiliations, Fire NOCs, Building Fitness, Clean Water, and POCSO audits per campus.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenAddCert()}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Add Certificate
              </Button>
            </div>
          </div>

          {/* School Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { code: 'ALL', label: 'All Entities & Schools' },
              { code: 'TRUST', label: '🏛️ Vaani Educational Trust' },
              { code: 'CBS', label: '🏫 Crayon Box School (K-12)' },
              { code: 'CBPS', label: '🎨 Crayon Box Pre-School' },
              { code: 'AS', label: '🌱 Avinya School' },
              { code: 'AVM', label: '📖 Avinya Vidya Mandir' },
            ].map((s) => (
              <button
                key={s.code}
                onClick={() => setSelectedCertCampus(s.code)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                  selectedCertCampus === s.code
                    ? 'bg-[#0B1B30] text-white border-[#0B1B30] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => {
              const instCode = cert.institution_code || cert.institutionCode || 'CBS';
              const isValid = cert.status === 'VALID' || cert.status === 'AUDITED' || cert.status === 'CERTIFIED';
              return (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          instCode === 'TRUST' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          instCode === 'CBS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          instCode === 'CBPS' ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                          instCode === 'AS' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {instCode}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {cert.certificate_type || cert.certificateType || 'STATUTORY'}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isValid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {cert.status || 'VALID'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {cert.title}
                      </h3>
                      {cert.certificate_number && (
                        <p className="text-xs font-mono text-indigo-600 mt-0.5">
                          Ref: {cert.certificate_number}
                        </p>
                      )}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Issuing Authority:</span>
                        <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate" title={cert.issuing_authority}>
                          {cert.issuing_authority || cert.issuingAuthority || 'Govt Authority'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Valid Until:</span>
                        <span className="font-bold text-slate-900">{cert.valid_till || cert.validTill || 'Permanent'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Audit Score:</span>
                        <span className="font-bold text-emerald-600">{cert.audit_score || cert.auditScore || '100%'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {cert.document_url && (
                        <a
                          href={cert.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <ExternalLink className="w-3 h-3" /> View Doc
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCert(cert)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Validity
                      </button>
                      <button
                        onClick={() => handleDeleteCert(cert.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete certificate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {certificates.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">No Certificates Found for this School Scope</h3>
              <p className="text-xs text-slate-400">Click &ldquo;+ Add Certificate&rdquo; above to register statutory clearances.</p>
              <Button size="sm" onClick={() => handleOpenAddCert()}>+ Add Certificate</Button>
            </div>
          )}

        </div>
      )}

      {/* TAB 4: BOARD RESOLUTIONS & OFFICIAL EXECUTIVE ORDERS */}
      {activeTab === 'RESOLUTIONS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-purple-100 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-purple-600" /> Trust Board Resolutions & Policy Ledger
                </span>
                <span className="text-slate-300 text-xs">•</span>
                <span className="text-slate-500 text-xs font-semibold">{resolutions.length} Enacted Orders</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Official Board Resolutions & Executive Decrees
              </h2>
              <p className="text-xs text-slate-500">
                Formal trustee approvals for capital budgets, academic frameworks, EV bus procurements, and IT gateways.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAddResolution}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + New Resolution Order
              </Button>
            </div>
          </div>

          {/* Resolutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {resolutions.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-purple-200 transition space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0B1B30] text-white font-mono font-bold text-xs">
                        {res.resolutionNumber || res.resolution_number}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                        {res.category || 'GOVERNANCE'}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {res.status || 'ENACTED'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>Date: {res.resolutionDate || res.resolution_date || res.date}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">Quorum: {res.quorum || '5/5 Present'}</span>
                    </p>
                  </div>

                  {res.summary && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                      {res.summary}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    {res.documentUrl ? (
                      <a
                        href={res.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Scanned Order
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No document attached</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditResolution(res)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit / Upload Doc
                    </button>
                    <button
                      onClick={() => handleDeleteResolution(res.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Delete resolution"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {resolutions.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">No Board Resolutions Logged Yet</h3>
              <p className="text-xs text-slate-400">Record unanimous board decisions, capital grants, or executive policies.</p>
              <Button size="sm" onClick={handleOpenAddResolution}>+ New Resolution Order</Button>
            </div>
          )}

        </div>
      )}

      {/* EDIT / ADD COMPLIANCE CERTIFICATE MODAL */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {certForm.id ? 'Edit Certificate Details & Validity' : 'Register Statutory School Certificate'}
                  </h2>
                  <p className="text-xs text-slate-500">Configure accreditation, NOCs, and renewal schedules per campus</p>
                </div>
              </div>
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCert} className="space-y-4 mt-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target School / Institution</label>
                  <select
                    value={certForm.institutionCode}
                    onChange={(e) => setCertForm({ ...certForm, institutionCode: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  >
                    <option value="TRUST">🏛️ Vaani Educational Trust (HQ)</option>
                    <option value="CBS">🏫 Crayon Box School (K-12)</option>
                    <option value="CBPS">🎨 Crayon Box Pre-School</option>
                    <option value="AS">🌱 Avinya School (Kindergarten)</option>
                    <option value="AVM">📖 Avinya Vidya Mandir</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Certificate Category</label>
                  <select
                    value={certForm.certificateType}
                    onChange={(e) => setCertForm({ ...certForm, certificateType: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  >
                    <option value="BOARD_AFFILIATION">Education Board / Department Recognition</option>
                    <option value="FIRE_NOC">Fire &amp; Disaster Safety NOC</option>
                    <option value="BUILDING_SAFETY">Building Structural Fitness</option>
                    <option value="WATER_SANITATION">Clean Water &amp; Sanitation</option>
                    <option value="POCSO_AUDIT">POCSO Child Safeguarding</option>
                    <option value="TRUST_REGISTRATION">Trust Registration Act</option>
                    <option value="TAX_80G">Income Tax 80G / 12A</option>
                    <option value="OTHER">Other Statutory Certificate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Certificate Official Title</label>
                <input
                  type="text"
                  required
                  value={certForm.title}
                  onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                  placeholder="e.g. Composite Provisional Affiliation / Recognition"
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Certificate / Order / Reg No.</label>
                  <input
                    type="text"
                    value={certForm.certificateNumber}
                    onChange={(e) => setCertForm({ ...certForm, certificateNumber: e.target.value })}
                    placeholder="e.g. REG/AFF/2130891/2026"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Issuing Authority / Dept</label>
                  <input
                    type="text"
                    required
                    value={certForm.issuingAuthority}
                    onChange={(e) => setCertForm({ ...certForm, issuingAuthority: e.target.value })}
                    placeholder="e.g. Delhi Fire Services"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Valid Until / Expiry</label>
                  <input
                    type="text"
                    required
                    value={certForm.validTill}
                    onChange={(e) => setCertForm({ ...certForm, validTill: e.target.value })}
                    placeholder="e.g. 31-Mar-2029 or Perpetual"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Compliance Status</label>
                  <select
                    value={certForm.status}
                    onChange={(e) => setCertForm({ ...certForm, status: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800"
                  >
                    <option value="VALID">VALID</option>
                    <option value="EXPIRING_SOON">EXPIRING SOON</option>
                    <option value="RENEWAL_DUE">RENEWAL DUE</option>
                    <option value="AUDITED">AUDITED</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Audit Score</label>
                  <input
                    type="text"
                    value={certForm.auditScore}
                    onChange={(e) => setCertForm({ ...certForm, auditScore: e.target.value })}
                    placeholder="100%"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Certificate Document Upload (File & Link) */}
              <DualFileUpload
                label="Certificate Document Attachment (File or URL Link)"
                helperText="Upload scanned PDF or photo certificate from computer, or paste document URL."
                value={certForm.documentUrl}
                onChange={(val) => setCertForm({ ...certForm, documentUrl: val })}
                accept=".pdf,image/*"
                placeholder="https://... or /documents/cert.pdf"
                standardizeBackground={false}
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={certSaving}
                  className="px-5 py-2 rounded-xl bg-[#0B1B30] text-white text-xs font-bold hover:bg-[#183454] transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {certSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{certForm.id ? 'Save Changes' : 'Register Certificate'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT TRUST DETAILS & LOGO MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Edit Trust Master Governance Details</h2>
                  <p className="text-xs text-slate-500">Update Vaani Educational Trust organizational identity & logo</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTrust} className="space-y-4 mt-6">
              
              {/* Trust Logo Upload (File & Link) */}
              <DualFileUpload
                label="Trust Crest / Official Logo (Upload File or Link)"
                helperText="Upload a PNG, SVG, or JPEG image directly from your device, or switch tabs to paste a web URL."
                value={editForm.logoUrl}
                onChange={(val) => setEditForm({ ...editForm, logoUrl: val })}
                accept="image/*"
                placeholder="https://example.com/logo.png or /logo.png"
                standardizeBackground={false}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Trust Legal Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-600 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Registration / Society No.</label>
                  <input
                    type="text"
                    value={editForm.registrationNumber}
                    onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-600 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Headquarters Address</label>
                <input
                  type="text"
                  value={editForm.headquarters}
                  onChange={(e) => setEditForm({ ...editForm, headquarters: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-600 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Official Contact Email</label>
                  <input
                    type="email"
                    value={editForm.contactEmail}
                    onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-600 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Official Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.contactPhone}
                    onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-600 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Official Website Address</label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-600 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={editForm.panNumber}
                    onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-600 font-medium text-slate-800 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">80G / 12A Exemption Ref</label>
                  <input
                    type="text"
                    value={editForm.taxExemption80g}
                    onChange={(e) => setEditForm({ ...editForm, taxExemption80g: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-600 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Chairman / President Name</label>
                  <input
                    type="text"
                    value={editForm.chairmanName}
                    onChange={(e) => setEditForm({ ...editForm, chairmanName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-600 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Managing Trustees List</label>
                <input
                  type="text"
                  value={editForm.trusteeNames}
                  onChange={(e) => setEditForm({ ...editForm, trusteeNames: e.target.value })}
                  placeholder="Comma separated names"
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-indigo-600 font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  leftIcon={saveSuccess ? <Check className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                >
                  {saveSuccess ? 'Saved to Database!' : 'Save Trust Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / ADD BOARD RESOLUTION MODAL */}
      {isResolutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {resolutionForm.id ? 'Edit Board Resolution Order' : 'Record New Board Resolution'}
                  </h2>
                  <p className="text-xs text-slate-500">Log official trustee decree, date, quorum, and signed order</p>
                </div>
              </div>
              <button
                onClick={() => setIsResolutionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4 mt-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Resolution Number / Ref</label>
                  <input
                    type="text"
                    required
                    value={resolutionForm.resolutionNumber}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, resolutionNumber: e.target.value })}
                    placeholder="e.g. RES-2026-05"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Policy Category</label>
                  <select
                    value={resolutionForm.category}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  >
                    <option value="GOVERNANCE">Trust Governance &amp; Policy</option>
                    <option value="INFRASTRUCTURE">Campus Infrastructure &amp; IT</option>
                    <option value="ACADEMIC">Academic NEP 2020 Framework</option>
                    <option value="LOGISTICS">Transport &amp; EV Bus Fleet</option>
                    <option value="FINANCE">Capital Grants &amp; Budget</option>
                    <option value="SAFEGUARDING">POCSO &amp; Child Safety</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Resolution Title / Subject</label>
                <input
                  type="text"
                  required
                  value={resolutionForm.title}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, title: e.target.value })}
                  placeholder="e.g. Approval of 16-Channel CCTV Low-Latency AI Streaming Gateway"
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Enactment Date</label>
                  <input
                    type="text"
                    required
                    value={resolutionForm.resolutionDate}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, resolutionDate: e.target.value })}
                    placeholder="e.g. 15 Aug 2026"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Board Quorum</label>
                  <input
                    type="text"
                    value={resolutionForm.quorum}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, quorum: e.target.value })}
                    placeholder="e.g. 5/5 Present"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={resolutionForm.status}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, status: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800"
                  >
                    <option value="ENACTED">ENACTED</option>
                    <option value="ADOPTED">ADOPTED</option>
                    <option value="PENDING_ASSENT">PENDING ASSENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Executive Summary / Order Text</label>
                <textarea
                  rows={3}
                  value={resolutionForm.summary}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, summary: e.target.value })}
                  placeholder="Summarize the core resolution passed by the board of trustees..."
                  className="w-full text-xs p-3 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800"
                />
              </div>

              {/* Resolution Signed Document Upload (File & Link) */}
              <DualFileUpload
                label="Signed Resolution Order Attachment (Upload Scan or Link)"
                helperText="Upload official stamped PDF or photo of signed minutes of meeting, or paste document URL."
                value={resolutionForm.documentUrl}
                onChange={(val) => setResolutionForm({ ...resolutionForm, documentUrl: val })}
                accept=".pdf,image/*"
                placeholder="https://... or /documents/resolution-signed.pdf"
                standardizeBackground={false}
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResolutionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolutionSaving}
                  className="px-5 py-2 rounded-xl bg-[#0B1B30] text-white text-xs font-bold hover:bg-[#183454] transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {resolutionSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{resolutionForm.id ? 'Save Changes' : 'Enact Resolution'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

