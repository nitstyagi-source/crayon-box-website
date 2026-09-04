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
  RefreshCw
} from "lucide-react";
import {
  getBatchIdCardDataAction,
  StudentIdCardBadge
} from "@/app/actions/id-card-studio-actions";
import { StudentSuiteTabs } from "@/components/students/StudentSuiteTabs";
import { useInstitution } from "@/components/providers/InstitutionContext";

export default function BatchIDCardStudioPage() {
  const { selectedInstitutionObj } = useInstitution();
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [cards, setCards] = useState<StudentIdCardBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const availableClasses = [
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
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
            Generates high-resolution official laminated ID cards with barcodes, student photos, emergency contacts, blood groups, and bus route tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-blue-900 border border-blue-700 text-white font-bold rounded-xl px-3 py-2 text-xs focus:bg-blue-800"
          >
            {availableClasses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white text-stone-900 hover:bg-stone-100 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" /> Print 8-Up Sheet
          </button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4 print:p-0">
        {cards.map((card) => (
          <div
            key={card.id}
            className="w-full max-w-[340px] mx-auto bg-white rounded-3xl border-2 border-stone-300 shadow-xl overflow-hidden flex flex-col justify-between text-stone-900 print:shadow-none print:border-stone-800 print:break-inside-avoid"
            style={{ aspectRatio: "85.6 / 54", minHeight: "380px" }}
          >
            {/* ID Card Top Header */}
            <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white p-3 text-center space-y-0.5 relative">
              <div className="text-[8px] font-bold text-amber-300 uppercase tracking-widest">
                Recognized &amp; Registered School • Delhi
              </div>
              <h4 className="text-sm font-black tracking-tight uppercase">
                {selectedInstitutionObj?.name || "STUDENT IDENTITY CARD"}
              </h4>
              <div className="text-[8px] text-blue-200/80 font-sans">
                {selectedInstitutionObj?.address || "Recognized Institutional Campus"}
              </div>
            </div>

            {/* Photo & Primary Bio */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                {/* Photo Avatar */}
                <div className="w-16 h-20 rounded-xl bg-stone-100 border-2 border-blue-900 flex flex-col items-center justify-center text-center p-1 shrink-0 overflow-hidden shadow-xs">
                  <span className="text-2xl">👦</span>
                  <span className="text-[7px] text-stone-400 font-mono">PHOTO</span>
                </div>

                {/* Name & Class */}
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h5 className="font-black text-xs sm:text-sm text-blue-950 truncate leading-tight">
                    {card.studentName}
                  </h5>
                  <div className="text-[10px] font-bold text-stone-600">
                    Class: <span className="text-blue-900">{card.className}-{card.sectionName}</span>
                  </div>
                  <div className="text-[10px] font-mono text-stone-500">
                    Adm No: <strong>{card.admissionNo}</strong>
                  </div>
                  <div className="inline-block bg-rose-100 text-rose-900 text-[9px] font-black px-1.5 py-0.5 rounded">
                    Blood: {card.bloodGroup}
                  </div>
                </div>
              </div>

              {/* Detail Rows */}
              <div className="space-y-1 text-[10px] bg-stone-50 p-2.5 rounded-xl border border-stone-200 leading-tight">
                <div className="flex justify-between">
                  <span className="text-stone-500">Father:</span>
                  <span className="font-bold text-stone-800">{card.fatherName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Emergency Phone:</span>
                  <span className="font-mono font-bold text-stone-900">{card.emergencyPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Transport Route:</span>
                  <span className="font-bold text-blue-900">{card.busRoute}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Valid Upto:</span>
                  <span className="font-mono text-stone-700">{card.validUpto}</span>
                </div>
              </div>
            </div>

            {/* Bottom Barcode & Security Strip */}
            <div className="bg-stone-900 text-white px-3 py-1.5 flex justify-between items-center text-[8px] font-mono">
              <span>|||||||| ||||| ||||||| {card.admissionNo}</span>
              <span className="text-amber-400 font-bold">CBS VERIFIED</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
