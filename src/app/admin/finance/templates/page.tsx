"use client";

import { FileSignature, Plus } from "lucide-react";

export default function TemplatesModule() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <FileSignature className="w-7 h-7 text-stone-400" />
             Fee Templates
          </h1>
          <p className="text-stone-500 mt-1">Bundle fee heads, set recurring rules, and apply default concessions.</p>
        </div>
        <div>
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Action
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-stone-900 text-lg">Grade 1-5 Standard Template</h3>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">Quarterly</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex justify-between text-sm"><span className="text-stone-500">Tuition Fee</span><span className="font-bold text-stone-900">₹15,000</span></li>
                <li className="flex justify-between text-sm"><span className="text-stone-500">Activity Fee</span><span className="font-bold text-stone-900">₹2,000</span></li>
              </ul>
              <button className="w-full bg-stone-100 text-stone-700 py-2 rounded-xl font-bold text-sm hover:bg-stone-200 transition">Edit Template</button>
            </div>
          </div>
        
      
    </div>
  );
}
