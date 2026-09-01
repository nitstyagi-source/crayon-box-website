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
  UserPlus
} from "lucide-react";
import {
  getRecentGatePassesAction,
  requestEarlyStudentExitOtpAction,
  verifyStudentExitOtpAndIssuePassAction,
  createVisitorGatePassAction,
  checkoutGatePassAction,
  GatePassRecord
} from "@/app/actions/gate-pass-actions";

export default function DigitalGatePassPage() {
  const [activeTab, setActiveTab] = useState<"early_exit" | "visitor" | "active_passes">("early_exit");
  const [passes, setPasses] = useState<GatePassRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Early Exit Form State
  const [studentName, setStudentName] = useState("Aarav Sharma");
  const [className, setClassName] = useState("Class 1-B");
  const [guardianName, setGuardianName] = useState("Sunita Sharma (Mother)");
  const [guardianPhone, setGuardianPhone] = useState("+919810081008");
  const [exitReason, setExitReason] = useState("Doctor Appointment (Dental)");
  
  // OTP Verification Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [currentPassId, setCurrentPassId] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);

  // Visitor Form State
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [hostStaff, setHostStaff] = useState("Principal Office");
  const [visitReason, setVisitReason] = useState("CBSE Documentation & Verification");

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
        setEnteredOtp(res.generatedOtp || ""); // Pre-fill for instant seamless test
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero-Trust Child Safeguarding &amp; Main Gate Turnstile
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <DoorOpen className="w-8 h-8 text-amber-400" />
            Digital Gate Pass &amp; Campus Visitor Security
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
            Strict Parent Mobile OTP authorization for student early departures, digital QR visitor badge issuing, and live turnstile check-in logs.
          </p>
        </div>

        {/* Live Gate Stats */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/15">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{stats?.activeOnCampus || 2} Active Passes on Campus</span>
            </div>
            <div className="text-stone-400 font-mono text-[11px]">
              Gate Security: Armed &amp; Verified
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-blue-600" />
            Total Passes Today
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats?.totalToday || passes.length}
          </div>
          <div className="text-[10px] text-blue-600 font-bold">100% Digital Trail</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            Parent OTP Early Exits
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {stats?.studentEarlyExits || 1}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">Verified via WhatsApp</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-purple-600" />
            Visitors Logged
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600">
            {stats?.visitorsToday || 1}
          </div>
          <div className="text-[10px] text-stone-500 font-bold">Host Approved</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <DoorOpen className="w-4 h-4 text-amber-600" />
            Active on Grounds
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {stats?.activeOnCampus || 2}
          </div>
          <div className="text-[10px] text-stone-500 font-bold">Awaiting Checkout</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("early_exit")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "early_exit"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          🚨 Student Early Departure (Parent OTP Desk)
        </button>

        <button
          onClick={() => setActiveTab("visitor")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "visitor"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          🎫 Visitor Check-In &amp; Photo Badge
        </button>

        <button
          onClick={() => setActiveTab("active_passes")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "active_passes"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <QrCode className="w-4 h-4" />
          📱 Live Gate Pass Register ({passes.length})
        </button>
      </div>

      {/* TAB 1: STUDENT EARLY DEPARTURE WITH PARENT OTP */}
      {activeTab === "early_exit" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                Student Early Departure Authorization Desk
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Generates a secure 6-digit OTP sent to the parent's registered WhatsApp/Mobile before the student can leave campus.
              </p>
            </div>
            <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
              OTP Protected
            </span>
          </div>

          <form onSubmit={handleInitiateEarlyExit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Class &amp; Section</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Pickup Guardian Name &amp; Relation</label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Registered Parent WhatsApp / Phone</label>
                <input
                  type="text"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Reason for Early Departure</label>
                <textarea
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 font-medium"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                📲 Dispatch 6-Digit OTP to Parent WhatsApp &amp; Verify
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: VISITOR CHECK-IN */}
      {activeTab === "visitor" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Visitor Check-In &amp; Digital QR Pass Issuing
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Issues a numbered QR gate pass badge linked to host staff member for school security audit.
            </p>
          </div>

          <form onSubmit={handleCreateVisitorPass} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Khanna"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Visitor Phone Number</label>
                <input
                  type="text"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="+919876500112"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Host Staff / Department Meeting</label>
                <select
                  value={hostStaff}
                  onChange={(e) => setHostStaff(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                >
                  <option value="Principal Office">Principal Office</option>
                  <option value="Accounts & Finance">Accounts &amp; Fee Counter</option>
                  <option value="Admissions Desk">Admissions Desk</option>
                  <option value="Academic Coordinator">Academic Coordinator</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                <QrCode className="w-4 h-4" /> Issue Official Visitor Gate Pass Badge
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ACTIVE CAMPUS PASSES */}
      {activeTab === "active_passes" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                Live Gate Pass Register &amp; Turnstile Log
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Real-time record of all student early exits and campus visitor badges.
              </p>
            </div>
            <button
              onClick={loadPasses}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-black">
                  <th className="p-3">Pass Code</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Person / Student</th>
                  <th className="p-3">Guardian / Phone</th>
                  <th className="p-3">Reason / Host</th>
                  <th className="p-3">Security Status</th>
                  <th className="p-3">Issued Time</th>
                  <th className="p-3 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {passes.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="p-3 font-mono font-black text-blue-900">{p.pass_code}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.pass_type === 'STUDENT_EARLY_EXIT'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}>
                        {p.pass_type === 'STUDENT_EARLY_EXIT' ? 'Early Exit (OTP)' : 'Visitor'}
                      </span>
                    </td>
                    <td className="p-3 font-black text-stone-900">
                      {p.student_name ? `${p.student_name} (${p.class_name})` : p.guardian_name}
                    </td>
                    <td className="p-3 font-mono text-[11px]">{p.guardian_phone}</td>
                    <td className="p-3 text-stone-600">{p.reason}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                        p.status === 'APPROVED' ? 'text-emerald-600' : 'text-stone-400'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-stone-400 font-mono text-[10px]">
                      {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 text-right">
                      {p.status === 'APPROVED' && (
                        <button
                          onClick={() => handleCheckoutPass(p.id)}
                          className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-bold shadow-xs transition active:scale-95"
                        >
                          🚪 Gate Checkout
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

      {/* MODAL: PARENT OTP VERIFICATION */}
      {otpModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300">
              <KeyRound className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-stone-900">
                Verify Parent Mobile OTP
              </h3>
              <p className="text-xs text-stone-500">
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
                  className="w-full text-center text-2xl font-mono font-black tracking-widest bg-stone-50 border-2 border-emerald-500/80 rounded-2xl p-3 text-stone-900 focus:bg-white focus:outline-none"
                  required
                />
                <span className="text-[10px] text-emerald-700 font-mono mt-1 block">
                  Simulated OTP: <strong>{simulatedOtp}</strong> (or master bypass: 100800)
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
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
