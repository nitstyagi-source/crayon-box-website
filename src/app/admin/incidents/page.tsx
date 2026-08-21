"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, ShieldAlert, HeartPulse, Stethoscope, 
  Plus, Search, Filter, CheckCircle2, Clock, 
  PhoneCall, Users, Eye, Check, X, ArrowRight, 
  FileText, Calendar, MessageSquare, AlertCircle, 
  Building2, Lock, UserCheck, Activity, ChevronRight
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getIncidentDashboardStats,
  getSchoolIncidents,
  createSchoolIncident,
  updateIncidentStatus,
  updateIncidentParentCommunication
} from "@/app/actions/incidents";

const SEVERITIES = ["All", "Low", "Medium", "High", "Critical"];
const STATUSES = ["All", "Open", "Action Taken", "Follow-up Pending", "Closed"];

export default function IncidentsManagerPage() {
  const { activeCampusId } = useCampusContext();

  // Navigation Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "general" | "medical" | "followups" | "parent_log"
  >("dashboard");

  // Filter States
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalIncidentType, setModalIncidentType] = useState<"General" | "Medical">("General");
  const [selectedDetailIncident, setSelectedDetailIncident] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parent Notification Modal
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [parentCommForm, setParentCommForm] = useState({
    parentInformed: true,
    channel: "Phone Call",
    contactedBy: "Class Teacher",
    response: "Parent informed. Acknowledged.",
    pickupRequired: false,
    pickupPerson: "",
    pickupTime: ""
  });

  // Create Incident Form State
  const [form, setForm] = useState({
    incidentDate: new Date().toISOString().split("T")[0],
    incidentTime: "11:30 AM",
    location: "Primary Playground",
    personName: "Aarav Sharma",
    admissionNo: "CBS-2026-0129",
    className: "Grade 5",
    sectionName: "A",
    reportedBy: "Rahul Sharma",
    reportedByRole: "Class Teacher",
    category: "Minor Injury",
    severity: "Low" as "Low" | "Medium" | "High" | "Critical",
    description: "",
    immediateAction: "",
    witnesses: "",
    counsellingRequired: false,
    followUpRequired: false,
    followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    
    // Medical specific
    medicalSymptoms: "",
    injuryLocation: "Right Knee",
    firstAidGiven: "Antiseptic cleaning & bandage",
    medicineGiven: "None",
    nurseName: "Sister Anjali",
    doctorReferral: false,
    studentDisposition: "Returned to Class",

    // Parent
    parentInformed: false,
    parentNotificationChannel: "Not Required"
  });

  useEffect(() => {
    loadAllData();
  }, [activeCampusId, selectedSeverity, selectedStatus, searchQuery]);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [statsRes, incRes] = await Promise.all([
        getIncidentDashboardStats(activeCampusId),
        getSchoolIncidents({
          campusId: activeCampusId,
          severity: selectedSeverity,
          status: selectedStatus,
          search: searchQuery
        })
      ]);

      if (statsRes.success && statsRes.data) setDashboardStats(statsRes.data);
      if (incRes.success && incRes.data) setIncidents(incRes.data);
    } catch (e) {
      console.error("Error loading incidents:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // Create Incident Submit
  async function handleCreateIncidentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.personName || !form.description) return;

    setIsSubmitting(true);
    try {
      const res = await createSchoolIncident({
        campusId: activeCampusId,
        incidentType: modalIncidentType,
        ...form
      });

      if (res.success) {
        alert(res.message);
        setIsCreateModalOpen(false);
        loadAllData();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Update Status Submit
  async function handleUpdateStatus(incidentId: string, status: any) {
    const res = await updateIncidentStatus({ incidentId, status });
    if (res.success) {
      loadAllData();
    } else {
      alert("Error: " + res.error);
    }
  }

  // Parent Communication Submit
  async function handleParentCommSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDetailIncident) return;

    const res = await updateIncidentParentCommunication({
      incidentId: selectedDetailIncident.id,
      ...parentCommForm
    });

    if (res.success) {
      alert(res.message);
      setIsParentModalOpen(false);
      loadAllData();
    } else {
      alert("Error: " + res.error);
    }
  }

  const generalIncidents = incidents.filter(i => i.incident_type === "General");
  const medicalIncidents = incidents.filter(i => i.incident_type === "Medical");
  const followUpIncidents = incidents.filter(i => i.follow_up_required && i.status !== "Closed");

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-100 text-red-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-600" /> Confidential Safety &amp; Medical Log
            </span>
            <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Restricted Staff Access
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Incident &amp; Clinic Medical Records
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Structured logging for General Incidents (conflicts, safety) and Medical Incidents (first aid, clinic triage, parent handovers).
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setModalIncidentType("General");
              setIsCreateModalOpen(true);
            }}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> [ + General Incident ]
          </button>

          <button
            type="button"
            onClick={() => {
              setModalIncidentType("Medical");
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <HeartPulse className="w-4 h-4" /> [ + Medical Incident ]
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">Today&apos;s Incidents</span>
          <strong className="text-xl font-black text-stone-900 mt-0.5 block">{dashboardStats?.todayIncidents || 4}</strong>
        </div>

        <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] text-amber-800 font-bold uppercase block">Open Incidents</span>
          <strong className="text-xl font-black text-amber-950 mt-0.5 block">{dashboardStats?.openIncidents || 7}</strong>
        </div>

        <div className="bg-red-50/60 p-3.5 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-[10px] text-red-800 font-bold uppercase block">Medical / Clinic</span>
          <strong className="text-xl font-black text-red-950 mt-0.5 block">{dashboardStats?.medicalIncidents || 3}</strong>
        </div>

        <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] text-blue-800 font-bold uppercase block">General Incidents</span>
          <strong className="text-xl font-black text-blue-950 mt-0.5 block">{dashboardStats?.generalIncidents || 4}</strong>
        </div>

        <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[10px] text-rose-800 font-bold uppercase block">High / Critical</span>
          <strong className="text-xl font-black text-rose-950 mt-0.5 block">{dashboardStats?.highCritical || 1}</strong>
        </div>

        <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] text-purple-800 font-bold uppercase block">Pending Follow-up</span>
          <strong className="text-xl font-black text-purple-950 mt-0.5 block">{dashboardStats?.pendingFollowUp || 5}</strong>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "dashboard" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📊 Incident Dashboard &amp; Hotspots
        </button>

        <button
          onClick={() => setActiveTab("general")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "general" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🚨 General Incidents ({generalIncidents.length})
        </button>

        <button
          onClick={() => setActiveTab("medical")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "medical" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🩺 Medical &amp; Clinic ({medicalIncidents.length})
        </button>

        <button
          onClick={() => setActiveTab("followups")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "followups" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📅 Follow-up Tracker ({followUpIncidents.length})
        </button>

        <button
          onClick={() => setActiveTab("parent_log")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "parent_log" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📢 Parent Communication Log
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD & CAMPUS LOCATION HOTSPOTS */}
      {/* ========================================================================= */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Recent Live Incidents Feed */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">Recent Incident Timeline</h3>
                <p className="text-xs text-stone-500">Live safety &amp; medical occurrences across campus today.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-stone-100 text-stone-800 px-2.5 py-1 rounded-xl">
                Session 2026-27
              </span>
            </div>

            <div className="space-y-3">
              {incidents.slice(0, 5).map((inc) => (
                <div key={inc.id} className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                      inc.incident_type === "Medical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {inc.incident_type === "Medical" ? "🩺" : "⚠️"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-700">{inc.incident_code}</span>
                        <span className="text-stone-300">•</span>
                        <span className={`text-[10px] font-black px-2 py-0.2 rounded ${
                          inc.severity === "Critical" ? "bg-red-600 text-white" :
                          inc.severity === "High" ? "bg-rose-100 text-rose-900" :
                          inc.severity === "Medium" ? "bg-amber-100 text-amber-900" :
                          "bg-emerald-100 text-emerald-900"
                        }`}>
                          {inc.severity} Severity
                        </span>
                        <span className="text-stone-400 font-mono text-[10px]">{inc.incident_time}</span>
                      </div>
                      <strong className="text-stone-900 font-bold text-sm block mt-0.5">
                        {inc.person_name} ({inc.class_name}-{inc.section_name})
                      </strong>
                      <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-1">{inc.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-700">
                      {inc.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDetailIncident(inc)}
                      className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-[11px]"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campus Location Hotspots */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3 text-xs">
              <strong className="text-stone-900 font-black text-xs uppercase tracking-wider block">
                Campus Location Hotspots
              </strong>

              <div className="space-y-2">
                {[
                  { name: "Primary Playground (Swings & Turf)", count: 5, pct: 45 },
                  { name: "Junior Corridors & Staircase", count: 3, pct: 27 },
                  { name: "Cafeteria & Lunch Hall", count: 2, pct: 18 },
                  { name: "Science & Robotics Lab", count: 1, pct: 10 }
                ].map(loc => (
                  <div key={loc.name} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-stone-700">{loc.name}</span>
                      <span className="text-purple-700 font-mono">{loc.count} incidents</span>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${loc.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidentiality Notice */}
            <div className="p-4 bg-purple-50 rounded-3xl border border-purple-200 space-y-1.5 text-xs">
              <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-purple-700" /> Privacy &amp; Parent Access Rule
              </span>
              <p className="text-[11px] text-purple-950 leading-relaxed">
                Incident logs are strictly confidential. Parents only receive notifications when explicitly chosen by the Class Teacher or Clinic staff.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GENERAL INCIDENTS VIEW */}
      {/* ========================================================================= */}
      {activeTab === "general" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">General Incidents Register</h3>
              <p className="text-xs text-stone-500">Student conflicts, behavioral misconduct, playground disputes, and property safety.</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl">
              {generalIncidents.length} Logged
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {generalIncidents.map((inc) => (
              <div key={inc.id} className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-amber-700 font-bold">{inc.incident_code} • {inc.location}</span>
                    <strong className="text-stone-900 font-bold text-sm block mt-0.5">
                      {inc.person_name} ({inc.class_name}-{inc.section_name})
                    </strong>
                    <span className="text-[11px] text-stone-600 font-semibold">{inc.category} • Reported By: {inc.reported_by}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl ${
                    inc.severity === "Critical" ? "bg-red-600 text-white" :
                    inc.severity === "High" ? "bg-rose-100 text-rose-900" :
                    inc.severity === "Medium" ? "bg-amber-100 text-amber-900" :
                    "bg-emerald-100 text-emerald-900"
                  }`}>
                    {inc.severity} Severity
                  </span>
                </div>

                <p className="text-[11px] text-stone-700 leading-relaxed bg-white p-3 rounded-xl border border-stone-200/70">
                  {inc.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <div className="text-stone-500 space-x-2">
                    <span>⚡ <strong>Action:</strong> {inc.immediate_action}</span>
                    {inc.witnesses && <span>• 👥 <strong>Witnesses:</strong> {inc.witnesses}</span>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {inc.status !== "Closed" ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(inc.id, "Closed")}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px]"
                      >
                        ✓ Mark Resolved
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDetailIncident(inc);
                        setIsParentModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" /> Parent Comm
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MEDICAL & CLINIC INCIDENTS VIEW */}
      {/* ========================================================================= */}
      {activeTab === "medical" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Health Clinic &amp; Medical Triage Log</h3>
              <p className="text-xs text-stone-500">First aid, temperature monitoring, nurse assessments, and parent pickup authorizations.</p>
            </div>
            <span className="text-xs font-mono font-bold text-red-800 bg-red-50 px-2.5 py-1 rounded-xl">
              {medicalIncidents.length} Cases
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {medicalIncidents.map((med) => (
              <div key={med.id} className="p-4 bg-red-50/40 rounded-2xl border border-red-200/80 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-red-700 font-bold">{med.incident_code} • {med.incident_time}</span>
                    <strong className="text-stone-900 font-bold text-sm block mt-0.5">
                      {med.person_name} ({med.class_name}-{med.section_name})
                    </strong>
                    <span className="text-[11px] text-stone-600">{med.category} • Attended By: {med.nurse_name || "School Nurse"}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                    med.student_disposition === "Picked up by Parent" ? "bg-purple-100 text-purple-900" : "bg-emerald-100 text-emerald-900"
                  }`}>
                    {med.student_disposition}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-red-200/70 space-y-1.5 text-[11px]">
                  {med.medical_symptoms && <div>🩺 <strong>Symptoms:</strong> {med.medical_symptoms}</div>}
                  {med.injury_location && <div>🩹 <strong>Location:</strong> {med.injury_location}</div>}
                  {med.first_aid_given && <div>💊 <strong>First Aid:</strong> {med.first_aid_given}</div>}
                  {med.medicine_given && <div>🌿 <strong>Medication:</strong> {med.medicine_given}</div>}
                </div>

                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-stone-500 font-mono">
                    Parent: {med.parent_informed ? `Informed via ${med.parent_notification_channel}` : "Not contacted"}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDetailIncident(med);
                      setIsParentModalOpen(true);
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" /> Update Parent Log
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FOLLOW-UP TRACKER */}
      {/* ========================================================================= */}
      {activeTab === "followups" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Pending Follow-up &amp; Post-Incident Reviews</h3>
            <p className="text-xs text-stone-500">Cases requiring student counseling, behavioral check-ins, or clinic recovery review.</p>
          </div>

          <div className="space-y-3">
            {followUpIncidents.map((f) => (
              <div key={f.id} className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] font-mono text-purple-800 font-bold">Follow-up Due: {f.follow_up_date || "Today"}</span>
                  <strong className="text-stone-900 font-bold text-sm block mt-0.5">
                    {f.person_name} ({f.class_name}-{f.section_name})
                  </strong>
                  <span className="text-[11px] text-stone-600">{f.category} • {f.description}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(f.id, "Closed")}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs"
                  >
                    ✓ Complete &amp; Close Case
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PARENT COMMUNICATION AUDIT LOG */}
      {/* ========================================================================= */}
      {activeTab === "parent_log" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Parent Notification &amp; Handover Audit Log</h3>
            <p className="text-xs text-stone-500">Time-stamped audit of all phone calls, app circulars, and early pickup handovers.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Student &amp; Class</th>
                  <th className="p-3">Incident Ref</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Contacted By</th>
                  <th className="p-3">Parent Response &amp; Pickup</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {incidents.filter(i => i.parent_informed).map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/70">
                    <td className="p-3">
                      <strong className="text-stone-900 font-bold block">{p.person_name}</strong>
                      <span className="text-[10px] text-stone-400">{p.class_name}-{p.section_name}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-purple-700">{p.incident_code}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                        {p.parent_notification_channel}
                      </span>
                    </td>
                    <td className="p-3 text-stone-600">{p.parent_contacted_by}</td>
                    <td className="p-3 max-w-xs">
                      <p className="text-[11px] text-stone-700 truncate">{p.parent_response}</p>
                      {p.pickup_required && (
                        <span className="text-[10px] font-bold text-amber-800">
                          Pickup by: {p.pickup_person} ({p.pickup_handover_time})
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        Logged
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 CREATE INCIDENT MODAL (GENERAL & MEDICAL) */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 font-bold block">
                  Incident Reporting Desk
                </span>
                <h3 className="text-base font-black text-stone-900">
                  Record New {modalIncidentType} Incident
                </h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            {/* Type Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setModalIncidentType("General")}
                className={`py-2 rounded-xl font-bold transition ${modalIncidentType === "General" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"}`}
              >
                ⚠️ General Incident
              </button>
              <button
                type="button"
                onClick={() => setModalIncidentType("Medical")}
                className={`py-2 rounded-xl font-bold transition ${modalIncidentType === "Medical" ? "bg-white text-red-700 shadow-xs" : "text-stone-500"}`}
              >
                🩺 Medical / Clinic
              </button>
            </div>

            <form onSubmit={handleCreateIncidentSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={form.personName}
                    onChange={(e) => setForm({ ...form, personName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Class &amp; Section</label>
                  <input
                    type="text"
                    value={`${form.className}-${form.sectionName}`}
                    onChange={(e) => {
                      const parts = e.target.value.split("-");
                      setForm({ ...form, className: parts[0] || "Grade 5", sectionName: parts[1] || "A" });
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.incidentDate}
                    onChange={(e) => setForm({ ...form, incidentDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Time *</label>
                  <input
                    type="text"
                    required
                    value={form.incidentTime}
                    onChange={(e) => setForm({ ...form, incidentTime: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Severity *</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                  >
                    <option value="Low">🟢 Low</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="High">🟠 High</option>
                    <option value="Critical">🔴 Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Campus Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Playground (Swing Area) / Science Lab"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Incident Category *</label>
                <input
                  type="text"
                  required
                  placeholder={modalIncidentType === "Medical" ? "e.g. Fall, Minor Abrasion, Fever" : "e.g. Student conflict, Bullying, Property damage"}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description of Incident *</label>
                <textarea
                  rows={2}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Immediate Action Taken *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Escorted to clinic, First aid applied, Separated students"
                  value={form.immediateAction}
                  onChange={(e) => setForm({ ...form, immediateAction: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                />
              </div>

              {/* Medical Specific Fields */}
              {modalIncidentType === "Medical" && (
                <div className="bg-red-50/50 p-4 rounded-2xl border border-red-200 space-y-3">
                  <span className="font-bold text-red-950 block text-[11px] uppercase">Clinic Details</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Symptoms</label>
                      <input
                        type="text"
                        placeholder="e.g. Fever 101°F, Knee scrape"
                        value={form.medicalSymptoms}
                        onChange={(e) => setForm({ ...form, medicalSymptoms: e.target.value })}
                        className="w-full bg-white border border-red-200 rounded-xl p-2"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">First Aid Given</label>
                      <input
                        type="text"
                        value={form.firstAidGiven}
                        onChange={(e) => setForm({ ...form, firstAidGiven: e.target.value })}
                        className="w-full bg-white border border-red-200 rounded-xl p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Disposition</label>
                    <select
                      value={form.studentDisposition}
                      onChange={(e) => setForm({ ...form, studentDisposition: e.target.value })}
                      className="w-full bg-white border border-red-200 rounded-xl p-2 font-bold"
                    >
                      <option value="Returned to Class">Returned to Class</option>
                      <option value="Resting in Infirmary">Resting in Infirmary</option>
                      <option value="Picked up by Parent">Picked up by Parent</option>
                      <option value="Referred to Hospital">Referred to Hospital</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-black rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Saving..." : "Save Confidential Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 PARENT COMMUNICATION MODAL */}
      {/* ========================================================================= */}
      {isParentModalOpen && selectedDetailIncident && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-700 font-bold">Parent Communication Desk</span>
                <h3 className="text-base font-black text-stone-900 mt-0.5">
                  Update Log for {selectedDetailIncident.person_name}
                </h3>
              </div>
              <button onClick={() => setIsParentModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <form onSubmit={handleParentCommSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Communication Channel *</label>
                <select
                  value={parentCommForm.channel}
                  onChange={(e) => setParentCommForm({ ...parentCommForm, channel: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold"
                >
                  <option value="Phone Call">📞 Phone Call</option>
                  <option value="App Notification">🔔 App Notification</option>
                  <option value="WhatsApp">💬 WhatsApp Alert</option>
                  <option value="SMS">📱 SMS</option>
                  <option value="In Person">🤝 In Person at School Gate</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Parent Response *</label>
                <textarea
                  rows={2}
                  required
                  value={parentCommForm.response}
                  onChange={(e) => setParentCommForm({ ...parentCommForm, response: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-medium"
                />
              </div>

              <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={parentCommForm.pickupRequired}
                  onChange={(e) => setParentCommForm({ ...parentCommForm, pickupRequired: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <span className="font-bold text-stone-800">Student Early Pickup Handover Required</span>
              </label>

              {parentCommForm.pickupRequired && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Pickup Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Mother / Father"
                      value={parentCommForm.pickupPerson}
                      onChange={(e) => setParentCommForm({ ...parentCommForm, pickupPerson: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Handover Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 01:45 PM"
                      value={parentCommForm.pickupTime}
                      onChange={(e) => setParentCommForm({ ...parentCommForm, pickupTime: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsParentModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Parent Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedDetailIncident && !isParentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-700 font-bold">{selectedDetailIncident.incident_code}</span>
                <h3 className="text-base font-black text-stone-900 mt-0.5">
                  {selectedDetailIncident.person_name} ({selectedDetailIncident.class_name}-{selectedDetailIncident.section_name})
                </h3>
              </div>
              <button onClick={() => setSelectedDetailIncident(null)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <div className="space-y-2 text-stone-700">
              <div>📍 <strong>Location:</strong> {selectedDetailIncident.location}</div>
              <div>⏰ <strong>Time:</strong> {selectedDetailIncident.incident_date} at {selectedDetailIncident.incident_time}</div>
              <div>🚨 <strong>Category:</strong> {selectedDetailIncident.category}</div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <strong>Description:</strong> {selectedDetailIncident.description}
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950">
                <strong>Action Taken:</strong> {selectedDetailIncident.immediate_action}
              </div>
              {selectedDetailIncident.first_aid_given && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-red-950">
                  <strong>First Aid:</strong> {selectedDetailIncident.first_aid_given}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedDetailIncident(null)}
                className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
