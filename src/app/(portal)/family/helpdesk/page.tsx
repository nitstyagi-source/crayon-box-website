"use client";

import { useState, useEffect } from "react";
import { useSiblingContext } from "@/components/providers/SiblingProvider";
import { 
  Headphones, Plus, Search, CheckCircle2, Clock, 
  AlertCircle, MessageSquare, Send, Star, ShieldCheck, 
  Building2, PhoneCall, ChevronRight, X
} from "lucide-react";
import { 
  getHelpdeskTickets, 
  createHelpdeskTicket, 
  getTicketDetailsWithMessages, 
  addTicketMessage, 
  submitParentSatisfactionRating 
} from "@/app/actions/helpdesk";

const CATEGORIES = [
  "Transport",
  "Fees",
  "Academics",
  "Teacher",
  "Food/Canteen",
  "Medical",
  "Infrastructure",
  "Housekeeping",
  "Security",
  "ERP/App",
  "Uniform",
  "Books/Stationery",
  "Administration",
  "Other"
];

export default function ParentHelpdeskPortal() {
  const { activeSibling } = useSiblingContext();

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Ticket Modal State
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    category: "Transport",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    subject: "",
    description: "",
    preferredContactMethod: "App Notification"
  });

  // Reply Composer State
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  // CSAT Rating State
  const [rating, setRating] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    loadMyTickets();
  }, [activeSibling]);

  async function loadMyTickets() {
    setIsLoading(true);
    try {
      const res = await getHelpdeskTickets({
        studentId: activeSibling?.id
      });
      if (res.success && res.data) {
        setTickets(res.data);
      }
    } catch (e) {
      console.error("Error loading parent tickets:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function openTicketDetail(ticket: any) {
    setSelectedTicket(ticket);
    const res = await getTicketDetailsWithMessages(ticket.id, true); // true = parent view, filters internal notes
    if (res.success && res.data) {
      setTicketMessages(res.data.messages);
    }
  }

  // Handle Raise Ticket Submit
  async function handleRaiseTicketSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTicketForm.subject || !newTicketForm.description) return;

    setIsSubmitting(true);
    try {
      const studentName = activeSibling ? `${activeSibling.firstName} Sharma` : "Aarav Sharma";
      const className = activeSibling?.grade || "Grade 5-A";

      const res = await createHelpdeskTicket({
        studentId: activeSibling?.id,
        studentName,
        className,
        parentName: "Nitin Tyagi (Parent)",
        parentPhone: "+91 98711 22334",
        parentEmail: "nitin.tyagi@example.com",
        ...newTicketForm
      });

      if (res.success) {
        alert(res.message);
        setIsRaiseModalOpen(false);
        setNewTicketForm({
          category: "Transport",
          priority: "Medium",
          subject: "",
          description: "",
          preferredContactMethod: "App Notification"
        });
        loadMyTickets();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Send Parent Reply
  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setIsSendingReply(true);
    try {
      const res = await addTicketMessage({
        ticketId: selectedTicket.id,
        senderType: "Parent",
        senderName: "Nitin Tyagi",
        senderRole: "Parent",
        message: replyText.trim(),
        isInternalNote: false
      });

      if (res.success) {
        setReplyText("");
        openTicketDetail(selectedTicket);
      }
    } finally {
      setIsSendingReply(false);
    }
  }

  // Handle Submit Satisfaction Rating
  async function handleRatingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsSubmittingRating(true);
    try {
      const res = await submitParentSatisfactionRating({
        ticketId: selectedTicket.id,
        rating,
        feedback: ratingFeedback
      });

      if (res.success) {
        alert(res.message);
        loadMyTickets();
        setSelectedTicket(null);
      }
    } finally {
      setIsSubmittingRating(false);
    }
  }

  const childName = activeSibling ? `${activeSibling.firstName} Sharma` : "Aarav Sharma";
  const childGrade = activeSibling?.grade || "Grade 5-A";

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl font-black shrink-0">
            🎧
          </div>
          <div>
            <span className="bg-purple-50 text-purple-900 font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded">
              Parent Support &amp; Grievance Redressal
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
              Help Desk &amp; Requests
            </h1>
            <p className="text-xs text-stone-500 font-medium">
              Submit complaints, inquiries, or service requests for <strong className="text-stone-800">{childName}</strong> ({childGrade}).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsRaiseModalOpen(true)}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> [ + Raise New Complaint / Query ]
        </button>
      </div>

      {/* Tickets List View */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
          <h2 className="text-base font-black text-stone-900">My Support Tickets</h2>
          <span className="text-[11px] font-mono text-purple-800 font-bold bg-purple-50 px-2.5 py-1 rounded-xl">
            {tickets.length} Records
          </span>
        </div>

        <div className="space-y-3">
          {(tickets.length ? tickets : [
            { id: "t1", ticket_number: "TKT-2026-00458", category: "Transport", subject: "Morning Bus Route 05 delay at Burari Chowk", status: "In Progress", priority: "High", assigned_department: "Transport Manager", created_at: new Date().toISOString() },
            { id: "t2", ticket_number: "TKT-2026-00421", category: "Fees", subject: "Term 2 Fee Receipt duplicate copy request", status: "Resolved", priority: "Medium", assigned_department: "Accounts", created_at: new Date().toISOString() }
          ]).map((t: any) => (
            <div
              key={t.id}
              onClick={() => openTicketDetail(t)}
              className="p-4 bg-stone-50/80 hover:bg-stone-100 rounded-2xl border border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-purple-700 text-[11px]">{t.ticket_number}</span>
                  <span className="text-stone-300">•</span>
                  <span className="bg-white border border-stone-200 text-stone-700 text-[10px] font-bold px-2 py-0.2 rounded">
                    {t.category}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Assigned: <strong>{t.assigned_department}</strong>
                  </span>
                </div>
                <strong className="text-stone-900 font-bold text-sm block mt-1">{t.subject}</strong>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${
                  t.status === "Resolved" || t.status === "Closed" ? "bg-emerald-100 text-emerald-900" :
                  t.status === "In Progress" ? "bg-amber-100 text-amber-900" : "bg-blue-100 text-blue-900"
                }`}>
                  {t.status}
                </span>
                <span className="text-stone-400 font-bold text-xs flex items-center gap-0.5">
                  View <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 RAISE NEW COMPLAINT MODAL */}
      {/* ========================================================================= */}
      {isRaiseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-700 font-bold block">
                  Crayon Box Support Center
                </span>
                <h3 className="text-base font-black text-stone-900 mt-0.5">
                  Raise Complaint / Request for {childName}
                </h3>
              </div>
              <button onClick={() => setIsRaiseModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <form onSubmit={handleRaiseTicketSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Priority *</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="Low">🟢 Low — General Query</option>
                    <option value="Medium">🟡 Medium — Action Needed</option>
                    <option value="High">🟠 High — Urgent</option>
                    <option value="Critical">🔴 Critical — Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bus delay on morning route 5"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description of Complaint / Request *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Please describe the issue in detail..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Preferred Contact Mode</label>
                <select
                  value={newTicketForm.preferredContactMethod}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, preferredContactMethod: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                >
                  <option value="App Notification">🔔 App Notification</option>
                  <option value="WhatsApp">💬 WhatsApp</option>
                  <option value="Phone Call">📞 Phone Call</option>
                  <option value="Email">✉️ Email</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsRaiseModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 TICKET CONVERSATION & RESOLUTION MODAL */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs flex flex-col justify-between">
            
            <div>
              <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-purple-700 text-xs">{selectedTicket.ticket_number}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                      selectedTicket.status === "Resolved" || selectedTicket.status === "Closed" ? "bg-emerald-100 text-emerald-900" :
                      selectedTicket.status === "In Progress" ? "bg-amber-100 text-amber-900" : "bg-blue-100 text-blue-900"
                    }`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-stone-900 mt-1">{selectedTicket.subject}</h3>
                  <span className="text-[11px] text-stone-500">
                    Category: <strong>{selectedTicket.category}</strong> • Handled By: <strong>{selectedTicket.assigned_department}</strong>
                  </span>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="text-stone-400 hover:text-stone-800">✕</button>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 py-4 max-h-[280px] overflow-y-auto pr-1">
                {ticketMessages.map((m) => {
                  const isParent = m.sender_type === "Parent";
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                        isParent ? "bg-purple-50 border border-purple-200 ml-6" : "bg-stone-100 border border-stone-200 mr-6"
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span className={isParent ? "text-purple-900" : "text-stone-900"}>
                          {isParent ? "You (Parent)" : `${m.sender_name} (${m.sender_role})`}
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

              {/* Resolution / Feedback Widget if Resolved */}
              {(selectedTicket.status === "Resolved" || selectedTicket.status === "Closed") && (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-3 mt-2">
                  <div className="flex items-center gap-1.5 text-emerald-950 font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Issue Resolved by School Management</span>
                  </div>
                  {selectedTicket.resolution_notes && (
                    <p className="text-[11px] text-emerald-900 bg-white p-2.5 rounded-xl border border-emerald-200">
                      <strong>Resolution Note:</strong> {selectedTicket.resolution_notes}
                    </p>
                  )}

                  {!selectedTicket.satisfaction_rating && (
                    <form onSubmit={handleRatingSubmit} className="space-y-2 pt-1">
                      <label className="font-bold text-stone-800 block text-[11px]">Was your issue resolved to your satisfaction?</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-xl transition ${star <= rating ? "text-amber-400" : "text-stone-300"}`}
                          >
                            ★
                          </button>
                        ))}
                        <span className="font-mono font-bold text-stone-600 text-xs ml-2">{rating}/5 Stars</span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Optional feedback comment..."
                          value={ratingFeedback}
                          onChange={(e) => setRatingFeedback(e.target.value)}
                          className="flex-1 bg-white border border-emerald-200 rounded-xl p-2 text-xs"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingRating}
                          className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                        >
                          Submit Rating
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Parent Reply Input if not Closed */}
            {selectedTicket.status !== "Closed" && (
              <form onSubmit={handleSendReply} className="flex gap-2 border-t border-stone-100 pt-3">
                <input
                  type="text"
                  required
                  placeholder="Type a message to the school department..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  type="submit"
                  disabled={isSendingReply}
                  className="px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
