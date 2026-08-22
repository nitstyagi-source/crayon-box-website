"use client";

import React, { useState } from 'react';
import {
  CreditCard, DollarSign, ArrowUpRight, TrendingUp,
  Receipt, Download, ShieldCheck, CheckCircle2, AlertCircle,
  Building2, Layers, RefreshCw, BarChart3
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function ExecutiveFinancePage() {
  const [selectedInst, setSelectedInst] = useState<string>('ALL');

  const financialKPIs = {
    grossBilled: '₹14.85 Cr',
    totalCollected: '₹13.42 Cr',
    collectionRate: '90.37%',
    totalOutstanding: '₹1.43 Cr',
    reconciliationMatched: '99.8%',
  };

  const feeHeads = [
    { name: 'Tuition & Academic Instructional Fee', billed: '₹9.80 Cr', collected: '₹8.95 Cr', outstanding: '₹0.85 Cr' },
    { name: 'Transport & Fleet Operations Fee', billed: '₹2.20 Cr', collected: '₹1.98 Cr', outstanding: '₹0.22 Cr' },
    { name: 'STEM Labs & Robotics Equipment Fee', billed: '₹1.45 Cr', collected: '₹1.35 Cr', outstanding: '₹0.10 Cr' },
    { name: 'Annual Development & Infrastructure', billed: '₹1.40 Cr', collected: '₹1.14 Cr', outstanding: '₹0.26 Cr' },
  ];

  const reconciliationLedger = [
    {
      id: 'REC-2026-881',
      date: '2026-08-22',
      institutionCode: 'CBS',
      gatewayTxnId: 'pay_RZP908129',
      studentName: 'Aarav Sharma (CBS-2026-0042)',
      amount: '₹40,200',
      bankStatementMatch: 'HDFC Bank Acct #9021 (MATCHED)',
      status: 'RECONCILED',
    },
    {
      id: 'REC-2026-882',
      date: '2026-08-22',
      institutionCode: 'CBPS',
      gatewayTxnId: 'pay_RZP908130',
      studentName: 'Anaya Sharma (CBPS-2026-0018)',
      amount: '₹28,500',
      bankStatementMatch: 'HDFC Bank Acct #9022 (MATCHED)',
      status: 'RECONCILED',
    },
    {
      id: 'REC-2026-883',
      date: '2026-08-22',
      institutionCode: 'AS',
      gatewayTxnId: 'pay_RZP908131',
      studentName: 'Vihaan Gupta (AS-2026-0128)',
      amount: '₹45,500',
      bankStatementMatch: 'ICICI Bank Acct #4410 (MATCHED)',
      status: 'RECONCILED',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Double-Entry Financial Ledgers
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Session 2026–2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Executive Finance & General Ledger</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Multi-head fee collections, student accounts, 3-way bank reconciliation, and Trust financial consolidation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Consolidated Financial Statement (PDF)
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-stone-400">Total Gross Billed</span>
          <h3 className="text-3xl font-black text-stone-900">{financialKPIs.grossBilled}</h3>
          <p className="text-xs text-stone-500 font-medium">Across 2,850 Enrolled Students</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-stone-400">Total Collected to Date</span>
          <h3 className="text-3xl font-black text-emerald-600">{financialKPIs.totalCollected}</h3>
          <p className="text-xs text-emerald-700 font-bold">🟢 {financialKPIs.collectionRate} Collection Yield</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-stone-400">Total Outstanding Receivables</span>
          <h3 className="text-3xl font-black text-amber-600">{financialKPIs.totalOutstanding}</h3>
          <p className="text-xs text-stone-500 font-medium">Under active automated reminder cycle</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-stone-400">3-Way Bank Reconciliation</span>
          <h3 className="text-3xl font-black text-indigo-600">{financialKPIs.reconciliationMatched}</h3>
          <p className="text-xs text-stone-500 font-medium">ERP vs Razorpay vs MT940 Bank Feed</p>
        </div>
      </div>

      {/* Fee Head Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600" /> Multi-Head Fee Revenue Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Fee Head</th>
                <th className="p-3.5 text-right">Total Billed</th>
                <th className="p-3.5 text-right">Total Collected</th>
                <th className="p-3.5 text-right">Outstanding</th>
                <th className="p-3.5 text-right">Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {feeHeads.map((head, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5 font-bold text-stone-900">{head.name}</td>
                  <td className="p-3.5 text-right font-bold text-stone-800">{head.billed}</td>
                  <td className="p-3.5 text-right font-black text-emerald-600">{head.collected}</td>
                  <td className="p-3.5 text-right font-black text-amber-600">{head.outstanding}</td>
                  <td className="p-3.5 text-right font-bold text-indigo-600">
                    {Math.round((parseFloat(head.collected.replace(/[^0-9.]/g, '')) / parseFloat(head.billed.replace(/[^0-9.]/g, ''))) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Way Daily Bank Reconciliation Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> 3-Way Daily Bank Reconciliation Feed
            </h2>
            <p className="text-xs text-stone-400 font-semibold mt-0.5">Automated settlement matching via Bank MT940 statement</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-black text-xs rounded-xl border border-emerald-200">
            Reconciliation Health: 100% Zero Drift
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Settlement ID & Date</th>
                <th className="p-3.5">Institution</th>
                <th className="p-3.5">Student Account</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5">Bank Statement Verification</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {reconciliationLedger.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-stone-900 block">{row.id}</span>
                    <span className="text-stone-400 text-[10px]">{row.date} • {row.gatewayTxnId}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                      {row.institutionCode}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-stone-800">{row.studentName}</td>
                  <td className="p-3.5 text-right font-black text-stone-900">{row.amount}</td>
                  <td className="p-3.5 font-medium text-emerald-800">{row.bankStatementMatch}</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      {row.status}
                    </span>
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
