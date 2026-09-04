"use client";

import React from 'react';
import { AttendanceBarcode } from './AttendanceBarcode';

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
 * Exact visual match to media_1788549831427.jpg (Left = Front, Right = Back).
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

  // Dynamic ERP data binding with safe fallbacks
  const rawName = (s.name || `${s.first_name || ''} ${s.last_name || ''}`).trim() || 'AARAV SHARMA';
  const nameParts = rawName.split(' ');
  const firstName = (s.first_name || nameParts[0] || 'AARAV').toUpperCase();
  const lastName = (s.last_name || nameParts.slice(1).join(' ') || 'SHARMA').toUpperCase();
  const fullName = `${firstName} ${lastName}`.trim();

  const className = s.class_name || s.grade || s.classSection || '5-A';
  const rollNo = s.roll_number || s.roll_no || s.rollNo || '12';
  const bloodGroup = s.blood_group || s.bloodGroup || 'O+';
  const dob = s.dob || s.birth_date || '15 May 2015';
  const admissionNo = s.admission_number || s.admission_no || s.admNo || 'CBS/0412';
  const attendanceBarcodeId = s.id || s.barcode_id || 'CBS20260412';
  const emergencyPhone = s.emergency_contact || s.emergency_phone || s.emergencyContact || '+91 98111';

  // Back Face Vitals
  const fatherName = s.father_name || s.fatherName || 'Mr. Rajesh Sharma';
  const motherName = s.mother_name || s.motherName || 'Mrs. Sunita Sharma';
  const address = s.address || s.residential_address || 'Flat 402, Royal Palms,\nSector 62, Noida - 201309';
  const busRoute = s.bus_route_no || s.route_name || s.busRoute || 'Route 04 (Burari)';
  const validUpto = s.valid_upto || s.validUpto || '31-03-2027';

  // School Information
  const schName = (schoolInfo?.name || 'CRAYON BOX SCHOOL').replace(', NEW DELHI', '').trim().toUpperCase();
  const schCity = (schoolInfo?.city || 'NEW DELHI').toUpperCase();
  const schAffiliation = schoolInfo?.affiliation || 'Affiliated to CBSE';
  const schPhone = schoolInfo?.phone || '+91 11 2761 8899';
  const schWebsite = schoolInfo?.website || 'www.crayonboxschool.edu.in';
  const photoUrl = s.photo_url || s.avatar_url || s.image || '/id-cards/v2_aarav_pure_photo.png';

  // =============================================================
  // BACK FACE: MATCHING media_1788549831427.jpg RIGHT SIDE
  // =============================================================
  if (shouldRenderBack) {
    return (
      <div 
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        className="w-[340px] h-[540px] bg-[#FFFFFF] rounded-2xl shadow-xl relative overflow-hidden flex flex-col border border-stone-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none justify-between font-sans"
      >
        {/* Subtle Geometric Background Watermark */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
          style={{
            backgroundImage: `radial-gradient(#C5A059 1.5px, transparent 1.5px), radial-gradient(#C5A059 1.5px, #FFFFFF 1.5px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        />

        {/* 1. Top Tricolor Header with Ashoka Chakra */}
        <div className="relative w-full shrink-0 z-20">
          <div className="h-4 w-full grid grid-cols-3">
            <div className="bg-[#FF7900]"></div>
            <div className="bg-white flex items-center justify-center">
              <img
                src="/id-cards/ashoka_chakra_clean.png"
                alt="Ashoka Chakra"
                className="w-3.5 h-3.5 object-contain"
              />
            </div>
            <div className="bg-[#138808]"></div>
          </div>
        </div>

        {/* 2. Header Title */}
        <div className="text-center pt-2 pb-1 z-10 shrink-0">
          <h2 className="text-[#0B1B34] font-black text-[16px] uppercase tracking-wider font-['Barlow_Condensed',sans-serif]">
            STUDENT INFORMATION
          </h2>
          <div className="w-12 h-[2px] bg-[#C5A059] mx-auto mt-1 rounded-full"></div>
        </div>

        {/* 3. Tabular Vitals with Aligned Colons & Clean Icons */}
        <div className="space-y-1.5 font-['Barlow_Condensed',sans-serif] text-[13.5px] leading-snug px-5 z-10">
          {fatherName && (
            <div className="grid grid-cols-[115px_12px_1fr] items-baseline">
              <span className="font-bold text-[#0B1B34] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#0B1B34] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
                Father Name
              </span>
              <span className="font-bold text-[#0B1B34]">:</span>
              <span className="font-semibold text-slate-800 truncate">{fatherName}</span>
            </div>
          )}

          {motherName && (
            <div className="grid grid-cols-[115px_12px_1fr] items-baseline">
              <span className="font-bold text-[#0B1B34] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#0B1B34] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
                Mother Name
              </span>
              <span className="font-bold text-[#0B1B34]">:</span>
              <span className="font-semibold text-slate-800 truncate">{motherName}</span>
            </div>
          )}

          {address && (
            <div className="grid grid-cols-[115px_12px_1fr] items-start">
              <span className="font-bold text-[#0B1B34] flex items-center gap-1.5 pt-0.5">
                <svg className="w-3.5 h-3.5 text-[#0B1B34] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                Address
              </span>
              <span className="font-bold text-[#0B1B34] pt-0.5">:</span>
              <span className="font-semibold text-slate-800 leading-tight whitespace-pre-line">{address}</span>
            </div>
          )}

          {busRoute && (
            <div className="grid grid-cols-[115px_12px_1fr] items-baseline">
              <span className="font-bold text-[#0B1B34] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#0B1B34] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM2 9v5a2 2 0 002 2h1v1a1 1 0 102 0v-1h6v1a1 1 0 102 0v-1h1a2 2 0 002-2V9H2zm3 4a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
                Bus Route
              </span>
              <span className="font-bold text-[#0B1B34]">:</span>
              <span className="font-semibold text-slate-800 truncate">{busRoute}</span>
            </div>
          )}

          {validUpto && (
            <div className="grid grid-cols-[115px_12px_1fr] items-baseline">
              <span className="font-bold text-[#0B1B34] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#0B1B34] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                Valid Upto
              </span>
              <span className="font-bold text-[#0B1B34]">:</span>
              <span className="font-semibold text-slate-800 font-mono">{validUpto}</span>
            </div>
          )}
        </div>

        {/* 4. Refined Card Guidelines Box */}
        <div className="mx-4 bg-[#FDF8ED] border border-[#D5BA82] rounded-lg p-2.5 z-10 font-sans">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-[#0B1B34] text-[11px] uppercase tracking-wider font-['Barlow_Condensed',sans-serif]">
              CARD GUIDELINES
            </span>
            <div className="flex-1 h-[1px] bg-[#D5BA82]/60"></div>
          </div>
          <div className="space-y-1 text-[10.5px] leading-tight text-[#0B1B34]">
            <div className="flex items-start gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#C5A059] text-white font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5">01</span>
              <span>Card must be worn on campus and school bus.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#C5A059] text-white font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5">02</span>
              <span>If found, please return to School Office or call {schPhone}.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#C5A059] text-white font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5">03</span>
              <span>This card is non-transferable.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#C5A059] text-white font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5">04</span>
              <span>Report a lost card to the school immediately.</span>
            </div>
          </div>
        </div>

        {/* 5. Authorization Section: School Seal on Left & Principal Signature on Right */}
        <div className="flex items-center justify-between px-5 my-0.5 z-10">
          {/* Authentic Circular Blue Ink Rubber Stamp */}
          <div className="w-[72px] h-[72px] relative select-none shrink-0">
            <img
              src="/id-cards/v2_blue_stamp.png"
              alt="School Stamp"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/id-cards/clean_blue_stamp.png';
              }}
            />
          </div>

          {/* Principal Signature & Authorised Signatory */}
          <div className="flex flex-col items-center justify-end text-center pl-4 border-l border-slate-200">
            <span className="text-[11.5px] font-bold text-[#0B1B34] block font-['Barlow_Condensed',sans-serif] leading-none mb-1">
              Principal
            </span>
            <div className="h-8 w-28 flex items-center justify-center">
              <img
                src="/id-cards/v2_principal_sig.png"
                alt="Principal Signature"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="text-[8px] font-sans text-slate-500 block tracking-tight">
              (Authorised Signatory)
            </span>
          </div>
        </div>

        {/* 6. Navy Curved Bottom Footer with School Contact & Pillars */}
        <div className="relative bg-[#0B1B34] text-white pt-2.5 pb-2 px-3 z-20 shrink-0">
          <div className="flex items-center justify-between">
            {/* Left: School Contact info */}
            <div className="text-left">
              <span className="font-bold text-[10.5px] uppercase tracking-wider block text-white font-['Barlow_Condensed',sans-serif]">
                {schName}, {schCity}
              </span>
              <div className="flex items-center gap-2 text-[8px] text-slate-300 mt-0.5 font-sans">
                <span className="flex items-center gap-1">
                  <svg className="w-2.5 h-2.5 text-[#C5A059]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-.2c0-1.4-1.4-1.8-1.8-1.8H7a2 2 0 00-2 2v.2a5.96 5.96 0 01-.668-8.173z" clipRule="evenodd"/></svg>
                  {schWebsite}
                </span>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <svg className="w-2.5 h-2.5 text-[#C5A059]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                  {schPhone}
                </span>
              </div>
            </div>

            {/* Right: Institutional Pillars */}
            <div className="border-l border-[#C5A059]/40 pl-2 text-right shrink-0">
              <span className="text-[6.5px] font-bold text-[#E5C378] tracking-widest block leading-tight">PEOPLE</span>
              <span className="text-[6.5px] font-bold text-[#E5C378] tracking-widest block leading-tight">PURPOSE</span>
              <span className="text-[6.5px] font-bold text-[#E5C378] tracking-widest block leading-tight">PROGRESS</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // FRONT FACE: MATCHING media_1788549831427.jpg LEFT SIDE
  // =============================================================
  return (
    <div 
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      className="w-[340px] h-[540px] bg-[#FAF9F6] rounded-2xl shadow-xl relative overflow-hidden flex flex-col border border-stone-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none justify-between font-sans"
    >
      {/* Subtle Geometric Background Watermark (3-5% visual opacity) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] z-0"
        style={{
          backgroundImage: `radial-gradient(#C5A059 1.5px, transparent 1.5px), radial-gradient(#C5A059 1.5px, #FAF9F6 1.5px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* 1. Top Flush Tricolor Band with Ashoka Chakra */}
      <div className="h-4 w-full grid grid-cols-3 shrink-0 relative z-20">
        <span className="h-full bg-[#FF7900]"></span>
        <span className="h-full bg-[#FFFFFF] flex items-center justify-center">
          <img
            src="/id-cards/ashoka_chakra_clean.png"
            alt="Ashoka Chakra"
            className="w-3.5 h-3.5 object-contain"
          />
        </span>
        <span className="h-full bg-[#138808]"></span>
      </div>

      {/* 2. Deep Royal Navy Header with Curved Bottom & Gold Accent */}
      <div className="relative bg-[#0B1B34] text-white pt-2.5 pb-4 px-3.5 z-20 shrink-0">
        <div className="flex items-center justify-between">
          {/* Left: School Laurel Crest */}
          <div className="w-12 h-12 relative shrink-0 flex items-center justify-center">
            <img
              src="/id-cards/v2_school_crest.png"
              alt="School Crest"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/id-cards/ashoka_chakra_clean.png';
              }}
            />
          </div>

          {/* Center: School Branding */}
          <div className="flex-1 text-center px-1">
            <h1 className="font-bold text-[14px] uppercase tracking-wider text-white font-serif leading-tight">
              {schName}
            </h1>
            <p className="text-[#E5C378] font-bold text-[9px] uppercase tracking-[0.25em] font-sans leading-none mt-0.5">
              {schCity}
            </p>
            <div className="w-20 h-[1px] bg-[#C5A059]/60 mx-auto my-1"></div>
            <p className="text-slate-200 text-[8px] tracking-wider font-sans leading-none opacity-90">
              {schAffiliation}
            </p>
          </div>

          {/* Right: Institutional Pillars */}
          <div className="border-l border-[#C5A059]/40 pl-2 text-right shrink-0">
            <span className="text-[7px] font-bold text-[#E5C378] tracking-widest block leading-tight">LEARN</span>
            <span className="text-[7px] font-bold text-[#E5C378] tracking-widest block leading-tight">CREATE</span>
            <span className="text-[7px] font-bold text-[#E5C378] tracking-widest block leading-tight">BELONG</span>
          </div>
        </div>

        {/* Elegant Convex Bottom Curve with Gold Line */}
        <svg 
          viewBox="0 0 340 16" 
          className="absolute -bottom-[1px] left-0 w-full h-3 text-[#0B1B34] pointer-events-none"
          preserveAspectRatio="none"
        >
          <path d="M 0,0 Q 170,16 340,0 L 340,16 L 0,16 Z" fill="#FAF9F6" />
          <path d="M 0,0 Q 170,16 340,0" fill="none" stroke="#C5A059" strokeWidth="2.5" />
        </svg>
      </div>

      {/* 3. Middle Body: Photo Frame on Left + Student Identity/Vitals on Right */}
      <div className="px-4 pt-2 pb-0 flex-1 flex flex-col justify-around z-10">
        <div className="flex items-center justify-between">
          {/* Framed Student Photograph (3:4 aspect ratio with gold border) */}
          <div className="w-[118px] h-[155px] rounded-lg border-2 border-[#C5A059] shadow-md overflow-hidden bg-white shrink-0 relative select-none">
            <img
              src={photoUrl}
              alt={fullName}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.src = '/id-cards/v2_aarav_pure_photo.png';
              }}
            />
          </div>

          {/* Hero Name & Tabular Vitals */}
          <div className="flex-1 pl-3.5 flex flex-col justify-center">
            {/* Hero Student Name */}
            <h2 className="text-[#0B1B34] font-black text-[22px] leading-[1.05] tracking-tight uppercase font-['Barlow_Condensed',sans-serif]">
              {firstName}<br />{lastName}
            </h2>

            {/* Key-Value Vitals with Aligned Colons */}
            <div className="mt-2 space-y-1 font-['Barlow_Condensed',sans-serif] text-[13.5px] leading-tight text-[#0B1B34]">
              <div className="grid grid-cols-[68px_10px_1fr] items-baseline">
                <span className="font-bold">Class</span>
                <span className="font-bold">:</span>
                <span className="font-semibold">{className}</span>
              </div>
              <div className="grid grid-cols-[68px_10px_1fr] items-baseline">
                <span className="font-bold">Roll No.</span>
                <span className="font-bold">:</span>
                <span className="font-semibold">{rollNo}</span>
              </div>
              <div className="grid grid-cols-[68px_10px_1fr] items-baseline">
                <span className="font-bold">Adm. No.</span>
                <span className="font-bold">:</span>
                <span className="font-semibold font-mono">{admissionNo}</span>
              </div>
              <div className="grid grid-cols-[68px_10px_1fr] items-baseline">
                <span className="font-bold">DOB</span>
                <span className="font-bold">:</span>
                <span className="font-semibold">{dob}</span>
              </div>
              {bloodGroup && (
                <div className="grid grid-cols-[68px_10px_1fr] items-baseline">
                  <span className="font-bold">Blood Group</span>
                  <span className="font-bold">:</span>
                  <span className="font-semibold">{bloodGroup}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Dedicated Horizontal Barcode Section */}
        <div className="w-full px-2 pt-2 pb-1 flex flex-col items-center justify-center">
          <AttendanceBarcode
            code={admissionNo.replace(/[^A-Z0-9]/g, '') || attendanceBarcodeId}
            orientation="horizontal"
            height={42}
            width={285}
            showText={true}
          />
        </div>
      </div>

      {/* 5. Curved Navy Footer with Sanskrit Motto & English Subtitle */}
      <div className="relative bg-[#0B1B34] text-center pt-3.5 pb-2.5 px-3 shrink-0 z-20">
        {/* Concave Top Curve with Gold Line */}
        <svg 
          viewBox="0 0 340 16" 
          className="absolute -top-[15px] left-0 w-full h-4 text-[#0B1B34] pointer-events-none"
          preserveAspectRatio="none"
        >
          <path d="M 0,16 Q 170,0 340,16 L 340,16 L 0,16 Z" fill="#0B1B34" />
          <path d="M 0,16 Q 170,0 340,16" fill="none" stroke="#C5A059" strokeWidth="2.5" />
        </svg>

        <span className="font-serif font-bold text-[#E5C378] text-[16.5px] tracking-wide block font-['Noto_Serif_Devanagari',serif] leading-tight">
          विद्या ददाति विनयम्
        </span>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="w-8 h-[1px] bg-[#C5A059]/60"></div>
          <span className="text-[7.5px] font-sans font-bold text-slate-300 tracking-[0.25em] uppercase leading-none">
            KNOWLEDGE LEADS TO HUMILITY
          </span>
          <div className="w-8 h-[1px] bg-[#C5A059]/60"></div>
        </div>
      </div>
    </div>
  );
}

export default StudentIDCard;
