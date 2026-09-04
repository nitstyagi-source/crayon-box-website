"use client";

import React from 'react';
import { User, Briefcase, Globe, Calendar, Droplet, Phone, MapPin, ChevronRight, BookOpen, Fingerprint, QrCode, ShieldCheck } from 'lucide-react';
import { StudentQRCode } from './StudentQRCode';
import { VastuMandalaWatermark } from '@/components/common/VastuMandalaWatermark';

export interface TeacherIDCardProps {
  teacher?: any;
  faculty?: any;
  layoutMode?: any;
  schoolInfo?: any;
  isBack?: boolean;
}

export function TeacherIDCard({ teacher, faculty, schoolInfo = {}, isBack = false }: TeacherIDCardProps) {
  const t = teacher || faculty || {};
  const name = `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Anita Sharma';
  const designation = t.designation || 'TGT - Mathematics';
  const department = t.department || 'Science & Mathematics';
  const staffId = t.employee_id || t.universal_id || 'FAC-CBS-2026-078';
  const joiningDate = t.joining_date ? new Date(t.joining_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Apr 2023';
  const bloodGroup = t.blood_group || 'B+';
  const phone = t.phone || t.mobile || '9811102008';
  const emergencyPhone = t.emergency_contact || '9810081008';
  const address = t.address || 'Sant Nagar, Burari, Delhi - 110084';
  
  const schName = schoolInfo.name || 'INSTITUTION IDENTITY';
  const schAffiliation = schoolInfo.boardAffiliation || 'AFFILIATED INSTITUTION';
  const schWebsite = schoolInfo.website || '';
  const schPhone = schoolInfo.phone || '';
  const schLogo = schoolInfo.logoUrl || schoolInfo.logo_url || '/logo.png';
  const schPrincipal = schoolInfo.principalName || schoolInfo.principal_name || 'Principal';

  // BACK FACE
  if (isBack) {
    return (
      <div className="w-[330px] h-[520px] bg-[#FDFBF7] rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border-2 border-[#E8DFC8] print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none">
        <VastuMandalaWatermark className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" size={320} opacity={0.06} />

        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-white py-3 px-4 text-center relative z-10 border-b-2 border-[#D4AF37]/50">
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-amber-300">{schName}</h2>
          <p className="text-[9px] text-amber-100/90 font-medium tracking-wide mt-0.5">STAFF CREDENTIAL &amp; CODE OF CONDUCT</p>
        </div>

        {/* Details List */}
        <div className="flex-1 px-5 pt-4 pb-2 z-10 space-y-2.5">
          <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E8DFC8] shadow-2xs space-y-2">
            <DetailRow icon={<Fingerprint size={13} />} label="Staff Code" value={staffId} />
            <DetailRow icon={<Calendar size={13} />} label="Joined Date" value={joiningDate} />
            <DetailRow icon={<Droplet size={13} />} label="Blood Group" value={bloodGroup} />
            <DetailRow icon={<Phone size={13} />} label="Contact Ph" value={phone} />
            <DetailRow icon={<Phone size={13} />} label="Emergency Ph" value={emergencyPhone} />
            <DetailRow icon={<MapPin size={13} />} label="Address" value={address} isMultiline />
          </div>

          {/* Institutional Regulations */}
          <div className="bg-[#FAF7F2] border border-amber-300/40 rounded-xl p-2.5 text-[9px] text-stone-700 leading-tight space-y-1">
            <div className="font-bold text-[#A16207] uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck size={11} /> Faculty ID Regulations
            </div>
            <p>1. Card must be displayed at all times on campus premises and during academic field tours.</p>
            <p>2. Property of {schName}. Return immediately upon superannuation or separation.</p>
          </div>

          {/* Principal Seal & Authorized Signature */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[8px] font-mono text-stone-500 font-bold block">STATUS</span>
              <span className="text-[10px] font-extrabold text-emerald-800">PERMANENT FACULTY</span>
            </div>
            <div className="text-center">
              <div className="h-7 w-24 border-b border-stone-800 mx-auto font-serif italic text-[11px] font-bold text-stone-900">
                {schPrincipal}
              </div>
              <span className="text-[8.5px] font-black uppercase text-stone-700 tracking-wider">Principal (Seal & Sign)</span>
            </div>
          </div>
        </div>

        {/* Back Footer */}
        <div className="bg-[#0B1B30] text-white py-2 px-4 z-10 flex items-center justify-between text-[8px] font-medium border-t border-[#D4AF37]/30">
          <span>{schWebsite}</span>
          <span>{schPhone}</span>
        </div>
      </div>
    );
  }

  // FRONT FACE (OPTION 6: VASTU SATTVA-DIGITAL WITH FRONT-FACING QR CODE)
  return (
    <div className="w-[330px] h-[520px] bg-[#FDFBF7] rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border-2 border-[#E8DFC8] print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none">
      <VastuMandalaWatermark className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" size={320} opacity={0.06} />

      {/* Top Regal Header */}
      <div className="bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-white pt-3.5 pb-3 px-4 text-center relative z-10 border-b-2 border-[#D4AF37]/50 shadow-xs">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-white p-1 border border-amber-400 flex items-center justify-center shrink-0">
            <img 
              src={schLogo} 
              alt={schName} 
              className="w-full h-full object-contain" 
              onError={(e) => { e.currentTarget.src = '/logo.png'; }} 
            />
          </div>
          <div className="text-left">
            <h1 className="font-extrabold text-xs uppercase tracking-wider text-amber-300 leading-tight">{schName}</h1>
            <span className="text-[8px] text-amber-100/80 font-medium block">FACULTY &amp; STAFF CREDENTIAL</span>
          </div>
        </div>
      </div>

      {/* Center Body: Faculty Photo in Solar Halo + Details */}
      <div className="flex-1 flex flex-col items-center pt-3 px-4 z-10">
        
        {/* Photo with Auspicious Golden Solar Halo Ring */}
        <div className="relative w-24 h-24 rounded-full p-1 bg-white border-3 border-[#D4AF37] shadow-md mb-2 overflow-hidden">
          {t.photo_url ? (
            <img src={t.photo_url} alt={name} className="w-full h-full object-cover rounded-full bg-stone-100" />
          ) : (
            <div className="w-full h-full bg-amber-50 rounded-full flex items-center justify-center text-amber-900 font-extrabold text-xl">
              {name.split(' ')[0][0]}{name.split(' ')[1]?.[0] || ''}
            </div>
          )}
        </div>

        {/* Staff Name */}
        <h2 className="text-stone-950 font-black text-base uppercase tracking-wide text-center leading-tight">
          {name}
        </h2>

        {/* Designation & Department */}
        <div className="flex flex-col items-center gap-1 mt-1 mb-2">
          <span className="px-3 py-0.5 rounded-full bg-[#0369A1] text-white text-xs font-bold shadow-2xs">
            {designation}
          </span>
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">
            {department}
          </span>
        </div>

        {/* Front-Facing Turnstile & Staff Attendance QR Code */}
        <div className="bg-white p-2 rounded-2xl border border-[#E8DFC8] shadow-sm flex flex-col items-center my-auto">
          <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-[#15803D] mb-1">
            <QrCode size={10} /> Faculty Turnstile &amp; Bio QR
          </div>
          <StudentQRCode payload={staffId} size={78} />
          <span className="text-[9px] font-mono font-bold text-stone-600 mt-1">{staffId}</span>
        </div>

        {/* Bottom Metrics Strip */}
        <div className="w-full grid grid-cols-2 gap-2 mt-auto mb-2 text-center text-[9px] font-bold">
          <div className="bg-[#DCFCE7] text-[#15803D] border border-emerald-300/60 rounded-lg py-1">
            Blood: {bloodGroup}
          </div>
          <div className="bg-[#FEF3C7] text-[#B45309] border border-amber-300/60 rounded-lg py-1">
            Emp ID: {staffId.split('-').pop() || staffId}
          </div>
        </div>
      </div>

      {/* Front Footer */}
      <div className="bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-amber-200 text-[8px] font-bold py-1.5 px-4 text-center z-10 border-t border-[#D4AF37]/30">
        ACADEMIC YEAR: 2026–2027 • OFFICIAL FACULTY CREDENTIAL
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
