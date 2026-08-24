"use client";

import React from 'react';
import { QrCode, Phone, MapPin, Bus, Heart, ShieldCheck, GraduationCap } from 'lucide-react';
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
  const sName = `${student.first_name || ''} ${student.middle_name ? `${student.middle_name} ` : ''}${student.last_name || student.lastName || ''}`.trim();
  const admNo = student.admission_number || student.admission_no || 'CBS-2026-0042';
  const uId = student.universal_id || 'STU-VET-000042';
  const instCode = student.institution_code || 'CBS';
  const fullSchoolName = instCode === 'AVM' ? 'AVINYA VIDYA MANDIR' : instCode === 'AS' ? 'AVINYA SCHOOL' : instCode === 'CBPS' ? 'CRAYON BOX PRE SCHOOL' : 'CRAYON BOX SCHOOL';

  // Safe DOB string formatting
  let formattedDob = '14-04-2016';
  if (student.dob) {
    if (student.dob instanceof Date) {
      formattedDob = student.dob.toISOString().split('T')[0];
    } else if (typeof student.dob === 'string') {
      formattedDob = student.dob.split('T')[0];
    } else {
      formattedDob = String(student.dob);
    }
  }

  const showFront = layoutMode === 'DUAL' || layoutMode === 'FRONT_ONLY';
  const showBack = layoutMode === 'DUAL' || layoutMode === 'BACK_ONLY';

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 print:p-0 print:bg-white print:border-none font-sans max-w-full">
      
      {/* 🌟 FRONT OF PVC CARD (Standard ISO/IEC 7810 ID-1 / CR80: 53.98mm × 85.60mm) */}
      {showFront && (
        <div className="w-[240px] h-[380px] bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-800 text-slate-900 shrink-0 select-none">
          
          {/* Top Header */}
          <div className="bg-slate-900 text-white py-2 px-2.5 text-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-12 h-12 bg-indigo-600/30 rounded-full blur-xs" />
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-[9px]">
                <GraduationCap className="w-3 h-3 text-slate-900" />
              </div>
              <h3 className="font-black text-[10px] uppercase tracking-wider truncate">{fullSchoolName}</h3>
            </div>
            <span className="text-[7.5px] font-bold text-indigo-300 block uppercase tracking-widest mt-0.5">
              Student Identity Card • {session}
            </span>
          </div>

          {/* Center: Photo & Name */}
          <div className="px-3 flex flex-col items-center text-center space-y-1.5 my-auto">
            
            {/* Photo Frame */}
            <div className="w-16 h-16 rounded-xl bg-slate-800 text-white font-black text-lg flex items-center justify-center overflow-hidden border-2 border-indigo-600 shadow-sm">
              {student.photo_url ? (
                <img src={student.photo_url} alt={sName} className="w-full h-full object-cover" />
              ) : (
                <span>{student.first_name?.[0]}{student.last_name?.[0]}</span>
              )}
            </div>

            <div className="space-y-0.5">
              <h2 className="text-[11px] font-black text-slate-900 leading-tight uppercase truncate max-w-[210px]">{sName}</h2>
              <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-[8.5px] border border-indigo-200 inline-block">
                {uId}
              </span>
            </div>

            {/* Class & Section Banner */}
            <div className="w-full bg-indigo-600 text-white py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
              {student.class_name || 'Class 4'} — Section {student.section_name || 'A'} • Roll #{student.roll_number || '1'}
            </div>

            {/* Quick Details + Front Gate QR */}
            <div className="w-full grid grid-cols-12 gap-1.5 text-[7.5px] text-left pt-0.5 items-center">
              
              {/* Left 7 Cols: Demographics */}
              <div className="col-span-7 space-y-0.5">
                <div className="bg-slate-50 p-1 rounded-md border border-slate-200">
                  <span className="text-slate-400 block text-[6.5px] font-medium">Admission No</span>
                  <strong className="font-mono text-slate-900 text-[8.5px] block truncate">{admNo}</strong>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-slate-50 p-0.5 px-1 rounded-md border border-slate-200">
                    <span className="text-slate-400 block text-[6.5px]">Blood</span>
                    <strong className="text-rose-600 font-bold text-[7.5px]">{student.blood_group || 'O+'}</strong>
                  </div>
                  <div className="bg-slate-50 p-0.5 px-1 rounded-md border border-slate-200">
                    <span className="text-slate-400 block text-[6.5px]">DOB</span>
                    <strong className="text-slate-800 text-[7.5px] truncate block">{formattedDob}</strong>
                  </div>
                </div>
                <div className="bg-slate-50 p-0.5 px-1 rounded-md border border-slate-200">
                  <span className="text-slate-400 block text-[6.5px]">Emergency</span>
                  <strong className="text-slate-800 font-mono text-[7.5px] block truncate">{student.guardian_phone || '9810011001'}</strong>
                </div>
              </div>

              {/* Right 5 Cols: Front Gate QR Code */}
              <div className="col-span-5 flex flex-col items-center justify-center p-1 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <StudentQRCode
                  payload={`VET:STU:${uId}:${student.id}:${instCode}:${admNo}`}
                  size={58}
                />
                <span className="text-[6px] font-black uppercase text-indigo-900 tracking-wider mt-0.5 block">
                  ⚡ GATE QR
                </span>
              </div>

            </div>

          </div>

          {/* Bottom Bar: Hologram + Principal Signature */}
          <div className="border-t border-slate-200 bg-slate-50 px-2.5 py-1 flex items-center justify-between text-[7px] text-slate-500 font-bold">
            <div className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
              <span>CR80 PVC</span>
            </div>
            <div className="text-center">
              <div className="h-2.5 border-b border-dashed border-slate-400 w-12 mb-0.5" />
              <span className="text-[6.5px] uppercase tracking-wider text-slate-800">Principal</span>
            </div>
          </div>

        </div>
      )}

      {/* 🌟 BACK OF PVC CARD */}
      {showBack && (
        <div className="w-[240px] h-[380px] bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-800 text-slate-900 shrink-0 select-none">
          
          <div className="bg-slate-900 text-white py-1.5 px-2.5 text-center">
            <span className="text-[7.5px] font-bold uppercase tracking-widest text-indigo-300">
              Emergency & Transport Telematics
            </span>
          </div>

          <div className="p-3 space-y-1.5 text-[8px] my-auto">
            
            {/* Guardian Information */}
            <div className="space-y-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-400 uppercase block text-[7px]">Parent Contact</span>
              <div className="font-bold text-slate-900 truncate">
                Father: {student.father_name || (student.guardian_first ? `${student.guardian_first} ${student.guardian_last || ''}` : 'Mr. Rajesh Sharma')}
              </div>
              <div className="text-slate-700 truncate">
                Mother: {student.mother_name || 'Mrs. Priya Sharma'}
              </div>
              <div className="font-mono text-indigo-700 font-bold pt-0.5 text-[8px]">
                📞 {student.guardian_phone || '9810011001'}
              </div>
            </div>

            {/* Transport Details */}
            <div className="space-y-0.5 bg-amber-50/80 p-1.5 rounded-lg border border-amber-200 text-amber-950 text-[7.5px]">
              <span className="font-bold text-amber-800 uppercase block text-[6.5px]">Transport Telematics</span>
              <div className="font-bold truncate">
                🚌 {student.transport_mode ? student.transport_mode.replace('_', ' ') : 'SCHOOL BUS'}
              </div>
              <div className="truncate">
                {student.transport_route || 'Shastri Park Express'} ({student.transport_bus_no || 'Bus #04'})
              </div>
            </div>

            {/* Residential Address */}
            <div className="space-y-0.5 text-slate-700 text-[7px]">
              <span className="font-bold text-slate-400 uppercase block text-[6.5px]">Residential Address</span>
              <p className="leading-tight line-clamp-2">
                {student.primary_address || 'Lotus Court, Shastri Park Extn. Delhi-110084'}
              </p>
            </div>

            {/* QR Code Block */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block text-[7.5px]">Gate QR Tap</span>
                <span className="text-[6.5px] text-slate-500">Scan for Attendance</span>
              </div>
              <StudentQRCode
                payload={`VET:STU:${uId}:${student.id}:${instCode}:${admNo}`}
                size={48}
              />
            </div>

          </div>

          {/* Footer Instructions */}
          <div className="bg-slate-100 p-1.5 text-center text-[6.5px] text-slate-500 border-t border-slate-200 leading-tight">
            Return to School Reception if found • +91 9811102008
          </div>

        </div>
      )}

    </div>
  );
}
