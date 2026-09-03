"use client";

import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, CheckCircle2, Star, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import {
  computeStaffAppraisalScoresAction,
  getStaffAppraisalLeaderboardAction
} from '@/app/actions/staff-appraisal-actions';

export const StaffAppraisalMatrixDesk: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComputing, setIsComputing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const res = await getStaffAppraisalLeaderboardAction();
      if (res.success && res.leaderboard.length > 0) {
        setLeaderboard(res.leaderboard);
      } else {
        // Compute initial if empty
        await handleCompute();
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleCompute = async () => {
    setIsComputing(true);
    setNotice(null);
    try {
      const res = await computeStaffAppraisalScoresAction('2026-2027');
      if (res.success) {
        setNotice(`✓ Evaluated ${res.totalStaffEvaluated} educators! Trust Average Score: ${res.averageTrustScore}%.`);
        const lRes = await getStaffAppraisalLeaderboardAction();
        if (lRes.success) setLeaderboard(lRes.leaderboard);
      } else {
        alert(res.error || 'Failed to compute appraisal scores');
      }
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HUD Ribbon */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>360° Multi-Signal Faculty Evaluation</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900">Staff Performance &amp; Appraisal Matrix</h2>
          <p className="text-xs text-stone-500 mt-0.5">Correlating student score improvements (35%), attendance (25%), diary compliance (20%), and peer reviews (20%).</p>
        </div>

        <button
          onClick={handleCompute}
          disabled={isComputing}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isComputing ? 'animate-spin' : ''}`} />
          <span>{isComputing ? 'Computing 360° Scores...' : 'Recalculate Trust Appraisals'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Faculty Leaderboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaderboard.map((staff) => (
          <div key={staff.id} className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4 hover:border-indigo-200 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={staff.photoUrl}
                  alt={staff.name}
                  className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200"
                />
                <div>
                  <strong className="text-stone-900 font-bold text-sm block">{staff.name}</strong>
                  <span className="text-[11px] text-stone-500 block">{staff.designation}</span>
                  <span className="text-[10px] text-stone-400 font-mono">{staff.department}</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase inline-block ${
                  staff.overallRating === 'A+'
                    ? 'bg-emerald-100 text-emerald-800'
                    : staff.overallRating === 'A'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Grade {staff.overallRating}
                </span>
                <span className="text-[10px] font-bold text-indigo-600 block mt-1">+{staff.incrementPct}% Increment</span>
              </div>
            </div>

            {/* Signal Breakdown */}
            <div className="space-y-2 pt-2 border-t border-stone-100 text-[11px]">
              <div className="flex justify-between items-center text-stone-600">
                <span>Student Academic Delta (35%):</span>
                <strong className="text-stone-900 font-mono">{staff.breakdown?.studentAcademicDelta || 88}%</strong>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Attendance Punctuality (25%):</span>
                <strong className="text-stone-900 font-mono">{staff.breakdown?.attendancePunctuality || 95}%</strong>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Diary &amp; Syllabus Speed (20%):</span>
                <strong className="text-stone-900 font-mono">{staff.breakdown?.diaryCompliance || 90}%</strong>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Parent PTM Rating (20%):</span>
                <strong className="text-stone-900 font-mono">{staff.breakdown?.parentPeerRating || 92}%</strong>
              </div>
            </div>

            <div className="p-2.5 bg-stone-50 rounded-xl text-[10px] text-stone-600 border border-stone-200/50">
              <strong className="text-stone-800 block mb-0.5">Trust Recommendation:</strong>
              {staff.principalRemarks || 'Recommended for statutory increment and continuing professional development.'}
            </div>
          </div>
        ))}

        {leaderboard.length === 0 && !isLoading && (
          <div className="col-span-full p-12 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-2xl">
            No faculty appraisal scores available. Click &quot;Recalculate Trust Appraisals&quot; above.
          </div>
        )}
      </div>
    </div>
  );
};
