"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bus, Navigation, MapPin, Gauge, Phone, Radio,
  ShieldCheck, AlertTriangle, CheckCircle2, Clock,
  Smartphone, Zap, ScanLine, Play, Square, RefreshCw,
  Compass, ArrowRight, ShieldAlert, Volume2, Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  updateDriverPhoneLocationAction,
  recordStudentBusScanAction,
  getBusLiveTrackingDetailsAction
} from "@/app/actions/transport-telematics-actions";

export default function DriverMobileCockpitPage() {
  const [selectedBus, setSelectedBus] = useState<string>("Bus 01");
  const [driverName, setDriverName] = useState<string>("Amit Singh");
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Live Telemetry from Phone GPS
  const [currentLat, setCurrentLat] = useState<number>(28.7214);
  const [currentLng, setCurrentLng] = useState<number>(77.2012);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [currentHeading, setCurrentHeading] = useState<number>(45);
  const [accuracy, setAccuracy] = useState<number>(5);
  const [locationLabel, setLocationLabel] = useState<string>("Sant Nagar Main Road");
  const [lastPingTime, setLastPingTime] = useState<string>("");
  const [pingCount, setPingCount] = useState<number>(0);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Active Route & Stops
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0);
  const [boardedCount, setBoardedCount] = useState<number>(18);
  const [capacity, setCapacity] = useState<number>(32);

  // Scanner State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [studentInput, setStudentInput] = useState<string>("");
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const STOPS = [
    { name: "Burari Chowk (Pillar 42)", time: "07:20 AM", lat: 28.7250, lng: 77.2050 },
    { name: "Sant Nagar Main Market", time: "07:30 AM", lat: 28.7214, lng: 77.2012 },
    { name: "Nathupura Bus Stand", time: "07:40 AM", lat: 28.7300, lng: 77.1950 },
    { name: "School Campus Main Gate", time: "07:55 AM", lat: 28.7185, lng: 77.1995 }
  ];

  // Request WakeLock to prevent screen sleep while driving
  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      }
    } catch (e) {
      console.warn("WakeLock not available:", e);
    }
  };

  // Transmit location to server
  const sendLocationUpdate = async (lat: number, lng: number, speed: number, heading: number, acc: number) => {
    try {
      const res = await updateDriverPhoneLocationAction({
        busNumber: selectedBus,
        driverName,
        lat,
        lng,
        speedKmh: speed,
        heading,
        accuracyMeters: acc,
        status: isBroadcasting ? "Running" : "Active"
      });

      if (res.success) {
        setLastPingTime(new Date().toLocaleTimeString("en-IN"));
        setPingCount((prev) => prev + 1);
        setGpsError(null);
        if (res.telemetry?.locationName) {
          setLocationLabel(res.telemetry.locationName);
        }
      }
    } catch (err: any) {
      console.error("GPS Broadcast Error:", err);
    }
  };

  // Start Live Phone GPS Tracking
  const startLiveBroadcasting = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your mobile browser.");
      return;
    }

    setIsBroadcasting(true);
    requestWakeLock();

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const speedKmh = pos.coords.speed !== null ? Math.round(pos.coords.speed * 3.6) : (currentSpeed > 0 ? currentSpeed : 28);
        const head = pos.coords.heading || currentHeading;
        const acc = Math.round(pos.coords.accuracy || 5);

        setCurrentLat(lat);
        setCurrentLng(lng);
        setCurrentSpeed(speedKmh);
        setCurrentHeading(head);
        setAccuracy(acc);

        sendLocationUpdate(lat, lng, speedKmh, head, acc);
      },
      (err) => {
        console.warn("Phone GPS Warning, falling back to network position:", err.message);
        setGpsError(`Phone GPS: ${err.message}. Running in active transit mode.`);
        // Fallback send initial coordinate
        sendLocationUpdate(currentLat, currentLng, 32, 45, 10);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Stop Live Phone GPS Tracking
  const stopLiveBroadcasting = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setIsBroadcasting(false);
    setIsSimulating(false);
    setCurrentSpeed(0);

    // Update status to stopped
    updateDriverPhoneLocationAction({
      busNumber: selectedBus,
      driverName,
      lat: currentLat,
      lng: currentLng,
      speedKmh: 0,
      status: "Active"
    });
  };

  // Simulated GPS Movement (for testing without driving)
  const toggleSimulator = () => {
    if (isSimulating) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
      setIsSimulating(false);
      setCurrentSpeed(0);
    } else {
      setIsSimulating(true);
      setIsBroadcasting(true);
      let step = 0;
      simIntervalRef.current = setInterval(() => {
        step = (step + 1) % 20;
        const latOffset = (Math.sin(step * 0.3) * 0.005);
        const lngOffset = (Math.cos(step * 0.3) * 0.005);
        const newLat = 28.7214 + latOffset;
        const newLng = 77.2012 + lngOffset;
        const speed = Math.round(25 + Math.sin(step) * 10);

        setCurrentLat(newLat);
        setCurrentLng(newLng);
        setCurrentSpeed(speed);

        sendLocationUpdate(newLat, newLng, speed, 60, 4);
      }, 3000);
    }
  };

  // Handle Student QR Scan from driver phone
  const handleDriverScan = async (code: string) => {
    if (!code.trim()) return;
    setIsScanning(true);
    setScanMessage(null);

    const res = await recordStudentBusScanAction({
      studentQrOrAdmNo: code,
      busNumber: selectedBus,
      stopName: STOPS[currentStopIndex]?.name || "Sant Nagar Main Market",
      scanType: "BOARDING_MORNING"
    });

    setIsScanning(false);
    if (res.success) {
      setScanMessage(res.message || "✓ Student Safely Boarded!");
      setBoardedCount((prev) => Math.min(capacity, prev + 1));
      setStudentInput("");
    } else {
      setScanMessage(`Error: ${res.error || 'Failed to scan student'}`);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {});
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 sm:p-6 pb-24 max-w-xl mx-auto space-y-5">
      
      {/* 📱 TOP DRIVER COCKPIT HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
            🚌
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
              Driver Mobile Cockpit
            </span>
            <h1 className="text-lg font-black text-white leading-tight">{selectedBus} — GPS Broadcaster</h1>
            <p className="text-xs text-slate-400">Driver: <strong>{driverName}</strong></p>
          </div>
        </div>

        <Link
          href="/admin/transport"
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
        >
          Fleet Radar ↗
        </Link>
      </div>

      {/* 🌟 1-TAP GPS BROADCAST CONTROL PANEL */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-2xl space-y-5 ${
        isBroadcasting 
          ? "bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/50 ring-2 ring-emerald-500/20" 
          : "bg-slate-900/90 border-slate-800"
      }`}>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              isBroadcasting ? "bg-emerald-500 animate-ping" : "bg-slate-600"
            }`} />
            <strong className="text-sm uppercase tracking-wider font-mono font-black">
              {isBroadcasting ? "🟢 GPS Broadcasting Live" : "⚪ GPS Idle / Parked"}
            </strong>
          </div>

          <span className="text-[10px] font-mono text-slate-400">
            {pingCount > 0 ? `${pingCount} Pings Sent` : "Ready to Start"}
          </span>
        </div>

        {/* Big Speedometer Display */}
        <div className="grid grid-cols-2 gap-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Live Vehicle Speed</span>
            <div className="text-4xl font-black text-amber-400 font-mono mt-1 flex items-center justify-center gap-1">
              <span>{currentSpeed}</span>
              <span className="text-sm font-normal text-slate-400">km/h</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Speedometer</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">GPS Accuracy</span>
            <div className="text-4xl font-black text-emerald-400 font-mono mt-1 flex items-center justify-center gap-1">
              <span>±{accuracy}</span>
              <span className="text-sm font-normal text-slate-400">m</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
              {lastPingTime ? `Last: ${lastPingTime}` : "No Signal"}
            </span>
          </div>
        </div>

        {/* GPS Coordinates & Location Name */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between text-slate-300 font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{locationLabel}</span>
          </div>
          <span className="text-slate-500 shrink-0 text-[10px]">
            {currentLat.toFixed(4)}°, {currentLng.toFixed(4)}°
          </span>
        </div>

        {/* START / STOP BUTTON */}
        {!isBroadcasting ? (
          <button
            type="button"
            onClick={startLiveBroadcasting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-950 transition active:scale-95"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            Start Transit Trip &amp; Broadcast GPS
          </button>
        ) : (
          <button
            type="button"
            onClick={stopLiveBroadcasting}
            className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-950 transition active:scale-95"
          >
            <Square className="w-5 h-5 fill-white" />
            Stop Transit Trip / End Shift
          </button>
        )}

        {/* Simulator Toggle for Demo */}
        <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px]">Testing on desktop / no vehicle?</span>
          <button
            type="button"
            onClick={toggleSimulator}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition ${
              isSimulating 
                ? "bg-amber-500 text-slate-950 border-amber-400" 
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            {isSimulating ? "⚡ Stop GPS Simulator" : "⚡ Run Live GPS Simulator"}
          </button>
        </div>

        {gpsError && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}

      </div>

      {/* 📍 CURRENT & NEXT BUS STOP CAROUSEL */}
      <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Current Bus Stop Milestone
          </span>
          <span className="text-xs font-mono font-bold text-indigo-400">
            Stop {currentStopIndex + 1} of {STOPS.length}
          </span>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-emerald-400 font-bold uppercase block">Approaching Stop:</span>
          <h3 className="text-base font-black text-white">{STOPS[currentStopIndex]?.name}</h3>
          <p className="text-xs text-slate-400 font-mono">Scheduled: {STOPS[currentStopIndex]?.time}</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentStopIndex((prev) => Math.min(STOPS.length - 1, prev + 1))}
            disabled={currentStopIndex === STOPS.length - 1}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4" /> Reached Stop &bull; Next Stop ➔
          </button>
        </div>
      </div>

      {/* 🪪 CONDUCTOR STUDENT BOARDING QR SCANNER */}
      <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Student Boarding Scanner
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            {boardedCount} / {capacity} Onboard
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Scan Student ID QR or enter CBS-0001"
            value={studentInput}
            onChange={(e) => setStudentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDriverScan(studentInput)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={() => handleDriverScan(studentInput)}
            disabled={isScanning}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition"
          >
            Scan
          </button>
        </div>

        {/* 1-Tap Quick Passenger Buttons */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleDriverScan("CBS-2026-0001")}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left font-bold text-[11px] text-slate-300"
          >
            + Rohan Verma (CBS-0001)
          </button>
          <button
            type="button"
            onClick={() => handleDriverScan("AS-2026-0143")}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left font-bold text-[11px] text-slate-300"
          >
            + Myra Iyer (AS-0143)
          </button>
        </div>

        {scanMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{scanMessage}</span>
          </div>
        )}
      </div>

    </div>
  );
}
