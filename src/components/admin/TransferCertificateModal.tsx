"use client";

import { useState, useRef } from "react";
import { Printer, Download, X, Edit3, Eye, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface TransferCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onLogTC?: (tcData: any) => Promise<void>;
}

export default function TransferCertificateModal({
  isOpen,
  onClose,
  student,
  onLogTC
}: TransferCertificateProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<"preview" | "edit">("preview");
  const [isLogging, setIsLogging] = useState(false);

  // Extract initial student data
  const father = student?.parents?.find((p: any) => p.parent_type === "Father");
  const mother = student?.parents?.find((p: any) => p.parent_type === "Mother");
  const currentAcademic = student?.academic?.find((a: any) => a.is_current_session) || student?.academic?.[0] || {};
  const firstAcademic = student?.academic?.[student?.academic?.length - 1] || currentAcademic;
  
  const totalInvoiced = student?.invoices?.reduce((acc: number, inv: any) => acc + Number(inv.total_amount || 0), 0) || 0;
  const totalPaid = student?.invoices?.reduce((acc: number, inv: any) => acc + Number(inv.amount_paid || 0), 0) || 0;
  const totalDues = Math.max(0, totalInvoiced - totalPaid);

  const admissionDateStr = student?.lifecycle?.find((l: any) => l.action_type === 'Admission')?.action_date || student?.created_at?.split('T')[0] || "2024-04-01";
  const todayStr = new Date().toISOString().split('T')[0];

  // Certificate Editable State
  const [tcData, setTcData] = useState({
    ref_no: `CBS/SLC/${new Date().getFullYear()}/${student?.admission_no?.replace(/\D/g, '') || Math.floor(100 + Math.random() * 900)}`,
    issue_date: todayStr,
    school_name_id: "CRAYON BOX SCHOOL (1253481)",
    udise_code: "07124100151",
    student_name: `${student?.first_name || ""} ${student?.middle_name || ""} ${student?.last_name || ""}`.trim().toUpperCase(),
    father_name: (father?.name || "").toUpperCase(),
    mother_name: (mother?.name || "").toUpperCase(),
    dob: student?.dob ? `${student.dob}` : "",
    admission_no_date: `${student?.admission_no || ""} & ${admissionDateStr}`,
    class_admitted: firstAcademic?.class_name || "Nursery",
    class_last_attended: `${currentAcademic?.class_name || "Grade 1"} - Section ${currentAcademic?.section_name || "A"}`,
    pen_no: student?.pen_no || "N/A",
    withdrawal_date: todayStr,
    date_slc_issue: todayStr,
    dues_paid: totalDues <= 0 ? "Yes (All Dues Cleared)" : "No (Pending Dues)",
    last_session_class: `2026-2027 (${currentAcademic?.class_name || "Grade 1"})`,
    total_attendance: "210 Days",
    student_attendance: "198 Days",
    result: "Passed and Promoted to Next Class",
    checked_by: "Administrative Staff",
    admission_incharge: "Admission In-Charge",
    principal: "Principal",
    reason_for_leaving: "Relocation / Parent Request"
  });

  if (!isOpen) return null;

  const handlePrint = async () => {
    if (onLogTC) {
      setIsLogging(true);
      await onLogTC(tcData);
      setIsLogging(false);
    }
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:h-auto print:border-none print:shadow-none print:w-full print:rounded-none">
        
        {/* Modal Top Action Bar (Hidden during Print) */}
        <div className="bg-stone-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">School Leaving Certificate (SLC / TC)</h3>
              <p className="text-xs text-stone-400">Official Directorate of Education Compliant Certificate</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView(activeView === "preview" ? "edit" : "preview")}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-stone-700"
            >
              {activeView === "preview" ? (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Edit Details
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-blue-400" /> View Preview
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              disabled={isLogging}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> {isLogging ? "Preparing..." : "Print / Download PDF"}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-stone-100/60 print:bg-white print:p-0 print:overflow-visible">
          
          {/* EDIT FORM VIEW */}
          {activeView === "edit" && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 print:hidden">
              <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                <h4 className="font-bold text-stone-900 text-sm">Customize Certificate Fields</h4>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Live Synced</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Ref Number</label>
                  <input
                    type="text"
                    value={tcData.ref_no}
                    onChange={(e) => setTcData({ ...tcData, ref_no: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Date of Issue</label>
                  <input
                    type="date"
                    value={tcData.issue_date}
                    onChange={(e) => setTcData({ ...tcData, issue_date: e.target.value, date_slc_issue: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Student Name</label>
                  <input
                    type="text"
                    value={tcData.student_name}
                    onChange={(e) => setTcData({ ...tcData, student_name: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">PEN (Permanent Education No.)</label>
                  <input
                    type="text"
                    value={tcData.pen_no}
                    onChange={(e) => setTcData({ ...tcData, pen_no: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs font-mono font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Father Name</label>
                  <input
                    type="text"
                    value={tcData.father_name}
                    onChange={(e) => setTcData({ ...tcData, father_name: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Mother Name</label>
                  <input
                    type="text"
                    value={tcData.mother_name}
                    onChange={(e) => setTcData({ ...tcData, mother_name: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={tcData.dob}
                    onChange={(e) => setTcData({ ...tcData, dob: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Admission No. & Date</label>
                  <input
                    type="text"
                    value={tcData.admission_no_date}
                    onChange={(e) => setTcData({ ...tcData, admission_no_date: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Class in which Admitted</label>
                  <input
                    type="text"
                    value={tcData.class_admitted}
                    onChange={(e) => setTcData({ ...tcData, class_admitted: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Class & Section Last Attended</label>
                  <input
                    type="text"
                    value={tcData.class_last_attended}
                    onChange={(e) => setTcData({ ...tcData, class_last_attended: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">All Dues Paid Status</label>
                  <input
                    type="text"
                    value={tcData.dues_paid}
                    onChange={(e) => setTcData({ ...tcData, dues_paid: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Total Attendance</label>
                  <input
                    type="text"
                    value={tcData.total_attendance}
                    onChange={(e) => setTcData({ ...tcData, total_attendance: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Student Attendance</label>
                  <input
                    type="text"
                    value={tcData.student_attendance}
                    onChange={(e) => setTcData({ ...tcData, student_attendance: e.target.value })}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Result & Promotion Remark</label>
                <input
                  type="text"
                  value={tcData.result}
                  onChange={(e) => setTcData({ ...tcData, result: e.target.value })}
                  className="w-full border border-stone-200 p-2 rounded-xl text-xs font-bold text-stone-800"
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className="w-full py-3 bg-stone-900 text-white font-bold text-xs rounded-xl shadow-md hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Apply & Return to Preview
              </button>
            </div>
          )}

          {/* OFFICIAL CERTIFICATE A4 CANVAS */}
          <div
            ref={printRef}
            className={`mx-auto bg-white shadow-xl border border-stone-200 text-slate-900 p-8 sm:p-12 relative flex flex-col justify-between print:shadow-none print:border-none print:p-8 print:m-0 print:w-full print:h-[100vh] ${
              activeView === "edit" ? "hidden" : "block"
            }`}
            style={{ width: "100%", maxWidth: "800px", minHeight: "1050px" }}
          >
            
            {/* Top Certificate Content */}
            <div>
              {/* Official Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4">
                <div className="flex items-center gap-4">
                  {/* School Logo */}
                  <div className="w-16 h-16 relative shrink-0">
                    <Image
                      src="/logo-transparent.png"
                      alt="Crayon Box School Logo"
                      width={64}
                      height={64}
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-slate-900 uppercase font-sans">
                      C R A Y O N &nbsp; B O X
                    </h1>
                    <p className="text-sm font-bold tracking-[0.25em] text-slate-700 uppercase -mt-0.5">
                      S C H O O L
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="bg-slate-900 text-white text-[9px] font-black tracking-widest px-3 py-1 uppercase rounded-sm mb-1 inline-block">
                    MANAGED BY VANI EDUCATIONAL TRUST
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 tracking-wider uppercase">
                    RECOGNISED BY DIRECTORATE OF EDUCATION
                  </span>
                </div>
              </div>

              {/* Reference & Date Bar */}
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-4 px-1">
                <div>
                  REF NO. <span className="font-mono underline underline-offset-4 font-black">{tcData.ref_no}</span>
                </div>
                <div>
                  DATE <span className="font-mono underline underline-offset-4 font-black">{tcData.issue_date}</span>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center my-5">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 border-b-2 border-t-2 border-slate-900 py-1.5 inline-block px-8">
                  SCHOOL LEAVING CERTIFICATE
                </h2>
              </div>

              {/* 17 Form Fields */}
              <div className="space-y-2.5 text-xs sm:text-[13px] leading-relaxed text-slate-900 mt-6 font-medium">
                
                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">1. Name of School & I.D:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 text-slate-900">{tcData.school_name_id}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">2. UDISE Code of School:</span>
                  <span className="font-black font-mono flex-1 border-b border-dotted border-slate-400 pb-0.5 text-slate-900">{tcData.udise_code}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">3. Name of Student:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 uppercase text-slate-900">{tcData.student_name}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">4. Father Name:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 uppercase text-slate-900">{tcData.father_name || "—"}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">5. Mother Name:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 uppercase text-slate-900">{tcData.mother_name || "—"}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">6. Date Of Birth:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 font-mono text-slate-900">{tcData.dob || "—"}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">7. Admission No. & Date:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 font-mono text-slate-900">{tcData.admission_no_date}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">8. Class in which admitted:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 text-slate-900">{tcData.class_admitted}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">9. Class & Section last attended:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 text-slate-900">{tcData.class_last_attended}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">10. Permanent Education Number (PEN):</span>
                  <span className="font-black font-mono flex-1 border-b border-dotted border-slate-400 pb-0.5 text-blue-900">{tcData.pen_no}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">11. Date of withdrawal of admission:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 font-mono text-slate-900">{tcData.withdrawal_date}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">12. Date of SLC issue:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 font-mono text-slate-900">{tcData.date_slc_issue}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">13. Whether he or she has paid all dues of the school (Yes/No):</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 text-slate-900">{tcData.dues_paid}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">14. Last attended academic session and class:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 text-slate-900">{tcData.last_session_class}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">15. Total Attendance during session:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 text-slate-900">{tcData.total_attendance}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">16. Student Attendance during session:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 text-slate-900">{tcData.student_attendance}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold w-[48%] shrink-0">17. Result:</span>
                  <span className="font-black flex-1 border-b border-dotted border-slate-400 pb-0.5 text-slate-900">{tcData.result}</span>
                </div>

              </div>

              {/* Signatures Row */}
              <div className="mt-14 pt-4 flex justify-between items-end text-xs font-bold text-slate-900">
                <div className="space-y-12">
                  <p>Checked By: <span className="font-normal font-serif italic text-slate-700">...............................</span></p>
                  <div>
                    <div className="w-36 border-t-2 border-slate-900 mb-1"></div>
                    <p className="font-black uppercase tracking-wider text-[11px]">{tcData.admission_incharge}</p>
                  </div>
                </div>

                <div className="text-right space-y-12">
                  <div className="h-6"></div>
                  <div>
                    <div className="w-36 border-t-2 border-slate-900 mb-1 ml-auto"></div>
                    <p className="font-black uppercase tracking-wider text-[11px]">{tcData.principal}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Official School Footer */}
            <div className="mt-8 pt-4 border-t-2 border-slate-900 text-[10px] text-slate-800 flex justify-between items-end relative">
              
              {/* Left Contact */}
              <div className="space-y-0.5 font-medium">
                <p><span className="font-bold">Tel.</span> +91 9811102008</p>
                <p>info@crayonboxpreschool.in</p>
                <p className="text-blue-700 font-bold">www.crayonboxpreschool.in</p>
              </div>

              {/* Right Address */}
              <div className="text-right space-y-0.5 font-medium">
                <p className="font-bold">Kh. No. 6/20, D-Block, Shastri</p>
                <p>Park Ext. Burari, Delhi-110084</p>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer (Hidden during Print) */}
        <div className="p-4 bg-white border-t border-stone-200 flex justify-between items-center print:hidden">
          <p className="text-xs text-stone-500 font-medium">
            Permanent record will be updated to <strong className="text-stone-800">TC Issued</strong> upon printing.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 font-bold text-stone-600 text-xs hover:bg-stone-100 rounded-xl"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              disabled={isLogging}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> {isLogging ? "Processing..." : "Print Certificate"}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
