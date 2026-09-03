"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, UserCheck, ShieldCheck, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import {
  getAvailableAssessmentSlotsAction,
  bookAssessmentSlotAction,
  getAssessmentsListAction
} from '@/app/actions/assessment-booking-actions';

export const ParentAssessmentBookingDesk: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);

  // Form input state for demo booking
  const [applicationNo, setApplicationNo] = useState('APP-2026-7983');
  const [candidateName, setCandidateName] = useState('Viraj Tyagi');
  const [classApplied, setClassApplied] = useState('Grade 4');
  const [parentPhone, setParentPhone] = useState('+91 9911102027');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [sRes, aRes] = await Promise.all([
        getAvailableAssessmentSlotsAction(),
        getAssessmentsListAction()
      ]);
      if (sRes.success) setSlots(sRes.slots);
      if (aRes.success) setAssessments(aRes.assessments);
    } finally {
      setIsLoading(false);
    }
  }

  const handleConfirmBooking = async (slotId: string) => {
    setIsBooking(true);
    setBookingNotice(null);
    try {
      const res = await bookAssessmentSlotAction({
        applicationNo,
        slotId,
        candidateName,
        classApplied,
        parentPhone
      });
      if (res.success) {
        setBookingNotice(`✓ Assessment booked for ${candidateName} on ${res.slotDate} at ${res.startTime}!`);
        setSelectedSlotId(null);
        await loadData();
      } else {
        alert(res.error || 'Failed to reserve slot');
      }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HUD Header */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>OpenApply-Style Self-Service Admissions Calendar</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900">Parent Assessment &amp; Interview Booking Desk</h2>
          <p className="text-xs text-stone-500 mt-0.5">Interactive slot reservation with capacity locks and instant WhatsApp confirmation.</p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Available Slots</span>
            <strong className="text-stone-900 font-bold text-sm">{slots.filter(s => s.status === 'AVAILABLE').length} Slots</strong>
          </div>
          <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Scheduled Today</span>
            <strong className="text-emerald-900 font-bold text-sm">{assessments.length} Bookings</strong>
          </div>
        </div>
      </div>

      {bookingNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{bookingNotice}</span>
        </div>
      )}

      {/* Grid: Slots Picker & Confirmed Bookings Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Slot Picker */}
        <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900">Available Interview &amp; Assessment Timeslots</h3>
            <span className="text-[11px] text-stone-400">Max 4 candidates per slot</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slots.map((s) => (
              <div
                key={s.id}
                className={`p-4 rounded-xl border transition-all ${
                  s.status === 'FULL'
                    ? 'bg-stone-50 border-stone-200 opacity-60'
                    : selectedSlotId === s.id
                    ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500'
                    : 'bg-white border-stone-200 hover:border-indigo-200 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                    {s.slotDate}
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${s.status === 'FULL' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {s.status === 'FULL' ? 'Slot Full' : `${s.availableSeats} seats left`}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{s.startTime} - {s.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                    <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                    <span>{s.interviewerName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{s.roomLocation}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleConfirmBooking(s.id)}
                  disabled={s.status === 'FULL' || isBooking}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold transition bg-stone-900 hover:bg-stone-800 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isBooking ? 'Locking Slot...' : 'Confirm Assessment Slot'}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}

            {slots.length === 0 && !isLoading && (
              <div className="col-span-full p-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
                No open assessment slots found.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Confirmed Ledger */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900">Scheduled Interviews</h3>
            <span className="text-[11px] font-bold text-indigo-600">{assessments.length} Total</span>
          </div>

          <div className="space-y-3">
            {assessments.map((a) => (
              <div key={a.id} className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-stone-900 font-bold block">{a.candidate_name}</strong>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                    {a.booking_status || 'CONFIRMED'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-stone-500">
                  <span>{a.class_applied}</span>
                  <span className="font-mono">{a.application_no}</span>
                </div>
                <div className="text-[10px] text-stone-600 pt-1 border-t border-stone-200/50">
                  📅 {a.slot_date} at {a.start_time} • {a.interviewer_name}
                </div>
              </div>
            ))}

            {assessments.length === 0 && (
              <div className="p-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
                No active bookings in ledger.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
