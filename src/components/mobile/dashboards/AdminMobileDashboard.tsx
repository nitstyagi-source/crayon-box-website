"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, UserCheck, Wallet, ArrowUpRight, CheckCircle, 
  AlertTriangle, Shield, Bus, PlusCircle, FileText, 
  UserPlus, Receipt, Bell, QrCode, Search, ChevronRight, TrendingUp
} from "lucide-react";
import { useMobileAuth } from "../MobileAuthProvider";
import { SchoolLogo } from "@/components/ui/SchoolLogo";

export default function AdminMobileDashboard() {
  const { user } = useMobileAuth();

  return (
    <div className="space-y-6 pb-24">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-5 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
              <Shield className="w-3 h-3" /> Executive Management
            </span>
            <span className="text-xs text-slate-400 font-mono">22 Aug 2026</span>
          </div>

          <div className="flex items-center gap-3.5">
            <SchoolLogo size="lg" shape="square" className="bg-white/95 p-1 shadow-md" />
            <div>
              <h2 className="text-xl font-bold font-serif leading-tight">Welcome, {user?.fullName || "Director"}</h2>
              <p className="text-xs text-slate-300 mt-0.5">Campus Snapshot &bull; Main Campus</p>
            </div>
          </div>

          {/* Quick Stat Pill Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] text-slate-300 font-medium">Today's Collection</span>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">₹1,84,500</div>
              <span className="text-[10px] text-emerald-300/80 flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> +14.2% vs yesterday
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] text-slate-300 font-medium">Student Attendance</span>
              <div className="text-lg font-bold text-amber-300 mt-0.5">94.8%</div>
              <span className="text-[10px] text-slate-300">1,185 / 1,250 Present</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
          <span className="text-xs text-slate-400 font-medium">Executive Shortcuts</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <Link 
            href="/admin/admissions/pipeline"
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">+ Admission</span>
            <span className="text-[10px] text-slate-400">14 Inquiries</span>
          </Link>

          <Link 
            href="/admin/finance/expenses"
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">+ Expense</span>
            <span className="text-[10px] text-slate-400">Voucher</span>
          </Link>

          <Link 
            href="/mobile/approvals"
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform relative">
              <CheckCircle className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
                4
              </span>
            </div>
            <span className="text-xs font-bold text-slate-700">Approvals</span>
            <span className="text-[10px] text-amber-600 font-semibold">4 Actionable</span>
          </Link>

          <Link 
            href="/admin/visitors"
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">+ Visitor</span>
            <span className="text-[10px] text-slate-400">Gate Pass</span>
          </Link>

          <Link 
            href="/mobile/reports"
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">MIS Reports</span>
            <span className="text-[10px] text-slate-400">PDF / Excel</span>
          </Link>

          <Link 
            href="/mobile/qr-scanner"
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:bg-slate-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">QR Engine</span>
            <span className="text-[10px] text-slate-400">Verify Pass</span>
          </Link>
        </div>
      </div>

      {/* Operational Highlights Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 px-1">Campus Operations Feed</h3>
        
        <div className="space-y-2.5">
          {/* Item 1 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Faculty & Staff Present</h4>
                <p className="text-[11px] text-slate-500">68 of 72 Staff clocked in &bull; 4 on planned leave</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              94.4%
            </span>
          </div>

          {/* Item 2 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Bus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Transport Fleet Active</h4>
                <p className="text-[11px] text-slate-500">12 Buses on afternoon routes &bull; GPS tracking active</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Live GPS
            </span>
          </div>

          {/* Item 3 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Pending Approvals Queue</h4>
                <p className="text-[11px] text-slate-500">2 Fee concessions &bull; 1 Expense voucher &bull; 1 Leave</p>
              </div>
            </div>
            <Link href="/mobile/approvals" className="text-xs font-bold text-amber-600 hover:underline flex items-center">
              Review <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
