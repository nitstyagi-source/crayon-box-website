"use client";

import { useState } from "react";
import { useSiblingContext } from "@/components/providers/SiblingProvider";
import { Wallet, Download, CreditCard, Receipt, TrendingUp, History } from "lucide-react";

export default function FeesHub() {
  const { activeSibling } = useSiblingContext();
  const [feePlan, setFeePlan] = useState<"Quarterly" | "Monthly">("Quarterly");

  const isQuarterly = feePlan === "Quarterly";
  const tuitionFee = isQuarterly ? 18000 : 6000;
  const transportFee = isQuarterly ? 4500 : 1500;
  const itFee = isQuarterly ? 2000 : 666;
  const totalFee = tuitionFee + transportFee + itFee;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Financial Hub</h1>
        <p className="text-sm text-slate-500">Manage fee ledgers and smart campus wallet for <span className="font-bold text-primary">{activeSibling?.firstName}</span>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fee Ledger Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Dues</p>
                <div className="flex bg-slate-200 rounded-md p-1">
                  <button 
                    onClick={() => setFeePlan("Monthly")}
                    className={`px-3 py-1 text-xs font-bold rounded-sm transition-colors ${!isQuarterly ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setFeePlan("Quarterly")}
                    className={`px-3 py-1 text-xs font-bold rounded-sm transition-colors ${isQuarterly ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Quarterly
                  </button>
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-900">₹{totalFee.toLocaleString('en-IN')}</h2>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider mb-2">Due in 5 Days</span>
              <p className="text-xs text-slate-500">{isQuarterly ? "Oct 1 - Dec 31, 2026" : "Oct 1 - Oct 31, 2026"}</p>
            </div>
          </div>
          
          <div className="p-6 flex-1">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Itemized Ledger Breakdown</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-600 pb-2 border-b border-slate-100">
                <span>Tuition Fee</span>
                <span className="font-medium text-slate-900">₹{tuitionFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pb-2 border-b border-slate-100">
                <span>Transport Fee (Zone 1)</span>
                <span className="font-medium text-slate-900">₹{transportFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pb-2 border-b border-slate-100">
                <span>IT & Activity Fee</span>
                <span className="font-medium text-slate-900">₹{itFee.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" /> Pay Securely
              </button>
              <button className="px-6 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Smart Wallet */}
        <div className="bg-primary rounded-2xl shadow-xl overflow-hidden text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Wallet className="w-32 h-32" />
          </div>
          <div className="p-6 relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Wallet className="w-4 h-4" /></div>
              <h2 className="font-bold text-sm uppercase tracking-widest text-blue-100">Campus Smart Wallet</h2>
            </div>
            
            <p className="text-sm text-blue-200 mb-1">Available Balance</p>
            <h3 className="text-4xl font-black mb-8">₹1,250</h3>
            
            <div className="mt-auto space-y-3">
              <button className="w-full bg-white text-primary font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" /> Top-Up Wallet
              </button>
              <p className="text-[10px] text-center text-blue-300 uppercase tracking-widest font-medium">Used for Cafeteria & Print Kiosks</p>
            </div>
          </div>
        </div>

      </div>

      {/* Payment History */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><History className="w-5 h-5 text-slate-400" /> Recent Transactions</h2>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Description</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Amount</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { date: "Jul 05, 2026", desc: "Q2 Tuition & Transport", amount: "₹24,500" },
                { date: "Jun 12, 2026", desc: "Smart Wallet Top-Up", amount: "₹1,000" },
                { date: "Apr 02, 2026", desc: "Q1 Tuition & Transport", amount: "₹24,500" }
              ].map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{tx.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{tx.desc}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{tx.amount}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary hover:text-blue-800 font-bold text-xs uppercase tracking-widest flex items-center justify-end gap-1 ml-auto">
                      <Receipt className="w-3 h-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
