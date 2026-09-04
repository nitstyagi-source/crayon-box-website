"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare, CheckCircle2, Clock, Plus,
  RefreshCw, AlertCircle, Sparkles, Filter, X, Send, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DualFileUpload } from "@/components/ui/DualFileUpload";
import { useInstitution } from "@/components/providers/InstitutionContext";
import {
  getHelpdeskTicketsAction,
  createHelpdeskTicketAction,
  resolveHelpdeskTicketAction
} from "@/app/actions/helpdesk-procurement-actions";

export function ParentGrievanceDesk() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [tickets, setTickets] = useState<any[]>([]);
  const [counts, setCounts] = useState({ totalTickets: 0, openTickets: 0, resolvedTickets: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // New Ticket Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [studentInput, setStudentInput] = useState("CBS-2026-0001");
  const [category, setCategory] = useState("TRANSPORT");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dept, setDept] = useState("Transport Operations");
  const [attachment, setAttachment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolve Modal State
  const [resolveTicket, setResolveTicket] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    const res = await getHelpdeskTicketsAction();
    if (res.success) {
      setTickets(res.tickets || []);
      setCounts(res.counts || { totalTickets: 0, openTickets: 0, resolvedTickets: 0 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const res = await createHelpdeskTicketAction({
      studentAdmissionNoOrName: studentInput,
      category,
      subject,
      description,
      priority,
      assignedDept: dept
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsNewModalOpen(false);
      setSubject("");
      setDescription("");
      fetchTickets();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTicket || !resolutionNotes.trim()) return;

    setIsResolving(true);
    const res = await resolveHelpdeskTicketAction({
      ticketId: resolveTicket.id,
      resolutionNotes
    });
    setIsResolving(false);

    if (res.success) {
      setResolveTicket(null);
      setResolutionNotes("");
      fetchTickets();
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Telematics Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Total Logged Tickets</span>
          <span className="text-3xl font-black text-stone-900 mt-1 block">{counts.totalTickets}</span>
          <span className="text-[11px] text-stone-500 font-semibold">All Categories</span>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Open & In-Progress</span>
          <span className="text-3xl font-black text-amber-600 mt-1 block">{counts.openTickets}</span>
          <span className="text-[11px] text-amber-700 font-bold">Within 24h SLA Target</span>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Resolved & Closed</span>
          <span className="text-3xl font-black text-emerald-700 mt-1 block">{counts.resolvedTickets}</span>
          <span className="text-[11px] text-emerald-600 font-bold">Parent Sign-off Confirmed</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFC8]">
        <div>
          <h3 className="font-extrabold text-stone-900 text-sm">
            Active Grievance & Helpdesk Register ({tickets.length})
          </h3>
          <p className="text-xs text-stone-500">
            Statutory grievance redressal with 24h response and 72h resolution deadline tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            className="bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white font-bold shadow-xs text-xs"
          >
            <Plus className="w-4 h-4 mr-1" /> New Grievance Ticket
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchTickets}
            isLoading={isLoading}
            className="bg-white text-stone-700 border-[#E8DFC8] hover:bg-[#F3EDE2] text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/70 text-[10px] font-bold uppercase tracking-wider text-stone-600 border-b border-[#E8DFC8]">
                <th className="py-3 px-4">Ticket # & Category</th>
                <th className="py-3 px-4">Student & Parent</th>
                <th className="py-3 px-4">Subject & Description</th>
                <th className="py-3 px-4">Assigned Department</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-white/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                    <span className="block">{t.ticket_number}</span>
                    <span className="text-[10px] font-bold uppercase text-[#92400E]">{t.category}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="text-stone-900 block font-bold">{t.student_name}</strong>
                    <span className="text-[10px] text-stone-500">{t.class_name} • Parent: {t.parent_name}</span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <strong className="text-stone-900 block truncate font-bold">{t.subject}</strong>
                    <p className="text-[11px] text-stone-600 truncate">{t.description}</p>
                    {t.resolution_notes && (
                      <span className="text-[10px] text-emerald-700 font-medium block mt-1">✓ {t.resolution_notes}</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-stone-700">
                    {t.assigned_department}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      t.priority === "HIGH" ? "bg-rose-100 text-rose-900 border border-rose-200" :
                      t.priority === "MEDIUM" ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-700"
                    }`}>
                      {t.priority}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      t.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {t.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {t.status !== "RESOLVED" && (
                      <Button
                        size="sm"
                        onClick={() => setResolveTicket(t)}
                        className="text-[11px] py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW TICKET MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] text-stone-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <h3 className="text-lg font-black text-stone-900">Create Helpdesk Grievance Ticket</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Student Admission No / Name</label>
                  <input
                    type="text"
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                    placeholder="e.g. CBS-2026-0001"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Grievance Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="TRANSPORT">Transport Operations</option>
                    <option value="FINANCE">Finance & Fee Billing</option>
                    <option value="ACADEMICS">Academic Progress & Homework</option>
                    <option value="INFRASTRUCTURE">Campus Facilities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Subject / Summary</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  placeholder="e.g. Bus stop pickup timing clarification"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#D97706]"
                  placeholder="Provide precise details of the parent request or grievance..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Assigned Department</label>
                  <input
                    type="text"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D97706]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <DualFileUpload
                  label="Supporting Attachment / Photo / Bill"
                  helperText="Upload image or PDF document or paste a direct file link"
                  value={attachment}
                  onChange={(val) => setAttachment(val)}
                  accept="image/*,.pdf"
                  placeholder="https://example.com/receipt.pdf or upload document"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8DFC8]">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsNewModalOpen(false)} className="bg-white border-[#E8DFC8] text-stone-700">
                  Cancel
                </Button>
                <Button size="sm" type="submit" isLoading={isSubmitting} className="bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold">
                  Create Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE TICKET MODAL */}
      {resolveTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] text-stone-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Resolve Ticket
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">{resolveTicket.ticket_number}</h3>
              </div>
              <button onClick={() => setResolveTicket(null)} className="p-1 text-stone-400 hover:text-stone-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8]">
                <strong className="text-stone-900 block font-bold">{resolveTicket.subject}</strong>
                <p className="text-stone-600 mt-1">{resolveTicket.description}</p>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Official Resolution Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl p-3 text-stone-900 focus:outline-none focus:border-[#D97706] font-medium"
                  placeholder="State the corrective action taken to resolve this parent ticket..."
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8DFC8]">
                <Button size="sm" variant="outline" type="button" onClick={() => setResolveTicket(null)} className="bg-white border-[#E8DFC8] text-stone-700">
                  Cancel
                </Button>
                <Button size="sm" type="submit" isLoading={isResolving} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold">
                  Mark as Resolved
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
