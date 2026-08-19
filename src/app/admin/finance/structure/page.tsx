"use client";

import { useState } from "react";
import { Plus, Edit2, Copy, Search, CheckCircle2, XCircle, LayoutGrid, List } from "lucide-react";

export default function FeeStructureModule() {
  const [activeTab, setActiveTab] = useState<'heads' | 'structures'>('heads');

  // Mock Data
  const feeHeads = [
    { id: "FH-01", name: "Tuition Fee", type: "Recurring", mandatory: true, refundable: false },
    { id: "FH-02", name: "Transport Fee", type: "Recurring", mandatory: false, refundable: false },
    { id: "FH-03", name: "Admission Fee", type: "One-time", mandatory: true, refundable: false },
    { id: "FH-04", name: "Security Deposit", type: "One-time", mandatory: true, refundable: true },
    { id: "FH-05", name: "Lab Fee", type: "Recurring", mandatory: false, refundable: false },
  ];

  const classStructures = [
    { grade: "Grade 5", academicYear: "2026-2027", items: 4, totalMonthly: 15000, totalYearly: 180000 },
    { grade: "Grade 6", academicYear: "2026-2027", items: 5, totalMonthly: 16500, totalYearly: 198000 },
    { grade: "Grade 7", academicYear: "2026-2027", items: 5, totalMonthly: 16500, totalYearly: 198000 },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900">Fee Structure & Heads</h1>
          <p className="text-stone-500 mt-1">Manage global fee items and class-wise pricing structures.</p>
        </div>
        <div className="flex gap-2 bg-stone-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('heads')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'heads' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <List className="w-4 h-4" /> Fee Heads
          </button>
          <button 
            onClick={() => setActiveTab('structures')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'structures' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Class Structures
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'heads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search fee heads..." 
                className="pl-9 pr-4 py-2 w-72 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>
            <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Create Fee Head
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Head ID</th>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Mandatory</th>
                  <th className="p-4 font-bold">Refundable</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {feeHeads.map((head, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 font-mono text-sm text-stone-500">{head.id}</td>
                    <td className="p-4 font-bold text-stone-900">{head.name}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                        head.type === 'Recurring' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {head.type}
                      </span>
                    </td>
                    <td className="p-4">
                      {head.mandatory ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-stone-300" />}
                    </td>
                    <td className="p-4">
                      {head.refundable ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-stone-300" />}
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-stone-400 hover:text-primary transition-colors hover:bg-stone-100 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'structures' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 items-center">
              <select className="bg-white border border-stone-200 text-stone-700 text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm focus:outline-none">
                <option>Academic Year: 2026-2027</option>
                <option>Academic Year: 2025-2026</option>
              </select>
              <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                <Copy className="w-4 h-4" /> Copy from previous year
              </button>
            </div>
            <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Map Class Structure
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classStructures.map((struct, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-stone-900">{struct.grade}</h3>
                  <span className="bg-stone-100 text-stone-500 text-xs font-bold px-2 py-1 rounded-md">{struct.academicYear}</span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Fee Items Attached</span>
                    <span className="font-bold text-stone-900">{struct.items} Items</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Monthly Avg</span>
                    <span className="font-bold text-stone-900">₹{struct.totalMonthly.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-3 border-t border-stone-100">
                    <span className="font-bold text-stone-700">Total Yearly Base</span>
                    <span className="font-black text-primary">₹{struct.totalYearly.toLocaleString()}</span>
                  </div>
                </div>
                <button className="w-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" /> Edit Breakup
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
