"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Check,
  X,
  Eye,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar
} from "lucide-react";
import {
  getAdmissionApplicationsListAction,
  approveAdmissionAndCreateStudentMasterAction
} from "@/app/actions/admissions-application-actions";

export default function AdminAdmissionApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Approval Modal State
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [section, setSection] = useState("A");
  const [rollNo, setRollNo] = useState(1);
  const [siblingConcession, setSiblingConcession] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalSuccessMsg, setApprovalSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setIsLoading(true);
    try {
      const res = await getAdmissionApplicationsListAction();
      if (res.success) {
        setApplications(res.applications || []);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApproveAdmission(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedApp || isApproving) return;

    setIsApproving(true);
    setApprovalSuccessMsg(null);

    try {
      const res = await approveAdmissionAndCreateStudentMasterAction({
        applicationId: selectedApp.id,
        section,
        rollNo,
        siblingConcessionApplied: siblingConcession || selectedApp.admission_type === 'SIBLING',
        approvedBy: 'Principal & Admissions Dean'
      });

      if (res.success && res.admissionNo) {
        setApprovalSuccessMsg(`✓ Admission Approved! Generated Admission No: ${res.admissionNo}. Student Master record created.`);
        loadApplications();
        setTimeout(() => {
          setSelectedApp(null);
          setApprovalSuccessMsg(null);
        }, 2500);
      } else {
        alert(res.error || "Failed to approve admission");
      }
    } finally {
      setIsApproving(false);
    }
  }

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    const matchesSearch =
      (app.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.application_no || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.class_applied || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.father_phone || "").includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-blue-950 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Student Master Admissions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Master Admission Applications
          </h1>
          <p className="text-xs text-slate-500">
            12-Section applications received from Web Portal, VANI AI, and Walk-in Desk
          </p>
        </div>

        <Link
          href="/admissions/apply"
          target="_blank"
          className="px-4 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-2 shadow-md transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>+ New Admission Form</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, App No, mobile..."
            className="bg-transparent border-none text-xs text-slate-900 focus:outline-none w-full font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "SUBMITTED", "APPROVED", "DRAFT"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? "bg-blue-950 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Ledger List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-black uppercase text-slate-500">
            Total Applications ({filteredApps.length})
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-950 font-black flex items-center justify-center text-xs shrink-0 border border-blue-100">
                  {app.class_applied ? app.class_applied.substring(0, 3) : "APP"}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-black text-slate-900">{app.full_name}</strong>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {app.application_no}
                    </span>
                    {app.admission_no && (
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        ✓ {app.admission_no}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span><strong>Grade:</strong> {app.class_applied}</span>
                    <span><strong>Parent:</strong> {app.father_name || app.mother_name} ({app.father_phone || app.mother_phone})</span>
                    <span><strong>DOB:</strong> {app.dob}</span>
                    {app.enquiry_no && <span><strong>Linked Enquiry:</strong> {app.enquiry_no}</span>}
                    {app.transport_required && <span className="text-blue-600 font-bold">🚌 Bus Required</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {app.status}
                </span>

                {app.status !== 'APPROVED' && (
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setSiblingConcession(app.admission_type === 'SIBLING');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve &amp; Enroll</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredApps.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p>No admission applications match the selected criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Approval & Student Master Enrollment Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <strong className="text-sm font-black text-slate-900 block">Approve Admission &amp; Create Student Master</strong>
                <p className="text-[11px] text-slate-500">Assign section, roll number, and generate permanent ADM No</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {approvalSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
                {approvalSuccessMsg}
              </div>
            )}

            <form onSubmit={handleApproveAdmission} className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-700">
                <p><strong>Student:</strong> {selectedApp.full_name}</p>
                <p><strong>Grade Applied:</strong> {selectedApp.class_applied}</p>
                <p><strong>Application Ref:</strong> {selectedApp.application_no}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assign Section *</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Roll Number *</label>
                  <input
                    type="number"
                    value={rollNo}
                    onChange={(e) => setRollNo(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={siblingConcession}
                  onChange={(e) => setSiblingConcession(e.target.checked)}
                  className="rounded text-blue-950"
                />
                <span>Apply 10% Sibling Fee Concession</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApproving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isApproving ? "Enrolling..." : "Confirm & Commit to Master"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
