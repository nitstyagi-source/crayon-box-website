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
import { setServerAuthSession } from "@/app/actions/auth";

export default function UniversalLoginPage() {
  const router = useRouter();

  // Auth Mode: 'OTP' (WhatsApp/Email) vs 'PIN' (Emergency Offline)
  const [authTab, setAuthTab] = useState<"WHATSAPP" | "EMAIL" | "PIN">("WHATSAPP");
  
  // Inputs
  const [identifier, setIdentifier] = useState("");
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

  // Dual-Role Modal State
  const [dualRoleUser, setDualRoleUser] = useState<any | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (otpDispatched && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpDispatched, resendTimer]);

  useEffect(() => {
    // Capture Email Magic Link sign-ins
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user?.email) {
        const userEmail = session.user.email;
        const userName = userEmail.includes('tyagi') ? 'Nitin Tyagi (Chairman)' : userEmail.split('@')[0];
        const userRole = userEmail.includes('tyagi') ? 'SUPER_ADMIN' : 'STAFF';

        await setServerAuthSession({
          userId: session.user.id || 'supa_user',
          accessToken: session.access_token || `supa_${Date.now()}`,
          role: userRole,
          fullName: userName,
          email: userEmail
        });

        localStorage.setItem('cb_auth_token', session.access_token || 'true');
        localStorage.setItem('cb_user_role', userRole);
        localStorage.setItem('cb_user_name', userName);
        localStorage.setItem('cb_user_email', userEmail);

        router.replace('/admin');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

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
      setSuccessMsg(res.message || `✓ Verification code sent to ${res.maskedDestination || "destination"}`);
    } catch (err: any) {
      setError(err.message || "Unable to dispatch verification code.");
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
      if (code.length < 6) {
        throw new Error("Please enter the complete verification code.");
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
      await completeLoginSession(res.user, res.user.primaryRole);
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

      await completeLoginSession(res.user, res.user.primaryRole);
    } catch (err: any) {
      setError(err.message || "Invalid Emergency PIN.");
      setIsLoading(false);
    }
  }

  // Save session & redirect
  async function completeLoginSession(userData: any, chosenRole: string) {
    try {
      localStorage.setItem("cbs_auth_user", JSON.stringify(userData));
      localStorage.setItem("cbs_active_role", chosenRole);
      localStorage.setItem("cbs_auth_token", userData.token);

      // Set cookie session so Next.js server actions / middleware authorize the session
      await setServerAuthSession({
        userId: userData.identifier || 'admin',
        email: userData.faculty?.email || userData.parent?.email || `${userData.identifier}@crayonboxschool.com`,
        role: chosenRole,
        fullName: userData.faculty?.name || userData.parent?.name || 'User',
        accessToken: userData.token || `cb_token_${Date.now()}`
      });

      window.location.href = "/admin/dashboard";
    } catch (e) {
      window.location.href = "/admin/dashboard";
    }
  }

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col justify-center items-center p-4 sm:p-6 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 relative overflow-hidden">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03)_0,transparent_70%)]" />
      </div>

      {/* Main Luxury Container */}
      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 my-auto">
        
        {/* Left Column: Trust Branding & Multi-Campus Showcase (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          
          <div className="inline-flex items-center justify-center p-3 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-2xl shadow-amber-500/10 backdrop-blur-xl group hover:border-amber-500/40 transition">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/trust-logo.png"
              alt="Vaani Educational Trust"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400">
              <Sparkles className="w-3 h-3" />
              <span>Vaani Educational Trust Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase leading-tight">
              Universal Multi-Campus Portal
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 font-medium leading-relaxed">
              Apex Enterprise System for CBS, CBPS, AS, and AVM campuses.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="hidden lg:grid grid-cols-1 gap-2.5 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-900/40 border border-stone-800/60 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-200">256-Bit Hardware Encrypted</p>
                <p className="text-[10px] text-stone-500">Zero-Trust Cloud Architecture</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-900/40 border border-stone-800/60 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-200">Unified Role Resolution</p>
                <p className="text-[10px] text-stone-500">Super Admin • Faculty • Parent</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Authentication Card (lg:col-span-7) */}
        <div className="lg:col-span-7 w-full max-w-md mx-auto">
          
          <div className="bg-stone-900/80 border border-stone-800/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-6">
            
            {/* Mode Switcher Tabs */}
            <div className="flex bg-stone-950/80 p-1 rounded-2xl border border-stone-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthTab("WHATSAPP");
                  setOtpDispatched(false);
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition ${
                  authTab !== "PIN"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black shadow-md shadow-amber-500/20"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verification Code</span>
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
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black shadow-md shadow-amber-500/20"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Admin PIN</span>
              </button>
            </div>

            {/* Feedback Messages */}
            {error && (
              <div className="bg-red-950/60 border border-red-800/80 p-3.5 rounded-2xl text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-950/60 border border-emerald-800/80 p-3.5 rounded-2xl text-xs text-emerald-200 flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{successMsg}</span>
              </div>
            )}

            {/* TAB 1: UNIFIED DYNAMIC OTP LOGIN */}
            {authTab !== "PIN" && (
              <div className="space-y-4">
                
                {!otpDispatched ? (
                  /* Step 1: Enter Phone or Email */
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const clean = identifier.trim();
                      const channel = clean.includes("@") ? "EMAIL" : "WHATSAPP";
                      handleSendOtp(channel);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-300 block tracking-wide">
                        Registered Mobile or Email
                      </label>
                      <div className="relative">
                        {identifier.includes("@") ? (
                          <Mail className="w-4 h-4 text-amber-400 absolute left-4 top-3.5" />
                        ) : (
                          <Phone className="w-4 h-4 text-emerald-400 absolute left-4 top-3.5" />
                        )}
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Enter Mobile Number or Email Address"
                          className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                          required
                          autoFocus
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        {identifier.includes("@")
                          ? "Verification code will be sent to your registered email inbox."
                          : "Instant verification code will be sent to your WhatsApp."}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !identifier.trim()}
                      className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 shadow-lg shadow-amber-500/20 transition active:scale-[0.98] disabled:opacity-50"
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
                  /* Step 2: Enter OTP Code */
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-stone-300">Enter Verification Code</span>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpDispatched(false);
                            setError(null);
                          }}
                          className="text-amber-400 hover:underline font-semibold text-[11px]"
                        >
                          {identifier.includes("@") ? "Change Email" : "Change Number"}
                        </button>
                      </div>

                      <input
                        type="text"
                        maxLength={8}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="• • • • • •"
                        className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-3.5 text-center text-2xl font-mono tracking-[0.4em] font-black text-amber-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                        autoFocus
                        required
                      />

                      <div className="flex justify-between items-center text-[11px] text-stone-400 pt-1">
                        <span>Valid for 5 minutes</span>
                        {resendTimer > 0 ? (
                          <span className="font-medium text-stone-500">Resend in {resendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const channel = identifier.includes("@") ? "EMAIL" : "WHATSAPP";
                              handleSendOtp(channel);
                            }}
                            className="text-amber-400 font-bold hover:underline"
                          >
                            Resend Code
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otpCode.length < 6}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition active:scale-[0.98] disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Verify & Access Dashboard"}
                    </button>

                    {/* Alternate Channel Fallback */}
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

            {/* TAB 2: EMERGENCY OFFLINE PIN LOGIN */}
            {authTab === "PIN" && (
              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-300 block tracking-wide">
                    Registered Mobile / Admission Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 9911102027 or ADM-2026-0089"
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-300 block tracking-wide">
                    Security / Master PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-400 absolute left-4 top-3.5" />
                    <input
                      type="password"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="e.g. 100800"
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-mono font-black text-amber-400 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Chairman & Admin Master PIN for instant 0.1-second access.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition active:scale-[0.98]"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Verify Security PIN"}
                </button>
              </form>
            )}

          </div>

          {/* Footer Help */}
          <div className="text-center text-xs text-stone-500 space-y-1 pt-4">
            <div>Need assistance? Front Desk: <strong className="text-stone-300">+91 98100 81008</strong></div>
            <div className="text-[10px] text-stone-600">Encrypted 256-Bit SSL • Vaani Educational Trust 2026</div>
          </div>

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
