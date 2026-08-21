"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, Calendar, Clock, CheckCircle2, XCircle, 
  AlertCircle, Sparkles, Users, FileText, Upload, Plus, 
  Search, Filter, ChevronRight, Check, RefreshCw, Paperclip,
  Eye, Download, Send, School, Layers, FileCheck, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getTeacherDailyScheduleWithDiary,
  saveSimpleDiaryEntry,
  getPrincipalDiaryMonitoringStats,
  getParentChildDiary
} from "@/app/actions/digital-diary";
import { getFacultyList } from "@/app/actions/faculty";
import { getClasses } from "@/app/actions/classes";

const ALL_CLASSES = ["Grade 5", "Grade 4", "Grade 3", "Grade 2", "Grade 1", "UKG", "Nursery"];
const ALL_SUBJECTS = ["Mathematics", "English", "Science & EVS", "Hindi", "Computer & Coding", "Social Studies", "Art & Craft", "General Knowledge"];

export default function SimpleDigitalDiaryPage() {
  const { activeCampusId } = useCampusContext();

  // Simple ERP Sub-Menu Tabs (Matching Specification)
  const [activeTab, setActiveTab] = useState<
    "my_diary" | "class_diary" | "homework" | "study_material" | "parent_view" | "principal_monitoring" | "reports"
  >("my_diary");

  // Selection Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClass, setSelectedClass] = useState("Grade 5");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [selectedTeacherName, setSelectedTeacherName] = useState("Rahul Sharma");

  // Simple Diary Form (ONLY 4 Essential Fields + Optional Attachment)
  const [topicTaught, setTopicTaught] = useState("Equivalent Fractions");
  const [classwork, setClasswork] = useState("Exercise 4.1 Questions 1–6");
  const [homework, setHomework] = useState("Complete Q1–5 from Exercise 4.2");
  const [remarks, setRemarks] = useState("Students participated actively in today's lesson.");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");

  // Data State
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  useEffect(() => {
    loadData();
  }, [activeCampusId, selectedDate, selectedClass, selectedSection]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [schedRes, monRes] = await Promise.all([
        getTeacherDailyScheduleWithDiary({
          campusId: activeCampusId,
          date: selectedDate,
          className: selectedClass,
          sectionName: selectedSection
        }),
        getPrincipalDiaryMonitoringStats({
          campusId: activeCampusId,
          date: selectedDate
        })
      ]);

      if (schedRes.success && schedRes.data) {
        setTodaySchedule(schedRes.data);
      }
      if (monRes.success && monRes.data) {
        setMonitoringData(monRes.data);
      }
    } catch (e) {
      console.error("Error loading simple diary data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // 1-Click Select Period from Timetable (Auto-Fills Class Details)
  function handleSelectTimetableSlot(slot: any) {
    setSelectedClass(slot.className);
    setSelectedSection(slot.sectionName);
    setSelectedSubject(slot.subjectName);
    setSelectedPeriod(slot.periodNumber);
    setSelectedTeacherName(slot.teacherName);

    // Pre-fill existing diary if logged
    if (slot.diary) {
      setTopicTaught(slot.diary.topic_taught || "");
      setClasswork(slot.diary.classwork_text || "");
      setHomework(slot.diary.homework_title || "");
      setRemarks(slot.diary.teacher_remarks_parent || "");
      if (slot.diary.study_material_attachments?.[0]) {
        setAttachmentName(slot.diary.study_material_attachments[0].name || "");
        setAttachmentUrl(slot.diary.study_material_attachments[0].url || "");
      } else {
        setAttachmentName("");
        setAttachmentUrl("");
      }
    } else {
      setTopicTaught("");
      setClasswork("");
      setHomework("");
      setRemarks("");
      setAttachmentName("");
      setAttachmentUrl("");
    }
  }

  // 1-Click Save Diary
  async function handleSaveDiary(e: React.FormEvent) {
    e.preventDefault();
    if (!topicTaught.trim()) {
      alert("Please enter the Topic Taught.");
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg("");
    try {
      const res = await saveSimpleDiaryEntry({
        campusId: activeCampusId,
        date: selectedDate,
        className: selectedClass,
        sectionName: selectedSection,
        subjectName: selectedSubject,
        periodNumber: selectedPeriod,
        topicTaught,
        classwork,
        homework,
        remarks,
        attachmentUrl: attachmentUrl || undefined,
        attachmentName: attachmentName || undefined,
        teacherName: selectedTeacherName
      });

      if (res.success) {
        setSaveSuccessMsg(`✓ Saved! Diary for ${selectedClass}-${selectedSection} (${selectedSubject}) is now live for parents.`);
        loadData();
      } else {
        alert("Error saving diary: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-purple-600" /> Digital Diary
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Simple ERP Module
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Daily Digital Diary &amp; Homework
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Timetable $\rightarrow$ Enter Topic + Classwork + Homework $\rightarrow$ Save $\rightarrow$ Parents see it instantly.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-stone-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Simple ERP Menu Tabs */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("my_diary")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "my_diary" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          ✏️ My Diary
        </button>

        <button
          onClick={() => setActiveTab("class_diary")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "class_diary" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🏫 Class Diary
        </button>

        <button
          onClick={() => setActiveTab("homework")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "homework" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📝 Homework
        </button>

        <button
          onClick={() => setActiveTab("study_material")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "study_material" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📎 Study Material
        </button>

        <button
          onClick={() => setActiveTab("parent_view")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "parent_view" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📱 Parent View
        </button>

        <button
          onClick={() => setActiveTab("principal_monitoring")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "principal_monitoring" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📊 Principal Monitoring
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "reports" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📋 Reports
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. MY DIARY (TEACHER DAILY ENTRY — SIMPLE 4 FIELDS) */}
      {/* ========================================================================= */}
      {activeTab === "my_diary" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Today's Classes from Timetable */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <strong className="text-stone-900 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" /> Today&apos;s Classes
                </strong>
                <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-900 px-2 py-0.5 rounded">
                  {selectedClass} ({selectedSection})
                </span>
              </div>

              <div className="space-y-2">
                {todaySchedule.map((slot) => {
                  const isSelected = selectedPeriod === slot.periodNumber && selectedSubject === slot.subjectName;
                  const isDone = slot.status === "Completed";

                  return (
                    <div
                      key={slot.slotId}
                      onClick={() => handleSelectTimetableSlot(slot)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-purple-50 border-purple-400 shadow-2xs"
                          : "bg-stone-50/70 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] ${
                          isDone ? "bg-emerald-100 text-emerald-900" : "bg-stone-200 text-stone-700"
                        }`}>
                          P{slot.periodNumber}
                        </div>
                        <div>
                          <strong className="text-stone-900 text-xs block">{slot.subjectName}</strong>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {slot.startTime} • {slot.className}-{slot.sectionName}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isDone ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {isDone ? "✅ Done" : "⏳ Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-stone-400 italic text-center pt-1">
                Click any period to auto-fill class details.
              </p>
            </div>
          </div>

          {/* Right Column: Teacher's Simple Entry Form */}
          <div className="lg:col-span-8">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-5">
              
              {/* Header with Auto-Filled Class Details */}
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Class &amp; Section</span>
                    <strong className="text-purple-950 font-black">{selectedClass} ({selectedSection})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Subject</span>
                    <strong className="text-purple-950 font-black">{selectedSubject}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Period</span>
                    <strong className="text-purple-950 font-black">Period {selectedPeriod}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Teacher</span>
                    <span className="text-stone-800 font-semibold">{selectedTeacherName}</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-purple-700 bg-white px-2.5 py-1 rounded-xl border border-purple-200 font-bold">
                  Date: {selectedDate}
                </span>
              </div>

              {/* Success Notification */}
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* The Simple 4-Field Form */}
              <form onSubmit={handleSaveDiary} className="space-y-4 text-xs">
                
                {/* 1. Topic Taught */}
                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    1. Topic Taught *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fractions — Equivalent Fractions & Simplification"
                    value={topicTaught}
                    onChange={(e) => setTopicTaught(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-bold text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* 2. Classwork */}
                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    2. Classwork *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Exercise 4.1 Questions 1 to 6 solved in classwork notebook"
                    value={classwork}
                    onChange={(e) => setClasswork(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* 3. Homework */}
                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    3. Homework *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Complete Q1–5 from Exercise 4.2. Show all working steps."
                    value={homework}
                    onChange={(e) => setHomework(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* 4. Remarks */}
                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    4. Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Students participated actively in today's lesson."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* 5. Optional Attachment */}
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2">
                  <span className="font-bold text-stone-700 block text-[11px] flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5 text-stone-500" /> Optional Worksheet / Study Material Attachment
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Attachment Title (e.g. Fractions_Worksheet.pdf)"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      className="bg-white border border-stone-200 rounded-xl p-2 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="File URL or Link (e.g. https://...)"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      className="bg-white border border-stone-200 rounded-xl p-2 font-medium"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-sm py-3.5 rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {isSaving ? "Saving..." : "[ Save Diary ]"}
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CLASS DIARY VIEW */}
      {/* ========================================================================= */}
      {activeTab === "class_diary" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">{selectedClass} ({selectedSection}) — Class Diary</h3>
              <p className="text-xs text-stone-500">All subjects and assignments logged for {selectedDate}.</p>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs font-bold"
            >
              {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todaySchedule.map((slot) => (
              <div key={slot.slotId} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-stone-900 font-bold text-sm block">{slot.subjectName}</strong>
                    <span className="text-[10px] text-stone-500 font-mono">P{slot.periodNumber} • {slot.teacherName}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    slot.status === "Completed" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                  }`}>
                    {slot.status === "Completed" ? "✅ Completed" : "⏳ Pending"}
                  </span>
                </div>

                {slot.diary ? (
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    <div><strong>Topic:</strong> {slot.diary.topic_taught}</div>
                    <div><strong>Classwork:</strong> {slot.diary.classwork_text}</div>
                    <div className="text-amber-900"><strong>Homework:</strong> {slot.diary.homework_title}</div>
                    {slot.diary.teacher_remarks_parent && (
                      <div className="text-stone-500 italic">&quot;{slot.diary.teacher_remarks_parent}&quot;</div>
                    )}
                  </div>
                ) : (
                  <p className="text-stone-400 italic text-[11px] pt-1">No diary logged for this lecture yet.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HOMEWORK TAB */}
      {/* ========================================================================= */}
      {activeTab === "homework" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Active Homework Tasks ({selectedDate})</h3>
            <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl font-bold">
              {selectedClass} ({selectedSection})
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {todaySchedule.filter(s => s.diary?.homework_title).length === 0 ? (
              <p className="p-8 text-center text-stone-400 text-xs">No homework assigned for this date yet.</p>
            ) : (
              todaySchedule.filter(s => s.diary?.homework_title).map(slot => (
                <div key={slot.slotId} className="py-4 flex justify-between items-start gap-4 text-xs">
                  <div>
                    <strong className="text-stone-900 font-bold text-sm block">{slot.subjectName} — {slot.diary.homework_title}</strong>
                    <span className="text-[11px] text-stone-500 block mt-0.5">{slot.diary.homework_description}</span>
                    <span className="text-[10px] font-mono text-amber-800 font-bold mt-1 block">
                      Teacher: {slot.teacherName} • Period {slot.periodNumber}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-xl shrink-0">
                    Active Assignment
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STUDY MATERIAL TAB */}
      {/* ========================================================================= */}
      {activeTab === "study_material" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Attached Study Material &amp; Worksheets</h3>
            <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl font-bold">
              {selectedClass} ({selectedSection})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { subject: "Mathematics", title: "Fractions_Worksheet_Exercise_4.1.pdf", type: "PDF Worksheet" },
              { subject: "Science", title: "Plant_Adaptations_Diagrams.pdf", type: "Visual Chart" },
              { subject: "English", title: "Nouns_Practice_Sheet.pdf", type: "Grammar Notes" }
            ].map((mat, i) => (
              <div key={i} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-stone-900 font-bold block">{mat.title}</strong>
                  <span className="text-[10px] text-purple-700 font-semibold">{mat.subject} • {mat.type}</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Downloading ${mat.title}...`)}
                  className="p-2 bg-white hover:bg-purple-100 text-purple-900 rounded-xl border border-stone-200 transition"
                  title="Download Material"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PARENT VIEW PREVIEW (MATCHING USER SPECIFICATION) */}
      {/* ========================================================================= */}
      {activeTab === "parent_view" && (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-stone-300 p-6 shadow-xl space-y-5">
          <div className="border-b border-stone-200 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 font-bold block">
              Parent App Live Screen
            </span>
            <h3 className="text-lg font-black text-stone-900 mt-0.5">
              📅 Today&apos;s Diary ({selectedClass}-{selectedSection})
            </h3>
            <span className="text-xs text-stone-400 font-mono">{selectedDate}</span>
          </div>

          {/* Simple Subject Cards */}
          <div className="space-y-4 text-xs font-sans">
            
            {/* Maths */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <strong className="text-sm font-black text-stone-900 block">📐 Maths</strong>
              <div><span className="text-stone-500">Topic:</span> <strong>Fractions</strong></div>
              <div><span className="text-stone-500">Classwork:</span> Exercise 4.1</div>
              <div><span className="text-stone-500">Homework:</span> <strong className="text-amber-900">Q1–5</strong></div>
            </div>

            {/* English */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <strong className="text-sm font-black text-stone-900 block">📖 English</strong>
              <div><span className="text-stone-500">Topic:</span> <strong>Nouns</strong></div>
              <div><span className="text-stone-500">Classwork:</span> Worksheet</div>
              <div><span className="text-stone-500">Homework:</span> <strong className="text-amber-900">Learn definitions</strong></div>
            </div>

            {/* Science */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <strong className="text-sm font-black text-stone-900 block">🔬 Science</strong>
              <div><span className="text-stone-500">Topic:</span> <strong>Plant Adaptations</strong></div>
              <div><span className="text-stone-500">Classwork:</span> Page 34-36 diagram</div>
              <div><span className="text-stone-500">Homework:</span> <strong className="text-amber-900">Collect 2 leaves</strong></div>
            </div>

          </div>

          <div className="pt-2 text-center text-[10px] text-stone-400 font-mono">
            Updated instantly upon teacher save.
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PRINCIPAL / COORDINATOR VIEW (TABLE) */}
      {/* ========================================================================= */}
      {activeTab === "principal_monitoring" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex justify-between items-center text-xs">
            <div>
              <strong className="font-black text-stone-900 text-sm">Principal / Coordinator Monitoring Table</strong>
              <p className="text-stone-400 text-[11px]">Today&apos;s period completion across all classrooms.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
              {monitoringData?.completionPercentage || 92}% Logged Today
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Class</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Teacher</th>
                  <th className="p-3.5">Topic Taught</th>
                  <th className="p-3.5">Homework</th>
                  <th className="p-3.5 text-center">Diary Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {[
                  { cls: "5A", sub: "Maths", teacher: "Rahul Sharma", topic: "Equivalent Fractions", hw: "Ex 4.2 Q1–5", done: true },
                  { cls: "5A", sub: "English", teacher: "Neha Verma", topic: "Nouns & Types", hw: "Learn definitions", done: true },
                  { cls: "5B", sub: "Science", teacher: "Amit Kumar", topic: "Plants & Soil", hw: "Collect leaves", done: false },
                  { cls: "4A", sub: "Maths", teacher: "Pooja Bhatt", topic: "Division with Remainder", hw: "Page 42 Q1-8", done: true },
                  { cls: "3A", sub: "Hindi", teacher: "Vikram Malhotra", topic: "Vyakaran", hw: "5 sentences", done: true }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-stone-50/70">
                    <td className="p-3.5 font-bold text-stone-900">{row.cls}</td>
                    <td className="p-3.5 font-bold text-purple-900">{row.sub}</td>
                    <td className="p-3.5 text-stone-700">{row.teacher}</td>
                    <td className="p-3.5 text-stone-800">{row.done ? row.topic : "—"}</td>
                    <td className="p-3.5 text-stone-600">{row.done ? row.hw : "—"}</td>
                    <td className="p-3.5 text-center font-bold text-base">
                      {row.done ? "✅" : "❌"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. REPORTS TAB */}
      {/* ========================================================================= */}
      {activeTab === "reports" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Digital Diary Compliance Reports</h3>
            <button
              type="button"
              onClick={() => alert("Downloading PDF summary report...")}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download Monthly Report (PDF)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
              <span className="text-[10px] font-bold text-purple-800 uppercase">Monthly Coverage</span>
              <h4 className="text-xl font-black text-purple-950">98.4%</h4>
              <p className="text-[10px] text-purple-700">624 out of 634 lectures logged</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Homework Frequency</span>
              <h4 className="text-xl font-black text-emerald-950">1.8 / day</h4>
              <p className="text-[10px] text-emerald-700">Healthy balance per student</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
              <span className="text-[10px] font-bold text-blue-800 uppercase">Parent Read Rate</span>
              <h4 className="text-xl font-black text-blue-950">94.2%</h4>
              <p className="text-[10px] text-blue-700">Diaries opened within 2 hours</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
