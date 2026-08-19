"use client";

import { CreditCard, CheckCircle2, Download, Receipt } from "lucide-react";

export default function ParentFeePortal() {
  
  const currentInvoice = {
    invoiceNumber: "INV-2026-Q3-1045",
    dueDate: "2026-09-15",
    totalPayable: 18500,
    items: [
      { description: "Tuition Fee (Q3)", amount: 15000 },
      { description: "Transport Zone B", amount: 3000 },
      { description: "Lab Fee (Science)", amount: 500 }
    ]
  };

  const pastTransactions = [
    { period: "Q2 2026", date: "2026-06-10", amount: 18500, status: "Success", ref: "pay_xyz123" },
    { period: "Q1 2026", date: "2026-03-12", amount: 18000, status: "Success", ref: "pay_abc456" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto bg-stone-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Fee Portal</h1>
        <p className="text-stone-500 mt-1">Manage and pay your school fees securely.</p>
      </div>

      {/* CTA Card */}
      <div className="bg-gradient-to-br from-primary to-blue-900 rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 text-center md:text-left">
          <p className="text-blue-100 font-bold uppercase tracking-widest text-sm mb-2">Total Outstanding Dues</p>
          <h2 className="text-5xl md:text-6xl font-black mb-2">₹{currentInvoice.totalPayable.toLocaleString()}</h2>
          <p className="text-blue-200 text-sm">Due Date: <span className="font-bold text-white">{currentInvoice.dueDate}</span></p>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <button className="w-full md:w-auto bg-accent text-white hover:bg-orange-600 font-black text-lg py-4 px-10 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3">
            Pay Now <CreditCard className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Current Invoice Breakdown */}
      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
        <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-stone-400" /> Current Invoice Breakdown
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between text-sm font-bold text-stone-500 uppercase tracking-widest border-b border-stone-100 pb-3">
            <span>Description</span>
            <span>Amount</span>
          </div>
          
          {currentInvoice.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 text-stone-700">
              <span className="font-medium">{item.description}</span>
              <span className="font-bold text-stone-900">₹{item.amount.toLocaleString()}</span>
            </div>
          ))}
          
          <div className="flex justify-between items-center pt-6 mt-4 border-t border-stone-200">
            <span className="text-lg font-bold text-stone-900">Total Payable</span>
            <span className="text-2xl font-black text-primary">₹{currentInvoice.totalPayable.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Past Transactions */}
      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
        <h3 className="text-xl font-bold text-stone-900 mb-6">Past Transactions</h3>
        
        <div className="space-y-4">
          {pastTransactions.map((tx, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-stone-100 bg-stone-50/50 gap-4 hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">{tx.period} Fee</h4>
                  <p className="text-xs text-stone-500">Paid on {tx.date} • Ref: {tx.ref}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                <span className="font-black text-stone-900">₹{tx.amount.toLocaleString()}</span>
                <button className="text-primary hover:text-blue-900 transition-colors p-2 rounded-lg hover:bg-blue-50" title="Download Receipt">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
