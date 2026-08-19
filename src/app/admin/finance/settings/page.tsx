"use client";

import { useState } from "react";
import { Settings, Save, AlertOctagon, RefreshCw, Upload, Download } from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { resetFinanceData } from "@/app/actions/fee-heads";

export default function SettingsModule() {
  const { activeCampusId } = useCampusContext();
  const [isResetting, setIsResetting] = useState(false);

  async function handleResetDB() {
    const confirmation = prompt("DANGER: This will delete ALL fee templates, fee heads, ledgers, and transactions for this campus. Type 'RESET' to confirm.");
    if (confirmation === 'RESET') {
      setIsResetting(true);
      const res = await resetFinanceData(activeCampusId);
      if (res.success) {
        alert("Finance Database successfully reset to a clean state.");
      } else {
        alert("Error resetting database: " + res.error);
      }
      setIsResetting(false);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Settings className="w-7 h-7 text-stone-400" />
             Fee Settings
          </h1>
          <p className="text-stone-500 mt-1">Global configurations, receipt numbering, and database management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Basic Settings */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
           <h3 className="font-bold text-stone-900 text-lg mb-4">Invoice & Receipt Setup</h3>
           <div>
              <label className="text-sm font-bold text-stone-700 block mb-1">Receipt Prefix</label>
              <input type="text" defaultValue="REC-2026-" className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
           </div>
           <div>
              <label className="text-sm font-bold text-stone-700 block mb-1">Institution Legal Name</label>
              <input type="text" defaultValue="Crayon Box International" className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
           </div>
           <button className="bg-primary text-white font-bold py-2.5 px-6 rounded-xl shadow-sm flex items-center gap-2">
             <Save className="w-4 h-4" /> Save Configuration
           </button>
        </div>

        {/* Database Management */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
           <div>
              <h3 className="font-bold text-stone-900 text-lg mb-2 flex items-center gap-2">
                 <RefreshCw className="w-5 h-5 text-blue-600" /> Data Migration
              </h3>
              <p className="text-sm text-stone-500 mb-4">Import or export fee heads, templates, and ledgers from CSV.</p>
              
              <div className="flex gap-3">
                <button className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl shadow-sm flex justify-center items-center gap-2 transition">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 rounded-xl shadow-sm flex justify-center items-center gap-2 transition border border-blue-200">
                  <Upload className="w-4 h-4" /> Import Data
                </button>
              </div>
           </div>

           <div className="pt-6 border-t border-stone-100">
              <h3 className="font-bold text-red-600 text-lg mb-2 flex items-center gap-2">
                 <AlertOctagon className="w-5 h-5" /> Danger Zone
              </h3>
              <p className="text-sm text-stone-500 mb-4">
                Wipe all financial data for this campus. This action is irreversible and will delete all ledgers and invoices.
              </p>
              <button 
                onClick={handleResetDB} 
                disabled={isResetting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {isResetting ? 'Resetting...' : 'Factory Reset Finance Database'}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
