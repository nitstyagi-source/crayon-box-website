"use client";

import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, Flame, Wrench, CheckCircle2,
  AlertTriangle, Download, Plus, Clock, FileText
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function SafetyCompliancePage() {
  const [selectedInst, setSelectedInst] = useState<string>('CBS');

  const statutoryComplianceItems = [
    { complianceName: 'Fire Safety NOC (Delhi Fire Service)', status: 'VALID_&_COMPLIANT', expiryDate: '2027-04-30', certNo: 'DFS/MS/2024/SCH/891' },
    { complianceName: 'Building Structural Stability Certificate', status: 'VALID_&_COMPLIANT', expiryDate: '2029-03-31', certNo: 'PWD/DEL/STR/2024-42' },
    { complianceName: 'Potable Drinking Water & Sanitation Certificate', status: 'VALID_&_COMPLIANT', expiryDate: '2027-02-28', certNo: 'DJB/LAB/2026/092' },
    { complianceName: 'Term Emergency Fire Evacuation Drill', status: 'COMPLETED_ON_SCHEDULE', expiryDate: '2026-11-15 (Next Scheduled)', certNo: 'DRILL-2026-T1' },
  ];

  const maintenanceWorkOrders = [
    { id: 'WO-2026-042', location: 'Physics Lab 2 (CBS)', issue: 'Circuit breaker tripping on high load', priority: 'HIGH', assignedTo: 'Chief Electrician R. K. Sharma', status: 'IN_PROGRESS' },
    { id: 'WO-2026-043', location: 'Auditorium AC Unit 4', issue: 'Compressor refrigerant top-up', priority: 'MEDIUM', assignedTo: 'Voltas AMC Technician', status: 'RESOLVED' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Statutory Governance
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">100% Audit Readiness</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Facility Maintenance & Fire Safety Compliance</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Statutory NOC renewals, building safety inspections, fire drill audits, and preventive facility work orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Compliance Pack
          </button>
        </div>
      </div>

      {/* Statutory Compliance Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" /> Statutory Safety Certifications & Audit Readiness ({selectedInst})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Statutory Certification</th>
                <th className="p-3.5">Certificate Number</th>
                <th className="p-3.5">Validity Expiry</th>
                <th className="p-3.5 text-right">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {statutoryComplianceItems.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5 font-bold text-stone-900">{item.complianceName}</td>
                  <td className="p-3.5 font-mono text-stone-500 font-semibold">{item.certNo}</td>
                  <td className="p-3.5 font-bold text-stone-800">{item.expiryDate}</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-[10px] uppercase">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Facility Maintenance Work Orders */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-indigo-600" /> Facility Maintenance Work Orders & Repairs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {maintenanceWorkOrders.map((wo) => (
            <div key={wo.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {wo.id}
                  </span>
                  <h3 className="font-black text-stone-900 text-sm mt-1">{wo.location}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                  wo.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {wo.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-stone-800 font-semibold">{wo.issue}</p>
              <p className="text-stone-500 font-medium pt-1 border-t border-stone-200">
                Assigned: {wo.assignedTo} • Priority: <span className="font-bold text-rose-600">{wo.priority}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
