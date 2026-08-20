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
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <Link 
            href="/admin/id-cards"
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to ID Cards Hub
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Student-Wise Multi-Escort Cards</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            1 Escort Card per student containing all authorized pickup persons (Parents, Grandparents, Drivers, Nannies).
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

      {/* Printable Sheet Container */}
      <div id="printable-escort-cards" className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:p-0">
        {studentEscortCards.map((item, idx) => {
          const cleanAdm = item.admission_no || `CB10${(idx + 1).toString().padStart(2, '0')}`;
          const escortsList = item.escorts || [];

          return (
            <div key={item.id} className="space-y-4 print:break-inside-avoid print:page-break-inside-avoid">
              
              {/* FRONT SIDE: STUDENT PROFILE + GATE MASTER QR */}
              {(layoutMode === "front" || layoutMode === "both") && (
                <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-md p-4 flex flex-col justify-between h-[235px] relative overflow-hidden print:shadow-none">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b-2 border-stone-900 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                        CBS
                      </div>
                      <div>
                        <h3 className="font-black text-xs text-stone-900 uppercase tracking-tight">Crayon Box School</h3>
                        <p className="text-[8px] font-bold text-purple-700 uppercase tracking-wider">Student Escort &amp; Pickup Card • 2026-2027</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-black bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded border border-purple-300">
                      {item.class_name}-{item.section_name}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex items-center gap-3 py-1 flex-1">
                    {/* Student Photo */}
                    <div className="w-20 h-24 rounded-xl border-2 border-stone-800 overflow-hidden shrink-0 bg-stone-100 flex items-center justify-center">
                      {item.photo_url ? (
                        <img src={item.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-stone-400" />
                      )}
                    </div>

                    {/* Student Details */}
                    <div className="flex-1 min-w-0 space-y-0.5 text-[10px]">
                      <h4 className="font-black text-xs text-stone-900 uppercase truncate">
                        {item.first_name} {item.last_name || ''}
                      </h4>
                      <p className="text-stone-600">
                        <span className="font-bold text-stone-400">Adm No:</span> <span className="font-mono font-bold text-stone-900">{cleanAdm}</span>
                      </p>
                      <p className="text-stone-600">
                        <span className="font-bold text-stone-400">Roll No:</span> <span className="font-bold text-stone-800">{item.roll_no || `${idx + 1}`}</span>
                      </p>
                      <p className="text-stone-600">
                        <span className="font-bold text-stone-400">Blood Group:</span> <span className="font-bold text-red-600">{item.blood_group || 'O+'}</span>
                      </p>
                      <p className="text-stone-600 truncate">
                        <span className="font-bold text-stone-400">Primary Phone:</span> <span className="font-mono font-bold text-stone-800">{item.parent_phone || '+91 98100 81001'}</span>
                      </p>
                      <p className="text-[9px] text-purple-800 font-bold">
                        ✓ {escortsList.length} Authorized Escorts Registered (See Back)
                      </p>
                    </div>

                    {/* Master Security Scannable QR Code */}
                    <div className="w-20 h-20 bg-white border-2 border-stone-800 rounded-xl p-1 shrink-0 flex flex-col items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0 0h30v30H0zm5 5v20h20V5zm5 5h10v10H10zM70 0h30v30H70zm5 5v20h20V5zm5 5h10v10H80zM0 70h30v30H0zm5 5v20h20V75zm5 5h10v10H10zM40 10h10v10H40zm10 20h10v10H50zm-10 20h20v10H40zm30 10h10v20H70zm10 10h10v10H80zm-40 10h20v10H40zm20 10h10v10H60zm20 0h10v10H80z" />
                      </svg>
                      <span className="text-[6px] font-mono font-black text-stone-500 tracking-tighter truncate w-full text-center">
                        {cleanAdm}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-stone-200 pt-1 flex justify-between items-center text-[7px] text-stone-400 font-bold uppercase">
                    <span>Main Campus Gate Pickup</span>
                    <span>Valid Until: 31 Mar 2027</span>
                  </div>
                </div>
              )}

              {/* BACK SIDE: ALL AUTHORIZED PICKUP PERSONS GRID */}
              {(layoutMode === "back" || layoutMode === "both") && (
                <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-md p-3 flex flex-col justify-between h-[235px] relative overflow-hidden print:shadow-none">
                  {/* Header */}
                  <div className="border-b border-stone-300 pb-1 flex justify-between items-center">
                    <span className="font-black text-[9px] text-stone-900 uppercase">
                      Authorized Pickup Persons for {item.first_name}
                    </span>
                    <span className="font-mono text-[7px] text-stone-400">{item.card_number}</span>
                  </div>

                  {/* Multi-Escort Roster Grid (Up to 4 Authorized Persons) */}
                  <div className="grid grid-cols-2 gap-1.5 py-1 flex-1">
                    {escortsList.slice(0, 4).map((esc: any, eIdx: number) => (
                      <div key={esc.id || eIdx} className="bg-stone-50 border border-stone-200 rounded-lg p-1.5 flex items-center gap-2">
                        {/* Escort Photo */}
                        <div className="w-8 h-10 rounded border border-stone-300 overflow-hidden shrink-0 bg-white flex items-center justify-center">
                          {esc.photo_url ? (
                            <img src={esc.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-stone-400" />
                          )}
                        </div>

                        {/* Escort Details */}
                        <div className="min-w-0 flex-1 leading-tight">
                          <p className="font-black text-[9px] text-stone-900 truncate">{esc.full_name}</p>
                          <span className="text-[7px] font-bold text-purple-700 bg-purple-50 px-1 py-0.2 rounded inline-block">
                            {esc.relationship}
                          </span>
                          <p className="text-[7px] font-mono text-stone-500 truncate mt-0.5">{esc.mobile}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Security Terms & Signature */}
                  <div className="border-t border-stone-300 pt-1 flex justify-between items-end text-[7px] text-stone-500">
                    <div className="space-y-0.5 leading-none">
                      <p className="font-bold text-stone-700">1. Student will only be released to the persons pictured above.</p>
                      <p>2. In emergency, parent must issue a 1-day pass via school portal.</p>
                      <p className="font-mono text-[6px] text-stone-400">Emergency Helpline: +91 98100 81008</p>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="w-14 border-b border-stone-900 mb-0.5"></div>
                      <span className="font-bold text-stone-800 text-[6px] block">Principal</span>
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
