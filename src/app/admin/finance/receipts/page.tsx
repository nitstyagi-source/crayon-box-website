"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Printer, Search, CheckCircle2, Eye, X } from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getReceipts } from "@/app/actions/finance-core";

export default function ReceiptsModule() {
  const { activeCampusId } = useCampusContext();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  useEffect(() => {
    loadReceipts();
  }, [activeCampusId]);

  async function loadReceipts() {
    setIsLoading(true);
    const res = await getReceipts(activeCampusId);
    if (res.success) setReceipts(res.data || []);
    setIsLoading(false);
  }

  const filtered = receipts.filter(r => 
    r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.student.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <FileText className="w-8 h-8 text-blue-600" />
             Official Fee Receipts Directory
          </h1>
          <p className="text-stone-500 mt-1">Audit trail of all generated fee payment vouchers and online receipts.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by receipt no, student name, admission no..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <span className="text-xs font-bold text-stone-500">{filtered.length} Receipts Found</span>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Receipt No.</th>
                <th className="p-4 font-bold">Invoice Ref</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Billing Term</th>
                <th className="p-4 font-bold">Amount Paid</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr><td colSpan={7} className="p-10 text-center font-bold text-stone-400">Loading receipts database...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center font-bold text-stone-400">No payment receipts on record yet. Complete a payment via Quick Pay or Collection Counter to generate receipts.</td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-600">{r.receiptNumber}</td>
                    <td className="p-4 font-mono text-stone-600 text-xs">{r.invoiceNumber}</td>
                    <td className="p-4">
                      <p className="font-bold text-stone-900">{r.student.first_name} {r.student.last_name}</p>
                      <p className="text-xs text-stone-400 font-mono">{r.student.admission_no}</p>
                    </td>
                    <td className="p-4 text-stone-600">{r.billingPeriod || "Term Fee"}</td>
                    <td className="p-4 font-bold text-green-700">₹{r.amountPaid.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setActiveReceipt(r)}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-stone-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Official Fee Receipt</h3>
                <p className="text-xs text-stone-400 font-mono mt-0.5">#{activeReceipt.receiptNumber}</p>
              </div>
              <button onClick={() => setActiveReceipt(null)} className="p-2 text-stone-400 hover:text-stone-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3 text-sm mb-6">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Student:</span>
                <span className="font-bold text-stone-900">{activeReceipt.student.first_name} {activeReceipt.student.last_name}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Admission No:</span>
                <span className="font-mono font-bold text-stone-900">{activeReceipt.student.admission_no}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Invoice Ref:</span>
                <span className="font-mono text-stone-700">{activeReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Billing Term:</span>
                <span className="font-bold text-stone-800">{activeReceipt.billingPeriod}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-stone-600 font-bold">Total Amount Paid:</span>
                <span className="font-black text-green-700 text-lg">₹{activeReceipt.amountPaid.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => window.print()}
                className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button 
                onClick={() => setActiveReceipt(null)}
                className="px-5 py-2.5 text-stone-600 font-bold text-sm hover:bg-stone-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
