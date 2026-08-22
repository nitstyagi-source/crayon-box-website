"use client";

import React, { useState } from 'react';
import {
  HeartPulse, ShieldAlert, AlertTriangle, CheckCircle2,
  Phone, Plus, Download, ArrowRight, Activity, Pill
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function CampusHealthClinicPage() {
  const [selectedInst, setSelectedInst] = useState<string>('CBS');

  const criticalAllergyAlerts = [
    {
      studentName: 'Aarav Sharma (Grade 4B - CBS)',
      condition: 'Severe Peanut Allergy (Anaphylaxis Risk)',
      actionProtocol: 'Administer EpiPen immediately + Call Parent & Emergency 108',
      epipenLocation: 'Infirmary Emergency Cabinet #2 + Classroom Emergency Kit',
      contactParent: 'Rajesh Sharma • 📞 +91 98100 12345',
    },
    {
      studentName: 'Vihaan Gupta (Grade 7A - AS)',
      condition: 'Asthma (Triggered by dust/running)',
      actionProtocol: 'Provide Inhaler (Ventolin 2 puffs) + Rest 15 mins',
      epipenLocation: 'Infirmary Emergency Cabinet #1',
      contactParent: 'Amit Gupta • 📞 +91 98111 55667',
    },
  ];

  const todayClinicVisits = [
    {
      id: 'MED-2026-112',
      time: '10:15 AM',
      studentName: 'Aditi Patel (Grade 4B)',
      symptoms: 'Mild fever (99.8°F) & Headache',
      treatment: 'Paracetamol 250mg administered with parent verbal consent + Temperature re-checked (98.6°F)',
      attendingNurse: 'Nurse Rita D\'Souza',
      parentInformed: true,
      status: 'RETURNED_TO_CLASS',
    },
    {
      id: 'MED-2026-113',
      time: '11:45 AM',
      studentName: 'Rohan Verma (Grade 9A)',
      symptoms: 'Minor knee scrape during basketball practice',
      treatment: 'Betadine antiseptic dressing applied + Ice pack for 10 mins',
      attendingNurse: 'Nurse Rita D\'Souza',
      parentInformed: false,
      status: 'RESOLVED',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Emergency Infirmary
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Campus Medical Desk</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Health Clinic & Emergency Medical Protocols</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Daily student infirmary visits, medication logs, and critical allergy emergency response protocols.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Health Register
          </button>
        </div>
      </div>

      {/* Critical Allergy Emergency Alerts */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-rose-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" /> Critical Medical & Allergy Emergency Protocols ({criticalAllergyAlerts.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criticalAllergyAlerts.map((alert, i) => (
            <div key={i} className="p-5 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <h3 className="font-black text-stone-900 text-sm">{alert.studentName}</h3>
                <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded-md uppercase">
                  HIGH ALERT
                </span>
              </div>
              <p className="font-bold text-rose-900">⚠️ {alert.condition}</p>
              <p className="text-stone-700 font-medium">📋 <strong>Action:</strong> {alert.actionProtocol}</p>
              <p className="text-stone-700 font-semibold">📍 <strong>Kit Location:</strong> {alert.epipenLocation}</p>
              <p className="text-stone-500 font-semibold pt-1 border-t border-rose-200">{alert.contactParent}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Infirmary Visits Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-rose-600" /> Today's Infirmary Log & Medical Treatment Register
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Visit ID & Time</th>
                <th className="p-3.5">Student Account</th>
                <th className="p-3.5">Symptoms / Complaint</th>
                <th className="p-3.5">Clinical Treatment Given</th>
                <th className="p-3.5">Attending Nurse</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {todayClinicVisits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-stone-900 block">{v.id}</span>
                    <span className="text-stone-400 text-[10px]">{v.time}</span>
                  </td>
                  <td className="p-3.5 font-bold text-stone-900">{v.studentName}</td>
                  <td className="p-3.5 font-semibold text-rose-800">{v.symptoms}</td>
                  <td className="p-3.5 text-stone-800 max-w-[280px]">{v.treatment}</td>
                  <td className="p-3.5 text-stone-600 font-medium">{v.attendingNurse}</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-[10px] uppercase">
                      {v.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
