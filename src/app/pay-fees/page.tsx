"use client";

import { useState } from "react";
import { Search, CreditCard, Lock, CheckCircle2, AlertCircle, FileText, Download } from "lucide-react";
import Link from "next/link";

export default function PayFeesPage() {
  const [studentId, setStudentId] = useState("");
  const [dob, setDob] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [dues, setDues] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId || !dob) return;
    
    setIsLookingUp(true);
    // Mock lookup logic
    setTimeout(() => {
      setDues({
        studentName: "Aarav Sharma",
        grade: "Grade 3",
        quarter: "Q2 (Jul - Sep 2026)",
        tuitionFee: 22000,
        transportFee: 4500,
        activityFee: 1500,
        lateFee: 0,
        totalDue: 28000,
        dueDate: "2026-07-15"
      });
      setIsLookingUp(false);
    }, 1200);
  }

  function handlePayment() {
    setIsLookingUp(true);
    setTimeout(() => {
      setIsPaid(true);
      setIsLookingUp(false);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">Quick Fee Payment</h1>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">Fast, secure, and hassle-free fee payments for enrolled students. Fetch your current dues instantly using your Student ID.</p>
        </div>

        {!dues && !isPaid && (
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-stone-100 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Lock className="w-48 h-48" />
            </div>
            
            <h2 className="text-2xl font-bold text-stone-900 mb-8 relative z-10">Find Your Account</h2>
            
            <form onSubmit={handleLookup} className="space-y-6 relative z-10">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Student ID / Admission No.</label>
                <input 
                  required
                  type="text" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. CB-2024-001" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Student Date of Birth</label>
                <input 
                  required
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-stone-500"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLookingUp}
                className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
              >
                {isLookingUp ? "Securely Fetching Data..." : "Fetch Dues"} <Search className="w-5 h-5" />
              </button>
            </form>
            
            <div className="mt-8 flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Your Student ID can be found on the ID card, previous fee receipts, or the parent mobile app. For assistance, contact the accounts office.
              </p>
            </div>
          </div>
        )}

        {dues && !isPaid && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Invoice Details */}
            <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-stone-100">
              <div className="flex justify-between items-start mb-8 pb-6 border-b border-stone-100">
                <div>
                  <h2 className="text-2xl font-bold text-stone-900 mb-1">Fee Invoice</h2>
                  <p className="text-stone-500">Invoice generated for {dues.quarter}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Student ID</p>
                  <p className="font-mono font-bold text-stone-800">{studentId.toUpperCase()}</p>
                </div>
              </div>

              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                  {dues.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-stone-900">{dues.studentName}</h3>
                  <p className="text-stone-500 text-sm">{dues.grade}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-stone-700">
                  <span>Tuition Fee</span>
                  <span className="font-medium">₹{dues.tuitionFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span>Transport Fee</span>
                  <span className="font-medium">₹{dues.transportFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span>Activity Fee</span>
                  <span className="font-medium">₹{dues.activityFee.toLocaleString('en-IN')}</span>
                </div>
                {dues.lateFee > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span>Late Fee Fine</span>
                    <span className="font-medium">₹{dues.lateFee.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-dashed border-stone-200 pt-6 flex justify-between items-end">
                <div>
                  <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-1">Total Due</p>
                  <p className="text-xs text-stone-400">Due by {dues.dueDate}</p>
                </div>
                <p className="text-3xl font-black text-stone-900">₹{dues.totalDue.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Payment Gateway Mockup */}
            <div className="lg:col-span-5 bg-stone-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-white flex flex-col">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-accent" /> Secure Checkout</h3>
              
              <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                  <div className="w-5 h-5 rounded-full border-[6px] border-accent bg-transparent"></div>
                  <div>
                    <p className="font-bold text-white">Pay via Razorpay</p>
                    <p className="text-xs text-stone-400">UPI, Cards, NetBanking</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 opacity-50">
                  <div className="w-5 h-5 rounded-full border-2 border-stone-500 bg-transparent"></div>
                  <div>
                    <p className="font-bold text-white">Pay via Stripe</p>
                    <p className="text-xs text-stone-400">International Cards Only</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={handlePayment}
                  disabled={isLookingUp}
                  className="w-full bg-accent text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-lg"
                >
                  {isLookingUp ? "Processing..." : `Pay ₹${dues.totalDue.toLocaleString('en-IN')} Now`}
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 text-stone-400 text-xs">
                  <Lock className="w-3 h-3" /> 256-bit SSL Encrypted
                </div>
              </div>
            </div>
          </div>
        )}

        {isPaid && (
          <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-stone-100 max-w-2xl mx-auto text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Payment Successful!</h2>
            <p className="text-stone-500 mb-8">Transaction ID: TXN-{Math.floor(Math.random() * 1000000000)}</p>
            
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 mb-8 text-left space-y-4">
              <div className="flex justify-between border-b border-stone-200 pb-4">
                <span className="text-stone-500">Amount Paid</span>
                <span className="font-bold text-stone-900">₹{dues.totalDue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-4">
                <span className="text-stone-500">Student</span>
                <span className="font-bold text-stone-900">{dues.studentName} ({studentId.toUpperCase()})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Quarter</span>
                <span className="font-bold text-stone-900">{dues.quarter}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="flex items-center justify-center gap-2 bg-stone-100 text-stone-800 px-8 py-4 rounded-full font-bold hover:bg-stone-200 transition-colors">
                <Download className="w-5 h-5" /> Download Receipt
              </button>
              <Link href="/" className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-blue-900 transition-colors">
                Return to Home
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
