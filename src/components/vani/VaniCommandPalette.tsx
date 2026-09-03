"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Search,
  Sparkles,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  TrendingUp,
  FileText,
  Users,
  ShieldCheck,
  Bus,
  Layers,
  ChevronRight
} from "lucide-react";
import {
  askVaniOrchestratorAction,
  executeVaniConfirmedAction,
  VaniActionProposal
} from "@/app/actions/vani-orchestrator-actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  userName?: string;
  isSuperAdmin?: boolean;
}

export const VaniCommandPalette: React.FC<Props> = ({
  isOpen,
  onClose,
  userRole = "Admin",
  userName = "User",
  isSuperAdmin = true
}) => {
  const [query, setQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "vani"; text: string; action?: VaniActionProposal | null }>>([]);
  const [confirmedActions, setConfirmedActions] = useState<Record<string, boolean>>({});

  // Quick suggestions based on role
  const suggestions = userRole === "Faculty" || userRole === "Teacher" ? [
    "📝 Prepare today's Class 5 Maths lesson plan on Fractions",
    "📋 Create 8 differentiated homework questions for Class 6B",
    "✅ Submit Class 5A attendance register",
    "📅 What is my next teaching period?"
  ] : userRole === "Parent" ? [
    "🚌 Where is the school bus right now?",
    "💳 Check Quarter 2 fee statement & receipt",
    "📚 Today's homework & class diary",
    "⏰ Regular school timings & holiday calendar"
  ] : [
    "🏫 Today's School Pulse & attendance exceptions",
    "💰 Quarterly fee collections & defaulter arrears",
    "⚠️ Students below 75% attendance alert",
    "📊 Generate dynamic admissions report"
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSendQuery(customPrompt?: string) {
    const text = customPrompt || query;
    if (!text.trim() || isThinking) return;

    setMessages(prev => [...prev, { role: "user", text }]);
    setQuery("");
    setIsThinking(true);

    try {
      const res = await askVaniOrchestratorAction({
        sessionId: `PALETTE-${Date.now()}`,
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
      setIsThinking(false);
    }
  }

  async function handleConfirmAction(action: VaniActionProposal) {
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

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Search Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <strong className="text-sm font-black text-white">Ask VANI Copilot</strong>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {userRole.toUpperCase()} SCOPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Press Esc to close • ⌘K to toggle anytime</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="p-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2"
        >
          <Search className="w-4 h-4 text-stone-400 ml-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ask VANI anything (e.g. "${suggestions[0].replace(/^[^\s]+\s/, '')}")...`}
            autoFocus
            className="flex-1 bg-transparent border-none text-xs text-stone-900 focus:outline-none font-semibold placeholder:text-stone-400"
          />
          <button
            type="submit"
            disabled={isThinking || !query.trim()}
            className="bg-blue-950 hover:bg-blue-900 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>Ask</span>
            <Send className="w-3 h-3 text-amber-400" />
          </button>
        </form>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/40">
          {messages.length === 0 ? (
            <div className="space-y-4 py-4">
              <div className="text-center space-y-1">
                <Bot className="w-10 h-10 mx-auto text-amber-500/80 animate-bounce" />
                <h4 className="text-xs font-black text-stone-900">How can VANI assist you today, {userName}?</h4>
                <p className="text-[11px] text-stone-500 max-w-md mx-auto">
                  Trained across live ERP database tables. Never invents figures; provides instant operational intelligence.
                </p>
              </div>

              <div className="space-y-1.5 max-w-xl mx-auto">
                <span className="text-[10px] font-black tracking-wider text-stone-400 uppercase">Suggested Prompts</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendQuery(sug)}
                      className="text-left p-3 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 text-xs font-semibold text-stone-800 transition-all shadow-2xs flex items-center justify-between"
                    >
                      <span>{sug}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "vani" && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs space-y-3 ${
                    m.role === "user"
                      ? "bg-blue-950 text-white rounded-tr-xs font-medium"
                      : "bg-white text-stone-800 border border-stone-200 rounded-tl-xs"
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                  {/* Level 4 Action Confirmation Card */}
                  {m.action && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-stone-900 mt-2">
                      <div className="flex items-center gap-2 font-black text-amber-900 text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Action Proposal: {m.action.title}</span>
                      </div>
                      <p className="text-[11px] text-amber-800">{m.action.description}</p>
                      
                      <div className="pt-1">
                        {confirmedActions[m.action.actionId] ? (
                          <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Action Confirmed &amp; Executed into ERP</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConfirmAction(m.action!)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm &amp; Execute Action</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isThinking && (
            <div className="flex items-center gap-2 p-3 text-xs text-stone-500">
              <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
              <span>VANI is analyzing live ERP database records...</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
