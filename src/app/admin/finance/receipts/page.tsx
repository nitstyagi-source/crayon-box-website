"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Receipt, Search, Filter, Printer, AlertTriangle, 
  CheckCircle2, XCircle, RefreshCw, Eye, QrCode, ShieldAlert,
  ArrowRightLeft, FileText, Ban
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getOfficialReceipts, cancelFeeReceipt } from "@/app/actions/finance-core";

export default function OfficialReceiptsHubPage() {
  const { activeCampusId } = useCampusContext();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const printModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReceipts();
  }, [activeCampusId, selectedMode, selectedStatus]);

  async function loadReceipts() {
    setIsLoading(true);
    try {
      const res = await getOfficialReceipts(activeCampusId, {
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

  function handleOpenCancel(r: any) {
    setSelectedReceipt(r);
    setCancellationReason("");
    setCancelModalOpen(true);
  }

  async function handleConfirmCancellation(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReceipt) return;
    if (!cancellationReason.trim()) {
      alert("Please provide a cancellation reason for financial audit.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await cancelFeeReceipt(selectedReceipt.id, cancellationReason, 'Chief Accountant');
      if (res.success) {
        alert("Receipt cancelled and compensatory ledger reversal posted.");
        setCancelModalOpen(false);
        setSelectedReceipt(null);
        loadReceipts();
      } else {
        alert("Cancellation failed: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handlePrintReceipt() {
    window.print();
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Audit-Proof Financial Records
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Session 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Official Fee Receipts Hub</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Browse verified receipts, print duplicate tax invoices, and manage safe cancellation workflows.
          </p>
        </div>

        <button
          onClick={loadReceipts}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Receipt #, Student Name, or Admission #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') loadReceipts(); }}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">Payment Mode:</span>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="text-xs font-bold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Modes</option>
              <option value="UPI">UPI / QR</option>
              <option value="Cash">Cash Counter</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-bold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Fully Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Cancelled">Cancelled (Reversed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 text-[11px] font-black uppercase tracking-wider text-stone-500">
                <th className="py-4 px-6">Receipt #</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Student Details</th>
                <th className="py-4 px-6">Class / Section</th>
                <th className="py-4 px-6">Amount Paid</th>
                <th className="py-4 px-6">Balance Due</th>
                <th className="py-4 px-6">Mode</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-stone-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading receipts directory...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-stone-400">
                    No fee receipts match your criteria.
                  </td>
                </tr>
              ) : (
                receipts.map((r) => {
                  const isCancelled = r.status === "Cancelled";
                  return (
                    <tr key={r.id} className={`hover:bg-stone-50/60 transition ${isCancelled ? 'bg-red-50/20 opacity-60' : ''}`}>
                      <td className="py-4 px-6 font-mono font-black text-stone-900">
                        {r.receipt_no}
                      </td>
                      <td className="py-4 px-6 text-stone-600">
                        {r.receipt_date}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-stone-900">{r.student_name}</div>
                        <div className="text-[11px] text-stone-400 font-mono">#{r.admission_no}</div>
                      </td>
                      <td className="py-4 px-6 text-stone-700 font-semibold">
                        {r.class_name} {r.section_name}
                      </td>
                      <td className="py-4 px-6 font-black text-emerald-700">
                        {formatCurrency(r.net_amount_paid)}
                      </td>
                      <td className="py-4 px-6 font-mono text-stone-500">
                        {Number(r.remaining_balance) > 0 ? (
                          <span className="text-amber-600 font-bold">{formatCurrency(r.remaining_balance)}</span>
                        ) : "₹0"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                          {r.payment_mode}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          isCancelled
                            ? "bg-red-100 text-red-800"
                            : r.status === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedReceipt(r)}
                            className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View & Print Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isCancelled && (
                            <button
                              onClick={() => handleOpenCancel(r)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Cancel Receipt (Reversal)"
                            >
                              <Ban className="w-4 h-4" />
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

      {/* Receipt View & Print Modal */}
      {selectedReceipt && !cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900">Official Fee Receipt</h3>
                <p className="text-xs text-stone-400">{selectedReceipt.receipt_no}</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            {/* Printable Content */}
            <div ref={printModalRef} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs font-sans">
              <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                <div>
                  <h2 className="text-base font-black text-stone-900">CRAYON BOX SCHOOL</h2>
                  <p className="text-[10px] text-stone-500">Main Campus • CB-AFF-2026 • New Delhi</p>
                  <p className="text-[10px] text-stone-400">Tel: +91 98100 81008 • accounts@crayonboxschool.com</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-stone-900 bg-stone-100 px-2 py-1 rounded-md">
                    {selectedReceipt.receipt_no}
                  </span>
                  <p className="text-[10px] text-stone-400 mt-1">Date: {selectedReceipt.receipt_date}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    selectedReceipt.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-stone-400">Student:</span> <strong className="text-stone-800">{selectedReceipt.student_name}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Admission No:</span> <strong className="text-stone-800">{selectedReceipt.admission_no}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Class & Section:</span> <strong className="text-stone-800">{selectedReceipt.class_name} {selectedReceipt.section_name}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Parent Name:</span> <strong className="text-stone-800">{selectedReceipt.parent_name}</strong>
                </div>
              </div>

              <div className="border-t border-b border-stone-100 py-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <strong className="text-stone-900">{selectedReceipt.payment_mode} ({selectedReceipt.transaction_ref || 'N/A'})</strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Total Bill Demand:</span>
                  <span>{formatCurrency(selectedReceipt.total_amount_due)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-emerald-700 pt-1 border-t border-dashed border-stone-200">
                  <span>Total Amount Paid:</span>
                  <span>{formatCurrency(selectedReceipt.net_amount_paid)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Remaining Balance:</span>
                  <span className="font-bold text-amber-600">{formatCurrency(selectedReceipt.remaining_balance)}</span>
                </div>
              </div>

              {selectedReceipt.status === 'Cancelled' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-800 space-y-1">
                  <div className="font-bold">⚠️ REVERSED & CANCELLED RECEIPT</div>
                  <p>Reason: {selectedReceipt.cancellation_reason}</p>
                  <p>Cancelled By: {selectedReceipt.cancelled_by} on {selectedReceipt.cancelled_at?.split('T')[0]}</p>
                </div>
              )}

              <div className="flex justify-between items-end pt-2 text-[10px] text-stone-400">
                <div>
                  <p>Cashier: {selectedReceipt.collected_by || 'Accounts Desk'}</p>
                  <p className="italic">This is a system-generated electronic receipt.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <span className="text-[8px] font-mono">Scan to Verify</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Cancellation Modal */}
      {cancelModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-red-600 flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5" /> Cancel Receipt
                </h3>
                <p className="text-xs text-stone-400">Receipt #{selectedReceipt.receipt_no}</p>
              </div>
              <button onClick={() => setCancelModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleConfirmCancellation} className="space-y-4 text-xs">
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-900 space-y-1">
                <p className="font-bold">Financial Audit Protection:</p>
                <p className="text-[11px] opacity-90">
                  This action will mark the receipt as Cancelled and post an automatic <strong>Debit Reversal</strong> of {formatCurrency(selectedReceipt.net_amount_paid)} to the student's ledger. The transaction will never be deleted.
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
                  disabled={isProcessing}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isProcessing ? "Reversing..." : "Confirm & Post Reversal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
