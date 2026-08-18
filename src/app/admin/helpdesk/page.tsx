"use client";

import { useState } from "react";
import { Search, Filter, Reply, CheckCircle2, Clock, MoreVertical, Tag, Paperclip, Send } from "lucide-react";

export default function HelpdeskTriage() {
  const [activeTicketId, setActiveTicketId] = useState<string>("TK-8942");

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -m-6 bg-white">
      
      {/* Top Header */}
      <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Helpdesk Triage</h1>
          <p className="text-xs text-slate-500">Manage parent operational queries and internal routing.</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: Inbox List */}
        <div className="w-80 border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200 space-y-3">
            <div className="flex gap-2">
              <button className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-1.5 rounded-md hover:bg-slate-200">Open (12)</button>
              <button className="flex-1 bg-white border border-slate-200 text-slate-500 text-xs font-bold py-1.5 rounded-md hover:bg-slate-50">Resolved</button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search tickets..." className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {[
              { id: "TK-8942", name: "Rajesh Sharma", issue: "Change of drop-off point", time: "10:45 AM", status: "In Progress", color: "text-amber-600 bg-amber-50" },
              { id: "TK-8943", name: "Suman Roy", issue: "Fee receipt not downloading", time: "09:12 AM", status: "New", color: "text-red-600 bg-red-50" },
              { id: "TK-8940", name: "Vikram Gupta", issue: "Uniform size exchange", time: "Yesterday", status: "Open", color: "text-blue-600 bg-blue-50" }
            ].map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => setActiveTicketId(ticket.id)}
                className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${activeTicketId === ticket.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-900">{ticket.name}</span>
                  <span className="text-[10px] font-bold text-slate-400">{ticket.time}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-700 truncate mb-2">{ticket.issue}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-400">{ticket.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${ticket.color}`}>{ticket.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Thread View */}
        <div className="flex-1 flex flex-col bg-slate-50/30 min-w-0">
          
          {/* Thread Header */}
          <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-start shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">TK-8942</span>
                <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider text-amber-700 bg-amber-100 flex items-center gap-1"><Clock className="w-3 h-3" /> In Progress</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Transport: Change of drop-off point</h2>
              <p className="text-sm text-slate-500 mt-1">Reported by <span className="font-bold text-slate-700">Rajesh Sharma</span> (Parent of Aarav Sharma, Grade 4)</p>
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-sm">
                <Tag className="w-4 h-4" /> Route
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-transparent rounded-lg text-sm font-bold text-green-700 bg-green-100 hover:bg-green-200">
                <CheckCircle2 className="w-4 h-4" /> Resolve
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Parent Message */}
            <div className="flex gap-4 max-w-3xl">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">RS</div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-sm text-slate-900">Rajesh Sharma</span>
                  <span className="text-xs text-slate-400">10:45 AM</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Hi Team, <br/><br/>
                  We are moving to Sector 42 next week. Please change Aarav's bus route to Bus 4 accordingly starting from Monday. Do we need to pay any differential transport fee?
                </p>
              </div>
            </div>

            {/* Internal Note */}
            <div className="flex gap-4 max-w-3xl mx-auto w-full">
              <div className="w-full bg-amber-50 border border-amber-200 border-dashed rounded-xl p-4 relative">
                <div className="absolute -top-3 left-4 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 uppercase tracking-widest flex items-center gap-1">
                  Internal Routing
                </div>
                <div className="flex items-center justify-between mb-1 mt-1">
                  <span className="font-bold text-sm text-amber-900">Helpdesk Admin</span>
                  <span className="text-xs text-amber-700/60">11:10 AM</span>
                </div>
                <p className="text-sm text-amber-800">Assigned to <span className="font-bold underline decoration-amber-300">@Transport_Manager</span>. Please verify seat availability on Bus 4 for Sector 42.</p>
              </div>
            </div>

            {/* Staff Reply */}
            <div className="flex gap-4 max-w-3xl ml-auto">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tr-sm p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2 justify-end">
                  <span className="text-xs text-blue-400">11:45 AM</span>
                  <span className="font-bold text-sm text-blue-900">Transport Manager</span>
                </div>
                <p className="text-sm text-blue-800 leading-relaxed text-right">
                  Request received. We are allocating the seat on Bus 4. No differential fee is required as it falls under the same zone. I will confirm the exact pickup time by EOD.
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">TM</div>
            </div>

          </div>

          {/* Reply Box */}
          <div className="p-4 border-t border-slate-200 bg-white shrink-0">
            <div className="border border-slate-300 rounded-xl bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all overflow-hidden">
              <textarea 
                rows={3} 
                className="w-full bg-transparent border-none focus:ring-0 text-sm p-3 resize-none"
                placeholder="Type your reply to the parent..."
              ></textarea>
              <div className="flex justify-between items-center bg-slate-100 px-3 py-2 border-t border-slate-200">
                <div className="flex gap-2">
                  <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"><Paperclip className="w-4 h-4" /></button>
                </div>
                <button className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-sm">
                  Send Reply <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                Mark as Internal Note (Hidden from Parent)
              </label>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
