"use client";

import { useState, useEffect } from "react";
import { 
  BookMarked, Plus, Trash2, Calendar, Clock, 
  CheckCircle2, BookOpen, Layers, Award, Sparkles, Filter, RefreshCw
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getAcademicSubjects, getSubjectFullSyllabus, 
  logTeachingPeriod, getTeachingDiaryLogs, deleteTeachingLog 
} from "@/app/actions/syllabus-core";

export default function TeachingDiaryPage() {
  const { activeCampusId } = useCampusContext();
  const [selectedClass, setSelectedClass] = useState("Grade 5");
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string>("");
  const [fullSyllabus, setFullSyllabus] = useState<any>(null);
  const [diaryLogs, setDiaryLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogging, setIsLogging] = useState(false);

  // Lesson Log Form
  const [form, setForm] = useState({
    subject_id: "",
    chapter_id: "",
    topic_id: "",
    teacher_name: "Dr. Sunita Sharma",
    lesson_date: new Date().toISOString().split("T")[0],
    period_number: 1,
    topic_title: "",
    learning_objective: "",
    teaching_method: "Interactive Lecture & Smartboard",
    teaching_aid: "Smartboard, Flashcards",
    classwork: "",
    homework: "",
    assessment_type: "Worksheet",
    remarks: ""
  });

  useEffect(() => {
    loadSubjects();
    loadDiaryLogs();
  }, [activeCampusId, selectedClass, selectedSession]);

  useEffect(() => {
    if (activeSubjectId) {
      loadFullSyllabus(activeSubjectId);
      loadDiaryLogs(activeSubjectId);
    }
  }, [activeSubjectId]);

  async function loadSubjects() {
    try {
      const res = await getAcademicSubjects(activeCampusId, selectedSession, selectedClass);
      if (res.success && res.data) {
        setSubjects(res.data);
        if (res.data.length > 0 && !activeSubjectId) {
          setActiveSubjectId(res.data[0].id);
          setForm(prev => ({ 
            ...prev, 
            subject_id: res.data[0].id, 
            teacher_name: res.data[0].teacher_name || prev.teacher_name 
          }));
        }
      }
    } catch (e) {
      console.error("Error loading subjects:", e);
    }
  }

  async function loadFullSyllabus(subjectId: string) {
    try {
      const res = await getSubjectFullSyllabus(subjectId);
      if (res.success && res.data) {
        setFullSyllabus(res.data);
        const firstCh = res.data.units?.[0]?.chapters?.[0] || res.data.unassignedChapters?.[0];
        if (firstCh) {
          setForm(prev => ({ ...prev, chapter_id: firstCh.id, topic_title: firstCh.topics?.[0]?.topic_name || "" }));
        }
      }
    } catch (e) {
      console.error("Error loading syllabus:", e);
    }
  }

  async function loadDiaryLogs(subjectId?: string) {
    setIsLoading(true);
    try {
      const res = await getTeachingDiaryLogs(activeCampusId, subjectId);
      if (res.success && res.data) {
        setDiaryLogs(res.data);
      }
    } catch (e) {
      console.error("Error loading diary logs:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject_id || !form.chapter_id || !form.topic_title) {
      alert("Please fill in Subject, Chapter, and Topic covered.");
      return;
    }

    setIsLogging(true);
    try {
      const res = await logTeachingPeriod({
        campus_id: activeCampusId,
        ...form
      });
      if (res.success) {
        alert("🎉 Lesson log recorded! Chapter completed period counter incremented.");
        loadDiaryLogs(activeSubjectId);
        loadFullSyllabus(activeSubjectId);
        setForm(prev => ({
          ...prev,
          period_number: prev.period_number + 1,
          topic_title: "",
          learning_objective: "",
          classwork: "",
          homework: "",
          remarks: ""
        }));
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsLogging(false);
    }
  }

  async function handleDeleteLog(id: string) {
    if (!confirm("Delete this lesson diary entry?")) return;
    const res = await deleteTeachingLog(id);
    if (res.success) loadDiaryLogs(activeSubjectId);
  }

  const allChapters = [
    ...(fullSyllabus?.units?.flatMap((u: any) => u.chapters || []) || []),
    ...(fullSyllabus?.unassignedChapters || [])
  ];

  const currentChapter = allChapters.find(ch => ch.id === form.chapter_id);
  const chapterProgress = currentChapter 
    ? Math.min(100, Math.round(((currentChapter.completed_periods || 0) / (currentChapter.estimated_periods || 1)) * 100))
    : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Classroom Delivery
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Teacher Diary & Periods</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <BookMarked className="w-8 h-8 text-purple-600" />
            Teacher Diary & Live Period Tracker
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Log daily classroom lessons, homework assignments, teaching aids, and automatically increment period-based completion.
          </p>
        </div>

        {/* Grade Selector */}
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
          <span className="text-xs text-stone-400 font-bold">Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setActiveSubjectId("");
            }}
            className="bg-transparent text-xs font-black text-stone-800 focus:outline-none"
          >
            {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Workspace: Left Log Form, Right Live Progress & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Log Teaching Period */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-md">
              Fast Period Entry
            </span>
            <h3 className="text-lg font-black text-stone-900 mt-1">
              Log Classroom Lesson
            </h3>
          </div>

          <form onSubmit={handleLogSubmit} className="space-y-3.5 text-xs">
            
            {/* Subject Selector */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">Subject *</label>
              <select
                value={form.subject_id}
                onChange={(e) => {
                  const sId = e.target.value;
                  setActiveSubjectId(sId);
                  const sub = subjects.find(s => s.id === sId);
                  setForm({ ...form, subject_id: sId, teacher_name: sub?.teacher_name || form.teacher_name });
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                required
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
              </select>
            </div>

            {/* Chapter Selector */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">Chapter Master *</label>
              <select
                value={form.chapter_id}
                onChange={(e) => setForm({ ...form, chapter_id: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                required
              >
                <option value="">-- Select Chapter --</option>
                {allChapters.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    Ch {ch.chapter_number}: {ch.chapter_name} ({ch.completed_periods || 0}/{ch.estimated_periods} periods)
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Period */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Lesson Date</label>
                <input
                  type="date"
                  value={form.lesson_date}
                  onChange={(e) => setForm({ ...form, lesson_date: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Period #</label>
                <input
                  type="number"
                  value={form.period_number}
                  onChange={(e) => setForm({ ...form, period_number: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Topic Covered *</label>
              <input
                type="text"
                placeholder="e.g. Addition of Unlike Fractions with LCM"
                value={form.topic_title}
                onChange={(e) => setForm({ ...form, topic_title: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                required
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Learning Objective</label>
              <textarea
                placeholder="Students will be able to solve addition of fractions with unlike denominators"
                value={form.learning_objective}
                onChange={(e) => setForm({ ...form, learning_objective: e.target.value })}
                rows={2}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Teaching Method</label>
                <input
                  type="text"
                  placeholder="Smartboard, Activity"
                  value={form.teaching_method}
                  onChange={(e) => setForm({ ...form, teaching_method: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Teaching Aids</label>
                <input
                  type="text"
                  placeholder="Fraction Strips, Applet"
                  value={form.teaching_aid}
                  onChange={(e) => setForm({ ...form, teaching_aid: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Classwork</label>
                <input
                  type="text"
                  placeholder="Exercise 4.4 Q1-Q6"
                  value={form.classwork}
                  onChange={(e) => setForm({ ...form, classwork: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Homework</label>
                <input
                  type="text"
                  placeholder="Workbook Pg 32"
                  value={form.homework}
                  onChange={(e) => setForm({ ...form, homework: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLogging}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLogging ? "Saving Lesson..." : "Save Lesson & Increment Period"}
            </button>

          </form>
        </div>

        {/* Right Section: Live Period Tracker & History */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Live Period Progress Indicator Card */}
          {currentChapter && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                    Live Period Pacing Tracker
                  </span>
                  <h3 className="text-base font-black text-stone-900 mt-1">
                    Ch {currentChapter.chapter_number}: {currentChapter.chapter_name}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-purple-800">
                    {currentChapter.completed_periods || 0} / {currentChapter.estimated_periods}
                  </div>
                  <span className="text-[11px] text-stone-500 font-bold">Periods Completed</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-stone-600">Chapter Delivery</span>
                  <span className="text-stone-900 font-mono">{chapterProgress}%</span>
                </div>
                <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${chapterProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-stone-600 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                <span>Remaining to complete: <strong>{Math.max(0, (currentChapter.estimated_periods || 0) - (currentChapter.completed_periods || 0))} Periods</strong></span>
                <span className="font-bold text-purple-900">Status: {currentChapter.status}</span>
              </div>
            </div>
          )}

          {/* Historical Diary Logs Table */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Teaching Diary Logs ({diaryLogs.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              {diaryLogs.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">No teaching logs recorded for this subject.</p>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-2.5">Date & Period</th>
                      <th className="p-2.5">Topic Covered</th>
                      <th className="p-2.5">Method & Aids</th>
                      <th className="p-2.5">Homework</th>
                      <th className="p-2.5 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {diaryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50/60 transition">
                        <td className="p-2.5">
                          <strong className="text-stone-900 block">{log.lesson_date}</strong>
                          <span className="text-[10px] font-mono text-purple-700 font-bold">Period {log.period_number}</span>
                        </td>
                        <td className="p-2.5">
                          <strong className="text-stone-900 block">{log.topic_title}</strong>
                          <span className="text-[10.5px] text-stone-500">Ch: {log.syllabus_chapters?.chapter_name}</span>
                        </td>
                        <td className="p-2.5 text-stone-600">
                          <div>{log.teaching_method}</div>
                          {log.teaching_aid && <span className="text-[10px] text-stone-400">Aid: {log.teaching_aid}</span>}
                        </td>
                        <td className="p-2.5 text-stone-600">
                          {log.homework || '—'}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1 text-stone-400 hover:text-red-600 transition"
                            title="Delete log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
