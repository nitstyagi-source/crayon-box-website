"use client";

import { useState } from "react";
import { Search, CreditCard, Lock, CheckCircle2, AlertCircle, FileText, Download, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { lookupStudentDues, processInvoiceOnlinePayment } from "@/app/actions/payments";
import { printIsolatedElement } from "@/lib/printUtils";

export default function PayFeesPage() {
  const [studentId, setStudentId] = useState("");
  const [dob, setDob] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Data State
  const [accountData, setAccountData] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return;
    
    setIsLookingUp(true);
    setErrorMsg("");
    setReceipt(null);

    const res = await lookupStudentDues(studentId, dob || undefined);
    setIsLookingUp(false);

    if (res.success && res.data) {
      setAccountData(res.data);
    } else {
      setErrorMsg(res.error || "Student record not found. Please verify your Admission No.");
      setAccountData(null);
    }
  }

  async function handlePayment() {
    if (!accountData?.invoice) return;
    
    setIsPaying(true);
    setErrorMsg("");

    const res = await processInvoiceOnlinePayment(accountData.invoice.id, 'Razorpay (Online Gateway)');
    setIsPaying(false);

    if (res.success) {
      setReceipt({
        ...res,
        studentName: accountData.student.name,
        admissionNo: accountData.student.admissionNo,
        className: accountData.student.className,
        billingPeriod: accountData.invoice.billing_period,
        items: accountData.items || []
      });
      setAccountData(null);
    } else {
      setErrorMsg("Payment processing failed: " + res.error);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-24 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-3">Quick Fee Payment</h1>
          <p className="text-stone-600 text-base max-w-2xl mx-auto">
            Fast, encrypted fee payments for enrolled students. Lookup your outstanding dues instantly using your Admission Number.
          </p>
        </div>

        {/* Step 1: Lookup Box */}
        {!accountData && !receipt && (
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-stone-100 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Lock className="w-48 h-48" />
            </div>
            
            <h2 className="text-2xl font-bold text-stone-900 mb-6 relative z-10">Find Your Student Account</h2>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            
            <form onSubmit={handleLookup} className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Admission No. / Student ID *</label>
                <input 
                  required
                  type="text" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. ADM-5525" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-stone-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Student Date of Birth (Optional)</label>
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-stone-700"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLookingUp}
                className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
              >
                {isLookingUp ? "Checking Database Records..." : "Search Dues & Invoice"} <Search className="w-5 h-5" />
              </button>
            </form>
            
            <div className="mt-8 flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Your Admission No. is printed on the Student ID card, fee receipts, or available from the school office.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Dues Display & Payment Gateway */}
        {accountData && !receipt && (
          <div className="space-y-6">
            <button 
              onClick={() => setAccountData(null)}
              className="text-stone-500 hover:text-stone-900 text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Search
            </button>

            {accountData.hasPendingDues ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
                {/* Invoice Details */}
                <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-stone-100">
                  <div className="flex justify-between items-start mb-6 pb-6 border-b border-stone-100">
                    <div>
                      <h2 className="text-2xl font-bold text-stone-900">Fee Invoice</h2>
                      <p className="text-stone-500 text-sm">Invoice #{accountData.invoice?.invoice_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Billing Period</p>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold font-mono">
                        {accountData.invoice?.billing_period || "Current Term"}
                      </span>
                    </div>
                  </div>

                  {/* Student Header Card */}
                  <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {accountData.student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-stone-900">{accountData.student.name}</h3>
                      <p className="text-stone-500 text-xs font-medium">Adm No: <span className="font-mono text-stone-800">{accountData.student.admissionNo}</span> • Class: {accountData.student.className}</p>
                    </div>
                  </div>

                  {/* Line Items Breakdown */}
                  <div className="space-y-3 mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Itemized Fee Heads</p>
                    {accountData.items && accountData.items.length > 0 ? (
                      accountData.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-stone-100">
                          <div>
                            <span className="font-semibold text-stone-800">{item.fee_heads?.name || "Fee Head"}</span>
                            {item.discount_amount > 0 && (
                              <span className="ml-2 text-xs text-green-600 font-medium">(-₹{item.discount_amount} Disc.)</span>
                            )}
                          </div>
                          <span className="font-bold text-stone-900">₹{Number(item.base_amount || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-center text-sm py-2">
                        <span className="text-stone-700">Total Academic & Tuition Dues</span>
                        <span className="font-bold text-stone-900">₹{Number(accountData.invoice?.total_amount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  {/* Invoice Summary */}
                  <div className="border-t-2 border-dashed border-stone-200 pt-6 flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Net Payable Balance</p>
                      <p className="text-xs text-stone-500">Status: <span className="font-bold text-amber-600">{accountData.invoice?.status}</span></p>
                    </div>
                    <p className="text-3xl font-black text-stone-900">₹{Number(accountData.invoice?.total_amount || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Payment Gateway Box */}
                <div className="lg:col-span-5 bg-stone-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-400" /> Secure Payment Gateway
                    </h3>
                    
                    <div className="bg-white/10 rounded-2xl p-5 mb-6 border border-white/20">
                      <div className="flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full border-[6px] border-amber-400 bg-transparent shrink-0"></div>
                        <div>
                          <p className="font-bold text-white text-sm">Razorpay Smart Gateway</p>
                          <p className="text-xs text-stone-400">Instant UPI (GPay, PhonePe), Cards & NetBanking</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-stone-400 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="flex justify-between">
                        <span>Invoice Amount:</span>
                        <span className="text-white font-bold">₹{Number(accountData.invoice?.total_amount || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gateway Processing Fee:</span>
                        <span className="text-green-400 font-bold">₹0.00 (Waived)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {errorMsg && (
                      <p className="text-xs text-red-400 mb-3 text-center">{errorMsg}</p>
                    )}
                    <button 
                      onClick={handlePayment}
                      disabled={isPaying}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-base"
                    >
                      {isPaying ? "Connecting Gateway..." : `Pay ₹${Number(accountData.invoice?.total_amount || 0).toLocaleString('en-IN')} Now`}
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-stone-400 text-xs">
                      <Lock className="w-3 h-3" /> PCI-DSS & 256-bit SSL Encrypted
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* No Pending Dues Screen */
              <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-stone-100 text-center max-w-xl mx-auto">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">No Outstanding Dues!</h2>
                <p className="text-stone-600 text-sm mb-6">
                  All fee invoices for <strong>{accountData.student.name}</strong> ({accountData.student.admissionNo}) are fully cleared.
                </p>
                <button 
                  onClick={() => setAccountData(null)}
                  className="bg-stone-900 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-stone-800 transition-colors"
                >
                  Lookup Another Student
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Payment Success & Printable A5 Receipt */}
        {receipt && (
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-stone-100 max-w-2xl mx-auto animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 text-center mb-1">Fee Payment Successful!</h2>
            <p className="text-stone-500 text-xs font-mono text-center mb-6">Receipt No: {receipt.receiptNumber}</p>
            
            {/* A5 Printable Receipt Body */}
            <div id="printable-receipt" className="bg-white rounded-2xl p-6 border border-stone-200 mb-8 space-y-3.5 text-xs max-w-[148mm] mx-auto">
              <style jsx global>{`
                @media print {
                  @page {
                    size: A5 portrait;
                    margin: 6mm;
                  }
                  body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                  }
                }
              `}</style>

              <div className="text-center border-b border-stone-200 pb-3 space-y-0.5">
                <h3 className="text-base font-black text-stone-900 tracking-tight uppercase">CRAYON BOX SCHOOL</h3>
                <p className="text-[10px] font-bold text-stone-700">
                  School ID: 1253481 • UDISE Code: 07124100151
                </p>
                <p className="text-[9.5px] text-stone-500">
                  Burari, Sant Nagar, Delhi - 110084 • Phone: 9811102008 • Email: crayonboxdelhi@gmail.com
                </p>
                <div className="pt-1.5 flex justify-center">
                  <span className="bg-stone-900 text-white font-black text-[10px] uppercase tracking-widest px-3 py-0.5 rounded">
                    FEE RECEIPT
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10.5px] bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                <div>
                  <span className="text-stone-400">Student Name:</span> <strong className="text-stone-900">{receipt.studentName}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Admission No:</span> <strong className="text-stone-900 font-mono">{receipt.admissionNo}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Class & Section:</span> <strong className="text-stone-900">{receipt.className}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Invoice Ref:</span> <strong className="text-stone-900 font-mono">{receipt.invoiceNumber}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Payment Gateway:</span> <strong className="text-stone-900">Razorpay Online</strong>
                </div>
                <div>
                  <span className="text-stone-400">Transaction Ref:</span> <strong className="text-stone-900 font-mono text-[9.5px]">{receipt.transactionId}</strong>
                </div>
              </div>

              <div className="border-t border-b border-stone-200 py-2.5 flex justify-between items-center text-sm font-black text-stone-900">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-700 text-base font-mono">₹{Number(receipt.amountPaid).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-end pt-1 text-[9.5px] text-stone-400">
                <p className="italic">This is a valid system-generated online fee payment receipt.</p>
                <p>Status: <strong className="text-emerald-600">Verified Paid</strong></p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => printIsolatedElement("printable-receipt", `Fee-Receipt-${receipt.receiptNumber}`)}
                className="flex items-center justify-center gap-2 bg-stone-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-stone-800 transition-colors text-sm shadow-md"
              >
                <Printer className="w-4 h-4" /> Print A5 Receipt
              </button>
              <button 
                onClick={() => { setReceipt(null); setAccountData(null); setStudentId(""); }}
                className="flex items-center justify-center gap-2 bg-stone-100 text-stone-700 px-8 py-3.5 rounded-xl font-bold hover:bg-stone-200 transition-colors text-sm"
              >
                Make Another Payment
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
