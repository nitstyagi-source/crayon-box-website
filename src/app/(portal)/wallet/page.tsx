"use client";

import { useState } from "react";
import { Wallet, ArrowUpRight, History, ShieldAlert, CreditCard, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function SmartWalletDashboard() {
  const [balance, setBalance] = useState(1250.00);
  const [isProcessing, setIsProcessing] = useState(false);

  const handle1PayTopUp = () => {
    setIsProcessing(true);
    // Simulate 1 Pay Integration flow
    setTimeout(() => {
      setBalance(b => b + 1000);
      alert("1 Pay: Top-up of ₹1,000 successful!");
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Wallet className="w-6 h-6 text-emerald-600" /> Smart Wallet</h1>
          <p className="text-sm text-slate-500">Manage NFC limits and canteen spending for Leo.</p>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
            <h2 className="text-5xl font-black font-mono">₹{balance.toFixed(2)}</h2>
            <div className="mt-4 inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-300" /> Daily Limit: ₹500.00
            </div>
          </div>
          
          <div className="w-full md:w-auto bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 text-center">
            <h3 className="font-bold mb-4">Quick Top-Up</h3>
            <button 
              onClick={handle1PayTopUp}
              disabled={isProcessing}
              className="w-full bg-white text-emerald-900 font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              <Image src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" width={40} height={15} className="opacity-80" />
              {isProcessing ? "Processing..." : "Pay ₹1,000 via 1 Pay"}
            </button>
            <button className="text-xs font-bold text-emerald-200 mt-3 hover:text-white transition-colors">Other Payment Methods</button>
          </div>
        </div>
      </div>

      {/* NFC Card Management */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between group cursor-pointer hover:border-emerald-300 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Leo's NFC ID Card</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">Status: Active • Block Card?</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-slate-500" /> Recent Activity</h3>
          <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">-</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Canteen: Healthy Lunch Combo</p>
                <p className="text-xs text-slate-500">Today, 12:30 PM • POS Terminal 2</p>
              </div>
            </div>
            <p className="font-bold text-slate-800">-₹120.00</p>
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg"><ArrowUpRight className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Top-Up via 1 Pay</p>
                <p className="text-xs text-slate-500">Yesterday, 09:15 AM</p>
              </div>
            </div>
            <p className="font-bold text-emerald-600">+₹500.00</p>
          </div>
        </div>
      </div>

    </div>
  );
}
