"use client";

import { useState } from "react";
import { 
  TrendingUp, TrendingDown, Clock, AlertTriangle, 
  Percent, ShieldAlert, CheckCircle2, RotateCcw,
  Wallet, CreditCard, Banknote, Landmark, Smartphone,
  Users, UserX, UserCheck
} from "lucide-react";

export default function AdminFinanceDashboard() {
  const [dateRange, setDateRange] = useState("academic_year");

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900">ERP Financial Dashboard</h1>
          <p className="text-stone-500 mt-1">Real-time overview of collections, payments, and ledger summaries.</p>
        </div>
        <div>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_month">This Month</option>
            <option value="previous_month">Previous Month</option>
            <option value="academic_year">Academic Year</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>
      </div>

      {/* Collection Summary */}
      <section>
        <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-stone-400" /> Collection Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Total Generated" amount="45,20,000" icon={<ReceiptIcon />} color="blue" />
          <SummaryCard title="Total Collected" amount="32,15,000" icon={<TrendingUp />} color="green" />
          <SummaryCard title="Total Pending" amount="12,45,000" icon={<Clock />} color="orange" />
          <SummaryCard title="Total Overdue" amount="8,50,000" icon={<AlertTriangle />} color="red" />
          
          <SummaryCard title="Total Discount" amount="1,50,000" icon={<Percent />} color="purple" />
          <SummaryCard title="Late Fee Collected" amount="45,000" icon={<ShieldAlert />} color="rose" />
          <SummaryCard title="Total Refunded" amount="20,000" icon={<RotateCcw />} color="stone" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Summary */}
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-stone-400" /> Payment Modes Summary
          </h2>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-2">
            <PaymentModeRow name="Cash" amount="8,50,000" icon={<Banknote />} color="emerald" />
            <PaymentModeRow name="Payment Gateway" amount="15,20,000" icon={<CreditCard />} color="blue" />
            <PaymentModeRow name="UPI" amount="4,15,000" icon={<Smartphone />} color="violet" />
            <PaymentModeRow name="Bank Transfer" amount="2,30,000" icon={<Landmark />} color="indigo" />
            <PaymentModeRow name="Cheque" amount="2,00,000" icon={<Banknote />} color="orange" />
          </div>
        </section>

        {/* Student Summary */}
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-stone-400" /> Student Fee Status
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><UserCheck className="w-6 h-6" /></div>
              <h3 className="text-3xl font-black text-stone-900">450</h3>
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Fully Paid</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center"><Users className="w-6 h-6" /></div>
              <h3 className="text-3xl font-black text-stone-900">125</h3>
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Partially Paid</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center"><Users className="w-6 h-6" /></div>
              <h3 className="text-3xl font-black text-stone-900">80</h3>
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Pending (Not Due)</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center"><UserX className="w-6 h-6" /></div>
              <h3 className="text-3xl font-black text-stone-900">45</h3>
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Overdue Defaulters</p>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}

function SummaryCard({ title, amount, icon, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    rose: "bg-rose-100 text-rose-600",
    stone: "bg-stone-100 text-stone-600",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-xl font-black text-stone-900">₹{amount}</h3>
      </div>
    </div>
  );
}

function PaymentModeRow({ name, amount, icon, color }: any) {
  const colorMap: any = {
    emerald: "text-emerald-600 bg-emerald-50",
    blue: "text-blue-600 bg-blue-50",
    violet: "text-violet-600 bg-violet-50",
    indigo: "text-indigo-600 bg-indigo-50",
    orange: "text-orange-600 bg-orange-50",
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors rounded-xl border-b border-stone-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <span className="font-bold text-stone-700">{name}</span>
      </div>
      <span className="font-black text-stone-900">₹{amount}</span>
    </div>
  );
}

function ReceiptIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>
  );
}
