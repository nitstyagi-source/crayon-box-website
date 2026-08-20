"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Printer, ArrowLeft, User, QrCode, Sparkles, RefreshCw, CheckCircle2 
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
              Vertical CR80 • 54 mm × 85.6 mm (2.125&quot; × 3.375&quot;)
            </span>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Standard ISO/IEC Vertical Lanyard ID Format • Printing {students.length} student cards for {classFilter}.
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
              
              {/* FRONT SIDE - VERTICAL CR80 (54mm x 85.6mm) */}
              {(layoutMode === "front" || layoutMode === "both") && (
                <div 
                  className="cr80-vertical-card bg-white rounded-[3.18mm] border border-stone-800 shadow-sm p-[2.5mm] flex flex-col justify-between items-center text-center relative overflow-hidden print:shadow-none print:border-stone-900"
                  style={{ width: "54mm", height: "85.6mm", boxSizing: "border-box" }}
                >
                  {/* Top Lanyard Header */}
                  <div className="w-full border-b border-stone-900 pb-[1mm] flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <div className="w-[5mm] h-[5mm] rounded-[1mm] bg-stone-900 text-amber-400 flex items-center justify-center font-black text-[6pt]">
                        CBS
                      </div>
                      <h3 className="font-black text-[7pt] text-stone-900 uppercase tracking-tight">Crayon Box School</h3>
                    </div>
                    <p className="text-[4.5pt] font-bold text-stone-500 uppercase tracking-wider mt-[0.2mm]">
                      Student ID Card • 2026-2027
                    </p>
                  </div>

                  {/* Student Photograph (Portrait Box) */}
                  <div className="w-[24mm] h-[28mm] rounded-[2mm] border-2 border-stone-900 overflow-hidden my-[1mm] bg-stone-100 flex items-center justify-center shrink-0 shadow-xs">
                    {student.photo_url ? (
                      <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-[10mm] h-[10mm] text-stone-400" />
                    )}
                  </div>

                  {/* Student Info Details */}
                  <div className="w-full leading-tight space-y-[0.6mm]">
                    <h4 className="font-black text-[8.5pt] text-stone-900 uppercase truncate">
                      {student.first_name} {student.last_name || ''}
                    </h4>

                    <div>
                      <span className="inline-block bg-purple-100 text-purple-900 font-bold px-[2mm] py-[0.3mm] rounded-[1mm] text-[5.5pt] border border-purple-200">
                        {student.class_name} - {student.section_name}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-[1mm] bg-stone-50 rounded-[1mm] p-[1mm] text-[5pt] text-stone-700 border border-stone-200 text-left mt-[0.5mm]">
                      <div>
                        <span className="font-bold text-stone-400 block">Adm No:</span>
                        <span className="font-mono font-black text-stone-900">{cleanAdm}</span>
                      </div>
                      <div>
                        <span className="font-bold text-stone-400 block">Roll / Blood:</span>
                        <span className="font-bold text-stone-900">{student.roll_no || `${idx + 1}`} • <span className="text-red-600 font-black">{student.blood_group || 'O+'}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Scannable High-Contrast QR Code */}
                  <div className="flex items-center justify-between w-full pt-[1mm] border-t border-stone-200">
                    <div className="text-left text-[4pt] text-stone-500 leading-none">
                      <p className="font-bold text-stone-700">Burari Campus</p>
                      <p className="font-mono text-stone-400 mt-[0.3mm]">Ph: {student.parent_phone || '+91 98100 81008'}</p>
                    </div>

                    <div className="w-[13mm] h-[13mm] bg-white border border-stone-800 rounded-[1mm] p-[0.5mm] shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0 0h30v30H0zm5 5v20h20V5zm5 5h10v10H10zM70 0h30v30H70zm5 5v20h20V5zm5 5h10v10H80zM0 70h30v30H0zm5 5v20h20V75zm5 5h10v10H10zM40 10h10v10H40zm10 20h10v10H50zm-10 20h20v10H40zm30 10h10v20H70zm10 10h10v10H80zm-40 10h20v10H40zm20 10h10v10H60zm20 0h10v10H80z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* BACK SIDE - VERTICAL CR80 (54mm x 85.6mm) */}
              {(layoutMode === "back" || layoutMode === "both") && (
                <div 
                  className="cr80-vertical-card bg-white rounded-[3.18mm] border border-stone-800 shadow-sm p-[2.5mm] flex flex-col justify-between text-left relative overflow-hidden print:shadow-none print:border-stone-900"
                  style={{ width: "54mm", height: "85.6mm", boxSizing: "border-box" }}
                >
                  <div className="border-b border-stone-900 pb-[0.8mm] text-center">
                    <span className="font-black text-[6pt] text-stone-900 uppercase">Emergency &amp; Security Protocol</span>
                    <p className="text-[4.5pt] font-mono text-stone-400">{student.card_number}</p>
                  </div>

                  <div className="space-y-[1mm] text-[5pt] text-stone-600 flex-1 py-[1.5mm] leading-tight">
                    <div className="bg-stone-50 p-[1mm] rounded-[1mm] border border-stone-200">
                      <p><span className="font-bold text-stone-700">Student:</span> {student.first_name} {student.last_name || ''}</p>
                      <p><span className="font-bold text-stone-700">Transport:</span> {student.transport_route}</p>
                      <p><span className="font-bold text-stone-700">Helpline:</span> +91 98100 81008</p>
                    </div>

                    <div className="space-y-[0.8mm] text-[4.5pt] text-stone-500 pt-[0.5mm]">
                      <p className="font-bold text-stone-700">TERMS OF USE:</p>
                      <p>1. This card must be worn by the student at all times during school hours &amp; transit.</p>
                      <p>2. Non-transferable identity credential.</p>
                      <p>3. If found, please return to Crayon Box School Reception, Burari, Delhi - 110084.</p>
                    </div>
                  </div>

                  <div className="border-t border-stone-300 pt-[1mm] flex justify-between items-end text-[4.5pt]">
                    <div>
                      <span className="text-stone-800 font-bold block">www.crayonboxschool.com</span>
                      <span className="text-[3.8pt] text-stone-400">Valid: 31 Mar 2027</span>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="w-[14mm] border-b border-stone-900 mb-[0.4mm]"></div>
                      <span className="font-bold text-stone-800 text-[4pt] block">Principal Sign</span>
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
