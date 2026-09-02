"use client";

import React from 'react';
import { ArrowDown, AlertTriangle, CheckCircle, TrendingUp, Users, Target } from 'lucide-react';

interface FunnelStage {
  id: string;
  name: string;
  count: number;
  prevCount?: number;
  conversionFromPrev: number;
}

interface AdmissionsFunnelChartProps {
  stages: FunnelStage[];
}

export const AdmissionsFunnelChart: React.FC<AdmissionsFunnelChartProps> = ({ stages = [] }) => {
  const safeStages = Array.isArray(stages) && stages.length > 0 ? stages : [
    { id: '1', name: '1. Initial Enquiry', count: 50, conversionFromPrev: 100 },
    { id: '2', name: '2. Parent Contacted', count: 45, conversionFromPrev: 90 },
    { id: '3', name: '3. Counselling / Visit', count: 35, conversionFromPrev: 77 },
    { id: '4', name: '4. Form Submitted', count: 28, conversionFromPrev: 80 },
    { id: '5', name: '5. Document Verified', count: 22, conversionFromPrev: 78 },
    { id: '6', name: '6. Fee Offer Extended', count: 18, conversionFromPrev: 81 },
    { id: '7', name: '7. Enrolled in School', count: 15, conversionFromPrev: 83 }
  ];

  const maxCount = safeStages[0]?.count || 1;
  const initialCount = safeStages[0]?.count || 1;
  const finalCount = safeStages[safeStages.length - 1]?.count || 0;
  const overallYield = initialCount > 0 ? ((finalCount / initialCount) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
              <Target className="w-3 h-3 text-indigo-600" /> Complete Conversion Pipeline
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">7 Sequential Intake Stages</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Admissions Conversion Funnel
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Stage-by-stage drop-off tracking from initial lead generation to student classroom enrollment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Overall Yield</span>
            <span className="text-lg font-black text-emerald-600">
              {overallYield}%
            </span>
          </div>
        </div>
      </div>

      {/* Visual Funnel Stack */}
      <div className="space-y-3 py-2">
        {safeStages.map((stage, idx) => {
          const widthPct = Math.max(Math.round(((stage.count || 0) / maxCount) * 100), 20);
          const isFinal = idx === safeStages.length - 1;
          const isInitial = idx === 0;
          const prevStageCount = safeStages[idx]?.count || 1;
          const nextStageCount = safeStages[idx + 1]?.count || 0;
          const dropOffCount = Math.max(prevStageCount - nextStageCount, 0);
          const dropOffPct = prevStageCount > 0 ? ((dropOffCount / prevStageCount) * 100).toFixed(1) : '0.0';

          return (
            <div key={stage.id || idx} className="group relative">
              <div className="flex items-center justify-between text-xs mb-1.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                    {stage.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {(stage.count || 0).toLocaleString()}
                  </span>
                  {idx > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      (stage.conversionFromPrev || 0) >= 75
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : (stage.conversionFromPrev || 0) >= 60
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {stage.conversionFromPrev || 0}% conv
                    </span>
                  )}
                </div>
              </div>

              {/* Funnel Bar */}
              <div className="h-10 w-full bg-slate-100/70 rounded-2xl overflow-hidden p-1 flex items-center">
                <div 
                  className={`h-full rounded-xl transition-all duration-700 flex items-center justify-between px-3 text-white font-bold text-xs ${
                    isInitial 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20'
                      : isFinal
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20'
                      : idx === 1
                      ? 'bg-blue-500'
                      : idx === 2
                      ? 'bg-indigo-500'
                      : idx === 3
                      ? 'bg-purple-500'
                      : idx === 4
                      ? 'bg-pink-500'
                      : 'bg-teal-500'
                  }`}
                  style={{ width: `${widthPct}%` }}
                >
                  <span className="text-[10px] font-black tracking-wider opacity-90 truncate">
                    {widthPct}% of initial leads
                  </span>
                  <span className="text-xs font-black">{stage.count || 0}</span>
                </div>
              </div>

              {/* Conversion Step Connector */}
              {idx < safeStages.length - 1 && (
                <div className="flex items-center justify-center my-0.5 opacity-60">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                    <ArrowDown className="w-3 h-3 text-slate-400" />
                    <span>Drop-off: {dropOffCount} leads ({dropOffPct}%)</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stage Ratio Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Enquiry → Contact</span>
          <span className="text-sm font-black text-slate-900">94.9%</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Contact → Counsel</span>
          <span className="text-sm font-black text-slate-900">82.9%</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Counsel → Visit</span>
          <span className="text-sm font-black text-slate-900">77.0%</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Visit → Application</span>
          <span className="text-sm font-black text-slate-900">74.1%</span>
        </div>
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center col-span-2 sm:col-span-1">
          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">App → Admission</span>
          <span className="text-sm font-black text-emerald-700">57.8%</span>
        </div>
      </div>
    </div>
  );
};
