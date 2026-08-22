"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Settings, ArrowLeft, Lock, Fingerprint, 
  Bell, Smartphone, Shield, LogOut, ArrowRightLeft, 
  Moon, CheckCircle2, ChevronRight
} from "lucide-react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";

export default function MobileSettingsPage() {
  const { user, activeRole, setIsProfileModalOpen, setIsLocked, logout } = useMobileAuth();
  const [appLockEnabled, setAppLockEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  return (
    <div className="space-y-5 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/mobile" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-bold text-base text-slate-900 leading-tight">App Settings & Security</h1>
          <p className="text-[11px] text-slate-500">Device Preferences &bull; {user?.fullName}</p>
        </div>
      </div>

      {/* User Account Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-amber-400 shrink-0">
            <img src={user?.avatar} alt={user?.fullName} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">{user?.fullName}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="text-[10px] font-bold text-amber-600">Active Profile: {activeRole}</span>
          </div>
        </div>

        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1 transition-all"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" /> Switch
        </button>
      </div>

      {/* Security & App Lock Section */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Security & Biometrics
        </h3>

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
          
          {/* App Lock Toggle */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Biometric & PIN Lock</h4>
                <p className="text-[11px] text-slate-400">Lock app automatically after 1 minute</p>
              </div>
            </div>

            <button
              onClick={() => setAppLockEnabled(!appLockEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                appLockEnabled ? "bg-amber-500" : "bg-slate-300"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                appLockEnabled ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Test Lock */}
          <div 
            onClick={() => setIsLocked(true)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Lock Screen Now</h4>
                <p className="text-[11px] text-slate-400">Test PIN pad & Face ID unlock</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

        </div>
      </div>

      {/* Notification Channels */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Notification Preferences
        </h3>

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
          
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Push Notifications</span>
            <button 
              onClick={() => setPushEnabled(!pushEnabled)}
              className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 ${pushEnabled ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${pushEnabled ? "translate-x-4.5" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">SMS Alerts (MSG91)</span>
            <button 
              onClick={() => setSmsEnabled(!smsEnabled)}
              className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 ${smsEnabled ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${smsEnabled ? "translate-x-4.5" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">WhatsApp Broadcasts</span>
            <button 
              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
              className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 ${whatsappEnabled ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${whatsappEnabled ? "translate-x-4.5" : "translate-x-0"}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs py-3.5 rounded-2xl border border-rose-200 shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-4 h-4" /> Sign Out of All Devices
        </button>
      </div>

    </div>
  );
}
