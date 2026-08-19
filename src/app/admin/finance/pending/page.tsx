"use client";

import { Clock, Search } from "lucide-react";

export default function PendingModule() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Clock className="w-7 h-7 text-stone-400" />
             Pending Fees
          </h1>
          <p className="text-stone-500 mt-1">Monitor outstanding balances before they become overdue.</p>
        </div>
        <div>
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <Search className="w-4 h-4" /> Action
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6 flex justify-between items-center">
             <div><p className="text-sm text-stone-500 font-bold uppercase tracking-wider">Total Pending Volume</p><h2 className="text-3xl font-black text-orange-600">₹12,45,000</h2></div>
             <button className="bg-orange-100 text-orange-700 font-bold px-4 py-2 rounded-xl">Send Bulk Reminder</button>
          </div>
        
      
    </div>
  );
}
