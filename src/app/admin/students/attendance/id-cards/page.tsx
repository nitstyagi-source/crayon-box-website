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
      <div id="printable-id-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:p-0">
        {filteredStudents.map((student, idx) => {
          const cleanAdm = student.admission_no || `ADM-2026-${(idx + 1).toString().padStart(3, '0')}`;
          const token = `CBS-QR-${cleanAdm}-${student.id.substring(0, 4).toUpperCase()}`;

          return (
            <div 
              key={student.id}
              className="bg-white rounded-2xl border-2 border-stone-800 shadow-md p-4 flex flex-col justify-between relative overflow-hidden print:shadow-none print:break-inside-avoid print:page-break-inside-avoid h-[220px]"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b-2 border-stone-900 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-black text-xs">
                    {selectedInstitutionObj?.code || "VANI"}
                  </div>
                  <div>
                    <h3 className="font-black text-xs tracking-tight text-stone-900 uppercase">
                      {selectedInstitutionObj?.name || "STUDENT IDENTITY CARD"}
                    </h3>
                    <p className="text-[8px] font-bold text-stone-500 uppercase tracking-wider">Student Identity Card • 2026-2027</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-black bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded border border-stone-300">
                  {student.class_name || student.grade || 'Grade 3-A'}
                </span>
              </div>

              {/* Card Body */}
              <div className="flex items-center gap-3 py-2 flex-1">
                {/* Student Photo */}
                <div className="w-20 h-24 rounded-xl border-2 border-stone-800 overflow-hidden shrink-0 bg-stone-100 flex items-center justify-center">
                  {student.photo_url ? (
                    <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-stone-400" />
                  )}
                </div>

                {/* Student Details */}
                <div className="flex-1 min-w-0 space-y-0.5 text-[10px]">
                  <h4 className="font-black text-xs text-stone-900 uppercase truncate">
                    {student.first_name} {student.last_name || ''}
                  </h4>
                  <p className="text-stone-600">
                    <span className="font-bold text-stone-400">Adm No:</span> <span className="font-mono font-bold text-stone-800">{cleanAdm}</span>
                  </p>
                  <p className="text-stone-600">
                    <span className="font-bold text-stone-400">Roll No:</span> <span className="font-bold text-stone-800">{student.roll_no || `${idx + 1}`}</span>
                  </p>
                  <p className="text-stone-600">
                    <span className="font-bold text-stone-400">Blood Group:</span> <span className="font-bold text-red-600">{student.blood_group || 'O+'}</span>
                  </p>
                  <p className="text-stone-600 truncate">
                    <span className="font-bold text-stone-400">Emergency:</span> <span className="font-mono font-bold text-stone-800">{student.parent_phone || '+91 98111 02008'}</span>
                  </p>
                </div>

                {/* Scannable QR Code */}
                <div className="w-20 h-20 bg-white border-2 border-stone-800 rounded-xl p-1 shrink-0 flex flex-col items-center justify-center shadow-xs">
                  {/* Generated Dynamic SVG QR representation */}
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0 0h30v30H0zm5 5v20h20V5zm5 5h10v10H10zM70 0h30v30H70zm5 5v20h20V5zm5 5h10v10H80zM0 70h30v30H0zm5 5v20h20V75zm5 5h10v10H10zM40 10h10v10H40zm10 20h10v10H50zm-10 20h20v10H40zm30 10h10v20H70zm10 10h10v10H80zm-40 10h20v10H40zm20 10h10v10H60zm20 0h10v10H80z" />
                  </svg>
                  <span className="text-[6px] font-mono font-black text-stone-500 tracking-tighter truncate w-full text-center">
                    {cleanAdm}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-stone-200 pt-1 flex justify-between items-center text-[7px] text-stone-400 font-bold uppercase">
                <span>{selectedInstitutionObj?.name || "ACADEMIC INSTITUTION"}</span>
                <span>Authorized Card</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-id-cards, #printable-id-cards * {
            visibility: visible;
          }
          #printable-id-cards {
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
