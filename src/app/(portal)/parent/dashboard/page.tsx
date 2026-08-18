"use client";

import { useSiblingContext } from "@/components/providers/SiblingProvider";
import { CheckCircle2, Clock, Calendar as CalendarIcon, AlertCircle, FileText, ChevronRight, Bus } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function ParentDashboard() {
  const { activeSibling } = useSiblingContext();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Good Morning, Mr. Sharma</h1>
        <p className="text-sm text-slate-500">Here is the daily overview for <span className="font-bold text-primary">{activeSibling?.firstName}</span>.</p>
      </div>

      {/* The Daily Strip (Top Row Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Attendance Ring Chart (Mock) */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Attendance</p>
            <p className="text-2xl font-black text-slate-900">94<span className="text-lg text-slate-400">%</span></p>
            <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Present Today</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-primary" strokeDasharray="94, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
          </div>
        </motion.div>

        {/* Next Fee Due */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Next Fee Due</p>
              <p className="text-2xl font-black text-slate-900">₹24,500</p>
              <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Due in 5 days</p>
            </div>
          </div>
          <button className="mt-4 w-full bg-slate-900 text-white text-sm font-bold py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Pay Now
          </button>
        </motion.div>

        {/* Transport Status */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">Live Transport <span className="relative flex h-2 w-2 ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span></p>
            <p className="text-lg font-bold text-slate-900 leading-tight mt-2">Bus 4 is arriving at your stop in 10 mins.</p>
          </div>
          <button className="mt-4 w-full bg-blue-50 text-primary text-sm font-bold py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
             <Bus className="w-4 h-4" /> Track on Map
          </button>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Main Column: Circulars & Noticeboard */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Noticeboard</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
            {[
              { title: "Quarterly Assessment Schedule Released", date: "Today", urgent: true, icon: AlertCircle },
              { title: "Parent-Teacher Meeting (PTM) for Term 1", date: "Yesterday", urgent: false, icon: CalendarIcon },
              { title: "Winter Uniform Guidelines Updated", date: "Oct 12", urgent: false, icon: FileText }
            ].map((notice, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group border-b border-slate-100 last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notice.urgent ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-primary'}`}>
                  <notice.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-bold ${notice.urgent ? 'text-slate-900' : 'text-slate-800'} mb-1`}>{notice.title}</h3>
                  <p className="text-xs text-slate-500">{notice.date}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Side Column: Today's Timetable */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Today's Classes</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
              {[
                { time: "08:30 AM", subject: "Mathematics", teacher: "Ms. Priya Desai", status: "past" },
                { time: "09:30 AM", subject: "English Lit.", teacher: "Mr. Amit Patel", status: "active" },
                { time: "10:30 AM", subject: "Science Lab", teacher: "Mr. Rahul Verma", status: "upcoming" },
                { time: "11:30 AM", subject: "Physical Ed.", teacher: "Mr. John Doe", status: "upcoming" }
              ].map((cls, idx) => (
                <div key={idx} className="relative pl-6">
                  <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${cls.status === 'active' ? 'bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]' : cls.status === 'past' ? 'bg-slate-300' : 'bg-slate-200'}`}></span>
                  <p className="text-xs font-bold text-slate-400 mb-0.5">{cls.time}</p>
                  <p className={`text-sm font-bold ${cls.status === 'active' ? 'text-primary' : 'text-slate-800'}`}>{cls.subject}</p>
                  <p className="text-xs text-slate-500">{cls.teacher}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
