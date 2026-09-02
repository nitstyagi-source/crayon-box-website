import React, { Suspense } from "react";
import Link from "next/link";
import { PublicEnquiryForm } from "@/components/enquiry/PublicEnquiryForm";
import { Sparkles, Phone, MessageSquare, MapPin, Award, CheckCircle2, ChevronRight } from "lucide-react";

export const metadata = {
  title: "School Admission Enquiry 2026-2027 | Crayon Box School",
  description: "Official online admission enquiry for Nursery to Class 12. Book campus visits, download fee structures, and explore bus transport routes."
};

export default function PublicEnquiryPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-stone-900 font-bold">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/admissions" className="hover:text-stone-900 font-bold">Admissions</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-stone-900 font-black">Online Enquiry</span>
          </div>

          <div className="flex items-center gap-3 font-semibold">
            <span className="hidden sm:inline">Admissions Helpline:</span>
            <a href="tel:+919811102008" className="font-mono font-black text-blue-900 hover:underline">
              📞 +91 98111 02008
            </a>
          </div>
        </div>

        {/* Public Form */}
        <Suspense fallback={
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-xs font-bold text-stone-400">
            Loading Admission Portal...
          </div>
        }>
          <PublicEnquiryForm />
        </Suspense>

      </div>
    </div>
  );
}
