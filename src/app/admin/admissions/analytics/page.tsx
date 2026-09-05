"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Users, Target, Layers, Globe, Award,
  Sparkles, Filter, Calendar, Building, ChevronRight, ArrowUpRight,
  Database, RefreshCw, BarChart3, AlertCircle, FileText, CheckCircle2,
  ArrowRight, ShieldCheck, Download
} from 'lucide-react';
import { getAdmissionsPerformanceAnalyticsAction, AnalyticsFilterParams } from '@/app/actions/admissions-analytics';
import { AdmissionsFunnelChart } from '@/components/admissions/analytics/AdmissionsFunnelChart';
import { ClassDemandBarChart } from '@/components/admissions/analytics/ClassDemandBarChart';
import { SourcePerformanceMatrix } from '@/components/admissions/analytics/SourcePerformanceMatrix';
import { CounsellorScorecardTable } from '@/components/admissions/analytics/CounsellorScorecardTable';
import { ManagementInsightsCard } from '@/components/admissions/analytics/ManagementInsightsCard';
import { LegacyImportModal } from '@/components/admissions/analytics/LegacyImportModal';
import { useInstitution } from '@/components/providers/InstitutionContext';

export default function AdmissionsAnalyticsCommandCenter() {
  const { institutionsList } = useInstitution();
  const [filters, setFilters] = useState<AnalyticsFilterParams>({
    institutionCode: 'ALL',
    academicSession: '2026-2027',
    period: 'ALL',
    compareWith: 'PREV_ACADEMIC_YEAR'
  });

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLegacyModalOpen, setIsLegacyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FUNNEL' | 'SOURCES' | 'DEMAND' | 'COUNSELLORS' | 'LOST' | 'TRUST'>('OVERVIEW');

  const fetchAnalytics = async () => {
    setIsLoading(true);
    const res = await getAdmissionsPerformanceAnalyticsAction(filters);
    if (res.success) {
      setAnalyticsData(res);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  if (isLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Loading Admissions Intelligence &amp; Performance Metrics...
          </p>
        </div>
      </div>
    );
  }

  const { kpis, yoyComparison, executiveSummaryText, funnelStages, monthlyTrends, sourceMatrix, classDemand, counsellorScorecard, lostReasons, trustBenchmark, managementInsights } = analyticsData;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-20">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Admissions Intelligence Command Center
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">Executive Decision Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Enquiry Performance &amp; Admissions Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Multi-institution funnel intelligence, source attribution, capacity forecasting, and YoY benchmarking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsLegacyModalOpen(true)}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" /> Legacy Data Importer
          </button>
          <Link
            href="/admin/admissions/crm"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            Leads CRM <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/admin/admissions/pipeline"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1"
          >
            Kanban Board <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Global Filter & Comparison Selector Bar */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Filter className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            Admissions Analytics Global Filters &amp; Comparison Mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Institution Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Institution / Campus
            </label>
            <select
              value={filters.institutionCode}
              onChange={(e) => setFilters({ ...filters, institutionCode: e.target.value })}
              className="w-full text-xs font-bold px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">🏢 All Institutions (Trust HQ Aggregate)</option>
              {institutionsList.map((inst) => (
                <option key={inst.code} value={inst.code}>
                  {inst.code} - {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Session */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Academic Session
            </label>
            <select
              value={filters.academicSession}
              onChange={(e) => setFilters({ ...filters, academicSession: e.target.value })}
              className="w-full text-xs font-bold px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="2026-2027">2026–2027 (Active Intake)</option>
              <option value="2025-2026">2025–2026</option>
              <option value="2024-2025">2024–2025 (Historical)</option>
            </select>
          </div>

          {/* Period / Months */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Period / Month Span
            </label>
            <select
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              className="w-full text-xs font-bold px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">Full Academic Year (Apr – Mar)</option>
              <option value="APR-AUG">Apr 2026 – Aug 2026 (Peak Admission Window)</option>
              <option value="SEP-DEC">Sep 2026 – Dec 2026 (Mid-Term Inquiries)</option>
              <option value="JAN-MAR">Jan 2027 – Mar 2027 (Late Registrations)</option>
            </select>
          </div>

          {/* Comparison Mode */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Compare With
            </label>
            <select
              value={filters.compareWith}
              onChange={(e) => setFilters({ ...filters, compareWith: e.target.value as any })}
              className="w-full text-xs font-bold px-3 py-2 bg-blue-950 border border-blue-600/50 rounded-xl text-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="PREV_ACADEMIC_YEAR">📊 Previous Academic Year (2025–26)</option>
              <option value="YOY_SAME_MONTH">🗓️ Same Month Last Year</option>
              <option value="PREV_MONTH">⏪ Previous Month</option>
              <option value="LEGACY">📜 Historical Legacy Baseline</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6 Hero KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Enquiries */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Enquiries</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{kpis.totalEnquiries}</span>
            <span className="text-[11px] font-black text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Live
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">Registered enquiries</span>
        </div>

        {/* Applications */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Applications</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">{kpis.totalApplications}</span>
            <span className="text-[11px] font-black text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Live
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">{kpis.applicationRate}% app rate</span>
        </div>

        {/* Confirmed Admissions */}
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl border border-emerald-200 shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">Confirmed Admissions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">{kpis.totalAdmissions}</span>
            <span className="text-[11px] font-black text-emerald-700 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Live
            </span>
          </div>
          <span className="text-[10px] text-emerald-700/80 font-bold block">Confirmed enrolled</span>
        </div>

        {/* Conversion Rate */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Conversion Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{kpis.conversionRate}%</span>
            <span className="text-[11px] font-black text-emerald-600">
              Live
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">Enquiries to admissions</span>
        </div>

        {/* Application Rate */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Application Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{kpis.applicationRate}%</span>
            <span className="text-[10px] font-bold text-slate-400">Enq → App</span>
          </div>
          <span className="text-[10px] text-slate-400 block">{kpis.totalApplications} submitted</span>
        </div>

        {/* Lost Enquiries */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
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

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { key: 'OVERVIEW', label: '📊 Executive Overview & YoY' },
          { key: 'FUNNEL', label: '🎯 7-Stage Funnel' },
          { key: 'SOURCES', label: '🌐 Source Performance Matrix' },
          { key: 'DEMAND', label: '🏫 Class Demand & Capacity' },
          { key: 'COUNSELLORS', label: '👩‍💼 Counsellor Scorecard' },
          { key: 'LOST', label: '⚠️ Lost Lead Intelligence' },
          { key: 'TRUST', label: '🏛️ Multi-Institution Benchmark' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW & YoY */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Year-on-Year Variance Table + Natural Language Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Year-on-Year Performance Matrix</h3>
                  <p className="text-xs text-slate-500 font-medium">Session 2025–26 vs Session 2026–27 variance</p>
                </div>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  Verified Data
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Intake Metric</th>
                      <th className="px-4 py-3 text-right">2025–26</th>
                      <th className="px-4 py-3 text-right">2026–27</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Growth / Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {yoyComparison.map((r: any) => (
                      <tr key={r.metric} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3.5 font-bold text-slate-900">{r.metric}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-500">{r.prev}</td>
                        <td className="px-4 py-3.5 text-right font-mono font-black text-slate-900">{r.curr}</td>
                        <td className="px-4 py-3.5 text-right font-mono font-black text-emerald-600">{r.change}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Natural Language Executive Takeaway Callout */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-950 font-medium flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-900 font-bold mb-0.5">Automated Intelligence Takeaway:</strong>
                  {executiveSummaryText}
                </div>
              </div>
            </div>

            {/* Monthly Trend Progress */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-extrabold text-slate-900">Monthly Admissions Trend</h3>
                <p className="text-xs text-slate-500 font-medium">Peak enrollment velocity (Apr – Aug)</p>
              </div>

              <div className="space-y-3.5">
                {monthlyTrends.map((m: any) => (
                  <div key={m.month} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">{m.month} 2026</span>
                      <span className="font-mono text-emerald-700">{m.current} Admissions ({m.conversion}% conv)</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(m.current / 35) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block text-right font-mono">vs {m.previous} in 2025</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI 4-Quadrant Management Insights */}
          <ManagementInsightsCard insights={managementInsights} />

          {/* Funnel Preview */}
          <AdmissionsFunnelChart stages={funnelStages} />
        </div>
      )}

      {/* TAB CONTENT: 2. FUNNEL */}
      {activeTab === 'FUNNEL' && (
        <AdmissionsFunnelChart stages={funnelStages} />
      )}

      {/* TAB CONTENT: 3. SOURCES */}
      {activeTab === 'SOURCES' && (
        <SourcePerformanceMatrix sources={sourceMatrix} />
      )}

      {/* TAB CONTENT: 4. DEMAND */}
      {activeTab === 'DEMAND' && (
        <ClassDemandBarChart data={classDemand} />
      )}

      {/* TAB CONTENT: 5. COUNSELLORS */}
      {activeTab === 'COUNSELLORS' && (
        <CounsellorScorecardTable counsellors={counsellorScorecard} />
      )}

      {/* TAB CONTENT: 6. LOST ENQUIRIES */}
      {activeTab === 'LOST' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Lost Enquiry Intelligence &amp; Objection Diagnostics
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Understand why prospective candidates drop off to remediate pricing, transport, or competitor friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lostReasons.map((lr: any) => (
              <div key={lr.reason} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{lr.reason}</span>
                  <span className="font-mono font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    {lr.percentage}% ({lr.count} leads)
                  </span>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${lr.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 7. TRUST BENCHMARK */}
      {activeTab === 'TRUST' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Multi-Institution Trust Benchmark Matrix
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Comparative enrollment yield and seat capacity utilization across all 4 institutions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3.5 rounded-l-xl">Campus Institution</th>
                  <th className="px-4 py-3.5 text-right">Enquiries</th>
                  <th className="px-4 py-3.5 text-right">Applications</th>
                  <th className="px-4 py-3.5 text-right">Admissions</th>
                  <th className="px-4 py-3.5 text-right">Conversion Rate</th>
                  <th className="px-4 py-3.5 text-right">Capacity</th>
                  <th className="px-4 py-3.5 text-right rounded-r-xl">Seat Fill Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {trustBenchmark.map((tb: any) => (
                  <tr key={tb.code} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      <span className="font-mono text-blue-700 font-black mr-2">[{tb.code}]</span>
                      <span>{tb.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{tb.enquiries}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-600">{tb.applications}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-emerald-700">{tb.admissions}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-slate-900">{tb.conversion}%</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-500">{tb.capacity} seats</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black rounded-full text-[10px]">
                        {tb.utilization}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legacy Import Modal */}
      <LegacyImportModal
        isOpen={isLegacyModalOpen}
        onClose={() => setIsLegacyModalOpen(false)}
        onSuccess={() => fetchAnalytics()}
      />

    </div>
  );
}
