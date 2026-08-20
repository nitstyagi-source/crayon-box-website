"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, Plus, CheckCircle2, Clock, 
  Printer, FileText, Calendar, Layers, 
  Sparkles, Award, ArrowRight, Download
} from "lucide-react";
import { 
  getAcademicSubjects, getSubjectFullSyllabus, 
  getTeachingDiaryLogs, logTeachingPeriod,
  getGeneratedPapers
} from "@/app/actions/syllabus-core";
import PdfUploader from "@/components/ui/PdfUploader";

export default function TeacherAcademicsPage() {
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [teacherName, setTeacherName] = useState("Dr. Sunita Sharma");
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [fullSyllabus, setFullSyllabus] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [generatedPapers, setGeneratedPapers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lesson Log Modal
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    subject_id: "",
    chapter_id: "",
    teacher_name: "Dr. Sunita Sharma",
    lesson_date: new Date().toISOString().split("T")[0],
    period_number: 1,
    topic_title: "",
    learning_objective: "",
    teaching_method: "Interactive Lecture & Smartboard",
    teaching_aid: "Smartboard, Flashcards",
    classwork: "",
    homework: "",
    assessment_type: "Worksheet"
  });

  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    loadTeacherSubjects();
  }, [selectedSession, teacherName]);

  useEffect(() => {
    if (activeSubjectId) {
      loadSubjectDetails(activeSubjectId);
    }
  }, [activeSubjectId, selectedSession]);

  async function loadTeacherSubjects() {
    setIsLoading(true);
    try {
      const res = await getAcademicSubjects("", selectedSession, undefined, teacherName);
      if (res.success && res.data) {
        setAssignedSubjects(res.data);
        if (res.data.length > 0) {
          setActiveSubjectId(res.data[0].id);
        } else {
          setActiveSubjectId("");
        }
      }
    } catch (e) {
      console.error("Error loading teacher subjects:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadSubjectDetails(subId: string) {
    try {
      const [sylRes, logRes, paperRes] = await Promise.all([
        getSubjectFullSyllabus(subId),
        getTeachingDiaryLogs("", subId, teacherName),
        getGeneratedPapers("", selectedSession, undefined, subId, teacherName)
      ]);

      if (sylRes.success && sylRes.data) setFullSyllabus(sylRes.data);
      if (logRes.success && logRes.data) setRecentLogs(logRes.data);
      if (paperRes.success && paperRes.data) setGeneratedPapers(paperRes.data);
    } catch (e) {
      console.error("Error loading subject details:", e);
    }
  }

  async function handleLogSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!logForm.subject_id || !logForm.chapter_id || !logForm.topic_title) {
      alert("Please fill in Chapter and Topic title.");
      return;
    }

    setIsLogging(true);
    try {
      const res = await logTeachingPeriod({
        campus_id: "",
        ...logForm,
        teacher_name: teacherName
      });
      if (res.success) {
        alert("🎉 Classroom lesson logged! Chapter period counter incremented.");
        setLogModalOpen(false);
        if (activeSubjectId) loadSubjectDetails(activeSubjectId);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsLogging(false);
    }
  }

  const currentSubject = assignedSubjects.find(s => s.id === activeSubjectId);
  const allChapters = [
    ...(fullSyllabus?.units?.flatMap((u: any) => u.chapters || []) || []),
    ...(fullSyllabus?.unassignedChapters || [])
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans p-4 sm:p-6 lg:p-8">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Faculty Academics Workspace
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs font-bold">Assigned Subjects Only</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-600" />
            My Syllabus & Question Papers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome, <strong className="text-slate-900">{teacherName}</strong>. You have exclusive access to manage syllabus pacing, lesson diaries, and question papers for your assigned courses.
          </p>
        </div>

        {/* Academic Session Selector & Identity Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Session Switcher */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-slate-400 font-bold">Session:</span>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-900 focus:outline-none"
            >
              <option value="2026-2027">2026–2027 (Active)</option>
              <option value="2025-2026">2025–2026 (Archived)</option>
              <option value="2024-2025">2024–2025 (Archived)</option>
              <option value="2027-2028">2027–2028 (Upcoming)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!activeSubjectId) return;
              setLogForm({
                ...logForm,
                subject_id: activeSubjectId,
                chapter_id: allChapters[0]?.id || "",
                teacher_name: teacherName
              });
              setLogModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Log Classroom Period
          </button>
        </div>
      </div>

      {/* Horizontal Assigned Subjects Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {assignedSubjects.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No subjects assigned for session {selectedSession}.</p>
        ) : (
          assignedSubjects.map((sub) => {
            const isActive = sub.id === activeSubjectId;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveSubjectId(sub.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black transition shrink-0 ${
                  isActive 
                    ? "bg-white text-slate-900 shadow-xs border border-slate-300 ring-2 ring-emerald-500/20" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: sub.color_code || '#10B981' }}
                />
                <span>{sub.name} ({sub.class_name})</span>
                <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                  {sub.completionPercentage}% Done
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Main Subject Workspace */}
      {currentSubject ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Syllabus Tree & Progress */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Subject Overview Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                    {currentSubject.class_name} • {currentSubject.category}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    {currentSubject.name}
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-emerald-600">
                    {currentSubject.completionPercentage}%
                  </span>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Syllabus Delivered</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${currentSubject.completionPercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 font-semibold text-slate-700">
                <div>Chapters Completed: <strong className="text-slate-900">{currentSubject.chaptersCount} Ch</strong></div>
                <div>Weekly Load: <strong className="text-slate-900">{currentSubject.weekly_periods} Periods/Week</strong></div>
              </div>
            </div>

            {/* Chapters & Units List */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Course Curriculum & Chapter Outline
              </h3>

              <div className="space-y-3">
                {allChapters.map((ch: any) => (
                  <div key={ch.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-slate-900 block text-sm">
                          Ch {ch.chapter_number}: {ch.chapter_name}
                        </strong>
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          {ch.learning_objectives || 'Master core competency learning outcomes.'}
                        </span>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ch.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          ch.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {ch.status}
                        </span>
                        <div className="text-[11px] text-slate-600 font-bold mt-1">
                          {ch.completed_periods || 0} / {ch.estimated_periods} Periods
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Question Papers & Diary Logs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Question Papers for this Subject */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-amber-600" />
                  Subject Question Papers
                </h3>
                <Link
                  href="/admin/syllabus/question-papers"
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  Open Full Studio →
                </Link>
              </div>

              <div className="space-y-3">
                {generatedPapers.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No question papers created for this subject yet.</p>
                ) : (
                  generatedPapers.map((paper) => (
                    <div key={paper.id} className="p-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/30 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-slate-900 block">{paper.exam_title}</strong>
                          <span className="text-slate-500 text-[11px] font-mono">{paper.max_marks} Marks • {paper.duration_minutes} Mins</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          {paper.status}
                        </span>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Link
                          href="/admin/syllabus/question-papers"
                          className="text-[11px] text-amber-800 font-bold hover:underline flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" /> Preview & Print Paper →
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Teaching Diary Logs */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  My Recent Lesson Logs
                </h3>
              </div>

              <div className="space-y-3">
                {recentLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No lesson logs recorded yet.</p>
                ) : (
                  recentLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-900">{log.topic_title}</strong>
                        <span className="text-[10px] font-mono font-bold text-slate-500">{log.lesson_date}</span>
                      </div>
                      {log.homework && <p className="text-[11px] text-purple-900">HW: {log.homework}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-900">No Assigned Subjects Found</h3>
          <p className="text-xs text-slate-500">You are currently not mapped as the primary faculty for any subject in session {selectedSession}.</p>
        </div>
      )}

      {/* QUICK LOG PERIOD MODAL */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                Log Classroom Lesson & Increment Period
              </h3>
              <button onClick={() => setLogModalOpen(false)} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Chapter *</label>
                <select
                  value={logForm.chapter_id}
                  onChange={(e) => setLogForm({ ...logForm, chapter_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  required
                >
                  <option value="">-- Choose Chapter --</option>
                  {allChapters.map((ch: any) => (
                    <option key={ch.id} value={ch.id}>
                      Ch {ch.chapter_number}: {ch.chapter_name} ({ch.completed_periods || 0}/{ch.estimated_periods} periods)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lesson Date</label>
                  <input
                    type="date"
                    value={logForm.lesson_date}
                    onChange={(e) => setLogForm({ ...logForm, lesson_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Period #</label>
                  <input
                    type="number"
                    value={logForm.period_number}
                    onChange={(e) => setLogForm({ ...logForm, period_number: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                    min="1"
                    max="10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Topic Covered *</label>
                <input
                  type="text"
                  placeholder="e.g. Addition of Unlike Fractions with LCM"
                  value={logForm.topic_title}
                  onChange={(e) => setLogForm({ ...logForm, topic_title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Classwork</label>
                  <input
                    type="text"
                    placeholder="Exercise 4.4 Q1-Q5"
                    value={logForm.classwork}
                    onChange={(e) => setLogForm({ ...logForm, classwork: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Homework</label>
                  <input
                    type="text"
                    placeholder="Workbook Pg 28"
                    value={logForm.homework}
                    onChange={(e) => setLogForm({ ...logForm, homework: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setLogModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isLogging} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition">
                  {isLogging ? "Logging..." : "Save Lesson & Increment Period"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
