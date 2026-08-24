"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Sparkles, Building2, UserCheck } from "lucide-react";
import { authenticateUserLogin, demoQuickLoginAction } from "@/app/actions/iam";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@crayonboxschool.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await authenticateUserLogin({
        identifier: email,
        password: password,
        authMethod: "password"
      });

      if (res.success && res.data) {
        router.push(res.data.redirectUrl || "/admin/dashboard");
      } else {
        setError(res.error || "Invalid credentials.");
      }
    } catch (err: any) {
      setError("Login error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemoLogin = async (role: 'admin' | 'faculty') => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await demoQuickLoginAction(role);
      if (res.success && res.data) {
        router.push(res.data.redirectUrl || "/admin/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      router.push("/admin/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Header */}
        <div className="p-8 pb-6 bg-slate-900 text-white text-center">
          <div className="w-14 h-14 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Administrative Gateway</h1>
          <p className="text-slate-400 text-xs font-medium">Sign in to Institutional Command Center & ERP</p>
        </div>

        <div className="p-7 space-y-5">
          
          {/* Quick Demo Sign In Box */}
          <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="text-xs font-black text-indigo-950 block">Localhost Quick Access</span>
                <span className="text-[10px] text-indigo-700 font-semibold">1-Tap Demo Administrator Sign-In</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleInstantDemoLogin('admin')}
              disabled={isLoading}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-xs transition"
            >
              Sign In ⚡
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 text-xs font-bold text-slate-900"
                  placeholder="admin@crayonboxschool.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 text-xs font-bold text-slate-900"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 group text-xs disabled:opacity-70"
            >
              {isLoading ? "Authenticating..." : "Sign In to Admin Console"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <Link href="/login" className="hover:text-indigo-600 underline">
              Unified Portal (Staff / Parent / Student)
            </Link>
            <Link href="/admin/dashboard" className="hover:text-indigo-600 font-bold">
              Direct Dashboard &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
