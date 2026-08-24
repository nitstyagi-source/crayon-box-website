"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, 
  Sparkles, Building2, UserCheck, Eye, EyeOff, 
  GraduationCap, KeyRound, CheckCircle2, RefreshCw
} from "lucide-react";
import { emailBasedLoginAction } from "@/app/actions/iam";

export default function FacultyAndAdminLoginPage() {
  const router = useRouter();
  
  // Selected Persona / Role Tab
  const [selectedRole, setSelectedRole] = useState<"super_admin" | "faculty">("super_admin");
  
  // Form State
  const [email, setEmail] = useState("admin@crayonboxschool.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Switch Role tab and preload sample credentials
  const handleRoleTabChange = (role: "super_admin" | "faculty") => {
    setSelectedRole(role);
    setError(null);
    setSuccessMsg(null);
    if (role === "super_admin") {
      setEmail("admin@crayonboxschool.com");
      setPassword("admin123");
    } else {
      setEmail("rohan.verma.1@cbs.vanitrust.edu.in");
      setPassword("faculty123");
    }
  };

  // Submit Email Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await emailBasedLoginAction({
        email: email.trim(),
        password: password,
        targetRole: selectedRole,
        deviceInfo: typeof window !== "undefined" ? window.navigator.userAgent.slice(0, 60) : "Web Browser"
      });

      if (res.success && res.user) {
        setSuccessMsg(res.message || `Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          router.push(res.redirectUrl || (selectedRole === "super_admin" ? "/admin/dashboard" : "/staff/dashboard"));
        }, 600);
      } else {
        setError(res.error || "Authentication failed. Please verify your email and password.");
      }
    } catch (err: any) {
      setError("Network or server error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Account Chips
  const setQuickAccount = (chipEmail: string, chipPass: string, role: "super_admin" | "faculty") => {
    setSelectedRole(role);
    setEmail(chipEmail);
    setPassword(chipPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between items-center p-4 sm:p-6 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header */}
      <header className="w-full max-w-5xl flex justify-between items-center py-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg group-hover:scale-105 transition">
            CB
          </div>
          <div>
            <strong className="text-white text-sm sm:text-base tracking-tight block">CRAYON BOX HIGH SCHOOL</strong>
            <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-wider uppercase block">
              Vani Educational Trust (VET) • Central IAM
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <span className="hidden sm:inline text-slate-400">Public Portal:</span>
          <Link href="/" className="text-slate-300 hover:text-white font-semibold underline">
            Website
          </Link>
          <Link href="/login" className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-indigo-300 hover:text-white font-bold rounded-xl transition">
            Parent &amp; Student Login &rarr;
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md my-auto pt-6 pb-6">
        <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
          
          {/* Header Banner */}
          <div className="p-7 pb-5 bg-gradient-to-b from-indigo-950/80 to-slate-900 text-white text-center border-b border-slate-800/80">
            <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/40 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              {selectedRole === "super_admin" ? (
                <ShieldCheck className="w-7 h-7 text-indigo-400" />
              ) : (
                <GraduationCap className="w-7 h-7 text-indigo-400" />
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {selectedRole === "super_admin" ? "Administrative Gateway" : "Faculty & Staff Portal"}
            </h1>
            <p className="text-slate-400 text-xs font-medium mt-1">
              Secure Email-Based Sign-In for Crayon Box School
            </p>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            
            {/* Dual Role Selector Tabs */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleRoleTabChange("super_admin")}
                className={`py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-2 ${
                  selectedRole === "super_admin"
                    ? "bg-indigo-600 text-white shadow-md font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange("faculty")}
                className={`py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-2 ${
                  selectedRole === "faculty"
                    ? "bg-indigo-600 text-white shadow-md font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Faculty / Staff</span>
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 bg-red-950/80 text-red-200 rounded-2xl text-xs font-semibold flex items-start gap-2.5 border border-red-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="p-3.5 bg-emerald-950/80 text-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border border-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1">{successMsg}</div>
              </div>
            )}

            {/* Email Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 ml-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder={selectedRole === "super_admin" ? "admin@crayonboxschool.com" : "teacher.name@cbs.vanitrust.edu.in"}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:bg-slate-900 focus:outline-hidden text-xs font-bold text-white transition placeholder:text-slate-600"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="block text-xs font-bold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => alert("Password reset link has been dispatched to your registered email.")}
                    className="text-[11px] text-indigo-400 hover:underline font-semibold"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:bg-slate-900 focus:outline-hidden text-xs font-mono font-bold text-white transition placeholder:text-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded bg-slate-950 border-slate-700"
                  />
                  <span>Keep me signed in for 7 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black py-3.5 px-4 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group text-xs disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {selectedRole === "super_admin" ? "Admin Console" : "Faculty Desk"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Demo Accounts */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Quick Demo Accounts (1-Tap):
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickAccount("admin@crayonboxschool.com", "admin123", "super_admin")}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition"
                >
                  <strong className="text-[11px] text-white block">👑 Super Admin</strong>
                  <span className="text-[10px] text-slate-400 font-mono truncate block">admin@crayonboxschool.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickAccount("nits.tyagi@gmail.com", "master123", "super_admin")}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition"
                >
                  <strong className="text-[11px] text-white block">🏛️ Executive Trustee</strong>
                  <span className="text-[10px] text-slate-400 font-mono truncate block">nits.tyagi@gmail.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickAccount("rohan.verma.1@cbs.vanitrust.edu.in", "faculty123", "faculty")}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition"
                >
                  <strong className="text-[11px] text-white block">👨‍🏫 Rohan Verma (Principal)</strong>
                  <span className="text-[10px] text-slate-400 font-mono truncate block">rohan.verma.1@cbs...</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickAccount("neha.sharma@crayonboxschool.com", "neha123", "faculty")}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition"
                >
                  <strong className="text-[11px] text-white block">👩‍🏫 Neha Sharma (Teacher)</strong>
                  <span className="text-[10px] text-slate-400 font-mono truncate block">neha.sharma@crayonbox...</span>
                </button>
              </div>
            </div>

            {/* Direct Dashboard Link */}
            <div className="pt-2 text-center">
              <Link 
                href="/admin/dashboard" 
                className="text-[11px] text-slate-400 hover:text-indigo-400 font-semibold transition"
              >
                Skip to Executive Command Center &rarr;
              </Link>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-4 border-t border-slate-800 text-center text-slate-500 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2026 Crayon Box High School • CBSE Affiliation No. 1253481</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-400">Terms of Service</Link>
          <Link href="/contact" className="hover:text-slate-400">IT Helpdesk</Link>
        </div>
      </footer>

    </div>
  );
}
