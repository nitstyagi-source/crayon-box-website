"use client";

import { BarChart, FileSpreadsheet } from "lucide-react";

export default function ReportsModule() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <BarChart className="w-7 h-7 text-stone-400" />
             Financial Reports
          </h1>
          <p className="text-stone-500 mt-1">Export detailed CSV/PDF statements for audits.</p>
        </div>
        <div>
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <FileSpreadsheet className="w-4 h-4" /> Action
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md cursor-pointer transition">
                <h4 className="font-bold text-stone-900">Daily Collection Report</h4>
                <p className="text-xs text-stone-500 mt-1">Cash, Cheque, Gateway breakdown by day.</p>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md cursor-pointer transition">
                <h4 className="font-bold text-stone-900">Defaulter Ageing Report</h4>
                <p className="text-xs text-stone-500 mt-1">Overdue students sorted by days late.</p>
             </div>
          </div>
        
      
    </div>
  );
}
