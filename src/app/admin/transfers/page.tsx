"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Download, CheckCircle2, Clock, Plus,
  RefreshCw, ShieldCheck, Printer, X, Building2, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getTransferCertificatesAction,
  generateOfficialTransferCertificateAction
} from '@/app/actions/academic-operations-actions';

export default function TransferCertificatesPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [certificates, setCertificates] = useState<any[]>([]);
  const [counts, setCounts] = useState({ totalIssued: 0, totalPending: 0, totalCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // New TC Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [studentInput, setStudentInput] = useState('CBS-2026-0001');
  const [reason, setReason] = useState('Parent Relocation / Father Transferred to Bengaluru HQ');
  const [approver, setApprover] = useState('Principal Dr. Meenakshi Sunder');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Printable TC Modal
  const [activePrintTc, setActivePrintTc] = useState<any | null>(null);

  const fetchTcs = async () => {
    setIsLoading(true);
    const res = await getTransferCertificatesAction();
    if (res.success) {
      setCertificates(res.certificates || []);
      setCounts(res.counts || { totalIssued: 0, totalPending: 0, totalCount: 0 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTcs();
  }, []);

  // Handle Generate TC
  const handleGenerateTc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInput.trim()) return;

    setIsSubmitting(true);
    const res = await generateOfficialTransferCertificateAction({
      studentAdmissionNoOrName: studentInput,
      reasonForLeaving: reason,
      approvedBy: approver
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsNewModalOpen(false);
      fetchTcs();
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
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Standard Transfer Certificates (Rule 24 Compliant)
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-400" />
            Transfer & School Leaving Certificates
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Standardized school leaving documents with UDISE code, PEN numbers, dues clearance checks, and security holograms.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsNewModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-600/20"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            📜 Generate Official TC
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchTcs}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh TC Roster
          </Button>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Issued TCs</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{counts.totalIssued}</span>
          <span className="text-[11px] text-emerald-700 font-bold">Official Certificates Handed Over</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending Clearance</span>
          <span className="text-3xl font-black text-amber-600 mt-1 block">{counts.totalPending}</span>
          <span className="text-[11px] text-amber-700 font-bold">Library / Accounts Pending</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Registered TCs</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{counts.totalCount}</span>
          <span className="text-[11px] text-slate-500 font-semibold">Session 2026–2027</span>
        </div>
      </div>

      {/* 🌟 TRANSFER CERTIFICATES TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Official Transfer Certificate Register ({certificates.length})
            </h3>
            <p className="text-xs text-slate-400">
              Audit log of issued school leaving documents with statutory PEN numbers.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">TC Serial #</th>
                <th className="py-3 px-4">Student & Parents</th>
                <th className="py-3 px-4">Admission & PEN</th>
                <th className="py-3 px-4">Class Last Attended</th>
                <th className="py-3 px-4">Reason for Leaving</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Official Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certificates.map((tc) => (
                <tr key={tc.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                    {tc.tc_number}
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block font-bold">{tc.student_name}</strong>
                    <span className="text-[10px] text-slate-400">F: {tc.father_name} • M: {tc.mother_name}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    <div>Adm: <strong className="text-indigo-600 font-bold">{tc.admission_no}</strong></div>
                    <span className="text-[10px] text-slate-400 font-normal">PEN: {tc.pen_no}</span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {tc.class_last_attended} - {tc.section_last_attended}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {tc.reason_for_leaving}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      tc.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      ✓ {tc.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActivePrintTc(tc)}
                      className="text-[11px] py-1 px-3 hover:bg-emerald-50 hover:text-emerald-900 border-slate-300"
                      leftIcon={<Printer className="w-3.5 h-3.5 text-emerald-600" />}
                    >
                      Print TC
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌟 ISSUE TC MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">Generate Official Transfer Certificate</h3>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateTc} className="space-y-4 text-xs">
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
                <label className="font-bold text-slate-700 block mb-1">Reason for Leaving School</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  placeholder="e.g. Parent relocation to another city..."
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Authorizing Authority</label>
                <input
                  type="text"
                  value={approver}
                  onChange={(e) => setApprover(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
                <span>✓ All dues, library items, and school assets are verified as cleared before TC generation.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsNewModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Generate & Sign TC
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 PRINT OFFICIAL TC MODAL */}
      {activePrintTc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border-4 border-emerald-900 text-slate-900 font-serif space-y-6">
            
            {/* School Crest Header */}
            <div className="text-center border-b-2 border-emerald-900 pb-4 space-y-1">
              <span className="text-[10px] font-sans font-black tracking-widest text-emerald-900 uppercase">Vani Educational Trust</span>
              <h2 className="text-xl font-bold uppercase tracking-tight text-emerald-950">CRAYON BOX INTERNATIONAL SCHOOL</h2>
              <p className="text-[10px] font-sans text-slate-500">Recognized &amp; Registered Institution, Delhi NCR • Reg No: 2730891 • School Code: 07010203401</p>
              <h3 className="text-sm font-sans font-black uppercase text-emerald-800 tracking-wider pt-2">TRANSFER CERTIFICATE</h3>
            </div>

            {/* TC Details Grid */}
            <div className="grid grid-cols-2 gap-y-2 text-xs font-sans">
              <div><strong>TC Number:</strong> {activePrintTc.tc_number}</div>
              <div className="text-right"><strong>Admission No:</strong> {activePrintTc.admission_no}</div>
              <div><strong>Student Name:</strong> {activePrintTc.student_name}</div>
              <div className="text-right"><strong>Date of Birth:</strong> {activePrintTc.dob}</div>
              <div><strong>Father's Name:</strong> {activePrintTc.father_name}</div>
              <div className="text-right"><strong>Mother's Name:</strong> {activePrintTc.mother_name}</div>
              <div><strong>Class Last Studied:</strong> {activePrintTc.class_last_attended}</div>
              <div className="text-right"><strong>Annual Result:</strong> {activePrintTc.annual_result}</div>
              <div className="col-span-2 pt-2"><strong>Reason for Leaving:</strong> {activePrintTc.reason_for_leaving}</div>
            </div>

            {/* Signatures */}
            <div className="pt-8 flex justify-between items-end border-t border-slate-300 text-xs font-sans">
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">Class Teacher</span>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center mx-auto mb-1 text-[9px] text-emerald-900 font-bold uppercase rotate-12">
                  Official Seal
                </div>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">{activePrintTc.approved_by || 'Principal'}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 font-sans">
              <Button size="sm" variant="outline" onClick={() => setActivePrintTc(null)}>
                Close
              </Button>
              <Button size="sm" variant="primary" onClick={() => window.print()} className="bg-emerald-900 text-white" leftIcon={<Printer className="w-4 h-4" />}>
                Print Official TC
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
