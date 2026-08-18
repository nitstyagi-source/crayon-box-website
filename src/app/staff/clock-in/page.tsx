"use client";

import { useState, useEffect } from "react";
import { MapPin, QrCode, Clock, WifiOff, CheckCircle2, ShieldAlert } from "lucide-react";

export default function MobileClockIn() {
  const [gpsStatus, setGpsStatus] = useState<"checking" | "in_zone" | "out_zone">("checking");
  const [isOffline, setIsOffline] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Clock tick
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    // Simulate GPS Verification Delay
    setTimeout(() => {
      setGpsStatus("in_zone");
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const handleScan = () => {
    // Simulate TOTP QR Scan
    setTimeout(() => {
      setCheckedIn(true);
    }, 800);
  };

  const toggleNetwork = () => {
    setIsOffline(!isOffline);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl">
      
      {/* Offline Toast */}
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs font-bold text-center py-2 flex items-center justify-center gap-2 z-50 animate-in slide-in-from-top">
          <WifiOff className="w-3 h-3" /> Offline Mode: Logs will sync automatically
        </div>
      )}

      {/* Header */}
      <header className={`p-6 pb-8 text-center transition-colors duration-500 ${gpsStatus === 'in_zone' ? 'bg-emerald-600/20' : gpsStatus === 'out_zone' ? 'bg-red-600/20' : 'bg-slate-800'}`}>
        <h1 className="text-xl font-bold tracking-tight mb-8 mt-4">Attendance Hub</h1>
        
        {/* Dynamic Pulsing Ring */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-6">
          <div className={`absolute inset-0 rounded-full border-4 ${gpsStatus === 'in_zone' ? 'border-emerald-500' : gpsStatus === 'out_zone' ? 'border-red-500' : 'border-slate-500 border-dashed animate-[spin_4s_linear_infinite]'}`}></div>
          {gpsStatus === 'in_zone' && (
             <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
          )}
          <div className="text-center z-10">
            <p className="text-4xl font-black font-mono tracking-tighter">{currentTime || "00:00"}</p>
            <p className="text-xs uppercase tracking-widest text-slate-400 mt-1">Today</p>
          </div>
        </div>

        {/* GPS Status Message */}
        <div className="flex flex-col items-center gap-2 h-16">
          {gpsStatus === "checking" && <p className="text-sm font-bold text-slate-400 animate-pulse">Acquiring GPS Signal...</p>}
          {gpsStatus === "in_zone" && (
            <>
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold bg-emerald-900/50 px-3 py-1 rounded-full"><MapPin className="w-4 h-4" /> GPS Verified: On Campus</div>
              <p className="text-xs text-slate-400">Accuracy: 8m</p>
            </>
          )}
          {gpsStatus === "out_zone" && (
            <div className="flex items-center gap-1 text-red-400 text-sm font-bold bg-red-900/50 px-3 py-1 rounded-full"><ShieldAlert className="w-4 h-4" /> Outside 100m Geofence</div>
          )}
        </div>
      </header>

      {/* Action Area */}
      <div className="flex-1 bg-white rounded-t-3xl p-6 flex flex-col text-slate-900">
        
        {checkedIn ? (
          <div className="flex flex-col items-center justify-center text-center py-8 animate-in zoom-in">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold">Successfully Checked In</h2>
            <p className="text-slate-500 mt-2 text-sm">Have a great day at work!</p>
          </div>
        ) : (
          <div className="py-4">
            <button 
              onClick={handleScan}
              disabled={gpsStatus !== "in_zone"}
              className="w-full bg-slate-900 text-white font-black text-xl py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 transition-all active:scale-95"
            >
              <QrCode className="w-6 h-6" /> Open Scanner
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">Point your camera at the Reception TOTP QR Code.</p>
          </div>
        )}

        {/* Timeline */}
        <div className="mt-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Clock className="w-4 h-4" /> Today's Timeline</h3>
          <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
            {checkedIn ? (
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 -ml-6 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                <div>
                  <p className="font-bold text-slate-800">Checked In</p>
                  <p className="text-xs text-slate-500">Device ID: iPhone 15 Pro • GPS Logged</p>
                </div>
                <p className="font-bold font-mono text-emerald-600">{currentTime}</p>
              </div>
            ) : (
              <div className="relative flex items-center justify-between opacity-50">
                <div className="absolute left-0 -ml-6 w-4 h-4 rounded-full bg-slate-200 ring-4 ring-white"></div>
                <div>
                  <p className="font-bold text-slate-800">Awaiting Check In</p>
                </div>
                <p className="font-bold font-mono text-slate-400">--:--</p>
              </div>
            )}
          </div>
        </div>

        {/* Dev Debug Toggle */}
        <button onClick={toggleNetwork} className="mt-auto pt-8 text-[10px] text-slate-300 underline text-center w-full">Toggle Offline Network Simulation</button>

      </div>
    </div>
  );
}
