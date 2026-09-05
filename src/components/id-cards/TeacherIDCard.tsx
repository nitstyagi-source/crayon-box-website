"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  TeacherIdCardCustomConfig,
  DEFAULT_TEACHER_ID_CARD_CONFIG,
  getTeacherIdCardConfig
} from '@/lib/id-card-config';

export interface TeacherIDCardProps {
  teacher?: any;
  faculty?: any;
  schoolInfo?: any;
  isBack?: boolean;
  layoutMode?: 'FRONT_ONLY' | 'BACK_ONLY' | 'DUAL' | 'both' | 'front' | 'back';
  config?: Partial<TeacherIdCardCustomConfig>;
  themeId?: any;
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
    <div className="w-[50px] h-[50px] relative shrink-0 flex items-center justify-center select-none">
      <svg viewBox="0 0 100 100" style={{ color: accentColor }} className="absolute inset-0 w-full h-full pointer-events-none" fill="currentColor">
        <path d="M 49 92 C 30 88 15 75 13 52 C 11 34 20 20 32 12 C 31 18 34 24 38 28 C 28 34 22 44 22 56 C 22 69 34 81 49 84 Z" opacity="0.95" />
        <path d="M 51 92 C 70 88 85 75 87 52 C 89 34 80 20 68 12 C 69 18 66 24 62 28 C 72 34 78 44 78 56 C 78 69 66 81 51 84 Z" opacity="0.95" />
        <polygon points="50,86 52,90.5 56.5,90.5 53,93 54.5,97.5 50,95 45.5,97.5 47,93 43.5,90.5 48,90.5" fill={accentColor} />
      </svg>
      <div className="relative z-10 w-[30px] h-[30px] rounded-full flex flex-col items-center justify-center overflow-hidden">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
        ) : (
          <div style={{ color: goldTextColor }} className="text-center leading-[0.85] font-black text-[6.2pt] tracking-tight uppercase font-sans">
            YOUR<br />LOGO<br />HERE
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Official Teacher / Faculty ID Card Component (CR80 Vertical 54mm x 85.6mm)
 * Exact 1:1 visual match to reference image (media_1788638761923.jpg).
 */
export function TeacherIDCard({
  teacher,
  faculty,
  schoolInfo = {},
  isBack = false,
  layoutMode = 'FRONT_ONLY',
  config: propsConfig,
}: TeacherIDCardProps) {
  const t = teacher || faculty || {};

  // If layoutMode is DUAL or 'both', render Front and Back side-by-side
  if (layoutMode === 'DUAL' || layoutMode === 'both') {
    return (
      <div className="flex flex-wrap items-start justify-center gap-6">
        <TeacherIDCard teacher={teacher} faculty={faculty} schoolInfo={schoolInfo} isBack={false} layoutMode="FRONT_ONLY" config={propsConfig} />
        <TeacherIDCard teacher={teacher} faculty={faculty} schoolInfo={schoolInfo} isBack={true} layoutMode="BACK_ONLY" config={propsConfig} />
      </div>
    );
  }

  const institutionCode = schoolInfo?.code || t?.institution_code || t?.school_code || 'DEFAULT';
  const [persistedConfig, setPersistedConfig] = useState<TeacherIdCardCustomConfig>(() => getTeacherIdCardConfig(institutionCode));

  useEffect(() => {
    setPersistedConfig(getTeacherIdCardConfig(institutionCode));

    const handleConfigUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (
        !customEvent.detail?.institutionCode ||
        customEvent.detail.institutionCode === institutionCode ||
        customEvent.detail.institutionCode === 'ALL' ||
        institutionCode === 'DEFAULT'
      ) {
        setPersistedConfig(getTeacherIdCardConfig(institutionCode));
      }
    };

    window.addEventListener('teacher_idcard_config_updated', handleConfigUpdate);
    return () => {
      window.removeEventListener('teacher_idcard_config_updated', handleConfigUpdate);
    };
  }, [institutionCode]);

  // Combine defaults, persisted config, and props override
  const cfg: TeacherIdCardCustomConfig = useMemo(() => {
    return {
      ...DEFAULT_TEACHER_ID_CARD_CONFIG,
      ...persistedConfig,
      ...(propsConfig || {}),
    };
  }, [persistedConfig, propsConfig]);

  const shouldRenderBack = isBack || layoutMode === 'BACK_ONLY' || layoutMode === 'back';

  // Dynamic ERP Data Binding
  const rawName = (t.name || `${t.first_name || ''} ${t.last_name || ''}`).trim() || 'TEACHER NAME';
  const nameParts = rawName.split(' ');
  const firstName = (t.first_name || nameParts[0] || 'TEACHER').toUpperCase();
  const lastName = (t.last_name || nameParts.slice(1).join(' ') || 'NAME').toUpperCase();
  const fullName = `${firstName} ${lastName}`.trim();

  const designation = t.designation || t.role || 'Senior Faculty';
  const department = t.department || t.dept || 'Department';
  const staffId = t.employee_id || t.universal_id || t.employee_code || t.staff_id || 'Employee ID';
  const phone = t.phone || t.mobile || t.phone_number || schoolInfo?.phone || '+91 11 2761 8899';
  const email = t.email || `${firstName.toLowerCase()}@schooldomain.edu.in`;
  const address = t.address || t.residence || `${schoolInfo?.address || 'School Address, City, PIN Code'}`;
  const joiningDate = t.joining_date || t.doj
    ? new Date(t.joining_date || t.doj).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'DD MMM YYYY';

  // School Information (Dynamic with custom overrides from cfg, NO CBSE default)
  const schName = (cfg.schoolName || schoolInfo?.name || 'SCHOOL NAME').replace(', NEW DELHI', '').trim().toUpperCase();
  const schCity = (cfg.city || schoolInfo?.city || 'LOCATION / CITY').toUpperCase();
  const schTagline = cfg.tagline !== undefined ? cfg.tagline : (schoolInfo?.boardAffiliation || schoolInfo?.affiliation || '');
  const schPhone = cfg.customPhone || schoolInfo?.phone || '+91 11 2761 8899';
  const schWebsite = cfg.customWebsite || schoolInfo?.website || 'www.schoolwebsite.edu.in';
  const schoolLogo = cfg.customLogoUrl || schoolInfo?.logoUrl || t.school_logo;
  const photoUrl = t.photo_url || t.avatar_url || t.image;

  // =============================================================
  // BACK FACE: EXACT 1:1 MATCH TO REFERENCE IMAGE (RIGHT SIDE)
  // =============================================================
  if (shouldRenderBack) {
    return (
      <div 
        style={{ 
          WebkitPrintColorAdjust: 'exact', 
          printColorAdjust: 'exact',
          backgroundColor: cfg.cardBgColor,
        }}
        className="w-[340px] h-[540px] rounded-2xl shadow-xl relative overflow-hidden flex flex-col border border-stone-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none justify-between font-sans"
      >
        {/* Subtle Geometric Background Watermark */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035] z-0"
          style={{
            backgroundImage: `radial-gradient(${cfg.accentColor} 1.5px, transparent 1.5px), radial-gradient(${cfg.accentColor} 1.5px, ${cfg.cardBgColor} 1.5px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        />

        {/* 1. Top Tricolor Header with Ashoka Chakra */}
        {cfg.showTricolor && <TricolorBand className="z-20" />}

        {/* 2. Header Title */}
        <div className="text-center pt-2 pb-1 z-10 shrink-0">
          <h2 
            style={{ color: cfg.primaryColor }}
            className="font-black text-[18px] uppercase tracking-wider font-['Barlow_Condensed',sans-serif]"
          >
            {cfg.backHeaderTitle || 'IMPORTANT INFORMATION'}
          </h2>
          <div 
            style={{ backgroundColor: cfg.accentColor }} 
            className="w-14 h-[2.5px] mx-auto mt-1 rounded-full"
          />
        </div>

        {/* 3. Tabular Vitals with Aligned Colons & Icons matching reference */}
        <div className="space-y-1.5 font-['Barlow_Condensed',sans-serif] text-[13.5px] leading-snug px-6 z-10">
          {/* Name */}
          {cfg.showBackName && (
            <div className="grid grid-cols-[105px_12px_1fr] items-baseline">
              <span style={{ color: cfg.primaryColor }} className="font-bold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
                {cfg.nameLabel || 'Name'}
              </span>
              <span style={{ color: cfg.primaryColor }} className="font-bold">:</span>
              <span className="font-semibold text-slate-800 truncate">{fullName}</span>
            </div>
          )}

          {/* Designation */}
          {cfg.showBackDesignation && (
            <div className="grid grid-cols-[105px_12px_1fr] items-baseline">
              <span style={{ color: cfg.primaryColor }} className="font-bold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
                </svg>
                {cfg.designationLabel || 'Designation'}
              </span>
              <span style={{ color: cfg.primaryColor }} className="font-bold">:</span>
              <span className="font-semibold text-slate-800 truncate">{designation}</span>
            </div>
          )}

          {/* Department */}
          {cfg.showBackDepartment && (
            <div className="grid grid-cols-[105px_12px_1fr] items-baseline">
              <span style={{ color: cfg.primaryColor }} className="font-bold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                {cfg.departmentLabel || 'Department'}
              </span>
              <span style={{ color: cfg.primaryColor }} className="font-bold">:</span>
              <span className="font-semibold text-slate-800 truncate">{department}</span>
            </div>
          )}

          {/* Contact No. */}
          {cfg.showContactNo && (
            <div className="grid grid-cols-[105px_12px_1fr] items-baseline">
              <span style={{ color: cfg.primaryColor }} className="font-bold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                {cfg.contactNoLabel || 'Contact No.'}
              </span>
              <span style={{ color: cfg.primaryColor }} className="font-bold">:</span>
              <span className="font-semibold text-slate-800 font-mono truncate">{phone}</span>
            </div>
          )}

          {/* Email */}
          {cfg.showEmail && (
            <div className="grid grid-cols-[105px_12px_1fr] items-baseline">
              <span style={{ color: cfg.primaryColor }} className="font-bold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                {cfg.emailLabel || 'Email'}
              </span>
              <span style={{ color: cfg.primaryColor }} className="font-bold">:</span>
              <span className="font-semibold text-slate-800 truncate lowercase text-[12.5px]">{email}</span>
            </div>
          )}

          {/* Address */}
          {cfg.showAddress && (
            <div className="grid grid-cols-[105px_12px_1fr] items-start">
              <span style={{ color: cfg.primaryColor }} className="font-bold flex items-center gap-2 pt-0.5">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                {cfg.addressLabel || 'Address'}
              </span>
              <span style={{ color: cfg.primaryColor }} className="font-bold pt-0.5">:</span>
              <span className="font-semibold text-slate-800 leading-tight whitespace-pre-line">{address}</span>
            </div>
          )}
        </div>

        {/* 4. Refined Card Guidelines Box (Exact match to Reference media_1788638761923.jpg) */}
        <div 
          style={{ borderColor: `${cfg.accentColor}90` }}
          className="mx-5 bg-[#FDFBF7] border rounded-xl p-3 z-10 font-sans shadow-2xs"
        >
          <div className="flex items-center gap-2 mb-2">
            <span 
              style={{ color: cfg.primaryColor }}
              className="font-bold text-[12px] uppercase tracking-wider font-['Barlow_Condensed',sans-serif]"
            >
              {cfg.guidelinesTitle || 'CARD GUIDELINES'}
            </span>
            <div style={{ backgroundColor: cfg.accentColor }} className="flex-1 h-[1px]"></div>
          </div>
          <div style={{ color: cfg.primaryColor }} className="space-y-1.5 text-[10.5px] leading-tight">
            <div className="flex items-start gap-2">
              <span 
                style={{ backgroundColor: cfg.accentColor }}
                className="w-4 h-4 rounded-full text-white font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5"
              >
                01
              </span>
              <span className="font-medium">{cfg.guideline1}</span>
            </div>
            <div className="flex items-start gap-2">
              <span 
                style={{ backgroundColor: cfg.accentColor }}
                className="w-4 h-4 rounded-full text-white font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5"
              >
                02
              </span>
              <span className="font-medium">{cfg.guideline2}</span>
            </div>
            <div className="flex items-start gap-2">
              <span 
                style={{ backgroundColor: cfg.accentColor }}
                className="w-4 h-4 rounded-full text-white font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5"
              >
                03
              </span>
              <span className="font-medium">{cfg.guideline3}</span>
            </div>
            <div className="flex items-start gap-2">
              <span 
                style={{ backgroundColor: cfg.accentColor }}
                className="w-4 h-4 rounded-full text-white font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5"
              >
                04
              </span>
              <span className="font-medium">{cfg.guideline4}</span>
            </div>
          </div>
        </div>

        {/* 5. Curved Navy Bottom Footer with School Contact & Pillars */}
        <div 
          style={{ backgroundColor: cfg.primaryColor }}
          className="relative text-white pt-4 pb-3 px-4 z-20 shrink-0"
        >
          {/* Arched Top Line */}
          <svg 
            viewBox="0 0 340 12" 
            className="absolute -top-[11px] left-0 w-full h-3 pointer-events-none"
            preserveAspectRatio="none"
          >
            <path d="M 0,12 Q 170,0 340,12 L 340,12 L 0,12 Z" fill={cfg.primaryColor} />
            <path d="M 0,12 Q 170,0 340,12" fill="none" stroke={cfg.accentColor} strokeWidth="2.5" />
          </svg>

          <div className="flex items-center justify-between">
            {/* Left: School Contact info */}
            <div className="text-left flex-1 min-w-0 pr-3">
              <span className="font-bold text-[12px] uppercase tracking-wider block text-white font-['Barlow_Condensed',sans-serif] truncate">
                {schName}
              </span>
              <div className="flex items-center gap-2 text-[8.5px] text-slate-300 mt-0.5 font-sans flex-wrap">
                <span className="flex items-center gap-1 truncate">
                  <svg style={{ color: cfg.accentColor }} className="w-2.5 h-2.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-.2c0-1.4-1.4-1.8-1.8-1.8H7a2 2 0 00-2 2v.2a5.96 5.96 0 01-.668-8.173z" clipRule="evenodd"/>
                  </svg>
                  {schWebsite}
                </span>
                <span style={{ color: cfg.accentColor }}>|</span>
                <span className="flex items-center gap-1 truncate">
                  <svg style={{ color: cfg.accentColor }} className="w-2.5 h-2.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  {schPhone}
                </span>
              </div>
            </div>

            {/* Right: Institutional Pillars */}
            <div 
              style={{ borderLeftColor: `${cfg.accentColor}80` }}
              className="border-l pl-3 text-right shrink-0"
            >
              {(cfg.backPillars || ['PEOPLE', 'PURPOSE', 'PROGRESS']).map((p, idx) => (
                <span 
                  key={idx} 
                  style={{ color: cfg.goldTextColor }} 
                  className="text-[7.5px] font-bold tracking-widest block leading-tight"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // FRONT FACE: EXACT 1:1 MATCH TO REFERENCE IMAGE (LEFT SIDE)
  // =============================================================
  return (
    <div 
      style={{ 
        WebkitPrintColorAdjust: 'exact', 
        printColorAdjust: 'exact',
        backgroundColor: cfg.cardBgColor,
      }}
      className="w-[340px] h-[540px] rounded-2xl shadow-xl relative overflow-hidden flex flex-col border border-stone-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none justify-between font-sans"
    >
      {/* Subtle Geometric Background Watermark */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] z-0"
        style={{
          backgroundImage: `radial-gradient(${cfg.accentColor} 1.5px, transparent 1.5px), radial-gradient(${cfg.accentColor} 1.5px, ${cfg.cardBgColor} 1.5px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* 1. Top Flush Tricolor Band with Ashoka Chakra */}
      {cfg.showTricolor && <TricolorBand className="z-20" />}

      {/* 2. Deep Royal Navy Header with Convex Curved Bottom & Gold Accent */}
      <div 
        style={{ backgroundColor: cfg.primaryColor }}
        className="relative text-white pt-2 pb-5 px-3 z-20 shrink-0"
      >
        <div className="flex items-center justify-between">
          {/* Left: School Laurel Crest / Logo Seal */}
          {cfg.showLaurelSeal && (
            <LaurelSeal 
              logoUrl={schoolLogo} 
              schoolName={schName} 
              accentColor={cfg.accentColor}
              goldTextColor={cfg.goldTextColor}
            />
          )}

          {/* Center: School Branding */}
          <div className="flex-1 text-center px-1">
            <h1 className="font-bold text-[14.5px] uppercase tracking-wider text-white font-serif leading-tight">
              {schName}
            </h1>
            <p 
              style={{ color: cfg.goldTextColor }}
              className="font-bold text-[9px] uppercase tracking-[0.22em] font-sans leading-none mt-0.5"
            >
              {schCity}
            </p>
            {schTagline ? (
              <>
                <div 
                  style={{ backgroundColor: `${cfg.accentColor}B3` }} 
                  className="w-24 h-[1px] mx-auto my-1"
                />
                <p className="text-slate-200 text-[8.5px] tracking-wider font-sans leading-none opacity-90">
                  {schTagline}
                </p>
              </>
            ) : null}
          </div>

          {/* Right: Institutional Pillars */}
          {cfg.showPillars && (
            <div 
              style={{ borderLeftColor: `${cfg.accentColor}80` }}
              className="border-l pl-2 text-right shrink-0"
            >
              {(cfg.frontPillars || ['LEARN', 'CREATE', 'BELONG']).map((p, idx) => (
                <span 
                  key={idx} 
                  style={{ color: cfg.goldTextColor }}
                  className="text-[7.5px] font-bold tracking-widest block leading-tight"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Elegant Convex Bottom Curve with Gold Line */}
        <svg 
          viewBox="0 0 340 18" 
          className="absolute -bottom-[1px] left-0 w-full h-3.5 pointer-events-none"
          preserveAspectRatio="none"
        >
          <path d="M 0,0 Q 170,18 340,0 L 340,18 L 0,18 Z" fill={cfg.cardBgColor} />
          <path d="M 0,0 Q 170,18 340,0" fill="none" stroke={cfg.accentColor} strokeWidth="2.5" />
        </svg>
      </div>

      {/* 3. Middle Body: Photo Frame on Left + Faculty Identity/Vitals on Right */}
      <div className="px-5 pt-1 pb-0 flex-1 flex flex-col justify-around z-10">
        <div className="flex items-center justify-between">
          {/* Framed Faculty Photograph (3:4 aspect ratio with gold border) */}
          <div 
            style={{ borderColor: cfg.accentColor }}
            className="w-[122px] h-[155px] rounded-lg border-2 shadow-sm overflow-hidden bg-slate-100 shrink-0 relative select-none"
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
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
                  TEACHER<br />PHOTO
                </span>
              </div>
            )}
          </div>

          {/* Hero Category, Name & Tabular Vitals matching reference media_1788638761923.jpg */}
          <div className="flex-1 pl-4 flex flex-col justify-center">
            {/* Category Tag (e.g. FACULTY) */}
            {cfg.showCategoryTag && (
              <span 
                style={{ color: cfg.accentColor }}
                className="text-[12px] font-bold tracking-wider uppercase font-['Barlow_Condensed',sans-serif] block"
              >
                {cfg.categoryTag || 'FACULTY'}
              </span>
            )}

            {/* Hero Teacher Name */}
            <h2 
              style={{ color: cfg.primaryColor }}
              className="font-black text-[23px] leading-[1.05] tracking-tight uppercase font-['Barlow_Condensed',sans-serif]"
            >
              {firstName}<br />{lastName}
            </h2>

            {/* Gold Horizontal Accent Line */}
            <div 
              style={{ backgroundColor: cfg.accentColor }}
              className="w-12 h-[2.5px] rounded-full my-1.5"
            />

            {/* Key-Value Vitals with Aligned Colons */}
            <div className="space-y-1 font-['Barlow_Condensed',sans-serif] text-[13.5px] leading-tight">
              {cfg.showDesignation && (
                <div className="grid grid-cols-[82px_10px_1fr] items-baseline">
                  <span style={{ color: cfg.primaryColor }} className="font-bold">{cfg.designationLabel}</span>
                  <span style={{ color: cfg.primaryColor }} className="font-bold">:</span>
                  <span className="font-semibold text-slate-800 truncate">{designation}</span>
                </div>
              )}
              {cfg.showDepartment && (
                <div className="grid grid-cols-[82px_10px_1fr] items-baseline">
                  <span style={{ color: cfg.primaryColor }} className="font-bold">{cfg.departmentLabel}</span>
                  <span style={{ color: cfg.primaryColor }} className="font-bold">:</span>
                  <span className="font-semibold text-slate-800 truncate">{department}</span>
                </div>
              )}
              {cfg.showEmployeeId && (
                <div className="grid grid-cols-[82px_10px_1fr] items-baseline">
                  <span style={{ color: cfg.primaryColor }} className="font-bold">{cfg.employeeIdLabel}</span>
                  <span style={{ color: cfg.primaryColor }} className="font-bold">:</span>
                  <span className="font-semibold text-slate-800 font-mono truncate">{staffId}</span>
                </div>
              )}
              {cfg.showDoj && (
                <div className="grid grid-cols-[82px_10px_1fr] items-baseline">
                  <span style={{ color: cfg.primaryColor }} className="font-bold">{cfg.dojLabel}</span>
                  <span style={{ color: cfg.primaryColor }} className="font-bold">:</span>
                  <span className="font-semibold text-slate-800 font-mono truncate">{joiningDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Sanskrit Motto in Devanagari & English Subtitle above footer */}
        {cfg.showMotto && (
          <div className="text-center pt-2 pb-1">
            <span 
              style={{ color: cfg.accentColor }}
              className="font-serif font-bold text-[16px] tracking-wide block font-['Noto_Serif_Devanagari',serif] leading-tight"
            >
              {cfg.sanskritMotto}
            </span>
            <span className="text-[7.5px] font-sans font-bold text-stone-500 tracking-[0.25em] uppercase leading-none block mt-1">
              {cfg.englishSubtitle}
            </span>
          </div>
        )}
      </div>

      {/* 5. Curved Navy Footer with Core Values: SAFE | KIND | CURIOUS | CONFIDENT */}
      <div 
        style={{ backgroundColor: cfg.primaryColor }}
        className="relative text-center pt-4 pb-3 px-3 shrink-0 z-20"
      >
        {/* Concave Top Curve with Gold Line */}
        <svg 
          viewBox="0 0 340 18" 
          className="absolute -top-[17px] left-0 w-full h-4 pointer-events-none"
          preserveAspectRatio="none"
        >
          <path d="M 0,18 Q 170,0 340,18 L 340,18 L 0,18 Z" fill={cfg.primaryColor} />
          <path d="M 0,18 Q 170,0 340,18" fill="none" stroke={cfg.accentColor} strokeWidth="2.5" />
        </svg>

        {cfg.showCoreValues && (
          <div className="flex items-center justify-center gap-2 text-white font-['Barlow_Condensed',sans-serif] text-[10px] font-bold tracking-[0.22em] uppercase">
            {(cfg.coreValues || ['SAFE', 'KIND', 'CURIOUS', 'CONFIDENT']).map((val, idx, arr) => (
              <React.Fragment key={idx}>
                <span>{val}</span>
                {idx < arr.length - 1 && <span style={{ color: cfg.accentColor }}>|</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherIDCard;

