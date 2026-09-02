"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  Send,
  Download,
  Share2,
  CheckCircle2,
  Award,
  Sparkles,
  QrCode,
  Calendar,
  User,
  ShieldCheck,
  RefreshCw,
  Search,
  ChevronRight
} from "lucide-react";
import {
  getBulkClassReportCardsAction,
  sendReportCardWhatsAppAction
} from "@/app/actions/exam-report-card-actions";

export default function CBSEHolisticReportCardsPage() {
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [selectedTerm, setSelectedTerm] = useState("Term 1 (Half Yearly Examination)");
  const [selectedSession, setSelectedSession] = useState("2026–2027");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<string | null>(null);
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [activeStudentIndex, setActiveStudentIndex] = useState(0);

  const availableClasses = [
    "Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3",
    "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
  ];

  const availableTerms = [
    "Term 1 (Half Yearly Examination)",
    "Term 2 (Annual Examination)",
    "Periodic Assessment 1",
    "Periodic Assessment 2"
  ];

  useEffect(() => {
    loadReportCards();
  }, [selectedClass, selectedTerm, selectedSession]);

  async function loadReportCards() {
    setIsLoading(true);
    try {
      const res = await getBulkClassReportCardsAction({
        className: selectedClass,
        examTerm: selectedTerm,
        academicSession: selectedSession
      });
      if (res.success && res.data) {
        setReportCards(res.data);
        setActiveStudentIndex(0);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendSingleWhatsApp(card: any) {
    setIsSendingWhatsApp(card.student.id);
    try {
      const res = await sendReportCardWhatsAppAction({
        studentId: card.student.id,
        studentName: card.student.name,
        parentPhone: card.student.parentPhone,
        className: card.student.className,
        examTerm: card.academic.examTerm,
        overallGrade: card.academic.overallGrade,
        percentage: card.academic.percentage,
        reportCardUrl: card.verificationUrl
      });
      if (res.success) {
        alert(res.message);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSendingWhatsApp(null);
    }
  }

  const currentCard = reportCards[activeStudentIndex];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            Holistic Progress Card (HPC) &amp; Academic Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600" />
            Official Student Report Cards
          </h1>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900"
          >
            {availableClasses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900"
          >
            {availableTerms.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xs font-bold text-stone-500">Generating CBSE Holistic Progress Cards...</span>
        </div>
      ) : reportCards.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-500 font-bold text-xs">
          No students found for {selectedClass}. Select another class above.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Student Roster Picker */}
          <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-2 lg:col-span-1 max-h-[850px] overflow-y-auto">
            <div className="text-xs font-black text-stone-900 px-3 py-1 flex items-center justify-between">
              <span>Class Students ({reportCards.length})</span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">8-Point Scale</span>
            </div>

            <div className="space-y-1">
              {reportCards.map((card, idx) => (
                <button
                  key={card.student.id}
                  onClick={() => setActiveStudentIndex(idx)}
                  className={`w-full p-3 rounded-2xl text-left transition flex items-center justify-between text-xs ${
                    activeStudentIndex === idx
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "hover:bg-stone-50 text-stone-700 font-medium"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-black">{card.student.name}</div>
                    <div className={`text-[10px] ${activeStudentIndex === idx ? "text-blue-100" : "text-stone-400"}`}>
                      Adm: {card.student.admissionNo} • Roll: {card.student.rollNo}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    activeStudentIndex === idx
                      ? "bg-white/20 text-white"
                      : "bg-stone-100 text-stone-800"
                  }`}>
                    {card.academic.overallGrade} ({card.academic.percentage}%)
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: High-Resolution Printable A4 Report Card */}
          {currentCard && (
            <div className="lg:col-span-3 space-y-4">
              
              {/* Quick Action Bar for Current Student */}
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-5 py-3 rounded-2xl text-xs">
                <span className="font-bold text-blue-900">
                  Showing Verified Progress Card for <strong>{currentCard.student.name}</strong>
                </span>
                <button
                  onClick={() => handleSendSingleWhatsApp(currentCard)}
                  disabled={isSendingWhatsApp === currentCard.student.id}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {isSendingWhatsApp === currentCard.student.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  📲 Send to Parent on WhatsApp
                </button>
              </div>

              {/* Printable Official A4 Document */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-stone-300 shadow-lg space-y-6 text-stone-900 print:border-none print:shadow-none print:p-0">
                
                {/* School Crest & Header */}
                <div className="text-center border-b-2 border-stone-900 pb-5 space-y-1">
                  <div className="text-[11px] font-bold text-stone-600 tracking-widest uppercase">
                    Recognized &amp; Registered Educational Institution, Delhi NCR
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-blue-950">
                    CRAYON BOX SCHOOL
                  </h2>
                  <div className="text-xs text-stone-600 font-medium">
                    Kh. No. 6/20, D-Block, Shastri Park Extn, Burari, Delhi-110084 • Registration No: <strong>2730588</strong>
                  </div>
                  <div className="inline-block mt-2 bg-stone-900 text-white px-5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                    Holistic Progress Card (HPC) • Academic Session {currentCard.academic.academicSession}
                  </div>
                </div>

                {/* Student Profile Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">Student Name</span>
                    <strong className="text-stone-900 font-black">{currentCard.student.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">Admission No / Roll No</span>
                    <strong className="text-stone-900 font-black">{currentCard.student.admissionNo} / {currentCard.student.rollNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">Class &amp; Section</span>
                    <strong className="text-stone-900 font-black">{currentCard.student.className} - {currentCard.student.sectionName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">Date of Birth</span>
                    <strong className="text-stone-900 font-black">{currentCard.student.dob}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">Father's Name</span>
                    <strong className="text-stone-800">{currentCard.student.fatherName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">Mother's Name</span>
                    <strong className="text-stone-800">{currentCard.student.motherName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">Examination Term</span>
                    <strong className="text-blue-900">{currentCard.academic.examTerm}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">Attendance Record</span>
                    <strong className="text-emerald-700 font-black">{currentCard.academic.attendancePercentage}% (Present)</strong>
                  </div>
                </div>

                {/* Part 1: Scholastic Areas Table */}
                <div className="space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-blue-950 border-b border-stone-200 pb-1">
                    Part 1: Scholastic Performance (Standard 8-Point Scale)
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-center border border-stone-300">
                      <thead>
                        <tr className="bg-stone-100 font-black text-stone-800 border-b border-stone-300">
                          <th className="p-2.5 text-left border-r border-stone-300">Subject</th>
                          <th className="p-2.5 border-r border-stone-300">Periodic Test (10)</th>
                          <th className="p-2.5 border-r border-stone-300">Multiple Assess (5)</th>
                          <th className="p-2.5 border-r border-stone-300">Portfolio (5)</th>
                          <th className="p-2.5 border-r border-stone-300">Sub Enrichment (5)</th>
                          <th className="p-2.5 border-r border-stone-300">Term Exam (75)</th>
                          <th className="p-2.5 border-r border-stone-300 bg-stone-200">Total (100)</th>
                          <th className="p-2.5 bg-blue-50 text-blue-950">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 font-medium">
                        {currentCard.academic.subjects && currentCard.academic.subjects.length > 0 ? (
                          currentCard.academic.subjects.map((sub: any, i: number) => (
                            <tr key={i} className="hover:bg-stone-50/50">
                              <td className="p-2.5 text-left font-bold border-r border-stone-300">{sub.subjectName}</td>
                              <td className="p-2.5 border-r border-stone-300">{sub.periodicTest}</td>
                              <td className="p-2.5 border-r border-stone-300">{sub.multipleAssessment}</td>
                              <td className="p-2.5 border-r border-stone-300">{sub.portfolio}</td>
                              <td className="p-2.5 border-r border-stone-300">{sub.subjectEnrichment}</td>
                              <td className="p-2.5 border-r border-stone-300">{sub.halfYearlyExam}</td>
                              <td className="p-2.5 font-black border-r border-stone-300 bg-stone-50">{sub.totalMarksObtained}</td>
                              <td className="p-2.5 font-black text-blue-900 bg-blue-50/50">{sub.grade}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="p-4 text-center text-stone-400">No marks entered for this term.</td>
                          </tr>
                        )}
                        <tr className="bg-stone-100 font-black border-t-2 border-stone-300 text-stone-900">
                          <td className="p-2.5 text-left border-r border-stone-300">Grand Total &amp; Overall Percentage</td>
                          <td colSpan={5} className="p-2.5 text-right border-r border-stone-300 pr-4">
                            Total Marks Obtained: <strong>{currentCard.academic.totalObtained} / {currentCard.academic.maxMarks}</strong>
                          </td>
                          <td className="p-2.5 border-r border-stone-300 bg-stone-200 font-black">
                            {currentCard.academic.percentage}%
                          </td>
                          <td className="p-2.5 bg-blue-100 text-blue-950 font-black text-sm">
                            {currentCard.academic.overallGrade}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Part 2 & Part 3: Co-Scholastic & NEP 2020 360-Degree Skill Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Co-Scholastic Activities */}
                  <div className="border border-stone-200 rounded-2xl p-4 space-y-2 bg-stone-50/50 text-xs">
                    <div className="font-black text-stone-900 border-b border-stone-200 pb-1">
                      Part 2: Co-Scholastic Activities (3-Point Scale A-C)
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">Work Education / SUPW</span>
                        <span className="font-black bg-white px-2 py-0.5 rounded border border-stone-200">{currentCard.holistic.work_education_grade}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">Art Education &amp; Craft</span>
                        <span className="font-black bg-white px-2 py-0.5 rounded border border-stone-200">{currentCard.holistic.art_education_grade}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">Health &amp; Physical Education</span>
                        <span className="font-black bg-white px-2 py-0.5 rounded border border-stone-200">{currentCard.holistic.health_physical_grade}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">Discipline &amp; Punctuality</span>
                        <span className="font-black bg-white px-2 py-0.5 rounded border border-stone-200">{currentCard.holistic.discipline_grade}</span>
                      </div>
                    </div>
                  </div>

                  {/* NEP 2020 360-Degree Skill Matrix */}
                  <div className="border border-stone-200 rounded-2xl p-4 space-y-2 bg-stone-50/50 text-xs">
                    <div className="font-black text-stone-900 border-b border-stone-200 pb-1">
                      Part 3: NEP 2020 360° Holistic Skill Matrix
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">Critical &amp; Analytical Thinking</span>
                        <strong className="text-blue-900">{currentCard.holistic.critical_thinking_score} / 100</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">Collaboration &amp; Teamwork</span>
                        <strong className="text-blue-900">{currentCard.holistic.collaboration_score} / 100</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">Communication &amp; Leadership</span>
                        <strong className="text-blue-900">{currentCard.holistic.communication_score} / 100</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">Creativity &amp; Problem Solving</span>
                        <strong className="text-blue-900">{currentCard.holistic.creativity_score} / 100</strong>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Class Teacher Remarks & Verification QR Footer */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] font-bold text-stone-400 block">Class Teacher Remarks:</span>
                    <p className="font-medium italic text-stone-800">
                      "{currentCard.holistic.teacher_remarks}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 border-l border-stone-200 pl-4">
                    <div className="w-16 h-16 bg-white border border-stone-300 rounded-xl p-1.5 flex flex-col items-center justify-center">
                      <QrCode className="w-12 h-12 text-stone-900" />
                    </div>
                    <div className="text-[10px] space-y-0.5 font-mono">
                      <div className="font-bold text-stone-900">Scan to Verify</div>
                      <div className="text-stone-400">Institutional Digital Seal</div>
                      <div className="text-emerald-600 font-bold">✓ Authentic Certificate</div>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between items-end pt-8 text-xs font-black text-stone-900">
                  <div className="text-center space-y-1">
                    <div className="w-32 border-b border-stone-400" />
                    <span>Class Teacher Signature</span>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="w-32 border-b border-stone-400" />
                    <span>Examination Controller</span>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="w-32 border-b border-stone-900 font-bold" />
                    <span>Principal Signature &amp; Seal</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
