"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, ArrowLeft, Download, Wallet, 
  Users, CheckCircle2, TrendingUp, Calendar, ChevronRight
} from "lucide-react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";

export default function MobileReportsPage() {
  const { user } = useMobileAuth();

  const REPORTS = [
    { title: "Today's Fee Collection", value: "₹1,84,500", metric: "48 Transactions", icon: Wallet, color: "text-emerald-600 bg-emerald-50" },
    { title: "Month-to-Date Collections", value: "₹42,80,000", metric: "92% of target", icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
    { title: "Outstanding Fee Balances", value: "₹6,15,000", metric: "84 overdue accounts", icon: FileText, color: "text-rose-600 bg-rose-50" },
    { title: "Student Daily Attendance", value: "94.8%", metric: "1,185 / 1,250 present", icon: Users, color: "text-amber-600 bg-amber-50" },
    { title: "Staff Attendance & Leave", value: "94.4%", metric: "68 / 72 present", icon: CheckCircle2, color: "text-purple-600 bg-purple-50" },
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
            <h1 className="font-bold text-base text-slate-900 leading-tight">Executive MIS Reports</h1>
            <p className="text-[11px] text-slate-500">Live Financial & Operational Feeds</p>
          </div>
        </div>

        <button 
          onClick={() => window.print()}
          className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs hover:bg-slate-50"
        >
          <Download className="w-3.5 h-3.5" /> PDF
        </button>
      </div>

      {/* Reports Grid */}
      <div className="space-y-3">
        {REPORTS.map(rep => {
          const Icon = rep.icon;
          return (
            <div key={rep.title} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${rep.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{rep.title}</h4>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{rep.value}</div>
                  <span className="text-[10px] text-slate-500 font-medium">{rep.metric}</span>
                </div>
              </div>

              <button 
                onClick={() => alert(`Exporting ${rep.title} as CSV/PDF...`)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                title="Export"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
