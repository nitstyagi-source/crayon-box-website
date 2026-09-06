"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Receipt, Search, Filter, Printer, RefreshCw, 
  CheckCircle2, Download, AlertCircle, Eye, Calendar, ArrowRight
} from "lucide-react";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { getOfficialReceipts } from "@/app/actions/finance-core";
import { printIsolatedElement } from "@/lib/printUtils";

export default function BillingReceiptsPage() {
  const { currentInstitution, selectedInstitutionObj } = useInstitution();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState("All");

  // View & Print Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<any>(null);
  const a5PrintRef = useRef<HTMLDivElement>(null);
  const thermalPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReceipts();
  }, [currentInstitution]);

  async function loadReceipts() {
    setIsLoading(true);
    try {
      const res = await getOfficialReceipts(currentInstitution);
      if (res.success) {
        setReceipts(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  function handlePrintA5() {
    if (!a5PrintRef.current) return;
    printIsolatedElement(
      a5PrintRef.current,
      `Fee-Receipt-${activeReceipt?.receipt_number || 'Print'}`,
      { pageSize: "A5 landscape", margin: "2mm" }
    );
  }

  function handlePrintThermal() {
    if (!thermalPrintRef.current) return;
    printIsolatedElement(
      thermalPrintRef.current,
      `Thermal-Receipt-${activeReceipt?.receipt_number || 'Print'}`,
      { pageSize: "auto", margin: "0mm" }
    );
  }

  const filteredReceipts = receipts.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !searchQuery ||
      (r.receipt_number && r.receipt_number.toLowerCase().includes(q)) ||
      (r.student_name && r.student_name.toLowerCase().includes(q)) ||
      (r.admission_no && r.admission_no.toLowerCase().includes(q));
    const matchMode = selectedMode === "All" || r.payment_mode === selectedMode;
    return matchSearch && matchMode;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs">
        <div>
          <h2 className="text-xl font-serif font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-600" />
            Official Receipts &amp; Vouchers Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, verify, and reprint authenticated A-5 Letterhead Fee Receipts and 80mm Thermal POS slips.
          </p>
        </div>

        <button
          onClick={loadReceipts}
          className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-amber-50 text-slate-800 border border-[#E8DFC8] rounded-xl text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-[#E8DFC8] shadow-xs text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Receipt No (e.g. REC-2026-001), Student Name, or Admission No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl font-medium focus:outline-none focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 font-bold text-slate-800 w-full sm:w-auto"
          >
            <option value="All">All Payment Modes</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI / QR Code</option>
            <option value="CARD">Debit / Credit Card</option>
            <option value="CHEQUE">Cheque / Demand Draft</option>
            <option value="NET_BANKING">Net Banking</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading official receipts ledger...</div>
        ) : filteredReceipts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">No receipts matching your search query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] text-[10px] font-black uppercase tracking-wider text-slate-600 border-b border-[#E8DFC8]">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Admission #</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Reprint Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFC8]">
                {filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#0F2942]">
                      {r.receipt_number}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {new Date(r.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {r.student_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {r.admission_no}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {r.class_name || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-slate-700">
                        {r.payment_mode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black font-mono text-slate-900 text-sm">
                      ₹{Number(r.amount_paid).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setActiveReceipt(r)}
                        className="px-3 py-1 bg-[#0F2942] hover:bg-[#1A365D] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        Reprint
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REPRINT RECEIPT MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-300 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-black text-[#0F2942] flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-600" />
                  Print Fee Receipt ({activeReceipt.receipt_number})
                </h3>
                <p className="text-[11px] text-stone-500">Choose your preferred printer format</p>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="p-1 text-stone-400 hover:text-stone-900 rounded-lg text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePrintA5}
                className="p-4 rounded-2xl border-2 border-[#0F2942] bg-[#FAF7F2] hover:bg-amber-50 text-left transition space-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between font-black text-sm text-[#0F2942]">
                  <span>A-5 Landscape Voucher</span>
                  <Printer className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-[11px] text-stone-600">Standard dual-receipt institutional letterhead format for office and student copies.</p>
              </button>

              <button
                onClick={handlePrintThermal}
                className="p-4 rounded-2xl border-2 border-stone-300 bg-white hover:bg-stone-50 text-left transition space-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between font-black text-sm text-stone-900">
                  <span>80mm Thermal Slip (POS)</span>
                  <Printer className="w-4 h-4 text-stone-600" />
                </div>
                <p className="text-[11px] text-stone-600">3-inch thermal POS receipt slip for quick front-desk cash counter handover.</p>
              </button>
            </div>

            {/* Hidden Printable Elements for Isolated Printing */}
            <div className="hidden">
              {/* A5 Printable Ref */}
              <div ref={a5PrintRef} className="p-4 text-slate-900 font-sans text-xs bg-white">
                <div className="border-2 border-[#0F2942] p-4 rounded-xl space-y-3">
                  <div className="text-center border-b border-stone-300 pb-2">
                    <h2 className="text-lg font-serif font-black uppercase text-[#0F2942]">{selectedInstitutionObj?.name || 'CRAYON BOX ACADEMY'}</h2>
                    <p className="text-[10px] text-stone-600 uppercase font-bold">{selectedInstitutionObj?.address || 'MAIN CAMPUS | DELHI NCR'}</p>
                    <span className="inline-block mt-1 font-black text-xs uppercase bg-[#EAEFF5] px-3 py-0.5 rounded border border-[#0F2942]">OFFICIAL FEE RECEIPT</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><strong>Receipt No:</strong> {activeReceipt.receipt_number}</div>
                    <div className="text-right"><strong>Date:</strong> {new Date(activeReceipt.created_at).toLocaleDateString('en-IN')}</div>
                    <div><strong>Student Name:</strong> {activeReceipt.student_name}</div>
                    <div className="text-right"><strong>Admission No:</strong> {activeReceipt.admission_no}</div>
                    <div><strong>Class:</strong> {activeReceipt.class_name || '—'}</div>
                    <div className="text-right"><strong>Payment Mode:</strong> {activeReceipt.payment_mode}</div>
                  </div>

                  <div className="border-t border-b border-stone-300 py-2 flex items-center justify-between font-black text-sm">
                    <span>Total Amount Paid:</span>
                    <span>₹{Number(activeReceipt.amount_paid).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-4 flex justify-between text-[10px] text-stone-500">
                    <span>Generated By: Accounts Counter</span>
                    <span>Authorised Signatory ___________________</span>
                  </div>
                </div>
              </div>

              {/* Thermal 80mm Ref */}
              <div ref={thermalPrintRef} className="w-72 p-2 text-slate-900 font-mono text-xs bg-white space-y-2">
                <div className="text-center border-b border-dashed border-black pb-2">
                  <strong className="block text-sm font-bold">{selectedInstitutionObj?.name || 'CRAYON BOX ACADEMY'}</strong>
                  <span className="text-[10px] block">FEE RECEIPT</span>
                </div>
                <div className="text-[10px] space-y-0.5">
                  <div>REC: {activeReceipt.receipt_number}</div>
                  <div>DATE: {new Date(activeReceipt.created_at).toLocaleDateString('en-IN')}</div>
                  <div>NAME: {activeReceipt.student_name}</div>
                  <div>ADM NO: {activeReceipt.admission_no}</div>
                  <div>MODE: {activeReceipt.payment_mode}</div>
                </div>
                <div className="border-t border-b border-dashed border-black py-1 flex justify-between font-bold text-sm">
                  <span>TOTAL:</span>
                  <span>₹{Number(activeReceipt.amount_paid).toLocaleString('en-IN')}</span>
                </div>
                <div className="text-center text-[9px] pt-1">
                  Thank You! Retain slip for records.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
