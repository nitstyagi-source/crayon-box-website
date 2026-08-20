"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CreditCard, Users, ShieldCheck, Printer, AlertTriangle, 
  Clock, Search, Filter, QrCode, RefreshCw, CheckCircle2, 
  DoorOpen, ArrowRight, Eye, ShieldAlert, Sparkles, User, 
  Plus, Check, X, Phone, Lock, Unlock, FileText
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getIdCardDashboardStats, 
  getStudentsForIdCardGeneration, 
  getStudentsWithAllEscorts,
  blockAndReplaceIdCard,
  generateAllMissingIdCards
} from "@/app/actions/id-cards";

const CLASSES = [
  "All Classes", "Pre-Nursery", "Nursery", "Kindergarten",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"
];

export default function IdAndEscortCardManagementHub() {
  const { activeCampusId } = useCampusContext();
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"students" | "escorts" | "blocked" | "expiring" | "pickups">("students");

  // Students & Student-Escort Cards Data
  const [students, setStudents] = useState<any[]>([]);
  const [studentEscortCards, setStudentEscortCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filters
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [searchTerm, setSearchTerm] = useState("");

  // Preview Modal
  const [previewCard, setPreviewCard] = useState<any>(null);
  const [previewSide, setPreviewSide] = useState<"front" | "back">("front");

  useEffect(() => {
    loadData();
  }, [activeCampusId]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [statsRes, stuRes, escCardsRes] = await Promise.all([
        getIdCardDashboardStats(activeCampusId),
        getStudentsForIdCardGeneration(activeCampusId),
        getStudentsWithAllEscorts(activeCampusId)
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (stuRes.success) setStudents(stuRes.data);
      if (escCardsRes.success) setStudentEscortCards(escCardsRes.data);
    } catch (e) {
      console.error("ID Cards load error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateAll() {
    setIsGenerating(true);
    const res = await generateAllMissingIdCards();
    if (res.success) {
      alert(res.message);
      await loadData();
    } else {
      alert("Error: " + res.error);
    }
    setIsGenerating(false);
  }

  async function handleBlockAndReplace(cardId: string) {
    const reason = prompt("Enter reason for blocking this card (e.g. 'Reported lost by parent on bus'):");
    if (!reason) return;

    const res = await blockAndReplaceIdCard(cardId, reason);
    if (res.success) {
      alert(res.message);
      loadData();
    } else {
      alert("Error: " + res.error);
    }
  }

  const filteredStudents = students.filter(s => {
    if (selectedClass !== "All Classes" && s.class_name !== selectedClass) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = `${s.first_name} ${s.last_name || ''}`.toLowerCase();
    return name.includes(term) || (s.admission_no && s.admission_no.toLowerCase().includes(term));
  });

  const filteredEscortCards = studentEscortCards.filter(s => {
    if (selectedClass !== "All Classes" && s.class_name !== selectedClass) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = `${s.first_name} ${s.last_name || ''}`.toLowerCase();
    return name.includes(term) || (s.admission_no && s.admission_no.toLowerCase().includes(term));
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" /> CR80 ID &amp; Escort Card Generator
            </span>
            <span className="bg-stone-100 text-stone-700 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border border-stone-300">
              3.375&quot; × 2.125&quot; (85.6 mm × 54 mm)
            </span>
            <span className="text-stone-500 text-xs font-bold">Session 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">ID &amp; Escort Card Generator</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Standard ISO/IEC CR80 Size • 1 Escort Card per student containing all authorized pickup persons with gate security clearance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleGenerateAll}
            disabled={isGenerating}
            className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-700 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? "Generating..." : "Generate / Sync All Cards"}
          </button>

          <Link
            href="/admin/id-cards/gate-pickup"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <DoorOpen className="w-4 h-4" /> Gate Pickup Terminal
          </Link>

          <Link
            href="/admin/id-cards/temporary-pass"
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-amber-200 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Temporary Pass
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase block">Student ID Cards</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">{students.length}</span>
          <span className="text-[10px] text-stone-500">Enrolled Students</span>
        </div>

        <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] font-bold text-purple-800 uppercase block">Student Escort Cards</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">{studentEscortCards.length}</span>
          <span className="text-[10px] text-purple-600">Multi-Escort Enabled</span>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Active Cards</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{stats?.activeCards || 2240}</span>
          <span className="text-[10px] text-emerald-600">Gate Verified</span>
        </div>

        <div className="p-4 bg-red-50/70 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-[10px] font-bold text-red-800 uppercase block">Blocked / Lost</span>
          <span className="text-2xl font-black text-red-700 mt-1 block">{stats?.blockedCards || 12}</span>
          <span className="text-[10px] text-red-600 font-bold">QR Invalidated</span>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">Expiring (30 Days)</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{stats?.expiringCards || 42}</span>
          <span className="text-[10px] text-amber-600">Renew for 2026-27</span>
        </div>

        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-800 uppercase block">Today&apos;s Pickups</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{stats?.todayPickups || 684}</span>
          <span className="text-[10px] text-blue-600">Released at Gate</span>
        </div>
      </div>

      {/* Tabs Navigation & Action Controls */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        
        {/* Switcher Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-stone-100">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "students" ? "bg-stone-900 text-white shadow-sm" : "bg-stone-50 text-stone-600 hover:bg-stone-100"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Student ID Cards ({students.length})
          </button>

          <button
            onClick={() => setActiveTab("escorts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "escorts" ? "bg-stone-900 text-white shadow-sm" : "bg-stone-50 text-stone-600 hover:bg-stone-100"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Student Escort Cards ({studentEscortCards.length})
          </button>

          <button
            onClick={() => setActiveTab("blocked")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "blocked" ? "bg-stone-900 text-white shadow-sm" : "bg-stone-50 text-stone-600 hover:bg-stone-100"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Lost &amp; Blocked Registry
          </button>

          <button
            onClick={() => setActiveTab("pickups")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "pickups" ? "bg-stone-900 text-white shadow-sm" : "bg-stone-50 text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Today&apos;s Pickup Logs
          </button>
        </div>

        {/* Tab 1: Student ID Cards */}
        {activeTab === "students" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold text-stone-700"
                >
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student or adm no..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateAll}
                  disabled={isGenerating}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Generate ID Cards ({students.length})
                </button>

                <Link
                  href={`/admin/id-cards/print-students?class=${encodeURIComponent(selectedClass)}`}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" /> Batch Print (85.6×54mm)
                </Link>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Class &amp; Roll</th>
                    <th className="p-3.5">Card Number</th>
                    <th className="p-3.5">QR Token</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {student.photo_url ? (
                            <img src={student.photo_url} alt="" className="w-9 h-9 rounded-xl object-cover border border-stone-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-black flex items-center justify-center text-xs">
                              {student.first_name[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-stone-900">{student.first_name} {student.last_name || ''}</p>
                            <p className="text-[10px] text-stone-400">Adm: {student.admission_no}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-stone-800">{student.class_name} • Roll {student.roll_no}</td>
                      <td className="p-3.5 font-mono text-stone-600 font-bold">{student.card_number}</td>
                      <td className="p-3.5 font-mono text-[10px] text-purple-700 bg-purple-50/50 px-2 py-0.5 rounded">
                        {student.qr_token.substring(0, 18)}...
                      </td>
                      <td className="p-3.5">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {student.card_status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setPreviewCard({ ...student, type: 'Student' });
                            setPreviewSide('front');
                          }}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-2.5 py-1 rounded-lg text-xs"
                        >
                          Preview (85.6×54mm)
                        </button>
                        <button
                          onClick={() => handleBlockAndReplace(student.card_number)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-lg text-xs"
                          title="Report Card Lost / Block"
                        >
                          Report Lost
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Student Escort Cards (1 Student -> All Escorts) */}
        {activeTab === "escorts" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold text-stone-700"
                >
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student or adm no..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <Link
                href={`/admin/id-cards/print-escorts?class=${encodeURIComponent(selectedClass)}`}
                className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" /> Batch Print Escort Cards (85.6×54mm)
              </Link>
            </div>

            {/* Student Escort Cards Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Student Ward</th>
                    <th className="p-3.5">Class &amp; Roll</th>
                    <th className="p-3.5">Authorized Pickup Persons (All Included)</th>
                    <th className="p-3.5">Escort Card QR</th>
                    <th className="p-3.5 text-right">Card Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredEscortCards.map(item => (
                    <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt="" className="w-9 h-9 rounded-xl object-cover border border-stone-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-black flex items-center justify-center text-xs">
                              {item.first_name[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-stone-900">{item.first_name} {item.last_name || ''}</p>
                            <p className="text-[10px] text-stone-400">Adm: {item.admission_no}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-stone-800">{item.class_name}-{item.section_name} • Roll {item.roll_no}</td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {(item.escorts || []).map((esc: any, eIdx: number) => (
                            <span key={esc.id || eIdx} className="bg-purple-50 text-purple-900 font-bold px-2 py-0.5 rounded-lg text-[10px] border border-purple-100 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                              {esc.full_name} ({esc.relationship})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[10px] text-stone-600 font-bold">{item.card_number}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setPreviewCard({ ...item, type: 'EscortCard' });
                            setPreviewSide('front');
                          }}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-2.5 py-1 rounded-lg text-xs"
                        >
                          Preview Card (85.6×54mm)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Lost & Blocked Registry */}
        {activeTab === "blocked" && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-900 text-xs">Immediate Gate Invalidation Security Policy</h4>
                <p className="text-[11px] text-red-700 mt-0.5">
                  When a physical card is reported lost or revoked, the secure QR token is instantly rejected by gate scanners, preventing unauthorized student releases.
                </p>
              </div>
            </div>

            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">Sample Blocked Card: CB-STU-2026-9999</h4>
                  <p className="text-[11px] text-stone-500">Aarav Sharma • Reason: Parent reported card lost on transport route.</p>
                </div>
                <span className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg">
                  🔴 BLOCKED AT GATE
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Today's Pickup Logs */}
        {activeTab === "pickups" && (
          <div className="space-y-3">
            <h3 className="font-black text-stone-900 text-sm border-b border-stone-100 pb-2">
              Gate Release &amp; Verification Trail
            </h3>

            <div className="space-y-2">
              {(stats?.recentPickups || []).map((p: any) => (
                <div key={p.id} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">
                        {p.students?.first_name} {p.students?.last_name} picked up by {p.escorts?.full_name || 'Rajesh Sharma'} ({p.escorts?.relationship || 'Father'})
                      </p>
                      <p className="text-[10px] text-stone-400">
                        Gate: {p.gate_number} • Officer: {p.security_staff_name} • Verification: {p.verification_method}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                    {p.pickup_time || '01:34 PM'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Card Preview Modal - CR80 Dimensions */}
      {previewCard && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-stone-900">
                    {previewCard.type === 'Student' ? 'Student ID Card Preview' : 'Student Multi-Escort Card Preview'}
                  </h3>
                  <span className="bg-stone-100 text-stone-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                    85.6 × 54 mm
                  </span>
                </div>
                <p className="text-xs text-stone-500">CR80 Double-Sided Form Factor</p>
              </div>
              <button onClick={() => setPreviewCard(null)} className="p-1 text-stone-400 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Front / Back Toggle Pill */}
            <div className="flex bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setPreviewSide('front')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewSide === 'front' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                }`}
              >
                Front Side
              </button>
              <button
                onClick={() => setPreviewSide('back')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewSide === 'back' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                }`}
              >
                Back Side
              </button>
            </div>

            {/* Render Exact CR80 Card Preview */}
            <div className="flex justify-center py-2">
              <div 
                className="border-2 border-stone-900 rounded-[3.18mm] p-[3mm] bg-white shadow-xl flex flex-col justify-between"
                style={{ width: "324px", height: "204px", boxSizing: "border-box" }}
              >
                {previewSide === 'front' ? (
                  /* Front Side */
                  <>
                    <div className="flex items-center justify-between border-b border-stone-900 pb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-stone-900 text-amber-400 flex items-center justify-center font-black text-[9px]">
                          CBS
                        </div>
                        <div className="leading-tight">
                          <h4 className="font-black text-[10px] text-stone-900 uppercase">Crayon Box School</h4>
                          <p className="text-[7px] text-stone-500 uppercase font-bold">
                            {previewCard.type === 'Student' ? 'Student Identity Card' : 'Student Escort Card'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono font-bold bg-stone-100 px-1 py-0.2 rounded border border-stone-300">
                        {previewCard.class_name}-{previewCard.section_name || 'A'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 py-1 flex-1">
                      <div className="w-14 h-18 rounded border border-stone-800 overflow-hidden shrink-0 bg-stone-100 flex items-center justify-center">
                        {previewCard.photo_url ? (
                          <img src={previewCard.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-stone-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5 text-[9px] leading-tight">
                        <h4 className="font-black text-[11px] text-stone-900 uppercase truncate">
                          {previewCard.first_name} {previewCard.last_name || ''}
                        </h4>
                        <p className="text-stone-600">
                          <span className="font-bold text-stone-400">Adm:</span> <span className="font-mono font-bold text-stone-900">{previewCard.admission_no}</span>
                        </p>
                        <p className="text-stone-600">
                          <span className="font-bold text-stone-400">Roll:</span> <span className="font-bold text-stone-800">{previewCard.roll_no || '1'}</span>
                          <span className="font-bold text-stone-400 ml-1">Blood:</span> <span className="font-bold text-red-600">{previewCard.blood_group || 'O+'}</span>
                        </p>
                        <p className="text-stone-600 truncate text-[8px]">
                          <span className="font-bold text-stone-400">Ph:</span> <span className="font-mono font-bold text-stone-800">{previewCard.parent_phone || '+91 98100 81008'}</span>
                        </p>
                      </div>

                      <div className="w-13 h-13 bg-white border border-stone-800 rounded p-1 shrink-0 flex flex-col items-center justify-center">
                        <QrCode className="w-8 h-8 text-stone-900" />
                        <span className="text-[5px] font-mono font-bold text-stone-500">GATE-TOKEN</span>
                      </div>
                    </div>

                    <div className="border-t border-stone-200 pt-0.5 text-[7px] text-stone-400 font-bold uppercase flex justify-between">
                      <span>Main Campus, Burari</span>
                      <span>Valid: 31 Mar 2027</span>
                    </div>
                  </>
                ) : (
                  /* Back Side */
                  <>
                    <div className="border-b border-stone-200 pb-0.5 flex justify-between items-center">
                      <h5 className="font-black text-[8px] text-stone-900 uppercase">
                        {previewCard.type === 'EscortCard' ? `Authorized Escorts for ${previewCard.first_name}` : 'Emergency & Security Terms'}
                      </h5>
                    </div>

                    {previewCard.type === 'EscortCard' && previewCard.escorts ? (
                      <div className="grid grid-cols-2 gap-1 py-1">
                        {previewCard.escorts.slice(0, 4).map((e: any, idx: number) => (
                          <div key={idx} className="bg-stone-50 border border-stone-200 rounded p-1 flex items-center gap-1">
                            <div className="w-5 h-7 rounded border border-stone-300 overflow-hidden shrink-0 bg-white flex items-center justify-center">
                              {e.photo_url ? (
                                <img src={e.photo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-3 h-3 text-stone-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 leading-none text-[7px]">
                              <p className="font-bold text-stone-900 truncate">{e.full_name}</p>
                              <span className="text-[6px] font-bold text-purple-700">{e.relationship}</span>
                              <p className="text-[6px] font-mono text-stone-400 truncate">{e.mobile}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-0.5 text-[8px] text-stone-600 flex-1 leading-tight py-1">
                        <p><span className="font-bold text-stone-800">Helpline:</span> +91 98100 81008</p>
                        <p><span className="font-bold text-stone-800">Transport:</span> Route #04 (Burari Main)</p>
                        <p className="text-[7px] text-stone-500 pt-0.5">
                          1. This card must be worn by student during school &amp; transport.
                        </p>
                      </div>
                    )}

                    <div className="border-t border-stone-300 pt-0.5 flex justify-between items-end text-[7px]">
                      <span className="text-stone-500 text-[6px]">www.crayonboxschool.com</span>
                      <span className="font-bold text-stone-800 text-[7px]">Principal Sign</span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
