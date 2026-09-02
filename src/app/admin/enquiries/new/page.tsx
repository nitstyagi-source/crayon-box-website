import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, PhoneCall, Sparkles } from "lucide-react";
import { AdminNewEnquiryForm } from "@/components/enquiry/AdminNewEnquiryForm";

export const metadata = {
  title: "New Admission Enquiry Master | Crayon Box ERP",
  description: "Comprehensive 360-degree enquiry intake master for front desk and counsellors."
};

export default function NewAdmissionEnquiryPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-12">
      {/* Top Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/admin/dashboard" className="hover:text-slate-900 font-bold">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/admin/admissions" className="hover:text-slate-900 font-bold">Admissions Hub</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/admin/enquiries" className="hover:text-slate-900 font-bold">Enquiries CRM</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-black">New Admission Enquiry</span>
        </div>

        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Pipeline
        </Link>
      </div>

      {/* Render Full Master Form */}
      <AdminNewEnquiryForm />
    </div>
  );
}
