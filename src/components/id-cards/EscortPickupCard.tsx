"use client";

import React from 'react';
import { ShieldCheck, GraduationCap, Users, QrCode, Phone, CheckCircle2 } from 'lucide-react';
import { StudentQRCode } from './StudentQRCode';
import { VastuMandalaWatermark } from '@/components/common/VastuMandalaWatermark';

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
    <div className="flex flex-wrap gap-4 items-center justify-center p-2.5 bg-stone-50/60 rounded-3xl border border-[#E8DFC8]/60 print:p-0 print:bg-white print:border-none font-sans max-w-full">
      
      {/* 🌟 FRONT OF AUTHORIZED ESCORT CARD WITH FRONT-FACING QR CODE */}
      {showFront && (
        <div className="w-[260px] h-[400px] bg-[#FDFBF7] rounded-3xl shadow-lg border-2 border-[#E8DFC8] overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none">
          <VastuMandalaWatermark className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" size={260} opacity={0.05} />

          {/* Top Header */}
          <div className="bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-white py-2.5 px-3 text-center relative z-10 border-b-2 border-[#D4AF37]/50">
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <h3 className="font-black text-[11px] uppercase tracking-wider text-amber-200 truncate">{fullSchoolName}</h3>
            </div>
            <div className="bg-amber-400 text-stone-950 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mt-1 shadow-2xs">
              AUTHORIZED GUARDIAN ESCORT PASS
            </div>
          </div>

          {/* Center Dual Photo Area (Escort + Child) */}
          <div className="px-3 flex flex-col items-center text-center space-y-2 my-auto z-10">
            
            {/* Dual Photos Box with Golden Accents */}
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-white text-amber-900 font-black text-sm flex items-center justify-center overflow-hidden border-2 border-[#D4AF37] shadow-sm">
                  {escort.photoUrl ? (
                    <img src={escort.photoUrl} alt="Escort" className="w-full h-full object-cover" />
                  ) : (
                    <span>{escort.guardianName[0]}</span>
                  )}
                </div>
                <span className="text-[7.5px] font-extrabold uppercase text-amber-900 mt-0.5 block">{escort.relationship}</span>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-white text-blue-900 font-black text-sm flex items-center justify-center overflow-hidden border-2 border-[#0369A1] shadow-sm">
                  {escort.studentPhotoUrl ? (
                    <img src={escort.studentPhotoUrl} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <span>{escort.studentName[0]}</span>
                  )}
                </div>
                <span className="text-[7.5px] font-extrabold uppercase text-[#0369A1] mt-0.5 block">Student</span>
              </div>
            </div>

            {/* Names Info */}
            <div className="space-y-0.5 w-full">
              <h4 className="font-black text-xs text-stone-950 truncate uppercase tracking-tight">
                {escort.guardianName}
              </h4>
              <p className="text-[9.5px] text-stone-600 font-bold">
                Authorized Pickup for: <span className="text-stone-900 font-extrabold">{escort.studentName}</span>
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8DFC8] text-[8.5px] font-bold text-stone-700">
                <span>Class {escort.className}-{escort.sectionName}</span>
                <span>•</span>
                <span className="font-mono">{escort.studentUniversalId}</span>
              </div>
            </div>

            {/* Front-Facing Verification QR Code */}
            <div className="bg-white p-1.5 rounded-xl border border-[#E8DFC8] shadow-xs flex flex-col items-center">
              <div className="flex items-center gap-1 text-[7.5px] font-black uppercase text-[#15803D] mb-0.5">
                <QrCode size={9} /> Gate Dispersal Scan
              </div>
              <StudentQRCode payload={`ESCORT:${escort.studentUniversalId}:${escort.phone}`} size={56} />
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="bg-[#0B1B30] text-amber-200 text-[8px] font-bold py-1.5 px-3 text-center border-t border-[#D4AF37]/30 z-10">
            SESSION {session} • GATE SECURITY CLEARANCE
          </div>
        </div>
      )}

      {/* 🌟 BACK OF AUTHORIZED ESCORT CARD */}
      {showBack && (
        <div className="w-[260px] h-[400px] bg-[#FDFBF7] rounded-3xl shadow-lg border-2 border-[#E8DFC8] overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none">
          <VastuMandalaWatermark className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" size={260} opacity={0.05} />

          {/* Top Header */}
          <div className="bg-[#0B1B30] text-white py-2 px-3 text-center border-b-2 border-[#D4AF37]/50 z-10">
            <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-amber-300">DISPERSAL &amp; SAFETY PROTOCOL</h4>
          </div>

          {/* Body Content */}
          <div className="p-3.5 space-y-3 z-10 text-[9px] text-stone-700 leading-tight">
            <div className="bg-white p-2.5 rounded-xl border border-[#E8DFC8] shadow-2xs space-y-1.5">
              <div className="flex justify-between font-bold text-stone-800">
                <span>Emergency Contact:</span>
                <span className="font-mono text-stone-950 font-extrabold">{escort.phone}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-800">
                <span>Family Roster Code:</span>
                <span className="font-mono text-stone-950 font-extrabold">{escort.familyCode || 'FAM-DEL-0412'}</span>
              </div>
            </div>

            <div className="space-y-1.5 bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-300/40">
              <p className="font-bold text-[#A16207]">Important Instructions:</p>
              <p>1. Must be physically presented to security and classroom escort teacher during gate dispersal.</p>
              <p>2. Non-transferable. Dispersal will be withheld if card is not verified.</p>
              <p>3. If misplaced, report immediately to gate security.</p>
            </div>

            <div className="pt-2 text-center">
              <div className="h-6 w-24 border-b border-stone-800 mx-auto font-serif italic text-[11px] font-bold text-stone-900">
                Security Desk
              </div>
              <span className="text-[8px] font-black uppercase text-stone-600 block mt-0.5">Authorized Dispersal Seal</span>
            </div>
          </div>

          {/* Bottom Strip */}
          <div className="bg-[#0B1B30] text-amber-100 text-[8px] font-medium py-1.5 px-3 text-center z-10 border-t border-[#D4AF37]/30">
            DISPERSAL GATE SYSTEM • CRAYON BOX ERP
          </div>
        </div>
      )}
    </div>
  );
}
