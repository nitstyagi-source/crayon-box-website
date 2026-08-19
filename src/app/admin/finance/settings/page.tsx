"use client";

import { Settings, Save } from "lucide-react";

export default function SettingsModule() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Settings className="w-7 h-7 text-stone-400" />
             Fee Settings
          </h1>
          <p className="text-stone-500 mt-1">Global configurations, receipt numbering, and tax details.</p>
        </div>
        <div>
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <Save className="w-4 h-4" /> Action
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 max-w-xl">
             <div>
                <label className="text-sm font-bold text-stone-700 block mb-1">Receipt Prefix</label>
                <input type="text" defaultValue="REC-2026-" className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
             </div>
             <div>
                <label className="text-sm font-bold text-stone-700 block mb-1">Institution Legal Name (For Invoice)</label>
                <input type="text" defaultValue="Crayon Box International" className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
             </div>
             <button className="bg-primary text-white font-bold py-2.5 px-6 rounded-xl shadow-sm">Save Configuration</button>
          </div>
        
      
    </div>
  );
}
