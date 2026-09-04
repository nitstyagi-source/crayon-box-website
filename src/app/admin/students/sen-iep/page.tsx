"use client";

import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  Brain,
  Sparkles,
  Target,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Printer,
  Calendar,
  ShieldCheck,
  User,
  Users,
  Search,
  Filter,
  ArrowRight,
  BookOpen
} from "lucide-react";
import {
  getSenProfilesAction,
  getStudentIepDetailAction,
  createSenProfileAction,
  addIepAccommodationAction,
  addOrUpdateSmartGoalAction,
  logTherapySessionAction,
  SenProfileRecord,
  SenAccommodationRecord,
  SenSmartGoalRecord,
  SenSessionLogRecord
} from "@/app/actions/sen-iep-actions";

export default function SenIepStudioPage() {
  const [profiles, setProfiles] = useState<SenProfileRecord[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<{
    profile: SenProfileRecord;
    accommodations: SenAccommodationRecord[];
    goals: SenSmartGoalRecord[];
    sessions: SenSessionLogRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Profile Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newClassName, setNewClassName] = useState("Class 9B");
  const [newCategory, setNewCategory] = useState("Dyslexia & Phonological Processing");
  const [newSpecialist, setNewSpecialist] = useState("Dr. Sunita Rao (SEN Specialist)");
  const [newShadow, setNewShadow] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Add Goal Modal State
  const [addGoalModalOpen, setAddGoalModalOpen] = useState(false);
  const [goalDomain, setGoalDomain] = useState("ACADEMIC_LITERACY");
  const [goalTitle, setGoalTitle] = useState("");
  const [baselineLevel, setBaselineLevel] = useState("");
  const [targetCriterion, setTargetCriterion] = useState("");
  const [progressPct, setProgressPct] = useState(25);

  // Add Accommodation Modal State
  const [addAccomModalOpen, setAddAccomModalOpen] = useState(false);
  const [accomTitle, setAccomTitle] = useState("");
  const [accomCategory, setAccomCategory] = useState("EXAM");
  const [accomDetails, setAccomDetails] = useState("");

  // Log Therapy Session Modal State
  const [logSessionModalOpen, setLogSessionModalOpen] = useState(false);
  const [therapyType, setTherapyType] = useState("Remedial Reading & Phonology");
  const [sessionDuration, setSessionDuration] = useState(45);
  const [sessionObs, setSessionObs] = useState("");
  const [sessionRecs, setSessionRecs] = useState("");

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    try {
      const res = await getSenProfilesAction();
      if (res.success) {
        setProfiles(res.profiles);
        if (res.profiles.length > 0 && !selectedProfileId) {
          loadDetail(res.profiles[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(profileId: string) {
    setSelectedProfileId(profileId);
    setDetailLoading(true);
    try {
      const res = await getStudentIepDetailAction(profileId);
      if (res.success && res.profile) {
        setDetailData({
          profile: res.profile,
          accommodations: res.accommodations || [],
          goals: res.goals || [],
          sessions: res.sessions || []
        });
      }
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreateProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newStudentName.trim() || !newSummary.trim()) {
      alert("Please provide the student name and diagnostic summary.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSenProfileAction({
        studentName: newStudentName,
        className: newClassName,
        primaryCategory: newCategory,
        leadSpecialistName: newSpecialist,
        shadowEducatorName: newShadow,
        generalSummary: newSummary
      });

      if (res.success) {
        alert(res.message);
        setCreateModalOpen(false);
        setNewStudentName("");
        setNewSummary("");
        loadProfiles();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddGoalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProfileId || !goalTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await addOrUpdateSmartGoalAction({
        profileId: selectedProfileId,
        domain: goalDomain,
        goalTitle,
        baselineLevel,
        targetCriterion,
        progressPercentage: progressPct,
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      if (res.success) {
        alert(res.message);
        setAddGoalModalOpen(false);
        setGoalTitle("");
        setBaselineLevel("");
        setTargetCriterion("");
        loadDetail(selectedProfileId);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddAccommodationSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProfileId || !accomTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await addIepAccommodationAction({
        profileId: selectedProfileId,
        title: accomTitle,
        category: accomCategory,
        details: accomDetails
      });

      if (res.success) {
        alert(res.message);
        setAddAccomModalOpen(false);
        setAccomTitle("");
        setAccomDetails("");
        loadDetail(selectedProfileId);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogSessionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProfileId || !sessionObs.trim()) return;

    setSubmitting(true);
    try {
      const res = await logTherapySessionAction({
        profileId: selectedProfileId,
        specialistName: detailData?.profile.lead_specialist_name || "Dr. Sunita Rao",
        therapyType,
        durationMinutes: sessionDuration,
        keyObservations: sessionObs,
        recommendationsForTeachers: sessionRecs
      });

      if (res.success) {
        alert(res.message);
        setLogSessionModalOpen(false);
        setSessionObs("");
        setSessionRecs("");
        loadDetail(selectedProfileId);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const filteredProfiles = profiles.filter((p) => {
    const matchesCat = categoryFilter === "ALL" || p.primary_category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesSearch = p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.class_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-950 via-stone-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Brain className="w-3.5 h-3.5" />
            Inclusive Education &amp; Individualized Education Program (IEP / SEN)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <HeartPulse className="w-8 h-8 text-teal-400" />
            Special Educational Needs (SEN) Studio
          </h1>
          <p className="text-xs sm:text-sm text-teal-200/80 max-w-2xl">
            Longitudinal management of student formal accommodations (exam time extensions, scribes), SMART goal progression metrics, and clinical therapy audit logs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-white/20"
          >
            <Printer className="w-3.5 h-3.5 text-teal-300" /> Print Dossier
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" /> + Enroll Student in SEN
          </button>
        </div>
      </div>

      {/* Caseload Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Active SEN Caseload</div>
          <div className="text-2xl font-black text-stone-900 mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            {profiles.length} Students
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Exam Accommodations</div>
          <div className="text-2xl font-black text-stone-900 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Active Sync
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Avg SMART Goal Mastery</div>
          <div className="text-2xl font-black text-stone-900 mt-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            78% On-Track
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Mandatory Review</div>
          <div className="text-2xl font-black text-stone-900 mt-1 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Every 6 Months
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-stone-200 shadow-xs text-xs font-bold">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "Dyslexia", "ADHD", "Autism", "Speech", "Sensory"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl transition ${
                categoryFilter === cat
                  ? "bg-teal-700 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search student or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:bg-white w-full sm:w-64"
          />
        </div>
      </div>

      {/* Main Two-Pane Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Caseload Student Roster (5 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200 shadow-xs p-5 space-y-3">
          <div className="text-xs font-black text-stone-400 uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center justify-between">
            <span>Enrolled Students ({filteredProfiles.length})</span>
            <span className="text-[10px] text-teal-600">Click to View 360</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredProfiles.map((p) => {
              const isSelected = selectedProfileId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => loadDetail(p.id)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition space-y-2 ${
                    isSelected
                      ? "bg-teal-50/70 border-teal-300 ring-2 ring-teal-400/20 shadow-xs"
                      : "bg-stone-50/40 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-stone-900 text-sm">{p.student_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                      {p.class_name}
                    </span>
                  </div>

                  <div className="text-[11px] text-teal-800 font-bold">
                    {p.primary_category}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-200/50">
                    <span>Lead: <strong>{p.lead_specialist_name.split('(')[0]}</strong></span>
                    <span className="text-emerald-700 font-black font-mono">{p.avg_progress || 0}% Goal Met</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Student 360 IEP Detail Panel (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
          {detailLoading ? (
            <div className="py-16 text-center text-xs font-bold text-stone-400 animate-pulse">
              Loading Individualized Education Plan (IEP)...
            </div>
          ) : detailData ? (
            <div className="space-y-6">
              
              {/* Header Dossier Profile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[10px] font-black">
                    IEP Document Reference: CBS-SEN-{detailData.profile.id.slice(0, 6).toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-black text-stone-900 mt-1">
                    {detailData.profile.student_name}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {detailData.profile.class_name} • Primary Diagnosis: <strong>{detailData.profile.primary_category}</strong>
                  </p>
                </div>

                <div className="text-right text-xs space-y-1">
                  <div className="text-stone-400">Lead Specialist: <strong className="text-stone-800">{detailData.profile.lead_specialist_name}</strong></div>
                  {detailData.profile.shadow_educator_name && (
                    <div className="text-stone-400">Shadow Educator: <strong className="text-stone-800">{detailData.profile.shadow_educator_name}</strong></div>
                  )}
                  <div className="text-[10px] text-teal-700 font-mono font-bold">Next Review: {detailData.profile.next_iep_review_date || "Annual"}</div>
                </div>
              </div>

              {/* Diagnostic Summary */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                <div className="font-black text-stone-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" /> Clinical Diagnostic Profile &amp; Strengths
                </div>
                <p className="text-stone-600 leading-relaxed font-medium">
                  {detailData.profile.general_summary}
                </p>
              </div>

              {/* 1. Formal Accommodations Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Approved Formal Accommodations ({detailData.accommodations.length})
                  </h3>
                  <button
                    onClick={() => setAddAccomModalOpen(true)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Add Accommodation
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detailData.accommodations.map((acc) => (
                    <div key={acc.id} className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-emerald-950">{acc.title}</span>
                        <span className="text-[9px] uppercase font-mono font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {acc.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 font-medium">
                        {acc.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. SMART Goals Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-500" />
                    Longitudinal SMART Goals Progression ({detailData.goals.length})
                  </h3>
                  <button
                    onClick={() => setAddGoalModalOpen(true)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Add SMART Goal
                  </button>
                </div>

                <div className="space-y-3">
                  {detailData.goals.map((g) => (
                    <div key={g.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-stone-900 text-sm">{g.goal_title}</span>
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          {g.domain.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200/60">
                        <div><strong>Baseline:</strong> {g.baseline_level}</div>
                        <div><strong>Target:</strong> {g.target_criterion}</div>
                      </div>

                      {/* Progress Bar Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-stone-500">Mastery Milestone:</span>
                          <span className="font-mono text-teal-700 font-black">{g.progress_percentage}% Completed</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${g.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Therapy & Specialist Sessions Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Clinical Therapy &amp; Specialist Observations ({detailData.sessions.length})
                  </h3>
                  <button
                    onClick={() => setLogSessionModalOpen(true)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Log Session
                  </button>
                </div>

                <div className="space-y-2.5">
                  {detailData.sessions.map((s) => (
                    <div key={s.id} className="p-3.5 rounded-2xl border border-stone-200 bg-white text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-black text-stone-900 flex items-center gap-2">
                          <span>{s.therapy_type}</span>
                          <span className="text-[10px] text-stone-400 font-normal">({s.duration_minutes} mins)</span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">{s.session_date}</span>
                      </div>
                      <p className="text-[11px] text-stone-700">
                        <strong>Observations:</strong> {s.key_observations}
                      </p>
                      {s.recommendations_for_teachers && (
                        <p className="text-[10px] text-indigo-700 italic bg-indigo-50/50 p-2 rounded-xl">
                          💡 <strong>Teacher Tip:</strong> {s.recommendations_for_teachers}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="py-16 text-center text-xs font-bold text-stone-400">
              Select an enrolled SEN student from the caseload roster on the left.
            </div>
          )}
        </div>

      </div>

      {/* MODAL: CREATE SEN / IEP PROFILE */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="space-y-1 border-b border-stone-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[10px] font-black">
                <Brain className="w-3 h-3 text-teal-600" /> Inclusive Education Admission
              </div>
              <h3 className="text-lg font-black text-stone-900">Enroll Student in SEN</h3>
              <p className="text-xs text-stone-500">Initiate formal Individualized Education Program (IEP).</p>
            </div>

            <form onSubmit={handleCreateProfileSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-stone-500">Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maya Deshmukh"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-500">Class &amp; Section</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-stone-500">Lead Specialist</label>
                  <input
                    type="text"
                    value={newSpecialist}
                    onChange={(e) => setNewSpecialist(e.target.value)}
                    className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-500">Primary Educational Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                >
                  <option value="Dyslexia & Phonological Processing">Dyslexia & Phonological Processing</option>
                  <option value="ADHD & Executive Functioning">ADHD & Executive Functioning</option>
                  <option value="Autism Spectrum & Social Communication">Autism Spectrum & Social Communication</option>
                  <option value="Speech & Language Delay">Speech & Language Delay</option>
                  <option value="Physical / Sensory Support">Physical / Sensory Support</option>
                  <option value="Gifted & Accelerated Learning">Gifted & Accelerated Learning</option>
                </select>
              </div>

              <div>
                <label className="text-stone-500">Diagnostic Summary &amp; Strengths</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Mild expressive language delay with strong visual-spatial reasoning and peer empathy."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 font-medium focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {submitting ? "Enrolling..." : "Initialize IEP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SMART GOAL */}
      {addGoalModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="space-y-1 border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">Add SMART Goal</h3>
              <p className="text-xs text-stone-500">Specific, Measurable, Achievable, Relevant, and Time-bound target.</p>
            </div>

            <form onSubmit={handleAddGoalSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-stone-500">Goal Domain</label>
                <select
                  value={goalDomain}
                  onChange={(e) => setGoalDomain(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                >
                  <option value="ACADEMIC_LITERACY">Academic Literacy & Reading</option>
                  <option value="FOCUS_AND_EXECUTIVE">Focus & Executive Functioning</option>
                  <option value="SOCIAL_COMMUNICATION">Social Communication & Pragmatics</option>
                  <option value="EMOTIONAL_REGULATION">Emotional Regulation & Calm</option>
                </select>
              </div>

              <div>
                <label className="text-stone-500">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Independent Multisyllabic Word Decoding"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-stone-500">Baseline Level</label>
                <input
                  type="text"
                  placeholder="e.g. Currently decodes at 50 wpm with frequent phonemic hesitation"
                  value={baselineLevel}
                  onChange={(e) => setBaselineLevel(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-stone-500">Target Criterion</label>
                <input
                  type="text"
                  placeholder="e.g. 85+ wpm at 90% comprehension over 4 consecutive probes"
                  value={targetCriterion}
                  onChange={(e) => setTargetCriterion(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium focus:bg-white"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between text-stone-500 mb-1">
                  <span>Current Progress:</span>
                  <span className="font-mono text-teal-700 font-black">{progressPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPct}
                  onChange={(e) => setProgressPct(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddGoalModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {submitting ? "Saving..." : "Save Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD FORMAL ACCOMMODATION */}
      {addAccomModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="space-y-1 border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">Add Formal Accommodation</h3>
              <p className="text-xs text-stone-500">Legally recognized classroom or examination modification.</p>
            </div>

            <form onSubmit={handleAddAccommodationSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-stone-500">Accommodation Title</label>
                <input
                  type="text"
                  placeholder="e.g. 25% Extra Time on Written Examinations"
                  value={accomTitle}
                  onChange={(e) => setAccomTitle(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-stone-500">Category</label>
                <select
                  value={accomCategory}
                  onChange={(e) => setAccomCategory(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                >
                  <option value="EXAM">Examination Setting & Timing</option>
                  <option value="CLASSROOM">Classroom Instruction & Seating</option>
                  <option value="HOMEWORK">Homework & Material Modification</option>
                  <option value="SENSORY">Sensory & Emotional De-escalation</option>
                </select>
              </div>

              <div>
                <label className="text-stone-500">Policy Details &amp; Application</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Applicable for all midterm, pre-board, and summative assessments exceeding 45 minutes."
                  value={accomDetails}
                  onChange={(e) => setAccomDetails(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 font-medium focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddAccomModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {submitting ? "Saving..." : "Authorize Accommodation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG THERAPY SESSION */}
      {logSessionModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="space-y-1 border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">Log Clinical Therapy Session</h3>
              <p className="text-xs text-stone-500">Record specialist notes, interventions, and teacher guidance.</p>
            </div>

            <form onSubmit={handleLogSessionSubmit} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-500">Therapy Modality</label>
                  <select
                    value={therapyType}
                    onChange={(e) => setTherapyType(e.target.value)}
                    className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  >
                    <option value="Remedial Reading & Phonology">Remedial Reading & Phonology</option>
                    <option value="Occupational Therapy">Occupational Therapy</option>
                    <option value="Speech & Language Therapy">Speech & Language Therapy</option>
                    <option value="Behavioral Coaching">Behavioral Coaching</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-500">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-500">Key Observations</label>
                <textarea
                  rows={3}
                  placeholder="e.g. High enthusiasm when using multi-sensory letter tiles. Mastered 4-syllable root words."
                  value={sessionObs}
                  onChange={(e) => setSessionObs(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 font-medium focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-stone-500">Practical Recommendation for Classroom Teachers</label>
                <input
                  type="text"
                  placeholder="e.g. Provide written prompts 2 minutes before calling on student in whole-group discussions."
                  value={sessionRecs}
                  onChange={(e) => setSessionRecs(e.target.value)}
                  className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLogSessionModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {submitting ? "Logging..." : "Commit Session to Audit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
