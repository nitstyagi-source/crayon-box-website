"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, Plus, Edit3, Trash2, CheckCircle2, 
  Clock, ShieldAlert, BookOpen, Calendar, RefreshCw
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getAcademicSubjects, getCatchUpRemedialPlans, 
  saveCatchUpPlan, deleteCatchUpPlan 
} from "@/app/actions/syllabus-core";

export default function CatchUpRemedialPage() {
  const { activeCampusId } = useCampusContext();
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [availableChapters, setAvailableChapters] = useState<any[]>([]);
  const [form, setForm] = useState({
    class_name: "Grade 5",
    subject_id: "",
    chapter_id: "",
    delay_percentage: 12.0,
    reason_for_delay: "",
    remedial_action_plan: "",
    additional_periods_allocated: 4,
    target_completion_date: "",
    assigned_teacher: "",
    status: "Active"
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, [activeCampusId, selectedClass, selectedSession]);

  useEffect(() => {
    loadPlans();
  }, [activeCampusId, selectedClass, selectedSession]);

  async function loadSubjects() {
    try {
      const res = await getAcademicSubjects(activeCampusId, selectedSession);
      if (res.success && res.data) {
        setSubjects(res.data);
      }
    } catch (e) {
      console.error("Error loading subjects:", e);
    }
  }

  async function loadPlans() {
    setIsLoading(true);
    try {
      const res = await getCatchUpRemedialPlans(activeCampusId, selectedSession, selectedClass);
      if (res.success && res.data) {
        setPlans(res.data);
      }
    } catch (e) {
      console.error("Error loading remedial plans:", e);
    } finally {
      setIsLoading(false);
    }
  }

  function openAddPlan() {
    setEditingPlan(null);
    const sub = subjects[0];
    setAvailableChapters(sub?.syllabus_chapters || []);
    setForm({
      class_name: sub?.class_name || "Grade 5",
      subject_id: sub?.id || "",
      chapter_id: sub?.syllabus_chapters?.[0]?.id || "",
      delay_percentage: 12.0,
      reason_for_delay: "",
      remedial_action_plan: "",
      additional_periods_allocated: 4,
      target_completion_date: "",
      assigned_teacher: sub?.teacher_name || "",
      status: "Active"
    });
    setModalOpen(true);
  }

  function openEditPlan(p: any) {
    setEditingPlan(p);
    const sub = subjects.find(s => s.id === p.subject_id);
    setAvailableChapters(sub?.syllabus_chapters || []);
    setForm({
      class_name: p.class_name,
      subject_id: p.subject_id,
      chapter_id: p.chapter_id,
      delay_percentage: Number(p.delay_percentage || 10),
      reason_for_delay: p.reason_for_delay,
      remedial_action_plan: p.remedial_action_plan,
      additional_periods_allocated: p.additional_periods_allocated || 4,
      target_completion_date: p.target_completion_date || "",
      assigned_teacher: p.assigned_teacher || "",
      status: p.status || "Active"
    });
    setModalOpen(true);
  }

  async function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject_id || !form.chapter_id || !form.reason_for_delay || !form.remedial_action_plan) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveCatchUpPlan({
        id: editingPlan?.id,
        campus_id: activeCampusId,
        ...form
      });
      if (res.success) {
        setModalOpen(false);
        loadPlans();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePlan(id: string) {
    if (!confirm("Delete this catch-up plan?")) return;
    const res = await deleteCatchUpPlan(id);
    if (res.success) loadPlans();
  }

  const activeCount = plans.filter(p => p.status === 'Active' || p.status === 'In Progress').length;
  const resolvedCount = plans.filter(p => p.status === 'Resolved').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Academic Intervention
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Catch-Up & Remedial Operations</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            Catch-Up & Remedial Planning Hub
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Formulate targeted remedial plans, allocate zero-period catch-up schedules, and eliminate curriculum delays.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-stone-400 font-bold">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-xs font-black text-stone-800 focus:outline-none"
            >
              <option value="All">All Grades</option>
              {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={openAddPlan}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Create Catch-Up Plan
          </button>
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Interventions</span>
          <div className="text-2xl font-black text-stone-900">{plans.length}</div>
          <p className="text-[11px] text-stone-500">Curriculum remedial plans</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Active & In Progress</span>
          <div className="text-2xl font-black text-amber-600">{activeCount}</div>
          <p className="text-[11px] text-amber-800 font-bold">Requires coordinator monitoring</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Resolved Interventions</span>
          <div className="text-2xl font-black text-emerald-600">{resolvedCount}</div>
          <p className="text-[11px] text-emerald-800 font-bold">Successfully caught up</p>
        </div>
      </div>

      {/* Plans List */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-black text-stone-900">
          Remedial & Pacing Interventions ({plans.length})
        </h3>

        {plans.length === 0 ? (
          <p className="text-xs text-stone-400 py-8 text-center">
            No remedial catch-up plans created. All curriculum chapters are operating smoothly.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((p) => (
              <div key={p.id} className="border border-stone-200 rounded-2xl p-5 space-y-3 bg-stone-50/40 hover:bg-white transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-stone-900 text-white px-2 py-0.5 rounded">
                        {p.class_name}
                      </span>
                      <strong className="text-stone-900 font-bold">{p.academic_subjects?.name}</strong>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Chapter: <strong>{p.syllabus_chapters?.chapter_name}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-800 font-bold text-[10px] px-2 py-0.5 rounded">
                      {p.delay_percentage}% Delay
                    </span>
                    <button onClick={() => openEditPlan(p)} className="p-1 text-stone-400 hover:text-stone-800">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeletePlan(p.id)} className="p-1 text-stone-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs bg-white p-3 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-stone-400 block text-[10px] font-bold uppercase">Root Cause / Delay Reason:</span>
                    <p className="text-stone-700">{p.reason_for_delay}</p>
                  </div>
                  <div className="pt-1 border-t border-stone-100">
                    <span className="text-amber-800 block text-[10px] font-bold uppercase">Remedial Action Plan:</span>
                    <p className="text-stone-800 font-medium italic">"{p.remedial_action_plan}"</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-stone-500 pt-1">
                  <span>Faculty: <strong className="text-stone-800">{p.assigned_teacher || 'Assigned Staff'}</strong></span>
                  <span>Extra Periods: <strong className="text-amber-800 font-mono">+{p.additional_periods_allocated} Periods</strong></span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    p.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT CATCH-UP PLAN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {editingPlan ? "Edit Remedial Plan" : "Formulate Catch-Up Intervention"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Subject *</label>
                  <select
                    value={form.subject_id}
                    onChange={(e) => {
                      const sId = e.target.value;
                      const sub = subjects.find(s => s.id === sId);
                      setAvailableChapters(sub?.syllabus_chapters || []);
                      setForm({ 
                        ...form, 
                        subject_id: sId, 
                        class_name: sub?.class_name || form.class_name, 
                        chapter_id: sub?.syllabus_chapters?.[0]?.id || "",
                        assigned_teacher: sub?.teacher_name || form.assigned_teacher
                      });
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Chapter Master *</label>
                  <select
                    value={form.chapter_id}
                    onChange={(e) => setForm({ ...form, chapter_id: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  >
                    <option value="">-- Select Chapter --</option>
                    {availableChapters.map(ch => (
                      <option key={ch.id} value={ch.id}>
                        Ch {ch.chapter_number}: {ch.chapter_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Delay %</label>
                  <input
                    type="number"
                    value={form.delay_percentage}
                    onChange={(e) => setForm({ ...form, delay_percentage: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Extra Periods</label>
                  <input
                    type="number"
                    value={form.additional_periods_allocated}
                    onChange={(e) => setForm({ ...form, additional_periods_allocated: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="1"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Root Cause / Reason for Delay *</label>
                <textarea
                  placeholder="e.g. Teacher was on medical leave; students required extra practical demonstration"
                  value={form.reason_for_delay}
                  onChange={(e) => setForm({ ...form, reason_for_delay: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Remedial Action Plan *</label>
                <textarea
                  placeholder="e.g. Conduct 2 zero-period problem solving sessions and distribute concise study summaries"
                  value={form.remedial_action_plan}
                  onChange={(e) => setForm({ ...form, remedial_action_plan: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold text-stone-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Assigned Teacher</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sunita Sharma"
                    value={form.assigned_teacher}
                    onChange={(e) => setForm({ ...form, assigned_teacher: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={form.target_completion_date}
                    onChange={(e) => setForm({ ...form, target_completion_date: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl shadow-xs">
                  {isSaving ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
