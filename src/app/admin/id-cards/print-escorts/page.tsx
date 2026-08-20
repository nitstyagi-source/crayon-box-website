"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Printer, ArrowLeft, User, QrCode, ShieldCheck, Phone, Sparkles 
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getStudentsWithAllEscorts } from "@/app/actions/id-cards";

export default function EscortCardBatchPrintPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-400 font-bold text-xs animate-pulse">Loading Student Escort Cards...</div>}>
      <EscortCardBatchPrintContent />
    </Suspense>
  );
}

function EscortCardBatchPrintContent() {
  const { activeCampusId } = useCampusContext();
  const searchParams = useSearchParams();
  const classFilter = searchParams.get("class") || "All Classes";

  const [studentEscortCards, setStudentEscortCards] = useState<any[]>([]);
  const [layoutMode, setLayoutMode] = useState<"both" | "front" | "back">("both");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getStudentsWithAllEscorts(activeCampusId);
      if (res.success && res.data) {
        let list = res.data;
        if (classFilter !== "All Classes") {
          list = list.filter((s: any) => s.class_name === classFilter);
        }
        setStudentEscortCards(list);
      }
      setIsLoading(false);
    }
    load();
  }, [activeCampusId, classFilter]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Top Header - Hidden on Print */}
      <div className="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <Link 
            href="/admin/id-cards"
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to ID Cards Hub
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Print Batch: Student Escort Cards</h1>
            <span className="bg-purple-100 text-purple-900 font-mono text-[11px] font-black px-2.5 py-0.5 rounded-md">
              Vertical CR80 • 54 mm × 85.6 mm (2.125&quot; × 3.375&quot;)
            </span>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Standard ISO/IEC Vertical Format • 1 Card per student containing all authorized pickup escorts.
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
              Backs (All Escorts)
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
            <Printer className="w-4 h-4 text-amber-400" /> Print Escort Cards (A4)
          </button>
        </div>
      </div>

      {/* Printable Sheet Container - Vertical Portrait (54mm x 85.6mm) */}
      <div id="printable-escort-cards" className="flex flex-wrap gap-4 justify-center print:justify-start print:gap-3 print:p-0">
        {studentEscortCards.map((item, idx) => {
          const cleanAdm = item.admission_no || `CB10${(idx + 1).toString().padStart(2, '0')}`;
          const escortsList = item.escorts || [];

          return (
            <div key={item.id} className="flex flex-wrap gap-3 print:gap-2 print:break-inside-avoid print:page-break-inside-avoid">
              
              {/* FRONT SIDE - VERTICAL CR80 (54mm x 85.6mm) */}
              {(layoutMode === "front" || layoutMode === "both") && (
                <div 
                  className="cr80-vertical-card bg-white rounded-[3.18mm] border border-stone-800 shadow-sm p-[2.5mm] flex flex-col justify-between items-center text-center relative overflow-hidden print:shadow-none print:border-stone-900"
                  style={{ width: "54mm", height: "85.6mm", boxSizing: "border-box" }}
                >
                  {/* Top Header */}
                  <div className="w-full border-b border-stone-900 pb-[1mm] flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <div className="w-[5mm] h-[5mm] rounded-[1mm] bg-stone-900 text-amber-400 flex items-center justify-center font-black text-[6pt]">
                        CBS
                      </div>
                      <h3 className="font-black text-[7pt] text-stone-900 uppercase tracking-tight">Crayon Box School</h3>
                    </div>
                    <span className="bg-purple-100 text-purple-900 font-bold px-[2mm] py-[0.2mm] rounded-[1mm] text-[4.5pt] uppercase tracking-wider mt-[0.3mm] border border-purple-200">
                      Authorized Escort Card • 2026-27
                    </span>
                  </div>

                  {/* Student Photo (Portrait Box) */}
                  <div className="w-[24mm] h-[28mm] rounded-[2mm] border-2 border-stone-900 overflow-hidden my-[1mm] bg-stone-100 flex items-center justify-center shrink-0 shadow-xs">
                    {item.photo_url ? (
                      <img src={item.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-[10mm] h-[10mm] text-stone-400" />
                    )}
                  </div>

                  {/* Student Info Details */}
                  <div className="w-full leading-tight space-y-[0.5mm]">
                    <h4 className="font-black text-[8.5pt] text-stone-900 uppercase truncate">
                      {item.first_name} {item.last_name || ''}
                    </h4>

                    <div className="flex justify-center items-center gap-[1mm] text-[5.2pt]">
                      <span className="bg-stone-100 text-stone-800 font-mono font-bold px-[1.5mm] py-[0.2mm] rounded border border-stone-300">
                        Adm: {cleanAdm}
                      </span>
                      <span className="bg-purple-50 text-purple-900 font-bold px-[1.5mm] py-[0.2mm] rounded border border-purple-200">
                        {item.class_name}-{item.section_name}
                      </span>
                    </div>

                    <p className="text-[4.8pt] font-bold text-purple-800 pt-[0.3mm]">
                      ✓ {escortsList.length} Authorized Escorts Registered
                    </p>
                  </div>

                  {/* Scannable High-Contrast Master QR Code */}
                  <div className="flex items-center justify-between w-full pt-[1mm] border-t border-stone-200">
                    <div className="text-left text-[4pt] text-stone-500 leading-none">
                      <p className="font-bold text-stone-700">Gate Clearance</p>
                      <p className="text-stone-400 mt-[0.3mm]">Valid: 31 Mar 2027</p>
                    </div>

                    <div className="w-[13mm] h-[13mm] bg-white border border-stone-800 rounded-[1mm] p-[0.5mm] shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0 0h30v30H0zm5 5v20h20V5zm5 5h10v10H10zM70 0h30v30H70zm5 5v20h20V5zm5 5h10v10H80zM0 70h30v30H0zm5 5v20h20V75zm5 5h10v10H10zM40 10h10v10H40zm10 20h10v10H50zm-10 20h20v10H40zm30 10h10v20H70zm10 10h10v10H80zm-40 10h20v10H40zm20 10h10v10H60zm20 0h10v10H80z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* BACK SIDE - ALL AUTHORIZED ESCORTS (54mm x 85.6mm) */}
              {(layoutMode === "back" || layoutMode === "both") && (
                <div 
                  className="cr80-vertical-card bg-white rounded-[3.18mm] border border-stone-800 shadow-sm p-[2mm] flex flex-col justify-between text-left relative overflow-hidden print:shadow-none print:border-stone-900"
                  style={{ width: "54mm", height: "85.6mm", boxSizing: "border-box" }}
                >
                  {/* Header */}
                  <div className="border-b border-stone-900 pb-[0.5mm] text-center">
                    <span className="font-black text-[5.8pt] text-stone-900 uppercase">
                      Authorized Escorts for {item.first_name}
                    </span>
                    <p className="text-[4pt] font-mono text-stone-400">{item.card_number}</p>
                  </div>

                  {/* Vertical Escort Roster (Stacked Roster of 4 Escorts) */}
                  <div className="space-y-[1mm] py-[0.5mm] flex-1">
                    {escortsList.slice(0, 4).map((esc: any, eIdx: number) => (
                      <div key={esc.id || eIdx} className="bg-stone-50 border border-stone-200 rounded-[1mm] p-[0.8mm] flex items-center gap-[1.2mm]">
                        <div className="w-[6mm] h-[8mm] rounded-[0.5mm] border border-stone-300 overflow-hidden shrink-0 bg-white flex items-center justify-center">
                          {esc.photo_url ? (
                            <img src={esc.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-[3mm] h-[3mm] text-stone-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 leading-none">
                          <p className="font-black text-[5.2pt] text-stone-900 truncate">{esc.full_name}</p>
                          <span className="text-[4.2pt] font-bold text-purple-700 bg-purple-50 px-1 py-0.1 rounded inline-block mt-[0.2mm]">
                            {esc.relationship}
                          </span>
                          <p className="text-[4pt] font-mono text-stone-500 truncate mt-[0.2mm]">{esc.mobile}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Security Terms & Signature */}
                  <div className="border-t border-stone-300 pt-[0.6mm] flex justify-between items-end text-[4pt] text-stone-500">
                    <div className="leading-none space-y-[0.3mm]">
                      <p className="font-bold text-stone-700">1. Released only to pictured persons.</p>
                      <p>2. Emergency: 1-day pass required.</p>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="w-[12mm] border-b border-stone-900 mb-[0.3mm]"></div>
                      <span className="font-bold text-stone-800 text-[3.8pt] block">Principal Sign</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Direct A4 Printing Style for Vertical 54mm x 85.6mm CR80 cards */}
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
            display: flex;
            flex-wrap: wrap;
            gap: 4mm;
            padding: 5mm;
          }
          .cr80-vertical-card {
            width: 54mm !important;
            height: 85.6mm !important;
            min-width: 54mm !important;
            max-width: 54mm !important;
            min-height: 85.6mm !important;
            max-height: 85.6mm !important;
            border-radius: 3.18mm !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

    </div>
  );
}
