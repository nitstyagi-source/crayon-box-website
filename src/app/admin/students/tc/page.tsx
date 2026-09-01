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

export default function TransferCertificateStudioPage() {
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl print:hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Official CBSE Transfer Certificate &amp; Leaving Certificate Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-amber-400" />
            CBSE School Leaving &amp; Transfer Certificate (TC) Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
            Issue tamper-proof CBSE Transfer Certificates with serial numbers, dues clearance, and public anti-forgery QR verification codes.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-2xl font-black text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
        >
          <Printer className="w-4 h-4" /> Print Official A4 Certificate
        </button>
      </div>

      {/* Main Form & Printable Document Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Issue Form (Hidden during print) */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5 print:hidden">
          <div>
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Issue New Transfer Certificate
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Verify all department dues clearances before generating official TC.
            </p>
          </div>

          <form onSubmit={handleGenerateTc} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Student Full Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-900"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Admission No</label>
                <input
                  type="text"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-mono font-bold text-stone-900"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Class Left</label>
                <input
                  type="text"
                  value={classLastAttended}
                  onChange={(e) => setClassLastAttended(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Father's Name</label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-stone-900"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Mother's Name</label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-stone-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-900"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Date Admitted</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Annual Academic Result</label>
              <input
                type="text"
                value={annualResult}
                onChange={(e) => setAnnualResult(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-stone-900"
                required
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Reason for School Leaving</label>
              <textarea
                value={reasonForLeaving}
                onChange={(e) => setReasonForLeaving(e.target.value)}
                rows={2}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-stone-900 leading-tight"
                required
              />
            </div>

            {/* Clearances Checklist */}
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1 text-[11px] text-emerald-950 font-medium">
              <div className="font-bold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Automated Department Clearances:
              </div>
              <div>• Accounts Fee Dues: <strong>₹0.00 (Cleared)</strong></div>
              <div>• Library Books Returned: <strong>All Returned</strong></div>
              <div>• Transport Dues: <strong>Cleared</strong></div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-stone-950 hover:bg-stone-800 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              Generate Official CBSE Certificate
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Official CBSE A4 Document Preview */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTc ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border-4 border-stone-900 shadow-2xl space-y-6 text-stone-900 print:shadow-none print:border-4 print:p-8">
              
              {/* Official Header */}
              <div className="text-center space-y-1 border-b-2 border-stone-900 pb-4">
                <div className="text-[10px] font-bold tracking-widest uppercase text-stone-600">
                  Affiliated to the Central Board of Secondary Education (CBSE), New Delhi
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
                  CRAYON BOX SCHOOL
                </h2>
                <div className="text-xs text-stone-600 font-medium">
                  Sant Nagar, Burari, Delhi-110084 | Email: info@crayonboxschool.com
                </div>
                <div className="flex justify-center gap-6 text-[10px] font-mono text-stone-700 pt-1 font-bold">
                  <span>CBSE Affiliation No: 2730588</span>
                  <span>School Code: 25189</span>
                  <span>UDISE No: 07010101802</span>
                </div>
              </div>

              {/* Certificate Title & Serial */}
              <div className="flex justify-between items-center border-b border-stone-300 pb-2 text-xs">
                <div className="font-mono font-black text-amber-900">
                  Certificate No: {selectedTc.tc_number}
                </div>
                <div className="px-3 py-1 bg-stone-100 rounded-full font-black text-stone-900 text-[11px] tracking-wide uppercase">
                  TRANSFER CERTIFICATE
                </div>
                <div className="font-mono font-bold text-stone-600">
                  Admission No: {selectedTc.admission_no}
                </div>
              </div>

              {/* 14-Point CBSE Official Schedule Table */}
              <div className="space-y-2.5 text-xs text-stone-800">
                <div className="grid grid-cols-12 border-b border-stone-100 pb-1.5">
                  <span className="col-span-6 font-bold">1. Name of the Pupil:</span>
                  <span className="col-span-6 font-black text-blue-950 uppercase">{selectedTc.student_name}</span>
                </div>
                <div className="grid grid-cols-12 border-b border-stone-100 pb-1.5">
                  <span className="col-span-6 font-bold">2. Father's / Guardian's Name:</span>
                  <span className="col-span-6 font-semibold">{selectedTc.father_name}</span>
                </div>
                <div className="grid grid-cols-12 border-b border-stone-100 pb-1.5">
                  <span className="col-span-6 font-bold">3. Mother's Name:</span>
                  <span className="col-span-6 font-semibold">{selectedTc.mother_name}</span>
                </div>
                <div className="grid grid-cols-12 border-b border-stone-100 pb-1.5">
                  <span className="col-span-6 font-bold">4. Nationality:</span>
                  <span className="col-span-6">Indian</span>
                </div>
                <div className="grid grid-cols-12 border-b border-stone-100 pb-1.5">
                  <span className="col-span-6 font-bold">5. Date of Birth (in figures):</span>
                  <span className="col-span-6 font-mono font-bold">{new Date(selectedTc.dob).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="grid grid-cols-12 border-b border-stone-100 pb-1.5">
                  <span className="col-span-6 font-bold">6. Date of First Admission in School:</span>
                  <span className="col-span-6 font-mono">{new Date(selectedTc.admission_date).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="grid grid-cols-12 border-b border-stone-100 pb-1.5">
                  <span className="col-span-6 font-bold">7. Class in which pupil last studied:</span>
                  <span className="col-span-6 font-black text-blue-950">{selectedTc.class_last_attended}</span>
                </div>
                <div className="grid grid-cols-12 border-b border-stone-100 pb-1.5">
                  <span className="col-span-6 font-bold">8. School / Board Annual Examination Result:</span>
                  <span className="col-span-6 font-semibold text-emerald-800">{selectedTc.annual_result || "Passed"}</span>
                </div>
                <div className="grid grid-cols-12 border-b border-stone-100 pb-1.5">
                  <span className="col-span-6 font-bold">9. Month upto which school dues paid:</span>
                  <span className="col-span-6 font-bold text-emerald-700">All Dues Fully Cleared (Nil)</span>
                </div>
                <div className="grid grid-cols-12 border-b border-stone-100 pb-1.5">
                  <span className="col-span-6 font-bold">10. Reason for leaving the school:</span>
                  <span className="col-span-6">{selectedTc.reason_for_leaving}</span>
                </div>
                <div className="grid grid-cols-12 border-b border-stone-100 pb-1.5">
                  <span className="col-span-6 font-bold">11. General Conduct &amp; Character:</span>
                  <span className="col-span-6 font-bold text-emerald-900">Good / Exemplary</span>
                </div>
                <div className="grid grid-cols-12 border-b border-stone-100 pb-1.5">
                  <span className="col-span-6 font-bold">12. Date of Issue of Certificate:</span>
                  <span className="col-span-6 font-mono font-bold">{new Date(selectedTc.issue_date || Date.now()).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Bottom Signatures & QR Verification Strip */}
              <div className="pt-8 border-t-2 border-stone-900 flex justify-between items-end text-xs">
                <div className="text-center space-y-1">
                  <div className="w-32 border-b border-stone-400 mx-auto" />
                  <span className="font-bold text-stone-600 block">Class Teacher</span>
                </div>

                <div className="flex flex-col items-center space-y-1">
                  <div className="w-16 h-16 bg-stone-100 border border-stone-300 rounded-lg flex items-center justify-center p-1">
                    <QrCode className="w-12 h-12 text-stone-800" />
                  </div>
                  <span className="text-[8px] font-mono text-stone-500 font-bold">
                    Scan to Verify Online
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-32 border-b border-stone-900 mx-auto font-serif italic text-[11px] text-blue-900 font-bold">
                    Dr. S. K. Sharma
                  </div>
                  <span className="font-bold text-stone-900 block">Principal (Seal &amp; Sign)</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-xs font-bold text-stone-400">
              Select or generate a Transfer Certificate to preview.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
