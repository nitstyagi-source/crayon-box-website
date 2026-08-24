"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare, CheckCircle2, Clock, Plus,
  RefreshCw, AlertCircle, Sparkles, Filter, X, Send
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DualFileUpload } from '@/components/ui/DualFileUpload';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getHelpdeskTicketsAction,
  createHelpdeskTicketAction,
  resolveHelpdeskTicketAction
} from '@/app/actions/helpdesk-procurement-actions';

export default function HelpdeskGrievancePage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [tickets, setTickets] = useState<any[]>([]);
  const [counts, setCounts] = useState({ totalTickets: 0, openTickets: 0, resolvedTickets: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // New Ticket Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [studentInput, setStudentInput] = useState('CBS-2026-0001');
  const [category, setCategory] = useState('TRANSPORT');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dept, setDept] = useState('Transport Operations');
  const [attachment, setAttachment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolve Modal State
  const [resolveTicket, setResolveTicket] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
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

  // Handle New Ticket Submit
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
      setSubject('');
      setDescription('');
      fetchTickets();
    } else {
      alert("Error: " + res.error);
    }
  };

  // Handle Resolve Submit
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
      setResolutionNotes('');
      fetchTickets();
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Parent & Community Grievance Redressal
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-indigo-400" />
            Helpdesk Tickets & Grievance Redressal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            SLA-tracked parent inquiries across transport, academic progress, and fee billing with automated resolution notes.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsNewModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg shadow-indigo-600/20"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            🎫 New Grievance Ticket
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchTickets}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Tickets
          </Button>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Logged Tickets</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{counts.totalTickets}</span>
          <span className="text-[11px] text-slate-500 font-semibold">All Categories</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Open & In-Progress</span>
          <span className="text-3xl font-black text-amber-600 mt-1 block">{counts.openTickets}</span>
          <span className="text-[11px] text-amber-700 font-bold">Within 24h SLA Target</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Resolved & Closed</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{counts.resolvedTickets}</span>
          <span className="text-[11px] text-emerald-700 font-bold">Parent Sign-off Confirmed</span>
        </div>
      </div>

      {/* 🌟 TICKETS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Active Grievance & Helpdesk Register ({tickets.length})
            </h3>
            <p className="text-xs text-slate-400">
              Assigned department routing with priority escalation matrix.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">Ticket # & Category</th>
                <th className="py-3 px-4">Student & Parent</th>
                <th className="py-3 px-4">Subject & Description</th>
                <th className="py-3 px-4">Assigned Department</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <span className="block">{t.ticket_number}</span>
                    <span className="text-[10px] font-bold uppercase text-indigo-600">{t.category}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block font-bold">{t.student_name}</strong>
                    <span className="text-[10px] text-slate-400">{t.class_name} • Parent: {t.parent_name}</span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <strong className="text-slate-900 block truncate font-bold">{t.subject}</strong>
                    <p className="text-[11px] text-slate-500 truncate">{t.description}</p>
                    {t.resolution_notes && (
                      <span className="text-[10px] text-emerald-700 font-medium block mt-1">✓ {t.resolution_notes}</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {t.assigned_department}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      t.priority === 'HIGH' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                      t.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {t.priority}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {t.status !== 'RESOLVED' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setResolveTicket(t)}
                        className="text-[11px] py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Resolve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌟 NEW TICKET MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Create Helpdesk Grievance Ticket</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Admission No / Name</label>
                  <input
                    type="text"
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    placeholder="e.g. CBS-2026-0001"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grievance Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="TRANSPORT">Transport Operations</option>
                    <option value="FINANCE">Finance & Fee Billing</option>
                    <option value="ACADEMICS">Academic Progress & Homework</option>
                    <option value="INFRASTRUCTURE">Campus Facilities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject / Summary</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  placeholder="e.g. Bus stop pickup timing clarification"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none"
                  placeholder="Provide precise details of the parent request or grievance..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Department</label>
                  <input
                    type="text"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Urgent)</option>
                  </select>
                </div>
              </div>

              {/* Supporting Document / Fee Receipt / Photo */}
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

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsNewModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  Create Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 RESOLVE TICKET MODAL */}
      {resolveTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Resolve Ticket
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{resolveTicket.ticket_number}</h3>
              </div>
              <button onClick={() => setResolveTicket(null)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block font-bold">{resolveTicket.subject}</strong>
                <p className="text-slate-500 mt-1">{resolveTicket.description}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Resolution Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none font-medium"
                  placeholder="State the corrective action taken to resolve this parent ticket..."
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setResolveTicket(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isResolving} className="bg-emerald-600 hover:bg-emerald-500 text-white">
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
