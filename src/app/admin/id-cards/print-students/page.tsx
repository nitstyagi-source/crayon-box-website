"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Printer, ArrowLeft, User, QrCode, Sparkles, RefreshCw, 
  Shield, Phone, Heart, Bus, CheckCircle2, Award
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getStudentsForIdCardGeneration, generateAllMissingIdCards } from "@/app/actions/id-cards";

export default function StudentIdCardBatchPrintPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-400 font-bold text-xs animate-pulse">Loading Printable Cards...</div>}>
      <StudentIdCardBatchPrintContent />
    </Suspense>
  );
}

function StudentIdCardBatchPrintContent() {
  const { activeCampusId } = useCampusContext();
  const searchParams = useSearchParams();
  const classFilter = searchParams.get("class") || "All Classes";

  const [students, setStudents] = useState<any[]>([]);
  const [layoutMode, setLayoutMode] = useState<"both" | "front" | "back">("both");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadCards();
  }, [activeCampusId, classFilter]);

  async function loadCards() {
    setIsLoading(true);
    const res = await getStudentsForIdCardGeneration(activeCampusId);
    if (res.success && res.data) {
      let list = res.data;
      if (classFilter !== "All Classes") {
        list = list.filter((s: any) => s.class_name === classFilter);
      }
      setStudents(list);
    }
    setIsLoading(false);
  }

  async function handleGenerateAll() {
    setIsGenerating(true);
    const res = await generateAllMissingIdCards();
    if (res.success) {
      alert(res.message);
      await loadCards();
    } else {
      alert("Error: " + res.error);
    }
    setIsGenerating(false);
  }

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
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Print Batch: Student ID Cards</h1>
            <span className="bg-amber-100 text-amber-900 font-mono text-[11px] font-black px-2.5 py-0.5 rounded-md">
              Premium Vertical CR80 • 54 mm × 85.6 mm
            </span>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            High-Definition Vertical Identity Card with Gold Crest, Photo Frame, and Security QR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerateAll}
            disabled={isGenerating}
            className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-700 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? "Generating..." : "Generate / Sync All Cards"}
          </button>

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

      {/* Printable Sheet Container - Vertical Portrait (54mm x 85.6mm) */}
      <div id="printable-student-cards" className="flex flex-wrap gap-4 justify-center print:justify-start print:gap-3 print:p-0">
        {students.map((student, idx) => {
          const cleanAdm = student.admission_no || `CB10${(idx + 1).toString().padStart(2, '0')}`;

          return (
            <div key={student.id} className="flex flex-wrap gap-3 print:gap-2 print:break-inside-avoid print:page-break-inside-avoid">
              
              {/* FRONT SIDE - PREMIUM VERTICAL CR80 (54mm x 85.6mm) */}
              {(layoutMode === "front" || layoutMode === "both") && (
                <div 
                  className="cr80-vertical-card bg-white rounded-[3.18mm] border border-stone-800 shadow-md flex flex-col justify-between items-center text-center relative overflow-hidden print:shadow-none print:border-stone-900"
                  style={{ width: "54mm", height: "85.6mm", boxSizing: "border-box" }}
                >
                  {/* Decorative Background Pattern */}
                  <div className="absolute inset-0 bg-radial-[at_50%_0%] from-amber-500/5 via-transparent to-purple-900/5 pointer-events-none"></div>

                  {/* Top Premium Navy & Gold Header */}
                  <div className="w-full bg-linear-to-r from-stone-900 via-indigo-950 to-stone-900 text-white px-[2mm] pt-[2mm] pb-[1.5mm] relative shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-[5.5mm] h-[5.5mm] rounded-[1mm] bg-linear-to-br from-amber-300 via-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-black text-[6pt] shadow-xs shrink-0">
                          CBS
                        </div>
                        <div className="text-left leading-none">
                          <h3 className="font-black text-[6.8pt] text-white uppercase tracking-tight">Crayon Box</h3>
                          <p className="text-[4.2pt] text-amber-300 font-bold uppercase tracking-wider">School • Delhi</p>
                        </div>
                      </div>
                      <span className="bg-amber-400 text-stone-950 font-black text-[4.5pt] px-[1.5mm] py-[0.3mm] rounded-full uppercase tracking-tight shadow-xs">
                        2026-27
                      </span>
                    </div>

                    {/* Gold Hairline Divider */}
                    <div className="w-full h-[0.4mm] bg-linear-to-r from-amber-400/20 via-amber-400 to-amber-400/20 mt-[1mm]"></div>
                  </div>

                  {/* Student Photograph Frame */}
                  <div className="my-[1mm] relative shrink-0">
                    <div className="w-[24mm] h-[28mm] rounded-[2mm] border-2 border-stone-900 overflow-hidden bg-stone-100 flex items-center justify-center shadow-xs">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-[10mm] h-[10mm] text-stone-400" />
                      )}
                    </div>
                    {/* Student Status Badge */}
                    <div className="absolute -bottom-[1mm] inset-x-0 flex justify-center">
                      <span className="bg-stone-900 text-amber-300 font-bold text-[4.5pt] px-[2mm] py-[0.2mm] rounded-full uppercase tracking-wider border border-amber-400/50 shadow-xs">
                        STUDENT
                      </span>
                    </div>
                  </div>

                  {/* Student Info Details */}
                  <div className="w-full px-[2mm] leading-tight space-y-[0.6mm]">
                    <h4 className="font-black text-[8.5pt] text-stone-900 uppercase truncate tracking-tight">
                      {student.first_name} {student.last_name || ''}
                    </h4>

                    <div>
                      <span className="inline-block bg-indigo-50 text-indigo-950 font-black px-[2.5mm] py-[0.4mm] rounded-[1mm] text-[5.5pt] border border-indigo-200 uppercase tracking-wide">
                        {student.class_name} • SEC {student.section_name}
                      </span>
                    </div>

                    {/* 2-Column Info Grid */}
                    <div className="grid grid-cols-2 gap-[1mm] bg-stone-50/90 rounded-[1.2mm] p-[1.2mm] text-[5pt] text-stone-700 border border-stone-200 text-left mt-[0.6mm]">
                      <div>
                        <span className="font-bold text-stone-400 block text-[4.2pt]">ADMISSION NO</span>
                        <span className="font-mono font-black text-stone-900">{cleanAdm}</span>
                      </div>
                      <div>
                        <span className="font-bold text-stone-400 block text-[4.2pt]">ROLL / BLOOD</span>
                        <span className="font-bold text-stone-900">
                          #{student.roll_no || `${idx + 1}`} • <span className="text-red-600 font-black">{student.blood_group || 'O+'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Security QR Code & Footer */}
                  <div className="w-full px-[2mm] pb-[1.5mm] pt-[1mm] flex items-center justify-between border-t border-stone-200 shrink-0 bg-stone-50/50">
                    <div className="text-left text-[4pt] text-stone-500 leading-tight">
                      <p className="font-black text-stone-800 uppercase tracking-tighter">Main Campus</p>
                      <p className="font-mono text-stone-500">Ph: {student.parent_phone || '+91 98100 81008'}</p>
                      <span className="text-emerald-700 font-bold text-[3.8pt]">✓ Gate Verified</span>
                    </div>

                    <div className="w-[12mm] h-[12mm] bg-white border border-stone-800 rounded-[1mm] p-[0.6mm] shrink-0 flex items-center justify-center shadow-xs">
                      <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0 0h30v30H0zm5 5v20h20V5zm5 5h10v10H10zM70 0h30v30H70zm5 5v20h20V5zm5 5h10v10H80zM0 70h30v30H0zm5 5v20h20V75zm5 5h10v10H10zM40 10h10v10H40zm10 20h10v10H50zm-10 20h20v10H40zm30 10h10v20H70zm10 10h10v10H80zm-40 10h20v10H40zm20 10h10v10H60zm20 0h10v10H80z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* BACK SIDE - PREMIUM VERTICAL CR80 (54mm x 85.6mm) */}
              {(layoutMode === "back" || layoutMode === "both") && (
                <div 
                  className="cr80-vertical-card bg-white rounded-[3.18mm] border border-stone-800 shadow-md p-[2.5mm] flex flex-col justify-between text-left relative overflow-hidden print:shadow-none print:border-stone-900"
                  style={{ width: "54mm", height: "85.6mm", boxSizing: "border-box" }}
                >
                  {/* Top Header */}
                  <div className="border-b border-stone-900 pb-[1mm] text-center">
                    <span className="font-black text-[6.2pt] text-stone-900 uppercase tracking-tight">Emergency &amp; Security Protocol</span>
                    <p className="text-[4.5pt] font-mono text-purple-800 font-bold">{student.card_number}</p>
                  </div>

                  {/* Info Box */}
                  <div className="space-y-[1.2mm] text-[5pt] text-stone-600 flex-1 py-[1.5mm] leading-tight">
                    <div className="bg-stone-50 p-[1.5mm] rounded-[1.2mm] border border-stone-200 space-y-[0.6mm]">
                      <p><span className="font-bold text-stone-400">STUDENT:</span> <span className="font-black text-stone-900">{student.first_name} {student.last_name || ''}</span></p>
                      <p><span className="font-bold text-stone-400">TRANSPORT:</span> <span className="font-bold text-stone-800">{student.transport_route}</span></p>
                      <p><span className="font-bold text-stone-400">HELPLINE:</span> <span className="font-mono font-bold text-stone-900">+91 98100 81008</span></p>
                    </div>

                    <div className="space-y-[0.8mm] text-[4.5pt] text-stone-500 pt-[0.5mm]">
                      <p className="font-black text-stone-800 uppercase tracking-tight">CARD REGULATIONS:</p>
                      <p>1. This credential is the property of Crayon Box School and must be worn daily.</p>
                      <p>2. Non-transferable security token.</p>
                      <p>3. If found, please return to Crayon Box School, Burari, Delhi - 110084.</p>
                    </div>
                  </div>

                  {/* Signature & Seal Footer */}
                  <div className="border-t border-stone-300 pt-[1.2mm] flex justify-between items-end text-[4.5pt] shrink-0">
                    <div>
                      <span className="text-stone-900 font-black block">www.crayonboxschool.com</span>
                      <span className="text-[3.8pt] text-stone-400">Valid Until: 31 Mar 2027</span>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="w-[14mm] border-b border-stone-900 mb-[0.5mm]"></div>
                      <span className="font-bold text-stone-800 text-[4.2pt] block uppercase">Principal</span>
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
          #printable-student-cards, #printable-student-cards * {
            visibility: visible;
          }
          #printable-student-cards {
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
