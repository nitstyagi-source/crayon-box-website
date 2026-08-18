"use client";

import { useState } from "react";
import { Camera, Package, QrCode, Search, CheckCircle2, AlertCircle } from "lucide-react";

export default function InventoryScanner() {
  const [scanMode, setScanMode] = useState(false);
  const [scannedAsset, setScannedAsset] = useState<string | null>(null);

  const simulateScan = () => {
    setScanMode(true);
    setTimeout(() => {
      setScanMode(false);
      setScannedAsset("ASSET-LAB-042");
    }, 1500);
  };

  const assignAsset = () => {
    alert("Asset successfully assigned to student in the database!");
    setScannedAsset(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Package className="w-6 h-6 text-indigo-600" /> Asset & Inventory Hub</h1>
          <p className="text-sm text-slate-500">Scan QR codes to assign library books or lab equipment.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Mobile Camera Viewport Simulator */}
        <div className="w-full md:w-1/2 bg-slate-900 p-8 flex flex-col items-center justify-center min-h-[400px] relative">
          
          {!scanMode && !scannedAsset && (
            <button onClick={simulateScan} className="w-32 h-32 rounded-full bg-indigo-500 hover:bg-indigo-400 transition-colors flex flex-col items-center justify-center text-white shadow-2xl ring-8 ring-indigo-500/30">
              <Camera className="w-8 h-8 mb-2" />
              <span className="font-bold text-sm">Tap to Scan</span>
            </button>
          )}

          {scanMode && (
            <div className="relative w-64 h-64 border-2 border-indigo-400 rounded-2xl overflow-hidden">
               {/* Scanning Laser Animation */}
               <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] animate-[ping_1.5s_ease-in-out_infinite] z-10"></div>
               <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center">
                 <QrCode className="w-24 h-24 text-indigo-200 opacity-50" />
               </div>
               <p className="absolute bottom-4 left-0 right-0 text-center text-indigo-200 text-sm font-bold animate-pulse">Scanning QR_HASH...</p>
            </div>
          )}

          {scannedAsset && (
            <div className="bg-emerald-500 text-white p-6 rounded-2xl flex flex-col items-center text-center animate-in zoom-in duration-300 shadow-2xl">
              <CheckCircle2 className="w-16 h-16 mb-4" />
              <h2 className="text-xl font-bold">QR Detected</h2>
              <p className="text-emerald-100 mt-1 font-mono">{scannedAsset}</p>
            </div>
          )}

        </div>

        {/* Details & Assignment Form */}
        <div className="w-full md:w-1/2 p-8 bg-slate-50 flex flex-col">
          {scannedAsset ? (
            <div className="flex-1 space-y-6">
              <div>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Library Book</span>
                <h2 className="text-2xl font-bold text-slate-800 mt-3">Advanced Chemistry Vol. 2</h2>
                <p className="text-slate-500 font-mono text-sm mt-1">SKU: {scannedAsset}</p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Assign to Student</label>
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search by name or ID..." className="pl-10 pr-4 py-3 w-full bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm" />
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800">This asset is currently in <strong>Good</strong> condition. The student is liable for any damage upon return.</p>
              </div>

              <div className="pt-6 mt-auto">
                <button onClick={assignAsset} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-colors">
                  Confirm Checkout
                </button>
                <button onClick={() => setScannedAsset(null)} className="w-full text-slate-500 font-bold py-4 hover:text-slate-700 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <QrCode className="w-24 h-24 text-slate-300 mb-6" />
              <h3 className="text-lg font-bold text-slate-500">Awaiting Scan</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs">Scan an asset using the camera on the left to view details and assign it to a student.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
