"use client";

import React, { useState } from 'react';
import {
  Bus, MapPin, QrCode, Phone, ShieldCheck,
  CheckCircle2, AlertTriangle, Clock, Navigation, Download
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function TransportFleetRadarPage() {
  const [selectedInst, setSelectedInst] = useState<string>('ALL');

  const fleetBuses = [
    {
      id: 'BUS-04',
      routeNo: 'Route 4 (Shastri Park -> Preet Vihar -> Laxmi Nagar)',
      primaryInstitution: 'CBS',
      sharedWith: 'CBPS',
      driverName: 'Suresh Yadav',
      driverPhone: '+91 98111 22334',
      speedKmph: 34,
      currentLocation: 'Near Laxmi Nagar Metro Station',
      studentsOnBoard: 28,
      capacity: 32,
      status: 'ON_TIME',
      cctvStatus: 'ACTIVE_ONLINE',
    },
    {
      id: 'BUS-08',
      routeNo: 'Route 8 (Burari -> Model Town -> GTB Nagar)',
      primaryInstitution: 'AS',
      sharedWith: 'AVM',
      driverName: 'Harish Rawat',
      driverPhone: '+91 98222 33445',
      speedKmph: 22,
      currentLocation: 'Model Town Ring Road Junction',
      studentsOnBoard: 30,
      capacity: 35,
      status: 'DELAYED_10_MINS',
      cctvStatus: 'ACTIVE_ONLINE',
    },
  ];

  const boardingLog = [
    {
      studentName: 'Aarav Sharma (CBS-2026-0042)',
      busId: 'BUS-04',
      stopName: 'Preet Vihar B-Block Stop',
      time: '07:42 AM',
      event: 'BOARDED_MORNING',
      scannedBy: 'Conductor QR Scanner',
      parentNotificationSent: true,
    },
    {
      studentName: 'Anaya Sharma (CBPS-2026-0018)',
      busId: 'BUS-04',
      stopName: 'Preet Vihar B-Block Stop',
      time: '07:43 AM',
      event: 'BOARDED_MORNING',
      scannedBy: 'Conductor QR Scanner',
      parentNotificationSent: true,
    },
    {
      studentName: 'Vihaan Gupta (AS-2026-0128)',
      busId: 'BUS-08',
      stopName: 'Model Town C-Block Gate',
      time: '07:35 AM',
      event: 'BOARDED_MORNING',
      scannedBy: 'Conductor QR Scanner',
      parentNotificationSent: true,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Shared Fleet Telematics
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">12 GPS-Tracked Vehicles</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Transport Fleet Radar & QR Boarding Log</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Real-time vehicle GPS tracking, speed telemetry, shared institutional routes, and student boarding QR verifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Transport Log
          </button>
        </div>
      </div>

      {/* Live Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fleetBuses.map((bus) => (
          <div key={bus.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-black bg-stone-900 text-white px-2 py-0.5 rounded-md">
                    {bus.id}
                  </span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    Primary: {bus.primaryInstitution} {bus.sharedWith && `• Shared with ${bus.sharedWith}`}
                  </span>
                </div>
                <h3 className="text-base font-black text-stone-900">{bus.routeNo}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                bus.status === 'ON_TIME' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {bus.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <div>
                <span className="text-stone-400 font-semibold block">Driver & Contact</span>
                <p className="font-bold text-stone-900">{bus.driverName} • 📞 {bus.driverPhone}</p>
              </div>
              <div>
                <span className="text-stone-400 font-semibold block">Live Telemetry</span>
                <p className="font-black text-indigo-600">{bus.speedKmph} km/h • 🎥 CCTV Online</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-stone-200">
                <span className="text-stone-400 font-semibold block">Current GPS Location:</span>
                <p className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {bus.currentLocation}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-stone-700">
              <span>On-Board Students: {bus.studentsOnBoard} / {bus.capacity}</span>
              <span className="text-emerald-600 font-black">🟢 Speed Safe & Monitored</span>
            </div>
          </div>
        ))}
      </div>

      {/* QR Boarding Log Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" /> Morning Student QR Boarding Stream
          </h2>
          <span className="text-xs text-stone-400 font-semibold">Instant Parent Push Notifications Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Student Account</th>
                <th className="p-3.5">Vehicle</th>
                <th className="p-3.5">Designated Stop</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Scan Device</th>
                <th className="p-3.5 text-right">Parent Push Notification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {boardingLog.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5 font-black text-stone-900">{log.studentName}</td>
                  <td className="p-3.5 font-bold font-mono text-indigo-600">{log.busId}</td>
                  <td className="p-3.5 font-semibold text-stone-800">{log.stopName}</td>
                  <td className="p-3.5 font-bold text-stone-700">{log.time}</td>
                  <td className="p-3.5 text-stone-500 font-medium">{log.scannedBy}</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-[10px] uppercase">
                      ✓ Push Delivered
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
