"use client";

import { FileText, Download } from "lucide-react";

export default function ReceiptsModule() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <FileText className="w-7 h-7 text-stone-400" />
             Receipts Directory
          </h1>
          <p className="text-stone-500 mt-1">Global repository of all generated payment receipts.</p>
        </div>
        <div>
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Action
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col items-center justify-center h-64 text-center">
             <div className="w-12 h-12 text-stone-300 mb-4 flex items-center justify-center">ReceiptIcon</div>
             <h3 className="font-bold text-stone-900 text-lg">Receipts Archive</h3>
             <p className="text-stone-500 text-sm mt-2 max-w-sm">All generated receipts will appear here chronologically for easy download and auditing.</p>
          </div>
        
      
    </div>
  );
}
