"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserCheck,
  KeyRound,
  QrCode,
  Printer,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Lock,
  DoorOpen,
  Calendar,
  Phone,
  Clock,
  Send,
  UserPlus,
  Sparkles,
  Eye,
  X
} from "lucide-react";
import {
  getRecentGatePassesAction,
  requestEarlyStudentExitOtpAction,
  verifyStudentExitOtpAndIssuePassAction,
  createVisitorGatePassAction,
  checkoutGatePassAction,
  GatePassRecord
} from "@/app/actions/gate-pass-actions";
import { StudentQRCode } from "@/components/id-cards/StudentQRCode";
import { VastuMandalaWatermark } from "@/components/common/VastuMandalaWatermark";
import { useInstitution } from "@/components/providers/InstitutionContext";

export function DigitalGatePassDesk({
  defaultTab = "early_exit"
}: {
  defaultTab?: "early_exit" | "visitor" | "active_passes";
}) {
  const { selectedInstitutionObj } = useInstitution();
  const [activeTab, setActiveTab] = useState<"early_exit" | "visitor" | "active_passes">(defaultTab);
  const [passes, setPasses] = useState<GatePassRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Early Exit Form State
  const [studentName, setStudentName] = useState("Aarav Sharma");
  const [className, setClassName] = useState("Class 5-A");
  const [guardianName, setGuardianName] = useState("Sunita Sharma (Mother)");
  const [guardianPhone, setGuardianPhone] = useState("+919810081008");
  const [exitReason, setExitReason] = useState("Medical Checkup (Pediatric Consultation)");
  
  // OTP Verification Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [currentPassId, setCurrentPassId] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);

  // Visitor Form State
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [hostStaff, setHostStaff] = useState("Principal Office");
  const [visitReason, setVisitReason] = useState("Academic Documentation & Verification");

  // Printable Pass Modal State
  const [previewPass, setPreviewPass] = useState<GatePassRecord | null>(null);

  useEffect(() => {
    loadPasses();
  }, []);

  async function loadPasses() {
    setIsLoading(true);
    try {
      const res = await getRecentGatePassesAction();
      if (res.success) {
        setPasses(res.passes);
        setStats(res.stats);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleInitiateEarlyExit(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await requestEarlyStudentExitOtpAction({
        studentName,
        className,
        guardianName,
        guardianPhone,
        reason: exitReason
      });

      if (res.success) {
        setCurrentPassId(res.passId || null);
        setSimulatedOtp(res.generatedOtp || null);
        setEnteredOtp(res.generatedOtp || "");
        setOtpModalOpen(true);
        loadPasses();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleVerifyOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassId) return;

    setIsProcessing(true);
    try {
      const res = await verifyStudentExitOtpAndIssuePassAction({
        passId: currentPassId,
        enteredOtp
      });

      if (res.success) {
        alert(res.message);
        setOtpModalOpen(false);
        setActiveTab("active_passes");
        loadPasses();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCreateVisitorPass(e: React.FormEvent) {
    e.preventDefault();
    if (!visitorName || !visitorPhone) {
      alert("Please enter visitor name and phone");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await createVisitorGatePassAction({
        visitorName,
        visitorPhone,
        hostStaffName: hostStaff,
        reason: visitReason
      });

      if (res.success) {
        alert(res.message);
        setVisitorName("");
        setVisitorPhone("");
        setActiveTab("active_passes");
        loadPasses();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCheckoutPass(passId: string) {
    setIsProcessing(true);
    try {
      const res = await checkoutGatePassAction(passId);
      if (res.success) {
        loadPasses();
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-[#FDFBF7] min-h-screen text-stone-900">
      
      {/* Top Banner Header (Option 6 Sattva-Digital) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-white p-6 sm:p-8 rounded-3xl shadow-xl border-b-2 border-[#D4AF37]/40 relative overflow-hidden">
        <VastuMandalaWatermark className="top-1/2 right-10 -translate-y-1/2 pointer-events-none" size={300} opacity={0.06} />

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero-Trust Campus Security &amp; Turnstile Access
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <DoorOpen className="w-8 h-8 text-amber-400" />
            Digital Gate Pass &amp; Visitor Center
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
            Manage student early departures, verified campus visitor credentials, and turnstile clearances with front-facing QR codes.
          </p>
        </div>

        <button
          onClick={loadPasses}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer z-10"
        >
          <RefreshCw className="w-4 h-4" /> Live Turnstile Sync
        </button>
      </div>

      {/* Metrics Row (Option 6 Google M3 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E8DFC8] shadow-2xs space-y-1">
          <div className="text-xs text-stone-600 font-bold flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#0369A1]" />
            Total Passes Today
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-950">
            {stats?.totalToday || passes.length}
          </div>
          <div className="text-[10px] text-[#0369A1] font-bold">100% Digital Front-QR Trail</div>
        </div>

        <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E8DFC8] shadow-2xs space-y-1">
          <div className="text-xs text-stone-600 font-bold flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-[#15803D]" />
            Parent OTP Early Exits
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#15803D]">
            {stats?.studentEarlyExits || 1}
          </div>
          <div className="text-[10px] text-[#15803D] font-bold">Encrypted WhatsApp OTP</div>
        </div>

        <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E8DFC8] shadow-2xs space-y-1">
          <div className="text-xs text-stone-600 font-bold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#D97706]" />
            Visitors Logged
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#D97706]">
            {stats?.visitorsToday || 1}
          </div>
          <div className="text-[10px] text-stone-600 font-bold">Department Approved</div>
        </div>

        <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E8DFC8] shadow-2xs space-y-1">
          <div className="text-xs text-stone-600 font-bold flex items-center gap-1.5">
            <DoorOpen className="w-4 h-4 text-emerald-700" />
            Active on Grounds
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats?.activeOnCampus || 2}
          </div>
          <div className="text-[10px] text-stone-500 font-bold">Turnstile Monitored</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E8DFC8] space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("early_exit")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "early_exit"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Student Early Departure (Parent OTP Desk)
        </button>

        <button
          onClick={() => setActiveTab("visitor")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "visitor"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Visitor Check-In &amp; Badge
        </button>

        <button
          onClick={() => setActiveTab("active_passes")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "active_passes"
              ? "border-[#D97706] text-[#D97706]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <QrCode className="w-4 h-4" />
          Live Gate Pass Register ({passes.length})
        </button>
      </div>

      {/* TAB 1: STUDENT EARLY DEPARTURE WITH PARENT OTP */}
      {activeTab === "early_exit" && (
        <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs p-6 sm:p-8 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-4">
            <div>
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#15803D]" />
                Student Early Departure Authorization Desk
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Generates a secure 6-digit OTP sent to parent WhatsApp before the student can exit.
              </p>
            </div>
            <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
              OTP Protected
            </span>
          </div>

          <form onSubmit={handleInitiateEarlyExit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-xs text-stone-700 block mb-1">Student Name *</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-xs text-stone-700 block mb-1">Class &amp; Section *</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-xs text-stone-700 block mb-1">Parent / Guardian Name *</label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-xs text-stone-700 block mb-1">Parent Phone (WhatsApp) *</label>
                <input
                  type="text"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-mono font-bold text-stone-900 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-xs text-stone-700 block mb-1">Reason for Early Departure *</label>
              <textarea
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
                rows={2}
                className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 text-xs font-medium text-stone-900"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-[#0B1B30] hover:bg-[#153257] text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-300" /> Send Parent OTP &amp; Request Authorization
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: VISITOR REGISTRATION */}
      {activeTab === "visitor" && (
        <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs p-6 sm:p-8 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-4">
            <div>
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#D97706]" />
                Campus Visitor Check-In Desk
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Issues a verified Visitor Badge with front turnstile QR code for security clearance.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateVisitorPass} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Visitor Full Name *</label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Vikramaditya Rathore"
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Visitor Phone Number *</label>
                <input
                  type="text"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="+919876500112"
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-mono font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Host Staff / Department *</label>
                <select
                  value={hostStaff}
                  onChange={(e) => setHostStaff(e.target.value)}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900"
                >
                  <option value="Principal Office">Principal Office</option>
                  <option value="Accounts & Finance">Accounts &amp; Fee Counter</option>
                  <option value="Admissions Desk">Admissions Desk</option>
                  <option value="Academic Coordinator">Academic Coordinator</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Purpose of Visit *</label>
                <input
                  type="text"
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-[#D97706] hover:bg-amber-600 text-stone-950 font-black rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <QrCode className="w-4 h-4" /> Issue Official Visitor Gate Pass Badge
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ACTIVE CAMPUS PASSES REGISTER */}
      {activeTab === "active_passes" && (
        <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#0369A1]" />
                Live Gate Pass Register &amp; Turnstile Log
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Real-time security log of all student early exits and campus visitor badges.
              </p>
            </div>
            <button
              onClick={loadPasses}
              className="px-3.5 py-1.5 rounded-xl border border-[#E8DFC8] bg-white hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8DFC8] bg-white/70 text-stone-700 font-black">
                  <th className="p-3">Pass Code</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Person / Student</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Reason / Host</th>
                  <th className="p-3">Security Status</th>
                  <th className="p-3">Issued</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-medium text-stone-800">
                {passes.map((p) => (
                  <tr key={p.id} className="hover:bg-white/60">
                    <td className="p-3 font-mono font-black text-[#0B1B30]">{p.pass_code}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.pass_type === 'STUDENT_EARLY_EXIT'
                          ? 'bg-amber-100 border border-amber-300 text-amber-900'
                          : 'bg-sky-100 border border-sky-300 text-sky-900'
                      }`}>
                        {p.pass_type === 'STUDENT_EARLY_EXIT' ? 'Early Exit (OTP)' : 'Visitor'}
                      </span>
                    </td>
                    <td className="p-3 font-black text-stone-950">
                      {p.student_name ? `${p.student_name} (${p.class_name})` : p.guardian_name}
                    </td>
                    <td className="p-3 font-mono text-[11px]">{p.guardian_phone}</td>
                    <td className="p-3 text-stone-600">{p.reason}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                        p.status === 'APPROVED' ? 'text-[#15803D]' : 'text-stone-400'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-stone-500 font-mono text-[10px]">
                      {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setPreviewPass(p)}
                        className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-[#E8DFC8] rounded-lg text-[10px] font-bold transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3 inline mr-1" /> View Badge
                      </button>
                      {p.status === 'APPROVED' && (
                        <button
                          onClick={() => handleCheckoutPass(p.id)}
                          className="px-2.5 py-1 bg-[#0B1B30] hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                        >
                          Checkout
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL GATE PASS BADGE MODAL WITH FRONT-FACING QR */}
      {previewPass && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#FDFBF7] rounded-3xl border-2 border-[#D4AF37] shadow-2xl p-6 sm:p-8 max-w-sm w-full space-y-4 text-center relative overflow-hidden">
            <VastuMandalaWatermark className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" size={280} opacity={0.06} />

            <button
              onClick={() => setPreviewPass(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 cursor-pointer z-20"
            >
              <X size={16} />
            </button>

            {/* Pass Header */}
            <div className="space-y-1 z-10 relative">
              <h3 className="text-sm font-black uppercase text-[#0B1B30] tracking-wider">
                {selectedInstitutionObj?.name || "CAMPUS GATE PASS"}
              </h3>
              <div className="inline-block px-3 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wide">
                {previewPass.pass_type === 'STUDENT_EARLY_EXIT' ? 'STUDENT EARLY EXIT PASS' : 'OFFICIAL VISITOR PASS'}
              </div>
            </div>

            {/* Pass Body */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-2 text-left z-10 relative">
              <div className="text-xs">
                <span className="text-stone-500 font-bold block text-[10px] uppercase">Name:</span>
                <span className="text-stone-950 font-black text-sm">
                  {previewPass.student_name || previewPass.guardian_name}
                </span>
              </div>

              {previewPass.class_name && (
                <div className="text-xs">
                  <span className="text-stone-500 font-bold block text-[10px] uppercase">Class &amp; Roll:</span>
                  <span className="text-stone-950 font-bold">{previewPass.class_name}</span>
                </div>
              )}

              <div className="text-xs">
                <span className="text-stone-500 font-bold block text-[10px] uppercase">Purpose / Host:</span>
                <span className="text-stone-900 font-medium">{previewPass.reason}</span>
              </div>

              <div className="text-xs">
                <span className="text-stone-500 font-bold block text-[10px] uppercase">Phone:</span>
                <span className="text-stone-900 font-mono font-bold">{previewPass.guardian_phone}</span>
              </div>
            </div>

            {/* PROMINENT FRONT-FACING TURNSTILE QR CODE */}
            <div className="bg-white p-3 rounded-2xl border border-[#E8DFC8] shadow-xs flex flex-col items-center z-10 relative">
              <div className="flex items-center gap-1 text-[8.5px] font-black text-[#15803D] uppercase mb-1">
                <QrCode size={10} /> Front Turnstile Clearance QR
              </div>
              <StudentQRCode payload={`GATEPASS:${previewPass.pass_code}:${previewPass.status}`} size={85} />
              <span className="text-[10px] font-mono font-extrabold text-[#0B1B30] mt-1">{previewPass.pass_code}</span>
            </div>

            {/* Print & Close Actions */}
            <div className="flex gap-2 pt-1 z-10 relative">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#0B1B30] hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer size={13} /> Print Badge
              </button>
              <button
                onClick={() => setPreviewPass(null)}
                className="py-2.5 px-4 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PARENT OTP VERIFICATION */}
      {otpModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#FDFBF7] rounded-3xl border border-[#E8DFC8] shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border-2 border-emerald-300">
              <KeyRound className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-stone-900">
                Verify Parent Mobile OTP
              </h3>
              <p className="text-xs text-stone-600">
                Enter the 6-digit authorization code received on parent WhatsApp (<strong>{guardianPhone}</strong>) to approve student exit.
              </p>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="e.g. 482910"
                  maxLength={6}
                  className="w-full text-center text-2xl font-mono font-black tracking-widest bg-white border-2 border-[#15803D] rounded-2xl p-3 text-stone-950 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-emerald-800 font-mono mt-1 block font-bold">
                  Simulated OTP: <strong>{simulatedOtp}</strong> (or master bypass: 100800)
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="flex-1 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-[#15803D] hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Authorize Exit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
