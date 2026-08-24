"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, Users, UserCheck, CheckCircle2,
  AlertCircle, Download, Plus, Filter, ArrowRight,
  RefreshCw, MapPin, Phone, MessageSquare, Sparkles, X, Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getPtmDashboardAction,
  bookPtmSlotAction,
  recordPtmConsultationNotesAction
} from '@/app/actions/ptm-actions';

export default function PtmSchedulePage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [events, setEvents] = useState<any[]>([]);
  const [currentEvent, setCurrentEvent] = useState<any | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    totalSlots: 0,
    bookedSlots: 0,
    availableSlots: 0,
    bookingRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState('ALL');

  // Book Slot Modal State
  const [bookSlot, setBookSlot] = useState<any | null>(null);
  const [studentInput, setStudentInput] = useState('CBS-2026-0001');
  const [parentName, setParentName] = useState('Pooja Verma');
  const [parentPhone, setParentPhone] = useState('+91 98112 34567');
  const [isBooking, setIsBooking] = useState(false);

  // Consultation Notes Modal State
  const [notesSlot, setNotesSlot] = useState<any | null>(null);
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const fetchPtm = async () => {
    setIsLoading(true);
    const res = await getPtmDashboardAction();
    if (res.success) {
      setEvents(res.events || []);
      setCurrentEvent(res.currentEvent || null);
      setSlots(res.slots || []);
      setCounts(res.counts || { totalSlots: 0, bookedSlots: 0, availableSlots: 0, bookingRate: 0 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPtm();
  }, []);

  // Handle Book Submit
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookSlot || !studentInput.trim() || !parentName.trim()) return;

    setIsBooking(true);
    const res = await bookPtmSlotAction({
      slotId: bookSlot.id,
      studentAdmissionNoOrName: studentInput,
      parentName,
      parentPhone
    });
    setIsBooking(false);

    if (res.success) {
      setBookSlot(null);
      fetchPtm();
    } else {
      alert("Error booking: " + res.error);
    }
  };

  // Handle Notes Submit
  const handleNotesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesSlot || !discussionNotes.trim()) return;

    setIsSavingNotes(true);
    const res = await recordPtmConsultationNotesAction({
      slotId: notesSlot.id,
      discussionNotes,
      followUpAction: followUp
    });
    setIsSavingNotes(false);

    if (res.success) {
      setNotesSlot(null);
      fetchPtm();
    } else {
      alert("Error: " + res.error);
    }
  };

  // Unique Teachers for filter
  const uniqueTeachers = Array.from(new Set(slots.map(s => s.teacher_name)));

  const filteredSlots = selectedTeacherFilter === 'ALL'
    ? slots
    : slots.filter(s => s.teacher_name === selectedTeacherFilter);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              1-on-1 Parent Consultation Schedule
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-400" />
            Parent-Teacher Meeting (PTM) Scheduler
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            15-minute 1-on-1 parent slots, room allocations, consultation discussion notes, and remedial action tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchPtm}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Schedule
          </Button>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Consultation Slots</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{counts.totalSlots}</span>
          <span className="text-[11px] text-slate-500 font-semibold">15-Min Slots Configured</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Booked Appointments</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{counts.bookedSlots}</span>
          <span className="text-[11px] text-emerald-700 font-bold">Parents Confirmed</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Available Slots</span>
          <span className="text-3xl font-black text-indigo-600 mt-1 block">{counts.availableSlots}</span>
          <span className="text-[11px] text-indigo-700 font-bold">Open for Parent Booking</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Booking Capacity</span>
          <span className="text-3xl font-black text-amber-600 mt-1 block">{counts.bookingRate}%</span>
          <span className="text-[11px] text-amber-700 font-bold">Overall Participation</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter by Teacher:</span>
          <select
            value={selectedTeacherFilter}
            onChange={(e) => setSelectedTeacherFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
          >
            <option value="ALL">All Faculty Members ({slots.length} Slots)</option>
            {uniqueTeachers.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {currentEvent && (
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Event: <strong>{currentEvent.title}</strong> ({currentEvent.event_date})</span>
          </div>
        )}
      </div>

      {/* 🌟 SLOTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSlots.map((slot) => {
          const isBooked = slot.booking_status === 'BOOKED' || slot.booking_status === 'COMPLETED';
          const isCompleted = slot.booking_status === 'COMPLETED';

          return (
            <div
              key={slot.id}
              className={`rounded-3xl border p-5 space-y-4 flex flex-col justify-between transition ${
                isCompleted ? 'bg-emerald-50/50 border-emerald-200' :
                isBooked ? 'bg-white border-indigo-200 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    {slot.slot_time}
                  </span>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    isCompleted ? 'bg-emerald-100 text-emerald-800' :
                    isBooked ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {slot.booking_status}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{slot.teacher_name}</h4>
                  <span className="text-[11px] text-slate-500 font-medium">{slot.subject_or_class} • {slot.room_number}</span>
                </div>

                {isBooked ? (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Student:</span>
                      <strong className="text-slate-900 font-bold">{slot.student_name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Parent:</span>
                      <span className="text-slate-700 font-medium">{slot.parent_name}</span>
                    </div>

                    {slot.discussion_notes && (
                      <div className="pt-2 mt-2 border-t border-slate-200 text-[11px] text-slate-600 italic">
                        "{slot.discussion_notes}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-white/70 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400 font-medium">
                    Available for Parent Booking
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {isBooked ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNotesSlot(slot);
                      setDiscussionNotes(slot.discussion_notes || '');
                      setFollowUp(slot.follow_up_action || '');
                    }}
                    className="w-full text-xs hover:bg-emerald-50 hover:text-emerald-900 border-slate-200"
                    leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                  >
                    {isCompleted ? 'Edit Notes' : '📝 Record Notes'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setBookSlot(slot);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Book for Parent
                  </Button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* 🌟 BOOK SLOT MODAL */}
      {bookSlot && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Book PTM Slot
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{bookSlot.slot_time}</h3>
                <p className="text-xs text-slate-500 font-medium">With {bookSlot.teacher_name} ({bookSlot.room_number})</p>
              </div>
              <button onClick={() => setBookSlot(null)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
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
                <label className="font-bold text-slate-700 block mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent Mobile Contact</label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setBookSlot(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isBooking} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  Confirm Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 CONSULTATION NOTES MODAL */}
      {notesSlot && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Consultation Dossier
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{notesSlot.student_name}</h3>
                <p className="text-xs text-slate-500">Teacher: {notesSlot.teacher_name} • {notesSlot.slot_time}</p>
              </div>
              <button onClick={() => setNotesSlot(null)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNotesSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Meeting Discussion Points & Academic Feedback</label>
                <textarea
                  value={discussionNotes}
                  onChange={(e) => setDiscussionNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none"
                  placeholder="Record summary of academic performance, behavior, and parent feedback..."
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Follow-Up / Remedial Action Plan</label>
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  placeholder="e.g. Remedial worksheets assigned, next review in 3 weeks..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setNotesSlot(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSavingNotes} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Save Consultation Notes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
