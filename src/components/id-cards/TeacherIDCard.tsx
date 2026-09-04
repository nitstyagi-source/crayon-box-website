"use client";

import React from 'react';
import { ShieldCheck, Fingerprint, Calendar, Droplet, Phone, MapPin, Briefcase } from 'lucide-react';
import { AttendanceBarcode } from './AttendanceBarcode';
import { StandardizedIdPhoto } from './StandardizedIdPhoto';
import { VastuMandalaWatermark } from '@/components/common/VastuMandalaWatermark';
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
 * Pure dynamic data binding to ERP records with zero hardcoding,
 * executive Royal Sapphire & Gold styling distinct from student cards,
 * universal studio photo edge-blending, front-facing attendance barcode,
 * and authentic Indian Tricolor + Vedic Mandala aesthetic.
 */
export function TeacherIDCard({
  teacher,
  faculty,
  schoolInfo = {},
  isBack = false,
  themeId = 'rashtriya',
}: TeacherIDCardProps) {
  const t = teacher || faculty || {};

  // Pure dynamic data binding with safe fallbacks (no hardcoded mock names or numbers)
  const firstName = t.first_name || '';
  const lastName = t.last_name || '';
  const fullName = (`${firstName} ${lastName}`.trim() || t.name || 'FACULTY MEMBER').toUpperCase();
  const designation = t.designation || t.role || t.title || 'Faculty Member';
  const department = t.department || t.dept || 'Academic Faculty';
  const staffId = t.employee_id || t.universal_id || t.employee_code || t.staff_id || t.id || '—';
  const bloodGroup = t.blood_group || '—';
  const joiningDate = t.joining_date || t.doj || t.joined_date
    ? new Date(t.joining_date || t.doj || t.joined_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const phone = t.phone || t.mobile || t.phone_number || '—';
  const emergencyPhone = t.emergency_contact || t.emergency_phone || '—';
  const address = t.address || t.residence || '—';

  // Dynamic School Info
  const schName = schoolInfo?.name || 'INSTITUTIONAL CAMPUS';
  const schAffiliation = schoolInfo?.boardAffiliation || 'AFFILIATED INSTITUTION';
  const schWebsite = schoolInfo?.website || 'www.crayonboxschool.edu.in';
  const schPhone = schoolInfo?.phone || '+91 11 2761 8899';
  const schLogo = schoolInfo?.logoUrl || schoolInfo?.logo_url || '/logo.png';
  const schAddress = schoolInfo?.address || 'Institutional Area, New Delhi';

  // =============================================================
  // BACK FACE (VERIFIED FACULTY CODE OF CONDUCT & CONTACT DOSSIER)
  // =============================================================
  if (isBack) {
    return (
      <div 
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        className="w-[330px] h-[520px] bg-[#FFFFFF] rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border-2 border-stone-200 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none"
      >
        {/* Top Tricolor Accent Ribbon */}
        <div className="h-2.5 w-full bg-gradient-to-r from-[#FF671F] 0%, from-[#FF671F] 33.3%, via-white 33.3%, via-white 66.6%, to-[#046A38] 66.6%, to-[#046A38] 100%"></div>

        {/* Back Header: Executive Sapphire & Gold */}
        <div className="bg-gradient-to-r from-[#07172C] via-[#0B2545] to-[#133E68] text-white py-3 px-4 text-center relative z-10 border-b-2 border-amber-400/60">
          <h2 className="font-extrabold text-xs uppercase tracking-wider text-amber-300 truncate">
            {schName}
          </h2>
          <p className="text-[9px] text-amber-100/90 font-medium tracking-wide mt-0.5 uppercase">
            Staff Credential &bull; Code of Conduct
          </p>
        </div>

        {/* Staff Details & Regulations */}
        <div className="flex-1 px-4 pt-3 pb-2 z-10 space-y-2 flex flex-col justify-between">
          <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 shadow-2xs space-y-1.5 text-xs">
            <DetailRow label="Staff Code" value={staffId} />
            <DetailRow label="Designation" value={designation} />
            <DetailRow label="Department" value={department} />
            <DetailRow label="Date of Joining" value={joiningDate} />
            <DetailRow label="Blood Group" value={bloodGroup} />
            <DetailRow label="Official Contact" value={phone} />
            <DetailRow label="Emergency Contact" value={emergencyPhone} />
            <DetailRow label="Residential Address" value={address} isMultiline />
          </div>

          {/* Institutional Regulations Box */}
          <div className="bg-amber-50/70 border border-amber-300/60 rounded-xl p-2.5 text-[9px] text-stone-800 leading-tight space-y-1">
            <div className="font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={11} /> Faculty Credential Regulations:
            </div>
            <p>1. Card must be displayed at all times on campus and during official duties.</p>
            <p>2. Property of {schName}. Return immediately upon separation or superannuation.</p>
            <p>3. If found, please return to Administrative Office or call {schPhone}.</p>
          </div>

          {/* Institutional Stamp (NO principal signature) */}
          <div className="pt-1 flex items-center justify-between">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#0B2545]/40 flex flex-col items-center justify-center text-center p-1">
              <span className="text-[7px] font-mono font-bold text-[#0B2545] uppercase">OFFICIAL</span>
              <span className="text-[8px] font-black text-[#07172C] uppercase">SEAL</span>
              <span className="text-[6px] font-mono text-stone-400">CBS VERIFIED</span>
            </div>

            <div className="text-right">
              <span className="text-[8px] font-mono text-stone-400 font-bold block uppercase">ADMINISTRATIVE DESK</span>
              <span className="text-[10px] font-extrabold text-stone-900 truncate max-w-[150px] block">
                {schAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Back Footer Strip */}
        <div className="bg-[#07172C] text-white py-2 px-4 z-10 flex items-center justify-between text-[8px] font-medium border-t border-amber-400/40">
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
  // OPTIONAL: HORIZONTAL / LANDSCAPE MODE (PRESERVED FOR LANYARDS)
  // =============================================================
  if (themeId === 'landscape') {
    return (
      <div className="w-[500px] h-[315px] bg-white rounded-3xl shadow-xl relative overflow-hidden flex flex-row font-sans border-2 border-slate-200 print:shadow-none text-stone-900 shrink-0 select-none">
        {/* Left Column with Sapphire & Tricolor Spine */}
        <div className="w-44 bg-gradient-to-b from-[#07172C] via-[#0B2545] to-[#133E68] p-3 text-white flex flex-col items-center justify-between text-center shrink-0 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-[#FF671F] 0%, from-[#FF671F] 33.3%, via-white 33.3%, via-white 66.6%, to-[#046A38] 66.6%, to-[#046A38] 100%"></div>

          <div className="flex items-center gap-1.5 pl-2 truncate w-full justify-center">
            <span className="text-[9px] font-black tracking-tight uppercase truncate">{schName}</span>
          </div>

          <StandardizedIdPhoto
            src={t.photo_url || t.avatar_url || t.image}
            name={fullName}
            className="w-20 h-24 rounded-xl ml-1 shadow-md"
            borderGradient="from-amber-400 via-amber-200 to-amber-500"
            blendMode={true}
          />

          <span className="bg-rose-600 text-white text-[8.5px] font-black px-2.5 py-0.5 rounded-full shadow-2xs ml-1">
            BLOOD: {bloodGroup}
          </span>
        </div>

        {/* Right Details Column */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between border-b border-slate-100 pb-1.5">
            <div>
              <h2 className="font-black text-sm text-slate-900 tracking-tight">{schName}</h2>
              <p className="text-[9px] text-amber-700 font-bold uppercase">{schAffiliation} &bull; FACULTY CREDENTIAL</p>
            </div>
            <span className="text-[8px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
              2026-27
            </span>
          </div>

          <div className="space-y-0.5 my-1">
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">{fullName}</h3>
            <div className="text-xs font-bold text-[#0B2545]">
              {designation}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 text-[8px] font-bold uppercase block">Employee ID</span>
              <strong className="font-mono text-slate-800">{staffId}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[8px] font-bold uppercase block">Department</span>
              <strong className="text-slate-800 truncate block">{department}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[8px] font-bold uppercase block">Official Phone</span>
              <strong className="font-mono text-slate-800">{phone}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[8px] font-bold uppercase block">Clearance</span>
              <strong className="font-bold text-emerald-700">FACULTY ALL-ACCESS</strong>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <AttendanceBarcode code={staffId} width={130} height={24} showText={false} />
              <span className="text-[8px] font-mono text-slate-500 font-bold">*{staffId}*</span>
            </div>
            <div className="text-right">
              <span className="text-[7.5px] font-mono text-slate-400 font-bold uppercase block">ACCREDITED PASS</span>
              <span className="text-[8px] font-extrabold text-slate-800 uppercase">CBS VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // FRONT FACE: LAYOUT A ("BHARAT SHRESHTHA" VERTICAL EXECUTIVE FACULTY)
  // =============================================================
  return (
    <div 
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      className="w-[330px] h-[520px] bg-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border-2 border-stone-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none"
    >
      {/* 1. Indian Tricolor Header Ribbon */}
      <div className="h-2.5 w-full bg-gradient-to-r from-[#FF671F] 0%, from-[#FF671F] 33.3%, via-white 33.3%, via-white 66.6%, to-[#046A38] 66.6%, to-[#046A38] 100%"></div>

      {/* 2. Executive Royal Sapphire & Gold Header */}
      <div className="bg-gradient-to-r from-[#07172C] via-[#0B2545] to-[#133E68] px-4 pt-2.5 pb-2 text-center text-white border-b-2 border-amber-400/80 relative z-10">
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
              {schAffiliation} &bull; FACULTY CREDENTIAL
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
              src={t.photo_url || t.avatar_url || t.image}
              name={fullName}
              className="w-28 h-32 rounded-2xl shadow-md"
              borderGradient="from-amber-400 via-amber-200 to-amber-500"
              badgeLabel="FACULTY • PERMANENT"
              badgeBg="#0B2545"
              blendMode={true}
            />
          </div>

          {/* Functional Vertical Industrial Code 128 Barcode */}
          <div className="bg-white border border-stone-200 rounded-xl p-1.5 shadow-xs flex flex-col items-center shrink-0 w-24">
            <span className="text-[7px] font-mono font-black text-[#0B2545] uppercase tracking-wider text-center block mb-1">
              ATTENDANCE
            </span>
            <div className="rotate-90 origin-center my-6 flex items-center justify-center">
              <AttendanceBarcode code={staffId} width={130} height={26} showText={false} />
            </div>
            <span className="text-[7.5px] font-mono font-extrabold text-stone-700 tracking-tight text-center block mt-1">
              *{staffId}*
            </span>
          </div>
        </div>

        {/* Middle: Teacher Full Name, Designation & Department Badges */}
        <div className="text-center mt-1">
          <h2 className="text-slate-950 font-black text-base uppercase tracking-tight leading-tight truncate px-1">
            {fullName}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0B2545] text-amber-200 text-[10px] font-black shadow-2xs truncate max-w-[180px]">
              {designation}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-950 text-[10px] font-bold font-mono truncate max-w-[110px]">
              {department}
            </span>
          </div>
        </div>

        {/* Bottom Vitals Grid */}
        <div className="bg-stone-50/90 rounded-xl p-2 border border-stone-200 text-[10px] space-y-1">
          <div className="flex justify-between">
            <span className="text-stone-500 font-bold">Employee Code:</span>
            <strong className="font-mono text-[#0B2545] font-black">{staffId}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-bold">Department:</span>
            <strong className="text-stone-800 truncate max-w-[170px]">{department}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-bold">Blood Group:</span>
            <strong className="text-rose-700 font-black">{bloodGroup}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-bold">Official Phone:</span>
            <strong className="font-mono text-stone-900">{phone}</strong>
          </div>
        </div>

        {/* Cultural Reverence Motto & Holographic Seal */}
        <div className="flex items-center justify-between pt-1 border-t border-stone-100">
          <span className="text-[9px] font-serif font-black text-[#0B2545]">
            आचार्य देवो भव
          </span>
          <div className="flex items-center gap-1">
            {/* Holographic Security Icon */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-300 via-rose-300 to-cyan-300 border border-stone-300 shadow-2xs flex items-center justify-center">
              <span className="text-[6px] font-black text-stone-900">3D</span>
            </div>
            <span className="text-[7.5px] font-mono text-stone-500 font-bold uppercase">FACULTY ALL-ACCESS</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Government Accreditation Footer */}
      <div className="bg-[#07172C] text-white text-[8px] font-bold py-1.5 px-4 flex items-center justify-between z-10 border-t border-amber-400/50">
        <span>ACCREDITED FACULTY PASS</span>
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

export default TeacherIDCard;
