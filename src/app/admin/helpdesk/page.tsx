"use client";

import { useState, useEffect } from "react";
import { 
  LifeBuoy, Headphones, Search, Filter, MessageSquare, 
  CheckCircle2, Clock, AlertTriangle, ShieldAlert, 
  Send, UserCheck, Lock, PhoneCall, Mail, Tag, 
  Building2, ArrowRight, Eye, Star, Plus, RefreshCw
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getHelpdeskDashboardStats,
  getHelpdeskTickets,
  getTicketDetailsWithMessages,
  addTicketMessage,
  updateTicketTriage
} from "@/app/actions/helpdesk";

const CATEGORIES = [
  "All",
  "Transport",
  "Fees",
  "Academics",
  "Teacher",
  "Medical",
  "Food/Canteen",
  "Infrastructure",
  "Housekeeping",
  "Security",
  "ERP/App",
  "Uniform",
  "Books/Stationery",
  "Administration",
  "Other"
];

const DEPARTMENTS = [
  "Help Desk",
  "Accounts",
  "Transport Manager",
  "Academic Coordinator",
  "Medical Staff",
  "Admin",
  "IT Support",
  "Security / Admin",
  "Principal & Leadership"
];

export default function AdminHelpdeskPage() {
  const { activeCampusId } = useCampusContext();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reply Composer State
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Triage Update State
  const [assignedDept, setAssignedDept] = useState("");
  const [actionTakenText, setActionTakenText] = useState("");
  const [resolutionNotesText, setResolutionNotesText] = useState("");

  useEffect(() => {
    loadAllTickets();
  }, [activeCampusId, selectedCategory, selectedPriority, selectedStatus, searchQuery]);

  async function loadAllTickets() {
    setIsLoading(true);
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        getHelpdeskDashboardStats(activeCampusId),
        getHelpdeskTickets({
          campusId: activeCampusId,
          category: selectedCategory,
          priority: selectedPriority,
          status: selectedStatus,
          search: searchQuery
        })
      ]);

      if (statsRes.success && statsRes.data) setDashboardStats(statsRes.data);
      if (ticketsRes.success && ticketsRes.data) {
        setTickets(ticketsRes.data);
        if (ticketsRes.data.length > 0 && !activeTicket) {
          loadTicketThread(ticketsRes.data[0].id);
        }
      }
    } catch (e) {
      console.error("Error loading helpdesk tickets:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadTicketThread(ticketId: string) {
    const res = await getTicketDetailsWithMessages(ticketId, false);
    if (res.success && res.data) {
      setActiveTicket(res.data.ticket);
      setMessages(res.data.messages);
      setAssignedDept(res.data.ticket.assigned_department || "Help Desk");
      setActionTakenText(res.data.ticket.action_taken || "");
      setResolutionNotesText(res.data.ticket.resolution_notes || "");
    }
  }

  // Send Message / Internal Note Submit
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    setIsSending(true);
    try {
      const res = await addTicketMessage({
        ticketId: activeTicket.id,
        senderType: "Staff",
        senderName: "Help Desk Command",
        senderRole: isInternalNote ? "Internal Note" : "Staff Support",
        message: replyText.trim(),
        isInternalNote
      });

      if (res.success) {
        setReplyText("");
        setIsInternalNote(false);
        loadTicketThread(activeTicket.id);
        loadAllTickets();
      } else {
        alert("Error sending message: " + res.error);
      }
    } finally {
      setIsSending(false);
    }
  }

  // Update Triage Details
  async function handleTriageUpdate() {
    if (!activeTicket) return;
    const res = await updateTicketTriage({
      ticketId: activeTicket.id,
      assignedDepartment: assignedDept,
      actionTaken: actionTakenText,
      resolutionNotes: resolutionNotesText
    });

    if (res.success) {
      alert("Triage details saved!");
      loadTicketThread(activeTicket.id);
      loadAllTickets();
    } else {
      alert("Error: " + res.error);
    }
  }

  // Mark Ticket Resolved
  async function handleMarkResolved() {
    if (!activeTicket) return;
    const notes = prompt("Enter Final Resolution Summary for the Parent:", resolutionNotesText || "Issue investigated and resolved.");
    if (notes === null) return;

    const res = await updateTicketTriage({
      ticketId: activeTicket.id,
      status: "Resolved",
      resolutionNotes: notes
    });

    if (res.success) {
      alert(`Ticket #${activeTicket.ticket_number} marked as Resolved!`);
      loadTicketThread(activeTicket.id);
      loadAllTickets();
    } else {
      alert("Error: " + res.error);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Headphones className="w-3 h-3 text-purple-600" /> Parent Complaints &amp; Help Desk Triage
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Automated SLA &amp; Dept Routing
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Help Desk Command &amp; Resolution Triage
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Handle parent grievances, operational queries, SLA escalations, and confidential staff investigation notes.
          </p>
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">New / Submitted</span>
          <strong className="text-xl font-black text-stone-900 mt-0.5 block">{dashboardStats?.newTickets || 12}</strong>
          <span className="text-[10px] text-blue-700 font-bold">Unassigned</span>
        </div>

        <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] text-amber-800 font-bold uppercase block">In Progress</span>
          <strong className="text-xl font-black text-amber-950 mt-0.5 block">{dashboardStats?.inProgress || 18}</strong>
          <span className="text-[10px] text-amber-700 font-medium">Under Review</span>
        </div>

        <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] text-purple-800 font-bold uppercase block">Pending Action</span>
          <strong className="text-xl font-black text-purple-950 mt-0.5 block">{dashboardStats?.pending || 7}</strong>
          <span className="text-[10px] text-purple-700 font-medium">Awaiting Dept</span>
        </div>

        <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] text-emerald-800 font-bold uppercase block">Resolved Cases</span>
          <strong className="text-xl font-black text-emerald-950 mt-0.5 block">{dashboardStats?.resolved || 25}</strong>
          <span className="text-[10px] text-emerald-700 font-bold">96% CSAT Rating</span>
        </div>

        <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[10px] text-rose-800 font-bold uppercase block">Critical Priority</span>
          <strong className="text-xl font-black text-rose-950 mt-0.5 block">{dashboardStats?.critical || 1}</strong>
          <span className="text-[10px] text-rose-700 font-bold">4h SLA Limit</span>
        </div>

        <div className="bg-red-50/60 p-3.5 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-[10px] text-red-800 font-bold uppercase block">SLA Breached</span>
          <strong className="text-xl font-black text-red-950 mt-0.5 block">{dashboardStats?.slaBreached || 2}</strong>
          <span className="text-[10px] text-red-700 font-bold">Escalated to Principal</span>
        </div>
      </div>

      {/* Two-Pane Help Desk Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        
        {/* Left Pane: Ticket Queue (4.5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
          
          <div className="space-y-2.5">
            {/* Search and Filters */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket #, parent, student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold text-stone-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl p-1.5 font-bold text-stone-800"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c === "All" ? "All Depts" : c}</option>)}
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl p-1.5 font-bold text-stone-800"
              >
                {["All", "Critical", "High", "Medium", "Low"].map(p => (
                  <option key={p} value={p}>{p === "All" ? "All Priority" : p}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl p-1.5 font-bold text-stone-800"
              >
                {["All", "Submitted", "In Progress", "Resolved", "Closed"].map(s => (
                  <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tickets List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[520px]">
            {tickets.map((t) => {
              const isSelected = activeTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => loadTicketThread(t.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition text-xs space-y-2 ${
                    isSelected
                      ? "bg-purple-50/70 border-purple-300 shadow-2xs"
                      : "bg-stone-50/60 border-stone-200 hover:bg-stone-100/70"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-purple-700 font-bold">{t.ticket_number}</span>
                      <strong className="text-stone-900 font-bold block text-xs mt-0.5 line-clamp-1">{t.subject}</strong>
                      <span className="text-[10px] text-stone-500 font-medium">{t.student_name} ({t.class_name}) • {t.parent_name}</span>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                      t.priority === "Critical" ? "bg-red-600 text-white" :
                      t.priority === "High" ? "bg-rose-100 text-rose-900" :
                      t.priority === "Medium" ? "bg-amber-100 text-amber-900" :
                      "bg-emerald-100 text-emerald-900"
                    }`}>
                      {t.priority}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-stone-200/60 text-[10px]">
                    <span className="text-purple-800 font-bold bg-white px-2 py-0.5 rounded border border-stone-200">
                      🏢 {t.assigned_department}
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      t.status === "Resolved" || t.status === "Closed" ? "bg-emerald-100 text-emerald-900" :
                      t.status === "In Progress" ? "bg-amber-100 text-amber-900" : "bg-blue-100 text-blue-900"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Pane: Active Ticket Triage & Chat Thread (7.5 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 text-xs">
          
          {activeTicket ? (
            <>
              {/* Ticket Details Header */}
              <div className="border-b border-stone-100 pb-3 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-purple-700 text-xs">{activeTicket.ticket_number}</span>
                      <span className="text-stone-300">•</span>
                      <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2 py-0.2 rounded">
                        {activeTicket.category}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.2 rounded ${
                        activeTicket.priority === "Critical" ? "bg-red-600 text-white" :
                        activeTicket.priority === "High" ? "bg-rose-100 text-rose-900" :
                        "bg-amber-100 text-amber-900"
                      }`}>
                        {activeTicket.priority} Priority ({activeTicket.sla_target_hours}h SLA)
                      </span>
                    </div>
                    <h2 className="text-base font-black text-stone-900 mt-1">{activeTicket.subject}</h2>
                    <p className="text-[11px] text-stone-500 font-medium">
                      Student: <strong>{activeTicket.student_name}</strong> ({activeTicket.class_name}) • Parent: <strong>{activeTicket.parent_name}</strong> (📞 {activeTicket.parent_phone})
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {activeTicket.status !== "Resolved" && activeTicket.status !== "Closed" && (
                      <button
                        type="button"
                        onClick={handleMarkResolved}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> [ Resolve ]
                      </button>
                    )}
                  </div>
                </div>

                {/* Triage Department Re-assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
                  <div>
                    <span className="text-[10px] text-stone-500 font-bold block mb-1">Assigned Department:</span>
                    <select
                      value={assignedDept}
                      onChange={(e) => setAssignedDept(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl p-1.5 font-bold text-stone-900 text-xs"
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-end gap-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-stone-500 font-bold block mb-1">Action Taken Note:</span>
                      <input
                        type="text"
                        placeholder="e.g. Route reviewed with driver"
                        value={actionTakenText}
                        onChange={(e) => setActionTakenText(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl p-1.5 text-xs font-semibold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleTriageUpdate}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-[11px] shrink-0"
                    >
                      Save Triage
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px]">
                {messages.map((m) => {
                  const isParent = m.sender_type === "Parent";
                  const isInternal = m.is_internal_note;

                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                        isInternal
                          ? "bg-amber-50 border border-amber-300 ml-6"
                          : isParent
                          ? "bg-stone-100 border border-stone-200 mr-6"
                          : "bg-purple-50 border border-purple-200 ml-6"
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span className={`text-[11px] flex items-center gap-1 ${
                          isInternal ? "text-amber-900" : isParent ? "text-stone-800" : "text-purple-900"
                        }`}>
                          {isInternal && <Lock className="w-3 h-3 text-amber-700" />}
                          {m.sender_name} ({m.sender_role})
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-stone-700 leading-relaxed">{m.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Composer */}
              <form onSubmit={handleSendMessage} className="space-y-2 border-t border-stone-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 text-[11px]">Compose Reply:</span>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="w-3.5 h-3.5 accent-amber-600 rounded"
                    />
                    <span>🔒 Staff Internal Note (Hidden from Parent)</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    required
                    placeholder={isInternalNote ? "Write private staff investigation note..." : "Write message visible to parent..."}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-stone-400">
              <Headphones className="w-12 h-12 stroke-1" />
              <p className="font-bold">Select a ticket from the left queue to review triage &amp; messages.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
