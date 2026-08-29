"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Download, Receipt, Lock, AlertCircle, Printer, ArrowRight } from "lucide-react";
import { lookupStudentDues, processInvoiceOnlinePayment } from "@/app/actions/payments";
import { printIsolatedElement } from "@/lib/printUtils";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { useSiblingContext } from "@/components/providers/SiblingProvider";
import Script from "next/script";
import { useRef } from "react";

export default function ParentFeePortal() {
  const { activeSibling } = useSiblingContext();
  const { selectedInstitutionObj } = useInstitution();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [feeData, setFeeData] = useState<any>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const receiptPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDues();
  }, [activeSibling]);

  async function loadDues() {
    setIsLoading(true);
    // Use student id or default mock sibling admission
    const admNo = activeSibling?.id || "ADM-5525";
    const res = await lookupStudentDues(admNo);
    if (res.success && res.data) {
      setFeeData(res.data);
    }
    setIsLoading(false);
  }

  async function handlePayNow() {
    if (!feeData?.invoice) return;
    setIsProcessing(true);

    const res = await processInvoiceOnlinePayment(feeData.invoice.id, 'Razorpay Parent Portal');
    setIsProcessing(false);

    if (res.success) {
      setReceipt({
        ...res,
        studentName: feeData.student.name,
        admissionNo: feeData.student.admissionNo,
        className: feeData.student.className,
        billingPeriod: feeData.invoice.billing_period,
      });
      loadDues();
    } else {
      alert("Payment processing error: " + res.error);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto bg-stone-50 min-h-screen font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900">Fee & Ledger Portal</h1>
          <p className="text-stone-500 mt-1">Review itemized invoices, discounts, and clear term dues online.</p>
        </div>
        {activeSibling && (
          <div className="px-4 py-2 bg-white rounded-xl border border-stone-200 text-xs font-bold text-stone-700">
            Student: <span className="text-blue-600 font-bold">{activeSibling.firstName}</span> ({activeSibling.grade})
          </div>
        )}
      </div>

      {/* Payment Success Receipt Screen */}
      {receipt ? (
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-stone-100 max-w-xl mx-auto text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-stone-900">Fee Payment Successful!</h2>
          <p className="text-xs text-stone-500 font-mono mt-1 mb-6">Receipt #{receipt.receiptNumber}</p>

          {/* A5 Printable Receipt Body */}
          <div ref={receiptPrintRef} className="bg-white rounded-2xl p-6 border border-stone-200 text-left text-xs space-y-3 mb-6 max-w-[148mm] mx-auto">
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
              <h3 className="text-base font-black text-stone-900 tracking-tight uppercase">
                {selectedInstitutionObj?.name || "CRAYON BOX SCHOOL"}
              </h3>
              <p className="text-[10px] font-bold text-stone-700">
                {selectedInstitutionObj?.affiliation_number ? `Affiliation No: ${selectedInstitutionObj.affiliation_number}` : "School ID: 1253481 • UDISE Code: 07124100151"}
              </p>
              <p className="text-[9.5px] text-stone-500">
                {selectedInstitutionObj?.address || "Burari, Sant Nagar, Delhi - 110084"} • Tel: {selectedInstitutionObj?.phone || "9811102008"} • Email: {selectedInstitutionObj?.email || "crayonboxdelhi@gmail.com"}
              </p>
              <div className="pt-1.5 flex justify-center">
                <span className="bg-stone-900 text-white font-black text-[10px] uppercase tracking-widest px-3 py-0.5 rounded">
                  FEE RECEIPT
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-stone-50/70 p-3 rounded-xl border border-stone-100">
              <div>
                <span className="text-stone-400">Student:</span> <strong className="text-stone-900">{receipt.studentName}</strong>
              </div>
              <div>
                <span className="text-stone-400">Admission No:</span> <strong className="text-stone-900 font-mono">{receipt.admissionNo}</strong>
              </div>
              <div>
                <span className="text-stone-400">Billing Term:</span> <strong className="text-stone-900">{receipt.billingPeriod}</strong>
              </div>
              <div>
                <span className="text-stone-400">Payment Mode:</span> <strong className="text-stone-900">Razorpay Online</strong>
              </div>
            </div>

            <div className="border-t border-b border-stone-200 py-2.5 flex justify-between items-center text-sm font-black text-stone-900">
              <span>Amount Paid:</span>
              <span className="font-black text-emerald-700 text-base font-mono">₹{Number(receipt.amountPaid).toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-end pt-1 text-[9.5px] text-stone-400">
              <p className="italic">Valid system-generated online payment receipt.</p>
              <p>Status: <strong className="text-emerald-600">Settled & Paid</strong></p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => {
                if (receiptPrintRef.current) {
                  printIsolatedElement(receiptPrintRef.current, `Fee-Receipt-${receipt.receiptNumber}`);
                } else {
                  window.print();
                }
              }}
              className="bg-stone-900 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-stone-800 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print A5 Receipt
            </button>
            <button 
              onClick={() => setReceipt(null)}
              className="bg-stone-100 text-stone-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-stone-200"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active Outstanding Due Banner */}
          {feeData?.hasPendingDues ? (
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              <div className="relative z-10 text-center md:text-left">
                <p className="text-blue-200 font-bold uppercase tracking-widest text-xs mb-1">
                  Active Invoice: {feeData.invoice?.invoice_number}
                </p>
                <h2 className="text-4xl md:text-5xl font-black mb-1">
                  ₹{Number(feeData.invoice?.total_amount || 0).toLocaleString('en-IN')}
                </h2>
                <p className="text-blue-300 text-xs">
                  Billing Term: <span className="font-bold text-white">{feeData.invoice?.billing_period || "Current Quarter"}</span>
                </p>
              </div>
              <div className="relative z-10 w-full md:w-auto">
                <button 
                  onClick={handlePayNow} 
                  disabled={isProcessing}
                  className="w-full md:w-auto bg-amber-400 text-stone-950 hover:bg-amber-300 font-black text-base py-3.5 px-8 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : <>Pay Online (Razorpay) <CreditCard className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">All Student Fees Cleared!</h3>
                <p className="text-stone-500 text-xs mt-0.5">There are no outstanding dues for the current academic session.</p>
              </div>
            </div>
          )}

          {/* Itemized Fee Heads */}
          {feeData?.items && feeData.items.length > 0 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm">
              <h3 className="text-lg font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">Fee Component Breakdown</h3>
              <div className="space-y-3">
                {feeData.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-stone-50">
                    <span className="font-medium text-stone-700">{item.fee_heads?.name || "Fee Head"}</span>
                    <span className="font-bold text-stone-900">₹{Number(item.base_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
