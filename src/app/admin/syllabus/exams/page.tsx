"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FileQuestion, Plus, Edit3, Trash2, Printer, CheckCircle2, 
  BookOpen, Layers, Award, Sparkles, Filter, RefreshCw
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getAcademicSubjects, getExamBlueprints, 
  saveExamBlueprint, deleteExamBlueprint 
} from "@/app/actions/syllabus-core";

export default function ExamBlueprintsPage() {
  const { activeCampusId } = useCampusContext();
  const [selectedClass, setSelectedClass] = useState("Grade 5");
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState<any>(null);
  const [availableChapters, setAvailableChapters] = useState<any[]>([]);
  const [printBlueprint, setPrintBlueprint] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    exam_name: "Mid-Term Examination 2026",
    class_name: "Grade 5",
    subject_id: "",
    total_marks: 80,
    duration_minutes: 180,
    blueprint_notes: "Section A: 10 MCQs (1m each)\nSection B: 6 Short Answer (2m each)\nSection C: 6 Long Answer (4m each)\nSection D: 2 Case Studies (5m each)",
    selected_chapter_ids: [] as string[],
    weightage_breakdown: [] as Array<{ chapter: string; marks: number; percentage: number }>,
    status: "Published"
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, [activeCampusId, selectedClass, selectedSession]);

  useEffect(() => {
    loadBlueprints();
  }, [activeCampusId, selectedClass, selectedSession]);

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

  async function loadBlueprints() {
    setIsLoading(true);
    try {
      const res = await getExamBlueprints(activeCampusId, selectedSession, selectedClass);
      if (res.success && res.data) {
        setBlueprints(res.data);
      }
    } catch (e) {
      console.error("Error loading blueprints:", e);
    } finally {
      setIsLoading(false);
    }
  }

  function openAddBlueprint() {
    setEditingBlueprint(null);
    const sub = subjects[0];
    const chs = sub?.syllabus_chapters || [];
    setAvailableChapters(chs);
    
    // Default weightage
    const initialChapterIds = chs.map((c: any) => c.id);
    const marksPerCh = chs.length > 0 ? Math.round(80 / chs.length) : 20;
    const initialBreakdown = chs.map((c: any) => ({
      chapter: c.chapter_name,
      marks: marksPerCh,
      percentage: chs.length > 0 ? Math.round(100 / chs.length) : 0
    }));

    setForm({
      exam_name: "Mid-Term Examination 2026",
      class_name: selectedClass,
      subject_id: sub?.id || "",
      total_marks: 80,
      duration_minutes: 180,
      blueprint_notes: "Section A: 10 MCQs (1m each)\nSection B: 6 Short Answer (2m each)\nSection C: 6 Long Answer (4m each)\nSection D: 2 Case Studies (5m each)",
      selected_chapter_ids: initialChapterIds,
      weightage_breakdown: initialBreakdown,
      status: "Published"
    });
    setModalOpen(true);
  }

  function openEditBlueprint(bp: any) {
    setEditingBlueprint(bp);
    const sub = subjects.find(s => s.id === bp.subject_id);
    setAvailableChapters(sub?.syllabus_chapters || []);
    setForm({
      exam_name: bp.exam_name,
      class_name: bp.class_name,
      subject_id: bp.subject_id,
      total_marks: bp.total_marks || 80,
      duration_minutes: bp.duration_minutes || 180,
      blueprint_notes: bp.blueprint_notes || "",
      selected_chapter_ids: bp.selected_chapter_ids || [],
      weightage_breakdown: bp.weightage_breakdown || [],
      status: bp.status || "Published"
    });
    setModalOpen(true);
  }

  function handleChapterToggle(ch: any) {
    const isSelected = form.selected_chapter_ids.includes(ch.id);
    let newSelected: string[];
    let newBreakdown = [...form.weightage_breakdown];

    if (isSelected) {
      newSelected = form.selected_chapter_ids.filter(id => id !== ch.id);
      newBreakdown = newBreakdown.filter(b => b.chapter !== ch.chapter_name);
    } else {
      newSelected = [...form.selected_chapter_ids, ch.id];
      newBreakdown.push({ chapter: ch.chapter_name, marks: 15, percentage: 0 });
    }

    // Recalculate percentage
    const totalMarks = Number(form.total_marks) || 80;
    newBreakdown = newBreakdown.map(b => ({
      ...b,
      percentage: totalMarks > 0 ? Math.round((b.marks / totalMarks) * 100) : 0
    }));

    setForm({
      ...form,
      selected_chapter_ids: newSelected,
      weightage_breakdown: newBreakdown
    });
  }

  function handleWeightageChange(idx: number, marks: number) {
    const newBreakdown = [...form.weightage_breakdown];
    const totalMarks = Number(form.total_marks) || 80;
    newBreakdown[idx].marks = marks;
    newBreakdown[idx].percentage = totalMarks > 0 ? Math.round((marks / totalMarks) * 100) : 0;
    setForm({ ...form, weightage_breakdown: newBreakdown });
  }

  async function handleSaveBlueprint(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject_id || !form.exam_name) {
      alert("Please select subject and enter exam name.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveExamBlueprint({
        id: editingBlueprint?.id,
        campus_id: activeCampusId,
        academic_session: selectedSession,
        ...form
      });
      if (res.success) {
        setModalOpen(false);
        loadBlueprints();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteBlueprint(id: string) {
    if (!confirm("Delete this exam syllabus blueprint?")) return;
    const res = await deleteExamBlueprint(id);
    if (res.success) loadBlueprints();
  }

  function handlePrintPreview(bp: any) {
    setPrintBlueprint(bp);
    setTimeout(() => {
      window.print();
    }, 300);
  }

  const currentMarksSum = form.weightage_breakdown.reduce((s, b) => s + Number(b.marks || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Assessment Engine
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Exam Blueprint Generator</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <FileQuestion className="w-8 h-8 text-amber-600" />
            Exam Syllabus & Question Paper Blueprints
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Map chapters to exams, set question mark distributions, and generate printable blueprints for teachers and parents.
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
              {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={openAddBlueprint}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Create Exam Blueprint
          </button>
        </div>
      </div>

      {/* Blueprints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blueprints.length === 0 ? (
          <div className="md:col-span-2 bg-white p-12 text-center rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <FileQuestion className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-black text-stone-900">No Exam Blueprints Created Yet</h3>
            <p className="text-xs text-stone-500">Click "+ Create Exam Blueprint" to formulate chapter marks and test blueprints.</p>
          </div>
        ) : (
          blueprints.map((bp) => (
            <div key={bp.id} className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded">
                      {bp.class_name} • {bp.academic_subjects?.name}
                    </span>
                    <h3 className="text-lg font-black text-stone-900 mt-1">
                      {bp.exam_name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePrintPreview(bp)}
                      className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
                      title="Print Blueprint"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditBlueprint(bp)}
                      className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
                      title="Edit Blueprint"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlueprint(bp.id)}
                      className="p-2 bg-stone-100 hover:bg-red-100 text-red-600 rounded-xl transition"
                      title="Delete Blueprint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Meta details */}
                <div className="flex items-center gap-4 text-xs font-mono font-bold text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <span>Total Marks: <strong className="text-stone-900">{bp.total_marks}M</strong></span>
                  <span>Duration: <strong className="text-stone-900">{bp.duration_minutes} Mins</strong></span>
                  <span>Status: <strong className="text-emerald-700">{bp.status}</strong></span>
                </div>

                {/* Chapter Marks Breakdown */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-stone-700 block text-[11px] uppercase tracking-wider">
                    Included Chapters & Weightage:
                  </span>
                  <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
                    {(bp.weightage_breakdown || []).map((w: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-white text-xs">
                        <span className="font-semibold text-stone-800">{w.chapter}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <strong className="text-stone-900">{w.marks} Marks</strong>
                          <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                            {w.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {bp.blueprint_notes && (
                  <div className="text-[11px] text-stone-500 italic bg-stone-50/50 p-2.5 rounded-xl">
                    "{bp.blueprint_notes}"
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
                <span className="text-stone-400">Published for Session {bp.academic_session}</span>
                <button
                  type="button"
                  onClick={() => openEditBlueprint(bp)}
                  className="text-amber-800 font-bold hover:underline"
                >
                  Edit Question Blueprint →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: CREATE / EDIT EXAM BLUEPRINT */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {editingBlueprint ? "Edit Exam Blueprint" : `New Exam Blueprint (${selectedClass})`}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveBlueprint} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Exam Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Mid-Term Examination 2026"
                    value={form.exam_name}
                    onChange={(e) => setForm({ ...form, exam_name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Subject *</label>
                  <select
                    value={form.subject_id}
                    onChange={(e) => {
                      const sId = e.target.value;
                      const sub = subjects.find(s => s.id === sId);
                      const chs = sub?.syllabus_chapters || [];
                      setAvailableChapters(chs);
                      setForm({
                        ...form,
                        subject_id: sId,
                        selected_chapter_ids: chs.map((c: any) => c.id),
                        weightage_breakdown: chs.map((c: any) => ({
                          chapter: c.chapter_name,
                          marks: Math.round(80 / (chs.length || 1)),
                          percentage: Math.round(100 / (chs.length || 1))
                        }))
                      });
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={form.total_marks}
                    onChange={(e) => setForm({ ...form, total_marks: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="10"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="30"
                    max="300"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Chapters Inclusion Checklist */}
              <div>
                <label className="font-bold text-stone-700 block mb-1.5">
                  Select Chapters Included in this Exam:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200 max-h-40 overflow-y-auto">
                  {availableChapters.map((ch) => {
                    const isChecked = form.selected_chapter_ids.includes(ch.id);
                    return (
                      <label key={ch.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleChapterToggle(ch)}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span className="font-semibold text-stone-800 text-[11.5px]">
                          Ch {ch.chapter_number}: {ch.chapter_name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Weightage Marks Editor Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-stone-700 block">
                    Marks Weightage per Chapter:
                  </label>
                  <span className={`font-mono text-[11px] font-bold ${
                    currentMarksSum === form.total_marks ? 'text-emerald-700' : 'text-amber-800'
                  }`}>
                    Sum: {currentMarksSum} / {form.total_marks} Marks
                  </span>
                </div>

                <div className="border border-stone-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-2.5">Chapter</th>
                        <th className="p-2.5 w-28">Allocated Marks</th>
                        <th className="p-2.5 w-20 text-right">Weight %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {form.weightage_breakdown.map((w, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-semibold text-stone-800">{w.chapter}</td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={w.marks}
                              onChange={(e) => handleWeightageChange(idx, Number(e.target.value))}
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 font-mono font-bold text-stone-900"
                              min="0"
                              max={form.total_marks}
                            />
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-stone-600">
                            {w.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Question Paper Pattern & Blueprint Notes</label>
                <textarea
                  value={form.blueprint_notes}
                  onChange={(e) => setForm({ ...form, blueprint_notes: e.target.value })}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl shadow-xs">
                  {isSaving ? "Saving..." : editingBlueprint ? "Update Blueprint" : "Publish Blueprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
