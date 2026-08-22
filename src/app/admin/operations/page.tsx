"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity, Users, UserCheck, Bus, Clock, ShieldAlert,
  AlertTriangle, CheckCircle2, RefreshCw, Send, PhoneCall,
  BellRing, Radio, Sparkles, KeyRound
} from 'lucide-react';

export default function OperationsCommandCenterPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header with 1-Tap Emergency Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Real-Time Campus Telemetry
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Today: August 22, 2026</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Daily Operations Command Center</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Morning headcounts, active transport fleet radar, faculty substitutions, and campus security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/emergency"
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-2xl transition shadow-md shadow-rose-200 animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            🚨 EMERGENCY LOCKDOWN
          </Link>
        </div>
      </div>

      {/* TODAY AT SCHOOL Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Student Attendance */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-black uppercase tracking-wider">Students Present</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><UserCheck className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-stone-900">1,178 <span className="text-xs font-bold text-stone-400">/ 1,250</span></h3>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
            <span>🟢 94.2% Attendance</span>
            <span className="text-stone-300">•</span>
            <span className="text-rose-600 font-normal">72 Absent</span>
          </div>
        </div>

        {/* Staff Attendance */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-black uppercase tracking-wider">Faculty & Staff</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-stone-900">82 <span className="text-xs font-bold text-stone-400">/ 85</span></h3>
          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold">
            <span>🟢 96.5% Present</span>
            <span className="text-stone-300">•</span>
            <span className="text-amber-600 font-normal">3 On Leave</span>
          </div>
        </div>

        {/* Transport Fleet */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-black uppercase tracking-wider">Transport Radar</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Bus className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-amber-600">18 Active</h3>
          <p className="text-xs text-stone-500 font-semibold">17 On Time • <span className="text-rose-600 font-bold">1 Delayed (Route 6)</span></p>
        </div>

        {/* Executive Approvals */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-black uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Clock className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-purple-600">7 Items</h3>
          <p className="text-xs text-purple-800 font-semibold">3 Leaves • 2 Concessions • 2 POs</p>
        </div>
      </div>

      {/* Operational Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Substitutions */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> Today's Faculty Substitutions Required (3)
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-800">Grade 5-A • Mathematics (Period 2)</span>
                <p className="text-stone-500 font-medium">Original: Dr. S. K. Roy (On Medical Leave)</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg">
                Assigned: Dr. Sundaram
              </span>
            </div>
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-800">Grade 9-B • Physics Lab (Period 4)</span>
                <p className="text-stone-500 font-medium">Original: Prof. R. K. Varma (Personal Leave)</p>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg">
                Pending Assignee
              </span>
            </div>
          </div>
        </div>

        {/* Visitors Inside Campus */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" /> Active Campus Visitors (5 Currently Inside)
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="font-black text-emerald-900">Dr. Vivek Oberoi (Parent Inquiry)</span>
                <p className="text-emerald-700 font-medium">Host: Admissions Desk • Entered: 09:15 AM (Pass #VP-2026-081)</p>
              </div>
              <span className="font-mono text-emerald-700 font-bold">Valid till 10:30 AM</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="font-black text-emerald-900">Mr. Harish Kumar (Robotics Equipment Delivery)</span>
                <p className="text-emerald-700 font-medium">Host: Science Dept • Entered: 09:40 AM (Pass #VP-2026-082)</p>
              </div>
              <span className="font-mono text-emerald-700 font-bold">Valid till 11:00 AM</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
