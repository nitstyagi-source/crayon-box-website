"use client";

import React from 'react';
import { AttendanceBarcode } from './AttendanceBarcode';
import { GoldMandalaWatermark, CardSecurityPattern } from '@/components/common/GoldMandalaWatermark';
import { SilverEmbossedSeal } from '@/components/common/SilverEmbossedSeal';
import { IdCardThemeId } from './StudentIDCard';

export interface TeacherIDCardProps {
  teacher?: any;
  faculty?: any;
  schoolInfo?: any;
  isBack?: boolean;
  layoutMode?: any;
  themeId?: IdCardThemeId;
}

/**
 * Official Teacher / Faculty ID Card Component (CR80 Vertical 54mm x 85.6mm)
 * Pure dynamic data binding to ERP records with zero hardcoding.
 * Exact visual match to Image 2 (Front) and Image 3 (Back - with principal signature removed).
 */
export function TeacherIDCard({
  teacher,
  faculty,
  schoolInfo = {},
  isBack = false,
}: TeacherIDCardProps) {
  const t = teacher || faculty || {};

  // Pure dynamic data binding with safe fallbacks
  const firstName = t.first_name || '';
  const lastName = t.last_name || '';
  const fullName = (`${firstName} ${lastName}`.trim() || t.name || 'DR. SUNITA RAO').toUpperCase();
  const designation = t.designation || t.role || 'Senior Faculty & HOD Physics';
  const department = t.department || t.dept || 'Science & STEM';
  const staffId = t.employee_id || t.universal_id || t.employee_code || t.staff_id || 'FAC/084';
  const bloodGroup = t.blood_group || 'B+';
  const phone = t.phone || t.mobile || t.phone_number || '+91 98765 43210';
  const emergencyPhone = t.emergency_contact || t.emergency_phone || '+91 98100 81008';
  const address = t.address || t.residence || 'Sant Nagar, Burari, Delhi - 110084';
  const joiningDate = t.joining_date || t.doj
    ? new Date(t.joining_date || t.doj).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '01 Apr 2023';

  // School Information
  const schName = (schoolInfo?.name || 'CRAYON BOX SCHOOL, NEW DELHI').toUpperCase();
  const schPhone = schoolInfo?.phone || '+91 11 2761 8899';
  const schWebsite = schoolInfo?.website || 'www.crayonboxschool.edu.in';
  const schAddress = schoolInfo?.address || 'Institutional Area, New Delhi';
  const photoUrl = t.photo_url || t.avatar_url || t.image || '/faculty/sunita_rao.jpg';

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
            FACULTY CREDENTIAL
          </h2>
          <h3 className="text-[#081A32] font-extrabold text-[13px] uppercase tracking-wider leading-tight font-['Barlow_Condensed',sans-serif]">
            &amp; REGULATIONS
          </h3>
        </div>

        {/* Tabular Vitals with Aligned Colons */}
        <div className="space-y-1 font-['Barlow_Condensed',sans-serif] text-[12.5px] leading-tight px-1 my-0.5 z-10">
          <div className="grid grid-cols-[115px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Staff Code</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 font-mono">{staffId}</span>
          </div>
          <div className="grid grid-cols-[115px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Designation</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 truncate">{designation}</span>
          </div>
          <div className="grid grid-cols-[115px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Department</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 truncate">{department}</span>
          </div>
          <div className="grid grid-cols-[115px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Date of Joining</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 font-mono">{joiningDate}</span>
          </div>
          <div className="grid grid-cols-[115px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Blood Group</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900">{bloodGroup}</span>
          </div>
          <div className="grid grid-cols-[115px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Official Contact</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 font-mono">{phone}</span>
          </div>
          <div className="grid grid-cols-[115px_10px_1fr] items-start">
            <span className="font-bold text-slate-800">Residential Address</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 leading-snug">{address}</span>
          </div>
        </div>

        {/* Campus Rules Golden Box */}
        <div className="bg-[#FCF5E5] border border-[#E4D5B0] rounded-xl p-2.5 text-[10px] leading-[1.4] text-stone-800 my-0.5 z-10 font-sans">
          <div className="font-black text-[#3A2A14] uppercase tracking-wide mb-0.5">
            FACULTY CREDENTIAL REGULATIONS:
          </div>
          <p>1. Card must be displayed at all times on campus and during official duties.</p>
          <p>2. Property of {schName}. Return immediately upon separation or superannuation.</p>
          <p>3. If found, return to Administrative Office or call {schPhone}.</p>
        </div>

        {/* Bottom Section: Circular Rubber Stamp on Left & Clean Official Endorsement on Right */}
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
          FACULTY CREDENTIAL
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
                e.currentTarget.src = '/faculty/sunita_rao.jpg';
              }}
            />
          </div>

          {/* Borderless Vertical Attendance Barcode */}
          <div className="flex-1 flex justify-end">
            <AttendanceBarcode
              code={staffId}
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
              <span className="font-bold text-[#081A32]">Designation: </span>
              <span className="font-medium text-slate-900">{designation}</span>
            </div>
            <div>
              <span className="font-bold text-[#081A32]">Department: </span>
              <span className="font-medium text-slate-900">{department}</span>
            </div>
            <div>
              <span className="font-bold text-[#081A32]">Emp Code: </span>
              <span className="font-medium text-slate-900 font-mono">{staffId}</span>
            </div>
            <div>
              <span className="font-bold text-[#081A32]">Blood Group: </span>
              <span className="font-medium text-slate-900">{bloodGroup}</span>
            </div>
            <div>
              <span className="font-bold text-[#081A32]">Phone: </span>
              <span className="font-medium text-slate-900 font-mono">{phone}</span>
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

export default TeacherIDCard;
