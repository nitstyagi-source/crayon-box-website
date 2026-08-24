"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, Plus, Search, Filter, QrCode, 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, 
  RotateCcw, ShieldCheck, Tag, Layers, Bookmark, 
  Users, BookMarked, Printer, RefreshCw, X, ChevronRight,
  ScanLine, Phone, DollarSign, Library, Sparkles, Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { 
  getLibraryDashboardStats,
  getLibraryBooksCatalog,
  getLibraryTransactions,
  getLibraryAccessionRegister,
  issueBookTransaction,
  returnBookTransaction,
  renewBookLoanAction,
  addNewBookTitleAction
} from "@/app/actions/library";
import { getEnrolledStudentsForIncidentLookupAction } from "@/app/actions/incident-actions";
import { printIsolatedElement } from "@/lib/printUtils";

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
  const { selectedInstitutionObj } = useInstitution();

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "catalog" | "circulation" | "overdue" | "accession" | "shelves"
  >("catalog");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accessions, setAccessions] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState<any>(null);
  const [accessionScanInput, setAccessionScanInput] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudentObj, setSelectedStudentObj] = useState<any>(null);
  const [loanDays, setLoanDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedTxForReturn, setSelectedTxForReturn] = useState<any>(null);
  const [waiveFine, setWaiveFine] = useState(false);

  // Add Book Modal State
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");
  const [newBookPublisher, setNewBookPublisher] = useState("NCERT / National Book Trust");
  const [newBookIsbn, setNewBookIsbn] = useState("");
  const [newBookCategory, setNewBookCategory] = useState("Science");
  const [newBookLanguage, setNewBookLanguage] = useState("English");
  const [newBookGrade, setNewBookGrade] = useState("Grade 3-8");
  const [newBookRack, setNewBookRack] = useState("Rack S-02, Shelf 3");
  const [newBookPrice, setNewBookPrice] = useState(450);
  const [newBookCopies, setNewBookCopies] = useState(5);
  const [newBookDesc, setNewBookDesc] = useState("");

  // Barcode Labels Print State
  const [isBarcodePrintOpen, setIsBarcodePrintOpen] = useState(false);

  // Load All Library Data
  async function loadAllData() {
    setIsLoading(true);
    try {
      const [statsRes, booksRes, txRes, accRes, stuRes] = await Promise.all([
        getLibraryDashboardStats(activeCampusId),
        getLibraryBooksCatalog({
          campusId: activeCampusId,
          category: selectedCategory,
          search: searchQuery
        }),
        getLibraryTransactions({ campusId: activeCampusId, search: searchQuery }),
        getLibraryAccessionRegister({ campusId: activeCampusId, search: searchQuery }),
        getEnrolledStudentsForIncidentLookupAction()
      ]);

      if (statsRes.success && statsRes.data) setDashboardStats(statsRes.data);
      if (booksRes.success && booksRes.data) setBooks(booksRes.data);
      if (txRes.success && txRes.data) setTransactions(txRes.data);
      if (accRes.success && accRes.data) setAccessions(accRes.data);
      if (stuRes.success && stuRes.students) setEnrolledStudents(stuRes.students);
    } catch (e) {
      console.error("Error loading library data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, [activeCampusId, selectedCategory, searchQuery]);

  // Open Issue Modal for Specific Book
  function handleOpenIssueModal(book?: any, accessionNo?: string) {
    setSelectedBookForIssue(book || null);
    setAccessionScanInput(accessionNo || (book?.copies?.find((c: any) => c.status === "Available")?.accession_number || ""));
    setIsIssueModalOpen(true);
  }

  // Handle Book Issue Submit
  async function handleIssueSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessionScanInput.trim()) {
      alert("Please enter or scan an Accession Number / Barcode!");
      return;
    }

    const studentName = selectedStudentObj?.name || "Aarav Sharma";
    const className = selectedStudentObj?.full_class || "Grade 5-A";

    setIsSubmitting(true);
    try {
      const res = await issueBookTransaction({
        campusId: activeCampusId,
        bookId: selectedBookForIssue?.id,
        accessionNumber: accessionScanInput.trim(),
        studentId: selectedStudentObj?.id,
        studentName,
        className,
        loanDays
      });

      if (res.success) {
        alert(res.message);
        setIsIssueModalOpen(false);
        setSelectedBookForIssue(null);
        setAccessionScanInput("");
        setSelectedStudentObj(null);
        loadAllData();
      } else {
        alert("Issue Error: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Open Return Modal
  function handleOpenReturnModal(tx: any) {
    setSelectedTxForReturn(tx);
    setWaiveFine(false);
    setIsReturnModalOpen(true);
  }

  // Execute Book Return
  async function handleReturnConfirm() {
    if (!selectedTxForReturn) return;
    setIsSubmitting(true);
    try {
      const res = await returnBookTransaction({
        transactionId: selectedTxForReturn.id,
        waiveFine
      });

      if (res.success) {
        alert(res.message);
        setIsReturnModalOpen(false);
        setSelectedTxForReturn(null);
        loadAllData();
      } else {
        alert("Return Error: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Renew Loan (+7 Days)
  async function handleRenewLoan(txId: string) {
    const res = await renewBookLoanAction({ transactionId: txId, additionalDays: 7 });
    if (res.success) {
      alert(res.message);
      loadAllData();
    } else {
      alert("Renew Error: " + res.error);
    }
  }

  // Handle Add New Book Submit
  async function handleAddBookSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newBookTitle.trim() || !newBookAuthor.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await addNewBookTitleAction({
        campusId: activeCampusId,
        title: newBookTitle,
        author: newBookAuthor,
        publisher: newBookPublisher,
        isbn: newBookIsbn,
        category: newBookCategory,
        language: newBookLanguage,
        classGrade: newBookGrade,
        rackLocation: newBookRack,
        price: Number(newBookPrice),
        totalCopies: Number(newBookCopies),
        description: newBookDesc
      });

      if (res.success) {
        alert(res.message);
        setIsAddBookModalOpen(false);
        // Reset form
        setNewBookTitle("");
        setNewBookAuthor("");
        setNewBookDesc("");
        loadAllData();
      } else {
        alert("Error adding book: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeLoans = transactions.filter(t => t.status === "Issued");
  const overdueLoans = transactions.filter(t => t.status === "Overdue" || (t.status === "Issued" && new Date(t.due_date) < new Date()));

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* 🌟 TOP HEADER BANNER */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1">
              <Library className="w-3.5 h-3.5 text-indigo-400" /> Digital Library &amp; Circulation Desk
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
              Accession Barcode &amp; OPAC Live
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-400" />
            Library Management &amp; Circulation Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
            Real-time catalog accession register, barcode scanner circulation desk, active loans, and overdue fine recovery.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleOpenIssueModal()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/20"
            leftIcon={<ScanLine className="w-4 h-4" />}
          >
            ⚡ Issue Book (Scan)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddBookModalOpen(true)}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs font-bold"
            leftIcon={<Plus className="w-3.5 h-3.5 text-amber-400" />}
          >
            + Add Title
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsBarcodePrintOpen(true)}
            className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<Printer className="w-3.5 h-3.5 text-indigo-400" />}
          >
            Print Barcodes
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={loadAllData}
            isLoading={isLoading}
            className="bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          />
        </div>
      </div>

      {/* 🌟 KPI STATS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Titles</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {dashboardStats?.totalBooks || books.length}
          </span>
          <span className="text-[11px] text-indigo-600 font-bold">Catalog Records</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Volumes</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {dashboardStats?.totalCopies || accessions.length || 33}
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">Physical Copies</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {dashboardStats?.available || 24}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold">Ready on Stacks</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Loans</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {activeLoans.length}
          </span>
          <span className="text-[11px] text-amber-700 font-bold">With Readers</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overdue</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">
            {overdueLoans.length}
          </span>
          <span className="text-[11px] text-rose-700 font-bold">Delayed Return</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Fines</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
            ₹{dashboardStats?.pendingFines || 240}
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">Late Recovery</span>
        </div>

      </div>

      {/* 🌟 SUB-TABS NAVIGATION & SEARCH BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl flex-wrap">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === "catalog" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            Book Catalog ({books.length})
          </button>

          <button
            onClick={() => setActiveTab("circulation")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === "circulation" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            Circulation &amp; Active Loans ({activeLoans.length})
          </button>

          <button
            onClick={() => setActiveTab("overdue")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === "overdue" ? "bg-white text-rose-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Overdue Recovery ({overdueLoans.length})
          </button>

          <button
            onClick={() => setActiveTab("accession")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === "accession" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <BarcodeIcon className="w-3.5 h-3.5 text-slate-700" />
            Accession Register ({accessions.length})
          </button>

          <button
            onClick={() => setActiveTab("shelves")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === "shelves" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Stacks &amp; Rack Map
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, author, ISBN, accession..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

      </div>

      {/* 🌟 TAB 1: BOOK CATALOG EXPLORER */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const availableCount = book.available_copies !== undefined ? book.available_copies : 1;
            const totalCount = book.total_copies || 1;
            const isAvailable = availableCount > 0;

            return (
              <div
                key={book.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition p-5 space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        {book.book_code} &bull; {book.category}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight mt-0.5">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">By {book.author}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 border ${
                      isAvailable 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {isAvailable ? `${availableCount} Available` : 'All Issued'}
                    </span>
                  </div>

                  {/* Rack & ISBN Meta */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-medium">Rack Location:</span>
                      <strong className="text-slate-900 font-bold">{book.rack_location || "Rack S-01, Shelf 2"}</strong>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-medium">Publisher &amp; Edition:</span>
                      <span className="text-slate-700">{book.publisher || "NCERT"} ({book.edition || "1st Ed"})</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-500">ISBN:</span>
                      <span className="text-slate-600">{book.isbn || "978-81-2026-0001"}</span>
                    </div>
                  </div>

                  {/* Copies Inventory Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Inventory: {availableCount} / {totalCount} Copies Ready</span>
                      <span className="font-mono">₹{book.price || 350}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isAvailable ? 'bg-indigo-600' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, (availableCount / totalCount) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Accession Tags preview */}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {book.copies?.slice(0, 4).map((c: any) => (
                      <span
                        key={c.id || c.accession_number}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                          c.status === "Available" 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                            : c.status === "Issued"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {c.accession_number}
                      </span>
                    ))}
                    {(book.copies?.length || 0) > 4 && (
                      <span className="text-[9px] text-slate-400 font-mono">
                        +{book.copies.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Target: {book.class_grade || "All Grades"}</span>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!isAvailable}
                    onClick={() => handleOpenIssueModal(book)}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs"
                    leftIcon={<ScanLine className="w-3.5 h-3.5" />}
                  >
                    Issue Copy
                  </Button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 🌟 TAB 2: CIRCULATION & ACTIVE READER LOANS */}
      {activeTab === "circulation" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Circulation Desk: Active Loans ({activeLoans.length})
              </h3>
              <p className="text-xs text-slate-400">
                All books currently checked out to students and faculty. Scan or click return to check-in books.
              </p>
            </div>
          </div>

          {activeLoans.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3 stroke-1" />
              <p className="font-bold text-slate-600 text-sm">No active loans right now.</p>
              <p className="mt-1">All borrowed books are returned or on shelves.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3.5 px-4">Tx Code &amp; Copy</th>
                    <th className="py-3.5 px-4">Book Title</th>
                    <th className="py-3.5 px-4">Borrower Details</th>
                    <th className="py-3.5 px-4">Issue Date</th>
                    <th className="py-3.5 px-4">Due Date / Status</th>
                    <th className="py-3.5 px-4 text-right">Circulation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeLoans.map((tx) => {
                    const dueDate = new Date(tx.due_date);
                    const today = new Date();
                    const isOverdue = today > dueDate;
                    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <strong className="font-mono font-bold text-slate-900 block">{tx.transaction_code}</strong>
                          <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 inline-block mt-0.5">
                            {tx.accession_number}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block font-bold text-xs">{tx.book_title}</strong>
                          <span className="text-[10px] text-slate-400">{tx.category || "General Library"} &bull; {tx.rack_location || "Stack 1"}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block font-bold">{tx.student_name}</strong>
                          <span className="text-[10px] text-slate-500 font-semibold">{tx.class_name} ({tx.borrower_type || 'Student'})</span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {tx.issue_date}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit border ${
                            isOverdue
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : diffDays <= 2
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}>
                            <Clock className="w-3 h-3" />
                            {isOverdue ? "Overdue" : diffDays === 0 ? "Due Today" : `${diffDays} Days Left`} ({tx.due_date})
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRenewLoan(tx.id)}
                            className="text-[11px] py-1 px-2.5 border-slate-300 hover:bg-slate-100"
                            title="Renew for +7 days"
                          >
                            +7d Renew
                          </Button>

                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenReturnModal(tx)}
                            className="text-[11px] py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                          >
                            Check-In (Return)
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 🌟 TAB 3: OVERDUE RECOVERY & LATE FINES DESK */}
      {activeTab === "overdue" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-rose-600 text-white px-2 py-0.5 rounded">
                  Overdue Desk
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Overdue Book Recovery &amp; Fine Collection ({overdueLoans.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Readers with overdue loans past the standard due date. Late fine policy: ₹10 per day.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Overdue Fines</span>
              <strong className="text-lg font-black text-rose-700 font-mono">
                ₹{dashboardStats?.pendingFines || 240}
              </strong>
            </div>
          </div>

          {overdueLoans.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3 stroke-1" />
              <p className="font-bold text-slate-700 text-sm">No overdue books!</p>
              <p className="mt-1">All readers are returning books on time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3.5 px-4">Borrower &amp; Contact</th>
                    <th className="py-3.5 px-4">Overdue Book Title</th>
                    <th className="py-3.5 px-4">Accession #</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Fine Computed</th>
                    <th className="py-3.5 px-4 text-right">Recovery Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {overdueLoans.map((tx) => {
                    const dueDate = new Date(tx.due_date);
                    const today = new Date();
                    const diffDays = Math.max(1, Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
                    const fine = tx.fine_amount > 0 ? tx.fine_amount : diffDays * 10;

                    return (
                      <tr key={tx.id} className="hover:bg-rose-50/30 transition">
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block font-bold">{tx.student_name}</strong>
                          <span className="text-[10px] text-slate-500 font-semibold">{tx.class_name}</span>
                          <div className="flex items-center gap-1 text-[10px] text-indigo-600 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{tx.parent_phone || "+91 98765 43210"}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block font-bold text-xs">{tx.book_title}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">Tx: {tx.transaction_code}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                            {tx.accession_number}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-rose-700 font-bold font-mono block">{tx.due_date}</span>
                          <span className="text-[10px] text-rose-600 font-semibold">{diffDays} days overdue</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-black text-rose-700 text-sm font-mono block">₹{fine}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">@ ₹10/day</span>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          <a
                            href={`https://wa.me/?text=Dear%20Parent,%20this%20is%20a%20gentle%20reminder%20that%20the%20library%20book%20'${encodeURIComponent(tx.book_title)}'%20issued%20to%20${encodeURIComponent(tx.student_name)}%20is%20overdue.%20Kindly%20return%20it%20to%20the%20school%20library.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] py-1.5 px-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-xl font-bold transition"
                          >
                            💬 WhatsApp Alert
                          </a>

                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenReturnModal(tx)}
                            className="text-[11px] py-1 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold"
                          >
                            Return &amp; Clear Fine
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 🌟 TAB 4: MASTER ACCESSION REGISTER */}
      {activeTab === "accession" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Master Accession Ledger ({accessions.length} Volumes)
              </h3>
              <p className="text-xs text-slate-400">
                Complete inventory of every physical book volume accessioned in the library with barcode labels.
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBarcodePrintOpen(true)}
              className="text-xs border-slate-300"
              leftIcon={<Printer className="w-3.5 h-3.5 text-indigo-600" />}
            >
              Print Barcode Labels
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Accession #</th>
                  <th className="py-3.5 px-4">Book Title &amp; Author</th>
                  <th className="py-3.5 px-4">Copy #</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Rack &amp; Shelf</th>
                  <th className="py-3.5 px-4">Status &amp; Reader</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {accessions.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <strong className="font-mono font-black text-indigo-700 block text-xs">{acc.accession_number}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{acc.barcode_qr || `QR-${acc.accession_number}`}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block font-bold">{acc.book_title}</strong>
                      <span className="text-[10px] text-slate-500 font-medium">By {acc.author} &bull; {acc.publisher}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        Vol. {acc.copy_number}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-semibold">
                      {acc.category}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {acc.rack_location || "Stack 1"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase inline-block border ${
                        acc.status === "Available"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : acc.status === "Issued"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}>
                        {acc.status}
                      </span>
                      {acc.current_borrower && (
                        <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                          Borrower: {acc.current_borrower}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {acc.status === "Available" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenIssueModal({ id: acc.book_id, title: acc.book_title }, acc.accession_number)}
                          className="text-[11px] py-1 px-2.5 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                        >
                          Issue
                        </Button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">In Circulation</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🌟 TAB 5: INTERACTIVE STACKS & RACK LAYOUT */}
      {activeTab === "shelves" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Rack S-01 (Science & Tech)", color: "border-indigo-200 bg-indigo-50/40 text-indigo-900", icon: "🔬", count: 8, books: ["Science Encyclopedia", "Physics for Primary", "Robotics Made Simple"] },
            { name: "Rack F-04 (Fiction & Stories)", color: "border-amber-200 bg-amber-50/40 text-amber-900", icon: "📖", count: 12, books: ["Malgudi Days", "Panchatantra Tales", "Famous Five"] },
            { name: "Rack R-01 (Reference & Lexicon)", color: "border-emerald-200 bg-emerald-50/40 text-emerald-900", icon: "📚", count: 8, books: ["Oxford Primary English Dictionary", "World Atlas", "Britannica Junior"] },
            { name: "Rack M-02 (Mathematics & Logic)", color: "border-purple-200 bg-purple-50/40 text-purple-900", icon: "📐", count: 5, books: ["Vedic Mathematics", "Puzzles and Paradoxes", "Mental Math Grade 5"] }
          ].map((rack) => (
            <div
              key={rack.name}
              className={`p-5 rounded-3xl border shadow-xs space-y-3 flex flex-col justify-between ${rack.color}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{rack.icon}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/80 border border-current shadow-2xs">
                    {rack.count} Books
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm mt-2">{rack.name}</h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Shelved Titles:</span>
                  {rack.books.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-right">
                <span className="text-[10px] font-mono font-bold text-slate-600">Main Campus Stacks</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🌟 1. ISSUE BOOK MODAL */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                  ⚡
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Circulation Desk
                  </span>
                  <h3 className="text-base font-black text-slate-900">Issue Book (Scan / Assign)</h3>
                </div>
              </div>

              <button onClick={() => setIsIssueModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
              
              {/* Accession Number or Barcode Scan Input */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Accession Number / Barcode Scan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <ScanLine className="w-4 h-4 text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Scan barcode or enter ACC-1001, ACC-1002..."
                    value={accessionScanInput}
                    onChange={(e) => setAccessionScanInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    required
                    autoFocus
                  />
                </div>
                {selectedBookForIssue && (
                  <p className="text-[10px] text-indigo-600 font-bold mt-1">
                    Book Title: {selectedBookForIssue.title}
                  </p>
                )}
              </div>

              {/* Select Borrower Student */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Borrower (Student / Teacher)</label>
                <select
                  value={selectedStudentObj?.id || ""}
                  onChange={(e) => {
                    const stu = enrolledStudents.find(s => s.id === e.target.value);
                    setSelectedStudentObj(stu || null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="">-- Choose Borrower ({enrolledStudents.length} Active Readers) --</option>
                  {enrolledStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admission_no} &bull; {s.full_class})
                    </option>
                  ))}
                </select>
              </div>

              {/* Loan Period */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Loan Duration</label>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[7, 14, 21, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setLoanDays(days)}
                      className={`py-2 rounded-xl border font-bold text-[11px] transition ${
                        loanDays === days
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsIssueModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                  ✓ Check Out Book
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 🌟 2. RETURN & CHECK-IN MODAL */}
      {isReturnModalOpen && selectedTxForReturn && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  ✓
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Circulation Check-In
                  </span>
                  <h3 className="text-base font-black text-slate-900">Return Book Copy</h3>
                </div>
              </div>

              <button onClick={() => setIsReturnModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Book Title</span>
                <strong className="text-slate-900 text-sm block">{selectedTxForReturn.book_title}</strong>
                <span className="font-mono text-[10px] text-indigo-700">{selectedTxForReturn.accession_number}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Borrower:</span>
                  <strong className="text-slate-900">{selectedTxForReturn.student_name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Due Date:</span>
                  <span className="text-slate-800 font-mono">{selectedTxForReturn.due_date}</span>
                </div>
              </div>
            </div>

            {/* Overdue Fine Notice if applicable */}
            {new Date() > new Date(selectedTxForReturn.due_date) && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-rose-800 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Late Overdue Detected
                  </span>
                  <strong className="text-rose-700 font-mono text-base font-black">
                    ₹{Math.max(1, Math.ceil((new Date().getTime() - new Date(selectedTxForReturn.due_date).getTime()) / (1000 * 60 * 60 * 24))) * 10}
                  </strong>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-rose-200/60 text-[11px] text-slate-700">
                  <input
                    type="checkbox"
                    checked={waiveFine}
                    onChange={(e) => setWaiveFine(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Waive late overdue fine (Librarian Discretion)</span>
                </label>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsReturnModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" isLoading={isSubmitting} onClick={handleReturnConfirm} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                ✓ Confirm Return &amp; Restock Shelf
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 3. ADD NEW BOOK TITLE MODAL */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  +
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Accession Master Catalog
                  </span>
                  <h3 className="text-base font-black text-slate-900">Add New Book &amp; Generate Accessions</h3>
                </div>
              </div>

              <button onClick={() => setIsAddBookModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="space-y-4 text-xs">
              
              {/* Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Book Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    placeholder="e.g. Discovery of India"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Author <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={newBookAuthor}
                    onChange={(e) => setNewBookAuthor(e.target.value)}
                    placeholder="e.g. Jawaharlal Nehru"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Publisher & ISBN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Publisher</label>
                  <input
                    type="text"
                    value={newBookPublisher}
                    onChange={(e) => setNewBookPublisher(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ISBN Number</label>
                  <input
                    type="text"
                    value={newBookIsbn}
                    onChange={(e) => setNewBookIsbn(e.target.value)}
                    placeholder="e.g. 978-0143031031"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Category, Language & Grade */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newBookCategory}
                    onChange={(e) => setNewBookCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    {CATEGORIES.filter(c => c !== "All").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Language</label>
                  <select
                    value={newBookLanguage}
                    onChange={(e) => setNewBookLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Sanskrit">Sanskrit</option>
                    <option value="Bilingual">Bilingual</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Grade</label>
                  <input
                    type="text"
                    value={newBookGrade}
                    onChange={(e) => setNewBookGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Rack Location, Price & Physical Copies */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rack / Shelf Location</label>
                  <input
                    type="text"
                    value={newBookRack}
                    onChange={(e) => setNewBookRack(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={newBookPrice}
                    onChange={(e) => setNewBookPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Number of Physical Copies</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newBookCopies}
                    onChange={(e) => setNewBookCopies(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Synopsis / Overview</label>
                <textarea
                  rows={2}
                  value={newBookDesc}
                  onChange={(e) => setNewBookDesc(e.target.value)}
                  placeholder="Short summary of book subject matter..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                ⚡ Automatically creates <strong>{newBookCopies} physical accession copies</strong> with sequential barcodes (`ACC-XXXX`).
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAddBookModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                  ✓ Add to Catalog &amp; Accession Stacks
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 🌟 4. PRINT BARCODE LABELS MODAL */}
      {isBarcodePrintOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Print Library Accession Barcode Labels</h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => printIsolatedElement("library-barcode-sheet", "Library_Barcode_Labels", { pageSize: "A4 portrait" })}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print Labels (A4)
                </Button>

                <button onClick={() => setIsBarcodePrintOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Barcode Sheet Container */}
            <div id="library-barcode-sheet" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
              <div className="border-b border-slate-900 pb-2 text-center">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-950">
                  {selectedInstitutionObj?.name || "CRAYON BOX HIGH SCHOOL"} &bull; CENTRAL LIBRARY ACCESSION LABELS
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {accessions.slice(0, 18).map((acc) => (
                  <div key={acc.id} className="p-3 border-2 border-slate-900 rounded-xl text-center space-y-1 bg-white">
                    <span className="text-[9px] font-black uppercase text-slate-700 block truncate">
                      CRAYON BOX LIBRARY
                    </span>
                    <strong className="text-xs font-black text-slate-900 font-mono block">
                      {acc.accession_number}
                    </strong>
                    <div className="w-24 h-6 mx-auto bg-slate-950 text-white font-mono text-[9px] flex items-center justify-center rounded tracking-widest">
                      ||| | || ||| |
                    </div>
                    <span className="text-[9px] text-slate-600 block truncate">
                      {acc.book_title}
                    </span>
                    <span className="text-[8px] font-mono text-slate-400 block">
                      {acc.rack_location || "Stack 1"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function BarcodeIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 5v14" />
      <path d="M8 5v14" />
      <path d="M12 5v14" />
      <path d="M17 5v14" />
      <path d="M21 5v14" />
    </svg>
  );
}
