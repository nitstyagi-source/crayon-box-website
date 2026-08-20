"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Receipt, Search, Filter, Edit3, Printer, CheckCircle2, 
  AlertTriangle, Clock, RefreshCw, X, Eye, ShieldCheck, DollarSign,
  Calendar, FileText, ArrowRight, Save, Plus, Trash2, Layers
} from "lucide-react";
import Link from "next/link";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getInvoices, updateIndividualInvoice, getFeeHeads, saveFeeHead } from "@/app/actions/finance-core";
import { printIsolatedElement } from "@/lib/printUtils";

export default function InvoicesModule() {
  const { activeCampusId } = useCampusContext();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editItems, setEditItems] = useState<Array<{
    id?: string;
    fee_head_name: string;
    base_amount: number;
    discount_amount: number;
  }>>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fee Heads Management State
  const [headsModalOpen, setHeadsModalOpen] = useState(false);
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [isLoadingHeads, setIsLoadingHeads] = useState(false);
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

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeCampusId) {
      loadData();
      loadHeads();
    }
  }, [activeCampusId]);

  async function loadData() {
    setIsLoading(true);
    try {
      const res = await getInvoices(activeCampusId);
      if (res.success) setInvoices(res.data || []);
    } catch (e) {
      console.error("Error loading invoices:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadHeads() {
    setIsLoadingHeads(true);
    try {
      const res = await getFeeHeads(activeCampusId);
      if (res.success) setFeeHeads(res.data || []);
    } catch (e) {
      console.error("Error loading fee heads:", e);
    } finally {
      setIsLoadingHeads(false);
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
        loadHeads();
      } else {
        alert("Failed to save fee head: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSavingHead(false);
    }
  }

  function handleOpenEdit(inv: any) {
    setSelectedInvoice(inv);
    
    // Default or existing line items breakdown
    const defaultItems = [
      { fee_head_name: "Tuition Fee", base_amount: Math.round(Number(inv.total_amount || 11500) * 0.6), discount_amount: Number(inv.total_discount || 0) },
      { fee_head_name: "Annual & Development Charges", base_amount: Math.round(Number(inv.total_amount || 11500) * 0.25), discount_amount: 0 },
      { fee_head_name: "Activity & Lab Charges", base_amount: Math.round(Number(inv.total_amount || 11500) * 0.15), discount_amount: 0 }
    ];

    setEditItems(defaultItems);
    setEditFormData({
      id: inv.id,
      invoice_number: inv.invoice_number,
      student_name: inv.student_name || `${inv.students?.first_name || 'Student'} ${inv.students?.last_name || ''}`.trim(),
      admission_no: inv.admission_no || inv.students?.admission_no || 'ADM-N/A',
      class_name: inv.class_name || 'Grade 1',
      billing_period: inv.billing_period || 'Annual 2026-27 (Term 1)',
      total_amount: Number(inv.total_amount || 0),
      total_discount: Number(inv.total_discount || 0),
      total_late_fee: Number(inv.total_late_fee || 0),
      amount_paid: Number(inv.amount_paid || 0),
      due_date: inv.due_date || '2026-04-10',
      status: inv.status || 'Unpaid',
      notes: inv.notes || ''
    });
    setEditModalOpen(true);
  }

  function handleAddEditItem() {
    setEditItems([
      ...editItems,
      { fee_head_name: "Miscellaneous Fee", base_amount: 1000, discount_amount: 0 }
    ]);
  }

  function handleRemoveEditItem(index: number) {
    setEditItems(editItems.filter((_, i) => i !== index));
  }

  function handleEditItemChange(index: number, field: string, value: any) {
    const updated = [...editItems];
    (updated[index] as any)[field] = value;
    setEditItems(updated);
  }

  // Recalculate totals from items
  const computedTotalAmount = editItems.reduce((sum, it) => sum + Number(it.base_amount || 0), 0);
  const computedTotalDiscount = editItems.reduce((sum, it) => sum + Number(it.discount_amount || 0), 0);
  const computedNetDue = Math.max(0, computedTotalAmount + Number(editFormData.total_late_fee || 0) - computedTotalDiscount - Number(editFormData.amount_paid || 0));

  async function handleSaveInvoice(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateIndividualInvoice({
        id: editFormData.id,
        total_amount: computedTotalAmount,
        total_discount: computedTotalDiscount,
        total_late_fee: Number(editFormData.total_late_fee || 0),
        amount_paid: Number(editFormData.amount_paid || 0),
        due_date: editFormData.due_date,
        billing_period: editFormData.billing_period,
        status: editFormData.status,
        notes: editFormData.notes,
        items: editItems
      });

      if (res.success) {
        alert("🎉 Invoice & itemized head discounts updated successfully!");
        setEditModalOpen(false);
        loadData();
      } else {
        alert("Failed to update invoice: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenPrint(inv: any) {
    setSelectedInvoice(inv);
    setPrintModalOpen(true);
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const studentName = inv.student_name || `${inv.students?.first_name || ''} ${inv.students?.last_name || ''}`;
    const admNo = inv.admission_no || inv.students?.admission_no || '';
    const invNum = inv.invoice_number || '';
    const cls = inv.class_name || '';

    const matchesSearch = searchQuery === "" ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "All" || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Individual Invoicing Engine
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Academic Session 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Invoice Management</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            View, edit, adjust amounts, manage head discounts, extend due dates, and print official fee demand notices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setHeadsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl transition border border-purple-200 shadow-xs"
          >
            <DollarSign className="w-3.5 h-3.5" /> Manage Invoice Heads
          </button>
          <Link
            href="/admin/finance/generate"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Generate Invoices
          </Link>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Invoices
          </button>
        </div>
      </div>

      {/* RTE Policy Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>
            <strong>RTE / EWS Exemption Active:</strong> Under Section 12(1)(c) of the Right to Education Act, all <strong>75 EWS category students</strong> are 100% fee-exempted with zero fee invoices generated.
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg shrink-0">
          75 EWS Seats (0 Invoices)
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Invoice #, Student Name, Admission #, Class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500">Filter Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-bold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Invoices ({invoices.length})</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Fully Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 text-[11px] font-black uppercase tracking-wider text-stone-500">
                <th className="py-4 px-6">Invoice #</th>
                <th className="py-4 px-6">Student Details</th>
                <th className="py-4 px-6">Class</th>
                <th className="py-4 px-6">Billing Period</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6">Gross Bill</th>
                <th className="py-4 px-6 text-purple-700">Discounts</th>
                <th className="py-4 px-6">Paid</th>
                <th className="py-4 px-6">Net Due</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-stone-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading student invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-stone-400">
                    No invoices match your search.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const studentName = inv.student_name || `${inv.students?.first_name || 'Student'} ${inv.students?.last_name || ''}`.trim();
                  const admNo = inv.admission_no || inv.students?.admission_no || 'ADM-N/A';
                  const total = Number(inv.total_amount || 0);
                  const paid = Number(inv.amount_paid || 0);
                  const discount = Number(inv.total_discount || 0);
                  const lateFee = Number(inv.total_late_fee || 0);
                  const netDue = Math.max(0, total + lateFee - discount - paid);

                  return (
                    <tr key={inv.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-4 px-6 font-mono font-black text-stone-900">
                        {inv.invoice_number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-stone-900">{studentName}</div>
                        <div className="text-[11px] text-stone-400 font-mono">#{admNo}</div>
                      </td>
                      <td className="py-4 px-6 text-stone-700 font-semibold">
                        {inv.class_name || 'Grade 1'} {inv.section_name || ''}
                      </td>
                      <td className="py-4 px-6 text-stone-600">
                        {inv.billing_period}
                      </td>
                      <td className="py-4 px-6 text-stone-500 font-mono text-[11px]">
                        {inv.due_date || '2026-04-10'}
                      </td>
                      <td className="py-4 px-6 font-bold text-stone-900">
                        {formatCurrency(total)}
                      </td>
                      <td className="py-4 px-6 font-bold text-purple-700">
                        {discount > 0 ? `- ${formatCurrency(discount)}` : "—"}
                      </td>
                      <td className="py-4 px-6 font-black text-emerald-600">
                        {formatCurrency(paid)}
                      </td>
                      <td className="py-4 px-6 font-black text-amber-600 font-mono">
                        {formatCurrency(netDue)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'Partial' ? 'bg-blue-100 text-blue-800' :
                          inv.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(inv)}
                            className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Individual Invoice"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenPrint(inv)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                            title="Print Invoice Slip"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
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

      {/* Edit Individual Invoice & Fee Head Discounts Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900">Edit Invoice & Fee Head Discounts</h3>
                <p className="text-xs text-stone-400">{editFormData.invoice_number} • {editFormData.student_name} (#{editFormData.admission_no})</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-5 text-xs">
              
              {/* Billing Period & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Billing Period</label>
                  <input
                    type="text"
                    value={editFormData.billing_period}
                    onChange={(e) => setEditFormData({ ...editFormData, billing_period: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editFormData.due_date}
                    onChange={(e) => setEditFormData({ ...editFormData, due_date: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Itemized Fee Heads & Individual Head Discounts */}
              <div className="space-y-3 bg-stone-50/70 p-4 rounded-2xl border border-stone-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-800">Itemized Fee Heads & Head-wise Discounts</span>
                  <button
                    type="button"
                    onClick={handleAddEditItem}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold rounded-lg text-[11px]"
                  >
                    <Plus className="w-3 h-3" /> Add Head
                  </button>
                </div>

                <div className="space-y-2">
                  {editItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.fee_head_name}
                          onChange={(e) => handleEditItemChange(idx, "fee_head_name", e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 font-semibold text-stone-900"
                          placeholder="Head Name"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={item.base_amount}
                          onChange={(e) => handleEditItemChange(idx, "base_amount", Number(e.target.value))}
                          className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 font-bold text-stone-900"
                          placeholder="Amount (₹)"
                          min="0"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={item.discount_amount}
                          onChange={(e) => handleEditItemChange(idx, "discount_amount", Number(e.target.value))}
                          className="w-full bg-purple-50 border border-purple-200 rounded-xl px-2.5 py-1.5 font-bold text-purple-800"
                          placeholder="Discount (₹)"
                          min="0"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        {editItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEditItem(idx)}
                            className="text-stone-300 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Adjustments */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Late Fee Penalty (₹)</label>
                  <input
                    type="number"
                    value={editFormData.total_late_fee}
                    onChange={(e) => setEditFormData({ ...editFormData, total_late_fee: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-red-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={editFormData.amount_paid}
                    onChange={(e) => setEditFormData({ ...editFormData, amount_paid: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-black text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Invoice Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Fully Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Admin Notes / Adjustment Reason</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="e.g. Sibling discount applied to tuition fee with Principal approval"
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold"
                />
              </div>

              {/* Net Balance Calculated Preview */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-stone-600">Gross: {formatCurrency(computedTotalAmount)}</span>
                  {computedTotalDiscount > 0 && (
                    <span className="text-purple-700 ml-2 font-semibold">| Head Discounts: -{formatCurrency(computedTotalDiscount)}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 uppercase font-black block">Net Balance Due</span>
                  <span className="font-black font-mono text-blue-600 text-sm">{formatCurrency(computedNetDue)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? "Saving..." : "Save Changes & Rebalance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Invoice Slip Modal */}
      {printModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900">Fee Demand Invoice</h3>
                <p className="text-xs text-stone-400">{selectedInvoice.invoice_number}</p>
              </div>
              <button onClick={() => setPrintModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            {/* A5 Printable Demand Note */}
            <div 
              ref={printRef} 
              className="bg-white p-6 rounded-2xl border border-stone-300 shadow-xs space-y-3.5 text-xs font-sans max-w-[148mm] mx-auto print:p-0 print:border-none print:max-w-none"
            >
              {/* Print specific A5 CSS */}
              <style jsx global>{`
                @media print {
                  @page {
                    size: A5 portrait;
                    margin: 6mm;
                  }
                  body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                  }
                }
              `}</style>

              {/* School Header */}
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

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10.5px] bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                <div>
                  <span className="text-stone-400">Invoice No:</span> <strong className="text-stone-900 font-mono">{selectedInvoice.invoice_number}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Due Date:</span> <strong className="text-stone-900 font-mono">{selectedInvoice.due_date || '2026-04-10'}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Student:</span> <strong className="text-stone-900">{selectedInvoice.student_name || selectedInvoice.students?.first_name}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Admission No:</span> <strong className="text-stone-900 font-mono">{selectedInvoice.admission_no || selectedInvoice.students?.admission_no}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Class & Section:</span> <strong className="text-stone-900">{selectedInvoice.class_name} {selectedInvoice.section_name}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Billing Period:</span> <strong className="text-stone-900">{selectedInvoice.billing_period}</strong>
                </div>
              </div>

              <div className="border-t border-b border-stone-200 py-2.5 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Gross Tuition & Annual Charges:</span>
                  <strong className="text-stone-900">{formatCurrency(selectedInvoice.total_amount)}</strong>
                </div>
                {Number(selectedInvoice.total_discount) > 0 && (
                  <div className="flex justify-between text-purple-700">
                    <span>Authorized Concessions / Head Discounts:</span>
                    <span>- {formatCurrency(selectedInvoice.total_discount)}</span>
                  </div>
                )}
                {Number(selectedInvoice.total_late_fee) > 0 && (
                  <div className="flex justify-between text-red-700">
                    <span>Late Fee Penalty:</span>
                    <span>+ {formatCurrency(selectedInvoice.total_late_fee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-700">
                  <span>Amount Paid So Far:</span>
                  <span>- {formatCurrency(selectedInvoice.amount_paid || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-stone-900 pt-1.5 border-t border-dashed border-stone-200">
                  <span>Net Payable Amount:</span>
                  <span className="text-blue-600 font-mono">{formatCurrency(Math.max(0, Number(selectedInvoice.total_amount || 0) + Number(selectedInvoice.total_late_fee || 0) - Number(selectedInvoice.total_discount || 0) - Number(selectedInvoice.amount_paid || 0)))}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-1 text-[9.5px] text-stone-500">
                <div>
                  <p>Authorized Signatory: <strong className="text-stone-800">Accounts Department</strong></p>
                  <p className="italic text-stone-400">Payable online via parent portal or at reception fee counter.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  if (printRef.current) {
                    printIsolatedElement(printRef.current, `Invoice-${selectedInvoice?.invoice_number || 'Slip'}`);
                  } else {
                    window.print();
                  }
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Demand Slip
              </button>
            </div>
          </div>
        </div>
      )}
      {headsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Invoice Fee Heads Master
                </h3>
                <p className="text-xs text-stone-400">Add, edit, or categorize recurring and one-time billing heads.</p>
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
                Total Registered Fee Heads: {feeHeads.length}
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
            {isLoadingHeads ? (
              <div className="p-8 text-center text-xs text-stone-400 font-bold animate-pulse">
                Loading Fee Heads...
              </div>
            ) : (
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
                    {feeHeads.map((head) => (
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
            )}

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
                  placeholder="e.g. Charges for specialized AI, coding & chemistry practicals"
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="head_is_active"
                  checked={headFormData.is_active}
                  onChange={(e) => setHeadFormData({ ...headFormData, is_active: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded border-stone-300"
                />
                <label htmlFor="head_is_active" className="font-bold text-stone-700 cursor-pointer">
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
