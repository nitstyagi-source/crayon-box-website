"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Receipt, Search, Filter, Edit3, Printer, CheckCircle2, 
  AlertTriangle, Clock, RefreshCw, X, Eye, ShieldCheck, DollarSign,
  Calendar, FileText, ArrowRight, Save
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getInvoices, updateIndividualInvoice } from "@/app/actions/finance-core";

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
  const [isSaving, setIsSaving] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeCampusId) loadData();
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

  function handleOpenEdit(inv: any) {
    setSelectedInvoice(inv);
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

  async function handleSaveInvoice(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateIndividualInvoice({
        id: editFormData.id,
        total_amount: Number(editFormData.total_amount),
        total_discount: Number(editFormData.total_discount || 0),
        total_late_fee: Number(editFormData.total_late_fee || 0),
        amount_paid: Number(editFormData.amount_paid || 0),
        due_date: editFormData.due_date,
        billing_period: editFormData.billing_period,
        status: editFormData.status,
        notes: editFormData.notes
      });

      if (res.success) {
        alert("🎉 Invoice updated successfully and ledger adjusted!");
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
            View, edit, adjust amounts, extend due dates, and print official fee demand notices for individual students.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Invoices
        </button>
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
                <th className="py-4 px-6">Total Billed</th>
                <th className="py-4 px-6">Paid</th>
                <th className="py-4 px-6">Net Due</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-stone-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading student invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-stone-400">
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

      {/* Edit Individual Invoice Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900">Edit Individual Invoice</h3>
                <p className="text-xs text-stone-400">{editFormData.invoice_number} • {editFormData.student_name} (#{editFormData.admission_no})</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs">
              
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Total Bill Amount (₹)</label>
                  <input
                    type="number"
                    value={editFormData.total_amount}
                    onChange={(e) => setEditFormData({ ...editFormData, total_amount: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-black text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={editFormData.amount_paid}
                    onChange={(e) => setEditFormData({ ...editFormData, amount_paid: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-emerald-700 font-black text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Discount / Concession (₹)</label>
                  <input
                    type="number"
                    value={editFormData.total_discount}
                    onChange={(e) => setEditFormData({ ...editFormData, total_discount: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-purple-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Late Fee Fine (₹)</label>
                  <input
                    type="number"
                    value={editFormData.total_late_fee}
                    onChange={(e) => setEditFormData({ ...editFormData, total_late_fee: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-red-700"
                  />
                </div>
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

              <div>
                <label className="font-bold text-stone-700 block mb-1">Admin Notes / Adjustment Reason</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="e.g. 15-day due date extension approved by Principal"
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold"
                />
              </div>

              {/* Net Balance Calculated Preview */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70 flex justify-between items-center text-xs">
                <span className="font-bold text-stone-600">Calculated Net Due:</span>
                <span className="font-black font-mono text-amber-600 text-sm">
                  {formatCurrency(Math.max(0, Number(editFormData.total_amount || 0) + Number(editFormData.total_late_fee || 0) - Number(editFormData.total_discount || 0) - Number(editFormData.amount_paid || 0)))}
                </span>
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
                  {isSaving ? "Saving..." : "Save Invoice Changes"}
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
                <h3 className="text-lg font-black text-stone-900">Official Fee Demand Note</h3>
                <p className="text-xs text-stone-400">{selectedInvoice.invoice_number}</p>
              </div>
              <button onClick={() => setPrintModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <div ref={printRef} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs font-sans">
              <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                <div>
                  <h2 className="text-base font-black text-stone-900">CRAYON BOX SCHOOL</h2>
                  <p className="text-[10px] text-stone-500">Main Campus • CB-AFF-2026 • New Delhi</p>
                  <p className="text-[10px] text-stone-400">Tel: +91 98100 81008 • accounts@crayonboxschool.com</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-stone-900 bg-stone-100 px-2 py-1 rounded-md">
                    {selectedInvoice.invoice_number}
                  </span>
                  <p className="text-[10px] text-stone-400 mt-1">Due: {selectedInvoice.due_date || '2026-04-10'}</p>
                  <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-stone-400">Student:</span> <strong className="text-stone-800">{selectedInvoice.student_name || selectedInvoice.students?.first_name}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Admission No:</span> <strong className="text-stone-800">{selectedInvoice.admission_no || selectedInvoice.students?.admission_no}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Class:</span> <strong className="text-stone-800">{selectedInvoice.class_name} {selectedInvoice.section_name}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Billing Period:</span> <strong className="text-stone-800">{selectedInvoice.billing_period}</strong>
                </div>
              </div>

              <div className="border-t border-b border-stone-100 py-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Gross Tuition & Annual Charges:</span>
                  <strong className="text-stone-900">{formatCurrency(selectedInvoice.total_amount)}</strong>
                </div>
                {Number(selectedInvoice.total_discount) > 0 && (
                  <div className="flex justify-between text-purple-700">
                    <span>Authorized Concession:</span>
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
                <div className="flex justify-between text-base font-black text-amber-700 pt-1 border-t border-dashed border-stone-200">
                  <span>Net Payable Amount:</span>
                  <span>{formatCurrency(Math.max(0, Number(selectedInvoice.total_amount || 0) + Number(selectedInvoice.total_late_fee || 0) - Number(selectedInvoice.total_discount || 0) - Number(selectedInvoice.amount_paid || 0)))}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-2 text-[10px] text-stone-400">
                <div>
                  <p>Authorized Signatory: Accounts Department</p>
                  <p className="italic">Payable online via parent portal or at reception fee desk.</p>
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
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Demand Slip
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
