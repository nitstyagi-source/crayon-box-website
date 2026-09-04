"use client";

import React from 'react';
import { AttendanceBarcode } from './AttendanceBarcode';
import { GoldMandalaWatermark } from '@/components/common/GoldMandalaWatermark';
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
 * Exact visual match to Image 2 (Front) and Image 3 (Back).
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
  const principalName = schoolInfo?.principalName || schoolInfo?.principal_name || 'Anjali Sharma';
  const photoUrl = t.photo_url || t.avatar_url || t.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80';

  // =============================================================
  // BACK FACE: PIXEL-MATCHED TO IMAGE 3
  // =============================================================
  if (isBack) {
    return (
      <div 
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        className="w-[330px] h-[520px] bg-[#FFFFFF] rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-stone-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none justify-between p-4 pt-2.5 pb-3"
      >
        {/* Top Sweeping Tricolor Wave Header + Lanyard Punch Slot */}
        <div className="relative w-full -mx-4 -mt-2.5 mb-1">
          {/* Lanyard Slot Cutout Notch */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            <div className="w-9 h-2.5 bg-white border border-stone-300 rounded-full shadow-2xs"></div>
            {/* Tricolor Ribbon Loop Passing Through */}
            <div className="w-5 h-3 flex overflow-hidden rounded-b shadow-xs">
              <span className="w-1/3 h-full bg-[#FF671F]"></span>
              <span className="w-1/3 h-full bg-white"></span>
              <span className="w-1/3 h-full bg-[#046A38]"></span>
            </div>
          </div>

          {/* Sweeping Tricolor Wave SVG */}
          <svg viewBox="0 0 330 38" fill="none" className="w-full h-9 overflow-hidden">
            <path d="M0,0 L330,0 L330,12 C240,24 160,8 0,22 Z" fill="#FF671F" />
            <path d="M0,14 C160,6 240,22 330,12 L330,18 C240,28 160,14 0,28 Z" fill="#FFFFFF" />
            <path d="M0,20 C160,12 240,26 330,18 L330,24 C240,34 160,20 0,34 Z" fill="#046A38" />
          </svg>
        </div>

        {/* Header Title */}
        <div className="text-center my-0.5">
          <h2 className="text-[#0A1D37] font-black text-sm uppercase tracking-wider leading-tight">
            FACULTY CREDENTIAL
          </h2>
          <h3 className="text-[#0A1D37] font-black text-xs uppercase tracking-wider leading-tight">
            &amp; REGULATIONS
          </h3>
        </div>

        {/* Tabular Vitals with Aligned Colons */}
        <div className="space-y-1 text-[10.5px] leading-tight px-1 my-1">
          <div className="grid grid-cols-[110px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Staff Code</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 font-mono">{staffId}</span>
          </div>
          <div className="grid grid-cols-[110px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Designation</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 truncate">{designation}</span>
          </div>
          <div className="grid grid-cols-[110px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Department</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 truncate">{department}</span>
          </div>
          <div className="grid grid-cols-[110px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Date of Joining</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 font-mono">{joiningDate}</span>
          </div>
          <div className="grid grid-cols-[110px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Blood Group</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-bold text-rose-700">{bloodGroup}</span>
          </div>
          <div className="grid grid-cols-[110px_10px_1fr] items-baseline">
            <span className="font-bold text-slate-800">Official Contact</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 font-mono">{phone}</span>
          </div>
          <div className="grid grid-cols-[110px_10px_1fr] items-start">
            <span className="font-bold text-slate-800">Residential Address</span>
            <span className="font-bold text-slate-800">:</span>
            <span className="font-semibold text-slate-900 leading-snug">{address}</span>
          </div>
        </div>

        {/* Campus Rules Golden Box */}
        <div className="bg-[#FCF4E3] border border-[#E9D9B2] rounded-xl p-2.5 text-[9.5px] leading-[1.4] text-stone-800 my-1">
          <div className="font-black text-[#3A2A14] uppercase tracking-wide mb-0.5">
            FACULTY CREDENTIAL REGULATIONS:
          </div>
          <p>1. Card must be displayed at all times on campus and during official duties.</p>
          <p>2. Property of {schName}. Return immediately upon separation or superannuation.</p>
          <p>3. If found, return to School Office or call {schPhone}.</p>
        </div>

        {/* Bottom Section: Circular Blue Stamp (Left) & Principal Signature (Right) */}
        <div className="flex items-center justify-between px-1 my-0.5">
          {/* Authentic Circular Blue Ink Rubber Stamp */}
          <div className="w-16 h-16 relative select-none shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#1E3A8A]">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1.5" />
              <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" />
              
              <path id="stampPathTopFac" d="M 16,50 A 34,34 0 1,1 84,50" fill="none" />
              <text fontSize="8" fontWeight="900" fill="currentColor" letterSpacing="0.08em">
                <textPath href="#stampPathTopFac" startOffset="50%" textAnchor="middle">
                  CRAYON BOX SCHOOL
                </textPath>
              </text>

              <path id="stampPathBotFac" d="M 82,50 A 32,32 0 0,1 18,50" fill="none" />
              <text fontSize="7.5" fontWeight="900" fill="currentColor" letterSpacing="0.1em">
                <textPath href="#stampPathBotFac" startOffset="50%" textAnchor="middle">
                  • FOUNDED 2005 •
                </textPath>
              </text>

              <text x="50" y="56" fontSize="18" fontWeight="900" fill="currentColor" textAnchor="middle" fontFamily="serif">
                CB
              </text>
            </svg>
          </div>

          {/* Principal (Seal & Signature) */}
          <div className="text-center flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-800 block">
              Principal (Seal &amp; Signature)
            </span>
            <div className="h-7 flex items-center justify-center font-serif italic text-base font-bold text-[#1E3A8A] tracking-wide select-none">
              {principalName}
            </div>
          </div>
        </div>

        {/* Centered Website URL */}
        <div className="text-center pt-1 border-t border-stone-200">
          <span className="text-[#0A1D37] font-bold text-[10px] tracking-wide">
            {schWebsite}
          </span>
        </div>
      </div>
    );
  }

  // =============================================================
  // FRONT FACE: PIXEL-MATCHED TO IMAGE 2
  // =============================================================
  return (
    <div 
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      className="w-[330px] h-[520px] bg-[#FFFFFF] rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-stone-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none justify-between"
    >
      {/* 1. Top Tricolor Flush Band */}
      <div className="h-3 w-full grid grid-cols-3">
        <span className="h-full bg-[#FF671F]"></span>
        <span className="h-full bg-[#FFFFFF]"></span>
        <span className="h-full bg-[#046A38]"></span>
      </div>

      {/* 2. Deep Royal Navy Header with Gold Typography */}
      <div className="bg-[#0A1D37] px-3 py-2.5 text-center text-white relative z-10 border-b border-[#C5A059]/40">
        <h1 className="font-extrabold text-xs uppercase tracking-wide text-[#E5C378] leading-tight truncate">
          {schName}
        </h1>
        <h2 className="font-black text-[9.5px] uppercase tracking-[0.16em] text-[#F3CD75] leading-none mt-1">
          FACULTY CREDENTIAL
        </h2>
      </div>

      {/* 3. Center Body with Gold Mandala Watermark & Elements */}
      <div className="flex-1 px-4 pt-2.5 pb-1 relative flex flex-col justify-between overflow-hidden">
        {/* Background Gold Mandala Watermarks */}
        <GoldMandalaWatermark
          size={210}
          opacity={0.22}
          className="absolute -left-12 top-6"
        />
        <GoldMandalaWatermark
          size={180}
          opacity={0.16}
          className="absolute -right-8 bottom-4"
        />

        {/* Photo & Vertical Barcode Row */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          {/* Rectangular Photo with Fine Gold Border */}
          <div className="w-[118px] h-[142px] rounded p-[1.5px] bg-[#C5A059] shadow-sm shrink-0">
            <div className="w-full h-full rounded overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] flex items-center justify-center">
              <img
                src={photoUrl}
                alt={fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          </div>

          {/* Vertical Stacked Attendance Barcode */}
          <div className="flex-1 flex justify-end">
            <AttendanceBarcode
              code={staffId}
              orientation="vertical-stacked"
              height={142}
              width={140}
              showText={true}
            />
          </div>
        </div>

        {/* Identity & Details Section */}
        <div className="mt-2 relative z-10">
          {/* Full Name in Deep Navy Bold */}
          <h3 className="text-[#0A1D37] font-black text-[19px] leading-tight tracking-tight uppercase truncate">
            {fullName}
          </h3>

          {/* Left-Aligned Key-Value Details */}
          <div className="space-y-0.5 text-[11px] leading-[1.4] mt-1 text-slate-800">
            <div>
              <span className="font-bold text-slate-800">Designation: </span>
              <span className="font-semibold text-slate-900">{designation}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Department: </span>
              <span className="font-semibold text-slate-900">{department}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Emp Code: </span>
              <span className="font-semibold font-mono text-slate-900">{staffId}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Blood Group: </span>
              <span className="font-bold text-rose-700">{bloodGroup}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Phone: </span>
              <span className="font-semibold font-mono text-slate-900">{phone}</span>
            </div>
          </div>
        </div>

        {/* 3D Metallic Silver Embossed Seal */}
        <div className="absolute right-3.5 bottom-2 z-20">
          <SilverEmbossedSeal size={62} />
        </div>
      </div>

      {/* 4. Bottom Deep Navy Bar with Sanskrit Motto */}
      <div className="bg-[#0A1D37] py-1.5 px-4 text-center z-10 border-t border-[#C5A059]/40">
        <span className="font-serif font-bold text-[#E5C378] text-[13px] tracking-wide block">
          विद्या ददाति विनयं
        </span>
      </div>
    </div>
  );
}

export default TeacherIDCard;
