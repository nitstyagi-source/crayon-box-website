"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Receipt, Search, Filter, Printer, AlertTriangle, 
  CheckCircle2, XCircle, RefreshCw, Eye, QrCode, ShieldAlert,
  ArrowRightLeft, FileText, Ban, Edit3, Settings2, Save, X,
  Building2, User, CreditCard, Sparkles, Check, FileCheck, Layers
} from "lucide-react";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { 
  getOfficialReceipts, 
  cancelFeeReceipt,
  updateFeeReceiptAction,
  getReceiptTemplateSettingsAction,
  saveReceiptTemplateSettingsAction,
  ReceiptTemplateSettings
} from "@/app/actions/finance-core";
import { printIsolatedElement } from "@/lib/printUtils";


export default function OfficialReceiptsHubPage() {
  const { currentInstitution } = useInstitution();
  const { selectedInstitutionObj } = useInstitution();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // View Modal State
  const [viewReceipt, setViewReceipt] = useState<any>(null);

  // Edit Receipt Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [editTab, setEditTab] = useState<"student" | "payment" | "financials">("student");

  // Letterhead & Template Settings State
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [templateSettings, setTemplateSettings] = useState<ReceiptTemplateSettings>({
    institution_name: selectedInstitutionObj?.name || "EDUCATIONAL INSTITUTION",
    affiliation_number: selectedInstitutionObj?.affiliationNumber || "CBSE/AFF",
    school_id: selectedInstitutionObj?.code || "SCH-01",
    udise_code: selectedInstitutionObj?.udiseCode || "07124100151",
    contact_phone: selectedInstitutionObj?.phone || "9811102008",
    contact_email: selectedInstitutionObj?.principalEmail || "accounts@school.edu.in",
    address: selectedInstitutionObj?.address || "Main Campus, Delhi NCR",
    receipt_title: "FEE RECEIPT",
    sub_title: "Recognized & Registered Institution • Quality Education Foundation",
    default_signatory: "Accounts Counter",
    terms_and_conditions: "1. Fees once paid is non-refundable. 2. Cheques are subject to realization. 3. Please retain this receipt for year-end tax and verification purposes.",
    footer_disclaimer: "This is a computer-generated fee receipt and does not require a physical seal unless explicitly requested.",
    show_qr_verification: true,
    copies_format: "A5_SINGLE"
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Cancellation State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedCancelReceipt, setSelectedCancelReceipt] = useState<any>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);

  const printModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReceipts();
    loadTemplateSettings();
  }, [currentInstitution, selectedMode, selectedStatus]);

  async function loadReceipts() {
    setIsLoading(true);
    try {
      const res = await getOfficialReceipts(currentInstitution, {
        payment_mode: selectedMode,
        status: selectedStatus,
        search: searchQuery
      });
      if (res.success) {
        setReceipts(res.data || []);
      }
    } catch (e) {
      console.error("Error loading receipts:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadTemplateSettings() {
    try {
      const res = await getReceiptTemplateSettingsAction(currentInstitution);
      if (res.success && res.data) {
        setTemplateSettings(res.data);
      }
    } catch (e) {
      console.error("Error loading template settings:", e);
    }
  }

  // Open Edit Modal
  function handleOpenEdit(r: any) {
    setEditFormData({
      receiptId: r.id,
      receipt_no: r.receipt_no,
      student_name: r.student_name || "",
      admission_no: r.admission_no || "",
      class_name: r.class_name || "Grade 1",
      section_name: r.section_name || "A",
      parent_name: r.parent_name || "",
      receipt_date: r.receipt_date || new Date().toISOString().split('T')[0],
      payment_mode: r.payment_mode || "Cash",
      transaction_ref: r.transaction_ref || "",
      bank_name: r.bank_name || "",
      collected_by: r.collected_by || templateSettings.default_signatory || "LAXMI (2026-2027)",
      total_amount_due: Number(r.total_amount_due || 0),
      concession_amount: Number(r.concession_amount || r.discount_amount || 0),
      late_fee_amount: Number(r.late_fee_amount || 0),
      net_amount_paid: Number(r.net_amount_paid || 0),
      remaining_balance: Number(r.remaining_balance || 0),
      billing_period: r.billing_period || "May-Jun",
      notes: r.notes || "",
      audit_reason: ""
    });
    setEditTab("student");
    setEditModalOpen(true);
  }

  // Save Edited Receipt Information
  async function handleSaveReceiptEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editFormData.receiptId) return;

    setIsUpdating(true);
    try {
      const res = await updateFeeReceiptAction(editFormData);
      if (res.success) {
        setEditModalOpen(false);
        if (viewReceipt && viewReceipt.id === editFormData.receiptId) {
          setViewReceipt({ ...viewReceipt, ...res.data });
        }
        loadReceipts();
      } else {
        alert("Update failed: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  }

  // Save Letterhead & Template Settings
  async function handleSaveTemplateSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await saveReceiptTemplateSettingsAction({
        institution_code: currentInstitution,
        settings: templateSettings
      });
      if (res.success) {
        setSettingsModalOpen(false);
      } else {
        alert("Failed to save template settings: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  }

  // Safe Cancellation
  function handleOpenCancel(r: any) {
    setSelectedCancelReceipt(r);
    setCancellationReason("");
    setCancelModalOpen(true);
  }

  async function handleConfirmCancellation(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCancelReceipt) return;
    if (!cancellationReason.trim()) {
      alert("Please provide a cancellation reason for financial audit.");
      return;
    }

    setIsProcessingCancel(true);
    try {
      const res = await cancelFeeReceipt(selectedCancelReceipt.id, cancellationReason, 'Chief Accountant');
      if (res.success) {
        setCancelModalOpen(false);
        setSelectedCancelReceipt(null);
        if (viewReceipt && viewReceipt.id === selectedCancelReceipt.id) {
          setViewReceipt(null);
        }
        loadReceipts();
      } else {
        alert("Cancellation failed: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessingCancel(false);
    }
  }

  function handlePrintReceipt() {
    if (printModalRef.current) {
      printIsolatedElement(printModalRef.current, `Fee-Receipt-${viewReceipt?.receipt_no || 'Slip'}`);
    } else {
      window.print();
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const paymentModes = ["All", "Cash", "UPI (QR Scan)", "Net Banking", "Cheque / DD", "Card (POS)", "Razorpay Gateway"];
  const classesList = ["NUR", "KG", "LKG", "UKG", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans p-4 sm:p-6 lg:p-8">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-stone-900 text-amber-400 rounded-2xl">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight">
                  Official Fee Receipts Hub
                </h1>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                  ERP v2.4 Live
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Issue, edit, correct, print, and audit official school fee receipts with customizable letterheads and multi-copy vouchers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Letterhead & Template Settings Trigger */}
          <button
            type="button"
            onClick={() => setSettingsModalOpen(true)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold py-2.5 px-4 rounded-xl border border-indigo-200 transition flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Settings2 className="w-4 h-4 text-indigo-600" />
            <span>Receipt Header &amp; Template</span>
          </button>

          <button
            type="button"
            onClick={loadReceipts}
            className="bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 px-4 rounded-xl border border-stone-800 transition flex items-center gap-1.5 text-xs shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Receipts</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5 flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search receipt #, student name, admission no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadReceipts()}
              className="bg-transparent text-xs font-medium text-stone-900 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs font-bold text-stone-500">Mode:</span>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
            >
              {paymentModes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs font-bold text-stone-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Cancelled">Cancelled Only</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-bold text-stone-500">
          Showing <strong className="text-stone-900">{receipts.length}</strong> official receipts
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-xs font-bold text-stone-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            <p>Loading fee receipts register...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="p-16 text-center text-xs text-stone-400 space-y-2">
            <Receipt className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="font-bold text-stone-700">No receipts found matching filters</p>
            <p className="text-stone-500">Try adjusting your search criteria or date filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-100 text-stone-700 text-[10px] font-black uppercase tracking-wider border-b border-stone-200">
                  <th className="p-3 whitespace-nowrap">Receipt No</th>
                  <th className="p-3 whitespace-nowrap">Date</th>
                  <th className="p-3 whitespace-nowrap">Student Name</th>
                  <th className="p-3 whitespace-nowrap">Adm No</th>
                  <th className="p-3 whitespace-nowrap">Class &amp; Sec</th>
                  <th className="p-3 whitespace-nowrap">Mode / Bank</th>
                  <th className="p-3 whitespace-nowrap">Cashier / Staff</th>
                  <th className="p-3 whitespace-nowrap text-right">Amount Paid</th>
                  <th className="p-3 whitespace-nowrap text-center">Status</th>
                  <th className="p-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50 transition">
                    <td className="p-3 font-mono font-bold text-stone-900 whitespace-nowrap">{r.receipt_no}</td>
                    <td className="p-3 font-mono text-stone-600 whitespace-nowrap">{r.receipt_date}</td>
                    <td className="p-3 font-bold text-stone-950 whitespace-nowrap">{r.student_name}</td>
                    <td className="p-3 font-mono text-stone-600 whitespace-nowrap">{r.admission_no || '-'}</td>
                    <td className="p-3 font-semibold text-stone-700 whitespace-nowrap">{r.class_name} {r.section_name}</td>
                    <td className="p-3 text-stone-700 whitespace-nowrap">
                      <span className="font-bold text-stone-900">{r.payment_mode}</span>
                      {r.transaction_ref && <span className="text-[10px] text-stone-400 block font-mono">Ref: {r.transaction_ref}</span>}
                    </td>
                    <td className="p-3 text-stone-600 whitespace-nowrap">{r.collected_by || 'Accounts Desk'}</td>
                    <td className="p-3 text-right font-mono font-black text-emerald-700 whitespace-nowrap">
                      {formatCurrency(r.net_amount_paid)}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        r.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {r.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewReceipt(r)}
                          title="View & Print Receipt"
                          className="p-1.5 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(r)}
                          title="Edit Information in Receipt"
                          className="p-1.5 hover:bg-indigo-100 text-indigo-700 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {r.status !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleOpenCancel(r)}
                            title="Cancel / Reverse Receipt"
                            className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW & PRINT RECEIPT MODAL (Supports Multi-Copy Format) */}
      {/* ========================================================================= */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            
            {/* Modal Top Bar */}
            <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-stone-900 text-amber-400 rounded-xl">
                  <Receipt className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">Official Receipt #{viewReceipt.receipt_no}</h3>
                  <p className="text-[10.5px] text-stone-400">Issued to {viewReceipt.student_name} on {viewReceipt.receipt_date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(viewReceipt)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Info
                </button>
                <button 
                  onClick={() => setViewReceipt(null)} 
                  className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="p-6 overflow-y-auto flex-1 bg-stone-100/50">
              <div ref={printModalRef} className="space-y-6">
                
                {/* Render Receipt Copy (Student Copy / School Copy based on copies_format) */}
                {['STUDENT COPY', ...(templateSettings.copies_format === 'A4_DOUBLE' ? ['OFFICE COPY'] : templateSettings.copies_format === 'A4_TRIPLICATE' ? ['OFFICE COPY', 'BANK COPY'] : [])].map((copyTitle, copyIdx) => (
                  <div 
                    key={copyTitle} 
                    className={`bg-white p-6 rounded-2xl border border-stone-300 shadow-xs space-y-4 text-xs ${
                      copyIdx > 0 ? 'border-t-2 border-dashed border-stone-400 pt-6 mt-6' : ''
                    }`}
                  >
                    {/* Letterhead */}
                    <div className="text-center border-b border-stone-200 pb-3 space-y-0.5">
                      <h2 className="text-base font-black text-stone-950 uppercase tracking-tight">
                        {templateSettings.institution_name}
                      </h2>
                      <p className="text-[10px] font-bold text-stone-700">
                        {templateSettings.sub_title} • {templateSettings.affiliation_number ? `Affiliation: ${templateSettings.affiliation_number}` : `School ID: ${templateSettings.school_id}`}
                      </p>
                      <p className="text-[9px] text-stone-500">
                        {templateSettings.address} • Tel: {templateSettings.contact_phone} • Email: {templateSettings.contact_email}
                      </p>
                      <div className="pt-2 flex justify-between items-center">
                        <span className="bg-stone-900 text-amber-400 font-black text-[9.5px] uppercase tracking-widest px-2.5 py-0.5 rounded">
                          {templateSettings.receipt_title}
                        </span>
                        <span className="border border-stone-400 text-stone-700 font-bold text-[9px] uppercase px-2 py-0.5 rounded">
                          {copyTitle}
                        </span>
                      </div>
                    </div>

                    {/* Student & Transaction Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <div><span className="text-stone-500">Receipt No:</span> <strong className="text-stone-900 font-mono">{viewReceipt.receipt_no}</strong></div>
                      <div><span className="text-stone-500">Date:</span> <strong className="text-stone-900 font-mono">{viewReceipt.receipt_date}</strong></div>
                      <div><span className="text-stone-500">Student Name:</span> <strong className="text-stone-900">{viewReceipt.student_name}</strong></div>
                      <div><span className="text-stone-500">Admission No:</span> <strong className="text-stone-900 font-mono">{viewReceipt.admission_no || '-'}</strong></div>
                      <div><span className="text-stone-500">Class &amp; Sec:</span> <strong className="text-stone-900">{viewReceipt.class_name} {viewReceipt.section_name}</strong></div>
                      <div><span className="text-stone-500">Parent / Guardian:</span> <strong className="text-stone-900">{viewReceipt.parent_name || 'Guardian'}</strong></div>
                      <div><span className="text-stone-500">Billing Period:</span> <strong className="text-stone-900">{viewReceipt.billing_period || 'Academic Term'}</strong></div>
                      <div><span className="text-stone-500">Payment Channel:</span> <strong className="text-stone-900">{viewReceipt.payment_mode}</strong></div>
                    </div>

                    {/* Banking details if present */}
                    {(viewReceipt.transaction_ref || viewReceipt.bank_name) && (
                      <div className="text-[10px] bg-blue-50/50 p-2 rounded-lg border border-blue-100 flex justify-between">
                        <span>Transaction Ref / Chq #: <strong className="font-mono text-blue-900">{viewReceipt.transaction_ref || '-'}</strong></span>
                        <span>Bank / Channel: <strong className="text-blue-900">{viewReceipt.bank_name || '-'}</strong></span>
                      </div>
                    )}

                    {/* Financial Summary */}
                    <div className="border-t border-b border-stone-200 py-2.5 space-y-1 text-[11px]">
                      <div className="flex justify-between text-stone-600">
                        <span>Total Billed Demand:</span>
                        <span className="font-mono">{formatCurrency(viewReceipt.total_amount_due)}</span>
                      </div>
                      {Number(viewReceipt.concession_amount || viewReceipt.discount_amount) > 0 && (
                        <div className="flex justify-between text-purple-700">
                          <span>Concession / Discount Waiver:</span>
                          <span className="font-mono">- {formatCurrency(viewReceipt.concession_amount || viewReceipt.discount_amount)}</span>
                        </div>
                      )}
                      {Number(viewReceipt.late_fee_amount) > 0 && (
                        <div className="flex justify-between text-red-700">
                          <span>Late Fee Penalty:</span>
                          <span className="font-mono">+ {formatCurrency(viewReceipt.late_fee_amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-black text-stone-950 pt-1 border-t border-dashed border-stone-200">
                        <span>Total Net Paid:</span>
                        <span className="text-emerald-700 font-mono text-base">{formatCurrency(viewReceipt.net_amount_paid)}</span>
                      </div>
                      <div className="flex justify-between text-stone-500 text-[10px]">
                        <span>Remaining Balance Due:</span>
                        <span className="font-bold text-amber-700 font-mono">{formatCurrency(viewReceipt.remaining_balance)}</span>
                      </div>
                    </div>

                    {/* Cancellation Alert if reversed */}
                    {viewReceipt.status === 'Cancelled' && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-800 space-y-0.5">
                        <div className="font-bold">⚠️ REVERSED &amp; CANCELLED RECEIPT</div>
                        <p>Reason: {viewReceipt.cancellation_reason}</p>
                      </div>
                    )}

                    {/* Terms & Footer */}
                    <div className="space-y-1 pt-1 text-[9px] text-stone-500">
                      <p className="font-semibold text-stone-600">{templateSettings.terms_and_conditions}</p>
                      <div className="flex justify-between items-end pt-2">
                        <div>
                          <p>Authorized Signatory / Cashier: <strong className="text-stone-900">{viewReceipt.collected_by || templateSettings.default_signatory}</strong></p>
                          <p className="italic text-stone-400">{templateSettings.footer_disclaimer}</p>
                        </div>
                        {templateSettings.show_qr_verification && (
                          <div className="text-center">
                            <div className="w-9 h-9 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                              <QrCode className="w-6 h-6" />
                            </div>
                            <span className="text-[7px] font-mono block mt-0.5">Scan to Verify</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="p-4 border-t border-stone-200 flex justify-end gap-2 bg-stone-50">
              <button
                type="button"
                onClick={() => setViewReceipt(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-xl text-xs shadow-md"
              >
                <Printer className="w-4 h-4" /> Print Official Slip
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT FEE RECEIPT INFORMATION MODAL */}
      {/* ========================================================================= */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-900 text-amber-400 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-stone-950 text-sm">Edit Information in Receipt #{editFormData.receipt_no}</h3>
                  <p className="text-xs text-stone-500">Correct student info, payment modes, cashier stamps, and amounts.</p>
                </div>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-stone-400 hover:text-stone-900 p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Tabs */}
            <div className="flex border-b border-stone-200 bg-white px-6 pt-3 gap-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setEditTab("student")}
                className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
                  editTab === "student" ? "border-indigo-600 text-indigo-700" : "border-transparent text-stone-500 hover:text-stone-900"
                }`}
              >
                <User className="w-4 h-4" /> 1. Student &amp; Academic
              </button>
              <button
                type="button"
                onClick={() => setEditTab("payment")}
                className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
                  editTab === "payment" ? "border-indigo-600 text-indigo-700" : "border-transparent text-stone-500 hover:text-stone-900"
                }`}
              >
                <CreditCard className="w-4 h-4" /> 2. Payment &amp; Banking
              </button>
              <button
                type="button"
                onClick={() => setEditTab("financials")}
                className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
                  editTab === "financials" ? "border-indigo-600 text-indigo-700" : "border-transparent text-stone-500 hover:text-stone-900"
                }`}
              >
                <FileText className="w-4 h-4" /> 3. Financials &amp; Notes
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveReceiptEdit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              
              {/* TAB 1: STUDENT & ACADEMIC */}
              {editTab === "student" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Student Full Name</label>
                      <input
                        type="text"
                        value={editFormData.student_name}
                        onChange={(e) => setEditFormData({ ...editFormData, student_name: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Admission Number</label>
                      <input
                        type="text"
                        value={editFormData.admission_no}
                        onChange={(e) => setEditFormData({ ...editFormData, admission_no: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Class / Grade</label>
                      <select
                        value={editFormData.class_name}
                        onChange={(e) => setEditFormData({ ...editFormData, class_name: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none"
                      >
                        {classesList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Section</label>
                      <input
                        type="text"
                        value={editFormData.section_name}
                        onChange={(e) => setEditFormData({ ...editFormData, section_name: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Billing Period / Term</label>
                      <input
                        type="text"
                        value={editFormData.billing_period}
                        onChange={(e) => setEditFormData({ ...editFormData, billing_period: e.target.value })}
                        placeholder="e.g. May-Jun / Q1"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Parent / Guardian Name</label>
                    <input
                      type="text"
                      value={editFormData.parent_name}
                      onChange={(e) => setEditFormData({ ...editFormData, parent_name: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PAYMENT & BANKING */}
              {editTab === "payment" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Receipt Date</label>
                      <input
                        type="date"
                        value={editFormData.receipt_date}
                        onChange={(e) => setEditFormData({ ...editFormData, receipt_date: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Payment Mode</label>
                      <select
                        value={editFormData.payment_mode}
                        onChange={(e) => setEditFormData({ ...editFormData, payment_mode: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none"
                      >
                        <option value="Cash">Cash (Counter Settlement)</option>
                        <option value="UPI (QR Scan)">UPI (QR Scan / GooglePay / PhonePe)</option>
                        <option value="Net Banking">Net Banking (NEFT / RTGS / IMPS)</option>
                        <option value="Cheque / DD">Cheque / Demand Draft</option>
                        <option value="Card (POS)">Card (POS Counter Swipe)</option>
                        <option value="Razorpay Gateway">Razorpay Payment Gateway</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Cheque / UTR / Reference No</label>
                      <input
                        type="text"
                        value={editFormData.transaction_ref}
                        onChange={(e) => setEditFormData({ ...editFormData, transaction_ref: e.target.value })}
                        placeholder="e.g. 905640190734 / CHQ-10492"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono text-stone-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Bank Name / Branch</label>
                      <input
                        type="text"
                        value={editFormData.bank_name}
                        onChange={(e) => setEditFormData({ ...editFormData, bank_name: e.target.value })}
                        placeholder="e.g. HDFC Bank, Sant Nagar"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Cashier / Staff In-Charge Name</label>
                    <input
                      type="text"
                      value={editFormData.collected_by}
                      onChange={(e) => setEditFormData({ ...editFormData, collected_by: e.target.value })}
                      placeholder="e.g. LAXMI (2026-2027)"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: FINANCIAL FIGURES & NOTES */}
              {editTab === "financials" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Total Demand (INR)</label>
                      <input
                        type="number"
                        value={editFormData.total_amount_due}
                        onChange={(e) => setEditFormData({ ...editFormData, total_amount_due: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-purple-700 block mb-1">Concession Discount</label>
                      <input
                        type="number"
                        value={editFormData.concession_amount}
                        onChange={(e) => setEditFormData({ ...editFormData, concession_amount: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-purple-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-red-700 block mb-1">Late Fee Penalty</label>
                      <input
                        type="number"
                        value={editFormData.late_fee_amount}
                        onChange={(e) => setEditFormData({ ...editFormData, late_fee_amount: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-red-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-emerald-700 block mb-1">Net Amount Paid (INR)</label>
                      <input
                        type="number"
                        value={editFormData.net_amount_paid}
                        onChange={(e) => setEditFormData({ ...editFormData, net_amount_paid: Number(e.target.value) })}
                        className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 font-mono text-base font-black text-emerald-900 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-orange-700 block mb-1">Remaining Due (INR)</label>
                      <input
                        type="number"
                        value={editFormData.remaining_balance}
                        onChange={(e) => setEditFormData({ ...editFormData, remaining_balance: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-orange-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Remarks / Note on Receipt</label>
                    <input
                      type="text"
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      placeholder="e.g. Cleared with sibling concession waiver"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Audit Reason for Change</label>
                    <input
                      type="text"
                      value={editFormData.audit_reason}
                      onChange={(e) => setEditFormData({ ...editFormData, audit_reason: e.target.value })}
                      placeholder="e.g. Corrected student name spelling / updated bank UTR"
                      className="w-full bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 font-medium text-stone-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Form Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isUpdating ? "Saving Changes..." : "Save & Update Receipt"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RECEIPT LETTERHEAD & TEMPLATE SETTINGS MODAL */}
      {/* ========================================================================= */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-stone-900 text-amber-400 rounded-xl">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-stone-950 text-sm">Receipt Header &amp; Template Configuration</h3>
                  <p className="text-xs text-stone-500">Edit school branding, board details, terms, and print copy format.</p>
                </div>
              </div>
              <button onClick={() => setSettingsModalOpen(false)} className="text-stone-400 hover:text-stone-900 p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Settings Form Body */}
            <form onSubmit={handleSaveTemplateSettings} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Institution / School Name</label>
                  <input
                    type="text"
                    value={templateSettings.institution_name}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, institution_name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Board Affiliation / Code</label>
                  <input
                    type="text"
                    value={templateSettings.affiliation_number}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, affiliation_number: e.target.value })}
                    placeholder="e.g. REG-1253481"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">School ID</label>
                  <input
                    type="text"
                    value={templateSettings.school_id}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, school_id: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">UDISE Code</label>
                  <input
                    type="text"
                    value={templateSettings.udise_code}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, udise_code: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Receipt Title</label>
                  <input
                    type="text"
                    value={templateSettings.receipt_title}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, receipt_title: e.target.value })}
                    placeholder="e.g. FEE RECEIPT"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Campus / School Address</label>
                <input
                  type="text"
                  value={templateSettings.address}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, address: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Contact Phone(s)</label>
                  <input
                    type="text"
                    value={templateSettings.contact_phone}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, contact_phone: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={templateSettings.contact_email}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, contact_email: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Default Signatory / Cashier</label>
                  <input
                    type="text"
                    value={templateSettings.default_signatory}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, default_signatory: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Print Copies Layout Format</label>
                  <select
                    value={templateSettings.copies_format}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, copies_format: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none"
                  >
                    <option value="A5_SINGLE">A5 Single Slip (Standard 1 Page)</option>
                    <option value="A4_DOUBLE">A4 Double Copy (Student + Office Copy on 1 Page)</option>
                    <option value="A4_TRIPLICATE">A4 Triplicate Copy (Student + Office + Bank)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Terms &amp; Conditions / Fee Policy</label>
                <textarea
                  value={templateSettings.terms_and_conditions}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, terms_and_conditions: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Footer Verification Disclaimer</label>
                <input
                  type="text"
                  value={templateSettings.footer_disclaimer}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, footer_disclaimer: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium text-stone-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="qr_verify_toggle"
                  checked={templateSettings.show_qr_verification}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, show_qr_verification: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="qr_verify_toggle" className="font-bold text-stone-800 cursor-pointer">
                  Display Instant Verification QR Code on printed fee receipt
                </label>
              </div>

              {/* Form Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSavingSettings ? "Saving Settings..." : "Save Template Settings"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SAFE CANCELLATION MODAL */}
      {/* ========================================================================= */}
      {cancelModalOpen && selectedCancelReceipt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-red-600 flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5" /> Cancel Receipt
                </h3>
                <p className="text-xs text-stone-400">Receipt #{selectedCancelReceipt.receipt_no}</p>
              </div>
              <button onClick={() => setCancelModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleConfirmCancellation} className="space-y-4 text-xs">
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-900 space-y-1">
                <p className="font-bold">Financial Audit Protection:</p>
                <p className="text-[11px] opacity-90">
                  This action will mark the receipt as Cancelled and post an automatic <strong>Debit Reversal</strong> of {formatCurrency(selectedCancelReceipt.net_amount_paid)} to the student's ledger. The transaction will never be deleted.
                </p>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Reason for Cancellation (Required)</label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g. Incorrect fee head selection, cheque bounced, duplicate swipe..."
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessingCancel}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isProcessingCancel ? "Reversing..." : "Confirm & Post Reversal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
