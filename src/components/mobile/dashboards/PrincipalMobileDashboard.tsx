"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  GraduationCap, Clock, CheckCircle2, XCircle, 
  ArrowRight, Users, BookOpen, AlertCircle, 
  Calendar, Check, ShieldCheck, ChevronRight, UserCheck
} from "lucide-react";
import { useMobileAuth } from "../MobileAuthProvider";

export default function PrincipalMobileDashboard() {
  const { user } = useMobileAuth();

  const [approvals, setApprovals] = useState([
    { id: "APP-01", type: "Fee Refund", detail: "Aarav Gupta (Grade 4B)", amount: "₹12,500", reason: "Excess lab deposit refund", status: "pending" },
    { id: "APP-02", type: "Leave Request", detail: "Pooja Verma (TGT Science)", amount: "2 Days", reason: "Family emergency leave", status: "pending" },
    { id: "APP-03", type: "Expense Voucher", detail: "Robotics Lab Spares", amount: "₹8,400", reason: "Arduino microcontrollers & sensors", status: "pending" },
  ]);

  const handleAction = (id: string, action: "approved" | "rejected") => {
    setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: action } : item));
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* Principal Operational Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-indigo-950/10 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/30">
              <GraduationCap className="w-3.5 h-3.5" /> Principal Operations
            </span>
            <span className="text-xs text-slate-400 font-mono">Today &bull; 08:30 AM</span>
          </div>

          <div>
            <h2 className="text-xl font-bold font-serif">{user?.fullName || "Dr. Sunita Rao"}</h2>
            <p className="text-xs text-slate-300 mt-0.5">Classes in Session &bull; Academic Oversight</p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
              <div className="text-base font-bold text-amber-300">28/28</div>
              <span className="text-[10px] text-slate-300 font-medium">Classes Active</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
              <div className="text-base font-bold text-emerald-400">96.2%</div>
              <span className="text-[10px] text-slate-300 font-medium">Teachers Present</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
              <div className="text-base font-bold text-blue-300">3</div>
              <span className="text-[10px] text-slate-300 font-medium">Substitutions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Substitutions & Schedule Alerts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800">Today's Substitutions</h3>
          <Link href="/admin/faculty/substitutions" className="text-xs font-bold text-indigo-600 hover:underline">
            Manage All
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <div>
              <span className="font-bold text-slate-800">Period 3 &bull; Grade 5A Math</span>
              <p className="text-[11px] text-slate-500">Substitute: Rajesh Kumar (replacing Pooja V.)</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Assigned
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800">Period 5 &bull; Grade 8B Science</span>
              <p className="text-[11px] text-slate-500">Substitute: Neha Sharma (replacing Sunita M.)</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Assigned
            </span>
          </div>
        </div>
      </div>

      {/* Pending Approvals with 1-Tap Action */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800">Actionable Approvals ({approvals.filter(a => a.status === 'pending').length})</h3>
          <Link href="/mobile/approvals" className="text-xs font-bold text-indigo-600 hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-2.5">
          {approvals.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {item.type}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{item.amount}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 mt-1">{item.detail}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.reason}</p>
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
                  {item.status === 'approved' ? '✓ Approved by Principal' : '✗ Request Rejected'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
