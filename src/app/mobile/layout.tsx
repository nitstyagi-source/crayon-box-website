"use client";

import React from "react";
import Link from "next/link";
import { 
  Shield, Bell, Search, ArrowRightLeft, 
  Lock, Sparkles, User, RefreshCw, Smartphone
} from "lucide-react";
import { MobileAuthProvider, useMobileAuth } from "@/components/mobile/MobileAuthProvider";
import MobileAppLock from "@/components/mobile/MobileAppLock";
import OfflineSyncManager from "@/components/mobile/OfflineSyncManager";
import ProfileSwitcherModal from "@/components/mobile/ProfileSwitcherModal";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";

function MobileShellHeader() {
  const { user, activeRole, activeChild, setIsProfileModalOpen, setIsLocked } = useMobileAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-xs select-none">
      
      {/* Profile Switcher Trigger */}
      <button
        onClick={() => setIsProfileModalOpen(true)}
        className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-100 transition-all text-left group"
        title="Tap to switch profile or child"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-amber-400 shrink-0">
            <img src={user?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-950">
            ⇄
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h1 className="font-bold text-xs text-slate-900 leading-tight">
              {activeRole === "Parent" && activeChild ? activeChild.firstName : (user?.fullName || "Neha Sharma")}
            </h1>
            <ArrowRightLeft className="w-2.5 h-2.5 text-amber-600 group-hover:rotate-180 transition-transform" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            {activeRole} Mode &bull; <span className="text-amber-600 font-bold">Switch ▾</span>
          </p>
        </div>
      </button>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5">
        <Link
          href="/mobile/search"
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          title="Search ERP"
        >
          <Search className="w-4 h-4" />
        </Link>

        <button
          onClick={() => setIsLocked(true)}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          title="Lock App"
        >
          <Lock className="w-4 h-4" />
        </button>

        <Link
          href="/mobile/notifications"
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
        </Link>
      </div>

    </header>
  );
}

function MobileShellContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100/60 font-sans flex flex-col justify-between antialiased selection:bg-amber-100">
      
      {/* Offline Sync Banner */}
      <OfflineSyncManager />

      {/* Top Mobile Header */}
      <MobileShellHeader />

      {/* Main Screen Content */}
      <main className="flex-1 max-w-md w-full mx-auto p-4">
        {children}
      </main>

      {/* Dynamic Role-Based Bottom Bar */}
      <MobileBottomNav />

      {/* Modals & Security Overlays */}
      <ProfileSwitcherModal />
      <MobileAppLock />

    </div>
  );
}

export default function MobileRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileAuthProvider>
      <MobileShellContent>{children}</MobileShellContent>
    </MobileAuthProvider>
  );
}
