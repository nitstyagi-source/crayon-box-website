"use client";

import { useState, useEffect } from "react";
import { Wallet, Banknote } from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getInvoices, recordManualPayment } from "@/app/actions/finance-core";

export default function CollectionsModule() {
  const { activeCampusId } = useCampusContext();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("Cash");

  useEffect(() => {
    if (activeCampusId) loadData();
  }, [activeCampusId]);

  async function loadData() {
    const res = await getInvoices(activeCampusId);
    if (res.success && res.data) setInvoices(res.data.filter((i:any) => i.status !== 'Paid'));
  }

  async function handlePayment() {
    if (!selectedInvoice || !amount) return alert("Select invoice and enter amount.");
    const res = await recordManualPayment(activeCampusId, selectedInvoice, Number(amount), mode);
    if (res.success) {
      alert("Payment recorded!");
      setAmount("");
      loadData();
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Wallet className="w-7 h-7 text-stone-400" />
             Payment Collections
          </h1>
          <p className="text-stone-500 mt-1">Record cash, cheque, and offline transactions manually.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-4 text-lg">Record Manual Payment</h3>
          <div className="space-y-4">
            <select value={selectedInvoice} onChange={e=>setSelectedInvoice(e.target.value)} className="w-full border border-stone-200 p-3 rounded-xl text-sm">
              <option value="">-- Select Unpaid Invoice --</option>
              {invoices.map(inv => <option key={inv.id} value={inv.id}>{inv.invoice_number} (Bal: ₹{inv.total_amount - inv.amount_paid})</option>)}
            </select>
            <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount Collected" className="w-full border border-stone-200 p-3 rounded-xl text-sm" />
            <select value={mode} onChange={e=>setMode(e.target.value)} className="w-full border border-stone-200 p-3 rounded-xl text-sm"><option>Cash</option><option>Cheque</option><option>Bank Transfer</option></select>
            <button onClick={handlePayment} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-green-700">Submit Collection</button>
          </div>
        </div>
      </div>
    </div>
  );
}
