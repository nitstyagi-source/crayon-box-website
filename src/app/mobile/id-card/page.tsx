"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CreditCard, ArrowLeft, QrCode, ShieldCheck, 
  RotateCw, Download, Share2, Sparkles, Building2
} from "lucide-react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";

export default function MobileIdCardPage() {
  const { user, activeRole, activeChild } = useMobileAuth();
  const [cardType, setCardType] = useState<"student" | "faculty" | "escort">("student");
  const [isFlipped, setIsFlipped] = useState(false);

  const name = cardType === "student" ? (activeChild?.firstName ? `${activeChild.firstName} ${activeChild.lastName}` : "Aarav Sharma") : user?.fullName || "Neha Sharma";
  const idNo = cardType === "student" ? activeChild?.admissionNo || "CB26-05421" : user?.employeeCode || "EMP-2026-042";
  const sub = cardType === "student" ? `${activeChild?.grade || "Grade 5"} (${activeChild?.section || "A"})` : user?.department || "TGT Mathematics";
  const photo = cardType === "student" ? activeChild?.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150" : user?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150";

  return (
    <div className="space-y-5 pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/mobile" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-tight">Digital ID & Gate Pass</h1>
            <p className="text-[11px] text-slate-500">Cryptographically Signed QR</p>
          </div>
        </div>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs hover:bg-slate-50"
        >
          <RotateCw className="w-3.5 h-3.5 text-amber-600" /> Flip Card
        </button>
      </div>

      {/* Card Type Selector */}
      <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-2xl">
        <button
          onClick={() => { setCardType("student"); setIsFlipped(false); }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            cardType === "student" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
          }`}
        >
          Student ID
        </button>
        <button
          onClick={() => { setCardType("faculty"); setIsFlipped(false); }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            cardType === "faculty" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
          }`}
        >
          Faculty ID
        </button>
        <button
          onClick={() => { setCardType("escort"); setIsFlipped(false); }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            cardType === "escort" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
          }`}
        >
          Escort Pass
        </button>
      </div>

      {/* Interactive Digital ID Card */}
      <div className="perspective-1000 py-2">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full max-w-xs mx-auto aspect-[1/1.55] rounded-3xl p-6 shadow-2xl transition-transform duration-500 cursor-pointer select-none relative overflow-hidden flex flex-col justify-between border ${
            cardType === "student"
              ? "bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border-indigo-500/30 text-white"
              : cardType === "faculty"
              ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 border-amber-500/30 text-white"
              : "bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900 border-purple-500/30 text-white"
          }`}
        >
          {/* Top School Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-serif font-black flex items-center justify-center text-base shadow-sm">
                C
              </div>
              <div>
                <h3 className="font-bold text-xs tracking-wider uppercase">Crayon Box School</h3>
                <span className="text-[9px] text-slate-400">Excellence in Education</span>
              </div>
            </div>
            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-white/10 rounded-full border border-white/10">
              {cardType.toUpperCase()}
            </span>
          </div>

          {!isFlipped ? (
            /* Front Side */
            <div className="my-auto flex flex-col items-center text-center space-y-3 py-2">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-amber-400/80 shadow-lg shrink-0">
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              </div>

              <div>
                <h2 className="text-lg font-bold font-serif leading-tight">{name}</h2>
                <p className="text-xs text-amber-300 font-medium mt-0.5">{sub}</p>
                <div className="inline-block bg-white/10 text-slate-300 font-mono text-[10px] px-2.5 py-0.5 rounded-md mt-1.5">
                  ID: {idNo}
                </div>
              </div>
            </div>
          ) : (
            /* Back Side (QR Code & Emergency Info) */
            <div className="my-auto flex flex-col items-center text-center space-y-3 py-2 animate-in fade-in">
              <div className="w-28 h-28 bg-white p-2.5 rounded-2xl shadow-md flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-900" />
              </div>

              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> SECURE TOKEN: {idNo}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-tight">
                  Scan at campus gates for automatic entry, attendance & security validation.
                </p>
              </div>
            </div>
          )}

          {/* Bottom Card Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400 font-mono">
            <span>VALID: 2026-2027</span>
            <span>BLOOD: O+ POSITIVE</span>
          </div>
        </div>
      </div>

      {/* Sharing & Saving Shortcuts */}
      <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
        <button 
          onClick={() => window.print()}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" /> Save to Wallet
        </button>

        <button 
          onClick={() => alert("Digital ID Pass link copied to clipboard.")}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" /> Share Escort Pass
        </button>
      </div>

    </div>
  );
}
