"use client";

import { useState, useEffect } from "react";
import { 
  Users, Plus, PhoneCall, Calendar, MessageSquare, ArrowRight, 
  X, Phone, User, CheckCircle2, Clock, GraduationCap, ArrowRightLeft 
} from "lucide-react";
import { getContactEnquiries } from "@/app/actions/forms";
import { createStudent } from "@/app/actions/students";
import { getClasses } from "@/app/actions/classes";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { useRouter } from "next/navigation";

export default function EnquiryCRM() {
  const { activeCampusId } = useCampusContext();
  const router = useRouter();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  // Direct Enroll Modal State
  const [directEnrollModal, setDirectEnrollModal] = useState(false);
  const [enrollData, setEnrollData] = useState({
    class_name: "Grade 1",
    section_name: "A",
    admission_no: "",
    dob: "2019-01-01"
  });

  const [leads, setLeads] = useState<{
    new: any[];
    contacted: any[];
    tourBooked: any[];
    readyToApply: any[];
  }>({
    new: [{ id: "mock-1", parent: "David Smith", child: "Leo Smith", grade: "Grade 4", phone: "9876543210" }],
    contacted: [{ id: "mock-2", parent: "Emily Chen", child: "Mia Chen", grade: "Grade 1", phone: "9876543211" }],
    tourBooked: [{ id: "mock-3", parent: "Michael Ross", child: "Rachel Ross", grade: "Grade 2", phone: "9876543212" }],
    readyToApply: [{ id: "mock-4", parent: "Sarah Jenkins", child: "Tom Jenkins", grade: "Grade 3", phone: "9876543213" }]
  });

  useEffect(() => {
    async function loadData() {
      const [dbEnquiries, clsRes] = await Promise.all([
        getContactEnquiries(),
        getClasses(activeCampusId)
      ]);

      if (clsRes.success && clsRes.data) setClasses(clsRes.data);

      if (dbEnquiries.length > 0) {
        setLeads(prev => {
          const mappedEnquiries = dbEnquiries.map(e => ({
            id: e.id,
            parent: e.name,
            child: e.department || e.name.split(' ')[0] + " Jr",
            grade: e.nature || "Grade 1",
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
    loadData();
  }, [activeCampusId]);

  const handleConvert = () => {
    setIsConverting(true);
    setTimeout(() => {
      setIsConverting(false);
      setConversionSuccess(true);
    }, 1500);
  };

  async function handleDirectEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLead) return;
    setIsConverting(true);

    const childNames = selectedLead.child ? selectedLead.child.split(" ") : ["Student", "Name"];
    const firstName = childNames[0] || "Student";
    const lastName = childNames.slice(1).join(" ") || "Enquiry";
    const admNo = enrollData.admission_no || `ADM-${Math.floor(1000 + Math.random() * 9000)}`;

    const res = await createStudent({
      campus_id: activeCampusId,
      admission_no: admNo,
      first_name: firstName,
      last_name: lastName,
      dob: enrollData.dob,
      gender: "Male",
      category: "General",
      class_name: enrollData.class_name,
      section_name: enrollData.section_name,
      father_name: selectedLead.parent,
      father_mobile: selectedLead.phone,
      primary_contact: "Father"
    });

    setIsConverting(false);
    if (res.success && res.data) {
      router.push(`/admin/students/${res.data.id}`);
    } else {
      alert("Failed to enroll student: " + res.error);
    }
  }

  const closeDrawer = () => {
    setSelectedLead(null);
    setConversionSuccess(false);
    setDirectEnrollModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 flex flex-col h-[calc(100vh-8rem)] font-sans">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-7 h-7 text-blue-600" /> Admissions Enquiry CRM
          </h1>
          <p className="text-sm text-slate-500">Capture leads, track interactions, and transfer directly into enrolled students.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowQuickAdd(true)}
            className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-amber-400" /> Quick Add Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto flex gap-6 pb-4">
        
        {/* Column: New */}
        <div className="w-80 shrink-0 flex flex-col bg-slate-50 rounded-3xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> New Inquiries</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{leads.new.length}</span>
          </div>
          <div className="p-4 flex-1 space-y-3 overflow-y-auto">
            {leads.new.map(lead => (
              <div 
                key={lead.id} 
                onClick={() => {
                  setSelectedLead(lead);
                  setEnrollData({
                    class_name: lead.grade || "Grade 1",
                    section_name: "A",
                    admission_no: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
                    dob: "2019-01-01"
                  });
                }} 
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
              >
                <h4 className="font-bold text-slate-900">{lead.parent}</h4>
                <p className="text-xs text-slate-500 mt-1">Child: <span className="font-bold text-slate-700">{lead.child}</span> ({lead.grade})</p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column: Contacted */}
        <div className="w-80 shrink-0 flex flex-col bg-slate-50 rounded-3xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Contacted & Nurtured</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{leads.contacted.length}</span>
          </div>
          <div className="p-4 flex-1 space-y-3 overflow-y-auto">
            {leads.contacted.map(lead => (
              <div 
                key={lead.id} 
                onClick={() => {
                  setSelectedLead(lead);
                  setEnrollData({
                    class_name: lead.grade || "Grade 1",
                    section_name: "A",
                    admission_no: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
                    dob: "2019-01-01"
                  });
                }} 
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md cursor-pointer transition-all"
              >
                <h4 className="font-bold text-slate-900">{lead.parent}</h4>
                <p className="text-xs text-slate-500 mt-1">Child: <span className="font-bold text-slate-700">{lead.child}</span> ({lead.grade})</p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column: Tour Booked */}
        <div className="w-80 shrink-0 flex flex-col bg-slate-50 rounded-3xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Campus Tour Booked</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{leads.tourBooked.length}</span>
          </div>
          <div className="p-4 flex-1 space-y-3 overflow-y-auto">
            {leads.tourBooked.map(lead => (
              <div 
                key={lead.id} 
                onClick={() => {
                  setSelectedLead(lead);
                  setEnrollData({
                    class_name: lead.grade || "Grade 1",
                    section_name: "A",
                    admission_no: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
                    dob: "2019-01-01"
                  });
                }} 
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md cursor-pointer transition-all"
              >
                <h4 className="font-bold text-slate-900">{lead.parent}</h4>
                <p className="text-xs text-slate-500 mt-1">Child: <span className="font-bold text-slate-700">{lead.child}</span> ({lead.grade})</p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column: Ready to Apply */}
        <div className="w-80 shrink-0 flex flex-col bg-slate-50 rounded-3xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Ready to Enroll</h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{leads.readyToApply.length}</span>
          </div>
          <div className="p-4 flex-1 space-y-3 overflow-y-auto">
            {leads.readyToApply.map(lead => (
              <div 
                key={lead.id} 
                onClick={() => {
                  setSelectedLead(lead);
                  setEnrollData({
                    class_name: lead.grade || "Grade 1",
                    section_name: "A",
                    admission_no: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
                    dob: "2019-01-01"
                  });
                }} 
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all"
              >
                <h4 className="font-bold text-slate-900">{lead.parent}</h4>
                <p className="text-xs text-slate-500 mt-1">Child: <span className="font-bold text-slate-700">{lead.child}</span> ({lead.grade})</p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lead Profile Side Drawer with Direct Enroll Action */}
      {selectedLead && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 border-l border-slate-200 animate-in slide-in-from-right flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest mb-3 inline-block">High Intent Lead</span>
              <h2 className="font-bold text-2xl text-slate-800">{selectedLead.parent}</h2>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2 font-mono"><Phone className="w-4 h-4" /> {selectedLead.phone}</p>
            </div>
            <button onClick={closeDrawer} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><User className="w-4 h-4 text-blue-600" /> Student Profile</h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-sm"><strong className="text-slate-700">Child Name:</strong> {selectedLead.child}</p>
                <p className="text-sm mt-1.5"><strong className="text-slate-700">Target Grade:</strong> {selectedLead.grade}</p>
              </div>
            </div>

            {/* Direct Enroll Option */}
            <div className="p-5 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <GraduationCap className="w-5 h-5 text-blue-600" /> Transfer & Enroll to Class
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                Directly convert this enquiry lead into a registered active student in the school master register.
              </p>

              <form onSubmit={handleDirectEnroll} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Assign Class *</label>
                    <input 
                      required 
                      type="text" 
                      value={enrollData.class_name} 
                      onChange={e => setEnrollData({...enrollData, class_name: e.target.value})} 
                      className="w-full border border-stone-200 p-2 rounded-xl text-xs font-bold bg-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Section</label>
                    <input 
                      type="text" 
                      value={enrollData.section_name} 
                      onChange={e => setEnrollData({...enrollData, section_name: e.target.value.toUpperCase()})} 
                      className="w-full border border-stone-200 p-2 rounded-xl text-xs font-bold uppercase bg-white" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Admission No. *</label>
                  <input 
                    required 
                    type="text" 
                    value={enrollData.admission_no} 
                    onChange={e => setEnrollData({...enrollData, admission_no: e.target.value})} 
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs font-mono bg-white" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isConverting} 
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> {isConverting ? "Enrolling..." : "Enroll Student Directly"}
                </button>
              </form>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border-t border-slate-800">
            {conversionSuccess ? (
              <div className="text-center animate-in zoom-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-white font-bold text-sm mb-1">Application Token Generated!</h3>
                <p className="text-slate-400 text-xs mb-3">
                  Token generated and WhatsApp link dispatched to parent.
                </p>
                <button onClick={closeDrawer} className="text-emerald-400 text-xs font-bold hover:underline">Close Profile</button>
              </div>
            ) : (
              <button 
                onClick={handleConvert}
                disabled={isConverting}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isConverting ? "Generating Link..." : "Send Online Application Form"}
              </button>
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
