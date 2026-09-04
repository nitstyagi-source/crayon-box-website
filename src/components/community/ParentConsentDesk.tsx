"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck2, CheckCircle2, Clock, Users, Download,
  Send, RefreshCw, Smartphone, Sparkles, X, Check, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useInstitution } from "@/components/providers/InstitutionContext";
import {
  getParentConsentDashboardAction,
  submitDigitalParentConsentAction
} from "@/app/actions/communication-actions";

export function ParentConsentDesk() {
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
  const [parentName, setParentName] = useState("Pooja Verma");
  const [signStatus, setSignStatus] = useState<"APPROVED" | "DECLINED">("APPROVED");
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

  const handleSendReminderNudge = (formTitle: string, pending: number) => {
    setNudgeMessage(`📲 Automated WhatsApp Nudge Dispatched to ${pending} pending parents for "${formTitle}"!`);
    setTimeout(() => setNudgeMessage(null), 6000);
  };

  const handleSignatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSignForm) return;

    setIsSigning(true);
    const res = await submitDigitalParentConsentAction({
      formId: activeSignForm.id,
      studentId: "3e6b0d63-7a91-47b4-800e-8886b23f3701", // Rohan Verma
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
    <div className="space-y-6">
      {/* Telematics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Active Consent Forms</span>
          <span className="text-3xl font-black text-stone-900 mt-1 block">{counts.totalForms}</span>
          <span className="text-[11px] text-stone-500 font-semibold">Open Authorizations</span>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Total Requests</span>
          <span className="text-3xl font-black text-[#92400E] mt-1 block">{counts.totalRequests}</span>
          <span className="text-[11px] text-[#D97706] font-bold">Dispatched to Families</span>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Approved & Signed</span>
          <span className="text-3xl font-black text-emerald-700 mt-1 block">{counts.totalApproved}</span>
          <span className="text-[11px] text-emerald-600 font-bold">Cryptographically Verified</span>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Pending Responses</span>
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

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFC8]">
        <div>
          <h3 className="font-extrabold text-stone-900 text-sm">
            Digital Parental Consent Forms ({forms.length})
          </h3>
          <p className="text-xs text-stone-500">
            Timestamped approvals for science excursions, sports camps, and medical authorisations.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchConsents}
          isLoading={isLoading}
          className="bg-white text-stone-700 border-[#E8DFC8] hover:bg-[#F3EDE2] text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Consents
        </Button>
      </div>

      {/* Consent Forms Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div
            key={form.id}
            className="bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs p-6 space-y-5 flex flex-col justify-between hover:border-[#D97706] transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#92400E] bg-[#D97706]/10 px-2 py-0.5 rounded-md border border-[#D97706]/20">
                  {form.consent_code}
                </span>
                <span className="text-[10px] font-bold text-stone-500">Due: {form.due_date}</span>
              </div>

              <h3 className="text-base font-extrabold text-stone-900 leading-snug">{form.title}</h3>
              <p className="text-xs text-stone-600 line-clamp-2">{form.description}</p>

              <div className="p-3 bg-white rounded-2xl border border-[#E8DFC8] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Target Cohort:</span>
                  <strong className="text-stone-900">{form.target_classes}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Approvals:</span>
                  <strong className="text-emerald-700 font-bold">{form.approved_count} / {form.total_requests} ({form.approvalRate}%)</strong>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${form.approvalRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-3 border-t border-[#E8DFC8]">
              <Button
                size="sm"
                onClick={() => setActiveSignForm(form)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Simulate Parent Sign
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendReminderNudge(form.title, form.pending_count)}
                className="w-full text-stone-700 bg-white hover:bg-[#F3EDE2] border-[#E8DFC8] text-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600 mr-1" /> WhatsApp Nudge ({form.pending_count})
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* SIMULATE DIGITAL SIGNATURE MODAL */}
      {activeSignForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] text-stone-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700">Digital Parent Authorization</span>
                <h3 className="text-lg font-black text-stone-900 mt-0.5">{activeSignForm.title}</h3>
              </div>
              <button onClick={() => setActiveSignForm(null)} className="p-1 text-stone-400 hover:text-stone-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSignatureSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] text-stone-700 space-y-1">
                <span className="text-[10px] font-bold uppercase text-stone-500 block">Student Information</span>
                <strong className="text-stone-900 text-sm block">Rohan Verma (Class 1A • CBS-2026-0001)</strong>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Parent / Legal Guardian Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Consent Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignStatus("APPROVED")}
                    className={`p-2.5 rounded-xl border font-bold text-xs transition ${
                      signStatus === "APPROVED" ? "bg-emerald-600 text-white border-emerald-600" : "bg-[#FAF7F2] text-stone-700 border-[#E8DFC8]"
                    }`}
                  >
                    ✓ Grant Consent
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignStatus("DECLINED")}
                    className={`p-2.5 rounded-xl border font-bold text-xs transition ${
                      signStatus === "DECLINED" ? "bg-rose-600 text-white border-rose-600" : "bg-[#FAF7F2] text-stone-700 border-[#E8DFC8]"
                    }`}
                  >
                    ✕ Decline Consent
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>By signing, a cryptographic SHA-256 hash is recorded with timestamp verification.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8DFC8]">
                <Button size="sm" variant="outline" type="button" onClick={() => setActiveSignForm(null)} className="bg-white border-[#E8DFC8] text-stone-700">
                  Cancel
                </Button>
                <Button size="sm" type="submit" isLoading={isSigning} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold">
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
