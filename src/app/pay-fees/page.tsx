"use client";

import { useState } from "react";
import { submitFeePayment } from "@/app/actions/forms";
import { CheckCircle2, CreditCard, Lock } from "lucide-react";
import Link from "next/link";

export default function PayFeesPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await submitFeePayment(formData);
    if (res.success) {
      setSuccessId(res.transactionId);
    }
    setIsSubmitting(false);
  }

  if (successId) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 pt-32">
        <div className="bg-white p-12 rounded-[2rem] shadow-xl max-w-lg w-full text-center border border-stone-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">Payment Successful!</h1>
          <p className="text-stone-600 mb-8 leading-relaxed">
            Your fee payment has been securely processed. A receipt has been sent to your registered email address.
          </p>
          <div className="bg-stone-50 p-4 rounded-xl mb-8 border border-stone-200">
            <p className="text-sm text-stone-500 uppercase tracking-widest font-bold mb-1">Transaction ID</p>
            <p className="text-xl font-mono font-bold text-primary">{successId}</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-blue-900 transition-colors">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">Pay Tuition Fees</h1>
          <p className="text-stone-600 text-lg flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Secure Online Payment Portal
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-stone-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Student ID</label>
                <input required type="text" name="studentId" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700 font-mono" placeholder="e.g. STU-8821" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Parent / Guardian Name</label>
                <input required type="text" name="parentName" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700" placeholder="e.g. John Doe" />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
                  <input required type="number" name="amount" min="1" step="0.01" className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700 font-bold" placeholder="0.00" />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                {isSubmitting ? "Processing Securely..." : "Proceed to Payment"}
              </button>
              <p className="text-xs text-stone-400 text-center mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Payments are processed via standard 256-bit encryption.
              </p>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
