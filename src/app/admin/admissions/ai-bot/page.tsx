"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Users,
  Phone,
  CheckCircle2,
  Clock,
  RefreshCw,
  Zap,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import {
  askAdmissionsAiBotAction,
  getAdmissionsAiInquiriesAction,
  AiInquiryRecord
} from "@/app/actions/ai-admissions-bot-actions";

export default function AIAdmissionsReceptionistPage() {
  const [query, setQuery] = useState("");
  const [parentName, setParentName] = useState("Mrs. Pooja Sharma");
  const [parentPhone, setParentPhone] = useState("+919810081008");
  const [targetGrade, setTargetGrade] = useState("Nursery");
  const [isProcessing, setIsProcessing] = useState(false);

  // Chat History
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([
    {
      sender: "bot",
      text: "Namaste! 🙏 Welcome to Crayon Box School Admissions Helpdesk. I can answer questions about fee structures, academic curriculum, age criteria, and bus transport routes across Delhi. How may I assist you today?",
      time: "Just now"
    }
  ]);

  const [inquiries, setInquiries] = useState<AiInquiryRecord[]>([]);

  const quickPrompts = [
    "What is the fee structure for Nursery 2026-27?",
    "What is the age eligibility for Class 1 admission?",
    "Do you provide school bus transport in Burari & Sant Nagar?",
    "What are the regular school timings for pre-primary?",
    "What documents are required for admission form submission?"
  ];

  useEffect(() => {
    loadInquiries();
  }, []);

  async function loadInquiries() {
    try {
      const res = await getAdmissionsAiInquiriesAction();
      if (res.success) {
        setInquiries(res.inquiries);
      }
    } catch {}
  }

  async function handleSendQuery(userText?: string) {
    const textToSend = userText || query;
    if (!textToSend.trim()) return;

    const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: "user", text: textToSend, time: newTime }]);
    setQuery("");
    setIsProcessing(true);

    try {
      const res = await askAdmissionsAiBotAction({
        userQuery: textToSend,
        parentName,
        parentPhone,
        targetGrade
      });

      if (res.success) {
        setChatMessages(prev => [
          ...prev,
          { sender: "bot", text: res.aiResponse || "", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        loadInquiries();
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-indigo-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            24/7 Autonomous Admissions Receptionist &amp; Lead Qualification
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-400" />
            AI Virtual Admissions Counselor Desk
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl">
            Answers parent inquiries in real-time regarding fee structures, NEP 2020 age eligibility, bus routes, and admission documents, auto-capturing qualified leads into your CRM.
          </p>
        </div>

        {/* Live Status */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 text-xs">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div className="space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1">
              <span>AI Receptionist Active</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-blue-300/80 font-mono text-[11px]">
              Response Time: ~0.4s
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Chat Simulator + Captured Leads Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Interactive Chat Simulator */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          
          {/* Chat Top Bar */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold shadow-sm">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div className="text-xs">
                <strong className="text-stone-900 block font-black">Crayon Box Admissions AI Assistant</strong>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  ● Online • Trained on 2026-27 Prospectus &amp; Fee Rules
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Parent Name"
                className="bg-white border border-stone-200 rounded-xl px-2.5 py-1 text-[11px] font-bold text-stone-900 w-32"
              />
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="bg-white border border-stone-200 rounded-xl px-2.5 py-1 text-[11px] font-bold text-stone-900"
              >
                <option value="Nursery">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 5">Class 5</option>
              </select>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-stone-50/30 text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-xl p-4 rounded-3xl space-y-1 ${
                    msg.sender === "user"
                      ? "bg-blue-900 text-white rounded-br-xs shadow-sm"
                      : "bg-white text-stone-900 border border-stone-200 rounded-bl-xs shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <div
                    className={`text-[9px] text-right font-mono ${
                      msg.sender === "user" ? "text-blue-200" : "text-stone-400"
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-stone-400 text-xs font-bold pl-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> AI Counselor is typing...
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200 flex gap-2 overflow-x-auto">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(p)}
                className="px-3 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-full text-[10px] font-bold text-stone-700 whitespace-nowrap shadow-2xs transition active:scale-95"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="p-4 bg-white border-t border-stone-200 flex gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about fees, age eligibility, bus routes, or documents..."
              className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-stone-900 font-medium focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={isProcessing || !query.trim()}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 transition"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>

        </div>

        {/* Right Col: Captured CRM Leads Log */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 self-start">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Captured Admission Leads ({inquiries.length})
            </h4>
            <button
              onClick={loadInquiries}
              className="text-stone-400 hover:text-stone-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs max-h-[540px] overflow-y-auto">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-stone-900 font-bold">{inq.parent_name}</strong>
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded">
                    {inq.target_grade}
                  </span>
                </div>
                <div className="text-[11px] text-stone-600 font-mono flex items-center gap-1">
                  <Phone className="w-3 h-3 text-stone-400" /> {inq.parent_phone}
                </div>
                <div className="text-[10px] text-stone-500 italic bg-white p-2 rounded-xl border border-stone-100">
                  "{inq.user_query}"
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-200/50">
                  <span>Intent: {inq.inquiry_intent}</span>
                  <span className="text-emerald-700 font-bold">HOT LEAD</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
