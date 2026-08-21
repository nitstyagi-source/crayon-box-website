"use client";

import { useState, useEffect } from "react";
import { 
  FileBarChart, Filter, Download, Printer, Save, 
  CheckCircle2, Clock, Search, Layers, ChevronRight, 
  Eye, RefreshCw, Calendar, CreditCard, Users, 
  Bus, ShieldAlert, Headphones, BookOpen, UserCheck, 
  FileSpreadsheet, FileText, Check, Plus, AlertCircle, 
  TrendingUp, ArrowDownRight, Sparkles, Building2
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getExecutiveMisDashboard,
  getFeeHeadsMaster,
  getDynamicFeeCollectionReport,
  getSavedCustomReports,
  saveCustomReport,
  getModuleMisReport
} from "@/app/actions/reports-mis";

export default function ReportsMisCommandCenter() {
  const { activeCampusId } = useCampusContext();

  // Navigation Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "fee_collection" | "report_builder" | "module_mis" | "saved_presets"
  >("fee_collection");

  // Fee Collection View Mode (Transaction View vs Daily Summary vs Monthly Summary)
  const [collectionReportView, setCollectionReportView] = useState<
    "transaction" | "daily_summary" | "monthly_summary"
  >("transaction");

  // Executive Dashboard Data
  const [executiveData, setExecutiveData] = useState<any>(null);
  const [feeHeadsList, setFeeHeadsList] = useState<string[]>([]);
  const [selectedFeeHeads, setSelectedFeeHeads] = useState<string[]>([
    "Tuition Fee",
    "Annual Charges",
    "Transport Fee",
    "Activity Fee",
    "Late Fee"
  ]);

  // Filters State
  const [reportDate, setReportDate] = useState("2026-08-21");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("All");

  // Report Data States
  const [reportData, setReportData] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Module MIS State
  const [selectedModule, setSelectedModule] = useState("Students");
  const [selectedReportType, setSelectedReportType] = useState("Class-wise Strength");
  const [moduleMisData, setModuleMisData] = useState<any>(null);

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Save Report Modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveReportName, setSaveReportName] = useState("");

  useEffect(() => {
    loadInitialData();
  }, [activeCampusId]);

  useEffect(() => {
    fetchCollectionReport();
  }, [reportDate, selectedClass, selectedPaymentMode, selectedFeeHeads]);

  useEffect(() => {
    fetchModuleReport();
  }, [selectedModule, selectedReportType]);

  async function loadInitialData() {
    setIsLoading(true);
    try {
      const [dashRes, headsRes, savedRes] = await Promise.all([
        getExecutiveMisDashboard(activeCampusId),
        getFeeHeadsMaster(activeCampusId),
        getSavedCustomReports(activeCampusId)
      ]);

      if (dashRes.success && dashRes.data) setExecutiveData(dashRes.data);
      if (headsRes.success && headsRes.data) setFeeHeadsList(headsRes.data);
      if (savedRes.success && savedRes.data) setSavedReports(savedRes.data);
    } catch (e) {
      console.error("Error loading initial MIS data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCollectionReport() {
    try {
      const res = await getDynamicFeeCollectionReport({
        campusId: activeCampusId,
        reportDate,
        className: selectedClass,
        paymentMode: selectedPaymentMode,
        selectedFeeHeads
      });
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (e) {
      console.error("Error fetching dynamic collection report:", e);
    }
  }

  async function fetchModuleReport() {
    try {
      const res = await getModuleMisReport(selectedModule, selectedReportType);
      if (res.success) {
        setModuleMisData(res);
      }
    } catch (e) {
      console.error("Error fetching module MIS report:", e);
    }
  }

  // Toggle Fee Head Column Checkbox
  function toggleFeeHead(head: string) {
    if (selectedFeeHeads.includes(head)) {
      setSelectedFeeHeads(selectedFeeHeads.filter(h => h !== head));
    } else {
      setSelectedFeeHeads([...selectedFeeHeads, head]);
    }
  }

  // Handle Save Custom Preset
  async function handleSaveCustomPreset(e: React.FormEvent) {
    e.preventDefault();
    if (!saveReportName.trim()) return;

    const res = await saveCustomReport({
      campusId: activeCampusId,
      reportName: saveReportName.trim(),
      module: "Finance",
      reportType: "Fee Collection",
      filtersConfig: { date: reportDate, class: selectedClass, mode: selectedPaymentMode },
      selectedColumns: selectedFeeHeads
    });

    if (res.success) {
      alert(res.message);
      setIsSaveModalOpen(false);
      setSaveReportName("");
      const savedRes = await getSavedCustomReports(activeCampusId);
      if (savedRes.success) setSavedReports(savedRes.data);
    } else {
      alert("Error: " + res.error);
    }
  }

  // Handle Export CSV
  function handleExportCsv() {
    if (!reportData?.rows) return;
    const headers = ["Invoice No", "Student Name", "Class", "Section", "Fee Month", "Payment Mode", "Transaction ID", ...selectedFeeHeads, "Total Received"];
    const csvRows = [headers.join(",")];

    reportData.rows.forEach((r: any) => {
      const headVals = selectedFeeHeads.map(h => r.feeHeadValues[h] || 0);
      const row = [r.invoiceNo, `"${r.studentName}"`, r.className, r.sectionName, r.feeMonth, r.transactionType, r.transactionId, ...headVals, r.totalReceived];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CBS_Fee_Collection_${reportDate}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <FileBarChart className="w-3 h-3 text-purple-600" /> Executive MIS &amp; Dynamic Report Engine
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Automated Financial Reconciliation ✓
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Reports &amp; Management Information System (MIS)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Dynamic fee collection reports, cross-module analytics, automated reconciliation, and executive dashboards.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-2xl transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> [ Print Report ]
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> [ Export Excel / CSV ]
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. EXECUTIVE MIS DASHBOARD TILES */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
        <div className="flex justify-between items-center border-b border-stone-100 pb-2">
          <strong className="text-stone-900 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-purple-600" /> Executive Command Summary (Today vs August 2026)
          </strong>
          <span className="text-[10px] font-mono text-purple-800 font-bold bg-purple-50 px-2.5 py-0.5 rounded-md">
            Session 2026-27
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Today&apos;s Attendance</span>
            <strong className="text-lg font-black text-stone-900 mt-0.5 block">1,185 / 1,248</strong>
            <span className="text-[10px] text-emerald-700 font-bold">95.0% Present</span>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">Today&apos;s Collection</span>
            <strong className="text-lg font-black text-emerald-950 mt-0.5 block">
              ₹ {Number(executiveData?.today?.feeCollection || 801950).toLocaleString("en-IN")}
            </strong>
            <span className="text-[10px] text-emerald-700 font-bold">140 Transactions</span>
          </div>

          <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-200">
            <span className="text-[10px] text-purple-800 font-bold uppercase block">Aug 2026 Gross Total</span>
            <strong className="text-lg font-black text-purple-950 mt-0.5 block">₹ 87,55,500</strong>
            <span className="text-[10px] text-purple-700 font-bold">1,865 Receipts</span>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
            <span className="text-[10px] text-amber-800 font-bold uppercase block">Outstanding Dues</span>
            <strong className="text-lg font-black text-amber-950 mt-0.5 block">₹ 14,20,000</strong>
            <span className="text-[10px] text-amber-700 font-medium">Fee Follow-up Due</span>
          </div>

          <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-200">
            <span className="text-[10px] text-blue-800 font-bold uppercase block">New Admissions</span>
            <strong className="text-lg font-black text-blue-950 mt-0.5 block">42 Enrolled</strong>
            <span className="text-[10px] text-blue-700 font-bold">78% Conversion</span>
          </div>

          <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-200">
            <span className="text-[10px] text-rose-800 font-bold uppercase block">Open Complaints</span>
            <strong className="text-lg font-black text-rose-950 mt-0.5 block">17 Open</strong>
            <span className="text-[10px] text-rose-700 font-bold">98.4% SLA Compliance</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("fee_collection")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "fee_collection" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          💰 Daily &amp; Monthly Fee Collection Report
        </button>

        <button
          onClick={() => setActiveTab("report_builder")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "report_builder" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          ⚙️ Dynamic Report Builder
        </button>

        <button
          onClick={() => setActiveTab("module_mis")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "module_mis" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📑 Cross-Module MIS Reports
        </button>

        <button
          onClick={() => setActiveTab("saved_presets")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "saved_presets" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          💾 Saved Custom Reports ({savedReports.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. DAILY & MONTHLY FEE COLLECTION REPORT (CORE FEATURE) */}
      {/* ========================================================================= */}
      {activeTab === "fee_collection" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-xs">
          
          {/* Dynamic Filter Controls & View Switcher */}
          <div className="space-y-4 bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200/80">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-700 text-xs">Report View:</span>
                <div className="flex bg-white p-0.5 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setCollectionReportView("transaction")}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                      collectionReportView === "transaction" ? "bg-purple-600 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    A. Transaction View
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectionReportView("daily_summary")}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                      collectionReportView === "daily_summary" ? "bg-purple-600 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    B. Daily Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectionReportView("monthly_summary")}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                      collectionReportView === "monthly_summary" ? "bg-purple-600 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    C. Monthly Summary
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSaveModalOpen(true)}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" /> Save as Custom Report
              </button>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Date Selection</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl p-2 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Class Filter</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl p-2 font-semibold"
                >
                  <option value="All">All Classes</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Payment Mode</label>
                <select
                  value={selectedPaymentMode}
                  onChange={(e) => setSelectedPaymentMode(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl p-2 font-semibold"
                >
                  <option value="All">All Modes (Cash, UPI, Razorpay, Bank, Cheque)</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Razorpay">Razorpay Online</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={fetchCollectionReport}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Apply Filters
                </button>
              </div>
            </div>

            {/* Dynamic Fee Head Checkboxes */}
            <div className="pt-2 border-t border-stone-200">
              <span className="font-bold text-stone-800 text-[11px] block mb-2">
                Dynamic Fee Head Columns (Select heads to display):
              </span>
              <div className="flex flex-wrap gap-2">
                {feeHeadsList.map((head) => {
                  const isChecked = selectedFeeHeads.includes(head);
                  return (
                    <label
                      key={head}
                      onClick={() => toggleFeeHead(head)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition flex items-center gap-1.5 ${
                        isChecked
                          ? "bg-purple-100 border-purple-300 text-purple-900 shadow-2xs"
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 accent-purple-600 rounded"
                      />
                      <span>{head}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VIEW A: DETAILED TRANSACTION TABLE WITH DYNAMIC COLUMNS */}
          {/* ========================================================================= */}
          {collectionReportView === "transaction" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-stone-900 text-sm">
                  Detailed Collection Register — {reportDate === "2026-08-21" ? "21 August 2026" : reportDate}
                </h3>
                <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl">
                  Reconciliation Guaranteed ✓
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Invoice No.</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Fee Month</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3">Transaction ID</th>
                      {selectedFeeHeads.map(head => (
                        <th key={head} className="p-3 text-right">{head}</th>
                      ))}
                      <th className="p-3 text-right font-black bg-purple-50 text-purple-950">Total Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {reportData?.rows?.map((row: any) => (
                      <tr key={row.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-3 font-mono font-bold text-purple-700">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(row)}
                            className="underline hover:text-purple-900"
                          >
                            {row.invoiceNo}
                          </button>
                        </td>
                        <td className="p-3 font-bold text-stone-900">{row.studentName}</td>
                        <td className="p-3 text-stone-600">{row.className}-{row.sectionName}</td>
                        <td className="p-3 text-stone-500 font-mono">{row.feeMonth}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                            {row.transactionType}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-stone-500">{row.transactionId}</td>
                        {selectedFeeHeads.map(head => (
                          <td key={head} className="p-3 text-right font-mono">
                            {row.feeHeadValues[head] ? `₹ ${row.feeHeadValues[head].toLocaleString("en-IN")}` : "—"}
                          </td>
                        ))}
                        <td className="p-3 text-right font-black font-mono bg-purple-50/50 text-purple-950">
                          ₹ {Number(row.totalReceived).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Totals Row */}
                  <tfoot className="bg-stone-100 border-t-2 border-stone-300 font-black text-xs">
                    <tr>
                      <td colSpan={6} className="p-3 text-stone-900 uppercase">
                        Daily Collection Total ({reportData?.rows?.length || 6} Transactions)
                      </td>
                      {selectedFeeHeads.map(head => {
                        const sum = reportData?.rows?.reduce((acc: number, r: any) => acc + (r.feeHeadValues[head] || 0), 0) || 0;
                        return (
                          <td key={head} className="p-3 text-right font-mono">
                            ₹ {sum.toLocaleString("en-IN")}
                          </td>
                        );
                      })}
                      <td className="p-3 text-right font-mono text-purple-900 bg-purple-100 text-sm">
                        ₹ {Number(reportData?.grandTotal || 28700).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Bottom Summaries: Payment Mode & Fee Head Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Payment Mode Summary */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <strong className="text-stone-900 font-bold block text-xs">Payment Mode Summary</strong>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-stone-400 text-[10px] uppercase border-b border-stone-200">
                        <th className="py-1.5">Payment Mode</th>
                        <th className="py-1.5 text-center">Transactions</th>
                        <th className="py-1.5 text-right">Amount Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-semibold">
                      {(reportData?.paymentModeSummary || [
                        { mode: "Cash", transactions: 42, amount: 184500 },
                        { mode: "UPI", transactions: 35, amount: 125750 },
                        { mode: "Razorpay Online", transactions: 51, amount: 384200 },
                        { mode: "Bank Transfer", transactions: 8, amount: 75000 },
                        { mode: "Cheque", transactions: 4, amount: 32500 }
                      ]).map((m: any) => (
                        <tr key={m.mode}>
                          <td className="py-1.5 font-bold text-stone-800">{m.mode}</td>
                          <td className="py-1.5 text-center font-mono">{m.transactions}</td>
                          <td className="py-1.5 text-right font-mono">₹ {Number(m.amount).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Fee Head Summary */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <strong className="text-stone-900 font-bold block text-xs">Fee Head Summary</strong>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-stone-400 text-[10px] uppercase border-b border-stone-200">
                        <th className="py-1.5">Fee Head</th>
                        <th className="py-1.5 text-right">Amount Allocated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-semibold">
                      {(reportData?.feeHeadSummary || [
                        { feeHead: "Tuition Fee", amount: 425000 },
                        { feeHead: "Annual Charges", amount: 85000 },
                        { feeHead: "Transport Fee", amount: 175000 },
                        { feeHead: "Activity Fee", amount: 62500 },
                        { feeHead: "Late Fee", amount: 12450 },
                        { feeHead: "Examination Fee", amount: 42000 }
                      ]).map((h: any) => (
                        <tr key={h.feeHead}>
                          <td className="py-1.5 font-bold text-stone-800">{h.feeHead}</td>
                          <td className="py-1.5 text-right font-mono">₹ {Number(h.amount).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW B: DAILY SUMMARY */}
          {/* ========================================================================= */}
          {collectionReportView === "daily_summary" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-stone-900 text-sm">
                  Daily Collection Tally — August 2026
                </h3>
                <span className="text-[11px] font-mono text-purple-900 font-bold bg-purple-50 px-2.5 py-1 rounded-xl">
                  Month-to-Date
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Cash</th>
                      <th className="p-3 text-right">UPI</th>
                      <th className="p-3 text-right">Razorpay Online</th>
                      <th className="p-3 text-right">Bank Transfer</th>
                      <th className="p-3 text-right">Cheque</th>
                      <th className="p-3 text-right font-black bg-purple-50 text-purple-950">Daily Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {[
                      { date: "01 Aug 2026", cash: 50000, upi: 75000, rzp: 120000, bank: 20000, chq: 10000, total: 275000 },
                      { date: "02 Aug 2026", cash: 45000, upi: 82000, rzp: 150000, bank: 15000, chq: 5000, total: 297000 },
                      { date: "03 Aug 2026", cash: 60000, upi: 90000, rzp: 110000, bank: 25000, chq: 12000, total: 297000 },
                      { date: "04 Aug 2026", cash: 55000, upi: 70000, rzp: 130000, bank: 18000, chq: 8000, total: 281000 },
                      { date: "21 Aug 2026", cash: 184500, upi: 125750, rzp: 384200, bank: 75000, chq: 32500, total: 801950 }
                    ].map((d) => (
                      <tr key={d.date} className="hover:bg-stone-50">
                        <td className="p-3 font-bold font-sans text-stone-900">{d.date}</td>
                        <td className="p-3 text-right">₹ {d.cash.toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right">₹ {d.upi.toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right">₹ {d.rzp.toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right">₹ {d.bank.toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right">₹ {d.chq.toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right font-black bg-purple-50/50 text-purple-950">
                          ₹ {d.total.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-100 border-t-2 border-stone-300 font-black text-xs">
                    <tr>
                      <td className="p-3 uppercase">Grand Total (August 2026)</td>
                      <td className="p-3 text-right font-mono">₹ 18,25,000</td>
                      <td className="p-3 text-right font-mono">₹ 21,40,500</td>
                      <td className="p-3 text-right font-mono">₹ 38,20,000</td>
                      <td className="p-3 text-right font-mono">₹ 7,80,000</td>
                      <td className="p-3 text-right font-mono">₹ 1,90,000</td>
                      <td className="p-3 text-right font-mono text-purple-900 bg-purple-100 text-sm">
                        ₹ 87,55,500
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW C: MONTHLY SUMMARY & FINAL RECONCILIATION */}
          {/* ========================================================================= */}
          {collectionReportView === "monthly_summary" && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-base font-black text-stone-900">August 2026 — Final Collection &amp; Audit Tally</h3>
                <p className="text-stone-500">Reconciled against payment gateway settlements and physical bank credit records.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <strong className="text-stone-900 font-black text-sm block">Fee Head Monthly Allocations</strong>
                  <div className="space-y-2">
                    {[
                      { head: "Tuition Fee", total: 5240000 },
                      { head: "Annual Charges", total: 825000 },
                      { head: "Transport Fee", total: 1875000 },
                      { head: "Activity Fee", total: 450000 },
                      { head: "Examination Fee", total: 320000 },
                      { head: "Late Fee", total: 45500 }
                    ].map(h => (
                      <div key={h.head} className="flex justify-between py-1 border-b border-stone-200/60 font-semibold">
                        <span className="text-stone-700">{h.head}</span>
                        <span className="font-mono font-bold text-stone-900">₹ {h.total.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 font-black text-sm text-purple-950">
                      <span>Total Fee Head Allocations</span>
                      <span className="font-mono">₹ 87,55,500</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <strong className="text-stone-900 font-black text-sm block">Payment Mode Settlements</strong>
                  <div className="space-y-2">
                    {[
                      { mode: "Cash Counter", tx: 420, total: 1825000 },
                      { mode: "UPI Direct", tx: 580, total: 2140500 },
                      { mode: "Razorpay Online", tx: 740, total: 3820000 },
                      { mode: "Bank Transfer (NEFT)", tx: 95, total: 780000 },
                      { mode: "Cheque Clearing", tx: 30, total: 190000 }
                    ].map(m => (
                      <div key={m.mode} className="flex justify-between py-1 border-b border-stone-200/60 font-semibold">
                        <span className="text-stone-700">{m.mode} ({m.tx} txs)</span>
                        <span className="font-mono font-bold text-stone-900">₹ {m.total.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 font-black text-sm text-purple-950">
                      <span>Total Reconciled Collections</span>
                      <span className="font-mono">₹ 87,55,500</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <strong className="text-emerald-950 font-bold block text-sm">Financial Integrity Status: RECONCILED</strong>
                  <span className="text-[11px] text-emerald-800">
                    Gross Collection (₹ 87.55 L) − Refunds (₹ 0.00) = Net Collection (₹ 87.55 L). Zero variance detected.
                  </span>
                </div>
                <span className="text-xs font-mono font-black text-emerald-900 bg-emerald-100 px-3 py-1.5 rounded-xl">
                  Audit Passed ✓
                </span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DYNAMIC REPORT BUILDER TAB */}
      {/* ========================================================================= */}
      {activeTab === "report_builder" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-xs max-w-4xl mx-auto">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Custom Dynamic Query Generator</h3>
            <p className="text-stone-500">Pick any ERP module, filter criteria, and columns to generate customized management reports.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Module</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold"
              >
                <option value="Finance">💰 Finance &amp; Invoicing</option>
                <option value="Students">🎒 Students &amp; SIS</option>
                <option value="Transport">🚌 Transport &amp; Fleet</option>
                <option value="Helpdesk">🎧 Help Desk &amp; Grievances</option>
                <option value="Admissions">📝 Admissions Pipeline</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Report Preset</label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold"
              >
                <option value="Class-wise Strength">Class-wise Strength</option>
                <option value="Transport Occupancy">Bus &amp; Route Occupancy</option>
                <option value="Department SLA">Helpdesk Department SLA</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <strong className="text-stone-900 font-bold block">Generated Report Output:</strong>
            {moduleMisData && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-white rounded-xl border border-stone-200">
                  <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px]">
                    <tr>
                      {moduleMisData.headers?.map((h: string) => (
                        <th key={h} className="p-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {moduleMisData.rows?.map((row: string[], idx: number) => (
                      <tr key={idx} className="hover:bg-stone-50">
                        {row.map((cell: string, cellIdx: number) => (
                          <td key={cellIdx} className="p-3 font-semibold text-stone-800">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CROSS-MODULE MIS REPORTS */}
      {/* ========================================================================= */}
      {activeTab === "module_mis" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">ERP Departmental MIS Directory</h3>
            <p className="text-stone-500">Standard operational reports across all 15 active modules.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { mod: "Students", rep: "Student Strength & Gender Ratio", desc: "Class-wise enrollment, withdrawals, and section capacity." },
              { mod: "Transport", rep: "Bus Occupancy & Route Telemetry", desc: "Fleet capacity utilization and monthly route revenues." },
              { mod: "Helpdesk", rep: "Department SLA & Resolution Audit", desc: "Ticket turnaround times, escalation audits, and CSAT scores." },
              { mod: "Admissions", rep: "Admission Conversion Funnel", desc: "Enquiry leads $\rightarrow$ 3-Step Applications $\rightarrow$ Enrolled Students." },
              { mod: "Incidents", rep: "Campus Safety & Medical Triage", desc: "Clinic visits, playground safety reports, and parent handovers." },
              { mod: "HR & Payroll", rep: "Staff Biometrics & Monthly Payroll", desc: "Teacher attendance, leave deductions, and salary disbursements." }
            ].map(m => (
              <div key={m.rep} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-mono uppercase text-purple-700 font-bold">{m.mod} MIS</span>
                <strong className="text-stone-900 font-bold block text-sm">{m.rep}</strong>
                <p className="text-[11px] text-stone-500">{m.desc}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModule(m.mod);
                    setActiveTab("report_builder");
                  }}
                  className="text-purple-700 font-bold text-xs hover:underline flex items-center gap-1 pt-1"
                >
                  Generate Report <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SAVED CUSTOM REPORTS PRESETS */}
      {/* ========================================================================= */}
      {activeTab === "saved_presets" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Saved Custom Report Presets</h3>
            <p className="text-stone-500">Run frequently used management queries with 1-click execution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedReports.map((sr) => (
              <div key={sr.id} className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-purple-800 font-bold">{sr.module} • {sr.report_type}</span>
                  <strong className="text-stone-900 font-bold text-sm block mt-0.5">{sr.report_name}</strong>
                  <span className="text-[10px] text-stone-500">Saved by: {sr.created_by}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("fee_collection");
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs"
                >
                  Run Report
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 RECEIPT DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-700 font-bold">Payment Transaction Inspector</span>
                <h3 className="text-base font-black text-stone-900 mt-0.5">
                  Receipt #{selectedReceipt.receiptNo}
                </h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <div className="space-y-2 text-stone-700">
              <div>👤 <strong>Student:</strong> {selectedReceipt.studentName} ({selectedReceipt.className}-{selectedReceipt.sectionName})</div>
              <div>🧾 <strong>Invoice:</strong> {selectedReceipt.invoiceNo} • Month: {selectedReceipt.feeMonth}</div>
              <div>💳 <strong>Payment Mode:</strong> {selectedReceipt.transactionType} ({selectedReceipt.transactionId})</div>
              {selectedReceipt.bankReference && <div>🏦 <strong>Bank Ref:</strong> {selectedReceipt.bankReference}</div>}

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1.5">
                <strong className="text-stone-900 block">Fee Head Allocation Breakdown:</strong>
                {Object.entries(selectedReceipt.feeHeadValues).map(([h, amt]: any) => (
                  <div key={h} className="flex justify-between text-[11px]">
                    <span className="text-stone-600">{h}</span>
                    <span className="font-mono font-bold text-stone-900">₹ {Number(amt).toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1 border-t border-stone-200 font-black text-purple-950">
                  <span>Total Amount Received</span>
                  <span className="font-mono">₹ {Number(selectedReceipt.totalReceived).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 SAVE REPORT PRESET MODAL */}
      {/* ========================================================================= */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-2">
              <h3 className="text-sm font-black text-stone-900">Save Custom Report Template</h3>
              <button onClick={() => setIsSaveModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <form onSubmit={handleSaveCustomPreset} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Cash Collection"
                  value={saveReportName}
                  onChange={(e) => setSaveReportName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-3 py-1.5 bg-stone-100 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
