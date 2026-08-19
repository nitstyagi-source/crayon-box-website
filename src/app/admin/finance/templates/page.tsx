"use client";

import { useState, useEffect } from "react";
import { FileSignature, Plus, Trash2 } from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getFeeTemplates, createFeeTemplate, deleteFeeTemplate } from "@/app/actions/fee-templates";
import { getFeeHeads } from "@/app/actions/fee-heads";

export default function TemplatesModule() {
  const { activeCampusId } = useCampusContext();
  const [templates, setTemplates] = useState<any[]>([]);
  const [feeHeads, setFeeHeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newAcademicYear, setNewAcademicYear] = useState("2026-2027");
  const [selectedHeads, setSelectedHeads] = useState<any[]>([]);

  useEffect(() => {
    if (activeCampusId) {
      loadData();
    }
  }, [activeCampusId]);

  async function loadData() {
    setIsLoading(true);
    const [tRes, hRes] = await Promise.all([
      getFeeTemplates(activeCampusId),
      getFeeHeads(activeCampusId)
    ]);
    if (tRes.success) setTemplates(tRes.data || []);
    if (hRes.success) setFeeHeads(hRes.data || []);
    setIsLoading(false);
  }

  function handleAddHeadToTemplate(headId: string) {
    if (!headId) return;
    if (selectedHeads.find(h => h.fee_head_id === headId)) return;
    setSelectedHeads([...selectedHeads, { fee_head_id: headId, amount: 0, frequency: "Monthly" }]);
  }

  function handleUpdateHeadAmount(index: number, amount: number) {
    const updated = [...selectedHeads];
    updated[index].amount = amount;
    setSelectedHeads(updated);
  }

  function handleRemoveHead(index: number) {
    const updated = [...selectedHeads];
    updated.splice(index, 1);
    setSelectedHeads(updated);
  }

  async function handleSaveTemplate() {
    if (!newTemplateName.trim()) return;
    setIsAdding(false);
    const res = await createFeeTemplate(activeCampusId, newTemplateName, newAcademicYear, selectedHeads);
    if (res.success) {
      setNewTemplateName("");
      setSelectedHeads([]);
      loadData();
    } else {
      alert(res.error);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this template?")) {
      const res = await deleteFeeTemplate(id);
      if (res.success) loadData();
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <FileSignature className="w-7 h-7 text-stone-400" />
             Fee Templates
          </h1>
          <p className="text-stone-500 mt-1">Bundle fee heads and set recurring rules to map to classes.</p>
        </div>
        <div>
          <button onClick={() => setIsAdding(true)} className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Create Template
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-stone-900">New Fee Template</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-stone-500 block mb-1">Template Name</label>
              <input type="text" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="e.g. Grade 1-5 Standard" className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 block mb-1">Academic Year</label>
              <select value={newAcademicYear} onChange={e => setNewAcademicYear(e.target.value)} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm">
                <option>2026-2027</option>
                <option>2027-2028</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-stone-100">
            <label className="text-xs font-bold text-stone-500 block mb-2">Add Fee Heads to Template</label>
            <div className="flex gap-2 mb-4">
              <select id="headSelect" className="border border-stone-200 p-2.5 rounded-xl text-sm flex-1">
                <option value="">-- Select a Fee Head --</option>
                {feeHeads.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <button 
                onClick={() => {
                  const val = (document.getElementById('headSelect') as HTMLSelectElement).value;
                  handleAddHeadToTemplate(val);
                }} 
                className="bg-stone-100 px-4 rounded-xl font-bold text-stone-700 hover:bg-stone-200"
              >
                Add Head
              </button>
            </div>

            {selectedHeads.map((item, idx) => {
              const headName = feeHeads.find(h => h.id === item.fee_head_id)?.name;
              return (
                <div key={idx} className="flex gap-4 items-center bg-stone-50 p-3 rounded-xl mb-2">
                  <div className="flex-1 font-bold text-stone-700">{headName}</div>
                  <div>
                    <input type="number" placeholder="Amount (₹)" value={item.amount || ''} onChange={(e) => handleUpdateHeadAmount(idx, Number(e.target.value))} className="w-32 border border-stone-200 p-2 rounded-lg text-sm" />
                  </div>
                  <button onClick={() => handleRemoveHead(idx)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              )
            })}
          </div>

          <div className="flex gap-2 pt-4">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-100 rounded-xl">Cancel</button>
            <button onClick={handleSaveTemplate} className="bg-green-600 text-white px-6 py-2 font-bold rounded-xl shadow-sm hover:bg-green-700">Save Template</button>
          </div>
        </div>
      )}

      {/* Dynamic Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-stone-500">Loading templates...</p>
        ) : templates.length === 0 ? (
          <p className="text-stone-500">No templates found. Create one above!</p>
        ) : (
          templates.map(template => (
            <div key={template.id} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-lg">{template.name}</h3>
                  <span className="text-stone-500 text-xs">{template.academic_year}</span>
                </div>
                <button onClick={() => handleDelete(template.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {template.items?.map((item: any) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="text-stone-500">{item.fee_heads?.name}</span>
                    <span className="font-bold text-stone-900">₹{item.amount.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-stone-100 flex justify-between text-sm font-black">
                <span className="text-stone-700">Total</span>
                <span className="text-primary">₹{template.items?.reduce((acc: number, val: any) => acc + val.amount, 0).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
      
    </div>
  );
}
