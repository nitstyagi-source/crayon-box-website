"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GraduationCap, Clock, CheckCircle2, XCircle, 
  ArrowRight, Users, BookOpen, AlertCircle, 
  Calendar, Check, ShieldCheck, ChevronRight, UserCheck, RefreshCw
} from "lucide-react";
import { useMobileAuth } from "../MobileAuthProvider";
import { SchoolLogo } from "@/components/ui/SchoolLogo";
import { getApprovalRequestsAction, processApprovalDecisionAction } from "@/app/actions/approval-engine-actions";

export default function PrincipalMobileDashboard() {
  const { user } = useMobileAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApprovals() {
      try {
        const res = await getApprovalRequestsAction({ status: 'PENDING' });
        if (res.success && res.data) {
          setApprovals(res.data.map((a: any) => ({
            id: a.id,
            type: a.request_type?.replace(/_/g, ' ') || 'Approval',
            detail: `${a.entity_name || 'Item'} (${a.title})`,
            amount: a.diff_payload?.amount ? `₹${a.diff_payload.amount}` : (a.priority || 'NORMAL'),
            reason: a.description || 'Maker-checker review requested',
            status: a.status?.toLowerCase() || 'pending'
          })));
        }
      } catch (_) {}
      finally {
        setIsLoading(false);
      }
    }
    loadApprovals();
  }, []);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      await processApprovalDecisionAction({
        requestId: id,
        decision: action === 'approved' ? 'APPROVED' : 'REJECTED',
        reviewerName: user?.fullName || 'Principal'
      });
      setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: action } : item));
    } catch (_) {}
  };

  const todayStr = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date());

  return (
    <div className="space-y-6 pb-24">
      
      {/* Principal Operational Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-indigo-950/10 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/30">
              <GraduationCap className="w-3.5 h-3.5" /> Principal Operations
            </span>
            <span className="text-xs text-slate-400 font-mono">Today &bull; {todayStr}</span>
          </div>

          <div className="flex items-center gap-3.5">
            <SchoolLogo size="lg" shape="square" className="bg-white/95 p-1 shadow-md" />
            <div>
              <h2 className="text-xl font-bold font-serif">{user?.fullName || "School Principal"}</h2>
              <p className="text-xs text-slate-300 mt-0.5">Classes in Session &bull; Academic Oversight</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
              <div className="text-base font-bold text-amber-300">Active</div>
              <span className="text-[10px] text-slate-300 font-medium">Session Live</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
              <div className="text-base font-bold text-emerald-400">Normal</div>
              <span className="text-[10px] text-slate-300 font-medium">Operations</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
              <div className="text-base font-bold text-blue-300">{approvals.filter(a => a.status === 'pending').length}</div>
              <span className="text-[10px] text-slate-300 font-medium">Pending Tasks</span>
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
