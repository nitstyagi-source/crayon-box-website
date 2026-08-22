"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRightLeft, Users, UserCheck, ShieldCheck, CheckCircle2,
  AlertCircle, Sparkles, RefreshCw, Download, ArrowRight, ExternalLink
} from 'lucide-react';
import { executeInternalTrustTransferAction } from '@/app/actions/student-enrollment';

export default function InterInstitutionTransfersPage() {
  const [selectedType, setSelectedType] = useState<'STUDENTS' | 'STAFF'>('STUDENTS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);

  const transferHistory = [
    {
      id: 'TRF-2026-001',
      studentName: 'Vihaan Agarwal',
      studentUuid: 'STU-VET-882144',
      fromInstitution: 'Crayon Box School (CBS)',
      toInstitution: 'Avinya School (AS)',
      targetGrade: 'Grade 5',
      transferReason: 'Family relocation to Virender Nagar Burari',
      financialSettlement: '₹4,500 advance fee credit transferred from CBS to AS Ledger',
      date: '2026-08-10',
      status: 'COMPLETED',
    },
    {
      id: 'TRF-2026-002',
      studentName: 'Ananya Sharma',
      studentUuid: 'STU-VET-882110',
      fromInstitution: 'Crayon Box Pre School (CBPS)',
      toInstitution: 'Crayon Box School (CBS)',
      targetGrade: 'Grade 1-A',
      transferReason: 'Montessori KG graduation to Primary School',
      financialSettlement: 'Zero outstanding. 15% Sibling Concession activated on CBS Ledger.',
      date: '2026-04-01',
      status: 'COMPLETED',
    },
  ];

  const handleSimulateTransfer = async () => {
    setIsProcessing(true);
    setTransferStatus(null);
    const res = await executeInternalTrustTransferAction({
      studentUuid: 'STU-VET-882109', // Aarav Sharma
      targetInstitutionId: 'ins-as',
      targetInstitutionCode: 'AS',
      targetCampusId: 'cmp-as-vnb',
      targetGrade: 'Grade 5',
      targetSection: 'A',
      transferReason: 'Parent requested transfer to Avinya School Burari Campus',
      actor: { userId: 'usr-admin', name: 'Managing Trustee', role: 'Trustee' },
    });

    setIsProcessing(false);
    if (res.success) {
      setTransferStatus(`✅ Transfer Success: Aarav Sharma transferred to Avinya School (New Admission #${res.data?.newEnrollment.admissionNumber}). Full historical academic profile preserved!`);
    } else {
      setTransferStatus(`❌ Transfer Error: ${res.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Trust Mobility Engine
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Vani Educational Trust Ecosystem</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Inter-Institution Transfer & Settlement Hub</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Execute internal student & staff mobility across CBS, CBPS, AS, and AVM with zero identity loss.
          </p>
        </div>

        <button
          onClick={handleSimulateTransfer}
          disabled={isProcessing}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold rounded-xl transition shadow-sm"
        >
          <ArrowRightLeft className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
          {isProcessing ? 'Executing Transfer...' : 'Simulate Internal Student Transfer'}
        </button>
      </div>

      {transferStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 animate-in fade-in">
          {transferStatus}
        </div>
      )}

      {/* Transfer History Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" /> Recent Inter-Institution Transfer Records ({transferHistory.length})
          </h2>
          <span className="text-xs text-stone-400 font-semibold">Universal Identity Preserved</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Student & Universal UUID</th>
                <th className="p-3.5">Transfer Pathway</th>
                <th className="p-3.5">Target Grade</th>
                <th className="p-3.5">Reason for Transfer</th>
                <th className="p-3.5">Financial Balance Settlement</th>
                <th className="p-3.5 text-right">Status & Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {transferHistory.map((trf) => (
                <tr key={trf.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-black text-stone-900 block text-sm">{trf.studentName}</span>
                    <span className="font-mono text-stone-400 text-[10px]">{trf.studentUuid}</span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 font-bold text-stone-800">
                      <span>{trf.fromInstitution}</span>
                      <ArrowRight className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span className="text-indigo-900 font-black">{trf.toInstitution}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-stone-900">{trf.targetGrade}</td>
                  <td className="p-3.5 text-stone-600 max-w-[200px]">{trf.transferReason}</td>
                  <td className="p-3.5 text-emerald-700 font-semibold max-w-[220px]">{trf.financialSettlement}</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase inline-block mb-1">
                      {trf.status}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-semibold">{trf.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
