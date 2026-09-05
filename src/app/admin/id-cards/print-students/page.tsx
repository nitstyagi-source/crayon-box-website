"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Printer, ArrowLeft, RefreshCw 
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { getStudentsForIdCardGeneration, generateAllMissingIdCards } from "@/app/actions/id-cards";
import { StudentIDCard } from "@/components/id-cards/StudentIDCard";

export default function StudentIdCardBatchPrintPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-400 font-bold text-xs animate-pulse">Loading Printable Cards...</div>}>
      <StudentIdCardBatchPrintContent />
    </Suspense>
  );
}

function StudentIdCardBatchPrintContent() {
  const { activeCampusId } = useCampusContext();
  const { selectedInstitutionObj, currentInstitution } = useInstitution();
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
            Official Tri-color Ashoka Chakra and Navy &amp; Gold Student Credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerateAll}
            disabled={isGenerating}
            className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-700 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? "Generating..." : "Generate / Sync All Cards"}
          </button>

          {/* Layout Mode Switcher */}
          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setLayoutMode("front")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${layoutMode === "front" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"}`}
            >
              Fronts Only
            </button>
            <button
              onClick={() => setLayoutMode("back")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${layoutMode === "back" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"}`}
            >
              Backs Only
            </button>
            <button
              onClick={() => setLayoutMode("both")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${layoutMode === "both" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"}`}
            >
              Side-by-Side
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-stone-900 hover:bg-stone-800 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Print Sheet (A4)
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div id="printable-student-cards" className="flex flex-wrap gap-6 justify-center print:justify-start print:gap-4 print:p-0">
        {students.map((student) => (
          <div key={student.id} className="card-print-item print:break-inside-avoid print:page-break-inside-avoid">
            <StudentIDCard 
              student={student} 
              schoolInfo={selectedInstitutionObj} 
              layoutMode={layoutMode === "both" ? "DUAL" : layoutMode === "front" ? "FRONT_ONLY" : "BACK_ONLY"} 
            />
          </div>
        ))}
      </div>

      {/* Direct A4 Printing Style for Vertical 54mm x 85.6mm CR80 cards */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-student-cards, #printable-student-cards * {
            visibility: visible !important;
          }
          #printable-student-cards {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 5mm !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .card-print-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 5mm !important;
          }
        }
      `}</style>

    </div>
  );
}
