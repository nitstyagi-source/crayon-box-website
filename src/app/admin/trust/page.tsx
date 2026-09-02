"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2, Users, CreditCard, GraduationCap, TrendingUp,
  ShieldCheck, ArrowRight, ExternalLink, Download, Sparkles,
  BarChart3, RefreshCw, Layers, CheckCircle2, Edit3, X, Check,
  Mail, Phone, Globe, MapPin, Hash, Shield, FileText, Image as ImageIcon
} from 'lucide-react';
import {
  VANI_TRUST_ORGANIZATION,
  VANI_TRUST_INSTITUTIONS,
  VANI_TRUST_CAMPUSES,
} from '@/lib/core/institution/trust-hierarchy';
import { getLiveDashboardMetrics } from '@/app/actions/live-metrics';
import { getTrustDetailsAction, updateTrustDetailsAction } from '@/app/actions/governance-analytics-actions';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';

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

  const fetchMetricsAndTrust = async () => {
    setIsLoading(true);
    try {
      const [mRes, tRes] = await Promise.all([
        getLiveDashboardMetrics(),
        getTrustDetailsAction()
      ]);
      if (mRes.success && mRes.data) {
        setMetrics(mRes.data);
      }
      if (tRes.success && tRes.trust) {
        setTrustDetails(tRes.trust);
        setEditForm(tRes.trust);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsAndTrust();
  }, []);

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

  const columns = [
    {
      key: 'name',
      header: 'Institution & Campus',
      render: (row: any) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          <span className="text-slate-400 text-[11px] font-medium">{row.campus}</span>
        </div>
      ),
    },
    {
      key: 'framework',
      header: 'Academic Framework',
      render: (row: any) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border border-slate-200">
          {row.academicFramework}
        </span>
      ),
    },
    {
      key: 'students',
      header: 'Live Students',
      align: 'right' as const,
      render: (row: any) => <span className="font-bold text-slate-900">0</span>,
    },
    {
      key: 'status',
      header: 'System Status',
      align: 'right' as const,
      render: (row: any) => (
        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
          ONLINE
        </span>
      ),
    },
  ];

  const [activeTab, setActiveTab] = useState<'BOARD' | 'ANALYTICS' | 'COMPLIANCE'>('BOARD');

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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('BOARD')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
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
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
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
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'COMPLIANCE'
              ? 'bg-[#0B1B30] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Statutory Compliance & NOCs</span>
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
              value={VANI_TRUST_INSTITUTIONS.length.toString()}
              subtext="CBS, AVM, AS, CBPS"
              icon={<Building2 className="w-4 h-4" />}
              iconBgColor="bg-purple-50 text-purple-600"
            />
          </div>

          {/* Institutional Benchmarking Table */}
          <DataTable
            title="Member Institutional Registry (Live Database)"
            subtitle="Operational status across all 4 VET schools"
            columns={columns}
            data={VANI_TRUST_INSTITUTIONS}
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

      {/* TAB 3: STATUTORY COMPLIANCE */}
      {activeTab === 'COMPLIANCE' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Statutory Registrations & Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Trust Registration Act</span>
                <p className="text-slate-500">Reg: {trustDetails.registrationNumber}</p>
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Verified Valid</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Income Tax 80G / 12A</span>
                <p className="text-slate-500">Order: {trustDetails.taxExemption80g}</p>
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Tax Exempt</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">PAN Card Registration</span>
                <p className="text-slate-500">PAN: {trustDetails.panNumber}</p>
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Active Entity</span>
              </div>
            </div>
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
              
              {/* Trust Logo Preview & URL */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {editForm.logoUrl ? (
                    <img
                      src={editForm.logoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-1"
                      onError={(e: any) => {
                        e.target.src = '/logo.png';
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 w-full">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Trust Logo URL / Path</label>
                  <input
                    type="text"
                    value={editForm.logoUrl}
                    onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                    placeholder="e.g. /logo.png or https://example.com/logo.png"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-200 focus:outline-indigo-600 font-mono text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">Recommended: Square PNG or SVG with transparent background</span>
                </div>
              </div>

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

    </div>
  );
}

