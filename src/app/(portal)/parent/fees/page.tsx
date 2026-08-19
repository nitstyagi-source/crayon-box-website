"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2, Download, Receipt } from "lucide-react";
import Script from "next/script";
import { createRazorpayOrder } from "@/app/actions/razorpay";

export default function ParentFeePortal() {
  const [isProcessing, setIsProcessing] = useState(false);

  const currentInvoice = {
    id: "uuid-mock-1234",
    invoiceNumber: "INV-2026-Q3-1045",
    dueDate: "2026-09-15",
    totalPayable: 18500,
    items: [
      { description: "Tuition Fee (Q3)", amount: 15000 },
      { description: "Transport Zone B", amount: 3000 },
      { description: "Lab Fee (Science)", amount: 500 }
    ]
  };

  const pastTransactions = [
    { period: "Q2 2026", date: "2026-06-10", amount: 18500, status: "Success", ref: "pay_xyz123" },
  ];

  async function handlePayNow() {
    setIsProcessing(true);
    
    // 1. Create order on the server
    const res = await createRazorpayOrder(currentInvoice.id, currentInvoice.totalPayable);
    
    if (!res.success) {
      alert("Failed to initialize payment: " + res.error);
      setIsProcessing(false);
      return;
    }

    // 2. Setup Razorpay Checkout options
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock", // Public Key
      amount: res.amount,
      currency: "INR",
      name: "Crayon Box School",
      description: `Payment for ${currentInvoice.invoiceNumber}`,
      image: "https://your-school-logo.com/logo.png", // Optional
      order_id: res.orderId,
      handler: function (response: any) {
        // This runs after successful payment
        alert(`Payment Successful! Ref: ${response.razorpay_payment_id}. We are processing your receipt.`);
        // Note: The actual DB update happens securely via the Webhook!
        setIsProcessing(false);
      },
      prefill: {
        name: "Parent Name",
        email: "parent@crayonboxdelhi.com",
        contact: "9999999999"
      },
      theme: {
        color: "#2563EB" // Matches the primary blue theme
      }
    };

    // 3. Open Checkout window
    const razorpayWindow = new (window as any).Razorpay(options);
    razorpayWindow.on('payment.failed', function (response: any){
      alert("Payment Failed. Reason: " + response.error.description);
      setIsProcessing(false);
    });
    razorpayWindow.open();
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto bg-stone-50 min-h-screen">
      {/* Required script for Razorpay popup */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Fee Portal</h1>
        <p className="text-stone-500 mt-1">Manage and pay your school fees securely.</p>
      </div>

      {/* CTA Card */}
      <div className="bg-gradient-to-br from-primary to-blue-900 rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 text-center md:text-left">
          <p className="text-blue-100 font-bold uppercase tracking-widest text-sm mb-2">Total Outstanding Dues</p>
          <h2 className="text-5xl md:text-6xl font-black mb-2">₹{currentInvoice.totalPayable.toLocaleString()}</h2>
          <p className="text-blue-200 text-sm">Due Date: <span className="font-bold text-white">{currentInvoice.dueDate}</span></p>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <button 
            onClick={handlePayNow} 
            disabled={isProcessing}
            className="w-full md:w-auto bg-accent text-white hover:bg-orange-600 font-black text-lg py-4 px-10 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : <>Pay Now <CreditCard className="w-5 h-5" /></>}
          </button>
        </div>
      </div>
      
      {/* Invoice Breakdown ... (omitted for brevity) */}
    </div>
  );
}
