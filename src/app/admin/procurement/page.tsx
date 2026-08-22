"use client";

import React, { useState } from 'react';
import {
  Package, ShoppingCart, Truck, CheckCircle2, AlertTriangle,
  Building2, Download, Plus, FileText, ArrowRight, ShieldCheck
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function ProcurementBudgetingPage() {
  const [selectedInst, setSelectedInst] = useState<string>('CBS');

  const budgetAllocations = [
    { department: 'STEM & Robotics Lab', budget: '₹18,00,000', committed: '₹14,20,000', available: '₹3,80,000', utilization: '78.8%' },
    { department: 'Library & Learning Media', budget: '₹6,50,000', committed: '₹4,80,000', available: '₹1,70,000', utilization: '73.8%' },
    { department: 'Campus Infrastructure & Maintenance', budget: '₹24,00,000', committed: '₹19,50,000', available: '₹4,50,000', utilization: '81.2%' },
    { department: 'Sports Equipment & Kits', budget: '₹5,00,000', committed: '₹3,90,000', available: '₹1,10,000', utilization: '78.0%' },
  ];

  const purchaseRequisitions = [
    {
      id: 'PR-2026-088',
      date: '2026-08-20',
      vendor: 'RoboTech Solutions India Pvt Ltd',
      itemDescription: '50x Arduino Uno R3 Starter Kits & Sensor Packs',
      amount: '₹1,45,000',
      requestedBy: 'Prof. Anil Gupta (Robotics HOD)',
      currentTier: 'Trust Finance Approval',
      status: 'UNDER_APPROVAL',
    },
    {
      id: 'PR-2026-089',
      date: '2026-08-21',
      vendor: 'Oxford University Press',
      itemDescription: 'Annual CBSE Library Books & Graded Readers Batch 1',
      amount: '₹85,000',
      requestedBy: 'Mrs. Reena Joshi (Librarian)',
      currentTier: 'Approved (PO Dispatched)',
      status: 'APPROVED',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Spend & Procurement Control
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Session 2026–2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Departmental Budgeting & Vendor Procurement</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Departmental budgets, multi-tier purchase approval matrices, vendor contracts, and GRN verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Procurement Ledger
          </button>
        </div>
      </div>

      {/* Budget Allocation Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" /> Departmental Budget Allocation & Spend Radar ({selectedInst})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Department / Cost Center</th>
                <th className="p-3.5 text-right">Annual Budget</th>
                <th className="p-3.5 text-right">Committed Spend</th>
                <th className="p-3.5 text-right">Available Balance</th>
                <th className="p-3.5 text-right">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {budgetAllocations.map((dept, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5 font-bold text-stone-900">{dept.department}</td>
                  <td className="p-3.5 text-right font-bold text-stone-800">{dept.budget}</td>
                  <td className="p-3.5 text-right font-black text-indigo-600">{dept.committed}</td>
                  <td className="p-3.5 text-right font-black text-emerald-600">{dept.available}</td>
                  <td className="p-3.5 text-right font-bold text-stone-800">{dept.utilization}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Requisitions Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-blue-600" /> Active Purchase Requisitions & PO Pipeline
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">PR ID & Vendor</th>
                <th className="p-3.5">Item Description</th>
                <th className="p-3.5">Requested By</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5">Approval Tier</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {purchaseRequisitions.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-stone-900 block">{pr.id}</span>
                    <span className="text-stone-500 font-semibold">{pr.vendor}</span>
                  </td>
                  <td className="p-3.5 font-medium text-stone-800 max-w-[250px]">{pr.itemDescription}</td>
                  <td className="p-3.5 font-semibold text-stone-700">{pr.requestedBy}</td>
                  <td className="p-3.5 text-right font-black text-stone-900">{pr.amount}</td>
                  <td className="p-3.5 font-bold text-indigo-700">{pr.currentTier}</td>
                  <td className="p-3.5 text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      pr.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {pr.status.replace(/_/g, ' ')}
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
