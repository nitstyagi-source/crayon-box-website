"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  CreditCard, Receipt, BookOpen, AlertCircle, 
  Landmark, ArrowRightLeft, ShieldCheck, LogOut, 
  Building2, Clock, Sparkles, ExternalLink, Banknote, User
} from "lucide-react";
import { InstitutionProvider, useInstitution } from "@/components/providers/InstitutionContext";
import { CampusProvider } from "@/components/providers/CampusProvider";

function BillingTerminalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentInstitution, selectedInstitutionObj, institutionsList, setInstitution, currentRole } = useInstitution();
  
  const [currentTime, setCurrentTime] = useState<string>("");
  const [cashierName, setCashierName] = useState<string>("Cashier Desk");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const cookieUser = document.cookie
        .split("; ")
        .find((row) => row.startsWith("cb_user_name="))
        ?.split("=")[1];
      if (cookieUser) {
        setCashierName(decodeURIComponent(cookieUser));
      }
    }
  }, []);

  const navLinks = [
    { href: "/billing/collections", label: "Fee POS Counter", icon: CreditCard, badge: "POS" },
    { href: "/billing/receipts", label: "Receipts Ledger", icon: Receipt },
    { href: "/billing/day-book", label: "Daily Day Book", icon: BookOpen },
    { href: "/billing/vouchers", label: "Payment Vouchers", icon: Banknote },
    { href: "/billing/defaulters", label: "Pending Dues", icon: AlertCircle },
    { href: "/billing/reconciliation", label: "Bank Reconcile", icon: Landmark },
  ];

  function handleLogout() {
    if (typeof document !== "undefined") {
      document.cookie = "cb_auth_token=; path=/; max-age=0;";
      document.cookie = "cb_user_role=; path=/; max-age=0;";
      document.cookie = "cb_user_name=; path=/; max-age=0;";
    }
    router.push("/login?subdomain=billing");
  }

  return (
    <header className="bg-[#0F2942] text-white sticky top-0 z-40 shadow-md">
      {/* Top Utility Bar */}
      <div className="border-b border-white/10 px-4 sm:px-6 py-2 flex items-center justify-between gap-4 text-xs">
        
        {/* Brand & Subdomain Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black tracking-wide text-sm uppercase text-white">
                {selectedInstitutionObj?.name || "CRAYON BOX ACADEMY"}
              </span>
              <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                billing.crayonboxschool.com
              </span>
            </div>
            <p className="text-[10px] text-stone-300 font-medium">
              Official Fee Collection &amp; Cash Counter Terminal
            </p>
          </div>
        </div>

        {/* Right Status & Cashier Info */}
        <div className="flex items-center gap-3">
          {/* Branch / Institution Switcher */}
          {institutionsList && institutionsList.length > 1 && (
            <div className="hidden md:flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={currentInstitution}
                onChange={(e) => setInstitution(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {institutionsList.map((inst: any) => (
                  <option key={inst.code} value={inst.code} className="bg-slate-900 text-white">
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Shift & Clock */}
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-emerald-300 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Shift Active</span>
            <span className="text-white/40">•</span>
            <Clock className="w-3 h-3 text-emerald-300 inline" />
            <span className="font-mono">{currentTime}</span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-amber-400 font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden lg:block text-left">
              <span className="block font-bold text-[11px] leading-tight text-white">{cashierName}</span>
              <span className="block text-[9.5px] text-amber-400 font-mono">Accounts Desk</span>
            </div>
          </div>

          {/* Link to Full Admin (if privileged) */}
          <a
            href="/admin/dashboard"
            className="hidden xl:flex items-center gap-1 text-[11px] font-semibold text-stone-300 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition"
            title="Switch to Full School ERP Management Console"
          >
            Full ERP <ExternalLink className="w-3 h-3" />
          </a>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition"
            title="Close Terminal / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Terminal Navigation Ribbon */}
      <nav className="px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar bg-[#0A1F33]">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                  : "text-stone-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                  isActive ? "bg-slate-950 text-amber-400" : "bg-white/10 text-white"
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export default function BillingMiniErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <InstitutionProvider>
      <CampusProvider>
        <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans">
          <BillingTerminalHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </CampusProvider>
    </InstitutionProvider>
  );
}
