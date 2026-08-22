"use client";

import React, { useState } from 'react';
import {
  FileCheck, ShieldCheck, CheckCircle2, Clock,
  XCircle, Download, Plus, Filter, Users, ArrowRight
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function DigitalConsentPage() {
  const [selectedInst, setSelectedInst] = useState<string>('CBS');

  const consentForms = [
    {
      id: 'CNS-2026-01',
      title: 'Annual Science Museum & Planetarium Educational Field Trip',
      targetClass: 'Grade 4 & Grade 5 (CBS)',
      totalEligible: 124,
      signedCount: 118,
      declinedCount: 2,
      pendingCount: 4,
      consentYield: '95.1%',
      deadline: '2026-08-28',
      status: 'ACTIVE',
    },
    {
      id: 'CNS-2026-02',
      title: 'School Website & Social Media Photography / Video Consent',
      targetClass: 'All Enrolled Toddlers (CBPS)',
      totalEligible: 320,
      signedCount: 308,
      declinedCount: 6,
      pendingCount: 6,
      consentYield: '96.2%',
      deadline: '2026-09-01',
      status: 'ACTIVE',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Legal Authorization Hub
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Digital Signatures & OTP Audited</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Digital Parent Consent & Permission Engine</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Auditable digital consent forms for excursions, media publishing, sports matches, and medical emergency authorizations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            Publish New Consent Form
          </button>
        </div>
      </div>

      {/* Active Consent Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consentForms.map((form) => (
          <div key={form.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {form.id}
                </span>
                <h3 className="text-base font-black text-stone-900 mt-1">{form.title}</h3>
                <p className="text-xs text-stone-500 font-semibold">{form.targetClass}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-lg uppercase">
                {form.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-stone-600">Parent Response Yield</span>
                <span className="text-emerald-600">{form.consentYield}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: form.consentYield }} />
              </div>
            </div>

            {/* Breakdown Stats */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-100 text-center text-xs">
              <div>
                <span className="text-[10px] text-stone-400 font-semibold uppercase">Approved</span>
                <p className="font-black text-emerald-600 text-sm">{form.signedCount}</p>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-semibold uppercase">Declined</span>
                <p className="font-black text-rose-600 text-sm">{form.declinedCount}</p>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-semibold uppercase">Awaiting</span>
                <p className="font-black text-amber-600 text-sm">{form.pendingCount}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-stone-500 font-semibold pt-1 border-t border-stone-100">
              <span>Deadline: {form.deadline}</span>
              <button className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
                View Roster <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
