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
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  HelpCircle,
  Undo2,
  ArrowRight
} from "lucide-react";
import {
  getBatchIdCardDataAction,
  StudentIdCardBadge
} from "@/app/actions/id-card-studio-actions";
import { StudentSuiteTabs } from "@/components/students/StudentSuiteTabs";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { StudentIDCard } from "@/components/id-cards/StudentIDCard";
import { TeacherIDCard } from "@/components/id-cards/TeacherIDCard";
import {
  IdCardCustomConfig,
  DEFAULT_ID_CARD_CONFIG,
  ID_CARD_THEME_PRESETS,
  getIdCardConfig,
  saveIdCardConfig,
  resetIdCardConfig
} from "@/lib/id-card-config";

export default function VisualIDCardStudioPage() {
  const { selectedInstitutionObj, currentInstitution } = useInstitution();
  const instCode = selectedInstitutionObj?.code || currentInstitution || "DEFAULT";
  const instName = selectedInstitutionObj?.name || "Crayon Box School";

  // Studio Mode: 'customizer' (Design Studio & Live Preview) vs 'batch-print' (8-Up Print Sheet)
  const [studioMode, setStudioMode] = useState<"customizer" | "batch-print">("customizer");
  
  // Customizer Tabs: 'palette' | 'branding' | 'fields' | 'barcode' | 'motto' | 'back'
  const [customizerTab, setCustomizerTab] = useState<"palette" | "branding" | "fields" | "barcode" | "motto" | "back">("palette");

  // Live Customizable Configuration for the active school
  const [config, setConfig] = useState<IdCardCustomConfig>(() => getIdCardConfig(instCode));
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Preview options
  const [previewFace, setPreviewFace] = useState<"front" | "back" | "dual">("dual");
  const [selectedClass, setSelectedClass] = useState("Class 5");
  const [cards, setCards] = useState<StudentIdCardBadge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState<"STUDENT" | "TEACHER">("STUDENT");

  const availableClasses = [
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
  ];

  // Re-load config whenever school switch occurs
  useEffect(() => {
    setConfig(getIdCardConfig(instCode));
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

  // Handle updates to individual config properties
  const updateConfig = (patch: Partial<IdCardCustomConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  // Save changes to localStorage & emit event
  const handleSave = () => {
    const success = saveIdCardConfig(instCode, config);
    if (success) {
      setSaveStatus("Saved template successfully for " + (selectedInstitutionObj?.shortName || instCode) + "!");
      setTimeout(() => setSaveStatus(null), 3500);
    }
  };

  // Reset to reference image defaults
  const handleReset = () => {
    if (window.confirm("Reset all customizations for this school back to reference defaults?")) {
      resetIdCardConfig(instCode);
      setConfig({ ...DEFAULT_ID_CARD_CONFIG });
      setSaveStatus("Reset back to default reference design.");
      setTimeout(() => setSaveStatus(null), 3500);
    }
  };

  // Apply a preset theme
  const handleApplyPreset = (preset: typeof ID_CARD_THEME_PRESETS[number]) => {
    updateConfig({
      primaryColor: preset.primaryColor,
      accentColor: preset.accentColor,
      goldTextColor: preset.goldTextColor,
      cardBgColor: preset.cardBgColor,
    });
  };

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
            School Customizer &bull; CR80 PVC Standard (54 &times; 85.6 mm)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-amber-400" />
            Student ID Card Visual Studio
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl">
            Visually customize colors, branding, vital fields, barcodes, mottos, and back-side guidelines. All customizations persist per school.
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
            <Save className="w-3.5 h-3.5" /> Save Template for {selectedInstitutionObj?.shortName || instCode}
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

      {/* Studio Mode Selector & Sub-bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500">Studio View:</span>
          <div className="p-1 bg-stone-100 rounded-2xl flex items-center gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStudioMode("customizer")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                studioMode === "customizer" ? "bg-white text-blue-900 shadow-xs font-black" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Visual Customizer &bull; Live Studio
            </button>
            <button
              type="button"
              onClick={() => setStudioMode("batch-print")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                studioMode === "batch-print" ? "bg-white text-blue-900 shadow-xs font-black" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Printer className="w-3.5 h-3.5" /> 8-Up Batch Print Sheet ({cards.length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-500">Sample Class:</span>
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
                <Sliders className="w-3.5 h-3.5" /> Front Fields
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab("barcode")}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  customizerTab === "barcode" ? "bg-blue-900 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> Barcode / QR
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab("motto")}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  customizerTab === "motto" ? "bg-blue-900 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Type className="w-3.5 h-3.5" /> Sanskrit Motto
              </button>
              <button
                type="button"
                onClick={() => setCustomizerTab("back")}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  customizerTab === "back" ? "bg-blue-900 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Back Guidelines
              </button>
            </div>

            {/* TAB CONTENT: 1. PALETTE & COLORS */}
            {customizerTab === "palette" && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-900" />
                    Color Palette Presets
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Click any curated theme preset to quickly transform the ID card colors, or fine-tune individual colors below.
                  </p>
                </div>

                {/* Preset Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ID_CARD_THEME_PRESETS.map((p) => {
                    const isSelected =
                      config.primaryColor.toUpperCase() === p.primaryColor.toUpperCase() &&
                      config.accentColor.toUpperCase() === p.accentColor.toUpperCase();
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
                          value={config.primaryColor}
                          onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={config.primaryColor}
                          onChange={(e) => updateConfig({ primaryColor: e.target.value })}
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
                          value={config.accentColor}
                          onChange={(e) => updateConfig({ accentColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={config.accentColor}
                          onChange={(e) => updateConfig({ accentColor: e.target.value })}
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
                          value={config.goldTextColor}
                          onChange={(e) => updateConfig({ goldTextColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={config.goldTextColor}
                          onChange={(e) => updateConfig({ goldTextColor: e.target.value })}
                          className="w-20 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold uppercase"
                        />
                      </div>
                    </div>

                    {/* Card Background Color */}
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-stone-800 block">Card Background</label>
                        <span className="text-[10px] text-stone-400">Default: #FAF9F6 / #FFFFFF</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.cardBgColor}
                          onChange={(e) => updateConfig({ cardBgColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={config.cardBgColor}
                          onChange={(e) => updateConfig({ cardBgColor: e.target.value })}
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
                    School Branding &amp; Header Elements
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
                      value={config.schoolName || ""}
                      placeholder={selectedInstitutionObj?.name || "CRAYON BOX SCHOOL"}
                      onChange={(e) => updateConfig({ schoolName: e.target.value })}
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
                      value={config.city || ""}
                      placeholder={selectedInstitutionObj?.city || "DELHI NCR"}
                      onChange={(e) => updateConfig({ city: e.target.value })}
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
                      value={config.tagline || ""}
                      placeholder="Leave blank for clean header with no affiliation"
                      onChange={(e) => updateConfig({ tagline: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                    />
                    <span className="text-[10px] text-stone-400">
                      Removed "Affiliated to CBSE" by default. If your school uses ICSE, State Board, IB, or custom tagline, enter it here. Leave blank for no affiliation line.
                    </span>
                  </div>

                  {/* Toggles for Tricolor and Laurel Seal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <label className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-bold text-stone-800">Show Indian Tricolor Band</span>
                      <input
                        type="checkbox"
                        checked={config.showTricolor}
                        onChange={(e) => updateConfig({ showTricolor: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                    </label>

                    <label className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-bold text-stone-800">Show Gold Laurel Seal</span>
                      <input
                        type="checkbox"
                        checked={config.showLaurelSeal}
                        onChange={(e) => updateConfig({ showLaurelSeal: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                    </label>
                  </div>

                  {/* Pillars */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800">Show Header Institutional Pillars</span>
                      <input
                        type="checkbox"
                        checked={config.showPillars}
                        onChange={(e) => updateConfig({ showPillars: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                    </div>
                    {config.showPillars && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <input
                          type="text"
                          value={config.frontPillars?.[0] || "LEARN"}
                          onChange={(e) => updateConfig({ frontPillars: [e.target.value.toUpperCase(), config.frontPillars[1], config.frontPillars[2]] })}
                          className="px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center uppercase"
                        />
                        <input
                          type="text"
                          value={config.frontPillars?.[1] || "CREATE"}
                          onChange={(e) => updateConfig({ frontPillars: [config.frontPillars[0], e.target.value.toUpperCase(), config.frontPillars[2]] })}
                          className="px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center uppercase"
                        />
                        <input
                          type="text"
                          value={config.frontPillars?.[2] || "BELONG"}
                          onChange={(e) => updateConfig({ frontPillars: [config.frontPillars[0], config.frontPillars[1], e.target.value.toUpperCase()] })}
                          className="px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center uppercase"
                        />
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. FRONT FIELDS */}
            {customizerTab === "fields" && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-900" />
                    Front Identity Fields &amp; Labels
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Toggle which vitals appear next to the student photo and customize each label text.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {/* Class Field */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.showClass}
                        onChange={(e) => updateConfig({ showClass: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Class &amp; Section</span>
                    </div>
                    <input
                      type="text"
                      value={config.classLabel}
                      onChange={(e) => updateConfig({ classLabel: e.target.value })}
                      placeholder="Class"
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  {/* Admission No Field */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.showAdmissionNo}
                        onChange={(e) => updateConfig({ showAdmissionNo: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Admission No.</span>
                    </div>
                    <input
                      type="text"
                      value={config.admissionNoLabel}
                      onChange={(e) => updateConfig({ admissionNoLabel: e.target.value })}
                      placeholder="Adm. No."
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  {/* DOB Field */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.showDob}
                        onChange={(e) => updateConfig({ showDob: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Date of Birth (DOB)</span>
                    </div>
                    <input
                      type="text"
                      value={config.dobLabel}
                      onChange={(e) => updateConfig({ dobLabel: e.target.value })}
                      placeholder="DOB"
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  {/* Blood Group Field */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.showBloodGroup}
                        onChange={(e) => updateConfig({ showBloodGroup: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Blood Group</span>
                    </div>
                    <input
                      type="text"
                      value={config.bloodGroupLabel}
                      onChange={(e) => updateConfig({ bloodGroupLabel: e.target.value })}
                      placeholder="Blood Group"
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  {/* Roll No Field */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.showRollNo}
                        onChange={(e) => updateConfig({ showRollNo: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="text-xs font-bold text-stone-800">Roll Number</span>
                    </div>
                    <input
                      type="text"
                      value={config.rollNoLabel}
                      onChange={(e) => updateConfig({ rollNoLabel: e.target.value })}
                      placeholder="Roll No."
                      className="w-32 px-2.5 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. BARCODE / QR */}
            {customizerTab === "barcode" && (
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
                      onClick={() => updateConfig({ barcodeType: mode.id as any })}
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
                    onChange={(e) => updateConfig({ barcodeLabel: e.target.value.toUpperCase() })}
                    placeholder="STUDENT BARCODE"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold uppercase tracking-wider"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: 5. SANSKRIT MOTTO */}
            {customizerTab === "motto" && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Type className="w-4 h-4 text-blue-900" />
                    Sanskrit Motto &amp; Bottom Footer
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Customize the inspirational school motto rendered in the curved footer band.
                  </p>
                </div>

                <label className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-stone-800">Display Motto in Footer</span>
                  <input
                    type="checkbox"
                    checked={config.showMotto}
                    onChange={(e) => updateConfig({ showMotto: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                </label>

                {config.showMotto && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Sanskrit Motto (Devanagari)
                      </label>
                      <input
                        type="text"
                        value={config.sanskritMotto}
                        onChange={(e) => updateConfig({ sanskritMotto: e.target.value })}
                        placeholder="विद्या ददाति विनयम्"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold font-serif"
                      />
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        {["विद्या ददाति विनयम्", "सत्यमेव जयते", "तमसो मा ज्योतिर्गमय", "सा विद्या या विमुक्तये"].map((phrase) => (
                          <button
                            key={phrase}
                            type="button"
                            onClick={() => updateConfig({ sanskritMotto: phrase })}
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
                        value={config.englishSubtitle}
                        onChange={(e) => updateConfig({ englishSubtitle: e.target.value.toUpperCase() })}
                        placeholder="KNOWLEDGE LEADS TO HUMILITY"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold uppercase tracking-wider"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 6. BACK GUIDELINES */}
            {customizerTab === "back" && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-900" />
                    Back Face Guidelines &amp; Contact Info
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Customize the four regulatory instructions, header, emergency contact, and website.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Back Header Title</label>
                    <input
                      type="text"
                      value={config.backHeaderTitle}
                      onChange={(e) => updateConfig({ backHeaderTitle: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Guidelines Box Title</label>
                    <input
                      type="text"
                      value={config.guidelinesTitle}
                      onChange={(e) => updateConfig({ guidelinesTitle: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 block">4 Numbered Guidelines</label>
                    
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shrink-0">01</span>
                      <input
                        type="text"
                        value={config.guideline1}
                        onChange={(e) => updateConfig({ guideline1: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shrink-0">02</span>
                      <input
                        type="text"
                        value={config.guideline2}
                        onChange={(e) => updateConfig({ guideline2: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shrink-0">03</span>
                      <input
                        type="text"
                        value={config.guideline3}
                        onChange={(e) => updateConfig({ guideline3: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shrink-0">04</span>
                      <input
                        type="text"
                        value={config.guideline4}
                        onChange={(e) => updateConfig({ guideline4: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={config.customPhone || ""}
                        placeholder="+91 11 2761 8899"
                        onChange={(e) => updateConfig({ customPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Website URL</label>
                      <input
                        type="text"
                        value={config.customWebsite || ""}
                        placeholder="www.crayonboxschool.edu.in"
                        onChange={(e) => updateConfig({ customWebsite: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                </div>
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
                    Live ID Card Preview
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

              {/* Centered Render of StudentIDCard with Config */}
              <div className="flex flex-col items-center justify-center p-2 bg-stone-100/70 rounded-2xl border border-dashed border-stone-300 min-h-[580px] overflow-hidden">
                <StudentIDCard
                  student={previewStudent}
                  schoolInfo={selectedInstitutionObj}
                  config={config}
                  layoutMode={previewFace === "dual" ? "DUAL" : previewFace === "back" ? "BACK_ONLY" : "FRONT_ONLY"}
                />
              </div>

              {/* Bottom Card Specifications */}
              <div className="mt-3 text-center">
                <p className="text-[11px] font-bold text-stone-500">
                  ISO/IEC 7810 ID-1 Standard (85.60 &times; 53.98 mm) &bull; CR80 PVC
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes for {selectedInstitutionObj?.shortName || instCode}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* ============================================================== */
        /* MODE 2: BATCH 8-UP PRINT SHEET FOR THE ENTIRE CLASS             */
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
              <Printer className="w-3.5 h-3.5" /> Print 8-Up A4 Sheet
            </button>
          </div>

          {/* 8-Up ID Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4 print:p-0 justify-items-center">
            {cards.map((card) => {
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
          </div>
        </div>
      )}

    </div>
  );
}

