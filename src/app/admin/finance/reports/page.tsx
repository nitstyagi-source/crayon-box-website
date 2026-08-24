"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  FileText, Download, Printer, Filter, Calendar, 
  IndianRupee, Search, RefreshCw, Layers, CheckCircle2,
  Building2, Users, Receipt, BookOpen, AlertCircle, BarChart3,
  CreditCard, Smartphone, Banknote, ShieldAlert, TrendingUp, Sparkles,
  Settings2, CheckSquare, Square, X, SlidersHorizontal, ArrowUpDown
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { 
  getDailyManagementReportAction, 
  getMonthlyManagementReportAction,
  getAvailableFeeMasterColumnsAction,
  ReportTransactionItem,
  DayBookChannelGroup,
  DayBookColumnDef,
  DailyRollupItem,
  MonthlyGrandTotal
} from "@/app/actions/finance-management-reports";
import { getProcurementPurchaseOrdersAction } from "@/app/actions/helpdesk-procurement-actions";
import { printIsolatedElement } from "@/lib/printUtils";

export default function ManagementReportsModule() {
  const { activeCampusId } = useCampusContext();
  const { selectedInstitutionObj } = useInstitution();

  const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "procurement" | "defaulters">("daily");

  // Dynamic Column Selector State
  const [availableColumns, setAvailableColumns] = useState<DayBookColumnDef[]>([]);
  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>([]);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");
  const [columnCategoryFilter, setColumnCategoryFilter] = useState<"all" | "fee_head" | "info" | "accounting">("all");

  // Daily / Day Book Report State
  const [dailyFromDate, setDailyFromDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dailyToDate, setDailyToDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dailyClass, setDailyClass] = useState<string>("All");
  const [dailyChannel, setDailyChannel] = useState<'All' | 'Cash' | 'Online' | 'Payment Gateway'>("All");
  const [dailyData, setDailyData] = useState<{
    summary?: any;
    channelGroups?: DayBookChannelGroup[];
    transactions?: ReportTransactionItem[];
  }>({});
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);

  // Monthly Report State
  const [monthlyMonth, setMonthlyMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [monthlyYear, setMonthlyYear] = useState<number>(() => new Date().getFullYear());
  const [monthlyClass, setMonthlyClass] = useState<string>("All");
  const [monthlyData, setMonthlyData] = useState<{
    period_label?: string;
    startDate?: string;
    endDate?: string;
    user_stamp?: string;
    ofy_flag?: string;
    wocb_flag?: string;
    dailyRollups?: DailyRollupItem[];
    channelGroups?: DayBookChannelGroup[];
    monthlyGrandTotal?: MonthlyGrandTotal;
    allTransactions?: ReportTransactionItem[];
  }>({});
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  const [monthlyViewMode, setMonthlyViewMode] = useState<"daybook" | "rollups" | "combined">("daybook");

  // Procurement Report State
  const [procurementOrders, setProcurementOrders] = useState<any[]>([]);
  const [procurementCounts, setProcurementCounts] = useState<any>({});
  const [isLoadingProcurement, setIsLoadingProcurement] = useState(false);

  // Defaulters State
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [isLoadingDefaulters, setIsLoadingDefaulters] = useState(false);
  const [defaulterSearch, setDefaulterSearch] = useState("");
  const [defaulterClass, setDefaulterClass] = useState("All");

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Load Available Fee Master Columns
  useEffect(() => {
    async function loadColumns() {
      try {
        const res = await getAvailableFeeMasterColumnsAction(activeCampusId);
        if (res.success && res.columns) {
          setAvailableColumns(res.columns);
          const initialSelected = res.columns.filter(c => c.defaultSelected).map(c => c.id);
          setSelectedColumnIds(initialSelected);
        }
      } catch (err) {
        console.error("Failed to load fee master columns:", err);
      }
    }
    loadColumns();
  }, [activeCampusId]);

  // Active selected column definitions in order
  const activeSelectedColumns = useMemo(() => {
    return availableColumns.filter(c => selectedColumnIds.includes(c.id));
  }, [availableColumns, selectedColumnIds]);

  // Load Daily / Day Book Report
  const loadDailyReport = async () => {
    setIsLoadingDaily(true);
    try {
      const res = await getDailyManagementReportAction({
        campusId: activeCampusId,
        fromDate: dailyFromDate,
        toDate: dailyToDate,
        className: dailyClass,
        paymentChannel: dailyChannel
      });
      if (res.success && res.data) {
        setDailyData(res.data);
      }
    } catch (err) {
      console.error("Failed to load daily report:", err);
    } finally {
      setIsLoadingDaily(false);
    }
  };

  // Load Monthly Report
  const loadMonthlyReport = async () => {
    setIsLoadingMonthly(true);
    try {
      const res = await getMonthlyManagementReportAction({
        campusId: activeCampusId,
        month: monthlyMonth,
        year: monthlyYear,
        className: monthlyClass
      });
      if (res.success && res.data) {
        setMonthlyData(res.data);
      }
    } catch (err) {
      console.error("Failed to load monthly report:", err);
    } finally {
      setIsLoadingMonthly(false);
    }
  };

  // Load Procurement Report
  const loadProcurementReport = async () => {
    setIsLoadingProcurement(true);
    try {
      const res = await getProcurementPurchaseOrdersAction();
      if (res.success && res.orders) {
        setProcurementOrders(res.orders);
        setProcurementCounts(res.counts || {});
      }
    } catch (err) {
      console.error("Failed to load procurement report:", err);
    } finally {
      setIsLoadingProcurement(false);
    }
  };

  // Load Defaulters List
  const loadDefaulters = async () => {
    setIsLoadingDefaulters(true);
    try {
      const demoDefaulters = [
        {
          id: "def-1",
          admissionNo: "CBS-2026-0012",
          studentName: "Reyansh Gupta",
          className: "Grade 4",
          parentName: "Sanjay Gupta",
          parentMobile: "+91 98112 34567",
          invoiceNumber: "INV-2026-0089",
          billingPeriod: "Q1 (April-June 2026)",
          totalAmount: 24500,
          amountPaid: 8000,
          balanceDue: 16500,
          status: "Overdue (45 Days)"
        },
        {
          id: "def-2",
          admissionNo: "CBS-2026-0045",
          studentName: "Ananya Deshmukh",
          className: "Grade 2",
          parentName: "Vikram Deshmukh",
          parentMobile: "+91 98220 98765",
          invoiceNumber: "INV-2026-0112",
          billingPeriod: "Q1 (April-June 2026)",
          totalAmount: 22000,
          amountPaid: 5000,
          balanceDue: 17000,
          status: "Overdue (30 Days)"
        },
        {
          id: "def-3",
          admissionNo: "CBS-2026-0088",
          studentName: "Kavya Singhania",
          className: "Grade 7",
          parentName: "Rajeev Singhania",
          parentMobile: "+91 99341 55667",
          invoiceNumber: "INV-2026-0034",
          billingPeriod: "Annual Term 2026-27",
          totalAmount: 58000,
          amountPaid: 30000,
          balanceDue: 28000,
          status: "Overdue (15 Days)"
        },
        {
          id: "def-4",
          admissionNo: "CBS-2026-0104",
          studentName: "Devansh Mehra",
          className: "Grade 9",
          parentName: "Amit Mehra",
          parentMobile: "+91 98765 43210",
          invoiceNumber: "INV-2026-0145",
          billingPeriod: "Q1 (April-June 2026)",
          totalAmount: 29000,
          amountPaid: 0,
          balanceDue: 29000,
          status: "Overdue (60 Days)"
        }
      ];
      setDefaulters(demoDefaulters);
    } catch (err) {
      console.error("Failed to load defaulters:", err);
    } finally {
      setIsLoadingDefaulters(false);
    }
  };

  useEffect(() => {
    if (activeTab === "daily") loadDailyReport();
    if (activeTab === "monthly") loadMonthlyReport();
    if (activeTab === "procurement") loadProcurementReport();
    if (activeTab === "defaulters") loadDefaulters();
  }, [activeTab, dailyFromDate, dailyToDate, dailyClass, dailyChannel, monthlyMonth, monthlyYear, monthlyClass, activeCampusId]);

  function formatINR(val: number) {
    return "₹" + Number(val || 0).toLocaleString("en-IN");
  }

  // Column Selection Handlers & Presets
  function toggleColumn(colId: string) {
    setSelectedColumnIds(prev => 
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  }

  function applyPreset(preset: "standard" | "all_heads" | "compact" | "all" | "reset") {
    if (preset === "standard" || preset === "reset") {
      setSelectedColumnIds(availableColumns.filter(c => c.defaultSelected).map(c => c.id));
    } else if (preset === "all" || preset === "all_heads") {
      setSelectedColumnIds(availableColumns.map(c => c.id));
    } else if (preset === "compact") {
      const compactIds = ["receipt_date", "payment_mode", "receipt_no", "student_name", "class_name", "month", "tuition_fee", "annual_charge", "amount_paid"];
      setSelectedColumnIds(availableColumns.filter(c => compactIds.includes(c.id)).map(c => c.id));
    }
  }

  // Helper to get transaction cell value by column definition
  function getTransactionCellValue(t: ReportTransactionItem, grpMode: string, colId: string): string | number {
    switch (colId) {
      case "receipt_date": return t.receipt_date;
      case "payment_mode": return grpMode;
      case "receipt_no": return t.receipt_no;
      case "admission_no": return t.admission_no;
      case "student_name": return t.student_name;
      case "class_name": return t.class_name;
      case "section_name": return t.section_name;
      case "month": return t.month;
      case "chq_no_ref": return t.chq_no_ref || "-";
      case "bank_name": return t.bank_name || "-";
      case "concession_amount": return t.concession_amount || 0;
      case "balance_due": return t.balance_due || 0;
      case "advance_amount": return t.advance_amount || 0;
      case "amount_paid": return t.amount_paid || 0;
      default:
        // Dynamic Fee Head
        return t.heads[colId] || 0;
    }
  }

  // Helper to get group subtotal value by column definition
  function getSubtotalCellValue(subtotal: any, colId: string): string | number {
    switch (colId) {
      case "concession_amount": return subtotal.total_concession || 0;
      case "balance_due": return subtotal.total_due || 0;
      case "advance_amount": return subtotal.total_advance || 0;
      case "amount_paid": return subtotal.total_paid || 0;
      default:
        return subtotal[colId] || 0;
    }
  }

  // Helper to get grand total summary value by column definition
  function getGrandTotalCellValue(summary: any, grandPaid: number, grandDue: number, colId: string): string | number {
    switch (colId) {
      case "concession_amount": return summary?.total_concession || 0;
      case "balance_due": return grandDue || 0;
      case "advance_amount": return summary?.total_advance || 0;
      case "amount_paid": return grandPaid || 0;
      default:
        return summary?.heads?.[colId] || 0;
    }
  }

  // Export Day Book to CSV dynamically matching selected columns
  function exportDayBookCSV(isMonthly = false) {
    const txns = isMonthly ? (monthlyData.allTransactions || []) : (dailyData.transactions || []);
    const channelGroups = isMonthly ? (monthlyData.channelGroups || []) : (dailyData.channelGroups || []);
    const grand = isMonthly ? monthlyData.monthlyGrandTotal : dailyData.summary;

    if (txns.length === 0) return;

    const schoolName = selectedInstitutionObj?.name || "CRAYON BOX HIGH SCHOOL";
    const dateRangeLabel = isMonthly 
      ? `From : ${monthlyData.startDate || `01/${monthlyMonth}/${monthlyYear}`}   To : ${monthlyData.endDate || `31/${monthlyMonth}/${monthlyYear}`}`
      : `From : ${dailyFromDate}   To : ${dailyToDate}`;
    const userStamp = `User : LAXMI (2026-2027)`;
    const flags = `OFY : YES   WOCB : YES`;

    const metaLines = [
      `"${schoolName}"`,
      `"DAY BOOK DETAIL1"`,
      `"${dateRangeLabel}"`,
      `"${userStamp}    ${flags}"`,
      `"Scope: ${isMonthly ? monthlyData.period_label : `Date Range: ${dailyFromDate} to ${dailyToDate}`} | Class: ${isMonthly ? monthlyClass : dailyClass} | Active Columns: ${activeSelectedColumns.length}"`,
      `"SUMMARY: Total Receipts: ${txns.length} | Gross Realized: Rs. ${isMonthly ? grand?.grand_total_collection || 0 : grand?.gross_collected || 0} | Cash: Rs. ${grand?.cash_total || 0} | Online/UPI: Rs. ${grand?.online_total || 0} | Gateway: Rs. ${grand?.gateway_total || 0} | Total Concession: Rs. ${grand?.total_concession || 0} | Balance Due: Rs. ${isMonthly ? grand?.total_balance_due || 0 : grand?.total_balance_due || 0}"`,
      ""
    ];

    const headers = activeSelectedColumns.map(c => `"${c.label}"`);
    const rows: (string | number)[][] = [];

    // Find the boundary between info columns and value columns for subtotals
    const firstValueColIdx = activeSelectedColumns.findIndex(c => c.category === 'accounting' || c.category === 'fee_head');
    const infoSpan = firstValueColIdx > 0 ? firstValueColIdx : 1;

    channelGroups.forEach(grp => {
      grp.transactions.forEach(t => {
        const rowData = activeSelectedColumns.map(col => {
          const val = getTransactionCellValue(t, grp.mode, col.id);
          if (typeof val === 'string') return `"${val}"`;
          return val;
        });
        rows.push(rowData);
      });

      // Subtotal row for this payment mode
      const subtotalRow: (string | number)[] = [];
      activeSelectedColumns.forEach((col, idx) => {
        if (idx === 0) {
          subtotalRow.push(`"TOTAL (${grp.mode})"`);
        } else if (idx < infoSpan) {
          subtotalRow.push(`"-"`);
        } else {
          subtotalRow.push(getSubtotalCellValue(grp.subtotal, col.id));
        }
      });
      rows.push(subtotalRow);
      rows.push([]); // Blank separator line
    });

    // Grand Total Row
    const grandPaid = isMonthly ? (grand?.grand_total_collection || 0) : (grand?.gross_collected || 0);
    const grandDue = isMonthly ? (grand?.total_balance_due || 0) : (grand?.total_balance_due || 0);

    const grandTotalRow: (string | number)[] = [];
    activeSelectedColumns.forEach((col, idx) => {
      if (idx === 0) {
        grandTotalRow.push(`"🏆 GRAND TOTAL"`);
      } else if (idx < infoSpan) {
        grandTotalRow.push(`"-"`);
      } else {
        grandTotalRow.push(getGrandTotalCellValue(grand, grandPaid, grandDue, col.id));
      }
    });
    rows.push(grandTotalRow);

    const csvContent = "data:text/csv;charset=utf-8," + 
      metaLines.join("\n") + "\n" +
      headers.join(",") + "\n" +
      rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${isMonthly ? 'Monthly' : 'Daily'}_Day_Book_Detail_${isMonthly ? `${monthlyYear}_${monthlyMonth}` : `${dailyFromDate}_to_${dailyToDate}`}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export Defaulters to CSV
  function exportDefaultersCSV() {
    if (filteredDefaulters.length === 0) return;

    const schoolName = selectedInstitutionObj?.name || "CRAYON BOX HIGH SCHOOL";
    const affiliation = selectedInstitutionObj?.affiliation_number 
      ? `Affiliation No: ${selectedInstitutionObj.affiliation_number} • CBSE Board`
      : "Affiliated to CBSE, New Delhi • Quality Education Foundation";
    const generatedOn = new Date().toLocaleString("en-IN");
    const totalDue = filteredDefaulters.reduce((acc, d) => acc + Number(d.balanceDue || 0), 0);

    const metaLines = [
      `"${schoolName}"`,
      `"${affiliation}"`,
      `"OUTSTANDING FEE DEFAULTERS & OVERDUE DUES AUDIT REPORT"`,
      `"Class Filter: ${defaulterClass} | Search: ${defaulterSearch || 'None'}"`,
      `"Generated On: ${generatedOn} | Academic Session: 2026-2027"`,
      `"SUMMARY: Total Defaulters: ${filteredDefaulters.length} | Total Outstanding Receivables: Rs. ${totalDue}"`,
      ""
    ];

    const headers = ["Admission No", "Student Name", "Class", "Parent Name", "Parent Mobile", "Invoice Ref", "Billing Term", "Total Invoiced (INR)", "Amount Paid (INR)", "Balance Due (INR)", "Status"];
    const rows = filteredDefaulters.map(d => [
      `"${d.admissionNo}"`,
      `"${d.studentName}"`,
      `"${d.className}"`,
      `"${d.parentName}"`,
      `"${d.parentMobile}"`,
      `"${d.invoiceNumber}"`,
      `"${d.billingPeriod}"`,
      d.totalAmount,
      d.amountPaid,
      d.balanceDue,
      `"${d.status}"`
    ]);

    rows.push([
      `"TOTAL OUTSTANDING"`,
      `"ALL STUDENTS"`,
      `"${defaulterClass}"`,
      `"-"`,
      `"-"`,
      `"-"`,
      `"-"`,
      filteredDefaulters.reduce((acc, d) => acc + Number(d.totalAmount || 0), 0),
      filteredDefaulters.reduce((acc, d) => acc + Number(d.amountPaid || 0), 0),
      totalDue,
      `"OVERDUE"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + 
      metaLines.join("\n") + "\n" +
      headers.join(",") + "\n" +
      rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fee_Defaulters_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Print Report Handler
  function handlePrintCurrentReport() {
    if (printAreaRef.current) {
      printIsolatedElement(printAreaRef.current, `Day_Book_Statement_${activeTab}`, {
        pageSize: "A4 landscape",
        isWideReport: true,
        margin: "4mm",
        fontSize: "7.5pt"
      });
    } else {
      window.print();
    }
  }

  const allClasses = [
    "All", "NUR", "KG", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"
  ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const filteredDefaulters = defaulters.filter(d => {
    const matchSearch = d.studentName.toLowerCase().includes(defaulterSearch.toLowerCase()) ||
      d.admissionNo.toLowerCase().includes(defaulterSearch.toLowerCase()) ||
      d.invoiceNumber.toLowerCase().includes(defaulterSearch.toLowerCase());
    const matchClass = defaulterClass === "All" || d.className === defaulterClass;
    return matchSearch && matchClass;
  });

  // Filter columns inside modal
  const filteredModalColumns = availableColumns.filter(c => {
    const matchSearch = c.label.toLowerCase().includes(columnSearch.toLowerCase()) ||
      (c.shortLabel && c.shortLabel.toLowerCase().includes(columnSearch.toLowerCase()));
    const matchCategory = columnCategoryFilter === "all" || c.category === columnCategoryFilter;
    return matchSearch && matchCategory;
  });

  // Calculate info column span for subtotal rows
  const infoColumnsCount = useMemo(() => {
    let count = 0;
    for (const c of activeSelectedColumns) {
      if (c.category === 'info') count++;
      else break;
    }
    return Math.max(1, count);
  }, [activeSelectedColumns]);

  return (
    <div className="min-h-screen bg-stone-100/60 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* MODULE TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-stone-900 text-amber-400 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight">
                  Day Book Detail &amp; Finance Management Reports
                </h1>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                  ERP v2.4 Audit
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Authentic CBSE/ICSE Day Book register with payment mode groupings (Cash / Online), customizable columns from Fee Master &amp; Class Structures, concessions, dues, advances, and multi-head fee breakdown.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Column Customizer Trigger Button */}
          <button
            type="button"
            onClick={() => setIsColumnModalOpen(true)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold py-2.5 px-4 rounded-xl border border-indigo-200 transition flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Settings2 className="w-4 h-4 text-indigo-600" />
            <span>Customize Columns</span>
            <span className="bg-indigo-200/80 text-indigo-900 text-[10px] font-black px-1.5 py-0.5 rounded-md ml-1">
              {selectedColumnIds.length}/{availableColumns.length}
            </span>
          </button>

          {activeTab === "daily" && (
            <button 
              onClick={() => exportDayBookCSV(false)}
              disabled={!dailyData.transactions || dailyData.transactions.length === 0}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 shadow-md text-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-950" /> Export Day Book (CSV)
            </button>
          )}

          {activeTab === "monthly" && (
            <button 
              onClick={() => exportDayBookCSV(true)}
              disabled={!monthlyData.allTransactions || monthlyData.allTransactions.length === 0}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 shadow-md text-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-950" /> Export Monthly Day Book (CSV)
            </button>
          )}

          {activeTab === "defaulters" && (
            <button 
              onClick={exportDefaultersCSV}
              disabled={filteredDefaulters.length === 0}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 shadow-md text-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-950" /> Export Defaulters (CSV)
            </button>
          )}

          <button
            onClick={handlePrintCurrentReport}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Print Day Book Statement
          </button>
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("daily")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition tracking-tight whitespace-nowrap ${
            activeTab === "daily"
              ? "bg-slate-900 text-amber-400 shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>📅 Daily Day Book Detail</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("monthly")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition tracking-tight whitespace-nowrap ${
            activeTab === "monthly"
              ? "bg-slate-900 text-amber-400 shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>🗓️ Monthly Day Book &amp; Rollups</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("procurement")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition tracking-tight whitespace-nowrap ${
            activeTab === "procurement"
              ? "bg-slate-900 text-amber-400 shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>📦 Procurement &amp; Expenses</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("defaulters")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition tracking-tight whitespace-nowrap ${
            activeTab === "defaulters"
              ? "bg-slate-900 text-amber-400 shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-orange-400" />
          <span>⚠️ Defaulters &amp; Outstanding Dues</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. DAILY / DATE RANGE DAY BOOK REPORT VIEW */}
      {/* ========================================================================= */}
      {activeTab === "daily" && (
        <div className="space-y-6">
          
          {/* Day Book Filter Bar */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              
              {/* From Date */}
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
                <span className="text-xs font-bold text-stone-500">From Date:</span>
                <input
                  type="date"
                  value={dailyFromDate}
                  onChange={(e) => setDailyFromDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none"
                />
              </div>

              {/* To Date */}
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
                <span className="text-xs font-bold text-stone-500">To Date:</span>
                <input
                  type="date"
                  value={dailyToDate}
                  onChange={(e) => setDailyToDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none"
                />
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
                <span className="text-xs font-bold text-stone-500">Class:</span>
                <select
                  value={dailyClass}
                  onChange={(e) => setDailyClass(e.target.value)}
                  className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
                >
                  {allClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Channel Filter */}
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
                <span className="text-xs font-bold text-stone-500">Mode:</span>
                <select
                  value={dailyChannel}
                  onChange={(e) => setDailyChannel(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
                >
                  <option value="All">All Modes (Cash &amp; Online)</option>
                  <option value="Cash">Cash Only</option>
                  <option value="Online">Online / UPI Only</option>
                  <option value="Payment Gateway">Payment Gateway Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(true)}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600" /> Columns ({selectedColumnIds.length})
              </button>
              <button
                type="button"
                onClick={loadDailyReport}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDaily ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>

          {/* PRINTABLE AREA: WRAPS INSTITUTIONAL HEADER, METRIC CARDS & FULL DAY BOOK REGISTER */}
          <div ref={printAreaRef} className="space-y-4">
            
            {/* Official School Print Letterhead Banner */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1 text-center">
              <h1 className="text-base sm:text-lg font-black text-stone-950 uppercase tracking-tight">
                {selectedInstitutionObj?.name || "CRAYON BOX SCHOOL"}
              </h1>
              <p className="text-[10.5px] font-bold text-stone-700">
                {selectedInstitutionObj?.affiliation_number ? `Affiliation No: ${selectedInstitutionObj.affiliation_number}` : "School ID: 1253481 • UDISE Code: 07124100151"}
              </p>
              <p className="text-[9.5px] text-stone-500">
                {selectedInstitutionObj?.address || "Burari, Sant Nagar, Delhi - 110084"} • Tel: {selectedInstitutionObj?.phone || "9811102008"} • Email: {selectedInstitutionObj?.email || "crayonboxdelhi@gmail.com"}
              </p>
              <div className="pt-2 flex flex-wrap justify-between items-center border-t border-stone-200 text-[11px] font-bold text-stone-900">
                <span className="bg-stone-900 text-amber-400 font-black px-2 py-0.5 rounded text-[10px] uppercase">
                  📘 DAY BOOK DETAIL REGISTER
                </span>
                <span>Date Period: {dailyFromDate} To {dailyToDate}</span>
                <span>User / In-Charge: LAXMI (2026-2027)</span>
                <span>Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Day Book Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xs border-l-4 border-l-amber-500">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 block">Total Realized</span>
                <h3 className="text-base sm:text-xl font-black text-stone-950 mt-0.5 font-mono">
                  {formatINR(dailyData.summary?.gross_collected || 0)}
                </h3>
                <span className="text-[9px] text-amber-700 font-bold">{dailyData.summary?.total_receipts || 0} Receipts</span>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xs border-l-4 border-l-green-600">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 block">💵 Cash Total</span>
                <h3 className="text-base sm:text-xl font-black text-slate-900 mt-0.5 font-mono">
                  {formatINR(dailyData.summary?.cash_total || 0)}
                </h3>
                <span className="text-[9px] text-green-700 font-bold">Counter Cash</span>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xs border-l-4 border-l-blue-600">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 block">📱 Online / UPI</span>
                <h3 className="text-base sm:text-xl font-black text-blue-700 mt-0.5 font-mono">
                  {formatINR(dailyData.summary?.online_total || 0)}
                </h3>
                <span className="text-[9px] text-blue-700 font-bold">Bank Reconciled</span>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xs border-l-4 border-l-purple-600">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 block">⚡ Payment Gateway</span>
                <h3 className="text-base sm:text-xl font-black text-purple-700 mt-0.5 font-mono">
                  {formatINR(dailyData.summary?.gateway_total || 0)}
                </h3>
                <span className="text-[9px] text-purple-700 font-bold">Razorpay / App</span>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xs border-l-4 border-l-indigo-600">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 block">🎁 Concessions</span>
                <h3 className="text-base sm:text-xl font-black text-indigo-700 mt-0.5 font-mono">
                  {formatINR(dailyData.summary?.total_concession || 0)}
                </h3>
                <span className="text-[9px] text-indigo-700 font-bold">Waivers</span>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xs border-l-4 border-l-orange-500">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 block">⏳ Balance Due</span>
                <h3 className="text-base sm:text-xl font-black text-orange-600 mt-0.5 font-mono">
                  {formatINR(dailyData.summary?.total_balance_due || 0)}
                </h3>
                <span className="text-[9px] text-orange-700 font-bold">Arrears</span>
              </div>
            </div>

            {/* MAIN DAY BOOK DETAIL TABLE */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              
              {/* Table Sub-header */}
              <div className="p-4 sm:p-5 border-b border-stone-200 space-y-1 bg-stone-50/80">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-stone-950 uppercase tracking-wide">
                      DAY BOOK DETAIL1
                    </h2>
                    <p className="text-xs font-bold text-stone-700 mt-0.5">
                      From : {dailyFromDate} &nbsp;&nbsp;&nbsp; To : {dailyToDate}
                    </p>
                    <p className="text-[11px] font-semibold text-stone-500">
                      User : LAXMI (2026-2027) &nbsp;&nbsp;&nbsp;&nbsp; OFY : YES &nbsp;&nbsp;&nbsp; WOCB : YES
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-stone-400 block">Report Scope: Day Book Register</span>
                    <strong className="text-stone-900 font-mono text-sm">
                      Grand Net Paid: {formatINR(dailyData.summary?.gross_collected || 0)}
                    </strong>
                  </div>
                </div>
              </div>

              {isLoadingDaily ? (
                <div className="p-14 text-center text-xs font-bold text-stone-400">Loading Day Book statement...</div>
              ) : !dailyData.channelGroups || dailyData.channelGroups.length === 0 ? (
                <div className="p-14 text-center text-xs text-stone-400 space-y-2">
                  <Receipt className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="font-bold text-stone-700">No collections recorded for selected period</p>
                  <p className="text-stone-500">Adjust date range or filter options.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-stone-200/90 text-stone-800 font-black border-y border-stone-300 text-[10px]">
                        {activeSelectedColumns.map(col => (
                          <th 
                            key={col.id}
                            className={`p-2 border-r border-stone-300 whitespace-nowrap text-${col.align || 'left'} ${
                              col.id === 'amount_paid' ? 'text-stone-950 font-black' : ''
                            }`}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 font-medium">
                      {dailyData.channelGroups.map((grp) => (
                        <React.Fragment key={grp.mode}>
                          {grp.transactions.map((t, idx) => (
                            <tr key={t.id || idx} className="hover:bg-stone-50 transition">
                              {activeSelectedColumns.map(col => {
                                const val = getTransactionCellValue(t, grp.mode, col.id);
                                return (
                                  <td 
                                    key={col.id}
                                    className={`p-2 border-r border-stone-200 whitespace-nowrap text-${col.align || 'left'} ${
                                      col.id === 'student_name' ? 'font-bold text-stone-950' :
                                      col.id === 'receipt_no' ? 'font-mono font-bold text-stone-900' :
                                      col.id === 'concession_amount' ? 'font-mono text-indigo-700' :
                                      col.id === 'balance_due' ? 'font-mono text-orange-600' :
                                      col.id === 'advance_amount' ? 'font-mono text-emerald-700' :
                                      col.id === 'amount_paid' ? 'font-mono font-black text-stone-950 bg-stone-50' :
                                      col.isFeeHead ? 'font-mono text-stone-800' : 'text-stone-700'
                                    }`}
                                  >
                                    {val}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}

                          {/* MODE SUBTOTAL ROW */}
                          <tr className="bg-stone-200 font-black border-y-2 border-stone-400 text-[11px]">
                            <td colSpan={infoColumnsCount} className="p-2.5 text-right uppercase tracking-wider text-stone-900">
                              Total ({grp.mode})
                            </td>
                            {activeSelectedColumns.slice(infoColumnsCount).map(col => {
                              const subVal = getSubtotalCellValue(grp.subtotal, col.id);
                              return (
                                <td 
                                  key={col.id}
                                  className={`p-2.5 border-r border-stone-300 whitespace-nowrap text-${col.align || 'right'} font-mono ${
                                    col.id === 'amount_paid' ? 'font-black text-stone-950 bg-stone-300' :
                                    col.id === 'concession_amount' ? 'text-indigo-900' :
                                    col.id === 'balance_due' ? 'text-orange-800' :
                                    col.id === 'advance_amount' ? 'text-emerald-800' : 'text-stone-900'
                                  }`}
                                >
                                  {subVal}
                                </td>
                              );
                            })}
                          </tr>
                        </React.Fragment>
                      ))}

                      {/* GRAND DAY / RANGE TOTAL ROW */}
                      {dailyData.summary && (
                        <tr className="bg-slate-900 text-white font-black font-mono border-t-2 border-slate-700 text-xs">
                          <td colSpan={infoColumnsCount} className="p-3 text-xs font-black uppercase tracking-wider text-amber-400 whitespace-nowrap">
                            🏆 GRAND TOTAL ({dailyFromDate} to {dailyToDate})
                          </td>
                          {activeSelectedColumns.slice(infoColumnsCount).map(col => {
                            const grandVal = getGrandTotalCellValue(
                              dailyData.summary,
                              dailyData.summary.gross_collected,
                              dailyData.summary.total_balance_due,
                              col.id
                            );
                            return (
                              <td 
                                key={col.id}
                                className={`p-3 text-${col.align || 'right'} whitespace-nowrap ${
                                  col.id === 'amount_paid' ? 'text-amber-300 text-sm bg-slate-950 font-black' :
                                  col.id === 'concession_amount' ? 'text-indigo-300' :
                                  col.id === 'balance_due' ? 'text-orange-400' :
                                  col.id === 'advance_amount' ? 'text-emerald-400' : 'text-white'
                                }`}
                              >
                                {grandVal}
                              </td>
                            );
                          })}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Print Signatory Footer */}
            <div className="flex justify-between items-end pt-3 pb-1 text-[10px] text-stone-600 border-t border-stone-200">
              <p className="italic">This is an official system-generated Day Book Statement of Accounts.</p>
              <div className="text-right space-y-0.5">
                <div className="font-bold text-stone-900">Authorised Signatory / Accounts Desk</div>
                <div className="text-[9px] text-stone-500">LAXMI (2026-2027)</div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MONTHLY CONSOLIDATED REPORT VIEW (DAY BOOK + DAILY ROLLUPS MATRIX) */}
      {/* ========================================================================= */}
      {activeTab === "monthly" && (
        <div className="space-y-6">
          
          {/* Monthly Filter Bar */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Month Selector */}
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
                <span className="text-xs font-bold text-stone-500">Month:</span>
                <select
                  value={monthlyMonth}
                  onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                  className="bg-transparent text-xs font-black text-stone-900 focus:outline-none"
                >
                  {monthNames.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
                <span className="text-xs font-bold text-stone-500">Year:</span>
                <select
                  value={monthlyYear}
                  onChange={(e) => setMonthlyYear(Number(e.target.value))}
                  className="bg-transparent text-xs font-black text-stone-900 focus:outline-none"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
                <span className="text-xs font-bold text-stone-500">Class:</span>
                <select
                  value={monthlyClass}
                  onChange={(e) => setMonthlyClass(e.target.value)}
                  className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
                >
                  {allClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* View Mode Toggle: Day Book Register vs Daily Rollup Matrix vs Combined */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setMonthlyViewMode("daybook")}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  monthlyViewMode === "daybook" ? "bg-white text-stone-950 shadow-xs" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                📋 Monthly Day Book Detail
              </button>
              <button
                type="button"
                onClick={() => setMonthlyViewMode("rollups")}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  monthlyViewMode === "rollups" ? "bg-white text-stone-950 shadow-xs" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                📊 Daily Rollups Matrix
              </button>
              <button
                type="button"
                onClick={() => setMonthlyViewMode("combined")}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  monthlyViewMode === "combined" ? "bg-slate-900 text-amber-400 shadow-xs" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                📑 Full Statement (Both)
              </button>
            </div>
          </div>

          {/* Monthly Grand KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs border-l-4 border-l-purple-600">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Monthly Realized Gross</span>
              <h3 className="text-lg sm:text-2xl font-black text-purple-900 mt-0.5 font-mono">
                {formatINR(monthlyData.monthlyGrandTotal?.grand_total_collection || 0)}
              </h3>
              <span className="text-[10px] text-purple-700 font-bold">{monthlyData.period_label} Total</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs border-l-4 border-l-green-600">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">💵 Cash Volume</span>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 font-mono">
                {formatINR(monthlyData.monthlyGrandTotal?.cash_total || 0)}
              </h3>
              <span className="text-[10px] text-green-700 font-bold">Counter Settlement</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs border-l-4 border-l-blue-600">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">📱 Online / UPI</span>
              <h3 className="text-lg sm:text-2xl font-black text-blue-700 mt-0.5 font-mono">
                {formatINR(monthlyData.monthlyGrandTotal?.online_total || 0)}
              </h3>
              <span className="text-[10px] text-blue-700 font-bold">Bank Reconciliation</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs border-l-4 border-l-purple-600">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">⚡ Gateway Total</span>
              <h3 className="text-lg sm:text-2xl font-black text-purple-700 mt-0.5 font-mono">
                {formatINR(monthlyData.monthlyGrandTotal?.gateway_total || 0)}
              </h3>
              <span className="text-[10px] text-purple-700 font-bold">App &amp; Portal</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs border-l-4 border-l-indigo-600">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">🎁 Total Concession</span>
              <h3 className="text-lg sm:text-2xl font-black text-indigo-700 mt-0.5 font-mono">
                {formatINR(monthlyData.monthlyGrandTotal?.total_concession || 0)}
              </h3>
              <span className="text-[10px] text-indigo-700 font-bold">Waivers / Discounts</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs border-l-4 border-l-orange-500">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">⏳ Remaining Due</span>
              <h3 className="text-lg sm:text-2xl font-black text-orange-600 mt-0.5 font-mono">
                {formatINR(monthlyData.monthlyGrandTotal?.total_balance_due || 0)}
              </h3>
              <span className="text-[10px] text-orange-700 font-bold">Month-End Balance</span>
            </div>
          </div>

          {/* PRINTABLE CONTAINER FOR MONTHLY STATEMENT */}
          <div ref={printAreaRef} className="space-y-4">

            {/* Official School Print Letterhead Banner */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1 text-center">
              <h1 className="text-base sm:text-lg font-black text-stone-950 uppercase tracking-tight">
                {selectedInstitutionObj?.name || "CRAYON BOX SCHOOL"}
              </h1>
              <p className="text-[10.5px] font-bold text-stone-700">
                {selectedInstitutionObj?.affiliation_number ? `Affiliation No: ${selectedInstitutionObj.affiliation_number}` : "School ID: 1253481 • UDISE Code: 07124100151"}
              </p>
              <p className="text-[9.5px] text-stone-500">
                {selectedInstitutionObj?.address || "Burari, Sant Nagar, Delhi - 110084"} • Tel: {selectedInstitutionObj?.phone || "9811102008"} • Email: {selectedInstitutionObj?.email || "crayonboxdelhi@gmail.com"}
              </p>
              <div className="pt-2 flex flex-wrap justify-between items-center border-t border-stone-200 text-[11px] font-bold text-stone-900">
                <span className="bg-stone-900 text-amber-400 font-black px-2 py-0.5 rounded text-[10px] uppercase">
                  📘 MONTHLY DAY BOOK &amp; CONSOLIDATED STATEMENT
                </span>
                <span>Month: {monthNames[monthlyMonth - 1]} {monthlyYear}</span>
                <span>User: LAXMI (2026-2027)</span>
                <span>Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {/* SECTION 1: MONTHLY DAY BOOK DETAIL REGISTER */}
            {(monthlyViewMode === "daybook" || monthlyViewMode === "combined") && (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-stone-200 space-y-1.5 bg-stone-50/70">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-stone-950 uppercase tracking-wide">
                        DAY BOOK DETAIL1 — {monthlyData.period_label}
                      </h2>
                      <p className="text-xs font-bold text-stone-700 mt-0.5">
                        From : {monthlyData.startDate || `01/${monthlyMonth}/${monthlyYear}`} &nbsp;&nbsp;&nbsp; To : {monthlyData.endDate || `31/${monthlyMonth}/${monthlyYear}`}
                      </p>
                      <p className="text-[11px] font-semibold text-stone-500">
                        User : LAXMI (2026-2027) &nbsp;&nbsp;&nbsp;&nbsp; OFY : YES &nbsp;&nbsp;&nbsp; WOCB : YES
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-bold text-stone-400 block">Monthly Day Book</span>
                      <strong className="text-purple-900 font-mono text-sm font-black">
                        Net Paid: {formatINR(monthlyData.monthlyGrandTotal?.grand_total_collection || 0)}
                      </strong>
                    </div>
                  </div>
                </div>

                {!monthlyData.channelGroups || monthlyData.channelGroups.length === 0 ? (
                  <div className="p-14 text-center text-xs text-stone-400">No transactions recorded for this month.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-stone-200/90 text-stone-800 font-black border-y border-stone-300 text-[10px]">
                          {activeSelectedColumns.map(col => (
                            <th 
                              key={col.id}
                              className={`p-2 border-r border-stone-300 whitespace-nowrap text-${col.align || 'left'} ${
                                col.id === 'amount_paid' ? 'text-stone-950 font-black' : ''
                              }`}
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 font-medium">
                        {monthlyData.channelGroups.map((grp) => (
                          <React.Fragment key={grp.mode}>
                            {grp.transactions.map((t, idx) => (
                              <tr key={t.id || idx} className="hover:bg-stone-50 transition">
                                {activeSelectedColumns.map(col => {
                                  const val = getTransactionCellValue(t, grp.mode, col.id);
                                  return (
                                    <td 
                                      key={col.id}
                                      className={`p-2 border-r border-stone-200 whitespace-nowrap text-${col.align || 'left'} ${
                                        col.id === 'student_name' ? 'font-bold text-stone-950' :
                                        col.id === 'receipt_no' ? 'font-mono font-bold text-stone-900' :
                                        col.id === 'concession_amount' ? 'font-mono text-indigo-700' :
                                        col.id === 'balance_due' ? 'font-mono text-orange-600' :
                                        col.id === 'advance_amount' ? 'font-mono text-emerald-700' :
                                        col.id === 'amount_paid' ? 'font-mono font-black text-stone-950 bg-stone-50' :
                                        col.isFeeHead ? 'font-mono text-stone-800' : 'text-stone-700'
                                      }`}
                                    >
                                      {val}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}

                            {/* MODE SUBTOTAL ROW */}
                            <tr className="bg-stone-200 font-black border-y-2 border-stone-400 text-[11px]">
                              <td colSpan={infoColumnsCount} className="p-2.5 text-right uppercase tracking-wider text-stone-900">
                                Total ({grp.mode})
                              </td>
                              {activeSelectedColumns.slice(infoColumnsCount).map(col => {
                                const subVal = getSubtotalCellValue(grp.subtotal, col.id);
                                return (
                                  <td 
                                    key={col.id}
                                    className={`p-2.5 border-r border-stone-300 whitespace-nowrap text-${col.align || 'right'} font-mono ${
                                      col.id === 'amount_paid' ? 'font-black text-stone-950 bg-stone-300' :
                                      col.id === 'concession_amount' ? 'text-indigo-900' :
                                      col.id === 'balance_due' ? 'text-orange-800' :
                                      col.id === 'advance_amount' ? 'text-emerald-800' : 'text-stone-900'
                                    }`}
                                  >
                                    {subVal}
                                  </td>
                                );
                              })}
                            </tr>
                          </React.Fragment>
                        ))}

                        {/* MONTH GRAND TOTAL ROW */}
                        {monthlyData.monthlyGrandTotal && (
                          <tr className="bg-slate-900 text-white font-black font-mono border-t-2 border-slate-700 text-xs">
                            <td colSpan={infoColumnsCount} className="p-3 text-xs font-black uppercase tracking-wider text-amber-400 whitespace-nowrap">
                              🏆 FINAL MONTH GRAND TOTAL ({monthlyData.period_label})
                            </td>
                            {activeSelectedColumns.slice(infoColumnsCount).map(col => {
                              const grandVal = getGrandTotalCellValue(
                                monthlyData.monthlyGrandTotal,
                                monthlyData.monthlyGrandTotal?.grand_total_collection || 0,
                                monthlyData.monthlyGrandTotal?.total_balance_due || 0,
                                col.id
                              );
                              return (
                                <td 
                                  key={col.id}
                                  className={`p-3 text-${col.align || 'right'} whitespace-nowrap ${
                                    col.id === 'amount_paid' ? 'text-amber-300 text-sm bg-slate-950 font-black' :
                                    col.id === 'concession_amount' ? 'text-indigo-300' :
                                    col.id === 'balance_due' ? 'text-orange-400' :
                                    col.id === 'advance_amount' ? 'text-emerald-400' : 'text-white'
                                  }`}
                                >
                                  {grandVal}
                                </td>
                              );
                            })}
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: DAILY HEAD-WISE ROLLUP COMBINATION MATRIX */}
            {(monthlyViewMode === "rollups" || monthlyViewMode === "combined") && (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-stone-200 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-stone-950 uppercase tracking-tight">
                        Daily Rollups Summary Matrix — {monthlyData.period_label}
                      </h2>
                      <p className="text-xs font-bold text-stone-500">
                        Day-by-day fee head aggregates and channel totals across active days.
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-bold text-stone-400 block">Daily Aggregation</span>
                      <strong className="text-purple-900 font-mono font-black">
                        Active Days: {monthlyData.dailyRollups?.length || 0}
                      </strong>
                    </div>
                  </div>
                </div>

                {!monthlyData.dailyRollups || monthlyData.dailyRollups.length === 0 ? (
                  <div className="p-14 text-center text-xs font-bold text-stone-400">No rollups recorded.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-100 text-stone-700 text-[10px] font-black uppercase tracking-wider border-b border-stone-200">
                          <th className="p-3 whitespace-nowrap">Date</th>
                          <th className="p-3 whitespace-nowrap">Day</th>
                          <th className="p-3 whitespace-nowrap text-center">Receipts</th>
                          <th className="p-3 whitespace-nowrap text-right">Tuition</th>
                          <th className="p-3 whitespace-nowrap text-right">Annual Charges</th>
                          <th className="p-3 whitespace-nowrap text-right">Computer &amp; AI</th>
                          <th className="p-3 whitespace-nowrap text-right">Development</th>
                          <th className="p-3 whitespace-nowrap text-right">Examination</th>
                          <th className="p-3 whitespace-nowrap text-right">Activity</th>
                          <th className="p-3 whitespace-nowrap text-right">App &amp; ID Card</th>
                          <th className="p-3 whitespace-nowrap text-right">Transport</th>
                          <th className="p-3 whitespace-nowrap text-right text-green-800">Cash</th>
                          <th className="p-3 whitespace-nowrap text-right text-blue-800">Online</th>
                          <th className="p-3 whitespace-nowrap text-right text-purple-800">Gateway</th>
                          <th className="p-3 whitespace-nowrap text-right font-black text-emerald-800 bg-emerald-50/50">Daily Total</th>
                          <th className="p-3 whitespace-nowrap text-right font-bold text-orange-700">Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium">
                        {monthlyData.dailyRollups.map((r, rIdx) => (
                          <tr key={r.date || rIdx} className="hover:bg-stone-50 transition">
                            <td className="p-3 font-mono font-bold text-stone-900 whitespace-nowrap">{r.date}</td>
                            <td className="p-3 font-bold text-stone-500 whitespace-nowrap">{r.day_name}</td>
                            <td className="p-3 text-center font-mono font-bold whitespace-nowrap">
                              <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-full">{r.receipt_count}</span>
                            </td>
                            <td className="p-3 text-right font-mono">{formatINR(r.tuition_fee)}</td>
                            <td className="p-3 text-right font-mono">{formatINR(r.annual_charges)}</td>
                            <td className="p-3 text-right font-mono">{formatINR(r.computer_ai_fee)}</td>
                            <td className="p-3 text-right font-mono">{formatINR(r.development_fee)}</td>
                            <td className="p-3 text-right font-mono">{formatINR(r.examination_fee)}</td>
                            <td className="p-3 text-right font-mono">{formatINR(r.activity_fee)}</td>
                            <td className="p-3 text-right font-mono">{formatINR(r.school_app_id_card)}</td>
                            <td className="p-3 text-right font-mono">{formatINR(r.transport_fee)}</td>
                            <td className="p-3 text-right font-mono text-green-700 font-bold">{formatINR(r.cash_total)}</td>
                            <td className="p-3 text-right font-mono text-blue-700 font-bold">{formatINR(r.online_total)}</td>
                            <td className="p-3 text-right font-mono text-purple-700 font-bold">{formatINR(r.gateway_total)}</td>
                            <td className="p-3 text-right font-mono font-black text-emerald-700 bg-emerald-50/50 whitespace-nowrap">
                              {formatINR(r.daily_total)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-orange-600">
                              {formatINR(r.balance_due_total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PROCUREMENT & EXPENSE OUTFLOW REPORT VIEW */}
      {/* ========================================================================= */}
      {activeTab === "procurement" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Total Purchase Orders</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{procurementCounts.totalOrders || 0} POs</h3>
              <span className="text-xs text-stone-500 font-medium">Requisitioned</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs border-l-4 border-l-indigo-600">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Total Procurement Spend</span>
              <h3 className="text-2xl font-black text-indigo-700 mt-1">{formatINR(procurementCounts.totalSpend || 0)}</h3>
              <span className="text-xs text-indigo-700 font-bold">Approved Cash Outflow</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Approved Orders</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{procurementCounts.approvedOrders || 0}</h3>
              <span className="text-xs text-emerald-700 font-bold">Ready for Delivery</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Delivered &amp; Fulfilled</span>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{procurementCounts.deliveredOrders || 0}</h3>
              <span className="text-xs text-purple-700 font-bold">Inventory Stocked</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">Procurement Purchase Order Outflows</h3>
                <p className="text-xs text-stone-400">Institutional capital and operational expenditures.</p>
              </div>
            </div>

            {isLoadingProcurement ? (
              <div className="p-12 text-center text-xs font-bold text-stone-400">Loading procurement reports...</div>
            ) : procurementOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-400">No procurement orders recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-600 text-[10px] font-black uppercase tracking-wider border-b border-stone-200">
                      <th className="p-3 whitespace-nowrap">PO Number</th>
                      <th className="p-3 whitespace-nowrap">Date</th>
                      <th className="p-3 whitespace-nowrap">Supplier / Vendor</th>
                      <th className="p-3 whitespace-nowrap">Category</th>
                      <th className="p-3 whitespace-nowrap text-right">Total Amount</th>
                      <th className="p-3 whitespace-nowrap text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {procurementOrders.map((po) => (
                      <tr key={po.id} className="hover:bg-stone-50">
                        <td className="p-3 font-mono font-bold text-stone-900">{po.po_number || 'PO-2026'}</td>
                        <td className="p-3 font-mono text-stone-500">{new Date(po.order_date || po.created_at).toLocaleDateString("en-IN")}</td>
                        <td className="p-3 font-bold text-stone-900">{po.vendor_name || 'Standard Supplier'}</td>
                        <td className="p-3 text-stone-600">{po.category || 'General Supplies'}</td>
                        <td className="p-3 text-right font-mono font-black text-indigo-700">{formatINR(po.total_amount || 0)}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            po.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            po.status === 'Delivered' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {po.status || 'Pending'}
                          </span>
                        </td>
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
      {/* 4. DEFAULTERS & OUTSTANDING AUDIT */}
      {/* ========================================================================= */}
      {activeTab === "defaulters" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search student, adm no, invoice..."
                  value={defaulterSearch}
                  onChange={(e) => setDefaulterSearch(e.target.value)}
                  className="bg-transparent text-xs font-medium text-stone-900 focus:outline-none w-64"
                />
              </div>

              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
                <span className="text-xs font-bold text-stone-500">Class:</span>
                <select
                  value={defaulterClass}
                  onChange={(e) => setDefaulterClass(e.target.value)}
                  className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
                >
                  {allClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
              Total Defaulters: {filteredDefaulters.length} | Overdue: {formatINR(filteredDefaulters.reduce((acc, d) => acc + d.balanceDue, 0))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">Fee Defaulters &amp; Outstanding Dues Roster</h3>
                <p className="text-xs text-stone-400">Actionable list for payment reminders, recovery calls, and parent SMS.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 text-[10px] font-black uppercase tracking-wider border-b border-stone-200">
                    <th className="p-3 whitespace-nowrap">Adm No</th>
                    <th className="p-3 whitespace-nowrap">Student Name</th>
                    <th className="p-3 whitespace-nowrap">Class</th>
                    <th className="p-3 whitespace-nowrap">Parent Details</th>
                    <th className="p-3 whitespace-nowrap">Invoice Ref</th>
                    <th className="p-3 whitespace-nowrap text-right">Invoiced (INR)</th>
                    <th className="p-3 whitespace-nowrap text-right">Paid (INR)</th>
                    <th className="p-3 whitespace-nowrap text-right font-black text-orange-700">Balance Due</th>
                    <th className="p-3 whitespace-nowrap text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredDefaulters.map((d) => (
                    <tr key={d.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold text-stone-900">{d.admissionNo}</td>
                      <td className="p-3 font-bold text-stone-900">{d.studentName}</td>
                      <td className="p-3 text-stone-700 font-semibold">{d.className}</td>
                      <td className="p-3 text-stone-600">
                        <div className="font-bold text-stone-800">{d.parentName}</div>
                        <div className="text-[10px] font-mono text-stone-400">{d.parentMobile}</div>
                      </td>
                      <td className="p-3 font-mono text-stone-500">{d.invoiceNumber}</td>
                      <td className="p-3 text-right font-mono">{formatINR(d.totalAmount)}</td>
                      <td className="p-3 text-right font-mono text-emerald-600">{formatINR(d.amountPaid)}</td>
                      <td className="p-3 text-right font-mono font-black text-orange-600">{formatINR(d.balanceDue)}</td>
                      <td className="p-3 text-center">
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE COLUMN CUSTOMIZER MODAL */}
      {/* ========================================================================= */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-900 text-amber-400 rounded-2xl">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-950">Customize Day Book Columns</h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Select and decide fee heads from Fee Master &amp; Class Structures to display.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets & Filters */}
            <div className="p-4 border-b border-stone-200 space-y-3 bg-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset("standard")}
                  className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  ⭐ Standard Day Book
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("all_heads")}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  🎯 All Fee Heads
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("compact")}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition"
                >
                  💼 Compact
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("reset")}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs font-bold transition ml-auto"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
                  <Search className="w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search columns or fee heads..."
                    value={columnSearch}
                    onChange={(e) => setColumnSearch(e.target.value)}
                    className="bg-transparent text-xs font-medium text-stone-900 focus:outline-none w-full"
                  />
                </div>

                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setColumnCategoryFilter("all")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      columnCategoryFilter === "all" ? "bg-white text-stone-950 shadow-xs" : "text-stone-600"
                    }`}
                  >
                    All ({availableColumns.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setColumnCategoryFilter("fee_head")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      columnCategoryFilter === "fee_head" ? "bg-white text-stone-950 shadow-xs" : "text-stone-600"
                    }`}
                  >
                    Fee Heads ({availableColumns.filter(c => c.category === 'fee_head').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setColumnCategoryFilter("info")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      columnCategoryFilter === "info" ? "bg-white text-stone-950 shadow-xs" : "text-stone-600"
                    }`}
                  >
                    Info / Mode
                  </button>
                </div>
              </div>
            </div>

            {/* Checkbox List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredModalColumns.map((col) => {
                  const isChecked = selectedColumnIds.includes(col.id);
                  return (
                    <label
                      key={col.id}
                      onClick={() => toggleColumn(col.id)}
                      className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer select-none ${
                        isChecked 
                          ? "bg-indigo-50/60 border-indigo-300 text-indigo-950 shadow-2xs" 
                          : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate">{col.label}</span>
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                            col.category === 'fee_head' ? 'bg-amber-100 text-amber-800' :
                            col.category === 'accounting' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-stone-100 text-stone-600'
                          }`}>
                            {col.category === 'fee_head' ? 'Fee Head' : col.category === 'accounting' ? 'Accounting' : 'Info'}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-0.5">Column ID: {col.id}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 flex items-center justify-between bg-stone-50">
              <span className="text-xs font-bold text-stone-600">
                Active Columns: <strong className="text-indigo-700">{selectedColumnIds.length}</strong> of {availableColumns.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("all")}
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl text-xs transition"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setIsColumnModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-xl text-xs transition shadow-md"
                >
                  ✓ Apply &amp; View Day Book
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
