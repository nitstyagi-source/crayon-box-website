import React from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Award, School, Calendar, ArrowLeft, AlertTriangle } from "lucide-react";
import { verifyReportCardTokenAction } from "@/app/actions/exam-report-card-actions";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function VerifyReportCardPage({ params }: Props) {
  const { token } = await params;
  const result = await verifyReportCardTokenAction(token);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-stone-900">Certificate Not Found</h1>
          <p className="text-xs text-stone-500">
            {result.error || "The digital verification token provided is invalid or has expired."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Return to School Portal
          </Link>
        </div>
      </div>
    );
  }

  const cert = result.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-stone-50 flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-emerald-500/40 shadow-2xl max-w-lg w-full space-y-6 text-stone-900 relative overflow-hidden">
        
        {/* Top Verified Ribbon */}
        <div className="absolute top-0 right-0 left-0 bg-emerald-600 text-white py-1.5 px-4 text-center text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-4 h-4" /> Verified Authentic CBSE Academic Record
        </div>

        <div className="text-center pt-4 space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-blue-950">
            Crayon Box School
          </h1>
          <p className="text-xs font-bold text-stone-500">
            {cert.affiliation}
          </p>
        </div>

        {/* Student Verification Details */}
        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <span className="text-stone-500 font-bold">Student Name</span>
            <strong className="text-sm font-black text-stone-900">{cert.studentName}</strong>
          </div>

          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <span className="text-stone-500 font-bold">Admission Number</span>
            <strong className="font-mono font-bold text-stone-900">{cert.admissionNo}</strong>
          </div>

          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <span className="text-stone-500 font-bold">Class &amp; Section</span>
            <strong className="font-bold text-stone-900">{cert.className} - {cert.sectionName}</strong>
          </div>

          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <span className="text-stone-500 font-bold">Academic Session</span>
            <strong className="font-bold text-stone-900">{cert.academicSession}</strong>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-500 font-bold">Verification Status</span>
            <span className="text-emerald-700 font-black flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Genuine
            </span>
          </div>
        </div>

        {/* Digital Signature Seal */}
        <div className="text-center space-y-1 text-[11px] text-stone-400 font-mono">
          <div>Verified via School Central Exam Board</div>
          <div>Timestamp: {new Date(cert.verificationDate).toLocaleString()}</div>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            <School className="w-4 h-4" /> Go to School Website
          </Link>
        </div>

      </div>
    </div>
  );
}
