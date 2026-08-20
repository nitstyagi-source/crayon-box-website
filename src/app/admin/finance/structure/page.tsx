"use client";

import { useState, useEffect } from "react";
import { 
  Layers, Plus, Edit3, Trash2, CheckCircle2, 
  HelpCircle, ShieldCheck, Tag, DollarSign, Calendar, Clock, RefreshCw
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getFeeHeads, saveFeeHead, getFeeStructures } from "@/app/actions/finance-core";

export default function FeeMasterAndStructurePage() {
  const { activeCampusId } = useCampusContext();
  const [activeTab, setActiveTab] = useState<"heads" | "structures">("heads");
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [headModalOpen, setHeadModalOpen] = useState(false);
  const [headFormData, setHeadFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeCampusId]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [headsRes, structsRes] = await Promise.all([
        getFeeHeads(activeCampusId),
        getFeeStructures(activeCampusId)
      ]);
      if (headsRes.success) setFeeHeads(headsRes.data || []);
      if (structsRes.success) setFeeStructures(structsRes.data || []);
    } catch (e) {
      console.error("Error loading fee master data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenAddHead() {
    setHeadFormData({
      id: "",
      campus_id: activeCampusId,
      name: "",
      code: "",
      category: "Academic",
      description: "",
      is_refundable: false,
      is_taxable: false,
      tax_rate: 0,
      is_active: true
    });
    setHeadModalOpen(true);
  }

  function handleOpenEditHead(h: any) {
    setHeadFormData(h);
    setHeadModalOpen(true);
  }

  async function handleSaveHead(e: React.FormEvent) {
    e.preventDefault();
    if (!headFormData.name) return;
    setIsSaving(true);
    try {
      const res = await saveFeeHead(headFormData);
      if (res.success) {
        setHeadModalOpen(false);
        loadData();
      } else {
        alert("Failed to save fee head: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Centralized Fee Configuration
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Session 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Fee Master & Class Structures</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Manage reusable fee heads, class-wise fee schedules, frequencies, and late fee policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "heads" && (
            <button
              onClick={handleOpenAddHead}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Fee Head
            </button>
          )}
          <button
            onClick={loadData}
            className="p-2.5 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-xl transition border border-stone-200"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("heads")}
          className={`px-5 py-2 rounded-xl text-xs font-black transition ${
            activeTab === "heads" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
          }`}
        >
          Reusable Fee Heads ({feeHeads.length})
        </button>
        <button
          onClick={() => setActiveTab("structures")}
          className={`px-5 py-2 rounded-xl text-xs font-black transition ${
            activeTab === "structures" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
          }`}
        >
          Class Fee Structures ({feeStructures.length})
        </button>
      </div>

      {/* Content Tab 1: Reusable Fee Heads */}
      {activeTab === "heads" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-16 text-center text-xs text-stone-400">Loading fee heads...</div>
          ) : (
            feeHeads.map((head) => (
              <div
                key={head.id}
                className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      {head.code}
                    </span>
                    <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                      {head.category}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-stone-900">{head.name}</h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{head.description || 'General fee head'}</p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">
                    {head.is_refundable ? 'Refundable' : 'Non-Refundable'}
                  </span>
                  <button
                    onClick={() => handleOpenEditHead(head)}
                    className="text-purple-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Head
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Content Tab 2: Class Fee Structures */}
      {activeTab === "structures" && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-stone-400">Loading class fee structures...</div>
          ) : (
            feeStructures.map((st) => (
              <div key={st.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      {st.academic_session}
                    </span>
                    <h3 className="text-xl font-black text-stone-900 mt-1">{st.name}</h3>
                    <p className="text-xs text-stone-400">Applicable for {st.class_name} • Category: {st.fee_category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-stone-400">Total Annual Demand</span>
                    <div className="text-2xl font-black text-emerald-600">{formatCurrency(st.total_annual_amount)}</div>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-100 text-stone-400 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Fee Head</th>
                        <th className="py-2.5 px-3">Frequency</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Due Day</th>
                        <th className="py-2.5 px-3">Late Fee Rule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {st.fee_structure_items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-3 px-3 font-bold text-stone-900">{item.fee_head_name}</td>
                          <td className="py-3 px-3">
                            <span className="bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                              {item.frequency}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-black text-stone-800">{formatCurrency(item.amount)}</td>
                          <td className="py-3 px-3 text-stone-600">{item.due_day}th of month</td>
                          <td className="py-3 px-3 text-stone-500">
                            ₹{item.late_fee_per_day}/day (Max ₹{item.max_late_fee})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Fee Head Modal */}
      {headModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  {headFormData.id ? "Edit Fee Head" : "Add New Fee Head"}
                </h3>
                <p className="text-xs text-stone-400">Define a reusable fee head across all classes.</p>
              </div>
              <button onClick={() => setHeadModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveHead} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Fee Head Name</label>
                <input
                  type="text"
                  placeholder="e.g. Science Lab Fee"
                  value={headFormData.name}
                  onChange={(e) => setHeadFormData({ ...headFormData, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="LAB"
                    value={headFormData.code}
                    onChange={(e) => setHeadFormData({ ...headFormData, code: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category</label>
                  <select
                    value={headFormData.category}
                    onChange={(e) => setHeadFormData({ ...headFormData, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Auxiliary">Auxiliary</option>
                    <option value="Transport">Transport</option>
                    <option value="One-Time">One-Time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  value={headFormData.description}
                  onChange={(e) => setHeadFormData({ ...headFormData, description: e.target.value })}
                  placeholder="Brief summary of charges..."
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setHeadModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Fee Head"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
