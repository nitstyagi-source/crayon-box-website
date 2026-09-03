"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bus, MapPin, QrCode, Phone, ShieldCheck,
  CheckCircle2, AlertTriangle, Clock, Navigation, Download,
  Radio, Gauge, Users, RefreshCw, Send, Check, X,
  Sparkles, ShieldAlert, ArrowRight, ScanLine, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getFleetLiveTelemetryAction,
  recordStudentBusScanAction,
  getDailyTransportJourneyMusterAction
} from '@/app/actions/transport-telematics-actions';
import GoogleMapsVehicleTracker from '@/components/transport/GoogleMapsVehicleTracker';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';

export default function TransportFleetRadarPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [activeTab, setActiveTab] = useState<'radar' | 'scanner' | 'muster'>('radar');
  const [selectedTrackingBusIndex, setSelectedTrackingBusIndex] = useState<number>(0);
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    totalFleet: 0,
    activeInTransit: 0,
    parkedInCampus: 0,
    inMaintenance: 0,
    totalStudentsTransported: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Scanner State
  const [selectedBus, setSelectedBus] = useState<string>('Bus 01');
  const [selectedStop, setSelectedStop] = useState<string>('Sant Nagar Main Market');
  const [scanType, setScanType] = useState<'BOARDING_MORNING' | 'DROPOFF_EVENING'>('BOARDING_MORNING');
  const [studentCodeInput, setStudentCodeInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Muster Roll State
  const [musterLogs, setMusterLogs] = useState<any[]>([]);
  const [musterFilterBus, setMusterFilterBus] = useState<string>('ALL');

  const fetchTelemetry = async () => {
    setIsLoading(true);
    const [fleetRes, musterRes] = await Promise.all([
      getFleetLiveTelemetryAction(),
      getDailyTransportJourneyMusterAction({ busNumber: musterFilterBus })
    ]);

    if (fleetRes.success) {
      setBuses(fleetRes.buses || []);
      setRoutes(fleetRes.routes || []);
      setCounts(fleetRes.counts || { totalFleet: 0, activeInTransit: 0, parkedInCampus: 0, inMaintenance: 0, totalStudentsTransported: 0 });
    }

    if (musterRes.success) {
      setMusterLogs(musterRes.data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTelemetry();
  }, [musterFilterBus]);

  // Handle QR Boarding Scan
  const handlePerformScan = async (codeToScan?: string) => {
    const targetCode = codeToScan || studentCodeInput;
    if (!targetCode.trim()) return;

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    const res = await recordStudentBusScanAction({
      studentQrOrAdmNo: targetCode,
      busNumber: selectedBus,
      stopName: selectedStop,
      scanType: scanType,
    });

    setIsScanning(false);
    if (res.success) {
      setScanResult(res);
      setStudentCodeInput('');
      fetchTelemetry();
    } else {
      setScanError(res.error || 'Failed to scan student.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Option 6 Sattva-Digital Header Banner */}
      <VastuModuleBanner
        badgeText="Live Fleet GPS Telematics"
        badgeIcon={<Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
        institutionText={isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
        title="Transport Fleet Radar & Boarding QR Scanner"
        titleIcon={<Bus className="w-8 h-8 text-amber-300" />}
        description="Live GPS telemetry tracking, speed monitors, and student bus boarding verification with automated parent notifications."
        actions={
          <Button
            size="sm"
            variant="saffron"
            onClick={fetchTelemetry}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Radar
          </Button>
        }
      />

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs backdrop-blur-xs">
          <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">Total Fleet</span>
          <span className="text-3xl font-black text-stone-900 mt-1 block">{counts.totalFleet}</span>
          <span className="text-[11px] text-stone-500 font-semibold">GPS Registered</span>
        </div>

        <div className="p-4 bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs backdrop-blur-xs">
          <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">Active In-Transit</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            {counts.activeInTransit}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold">On Active Routes</span>
        </div>

        <div className="p-4 bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs backdrop-blur-xs">
          <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">Parked in Campus</span>
          <span className="text-3xl font-black text-amber-600 mt-1 block">{counts.parkedInCampus}</span>
          <span className="text-[11px] text-amber-700 font-bold">Standby Fleet</span>
        </div>

        <div className="p-4 bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs backdrop-blur-xs">
          <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">In Workshop</span>
          <span className="text-3xl font-black text-rose-600 mt-1 block">{counts.inMaintenance}</span>
          <span className="text-[11px] text-rose-700 font-bold">Scheduled Service</span>
        </div>

        <div className="p-4 bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs backdrop-blur-xs">
          <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">Students Transported</span>
          <span className="text-3xl font-black text-sky-700 mt-1 block">{counts.totalStudentsTransported}</span>
          <span className="text-[11px] text-sky-800 font-bold">Daily Commuters</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('radar')}
          className={`px-5 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'radar'
              ? 'bg-[#0B1B30] text-amber-300 font-extrabold shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          Live GPS Fleet Radar ({buses.length})
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-5 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'scanner'
              ? 'bg-[#0B1B30] text-amber-300 font-extrabold shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
          }`}
        >
          <ScanLine className="w-3.5 h-3.5 text-amber-400" />
          Bus Boarding QR Scanner
        </button>

        <button
          onClick={() => setActiveTab('muster')}
          className={`px-5 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'muster'
              ? 'bg-[#0B1B30] text-amber-300 font-extrabold shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          Transport Journey Muster Roll ({musterLogs.length})
        </button>
      </div>

      {/* 🌟 TAB 1: LIVE FLEET GPS RADAR & GOOGLE MAPS INTEGRATION */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          
          {/* DRIVER MOBILE GPS BROADCASTER & LAUNCHER BANNER */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 rounded-3xl border border-indigo-800/80 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                📱
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Driver Mobile GPS Online
                  </span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-amber-400 font-bold text-xs">HTML5 Geolocation Broadcaster</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Driver Smartphone Vehicle Tracking Cockpit
                </h3>
                <p className="text-xs text-slate-300">
                  Drivers can open this cockpit on their phones to broadcast real-time GPS locations directly to Google Maps and parent portals.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href="/staff/driver"
                target="_blank"
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5" /> Launch Driver Mobile App ↗
              </Link>
            </div>
          </div>

          {/* GOOGLE MAPS LIVE VEHICLE TRACKER */}
          <div className="space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-500" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Interactive Google Maps Live Transit Telematics
                </h3>
              </div>

              {/* Active Vehicle Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {buses.map((b, idx) => (
                  <button
                    key={b.id || idx}
                    type="button"
                    onClick={() => setSelectedTrackingBusIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      selectedTrackingBusIndex === idx
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {b.bus_number}
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Google Maps Vehicle Tracker Component */}
            {buses.length > 0 && (
              <GoogleMapsVehicleTracker
                bus={buses[selectedTrackingBusIndex] || buses[0]}
                height="480px"
                interactive={true}
                showControls={true}
                onRefresh={fetchTelemetry}
              />
            )}
          </div>

          {/* FLEET CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.map((bus, idx) => {
              const isSelected = selectedTrackingBusIndex === idx;
              return (
                <div
                  key={bus.id}
                  onClick={() => setSelectedTrackingBusIndex(idx)}
                  className={`bg-white rounded-3xl border shadow-xs overflow-hidden flex flex-col justify-between cursor-pointer transition ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200/80 hover:border-indigo-300'
                  }`}
                >
                  
                  {/* Card Top */}
                  <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        {bus.registration_number}
                      </span>
                      <h3 className="text-lg font-black text-slate-900">{bus.bus_number}</h3>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${
                      bus.telematicsStatus === 'IN_TRANSIT'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : bus.telematicsStatus === 'MAINTENANCE'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        bus.telematicsStatus === 'IN_TRANSIT' ? 'bg-emerald-500 animate-pulse' : bus.telematicsStatus === 'MAINTENANCE' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      {bus.telematicsStatus === 'IN_TRANSIT' ? 'In Transit' : bus.telematicsStatus === 'MAINTENANCE' ? 'Workshop' : 'Parked'}
                    </span>
                  </div>

                  {/* Route & Location */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Route</span>
                      <strong className="text-slate-900 block truncate">{bus.route_name || 'Route R-05 — Burari & Sant Nagar'}</strong>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-bold truncate text-[11px]">{bus.current_location_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-900 font-mono font-bold text-xs bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        <Gauge className="w-3 h-3 text-indigo-600" />
                        <span>{bus.speed_kmh} km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* Driver & Attendant */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Driver</span>
                      <strong className="text-slate-900 text-xs block truncate">{bus.driver_name}</strong>
                      <a href={`tel:${bus.driver_phone}`} className="text-[10px] font-mono font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5" />
                        {bus.driver_phone}
                      </a>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Attendant</span>
                      <strong className="text-slate-900 text-xs block truncate">{bus.attendant_name}</strong>
                      <span className="text-[10px] font-mono text-slate-500 block truncate mt-0.5">{bus.attendant_phone}</span>
                    </div>
                  </div>

                  {/* Capacity Meter */}
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Onboard Capacity</span>
                      <span className="text-slate-900">{bus.onboard_count || 18} / {bus.capacity} Seats</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${Math.min(100, ((bus.onboard_count || 18) / bus.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Bottom GPS Telematics Bar */}
                <div className="p-3 bg-slate-950 text-slate-300 font-mono text-[10px] flex items-center justify-between border-t border-slate-800">
                  <span>GPS: {bus.current_lat}° N, {bus.current_lng}° E</span>
                  <span className="text-slate-400">{bus.gps_device_id || 'GPS-TK103'}</span>
                </div>

              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* 🌟 TAB 2: CONDUCTOR BUS BOARDING QR SCANNER */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Scanner Controls Card */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <span className="bg-amber-50 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-amber-200">
                Conductor Terminal
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Student Bus Boarding & Drop QR Scanner
              </h3>
              <p className="text-xs text-slate-500">
                Scan physical Student PVC ID card QR codes as children board or disembark at each bus stop.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Bus Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Bus Vehicle</label>
                <select
                  value={selectedBus}
                  onChange={(e) => setSelectedBus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                >
                  <option value="Bus 01">Bus 01 (DL-1VA-8921 • Burari Route)</option>
                  <option value="Bus 02">Bus 02 (DL-1VA-8922 • Rohini Route)</option>
                  <option value="Bus 03">Bus 03 (DL-1VA-8923 • Model Town Route)</option>
                </select>
              </div>

              {/* Stop Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Bus Stop Point</label>
                <select
                  value={selectedStop}
                  onChange={(e) => setSelectedStop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900"
                >
                  <option value="Sant Nagar Main Market">Sant Nagar Main Market (07:45 AM)</option>
                  <option value="Burari Chowk">Burari Chowk (07:55 AM)</option>
                  <option value="Nathupura Bus Stand">Nathupura Bus Stand (08:05 AM)</option>
                  <option value="School Main Gate">School Main Gate Campus Drop (08:20 AM)</option>
                </select>
              </div>

              {/* Scan Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScanType('BOARDING_MORNING')}
                  className={`p-3 rounded-xl border font-bold text-xs transition flex flex-col items-center gap-1 ${
                    scanType === 'BOARDING_MORNING'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>☀️ Morning Pickup</span>
                  <span className="text-[10px] font-normal opacity-80">Record Boarding</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScanType('DROPOFF_EVENING')}
                  className={`p-3 rounded-xl border font-bold text-xs transition flex flex-col items-center gap-1 ${
                    scanType === 'DROPOFF_EVENING'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>🌙 Evening Return</span>
                  <span className="text-[10px] font-normal opacity-80">Record Drop-Off</span>
                </button>
              </div>

              {/* Input & Scan Button */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 block">Scan Barcode / Enter Student Code</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={studentCodeInput}
                    onChange={(e) => setStudentCodeInput(e.target.value)}
                    placeholder="e.g. VET:STU:CBS-2026-0001"
                    onKeyDown={(e) => e.key === 'Enter' && handlePerformScan()}
                  />
                  <Button
                    variant="primary"
                    onClick={() => handlePerformScan()}
                    isLoading={isScanning}
                    className="bg-indigo-600 hover:bg-indigo-500 px-5"
                  >
                    Scan
                  </Button>
                </div>
              </div>

              {/* 1-Click Quick Simulators */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  ⚡ 1-Click Student Test Simulator
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePerformScan('CBS-2026-0001')}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-[11px] font-bold text-slate-800 text-left transition"
                  >
                    Rohan Verma (CBS-0001)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePerformScan('AS-2026-0143')}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-[11px] font-bold text-slate-800 text-left transition"
                  >
                    Myra Iyer (AS-0143)
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Scanner Feedback Display */}
          <div className="lg:col-span-7 space-y-4">
            {scanError && (
              <div className="p-4 bg-rose-50 text-rose-950 border border-rose-200 rounded-3xl flex items-center justify-between text-xs font-bold animate-in fade-in">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{scanError}</span>
                </div>
                <button onClick={() => setScanError(null)} className="text-rose-700 font-bold">✕</button>
              </div>
            )}

            {scanResult ? (
              <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
                        {scanType === 'BOARDING_MORNING' ? '✓ Student Safely Boarded' : '✓ Student Safely Dropped'}
                      </span>
                      <h3 className="text-xl font-black text-slate-900">{scanResult.student.name}</h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs font-mono">
                    {scanResult.student.admissionNo}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Assigned Class</span>
                    <strong className="text-slate-900">{scanResult.student.className}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Bus Vehicle</span>
                    <strong className="text-slate-900">{selectedBus}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Stop Location</span>
                    <strong className="text-slate-900">{scanResult.student.stopName}</strong>
                  </div>
                </div>

                {/* Instant SMS Dispatch Card */}
                <div className="p-4 bg-indigo-950 text-indigo-200 rounded-2xl border border-indigo-800 space-y-1.5 text-xs font-sans">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-[11px]">
                    <Smartphone className="w-4 h-4" />
                    <span>Automated MSG91 Parent SMS Dispatch Simulated:</span>
                  </div>
                  <p className="text-white font-medium italic">
                    {scanResult.smsAlert}
                  </p>
                </div>

              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-3">
                <ScanLine className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-extrabold text-slate-600 text-sm">Ready to Scan Passenger QR Codes</h4>
                <p className="text-xs max-w-sm mx-auto">
                  Point the barcode scanner at the student's ID card or click one of the quick test simulator buttons.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 🌟 TAB 3: PASSENGER JOURNEY MUSTER ROLL */}
      {activeTab === 'muster' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Today's Passenger Journey Muster Roll ({musterLogs.length})</h3>
              <p className="text-xs text-slate-400">Chronological audit log of all morning boarding and evening drop-offs.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={musterFilterBus}
                onChange={(e) => setMusterFilterBus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
              >
                <option value="ALL">All Fleet Vehicles</option>
                <option value="Bus 01">Bus 01</option>
                <option value="Bus 02">Bus 02</option>
                <option value="Bus 03">Bus 03</option>
              </select>
            </div>
          </div>

          {musterLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <Bus className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-600">No boarding scans recorded for today.</p>
              <p>Use the Conductor QR Scanner tab to scan students onto buses.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="py-3 px-4">Student & Admission No</th>
                    <th className="py-3 px-4">Bus Vehicle</th>
                    <th className="py-3 px-4">Stop Name</th>
                    <th className="py-3 px-4">Shift & Timestamp</th>
                    <th className="py-3 px-4">Escort Handover</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {musterLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 block font-bold">{log.student_name}</strong>
                        <span className="text-[10px] font-mono text-indigo-600 font-bold">{log.admission_no || log.universal_id}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {log.bus_number}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {log.stop_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-900 font-bold block">{log.shift}</span>
                        <span className="text-[10px] font-mono text-slate-500">{log.boarded_at || log.dropped_at || '07:45 AM'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        {log.escort_name || 'Self Boarding'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          log.status === 'BOARDED' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          ✓ {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
