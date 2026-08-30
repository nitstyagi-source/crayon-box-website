import React from 'react';
import Link from 'next/link';
import {
  Users, Target, TrendingUp, Sparkles, Layers, ArrowRight,
  CheckCircle2, Clock, BarChart3, ChevronRight, Database,
  ArrowUpRight, AlertCircle, FileText
} from 'lucide-react';
import { getAdmissionsPerformanceAnalyticsAction } from '@/app/actions/admissions-analytics';
import { getAdmissions } from '@/app/actions/forms';
import { AdmissionsFunnelChart } from '@/components/admissions/analytics/AdmissionsFunnelChart';
import { ManagementInsightsCard } from '@/components/admissions/analytics/ManagementInsightsCard';

export const dynamic = 'force-dynamic';

export default async function AdmissionsExecutiveDashboard() {
  const [analytics, rawApplications] = await Promise.all([
    getAdmissionsPerformanceAnalyticsAction(),
    getAdmissions()
  ]);

  const defaultKpis = {
    totalEnquiries: 0,
    totalApplications: 0,
    totalAdmissions: 0,
    conversionRate: 0,
    applicationRate: 0,
    lostEnquiries: 0,
    growth: { enquiries: 0, applications: 0, admissions: 0, conversionPp: 0, lostDelta: 0 }
  };

  const kpis = analytics && analytics.success && analytics.kpis ? analytics.kpis : defaultKpis;
  const funnelStages = analytics && analytics.success && analytics.funnelStages ? analytics.funnelStages : [];
  const managementInsights = analytics && analytics.success && analytics.managementInsights ? analytics.managementInsights : null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-20">
      
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Principal &amp; Management Cockpit
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">Session 2026–2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Enquiry Performance &amp; Admissions Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real-time enrollment health, funnel velocity, capacity forecasting, and decision intelligence.
          </p>
        </div>

        {/* Action Button Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/admissions/analytics"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" /> Open Analytics Command Center →
          </Link>
          <Link
            href="/admin/admissions/pipeline"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" /> Kanban Pipeline
          </Link>
          <Link
            href="/admin/admissions/crm"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1"
          >
            <Users className="w-3.5 h-3.5 text-slate-600" /> Leads CRM
          </Link>
        </div>
      </div>

      {/* KPI Hero Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Enquiries</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{kpis.totalEnquiries}</span>
            <span className="text-[11px] font-black text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Live
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">Registered inquiries</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Applications</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">{kpis.totalApplications}</span>
            <span className="text-[11px] font-black text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Live
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">{kpis.applicationRate}% app rate</span>
        </div>

        <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl border border-emerald-200 shadow-xs space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">Admissions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">{kpis.totalAdmissions}</span>
            <span className="text-[11px] font-black text-emerald-700 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Live
            </span>
          </div>
          <span className="text-[10px] text-emerald-700/80 font-bold block">Confirmed enrolled</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Conversion Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{kpis.conversionRate}%</span>
            <span className="text-[11px] font-black text-emerald-600">
              Live
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">Enquiries to admissions</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Application Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{kpis.applicationRate}%</span>
            <span className="text-[10px] font-bold text-slate-400">Enq → App</span>
          </div>
          <span className="text-[10px] text-slate-400 block">{kpis.totalApplications} submitted</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lost Enquiries</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-rose-700 font-mono">{kpis.lostEnquiries}</span>
            <span className="text-[11px] font-black text-slate-400">
              Live
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">Inactive / Rejected</span>
        </div>
      </div>

      {/* AI Management Insights Digest */}
      {managementInsights && (
        <ManagementInsightsCard insights={managementInsights} />
      )}

      {/* Conversion Funnel */}
      {funnelStages && funnelStages.length > 0 && (
        <AdmissionsFunnelChart stages={funnelStages} />
      )}

      {/* Quick Navigation Footer Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-extrabold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" /> Looking for deeper admissions insights?
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            Access Source-wise ROI, Counsellor Response Times, Class Demand vs Capacity, and Legacy Admissions Importer.
          </p>
        </div>
        <Link
          href="/admin/admissions/analytics"
          className="px-5 py-2.5 bg-white text-slate-900 font-extrabold rounded-2xl text-xs hover:bg-slate-100 transition shadow-md whitespace-nowrap"
        >
          Open Complete Analytics Hub →
        </Link>
      </div>

    </div>
  );
}
