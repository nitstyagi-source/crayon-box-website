"use client";

import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

interface InsightSection {
  title: string;
  status: string;
  bullets: string[];
}

interface ManagementInsightsCardProps {
  insights: {
    health: InsightSection;
    attention: InsightSection;
    opportunity: InsightSection;
    concern: InsightSection;
  };
}

export const ManagementInsightsCard: React.FC<ManagementInsightsCardProps> = ({ insights }) => {
  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-blue-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" /> AI Executive Advisor
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-slate-400 text-xs font-semibold">Decision-Making Copilot</span>
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Admissions Management Intelligence Digest
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Strategic insights, operational bottlenecks, and capacity recommendations.
          </p>
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadrant 1: Health */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="font-extrabold text-emerald-300 text-xs uppercase tracking-wider">
                1. Admissions Health (Strong)
              </h4>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded">
              OPTIMAL
            </span>
          </div>
          <h5 className="font-bold text-sm text-white">{insights.health.title}</h5>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {insights.health.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quadrant 2: Attention Required */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h4 className="font-extrabold text-amber-300 text-xs uppercase tracking-wider">
                2. Attention Required (Actionable)
              </h4>
            </div>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded">
              ACTION NEEDED
            </span>
          </div>
          <h5 className="font-bold text-sm text-white">{insights.attention.title}</h5>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {insights.attention.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold mt-0.5">⚠️</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quadrant 3: Opportunity */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-blue-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <h4 className="font-extrabold text-blue-300 text-xs uppercase tracking-wider">
                3. Growth &amp; Capacity Opportunity
              </h4>
            </div>
            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black px-2 py-0.5 rounded">
              EXPANSION
            </span>
          </div>
          <h5 className="font-bold text-sm text-white">{insights.opportunity.title}</h5>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {insights.opportunity.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-400 font-bold mt-0.5">💡</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quadrant 4: Concern */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-rose-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <h4 className="font-extrabold text-rose-300 text-xs uppercase tracking-wider">
                4. Bottlenecks &amp; Concerns
              </h4>
            </div>
            <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black px-2 py-0.5 rounded">
              CHURN RISK
            </span>
          </div>
          <h5 className="font-bold text-sm text-white">{insights.concern.title}</h5>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {insights.concern.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold mt-0.5">❌</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
