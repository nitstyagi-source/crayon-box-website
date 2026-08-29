"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FilePlus, Users, User, Search, Plus, Trash2, CheckCircle2, 
  AlertCircle, ShieldCheck, DollarSign, Calendar, Clock, ArrowRight,
  Sparkles, RefreshCw, Layers, ShieldAlert, CheckSquare, Square,
  Filter, UserCheck, UserX, Info, Eye, Printer, Edit3, Save
} from "lucide-react";
import Link from "next/link";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { 
  searchStudentsForFeeCollection, 
  generateIndividualInvoice, 
  generateBulkInvoices,
  getFeeHeads,
  saveFeeHead,
  getBulkTargetStudents
} from "@/app/actions/finance-core";
import { printIsolatedElement } from "@/lib/printUtils";

import { convertAmountToWords } from "@/lib/number-to-words";

export default function GenerateInvoicesPage() {
  const { currentInstitution } = useInstitution();
  const { selectedInstitutionObj } = useInstitution();
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
  const [individualClass, setIndividualClass] = useState("Grade 1");
  const [individualSection, setIndividualSection] = useState("All");
  const [individualClassStudents, setIndividualClassStudents] = useState<any[]>([]);
  const [isLoadingIndStudents, setIsLoadingIndStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [browseModalOpen, setBrowseModalOpen] = useState(false);
  const [browseSearchQuery, setBrowseSearchQuery] = useState("");
  const [browseClassFilter, setBrowseClassFilter] = useState("All");
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

  // Bulk Batch Customization & Preview State
  const [bulkPreviewModalOpen, setBulkPreviewModalOpen] = useState(false);
  const [bulkPreviewTab, setBulkPreviewTab] = useState<"heads" | "students" | "slip">("heads");
  const [bulkActiveStudentIndex, setBulkActiveStudentIndex] = useState(0);
  const bulkPrintRef = useRef<HTMLDivElement>(null);

  const [bulkBatchItems, setBulkBatchItems] = useState<Array<{
    fee_head_id: string;
    fee_head_name: string;
    base_amount: number;
    discount_amount: number;
  }>>([
    { fee_head_id: "", fee_head_name: "Tuition Fee", base_amount: 6500, discount_amount: 0 },
    { fee_head_id: "", fee_head_name: "Annual Charges", base_amount: 3000, discount_amount: 0 },
    { fee_head_id: "", fee_head_name: "Activity Fee", base_amount: 1000, discount_amount: 0 },
    { fee_head_id: "", fee_head_name: "Computer & AI Fee", base_amount: 1000, discount_amount: 0 },
  ]);

  const [bulkStudentOverrides, setBulkStudentOverrides] = useState<Record<string, { custom_discount: number; notes?: string }>>({});

  useEffect(() => {
    loadFeeHeads();
  }, [currentInstitution]);

  useEffect(() => {
    if (activeTab === "bulk") {
      loadBulkStudents();
      // Initialize default bulk items based on class
      let tuition = 6500;
      let annual = 3000;
      let activity = 1000;
      let lab = 1000;

      if (["Nursery", "LKG", "UKG"].includes(selectedClass)) {
        tuition = 5500; annual = 2500; activity = 1000; lab = 0;
      } else if (["Grade 3", "Grade 4"].includes(selectedClass)) {
        tuition = 7000; annual = 3500; activity = 1000; lab = 1000;
      } else if (selectedClass === "Grade 5") {
        tuition = 7500; annual = 3500; activity = 1200; lab = 1200;
      } else if (["Grade 6", "Grade 7", "Grade 8"].includes(selectedClass)) {
        tuition = 8500; annual = 4000; activity = 1200; lab = 1500;
      } else if (["Grade 9", "Grade 10"].includes(selectedClass)) {
        tuition = 9000; annual = 4500; activity = 1500; lab = 1800;
      } else if (["Grade 11", "Grade 12"].includes(selectedClass)) {
        tuition = 9500; annual = 5000; activity = 1500; lab = 2000;
      }

      const items = [
        { fee_head_id: "", fee_head_name: "Tuition Fee", base_amount: tuition, discount_amount: 0 },
        { fee_head_id: "", fee_head_name: "Annual Charges", base_amount: annual, discount_amount: 0 },
        { fee_head_id: "", fee_head_name: "Activity Fee", base_amount: activity, discount_amount: 0 },
      ];
      if (lab > 0) {
        items.push({ fee_head_id: "", fee_head_name: "Computer & AI Fee", base_amount: lab, discount_amount: 0 });
      }
      setBulkBatchItems(items);
    }
  }, [currentInstitution, selectedClass, selectedSection, activeTab]);

  useEffect(() => {
    if (activeTab === "individual") {
      loadIndividualStudents();
    }
  }, [currentInstitution, individualClass, individualSection, activeTab]);

  async function loadIndividualStudents() {
    setIsLoadingIndStudents(true);
    try {
      const res = await getBulkTargetStudents(currentInstitution, individualClass, individualSection);
      if (res.success && res.data) {
        setIndividualClassStudents(res.data.students || []);
      }
    } catch (e) {
      console.error("Error loading individual class students:", e);
    } finally {
      setIsLoadingIndStudents(false);
    }
  }

  async function loadFeeHeads() {
    try {
      const res = await getFeeHeads(currentInstitution);
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
        institution_code: currentInstitution,
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
      const res = await getBulkTargetStudents(currentInstitution, selectedClass, selectedSection);
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
      const res = await searchStudentsForFeeCollection(currentInstitution, q);
      if (res.success) {
        setSearchResults(res.data || []);
      }
    } catch (e) {
      console.error("Search error:", e);
    }
  }

  function handleSelectStudent(st: any) {
    const norm = {
      id: st.id,
      name: st.name || `${st.first_name || ''} ${st.last_name || ''}`.trim(),
      admissionNo: st.admissionNo || st.admission_no || st.enrollment_number || 'ADM-N/A',
      className: st.className || st.class_name || 'Grade 1',
      sectionName: st.sectionName || st.section_name || 'A',
      category: st.category || 'General',
      isEws: st.isEws || st.category === 'EWS',
      concessionType: st.concessionType || st.concession_type || (st.isEws ? '100% RTE Quota' : 'None'),
      concessionPct: Number(st.concessionPct || st.concession_percentage || 0),
      parentName: st.parentName || 'Guardian',
      parentMobile: st.parentMobile || '+91 9811102008',
      outstandingBalance: st.outstandingBalance !== undefined ? st.outstandingBalance : (st.estimated_net || 11500)
    };

    setSelectedStudent(norm);
    setSearchResults([]);
    setSearchQuery(`${norm.name} (${norm.admissionNo})`);
    setNotification(null);

    // Auto-populate itemized fee heads based on the student's class
    let tuition = 6500;
    let annual = 3000;
    let activity = 1000;
    let lab = 1000;
    const cls = norm.className;

    if (["Nursery", "Pre-Nursery", "LKG", "UKG"].includes(cls)) {
      tuition = 5500; annual = 2500; activity = 1000; lab = 0;
    } else if (["Grade 3", "Grade 4"].includes(cls)) {
      tuition = 7000; annual = 3500; activity = 1000; lab = 1000;
    } else if (cls === "Grade 5") {
      tuition = 7500; annual = 3500; activity = 1200; lab = 1200;
    } else if (["Grade 6", "Grade 7", "Grade 8"].includes(cls)) {
      tuition = 8500; annual = 4000; activity = 1200; lab = 1500;
    } else if (["Grade 9", "Grade 10"].includes(cls)) {
      tuition = 9000; annual = 4500; activity = 1500; lab = 1800;
    } else if (["Grade 11", "Grade 12"].includes(cls)) {
      tuition = 9500; annual = 5000; activity = 1500; lab = 2000;
    }

    const cPct = norm.concessionPct;
    const tuitionDisc = cPct > 0 ? Math.round((tuition * cPct) / 100) : 0;

    const items = [
      { fee_head_id: "", fee_head_name: "Tuition Fee", base_amount: tuition, discount_amount: tuitionDisc },
      { fee_head_id: "", fee_head_name: "Annual Charges", base_amount: annual, discount_amount: 0 },
      { fee_head_id: "", fee_head_name: "Activity & Sports Fee", base_amount: activity, discount_amount: 0 },
    ];
    if (lab > 0) {
      items.push({ fee_head_id: "", fee_head_name: "Computer & AI Lab Fee", base_amount: lab, discount_amount: 0 });
    }
    setInvoiceItems(items);
  }

  function handleSelectStudentById(studentId: string) {
    if (!studentId) {
      setSelectedStudent(null);
      return;
    }
    const found = individualClassStudents.find(s => s.id === studentId);
    if (found) {
      handleSelectStudent(found);
    }
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
        institution_code: currentInstitution,
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
    await handleConfirmAndGenerateBulkCustom();
  }

  function handleOpenBulkPreview() {
    if (selectedStudentIds.length === 0) {
      setNotification({ 
        type: "error", 
        message: "No students selected! Please check at least one student in the student list below to preview." 
      });
      return;
    }
    setBulkActiveStudentIndex(0);
    setBulkPreviewTab("heads");
    setBulkPreviewModalOpen(true);
  }

  function handleAddBulkBatchItem() {
    setBulkBatchItems([
      ...bulkBatchItems,
      { fee_head_id: "", fee_head_name: "Examination Fee", base_amount: 1000, discount_amount: 0 }
    ]);
  }

  function handleRemoveBulkBatchItem(index: number) {
    setBulkBatchItems(bulkBatchItems.filter((_, i) => i !== index));
  }

  function handleBulkBatchItemChange(index: number, field: string, value: any) {
    const updated = [...bulkBatchItems];
    (updated[index] as any)[field] = value;
    setBulkBatchItems(updated);
  }

  function handleBulkStudentOverrideChange(studentId: string, field: string, value: any) {
    setBulkStudentOverrides(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { custom_discount: 0, notes: "" }),
        [field]: value
      }
    }));
  }

  // Selected non-EWS students for bulk batch preview
  const selectedBulkStudentList = bulkStudents.filter(s => selectedStudentIds.includes(s.id) && !s.isEws);
  const currentPreviewBulkStudent = selectedBulkStudentList[bulkActiveStudentIndex] || selectedBulkStudentList[0];

  const getStudentNetDemand = (student: any) => {
    if (!student) return { base: 0, disc: 0, net: 0, items: [] };
    const concessionPct = Number(student.concession_percentage || 0);
    const extraDisc = Number(bulkStudentOverrides[student.id]?.custom_discount || 0);

    let totalBase = 0;
    let totalDisc = extraDisc;

    const items = bulkBatchItems.map(it => {
      const base = Number(it.base_amount || 0);
      let disc = Number(it.discount_amount || 0);
      if (concessionPct > 0 && disc === 0) {
        disc = Math.round((base * concessionPct) / 100);
      }
      totalBase += base;
      totalDisc += disc;
      return {
        ...it,
        calculated_discount: disc,
        net_head: Math.max(0, base - disc)
      };
    });

    const net = Math.max(0, totalBase - totalDisc);
    return { base: totalBase, disc: totalDisc, net, items };
  };

  const currentStudentCalculation = getStudentNetDemand(currentPreviewBulkStudent);

  const bulkTotalBase = bulkBatchItems.reduce((sum, it) => sum + Number(it.base_amount || 0), 0);
  const bulkTotalDiscount = bulkBatchItems.reduce((sum, it) => sum + Number(it.discount_amount || 0), 0);
  const bulkNetPerStudentDefault = Math.max(0, bulkTotalBase - bulkTotalDiscount);

  const bulkTotalBatchEstimatedDemand = selectedBulkStudentList.reduce((sum, st) => {
    return sum + getStudentNetDemand(st).net;
  }, 0);

  async function handleConfirmAndGenerateBulkCustom() {
    if (selectedStudentIds.length === 0) {
      alert("No students selected for invoice generation.");
      return;
    }
    if (bulkBatchItems.length === 0) {
      alert("Please ensure at least one fee head item is added to the batch.");
      return;
    }

    setIsProcessing(true);
    setNotification(null);

    try {
      const res = await generateBulkInvoices({
        institution_code: currentInstitution,
        class_name: selectedClass,
        section_name: selectedSection,
        selected_student_ids: selectedStudentIds,
        billing_period: billingPeriod,
        due_date: dueDate,
        notes: notes,
        custom_items: bulkBatchItems,
        student_overrides: bulkStudentOverrides
      });

      if (res.success) {
        setNotification({
          type: "success",
          message: res.message || `🎉 Bulk customized invoices generated successfully for ${selectedCount} students!`
        });
        setBulkPreviewModalOpen(false);
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
            
            {/* Student Selector Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  1. Select Enrolled Student
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setBrowseClassFilter(individualClass);
                    setBrowseSearchQuery("");
                    setBrowseModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Search className="w-3 h-3" /> Browse Roster
                </button>
              </div>

              {/* A. Class & Section Filter + Direct Student Name Dropdown */}
              <div className="p-3.5 bg-stone-50/80 rounded-2xl border border-stone-200/80 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-stone-600 block mb-1 text-[10.5px] uppercase tracking-wider">
                      Class Filter
                    </label>
                    <select
                      value={individualClass}
                      onChange={(e) => setIndividualClass(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800"
                    >
                      <option value="All">All Classes</option>
                      {['Pre-Nursery', 'Nursery', 'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-600 block mb-1 text-[10.5px] uppercase tracking-wider">
                      Section
                    </label>
                    <select
                      value={individualSection}
                      onChange={(e) => setIndividualSection(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800"
                    >
                      <option value="All">All Sections</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1 text-xs flex items-center justify-between">
                    <span>👤 Select Student Name</span>
                    {isLoadingIndStudents ? (
                      <span className="text-[10px] text-blue-600 font-mono flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Loading...
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400 font-mono">
                        {individualClassStudents.length} Students Available
                      </span>
                    )}
                  </label>
                  <select
                    value={selectedStudent?.id || ""}
                    onChange={(e) => handleSelectStudentById(e.target.value)}
                    className="w-full bg-white border border-blue-300 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 shadow-2xs cursor-pointer"
                  >
                    <option value="">-- Choose Student Name ({individualClassStudents.length}) --</option>
                    {individualClassStudents.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} (#{st.admission_no} • {st.class_name}{st.section_name ? `-${st.section_name}` : ''}) {st.isEws ? '⚠️ [EWS Quota]' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* B. Or Quick Live Search */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-500 block">
                  Or Quick Search by Name / Admission Number:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by student name or admission #..."
                    value={searchQuery}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <div className="text-[11px] text-stone-400">#{st.admissionNo} • {st.className} {st.sectionName ? `(${st.sectionName})` : ''}</div>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600">Select</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Student Card */}
              {selectedStudent && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                  selectedStudent.isEws ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-blue-50/70 border-blue-200 text-blue-950"
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                        {selectedStudent.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-stone-900 text-sm flex items-center gap-1.5">
                          {selectedStudent.name}
                          {selectedStudent.isEws && (
                            <span className="text-[9px] bg-emerald-200 text-emerald-900 font-black px-2 py-0.5 rounded">
                              EWS 100% Free Quota
                            </span>
                          )}
                          {!selectedStudent.isEws && selectedStudent.concessionPct > 0 && (
                            <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded border border-purple-200">
                              {selectedStudent.concessionType || `${selectedStudent.concessionPct}% Concession`}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          #{selectedStudent.admissionNo} • {selectedStudent.className} Section {selectedStudent.sectionName}
                        </p>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => { setSelectedStudent(null); setSearchQuery(""); }}
                      className="text-stone-400 hover:text-stone-700 font-bold p-1 rounded-lg hover:bg-stone-200/50"
                      title="Clear Selection"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200/60 text-[11px] text-stone-600">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Parent / Contact</span>
                      <span className="font-semibold text-stone-800">{selectedStudent.parentName} ({selectedStudent.parentMobile})</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Category</span>
                      <span className="font-semibold text-stone-800">{selectedStudent.category}</span>
                    </div>
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

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleOpenBulkPreview}
                  disabled={isProcessing || selectedCount === 0}
                  className="w-full sm:w-auto px-5 py-3.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-2xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Eye className="w-4 h-4 text-stone-950" />
                  Preview & Edit Batch Invoices
                </button>

                <button
                  type="submit"
                  disabled={isProcessing || selectedCount === 0}
                  className="w-full sm:w-auto px-7 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-black text-xs rounded-2xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Users className="w-4 h-4" />
                  {isProcessing ? "Processing Batch..." : `Generate ${selectedCount} Invoices Now`}
                </button>
              </div>
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
              className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-400 shadow-md mx-auto print:border-none print:shadow-none print:p-0 print:m-0 w-full max-w-[140mm] text-[10px] text-stone-800 font-sans leading-tight space-y-2.5"
            >
              {/* Print Specific CSS */}
              <style jsx global>{`
                @media print {
                  @page {
                    size: A5 portrait;
                    margin: 5mm;
                  }
                  body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                    background: white !important;
                  }
                }
              `}</style>

              {/* School Header Banner */}
              <div className="text-center border-b-2 border-stone-800 pb-2 space-y-0.5">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-sm sm:text-base font-black text-stone-900 tracking-tight uppercase">
                    {selectedInstitutionObj?.name || "CRAYON BOX SCHOOL"}
                  </h1>
                </div>
                <p className="text-[9px] font-bold text-stone-700">
                  {selectedInstitutionObj?.affiliation_number ? `Affiliation No: ${selectedInstitutionObj.affiliation_number}` : "School ID: 1253481 • UDISE Code: 07124100151"}
                </p>
                <p className="text-[8.5px] text-stone-500">
                  {selectedInstitutionObj?.address || "Burari, Sant Nagar, Delhi - 110084"} • Tel: {selectedInstitutionObj?.phone || "9811102008"} • Email: {selectedInstitutionObj?.email || "crayonboxdelhi@gmail.com"}
                </p>
                <div className="pt-1 flex justify-center items-center gap-2">
                  <span className="bg-stone-900 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded">
                    FEE DEMAND INVOICE
                  </span>
                  <span className="text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-300">
                    UNPAID DEMAND
                  </span>
                </div>
              </div>

              {/* Student & Invoice Meta Details */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-stone-50/80 p-2 rounded-xl border border-stone-200 text-[9.5px]">
                <div>
                  <span className="text-stone-500 font-medium">Student Name:</span> <strong className="text-stone-900">{selectedStudent.name}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Issue Date:</span> <strong className="text-stone-900">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Admission / Scholar No:</span> <strong className="text-stone-900 font-mono">{selectedStudent.admissionNo}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Payment Due Date:</span> <strong className="text-red-700 font-bold">{dueDate}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Class &amp; Section:</span> <strong className="text-stone-900">{selectedStudent.className} {selectedStudent.sectionName}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Parent / Guardian:</span> <strong className="text-stone-900">{selectedStudent.parentName || 'Parent'}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Billing Period:</span> <strong className="text-blue-900 font-semibold">{billingPeriod}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">Invoice Mode:</span> <strong className="text-stone-900">Individual Direct Demand</strong>
                </div>
              </div>

              {/* Itemized Fee Breakdown Table */}
              <div className="border border-stone-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[9px]">
                  <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-300">
                    <tr>
                      <th className="p-1.5 w-6 text-center">#</th>
                      <th className="p-1.5">Fee Head Particulars</th>
                      <th className="p-1.5 text-right w-18">Gross Amount</th>
                      <th className="p-1.5 text-right w-16">Discount</th>
                      <th className="p-1.5 text-right w-20">Net Payable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {invoiceItems.map((item, idx) => {
                      const base = Number(item.base_amount || 0);
                      const disc = Number(item.discount_amount || 0);
                      const net = Math.max(0, base - disc);
                      return (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="p-1.5 text-center text-stone-400 font-mono">{idx + 1}</td>
                          <td className="p-1.5 font-semibold text-stone-900">
                            {item.fee_head_name}
                          </td>
                          <td className="p-1.5 text-right font-mono text-stone-700">{formatCurrency(base)}</td>
                          <td className="p-1.5 text-right font-mono text-purple-800">
                            {disc > 0 ? `- ${formatCurrency(disc)}` : "—"}
                          </td>
                          <td className="p-1.5 text-right font-mono font-bold text-stone-900">{formatCurrency(net)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 space-y-1 text-[9.5px]">
                <div className="flex justify-between text-stone-600">
                  <span>Gross Invoice Total:</span>
                  <span className="font-mono font-bold text-stone-900">{formatCurrency(totalBaseAmount)}</span>
                </div>
                {totalDiscountAmount > 0 && (
                  <div className="flex justify-between text-purple-700 font-semibold">
                    <span>Authorized Concessions / Head Discounts:</span>
                    <span className="font-mono">- {formatCurrency(totalDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[11px] font-black text-stone-900 pt-1 border-t border-dashed border-stone-300">
                  <span className="uppercase">Net Balance Due / Payable:</span>
                  <span className="text-blue-700 font-mono text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {formatCurrency(netPayableAmount)}
                  </span>
                </div>
                <div className="text-[8.5px] italic text-stone-600 pt-0.5 border-t border-stone-100">
                  <strong>Amount in words:</strong> {convertAmountToWords(netPayableAmount)}
                </div>
              </div>

              {/* Bank & Payment Information */}
              <div className="grid grid-cols-2 gap-2 text-[8px] bg-blue-50/40 p-2 rounded-xl border border-blue-100 text-stone-600">
                <div>
                  <strong className="text-stone-900 block font-bold text-[8.5px]">🏦 Bank Transfer / Cheque Info:</strong>
                  <p>Bank: <strong>HDFC Bank Ltd</strong> • A/C: <strong>50200048192831</strong></p>
                  <p>IFSC: <strong>HDFC0001234</strong> • Branch: <strong>Sant Nagar Branch</strong></p>
                </div>
                <div>
                  <strong className="text-stone-900 block font-bold text-[8.5px]">📱 UPI / Online Portal:</strong>
                  <p>UPI ID: <strong>crayonbox.edu@hdfcbank</strong></p>
                  <p>Payable via Mobile Parent App or School Reception Counter.</p>
                </div>
              </div>

              {/* Signatory & Notes */}
              <div className="pt-2 flex justify-between items-end text-[8.5px] text-stone-500 border-t border-stone-200">
                <div className="space-y-0.5">
                  <p className="italic text-stone-400">* Cheques subject to realization. Quote Invoice No in all transfers.</p>
                  <p className="font-mono text-[7.5px] text-stone-400">Due Date: {dueDate}</p>
                </div>
                <div className="text-center">
                  <div className="h-6 border-b border-stone-400 w-28 mb-0.5"></div>
                  <strong className="text-stone-800 block text-[8.5px]">Accounts Officer / Principal</strong>
                  <span className="text-[7.5px] text-stone-400">Authorized Signature &amp; Stamp</span>
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

      {/* 👁️ BULK INVOICE BATCH INSPECTOR & PRE-GENERATION EDITOR MODAL */}
      {bulkPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
                    Pre-Generation Batch Inspector
                  </span>
                  <span className="text-xs text-stone-400">•</span>
                  <span className="text-xs font-bold text-stone-600">
                    {selectedClass} ({selectedSection}) • {billingPeriod}
                  </span>
                </div>
                <h3 className="text-xl font-black text-stone-900 mt-1">
                  Preview & Edit Batch Invoices ({selectedCount} Students)
                </h3>
                <p className="text-xs text-stone-400">
                  Customize fee heads, adjust individual student waivers, and inspect live A5 demand slips before generating the batch bills.
                </p>
              </div>
              <button 
                onClick={() => setBulkPreviewModalOpen(false)} 
                className="text-stone-400 hover:text-stone-900 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Sub-Tabs Switcher */}
            <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl w-fit text-xs">
              <button
                type="button"
                onClick={() => setBulkPreviewTab("heads")}
                className={`px-4 py-2 rounded-xl font-black transition ${
                  bulkPreviewTab === "heads" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                🎛️ 1. Batch Fee Heads ({bulkBatchItems.length})
              </button>
              <button
                type="button"
                onClick={() => setBulkPreviewTab("students")}
                className={`px-4 py-2 rounded-xl font-black transition ${
                  bulkPreviewTab === "students" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                👥 2. Student Waivers & Adjustments ({selectedBulkStudentList.length})
              </button>
              <button
                type="button"
                onClick={() => setBulkPreviewTab("slip")}
                className={`px-4 py-2 rounded-xl font-black transition ${
                  bulkPreviewTab === "slip" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                👁️ 3. A5 Demand Slip Navigator
              </button>
            </div>

            {/* SUB-TAB 1: BATCH FEE HEADS & LINE ITEMS EDITOR */}
            {bulkPreviewTab === "heads" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100">
                  <div className="text-xs text-blue-950">
                    <strong className="font-bold">Batch Template Rates:</strong> Adjust standard base charges and discounts applied to this class run.
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBulkBatchItem}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Fee Head
                  </button>
                </div>

                <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-3">Fee Head Name</th>
                        <th className="p-3 w-36">Base Amount (₹)</th>
                        <th className="p-3 w-36 text-purple-700">Default Discount (₹)</th>
                        <th className="p-3 w-28 text-right">Net per Head</th>
                        <th className="p-3 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {bulkBatchItems.map((item, idx) => {
                        const net = Math.max(0, Number(item.base_amount || 0) - Number(item.discount_amount || 0));
                        return (
                          <tr key={idx} className="hover:bg-stone-50/60 transition">
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={item.fee_head_name}
                                onChange={(e) => handleBulkBatchItemChange(idx, "fee_head_name", e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 font-bold text-stone-900"
                                required
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                value={item.base_amount}
                                onChange={(e) => handleBulkBatchItemChange(idx, "base_amount", Number(e.target.value))}
                                className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 font-mono font-bold text-stone-900"
                                min="0"
                                required
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                value={item.discount_amount}
                                onChange={(e) => handleBulkBatchItemChange(idx, "discount_amount", Number(e.target.value))}
                                className="w-full bg-purple-50 border border-purple-200 rounded-xl px-2.5 py-1.5 font-mono font-bold text-purple-800"
                                min="0"
                              />
                            </td>
                            <td className="p-2.5 text-right font-mono font-black text-stone-800">
                              {formatCurrency(net)}
                            </td>
                            <td className="p-2.5 text-center">
                              {bulkBatchItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBulkBatchItem(idx)}
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

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-stone-500 font-semibold">Standard Default Demand per Student:</span>
                    <div className="text-base font-black text-stone-900">
                      {formatCurrency(bulkNetPerStudentDefault)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-500 font-semibold">Total Batch Students Included:</span>
                    <div className="text-base font-black text-blue-600">
                      {selectedCount} Students
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: STUDENT CONCESSIONS & INDIVIDUAL OVERRIDES */}
            {bulkPreviewTab === "students" && (
              <div className="space-y-4">
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs text-stone-600">
                  You can specify custom discounts or additional waivers for specific students in this batch before generating invoices.
                </div>

                <div className="overflow-x-auto max-h-80 overflow-y-auto border border-stone-200 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200 sticky top-0 z-10">
                      <tr>
                        <th className="p-3 w-28">Admission No</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3 w-32">Class & Sec</th>
                        <th className="p-3 w-36">Profile Concession</th>
                        <th className="p-3 w-36 text-purple-700">Extra Waiver (₹)</th>
                        <th className="p-3 w-32 text-right">Net Demand</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedBulkStudentList.map((st) => {
                        const calc = getStudentNetDemand(st);
                        const currentExtra = bulkStudentOverrides[st.id]?.custom_discount ?? "";
                        return (
                          <tr key={st.id} className="hover:bg-stone-50/60 transition">
                            <td className="p-3 font-mono font-bold text-stone-800">{st.admission_no}</td>
                            <td className="p-3 font-bold text-stone-900">{st.name}</td>
                            <td className="p-3 text-stone-600">{st.class_name} ({st.section_name})</td>
                            <td className="p-3">
                              {st.concession_percentage > 0 ? (
                                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                  {st.concession_percentage}% Standard
                                </span>
                              ) : (
                                <span className="text-stone-400 text-[11px]">Regular (0%)</span>
                              )}
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                placeholder="0"
                                value={currentExtra}
                                onChange={(e) => handleBulkStudentOverrideChange(st.id, "custom_discount", Number(e.target.value))}
                                className="w-full bg-purple-50 border border-purple-200 rounded-xl px-2.5 py-1.5 font-mono font-bold text-purple-800"
                                min="0"
                              />
                            </td>
                            <td className="p-3 text-right font-mono font-black text-stone-900">
                              {formatCurrency(calc.net)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: A5 DEMAND SLIP LIVE NAVIGATOR */}
            {bulkPreviewTab === "slip" && currentPreviewBulkStudent && (
              <div className="space-y-4">
                {/* Navigator Header Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={bulkActiveStudentIndex <= 0}
                      onClick={() => setBulkActiveStudentIndex(prev => Math.max(0, prev - 1))}
                      className="px-3 py-1.5 bg-white border border-stone-200 text-stone-800 font-bold rounded-xl disabled:opacity-30 hover:bg-stone-100"
                    >
                      ← Prev
                    </button>
                    <select
                      value={bulkActiveStudentIndex}
                      onChange={(e) => setBulkActiveStudentIndex(Number(e.target.value))}
                      className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-900"
                    >
                      {selectedBulkStudentList.map((st, idx) => (
                        <option key={st.id} value={idx}>
                          Student {idx + 1} of {selectedBulkStudentList.length}: {st.name} ({st.admission_no})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={bulkActiveStudentIndex >= selectedBulkStudentList.length - 1}
                      onClick={() => setBulkActiveStudentIndex(prev => Math.min(selectedBulkStudentList.length - 1, prev + 1))}
                      className="px-3 py-1.5 bg-white border border-stone-200 text-stone-800 font-bold rounded-xl disabled:opacity-30 hover:bg-stone-100"
                    >
                      Next →
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (bulkPrintRef.current) {
                        printIsolatedElement(bulkPrintRef.current, `Invoice_Slip_${currentPreviewBulkStudent.admission_no}`);
                      } else {
                        window.print();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 font-bold rounded-xl shadow-xs transition"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print This Slip (A5)
                  </button>
                </div>

                {/* A5 Printable Invoice Slip Container */}
                <div 
                  ref={bulkPrintRef} 
                  className="bg-white p-6 rounded-2xl border border-stone-300 shadow-xs space-y-3.5 text-xs font-sans max-w-[148mm] mx-auto"
                >
                  {/* School Header (Official details, strictly no branch info) */}
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
                      <span className="text-stone-400">Student Name:</span> <strong className="text-stone-900">{currentPreviewBulkStudent.name}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400">Admission No:</span> <strong className="text-stone-900 font-mono">{currentPreviewBulkStudent.admission_no}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400">Class & Section:</span> <strong className="text-stone-900">{currentPreviewBulkStudent.class_name} {currentPreviewBulkStudent.section_name}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400">Parent / Guardian:</span> <strong className="text-stone-900">{currentPreviewBulkStudent.parent_name || 'Parent'}</strong>
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
                        {currentStudentCalculation.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-semibold text-stone-800">{item.fee_head_name}</td>
                            <td className="p-2 text-right font-mono text-stone-600">{formatCurrency(item.base_amount)}</td>
                            <td className="p-2 text-right font-mono text-purple-700">
                              {item.calculated_discount > 0 ? `- ${formatCurrency(item.calculated_discount)}` : '—'}
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-stone-900">{formatCurrency(item.net_head)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Breakdown */}
                  <div className="border-t border-stone-200 pt-2 space-y-1 text-[11px]">
                    <div className="flex justify-between text-stone-600">
                      <span>Gross Invoice Total:</span>
                      <span className="font-mono">{formatCurrency(currentStudentCalculation.base)}</span>
                    </div>
                    {currentStudentCalculation.disc > 0 && (
                      <div className="flex justify-between text-purple-700 font-semibold">
                        <span>Total Discounts & Waivers:</span>
                        <span className="font-mono">- {formatCurrency(currentStudentCalculation.disc)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-stone-900 pt-1.5 border-t border-dashed border-stone-200">
                      <span>Net Demand Payable:</span>
                      <span className="text-blue-600 font-mono">{formatCurrency(currentStudentCalculation.net)}</span>
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
              </div>
            )}

            {/* Modal Bottom Footer Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-stone-100">
              <div className="text-xs">
                <span className="text-stone-400 font-bold">Total Batch Net Demand: </span>
                <strong className="text-stone-900 font-mono text-sm">
                  {formatCurrency(bulkTotalBatchEstimatedDemand)}
                </strong>
                <span className="text-stone-400 ml-1">across {selectedCount} Students</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setBulkPreviewModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition"
                >
                  Back to Checklist
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndGenerateBulkCustom}
                  disabled={isProcessing || selectedCount === 0}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-black text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Users className="w-3.5 h-3.5" />
                  {isProcessing ? "Generating Invoices..." : `Confirm & Generate (${selectedCount}) Invoices`}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 BROWSE STUDENT DIRECTORY MODAL */}
      {browseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-blue-500/30">
                  Student Master Directory
                </span>
                <h3 className="text-lg font-black text-white mt-1">Select Student for Single Invoice</h3>
                <p className="text-xs text-stone-300">
                  Browse and pick any student to immediately populate their fee structure and invoice line items.
                </p>
              </div>
              <button 
                onClick={() => setBrowseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-64">
                <select
                  value={browseClassFilter}
                  onChange={(e) => {
                    setBrowseClassFilter(e.target.value);
                    setIndividualClass(e.target.value);
                  }}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800"
                >
                  <option value="All">All Classes ({individualClassStudents.length} Students)</option>
                  {['Pre-Nursery', 'Nursery', 'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by Student Name, Admission Number, Parent..."
                  value={browseSearchQuery}
                  onChange={(e) => setBrowseSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Student Table */}
            <div className="p-4 overflow-y-auto flex-1 text-xs">
              {(() => {
                const filtered = individualClassStudents.filter(s => {
                  if (browseClassFilter !== 'All' && s.class_name !== browseClassFilter) return false;
                  if (!browseSearchQuery.trim()) return true;
                  const q = browseSearchQuery.toLowerCase();
                  return (
                    s.name?.toLowerCase().includes(q) ||
                    s.admission_no?.toLowerCase().includes(q) ||
                    s.parent_name?.toLowerCase().includes(q) ||
                    s.class_name?.toLowerCase().includes(q)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center text-stone-400 space-y-2">
                      <User className="w-8 h-8 mx-auto text-stone-300" />
                      <p className="font-bold">No students found matching your filter.</p>
                      <p className="text-[11px]">Try switching classes or clearing search query.</p>
                    </div>
                  );
                }

                return (
                  <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                        <tr>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Admission #</th>
                          <th className="py-3 px-4">Class & Section</th>
                          <th className="py-3 px-4">Category / Concession</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-700">
                        {filtered.map((st) => (
                          <tr key={st.id} className="hover:bg-blue-50/50 transition">
                            <td className="py-3 px-4 font-bold text-stone-900 flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
                                {st.name.charAt(0)}
                              </div>
                              <div>
                                <span className="block font-bold">{st.name}</span>
                                {st.isEws && <span className="text-[9px] text-emerald-700 font-black">EWS 100% Free Quota</span>}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-stone-600">
                              #{st.admission_no}
                            </td>
                            <td className="py-3 px-4 font-semibold text-stone-800">
                              {st.class_name} {st.section_name ? `(${st.section_name})` : ''}
                            </td>
                            <td className="py-3 px-4">
                              {st.isEws ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                  EWS Exempt
                                </span>
                              ) : st.concession_percentage > 0 ? (
                                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                                  {st.concession_percentage}% Concession
                                </span>
                              ) : (
                                <span className="text-stone-400 text-[11px]">Regular</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  handleSelectStudent(st);
                                  setBrowseModalOpen(false);
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                              >
                                Select for Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <span className="text-stone-400 text-xs font-mono">Showing students for campus</span>
              <button
                type="button"
                onClick={() => setBrowseModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
