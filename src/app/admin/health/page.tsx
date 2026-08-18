"use client";

import { useState } from "react";
import { AlertCircle, FileText, Pill, Search, ShieldAlert, PhoneCall, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function HealthClinicDashboard() {
  const [isAlerting, setIsAlerting] = useState(false);

  const handleEmergencyLog = () => {
    setIsAlerting(true);
    setTimeout(() => {
      alert("Emergency Webhook Triggered! SMS sent to parents and Principal.");
      setIsAlerting(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 md:p-8 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"><ShieldAlert className="w-6 h-6" /></div>
            Campus Health Clinic
          </h1>
          <p className="text-slate-500 mt-1">Nurses Station • Main Campus</p>
        </div>
        
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Scan or search student ID..." className="pl-10 pr-4 py-3 w-full md:w-80 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Patient Profile (Simulated Scan Result) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-slate-900 p-6 flex flex-col items-center text-center relative">
              <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">High Risk Allergy</div>
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden mb-4 shadow-xl">
                <Image src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Student" width={96} height={96} className="object-cover" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Leo Carter</h2>
              <p className="text-slate-400 text-sm">Grade 4A • ID: CBS-2026-042</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Blood Group</span>
                <span className="text-lg font-black text-red-600">O+</span>
              </div>
              
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Critical Allergies</span>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-red-50 text-red-700 px-3 py-1 rounded border border-red-100 font-bold text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Peanut (Anaphylaxis)</span>
                  <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded border border-amber-100 font-bold text-sm flex items-center gap-2">Penicillin</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Emergency Contacts</span>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Sarah Carter (Mother)</p>
                    <p className="text-xs text-slate-500 mt-1">+1 (555) 019-8472</p>
                  </div>
                  <button className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors">
                    <PhoneCall className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Medical Logging Form */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Log Medical Incident</h2>
              <p className="text-sm text-slate-500">Record symptoms and actions taken for Leo Carter.</p>
            </div>

            <div className="p-6 md:p-8 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Symptoms Observed</label>
                  <textarea rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none" placeholder="e.g. Mild fever, coughing..."></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Diagnosis / Assessment</label>
                  <textarea rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none" placeholder="e.g. Suspected viral infection..."></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-red-600">Action Taken *</label>
                  <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500">
                    <option>First Aid Administered (Resting in Clinic)</option>
                    <option>Medication Provided</option>
                    <option>Sent Home with Parent</option>
                    <option value="emergency">Emergency Hospital Transfer (EpiPen Used)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Vitals</label>
                  <div className="flex items-center gap-3">
                    <input type="text" placeholder="Temp (°F)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
                    <input type="text" placeholder="BPM" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
                  </div>
                </div>
              </div>

              {/* Emergency Triggers (Per User Requirement) */}
              <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-6 h-6 border-2 border-red-300 rounded bg-white peer-checked:bg-red-500 peer-checked:border-red-500 transition-colors"></div>
                    <CheckCircle2 className="absolute text-white w-4 h-4 opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-900">Trigger Emergency Protocol</h4>
                    <p className="text-sm text-red-700 mt-1">This will immediately fire a Webhook SMS to the Emergency Contact and alert the Campus Principal.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <button className="text-slate-500 font-bold hover:text-slate-700">Clear Form</button>
              <button 
                onClick={handleEmergencyLog} 
                disabled={isAlerting}
                className={`px-8 py-4 font-bold rounded-xl shadow-xl transition-all flex items-center gap-2 ${isAlerting ? 'bg-red-400 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
              >
                {isAlerting ? 'Dispatching Alerts...' : 'Save & Dispatch Log'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
