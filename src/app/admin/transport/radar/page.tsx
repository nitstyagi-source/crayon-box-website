"use client";

import React, { useState, useEffect } from "react";
import {
  Bus,
  MapPin,
  Navigation,
  Gauge,
  Phone,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Send,
  RefreshCw,
  Clock,
  CheckCircle2,
  Users,
  Compass,
  Radio,
  Zap
} from "lucide-react";
import {
  getFleetLiveTelemetryAction,
  recordStudentBusScanAction
} from "@/app/actions/transport-telematics-actions";

export default function TransportFleetRadarPage() {
  const [fleetData, setFleetData] = useState<any>(null);
  const [selectedBusNumber, setSelectedBusNumber] = useState<string>("BUS-01");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationActive, setSimulationActive] = useState(true);

  // Sample Onboard Students Manifest for active route
  const [manifest, setManifest] = useState([
    { id: "STU-101", name: "Aarav Sharma", class: "Class 1-B", stop: "Sant Nagar Main Market", status: "BOARDED", phone: "+919810081008", time: "07:42 AM" },
    { id: "STU-102", name: "Ananya Verma", class: "Class 3-A", stop: "Burari Chowk", status: "BOARDED", phone: "+919876500112", time: "07:46 AM" },
    { id: "STU-103", name: "Kabir Mehta", class: "Class 5", stop: "Kamalpur Road", status: "WAITING", phone: "+919876500113", time: "ETA 4 min" },
    { id: "STU-104", name: "Riya Kapoor", class: "Class 2-A", stop: "Milan Vihar Stop", status: "WAITING", phone: "+919876500114", time: "ETA 9 min" },
  ]);

  useEffect(() => {
    loadFleet();
    const interval = setInterval(() => {
      loadFleet();
    }, 4000); // 4-second live telemetry refresh
    return () => clearInterval(interval);
  }, []);

  async function loadFleet() {
    try {
      const res = await getFleetLiveTelemetryAction();
      if (res.success) {
        setFleetData(res);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkBoarded(stu: any) {
    setIsProcessing(true);
    try {
      const res = await recordStudentBusScanAction({
        studentQrOrAdmNo: stu.id,
        busNumber: selectedBusNumber,
        stopName: stu.stop,
        scanType: "BOARDING_MORNING"
      });
      if (res.success) {
        setManifest(prev =>
          prev.map(s => s.id === stu.id ? { ...s, status: "BOARDED", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : s)
        );
        alert(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  const activeBus = fleetData?.buses?.find((b: any) => b.bus_number === selectedBusNumber) || fleetData?.buses?.[0] || {
    bus_number: "BUS-01",
    registration_number: "DL-1PA-8821",
    driver_name: "Ramesh Kumar",
    driver_phone: "+919876543201",
    attendant_name: "Sunita Devi",
    route_name: "Route 01 — Burari Main to Sant Nagar",
    current_speed_kmh: 32,
    current_location_name: "Sant Nagar Chowk",
    status: "Running"
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-indigo-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            Live GPS Telematics &amp; 500m Geo-Fencing Radar Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Bus className="w-8 h-8 text-amber-400" />
            Transport Fleet Radar &amp; Bus Tracking
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl">
            Real-time GPS telemetry, animated route progress, 5-minute arrival geo-fence alerts, and 1-tap automated WhatsApp boarding notifications.
          </p>
        </div>

        {/* Live Metrics Header */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/15">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{fleetData?.counts?.activeInTransit || 3} Buses In Transit</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-blue-300/80 font-mono text-[11px]">
              GPS Sync: Realtime (3s)
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Quick Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {fleetData?.buses && fleetData.buses.length > 0 ? (
          fleetData.buses.map((b: any) => (
            <button
              key={b.bus_number}
              onClick={() => setSelectedBusNumber(b.bus_number)}
              className={`p-4 rounded-3xl border text-left transition flex flex-col justify-between space-y-3 ${
                selectedBusNumber === b.bus_number
                  ? "bg-blue-900 text-white border-blue-600 shadow-lg ring-4 ring-blue-500/20"
                  : "bg-white text-stone-900 border-stone-200 hover:border-blue-300 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-black text-sm">{b.bus_number}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  b.status === 'Running'
                    ? selectedBusNumber === b.bus_number ? "bg-emerald-400 text-stone-950 font-black" : "bg-emerald-100 text-emerald-900"
                    : "bg-stone-100 text-stone-600"
                }`}>
                  {b.status}
                </span>
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold truncate">{b.driver_name}</div>
                <div className={`text-[10px] font-mono ${selectedBusNumber === b.bus_number ? "text-blue-200" : "text-stone-400"}`}>
                  {b.current_location_name || "En Route"} • {b.current_speed_kmh || 30} km/h
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="col-span-4 bg-white p-6 rounded-3xl text-center text-xs font-bold text-stone-400">
            Loading Live Fleet Radar...
          </div>
        )}
      </div>

      {/* Main Radar Grid: Live Map Canvas + Bus Manifest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Telematics Radar View */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Telematics Radar Canvas */}
          <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-6 border border-stone-800">
            
            {/* Map Top Overlay Controls */}
            <div className="flex items-center justify-between z-10 relative">
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                  <Navigation className="w-3.5 h-3.5" /> LIVE TELEMETRY RADAR
                </div>
                <h3 className="text-lg font-black">{activeBus.route_name}</h3>
              </div>

              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-stone-400 font-bold">Speed Meter</div>
                  <div className="text-lg font-mono font-black text-emerald-400">
                    {activeBus.current_speed_kmh || 32} <span className="text-xs text-stone-400">km/h</span>
                  </div>
                </div>
                <Gauge className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            {/* Visual Simulated Route Progress Track */}
            <div className="py-8 relative space-y-4">
              <div className="text-xs font-bold text-stone-400 flex items-center justify-between">
                <span>Route Waypoints &amp; 500m Geo-Fencing Arrival Zones</span>
                <span className="text-emerald-400 text-[11px] font-mono font-bold">● Live GPS Ping Received</span>
              </div>

              {/* Progress Line */}
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-700 -translate-y-1/2 z-0" />
                <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-emerald-500 -translate-y-1/2 z-0" />

                {/* Waypoint 1 */}
                <div className="relative z-10 flex flex-col items-center space-y-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </div>
                  <span className="text-[10px] font-bold text-stone-300">Sant Nagar</span>
                  <span className="text-[9px] text-emerald-400 font-mono">Departed</span>
                </div>

                {/* Waypoint 2 (Current Location) */}
                <div className="relative z-10 flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-xs font-black shadow-lg shadow-amber-400/50 animate-bounce">
                    <Bus className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-amber-300">Burari Chowk</span>
                  <span className="text-[9px] text-amber-400 font-mono">At Stop (2 min)</span>
                </div>

                {/* Waypoint 3 */}
                <div className="relative z-10 flex flex-col items-center space-y-1">
                  <div className="w-6 h-6 rounded-full bg-stone-800 border-2 border-stone-600 text-stone-400 flex items-center justify-center text-[10px] font-bold">
                    3
                  </div>
                  <span className="text-[10px] font-bold text-stone-400">Kamalpur</span>
                  <span className="text-[9px] text-stone-500 font-mono">ETA 4 min</span>
                </div>

                {/* Waypoint 4 */}
                <div className="relative z-10 flex flex-col items-center space-y-1">
                  <div className="w-6 h-6 rounded-full bg-stone-800 border-2 border-stone-600 text-stone-400 flex items-center justify-center text-[10px] font-bold">
                    4
                  </div>
                  <span className="text-[10px] font-bold text-stone-400">Milan Vihar</span>
                  <span className="text-[9px] text-stone-500 font-mono">ETA 9 min</span>
                </div>

                {/* School Gate */}
                <div className="relative z-10 flex flex-col items-center space-y-1">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                    🏫
                  </div>
                  <span className="text-[10px] font-bold text-blue-300">School Gate</span>
                  <span className="text-[9px] text-blue-400 font-mono">ETA 15 min</span>
                </div>
              </div>
            </div>

            {/* Driver & Attendant Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-800/80 p-4 rounded-2xl border border-stone-700 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
                  {activeBus.driver_name?.charAt(0) || "D"}
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] text-stone-400 font-bold">Primary Driver</div>
                  <div className="font-black text-white">{activeBus.driver_name}</div>
                  <div className="text-[11px] font-mono text-blue-300 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {activeBus.driver_phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-stone-700 pt-2 sm:pt-0 sm:pl-4">
                <div className="w-10 h-10 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold">
                  {activeBus.attendant_name?.charAt(0) || "A"}
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] text-stone-400 font-bold">Bus Conductor / Attendant</div>
                  <div className="font-black text-white">{activeBus.attendant_name}</div>
                  <div className="text-[11px] font-mono text-purple-300">
                    Capacity: {activeBus.capacity || 32} Seater
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Col: Student Boarding Manifest & WhatsApp Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Live Passenger Manifest
              </h3>
              <p className="text-[11px] text-stone-500">
                Mark student boarding to trigger instant parent WhatsApp notices.
              </p>
            </div>
            <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg">
              {manifest.filter(s => s.status === 'BOARDED').length} / {manifest.length} Onboard
            </span>
          </div>

          {/* Student Roster List */}
          <div className="space-y-3">
            {manifest.map((stu) => (
              <div
                key={stu.id}
                className="p-3.5 rounded-2xl border border-stone-200 hover:border-emerald-300 bg-stone-50/50 flex flex-col space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <strong className="text-stone-900 font-black">{stu.name}</strong>
                    <div className="text-[10px] text-stone-500">{stu.class} • Stop: {stu.stop}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    stu.status === 'BOARDED'
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {stu.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-mono">{stu.time}</span>
                  {stu.status !== 'BOARDED' ? (
                    <button
                      onClick={() => handleMarkBoarded(stu)}
                      disabled={isProcessing}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-xs transition active:scale-95 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" /> Mark Boarded &amp; Alert Parent
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Parent Notified via WhatsApp
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
