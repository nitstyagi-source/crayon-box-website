"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Lock, User, CheckCircle2, AlertCircle } from "lucide-react";

export default function UnifiedLogin() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // After successful login, redirect to a central router or admin
      router.push("/admin/dashboard"); 
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending OTP or call Supabase signInWithOtp
    setLoading(true);
    setError(null);
    try {
      // In production with MSG91 hook, this would send an SMS
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: mobile,
      });
      if (otpError) throw otpError;
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: mobile,
        token: otp,
        type: 'sms'
      });
      if (verifyError) throw verifyError;
      router.push("/family/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8 text-center bg-[#0A1A44] text-white">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Crayon Box ERP</h1>
          <p className="text-white/70 text-sm mt-2">Unified Central Authentication</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-start gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => { setAuthMethod("password"); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${authMethod === "password" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Staff / Admin
            </button>
            <button
              onClick={() => { setAuthMethod("otp"); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${authMethod === "otp" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Parent / Driver
            </button>
          </div>

          {authMethod === "password" ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email / Username</label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="name@school.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#0A1A44] hover:bg-blue-900 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
              >
                {loading ? "Authenticating..." : "Secure Sign In"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Registered Mobile Number</label>
                <input
                  type="tel"
                  required
                  disabled={otpSent}
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="+91 9876543210"
                />
              </div>

              {otpSent && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition text-center tracking-widest font-mono text-lg font-bold"
                    placeholder="------"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#0A1A44] hover:bg-blue-900 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
              >
                {loading ? "Processing..." : (otpSent ? "Verify & Login" : "Send Login OTP")}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
