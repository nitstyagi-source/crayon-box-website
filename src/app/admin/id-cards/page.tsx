"use client";

import React, { useState, useEffect } from 'react';
import {
  CreditCard, Printer, Users, UserCheck, ShieldCheck,
  Search, Filter, Download, Sparkles, RefreshCw, Eye,
  Building2, GraduationCap, Bus, CheckCircle2, ChevronRight,
  Layers, CheckSquare, Square, FileText, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { StudentIDCard } from '@/components/id-cards/StudentIDCard';
import { TeacherIDCard } from '@/components/id-cards/TeacherIDCard';
import { EscortPickupCard } from '@/components/id-cards/EscortPickupCard';
import { ClassPassCard } from '@/components/id-cards/ClassPassCard';
import { createClient } from '@/lib/supabase/client';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { getFilteredUniversalStudentsAction } from '@/app/actions/universal-student-actions';
import { getClassPassesForClassAction, ClassAccessPass } from '@/app/actions/class-pass-actions';
import { VastuMandalaWatermark } from '@/components/common/VastuMandalaWatermark';

export default function IDCardAndEscortGeneratorHubPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  // Mode: SINGLE card preview vs BULK batch generator
  const [viewMode, setViewMode] = useState<'SINGLE' | 'BULK'>('SINGLE');

  // Category Tab
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'TEACHER' | 'ESCORT' | 'CLASS_PASS'>('STUDENT');
  
  // Class Pass Generation State
  const [classPasses, setClassPasses] = useState<ClassAccessPass[]>([]);
  const [targetClassPass, setTargetClassPass] = useState('Class 5');
  const [targetSectionPass, setTargetSectionPass] = useState('A');
  const [isGeneratingPasses, setIsGeneratingPasses] = useState(false);

  // Data State
  const [students, setStudents] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  const [selectedEscort, setSelectedEscort] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLayout, setBulkLayout] = useState<'DUAL' | 'FRONT_ONLY' | 'BACK_ONLY'>('DUAL');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const fetchData = async () => {
    setIsLoading(true);
    const supabase = createClient();

    // 1. Fetch Students
    const stuRes = await getFilteredUniversalStudentsAction({
      institutionCode: currentInstitution,
      className: selectedClass !== 'ALL' ? selectedClass : undefined,
      sectionName: selectedSection !== 'ALL' ? selectedSection : undefined,
    });
    if (stuRes.success) {
      setStudents(stuRes.data || []);
      if (stuRes.data?.length > 0) {
        setSelectedStudent(stuRes.data[0]);
        // Default bulk select first 12 students
        setSelectedIds(stuRes.data.slice(0, 12).map((s: any) => s.id));
        
        const s = stuRes.data[0];
        setSelectedEscort({
          guardianName: s.guardian_first ? `${s.guardian_first} ${s.guardian_last || ''}` : 'Mr. Rajesh Sharma',
          relationship: 'FATHER',
          phone: s.guardian_phone || '9810011001',
          photoUrl: '',
          isAuthorizedPickup: true,
          studentName: `${s.first_name} ${s.last_name}`,
          studentUniversalId: s.universal_id || 'STU-VET-000001',
          studentPhotoUrl: s.photo_url || '',
          className: s.class_name || 'Class 4',
          sectionName: s.section_name || 'A',
          institutionCode: s.institution_code || 'CBS',
        });
      }
    }

    // 2. Fetch Faculty
    const { data: staffData } = await supabase
      .from('staff')
      .select(`
        id, first_name, last_name, email, phone_number, designation, department, status, photo_url,
        employee_assignments ( institution_code, designation, department, workload_percentage )
      `)
      .order('created_at', { ascending: false });

    let fList = staffData || [];
    if (currentInstitution !== 'ALL') {
      fList = fList.filter((s: any) =>
        s.employee_assignments?.some((a: any) => a.institution_code === currentInstitution)
      );
    }
    setFaculty(fList);
    if (fList.length > 0) {
      setSelectedFaculty(fList[0]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentInstitution, selectedClass, selectedSection]);

  const handlePrint = () => {
    window.print();
  };

  // Filtered lists
  const filteredStudents = students.filter(s =>
    searchQuery === '' ||
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.universal_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admission_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFaculty = faculty.filter(f =>
    (searchQuery === '' || `${f.first_name} ${f.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedDept === 'ALL' || f.department === selectedDept)
  );

  // Bulk Selection Handlers
  const handleToggleSelectId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (activeTab === 'STUDENT' || activeTab === 'ESCORT') {
      setSelectedIds(filteredStudents.map(s => s.id));
    } else {
      setSelectedIds(filteredFaculty.map(f => f.id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleGenerateClassPasses = async () => {
    setIsGeneratingPasses(true);
    try {
      const res = await getClassPassesForClassAction({
        className: targetClassPass,
        sectionName: targetSectionPass,
        institutionCode: currentInstitution,
      });
      if (res.success) {
        setClassPasses(res.passes);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsGeneratingPasses(false);
    }
  };

  // Selected Entities for Bulk Rendering
  const bulkSelectedStudents = students.filter(s => selectedIds.includes(s.id));
  const bulkSelectedFaculty = faculty.filter(f => selectedIds.includes(f.id));

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16 bg-[#FDFBF7] p-4 sm:p-8 rounded-3xl min-h-screen">
      
      {/* 🌟 Standard ISO/IEC 7810 ID-1 / CR80 PVC (53.98mm × 85.60mm) Print Stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background: #ffffff !important;
          }
          body * {
            visibility: hidden !important;
          }
          #bulk-print-container,
          #bulk-print-container *,
          #class-pass-print-container,
          #class-pass-print-container * {
            visibility: visible !important;
          }
          #bulk-print-container,
          #class-pass-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .card-print-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 5mm !important;
          }
        }
      `}</style>

      {/* Header Banner (Option 6 Sattva-Digital) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B1B30] via-[#0F2744] to-[#153257] text-white p-6 sm:p-8 rounded-3xl border-b-2 border-[#D4AF37]/40 shadow-xl print:hidden relative overflow-hidden">
        <VastuMandalaWatermark className="top-1/2 right-10 -translate-y-1/2 pointer-events-none" size={320} opacity={0.06} />

        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" />
              Standard PVC CR80 &amp; Front-Facing QR Credentials
            </span>
            <span className="text-amber-200/40 text-xs">•</span>
            <span className="text-amber-100 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Identity Credential &amp; Pass Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-medium max-w-2xl mt-1">
            Official Student ID Cards, Faculty Smart Badges, Escort Cards, and 1-Click School Access Class Passes with high-speed front QR turnstile telematics.
          </p>
        </div>

        {/* Mode Switcher + Print Action */}
        <div className="flex items-center gap-2.5 flex-wrap z-10">
          <div className="p-1 bg-white/10 backdrop-blur-xs rounded-2xl flex items-center gap-1 text-xs font-bold border border-white/15">
            <button
              onClick={() => setViewMode('SINGLE')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                viewMode === 'SINGLE'
                  ? 'bg-amber-400 text-stone-950 font-black shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Single Card Preview
            </button>
            <button
              onClick={() => setViewMode('BULK')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'BULK'
                  ? 'bg-amber-400 text-stone-950 font-black shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Bulk Batch Generator
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            {viewMode === 'BULK'
              ? `Print Selected Batch (${selectedIds.length} Cards)`
              : 'Print Active Card'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Student, Teacher, Escort, Class Pass) */}
      <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-2 text-xs font-bold print:hidden overflow-x-auto">
        {[
          { id: 'STUDENT', label: `🎓 Student ID Cards (${students.length})` },
          { id: 'TEACHER', label: `👨‍🏫 Teacher & Staff IDs (${faculty.length})` },
          { id: 'ESCORT', label: `🛡️ Authorized Escort Passes (${students.length})` },
          { id: 'CLASS_PASS', label: `🎟️ Class Pass Generator (One-Click)` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSelectedIds([]);
            }}
            className={`px-5 py-2.5 rounded-2xl transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#0B1B30] text-amber-300 font-extrabold shadow-xs'
                : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* 🌟 CLASS PASS GENERATOR SUITE (ONE-CLICK CLASS ACCESS PASSES) */}
      {/* ============================================================== */}
      {activeTab === 'CLASS_PASS' && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-4 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  One-Click School Access Class Pass Generator
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Select a single class to automatically generate official School Access Passes with front-facing turnstile QR codes for all students in that class.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateClassPasses}
                  disabled={isGeneratingPasses}
                  className="px-6 py-3 bg-[#0B1B30] hover:bg-[#153257] text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingPasses ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                  Generate Passes for {targetClassPass}-{targetSectionPass}
                </button>

                {classPasses.length > 0 && (
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Print Class Batch ({classPasses.length})
                  </button>
                )}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E8DFC8]/60">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Select Target Class *</label>
                <select
                  value={targetClassPass}
                  onChange={(e) => setTargetClassPass(e.target.value)}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-xs text-stone-900"
                >
                  {['Class 5', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Nursery', 'LKG', 'UKG', 'ALL'].map((c) => (
                    <option key={c} value={c}>{c === 'ALL' ? 'All Classes' : c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Select Section</label>
                <select
                  value={targetSectionPass}
                  onChange={(e) => setTargetSectionPass(e.target.value)}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-xs text-stone-900"
                >
                  {['A', 'B', 'C', 'D', 'ALL'].map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <div className="w-full bg-white p-2 rounded-xl border border-[#E8DFC8] text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span>Access Level:</span>
                  <span className="text-[#15803D] font-extrabold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Full Turnstile Clearance
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Passes Grid */}
          {classPasses.length > 0 ? (
            <div id="class-pass-print-container" className="space-y-4">
              <div className="flex items-center justify-between print:hidden">
                <div className="text-xs font-bold text-stone-700">
                  Showing <span className="text-stone-950 font-black">{classPasses.length}</span> Official School Access Passes with Front-Facing QR Codes
                </div>
              </div>

              <div className="flex flex-wrap gap-5 justify-center items-start">
                {classPasses.map((pass) => (
                  <div key={pass.passId} className="card-print-item">
                    <ClassPassCard pass={pass} schoolName={selectedInstitutionObj?.name || "CRAYON BOX SCHOOL"} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF7F2] p-12 rounded-3xl border border-[#E8DFC8] text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="font-black text-stone-900 text-sm">No Class Passes Generated Yet</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Select your desired class above and click <strong>"Generate Passes for Class"</strong> to instantly produce print-ready student access cards with front QR codes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 🌟 VIEW MODE 1: SINGLE CARD PREVIEW */}
      {/* ============================================================== */}
      {viewMode === 'SINGLE' && activeTab !== 'CLASS_PASS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: LIST SELECTOR */}
          <div className="space-y-4 print:hidden">
            
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {activeTab === 'STUDENT' ? 'Select Student' : activeTab === 'TEACHER' ? 'Select Faculty Member' : 'Select Escort / Child'}
              </h3>

              <Input
                placeholder="Search by name, admission no, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {activeTab === 'STUDENT' && (
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    options={[
                      { value: 'ALL', label: 'All Classes' },
                      { value: 'Class 1', label: 'Class 1' },
                      { value: 'Class 2', label: 'Class 2' },
                      { value: 'Class 3', label: 'Class 3' },
                      { value: 'Class 4', label: 'Class 4' },
                      { value: 'Class 5', label: 'Class 5' },
                      { value: 'Class 6', label: 'Class 6' },
                      { value: 'Class 7', label: 'Class 7' },
                      { value: 'Class 8', label: 'Class 8' },
                      { value: 'Class 9', label: 'Class 9' },
                      { value: 'Class 10', label: 'Class 10' },
                      { value: 'Class 11', label: 'Class 11' },
                      { value: 'Class 12', label: 'Class 12' },
                      { value: 'Pre-Nursery', label: 'Pre-Nursery' },
                      { value: 'Nursery', label: 'Nursery' },
                      { value: 'LKG', label: 'LKG' },
                      { value: 'UKG', label: 'UKG' },
                    ]}
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  />
                  <Select
                    options={[
                      { value: 'ALL', label: 'All Sections' },
                      { value: 'A', label: 'Section A' },
                      { value: 'B', label: 'Section B' },
                      { value: 'C', label: 'Section C' },
                    ]}
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* List Box */}
            <div className="max-h-[560px] overflow-y-auto space-y-2 pr-1">
              
              {activeTab === 'STUDENT' && (
                filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between text-xs ${
                      selectedStudent?.id === s.id
                        ? 'bg-indigo-50 border-indigo-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                        {s.photo_url ? <img src={s.photo_url} alt={s.first_name} className="w-full h-full object-cover" /> : s.first_name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{s.first_name} {s.last_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{s.universal_id} • {s.class_name} ({s.section_name})</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))
              )}

              {activeTab === 'TEACHER' && (
                filteredFaculty.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFaculty(f)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between text-xs ${
                      selectedFaculty?.id === f.id
                        ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                        {f.photo_url ? <img src={f.photo_url} alt={f.first_name} className="w-full h-full object-cover" /> : f.first_name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{f.first_name} {f.last_name}</span>
                        <span className="text-[10px] text-slate-500">{f.designation}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))
              )}

              {activeTab === 'ESCORT' && (
                filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedEscort({
                        guardianName: s.guardian_first ? `${s.guardian_first} ${s.guardian_last || ''}` : 'Mr. Rajesh Sharma',
                        relationship: 'FATHER',
                        phone: s.guardian_phone || '9810011001',
                        photoUrl: '',
                        isAuthorizedPickup: true,
                        studentName: `${s.first_name} ${s.last_name}`,
                        studentUniversalId: s.universal_id || 'STU-VET-000001',
                        studentPhotoUrl: s.photo_url || '',
                        className: s.class_name || 'Class 4',
                        sectionName: s.section_name || 'A',
                        institutionCode: s.institution_code || 'CBS',
                      });
                    }}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between text-xs ${
                      selectedEscort?.studentUniversalId === s.universal_id
                        ? 'bg-amber-50 border-amber-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">Parent: {s.guardian_first ? `${s.guardian_first} ${s.guardian_last || ''}` : 'Mr. Rajesh Sharma'}</span>
                      <span className="text-[10px] text-slate-500">Child: {s.first_name} {s.last_name} ({s.class_name})</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))
              )}

            </div>
          </div>

          {/* RIGHT: LIVE SINGLE PREVIEW */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6 print:hidden">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Live PVC Card Preview (Front & Back)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Front-facing QR code enabled for immediate security gate attendance tap.
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
                  Print Card
                </Button>
              </div>

              <div id="bulk-print-container">
                {activeTab === 'STUDENT' && selectedStudent && (
                  <div className="card-print-item">
                    <StudentIDCard student={selectedStudent} />
                  </div>
                )}

                {activeTab === 'TEACHER' && selectedFaculty && (
                  <div className="card-print-item">
                    <TeacherIDCard faculty={selectedFaculty} />
                  </div>
                )}

                {activeTab === 'ESCORT' && selectedEscort && (
                  <div className="card-print-item">
                    <EscortPickupCard escort={selectedEscort} />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 🌟 VIEW MODE 2: BULK BATCH GENERATOR (CHECKBOX MATRIX & SHEET) */}
      {/* ============================================================== */}
      {viewMode === 'BULK' && activeTab !== 'CLASS_PASS' && (
        <div className="space-y-6">
          
          {/* Bulk Controls & Filters Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 print:hidden">
            
            {/* Top Row: Filters & Selection Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                
                {/* Search */}
                <div className="w-56">
                  <Input
                    placeholder="Search name, admission no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Class & Section Filter */}
                {activeTab === 'STUDENT' && (
                  <>
                    <div className="w-36">
                      <Select
                        options={[
                          { value: 'ALL', label: 'All Classes' },
                          { value: 'Class 1', label: 'Class 1' },
                          { value: 'Class 2', label: 'Class 2' },
                          { value: 'Class 3', label: 'Class 3' },
                          { value: 'Class 4', label: 'Class 4' },
                          { value: 'Class 5', label: 'Class 5' },
                          { value: 'Class 6', label: 'Class 6' },
                          { value: 'Class 7', label: 'Class 7' },
                          { value: 'Class 8', label: 'Class 8' },
                          { value: 'Class 9', label: 'Class 9' },
                          { value: 'Class 10', label: 'Class 10' },
                          { value: 'Class 11', label: 'Class 11' },
                          { value: 'Class 12', label: 'Class 12' },
                          { value: 'Pre-Nursery', label: 'Pre-Nursery' },
                          { value: 'Nursery', label: 'Nursery' },
                          { value: 'LKG', label: 'LKG' },
                          { value: 'UKG', label: 'UKG' },
                        ]}
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <Select
                        options={[
                          { value: 'ALL', label: 'All Sections' },
                          { value: 'A', label: 'Section A' },
                          { value: 'B', label: 'Section B' },
                          { value: 'C', label: 'Section C' },
                        ]}
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'TEACHER' && (
                  <div className="w-48">
                    <Select
                      options={[
                        { value: 'ALL', label: 'All Departments' },
                        { value: 'Academics', label: 'Academics' },
                        { value: 'Science & Laboratories', label: 'Science' },
                        { value: 'Mathematics', label: 'Mathematics' },
                        { value: 'Languages', label: 'Languages' },
                        { value: 'Montessori', label: 'Montessori' },
                        { value: 'Sports', label: 'Sports' },
                        { value: 'Transport', label: 'Transport' },
                      ]}
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                    />
                  </div>
                )}

                {/* Card Print Format Selector */}
                <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setBulkLayout('DUAL')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      bulkLayout === 'DUAL' ? 'bg-white text-indigo-600 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🎴 Front & Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkLayout('FRONT_ONLY')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      bulkLayout === 'FRONT_ONLY' ? 'bg-white text-indigo-600 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🏷️ Front Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkLayout('BACK_ONLY')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      bulkLayout === 'BACK_ONLY' ? 'bg-white text-indigo-600 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📄 Back Only
                  </button>
                </div>

              </div>

              {/* Selection Counter & Select All Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 font-extrabold text-xs border border-indigo-200">
                  Selected: {selectedIds.length} Cards
                </span>
                <Button size="sm" variant="outline" onClick={handleSelectAll} leftIcon={<CheckSquare className="w-3.5 h-3.5" />}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={handleDeselectAll} leftIcon={<Square className="w-3.5 h-3.5" />}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Bottom Row: Quick Action */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>
                Format: <strong className="text-slate-800">{bulkLayout === 'DUAL' ? 'Front & Back Side-by-Side' : bulkLayout === 'FRONT_ONLY' ? 'Front Sides in Grid' : 'Back Sides in Grid'}</strong> • Standard CR80 PVC (85.6mm × 54mm)
              </span>
              <Button size="sm" variant="primary" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
                Print Selected Batch ({selectedIds.length} Cards)
              </Button>
            </div>

          </div>

          {/* Bulk Selection Checklist Bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 print:hidden space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Step 1: Check Individuals to Include in Batch Print
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-1">
              {(activeTab === 'TEACHER' ? filteredFaculty : filteredStudents).map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSelectId(item.id)}
                    className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-2 text-xs select-none ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 rounded text-indigo-600"
                    />
                    <div className="truncate">
                      <span className="font-bold block truncate">{item.first_name} {item.last_name}</span>
                      <span className={`text-[10px] block truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {item.class_name ? `${item.class_name} (${item.section_name})` : item.designation}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🌟 BATCH PRINT PREVIEW CONTAINER (NON-OVERLAPPING) */}
          <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6 print:hidden">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Bulk Batch Print Preview ({selectedIds.length} Cards Selected)
                </h3>
                <p className="text-xs text-slate-500">
                  {bulkLayout === 'DUAL'
                    ? 'Dual Layout: Front & Back rendered per row with zero overlapping.'
                    : 'Single Face Grid: Optimized for multi-card sheet printing.'}
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
                Print All ({selectedIds.length} Cards)
              </Button>
            </div>

            {/* Target Bulk Printable Container */}
            <div id="bulk-print-container">
              {selectedIds.length === 0 ? (
                <EmptyState
                  icon={<Layers className="w-8 h-8 text-slate-400" />}
                  title="No Cards Selected for Batch Generation"
                  description="Use the checkboxes above or click 'Select All' to select students or faculty for bulk ID card printing."
                  actionLabel="Select All Filtered"
                  onAction={handleSelectAll}
                />
              ) : (
                <div
                  className={
                    bulkLayout === 'DUAL'
                      ? 'flex flex-col items-center gap-8 w-full'
                      : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full'
                  }
                >
                  {/* STUDENTS BULK */}
                  {activeTab === 'STUDENT' && bulkSelectedStudents.map((s) => (
                    <div key={s.id} className="card-print-item flex justify-center w-full">
                      <StudentIDCard student={s} layoutMode={bulkLayout} />
                    </div>
                  ))}

                  {/* TEACHERS BULK */}
                  {activeTab === 'TEACHER' && bulkSelectedFaculty.map((f) => (
                    <div key={f.id} className="card-print-item flex justify-center w-full">
                      <TeacherIDCard faculty={f} layoutMode={bulkLayout} />
                    </div>
                  ))}

                  {/* ESCORTS BULK */}
                  {activeTab === 'ESCORT' && bulkSelectedStudents.map((s) => (
                    <div key={s.id} className="card-print-item flex justify-center w-full">
                      <EscortPickupCard
                        layoutMode={bulkLayout}
                        escort={{
                          guardianName: s.guardian_first ? `${s.guardian_first} ${s.guardian_last || ''}` : 'Mr. Rajesh Sharma',
                          relationship: 'FATHER',
                          phone: s.guardian_phone || '9810011001',
                          photoUrl: '',
                          isAuthorizedPickup: true,
                          studentName: `${s.first_name} ${s.last_name}`,
                          studentUniversalId: s.universal_id || 'STU-VET-000001',
                          studentPhotoUrl: s.photo_url || '',
                          className: s.class_name || 'Class 4',
                          sectionName: s.section_name || 'A',
                          institutionCode: s.institution_code || 'CBS',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
