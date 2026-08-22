"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Bell, ArrowLeft, Wallet, CheckSquare, Bus, 
  Calendar, Award, MessageSquare, ChevronRight, Check
} from "lucide-react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";

export default function MobileNotificationsPage() {
  const { activeRole } = useMobileAuth();
  const [filter, setFilter] = useState<string>("all");

  const NOTIFICATIONS = [
    { id: "NOTIF-01", type: "fee", title: "Fee Payment Reminder", message: "Term 2 Tuition fee for Aarav is due by 31 Aug 2026.", time: "10 mins ago", unread: true, link: "/mobile/fees" },
    { id: "NOTIF-02", type: "attendance", title: "Attendance Marked", message: "Aarav Sharma marked Present for Period 2 Mathematics.", time: "1 hour ago", unread: true, link: "/mobile/attendance" },
    { id: "NOTIF-03", type: "transport", title: "Bus Approaching Stop", message: "School Bus No. 04 is 3 stops away from Shipra Sun City.", time: "2 hours ago", unread: false, link: "/mobile/transport" },
    { id: "NOTIF-04", type: "circular", title: "Independence Day Celebrations", message: "Special morning assembly circular and dress code published.", time: "Yesterday", unread: false, link: "/news" },
    { id: "NOTIF-05", type: "approval", title: "Leave Request Approved", message: "Principal approved planned medical leave for 26 Aug.", time: "2 days ago", unread: false, link: "/mobile/approvals" },
  ];

  const filtered = filter === "all" ? NOTIFICATIONS : NOTIFICATIONS.filter(n => n.type === filter);

  return (
    <div className="space-y-5 pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/mobile" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-tight">Universal Notifications</h1>
            <p className="text-[11px] text-slate-500">Real-time alerts with deep links</p>
          </div>
        </div>

        <button 
          onClick={() => alert("All notifications marked as read.")}
          className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5" /> Mark Read
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {["all", "fee", "attendance", "transport", "circular", "approval"].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-bold capitalize shrink-0 transition-all ${
              filter === cat ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filtered.map(notif => (
          <Link
            key={notif.id}
            href={notif.link}
            className={`p-4 rounded-2xl border transition-all flex items-start justify-between group ${
              notif.unread 
                ? "bg-white border-amber-300 ring-2 ring-amber-400/20 shadow-sm" 
                : "bg-white border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                notif.type === "fee" ? "bg-emerald-50 text-emerald-600" :
                notif.type === "attendance" ? "bg-blue-50 text-blue-600" :
                notif.type === "transport" ? "bg-amber-50 text-amber-600" :
                "bg-purple-50 text-purple-600"
              }`}>
                {notif.type === "fee" && <Wallet className="w-4 h-4" />}
                {notif.type === "attendance" && <CheckSquare className="w-4 h-4" />}
                {notif.type === "transport" && <Bus className="w-4 h-4" />}
                {notif.type === "circular" && <MessageSquare className="w-4 h-4" />}
                {notif.type === "approval" && <Check className="w-4 h-4" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">{notif.title}</h4>
                  {notif.unread && (
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">{notif.message}</p>
                <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">{notif.time}</span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 shrink-0 mt-1" />
          </Link>
        ))}
      </div>

    </div>
  );
}
