"use client";

import React, { useState, useEffect, use } from "react";
import { CheckCircle2, XCircle, AlertTriangle, FileText, ChevronLeft, ZoomIn, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getAdmissionApplicationDetailsAction } from "@/app/actions/admissions-application-actions";

export default function DocumentVerification({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string>("Birth Certificate");

  useEffect(() => {
    async function loadApp() {
      setLoading(true);
      try {
        const res = await getAdmissionApplicationDetailsAction(applicationId);
        if (res.success && res.application) {
          setApplication(res.application);
        }
      } finally {
        setLoading(false);
      }
    }
    loadApp();
  }, [applicationId]);

  const fullName = application ? `${application.student_first_name || ''} ${application.student_last_name || ''}`.trim() || application.full_name || 'Applicant' : 'Loading...';
  const token = application?.application_no || `APP-${applicationId.slice(0, 8).toUpperCase()}`;
  const grade = application?.class_applied || application?.grade_applied || 'Grade Applied';
  const status = (application?.status || 'PENDING REVIEW').toUpperCase();

  const documentsList = application?.documents_checklist && Array.isArray(application.documents_checklist) && application.documents_checklist.length > 0
    ? application.documents_checklist
    : [
        { name: "Birth Certificate", verified: false },
        { name: "Parent Aadhaar Card", verified: false },
        { name: "Previous School Report Card", verified: false }
      ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -m-6">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/admissions" className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Verify Documents: {fullName}{" "}
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                {status}
              </span>
            </h1>
            <p className="text-xs text-slate-500">Token: {token} &bull; {grade}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Form Data */}
        <div className="w-1/3 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto hidden lg:block">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Application Details</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Student Demographics</h3>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm space-y-3">
                <div className="flex justify-between"><span className="text-slate-500">Full Name</span><span className="font-bold text-slate-900">{fullName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">DOB</span><span className="font-bold text-slate-900">{application?.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString('en-IN') : 'Not Specified'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Blood Group</span><span className="font-bold text-slate-900">{application?.blood_group || 'N/A'}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Parent Information</h3>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm space-y-3">
                <div className="flex justify-between"><span className="text-slate-500">Father Name</span><span className="font-bold text-slate-900">{application?.father_name || application?.parent_name || 'Parent / Guardian'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-bold text-slate-900">{application?.father_phone || application?.parent_phone || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Address</span><span className="font-bold text-slate-900 text-right">{application?.residential_address || application?.locality || 'On File'}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Submitted Documents</h3>
              <div className="space-y-2">
                {documentsList.map((doc: any, i: number) => {
                  const docTitle = typeof doc === 'string' ? doc : (doc.name || doc.document_type || `Document #${i + 1}`);
                  const isSel = selectedDoc === docTitle;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDoc(docTitle)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                        isSel ? "bg-blue-50 border border-blue-200" : "bg-white border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`flex items-center gap-2 text-sm font-bold ${isSel ? "text-blue-900" : "text-slate-700"}`}>
                        <FileText className={`w-4 h-4 ${isSel ? "text-blue-600" : "text-slate-400"}`} /> {docTitle}
                      </div>
                      {isSel && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Integrated PDF/Image Viewer */}
        <div className="flex-1 bg-slate-900 flex flex-col relative">
          
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"><ZoomIn className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            {/* Dynamic Document Viewer */}
            <div className="bg-white w-full max-w-2xl aspect-[1/1.4] shadow-2xl rounded-sm flex items-center justify-center border border-slate-800 text-center p-6">
              <div className="space-y-2">
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-slate-800 font-bold text-base">{selectedDoc}</p>
                <p className="text-xs text-slate-500">Applicant: {fullName} ({token})</p>
                <p className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full inline-block border border-emerald-200">
                  Ready for Administrative Attestation
                </p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="bg-slate-800 border-t border-slate-700 p-4 shrink-0 flex items-center justify-between">
            <p className="text-slate-300 text-sm font-bold">Reviewing: <span className="text-white">{selectedDoc}</span></p>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors">
                <XCircle className="w-4 h-4" /> Reject (Needs Re-upload)
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Flag for Review
              </button>
              <button className="flex items-center gap-2 px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-500/20">
                <CheckCircle2 className="w-4 h-4" /> Approve Document
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
