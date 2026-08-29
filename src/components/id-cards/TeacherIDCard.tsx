"use client";

import React from 'react';
import { User, Briefcase, Globe, Calendar, Droplet, Phone, MapPin, ChevronRight, BookOpen, Fingerprint } from 'lucide-react';
import { StudentQRCode } from './StudentQRCode';

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
  const designation = t.designation || 'TGT - English';
  const staffId = t.employee_id || t.universal_id || 'CBS/24-25/078';
  const joiningDate = t.joining_date ? new Date(t.joining_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Apr 2023';
  const bloodGroup = t.blood_group || 'B+';
  const phone = t.phone || t.mobile || '9811102008';
  const address = t.address || '6/20 D-Block Shastri Park Extn. Burari Delhi 110084';
  
  const schName = schoolInfo.name || 'Crayon Box School';
  const schWebsite = schoolInfo.website || 'www.crayonboxschool.edu.in';
  const schPhone = schoolInfo.phone || '011-45678901';

  // Helper for top header which is same on front and back
  const renderHeader = () => (
    <div className="relative pt-6 pb-2 z-10 flex flex-col items-center">
      {/* Logo Placeholder */}
      <div className="w-[88px] h-[88px] rounded-full bg-white border-[3px] border-yellow-500 shadow-sm flex items-center justify-center mb-2 overflow-hidden relative">
         <div className="absolute inset-1 rounded-full border-[2px] border-[#0A1A44]" />
         <img src="/tree-logo.png" alt="Logo" className="w-[60px] h-[60px] object-contain z-10" 
              onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
         <div className="hidden w-12 h-12 rounded-full bg-[#0A1A44] flex items-center justify-center z-10">
           <BookOpen className="text-yellow-400 w-6 h-6" />
         </div>
      </div>
      
      <div className="text-center w-full">
        <h1 className="font-serif text-[26px] leading-none font-bold text-[#0A1A44] tracking-wider uppercase">Crayon Box</h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="h-[1px] w-12 bg-yellow-500"></div>
          <h2 className="font-serif text-[18px] leading-none text-[#C8102E] tracking-[0.2em] font-semibold uppercase">School</h2>
          <div className="h-[1px] w-12 bg-yellow-500"></div>
        </div>
        <p className="font-sans text-[10px] font-bold text-[#0A1A44] tracking-[0.2em] mt-2 uppercase">
          Learn <span className="text-yellow-500 mx-1">•</span> Grow <span className="text-[#00B050] mx-1">•</span> Shine
        </p>
      </div>
    </div>
  );

  const renderBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <svg className="absolute top-0 w-full" viewBox="0 0 400 160" fill="none" preserveAspectRatio="none">
        <path d="M0,0 L400,0 L400,100 C300,150 100,50 0,130 Z" fill="#EAB308" />
        <path d="M0,0 L400,0 L400,85 C300,135 100,35 0,115 Z" fill="#0A1A44" />
        <path d="M-20,-20 Q50,-10 60,30 Q40,60 -10,50 Z" fill="rgba(255,255,255,0.05)" />
      </svg>
      
      <svg className="absolute bottom-0 w-full h-[120px]" viewBox="0 0 400 120" fill="none" preserveAspectRatio="none">
        <path d="M0,30 C150,90 250,-20 400,30 L400,120 L0,120 Z" fill="#EAB308" />
        <path d="M0,45 C150,105 250,-5 400,45 L400,120 L0,120 Z" fill="#0A1A44" />
      </svg>

      {/* Center faint leaf pattern */}
      <div className="absolute top-[35%] left-0 w-full h-40 opacity-5 flex justify-between px-2">
        <svg viewBox="0 0 100 200" className="h-full fill-current text-gray-900">
           <path d="M50,0 Q100,50 50,100 Q0,50 50,0 Z M50,100 Q100,150 50,200 Q0,150 50,100 Z" />
        </svg>
        <svg viewBox="0 0 100 200" className="h-full fill-current text-gray-900" style={{ transform: 'scaleX(-1)' }}>
           <path d="M50,0 Q100,50 50,100 Q0,50 50,0 Z M50,100 Q100,150 50,200 Q0,150 50,100 Z" />
        </svg>
      </div>
    </div>
  );

  if (isBack) {
    return (
      <div className="w-[330px] h-[520px] bg-white rounded-xl shadow-lg relative overflow-hidden flex flex-col font-sans border border-gray-200 print:shadow-none print:border-gray-100 print:rounded-none">
        {renderBackground()}
        {renderHeader()}
        
        <div className="flex-1 px-8 pt-4 pb-20 z-10 flex flex-col">
          {/* Details List */}
          <div className="space-y-3 mb-5">
            <DetailRow icon={<User size={14}/>} label="Name" value={name} color="bg-[#0A1A44]" />
            <DetailRow icon={<Briefcase size={14}/>} label="Designation" value={designation} color="bg-[#0A1A44]" />
            <DetailRow icon={<Fingerprint size={14}/>} label="Staff ID" value={staffId} color="bg-[#0A1A44]" />
            <DetailRow icon={<Calendar size={14}/>} label="Date of Joining" value={joiningDate} color="bg-[#0A1A44]" />
          </div>

          {/* Instructions Box */}
          <div className="border border-[#0A1A44]/30 rounded-lg p-3 pt-4 relative mt-2 bg-white/50">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0A1A44] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-yellow-400" />
              Instructions
              <div className="w-1 h-1 rounded-full bg-yellow-400" />
            </div>
            <ul className="text-[9px] text-[#0A1A44] space-y-1.5 leading-tight font-medium">
              <li className="flex items-start gap-1.5">
                <ChevronRight size={12} className="text-[#D41B44] shrink-0 mt-[1px]" />
                This card is the property of Crayon Box School.
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight size={12} className="text-[#D41B44] shrink-0 mt-[1px]" />
                This card must be worn during school hours.
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight size={12} className="text-[#D41B44] shrink-0 mt-[1px]" />
                In case of loss, inform the school immediately.
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight size={12} className="text-[#D41B44] shrink-0 mt-[1px]" />
                If found, please return to the school office.
              </li>
            </ul>
          </div>
          
          {/* Signature */}
          <div className="mt-auto self-center flex flex-col items-center">
            <img src="/signatures/principal.png" className="h-8 object-contain opacity-80" alt="Signature" onError={(e) => e.currentTarget.style.display='none'} />
            <div className="h-[1px] w-24 bg-[#0A1A44] mb-1" />
            <span className="text-[10px] font-bold text-[#0A1A44]">Principal</span>
          </div>
        </div>

        {/* Back Footer */}
        <div className="absolute bottom-0 w-full h-[85px] z-10 flex flex-row items-center justify-between px-6 pt-6 pb-2">
           <div className="flex flex-col gap-2 w-[180px]">
             <div className="flex items-start gap-1.5">
               <MapPin size={12} className="text-yellow-500 shrink-0 mt-[2px]" />
               <span className="text-white text-[8px] font-medium leading-tight">{address}</span>
             </div>
             <div className="flex items-center gap-1.5">
               <Phone size={12} className="text-yellow-500 shrink-0" />
               <span className="text-white text-[8px] font-medium leading-tight">{phone}</span>
             </div>
             <div className="flex items-center gap-1.5">
               <Globe size={12} className="text-yellow-500 shrink-0" />
               <span className="text-white text-[8px] font-medium leading-tight">{schWebsite}</span>
             </div>
           </div>
           
           <div className="h-12 w-[1px] bg-white/20 mx-2" />
           
           <div className="flex flex-col items-center justify-center text-center flex-1">
             <div className="w-5 h-6 border border-yellow-500 flex items-center justify-center rounded-b-md relative mb-1">
               <BookOpen size={10} className="text-yellow-500" />
               <div className="absolute -top-1 w-1 h-1 bg-yellow-500 rounded-full" />
             </div>
             <span className="text-white text-[7px] leading-tight">Excellence in Education.<br/>Values for Life.</span>
           </div>
        </div>
      </div>
    );
  }

  // FRONT
  return (
    <div className="w-[330px] h-[520px] bg-white rounded-xl shadow-lg relative overflow-hidden flex flex-col font-sans border border-gray-200 print:shadow-none print:border-gray-100 print:rounded-none">
      {renderBackground()}
      {renderHeader()}

      <div className="flex-1 flex flex-col items-center pt-2 z-10">
        {/* Photo */}
        <div className="relative w-[110px] h-[110px] rounded-full p-1 bg-white border-2 border-[#0A1A44] shadow-md mb-4 overflow-hidden">
          {t.photo_url ? (
            <img src={t.photo_url} alt={name} className="w-full h-full object-cover rounded-full bg-gray-100" />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-[#0A1A44]">
              <User size={40} />
            </div>
          )}
        </div>

        {/* Name Ribbon */}
        <div className="relative w-[240px] h-10 bg-[#0A1A44] flex items-center justify-center shadow-sm mb-1">
           <div className="absolute -left-3 top-0 w-0 h-0 border-t-[20px] border-b-[20px] border-r-[12px] border-transparent border-r-[#0A1A44]" />
           <div className="absolute -right-3 top-0 w-0 h-0 border-t-[20px] border-b-[20px] border-l-[12px] border-transparent border-l-[#0A1A44]" />
           <h2 className="text-white font-bold text-lg uppercase tracking-wider">{name}</h2>
        </div>

        {/* Designation Trapezoid */}
        <div className="relative mb-3">
           <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-3 h-5 bg-[#D41B44] skew-x-[-20deg]" />
           <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-3 h-5 bg-[#D41B44] skew-x-[20deg]" />
           <div className="bg-yellow-500 px-6 py-1 transform skew-x-[-10deg]">
             <span className="block transform skew-x-[10deg] text-[#0A1A44] font-bold text-[13px] uppercase">
               {designation}
             </span>
           </div>
        </div>

        {/* Staff ID */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[#0A1A44] font-bold text-[14px]">STAFF ID : <span className="text-[#D41B44]">{staffId}</span></span>
        </div>

        {/* Bottom Metrics Grid */}
        <div className="w-full px-6 flex items-start justify-between">
           {/* Employee ID */}
           <div className="flex flex-col items-center">
             <div className="w-8 h-8 rounded-full bg-[#0A1A44] flex items-center justify-center mb-1">
               <Fingerprint size={16} className="text-white" />
             </div>
             <span className="text-[8px] font-bold text-[#0A1A44]">EMPLOYEE ID</span>
             <span className="text-[9px] font-bold text-[#D41B44]">{staffId}</span>
           </div>
           
           <div className="w-[1px] h-10 bg-gray-300 mt-1" />
           
           {/* Joining Date */}
           <div className="flex flex-col items-center">
             <div className="w-8 h-8 rounded-full border-2 border-[#0A1A44] bg-white flex items-center justify-center mb-1">
               <Calendar size={16} className="text-[#0A1A44]" />
             </div>
             <span className="text-[8px] font-bold text-[#0A1A44]">JOINING DATE</span>
             <span className="text-[9px] font-bold text-[#D41B44]">{joiningDate.toUpperCase()}</span>
           </div>

           <div className="w-[1px] h-10 bg-gray-300 mt-1" />

           {/* Signature */}
           <div className="flex flex-col items-center">
             <div className="w-8 h-8 rounded-full border-2 border-[#0A1A44] bg-white flex items-center justify-center mb-1 overflow-hidden">
               <img src="/signatures/principal.png" className="w-full h-full object-contain p-1" alt="Sig" onError={(e) => e.currentTarget.style.display='none'} />
             </div>
             <span className="text-[8px] font-bold text-[#0A1A44]">AUTHORIZED SIGNATURE</span>
             <span className="text-[9px] font-bold text-[#0A1A44] uppercase tracking-wider">Principal</span>
           </div>
        </div>
      </div>

      {/* Front Footer */}
      <div className="absolute bottom-0 w-full h-[85px] z-10 flex flex-row items-center justify-between px-6 pt-6 pb-2">
         <div className="flex flex-col gap-2 w-[180px]">
           <div className="flex items-start gap-1.5">
             <MapPin size={12} className="text-white shrink-0 mt-[2px]" />
             <span className="text-white text-[8px] font-medium leading-tight">{address}</span>
           </div>
           <div className="flex items-center gap-1.5">
             <Phone size={12} className="text-white shrink-0" />
             <span className="text-white text-[8px] font-medium leading-tight">{schPhone} | 9999999999</span>
           </div>
           <div className="flex items-center gap-1.5">
             <Globe size={12} className="text-white shrink-0" />
             <span className="text-white text-[8px] font-medium leading-tight">{schWebsite}</span>
           </div>
         </div>
         
         <div className="h-12 w-[1px] bg-yellow-500/50 mx-2" />
         
         <div className="flex flex-col items-center justify-center text-center flex-1">
           <div className="w-5 h-6 border border-yellow-500 flex items-center justify-center rounded-b-md relative mb-1">
             <BookOpen size={10} className="text-yellow-500" />
             <div className="absolute -top-1 w-1 h-1 bg-yellow-500 rounded-full" />
           </div>
           <span className="text-white text-[7px] leading-tight">Excellence in Education.<br/>Values for Life.</span>
         </div>
      </div>
    </div>
  );
}

const DetailRow = ({ icon, label, value, color, isMultiline }: { icon: React.ReactNode, label: string, value: string, color: string, isMultiline?: boolean }) => (
  <div className={`flex ${isMultiline ? 'items-start' : 'items-center'} gap-3 text-[11px]`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="flex w-[90px] shrink-0 items-center justify-between font-bold text-[#0A1A44]">
      <span>{label}</span>
      <span>:</span>
    </div>
    <div className="font-medium text-[#1E293B] leading-tight flex-1">
      {value}
    </div>
  </div>
);
