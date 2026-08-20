"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, Plus, RefreshCw, CheckCircle2, AlertTriangle, 
  Clock, TrendingUp, Users, Calendar, ArrowRight, Award, 
  Sparkles, Filter, ChevronRight, ShieldAlert, BookMarked, FileQuestion
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getSyllabusDashboard, logTeachingPeriod, saveCatchUpPlan, getDistinctTeachers } from "@/app/actions/syllabus-core";

export default function SyllabusDashboardPage() {
  const { activeCampusId } = useCampusContext();
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [selectedTeacher, setSelectedTeacher] = useState("All");
  const [teacherList, setTeacherList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Quick Action Modal states
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [catchUpModalOpen, setCatchUpModalOpen] = useState(false);
  const [selectedSubjectForAction, setSelectedSubjectForAction] = useState<any>(null);

  // Form states
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

  const [catchUpForm, setCatchUpForm] = useState({
    subject_id: "",
    chapter_id: "",
    class_name: "Grade 5",
    delay_percentage: 12.0,
    reason_for_delay: "",
    remedial_action_plan: "",
    additional_periods_allocated: 4,
    target_completion_date: "",
    assigned_teacher: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, [activeCampusId, selectedSession]);

  useEffect(() => {
    loadDashboard();
  }, [activeCampusId, selectedClass, selectedSession, selectedTeacher]);

  async function loadTeachers() {
    try {
      const res = await getDistinctTeachers(activeCampusId, selectedSession);
      if (res.success && res.data) {
        setTeacherList(res.data);
      }
    } catch (e) {
      console.error("Error loading teachers:", e);
    }
  }

  async function loadDashboard() {
    setIsLoading(true);
    try {
      const res = await getSyllabusDashboard(
        activeCampusId, 
        selectedSession, 
        selectedClass, 
        selectedTeacher !== "All" ? selectedTeacher : undefined
      );
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (e) {
      console.error("Failed to load syllabus dashboard:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogPeriodSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!logForm.subject_id || !logForm.chapter_id || !logForm.topic_title) {
      alert("Please select subject, chapter, and enter topic title.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await logTeachingPeriod({
        campus_id: activeCampusId,
        ...logForm
      });
      if (res.success) {
        alert("🎉 Teaching period logged successfully!");
        setLogModalOpen(false);
        setLogForm({
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
        loadDashboard();
      } else {
        alert("Error: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCatchUpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!catchUpForm.subject_id || !catchUpForm.reason_for_delay || !catchUpForm.remedial_action_plan) {
      alert("Please fill in required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveCatchUpPlan({
        campus_id: activeCampusId,
        ...catchUpForm
      });
      if (res.success) {
        alert("🎉 Catch-up remedial plan created successfully!");
        setCatchUpModalOpen(false);
        loadDashboard();
      } else {
        alert("Error: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const classOptions = [
    "All", "Nursery", "LKG", "UKG", 
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"
  ];

  const subjects = dashboardData?.subjects || [];
  const stats = dashboardData?.stats || {
    totalSubjects: 0,
    avgCompletion: 0,
    onScheduleCount: 0,
    delayedCount: 0,
    activeRemedialPlans: 0
  };
  const catchupPlans = dashboardData?.catchupPlans || [];
  const recentLogs = dashboardData?.recentLessonLogs || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Academic Operations Command
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">CBSE / NEP 2020 Integrated</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Syllabus & Curriculum Dashboard
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Real-time tracking of syllabus pacing, period logs, learning outcomes, and remedial interventions.
          </p>
        </div>

        {/* Global Class, Session & Teacher Perspective Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          {/* Academic Session Selector */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-stone-400 font-bold">Session:</span>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-transparent text-xs font-black text-stone-900 focus:outline-none"
            >
              <option value="2026-2027">2026–2027 (Active)</option>
              <option value="2025-2026">2025–2026 (Archived)</option>
              <option value="2024-2025">2024–2025 (Archived)</option>
              <option value="2027-2028">2027–2028 (Upcoming)</option>
            </select>
          </div>

          {/* Teacher Subject Access Filter */}
          <div className="flex items-center gap-2 bg-purple-50/70 border border-purple-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-purple-700 font-bold">Teacher Access:</span>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="bg-transparent text-xs font-black text-purple-950 focus:outline-none max-w-[180px] truncate"
            >
              <option value="All">👑 Admin View (All Subjects)</option>
              {teacherList.map(t => (
                <option key={t.teacher_name} value={t.teacher_name}>
                  👨‍🏫 {t.teacher_name} ({t.subjects.length} Sub)
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
            >
              {classOptions.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All Grades" : c}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="p-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl border border-stone-200 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/admin/syllabus/curriculum"
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add Subject / Chapter
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Subjects</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{stats.totalSubjects}</div>
          <p className="text-[11px] text-stone-500">Across active grades</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Syllabus Delivery</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.avgCompletion}%</div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.avgCompletion}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">On Schedule (🟢)</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{stats.onScheduleCount}</div>
          <p className="text-[11px] text-blue-600 font-bold">Pacing target achieved</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Remedial Plans</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{stats.activeRemedialPlans}</div>
          <p className="text-[11px] text-stone-500">Active catch-up interventions</p>
        </div>

      </div>

      {/* Active Remedial Interventions Alert Banner (If Any) */}
      {catchupPlans.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Active Catch-Up Interventions ({catchupPlans.length})
            </div>
            <Link 
              href="/admin/syllabus/remedial" 
              className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
            >
              View All Remedials <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {catchupPlans.slice(0, 2).map((plan: any) => (
              <div key={plan.id} className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-stone-900">{plan.class_name} • {plan.academic_subjects?.name}</strong>
                    <span className="text-stone-500 block text-[11px] mt-0.5">Chapter: {plan.syllabus_chapters?.chapter_name}</span>
                  </div>
                  <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    {plan.delay_percentage}% Delay
                  </span>
                </div>
                <p className="text-stone-600 italic line-clamp-2">"{plan.remedial_action_plan}"</p>
                <div className="flex justify-between items-center text-[10.5px] text-stone-400 pt-1 border-t border-stone-100">
                  <span>Teacher: <strong className="text-stone-700">{plan.assigned_teacher || 'Assigned Staff'}</strong></span>
                  <span>Extra Periods: <strong className="text-amber-800">+{plan.additional_periods_allocated} Periods</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Subject-Wise Completion Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight">
              Subject Delivery & Pacing Matrix
            </h2>
            <p className="text-xs text-stone-500">
              Showing curriculum delivery for {selectedClass === "All" ? "All Grades" : selectedClass} ({subjects.length} Subjects)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-stone-600">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> On Schedule (≥70%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Review (50-69%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Behind (&lt;50%)</span>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub: any) => {
            const statusColor = 
              sub.pacingStatus === 'On Schedule' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              sub.pacingStatus === 'Slightly Behind' ? 'bg-amber-50 text-amber-800 border-amber-200' :
              'bg-red-50 text-red-800 border-red-200';

            return (
              <div 
                key={sub.id} 
                className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition p-5 sm:p-6 space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Subject Badge */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3.5 h-3.5 rounded-md shrink-0" 
                        style={{ backgroundColor: sub.color_code || '#3B82F6' }}
                      />
                      <span className="text-xs font-black text-stone-500 uppercase tracking-wider">
                        {sub.class_name} • {sub.category}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${statusColor}`}>
                      {sub.healthTag} {sub.pacingStatus}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-stone-900 tracking-tight">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Faculty: <strong className="text-stone-800">{sub.teacher_name || 'Department Faculty'}</strong>
                  </p>

                  {/* Progress Stats */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-stone-600">Syllabus Progress</span>
                      <span className="font-mono text-stone-900">{sub.completionPercentage}%</span>
                    </div>

                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          sub.completionPercentage >= 70 ? 'bg-emerald-500' :
                          sub.completionPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${sub.completionPercentage}%` }}
                      />
                    </div>

                    {/* Periods Breakdown */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div>
                        <span className="text-stone-400 block text-[10px]">Chapters Done:</span>
                        <strong className="text-stone-900">{sub.completedChapters} / {sub.totalChapters || 0}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Teaching Periods:</span>
                        <strong className="text-stone-900">{sub.totalCompletedPeriods} / {sub.totalEstimatedPeriods}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                  <Link
                    href={`/admin/syllabus/curriculum?subjectId=${sub.id}`}
                    className="flex-1 text-center py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition text-[11.5px]"
                  >
                    Curriculum Tree
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubjectForAction(sub);
                      setLogForm(prev => ({ ...prev, subject_id: sub.id, teacher_name: sub.teacher_name || prev.teacher_name }));
                      setLogModalOpen(true);
                    }}
                    className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 transition text-[11.5px]"
                  >
                    Log Period
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Launch & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module Quick Shortcuts */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Syllabus Navigation Shortcuts
          </h3>

          <div className="space-y-2 text-xs">
            <Link 
              href="/admin/syllabus/curriculum" 
              className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 hover:bg-stone-50 hover:border-stone-200 transition"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-stone-800">5-Tier Curriculum Master</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </Link>

            <Link 
              href="/admin/syllabus/planner" 
              className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 hover:bg-stone-50 hover:border-stone-200 transition"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-stone-800">Annual & Monthly Planner</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </Link>

            <Link 
              href="/admin/syllabus/teaching" 
              className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 hover:bg-stone-50 hover:border-stone-200 transition"
            >
              <div className="flex items-center gap-2.5">
                <BookMarked className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-stone-800">Teacher Diary & Periods</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </Link>

            <Link 
              href="/admin/syllabus/exams" 
              className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 hover:bg-stone-50 hover:border-stone-200 transition"
            >
              <div className="flex items-center gap-2.5">
                <FileQuestion className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-stone-800">Exam Blueprint Generator</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </Link>
          </div>
        </div>

        {/* Recent Lesson Diary Stream */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Recent Lesson Deliveries & Teacher Logs
            </h3>
            <Link 
              href="/admin/syllabus/teaching" 
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All Logs
            </Link>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {recentLogs.length === 0 ? (
              <p className="text-stone-400 py-4">No recent lesson logs recorded.</p>
            ) : (
              recentLogs.slice(0, 5).map((log: any) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-900">{log.academic_subjects?.name} ({log.academic_subjects?.class_name})</span>
                      <span className="text-stone-400">•</span>
                      <span className="text-blue-700 font-bold">Period {log.period_number}</span>
                    </div>
                    <p className="text-stone-600">{log.topic_title}</p>
                    <span className="text-[10px] text-stone-400 block">
                      Teacher: {log.teacher_name} • Date: {log.lesson_date} • Aid: {log.teaching_aid}
                    </span>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] shrink-0">
                    ✓ Completed
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* QUICK MODAL: LOG TEACHING PERIOD */}
      {logModalOpen && selectedSubjectForAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-md">
                  Teacher Diary Entry
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">
                  Log Period for {selectedSubjectForAction.name} ({selectedSubjectForAction.class_name})
                </h3>
              </div>
              <button onClick={() => setLogModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleLogPeriodSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Chapter *</label>
                <select
                  value={logForm.chapter_id}
                  onChange={(e) => setLogForm({ ...logForm, chapter_id: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  required
                >
                  <option value="">-- Choose Chapter --</option>
                  {(selectedSubjectForAction.syllabus_chapters || []).map((ch: any) => (
                    <option key={ch.id} value={ch.id}>
                      Ch {ch.chapter_number}: {ch.chapter_name} ({ch.completed_periods}/{ch.estimated_periods} periods)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Lesson Date *</label>
                  <input
                    type="date"
                    value={logForm.lesson_date}
                    onChange={(e) => setLogForm({ ...logForm, lesson_date: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Period Number</label>
                  <input
                    type="number"
                    value={logForm.period_number}
                    onChange={(e) => setLogForm({ ...logForm, period_number: Number(e.target.value) })}
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
                  value={logForm.topic_title}
                  onChange={(e) => setLogForm({ ...logForm, topic_title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Learning Objective</label>
                <textarea
                  placeholder="Students will be able to convert unlike fractions and compute sum"
                  value={logForm.learning_objective}
                  onChange={(e) => setLogForm({ ...logForm, learning_objective: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Classwork</label>
                  <input
                    type="text"
                    placeholder="Exercise 4.4 Q1-Q5"
                    value={logForm.classwork}
                    onChange={(e) => setLogForm({ ...logForm, classwork: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Homework</label>
                  <input
                    type="text"
                    placeholder="Workbook Pg 28"
                    value={logForm.homework}
                    onChange={(e) => setLogForm({ ...logForm, homework: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? "Logging..." : "Save Lesson Log & Increment Period"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
