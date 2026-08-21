"use client";

import { useState, useEffect } from "react";
import { 
  Building2, Phone, Mail, Award, CheckCircle2, 
  ShieldCheck, Sparkles, UserCheck, AlertTriangle, 
  Calendar, Layers, MapPin
} from "lucide-react";
import QRCode from "qrcode";

export interface FacultyCardData {
  id: string;
  fullName: string;
  firstName: string;
  lastName?: string;
  employeeId: string;
  employeeCode?: string;
  designation: string;
  department: string;
  wing?: string;
  photoUrl?: string | null;
  bloodGroup?: string;
  joiningDate?: string;
  phone?: string;
  emergencyContact?: string;
  email?: string;
  academicSession: string;
  employmentStatus?: string;
  card?: {
    id?: string;
    cardNumber: string;
    qrToken: string;
    status: string;
    issueDate?: string;
    expiryDate?: string;
    templateType?: string;
    reprintCount?: number;
    previousCardNumber?: string;
  } | null;
  isLeadership?: boolean;
  computedCardStatus?: string;
}

interface FacultyIdCardProps {
  faculty: FacultyCardData;
  template?: "Leadership" | "Teaching" | "Admin" | "Specialist" | "Support" | "Guest" | "Standard";
  showBack?: boolean;
  isPrintMode?: boolean;
}

export default function FacultyIdCardPreview({
  faculty,
  template = "Teaching",
  showBack = false,
  isPrintMode = false
}: FacultyIdCardProps) {
  const [qrUrl, setQrUrl] = useState<string>("");

  const qrToken = faculty.card?.qrToken || `CBS-FAC-VERIFY-${faculty.employeeCode || faculty.employeeId}-${faculty.id.substring(0, 6)}`;

  useEffect(() => {
    QRCode.toDataURL(
      `https://crayonboxschool.com/verify/faculty/${qrToken}`,
      {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 256,
        color: {
          dark: "#0f172a",
          light: "#ffffff"
        }
      }
    ).then(setQrUrl).catch(console.error);
  }, [qrToken]);

  // Determine Visual Color Scheme by Template / Role
  const isLeadership = faculty.isLeadership || template === "Leadership" || faculty.designation.toLowerCase().includes("principal") || faculty.designation.toLowerCase().includes("director");
  const isGuest = template === "Guest" || faculty.designation.toLowerCase().includes("guest") || faculty.designation.toLowerCase().includes("visiting");

  const themeStyles = isLeadership ? {
    headerBg: "bg-linear-to-r from-slate-900 via-purple-950 to-slate-900 text-amber-300",
    badgeBg: "bg-amber-400/20 text-amber-300 border-amber-400/40",
    accentBorder: "border-amber-400/50",
    ribbonColor: "bg-amber-400 text-slate-950",
    stripeBg: "from-purple-900 to-slate-950"
  } : isGuest ? {
    headerBg: "bg-linear-to-r from-rose-950 via-red-900 to-stone-900 text-rose-200",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-400/40",
    accentBorder: "border-rose-400/50",
    ribbonColor: "bg-rose-500 text-white",
    stripeBg: "from-rose-900 to-stone-950"
  } : {
    headerBg: "bg-linear-to-r from-purple-900 via-indigo-900 to-purple-950 text-white",
    badgeBg: "bg-purple-500/20 text-purple-200 border-purple-400/40",
    accentBorder: "border-purple-400/50",
    ribbonColor: "bg-purple-600 text-white",
    stripeBg: "from-purple-900 to-indigo-950"
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-6 items-center justify-center ${isPrintMode ? "p-0" : ""}`}>
      
      {/* ========================================================================= */}
      {/* 🪪 ID CARD FRONT */}
      {/* ========================================================================= */}
      <div 
        className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-300 flex flex-col justify-between select-none shrink-0"
        style={{
          width: "320px",
          height: "480px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Top Header */}
        <div className={`${themeStyles.headerBg} p-3.5 text-center relative overflow-hidden shrink-0`}>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
          
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <div className="w-6 h-6 rounded-full bg-white text-purple-950 flex items-center justify-center font-black text-xs shadow-xs shrink-0">
              CB
            </div>
            <h2 className="font-black text-sm uppercase tracking-wider">
              CRAYON BOX SCHOOL
            </h2>
          </div>
          
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-semibold text-white/80">
            <span>CBSE AFFILIATED</span>
            <span>•</span>
            <span className="font-mono">DELHI</span>
            <span>•</span>
            <span className="font-mono">UDISE: 07124100151</span>
          </div>

          <div className="mt-1 flex items-center justify-between text-[8px] font-mono px-2 py-0.5 rounded bg-black/30 text-stone-200">
            <span>SESSION: {faculty.academicSession || "2026–27"}</span>
            <span className="uppercase font-bold tracking-wider text-amber-300">FACULTY ID</span>
          </div>
        </div>

        {/* Center Stage: Photo & Core Metadata */}
        <div className="px-4 py-2 flex flex-col items-center text-center space-y-2 flex-1 justify-center">
          
          {/* Faculty Photo */}
          <div className="relative">
            <div className={`w-28 h-28 rounded-2xl overflow-hidden bg-stone-100 border-2 ${themeStyles.accentBorder} shadow-md flex items-center justify-center`}>
              {faculty.photoUrl ? (
                <img 
                  src={faculty.photoUrl} 
                  alt={faculty.fullName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-tr from-purple-100 to-indigo-100 text-purple-900 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black">{faculty.firstName.charAt(0)}{faculty.lastName?.charAt(0) || ""}</span>
                  <span className="text-[9px] font-mono text-purple-600 mt-1 uppercase">FACULTY</span>
                </div>
              )}
            </div>

            {/* Status Dot */}
            <span className={`absolute -bottom-1.5 -right-1.5 px-2 py-0.5 text-[8px] font-bold rounded-full border shadow-xs ${
              faculty.computedCardStatus === "Active" || faculty.employmentStatus === "Active"
                ? "bg-emerald-500 text-white border-emerald-300"
                : "bg-red-500 text-white border-red-300"
            }`}>
              {faculty.computedCardStatus === "Active" ? "ACTIVE" : faculty.computedCardStatus?.toUpperCase()}
            </span>
          </div>

          {/* Name & Designation */}
          <div className="space-y-0.5 pt-1">
            <h3 className="text-base font-black text-stone-900 uppercase tracking-tight leading-tight">
              {faculty.fullName}
            </h3>
            <p className="text-xs font-bold text-purple-900 italic">
              {faculty.designation}
            </p>
          </div>

          {/* Key Identification Strip */}
          <div className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-left text-[10px] space-y-1 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-semibold">Employee ID:</span>
              <strong className="text-stone-900 font-black">{faculty.employeeCode || faculty.employeeId}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-semibold">Department:</span>
              <span className="text-purple-900 font-bold truncate max-w-[140px]">{faculty.department}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-semibold">Blood Group:</span>
              <span className="text-red-700 font-black">{faculty.bloodGroup || "O+"}</span>
            </div>
          </div>

          {/* Secure QR Code */}
          <div className="flex items-center gap-3 pt-1">
            <div className="w-14 h-14 bg-white p-1 rounded-xl border border-stone-300 shadow-2xs flex items-center justify-center shrink-0">
              {qrUrl ? (
                <img src={qrUrl} alt="Faculty QR" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-stone-100 animate-pulse rounded" />
              )}
            </div>
            <div className="text-left text-[9px] font-mono leading-tight text-stone-500 space-y-0.5">
              <span className="block font-bold text-stone-800">SCAN TO VERIFY</span>
              <span className="block text-[8px] text-stone-400">Card No: {faculty.card?.cardNumber || `CBS-FAC-${faculty.employeeCode || "0245"}`}</span>
              <span className="block text-[8px] text-emerald-700 font-bold">DIGITALLY SECURED</span>
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="px-3 py-1.5 bg-stone-900 text-stone-300 flex justify-between items-center text-[8px] font-mono shrink-0">
          <span>MAIN CAMPUS</span>
          <span className="text-amber-400 font-bold">CRAYON BOX SCHOOL</span>
        </div>
      </div>


      {/* ========================================================================= */}
      {/* 🪪 ID CARD BACK */}
      {/* ========================================================================= */}
      <div 
        className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-300 flex flex-col justify-between select-none shrink-0"
        style={{
          width: "320px",
          height: "480px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Top Header */}
        <div className="bg-stone-900 text-white p-3 text-center shrink-0">
          <h4 className="font-black text-xs uppercase tracking-wider text-amber-300">
            FACULTY IDENTIFICATION CARD
          </h4>
          <span className="text-[9px] font-mono text-stone-400">TERMS & OFFICIAL DIRECTIVES</span>
        </div>

        {/* Center Details */}
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
          
          {/* Employee Record Breakdown */}
          <div className="space-y-1.5 text-[10px] bg-stone-50 p-2.5 rounded-xl border border-stone-200 font-sans">
            <div className="flex justify-between border-b border-stone-200 pb-1">
              <span className="text-stone-500">Employee Name:</span>
              <strong className="text-stone-900 font-bold">{faculty.fullName}</strong>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1">
              <span className="text-stone-500">Designation:</span>
              <span className="text-stone-900 font-bold">{faculty.designation}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1">
              <span className="text-stone-500">Department:</span>
              <span className="text-stone-800">{faculty.department}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1">
              <span className="text-stone-500">Date of Joining:</span>
              <span className="font-mono text-stone-800">{faculty.joiningDate ? new Date(faculty.joiningDate).toLocaleDateString("en-IN") : "01/04/2020"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Emergency Contact:</span>
              <strong className="text-red-700 font-mono font-bold">{faculty.emergencyContact || faculty.phone || "+91 98111 02008"}</strong>
            </div>
          </div>

          {/* Official School Contact Block */}
          <div className="bg-purple-50/70 border border-purple-200 p-2.5 rounded-xl text-[9px] space-y-1 text-purple-950 font-sans">
            <strong className="block font-black text-purple-900 uppercase">CRAYON BOX SCHOOL</strong>
            <div className="flex items-start gap-1 text-stone-600">
              <MapPin className="w-2.5 h-2.5 mt-0.5 text-purple-700 shrink-0" />
              <span>Sant Nagar, Main Burari Road, Delhi - 110084</span>
            </div>
            <div className="flex justify-between text-stone-600 pt-0.5 font-mono">
              <span>Ph: 9811102008</span>
              <span>crayonboxdelhi@gmail.com</span>
            </div>
          </div>

          {/* Legal / Institutional Disclaimer */}
          <div className="p-2 bg-stone-100 rounded-lg text-[8px] text-stone-600 leading-relaxed italic border border-stone-200">
            "This card remains the exclusive property of Crayon Box School and must be returned upon separation from the organization. Loss of this card must be immediately reported to the Administration Office."
          </div>

          {/* Authorized Signature Block */}
          <div className="flex justify-between items-end pt-2">
            <div className="text-center">
              <div className="w-16 h-7 border-b border-stone-400 flex items-center justify-center text-[9px] font-mono text-stone-400 italic">
                Verified
              </div>
              <span className="text-[8px] font-bold text-stone-600 uppercase block mt-0.5">Admin Incharge</span>
            </div>

            <div className="text-center">
              <div className="w-24 h-7 border-b-2 border-stone-800 flex items-center justify-center text-[10px] font-serif font-black text-purple-900 tracking-wider">
                Nitin Tyagi
              </div>
              <span className="text-[8px] font-black text-stone-900 uppercase block mt-0.5">Authorized Signatory</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="p-1.5 bg-stone-900 text-stone-400 text-center text-[8px] font-mono">
          UDISE CODE: 07124100151 • SCHOOL ID: 1253481
        </div>
      </div>

    </div>
  );
}
