"use client";

import React from 'react';
import { ShieldCheck, GraduationCap, Users, QrCode } from 'lucide-react';
import { StudentQRCode } from './StudentQRCode';

export interface EscortCardProps {
  escort: {
    guardianName: string;
    relationship: string;
    phone: string;
    photoUrl?: string;
    isAuthorizedPickup: boolean;
    studentName: string;
    studentUniversalId: string;
    studentPhotoUrl?: string;
    className: string;
    sectionName: string;
    institutionCode?: string;
    familyCode?: string;
  };
  session?: string;
  layoutMode?: 'DUAL' | 'FRONT_ONLY' | 'BACK_ONLY';
}

export function EscortPickupCard({ escort, session = '2026–2027', layoutMode = 'DUAL' }: EscortCardProps) {
  const instCode = escort.institutionCode || 'CBS';
  const fullSchoolName = instCode === 'AVM' ? 'AVINYA VIDYA MANDIR' : instCode === 'AS' ? 'AVINYA SCHOOL' : instCode === 'CBPS' ? 'CRAYON BOX PRE SCHOOL' : 'CRAYON BOX SCHOOL';

  const showFront = layoutMode === 'DUAL' || layoutMode === 'FRONT_ONLY';
  const showBack = layoutMode === 'DUAL' || layoutMode === 'BACK_ONLY';

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 print:p-0 print:bg-white print:border-none font-sans max-w-full">
      
      {/* 🌟 FRONT OF AUTHORIZED ESCORT CARD (Standard ISO/IEC 7810 ID-1 / CR80: 53.98mm × 85.60mm) */}
      {showFront && (
        <div className="w-[240px] h-[380px] bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-800 text-slate-900 shrink-0 select-none">
          
          {/* Top Header */}
          <div className="bg-slate-900 text-white py-2 px-2.5 text-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-12 h-12 bg-amber-600/30 rounded-full blur-xs" />
            <div className="flex items-center justify-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <h3 className="font-black text-[10px] uppercase tracking-wider truncate">{fullSchoolName}</h3>
            </div>
            <div className="bg-amber-400 text-slate-950 text-[7.5px] font-black uppercase tracking-widest px-1.5 py-0.2 rounded-sm inline-block mt-0.5">
              AUTHORIZED ESCORT PASS
            </div>
          </div>

          {/* Center Dual Photo Area (Escort + Child) */}
          <div className="px-3 flex flex-col items-center text-center space-y-1.5 my-auto">
            
            {/* Dual Photos Box */}
            <div className="flex items-center justify-center gap-2">
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center overflow-hidden border-2 border-amber-500 shadow-sm">
                  {escort.photoUrl ? (
                    <img src={escort.photoUrl} alt="Escort" className="w-full h-full object-cover" />
                  ) : (
                    <span>{escort.guardianName[0]}</span>
                  )}
                </div>
                <span className="text-[6.5px] font-black uppercase text-amber-800 mt-0.5 block">Escort</span>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-indigo-100 text-indigo-900 font-black text-sm flex items-center justify-center overflow-hidden border-2 border-indigo-600 shadow-sm">
                  {escort.studentPhotoUrl ? (
                    <img src={escort.studentPhotoUrl} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <span>{escort.studentName[0]}</span>
                  )}
                </div>
                <span className="text-[6.5px] font-black uppercase text-indigo-800 mt-0.5 block">Student</span>
              </div>
            </div>

            {/* Names Info */}
            <div className="space-y-0.5">
              <h2 className="text-[10.5px] font-black text-slate-900 uppercase truncate max-w-[210px]">{escort.guardianName}</h2>
              <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 font-bold text-[7.5px] border border-amber-200 inline-block">
                {escort.relationship} • 📞 {escort.phone}
              </span>
            </div>

            {/* Child Linkage Box + Front Gate QR Code */}
            <div className="w-full grid grid-cols-12 gap-1.5 text-left pt-0.5 items-center">
              
              {/* Left 7 Cols: Student & Escort Details */}
              <div className="col-span-7 bg-indigo-50 p-1.5 rounded-lg border border-indigo-200 text-[7px] space-y-0.5">
                <span className="font-bold text-indigo-900 uppercase block text-[6.5px]">Authorized For</span>
                <div className="font-extrabold text-slate-900 text-[8.5px] truncate">{escort.studentName}</div>
                <div className="text-slate-600 font-medium truncate">
                  {escort.className} ({escort.sectionName})
                </div>
                <div className="font-mono font-bold text-indigo-700 text-[7.5px] pt-0.5 truncate">
                  {escort.studentUniversalId}
                </div>
              </div>

              {/* Right 5 Cols: Front Escort QR Code */}
              <div className="col-span-5 flex flex-col items-center justify-center p-1 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <StudentQRCode
                  payload={`VET:ESCORT:${escort.studentUniversalId}:${escort.relationship}:${escort.phone}`}
                  size={54}
                />
                <span className="text-[6px] font-black uppercase text-amber-900 tracking-wider mt-0.5 block">
                  ⚡ ESCORT QR
                </span>
              </div>

            </div>

          </div>

          {/* Bottom Verification Seal */}
          <div className="border-t border-slate-200 bg-slate-50 px-2.5 py-1 flex items-center justify-between text-[7px] text-slate-600 font-bold">
            <div className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
              <span>CR80 PVC</span>
            </div>
            <span className="font-mono text-slate-500 text-[7px]">{session}</span>
          </div>

        </div>
      )}

      {/* 🌟 BACK OF ESCORT CARD */}
      {showBack && (
        <div className="w-[240px] h-[380px] bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-800 text-slate-900 shrink-0 select-none">
          
          <div className="bg-slate-900 text-white py-1.5 px-2.5 text-center">
            <span className="text-[7.5px] font-bold uppercase tracking-widest text-amber-300">
              Security Gate & Dispersal Policy
            </span>
          </div>

          <div className="p-3 space-y-1.5 text-[8px] my-auto">
            
            <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-950 space-y-0.5">
              <span className="font-bold text-[7px] uppercase block">Security Protocol</span>
              <p className="leading-tight text-[7px]">
                Present this card to Security Guard at afternoon dispersal or emergency exit.
              </p>
            </div>

            <div className="space-y-0.5 text-slate-700 text-[7px]">
              <div>• Student handed over only to bearer of this pass.</div>
              <div>• Immediately report loss to Principal Office.</div>
              <div>• Unauthorized transfer is strictly prohibited.</div>
            </div>

            {/* QR Scan Code */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block text-[7.5px]">Gate Security Scan</span>
                <span className="text-[6.5px] text-slate-500">Instant Verification</span>
              </div>
              <StudentQRCode
                payload={`VET:ESCORT:${escort.studentUniversalId}:${escort.relationship}:${escort.phone}`}
                size={48}
              />
            </div>

          </div>

          {/* Footer */}
          <div className="bg-slate-100 p-1.5 text-center text-[6.5px] text-slate-500 border-t border-slate-200 leading-tight">
            Security Helpline: +91 9811102008 • Campus Reception
          </div>

        </div>
      )}

    </div>
  );
}
