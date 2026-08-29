"use client";

import { useState } from "react";
import { Search, CheckCircle2, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Suspense } from "react";

function TrackApplicationContent() {
  const searchParams = useSearchParams();
  const initialToken = searchParams?.get("token") || "";
  
  const [token, setToken] = useState(initialToken);
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState<"idle" | "found" | "not_found">("idle");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    
    setIsSearching(true);
    // Mock lookup logic
    setTimeout(() => {
      if (token.toUpperCase().startsWith("APP-") || token.length > 5) {
        setStatus("found");
      } else {
        setStatus("not_found");
      }
      setIsSearching(false);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">Track Application</h1>
          <p className="text-stone-600 text-lg">Enter your Application Reference ID to check the current status.</p>
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
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-stone-800 font-mono text-lg uppercase"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSearching}
              className="bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap"
            >
              {isSearching ? "Searching..." : "Track Status"} <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {status === "not_found" && (
          <div className="bg-red-50 text-red-800 p-6 rounded-2xl border border-red-100 flex gap-4 items-start animate-in fade-in zoom-in duration-300">
            <div className="bg-red-100 p-2 rounded-full mt-1">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Application Not Found</h3>
              <p className="text-red-700/80">We couldn't find an application matching that reference ID. Please check the ID and try again, or contact admissions for support.</p>
            </div>
          </div>
        )}

        {status === "found" && (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 p-8 overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-8 border-b border-stone-100 pb-6">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-1">Reference ID</p>
                <p className="text-xl font-mono font-bold text-stone-900">{token.toUpperCase()}</p>
              </div>
              <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" /> Under Review
              </div>
            </div>

            <div className="space-y-8">
              <div className="relative">
                <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-stone-200"></div>
                
                <div className="flex gap-6 relative z-10 mb-8">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="pt-2">
                    <h4 className="font-bold text-stone-900 text-lg">Application Submitted</h4>
                    <p className="text-stone-500 text-sm">We have received your application and fee payment.</p>
                  </div>
                </div>

                <div className="flex gap-6 relative z-10 mb-8">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="pt-2">
                    <h4 className="font-bold text-stone-900 text-lg">Under Review</h4>
                    <p className="text-stone-500 text-sm">Our admissions committee is currently reviewing your documents.</p>
                  </div>
                </div>

                <div className="flex gap-6 relative z-10">
                  <div className="w-12 h-12 bg-stone-200 text-stone-400 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                    <div className="w-3 h-3 bg-stone-400 rounded-full"></div>
                  </div>
                  <div className="pt-2">
                    <h4 className="font-bold text-stone-400 text-lg">Assessment & Interview</h4>
                    <p className="text-stone-400 text-sm">Pending scheduling based on review results.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-stone-100 text-center">
              <p className="text-stone-500 text-sm">Questions about your application? Contact our admissions office at <a href="mailto:admissions@crayonboxschool.com" className="text-primary font-bold hover:underline">admissions@crayonboxschool.com</a></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackApplicationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 pt-32 pb-24 flex items-center justify-center"><p>Loading...</p></div>}>
      <TrackApplicationContent />
    </Suspense>
  );
}
