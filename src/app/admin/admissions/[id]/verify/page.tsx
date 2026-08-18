"use client";

import { CheckCircle2, XCircle, AlertTriangle, FileText, ChevronLeft, ZoomIn } from "lucide-react";
import Link from "next/link";

export default function DocumentVerification() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -m-6">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/admissions/pipeline" className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">Verify Documents: Aarav Sharma <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Pending Review</span></h1>
            <p className="text-xs text-slate-500">Token: APP-26-8942A • Grade 4</p>
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
                <div className="flex justify-between"><span className="text-slate-500">Full Name</span><span className="font-bold text-slate-900">Aarav Sharma</span></div>
                <div className="flex justify-between"><span className="text-slate-500">DOB</span><span className="font-bold text-slate-900">14 Oct 2016 (9y 5m)</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Blood Group</span><span className="font-bold text-slate-900">O+</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Parent Information</h3>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm space-y-3">
                <div className="flex justify-between"><span className="text-slate-500">Father Name</span><span className="font-bold text-slate-900">Rajesh Sharma</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-bold text-slate-900">+91 98765 43210</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Address</span><span className="font-bold text-slate-900 text-right">A-42, Sector 15,<br/>Delhi 110001</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Submitted Documents</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-900"><FileText className="w-4 h-4 text-blue-600" /> Birth Certificate</div>
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                </div>
                <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg cursor-pointer hover:bg-slate-50">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><FileText className="w-4 h-4 text-slate-400" /> Parent Aadhar Card</div>
                </div>
                <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg cursor-pointer hover:bg-slate-50">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><FileText className="w-4 h-4 text-slate-400" /> Grade 3 Report Card</div>
                </div>
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
            {/* Mocked Document Viewer (e.g. Birth Certificate) */}
            <div className="bg-white w-full max-w-2xl aspect-[1/1.4] shadow-2xl rounded-sm flex items-center justify-center border border-slate-800">
               <p className="text-slate-300 font-serif text-lg">Document Viewer / PDF Embed<br/><span className="text-sm font-sans block text-center mt-2">Birth_Certificate_Aarav.pdf</span></p>
            </div>
          </div>

          {/* Action Row */}
          <div className="bg-slate-800 border-t border-slate-700 p-4 shrink-0 flex items-center justify-between">
            <p className="text-slate-300 text-sm font-bold">Reviewing: <span className="text-white">Birth Certificate</span></p>
            
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
