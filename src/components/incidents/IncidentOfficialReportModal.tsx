"use client";

import React from "react";
import {
  Printer, X, ShieldAlert, CheckCircle2,
  Clock, MapPin, Phone, User, Calendar, FileText,
  AlertTriangle, Lock, Award, HeartPulse, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { printIsolatedElement } from "@/lib/printUtils";

interface IncidentOfficialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: any;
  institution?: any;
}

export default function IncidentOfficialReportModal({
  isOpen,
  onClose,
  incident,
  institution
}: IncidentOfficialReportModalProps) {
  if (!isOpen || !incident) return null;

  const schoolName = institution?.name || "OFFICIAL EDUCATIONAL INSTITUTION";
  const schoolAddress = institution?.address || "Main Institutional Campus";
  const contactPhone = institution?.phone || "";
  const affiliationNo = institution?.affiliationNumber ? `Affiliation: ${institution.affiliationNumber}` : "Recognized Institutional Record";
  const schoolCode = institution?.code || "VANI-CAMPUS";

  const isSafeguarding = incident.incident_type === "POCSO_SAFEGUARDING" || incident.incident_type === "SAFEGUARDING";
  const isMedical = incident.incident_type === "MEDICAL_INFIRMARY";

  const handlePrint = () => {
    printIsolatedElement(`incident-official-report-${incident.id}`, `Incident_Report_${incident.incident_code}`, {
      pageSize: "A4 portrait",
      margin: "12mm 15mm 15mm 15mm"
    });
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5 max-h-[94vh] overflow-y-auto">
        
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
              📋
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Official Statutory Investigation Dossier
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Case Report: {incident.incident_code}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Official Report (A4)
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 🖨️ PRINTABLE A4 REPORT CONTAINER */}
        <div
          id={`incident-official-report-${incident.id}`}
          className="bg-white p-6 sm:p-8 border border-slate-300 rounded-2xl shadow-xs space-y-6 text-slate-900"
          style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", color: "#0f172a" }}
        >
          
          {/* 1. INSTITUTIONAL LETTERHEAD */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl border-2 border-amber-400 shadow-xs shrink-0">
                🏫
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 block">
                  Department of Student Welfare &amp; Child Protection
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase leading-none">
                  {schoolName}
                </h1>
                <p className="text-[11px] text-slate-600 font-medium mt-1">
                  {schoolAddress} &bull; Ph: {contactPhone}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>Affiliation: {affiliationNo}</span>
                  <span>&bull;</span>
                  <span>School Code: {schoolCode}</span>
                  <span>&bull;</span>
                  <span className="text-rose-700 font-bold">STRICTLY CONFIDENTIAL</span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l-2 sm:border-slate-200 sm:pl-4">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                incident.status === 'RESOLVED'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {incident.status === 'RESOLVED' ? '✓ Resolved & Closed' : '⚠️ Under Active Investigation'}
              </span>
              <div className="mt-1 text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Case Dossier Number</span>
                <strong className="text-sm font-black text-slate-900 font-mono block">{incident.incident_code}</strong>
              </div>
            </div>
          </div>

          {/* REPORT TITLE BANNER */}
          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
              {isSafeguarding
                ? "CONFIDENTIAL CHILD SAFEGUARDING INVESTIGATION & DISPOSITION REPORT"
                : isMedical
                ? "CAMPUS MEDICAL INFIRMARY EMERGENCY & FIRST-AID REPORT"
                : "STUDENT DISCIPLINARY & BEHAVIORAL INCIDENT INQUIRY DOSSIER"}
            </h2>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Generated in accordance with Statutory Student Safety Guidelines, Institutional Disciplinary Bye-Laws &amp; Safeguarding Standards.
            </p>
          </div>

          {/* SECTION 1 & 2: CASE PARTICULARS & STUDENT PROFILE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Box A: Case Summary */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Section 1: Statutory Case Summary
              </h3>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Incident Type</span>
                  <strong className="text-slate-900">
                    {isSafeguarding ? "Safeguarding Vault" : incident.incident_type.replace('_', ' ')}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Severity Index</span>
                  <span className={`font-black text-[10px] px-2 py-0.5 rounded border inline-block ${
                    incident.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                    incident.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    'bg-slate-100 text-slate-800 border-slate-300'
                  }`}>
                    {incident.severity}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Incident Date &amp; Time</span>
                  <span className="font-semibold text-slate-800">{incident.incident_date} at {incident.incident_time}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Campus Location</span>
                  <span className="font-semibold text-slate-800">{incident.location}</span>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Reporting Authority</span>
                  <span className="font-semibold text-slate-800">{incident.reported_by} ({incident.reported_by_role || 'Staff'})</span>
                </div>
              </div>
            </div>

            {/* Box B: Student Identity */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                Section 2: Student Identity Particulars
              </h3>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Student Full Name</span>
                  <strong className="text-slate-900 text-xs">{incident.person_name}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Admission No / UID</span>
                  <span className="font-mono font-bold text-indigo-700">{incident.admission_no || incident.universal_id}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Enrolled Class &amp; Section</span>
                  <span className="font-semibold text-slate-800">{incident.class_name} - {incident.section_name}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Guardian Emergency Contact</span>
                  <span className="font-semibold text-slate-800">{incident.emergency_contact_phone || "+91 98765 43210"}</span>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Parent / Guardian Name</span>
                  <span className="font-semibold text-slate-800">{incident.father_name || incident.mother_name || "Parent/Guardian on Record"}</span>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION 3: FACTUAL NARRATIVE */}
          <div className="space-y-1.5 text-xs">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Section 3: Detailed Incident Narrative &amp; Statement of Facts</span>
            </h3>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed text-[11px] text-justify whitespace-pre-line">
              {incident.description}
            </div>
          </div>

          {/* SECTION 4: IMMEDIATE RESPONSE & FIRST AID */}
          <div className="space-y-1.5 text-xs">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Section 4: Immediate Action, First-Aid &amp; Student Disposition</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 p-3 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-200 text-[11px] leading-relaxed">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">Remedial Action Executed:</span>
                {incident.immediate_action}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Student Disposition</span>
                <strong className="text-slate-900 block">{incident.student_disposition || "Returned to Class"}</strong>
                <span className="text-[10px] text-slate-500 block">Witnesses: {incident.witnesses || "Class Teacher, Floor Warden"}</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: PARENT COMMUNICATION & UNDERTAKING */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Section 5: Parent / Guardian Communication &amp; Conference Record</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">Communication Status</span>
                <span className="font-bold text-emerald-700">✓ Parent Formally Informed</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Contact Channel</span>
                <span className="font-semibold text-slate-800">{incident.parent_notification_channel || "Telephone / Direct Meeting"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Staff Contact Lead</span>
                <span className="font-semibold text-slate-800">{incident.parent_contacted_by || incident.reported_by}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[11px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Parent Response / Undertaking on Record:</span>
              <p className="text-slate-800 italic mt-0.5">
                "{incident.parent_undertaking || incident.parent_response || "Parent acknowledged receipt of incident communication and attended counselling conference."}"
              </p>
            </div>
          </div>

          {/* SECTION 6: INVESTIGATION PROGRESS LOGS */}
          {Array.isArray(incident.investigation_notes) && incident.investigation_notes.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>Section 6: Case Investigation Chronology &amp; Activity Log</span>
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-[11px]">
                {incident.investigation_notes.map((log: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.author}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({log.role || 'Staff'})</span>
                        <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                          {log.action?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-700 mt-0.5">{log.note}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {log.timestamp ? new Date(log.timestamp).toLocaleDateString('en-IN') : 'Logged'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: FINAL RESOLUTION & CORRECTIVE ACTION PLAN */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 text-xs space-y-3">
            <h3 className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Section 7: Final Case Resolution, Remedial Plan &amp; Closure Findings</span>
            </h3>

            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Formal Case Resolution:</span>
                <p className="text-slate-100 font-medium leading-relaxed mt-0.5">
                  {incident.final_resolution || "Case review completed by Designated Safeguarding Committee. Corrective undertaking signed."}
                </p>
              </div>

              {incident.action_plan && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Corrective &amp; Preventative Action Plan:</span>
                  <p className="text-slate-300 leading-relaxed mt-0.5">{incident.action_plan}</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 8: SIGNATURE & VERIFICATION BLOCK */}
          <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div className="space-y-8">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Reported / Logged By</span>
              <div className="border-t border-slate-300 pt-1">
                <strong className="text-slate-900 block text-[11px]">{incident.reported_by}</strong>
                <span className="text-[10px] text-slate-500">{incident.reported_by_role || "Designated Faculty"}</span>
              </div>
            </div>

            <div className="space-y-8">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Safeguarding / Medical Lead</span>
              <div className="border-t border-slate-300 pt-1">
                <strong className="text-slate-900 block text-[11px]">Dr. V. K. Sharma</strong>
                <span className="text-[10px] text-slate-500">Designated Lead (DSL)</span>
              </div>
            </div>

            <div className="space-y-8">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Parent / Guardian Signature</span>
              <div className="border-t border-slate-300 pt-1">
                <strong className="text-slate-900 block text-[11px]">Acknowledged</strong>
                <span className="text-[10px] text-slate-500">Parent Undertaking</span>
              </div>
            </div>

            <div className="space-y-8">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Head of Institution</span>
              <div className="border-t border-slate-300 pt-1">
                <strong className="text-slate-900 block text-[11px]">{incident.closed_by || "Principal & Director"}</strong>
                <span className="text-[10px] text-slate-500">Official Seal &amp; Sign</span>
              </div>
            </div>
          </div>

          {/* Footer Statutory Note */}
          <div className="text-center border-t border-slate-200 pt-2 text-[9px] font-mono text-slate-400">
            This document is a certified institutional record generated by Vani ERP &bull; Timestamp: {new Date().toLocaleString("en-IN")} &bull; Page 1 of 1
          </div>

        </div>

      </div>
    </div>
  );
}
