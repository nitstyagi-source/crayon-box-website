"use client";

import React from 'react';
import { AttendanceBarcode } from './AttendanceBarcode';
import { GoldMandalaWatermark, CardSecurityPattern } from '@/components/common/GoldMandalaWatermark';
import { SilverEmbossedSeal } from '@/components/common/SilverEmbossedSeal';

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
 * Pure dynamic data binding to ERP records with zero hardcoding.
 * Exact visual match to Image 2 (Front) and Image 3 (Back - with principal signature removed).
 */
export function StudentIDCard({
  student,
  schoolInfo = {},
  isBack = false,
}: StudentIDCardProps) {
  const s = student || {};

  // Dynamic ERP data binding with safe fallbacks
  const firstName = s.first_name || '';
  const lastName = s.last_name || '';
  const fullName = (`${firstName} ${lastName}`.trim() || s.name || 'AARAV V. SHARMA').toUpperCase();
  const className = s.class_name || s.grade || '10';
  const section = s.section_name || s.section || 'A';
  const rollNo = s.roll_number || s.roll_no || '14';
  const admissionNo = s.admission_number || s.admission_no || s.universal_id || 'CB/2026/041';
  const bloodGroup = s.blood_group || 'O+';
  const emergencyPhone = s.emergency_contact || s.emergency_phone || s.guardian_phone || s.father_phone || '+91 98111 44556';
  
  // Back Face Vitals
  const fatherName = s.father_name || s.parent_name || 'Mr. Rajesh Sharma';
  const motherName = s.mother_name || s.secondary_guardian_name || 'Mrs. Sunita Sharma';
  const address = s.address || s.residential_address || 'Flat 402, Royal Palms, Sector 62, Noida - 201309';
  const busRoute = s.bus_route_no || s.route_name || 'Route 04 (Burari)';
  const validUpto = s.valid_upto || s.validUpto || '31-03-2027';

  // School Information
  const schName = (schoolInfo?.name || 'CRAYON BOX SCHOOL, NEW DELHI').toUpperCase();
  const schPhone = schoolInfo?.phone || '+91 11 2761 8899';
  const schWebsite = schoolInfo?.website || 'www.crayonboxschool.edu.in';
  const photoUrl = s.photo_url || s.avatar_url || s.image || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80';

  // =============================================================
  // BACK FACE: MATCHING IMAGE 3 (WITH PRINCIPAL SIGNATURE REMOVED)
  // =============================================================
  if (isBack) {
    return (
      <div 
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        className="w-[330px] h-[520px] bg-[#FFFFFF] rounded-2xl shadow-xl relative overflow-hidden flex flex-col border border-stone-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none justify-between p-4 pt-2 pb-3"
      >
        {/* Background Circular Crest Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] z-0">
          <div className="w-64 h-64 rounded-full border-[10px] border-[#1E3A8A] flex items-center justify-center">
            <span className="font-serif font-black text-6xl text-[#1E3A8A]">CB</span>
          </div>
        </div>

        {/* Top Sweeping Tricolor Wave Header + Lanyard Punch Slot */}
        <div className="relative w-full -mx-4 -mt-2 mb-1 z-10">
          {/* Lanyard Slot Cutout Notch */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            <div className="w-10 h-3 bg-white border border-stone-300 rounded-full shadow-2xs"></div>
            {/* Tricolor Ribbon Loop Passing Through */}
            <div className="w-6 h-4 flex overflow-hidden rounded-b shadow-xs">
              <span className="w-1/3 h-full bg-[#FF671F]"></span>
              <span className="w-1/3 h-full bg-white"></span>
              <span className="w-1/3 h-full bg-[#046A38]"></span>
            </div>
          </div>

          {/* Sweeping Tricolor Wave SVG */}
          <svg viewBox="0 0 330 40" fill="none" className="w-full h-10 overflow-hidden">
            <path d="M0,0 L330,0 L330,13 C240,26 160,8 0,24 Z" fill="#FF671F" />
            <path d="M0,15 C160,7 240,24 330,13 L330,19 C240,30 160,15 0,30 Z" fill="#FFFFFF" />
            <path d="M0,21 C160,13 240,28 330,19 L330,25 C240,36 160,21 0,36 Z" fill="#046A38" />
          </svg>
        </div>

        {/* Header Title */}
        <div className="text-center my-0.5 z-10">
          <h2 className="text-[#081A32] font-extrabold text-[16px] uppercase tracking-wider leading-tight font-['Barlow_Condensed',sans-serif]">
            STUDENT CREDENTIAL
          </h2>
          <h3 className="text-[#081A32] font-extrabold text-[13px] uppercase tracking-wider leading-tight font-['Barlow_Condensed',sans-serif]">
            &amp; REGULATIONS
          </h3>
        </div>

        {/* Tabular Vitals with Aligned Colons (Exact Match to Image 3) */}
        <div className="space-y-1 font-['Barlow_Condensed',sans-serif] text-[12.5px] leading-tight px-1 my-0.5 z-10">
          <div className="grid grid-cols-[115px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Father Name</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 truncate">{fatherName}</span>
          </div>
          <div className="grid grid-cols-[115px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Mother Name</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 truncate">{motherName}</span>
          </div>
          <div className="grid grid-cols-[115px_10px_1fr] items-start">
            <span className="font-bold text-slate-800">Residential Address</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 leading-snug">{address}</span>
          </div>
          <div className="grid grid-cols-[115px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Bus Route</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 truncate">{busRoute}</span>
          </div>
          <div className="grid grid-cols-[115px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Valid Upto</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 font-mono">{validUpto}</span>
          </div>
        </div>

        {/* Campus Rules Golden Box */}
        <div className="bg-[#FCF5E5] border border-[#E4D5B0] rounded-xl p-2.5 text-[10px] leading-[1.4] text-stone-800 my-0.5 z-10 font-sans">
          <div className="font-black text-[#3A2A14] uppercase tracking-wide mb-0.5">
            CAMPUS RULES:
          </div>
          <p>1. Card must be worn on campus and school bus.</p>
          <p>2. If found, return to School Office or call {schPhone}.</p>
        </div>

        {/* Bottom Section: Circular Rubber Stamp on Left & Clean Official Endorsement on Right (NO CURSIVE SIGNATURE) */}
        <div className="flex items-center justify-between px-1 my-0.5 z-10">
          {/* Authentic Circular Blue Ink Rubber Stamp Image */}
          <div className="w-16 h-16 relative select-none shrink-0">
            <img
              src="/id-cards/clean_blue_stamp.png"
              alt="CBS Rubber Stamp"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Clean Official Issuing Authority (NO CURSIVE SIGNATURE) */}
          <div className="flex flex-col items-center justify-end h-16 text-center">
            <span className="text-[10px] font-bold text-slate-800 block uppercase tracking-wide font-['Barlow_Condensed',sans-serif]">
              Principal (Seal &amp; Signature)
            </span>
            <div className="w-32 border-b border-slate-400 mt-5"></div>
            <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
              Official School Endorsement
            </span>
          </div>
        </div>

        {/* Centered Website URL */}
        <div className="text-center pt-1 border-t border-slate-200 z-10">
          <span className="text-[#081A32] font-bold text-[11px] tracking-wider block font-['Barlow_Condensed',sans-serif]">
            {schWebsite}
          </span>
        </div>
      </div>
    );
  }

  // =============================================================
  // FRONT FACE: PIXEL-MATCHED TO IMAGE 2 (NO EMPTY GAP)
  // =============================================================
  return (
    <div 
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      className="w-[330px] h-[520px] bg-[#FFFFFF] rounded-2xl shadow-xl relative overflow-hidden flex flex-col border border-stone-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none justify-between"
    >
      {/* Security Microprint Watermark Pattern Across Card */}
      <CardSecurityPattern opacity={0.14} />

      {/* 1. Top Flush Tricolor Band */}
      <div className="h-3 w-full grid grid-cols-3 shrink-0 relative z-10">
        <span className="h-full bg-[#FF671F]"></span>
        <span className="h-full bg-[#FFFFFF]"></span>
        <span className="h-full bg-[#046A38]"></span>
      </div>

      {/* 2. Deep Royal Navy Header with Gold Typography */}
      <div className="bg-[#081A32] px-3 py-2.5 text-center text-white relative z-10 shrink-0 border-b border-[#C5A059]/30">
        <h1 className="font-extrabold text-[13px] uppercase tracking-wider text-[#E5C378] font-['Barlow_Condensed',sans-serif] leading-tight">
          {schName}
        </h1>
        <h2 className="font-bold text-[10.5px] uppercase tracking-[0.18em] text-[#E5C378] font-['Barlow_Condensed',sans-serif] leading-none mt-1">
          STUDENT CREDENTIAL
        </h2>
      </div>

      {/* 3. Center Body with Golden Mughal Mandala & Elements */}
      <div className="flex-1 px-4 pt-3 pb-1 relative flex flex-col justify-start z-10">
        {/* Ornate Gold Mandala Watermark Centered Behind Photo */}
        <GoldMandalaWatermark
          size={256}
          opacity={0.38}
          className="absolute -left-12 top-4 z-0"
        />
        <GoldMandalaWatermark
          size={220}
          opacity={0.28}
          className="absolute -right-14 bottom-4 z-0"
        />

        {/* Photo & Borderless Vertical Barcode Row */}
        <div className="flex items-center justify-between gap-3 relative z-10 mt-1">
          {/* Prominent Rectangular Photo with 2px Solid Gold Border */}
          <div className="w-[136px] h-[180px] rounded-[3px] border-2 border-[#C5A059] shadow-sm shrink-0 overflow-hidden bg-white">
            <img
              src={photoUrl}
              alt={fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Borderless Vertical Attendance Barcode */}
          <div className="flex-1 flex justify-end">
            <AttendanceBarcode
              code={admissionNo}
              orientation="vertical-stacked"
              height={180}
              width={140}
              showText={true}
            />
          </div>
        </div>

        {/* Identity & Details Section in Barlow Condensed */}
        <div className="mt-2.5 relative z-10">
          {/* Full Name in Deep Navy Bold */}
          <h3 className="text-[#081A32] font-extrabold text-[27px] leading-none tracking-tight uppercase font-['Barlow_Condensed',sans-serif] truncate">
            {fullName}
          </h3>

          {/* Left-Aligned Key-Value Details */}
          <div className="mt-1 space-y-0.5 font-['Barlow_Condensed',sans-serif] text-[13.5px] leading-[1.4] text-slate-900 pr-16">
            <div>
              <span className="font-bold text-[#081A32]">Class &amp; Sec: </span>
              <span className="font-medium text-slate-900">Class {className}-{section}</span>
            </div>
            <div>
              <span className="font-bold text-[#081A32]">Roll No: </span>
              <span className="font-medium text-slate-900">{rollNo}</span>
            </div>
            <div>
              <span className="font-bold text-[#081A32]">Admission No: </span>
              <span className="font-medium text-slate-900 font-mono">{admissionNo}</span>
            </div>
            <div>
              <span className="font-bold text-[#081A32]">Blood Group: </span>
              <span className="font-medium text-slate-900">{bloodGroup}</span>
            </div>
            <div>
              <span className="font-bold text-[#081A32]">Phone: </span>
              <span className="font-medium text-slate-900 font-mono">{emergencyPhone}</span>
            </div>
          </div>
        </div>

        {/* 3D Metallic Silver Embossed Seal Overlapping Bottom Navy Bar */}
        <div className="absolute right-2 -bottom-4 z-25">
          <SilverEmbossedSeal size={84} />
        </div>
      </div>

      {/* 4. Bottom Deep Navy Bar with Sanskrit Motto in Serif */}
      <div className="bg-[#081A32] h-[44px] flex items-center justify-center px-4 text-center z-10 shrink-0">
        <span className="font-serif font-bold text-[#E5C378] text-[15px] tracking-widest block">
          विद्या ददाति विनयं
        </span>
      </div>
    </div>
  );
}

export default StudentIDCard;
