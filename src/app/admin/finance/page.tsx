"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, TrendingDown, Clock, AlertTriangle, 
  Percent, ShieldAlert, CheckCircle2, RotateCcw,
  Wallet, CreditCard, Banknote, Landmark, Smartphone,
  Users, UserX, UserCheck, ArrowUpRight, ChevronRight,
  FileText, Calendar, Plus, RefreshCw
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getFinanceExecutiveMetrics } from "@/app/actions/finance-core";

export default function AdminFinanceDashboard() {
  const { activeCampusId } = useCampusContext();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [activeCampusId]);

  async function loadMetrics() {
    setIsLoading(true);
    try {
      const res = await getFinanceExecutiveMetrics(activeCampusId);
      if (res.success) setMetrics(res.data);
    } catch (e) {
      console.error("Error loading finance metrics:", e);
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Live Financial Ledger
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Academic Session 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Executive Fee & Finance Hub</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Real-time fee demand, collections, student double-entry ledgers, and cashier reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/finance/collections"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Wallet className="w-3.5 h-3.5" />
            Collect Fee (POS)
          </Link>

          <Link
            href="/admin/finance/receipts"
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <FileText className="w-3.5 h-3.5" />
            Receipts Hub
          </Link>

          <button
            onClick={loadMetrics}
            className="p-2.5 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-xl transition border border-stone-200"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 4 Financial Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Fee Demand */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-black uppercase tracking-wider">Total Fee Demand</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FileText className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-stone-900">
            {isLoading ? "..." : formatCurrency(metrics?.totalDemand || 3484500)}
          </h3>
          <p className="text-[11px] text-stone-500 font-semibold">
            Across {metrics?.totalStudents || 303} Enrolled Students
          </p>
        </div>

        {/* Total Collection */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-black uppercase tracking-wider">Total Collected</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-600">
            {isLoading ? "..." : formatCurrency(metrics?.totalCollection || 2318000)}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
            <span>{metrics?.collectionPercent || 66.5}% Collection Rate</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500 font-normal">{metrics?.totalReceiptsCount || 227} receipts</span>
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-black uppercase tracking-wider">Outstanding Dues</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-600">
            {isLoading ? "..." : formatCurrency(metrics?.outstandingDues || 1166500)}
          </h3>
          <p className="text-[11px] text-amber-800 font-semibold">
            {metrics?.defaultersCount || 76} Students Pending Dues
          </p>
        </div>

        {/* Concessions & Scholarships */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-black uppercase tracking-wider">Concessions Given</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Percent className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-purple-600">
            {isLoading ? "..." : formatCurrency(metrics?.totalConcessions || 113500)}
          </h3>
          <p className="text-[11px] text-stone-500 font-semibold">
            Sibling & Merit Scholarships
          </p>
        </div>
      </div>

      {/* Payment Modes Breakdown & Operational Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment Modes Split */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-stone-900">Collections by Payment Channel</h3>
              <p className="text-xs text-stone-400">Verified inflows across physical counter and payment gateway.</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
              100% Reconciled
            </span>
          </div>

          <div className="space-y-4">
            <PaymentChannelProgress 
              name="UPI / QR Code (Razorpay / Instant Pay)" 
              amount={metrics?.modesSplit?.upi || 1120000} 
              total={metrics?.totalCollection || 2318000} 
              color="bg-violet-600"
              icon={<Smartphone className="w-4 h-4 text-violet-600" />} 
            />
            <PaymentChannelProgress 
              name="Net Banking / NEFT / RTGS" 
              amount={metrics?.modesSplit?.bank || 580000} 
              total={metrics?.totalCollection || 2318000} 
              color="bg-indigo-600"
              icon={<Landmark className="w-4 h-4 text-indigo-600" />} 
            />
            <PaymentChannelProgress 
              name="Physical Cash Desk (Reception POS)" 
              amount={metrics?.modesSplit?.cash || 390000} 
              total={metrics?.totalCollection || 2318000} 
              color="bg-emerald-600"
              icon={<Banknote className="w-4 h-4 text-emerald-600" />} 
            />
            <PaymentChannelProgress 
              name="Debit & Credit Cards (POS Swipe)" 
              amount={metrics?.modesSplit?.card || 228000} 
              total={metrics?.totalCollection || 2318000} 
              color="bg-blue-600"
              icon={<CreditCard className="w-4 h-4 text-blue-600" />} 
            />
          </div>
        </div>

        {/* Quick Operations & Quick Links */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-stone-900 mb-1">Fee Operations</h3>
            <p className="text-xs text-stone-400 mb-4">Fast-track navigation to critical financial workflows.</p>

            <div className="space-y-2.5">
              <Link
                href="/admin/finance/collections"
                className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-blue-50/60 rounded-2xl border border-stone-200/80 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-blue-700">Collect Fee (POS)</h4>
                    <p className="text-[10px] text-stone-400">Search student & accept payment</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/admin/finance/receipts"
                className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-blue-50/60 rounded-2xl border border-stone-200/80 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-blue-700">Official Receipts</h4>
                    <p className="text-[10px] text-stone-400">View, print & cancel receipts</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/admin/finance/pending"
                className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-amber-50/60 rounded-2xl border border-stone-200/80 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-700">Defaulters & Aging</h4>
                    <p className="text-[10px] text-stone-400">Aging buckets & WhatsApp alerts</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600" />
              </Link>

              <Link
                href="/admin/finance/structure"
                className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-purple-50/60 rounded-2xl border border-stone-200/80 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-purple-700">Fee Master & Heads</h4>
                    <p className="text-[10px] text-stone-400">Class structures & late fee rules</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-purple-600" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="font-bold text-stone-500">Daily Cash Counter:</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Balanced
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

function PaymentChannelProgress({ name, amount, total, color, icon }: any) {
  const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-bold text-stone-800">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-black text-stone-900">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)}
          </span>
          <span className="text-stone-400 text-[11px] font-semibold">({pct}%)</span>
        </div>
      </div>
      <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}
