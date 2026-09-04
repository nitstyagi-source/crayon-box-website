"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Wallet, Calculator, FileText, Download, CheckCircle2, AlertTriangle,
  ArrowRight, ShieldCheck, RefreshCw, Printer, X, Building2,
  Users, IndianRupee, CreditCard, ChevronRight, Sparkles, Check, Send
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { useCampusContext } from '@/components/providers/CampusProvider';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import {
  getMonthlyPayrollSummaryAction,
  processMonthlyPayrollRunAction,
  getStaffOfficialPayslipAction,
  generateBankNeftCsvAction
} from '@/app/actions/payroll-engine-actions';
import { StaffSalarySlipsDesk } from '@/components/finance/StaffSalarySlipsDesk';

type PayrollTab = 'run' | 'statutory' | 'slips' | 'neft';

function PayrollHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') as PayrollTab | null;

  const validTabs: PayrollTab[] = ['run', 'statutory', 'slips', 'neft'];
  const [activeTab, setActiveTab] = useState<PayrollTab>(
    rawTab && validTabs.includes(rawTab) ? rawTab : 'run'
  );

  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();
  const { activeCampusId } = useCampusContext();
  const activeInst = currentInstitution || activeCampusId || 'CBS';

  const [selectedMonth, setSelectedMonth] = useState<string>('September 2026');
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
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Payslip Modal State
  const [activePayslipStaffId, setActivePayslipStaffId] = useState<string | null>(null);
  const [payslipData, setPayslipData] = useState<any | null>(null);
  const [isLoadingPayslip, setIsLoadingPayslip] = useState(false);

  useEffect(() => {
    if (rawTab && validTabs.includes(rawTab) && rawTab !== activeTab) {
      setActiveTab(rawTab);
    }
  }, [rawTab]);

  const handleTabChange = (tab: PayrollTab) => {
    setActiveTab(tab);
    router.push(`/admin/hr/payroll?tab=${tab}`, { scroll: false });
  };

  const fetchPayroll = async () => {
    setIsLoading(true);
    const res = await getMonthlyPayrollSummaryAction({
      month: selectedMonth,
      institutionCode: activeInst
    });
    if (res.success) {
      setPayrollData(res);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth, activeInst]);

  const handleRunPayroll = async () => {
    setIsProcessing(true);
    const res = await processMonthlyPayrollRunAction({
      month: selectedMonth,
      institutionCode: activeInst
    });
    setIsProcessing(false);
    if (res.success) {
      setNoticeMessage(res.message || 'Payroll processed successfully!');
      fetchPayroll();
    } else {
      alert("Error: " + res.error);
    }
  };

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

  const handleOpenPayslip = async (staffId: string) => {
    setIsLoadingPayslip(true);
    setActivePayslipStaffId(staffId);
    const res = await getStaffOfficialPayslipAction({
      staffId,
      month: selectedMonth
    });
    setIsLoadingPayslip(false);
    if (res.success) {
      setPayslipData(res.payslip);
    } else {
      alert("Error: " + res.error);
      setActivePayslipStaffId(null);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-20">
      
      {/* Option 6 Sattva-Digital Sandalwood Vastu Banner */}
      <VastuModuleBanner
        badgeText="Statutory Staff Compensation & EPF"
        badgeIcon={<IndianRupee className="w-3.5 h-3.5 text-[#D97706]" />}
        institutionText={`Campus: ${activeInst} • Session 2026–2027`}
        title="HR, Statutory Payroll & Disbursals Hub"
        titleIcon={<Users className="w-7 h-7 text-[#D97706]" />}
        description="Unified payroll lifecycle uniting Attendance-Linked Salary Runs, Indian Statutory Deductions (EPF 12%, ESIC, PT, TDS), Digital Payslips with WhatsApp Dispatch, and 1-Click Bank NEFT CSV."
        actions={
          <>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E8DFC8]">
              <span className="text-[11px] font-bold text-stone-500">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchPayroll}
              isLoading={isLoading}
              className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-[#FAF7F2] text-xs font-bold shadow-2xs"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-stone-500" />}
            >
              Sync DB
            </Button>

            <Button
              variant="saffron"
              size="sm"
              onClick={handleRunPayroll}
              isLoading={isProcessing}
              className="text-xs font-black shadow-xs bg-[#D97706] hover:bg-[#B45309] text-white"
              leftIcon={<Calculator className="w-3.5 h-3.5" />}
            >
              1-Click Batch Run
            </Button>
          </>
        }
      />

      {/* 4 CONSOLIDATED TABS */}
      <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('run')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'run'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <Calculator className="w-4 h-4 text-[#D97706]" />
          <span>1. Monthly Payroll &amp; Biometric LOP</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
            {payrollData.counts?.totalStaff || 0} Staff
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('statutory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'statutory'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#D97706]" />
          <span>2. Statutory Register (EPF/ESI/TDS)</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold">
            Govt Compliance
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('slips')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'slips'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#D97706]" />
          <span>3. Digital Salary Slips &amp; WhatsApp</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-bold">
            WhatsApp Push
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('neft')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'neft'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <Download className="w-4 h-4 text-[#D97706]" />
          <span>4. Bank NEFT Batch Transfer</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-bold">
            Bank CSV
          </span>
        </button>
      </div>

      {/* Feedback Notice */}
      {noticeMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{noticeMessage}</span>
          </div>
          <button onClick={() => setNoticeMessage(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MONTHLY PAYROLL RUN */}
      {/* ========================================================================= */}
      {activeTab === 'run' && (
        <div className="space-y-6">
          
          {/* Telematics Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Staff Headcount</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{payrollData.counts?.totalStaff || 0}</span>
              <span className="text-[11px] text-slate-500 font-semibold">{selectedMonth}</span>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gross Payroll Bill</span>
              <span className="text-3xl font-black text-indigo-700 mt-1 block font-mono">{formatCurrency(payrollData.counts?.totalGrossBill || 0)}</span>
              <span className="text-[11px] text-indigo-800 font-bold">Pre-Deductions CTC</span>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Statutory Deductions</span>
              <span className="text-3xl font-black text-rose-700 mt-1 block font-mono">{formatCurrency(payrollData.counts?.totalDeductions || 0)}</span>
              <span className="text-[11px] text-rose-800 font-bold">EPF, ESI, PT, TDS &amp; LOP</span>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Net Disbursed to Bank</span>
              <span className="text-3xl font-black text-emerald-700 mt-1 block font-mono">{formatCurrency(payrollData.counts?.totalNetDisbursed || 0)}</span>
              <span className="text-[11px] text-emerald-800 font-bold">Ready for Bank NEFT</span>
            </div>
          </div>

          {/* Payroll Roster Table */}
          <div className="bg-white rounded-3xl border border-[#E8DFC8] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E8DFC8] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Staff Monthly Payroll &amp; Biometric Muster Register ({selectedMonth})
                </h3>
                <p className="text-xs text-slate-500">
                  Integrated with Staff Attendance Muster: Unpaid leaves automatically reduce gross pay as Loss of Pay (LOP).
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
                <span>Loading payroll calculations from database...</span>
              </div>
            ) : payrollData.roster?.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No payroll records found for {selectedMonth}. Click "1-Click Batch Run" above to calculate payroll.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-[#E8DFC8]">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Designation &amp; Dept</th>
                      <th className="py-3 px-4 text-right">Basic Pay</th>
                      <th className="py-3 px-4 text-right">HRA (40%)</th>
                      <th className="py-3 px-4 text-right">DA (20%)</th>
                      <th className="py-3 px-4 text-right">Gross CTC</th>
                      <th className="py-3 px-4 text-right">EPF (12%)</th>
                      <th className="py-3 px-4 text-right">TDS / PT</th>
                      <th className="py-3 px-4 text-right font-black text-slate-900">Net Disbursed</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFC8]">
                    {payrollData.roster.map((row: any) => (
                      <tr key={row.id} className="hover:bg-[#FAF7F2] transition">
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block font-bold">{row.name}</strong>
                          <span className="text-[10px] font-mono text-amber-700 font-bold">{row.employeeCode}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">{row.designation}</span>
                          <span className="text-[10px] text-slate-400">{row.department}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">{formatCurrency(row.basicPay || 0)}</td>
                        <td className="py-3 px-4 text-right font-mono">{formatCurrency(row.hra || 0)}</td>
                        <td className="py-3 px-4 text-right font-mono">{formatCurrency(row.da || 0)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(row.grossPay || 0)}</td>
                        <td className="py-3 px-4 text-right font-mono text-rose-700">{formatCurrency(row.epfDeduction || 0)}</td>
                        <td className="py-3 px-4 text-right font-mono text-rose-700">{formatCurrency((row.tdsDeduction || 0) + (row.ptDeduction || 0))}</td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                          {formatCurrency(row.netPay || 0)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenPayslip(row.id)}
                            className="text-[11px] py-1 px-3 hover:bg-amber-50 hover:text-amber-900 border-[#E8DFC8]"
                            leftIcon={<FileText className="w-3.5 h-3.5 text-amber-600" />}
                          >
                            Payslip
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STATUTORY COMPLIANCE REGISTER */}
      {/* ========================================================================= */}
      {activeTab === 'statutory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total EPF (Employee 12%)</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{formatCurrency(payrollData.counts?.totalEpfSum || 0)}</span>
              <span className="text-[10px] text-slate-500">Provident Fund Act 1952</span>
            </div>
            <div className="p-5 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total ESIC Contribution</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{formatCurrency(payrollData.counts?.totalEsicSum || 0)}</span>
              <span className="text-[10px] text-slate-500">ESI Corporation Portal</span>
            </div>
            <div className="p-5 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Professional Tax (PT)</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{formatCurrency(payrollData.counts?.totalPtSum || 0)}</span>
              <span className="text-[10px] text-slate-500">State Statutory Deposit</span>
            </div>
            <div className="p-5 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">TDS Income Tax (Sec 192)</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{formatCurrency(payrollData.counts?.totalTdsSum || 0)}</span>
              <span className="text-[10px] text-slate-500">Form 24Q Quarterly Return</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-[#E8DFC8] space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Statutory Audit &amp; Remittance Summary
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              All statutory remittances are computed under CBSE Affiliation Bye-Laws Section 3.3.1. Monthly returns must be submitted to the EPFO Unified Portal and TRACES by the 15th of each calendar month.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DIGITAL SALARY SLIPS & WHATSAPP */}
      {/* ========================================================================= */}
      {activeTab === 'slips' && (
        <div className="space-y-6">
          <StaffSalarySlipsDesk embedded={true} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BANK NEFT BATCH TRANSFER */}
      {/* ========================================================================= */}
      {activeTab === 'neft' && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#E8DFC8] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-900 font-black text-[10px] uppercase rounded-md">
                Corporate Banking Desk
              </span>
              <h3 className="text-base font-black text-slate-900">
                1-Click Bank NEFT / RTGS Disbursal Batch ({selectedMonth})
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Generates pre-formatted CMS Bulk Salary Upload CSV matching HDFC, ICICI, and SBI Corporate Banking protocols. Includes Beneficiary A/c, IFSC, Beneficiary Name, and Net Amount.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="saffron"
                size="sm"
                onClick={handleDownloadCsv}
                isLoading={isExportingCsv}
                className="bg-[#D97706] hover:bg-[#B45309] text-white font-black text-xs shadow-xs"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Export Bank NEFT CSV
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {payslipData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] text-slate-900 font-sans space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Official Salary Slip
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />} className="bg-slate-900 text-white">
                  Print Salary Slip
                </Button>
                <button onClick={() => setPayslipData(null)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="border-2 border-slate-300 p-6 rounded-2xl space-y-4 bg-white text-xs">
              <div className="text-center space-y-1 border-b pb-3">
                <h2 className="text-lg font-black uppercase text-slate-900">CRAYON BOX SCHOOL</h2>
                <p className="text-[10px] text-slate-500 uppercase">Salary Slip for the Month of {selectedMonth}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFC8]">
                <div><span className="text-slate-400 font-bold">Employee:</span> <strong className="text-slate-900">{payslipData.name}</strong></div>
                <div><span className="text-slate-400 font-bold">Code:</span> <strong className="font-mono">{payslipData.employeeCode}</strong></div>
                <div><span className="text-slate-400 font-bold">Designation:</span> <span>{payslipData.designation}</span></div>
                <div><span className="text-slate-400 font-bold">Bank A/c:</span> <span className="font-mono">{payslipData.bankAccountNo || '502000456789'}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 border-r pr-3">
                  <strong className="block text-emerald-800 uppercase font-bold text-[11px] mb-1">Earnings</strong>
                  <div className="flex justify-between"><span>Basic Pay:</span> <span>{formatCurrency(payslipData.basicPay)}</span></div>
                  <div className="flex justify-between"><span>HRA (40%):</span> <span>{formatCurrency(payslipData.hra)}</span></div>
                  <div className="flex justify-between"><span>DA (20%):</span> <span>{formatCurrency(payslipData.da)}</span></div>
                  <div className="flex justify-between font-bold border-t pt-1"><span>Total Gross:</span> <span>{formatCurrency(payslipData.grossPay)}</span></div>
                </div>

                <div className="space-y-1">
                  <strong className="block text-rose-800 uppercase font-bold text-[11px] mb-1">Deductions</strong>
                  <div className="flex justify-between"><span>EPF (12%):</span> <span>{formatCurrency(payslipData.epfDeduction)}</span></div>
                  <div className="flex justify-between"><span>ESIC:</span> <span>{formatCurrency(payslipData.esicDeduction || 0)}</span></div>
                  <div className="flex justify-between"><span>TDS / PT:</span> <span>{formatCurrency((payslipData.tdsDeduction || 0) + (payslipData.ptDeduction || 0))}</span></div>
                  <div className="flex justify-between font-bold border-t pt-1"><span>Total Deductions:</span> <span>{formatCurrency(payslipData.totalDeductions)}</span></div>
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] flex justify-between items-center text-sm font-black">
                <span>Net Salary Payable:</span>
                <span className="text-emerald-800 text-base font-mono">{formatCurrency(payslipData.netPay)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HRStatutoryPayrollHubPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-slate-500 font-bold text-xs flex flex-col items-center justify-center space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
        <span>Loading HR, Statutory Payroll &amp; Disbursals Hub...</span>
      </div>
    }>
      <PayrollHubContent />
    </Suspense>
  );
}
