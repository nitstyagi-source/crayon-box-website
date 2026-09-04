"use client";

import React from 'react';
import { User, Briefcase, Globe, Calendar, Droplet, Phone, MapPin, ChevronRight, BookOpen, Fingerprint, QrCode, ShieldCheck } from 'lucide-react';
import { StudentQRCode } from './StudentQRCode';
import { VastuMandalaWatermark } from '@/components/common/VastuMandalaWatermark';
import { IdCardThemeId } from './StudentIDCard';

export interface TeacherIDCardProps {
  teacher?: any;
  faculty?: any;
  layoutMode?: any;
  schoolInfo?: any;
  isBack?: boolean;
  themeId?: IdCardThemeId;
}

export function TeacherIDCard({ 
  teacher, 
  faculty, 
  schoolInfo = {}, 
  isBack = false, 
  themeId = 'rashtriya' 
}: TeacherIDCardProps) {
  const t = teacher || faculty || {};
  const name = `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Dr. Sunita Rao';
  const designation = t.designation || 'Head of Science & Senior Faculty';
  const designationHindi = t.designation_hindi || 'वरिष्ठ प्रवक्ता • भौतिक विज्ञान (Physics)';
  const department = t.department || 'Department of Physics & STEM';
  const staffId = t.employee_id || t.universal_id || 'FAC/EMP/2026/084';
  const teacherApaar = t.teacher_apaar_id || 'TEACHER-ID-7819-2041';
  const joiningDate = t.joining_date ? new Date(t.joining_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Apr 2023';
  const bloodGroup = t.blood_group || 'B+';
  const phone = t.phone || t.mobile || '+91 98765 43210';
  const emergencyPhone = t.emergency_contact || '+91 98100 81008';
  const address = t.address || 'Sant Nagar, Burari, Delhi - 110084';
  
  const schName = schoolInfo.name || 'Crayon Box School';
  const schAffiliation = schoolInfo.boardAffiliation || 'AFFILIATED INSTITUTION';
  const schWebsite = schoolInfo.website || 'www.crayonboxschool.edu.in';
  const schPhone = schoolInfo.phone || '+91 11 2761 8899';
  const schLogo = schoolInfo.logoUrl || schoolInfo.logo_url || '/logo.png';
  const schPrincipal = schoolInfo.principalName || schoolInfo.principal_name || 'Dr. Ananya Roy';

  // -------------------------------------------------------------
  // BACK FACE (SHARED REGULATORY & SAFETY BACKING)
  // -------------------------------------------------------------
  if (isBack) {
    return (
      <div className="w-[330px] h-[520px] bg-[#FDFBF7] rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border-2 border-[#E8DFC8] print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none">
        <VastuMandalaWatermark className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" size={320} opacity={0.06} />

        {/* Top Tricolor Accent Ribbon */}
        <div className="h-2 w-full bg-gradient-to-r from-[#FF671F] via-white to-[#046A38]"></div>

        {/* Back Header */}
        <div className="bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-white py-3 px-4 text-center relative z-10 border-b-2 border-[#D4AF37]/50">
          <h2 className="font-extrabold text-xs uppercase tracking-wider text-amber-300">{schName}</h2>
          <p className="text-[9px] text-amber-100/90 font-medium tracking-wide mt-0.5">
            STAFF CREDENTIAL &bull; CODE OF CONDUCT
          </p>
        </div>

        {/* Details List */}
        <div className="flex-1 px-5 pt-3 pb-2 z-10 space-y-2">
          <div className="bg-white/95 rounded-2xl p-3 border border-[#E8DFC8] shadow-2xs space-y-1.5 text-xs">
            <DetailRow icon={<Fingerprint size={12} />} label="Staff Code" value={staffId} />
            <DetailRow icon={<Calendar size={12} />} label="Joined Date" value={joiningDate} />
            <DetailRow icon={<Droplet size={12} />} label="Blood Group" value={bloodGroup} />
            <DetailRow icon={<Phone size={12} />} label="Contact Ph" value={phone} />
            <DetailRow icon={<Phone size={12} />} label="Emergency Ph" value={emergencyPhone} />
            <DetailRow icon={<MapPin size={12} />} label="Address" value={address} isMultiline />
          </div>

          {/* Institutional Regulations */}
          <div className="bg-[#FAF7F2] border border-amber-300/50 rounded-xl p-2.5 text-[9px] text-stone-700 leading-tight space-y-1">
            <div className="font-bold text-[#A16207] uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck size={11} /> Faculty Credential Regulations
            </div>
            <p>1. Card must be displayed at all times on campus and during official tours.</p>
            <p>2. Property of {schName}. Return immediately upon superannuation or separation.</p>
          </div>

          {/* Principal Seal & Authorized Signature */}
          <div className="pt-1.5 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[8px] font-mono text-stone-400 font-bold block">STATUS</span>
              <span className="text-[10px] font-extrabold text-emerald-800">PERMANENT FACULTY</span>
            </div>
            <div className="text-center">
              <div className="h-6 font-serif italic text-xs font-bold text-stone-900">
                {schPrincipal}
              </div>
              <span className="text-[8px] font-black uppercase text-stone-600 tracking-wider">Principal (Seal &amp; Sign)</span>
            </div>
          </div>
        </div>

        {/* Back Footer */}
        <div className="bg-[#0B1B30] text-white py-2 px-4 z-10 flex items-center justify-between text-[8px] font-medium border-t border-[#D4AF37]/30">
          <span>{schWebsite}</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF671F]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#046A38]"></span>
          </div>
          <span>{schPhone}</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 1: RASHTRIYA TIRANGA (PATRIOTIC TEACHER BADGE)
  // -------------------------------------------------------------
  if (themeId === 'rashtriya') {
    return (
      <div className="w-[330px] h-[520px] bg-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border-2 border-orange-300 print:shadow-none text-stone-900 shrink-0 select-none">
        {/* Top Tricolor Ribbon */}
        <div className="h-3 w-full bg-gradient-to-r from-[#FF671F] 0%, from-[#FF671F] 33.3%, via-white 33.3%, via-white 66.6%, to-[#046A38] 66.6%, to-[#046A38] 100%"></div>

        {/* Header */}
        <div className="bg-gradient-to-b from-orange-50/80 to-white px-4 pt-2.5 pb-2 text-center border-b border-orange-100 z-10">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-white border border-orange-300 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img src={schLogo} alt={schName} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
            </div>
            <div className="text-left">
              <h1 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 leading-tight">{schName}</h1>
              <span className="text-[8px] text-orange-800 font-bold uppercase tracking-wider block">{schAffiliation} • FACULTY CREDENTIAL</span>
            </div>
          </div>
          <div className="text-[8px] font-bold text-slate-500 flex items-center justify-center gap-2">
            <span>सत्यमेव जयते</span>
            <span>•</span>
            <span className="text-[#000080] font-black">PEN/APAAR: {teacherApaar}</span>
          </div>
        </div>

        {/* Center Body */}
        <div className="flex-1 flex flex-col items-center pt-2 px-4 z-10 relative">
          {/* Subtle Ashoka Chakra Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <svg className="w-48 h-48 text-[#000080]" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="4"/>
              <circle cx="50" cy="50" r="8" fill="currentColor"/>
              <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18 M8 30 L92 70 M8 70 L92 30 M30 8 L70 92 M30 92 L70 8" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>

          {/* Photo */}
          <div className="relative w-22 h-26 rounded-2xl p-1 bg-gradient-to-b from-[#FF671F] via-white to-[#046A38] shadow-md mb-2 overflow-hidden shrink-0">
            {t.photo_url ? (
              <img src={t.photo_url} alt={name} className="w-full h-full object-cover rounded-xl bg-stone-100" />
            ) : (
              <div className="w-full h-full bg-orange-50 rounded-xl flex items-center justify-center text-orange-900 font-extrabold text-xl">
                {name.split(' ')[0][0]}
              </div>
            )}
            <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full text-[8px] font-black bg-[#000080] text-white shadow-xs uppercase tracking-wider">
              FACULTY &bull; PERMANENT
            </span>
          </div>

          <h2 className="text-slate-950 font-black text-base uppercase tracking-tight text-center leading-tight mt-1">
            {name}
          </h2>

          <div className="px-3 py-0.5 rounded-full bg-orange-700 text-white text-xs font-bold shadow-2xs mt-1 mb-2 text-center">
            {designation}
          </div>

          {/* Vitals Table */}
          <div className="z-10 w-full bg-white/95 backdrop-blur-xs rounded-xl p-2.5 border border-slate-200 text-[10px] space-y-1 text-left shadow-2xs">
            <div className="flex justify-between border-b border-slate-100 pb-0.5">
              <span className="text-slate-500 font-bold">Emp Code:</span>
              <strong className="font-mono text-slate-800">{staffId}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-0.5">
              <span className="text-slate-500 font-bold">Department:</span>
              <strong className="text-slate-800 truncate max-w-[140px]">{department}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-0.5">
              <span className="text-slate-500 font-bold">Blood Group:</span>
              <strong className="text-rose-600 font-extrabold">{bloodGroup}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Official Phone:</span>
              <strong className="font-mono text-slate-900">{phone}</strong>
            </div>
          </div>

          {/* Turnstile Access QR */}
          <div className="my-auto">
            <StudentQRCode payload={staffId} size={65} />
          </div>
        </div>

        {/* Front Footer */}
        <div className="bg-slate-900 text-white text-[8px] font-bold py-1.5 px-4 flex items-center justify-between z-10 border-t border-orange-400">
          <span>GOVT. RECOGNIZED ACCREDITATION</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF671F]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#046A38]"></span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 5: RAJBHASHA EXECUTIVE LANDSCAPE (HORIZONTAL LANYARD BADGE)
  // -------------------------------------------------------------
  if (themeId === 'landscape') {
    return (
      <div className="w-[500px] h-[315px] bg-white rounded-3xl shadow-xl relative overflow-hidden flex flex-row font-sans border-2 border-slate-200 print:shadow-none text-stone-900 shrink-0 select-none">
        {/* Left Column with Tricolor Spine */}
        <div className="w-44 bg-gradient-to-b from-[#0B1B30] to-[#153257] p-3 text-white flex flex-col items-center justify-between text-center shrink-0 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-[#FF671F] 0%, from-[#FF671F] 33.3%, via-white 33.3%, via-white 66.6%, to-[#046A38] 66.6%, to-[#046A38] 100%"></div>

          <div className="flex items-center gap-1.5 pl-2">
            <span className="text-[9px] font-black tracking-tight uppercase">CRAYON BOX</span>
          </div>

          <div className="w-20 h-24 rounded-xl overflow-hidden ring-2 ring-white/50 shadow-md ml-1">
            {t.photo_url ? (
              <img src={t.photo_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-bold text-lg">
                {name[0]}
              </div>
            )}
          </div>

          <span className="bg-rose-600 text-white text-[8.5px] font-black px-2.5 py-0.5 rounded-full shadow-2xs ml-1">
            BLOOD: {bloodGroup}
          </span>
        </div>

        {/* Right Details Column */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between border-b border-slate-100 pb-1.5">
            <div>
              <h2 className="font-black text-sm text-slate-900 tracking-tight">{schName}</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase">{schAffiliation} • FACULTY DOSSIER</p>
            </div>
            <span className="text-[8px] font-mono font-bold bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full uppercase">
              2026-27
            </span>
          </div>

          <div className="space-y-0.5 my-1">
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">{name}</h3>
            <div className="text-xs font-bold text-indigo-700">
              {designationHindi}
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
              <StudentQRCode payload={staffId} size={28} />
              <span className="text-[8px] font-mono text-slate-400">Scan at Campus Gate</span>
            </div>
            <div className="text-right">
              <div className="h-3 text-[9px] font-serif italic text-slate-900 font-bold">{schPrincipal}</div>
              <span className="text-[7.5px] font-bold uppercase text-slate-400">Principal Seal &amp; Sign</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 2 & 3 & 4 FALLBACK/DEFAULT
  // -------------------------------------------------------------
  return (
    <div className="w-[330px] h-[520px] bg-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 print:shadow-none text-stone-900 shrink-0 select-none">
      <div className="p-4 pb-2 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">
            CB
          </div>
          <div>
            <h1 className="font-extrabold text-xs text-slate-900 leading-tight">{schName}</h1>
            <p className="text-[8px] text-slate-400 font-bold uppercase">{schAffiliation}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-[#FF671F]"></span>
          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
          <span className="w-2 h-2 rounded-full bg-[#046A38]"></span>
        </div>
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col items-center text-center justify-between">
        <div className="relative mt-1">
          <div className="w-24 h-28 rounded-2xl overflow-hidden ring-4 ring-slate-100 shadow-sm bg-slate-100">
            {t.photo_url ? (
              <img src={t.photo_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                {name[0]}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 inset-x-0 mx-auto w-max bg-emerald-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            FACULTY ACTIVE
          </div>
        </div>

        <div className="mt-2 space-y-0.5">
          <h2 className="font-black text-base text-slate-900 leading-tight">{name}</h2>
          <p className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-0.5 rounded-full inline-block">
            {designation}
          </p>
        </div>

        <div className="w-full grid grid-cols-2 gap-2 text-left bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px]">
          <div>
            <span className="text-slate-400 text-[8px] font-bold uppercase block">Employee ID</span>
            <strong className="font-mono text-slate-900">{staffId}</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[8px] font-bold uppercase block">Blood Group</span>
            <strong className="text-rose-600 font-extrabold">{bloodGroup}</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[8px] font-bold uppercase block">Department</span>
            <strong className="text-slate-800 truncate block">{department}</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[8px] font-bold uppercase block">Contact</span>
            <strong className="font-mono text-slate-800">{phone}</strong>
          </div>
        </div>

        <div className="my-auto">
          <StudentQRCode payload={staffId} size={65} />
        </div>
      </div>

      <div className="bg-slate-900 text-white p-2.5 flex items-center justify-between text-[8px] font-mono">
        <span>FACULTY CLEARANCE</span>
        <span>SESSION 2026-27</span>
      </div>
    </div>
  );
}

const DetailRow = ({ icon, label, value, isMultiline }: { icon: React.ReactNode, label: string, value: string, isMultiline?: boolean }) => (
  <div className={`flex ${isMultiline ? 'items-start' : 'items-center'} gap-2 text-xs text-stone-800`}>
    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <span className="font-bold text-stone-600 w-24 shrink-0 text-[10px] uppercase">{label}:</span>
    <span className="font-extrabold text-stone-950 flex-1 leading-tight text-[11px]">{value}</span>
  </div>
);

export default TeacherIDCard;
