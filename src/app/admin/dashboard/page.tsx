"use client";

import { useState, useEffect } from "react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  Users, UserPlus, AlertCircle, IndianRupee, TrendingUp, Filter, 
  GraduationCap, UserMinus, Sparkles, ArrowRight, ShieldCheck, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { getDashboardMetrics } from "@/app/actions/students";
import Link from "next/link";

export default function AdminDashboard() {
  const { activeCampus, activeCampusId } = useCampusContext();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [activeCampusId]);

  async function loadMetrics() {
    setIsLoading(true);
    const res = await getDashboardMetrics(activeCampusId);
    if (res.success && res.data) {
      setMetrics(res.data);
    }
    setIsLoading(false);
  }

  const campusName = activeCampus?.name || "Main Campus";

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Global Command Center</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Operational Dashboard • <span className="text-blue-600 font-bold">{campusName}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/admin/students" 
            className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" /> Student Directory
          </Link>
          <Link 
            href="/admin/finance/invoices" 
            className="bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <IndianRupee className="w-3.5 h-3.5 text-green-600" /> Finance Desk
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Active Enrollments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Students</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-5 h-5" /></div>
          </div>
          <h3 className="text-3xl font-black text-slate-900">
            {isLoading ? "..." : metrics?.totalEnrollments ?? 0}
          </h3>
          <p className="text-xs text-orange-600 font-bold mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> {metrics?.ewsCount ?? 0} EWS Category Students
          </p>
        </div>

        {/* 2. Former / Left Students */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Former / Left (TC)</p>
            <div className="p-2 bg-stone-100 text-stone-600 rounded-xl"><UserMinus className="w-5 h-5" /></div>
          </div>
          <h3 className="text-3xl font-black text-stone-800">
            {isLoading ? "..." : metrics?.formerStudentsCount ?? 0}
          </h3>
          <p className="text-xs text-stone-400 font-medium mt-2">Archived Alumni / Withdrawn</p>
        </div>

        {/* 3. New Admissions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Admissions Pipeline</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><UserPlus className="w-5 h-5" /></div>
          </div>
          <h3 className="text-3xl font-black text-slate-900">
            {isLoading ? "..." : metrics?.admissionsCount ?? 0}
          </h3>
          <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 2026-2027 Session Active
          </p>
        </div>

        {/* 4. Total Collections */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-green-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Fee Collections</p>
            <div className="p-2 bg-green-50 text-green-700 rounded-xl"><IndianRupee className="w-5 h-5" /></div>
          </div>
          <h3 className="text-3xl font-black text-green-700">
            ₹{isLoading ? "..." : Number(metrics?.totalCollections ?? 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-orange-600 font-bold mt-2">
            ₹{Number(metrics?.totalPending ?? 0).toLocaleString('en-IN')} Outstanding
          </p>
        </div>

      </div>

      {/* Main Content Grid: Class Distribution & Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 5 Cols: Class-wise Student Distribution */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Class-wise Enrollment</h2>
              <p className="text-xs text-slate-400">Active student count by grade.</p>
            </div>
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>

          {isLoading ? (
            <p className="text-xs font-bold text-stone-400 py-6 text-center">Calculating distribution...</p>
          ) : metrics?.classDistribution && metrics.classDistribution.length > 0 ? (
            <div className="space-y-4">
              {metrics.classDistribution.map((item: any) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      {item.name}
                    </span>
                    <span>{item.count} student{item.count !== 1 ? 's' : ''} ({item.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(10, item.pct)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-400 text-xs font-medium">
              No active students assigned to classes yet.
            </div>
          )}
        </div>

        {/* Right 7 Cols: Recent Student Admissions */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Latest Enrolled Students</h2>
              <p className="text-xs text-slate-400">Recently registered student files.</p>
            </div>
            <Link href="/admin/students" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <p className="text-xs font-bold text-stone-400 py-6 text-center">Loading enrollments...</p>
          ) : metrics?.recentStudents && metrics.recentStudents.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {metrics.recentStudents.map((st: any) => (
                <div key={st.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {st.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{st.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">Adm: {st.admissionNo} • Class: {st.className}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {st.category === 'EWS' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                        EWS
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      st.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {st.status}
                    </span>
                    <Link href={`/admin/students/${st.id}`} className="text-stone-400 hover:text-blue-600 p-1">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-400 text-xs">
              No students enrolled yet.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
