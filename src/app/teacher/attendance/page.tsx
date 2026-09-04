"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin, ShieldCheck, UserCheck, AlertTriangle, Clock,
  ArrowRight, ArrowLeft, RefreshCw, Sparkles, CheckCircle2,
  Navigation, Smartphone, Compass, ShieldAlert, Zap, Users,
  Building2, Lock, Radio, Crosshair
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import {
  punchTeacherGeofenceAttendanceAction,
  getCampusGeofenceConfigsAction
} from '@/app/actions/teacher-attendance-actions';
import { calculateDistanceMeters } from '@/lib/geo-utils';
import { createClient } from '@/lib/supabase/client';

export default function TeacherAppAttendancePage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [campusConfigs, setCampusConfigs] = useState<any[]>([]);

  // GPS State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Distance & Geofence State
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean | null>(null);
  const [activeCampus, setActiveCampus] = useState<any>(null);

  // Punch State
  const [isPunching, setIsPunching] = useState(false);
  const [lastPunchResult, setLastPunchResult] = useState<any>(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    const supabase = createClient();
    const { data: staff } = await supabase
      .from('staff')
      .select('id, first_name, last_name, email, designation, department, photo_url')
      .eq('status', 'ACTIVE')
      .order('first_name', { ascending: true });

    if (staff && staff.length > 0) {
      setStaffList(staff);
      setSelectedStaffId(staff[0].id);
    }

    const configsRes = await getCampusGeofenceConfigsAction();
    if (configsRes.success) {
      setCampusConfigs(configsRes.data || []);
      if (configsRes.data?.length > 0) {
        setActiveCampus(configsRes.data[0]); // default CBS
      }
    }
  };

  useEffect(() => {
    loadInitialData();
    // Default GPS Coordinates to CBS Campus (Inside Geofence)
    handleSetSimulatedLocation('INSIDE');
  }, []);

  // Recalculate distance whenever user coords or campus changes
  useEffect(() => {
    if (userCoords && activeCampus) {
      const d = calculateDistanceMeters(
        userCoords.lat,
        userCoords.lng,
        Number(activeCampus.latitude),
        Number(activeCampus.longitude)
      );
      setDistanceMeters(d);
      setIsInsideGeofence(d <= Number(activeCampus.radius_meters));
    }
  }, [userCoords, activeCampus]);

  const handleAcquireRealGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy || 10,
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(`GPS Error: ${err.message}. Using simulated campus coordinates.`);
        setGpsLoading(false);
        handleSetSimulatedLocation('INSIDE');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSetSimulatedLocation = (mode: 'INSIDE' | 'OUTSIDE') => {
    if (!activeCampus) return;
    const centerLat = Number(activeCampus.latitude || 28.7183200);
    const centerLng = Number(activeCampus.longitude || 77.2144500);

    if (mode === 'INSIDE') {
      // 35 meters away from center
      setUserCoords({
        lat: centerLat + 0.00025,
        lng: centerLng + 0.00015,
        accuracy: 8,
      });
      setGpsError(null);
    } else {
      // 1.4 kilometers away
      setUserCoords({
        lat: centerLat + 0.0125,
        lng: centerLng + 0.0115,
        accuracy: 15,
      });
      setGpsError(null);
    }
  };

  const handleExecutePunch = async () => {
    if (!selectedStaffId || !userCoords) return;
    setIsPunching(true);

    const res = await punchTeacherGeofenceAttendanceAction({
      staffId: selectedStaffId,
      latitude: userCoords.lat,
      longitude: userCoords.lng,
      accuracy: userCoords.accuracy,
      punchType: 'AUTO',
    });

    setLastPunchResult(res);
    setIsPunching(false);
  };

  const activeStaff = staffList.find((s) => s.id === selectedStaffId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      
      {/* Top Mobile App Header */}
      <div className="max-w-md mx-auto p-4 sm:p-6 space-y-6">
        
        {/* App Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/30">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase block">
                Teacher Smart Portal
              </span>
              <h1 className="text-base font-extrabold text-white">Geofence Attendance</h1>
            </div>
          </div>

          <Link href="/admin/attendance/teachers">
            <Button size="sm" variant="outline" className="bg-slate-900 border-slate-700 text-xs text-slate-300 hover:bg-slate-800">
              Admin Hub
            </Button>
          </Link>
        </div>

        {/* 🌟 TEACHER PROFILE SELECTOR (For Demo / Switching) */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold flex items-center gap-1.5 text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              Active Faculty Profile
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-mono">
              Emp App View
            </span>
          </div>

          <select
            value={selectedStaffId}
            onChange={(e) => {
              setSelectedStaffId(e.target.value);
              setLastPunchResult(null);
            }}
            className="w-full bg-slate-800 text-white font-medium text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name} — {s.designation} ({s.department})
              </option>
            ))}
          </select>
        </div>

        {/* 🌟 LIVE RADAR / GEOFENCE STATUS CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-6">
          
          {/* Background Radar Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-indigo-500/10 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-indigo-500/20 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-indigo-500/30 rounded-full pointer-events-none" />

          {/* Live Digital Clock */}
          <div className="text-center space-y-1 relative z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <div className="text-4xl font-black text-white font-mono tracking-tight drop-shadow-md">
              {currentTime}
            </div>
            <span className="text-[11px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-0.5 rounded-full inline-block mt-1">
              {activeCampus?.campus_name || 'Academic Campus'}
            </span>
          </div>

          {/* Radar Visualizer Animation */}
          <div className="flex flex-col items-center justify-center my-2 relative z-10">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center relative transition-all duration-500 ${
                isInsideGeofence
                  ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-rose-500/20 border-2 border-rose-400 shadow-lg shadow-rose-500/20'
              }`}
            >
              {isInsideGeofence ? (
                <div className="text-center space-y-1">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                  <span className="text-[10px] font-black uppercase text-emerald-300 block tracking-wider">
                    INSIDE CAMPUS
                  </span>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-rose-300 block tracking-wider">
                    OUTSIDE RADIUS
                  </span>
                </div>
              )}
            </div>

            {/* Distance Pill */}
            <div className="mt-3 text-center">
              <span
                className={`text-xs font-black font-mono px-3 py-1 rounded-full border inline-block ${
                  isInsideGeofence
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                📍 Distance: {distanceMeters !== null ? `${distanceMeters}m` : 'Calculating...'} (Allowed: ≤{activeCampus?.radius_meters || 250}m)
              </span>
            </div>
          </div>

          {/* 🌟 1-TAP PUNCH BUTTON */}
          <div className="space-y-3 relative z-10">
            <Button
              size="lg"
              variant="primary"
              onClick={handleExecutePunch}
              isLoading={isPunching}
              disabled={!isInsideGeofence}
              className={`w-full py-4 text-sm font-black uppercase tracking-wider rounded-2xl shadow-xl transition transform active:scale-98 ${
                isInsideGeofence
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
              leftIcon={<Radio className="w-5 h-5" />}
            >
              {isInsideGeofence ? '⚡ 1-Tap Geofence Punch In / Out' : '🔒 Move Inside Campus to Punch'}
            </Button>

            {!isInsideGeofence && (
              <p className="text-[11px] text-center text-rose-400 font-medium">
                ⚠️ Attendance cannot be recorded outside the {activeCampus?.radius_meters || 250}m campus perimeter.
              </p>
            )}
          </div>

        </div>

        {/* 🌟 LAST PUNCH FEEDBACK CARD */}
        {lastPunchResult && (
          <div
            className={`p-4 rounded-2xl border shadow-lg animate-in zoom-in-95 duration-200 ${
              lastPunchResult.success
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-100'
                : 'bg-rose-950/80 border-rose-700 text-rose-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {lastPunchResult.success ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div className="space-y-0.5 text-xs">
                <strong className="block font-black">{lastPunchResult.success ? 'Attendance Recorded!' : 'Geofence Breach'}</strong>
                <p className="text-[11px] text-slate-300">{lastPunchResult.message || lastPunchResult.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 🌟 SIMULATION & REAL GPS CONTROLLER (For Fast Testing) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold flex items-center gap-1.5 text-slate-200">
              <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
              GPS Sensor & Location Controller
            </span>
            <span className="text-[10px] text-indigo-400">Test Simulator</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSetSimulatedLocation('INSIDE')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                isInsideGeofence
                  ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              🟢 Inside Campus (35m)
            </button>
            <button
              type="button"
              onClick={() => handleSetSimulatedLocation('OUTSIDE')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                !isInsideGeofence
                  ? 'bg-rose-900/50 border-rose-500 text-rose-300 shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              🔴 Outside Radius (1.4km)
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleAcquireRealGps}
            isLoading={gpsLoading}
            className="w-full bg-slate-800 border-slate-700 text-xs text-slate-300 hover:bg-slate-700"
            leftIcon={<Navigation className="w-3.5 h-3.5 text-indigo-400" />}
          >
            Acquire Real Device GPS (HTML5 Sensor)
          </Button>

          {gpsError && (
            <p className="text-[10px] text-amber-400 font-mono text-center">{gpsError}</p>
          )}
        </div>

        {/* Bottom Link to Admin Muster Roll */}
        <div className="text-center pt-2">
          <Link href="/admin/attendance/teachers" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center justify-center gap-1">
            Switch to Admin Daily Muster Roll & Geofence Manager <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
