"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ArrowRight,
  Sparkles,
  DollarSign,
  Building2,
  Check
} from "lucide-react";
import {
  uploadAndAutoMatchBankStatementAction,
  getBankReconciliationDetailsAction,
  reconcileLineAndPostGlLedgerAction
} from "@/app/actions/bank-recon-actions";

export const BankReconciliationWorkspace: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [activeBatch, setActiveBatch] = useState<any | null>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    loadReconData();
  }, []);

  async function loadReconData(batchId?: string) {
    setIsLoading(true);
    try {
      const res = await getBankReconciliationDetailsAction(batchId);
      if (res.success) {
        setBatches(res.batches || []);
        setActiveBatch(res.activeBatch || null);
        setLines(res.lines || []);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSimulateUpload(bankName: string) {
    setIsUploading(true);
    setActionMsg(null);
    try {
      const res = await uploadAndAutoMatchBankStatementAction({ bankName });
      if (res.success) {
        setActionMsg(`✓ Bank Statement Ingested! Processed ${res.totalLines} lines (₹${(res.totalAmount || 0).toLocaleString('en-IN')}). Auto-matched ${res.matchedLines} transactions.`);
        await loadReconData(res.batchId);
      } else {
        alert(res.error || "Failed to upload bank statement");
      }
    } finally {
      setIsUploading(false);
    }
  }

  async function handleReconcileLine(lineId: string) {
    try {
      const res = await reconcileLineAndPostGlLedgerAction(lineId);
      if (res.success) {
        setActionMsg(`✓ Reconciled! Posted Double-Entry GL Ledger Entry (${res.receiptNo}) for ₹${res.reconciledAmount}.`);
        if (activeBatch) loadReconData(activeBatch.id);
      }
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xl overflow-hidden font-sans space-y-6 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-950 px-2.5 py-1 rounded-full border border-blue-200">
              Double-Entry General Ledger
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Automated Bank Statement Reconciliation Desk
          </h2>
          <p className="text-xs text-stone-500">
            Fuzzy UTR &amp; Admission Number matching with automated balancing Journal Voucher postings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulateUpload("HDFC Bank Main Escrow")}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>{isUploading ? "Auto-Matching Statement..." : "Upload Bank Statement (CSV)"}</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Summary KPI Ribbon */}
      {activeBatch && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-stone-400 block">Active Batch No</span>
            <strong className="text-sm sm:text-base font-mono font-black text-stone-900">{activeBatch.batch_number}</strong>
            <p className="text-[10px] text-stone-500 mt-0.5">{activeBatch.bank_name}</p>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-stone-400 block">Total Inflow</span>
            <strong className="text-sm sm:text-base font-black text-stone-900">₹{parseFloat(activeBatch.total_credit_amount || 0).toLocaleString('en-IN')}</strong>
            <p className="text-[10px] text-stone-500 mt-0.5">{activeBatch.total_lines} statement rows</p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-emerald-700 block">Auto-Matched</span>
            <strong className="text-sm sm:text-base font-black text-emerald-900">₹{parseFloat(activeBatch.matched_amount || 0).toLocaleString('en-IN')}</strong>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">{activeBatch.matched_lines} transactions resolved</p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-amber-700 block">Match Accuracy</span>
            <strong className="text-sm sm:text-base font-black text-amber-900">
              {activeBatch.total_lines > 0 ? Math.round((activeBatch.matched_lines / activeBatch.total_lines) * 100) : 100}%
            </strong>
            <p className="text-[10px] text-amber-700 font-semibold mt-0.5">High fuzzy confidence</p>
          </div>
        </div>
      )}

      {/* Statement Transaction Lines Table */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <span className="text-xs font-black uppercase text-stone-600">
            Statement Credits &amp; Matched Student Invoices ({lines.length})
          </span>
        </div>

        <div className="divide-y divide-stone-100 overflow-x-auto">
          {lines.map((ln) => (
            <div
              key={ln.id}
              className="p-4 hover:bg-stone-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-stone-500 font-bold">{ln.transaction_date}</span>
                  <strong className="font-bold text-stone-900">{ln.raw_description}</strong>
                  {ln.extracted_utr && (
                    <span className="text-[10px] font-mono bg-blue-50 text-blue-950 font-bold px-1.5 py-0.5 rounded">
                      UTR: {ln.extracted_utr}
                    </span>
                  )}
                </div>

                {ln.first_name ? (
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Matched Student: <strong>{ln.first_name} {ln.last_name}</strong> ({ln.student_adm_no}, {ln.class_name})
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      {ln.match_confidence}% Match
                    </span>
                  </div>
                ) : (
                  <span className="text-stone-400 italic">No exact student admission number found in description</span>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <strong className="text-sm font-black text-stone-900">
                  ₹{parseFloat(ln.credit_amount).toLocaleString('en-IN')}
                </strong>

                {ln.match_status === "RECONCILED" ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Reconciled
                  </span>
                ) : (
                  <button
                    onClick={() => handleReconcileLine(ln.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                  >
                    1-Click Reconcile &amp; Post GL
                  </button>
                )}
              </div>
            </div>
          ))}

          {lines.length === 0 && !isLoading && (
            <div className="p-12 text-center text-stone-400 text-xs space-y-2">
              <FileText className="w-8 h-8 mx-auto text-stone-300" />
              <p>No statement batches loaded yet. Click &quot;Upload Bank Statement&quot; above to simulate an upload.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
