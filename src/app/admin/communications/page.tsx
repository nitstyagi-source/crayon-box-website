"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MessageSquare,
  Sparkles,
  Send,
  Zap,
  FileText,
  Settings,
  RefreshCw,
  Radio,
  Clock,
  ShieldCheck
} from "lucide-react";
import { VastuModuleBanner } from "@/components/common/VastuModuleBanner";
import { AiCommsStudioDesk } from "@/components/community/AiCommsStudioDesk";
import { WhatsAppEngineDesk } from "@/components/community/WhatsAppEngineDesk";
import { CampaignsBroadcastDesk } from "@/components/community/CampaignsBroadcastDesk";
import { ParentTeacherChatDesk } from "@/components/community/ParentTeacherChatDesk";

function CommunicationsHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab")?.toLowerCase();

  const [activeTab, setActiveTab] = useState<"ai-writer" | "campaigns" | "whatsapp" | "logs" | "parent-chat">(
    tabParam === "campaigns" ? "campaigns" :
    tabParam === "whatsapp" || tabParam === "triggers" ? "whatsapp" :
    tabParam === "logs" || tabParam === "settings" ? "logs" :
    tabParam === "parent-chat" || tabParam === "chat" ? "parent-chat" : "ai-writer"
  );

  useEffect(() => {
    if (tabParam === "campaigns") {
      setActiveTab("campaigns");
    } else if (tabParam === "whatsapp" || tabParam === "triggers") {
      setActiveTab("whatsapp");
    } else if (tabParam === "logs" || tabParam === "settings") {
      setActiveTab("logs");
    } else if (tabParam === "parent-chat" || tabParam === "chat") {
      setActiveTab("parent-chat");
    } else if (tabParam === "ai-writer" || tabParam === "ai") {
      setActiveTab("ai-writer");
    }
  }, [tabParam]);

  const handleTabChange = (tab: "ai-writer" | "campaigns" | "whatsapp" | "logs" | "parent-chat") => {
    setActiveTab(tab);
    router.replace(`/admin/communications?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans text-stone-900">
      {/* Executive Vastu Module Banner */}
      <VastuModuleBanner
        badgeText="AI & WhatsApp Engine"
        badgeIcon={<Sparkles className="w-3.5 h-3.5 text-[#D97706]" />}
        institutionText="Crayon Box International"
        title="Omnichannel Communications & WhatsApp Hub"
        titleIcon={<MessageSquare className="w-6 h-6 text-[#D97706]" />}
        description="Unified school communications engine: AI-powered circular studio, NEP-aligned pedagogical lesson planning, Meta Cloud WhatsApp absentee alerts, and multi-channel broadcast campaigns."
      />

      {/* Hub Master Navigation Tabs */}
      <div className="flex border-b border-[#E8DFC8] space-x-2 sm:space-x-3 overflow-x-auto pb-1">
        <button
          onClick={() => handleTabChange("ai-writer")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "ai-writer"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2] rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#D97706]" />
          AI Studio & Circular Drafter
        </button>

        <button
          onClick={() => handleTabChange("campaigns")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "campaigns"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2] rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Radio className="w-4 h-4 text-blue-600" />
          Omnichannel Broadcast Campaigns
        </button>

        <button
          onClick={() => handleTabChange("whatsapp")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "whatsapp"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2] rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          WhatsApp Automated Triggers
        </button>

        <button
          onClick={() => handleTabChange("logs")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "logs"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2] rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          Delivery Telematics & Gateway Logs
        </button>

        <button
          onClick={() => handleTabChange("parent-chat")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "parent-chat"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2] rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#D97706]" />
          Parent-Teacher Direct Chat
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "ai-writer" && <AiCommsStudioDesk />}
      {activeTab === "campaigns" && <CampaignsBroadcastDesk />}
      {activeTab === "whatsapp" && <WhatsAppEngineDesk initialSubTab="triggers" />}
      {activeTab === "logs" && <WhatsAppEngineDesk initialSubTab="logs" />}
      {activeTab === "parent-chat" && <ParentTeacherChatDesk />}
    </div>
  );
}

export default function OmnichannelCommunicationsHubPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-stone-500 font-bold text-xs flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#D97706]" />
          <span>Loading Omnichannel Communications & WhatsApp Hub...</span>
        </div>
      }
    >
      <CommunicationsHubContent />
    </Suspense>
  );
}
