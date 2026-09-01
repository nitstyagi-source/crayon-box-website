"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Send,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  Sparkles,
  RefreshCw,
  Award,
  Upload,
  MessageSquare,
  FileText
} from "lucide-react";
import {
  createHomeworkAssignmentAction,
  getClassHomeworkListAction,
  HomeworkItem
} from "@/app/actions/homework-lms-actions";

export default function InteractiveHomeworkLMSPage() {
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [activeTab, setActiveTab] = useState<"assign" | "submissions" | "student_view">("assign");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [subjectName, setSubjectName] = useState("Mathematics");
  const [teacherName, setTeacherName] = useState("Ms. Pooja Sharma");
  const [hwTitle, setHwTitle] = useState("Addition & Number Line Practice");
  const [hwInstructions, setHwInstructions] = useState("Complete Exercise 4.2 in workbook pages 28-29. Draw number lines neatly and color the jump intervals.");
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  // Simulated Student Submissions
  const [submissions, setSubmissions] = useState([
    { id: "SUB-01", studentName: "Aarav Sharma", class: "Class 1-A", status: "GRADED", grade: "A+ / 10/10", feedback: "Excellent neat work, Aarav! ⭐", date: "Today, 04:30 PM" },
    { id: "SUB-02", studentName: "Ananya Verma", class: "Class 1-A", status: "PENDING_REVIEW", grade: "—", feedback: "Notebook photo attached", date: "Today, 05:15 PM" },
    { id: "SUB-03", studentName: "Kabir Mehta", class: "Class 1-A", status: "NOT_SUBMITTED", grade: "—", feedback: "Awaiting submission", date: "Due in 2 days" }
  ]);

  const availableClasses = [
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
  ];

  const availableSubjects = [
    "Mathematics", "English Literature", "Environmental Science (EVS)",
    "Hindi Core", "Computer Applications", "General Science", "Social Studies"
  ];

  useEffect(() => {
    loadHomework();
  }, [selectedClass]);

  async function loadHomework() {
    setIsLoading(true);
    try {
      const res = await getClassHomeworkListAction(selectedClass);
      if (res.success) {
        setHomeworkList(res.homework);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateHomework(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await createHomeworkAssignmentAction({
        className: selectedClass,
        subjectName,
        teacherName,
        title: hwTitle,
        instructions: hwInstructions,
        dueDate,
        estimatedMinutes
      });

      if (res.success) {
        alert(res.message);
        loadHomework();
        setActiveTab("submissions");
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-950 via-emerald-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Digital Homework LMS &amp; Automated WhatsApp Dispatch
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-teal-400" />
            Interactive Homework &amp; Learning Hub
          </h1>
          <p className="text-xs sm:text-sm text-teal-200/80 max-w-2xl">
            Publish daily homework assignments, auto-broadcast task alerts to class parents via WhatsApp, and grade digital student notebook submissions.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 text-xs">
          <div className="font-bold text-white">Target Class:</div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-teal-900 border border-teal-700 text-white font-bold rounded-xl px-3 py-1.5 focus:bg-teal-800"
          >
            {availableClasses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("assign")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "assign"
              ? "border-teal-600 text-teal-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Plus className="w-4 h-4" />
          📝 Assign Daily Homework
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "submissions"
              ? "border-teal-600 text-teal-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          📥 Student Submissions &amp; Grading ({submissions.length})
        </button>

        <button
          onClick={() => setActiveTab("student_view")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "student_view"
              ? "border-teal-600 text-teal-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Users className="w-4 h-4" />
          📱 Parent / Student App View
        </button>
      </div>

      {/* TAB 1: ASSIGN HOMEWORK */}
      {activeTab === "assign" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Create New Homework Assignment
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Publishing will automatically dispatch an instant WhatsApp notification to all registered parents in {selectedClass}.
              </p>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Subject</label>
                  <select
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Teacher In-Charge</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Homework Title / Chapter Topic</label>
                  <input
                    type="text"
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Detailed Instructions &amp; Workbook Questions</label>
                  <textarea
                    value={hwInstructions}
                    onChange={(e) => setHwInstructions(e.target.value)}
                    rows={4}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 font-medium leading-relaxed focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Submission Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Estimated Completion Time</label>
                  <select
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                  >
                    <option value={15}>15 Minutes (Quick Drill)</option>
                    <option value={30}>30 Minutes (Standard)</option>
                    <option value={45}>45 Minutes (Extended Worksheet)</option>
                    <option value={60}>60 Minutes (Project / Scrapbook)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  📢 Publish Assignment &amp; Send WhatsApp Alert to Parents
                </button>
              </div>
            </form>
          </div>

          {/* Right Col: Active Homework Feed */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 self-start">
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2 border-b border-stone-200 pb-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              Active Assignments ({homeworkList.length})
            </h4>

            <div className="space-y-3 text-xs">
              {homeworkList.map((hw) => (
                <div key={hw.id} className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <strong className="text-stone-900 font-bold">{hw.title}</strong>
                    <span className="bg-teal-100 text-teal-900 text-[10px] font-bold px-2 py-0.5 rounded">
                      {hw.subject_name}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 line-clamp-2">{hw.instructions}</div>
                  <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono pt-1 border-t border-stone-200/50">
                    <span>By: {hw.teacher_name}</span>
                    <span className="text-amber-800 font-bold">Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SUBMISSIONS & GRADING */}
      {activeTab === "submissions" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                Student Homework Submissions &amp; Digital Grading
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Review submitted assignments, assign performance badges/grades, and share teacher remarks.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-black">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Submission Status</th>
                  <th className="p-3">Score / Grade</th>
                  <th className="p-3">Teacher Remarks</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-stone-50/50">
                    <td className="p-3 font-bold text-stone-900">{sub.studentName}</td>
                    <td className="p-3">{sub.class}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.status === 'GRADED'
                          ? 'bg-emerald-100 text-emerald-900'
                          : sub.status === 'PENDING_REVIEW'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-100 text-stone-500'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-teal-800">{sub.grade}</td>
                    <td className="p-3 text-stone-600">{sub.feedback}</td>
                    <td className="p-3 text-right">
                      {sub.status === 'PENDING_REVIEW' ? (
                        <button
                          onClick={() => alert(`Graded ${sub.studentName} successfully!`)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold shadow-xs"
                        >
                          Grade Now
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-mono">{sub.date}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT VIEW */}
      {activeTab === "student_view" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-1 border-b border-stone-200 pb-4">
            <h3 className="text-lg font-black text-stone-900">
              Student Mobile Homework Checklist
            </h3>
            <p className="text-xs text-stone-500">
              How students and parents view and upload homework on their mobile app.
            </p>
          </div>

          <div className="space-y-4">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="p-5 rounded-3xl border border-teal-200 bg-teal-50/40 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-teal-200 text-teal-900 text-[10px] font-black px-2 py-0.5 rounded">
                      {hw.subject_name}
                    </span>
                    <h4 className="text-sm font-black text-stone-900 mt-1">{hw.title}</h4>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 font-mono">
                    Due: {new Date(hw.due_date).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-stone-700 leading-relaxed bg-white p-3 rounded-2xl border border-teal-100">
                  {hw.instructions}
                </p>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-stone-400 font-mono">Teacher: {hw.teacher_name}</span>
                  <button
                    onClick={() => alert("Upload dialog: select notebook photos to submit.")}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Notebook Photos
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
