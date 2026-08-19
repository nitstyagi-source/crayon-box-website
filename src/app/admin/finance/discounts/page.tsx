"use client";

import { Percent, UserCheck } from "lucide-react";

export default function DiscountsModule() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Percent className="w-7 h-7 text-stone-400" />
             Discounts & Concessions
          </h1>
          <p className="text-stone-500 mt-1">Manage sibling waivers, staff discounts, and scholarships.</p>
        </div>
        <div>
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <UserCheck className="w-4 h-4" /> Action
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Rule Name</th><th className="p-4 font-bold">Type</th><th className="p-4 font-bold">Value</th><th className="p-4 font-bold">Active Students</th>
              </tr></thead>
              <tbody className="divide-y divide-stone-100">
                <tr><td className="p-4 font-bold text-stone-900">Sibling Concession (2nd Child)</td><td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Percentage</span></td><td className="p-4 font-black">15%</td><td className="p-4 font-bold">42</td></tr>
                <tr><td className="p-4 font-bold text-stone-900">Staff Ward Waiver</td><td className="p-4"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Percentage</span></td><td className="p-4 font-black">50%</td><td className="p-4 font-bold">18</td></tr>
              </tbody>
            </table>
          </div>
        
      
    </div>
  );
}
