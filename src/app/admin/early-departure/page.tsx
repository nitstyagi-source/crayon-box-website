"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DoorOpen, ShieldCheck, QrCode, Phone, Clock,
  CheckCircle2, AlertTriangle, Plus, RefreshCw, Printer, X, Building2, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getEarlyDeparturePassesAction,
  issueStudentEarlyDeparturePassAction
} from '@/app/actions/communication-actions';

export default function EarlyDepartureGatePassPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [passes, setPasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Pass Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentInput, setStudentInput] = useState('CBS-2026-0001');
  const [reason, setReason] = useState('Infirmary Medical Referral (Sudden Fever)');
  const [escortName, setEscortName] = useState('Mrs. Pooja Verma');
  const [escortRelation, setEscortRelation] = useState('Mother');
  const [approver, setApprover] = useState('Vice Principal / Headmistress');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smsAlertPreview, setSmsAlertPreview] = useState<string | null>(null);

  // Printable Pass Modal
  const [activePrintPass, setActivePrintPass] = useState<any | null>(null);

  const fetchPasses = async () => {
    setIsLoading(true);
    const res = await getEarlyDeparturePassesAction();
    if (res.success) {
      setPasses(res.passes || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  // Handle Submit Gate Pass
  const handleIssuePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInput.trim() || !escortName.trim()) return;

    setIsSubmitting(true);
    const res = await issueStudentEarlyDeparturePassAction({
      studentAdmissionNoOrName: studentInput,
      reason,
      authorizedEscortName: escortName,
      escortRelation: escortRelation,
      approvedBy: approver
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      setSmsAlertPreview(res.smsAlert || null);
      fetchPasses();
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
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
              Campus Security & Authorized Escort Gate Pass
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <DoorOpen className="w-8 h-8 text-amber-400" />
            Emergency Early Departure & Digital Gate Pass
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Authorized escort verification, principal approval workflow, and automated instant parent SMS departure dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            🚨 Issue Gate Pass
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchPasses}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* SMS Alert Feedback */}
      {smsAlertPreview && (
        <div className="p-4 bg-indigo-950 text-white border border-indigo-800 rounded-2xl flex items-center justify-between text-xs font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{smsAlertPreview}</span>
          </div>
          <button onClick={() => setSmsAlertPreview(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* 🌟 GATE PASSES REGISTRY TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Today's Authorized Early Departure Registry ({passes.length})
            </h3>
            <p className="text-xs text-slate-400">
              Real-time gate pass log with verified escort identities and authority approvals.
            </p>
          </div>
        </div>

        {passes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No early departure gate passes issued today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-4">Gate Pass #</th>
                  <th className="py-3 px-4">Student & Class</th>
                  <th className="py-3 px-4">Reason for Early Exit</th>
                  <th className="py-3 px-4">Authorized Escort</th>
                  <th className="py-3 px-4">Approved By</th>
                  <th className="py-3 px-4">Exit Time</th>
                  <th className="py-3 px-4">Parent SMS</th>
                  <th className="py-3 px-4 text-right">Print Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {passes.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                      {p.gate_pass_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block font-bold">{p.student_name}</strong>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">{p.class_name} ({p.admission_no})</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {p.reason}
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block font-bold">{p.authorized_escort_name}</strong>
                      <span className="text-[10px] text-slate-400 font-semibold">{p.escort_relation} • ID Verified ✓</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-semibold">
                      {p.approved_by}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500 font-medium">
                      {p.departure_time}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        ✓ Dispatched
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActivePrintPass(p)}
                        className="text-[11px] py-1 px-3 hover:bg-amber-50 hover:text-amber-900 border-slate-300"
                        leftIcon={<Printer className="w-3.5 h-3.5 text-amber-600" />}
                      >
                        Print Pass
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🌟 ISSUE PASS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-black text-slate-900">Issue Early Departure Gate Pass</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssuePass} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Admission No / Name</label>
                <input
                  type="text"
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  placeholder="e.g. CBS-2026-0001"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Early Departure</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="Infirmary Medical Referral (Sudden Fever)">Infirmary Medical Referral (Sudden Fever)</option>
                  <option value="Urgent Family Emergency">Urgent Family Emergency</option>
                  <option value="Official Visa / Passport Appointment">Official Visa / Passport Appointment</option>
                  <option value="External State Olympiad / Sports Event">External State Olympiad / Sports Event</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Authorized Escort Name</label>
                  <input
                    type="text"
                    value={escortName}
                    onChange={(e) => setEscortName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    placeholder="e.g. Mrs. Pooja Verma"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Relation to Student</label>
                  <select
                    value={escortRelation}
                    onChange={(e) => setEscortRelation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Legal Guardian</option>
                    <option value="Authorized Driver">Authorized Driver / Escort</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Approving Academic Officer</label>
                <input
                  type="text"
                  value={approver}
                  onChange={(e) => setApprover(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Upon issuing, an automated MSG91 SMS dispatch will be sent immediately to the registered parents.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                  Issue Gate Pass & Send SMS
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 PRINT GATE PASS MODAL */}
      {activePrintPass && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black uppercase text-amber-700">Official Security Exit Pass</span>
              <button onClick={() => setActivePrintPass(null)} className="text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 p-6 rounded-2xl bg-slate-50 space-y-3">
              <div className="w-20 h-20 mx-auto bg-white border border-slate-300 rounded-xl flex items-center justify-center shadow-xs">
                <QrCode className="w-14 h-14 text-slate-900" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block">
                  {activePrintPass.gate_pass_number}
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm mt-1">{activePrintPass.student_name}</h4>
                <p className="text-[11px] text-slate-600 font-medium">{activePrintPass.class_name} ({activePrintPass.admission_no})</p>
                <p className="text-[10px] text-slate-500 italic mt-1">"{activePrintPass.reason}"</p>
                <div className="pt-2 text-[10px] text-slate-700 border-t border-slate-200 font-semibold">
                  <span>Escort: {activePrintPass.authorized_escort_name} ({activePrintPass.escort_relation})</span>
                </div>
              </div>
            </div>

            <Button size="sm" variant="primary" onClick={() => window.print()} className="w-full bg-slate-900 text-white" leftIcon={<Printer className="w-4 h-4" />}>
              Print Security Slip
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
