"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertCircle, Search, RefreshCw, Send, 
  IndianRupee, Phone, CheckCircle2, MessageSquare 
} from "lucide-react";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { getDefaultersAging, sendFeeReminderNotification } from "@/app/actions/finance-core";

export default function BillingDefaultersPage() {
  const { currentInstitution, selectedInstitutionObj } = useInstitution();
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    loadDefaulters();
  }, [currentInstitution]);

  async function loadDefaulters() {
    setIsLoading(true);
    try {
      const res = await getDefaultersAging(currentInstitution);
      if (res.success) {
        setDefaulters(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendReminder(d: any) {
    setSendingId(d.studentId);
    try {
      const message = `Dear Parent, this is an official fee reminder from ${selectedInstitutionObj?.name || 'School Accounts'}. Outstanding fee balance of ₹${d.totalDue} for ${d.name} (${d.className}) is pending. Kindly clear the balance at the accounts counter.`;
      const res = await sendFeeReminderNotification({
        institution_code: currentInstitution,
        student_id: d.studentId,
        student_name: d.name,
        parent_mobile: d.parentMobile,
        channel: 'WhatsApp',
        due_amount: d.totalDue,
        message_content: message
      });
      if (res.success) {
        alert(`✓ Reminder sent to ${d.parentMobile} for ${d.name}`);
      } else {
        alert(res.error || "Failed to trigger reminder");
      }
    } finally {
      setSendingId(null);
    }
  }

  const filtered = defaulters.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.className && d.className.toLowerCase().includes(q)) ||
      (d.parentMobile && d.parentMobile.includes(q))
    );
  });

  const totalOutstanding = defaulters.reduce((acc, d) => acc + Number(d.totalDue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs">
        <div>
          <h2 className="text-xl font-serif font-black text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-rose-600" />
            Pending Fee Dues &amp; Defaulters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track unpaid student fee balances and trigger 1-click WhatsApp payment reminders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Dues</span>
            <strong className="text-base font-mono font-black text-rose-700">
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </strong>
          </div>
          <button
            onClick={loadDefaulters}
            className="p-2 bg-[#FAF7F2] hover:bg-amber-50 text-slate-800 border border-[#E8DFC8] rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-amber-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-[#E8DFC8] shadow-xs">
        <input
          type="text"
          placeholder="Search by Student Name, Class, or Parent Mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl text-xs font-medium focus:outline-none focus:bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading pending dues...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">No pending fee defaulters. All ledgers cleared!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] text-[10px] font-bold uppercase text-slate-600 border-b border-[#E8DFC8]">
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">Parent Contact</th>
                  <th className="py-2.5 px-4">Aging Bracket</th>
                  <th className="py-2.5 px-4 text-right">Balance Due</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFC8]">
                {filtered.map((d, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/20">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{d.name}</td>
                    <td className="py-2.5 px-4">{d.className}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{d.parentMobile || '—'}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        {d.agingBracket || 'Current'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-black text-rose-700">
                      ₹{Number(d.totalDue).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleSendReminder(d)}
                        disabled={sendingId === d.studentId || !d.parentMobile}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {sendingId === d.studentId ? 'Sending...' : 'WhatsApp'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
