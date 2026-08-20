"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FilePlus, Users, User, Search, Plus, Trash2, CheckCircle2, 
  AlertCircle, ShieldCheck, DollarSign, Calendar, Clock, ArrowRight,
  Sparkles, RefreshCw, Layers, ShieldAlert, CheckSquare, Square,
  Filter, UserCheck, UserX, Info, Eye, Printer, Edit3, Save
} from "lucide-react";
import Link from "next/link";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  searchStudentsForFeeCollection, 
  generateIndividualInvoice, 
  generateBulkInvoices,
  getFeeHeads,
  saveFeeHead,
  getBulkTargetStudents
} from "@/app/actions/finance-core";
import { printIsolatedElement } from "@/lib/printUtils";

export default function GenerateInvoicesPage() {
  const { activeCampusId } = useCampusContext();
  const [activeTab, setActiveTab] = useState<"individual" | "bulk">("individual");

  // Common State
  const [billingPeriod, setBillingPeriod] = useState("Q1 (April-June 2026)");
  const [dueDate, setDueDate] = useState("2026-04-10");
  const [notes, setNotes] = useState("Regular term fee invoice");
  const [availableHeads, setAvailableHeads] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const previewPrintRef = useRef<HTMLDivElement>(null);

  // Fee Heads Management State
  const [headsModalOpen, setHeadsModalOpen] = useState(false);
  const [editingHead, setEditingHead] = useState<any>(null);
  const [headFormOpen, setHeadFormOpen] = useState(false);
  const [headFormData, setHeadFormData] = useState({
    id: "",
    name: "",
    code: "",
    category: "Academic",
    description: "",
    is_active: true
  });
  const [isSavingHead, setIsSavingHead] = useState(false);

  // Individual Form State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [invoiceItems, setInvoiceItems] = useState<Array<{
    fee_head_id: string;
    fee_head_name: string;
    base_amount: number;
    discount_amount: number;
  }>>([
    { fee_head_id: "", fee_head_name: "Tuition Fee", base_amount: 6500, discount_amount: 0 },
    { fee_head_id: "", fee_head_name: "Annual Charges", base_amount: 3000, discount_amount: 0 },
    { fee_head_id: "", fee_head_name: "Activity & Sports Fee", base_amount: 1000, discount_amount: 0 },
    { fee_head_id: "", fee_head_name: "Computer & AI Lab Fee", base_amount: 1000, discount_amount: 0 },
  ]);

  // Bulk Form State
  const [selectedClass, setSelectedClass] = useState("Grade 1");
  const [selectedSection, setSelectedSection] = useState("All");
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [bulkStudents, setBulkStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  useEffect(() => {
    loadFeeHeads();
  }, [activeCampusId]);

  useEffect(() => {
    if (activeTab === "bulk") {
      loadBulkStudents();
    }
  }, [activeCampusId, selectedClass, selectedSection, activeTab]);

  async function loadFeeHeads() {
    try {
      const res = await getFeeHeads(activeCampusId);
      if (res.success) {
        setAvailableHeads(res.data || []);
      }
    } catch (e) {
      console.error("Error loading fee heads:", e);
    }
  }

  function handleOpenAddHead() {
    setEditingHead(null);
    setHeadFormData({
      id: "",
      name: "",
      code: "",
      category: "Academic",
      description: "",
      is_active: true
    });
    setHeadFormOpen(true);
  }

  function handleOpenEditHead(head: any) {
    setEditingHead(head);
    setHeadFormData({
      id: head.id,
      name: head.name,
      code: head.code || head.name.slice(0, 3).toUpperCase(),
      category: head.category || "Academic",
      description: head.description || "",
      is_active: head.is_active ?? true
    });
    setHeadFormOpen(true);
  }

  async function handleSaveHead(e: React.FormEvent) {
    e.preventDefault();
    if (!headFormData.name.trim()) {
      alert("Please provide a Fee Head Name.");
      return;
    }

    setIsSavingHead(true);
    try {
      const res = await saveFeeHead({
        campus_id: activeCampusId,
        id: headFormData.id || undefined,
        name: headFormData.name.trim(),
        code: headFormData.code.trim().toUpperCase() || headFormData.name.slice(0, 3).toUpperCase(),
        category: headFormData.category,
        description: headFormData.description,
        is_active: headFormData.is_active
      });

      if (res.success) {
        alert(`🎉 Fee Head "${headFormData.name}" saved successfully!`);
        setHeadFormOpen(false);
        loadFeeHeads();
      } else {
        alert("Failed to save fee head: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSavingHead(false);
    }
  }

  function handleOpenPreview() {
    if (!selectedStudent) {
      setNotification({ type: "error", message: "Please search and select a student first to preview the invoice." });
      return;
    }
    if (selectedStudent.isEws) {
      setNotification({ 
        type: "error", 
        message: "❌ EWS / RTE students cannot be invoiced. Under Section 12(1)(c) of RTE Act, they are 100% fee-exempted." 
      });
      return;
    }
    if (invoiceItems.length === 0) {
      setNotification({ type: "error", message: "Please add at least one fee head to the invoice." });
      return;
    }
    setNotification(null);
    setPreviewModalOpen(true);
  }

  async function loadBulkStudents() {
    setIsLoadingStudents(true);
    try {
      const res = await getBulkTargetStudents(activeCampusId, selectedClass, selectedSection);
      if (res.success && res.data) {
        const studentList = res.data.students || [];
        setBulkStudents(studentList);
        setAvailableSections(res.data.available_sections || []);

        // By default, select all non-EWS students
        const nonEwsIds = studentList.filter((s: any) => !s.isEws).map((s: any) => s.id);
        setSelectedStudentIds(nonEwsIds);
      }
    } catch (e) {
      console.error("Error loading bulk target students:", e);
    } finally {
      setIsLoadingStudents(false);
    }
  }

  // Toggle individual student selection
  function handleToggleStudent(studentId: string, isEws: boolean) {
    if (isEws) return; // Cannot select EWS students
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  }

  // Select all non-EWS students
  function handleSelectAllNonEws() {
    const nonEwsIds = bulkStudents.filter((s: any) => !s.isEws).map((s: any) => s.id);
    setSelectedStudentIds(nonEwsIds);
  }

  // Deselect all students
  function handleDeselectAll() {
    setSelectedStudentIds([]);
  }

  async function handleStudentSearch(q: string) {
    setSearchQuery(q);
    if (!q || q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchStudentsForFeeCollection(activeCampusId, q);
      if (res.success) {
        setSearchResults(res.data || []);
      }
    } catch (e) {
      console.error("Search error:", e);
    }
  }

  function handleSelectStudent(st: any) {
    setSelectedStudent(st);
    setSearchResults([]);
    setSearchQuery(`${st.name} (${st.admissionNo})`);
    setNotification(null);
  }

  function handleAddItem() {
    setInvoiceItems([
      ...invoiceItems,
      { fee_head_id: "", fee_head_name: "Miscellaneous Fee", base_amount: 1000, discount_amount: 0 }
    ]);
  }

  function handleRemoveItem(index: number) {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  }

  function handleItemChange(index: number, field: string, value: any) {
    const updated = [...invoiceItems];
    (updated[index] as any)[field] = value;
    setInvoiceItems(updated);
  }

  const totalBaseAmount = invoiceItems.reduce((sum, it) => sum + Number(it.base_amount || 0), 0);
  const totalDiscountAmount = invoiceItems.reduce((sum, it) => sum + Number(it.discount_amount || 0), 0);
  const netPayableAmount = Math.max(0, totalBaseAmount - totalDiscountAmount);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  // Filtered student list for rendering in bulk table
  const filteredBulkStudents = bulkStudents.filter(s => {
    if (!studentSearchQuery.trim()) return true;
    const q = studentSearchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.admission_no.toLowerCase().includes(q);
  });

  const totalClassCount = bulkStudents.length;
  const nonEwsClassCount = bulkStudents.filter(s => !s.isEws).length;
  const ewsClassCount = bulkStudents.filter(s => s.isEws).length;
  const selectedCount = selectedStudentIds.length;

  async function handleGenerateIndividual(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) {
      setNotification({ type: "error", message: "Please search and select a student first." });
      return;
    }
    if (selectedStudent.isEws) {
      setNotification({ 
        type: "error", 
        message: "❌ Cannot generate fee invoice for EWS / RTE students. Under Section 12(1)(c) of RTE Act, EWS students are 100% fee-exempted." 
      });
      return;
    }
    if (invoiceItems.length === 0) {
      setNotification({ type: "error", message: "Please add at least one fee head item to the invoice." });
      return;
    }

    setIsProcessing(true);
    setNotification(null);

    try {
      const res = await generateIndividualInvoice({
        campus_id: activeCampusId,
        student_id: selectedStudent.id,
        billing_period: billingPeriod,
        due_date: dueDate,
        notes: notes,
        items: invoiceItems
      });

      if (res.success) {
        setNotification({
          type: "success",
          message: `🎉 Invoice #${res.data?.invoice_number} generated successfully for ${selectedStudent.name}! Net Demand: ${formatCurrency(netPayableAmount)}.`
        });
        setSelectedStudent(null);
        setSearchQuery("");
      } else {
        setNotification({ type: "error", message: res.error || "Failed to generate invoice." });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleGenerateBulk(e: React.FormEvent) {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      setNotification({ 
        type: "error", 
        message: "No students selected! Please check at least one student in the student list below." 
      });
      return;
    }

    setIsProcessing(true);
    setNotification(null);

    try {
      const res = await generateBulkInvoices({
        campus_id: activeCampusId,
        class_name: selectedClass,
        section_name: selectedSection,
        selected_student_ids: selectedStudentIds,
        billing_period: billingPeriod,
        due_date: dueDate,
        notes: notes
      });

      if (res.success) {
        setNotification({
          type: "success",
          message: res.message || `🎉 Bulk invoices generated successfully!`
        });
        loadBulkStudents();
      } else {
        setNotification({ type: "error", message: res.error || "Failed to generate bulk invoices." });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Invoice Generation Engine
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Academic Session 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Generate Fee Invoices</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Generate individual fee invoices with itemized head discounts or create batch invoices in bulk across classes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setHeadsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl transition border border-purple-200 shadow-xs"
          >
            <DollarSign className="w-3.5 h-3.5" /> Manage Fee Heads
          </button>
          <Link
            href="/admin/finance/invoices"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Layers className="w-3.5 h-3.5" /> View Invoices Hub
          </Link>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex gap-2 p-1.5 bg-stone-100 rounded-2xl max-w-md">
        <button
          onClick={() => { setActiveTab("individual"); setNotification(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition ${
            activeTab === "individual" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <User className="w-4 h-4" /> Individual Invoice
        </button>
        <button
          onClick={() => { setActiveTab("bulk"); setNotification(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition ${
            activeTab === "bulk" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Users className="w-4 h-4" /> Bulk Class Batch
        </button>
      </div>

      {/* Notification Message */}
      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* TAB 1: INDIVIDUAL INVOICE GENERATION */}
      {activeTab === "individual" && (
        <form onSubmit={handleGenerateIndividual} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Student Picker & Billing Metadata (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Student Search Box */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                1. Select Enrolled Student
              </h3>

              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by Name, Admission #, Class..."
                  value={searchQuery}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Dropdown Results */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-stone-100">
                    {searchResults.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handleSelectStudent(st)}
                        className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center text-xs transition"
                      >
                        <div>
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            {st.name}
                            {st.isEws && <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">EWS / RTE</span>}
                          </div>
                          <div className="text-[11px] text-stone-400">#{st.admissionNo} • {st.className}</div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600">Select</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Student Card */}
              {selectedStudent && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  selectedStudent.isEws ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-blue-50/70 border-blue-200"
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-stone-900 text-sm flex items-center gap-1.5">
                        {selectedStudent.name}
                        {selectedStudent.isEws && (
                          <span className="text-[9px] bg-emerald-200 text-emerald-900 font-black px-2 py-0.5 rounded">
                            EWS 100% Free Quota
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">#{selectedStudent.admissionNo} • {selectedStudent.className} Section {selectedStudent.sectionName}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => { setSelectedStudent(null); setSearchQuery(""); }}
                      className="text-stone-400 hover:text-stone-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {selectedStudent.isEws && (
                    <div className="pt-2 border-t border-emerald-200 text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      EWS / RTE students are 100% exempted under RTE Act. Invoices cannot be created.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Billing Cycle & Due Date */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                2. Billing Schedule
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Billing Period / Term</label>
                  <input
                    type="text"
                    value={billingPeriod}
                    onChange={(e) => setBillingPeriod(e.target.value)}
                    placeholder="e.g. Q1 (April-June 2026), Term 1, Annual"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Notes / Instructions</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Payment due by 10th of every quarter."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right: Itemized Fee Heads with Individual Discounts (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    3. Itemized Fee Heads & Individual Head Discounts
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Define base fees and student-specific discount for each fee head.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition border border-blue-200"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Head
                </button>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      <th className="pb-3 px-2">Fee Head Name</th>
                      <th className="pb-3 px-2 w-28">Base Amount (₹)</th>
                      <th className="pb-3 px-2 w-28 text-purple-700">Discount (₹)</th>
                      <th className="pb-3 px-2 w-24 text-right">Net Head</th>
                      <th className="pb-3 px-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {invoiceItems.map((item, idx) => {
                      const net = Math.max(0, Number(item.base_amount || 0) - Number(item.discount_amount || 0));
                      return (
                        <tr key={idx} className="group">
                          <td className="py-2.5 px-2">
                            <input
                              type="text"
                              value={item.fee_head_name}
                              onChange={(e) => handleItemChange(idx, "fee_head_name", e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 font-bold text-stone-900"
                              placeholder="e.g. Tuition Fee"
                              required
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              value={item.base_amount}
                              onChange={(e) => handleItemChange(idx, "base_amount", Number(e.target.value))}
                              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 font-black text-stone-900"
                              min="0"
                              required
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              value={item.discount_amount}
                              onChange={(e) => handleItemChange(idx, "discount_amount", Number(e.target.value))}
                              className="w-full bg-purple-50 border border-purple-200 rounded-xl px-2.5 py-1.5 font-bold text-purple-800"
                              min="0"
                              max={item.base_amount}
                            />
                          </td>
                          <td className="py-2.5 px-2 text-right font-black font-mono text-stone-800">
                            {formatCurrency(net)}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            {invoiceItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-stone-300 hover:text-red-600 transition p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Real-Time Total Calculations Breakdown */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Gross Invoice Total:</span>
                  <span className="font-bold text-stone-900">{formatCurrency(totalBaseAmount)}</span>
                </div>
                {totalDiscountAmount > 0 && (
                  <div className="flex justify-between text-purple-700 font-semibold">
                    <span>Total Individual Head Discounts:</span>
                    <span>- {formatCurrency(totalDiscountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-stone-200 pt-2 flex justify-between text-base font-black text-stone-900">
                  <span>Net Payable Amount:</span>
                  <span className="text-blue-600 font-mono">{formatCurrency(netPayableAmount)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  disabled={isProcessing || !selectedStudent || selectedStudent?.isEws}
                  className="flex-1 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-2xl transition border border-stone-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  Preview Final Invoice
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !selectedStudent || selectedStudent?.isEws}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FilePlus className="w-4 h-4" />
                  {isProcessing ? "Generating Invoice..." : `Generate Invoice (${formatCurrency(netPayableAmount)})`}
                </button>
              </div>
            </div>

          </div>

        </form>
      )}

      {/* TAB 2: BULK CLASS INVOICE GENERATION WITH SECTION & STUDENT SELECTION / OMISSION */}
      {activeTab === "bulk" && (
        <form onSubmit={handleGenerateBulk} className="space-y-6">
          
          {/* Top Controls Grid: Class, Section, Term, Due Date */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Bulk Class & Section Invoice Batch
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Filter by Class and Section, then selectively include or omit individual students before generating invoices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Class Selector */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">1. Target Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection("All");
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-bold text-stone-900"
                >
                  <option value="All">All School Classes</option>
                  <option value="Nursery">Nursery / Preschool</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              {/* Section Selector */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">2. Target Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-bold text-stone-900"
                >
                  <option value="All">All Sections</option>
                  {availableSections.map((sec) => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              {/* Billing Period */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">3. Billing Period</label>
                <input
                  type="text"
                  value={billingPeriod}
                  onChange={(e) => setBillingPeriod(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">4. Payment Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-semibold text-stone-900"
                  required
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-bold text-stone-700 block mb-1">Batch Run Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Q1 Term Fee Demand for Academic Year 2026-27"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-semibold text-stone-900"
              />
            </div>
          </div>

          {/* Student Selection & Omission Table Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
            
            {/* Top Table Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Select or Omit Students from Batch ({selectedCount} Selected / {nonEwsClassCount} Eligible)
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Check or uncheck individual students to include or exclude them from this batch invoice run.
                </p>
              </div>

              {/* Quick Select Buttons & Live Counters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter student list..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllNonEws}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition"
                >
                  Select All Non-EWS ({nonEwsClassCount})
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Live Badges Summary */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-xl font-bold">
                Total in Class/Section: {totalClassCount}
              </span>
              <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-xl font-bold">
                ✓ Included for Billing: {selectedCount}
              </span>
              <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-xl font-bold">
                ✗ Omitted from Batch: {nonEwsClassCount - selectedCount}
              </span>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                EWS 100% Free Quota: {ewsClassCount} (Exempted)
              </span>
            </div>

            {/* Students Table */}
            {isLoadingStudents ? (
              <div className="p-12 text-center text-stone-400 text-xs font-bold animate-pulse">
                Loading students for {selectedClass} ({selectedSection})...
              </div>
            ) : filteredBulkStudents.length === 0 ? (
              <div className="p-12 text-center text-stone-400 text-xs font-bold">
                No students found for the selected Class & Section filter.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-2xl border border-stone-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-12 text-center">Select</th>
                      <th className="p-3 w-28">Admission No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3 w-32">Class & Section</th>
                      <th className="p-3 w-36">Category / RTE Status</th>
                      <th className="p-3 w-28 text-right">Est. Demand</th>
                      <th className="p-3 w-32 text-center">Batch Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredBulkStudents.map((st) => {
                      const isSelected = selectedStudentIds.includes(st.id);
                      return (
                        <tr 
                          key={st.id} 
                          className={`transition ${
                            st.isEws 
                              ? "bg-emerald-50/40 text-stone-500" 
                              : isSelected 
                                ? "bg-blue-50/40 hover:bg-blue-50/70" 
                                : "hover:bg-stone-50 text-stone-400"
                          }`}
                        >
                          {/* Checkbox Column */}
                          <td className="p-3 text-center">
                            {st.isEws ? (
                              <input 
                                type="checkbox" 
                                disabled 
                                checked={false}
                                className="rounded border-stone-300 opacity-40 cursor-not-allowed" 
                              />
                            ) : (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleStudent(st.id, st.isEws)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-stone-300 cursor-pointer"
                              />
                            )}
                          </td>

                          {/* Admission No */}
                          <td className="p-3 font-mono font-bold text-stone-800">
                            {st.admission_no}
                          </td>

                          {/* Student Name */}
                          <td className="p-3">
                            <strong className={`${isSelected ? "text-stone-900" : "text-stone-600"}`}>
                              {st.name}
                            </strong>
                          </td>

                          {/* Class & Section */}
                          <td className="p-3 text-stone-600 font-semibold">
                            {st.class_name} - {st.section_name}
                          </td>

                          {/* Category / RTE Badge */}
                          <td className="p-3">
                            {st.isEws ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                <ShieldCheck className="w-3 h-3" /> 100% RTE Free
                              </span>
                            ) : (
                              <span className="bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                                {st.category} {st.concession_percentage > 0 ? `(${st.concession_percentage}% Disc)` : ''}
                              </span>
                            )}
                          </td>

                          {/* Estimated Net Demand */}
                          <td className="p-3 text-right font-mono font-bold">
                            {st.isEws ? (
                              <span className="text-emerald-700">₹0.00</span>
                            ) : (
                              <span className="text-stone-900">{formatCurrency(st.estimated_net)}</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="p-3 text-center">
                            {st.isEws ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Exempted (EWS)
                              </span>
                            ) : isSelected ? (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                                ✓ Included
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                                Omitted
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Batch Submission Bar */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <div className="text-sm font-black text-stone-900">
                  Ready to Generate Invoices for <span className="text-blue-600">{selectedCount}</span> Selected Students
                </div>
                <p className="text-xs text-stone-500">
                  Class: {selectedClass} • Section: {selectedSection} • Term: {billingPeriod}
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing || selectedCount === 0}
                className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-black text-sm rounded-2xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Users className="w-4 h-4" />
                {isProcessing ? "Processing Batch..." : `Generate ${selectedCount} Invoices Now`}
              </button>
            </div>

          </div>

        </form>
      )}

      {/* 👁️ HIGH-FIDELITY A5 INVOICE DEMAND NOTE PREVIEW MODAL */}
      {previewModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Live Preview
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">Invoice Demand Slip Preview</h3>
              </div>
              <button 
                onClick={() => setPreviewModalOpen(false)} 
                className="text-stone-400 hover:text-stone-900 font-bold"
              >
                ✕
              </button>
            </div>

            {/* A5 Printable Invoice Slip Container */}
            <div 
              ref={previewPrintRef} 
              className="bg-white p-6 rounded-2xl border border-stone-300 shadow-xs space-y-3.5 text-xs font-sans max-w-[148mm] mx-auto"
            >
              {/* School Header (Official details, no branch info) */}
              <div className="text-center border-b border-stone-200 pb-3 space-y-0.5">
                <h2 className="text-base font-black text-stone-900 tracking-tight uppercase">CRAYON BOX SCHOOL</h2>
                <p className="text-[10px] font-bold text-stone-700">
                  School ID: 1253481 • UDISE Code: 07124100151
                </p>
                <p className="text-[9.5px] text-stone-500">
                  Burari, Sant Nagar, Delhi - 110084 • Phone: 9811102008 • Email: crayonboxdelhi@gmail.com
                </p>
                <div className="pt-1.5 flex justify-center">
                  <span className="bg-stone-900 text-white font-black text-[10px] uppercase tracking-widest px-3 py-0.5 rounded">
                    FEE DEMAND INVOICE
                  </span>
                </div>
              </div>

              {/* Student & Invoice Meta Details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10.5px] bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                <div>
                  <span className="text-stone-400">Student Name:</span> <strong className="text-stone-900">{selectedStudent.name}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Admission No:</span> <strong className="text-stone-900 font-mono">{selectedStudent.admissionNo}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Class & Section:</span> <strong className="text-stone-900">{selectedStudent.className} {selectedStudent.sectionName}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Parent / Guardian:</span> <strong className="text-stone-900">{selectedStudent.parentName || 'Parent'}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Billing Period:</span> <strong className="text-stone-900 font-semibold">{billingPeriod}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Payment Due Date:</span> <strong className="text-red-700 font-bold">{dueDate}</strong>
                </div>
              </div>

              {/* Itemized Fee Breakdown Table */}
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-stone-100/70 text-stone-600 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-2">Fee Head</th>
                      <th className="p-2 text-right">Gross Amount</th>
                      <th className="p-2 text-right">Discount</th>
                      <th className="p-2 text-right">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {invoiceItems.map((item, idx) => {
                      const net = Math.max(0, Number(item.base_amount || 0) - Number(item.discount_amount || 0));
                      return (
                        <tr key={idx}>
                          <td className="p-2 font-semibold text-stone-800">{item.fee_head_name}</td>
                          <td className="p-2 text-right font-mono text-stone-600">{formatCurrency(item.base_amount)}</td>
                          <td className="p-2 text-right font-mono text-purple-700">
                            {item.discount_amount > 0 ? `- ${formatCurrency(item.discount_amount)}` : '—'}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-stone-900">{formatCurrency(net)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="border-t border-stone-200 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between text-stone-600">
                  <span>Gross Invoice Total:</span>
                  <span className="font-mono">{formatCurrency(totalBaseAmount)}</span>
                </div>
                {totalDiscountAmount > 0 && (
                  <div className="flex justify-between text-purple-700 font-semibold">
                    <span>Total Individual Head Discounts:</span>
                    <span className="font-mono">- {formatCurrency(totalDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-stone-900 pt-1.5 border-t border-dashed border-stone-200">
                  <span>Net Demand Payable:</span>
                  <span className="text-blue-600 font-mono">{formatCurrency(netPayableAmount)}</span>
                </div>
              </div>

              {/* Signatory & Notes */}
              <div className="flex justify-between items-end pt-1 text-[9.5px] text-stone-500">
                <div>
                  <p>Authorized Signatory: <strong className="text-stone-800">Accounts Department</strong></p>
                  <p className="italic text-stone-400">Payable online via parent portal or at reception fee counter.</p>
                </div>
                <div className="text-right font-mono text-[9px] text-stone-400">
                  DUE: {dueDate}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Back to Edit
              </button>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (previewPrintRef.current) {
                      printIsolatedElement(previewPrintRef.current, `Invoice-Preview-${selectedStudent.admissionNo}`);
                    } else {
                      window.print();
                    }
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Slip
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={async (e) => {
                    setPreviewModalOpen(false);
                    await handleGenerateIndividual(e as any);
                  }}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  {isProcessing ? "Generating..." : `Confirm & Generate Now (${formatCurrency(netPayableAmount)})`}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 📋 FEE HEADS MASTER MANAGEMENT MODAL */}
      {headsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Invoice Fee Heads Master
                </h3>
                <p className="text-xs text-stone-400">Add, edit, or configure recurring and one-time billing fee heads.</p>
              </div>
              <button 
                onClick={() => setHeadsModalOpen(false)} 
                className="text-stone-400 hover:text-stone-900 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Top Action */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-stone-500">
                Total Registered Fee Heads: {availableHeads.length}
              </span>
              <button
                type="button"
                onClick={handleOpenAddHead}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Fee Head
              </button>
            </div>

            {/* Fee Heads Table */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3 w-16">Code</th>
                    <th className="p-3">Head Name</th>
                    <th className="p-3 w-28">Category</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 w-16 text-center">Status</th>
                    <th className="p-3 w-16 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {availableHeads.map((head) => (
                    <tr key={head.id} className="hover:bg-stone-50/60 transition">
                      <td className="p-3 font-mono font-bold text-purple-800">
                        {head.code || head.name.slice(0, 3).toUpperCase()}
                      </td>
                      <td className="p-3 font-bold text-stone-900">
                        {head.name}
                      </td>
                      <td className="p-3">
                        <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {head.category || 'Academic'}
                        </span>
                      </td>
                      <td className="p-3 text-stone-500 text-[11px] truncate max-w-xs">
                        {head.description || '—'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                          head.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {head.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditHead(head)}
                          className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Head"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setHeadsModalOpen(false)}
                className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Fee Head Sub-Modal Form */}
      {headFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-600" />
                {editingHead ? "Edit Fee Head" : "Add New Fee Head"}
              </h3>
              <button onClick={() => setHeadFormOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveHead} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Fee Head Name *</label>
                <input
                  type="text"
                  value={headFormData.name}
                  onChange={(e) => setHeadFormData({ ...headFormData, name: e.target.value })}
                  placeholder="e.g. Science Lab Fee, Smart Class, Robotics"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Head Code</label>
                  <input
                    type="text"
                    value={headFormData.code}
                    onChange={(e) => setHeadFormData({ ...headFormData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SCI, ROB"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-purple-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category</label>
                  <select
                    value={headFormData.category}
                    onChange={(e) => setHeadFormData({ ...headFormData, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Auxiliary">Auxiliary</option>
                    <option value="Transport">Transport</option>
                    <option value="One-Time">One-Time</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  value={headFormData.description}
                  onChange={(e) => setHeadFormData({ ...headFormData, description: e.target.value })}
                  placeholder="e.g. Charges for specialized AI, coding & practicals"
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="head_is_active_gen"
                  checked={headFormData.is_active}
                  onChange={(e) => setHeadFormData({ ...headFormData, is_active: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded border-stone-300"
                />
                <label htmlFor="head_is_active_gen" className="font-bold text-stone-700 cursor-pointer">
                  Head is Active & Available for Invoicing
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setHeadFormOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingHead}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingHead ? "Saving..." : editingHead ? "Update Head" : "Create Head"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
