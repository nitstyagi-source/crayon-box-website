import React from 'react';
import Link from 'next/link';
import {
  Users, Target, TrendingUp, Sparkles, Layers, ArrowRight,
  CheckCircle2, Clock, BarChart3, ChevronRight, Database,
  ArrowUpRight, AlertCircle, FileText, UserCheck, Phone, GraduationCap, Receipt
} from 'lucide-react';
import { getAdmissionsPerformanceAnalyticsAction } from '@/app/actions/admissions-analytics';
import { getAdmissionsPipelineApplicationsAction } from '@/app/actions/admissions';
import { getFilteredUniversalStudentsAction } from '@/app/actions/universal-student-actions';
import { AdmissionsFunnelChart } from '@/components/admissions/analytics/AdmissionsFunnelChart';
import { ManagementInsightsCard } from '@/components/admissions/analytics/ManagementInsightsCard';

export const dynamic = 'force-dynamic';

export default async function AdmissionsExecutiveDashboard() {
  const [analytics, pipelineRes, studentsRes] = await Promise.all([
    getAdmissionsPerformanceAnalyticsAction(),
    getAdmissionsPipelineApplicationsAction(),
    getFilteredUniversalStudentsAction({ status: 'ACTIVE' })
  ]);

  const enrolledStudents = studentsRes && studentsRes.success ? studentsRes.data : [];
  const pipelineApps = pipelineRes && pipelineRes.success ? pipelineRes.data : [];
  const admittedCandidates = pipelineApps.filter((a: any) => 
    a.status.includes('APPROV') || a.status.includes('ADMIT') || a.status.includes('ENROLL')
  );

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

      {/* Confirmed Admitted & Enrolled Students Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Admissions Master
              </span>
              <span className="text-slate-400 text-xs font-semibold">({enrolledStudents.length} Enrolled • {admittedCandidates.length} Admitted)</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Confirmed Admitted &amp; Enrolled Candidates
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Candidates who transitioned from initial enquiry to confirmed admission and enrolled student master records.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/students"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <Users className="w-3.5 h-3.5" /> Full Student Directory →
            </Link>
            <Link
              href="/admin/admissions/pipeline"
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-blue-200"
            >
              <Layers className="w-3.5 h-3.5" /> Kanban Desk
            </Link>
          </div>
        </div>

        {/* Admitted & Enrolled Candidates Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                <th className="py-3.5 px-6">Student Name &amp; Admission #</th>
                <th className="py-3.5 px-4">Class &amp; Section</th>
                <th className="py-3.5 px-4">Parent / Contact</th>
                <th className="py-3.5 px-4">Admission Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {enrolledStudents.length === 0 && admittedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No confirmed admissions yet.</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Move enquiry cards to "Admitted / Approved" in the pipeline to enroll students.</p>
                  </td>
                </tr>
              ) : (
                enrolledStudents.map((stu: any) => (
                  <tr key={stu.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs shrink-0 border border-blue-200">
                          {stu.first_name?.[0] || 'S'}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block group-hover:text-blue-600 transition">
                            {stu.first_name} {stu.last_name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                            {stu.admission_number || stu.admission_no || 'ADM-2026'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-800 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-xs">
                        {stu.class_name || 'Class 5'} {stu.section_name ? `(${stu.section_name})` : ''}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-800 block text-xs">
                        {stu.guardian_first ? `${stu.guardian_first} ${stu.guardian_last || ''}`.trim() : (stu.family_name || 'Parent')}
                      </span>
                      {stu.guardian_phone && (
                        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" /> {stu.guardian_phone}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ENROLLED &amp; ACTIVE
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/admin/students"
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          View 360° <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href="/admin/finance/receipts"
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-emerald-200"
                        >
                          <Receipt className="w-3 h-3" /> Fee Receipt
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
