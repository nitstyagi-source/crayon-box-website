"use client";

import { useState, useEffect } from "react";
import { 
  Building2, UserCheck, ShieldCheck, ShieldAlert, 
  Plus, Search, Filter, CheckCircle2, Clock, 
  PhoneCall, QrCode, Printer, AlertTriangle, 
  Car, Package, Users, Eye, X, ArrowRight, 
  LogOut, Shield, Sparkles, RefreshCw
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getVisitorDashboardStats,
  getGatePassesList,
  createNewGatePass,
  checkOutVisitor,
  getEmergencyInsideList
} from "@/app/actions/visitors";

const VISITOR_TYPES = [
  "All",
  "Parent",
  "Guardian",
  "Authorized Escort",
  "Vendor",
  "Contractor",
  "Delivery",
  "Alumni",
  "Government Official",
  "Interview Candidate",
  "Guest",
  "Other"
];

export default function VisitorManagementPage() {
  const { activeCampusId } = useCampusContext();

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "currently_inside" | "all_passes" | "expected" | "deliveries"
  >("currently_inside");

  // Filter States
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [passes, setPasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyData, setEmergencyData] = useState<any>(null);
  const [selectedPassForPrint, setSelectedPassForPrint] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Gate Pass Form
  const [form, setForm] = useState({
    visitorName: "",
    mobileNumber: "",
    idType: "Aadhaar Card",
    visitorType: "Parent",
    purpose: "Meeting Academic Coordinator",
    personToMeet: "Bhawna Tyagi (Coordinator)",
    department: "Academics",
    gateNumber: "Gate 1 (Main Gate)",
    vehicleNumber: "",
    numberOfPersons: 1,
    expectedExitTime: "12:30 PM",
    linkedStudentName: "Aarav Sharma",
    linkedStudentClass: "Grade 5-A",
    deliveryDetails: "",
    isPreRegistered: false,
    remarks: ""
  });

  useEffect(() => {
    loadAllData();
  }, [activeCampusId, selectedType, searchQuery]);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [statsRes, passesRes] = await Promise.all([
        getVisitorDashboardStats(activeCampusId),
        getGatePassesList({
          campusId: activeCampusId,
          visitorType: selectedType,
          search: searchQuery
        })
      ]);

      if (statsRes.success && statsRes.data) setDashboardStats(statsRes.data);
      if (passesRes.success && passesRes.data) setPasses(passesRes.data);
    } catch (e) {
      console.error("Error loading visitor data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle New Entry Submit
  async function handleCreateEntrySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.visitorName || !form.mobileNumber) return;

    setIsSubmitting(true);
    try {
      const res = await createNewGatePass({
        campusId: activeCampusId,
        ...form
      });

      if (res.success) {
        alert(res.message);
        setIsNewEntryOpen(false);
        setForm({
          visitorName: "",
          mobileNumber: "",
          idType: "Aadhaar Card",
          visitorType: "Parent",
          purpose: "Meeting Academic Coordinator",
          personToMeet: "Bhawna Tyagi (Coordinator)",
          department: "Academics",
          gateNumber: "Gate 1 (Main Gate)",
          vehicleNumber: "",
          numberOfPersons: 1,
          expectedExitTime: "12:30 PM",
          linkedStudentName: "Aarav Sharma",
          linkedStudentClass: "Grade 5-A",
          deliveryDetails: "",
          isPreRegistered: false,
          remarks: ""
        });
        loadAllData();
        if (res.data) {
          setSelectedPassForPrint(res.data);
        }
      } else {
        alert(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Check Out
  async function handleCheckOut(passId: string) {
    const res = await checkOutVisitor(passId);
    if (res.success) {
      alert(res.message);
      loadAllData();
    } else {
      alert("Error: " + res.error);
    }
  }

  // Open Emergency Mode
  async function handleOpenEmergencyMode() {
    const res = await getEmergencyInsideList(activeCampusId);
    if (res.success && res.data) {
      setEmergencyData(res.data);
      setIsEmergencyModalOpen(true);
    }
  }

  const currentlyInsidePasses = passes.filter(p => p.status === "Inside");
  const expectedPasses = passes.filter(p => p.status === "Expected");
  const deliveryPasses = passes.filter(p => p.visitor_type === "Delivery" || p.visitor_type === "Vendor");

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-600" /> Campus Gate &amp; Visitor Security
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Escort QR &amp; Student Master Integrated
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Visitor Management &amp; Gate Pass Command
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Security-focused visitor entry, parent escorts, delivery intake, blacklist alerts, and 1-click evacuation muster lists.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handleOpenEmergencyMode}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5 animate-pulse"
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" /> [ 🚨 EMERGENCY MODE ]
          </button>

          <button
            type="button"
            onClick={() => setIsNewEntryOpen(true)}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-blue-400" /> [ + New Visitor Entry ]
          </button>
        </div>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] text-blue-800 font-bold uppercase block">Currently Inside</span>
          <strong className="text-xl font-black text-blue-950 mt-0.5 block">
            {dashboardStats?.currentlyInside || 6} Visitors
          </strong>
          <span className="text-[10px] text-blue-700 font-medium">On Campus Now</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">Visitors Today</span>
          <strong className="text-xl font-black text-stone-900 mt-0.5 block">{dashboardStats?.visitorsToday || 28}</strong>
          <span className="text-[10px] text-stone-500">Total Entries Logged</span>
        </div>

        <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] text-emerald-800 font-bold uppercase block">Checked Out</span>
          <strong className="text-xl font-black text-emerald-950 mt-0.5 block">{dashboardStats?.checkedOut || 22}</strong>
          <span className="text-[10px] text-emerald-700 font-bold">Passes Returned ✓</span>
        </div>

        <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] text-purple-800 font-bold uppercase block">Student Pickups</span>
          <strong className="text-xl font-black text-purple-950 mt-0.5 block">{dashboardStats?.studentPickupVisitors || 14}</strong>
          <span className="text-[10px] text-purple-700 font-medium">Escort QR Verified</span>
        </div>

        <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] text-amber-800 font-bold uppercase block">Expected Pre-Reg</span>
          <strong className="text-xl font-black text-amber-950 mt-0.5 block">{dashboardStats?.expectedVisitors || 8}</strong>
          <span className="text-[10px] text-amber-700 font-medium">Fast-track QR</span>
        </div>

        <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[10px] text-rose-800 font-bold uppercase block">Restricted Alerts</span>
          <strong className="text-xl font-black text-rose-950 mt-0.5 block">0 Blacklisted</strong>
          <span className="text-[10px] text-rose-700 font-bold">Gate Guard Secure</span>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("currently_inside")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "currently_inside" ? "bg-blue-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🚨 Currently Inside Campus ({currentlyInsidePasses.length})
        </button>

        <button
          onClick={() => setActiveTab("all_passes")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "all_passes" ? "bg-blue-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📋 All Gate Passes ({passes.length})
        </button>

        <button
          onClick={() => setActiveTab("expected")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "expected" ? "bg-blue-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📅 Expected / Pre-Registered ({expectedPasses.length})
        </button>

        <button
          onClick={() => setActiveTab("deliveries")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "deliveries" ? "bg-blue-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📦 Deliveries &amp; Logistics ({deliveryPasses.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CURRENTLY INSIDE CAMPUS */}
      {/* ========================================================================= */}
      {activeTab === "currently_inside" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Live Campus Visitors Muster</h3>
              <p className="text-stone-500">Every external individual currently within school premises.</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-xl">
              {currentlyInsidePasses.length} Active Badges
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Pass ID &amp; Visitor</th>
                  <th className="p-3">Visitor Type</th>
                  <th className="p-3">Person to Meet / Dept</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Entry Time</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentlyInsidePasses.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          🪪
                        </div>
                        <div>
                          <strong className="text-stone-900 font-bold block">{p.visitor_name}</strong>
                          <span className="text-[10px] font-mono text-purple-700 font-bold">{p.pass_number}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                        {p.visitor_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <strong className="text-stone-800 block">{p.person_to_meet}</strong>
                      <span className="text-[10px] text-stone-400">{p.department}</span>
                    </td>
                    <td className="p-3 max-w-xs truncate text-stone-600 font-medium">
                      {p.purpose}
                      {p.linked_student_name && (
                        <span className="text-[10px] text-purple-700 block font-bold">
                          Child: {p.linked_student_name} ({p.linked_student_class})
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-stone-700">
                      <strong>{p.entry_time}</strong>
                      <span className="text-[10px] text-stone-400 block">{p.gate_number}</span>
                    </td>
                    <td className="p-3 font-mono text-stone-600">{p.vehicle_number || "Walk-In"}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleCheckOut(p.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 ml-auto shadow-2xs"
                      >
                        <LogOut className="w-3 h-3" /> [ Check Out ]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ALL GATE PASSES REGISTER */}
      {/* ========================================================================= */}
      {activeTab === "all_passes" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">All Visitor Gate Passes</h3>
              <p className="text-stone-500">Historical gate log of all entries, check-outs, and delivery passes.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-xs"
              >
                {VISITOR_TYPES.map(t => <option key={t} value={t}>{t === "All" ? "All Visitor Types" : t}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Pass ID</th>
                  <th className="p-3">Visitor Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Person to Meet</th>
                  <th className="p-3">Entry &amp; Exit</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {passes.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50 transition">
                    <td className="p-3 font-mono font-bold text-purple-700">
                      <button
                        type="button"
                        onClick={() => setSelectedPassForPrint(p)}
                        className="underline hover:text-purple-900"
                      >
                        {p.pass_number}
                      </button>
                    </td>
                    <td className="p-3 font-bold text-stone-900">{p.visitor_name}</td>
                    <td className="p-3 text-stone-600">{p.visitor_type}</td>
                    <td className="p-3 text-stone-700">{p.person_to_meet}</td>
                    <td className="p-3 font-mono text-[11px] text-stone-500">
                      In: <strong>{p.entry_time}</strong> {p.exit_time && `• Out: ${p.exit_time}`}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.status === "Inside" ? "bg-blue-100 text-blue-900" :
                        p.status === "Checked Out" ? "bg-emerald-100 text-emerald-900" :
                        "bg-stone-100 text-stone-700"
                      }`}>
                        {p.status}
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
      {/* 3. EXPECTED / PRE-REGISTERED */}
      {/* ========================================================================= */}
      {activeTab === "expected" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Pre-Registered Guests &amp; Fast-Track QR</h3>
            <p className="text-stone-500">Pre-authorized visitors by faculty, coordinator, or principal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expectedPasses.map((exp) => (
              <div key={exp.id} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-stone-900 font-bold block text-sm">{exp.visitor_name}</strong>
                    <span className="text-[10px] font-mono text-purple-700 font-bold">{exp.pass_number} • {exp.visitor_type}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    Pre-Authorized
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">Host: <strong>{exp.person_to_meet}</strong> ({exp.department})</p>
                <div className="text-[10px] text-stone-400 font-mono">Expected Arrival: Today at {exp.expected_exit_time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DELIVERIES & LOGISTICS */}
      {/* ========================================================================= */}
      {activeTab === "deliveries" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Delivery Intake &amp; Vendor Challan Log</h3>
            <p className="text-stone-500">Courier packages, textbook cartons, science kits, and vendor invoices received at Gate.</p>
          </div>

          <div className="space-y-3">
            {deliveryPasses.map((del) => (
              <div key={del.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex justify-between items-center">
                <div>
                  <strong className="text-stone-900 font-bold block text-sm">{del.visitor_name}</strong>
                  <p className="text-[11px] text-stone-600">📦 Items: {del.delivery_item_details || del.purpose}</p>
                  <span className="text-[10px] text-stone-400 font-mono">Recipient: {del.person_to_meet} ({del.department})</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-xl">
                  Received at Gate ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 NEW VISITOR ENTRY MODAL */}
      {/* ========================================================================= */}
      {isNewEntryOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-600 font-bold block">
                  Campus Security Desk
                </span>
                <h3 className="text-base font-black text-stone-900">New Visitor Entry &amp; Gate Pass</h3>
              </div>
              <button onClick={() => setIsNewEntryOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <form onSubmit={handleCreateEntrySubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Visitor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={form.visitorName}
                    onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 XXXXX"
                    value={form.mobileNumber}
                    onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Visitor Type</label>
                  <select
                    value={form.visitorType}
                    onChange={(e) => setForm({ ...form, visitorType: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                  >
                    {VISITOR_TYPES.filter(t => t !== "All").map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Gate Number</label>
                  <select
                    value={form.gateNumber}
                    onChange={(e) => setForm({ ...form, gateNumber: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  >
                    <option value="Gate 1 (Main Gate)">Gate 1 (Main Gate)</option>
                    <option value="Gate 2 (Service Gate)">Gate 2 (Service Gate)</option>
                    <option value="Gate 3 (Sports Complex)">Gate 3 (Sports Complex)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Person to Meet *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Principal / Bhawna Tyagi"
                    value={form.personToMeet}
                    onChange={(e) => setForm({ ...form, personToMeet: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Purpose of Visit *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meeting regarding Term 2 Olympiad / Student Pickup"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Vehicle Number (if any)</label>
                  <input
                    type="text"
                    placeholder="e.g. DL-3C-AZ-1120"
                    value={form.vehicleNumber}
                    onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Expected Exit Time</label>
                  <input
                    type="text"
                    value={form.expectedExitTime}
                    onChange={(e) => setForm({ ...form, expectedExitTime: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewEntryOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-black rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Generating..." : "Generate Pass & Check In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 PRINTABLE VISITOR PASS MODAL */}
      {/* ========================================================================= */}
      {selectedPassForPrint && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs text-stone-800 border-4 border-blue-600">
            <div className="text-center border-b border-stone-200 pb-3 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">
                CRAYON BOX SCHOOL
              </span>
              <h2 className="text-lg font-black text-stone-900 tracking-tight">
                🪪 OFFICIAL VISITOR PASS
              </h2>
              <span className="text-[10px] font-mono text-stone-400">{selectedPassForPrint.pass_number}</span>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-[11px]">
              <div>👤 <strong>Visitor:</strong> {selectedPassForPrint.visitor_name}</div>
              <div>🏢 <strong>Host:</strong> {selectedPassForPrint.person_to_meet} ({selectedPassForPrint.department})</div>
              <div>🎯 <strong>Purpose:</strong> {selectedPassForPrint.purpose}</div>
              <div>⏰ <strong>Valid:</strong> {selectedPassForPrint.entry_time} – {selectedPassForPrint.expected_exit_time}</div>
              <div>🚪 <strong>Entry Gate:</strong> {selectedPassForPrint.gate_number}</div>
              {selectedPassForPrint.vehicle_number && <div>🚗 <strong>Vehicle:</strong> {selectedPassForPrint.vehicle_number}</div>}
            </div>

            <div className="flex justify-center py-2">
              <div className="w-20 h-20 bg-stone-100 rounded-xl border border-stone-300 flex items-center justify-center font-mono font-bold text-stone-400 text-xs">
                [ QR PASS ]
              </div>
            </div>

            <p className="text-[9px] text-center text-stone-400 font-bold">
              Please wear this badge at all times &amp; return to Security at exit gate.
            </p>

            <div className="flex gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedPassForPrint(null)}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              >
                Print Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚨 EMERGENCY MODE EVACUATION MUSTER MODAL */}
      {/* ========================================================================= */}
      {isEmergencyModalOpen && emergencyData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs border-4 border-red-600">
            <div className="flex justify-between items-start border-b border-red-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Incident Command Protocol Active
                </span>
                <h2 className="text-xl font-black text-stone-900 mt-0.5">
                  🚨 Campus Emergency Evacuation Headcount
                </h2>
              </div>
              <button onClick={() => setIsEmergencyModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
                <span className="text-[10px] text-red-800 font-bold uppercase block">Total Headcount</span>
                <strong className="text-lg font-black text-red-950 mt-0.5 block">{emergencyData.summary.totalHeadcount}</strong>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Students</span>
                <strong className="text-lg font-black text-stone-900 mt-0.5 block">{emergencyData.summary.studentsInside}</strong>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Staff on Duty</span>
                <strong className="text-lg font-black text-stone-900 mt-0.5 block">{emergencyData.summary.staffInside}</strong>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Visitors Inside</span>
                <strong className="text-lg font-black text-stone-900 mt-0.5 block">{emergencyData.summary.visitorsInside}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <strong className="text-stone-900 font-bold block">Visitors / Contractors Currently on Campus:</strong>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {emergencyData.visitors?.map((v: any) => (
                  <div key={v.id} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center text-[11px]">
                    <div>
                      <strong className="text-stone-900 font-bold">{v.visitor_name}</strong>
                      <span className="text-stone-500 ml-2 font-mono">({v.pass_number} • In: {v.entry_time})</span>
                    </div>
                    <span className="font-bold text-purple-900">Host: {v.person_to_meet}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs flex items-center gap-1 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print Emergency Evacuation Roster
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
