"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Sparkles,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Check,
  ChevronRight,
  Flame,
  Award,
  BookOpen,
  Calendar,
  Layers
} from "lucide-react";
import {
  askVaniOrchestratorAction,
  getVaniProactiveInsightsAction,
  executeVaniConfirmedAction,
  VaniProactiveInsight,
  VaniActionProposal
} from "@/app/actions/vani-orchestrator-actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  userName?: string;
  isSuperAdmin?: boolean;
}

export const VaniGlobalDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  userRole = "Admin",
  userName = "User",
  isSuperAdmin = true
}) => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "vani"; text: string; action?: VaniActionProposal | null }>>([]);
  const [insights, setInsights] = useState<VaniProactiveInsight[]>([]);
  const [confirmedActions, setConfirmedActions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      loadInsights();
      if (messages.length === 0) {
        // Initial greeting
        const greeting = userRole === "Faculty" || userRole === "Teacher"
          ? `Good day, ${userName}! 👩‍🏫 I am VANI, your Classroom Copilot. I can prepare your NEP 2020 lesson plans, draft differentiated homework, and check your teaching timetable.`
          : userRole === "Parent"
            ? `Namaste, ${userName}! 👨‍👩‍👧 I am VANI, your Family Assistant. I can track your child's bus GPS radar, show today's homework, and provide fee statements.`
            : `Good morning, ${userName}! 👑 I am VANI, your School Operating Intelligence Layer. I have prepared your morning School Pulse and attendance exception reports.`;
        setMessages([{ role: "vani", text: greeting }]);
      }
    }
  }, [isOpen]);

  async function loadInsights() {
    try {
      const res = await getVaniProactiveInsightsAction(userRole);
      if (res.success && res.insights) {
        setInsights(res.insights);
      }
    } catch {}
  }

  async function handleSend(customText?: string) {
    const text = customText || query;
    if (!text.trim() || isProcessing) return;

    setMessages(prev => [...prev, { role: "user", text }]);
    setQuery("");
    setIsProcessing(true);

    try {
      const res = await askVaniOrchestratorAction({
        sessionId: `DRAWER-${Date.now()}`,
        userQuery: text,
        userRole,
        userName,
        isSuperAdmin
      });

      if (res.success) {
        setMessages(prev => [
          ...prev,
          {
            role: "vani",
            text: res.responseMarkdown,
            action: res.actionProposal
          }
        ]);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleConfirm(action: VaniActionProposal) {
    const res = await executeVaniConfirmedAction({
      actionId: action.actionId,
      actionType: action.actionType,
      userName,
      userRole,
      payload: action.payload
    });

    if (res.success) {
      setConfirmedActions(prev => ({ ...prev, [action.actionId]: true }));
      alert(res.message);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md sm:max-w-lg h-full shadow-2xl flex flex-col border-l border-stone-200">
        
        {/* Drawer Header */}
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm font-black text-white">VANI Copilot</strong>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {userRole.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Live ERP Intelligence Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Proactive Insights Ribbon (If Any) */}
        {insights.length > 0 && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-900">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span>Proactive ERP Insight</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-snug">
              {insights[0].title} — <span className="text-amber-900 font-semibold">{insights[0].description}</span>
            </p>
          </div>
        )}

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/40">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "vani" && (
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs space-y-2.5 ${
                  m.role === "user"
                    ? "bg-blue-950 text-white rounded-tr-xs font-medium"
                    : "bg-white text-stone-800 border border-stone-200 rounded-tl-xs"
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                {/* Level 4 Confirmation Card */}
                {m.action && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-stone-900 mt-2">
                    <div className="flex items-center gap-1.5 font-black text-amber-900 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{m.action.title}</span>
                    </div>
                    <p className="text-[10px] text-amber-800">{m.action.description}</p>
                    
                    <div>
                      {confirmedActions[m.action.actionId] ? (
                        <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Action Confirmed &amp; Committed to ERP</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConfirm(m.action!)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-all"
                        >
                          <Check className="w-3 h-3" />
                          <span>Confirm Action</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-stone-500 p-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
              <span>VANI is querying live ERP records...</span>
            </div>
          )}
        </div>

        {/* Bottom Input Form */}
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
            placeholder="Ask VANI (e.g. 'Today's pulse', 'Lesson plan')..."
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-950/20 font-medium"
          />
          <button
            type="submit"
            disabled={isProcessing || !query.trim()}
            className="bg-blue-950 hover:bg-blue-900 disabled:opacity-50 text-white p-2.5 rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Send className="w-4 h-4 text-amber-400" />
          </button>
        </form>

      </div>
    </div>
  );
};
