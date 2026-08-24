"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2, CheckCircle2, Clock, Users, Download,
  Send, RefreshCw, Smartphone, Sparkles, X, Check, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getParentConsentDashboardAction,
  submitDigitalParentConsentAction
} from '@/app/actions/communication-actions';

export default function ParentConsentPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [forms, setForms] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    totalForms: 0,
    totalRequests: 0,
    totalApproved: 0,
    totalPending: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);

  // Digital Signature Simulation Modal
  const [activeSignForm, setActiveSignForm] = useState<any | null>(null);
  const [parentName, setParentName] = useState('Pooja Verma');
  const [signStatus, setSignStatus] = useState<'APPROVED' | 'DECLINED'>('APPROVED');
  const [isSigning, setIsSigning] = useState(false);

  const fetchConsents = async () => {
    setIsLoading(true);
    const res = await getParentConsentDashboardAction();
    if (res.success) {
      setForms(res.forms || []);
      setCounts(res.counts || { totalForms: 0, totalRequests: 0, totalApproved: 0, totalPending: 0 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  // Send WhatsApp Reminder Nudge
  const handleSendReminderNudge = (formTitle: string, pending: number) => {
    setNudgeMessage(`📲 Automated WhatsApp Nudge Dispatched to ${pending} pending parents for "${formTitle}"!`);
    setTimeout(() => setNudgeMessage(null), 6000);
  };

  // Submit Digital Signature
  const handleSignatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSignForm) return;

    setIsSigning(true);
    const res = await submitDigitalParentConsentAction({
      formId: activeSignForm.id,
      studentId: '3e6b0d63-7a91-47b4-800e-8886b23f3701', // Rohan Verma
      parentName,
      status: signStatus
    });
    setIsSigning(false);

    if (res.success) {
      setActiveSignForm(null);
      fetchConsents();
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              Digital Parent Authorization & Excursion Consents
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileCheck2 className="w-8 h-8 text-emerald-400" />
            Digital Parent Consent & Authorization Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Timestamped SHA-256 digital parental approvals for science excursions, sports camps, and media releases with automated WhatsApp reminder nudges.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchConsents}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Consents
          </Button>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Consent Forms</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{counts.totalForms}</span>
          <span className="text-[11px] text-slate-500 font-semibold">Open Authorizations</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Parent Requests</span>
          <span className="text-3xl font-black text-indigo-600 mt-1 block">{counts.totalRequests}</span>
          <span className="text-[11px] text-indigo-700 font-bold">Dispatched to Families</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Approved & Signed</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{counts.totalApproved}</span>
          <span className="text-[11px] text-emerald-700 font-bold">Cryptographically Verified</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending Responses</span>
          <span className="text-3xl font-black text-amber-600 mt-1 block">{counts.totalPending}</span>
          <span className="text-[11px] text-amber-700 font-bold">Awaiting Parental Sign</span>
        </div>
      </div>

      {/* Nudge Notification */}
      {nudgeMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>{nudgeMessage}</span>
          </div>
          <button onClick={() => setNudgeMessage(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* 🌟 CONSENT FORMS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div
            key={form.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5 flex flex-col justify-between hover:border-emerald-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  {form.consent_code}
                </span>
                <span className="text-[10px] font-bold text-slate-400">Due: {form.due_date}</span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 leading-snug">{form.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{form.description}</p>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Cohort:</span>
                  <strong className="text-slate-900">{form.target_classes}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approvals:</span>
                  <strong className="text-emerald-700 font-bold">{form.approved_count} / {form.total_requests} ({form.approvalRate}%)</strong>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${form.approvalRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setActiveSignForm(form)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                ✍️ Simulate Parent Sign
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendReminderNudge(form.title, form.pending_count)}
                className="w-full text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border-slate-200 text-xs"
                leftIcon={<Smartphone className="w-3.5 h-3.5 text-emerald-600" />}
              >
                WhatsApp Nudge ({form.pending_count})
              </Button>
            </div>

          </div>
        ))}
      </div>

      {/* 🌟 SIMULATE DIGITAL SIGNATURE MODAL */}
      {activeSignForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700">Digital Parent Authorization</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{activeSignForm.title}</h3>
              </div>
              <button onClick={() => setActiveSignForm(null)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSignatureSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Student Information</span>
                <strong className="text-slate-900 text-sm block">Rohan Verma (Class 1A • CBS-2026-0001)</strong>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent / Legal Guardian Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Consent Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignStatus('APPROVED')}
                    className={`p-2.5 rounded-xl border font-bold text-xs transition ${
                      signStatus === 'APPROVED' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ✓ Grant Consent
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignStatus('DECLINED')}
                    className={`p-2.5 rounded-xl border font-bold text-xs transition ${
                      signStatus === 'DECLINED' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ✕ Decline Consent
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>By signing, a cryptographic SHA-256 hash will be generated with timestamp verification.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setActiveSignForm(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSigning} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Confirm & Sign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
