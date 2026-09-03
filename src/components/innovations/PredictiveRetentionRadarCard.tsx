"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Sparkles,
  TrendingDown,
  User,
  Phone,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import {
  computeStudentRetentionRisksAction,
  getRetentionRiskAlertsAction
} from "@/app/actions/retention-early-warning-actions";

export const PredictiveRetentionRadarCard: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComputing, setIsComputing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    setIsLoading(true);
    try {
      const res = await getRetentionRiskAlertsAction();
      if (res.success) {
        setAlerts(res.scores || []);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRecompute() {
    setIsComputing(true);
    setActionNotice(null);
    try {
      const res = await computeStudentRetentionRisksAction();
      if (res.success) {
        setActionNotice(`✓ Computed 4-signal composite risk across ${res.totalScored} students. Flagged ${res.highRiskCount} high-risk students.`);
        await loadAlerts();
      }
    } finally {
      setIsComputing(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xl p-6 sm:p-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-950 px-2.5 py-1 rounded-full border border-rose-200">
              VANI Proactive Pulse Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            AI Predictive Student Retention Early-Warning Radar
          </h2>
          <p className="text-xs text-stone-500">
            Multi-signal scoring correlating attendance dips (40%), fee overdue (25%), unread diaries (25%), and grades (10%)
          </p>
        </div>

        <button
          onClick={handleRecompute}
          disabled={isComputing}
          className="px-4 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-800 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-rose-300" />
          <span>{isComputing ? "Evaluating Risk Signals..." : "Re-Scan Retention Risks"}</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Risk Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((al) => (
          <div
            key={al.id}
            className="p-5 bg-stone-50 border border-stone-200 hover:border-rose-300 rounded-2xl space-y-3 transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs">
                    {al.student_name ? al.student_name.substring(0, 2).toUpperCase() : "ST"}
                  </div>
                  <div>
                    <strong className="text-xs font-black text-stone-900 block">{al.student_name}</strong>
                    <span className="text-[10px] text-stone-500">{al.student_admission_no} • {al.class_name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full block">
                    {al.composite_risk_score}% Risk
                  </span>
                  <span className="text-[9px] font-bold text-rose-900 uppercase tracking-wider">{al.risk_tier} Tier</span>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2 bg-white rounded-lg border border-stone-100 text-center">
                  <span className="text-[9px] text-stone-400 block font-bold">Attendance</span>
                  <strong className="text-xs font-bold text-rose-700">{al.attendance_sub_score}%</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-100 text-center">
                  <span className="text-[9px] text-stone-400 block font-bold">Fee Dues</span>
                  <strong className="text-xs font-bold text-amber-700">{al.fee_dues_sub_score}%</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-100 text-center">
                  <span className="text-[9px] text-stone-400 block font-bold">Diary Notice</span>
                  <strong className="text-xs font-bold text-blue-700">{al.parent_engagement_sub_score}%</strong>
                </div>
              </div>

              <div className="text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200/60 space-y-1">
                <p><strong>Primary Trigger:</strong> {al.primary_risk_driver}</p>
                <p className="text-emerald-800 font-semibold"><strong>Suggested Action:</strong> {al.recommended_action}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-stone-200">
              <span className="text-[10px] text-stone-400">Intervention: <strong>{al.intervention_status}</strong></span>
              <button
                onClick={() => alert(`Initiating pastoral intervention for ${al.student_name}. WhatsApp welfare check-in staged.`)}
                className="px-3 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
              >
                Take Intervention
              </button>
            </div>
          </div>
        ))}

        {alerts.length === 0 && !isLoading && (
          <div className="col-span-2 p-12 text-center text-stone-400 text-xs space-y-2 border border-dashed border-stone-200 rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p>All enrolled students currently demonstrate healthy attendance and engagement indicators!</p>
          </div>
        )}
      </div>
    </div>
  );
};
