"use client";

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Package,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Printer,
  Sparkles,
  Tag,
  Truck,
  Check,
  Building2,
  IndianRupee,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  getStoreInventoryAction,
  createStoreOrderAction,
  markOrderFulfilledAction,
  StoreKit,
  StoreOrder
} from '@/app/actions/school-store-actions';

export function SchoolStoreManagerDesk() {
  const [kits, setKits] = useState<StoreKit[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'kits' | 'pickups'>('kits');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New Order Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedKitId, setSelectedKitId] = useState('');
  const [studentName, setStudentName] = useState('Vihaan Tyagi');
  const [grade, setGrade] = useState('Class 5');
  const [parentName, setParentName] = useState('Nitin Tyagi');
  const [parentPhone, setParentPhone] = useState('+91 99990 12345');
  const [pickupSlot, setPickupSlot] = useState('Saturday 09:00 AM - 11:00 AM (Auditorium Gate)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const res = await getStoreInventoryAction();
    if (res.success) {
      setKits(res.kits);
      setOrders(res.orders);
      if (res.kits.length > 0 && !selectedKitId) {
        setSelectedKitId(res.kits[0].id);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrder = async () => {
    if (!studentName || !parentPhone) return;
    setIsSubmitting(true);
    try {
      const res = await createStoreOrderAction({
        kitId: selectedKitId,
        studentName,
        grade,
        parentName,
        parentPhone,
        pickupSlot
      });

      if (res.success && res.order) {
        setOrders((prev) => [res.order!, ...prev]);
        setSuccessToast(`Order ${res.order.order_number} created for ${res.order.student_name}! Stock inventory updated.`);
        setShowOrderModal(false);
        await loadData();
      }
    } catch (e: any) {
      alert(`Error creating store order: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFulfill = async (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'FULFILLED' } : o))
    );
    await markOrderFulfilledAction(orderId);
  };

  const totalSalesRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingPickups = orders.filter((o) => o.status === 'READY_FOR_PICKUP').length;
  const fulfilledCount = orders.filter((o) => o.status === 'FULFILLED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#FAF7F2] to-[#F5EFE6] border border-[#E8DFC8] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] shadow-sm">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">
                School Uniform, Textbook &amp; Stationery E-Commerce Store
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D97706]" />
                Auto-Bundle Kits
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Parents pre-order grade-specific complete academic bundles (uniform sets, NCERT textbook sets, exercise books, art kits) with slot-based campus pickup to eliminate long vendor lines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-stone-50 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowOrderModal(true)}
            className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-amber-100" />
            Place Student Kit Order
          </Button>
        </div>
      </div>

      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Store Sales Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">
            ₹{totalSalesRevenue.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 mt-1 font-medium">
            <span>Direct UPI &amp; Bank Settled</span>
          </div>
        </Card>

        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Ready for Campus Pickup
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] border border-amber-200 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">{pendingPickups} Kits</p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#D97706] mt-1 font-medium">
            <span>Slot reserved at Gate A</span>
          </div>
        </Card>

        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Distributed &amp; Handed Over
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">{fulfilledCount} Families</p>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-700 mt-1">
            <span>QR verified pickups</span>
          </div>
        </Card>

        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Bundles in Inventory
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">
            {kits.reduce((sum, k) => sum + k.in_stock, 0)} In Stock
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-700 mt-1">
            <span>Auto-decrementing inventory</span>
          </div>
        </Card>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-2">
        <button
          onClick={() => setActiveSubTab('kits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'kits'
              ? 'bg-[#FAF7F2] text-[#D97706] border border-[#D97706] shadow-2xs'
              : 'text-stone-600 hover:bg-stone-50 border border-transparent'
          }`}
        >
          1. Academic Kit Bundles &amp; Pricing ({kits.length})
        </button>

        <button
          onClick={() => setActiveSubTab('pickups')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'pickups'
              ? 'bg-[#FAF7F2] text-[#D97706] border border-[#D97706] shadow-2xs'
              : 'text-stone-600 hover:bg-stone-50 border border-transparent'
          }`}
        >
          2. Campus Pickup &amp; Fulfillment Queue ({orders.length})
        </button>
      </div>

      {/* VIEW 1: KITS CATALOG */}
      {activeSubTab === 'kits' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kits.map((kit) => (
            <div
              key={kit.id}
              className="border border-[#E8DFC8] rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="p-5 border-b border-[#E8DFC8] bg-[#FAF7F2]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#D97706] bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {kit.grade} Bundle
                  </span>
                  <span className="text-xs font-bold text-stone-700 font-mono">
                    {kit.in_stock} Units Left
                  </span>
                </div>
                <h4 className="text-sm font-bold text-stone-900 mt-2">
                  {kit.title}
                </h4>
                <div className="text-2xl font-black text-stone-900 mt-1">
                  ₹{kit.price.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-5 flex-1 space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed">
                  {kit.description}
                </p>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                    Items Included in Bundle:
                  </span>
                  {kit.items_included.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-[#E8DFC8] bg-[#FAF7F2]/60">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedKitId(kit.id);
                    setGrade(kit.grade);
                    setShowOrderModal(true);
                  }}
                  className="w-full bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold shadow-xs"
                >
                  Reserve Bundle for Student
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: PICKUP QUEUE */}
      {activeSubTab === 'pickups' && (
        <div className="border border-[#E8DFC8] rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FAF7F2] text-stone-600 font-semibold border-b border-[#E8DFC8]">
                <tr>
                  <th className="py-3 px-4">Order Ref #</th>
                  <th className="py-3 px-4">Student &amp; Grade</th>
                  <th className="py-3 px-4">Parent Contact</th>
                  <th className="py-3 px-4">Kit Bundle</th>
                  <th className="py-3 px-4">Pickup Time Slot</th>
                  <th className="py-3 px-4 text-center">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFC8]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-stone-800">{ord.order_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{ord.student_name}</div>
                      <div className="text-[11px] text-stone-500">{ord.grade}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-stone-800">{ord.parent_name}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{ord.parent_phone}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-700 max-w-xs truncate">
                      {ord.kit_title}
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-medium">
                      {ord.pickup_slot}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-stone-900">
                      ₹{ord.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          ord.status === 'FULFILLED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {ord.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ord.status === 'READY_FOR_PICKUP' ? (
                        <Button
                          size="sm"
                          onClick={() => handleFulfill(ord.id)}
                          className="text-[11px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Hand Over
                        </Button>
                      ) : (
                        <span className="text-[11px] text-stone-400 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Place Student Kit Order */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#E8DFC8] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-bold text-stone-900 text-base">
                  Place Academic Bundle Order
                </h3>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Select Bundle</label>
                <select
                  value={selectedKitId}
                  onChange={(e) => {
                    setSelectedKitId(e.target.value);
                    const k = kits.find((x) => x.id === e.target.value);
                    if (k) setGrade(k.grade);
                  }}
                  className="w-full text-xs border border-[#E8DFC8] rounded-lg p-2 bg-white text-stone-800"
                >
                  {kits.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.title} — ₹{k.price.toLocaleString('en-IN')} ({k.in_stock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Student Name</label>
                  <Input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="text-xs border-[#E8DFC8]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Grade</label>
                  <Input
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="text-xs border-[#E8DFC8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Parent Name</label>
                  <Input
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="text-xs border-[#E8DFC8]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Parent Phone</label>
                  <Input
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="text-xs border-[#E8DFC8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Campus Pickup Slot</label>
                <select
                  value={pickupSlot}
                  onChange={(e) => setPickupSlot(e.target.value)}
                  className="w-full text-xs border border-[#E8DFC8] rounded-lg p-2 bg-white text-stone-800"
                >
                  <option value="Saturday 09:00 AM - 11:00 AM (Auditorium Gate)">
                    Saturday 09:00 AM - 11:00 AM (Auditorium Gate)
                  </option>
                  <option value="Saturday 11:00 AM - 01:00 PM (Auditorium Gate)">
                    Saturday 11:00 AM - 01:00 PM (Auditorium Gate)
                  </option>
                  <option value="Sunday 10:00 AM - 12:00 PM (Main Gate B)">
                    Sunday 10:00 AM - 12:00 PM (Main Gate B)
                  </option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFC8]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOrderModal(false)}
                className="border-[#E8DFC8] text-stone-700"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateOrder}
                disabled={isSubmitting || !studentName}
                className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold"
              >
                {isSubmitting ? 'Confirming...' : 'Complete Order & Generate Slip'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
