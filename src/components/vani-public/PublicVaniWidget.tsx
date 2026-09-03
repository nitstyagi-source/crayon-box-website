"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Sparkles,
  X,
  Send,
  CheckCircle2,
  PhoneCall,
  Calendar,
  Bus,
  FileText,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  MessageSquare
} from "lucide-react";
import { askPublicVaniAction, PublicVaniState } from "@/app/actions/public-vani-actions";

export const PublicVaniWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [contextState, setContextState] = useState<PublicVaniState>({});
  const [enquiryNo, setEnquiryNo] = useState<string | null>(null);

  const [messages, setMessages] = useState<Array<{ role: "user" | "vani"; text: string }>>([
    {
      role: "vani",
      text: "Namaste! 🙏 I'm VANI, your school's 24/7 digital admissions receptionist. I can help you with admissions, fee structures, curriculum, transport routes, and campus visit bookings. What would you like to know?"
    }
  ]);

  const quickPrompts = [
    { label: "🎓 Admissions 2026–27", text: "How do I apply for admissions for Academic Session 2026–27?" },
    { label: "💰 Fee Structure", text: "What is the fee structure for Nursery and Primary grades?" },
    { label: "🚌 Bus Transport", text: "Do you provide school bus transport in Burari, Sant Nagar, and Delhi NCR?" },
    { label: "📅 Book Campus Visit", text: "I would like to schedule a campus tour tomorrow at 11 AM." },
    { label: "📞 Talk to Admissions", text: "Can you connect me directly with an admissions counsellor?" }
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || query;
    if (!textToSend.trim() || isProcessing) return;

    setMessages(prev => [...prev, { role: "user", text: textToSend }]);
    setQuery("");
    setIsProcessing(true);

    try {
      const res = await askPublicVaniAction({
        sessionId: `WIDGET-${Date.now()}`,
        userQuery: textToSend,
        contextState
      });

      if (res.success) {
        setMessages(prev => [...prev, { role: "vani", text: res.responseMarkdown }]);
        if (res.contextState) setContextState(res.contextState);
        if (res.enquiryNo) setEnquiryNo(res.enquiryNo);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all border border-amber-400/40 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide text-white">Ask VANI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[10px] text-amber-300/90 font-medium">24/7 Digital Receptionist</p>
          </div>
        </button>
      )}

      {/* Expandable Chat Modal */}
      {isOpen && (
        <div className="bg-white rounded-3xl w-[92vw] sm:w-[400px] h-[580px] shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <strong className="text-sm font-black text-white">VANI Receptionist</strong>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ● Available 24/7
                  </span>
                </div>
                <p className="text-[10px] text-blue-200/80">Crayon Box School Admissions Helpdesk</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Enquiry Registered Banner (If applicable) */}
          {enquiryNo && (
            <div className="p-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between px-4 text-xs">
              <div>
                <span className="text-emerald-700 font-bold block text-[10px]">Priority Enquiry Registered:</span>
                <strong className="text-emerald-950 font-black">{enquiryNo}</strong>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          )}

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/40">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "vani" && (
                  <div className="w-7 h-7 rounded-full bg-blue-950 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                    m.role === "user"
                      ? "bg-blue-950 text-white rounded-tr-xs font-medium"
                      : "bg-white text-stone-800 border border-stone-200 rounded-tl-xs"
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-stone-500 p-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>VANI is checking official school database...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2 bg-stone-50 border-t border-stone-200 flex gap-1.5 overflow-x-auto">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.text)}
                className="text-[10px] whitespace-nowrap bg-white border border-stone-200 hover:border-amber-400 hover:text-amber-800 px-2.5 py-1 rounded-full font-bold text-stone-600 transition-colors shadow-2xs"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about admissions, fees, transport..."
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-950/20 font-medium"
            />
            <button
              type="submit"
              disabled={isProcessing || !query.trim()}
              className="bg-blue-950 hover:bg-blue-900 disabled:opacity-50 text-white p-2.5 rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
