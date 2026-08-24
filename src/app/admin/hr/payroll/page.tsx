"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet, Calculator, FileText, Download, CheckCircle2, AlertTriangle,
  ArrowRight, ShieldCheck, RefreshCw, Printer, X, Building2,
  Users, DollarSign, CreditCard, ChevronRight, Sparkles, Check, Send
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getMonthlyPayrollSummaryAction,
  processMonthlyPayrollRunAction,
  getStaffOfficialPayslipAction,
  generateBankNeftCsvAction
} from '@/app/actions/payroll-engine-actions';

export default function PayrollEngine() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [selectedMonth, setSelectedMonth] = useState<string>('August 2026');
  const [payrollData, setPayrollData] = useState<any>({
    isBatchProcessed: false,
    counts: {
      totalStaff: 0,
      processedCount: 0,
      pendingCount: 0,
      totalGrossBill: 0,
      totalDeductions: 0,
      totalNetDisbursed: 0,
      totalEpfSum: 0,
      totalEsicSum: 0,
      totalPtSum: 0,
      totalTdsSum: 0
    },
    roster: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'statutory'>('roster');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Payslip Modal State
  const [activePayslipStaffId, setActivePayslipStaffId] = useState<string | null>(null);
  const [payslipData, setPayslipData] = useState<any | null>(null);
  const [isLoadingPayslip, setIsLoadingPayslip] = useState(false);

  const fetchPayroll = async () => {
    setIsLoading(true);
    const res = await getMonthlyPayrollSummaryAction({
      month: selectedMonth,
      institutionCode: currentInstitution
    });
    if (res.success) {
      setPayrollData(res);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth, currentInstitution]);

  // Execute 1-Click Monthly Payroll Run
  const handleRunPayroll = async () => {
    setIsProcessing(true);
    const res = await processMonthlyPayrollRunAction({
      month: selectedMonth
    });
    setIsProcessing(false);
    if (res.success) {
      setNoticeMessage(res.message || 'Payroll processed successfully!');
      fetchPayroll();
    } else {
      alert("Error: " + res.error);
    }
  };

  // Download Bank NEFT CSV
  const handleDownloadCsv = async () => {
    setIsExportingCsv(true);
    const res = await generateBankNeftCsvAction({ month: selectedMonth });
    setIsExportingCsv(false);
    if (res.success && res.csvContent) {
      const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', res.filename || 'HDFC_Bank_Salary_NEFT.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Failed to export Bank CSV: " + res.error);
    }
  };

  // View Payslip Modal
  const handleViewPayslip = async (staffId: string) => {
    setIsLoadingPayslip(true);
    setActivePayslipStaffId(staffId);
    const res = await getStaffOfficialPayslipAction({ staffId, month: selectedMonth });
    setIsLoadingPayslip(false);
    if (res.success) {
      setPayslipData(res.payslip);
    } else {
      alert("Payslip error: " + res.error);
      setActivePayslipStaffId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Indian Statutory Payroll & Form 16 Engine
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-400" />
            Statutory Payroll, EPF/ESIC & Payslip Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Automated Basic + HRA + Special Allowance breakdown, EPF (12%), ESIC, Professional Tax, TDS deductions, and 1-click Bank NEFT transfers.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            onClick={handleRunPayroll}
            isLoading={isProcessing}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            ⚡ Run & Disburse Payroll
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadCsv}
            isLoading={isExportingCsv}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<Download className="w-3.5 h-3.5 text-emerald-400" />}
          >
            HDFC Bank NEFT CSV
          </Button>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Faculty & Staff Count</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{payrollData.counts.totalStaff}</span>
          <span className="text-[11px] text-slate-500 font-semibold">Active On Payroll</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gross Monthly Salary Bill</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">
            ₹{payrollData.counts.totalGrossBill.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">Pre-Deduction Earnings</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Statutory Deductions (EPF/PT/TDS)</span>
          <span className="text-3xl font-black text-rose-600 mt-1 block">
            ₹{payrollData.counts.totalDeductions.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-rose-700 font-bold">EPF: ₹{payrollData.counts.totalEpfSum.toLocaleString('en-IN')} • PT: ₹{payrollData.counts.totalPtSum.toLocaleString('en-IN')}</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Net Disbursed Take-Home</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">
            ₹{payrollData.counts.totalNetDisbursed.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold">100% Bank Direct Credit</span>
        </div>
      </div>

      {/* Notice Message */}
      {noticeMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{noticeMessage}</span>
          </div>
          <button onClick={() => setNoticeMessage(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Filter & Month Selector */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Payroll Billing Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
              <option value="June 2026">June 2026</option>
            </select>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'roster' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            Staff Compensation Roster ({payrollData.roster.length})
          </button>

          <button
            onClick={() => setActiveTab('statutory')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'statutory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Statutory Compliance (EPF/ESIC/PT)
          </button>
        </div>
      </div>

      {/* 🌟 TAB 1: STAFF COMPENSATION ROSTER */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Monthly Staff Compensation & Disbursement Roster — {selectedMonth}
              </h3>
              <p className="text-xs text-slate-400">
                Form 16 & Rule 26 compliant statutory payroll table with automated deductions and instant payslip links.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-4">Staff Member & Role</th>
                  <th className="py-3 px-4">Bank Details</th>
                  <th className="py-3 px-4">Basic Pay</th>
                  <th className="py-3 px-4">HRA (40%)</th>
                  <th className="py-3 px-4">Special Allow.</th>
                  <th className="py-3 px-4">Gross Earnings</th>
                  <th className="py-3 px-4">EPF (12%)</th>
                  <th className="py-3 px-4">Prof. Tax</th>
                  <th className="py-3 px-4">TDS</th>
                  <th className="py-3 px-4">Net Payable</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Official Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollData.roster.map((row: any) => (
                  <tr key={row.staffId} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block font-bold">{row.name}</strong>
                      <span className="text-[10px] text-slate-400 font-medium">{row.designation}</span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px]">
                      <span className="text-slate-900 font-bold block">{row.bankName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{row.bankAccountNo}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700">₹{row.basicSalary.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">₹{row.hra.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">₹{row.specialAllowance.toLocaleString('en-IN')}</td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹{row.grossEarnings.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-rose-600 font-medium">-₹{row.epfDeduction}</td>
                    <td className="py-3.5 px-4 font-mono text-rose-600 font-medium">-₹{row.ptDeduction}</td>
                    <td className="py-3.5 px-4 font-mono text-rose-600 font-medium">-₹{row.tdsDeduction}</td>

                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm">
                      ₹{row.netPayable.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        row.isProcessed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {row.isProcessed ? '✓ Disbursed' : 'Pending'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPayslip(row.staffId)}
                        className="text-[11px] py-1 px-3 hover:bg-emerald-50 hover:text-emerald-900 border-slate-300"
                        leftIcon={<FileText className="w-3.5 h-3.5 text-emerald-600" />}
                      >
                        Payslip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🌟 TAB 2: STATUTORY COMPLIANCE LEDGER */}
      {activeTab === 'statutory' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              EPF Scheme 1952 (12%)
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">Employee Provident Fund</h3>
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee Contribution (12%):</span>
                <strong className="text-slate-900">₹{payrollData.counts.totalEpfSum.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Employer Contribution (12%):</span>
                <strong className="text-slate-900">₹{payrollData.counts.totalEpfSum.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Total EPFO Remittance:</span>
                <span className="text-indigo-600">₹{(payrollData.counts.totalEpfSum * 2).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              State Tax Compliance
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">Professional Tax (PT)</h3>
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Standard Monthly Slab:</span>
                <strong className="text-slate-900">₹200 / employee</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Employees Assessed:</span>
                <strong className="text-slate-900">{payrollData.counts.totalStaff}</strong>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Total PT Payable to Govt:</span>
                <span className="text-emerald-600">₹{payrollData.counts.totalPtSum.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              Income Tax Act 1961
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">TDS Deduction (Section 192)</h3>
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Tax Deducted at Source:</span>
                <strong className="text-slate-900">₹{payrollData.counts.totalTdsSum.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quarterly Form 24Q Filing:</span>
                <strong className="text-emerald-700 font-bold">Q2 Ready</strong>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Challan 281 Payment:</span>
                <span className="text-amber-600">₹{payrollData.counts.totalTdsSum.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 OFFICIAL FORM 16 / RULE 26 PAYSLIP MODAL */}
      {payslipData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Official Monthly Salary Slip (Form 16 / Rule 26 Compliant)
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                  Print Salary Slip
                </Button>
                <button onClick={() => setPayslipData(null)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Box */}
            <div className="border-4 border-double border-slate-300 p-6 rounded-2xl space-y-6 bg-white">
              
              {/* Trust Header */}
              <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
                    VANI EDUCATIONAL TRUST
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold">
                  (Registered Public Educational Trust • Central Head Office, New Delhi)
                </p>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full inline-block border border-emerald-200 mt-1">
                  SALARY DISBURSEMENT SLIP FOR {payslipData.payroll_month.toUpperCase()}
                </span>
              </div>

              {/* Employee Demographics Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Employee Name</span>
                  <strong className="text-slate-900 font-extrabold">{payslipData.staff_name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Designation</span>
                  <span className="text-slate-700 font-semibold">{payslipData.designation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Department</span>
                  <span className="text-slate-700 font-semibold">{payslipData.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Institution Code</span>
                  <strong className="text-indigo-700 font-mono font-bold">{payslipData.institution_code}</strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Bank Account No</span>
                  <strong className="text-slate-900 font-mono">{payslipData.bank_account_no}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Bank & IFSC</span>
                  <span className="text-slate-700 font-mono">{payslipData.bank_name} ({payslipData.bank_ifsc})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">PAN Number</span>
                  <span className="text-slate-700 font-mono font-bold">{payslipData.pan_number}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">UAN (EPF)</span>
                  <span className="text-slate-700 font-mono">{payslipData.uan_number}</span>
                </div>
              </div>

              {/* Attendance Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 bg-slate-100 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Total Month Days</span>
                  <strong className="text-slate-900">{payslipData.total_working_days} Days</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Days Present</span>
                  <strong className="text-emerald-700">{payslipData.present_days} Days</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">LWP Deductions</span>
                  <strong className="text-slate-900">{payslipData.lwp_days} Days</strong>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Earnings Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2.5 font-black uppercase text-slate-700 text-[10px] border-b border-slate-200">
                    Earnings (A)
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Basic Salary</span>
                      <strong className="font-mono text-slate-900">₹{payslipData.basic_salary.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">House Rent Allowance (HRA)</span>
                      <strong className="font-mono text-slate-900">₹{payslipData.hra.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Special & Teaching Allowance</span>
                      <strong className="font-mono text-slate-900">₹{payslipData.special_allowance.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-slate-900">
                      <span>Total Gross Earnings:</span>
                      <span className="font-mono text-emerald-700">₹{payslipData.gross_earnings.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2.5 font-black uppercase text-slate-700 text-[10px] border-b border-slate-200">
                    Deductions (B)
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Employee Provident Fund (EPF)</span>
                      <strong className="font-mono text-rose-600">₹{payslipData.epf_deduction.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Professional Tax (PT)</span>
                      <strong className="font-mono text-rose-600">₹{payslipData.prof_tax_deduction.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">TDS Income Tax</span>
                      <strong className="font-mono text-rose-600">₹{payslipData.tds_deduction.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-slate-900">
                      <span>Total Deductions:</span>
                      <span className="font-mono text-rose-600">₹{payslipData.total_deductions.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Net Disbursed Box */}
              <div className="p-4 bg-emerald-950 text-white rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-emerald-300 uppercase font-bold block">Net Payable Amount (A - B)</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    ₹{payslipData.net_payable.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-300 uppercase font-bold block">Disbursement Mode</span>
                  <span className="text-sm font-bold text-white">Direct NEFT Transfer</span>
                </div>
              </div>

              {/* Currency in Words */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Amount in Words:</span>
                <strong className="text-slate-800 italic mt-0.5 block">{payslipData.net_payable_words}</strong>
              </div>

              {/* Signatures & Seal */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-[10px] text-slate-500 font-bold border-t border-slate-200">
                <div>
                  <div className="h-8 border-b border-dashed border-slate-400 mb-1" />
                  <span>Employee Signature</span>
                </div>
                <div>
                  <div className="h-8 border-b border-dashed border-slate-400 mb-1" />
                  <span>Authorized Signatory / Finance Officer (Vani Educational Trust)</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
