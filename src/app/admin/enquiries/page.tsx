"use client";

import { useState, useEffect } from "react";
import { Users, Plus, PhoneCall, Calendar, MessageSquare, ArrowRight, X, Phone, User, CheckCircle2, Clock } from "lucide-react";
import { getContactEnquiries } from "@/app/actions/forms";

export default function EnquiryCRM() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(false);

  // Mock Leads Data
  const [leads, setLeads] = useState<{
    new: any[];
    contacted: any[];
    tourBooked: any[];
    readyToApply: any[];
  }>({
    new: [{ id: 1, parent: "David Smith", child: "Leo Smith", grade: "Grade 4", phone: "9876543210" }],
    contacted: [{ id: 2, parent: "Emily Chen", child: "Mia Chen", grade: "Kindergarten", phone: "9876543211" }],
    tourBooked: [{ id: 3, parent: "Michael Ross", child: "Rachel Ross", grade: "Grade 1", phone: "9876543212" }],
    readyToApply: [{ id: 4, parent: "Sarah Jenkins", child: "Tom Jenkins", grade: "Grade 8", phone: "9876543213" }]
  });

  useEffect(() => {
    async function loadEnquiries() {
      const dbEnquiries = await getContactEnquiries();
      if (dbEnquiries.length > 0) {
        setLeads(prev => {
          const mappedEnquiries = dbEnquiries.map(e => ({
            id: e.id,
            parent: e.name,
            child: e.department, // Use child field to show department
            grade: e.nature, // Use grade field to show nature
            phone: e.phone,
            message: e.message
          }));
          return {
            ...prev,
            new: [...mappedEnquiries, ...prev.new]
          };
        });
      }
    }
    loadEnquiries();
  }, []);

  const handleConvert = () => {
    setIsConverting(true);
    // Simulate API Call generating Draft Application and sending SMS
    setTimeout(() => {
      setIsConverting(false);
      setConversionSuccess(true);
    }, 2000);
  };

  const closeDrawer = () => {
    setSelectedLead(null);
    setConversionSuccess(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 flex flex-col h-[calc(100vh-8rem)]">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><PhoneCall className="w-6 h-6 text-blue-600" /> Admissions Enquiry CRM</h1>
          <p className="text-sm text-slate-500">Capture leads, track interactions, and frictionlessly convert them to applications.</p>
        </div>
        <button 
          onClick={() => setShowQuickAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Quick Add Lead
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto flex gap-6 pb-4">
        
        {/* Column: New */}
        <div className="w-80 shrink-0 flex flex-col bg-slate-50 rounded-2xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> New Inquiries</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{leads.new.length}</span>
          </div>
          <div className="p-4 flex-1 space-y-4 overflow-y-auto">
            {leads.new.map(lead => (
              <div key={lead.id} onClick={() => setSelectedLead(lead)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer transition-all">
                <h4 className="font-bold text-slate-800">{lead.parent}</h4>
                <p className="text-xs text-slate-500 mt-1">Child: {lead.child} ({lead.grade})</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Today, 9:00 AM</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column: Contacted */}
        <div className="w-80 shrink-0 flex flex-col bg-slate-50 rounded-2xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Contacted</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{leads.contacted.length}</span>
          </div>
          <div className="p-4 flex-1 space-y-4 overflow-y-auto">
            {leads.contacted.map(lead => (
               <div key={lead.id} onClick={() => setSelectedLead(lead)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer transition-all">
                <h4 className="font-bold text-slate-800">{lead.parent}</h4>
                <p className="text-xs text-slate-500 mt-1">Child: {lead.child} ({lead.grade})</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-amber-600 font-bold">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Follow up: Aug 20</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column: Tour Booked */}
        <div className="w-80 shrink-0 flex flex-col bg-slate-50 rounded-2xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Tour Booked</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{leads.tourBooked.length}</span>
          </div>
          <div className="p-4 flex-1 space-y-4 overflow-y-auto">
             {leads.tourBooked.map(lead => (
               <div key={lead.id} onClick={() => setSelectedLead(lead)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer transition-all">
                <h4 className="font-bold text-slate-800">{lead.parent}</h4>
                <p className="text-xs text-slate-500 mt-1">Child: {lead.child} ({lead.grade})</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-purple-600 font-bold">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Tour: Tomorrow, 10 AM</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column: Ready to Apply */}
        <div className="w-80 shrink-0 flex flex-col bg-emerald-50 rounded-2xl border border-emerald-200">
          <div className="p-4 border-b border-emerald-200 flex justify-between items-center bg-emerald-100/50 rounded-t-2xl">
            <h3 className="font-bold text-emerald-900 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Ready to Apply</h3>
            <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">{leads.readyToApply.length}</span>
          </div>
          <div className="p-4 flex-1 space-y-4 overflow-y-auto">
             {leads.readyToApply.map(lead => (
               <div key={lead.id} onClick={() => setSelectedLead(lead)} className="bg-white p-4 rounded-xl border border-emerald-300 shadow-sm hover:shadow-md cursor-pointer transition-all">
                <h4 className="font-bold text-slate-800">{lead.parent}</h4>
                <p className="text-xs text-slate-500 mt-1">Child: {lead.child} ({lead.grade})</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-emerald-600 font-bold">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> High Intent</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-lg text-slate-800">Quick Lead Entry</h2>
              <button onClick={() => setShowQuickAdd(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Name</label>
                <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Number</label>
                <input type="tel" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="+91 98765 43210" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Child Name</label>
                  <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. Leo" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grade</label>
                  <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                    <option>Kindergarten</option>
                    <option>Grade 1</option>
                    <option>Grade 2</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowQuickAdd(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => setShowQuickAdd(false)} className="flex-[2] py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl shadow-md transition-colors">Save Lead</button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Profile Side Drawer */}
      {selectedLead && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 border-l border-slate-200 animate-in slide-in-from-right flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest mb-3 inline-block">High Intent Lead</span>
              <h2 className="font-bold text-2xl text-slate-800">{selectedLead.parent}</h2>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2"><Phone className="w-4 h-4" /> +91 {selectedLead.phone}</p>
            </div>
            <button onClick={closeDrawer} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Student Profile</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
              <p className="text-sm"><strong className="text-slate-700">Name:</strong> {selectedLead.child}</p>
              <p className="text-sm mt-2"><strong className="text-slate-700">Applying For:</strong> {selectedLead.grade} (2026-27 Batch)</p>
            </div>

            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Interaction Timeline</h3>
            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
              <div className="relative flex items-start gap-4">
                <div className="absolute left-0 -ml-6 mt-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Completed Campus Tour</p>
                  <p className="text-xs text-slate-500">Today, 11:00 AM • Led by Sarah (Counselor)</p>
                  <p className="text-sm text-slate-600 mt-2 bg-blue-50 p-3 rounded-lg border border-blue-100">"Parents loved the library and sports facilities. Very likely to apply."</p>
                </div>
              </div>
              <div className="relative flex items-start gap-4">
                <div className="absolute left-0 -ml-6 mt-1 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-white"></div>
                <div className="w-full space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-4">
                    <User className="w-5 h-5 text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Parent Name</p>
                      <p className="font-medium text-slate-800">{selectedLead.parent}</p>
                    </div>
                  </div>
                  {selectedLead.message && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-4">
                      <MessageSquare className="w-5 h-5 text-blue-400 mt-1" />
                      <div>
                        <p className="text-xs text-blue-500 uppercase tracking-widest font-bold mb-1">Message</p>
                        <p className="font-medium text-blue-800 text-sm whitespace-pre-wrap">{selectedLead.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border-t border-slate-800">
            {conversionSuccess ? (
              <div className="text-center animate-in zoom-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg mb-1">Application Drafted!</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Token <strong className="text-white">APP-2026-042</strong> generated.<br/>
                  Secure Magic Link dispatched to WhatsApp.
                </p>
                <button onClick={closeDrawer} className="text-emerald-400 text-sm font-bold hover:underline">Close Profile</button>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                  Clicking Convert will instantly draft an application and text a <strong>Secure Magic Link</strong> to the parent's phone to collect payment and documents.
                </p>
                <button 
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isConverting ? "Generating Link..." : "Convert to Application"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={closeDrawer}></div>
      )}

    </div>
  );
}
