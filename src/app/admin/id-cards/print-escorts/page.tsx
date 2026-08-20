"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { 
  Printer, ArrowLeft, User, QrCode, ShieldCheck, Phone, Sparkles 
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getEscortsForCardGeneration } from "@/app/actions/id-cards";

export default function EscortCardBatchPrintPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-400 font-bold text-xs animate-pulse">Loading Printable Escort Cards...</div>}>
      <EscortCardBatchPrintContent />
    </Suspense>
  );
}

function EscortCardBatchPrintContent() {
  const { activeCampusId } = useCampusContext();
  const [escorts, setEscorts] = useState<any[]>([]);
  const [layoutMode, setLayoutMode] = useState<"front" | "back" | "both">("both");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getEscortsForCardGeneration(activeCampusId);
      if (res.success && res.data) {
        setEscorts(res.data);
      }
      setIsLoading(false);
    }
    load();
  }, [activeCampusId]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Top Header - Hidden on Print */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <Link 
            href="/admin/id-cards"
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to ID Cards Hub
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Print Batch: Authorized Escort Cards</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Printing {escorts.length} escort cards for registered parents, drivers, and guardians (Session 2026-2027).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Layout Mode Switcher */}
          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setLayoutMode("front")}
              className={`px-3 py-1.5 rounded-lg transition-all ${layoutMode === "front" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"}`}
            >
              Fronts Only
            </button>
            <button
              onClick={() => setLayoutMode("back")}
              className={`px-3 py-1.5 rounded-lg transition-all ${layoutMode === "back" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"}`}
            >
              Backs Only
            </button>
            <button
              onClick={() => setLayoutMode("both")}
              className={`px-3 py-1.5 rounded-lg transition-all ${layoutMode === "both" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"}`}
            >
              Side-by-Side
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-stone-900 hover:bg-stone-800 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Print Sheet (A4)
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div id="printable-escort-cards" className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:p-0">
        {escorts.map(escort => {
          const firstStudent = escort.authorized_students?.[0];

          return (
            <div key={escort.id} className="space-y-4 print:break-inside-avoid print:page-break-inside-avoid">
              
              {/* FRONT SIDE */}
              {(layoutMode === "front" || layoutMode === "both") && (
                <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-md p-4 flex flex-col justify-between h-[225px] relative overflow-hidden print:shadow-none">
                  <div className="flex items-center justify-between border-b-2 border-stone-900 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                        CBS
                      </div>
                      <div>
                        <h3 className="font-black text-xs text-stone-900 uppercase tracking-tight">Crayon Box School</h3>
                        <p className="text-[8px] font-bold text-purple-700 uppercase tracking-wider">Authorized Escort Card • 2026-2027</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-black bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded border border-purple-300">
                      {escort.relationship}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 py-2 flex-1">
                    <div className="w-20 h-24 rounded-xl border-2 border-stone-800 overflow-hidden shrink-0 bg-stone-100 flex items-center justify-center">
                      {escort.photo_url ? (
                        <img src={escort.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-stone-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5 text-[10px]">
                      <h4 className="font-black text-xs text-stone-900 uppercase truncate">
                        {escort.full_name}
                      </h4>
                      <p className="text-stone-600">
                        <span className="font-bold text-stone-400">Escort ID:</span> <span className="font-mono font-bold text-stone-900">{escort.escort_code}</span>
                      </p>
                      <p className="text-stone-600 truncate">
                        <span className="font-bold text-stone-400">Student:</span>{" "}
                        <span className="font-bold text-stone-900">
                          {firstStudent ? `${firstStudent.first_name} ${firstStudent.last_name || ''}` : 'Authorized Family'}
                        </span>
                      </p>
                      <p className="text-stone-600">
                        <span className="font-bold text-stone-400">Validity:</span> 31 Mar 2027
                      </p>
                      <p className="text-stone-600 font-mono text-[9px]">
                        <span className="font-bold text-stone-400">Phone:</span> {escort.mobile}
                      </p>
                    </div>

                    <div className="w-20 h-20 bg-white border-2 border-stone-800 rounded-xl p-1 shrink-0 flex flex-col items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0 0h30v30H0zm5 5v20h20V5zm5 5h10v10H10zM70 0h30v30H70zm5 5v20h20V5zm5 5h10v10H80zM0 70h30v30H0zm5 5v20h20V75zm5 5h10v10H10zM40 10h10v10H40zm10 20h10v10H50zm-10 20h20v10H40zm30 10h10v20H70zm10 10h10v10H80zm-40 10h20v10H40zm20 10h10v10H60zm20 0h10v10H80z" />
                      </svg>
                      <span className="text-[6px] font-mono font-black text-stone-500 tracking-tighter truncate w-full text-center">
                        {escort.escort_code}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-1 flex justify-between items-center text-[7px] text-stone-400 font-bold uppercase">
                    <span>Main Campus Gate Pickup</span>
                    <span>Status: Verified Active</span>
                  </div>
                </div>
              )}

              {/* BACK SIDE */}
              {(layoutMode === "back" || layoutMode === "both") && (
                <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-md p-4 flex flex-col justify-between h-[225px] relative overflow-hidden print:shadow-none">
                  <div className="border-b border-stone-200 pb-1 flex justify-between items-center">
                    <span className="font-black text-[10px] text-stone-900 uppercase">Authorized Pickup Terms</span>
                    <span className="font-mono text-[8px] text-stone-400">CARD: {escort.card_number}</span>
                  </div>

                  <div className="space-y-1 text-[9px] text-stone-600 flex-1 py-1">
                    <p><span className="font-bold text-stone-800">Escort Name:</span> {escort.full_name} ({escort.relationship})</p>
                    <p><span className="font-bold text-stone-800">Authorized Students:</span> {escort.authorized_students?.map((s: any) => s.first_name).join(', ') || 'All Ward Students'}</p>
                    <p className="text-[8px] text-stone-500 pt-1">
                      1. This card must be scanned by security at the dismissal gate to authorize student handover.
                    </p>
                    <p className="text-[8px] text-stone-500">
                      2. If lost or if pickup authorization is revoked, report immediately to school reception.
                    </p>
                  </div>

                  <div className="border-t border-stone-300 pt-2 flex justify-between items-end text-[8px]">
                    <div>
                      <span className="text-stone-600 font-bold block">www.crayonboxschool.com</span>
                      <span className="text-[7px] text-stone-400">Main Gate 1 • Burari</span>
                    </div>
                    <div className="text-center">
                      <div className="w-16 border-b border-stone-900 mb-0.5"></div>
                      <span className="font-bold text-stone-800 text-[7px] block">Authorized Signature</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Direct A4 Printing Style */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-escort-cards, #printable-escort-cards * {
            visibility: visible;
          }
          #printable-escort-cards {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            padding: 10px;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

    </div>
  );
}
