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

export default function AICommunicationsStudioPage() {
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-indigo-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Pedagogical Copilot &amp; Communications Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-400" />
            AI Teacher Assistant &amp; Communications Copilot
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl">
            Draft official school circulars, polish parent grievance responses into empathetic partnership notes, and generate 5-day structured lesson plans in seconds.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("circular")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "circular"
              ? "border-purple-600 text-purple-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          📜 Official School Circular Drafter
        </button>

        <button
          onClick={() => setActiveTab("reply_enhancer")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "reply_enhancer"
              ? "border-purple-600 text-purple-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          ✨ Parent Reply &amp; Grievance Tone Polish
        </button>

        <button
          onClick={() => setActiveTab("lesson_plan")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "lesson_plan"
              ? "border-purple-600 text-purple-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          📚 NCERT 5-Day Lesson Planner
        </button>
      </div>

      {/* TAB 1: OFFICIAL CIRCULAR DRAFTER */}
      {activeTab === "circular" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Input Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Configure School Circular Details
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Enter key event points to generate an official formatted circular and WhatsApp broadcast.
              </p>
            </div>

            <form onSubmit={handleDraftCircular} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Event / Notice Topic</label>
                <input
                  type="text"
                  value={circularTopic}
                  onChange={(e) => setCircularTopic(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Scheduled Date</label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Key Guidelines &amp; Instructions (Bullet Points)</label>
                <textarea
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  rows={6}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 font-medium leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                ⚡ Draft Official Circular &amp; Broadcast
              </button>
            </form>
          </div>

          {/* Right: Output Document */}
          <div className="space-y-4">
            {generatedCircular ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-stone-300 shadow-xl space-y-5">
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <span className="text-xs font-mono font-bold text-purple-900">
                    Ref: {generatedCircular.refNo}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print PDF
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
              <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-xs font-bold text-stone-400 space-y-2">
                <FileText className="w-10 h-10 text-stone-300 mx-auto" />
                <div>Click "Draft Official Circular" to generate the document preview.</div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: PARENT REPLY TONE ENHANCER */}
      {activeTab === "reply_enhancer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Input Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-600" />
                Parent Grievance &amp; Message Tone Enhancer
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Parent Salutation</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
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
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 font-medium"
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
                          ? "bg-purple-900 text-white border-purple-600 shadow-sm"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
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
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                ✨ Polish &amp; Transform Message
              </button>
            </form>
          </div>

          {/* Right: Polished Output */}
          <div className="space-y-4">
            {enhancedReply ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> AI Polished Response
                  </span>
                  <button
                    onClick={() => handleCopyText(enhancedReply.polishedReply + (enhancedReply.hindiTranslation ? "\n\n" + enhancedReply.hindiTranslation : ""))}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-stone-800 font-medium whitespace-pre-line leading-relaxed">
                  {enhancedReply.polishedReply}
                </div>

                {enhancedReply.hindiTranslation && (
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium whitespace-pre-line leading-relaxed space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <Languages className="w-3.5 h-3.5" /> Hindi Translation / हिंदी अनुवाद:
                    </div>
                    <div>{enhancedReply.hindiTranslation}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-xs font-bold text-stone-400 space-y-2">
                <MessageSquare className="w-10 h-10 text-stone-300 mx-auto" />
                <div>Type teacher notes and click "Polish &amp; Transform Message".</div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: NCERT 5-DAY LESSON PLANNER */}
      {activeTab === "lesson_plan" && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  NCERT 5-Day Structured Lesson Plan Generator
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Generates learning objectives, warm-ups, experiential activities, and homework aligned with NEP 2020.
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerateLessonPlan} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Grade</label>
                <input
                  type="text"
                  value={lessonGrade}
                  onChange={(e) => setLessonGrade(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={lessonSubject}
                  onChange={(e) => setLessonSubject(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Chapter / Topic</label>
                <input
                  type="text"
                  value={lessonTopic}
                  onChange={(e) => setLessonTopic(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                  ⚡ Generate 5-Day Lesson Plan &amp; Classroom Activities
                </button>
              </div>
            </form>
          </div>

          {/* Generated Plan Output */}
          {generatedPlan && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
              <div className="border-b border-stone-200 pb-3">
                <h4 className="text-lg font-black text-stone-900">{generatedPlan.title}</h4>
                <div className="text-xs text-stone-500 mt-1">
                  <strong>Learning Objectives:</strong> {generatedPlan.learningObjectives.join(' • ')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
                {generatedPlan.days.map((d: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="font-black text-purple-950 pb-1 border-b border-stone-200">{d.day}</div>
                      <div><strong>Warm-up:</strong> <span className="text-stone-600">{d.warmUp}</span></div>
                      <div><strong>Board Work:</strong> <span className="text-stone-600">{d.boardWork}</span></div>
                      <div><strong>Activity:</strong> <span className="text-stone-600">{d.handsOnActivity}</span></div>
                    </div>
                    <div className="pt-2 border-t border-stone-200 text-[11px] text-purple-900 font-medium">
                      <strong>HW:</strong> {d.homework}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
