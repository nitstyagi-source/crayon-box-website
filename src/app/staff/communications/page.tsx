"use client";

import { useState } from "react";
import { Send, Image as ImageIcon, Paperclip, AlertCircle } from "lucide-react";

export default function CommunicationsPage() {
  const [audience, setAudience] = useState("all");
  const [channel, setChannel] = useState("app");
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Broadcast Message</h1>
          <p className="text-sm text-slate-500">Send announcements to parents instantly via App, SMS, or WhatsApp.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Target Selection */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Select Audience</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => setAudience("all")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${audience === "all" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <h3 className={`font-bold text-sm ${audience === "all" ? "text-emerald-900" : "text-slate-700"}`}>All My Classes</h3>
                <p className="text-xs text-slate-500 mt-1">42 Parents</p>
              </button>
              <button 
                onClick={() => setAudience("4a")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${audience === "4a" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <h3 className={`font-bold text-sm ${audience === "4a" ? "text-emerald-900" : "text-slate-700"}`}>Grade 4A</h3>
                <p className="text-xs text-slate-500 mt-1">20 Parents</p>
              </button>
              <button 
                onClick={() => setAudience("custom")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${audience === "custom" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <h3 className={`font-bold text-sm ${audience === "custom" ? "text-emerald-900" : "text-slate-700"}`}>Custom Selection</h3>
                <p className="text-xs text-slate-500 mt-1">Select specific parents</p>
              </button>
            </div>
          </div>

          {/* Channel Selection */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Delivery Channel</label>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => setChannel("app")} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${channel === "app" ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Parent App Alert</button>
              <button onClick={() => setChannel("whatsapp")} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${channel === "whatsapp" ? "bg-[#25D366] text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>WhatsApp API</button>
              <button onClick={() => setChannel("email")} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${channel === "email" ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Email Blast</button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Composer */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Subject / Title</label>
              <input type="text" placeholder="e.g. Important update regarding tomorrow's field trip" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Message Body</label>
              <textarea rows={6} placeholder="Write your message here..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"></textarea>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                <ImageIcon className="w-4 h-4" /> Add Image
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                <Paperclip className="w-4 h-4" /> Attach File
              </button>
            </div>
          </div>

          {channel === "whatsapp" && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800"><strong>WhatsApp Policy:</strong> You are sending a promotional or notification message. This will consume Twilio conversation credits. Ensure content complies with Meta's Commerce Policy.</p>
            </div>
          )}

        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex items-center justify-between">
          <button className="text-sm font-bold text-slate-500 hover:text-slate-700">Save as Draft</button>
          <button className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-colors">
            <Send className="w-4 h-4" /> Send Now
          </button>
        </div>
      </div>
      
    </div>
  );
}
