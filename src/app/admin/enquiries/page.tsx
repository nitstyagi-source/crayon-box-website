"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  PhoneCall, Plus, Search, Filter, Calendar, Clock, MessageSquare, 
  ArrowRight, X, Phone, User, CheckCircle2, AlertCircle, Sparkles, 
  GraduationCap, Printer, Shield, ChevronRight, Check, Eye, Trash2, 
  Heart, Bus, Award, Building, Share2, Layers, IndianRupee, RefreshCw, FileText
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getEnquiries, 
  getEnquiryDetails, 
  createAdmissionEnquiry, 
  updateAdmissionEnquiry, 
  addEnquiryTimelineLog, 
  convertEnquiryToStudent 
} from "@/app/actions/enquiry";
import { getClasses } from "@/app/actions/classes";
import { AdminNewEnquiryModal } from "@/components/enquiry/AdminNewEnquiryModal";
import { Enquiry360DossierModal } from "@/components/enquiry/Enquiry360DossierModal";

export default function AdmissionEnquiryCRM() {
  const { activeCampusId } = useCampusContext();

  // Enquiries List & Filter States
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal: New Admission Enquiry (2-3 Min Rapid Intake)
  const [showNewModal, setShowNewModal] = useState(false);
  const [modalTab, setModalTab] = useState<"basic" | "parents" | "address" | "source" | "counselling" | "followup">("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Detail Drawer
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [newLogNote, setNewLogNote] = useState("");
  const [newLogStage, setNewLogStage] = useState("Call Logged");
  const [isAddingLog, setIsAddingLog] = useState(false);

  // 1-Click Convert Modal
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertClassName, setConvertClassName] = useState("Grade 1");
  const [convertSectionName, setConvertSectionName] = useState("A");

  // Mark as Lost Modal
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostReason, setLostReason] = useState("Fee Too High");
  const [lostNotes, setLostNotes] = useState("");

  // Form State for 2-3 Min Rapid Intake
  const [formData, setFormData] = useState({
    enquiry_no: "",
    academic_session: "2026-27",
    admission_type: "New",
    priority: "Hot",
    first_name: "",
    middle_name: "",
    last_name: "",
    dob: "2021-04-15",
    gender: "Male",
    current_age: "4 Years 11 Mos",
    class_applying_for: "Nursery",
    current_class: "Playschool",
    previous_school: "",
    previous_board: "CBSE",
    nationality: "Indian",
    sibling_studying: false,
    sibling_name: "",
    sibling_admission_no: "",

    // Father
    father_name: "",
    father_mobile: "",
    father_whatsapp: "",
    father_email: "",
    father_occupation: "",
    father_company: "",
    father_designation: "",

    // Mother
    mother_name: "",
    mother_mobile: "",
    mother_whatsapp: "",
    mother_email: "",
    mother_occupation: "",
    mother_company: "",
    mother_designation: "",

    primary_contact: "Father",
    preferred_contact_mode: "WhatsApp",

    // Address
    address: "",
    locality: "Burari Main",
    city: "Delhi",
    state: "Delhi",
    pin_code: "110084",
    landmark: "",
    distance_km: "2.5 km",
    transport_required: true,
    preferred_transport_route: "Route #04 (Burari Main)",

    // Source (Mandatory)
    source: "Google Search",
    campaign_name: "Spring Admissions 2026",
    referral_name: "",
    referral_mobile: "",
    reason_for_choosing: "Safe campus & modern teaching methodology",
    fee_budget_range: "Standard",
    school_timing_pref: "Morning 8:00 AM - 1:30 PM",
    parent_expectations: "Individual attention & good communication skills",
    student_interests: "Drawing, Music & Sports",
    special_requirements: "",
    remarks: "",

    // Counselling
    counsellor_name: "Priya Sharma (Senior Counsellor)",
    counselling_date: new Date().toISOString().split('T')[0],
    counselling_mode: "Walk-in",
    fee_structure_shared: true,
    brochure_shared: true,
    school_tour_offered: true,
    process_explained: true,

    // School Visit
    visit_scheduled: true,
    visit_date: "2026-08-23",
    visit_time: "10:30 AM",
    visitors_count: 2,
    student_accompanied: true,
    interest_level: "High",

    // Follow-up
    status: "New",
    next_follow_up_date: "2026-08-22",
    next_follow_up_time: "11:00 AM",
    follow_up_type: "Phone Call",
    follow_up_notes: "Follow up regarding admission test date & transport confirmation."
  });

  useEffect(() => {
    loadData();
  }, [activeCampusId, statusFilter, priorityFilter]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [enqRes, clsRes] = await Promise.all([
        getEnquiries(activeCampusId, { status: statusFilter, priority: priorityFilter, search: searchTerm }),
        getClasses(activeCampusId)
      ]);

      if (enqRes.success) setEnquiries(enqRes.data);
      if (clsRes.success && clsRes.data) setClasses(clsRes.data);
    } catch (e) {
      console.error("Failed to load enquiries:", e);
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenCreateModal() {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({
      ...prev,
      enquiry_no: `ENQ-2026-${randomSuffix}`,
      first_name: "",
      last_name: "",
      father_name: "",
      father_mobile: "",
      mother_name: "",
      mother_mobile: ""
    }));
    setModalTab("basic");
    setShowNewModal(true);
  }

  // Auto calculate age when DOB changes
  function handleDobChange(dobVal: string) {
    if (!dobVal) return;
    const birth = new Date(dobVal);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    const ageStr = `${years} Yrs ${months} Mos`;
    setFormData(prev => ({ ...prev, dob: dobVal, current_age: ageStr }));
  }

  async function handleSaveEnquiry(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res: any = await createAdmissionEnquiry(formData);
      if (res.success) {
        alert(`Enquiry ${res.enquiryNo || res.enquiryNumber} created successfully! Automated follow-up task scheduled.`);
        setShowNewModal(false);
        await loadData();
      } else {
        alert("Failed to save enquiry: " + (res.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOpenDetails(id: string) {
    const res = await getEnquiryDetails(id);
    if (res.success) {
      setSelectedEnquiry(res.data);
      setConvertClassName(res.data.grade_interested || "Grade 1");
    }
  }

  async function handleAddTimelineLog(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEnquiry || !newLogNote.trim()) return;

    setIsAddingLog(true);
    const res = await addEnquiryTimelineLog(selectedEnquiry.id, {
      stage: newLogStage,
      title: `${newLogStage} Logged`,
      description: newLogNote,
      performedBy: selectedEnquiry.counsellor_name || 'Admissions Team'
    });

    if (res.success) {
      const refreshed = await getEnquiryDetails(selectedEnquiry.id);
      if (refreshed.success) setSelectedEnquiry(refreshed.data);
      setNewLogNote("");
      await loadData();
    }
    setIsAddingLog(false);
  }

  async function handleConvertStudent() {
    if (!selectedEnquiry) return;
    setIsConverting(true);
    try {
      const res: any = await convertEnquiryToStudent(selectedEnquiry.id, convertClassName, convertSectionName);

      if (res.success) {
        alert(`🎉 ${res.message}`);
        setShowConvertModal(false);
        const refreshed = await getEnquiryDetails(selectedEnquiry.id);
        if (refreshed.success) setSelectedEnquiry(refreshed.data);
        await loadData();
      } else {
        alert("Conversion failed: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsConverting(false);
    }
  }

  async function handleMarkAsLost() {
    if (!selectedEnquiry) return;
    const res = await updateAdmissionEnquiry(selectedEnquiry.id, {
      status: "Lost",
      lost_reason: lostReason,
      lost_notes: lostNotes
    });

    if (res.success) {
      alert("Enquiry marked as Lost. Reason logged for admission marketing analytics.");
      setShowLostModal(false);
      const refreshed = await getEnquiryDetails(selectedEnquiry.id);
      if (refreshed.success) setSelectedEnquiry(refreshed.data);
      await loadData();
    }
  }

  // Pipeline columns for Kanban
  const PIPELINE_STAGES = [
    { key: "New", label: "New Leads", color: "bg-blue-500", count: enquiries.filter(e => e.status === "New").length },
    { key: "Contacted", label: "Contacted", color: "bg-purple-500", count: enquiries.filter(e => e.status === "Contacted").length },
    { key: "Visit Scheduled", label: "Visit Scheduled", color: "bg-amber-500", count: enquiries.filter(e => e.status === "Visit Scheduled").length },
    { key: "Registered", label: "Registered", color: "bg-indigo-500", count: enquiries.filter(e => e.status === "Registered").length },
    { key: "Admitted", label: "Admitted / Converted", color: "bg-emerald-500", count: enquiries.filter(e => e.status === "Admitted").length },
    { key: "Lost", label: "Lost Leads", color: "bg-stone-400", count: enquiries.filter(e => e.status === "Lost").length }
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" /> New Admission Enquiry CRM
            </span>
            <span className="bg-amber-100 text-amber-900 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
              Session 2026-2027
            </span>
            <span className="text-stone-500 text-xs font-bold">2-3 Min Intake System</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Admission Enquiries &amp; Lead Conversion</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Capture prospective leads rapidly, automate follow-ups, track school visits, and transfer directly into the Student Master.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Link
            href="/admin/enquiries/new"
            className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-bold px-4 py-2.5 rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-purple-600" /> Full-Page Form
          </Link>
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-stone-900 hover:bg-stone-800 text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" /> + New Admission Enquiry
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase block">Total Enquiries</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">{enquiries.length}</span>
          <span className="text-[10px] text-blue-600 font-bold">Session 2026-27</span>
        </div>

        <div className="p-4 bg-red-50/70 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-[10px] font-bold text-red-800 uppercase block">Hot Priority</span>
          <span className="text-2xl font-black text-red-700 mt-1 block">
            {enquiries.filter(e => e.priority === 'Hot').length}
          </span>
          <span className="text-[10px] text-red-600">Immediate Action</span>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">Tours Scheduled</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {enquiries.filter(e => e.status === 'Visit Scheduled').length}
          </span>
          <span className="text-[10px] text-amber-600">Campus Visits</span>
        </div>

        <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 shadow-xs">
          <span className="text-[10px] font-bold text-indigo-800 uppercase block">Registered</span>
          <span className="text-2xl font-black text-indigo-700 mt-1 block">
            {enquiries.filter(e => e.status === 'Registered').length}
          </span>
          <span className="text-[10px] text-indigo-600">Fee Received</span>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Admitted / Converted</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {enquiries.filter(e => e.status === 'Admitted').length}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">In Student Master</span>
        </div>

        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold text-stone-500 uppercase block">Conversion Rate</span>
          <span className="text-2xl font-black text-stone-800 mt-1 block">
            {enquiries.length > 0 ? Math.round((enquiries.filter(e => e.status === 'Admitted').length / enquiries.length) * 100) : 0}%
          </span>
          <span className="text-[10px] text-stone-500">Lead to Student</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters, View Mode */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search child, parent, phone, enq no..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold text-stone-700"
          >
            <option value="All">All Pipeline Stages</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Visit Scheduled">Visit Scheduled</option>
            <option value="Registered">Registered</option>
            <option value="Admitted">Admitted</option>
            <option value="Lost">Lost</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold text-stone-700"
          >
            <option value="All">All Priorities</option>
            <option value="Hot">🔥 Hot</option>
            <option value="Warm">⚡ Warm</option>
            <option value="Cold">❄️ Cold</option>
          </select>
        </div>

        {/* Kanban vs Table Toggle */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === "kanban" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"}`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"}`}
          >
            Data Table
          </button>
        </div>
      </div>

      {/* View 1: Kanban Pipeline */}
      {viewMode === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map(stage => {
            const stageLeads = enquiries.filter(e => e.status === stage.key);

            return (
              <div key={stage.key} className="w-80 shrink-0 bg-stone-50/80 rounded-3xl border border-stone-200 flex flex-col max-h-[70vh]">
                
                {/* Column Header */}
                <div className="p-3.5 border-b border-stone-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></span>
                    <h3 className="font-black text-xs text-stone-800 uppercase tracking-tight">{stage.label}</h3>
                  </div>
                  <span className="bg-stone-200 text-stone-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
                  {stageLeads.map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => handleOpenDetails(lead.id)}
                      className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs hover:border-stone-400 hover:shadow-sm cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[9px] font-black text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          {lead.enquiry_no || 'ENQ-2026-0001'}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.2 rounded-full uppercase ${
                          lead.priority === 'Hot' ? 'bg-red-100 text-red-800' : lead.priority === 'Warm' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {lead.priority}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-black text-xs text-stone-900 group-hover:text-purple-700 transition-colors">
                          {lead.first_name || lead.child_name} {lead.last_name || ''}
                        </h4>
                        <p className="text-[10px] text-stone-500 font-bold">
                          {lead.grade_interested || lead.class_applying_for} • {lead.current_age || '4 Yrs'}
                        </p>
                      </div>

                      <div className="text-[10px] text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-100 space-y-0.5">
                        <p className="truncate"><span className="font-bold text-stone-400">Parent:</span> {lead.father_name || lead.parent_name}</p>
                        <p className="font-mono text-stone-800 font-bold"><span className="font-bold text-stone-400 font-sans">Phone:</span> {lead.father_mobile || lead.parent_phone}</p>
                        <p className="text-[9px] text-stone-400"><span className="font-bold">Source:</span> {lead.source}</p>
                      </div>

                      {lead.next_follow_up_date && (
                        <div className="flex items-center justify-between text-[9px] text-stone-400 pt-1 border-t border-stone-100">
                          <span className="flex items-center gap-1 font-bold text-amber-700">
                            <Clock className="w-3 h-3 text-amber-500" /> Due: {lead.next_follow_up_date}
                          </span>
                          <span className="text-stone-400">{lead.counsellor_name?.split(' ')[0] || 'Counsellor'}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="p-6 text-center text-stone-400 text-xs font-bold">
                      No leads in this stage
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Data Table */}
      {viewMode === "table" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Enquiry No</th>
                <th className="p-3.5">Child / Student</th>
                <th className="p-3.5">Class Applying</th>
                <th className="p-3.5">Parent &amp; Phone</th>
                <th className="p-3.5">Lead Source</th>
                <th className="p-3.5">Stage</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {enquiries.map(e => (
                <tr key={e.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-purple-700">{e.enquiry_no}</td>
                  <td className="p-3.5 font-bold text-stone-900">{e.first_name || e.child_name} {e.last_name || ''}</td>
                  <td className="p-3.5 font-bold text-stone-800">{e.grade_interested}</td>
                  <td className="p-3.5">
                    <p className="font-bold text-stone-900">{e.father_name || e.parent_name}</p>
                    <p className="font-mono text-[10px] text-stone-400">{e.father_mobile || e.parent_phone}</p>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {e.source}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {e.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      e.priority === 'Hot' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {e.priority}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenDetails(e.id)}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-2.5 py-1 rounded-lg text-xs"
                    >
                      View CRM
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================== */}
      <AdminNewEnquiryModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={() => {
          setShowNewModal(false);
          loadData();
        }}
      />

      {/* Drawer: Detailed Enquiry Profile + Interaction Timeline */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-stone-200 flex flex-col animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-stone-200 flex justify-between items-start bg-stone-50/50 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    {selectedEnquiry.enquiry_no}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.2 rounded-full uppercase ${
                    selectedEnquiry.priority === 'Hot' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedEnquiry.priority}
                  </span>
                  <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.2 rounded-full text-[10px]">
                    {selectedEnquiry.status}
                  </span>
                </div>
                <h2 className="text-xl font-black text-stone-900 mt-1">
                  {selectedEnquiry.first_name || selectedEnquiry.child_name} {selectedEnquiry.last_name || ''}
                </h2>
                <p className="text-xs text-stone-500">
                  Applying for {selectedEnquiry.grade_interested || selectedEnquiry.class_applying_for} • Session {selectedEnquiry.academic_session}
                </p>
              </div>

              <button onClick={() => setSelectedEnquiry(null)} className="p-1 text-stone-400 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact & Action Buttons */}
            <div className="p-4 border-b border-stone-100 bg-stone-50/30 flex flex-wrap gap-2 shrink-0">
              <a
                href={`tel:${selectedEnquiry.father_mobile || selectedEnquiry.parent_phone}`}
                className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Parent
              </a>

              <a
                href={`https://wa.me/91${(selectedEnquiry.father_mobile || selectedEnquiry.parent_phone || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </a>

              {selectedEnquiry.status !== 'Admitted' && (
                <button
                  onClick={() => setShowConvertModal(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs ml-auto"
                >
                  <GraduationCap className="w-4 h-4 text-amber-300" /> 1-Click Convert to Student Master
                </button>
              )}

              {selectedEnquiry.status !== 'Lost' && selectedEnquiry.status !== 'Admitted' && (
                <button
                  onClick={() => setShowLostModal(true)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-xl text-xs border border-red-200"
                >
                  Mark Lost
                </button>
              )}
            </div>

            {/* Drawer Content */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
              
              {/* Student & Parent Summary */}
              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Child Profile</p>
                  <p><span className="font-bold text-stone-700">DOB / Age:</span> {selectedEnquiry.dob || '2021-04-15'} ({selectedEnquiry.current_age || '4 Yrs'})</p>
                  <p><span className="font-bold text-stone-700">Gender:</span> {selectedEnquiry.gender || 'Male'}</p>
                  <p><span className="font-bold text-stone-700">Prev School:</span> {selectedEnquiry.previous_school || 'None'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Parent Contact</p>
                  <p><span className="font-bold text-stone-700">Father:</span> {selectedEnquiry.father_name || selectedEnquiry.parent_name}</p>
                  <p><span className="font-bold text-stone-700">Mobile:</span> {selectedEnquiry.father_mobile || selectedEnquiry.parent_phone}</p>
                  <p><span className="font-bold text-stone-700">Locality:</span> {selectedEnquiry.locality || 'Burari'}</p>
                </div>
              </div>

              {/* Interaction Timeline Trail */}
              <div className="space-y-3">
                <h3 className="font-black text-stone-900 text-sm flex items-center justify-between">
                  <span>Enquiry Interaction Timeline</span>
                  <span className="text-[10px] font-normal text-stone-400">Complete Audit Trail</span>
                </h3>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {(selectedEnquiry.timeline || []).map((item: any, idx: number) => (
                    <div key={item.id || idx} className="relative">
                      <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white"></span>
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-stone-900">{item.title}</h4>
                          <span className="text-[9px] text-stone-400 font-mono">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-stone-600 text-[11px] mt-0.5">{item.description}</p>
                        <p className="text-[9px] text-stone-400 mt-1 font-bold">By: {item.performed_by || 'Counsellor'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Interaction Log */}
              <form onSubmit={handleAddTimelineLog} className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2.5">
                <h4 className="font-black text-purple-950 text-xs">Log Interaction / Call Note</h4>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newLogStage}
                    onChange={e => setNewLogStage(e.target.value)}
                    className="bg-white border border-stone-200 p-2 rounded-xl font-bold"
                  >
                    <option value="Call Logged">📞 Phone Call Logged</option>
                    <option value="WhatsApp Sent">💬 WhatsApp Message</option>
                    <option value="Campus Visit">🏫 School Visit Update</option>
                    <option value="Fee Discussed">💵 Fee Structure Discussed</option>
                    <option value="Decision Pending">⏳ Parent Decision Pending</option>
                  </select>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Enter notes from call/visit with parent..."
                  value={newLogNote}
                  onChange={e => setNewLogNote(e.target.value)}
                  className="w-full bg-white border border-stone-200 p-2.5 rounded-xl"
                />
                <button
                  type="submit"
                  disabled={isAddingLog}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  {isAddingLog ? "Saving Log..." : "Add to Timeline"}
                </button>
              </form>

            </div>

          </div>
        </div>
      )}

      {/* Modal: 1-Click Convert to Student Master */}
      {showConvertModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">Transfer to Student Master</h3>
                <p className="text-xs text-stone-500">1-Click Automated Admission Enrollment</p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
              <p><span className="font-bold text-stone-700">Student:</span> {selectedEnquiry.first_name} {selectedEnquiry.last_name || ''}</p>
              <p><span className="font-bold text-stone-700">Parent:</span> {selectedEnquiry.father_name || selectedEnquiry.parent_name}</p>
              <p><span className="font-bold text-stone-700">Phone:</span> {selectedEnquiry.father_mobile || selectedEnquiry.parent_phone}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-stone-600 block mb-1">Enrollment Class</label>
                <select
                  value={convertClassName}
                  onChange={e => setConvertClassName(e.target.value)}
                  className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
                >
                  {["Pre-Nursery", "Nursery", "KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-600 block mb-1">Section</label>
                <select
                  value={convertSectionName}
                  onChange={e => setConvertSectionName(e.target.value)}
                  className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertStudent}
                disabled={isConverting}
                className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                {isConverting ? "Enrolling..." : "Confirm & Transfer to Student Master"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Mark as Lost */}
      {showLostModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div>
              <h3 className="text-base font-black text-red-900">Mark Enquiry as Lost</h3>
              <p className="text-xs text-stone-500">Capture reason for admission marketing analytics</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-600 block mb-1">Reason for Non-Conversion *</label>
                <select
                  value={lostReason}
                  onChange={e => setLostReason(e.target.value)}
                  className="w-full border border-stone-200 p-2.5 rounded-xl font-bold text-red-800"
                >
                  {[
                    "Fee Too High", "Distance", "Transport Issue", "Timing", 
                    "No Seat Available", "Chose Another School", "Relocated", 
                    "No Response", "Not Interested", "Admission Deferred", "Other"
                  ].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-600 block mb-1">Additional Feedback</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Parent found transport timing unsuitable..."
                  value={lostNotes}
                  onChange={e => setLostNotes(e.target.value)}
                  className="w-full border border-stone-200 p-2.5 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                onClick={() => setShowLostModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsLost}
                className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md"
              >
                Confirm Lost Status
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
