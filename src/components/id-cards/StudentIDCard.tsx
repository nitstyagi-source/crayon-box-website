"use client";

import React from 'react';
import { User, Calendar, Globe, Droplet, Phone, MapPin, ChevronRight, BookOpen, QrCode, ShieldCheck, Sparkles, Barcode } from 'lucide-react';
import { StudentQRCode } from './StudentQRCode';
import { AttendanceBarcode } from './AttendanceBarcode';
import { StandardizedIdPhoto } from './StandardizedIdPhoto';
import { VastuMandalaWatermark } from '@/components/common/VastuMandalaWatermark';

export type IdCardThemeId = 'rashtriya' | 'digital-bharat' | 'gurukul' | 'neo-swiss' | 'landscape';

export interface StudentIDCardProps {
  student: any;
  schoolInfo?: any;
  isBack?: boolean;
  layoutMode?: any;
  themeId?: IdCardThemeId;
}

export function StudentIDCard({ 
  student, 
  schoolInfo = {}, 
  isBack = false, 
  themeId = 'rashtriya' 
}: StudentIDCardProps) {
  const name = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Aarav Sharma';
  const className = student.class_name || 'Class 5';
  const section = student.section_name || 'A';
  const rollNo = student.roll_number || student.roll_no || '12';
  const idNo = student.universal_id || student.admission_number || student.admission_no || 'CBS/26-27/0412';
  const apaarId = student.apaar_id || student.pen_number || '9281-4019-3821';
  const dob = student.dob ? new Date(student.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 May 2015';
  const bloodGroup = student.blood_group || 'O+';
  const parentContact = student.guardian_phone || student.father_phone || '9811102008';
  const emergencyPhone = student.emergency_contact || student.mother_phone || '9810081008';
  const address = student.address || student.residential_address || 'Sant Nagar, Burari, Delhi - 110084';
  const busRoute = student.bus_route_no || student.route_name || 'Route 04';
  
  const schName = schoolInfo.name || 'Crayon Box School';
  const schAffiliation = schoolInfo.boardAffiliation || 'CBSE AFFILIATED';
  const schWebsite = schoolInfo.website || 'www.crayonboxschool.edu.in';
  const schPhone = schoolInfo.phone || '+91 11 2761 8899';
  const schLogo = schoolInfo.logoUrl || schoolInfo.logo_url || '/logo.png';
  const schPrincipal = schoolInfo.principalName || schoolInfo.principal_name || 'Dr. Ananya Roy';
  const schShortName = schoolInfo.shortName || schoolInfo.short_name || schoolInfo.name || 'Crayon Box';

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
            {schAffiliation} • APAAR &amp; DIGILOCKER VERIFIED
          </p>
        </div>

        {/* Student Vitals List */}
        <div className="flex-1 px-5 pt-3 pb-2 z-10 space-y-2">
          <div className="bg-white/95 rounded-2xl p-3 border border-[#E8DFC8] shadow-2xs space-y-1.5 text-xs">
            <DetailRow icon={<Calendar size={12} />} label="Date of Birth" value={dob} />
            <DetailRow icon={<Droplet size={12} />} label="Blood Group" value={bloodGroup} />
            <DetailRow icon={<Phone size={12} />} label="Parent Contact" value={parentContact} />
            <DetailRow icon={<Phone size={12} />} label="Emergency Ph" value={emergencyPhone} />
            <DetailRow icon={<MapPin size={12} />} label="Residence" value={address} isMultiline />
          </div>

          {/* Institutional Regulations & Indian Safety Standard */}
          <div className="bg-[#FAF7F2] border border-amber-300/50 rounded-xl p-2.5 text-[9px] text-stone-700 leading-tight space-y-1">
            <div className="font-bold text-[#A16207] uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck size={11} /> National Student Safety Standard
            </div>
            <p>1. Must be displayed on campus premises and during school transport transit.</p>
            <p>2. Encrypted credentials are synced with the APAAR Academic Bank of Credits.</p>
            <p>3. Report loss immediately to School Office or via {schShortName} Parent App.</p>
          </div>

          {/* Principal Seal & Authorized Signature */}
          <div className="pt-1.5 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[8px] font-mono text-stone-400 font-bold block">VALID TILL</span>
              <span className="text-[10px] font-extrabold text-stone-900">31 MAR 2027</span>
            </div>
            <div className="text-center">
              <div className="h-6 font-serif italic text-xs font-bold text-stone-900">
                {schPrincipal}
              </div>
              <span className="text-[8px] font-black uppercase text-stone-600 tracking-wider">Principal (Seal &amp; Sign)</span>
            </div>
          </div>
        </div>

        {/* Back Footer Strip */}
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
  // THEME 1: RASHTRIYA TIRANGA (INDIAN TRICOLOR & ASHOKA CHAKRA WATERMARK)
  // -------------------------------------------------------------
  if (themeId === 'rashtriya') {
    return (
      <div className="w-[330px] h-[520px] bg-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border-2 border-orange-300 print:shadow-none print:border-stone-800 text-stone-900 shrink-0 select-none">
        {/* Authentic Indian Tricolor Ribbon Top */}
        <div className="h-3 w-full bg-gradient-to-r from-[#FF671F] 0%, from-[#FF671F] 33.3%, via-white 33.3%, via-white 66.6%, to-[#046A38] 66.6%, to-[#046A38] 100%"></div>

        {/* Header with National Salutation */}
        <div className="bg-gradient-to-b from-orange-50/80 to-white px-4 pt-2.5 pb-2 text-center border-b border-orange-100 z-10">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-white border border-orange-300 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img src={schLogo} alt={schName} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
            </div>
            <div className="text-left">
              <h1 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 leading-tight">{schName}</h1>
              <span className="text-[8px] text-orange-800 font-bold uppercase tracking-wider block">{schAffiliation} • DELHI NCR</span>
            </div>
          </div>
          <div className="text-[8px] font-bold text-slate-500 flex items-center justify-center gap-2">
            <span>सत्यमेव जयते</span>
            <span>•</span>
            <span className="text-[#000080] font-black">APAAR ID: {apaarId}</span>
          </div>
        </div>

        {/* Center Body with Watermark */}
        <div className="flex-1 flex flex-col items-center pt-2 px-4 z-10 relative">
          {/* Subtle Ashoka Chakra Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <svg className="w-48 h-48 text-[#000080]" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4"/>
              <circle cx="50" cy="50" r="8" fill="currentColor"/>
              <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18 M8 30 L92 70 M8 70 L92 30 M30 8 L70 92 M30 92 L70 8" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>

          {/* Child Photo with Universal Institutional Studio Backdrop */}
          <StandardizedIdPhoto
            src={student.photo_url}
            name={name}
            className="w-22 h-26 rounded-2xl mb-1.5"
            borderGradient="from-[#FF671F] via-white to-[#046A38]"
            badgeLabel="STUDENT • 2026-27"
            badgeBg="#000080"
          />

          {/* Student Name */}
          <h2 className="text-slate-950 font-black text-base uppercase tracking-tight text-center leading-tight mt-0.5">
            {name}
          </h2>

          {/* Class, Section & Roll No Badge */}
          <div className="flex items-center gap-2 mt-0.5 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-orange-700 text-white text-xs font-bold shadow-2xs">
              {className} - {section}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-300 text-orange-950 text-xs font-bold font-mono">
              Roll: {rollNo}
            </span>
          </div>

          {/* Front Attendance Barcode Container */}
          <div className="w-full bg-slate-50 border border-orange-200/80 rounded-xl p-1.5 shadow-2xs flex flex-col items-center mb-1.5">
            <div className="flex items-center justify-between w-full px-1 text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              <span className="flex items-center gap-1 text-[#000080]">
                <Barcode size={10} /> Attendance Barcode
              </span>
              <span className="text-emerald-700 font-mono">TURNSTILE READY</span>
            </div>
            <AttendanceBarcode code={idNo} width={220} height={28} showText={true} />
          </div>

          {/* Bottom Vitals Strip & Gate Clearance */}
          <div className="w-full grid grid-cols-2 gap-2 mt-auto mb-2 text-center text-[9px] font-bold">
            <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-lg py-1">
              Blood: {bloodGroup}
            </div>
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg py-1">
              Transit: {busRoute}
            </div>
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
  // THEME 2: DIGITAL BHARAT & SMART CAMPUS (CYBER TRICOLOR RFID)
  // -------------------------------------------------------------
  if (themeId === 'digital-bharat') {
    return (
      <div className="w-[330px] h-[520px] bg-slate-950 text-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border-2 border-slate-800 print:shadow-none text-stone-900 shrink-0 select-none">
        {/* Holographic Security Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-[#FF671F] via-cyan-400 to-[#046A38]"></div>

        {/* Cyber Header */}
        <div className="p-3.5 pb-2 flex items-center justify-between border-b border-slate-800 text-white">
          <div>
            <div className="flex items-center gap-1.5 text-[8px] font-mono uppercase font-bold text-orange-400">
              <span>DIGITAL INDIA</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-emerald-400">APAAR REGISTRY</span>
            </div>
            <h1 className="text-xs font-black tracking-tight text-white uppercase">{schName}</h1>
          </div>
          <div className="w-8 h-6 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-[8px] font-mono text-cyan-300">
            NFC
          </div>
        </div>

        {/* Cyber Front Body */}
        <div className="flex-1 flex flex-col items-center pt-2 px-4 z-10">
          <StandardizedIdPhoto
            src={student.photo_url}
            name={name}
            className="w-22 h-26 rounded-2xl mb-1.5"
            borderGradient="from-orange-500 via-cyan-400 to-emerald-500"
            badgeLabel={`APAAR: ${apaarId.slice(0, 9)}`}
            badgeBg="#06b6d4"
            badgeColor="#0f172a"
          />

          <h2 className="text-white font-black text-base uppercase tracking-tight text-center leading-tight mt-0.5">
            {name}
          </h2>

          <div className="flex items-center gap-2 mt-0.5 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-slate-900 text-orange-400 border border-orange-500/40 text-xs font-bold font-mono">
              {className}-{section}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono">
              Roll #{rollNo}
            </span>
          </div>

          {/* Front Attendance Barcode with Cyber Neon Styling */}
          <div className="w-full bg-slate-900/90 border border-cyan-500/40 rounded-xl p-1.5 shadow-md flex flex-col items-center mb-1.5">
            <div className="flex items-center justify-between w-full px-1 text-[8px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-0.5">
              <span className="flex items-center gap-1 text-cyan-300">
                <Barcode size={10} /> Fast Attendance Laser
              </span>
              <span className="text-emerald-400">13.56 MHz RFID</span>
            </div>
            <AttendanceBarcode code={idNo} width={220} height={28} showText={true} />
          </div>

          <div className="w-full grid grid-cols-2 gap-2 mt-auto mb-2 text-center text-[9px] font-mono font-bold">
            <div className="bg-slate-900 text-rose-400 border border-slate-800 rounded-lg py-1">
              BLOOD: {bloodGroup}
            </div>
            <div className="bg-slate-900 text-emerald-400 border border-slate-800 rounded-lg py-1">
              BUS: {busRoute}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-400 text-[8px] font-mono py-1.5 px-4 flex items-center justify-between border-t border-slate-800">
          <span className="text-emerald-400">● GATE ATTENDANCE CLEARANCE</span>
          <span>SESSION 2026-27</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 5: RAJBHASHA EXECUTIVE LANDSCAPE (HORIZONTAL CR80)
  // -------------------------------------------------------------
  if (themeId === 'landscape') {
    return (
      <div className="w-[500px] h-[315px] bg-white rounded-3xl shadow-xl relative overflow-hidden flex flex-row font-sans border-2 border-slate-200 print:shadow-none text-stone-900 shrink-0 select-none">
        {/* Left Column with Tricolor Spine */}
        <div className="w-44 bg-gradient-to-b from-[#0B1B30] to-[#153257] p-3 text-white flex flex-col items-center justify-between text-center shrink-0 relative overflow-hidden">
          {/* Left Vertical Tricolor Spine */}
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-[#FF671F] 0%, from-[#FF671F] 33.3%, via-white 33.3%, via-white 66.6%, to-[#046A38] 66.6%, to-[#046A38] 100%"></div>

          <div className="flex items-center gap-1.5 pl-2">
            <span className="text-[9px] font-black tracking-tight uppercase">CRAYON BOX</span>
          </div>

          <StandardizedIdPhoto
            src={student.photo_url}
            name={name}
            className="w-20 h-24 rounded-xl ml-1 shadow-md"
            borderGradient="from-[#FF671F] via-white to-[#046A38]"
          />

          <span className="bg-rose-600 text-white text-[8.5px] font-black px-2.5 py-0.5 rounded-full shadow-2xs ml-1">
            BLOOD: {bloodGroup}
          </span>
        </div>

        {/* Right Details Column */}
        <div className="flex-1 p-3.5 flex flex-col justify-between">
          <div className="flex items-start justify-between border-b border-slate-100 pb-1">
            <div>
              <h2 className="font-black text-sm text-slate-900 tracking-tight">{schName}</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase">{schAffiliation} • SEC 62 NOIDA</p>
            </div>
            <span className="text-[8px] font-mono font-bold bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full uppercase">
              2026-27
            </span>
          </div>

          <div className="space-y-0.5">
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">{name}</h3>
            <div className="text-xs font-bold text-indigo-700">
              Class {className} - Section {section} (Roll #{rollNo})
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9.5px] bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 text-[8px] font-bold uppercase block">ID Number</span>
              <strong className="font-mono text-slate-800">{idNo}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[8px] font-bold uppercase block">Bus Route</span>
              <strong className="text-slate-800">{busRoute}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[8px] font-bold uppercase block">Emergency Phone</span>
              <strong className="font-mono text-slate-800">{parentContact}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[8px] font-bold uppercase block">APAAR ID</span>
              <strong className="font-mono text-indigo-900">{apaarId.slice(0, 10)}...</strong>
            </div>
          </div>

          {/* Front Attendance Barcode */}
          <div className="bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-between">
            <div className="flex-1 max-w-[260px]">
              <AttendanceBarcode code={idNo} width={240} height={22} showText={false} />
            </div>
            <span className="text-[8px] font-mono font-bold text-slate-500 pr-1">SCAN TURNSTILE</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[8px]">
            <span className="font-mono text-slate-400">Govt. Recognized Educational Credential</span>
            <div className="text-right">
              <span className="font-serif italic text-[9px] font-bold text-slate-900">{schPrincipal}</span>
              <span className="text-[7.5px] font-bold uppercase text-slate-400 block">Principal Seal</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 3: GURUKUL HERITAGE (ROYAL BURGUNDY, SANSKRIT MOTTO)
  // -------------------------------------------------------------
  if (themeId === 'gurukul') {
    return (
      <div className="w-[330px] h-[520px] bg-[#FDFBF7] rounded-3xl shadow-xl relative overflow-hidden flex flex-col font-sans border-2 border-[#D4AF37] print:shadow-none text-stone-900 shrink-0 select-none">
        <div className="bg-gradient-to-r from-[#5B1015] via-[#7B181E] to-[#5B1015] text-white p-3 text-center relative border-b-2 border-[#D4AF37]">
          <span className="text-[9px] font-bold text-amber-300 tracking-wider block mb-0.5">सा विद्या या विमुक्तये</span>
          <h1 className="font-serif text-sm font-black tracking-wide text-white uppercase">{schName}</h1>
          <p className="text-[8px] text-amber-200/90 font-medium">ESTD. 2012 • RECOGNIZED FOUNDATION</p>
        </div>

        <div className="flex-1 flex flex-col items-center pt-2 px-4 z-10">
          <StandardizedIdPhoto
            src={student.photo_url}
            name={name}
            className="w-20 h-24 rounded-xl mb-1.5 shadow-md"
            borderGradient="from-[#D4AF37] via-amber-200 to-[#7B181E]"
          />

          <h2 className="font-serif font-black text-sm text-[#5B1015] uppercase">{name}</h2>
          <span className="text-[10px] font-bold text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300 mt-0.5">
            विद्यार्थी • कक्षा {className}-{section}
          </span>

          <div className="w-full mt-1.5 bg-white/80 rounded-xl p-2.5 border border-[#D4AF37]/40 text-[10px] space-y-1 text-left">
            <div className="flex justify-between border-b border-amber-100 pb-0.5">
              <span className="text-stone-500 font-bold">Kramank:</span>
              <strong className="font-mono text-[#5B1015]">{idNo}</strong>
            </div>
            <div className="flex justify-between border-b border-amber-100 pb-0.5">
              <span className="text-stone-500 font-bold">Rakta Samooha:</span>
              <strong className="text-rose-700 font-black">{bloodGroup}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-bold">Abhibhavak Phone:</span>
              <strong className="font-mono text-stone-900">{parentContact}</strong>
            </div>
          </div>

          {/* Front Attendance Barcode with Vedic Accent */}
          <div className="w-full mt-2 bg-white rounded-xl p-1.5 border border-[#D4AF37]/50 shadow-2xs flex flex-col items-center">
            <div className="flex items-center justify-between w-full px-1 text-[8px] font-bold text-amber-900 uppercase tracking-wider mb-0.5">
              <span>उपस्थिति बारकोड (Attendance)</span>
              <span className="font-mono text-stone-500">{idNo}</span>
            </div>
            <AttendanceBarcode code={idNo} width={220} height={26} showText={false} />
          </div>

          <div className="w-full flex items-center justify-between pt-1 border-t border-[#D4AF37]/40 text-[8px] mt-auto mb-2">
            <div>
              <span className="text-stone-400 block uppercase">SATRA</span>
              <span className="font-bold text-stone-800">2026-2027</span>
            </div>
            <div className="text-right">
              <div className="font-serif italic font-bold text-[#5B1015] text-[9px]">{schPrincipal}</div>
              <span className="font-bold uppercase text-amber-900">Acharya (Seal)</span>
            </div>
          </div>
        </div>

        <div className="bg-[#5B1015] text-amber-200 text-[8px] font-bold py-1 px-4 text-center border-t border-[#D4AF37]">
          {schWebsite} • TRUST REGISTRY
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 4: INTERNATIONAL NEO-SWISS (MINIMAL WHITE & FLAG DOTS)
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

      <div className="flex-1 px-4 py-2.5 flex flex-col items-center text-center justify-between">
        <StandardizedIdPhoto
          src={student.photo_url}
          name={name}
          className="w-22 h-26 rounded-2xl ring-4 ring-slate-100 shadow-sm"
          borderGradient="from-slate-200 via-slate-100 to-slate-300"
          badgeLabel="VERIFIED"
          badgeBg="#10b981"
        />

        <div className="mt-1 space-y-0.5">
          <h2 className="font-black text-base text-slate-900 leading-tight">{name}</h2>
          <p className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-0.5 rounded-full inline-block">
            {className} - {section}
          </p>
        </div>

        <div className="w-full grid grid-cols-2 gap-2 text-left bg-slate-50 p-2 rounded-xl border border-slate-100 text-[10px]">
          <div>
            <span className="text-slate-400 text-[8px] font-bold uppercase block">ID Number</span>
            <strong className="font-mono text-slate-900">{idNo}</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[8px] font-bold uppercase block">Blood Group</span>
            <strong className="text-rose-600 font-extrabold">{bloodGroup}</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[8px] font-bold uppercase block">Transit</span>
            <strong className="text-slate-800">{busRoute}</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[8px] font-bold uppercase block">Emergency</span>
            <strong className="font-mono text-slate-800">{parentContact}</strong>
          </div>
        </div>

        {/* Front Attendance Barcode */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex flex-col items-center">
          <div className="flex items-center justify-between w-full px-1 text-[8px] font-mono text-slate-400 mb-0.5 uppercase">
            <span>Attendance Barcode</span>
            <span>Turnstile Ready</span>
          </div>
          <AttendanceBarcode code={idNo} width={220} height={26} showText={true} />
        </div>
      </div>

      <div className="bg-slate-900 text-white p-2 flex items-center justify-between text-[8px] font-mono">
        <span>GATE TURNSTILE CLEARANCE</span>
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

export default StudentIDCard;
