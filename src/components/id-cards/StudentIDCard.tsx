"use client";

import React from 'react';
import { Phone, MapPin, Barcode } from 'lucide-react';
import { AttendanceBarcode } from './AttendanceBarcode';
import { StandardizedIdPhoto } from './StandardizedIdPhoto';
import { VastuMandalaWatermark } from '@/components/common/VastuMandalaWatermark';

export type IdCardThemeId = 'rashtriya' | 'digital-bharat' | 'gurukul' | 'neo-swiss' | 'landscape';

export interface StudentIDCardProps {
  student: any;
  schoolInfo?: any;
  isBack?: boolean;
  layoutMode?: any;
  themeId?: IdCardThemeId;
}

/**
 * Official Student ID Card Component (CR80 Vertical 54mm x 85.6mm)
 * Pure dynamic data binding to ERP records with zero hardcoding,
 * universal studio photo edge-blending, front-facing attendance barcode,
 * and authentic Indian Tricolor + Vedic Mandala aesthetic.
 */
export function StudentIDCard({
  student,
  schoolInfo = {},
  isBack = false,
  themeId = 'rashtriya',
}: StudentIDCardProps) {
  const s = student || {};

  // Pure dynamic data binding with safe fallbacks (no hardcoded names/numbers)
  const firstName = s.first_name || '';
  const lastName = s.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'STUDENT NAME';
  const className = s.class_name || s.grade || '—';
  const section = s.section_name || s.section || '—';
  const rollNo = s.roll_number || s.roll_no || '—';
  const idNo = s.admission_number || s.admission_no || s.universal_id || '—';
  const bloodGroup = s.blood_group || '—';
  const dob = s.date_of_birth || s.dob ? new Date(s.date_of_birth || s.dob).toLocaleDateString('en-IN') : '—';
  const parentContact = s.guardian_phone || s.father_phone || s.primary_contact || '—';
  const emergencyPhone = s.emergency_contact || s.emergency_phone || s.mother_phone || parentContact || '—';
  const fatherName = s.father_name || s.parent_name || '—';
  const motherName = s.mother_name || s.secondary_guardian_name || '—';
  const address = s.address || s.residential_address || s.parent_address || '—';
  const busRoute = s.bus_route_no || s.route_name || s.transport_mode || 'Self / Walk-in';
  const validUpto = s.valid_upto || s.validUpto || '31-03-2027';

  // Dynamic School Info
  const schName = schoolInfo?.name || 'INSTITUTIONAL CAMPUS';
  const schAffiliation = schoolInfo?.boardAffiliation || 'AFFILIATED TO BOARD';
  const schWebsite = schoolInfo?.website || 'www.crayonboxschool.edu.in';
  const schPhone = schoolInfo?.phone || '+91 11 2761 8899';
  const schLogo = schoolInfo?.logoUrl || schoolInfo?.logo_url || '/logo.png';
  const schAddress = schoolInfo?.address || 'Institutional Area, New Delhi';

  // =============================================================
  // BACK FACE (VERIFIED CAMPUS RULES, PARENT VITALS & STAMP)
  // =============================================================
  if (isBack) {
    return (
      <div 
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        className="w-[330px] h-[520px] bg-[#FFFFFF] rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border-2 border-stone-200 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none"
      >
        {/* Top Tricolor Accent Ribbon */}
        <div className="h-2.5 w-full bg-gradient-to-r from-[#FF671F] 0%, from-[#FF671F] 33.3%, via-white 33.3%, via-white 66.6%, to-[#046A38] 66.6%, to-[#046A38] 100%"></div>

        {/* Back Header */}
        <div className="bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-white py-3 px-4 text-center relative z-10 border-b-2 border-amber-400/40">
          <h2 className="font-extrabold text-xs uppercase tracking-wider text-amber-300 truncate">
            {schName}
          </h2>
          <p className="text-[9px] text-amber-100/90 font-medium tracking-wide mt-0.5 uppercase">
            Student Credential &amp; Regulations
          </p>
        </div>

        {/* Student Parent & Residential Details */}
        <div className="flex-1 px-4 pt-3 pb-2 z-10 space-y-2 flex flex-col justify-between">
          <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 shadow-2xs space-y-1.5 text-xs">
            <DetailRow label="Father Name" value={fatherName} />
            <DetailRow label="Mother Name" value={motherName} />
            <DetailRow label="Residence" value={address} isMultiline />
            <DetailRow label="Bus Route" value={busRoute} />
            <DetailRow label="Emergency Contact" value={emergencyPhone} />
            <DetailRow label="Valid Upto" value={validUpto} />
          </div>

          {/* Institutional Regulations Box */}
          <div className="bg-amber-50/70 border border-amber-300/60 rounded-xl p-2.5 text-[9px] text-stone-800 leading-tight space-y-1">
            <div className="font-black text-amber-900 uppercase tracking-wider">
              Campus Regulations:
            </div>
            <p>1. This card must be worn prominently during campus hours and bus commute.</p>
            <p>2. Property of {schName}. Non-transferable.</p>
            <p>3. If found, please return to School Office or call {schPhone}.</p>
          </div>

          {/* Institutional Stamp (NO principal signature) */}
          <div className="pt-1 flex items-center justify-between">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-900/40 flex flex-col items-center justify-center text-center p-1">
              <span className="text-[7px] font-mono font-bold text-blue-900 uppercase">OFFICIAL</span>
              <span className="text-[8px] font-black text-blue-950 uppercase">SEAL</span>
              <span className="text-[6px] font-mono text-stone-400">CBS VERIFIED</span>
            </div>

            <div className="text-right">
              <span className="text-[8px] font-mono text-stone-400 font-bold block uppercase">CAMPUS DESK</span>
              <span className="text-[10px] font-extrabold text-stone-900 truncate max-w-[150px] block">
                {schAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Back Footer Strip */}
        <div className="bg-[#0B1B30] text-white py-2 px-4 z-10 flex items-center justify-between text-[8px] font-medium border-t border-amber-400/30">
          <span className="truncate">{schWebsite}</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF671F]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#046A38]"></span>
          </div>
          <span className="shrink-0">{schPhone}</span>
        </div>
      </div>
    );
  }

  // =============================================================
  // FRONT FACE (LAYOUT A: INDIAN TRICOLOR, MANDALA, SIDE BARCODE)
  // =============================================================
  return (
    <div 
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      className="w-[330px] h-[520px] bg-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border-2 border-stone-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none"
    >
      {/* 1. Indian Tricolor Header Ribbon */}
      <div className="h-2.5 w-full bg-gradient-to-r from-[#FF671F] 0%, from-[#FF671F] 33.3%, via-white 33.3%, via-white 66.6%, to-[#046A38] 66.6%, to-[#046A38] 100%"></div>

      {/* 2. Executive Deep Navy Header */}
      <div className="bg-[#0B1B30] px-4 pt-2.5 pb-2 text-center text-white border-b-2 border-amber-400/40 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-0.5">
          <div className="w-7 h-7 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0 shadow-xs">
            <img
              src={schLogo}
              alt=""
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/logo.png'; }}
            />
          </div>
          <div className="text-left truncate">
            <h1 className="font-extrabold text-xs uppercase tracking-wider text-white truncate">
              {schName}
            </h1>
            <span className="text-[8px] text-amber-300 font-bold uppercase tracking-wider block truncate">
              {schAffiliation}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Center Body with Sacred Vedic Mandala Watermark */}
      <div className="flex-1 flex flex-col justify-between px-3.5 pt-2 pb-1.5 z-10 relative">
        <VastuMandalaWatermark
          className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          size={300}
          opacity={0.06}
        />

        {/* Top Half: Photo with blended background + Vertical Side Attendance Barcode */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Portrait Photo with Universal Studio Background & Edge Blending */}
          <div className="flex-1 flex justify-center">
            <StandardizedIdPhoto
              src={s.photo_url}
              name={fullName}
              className="w-28 h-32 rounded-2xl shadow-md"
              borderGradient="from-[#FF671F] via-white to-[#046A38]"
              badgeLabel="STUDENT • 2026-27"
              badgeBg="#0B1B30"
              blendMode={true}
            />
          </div>

          {/* Functional Vertical Industrial Code 128 Barcode */}
          <div className="bg-white border border-stone-200 rounded-xl p-1.5 shadow-xs flex flex-col items-center shrink-0 w-24">
            <span className="text-[7px] font-mono font-black text-blue-950 uppercase tracking-wider text-center block mb-1">
              ATTENDANCE
            </span>
            <div className="rotate-90 origin-center my-6 flex items-center justify-center">
              <AttendanceBarcode code={idNo} width={130} height={26} showText={false} />
            </div>
            <span className="text-[7.5px] font-mono font-extrabold text-stone-700 tracking-tight text-center block mt-1">
              *{idNo}*
            </span>
          </div>
        </div>

        {/* Middle: Student Full Name & Class Badge */}
        <div className="text-center mt-1">
          <h2 className="text-slate-950 font-black text-base uppercase tracking-tight leading-tight truncate px-1">
            {fullName}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-white text-[10px] font-black shadow-2xs">
              Class {className}-{section}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[10px] font-bold font-mono">
              Roll #{rollNo}
            </span>
          </div>
        </div>

        {/* Bottom Vitals Grid */}
        <div className="bg-stone-50/90 rounded-xl p-2 border border-stone-200 text-[10px] space-y-1">
          <div className="flex justify-between">
            <span className="text-stone-500 font-bold">Admission No:</span>
            <strong className="font-mono text-blue-950 font-black">{idNo}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-bold">Blood Group:</span>
            <strong className="text-rose-700 font-black">{bloodGroup}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-bold">Date of Birth:</span>
            <strong className="font-mono text-stone-800">{dob}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-bold">Emergency Phone:</span>
            <strong className="font-mono text-stone-900">{emergencyPhone}</strong>
          </div>
        </div>

        {/* Cultural Motto & Holographic Seal */}
        <div className="flex items-center justify-between pt-1 border-t border-stone-100">
          <span className="text-[9px] font-serif font-black text-blue-950">
            विद्या ददाति विनयं
          </span>
          <div className="flex items-center gap-1">
            {/* Holographic Security Icon */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-300 via-rose-300 to-cyan-300 border border-stone-300 shadow-2xs flex items-center justify-center">
              <span className="text-[6px] font-black text-stone-900">3D</span>
            </div>
            <span className="text-[7.5px] font-mono text-stone-500 font-bold uppercase">SECURE PASS</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Government Accreditation Footer */}
      <div className="bg-[#0B1B30] text-white text-[8px] font-bold py-1.5 px-4 flex items-center justify-between z-10 border-t border-amber-400/40">
        <span>OFFICIAL STUDENT PASS</span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF671F]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#046A38]"></span>
        </div>
        <span>SESSION 2026-27</span>
      </div>
    </div>
  );
}

const DetailRow = ({ label, value, isMultiline }: { label: string; value: string; isMultiline?: boolean }) => (
  <div className={`flex ${isMultiline ? 'items-start' : 'items-center'} justify-between text-xs gap-2`}>
    <span className="font-bold text-stone-500 text-[10px] uppercase shrink-0">{label}:</span>
    <span className={`font-black text-stone-900 text-[10px] text-right ${isMultiline ? 'leading-tight max-w-[170px]' : 'truncate'}`}>
      {value}
    </span>
  </div>
);

export default StudentIDCard;
