"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, Lock, Smartphone, Mail, KeyRound, 
  ArrowRight, RefreshCw, AlertCircle, Users, 
  GraduationCap, Briefcase, Sparkles, CheckCircle2, 
  ChevronRight, Building2, HelpCircle
} from "lucide-react";
import { 
  authenticateUserLogin, 
  sendMsg91LoginOtp 
} from "@/app/actions/iam";

export default function UnifiedLoginPortal() {
  const router = useRouter();

  // Authentication Mode: "password" vs "otp"
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");

  // Form Fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [rememberDevice, setRememberDevice] = useState(true);

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState<string | null>(null);

  // Multi-Role Profile Switcher Modal State
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // OTP Refs for Auto-Advance
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // Handle OTP Send via MSG91
  async function handleSendOtp() {
    if (!identifier.trim()) {
      setError("Please enter your Student ID or Registered Mobile Number.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const res = await sendMsg91LoginOtp({ identifier: identifier.trim() });
      if (res.success) {
        setOtpSent(true);
        setTimer(30);
      } else {
        setError(res.error || "Failed to send OTP.");
      }
    } catch (e: any) {
      setError("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle Login Submission
  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your Username, Email, Student ID, or Mobile number.");
      return;
    }

    const fullOtp = otpDigits.join("");
    if (authMode === "otp" && fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await authenticateUserLogin({
        identifier: identifier.trim(),
        password: authMode === "password" ? password : undefined,
        otp: authMode === "otp" ? fullOtp : undefined,
        authMethod: authMode,
        deviceInfo: typeof window !== "undefined" ? window.navigator.userAgent.slice(0, 50) : "Web"
      });

      if (res.success && res.data) {
        const user = res.data;

        // Check if user has multiple roles (e.g. Faculty + Parent)
        if (Array.isArray(user.linkedRoles) && user.linkedRoles.length > 1) {
          setAuthenticatedUser(user);
          setIsProfileModalOpen(true);
        } else {
          router.push(user.redirectUrl || "/admin/dashboard");
        }
      } else {
        setError(res.error || "Invalid login credentials.");
      }
    } catch (e: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle Profile Switcher Pick
  function selectProfileAndNavigate(profile: any) {
    setIsProfileModalOpen(false);
    router.push(profile.dashboardUrl || "/parent/dashboard");
  }

  // OTP Input Changes
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const newOtp = [...otpDigits];
    newOtp[index] = cleaned.slice(-1);
    setOtpDigits(newOtp);
    setError(null);

    if (cleaned && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Quick Demo Credential Helper
  function fillDemoCredentials(id: string, pass: string, mode: "password" | "otp" = "password") {
    setIdentifier(id);
    setPassword(pass);
    setAuthMode(mode);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans text-stone-100 selection:bg-purple-500 selection:text-white">
      
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center pb-6 border-b border-stone-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg group-hover:scale-105 transition">
            CB
          </div>
          <div>
            <strong className="text-white text-base tracking-tight block">CRAYON BOX SCHOOL</strong>
            <span className="text-[10px] text-purple-400 font-mono font-semibold tracking-wider uppercase block">
              Identity &amp; Access Management (IAM)
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <span className="hidden sm:inline text-stone-400">Need help?</span>
          <Link href="/contact" className="text-purple-400 font-bold hover:underline">
            Help Desk
          </Link>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto space-y-6">
        <div className="bg-stone-950 p-7 sm:p-8 rounded-3xl border border-stone-800 shadow-2xl space-y-6">
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest">
                CENTRAL IDENTITY PORTAL
              </span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Single Sign-On ✓
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Sign in to Crayon Box ERP
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              One account for Faculty, Staff, Students &amp; Parents.
            </p>
          </div>

          {/* Auth Mode Toggle: Password vs MSG91 OTP */}
          <div className="grid grid-cols-2 gap-1 bg-stone-900 p-1 rounded-2xl border border-stone-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode("password");
                setOtpSent(false);
                setError(null);
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                authMode === "password"
                  ? "bg-purple-600 text-white shadow-md font-black"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" /> Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("otp");
                setError(null);
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                authMode === "otp"
                  ? "bg-purple-600 text-white shadow-md font-black"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> MSG91 OTP
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Unified Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            
            <div>
              <label className="font-bold text-stone-300 block mb-1">
                Official Email / Student ID / Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. neha.sharma@crayonboxschool.com or CB2605421"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-stone-900 border border-stone-800 text-white rounded-2xl p-3 text-xs font-semibold focus:border-purple-500 focus:outline-hidden transition"
                />
              </div>
            </div>

            {/* Password Auth Fields */}
            {authMode === "password" && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-stone-300">Password</label>
                  <button
                    type="button"
                    onClick={() => alert("Password reset link sent to your registered email/mobile.")}
                    className="text-[11px] text-purple-400 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-stone-900 border border-stone-800 text-white rounded-2xl p-3 text-xs font-mono font-bold focus:border-purple-500 focus:outline-hidden transition"
                />
              </div>
            )}

            {/* MSG91 OTP Fields */}
            {authMode === "otp" && (
              <div className="space-y-3">
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isProcessing}
                    className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-purple-300 font-bold rounded-2xl border border-purple-800/60 transition flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    {isProcessing ? "Sending OTP..." : "Send MSG91 OTP to Registered Mobile"}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-300">Enter 6-Digit OTP</span>
                      <span className="text-[10px] text-purple-400 font-mono">
                        {timer > 0 ? `Resend in ${timer}s` : (
                          <button type="button" onClick={handleSendOtp} className="underline">
                            Resend Code
                          </button>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-1.5">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-12 text-center text-lg font-black font-mono bg-stone-900 border border-stone-800 text-white rounded-xl focus:border-purple-500 focus:outline-hidden"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-stone-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-3.5 h-3.5 accent-purple-600 rounded bg-stone-900 border-stone-700"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-stone-800 text-white font-black text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Quick Demo Fillers */}
          <div className="pt-3 border-t border-stone-800 space-y-2">
            <span className="text-[10px] font-mono text-stone-500 font-bold uppercase block">
              1-Click Instant Demo Login:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const res = await authenticateUserLogin({
                      identifier: "admin@crayonboxschool.com",
                      password: "admin123",
                      authMethod: "password"
                    });
                    if (res.success && res.data) {
                      router.push(res.data.redirectUrl || "/admin/dashboard");
                    }
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="p-2 bg-purple-950/60 hover:bg-purple-900 text-purple-200 font-black text-[11px] rounded-xl border border-purple-800/60 text-center transition"
              >
                ⚡ Super Admin
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const res = await authenticateUserLogin({
                      identifier: "neha.sharma@crayonboxschool.com",
                      password: "neha123",
                      authMethod: "password"
                    });
                    if (res.success && res.data) {
                      router.push("/staff/dashboard");
                    }
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="p-2 bg-indigo-950/60 hover:bg-indigo-900 text-indigo-200 font-black text-[11px] rounded-xl border border-indigo-800/60 text-center transition"
              >
                👩‍🏫 Teacher / Staff
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const res = await authenticateUserLogin({
                      identifier: "CB2605421",
                      password: "student123",
                      authMethod: "password"
                    });
                    if (res.success && res.data) {
                      router.push("/parent/dashboard");
                    }
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="p-2 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 font-black text-[11px] rounded-xl border border-emerald-800/60 text-center transition"
              >
                🎒 Parent / Student
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto text-center text-stone-500 text-[10px] space-y-1">
        <div>Protected by Crayon Box High-Security IAM &amp; MSG91 Telephony Gateway</div>
        <div>Session 2026-27 • CBSE Affiliation No. 1253481</div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 PROFILE SWITCHER MODAL (FOR USERS WITH MULTIPLE ROLES) */}
      {/* ========================================================================= */}
      {isProfileModalOpen && authenticatedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-950 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs text-stone-200 border-2 border-purple-600">
            <div className="text-center border-b border-stone-800 pb-3 space-y-1">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold tracking-wider">
                MULTI-ROLE IDENTITY DETECTED
              </span>
              <h2 className="text-lg font-black text-white">
                Select Your Active Profile
              </h2>
              <p className="text-stone-400 text-xs">
                Welcome, <strong>{authenticatedUser.fullName}</strong>! Choose which dashboard to access for this session.
              </p>
            </div>

            <div className="space-y-3">
              {authenticatedUser.linkedRoles.map((roleObj: any) => (
                <button
                  key={roleObj.role}
                  type="button"
                  onClick={() => selectProfileAndNavigate(roleObj)}
                  className="w-full p-4 bg-stone-900 hover:bg-stone-800/80 rounded-2xl border border-stone-800 hover:border-purple-500 transition-all text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-300 border border-purple-800/60 flex items-center justify-center font-bold text-lg">
                      {roleObj.role === "Faculty" ? "👩‍🏫" : "👨‍👩‍👧"}
                    </div>
                    <div>
                      <strong className="text-white font-bold text-sm block group-hover:text-purple-300 transition">
                        {roleObj.role} Mode
                      </strong>
                      <span className="text-stone-400 text-[11px] block">{roleObj.title}</span>
                      {roleObj.children && (
                        <span className="text-[10px] text-purple-400 font-mono">
                          Connected: {roleObj.children.map((c: any) => c.name).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
                </button>
              ))}
            </div>

            <p className="text-[9px] text-center text-stone-500 font-medium pt-1">
              You can seamlessly switch profiles anytime from the top bar switcher. Permissions are strictly isolated.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
