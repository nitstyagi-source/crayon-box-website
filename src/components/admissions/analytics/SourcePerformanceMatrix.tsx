"use client";

import React from 'react';
import { Globe, Share2, Sparkles, Megaphone, Smartphone, Users, TrendingUp } from 'lucide-react';

interface SourceItem {
  source: string;
  enquiries: number;
  applications: number;
  admissions: number;
  conversion: number;
  roi: string;
  avgCost: string;
}

interface SourcePerformanceMatrixProps {
  sources: SourceItem[];
}

export const SourcePerformanceMatrix: React.FC<SourcePerformanceMatrixProps> = ({ sources }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
              <Megaphone className="w-3 h-3 text-emerald-600" /> Channel Acquisition ROI
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">Lead Source Conversion Intelligence</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Source-Wise Performance &amp; Yield Matrix
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Discover which marketing and outreach channels convert best to optimize admission budgets.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="px-4 py-3.5 rounded-l-xl">Lead Source Channel</th>
              <th className="px-4 py-3.5 text-right">Enquiries</th>
              <th className="px-4 py-3.5 text-right">Applications</th>
              <th className="px-4 py-3.5 text-right">Admissions</th>
              <th className="px-4 py-3.5 text-right">Conversion Rate</th>
              <th className="px-4 py-3.5 text-center">Acquisition Cost</th>
              <th className="px-4 py-3.5 text-right rounded-r-xl">Yield Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {sources.map((s, idx) => (
              <tr key={s.source} className="hover:bg-slate-50/60 transition">
                <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{s.source}</span>
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{s.enquiries}</td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-600">{s.applications}</td>
                <td className="px-4 py-3.5 text-right font-mono font-black text-emerald-700">{s.admissions}</td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${s.conversion >= 35 ? 'bg-emerald-500' : s.conversion >= 25 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(s.conversion * 2, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono font-black text-xs text-slate-900">{s.conversion}%</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center font-mono text-slate-500">{s.avgCost}</td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    s.roi === 'Highest' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : s.roi === 'High'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {s.roi} ROI
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
