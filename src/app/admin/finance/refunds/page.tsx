"use client";

import { RotateCcw, CheckCircle2 } from "lucide-react";

export default function RefundsModule() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <RotateCcw className="w-7 h-7 text-stone-400" />
             Refunds & Adjustments
          </h1>
          <p className="text-stone-500 mt-1">Process and approve invoice reversals and security deposit returns.</p>
        </div>
        <div>
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4" /> Action
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-900 mb-4">Pending Approvals</h3>
                <p className="text-stone-500 text-sm">No refund requests pending at this time.</p>
             </div>
             <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                <button className="w-full bg-white border border-stone-200 text-stone-900 font-bold py-3 rounded-xl shadow-sm hover:bg-stone-100">Initiate New Refund</button>
             </div>
          </div>
        
      
    </div>
  );
}
