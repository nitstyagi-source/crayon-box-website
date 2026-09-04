"use client";

import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  Send,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Thermometer,
  RefreshCw,
  Users,
  ShieldCheck,
  Stethoscope,
  Activity,
  BedDouble,
  Home
} from "lucide-react";
import {
  logInfirmaryVisitAction,
  getRecentInfirmaryVisitsAction,
  InfirmaryVisit
} from "@/app/actions/health-clinic-actions";

export function InfirmaryEhrDesk({
  defaultTab = "log_visit"
}: {
  defaultTab?: "log_visit" | "register";
}) {
  const [activeTab, setActiveTab] = useState<"log_visit" | "register">(defaultTab);
  const [visits, setVisits] = useState<InfirmaryVisit[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [studentName, setStudentName] = useState("Aarav Sharma");
  const [className, setClassName] = useState("Class 1-B");
  const [parentPhone, setParentPhone] = useState("+919810081008");
  const [symptoms, setSymptoms] = useState("Mild headache and slight feverish warmth");
  const [bodyTemp, setBodyTemp] = useState<number>(99.2);
  const [treatmentGiven, setTreatmentGiven] = useState("Rest on clinic bed for 20 mins, cool forehead compress applied, glass of water given.");
  const [medicineAdministered, setMedicineAdministered] = useState("Paracetamol 250mg syrup");
  const [actionStatus, setActionStatus] = useState<"RESTING_IN_CLINIC" | "SENT_BACK_TO_CLASS" | "SENT_HOME">("RESTING_IN_CLINIC");
  const [nurseName, setNurseName] = useState("Nurse Mary (RN)");

  useEffect(() => {
    loadVisits();
  }, []);

  async function loadVisits() {
    setIsLoading(true);
    try {
      const res = await getRecentInfirmaryVisitsAction();
      if (res.success) {
        setVisits(res.visits);
        setStats(res.stats);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogVisit(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await logInfirmaryVisitAction({
        studentName,
        className,
        parentPhone,
        symptoms,
        bodyTemperatureF: bodyTemp,
        treatmentGiven,
        medicineAdministered,
        actionStatus,
        nurseName
      });

      if (res.success) {
        alert(res.message);
        loadVisits();
        setActiveTab("register");
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rose-950 via-red-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <HeartPulse className="w-3.5 h-3.5" />
            Campus Health Infirmary &amp; Student Medical Care EHR
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-rose-400" />
            Digital Health Clinic &amp; Medical Log
          </h1>
          <p className="text-xs sm:text-sm text-rose-200/80 max-w-2xl">
            Log clinic visits, record vitals and medications, and auto-dispatch transparent WhatsApp health alerts to parents in real-time.
          </p>
        </div>

        {/* Live Clinic Stats */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 text-xs">
          <div className="w-3 h-3 rounded-full bg-rose-400 animate-ping" />
          <div className="space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1">
              <span>{stats?.restingInClinic || 1} Resting in Infirmary</span>
              <CheckCircle2 className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-rose-300/80 font-mono text-[11px]">
              Duty Nurse: Active on Duty
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-rose-600" />
            Visits Today
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats?.totalToday || visits.length}
          </div>
          <div className="text-[10px] text-rose-600 font-bold">100% Parent Notified</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 text-amber-600" />
            Resting in Clinic
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {stats?.restingInClinic || 1}
          </div>
          <div className="text-[10px] text-stone-500 font-bold">Under Observation</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Back to Class
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {stats?.backToClass || 1}
          </div>
          <div className="text-[10px] text-stone-500 font-bold">Minor Care Given</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <Home className="w-4 h-4 text-blue-600" />
            Sent Home
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900">
            {stats?.sentHome || 0}
          </div>
          <div className="text-[10px] text-stone-500 font-bold">Parent Escort Pickup</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("log_visit")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "log_visit"
              ? "border-rose-600 text-rose-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Plus className="w-4 h-4" />
          🏥 Log Student Medical Visit
        </button>

        <button
          onClick={() => setActiveTab("register")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "register"
              ? "border-rose-600 text-rose-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          📋 Daily Infirmary Register ({visits.length})
        </button>
      </div>

      {/* TAB 1: LOG VISIT */}
      {activeTab === "log_visit" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 max-w-3xl">
          <div className="border-b border-stone-200 pb-3">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-rose-600" />
              New Infirmary Consultation Record
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Logging will automatically dispatch a WhatsApp health notice to the student's registered parent.
            </p>
          </div>

          <form onSubmit={handleLogVisit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Class &amp; Section</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Parent WhatsApp / Phone</label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Body Temperature (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyTemp}
                  onChange={(e) => setBodyTemp(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900 focus:bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Symptoms Reported</label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Mild headache, stomach pain, scratch on knee..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Clinical Treatment / First Aid Given</label>
                <textarea
                  value={treatmentGiven}
                  onChange={(e) => setTreatmentGiven(e.target.value)}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 font-medium leading-relaxed focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Medicine Administered (if any)</label>
                <input
                  type="text"
                  value={medicineAdministered}
                  onChange={(e) => setMedicineAdministered(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Current Action Status</label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:bg-white"
                >
                  <option value="RESTING_IN_CLINIC">Resting in Infirmary Bed</option>
                  <option value="SENT_BACK_TO_CLASS">Sent Back to Classroom (Fit)</option>
                  <option value="SENT_HOME">Sent Home (Parent Pickup)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                🏥 Log Medical Visit &amp; Send WhatsApp Alert to Parent
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: REGISTER */}
      {activeTab === "register" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-600" />
                Daily Infirmary Consultation Log
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Complete medical records of all students treated in the school health clinic today.
              </p>
            </div>
            <button
              onClick={loadVisits}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-black">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Symptoms</th>
                  <th className="p-3">Temp (°F)</th>
                  <th className="p-3">Treatment / Medicine</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Visited Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-stone-50/50">
                    <td className="p-3 font-bold text-stone-900">{v.student_name}</td>
                    <td className="p-3">{v.class_name}</td>
                    <td className="p-3 text-stone-600">{v.symptoms}</td>
                    <td className="p-3 font-mono font-bold text-rose-800">{v.body_temperature_f}°F</td>
                    <td className="p-3">
                      <div className="text-stone-800">{v.treatment_given}</div>
                      {v.medicine_administered && v.medicine_administered !== 'None' && (
                        <span className="text-[10px] font-bold text-purple-700">Med: {v.medicine_administered}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.action_status === 'RESTING_IN_CLINIC'
                          ? 'bg-amber-100 text-amber-900'
                          : v.action_status === 'SENT_HOME'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {v.action_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right text-stone-400 font-mono text-[10px]">
                      {new Date(v.visited_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
