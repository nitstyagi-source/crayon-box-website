"use client";

import { useState, useEffect } from "react";
import { 
  Receipt, DollarSign, Plus, Search, Filter, 
  Printer, CheckCircle2, Clock, AlertCircle, 
  Building2, ArrowRight, Download, Check, X, 
  FileText, Calendar, Wallet, Layers, TrendingUp
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getExpenseDashboardStats,
  getSchoolExpenses,
  createSchoolExpense,
  updateExpenseStatus,
  getVendorsList,
  createVendor,
  getPettyCashLogs,
  getExpenseBudgets
} from "@/app/actions/expenses";
import PaymentVoucherA5 from "@/components/finance/PaymentVoucherA5";

const EXPENSE_CATEGORIES = [
  "All",
  "Stationery",
  "Electricity",
  "Water",
  "Rent",
  "Maintenance",
  "Repairs",
  "Salary/Wages",
  "Transport",
  "Cleaning",
  "Security",
  "Events",
  "Sports",
  "Lab",
  "Computer/IT",
  "Marketing",
  "Printing",
  "Furniture",
  "Books",
  "Uniform",
  "Miscellaneous"
];

const PAYMENT_MODES = ["All", "Cash", "Bank Transfer", "UPI", "Cheque", "Card", "Petty Cash"];
const STATUSES = ["All", "Pending", "Approved", "Paid", "Cancelled"];

export default function ExpensesManagerPage() {
  const { activeCampusId } = useCampusContext();

  // Navigation Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "register" | "new_expense" | "petty_cash" | "vendors" | "budgets"
  >("register");

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [pettyCashLogs, setPettyCashLogs] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Voucher Generation State
  const [selectedVoucherExpense, setSelectedVoucherExpense] = useState<any>(null);

  // New Expense Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    expenseDate: new Date().toISOString().split("T")[0],
    department: "Academics",
    category: "Stationery",
    expenseHead: "Class Notebooks & Examination Paper",
    vendorPayee: "ABC Stationers & Book Depot",
    description: "Purchase of examination stationery & class registers",
    particularsText: "Class Notebooks (Pack of 50): 4500\nTeacher Attendance Registers: 1500",
    amount: 6000,
    paymentMode: "Cash",
    paymentRefNo: "",
    billNo: "INV-2548",
    billDate: new Date().toISOString().split("T")[0],
    bankName: "HDFC Bank",
    chequeNo: "",
    remarks: "Authorized for Primary Wing."
  });

  // New Vendor Form State
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    vendorName: "",
    contactPerson: "",
    mobile: "",
    email: "",
    address: "",
    gstNumber: "",
    category: "Stationery"
  });

  useEffect(() => {
    loadAllData();
  }, [activeCampusId, selectedCategory, selectedPaymentMode, selectedStatus, searchQuery]);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [statsRes, expRes, venRes, pcRes, budRes] = await Promise.all([
        getExpenseDashboardStats(activeCampusId),
        getSchoolExpenses({
          campusId: activeCampusId,
          category: selectedCategory,
          paymentMode: selectedPaymentMode,
          status: selectedStatus,
          search: searchQuery
        }),
        getVendorsList(activeCampusId),
        getPettyCashLogs(activeCampusId),
        getExpenseBudgets(activeCampusId)
      ]);

      if (statsRes.success && statsRes.data) setDashboardStats(statsRes.data);
      if (expRes.success && expRes.data) setExpenses(expRes.data);
      if (venRes.success && venRes.data) setVendors(venRes.data);
      if (pcRes.success && pcRes.data) setPettyCashLogs(pcRes.data);
      if (budRes.success && budRes.data) setBudgets(budRes.data);
    } catch (e) {
      console.error("Error loading expenses data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // Create Expense Submit
  async function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!expenseForm.vendorPayee || !expenseForm.amount) return;

    setIsSubmitting(true);
    try {
      // Parse particulars lines
      const particulars = expenseForm.particularsText
        .split("\n")
        .filter(l => l.trim().length > 0)
        .map(line => {
          const parts = line.split(":");
          if (parts.length >= 2) {
            return { item: parts[0].trim(), amount: Number(parts[1].trim()) || 0 };
          }
          return { item: line.trim(), amount: Number(expenseForm.amount) };
        });

      const res = await createSchoolExpense({
        campusId: activeCampusId,
        expenseDate: expenseForm.expenseDate,
        department: expenseForm.department,
        category: expenseForm.category,
        expenseHead: expenseForm.expenseHead,
        vendorPayee: expenseForm.vendorPayee,
        description: expenseForm.description,
        particulars,
        amount: Number(expenseForm.amount),
        paymentMode: expenseForm.paymentMode,
        paymentRefNo: expenseForm.paymentRefNo,
        billNo: expenseForm.billNo,
        billDate: expenseForm.billDate,
        bankName: expenseForm.bankName,
        chequeNo: expenseForm.chequeNo,
        remarks: expenseForm.remarks
      });

      if (res.success) {
        alert(res.message);
        setActiveTab("register");
        loadAllData();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Approve / Pay
  async function handleUpdateStatus(expenseId: string, status: "Approved" | "Paid" | "Cancelled") {
    const res = await updateExpenseStatus({ expenseId, status });
    if (res.success) {
      loadAllData();
    } else {
      alert("Error: " + res.error);
    }
  }

  // Create Vendor Submit
  async function handleCreateVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorForm.vendorName.trim()) return;

    const res = await createVendor({
      campusId: activeCampusId,
      ...vendorForm
    });

    if (res.success) {
      alert(res.message);
      setIsVendorModalOpen(false);
      loadAllData();
    } else {
      alert("Error: " + res.error);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Receipt className="w-3 h-3 text-amber-700" /> Expense Management &amp; Vouchers
            </span>
            <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              A5 Print-Ready Voucher Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            School Expense Ledger &amp; Payment Vouchers
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage expense entry $\rightarrow$ approval $\rightarrow$ payment $\rightarrow$ 1-click A5 payment voucher generation matching physical counterfoil standard.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("new_expense")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> [ + Record New Expense ]
          </button>
        </div>
      </div>

      {/* KPI Financial Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">Today&apos;s Expense</span>
          <strong className="text-xl font-black text-stone-900 block">
            ₹ {(dashboardStats?.todaysExpense || 35500).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="bg-purple-50/60 p-4 rounded-3xl border border-purple-200 shadow-xs space-y-1">
          <span className="text-[10px] text-purple-800 font-bold uppercase block">This Month&apos;s Total</span>
          <strong className="text-xl font-black text-purple-950 block">
            ₹ {(dashboardStats?.thisMonthExpense || 845000).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-3xl border border-amber-200 shadow-xs space-y-1">
          <span className="text-[10px] text-amber-800 font-bold uppercase block">Pending Approval</span>
          <strong className="text-xl font-black text-amber-950 block">
            ₹ {(dashboardStats?.pendingApproval || 125000).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="bg-blue-50/60 p-4 rounded-3xl border border-blue-200 shadow-xs space-y-1">
          <span className="text-[10px] text-blue-800 font-bold uppercase block">Pending Payment</span>
          <strong className="text-xl font-black text-blue-950 block">
            ₹ {(dashboardStats?.pendingPayment || 65000).toLocaleString("en-IN")}
          </strong>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("register")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "register" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📜 Expense Register ({expenses.length})
        </button>

        <button
          onClick={() => setActiveTab("new_expense")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "new_expense" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          ➕ Record Expense
        </button>

        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "dashboard" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📊 Category Breakdown
        </button>

        <button
          onClick={() => setActiveTab("petty_cash")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "petty_cash" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🏦 Petty Cash ({pettyCashLogs.length})
        </button>

        <button
          onClick={() => setActiveTab("vendors")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "vendors" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🏢 Vendors Master ({vendors.length})
        </button>

        <button
          onClick={() => setActiveTab("budgets")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "budgets" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📈 Annual Budgets
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. EXPENSE REGISTER & VOUCHER GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === "register" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          
          {/* Toolbar Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-stone-100 pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search payee, head, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-900"
              >
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
              </select>

              <select
                value={selectedPaymentMode}
                onChange={(e) => setSelectedPaymentMode(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-900"
              >
                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m === "All" ? "All Payment Modes" : m}</option>)}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-900"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
              </select>
            </div>

            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
              {expenses.length} Records
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Date &amp; Payee</th>
                  <th className="p-3.5">Expense Head &amp; Category</th>
                  <th className="p-3.5">Description &amp; Items</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5">Payment Mode</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Voucher &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-stone-50/70 transition">
                    
                    <td className="p-3.5">
                      <strong className="text-stone-900 font-bold text-xs block">{exp.vendor_payee}</strong>
                      <span className="text-[10px] font-mono text-stone-400">{exp.expense_date}</span>
                    </td>

                    <td className="p-3.5">
                      <strong className="text-stone-900 font-bold block">{exp.expense_head}</strong>
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.2 rounded">
                        {exp.category} • {exp.department}
                      </span>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <p className="text-[11px] text-stone-600 line-clamp-2">{exp.description}</p>
                      {exp.bill_no && (
                        <span className="text-[10px] text-stone-400 font-mono">
                          Bill: {exp.bill_no} ({exp.bill_date})
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right font-sans font-black text-stone-900 text-sm">
                      ₹ {Number(exp.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-stone-800 block">{exp.payment_mode}</span>
                      {exp.payment_ref_no && (
                        <span className="text-[10px] font-mono text-stone-400">{exp.payment_ref_no}</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl block w-fit ${
                        exp.status === "Paid" ? "bg-emerald-100 text-emerald-900" :
                        exp.status === "Approved" ? "bg-blue-100 text-blue-900" :
                        exp.status === "Pending" ? "bg-amber-100 text-amber-900" :
                        "bg-stone-100 text-stone-700"
                      }`}>
                        {exp.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right space-x-1.5">
                      {exp.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(exp.id, "Approved")}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-2xs"
                        >
                          Approve
                        </button>
                      )}

                      {exp.status === "Approved" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(exp.id, "Paid")}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs"
                        >
                          Mark Paid
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedVoucherExpense(exp)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-black text-[11px] rounded-lg shadow-2xs inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" /> [ Generate A5 Voucher ]
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RECORD NEW EXPENSE TAB */}
      {/* ========================================================================= */}
      {activeTab === "new_expense" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 max-w-3xl mx-auto text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Record New Expense</h3>
            <p className="text-xs text-stone-500">
              Enter expense details and generate an instant A5 payment voucher. Auto-approval applies for amounts $\le$ ₹2,000.
            </p>
          </div>

          <form onSubmit={handleCreateExpense} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Expense Date *</label>
                <input
                  type="date"
                  required
                  value={expenseForm.expenseDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Category *</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                >
                  {EXPENSE_CATEGORIES.filter(c => c !== "All").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Department</label>
                <input
                  type="text"
                  value={expenseForm.department}
                  onChange={(e) => setExpenseForm({ ...expenseForm, department: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Payee / Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Stationers & Book Depot"
                  value={expenseForm.vendorPayee}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendorPayee: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Expense Head *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stationery, Electrical Maintenance"
                  value={expenseForm.expenseHead}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseHead: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Description</label>
              <textarea
                rows={2}
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium text-stone-900"
              />
            </div>

            {/* Particulars Breakdown */}
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 space-y-1.5">
              <label className="font-bold text-purple-950 block">Itemized Particulars (Item Name: Amount)</label>
              <textarea
                rows={2}
                value={expenseForm.particularsText}
                onChange={(e) => setExpenseForm({ ...expenseForm, particularsText: e.target.value })}
                placeholder="Class Notebooks: 4500&#10;Attendance Registers: 1500"
                className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-mono"
              />
              <span className="text-[10px] text-purple-800">Enter each item on a new line with colon and amount</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Total Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-black text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Payment Mode *</label>
                <select
                  value={expenseForm.paymentMode}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paymentMode: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                >
                  {PAYMENT_MODES.filter(m => m !== "All").map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Bill / Invoice No.</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2548"
                  value={expenseForm.billNo}
                  onChange={(e) => setExpenseForm({ ...expenseForm, billNo: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono text-stone-900"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-xs"
              >
                {isSubmitting ? "Saving..." : "[ Save Expense & Ready Voucher ]"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CATEGORY BREAKDOWN TAB */}
      {/* ========================================================================= */}
      {activeTab === "dashboard" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Monthly Expense Category Breakdown</h3>
            <p className="text-xs text-stone-500">Distribution of operational spending for current academic session.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(dashboardStats?.categoryBreakdown?.length ? dashboardStats.categoryBreakdown : [
              { category: "Salary/Wages", amount: 2500000 },
              { category: "Electricity", amount: 120000 },
              { category: "Maintenance", amount: 85000 },
              { category: "Stationery", amount: 45000 },
              { category: "Transport", amount: 60000 },
              { category: "Cleaning", amount: 36000 }
            ]).map((c: any) => (
              <div key={c.category} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-stone-900 font-bold">{c.category}</strong>
                  <span className="font-mono font-black text-purple-700">
                    ₹ {Number(c.amount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${Math.min(100, (c.amount / 500000) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PETTY CASH TAB */}
      {/* ========================================================================= */}
      {activeTab === "petty_cash" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Petty Cash Daily Log &amp; Replenishment</h3>
              <p className="text-xs text-stone-500">Running cash balance and daily small expenses register.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Current Cash Balance</span>
              <strong className="text-base font-black text-emerald-700">₹ 12,500.00</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Transaction Type</th>
                  <th className="p-3">Particulars</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">Running Balance</th>
                  <th className="p-3">Cashier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {pettyCashLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70">
                    <td className="p-3 font-mono">{log.log_date}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.transaction_type === "Replenishment" || log.transaction_type === "Opening" ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"
                      }`}>
                        {log.transaction_type}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-stone-800">{log.particulars}</td>
                    <td className="p-3 text-right font-mono font-bold">₹ {Number(log.amount).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right font-mono font-black text-purple-900">₹ {Number(log.running_balance).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-stone-500">{log.cashier_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VENDORS MASTER TAB */}
      {/* ========================================================================= */}
      {activeTab === "vendors" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Registered School Vendors ({vendors.length})</h3>
              <p className="text-xs text-stone-500">Vendor master with GST details, category, and total procurement volume.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsVendorModalOpen(true)}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> [ + Add Vendor ]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map((v) => (
              <div key={v.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-stone-900 font-bold text-sm block">{v.vendor_name}</strong>
                    <span className="text-[11px] text-stone-500 font-semibold">{v.category} • Contact: {v.contact_person}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Total: ₹ {Number(v.total_paid || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-[11px] text-stone-600 space-y-0.5">
                  <div>📞 {v.mobile} • ✉️ {v.email}</div>
                  <div>📍 {v.address}</div>
                  {v.gst_number && <div className="font-mono text-[10px]">GST: {v.gst_number}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ANNUAL BUDGETS TAB */}
      {/* ========================================================================= */}
      {activeTab === "budgets" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Academic Year 2026–2027 Budget vs Actual</h3>
            <p className="text-xs text-stone-500">Monitor budget utilization thresholds with automated expenditure alerts.</p>
          </div>

          <div className="space-y-3">
            {budgets.map((b) => {
              const allocated = Number(b.allocated_budget) || 1;
              const spent = Number(b.actual_spent) || 0;
              const pct = Math.min(100, Math.round((spent / allocated) * 100));
              const remaining = allocated - spent;

              return (
                <div key={b.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong className="text-stone-900 font-bold block text-sm">{b.expense_head}</strong>
                      <span className="text-[11px] text-stone-500 font-mono">
                        Budget: ₹ {allocated.toLocaleString("en-IN")} • Actual Spent: ₹ {spent.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-black font-mono ${pct > 80 ? "text-red-700" : "text-emerald-700"}`}>
                        {pct}% Utilized
                      </span>
                      <span className="text-[10px] text-stone-500 block font-mono">
                        Balance: ₹ {remaining.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct > 85 ? "bg-red-600" : pct > 60 ? "bg-amber-500" : "bg-emerald-600"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 1-CLICK A5 PAYMENT VOUCHER POPUP MODAL */}
      {/* ========================================================================= */}
      {selectedVoucherExpense && (
        <PaymentVoucherA5
          expense={selectedVoucherExpense}
          onClose={() => setSelectedVoucherExpense(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* 🌟 CREATE VENDOR MODAL */}
      {/* ========================================================================= */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900">Add New Vendor</h3>
              <button onClick={() => setIsVendorModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Stationers"
                  value={vendorForm.vendorName}
                  onChange={(e) => setVendorForm({ ...vendorForm, vendorName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Mobile</label>
                  <input
                    type="tel"
                    value={vendorForm.mobile}
                    onChange={(e) => setVendorForm({ ...vendorForm, mobile: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">GST Number</label>
                <input
                  type="text"
                  placeholder="07AAAAA0000A1Z5"
                  value={vendorForm.gstNumber}
                  onChange={(e) => setVendorForm({ ...vendorForm, gstNumber: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
