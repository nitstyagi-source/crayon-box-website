"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Printer,
  QrCode,
  Sparkles,
  Download,
  Users,
  Building2,
  Phone,
  Bus,
  Droplet,
  CheckCircle2,
  RefreshCw,
  Eye,
  Layers,
  GraduationCap
} from "lucide-react";
import {
  getBatchIdCardDataAction,
  StudentIdCardBadge
} from "@/app/actions/id-card-studio-actions";
import { StudentSuiteTabs } from "@/components/students/StudentSuiteTabs";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { StudentIDCard, IdCardThemeId } from "@/components/id-cards/StudentIDCard";
import { TeacherIDCard } from "@/components/id-cards/TeacherIDCard";

export default function BatchIDCardStudioPage() {
  const { selectedInstitutionObj } = useInstitution();
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [cards, setCards] = useState<StudentIdCardBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<IdCardThemeId>("rashtriya");
  const [cardFace, setCardFace] = useState<"FRONT" | "BACK">("FRONT");
  const [persona, setPersona] = useState<"STUDENT" | "TEACHER">("STUDENT");

  const availableClasses = [
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
  ];

  const themes: { id: IdCardThemeId; name: string; tag: string; icon: string; border: string }[] = [
    { id: "rashtriya", name: "Rashtriya Tiranga", tag: "Patriotic Tricolor & APAAR", icon: "🇮🇳", border: "from-amber-500 via-white to-emerald-600" },
    { id: "digital-bharat", name: "Digital Bharat", tag: "Cyber Smart RFID / DigiLocker", icon: "⚡", border: "from-blue-600 to-indigo-800" },
    { id: "gurukul", name: "Gurukul Heritage", tag: "Vedic Sattva & Nalanda Gold", icon: "🏛️", border: "from-amber-700 to-red-900" },
    { id: "neo-swiss", name: "Neo-Swiss Clean", tag: "Minimalist Typographic Grid", icon: "📐", border: "from-slate-400 to-slate-800" },
    { id: "landscape", name: "Rajbhasha CR80", tag: "Horizontal Executive Format", icon: "🪪", border: "from-orange-600 to-emerald-800" }
  ];

  useEffect(() => {
    loadCards();
  }, [selectedClass]);

  async function loadCards() {
    setIsLoading(true);
    try {
      const res = await getBatchIdCardDataAction(selectedClass);
      if (res.success) {
        setCards(res.cards);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl print:hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Standard CR80 PVC Cards &amp; 8-Up A4 Print Sheet
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-400" />
            Student &amp; Staff PVC ID Card Studio
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl">
            Multi-theme PVC card studio with authentic Indian Tricolor, APAAR EduLocker compliance, DigiLocker verification, and high-speed QR turnstile attendance.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {persona === "STUDENT" && (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-blue-900 border border-blue-700 text-white font-bold rounded-xl px-3 py-2 text-xs focus:bg-blue-800"
            >
              {availableClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white text-stone-900 hover:bg-stone-100 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print 8-Up Sheet
          </button>
        </div>
      </div>

      {/* Theme & Persona Customization Studio Controls */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Persona Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">Persona:</span>
            <div className="p-1 bg-stone-100 rounded-2xl flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPersona("STUDENT")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  persona === "STUDENT" ? "bg-white text-blue-900 shadow-xs font-black" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Students ({cards.length})
              </button>
              <button
                type="button"
                onClick={() => setPersona("TEACHER")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  persona === "TEACHER" ? "bg-white text-emerald-900 shadow-xs font-black" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Faculty &amp; Staff
              </button>
            </div>
          </div>

          {/* Card Face Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">Card Face:</span>
            <div className="p-1 bg-stone-100 rounded-2xl flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCardFace("FRONT")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  cardFace === "FRONT" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                🎴 Front Face
              </button>
              <button
                type="button"
                onClick={() => setCardFace("BACK")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  cardFace === "BACK" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                📄 Back Face (Regulatory)
              </button>
            </div>
          </div>

        </div>

        {/* 5 Distinct Design Themes Selector */}
        <div className="pt-3 border-t border-stone-100">
          <label className="text-[11px] font-black uppercase tracking-wider text-stone-500 block mb-2.5">
            Select Visual Architectural Theme (Includes Indian Tricolor &amp; NEP 2020 Compliance)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {themes.map((t) => {
              const isSelected = selectedTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTheme(t.id)}
                  className={`p-3 rounded-2xl border-2 text-left transition relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "border-blue-900 bg-blue-50/50 shadow-sm ring-2 ring-blue-900/20"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{t.icon}</span>
                    {isSelected && (
                      <span className="bg-blue-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-stone-900">{t.name}</h5>
                    <p className="text-[10px] text-stone-500 font-medium leading-tight mt-0.5">
                      {t.tag}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Persistent Navigation Tabs */}
      <div className="print:hidden">
        <StudentSuiteTabs
          activeTab="ID_CARDS"
          counts={{
            activeIdCards: cards.length
          }}
        />
      </div>

      {/* 8-Up ID Cards Grid for Print & Screen */}
      {persona === "STUDENT" ? (
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
              guardian_phone: card.emergencyPhone,
              father_name: card.fatherName,
              bus_route_no: card.busRoute,
              valid_upto: card.validUpto,
              apaar_id: `9281-4019-${card.id.slice(0, 4)}`,
            };

            return (
              <div
                key={card.id}
                className="print:break-inside-avoid flex justify-center w-full"
              >
                <StudentIDCard
                  student={studentObj}
                  schoolInfo={selectedInstitutionObj}
                  isBack={cardFace === "BACK"}
                  themeId={selectedTheme}
                />
              </div>
            );
          })}
        </div>
      ) : (
        /* Teacher / Staff 8-Up Sheet Preview */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4 print:p-0 justify-items-center">
          {[
            { id: "FAC-01", first_name: "Dr. Vikramaditya", last_name: "Shukla", designation: "Head of Science & Physics", department: "Science", universal_id: "FAC-VET-001", phone_number: "+91 98111 22334" },
            { id: "FAC-02", first_name: "Mrs. Meenakshi", last_name: "Sundaram", designation: "Senior Mathematics PGT", department: "Mathematics", universal_id: "FAC-VET-002", phone_number: "+91 98111 33445" },
            { id: "FAC-03", first_name: "Mr. Rajesh", last_name: "Verma", designation: "Computer Science & AI HOD", department: "Technology", universal_id: "FAC-VET-003", phone_number: "+91 98111 44556" },
            { id: "FAC-04", first_name: "Ms. Sunita", last_name: "Chopra", designation: "English Literature TGT", department: "Languages", universal_id: "FAC-VET-004", phone_number: "+91 98111 55667" },
            { id: "FAC-05", first_name: "Mr. Anil", last_name: "Kumble", designation: "Physical Education Director", department: "Sports", universal_id: "FAC-VET-005", phone_number: "+91 98111 66778" },
            { id: "FAC-06", first_name: "Dr. Pratibha", last_name: "Nair", designation: "Biology & Biotechnology HOD", department: "Science", universal_id: "FAC-VET-006", phone_number: "+91 98111 77889" },
            { id: "FAC-07", first_name: "Mrs. Anjali", last_name: "Deshmukh", designation: "Social Sciences PGT", department: "Humanities", universal_id: "FAC-VET-007", phone_number: "+91 98111 88990" },
            { id: "FAC-08", first_name: "Mr. Suresh", last_name: "Menon", designation: "Senior Librarian & Archival", department: "Library", universal_id: "FAC-VET-008", phone_number: "+91 98111 99001" },
          ].map((faculty) => (
            <div
              key={faculty.id}
              className="print:break-inside-avoid flex justify-center w-full"
            >
              <TeacherIDCard
                faculty={faculty}
                schoolInfo={selectedInstitutionObj}
                isBack={cardFace === "BACK"}
                themeId={selectedTheme}
              />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
