"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, XCircle, ArrowLeft, Shield, 
  FileText, User, Receipt, Calendar, Sparkles, Filter
} from "lucide-react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";

export default function MobileApprovalsPage() {
  const { user } = useMobileAuth();
  const [category, setCategory] = useState<string>("all");
  const [items, setItems] = useState([
    { id: "APP-01", category: "refund", title: "Fee Refund Request", subtitle: "Aarav Gupta (Grade 4B)", amount: "₹12,500", detail: "Excess lab deposit refund post syllabus migration", status: "pending" },
    { id: "APP-02", category: "leave", title: "Staff Medical Leave", subtitle: "Pooja Verma (TGT Science)", amount: "2 Days", detail: "Medical leave for 25-26 Aug with medical slip", status: "pending" },
    { id: "APP-03", category: "expense", title: "Robotics Lab Spares", subtitle: "Lab Incharge (Manish K.)", amount: "₹8,400", detail: "Arduino Nano boards, sensors & soldering consumables", status: "pending" },
    { id: "APP-04", category: "concession", title: "Sibling Sibling Concession", subtitle: "Diya & Rohit Sharma", amount: "15% Waiver", detail: "Standard second sibling policy applied on term tuition", status: "pending" },
  ]);

  const handleAction = (id: string, newStatus: "approved" | "rejected") => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const filtered = category === "all" ? items : items.filter(i => i.category === category);

  return (
    <div className="space-y-5 pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/mobile" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-tight">Executive Approvals</h1>
            <p className="text-[11px] text-slate-500">Management Action Center</p>
          </div>
        </div>

        <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
          {items.filter(i => i.status === "pending").length} Pending
        </span>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {["all", "refund", "expense", "leave", "concession"].map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-bold capitalize shrink-0 transition-all ${
              category === cat ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Approvals Feed */}
      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {item.category}
                  </span>
                  <span className="font-bold text-sm text-slate-900">{item.amount}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-800 mt-1">{item.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{item.subtitle}</p>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">{item.detail}</p>
              </div>
            </div>

            {item.status === "pending" ? (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => handleAction(item.id, "approved")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => handleAction(item.id, "rejected")}
                  className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            ) : (
              <div className={`text-xs font-bold py-1.5 px-3 rounded-xl text-center ${
                item.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {item.status === 'approved' ? '✓ Approved & Logged' : '✗ Request Rejected'}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
