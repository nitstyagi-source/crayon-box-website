"use client";

import React from 'react';
import { Phone, MapPin, Globe, ShieldCheck, User, Calendar, Briefcase, CreditCard, ChevronRight } from 'lucide-react';

export interface TeacherIDCardProps {
  faculty: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone_number?: string;
    designation: string;
    department?: string;
    photo_url?: string;
    institution_code?: string;
    blood_group?: string;
    employee_id?: string;
    joining_date?: string | Date | any;
    address?: string;
  };
  session?: string;
  layoutMode?: 'DUAL' | 'FRONT_ONLY' | 'BACK_ONLY';
}

export function TeacherIDCard({ faculty, session = '2026–2027', layoutMode = 'DUAL' }: TeacherIDCardProps) {
  const fName = `${faculty.first_name || 'Anita'} ${faculty.last_name || 'Sharma'}`.trim();
  const staffId = faculty.employee_id || `CBS/24-25/${(faculty.id || '078').slice(-3).padStart(3, '0')}`;
  const designation = faculty.designation || (faculty.department ? `TGT - ${faculty.department.toUpperCase()}` : 'TGT - ENGLISH');
  const address = faculty.address || '6/20 D-Block Shastri Park Extn. Burari Delhi 110084';
  const phone = '9811102008';
  const website = 'www.crayonboxschool.com';
  const motto = 'Excellence in Education. Values for Life.';

  // Format joining date
  let formattedJoining = '01 APR 2023';
  if (faculty.joining_date) {
    if (faculty.joining_date instanceof Date) {
      formattedJoining = faculty.joining_date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    } else if (typeof faculty.joining_date === 'string') {
      try {
        const d = new Date(faculty.joining_date);
        if (!isNaN(d.getTime())) {
          formattedJoining = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        } else {
          formattedJoining = faculty.joining_date.toUpperCase();
        }
      } catch {
        formattedJoining = faculty.joining_date.toUpperCase();
      }
    }
  }

  const showFront = layoutMode === 'DUAL' || layoutMode === 'FRONT_ONLY';
  const showBack = layoutMode === 'DUAL' || layoutMode === 'BACK_ONLY';

  return (
    <div className="flex flex-wrap gap-6 items-center justify-center p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 print:p-0 print:bg-white print:border-none font-sans max-w-full">
      
      {/* ========================================================================= */}
      {/* 🌟 FRONT SIDE OF TEACHER CR80 CARD (54mm × 85.6mm)                        */}
      {/* ========================================================================= */}
      {showFront && (
        <div className="w-[260px] h-[412px] print:w-[54mm] print:h-[85.6mm] bg-white rounded-3xl shadow-xl border border-slate-300 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-800 text-slate-900 shrink-0 select-none text-center">
          
          {/* Top Curved Navy Arc */}
          <div className="bg-[#0A2558] h-24 flex items-end justify-center pb-2 relative overflow-visible">
            <div className="w-18 h-18 rounded-full bg-white border-2 border-amber-500 p-1 flex items-center justify-center absolute -bottom-7 shadow-md z-10">
              <img src="/trust-logo.png" alt="Crayon Box School" className="w-14 h-14 object-contain" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
          </div>

          {/* School Brand Typography */}
          <div className="mt-8 px-2">
            <h1 className="text-base font-black tracking-wider text-[#0A2558] leading-tight">CRAYON BOX</h1>
            <div className="text-[10px] font-extrabold text-red-600 tracking-widest uppercase">— S C H O O L —</div>
            <div className="text-[7.5px] font-bold text-slate-500 tracking-wider mt-0.5">LEARN • GROW • SHINE</div>
          </div>

          {/* Teacher Circular Portrait with Laurel Leaf Watermark background */}
          <div className="mt-2 flex justify-center relative">
            <div className="w-20 h-20 rounded-full bg-slate-900 border-2.5 border-[#0A2558] overflow-hidden shadow-sm flex items-center justify-center">
              {faculty.photo_url ? (
                <img src={faculty.photo_url} alt={fName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-amber-300 font-black text-xl">
                  {fName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Teacher Name Solid Navy Banner */}
          <div className="mt-2 mx-auto bg-[#0A2558] text-white px-5 py-1 rounded-xl text-xs font-black tracking-wide shadow-2xs max-w-[220px] truncate">
            {fName.toUpperCase()}
          </div>

          {/* Designation Ribbon Badge */}
          <div className="mt-1 flex items-center justify-center">
            <div className="w-2.5 h-4.5 bg-red-600 rounded-l-sm -mr-0.5" />
            <div className="bg-amber-500 text-white text-[10px] font-black px-4 py-0.5 rounded-xs z-2 uppercase">
              {designation}
            </div>
            <div className="w-2.5 h-4.5 bg-red-600 rounded-r-sm -ml-0.5" />
          </div>

          {/* Staff ID Subtitle */}
          <div className="mt-1 text-[10px] font-bold text-[#0A2558]">
            STAFF ID : <span className="text-red-600 font-black font-mono">{staffId}</span>
          </div>

          {/* 3-Column Verification Section */}
          <div className="my-2 mx-3 grid grid-cols-3 gap-1 bg-slate-50/90 rounded-xl p-1.5 border border-slate-200 text-center">
            {/* Col 1: Employee ID */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-[#0A2558] text-white flex items-center justify-center mb-0.5">
                <User className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[6.5px] font-bold text-slate-500 uppercase leading-none">EMPLOYEE ID</span>
              <span className="text-[7.5px] font-black text-red-600 font-mono mt-0.5 truncate max-w-full">{staffId}</span>
            </div>

            {/* Col 2: Joining Date */}
            <div className="flex flex-col items-center border-x border-slate-200 px-0.5">
              <div className="w-5 h-5 rounded-full bg-[#0A2558] text-white flex items-center justify-center mb-0.5">
                <Calendar className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[6.5px] font-bold text-slate-500 uppercase leading-none">JOINING DATE</span>
              <span className="text-[7.5px] font-black text-red-600 font-mono mt-0.5 truncate max-w-full">{formattedJoining}</span>
            </div>

            {/* Col 3: Signature */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-[#0A2558] text-white flex items-center justify-center mb-0.5">
                <span className="text-[7px] font-serif italic font-bold">You</span>
              </div>
              <span className="text-[6.5px] font-bold text-slate-500 uppercase leading-none">SIGNATURE</span>
              <div className="mt-0.5">
                <span className="font-serif italic text-[8.5px] font-bold text-[#0A2558] leading-none">Poulami</span>
                <div className="w-10 h-px bg-slate-400 mx-auto" />
              </div>
            </div>
          </div>

          {/* Bottom Solid Navy Footer (2 Columns) */}
          <div className="bg-[#0A2558] text-white py-2 px-3 border-t-2 border-amber-500 flex items-center justify-between mt-auto text-left">
            <div className="flex-1 text-[7px] space-y-0.5 text-slate-200">
              <div className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span className="truncate max-w-[150px]">{address}</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <Phone className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span>{website}</span>
              </div>
            </div>

            <div className="w-px h-7 bg-white/20 mx-2" />

            <div className="text-center w-24">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-[6.5px] font-semibold text-amber-300 block leading-tight">
                {motto}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 BACK SIDE OF TEACHER CR80 CARD (54mm × 85.6mm)                         */}
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

          {/* Teacher Key-Value Details Grid */}
          <div className="px-4 py-2 space-y-1.5 text-[9.5px]">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-0.5">
              <div className="w-4.5 h-4.5 rounded-full bg-[#0A2558] text-white flex items-center justify-center shrink-0">
                <User className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="w-24 text-slate-500 font-semibold text-[9px]">Name</span>
              <span className="text-slate-400">:</span>
              <span className="font-bold text-slate-900 truncate text-[9.5px]">{fName}</span>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-0.5">
              <div className="w-4.5 h-4.5 rounded-full bg-[#0A2558] text-white flex items-center justify-center shrink-0">
                <Briefcase className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="w-24 text-slate-500 font-semibold text-[9px]">Designation</span>
              <span className="text-slate-400">:</span>
              <span className="font-bold text-slate-900 truncate text-[9.5px]">{designation}</span>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-0.5">
              <div className="w-4.5 h-4.5 rounded-full bg-[#0A2558] text-white flex items-center justify-center shrink-0">
                <CreditCard className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="w-24 text-slate-500 font-semibold text-[9px]">Staff ID</span>
              <span className="text-slate-400">:</span>
              <span className="font-black text-slate-900 font-mono text-[9px]">{staffId}</span>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-0.5">
              <div className="w-4.5 h-4.5 rounded-full bg-[#0A2558] text-white flex items-center justify-center shrink-0">
                <Calendar className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="w-24 text-slate-500 font-semibold text-[9px]">Date of Joining</span>
              <span className="text-slate-400">:</span>
              <span className="font-bold text-slate-900 font-mono text-[9px]">{formattedJoining}</span>
            </div>
          </div>

          {/* Instructions Box with 4 Chevrons */}
          <div className="mx-3.5 my-1 border border-[#0A2558] bg-slate-50/80 rounded-xl p-2.5 relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#0A2558] text-white text-[7px] font-black px-2.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1">
              <span className="text-amber-400">◆</span>
              <span>INSTRUCTIONS</span>
              <span className="text-amber-400">◆</span>
            </div>
            <div className="space-y-0.5 mt-1 text-[7.5px] text-slate-800 font-medium">
              <div className="flex items-start gap-1">
                <ChevronRight className="w-2.5 h-2.5 text-red-600 shrink-0 mt-0.5" />
                <span>This card is the property of Crayon Box School.</span>
              </div>
              <div className="flex items-start gap-1">
                <ChevronRight className="w-2.5 h-2.5 text-red-600 shrink-0 mt-0.5" />
                <span>This card must be worn during school hours.</span>
              </div>
              <div className="flex items-start gap-1">
                <ChevronRight className="w-2.5 h-2.5 text-red-600 shrink-0 mt-0.5" />
                <span>In case of loss, inform the school immediately.</span>
              </div>
              <div className="flex items-start gap-1">
                <ChevronRight className="w-2.5 h-2.5 text-red-600 shrink-0 mt-0.5" />
                <span>If found, please return to the school office.</span>
              </div>
            </div>
          </div>

          {/* Bottom Solid Navy Footer (2 Columns) */}
          <div className="bg-[#0A2558] text-white py-2 px-3 border-t-2 border-amber-500 flex items-center justify-between mt-auto text-left">
            <div className="flex-1 text-[7px] space-y-0.5 text-slate-200">
              <div className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span className="truncate max-w-[150px]">{address}</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <Phone className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span>{website}</span>
              </div>
            </div>

            <div className="w-px h-7 bg-white/20 mx-2" />

            <div className="text-center w-24">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-[6.5px] font-semibold text-amber-300 block leading-tight">
                {motto}
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
