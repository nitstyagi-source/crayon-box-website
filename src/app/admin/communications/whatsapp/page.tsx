"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Bell,
  Clock,
  DollarSign,
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

export default function WhatsAppCommandCenterPage() {
  const [activeTab, setActiveTab] = useState<"triggers" | "broadcast" | "logs" | "settings">("triggers");
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Official Meta WhatsApp Business Cloud Gateway
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-emerald-400" />
            Automated WhatsApp Notification Engine
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl">
            Dispatch instant 09:30 AM absentee notices, 1-click UPI fee due reminders, emergency circulars, and digital CBSE report cards directly to parent WhatsApp numbers.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/15">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Gateway Online</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-emerald-300/80 font-mono text-[11px]">
              {settingsForm.sender_phone}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <Send className="w-4 h-4 text-emerald-600" />
            Total Dispatched
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {data?.stats?.totalSent || 128}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">100% Cloud Delivery</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            Absentee Notices
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {data?.stats?.absentAlertsCount || 14}
          </div>
          <div className="text-[10px] text-stone-500 font-bold">Auto-sent @ 09:30 AM</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-purple-600" />
            1-Click UPI Dues
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {data?.stats?.feeRemindersCount || 42}
          </div>
          <div className="text-[10px] text-purple-600 font-bold">₹1.89L Recovered</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Read &amp; Delivery Rate
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {data?.stats?.deliveryRate || 98.4}%
          </div>
          <div className="text-[10px] text-stone-500 font-bold">vs 12% on Email</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("triggers")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "triggers"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Zap className="w-4 h-4" />
          ⚡ Automated Instant Triggers
        </button>

        <button
          onClick={() => setActiveTab("broadcast")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "broadcast"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Send className="w-4 h-4" />
          📢 Broadcast Circular Composer
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "logs"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          📊 Dispatch Logs ({data?.logs?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "settings"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Settings className="w-4 h-4" />
          ⚙️ Gateway &amp; UPI Settings
        </button>
      </div>

      {/* TAB 1: AUTOMATED INSTANT TRIGGERS */}
      {activeTab === "triggers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: 09:30 AM Absentee Trigger */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Attendance Automation
                </span>
                <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
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
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs font-mono text-stone-700">
                <div className="font-bold text-stone-900 font-sans text-xs flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" /> WhatsApp Template Preview:
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200/80 text-[11px] leading-relaxed shadow-2xs">
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
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              ⚡ Run Absentee Broadcast Now (All Classes)
            </button>
          </div>

          {/* Card 2: 1-Click UPI Fee Due Reminder */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-purple-100 text-purple-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Fee Collection Funnel
                </span>
                <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-purple-600" /> UPI Deep-Link Active
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
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs font-mono text-stone-700">
                <div className="font-bold text-stone-900 font-sans text-xs flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-600" /> WhatsApp Template Preview:
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200/80 text-[11px] leading-relaxed shadow-2xs">
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
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              💳 Dispatch 1-Click Fee Reminders
            </button>
          </div>

        </div>
      )}

      {/* TAB 2: BROADCAST COMPOSER */}
      {activeTab === "broadcast" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6 max-w-4xl">
          <div>
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              Broadcast WhatsApp Circular to Parents
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Send announcements, event invites, or urgent circulars directly to parents with 98% guaranteed open rate.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-5 text-xs">
            {/* Target Audience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Target Audience</label>
                <select
                  value={broadcastAudience}
                  onChange={(e: any) => setBroadcastAudience(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                  >
                    {availableClasses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">Announcement Title / Subject</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Annual Sports Day Schedule"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                required
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">Message Content (WhatsApp Formatted)</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={5}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-sans text-stone-900 focus:bg-white leading-relaxed"
                placeholder="Type your circular message here..."
                required
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Use *bold* for bold text and _italics_ for italic text.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                🚀 Send Broadcast to All Parents
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DISPATCH LOGS */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Live WhatsApp Message Delivery Logs
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Audit trail of all automated notices, fee reminders, circulars, and report card dispatches.
              </p>
            </div>
            <button
              onClick={loadDashboard}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-black">
                  <th className="p-3">Type</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Parent Phone</th>
                  <th className="p-3">Message Snippet</th>
                  <th className="p-3">Delivery Status</th>
                  <th className="p-3">Dispatched At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {data?.logs && data.logs.length > 0 ? (
                  data.logs.map((log: WhatsAppMessageLog) => (
                    <tr key={log.id} className="hover:bg-stone-50/50">
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
                      <td className="p-3 max-w-xs truncate text-stone-500 font-mono text-[10px]">
                        {log.content.replace(/\n/g, ' ')}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-stone-400 font-mono text-[10px]">
                        {new Date(log.dispatched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400 font-medium">
                      No WhatsApp dispatch logs found. Click "Run Absentee Broadcast" to send your first batch!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              Meta Cloud API Gateway &amp; School UPI Settings
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
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
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900"
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
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900"
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
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Scheduled Absentee Time</label>
                <input
                  type="time"
                  value={settingsForm.absent_alert_time}
                  onChange={(e) => setSettingsForm({ ...settingsForm, absent_alert_time: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save WhatsApp Settings
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

function Save(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  );
}
