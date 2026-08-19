"use client";

import { AlertTriangle, Settings2 } from "lucide-react";

export default function LatefeesModule() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <AlertTriangle className="w-7 h-7 text-stone-400" />
             Late Fee Management
          </h1>
          <p className="text-stone-500 mt-1">Set rules and track automatically calculated penalties.</p>
        </div>
        <div>
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <Settings2 className="w-4 h-4" /> Action
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="font-bold text-stone-900 mb-4">Active Late Fee Rules</h3>
            <div className="border border-stone-100 rounded-xl p-4 flex justify-between items-center hover:bg-stone-50">
               <div><p className="font-bold text-stone-900">Standard Daily Penalty</p><p className="text-sm text-stone-500">₹50/day after 15th of the month</p></div>
               <span className="bg-red-100 text-red-700 px-2 py-1 text-xs font-bold rounded">Active</span>
            </div>
          </div>
        
      
    </div>
  );
}
