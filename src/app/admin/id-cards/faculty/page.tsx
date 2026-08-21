"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, Search, Filter, Plus, RefreshCw, Printer, 
  Download, Eye, CheckCircle2, XCircle, AlertTriangle, 
  ShieldAlert, ShieldCheck, Lock, Unlock, UserCheck, 
  UserX, Sparkles, Building2, Calendar, FileText, Layers, 
  Check, ArrowRight, RotateCw, Trash2, Phone, Mail, HelpCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useCampusContext } from "@/components/providers/CampusProvider";
import FacultyIdCardPreview, { FacultyCardData } from "@/components/ui/FacultyIdCardPreview";
import { 
  getFacultyForIdCardGeneration, 
  generateFacultyIdCards, 
  generateSingleFacultyIdCard,
  generateTemporaryFacultyCard,
  markCardLostAndIssueReplacement,
  updateFacultyCardStatus,
  markFacultyCardsPrinted
} from "@/app/actions/faculty-id-cards";

const DEPARTMENTS = [
  "All", "Academics", "Administration", "Science & Mathematics", 
  "Languages & Humanities", "Information Technology", 
  "Sports & Physical Ed", "Performing Arts", "Accounts & Finance", "Support & Transport"
];

const DESIGNATIONS = [
  "All", "Director & Managing Trustee", "Principal", "Vice Principal", 
  "Academic Coordinator", "PGT", "TGT", "PRT", "Pre-Primary Educator", 
  "Special Educator", "Lab Incharge", "Librarian", "IT Systems Lead", 
  "Admin Officer", "Accountant", "Receptionist", "Transport Lead", "Security Supervisor"
];

const SESSIONS = ["2026–27", "2025–26", "2027–28"];

export default function FacultyIdCreatorPage() {
  const { activeCampusId } = useCampusContext();
  const [facultyList, setFacultyList] = useState<FacultyCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filters State
  const [selectedSession, setSelectedSession] = useState("2026–27");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedDesignation, setSelectedDesignation] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<"Teaching" | "Leadership" | "Admin" | "Specialist" | "Support" | "Guest">("Teaching");

  // Selection State
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  // Modals
  const [previewFaculty, setPreviewFaculty] = useState<FacultyCardData | null>(null);
  const [previewBack, setPreviewBack] = useState(false);
  const [batchPrintOpen, setBatchPrintOpen] = useState(false);
  const [tempPassModalOpen, setTempPassModalOpen] = useState(false);
  const [lostCardModalOpen, setLostCardModalOpen] = useState(false);
  const [targetLostFaculty, setTargetLostFaculty] = useState<FacultyCardData | null>(null);
  const [lostReason, setLostReason] = useState("Reported Lost by Employee");

  // Temporary Pass Form State
  const [tempForm, setTempForm] = useState({
    fullName: "",
    organization: "Visiting Consultant",
    designation: "Guest Lecturer",
    department: "Special Programs",
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    authorizedBy: "Principal / Director",
    emergencyContact: "9811102008"
  });

  useEffect(() => {
    loadFaculty();
  }, [activeCampusId, selectedSession, selectedDepartment, selectedDesignation, selectedCategory, selectedStatus, searchQuery]);

  async function loadFaculty() {
    setIsLoading(true);
    try {
      const res = await getFacultyForIdCardGeneration(activeCampusId, {
        session: selectedSession,
        department: selectedDepartment,
        designation: selectedDesignation,
        category: selectedCategory,
        status: selectedStatus,
        search: searchQuery
      });

      if (res.success && res.data) {
        setFacultyList(res.data);
      }
    } catch (err) {
      console.error("Error loading faculty list:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Multi-select handlers
  function handleSelectAll() {
    if (selectedStaffIds.length === facultyList.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(facultyList.map(f => f.id));
    }
  }

  function handleToggleStaffSelect(id: string) {
    setSelectedStaffIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  // Bulk Generate Action
  async function handleBulkGenerate() {
    if (selectedStaffIds.length === 0) {
      alert("Please select at least one faculty member to generate ID cards.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await generateFacultyIdCards({
        staffIds: selectedStaffIds,
        academicSession: selectedSession,
        templateType: selectedTemplate,
        generatedBy: "Admin Portal"
      });

      if (res.success) {
        alert(res.message);
        loadFaculty();
        setSelectedStaffIds([]);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  // Single Generate Action
  async function handleSingleGenerate(staff: FacultyCardData) {
    setIsProcessing(true);
    try {
      const res = await generateSingleFacultyIdCard(staff.id, selectedSession, selectedTemplate);
      if (res.success) {
        alert(`ID Card generated successfully for ${staff.fullName}!`);
        loadFaculty();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  // Temporary Pass Submit
  async function handleCreateTempPass(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await generateTemporaryFacultyCard({
        ...tempForm,
        campusId: activeCampusId
      });
      if (res.success) {
        alert(res.message);
        setTempPassModalOpen(false);
        loadFaculty();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  // Mark Lost & Issue Replacement
  async function handleConfirmLostAndReplace() {
    if (!targetLostFaculty?.card?.id) return;
    setIsProcessing(true);
    try {
      const res = await markCardLostAndIssueReplacement(
        targetLostFaculty.id,
        targetLostFaculty.card.id,
        lostReason
      );
      if (res.success) {
        alert(res.message);
        setLostCardModalOpen(false);
        setTargetLostFaculty(null);
        loadFaculty();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  // Toggle Block / Invalidate Card
  async function handleToggleBlockCard(faculty: FacultyCardData) {
    if (!faculty.card?.id) return;
    const isCurrentlyActive = faculty.card.status === "Active";
    const targetStatus = isCurrentlyActive ? "Blocked" : "Active";
    const reason = isCurrentlyActive ? "Manually blocked by Admin" : undefined;

    if (!confirm(`Are you sure you want to ${isCurrentlyActive ? "BLOCK" : "ACTIVATE"} the ID card for ${faculty.fullName}?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await updateFacultyCardStatus(faculty.card.id, targetStatus, reason);
      if (res.success) {
        loadFaculty();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  // Batch Print Trigger
  function handleTriggerBatchPrint() {
    const idsToPrint = selectedStaffIds.length > 0 ? selectedStaffIds : facultyList.filter(f => f.card?.cardNumber).map(f => f.id);
    if (idsToPrint.length === 0) {
      alert("No active cards available to print. Please generate ID cards first.");
      return;
    }
    setBatchPrintOpen(true);
  }

  const selectedFacultyObjects = facultyList.filter(f => selectedStaffIds.includes(f.id));
  const printReadyList = (selectedStaffIds.length > 0 ? selectedFacultyObjects : facultyList).filter(f => f.computedCardStatus === "Active");

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-purple-600" /> Faculty Master Connected
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Zero Manual Re-Entry
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Faculty & Staff ID Card Creator
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Bulk and single digital ID card generator with dynamic role templates, secure QR code tokens, and lost card replacement lifecycle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setTempPassModalOpen(true)}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs rounded-2xl border border-purple-200 shadow-2xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-purple-600" /> Issue Guest Pass
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleTriggerBatchPrint}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Batch Sheet
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <Link href="/admin/id-cards" className="px-3 py-1.5 rounded-xl hover:text-stone-900 transition">
          🎒 Student ID Cards
        </Link>
        <Link href="/admin/id-cards/print-escorts" className="px-3 py-1.5 rounded-xl hover:text-stone-900 transition">
          🛡️ Parent & Escort Pickup Cards
        </Link>
        <Link href="/admin/id-cards/faculty" className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-950 font-black shadow-2xs">
          🪪 Faculty ID Creator
        </Link>
        <Link href="/admin/id-cards/gate-pickup" className="px-3 py-1.5 rounded-xl hover:text-stone-900 transition">
          📱 Gate QR Scanner
        </Link>
      </div>

      {/* Multi-Dimensional Filter Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          
          {/* Session Filter */}
          <div>
            <label className="font-bold text-stone-500 block mb-1 text-[11px]">Academic Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="font-bold text-stone-500 block mb-1 text-[11px]">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Designation Filter */}
          <div>
            <label className="font-bold text-stone-500 block mb-1 text-[11px]">Designation</label>
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="font-bold text-stone-500 block mb-1 text-[11px]">Staff Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="All">All Categories</option>
              <option value="Teaching">Teaching Faculty Only</option>
              <option value="Non-Teaching">Non-Teaching Staff</option>
              <option value="Leadership">Leadership & Management</option>
            </select>
          </div>

          {/* Card Status Filter */}
          <div>
            <label className="font-bold text-stone-500 block mb-1 text-[11px]">Card Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="All">All Statuses</option>
              <option value="Active">🟢 Active Cards</option>
              <option value="Pending">🟡 Pending Generation</option>
              <option value="Blocked">🔴 Blocked / Invalid</option>
              <option value="Resigned">⚫ Resigned Staff</option>
            </select>
          </div>

          {/* Role Template Selector */}
          <div>
            <label className="font-bold text-stone-500 block mb-1 text-[11px]">Card Template Preset</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as any)}
              className="w-full bg-purple-50 border border-purple-300 rounded-xl p-2 font-bold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="Teaching">Standard Teaching (Emerald)</option>
              <option value="Leadership">Leadership / Principal (Gold)</option>
              <option value="Admin">Admin & Accounts (Slate)</option>
              <option value="Specialist">IT & Lab Specialist (Cyan)</option>
              <option value="Support">Support & Driver (Amber)</option>
              <option value="Guest">Guest Faculty (Rose)</option>
            </select>
          </div>

        </div>

        {/* Search Bar & Action Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
          
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search faculty name, employee code, designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition"
            >
              {selectedStaffIds.length === facultyList.length && facultyList.length > 0 ? "Deselect All" : "Select All"}
            </button>

            <button
              type="button"
              disabled={isProcessing || selectedStaffIds.length === 0}
              onClick={handleBulkGenerate}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 ${
                selectedStaffIds.length > 0
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Generate Selected ({selectedStaffIds.length})
            </button>
          </div>

        </div>

      </div>

      {/* Faculty Master List Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <strong className="font-black text-stone-900 text-sm">
              Faculty Records ({facultyList.length})
            </strong>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500 font-mono">
              {selectedStaffIds.length} Selected for Bulk Action
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3" /> {facultyList.filter(f => f.computedCardStatus === "Active").length} Active Cards
            </span>
            <span className="flex items-center gap-1 text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-md">
              <AlertTriangle className="w-3 h-3" /> {facultyList.filter(f => f.computedCardStatus === "Pending").length} Pending
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedStaffIds.length === facultyList.length && facultyList.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </th>
                <th className="p-3.5">Faculty Member</th>
                <th className="p-3.5">Designation & Department</th>
                <th className="p-3.5">Employee ID</th>
                <th className="p-3.5">Contact & Blood Grp</th>
                <th className="p-3.5">Card Status</th>
                <th className="p-3.5 text-right">Card Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
                    Loading official faculty master records...
                  </td>
                </tr>
              ) : facultyList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    No faculty found matching the selected filters.
                  </td>
                </tr>
              ) : (
                facultyList.map((faculty) => {
                  const isSelected = selectedStaffIds.includes(faculty.id);
                  const isCardReady = !!faculty.card?.cardNumber;

                  return (
                    <tr key={faculty.id} className={`hover:bg-stone-50/70 transition ${isSelected ? "bg-purple-50/40" : ""}`}>
                      
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleStaffSelect(faculty.id)}
                          className="w-4 h-4 accent-purple-600 rounded"
                        />
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 border border-purple-200 flex items-center justify-center font-black shrink-0 overflow-hidden shadow-2xs">
                            {faculty.photoUrl ? (
                              <img src={faculty.photoUrl} alt={faculty.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span>{faculty.firstName.charAt(0)}{faculty.lastName?.charAt(0) || ""}</span>
                            )}
                          </div>
                          <div>
                            <strong className="text-stone-900 text-sm block">
                              {faculty.fullName}
                            </strong>
                            <span className="text-[10px] font-mono text-stone-400">
                              Joined: {faculty.joiningDate ? new Date(faculty.joiningDate).toLocaleDateString("en-IN") : "01/04/2020"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <strong className="text-stone-800 font-bold block">
                          {faculty.designation}
                        </strong>
                        <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">
                          {faculty.department}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-xs font-black text-stone-900">
                        {faculty.employeeCode || faculty.employeeId}
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5 text-[11px]">
                          <span className="font-mono text-stone-700 block">{faculty.phone}</span>
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded inline-block">
                            🩸 {faculty.bloodGroup || "O+"}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 w-fit ${
                          faculty.computedCardStatus === "Active"
                            ? "bg-emerald-100 text-emerald-900"
                            : faculty.computedCardStatus === "Blocked"
                            ? "bg-red-100 text-red-900"
                            : faculty.computedCardStatus === "Resigned"
                            ? "bg-stone-200 text-stone-700"
                            : "bg-amber-100 text-amber-900"
                        }`}>
                          {faculty.computedCardStatus === "Active" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {faculty.computedCardStatus === "Blocked" && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                          {faculty.computedCardStatus === "Pending" && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                          {faculty.computedCardStatus}
                        </span>
                        {faculty.card?.cardNumber && (
                          <span className="text-[9px] font-mono text-stone-400 block mt-0.5">
                            {faculty.card.cardNumber}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* 1. Preview 3D Card */}
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewFaculty(faculty);
                              setPreviewBack(false);
                            }}
                            className="p-2 bg-stone-100 hover:bg-purple-100 text-stone-700 hover:text-purple-900 rounded-xl transition"
                            title="Preview Front & Back ID Card"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. 1-Click Single ID Generate */}
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleSingleGenerate(faculty)}
                            className="p-2 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white rounded-xl transition"
                            title="Generate Individual Faculty ID"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>

                          {/* 3. Lost & Replace Action */}
                          {isCardReady && (
                            <button
                              type="button"
                              onClick={() => {
                                setTargetLostFaculty(faculty);
                                setLostCardModalOpen(true);
                              }}
                              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition"
                              title="Report Lost Card & Issue Replacement"
                            >
                              <RotateCw className="w-4 h-4" />
                            </button>
                          )}

                          {/* 4. Block / Toggle */}
                          {isCardReady && (
                            <button
                              type="button"
                              onClick={() => handleToggleBlockCard(faculty)}
                              className={`p-2 rounded-xl transition ${
                                faculty.card?.status === "Active"
                                  ? "bg-red-50 hover:bg-red-100 text-red-700"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                              }`}
                              title={faculty.card?.status === "Active" ? "Block / Invalidate ID" : "Reactivate ID"}
                            >
                              {faculty.card?.status === "Active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. INTERACTIVE PREVIEW & SINGLE PRINT MODAL */}
      {/* ========================================================================= */}
      {previewFaculty && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded">
                  Official Standard CR80 Card Preview
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">
                  {previewFaculty.fullName} — Faculty ID Card
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFaculty(null)}
                className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 hover:text-stone-900 transition"
              >
                ✕
              </button>
            </div>

            {/* Live Interactive Card Component (Front and Back) */}
            <div className="flex justify-center p-4 bg-stone-100 rounded-3xl overflow-x-auto">
              <FacultyIdCardPreview
                faculty={previewFaculty}
                template={selectedTemplate}
                showBack={previewBack}
              />
            </div>

            {/* Action Bottom Strip */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-stone-100 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl shadow-xs transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print High-Res Card (CR80)
                </button>
                <button
                  type="button"
                  onClick={() => handleSingleGenerate(previewFaculty)}
                  className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-2xl border border-purple-200 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh / Re-Generate Token
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewFaculty(null)}
                className="px-4 py-2 text-stone-500 hover:text-stone-800 font-bold"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TEMPORARY / GUEST FACULTY ID PASS MODAL */}
      {/* ========================================================================= */}
      {tempPassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded">
                  Time-Limited Authorization
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">
                  Issue Temporary / Guest Faculty Pass
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTempPassModalOpen(false)}
                className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 hover:text-stone-900 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTempPass} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Alok Kumar"
                  value={tempForm.fullName}
                  onChange={(e) => setTempForm({ ...tempForm, fullName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Organization / Department</label>
                  <input
                    type="text"
                    value={tempForm.organization}
                    onChange={(e) => setTempForm({ ...tempForm, organization: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Designation / Role *</label>
                  <input
                    type="text"
                    required
                    value={tempForm.designation}
                    onChange={(e) => setTempForm({ ...tempForm, designation: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Valid From *</label>
                  <input
                    type="date"
                    required
                    value={tempForm.validFrom}
                    onChange={(e) => setTempForm({ ...tempForm, validFrom: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Valid Until (Auto-Expires) *</label>
                  <input
                    type="date"
                    required
                    value={tempForm.validUntil}
                    onChange={(e) => setTempForm({ ...tempForm, validUntil: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Authorized By *</label>
                <input
                  type="text"
                  required
                  value={tempForm.authorizedBy}
                  onChange={(e) => setTempForm({ ...tempForm, authorizedBy: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTempPassModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Issue Temporary Pass
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REPORT LOST & ISSUE REPLACEMENT MODAL */}
      {/* ========================================================================= */}
      {lostCardModalOpen && targetLostFaculty && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center">
              <RotateCw className="w-6 h-6 animate-spin" />
            </div>

            <div>
              <h3 className="text-lg font-black text-stone-900">
                Issue Replacement ID Card
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                This will permanently <strong>BLOCK</strong> card <strong>{targetLostFaculty.card?.cardNumber}</strong> and issue a brand-new card with updated QR security token and incremented reprint count.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Reason for Replacement</label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                >
                  <option value="Reported Lost by Employee">Reported Lost by Employee</option>
                  <option value="Card Damaged / Worn Out">Card Damaged / Worn Out</option>
                  <option value="Designation / Department Change">Designation / Department Change</option>
                  <option value="Correction in Personal Information">Correction in Personal Information</option>
                </select>
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-[11px] space-y-1 font-mono">
                <div>Faculty: <strong>{targetLostFaculty.fullName}</strong></div>
                <div>Current Card: <span className="text-red-600 font-bold">{targetLostFaculty.card?.cardNumber}</span></div>
                <div>Reprint Count: <strong>{(targetLostFaculty.card?.reprintCount || 0) + 1}</strong></div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setLostCardModalOpen(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmLostAndReplace}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs"
              >
                Block Old & Issue Replacement
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BATCH PRINT SHEET VIEW */}
      {/* ========================================================================= */}
      {batchPrintOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 overflow-y-auto">
          <div className="w-full max-w-5xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex justify-between items-center border-b border-stone-200 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded">
                  High-Definition Batch Print Sheet
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">
                  Faculty ID Cards Print Batch ({printReadyList.length} Cards Ready)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    markFacultyCardsPrinted(printReadyList.map(f => f.card?.id).filter(Boolean) as string[]);
                    window.print();
                  }}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print All ({printReadyList.length})
                </button>

                <button
                  type="button"
                  onClick={() => setBatchPrintOpen(false)}
                  className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center p-4 bg-stone-50 rounded-3xl">
              {printReadyList.map((faculty) => (
                <div key={faculty.id} className="p-2 bg-white rounded-2xl border border-stone-300 shadow-sm">
                  <FacultyIdCardPreview
                    faculty={faculty}
                    template={selectedTemplate}
                    isPrintMode={true}
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
