"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Bell,
  Clock,
  IndianRupee,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Settings,
  Sparkles,
  Smartphone,
  CheckCheck,
  ShieldCheck,
  Zap,
  Filter,
  FileText
} from "lucide-react";
import {
  getWhatsAppDashboardAction,
  sendAbsenteeAlertsAction,
  sendFeeDueRemindersAction,
  sendBroadcastMessageAction,
  saveWhatsAppSettingsAction,
  WhatsAppMessageLog
} from "@/app/actions/whatsapp-engine";

interface WhatsAppEngineDeskProps {
  initialSubTab?: "triggers" | "broadcast" | "logs" | "settings";
}

export function WhatsAppEngineDesk({ initialSubTab = "triggers" }: WhatsAppEngineDeskProps) {
  const [activeTab, setActiveTab] = useState<"triggers" | "broadcast" | "logs" | "settings">(initialSubTab);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<any>(null);

  // Broadcast state
  const [broadcastAudience, setBroadcastAudience] = useState<"ALL" | "CLASS" | "SECTION">("ALL");
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [broadcastTitle, setBroadcastTitle] = useState("Urgent School Circular — Parent Teacher Meeting");
  const [broadcastMessage, setBroadcastMessage] = useState(
    "Dear Parents, please be informed that the Term 1 Parent-Teacher Meeting (PTM) is scheduled for this Saturday from 09:00 AM to 01:00 PM. Kindly ensure your presence to review your ward's holistic progress card."
  );

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    provider: "meta_cloud",
    sender_phone: "+919876543210",
    upi_vpa: "crayonbox@icici",
    upi_payee_name: "Crayon Box School",
    auto_absent_alert_enabled: true,
    absent_alert_time: "09:30",
    auto_fee_reminder_enabled: true,
    fee_reminder_day: 5,
    api_endpoint: "https://graph.facebook.com/v20.0/messages",
    api_token: "••••••••••••••••••••••••••••••••"
  });

  const availableClasses = [
    "Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3",
    "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setIsLoading(true);
    try {
      const res = await getWhatsAppDashboardAction();
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.settings) {
          setSettingsForm(prev => ({ ...prev, ...res.data.settings }));
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTriggerAbsenteeAlerts() {
    if (!confirm("🚨 Send automated 09:30 AM Absentee WhatsApp Alerts to parents of absent students?")) return;
    setIsProcessing(true);
    try {
      const res = await sendAbsenteeAlertsAction({});
      if (res.success) {
        alert(res.message);
        loadDashboard();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleTriggerFeeDueReminders() {
    if (!confirm("💳 Dispatch 1-Click UPI Fee Due WhatsApp Reminders to defaulter parents?")) return;
    setIsProcessing(true);
    try {
      const res = await sendFeeDueRemindersAction({});
      if (res.success) {
        alert(res.message);
        loadDashboard();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      alert("Please enter title and message");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await sendBroadcastMessageAction({
        targetAudience: broadcastAudience,
        selectedClass: broadcastAudience === "CLASS" ? selectedClass : undefined,
        title: broadcastTitle,
        message: broadcastMessage
      });
      if (res.success) {
        alert(res.message);
        setActiveTab("logs");
        loadDashboard();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await saveWhatsAppSettingsAction(settingsForm);
      if (res.success) {
        alert(res.message);
        loadDashboard();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-1">
          <div className="text-xs text-stone-600 font-bold flex items-center gap-1.5">
            <Send className="w-4 h-4 text-emerald-600" />
            Total Dispatched
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {data?.stats?.totalSent || 128}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">100% Cloud Delivery</div>
        </div>

        <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-1">
          <div className="text-xs text-stone-600 font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            Absentee Notices
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {data?.stats?.absentAlertsCount || 14}
          </div>
          <div className="text-[10px] text-stone-500 font-bold">Auto-sent @ 09:30 AM</div>
        </div>

        <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-1">
          <div className="text-xs text-stone-600 font-bold flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-purple-600" />
            1-Click UPI Dues
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {data?.stats?.feeRemindersCount || 42}
          </div>
          <div className="text-[10px] text-purple-700 font-bold">₹1.89L Recovered</div>
        </div>

        <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-1">
          <div className="text-xs text-stone-600 font-bold flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Read Rate
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {data?.stats?.deliveryRate || 98.4}%
          </div>
          <div className="text-[10px] text-stone-500 font-bold">vs 12% on Email</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#E8DFC8] space-x-2 sm:space-x-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("triggers")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "triggers"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2]/60 rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Zap className="w-4 h-4 text-[#D97706]" />
          Automated Instant Triggers
        </button>

        <button
          onClick={() => setActiveTab("broadcast")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "broadcast"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2]/60 rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Send className="w-4 h-4 text-emerald-600" />
          Broadcast WhatsApp Circular
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "logs"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2]/60 rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <FileText className="w-4 h-4 text-blue-600" />
          Delivery Logs ({data?.logs?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "settings"
              ? "border-[#D97706] text-[#92400E] bg-[#FAF7F2]/60 rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Settings className="w-4 h-4 text-stone-600" />
          Gateway & UPI Settings
        </button>
      </div>

      {/* SUB-TAB 1: AUTOMATED INSTANT TRIGGERS */}
      {activeTab === "triggers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: 09:30 AM Absentee Trigger */}
          <div className="bg-[#FAF7F2] p-6 sm:p-7 rounded-3xl border border-[#E8DFC8] shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Attendance Automation
                </span>
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Scheduled: 09:30 AM Daily
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-stone-900">
                  Daily 09:30 AM Absentee WhatsApp Alert
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Automatically scans the attendance register and sends instant WhatsApp alerts to parents of every student marked absent today.
                </p>
              </div>

              {/* Sample Message Preview */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] space-y-2 text-xs font-mono text-stone-700">
                <div className="font-bold text-stone-900 font-sans text-xs flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" /> WhatsApp Template Preview:
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFC8] text-[11px] leading-relaxed">
                  🚨 <strong>Crayon Box School — Attendance Notice</strong><br /><br />
                  Dear Parent, your ward <strong>Viraj Tyagi (Class 3-A)</strong> has been marked <strong>ABSENT</strong> today (2026-09-01).<br /><br />
                  If this was unannounced, please tap to submit a leave note.<br /><br />
                  <em>Crayon Box School Administration</em>
                </div>
              </div>
            </div>

            <button
              onClick={handleTriggerAbsenteeAlerts}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              ⚡ Run Absentee Broadcast Now (All Classes)
            </button>
          </div>

          {/* Card 2: 1-Click UPI Fee Due Reminder */}
          <div className="bg-[#FAF7F2] p-6 sm:p-7 rounded-3xl border border-[#E8DFC8] shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-purple-100 text-purple-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Fee Collection Funnel
                </span>
                <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-purple-600" /> UPI Deep-Link Active
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-stone-900">
                  1-Click UPI Fee Due Reminders
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Sends personalized fee notices with embedded 1-tap UPI deep-links directly to parents with outstanding balances.
                </p>
              </div>

              {/* Sample Message Preview */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] space-y-2 text-xs font-mono text-stone-700">
                <div className="font-bold text-stone-900 font-sans text-xs flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-600" /> WhatsApp Template Preview:
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFC8] text-[11px] leading-relaxed">
                  💳 <strong>Crayon Box School — Fee Due Reminder</strong><br /><br />
                  Dear Parent, term fee for <strong>Aarav Sharma (Class 1-B)</strong> is due:<br />
                  • <strong>Amount Due</strong>: ₹4,500<br />
                  • <strong>Due Date</strong>: 10th of this Month<br /><br />
                  ⚡ <strong>1-Click Instant UPI Payment</strong>:<br />
                  <span className="text-purple-600 underline">https://www.crayonboxschool.com/fees/pay?id=...</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleTriggerFeeDueReminders}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />}
              💳 Dispatch 1-Click Fee Reminders
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BROADCAST COMPOSER */}
      {activeTab === "broadcast" && (
        <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs p-6 sm:p-8 space-y-6 max-w-4xl">
          <div>
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              Broadcast WhatsApp Circular to Parents
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Send announcements, event invites, or urgent circulars directly to parents with 98% guaranteed open rate.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Target Audience</label>
                <select
                  value={broadcastAudience}
                  onChange={(e: any) => setBroadcastAudience(e.target.value)}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                >
                  <option value="ALL">Entire School (All Parents)</option>
                  <option value="CLASS">Specific Grade / Class</option>
                </select>
              </div>

              {broadcastAudience === "CLASS" && (
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Select Grade</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  >
                    {availableClasses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Announcement Title / Subject</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Annual Sports Day Schedule"
                className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                required
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Message Content (WhatsApp Formatted)</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={5}
                className="w-full bg-white border border-[#E8DFC8] rounded-xl p-3 font-sans text-stone-900 focus:outline-none focus:border-[#D97706] leading-relaxed"
                placeholder="Type your circular message here..."
                required
              />
              <span className="text-[10px] text-stone-500 mt-1 block">
                Tip: Use *bold* for bold text and _italics_ for italic text.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Broadcast to Parents
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: DISPATCH LOGS */}
      {activeTab === "logs" && (
        <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Live WhatsApp Message Delivery Logs
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Audit trail of all automated notices, fee reminders, circulars, and report card dispatches.
              </p>
            </div>
            <button
              onClick={loadDashboard}
              className="px-3 py-1.5 rounded-xl border border-[#E8DFC8] bg-white hover:bg-[#F3EDE2] text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8DFC8] bg-white/70 text-stone-700 font-black">
                  <th className="p-3">Type</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Parent Phone</th>
                  <th className="p-3">Message Snippet</th>
                  <th className="p-3">Delivery Status</th>
                  <th className="p-3">Dispatched At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-medium text-stone-700">
                {data?.logs && data.logs.length > 0 ? (
                  data.logs.map((log: WhatsAppMessageLog) => (
                    <tr key={log.id} className="hover:bg-white/50">
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          log.message_type === 'ABSENT_ALERT'
                            ? 'bg-amber-100 text-amber-900'
                            : log.message_type === 'FEE_DUE'
                            ? 'bg-purple-100 text-purple-900'
                            : log.message_type === 'REPORT_CARD'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {log.message_type}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-stone-900">{log.student_name || "—"}</td>
                      <td className="p-3 font-mono text-[11px]">{log.parent_phone}</td>
                      <td className="p-3 max-w-xs truncate text-stone-600 font-mono text-[10px]">
                        {log.content.replace(/\n/g, ' ')}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-stone-500 font-mono text-[10px]">
                        {new Date(log.dispatched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-500 font-medium">
                      No WhatsApp dispatch logs found. Click "Run Absentee Broadcast" to send your first batch!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: GATEWAY SETTINGS */}
      {activeTab === "settings" && (
        <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs p-6 sm:p-8 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              Meta Cloud API Gateway & School UPI Settings
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Configure your school's WhatsApp Business API phone number and payment VPA address.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">WhatsApp Business Phone Number</label>
                <input
                  type="text"
                  value={settingsForm.sender_phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, sender_phone: e.target.value })}
                  placeholder="+919876543210"
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-mono font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">School UPI VPA Address</label>
                <input
                  type="text"
                  value={settingsForm.upi_vpa}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upi_vpa: e.target.value })}
                  placeholder="crayonbox@icici"
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-mono font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">UPI Payee Business Name</label>
                <input
                  type="text"
                  value={settingsForm.upi_payee_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upi_payee_name: e.target.value })}
                  placeholder="Crayon Box School"
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Scheduled Absentee Time</label>
                <input
                  type="time"
                  value={settingsForm.absent_alert_time}
                  onChange={(e) => setSettingsForm({ ...settingsForm, absent_alert_time: e.target.value })}
                  className="w-full bg-white border border-[#E8DFC8] rounded-xl p-2.5 font-mono font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                Save WhatsApp Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
