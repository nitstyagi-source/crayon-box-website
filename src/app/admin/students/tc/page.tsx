"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  QrCode,
  Building2,
  Award,
  Users
} from "lucide-react";
import {
  generateTransferCertificateAction,
  getTransferCertificatesListAction,
  TcRecord
} from "@/app/actions/tc-generator-actions";
import { StudentSuiteTabs } from "@/components/students/StudentSuiteTabs";
import { VastuMandalaWatermark } from "@/components/common/VastuMandalaWatermark";
import { StudentQRCode } from "@/components/id-cards/StudentQRCode";
import { useInstitution } from "@/components/providers/InstitutionContext";

export default function TransferCertificateStudioPage() {
  const { selectedInstitutionObj } = useInstitution();
  const [certificates, setCertificates] = useState<TcRecord[]>([]);
  const [selectedTc, setSelectedTc] = useState<TcRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [studentName, setStudentName] = useState("Rohan Singhal");
  const [admissionNo, setAdmissionNo] = useState("ADM-2024-0089");
  const [fatherName, setFatherName] = useState("Mr. Vikram Singhal");
  const [motherName, setMotherName] = useState("Mrs. Anita Singhal");
  const [dob, setDob] = useState("2014-08-15");
  const [admissionDate, setAdmissionDate] = useState("2024-04-01");
  const [classLastAttended, setClassLastAttended] = useState("Class 6-A");
  const [reasonForLeaving, setReasonForLeaving] = useState("Parents relocated to Bangalore for corporate transfer.");
  const [annualResult, setAnnualResult] = useState("Promoted to Class 7 (Passed Term 2 Examinations)");

  useEffect(() => {
    loadCertificates();
  }, []);

  async function loadCertificates() {
    setIsLoading(true);
    try {
      const res = await getTransferCertificatesListAction();
      if (res.success) {
        setCertificates(res.certificates);
        if (res.certificates.length > 0 && !selectedTc) {
          setSelectedTc(res.certificates[0]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateTc(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await generateTransferCertificateAction({
        studentName,
        admissionNo,
        fatherName,
        motherName,
        dob,
        admissionDate,
        classLastAttended,
        reasonForLeaving,
        annualResult
      });

      if (res.success) {
        alert(res.message);
        loadCertificates();
        setSelectedTc(res.tc);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-[#FDFBF7] min-h-screen text-stone-900">
      
      {/* Top Banner (Option 6 Sattva-Digital) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-white p-6 sm:p-8 rounded-3xl shadow-xl border-b-2 border-[#D4AF37]/40 print:hidden relative overflow-hidden">
        <VastuMandalaWatermark className="top-1/2 right-10 -translate-y-1/2 pointer-events-none" size={300} opacity={0.06} />
        
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Official School Transfer Certificate &amp; Leaving Dossier
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-amber-400" />
            Transfer Certificate (TC) Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
            Issue tamper-proof CBSE-compliant School Transfer Certificates with anti-forgery front QR verification codes.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer shrink-0 z-10"
        >
          <Printer className="w-4 h-4" /> Print Official A4 Certificate
        </button>
      </div>

      {/* Persistent Lifecycle Master Navigation Tabs */}
      <div className="print:hidden">
        <StudentSuiteTabs
          activeTab="TC"
          counts={{
            issuedTc: certificates.length
          }}
        />
      </div>

      {/* Main Form & Printable Document Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Issue Form (Hidden during print) */}
        <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-5 print:hidden">
          <div>
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Transfer Certificate Issue Desk
            </h3>
            <p className="text-xs text-stone-500">Official student leaving record</p>
          </div>

          <form onSubmit={handleGenerateTc} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="e.g. Rohan Singhal"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DFC8] bg-white font-bold text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Admission No. *</label>
                <input
                  type="text"
                  required
                  value={admissionNo}
                  onChange={e => setAdmissionNo(e.target.value)}
                  placeholder="ADM-2024-0089"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DFC8] bg-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Class Last Attended *</label>
                <input
                  type="text"
                  required
                  value={classLastAttended}
                  onChange={e => setClassLastAttended(e.target.value)}
                  placeholder="Class 6-A"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DFC8] bg-white font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Father's Name *</label>
                <input
                  type="text"
                  required
                  value={fatherName}
                  onChange={e => setFatherName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DFC8] bg-white font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Mother's Name *</label>
                <input
                  type="text"
                  required
                  value={motherName}
                  onChange={e => setMotherName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DFC8] bg-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DFC8] bg-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Admission Date</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={e => setAdmissionDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DFC8] bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Reason for Leaving School *</label>
              <select
                value={reasonForLeaving}
                onChange={e => setReasonForLeaving(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DFC8] bg-white font-medium"
              >
                <option value="Parent Relocation / Job Transfer">Parent Relocation / Job Transfer</option>
                <option value="Admission to Higher Senior Secondary Institution">Admission to Higher Senior Secondary Institution</option>
                <option value="Personal / Family Reasons">Personal / Family Reasons</option>
                <option value="Completed Highest Class Available">Completed Highest Class Available</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Academic Result Status</label>
              <input
                type="text"
                value={annualResult}
                onChange={e => setAnnualResult(e.target.value)}
                placeholder="Promoted to Higher Class (Passed)"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DFC8] bg-white font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-[#0B1B30] hover:bg-[#153257] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              Generate Official Certificate
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Official A4 Document Preview */}
        <div className="lg:col-span-2 space-y-4">
          {(() => {
            const activeTc = selectedTc || {
              id: 'tc-preview',
              tc_number: 'CBS/TC/2026/0412',
              admission_no: admissionNo || 'ADM-2024-0089',
              student_name: studentName || 'Rohan Singhal',
              father_name: fatherName || 'Mr. Vikram Singhal',
              mother_name: motherName || 'Mrs. Anita Singhal',
              dob: dob || '2014-08-15',
              admission_date: admissionDate || '2024-04-01',
              class_last_attended: classLastAttended || 'Class 6-A',
              section_last_attended: 'A',
              reason_for_leaving: reasonForLeaving || 'Parent Relocation / Job Transfer',
              annual_result: annualResult || 'Promoted to Higher Class (Passed)',
              withdrawal_date: new Date().toISOString(),
              issue_date: new Date().toISOString(),
              dues_paid: true,
              status: 'ISSUED',
              created_at: new Date().toISOString(),
            };

            return (
              <div className="bg-[#FDFBF7] p-8 sm:p-12 rounded-3xl border-4 border-[#0B1B30] shadow-2xl space-y-6 text-stone-900 print:shadow-none print:border-4 print:p-8 relative overflow-hidden">
                <VastuMandalaWatermark className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" size={460} opacity={0.05} />
                
                {/* Official Header */}
                <div className="text-center space-y-1 border-b-2 border-stone-900 pb-4 relative z-10">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-stone-600">
                    Recognized &amp; Registered Educational Institution, Delhi NCR
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0B1B30] tracking-tight uppercase">
                    {selectedInstitutionObj?.name || "OFFICIAL EDUCATIONAL INSTITUTION"}
                  </h2>
                  <div className="text-xs text-stone-600 font-medium">
                    {selectedInstitutionObj?.address || "Recognized Campus, Delhi NCR"} | Affiliation: {selectedInstitutionObj?.affiliationNumber || "CBSE/AFF"}
                  </div>
                  <div className="flex justify-center gap-6 text-[10px] font-mono text-stone-700 pt-1 font-bold">
                    <span>Registration No: 2730588</span>
                    <span>School Code: 25189</span>
                    <span>UDISE No: 07010101802</span>
                  </div>
                </div>

                {/* Certificate Title & Serial */}
                <div className="flex justify-between items-center border-b border-[#E8DFC8] pb-2 text-xs relative z-10">
                  <div className="font-mono font-black text-amber-900">
                    Certificate No: {activeTc.tc_number}
                  </div>
                  <div className="px-4 py-1 bg-amber-100 border border-amber-300 rounded-full font-black text-amber-950 text-[11px] tracking-wide uppercase shadow-2xs">
                    TRANSFER CERTIFICATE
                  </div>
                  <div className="font-mono font-bold text-stone-600">
                    Admission No: {activeTc.admission_no}
                  </div>
                </div>

                {/* 12-Point CBSE Official Schedule Table */}
                <div className="space-y-2.5 text-xs text-stone-800 relative z-10">
                  <div className="grid grid-cols-12 border-b border-stone-200/80 pb-1.5">
                    <span className="col-span-6 font-bold">1. Name of the Pupil:</span>
                    <span className="col-span-6 font-black text-[#0B1B30] uppercase">{activeTc.student_name}</span>
                  </div>
                  <div className="grid grid-cols-12 border-b border-stone-200/80 pb-1.5">
                    <span className="col-span-6 font-bold">2. Father's / Guardian's Name:</span>
                    <span className="col-span-6 font-semibold">{activeTc.father_name}</span>
                  </div>
                  <div className="grid grid-cols-12 border-b border-stone-200/80 pb-1.5">
                    <span className="col-span-6 font-bold">3. Mother's Name:</span>
                    <span className="col-span-6 font-semibold">{activeTc.mother_name}</span>
                  </div>
                  <div className="grid grid-cols-12 border-b border-stone-200/80 pb-1.5">
                    <span className="col-span-6 font-bold">4. Nationality:</span>
                    <span className="col-span-6">Indian</span>
                  </div>
                  <div className="grid grid-cols-12 border-b border-stone-200/80 pb-1.5">
                    <span className="col-span-6 font-bold">5. Date of Birth (in figures):</span>
                    <span className="col-span-6 font-mono font-bold">{new Date(activeTc.dob).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="grid grid-cols-12 border-b border-stone-200/80 pb-1.5">
                    <span className="col-span-6 font-bold">6. Date of First Admission in School:</span>
                    <span className="col-span-6 font-mono">{new Date(activeTc.admission_date).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="grid grid-cols-12 border-b border-stone-200/80 pb-1.5">
                    <span className="col-span-6 font-bold">7. Class in which pupil last studied:</span>
                    <span className="col-span-6 font-black text-[#0B1B30]">{activeTc.class_last_attended}</span>
                  </div>
                  <div className="grid grid-cols-12 border-b border-stone-200/80 pb-1.5">
                    <span className="col-span-6 font-bold">8. School / Board Annual Examination Result:</span>
                    <span className="col-span-6 font-semibold text-[#15803D]">{activeTc.annual_result || "Passed"}</span>
                  </div>
                  <div className="grid grid-cols-12 border-b border-stone-200/80 pb-1.5">
                    <span className="col-span-6 font-bold">9. Month upto which school dues paid:</span>
                    <span className="col-span-6 font-bold text-[#15803D]">All Dues Fully Cleared (Nil)</span>
                  </div>
                  <div className="grid grid-cols-12 border-b border-stone-200/80 pb-1.5">
                    <span className="col-span-6 font-bold">10. Reason for leaving the school:</span>
                    <span className="col-span-6">{activeTc.reason_for_leaving}</span>
                  </div>
                  <div className="grid grid-cols-12 border-b border-stone-200/80 pb-1.5">
                    <span className="col-span-6 font-bold">11. General Conduct &amp; Character:</span>
                    <span className="col-span-6 font-bold text-[#15803D]">Good / Exemplary</span>
                  </div>
                  <div className="grid grid-cols-12 border-b border-stone-200/80 pb-1.5">
                    <span className="col-span-6 font-bold">12. Date of Issue of Certificate:</span>
                    <span className="col-span-6 font-mono font-bold">{new Date(activeTc.issue_date || Date.now()).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {/* Bottom Signatures & PROMINENT FRONT-FACING QR VERIFICATION STRIP */}
                <div className="pt-8 border-t-2 border-stone-900 flex justify-between items-end text-xs relative z-10">
                  <div className="text-center space-y-1">
                    <div className="w-32 border-b border-stone-400 mx-auto" />
                    <span className="font-bold text-stone-600 block">Class Teacher</span>
                  </div>

                  {/* Front Verification QR Code */}
                  <div className="flex flex-col items-center space-y-1 bg-white p-2 rounded-2xl border border-[#E8DFC8] shadow-xs">
                    <StudentQRCode payload={`https://crayonboxschool.edu.in/verify-tc?tc=${activeTc.tc_number}&adm=${activeTc.admission_no}`} size={70} />
                    <span className="text-[8px] font-mono text-stone-600 font-bold uppercase tracking-wider">
                      Scan Front QR to Verify
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="w-32 border-b border-stone-900 mx-auto font-serif italic text-[11px] text-[#0B1B30] font-bold">
                      Dr. S. K. Sharma
                    </div>
                    <span className="font-bold text-stone-900 block">Principal (Seal &amp; Sign)</span>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>

      </div>

    </div>
  );
}
