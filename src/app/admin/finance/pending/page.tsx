"use client";

import { useState, useEffect } from "react";
import { 
  Clock, AlertTriangle, Search, Filter, MessageSquare, 
  Send, CheckCircle2, Phone, User, RefreshCw, ShieldAlert
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getDefaultersAging, sendFeeReminderNotification } from "@/app/actions/finance-core";

export default function DefaultersAndAgingPage() {
  const { activeCampusId } = useCampusContext();
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBucket, setSelectedBucket] = useState("All");
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  useEffect(() => {
    loadDefaulters();
  }, [activeCampusId]);

  async function loadDefaulters() {
    setIsLoading(true);
    try {
      const res = await getDefaultersAging(activeCampusId);
      if (res.success) {
        setDefaulters(res.data || []);
      }
    } catch (e) {
      console.error("Error loading defaulters:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendReminder(d: any) {
    setSendingReminderId(d.studentId);
    try {
      const message = `Dear Parent, this is a gentle reminder from Crayon Box School. School fee of ₹${d.totalDue} for ${d.name} (${d.className}) is pending. Kindly clear dues via parent portal or accounts desk.`;
      const res = await sendFeeReminderNotification({
        campus_id: activeCampusId,
        student_id: d.studentId,
        student_name: d.name,
        parent_mobile: d.parentMobile,
        channel: 'WhatsApp',
        due_amount: d.totalDue,
        message_content: message
      });

      if (res.success) {
        alert(`📱 WhatsApp reminder sent to ${d.parentName} (${d.parentMobile})!`);
      } else {
        alert("Failed to log reminder: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSendingReminderId(null);
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const filteredDefaulters = defaulters.filter((d) => {
    const matchesSearch = searchQuery === "" || 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBucket = selectedBucket === "All" || d.agingBucket === selectedBucket;
    return matchesSearch && matchesBucket;
  });

  const totalOutstanding = defaulters.reduce((acc, curr) => acc + curr.totalDue, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Dues Aging & Recovery
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Total Overdue: {formatCurrency(totalOutstanding)}</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Fee Defaulters & Aging Dues</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Track pending student balances across aging tiers and trigger 1-click WhatsApp/SMS reminders.
          </p>
        </div>

        <button
          onClick={loadDefaulters}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Dues
        </button>
      </div>

      {/* Aging Buckets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setSelectedBucket("0–30 Days")}
          className={`p-5 rounded-3xl border cursor-pointer transition ${
            selectedBucket === "0–30 Days" ? "bg-blue-50 border-blue-400" : "bg-white border-stone-200 hover:border-stone-300"
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">0–30 Days (Current)</span>
          <h3 className="text-2xl font-black text-stone-900 mt-1">
            {defaulters.filter(d => d.agingBucket === "0–30 Days").length} Students
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">Early reminder stage</p>
        </div>

        <div 
          onClick={() => setSelectedBucket("31–60 Days")}
          className={`p-5 rounded-3xl border cursor-pointer transition ${
            selectedBucket === "31–60 Days" ? "bg-amber-50 border-amber-400" : "bg-white border-stone-200 hover:border-stone-300"
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">31–60 Days (Moderate)</span>
          <h3 className="text-2xl font-black text-amber-700 mt-1">
            {defaulters.filter(d => d.agingBucket === "31–60 Days").length} Students
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">Follow-up call stage</p>
        </div>

        <div 
          onClick={() => setSelectedBucket("61–90 Days")}
          className={`p-5 rounded-3xl border cursor-pointer transition ${
            selectedBucket === "61–90 Days" ? "bg-orange-50 border-orange-400" : "bg-white border-stone-200 hover:border-stone-300"
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">61–90 Days (High Priority)</span>
          <h3 className="text-2xl font-black text-orange-700 mt-1">
            {defaulters.filter(d => d.agingBucket === "61–90 Days").length} Students
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">Parent meeting stage</p>
        </div>

        <div 
          onClick={() => setSelectedBucket("90+ Days (Critical)")}
          className={`p-5 rounded-3xl border cursor-pointer transition ${
            selectedBucket === "90+ Days (Critical)" ? "bg-red-50 border-red-400" : "bg-white border-stone-200 hover:border-stone-300"
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-red-600">90+ Days (Critical)</span>
          <h3 className="text-2xl font-black text-red-700 mt-1">
            {defaulters.filter(d => d.agingBucket === "90+ Days (Critical)").length} Students
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">Principal escalation</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search defaulter by Student Name, Admission #, Class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          onClick={() => setSelectedBucket("All")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            selectedBucket === "All" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          View All Buckets ({defaulters.length})
        </button>
      </div>

      {/* Defaulters Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 text-[11px] font-black uppercase tracking-wider text-stone-500">
                <th className="py-4 px-6">Student Details</th>
                <th className="py-4 px-6">Class / Wing</th>
                <th className="py-4 px-6">Parent Contact</th>
                <th className="py-4 px-6">Outstanding Dues</th>
                <th className="py-4 px-6">Aging Bucket</th>
                <th className="py-4 px-6">Last Payment</th>
                <th className="py-4 px-6 text-right">Quick Reminder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-400">
                    <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Calculating ledger dues & aging...
                  </td>
                </tr>
              ) : filteredDefaulters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-400">
                    🎉 No defaulters found in this category!
                  </td>
                </tr>
              ) : (
                filteredDefaulters.map((d) => (
                  <tr key={d.studentId} className="hover:bg-stone-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-stone-900">{d.name}</div>
                      <div className="text-[11px] text-stone-400 font-mono">#{d.admissionNo}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-stone-700">
                      {d.className}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-stone-800 font-semibold">{d.parentName}</div>
                      <div className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" /> {d.parentMobile}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-black text-amber-600 font-mono text-sm">
                      {formatCurrency(d.totalDue)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                        {d.agingBucket}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-stone-500">
                      {d.lastPaymentDate}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleSendReminder(d)}
                        disabled={sendingReminderId === d.studentId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition shadow-2xs disabled:opacity-50"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        {sendingReminderId === d.studentId ? "Sending..." : "WhatsApp"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
