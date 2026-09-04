"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  HeartHandshake,
  Calendar,
  FileCheck2,
  LifeBuoy,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Camera
} from "lucide-react";
import { VastuModuleBanner } from "@/components/common/VastuModuleBanner";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { PtmSchedulerDesk } from "@/components/community/PtmSchedulerDesk";
import { ParentConsentDesk } from "@/components/community/ParentConsentDesk";
import { ParentGrievanceDesk } from "@/components/community/ParentGrievanceDesk";
import { ClassroomMomentsDesk } from "@/components/community/ClassroomMomentsDesk";

function ParentCareHubContent() {
  const { selectedInstitutionObj, isAllInstitutions } = useInstitution();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"ptm" | "consent" | "grievances" | "moments">("ptm");

  useEffect(() => {
    if (tabParam === "consent") {
      setActiveTab("consent");
    } else if (tabParam === "grievances" || tabParam === "helpdesk") {
      setActiveTab("grievances");
    } else if (tabParam === "moments") {
      setActiveTab("moments");
    } else if (tabParam === "ptm") {
      setActiveTab("ptm");
    }
  }, [tabParam]);

  const handleTabChange = (tab: "ptm" | "consent" | "grievances" | "moments") => {
    setActiveTab(tab);
    router.replace(`/admin/parent-care?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans text-stone-900">
      {/* Executive Vastu Module Banner */}
      <VastuModuleBanner
        badgeText="PTM & Grievance SLA"
        badgeIcon={<HeartHandshake className="w-3.5 h-3.5 text-[#D97706]" />}
        institutionText={selectedInstitutionObj?.name || (isAllInstitutions ? "All Campuses (Trust HQ)" : "Campus Hub")}
        title="Parent Engagement, PTM & Grievance Care Hub"
        titleIcon={<HeartHandshake className="w-6 h-6 text-[#D97706]" />}
        description="Parent partnership ecosystem: 1-on-1 sibling-aligned PTM scheduling, digital cryptographic excursion consent slips, and CBSE statutory grievance SLA resolution tracking."
      />

      {/* Hub Master Navigation Tabs */}
      <div className="flex border-b border-[#E8DFC8] space-x-2 sm:space-x-3 overflow-x-auto pb-1">
        <button
          onClick={() => handleTabChange("ptm")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "ptm"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2] rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Calendar className="w-4 h-4 text-[#D97706]" />
          PTM Slot Scheduler & Sibling Alignment
        </button>

        <button
          onClick={() => handleTabChange("consent")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "consent"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2] rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          Digital Parent Consent & Excursion Signatures
        </button>

        <button
          onClick={() => handleTabChange("grievances")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "grievances"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2] rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <LifeBuoy className="w-4 h-4 text-purple-600" />
          CBSE Statutory Grievance Redressal Desk
        </button>

        <button
          onClick={() => handleTabChange("moments")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "moments"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2] rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Camera className="w-4 h-4 text-[#D97706]" />
          Private Cohort "Daily Moments" Feed
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "ptm" && <PtmSchedulerDesk />}
      {activeTab === "consent" && <ParentConsentDesk />}
      {activeTab === "grievances" && <ParentGrievanceDesk />}
      {activeTab === "moments" && <ClassroomMomentsDesk />}
    </div>
  );
}

export default function ParentCareHubPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-stone-500 font-bold text-xs flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#D97706]" />
          <span>Loading Parent Engagement & Care Hub...</span>
        </div>
      }
    >
      <ParentCareHubContent />
    </Suspense>
  );
}
