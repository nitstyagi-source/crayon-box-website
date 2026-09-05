"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  EscortIdCardCustomConfig,
  DEFAULT_ESCORT_ID_CARD_CONFIG,
  getEscortIdCardConfig
} from '@/lib/id-card-config';

export interface AuthorizedPersonData {
  id?: string;
  full_name?: string;
  name?: string;
  relationship?: string;
  relation?: string;
  phone?: string;
  phone_number?: string;
  mobile?: string;
  id_proof_type?: string;
  id_proof?: string;
  id_proof_number?: string;
  id_no?: string;
  photo_url?: string;
  photoUrl?: string;
}

export interface EscortCardProps {
  // Can receive either legacy escort object, or student + escorts array
  escort?: any;
  student?: any;
  escorts?: AuthorizedPersonData[];
  schoolInfo?: any;
  isBack?: boolean;
  layoutMode?: 'FRONT_ONLY' | 'BACK_ONLY' | 'DUAL' | 'both' | 'front' | 'back';
  config?: Partial<EscortIdCardCustomConfig>;
  session?: string;
}

/**
 * Clean Vector Ashoka Chakra Component with 24 Radial Spokes & Saffron/Green Band
 */
function LandscapeTricolorBand({ className = '' }: { className?: string }) {
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
 * Gold Laurel Seal / School Emblem (Matching Reference Front Left)
 */
function LaurelSeal({ 
  logoUrl, 
  schoolName, 
  accentColor = '#C5A059', 
  goldTextColor = '#E5C378' 
}: { 
  logoUrl?: string; 
  schoolName?: string;
  accentColor?: string;
  goldTextColor?: string;
}) {
  return (
    <div className="w-[42px] h-[42px] relative shrink-0 flex items-center justify-center select-none">
      <svg viewBox="0 0 100 100" style={{ color: accentColor }} className="absolute inset-0 w-full h-full pointer-events-none" fill="currentColor">
        <path d="M 49 92 C 30 88 15 75 13 52 C 11 34 20 20 32 12 C 31 18 34 24 38 28 C 28 34 22 44 22 56 C 22 69 34 81 49 84 Z" opacity="0.95" />
        <path d="M 51 92 C 70 88 85 75 87 52 C 89 34 80 20 68 12 C 69 18 66 24 62 28 C 72 34 78 44 78 56 C 78 69 66 81 51 84 Z" opacity="0.95" />
        <polygon points="50,86 52,90.5 56.5,90.5 53,93 54.5,97.5 50,95 45.5,97.5 47,93 43.5,90.5 48,90.5" fill={accentColor} />
      </svg>
      <div className="relative z-10 w-[24px] h-[24px] rounded-full flex flex-col items-center justify-center overflow-hidden">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
        ) : (
          <div style={{ color: goldTextColor }} className="text-center leading-[0.85] font-black text-[5pt] tracking-tight uppercase font-sans">
            YOUR<br />LOGO<br />HERE
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Official Child Escort Card Component (CR80 Landscape 85.6mm x 54mm)
 * Exact 1:1 visual match to reference images (media_1788638977129.png & media_1788638951627.jpg)
 */
export function EscortPickupCard({
  escort,
  student: propStudent,
  escorts: propEscorts,
  schoolInfo = {},
  isBack = false,
  layoutMode = 'FRONT_ONLY',
  config: propsConfig,
  session,
}: EscortCardProps) {
  // Normalize Student Data
  const student = useMemo(() => {
    if (propStudent) {
      return {
        first_name: propStudent.first_name || 'STUDENT',
        last_name: propStudent.last_name || 'NAME',
        name: propStudent.name || `${propStudent.first_name || 'STUDENT'} ${propStudent.last_name || 'NAME'}`,
        class_name: propStudent.class_name || propStudent.className || 'Class',
        admission_number: propStudent.admission_number || propStudent.admissionNo || propStudent.universal_id || 'Admission No.',
        dob: propStudent.dob || 'DD MMM YYYY',
        photo_url: propStudent.photo_url || propStudent.photoUrl || '',
      };
    }
    if (escort) {
      return {
        first_name: escort.studentName?.split(' ')[0] || 'STUDENT',
        last_name: escort.studentName?.split(' ').slice(1).join(' ') || 'NAME',
        name: escort.studentName || 'STUDENT NAME',
        class_name: escort.className ? `Class ${escort.className}${escort.sectionName ? `-${escort.sectionName}` : ''}` : 'Class',
        admission_number: escort.studentUniversalId || escort.admissionNo || 'Admission No.',
        dob: escort.dob || '15 May 2016',
        photo_url: escort.studentPhotoUrl || '',
      };
    }
    return {
      first_name: 'STUDENT',
      last_name: 'NAME',
      name: 'STUDENT NAME',
      class_name: 'Class',
      admission_number: 'Admission No.',
      dob: 'DD MMM YYYY',
      photo_url: '',
    };
  }, [propStudent, escort]);

  // Normalize up to 3 Authorized Escorts
  const authorizedPersons: AuthorizedPersonData[] = useMemo(() => {
    if (propEscorts && propEscorts.length > 0) {
      return propEscorts.slice(0, 3);
    }
    if (escort) {
      const p1: AuthorizedPersonData = {
        name: escort.guardianName || 'Authorised Person 1',
        relationship: escort.relationship || 'Father',
        phone: escort.phone || '+91 98111 02008',
        id_proof: 'Aadhaar Card',
        id_no: 'XXXX-XXXX-1234',
        photo_url: escort.photoUrl || '',
      };
      return [p1];
    }
    return [];
  }, [propEscorts, escort]);

  // Default fallback slots for Authorised Persons 1, 2, 3
  const slot1 = authorizedPersons[0] || {
    name: 'Authorised Person 1',
    relationship: 'Relation',
    phone: 'Mobile Number',
    id_proof: 'ID Proof Type',
    id_no: 'ID Proof Number',
    photo_url: '',
  };
  const slot2 = authorizedPersons[1] || {
    name: 'Authorised Person 2',
    relationship: 'Relation',
    phone: 'Mobile Number',
    id_proof: 'ID Proof Type',
    id_no: 'ID Proof Number',
    photo_url: '',
  };
  const slot3 = authorizedPersons[2] || {
    name: 'Authorised Person 3',
    relationship: 'Relation',
    phone: 'Mobile Number',
    id_proof: 'ID Proof Type',
    id_no: 'ID Proof Number',
    photo_url: '',
  };

  const personSlots = [slot1, slot2, slot3];

  const instCode = schoolInfo?.code || 'DEFAULT';

  // Live configuration state
  const [liveConfig, setLiveConfig] = useState<EscortIdCardCustomConfig>(() => {
    return { ...getEscortIdCardConfig(instCode), ...propsConfig };
  });

  useEffect(() => {
    setLiveConfig({ ...getEscortIdCardConfig(instCode), ...propsConfig });
  }, [instCode, propsConfig]);

  // Listen to live broadcast updates from Visual Studio
  useEffect(() => {
    const handleConfigUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ institutionCode: string; config: EscortIdCardCustomConfig }>;
      if (customEvent.detail && (!customEvent.detail.institutionCode || customEvent.detail.institutionCode === instCode || customEvent.detail.institutionCode === 'DEFAULT')) {
        setLiveConfig({ ...customEvent.detail.config, ...propsConfig });
      }
    };
    window.addEventListener('escort_idcard_config_updated', handleConfigUpdate);
    return () => {
      window.removeEventListener('escort_idcard_config_updated', handleConfigUpdate);
    };
  }, [instCode, propsConfig]);

  const cfg = liveConfig;

  // Institution branding resolutions
  const resolvedSchoolName = cfg.schoolName || schoolInfo?.name || 'SCHOOL NAME';
  const resolvedCity = cfg.city || schoolInfo?.city || 'LOCATION / CITY';
  const resolvedLogo = cfg.customLogoUrl || schoolInfo?.logo_url || schoolInfo?.logoUrl;
  const primaryColor = cfg.primaryColor || '#0B1B3D';
  const accentColor = cfg.accentColor || '#C5A059';
  const goldTextColor = cfg.goldTextColor || '#E5C378';
  const cardBgColor = cfg.cardBgColor || '#FFFFFF';

  // Determine rendering mode
  const showFront = layoutMode === 'FRONT_ONLY' || layoutMode === 'front' || (layoutMode === 'DUAL' || layoutMode === 'both' ? true : !isBack);
  const showBack = layoutMode === 'BACK_ONLY' || layoutMode === 'back' || (layoutMode === 'DUAL' || layoutMode === 'both' ? true : isBack);
  const isDual = (layoutMode === 'DUAL' || layoutMode === 'both') && showFront && showBack;

  return (
    <div className={`flex ${isDual ? 'flex-col sm:flex-row gap-6' : 'flex-col'} items-center justify-center print:m-0 print:p-0`}>
      
      {/* ============================================================== */}
      {/* 🌟 FRONT FACE: EXACT 1:1 REPLICA OF media_1788638977129.png     */}
      {/* ============================================================== */}
      {showFront && (
        <div
          className="relative rounded-[16px] overflow-hidden shadow-2xl border border-stone-300 print:border-none print:shadow-none select-none shrink-0"
          style={{
            width: '1000px',
            height: '630px',
            transform: 'scale(0.56)',
            transformOrigin: 'top center',
            marginBottom: isDual ? '-250px' : '-270px',
            backgroundColor: cardBgColor,
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Subtle Right Mandala Watermark Pattern */}
          <div className="absolute top-10 right-4 w-[420px] h-[420px] opacity-[0.07] pointer-events-none z-0">
            <svg viewBox="0 0 100 100" fill="currentColor" style={{ color: primaryColor }} className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
              {Array.from({ length: 16 }).map((_, i) => (
                <path
                  key={i}
                  d="M50 50 Q55 25 50 10 Q45 25 50 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  transform={`rotate(${i * 22.5} 50 50)`}
                />
              ))}
            </svg>
          </div>

          {/* 1. TOP INDIAN TRICOLOR BAND WITH ASHOKA CHAKRA */}
          {cfg.showTricolor && (
            <LandscapeTricolorBand className="h-[30px]" />
          )}

          {/* 2. LEFT CURVED ROYAL NAVY BANNER & RIGHT HEADER TITLE */}
          <div className="relative z-10 flex h-[480px]">
            
            {/* Left Royal Navy Arched Header (Matching Reference 1:1) */}
            <div
              className="relative w-[285px] h-full flex flex-col justify-between p-6 shrink-0 text-white"
              style={{
                backgroundColor: primaryColor,
                borderTopRightRadius: '100px',
                borderBottomRightRadius: '100px',
                boxShadow: `4px 0 20px ${accentColor}33`,
              }}
            >
              {/* Outer Golden Border Outline Curve */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderTopRightRadius: '100px',
                  borderBottomRightRadius: '100px',
                  borderRight: `4px solid ${accentColor}`,
                }}
              />

              {/* School Emblem / Laurel Seal */}
              <div className="flex flex-col items-center text-center pt-2">
                {cfg.showLaurelSeal && (
                  <div className="mb-2">
                    <LaurelSeal
                      logoUrl={resolvedLogo}
                      schoolName={resolvedSchoolName}
                      accentColor={accentColor}
                      goldTextColor={goldTextColor}
                    />
                  </div>
                )}
                
                {/* School Name */}
                <h2 className="font-serif font-black text-[22px] tracking-wider uppercase text-white leading-tight mt-1 text-center">
                  {resolvedSchoolName}
                </h2>
                
                {/* City / Location */}
                <p style={{ color: goldTextColor }} className="text-[12px] font-bold tracking-[0.2em] uppercase mt-1">
                  {resolvedCity}
                </p>

                {/* Optional Affiliation or Tagline (Removed CBSE by default) */}
                {cfg.tagline ? (
                  <p className="text-[10px] text-stone-300 font-medium tracking-wide mt-1">
                    {cfg.tagline}
                  </p>
                ) : (
                  <div className="w-16 h-[1.5px] mt-2 opacity-60" style={{ backgroundColor: accentColor }} />
                )}
              </div>

              {/* Three Institutional Pillars */}
              {cfg.showPillars && (
                <div className="flex flex-col items-center justify-center space-y-1 pb-4 text-center">
                  <span style={{ color: goldTextColor }} className="text-[14px] font-black tracking-[0.25em] uppercase font-sans">
                    {cfg.frontPillars[0] || 'LEARN'}
                  </span>
                  <span style={{ color: goldTextColor }} className="text-[14px] font-black tracking-[0.25em] uppercase font-sans">
                    {cfg.frontPillars[1] || 'CREATE'}
                  </span>
                  <span style={{ color: goldTextColor }} className="text-[14px] font-black tracking-[0.25em] uppercase font-sans">
                    {cfg.frontPillars[2] || 'BELONG'}
                  </span>
                </div>
              )}
            </div>

            {/* Right Main Body Content */}
            <div className="flex-1 flex flex-col justify-between pt-5 pb-3 px-8 z-10">
              
              {/* Header Titles Row */}
              <div className="flex items-center justify-between border-b-2 pb-3" style={{ borderColor: `${accentColor}40` }}>
                <div>
                  <h1 style={{ color: primaryColor }} className="text-[34px] font-black tracking-tight font-serif uppercase">
                    {cfg.frontCardTitle}
                  </h1>
                  <div className="w-24 h-1 mt-1 rounded-full" style={{ backgroundColor: accentColor }} />
                </div>

                {/* Academic Year Gold Badge */}
                {cfg.showAcademicYear && (
                  <div
                    className="px-5 py-2 rounded-2xl border-2 flex flex-col items-center justify-center text-center shadow-xs"
                    style={{
                      backgroundColor: '#FFFBEB',
                      borderColor: accentColor,
                    }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900/80">
                      {cfg.academicYearLabel}
                    </span>
                    <span style={{ color: primaryColor }} className="text-[18px] font-black tracking-wider">
                      {cfg.academicYear}
                    </span>
                  </div>
                )}
              </div>

              {/* Center Body: Student Photo + Vitals */}
              <div className="flex items-center gap-8 my-auto">
                
                {/* Student Photo with Arched Gold Frame */}
                <div
                  className="w-[170px] h-[210px] rounded-3xl overflow-hidden shrink-0 flex flex-col items-center justify-center relative shadow-md bg-stone-100"
                  style={{
                    border: `3px solid ${accentColor}`,
                  }}
                >
                  {student.photo_url ? (
                    <img src={student.photo_url} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4 text-stone-400">
                      <svg className="w-24 h-24 text-stone-400 mb-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <span className="text-[12px] font-black tracking-wider uppercase text-stone-400">
                        STUDENT<br />PHOTO
                      </span>
                    </div>
                  )}
                </div>

                {/* Student Name & Key-Value Identity Fields */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 style={{ color: primaryColor }} className="text-[32px] font-black tracking-tight uppercase font-sans">
                      {student.name}
                    </h3>
                    <div className="w-20 h-1 mt-1 rounded-full" style={{ backgroundColor: accentColor }} />
                  </div>

                  <div className="space-y-2 text-[17px] font-sans">
                    {cfg.showClass && (
                      <div className="grid grid-cols-12 items-baseline">
                        <span className="col-span-5 font-bold text-stone-800">{cfg.classLabel}</span>
                        <span className="col-span-1 font-bold text-stone-800">:</span>
                        <span style={{ color: primaryColor }} className="col-span-6 font-extrabold">{student.class_name}</span>
                      </div>
                    )}

                    {cfg.showAdmissionNo && (
                      <div className="grid grid-cols-12 items-baseline">
                        <span className="col-span-5 font-bold text-stone-800">{cfg.admissionNoLabel}</span>
                        <span className="col-span-1 font-bold text-stone-800">:</span>
                        <span style={{ color: primaryColor }} className="col-span-6 font-extrabold font-mono">{student.admission_number}</span>
                      </div>
                    )}

                    {cfg.showDob && (
                      <div className="grid grid-cols-12 items-baseline">
                        <span className="col-span-5 font-bold text-stone-800">{cfg.dobLabel}</span>
                        <span className="col-span-1 font-bold text-stone-800">:</span>
                        <span style={{ color: primaryColor }} className="col-span-6 font-extrabold">{student.dob}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Golden Authorization Notice Box */}
              {cfg.showDisclaimer && (
                <div
                  className="rounded-2xl p-3.5 flex items-center gap-3.5 border shadow-2xs"
                  style={{
                    backgroundColor: '#FEF9EE',
                    borderColor: `${accentColor}80`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: accentColor }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                    </svg>
                  </div>
                  <p style={{ color: primaryColor }} className="text-[13px] font-bold leading-tight">
                    {cfg.disclaimerText}
                  </p>
                </div>
              )}

            </div>

          </div>

          {/* 3. BOTTOM CURVED ROYAL NAVY FOOTER (Motto & Core Values) */}
          <div
            className="absolute bottom-0 inset-x-0 h-[85px] flex items-center justify-between px-10 text-white z-20"
            style={{
              backgroundColor: primaryColor,
              borderTop: `3px solid ${accentColor}`,
            }}
          >
            {/* Sanskrit Motto */}
            {cfg.showMotto ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-[1px]" style={{ backgroundColor: accentColor }} />
                  <span style={{ color: goldTextColor }} className="font-serif text-[19px] font-black tracking-wide">
                    {cfg.sanskritMotto}
                  </span>
                  <div className="w-12 h-[1px]" style={{ backgroundColor: accentColor }} />
                </div>
                <span className="text-[10.5px] font-sans font-bold tracking-[0.2em] uppercase text-stone-300 pl-15">
                  {cfg.englishSubtitle}
                </span>
              </div>
            ) : <div />}

            {/* Vertical Divider */}
            <div className="w-[1.5px] h-10 opacity-40" style={{ backgroundColor: accentColor }} />

            {/* 4 Core Values */}
            {cfg.showCoreValues && (
              <div className="flex items-center gap-4 text-[12px] font-black tracking-[0.25em] uppercase text-stone-200">
                <span>{cfg.coreValues[0]}</span>
                <span style={{ color: accentColor }}>|</span>
                <span>{cfg.coreValues[1]}</span>
                <span style={{ color: accentColor }}>|</span>
                <span>{cfg.coreValues[2]}</span>
                <span style={{ color: accentColor }}>|</span>
                <span>{cfg.coreValues[3]}</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 🌟 BACK FACE: EXACT 1:1 REPLICA OF media_1788638951627.jpg      */}
      {/* ============================================================== */}
      {showBack && (
        <div
          className="relative rounded-[16px] overflow-hidden shadow-2xl border border-stone-300 print:border-none print:shadow-none select-none shrink-0"
          style={{
            width: '1000px',
            height: '630px',
            transform: 'scale(0.56)',
            transformOrigin: 'top center',
            marginBottom: isDual ? '-250px' : '-270px',
            backgroundColor: cardBgColor,
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Subtle Background Geometry Pattern (matching back watermark) */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none z-0">
            <svg viewBox="0 0 800 500" fill="none" stroke="currentColor" style={{ color: primaryColor }} className="w-full h-full">
              <pattern id="escort-back-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect x="10" y="10" width="20" height="20" stroke="currentColor" strokeWidth="0.8" transform="rotate(45 20 20)" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#escort-back-grid)" />
            </svg>
          </div>

          {/* 1. TOP INDIAN TRICOLOR BAND WITH ASHOKA CHAKRA */}
          {cfg.showTricolor && (
            <LandscapeTricolorBand className="h-[30px]" />
          )}

          {/* 2. TOP NAVY HEADER (School Name, Laurel Seal & AUTHORISED PERSONS) */}
          <div
            className="relative z-10 px-8 py-3 flex items-center justify-between text-white"
            style={{
              backgroundColor: primaryColor,
              borderBottom: `3px solid ${accentColor}`,
            }}
          >
            {/* Left: Laurel Seal + School Name */}
            <div className="flex items-center gap-4">
              {cfg.showLaurelSeal && (
                <LaurelSeal
                  logoUrl={resolvedLogo}
                  schoolName={resolvedSchoolName}
                  accentColor={accentColor}
                  goldTextColor={goldTextColor}
                />
              )}
              <div>
                <h2 className="font-serif font-black text-[20px] tracking-wider uppercase text-white leading-tight">
                  {resolvedSchoolName}
                </h2>
                <p style={{ color: goldTextColor }} className="text-[11px] font-bold tracking-[0.2em] uppercase">
                  {resolvedCity}
                </p>
                {cfg.tagline ? (
                  <p className="text-[9px] text-stone-300 font-medium">
                    {cfg.tagline}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Middle Divider */}
            <div className="w-[1.5px] h-12 opacity-50" style={{ backgroundColor: accentColor }} />

            {/* Center: AUTHORISED PERSONS Banner */}
            <div className="text-center flex-1 px-4">
              <h1 style={{ color: goldTextColor }} className="text-[23px] font-black tracking-[0.15em] font-serif uppercase">
                {cfg.backCardTitle}
              </h1>
              <p className="text-[10px] font-extrabold tracking-wider text-stone-200 uppercase mt-0.5">
                {cfg.backSubtitle}
              </p>
            </div>

            {/* Middle Divider */}
            <div className="w-[1.5px] h-12 opacity-50" style={{ backgroundColor: accentColor }} />

            {/* Right: Pillars */}
            {cfg.showPillars && (
              <div className="flex flex-col items-center text-center space-y-0.5">
                <span style={{ color: goldTextColor }} className="text-[11px] font-black tracking-[0.2em] uppercase font-sans">
                  {cfg.frontPillars[0] || 'LEARN'}
                </span>
                <span style={{ color: goldTextColor }} className="text-[11px] font-black tracking-[0.2em] uppercase font-sans">
                  {cfg.frontPillars[1] || 'CREATE'}
                </span>
                <span style={{ color: goldTextColor }} className="text-[11px] font-black tracking-[0.2em] uppercase font-sans">
                  {cfg.frontPillars[2] || 'BELONG'}
                </span>
              </div>
            )}
          </div>

          {/* 3. CENTER 3-COLUMN AUTHORISED PERSONS ROSTER (Numbered 1, 2, 3) */}
          <div className="relative z-10 px-8 py-5 grid grid-cols-3 gap-6 my-auto">
            {personSlots.map((person, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center pt-2"
                style={{
                  borderRight: idx < 2 ? `1.5px solid ${accentColor}50` : 'none',
                  paddingRight: idx < 2 ? '24px' : '0',
                }}
              >
                {/* Person Number Badge (1, 2, 3) */}
                <div
                  className="absolute -top-1 left-2 w-9 h-9 rounded-full flex items-center justify-center font-black text-[16px] text-white z-20 shadow-md"
                  style={{ backgroundColor: accentColor }}
                >
                  {idx + 1}
                </div>

                {/* Photo Frame Container */}
                <div
                  className="w-[140px] h-[140px] rounded-2xl overflow-hidden shrink-0 flex flex-col items-center justify-center relative shadow-sm bg-stone-100 mb-4"
                  style={{
                    border: `2.5px solid ${accentColor}`,
                  }}
                >
                  {person.photo_url ? (
                    <img src={person.photo_url} alt={person.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-stone-400">
                      <svg className="w-16 h-16 text-stone-400 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <span className="text-[10px] font-black tracking-wider uppercase text-stone-400">
                        PHOTO
                      </span>
                    </div>
                  )}
                </div>

                {/* Key-Value Details (Name, Relation, Phone No., ID Proof, ID No.) */}
                <div className="w-full space-y-2 text-[14px] font-sans">
                  <div className="grid grid-cols-12 items-baseline">
                    <span className="col-span-5 font-black text-stone-900">{cfg.nameLabel}</span>
                    <span className="col-span-1 font-black text-stone-900">:</span>
                    <span style={{ color: primaryColor }} className="col-span-6 font-extrabold truncate">
                      {person.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-baseline">
                    <span className="col-span-5 font-black text-stone-900">{cfg.relationLabel}</span>
                    <span className="col-span-1 font-black text-stone-900">:</span>
                    <span style={{ color: primaryColor }} className="col-span-6 font-bold truncate">
                      {person.relationship}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-baseline">
                    <span className="col-span-5 font-black text-stone-900">{cfg.phoneLabel}</span>
                    <span className="col-span-1 font-black text-stone-900">:</span>
                    <span style={{ color: primaryColor }} className="col-span-6 font-bold font-mono truncate">
                      {person.phone}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-baseline">
                    <span className="col-span-5 font-black text-stone-900">{cfg.idProofLabel}</span>
                    <span className="col-span-1 font-black text-stone-900">:</span>
                    <span style={{ color: primaryColor }} className="col-span-6 font-bold truncate">
                      {person.id_proof}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-baseline">
                    <span className="col-span-5 font-black text-stone-900">{cfg.idNoLabel}</span>
                    <span className="col-span-1 font-black text-stone-900">:</span>
                    <span style={{ color: primaryColor }} className="col-span-6 font-bold font-mono truncate">
                      {person.id_no}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* 4. BOTTOM NAVY FOOTER: SCHOOL CONTACTS & SANSKRIT MOTTO */}
          <div
            className="absolute bottom-0 inset-x-0 h-[75px] flex items-center justify-between px-8 text-white z-20"
            style={{
              backgroundColor: primaryColor,
              borderTop: `3px solid ${accentColor}`,
            }}
          >
            {/* Left: Contact Icons (Address, Phone, Website) */}
            <div className="flex items-center gap-6 text-[12px] font-sans">
              
              {/* Address */}
              {cfg.showSchoolAddress && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: accentColor }}>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <span className="text-stone-300 font-medium max-w-[200px] truncate">
                    {cfg.schoolAddress}
                  </span>
                </div>
              )}

              {/* Phone */}
              {cfg.showSchoolPhone && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: accentColor }}>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </div>
                  <span className="text-stone-300 font-mono font-bold">
                    {cfg.schoolPhone}
                  </span>
                </div>
              )}

              {/* Website */}
              {cfg.showSchoolWebsite && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: accentColor }}>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>
                  <span className="text-stone-300 font-mono font-medium">
                    {cfg.schoolWebsite}
                  </span>
                </div>
              )}

            </div>

            {/* Right: Sanskrit Motto & Subtitle */}
            <div className="flex flex-col items-end text-right">
              <span style={{ color: goldTextColor }} className="font-serif text-[18px] font-black tracking-wide">
                {cfg.sanskritMotto}
              </span>
              <span className="text-[9.5px] font-sans font-bold tracking-[0.2em] uppercase text-stone-300">
                {cfg.englishSubtitle}
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
