"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Users,
  DollarSign,
  Percent,
  Receipt,
  Sparkles,
  RefreshCw,
  Send,
  ShieldCheck
} from "lucide-react";
import {
  getFamilySiblingFeeDuesAction,
  processCombinedFeePaymentAction,
  SiblingStudentFee
} from "@/app/actions/sibling-fee-cart-actions";

export default function MultiChildFeePaymentPage() {
  const [parentPhone, setParentPhone] = useState("+919810081008");
  const [siblings, setSiblings] = useState<SiblingStudentFee[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [txnRef, setTxnRef] = useState<string | null>(null);

  useEffect(() => {
    loadDues();
  }, [parentPhone]);

  async function loadDues() {
    setIsLoading(true);
    try {
      const res = await getFamilySiblingFeeDuesAction(parentPhone);
      if (res.success) {
        setSiblings(res.siblings);
        setSummary(res.summary);
        setSelectedStudentIds(res.siblings.map(s => s.id));
      }
    } finally {
      setIsLoading(false);
    }
  }

  function toggleStudentSelection(id: string) {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }

  const selectedStudents = siblings.filter(s => selectedStudentIds.includes(s.id));
  const totalBaseAmount = selectedStudents.reduce((acc, s) => acc + s.baseFee, 0);
  const totalDiscountAmount = selectedStudents.reduce((acc, s) => acc + s.siblingDiscount, 0);
  const netPayable = totalBaseAmount - totalDiscountAmount;

  // Dynamic UPI payment URL
  const upiUrl = `upi://pay?pa=crayonbox@icici&pn=Crayon%20Box%20School&am=${netPayable}&tn=Combined%20Sibling%20Fees&cu=INR`;

  async function handleCompletePayment() {
    if (selectedStudentIds.length === 0) {
      alert("Please select at least one student to pay fees.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await processCombinedFeePaymentAction({
        selectedStudentIds,
        totalPaidAmount: netPayable,
        paymentMethod: "UPI / Combined Cart"
      });

      if (res.success) {
        setTxnRef(res.transactionId || null);
        setPaymentComplete(true);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Unified Family Cart &amp; Automated 10% Sibling Concession
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-emerald-400" />
            Multi-Child Sibling Fee Payment Portal
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl">
            Pay term fees for all children in your family in a single transaction with automatic sibling discount deduction and instant WhatsApp GST receipts.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 text-xs">
          <div className="text-stone-300 font-bold">Registered Mobile:</div>
          <div className="text-sm font-mono font-black text-emerald-300">{parentPhone}</div>
        </div>
      </div>

      {paymentComplete ? (
        /* Payment Success Confirmation Card */
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-stone-900">Payment Received &amp; Reconciled!</h2>
            <p className="text-xs text-stone-500">
              Total of <strong>₹{netPayable.toLocaleString('en-IN')}</strong> paid successfully.
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 max-w-md mx-auto text-xs space-y-1 text-left font-mono">
            <div className="flex justify-between">
              <span className="text-stone-500">Transaction Ref:</span>
              <span className="font-bold text-stone-900">{txnRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Students Covered:</span>
              <span className="font-bold text-stone-900">{selectedStudents.length} Children</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Channel:</span>
              <span className="font-bold text-emerald-700">UPI Instant Settlement</span>
            </div>
          </div>

          <div className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5 pt-2">
            <Send className="w-4 h-4" /> Official GST Receipts &amp; Confirmation dispatched to WhatsApp ({parentPhone})
          </div>

          <button
            onClick={() => {
              setPaymentComplete(false);
              loadDues();
            }}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold"
          >
            Back to Family Portal
          </button>
        </div>
      ) : (
        /* Multi-Child Sibling Fee Selection Cart */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Children Selector */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Select Children for Combined Term Fee Payment
            </h3>

            <div className="space-y-3">
              {siblings.map((stu, index) => {
                const isSelected = selectedStudentIds.includes(stu.id);

                return (
                  <div
                    key={stu.id}
                    onClick={() => toggleStudentSelection(stu.id)}
                    className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                        : "bg-white/60 border-stone-200 hover:border-emerald-300 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-stone-900 text-sm font-black">{stu.studentName}</strong>
                          {stu.isSecondChild && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Percent className="w-3 h-3" /> 10% Sibling Discount
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500">
                          {stu.className} • Adm: <span className="font-mono font-bold text-stone-700">{stu.admissionNo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:pl-6 border-stone-200">
                      <div className="text-xs text-stone-400 line-through">
                        {stu.siblingDiscount > 0 ? `₹${stu.baseFee}` : ""}
                      </div>
                      <div className="text-lg font-black font-mono text-emerald-700">
                        ₹{stu.finalDueAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-stone-500 font-medium">Term 1 School Fee</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Checkout Summary & 1-Click Pay */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6 self-start">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                Payment Summary
              </h4>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg">
                {selectedStudents.length} Children
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Standard Base Fees:</span>
                <span className="font-bold text-stone-900 font-mono">₹{totalBaseAmount.toLocaleString('en-IN')}</span>
              </div>

              {totalDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Sibling Concession (10%):</span>
                  <span className="font-mono">-₹{totalDiscountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-500">
                <span>UPI Processing Charge:</span>
                <span className="font-bold text-emerald-700">₹0 (Free)</span>
              </div>

              <div className="pt-3 border-t-2 border-stone-900 flex justify-between items-baseline">
                <span className="font-black text-sm text-stone-900">Total Net Payable:</span>
                <span className="text-2xl font-black font-mono text-emerald-700">
                  ₹{netPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleCompletePayment}
                disabled={isProcessing || selectedStudents.length === 0}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/30 transition active:scale-98 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                Pay ₹{netPayable.toLocaleString('en-IN')} via UPI
              </button>

              <div className="text-[10px] text-center text-stone-400 font-medium flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Encrypted Official School Gateway
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
