"use client";

import React, { useState, useEffect } from "react";
import {
  Library,
  BookOpen,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Send,
  Calendar,
  IndianRupee,
  Users,
  Clock,
  RotateCcw,
  Sparkles,
  BookMarked
} from "lucide-react";
import {
  getLibraryCirculationDashboardAction,
  issueLibraryBookAction,
  returnLibraryBookAction,
  sendOverdueBookWhatsAppAlertAction
} from "@/app/actions/smart-timetable-actions";

export default function DigitalLibraryCirculationPage() {
  const [activeTab, setActiveTab] = useState<"issue_return" | "overdue" | "catalog">("issue_return");
  const [loans, setLoans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Issue Form State
  const [studentName, setStudentName] = useState("Aarav Sharma");
  const [className, setClassName] = useState("Class 1-B");
  const [parentPhone, setParentPhone] = useState("+919810081008");
  const [bookIsbn, setBookIsbn] = useState("978-0143330837");
  const [bookTitle, setBookTitle] = useState("Malgudi Days by R.K. Narayan");

  useEffect(() => {
    loadCirculation();
  }, []);

  async function loadCirculation() {
    setIsLoading(true);
    try {
      const res = await getLibraryCirculationDashboardAction();
      if (res.success) {
        setLoans(res.loans);
        setStats(res.stats);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleIssueBook(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await issueLibraryBookAction({
        studentName,
        className,
        parentPhone,
        bookIsbn,
        bookTitle
      });
      if (res.success) {
        alert(res.message);
        loadCirculation();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReturnBook(loanId: string) {
    setIsProcessing(true);
    try {
      const res = await returnLibraryBookAction(loanId);
      if (res.success) {
        alert(res.message);
        loadCirculation();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSendOverdueNotice(loan: any) {
    setIsProcessing(true);
    try {
      const res = await sendOverdueBookWhatsAppAlertAction({
        studentName: loan.student_name,
        parentPhone: loan.parent_phone || "+919810081008",
        bookTitle: loan.book_title,
        fineAmount: loan.fine_amount || 20
      });
      if (res.success) {
        alert(res.message);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Barcode Circulation POS &amp; Overdue WhatsApp Recovery
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Library className="w-8 h-8 text-teal-400" />
            Digital Library Master &amp; Circulation Counter
          </h1>
          <p className="text-xs sm:text-sm text-teal-200/80 max-w-2xl">
            Scan barcode/ISBN to issue and return books in seconds, auto-calculate overdue fines (₹5/day), and dispatch return reminders via WhatsApp.
          </p>
        </div>

        {/* Live Circulation Metrics */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/15">
          <div className="w-3 h-3 rounded-full bg-teal-400 animate-ping" />
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{stats?.totalIssued || 2} Books In Circulation</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-teal-300/80 font-mono text-[11px]">
              Barcode Scanner: Ready
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-teal-600" />
            Active Loans
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats?.totalIssued || 2}
          </div>
          <div className="text-[10px] text-teal-600 font-bold">14-Day Loan Policy</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            Overdue Books
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {stats?.overdueLoans || 2}
          </div>
          <div className="text-[10px] text-stone-500 font-bold">WhatsApp Reminders Active</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-purple-600" />
            Pending Fines
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600">
            ₹{stats?.pendingFines || 60}
          </div>
          <div className="text-[10px] text-purple-700 font-bold">₹5 / Day Rate</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <BookMarked className="w-4 h-4 text-blue-600" />
            Catalog Titles
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-950">
            3,420+
          </div>
          <div className="text-[10px] text-stone-500 font-bold">NCERT &amp; CBSE Fiction</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("issue_return")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "issue_return"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <QrCode className="w-4 h-4" />
          📖 Rapid Issue &amp; Return POS Counter
        </button>

        <button
          onClick={() => setActiveTab("overdue")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "overdue"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          🚨 Overdue Recovery &amp; WhatsApp Alerts ({loans.filter(l => l.status === 'OVERDUE').length})
        </button>

        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "catalog"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Library className="w-4 h-4" />
          📚 All Circulation Records ({loans.length})
        </button>
      </div>

      {/* TAB 1: ISSUE / RETURN POS */}
      {activeTab === "issue_return" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-teal-600" />
                Issue Book to Student / Teacher
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Scan barcode or enter details to issue book with automated 14-day return due date.
              </p>
            </div>
            <span className="text-xs font-black bg-teal-100 text-teal-900 px-3 py-1 rounded-full">
              Barcode POS
            </span>
          </div>

          <form onSubmit={handleIssueBook} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Class &amp; Section</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Parent WhatsApp / Phone</label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Book ISBN / Barcode</label>
                <input
                  type="text"
                  value={bookIsbn}
                  onChange={(e) => setBookIsbn(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Book Title</label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                📖 Complete Issue &amp; Generate 14-Day Loan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: OVERDUE RECOVERY */}
      {activeTab === "overdue" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Overdue Books &amp; Automated WhatsApp Dunning
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Send 1-click return notices to parents with calculated overdue fine amount.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {loans.filter(l => l.status === 'OVERDUE').map((loan) => (
              <div
                key={loan.id}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-black text-stone-900">{loan.book_title}</strong>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
                      Overdue (Fine: ₹{loan.fine_amount})
                    </span>
                  </div>
                  <div className="text-stone-600">
                    Issued to: <strong>{loan.student_name}</strong> ({loan.class_name}) • Due Date: <span className="font-mono text-amber-800 font-bold">{new Date(loan.due_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendOverdueNotice(loan)}
                    disabled={isProcessing}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> 📲 Send WhatsApp Reminder
                  </button>

                  <button
                    onClick={() => handleReturnBook(loan.id)}
                    disabled={isProcessing}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Return Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CATALOG & ALL RECORDS */}
      {activeTab === "catalog" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-teal-600" />
                All Library Circulation Records
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Complete record of all active loans, returned books, and overdue status.
              </p>
            </div>
            <button
              onClick={loadCirculation}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-black">
                  <th className="p-3">Book Title</th>
                  <th className="p-3">ISBN</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-stone-50/50">
                    <td className="p-3 font-bold text-stone-900">{loan.book_title}</td>
                    <td className="p-3 font-mono text-[11px]">{loan.book_isbn}</td>
                    <td className="p-3">{loan.student_name}</td>
                    <td className="p-3">{loan.class_name}</td>
                    <td className="p-3 font-mono text-stone-600">{new Date(loan.due_date).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        loan.status === 'OVERDUE'
                          ? 'bg-amber-100 text-amber-900'
                          : loan.status === 'RETURNED'
                          ? 'bg-stone-100 text-stone-600'
                          : 'bg-teal-100 text-teal-900'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {loan.status !== 'RETURNED' && (
                        <button
                          onClick={() => handleReturnBook(loan.id)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg text-[10px] font-bold"
                        >
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
