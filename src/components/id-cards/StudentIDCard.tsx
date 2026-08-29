"use client";

import React from 'react';
import { QrCode, Phone, MapPin, Globe, ShieldCheck, User, Calendar, Droplet, ChevronRight } from 'lucide-react';
import { StudentQRCode } from './StudentQRCode';

export interface StudentIDCardProps {
  student: {
    id: string;
    first_name: string;
    middle_name?: string;
    lastName?: string;
    last_name?: string;
    universal_id?: string;
    admission_number?: string;
    admission_no?: string;
    dob?: string | Date | any;
    blood_group?: string;
    photo_url?: string;
    pen_no?: string;
    institution_code?: string;
    class_name?: string;
    section_name?: string;
    roll_number?: string;
    transport_mode?: string;
    transport_bus_no?: string;
    transport_route?: string;
    guardian_first?: string;
    guardian_last?: string;
    guardian_phone?: string;
    father_name?: string;
    mother_name?: string;
    family_name?: string;
    primary_address?: string;
  };
  schoolName?: string;
  session?: string;
  layoutMode?: 'DUAL' | 'FRONT_ONLY' | 'BACK_ONLY';
}

export function StudentIDCard({
  student,
  schoolName = 'CRAYON BOX SCHOOL',
  session = '2026–2027',
  layoutMode = 'DUAL'
}: StudentIDCardProps) {
  const sName = `${student.first_name || ''} ${student.middle_name ? `${student.middle_name} ` : ''}${student.last_name || student.lastName || ''}`.trim() || 'Arav Tyagi';
  const admNo = student.admission_number || student.admission_no || 'CBS/24-25/0412';
  const uId = student.universal_id || 'STU-VET-000042';
  const instCode = student.institution_code || 'CBS';
  const className = student.class_name ? (student.class_name.includes('Class') ? student.class_name : `Class : ${student.class_name}${student.section_name ? ` - ${student.section_name}` : ''}`) : 'Class : 4 - A';
  const bloodGroup = student.blood_group || 'O+';
  const phone = student.guardian_phone || '9876543210';
  const address = student.primary_address || '123, Green Park, New Delhi - 110016';

  // Safe DOB string formatting
  let formattedDob = '15 May 2014';
  if (student.dob) {
    if (student.dob instanceof Date) {
      formattedDob = student.dob.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } else if (typeof student.dob === 'string') {
      try {
        const d = new Date(student.dob);
        if (!isNaN(d.getTime())) {
          formattedDob = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } else {
          formattedDob = student.dob;
        }
      } catch {
        formattedDob = student.dob;
      }
    }
  }

  // Attendance QR Payload verified for gate scanning
  const qrPayload = `VET:STU:${uId}:${student.id}:${instCode}:${admNo}`;

  const showFront = layoutMode === 'DUAL' || layoutMode === 'FRONT_ONLY';
  const showBack = layoutMode === 'DUAL' || layoutMode === 'BACK_ONLY';

  return (
    <div className="flex flex-wrap gap-6 items-center justify-center p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 print:p-0 print:bg-white print:border-none font-sans max-w-full">
      
      {/* ========================================================================= */}
      {/* 🌟 FRONT SIDE OF CR80 CARD (54mm × 85.6mm)                                */}
      {/* ========================================================================= */}
      {showFront && (
        <div className="w-[260px] h-[412px] print:w-[54mm] print:h-[85.6mm] bg-white rounded-3xl shadow-xl border border-slate-300 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-800 text-slate-900 shrink-0 select-none text-center">
          
          {/* Top Curved Navy Arc */}
          <div className="bg-[#0A2558] h-24 flex items-end justify-center pb-2 relative overflow-visible">
            {/* School Crest in Gold Circle */}
            <div className="w-18 h-18 rounded-full bg-white border-2 border-amber-500 p-1 flex items-center justify-center absolute -bottom-7 shadow-md z-10">
              <img src="/trust-logo.png" alt="Crayon Box School" className="w-14 h-14 object-contain" />
            </div>
            {/* Golden Trim Curve */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
          </div>

          {/* School Brand Typography */}
          <div className="mt-8 px-2">
            <h1 className="text-base font-black tracking-wider text-[#0A2558] leading-tight">CRAYON BOX</h1>
            <div className="text-[10px] font-extrabold text-red-600 tracking-widest uppercase">— S C H O O L —</div>
            <div className="text-[7.5px] font-bold text-slate-500 tracking-wider mt-0.5">LEARN • GROW • SHINE</div>
          </div>

          {/* Student Circular Portrait */}
          <div className="mt-2 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-slate-900 border-2.5 border-[#0A2558] overflow-hidden shadow-sm flex items-center justify-center">
              {student.photo_url ? (
                <img src={student.photo_url} alt={sName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-amber-300 font-black text-xl">
                  {sName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Student Name Solid Navy Banner */}
          <div className="mt-2 mx-auto bg-[#0A2558] text-white px-5 py-1 rounded-xl text-xs font-black tracking-wide shadow-2xs max-w-[220px] truncate">
            {sName.toUpperCase()}
          </div>

          {/* Class Ribbon Badge (No Roll No) */}
          <div className="mt-1 flex items-center justify-center">
            <div className="w-2.5 h-4.5 bg-red-600 rounded-l-sm -mr-0.5" />
            <div className="bg-amber-500 text-white text-[10px] font-black px-4 py-0.5 rounded-xs z-2">
              {className}
            </div>
            <div className="w-2.5 h-4.5 bg-red-600 rounded-r-sm -ml-0.5" />
          </div>

          {/* Attendance QR Code Box */}
          <div className="my-2 mx-auto w-32 h-32 border-1.5 border-rose-500 rounded-xl flex flex-col items-center justify-center relative pt-1 bg-white shadow-2xs">
            <div className="absolute -top-2 bg-rose-600 text-white text-[7px] font-black px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
              ATTENDANCE QR
            </div>
            <StudentQRCode payload={qrPayload} size={98} />
          </div>

          {/* Bottom Solid Navy Bar: Admission Number (Replaced ID No) */}
          <div className="bg-[#0A2558] text-white py-2 px-3 border-t-2 border-amber-500 flex items-center justify-center gap-2 mt-auto">
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="text-left">
              <span className="text-[7.5px] text-slate-300 block leading-none">Admission No. :</span>
              <span className="font-mono text-[9.5px] font-black text-white leading-tight">{admNo}</span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 BACK SIDE OF CR80 CARD (54mm × 85.6mm)                                 */}
      {/* ========================================================================= */}
      {showBack && (
        <div className="w-[260px] h-[412px] print:w-[54mm] print:h-[85.6mm] bg-white rounded-3xl shadow-xl border border-slate-300 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-800 text-slate-900 shrink-0 select-none text-left">
          
          {/* Top Navy Arc with Crest */}
          <div className="bg-[#0A2558] h-24 flex items-center justify-center relative">
            <div className="w-18 h-18 rounded-full bg-white border-2 border-amber-500 p-1 flex items-center justify-center shadow-md">
              <img src="/trust-logo.png" alt="Crayon Box School" className="w-14 h-14 object-contain" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
          </div>

          {/* School Brand on Back */}
          <div className="text-center mt-2 px-2">
            <div className="text-xs font-black tracking-wider text-[#0A2558]">CRAYON BOX</div>
            <div className="text-[8.5px] font-bold text-red-600 tracking-widest uppercase">— S C H O O L —</div>
            <div className="text-[6.5px] font-bold text-slate-500 tracking-wider">LEARN • GROW • SHINE</div>
            <div className="w-24 h-0.5 bg-amber-500 mx-auto mt-1.5" />
          </div>

          {/* Student Details Grid (No Roll No) */}
          <div className="px-4 py-1.5 space-y-1 text-[9.5px]">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-0.5">
              <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                <User className="w-2.5 h-2.5" />
              </div>
              <span className="w-20 text-slate-500 font-semibold text-[9px]">Name</span>
              <span className="text-slate-400">:</span>
              <span className="font-bold text-slate-900 truncate text-[9.5px]">{sName}</span>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-0.5">
              <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                <Calendar className="w-2.5 h-2.5" />
              </div>
              <span className="w-20 text-slate-500 font-semibold text-[9px]">DOB</span>
              <span className="text-slate-400">:</span>
              <span className="font-bold text-slate-900 font-mono text-[9px]">{formattedDob}</span>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-0.5">
              <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                <Droplet className="w-2.5 h-2.5" />
              </div>
              <span className="w-20 text-slate-500 font-semibold text-[9px]">Blood Group</span>
              <span className="text-slate-400">:</span>
              <span className="font-black text-rose-600 text-[9.5px]">{bloodGroup}</span>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-0.5">
              <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                <Phone className="w-2.5 h-2.5" />
              </div>
              <span className="w-20 text-slate-500 font-semibold text-[9px]">Parent Contact</span>
              <span className="text-slate-400">:</span>
              <span className="font-bold text-slate-900 font-mono text-[9px]">{phone}</span>
            </div>

            <div className="flex items-start gap-2 border-b border-slate-100 pb-0.5">
              <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-2.5 h-2.5" />
              </div>
              <span className="w-20 text-slate-500 font-semibold text-[9px]">Address</span>
              <span className="text-slate-400">:</span>
              <span className="font-medium text-slate-700 text-[8.5px] leading-tight flex-1 line-clamp-2">{address}</span>
            </div>
          </div>

          {/* Instructions Box with Chevrons (No Signature) */}
          <div className="mx-3.5 my-1 border border-red-500 bg-red-50/40 rounded-xl p-2 relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[7px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1">
              <span>◆</span>
              <span>INSTRUCTIONS</span>
              <span>◆</span>
            </div>
            <div className="space-y-0.5 mt-1 text-[7.5px] text-slate-800 font-medium">
              <div className="flex items-start gap-1">
                <ChevronRight className="w-2.5 h-2.5 text-red-600 shrink-0 mt-0.5" />
                <span>This card is the property of Crayon Box School.</span>
              </div>
              <div className="flex items-start gap-1">
                <ChevronRight className="w-2.5 h-2.5 text-red-600 shrink-0 mt-0.5" />
                <span>This card must be worn every day.</span>
              </div>
              <div className="flex items-start gap-1">
                <ChevronRight className="w-2.5 h-2.5 text-red-600 shrink-0 mt-0.5" />
                <span>In case of loss, inform the school immediately.</span>
              </div>
            </div>
          </div>

          {/* Back Bottom Navy Footer: 3 Columns (Website: www.crayonboxschool.com, Phone: 9811102008, Motto) */}
          <div className="bg-[#0A2558] text-white py-2 px-2 text-[8px] flex items-center justify-between border-t-2 border-amber-500 mt-auto">
            <div className="flex-1 text-center font-semibold text-slate-200">
              <Globe className="w-2.5 h-2.5 text-amber-400 inline mr-0.5" />
              <span>www.crayonboxschool.com</span>
            </div>
            <div className="w-px h-5 bg-white/20" />
            <div className="flex-1 text-center font-bold text-white font-mono">
              <Phone className="w-2.5 h-2.5 text-amber-400 inline mr-0.5" />
              <span>9811102008</span>
            </div>
            <div className="w-px h-5 bg-white/20" />
            <div className="flex-1 text-center font-semibold text-amber-300 text-[7px] leading-tight">
              Excellence in Education. Values for Life.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
