"use client";

import React, { useState } from "react";
import {
  Sparkles,
  FileText,
  MessageSquare,
  BookOpen,
  Send,
  Printer,
  Copy,
  CheckCircle2,
  RefreshCw,
  Zap,
  Globe,
  Languages,
  Award,
  Layers,
  HeartHandshake,
  ShieldCheck
} from "lucide-react";
import {
  enhanceTeacherReplyAction,
  generateSchoolCircularAction,
  generateWeeklyLessonPlanAction
} from "@/app/actions/ai-copilot-actions";

export function AiCommsStudioDesk() {
  const [activeTab, setActiveTab] = useState<"circular" | "reply_enhancer" | "lesson_plan">("circular");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Circular Drafter State
  const [circularTopic, setCircularTopic] = useState("Annual Sports Meet & Athletic Carnival 2026");
  const [targetAudience, setTargetAudience] = useState("All Parents (Nursery to Class 10)");
  const [eventDate, setEventDate] = useState("Saturday, 14th November 2026");
  const [keyPoints, setKeyPoints] = useState("Reporting time for students is strictly 08:00 AM in proper sports uniform.\nParents are cordially invited to attend the opening march-past ceremony at 09:30 AM.\nSchool transport will ply in the morning as per regular routes; evening drop-off will be at 02:30 PM.\nRefreshments and lunch packets will be provided by the school.\nStudents must carry their water bottles and school ID cards.");
  const [generatedCircular, setGeneratedCircular] = useState<any>(null);

  // Reply Enhancer State
  const [studentName, setStudentName] = useState("Aarav Sharma");
  const [parentName, setParentName] = useState("Mr. Sharma");
  const [rawNotes, setRawNotes] = useState("aarav is getting distracted in math class and talking to his benchmate during geometry lecture. please tell him to do homework daily and submit practice notebook.");
  const [selectedTone, setSelectedTone] = useState<"EMPATHETIC" | "FORMAL" | "BILINGUAL" | "FIRM_CONSTRUCTIVE">("EMPATHETIC");
  const [enhancedReply, setEnhancedReply] = useState<any>(null);

  // Lesson Plan State
  const [lessonGrade, setLessonGrade] = useState("Class 5");
  const [lessonSubject, setLessonSubject] = useState("Mathematics");
  const [lessonTopic, setLessonTopic] = useState("Fractions, Mixed Numbers & Decimals");
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  async function handleDraftCircular(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await generateSchoolCircularAction({
        topic: circularTopic,
        targetAudience,
        eventDate,
        keyPoints
      });
      if (res.success) {
        setGeneratedCircular(res);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleEnhanceReply(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await enhanceTeacherReplyAction({
        rawNotes,
        studentName,
        parentName,
        tone: selectedTone
      });
      if (res.success) {
        setEnhancedReply(res);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleGenerateLessonPlan(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await generateWeeklyLessonPlanAction({
        className: lessonGrade,
        subjectName: lessonSubject,
        topicName: lessonTopic
      });
      if (res.success) {
        setGeneratedPlan(res.lessonPlan);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function handleCopyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#E8DFC8] space-x-2 sm:space-x-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("circular")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "circular"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2]/60 rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <FileText className="w-4 h-4 text-[#D97706]" />
          Official School Circular Drafter
        </button>

        <button
          onClick={() => setActiveTab("reply_enhancer")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "reply_enhancer"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2]/60 rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-purple-600" />
          Parent Reply & Grievance Tone Polish
        </button>

        <button
          onClick={() => setActiveTab("lesson_plan")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "lesson_plan"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2]/60 rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-600" />
          NCERT 5-Day Lesson Planner
        </button>
      </div>

      {/* TAB 1: OFFICIAL CIRCULAR DRAFTER */}
      {activeTab === "circular" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Form */}
          <div className="bg-[#FAF7F2] p-6 sm:p-7 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D97706]" />
                Configure School Circular Details
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Enter event points to generate an official circular and formatted WhatsApp broadcast message.
              </p>
            </div>

            <form onSubmit={handleDraftCircular} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Event / Notice Topic</label>
                <input
                  type="text"
                  value={circularTopic}
                  onChange={(e) => setCircularTopic(e.target.value)}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Scheduled Date</label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Key Guidelines & Instructions</label>
                <textarea
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  rows={6}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 text-stone-900 font-medium leading-relaxed focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-200" />}
                Draft Official Circular & WhatsApp Notice
              </button>
            </form>
          </div>

          {/* Right: Output Document */}
          <div className="space-y-4">
            {generatedCircular ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E8DFC8] shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <span className="text-xs font-mono font-bold text-[#92400E]">
                    Ref: {generatedCircular.refNo}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-stone-800 border border-[#E8DFC8] rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-stone-600" /> Print PDF
                    </button>
                  </div>
                </div>

                <div dangerouslySetInnerHTML={{ __html: generatedCircular.circularHtml }} />

                {/* WhatsApp Broadcast Preview */}
                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                  <div className="font-bold text-emerald-950 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Broadcast Format:
                    </span>
                    <button
                      onClick={() => handleCopyText(generatedCircular.whatsAppMessage)}
                      className="text-emerald-700 hover:underline font-bold"
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-emerald-900 whitespace-pre-line bg-white p-3 rounded-xl border border-emerald-200">
                    {generatedCircular.whatsAppMessage}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF7F2] p-12 rounded-3xl border border-[#E8DFC8] text-center text-xs font-bold text-stone-500 space-y-2">
                <FileText className="w-10 h-10 text-stone-400 mx-auto" />
                <div>Click "Draft Official Circular" to generate the document preview.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PARENT REPLY TONE ENHANCER */}
      {activeTab === "reply_enhancer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#FAF7F2] p-6 sm:p-7 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-600" />
                Parent Grievance & Message Tone Enhancer
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Type raw thoughts/notes and AI will polish it into a constructive, positive parent communication.
              </p>
            </div>

            <form onSubmit={handleEnhanceReply} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Student Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Parent Salutation</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Teacher Raw Observations / Notes</label>
                <textarea
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  rows={4}
                  placeholder="e.g. not doing homework, talking in class..."
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 text-stone-900 font-medium focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Target Communication Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "EMPATHETIC", label: "🌟 Empathetic & Partner" },
                    { id: "FORMAL", label: "📜 Formal & Official" },
                    { id: "FIRM_CONSTRUCTIVE", label: "🎯 Firm & Constructive" },
                    { id: "BILINGUAL", label: "🇮🇳 Bilingual (Eng + Hindi)" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTone(t.id as any)}
                      className={`p-2.5 rounded-xl border text-left font-bold transition text-[11px] ${
                        selectedTone === t.id
                          ? "bg-[#8B5CF6] text-white border-[#7C3AED] shadow-sm"
                          : "bg-white text-stone-700 border-[#E8DFC8] hover:bg-[#F3EDE2]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                ✨ Polish & Transform Message
              </button>
            </form>
          </div>

          {/* Right: Polished Output */}
          <div className="space-y-4">
            {enhancedReply ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DFC8] shadow-md space-y-4">
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI Polished Response
                  </span>
                  <button
                    onClick={() => handleCopyText(enhancedReply.polishedReply + (enhancedReply.hindiTranslation ? "\n\n" + enhancedReply.hindiTranslation : ""))}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-xs font-bold flex items-center gap-1 border border-purple-200"
                  >
                    <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs font-medium text-stone-800 leading-relaxed whitespace-pre-line">
                  {enhancedReply.polishedReply}
                </div>

                {enhancedReply.hindiTranslation && (
                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs font-medium text-amber-950 leading-relaxed whitespace-pre-line">
                    <div className="font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-amber-700" /> Hindi Translation:
                    </div>
                    {enhancedReply.hindiTranslation}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#FAF7F2] p-12 rounded-3xl border border-[#E8DFC8] text-center text-xs font-bold text-stone-500 space-y-2">
                <HeartHandshake className="w-10 h-10 text-stone-400 mx-auto" />
                <div>Submit teacher notes to generate a supportive parent response.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LESSON PLANNER */}
      {activeTab === "lesson_plan" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#FAF7F2] p-6 sm:p-7 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                NCERT Weekly Pedagogical Planner
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Generate 5-day structured lesson plans aligned with NEP 2020 competency benchmarks.
              </p>
            </div>

            <form onSubmit={handleGenerateLessonPlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Grade / Class</label>
                  <input
                    type="text"
                    value={lessonGrade}
                    onChange={(e) => setLessonGrade(e.target.value)}
                    className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={lessonSubject}
                    onChange={(e) => setLessonSubject(e.target.value)}
                    className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Topic / Unit Name</label>
                <input
                  type="text"
                  value={lessonTopic}
                  onChange={(e) => setLessonTopic(e.target.value)}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                📚 Generate 5-Day NCERT Lesson Plan
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {generatedPlan ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DFC8] shadow-md space-y-4 max-h-[600px] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <div>
                    <h4 className="font-black text-stone-900 text-sm">{generatedPlan.topic}</h4>
                    <p className="text-[11px] text-stone-500">{generatedPlan.class} • {generatedPlan.subject}</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-stone-800 border border-[#E8DFC8] rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-600" /> Print
                  </button>
                </div>

                <div className="space-y-3">
                  {generatedPlan.days?.map((day: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC8] text-xs space-y-1.5">
                      <div className="font-bold text-[#92400E] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#D97706]/20 text-[#D97706] flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        Day {idx + 1}: {day.title || day.subtopic}
                      </div>
                      <p className="text-stone-700 leading-relaxed pl-7">{day.activity || day.content}</p>
                      {day.assessment && (
                        <div className="pl-7 text-[11px] text-stone-500 italic">
                          Assessment: {day.assessment}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF7F2] p-12 rounded-3xl border border-[#E8DFC8] text-center text-xs font-bold text-stone-500 space-y-2">
                <BookOpen className="w-10 h-10 text-stone-400 mx-auto" />
                <div>Submit topic details to generate NEP-aligned lesson plans.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
