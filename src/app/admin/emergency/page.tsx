"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert, ArrowLeft, Radio, AlertTriangle, CheckCircle2,
  Users, UserCheck, PhoneCall, Send, Lock, VideoOff, RefreshCw
} from 'lucide-react';
import { erpEventEngine } from '@/lib/core/events/event-engine';

export default function EmergencyModePage() {
  const [isLockdownActive, setIsLockdownActive] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState(
    'EMERGENCY ALERT: All students and staff must remain in classrooms. Doors locked. Await further instructions.'
  );
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleTriggerLockdown = () => {
    setIsLockdownActive(true);
    erpEventEngine.publish({
      eventType: 'EMERGENCY_LOCKDOWN_TRIGGERED',
      campusId: 'c3d782a9-a50b-4708-a3fc-6b146f456662',
      actor: { userId: 'usr-admin', name: 'Principal Desk', role: 'Principal' },
      entity: { type: 'CAMPUS', id: 'c3d782a9-a50b-4708-a3fc-6b146f456662' },
      metadata: { reason: 'Emergency Lockdown Initiated' },
    });
  };

  const handleReleaseLockdown = () => {
    setIsLockdownActive(false);
    setBroadcastSent(false);
    erpEventEngine.publish({
      eventType: 'EMERGENCY_LOCKDOWN_RELEASED',
      campusId: 'c3d782a9-a50b-4708-a3fc-6b146f456662',
      actor: { userId: 'usr-admin', name: 'Principal Desk', role: 'Principal' },
      entity: { type: 'CAMPUS', id: 'c3d782a9-a50b-4708-a3fc-6b146f456662' },
      metadata: { reason: 'All Clear Declared' },
    });
  };

  const handleSendBroadcast = () => {
    setBroadcastSent(true);
    alert('🚨 Emergency broadcast dispatched to 1,250 parents and 85 staff via SMS, WhatsApp, and Mobile Push.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <Link href="/admin/operations" className="flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900">
          <ArrowLeft className="w-4 h-4" /> Back to Operations
        </Link>
        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
          isLockdownActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'
        }`}>
          {isLockdownActive ? '🚨 CAMPUS LOCKDOWN ACTIVE' : 'NORMAL STATUS (NO THREAT)'}
        </span>
      </div>

      {/* Emergency Control Center Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg transition-all ${
        isLockdownActive ? 'bg-rose-950 border-rose-600 text-white' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-8 h-8 ${isLockdownActive ? 'text-rose-400' : 'text-rose-600'}`} />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Institutional Emergency Command Mode</h1>
            </div>
            <p className={`text-xs sm:text-sm font-medium ${isLockdownActive ? 'text-rose-200' : 'text-stone-500'}`}>
              Instant lockdown activation, perimeter security gates, camera token revocation, and live muster roll.
            </p>
          </div>

          <div>
            {!isLockdownActive ? (
              <button
                onClick={handleTriggerLockdown}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
              >
                <Lock className="w-5 h-5" />
                ENGAGE CAMPUS LOCKDOWN
              </button>
            ) : (
              <button
                onClick={handleReleaseLockdown}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                DECLARE ALL CLEAR (RELEASE)
              </button>
            )}
          </div>
        </div>

        {/* Status Indicators during Lockdown */}
        {isLockdownActive && (
          <div className="mt-6 pt-6 border-t border-rose-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-rose-200">
            <div className="p-3 bg-rose-900/50 rounded-xl border border-rose-700 flex items-center gap-2">
              <VideoOff className="w-4 h-4 text-rose-400" />
              <span>CCTV Stream Tokens: <strong>REVOKED</strong></span>
            </div>
            <div className="p-3 bg-rose-900/50 rounded-xl border border-rose-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Perimeter Gates: <strong>SEALED</strong></span>
            </div>
            <div className="p-3 bg-rose-900/50 rounded-xl border border-rose-700 flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Emergency Channel: <strong>ACTIVE</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Live Accountability Muster Roll */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-stone-400">Accounted Students on Campus</span>
          <h3 className="text-3xl font-black text-emerald-600">1,178</h3>
          <p className="text-xs text-stone-500 font-semibold">In 42 Classrooms with Assigned Faculty</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-stone-400">Staff Accounted For</span>
          <h3 className="text-3xl font-black text-blue-600">82 Members</h3>
          <p className="text-xs text-stone-500 font-semibold">100% of on-duty staff checked in</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-stone-400">Visitors Inside Campus</span>
          <h3 className="text-3xl font-black text-amber-600">5 Persons</h3>
          <p className="text-xs text-amber-800 font-semibold">Security escorting to Main Reception</p>
        </div>
      </div>

      {/* Emergency Broadcast Broadcaster */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
          <Radio className="w-5 h-5 text-rose-600" /> Emergency Broadcast Transmitter (SMS • WhatsApp • Push)
        </h3>
        <textarea
          value={broadcastMessage}
          onChange={(e) => setBroadcastMessage(e.target.value)}
          rows={3}
          className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-stone-400 font-medium">Recipients: 1,250 Parents • 85 Staff • Transport Fleet</span>
          <button
            onClick={handleSendBroadcast}
            disabled={broadcastSent}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-stone-300 text-white text-xs font-black rounded-xl transition shadow-sm"
          >
            <Send className="w-4 h-4" />
            {broadcastSent ? 'BROADCAST DISPATCHED' : 'DISPATCH EMERGENCY BROADCAST'}
          </button>
        </div>
      </div>

    </div>
  );
}
