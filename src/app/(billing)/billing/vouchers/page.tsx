"use client";

import React, { useState, useEffect } from "react";
import { 
  Banknote, Plus, Search, Printer, RefreshCw, 
  CheckCircle2, Calendar, FileText, User
} from "lucide-react";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { getSchoolExpenses, createSchoolExpense } from "@/app/actions/expenses";
import PaymentVoucherA5 from "@/components/finance/PaymentVoucherA5";

export default function BillingVouchersPage() {
  const { currentInstitution } = useInstitution();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // New Voucher Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePrintVoucher, setActivePrintVoucher] = useState<any>(null);

  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: "Stationery",
    expense_head: "Office & Printing Supplies",
    vendor_payee: "",
    amount: "",
    payment_mode: "Cash",
    payment_ref_no: "",
    bill_no: "",
    description: "Counter petty cash expense disbursement"
  });

  useEffect(() => {
    loadExpenses();
  }, [currentInstitution]);

  async function loadExpenses() {
    setIsLoading(true);
    try {
      const res = await getSchoolExpenses({ campusId: currentInstitution });
      if (res.success) {
        setExpenses(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateVoucher(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createSchoolExpense({
        campusId: currentInstitution,
        expenseDate: formData.expense_date,
        department: "Accounts",
        category: formData.category,
        expenseHead: formData.expense_head,
        vendorPayee: formData.vendor_payee,
        amount: Number(formData.amount),
        paymentMode: formData.payment_mode,
        paymentRefNo: formData.payment_ref_no,
        billNo: formData.bill_no,
        description: formData.description
      });
      if (res.success) {
        setIsModalOpen(false);
        await loadExpenses();
        // Prompt to print immediately
        const createdData = res.data as any;
        setActivePrintVoucher({
          ...formData,
          amount: Number(formData.amount),
          voucher_no: createdData?.voucher_no || createdData?.id || `PV-${Date.now().toString().slice(-4)}`
        });
      } else {
        alert(res.error || "Failed to create payment voucher");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const filtered = expenses.filter((ex) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      (ex.vendor_payee && ex.vendor_payee.toLowerCase().includes(q)) ||
      (ex.expense_head && ex.expense_head.toLowerCase().includes(q)) ||
      (ex.voucher_no && ex.voucher_no.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs">
        <div>
          <h2 className="text-xl font-serif font-black text-slate-900 flex items-center gap-2">
            <Banknote className="w-6 h-6 text-amber-600" />
            Payment Vouchers &amp; Cash Disbursements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record counter vendor payouts, staff petty cash advances, and print authenticated A-5 payment vouchers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#0F2942] hover:bg-[#1A365D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" /> New Payment Voucher
        </button>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-xs overflow-hidden">
        <div className="p-3 border-b border-[#E8DFC8]">
          <input
            type="text"
            placeholder="Search vouchers by Payee, Expense Head, or Voucher No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl text-xs font-medium focus:outline-none focus:bg-white"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading payment vouchers...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">No vouchers recorded. Click &quot;New Payment Voucher&quot; to issue one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] text-[10px] font-bold uppercase text-slate-600 border-b border-[#E8DFC8]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Payee / Vendor</th>
                  <th className="py-2.5 px-3">Expense Head</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-center">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFC8]">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-amber-50/30">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                      {new Date(v.expense_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{v.vendor_payee}</td>
                    <td className="py-2.5 px-3 text-slate-700">{v.expense_head}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-slate-700 text-[10px] font-bold">
                        {v.payment_mode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                      ₹{Number(v.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setActivePrintVoucher(v)}
                        className="px-2.5 py-1 bg-[#0F2942] text-white hover:bg-[#1A365D] rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" /> A-5
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE VOUCHER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-300 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h3 className="text-base font-black text-[#0F2942] flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-600" /> Issue Cash Payment Voucher
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={formData.payment_mode}
                    onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl font-bold"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payee / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar / Agarwal Stationers"
                  value={formData.vendor_payee}
                  onChange={(e) => setFormData({ ...formData, vendor_payee: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl font-black text-sm text-[#0F2942]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl font-bold"
                  >
                    <option value="Stationery">Stationery</option>
                    <option value="Repairs">Repairs &amp; Maintenance</option>
                    <option value="Cleaning">Cleaning / Hygiene</option>
                    <option value="Transport">Transport Fuel</option>
                    <option value="Refreshment">Staff Refreshment</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Particulars / Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 rounded-xl font-bold text-stone-700 hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0F2942] hover:bg-[#1A365D] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save & Print Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT VOUCHER MODAL */}
      {activePrintVoucher && (
        <PaymentVoucherA5
          expense={activePrintVoucher}
          onClose={() => setActivePrintVoucher(null)}
        />
      )}
    </div>
  );
}
