"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, Calendar, Clock, CheckCircle2, AlertCircle, 
  Sparkles, Users, FileText, Upload, Plus, Search, 
  Filter, ChevronRight, Eye, Check, X, ArrowRight, 
  Award, MessageSquare, AlertTriangle, RefreshCw, 
  Layers, School, Send, FileCheck, HelpCircle, Download
} from "lucide-react";
import Link from "next/link";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getTeacherDailyScheduleWithDiary,
  getPeriodWorkspaceDetails,
  saveDailyDiaryPeriodEntry,
  getPrincipalDiaryMonitoringStats,
  gradeStudentHomework
} from "@/app/actions/digital-diary";
import { getFacultyList } from "@/app/actions/faculty";
import { getClasses } from "@/app/actions/classes";

const ALL_CLASSES = [
  "All", "Grade 5", "Grade 4", "Grade 3", "Grade 2", "Grade 1", "UKG", "Nursery"
];

export default function DigitalDiaryAdminPage() {
  const { activeCampusId } = useCampusContext();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"workspace" | "class_diary" | "homework_grading" | "principal_monitoring">("workspace");

  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClass, setSelectedClass] = useState("Grade 5");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedTeacherId, setSelectedTeacherId] = useState("All");
  
  // Data State
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [monitoringStats, setMonitoringStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Period Workspace Modal State
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [activePeriodSlot, setActivePeriodSlot] = useState<any>(null);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);

  // Form State for Workspace
  const [workspaceForm, setWorkspaceForm] = useState({
    topicTaught: "",
    chapterTitle: "",
    learningObjective: "",
    teachingMethod: "Interactive Smart Board & Group Activity",
    activityConducted: "",
    classworkText: "",
    homeworkTitle: "",
    homeworkDescription: "",
    homeworkDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    homeworkPriority: "Medium",
    homeworkSubmissionRequired: true,
    homeworkMaxMarks: 10,
    teacherRemarksInternal: "",
    teacherRemarksParent: "",
    isLessonCompleted: true,
    parentAcknowledgementRequired: false
  });

  // Student Attendance in Workspace
  const [studentAttendance, setStudentAttendance] = useState<Record<string, "Present" | "Absent">>({});

  // Grading Modal State
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradingMarks, setGradingMarks] = useState<number>(10);
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [gradingStatus, setGradingStatus] = useState<"Graded" | "Needs Correction">("Graded");

  useEffect(() => {
    loadMasterData();
  }, [activeCampusId]);

  useEffect(() => {
    loadSchedule();
    loadMonitoring();
  }, [activeCampusId, selectedDate, selectedClass, selectedSection, selectedTeacherId]);

  async function loadMasterData() {
    try {
      const [facRes, clsRes] = await Promise.all([
        getFacultyList(activeCampusId),
        getClasses(activeCampusId)
      ]);
      if (facRes.success && facRes.data) setFacultyList(facRes.data);
      if (clsRes.success && clsRes.data) setClassesList(clsRes.data);
    } catch (e) {
      console.error("Error loading master data:", e);
    }
  }

  async function loadSchedule() {
    setIsLoading(true);
    try {
      const res = await getTeacherDailyScheduleWithDiary({
        campusId: activeCampusId,
        date: selectedDate,
        className: selectedClass,
        sectionName: selectedSection,
        teacherId: selectedTeacherId
      });
      if (res.success && res.data) {
        setScheduleData(res.data);
      }
    } catch (e) {
      console.error("Error loading schedule:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMonitoring() {
    try {
      const res = await getPrincipalDiaryMonitoringStats({
        campusId: activeCampusId,
        date: selectedDate
      });
      if (res.success && res.data) {
        setMonitoringStats(res.data);
      }
    } catch (e) {
      console.error("Error loading monitoring:", e);
    }
  }

  // Open Unified Period Workspace
  async function handleOpenWorkspace(slot: any) {
    setActivePeriodSlot(slot);
    setWorkspaceModalOpen(true);
    setIsLoadingWorkspace(true);

    try {
      const res = await getPeriodWorkspaceDetails({
        campusId: activeCampusId,
        date: selectedDate,
        className: slot.className,
        sectionName: slot.sectionName,
        periodNumber: slot.periodNumber,
        subjectName: slot.subjectName,
        teacherId: slot.teacherId
      });

      if (res.success && res.data) {
        setWorkspaceData(res.data);
        
        // Initialize student attendance map
        const attMap: Record<string, "Present" | "Absent"> = {};
        (res.data.students || []).forEach((stu: any) => {
          attMap[stu.id] = "Present";
        });
        setStudentAttendance(attMap);

        // Pre-fill form if saved or suggested
        const d = res.data.diary;
        const s = res.data.suggestedTopic;

        setWorkspaceForm({
          topicTaught: d?.topic_taught || s?.topic_title || "",
          chapterTitle: d?.chapter_title || "",
          learningObjective: d?.learning_objective || s?.learning_objective || "Students will be able to comprehend and apply the core concepts with exercises.",
          teachingMethod: d?.teaching_method || s?.teaching_method || "Interactive Smart Board & Group Activity",
          activityConducted: d?.activity_conducted || "",
          classworkText: d?.classwork_text || s?.classwork || "NCERT Textbook Chapter Exercises completed in Classwork Notebook.",
          homeworkTitle: d?.homework_title || s?.homework || `Practice Problems — ${slot.subjectName}`,
          homeworkDescription: d?.homework_description || "Solve assigned textbook questions. Submit notebook tomorrow.",
          homeworkDueDate: d?.homework_due_date || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          homeworkPriority: d?.homework_priority || "Medium",
          homeworkSubmissionRequired: d?.homework_submission_required ?? true,
          homeworkMaxMarks: d?.homework_max_marks || 10,
          teacherRemarksInternal: d?.teacher_remarks_internal || "",
          teacherRemarksParent: d?.teacher_remarks_parent || "Great engagement in classroom activities today.",
          isLessonCompleted: d?.is_lesson_completed ?? true,
          parentAcknowledgementRequired: d?.parent_acknowledgement_required ?? false
        });
      }
    } catch (e) {
      console.error("Error opening workspace:", e);
    } finally {
      setIsLoadingWorkspace(false);
    }
  }

  // Save Unified Period Workspace
  async function handleSaveWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!activePeriodSlot) return;

    setIsSaving(true);
    try {
      const presentCount = Object.values(studentAttendance).filter(v => v === "Present").length;
      const absentCount = Object.values(studentAttendance).filter(v => v === "Absent").length;

      const res = await saveDailyDiaryPeriodEntry({
        campusId: activeCampusId,
        date: selectedDate,
        periodNumber: activePeriodSlot.periodNumber,
        periodLabel: activePeriodSlot.periodLabel,
        startTime: activePeriodSlot.startTime,
        endTime: activePeriodSlot.endTime,
        className: activePeriodSlot.className,
        sectionName: activePeriodSlot.sectionName,
        subjectName: activePeriodSlot.subjectName,
        teacherId: activePeriodSlot.teacherId,
        teacherName: activePeriodSlot.teacherName,
        ...workspaceForm,
        attendanceSummary: {
          present: presentCount,
          absent: absentCount,
          total: presentCount + absentCount
        },
        status: "Completed"
      });

      if (res.success) {
        alert(res.message);
        setWorkspaceModalOpen(false);
        loadSchedule();
        loadMonitoring();
      } else {
        alert("Error saving diary: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Handle Homework Grading Submit
  async function handleGradeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSubmission) return;

    setIsSaving(true);
    try {
      const res = await gradeStudentHomework({
        submissionId: selectedSubmission.id,
        marksObtained: Number(gradingMarks),
        teacherFeedback: gradingFeedback,
        status: gradingStatus,
        gradedBy: "Teaching Faculty"
      });

      if (res.success) {
        alert("Evaluation saved successfully!");
        setGradingModalOpen(false);
        if (activePeriodSlot) handleOpenWorkspace(activePeriodSlot);
      } else {
        alert("Error grading: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  const completedCount = scheduleData.filter(s => s.status === "Completed").length;
  const totalCount = scheduleData.length || 1;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-600" /> Digital Diary Module
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
              Timetable & Syllabus Linked
            </span>
            <span className="text-stone-400 text-xs font-mono">Session 2026-2027</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Teacher Digital Diary & Homework Management
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-3xl">
            Single-screen period workflow: Complete attendance, topic taught, classwork, homework, study materials, and syllabus tracking in under 60 seconds per lecture.
          </p>
        </div>

        {/* Quick Date & Action */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <button
            type="button"
            onClick={loadSchedule}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl transition"
            title="Refresh Schedule"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Today's Periods</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">{monitoringStats?.totalPeriods || scheduleData.length}</span>
          <span className="text-[10px] text-stone-500 font-semibold">Timetable Scheduled</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-3xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Diaries Completed</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{monitoringStats?.completedPeriods || completedCount}</span>
          <span className="text-[10px] text-emerald-600 font-bold">Synced to Parent App</span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-3xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Pending Entries</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{monitoringStats?.pendingPeriods || Math.max(0, scheduleData.length - completedCount)}</span>
          <span className="text-[10px] text-amber-700 font-semibold">Requires Logging</span>
        </div>

        <div className="bg-purple-50/70 p-4 rounded-3xl border border-purple-200 shadow-xs">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Compliance Rate</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">{monitoringStats?.completionPercentage || completionPercentage}%</span>
          <span className="text-[10px] text-purple-600 font-bold">School-wide Today</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("workspace")}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-1.5 ${
            activeTab === "workspace"
              ? "bg-purple-600 text-white shadow-xs"
              : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> 📅 Teacher Daily Workspace
        </button>

        <button
          onClick={() => setActiveTab("class_diary")}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-1.5 ${
            activeTab === "class_diary"
              ? "bg-purple-600 text-white shadow-xs"
              : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          <School className="w-3.5 h-3.5" /> 🏫 Class & Coordinator View
        </button>

        <button
          onClick={() => setActiveTab("homework_grading")}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-1.5 ${
            activeTab === "homework_grading"
              ? "bg-purple-600 text-white shadow-xs"
              : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" /> 📝 Homework Submissions & Grading
        </button>

        <button
          onClick={() => setActiveTab("principal_monitoring")}
          className={`px-4 py-2 rounded-2xl transition flex items-center gap-1.5 ${
            activeTab === "principal_monitoring"
              ? "bg-purple-600 text-white shadow-xs"
              : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> 📊 Principal Monitoring & Compliance
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TEACHER DAILY WORKSPACE (SCHEDULE TABLE + WORKSPACE TRIGGER) */}
      {/* ========================================================================= */}
      {activeTab === "workspace" && (
        <div className="space-y-4">
          
          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="font-bold text-stone-500 block mb-1 text-[11px]">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-900"
                >
                  {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-500 block mb-1 text-[11px]">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-900"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="Earth">Section Earth</option>
                  <option value="Mars">Section Mars</option>
                  <option value="Jupiter">Section Jupiter</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-500 block mb-1 text-[11px]">Teacher Filter</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-900"
                >
                  <option value="All">All Teachers (Classroom Schedule)</option>
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>{f.first_name} {f.last_name} ({f.department})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-[11px] font-bold text-purple-900 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
              ⚡ Timetable Linked: Click any period to open 1-Screen Workflow
            </div>
          </div>

          {/* Schedule Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center text-xs">
              <strong className="font-black text-stone-900 text-sm">
                Today's Scheduled Periods ({scheduleData.length})
              </strong>
              <span className="text-stone-500 font-mono text-[11px]">
                {selectedDate} • {selectedClass} ({selectedSection})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Period & Time</th>
                    <th className="p-3.5">Class & Section</th>
                    <th className="p-3.5">Subject & Teacher</th>
                    <th className="p-3.5">Topic Taught</th>
                    <th className="p-3.5">Classwork & Homework</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
                        Loading timetable slots and digital diary records...
                      </td>
                    </tr>
                  ) : scheduleData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        No periods scheduled for this class/teacher on {selectedDate}.
                      </td>
                    </tr>
                  ) : (
                    scheduleData.map((slot) => {
                      const isCompleted = slot.status === "Completed";
                      const diary = slot.diary;

                      return (
                        <tr key={slot.slotId} className="hover:bg-stone-50/70 transition">
                          
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-black text-xs shrink-0">
                                P{slot.periodNumber}
                              </div>
                              <div>
                                <strong className="text-stone-900 block font-bold text-xs">
                                  {slot.periodLabel}
                                </strong>
                                <span className="text-[10px] font-mono text-stone-400">
                                  {slot.startTime} – {slot.endTime}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <strong className="text-stone-900 font-bold block">
                              {slot.className}
                            </strong>
                            <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">
                              Section {slot.sectionName} • {slot.roomNumber}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <strong className="text-stone-900 font-bold block text-xs">
                              {slot.subjectName}
                            </strong>
                            <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                              {slot.isSubstitution && <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1 rounded">SUB</span>}
                              {slot.teacherName}
                            </span>
                          </td>

                          <td className="p-3.5 max-w-xs">
                            {diary?.topic_taught ? (
                              <div>
                                <strong className="text-stone-900 block truncate text-xs">
                                  {diary.topic_taught}
                                </strong>
                                <span className="text-[10px] text-stone-400 truncate block">
                                  {diary.chapter_title || "Chapter Lesson"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic text-[11px]">Not logged yet</span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <div className="space-y-0.5 text-[11px]">
                              {diary?.classwork_text && (
                                <span className="text-blue-700 block font-semibold truncate max-w-[180px]">
                                  📘 CW: {diary.classwork_text}
                                </span>
                              )}
                              {diary?.homework_title && (
                                <span className="text-amber-800 block font-semibold truncate max-w-[180px]">
                                  📝 HW: {diary.homework_title}
                                </span>
                              )}
                              {!diary?.classwork_text && !diary?.homework_title && (
                                <span className="text-stone-400 text-[10px]">—</span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 w-fit ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-amber-100 text-amber-900"
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                              {isCompleted ? "Completed" : "Pending"}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenWorkspace(slot)}
                              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1 ml-auto"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              {isCompleted ? "Edit Diary" : "Open Workspace"}
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLASS & COORDINATOR DIARY VIEW */}
      {/* ========================================================================= */}
      {activeTab === "class_diary" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Class Coordinator Daily Diary Matrix</h3>
              <p className="text-xs text-stone-500">Live compliance breakdown by class and subject for {selectedDate}.</p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
              Date: {selectedDate}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(monitoringStats?.classCompliance || {
              "Grade 5 (A)": { total: 7, completed: 6, pending: [] },
              "Grade 4 (A)": { total: 7, completed: 7, pending: [] },
              "Grade 3 (A)": { total: 7, completed: 5, pending: [{ subjectName: "Science", teacherName: "Neha Verma", periodNumber: 4 }] },
              "Grade 2 (A)": { total: 7, completed: 7, pending: [] },
              "Grade 1 (A)": { total: 7, completed: 6, pending: [{ subjectName: "Hindi", teacherName: "Pooja Bhatt", periodNumber: 5 }] },
              "UKG (Jupiter)": { total: 6, completed: 6, pending: [] },
              "Nursery (Earth)": { total: 6, completed: 6, pending: [] }
            }).map(([className, data]: any) => {
              const pct = Math.round((data.completed / (data.total || 1)) * 100);
              const isFull = pct === 100;

              return (
                <div key={className} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <strong className="text-stone-900 font-black text-sm">{className}</strong>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                      isFull ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                    }`}>
                      {pct}% Complete
                    </span>
                  </div>

                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${isFull ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
                  </div>

                  <div className="flex justify-between text-[11px] font-semibold text-stone-500">
                    <span>{data.completed} of {data.total} Periods Logged</span>
                    <span className={data.pending?.length > 0 ? "text-amber-700 font-bold" : "text-emerald-700 font-bold"}>
                      {data.pending?.length || 0} Pending
                    </span>
                  </div>

                  {data.pending?.length > 0 && (
                    <div className="pt-2 border-t border-stone-200 space-y-1 text-[10px]">
                      <span className="text-amber-800 font-bold block">Pending Lectures:</span>
                      {data.pending.map((p: any, i: number) => (
                        <div key={i} className="flex justify-between text-stone-600">
                          <span>P{p.periodNumber}: {p.subjectName}</span>
                          <span className="font-semibold">{p.teacherName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HOMEWORK SUBMISSIONS & GRADING */}
      {/* ========================================================================= */}
      {activeTab === "homework_grading" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Student Homework Submissions</h3>
              <p className="text-xs text-stone-500">Review student uploaded photo/PDF assignments, award marks, and provide teacher remarks.</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl">
              Grade 5 (Section A) • Mathematics
            </span>
          </div>

          {/* Submissions List */}
          <div className="divide-y divide-stone-100">
            {[
              { id: "sub-1", studentName: "Aadya Sanwal", admNo: "CBS0001245", submittedAt: "Today, 02:40 PM", status: "Submitted", marks: null, notes: "Solved Exercise 4.3 questions 1 to 8 with complete steps.", file: "Math_HW_Aadya.pdf" },
              { id: "sub-2", studentName: "Aavya Gautam", admNo: "CBS0001254", submittedAt: "Today, 03:15 PM", status: "Graded", marks: 9.5, notes: "Attached notebook photos.", file: "Fraction_Page1.jpg" },
              { id: "sub-3", studentName: "Aditya Dhasmana", admNo: "CBS0001280", submittedAt: "Today, 04:00 PM", status: "Submitted", marks: null, notes: "All problems completed.", file: "Math_Homework.pdf" },
              { id: "sub-4", studentName: "Alveera Aamir", admNo: "CBS0001173", submittedAt: "Yesterday, 07:20 PM", status: "Graded", marks: 10.0, notes: "Clean handwriting and accurate diagrams.", file: "Homework_Alveera.pdf" },
              { id: "sub-5", studentName: "Janvi Arora", admNo: "CBS0001395", submittedAt: "—", status: "Pending", marks: null, notes: "Not submitted yet", file: null }
            ].map((sub) => (
              <div key={sub.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 font-black flex items-center justify-center">
                    {sub.studentName.charAt(0)}
                  </div>
                  <div>
                    <strong className="text-stone-900 font-bold block text-sm">{sub.studentName}</strong>
                    <span className="text-[10px] font-mono text-stone-400">Adm: {sub.admNo} • Submitted: {sub.submittedAt}</span>
                    {sub.notes && <p className="text-[11px] text-stone-600 italic mt-0.5">&quot;{sub.notes}&quot;</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl ${
                    sub.status === "Graded"
                      ? "bg-emerald-100 text-emerald-900"
                      : sub.status === "Submitted"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-red-100 text-red-900"
                  }`}>
                    {sub.status === "Graded" ? `Graded: ${sub.marks}/10` : sub.status}
                  </span>

                  {sub.file && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setGradingMarks(sub.marks || 9);
                        setGradingModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      {sub.status === "Graded" ? "Review / Re-Grade" : "Evaluate"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PRINCIPAL MONITORING & COMPLIANCE */}
      {/* ========================================================================= */}
      {activeTab === "principal_monitoring" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Principal Academic Audit & Diary Compliance</h3>
              <p className="text-xs text-stone-500">School-wide metrics for {selectedDate}.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
              {monitoringStats?.completionPercentage || 92}% Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-purple-50/70 rounded-3xl border border-purple-200 space-y-2">
              <span className="text-xs font-bold text-purple-900 uppercase">Classroom Learning Coverage</span>
              <h4 className="text-2xl font-black text-purple-950">32 Topics Completed</h4>
              <p className="text-xs text-purple-800">Across 11 classes, all mapped directly into Syllabus Master.</p>
            </div>

            <div className="p-5 bg-blue-50/70 rounded-3xl border border-blue-200 space-y-2">
              <span className="text-xs font-bold text-blue-900 uppercase">Homework Assignments Assigned</span>
              <h4 className="text-2xl font-black text-blue-950">28 Active HW Tasks</h4>
              <p className="text-xs text-blue-800">Average 2.5 homework tasks per student for this weekend.</p>
            </div>

            <div className="p-5 bg-emerald-50/70 rounded-3xl border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-900 uppercase">Parent App Sync Status</span>
              <h4 className="text-2xl font-black text-emerald-950">100% Live Synced</h4>
              <p className="text-xs text-emerald-800">Available instantly on parent digital portals.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 UNIFIED PERIOD WORKSPACE MODAL (THE SINGLE-SCREEN FLOW) */}
      {/* ========================================================================= */}
      {workspaceModalOpen && activePeriodSlot && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col justify-between">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded font-bold">
                    Period {activePeriodSlot.periodNumber} • {activePeriodSlot.startTime} - {activePeriodSlot.endTime}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Syllabus Auto-Linked
                  </span>
                </div>
                <h3 className="text-lg font-black text-stone-900 mt-1">
                  {activePeriodSlot.className} ({activePeriodSlot.sectionName}) — {activePeriodSlot.subjectName}
                </h3>
                <p className="text-xs text-stone-500">
                  Facilitator: <strong>{activePeriodSlot.teacherName}</strong> • Date: {selectedDate}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setWorkspaceModalOpen(false)}
                className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="workspace-form" onSubmit={handleSaveWorkspace} className="space-y-6 overflow-y-auto pr-1 flex-1 text-xs">
              
              {/* SECTION 1: QUICK PERIOD ATTENDANCE */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-600" /> 1. Quick Period Attendance
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const allPresent: Record<string, "Present"> = {};
                      (workspaceData?.students || []).forEach((s: any) => allPresent[s.id] = "Present");
                      setStudentAttendance(allPresent);
                    }}
                    className="text-[10px] font-bold text-purple-700 hover:underline"
                  >
                    ✓ Mark All Present
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {(workspaceData?.students || []).map((student: any) => {
                    const isPresent = studentAttendance[student.id] !== "Absent";
                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => {
                          setStudentAttendance(prev => ({
                            ...prev,
                            [student.id]: isPresent ? "Absent" : "Present"
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition flex items-center gap-1.5 border ${
                          isPresent
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                            : "bg-red-50 text-red-900 border-red-300 line-through"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isPresent ? "bg-emerald-500" : "bg-red-500"}`} />
                        {student.fullName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: TOPIC & TEACHING DETAILS */}
              <div className="space-y-3 bg-purple-50/40 p-4 rounded-2xl border border-purple-200">
                <span className="font-black text-purple-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" /> 2. Teaching Details & Syllabus Topic
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Topic / Lesson Taught *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Equivalent Fractions & Simplification"
                      value={workspaceForm.topicTaught}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, topicTaught: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl p-2.5 font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Chapter / Unit Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Chapter 4: Fractions in Daily Life"
                      value={workspaceForm.chapterTitle}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, chapterTitle: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl p-2.5 font-bold text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Learning Objective</label>
                  <input
                    type="text"
                    value={workspaceForm.learningObjective}
                    onChange={(e) => setWorkspaceForm({ ...workspaceForm, learningObjective: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Teaching Method</label>
                    <input
                      type="text"
                      value={workspaceForm.teachingMethod}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, teachingMethod: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Activity Conducted</label>
                    <input
                      type="text"
                      placeholder="e.g. Fraction folding strip puzzle activity in groups"
                      value={workspaceForm.activityConducted}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, activityConducted: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: CLASSWORK & HOMEWORK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Classwork Block */}
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 space-y-2">
                  <span className="font-black text-blue-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    📘 3. Classwork Notes
                  </span>
                  <textarea
                    rows={3}
                    placeholder="e.g. NCERT Textbook Exercise 4.2 — Questions 1 to 5 solved in class."
                    value={workspaceForm.classworkText}
                    onChange={(e) => setWorkspaceForm({ ...workspaceForm, classworkText: e.target.value })}
                    className="w-full bg-white border border-blue-300 rounded-xl p-2.5 font-semibold text-stone-900"
                  />
                </div>

                {/* Homework Block */}
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <span className="font-black text-amber-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    📝 4. Homework Assignment
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Complete Exercise 4.3 Q1 to Q8"
                    value={workspaceForm.homeworkTitle}
                    onChange={(e) => setWorkspaceForm({ ...workspaceForm, homeworkTitle: e.target.value })}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2 font-bold text-stone-900 mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-stone-600 block text-[10px]">Due Date</label>
                      <input
                        type="date"
                        value={workspaceForm.homeworkDueDate}
                        onChange={(e) => setWorkspaceForm({ ...workspaceForm, homeworkDueDate: e.target.value })}
                        className="w-full bg-white border border-amber-300 rounded-xl p-1.5 font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-600 block text-[10px]">Priority</label>
                      <select
                        value={workspaceForm.homeworkPriority}
                        onChange={(e) => setWorkspaceForm({ ...workspaceForm, homeworkPriority: e.target.value })}
                        className="w-full bg-white border border-amber-300 rounded-xl p-1.5 font-bold text-stone-900"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION 4: TEACHER REMARKS & ACKNOWLEDGEMENT */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <span className="font-black text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" /> 5. Teacher Remarks & Parent Notice
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Parent-Visible Daily Remark</label>
                    <input
                      type="text"
                      placeholder="e.g. Students practiced enthusiastically today."
                      value={workspaceForm.teacherRemarksParent}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, teacherRemarksParent: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Internal Note (Private)</label>
                    <input
                      type="text"
                      placeholder="e.g. Needs additional practice on question 4."
                      value={workspaceForm.teacherRemarksInternal}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, teacherRemarksInternal: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workspaceForm.isLessonCompleted}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, isLessonCompleted: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <span className="font-bold text-emerald-900">Mark Lesson Completed & Update Syllabus Progress</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer ml-auto">
                    <input
                      type="checkbox"
                      checked={workspaceForm.parentAcknowledgementRequired}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, parentAcknowledgementRequired: e.target.checked })}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                    <span className="font-bold text-purple-900">Require Parent Acknowledgement (✓ I Have Read This)</span>
                  </label>
                </div>
              </div>

            </form>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-stone-100 text-xs">
              <button
                type="button"
                onClick={() => setWorkspaceModalOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="workspace-form"
                disabled={isSaving}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {isSaving ? "Publishing..." : "Save Diary & Sync to Parent App"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 GRADING & EVALUATION MODAL */}
      {/* ========================================================================= */}
      {gradingModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Homework Evaluation
                </span>
                <h3 className="text-base font-black text-stone-900 mt-1">
                  Grade Submission: {selectedSubmission.studentName}
                </h3>
              </div>
              <button onClick={() => setGradingModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block font-bold">Attached Submission:</span>
                <strong className="text-blue-600 block text-xs">{selectedSubmission.file}</strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Marks (Out of 10)</label>
                  <input
                    type="number"
                    step="0.5"
                    max={10}
                    min={0}
                    required
                    value={gradingMarks}
                    onChange={(e) => setGradingMarks(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-black text-stone-900 text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Status</label>
                  <select
                    value={gradingStatus}
                    onChange={(e) => setGradingStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  >
                    <option value="Graded">Graded (Complete)</option>
                    <option value="Needs Correction">Needs Correction / Re-submit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Teacher Feedback Remark</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Excellent work, all steps written accurately!"
                  value={gradingFeedback}
                  onChange={(e) => setGradingFeedback(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGradingModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Evaluation
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
