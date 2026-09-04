"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Clock, AlertTriangle, Search, Filter, MessageSquare, 
  Send, CheckCircle2, Phone, User, RefreshCw, ShieldAlert,
  ArrowRight, CreditCard, FileText
} from "lucide-react";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { getDefaultersAging, sendFeeReminderNotification } from "@/app/actions/finance-core";
import { getDepartedStudentsPendingDuesAction } from "@/app/actions/finance-concession-actions";

export default function DefaultersAndAgingPage() {
  const { currentInstitution, selectedInstitutionObj } = useInstitution();
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [departedDefaulters, setDepartedDefaulters] = useState<any[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState<"ACTIVE" | "DEPARTED">("ACTIVE");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBucket, setSelectedBucket] = useState("All");
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  useEffect(() => {
    loadAllDefaulters();
  }, [currentInstitution]);

  async function loadAllDefaulters() {
    setIsLoading(true);
    try {
      const [resActive, resDeparted] = await Promise.all([
        getDefaultersAging(currentInstitution),
        getDepartedStudentsPendingDuesAction()
      ]);

      if (resActive.success) {
        setDefaulters(resActive.data || []);
      }
      if (resDeparted.success) {
        setDepartedDefaulters(resDeparted.data || []);
      }
    } catch (e) {
      console.error("Error loading defaulters:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendReminder(d: any) {
    setSendingReminderId(d.studentId);
    try {
      const message = `Dear Parent, this is a formal accounts notice from ${selectedInstitutionObj?.name || 'the School Accounts Department'}. Pending fee balance of ₹${d.totalDue || d.pendingBalance} for ${d.name || d.studentName} (${d.className}) is overdue on ledger records. Kindly clear dues via accounts counter.`;
      const res = await sendFeeReminderNotification({
        institution_code: currentInstitution,
        student_id: d.studentId,
        student_name: d.name || d.studentName,
        parent_mobile: d.parentMobile || d.guardianPhone,
        channel: 'WhatsApp',
        due_amount: d.totalDue || d.pendingBalance,
        message_content: message
      });

      if (res.success) {
        alert(`📱 WhatsApp reminder sent to ${d.parentName || d.guardianName} (${d.parentMobile || d.guardianPhone})!`);
      } else {
        alert("Failed to log reminder: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSendingReminderId(null);
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const filteredActiveDefaulters = defaulters.filter((d) => {
    const matchesSearch = searchQuery === "" || 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBucket = selectedBucket === "All" || d.agingBucket === selectedBucket;
    return matchesSearch && matchesBucket;
  });

  const filteredDepartedDefaulters = departedDefaulters.filter((d) => {
    return searchQuery === "" ||
      d.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.tcNumber && d.tcNumber.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const totalActiveOutstanding = defaulters.reduce((acc, curr) => acc + curr.totalDue, 0);
  const totalDepartedOutstanding = departedDefaulters.reduce((acc, curr) => acc + (curr.pendingBalance || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Dues Aging & Recovery Ledger
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">
              Active: {formatCurrency(totalActiveOutstanding)} | Departed: {formatCurrency(totalDepartedOutstanding)}
            </span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Fee Defaulters & Outstanding Dues</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Track pending student balances across active cohorts and departed / TC issued students.
          </p>
        </div>

        <button
          onClick={loadAllDefaulters}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Live Ledgers
        </button>
      </div>

      {/* Main Category Tabs */}
      <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveCategoryTab("ACTIVE")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
            activeCategoryTab === "ACTIVE"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <span>🎓 Active Enrolled Defaulters</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeCategoryTab === "ACTIVE" ? "bg-stone-700 text-stone-200" : "bg-stone-100 text-stone-600"
          }`}>
            {defaulters.length} ({formatCurrency(totalActiveOutstanding)})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategoryTab("DEPARTED")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
            activeCategoryTab === "DEPARTED"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
          }`}
        >
          <span>📁 Departed & Archived Dues Ledger (TC Issued / Withdrawn)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeCategoryTab === "DEPARTED" ? "bg-amber-700 text-white" : "bg-amber-200 text-amber-900"
          }`}>
            {departedDefaulters.length} ({formatCurrency(totalDepartedOutstanding)})
          </span>
        </button>
      </div>

      {activeCategoryTab === "ACTIVE" ? (
        <>
          {/* Aging Buckets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => setSelectedBucket("0–30 Days")}
              className={`p-5 rounded-3xl border cursor-pointer transition ${
                selectedBucket === "0–30 Days" ? "bg-blue-50 border-blue-400" : "bg-white border-stone-200 hover:border-stone-300"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">0–30 Days (Current)</span>
              <h3 className="text-2xl font-black text-stone-900 mt-1">
                {defaulters.filter(d => d.agingBucket === "0–30 Days").length} Students
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Early reminder stage</p>
            </div>

            <div 
              onClick={() => setSelectedBucket("31–60 Days")}
              className={`p-5 rounded-3xl border cursor-pointer transition ${
                selectedBucket === "31–60 Days" ? "bg-amber-50 border-amber-400" : "bg-white border-stone-200 hover:border-stone-300"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">31–60 Days (Moderate)</span>
              <h3 className="text-2xl font-black text-amber-700 mt-1">
                {defaulters.filter(d => d.agingBucket === "31–60 Days").length} Students
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Follow-up call stage</p>
            </div>

            <div 
              onClick={() => setSelectedBucket("61–90 Days")}
              className={`p-5 rounded-3xl border cursor-pointer transition ${
                selectedBucket === "61–90 Days" ? "bg-orange-50 border-orange-400" : "bg-white border-stone-200 hover:border-stone-300"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">61–90 Days (High Priority)</span>
              <h3 className="text-2xl font-black text-orange-700 mt-1">
                {defaulters.filter(d => d.agingBucket === "61–90 Days").length} Students
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Parent meeting stage</p>
            </div>

            <div 
              onClick={() => setSelectedBucket("90+ Days (Critical)")}
              className={`p-5 rounded-3xl border cursor-pointer transition ${
                selectedBucket === "90+ Days (Critical)" ? "bg-red-50 border-red-400" : "bg-white border-stone-200 hover:border-stone-300"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600">90+ Days (Critical)</span>
              <h3 className="text-2xl font-black text-red-700 mt-1">
                {defaulters.filter(d => d.agingBucket === "90+ Days (Critical)").length} Students
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Principal escalation</p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search active defaulter by Student Name, Admission #, Class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={() => setSelectedBucket("All")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedBucket === "All" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              View All Buckets ({defaulters.length})
            </button>
          </div>

          {/* Active Defaulters Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/70 text-[11px] font-black uppercase tracking-wider text-stone-500">
                    <th className="py-4 px-6">Student Details</th>
                    <th className="py-4 px-6">Class / Wing</th>
                    <th className="py-4 px-6">Parent Contact</th>
                    <th className="py-4 px-6">Outstanding Dues</th>
                    <th className="py-4 px-6">Aging Bucket</th>
                    <th className="py-4 px-6">Last Payment</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-stone-400">
                        <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Calculating ledger dues & aging...
                      </td>
                    </tr>
                  ) : filteredActiveDefaulters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-stone-400">
                        🎉 No active defaulters found in this category!
                      </td>
                    </tr>
                  ) : (
                    filteredActiveDefaulters.map((d) => (
                      <tr key={d.studentId} className="hover:bg-stone-50/60 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-stone-900">{d.name}</div>
                          <div className="text-[11px] text-stone-400 font-mono">#{d.admissionNo}</div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-stone-700">
                          {d.className}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-stone-800 font-semibold">{d.parentName}</div>
                          <div className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" /> {d.parentMobile}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-black text-amber-600 font-mono text-sm">
                          {formatCurrency(d.totalDue)}
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                            {d.agingBucket}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-stone-500">
                          {d.lastPaymentDate}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/finance/collections`} className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition">
                              Collect POS
                            </Link>
                            <button
                              onClick={() => handleSendReminder(d)}
                              disabled={sendingReminderId === d.studentId}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition disabled:opacity-50"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              WhatsApp
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* SEPARATE SECTION: DEPARTED & ARCHIVED STUDENTS PENDING DUES LEDGER */
        <div className="space-y-4">
          
          {/* Departed Dues Overview Banner */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-600 text-white rounded-2xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-950">Departed & Archived Student Arrears Ledger</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  These students have departed via Transfer Certificate (TC) or Withdrawal, but still carry unsettled debit balances on their institutional fee ledger.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs text-amber-800 font-bold uppercase tracking-wider">Total Departed Arrears</div>
              <div className="text-2xl font-black text-amber-950 font-mono">{formatCurrency(totalDepartedOutstanding)}</div>
            </div>
          </div>

          {/* Departed Search */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search departed student by Name, Admission #, TC #, Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Departed Dues Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/70 text-[11px] font-black uppercase tracking-wider text-stone-500">
                    <th className="py-4 px-6">Departed Student</th>
                    <th className="py-4 px-6">Departure Status</th>
                    <th className="py-4 px-6">Class Last Attended</th>
                    <th className="py-4 px-6">Guardian Contact</th>
                    <th className="py-4 px-6">Pending Arrears</th>
                    <th className="py-4 px-6">Last Transaction</th>
                    <th className="py-4 px-6 text-right">Recovery Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-stone-400">
                        <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Scanning departed student fee ledgers...
                      </td>
                    </tr>
                  ) : filteredDepartedDefaulters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-stone-400">
                        🎉 Zero departed students have pending fee dues! All departed accounts are 100% cleared.
                      </td>
                    </tr>
                  ) : (
                    filteredDepartedDefaulters.map((d) => (
                      <tr key={d.studentId} className="hover:bg-amber-50/30 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-stone-900">{d.studentName}</div>
                          <div className="text-[11px] text-stone-400 font-mono">#{d.admissionNo} • {d.universalId}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase border inline-flex items-center gap-1 ${
                              d.subStatus === 'TRANSFERRED' ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                              {d.subStatus === 'TRANSFERRED' ? '🔄 Transferred' : '⚠️ Withdrawn'}
                            </span>
                            {d.tcNumber && (
                              <div className="text-[10px] text-purple-700 font-mono font-medium">
                                📜 {d.tcNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-stone-700">
                          {d.className} ({d.institutionCode})
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-stone-800 font-semibold">{d.guardianName}</div>
                          <div className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" /> {d.guardianPhone}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-black text-rose-600 font-mono text-sm">
                          {formatCurrency(d.pendingBalance)}
                        </td>
                        <td className="py-4 px-6 text-stone-500">
                          {d.lastTransactionDate}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              href="/admin/finance/collections" 
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-2xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Collect in POS
                            </Link>
                            <button
                              onClick={() => handleSendReminder(d)}
                              disabled={sendingReminderId === d.studentId}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition disabled:opacity-50"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              Notice
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

