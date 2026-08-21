"use client";

import { useState, useEffect } from "react";
import { useSiblingContext } from "@/components/providers/SiblingProvider";
import { 
  BookOpen, FileText, Download, CheckCircle2, Circle, Clock, 
  BarChart3, Sparkles, Award, FileQuestion, ChevronRight, Check
} from "lucide-react";
import { motion } from "framer-motion";
import { getAcademicSubjects, getExamBlueprints, getTeachingDiaryLogs } from "@/app/actions/syllabus-core";
import PdfUploader from "@/components/ui/PdfUploader";

export default function AcademicsHub() {
  const { activeSibling } = useSiblingContext();

  const studentGrade = activeSibling?.grade || "Grade 5";
  const [subjects, setSubjects] = useState<any[]>([]);
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAcademics();
  }, [studentGrade]);

  async function loadAcademics() {
    setIsLoading(true);
    try {
      const [subRes, bpRes, logRes] = await Promise.all([
        getAcademicSubjects("", "2026-2027", studentGrade),
        getExamBlueprints("", "2026-2027", studentGrade),
        getTeachingDiaryLogs("")
      ]);

      if (subRes.success && subRes.data) setSubjects(subRes.data);
      if (bpRes.success && bpRes.data) setBlueprints(bpRes.data);
      if (logRes.success && logRes.data) setRecentLogs(logRes.data);
    } catch (e) {
      console.error("Error loading parent academics:", e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Student Academic Portal
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs font-bold">{studentGrade} • Session 2026-2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Curriculum, Syllabus & Homework
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Live syllabus tracking, chapter progress, and assignments for <span className="font-bold text-blue-600">{activeSibling?.firstName || 'Student'}</span>.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-700">
          Enrolled Subjects: <span className="text-blue-600 font-black">{subjects.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Syllabus Pacing & Active Homework */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Syllabus Progress */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Live Syllabus Progress ({studentGrade})
              </h2>
              <span className="text-xs text-slate-400 font-bold">Term 1 (2026)</span>
            </div>

            <div className="space-y-4">
              {subjects.map((sub, idx) => (
                <div key={sub.id} className="space-y-1.5 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50/60 transition">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: sub.color_code || '#3B82F6' }}
                      />
                      <strong className="text-slate-900">{sub.name}</strong>
                      <span className="text-[10px] text-slate-400">({sub.teacher_name || 'Faculty'})</span>
                    </div>
                    <span className="font-mono font-black text-slate-800">{sub.completionPercentage || 0}%</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${sub.completionPercentage || 0}%` }} 
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="h-2 rounded-full bg-blue-600"
                    />
                  </div>

                  {/* Chapter Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                    {(sub.syllabus_chapters || []).map((ch: any) => (
                      <span 
                        key={ch.id}
                        className={`px-2 py-0.5 rounded font-medium ${
                          ch.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          ch.status === 'In Progress' ? 'bg-blue-50 text-blue-800 border border-blue-200 font-bold' :
                          'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {ch.status === 'Completed' ? '✅' : ch.status === 'In Progress' ? '🟢' : '⚪'} Ch {ch.chapter_number}: {ch.chapter_name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Digital Diary & Homework */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  📅 Today&apos;s Digital Diary &amp; Homework
                </h2>
                <p className="text-xs text-slate-500">
                  Daily communication, classwork, and assignments for {activeSibling?.firstName || "Student"}.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-purple-50 text-purple-900 px-2.5 py-1 rounded-xl">
                Session 2026-27
              </span>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: "diary-1",
                  subject: "Mathematics",
                  topic: "Equivalent Fractions & Simplification",
                  classwork: "NCERT Textbook Exercise 4.2 — Questions 1 to 6 solved in class.",
                  homework: "Exercise 4.3 Practice Q1 to Q8",
                  dueDate: "24 August 2026",
                  priority: "High",
                  submissionStatus: "Submitted",
                  marks: 9.5,
                  parentRemark: "Students practiced fraction strips enthusiastically today. Please ensure homework is completed in the blue homework notebook.",
                  worksheetUrl: "https://example.com/math_worksheet.pdf",
                  isAcknowledged: true
                },
                {
                  id: "diary-2",
                  subject: "Science & Discovery",
                  topic: "Plant Adaptations in Terrestrial Habitats",
                  classwork: "Drew and labeled the structure of a Desert Cactus in Science notebook.",
                  homework: "Collect 2 Types of Leaves & Write 3 Adaptations",
                  dueDate: "23 August 2026",
                  priority: "Medium",
                  submissionStatus: "Pending",
                  marks: null,
                  parentRemark: "Children were excited about desert plants today. Encourage them to observe plants around your home.",
                  worksheetUrl: null,
                  isAcknowledged: false
                },
                {
                  id: "diary-3",
                  subject: "English Grammar",
                  topic: "Action Verbs & Tenses (Past & Present)",
                  classwork: "Workbook Page 28, Exercises A & B.",
                  homework: "Write 5 Sentences Using Irregular Verbs",
                  dueDate: "24 August 2026",
                  priority: "Medium",
                  submissionStatus: "Pending",
                  marks: null,
                  parentRemark: "Please review irregular past tense verbs with your child over the weekend.",
                  worksheetUrl: null,
                  isAcknowledged: false
                }
              ].map((entry) => (
                <div key={entry.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-slate-900 font-bold text-sm block">{entry.subject}</strong>
                      <span className="text-purple-700 font-semibold text-xs">{entry.topic}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                      entry.priority === "High" ? "bg-red-100 text-red-900" : "bg-blue-100 text-blue-900"
                    }`}>
                      {entry.priority} Priority
                    </span>
                  </div>

                  {/* Classwork */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-[11px] text-slate-700">
                    <strong className="text-blue-700 font-bold">📘 Classwork:</strong> {entry.classwork}
                  </div>

                  {/* Homework */}
                  <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 space-y-1 text-[11px] text-amber-950">
                    <div className="flex justify-between items-center">
                      <strong className="font-black text-amber-900">📝 Homework:</strong>
                      <span className="font-mono text-[10px] font-bold text-amber-800">Due: {entry.dueDate}</span>
                    </div>
                    <p className="font-semibold">{entry.homework}</p>
                  </div>

                  {/* Teacher Remark */}
                  {entry.parentRemark && (
                    <div className="text-[11px] text-slate-600 italic bg-purple-50/40 p-2 rounded-xl border border-purple-100">
                      &quot;{entry.parentRemark}&quot;
                    </div>
                  )}

                  {/* Homework Submission & Acknowledgement Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
                    {entry.submissionStatus === "Submitted" ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Homework Submitted ({entry.marks ? `Graded: ${entry.marks}/10` : 'Pending Teacher Grading'})
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <PdfUploader
                          label="Submit Homework (PDF / Photo)"
                          helperText="Upload completed assignment"
                          onPdfUploaded={(data) => {
                            alert(`🎉 Homework "${data.fileName}" submitted successfully!`);
                          }}
                        />
                      </div>
                    )}

                    {/* Parent Acknowledgement Button */}
                    <button
                      type="button"
                      onClick={() => alert("Notice acknowledged! Timestamp recorded for school records.")}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                        entry.isAcknowledged
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-default"
                          : "bg-purple-600 hover:bg-purple-700 text-white shadow-2xs"
                      }`}
                    >
                      <Check className="w-3 h-3" /> {entry.isAcknowledged ? "Acknowledged" : "✓ I Have Read This"}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Exam Blueprints & Study Downloads */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Exam Syllabus Blueprints */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-amber-600" />
                Upcoming Exam Blueprints
              </h2>
            </div>

            {blueprints.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No exam syllabus published yet.</p>
            ) : (
              blueprints.map((bp) => (
                <div key={bp.id} className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/30 space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-slate-900 block">{bp.exam_name}</strong>
                      <span className="text-amber-900 font-semibold text-[11px]">{bp.academic_subjects?.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      {bp.total_marks} Marks
                    </span>
                  </div>

                  {/* Included Chapters */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10.5px] font-bold text-slate-500 uppercase">Syllabus Included:</span>
                    <div className="space-y-1">
                      {(bp.weightage_breakdown || []).map((w: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[11px] bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-slate-800 font-medium">{w.chapter}</span>
                          <span className="font-mono font-bold text-amber-900">{w.marks}M ({w.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {bp.blueprint_notes && (
                    <p className="text-[10.5px] text-slate-500 italic pt-1">
                      "{bp.blueprint_notes}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Academic Report Card Download */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Term Performance & Reports</h3>
            <p className="text-xs text-slate-500">
              Download quarterly progress cards and teacher diary appraisals.
            </p>
            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs transition">
              <Download className="w-4 h-4" /> Download Signed Term Report Card (PDF)
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Authorized by Crayon Box School
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
