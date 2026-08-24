"use client";

import React from 'react';
import { ShieldCheck, GraduationCap, Building2, UserCheck } from 'lucide-react';
import { StudentQRCode } from './StudentQRCode';

export interface TeacherIDCardProps {
  faculty: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    designation: string;
    department: string;
    photo_url?: string;
    institution_code?: string;
    blood_group?: string;
    epf_uan_no?: string;
    pan_no?: string;
  };
  session?: string;
  layoutMode?: 'DUAL' | 'FRONT_ONLY' | 'BACK_ONLY';
}

export function TeacherIDCard({ faculty, session = '2026–2027', layoutMode = 'DUAL' }: TeacherIDCardProps) {
  const fName = `${faculty.first_name} ${faculty.last_name}`;
  const instCode = faculty.institution_code || 'CBS';
  const fullSchoolName = instCode === 'AVM' ? 'AVINYA VIDYA MANDIR' : instCode === 'AS' ? 'AVINYA SCHOOL' : instCode === 'CBPS' ? 'CRAYON BOX PRE SCHOOL' : 'CRAYON BOX SCHOOL';

  const showFront = layoutMode === 'DUAL' || layoutMode === 'FRONT_ONLY';
  const showBack = layoutMode === 'DUAL' || layoutMode === 'BACK_ONLY';

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 print:p-0 print:bg-white print:border-none font-sans max-w-full">
      
      {/* 🌟 FRONT OF FACULTY PVC CARD (Standard ISO/IEC 7810 ID-1 / CR80: 53.98mm × 85.60mm) */}
      {showFront && (
        <div className="w-[240px] h-[380px] bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-800 text-slate-900 shrink-0 select-none">
          
          {/* Top Header */}
          <div className="bg-slate-900 text-white py-2 px-2.5 text-center relative overflow-hidden">
            <div className="absolute -left-4 -top-4 w-12 h-12 bg-emerald-600/30 rounded-full blur-xs" />
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px]">
                <GraduationCap className="w-3 h-3 text-white" />
              </div>
              <h3 className="font-black text-[10px] uppercase tracking-wider truncate">{fullSchoolName}</h3>
            </div>
            <span className="text-[7.5px] font-bold text-emerald-300 block uppercase tracking-widest mt-0.5">
              Faculty & Staff ID • {session}
            </span>
          </div>

          {/* Center: Photo & Details */}
          <div className="px-3 flex flex-col items-center text-center space-y-1.5 my-auto">
            
            {/* Faculty Photo */}
            <div className="w-16 h-16 rounded-xl bg-slate-800 text-white font-black text-lg flex items-center justify-center overflow-hidden border-2 border-emerald-600 shadow-sm">
              {faculty.photo_url ? (
                <img src={faculty.photo_url} alt={fName} className="w-full h-full object-cover" />
              ) : (
                <span>{faculty.first_name?.[0]}{faculty.last_name?.[0]}</span>
              )}
            </div>

            <div className="space-y-0.5">
              <h2 className="text-[11px] font-black text-slate-900 leading-tight uppercase truncate max-w-[210px]">{fName}</h2>
              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-bold text-[8.5px] border border-emerald-200 inline-block truncate max-w-[200px]">
                {faculty.designation}
              </span>
            </div>

            {/* Department Highlight */}
            <div className="w-full bg-slate-900 text-white py-0.5 rounded-lg text-[8.5px] font-bold uppercase tracking-wider truncate px-1">
              {faculty.department}
            </div>

            {/* Quick Metrics + Front QR Code */}
            <div className="w-full grid grid-cols-12 gap-1.5 text-[7.5px] text-left pt-0.5 items-center">
              <div className="col-span-7 space-y-0.5">
                <div className="bg-slate-50 p-1 rounded-md border border-slate-200">
                  <span className="text-slate-400 block text-[6.5px] font-medium">Employee Code</span>
                  <strong className="font-mono text-slate-900 text-[8.5px] block truncate">EMP-{faculty.id.slice(0, 6).toUpperCase()}</strong>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-slate-50 p-0.5 px-1 rounded-md border border-slate-200">
                    <span className="text-slate-400 block text-[6.5px]">Campus</span>
                    <strong className="text-slate-900 text-[7.5px]">{instCode}</strong>
                  </div>
                  <div className="bg-slate-50 p-0.5 px-1 rounded-md border border-slate-200">
                    <span className="text-slate-400 block text-[6.5px]">Blood</span>
                    <strong className="text-rose-600 font-bold text-[7.5px]">{faculty.blood_group || 'B+'}</strong>
                  </div>
                </div>
                <div className="bg-slate-50 p-0.5 px-1 rounded-md border border-slate-200">
                  <span className="text-slate-400 block text-[6.5px]">Phone</span>
                  <strong className="text-slate-800 font-mono text-[7.5px] block truncate">{faculty.phone_number || '9811000001'}</strong>
                </div>
              </div>

              {/* Right 5 Cols: Front Staff QR Code */}
              <div className="col-span-5 flex flex-col items-center justify-center p-1 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <StudentQRCode
                  payload={`VET:STAFF:${faculty.id}:${instCode}:${faculty.email}`}
                  size={58}
                />
                <span className="text-[6px] font-black uppercase text-emerald-900 tracking-wider mt-0.5 block">
                  ⚡ MUSTER QR
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Security Hologram + Authorized Signatory */}
          <div className="border-t border-slate-200 bg-slate-50 px-2.5 py-1 flex items-center justify-between text-[7px] text-slate-500 font-bold">
            <div className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
              <span>CR80 PVC</span>
            </div>
            <div className="text-center">
              <div className="h-2.5 border-b border-dashed border-slate-400 w-12 mb-0.5" />
              <span className="text-[6.5px] uppercase tracking-wider text-slate-800">Director</span>
            </div>
          </div>

        </div>
      )}

      {/* 🌟 BACK OF FACULTY PVC CARD */}
      {showBack && (
        <div className="w-[240px] h-[380px] bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-800 text-slate-900 shrink-0 select-none">
          
          <div className="bg-slate-900 text-white py-1.5 px-2.5 text-center">
            <span className="text-[7.5px] font-bold uppercase tracking-widest text-emerald-300">
              Official Credentials & Biometric Pass
            </span>
          </div>

          <div className="p-3 space-y-1.5 text-[8px] my-auto">
            
            <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[7.5px]">
              <span className="font-bold text-slate-400 uppercase block text-[6.5px]">Official Credentials</span>
              <div className="truncate"><strong>Email:</strong> <span className="font-mono text-slate-900">{faculty.email}</span></div>
              <div className="truncate"><strong>Designation:</strong> {faculty.designation}</div>
              <div className="truncate"><strong>Department:</strong> {faculty.department}</div>
            </div>

            <div className="space-y-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-[7.5px]">
              <span className="font-bold text-slate-400 uppercase block text-[6.5px]">Statutory Compliance</span>
              <div className="flex justify-between">
                <span>EPF UAN:</span>
                <strong className="font-mono text-[7px]">100987654321</strong>
              </div>
              <div className="flex justify-between">
                <span>PAN Number:</span>
                <strong className="font-mono text-[7px]">ABCDE1234F</strong>
              </div>
            </div>

            {/* QR Code Block */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block text-[7.5px]">Biometric Attendance</span>
                <span className="text-[6.5px] text-slate-500">Muster Roll Scan</span>
              </div>
              <StudentQRCode
                payload={`VET:STAFF:${faculty.id}:${instCode}:${faculty.email}`}
                size={48}
              />
            </div>

          </div>

          {/* Footer Instructions */}
          <div className="bg-slate-100 p-1.5 text-center text-[6.5px] text-slate-500 border-t border-slate-200 leading-tight">
            Vani Educational Trust • Return to Admin HQ if found
          </div>

        </div>
      )}

    </div>
  );
}
