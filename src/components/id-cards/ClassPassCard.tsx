"use client";

import React from 'react';
import { ShieldCheck, QrCode, Phone, Bus, GraduationCap, CheckCircle2 } from 'lucide-react';
import { StudentQRCode } from './StudentQRCode';
import { VastuMandalaWatermark } from '@/components/common/VastuMandalaWatermark';
import { ClassAccessPass } from '@/app/actions/class-pass-actions';

interface ClassPassCardProps {
  pass: ClassAccessPass;
  schoolName?: string;
  isCompact?: boolean;
}

export function ClassPassCard({ pass, schoolName = "CRAYON BOX SCHOOL", isCompact = false }: ClassPassCardProps) {
  return (
    <div className={`bg-[#FDFBF7] rounded-3xl shadow-lg border-2 border-[#E8DFC8] overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none ${
      isCompact ? 'w-[250px] h-[380px]' : 'w-[270px] h-[410px]'
    }`}>
      <VastuMandalaWatermark className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" size={270} opacity={0.06} />

      {/* Top Regal Header */}
      <div className="bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-white py-2.5 px-3 text-center relative z-10 border-b-2 border-[#D4AF37]/50 shadow-xs">
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <h3 className="font-black text-[11px] uppercase tracking-wider text-amber-200 truncate">{schoolName}</h3>
        </div>
        <div className="bg-amber-400 text-stone-950 text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mt-1 shadow-2xs">
          STUDENT SCHOOL ACCESS PASS
        </div>
      </div>

      {/* Center Body: Child Photo in Solar Halo + Details */}
      <div className="px-3 flex flex-col items-center text-center space-y-1.5 my-auto z-10">
        
        {/* Student Avatar in Auspicious Solar Halo Ring */}
        <div className="w-16 h-16 rounded-full bg-white border-2 border-[#D4AF37] p-0.5 shadow-sm overflow-hidden flex items-center justify-center">
          {pass.photoUrl ? (
            <img src={pass.photoUrl} alt={pass.studentName} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-amber-50 rounded-full flex items-center justify-center text-amber-900 font-black text-lg">
              {pass.studentName[0]}
            </div>
          )}
        </div>

        {/* Student Name */}
        <div className="space-y-0.5">
          <h4 className="font-black text-xs text-stone-950 uppercase tracking-tight truncate max-w-[230px]">
            {pass.studentName}
          </h4>
          
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold">
            <span className="px-2 py-0.5 rounded-md bg-[#0369A1] text-white">
              {pass.className}-{pass.sectionName}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-950 font-mono">
              Roll: {pass.rollNumber}
            </span>
          </div>
        </div>

        {/* PROMINENT FRONT-FACING TURNSTILE GATE ACCESS QR CODE */}
        <div className="bg-white p-1.5 rounded-2xl border border-[#E8DFC8] shadow-xs flex flex-col items-center">
          <div className="flex items-center gap-1 text-[7px] font-black uppercase text-[#15803D] mb-0.5">
            <QrCode size={8} /> Fast Turnstile QR
          </div>
          <StudentQRCode payload={pass.qrPayload} size={isCompact ? 60 : 72} />
          <span className="text-[7.5px] font-mono font-extrabold text-stone-600 mt-0.5">{pass.universalId}</span>
        </div>

        {/* Vitals & Transit Strip */}
        <div className="w-full grid grid-cols-2 gap-1.5 text-[7.5px] font-bold text-stone-700">
          <div className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-md py-0.5 px-1 truncate">
            Blood: <span className="font-extrabold text-stone-900">{pass.bloodGroup}</span>
          </div>
          <div className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-md py-0.5 px-1 truncate">
            Ph: <span className="font-mono font-extrabold text-stone-900">{pass.emergencyPhone}</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#0B1B30] text-amber-200 text-[7.5px] font-bold py-1.5 px-3 flex items-center justify-between border-t border-[#D4AF37]/30 z-10">
        <span>SESSION {pass.academicSession}</span>
        <span className="text-emerald-400 flex items-center gap-0.5">
          <CheckCircle2 size={8} /> GATE ACCESS ACTIVE
        </span>
      </div>
    </div>
  );
}
