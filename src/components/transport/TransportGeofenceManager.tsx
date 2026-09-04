"use client";

import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Radio,
  Bell,
  CheckCircle2,
  Clock,
  MapPin,
  Bus,
  RefreshCw,
  Send,
  Zap,
  Sliders,
  ShieldCheck,
  Phone,
  ArrowRight,
  Sparkles,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  getGeofenceStopsAction,
  getGeofenceAlertHistoryAction,
  simulateBusProximityTriggerAction,
  BusStopGeofence,
  GeofenceAlert
} from '@/lib/services/transport/geofence-alert-engine';

export function TransportGeofenceManager() {
  const [stops, setStops] = useState<BusStopGeofence[]>([]);
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Simulation form
  const [selectedStopName, setSelectedStopName] = useState('Sant Nagar Main Market (Chowk)');
  const [simDistance, setSimDistance] = useState('0.8');
  const [simEta, setSimEta] = useState('4');

  const loadData = async () => {
    setIsLoading(true);
    const [stopsRes, alertsRes] = await Promise.all([
      getGeofenceStopsAction(),
      getGeofenceAlertHistoryAction(15)
    ]);
    if (stopsRes.success && stopsRes.stops) {
      setStops(stopsRes.stops);
    }
    if (alertsRes.success && alertsRes.alerts) {
      setAlerts(alertsRes.alerts);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSuccessMessage(null);
    try {
      const res = await simulateBusProximityTriggerAction({
        bus_number: 'Bus 01 (DL-1PC-4501)',
        stop_name: selectedStopName,
        student_name: 'Aarav Sharma (Class 5-A)',
        parent_phone: '+91 98112 34567',
        distance_km: Number(simDistance),
        eta_minutes: Number(simEta)
      });

      if (res.success && res.alert) {
        setSuccessMessage(res.message || 'Geofence alert triggered!');
        setAlerts((prev) => [res.alert!, ...prev]);
      }
    } catch (e: any) {
      alert(`Simulation error: ${e.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#FAF7F2] to-[#F5EFE6] border border-[#E8DFC8] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] shadow-sm">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">
                Automated Parent Bus Geofence Proximity Radar
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Haversine Radar
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Continuously evaluates live GPS coordinates. When school buses cross a 1.0 km radius from designated pickup stops, parents automatically receive a WhatsApp arrival push alert.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-stone-50 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Geofence Radius
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] border border-amber-200 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">1,000 Meters</p>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-600 mt-1">
            <span>Dual Ring: 500m (Boarding) & 1km (Alert)</span>
          </div>
        </Card>

        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Monitored Pickup Stops
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">{stops.length} Designated Stops</p>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-700 mt-1">
            <span>Active on 4 Morning Routes</span>
          </div>
        </Card>

        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Alerts Dispatched Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">{alerts.length} WhatsApp Pushes</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 mt-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>99.8% Delivery Rate</span>
          </div>
        </Card>

        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Average Parent ETA Lead
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">5.2 Minutes</p>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1">
            <span>Prevents curbside wait times</span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Stop Visualizer & Dispatched Alerts Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Stops Roster & Simulator Box (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-[#E8DFC8] rounded-2xl bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  Designated Geofence Stops &amp; Proximity Thresholds
                </h4>
                <p className="text-xs text-stone-500">
                  GPS coordinates with automated 1,000m radial triggers
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {stops.map((st) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-xl border border-[#E8DFC8] bg-[#FAF7F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#D97706] border border-amber-200 flex items-center justify-center mt-0.5 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900 text-xs">{st.stop_name}</div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-stone-600">
                          {st.latitude.toFixed(4)}°N, {st.longitude.toFixed(4)}°E
                        </span>
                        <span>•</span>
                        <span className="text-[#D97706] font-semibold">{st.assigned_bus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-stone-800 block">
                        {st.student_count} Students
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        ETA: ~{st.eta_current_trip} mins
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedStopName(st.stop_name);
                        setSimDistance('0.9');
                        setSimEta((st.eta_current_trip || 5).toString());
                        handleSimulate();
                      }}
                      className="text-[11px] h-7 px-2 border-[#E8DFC8] bg-white hover:bg-stone-50 text-stone-700"
                    >
                      <Zap className="w-3 h-3 mr-1 text-[#D97706]" />
                      Trigger Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Geofence Alert Simulation Panel */}
            <div className="mt-5 p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D97706]" />
                <h5 className="text-xs font-bold text-stone-900">
                  Simulate Live Telemetry Geofence Breach
                </h5>
              </div>
              <p className="text-[11px] text-stone-600">
                Test the Haversine proximity evaluation by triggering a mock 800m bus arrival event for a student.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Target Stop</label>
                  <select
                    value={selectedStopName}
                    onChange={(e) => setSelectedStopName(e.target.value)}
                    className="w-full text-xs border border-[#E8DFC8] rounded-lg p-1.5 bg-white text-stone-800"
                  >
                    {stops.map((s) => (
                      <option key={s.id} value={s.stop_name}>
                        {s.stop_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simDistance}
                    onChange={(e) => setSimDistance(e.target.value)}
                    className="w-full text-xs border border-[#E8DFC8] rounded-lg p-1.5 bg-white text-stone-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Calculated ETA (mins)</label>
                  <input
                    type="number"
                    value={simEta}
                    onChange={(e) => setSimEta(e.target.value)}
                    className="w-full text-xs border border-[#E8DFC8] rounded-lg p-1.5 bg-white text-stone-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold"
                >
                  {isSimulating ? 'Evaluating...' : 'Dispatch Live WhatsApp Push'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-Time WhatsApp Push Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-[#E8DFC8] rounded-2xl bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span>Dispatched Alert Audit Stream</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </h4>
                <p className="text-[11px] text-stone-500">
                  Automated WhatsApp notifications to parents
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E8DFC8] max-h-[520px] overflow-y-auto pr-1 text-xs">
              {alerts.map((al) => (
                <div key={al.id} className="py-3 first:pt-1 last:pb-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <Bus className="w-3.5 h-3.5 text-[#D97706]" />
                      {al.bus_number}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(al.dispatched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-600">
                    <span className="font-semibold text-stone-800">{al.student_name}</span> • {al.parent_phone}
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-stone-700 text-[11px] leading-relaxed">
                    {al.message_preview}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Status: {al.status}
                    </span>
                    <span>Distance: {al.distance_km} km</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
