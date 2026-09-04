"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Award,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  Send,
  Download,
  Calendar,
  Layers,
  BarChart3,
  X,
  ChevronRight,
  Sliders,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  getBoardPredictionsAction,
  generateRemedialPackageAction,
  StudentBoardPrediction
} from '@/app/actions/board-predictor-actions';

export function PredictiveBoardAnalyticsDesk() {
  const [selectedGrade, setSelectedGrade] = useState('Class 10-A');
  const [predictions, setPredictions] = useState<StudentBoardPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 5,
    projectedClassAverage: 75.5,
    criticalRemedialCount: 1,
    borderlineCount: 2,
    honorsTrackCount: 2,
    modelConfidenceRate: 94.8
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'CRITICAL_REMEDIAL' | 'BORDERLINE' | 'HONORS_TRACK'>('ALL');

  // Remedial modal state
  const [selectedStudentForRemedial, setSelectedStudentForRemedial] = useState<StudentBoardPrediction | null>(null);
  const [remedialPlan, setRemedialPlan] = useState<any | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planSuccessMsg, setPlanSuccessMsg] = useState<string | null>(null);

  const fetchPredictions = async () => {
    setIsLoading(true);
    const res = await getBoardPredictionsAction(selectedGrade);
    if (res.success) {
      setPredictions(res.data);
      setStats(res.stats);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPredictions();
  }, [selectedGrade]);

  const handleOpenRemedial = async (student: StudentBoardPrediction) => {
    setSelectedStudentForRemedial(student);
    setIsGeneratingPlan(true);
    setPlanSuccessMsg(null);
    const res = await generateRemedialPackageAction(student.student_id);
    if (res.success) {
      setRemedialPlan(res.remedialPlan);
      setPlanSuccessMsg(res.message);
    }
    setIsGeneratingPlan(false);
  };

  const filteredPredictions = predictions.filter((p) => {
    const matchesSearch =
      p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.admission_no.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || p.risk_category === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFC8]/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              CBSE Board Exam Predictive Analytics & Remedial Engine
            </h2>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            Multi-term statistical regression synthesizing Periodic Tests (20%), Term 1 (35%), and Pre-Board Mocks (45%) to forecast final CBSE percentage and synthesize automated remedial plans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs font-semibold text-stone-800 px-3 py-2 rounded-xl bg-stone-50 border border-[#E8DFC8] focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="Class 10-A">Class 10-A (Secondary)</option>
            <option value="Class 10-B">Class 10-B (Secondary)</option>
            <option value="Class 12-Science">Class 12-A (PCM/PCB)</option>
            <option value="Class 12-Commerce">Class 12-B (Commerce)</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchPredictions}
            className="border-[#E8DFC8] text-stone-700 hover:bg-stone-50 gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-amber-600/10 border-amber-200/60 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Projected Cohort Mean</span>
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-900">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900">{stats.projectedClassAverage}%</span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              +3.2% vs 2025
            </span>
          </div>
          <p className="text-[11px] text-stone-600 mt-1">Weighted projected CBSE aggregate</p>
        </Card>

        <Card className="p-4 bg-rose-50/70 border-rose-200/60 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-900 uppercase tracking-wider">Critical Remedial (&lt;60%)</span>
            <div className="p-2 bg-rose-500/20 rounded-xl text-rose-900">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-rose-900">{stats.criticalRemedialCount}</span>
            <span className="text-xs font-medium text-rose-800">Students At-Risk</span>
          </div>
          <p className="text-[11px] text-rose-700/80 mt-1">Requires zero-period coaching</p>
        </Card>

        <Card className="p-4 bg-amber-50/60 border-amber-200/60 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Borderline (60% - 79%)</span>
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-900">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-amber-900">{stats.borderlineCount}</span>
            <span className="text-xs font-medium text-amber-800">Targeting Distinction</span>
          </div>
          <p className="text-[11px] text-amber-800/80 mt-1">Can cross 80% with chapter drills</p>
        </Card>

        <Card className="p-4 bg-emerald-50/70 border-emerald-200/60 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Honors Track (&gt;80%)</span>
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-900">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-emerald-900">{stats.honorsTrackCount}</span>
            <span className="text-xs font-medium text-emerald-800">CBSE Merit Contenders</span>
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1">Olympiad & Top Percentile prep</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search student or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8DFC8] rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto pb-1">
          {(['ALL', 'CRITICAL_REMEDIAL', 'BORDERLINE', 'HONORS_TRACK'] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterRisk === risk
                  ? 'bg-stone-900 text-amber-300 shadow-sm'
                  : 'bg-white border border-[#E8DFC8] text-stone-700 hover:bg-stone-50'
              }`}
            >
              {risk === 'ALL'
                ? 'All Cohort'
                : risk === 'CRITICAL_REMEDIAL'
                ? '🚨 Critical Remedial'
                : risk === 'BORDERLINE'
                ? '⚡ Borderline'
                : '🏆 Honors Track'}
            </button>
          ))}
        </div>
      </div>

      {/* Predictive Roster Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E8DFC8] text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <th className="py-3 px-4">Student Name & Roll</th>
                <th className="py-3 px-4">Periodic Tests</th>
                <th className="py-3 px-4">Term 1 Exam</th>
                <th className="py-3 px-4">Mock Board 1</th>
                <th className="py-3 px-4">Predicted CBSE Score</th>
                <th className="py-3 px-4">Subject Weak Spots</th>
                <th className="py-3 px-4 text-right">Remedial Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFC8]/60 text-xs">
              {filteredPredictions.map((student) => (
                <tr key={student.id} className="hover:bg-amber-500/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-900">{student.student_name}</div>
                    <div className="text-[11px] text-stone-500">{student.admission_no} • {student.grade_section}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-stone-700">
                    {student.periodic_test_avg}%
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-stone-700">
                    {student.current_term_pct}%
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-stone-700">
                    {student.mock_board_pct}%
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-serif font-bold text-stone-900">
                        {student.predicted_cbse_pct}%
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        ±{student.confidence_interval}%
                      </span>
                    </div>
                    <div className="mt-1">
                      {student.risk_category === 'CRITICAL_REMEDIAL' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" /> Critical Remedial
                        </span>
                      )}
                      {student.risk_category === 'BORDERLINE' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          <Sliders className="w-3 h-3" /> Borderline
                        </span>
                      )}
                      {student.risk_category === 'HONORS_TRACK' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          <Award className="w-3 h-3" /> Honors Track
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {student.subject_forecast.map((sf, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            sf.remedialDifficulty === 'HIGH'
                              ? 'bg-rose-100 text-rose-800 font-semibold'
                              : sf.remedialDifficulty === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                          title={`${sf.subject}: ${sf.predictedScore}% (${sf.weakTopics.join(', ')})`}
                        >
                          {sf.subject.slice(0, 4)}: {sf.predictedScore}%
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      onClick={() => handleOpenRemedial(student)}
                      className="bg-amber-700 hover:bg-amber-800 text-white text-xs px-3 py-1.5 rounded-xl shadow-xs gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Remedial Plan
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remedial Intervention Modal */}
      {selectedStudentForRemedial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8DFC8] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-start justify-between pb-4 border-b border-[#E8DFC8]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 rounded-lg text-amber-900">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">
                    AI Remedial Intervention Package
                  </h3>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Targeted CBSE Board Enhancement for <span className="font-semibold text-stone-900">{selectedStudentForRemedial.student_name}</span> ({selectedStudentForRemedial.admission_no})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForRemedial(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isGeneratingPlan ? (
              <div className="py-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-700 mx-auto" />
                <p className="text-sm font-medium text-stone-700 mt-3">Synthesizing personalized syllabus roadmap...</p>
              </div>
            ) : remedialPlan ? (
              <div className="py-4 space-y-4">
                {/* Score Projection Band */}
                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFC8] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Current Forecast</span>
                    <div className="text-2xl font-serif font-bold text-stone-800">
                      {selectedStudentForRemedial.predicted_cbse_pct}%
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-800" />
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Target Post-Remedial</span>
                    <div className="text-2xl font-serif font-bold text-emerald-800">
                      {remedialPlan.targetScore}%
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Plan Duration</span>
                    <div className="text-base font-bold text-stone-900">
                      {remedialPlan.durationWeeks} Weeks
                    </div>
                  </div>
                </div>

                {/* AI Diagnosis Note */}
                <div className="p-3.5 bg-amber-500/10 border border-amber-200 rounded-xl text-xs text-amber-950">
                  <span className="font-bold">CBSE AI Diagnostic Recommendation: </span>
                  {selectedStudentForRemedial.ai_remedial_recommendation}
                </div>

                {/* 6-Week Module Roadmap */}
                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    6-Week Targeted Chapter Focus
                  </h4>
                  <div className="space-y-2">
                    {remedialPlan.modules.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[#E8DFC8]/60 bg-white hover:bg-stone-50 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-[11px]">
                            W{m.week}
                          </span>
                          <div>
                            <div className="font-semibold text-stone-900">{m.focusSubject}: {m.chapter}</div>
                            <div className="text-[10px] text-stone-500">Daily 30-min targeted NCERT drill</div>
                          </div>
                        </div>
                        <span className="text-[11px] text-amber-900 font-medium hover:underline cursor-pointer flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Question Bank
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Success Banner */}
                {planSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{planSuccessMsg}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedStudentForRemedial(null)}
                    className="border-[#E8DFC8] text-xs text-stone-700"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      alert(`WhatsApp Remedial Briefing Sent to Parent of ${selectedStudentForRemedial.student_name}!`);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch to Parent WhatsApp
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
