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
  CheckCircle2,
  HelpCircle,
  Clock,
  ShieldCheck
} from "lucide-react";
import { askPublicVaniAction, PublicVaniState } from "@/app/actions/public-vani-actions";

export default function DedicatedAskVaniPage() {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [contextState, setContextState] = useState<PublicVaniState>({});
  const [enquiryNo, setEnquiryNo] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "vani"; text: string; time: string }>>([
    {
      role: "vani",
      text: "Namaste and welcome to Crayon Box School! 🙏 I am VANI, your 24/7 digital admissions receptionist. I can answer questions regarding Academic Session 2026–27 admissions, approved fee structures, bus routes across Delhi NCR, and campus tour bookings. How may I assist you today?",
      time: "Just now"
    }
  ]);

  const quickPrompts = [
    { label: "🎓 Admissions 2026–27", text: "How do I apply for admissions for Academic Session 2026–27?" },
    { label: "💰 Fee Structure", text: "What is the complete quarterly fee breakdown for Nursery and Class 1?" },
    { label: "🚌 Bus Routes", text: "Do you provide school bus transport in Burari, Sant Nagar, and Delhi NCR?" },
    { label: "📅 Book Campus Visit", text: "I would like to schedule a personal campus tour tomorrow at 11 AM." },
    { label: "🔬 Curriculum & STEM", text: "What curriculum and robotics innovation labs do you offer?" },
    { label: "📞 Talk to Admissions", text: "Can you connect me with an admissions counsellor?" }
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || query;
    if (!textToSend.trim() || isProcessing) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { role: "user", text: textToSend, time: timeStr }]);
    setQuery("");
    setIsProcessing(true);

    try {
      const res = await askPublicVaniAction({
        sessionId: `FULLPAGE-${Date.now()}`,
        userQuery: textToSend,
        contextState
      });

      if (res.success) {
        setChatMessages(prev => [
          ...prev,
          {
            role: "vani",
            text: res.responseMarkdown,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        if (res.contextState) setContextState(res.contextState);
        if (res.enquiryNo) setEnquiryNo(res.enquiryNo);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/60 py-8 sm:py-12 text-stone-900 font-sans">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            VANI • 24/7 Virtual Admissions Receptionist Desk
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
            <Bot className="w-8 h-8 text-amber-400" />
            Meet VANI — Your Digital Receptionist
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Trained directly on our approved fee rules, transport routes, and 2026–27 prospectus. Automatically creates verified admissions enquiries and schedules campus tours.
          </p>
        </div>

        {/* Priority Enquiry Confirmation Banner */}
        {enquiryNo && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-emerald-700 block">Priority Enquiry Registered in School CRM:</span>
              <strong className="text-sm font-black text-emerald-950">{enquiryNo}</strong>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
        )}

        {/* Main Conversational Sandbox */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl flex flex-col h-[620px] overflow-hidden">
          
          {/* Chat Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/30">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "vani" && (
                  <div className="w-8 h-8 rounded-full bg-blue-950 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    m.role === "user"
                      ? "bg-blue-950 text-white rounded-tr-xs font-medium"
                      : "bg-white text-stone-800 border border-stone-200 rounded-tl-xs"
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
                  <div
                    className={`text-[10px] mt-2 text-right font-medium ${
                      m.role === "user" ? "text-blue-300" : "text-stone-400"
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 p-3 text-xs text-stone-500">
                <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                <span>VANI is querying the live school database...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 flex gap-2 overflow-x-auto">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.text)}
                className="text-xs whitespace-nowrap bg-white border border-stone-200 hover:border-amber-400 hover:text-amber-800 px-3 py-1.5 rounded-full font-bold text-stone-600 transition-colors shadow-2xs cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3.5 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your admissions question here..."
              className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-950/20 font-medium"
            />
            <button
              type="submit"
              disabled={isProcessing || !query.trim()}
              className="bg-blue-950 hover:bg-blue-900 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span>Ask VANI</span>
              <Send className="w-4 h-4 text-amber-400" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
