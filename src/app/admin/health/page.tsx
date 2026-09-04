"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  HeartPulse, Activity, Thermometer, ShieldCheck,
  RefreshCw, CheckCircle2, AlertCircle, Plus, FileText,
  ShieldAlert, Stethoscope, BedDouble, AlertTriangle, Users,
  Sparkles, Award, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { getStudentHealthMedicalDashboardAction } from '@/app/actions/safety-health-actions';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import { InfirmaryEhrDesk } from '@/components/logistics/InfirmaryEhrDesk';
import { PocsoSafeguardingDesk } from '@/components/logistics/PocsoSafeguardingDesk';

function StudentHealthHubContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [activeTab, setActiveTab] = useState<'clinic' | 'medical-360' | 'safeguarding' | 'wellness'>('clinic');

  useEffect(() => {
    if (tabParam === 'safeguarding' || tabParam === 'pocso') setActiveTab('safeguarding');
    else if (tabParam === 'wellness' || tabParam === 'discipline') setActiveTab('wellness');
    else if (tabParam === 'medical-360' || tabParam === 'immunization') setActiveTab('medical-360');
    else if (tabParam === 'clinic') setActiveTab('clinic');
  }, [tabParam]);

  const [logs, setLogs] = useState<any[]>([]);
  const [counts, setCounts] = useState({ totalVisits: 0, resolvedVisits: 0, referredVisits: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Sample Student Medical 360 Profiles
  const sampleMedicalProfiles = [
    { name: "Aarav Sharma", class: "Grade 5-A", blood: "O+ve", allergies: "Peanuts, Dust Mites", chronic: "Mild Pediatric Asthma", abha: "91-4501-2291-8841", vax: "Complete (DTaP, MMR, HepB)" },
    { name: "Ananya Verma", class: "Grade 3-B", blood: "B+ve", allergies: "Penicillin", chronic: "None", abha: "91-8821-4402-1190", vax: "Complete (Verified)" },
    { name: "Kabir Mehta", class: "Grade 8-A", blood: "AB+ve", allergies: "None", chronic: "None", abha: "91-1049-7721-3312", vax: "Complete (Tetanus booster 2025)" },
    { name: "Riya Kapoor", class: "Grade 2-C", blood: "A+ve", allergies: "Lactose Intolerance", chronic: "None", abha: "91-6623-8890-4412", vax: "Complete" },
  ];

  const fetchHealthLogs = async () => {
    setIsLoading(true);
    const res = await getStudentHealthMedicalDashboardAction();
    if (res.success) {
      setLogs(res.logs || []);
      setCounts(res.counts || { totalVisits: 0, resolvedVisits: 0, referredVisits: 0 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHealthLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* Vastu Mandala Module Banner */}
      <VastuModuleBanner
        title="Student Wellness, Clinic EHR & POCSO Safeguarding Hub"
        description="Comprehensive healthcare and child protection suite: Daily clinic visits, SOAP clinical encounters, student medical 360 with allergy warnings, and confidential statutory POCSO compliance dossiers."
        badgeText="Infirmary & POCSO"
        badgeIcon={<HeartPulse className="w-3.5 h-3.5" />}
        titleIcon={<HeartPulse className="w-7 h-7 text-rose-600" />}
        institutionText={selectedInstitutionObj?.name || "Campus Infirmary Command"}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHealthLogs}
              className="border-[#E8DFC8] text-xs font-bold bg-white"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Records
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setActiveTab('clinic')}
              className="bg-[#D97706] hover:bg-[#B45309] text-white font-black shadow-md text-xs px-4 py-2 rounded-xl"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Log Clinic Visit
            </Button>
          </div>
        }
      />

      {/* 4 Synchronized Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('clinic')}
          className={`px-4 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'clinic'
              ? 'bg-[#0B1B30] text-amber-300 font-extrabold shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
          1. Infirmary EHR &amp; Clinical Visits
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
            SOAP Encounters
          </span>
        </button>

        <button
          onClick={() => setActiveTab('medical-360')}
          className={`px-4 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'medical-360'
              ? 'bg-[#0B1B30] text-amber-300 font-extrabold shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          2. Student Medical 360 &amp; Immunization
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
            Allergy Radar
          </span>
        </button>

        <button
          onClick={() => setActiveTab('safeguarding')}
          className={`px-4 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'safeguarding'
              ? 'bg-[#0B1B30] text-amber-300 font-extrabold shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          3. Child Safeguarding &amp; POCSO Dossiers
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
            24h Statutory Clock
          </span>
        </button>

        <button
          onClick={() => setActiveTab('wellness')}
          className={`px-4 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'wellness'
              ? 'bg-[#0B1B30] text-amber-300 font-extrabold shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          4. Student Wellness &amp; Counseling Log
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
            Pastoral Care
          </span>
        </button>
      </div>

      {/* 🌟 TAB 1: INFIRMARY EHR & CLINICAL VISITS */}
      {activeTab === 'clinic' && (
        <div className="space-y-6">
          <InfirmaryEhrDesk defaultTab="log_visit" />
        </div>
      )}

      {/* 🌟 TAB 2: STUDENT MEDICAL 360 & ALLERGIES */}
      {activeTab === 'medical-360' && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#E8DFC8] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8DFC8]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                    Student Electronic Health Records (EHR)
                  </span>
                  <span className="text-stone-400 text-xs">•</span>
                  <span className="text-xs font-bold text-stone-600">Admissions Medical Declaration Linkage</span>
                </div>
                <h3 className="text-lg font-black text-[#2D2319] mt-1">
                  Comprehensive Student Medical 360 &amp; Critical Allergy Radar
                </h3>
                <p className="text-xs text-stone-600">
                  Pre-existing conditions, emergency allergy alerts, Ayushman Bharat Health Account (ABHA) IDs, and verified vaccination records.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchHealthLogs}
                  className="border-[#E8DFC8] text-xs font-bold bg-white"
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Sync Health Directory
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F4EFE6] text-[10px] font-black uppercase tracking-wider text-stone-600 border-b border-[#E8DFC8]">
                    <th className="py-3 px-4">Student &amp; Class</th>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Allergy Alerts</th>
                    <th className="py-3 px-4">Chronic Condition</th>
                    <th className="py-3 px-4">ABHA Health ID</th>
                    <th className="py-3 px-4">Immunization Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFC8]">
                  {sampleMedicalProfiles.map((p, i) => (
                    <tr key={i} className="hover:bg-[#FDFBF7] transition">
                      <td className="py-3.5 px-4">
                        <strong className="text-[#2D2319] block font-bold">{p.name}</strong>
                        <span className="text-[10px] text-stone-500 font-bold">{p.class}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md font-mono font-black text-rose-800 bg-rose-50 border border-rose-200">
                          {p.blood}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {p.allergies !== "None" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> {p.allergies}
                          </span>
                        ) : (
                          <span className="text-stone-400 font-medium">None Recorded</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700 font-medium">
                        {p.chronic}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                        {p.abha}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {p.vax}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 TAB 3: CHILD SAFEGUARDING & POCSO STATUTORY DOSSIERS */}
      {activeTab === 'safeguarding' && (
        <div className="space-y-6">
          <PocsoSafeguardingDesk defaultTab="POCSO_SAFEGUARDING" />
        </div>
      )}

      {/* 🌟 TAB 4: STUDENT WELLNESS & PASTORAL COUNSELING */}
      {activeTab === 'wellness' && (
        <div className="space-y-6">
          <PocsoSafeguardingDesk defaultTab="DISCIPLINE" />
        </div>
      )}

    </div>
  );
}

export default function StudentHealthInfirmaryPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-stone-500 font-bold text-xs flex flex-col items-center justify-center space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
        <span>Loading Student Wellness, Clinic EHR &amp; POCSO Safeguarding Hub...</span>
      </div>
    }>
      <StudentHealthHubContent />
    </Suspense>
  );
}
