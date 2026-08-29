"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { setServerAuthSession } from "@/app/actions/auth";
import {
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Building2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  KeyRound
} from "lucide-react";

export default function CentralLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [authMethod, setAuthMethod] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authError) {
        throw new Error(authError.message || "Invalid credentials. Please verify email and password.");
      }

      if (!data.user || !data.session) {
        throw new Error("Authentication failed. No active session established.");
      }

      // Check role assignment or determine default
      let detectedRole = "SUPER_ADMIN";
      let fullName = data.user.user_metadata?.full_name || "Nitin Tyagi";

      if (cleanEmail.includes("teacher") || cleanEmail.includes("faculty")) {
        detectedRole = "TEACHER";
      } else if (cleanEmail.includes("parent")) {
        detectedRole = "PARENT";
      }

      // Set server session cookies for SSR and proxy middleware
      await setServerAuthSession({
        userId: data.user.id,
        email: cleanEmail,
        role: detectedRole,
        fullName: fullName,
        accessToken: data.session.access_token,
      });

      // Route according to role
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const cleanMobile = mobile.trim();
      if (!cleanMobile || cleanMobile.length < 10) {
        throw new Error("Please enter a valid 10-digit mobile number.");
      }

      const { error: otpErr } = await supabase.auth.signInWithOtp({
        phone: cleanMobile.startsWith("+") ? cleanMobile : `+91${cleanMobile}`,
      });

      if (otpErr) {
        // Fallback for demo / test phone numbers
        console.warn("Supabase OTP notice:", otpErr.message);
      }

      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Unable to send verification OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const cleanMobile = mobile.trim();
      const phoneFormatted = cleanMobile.startsWith("+") ? cleanMobile : `+91${cleanMobile}`;

      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        phone: phoneFormatted,
        token: otp.trim(),
        type: "sms",
      });

      if (verifyErr) {
        throw new Error(verifyErr.message || "Invalid or expired OTP code.");
      }

      if (data.session) {
        await setServerAuthSession({
          userId: data.user?.id || "parent-user",
          email: `${cleanMobile}@phone.crayonboxschool.com`,
          role: "PARENT",
          fullName: "Parent / Guardian",
          accessToken: data.session.access_token,
        });
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 selection:bg-indigo-500 selection:text-white font-sans">
      {/* Top Header */}
      <header className="w-full max-w-6xl flex justify-between items-center py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-white p-1.5 shadow-lg shadow-indigo-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Crayon Box School" width={36} height={36} className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white uppercase group-hover:text-indigo-400 transition-colors">
              Crayon Box High School
            </h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Vani Educational Trust • Estd. 2012
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>IAM Gateway Online</span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md my-auto py-8">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Heading */}
          <div className="text-center mb-6 relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800/60 text-indigo-400 mb-3 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Central Identity Gateway
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Universal Single Sign-On for Staff, Parents, &amp; Students
            </p>
          </div>

          {/* Auth Method Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("credentials");
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                authMethod === "credentials"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Staff / Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod("otp");
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                authMethod === "otp"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Parent / Driver</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/80 rounded-2xl text-xs text-red-200 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Form: Credentials */}
          {authMethod === "credentials" && (
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Official Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nits.tyagi@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-xs font-semibold text-white transition placeholder:text-slate-600"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Master Password
                  </label>
                  <a
                    href="mailto:governance@vanitrust.edu.in?subject=Password%20Reset%20Request"
                    className="text-[11px] text-indigo-400 hover:underline font-semibold"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-xs font-mono font-semibold text-white transition placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded bg-slate-950 border-slate-700"
                  />
                  <span>Trust this device for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying with Supabase IAM...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Executive Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form: OTP */}
          {authMethod === "otp" && (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    disabled={otpSent}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-xs font-semibold text-white transition placeholder:text-slate-600 disabled:bg-slate-900 disabled:text-slate-500"
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Enter 6-Digit SMS OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-indigo-400 hover:underline font-semibold"
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="------"
                    className="w-full py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-center font-mono font-black text-lg tracking-widest text-white transition"
                    autoFocus
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing OTP...</span>
                  </>
                ) : otpSent ? (
                  <>
                    <span>Verify Code &amp; Launch Family Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Dispatch OTP via MSG91</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl py-4 border-t border-slate-900 text-center text-slate-600 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2026 Crayon Box School • CBSE Affiliation No. 1253481</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-slate-400 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-400 transition">Terms of Service</Link>
          <Link href="/contact" className="hover:text-slate-400 transition">Trust Helpdesk</Link>
        </div>
      </footer>
    </div>
  );
}
