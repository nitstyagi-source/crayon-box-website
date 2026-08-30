"use client";

import React from 'react';
import { UserCheck, Clock, CheckCircle2, AlertCircle, Award } from 'lucide-react';

interface CounsellorItem {
  name: string;
  enquiries: number;
  followUps: number;
  visits: number;
  admissions: number;
  conversion: number;
  avgResponseMins: number;
  overdue: number;
}

interface CounsellorScorecardTableProps {
  counsellors: CounsellorItem[];
}

export const CounsellorScorecardTable: React.FC<CounsellorScorecardTableProps> = ({ counsellors }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-purple-100 flex items-center gap-1">
              <Award className="w-3 h-3 text-purple-600" /> Admissions Desk Leaderboard
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">Response Speed &amp; Conversion Efficiency</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Counsellor Performance &amp; Response-Time Scorecard
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Track first-contact response velocity, follow-up discipline, and final conversion yield.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="px-4 py-3.5 rounded-l-xl">Counsellor Officer</th>
              <th className="px-4 py-3.5 text-right">Enquiries</th>
              <th className="px-4 py-3.5 text-right">Follow-ups Done</th>
              <th className="px-4 py-3.5 text-right">Visits Hosted</th>
              <th className="px-4 py-3.5 text-right">Admissions</th>
              <th className="px-4 py-3.5 text-center">Avg Response Time</th>
              <th className="px-4 py-3.5 text-right">Conversion</th>
              <th className="px-4 py-3.5 text-right rounded-r-xl">Overdue Follow-ups</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {counsellors.map((c, idx) => (
              <tr key={c.name} className="hover:bg-slate-50/60 transition">
                <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 text-xs font-black flex items-center justify-center">
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className="block font-bold">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Admissions Executive</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{c.enquiries}</td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-600">{c.followUps}</td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-600">{c.visits}</td>
                <td className="px-4 py-3.5 text-right font-mono font-black text-emerald-700">{c.admissions}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                    c.avgResponseMins <= 15 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : c.avgResponseMins <= 30
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <Clock className="w-3 h-3" /> {c.avgResponseMins} mins
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-black text-slate-900">{c.conversion}%</td>
                <td className="px-4 py-3.5 text-right">
                  {c.overdue > 0 ? (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                      {c.overdue} pending
                    </span>
                  ) : (
                    <span className="text-emerald-600 text-[10px] font-bold">✓ Zero Overdue</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
