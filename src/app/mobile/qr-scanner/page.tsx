"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  QrCode, Camera, Flashlight, RefreshCw, 
  CheckCircle2, AlertCircle, ArrowLeft, Users, 
  Bus, BookOpen, ShieldCheck, UserCheck
} from "lucide-react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";

export default function MobileQrScannerPage() {
  const { activeRole } = useMobileAuth();
  const [scanMode, setScanMode] = useState<"student_att" | "visitor_pass" | "bus_boarding" | "library">("student_att");
  const [isScanning, setIsScanning] = useState(true);
  const [lastScanResult, setLastScanResult] = useState<any | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);

  const simulateScan = (type: string, name: string, detail: string) => {
    setIsScanning(false);
    setLastScanResult({
      type,
      name,
      detail,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: "Verified ✓"
    });
  };

  const resetScanner = () => {
    setLastScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="space-y-5 pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/mobile" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-tight">Universal QR Scanner</h1>
            <p className="text-[11px] text-slate-500">Role-Aware Verification Engine</p>
          </div>
        </div>

        <button
          onClick={() => setIsTorchOn(!isTorchOn)}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
            isTorchOn ? "bg-amber-400 text-slate-950 border-amber-500 shadow-sm" : "bg-white text-slate-600 border-slate-200"
          }`}
          title="Toggle Flash"
        >
          <Flashlight className="w-4 h-4" />
        </button>
      </div>

      {/* Role-Specific Mode Selectors */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => { setScanMode("student_att"); resetScanner(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            scanMode === "student_att" ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Student ID
        </button>
        <button
          onClick={() => { setScanMode("visitor_pass"); resetScanner(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            scanMode === "visitor_pass" ? "bg-purple-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Visitor / Escort Pass
        </button>
        <button
          onClick={() => { setScanMode("bus_boarding"); resetScanner(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            scanMode === "bus_boarding" ? "bg-amber-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Bus Boarding
        </button>
        <button
          onClick={() => { setScanMode("library"); resetScanner(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            scanMode === "library" ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Library Book
        </button>
      </div>

      {/* Camera Viewfinder Mockup */}
      <div className="relative aspect-square max-w-xs mx-auto bg-slate-950 rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl flex flex-col items-center justify-center p-6 text-white">
        
        {/* Animated Laser Scanning Line */}
        {isScanning && (
          <div className="absolute inset-x-8 top-1/4 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse shadow-lg shadow-amber-400/80" />
        )}

        {/* Viewfinder Target Reticle */}
        <div className="w-48 h-48 border-2 border-dashed border-amber-400/60 rounded-2xl relative flex items-center justify-center">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400 -mt-1 -ml-1" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400 -mt-1 -mr-1" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400 -mb-1 -ml-1" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400 -mb-1 -mr-1" />

          {isScanning ? (
            <div className="text-center p-4">
              <QrCode className="w-12 h-12 text-slate-500 mx-auto animate-pulse" />
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">Align QR code inside box</span>
            </div>
          ) : (
            <div className="text-center p-4 bg-emerald-950/80 backdrop-blur-md rounded-xl border border-emerald-500/50">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <span className="text-xs font-bold text-white mt-1 block">Scan Successful</span>
            </div>
          )}
        </div>

        {/* Mode Overlay Tag */}
        <div className="absolute bottom-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-[10px] font-bold text-amber-300">
          Target: {scanMode.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      {/* Result Card or Simulation Triggers */}
      {lastScanResult ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
              {lastScanResult.status}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{lastScanResult.timestamp}</span>
          </div>

          <div>
            <h4 className="font-bold text-sm text-slate-900">{lastScanResult.name}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{lastScanResult.detail}</p>
          </div>

          <button
            onClick={resetScanner}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all"
          >
            Scan Next Code
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
            Tap Mock QR to Simulate Scan
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => simulateScan("Student", "Aarav Sharma (CB26-05421)", "Grade 5A &bull; Roll 14 &bull; Attendance Marked Present")}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left shadow-xs"
            >
              <div className="font-bold text-xs text-slate-800">Scan Aarav Sharma</div>
              <div className="text-[10px] text-slate-500">Student Attendance Pass</div>
            </button>

            <button
              onClick={() => simulateScan("Visitor", "Prakash Verma (Escort)", "Parent of Diya Verma (2B) &bull; Gate Pass #GP-884")}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left shadow-xs"
            >
              <div className="font-bold text-xs text-slate-800">Scan Escort Pass</div>
              <div className="text-[10px] text-slate-500">Gate Verification</div>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
