"use client";

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  Video,
  MapPin,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import {
  getPtmSlotsAction,
  bookPtmSlotAction,
  cancelPtmBookingAction,
  PtmSlotRecord
} from '@/app/actions/ptm-actions';

export default function PtmSchedulerPage() {
  const [slots, setSlots] = useState<PtmSlotRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<PtmSlotRecord | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Booking Form State
  const [studentName, setStudentName] = useState('Arjun Das');
  const [parentName, setParentName] = useState('Nitin Tyagi');
  const [parentPhone, setParentPhone] = useState('+91 98100 22334');
  const [agendaNotes, setAgendaNotes] = useState('Discuss Math Term 1 formative performance and sports participation');
  const [isBooking, setIsBooking] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const loadSlots = async () => {
    setIsLoading(true);
    const res = await getPtmSlotsAction();
    if (res.success && res.slots) {
      setSlots(res.slots);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setIsBooking(true);
    const res = await bookPtmSlotAction({
      slotId: selectedSlot.id,
      studentName,
      parentName,
      parentPhone,
      agendaNotes
    });

    if (res.success) {
      setNoticeMessage(res.message || 'Appointment confirmed!');
      setIsBookingModalOpen(false);
      await loadSlots();
    } else {
      alert(res.error);
    }
    setIsBooking(false);
  };

  const handleCancelSlot = async (slotId: string) => {
    if (!confirm('Cancel this PTM appointment?')) return;
    await cancelPtmBookingAction(slotId);
    await loadSlots();
  };

  const bookedCount = slots.filter(s => s.is_booked).length;
  const availableCount = slots.filter(s => !s.is_booked).length;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <VastuModuleBanner
        badgeText="PARENT PARTNERSHIP & CONFERENCES"
        title="Parent-Teacher Meeting (PTM) Appointment Desk"
        description="Self-service appointment scheduler with 15-minute conference windows, conflict-free booking, and automated calendar invitations."
      />

      {noticeMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{noticeMessage}</span>
          </div>
          <button onClick={() => setNoticeMessage(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-stone-400 block">Total Conference Slots</span>
            <strong className="text-2xl font-black text-stone-900">{slots.length}</strong>
          </div>
          <Calendar className="w-8 h-8 text-amber-500/40" />
        </Card>

        <Card className="p-4 border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-stone-400 block">Available Open Slots</span>
            <strong className="text-2xl font-black text-emerald-700">{availableCount}</strong>
          </div>
          <Clock className="w-8 h-8 text-emerald-500/40" />
        </Card>

        <Card className="p-4 border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-stone-400 block">Confirmed Reservations</span>
            <strong className="text-2xl font-black text-indigo-700">{bookedCount}</strong>
          </div>
          <UserCheck className="w-8 h-8 text-indigo-500/40" />
        </Card>
      </div>

      {/* Slots List / Grid */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" /> Scheduled PTM Conference Windows
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSlots}
            disabled={isLoading}
            className="text-xs font-semibold gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {slots.map((s) => (
            <div
              key={s.id}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                s.is_booked
                  ? 'bg-stone-50 border-stone-200 text-stone-700'
                  : 'bg-amber-50/40 border-amber-200/80 hover:border-amber-400 text-stone-900 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-xs font-black text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md">
                    {s.time_slot}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      s.is_booked
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {s.is_booked ? 'Booked' : 'Available'}
                  </span>
                </div>

                <div className="mt-2 space-y-0.5">
                  <strong className="text-xs text-stone-900 block">{s.teacher_name}</strong>
                  <span className="text-[11px] text-stone-500 block">{s.class_name} • In-Person Room 104</span>
                </div>

                {s.is_booked && (
                  <div className="mt-2 pt-2 border-t border-stone-200/60 text-[11px] space-y-0.5">
                    <p className="font-semibold text-stone-800">
                      Child: <span className="font-bold">{s.student_name}</span>
                    </p>
                    <p className="text-stone-500 text-[10px]">
                      Guardian: {s.parent_name} ({s.parent_phone})
                    </p>
                    {s.agenda_notes && (
                      <p className="text-stone-600 italic text-[10px] truncate">
                        "{s.agenda_notes}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-stone-200/40 flex justify-end">
                {s.is_booked ? (
                  <button
                    onClick={() => handleCancelSlot(s.id)}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedSlot(s);
                      setIsBookingModalOpen(true);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Reserve Slot
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Modal */}
      {isBookingModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Confirm PTM Appointment
                </h3>
                <p className="text-[11px] text-stone-400">
                  {selectedSlot.teacher_name} ({selectedSlot.time_slot})
                </p>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookSlot} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Student Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required
                  className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Parent Mobile (for SMS/WhatsApp Confirmation)</label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  required
                  className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Meeting Discussion Points / Agenda</label>
                <textarea
                  rows={2}
                  value={agendaNotes}
                  onChange={(e) => setAgendaNotes(e.target.value)}
                  className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBookingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isBooking}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  {isBooking ? 'Locking Slot...' : 'Confirm Reservation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
