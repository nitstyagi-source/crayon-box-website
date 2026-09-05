"use client";

import React from 'react';
import { AttendanceBarcode } from './AttendanceBarcode';

export type IdCardThemeId = 'rashtriya' | 'digital-bharat' | 'gurukul' | 'neo-swiss' | 'landscape';

export interface StudentIDCardProps {
  student: any;
  schoolInfo?: any;
  isBack?: boolean;
  layoutMode?: 'FRONT_ONLY' | 'BACK_ONLY' | 'DUAL' | 'both' | 'front' | 'back';
  themeId?: IdCardThemeId;
}

/**
 * Clean Vector Ashoka Chakra Component with 24 Radial Spokes & Central Lanyard Slot
 */
function TricolorBand({ className = '' }: { className?: string }) {
  return (
    <div className={`h-[18px] w-full grid grid-cols-3 relative shrink-0 overflow-hidden ${className}`}>
      {/* Saffron / Kesariya */}
      <div className="bg-[#FF9933]"></div>
      {/* White with Central Ashoka Chakra */}
      <div className="bg-white flex items-center justify-center relative">
        <div className="w-4 h-4 rounded-full border border-[#0B1B3D]/30 flex items-center justify-center p-[0.75px] bg-white shadow-2xs">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#0B1B3D]" fill="currentColor">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="5.5" />
            <circle cx="50" cy="50" r="10" fill="currentColor" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 38 * Math.cos((i * 15 * Math.PI) / 180)}
                y2={50 + 38 * Math.sin((i * 15 * Math.PI) / 180)}
                stroke="currentColor"
                strokeWidth="3.2"
              />
            ))}
          </svg>
        </div>
      </div>
      {/* India Green */}
      <div className="bg-[#138808]"></div>
    </div>
  );
}

/**
 * Gold Laurel Seal / School Emblem (Matching Reference Front Top-Left)
 */
function LaurelSeal({ logoUrl, schoolName }: { logoUrl?: string; schoolName?: string }) {
  return (
    <div className="w-[50px] h-[50px] relative shrink-0 flex items-center justify-center select-none">
      {/* Laurel Wreath SVG Vector */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#C5A059] pointer-events-none" fill="currentColor">
        {/* Left Laurel Branch */}
        <path d="M 49 92 C 30 88 15 75 13 52 C 11 34 20 20 32 12 C 31 18 34 24 38 28 C 28 34 22 44 22 56 C 22 69 34 81 49 84 Z" opacity="0.95" />
        {/* Right Laurel Branch */}
        <path d="M 51 92 C 70 88 85 75 87 52 C 89 34 80 20 68 12 C 69 18 66 24 62 28 C 72 34 78 44 78 56 C 78 69 66 81 51 84 Z" opacity="0.95" />
        {/* Center Star at bottom */}
        <polygon points="50,86 52,90.5 56.5,90.5 53,93 54.5,97.5 50,95 45.5,97.5 47,93 43.5,90.5 48,90.5" fill="#C5A059" />
      </svg>
      {/* Inner circular seal content */}
      <div className="relative z-10 w-[30px] h-[30px] rounded-full flex flex-col items-center justify-center overflow-hidden">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
        ) : (
          <div className="text-center leading-[0.85] text-[#E5C378] font-black text-[6.2pt] tracking-tight uppercase font-sans">
            YOUR<br />LOGO<br />HERE
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Official Student ID Card Component (CR80 Vertical 54mm x 85.6mm)
 * Exact 1:1 visual match to user reference image (media_1788637048842.jpg).
 */
export function StudentIDCard({
  student,
  schoolInfo = {},
  isBack = false,
  layoutMode = 'FRONT_ONLY',
}: StudentIDCardProps) {
  const s = student || {};

  // If layoutMode is DUAL or 'both', render Front and Back side-by-side
  if (layoutMode === 'DUAL' || layoutMode === 'both') {
    return (
      <div className="flex flex-wrap items-start justify-center gap-6">
        <StudentIDCard student={student} schoolInfo={schoolInfo} isBack={false} layoutMode="FRONT_ONLY" />
        <StudentIDCard student={student} schoolInfo={schoolInfo} isBack={true} layoutMode="BACK_ONLY" />
      </div>
    );
  }

  const shouldRenderBack = isBack || layoutMode === 'BACK_ONLY' || layoutMode === 'back';

  // Dynamic ERP Data Binding
  const rawName = (s.name || `${s.first_name || ''} ${s.last_name || ''}`).trim() || 'AARAV SHARMA';
  const nameParts = rawName.split(' ');
  const firstName = (s.first_name || nameParts[0] || 'STUDENT').toUpperCase();
  const lastName = (s.last_name || nameParts.slice(1).join(' ') || 'NAME').toUpperCase();

  const className = s.class_name || s.grade || s.classSection || '5-A';
  const dob = s.dob || s.birth_date || '15 May 2015';
  const admissionNo = s.admission_number || s.admission_no || s.admNo || 'CBS/2026/0412';
  const attendanceBarcodeId = s.id || s.barcode_id || 'CBS20260412';

  // Back Face Vitals
  const fatherName = s.father_name || s.fatherName || s.guardian_name || 'Rajesh Sharma';
  const motherName = s.mother_name || s.motherName || 'Sunita Sharma';
  const address = s.address || s.residential_address || 'B-402, Royal Residency,\nBurari, Delhi - 110084';
  const busRoute = s.bus_route_no || s.route_name || s.busRoute || 'Route 04 (Burari)';
  const validUpto = s.valid_upto || s.validUpto || '31 Mar 2027';

  // School Information
  const schName = (schoolInfo?.name || s.school_name || 'CRAYON BOX SCHOOL').toUpperCase();
  const schCity = (schoolInfo?.city || schoolInfo?.address?.split(',')?.pop() || 'DELHI NCR').toUpperCase();
  const schAffiliation = schoolInfo?.boardAffiliation || schoolInfo?.affiliation || 'Affiliated to CBSE';
  const schPhone = schoolInfo?.phone || '+91 11 2761 8899';
  const schWebsite = schoolInfo?.website || 'www.crayonboxschool.edu.in';
  const schoolLogo = schoolInfo?.logoUrl || s.school_logo;
  const photoUrl = s.photo_url || s.avatar_url || s.image;

  // =============================================================
  // BACK SIDE: EXACT MATCH TO REFERENCE IMAGE (RIGHT SIDE)
  // =============================================================
  if (shouldRenderBack) {
    return (
      <div 
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        className="w-[340px] h-[540px] bg-[#FFFFFF] rounded-2xl shadow-xl relative overflow-hidden flex flex-col border border-stone-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none justify-between font-sans"
      >
        {/* Subtle Geometric Background Watermark */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035] z-0"
          style={{
            backgroundImage: `radial-gradient(#C5A059 1.5px, transparent 1.5px), radial-gradient(#C5A059 1.5px, #FFFFFF 1.5px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        />

        {/* 1. Top Tricolor Header with Ashoka Chakra */}
        <TricolorBand className="z-20" />

        {/* 2. Header Title */}
        <div className="text-center pt-2 pb-1 z-10 shrink-0">
          <h2 className="text-[#0B1B3D] font-black text-[18px] uppercase tracking-wider font-['Barlow_Condensed',sans-serif]">
            STUDENT INFORMATION
          </h2>
          <div className="w-14 h-[2.5px] bg-[#C5A059] mx-auto mt-1 rounded-full"></div>
        </div>

        {/* 3. Tabular Vitals with Aligned Colons & Clean Icons */}
        <div className="space-y-2 font-['Barlow_Condensed',sans-serif] text-[13.5px] leading-snug px-6 z-10">
          {/* Father Name */}
          <div className="grid grid-cols-[115px_12px_1fr] items-baseline">
            <span className="font-bold text-[#0B1B3D] flex items-center gap-2">
              <svg className="w-4 h-4 text-[#0B1B3D] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              Father Name
            </span>
            <span className="font-bold text-[#0B1B3D]">:</span>
            <span className="font-semibold text-slate-800 truncate">{fatherName}</span>
          </div>

          {/* Mother Name */}
          <div className="grid grid-cols-[115px_12px_1fr] items-baseline">
            <span className="font-bold text-[#0B1B3D] flex items-center gap-2">
              <svg className="w-4 h-4 text-[#0B1B3D] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              Mother Name
            </span>
            <span className="font-bold text-[#0B1B3D]">:</span>
            <span className="font-semibold text-slate-800 truncate">{motherName}</span>
          </div>

          {/* Address */}
          <div className="grid grid-cols-[115px_12px_1fr] items-start">
            <span className="font-bold text-[#0B1B3D] flex items-center gap-2 pt-0.5">
              <svg className="w-4 h-4 text-[#0B1B3D] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              Address
            </span>
            <span className="font-bold text-[#0B1B3D] pt-0.5">:</span>
            <span className="font-semibold text-slate-800 leading-tight whitespace-pre-line">{address}</span>
          </div>

          {/* Bus Route */}
          <div className="grid grid-cols-[115px_12px_1fr] items-baseline">
            <span className="font-bold text-[#0B1B3D] flex items-center gap-2">
              <svg className="w-4 h-4 text-[#0B1B3D] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM2 9v5a2 2 0 002 2h1v1a1 1 0 102 0v-1h6v1a1 1 0 102 0v-1h1a2 2 0 002-2V9H2zm3 4a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
              Bus Route
            </span>
            <span className="font-bold text-[#0B1B3D]">:</span>
            <span className="font-semibold text-slate-800 truncate">{busRoute}</span>
          </div>

          {/* Valid Upto */}
          <div className="grid grid-cols-[115px_12px_1fr] items-baseline">
            <span className="font-bold text-[#0B1B3D] flex items-center gap-2">
              <svg className="w-4 h-4 text-[#0B1B3D] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              Valid Upto
            </span>
            <span className="font-bold text-[#0B1B3D]">:</span>
            <span className="font-semibold text-slate-800 font-mono">{validUpto}</span>
          </div>
        </div>

        {/* 4. Refined Card Guidelines Box (Exact match to Reference) */}
        <div className="mx-5 bg-[#FDFBF7] border border-[#D5BA82] rounded-xl p-3 z-10 font-sans shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-[#0B1B3D] text-[12px] uppercase tracking-wider font-['Barlow_Condensed',sans-serif]">
              CARD GUIDELINES
            </span>
            <div className="flex-1 h-[1px] bg-[#D5BA82]"></div>
          </div>
          <div className="space-y-1.5 text-[10.5px] leading-tight text-[#0B1B3D]">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#C5A059] text-white font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5">01</span>
              <span className="font-medium">Card must be worn on campus and school bus.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#C5A059] text-white font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5">02</span>
              <span className="font-medium">If found, please return to School Office or call {schPhone}.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#C5A059] text-white font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5">03</span>
              <span className="font-medium">This card is non-transferable.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#C5A059] text-white font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5">04</span>
              <span className="font-medium">Report a lost card to the school immediately.</span>
            </div>
          </div>
        </div>

        {/* 5. Curved Navy Bottom Footer with School Contact & Pillars */}
        <div className="relative bg-[#0B1B3D] text-white pt-4 pb-3 px-4 z-20 shrink-0">
          {/* Subtle Arched Top Line */}
          <svg 
            viewBox="0 0 340 12" 
            className="absolute -top-[11px] left-0 w-full h-3 text-[#0B1B3D] pointer-events-none"
            preserveAspectRatio="none"
          >
            <path d="M 0,12 Q 170,0 340,12 L 340,12 L 0,12 Z" fill="#0B1B3D" />
            <path d="M 0,12 Q 170,0 340,12" fill="none" stroke="#C5A059" strokeWidth="2.5" />
          </svg>

          <div className="flex items-center justify-between">
            {/* Left: School Contact info */}
            <div className="text-left flex-1 min-w-0 pr-3">
              <span className="font-bold text-[12px] uppercase tracking-wider block text-white font-['Barlow_Condensed',sans-serif] truncate">
                {schName}
              </span>
              <div className="flex items-center gap-2 text-[8.5px] text-slate-300 mt-0.5 font-sans flex-wrap">
                <span className="flex items-center gap-1 truncate">
                  <svg className="w-2.5 h-2.5 text-[#C5A059] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-.2c0-1.4-1.4-1.8-1.8-1.8H7a2 2 0 00-2 2v.2a5.96 5.96 0 01-.668-8.173z" clipRule="evenodd"/>
                  </svg>
                  {schWebsite}
                </span>
                <span className="text-[#C5A059]">|</span>
                <span className="flex items-center gap-1 truncate">
                  <svg className="w-2.5 h-2.5 text-[#C5A059] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  {schPhone}
                </span>
              </div>
            </div>

            {/* Right: Institutional Pillars */}
            <div className="border-l border-[#C5A059]/50 pl-3 text-right shrink-0">
              <span className="text-[7.5px] font-bold text-[#E5C378] tracking-widest block leading-tight">PEOPLE</span>
              <span className="text-[7.5px] font-bold text-[#E5C378] tracking-widest block leading-tight">PURPOSE</span>
              <span className="text-[7.5px] font-bold text-[#E5C378] tracking-widest block leading-tight">PROGRESS</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // FRONT SIDE: EXACT MATCH TO REFERENCE IMAGE (LEFT SIDE)
  // =============================================================
  return (
    <div 
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      className="w-[340px] h-[540px] bg-[#FAF9F6] rounded-2xl shadow-xl relative overflow-hidden flex flex-col border border-stone-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none justify-between font-sans"
    >
      {/* Subtle Geometric Background Watermark */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] z-0"
        style={{
          backgroundImage: `radial-gradient(#C5A059 1.5px, transparent 1.5px), radial-gradient(#C5A059 1.5px, #FAF9F6 1.5px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* 1. Top Flush Tricolor Band with Ashoka Chakra */}
      <TricolorBand className="z-20" />

      {/* 2. Deep Royal Navy Header with Convex Curved Bottom & Gold Accent */}
      <div className="relative bg-[#0B1B3D] text-white pt-2 pb-5 px-3 z-20 shrink-0">
        <div className="flex items-center justify-between">
          {/* Left: School Laurel Crest / Logo Seal */}
          <LaurelSeal logoUrl={schoolLogo} schoolName={schName} />

          {/* Center: School Branding */}
          <div className="flex-1 text-center px-1">
            <h1 className="font-bold text-[14.5px] uppercase tracking-wider text-white font-serif leading-tight">
              {schName}
            </h1>
            <p className="text-[#E5C378] font-bold text-[9px] uppercase tracking-[0.22em] font-sans leading-none mt-0.5">
              {schCity}
            </p>
            <div className="w-24 h-[1px] bg-[#C5A059]/70 mx-auto my-1"></div>
            <p className="text-slate-200 text-[8.5px] tracking-wider font-sans leading-none opacity-90">
              {schAffiliation}
            </p>
          </div>

          {/* Right: Institutional Pillars */}
          <div className="border-l border-[#C5A059]/50 pl-2 text-right shrink-0">
            <span className="text-[7.5px] font-bold text-[#E5C378] tracking-widest block leading-tight">LEARN</span>
            <span className="text-[7.5px] font-bold text-[#E5C378] tracking-widest block leading-tight">CREATE</span>
            <span className="text-[7.5px] font-bold text-[#E5C378] tracking-widest block leading-tight">BELONG</span>
          </div>
        </div>

        {/* Elegant Convex Bottom Curve with Gold Line */}
        <svg 
          viewBox="0 0 340 18" 
          className="absolute -bottom-[1px] left-0 w-full h-3.5 text-[#0B1B3D] pointer-events-none"
          preserveAspectRatio="none"
        >
          <path d="M 0,0 Q 170,18 340,0 L 340,18 L 0,18 Z" fill="#FAF9F6" />
          <path d="M 0,0 Q 170,18 340,0" fill="none" stroke="#C5A059" strokeWidth="2.5" />
        </svg>
      </div>

      {/* 3. Middle Body: Photo Frame on Left + Student Identity/Vitals on Right */}
      <div className="px-5 pt-1 pb-0 flex-1 flex flex-col justify-around z-10">
        <div className="flex items-center justify-between">
          {/* Framed Student Photograph (3:4 aspect ratio with gold border) */}
          <div className="w-[122px] h-[155px] rounded-lg border-2 border-[#C5A059] shadow-sm overflow-hidden bg-slate-100 shrink-0 relative select-none">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${firstName} ${lastName}`}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}

            {/* Reference-identical Silhouette Placeholder when no photo is uploaded */}
            {!photoUrl && (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-200/70 p-2">
                <div className="w-16 h-16 rounded-full bg-slate-300 flex items-center justify-center mb-1.5 shadow-2xs">
                  <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-[10px] font-black uppercase text-slate-500 text-center tracking-wider leading-tight font-sans">
                  STUDENT<br />PHOTO
                </span>
              </div>
            )}
          </div>

          {/* Hero Name & Tabular Vitals */}
          <div className="flex-1 pl-4 flex flex-col justify-center">
            {/* Hero Student Name */}
            <h2 className="text-[#0B1B3D] font-black text-[24px] leading-[1.05] tracking-tight uppercase font-['Barlow_Condensed',sans-serif]">
              {firstName}<br />{lastName}
            </h2>

            {/* Gold Horizontal Accent Line */}
            <div className="w-12 h-[2.5px] bg-[#C5A059] rounded-full my-2"></div>

            {/* Key-Value Vitals with Aligned Colons (Matching Reference Class, Adm. No., DOB) */}
            <div className="space-y-1.5 font-['Barlow_Condensed',sans-serif] text-[14px] leading-tight text-[#0B1B3D]">
              <div className="grid grid-cols-[68px_12px_1fr] items-baseline">
                <span className="font-bold">Class</span>
                <span className="font-bold">:</span>
                <span className="font-semibold text-slate-800">{className}</span>
              </div>
              <div className="grid grid-cols-[68px_12px_1fr] items-baseline">
                <span className="font-bold">Adm. No.</span>
                <span className="font-bold">:</span>
                <span className="font-semibold text-slate-800 font-mono">{admissionNo}</span>
              </div>
              <div className="grid grid-cols-[68px_12px_1fr] items-baseline">
                <span className="font-bold">DOB</span>
                <span className="font-bold">:</span>
                <span className="font-semibold text-slate-800">{dob}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Dedicated Horizontal Barcode Section (Wide, crisp & with STUDENT BARCODE label) */}
        <div className="w-full px-2 pt-2 pb-0 flex flex-col items-center justify-center">
          <AttendanceBarcode
            code={admissionNo.replace(/[^A-Z0-9]/g, '') || attendanceBarcodeId}
            orientation="horizontal"
            height={40}
            width={295}
            showText={false}
          />
          <span className="text-[10.5px] font-bold text-slate-900 tracking-[0.24em] uppercase text-center mt-1 font-['Barlow_Condensed',sans-serif]">
            STUDENT BARCODE
          </span>
        </div>
      </div>

      {/* 5. Curved Navy Footer with Sanskrit Motto & English Subtitle */}
      <div className="relative bg-[#0B1B3D] text-center pt-4 pb-3 px-3 shrink-0 z-20">
        {/* Concave Top Curve with Gold Line */}
        <svg 
          viewBox="0 0 340 18" 
          className="absolute -top-[17px] left-0 w-full h-4 text-[#0B1B3D] pointer-events-none"
          preserveAspectRatio="none"
        >
          <path d="M 0,18 Q 170,0 340,18 L 340,18 L 0,18 Z" fill="#0B1B3D" />
          <path d="M 0,18 Q 170,0 340,18" fill="none" stroke="#C5A059" strokeWidth="2.5" />
        </svg>

        {/* Sanskrit Motto in Devanagari */}
        <span className="font-serif font-bold text-[#E5C378] text-[17px] tracking-wide block font-['Noto_Serif_Devanagari',serif] leading-tight">
          विद्या ददाति विनयम्
        </span>

        {/* English Meaning flanked by two gold lines */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="w-9 h-[1px] bg-[#C5A059]"></div>
          <span className="text-[7.5px] font-sans font-bold text-slate-200 tracking-[0.25em] uppercase leading-none">
            KNOWLEDGE LEADS TO HUMILITY
          </span>
          <div className="w-9 h-[1px] bg-[#C5A059]"></div>
        </div>
      </div>
    </div>
  );
}

export default StudentIDCard;
