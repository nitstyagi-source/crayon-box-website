"use client";

import { Wallet, Banknote } from "lucide-react";

export default function CollectionsModule() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Wallet className="w-7 h-7 text-stone-400" />
             Payment Collections
          </h1>
          <p className="text-stone-500 mt-1">Record cash, cheque, and offline transactions manually.</p>
        </div>
        <div>
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <Banknote className="w-4 h-4" /> Action
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-900 mb-4 text-lg">Record Manual Payment</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Student ID (e.g. STU-123)" className="w-full border border-stone-200 p-3 rounded-xl text-sm" />
                <input type="number" placeholder="Amount Collected" className="w-full border border-stone-200 p-3 rounded-xl text-sm" />
                <select className="w-full border border-stone-200 p-3 rounded-xl text-sm"><option>Cash</option><option>Cheque</option><option>Bank Transfer</option></select>
                <button className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-green-700">Submit Collection</button>
              </div>
            </div>
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
               <h3 className="font-bold text-stone-900 mb-2">Today's Offline Collection</h3>
               <p className="text-4xl font-black text-green-600 mt-4">₹ 45,500</p>
               <p className="text-sm text-stone-500 mt-2">Across 12 transactions</p>
            </div>
          </div>
        
      
    </div>
  );
}
