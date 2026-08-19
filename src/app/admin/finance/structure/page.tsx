"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Copy, Search, CheckCircle2, XCircle, LayoutGrid, List, Trash2, DatabaseBackup } from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getFeeHeads, createFeeHead, deleteFeeHead } from "@/app/actions/fee-heads";

export default function FeeStructureModule() {
  const { activeCampusId } = useCampusContext();
  const [activeTab, setActiveTab] = useState<'heads' | 'structures'>('heads');
  
  // Real DB State
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIsMandatory, setNewIsMandatory] = useState(true);
  const [newIsRefundable, setNewIsRefundable] = useState(false);

  useEffect(() => {
    if (activeCampusId) {
      loadFeeHeads();
    }
  }, [activeCampusId]);

  async function loadFeeHeads() {
    setIsLoading(true);
    const res = await getFeeHeads(activeCampusId);
    if (res.success) {
      setFeeHeads(res.data || []);
    }
    setIsLoading(false);
  }

  async function handleCreateHead() {
    if (!newName.trim()) return;
    setIsAdding(false);
    const res = await createFeeHead(activeCampusId, newName, newIsMandatory, newIsRefundable);
    if (res.success) {
      setNewName("");
      loadFeeHeads();
    } else {
      alert(res.error);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this fee head?")) {
      const res = await deleteFeeHead(id);
      if (res.success) loadFeeHeads();
    }
  }

  const classStructures = [
    { grade: "Grade 5", academicYear: "2026-2027", items: 4, totalMonthly: 15000, totalYearly: 180000 },
    { grade: "Grade 6", academicYear: "2026-2027", items: 5, totalMonthly: 16500, totalYearly: 198000 },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900">Fee Structure & Heads</h1>
          <p className="text-stone-500 mt-1">Manage global fee items connected to the live database.</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search fee heads..." 
                className="pl-9 pr-4 py-2 w-full sm:w-72 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>
            <button onClick={() => setIsAdding(true)} className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Create Fee Head
            </button>
          </div>

          {isAdding && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="text-xs font-bold text-stone-500 block mb-1">Fee Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Activity Fee" 
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm"
                />
              </div>
              <div className="flex items-center gap-4 pb-2">
                <label className="flex items-center gap-2 text-sm font-bold text-stone-700 cursor-pointer">
                  <input type="checkbox" checked={newIsMandatory} onChange={(e) => setNewIsMandatory(e.target.checked)} className="rounded text-primary focus:ring-primary" /> Mandatory
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-stone-700 cursor-pointer">
                  <input type="checkbox" checked={newIsRefundable} onChange={(e) => setNewIsRefundable(e.target.checked)} className="rounded text-primary focus:ring-primary" /> Refundable
                </label>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2.5 text-stone-500 font-bold hover:bg-stone-200 rounded-xl w-full md:w-auto">Cancel</button>
                <button onClick={handleCreateHead} className="bg-green-600 text-white px-6 py-2.5 font-bold rounded-xl shadow-sm hover:bg-green-700 w-full md:w-auto">Save</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Mandatory</th>
                  <th className="p-4 font-bold">Refundable</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-stone-500">Loading live data...</td></tr>
                ) : feeHeads.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-stone-500">No fee heads found in database. Create one above!</td></tr>
                ) : (
                  feeHeads.map((head) => (
                    <tr key={head.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4 font-bold text-stone-900">{head.name}</td>
                      <td className="p-4">
                        {head.is_mandatory ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-stone-300" />}
                      </td>
                      <td className="p-4">
                        {head.is_refundable ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-stone-300" />}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(head.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'structures' && (
        <div className="space-y-6">
          {/* Keep structures static mock for now as this implies templates & items join */}
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold">Mapped Class Structures (Mock Preview)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classStructures.map((struct, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-stone-900">{struct.grade}</h3>
                  <span className="bg-stone-100 text-stone-500 text-xs font-bold px-2 py-1 rounded-md">{struct.academicYear}</span>
                </div>
                <button className="w-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-2">
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
