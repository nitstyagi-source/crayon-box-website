"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Settings, ArrowLeft, MapPin, Clock, ShieldCheck, 
  Save, Sparkles, Building2, CheckCircle2, Sliders, Lock
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getGeofenceConfig, saveGeofenceConfig } from "@/app/actions/attendance";

export default function AttendanceSettingsPage() {
  const { activeCampusId } = useCampusContext();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    school_name: "Crayon Box School - Main Campus, Burari",
    latitude: 28.7533150,
    longitude: 77.2024180,
    geofence_radius_meters: 120,
    gps_accuracy_threshold_meters: 35,
    shift_start_time: "08:00",
    shift_end_time: "13:30",
    grace_period_minutes: 10,
    late_threshold_time: "08:10",
    half_day_threshold_minutes: 240,
    early_departure_threshold_time: "13:15",
    face_verification_enabled: true,
    device_restriction_enabled: true,
    allow_official_duty_override: true
  });

  useEffect(() => {
    loadSettings();
  }, [activeCampusId]);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await getGeofenceConfig(activeCampusId);
      if (res.success && res.data) {
        setFormData({
          ...res.data,
          latitude: Number(res.data.latitude),
          longitude: Number(res.data.longitude),
          geofence_radius_meters: Number(res.data.geofence_radius_meters)
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await saveGeofenceConfig(activeCampusId, formData);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Error saving settings: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-stone-500 font-bold animate-pulse">Loading Attendance Settings...</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <Link 
            href="/admin/attendance"
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Attendance Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Geofence & Attendance Rules</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">Configure campus GPS boundaries, shift rules, grace periods, and anti-fraud security.</p>
        </div>

        {saveSuccess && (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved Successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Campus GPS Coordinates & Geofence Radius */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> 1. Campus GPS Location & Geofence Radius
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              High-Precision Meter
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-3">
              <label className="font-bold text-stone-600 block mb-1">Campus / School Facility Name</label>
              <input
                type="text"
                value={formData.school_name}
                onChange={e => setFormData({...formData, school_name: e.target.value})}
                className="w-full border border-stone-200 p-2.5 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-600 block mb-1">Latitude (Decimal Degrees) *</label>
              <input
                required
                type="number"
                step="any"
                value={formData.latitude}
                onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                className="w-full border border-stone-200 p-2.5 rounded-xl font-mono text-xs font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-600 block mb-1">Longitude (Decimal Degrees) *</label>
              <input
                required
                type="number"
                step="any"
                value={formData.longitude}
                onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                className="w-full border border-stone-200 p-2.5 rounded-xl font-mono text-xs font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-600 block mb-1">Max GPS Accuracy Drift (m)</label>
              <input
                type="number"
                value={formData.gps_accuracy_threshold_meters}
                onChange={e => setFormData({...formData, gps_accuracy_threshold_meters: parseInt(e.target.value)})}
                className="w-full border border-stone-200 p-2.5 rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          {/* Geofence Radius Slider */}
          <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-600" /> Authorized Geofence Radius
              </label>
              <span className="font-mono text-base font-black text-purple-900 bg-purple-100 px-3 py-0.5 rounded-xl">
                {formData.geofence_radius_meters} Metres
              </span>
            </div>

            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={formData.geofence_radius_meters}
              onChange={e => setFormData({...formData, geofence_radius_meters: parseInt(e.target.value)})}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-[11px] text-stone-400 font-bold">
              <span>50m (Tight Building)</span>
              <span>120m (Standard Campus)</span>
              <span>500m (Large K-12 Estate)</span>
            </div>
          </div>
        </div>

        {/* Section 2: Shift Timings & Grace Periods */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> 2. Shift Timings & Attendance Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-bold text-stone-600 block mb-1">Shift Start Time</label>
              <input
                type="time"
                value={formData.shift_start_time}
                onChange={e => setFormData({...formData, shift_start_time: e.target.value})}
                className="w-full border border-stone-200 p-2.5 rounded-xl font-mono text-xs font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-600 block mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                value={formData.grace_period_minutes}
                onChange={e => setFormData({...formData, grace_period_minutes: parseInt(e.target.value)})}
                className="w-full border border-stone-200 p-2.5 rounded-xl font-mono text-xs font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-600 block mb-1">Late Threshold Time</label>
              <input
                type="time"
                value={formData.late_threshold_time}
                onChange={e => setFormData({...formData, late_threshold_time: e.target.value})}
                className="w-full border border-stone-200 p-2.5 rounded-xl font-mono text-xs font-bold text-amber-700"
              />
            </div>

            <div>
              <label className="font-bold text-stone-600 block mb-1">Shift End Time</label>
              <input
                type="time"
                value={formData.shift_end_time}
                onChange={e => setFormData({...formData, shift_end_time: e.target.value})}
                className="w-full border border-stone-200 p-2.5 rounded-xl font-mono text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Anti-Fraud & Security Policies */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" /> 3. Anti-Fraud & Verification Toggles
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 cursor-pointer">
              <div>
                <span className="font-bold text-stone-900 text-xs block">Enable Face / Selfie Verification</span>
                <span className="text-[11px] text-stone-500">Prompts staff to take a front-camera selfie upon check-in.</span>
              </div>
              <input
                type="checkbox"
                checked={formData.face_verification_enabled}
                onChange={e => setFormData({...formData, face_verification_enabled: e.target.checked})}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 cursor-pointer">
              <div>
                <span className="font-bold text-stone-900 text-xs block">Allow Official Duty (OD) Geofence Bypass</span>
                <span className="text-[11px] text-stone-500">Allows staff on approved external school duties to mark attendance.</span>
              </div>
              <input
                type="checkbox"
                checked={formData.allow_official_duty_override}
                onChange={e => setFormData({...formData, allow_official_duty_override: e.target.checked})}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-stone-900 hover:bg-stone-800 text-white font-black text-xs px-8 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-amber-400" />
            {isSaving ? "Saving Settings..." : "Save Geofence Settings"}
          </button>
        </div>

      </form>

    </div>
  );
}
