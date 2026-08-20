"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, Plus, Edit3, Trash2, CheckCircle2, 
  Clock, Filter, Layers, BookOpen, AlertCircle, RefreshCw
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getAcademicSubjects, getAnnualMonthlyPlanner, 
  saveMonthlyPlannerEntry, deleteMonthlyPlannerEntry 
} from "@/app/actions/syllabus-core";

const MONTHS = [
  "April", "May", "July", "August", "September", 
  "October", "November", "December", "January", "February"
];

export default function SyllabusPlannerPage() {
  const { activeCampusId } = useCampusContext();
  const [selectedClass, setSelectedClass] = useState("Grade 5");
  const [selectedSubjectId, setSelectedSubjectId] = useState("All");
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [plannerEntries, setPlannerEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [formData, setFormData] = useState({
    subject_id: "",
    chapter_id: "",
    month_name: "April",
    week_number: 1,
    planned_periods: 6,
    actual_periods: 0,
    status: "Planned"
  });

  const [availableChapters, setAvailableChapters] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, [activeCampusId, selectedClass, selectedSession]);

  useEffect(() => {
    loadPlanner();
  }, [activeCampusId, selectedSubjectId, selectedSession, selectedClass]);

  async function loadSubjects() {
    try {
      const res = await getAcademicSubjects(activeCampusId, selectedSession, selectedClass);
      if (res.success && res.data) {
        setSubjects(res.data);
      }
    } catch (e) {
      console.error("Error loading subjects:", e);
    }
  }

  async function loadPlanner() {
    setIsLoading(true);
    try {
      const res = await getAnnualMonthlyPlanner(activeCampusId, selectedSubjectId, selectedSession);
      if (res.success && res.data) {
        setPlannerEntries(res.data);
      }
    } catch (e) {
      console.error("Error loading planner:", e);
    } finally {
      setIsLoading(false);
    }
  }

  function openAddEntry(month?: string) {
    setEditingEntry(null);
    const subId = selectedSubjectId !== "All" ? selectedSubjectId : (subjects[0]?.id || "");
    const sub = subjects.find(s => s.id === subId);
    setAvailableChapters(sub?.syllabus_chapters || []);
    setFormData({
      subject_id: subId,
      chapter_id: sub?.syllabus_chapters?.[0]?.id || "",
      month_name: month || "April",
      week_number: 1,
      planned_periods: 6,
      actual_periods: 0,
      status: "Planned"
    });
    setModalOpen(true);
  }

  function openEditEntry(entry: any) {
    setEditingEntry(entry);
    const sub = subjects.find(s => s.id === entry.subject_id);
    setAvailableChapters(sub?.syllabus_chapters || []);
    setFormData({
      subject_id: entry.subject_id,
      chapter_id: entry.chapter_id,
      month_name: entry.month_name,
      week_number: entry.week_number || 1,
      planned_periods: entry.planned_periods || 6,
      actual_periods: entry.actual_periods || 0,
      status: entry.status || "Planned"
    });
    setModalOpen(true);
  }

  async function handleSaveEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.subject_id || !formData.chapter_id) {
      alert("Please select subject and chapter.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveMonthlyPlannerEntry({
        id: editingEntry?.id,
        campus_id: activeCampusId,
        academic_session: selectedSession,
        ...formData
      });
      if (res.success) {
        setModalOpen(false);
        loadPlanner();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteEntry(id: string) {
    if (!confirm("Remove this planned schedule entry?")) return;
    const res = await deleteMonthlyPlannerEntry(id);
    if (res.success) loadPlanner();
  }

  const classList = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Academic Timeline
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Annual & Monthly Planner</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-emerald-600" />
            Syllabus Annual & Monthly Planner
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Allocate chapter milestones and planned teaching periods across academic months (April to February).
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-stone-400 font-bold">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-xs font-black text-stone-800 focus:outline-none"
            >
              {classList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-stone-400 font-bold">Subject:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-transparent text-xs font-black text-stone-800 focus:outline-none"
            >
              <option value="All">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <button
            type="button"
            onClick={() => openAddEntry()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add Monthly Schedule
          </button>
        </div>
      </div>

      {/* Month-Wise Timeline Cards */}
      <div className="space-y-6">
        {MONTHS.map((month) => {
          const monthEntries = plannerEntries.filter((e) => e.month_name === month);
          const totalPlannedPeriods = monthEntries.reduce((sum, e) => sum + (e.planned_periods || 0), 0);
          const totalActualPeriods = monthEntries.reduce((sum, e) => sum + (e.actual_periods || 0), 0);

          return (
            <div key={month} className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
              
              {/* Month Header Bar */}
              <div className="bg-stone-50/80 px-6 py-4 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <h3 className="font-black text-stone-900 text-base">{month}</h3>
                  <span className="text-xs text-stone-400 font-bold">
                    • {monthEntries.length} Chapters Scheduled
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-stone-600 font-mono font-bold bg-white border border-stone-200 px-3 py-1 rounded-xl">
                    Planned: <strong className="text-stone-900">{totalPlannedPeriods} Periods</strong> | 
                    Delivered: <strong className="text-emerald-700">{totalActualPeriods} Periods</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => openAddEntry(month)}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Plan Chapter
                  </button>
                </div>
              </div>

              {/* Month Table */}
              <div className="p-6">
                {monthEntries.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-2">
                    No curriculum chapters mapped for {month}. Click "+ Plan Chapter" to schedule.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-3">Week</th>
                          <th className="p-3">Subject</th>
                          <th className="p-3">Chapter Name</th>
                          <th className="p-3 font-mono">Planned Periods</th>
                          <th className="p-3 font-mono">Actual Periods</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-center w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {monthEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-stone-50/60 transition">
                            <td className="p-3 font-bold text-stone-800">Week {entry.week_number}</td>
                            <td className="p-3">
                              <span 
                                className="font-bold px-2 py-0.5 rounded text-[11px] text-white"
                                style={{ backgroundColor: entry.academic_subjects?.color_code || '#3B82F6' }}
                              >
                                {entry.academic_subjects?.name} ({entry.academic_subjects?.class_name})
                              </span>
                            </td>
                            <td className="p-3 font-bold text-stone-900">
                              Ch {entry.syllabus_chapters?.chapter_number}: {entry.syllabus_chapters?.chapter_name}
                            </td>
                            <td className="p-3 font-mono font-bold text-stone-800">{entry.planned_periods}</td>
                            <td className="p-3 font-mono font-bold text-emerald-700">{entry.actual_periods}</td>
                            <td className="p-3 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                entry.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                entry.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                              }`}>
                                {entry.status}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => openEditEntry(entry)} className="p-1 text-stone-400 hover:text-stone-800">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteEntry(entry.id)} className="p-1 text-stone-400 hover:text-red-600">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT MONTHLY SCHEDULE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {editingEntry ? "Edit Planned Milestone" : "Schedule Chapter to Month"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Subject *</label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => {
                    const subId = e.target.value;
                    const sub = subjects.find(s => s.id === subId);
                    setAvailableChapters(sub?.syllabus_chapters || []);
                    setFormData({ ...formData, subject_id: subId, chapter_id: sub?.syllabus_chapters?.[0]?.id || "" });
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  required
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Chapter *</label>
                <select
                  value={formData.chapter_id}
                  onChange={(e) => setFormData({ ...formData, chapter_id: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  required
                >
                  <option value="">-- Choose Chapter --</option>
                  {availableChapters.map(ch => (
                    <option key={ch.id} value={ch.id}>
                      Ch {ch.chapter_number}: {ch.chapter_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Month *</label>
                  <select
                    value={formData.month_name}
                    onChange={(e) => setFormData({ ...formData, month_name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Week</label>
                  <select
                    value={formData.week_number}
                    onChange={(e) => setFormData({ ...formData, week_number: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value={1}>Week 1</option>
                    <option value={2}>Week 2</option>
                    <option value={3}>Week 3</option>
                    <option value={4}>Week 4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Planned Periods</label>
                  <input
                    type="number"
                    value={formData.planned_periods}
                    onChange={(e) => setFormData({ ...formData, planned_periods: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Actual Delivered</label>
                  <input
                    type="number"
                    value={formData.actual_periods}
                    onChange={(e) => setFormData({ ...formData, actual_periods: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="0"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs">
                  {isSaving ? "Saving..." : editingEntry ? "Update Schedule" : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
