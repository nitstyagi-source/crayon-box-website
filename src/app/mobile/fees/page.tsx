"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Wallet, ArrowLeft, CheckCircle2, CreditCard, 
  Download, Receipt, ShieldCheck, ChevronRight, 
  Smartphone, Sparkles, Building2
} from "lucide-react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";

export default function MobileFeesPage() {
  const { activeChild } = useMobileAuth();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>(["INV-2026-T2"]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");

  const INVOICES = [
    { id: "INV-2026-T2", title: "Term 2 Tuition & Activity Fee", dueDate: "31 Aug 2026", amount: 12500, status: "Due" },
    { id: "INV-2026-BUS", title: "Quarter 2 Transport Fee (Route 4)", dueDate: "31 Aug 2026", amount: 3500, status: "Optional" },
  ];

  const totalPayable = INVOICES
    .filter(inv => selectedInvoices.includes(inv.id))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const toggleInvoice = (id: string) => {
    setSelectedInvoices(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="space-y-5 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/mobile" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-bold text-base text-slate-900 leading-tight">Mobile Fee Payment</h1>
          <p className="text-[11px] text-slate-500">Student: {activeChild?.firstName || "Aarav"} ({activeChild?.grade || "Grade 5A"})</p>
        </div>
      </div>

      {isSuccess ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-4 shadow-sm animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Transaction Successful
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-900 mt-2">₹{totalPayable.toLocaleString('en-IN')} Paid</h2>
            <p className="text-xs text-slate-500 mt-1">Receipt #CB-RCP-2026-9821</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-1.5 font-medium text-slate-600">
            <div className="flex justify-between"><span>Payment Mode:</span><strong className="text-slate-900">UPI / Razorpay</strong></div>
            <div className="flex justify-between"><span>Bank Reference:</span><strong className="text-slate-900 font-mono">AXIS-99201948</strong></div>
            <div className="flex justify-between"><span>Student:</span><strong className="text-slate-900">{activeChild?.firstName} {activeChild?.lastName}</strong></div>
            <div className="flex justify-between"><span>Status:</span><strong className="text-emerald-600">Updated to Ledger ✓</strong></div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button 
              onClick={() => window.print()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" /> Download Official PDF Receipt
            </button>

            <button 
              onClick={() => setIsSuccess(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 py-1"
            >
              Back to Fee Portal
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Outstanding Summary */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-5 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Selected for Payment</span>
              <span className="text-xs font-bold text-amber-300 font-mono">{selectedInvoices.length} Invoices</span>
            </div>
            <div className="text-2xl font-bold font-serif text-white">
              ₹{totalPayable.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400">
              Instantly updates the school financial ledger and unlocks term clearance.
            </p>
          </div>

          {/* Invoices List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Select Invoices to Pay
            </h3>

            {INVOICES.map(inv => {
              const isChecked = selectedInvoices.includes(inv.id);
              return (
                <div
                  key={inv.id}
                  onClick={() => toggleInvoice(inv.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked 
                      ? "bg-white border-amber-400 ring-2 ring-amber-400/20 shadow-sm" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      isChecked ? "bg-amber-500 border-amber-500 text-slate-950 font-bold text-xs" : "border-slate-300 bg-white"
                    }`}>
                      {isChecked && "✓"}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{inv.title}</h4>
                      <p className="text-[10px] text-slate-400">Due: {inv.dueDate}</p>
                    </div>
                  </div>

                  <span className="font-bold text-sm text-slate-900">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Payment Methods */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Payment Gateway
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod("upi")}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === "upi" ? "bg-amber-50 border-amber-400 text-amber-950 font-bold" : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <span className="text-xs block">UPI / GPay</span>
              </button>

              <button
                onClick={() => setPaymentMethod("card")}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === "card" ? "bg-amber-50 border-amber-400 text-amber-950 font-bold" : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs block">Cards</span>
              </button>

              <button
                onClick={() => setPaymentMethod("netbanking")}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === "netbanking" ? "bg-amber-50 border-amber-400 text-amber-950 font-bold" : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <Building2 className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                <span className="text-xs block">NetBanking</span>
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            onClick={handlePay}
            disabled={totalPayable === 0 || isProcessing}
            className="w-full bg-slate-900 hover:bg-slate-800 active:scale-98 disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Pay ₹{totalPayable.toLocaleString('en-IN')} Securely</span>
              </>
            )}
          </button>
        </>
      )}

    </div>
  );
}
