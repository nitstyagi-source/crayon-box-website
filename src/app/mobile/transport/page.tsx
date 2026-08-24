"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Bus, ArrowLeft, Phone, MapPin, Navigation, 
  CheckCircle2, Clock, ShieldCheck, AlertCircle, RefreshCw
} from "lucide-react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";
import GoogleMapsVehicleTracker from "@/components/transport/GoogleMapsVehicleTracker";

export default function MobileTransportPage() {
  const { activeChild } = useMobileAuth();

  const STOPS = [
    { name: "Crayon Box School Main Gate", time: "07:30 AM", status: "completed" },
    { name: "Sector 62 Fortis Circle", time: "07:45 AM", status: "completed" },
    { name: "Shipra Sun City Gate 2 (Your Stop)", time: "08:05 AM", status: "current", studentBoarded: true },
    { name: "Indirapuram Habitat Centre", time: "08:20 AM", status: "upcoming" },
    { name: "Vaishali Metro Station", time: "08:35 AM", status: "upcoming" },
  ];

  return (
    <div className="space-y-5 pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/mobile" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-tight">Live GPS Bus Tracker</h1>
            <p className="text-[11px] text-slate-500">Student: {activeChild?.firstName || "Aarav"} &bull; {activeChild?.busRoute || "Route 4"}</p>
          </div>
        </div>

        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live GPS
        </span>
      </div>

      {/* Driver & Bus Info Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-5 text-white shadow-md space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Bus No. 01</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  ● Driver Phone GPS
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">DL-1VA-8921 (Tata Starbus)</h3>
              <p className="text-xs text-slate-300">Driver: Amit Singh (+91 98765 43210)</p>
            </div>
          </div>

          <a 
            href="tel:+919876543210"
            className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-sm transition-all"
            title="Call Driver"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        {/* ETA & Boarding Status */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300">Next Stop ETA</span>
            <div className="text-lg font-bold text-amber-300 mt-0.5">4 Mins</div>
            <span className="text-[10px] text-slate-300">Speed: 34 km/h</span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300">Boarding Status</span>
            <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> En Route to Stop
            </div>
            <span className="text-[10px] text-slate-300">18 Students Onboard</span>
          </div>
        </div>
      </div>

      {/* 🗺️ GOOGLE MAPS LIVE VEHICLE TRACKER */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Live Google Maps Transit View
        </h3>
        <GoogleMapsVehicleTracker
          bus={{
            bus_number: "Bus 01",
            registration_number: "DL-1VA-8921",
            driver_name: "Amit Singh",
            driver_phone: "+91 98765 43210",
            current_lat: 28.7214,
            current_lng: 77.2012,
            current_speed_kmh: 34,
            current_location_name: "Sant Nagar Main Market",
            status: "Running",
            route_name: "Route R-05 — Burari & Sant Nagar"
          }}
          height="320px"
          interactive={true}
          showControls={false}
        />
      </div>

      {/* Live Roadmap Graphic */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Route Stops & Itinerary
        </h3>

        <div className="space-y-4 relative pl-4 border-l-2 border-slate-200 ml-3 my-2">
          {STOPS.map((stop, idx) => (
            <div key={stop.name} className="relative group">
              
              {/* Node Indicator */}
              <div className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                stop.status === "completed" ? "bg-emerald-500 text-white" :
                stop.status === "current" ? "bg-amber-500 text-slate-950 ring-4 ring-amber-400/30" :
                "bg-slate-300"
              }`}>
                {stop.status === "completed" && <CheckCircle2 className="w-2.5 h-2.5" />}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold leading-tight ${
                    stop.status === "current" ? "text-amber-700" : "text-slate-800"
                  }`}>
                    {stop.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">{stop.time}</span>
                </div>

                {stop.studentBoarded && (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> {activeChild?.firstName || "Aarav"} boarded here
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
