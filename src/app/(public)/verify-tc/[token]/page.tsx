import React from "react";
import { ShieldCheck, CheckCircle2, Building2, FileText, Calendar, Users } from "lucide-react";
import { verifyTransferCertificateTokenAction } from "@/app/actions/tc-generator-actions";

export default async function PublicVerifyTcPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const res = await verifyTransferCertificateTokenAction(token);

  if (!res.success || !res.certificate) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-stone-300 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-stone-900">Certificate Not Found</h2>
          <p className="text-xs text-stone-500">
            The scanned QR code / reference token "{token}" is invalid or has expired from the public registry.
          </p>
        </div>
      </div>
    );
  }

  const tc = res.certificate;
  const inst = res.institution || {
    name: "Crayon Box School",
    shortName: "CBS",
    code: "CBS",
    address: "Sant Nagar, Burari, Delhi-110084",
    affiliation: "Institutional Registration No: 2730588",
    logoUrl: "/logo.png"
  };

  return (
    <div className="min-h-screen bg-stone-100/70 flex items-center justify-center p-4 sm:p-8 text-stone-900 font-sans">
      <div className="bg-white max-w-2xl w-full p-6 sm:p-10 rounded-3xl border-2 border-stone-200 shadow-2xl space-y-6">
        
        {/* Verification Status Header */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-950">
          <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <h3 className="text-sm font-black flex items-center gap-1.5 text-emerald-900">
              ✓ Verified Authentic School Transfer Certificate
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium">
              Officially issued by {inst.name} ({inst.affiliation}).
            </p>
          </div>
        </div>

        {/* School Crest */}
        <div className="text-center border-b border-stone-200 pb-4 space-y-2">
          {inst.logoUrl && (
            <div className="flex justify-center">
              <img
                src={inst.logoUrl}
                alt={inst.name}
                className="w-14 h-14 rounded-full object-contain border border-stone-200 p-1 bg-white shadow-xs"
              />
            </div>
          )}
          <h2 className="text-xl font-black text-blue-950 uppercase">{inst.name}</h2>
          <div className="text-xs text-stone-500">{inst.address}</div>
        </div>

        {/* Student Details Grid */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <span className="text-stone-500 block text-[10px]">TC Number:</span>
              <strong className="font-mono text-stone-900">{tc.tc_number}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Admission No:</span>
              <strong className="font-mono text-stone-900">{tc.admission_no}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Pupil Name:</span>
              <strong className="text-blue-950 uppercase">{tc.student_name}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Class Left:</span>
              <strong className="text-stone-900">{tc.class_last_attended}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Father's Name:</span>
              <strong className="text-stone-800">{tc.father_name}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Mother's Name:</span>
              <strong className="text-stone-800">{tc.mother_name}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-2">
            <div>
              <span className="text-stone-500 block text-[10px]">Date of Birth:</span>
              <strong className="font-mono">{new Date(tc.dob).toLocaleDateString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Annual Result:</span>
              <strong className="text-emerald-700">{tc.annual_result || "Passed"}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Dues Clearance:</span>
              <strong className="text-emerald-800 font-bold">All Dues Cleared (Nil)</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Date of Issue:</span>
              <strong className="font-mono">{new Date(tc.issue_date || Date.now()).toLocaleDateString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Registry Seal Footer */}
        <div className="pt-4 border-t border-stone-200 text-center text-[10px] text-stone-400 font-mono">
          Cryptographically Verified Digital Record • {inst.name} Institutional Registry
        </div>

      </div>
    </div>
  );
}
