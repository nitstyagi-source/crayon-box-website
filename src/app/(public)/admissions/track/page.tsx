"use client";

import { useState } from "react";
import { Search, CheckCircle2, Clock, FileText, AlertCircle, Calendar, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getAdmissionApplicationDetailsAction } from "@/app/actions/admissions-application-actions";

function TrackApplicationContent() {
  const searchParams = useSearchParams();
  const initialToken = searchParams?.get("token") || "";
  
  const [token, setToken] = useState(initialToken);
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState<"idle" | "found" | "not_found">("idle");
  const [appData, setAppData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    
    setIsSearching(true);
    setErrorMessage(null);
    try {
      const res = await getAdmissionApplicationDetailsAction(token.trim().toUpperCase());
      if (res.success && res.application) {
        setAppData(res.application);
        setStatus("found");
      } else {
        setAppData(null);
        setStatus("not_found");
        setErrorMessage(res.error || "Application not found");
      }
    } catch (err: any) {
      setStatus("not_found");
      setErrorMessage(err.message);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-24 font-sans">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">Track Application</h1>
          <p className="text-stone-600 text-lg">Enter your Application Reference ID to check live admission status.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="sr-only">Application Token</label>
              <input 
                type="text" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. APP-2026-XXXX" 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 text-stone-800 font-mono text-lg uppercase"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSearching}
              className="bg-blue-950 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap cursor-pointer shadow-md"
            >
              {isSearching ? "Searching Database..." : "Track Status"} <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {status === "not_found" && (
          <div className="bg-red-50 text-red-800 p-6 rounded-2xl border border-red-100 flex gap-4 items-start animate-in fade-in zoom-in duration-300">
            <div className="bg-red-100 p-2 rounded-full mt-1 shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Application Record Not Found</h3>
              <p className="text-red-700/80">
                {errorMessage || "No matching application found for this reference ID. Please check the ID or contact admissions desk."}
              </p>
            </div>
          </div>
        )}

        {status === "found" && appData && (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 p-8 overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex justify-between items-start border-b border-stone-100 pb-6">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-1">Reference ID</p>
                <p className="text-2xl font-mono font-black text-stone-900">{appData.application_no}</p>
                <p className="text-xs text-stone-500 mt-1">Submitted: {new Date(appData.created_at).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="bg-amber-100 text-amber-900 px-4 py-2 rounded-full font-black text-xs flex items-center gap-1.5 uppercase">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> {appData.status || "UNDER_REVIEW"}
              </div>
            </div>

            {/* Applicant Summary */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-black uppercase text-stone-400 block">Candidate Name</span>
                <strong className="text-stone-900 font-bold text-sm block">{appData.first_name} {appData.last_name || ''}</strong>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-stone-400 block">Class Applied</span>
                <strong className="text-stone-900 font-bold text-sm block">{appData.class_applied}</strong>
              </div>
            </div>

            {/* Lifecycle Stages */}
            <div className="space-y-6 pt-2">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-stone-900 block">Application Ingestion &amp; Registration</strong>
                  <p className="text-[11px] text-stone-500">12-Section master form received in database ledger.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${appData.status === 'DRAFT' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-stone-900 block">Document &amp; Eligibility Verification</strong>
                  <p className="text-[11px] text-stone-500">Admissions committee verifying statutory age and address criteria.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${appData.status === 'ENROLLED' ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-400'}`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-stone-900 block">Admission Enrollment &amp; Roll Number Allocation</strong>
                  <p className="text-[11px] text-stone-500">
                    {appData.admission_no ? `Enrolled with Permanent Admission No: ${appData.admission_no}` : "Pending final seat clearance."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
              Questions regarding this application? Reach admissions at <a href="mailto:admissions@crayonboxschool.com" className="text-blue-950 font-bold hover:underline">admissions@crayonboxschool.com</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackApplicationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-stone-500">Loading Application Tracker...</div>}>
      <TrackApplicationContent />
    </Suspense>
  );
}
