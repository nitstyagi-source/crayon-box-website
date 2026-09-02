"use client";

import React, { useState, useEffect } from "react";
import {
  Users, Phone, Mail, MapPin, Calendar, Clock,
  CheckCircle2, AlertTriangle, Building2, Sparkles,
  ChevronRight, ArrowRight, X, Plus, MessageSquare,
  FileText, ShieldCheck, QrCode, Award, ExternalLink,
  RefreshCw, Check, Send, UserCheck, Flame, Compass
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  getEnquiryDetails,
  logEnquiryFollowupAction,
  convertEnquiryToApplicationAction,
  searchExistingSiblingStudentAction,
  updateEnquiryStatusAction,
  EnquiryFollowupInput
} from "@/app/actions/enquiry";

interface Enquiry360DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiryId: string | null;
  onUpdate?: () => void;
}

export function Enquiry360DossierModal({
  isOpen,
  onClose,
  enquiryId,
  onUpdate
}: Enquiry360DossierModalProps) {
  const [enquiry, setEnquiry] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "guardians" | "timeline" | "attribution" | "convert">("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Follow-up form state
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false);
  const [followupForm, setFollowupForm] = useState({
    counsellorName: "Pooja Verma (Admissions Lead)",
    channel: "PHONE",
    contactedPerson: "Father",
    outcome: "CONNECTED",
    parentFeedback: "",
    internalNotes: "",
    nextAction: "Schedule Campus Tour",
    nextActionDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    advanceStatusTo: ""
  });

  // Conversion state
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<any>(null);

  // Sibling search state
  const [siblingSearchQuery, setSiblingSearchQuery] = useState("");
  const [siblingResults, setSiblingResults] = useState<any[]>([]);
  const [isSearchingSibling, setIsSearchingSibling] = useState(false);

  const fetchDetails = async () => {
    if (!enquiryId) return;
    setIsLoading(true);
    const res = await getEnquiryDetails(enquiryId);
    if (res.success) {
      setEnquiry(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen && enquiryId) {
      fetchDetails();
      setConversionResult(null);
      setIsLogFormOpen(false);
    }
  }, [isOpen, enquiryId]);

  const handleLogFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryId || !followupForm.internalNotes) {
      alert("Please enter notes for this interaction.");
      return;
    }

    setIsSubmittingFollowup(true);
    try {
      const payload: EnquiryFollowupInput = {
        enquiryId,
        counsellorName: followupForm.counsellorName,
        channel: followupForm.channel,
        contactedPerson: followupForm.contactedPerson,
        outcome: followupForm.outcome,
        parentFeedback: followupForm.parentFeedback,
        internalNotes: followupForm.internalNotes,
        nextAction: followupForm.nextAction,
        nextActionDate: followupForm.nextActionDate,
        advanceStatusTo: followupForm.advanceStatusTo || undefined
      };

      const res = await logEnquiryFollowupAction(payload);
      if (res.success) {
        setIsLogFormOpen(false);
        setFollowupForm(prev => ({ ...prev, internalNotes: "", parentFeedback: "" }));
        fetchDetails();
        if (onUpdate) onUpdate();
      } else {
        alert(res.error);
      }
    } finally {
      setIsSubmittingFollowup(false);
    }
  };

  const handleConvert = async () => {
    if (!enquiryId) return;
    setIsConverting(true);
    try {
      const res = await convertEnquiryToApplicationAction(enquiryId);
      if (res.success) {
        setConversionResult(res);
        fetchDetails();
        if (onUpdate) onUpdate();
      } else {
        alert(res.error);
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleSiblingSearch = async () => {
    if (!siblingSearchQuery.trim()) return;
    setIsSearchingSibling(true);
    const res = await searchExistingSiblingStudentAction(siblingSearchQuery);
    if (res.success) {
      setSiblingResults(res.students);
    }
    setIsSearchingSibling(false);
  };

  if (!isOpen || !enquiryId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="5xl"
      title={
        enquiry
          ? `Enquiry 360° Dossier: ${enquiry.enquiry_number || "ENQ-LIVE"} — ${enquiry.full_child_name || enquiry.child_name}`
          : "Loading Dossier..."
      }
    >
      {isLoading || !enquiry ? (
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading comprehensive lead records...</p>
        </div>
      ) : (
        <div className="space-y-6 w-full font-sans">
          
          {/* Executive Top Banner Card */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                  {enquiry.enquiry_number || "ENQ-2026-LIVE"}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-300">
                  Target: {enquiry.target_class || enquiry.admission_class}
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {enquiry.full_child_name || enquiry.child_name}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Primary Contact: <strong className="text-slate-200">{enquiry.full_parent_name} ({enquiry.primary_guardian_relation || "Father"})</strong> • 📞 {enquiry.full_parent_phone}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                enquiry.lead_priority === "HOT" ? "bg-rose-500 text-white" :
                enquiry.lead_priority === "WARM" ? "bg-amber-500 text-slate-950" : "bg-blue-500/20 text-blue-300"
              }`}>
                <Flame className="w-3.5 h-3.5" /> {enquiry.lead_priority || "WARM"}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {enquiry.status || "NEW"}
              </span>

              {enquiry.conversion_status !== "CONVERTED" && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setActiveTab("convert")}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm"
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Convert
                </Button>
              )}
            </div>
          </div>

          {/* Dossier Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
            {[
              { id: "overview", label: "1. Child Demographics", icon: Users },
              { id: "guardians", label: "2. Guardians & Siblings", icon: Building2 },
              { id: "timeline", label: `3. Activity Timeline (${enquiry.followups?.length || 0})`, icon: Clock },
              { id: "attribution", label: "4. Marketing Attribution", icon: Compass },
              { id: "convert", label: "5. Convert to Application", icon: ShieldCheck },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW & CHILD DEMOGRAPHICS */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Child Identity Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                    Child Identity &amp; Bio
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">First Name</span>
                      <strong className="text-slate-800">{enquiry.child_first_name || enquiry.child_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Last Name</span>
                      <strong className="text-slate-800">{enquiry.child_last_name || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Date of Birth</span>
                      <strong className="text-slate-800 font-mono">{enquiry.child_dob || "Not Provided"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Gender</span>
                      <strong className="text-slate-800">{enquiry.child_gender || "Male"}</strong>
                    </div>
                  </div>
                </div>

                {/* Target Admission */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                    Target Enrollment
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">Applying Class</span>
                      <strong className="text-indigo-700 font-black text-sm">{enquiry.target_class || enquiry.admission_class}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Academic Session</span>
                      <strong className="text-slate-800 font-bold">{enquiry.academic_session || "2026-2027"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Admission Type</span>
                      <strong className="text-slate-800">{enquiry.admission_type || "NEW"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schooling History & Interests */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Prior Schooling &amp; Specific Requirements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Current / Previous School</span>
                    <strong className="text-slate-800">{enquiry.current_school || "N/A (Early Childhood)"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Current Board</span>
                    <strong className="text-slate-800">{enquiry.current_board || "Standard Framework"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">School Bus Transport</span>
                    <strong className={enquiry.transport_required ? "text-amber-800 font-bold" : "text-slate-500"}>
                      {enquiry.transport_required ? "✓ Required" : "Self Commute"}
                    </strong>
                  </div>
                </div>

                {enquiry.interest_areas && enquiry.interest_areas.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">
                      Parent Areas of High Interest
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {enquiry.interest_areas.map((area: string) => (
                        <span key={area} className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {enquiry.parent_message && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Parent Remarks / Message</span>
                    <p className="text-slate-700 italic">&ldquo;{enquiry.parent_message}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: GUARDIANS & SIBLINGS */}
          {/* ========================================================= */}
          {activeTab === "guardians" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Guardian Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                      Primary Contact
                    </h4>
                    <span className="px-2 py-0.2 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                      {enquiry.primary_guardian_relation || "FATHER"}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">Name</span>
                      <strong className="text-slate-900 text-sm">{enquiry.full_parent_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Mobile &amp; WhatsApp</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <strong className="font-mono text-slate-900">{enquiry.full_parent_phone}</strong>
                        <a
                          href={`https://wa.me/91${enquiry.full_parent_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold inline-flex items-center gap-1"
                        >
                          <span>💬</span> WhatsApp
                        </a>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Email</span>
                      <strong className="text-slate-800">{enquiry.full_parent_email || "Not Provided"}</strong>
                    </div>
                  </div>
                </div>

                {/* Residential Address */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                    Residential Location &amp; GIS
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">Locality / Area</span>
                      <strong className="text-slate-900">{enquiry.locality_area || "Delhi NCR"}</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 font-bold block">PIN Code</span>
                        <strong className="font-mono text-slate-900">{enquiry.pincode || "110084"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">City / State</span>
                        <strong className="text-slate-900">Delhi</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sibling Intelligence Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                    Sibling Linkage &amp; Family Relationship
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    enquiry.has_sibling ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-500"
                  }`}>
                    {enquiry.has_sibling ? "✓ Sibling Studying in School" : "No Sibling Registered"}
                  </span>
                </div>

                {enquiry.linked_sibling_name || enquiry.linked_sibling_first ? (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-purple-950 block">
                        Linked Sibling: {enquiry.linked_sibling_first} {enquiry.linked_sibling_last}
                      </span>
                      <span className="text-[10px] text-purple-700 font-mono">
                        Admission No: {enquiry.linked_sibling_adm_no || enquiry.linked_sibling_admission_no}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-md">
                      Linked
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block">
                      Search &amp; Link Existing Enrolled Sibling:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search student name or admission no..."
                        value={siblingSearchQuery}
                        onChange={e => setSiblingSearchQuery(e.target.value)}
                        className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 w-full"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleSiblingSearch}
                        isLoading={isSearchingSibling}
                      >
                        Search
                      </Button>
                    </div>

                    {siblingResults.length > 0 && (
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1 max-h-40 overflow-y-auto">
                        {siblingResults.map(s => (
                          <div key={s.id} className="p-2 bg-white rounded-lg border flex justify-between items-center text-xs">
                            <div>
                              <strong>{s.first_name} {s.last_name}</strong> ({s.admission_no}) — {s.class_name}
                            </div>
                            <Button size="sm" variant="outline">Link Sibling</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ACTIVITY & FOLLOW-UP TIMELINE */}
          {/* ========================================================= */}
          {activeTab === "timeline" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Multi-Touch Activity Timeline
                  </h4>
                  <p className="text-xs text-slate-500">Every interaction, call outcome, and scheduled visit log</p>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsLogFormOpen(!isLogFormOpen)}
                  leftIcon={isLogFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                >
                  {isLogFormOpen ? "Close Form" : "Log New Follow-up"}
                </Button>
              </div>

              {/* Log Follow-up Form Box */}
              {isLogFormOpen && (
                <form onSubmit={handleLogFollowup} className="p-5 rounded-2xl bg-slate-50 border border-slate-300 shadow-sm space-y-4 text-xs animate-in slide-in-from-top-2 duration-150">
                  <div className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" /> Log Parent Interaction
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Counsellor Name *</label>
                      <input
                        type="text"
                        required
                        value={followupForm.counsellorName}
                        onChange={e => setFollowupForm({ ...followupForm, counsellorName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Interaction Channel *</label>
                      <select
                        value={followupForm.channel}
                        onChange={e => setFollowupForm({ ...followupForm, channel: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                      >
                        <option value="PHONE">📞 Phone Call</option>
                        <option value="WHATSAPP">💬 WhatsApp Message</option>
                        <option value="IN_PERSON">🏫 In-Person Campus Walk-in</option>
                        <option value="EMAIL">✉️ Email Follow-up</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Call / Interaction Outcome *</label>
                      <select
                        value={followupForm.outcome}
                        onChange={e => setFollowupForm({ ...followupForm, outcome: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-indigo-700"
                      >
                        <option value="CONNECTED">Connected &amp; Interested</option>
                        <option value="CALLBACK_REQUESTED">Callback Requested</option>
                        <option value="VISIT_SCHEDULED">Campus Visit Scheduled</option>
                        <option value="APPLICATION_REQUESTED">Application Form Requested</option>
                        <option value="APPLICATION_SUBMITTED">Application Submitted</option>
                        <option value="NO_ANSWER">No Answer / Line Busy</option>
                        <option value="LOST">Lost / Dropped</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Counsellor Notes / Discussion Summary *</label>
                    <textarea
                      required
                      rows={2}
                      value={followupForm.internalNotes}
                      onChange={e => setFollowupForm({ ...followupForm, internalNotes: e.target.value })}
                      placeholder="Discussed fee structure for Class 2. Parent requested campus tour on Saturday morning."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Next Action</label>
                      <input
                        type="text"
                        value={followupForm.nextAction}
                        onChange={e => setFollowupForm({ ...followupForm, nextAction: e.target.value })}
                        placeholder="e.g. Follow-up after campus visit"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Next Action Date</label>
                      <input
                        type="date"
                        value={followupForm.nextActionDate}
                        onChange={e => setFollowupForm({ ...followupForm, nextActionDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => setIsLogFormOpen(false)}>Cancel</Button>
                    <Button size="sm" variant="primary" type="submit" isLoading={isSubmittingFollowup}>
                      Save Interaction Log
                    </Button>
                  </div>
                </form>
              )}

              {/* Timeline List */}
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {enquiry.followups && enquiry.followups.length > 0 ? (
                  enquiry.followups.map((act: any, idx: number) => (
                    <div key={act.id || idx} className="relative flex items-start gap-4 pl-8">
                      <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 ring-4 ring-white" />
                      <div className="flex-1 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                              {act.channel || "PHONE"}
                            </span>
                            {act.counsellor_name || "Admissions Staff"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(act.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {act.outcome}
                          </span>
                          {act.next_action_date && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              📅 Next: {act.next_action || "Follow up"} on {act.next_action_date}
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 font-medium pt-1">
                          {act.internal_notes || act.notes}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs font-bold text-slate-400">
                    No follow-up activity logged yet. Click &quot;Log New Follow-up&quot; to add.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: MARKETING ATTRIBUTION (UTM) */}
          {/* ========================================================= */}
          {activeTab === "attribution" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Digital Marketing Telemetry &amp; UTM Tracking
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">UTM Source</span>
                    <strong className="text-indigo-700 font-mono">{enquiry.utm_source || "direct / organic"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">UTM Medium</span>
                    <strong className="text-slate-800 font-mono">{enquiry.utm_medium || "organic"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">UTM Campaign</span>
                    <strong className="text-slate-800 font-mono">{enquiry.utm_campaign || "none"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Landing Page</span>
                    <strong className="text-slate-800 font-mono truncate block">{enquiry.landing_page || "/admissions"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Device Type</span>
                    <strong className="text-slate-800">{enquiry.device_type || "Desktop"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Enquiry Source</span>
                    <strong className="text-emerald-700 font-bold">{enquiry.source || "Website"}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: 1-CLICK APPLICATION CONVERSION */}
          {/* ========================================================= */}
          {activeTab === "convert" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">
                    1-Click Convert Enquiry to Official Application
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Converts this qualified lead directly into an active admission application with pre-populated child bio, parent contacts, and fee ledger linkages.
                  </p>
                </div>

                {conversionResult ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 space-y-2 max-w-md mx-auto">
                    <strong className="block font-black text-sm">🎉 Conversion Complete!</strong>
                    <p>{conversionResult.message}</p>
                    <div className="font-mono font-bold text-indigo-700">
                      Application #{conversionResult.applicationNumber}
                    </div>
                  </div>
                ) : enquiry.conversion_status === "CONVERTED" ? (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 max-w-md mx-auto">
                    This enquiry has already been converted into an Admission Application.
                  </div>
                ) : (
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={handleConvert}
                    isLoading={isConverting}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Confirm &amp; Generate Application ID
                  </Button>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </Modal>
  );
}
