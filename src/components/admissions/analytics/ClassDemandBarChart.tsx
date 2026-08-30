"use client";

import React from 'react';
import { Layers, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface ClassDemandItem {
  grade: string;
  enquiries: number;
  capacity: number;
  admissions: number;
  status: string;
  fillRate: number;
}

interface ClassDemandBarChartProps {
  data: ClassDemandItem[];
}

export const ClassDemandBarChart: React.FC<ClassDemandBarChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-600" /> Grade-Wise Capacity &amp; Intake
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">Demand vs Authorized Seats</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Class-Wise Enquiry Demand vs Seats vs Admissions
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Identify grades with excess demand and seats requiring marketing reinforcement.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600">Enquiries</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300" />
            <span className="text-slate-600">Authorized Seats</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Confirmed Enrolled</span>
          </div>
        </div>
      </div>

      {/* Grade Demand Bars */}
      <div className="space-y-4">
        {data.map((item) => {
          const maxVal = 90;
          const enqWidth = Math.min(Math.round((item.enquiries / maxVal) * 100), 100);
          const seatWidth = Math.min(Math.round((item.capacity / maxVal) * 100), 100);
          const admWidth = Math.min(Math.round((item.admissions / maxVal) * 100), 100);
          const isBottleneck = item.enquiries > item.capacity * 2;

          return (
            <div key={item.grade} className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 hover:border-slate-200 transition">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">{item.grade}</span>
                  {isBottleneck ? (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-600" /> High Demand Bottleneck ({(item.enquiries / item.capacity * 100).toFixed(0)}%)
                    </span>
                  ) : item.fillRate >= 80 ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                      Near Capacity ({item.fillRate}%)
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                      Seats Available ({item.capacity - item.admissions} open)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-blue-700 font-bold">{item.enquiries} Enq</span>
                  <span className="text-slate-400 font-medium">{item.capacity} Seats</span>
                  <span className="text-emerald-700 font-extrabold">{item.admissions} Enrolled</span>
                </div>
              </div>

              {/* Progress Stack Bars */}
              <div className="space-y-1.5">
                {/* Enquiries bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 w-16">Enquiries</span>
                  <div className="flex-1 h-3.5 bg-slate-200/70 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${enqWidth}%` }} />
                  </div>
                </div>

                {/* Admissions vs Capacity bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 w-16">Enrolled</span>
                  <div className="flex-1 h-3.5 bg-slate-200/70 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 border-r-2 border-slate-500/50 z-10" style={{ left: `${seatWidth}%` }} title={`Seat Cap: ${item.capacity}`} />
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${admWidth}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
