"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, Calendar, Printer, RefreshCw, Filter, 
  IndianRupee, Download, Building2, CheckCircle2 
} from "lucide-react";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { getDailyManagementReportAction, DayBookChannelGroup, ReportTransactionItem } from "@/app/actions/finance-management-reports";
import { printIsolatedElement } from "@/lib/printUtils";

export default function BillingDayBookPage() {
  const { currentInstitution, selectedInstitutionObj } = useInstitution();
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<{
    summary?: any;
    channelGroups?: DayBookChannelGroup[];
    transactions?: ReportTransactionItem[];
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDayBook();
  }, [selectedDate, currentInstitution]);

  async function loadDayBook() {
    setIsLoading(true);
    try {
      const res = await getDailyManagementReportAction({
        fromDate: selectedDate,
        toDate: selectedDate,
        campusId: currentInstitution,
        paymentChannel: "All"
      });
      if (res.success) {
        setReportData(res.data || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  function handlePrint() {
    if (!printRef.current) return;
    printIsolatedElement(
      printRef.current,
      `Day-Book-${selectedDate}`,
      { pageSize: "A4 landscape", margin: "3mm" }
    );
  }

  const summary = reportData.summary || {};
  const channelGroups = reportData.channelGroups || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs">
        <div>
          <h2 className="text-xl font-serif font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-600" />
            Daily Day Book &amp; Cash Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            End-of-day cash reconciliation, online channel breakdowns, and statutory audit register.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl text-xs font-bold text-slate-800"
          />
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#0F2942] hover:bg-[#1A365D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" /> Print A-4 Statement
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-stone-500 block">Total Net Collections</span>
          <strong className="text-xl font-black text-[#0F2942] font-mono block">
            ₹{Number(summary.netCollected || 0).toLocaleString("en-IN")}
          </strong>
          <span className="text-[10px] text-emerald-600 font-semibold">{summary.receiptCount || 0} Receipts Issued</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-stone-500 block">Cash in Hand</span>
          <strong className="text-xl font-black text-amber-800 font-mono block">
            ₹{Number(summary.cashTotal || 0).toLocaleString("en-IN")}
          </strong>
          <span className="text-[10px] text-stone-400 font-semibold">Ready for physical deposit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-stone-500 block">UPI / Online / QR</span>
          <strong className="text-xl font-black text-blue-900 font-mono block">
            ₹{Number(summary.onlineTotal || 0).toLocaleString("en-IN")}
          </strong>
          <span className="text-[10px] text-blue-600 font-semibold">Direct Bank Credit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-stone-500 block">Payment Gateway</span>
          <strong className="text-xl font-black text-purple-900 font-mono block">
            ₹{Number(summary.gatewayTotal || 0).toLocaleString("en-IN")}
          </strong>
          <span className="text-[10px] text-purple-600 font-semibold">T+1 Settlement</span>
        </div>
      </div>

      {/* Day Book Table View & Printable Canvas */}
      <div
        ref={printRef}
        className="bg-white p-6 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-4 print:m-0 print:p-4 print:border-none"
      >
        {/* Print Header (Visible in print) */}
        <div className="hidden print:block text-center border-b-2 border-slate-900 pb-3 space-y-1">
          <h2 className="text-xl font-serif font-black uppercase tracking-wider text-slate-900">
            {selectedInstitutionObj?.name || 'CRAYON BOX ACADEMY'}
          </h2>
          <p className="text-xs font-bold text-slate-600">DAILY DAY BOOK REGISTER • DATE: {selectedDate}</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading daily day book register...</div>
        ) : channelGroups.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">No collections recorded for {selectedDate}.</div>
        ) : (
          <div className="space-y-6">
            {channelGroups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-2">
                <div className="bg-[#EAEFF5] border-l-4 border-[#0F2942] px-3 py-1.5 rounded text-xs font-black text-[#0F2942] flex justify-between items-center">
                  <span>{grp.mode.toUpperCase()} COLLECTIONS</span>
                  <span className="font-mono">Subtotal: ₹{Number(grp.subtotal?.total_paid || 0).toLocaleString('en-IN')}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F2] text-[10px] font-bold uppercase text-slate-600 border-b border-[#E8DFC8]">
                        <th className="py-2 px-3">Receipt #</th>
                        <th className="py-2 px-3">Admission #</th>
                        <th className="py-2 px-3">Student Name</th>
                        <th className="py-2 px-3">Class</th>
                        <th className="py-2 px-3">Reference / Txn #</th>
                        <th className="py-2 px-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFC8]">
                      {grp.transactions.map((it: any, iIdx: number) => (
                        <tr key={iIdx} className="hover:bg-amber-50/30">
                          <td className="py-2 px-3 font-mono font-bold text-[#0F2942]">{it.receipt_no}</td>
                          <td className="py-2 px-3 font-mono">{it.admission_no}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{it.student_name}</td>
                          <td className="py-2 px-3">{it.class_name}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{it.transaction_ref || '—'}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            ₹{Number(it.amount_paid).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Grand Total Bar */}
            <div className="pt-3 border-t-2 border-[#0F2942] flex items-center justify-between font-black text-sm text-[#0F2942] bg-[#FAF7F2] p-3 rounded-xl">
              <span>GRAND TOTAL COLLECTIONS FOR {selectedDate}:</span>
              <span className="text-base font-mono">₹{Number(summary.netCollected || 0).toLocaleString('en-IN')}</span>
            </div>

            {/* Print Signatures */}
            <div className="hidden print:flex justify-between text-xs font-bold text-slate-700 pt-8">
              <span>Cashier Signature: _______________________</span>
              <span>Bursar / Accounts Officer: _______________________</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
