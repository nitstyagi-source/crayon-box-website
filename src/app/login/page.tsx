"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  MessageSquare,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Phone,
  GraduationCap,
  Users,
  BookOpen,
  Lock,
  ChevronRight,
  HelpCircle,
  QrCode
} from "lucide-react";
import {
  requestUniversalOtpAction,
  verifyUniversalOtpAction,
  verifyEmergencyPinAction
} from "@/app/actions/universal-auth-actions";

export default function UniversalLoginPage() {
  const router = useRouter();

  // Auth Mode: 'OTP' (WhatsApp/Email) vs 'PIN' (Emergency Offline)
  const [authTab, setAuthTab] = useState<"WHATSAPP" | "EMAIL" | "PIN">("WHATSAPP");
  
  // Inputs
  const [identifier, setIdentifier] = useState("9810081008");
  const [otpCode, setOtpCode] = useState("");
  const [pinCode, setPinCode] = useState("");
  
  // States
  const [otpDispatched, setOtpDispatched] = useState(false);
  const [activeChannel, setActiveChannel] = useState<"WHATSAPP" | "EMAIL">("WHATSAPP");
  const [maskedDestination, setMaskedDestination] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Dual-Role Modal State
  const [dualRoleUser, setDualRoleUser] = useState<any | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (otpDispatched && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpDispatched, resendTimer]);

  // 1. Send OTP (WhatsApp or Email)
  async function handleSendOtp(channelToUse: "WHATSAPP" | "EMAIL") {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const cleanId = identifier.trim();
      if (!cleanId) {
        throw new Error("Please enter your registered 10-digit mobile number or email.");
      }

      const res = await requestUniversalOtpAction({
        identifier: cleanId,
        channel: channelToUse
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      setOtpDispatched(true);
      if (res.channel) setActiveChannel(res.channel);
      setMaskedDestination(res.maskedDestination || "");
      setResendTimer(30);
      setDevOtpHint(res.devOtpCode || null);
      setSuccessMsg(res.message || `✓ 6-Digit OTP sent to ${res.maskedDestination || "destination"}`);
    } catch (err: any) {
      setError(err.message || "Unable to dispatch verification OTP.");
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Verify OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const code = otpCode.trim();
      if (code.length !== 6) {
        throw new Error("Please enter the complete 6-digit verification code.");
      }

      const res = await verifyUniversalOtpAction({
        identifier,
        otpCode: code
      });

      if (!res.success || !res.user) {
        throw new Error(res.error || "Authentication failed.");
      }

      // Check if user is Dual-Role (Teacher + Parent)
      if (res.user.isDualRole) {
        setDualRoleUser(res.user);
        setIsLoading(false);
        return;
      }

      // Single Role Redirect
      completeLoginSession(res.user, res.user.primaryRole);
    } catch (err: any) {
      setError(err.message || "OTP verification failed.");
      setIsLoading(false);
    }
  }

  // 3. Verify Emergency Offline PIN
  async function handleVerifyPin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const pin = pinCode.trim();
      if (!pin) {
        throw new Error("Please enter your emergency login PIN.");
      }

      const res = await verifyEmergencyPinAction({
        identifier,
        pinCode: pin
      });

      if (!res.success || !res.user) {
        throw new Error(res.error || "Invalid Emergency PIN.");
      }

      completeLoginSession(res.user, res.user.primaryRole);
    } catch (err: any) {
      setError(err.message || "Invalid Emergency PIN.");
      setIsLoading(false);
    }
  }

  // Save session & redirect
  function completeLoginSession(userData: any, chosenRole: string) {
    try {
      localStorage.setItem("cbs_auth_user", JSON.stringify(userData));
      localStorage.setItem("cbs_active_role", chosenRole);
      localStorage.setItem("cbs_auth_token", userData.token);

      if (chosenRole === "PARENT") {
        window.location.href = "/parent/live-stream";
      } else {
        window.location.href = "/admin/dashboard";
      }
    } catch (e) {
      window.location.href = "/admin/dashboard";
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center p-4 sm:p-6 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        
        {/* Top Institutional Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-stone-950 font-black text-2xl shadow-xl shadow-amber-500/20">
            CB
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              CRAYON BOX SCHOOL
            </h1>
            <p className="text-xs text-stone-400 font-medium tracking-wide">
              CBSE Affiliation #2730588 • Universal Portal
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* 3-Tier Channel Switcher Tabs */}
          <div className="flex bg-stone-950 p-1 rounded-2xl border border-stone-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthTab("WHATSAPP");
                setOtpDispatched(false);
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
                authTab === "WHATSAPP"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthTab("EMAIL");
                setOtpDispatched(false);
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
                authTab === "EMAIL"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthTab("PIN");
                setOtpDispatched(false);
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
                authTab === "PIN"
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Admin PIN</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="bg-red-950/60 border border-red-800/80 p-3.5 rounded-2xl text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/60 border border-emerald-800/80 p-3.5 rounded-2xl text-xs text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* Dev OTP Helper Banner (Instant Verification) */}
          {devOtpHint && (
            <div className="bg-purple-950/40 border border-purple-800/60 p-2.5 rounded-xl text-[11px] text-purple-200 flex items-center justify-between font-mono">
              <span>Test OTP Code: <strong>{devOtpHint}</strong></span>
              <button
                type="button"
                onClick={() => setOtpCode(devOtpHint)}
                className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold"
              >
                Auto-Fill
              </button>
            </div>
          )}

          {/* TAB 1 & 2: OTP LOGIN (WHATSAPP / EMAIL) */}
          {authTab !== "PIN" && (
            <div className="space-y-4">
              
              {!otpDispatched ? (
                /* Step 1: Enter Identifier */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendOtp(authTab);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-300 block">
                      {authTab === "WHATSAPP"
                        ? "Registered Mobile Number (Parent / Teacher)"
                        : "Registered Email Address"}
                    </label>
                    <div className="relative">
                      {authTab === "WHATSAPP" ? (
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                      ) : (
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                      )}
                      <input
                        type={authTab === "WHATSAPP" ? "tel" : "email"}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={authTab === "WHATSAPP" ? "9810081008 or Admission No" : "rajesh.sharma@gmail.com"}
                        className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-stone-500">
                      {authTab === "WHATSAPP"
                        ? "Instant 6-digit code delivered directly to your WhatsApp."
                        : "Verification link and OTP will be sent to your registered inbox."}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
                      authTab === "WHATSAPP"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30"
                    }`}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Get Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-Digit OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-stone-300">Enter 6-Digit Code</span>
                      <button
                        type="button"
                        onClick={() => setOtpDispatched(false)}
                        className="text-amber-400 hover:underline font-semibold text-[11px]"
                      >
                        Change Number
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-3 text-center text-2xl font-mono tracking-widest font-black text-amber-400 focus:outline-none focus:border-amber-500 transition"
                      autoFocus
                      required
                    />

                    <div className="flex justify-between items-center text-[11px] text-stone-400 pt-1">
                      <span>Code valid for 5 minutes</span>
                      {resendTimer > 0 ? (
                        <span>Resend in {resendTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp(activeChannel)}
                          className="text-amber-400 font-bold hover:underline"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition active:scale-98 disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Verify & Access Dashboard"}
                  </button>

                  {/* Smart Fallback Trigger */}
                  <div className="pt-2 border-t border-stone-800 text-center">
                    {activeChannel === "WHATSAPP" ? (
                      <button
                        type="button"
                        onClick={() => handleSendOtp("EMAIL")}
                        className="text-[11px] font-bold text-stone-400 hover:text-indigo-400 flex items-center justify-center gap-1.5 mx-auto transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Didn't receive WhatsApp? Send to Email instead</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp("WHATSAPP")}
                        className="text-[11px] font-bold text-stone-400 hover:text-emerald-400 flex items-center justify-center gap-1.5 mx-auto transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send to WhatsApp instead</span>
                      </button>
                    )}
                  </div>
                </form>
              )}

            </div>
          )}

          {/* TAB 3: EMERGENCY OFFLINE PIN LOGIN */}
          {authTab === "PIN" && (
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">
                  Registered Mobile / Admission Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 9810081008 or ADM-2024-0089"
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">
                  School Admin Emergency PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="e.g. CB-9482"
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-4 py-3 text-sm font-mono font-bold text-amber-400 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition uppercase"
                    required
                  />
                </div>
                <p className="text-[11px] text-stone-500">
                  Temporary 6-digit master PIN issued by School Administration for offline parents.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-900/30 transition active:scale-98"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Verify Emergency PIN"}
              </button>
            </form>
          )}

        </div>

        {/* Footer Help */}
        <div className="text-center text-xs text-stone-500 space-y-1">
          <div>Need help logging in? Contact Front Desk: <strong>+91 98100 81008</strong></div>
          <div className="text-[10px] text-stone-600">Encrypted 256-Bit Authentication • Crayon Box ERP 3.0</div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DUAL-ROLE RESOLVER MODAL (SUPER ADMIN / TEACHER + PARENT) */}
      {/* ========================================================================= */}
      {dualRoleUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl text-white animate-in fade-in zoom-in-95">
            
            <div className="text-center space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                {dualRoleUser.faculty?.role === 'SUPER_ADMIN' ? 'Super Admin & Parent Profile' : 'Dual-Role Profile Detected'}
              </span>
              <h3 className="text-lg font-black text-white">
                Welcome, {dualRoleUser.faculty?.name || "User"}!
              </h3>
              <p className="text-xs text-stone-400">
                You are registered as {dualRoleUser.faculty?.role === 'SUPER_ADMIN' ? <strong>Super Admin / Trustee</strong> : <strong>Faculty Member</strong>} and also a <strong>Parent</strong> of enrolled students. How would you like to continue?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              
              {/* Option 1: Super Admin / Faculty Mode */}
              <button
                type="button"
                onClick={() => completeLoginSession(dualRoleUser, dualRoleUser.faculty?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'FACULTY')}
                className="w-full p-4 rounded-2xl bg-stone-950 hover:bg-stone-800 border-2 border-purple-500/40 hover:border-purple-500 transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-sm font-bold text-white group-hover:text-purple-300">
                      {dualRoleUser.faculty?.role === 'SUPER_ADMIN' ? '👑 Continue as Super Admin (Trust HQ)' : '👩‍🏫 Continue as Faculty / Teacher'}
                    </strong>
                    <span className="text-xs text-stone-400">
                      {dualRoleUser.faculty?.designation || (dualRoleUser.faculty?.role === 'SUPER_ADMIN' ? 'Managing Trustee' : 'Class Teacher')} • {dualRoleUser.faculty?.role === 'SUPER_ADMIN' ? 'All 4 Campuses, CCTV & Matrix' : 'Attendance & Lesson Diary'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-purple-300" />
              </button>

              {/* Option 2: Parent Mode */}
              <button
                type="button"
                onClick={() => completeLoginSession(dualRoleUser, "PARENT")}
                className="w-full p-4 rounded-2xl bg-stone-950 hover:bg-stone-800 border-2 border-amber-500/40 hover:border-amber-500 transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-sm font-bold text-white group-hover:text-amber-300">
                      👨‍👩‍👧 Continue as Parent
                    </strong>
                    <span className="text-xs text-stone-400">
                      Parent of {dualRoleUser.children?.map((c: any) => `${c.name} (${c.grade || 'Class 5'})`).join(", ") || "Viraj Tyagi"} • Fees, Bus GPS &amp; Report Card
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-amber-300" />
              </button>

            </div>

            <p className="text-[11px] text-center text-stone-500">
              💡 You can also switch between Super Admin and Parent modes anytime from the top header switcher!
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
