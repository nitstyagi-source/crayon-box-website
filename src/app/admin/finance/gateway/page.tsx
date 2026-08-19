"use client";

import { CreditCard, Activity } from "lucide-react";

export default function GatewayModule() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <CreditCard className="w-7 h-7 text-stone-400" />
             Payment Gateway
          </h1>
          <p className="text-stone-500 mt-1">Configure Razorpay/Stripe webhooks and view API logs.</p>
        </div>
        <div>
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <Activity className="w-4 h-4" /> Action
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-6">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">OK</div>
                <div><h3 className="font-bold text-stone-900">Razorpay Connected</h3><p className="text-sm text-green-600 font-bold">Webhook Active</p></div>
             </div>
             <button className="bg-stone-100 text-stone-700 font-bold px-4 py-2 rounded-xl text-sm">Regenerate Webhook Secret</button>
          </div>
        
      
    </div>
  );
}
