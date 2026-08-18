"use client";

import { Brain, TrendingDown, AlertTriangle, Lightbulb, Users, Calendar, ArrowRight } from "lucide-react";

export default function PredictiveAnalyticsDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Brain className="w-6 h-6 text-fuchsia-600" /> AI Predictive Analytics
          </h1>
          <p className="text-sm text-slate-500">Heuristic engine monitoring academic drop-offs and operational bottlenecks.</p>
        </div>
        <button className="px-4 py-2 bg-fuchsia-50 text-fuchsia-700 rounded-lg text-sm font-bold border border-fuchsia-200 hover:bg-fuchsia-100 transition-colors">
          Run Deep Scan
        </button>
      </div>

      {/* Hero Insights Card */}
      <div className="bg-gradient-to-r from-fuchsia-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            Engine Active
          </div>
          <h2 className="text-3xl font-serif font-bold">3 High-Risk Anomalies Detected</h2>
          <p className="text-indigo-200">The predictive engine has identified negative trending patterns in Grade 8 mathematics and anomalous late arrivals in Route 4.</p>
        </div>
        <div className="w-full md:w-auto shrink-0 bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2">Overall Health Score</p>
          <div className="text-6xl font-black font-mono">92<span className="text-2xl text-indigo-300">/100</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Academic Drop-Off Warnings */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><TrendingDown className="w-5 h-5 text-amber-500" /> Academic Early Warnings</h3>
          </div>
          <div className="p-6 space-y-4 flex-1">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Grade 8A - Mathematics</h4>
                <p className="text-sm text-slate-600 mt-1">15% drop in formative assessment scores over the last 3 weeks. Recommended action: Schedule remedial sessions for fractions.</p>
                <button className="mt-3 text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">Generate Remedial Timetable <ArrowRight className="w-3 h-3" /></button>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-2xl flex gap-4 hover:bg-slate-50 transition-colors">
              <Users className="w-6 h-6 text-slate-400 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Student Alert: Mia Johnson (Grade 4)</h4>
                <p className="text-sm text-slate-600 mt-1">Consecutive drop in mood logged by Daycare Diary correlated with 3 days of late arrivals.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Bottlenecks */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-indigo-500" /> AI Recommendations</h3>
          </div>
          <div className="p-6 space-y-4 flex-1">
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex gap-4">
              <Calendar className="w-6 h-6 text-indigo-600 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Smart Timetable Optimization</h4>
                <p className="text-sm text-slate-600 mt-1">The engine found a 12% efficiency gain by swapping the Grade 6 Lab Period to Tuesdays, reducing hallway congestion.</p>
                <button className="mt-3 text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1">Apply New Timetable <ArrowRight className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
