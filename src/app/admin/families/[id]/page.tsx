"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users, ArrowLeft, Phone, Mail, ShieldAlert, CreditCard,
  ExternalLink, Download, CheckCircle2, UserCheck, Plus, Sparkles
} from 'lucide-react';

export default function Family360Page({ params }: { params: { id: string } }) {
  const [family, setFamily] = useState({
    id: params.id,
    familyName: 'Sharma Household',
    address: 'Flat 402, Tower B, Evergreen Heights, Sector 62, Noida, UP 201309',
    primaryContact: {
      name: 'Rajesh Sharma (Father)',
      phone: '+91 98100 12345',
      email: 'rajesh.sharma@techcorp.com',
      occupation: 'Senior Software Architect',
    },
    secondaryContact: {
      name: 'Pooja Sharma (Mother)',
      phone: '+91 98100 67890',
      email: 'pooja.sharma@univ.edu',
      occupation: 'Assistant Professor (Biotechnology)',
    },
    authorizedEscorts: [
      { name: 'Rameshwar Dayal', relation: 'Paternal Grandfather', phone: '+91 98111 22334', cardNo: 'ESC-2026-004', photoVerified: true },
      { name: 'Sunita Sharma', relation: 'Paternal Grandmother', phone: '+91 98111 22335', cardNo: 'ESC-2026-005', photoVerified: true },
    ],
    children: [
      {
        id: 'std-001',
        name: 'Aarav Sharma',
        grade: 'Grade 4-B',
        admissionNo: 'ADM-2026-042',
        gpa: '3.90 / 4.0',
        attendance: '94.7%',
        feeStatus: 'PAID (₹0.00 Due)',
        concession: 'Standard Base',
      },
      {
        id: 'std-002',
        name: 'Anaya Sharma',
        grade: 'Grade 1-A',
        admissionNo: 'ADM-2026-043',
        gpa: '3.95 / 4.0',
        attendance: '98.0%',
        feeStatus: 'PAID (₹0.00 Due)',
        concession: '15% Sibling Concession Applied',
      },
    ],
    householdFinancialSummary: {
      totalAnnualFee: 85200,
      totalSiblingSavings: 9600,
      netHouseholdPaid: 75600,
      outstandingBalance: 0,
    },
    complaintsAndQueries: [
      { id: 'HLP-042', date: '2026-06-10', title: 'Query regarding Robotics Lab Kit components', status: 'Resolved by Faculty' },
    ],
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/students"
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                Family 360° Household Master
              </span>
              <span className="text-stone-400 text-xs">•</span>
              <span className="text-stone-500 text-xs font-bold">{family.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {family.familyName}
            </h1>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Print Household Statement
        </button>
      </div>

      {/* Household Summary Card */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-stone-900">Residential Address</h3>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
              Verified Address
            </span>
          </div>
          <p className="text-xs text-stone-600 font-medium leading-relaxed">{family.address}</p>
          <div className="flex flex-wrap gap-4 text-xs text-stone-500 pt-2">
            <span className="flex items-center gap-1">📞 {family.primaryContact.phone}</span>
            <span className="flex items-center gap-1">✉️ {family.primaryContact.email}</span>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-2 text-xs">
          <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">Household Fee Metrics</span>
          <div className="flex justify-between"><span className="text-stone-500">Gross Billed:</span> <span className="font-bold text-stone-800">₹{family.householdFinancialSummary.totalAnnualFee.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-emerald-700 font-bold">Sibling Savings:</span> <span className="font-black text-emerald-700">-₹{family.householdFinancialSummary.totalSiblingSavings.toLocaleString()}</span></div>
          <div className="flex justify-between border-t border-purple-200 pt-2"><span className="text-stone-900 font-black">Net Settled:</span> <span className="font-black text-purple-900">₹{family.householdFinancialSummary.netHouseholdPaid.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Sibling Students Section */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" /> Enrolled Sibling Students ({family.children.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {family.children.map((ch) => (
            <div key={ch.id} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-stone-900">{ch.name}</h4>
                  <p className="text-xs text-stone-500 font-medium">{ch.grade} • {ch.admissionNo}</p>
                </div>
                <Link
                  href={`/admin/students/${ch.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  Student 360° <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50 rounded-xl text-center text-xs">
                <div><span className="text-[10px] text-stone-400">Attendance</span><p className="font-black text-emerald-600">{ch.attendance}</p></div>
                <div><span className="text-[10px] text-stone-400">GPA</span><p className="font-black text-indigo-600">{ch.gpa}</p></div>
                <div><span className="text-[10px] text-stone-400">Fee Status</span><p className="font-black text-stone-800">{ch.feeStatus}</p></div>
              </div>
              <span className="inline-block text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                🏷️ {ch.concession}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Authorized Pickup Escorts */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-600" /> Authorized Campus Pickup Escorts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {family.authorizedEscorts.map((esc, i) => (
            <div key={i} className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-black text-emerald-900">{esc.name}</h4>
                <p className="text-emerald-700 font-medium">{esc.relation} • 📞 {esc.phone}</p>
                <p className="font-mono text-[10px] text-emerald-600 font-bold mt-1">Escort Card: #{esc.cardNo}</p>
              </div>
              <span className="px-2.5 py-1 bg-white text-emerald-800 font-bold rounded-lg text-[10px] border border-emerald-200">
                Photo Verified
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
