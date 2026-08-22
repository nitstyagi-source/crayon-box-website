"use client";

import React, { useState } from 'react';
import {
  Package, QrCode, Building2, Download, Plus,
  ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function AssetInventoryPage() {
  const [selectedInst, setSelectedInst] = useState<string>('ALL');

  const assets = [
    {
      id: 'AST-VET-401',
      assetName: 'Interactive Smart Interactive Panels (65")',
      category: 'IT & Digital Classroom',
      ownerTrustId: 'Vani Educational Trust',
      allocatedInstitution: 'CBS (15 Units) • AS (10 Units)',
      purchaseValue: '₹22,50,000',
      currentBookValue: '₹18,00,000',
      depreciationRate: '15% SLM',
      custodian: 'Mr. Vikram Singh (IT Admin)',
      warrantyExpiry: '2028-03-31',
      status: 'VERIFIED_ACTIVE',
    },
    {
      id: 'AST-VET-402',
      assetName: 'Robotics Core LEGO Spike Prime Kits',
      category: 'Robotics & STEM Lab',
      ownerTrustId: 'Vani Educational Trust',
      allocatedInstitution: 'CBS Lab (25 Units)',
      purchaseValue: '₹8,50,000',
      currentBookValue: '₹6,80,000',
      depreciationRate: '20% SLM',
      custodian: 'Prof. Anil Gupta (Robotics HOD)',
      warrantyExpiry: '2027-06-30',
      status: 'VERIFIED_ACTIVE',
    },
    {
      id: 'AST-VET-403',
      assetName: 'Montessori Sensorial Solid Cylinders & Tower Sets',
      category: 'Montessori Specialized Apparatus',
      ownerTrustId: 'Vani Educational Trust',
      allocatedInstitution: 'CBPS Sensory Wing',
      purchaseValue: '₹3,20,000',
      currentBookValue: '₹2,72,000',
      depreciationRate: '15% SLM',
      custodian: 'Mrs. Shalini Mehta',
      warrantyExpiry: '2029-12-31',
      status: 'VERIFIED_ACTIVE',
    },
  ];

  const consumablesStock = [
    { item: 'A4 Printing Paper Reams (75 GSM)', currentStock: '142 Reams', minReorderThreshold: '50 Reams', status: 'ADEQUATE' },
    { item: 'Infirmary Antiseptic Betadine 500ml', currentStock: '4 Bottles', minReorderThreshold: '5 Bottles', status: 'REORDER_NOW' },
    { item: 'Science Lab Hydrochloric Acid (Dilute)', currentStock: '8 Litres', minReorderThreshold: '5 Litres', status: 'ADEQUATE' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Asset & Stock Lifecycle
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Trust Asset Base: ₹1.82 Cr</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Fixed Asset Registry & Consumables Stock</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            QR asset tagging, location custodians, straight-line depreciation schedules, and automated stock reorder levels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Asset Register
          </button>
        </div>
      </div>

      {/* Fixed Asset Registry Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" /> Trust-Owned & Campus-Allocated Fixed Assets
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Asset Tag & Name</th>
                <th className="p-3.5">Category & Location</th>
                <th className="p-3.5 text-right">Purchase Cost</th>
                <th className="p-3.5 text-right">Current Book Value</th>
                <th className="p-3.5">Custodian</th>
                <th className="p-3.5">Warranty Expiry</th>
                <th className="p-3.5 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {assets.map((ast) => (
                <tr key={ast.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-black text-stone-900 block text-sm">{ast.assetName}</span>
                    <span className="font-mono text-stone-400 text-[10px]">{ast.id}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-stone-800 block">{ast.category}</span>
                    <span className="text-indigo-600 font-semibold text-[11px]">{ast.allocatedInstitution}</span>
                  </td>
                  <td className="p-3.5 text-right font-bold text-stone-800">{ast.purchaseValue}</td>
                  <td className="p-3.5 text-right font-black text-emerald-600">{ast.currentBookValue}</td>
                  <td className="p-3.5 font-semibold text-stone-700">{ast.custodian}</td>
                  <td className="p-3.5 text-stone-500 font-semibold">{ast.warrantyExpiry}</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-[10px] uppercase">
                      {ast.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consumables Inventory Re-Order Radar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-amber-600" /> Consumables Inventory & Automated Minimum Stock Radar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {consumablesStock.map((item, i) => (
            <div key={i} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <h3 className="font-black text-stone-900 text-sm">{item.item}</h3>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                  item.status === 'REORDER_NOW' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {item.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-stone-700 font-bold">Stock Available: {item.currentStock}</p>
              <p className="text-stone-500 font-semibold">Min Reorder Level: {item.minReorderThreshold}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
