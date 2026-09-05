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
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#C85A32] selection:text-white relative">
      
      {/* Subtle Warm Ivory & Ambient Glow Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#EADCC9]/40 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[#E3D5C3]/30 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#C5A059_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.15]" />
      </div>

      {/* Main Apple-Level Split Canvas */}
      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-[32px] bg-white border border-[#EFE8DC] shadow-[0_30px_90px_-20px_rgba(11,27,48,0.12)] overflow-hidden z-10 my-auto">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: DEEP NAVY + MUTED GOLD + WARMTH SHOWCASE (lg:col-span-5) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-[#0B1B30] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Golden Geometric Pattern */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-[#D4AF37]/10 pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full border border-[#D4AF37]/15 pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            
            {/* Trust Crest */}
            <div className="inline-flex items-center gap-3 p-2.5 pr-5 rounded-2xl bg-[#132842] border border-[#213F63] shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/trust-logo.png"
                alt="Vaani Educational Trust"
                className="w-12 h-12 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
              />
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase block">
                  Vaani Educational Trust
                </span>
                <span className="text-xs font-semibold text-stone-200">
                  Apex Multi-Campus Portal
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#183454] border border-[#2A4D75] text-[11px] font-semibold text-[#E5C378]">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Excellence • Empathy • Innovation</span>
              </span>
              
              <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-stone-100 leading-snug">
                Nurturing Potential with Precision & Care.
              </h1>
              
              <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed">
                Seamless digital gateway for School Leadership, Faculty, and Parents across all educational campuses.
              </p>
            </div>

          </div>

          {/* Institutional Values & Campus Badges */}
          <div className="pt-8 space-y-3 relative z-10 border-t border-[#1E3A5F]">
            <div className="flex items-center justify-between text-[11px] text-stone-300">
              <span className="font-medium text-[#E5C378]">Federated Network</span>
              <span className="font-semibold text-stone-200">Trust HQ &amp; All Campuses</span>
            </div>
            
            <div className="flex items-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>256-Bit Encrypted Session Authentication</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: WARM IVORY AUTHENTICATION CARD (lg:col-span-7) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          
          <div className="space-y-6">
            
            {/* Header Title */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-serif text-[#0B1B30] tracking-tight">
                Welcome to Crayon Box
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-normal">
                Sign in to your institutional workspace with 1-tap verification.
              </p>
            </div>

            {/* Apple-Style Segmented Tab Switcher */}
            <div className="flex bg-[#F4EFE6] p-1 rounded-2xl border border-[#E8E0D2] text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthTab("WHATSAPP");
                  setOtpDispatched(false);
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition duration-200 ${
                  authTab !== "PIN"
                    ? "bg-white text-[#0B1B30] font-bold shadow-sm"
                    : "text-stone-500 hover:text-[#0B1B30]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Verification Code</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthTab("PIN");
                  setOtpDispatched(false);
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition duration-200 ${
                  authTab === "PIN"
                    ? "bg-white text-[#0B1B30] font-bold shadow-sm"
                    : "text-stone-500 hover:text-[#0B1B30]"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Admin PIN</span>
              </button>
            </div>

            {/* Feedback Alerts */}
            {error && (
              <div className="bg-[#FFF5F5] border border-[#FCDAD7] p-3.5 rounded-2xl text-xs text-[#B91C1C] flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-[#F2F9F6] border border-[#D1EDE1] p-3.5 rounded-2xl text-xs text-[#166534] flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{successMsg}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 1: UNIFIED DYNAMIC VERIFICATION OTP */}
            {/* ========================================================================= */}
            {authTab !== "PIN" && (
              <div className="space-y-4">
                
                {!otpDispatched ? (
                  /* Step 1: Identifier Input */
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
                      <label className="text-xs font-bold text-[#0B1B30] block tracking-wide">
                        Mobile Number or Email Address
                      </label>
                      <div className="relative">
                        {identifier.includes("@") ? (
                          <Mail className="w-4 h-4 text-[#C85A32] absolute left-4 top-3.5" />
                        ) : (
                          <Phone className="w-4 h-4 text-[#0B1B30] absolute left-4 top-3.5" />
                        )}
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Enter Mobile Number or Email Address"
                          className="w-full bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-[#0B1B30] placeholder-stone-400 focus:outline-none focus:border-[#C85A32] focus:bg-white focus:ring-2 focus:ring-[#C85A32]/15 transition"
                          required
                          autoFocus
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
                        {identifier.includes("@")
                          ? "Verification code will be delivered directly to your email inbox."
                          : "Instant verification code will be sent to your WhatsApp."}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !identifier.trim()}
                      className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-[#C85A32] hover:bg-[#B34D28] text-white shadow-lg shadow-[#C85A32]/25 transition active:scale-[0.99] disabled:opacity-50"
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
                  /* Step 2: Verification Code Input */
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#0B1B30]">Enter Verification Code</span>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpDispatched(false);
                            setError(null);
                          }}
                          className="text-[#C85A32] hover:underline font-bold text-[11px]"
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
                        className="w-full bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl py-3.5 text-center text-2xl font-mono tracking-[0.4em] font-black text-[#0B1B30] focus:outline-none focus:border-[#C85A32] focus:bg-white focus:ring-2 focus:ring-[#C85A32]/15 transition"
                        autoFocus
                        required
                      />

                      <div className="flex justify-between items-center text-[11px] text-stone-500 pt-1">
                        <span>Code valid for 5 minutes</span>
                        {resendTimer > 0 ? (
                          <span className="font-medium text-stone-400">Resend in {resendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const channel = identifier.includes("@") ? "EMAIL" : "WHATSAPP";
                              handleSendOtp(channel);
                            }}
                            className="text-[#C85A32] font-bold hover:underline"
                          >
                            Resend Code
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otpCode.length < 6}
                      className="w-full py-3.5 bg-[#0B1B30] hover:bg-[#132842] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#0B1B30]/20 transition active:scale-[0.99] disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Verify & Access Dashboard"}
                    </button>

                    {/* Alternate Channel Fallback */}
                    <div className="pt-2 border-t border-stone-100 text-center">
                      {activeChannel === "WHATSAPP" ? (
                        <button
                          type="button"
                          onClick={() => handleSendOtp("EMAIL")}
                          className="text-[11px] font-semibold text-stone-500 hover:text-[#C85A32] flex items-center justify-center gap-1.5 mx-auto transition"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#C85A32]" />
                          <span>Didn't receive WhatsApp? Send to Email instead</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp("WHATSAPP")}
                          className="text-[11px] font-semibold text-stone-500 hover:text-[#0B1B30] flex items-center justify-center gap-1.5 mx-auto transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#0B1B30]" />
                          <span>Send to WhatsApp instead</span>
                        </button>
                      )}
                    </div>
                  </form>
                )}

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: EMERGENCY ADMIN / MASTER PIN */}
            {/* ========================================================================= */}
            {authTab === "PIN" && (
              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0B1B30] block tracking-wide">
                    Registered Mobile or Admission Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 9911102027 or ADM-2026-0089"
                      className="w-full bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-[#0B1B30] placeholder-stone-400 focus:outline-none focus:border-[#C85A32] focus:bg-white focus:ring-2 focus:ring-[#C85A32]/15 transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0B1B30] block tracking-wide">
                    Security / Master PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#C85A32] absolute left-4 top-3.5" />
                    <input
                      type="password"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="e.g. 100800"
                      className="w-full bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl pl-11 pr-4 py-3.5 text-sm font-mono font-black text-[#0B1B30] placeholder-stone-400 focus:outline-none focus:border-[#C85A32] focus:bg-white focus:ring-2 focus:ring-[#C85A32]/15 transition"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Chairman & School Leadership Master PIN for 0.1-second access.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#C85A32] hover:bg-[#B34D28] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#C85A32]/25 transition active:scale-[0.99]"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Verify Security PIN"}
                </button>
              </form>
            )}

          </div>

          {/* Clean Institutional Footer */}
          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
            <div>
              Front Desk Assistance: <strong className="text-[#0B1B30] font-bold">+91 98111 02008</strong>
            </div>
            <div className="text-[11px] text-stone-400">
              © 2026 Vaani Educational Trust
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* DUAL-ROLE RESOLVER MODAL (SUPER ADMIN / TEACHER + PARENT) */}
      {/* ========================================================================= */}
      {dualRoleUser && (
        <div className="fixed inset-0 z-50 bg-[#0B1B30]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFE8DC] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl text-[#0B1B30] animate-in fade-in zoom-in-95">
            
            <div className="text-center space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EFE6] text-[#C85A32] text-[11px] font-bold border border-[#E8DFD3]">
                <Sparkles className="w-3.5 h-3.5" />
                {dualRoleUser.faculty?.role === 'SUPER_ADMIN' ? 'Super Admin & Parent Profile' : 'Dual-Role Profile Detected'}
              </span>
              <h3 className="text-xl font-serif font-bold text-[#0B1B30]">
                Welcome, {dualRoleUser.faculty?.name || "User"}!
              </h3>
              <p className="text-xs text-stone-500">
                You are registered as {dualRoleUser.faculty?.role === 'SUPER_ADMIN' ? <strong>Super Admin / Trustee</strong> : <strong>Faculty Member</strong>} and also a <strong>Parent</strong> of enrolled students. How would you like to continue?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              
              {/* Option 1: Super Admin / Faculty Mode */}
              <button
                type="button"
                onClick={() => completeLoginSession(dualRoleUser, dualRoleUser.faculty?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'FACULTY')}
                className="w-full p-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F4EFE6] border-2 border-[#E8DFD3] hover:border-[#0B1B30] transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1B30] text-white flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-sm font-bold text-[#0B1B30] group-hover:text-[#C85A32]">
                      {dualRoleUser.faculty?.role === 'SUPER_ADMIN' ? '👑 Continue as Super Admin (Trust HQ)' : '👩‍🏫 Continue as Faculty / Teacher'}
                    </strong>
                    <span className="text-xs text-stone-500">
                      {dualRoleUser.faculty?.designation || (dualRoleUser.faculty?.role === 'SUPER_ADMIN' ? 'Managing Trustee' : 'Class Teacher')} • {dualRoleUser.faculty?.role === 'SUPER_ADMIN' ? 'All 4 Campuses, CCTV & Matrix' : 'Attendance & Lesson Diary'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-[#0B1B30]" />
              </button>

              {/* Option 2: Parent Mode */}
              <button
                type="button"
                onClick={() => completeLoginSession(dualRoleUser, "PARENT")}
                className="w-full p-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F4EFE6] border-2 border-[#E8DFD3] hover:border-[#C85A32] transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C85A32] text-white flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-sm font-bold text-[#0B1B30] group-hover:text-[#C85A32]">
                      👨‍👩‍👧 Continue as Parent
                    </strong>
                    <span className="text-xs text-stone-500">
                      Parent of {dualRoleUser.children?.map((c: any) => `${c.name} (${c.grade || 'Class 5'})`).join(", ") || "Student"} • Fees, Bus GPS &amp; Report Card
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-[#C85A32]" />
              </button>

            </div>

            <p className="text-[11px] text-center text-stone-400">
              💡 You can also switch between Super Admin and Parent modes anytime from the top header switcher!
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
