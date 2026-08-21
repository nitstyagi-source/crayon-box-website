"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, Plus, Search, Filter, QrCode, 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, 
  RotateCcw, ShieldCheck, Tag, Layers, Bookmark, 
  Users, BookMarked, Printer, RefreshCw, X, ChevronRight
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getLibraryDashboardStats,
  getLibraryBooksCatalog,
  getLibraryTransactions,
  issueBookTransaction,
  returnBookTransaction
} from "@/app/actions/library";

const CATEGORIES = [
  "All",
  "English",
  "Hindi",
  "Mathematics",
  "Science",
  "SST",
  "GK",
  "Story Books",
  "Fiction",
  "Reference",
  "Activity",
  "Teacher Reference"
];

export default function LibraryManagementPage() {
  const { activeCampusId } = useCampusContext();

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "catalog" | "active_loans" | "overdue" | "accession" | "shelves"
  >("catalog");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState<any>(null);
  const [selectedAccessionNo, setSelectedAccessionNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Issue Form
  const [issueForm, setIssueForm] = useState({
    studentName: "Aarav Sharma",
    className: "Grade 5-A",
    loanDays: 7
  });

  useEffect(() => {
    loadAllData();
  }, [activeCampusId, selectedCategory, searchQuery]);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [statsRes, booksRes, txRes] = await Promise.all([
        getLibraryDashboardStats(activeCampusId),
        getLibraryBooksCatalog({
          campusId: activeCampusId,
          category: selectedCategory,
          search: searchQuery
        }),
        getLibraryTransactions({ campusId: activeCampusId })
      ]);

      if (statsRes.success && statsRes.data) setDashboardStats(statsRes.data);
      if (booksRes.success && booksRes.data) setBooks(booksRes.data);
      if (txRes.success && txRes.data) setTransactions(txRes.data);
    } catch (e) {
      console.error("Error loading library data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Book Issue Submit
  async function handleIssueSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBookForIssue || !selectedAccessionNo) return;

    setIsSubmitting(true);
    try {
      const res = await issueBookTransaction({
        campusId: activeCampusId,
        bookId: selectedBookForIssue.id,
        accessionNumber: selectedAccessionNo,
        studentName: issueForm.studentName,
        className: issueForm.className,
        loanDays: issueForm.loanDays
      });

      if (res.success) {
        alert(res.message);
        setIsIssueModalOpen(false);
        setSelectedBookForIssue(null);
        setSelectedAccessionNo("");
        loadAllData();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Return Book Submit
  async function handleReturnBook(transactionId: string) {
    const res = await returnBookTransaction({ transactionId });
    if (res.success) {
      alert(res.message);
      loadAllData();
    } else {
      alert("Error: " + res.error);
    }
  }

  const activeLoans = transactions.filter(t => t.status === "Issued");
  const overdueLoans = transactions.filter(t => t.status === "Overdue");

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-purple-600" /> Digital &amp; Physical Library Hub
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Accession QR &amp; Student ID Integrated
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Library Management &amp; Circulation Desk
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage books catalog, accession copies, fast QR barcode issuing, return fine calculations, and rack locations.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              if (books.length > 0) {
                setSelectedBookForIssue(books[0]);
                const availCopy = books[0].copies?.find((c: any) => c.status === "Available");
                setSelectedAccessionNo(availCopy?.accession_number || "");
                setIsIssueModalOpen(true);
              }
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" /> [ 📲 Scan &amp; Issue Book ]
          </button>
        </div>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Titles</span>
          <strong className="text-xl font-black text-stone-900 mt-0.5 block">{dashboardStats?.totalBooks || 5}</strong>
          <span className="text-[10px] text-purple-700 font-bold">{dashboardStats?.totalCopies || 33} Physical Copies</span>
        </div>

        <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] text-emerald-800 font-bold uppercase block">Available Copies</span>
          <strong className="text-xl font-black text-emerald-950 mt-0.5 block">{dashboardStats?.available || 22}</strong>
          <span className="text-[10px] text-emerald-700 font-medium">Ready on Shelves</span>
        </div>

        <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] text-blue-800 font-bold uppercase block">Currently Issued</span>
          <strong className="text-xl font-black text-blue-950 mt-0.5 block">{dashboardStats?.issued || 9}</strong>
          <span className="text-[10px] text-blue-700 font-medium">Active Loans</span>
        </div>

        <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[10px] text-rose-800 font-bold uppercase block">Overdue Books</span>
          <strong className="text-xl font-black text-rose-950 mt-0.5 block">{dashboardStats?.overdue || 2}</strong>
          <span className="text-[10px] text-rose-700 font-bold">Auto Fine Active</span>
        </div>

        <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] text-amber-800 font-bold uppercase block">Pending Fines</span>
          <strong className="text-xl font-black text-amber-950 mt-0.5 block">
            ₹ {Number(dashboardStats?.pendingFines || 180).toLocaleString("en-IN")}
          </strong>
          <span className="text-[10px] text-amber-700 font-medium">₹20 / day late fee</span>
        </div>

        <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] text-purple-800 font-bold uppercase block">Circulation Today</span>
          <strong className="text-xl font-black text-purple-950 mt-0.5 block">6 In / 4 Out</strong>
          <span className="text-[10px] text-purple-700 font-medium">Daily Turnover</span>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "catalog" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📚 Book Master Catalog ({books.length})
        </button>

        <button
          onClick={() => setActiveTab("active_loans")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "active_loans" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🔄 Active Loans &amp; Returns ({activeLoans.length})
        </button>

        <button
          onClick={() => setActiveTab("overdue")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "overdue" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          ⚠️ Overdue &amp; Fines ({overdueLoans.length})
        </button>

        <button
          onClick={() => setActiveTab("accession")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "accession" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🪪 Accession Copies Register
        </button>

        <button
          onClick={() => setActiveTab("shelves")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "shelves" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🗄️ Rack &amp; Shelf Directory
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. BOOK MASTER CATALOG */}
      {/* ========================================================================= */}
      {activeTab === "catalog" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Library Book Titles</h3>
              <p className="text-stone-500">Searchable catalog with real-time physical copy availability.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-xs"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((b) => (
              <div key={b.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">{b.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      b.available_copies > 0 ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"
                    }`}>
                      {b.available_copies} / {b.total_copies} Avail
                    </span>
                  </div>
                  <strong className="text-stone-900 font-bold text-sm block line-clamp-2">{b.title}</strong>
                  <span className="text-[11px] text-stone-500 block">By: <strong>{b.author}</strong> ({b.publisher})</span>
                  <div className="text-[10px] font-mono text-stone-400">ISBN: {b.isbn} • {b.class_grade}</div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-stone-200/70 text-[11px] space-y-1">
                  <div>📍 <strong>Location:</strong> <span className="font-semibold text-purple-900">{b.rack_location}</span></div>
                  <div>💰 <strong>Price:</strong> ₹ {Number(b.price).toLocaleString("en-IN")}</div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBookForIssue(b);
                      const availCopy = b.copies?.find((c: any) => c.status === "Available");
                      setSelectedAccessionNo(availCopy?.accession_number || "");
                      setIsIssueModalOpen(true);
                    }}
                    disabled={b.available_copies <= 0}
                    className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center justify-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Issue Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACTIVE LOANS & CIRCULATION LEDGER */}
      {/* ========================================================================= */}
      {activeTab === "active_loans" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Active Book Borrowings</h3>
              <p className="text-stone-500">Books currently in custody of students and faculty members.</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-xl">
              {activeLoans.length} Active Loans
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Accession #</th>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Borrower (Student / Class)</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3 text-right">Circulation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {activeLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-stone-50 transition">
                    <td className="p-3 font-mono font-bold text-purple-700">{loan.accession_number}</td>
                    <td className="p-3 font-bold text-stone-900">{loan.book_title}</td>
                    <td className="p-3">
                      <strong className="text-stone-800 block">{loan.student_name}</strong>
                      <span className="text-[10px] text-stone-400">{loan.class_name}</span>
                    </td>
                    <td className="p-3 font-mono text-stone-600">{loan.issue_date}</td>
                    <td className="p-3 font-mono font-bold text-stone-900">{loan.due_date}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleReturnBook(loan.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 ml-auto shadow-2xs"
                      >
                        <RotateCcw className="w-3 h-3" /> [ Return Book ]
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
      {/* 3. OVERDUE & FINES TRACKER */}
      {/* ========================================================================= */}
      {activeTab === "overdue" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Overdue Books &amp; Late Fee Ledger</h3>
              <p className="text-stone-500">Auto-calculated fines at ₹20/day past due date.</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-900 bg-rose-50 px-2.5 py-1 rounded-xl">
              {overdueLoans.length} Overdue Cases
            </span>
          </div>

          <div className="space-y-3">
            {overdueLoans.map((ov) => (
              <div key={ov.id} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-rose-800 font-bold uppercase">{ov.accession_number}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-[10px] text-rose-900 font-bold bg-rose-100 px-2 py-0.2 rounded">
                      Due: {ov.due_date}
                    </span>
                  </div>
                  <strong className="text-stone-900 font-bold text-sm block mt-1">{ov.book_title}</strong>
                  <span className="text-[11px] text-stone-600 font-medium">
                    Borrower: <strong>{ov.student_name}</strong> ({ov.class_name}) • {ov.remarks}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Late Fine</span>
                    <strong className="text-base font-black text-rose-950 font-mono">
                      ₹ {Number(ov.fine_amount).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReturnBook(ov.id)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
                  >
                    Receive &amp; Settle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ACCESSION COPIES REGISTER */}
      {/* ========================================================================= */}
      {activeTab === "accession" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Physical Accession Copies Register</h3>
            <p className="text-stone-500">Every physical book copy tracked with its unique barcode and condition.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {books.flatMap(b => b.copies || []).map((copy: any) => (
              <div key={copy.id} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-purple-700 text-xs">{copy.accession_number}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    copy.status === "Available" ? "bg-emerald-100 text-emerald-900" :
                    copy.status === "Overdue" ? "bg-rose-100 text-rose-900" : "bg-blue-100 text-blue-900"
                  }`}>
                    {copy.status}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 font-medium truncate">Copy #{copy.copy_number}</div>
                <div className="text-[10px] text-stone-400 font-mono">📍 {copy.rack_location}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SHELVES & RACKS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === "shelves" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Physical Library Stacks &amp; Racks Map</h3>
            <p className="text-stone-500">Floor $\rightarrow$ Section $\rightarrow$ Rack $\rightarrow$ Shelf architecture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { sec: "Science & Technology", rack: "Rack S-02", shelf: "Shelf 1–4", count: 18, color: "border-blue-200 bg-blue-50/50" },
              { sec: "Children Fiction & Story Books", rack: "Rack F-04", shelf: "Shelf 1–3", count: 24, color: "border-purple-200 bg-purple-50/50" },
              { sec: "Language & Literature (Hindi)", rack: "Rack H-01", shelf: "Shelf 1–4", count: 20, color: "border-amber-200 bg-amber-50/50" },
              { sec: "Dictionaries & Reference", rack: "Rack R-01", shelf: "Shelf 1–2", count: 12, color: "border-emerald-200 bg-emerald-50/50" },
              { sec: "Mathematics & Olympiads", rack: "Rack M-03", shelf: "Shelf 1–3", count: 15, color: "border-stone-200 bg-stone-50" }
            ].map(r => (
              <div key={r.rack} className={`p-4 rounded-2xl border ${r.color} space-y-2`}>
                <span className="text-[10px] font-mono uppercase font-bold text-stone-600 block">{r.sec}</span>
                <strong className="text-stone-900 font-bold text-base block">{r.rack} — {r.shelf}</strong>
                <div className="text-[11px] text-stone-600 font-semibold">{r.count} Copies Cataloged</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 FAST ISSUE BOOK MODAL */}
      {/* ========================================================================= */}
      {isIssueModalOpen && selectedBookForIssue && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-700 font-bold block">
                  Circulation Desk
                </span>
                <h3 className="text-base font-black text-stone-900 mt-0.5">
                  Issue Book to Reader
                </h3>
              </div>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
                <strong className="text-stone-900 font-bold block text-sm">{selectedBookForIssue.title}</strong>
                <span className="text-[11px] text-stone-600">By: {selectedBookForIssue.author} • {selectedBookForIssue.category}</span>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Physical Copy (Accession #) *</label>
                <select
                  value={selectedAccessionNo}
                  onChange={(e) => setSelectedAccessionNo(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold"
                >
                  {selectedBookForIssue.copies
                    ?.filter((c: any) => c.status === "Available")
                    .map((c: any) => (
                      <option key={c.id} value={c.accession_number}>
                        {c.accession_number} (Copy #{c.copy_number} • {c.rack_location})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Student / Borrower Name *</label>
                <input
                  type="text"
                  required
                  value={issueForm.studentName}
                  onChange={(e) => setIssueForm({ ...issueForm, studentName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Class &amp; Section</label>
                  <input
                    type="text"
                    value={issueForm.className}
                    onChange={(e) => setIssueForm({ ...issueForm, className: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Loan Period (Days)</label>
                  <input
                    type="number"
                    value={issueForm.loanDays}
                    onChange={(e) => setIssueForm({ ...issueForm, loanDays: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Issuing..." : "Confirm & Issue Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
