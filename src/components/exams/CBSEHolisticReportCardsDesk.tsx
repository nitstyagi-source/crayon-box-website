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
  ChevronRight,
  Check
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { useInstitution } from "@/components/providers/InstitutionContext";
import {
  getBulkClassReportCardsAction,
  sendReportCardWhatsAppAction
} from "@/app/actions/exam-report-card-actions";
import { getInstitutionClassesAction } from "@/app/actions/attendance-actions";

export function CBSEHolisticReportCardsDesk({ embedded = false }: { embedded?: boolean }) {
  const { activeCampusId } = useCampusContext();
  const { currentInstitution, selectedInstitutionObj } = useInstitution();
  const activeInst = currentInstitution || activeCampusId || 'CBS';

  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [selectedTerm, setSelectedTerm] = useState("Term 1 (Half Yearly Examination)");
  const [selectedSession, setSelectedSession] = useState("2026–2027");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<string | null>(null);
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [activeStudentIndex, setActiveStudentIndex] = useState(0);

  const availableTerms = [
    "Term 1 (Half Yearly Examination)",
    "Term 2 (Annual Examination)",
    "Periodic Assessment 1",
    "Periodic Assessment 2"
  ];

  // Dynamic Classes
  useEffect(() => {
    async function loadDynamicClasses() {
      try {
        const res = await getInstitutionClassesAction(activeInst);
        if (res.success && res.classes && res.classes.length > 0) {
          const clsList = res.classes as string[];
          setAvailableClasses(clsList);
          if (!clsList.includes(selectedClass)) {
            setSelectedClass(clsList[0]);
          }
        } else {
          setAvailableClasses(["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]);
        }
      } catch {
        setAvailableClasses(["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]);
      }
    }
    loadDynamicClasses();
  }, [activeInst]);

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
        reportCardUrl: card.verificationUrl,
        schoolName: selectedInstitutionObj?.name,
        principalName: selectedInstitutionObj?.principalName,
        institutionCode: selectedInstitutionObj?.code || currentInstitution
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
    <div className={`space-y-6 ${embedded ? '' : 'p-4 sm:p-8 max-w-7xl mx-auto min-h-screen text-slate-900 font-sans'}`}>
      
      {/* Top Header Controls (if not embedded) */}
      {!embedded && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF7F2] p-6 rounded-3xl border border-[#E8DFC8] shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-900 text-[11px] font-bold border border-amber-500/20">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Holistic Progress Card (HPC) &amp; Academic Engine
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-amber-600" />
              Official Student Report Cards &amp; HPC Dispatch
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" /> Print / Save PDF
            </button>
          </div>
        </div>
      )}

      {/* Cohort Selector Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8DFC8] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Cohort Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
            >
              {availableClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Assessment Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
            >
              {availableTerms.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Academic Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
            >
              <option value="2026–2027">2026–2027 (Current)</option>
              <option value="2025–2026">2025–2026</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E8DFC8]">
            {reportCards.length} Student{reportCards.length !== 1 ? 's' : ''} Ready
          </span>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" /> Batch Print Cards
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white p-12 rounded-3xl border border-[#E8DFC8] flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
          <span className="text-xs font-bold text-slate-500">Generating Holistic Progress Cards from Live DB...</span>
        </div>
      ) : reportCards.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#E8DFC8] text-center text-slate-500 font-bold text-xs">
          No students found for {selectedClass}. Select another class above or verify active enrollments.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Student List Roster */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-[#E8DFC8] p-4 shadow-xs space-y-3 print:hidden">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider px-2">
              Class Cohort Roster ({reportCards.length})
            </h3>
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {reportCards.map((card, idx) => {
                const isSelected = idx === activeStudentIndex;
                return (
                  <button
                    key={card.student.id}
                    onClick={() => setActiveStudentIndex(idx)}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between text-xs ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                        : "hover:bg-[#FAF7F2] text-slate-700 font-bold"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="block truncate">{card.student.name}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                        Adm: {card.student.admissionNo} • Roll: {card.student.rollNo}
                      </span>
                    </div>
                    <span className={`text-[11px] font-mono font-black shrink-0 px-2 py-0.5 rounded-lg ${
                      isSelected ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {card.academic.overallGrade}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: 360° Holistic Progress Card Preview & WhatsApp Action */}
          {currentCard && (
            <div className="lg:col-span-3 space-y-4">
              
              {/* Dispatch Action Banner */}
              <div className="bg-[#FAF7F2] border border-[#E8DFC8] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Viewing: <strong className="text-slate-950">{currentCard.student.name}</strong> ({currentCard.student.className})
                  </span>
                  {currentCard.academic.meetsCbse75PercentRule ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                      ✓ 75% Statutory Attendance Compliant ({currentCard.academic.attendancePercentage}%)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">
                      ⚠️ Attendance Defaulter ({currentCard.academic.attendancePercentage}%)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendSingleWhatsApp(currentCard)}
                    disabled={isSendingWhatsApp === currentCard.student.id}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50"
                  >
                    {isSendingWhatsApp === currentCard.student.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Send Official WhatsApp Card
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-white text-slate-900 hover:bg-slate-50 border border-[#E8DFC8] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-600" /> Print
                  </button>
                </div>
              </div>

              {/* Printable Official Holistic Progress Card */}
              <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8DFC8] shadow-md space-y-6 text-slate-900 print:m-0 print:p-0 print:border-none">
                
                {/* Institutional Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                  {selectedInstitutionObj?.logoUrl && (
                    <div className="flex justify-center mb-2">
                      <img
                        src={selectedInstitutionObj.logoUrl}
                        alt={selectedInstitutionObj.name || "School Logo"}
                        className="w-14 h-14 object-contain rounded-full border border-amber-200 bg-white p-1 shadow-xs"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-[10px] uppercase tracking-wider">
                      {selectedInstitutionObj?.affiliationNumber ? `Affiliation No. ${selectedInstitutionObj.affiliationNumber}` : (selectedInstitutionObj?.boardAffiliation || "Recognized Academic Institution")}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900">
                    {selectedInstitutionObj?.name || "ACADEMIC INSTITUTION"}
                  </h2>
                  <p className="text-xs font-bold uppercase text-slate-600">
                    {[selectedInstitutionObj?.address, selectedInstitutionObj?.phone ? `Ph: ${selectedInstitutionObj.phone}` : null].filter(Boolean).join(" • ") || "Official Student Assessment Record"}
                  </p>
                  <h3 className="text-sm font-black text-amber-700 uppercase pt-2 tracking-widest">
                    HOLISTIC PROGRESS CARD (HPC) — NEP 2020 ASSESSMENT RECORD
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    Academic Session: {currentCard.academic.academicSession} • {currentCard.academic.examTerm}
                  </span>
                </div>

                {/* Student Profile Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFC8] text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Student Name</span>
                    <strong className="text-slate-900 text-sm">{currentCard.student.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Admission No</span>
                    <strong className="font-mono text-slate-900">{currentCard.student.admissionNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Class &amp; Section</span>
                    <strong className="text-slate-900">{currentCard.student.className} – {currentCard.student.sectionName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Roll Number</span>
                    <strong className="font-mono text-slate-900">{currentCard.student.rollNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Father's Name</span>
                    <span className="font-bold text-slate-800">{currentCard.student.fatherName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Mother's Name</span>
                    <span className="font-bold text-slate-800">{currentCard.student.motherName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Date of Birth</span>
                    <span className="font-bold text-slate-800">{currentCard.student.dob}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Attendance Rate</span>
                    <strong className="text-emerald-700 font-mono text-sm">{currentCard.academic.attendancePercentage}%</strong>
                  </div>
                </div>

                {/* Scholastic Assessment Marks Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Part 1: Scholastic Assessment (Standard 8-Point Scale)
                  </h4>
                  <div className="overflow-x-auto border border-[#E8DFC8] rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FAF7F2] text-[10px] font-black uppercase text-slate-600 border-b border-[#E8DFC8]">
                          <th className="py-2.5 px-3">Subject</th>
                          <th className="py-2.5 px-3 text-center">PT (10)</th>
                          <th className="py-2.5 px-3 text-center">MA (5)</th>
                          <th className="py-2.5 px-3 text-center">Portfolio (5)</th>
                          <th className="py-2.5 px-3 text-center">Sub. Enrich (5)</th>
                          <th className="py-2.5 px-3 text-center">Theory (80)</th>
                          <th className="py-2.5 px-3 text-center font-black text-slate-900">Total (100)</th>
                          <th className="py-2.5 px-3 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DFC8]">
                        {currentCard.academic.subjects.map((sub: any, sIdx: number) => (
                          <tr key={sIdx} className="hover:bg-amber-50/40">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{sub.subjectName}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{sub.periodicTest}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{sub.multipleAssessment}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{sub.portfolio}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{sub.subjectEnrichment}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{sub.halfYearlyExam}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-black text-slate-900">{sub.totalMarksObtained}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="font-mono font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                                {sub.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-[#FAF7F2] font-black text-slate-900 border-t-2 border-[#E8DFC8]">
                          <td className="py-3 px-3 uppercase">Grand Aggregate</td>
                          <td colSpan={5} className="py-3 px-3 text-right text-xs">
                            Total: <strong>{currentCard.academic.totalObtained} / {currentCard.academic.maxMarks}</strong>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-sm text-indigo-700">
                            {currentCard.academic.percentage}%
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-black rounded-md text-xs">
                              {currentCard.academic.overallGrade}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Co-Scholastic & 360° HPC Domains */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC8] space-y-2 text-xs">
                    <h5 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">
                      Part 2: Co-Scholastic Achievements
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex justify-between bg-white p-2 rounded-xl border border-[#E8DFC8]">
                        <span className="text-slate-600">Work Education:</span>
                        <strong className="text-emerald-700 font-mono">{currentCard.holistic.work_education_grade}</strong>
                      </div>
                      <div className="flex justify-between bg-white p-2 rounded-xl border border-[#E8DFC8]">
                        <span className="text-slate-600">Art Education:</span>
                        <strong className="text-emerald-700 font-mono">{currentCard.holistic.art_education_grade}</strong>
                      </div>
                      <div className="flex justify-between bg-white p-2 rounded-xl border border-[#E8DFC8]">
                        <span className="text-slate-600">Health &amp; PE:</span>
                        <strong className="text-emerald-700 font-mono">{currentCard.holistic.health_physical_grade}</strong>
                      </div>
                      <div className="flex justify-between bg-white p-2 rounded-xl border border-[#E8DFC8]">
                        <span className="text-slate-600">Discipline:</span>
                        <strong className="text-emerald-700 font-mono">{currentCard.holistic.discipline_grade}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC8] space-y-2 text-xs">
                    <h5 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">
                      Part 3: NEP 2020 360° Core Competencies
                    </h5>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2 rounded-xl border border-[#E8DFC8]">
                        <span className="text-[10px] text-slate-500 block">Critical Thinking</span>
                        <strong className="font-mono text-slate-900">{currentCard.holistic.critical_thinking_score}/100</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-[#E8DFC8]">
                        <span className="text-[10px] text-slate-500 block">Collaboration</span>
                        <strong className="font-mono text-slate-900">{currentCard.holistic.collaboration_score}/100</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-[#E8DFC8]">
                        <span className="text-[10px] text-slate-500 block">Creativity</span>
                        <strong className="font-mono text-slate-900">{currentCard.holistic.creativity_score}/100</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teacher Remarks & Digital QR Verification */}
                <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 max-w-xl">
                    <strong className="block font-black text-slate-900 uppercase">Class Teacher Remarks:</strong>
                    <p className="text-slate-700 italic">
                      "{currentCard.holistic.teacher_remarks}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFC8]">
                    <QrCode className="w-10 h-10 text-slate-900" />
                    <div className="text-[10px] leading-tight text-slate-600">
                      <strong className="text-slate-900 block font-black">Digital Verification</strong>
                      Scan QR code to verify on official portal
                    </div>
                  </div>
                </div>

                {/* Signatures Footer */}
                <div className="pt-8 grid grid-cols-3 text-center text-xs font-black text-slate-700 border-t border-slate-200">
                  <div>
                    <div className="h-8"></div>
                    <span>Class Teacher</span>
                  </div>
                  <div>
                    <div className="h-8"></div>
                    <span>Examination In-Charge</span>
                  </div>
                  <div>
                    <div className="min-h-8 flex flex-col justify-end">
                      {selectedInstitutionObj?.principalName && (
                        <span className="font-serif italic text-slate-800 text-xs">{selectedInstitutionObj.principalName}</span>
                      )}
                    </div>
                    <span className="text-slate-950 font-black">Principal / Head of School</span>
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
