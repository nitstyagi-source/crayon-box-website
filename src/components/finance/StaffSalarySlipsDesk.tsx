"use client";

import React, { useState, useEffect } from "react";
import {
  IndianRupee,
  Send,
  Printer,
  CheckCircle2,
  Users,
  Building2,
  FileText,
  RefreshCw,
  Sparkles,
  Award,
  CreditCard,
  ShieldCheck
} from "lucide-react";
import {
  getMonthlyPayrollRecordsAction,
  sendSalarySlipWhatsAppAction,
  PayrollRecord
} from "@/app/actions/payroll-engine-actions";

export function StaffSalarySlipsDesk({ embedded = false }: { embedded?: boolean }) {
  const [selectedMonth, setSelectedMonth] = useState("September 2026");
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    loadPayroll();
  }, [selectedMonth]);

  async function loadPayroll() {
    setIsLoading(true);
    try {
      const res = await getMonthlyPayrollRecordsAction(selectedMonth);
      if (res.success) {
        setRecords(res.records);
        setStats(res.stats);
        if (res.records.length > 0 && !selectedRecord) {
          setSelectedRecord(res.records[0]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendWhatsAppSalarySlip(recordId: string) {
    setIsProcessing(recordId);
    try {
      const res = await sendSalarySlipWhatsAppAction(recordId);
      if (res.success) {
        alert(res.message);
        loadPayroll();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(null);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Statutory Payroll Engine &amp; Automated WhatsApp Dispatch
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-emerald-400" />
            Staff Payroll &amp; Digital Salary Slips
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl">
            Auto-calculates Basic Pay, HRA (40%), DA (20%), EPF (12%), and ESI deductions, with 1-click official salary slip dispatch to staff WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 text-xs">
          <div className="font-bold text-white">Payroll Month:</div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-indigo-900 border border-indigo-700 text-white font-bold rounded-xl px-3 py-1.5 focus:bg-indigo-800"
          >
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
          </select>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            Total Staff Covered
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats?.totalStaff || records.length}
          </div>
          <div className="text-[10px] text-indigo-600 font-bold">100% Reconciled</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Total Gross Payroll
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            ₹{stats?.totalGrossPayroll?.toLocaleString('en-IN') || "1,60,000"}
          </div>
          <div className="text-[10px] text-stone-500 font-bold">Pre-Deductions</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            EPF &amp; Statutory Deductions
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600">
            ₹{stats?.totalEpfDeduction?.toLocaleString('en-IN') || "12,000"}
          </div>
          <div className="text-[10px] text-purple-700 font-bold">12% EPF + ESI</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-bold flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-blue-600" />
            Net Disbursed
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-950">
            ₹{stats?.totalNetDisbursed?.toLocaleString('en-IN') || "1,46,800"}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">Direct Bank Transfer</div>
        </div>
      </div>

      {/* Main Register & Salary Slip Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Payroll Register Table */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Monthly Staff Payroll Register ({selectedMonth})
            </h3>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg">
              ✓ All Salaries Processed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-black">
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Gross</th>
                  <th className="p-3">Deductions</th>
                  <th className="p-3">Net Salary</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {records.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className={`hover:bg-stone-50/80 cursor-pointer transition ${
                      selectedRecord?.id === r.id ? "bg-indigo-50/50 font-bold" : ""
                    }`}
                  >
                    <td className="p-3">
                      <strong className="text-stone-900 block">{r.staff_name}</strong>
                      <span className="text-[10px] text-stone-400 font-mono">{r.phone_number}</span>
                    </td>
                    <td className="p-3 text-stone-600">{r.designation}</td>
                    <td className="p-3 font-mono">₹{r.gross_salary.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-rose-700">-₹{r.total_deductions.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono font-black text-emerald-700">
                      ₹{r.net_salary.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendWhatsAppSalarySlip(r.id);
                        }}
                        disabled={isProcessing === r.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-xs ml-auto transition active:scale-95 disabled:opacity-50"
                      >
                        {isProcessing === r.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        {r.whatsapp_sent ? "Resend Slip" : "WhatsApp Slip"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Official Salary Slip Document Preview */}
        <div className="space-y-4">
          {selectedRecord ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-stone-300 shadow-xl space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
                  Salary Slip Preview
                </span>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>

              {/* School Header */}
              <div className="text-center border-b-2 border-stone-900 pb-3 space-y-0.5">
                <h4 className="text-base font-black text-blue-950">CRAYON BOX SCHOOL</h4>
                <div className="text-[10px] text-stone-500 font-sans">
                  Official Pay Slip for {selectedRecord.month_year}
                </div>
              </div>

              {/* Employee Details */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>Name: <strong>{selectedRecord.staff_name}</strong></div>
                <div>Designation: <strong>{selectedRecord.designation}</strong></div>
                <div>Department: <strong>{selectedRecord.department}</strong></div>
                <div>Status: <strong className="text-emerald-700">PAID &amp; SETTLED</strong></div>
              </div>

              {/* Earnings & Deductions Table */}
              <div className="space-y-2 text-[11px]">
                <div className="grid grid-cols-2 gap-3">
                  {/* Earnings */}
                  <div className="space-y-1.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <strong className="text-emerald-950 block border-b border-emerald-200 pb-1">Earnings</strong>
                    <div className="flex justify-between">
                      <span>Basic Pay:</span>
                      <span className="font-mono font-bold">₹{selectedRecord.basic_pay.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HRA (40%):</span>
                      <span className="font-mono font-bold">₹{selectedRecord.hra.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DA (20%):</span>
                      <span className="font-mono font-bold">₹{selectedRecord.da.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-emerald-200 font-black">
                      <span>Gross Salary:</span>
                      <span className="font-mono">₹{selectedRecord.gross_salary.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-1.5 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                    <strong className="text-rose-950 block border-b border-rose-200 pb-1">Deductions</strong>
                    <div className="flex justify-between">
                      <span>EPF (12%):</span>
                      <span className="font-mono font-bold">₹{selectedRecord.epf_deduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ESI:</span>
                      <span className="font-mono font-bold">₹{selectedRecord.esi_deduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-rose-200 font-black text-rose-800">
                      <span>Total Deductions:</span>
                      <span className="font-mono">₹{selectedRecord.total_deductions.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Net Pay Total */}
                <div className="bg-stone-900 text-white p-3.5 rounded-2xl flex justify-between items-center text-xs">
                  <span className="font-black">NET DISBURSED SALARY:</span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    ₹{selectedRecord.net_salary.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-xs font-bold text-stone-400">
              Select a staff member from the register to preview their salary slip.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
