"use client";

import { useSiblingContext } from "@/components/providers/SiblingProvider";
import { MessageSquare, LifeBuoy, Plus, Search, CheckCircle2, Clock } from "lucide-react";

export default function HelpdeskHub() {
  const { activeSibling } = useSiblingContext();

  return (
    <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Communications & Helpdesk</h1>
        <p className="text-sm text-slate-500">Message teachers or raise operational tickets for <span className="font-bold text-primary">{activeSibling?.firstName}</span>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[500px]">
        
        {/* Left: Messaging (Teacher Comms) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Teacher Inbox</h2>
            <button className="w-8 h-8 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search messages..." className="w-full bg-slate-100 border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {[
              { name: "Ms. Priya Desai", sub: "Mathematics", msg: "Aarav did great on his fractions test today!", time: "10:42 AM", unread: true },
              { name: "Mr. Rahul Verma", sub: "Science", msg: "Please ensure the lab coat is sent tomorrow.", time: "Yesterday", unread: false },
              { name: "Ms. Neha Gupta", sub: "English", msg: "The reading assignment is attached.", time: "Mon", unread: false }
            ].map((msg, idx) => (
              <div key={idx} className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${msg.unread ? 'bg-blue-50/30' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm ${msg.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>{msg.name}</h3>
                  <span className={`text-[10px] ${msg.unread ? 'text-primary font-bold' : 'text-slate-400'}`}>{msg.time}</span>
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">{msg.sub}</p>
                <p className={`text-sm truncate ${msg.unread ? 'font-medium text-slate-800' : 'text-slate-500'}`}>{msg.msg}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Operational Ticketing System */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2"><LifeBuoy className="w-5 h-5 text-secondary" /> Support Tickets</h2>
            <button className="bg-secondary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-800 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Raise Ticket
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-slate-50/50">
            
            {/* Ticket 1: In Progress */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" /> In Progress
                  </span>
                  <span className="text-xs font-bold text-slate-400">#TK-8942</span>
                </div>
                <span className="text-xs text-slate-400">Oct 14</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Transport: Change of drop-off point</h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">We are moving to Sector 42 next week. Please change Aarav's bus route to Bus 4 accordingly.</p>
              
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500"><strong className="text-slate-700">Transport Manager replied:</strong> Request received. We are allocating the seat on Bus 4 and will confirm by EOD.</p>
              </div>
            </div>

            {/* Ticket 2: Resolved */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm opacity-75">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Resolved
                  </span>
                  <span className="text-xs font-bold text-slate-400">#TK-8120</span>
                </div>
                <span className="text-xs text-slate-400">Sep 28</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">IT Support: App Login Issue</h3>
              <p className="text-sm text-slate-600 line-clamp-1">I am unable to see the Q2 fee receipt in the app.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
