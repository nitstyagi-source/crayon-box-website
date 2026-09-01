"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Send,
  Users,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Phone,
  MessageSquare,
  Building2,
  CalendarCheck
} from "lucide-react";
import {
  getPtmSlotsListAction,
  bookPtmSlotAction,
  PtmSlotItem
} from "@/app/actions/ptm-scheduler-actions";

export default function DigitalPtmSchedulerPage() {
  const [selectedClass, setSelectedClass] = useState("Class 1-A");
  const [slots, setSlots] = useState<PtmSlotItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Booking Modal / Form
  const [selectedSlot, setSelectedSlot] = useState<PtmSlotItem | null>(null);
  const [studentName, setStudentName] = useState("Aarav Sharma");
  const [parentName, setParentName] = useState("Mr. Rajesh Sharma");
  const [parentPhone, setParentPhone] = useState("+919810081008");
  const [agendaNotes, setAgendaNotes] = useState("Discuss Mathematics speed, reading phonics & co-scholastic participation.");

  useEffect(() => {
    loadSlots();
  }, [selectedClass]);

  async function loadSlots() {
    setIsLoading(true);
    try {
      const res = await getPtmSlotsListAction(selectedClass);
      if (res.success) {
        setSlots(res.slots);
        setStats(res.stats);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBookSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;

    setIsProcessing(true);
    try {
      const res = await bookPtmSlotAction({
        slotId: selectedSlot.id,
        studentName,
        parentName,
        parentPhone,
        agendaNotes
      });

      if (res.success) {
        alert(res.message);
        setSelectedSlot(null);
        loadSlots();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            1-on-1 Parent Teacher Meeting Scheduler
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-emerald-400" />
            Digital PTM Slot Scheduler
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl">
            Streamlined 15-minute 1-on-1 parent appointment slots with automated WhatsApp confirmation dispatches and zero corridor waiting lines.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 text-xs">
          <div className="font-bold text-white">Target Class:</div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-emerald-900 border border-emerald-700 text-white font-bold rounded-xl px-3 py-1.5 focus:bg-emerald-800"
          >
            <option value="Class 1-A">Class 1-A</option>
            <option value="Class 2-A">Class 2-A</option>
            <option value="Class 3-A">Class 3-A</option>
            <option value="Class 4-A">Class 4-A</option>
            <option value="Class 5-A">Class 5-A</option>
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            Total 15-Min Slots
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats?.totalSlots || slots.length}
          </div>
          <div className="text-[10px] text-stone-500 font-bold">1-on-1 Schedule</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            Confirmed Booked Slots
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-600">
            {stats?.bookedSlots || 1}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">WhatsApp Confirmed</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            Available Open Slots
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-900">
            {stats?.availableSlots || (slots.length - 1)}
          </div>
          <div className="text-[10px] text-indigo-600 font-bold">Ready for Parent Booking</div>
        </div>
      </div>

      {/* Main Content Grid: Slot Grid + Booking Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Slot Matrix */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                {selectedClass} PTM Appointment Schedule
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Click on any open slot to assign or book for a parent.
              </p>
            </div>
            <button
              onClick={loadSlots}
              className="text-stone-400 hover:text-stone-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {slots.map((slot) => (
              <div
                key={slot.id}
                onClick={() => !slot.is_booked && setSelectedSlot(slot)}
                className={`p-4 rounded-2xl border transition ${
                  slot.is_booked
                    ? "bg-emerald-50/70 border-emerald-200"
                    : "bg-white border-stone-200 hover:border-emerald-400 hover:shadow-xs cursor-pointer"
                }`}
              >
                <div className="flex justify-between items-center pb-2 border-b border-stone-200/60">
                  <span className="font-mono font-black text-sm text-stone-900">{slot.time_slot}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    slot.is_booked ? "bg-emerald-200 text-emerald-950" : "bg-stone-100 text-stone-700"
                  }`}>
                    {slot.is_booked ? "BOOKED" : "AVAILABLE"}
                  </span>
                </div>

                {slot.is_booked ? (
                  <div className="pt-2 space-y-1">
                    <strong className="text-emerald-950 block">{slot.student_name}</strong>
                    <div className="text-[11px] text-stone-600">Parent: {slot.parent_name}</div>
                    <div className="text-[10px] font-mono text-stone-400">{slot.parent_phone}</div>
                    <div className="text-[10px] text-emerald-800 italic bg-white p-1.5 rounded-lg border border-emerald-100">
                      "{slot.agenda_notes}"
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 text-center text-stone-400 text-[11px] font-bold">
                    + Click to Reserve Slot
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Booking Form */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 self-start">
          <div className="border-b border-stone-200 pb-3">
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              1-Click Slot Reservation Desk
            </h4>
            <p className="text-[11px] text-stone-500">
              {selectedSlot ? `Booking Slot: ${selectedSlot.time_slot}` : "Select an available slot on the left"}
            </p>
          </div>

          {selectedSlot ? (
            <form onSubmit={handleBookSlot} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Student Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Parent Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Parent WhatsApp Phone</label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Discussion Agenda / Notes</label>
                <textarea
                  value={agendaNotes}
                  onChange={(e) => setAgendaNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 font-medium leading-relaxed focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Confirm Booking &amp; Send WhatsApp Notice
              </button>
            </form>
          ) : (
            <div className="p-8 text-center text-stone-400 text-xs font-bold space-y-2 border border-dashed border-stone-200 rounded-2xl">
              <Calendar className="w-8 h-8 mx-auto text-stone-300" />
              <div>Click on an available slot in the schedule to book an appointment.</div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
