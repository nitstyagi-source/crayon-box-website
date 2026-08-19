"use client";

import { use } from "react";
import { 
  ArrowLeft, Download, Plus, AlertCircle, CheckCircle2, RotateCcw, ArrowRightLeft, CreditCard
} from "lucide-react";
import Link from "next/link";

// In Next.js 15+, dynamic route params are resolved via use()
export default function StudentFeeLedger({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  // Mock Ledger Data representing: Generated → Discount → Late Fee → Payment → Balance
  const ledgerEntries = [
    { date: "2026-04-01", type: "Charge", description: "Tuition Fee (Q1)", amount: 15000, balance: 15000 },
    { date: "2026-04-01", type: "Charge", description: "Transport Fee (Q1)", amount: 3000, balance: 18000 },
    { date: "2026-04-05", type: "Discount", description: "Sibling Concession (10%)", amount: -1500, balance: 16500 },
    { date: "2026-05-15", type: "LateFee", description: "Late Fee Penalty (15 Days)", amount: 500, balance: 17000 },
    { date: "2026-05-16", type: "Payment", description: "Partial Payment (Cash)", amount: -10000, balance: 7000 },
    { date: "2026-07-01", type: "Charge", description: "Tuition Fee (Q2)", amount: 15000, balance: 22000 },
    { date: "2026-07-10", type: "Payment", description: "Full Payment (UPI)", amount: -22000, balance: 0 },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/finance" className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Student Fee Ledger</h1>
            <p className="text-stone-500 font-mono text-sm">{studentId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-stone-200 text-stone-700 font-bold px-4 py-2 rounded-lg hover:bg-stone-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> Statement
          </button>
          <button className="bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-900 flex items-center gap-2 shadow-sm">
            <CreditCard className="w-4 h-4" /> Collect Payment
          </button>
        </div>
      </div>

      {/* Student Context Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-2xl">
            A
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">Aarav Sharma</h2>
            <p className="text-stone-500">Grade 5 • Section A</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Current Balance</p>
          <h3 className="text-3xl font-black text-green-600">₹0.00</h3>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-stone-400" /> Complete Financial History
          </h3>
          <button className="text-primary font-bold text-sm hover:underline">Apply Waiver</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Description</th>
                <th className="p-4 font-bold text-right">Debit (+ ₹)</th>
                <th className="p-4 font-bold text-right">Credit (- ₹)</th>
                <th className="p-4 font-bold text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {ledgerEntries.map((entry, idx) => {
                const isCharge = entry.amount > 0;
                return (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 text-stone-500 text-sm whitespace-nowrap">{entry.date}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                        entry.type === 'Charge' ? 'bg-blue-100 text-blue-700' :
                        entry.type === 'Payment' ? 'bg-green-100 text-green-700' :
                        entry.type === 'LateFee' ? 'bg-red-100 text-red-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="p-4 text-stone-900 font-medium">{entry.description}</td>
                    <td className="p-4 text-right text-stone-900">
                      {isCharge ? entry.amount.toLocaleString() : '-'}
                    </td>
                    <td className="p-4 text-right text-green-600 font-medium">
                      {!isCharge ? Math.abs(entry.amount).toLocaleString() : '-'}
                    </td>
                    <td className="p-4 text-right font-black text-stone-900">
                      ₹{entry.balance.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
