"use client";

import { useState, useEffect } from "react";
import { Play, Users, CheckCircle2 } from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getFeeTemplates } from "@/app/actions/fee-templates";
import { generateInvoiceWizard } from "@/app/actions/billing";

export default function GenerateModule() {
  const { activeCampusId } = useCampusContext();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("Q2 (July-Sept)");
  const [dueDate, setDueDate] = useState("");
  const [lateFeeDaily, setLateFeeDaily] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (activeCampusId) loadTemplates();
  }, [activeCampusId]);

  async function loadTemplates() {
    const res = await getFeeTemplates(activeCampusId);
    if (res.success) setTemplates(res.data || []);
  }

  async function handleGenerate() {
    if (!selectedTemplate || !dueDate) {
      alert("Please select a template and a due date.");
      return;
    }
    
    setIsGenerating(true);
    // Mock passing a random UUID for the student since we don't have a student selector wired here yet
    const dummyStudentIds = ["11111111-1111-1111-1111-111111111111"]; 
    
    const res = await generateInvoiceWizard(
      activeCampusId, 
      dummyStudentIds, 
      selectedTemplate, 
      billingPeriod, 
      new Date(dueDate).toISOString(),
      Number(discountAmount),
      Number(lateFeeDaily)
    );
    
    setIsGenerating(false);
    
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(""), 5000);
    } else {
      alert("Error: " + res.error);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Play className="w-7 h-7 text-stone-400" />
             Generate Fees
          </h1>
          <p className="text-stone-500 mt-1">Bulk invoice generation with custom due dates, discounts, and auto-late fees embedded per head.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-center gap-3 font-bold">
          <CheckCircle2 className="w-5 h-5" /> {successMsg}
        </div>
      )}

      {/* Dynamic Content Area */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-6">
        <h3 className="font-bold text-stone-900 mb-6 text-xl">Invoice Generation Wizard</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-bold text-stone-700 block mb-2">Select Template</label>
            <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:outline-none">
              <option value="">-- Choose a Fee Template --</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.academic_year})</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-stone-700 block mb-2">Billing Period</label>
            <input type="text" value={billingPeriod} onChange={e => setBillingPeriod(e.target.value)} className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:outline-none" />
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="text-sm font-bold text-stone-700 block mb-2">Invoice Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:outline-none" />
            <p className="text-xs text-stone-500 mt-1">Applied to every head in this invoice.</p>
          </div>
          <div>
            <label className="text-sm font-bold text-stone-700 block mb-2">Auto Late Fee (₹ / Day)</label>
            <input type="number" value={lateFeeDaily} onChange={e => setLateFeeDaily(Number(e.target.value))} className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:outline-none" />
            <p className="text-xs text-stone-500 mt-1">Automatically accumulates after due date.</p>
          </div>
          <div>
            <label className="text-sm font-bold text-stone-700 block mb-2">Bulk Discount (₹ per head)</label>
            <input type="number" value={discountAmount} onChange={e => setDiscountAmount(Number(e.target.value))} className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:outline-none" />
            <p className="text-xs text-stone-500 mt-1">Deducted from each head's base amount.</p>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-900 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {isGenerating ? 'Generating...' : <><Users className="w-5 h-5"/> Generate Custom Invoices</>}
        </button>
      </div>
      
    </div>
  );
}
