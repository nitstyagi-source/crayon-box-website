"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Send,
  ArrowRight,
  GraduationCap,
  IndianRupee,
  Bus,
  Calendar,
  BookOpen,
  PhoneCall,
  CheckCircle2
} from "lucide-react";
import { askPublicVaniAction } from "@/app/actions/public-vani-actions";

export const HomepageVaniSection: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const popularChips = [
    { label: "🎓 Admissions 2026–27", text: "What is the admission process for Session 2026–2027?" },
    { label: "💰 Fee Structure", text: "What is the quarterly fee structure for Nursery & Class 1?" },
    { label: "🚌 Bus Routes", text: "Is school bus transport available in Burari and Sant Nagar?" },
    { label: "📅 Book Campus Visit", text: "How can I book a personal campus tour?" },
    { label: "🔬 Robotics & STEM", text: "What STEM and robotics learning programs do you offer?" }
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || question;
    if (!q.trim() || isAsking) return;

    setIsAsking(true);
    setResponse(null);

    try {
      const res = await askPublicVaniAction({
        sessionId: `HOME-${Date.now()}`,
        userQuery: q
      });

      if (res.success && res.responseMarkdown) {
        setResponse(res.responseMarkdown);
      }
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-stone-900 via-slate-950 to-blue-950 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10 space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Meet VANI • 24/7 Digital Admissions Receptionist</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Ask VANI Anything About Our School
          </h2>

          <p className="text-sm sm:text-base text-slate-300/90 max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re exploring admissions for 2026–27, checking approved fee structures, verifying bus routes, or booking a campus visit, <strong>VANI is here to help — anytime, day or night.</strong>
          </p>
        </div>

        {/* Interactive Query Box */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-lg"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question (e.g. 'Class 2 admission fees and bus routes?')..."
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none font-medium placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={isAsking || !question.trim()}
              className="bg-blue-950 hover:bg-blue-900 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all shrink-0"
            >
              <span>Ask VANI</span>
              <Send className="w-4 h-4 text-amber-400" />
            </button>
          </form>

          {/* Popular Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Popular:</span>
            {popularChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(chip.text);
                  handleAsk(chip.text);
                }}
                className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 hover:border-amber-400 px-3 py-1.5 rounded-full font-semibold text-slate-200 transition-all cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Live Response Card */}
          {isAsking && (
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 text-xs text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>VANI is querying the live school database and formulating your response...</span>
            </div>
          )}

          {response && (
            <div className="p-5 bg-white text-stone-900 rounded-2xl border border-white/20 shadow-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2 text-xs font-black text-blue-950">
                  <Bot className="w-4 h-4 text-amber-500" />
                  <span>VANI Official School Answer</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ✓ Database Verified
                </span>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {response}
              </div>
            </div>
          )}
        </div>

        {/* Small Disclosure & Full-Page Link */}
        <div className="text-center space-y-2 pt-2">
          <p className="text-[11px] text-slate-400 max-w-xl mx-auto">
            * VANI is our AI admissions receptionist trained on approved school policies. For personalized assistance, you can also book a campus tour or speak with our counsellors.
          </p>
          <Link
            href="/ask-vani"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Open Dedicated Full-Screen VANI Reception Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
};
