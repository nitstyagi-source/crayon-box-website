"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package, QrCode, Building2, Download, Plus,
  ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight,
  TrendingDown, RefreshCw, BarChart3, Layers, Send, X, Printer
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getFixedAssetsInventoryDashboardAction,
  registerNewFixedAssetAction,
  recordStockroomDisbursementAction
} from '@/app/actions/inventory-asset-actions';

export default function AssetInventoryPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [activeTab, setActiveTab] = useState<'assets' | 'consumables' | 'tags'>('assets');
  const [assets, setAssets] = useState<any[]>([]);
  const [consumables, setConsumables] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    totalAssetCount: 0,
    totalOriginalCost: 0,
    totalAccumulatedDep: 0,
    totalNetBookValue: 0,
    consumablesCount: 0,
    lowStockAlerts: 0,
    totalConsumableVal: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // New Asset Modal State
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetCat, setAssetCat] = useState('IT & Digital Classroom');
  const [assetLoc, setAssetLoc] = useState('Science Wing - Room 102');
  const [assetCost, setAssetCost] = useState('85000');
  const [assetLife, setAssetLife] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Disbursement Modal State
  const [disburseItem, setDisburseItem] = useState<any | null>(null);
  const [disburseQty, setDisburseQty] = useState('5');
  const [disburseTo, setDisburseTo] = useState('Senior Physics Lab In-Charge');
  const [disburseDept, setDisburseDept] = useState('Science Department');
  const [isDisbursing, setIsDisbursing] = useState(false);

  // QR Modal
  const [activeQrAsset, setActiveQrAsset] = useState<any | null>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    const res = await getFixedAssetsInventoryDashboardAction({});
    if (res.success) {
      setAssets(res.assets || []);
      setConsumables(res.consumables || []);
      setCounts(res.counts || { totalAssetCount: 0, totalOriginalCost: 0, totalAccumulatedDep: 0, totalNetBookValue: 0, consumablesCount: 0, lowStockAlerts: 0, totalConsumableVal: 0 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle New Asset Submit
  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) return;

    setIsSubmitting(true);
    const res = await registerNewFixedAssetAction({
      name: assetName,
      category: assetCat,
      location: assetLoc,
      purchaseCost: Number(assetCost),
      usefulLifeYears: Number(assetLife)
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsNewAssetModalOpen(false);
      setAssetName('');
      fetchInventory();
    } else {
      alert("Error: " + res.error);
    }
  };

  // Handle Stock Disbursement
  const handleDisburseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disburseItem) return;

    setIsDisbursing(true);
    const res = await recordStockroomDisbursementAction({
      itemId: disburseItem.id,
      quantity: Number(disburseQty),
      disbursedTo: disburseTo,
      department: disburseDept
    });
    setIsDisbursing(false);

    if (res.success) {
      setDisburseItem(null);
      fetchInventory();
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-400" />
              Fixed Asset & Consumable Inventory Ledger
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-400" />
            Fixed Asset Register & Depreciation Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Straight-line asset depreciation accounting, campus location tags, and consumable storekeeper reorder thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsNewAssetModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg shadow-indigo-600/20"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            🏢 Add Fixed Asset
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchInventory}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Register
          </Button>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Original Asset Cost</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">
            ₹{counts.totalOriginalCost.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">{counts.totalAssetCount} Capital Assets</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Accumulated Depreciation</span>
          <span className="text-3xl font-black text-rose-600 mt-1 block">
            -₹{counts.totalAccumulatedDep.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-rose-700 font-bold">Straight-Line Method</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Net Current Book Value</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">
            ₹{counts.totalNetBookValue.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold">Balance Sheet Value</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Stockroom Inventory</span>
          <span className="text-3xl font-black text-indigo-600 mt-1 block">
            ₹{counts.totalConsumableVal.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-indigo-700 font-bold">{counts.consumablesCount} Consumable Lines</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit flex-wrap">
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === 'assets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          Fixed Asset Register ({assets.length})
        </button>

        <button
          onClick={() => setActiveTab('consumables')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === 'consumables' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-amber-500" />
          Consumables Stockroom ({consumables.length})
        </button>
      </div>

      {/* 🌟 TAB 1: FIXED ASSET REGISTER */}
      {activeTab === 'assets' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Campus Capital Asset & Straight-Line Depreciation Ledger ({assets.length})
              </h3>
              <p className="text-xs text-slate-400">
                Asset tag numbers, vendor records, useful life span, annual depreciation, and book values.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-4">Asset Tag & SKU</th>
                  <th className="py-3 px-4">Item Name & Vendor</th>
                  <th className="py-3 px-4">Category & Location</th>
                  <th className="py-3 px-4">Purchase Cost</th>
                  <th className="py-3 px-4">Useful Life</th>
                  <th className="py-3 px-4">Annual Deprec.</th>
                  <th className="py-3 px-4">Accum. Deprec.</th>
                  <th className="py-3 px-4">Net Book Value</th>
                  <th className="py-3 px-4 text-right">QR Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {a.sku_code}
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block font-bold">{a.name}</strong>
                      <span className="text-[10px] text-slate-400 font-medium">{a.vendor_name}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 font-bold block">{a.category}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{a.location}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹{a.purchase_cost.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {a.useful_life_years} Years
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      ₹{a.annualDepreciation.toLocaleString('en-IN')}/yr
                    </td>

                    <td className="py-3.5 px-4 font-mono text-rose-600 font-medium">
                      -₹{a.accumulated_depreciation.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm">
                      ₹{a.current_book_value.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveQrAsset(a)}
                        className="text-[11px] py-1 px-3 hover:bg-indigo-50 hover:text-indigo-900 border-slate-300"
                        leftIcon={<QrCode className="w-3.5 h-3.5 text-indigo-600" />}
                      >
                        QR Tag
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🌟 TAB 2: CONSUMABLES STOCKROOM */}
      {activeTab === 'consumables' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Consumables Storekeeper Stock & Reorder Ledger ({consumables.length})
              </h3>
              <p className="text-xs text-slate-400">
                Examination answer sheets, stationery, lab chemicals, and robotics parts with low-stock alerts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-4">Item Name & Category</th>
                  <th className="py-3 px-4">Storage Location</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Total Inventory Value</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right">Disbursement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consumables.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block font-bold">{c.item_name}</strong>
                      <span className="text-[10px] text-indigo-600 font-bold uppercase">{c.category}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {c.storage_location}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {c.current_stock} <span className="text-[10px] text-slate-400 font-normal">{c.unit_of_measure}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {c.reorder_threshold} {c.unit_of_measure}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      ₹{c.unit_price}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-black text-indigo-700 text-sm">
                      ₹{c.totalValue.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        c.isLowStock ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {c.isLowStock ? '⚠️ Low Stock Reorder' : '✓ In Stock'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDisburseItem(c)}
                        className="text-[11px] py-1 px-3 hover:bg-amber-50 hover:text-amber-900 border-slate-300"
                        leftIcon={<Send className="w-3.5 h-3.5 text-amber-600" />}
                      >
                        Disburse
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🌟 ADD ASSET MODAL */}
      {isNewAssetModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Register Institutional Fixed Asset</h3>
              <button onClick={() => setIsNewAssetModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterAsset} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Asset Name / Model Description</label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  placeholder="e.g. 3D Laser Cutter & Robotics Hub"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Asset Category</label>
                  <select
                    value={assetCat}
                    onChange={(e) => setAssetCat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="IT & Digital Classroom">IT & Digital Classroom</option>
                    <option value="Science Laboratory">Science Laboratory</option>
                    <option value="Campus Furniture">Campus Furniture</option>
                    <option value="Montessori Early Years">Montessori Early Years</option>
                    <option value="Sports & Physical Education">Sports & Physical Education</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus Location</label>
                  <input
                    type="text"
                    value={assetLoc}
                    onChange={(e) => setAssetLoc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    placeholder="e.g. Robotics Lab (Room 304)"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Purchase Cost (INR)</label>
                  <input
                    type="number"
                    value={assetCost}
                    onChange={(e) => setAssetCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold font-mono text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Useful Life (Years)</label>
                  <input
                    type="number"
                    value={assetLife}
                    onChange={(e) => setAssetLife(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold font-mono text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsNewAssetModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  Save Fixed Asset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 DISBURSE CONSUMABLE MODAL */}
      {disburseItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Stock Disbursement
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{disburseItem.item_name}</h3>
              </div>
              <button onClick={() => setDisburseItem(null)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDisburseSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Available Stock:</span>
                <strong className="text-slate-900 font-mono text-sm">{disburseItem.current_stock} {disburseItem.unit_of_measure}</strong>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Disbursement Quantity ({disburseItem.unit_of_measure})</label>
                <input
                  type="number"
                  value={disburseQty}
                  onChange={(e) => setDisburseQty(e.target.value)}
                  max={disburseItem.current_stock}
                  min={1}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold font-mono text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Disbursed To (Recipient Name)</label>
                <input
                  type="text"
                  value={disburseTo}
                  onChange={(e) => setDisburseTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department / Requisitioning Wing</label>
                <input
                  type="text"
                  value={disburseDept}
                  onChange={(e) => setDisburseDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setDisburseItem(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isDisbursing} className="bg-amber-600 hover:bg-amber-500 text-white">
                  Confirm Disbursement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 QR ASSET TAG PRINT MODAL */}
      {activeQrAsset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black uppercase text-indigo-700">Official Asset Tag</span>
              <button onClick={() => setActiveQrAsset(null)} className="text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 p-6 rounded-2xl bg-slate-50 space-y-3">
              <div className="w-24 h-24 mx-auto bg-white border border-slate-300 rounded-xl flex items-center justify-center shadow-xs">
                <QrCode className="w-16 h-16 text-slate-900" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 inline-block">
                  {activeQrAsset.sku_code}
                </span>
                <h4 className="font-extrabold text-slate-900 text-xs mt-1">{activeQrAsset.name}</h4>
                <p className="text-[10px] text-slate-500">{activeQrAsset.location}</p>
                <span className="text-[9px] text-slate-400 block font-mono">Vani Educational Trust • Asset Property</span>
              </div>
            </div>

            <Button size="sm" variant="primary" onClick={() => window.print()} className="w-full bg-indigo-600 text-white" leftIcon={<Printer className="w-4 h-4" />}>
              Print Physical QR Tag
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
