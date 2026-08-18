"use client";

import Link from "next/link";
import { Users, MapPin, Calculator, ShieldAlert, ArrowRight } from "lucide-react";

export default function HRMSLandingHub() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><Users className="w-8 h-8 text-indigo-600" /> HR Command Center</h1>
          <p className="text-slate-500 mt-1">Manage staff attendance anomalies, GPS geofencing, and multi-step payroll execution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Module A: Attendance Heatmap */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 group hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
            <MapPin className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Module A: Attendance Heatmap</h2>
          <p className="text-slate-600 mb-8 flex-1">Monitor daily staff check-ins via the calendar grid. Instantly identify Geofence anomalies, spoofed GPS logs, and TOTP verification failures.</p>
          
          <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100">
            <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">2 Anomalies Detected Today</p>
              <p className="text-xs text-slate-500">Requires HR manual review.</p>
            </div>
          </div>

          <Link href="/admin/hr/attendance" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-auto">
            Open Attendance Grid <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Module B: Payroll Engine */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 group hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
            <Calculator className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Module B: Payroll Engine</h2>
          <p className="text-slate-600 mb-8 flex-1">Execute the multi-step financial pipeline. Auto-reconcile LWP deductions from attendance logs, generate PDF payslips, and export unified Bank CSVs.</p>
          
          <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
               <span className="font-bold">!</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">August 2026 Pending</p>
              <p className="text-xs text-slate-500">142 staff ledgers await processing.</p>
            </div>
          </div>

          <Link href="/admin/hr/payroll" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mt-auto">
            Launch Payroll Engine <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
