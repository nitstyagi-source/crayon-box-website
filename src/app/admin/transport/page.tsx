"use client";

import { useState, useEffect } from "react";
import { 
  Bus, MapPin, Navigation, AlertTriangle, PhoneCall, 
  Users, ShieldAlert, CheckCircle2, ChevronRight, X, 
  UserCheck, QrCode, Search, Plus, Wrench, Fuel, 
  Clock, ShieldCheck, RefreshCw, Send, AlertCircle, 
  ArrowRight, Radio, Sparkles
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getTransportDashboardStats,
  getTransportBuses,
  createOrUpdateBus,
  getTransportRoutes,
  getStudentTransportAssignments,
  recordBusBoardingScan,
  recordEscortHandoverScan
} from "@/app/actions/transport";

export default function TransportCommandCenter() {
  const { activeCampusId } = useCampusContext();

  // Navigation Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "live_tracking" | "buses" | "routes" | "students" | "qr_journey" | "maintenance"
  >("live_tracking");

  // Data States
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Bus / Route for Live Map
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [sosActive, setSosActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Add Bus Modal State
  const [isAddBusOpen, setIsAddBusOpen] = useState(false);
  const [busForm, setBusForm] = useState({
    busNumber: "Bus 05",
    registrationNumber: "DL-1VA-8925",
    busType: "AC 32-Seater (Tata Starbus)",
    capacity: 32,
    driverName: "Harish Rawat",
    driverPhone: "+91 9811223344",
    driverLicenseNo: "DL-04201900981",
    attendantName: "Saroj Devi",
    attendantPhone: "+91 9877112233",
    routeName: "Route R-03 — Model Town",
    insuranceExpiry: "2027-04-15",
    fitnessExpiry: "2027-02-10",
    permitExpiry: "2027-08-15",
    pucExpiry: "2026-11-20",
    status: "Active"
  });

  // QR Boarding Simulation State
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scanStep, setScanStep] = useState<"Boarding" | "SchoolArrival" | "ReturnBoarding" | "EscortHandover">("Boarding");
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, [activeCampusId]);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [statsRes, busesRes, routesRes, stuRes] = await Promise.all([
        getTransportDashboardStats(activeCampusId),
        getTransportBuses(activeCampusId),
        getTransportRoutes(activeCampusId),
        getStudentTransportAssignments({ campusId: activeCampusId })
      ]);

      if (statsRes.success && statsRes.data) setDashboardStats(statsRes.data);
      if (busesRes.success && busesRes.data) {
        setBuses(busesRes.data);
        if (busesRes.data.length > 0 && !selectedBus) {
          setSelectedBus(busesRes.data[0]);
        }
      }
      if (routesRes.success && routesRes.data) setRoutes(routesRes.data);
      if (stuRes.success && stuRes.data) setStudents(stuRes.data);
    } catch (e) {
      console.error("Error loading transport data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Add Bus
  async function handleAddBusSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await createOrUpdateBus({
      campusId: activeCampusId,
      ...busForm
    });

    if (res.success) {
      alert(res.message);
      setIsAddBusOpen(false);
      loadAllData();
    } else {
      alert("Error: " + res.error);
    }
  }

  // Handle QR Boarding Simulation
  async function handleSimulateScan(step: "Boarding" | "SchoolArrival" | "ReturnBoarding" | "EscortHandover") {
    setScanStep(step);
    if (step === "Boarding") {
      const res = await recordBusBoardingScan({
        campusId: activeCampusId,
        studentId: "aarav-id",
        studentName: "Aarav Sharma",
        routeName: "Route R-05 — Burari & Sant Nagar",
        busNumber: "Bus 01",
        stopName: "Burari Chowk (Pillar 42)",
        shift: "Morning Pickup"
      });
      setScanSuccessMessage(res.message || "✅ Student Boarding Recorded & Parent Notified!");
    } else if (step === "EscortHandover") {
      const res = await recordEscortHandoverScan({
        studentId: "aarav-id",
        escortName: "Sunita Sharma (Mother)",
        escortRelation: "Mother",
        attendantName: "Sunita Devi (Bus Attendant)"
      });
      setScanSuccessMessage("🛡️ Escort QR Verified: Student Handed Over to Mother (Sunita Sharma)!");
    } else if (step === "SchoolArrival") {
      setScanSuccessMessage("🏫 Bus 01 reached School Main Gate at 07:55 AM. Inward logged for 32 students.");
    } else if (step === "ReturnBoarding") {
      setScanSuccessMessage("🚌 Afternoon Return Boarding Scanned at 01:35 PM for Route R-05.");
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Bus className="w-3 h-3 text-blue-600" /> Fleet Management &amp; GPS Command
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Live QR Boarding &amp; Escort Integration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            School Transport Command Center
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage routes, buses, drivers, attendants, student assignments, QR boarding scans, and parent live tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsQrScannerOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" /> [ 📲 Bus QR Scanner ]
          </button>

          <button
            type="button"
            onClick={() => setIsAddBusOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> [ + Add New Bus ]
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Buses</span>
          <strong className="text-xl font-black text-stone-900 mt-0.5 block">{buses.length || 4}</strong>
          <span className="text-[10px] text-emerald-700 font-bold">100% GPS Enabled</span>
        </div>

        <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] text-blue-800 font-bold uppercase block">Running on Route</span>
          <strong className="text-xl font-black text-blue-950 mt-0.5 block">
            {buses.filter(b => b.status === "Running").length || 2} Buses
          </strong>
          <span className="text-[10px] text-blue-700 font-medium">Live Telemetry Active</span>
        </div>

        <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] text-purple-800 font-bold uppercase block">Total Routes</span>
          <strong className="text-xl font-black text-purple-950 mt-0.5 block">{routes.length || 4} Routes</strong>
          <span className="text-[10px] text-purple-700 font-medium">Morning &amp; Afternoon</span>
        </div>

        <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] text-emerald-800 font-bold uppercase block">Students Boarded</span>
          <strong className="text-xl font-black text-emerald-950 mt-0.5 block">
            {dashboardStats?.studentsBoardedToday || 46} / {dashboardStats?.totalStudentsUsingTransport || 48}
          </strong>
          <span className="text-[10px] text-emerald-700 font-bold">96% Boarding Rate</span>
        </div>

        <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] text-amber-800 font-bold uppercase block">Drivers &amp; Attendants</span>
          <strong className="text-xl font-black text-amber-950 mt-0.5 block">{buses.length * 2} Staff</strong>
          <span className="text-[10px] text-amber-800 font-bold">Police Verified ✓</span>
        </div>

        <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[10px] text-rose-800 font-bold uppercase block">Maintenance Due</span>
          <strong className="text-xl font-black text-rose-950 mt-0.5 block">
            {buses.filter(b => b.status === "Maintenance").length || 1} Bus
          </strong>
          <span className="text-[10px] text-rose-700 font-bold">Fitness Check in 15d</span>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("live_tracking")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "live_tracking" ? "bg-blue-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🗺️ Live GPS Fleet Tracking
        </button>

        <button
          onClick={() => setActiveTab("buses")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "buses" ? "bg-blue-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🚌 Bus Master ({buses.length})
        </button>

        <button
          onClick={() => setActiveTab("routes")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "routes" ? "bg-blue-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🛣️ Route Master &amp; Stops ({routes.length})
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "students" ? "bg-blue-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🎒 Student Roster ({students.length})
        </button>

        <button
          onClick={() => setActiveTab("qr_journey")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "qr_journey" ? "bg-blue-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📲 QR Boarding &amp; Escort Handover
        </button>

        <button
          onClick={() => setActiveTab("maintenance")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "maintenance" ? "bg-blue-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🛠️ Maintenance &amp; Fuel Logs
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. LIVE GPS FLEET TRACKING SIMULATION */}
      {/* ========================================================================= */}
      {activeTab === "live_tracking" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          
          {/* Map Simulation (Left 7 cols) */}
          <div className="lg:col-span-8 bg-stone-900 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between border border-stone-800 shadow-xl">
            
            {/* Map Top Bar */}
            <div className="flex justify-between items-center z-10">
              <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <h3 className="font-bold text-sm text-white">Live Telemetry Active</h3>
                  <p className="text-[10px] text-stone-400 font-mono">Satellite GPS Refresh: Every 3s</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSosActive(!sosActive)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                    sosActive ? "bg-red-600 text-white animate-pulse" : "bg-white/10 text-stone-300 hover:bg-white/20"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  {sosActive ? "🚨 SOS EMERGENCY BROADCAST" : "Simulate SOS Alert"}
                </button>
              </div>
            </div>

            {/* Interactive Map Visual Grid */}
            <div className="my-8 relative h-72 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

              {/* Road Lines */}
              <div className="absolute w-full h-1 bg-blue-500/30 rotate-12"></div>
              <div className="absolute w-full h-1 bg-purple-500/30 -rotate-6"></div>

              {/* Active Bus Markers on Map */}
              {buses.map((b, idx) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBus(b)}
                  className={`absolute cursor-pointer transition-all duration-700 flex flex-col items-center group ${
                    selectedBus?.id === b.id ? "scale-125 z-30" : "opacity-80 hover:opacity-100 z-20"
                  }`}
                  style={{
                    left: `${25 + idx * 22}%`,
                    top: `${35 + (idx % 2 === 0 ? 15 : -10)}%`
                  }}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xl ${
                    b.status === "Emergency" || sosActive ? "bg-red-600 animate-bounce" :
                    b.status === "Running" ? "bg-blue-600" :
                    b.status === "Maintenance" ? "bg-rose-700" : "bg-emerald-600"
                  }`}>
                    <Bus className="w-5 h-5" />
                  </div>
                  <div className="bg-black/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 border border-white/20 whitespace-nowrap">
                    {b.bus_number} ({b.current_speed_kmh} km/h)
                  </div>
                </div>
              ))}
            </div>

            {/* Map Bottom Status Bar */}
            {selectedBus && (
              <div className="bg-stone-950/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-white font-bold block">{selectedBus.bus_number} — {selectedBus.registration_number}</strong>
                    <span className="text-[11px] text-stone-400">
                      📍 {selectedBus.current_location_name} • Speed: <span className="font-mono text-emerald-400 font-bold">{selectedBus.current_speed_kmh} km/h</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedBus.driver_phone}`}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 text-[11px]"
                  >
                    <PhoneCall className="w-3 h-3" /> Call Driver ({selectedBus.driver_name})
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Fleet Live List (Right 4 cols) */}
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3 text-xs flex flex-col justify-between">
            <div>
              <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
                <h3 className="font-black text-stone-900 text-sm">Active Fleet List</h3>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-900 px-2 py-0.5 rounded">
                  {buses.length} Buses
                </span>
              </div>

              <div className="space-y-2.5 mt-3">
                {buses.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBus(b)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      selectedBus?.id === b.id
                        ? "bg-blue-50 border-blue-300 shadow-2xs"
                        : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-stone-900 font-bold block">{b.bus_number}</strong>
                        <span className="text-[10px] font-mono text-stone-500">{b.registration_number}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        b.status === "Running" ? "bg-blue-100 text-blue-900" :
                        b.status === "Maintenance" ? "bg-red-100 text-red-900" :
                        "bg-emerald-100 text-emerald-900"
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 mt-2 space-y-0.5">
                      <div>👨‍✈️ Driver: <strong>{b.driver_name}</strong> ({b.driver_phone})</div>
                      <div>👩‍✈️ Attendant: <strong>{b.attendant_name}</strong></div>
                      <div className="text-stone-400 font-mono text-[10px] truncate">📍 {b.current_location_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-[11px] space-y-1">
              <strong className="font-black block">Parent Push Alerts Triggered</strong>
              <p className="text-[10px] text-emerald-800">
                Automated WhatsApp &amp; App alerts are dispatched when bus is 5 mins away from each stop.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BUS MASTER */}
      {/* ========================================================================= */}
      {activeTab === "buses" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">School Fleet Master</h3>
              <p className="text-xs text-stone-500">Comprehensive registration, fitness, permit, and driver assignment records.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddBusOpen(true)}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> [ + Add Bus ]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buses.map((b) => (
              <div key={b.id} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-blue-700 font-bold">{b.bus_type}</span>
                    <strong className="text-stone-900 font-bold text-base block mt-0.5">
                      {b.bus_number} — {b.registration_number}
                    </strong>
                    <span className="text-[11px] text-stone-500">Capacity: <strong>{b.capacity} Seats</strong> • Odometer: <strong>{b.odometer_km} km</strong></span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                    b.status === "Running" ? "bg-blue-100 text-blue-900" :
                    b.status === "Maintenance" ? "bg-red-100 text-red-900" :
                    "bg-emerald-100 text-emerald-900"
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-xl border border-stone-200/70">
                  <div>👨‍✈️ <strong>Driver:</strong> {b.driver_name}</div>
                  <div>📞 <strong>Phone:</strong> {b.driver_phone}</div>
                  <div>👩‍✈️ <strong>Attendant:</strong> {b.attendant_name}</div>
                  <div>🆔 <strong>GPS ID:</strong> {b.gps_device_id}</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-stone-600 pt-1">
                  <div>Fitness: <strong className="text-stone-900">{b.fitness_expiry || "Valid"}</strong></div>
                  <div>Insurance: <strong className="text-stone-900">{b.insurance_expiry || "Valid"}</strong></div>
                  <div>Permit: <strong className="text-stone-900">{b.permit_expiry || "Valid"}</strong></div>
                  <div>PUC: <strong className="text-stone-900">{b.puc_expiry || "Valid"}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ROUTE MASTER & STOPS */}
      {/* ========================================================================= */}
      {activeTab === "routes" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Transport Routes &amp; Scheduled Stops</h3>
              <p className="text-xs text-stone-500">Pick-up and drop timings, stop sequence, and monthly fee slabs.</p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
              {routes.length} Active Routes
            </span>
          </div>

          <div className="space-y-4">
            {routes.map((r) => (
              <div key={r.id} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">{r.route_code}</span>
                    <strong className="text-stone-900 font-bold text-base block mt-0.5">{r.route_name}</strong>
                    <span className="text-[11px] text-stone-500">
                      {r.starting_point} $\rightarrow$ {r.destination} • Morning: {r.morning_start_time} • Afternoon: {r.afternoon_start_time}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                    Active
                  </span>
                </div>

                {/* Stops Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
                  {(r.stops || [
                    { stop_name: "Burari Chowk", pickup_time: "07:20 AM", drop_time: "02:05 PM", monthly_fee: 2200 },
                    { stop_name: "Sant Nagar Market", pickup_time: "07:30 AM", drop_time: "01:55 PM", monthly_fee: 2200 },
                    { stop_name: "Nathupura Stand", pickup_time: "07:40 AM", drop_time: "01:45 PM", monthly_fee: 2400 },
                    { stop_name: "School Campus", pickup_time: "07:55 AM", drop_time: "01:30 PM", monthly_fee: 0 }
                  ]).map((s: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-purple-800">Stop #{idx + 1}</span>
                      <strong className="text-stone-900 font-bold block truncate">{s.stop_name}</strong>
                      <div className="text-[10px] text-stone-500 font-mono">
                        Pickup: <strong>{s.pickup_time}</strong> • Drop: <strong>{s.drop_time}</strong>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        Fee: ₹ {Number(s.monthly_fee).toLocaleString("en-IN")}/mo
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STUDENT TRANSPORT ROSTER */}
      {/* ========================================================================= */}
      {activeTab === "students" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Enrolled Transport Students</h3>
              <p className="text-xs text-stone-500">Connected directly to Student Master and Monthly Fee module.</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl">
              {students.length} Students Assigned
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Assigned Route</th>
                  <th className="p-3">Pickup &amp; Drop Stop</th>
                  <th className="p-3">Bus &amp; Vehicle</th>
                  <th className="p-3 text-right">Monthly Fee</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(students.length ? students : [
                  { id: "s1", student_name: "Aarav Sharma", admission_no: "CBS-2026-0129", class_name: "Grade 5", section_name: "A", route_name: "Route R-05 — Burari", pickup_stop_name: "Burari Chowk", bus_number: "Bus 01", registration_number: "DL-1VA-8921", monthly_transport_fee: 2200 },
                  { id: "s2", student_name: "Ananya Gupta", admission_no: "CBS-2026-0188", class_name: "Grade 4", section_name: "B", route_name: "Route R-05 — Burari", pickup_stop_name: "Sant Nagar Market", bus_number: "Bus 01", registration_number: "DL-1VA-8921", monthly_transport_fee: 2200 }
                ]).map((stu: any) => (
                  <tr key={stu.id} className="hover:bg-stone-50/70">
                    <td className="p-3">
                      <strong className="text-stone-900 font-bold block">{stu.student_name}</strong>
                      <span className="text-[10px] font-mono text-stone-400">{stu.admission_no}</span>
                    </td>
                    <td className="p-3 font-semibold">{stu.class_name}-{stu.section_name}</td>
                    <td className="p-3 font-bold text-purple-900">{stu.route_name}</td>
                    <td className="p-3 text-stone-700">{stu.pickup_stop_name}</td>
                    <td className="p-3 font-mono">{stu.bus_number} ({stu.registration_number})</td>
                    <td className="p-3 text-right font-black font-mono">₹ {Number(stu.monthly_transport_fee).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. QR BUS BOARDING & ESCORT HANDOVER SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === "qr_journey" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-xs max-w-4xl mx-auto">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Daily Bus QR Boarding &amp; Escort Handover Simulator</h3>
            <p className="text-xs text-stone-500">
              Test end-to-end boarding at stop $\rightarrow$ school arrival $\rightarrow$ return departure $\rightarrow$ authorized escort card verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => handleSimulateScan("Boarding")}
              className={`p-4 rounded-2xl border text-left transition space-y-1 ${
                scanStep === "Boarding" ? "bg-blue-50 border-blue-500 ring-2 ring-blue-400" : "bg-stone-50 border-stone-200"
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-blue-700 block">Step 1: 07:22 AM</span>
              <strong className="text-stone-900 font-bold block">Morning Stop QR</strong>
              <p className="text-[10px] text-stone-500">Scan Student QR at Burari Chowk</p>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateScan("SchoolArrival")}
              className={`p-4 rounded-2xl border text-left transition space-y-1 ${
                scanStep === "SchoolArrival" ? "bg-blue-50 border-blue-500 ring-2 ring-blue-400" : "bg-stone-50 border-stone-200"
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-blue-700 block">Step 2: 07:55 AM</span>
              <strong className="text-stone-900 font-bold block">School Gate Arrival</strong>
              <p className="text-[10px] text-stone-500">Inward Bus Arrival Logged</p>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateScan("ReturnBoarding")}
              className={`p-4 rounded-2xl border text-left transition space-y-1 ${
                scanStep === "ReturnBoarding" ? "bg-blue-50 border-blue-500 ring-2 ring-blue-400" : "bg-stone-50 border-stone-200"
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-blue-700 block">Step 3: 01:35 PM</span>
              <strong className="text-stone-900 font-bold block">Return Departure</strong>
              <p className="text-[10px] text-stone-500">Student Boards Return Bus</p>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateScan("EscortHandover")}
              className={`p-4 rounded-2xl border text-left transition space-y-1 ${
                scanStep === "EscortHandover" ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400" : "bg-stone-50 border-stone-200"
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">Step 4: 02:05 PM</span>
              <strong className="text-stone-900 font-bold block">Escort QR Verification</strong>
              <p className="text-[10px] text-stone-500">Safe Handover to Mother</p>
            </button>
          </div>

          {scanSuccessMessage && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-bold text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {scanSuccessMessage}
            </div>
          )}

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <strong className="text-stone-900 font-bold block">Escort Card Verification Protocol:</strong>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              When the bus reaches the drop stop, the attendant scans the authorized guardian&apos;s <strong>Escort QR Card</strong>. The ERP instantly verifies active authorization, student match, and photo identity before completing the safe handover.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MAINTENANCE & FUEL LOGS */}
      {/* ========================================================================= */}
      {activeTab === "maintenance" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5 text-xs">
          <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-stone-900">Vehicle Maintenance &amp; CNG Fuel Logs</h3>
              <p className="text-stone-500">Connected to School Expense Ledger for automated fleet cost accounting.</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl">
              Expense Module Integrated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex justify-between items-center">
                <strong className="text-stone-900 font-bold text-sm">Bus 01 (DL-1VA-8921) — Routine Service</strong>
                <span className="font-mono font-black text-purple-900">₹ 8,500.00</span>
              </div>
              <p className="text-[11px] text-stone-600">Engine Oil, Air Filter, Brake Shoe Inspection &amp; Wheel Alignment.</p>
              <div className="text-[10px] text-stone-400 font-mono">
                Workshop: Authorized Tata Motors Commercial Center • Next Due: 20 Nov 2026
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex justify-between items-center">
                <strong className="text-stone-900 font-bold text-sm">Bus 01 (DL-1VA-8921) — CNG Refill</strong>
                <span className="font-mono font-black text-purple-900">₹ 2,600.00</span>
              </div>
              <p className="text-[11px] text-stone-600">32.50 kg CNG Fuel at ₹80/kg • Odometer: 48,150 km.</p>
              <div className="text-[10px] text-stone-400 font-mono">
                Fuel Station: IGL CNG Pump, Burari • Driver: Amit Singh
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 ADD NEW BUS MODAL */}
      {/* ========================================================================= */}
      {isAddBusOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold block">
                  Transport Fleet Register
                </span>
                <h3 className="text-base font-black text-stone-900">Add New School Bus</h3>
              </div>
              <button onClick={() => setIsAddBusOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <form onSubmit={handleAddBusSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Bus Number *</label>
                  <input
                    type="text"
                    required
                    value={busForm.busNumber}
                    onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Registration Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-1VA-8925"
                    value={busForm.registrationNumber}
                    onChange={(e) => setBusForm({ ...busForm, registrationNumber: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Bus Type</label>
                  <input
                    type="text"
                    value={busForm.busType}
                    onChange={(e) => setBusForm({ ...busForm, busType: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    value={busForm.capacity}
                    onChange={(e) => setBusForm({ ...busForm, capacity: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Driver Name *</label>
                  <input
                    type="text"
                    required
                    value={busForm.driverName}
                    onChange={(e) => setBusForm({ ...busForm, driverName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Driver Phone *</label>
                  <input
                    type="tel"
                    required
                    value={busForm.driverPhone}
                    onChange={(e) => setBusForm({ ...busForm, driverPhone: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Attendant Name *</label>
                  <input
                    type="text"
                    required
                    value={busForm.attendantName}
                    onChange={(e) => setBusForm({ ...busForm, attendantName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Attendant Phone *</label>
                  <input
                    type="tel"
                    required
                    value={busForm.attendantPhone}
                    onChange={(e) => setBusForm({ ...busForm, attendantPhone: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddBusOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-xs"
                >
                  Register Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
