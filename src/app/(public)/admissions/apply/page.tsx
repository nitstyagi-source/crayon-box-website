"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MasterAdmissionForm } from "@/components/admissions/MasterAdmissionForm";
import { Sparkles, ShieldCheck, GraduationCap, CheckCircle2 } from "lucide-react";

function ApplyContent() {
  const searchParams = useSearchParams();
  const enquiryNo = searchParams.get("enquiry_no") || searchParams.get("enq") || "";

  return (
    <div className="min-h-screen bg-stone-50/70 py-12 sm:py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Academic Session 2026–2027 Admissions Open</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 font-serif tracking-tight">
            Master Admissions Application Form
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Complete the 12-section student ledger application. Enter your <strong>Enquiry Number</strong> or mobile above to auto-fill all previously submitted details.
          </p>
        </div>

        {/* Master Form */}
        <MasterAdmissionForm initialEnquiryNo={enquiryNo} />

      </div>
    </div>
  );
}

export default function ApplyNowPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-12 text-center text-xs text-stone-500">Loading Application...</div>}>
      <ApplyContent />
    </Suspense>
  );
}
