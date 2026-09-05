"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Printer, ArrowLeft, Download, Filter, Search, 
  QrCode, ShieldCheck, Sparkles, Building2, User
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { getStudents } from "@/app/actions/students";
import { StudentIDCard } from "@/components/id-cards/StudentIDCard";

export default function StudentIdCardsPage() {
  const { activeCampusId } = useCampusContext();
  const { selectedInstitutionObj } = useInstitution();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("All");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getStudents(activeCampusId);
      if (res.success && res.data) {
        setStudents(res.data);
      }
      setIsLoading(false);
    }
    load();
  }, [activeCampusId]);

  const filteredStudents = students.filter(s => {
    if (selectedClass === "All") return true;
    return s.class_name === selectedClass || s.grade === selectedClass;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Top Header - Hidden on Print */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <Link 
            href="/admin/students/attendance"
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Attendance Hub
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Printable Student QR ID Cards</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">Batch printable high-contrast QR identity cards ready for direct laminating.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="bg-stone-50 border border-stone-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-800"
          >
            <option value="All">All Classes ({students.length})</option>
            <option value="Pre-Nursery">Pre-Nursery</option>
            <option value="Nursery">Nursery</option>
            <option value="Kindergarten">Kindergarten</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
            <option value="Grade 4">Grade 4</option>
            <option value="Grade 5">Grade 5</option>
          </select>

          <button
            onClick={() => window.print()}
            className="bg-stone-900 hover:bg-stone-800 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Print Cards (A4 Batch)
          </button>
        </div>
      </div>

      {/* ID Cards Printable Grid Container */}
      <div id="printable-id-cards" className="flex flex-wrap gap-6 justify-center print:justify-start print:gap-4 print:p-0">
        {filteredStudents.map((student) => (
          <div 
            key={student.id}
            className="card-print-item print:break-inside-avoid print:page-break-inside-avoid"
          >
            <StudentIDCard
              student={student}
              schoolInfo={selectedInstitutionObj}
              layoutMode="FRONT_ONLY"
            />
          </div>
        ))}
      </div>

      {/* Print Specific CSS */}
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
          #printable-id-cards, #printable-id-cards * {
            visibility: visible !important;
          }
          #printable-id-cards {
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
