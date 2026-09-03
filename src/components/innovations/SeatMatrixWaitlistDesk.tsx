"use client";

import React, { useState, useEffect } from 'react';
import { Layers, Users, AlertCircle, CheckCircle2, TrendingUp, RefreshCw, Filter } from 'lucide-react';
import {
  getSeatInventoryMatrixAction,
  checkSeatAvailabilityAndReserveAction
} from '@/app/actions/seat-matrix-actions';

export const SeatMatrixWaitlistDesk: React.FC = () => {
  const [data, setData] = useState<any>({ matrices: [], totalSeats: 0, totalAdmitted: 0, totalWaitlisted: 0, overallFillRate: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [testClass, setTestClass] = useState('Nursery');
  const [testQuota, setTestQuota] = useState('RTE_EWS');
  const [testNotice, setTestNotice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const res = await getSeatInventoryMatrixAction('2026-2027');
      if (res.success) setData(res);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSimulateIntake = async () => {
    setTestNotice(null);
    const res = await checkSeatAvailabilityAndReserveAction(testClass, testQuota);
    if (res.success) {
      setTestNotice(res.message || null);
      await loadData();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HUD Ribbon */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Real-Time Quota &amp; Intake Capacity Engine</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900">Dynamic Seat Inventory Matrix &amp; Waitlist Radar</h2>
          <p className="text-xs text-stone-500 mt-0.5">Automated seat decrementing across General, RTE/EWS, and Staff quotas with auto-waitlist queuing.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Capacity</span>
            <strong className="text-stone-900 font-bold text-sm">{data.totalSeats} Seats</strong>
          </div>
          <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Filled ({data.overallFillRate}%)</span>
            <strong className="text-emerald-900 font-bold text-sm">{data.totalAdmitted} Admitted</strong>
          </div>
          <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-amber-600 block">In Queue</span>
            <strong className="text-amber-900 font-bold text-sm">{data.totalWaitlisted} Waitlisted</strong>
          </div>
        </div>
      </div>

      {testNotice && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{testNotice}</span>
        </div>
      )}

      {/* Grid: Quotas Matrix & Real-Time Intake Test */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Quotas Table */}
        <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900">Seat Inventory Status (Session 2026-27)</h3>
            <span className="text-[11px] text-stone-400">Auto-locks when filled</span>
          </div>

          <div className="space-y-3">
            {data.matrices.map((m: any) => (
              <div key={m.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="text-stone-900 font-bold text-sm">{m.className}</strong>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-stone-200 text-stone-700">
                      {m.quotaType.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    m.status === 'WAITLIST_ONLY'
                      ? 'bg-rose-100 text-rose-800'
                      : m.status === 'FAST_FILLING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      m.fillRatePercentage >= 100 ? 'bg-rose-500' : m.fillRatePercentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${m.fillRatePercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                  <span>Admitted: <strong className="text-stone-800">{m.admittedSeats}</strong> / {m.totalSeats} seats</span>
                  <span>Available: <strong className="text-emerald-700 font-bold">{m.availableSeats}</strong></span>
                  <span>Waitlist: <strong className="text-amber-700 font-bold">{m.waitlistedCount}</strong> candidates</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Interactive Quota Simulator */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900">Intake Capacity Simulator</h3>
            <p className="text-[11px] text-stone-400">Test real-time seat decrementing &amp; waitlist tagging</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-500 font-bold mb-1">Target Class</label>
              <select
                value={testClass}
                onChange={(e) => setTestClass(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-none"
              >
                <option value="Nursery">Nursery</option>
                <option value="KG / Prep">KG / Prep</option>
                <option value="Class 1">Class 1</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-500 font-bold mb-1">Quota Pool</label>
              <select
                value={testQuota}
                onChange={(e) => setTestQuota(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-none"
              >
                <option value="GENERAL">General Quota (70%)</option>
                <option value="RTE_EWS">RTE / EWS Quota (25%)</option>
                <option value="MANAGEMENT_STAFF">Management / Staff Quota (5%)</option>
              </select>
            </div>

            <button
              onClick={handleSimulateIntake}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition cursor-pointer shadow-xs"
            >
              Simulate Incoming Admission Intake
            </button>
            
            <p className="text-[10px] text-stone-400 leading-relaxed">
              *If the quota is full (e.g. Nursery RTE_EWS at 12/12 seats), the engine automatically records the applicant as <strong>WAITLISTED #N</strong> without discarding the lead.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
