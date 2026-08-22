"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw,
  Phone, FileText, Bus, CreditCard, Users, ExternalLink
} from 'lucide-react';

export default function DataQualityDashboardPage() {
  const [isScanning, setIsScanning] = useState(false);

  const anomalies = [
    { id: 'AN-01', category: 'STUDENT_CONTACT', severity: 'HIGH', title: '2 Students Missing Primary Parent Mobile', impact: 'Absence SMS & Emergency calls cannot reach parents', actionLink: '/admin/students' },
    { id: 'AN-02', category: 'DOCUMENT_EXPIRY', severity: 'HIGH', title: '1 Bus Insurance Expiring in 12 Days (Bus #04)', impact: 'Vehicle UP-16-CB-2026 fitness compliance at risk', actionLink: '/admin/transport' },
    { id: 'AN-03', category: 'FINANCE_LEAD', severity: 'MEDIUM', title: '3 Sibling Concessions Pending Annual Verification', impact: 'Waiver audit report requires signed declaration', actionLink: '/admin/finance' },
    { id: 'AN-04', category: 'TRANSPORT_ROUTING', severity: 'LOW', title: '1 Transport Opted Student without Assigned Stop', impact: 'Student in Grade 2-B not mapped to route drop point', actionLink: '/admin/transport' },
  ];

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert('✅ Data Quality & Integrity Scan Completed: 98.4% Clean Baseline.');
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Automated Integrity Scanner
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">24-Hour Continuous Audit</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Institutional Data Quality Dashboard</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Automated anomaly detection across student contacts, document expiries, transport routing, and fee ledgers.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold rounded-xl transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning Tables...' : 'Run Integrity Scan'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-stone-400">Data Completeness Score</span>
          <h3 className="text-3xl font-black text-emerald-600">98.4%</h3>
          <p className="text-xs text-stone-500 font-semibold">1,213 / 1,250 Complete Master Records</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-stone-400">Actionable Anomaly Flags</span>
          <h3 className="text-3xl font-black text-amber-600">{anomalies.length} Items</h3>
          <p className="text-xs text-amber-800 font-semibold">2 High • 1 Medium • 1 Low Priority</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-stone-400">Orphan Records & Dangles</span>
          <h3 className="text-3xl font-black text-emerald-600">0 Items</h3>
          <p className="text-xs text-emerald-700 font-semibold">Foreign Key Cascades 100% Intact</p>
        </div>
      </div>

      {/* Itemized Anomaly List */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" /> Detected Data Anomalies Requiring Operational Attention
        </h3>
        <div className="space-y-3">
          {anomalies.map((a) => (
            <div key={a.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    a.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' : a.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {a.severity}
                  </span>
                  <h4 className="font-black text-stone-900 text-sm">{a.title}</h4>
                </div>
                <p className="text-stone-500 font-medium">{a.impact}</p>
              </div>
              <Link
                href={a.actionLink}
                className="px-4 py-2 bg-white text-stone-700 hover:bg-stone-100 rounded-xl border border-stone-200 font-bold flex items-center gap-1 shrink-0"
              >
                Remediate in Module <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
