"use client";

import { Play, Users } from "lucide-react";

export default function GenerateModule() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Play className="w-7 h-7 text-stone-400" />
             Generate Fees
          </h1>
          <p className="text-stone-500 mt-1">Bulk invoice generation and editable fee application.</p>
        </div>
        <div>
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <Users className="w-4 h-4" /> Action
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-stone-900 mb-4">Invoice Generation Wizard</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <select className="border border-stone-200 p-2.5 rounded-xl text-sm focus:outline-none"><option>Select Class: All</option></select>
              <select className="border border-stone-200 p-2.5 rounded-xl text-sm focus:outline-none"><option>Select Template: Grade 1-5</option></select>
              <select className="border border-stone-200 p-2.5 rounded-xl text-sm focus:outline-none"><option>Billing Cycle: Q2 (July-Sept)</option></select>
            </div>
            <button className="bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-900 transition shadow-sm w-full md:w-auto">Simulate Invoice Generation</button>
          </div>
        
      
    </div>
  );
}
