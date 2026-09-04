"use client";

import React from 'react';
import { User, Calendar, Globe, Droplet, Phone, MapPin, ChevronRight, BookOpen, QrCode, ShieldCheck } from 'lucide-react';
import { StudentQRCode } from './StudentQRCode';
import { VastuMandalaWatermark } from '@/components/common/VastuMandalaWatermark';

export interface StudentIDCardProps {
  student: any;
  schoolInfo?: any;
  isBack?: boolean;
  layoutMode?: any;
}

export function StudentIDCard({ student, schoolInfo = {}, isBack = false }: StudentIDCardProps) {
  const name = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Aarav Sharma';
  const className = student.class_name || 'Class 5';
  const section = student.section_name || 'A';
  const rollNo = student.roll_number || student.roll_no || '12';
  const idNo = student.universal_id || student.admission_number || student.admission_no || 'CBS/26-27/0412';
  const dob = student.dob ? new Date(student.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 May 2015';
  const bloodGroup = student.blood_group || 'O+';
  const parentContact = student.guardian_phone || student.father_phone || '9811102008';
  const emergencyPhone = student.emergency_contact || student.mother_phone || '9810081008';
  const address = student.address || student.residential_address || 'Sant Nagar, Burari, Delhi - 110084';
  const busRoute = student.bus_route_no || student.route_name || 'Route 04';
  
  const schName = schoolInfo.name || 'STUDENT IDENTITY CARD';
  const schAffiliation = schoolInfo.boardAffiliation || 'OFFICIALLY ACCREDITED';
  const schWebsite = schoolInfo.website || 'www.school.edu.in';
  const schPhone = schoolInfo.phone || '011-45678901';
  const schLogo = schoolInfo.logoUrl || schoolInfo.logo_url || '/logo.png';
  const schPrincipal = schoolInfo.principalName || schoolInfo.principal_name || 'Principal';
  const schShortName = schoolInfo.shortName || schoolInfo.short_name || schoolInfo.name || 'School';

  // BACK FACE
  if (isBack) {
    return (
      <div className="w-[330px] h-[520px] bg-[#FDFBF7] rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border-2 border-[#E8DFC8] print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none">
        <VastuMandalaWatermark className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" size={320} opacity={0.06} />

        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-white py-3 px-4 text-center relative z-10 border-b-2 border-[#D4AF37]/50">
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-amber-300">{schName}</h2>
          <p className="text-[9px] text-amber-100/90 font-medium tracking-wide mt-0.5">{schAffiliation}</p>
        </div>

        {/* Student Vitals List */}
        <div className="flex-1 px-5 pt-4 pb-2 z-10 space-y-2.5">
          <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E8DFC8] shadow-2xs space-y-2">
            <DetailRow icon={<Calendar size={13} />} label="Date of Birth" value={dob} />
            <DetailRow icon={<Droplet size={13} />} label="Blood Group" value={bloodGroup} />
            <DetailRow icon={<Phone size={13} />} label="Parent Contact" value={parentContact} />
            <DetailRow icon={<Phone size={13} />} label="Emergency Ph" value={emergencyPhone} />
            <DetailRow icon={<MapPin size={13} />} label="Residence" value={address} isMultiline />
          </div>

          {/* Institutional Regulations */}
          <div className="bg-[#FAF7F2] border border-amber-300/40 rounded-xl p-2.5 text-[9px] text-stone-700 leading-tight space-y-1">
            <div className="font-bold text-[#A16207] uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck size={11} /> Campus Safety Guidelines
            </div>
            <p>1. This identity credential must be worn during all school hours and transport transit.</p>
            <p>2. Report immediate card loss to the Administrative Office or via {schShortName} Mobile App.</p>
          </div>

          {/* Principal Seal & Authorized Signature */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[8px] font-mono text-stone-500 font-bold block">VALID TILL</span>
              <span className="text-[10px] font-extrabold text-stone-900">31 MAR 2027</span>
            </div>
            <div className="text-center">
              <div className="h-7 w-24 border-b border-stone-800 mx-auto font-serif italic text-[11px] font-bold text-stone-900">
                {schPrincipal}
              </div>
              <span className="text-[8.5px] font-black uppercase text-stone-700 tracking-wider">Principal (Seal & Sign)</span>
            </div>
          </div>
        </div>

        {/* Back Footer Strip */}
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
            <span className="text-[8px] text-amber-100/80 font-medium block">{schAffiliation} • Values for Life</span>
          </div>
        </div>
      </div>

      {/* Center Body: Child Photo in Solar Halo + Details */}
      <div className="flex-1 flex flex-col items-center pt-3 px-4 z-10">
        
        {/* Child Photo with Auspicious Golden Solar Halo Ring */}
        <div className="relative w-24 h-24 rounded-full p-1 bg-white border-3 border-[#D4AF37] shadow-md mb-2 overflow-hidden">
          {student.photo_url ? (
            <img src={student.photo_url} alt={name} className="w-full h-full object-cover rounded-full bg-stone-100" />
          ) : (
            <div className="w-full h-full bg-amber-50 rounded-full flex items-center justify-center text-amber-900 font-extrabold text-xl">
              {name.split(' ')[0][0]}{name.split(' ')[1]?.[0] || ''}
            </div>
          )}
        </div>

        {/* Student Name */}
        <h2 className="text-stone-950 font-black text-base uppercase tracking-wide text-center leading-tight">
          {name}
        </h2>

        {/* Class, Section & Roll No Badge */}
        <div className="flex items-center gap-2 mt-1 mb-2">
          <span className="px-3 py-0.5 rounded-full bg-[#0369A1] text-white text-xs font-bold shadow-2xs">
            {className} - {section}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold font-mono">
            Roll: {rollNo}
          </span>
        </div>

        {/* Front-Facing Turnstile Access QR Code */}
        <div className="bg-white p-2 rounded-2xl border border-[#E8DFC8] shadow-sm flex flex-col items-center my-auto">
          <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-[#15803D] mb-1">
            <QrCode size={10} /> Fast Turnstile & Bus QR
          </div>
          <StudentQRCode payload={idNo} size={78} />
          <span className="text-[9px] font-mono font-bold text-stone-600 mt-1">{idNo}</span>
        </div>

        {/* Bottom Vitals Strip */}
        <div className="w-full grid grid-cols-2 gap-2 mt-auto mb-2 text-center text-[9px] font-bold">
          <div className="bg-[#DCFCE7] text-[#15803D] border border-emerald-300/60 rounded-lg py-1">
            Blood Group: {bloodGroup}
          </div>
          <div className="bg-[#E0F2FE] text-[#0369A1] border border-sky-300/60 rounded-lg py-1">
            Transit: {busRoute}
          </div>
        </div>
      </div>

      {/* Front Footer */}
      <div className="bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-amber-200 text-[8px] font-bold py-1.5 px-4 text-center z-10 border-t border-[#D4AF37]/30">
        SESSION: 2026–2027 • STUDENT ACCESS IDENTITY
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
