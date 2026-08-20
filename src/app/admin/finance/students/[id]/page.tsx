"use client";

import { useState, useEffect, use } from "react";
import { 
  ArrowLeft, Download, Plus, AlertCircle, CheckCircle2, RotateCcw, 
  ArrowRightLeft, CreditCard, User, Phone, Printer, QrCode
} from "lucide-react";
import Link from "next/link";
import { getStudentFeeLedger } from "@/app/actions/finance-core";

export default function StudentFeeLedger({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const [ledgerData, setLedgerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLedger();
  }, [studentId]);

  async function loadLedger() {
    setIsLoading(true);
    try {
      const res = await getStudentFeeLedger(studentId);
      if (res.success) {
        setLedgerData(res);
      }
    } catch (e) {
      console.error("Error loading student ledger:", e);
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const student = ledgerData?.student;
  const summary = ledgerData?.summary;
  const ledger = ledgerData?.ledger || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/finance/collections" className="p-2.5 hover:bg-stone-100 rounded-xl transition text-stone-600 border border-stone-200">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                Double-Entry Audit Trail
              </span>
              <span className="text-xs font-mono text-stone-400">Family ID: {student?.familyId || 'FAM-1001'}</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">{student?.name || 'Student Ledger'}</h1>
            <p className="text-xs text-stone-500 font-mono">Admission #{student?.admissionNo} • {student?.className} Section {student?.sectionName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Printer className="w-3.5 h-3.5" /> Print Statement
          </button>
          <Link 
            href="/admin/finance/collections"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5" /> Collect Payment
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Total Billed Demand</span>
          <h3 className="text-2xl font-black text-stone-900">{formatCurrency(summary?.totalDemand || 11500)}</h3>
          <p className="text-[11px] text-stone-500 font-semibold">Tuition & Annual Charges</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Total Paid (Credits)</span>
          <h3 className="text-2xl font-black text-emerald-600">{formatCurrency(summary?.totalPaid || 0)}</h3>
          <p className="text-[11px] text-stone-500 font-semibold">Across Verified Receipts</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">Outstanding Balance Due</span>
          <h3 className="text-2xl font-black text-amber-600">{formatCurrency(summary?.balanceDue || 0)}</h3>
          <p className="text-[11px] text-stone-500 font-semibold">
            {summary?.balanceDue === 0 ? "Account Fully Cleared" : "Pending Payment"}
          </p>
        </div>
      </div>

      {/* Complete Financial History Ledger Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-stone-400" />
            Complete Financial Transaction Ledger (Immutable)
          </h3>
          <span className="text-xs text-stone-500 font-semibold">{ledger.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] uppercase font-black tracking-wider text-stone-400 bg-stone-50/30">
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Particulars / Details</th>
                <th className="py-3.5 px-5">Voucher Type</th>
                <th className="py-3.5 px-5">Ref #</th>
                <th className="py-3.5 px-5 text-right">Debit (+ ₹)</th>
                <th className="py-3.5 px-5 text-right">Credit (- ₹)</th>
                <th className="py-3.5 px-5 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-400">Loading ledger data...</td>
                </tr>
              ) : ledger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-400">No ledger transactions found for this student.</td>
                </tr>
              ) : (
                ledger.map((entry: any, idx: number) => {
                  const isDebit = Number(entry.debit) > 0;
                  return (
                    <tr key={idx} className="hover:bg-stone-50/50 transition">
                      <td className="py-3.5 px-5 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                        {entry.transaction_date}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-stone-800">
                        {entry.particulars}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          entry.voucher_type === 'Demand' ? 'bg-blue-100 text-blue-700' :
                          entry.voucher_type === 'Receipt' ? 'bg-emerald-100 text-emerald-700' :
                          entry.voucher_type === 'Concession' ? 'bg-purple-100 text-purple-700' :
                          entry.voucher_type === 'Reversal' ? 'bg-red-100 text-red-700' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {entry.voucher_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[10px] text-stone-400">
                        {entry.reference_no || 'N/A'}
                      </td>
                      <td className="py-3.5 px-5 text-right font-black text-stone-900 font-mono">
                        {isDebit ? formatCurrency(entry.debit) : "—"}
                      </td>
                      <td className="py-3.5 px-5 text-right font-black text-emerald-600 font-mono">
                        {!isDebit ? formatCurrency(entry.credit) : "—"}
                      </td>
                      <td className="py-3.5 px-5 text-right font-black font-mono text-stone-800">
                        {formatCurrency(entry.cumulativeBalance || entry.running_balance)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
