"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users, Search, Filter, Download, Plus, ArrowRight,
  ExternalLink, Eye, Phone, CreditCard, Sparkles, UserCheck
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function StudentsDirectoryPage() {
  const [selectedInst, setSelectedInst] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const studentList = [
    {
      uuid: 'STU-VET-882109',
      admissionNo: 'CBS-2026-0042',
      name: 'Aarav Sharma',
      institutionCode: 'CBS',
      grade: 'Grade 4',
      section: 'B',
      rollNo: '14',
      parentName: 'Rajesh Sharma',
      parentPhone: '+91 98100 12345',
      status: 'ACTIVE',
      feeStatus: 'PAID (₹0 Due)',
      siblingCount: 1,
    },
    {
      uuid: 'STU-VET-882110',
      admissionNo: 'CBPS-2026-0018',
      name: 'Anaya Sharma',
      institutionCode: 'CBPS',
      grade: 'Nursery',
      section: 'A',
      rollNo: '08',
      parentName: 'Rajesh Sharma',
      parentPhone: '+91 98100 12345',
      status: 'ACTIVE',
      feeStatus: 'PAID (₹0 Due)',
      siblingCount: 1,
    },
    {
      uuid: 'STU-VET-882144',
      admissionNo: 'AS-2026-0128',
      name: 'Vihaan Gupta',
      institutionCode: 'AS',
      grade: 'Grade 7',
      section: 'A',
      rollNo: '21',
      parentName: 'Amit Gupta',
      parentPhone: '+91 98111 55667',
      status: 'ACTIVE',
      feeStatus: 'PAID (₹0 Due)',
      siblingCount: 0,
    },
    {
      uuid: 'STU-VET-882190',
      admissionNo: 'AVM-2026-0442',
      name: 'Rohan Verma',
      institutionCode: 'AVM',
      grade: 'Grade 9',
      section: 'A',
      rollNo: '05',
      parentName: 'Dr. Sunita Verma',
      parentPhone: '+91 98222 33445',
      status: 'ACTIVE',
      feeStatus: 'PENDING (₹45,000)',
      siblingCount: 1,
    },
  ];

  const filtered = studentList.filter((s) => {
    const matchInst = selectedInst === 'ALL' || s.institutionCode === selectedInst;
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parentPhone.includes(searchQuery);
    return matchInst && matchSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Universal Student Master
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">2,850 Enrolled Students</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Student Information System (SIS)</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Search universal student records, view 360° dossiers, and inspect enrollment statuses across all 4 institutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Directory
          </button>
        </div>
      </div>

      {/* Filter & Search Ribbon */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedInst('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedInst === 'ALL' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Institutions
          </button>
          {VANI_TRUST_INSTITUTIONS.map((inst) => (
            <button
              key={inst.code}
              onClick={() => setSelectedInst(inst.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedInst === inst.code ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {inst.code} ({inst.shortName})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name, admission no..."
            className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Registered Students Directory ({filtered.length})
          </h2>
          <span className="text-xs text-stone-400 font-semibold">Click row to open Student 360°</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Student & Admission No</th>
                <th className="p-3.5">Institution & Class</th>
                <th className="p-3.5">Parent / Guardian</th>
                <th className="p-3.5">Fee Status</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filtered.map((std) => (
                <tr key={std.uuid} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-black text-stone-900 block text-sm">{std.name}</span>
                    <span className="font-mono text-stone-400 text-[11px] font-bold">{std.admissionNo}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 mr-1.5">
                      {std.institutionCode}
                    </span>
                    <span className="font-bold text-stone-800">{std.grade} - {std.section}</span>
                    <span className="text-stone-400 text-[11px] block">Roll No: {std.rollNo}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-stone-900 block">{std.parentName}</span>
                    <span className="text-stone-500 text-[11px]">📞 {std.parentPhone}</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`font-bold ${std.feeStatus.includes('PENDING') ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {std.feeStatus}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      {std.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href="/admin/students/std-001"
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> 360° Dossier
                    </Link>
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
