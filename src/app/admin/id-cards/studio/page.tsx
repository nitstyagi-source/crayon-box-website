"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  Printer,
  Sparkles,
  Palette,
  Sliders,
  Type,
  QrCode,
  FileText,
  RotateCcw,
  Save,
  CheckCircle2,
  Users,
  GraduationCap,
  Eye,
  Building2,
  Briefcase,
  ShieldCheck,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Layers,
  HeartHandshake
} from "lucide-react";
import {
  getBatchIdCardDataAction,
  StudentIdCardBadge
} from "@/app/actions/id-card-studio-actions";
import { StudentSuiteTabs } from "@/components/students/StudentSuiteTabs";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { StudentIDCard } from "@/components/id-cards/StudentIDCard";
import { TeacherIDCard } from "@/components/id-cards/TeacherIDCard";
import { EscortPickupCard } from "@/components/id-cards/EscortPickupCard";
import {
  IdCardCustomConfig,
  TeacherIdCardCustomConfig,
  EscortIdCardCustomConfig,
  DEFAULT_ID_CARD_CONFIG,
  DEFAULT_TEACHER_ID_CARD_CONFIG,
  DEFAULT_ESCORT_ID_CARD_CONFIG,
  ID_CARD_THEME_PRESETS,
  getIdCardConfig,
  saveIdCardConfig,
  resetIdCardConfig,
  getTeacherIdCardConfig,
  saveTeacherIdCardConfig,
  resetTeacherIdCardConfig,
  getEscortIdCardConfig,
  saveEscortIdCardConfig,
  resetEscortIdCardConfig
} from "@/lib/id-card-config";

export default function VisualIDCardStudioPage() {
  const { selectedInstitutionObj, currentInstitution } = useInstitution();
  const instCode = selectedInstitutionObj?.code || currentInstitution || "DEFAULT";

  // Studio Mode: 'customizer' (Design Studio & Live Preview) vs 'batch-print' (8-Up Print Sheet)
  const [studioMode, setStudioMode] = useState<"customizer" | "batch-print">("customizer");
  
  // Customizer Tabs: 'palette' | 'branding' | 'fields' | 'barcode' | 'motto' | 'back'
  const [customizerTab, setCustomizerTab] = useState<"palette" | "branding" | "fields" | "barcode" | "motto" | "back">("palette");

  // Persona Switcher: 'STUDENT' | 'TEACHER' | 'ESCORT'
  const [persona, setPersona] = useState<"STUDENT" | "TEACHER" | "ESCORT">("STUDENT");

  // Live Customizable Configurations for active school
  const [config, setConfig] = useState<IdCardCustomConfig>(() => getIdCardConfig(instCode));
  const [teacherConfig, setTeacherConfig] = useState<TeacherIdCardCustomConfig>(() => getTeacherIdCardConfig(instCode));
  const [escortConfig, setEscortConfig] = useState<EscortIdCardCustomConfig>(() => getEscortIdCardConfig(instCode));
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Preview options
  const [previewFace, setPreviewFace] = useState<"front" | "back" | "dual">("dual");
  const [selectedClass, setSelectedClass] = useState("Class 5");
  const [cards, setCards] = useState<StudentIdCardBadge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const availableClasses = [
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
  ];

  // Re-load configs whenever school switch occurs
  useEffect(() => {
    setConfig(getIdCardConfig(instCode));
    setTeacherConfig(getTeacherIdCardConfig(instCode));
    setEscortConfig(getEscortIdCardConfig(instCode));
  }, [instCode]);

  useEffect(() => {
    loadCards();
  }, [selectedClass]);

  async function loadCards() {
    setIsLoading(true);
    try {
      const res = await getBatchIdCardDataAction(selectedClass);
      if (res.success && res.cards.length > 0) {
        setCards(res.cards);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Sample faculty list for preview and batch printing
  const sampleFacultyList = [
    { id: "FAC-01", first_name: "Dr. Vikramaditya", last_name: "Shukla", designation: "Head of Science & Physics", department: "Science", universal_id: "FAC-VET-001", employee_id: "FAC-VET-001", phone_number: "+91 98111 22334", email: "v.shukla@schooldomain.edu.in", doj: "2022-04-01" },
    { id: "FAC-02", first_name: "Mrs. Meenakshi", last_name: "Sundaram", designation: "Senior Mathematics PGT", department: "Mathematics", universal_id: "FAC-VET-002", employee_id: "FAC-VET-002", phone_number: "+91 98111 33445", email: "m.sundaram@schooldomain.edu.in", doj: "2021-07-15" },
    { id: "FAC-03", first_name: "Mr. Rajesh", last_name: "Verma", designation: "Computer Science & AI HOD", department: "Technology", universal_id: "FAC-VET-003", employee_id: "FAC-VET-003", phone_number: "+91 98111 44556", email: "r.verma@schooldomain.edu.in", doj: "2023-01-10" },
    { id: "FAC-04", first_name: "Ms. Sunita", last_name: "Chopra", designation: "English Literature TGT", department: "Languages", universal_id: "FAC-VET-004", employee_id: "FAC-VET-004", phone_number: "+91 98111 55667", email: "s.chopra@schooldomain.edu.in", doj: "2020-09-01" },
    { id: "FAC-05", first_name: "Mr. Anil", last_name: "Kumble", designation: "Physical Education Director", department: "Sports", universal_id: "FAC-VET-005", employee_id: "FAC-VET-005", phone_number: "+91 98111 66778", email: "a.kumble@schooldomain.edu.in", doj: "2019-06-20" },
    { id: "FAC-06", first_name: "Dr. Pratibha", last_name: "Nair", designation: "Biology & Biotechnology HOD", department: "Science", universal_id: "FAC-VET-006", employee_id: "FAC-VET-006", phone_number: "+91 98111 77889", email: "p.nair@schooldomain.edu.in", doj: "2022-11-05" },
    { id: "FAC-07", first_name: "Mrs. Anjali", last_name: "Deshmukh", designation: "Social Sciences PGT", department: "Humanities", universal_id: "FAC-VET-007", employee_id: "FAC-VET-007", phone_number: "+91 98111 88990", email: "a.deshmukh@schooldomain.edu.in", doj: "2021-03-12" },
    { id: "FAC-08", first_name: "Mr. Suresh", last_name: "Menon", designation: "Senior Librarian & Archival", department: "Library", universal_id: "FAC-VET-008", employee_id: "FAC-VET-008", phone_number: "+91 98111 99001", email: "s.menon@schooldomain.edu.in", doj: "2018-08-14" },
  ];

  const previewFaculty = sampleFacultyList[0];

  // Active student object for live preview
  const previewStudent = useMemo(() => {
    if (cards.length > 0) {
      const c = cards[0];
      return {
        first_name: c.studentName?.split(" ")[0] || "AARAV",
        last_name: c.studentName?.split(" ").slice(1).join(" ") || "SHARMA",
        class_name: c.className || selectedClass,
        section_name: c.sectionName || "A",
        admission_number: c.admissionNo || "CBS/2026/0412",
        blood_group: c.bloodGroup || "O+",
        dob: "15 May 2015",
        emergency_contact: c.emergencyPhone || "+91 98111 02008",
        father_name: c.fatherName || "Rajesh Sharma",
        mother_name: "Sunita Sharma",
        address: "B-402, Royal Residency,\nBurari, Delhi - 110084",
        bus_route_no: c.busRoute || "Route 04 (Burari)",
        valid_upto: "31 Mar 2027",
        school_code: instCode,
      };
    }
    return {
      first_name: "AARAV",
      last_name: "SHARMA",
      class_name: selectedClass,
      admission_number: "CBS/2026/0412",
      blood_group: "O+",
      dob: "15 May 2015",
      father_name: "Rajesh Sharma",
      mother_name: "Sunita Sharma",
      address: "B-402, Royal Residency,\nBurari, Delhi - 110084",
      bus_route_no: "Route 04 (Burari)",
      valid_upto: "31 Mar 2027",
      school_code: instCode,
    };
  }, [cards, selectedClass, instCode]);

  // Sample 3 Authorized Escorts for preview and batch printing
  const previewEscorts = useMemo(() => {
    return [
      {
        id: "ESC-01",
        name: "Mr. Rajesh Sharma",
        relationship: "Father",
        phone: "+91 98111 02008",
        id_proof: "Aadhaar Card",
        id_no: "XXXX-XXXX-4102",
        photo_url: ""
      },
      {
        id: "ESC-02",
        name: "Mrs. Sunita Sharma",
        relationship: "Mother",
        phone: "+91 98111 02009",
        id_proof: "Aadhaar Card",
        id_no: "XXXX-XXXX-5519",
        photo_url: ""
      },
      {
        id: "ESC-03",
        name: "Mr. Rameshwar Dayal",
        relationship: "Grandfather",
        phone: "+91 98111 02010",
        id_proof: "Voter ID Card",
        id_no: "DL/04/012984",
        photo_url: ""
      }
    ];
  }, []);

  // Handle updates to student config properties
  const updateStudentConfig = (patch: Partial<IdCardCustomConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  // Handle updates to teacher config properties
  const updateTeacherConfig = (patch: Partial<TeacherIdCardCustomConfig>) => {
    setTeacherConfig((prev) => ({ ...prev, ...patch }));
  };

  // Handle updates to escort config properties
  const updateEscortConfig = (patch: Partial<EscortIdCardCustomConfig>) => {
    setEscortConfig((prev) => ({ ...prev, ...patch }));
  };

  // Save changes to localStorage & emit event
  const handleSave = () => {
    const instLabel = selectedInstitutionObj?.shortName || instCode;
    if (persona === "STUDENT") {
      const success = saveIdCardConfig(instCode, config);
      if (success) {
        setSaveStatus(`Saved Student ID Card template for ${instLabel}!`);
        setTimeout(() => setSaveStatus(null), 3500);
      }
    } else if (persona === "TEACHER") {
      const success = saveTeacherIdCardConfig(instCode, teacherConfig);
      if (success) {
        setSaveStatus(`Saved Teacher ID Card template for ${instLabel}!`);
        setTimeout(() => setSaveStatus(null), 3500);
      }
    } else {
      const success = saveEscortIdCardConfig(instCode, escortConfig);
      if (success) {
        setSaveStatus(`Saved Child Escort Card template for ${instLabel}!`);
        setTimeout(() => setSaveStatus(null), 3500);
      }
    }
  };

  // Reset to reference image defaults
  const handleReset = () => {
    const personaLabel = persona === "STUDENT" ? "Student" : persona === "TEACHER" ? "Teacher" : "Child Escort";
    if (window.confirm(`Reset ${personaLabel} ID card customizations for this school back to reference defaults?`)) {
      if (persona === "STUDENT") {
        resetIdCardConfig(instCode);
        setConfig({ ...DEFAULT_ID_CARD_CONFIG });
      } else if (persona === "TEACHER") {
        resetTeacherIdCardConfig(instCode);
        setTeacherConfig({ ...DEFAULT_TEACHER_ID_CARD_CONFIG });
      } else {
        resetEscortIdCardConfig(instCode);
        setEscortConfig({ ...DEFAULT_ESCORT_ID_CARD_CONFIG });
      }
      setSaveStatus(`Reset ${personaLabel} card back to default reference design.`);
      setTimeout(() => setSaveStatus(null), 3500);
    }
  };

  // Apply a preset theme
  const handleApplyPreset = (preset: typeof ID_CARD_THEME_PRESETS[number]) => {
    if (persona === "STUDENT") {
      updateStudentConfig({
        primaryColor: preset.primaryColor,
        accentColor: preset.accentColor,
        goldTextColor: preset.goldTextColor,
        cardBgColor: preset.cardBgColor,
      });
    } else if (persona === "TEACHER") {
      updateTeacherConfig({
        primaryColor: preset.primaryColor,
        accentColor: preset.accentColor,
        goldTextColor: preset.goldTextColor,
        cardBgColor: preset.cardBgColor,
      });
    } else {
      updateEscortConfig({
        primaryColor: preset.primaryColor,
        accentColor: preset.accentColor,
        goldTextColor: preset.goldTextColor,
        cardBgColor: preset.cardBgColor,
      });
    }
  };

  const activePrimaryColor = persona === "STUDENT" ? config.primaryColor : persona === "TEACHER" ? teacherConfig.primaryColor : escortConfig.primaryColor;
  const activeAccentColor = persona === "STUDENT" ? config.accentColor : persona === "TEACHER" ? teacherConfig.accentColor : escortConfig.accentColor;
  const activeGoldTextColor = persona === "STUDENT" ? config.goldTextColor : persona === "TEACHER" ? teacherConfig.goldTextColor : escortConfig.goldTextColor;
  const activeCardBgColor = persona === "STUDENT" ? config.cardBgColor : persona === "TEACHER" ? teacherConfig.cardBgColor : escortConfig.cardBgColor;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 bg-stone-50/60 min-h-screen text-stone-900 print:p-0 print:m-0 print:max-w-none print:bg-white">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 6mm;
          }
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl print:hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            School Customizer &bull; CR80 PVC Standard &bull; Exact Reference Parity
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-amber-400" />
            Institutional ID Card Visual Studio
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl">
            Visually customize colors, branding, vital fields, barcodes, mottos, and authorized escorts for Students, Teachers, and Child Escort Passes. All customizations persist per school.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="Reset template to factory defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save {persona === "STUDENT" ? "Student" : persona === "TEACHER" ? "Teacher" : "Escort"} Template
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-white text-slate-950 hover:bg-stone-100 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Sheet
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveStatus && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-sm animate-fade-in print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{saveStatus}</span>
        </div>
      )}

      {/* Persistent Suite Navigation */}
      <div className="print:hidden">
        <StudentSuiteTabs
          activeTab="ID_CARDS"
          counts={{ activeIdCards: cards.length || 24 }}
        />
      </div>

      {/* Persona Switcher & Studio View Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        
        {/* Persona Switcher: Student vs Teacher vs Escort */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500">Active Card:</span>
          <div className="p-1 bg-stone-100 rounded-2xl flex items-center gap-1 text-xs font-bold flex-wrap">
            <button
              type="button"
              onClick={() => setPersona("STUDENT")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                persona === "STUDENT" ? "bg-blue-900 text-white shadow-xs font-black" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Student Card
            </button>
            <button
              type="button"
              onClick={() => setPersona("TEACHER")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                persona === "TEACHER" ? "bg-amber-500 text-slate-950 shadow-xs font-black" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Teacher / Staff Card
            </button>
            <button
              type="button"
              onClick={() => setPersona("ESCORT")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                persona === "ESCORT" ? "bg-emerald-700 text-white shadow-xs font-black" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Child Escort Card
            </button>
          </div>
        </div>

        {/* View Mode & Filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">View:</span>
            <div className="p-1 bg-stone-100 rounded-2xl flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStudioMode("customizer")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  studioMode === "customizer" ? "bg-white text-blue-900 shadow-xs font-black" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <Palette className="w-3.5 h-3.5" /> Visual Customizer
              </button>
              <button
                type="button"
                onClick={() => setStudioMode("batch-print")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  studioMode === "batch-print" ? "bg-white text-blue-900 shadow-xs font-black" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <Printer className="w-3.5 h-3.5" /> Batch Print ({persona === "STUDENT" ? cards.length : persona === "TEACHER" ? sampleFacultyList.length : cards.length})
              </button>
            </div>
          </div>

          {(persona === "STUDENT" || persona === "ESCORT") && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-stone-100 border border-stone-300 text-stone-900 font-bold rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-900/20"
              >
                {availableClasses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

      </div>

      {/* ============================================================== */}
      {/* MODE 1: VISUAL CUSTOMIZER WITH SPLIT-SCREEN CONTROLS & PREVIEW */}
      {/* ============================================================== */}
      {studioMode === "customizer" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:hidden">
          
          {/* LEFT COLUMN: CUSTOMIZATION PANELS (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Customizer Tabs Navigation */}
            <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-1 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setCustomizerTab("palette")}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  customizerTab === "palette" ? "bg-blue-900 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Palette className="w-3.5 h-3.5" /> Palette &amp; Colors
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab("branding")}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  customizerTab === "branding" ? "bg-blue-900 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> School Branding
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab("fields")}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  customizerTab === "fields" ? "bg-blue-900 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> {persona === "STUDENT" ? "Student Vitals" : persona === "TEACHER" ? "Faculty Vitals" : "Child Front Details"}
              </button>
              {persona === "STUDENT" && (
                <button
                  type="button"
                  onClick={() => setCustomizerTab("barcode")}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                    customizerTab === "barcode" ? "bg-blue-900 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" /> Barcode / QR
                </button>
              )}
              <button
                type="button"
                onClick={() => setCustomizerTab("motto")}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  customizerTab === "motto" ? "bg-blue-900 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Type className="w-3.5 h-3.5" /> {persona === "STUDENT" ? "Sanskrit Motto" : "Motto & Core Values"}
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab("back")}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  customizerTab === "back" ? "bg-blue-900 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> {persona === "ESCORT" ? "Authorised Persons Roster" : "Back Face & Info"}
              </button>
            </div>

            {/* TAB CONTENT: 1. PALETTE & COLORS */}
            {customizerTab === "palette" && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-900" />
                    Color Palette Presets ({persona === "STUDENT" ? "Student Card" : persona === "TEACHER" ? "Teacher Card" : "Child Escort Card"})
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Select a curated institutional theme preset or configure custom hex color codes below.
                  </p>
                </div>

                {/* Preset Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ID_CARD_THEME_PRESETS.map((p) => {
                    const isSelected =
                      activePrimaryColor.toUpperCase() === p.primaryColor.toUpperCase() &&
                      activeAccentColor.toUpperCase() === p.accentColor.toUpperCase();
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-blue-900 bg-blue-50/60 shadow-xs ring-2 ring-blue-900/10"
                            : "border-stone-200 bg-white hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{p.icon}</span>
                          <div className="flex items-center gap-1">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: p.primaryColor }} />
                            <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: p.accentColor }} />
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-stone-900">{p.name}</p>
                          <p className="text-[10px] text-stone-500 font-medium line-clamp-1 mt-0.5">{p.subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Fine-Grained Hex Pickers */}
                <div className="pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-700 mb-3">
                    Custom Color Inputs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* Primary Color */}
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-stone-800 block">Primary Header / Footer</label>
                        <span className="text-[10px] text-stone-400">Deep background for curved banners</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activePrimaryColor}
                          onChange={(e) => {
                            if (persona === "STUDENT") updateStudentConfig({ primaryColor: e.target.value });
                            else if (persona === "TEACHER") updateTeacherConfig({ primaryColor: e.target.value });
                            else updateEscortConfig({ primaryColor: e.target.value });
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={activePrimaryColor}
                          onChange={(e) => {
                            if (persona === "STUDENT") updateStudentConfig({ primaryColor: e.target.value });
                            else if (persona === "TEACHER") updateTeacherConfig({ primaryColor: e.target.value });
                            else updateEscortConfig({ primaryColor: e.target.value });
                          }}
                          className="w-20 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold uppercase"
                        />
                      </div>
                    </div>

                    {/* Accent / Gold Color */}
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-stone-800 block">Accent / Gold Line</label>
                        <span className="text-[10px] text-stone-400">Curves, photo border, seals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeAccentColor}
                          onChange={(e) => {
                            if (persona === "STUDENT") updateStudentConfig({ accentColor: e.target.value });
                            else if (persona === "TEACHER") updateTeacherConfig({ accentColor: e.target.value });
                            else updateEscortConfig({ accentColor: e.target.value });
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={activeAccentColor}
                          onChange={(e) => {
                            if (persona === "STUDENT") updateStudentConfig({ accentColor: e.target.value });
                            else if (persona === "TEACHER") updateTeacherConfig({ accentColor: e.target.value });
                            else updateEscortConfig({ accentColor: e.target.value });
                          }}
                          className="w-20 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold uppercase"
                        />
                      </div>
                    </div>

                    {/* Gold Text Color */}
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-stone-800 block">Gold Text Color</label>
                        <span className="text-[10px] text-stone-400">Sanskrit motto &amp; pillars</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeGoldTextColor}
                          onChange={(e) => {
                            if (persona === "STUDENT") updateStudentConfig({ goldTextColor: e.target.value });
                            else if (persona === "TEACHER") updateTeacherConfig({ goldTextColor: e.target.value });
                            else updateEscortConfig({ goldTextColor: e.target.value });
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={activeGoldTextColor}
                          onChange={(e) => {
                            if (persona === "STUDENT") updateStudentConfig({ goldTextColor: e.target.value });
                            else if (persona === "TEACHER") updateTeacherConfig({ goldTextColor: e.target.value });
                            else updateEscortConfig({ goldTextColor: e.target.value });
                          }}
                          className="w-20 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold uppercase"
                        />
                      </div>
                    </div>

                    {/* Card Background Color */}
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-stone-800 block">Card Background</label>
                        <span className="text-[10px] text-stone-400">Default: #FFFFFF / #FAF9F6</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeCardBgColor}
                          onChange={(e) => {
                            if (persona === "STUDENT") updateStudentConfig({ cardBgColor: e.target.value });
                            else if (persona === "TEACHER") updateTeacherConfig({ cardBgColor: e.target.value });
                            else updateEscortConfig({ cardBgColor: e.target.value });
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={activeCardBgColor}
                          onChange={(e) => {
                            if (persona === "STUDENT") updateStudentConfig({ cardBgColor: e.target.value });
                            else if (persona === "TEACHER") updateTeacherConfig({ cardBgColor: e.target.value });
                            else updateEscortConfig({ cardBgColor: e.target.value });
                          }}
                          className="w-20 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold uppercase"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. SCHOOL BRANDING */}
            {customizerTab === "branding" && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-900" />
                    School Branding &amp; Header Elements ({persona === "STUDENT" ? "Student Card" : persona === "TEACHER" ? "Teacher Card" : "Child Escort Card"})
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Customize the school title, location, affiliation, seal, and national elements.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* School Name Override */}
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      School Name Override
                    </label>
                    <input
                      type="text"
                      value={(persona === "STUDENT" ? config.schoolName : persona === "TEACHER" ? teacherConfig.schoolName : escortConfig.schoolName) || ""}
                      placeholder={selectedInstitutionObj?.name || "CRAYON BOX SCHOOL"}
                      onChange={(e) => {
                        if (persona === "STUDENT") updateStudentConfig({ schoolName: e.target.value });
                        else if (persona === "TEACHER") updateTeacherConfig({ schoolName: e.target.value });
                        else updateEscortConfig({ schoolName: e.target.value });
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold uppercase"
                    />
                    <span className="text-[10px] text-stone-400">Leave blank to use the active school name from institution settings.</span>
                  </div>

                  {/* City / Location Override */}
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      City / Subtitle Override
                    </label>
                    <input
                      type="text"
                      value={(persona === "STUDENT" ? config.city : persona === "TEACHER" ? teacherConfig.city : escortConfig.city) || ""}
                      placeholder={selectedInstitutionObj?.city || "DELHI NCR"}
                      onChange={(e) => {
                        if (persona === "STUDENT") updateStudentConfig({ city: e.target.value });
                        else if (persona === "TEACHER") updateTeacherConfig({ city: e.target.value });
                        else updateEscortConfig({ city: e.target.value });
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold uppercase"
                    />
                  </div>

                  {/* Affiliation / Tagline (NOT CBSE by default!) */}
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Board Affiliation / Tagline (Optional)
                    </label>
                    <input
                      type="text"
                      value={(persona === "STUDENT" ? config.tagline : persona === "TEACHER" ? teacherConfig.tagline : escortConfig.tagline) || ""}
                      placeholder="Leave blank for clean header with no affiliation"
                      onChange={(e) => {
                        if (persona === "STUDENT") updateStudentConfig({ tagline: e.target.value });
                        else if (persona === "TEACHER") updateTeacherConfig({ tagline: e.target.value });
                        else updateEscortConfig({ tagline: e.target.value });
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                    />
                    <span className="text-[10px] text-stone-400">
                      Removed "Affiliated to CBSE" by default. If your school uses ICSE, State Board, IB, or a custom tagline, enter it here. Leave blank for no affiliation line.
                    </span>
                  </div>

                  {/* Toggles for Tricolor and Laurel Seal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <label className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-bold text-stone-800">Show Indian Tricolor Band</span>
                      <input
                        type="checkbox"
                        checked={persona === "STUDENT" ? config.showTricolor : persona === "TEACHER" ? teacherConfig.showTricolor : escortConfig.showTricolor}
                        onChange={(e) => {
                          if (persona === "STUDENT") updateStudentConfig({ showTricolor: e.target.checked });
                          else if (persona === "TEACHER") updateTeacherConfig({ showTricolor: e.target.checked });
                          else updateEscortConfig({ showTricolor: e.target.checked });
                        }}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                    </label>

                    <label className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-bold text-stone-800">Show Gold Laurel Seal</span>
                      <input
                        type="checkbox"
                        checked={persona === "STUDENT" ? config.showLaurelSeal : persona === "TEACHER" ? teacherConfig.showLaurelSeal : escortConfig.showLaurelSeal}
                        onChange={(e) => {
                          if (persona === "STUDENT") updateStudentConfig({ showLaurelSeal: e.target.checked });
                          else if (persona === "TEACHER") updateTeacherConfig({ showLaurelSeal: e.target.checked });
                          else updateEscortConfig({ showLaurelSeal: e.target.checked });
                        }}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                    </label>
                  </div>

                  {/* Pillars */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800">Show Institutional Pillars</span>
                      <input
                        type="checkbox"
                        checked={persona === "STUDENT" ? config.showPillars : persona === "TEACHER" ? teacherConfig.showPillars : escortConfig.showPillars}
                        onChange={(e) => {
                          if (persona === "STUDENT") updateStudentConfig({ showPillars: e.target.checked });
                          else if (persona === "TEACHER") updateTeacherConfig({ showPillars: e.target.checked });
                          else updateEscortConfig({ showPillars: e.target.checked });
                        }}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                    </div>
                    {(persona === "STUDENT" ? config.showPillars : persona === "TEACHER" ? teacherConfig.showPillars : escortConfig.showPillars) && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <input
                          type="text"
                          value={(persona === "STUDENT" ? config.frontPillars?.[0] : persona === "TEACHER" ? teacherConfig.frontPillars?.[0] : escortConfig.frontPillars?.[0]) || "LEARN"}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            if (persona === "STUDENT") updateStudentConfig({ frontPillars: [val, config.frontPillars[1], config.frontPillars[2]] });
                            else if (persona === "TEACHER") updateTeacherConfig({ frontPillars: [val, teacherConfig.frontPillars[1], teacherConfig.frontPillars[2]] });
                            else updateEscortConfig({ frontPillars: [val, escortConfig.frontPillars[1], escortConfig.frontPillars[2]] });
                          }}
                          className="px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center uppercase"
                        />
                        <input
                          type="text"
                          value={(persona === "STUDENT" ? config.frontPillars?.[1] : persona === "TEACHER" ? teacherConfig.frontPillars?.[1] : escortConfig.frontPillars?.[1]) || "CREATE"}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            if (persona === "STUDENT") updateStudentConfig({ frontPillars: [config.frontPillars[0], val, config.frontPillars[2]] });
                            else if (persona === "TEACHER") updateTeacherConfig({ frontPillars: [teacherConfig.frontPillars[0], val, teacherConfig.frontPillars[2]] });
                            else updateEscortConfig({ frontPillars: [escortConfig.frontPillars[0], val, escortConfig.frontPillars[2]] });
                          }}
                          className="px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center uppercase"
                        />
                        <input
                          type="text"
                          value={(persona === "STUDENT" ? config.frontPillars?.[2] : persona === "TEACHER" ? teacherConfig.frontPillars?.[2] : escortConfig.frontPillars?.[2]) || "BELONG"}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            if (persona === "STUDENT") updateStudentConfig({ frontPillars: [config.frontPillars[0], config.frontPillars[1], val] });
                            else if (persona === "TEACHER") updateTeacherConfig({ frontPillars: [teacherConfig.frontPillars[0], teacherConfig.frontPillars[1], val] });
                            else updateEscortConfig({ frontPillars: [escortConfig.frontPillars[0], escortConfig.frontPillars[1], val] });
                          }}
                          className="px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center uppercase"
                        />
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. FRONT FIELDS (STUDENT) */}
            {customizerTab === "fields" && persona === "STUDENT" && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-900" />
                    Student Identity Fields &amp; Labels
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Toggle which vitals appear next to the student photo and customize each label text.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.showClass}
                        onChange={(e) => updateStudentConfig({ showClass: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Class &amp; Section</span>
                    </div>
                    <input
                      type="text"
                      value={config.classLabel}
                      onChange={(e) => updateStudentConfig({ classLabel: e.target.value })}
                      placeholder="Class"
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.showAdmissionNo}
                        onChange={(e) => updateStudentConfig({ showAdmissionNo: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Admission No.</span>
                    </div>
                    <input
                      type="text"
                      value={config.admissionNoLabel}
                      onChange={(e) => updateStudentConfig({ admissionNoLabel: e.target.value })}
                      placeholder="Adm. No."
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.showDob}
                        onChange={(e) => updateStudentConfig({ showDob: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Date of Birth (DOB)</span>
                    </div>
                    <input
                      type="text"
                      value={config.dobLabel}
                      onChange={(e) => updateStudentConfig({ dobLabel: e.target.value })}
                      placeholder="DOB"
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.showBloodGroup}
                        onChange={(e) => updateStudentConfig({ showBloodGroup: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Blood Group</span>
                    </div>
                    <input
                      type="text"
                      value={config.bloodGroupLabel}
                      onChange={(e) => updateStudentConfig({ bloodGroupLabel: e.target.value })}
                      placeholder="Blood Group"
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.showRollNo}
                        onChange={(e) => updateStudentConfig({ showRollNo: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Roll Number</span>
                    </div>
                    <input
                      type="text"
                      value={config.rollNoLabel}
                      onChange={(e) => updateStudentConfig({ rollNoLabel: e.target.value })}
                      placeholder="Roll No."
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. FRONT FIELDS (TEACHER) */}
            {customizerTab === "fields" && persona === "TEACHER" && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    Teacher / Faculty Identity Fields &amp; Labels
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Customize the golden category badge, professional designation, department, employee ID, and DOJ.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={teacherConfig.showCategoryTag}
                        onChange={(e) => updateTeacherConfig({ showCategoryTag: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Top Gold Category Badge</span>
                    </div>
                    <input
                      type="text"
                      value={teacherConfig.categoryTag}
                      onChange={(e) => updateTeacherConfig({ categoryTag: e.target.value.toUpperCase() })}
                      placeholder="FACULTY"
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold uppercase"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={teacherConfig.showDesignation}
                        onChange={(e) => updateTeacherConfig({ showDesignation: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Designation</span>
                    </div>
                    <input
                      type="text"
                      value={teacherConfig.designationLabel}
                      onChange={(e) => updateTeacherConfig({ designationLabel: e.target.value })}
                      placeholder="Designation"
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={teacherConfig.showDepartment}
                        onChange={(e) => updateTeacherConfig({ showDepartment: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Department</span>
                    </div>
                    <input
                      type="text"
                      value={teacherConfig.departmentLabel}
                      onChange={(e) => updateTeacherConfig({ departmentLabel: e.target.value })}
                      placeholder="Department"
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={teacherConfig.showEmployeeId}
                        onChange={(e) => updateTeacherConfig({ showEmployeeId: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Employee ID</span>
                    </div>
                    <input
                      type="text"
                      value={teacherConfig.employeeIdLabel}
                      onChange={(e) => updateTeacherConfig({ employeeIdLabel: e.target.value })}
                      placeholder="Employee ID"
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={teacherConfig.showDoj}
                        onChange={(e) => updateTeacherConfig({ showDoj: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Date of Joining (DOJ)</span>
                    </div>
                    <input
                      type="text"
                      value={teacherConfig.dojLabel}
                      onChange={(e) => updateTeacherConfig({ dojLabel: e.target.value })}
                      placeholder="Date of Joining"
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. FRONT FIELDS (ESCORT) */}
            {customizerTab === "fields" && persona === "ESCORT" && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    Child Escort Front Titles &amp; Student Vitals
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Customize the card title, academic year badge, student vitals labels, and golden disclaimer text.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Card Title & Academic Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Header Card Title</label>
                      <input
                        type="text"
                        value={escortConfig.frontCardTitle}
                        onChange={(e) => updateEscortConfig({ frontCardTitle: e.target.value.toUpperCase() })}
                        placeholder="CHILD ESCORT CARD"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-black uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Academic Year</label>
                      <input
                        type="text"
                        value={escortConfig.academicYear}
                        onChange={(e) => updateEscortConfig({ academicYear: e.target.value })}
                        placeholder="2026 – 2027"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Student Vitals Labels */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-700 block">Student Identity Labels</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                        <span className="text-[10px] font-bold text-stone-600 block mb-1">Class Label</span>
                        <input
                          type="text"
                          value={escortConfig.classLabel}
                          onChange={(e) => updateEscortConfig({ classLabel: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                        <span className="text-[10px] font-bold text-stone-600 block mb-1">Admission No Label</span>
                        <input
                          type="text"
                          value={escortConfig.admissionNoLabel}
                          onChange={(e) => updateEscortConfig({ admissionNoLabel: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                        <span className="text-[10px] font-bold text-stone-600 block mb-1">DOB Label</span>
                        <input
                          type="text"
                          value={escortConfig.dobLabel}
                          onChange={(e) => updateEscortConfig({ dobLabel: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Golden Disclaimer Notice */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800">Show Golden Disclaimer Box</span>
                      <input
                        type="checkbox"
                        checked={escortConfig.showDisclaimer}
                        onChange={(e) => updateEscortConfig({ showDisclaimer: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                    </div>
                    {escortConfig.showDisclaimer && (
                      <textarea
                        rows={2}
                        value={escortConfig.disclaimerText}
                        onChange={(e) => updateEscortConfig({ disclaimerText: e.target.value })}
                        placeholder="This card authorises the people listed on the back to pick up the above child from school."
                        className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-800"
                      />
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. BARCODE / QR (STUDENT ONLY) */}
            {customizerTab === "barcode" && persona === "STUDENT" && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-blue-900" />
                    Barcode &amp; QR Turnstile Scanner
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Select the optical machine-readable attendance code type and customize the label.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "barcode", title: "Linear Barcode", desc: "Reference 1:1 format" },
                    { id: "qr", title: "QR Code Only", desc: "Compact 2D scanner" },
                    { id: "both", title: "Dual Barcode + QR", desc: "Maximum compatibility" },
                    { id: "none", title: "Hidden / None", desc: "No optical code" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => updateStudentConfig({ barcodeType: mode.id as any })}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                        config.barcodeType === mode.id
                          ? "border-blue-900 bg-blue-50/60 shadow-xs ring-2 ring-blue-900/10 font-bold"
                          : "border-stone-200 bg-white hover:border-stone-300"
                      }`}
                    >
                      <p className="text-xs font-black text-stone-900">{mode.title}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{mode.desc}</p>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Barcode / QR Section Label
                  </label>
                  <input
                    type="text"
                    value={config.barcodeLabel}
                    onChange={(e) => updateStudentConfig({ barcodeLabel: e.target.value.toUpperCase() })}
                    placeholder="STUDENT BARCODE"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold uppercase tracking-wider"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: 5. SANSKRIT MOTTO & CORE VALUES */}
            {customizerTab === "motto" && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Type className="w-4 h-4 text-blue-900" />
                    Sanskrit Motto &amp; Footer Core Values ({persona === "STUDENT" ? "Student Card" : persona === "TEACHER" ? "Teacher Card" : "Child Escort Card"})
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Customize the inspirational school motto and core institutional values rendered in the card.
                  </p>
                </div>

                <label className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-stone-800">Display Sanskrit Motto</span>
                  <input
                    type="checkbox"
                    checked={persona === "STUDENT" ? config.showMotto : persona === "TEACHER" ? teacherConfig.showMotto : escortConfig.showMotto}
                    onChange={(e) => {
                      if (persona === "STUDENT") updateStudentConfig({ showMotto: e.target.checked });
                      else if (persona === "TEACHER") updateTeacherConfig({ showMotto: e.target.checked });
                      else updateEscortConfig({ showMotto: e.target.checked });
                    }}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                </label>

                {(persona === "STUDENT" ? config.showMotto : persona === "TEACHER" ? teacherConfig.showMotto : escortConfig.showMotto) && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Sanskrit Motto (Devanagari)
                      </label>
                      <input
                        type="text"
                        value={persona === "STUDENT" ? config.sanskritMotto : persona === "TEACHER" ? teacherConfig.sanskritMotto : escortConfig.sanskritMotto}
                        onChange={(e) => {
                          if (persona === "STUDENT") updateStudentConfig({ sanskritMotto: e.target.value });
                          else if (persona === "TEACHER") updateTeacherConfig({ sanskritMotto: e.target.value });
                          else updateEscortConfig({ sanskritMotto: e.target.value });
                        }}
                        placeholder="विद्या ददाति विनयम्"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold font-serif"
                      />
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        {["विद्या ददाति विनयम्", "सत्यमेव जयते", "तमसो मा ज्योतिर्गमय", "सा विद्या या विमुक्तये"].map((phrase) => (
                          <button
                            key={phrase}
                            type="button"
                            onClick={() => {
                              if (persona === "STUDENT") updateStudentConfig({ sanskritMotto: phrase });
                              else if (persona === "TEACHER") updateTeacherConfig({ sanskritMotto: phrase });
                              else updateEscortConfig({ sanskritMotto: phrase });
                            }}
                            className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-[10.5px] cursor-pointer"
                          >
                            {phrase}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        English Translation Subtitle
                      </label>
                      <input
                        type="text"
                        value={persona === "STUDENT" ? config.englishSubtitle : persona === "TEACHER" ? teacherConfig.englishSubtitle : escortConfig.englishSubtitle}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          if (persona === "STUDENT") updateStudentConfig({ englishSubtitle: val });
                          else if (persona === "TEACHER") updateTeacherConfig({ englishSubtitle: val });
                          else updateEscortConfig({ englishSubtitle: val });
                        }}
                        placeholder="KNOWLEDGE LEADS TO HUMILITY"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold uppercase tracking-wider"
                      />
                    </div>
                  </div>
                )}

                {/* Footer Core Values (Teacher & Escort) */}
                {(persona === "TEACHER" || persona === "ESCORT") && (
                  <div className="pt-4 border-t border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">Footer Institutional Values</span>
                        <span className="text-[10px] text-stone-400">Reference: SAFE | KIND | CURIOUS | CONFIDENT</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={persona === "TEACHER" ? teacherConfig.showCoreValues : escortConfig.showCoreValues}
                        onChange={(e) => {
                          if (persona === "TEACHER") updateTeacherConfig({ showCoreValues: e.target.checked });
                          else updateEscortConfig({ showCoreValues: e.target.checked });
                        }}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                    </div>

                    {(persona === "TEACHER" ? teacherConfig.showCoreValues : escortConfig.showCoreValues) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(persona === "TEACHER" ? teacherConfig.coreValues : escortConfig.coreValues).map((val, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={val}
                            onChange={(e) => {
                              const arr = persona === "TEACHER" ? [...teacherConfig.coreValues] : [...escortConfig.coreValues];
                              arr[idx] = e.target.value.toUpperCase();
                              if (persona === "TEACHER") updateTeacherConfig({ coreValues: arr as any });
                              else updateEscortConfig({ coreValues: arr as any });
                            }}
                            className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-center uppercase"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* TAB CONTENT: 6. BACK FACE GUIDELINES & CONTACT */}
            {customizerTab === "back" && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-900" />
                    {persona === "ESCORT" ? "Authorised Persons Roster & Contacts" : "Back Face Guidelines & Institutional Info"}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {persona === "ESCORT"
                      ? "Customize the 3-column roster labels (Name, Relation, Phone No, ID Proof, ID No) and school contact strip."
                      : "Customize back-side header, numbered guidelines, emergency contacts, website, and footer pillars."}
                  </p>
                </div>

                {persona === "ESCORT" ? (
                  <div className="space-y-4">
                    {/* Back Header & Subtitle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">Back Header Title</label>
                        <input
                          type="text"
                          value={escortConfig.backCardTitle}
                          onChange={(e) => updateEscortConfig({ backCardTitle: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">Subtitle Instruction</label>
                        <input
                          type="text"
                          value={escortConfig.backSubtitle}
                          onChange={(e) => updateEscortConfig({ backSubtitle: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium uppercase"
                        />
                      </div>
                    </div>

                    {/* Escort Field Labels (Name, Relation, Phone, ID Proof, ID No) */}
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <span className="text-xs font-black uppercase tracking-wider text-stone-700 block">
                        Authorized Person Key-Value Labels
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">Name Label</label>
                          <input
                            type="text"
                            value={escortConfig.nameLabel}
                            onChange={(e) => updateEscortConfig({ nameLabel: e.target.value })}
                            className="w-full px-2 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">Relation Label</label>
                          <input
                            type="text"
                            value={escortConfig.relationLabel}
                            onChange={(e) => updateEscortConfig({ relationLabel: e.target.value })}
                            className="w-full px-2 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">Phone Label</label>
                          <input
                            type="text"
                            value={escortConfig.phoneLabel}
                            onChange={(e) => updateEscortConfig({ phoneLabel: e.target.value })}
                            className="w-full px-2 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">ID Proof Label</label>
                          <input
                            type="text"
                            value={escortConfig.idProofLabel}
                            onChange={(e) => updateEscortConfig({ idProofLabel: e.target.value })}
                            className="w-full px-2 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">ID No Label</label>
                          <input
                            type="text"
                            value={escortConfig.idNoLabel}
                            onChange={(e) => updateEscortConfig({ idNoLabel: e.target.value })}
                            className="w-full px-2 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Contact Details (Address, Phone, Website) */}
                    <div className="pt-2 border-t border-stone-100 space-y-3">
                      <span className="text-xs font-black uppercase tracking-wider text-stone-700 block">
                        Back Bottom Institutional Contact Strip
                      </span>
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">School Physical Address</label>
                        <input
                          type="text"
                          value={escortConfig.schoolAddress}
                          onChange={(e) => updateEscortConfig({ schoolAddress: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-stone-700 block mb-1">School Phone</label>
                          <input
                            type="text"
                            value={escortConfig.schoolPhone}
                            onChange={(e) => updateEscortConfig({ schoolPhone: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-stone-700 block mb-1">School Website</label>
                          <input
                            type="text"
                            value={escortConfig.schoolWebsite}
                            onChange={(e) => updateEscortConfig({ schoolWebsite: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Student / Teacher Back Form */
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Back Header Title</label>
                      <input
                        type="text"
                        value={persona === "STUDENT" ? config.backHeaderTitle : teacherConfig.backHeaderTitle}
                        onChange={(e) => persona === "STUDENT" ? updateStudentConfig({ backHeaderTitle: e.target.value.toUpperCase() }) : updateTeacherConfig({ backHeaderTitle: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Guidelines Box Title</label>
                      <input
                        type="text"
                        value={persona === "STUDENT" ? config.guidelinesTitle : teacherConfig.guidelinesTitle}
                        onChange={(e) => persona === "STUDENT" ? updateStudentConfig({ guidelinesTitle: e.target.value.toUpperCase() }) : updateTeacherConfig({ guidelinesTitle: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold uppercase"
                      />
                    </div>

                    {/* 4 Numbered Guidelines */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block">4 Numbered Guidelines</label>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shrink-0">01</span>
                        <input
                          type="text"
                          value={persona === "STUDENT" ? config.guideline1 : teacherConfig.guideline1}
                          onChange={(e) => persona === "STUDENT" ? updateStudentConfig({ guideline1: e.target.value }) : updateTeacherConfig({ guideline1: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shrink-0">02</span>
                        <input
                          type="text"
                          value={persona === "STUDENT" ? config.guideline2 : teacherConfig.guideline2}
                          onChange={(e) => persona === "STUDENT" ? updateStudentConfig({ guideline2: e.target.value }) : updateTeacherConfig({ guideline2: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shrink-0">03</span>
                        <input
                          type="text"
                          value={persona === "STUDENT" ? config.guideline3 : teacherConfig.guideline3}
                          onChange={(e) => persona === "STUDENT" ? updateStudentConfig({ guideline3: e.target.value }) : updateTeacherConfig({ guideline3: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shrink-0">04</span>
                        <input
                          type="text"
                          value={persona === "STUDENT" ? config.guideline4 : teacherConfig.guideline4}
                          onChange={(e) => persona === "STUDENT" ? updateStudentConfig({ guideline4: e.target.value }) : updateTeacherConfig({ guideline4: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">Contact Phone Override</label>
                        <input
                          type="text"
                          value={(persona === "STUDENT" ? config.customPhone : teacherConfig.customPhone) || ""}
                          placeholder="+91 11 2761 8899"
                          onChange={(e) => persona === "STUDENT" ? updateStudentConfig({ customPhone: e.target.value }) : updateTeacherConfig({ customPhone: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">Website URL Override</label>
                        <input
                          type="text"
                          value={(persona === "STUDENT" ? config.customWebsite : teacherConfig.customWebsite) || ""}
                          placeholder="www.crayonboxschool.edu.in"
                          onChange={(e) => persona === "STUDENT" ? updateStudentConfig({ customWebsite: e.target.value }) : updateTeacherConfig({ customWebsite: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* RIGHT COLUMN: STICKY INTERACTIVE LIVE PREVIEW (5 Columns) */}
          <div className="lg:col-span-5 sticky top-6 space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-md">
              
              {/* Preview Bar with Controls */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Live {persona === "STUDENT" ? "Student" : persona === "TEACHER" ? "Teacher" : "Child Escort"} Preview
                  </span>
                </div>
                
                {/* Face Toggle */}
                <div className="p-0.5 bg-stone-100 rounded-xl flex items-center text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewFace("front")}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      previewFace === "front" ? "bg-white text-blue-900 shadow-xs font-black" : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFace("back")}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      previewFace === "back" ? "bg-white text-blue-900 shadow-xs font-black" : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFace("dual")}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      previewFace === "dual" ? "bg-white text-blue-900 shadow-xs font-black" : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    Dual
                  </button>
                </div>
              </div>

              {/* Centered Render of Selected ID Card */}
              <div className="flex flex-col items-center justify-center p-2 bg-stone-100/70 rounded-2xl border border-dashed border-stone-300 min-h-[580px] overflow-hidden">
                {persona === "STUDENT" && (
                  <StudentIDCard
                    student={previewStudent}
                    schoolInfo={selectedInstitutionObj}
                    config={config}
                    layoutMode={previewFace === "dual" ? "DUAL" : previewFace === "back" ? "BACK_ONLY" : "FRONT_ONLY"}
                  />
                )}
                {persona === "TEACHER" && (
                  <TeacherIDCard
                    faculty={previewFaculty}
                    schoolInfo={selectedInstitutionObj}
                    config={teacherConfig}
                    layoutMode={previewFace === "dual" ? "DUAL" : previewFace === "back" ? "BACK_ONLY" : "FRONT_ONLY"}
                  />
                )}
                {persona === "ESCORT" && (
                  <EscortPickupCard
                    student={previewStudent}
                    escorts={previewEscorts}
                    schoolInfo={selectedInstitutionObj}
                    config={escortConfig}
                    layoutMode={previewFace === "dual" ? "DUAL" : previewFace === "back" ? "BACK_ONLY" : "FRONT_ONLY"}
                  />
                )}
              </div>

              {/* Bottom Card Specifications */}
              <div className="mt-3 text-center">
                <p className="text-[11px] font-bold text-stone-500">
                  {persona === "ESCORT" ? "CR80 Landscape (85.60 × 53.98 mm) • PVC Card Standard" : "ISO/IEC 7810 ID-1 Standard (85.60 × 53.98 mm) • CR80 PVC"}
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save {persona === "STUDENT" ? "Student" : persona === "TEACHER" ? "Teacher" : "Escort"} Template for {selectedInstitutionObj?.shortName || instCode}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* ============================================================== */
        /* MODE 2: BATCH PRINT SHEET                                      */
        /* ============================================================== */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 print:hidden">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-500">Card Face:</span>
              <div className="p-1 bg-stone-100 rounded-xl flex items-center gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewFace("front")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    previewFace === "front" ? "bg-white text-blue-900 shadow-xs font-black" : "text-stone-500"
                  }`}
                >
                  Front Face
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFace("back")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    previewFace === "back" ? "bg-white text-blue-900 shadow-xs font-black" : "text-stone-500"
                  }`}
                >
                  Back Face
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Sheet (A4)
            </button>
          </div>

          {/* Batch Cards Grid */}
          <div className={`grid ${persona === "ESCORT" ? "grid-cols-1 md:grid-cols-2 gap-8" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"} print:grid-cols-2 print:gap-4 print:p-0 justify-items-center`}>
            {persona === "STUDENT" && cards.map((card) => {
              const studentObj = {
                first_name: card.studentName?.split(" ")[0] || "Student",
                last_name: card.studentName?.split(" ").slice(1).join(" ") || "",
                class_name: card.className,
                section_name: card.sectionName,
                admission_number: card.admissionNo,
                universal_id: card.admissionNo,
                blood_group: card.bloodGroup,
                emergency_contact: card.emergencyPhone,
                father_name: card.fatherName,
                mother_name: "Mother",
                address: "Burari, Delhi - 110084",
                bus_route_no: card.busRoute,
                valid_upto: card.validUpto,
                school_code: instCode,
              };

              return (
                <div
                  key={card.id}
                  className="print:break-inside-avoid flex justify-center w-full"
                >
                  <StudentIDCard
                    student={studentObj}
                    schoolInfo={selectedInstitutionObj}
                    config={config}
                    isBack={previewFace === "back"}
                  />
                </div>
              );
            })}

            {persona === "TEACHER" && sampleFacultyList.map((fac) => (
              <div
                key={fac.id}
                className="print:break-inside-avoid flex justify-center w-full"
              >
                <TeacherIDCard
                  faculty={fac}
                  schoolInfo={selectedInstitutionObj}
                  config={teacherConfig}
                  isBack={previewFace === "back"}
                />
              </div>
            ))}

            {persona === "ESCORT" && cards.map((card) => {
              const studentObj = {
                first_name: card.studentName?.split(" ")[0] || "Student",
                last_name: card.studentName?.split(" ").slice(1).join(" ") || "",
                name: card.studentName || "Student",
                class_name: card.className,
                admission_number: card.admissionNo,
                dob: "15 May 2015",
              };

              return (
                <div
                  key={card.id}
                  className="print:break-inside-avoid flex justify-center w-full"
                >
                  <EscortPickupCard
                    student={studentObj}
                    escorts={previewEscorts}
                    schoolInfo={selectedInstitutionObj}
                    config={escortConfig}
                    isBack={previewFace === "back"}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
