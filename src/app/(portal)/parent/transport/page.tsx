"use client";

import { useState, useEffect } from "react";
import { useSiblingContext } from "@/components/providers/SiblingProvider";
import { 
  Bus, Phone, MapPin, AlertCircle, ShieldCheck, 
  CheckCircle2, Clock, Navigation, Bell, Settings
} from "lucide-react";
import { getChildLiveTransportTracking } from "@/app/actions/transport";

export default function ParentTransportPortal() {
  const { activeSibling } = useSiblingContext();
  const [trackingData, setTrackingData] = useState<any>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    busApproaching: true,
    studentBoarded: true,
    schoolReached: true,
    returnBoarded: true,
    studentDropped: true
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await getChildLiveTransportTracking(activeSibling?.id);
      if (res.success && res.data) {
        setTrackingData(res.data);
      }
    }
    loadData();
  }, [activeSibling]);

  const student = trackingData?.student || {
    student_name: activeSibling ? `${activeSibling.firstName} Sharma` : "Aarav Sharma",
    class_name: activeSibling?.grade || "Grade 5",
    section_name: "A",
    route_name: "Route R-05 — Burari & Sant Nagar",
    pickup_stop_name: "Burari Chowk (Pillar 42)"
  };

  const bus = trackingData?.bus || {
    bus_number: "Bus 01",
    registration_number: "DL-1VA-8921",
    driver_name: "Amit Singh",
    driver_phone: "+91 98765 43210",
    attendant_name: "Sunita Devi",
    current_location_name: "Sant Nagar Main Market",
    current_speed_kmh: 32,
    status: "Running"
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* Top Child Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-black shrink-0">
            🚌
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-900 font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                Live Transit Tracking
              </span>
              <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" /> GPS Online
              </span>
            </div>
            <h1 className="text-xl font-black text-stone-900 mt-1">
              {student.student_name} — {student.class_name}-{student.section_name}
            </h1>
            <p className="text-xs text-stone-500 font-medium">
              {student.route_name} • Stop: <strong>{student.pickup_stop_name}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          <Settings className="w-3.5 h-3.5" /> Notification Preferences
        </button>
      </div>

      {/* Notification Preferences Overlay */}
      {showSettings && (
        <div className="bg-purple-50 p-5 rounded-3xl border border-purple-200 space-y-3 text-xs animate-in fade-in">
          <div className="flex justify-between items-center border-b border-purple-200/80 pb-2">
            <strong className="text-purple-950 font-black flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-purple-700" /> Automated Parent WhatsApp &amp; App Alerts
            </strong>
            <span className="text-[10px] text-purple-800 font-bold">Customizable</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-purple-200 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.busApproaching}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, busApproaching: e.target.checked })}
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <span className="font-bold text-stone-800 text-[11px]">Bus 5 mins away</span>
            </label>

            <label className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-purple-200 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.studentBoarded}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, studentBoarded: e.target.checked })}
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <span className="font-bold text-stone-800 text-[11px]">Student Boarded QR</span>
            </label>

            <label className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-purple-200 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.schoolReached}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, schoolReached: e.target.checked })}
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <span className="font-bold text-stone-800 text-[11px]">School Gate Inward</span>
            </label>

            <label className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-purple-200 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.returnBoarded}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, returnBoarded: e.target.checked })}
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <span className="font-bold text-stone-800 text-[11px]">Return Bus Boarded</span>
            </label>

            <label className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-purple-200 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.studentDropped}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, studentDropped: e.target.checked })}
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <span className="font-bold text-stone-800 text-[11px]">Escort Handover Drop</span>
            </label>
          </div>
        </div>
      )}

      {/* Main Tracking & Live Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Status & Map Mockup (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          
          {/* Live Status Highlight */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  🟢 Live Bus Status
                </span>
                <strong className="text-stone-900 font-bold text-sm">
                  Bus is on route near {bus.current_location_name}
                </strong>
                <p className="text-[11px] text-stone-600 font-mono">
                  Speed: {bus.current_speed_kmh} km/h • Vehicle: {bus.registration_number} ({bus.bus_number})
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Estimated Arrival</span>
              <strong className="text-lg font-black text-purple-900 font-mono">07:28 AM</strong>
              <span className="text-[10px] text-emerald-700 font-bold block">(~4 mins away)</span>
            </div>
          </div>

          {/* Interactive Route Milestones Timeline */}
          <div className="space-y-4 text-xs">
            <h3 className="font-black text-stone-900 text-sm">Transit Journey Milestones</h3>
            
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
              
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div>
                  <strong className="text-stone-900 font-bold block">Bus Departed Depot</strong>
                  <span className="text-[11px] text-stone-500">07:05 AM • Main Campus Depot</span>
                </div>
              </div>

              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ●
                </div>
                <div>
                  <strong className="text-blue-900 font-bold block">Next Stop: {student.pickup_stop_name}</strong>
                  <span className="text-[11px] text-blue-700 font-mono">Expected: 07:28 AM (Morning Pickup)</span>
                </div>
              </div>

              <div className="relative flex items-start gap-3 opacity-60">
                <div className="absolute -left-6 w-5 h-5 rounded-full bg-stone-300 text-stone-600 flex items-center justify-center text-[10px]">
                  ○
                </div>
                <div>
                  <strong className="text-stone-800 font-bold block">School Gate Arrival</strong>
                  <span className="text-[11px] text-stone-500">Scheduled: 07:55 AM</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Staff & Emergency Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4 text-xs">
          
          {/* Driver & Attendant Contact */}
          <div className="bg-stone-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block">
              Assigned Bus Crew
            </span>

            <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div>
                <strong className="text-white block font-bold text-sm">{bus.driver_name}</strong>
                <span className="text-[11px] text-stone-400">Lead Driver ({bus.bus_number})</span>
              </div>
              <a
                href={`tel:${bus.driver_phone}`}
                className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <strong className="text-white block font-bold text-sm">{bus.attendant_name}</strong>
                <span className="text-[11px] text-stone-400">Female Bus Attendant</span>
              </div>
              <span className="text-[10px] font-bold bg-stone-800 text-stone-300 px-2 py-1 rounded-lg">
                On Duty ✓
              </span>
            </div>

            <div className="p-3 bg-stone-800 rounded-2xl text-[10px] text-stone-400 leading-relaxed">
              🔒 Calls are securely routed. Crew members only answer calls during designated transit stops.
            </div>
          </div>

          {/* Escort Handover Security Notice */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
            <span className="font-bold text-stone-900 block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" /> Authorized Escort Card Required
            </span>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              At the afternoon drop point, the attendant will scan your <strong>Authorized Escort QR Card</strong> before handing over your child.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
