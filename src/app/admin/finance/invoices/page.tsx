"use client";

import { useState, useEffect } from "react";
import { Receipt, Printer } from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getInvoices } from "@/app/actions/finance-core";

export default function InvoicesModule() {
  const { activeCampusId } = useCampusContext();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeCampusId) loadData();
  }, [activeCampusId]);

  async function loadData() {
    setIsLoading(true);
    const res = await getInvoices(activeCampusId);
    if (res.success) setInvoices(res.data || []);
    setIsLoading(false);
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Receipt className="w-7 h-7 text-stone-400" />
             Invoice Management
          </h1>
          <p className="text-stone-500 mt-1">View, print, and track individual generated invoices.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
            <th className="p-4 font-bold">Invoice #</th><th className="p-4 font-bold">Period</th><th className="p-4 font-bold">Amount</th><th className="p-4 font-bold">Paid</th><th className="p-4 font-bold">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-stone-100">
            {isLoading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : 
             invoices.length === 0 ? <tr><td colSpan={5} className="p-4 text-center">No invoices generated yet.</td></tr> :
             invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-stone-50">
                <td className="p-4 font-mono text-sm">{inv.invoice_number}</td>
                <td className="p-4 font-bold">{inv.billing_period}</td>
                <td className="p-4 font-black">₹{inv.total_amount}</td>
                <td className="p-4 font-bold text-green-600">₹{inv.amount_paid}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                    inv.status === 'Partial' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>{inv.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
