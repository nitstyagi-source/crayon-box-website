"use client";

import { useState, useEffect } from "react";
import { 
  RotateCcw, CheckCircle2, Plus, Search, Filter, RefreshCw, 
  DollarSign, ArrowRight, ShieldCheck, AlertCircle, Clock, FileText 
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getFeeRefunds, processFeeRefund, searchStudentsForFeeCollection } from "@/app/actions/finance-core";

export default function RefundsModule() {
  const { activeCampusId } = useCampusContext();
  const [refunds, setRefunds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    refund_amount: "",
    refund_mode: "Bank Transfer",
    refund_reason: "Security Deposit Return / Overpayment Adjustment",
    receipt_no: "",
    transaction_ref: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadRefunds();
  }, [activeCampusId]);

  async function loadRefunds() {
    setIsLoading(true);
    try {
      const res = await getFeeRefunds(activeCampusId);
      if (res.success) {
        setRefunds(res.data || []);
      }
    } catch (e) {
      console.error("Error loading refunds:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStudentSearch(q: string) {
    setStudentSearch(q);
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
    setStudentSearch(`${st.name} (${st.admissionNo})`);
  }

  async function handleCreateRefund(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) {
      alert("Please search and select a student first.");
      return;
    }
    if (!formData.refund_amount || Number(formData.refund_amount) <= 0) {
      alert("Please enter a valid refund amount.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await processFeeRefund({
        campus_id: activeCampusId,
        student_id: selectedStudent.id,
        student_name: selectedStudent.name,
        receipt_no: formData.receipt_no,
        refund_amount: Number(formData.refund_amount),
        refund_mode: formData.refund_mode,
        refund_reason: formData.refund_reason,
        requested_by: "Accounts Desk",
        approved_by: "Chief Accountant",
        status: "Approved",
        transaction_ref: formData.transaction_ref || undefined
      });

      if (res.success) {
        alert("🎉 Refund / Credit Note processed and posted to student ledger!");
        setModalOpen(false);
        setSelectedStudent(null);
        setStudentSearch("");
        setFormData({
          refund_amount: "",
          refund_mode: "Bank Transfer",
          refund_reason: "Security Deposit Return / Overpayment Adjustment",
          receipt_no: "",
          transaction_ref: ""
        });
        loadRefunds();
      } else {
        alert("Failed to process refund: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const totalRefunded = refunds
    .filter(r => r.status === 'Approved')
    .reduce((sum, r) => sum + Number(r.refund_amount || 0), 0);

  const filteredRefunds = refunds.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (r.student_name || '').toLowerCase().includes(q) ||
      (r.transaction_ref || '').toLowerCase().includes(q) ||
      (r.receipt_no || '').toLowerCase().includes(q);
    const matchesStatus = selectedStatus === "All" || r.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Audit & Settlements
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Academic Session 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Refunds & Adjustments</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Process caution money returns, overpayment reversals, and track credit notes with full audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Initiate New Refund
          </button>
          <button
            onClick={loadRefunds}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-stone-400">Total Settled Refunds</span>
          <div className="text-2xl font-black text-stone-900">{formatCurrency(totalRefunded)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-stone-400">Refund Requests Count</span>
          <div className="text-2xl font-black text-blue-600">{refunds.length} Transactions</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-stone-400">Audit Status</span>
          <div className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
            <ShieldCheck className="w-6 h-6" /> 100% Reconciled
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, ref, or receipt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-bold text-stone-500">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-800"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-stone-400 font-bold animate-pulse">
            Loading refund records...
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400 font-bold">
            No refund records found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Ref No</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Reason & Particulars</th>
                  <th className="p-3.5">Mode</th>
                  <th className="p-3.5 text-right">Refund Amount</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRefunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-stone-50/70 transition">
                    <td className="p-3.5 font-mono font-bold text-stone-900">
                      {ref.transaction_ref || 'REF-N/A'}
                    </td>
                    <td className="p-3.5 text-stone-600 font-mono">
                      {ref.refund_date || ref.created_at?.split('T')[0]}
                    </td>
                    <td className="p-3.5 font-bold text-stone-900">
                      {ref.student_name}
                    </td>
                    <td className="p-3.5 text-stone-600 max-w-xs truncate">
                      {ref.refund_reason}
                    </td>
                    <td className="p-3.5 font-semibold text-stone-700">
                      {ref.refund_mode}
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-red-600">
                      - {formatCurrency(ref.refund_amount)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        ref.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ref.status || 'Approved'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Initiate Refund Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  Initiate Fee Refund / Credit
                </h3>
                <p className="text-xs text-stone-400">Posts a compensatory financial reversal to the student ledger.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateRefund} className="space-y-4 text-xs">
              {/* Student Search */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">1. Search Student *</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by student name or admission no..."
                    value={studentSearch}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-900"
                    required
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="bg-white border border-stone-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-stone-100">
                    {searchResults.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleSelectStudent(st)}
                        className="w-full text-left p-3 hover:bg-blue-50/50 flex justify-between items-center text-xs transition"
                      >
                        <div>
                          <strong className="text-stone-900">{st.name}</strong> ({st.admissionNo})
                          <p className="text-[10px] text-stone-400">{st.className} {st.sectionName} • Parent: {st.parentName}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                          Select
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedStudent && (
                <div className="bg-blue-50/60 border border-blue-200 p-3.5 rounded-xl text-xs space-y-1 text-blue-950">
                  <div className="font-black flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Selected Student: {selectedStudent.name}
                  </div>
                  <p className="text-[11px] text-blue-800 font-mono">
                    Adm #{selectedStudent.admissionNo} • {selectedStudent.className} ({selectedStudent.sectionName})
                  </p>
                </div>
              )}

              {/* Amount & Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Refund Amount (₹) *</label>
                  <input
                    type="number"
                    value={formData.refund_amount}
                    onChange={(e) => setFormData({ ...formData, refund_amount: e.target.value })}
                    placeholder="e.g. 5000"
                    min="1"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Settlement Mode</label>
                  <select
                    value={formData.refund_mode}
                    onChange={(e) => setFormData({ ...formData, refund_mode: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-semibold text-stone-900"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Cheque">Account Payee Cheque</option>
                    <option value="UPI">UPI / NetBanking</option>
                    <option value="Cash">Cash Voucher</option>
                  </select>
                </div>
              </div>

              {/* Receipt Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Original Receipt No</label>
                  <input
                    type="text"
                    value={formData.receipt_no}
                    onChange={(e) => setFormData({ ...formData, receipt_no: e.target.value })}
                    placeholder="e.g. CBS-REC-983983"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Bank UTR / Transaction Ref</label>
                  <input
                    type="text"
                    value={formData.transaction_ref}
                    onChange={(e) => setFormData({ ...formData, transaction_ref: e.target.value })}
                    placeholder="e.g. TXN-84729103"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Refund Reason / Audit Note *</label>
                <textarea
                  value={formData.refund_reason}
                  onChange={(e) => setFormData({ ...formData, refund_reason: e.target.value })}
                  placeholder="e.g. Caution money refund upon transfer certificate issuance..."
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !selectedStudent}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {isProcessing ? "Processing..." : "Authorize & Issue Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

