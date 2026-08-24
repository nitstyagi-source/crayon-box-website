"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Package, ShoppingCart, Truck, CheckCircle2,
  Clock, Plus, RefreshCw, IndianRupee, Building2, X,
  FileText, Printer, Edit3, Eye, Save, SlidersHorizontal, ArrowRight,
  Receipt, Check, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getProcurementPurchaseOrdersAction,
  createPurchaseOrderAction,
  PaymentVoucherData,
  savePaymentVoucherAction
} from '@/app/actions/helpdesk-procurement-actions';
import { numberToWordsINR } from '@/lib/numberUtils';
import { printIsolatedElement } from '@/lib/printUtils';

export default function ProcurementPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [orders, setOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState({ totalOrders: 0, totalSpend: 0, approvedOrders: 0, deliveredOrders: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // New PO Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState('IT Infrastructure');
  const [amount, setAmount] = useState('150000');
  const [itemsSummary, setItemsSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment Voucher (A5 Receipt) Modal State
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherEditMode, setVoucherEditMode] = useState<"edit" | "preview">("preview");
  const [voucherData, setVoucherData] = useState<PaymentVoucherData>({
    voucher_no: "",
    voucher_date: new Date().toISOString().split('T')[0],
    institution_name: "CRAYON BOX SCHOOL",
    institution_address: "6/20, Shastri Park Ext. D-Block, Phool Bagh, Road Burari",
    school_id: "1253481",
    vendor_name: "Standard Vendor",
    on_account_of: "Purchase of School Supplies & Consumables",
    payment_mode: "Cash/Cheque",
    cheque_or_txn_no: "CHQ-892104",
    cheque_date: new Date().toISOString().split('T')[0],
    debit_lines: [
      { particulars: "Stationery & Examination Material (Class 1 to 10)", amount: 25000 },
      { particulars: "Printing, Binding & Administrative Consumables", amount: 15000 },
      { particulars: "Freight, Handling & Logistics Charges", amount: 2500 }
    ],
    credit_lines: [
      { particulars: "By HDFC Bank A/c No. 502000123456 (Cheque No. 892104)", amount: 42500 }
    ],
    total_amount: 42500,
    amount_in_words: "Forty Two Thousand Five Hundred Rupees Only",
    receiver_signature_name: "Vendor Representative",
    authorised_signatory_name: "Authorised Signatory"
  });

  const printVoucherRef = useRef<HTMLDivElement>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    const res = await getProcurementPurchaseOrdersAction();
    if (res.success) {
      setOrders(res.orders || []);
      setCounts(res.counts || { totalOrders: 0, totalSpend: 0, approvedOrders: 0, deliveredOrders: 0 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !itemsSummary.trim()) return;

    setIsSubmitting(true);
    const res = await createPurchaseOrderAction({
      vendorName,
      category,
      totalAmount: Number(amount),
      itemsSummary
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsNewModalOpen(false);
      setVendorName('');
      setItemsSummary('');
      fetchOrders();
    } else {
      alert("Error: " + res.error);
    }
  };

  // Open Payment Voucher Generator for a PO
  const handleOpenVoucherModal = (po?: any) => {
    const today = new Date().toISOString().split('T')[0];
    const poNum = po?.po_number || `PO-2026-${Math.floor(100 + Math.random() * 900)}`;
    const randomVoucherCode = Math.floor(1000 + Math.random() * 9000);
    const totalAmt = po ? Number(po.total_amount || 0) : 45000;
    const vendor = po ? po.vendor_name : "Vendor / Supplier";
    const summary = po ? po.items_summary : "Institutional Supplies & Lab Consumables";

    setVoucherData({
      voucher_no: "",
      voucher_date: today,
      institution_name: selectedInstitutionObj?.name || "CRAYON BOX SCHOOL",
      institution_address: selectedInstitutionObj?.address || "6/20, Shastri Park Ext. D-Block, Phool Bagh, Road Burari",
      school_id: selectedInstitutionObj?.school_id || "1253481",
      po_id: po?.id,
      po_number: poNum,
      vendor_name: vendor,
      on_account_of: summary,
      payment_mode: "Cash/Cheque",
      cheque_or_txn_no: `CHQ-${Math.floor(100000 + Math.random() * 900000)}`,
      cheque_date: today,
      debit_lines: [
        { particulars: summary, amount: totalAmt }
      ],
      credit_lines: [
        { particulars: `By Bank Account / Cheque issued to ${vendor}`, amount: totalAmt }
      ],
      total_amount: totalAmt,
      amount_in_words: numberToWordsINR(totalAmt),
      receiver_signature_name: vendor,
      authorised_signatory_name: "Authorised Signatory"
    });

    setVoucherEditMode("preview");
    setIsVoucherModalOpen(true);
  };

  // Debit Line Item Handlers
  const handleAddDebitLine = () => {
    setVoucherData(prev => ({
      ...prev,
      debit_lines: [...prev.debit_lines, { particulars: "New Debit Particular / Expense Head", amount: 0 }]
    }));
  };

  const handleUpdateDebitLine = (index: number, field: "particulars" | "amount", val: any) => {
    setVoucherData(prev => {
      const updated = [...prev.debit_lines];
      updated[index] = { ...updated[index], [field]: field === "amount" ? Number(val || 0) : val };
      const newTotal = updated.reduce((s, it) => s + (Number(it.amount) || 0), 0);
      return {
        ...prev,
        debit_lines: updated,
        total_amount: newTotal,
        amount_in_words: numberToWordsINR(newTotal)
      };
    });
  };

  const handleRemoveDebitLine = (index: number) => {
    setVoucherData(prev => {
      const updated = prev.debit_lines.filter((_, i) => i !== index);
      const newTotal = updated.reduce((s, it) => s + (Number(it.amount) || 0), 0);
      return {
        ...prev,
        debit_lines: updated,
        total_amount: newTotal,
        amount_in_words: numberToWordsINR(newTotal)
      };
    });
  };

  // Credit Line Item Handlers
  const handleAddCreditLine = () => {
    setVoucherData(prev => ({
      ...prev,
      credit_lines: [...prev.credit_lines, { particulars: "By Cash / Bank Account", amount: 0 }]
    }));
  };

  const handleUpdateCreditLine = (index: number, field: "particulars" | "amount", val: any) => {
    setVoucherData(prev => {
      const updated = [...prev.credit_lines];
      updated[index] = { ...updated[index], [field]: field === "amount" ? Number(val || 0) : val };
      return {
        ...prev,
        credit_lines: updated
      };
    });
  };

  const handleRemoveCreditLine = (index: number) => {
    setVoucherData(prev => ({
      ...prev,
      credit_lines: prev.credit_lines.filter((_, i) => i !== index)
    }));
  };

  // 1-Click Print Voucher on A5
  const handlePrintVoucher = () => {
    if (printVoucherRef.current) {
      printIsolatedElement(printVoucherRef.current, `Payment_Voucher_${voucherData.voucher_no || 'Slip'}`);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-indigo-400" />
              Institutional Procurement &amp; Vendor POs
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-indigo-400" />
            Procurement &amp; Purchase Orders (PO)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Vendor purchase requisitions, A5 Payment Voucher receipt slips, goods receipt notes (GRN), and capital equipment procurement.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => handleOpenVoucherModal()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 shadow-md text-xs"
          >
            <Receipt className="w-4 h-4 text-slate-950" />
            <span>📄 Payment Voucher (A5)</span>
          </button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsNewModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg shadow-indigo-600/20"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Purchase Order
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchOrders}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh POs
          </Button>
        </div>
      </div>

      {/* TELEMATICS COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total PO Spend</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block font-mono">
            ₹{counts.totalSpend.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">{counts.totalOrders} Purchase Orders Requisitioned</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Delivered &amp; Verified</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block font-mono">{counts.deliveredOrders}</span>
          <span className="text-[11px] text-emerald-700 font-bold">GRN Signed &amp; In Stock</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Approved Orders</span>
          <span className="text-3xl font-black text-indigo-600 mt-1 block font-mono">{counts.approvedOrders}</span>
          <span className="text-[11px] text-indigo-700 font-bold">Awaiting Vendor Delivery</span>
        </div>
      </div>

      {/* PO REGISTRY TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Purchase Orders Registry ({orders.length})
            </h3>
            <p className="text-xs text-slate-400">
              Institutional PO register with payment voucher generation and category tracking.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Vendor &amp; Category</th>
                <th className="py-3 px-4">Order Summary</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Payment Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {po.po_number}
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block font-bold">{po.vendor_name}</strong>
                    <span className="text-[10px] font-bold uppercase text-indigo-600">{po.category}</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate">
                    {po.items_summary}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                    ₹{Number(po.total_amount || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {po.order_date}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      po.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {po.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenVoucherModal(po)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition shadow-2xs"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-700" />
                      <span>Voucher (A5)</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PAYMENT VOUCHER (A5 SIZE) RECEIPT GENERATOR, EDITOR & PRINT MODAL */}
      {/* ========================================================================= */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 font-sans">
            
            {/* Modal Top Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 text-amber-400 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">
                    Payment Voucher (A5 Size){voucherData.voucher_no ? ` — ${voucherData.voucher_no}` : ''}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Standard procurement payment voucher &amp; acknowledgment receipt with debit/credit ledger layout.
                  </p>
                </div>
              </div>

              {/* View/Edit Toggle & Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setVoucherEditMode("preview")}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                      voucherEditMode === "preview" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> A5 Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoucherEditMode("edit")}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                      voucherEditMode === "edit" ? "bg-slate-900 text-amber-400 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Fields
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePrintVoucher}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" /> Print A5 Slip
                </button>

                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60">
              
              {/* EDIT MODE: Form to adjust all fields */}
              {voucherEditMode === "edit" && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-xs shadow-xs">
                  
                  {/* Top Meta Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Voucher Number</label>
                      <input
                        type="text"
                        value={voucherData.voucher_no}
                        onChange={(e) => setVoucherData({ ...voucherData, voucher_no: e.target.value })}
                        placeholder="Leave blank for manual entry (e.g. PV-001)..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Voucher Date</label>
                      <input
                        type="date"
                        value={voucherData.voucher_date}
                        onChange={(e) => setVoucherData({ ...voucherData, voucher_date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">School ID</label>
                      <input
                        type="text"
                        value={voucherData.school_id}
                        onChange={(e) => setVoucherData({ ...voucherData, school_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">School Name</label>
                      <input
                        type="text"
                        value={voucherData.institution_name}
                        onChange={(e) => setVoucherData({ ...voucherData, institution_name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Campus Address</label>
                      <input
                        type="text"
                        value={voucherData.institution_address}
                        onChange={(e) => setVoucherData({ ...voucherData, institution_address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Left Slip (Counterfoil) Particulars */}
                  <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
                    <span className="font-black text-amber-900 uppercase tracking-wider text-[10px] block">
                      Left Counterfoil / Acknowledgment Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Payee / Vendor Name</label>
                        <input
                          type="text"
                          value={voucherData.vendor_name}
                          onChange={(e) => setVoucherData({ ...voucherData, vendor_name: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">On account of</label>
                        <input
                          type="text"
                          value={voucherData.on_account_of}
                          onChange={(e) => setVoucherData({ ...voucherData, on_account_of: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">By Cash / Cheque / UTR No.</label>
                        <input
                          type="text"
                          value={voucherData.cheque_or_txn_no}
                          onChange={(e) => setVoucherData({ ...voucherData, cheque_or_txn_no: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Dated</label>
                        <input
                          type="date"
                          value={voucherData.cheque_date}
                          onChange={(e) => setVoucherData({ ...voucherData, cheque_date: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DEBIT Line Items */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                        DEBIT Particulars &amp; Amounts
                      </span>
                      <button
                        type="button"
                        onClick={handleAddDebitLine}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold rounded-lg text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Debit Line
                      </button>
                    </div>

                    <div className="space-y-2">
                      {voucherData.debit_lines.map((dLine, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={dLine.particulars}
                            onChange={(e) => handleUpdateDebitLine(idx, "particulars", e.target.value)}
                            placeholder="Debit particulars / ledger head..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-medium"
                          />
                          <input
                            type="number"
                            value={dLine.amount}
                            onChange={(e) => handleUpdateDebitLine(idx, "amount", e.target.value)}
                            placeholder="Amount (INR)"
                            className="w-32 bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900 text-right"
                          />
                          {voucherData.debit_lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDebitLine(idx)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CREDIT Line Items */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                        CREDIT Particulars (Payment Accounts)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddCreditLine}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold rounded-lg text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Credit Line
                      </button>
                    </div>

                    <div className="space-y-2">
                      {voucherData.credit_lines.map((cLine, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={cLine.particulars}
                            onChange={(e) => handleUpdateCreditLine(idx, "particulars", e.target.value)}
                            placeholder="Credit account (e.g. By Cash Account / Bank A/c)..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-medium"
                          />
                          <input
                            type="number"
                            value={cLine.amount}
                            onChange={(e) => handleUpdateCreditLine(idx, "amount", e.target.value)}
                            placeholder="Amount (INR)"
                            className="w-32 bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900 text-right"
                          />
                          {voucherData.credit_lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCreditLine(idx)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total & Words */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Total Amount (INR)</label>
                      <input
                        type="number"
                        value={voucherData.total_amount}
                        onChange={(e) => {
                          const n = Number(e.target.value || 0);
                          setVoucherData({ ...voucherData, total_amount: n, amount_in_words: numberToWordsINR(n) });
                        }}
                        className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 font-mono text-base font-black text-emerald-950"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Amount in Words (Rupees)</label>
                      <input
                        type="text"
                        value={voucherData.amount_in_words}
                        onChange={(e) => setVoucherData({ ...voucherData, amount_in_words: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Signatories */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Authorised Signatory Designation / Name</label>
                      <input
                        type="text"
                        value={voucherData.authorised_signatory_name}
                        onChange={(e) => setVoucherData({ ...voucherData, authorised_signatory_name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Receiver's Signature / Payee</label>
                      <input
                        type="text"
                        value={voucherData.receiver_signature_name}
                        onChange={(e) => setVoucherData({ ...voucherData, receiver_signature_name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setVoucherEditMode("preview")}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Eye className="w-4 h-4" /> View A5 Slip Preview
                    </button>
                  </div>

                </div>
              )}

              {/* PREVIEW MODE: Authentic A5 Payment Voucher Layout matching Reference Image */}
              {voucherEditMode === "preview" && (
                <div className="space-y-4">
                  
                  {/* Container for Print Isolation */}
                  <div 
                    ref={printVoucherRef}
                    className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-stone-800 shadow-md text-stone-950 font-sans mx-auto max-w-3xl"
                    style={{
                      minHeight: "420px",
                      boxSizing: "border-box"
                    }}
                  >
                    {/* A5 Landscape Print Styles */}
                    <style>{`
                      @media print {
                        @page {
                          size: A5 landscape;
                          margin: 4mm;
                        }
                        body {
                          print-color-adjust: exact;
                          -webkit-print-color-adjust: exact;
                          background: white !important;
                        }
                      }
                    `}</style>

                    <div className="flex border-2 border-stone-900" style={{ minHeight: "380px" }}>
                      
                      {/* LEFT SECTION: Counterfoil / Acknowledgment Slip */}
                      <div className="w-2/7 border-r-2 border-stone-900 p-3 flex flex-col justify-between text-[10px] leading-tight select-none">
                        <div className="space-y-3 pt-1">
                          <p className="font-bold text-stone-900">
                            Received with thanks from <strong className="font-black">{voucherData.institution_name}</strong>
                          </p>

                          <div className="space-y-1">
                            <span className="text-stone-700">the sum of Rupees:</span>
                            <div className="border-b border-dotted border-stone-800 font-bold text-stone-950 pb-0.5">
                              {voucherData.amount_in_words}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-stone-700">on account of:</span>
                            <div className="border-b border-dotted border-stone-800 font-bold text-stone-950 pb-0.5">
                              {voucherData.on_account_of}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-stone-700">by Cash/Cheque No:</span>
                            <div className="border-b border-dotted border-stone-800 font-mono font-bold text-stone-950 pb-0.5">
                              {voucherData.cheque_or_txn_no} <span className="font-normal text-[9px] text-stone-600">on {voucherData.cheque_date}</span>
                            </div>
                          </div>

                          <div className="pt-2">
                            <div className="font-black text-xs font-mono border-b-2 border-stone-900 pb-1">
                              RS. &nbsp;₹{Number(voucherData.total_amount || 0).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        <div className="pt-8 pb-1 text-center">
                          <div className="border-t border-dotted border-stone-700 pt-1 font-bold text-[9.5px]">
                            Receiver's Signature
                          </div>
                          <span className="text-[8px] text-stone-500 block truncate">{voucherData.receiver_signature_name}</span>
                        </div>
                      </div>

                      {/* RIGHT SECTION: Main Payment Voucher */}
                      <div className="w-5/7 p-4 flex flex-col justify-between text-[11px] leading-tight">
                        
                        {/* Voucher Header */}
                        <div>
                          <div className="text-center space-y-0.5">
                            <h1 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight uppercase">
                              {voucherData.institution_name}
                            </h1>
                            <p className="text-[10px] font-semibold text-stone-700">
                              {voucherData.institution_address}
                            </p>
                            <p className="text-xs font-black text-stone-900 underline underline-offset-2">
                              SCHOOL ID - {voucherData.school_id}
                            </p>
                            <h2 className="text-sm sm:text-base font-black text-stone-950 underline underline-offset-4 tracking-wider pt-1 uppercase">
                              PAYMENT VOUCHER
                            </h2>
                          </div>

                          {/* Meta Row */}
                          <div className="flex justify-between items-center pt-3 pb-2 text-xs font-bold text-stone-900">
                            <div className="flex items-center">
                              <span>VOUCHER No:- </span>
                              {voucherData.voucher_no ? (
                                <strong className="font-mono text-stone-950 ml-1 underline underline-offset-2">{voucherData.voucher_no}</strong>
                              ) : (
                                <span className="inline-block border-b border-stone-800 w-36 ml-1.5">&nbsp;</span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <span>Dated:- </span>
                              {voucherData.voucher_date ? (
                                <strong className="font-mono text-stone-950 ml-1 underline underline-offset-2">{voucherData.voucher_date}</strong>
                              ) : (
                                <span className="inline-block border-b border-stone-800 w-36 ml-1.5">&nbsp;</span>
                              )}
                            </div>
                          </div>

                          {/* Structured Voucher Table matching Image */}
                          <div className="border-2 border-stone-900 mt-1">
                            
                            {/* DEBIT SECTION */}
                            <div className="border-b-2 border-stone-900">
                              <div className="flex justify-between border-b border-stone-400 bg-stone-100/70 p-1.5 font-black text-xs">
                                <span className="uppercase">DEBIT</span>
                                <span className="w-24 text-right pr-1">AMOUNT (₹)</span>
                              </div>

                              {voucherData.debit_lines.map((d, dIdx) => (
                                <div key={dIdx} className="flex justify-between p-1.5 border-b border-stone-300 font-medium text-xs">
                                  <span className="flex-1 pr-2 truncate text-stone-900">{d.particulars}</span>
                                  <span className="w-24 text-right font-mono font-bold text-stone-950 pr-1">
                                    {Number(d.amount || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ))}

                              {/* DEBIT Subtotal */}
                              <div className="flex justify-between p-1.5 font-black text-xs bg-stone-50">
                                <span className="uppercase text-right flex-1 pr-4">TOTAL</span>
                                <span className="w-24 text-right font-mono border-l-2 border-stone-900 pr-1">
                                  {Number(voucherData.total_amount || 0).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>

                            {/* CREDIT SECTION */}
                            <div>
                              <div className="flex justify-between border-b border-stone-400 bg-stone-100/70 p-1.5 font-black text-xs">
                                <span className="uppercase">CREDIT</span>
                                <span className="w-24 text-right pr-1">AMOUNT (₹)</span>
                              </div>

                              {voucherData.credit_lines.map((c, cIdx) => (
                                <div key={cIdx} className="flex justify-between p-1.5 border-b border-stone-300 font-medium text-xs">
                                  <span className="flex-1 pr-2 truncate text-stone-900">{c.particulars}</span>
                                  <span className="w-24 text-right font-mono font-bold text-stone-950 pr-1">
                                    {Number(c.amount || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ))}

                              {/* Grand Total Row */}
                              <div className="flex justify-between items-center p-1.5 font-black text-xs bg-stone-100">
                                <div className="flex-1 pr-2 flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-stone-700">
                                    RUPEES: <strong className="text-stone-950">{voucherData.amount_in_words}</strong>
                                  </span>
                                  <span className="uppercase tracking-wider">TOTAL</span>
                                </div>
                                <span className="w-24 text-right font-mono border-l-2 border-stone-900 text-sm font-black pr-1">
                                  {Number(voucherData.total_amount || 0).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Signatory Stamp on Bottom Right */}
                        <div className="flex justify-end pt-8 pb-1">
                          <div className="text-center">
                            <div className="font-bold text-xs text-stone-900">
                              {voucherData.authorised_signatory_name || "Athuorised Signatory"}
                            </div>
                            <span className="text-[8px] text-stone-500 uppercase block">Crayon Box School Accounts</span>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="text-xs font-bold text-slate-500">
                Format: <strong className="text-slate-900">A5 Landscape Payment Voucher &amp; Counterfoil</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintVoucher}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                >
                  <Printer className="w-4 h-4" /> Print A5 Slip
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CREATE PO MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Create Purchase Order (PO)</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    placeholder="e.g. Dell India Pvt Ltd"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Procurement Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="IT Infrastructure">IT Infrastructure</option>
                    <option value="Science Labs">Science Labs</option>
                    <option value="Stationery">Stationery &amp; Examination</option>
                    <option value="Campus Furniture">Campus Furniture</option>
                    <option value="Sports Equipment">Sports Equipment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Order Value (INR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold font-mono text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Items &amp; Line Description</label>
                <textarea
                  value={itemsSummary}
                  onChange={(e) => setItemsSummary(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none"
                  placeholder="Specify items, quantities, and delivery specifications..."
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsNewModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  Issue Purchase Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
