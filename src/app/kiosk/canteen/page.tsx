"use client";

import { useState } from "react";
import { QrCode, CheckCircle2, Coffee } from "lucide-react";
import Image from "next/image";

export default function CanteenPOS() {
  const [scanMode, setScanMode] = useState(true);
  const [scannedStudent, setScannedStudent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const simulateScan = () => {
    setScannedStudent(true);
    setScanMode(false);
  };

  const handleCharge = () => {
    setIsProcessing(true);
    setTimeout(() => {
      alert("₹120.00 successfully deducted from Smart Wallet!");
      setScannedStudent(false);
      setScanMode(true);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      
      {/* Kiosk Header */}
      <header className="bg-black/40 border-b border-white/10 p-6 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white"><Coffee className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Campus Canteen POS</h1>
            <p className="text-slate-400 text-sm">Terminal 02 • Tap ID Card to Pay</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono text-white">12:45 PM</p>
        </div>
      </header>

      <div className="flex-1 flex p-8 gap-8">
        
        {/* Cart View */}
        <div className="w-1/3 bg-white rounded-3xl p-6 flex flex-col shadow-2xl">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">Current Order</h2>
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">Healthy Lunch Combo</p>
                <p className="text-sm text-slate-500">Qty: 1</p>
              </div>
              <p className="font-bold">₹100.00</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">Fresh Apple Juice</p>
                <p className="text-sm text-slate-500">Qty: 1</p>
              </div>
              <p className="font-bold">₹20.00</p>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4 mt-4">
            <div className="flex justify-between items-center text-2xl font-black text-slate-900">
              <span>Total:</span>
              <span>₹120.00</span>
            </div>
          </div>
        </div>

        {/* Scanner View */}
        <div className="flex-1 bg-slate-800 rounded-3xl border border-white/10 overflow-hidden relative flex items-center justify-center">
          
          {scanMode && (
            <button onClick={simulateScan} className="flex flex-col items-center group">
              <div className="relative w-64 h-64 border-4 border-emerald-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                <QrCode className="w-32 h-32 text-emerald-400 opacity-50" />
                <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)] animate-[ping_1.5s_ease-in-out_infinite]"></div>
              </div>
              <h2 className="text-3xl font-bold text-white">Tap Student ID Card</h2>
              <p className="text-slate-400 mt-2 text-lg">Hold NFC card near the terminal</p>
            </button>
          )}

          {scannedStudent && (
            <div className="bg-white p-12 rounded-3xl flex flex-col items-center text-center shadow-2xl animate-in zoom-in duration-300 max-w-md w-full">
              <div className="w-32 h-32 rounded-full border-8 border-emerald-100 overflow-hidden mb-6">
                <Image src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Student" width={128} height={128} className="object-cover" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-1">Leo Carter</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-6">Wallet Balance: <span className="text-emerald-600">₹1,250.00</span></p>
              
              <button 
                onClick={handleCharge}
                disabled={isProcessing}
                className="w-full bg-emerald-500 text-white text-2xl font-black py-6 rounded-2xl shadow-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Charge ₹120.00"}
              </button>
              
              <button onClick={() => { setScannedStudent(false); setScanMode(true); }} className="mt-6 text-slate-400 font-bold hover:text-slate-600 text-lg">Cancel</button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
