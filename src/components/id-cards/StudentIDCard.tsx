"use client";

import React from 'react';
import { User, Calendar, Globe, Droplet, Phone, MapPin, ChevronRight, BookOpen } from 'lucide-react';
import { StudentQRCode } from './StudentQRCode';

export interface StudentIDCardProps {
  student: any;
  schoolInfo?: any;
  isBack?: boolean;
  layoutMode?: any;
}

export function StudentIDCard({ student, schoolInfo = {}, isBack = false }: StudentIDCardProps) {
  const name = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Arav Tyagi';
  const className = student.class_name || '4 - A';
  const rollNo = student.roll_number || student.roll_no || '12';
  const idNo = student.universal_id || student.admission_number || student.admission_no || 'CBS/24-25/0412';
  const dob = student.dob ? new Date(student.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 May 2014';
  const bloodGroup = student.blood_group || 'O+';
  const parentContact = student.guardian_phone || student.father_phone || '9876543210';
  const address = student.address || student.residential_address || '123, Green Park, New Delhi - 110016';
  
  const schName = schoolInfo.name || 'Crayon Box School';
  const schWebsite = schoolInfo.website || 'www.crayonboxschool.edu.in';
  const schPhone = schoolInfo.phone || '011-45678901';

  // Helper for top header which is same on front and back
  const renderHeader = () => (
    <div className="relative pt-6 pb-2 z-10 flex flex-col items-center">
      {/* Logo Placeholder */}
      <div className="w-[88px] h-[88px] rounded-full bg-white border-[3px] border-yellow-500 shadow-sm flex items-center justify-center mb-2 overflow-hidden relative">
         {/* Inner blue ring */}
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
      {/* Top curved blue background */}
      <svg className="absolute top-0 w-full" viewBox="0 0 400 160" fill="none" preserveAspectRatio="none">
        {/* Yellow swoop */}
        <path d="M0,0 L400,0 L400,100 C300,150 100,50 0,130 Z" fill="#EAB308" />
        {/* Blue swoop */}
        <path d="M0,0 L400,0 L400,85 C300,135 100,35 0,115 Z" fill="#0A1A44" />
        {/* Subtle leaf overlay in top left */}
        <path d="M-20,-20 Q50,-10 60,30 Q40,60 -10,50 Z" fill="rgba(255,255,255,0.05)" />
      </svg>
      
      {/* Bottom curved blue background */}
      <svg className="absolute bottom-0 w-full h-[100px]" viewBox="0 0 400 100" fill="none" preserveAspectRatio="none">
        {/* Yellow swoop */}
        <path d="M0,30 C150,80 250,-20 400,30 L400,100 L0,100 Z" fill="#EAB308" />
        {/* Blue swoop */}
        <path d="M0,45 C150,95 250,-5 400,45 L400,100 L0,100 Z" fill="#0A1A44" />
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
            <DetailRow icon={<User size={14}/>} label="Name" value={name} color="bg-[#9E1B32]" />
            <DetailRow icon={<Calendar size={14}/>} label="DOB" value={dob} color="bg-[#9E1B32]" />
            <DetailRow icon={<Droplet size={14}/>} label="Blood Group" value={bloodGroup} color="bg-[#9E1B32]" />
            <DetailRow icon={<Phone size={14}/>} label="Parent Contact" value={parentContact} color="bg-[#9E1B32]" />
            <DetailRow icon={<MapPin size={14}/>} label="Address" value={address} color="bg-[#9E1B32]" isMultiline />
          </div>

          {/* Instructions Box */}
          <div className="border border-[#9E1B32]/30 rounded-lg p-3 pt-4 relative mt-2 bg-white/50">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#9E1B32] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-yellow-400" />
              Instructions
              <div className="w-1 h-1 rounded-full bg-yellow-400" />
            </div>
            <ul className="text-[9px] text-[#0A1A44] space-y-1.5 leading-tight font-medium">
              <li className="flex items-start gap-1.5">
                <ChevronRight size={12} className="text-[#9E1B32] shrink-0 mt-[1px]" />
                This card is the property of Crayon Box School.
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight size={12} className="text-[#9E1B32] shrink-0 mt-[1px]" />
                This card must be worn every day.
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight size={12} className="text-[#9E1B32] shrink-0 mt-[1px]" />
                In case of loss, inform the school immediately.
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
        <div className="absolute bottom-0 w-full h-[65px] z-10 flex flex-row items-center justify-between px-6 pt-6 pb-2">
           <div className="flex flex-col items-center justify-center">
             <Globe size={14} className="text-yellow-500 mb-0.5" />
             <span className="text-white text-[8px] font-medium">{schWebsite}</span>
           </div>
           <div className="h-6 w-[1px] bg-white/20 mx-2" />
           <div className="flex flex-col items-center justify-center">
             <Phone size={14} className="text-yellow-500 mb-0.5" />
             <span className="text-white text-[8px] font-medium leading-tight text-center">{schPhone}<br/>9999999999</span>
           </div>
           <div className="h-6 w-[1px] bg-white/20 mx-2" />
           <div className="flex flex-col items-center justify-center text-center">
             <div className="w-5 h-6 border border-yellow-500 flex items-center justify-center rounded-b-md relative">
               <BookOpen size={10} className="text-yellow-500" />
               <div className="absolute -top-1 w-1 h-1 bg-yellow-500 rounded-full" />
             </div>
             <span className="text-white text-[7px] mt-0.5 leading-tight">Excellence in Education.<br/>Values for Life.</span>
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
          {student.photo_url ? (
            <img src={student.photo_url} alt={name} className="w-full h-full object-cover rounded-full bg-gray-100" />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-[#0A1A44]">
              <User size={40} />
            </div>
          )}
        </div>

        {/* Name Ribbon */}
        <div className="relative w-[240px] h-10 bg-[#0A1A44] flex items-center justify-center shadow-sm mb-1">
           {/* Ribbon Tails */}
           <div className="absolute -left-3 top-0 w-0 h-0 border-t-[20px] border-b-[20px] border-r-[12px] border-transparent border-r-[#0A1A44]" />
           <div className="absolute -right-3 top-0 w-0 h-0 border-t-[20px] border-b-[20px] border-l-[12px] border-transparent border-l-[#0A1A44]" />
           
           <h2 className="text-white font-bold text-lg uppercase tracking-wider">{name}</h2>
        </div>

        {/* Class Trapezoid */}
        <div className="relative mb-2">
           {/* Decorators */}
           <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-3 h-5 bg-[#D41B44] skew-x-[-20deg]" />
           <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-3 h-5 bg-[#D41B44] skew-x-[20deg]" />
           
           {/* Main Yellow Banner */}
           <div className="bg-yellow-500 px-8 py-1 transform skew-x-[-10deg]">
             <span className="block transform skew-x-[10deg] text-[#0A1A44] font-bold text-[14px]">
               Class : {className}
             </span>
           </div>
        </div>

        {/* Roll No */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-[1px] w-10 bg-yellow-500" />
          <span className="text-[#0A1A44] font-bold text-[13px]">Roll No. : {rollNo}</span>
          <div className="h-[1px] w-10 bg-yellow-500" />
        </div>

        {/* QR Section */}
        <div className="relative mt-2">
          {/* Badge Label */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#D41B44] text-white text-[9px] font-bold px-3 py-0.5 rounded-full z-10 shadow-sm uppercase tracking-wider whitespace-nowrap">
            Attendance QR
          </div>
          
          <div className="border border-[#D41B44] rounded-lg p-2 bg-white relative">
            <StudentQRCode payload={idNo} size={65} />
          </div>
        </div>
      </div>

      {/* Front Footer */}
      <div className="absolute bottom-0 w-full h-[65px] z-10 flex items-center justify-center px-8 pt-4 pb-2">
         <div className="flex items-center justify-center gap-4 w-full">
            <div className="w-8 h-9 border border-yellow-500 flex items-center justify-center rounded-b-lg relative shrink-0">
               <BookOpen size={16} className="text-yellow-500" />
               <div className="absolute -top-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full" />
            </div>
            
            <div className="h-8 w-[1px] bg-white/30" />
            
            <div className="flex flex-col flex-1">
              <span className="text-white text-[11px] font-medium leading-tight">ID No. :</span>
              <span className="text-white text-[12px] font-bold leading-tight">{idNo}</span>
            </div>
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
    <div className="flex w-[80px] shrink-0 items-center justify-between font-bold text-[#0A1A44]">
      <span>{label}</span>
      <span>:</span>
    </div>
    <div className="font-medium text-[#1E293B] leading-tight flex-1">
      {value}
    </div>
  </div>
);
