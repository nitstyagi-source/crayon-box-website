"use client";

import { useState, useEffect } from "react";
import { Clock, Search } from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getPendingFees } from "@/app/actions/finance-core";

export default function PendingModule() {
  const { activeCampusId } = useCampusContext();
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    if (activeCampusId) loadData();
  }, [activeCampusId]);

  async function loadData() {
    const res = await getPendingFees(activeCampusId);
    if (res.success) setTotalPending(res.totalPending || 0);
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Clock className="w-7 h-7 text-stone-400" />
             Pending Fees
          </h1>
          <p className="text-stone-500 mt-1">Monitor outstanding balances before they become overdue.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6 flex justify-between items-center">
         <div>
            <p className="text-sm text-stone-500 font-bold uppercase tracking-wider">Total Pending Volume</p>
            <h2 className="text-4xl font-black text-orange-600">₹{totalPending.toLocaleString()}</h2>
         </div>
         <button className="bg-orange-100 text-orange-700 font-bold px-4 py-2 rounded-xl">Send Bulk Reminder</button>
      </div>
    </div>
  );
}
