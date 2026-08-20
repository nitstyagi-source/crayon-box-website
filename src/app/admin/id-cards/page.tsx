"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CreditCard, Users, ShieldCheck, Printer, AlertTriangle, 
  Clock, Search, Filter, QrCode, RefreshCw, CheckCircle2, 
  DoorOpen, ArrowRight, Eye, ShieldAlert, Sparkles, User, 
  Plus, Check, X, Phone, Lock, Unlock, FileText, UserPlus,
  ChevronRight
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getIdCardDashboardStats, 
  getStudentsForIdCardGeneration, 
  getStudentsWithAllEscorts,
  blockAndReplaceIdCard,
  generateAllMissingIdCards,
  generateStudentIdCard,
  addEscortToStudent
} from "@/app/actions/id-cards";
import FileUpload from "@/components/admin/FileUpload";

export default function IdAndEscortCardManagementHub() {
  const { activeCampusId } = useCampusContext();
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"students" | "escorts" | "blocked" | "pickups">("students");

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

  // Add Escort Modal State
  const [selectedStudentForEscort, setSelectedStudentForEscort] = useState<any>(null);
  const [escortFullName, setEscortFullName] = useState("");
  const [escortRelation, setEscortRelation] = useState("Father");
  const [escortMobile, setEscortMobile] = useState("");
  const [escortPhoto, setEscortPhoto] = useState("");
  const [escortIdType, setEscortIdType] = useState("Aadhaar");
  const [escortIdNumber, setEscortIdNumber] = useState("");
  const [isPrimaryEscort, setIsPrimaryEscort] = useState(false);
  const [isSavingEscort, setIsSavingEscort] = useState(false);

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

  // 1-Click Generate Single Student ID Card
  async function handleGenerateSingleStudentCard(studentId: string) {
    setIsGenerating(true);
    const res = await generateStudentIdCard(studentId);
    if (res.success) {
      alert(res.message);
      await loadData();
    } else {
      alert("Error: " + res.error);
    }
    setIsGenerating(false);
  }

  // 1-Click Bulk Generate All Student ID Cards
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

  // Save Escort and Generate Escort Card for Student
  async function handleSaveEscort(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudentForEscort) return;

    setIsSavingEscort(true);
    try {
      const res = await addEscortToStudent({
        studentId: selectedStudentForEscort.id,
        fullName: escortFullName,
        relationship: escortRelation,
        mobile: escortMobile,
        photoUrl: escortPhoto,
        idProofType: escortIdType,
        idProofNumber: escortIdNumber,
        isPrimary: isPrimaryEscort
      });

      if (res.success) {
        alert(res.message);
        setSelectedStudentForEscort(null);
        setEscortFullName("");
        setEscortMobile("");
        setEscortPhoto("");
        setEscortIdNumber("");
        await loadData();
      } else {
        alert("Error saving escort: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSavingEscort(false);
    }
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

  // Dynamically extract unique classes
  const dynamicClasses = ["All Classes", ...Array.from(new Set(students.map(s => s.class_name).filter(Boolean)))];

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
              <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Vertical CR80 ID &amp; Escort Cards
            </span>
            <span className="bg-stone-100 text-stone-700 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border border-stone-300">
              54 mm × 85.6 mm (2.125&quot; × 3.375&quot;)
            </span>
            <span className="text-stone-500 text-xs font-bold">Session 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Student ID &amp; Escort Card Generator</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Generate printable vertical CR80 Student ID Cards and Multi-Escort Pickup Cards with security QR clearance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleGenerateAll}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-98"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? "Generating..." : "Generate All Student Cards"}
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
            <FileText className="w-3.5 h-3.5 text-amber-600" /> Temporary Pass
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase block">Enrolled Students</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">{students.length}</span>
          <span className="text-[10px] text-emerald-600 font-bold">Ready to Print</span>
        </div>

        <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] font-bold text-purple-800 uppercase block">Multi-Escort Cards</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">{studentEscortCards.length}</span>
          <span className="text-[10px] text-purple-600">All Escorts Mapped</span>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Active Gate Tokens</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{students.length * 2}</span>
          <span className="text-[10px] text-emerald-600">Scannable</span>
        </div>

        <div className="p-4 bg-red-50/70 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-[10px] font-bold text-red-800 uppercase block">Blocked / Lost</span>
          <span className="text-2xl font-black text-red-700 mt-1 block">{stats?.blockedCards || 1}</span>
          <span className="text-[10px] text-red-600 font-bold">QR Invalidated</span>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">Format</span>
          <span className="text-sm font-black text-amber-900 mt-2 block font-mono">Vertical CR80</span>
          <span className="text-[10px] text-amber-600">54 × 85.6 mm</span>
        </div>

        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-800 uppercase block">Today&apos;s Pickups</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{stats?.todayPickups || 1}</span>
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
            <User className="w-3.5 h-3.5" /> 📇 Generate Student ID Cards ({students.length})
          </button>

          <button
            onClick={() => setActiveTab("escorts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "escorts" ? "bg-stone-900 text-white shadow-sm" : "bg-stone-50 text-stone-600 hover:bg-stone-100"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> 🛡️ Generate Student Escort Cards ({studentEscortCards.length})
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

        {/* Tab 1: Student ID Cards Generator */}
        {activeTab === "students" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold text-stone-700"
                >
                  {dynamicClasses.map(c => <option key={c} value={c}>{c}</option>)}
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
                <Link
                  href={`/admin/id-cards/print-students?class=${encodeURIComponent(selectedClass)}`}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" /> Batch Print Vertical Cards (54×85.6mm)
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
                    <th className="p-3.5">Card Status</th>
                    <th className="p-3.5">Card Number</th>
                    <th className="p-3.5">QR Token</th>
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
                      <td className="p-3.5">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          ✓ Vertical Card Ready
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-stone-600 font-bold">{student.card_number}</td>
                      <td className="p-3.5 font-mono text-[10px] text-purple-700 bg-purple-50/50 px-2 py-0.5 rounded">
                        {student.qr_token.substring(0, 18)}...
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleGenerateSingleStudentCard(student.id)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-lg text-xs"
                          title="Regenerate QR Token"
                        >
                          Regenerate
                        </button>
                        <button
                          onClick={() => {
                            setPreviewCard({ ...student, type: 'Student' });
                            setPreviewSide('front');
                          }}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-2.5 py-1 rounded-lg text-xs"
                        >
                          Preview (54×85.6mm)
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

        {/* Tab 2: Student Escort Cards Generator (1 Student -> All Escorts) */}
        {activeTab === "escorts" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold text-stone-700"
                >
                  {dynamicClasses.map(c => <option key={c} value={c}>{c}</option>)}
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
                <Link
                  href={`/admin/id-cards/print-escorts?class=${encodeURIComponent(selectedClass)}`}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" /> Batch Print Escort Cards (54×85.6mm)
                </Link>
              </div>
            </div>

            {/* Student Escort Cards Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Student Ward</th>
                    <th className="p-3.5">Class &amp; Roll</th>
                    <th className="p-3.5">Authorized Pickup Persons</th>
                    <th className="p-3.5">Escort Card Status</th>
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
                      <td className="p-3.5">
                        <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          ✓ Vertical Escort Card
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedStudentForEscort(item)}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1 rounded-lg text-xs flex-inline items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3 inline mr-1" /> Add Escort
                        </button>
                        <button
                          onClick={() => {
                            setPreviewCard({ ...item, type: 'EscortCard' });
                            setPreviewSide('front');
                          }}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-2.5 py-1 rounded-lg text-xs"
                        >
                          Preview (54×85.6mm)
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

      {/* Modal 1: Add Authorized Escort to Student */}
      {selectedStudentForEscort && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">
                  Add Authorized Escort for {selectedStudentForEscort.first_name}
                </h3>
                <p className="text-xs text-stone-500">
                  Register father, mother, driver, grandparent, or nanny to child&apos;s master escort card.
                </p>
              </div>
              <button onClick={() => setSelectedStudentForEscort(null)} className="p-1 text-stone-400 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEscort} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-600 block mb-1">Escort Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={escortFullName}
                  onChange={e => setEscortFullName(e.target.value)}
                  className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-600 block mb-1">Relationship *</label>
                  <select
                    value={escortRelation}
                    onChange={e => setEscortRelation(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Driver">Driver</option>
                    <option value="Nanny">Nanny</option>
                    <option value="Uncle / Guardian">Uncle / Guardian</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-600 block mb-1">Contact Mobile *</label>
                  <input
                    required
                    type="text"
                    placeholder="+91 98100 XXXXX"
                    value={escortMobile}
                    onChange={e => setEscortMobile(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-600 block mb-1">ID Proof Type</label>
                  <select
                    value={escortIdType}
                    onChange={e => setEscortIdType(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Passport">Passport</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-600 block mb-1">ID Number (Last 4 Digits)</label>
                  <input
                    type="text"
                    placeholder="e.g. 8912"
                    value={escortIdNumber}
                    onChange={e => setEscortIdNumber(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl font-mono"
                  />
                </div>
              </div>

              <FileUpload
                label="Escort Photograph / Selfie"
                value={escortPhoto}
                onChange={setEscortPhoto}
                folder="escort_photos"
                mode="avatar"
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primary_escort"
                  checked={isPrimaryEscort}
                  onChange={e => setIsPrimaryEscort(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="primary_escort" className="text-stone-700 font-bold text-[11px]">
                  Set as Primary Pickup Person (e.g. Father/Mother)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForEscort(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEscort}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  {isSavingEscort ? "Saving..." : "Save & Generate Escort Card"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal 2: Card Preview Modal - Vertical CR80 Dimensions */}
      {previewCard && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-stone-900">
                    {previewCard.type === 'Student' ? 'Student ID Card Preview' : 'Student Escort Card Preview'}
                  </h3>
                  <span className="bg-purple-100 text-purple-900 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Vertical CR80 (54×85.6mm)
                  </span>
                </div>
                <p className="text-xs text-stone-500">Vertical Lanyard Form Factor</p>
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

            {/* Render Vertical CR80 Card Preview */}
            <div className="flex justify-center py-2">
              <div 
                className="border-2 border-stone-900 rounded-[3.18mm] bg-white shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden"
                style={{ width: "216px", height: "342px", boxSizing: "border-box" }}
              >
                {/* Subtle Watermark */}
                <div className="absolute inset-0 bg-radial-[at_50%_0%] from-amber-500/5 via-transparent to-purple-900/5 pointer-events-none"></div>

                {previewSide === 'front' ? (
                  /* Front Side (Vertical Premium) */
                  <>
                    {/* Header Banner */}
                    <div className="w-full bg-linear-to-r from-stone-900 via-indigo-950 to-stone-900 text-white px-2 pt-2 pb-1.5 shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded bg-linear-to-br from-amber-300 via-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-black text-[8px] shadow-xs shrink-0">
                            CBS
                          </div>
                          <div className="text-left leading-tight">
                            <h4 className="font-black text-[9px] text-white uppercase tracking-tight">Crayon Box</h4>
                            <p className="text-[6px] text-amber-300 font-bold uppercase tracking-wider">
                              {previewCard.type === 'Student' ? 'Student ID Card' : 'Escort Pass'}
                            </p>
                          </div>
                        </div>
                        <span className="bg-amber-400 text-stone-950 font-black text-[7px] px-1.5 py-0.2 rounded-full uppercase">
                          2026-27
                        </span>
                      </div>
                      <div className="w-full h-0.5 bg-linear-to-r from-amber-400/20 via-amber-400 to-amber-400/20 mt-1"></div>
                    </div>

                    {/* Photo Box */}
                    <div className="my-1 relative shrink-0">
                      <div className="w-22 h-26 rounded-lg border-2 border-stone-900 overflow-hidden bg-stone-100 flex items-center justify-center shadow-xs">
                        {previewCard.photo_url ? (
                          <img src={previewCard.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-stone-400" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 inset-x-0 flex justify-center">
                        <span className="bg-stone-900 text-amber-300 font-bold text-[6px] px-2 py-0.2 rounded-full uppercase tracking-wider border border-amber-400/50">
                          {previewCard.type === 'Student' ? 'STUDENT' : 'STUDENT WARD'}
                        </span>
                      </div>
                    </div>

                    {/* Info Details */}
                    <div className="w-full px-2 space-y-0.5 leading-tight">
                      <h4 className="font-black text-[11px] text-stone-900 uppercase truncate tracking-tight">
                        {previewCard.first_name} {previewCard.last_name || ''}
                      </h4>

                      <div>
                        <span className="inline-block bg-indigo-50 text-indigo-950 font-black px-2 py-0.5 rounded text-[8px] border border-indigo-200 uppercase">
                          {previewCard.class_name} • SEC {previewCard.section_name || 'A'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 bg-stone-50/90 rounded p-1 text-[7px] text-stone-700 border border-stone-200 text-left mt-0.5">
                        <div>
                          <span className="text-stone-400 block font-bold text-[6px]">ADMISSION NO</span>
                          <span className="font-mono font-black text-stone-900">{previewCard.admission_no}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block font-bold text-[6px]">ROLL / BLOOD</span>
                          <span className="font-bold text-stone-900">
                            #{previewCard.roll_no || '1'} • <span className="text-red-600 font-black">{previewCard.blood_group || 'O+'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Security Bar */}
                    <div className="w-full px-2 pb-1.5 pt-1 flex items-center justify-between border-t border-stone-200 shrink-0 bg-stone-50/50">
                      <div className="text-left text-[6px] text-stone-500 leading-tight">
                        <p className="font-black text-stone-800 uppercase">Main Campus</p>
                        <p className="text-emerald-700 font-bold text-[5.5px]">✓ Gate Verified</p>
                        <p className="text-stone-400 text-[5px]">Valid: 31 Mar 2027</p>
                      </div>

                      <div className="w-9 h-9 bg-white border border-stone-800 rounded p-0.5 shrink-0 flex items-center justify-center shadow-xs">
                        <QrCode className="w-6 h-6 text-stone-900" />
                      </div>
                    </div>
                  </>
                ) : (
                  /* Back Side (Vertical Premium) */
                  <>
                    {/* Header */}
                    <div className="w-full border-b border-stone-900 pb-1 text-center pt-2 px-2">
                      <h5 className="font-black text-[8px] text-stone-900 uppercase tracking-tight">
                        {previewCard.type === 'EscortCard' ? 'Authorized Pickup Escorts' : 'Emergency & Security Protocol'}
                      </h5>
                      <p className="text-[6px] font-mono text-purple-800 font-bold">{previewCard.card_number}</p>
                    </div>

                    {previewCard.type === 'EscortCard' && previewCard.escorts ? (
                      <div className="space-y-1 w-full px-2 py-1 flex-1">
                        {previewCard.escorts.slice(0, 4).map((e: any, idx: number) => (
                          <div key={idx} className="bg-stone-50/90 border border-stone-200 rounded p-1 flex items-center gap-1.5 text-left">
                            <div className="w-5 h-7 rounded border border-stone-300 overflow-hidden shrink-0 bg-white flex items-center justify-center shadow-xs">
                              {e.photo_url ? (
                                <img src={e.photo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-3 h-3 text-stone-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 leading-none text-[7px]">
                              <p className="font-black text-stone-900 truncate">{e.full_name}</p>
                              <span className="text-[6px] font-black text-purple-900 bg-purple-100 px-1 py-0.2 rounded inline-block mt-0.5 uppercase">
                                {e.relationship}
                              </span>
                              <p className="text-[6px] font-mono text-stone-600 truncate mt-0.5 font-bold">{e.mobile}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1 text-[7.5px] text-stone-600 flex-1 leading-tight py-1 text-left w-full px-2">
                        <div className="bg-stone-50 p-1.5 rounded border border-stone-200 space-y-0.5">
                          <p><span className="font-bold text-stone-400 text-[6px]">STUDENT:</span> <span className="font-black text-stone-900">{previewCard.first_name} {previewCard.last_name || ''}</span></p>
                          <p><span className="font-bold text-stone-400 text-[6px]">TRANSPORT:</span> <span className="font-bold text-stone-800">{previewCard.transport_route}</span></p>
                          <p><span className="font-bold text-stone-400 text-[6px]">HELPLINE:</span> <span className="font-mono font-bold text-stone-900">+91 98111 02008</span></p>
                        </div>
                        <p className="text-[6.5px] text-stone-500 pt-0.5">
                          1. This card must be worn by the student at all times during school &amp; transit.
                        </p>
                      </div>
                    )}

                    <div className="border-t border-stone-300 pt-1 pb-1 px-2 flex justify-between items-end text-[6.5px] w-full shrink-0">
                      <div className="text-left">
                        <span className="text-stone-900 font-black block text-[6px]">www.crayonboxschool.com</span>
                        <span className="text-stone-400 text-[5px]">Valid: 31 Mar 2027</span>
                      </div>
                      <div className="text-center shrink-0">
                        <div className="w-12 border-b border-stone-900 mb-0.5"></div>
                        <span className="font-bold text-stone-800 text-[5.5px] block uppercase">Principal</span>
                      </div>
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
