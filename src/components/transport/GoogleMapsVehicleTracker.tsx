"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bus, Navigation, MapPin, Gauge, Phone, ShieldCheck,
  Radio, Layers, Compass, Maximize2, Minimize2, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, Smartphone, Zap
} from "lucide-react";

export interface BusStop {
  id: string;
  stop_name: string;
  sequence_number: number;
  lat: number;
  lng: number;
  pickup_time?: string;
  drop_time?: string;
  status?: string;
}

export interface BusTelemetry {
  bus_number: string;
  registration_number?: string;
  driver_name: string;
  driver_phone?: string;
  attendant_name?: string;
  attendant_phone?: string;
  current_lat: number;
  current_lng: number;
  current_speed_kmh: number;
  current_location_name: string;
  status: string;
  route_name?: string;
  capacity?: number;
  onboard_count?: number;
  heading?: number;
  accuracyMeters?: number;
  isDriverPhoneGps?: boolean;
}

interface GoogleMapsVehicleTrackerProps {
  bus: BusTelemetry;
  stops?: BusStop[];
  routePolyline?: Array<{ lat: number; lng: number }>;
  height?: string;
  interactive?: boolean;
  showControls?: boolean;
  onRefresh?: () => void;
  targetStopName?: string; // If specified, highlights child's specific stop for parents
}

export default function GoogleMapsVehicleTracker({
  bus,
  stops = [],
  routePolyline = [],
  height = "460px",
  interactive = true,
  showControls = true,
  onRefresh,
  targetStopName
}: GoogleMapsVehicleTrackerProps) {
  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "terrain">("roadmap");
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [activeTab, setActiveTab] = useState<"map" | "stops" | "telemetry">("map");

  const containerRef = useRef<HTMLDivElement>(null);

  // Default Delhi Coordinates (Burari / Sant Nagar)
  const centerLat = bus.current_lat || 28.7214;
  const centerLng = bus.current_lng || 77.2012;

  // Build default stops if not provided
  const activeStops: BusStop[] = stops.length > 0 ? stops : [
    { id: "s1", stop_name: "School Campus Main Gate", sequence_number: 1, lat: 28.7185, lng: 77.1995, pickup_time: "07:05 AM" },
    { id: "s2", stop_name: "Sant Nagar Main Market", sequence_number: 2, lat: 28.7214, lng: 77.2012, pickup_time: "07:20 AM" },
    { id: "s3", stop_name: "Burari Chowk (Pillar 42)", sequence_number: 3, lat: 28.7250, lng: 77.2050, pickup_time: "07:35 AM" },
    { id: "s4", stop_name: "Nathupura Bus Stand", sequence_number: 4, lat: 28.7300, lng: 77.1950, pickup_time: "07:50 AM" }
  ];

  // Calculate bounding box for SVG canvas coordinate projection
  const minLat = 28.710;
  const maxLat = 28.735;
  const minLng = 77.185;
  const maxLng = 77.215;

  function projectToPercent(lat: number, lng: number) {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  }

  const busPos = projectToPercent(centerLat, centerLng);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen w-screen" : ""
      }`}
      style={{ height: isFullscreen ? "100vh" : height }}
    >
      {/* 🌟 TOP GOOGLE MAPS NAVIGATION HEADER */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Live GPS Broadcast Indicator */}
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-2xl border border-slate-700/80 shadow-lg flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-amber-400 font-black">{bus.bus_number}</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> Driver Phone GPS
            </span>
          </div>
        </div>

        {/* Speedometer & Location Badge */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700 text-xs font-mono">
          <div className="flex items-center gap-1 text-indigo-300 font-bold">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-white text-sm font-black">{bus.current_speed_kmh || 0}</span> km/h
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-300 truncate max-w-[200px] text-[11px] font-sans">
            {bus.current_location_name || "Sant Nagar Main Road"}
          </div>
        </div>

        {/* Map Type & Control Buttons */}
        {showControls && (
          <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => setMapType(mapType === "roadmap" ? "satellite" : "roadmap")}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition flex items-center gap-1 ${
                mapType === "satellite" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:text-white"
              }`}
              title="Toggle Satellite Imagery"
            >
              <Layers className="w-3 h-3" /> {mapType === "satellite" ? "Satellite" : "Roadmap"}
            </button>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Refresh GPS"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* 🗺️ INTERACTIVE MAP CANVAS ENGINE */}
      <div className={`w-full h-full relative overflow-hidden select-none ${
        mapType === "satellite" ? "bg-slate-950" : "bg-[#0f172a]"
      }`}>
        
        {/* Background Google Maps Styled Grid Lines / Roads */}
        <svg className="w-full h-full absolute inset-0 opacity-40">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
            </pattern>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Road Network Vectors */}
          <path d="M 0 180 Q 250 140, 500 220 T 1000 200" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
          <path d="M 120 0 Q 220 200, 300 450 T 450 800" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <path d="M 400 0 Q 480 300, 650 500 T 900 800" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />

          {/* Connected Route Polyline */}
          <polyline
            points={activeStops.map(s => {
              const pos = projectToPercent(s.lat, s.lng);
              return `${pos.x}%,${pos.y}%`;
            }).join(" ")}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="4"
            strokeDasharray="6,4"
            className="animate-pulse"
          />
        </svg>

        {/* 🏫 School Campus Anchor Marker */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto cursor-pointer group"
          style={{ left: "15%", top: "78%" }}
        >
          <div className="bg-amber-500 text-slate-950 p-2 rounded-2xl shadow-xl font-black text-xs border-2 border-white flex items-center gap-1 group-hover:scale-110 transition">
            <span>🏫</span>
            <span className="font-bold text-[10px]">Crayon Box Campus</span>
          </div>
          <div className="w-1.5 h-3 bg-amber-500" />
        </div>

        {/* 📍 Route Stops Markers */}
        {activeStops.map((stop, idx) => {
          const pos = projectToPercent(stop.lat, stop.lng);
          const isTarget = targetStopName && stop.stop_name.toLowerCase().includes(targetStopName.toLowerCase());

          return (
            <div
              key={stop.id || idx}
              onClick={() => setSelectedStop(stop)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto cursor-pointer group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {/* Geofence Radar for Target Child Stop */}
              {isTarget && (
                <div className="absolute w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-400 animate-ping -z-10" />
              )}

              {/* Stop Badge */}
              <div className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-md border flex items-center gap-1 transition-all ${
                isTarget
                  ? "bg-indigo-600 text-white border-indigo-300 ring-4 ring-indigo-400/40 scale-110"
                  : "bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-indigo-950 hover:text-white"
              }`}>
                <MapPin className={`w-3 h-3 ${isTarget ? "text-amber-300" : "text-rose-400"}`} />
                <span className="truncate max-w-[120px]">{stop.stop_name}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-0.5">{stop.pickup_time || "07:30 AM"}</span>
            </div>
          );
        })}

        {/* 🚌 LIVE BUS VEHICLE MARKER */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700 ease-out cursor-pointer pointer-events-auto group"
          style={{ left: `${busPos.x}%`, top: `${busPos.y}%` }}
        >
          {/* Animated 360-degree GPS Pulse Radar */}
          <div className="absolute w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/40 animate-ping -z-10" />
          <div className="absolute w-28 h-28 rounded-full bg-emerald-400/10 -z-20 animate-pulse" />

          {/* Vehicle Bubble Tag */}
          <div className="bg-slate-950/95 text-white px-3 py-1 rounded-2xl border-2 border-amber-400 shadow-2xl flex items-center gap-2 group-hover:scale-105 transition">
            <div className="w-6 h-6 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Bus className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-black text-amber-300 leading-none">
                {bus.bus_number}
              </div>
              <div className="text-[9px] text-emerald-400 font-mono font-bold mt-0.5">
                {bus.current_speed_kmh} km/h • In Transit
              </div>
            </div>
          </div>

          {/* Bus Pin Stem */}
          <div className="w-1.5 h-3 bg-amber-400 rounded-b" />
        </div>

        {/* Selected Stop Details Popover */}
        {selectedStop && (
          <div className="absolute bottom-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-slate-950/95 backdrop-blur-md p-4 rounded-3xl border border-slate-700 shadow-2xl z-30 space-y-2 text-xs text-white animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Stop #{selectedStop.sequence_number}
                </span>
                <strong className="text-sm text-white font-bold">{selectedStop.stop_name}</strong>
              </div>
              <button
                onClick={() => setSelectedStop(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Morning Pickup</span>
                <strong className="text-emerald-400">{selectedStop.pickup_time || "07:30 AM"}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Evening Drop</span>
                <strong className="text-indigo-400">{selectedStop.drop_time || "01:55 PM"}</strong>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 🌟 BOTTOM LIVE TELEMETRY STATUS BAR */}
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs text-white">
        
        {/* Driver Contact & Attendant */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-black">
            👨‍✈️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <strong className="text-slate-100 font-bold text-xs">{bus.driver_name || "Amit Singh"}</strong>
              <span className="text-[10px] text-slate-400">(Driver)</span>
            </div>
            {bus.driver_phone && (
              <a
                href={`tel:${bus.driver_phone}`}
                className="text-[10px] font-mono text-indigo-400 hover:underline flex items-center gap-1 mt-0.5 font-bold"
              >
                <Phone className="w-2.5 h-2.5" /> {bus.driver_phone}
              </a>
            )}
          </div>
        </div>

        {/* Real-time GPS Telemetry Coordinates */}
        <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-slate-400">
          <div>
            <span className="text-slate-500 block">GPS Position</span>
            <span className="text-slate-200">{centerLat.toFixed(4)}°N, {centerLng.toFixed(4)}°E</span>
          </div>
          <div>
            <span className="text-slate-500 block">Passenger Load</span>
            <span className="text-emerald-400 font-bold">{bus.onboard_count || 18} / {bus.capacity || 32} Onboard</span>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] border border-emerald-500/40 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            LIVE TELEMATICS ACTIVE
          </span>
        </div>

      </div>

    </div>
  );
}
