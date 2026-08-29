"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2, MapPin, Users, Award, Clock,
  DollarSign, ShieldCheck, CheckCircle2,
  ExternalLink, Layers, ArrowUpRight, Filter
} from 'lucide-react';
import {
  VANI_TRUST_ORGANIZATION,
  VANI_TRUST_INSTITUTIONS,
  VANI_TRUST_CAMPUSES,
  InstitutionMaster
} from '@/lib/core/institution/trust-hierarchy';
import { useInstitution } from '@/components/providers/InstitutionContext';

export default function MultiCampusMatrixPage() {
  const { currentInstitution, setInstitution } = useInstitution();
  const [filterType, setFilterType] = useState<'ALL' | 'K12_SCHOOL' | 'PRE_SCHOOL'>('ALL');

  const filteredInstitutions = VANI_TRUST_INSTITUTIONS.filter(inst => {
    if (filterType === 'ALL') return true;
    return inst.institutionType === filterType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Multi-Campus Matrix</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 uppercase">
                Governance Layer
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Cross-institutional matrix of all schools, branches, and operational units under {VANI_TRUST_ORGANIZATION.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/trust"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>Trust HQ Settings</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'ALL'
              ? 'bg-[#0A1A44] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Campuses ({VANI_TRUST_INSTITUTIONS.length})
        </button>
        <button
          onClick={() => setFilterType('K12_SCHOOL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'K12_SCHOOL'
              ? 'bg-[#0A1A44] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          K-12 CBSE Schools ({VANI_TRUST_INSTITUTIONS.filter(i => i.institutionType === 'K12_SCHOOL').length})
        </button>
        <button
          onClick={() => setFilterType('PRE_SCHOOL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'PRE_SCHOOL'
              ? 'bg-[#0A1A44] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Early Childhood / Pre-Schools ({VANI_TRUST_INSTITUTIONS.filter(i => i.institutionType === 'PRE_SCHOOL').length})
        </button>
      </div>

      {/* Campus Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredInstitutions.map((inst) => {
          const campuses = VANI_TRUST_CAMPUSES.filter(c => c.institutionId === inst.id);
          const isCurrentActive = currentInstitution === inst.code;

          return (
            <div 
              key={inst.id}
              className={`bg-white rounded-3xl border transition shadow-xs overflow-hidden ${
                isCurrentActive ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md"
                    style={{ backgroundColor: inst.brandColor }}
                  >
                    {inst.code}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{inst.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700 uppercase">
                        {inst.boardAffiliation}
                      </span>
                      {inst.affiliationNumber && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          Affil. #{inst.affiliationNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isCurrentActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Active Scope
                    </span>
                  ) : (
                    <button
                      onClick={() => setInstitution(inst.code)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition"
                    >
                      Switch Scope
                    </button>
                  )}
                </div>
              </div>

              {/* Card Details Body */}
              <div className="p-6 space-y-4 text-xs">
                
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Head of School / Principal
                    </span>
                    <span className="font-bold text-slate-800 block">{inst.principalName}</span>
                    <span className="text-slate-500 text-[11px] font-mono truncate block">{inst.principalEmail}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Daily School Timings
                    </span>
                    <span className="font-bold text-slate-800 block flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {inst.config.schoolTimings.start} – {inst.config.schoolTimings.end}
                    </span>
                    <span className="text-slate-500 text-[11px]">Parent Stream: {inst.config.cctvParentStreamDurationMins}m</span>
                  </div>
                </div>

                {/* Billing Prefix & Governance */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Invoice &amp; Receipt Series
                    </span>
                    <span className="font-mono font-bold text-slate-700 block">{inst.config.billingIdentity.invoicePrefix}</span>
                    <span className="font-mono text-slate-500 text-[11px]">{inst.config.billingIdentity.receiptPrefix}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Late Fee Policy
                    </span>
                    <span className="font-bold text-slate-800 block">₹{inst.config.dailyLateFeeAmount}/day</span>
                    <span className="text-slate-500 text-[11px]">{inst.config.lateFeeGracePeriodDays} days grace</span>
                  </div>
                </div>

                {/* Physical Campuses / Locations */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Physical Campuses &amp; Branches ({campuses.length})
                  </span>
                  <div className="space-y-2">
                    {campuses.map(c => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800 block">{c.name}</span>
                            <span className="text-slate-500 text-[11px]">{c.address}, {c.city} - {c.pincode}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-500 block">Admin: {c.campusAdminName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.contactPhone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
