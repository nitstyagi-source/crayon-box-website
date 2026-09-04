"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Sparkles,
  Heart,
  Shield,
  BookOpen,
  Users,
  AlertTriangle,
  Plus,
  Flame,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Filter,
  UserCheck,
  Search,
  MessageSquare
} from "lucide-react";
import {
  getHouseLeaderboardAction,
  getPbisMeritTypesAction,
  awardHousePointsAction,
  getPastoralFeedAction,
  getPastoralInterventionsAction,
  createPastoralInterventionAction,
  HouseRecord,
  MeritTypeRecord,
  PointTransactionRecord,
  PastoralInterventionRecord
} from "@/app/actions/pbis-actions";

export default function PbisHouseCupPastoralPage() {
  const [activeTab, setActiveTab] = useState<"house-cup" | "praise-feed" | "mtss-interventions">("house-cup");
  const [houses, setHouses] = useState<HouseRecord[]>([]);
  const [meritTypes, setMeritTypes] = useState<MeritTypeRecord[]>([]);
  const [feed, setFeed] = useState<PointTransactionRecord[]>([]);
  const [interventions, setInterventions] = useState<PastoralInterventionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Award Points Modal State
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentHouse, setStudentHouse] = useState("DRAGON");
  const [selectedMeritId, setSelectedMeritId] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [teacherName, setTeacherName] = useState("Ms. Pooja Sharma");
  const [submitting, setSubmitting] = useState(false);

  // MTSS Intervention Modal State
  const [interventionModalOpen, setInterventionModalOpen] = useState(false);
  const [intStudentName, setIntStudentName] = useState("");
  const [intTier, setIntTier] = useState<"TIER_1" | "TIER_2" | "TIER_3">("TIER_2");
  const [intTrigger, setIntTrigger] = useState("");
  const [intCounselor, setIntCounselor] = useState("Dr. Sunita Rao (School Counselor)");
  const [intStrategy, setIntStrategy] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(false);
    try {
      const [hRes, mRes, fRes, iRes] = await Promise.all([
        getHouseLeaderboardAction(),
        getPbisMeritTypesAction(),
        getPastoralFeedAction(30),
        getPastoralInterventionsAction()
      ]);

      if (hRes.success) setHouses(hRes.houses);
      if (mRes.success) {
        setMeritTypes(mRes.meritTypes);
        if (mRes.meritTypes.length > 0) setSelectedMeritId(mRes.meritTypes[0].id);
      }
      if (fRes.success) setFeed(fRes.feed);
      if (iRes.success) setInterventions(iRes.interventions);
    } catch (e) {
      console.error("Error loading PBIS pastoral data:", e);
    }
  }

  async function handleAwardPointsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentName.trim() || !customReason.trim()) {
      alert("Please enter the student's name and praise reason.");
      return;
    }

    const merit = meritTypes.find(m => m.id === selectedMeritId) || meritTypes[0];
    setSubmitting(true);

    try {
      const res = await awardHousePointsAction({
        studentId: "00000000-0000-0000-0000-000000000001",
        studentName,
        className: "Class 9B",
        houseCode: studentHouse,
        awardedByName: teacherName,
        meritName: merit.name,
        category: merit.category,
        points: merit.default_points,
        reason: customReason
      });

      if (res.success) {
        alert(res.message);
        setAwardModalOpen(false);
        setStudentName("");
        setCustomReason("");
        loadData();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateInterventionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!intStudentName.trim() || !intTrigger.trim() || !intStrategy.trim()) {
      alert("Please fill in the student name, trigger reason, and support strategy.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPastoralInterventionAction({
        studentId: "00000000-0000-0000-0000-000000000001",
        studentName: intStudentName,
        className: "Class 8A",
        tier: intTier,
        triggerReason: intTrigger,
        assignedCounselorName: intCounselor,
        supportStrategy: intStrategy,
        reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      if (res.success) {
        alert(res.message);
        setInterventionModalOpen(false);
        setIntStudentName("");
        setIntTrigger("");
        setIntStrategy("");
        loadData();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const getHouseBadgeColor = (code: string) => {
    switch (code) {
      case "DRAGON": return "bg-amber-100 text-amber-900 border-amber-300";
      case "PEGASUS": return "bg-blue-100 text-blue-900 border-blue-300";
      case "PHOENIX": return "bg-red-100 text-red-900 border-red-300";
      case "GRIFFIN": return "bg-emerald-100 text-emerald-900 border-emerald-300";
      default: return "bg-stone-100 text-stone-900 border-stone-300";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Trophy className="w-3.5 h-3.5" />
            PBIS Positive Behavioral Interventions &amp; Gamified House Cup
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-400" />
            Pastoral Care &amp; House Cup Arena
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/80 max-w-2xl">
            Promotes campus-wide character building, empathy, and leadership through gamified house points alongside Multi-Tiered Pastoral Support (MTSS).
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setInterventionModalOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-white/20"
          >
            <Shield className="w-3.5 h-3.5 text-amber-300" /> + MTSS Intervention
          </button>

          <button
            onClick={() => setAwardModalOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
          >
            <Award className="w-4 h-4" /> ⚡ Award Merit Points
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-black">
        <button
          onClick={() => setActiveTab("house-cup")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === "house-cup"
              ? "bg-amber-500 text-stone-950 shadow-xs"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Trophy className="w-4 h-4" /> Annual House Cup Standings
        </button>

        <button
          onClick={() => setActiveTab("praise-feed")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === "praise-feed"
              ? "bg-amber-500 text-stone-950 shadow-xs"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Sparkles className="w-4 h-4" /> Live School Praise Feed ({feed.length})
        </button>

        <button
          onClick={() => setActiveTab("mtss-interventions")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === "mtss-interventions"
              ? "bg-amber-500 text-stone-950 shadow-xs"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Shield className="w-4 h-4" /> MTSS Pastoral Interventions ({interventions.length})
        </button>
      </div>

      {/* TAB 1: HOUSE CUP STANDINGS */}
      {activeTab === "house-cup" && (
        <div className="space-y-8">
          {/* 4 Houses Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {houses.map((house, idx) => (
              <div
                key={house.id}
                className={`relative rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl ${
                  idx === 0
                    ? "bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-md ring-2 ring-amber-400/40"
                    : "bg-white border-stone-200"
                }`}
              >
                {/* Rank Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    idx === 0 ? "bg-amber-500 text-stone-950" : "bg-stone-100 text-stone-700"
                  }`}>
                    {idx === 0 ? "👑 Rank #1 (Leader)" : `Rank #${idx + 1}`}
                  </span>
                  <span className="text-3xl">{house.crest_emoji}</span>
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="text-xl font-black text-stone-900">{house.name}</h3>
                  <p className="text-[11px] text-stone-500 italic">"{house.motto}"</p>
                </div>

                {/* Score Big Display */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-stone-900 tracking-tight">
                      {house.total_points.toLocaleString()}
                    </span>
                    <span className="text-xs text-stone-400 font-bold ml-1">pts</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{house.weekly_velocity} this wk
                  </div>
                </div>

                {/* House Master & Captain */}
                <div className="mt-4 pt-3 border-t border-stone-100 text-[10px] space-y-1 text-stone-600 font-medium">
                  <div><strong>House Master:</strong> {house.house_master_name}</div>
                  <div><strong>Captain:</strong> {house.captain_student_name}</div>
                </div>
              </div>
            ))}
          </div>

          {/* PBIS Core Values & Merit Guide */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                PBIS Positive Behavior Reinforcement Rubric
              </h3>
              <span className="text-xs text-stone-500 font-bold">Universal Character Strengths</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {meritTypes.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2 transition ${
                    m.is_positive
                      ? "bg-stone-50/70 border-stone-200 hover:border-amber-300"
                      : "bg-red-50/40 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider">
                      {m.category}
                    </span>
                    <span className={`font-black font-mono text-xs px-2 py-0.5 rounded-full ${
                      m.is_positive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}>
                      {m.default_points > 0 ? `+${m.default_points}` : m.default_points} pts
                    </span>
                  </div>
                  <div className="font-bold text-stone-900">{m.name}</div>
                  <div className="text-[10px] text-stone-400 font-mono">Tier: {m.tier}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE PRAISE FEED */}
      {activeTab === "praise-feed" && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-stone-900">Campus Praise &amp; Commendation Ticker</h3>
              <p className="text-xs text-stone-500">Live stream of student merits awarded by faculty and house masters.</p>
            </div>
            <button
              onClick={() => setAwardModalOpen(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Award Merit
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {feed.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getHouseBadgeColor(item.house_code)}`}>
                      {item.house_code}
                    </span>
                    <span className="font-black text-stone-900 text-sm">{item.student_name}</span>
                    <span className="text-xs text-stone-400">({item.class_name})</span>
                  </div>
                  <div className="text-xs text-stone-700 font-medium">
                    "{item.reason}"
                  </div>
                  <div className="text-[10px] text-stone-400 flex items-center gap-2">
                    <span>Awarded by <strong>{item.awarded_by_name}</strong></span>
                    <span>•</span>
                    <span>{item.merit_name}</span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className={`font-black font-mono text-sm px-3 py-1 rounded-full ${
                    item.points >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}>
                    {item.points >= 0 ? `+${item.points}` : item.points} pts
                  </span>
                  <div className="text-[10px] text-stone-400 mt-1">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MTSS PASTORAL INTERVENTIONS */}
      {activeTab === "mtss-interventions" && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-stone-900">Multi-Tiered Pastoral Support (MTSS)</h3>
              <p className="text-xs text-stone-500">Tier 2 &amp; Tier 3 student behavioral action plans and restorative interventions.</p>
            </div>
            <button
              onClick={() => setInterventionModalOpen(true)}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Initiate Support Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interventions.map((intv) => (
              <div key={intv.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      intv.tier === "TIER_3"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}>
                      {intv.tier === "TIER_3" ? "🔴 Tier 3 Intensive" : "🟡 Tier 2 Targeted"}
                    </span>
                    <span className="font-black text-sm text-stone-900">{intv.student_name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    {intv.status}
                  </span>
                </div>

                <div className="text-xs text-stone-700">
                  <strong>Trigger:</strong> {intv.trigger_reason}
                </div>

                <div className="text-xs text-stone-600 bg-white p-3 rounded-xl border border-stone-200/80">
                  <strong>Support Strategy:</strong> {intv.support_strategy}
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-200/50">
                  <span>Counselor: <strong>{intv.assigned_counselor_name}</strong></span>
                  <span>Review Date: {intv.review_date || "30 Days"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: AWARD MERIT POINTS */}
      {awardModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="space-y-1 border-b border-stone-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                <Sparkles className="w-3 h-3 text-amber-600" /> PBIS Merit Recognition
              </div>
              <h3 className="text-lg font-black text-stone-900">Award House Points</h3>
              <p className="text-xs text-stone-500">Recognize positive character contributions or record behavioral deductions.</p>
            </div>

            <form onSubmit={handleAwardPointsSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-stone-500">Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-500">House</label>
                  <select
                    value={studentHouse}
                    onChange={(e) => setStudentHouse(e.target.value)}
                    className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  >
                    <option value="DRAGON">🐉 Dragon (Gold)</option>
                    <option value="PEGASUS">⚡ Pegasus (Blue)</option>
                    <option value="PHOENIX">🔥 Phoenix (Red)</option>
                    <option value="GRIFFIN">🦅 Griffin (Green)</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-500">Awarding Faculty</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-500">Merit Category &amp; Weight</label>
                <select
                  value={selectedMeritId}
                  onChange={(e) => setSelectedMeritId(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                >
                  {meritTypes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.default_points > 0 ? `+${m.default_points}` : m.default_points} pts)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-500">Specific Praise Reason / Context</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Demonstrated exceptional peer empathy by helping a classmate complete laboratory observations."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 font-medium focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAwardModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl shadow-xs transition"
                >
                  {submitting ? "Awarding..." : "Confirm & Award Points"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE MTSS INTERVENTION */}
      {interventionModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="space-y-1 border-b border-stone-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-black">
                <Shield className="w-3 h-3 text-indigo-600" /> MTSS Behavioral Support Plan
              </div>
              <h3 className="text-lg font-black text-stone-900">Initiate Pastoral Support</h3>
              <p className="text-xs text-stone-500">Structured tier 2/3 intervention with assigned counselor follow-ups.</p>
            </div>

            <form onSubmit={handleCreateInterventionSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-stone-500">Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Siddharth Rao"
                  value={intStudentName}
                  onChange={(e) => setIntStudentName(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-500">MTSS Tier</label>
                  <select
                    value={intTier}
                    onChange={(e) => setIntTier(e.target.value as any)}
                    className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  >
                    <option value="TIER_1">Tier 1 (Universal)</option>
                    <option value="TIER_2">Tier 2 (Targeted Check-in)</option>
                    <option value="TIER_3">Tier 3 (Intensive Behavioral)</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-500">Assigned Counselor</label>
                  <input
                    type="text"
                    value={intCounselor}
                    onChange={(e) => setIntCounselor(e.target.value)}
                    className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-500">Trigger Reason / Observations</label>
                <input
                  type="text"
                  placeholder="e.g. Repeated task avoidance and peer conflict during unstructured breaks"
                  value={intTrigger}
                  onChange={(e) => setIntTrigger(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-stone-500">Actionable Support Strategy</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Daily Check-In/Check-Out (CICO) with counselor at 08:15 AM. Designated quiet sensory break card."
                  value={intStrategy}
                  onChange={(e) => setIntStrategy(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 font-medium focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInterventionModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {submitting ? "Saving..." : "Create MTSS Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
