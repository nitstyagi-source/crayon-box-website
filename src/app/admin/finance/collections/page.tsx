"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, Wallet, CreditCard, Banknote, Landmark, 
  Smartphone, User, CheckCircle2, AlertCircle, Printer, 
  Share2, ArrowRight, RefreshCw, X, Receipt, ShieldCheck, QrCode
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { searchStudentsForFeeCollection, collectFeePayment, getStudentFeeLedger } from "@/app/actions/finance-core";

export default function CollectFeePOSPage() {
  const { activeCampusId } = useCampusContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentLedgerData, setStudentLedgerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment Form Fields
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [transactionRef, setTransactionRef] = useState("");
  const [bankName, setBankName] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [lateFee, setLateFee] = useState<number>(0);
  const [concession, setConcession] = useState<number>(0);
  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);

  const receiptPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handleSearch();
  }, [activeCampusId]);

  async function handleSearch() {
    setIsLoading(true);
    try {
      const res = await searchStudentsForFeeCollection(activeCampusId, searchQuery);
      if (res.success) {
        setStudents(res.data || []);
        if (!selectedStudent && res.data && res.data.length > 0) {
          selectStudent(res.data[0]);
        }
      }
    } catch (e) {
      console.error("Error searching students:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function selectStudent(st: any) {
    setSelectedStudent(st);
    setGeneratedReceipt(null);
    setAmountToPay(st.outstandingBalance || 0);
    setConcession(st.concessionPct > 0 ? 500 : 0);
    setLateFee(0);
    
    // Load student detailed ledger
    const ledRes = await getStudentFeeLedger(st.id);
    if (ledRes.success) {
      setStudentLedgerData(ledRes);
    }
  }

  async function handleCollectPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    if (amountToPay <= 0) {
      alert("Payment amount must be greater than zero.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await collectFeePayment({
        campus_id: activeCampusId,
        student_id: selectedStudent.id,
        admission_no: selectedStudent.admissionNo,
        student_name: selectedStudent.name,
        class_name: selectedStudent.className,
        section_name: selectedStudent.sectionName,
        parent_name: selectedStudent.parentName,
        parent_mobile: selectedStudent.parentMobile,
        total_amount_due: selectedStudent.outstandingBalance,
        concession_amount: concession,
        late_fee_amount: lateFee,
        net_amount_paid: Number(amountToPay),
        payment_mode: paymentMode,
        transaction_ref: transactionRef || `TXN-${Date.now()}`,
        bank_name: bankName,
        cheque_no: chequeNo,
        collected_by: 'Rushali (Accounts POS)'
      });

      if (res.success) {
        setGeneratedReceipt(res.receipt);
        // Refresh student ledger
        selectStudent(selectedStudent);
        handleSearch();
      } else {
        alert("Payment collection failed: " + res.error);
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
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Reception POS Counter
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Fast-Track Payment & Instant Receipt</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Fee Collection Counter</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Search student by admission number, name, or phone to collect full or partial fee payments.
          </p>
        </div>

        {/* Quick Search */}
        <div className="w-full md:w-96">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Admission #, Name, Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Student Selector List (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-black text-stone-900">Enrolled Students ({students.length})</h3>
            <span className="text-[10px] text-stone-400 font-bold">Select student</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-stone-400">Loading student directory...</div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">No matching students found.</div>
            ) : (
              students.map((st) => (
                <div
                  key={st.id}
                  onClick={() => selectStudent(st)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    selectedStudent?.id === st.id
                      ? "bg-blue-50/70 border-blue-500 shadow-xs"
                      : "bg-white border-stone-100 hover:border-stone-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-900">{st.name}</span>
                      <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 rounded">{st.admissionNo}</span>
                      {st.isEws && (
                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">EWS / RTE</span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {st.className} • Section {st.sectionName} • {st.parentName}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-black ${st.isEws ? 'text-emerald-700 font-bold' : (st.outstandingBalance > 0 ? 'text-amber-600' : 'text-emerald-600')}`}>
                      {st.isEws ? '₹0 (Free)' : formatCurrency(st.outstandingBalance)}
                    </div>
                    <span className="text-[9px] font-semibold text-stone-400 uppercase">
                      {st.isEws ? 'RTE Seat' : (st.outstandingBalance > 0 ? 'Due' : 'Cleared')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: POS Payment Processing & Instant Receipt (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {selectedStudent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Student Summary & Ledger Breakdown Card */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                        Family ID: {selectedStudent.familyId}
                      </span>
                      {selectedStudent.isEws && (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                          EWS / RTE 100% Free
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-stone-900 mt-1">{selectedStudent.name}</h3>
                    <p className="text-xs text-stone-500">
                      Admission #{selectedStudent.admissionNo} • {selectedStudent.className} Section {selectedStudent.sectionName}
                    </p>
                  </div>
                  <div className="p-3 bg-stone-100 rounded-2xl text-stone-600">
                    <User className="w-5 h-5" />
                  </div>
                </div>

                {/* Dues Breakdown */}
                {selectedStudent.isEws ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-900 space-y-2 text-xs">
                    <div className="font-black flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      Government-Mandated RTE Quota Seat
                    </div>
                    <p className="text-[11px] opacity-90 leading-relaxed">
                      Under Section 12(1)(c) of the Right to Education Act, this student is entitled to 100% free schooling. No fee demands or invoices are generated.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                    <div className="flex justify-between text-stone-600">
                      <span>Total Session Demand:</span>
                      <span className="font-bold text-stone-900">{formatCurrency(selectedStudent.totalDebit || 11500)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>Total Paid So Far:</span>
                      <span className="font-bold">{formatCurrency(selectedStudent.totalPaid || 0)}</span>
                    </div>
                    {concession > 0 && (
                      <div className="flex justify-between text-purple-600">
                        <span>Concession ({selectedStudent.concessionType}):</span>
                        <span className="font-bold">- {formatCurrency(concession)}</span>
                      </div>
                    )}
                    {lateFee > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Late Fee Fine:</span>
                        <span className="font-bold">+ {formatCurrency(lateFee)}</span>
                      </div>
                    )}
                    <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-black text-stone-900">
                      <span>Outstanding Due Balance:</span>
                      <span className="text-amber-600 font-mono">{formatCurrency(selectedStudent.outstandingBalance)}</span>
                    </div>
                  </div>
                )}

                {/* Double Entry Ledger Summary Preview */}
                {studentLedgerData?.ledger && (
                  <div>
                    <h4 className="text-xs font-bold text-stone-700 mb-2">Live Ledger Entries ({studentLedgerData.ledger.length})</h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-[11px]">
                      {studentLedgerData.ledger.map((l: any, i: number) => (
                        <div key={i} className="flex justify-between p-2 rounded-xl bg-stone-50 border border-stone-100">
                          <div>
                            <span className="font-bold text-stone-800">{l.particulars}</span>
                            <div className="text-[9px] text-stone-400">{l.transaction_date} • Ref: {l.reference_no || 'N/A'}</div>
                          </div>
                          <div className="text-right">
                            {Number(l.debit) > 0 ? (
                              <span className="font-black text-stone-900">Dr {formatCurrency(l.debit)}</span>
                            ) : (
                              <span className="font-black text-emerald-600">Cr {formatCurrency(l.credit)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Collection Form */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-lg font-black text-stone-900">
                    {selectedStudent.isEws ? "Fee Exemption Status" : "Accept Payment"}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {selectedStudent.isEws 
                      ? "Government-Mandated Right to Education Quota." 
                      : "Supports full or partial payment with automated ledger posting."}
                  </p>
                </div>

                {selectedStudent.isEws ? (
                  <div className="py-12 text-center space-y-3 bg-emerald-50/40 rounded-2xl border border-emerald-100 p-6">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-black text-emerald-950">100% Free Education Quota</h4>
                    <p className="text-xs text-emerald-800/80 max-w-xs mx-auto leading-relaxed">
                      This student is enrolled under EWS/RTE quota with zero fee demand, zero invoice generation, and full government concession.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleCollectPayment} className="space-y-4 text-xs">
                    
                    {/* Amount to Pay (Partial Supported) */}
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Amount Collecting (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-400">₹</span>
                        <input
                          type="number"
                          value={amountToPay}
                          onChange={(e) => setAmountToPay(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      {amountToPay < selectedStudent.outstandingBalance && (
                        <p className="text-[10px] text-amber-600 font-semibold mt-1">
                          ⚡ Partial payment: remaining {formatCurrency(selectedStudent.outstandingBalance - amountToPay)} will stay as due in ledger.
                        </p>
                      )}
                    </div>

                    {/* Payment Mode Selector */}
                    <div>
                      <label className="font-bold text-stone-700 block mb-1.5">Payment Mode</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Net Banking', 'Cheque'].map((mode) => (
                          <button
                            type="button"
                            key={mode}
                            onClick={() => setPaymentMode(mode)}
                            className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition text-center ${
                              paymentMode === mode 
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs" 
                                : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reference / Cheque Details */}
                    {paymentMode !== 'Cash' && (
                      <div className="space-y-2">
                        <div>
                          <label className="font-bold text-stone-700 block mb-1">Transaction Ref / UPI UTR #</label>
                          <input
                            type="text"
                            placeholder="e.g. UPI/20260405/88921"
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-semibold"
                          />
                        </div>
                        {paymentMode === 'Cheque' && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-bold text-stone-700 block mb-1">Bank Name</label>
                              <input
                                type="text"
                                placeholder="HDFC Bank"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-stone-700 block mb-1">Cheque Number</label>
                              <input
                                type="text"
                                placeholder="004812"
                                value={chequeNo}
                                onChange={(e) => setChequeNo(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessing || amountToPay <= 0}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isProcessing ? "Recording Payment..." : `Collect ${formatCurrency(amountToPay)} & Generate Receipt`}
                    </button>
                  </form>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white p-16 rounded-3xl border border-stone-200 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-800">No Student Selected</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Search or select a student from the directory on the left to initiate fee collection.
              </p>
            </div>
          )}

          {/* Generated Official Receipt Popup / Modal */}
          {generatedReceipt && (
            <div className="bg-emerald-50/50 border border-emerald-200 p-6 rounded-3xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Payment Successful! Official Receipt Generated
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintReceipt}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Receipt
                  </button>
                  <button
                    onClick={() => setGeneratedReceipt(null)}
                    className="p-2 text-stone-400 hover:text-stone-600 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* High-Fidelity Official Printable Slip */}
              <div ref={receiptPrintRef} className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-4 text-xs font-sans">
                <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                  <div>
                    <h2 className="text-base font-black text-stone-900">CRAYON BOX SCHOOL</h2>
                    <p className="text-[10px] text-stone-500">Main Campus • CB-AFF-2026 • New Delhi</p>
                    <p className="text-[10px] text-stone-400">Tel: +91 98100 81008 • accounts@crayonboxschool.com</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-stone-900 bg-stone-100 px-2 py-1 rounded-md">
                      {generatedReceipt.receipt_no}
                    </span>
                    <p className="text-[10px] text-stone-400 mt-1">Date: {generatedReceipt.receipt_date}</p>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      {generatedReceipt.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400">Student:</span> <strong className="text-stone-800">{generatedReceipt.student_name}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400">Admission No:</span> <strong className="text-stone-800">{generatedReceipt.admission_no}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400">Class & Section:</span> <strong className="text-stone-800">{generatedReceipt.class_name} {generatedReceipt.section_name}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400">Parent Name:</span> <strong className="text-stone-800">{generatedReceipt.parent_name}</strong>
                  </div>
                </div>

                <div className="border-t border-b border-stone-100 py-3 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Payment Mode:</span>
                    <strong className="text-stone-900">{generatedReceipt.payment_mode} ({generatedReceipt.transaction_ref})</strong>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Total Bill Demand:</span>
                    <span>{formatCurrency(generatedReceipt.total_amount_due)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-emerald-700 pt-1 border-t border-dashed border-stone-200">
                    <span>Total Amount Paid:</span>
                    <span>{formatCurrency(generatedReceipt.net_amount_paid)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Remaining Balance:</span>
                    <span className="font-bold text-amber-600">{formatCurrency(generatedReceipt.remaining_balance)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-2 text-[10px] text-stone-400">
                  <div>
                    <p>Cashier: {generatedReceipt.collected_by}</p>
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
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
