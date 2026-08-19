"use client";

import { Receipt, Printer } from "lucide-react";

export default function InvoicesModule() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Receipt className="w-7 h-7 text-stone-400" />
             Invoice Management
          </h1>
          <p className="text-stone-500 mt-1">View, print, and track individual generated invoices.</p>
        </div>
        <div>
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <Printer className="w-4 h-4" /> Action
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Invoice #</th><th className="p-4 font-bold">Student</th><th className="p-4 font-bold">Amount</th><th className="p-4 font-bold">Status</th><th className="p-4 font-bold text-right">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-stone-100">
                <tr className="hover:bg-stone-50"><td className="p-4 font-mono text-sm">INV-2026-001</td><td className="p-4 font-bold">Aarav Sharma</td><td className="p-4 font-black">₹18,000</td><td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">Paid</span></td><td className="p-4 text-right"><button className="text-primary text-sm font-bold">View PDF</button></td></tr>
                <tr className="hover:bg-stone-50"><td className="p-4 font-mono text-sm">INV-2026-002</td><td className="p-4 font-bold">Riya Patel</td><td className="p-4 font-black">₹22,500</td><td className="p-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs font-bold">Unpaid</span></td><td className="p-4 text-right"><button className="text-primary text-sm font-bold">View PDF</button></td></tr>
              </tbody>
            </table>
          </div>
        
      
    </div>
  );
}
