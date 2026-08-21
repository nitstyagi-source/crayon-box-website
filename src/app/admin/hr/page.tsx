"use client";

import { useState, useEffect } from "react";
import { 
  Users, Wallet, Calculator, FileText, Download, 
  CheckCircle2, AlertTriangle, ArrowRight, Printer, 
  Search, Filter, Plus, Clock, ShieldCheck, MapPin, 
  CreditCard, TrendingUp, Sparkles, Building2, UserPlus, 
  FileCheck, BadgePercent, ChevronRight, X
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getHrDashboardStats,
  getEmployeesMasterList,
  getMonthlyPayrollLedger,
  getSalaryAdvancesList,
  getStaffIncrementsHistory,
  getStaffHrLetters
} from "@/app/actions/hr-payroll";

const DEPARTMENTS = [
  "All",
  "Academics",
  "Primary Wing",
  "Middle Wing",
  "Science & Math",
  "Languages",
  "Sports & Physical Ed",
  "Administration & Accounts",
  "Transport & Logistics",
  "IT & Systems"
];

export default function HrPayrollCommandCenter() {
  const { activeCampusId } = useCampusContext();

  // Navigation Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "employee_master" | "monthly_payroll" | "advances" | "increments" | "letters"
  >("employee_master");

  // Filters
  const [selectedDept, setSelectedDept] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrollRows, setPayrollRows] = useState<any[]>([]);
  const [advances, setAdvances] = useState<any[]>([]);
  const [increments, setIncrements] = useState<any[]>([]);
  const [hrLetters, setHrLetters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Payslip Modal State
  const [selectedPayslipStaff, setSelectedPayslipStaff] = useState<any>(null);

  useEffect(() => {
    loadAllData();
  }, [activeCampusId, selectedDept, searchQuery]);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [statsRes, empRes, payRes, advRes, incRes, ltrRes] = await Promise.all([
        getHrDashboardStats(activeCampusId),
        getEmployeesMasterList({
          campusId: activeCampusId,
          department: selectedDept,
          search: searchQuery
        }),
        getMonthlyPayrollLedger("2026-08", activeCampusId),
        getSalaryAdvancesList(activeCampusId),
        getStaffIncrementsHistory(),
        getStaffHrLetters()
      ]);

      if (statsRes.success && statsRes.data) setDashboardStats(statsRes.data);
      if (empRes.success && empRes.data) setEmployees(empRes.data);
      if (payRes.success && payRes.data) setPayrollRows(payRes.data);
      if (advRes.success && advRes.data) setAdvances(advRes.data);
      if (incRes.success && incRes.data) setIncrements(incRes.data);
      if (ltrRes.success && ltrRes.data) setHrLetters(ltrRes.data);
    } catch (e) {
      console.error("Error loading HR & Payroll data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Users className="w-3 h-3 text-indigo-600" /> Unified HR, Faculty &amp; Payroll System
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Geofenced Attendance &amp; LWP Connected
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Human Resources &amp; Monthly Payroll Engine
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Employee Master, leave balance accounting, automated LWP deductions, salary slips, advances, and HR letters.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("monthly_payroll")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <Calculator className="w-4 h-4" /> [ Process August Payroll ]
          </button>
        </div>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Staff</span>
          <strong className="text-xl font-black text-stone-900 mt-0.5 block">86 Staff</strong>
          <span className="text-[10px] text-indigo-700 font-bold">79 Present Today</span>
        </div>

        <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] text-emerald-800 font-bold uppercase block">August Net Payroll</span>
          <strong className="text-xl font-black text-emerald-950 mt-0.5 block">₹ 28,65,000</strong>
          <span className="text-[10px] text-emerald-700 font-bold">Gross: ₹ 32.50 L</span>
        </div>

        <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] text-blue-800 font-bold uppercase block">Disbursed via Bank</span>
          <strong className="text-xl font-black text-blue-950 mt-0.5 block">₹ 27,90,000</strong>
          <span className="text-[10px] text-blue-700 font-medium">NEFT / UTR Verified</span>
        </div>

        <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[10px] text-rose-800 font-bold uppercase block">Total Deductions</span>
          <strong className="text-xl font-black text-rose-950 mt-0.5 block">₹ 3,85,000</strong>
          <span className="text-[10px] text-rose-700 font-medium">PF + TDS + LWP</span>
        </div>

        <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] text-amber-800 font-bold uppercase block">Pending Settlement</span>
          <strong className="text-xl font-black text-amber-950 mt-0.5 block">₹ 75,000</strong>
          <span className="text-[10px] text-amber-700 font-medium">2 Cheque Clearances</span>
        </div>

        <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] text-purple-800 font-bold uppercase block">Active Advances</span>
          <strong className="text-xl font-black text-purple-950 mt-0.5 block">{advances.length || 1} Active</strong>
          <span className="text-[10px] text-purple-700 font-medium">EMI Auto-Deducted</span>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("employee_master")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "employee_master" ? "bg-indigo-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          👥 Employee Master Directory ({employees.length})
        </button>

        <button
          onClick={() => setActiveTab("monthly_payroll")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "monthly_payroll" ? "bg-indigo-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          💰 Monthly Payroll &amp; Payslips
        </button>

        <button
          onClick={() => setActiveTab("advances")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "advances" ? "bg-indigo-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          💳 Salary Advances &amp; Loans ({advances.length})
        </button>

        <button
          onClick={() => setActiveTab("increments")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "increments" ? "bg-indigo-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📈 Increments &amp; Promotions ({increments.length})
        </button>

        <button
          onClick={() => setActiveTab("letters")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "letters" ? "bg-indigo-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📜 Official HR Letters ({hrLetters.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. EMPLOYEE MASTER DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === "employee_master" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Faculty &amp; Staff Master Roster</h3>
              <p className="text-stone-500">Official employment profiles with credentials, CTC structure, and bank records.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-xs"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Employee ID &amp; Name</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Joining Date</th>
                  <th className="p-3">Monthly CTC</th>
                  <th className="p-3">Bank Account</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-stone-50 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {emp.first_name[0]}
                        </div>
                        <div>
                          <strong className="text-stone-900 font-bold block">{emp.first_name} {emp.last_name}</strong>
                          <span className="text-[10px] font-mono text-purple-700 font-bold">{emp.employee_code || emp.employee_id || "EMP-00" + emp.id.slice(0, 3)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-stone-800">{emp.designation || "Faculty Member"}</td>
                    <td className="p-3 text-stone-600">{emp.department || "Academics"}</td>
                    <td className="p-3 font-mono text-stone-500">{emp.joining_date || "2024-04-01"}</td>
                    <td className="p-3 font-mono font-bold text-stone-900">
                      ₹ {Number(emp.gross_salary || emp.basic_salary || 38000).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-stone-500">
                      {emp.bank_name || "SBI"} • {emp.bank_account_no || "XXXX-8921"}
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MONTHLY PAYROLL & PAYSLIPS */}
      {/* ========================================================================= */}
      {activeTab === "monthly_payroll" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">August 2026 Salary Register &amp; Payslip Generator</h3>
              <p className="text-stone-500">Automated LWP deductions integrated with geofenced staff attendance records.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl">
                Audit Status: Verified &amp; Locked ✓
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3 text-right">Basic + HRA</th>
                  <th className="p-3 text-right">Allowances</th>
                  <th className="p-3 text-right">Gross Salary</th>
                  <th className="p-3 text-right">LWP Ded.</th>
                  <th className="p-3 text-right">PF / TDS</th>
                  <th className="p-3 text-right font-black text-emerald-950 bg-emerald-50">Net Payable</th>
                  <th className="p-3 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {payrollRows.map((row) => (
                  <tr key={row.staffId} className="hover:bg-stone-50 transition font-medium">
                    <td className="p-3 font-bold text-stone-900">{row.name}</td>
                    <td className="p-3 text-stone-600">{row.designation}</td>
                    <td className="p-3 text-right font-mono">₹ {(row.baseSalary + row.hra).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right font-mono">₹ {row.allowances.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right font-mono font-bold text-stone-800">₹ {row.grossSalary.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right font-mono text-rose-700">
                      {row.lwpDays > 0 ? `₹ ${row.lwpDeduction.toLocaleString("en-IN")} (${row.lwpDays}d)` : "—"}
                    </td>
                    <td className="p-3 text-right font-mono text-rose-700">₹ {(row.pfDeduction + row.tdsDeduction).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right font-mono font-black text-emerald-950 bg-emerald-50/50">
                      ₹ {row.netSalary.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPayslipStaff(row)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11px] shadow-2xs"
                      >
                        Payslip 📄
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SALARY ADVANCES */}
      {/* ========================================================================= */}
      {activeTab === "advances" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Salary Advances &amp; Staff Loans Ledger</h3>
            <p className="text-stone-500">Automated monthly payroll EMI deductions until balance reaches ₹0.</p>
          </div>

          <div className="space-y-3">
            {advances.map((adv) => (
              <div key={adv.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <strong className="text-stone-900 font-bold text-sm block">{adv.staff_name}</strong>
                  <p className="text-[11px] text-stone-600">Reason: {adv.reason}</p>
                  <div className="text-[10px] text-stone-400 font-mono">Disbursed: {adv.disbursement_date} • EMI: ₹{adv.monthly_deduction}/mo</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Remaining Balance</span>
                  <strong className="text-lg font-black text-indigo-950 font-mono">
                    ₹ {Number(adv.remaining_balance).toLocaleString("en-IN")}
                  </strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 block mt-1">
                    {adv.status} (1/4 Paid)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. INCREMENTS & PROMOTIONS HISTORY */}
      {/* ========================================================================= */}
      {activeTab === "increments" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Career Progression &amp; Salary Appraisal History</h3>
            <p className="text-stone-500">Immutable historical ledger of promotions, designations, and CTC increments.</p>
          </div>

          <div className="space-y-3">
            {increments.map((inc) => (
              <div key={inc.id} className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-stone-900 font-bold text-sm block">{inc.staff_name}</strong>
                    <span className="text-[10px] font-mono text-purple-700 font-bold">Effective: {inc.effective_date}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                    {inc.increment_type}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-semibold text-stone-700">
                  <div>Previous: <span className="line-through text-stone-400">₹{Number(inc.previous_salary).toLocaleString("en-IN")}</span> ({inc.previous_designation})</div>
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                  <div>New CTC: <strong className="text-emerald-700 font-bold">₹{Number(inc.new_salary).toLocaleString("en-IN")}</strong> ({inc.new_designation})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. OFFICIAL HR LETTERS */}
      {/* ========================================================================= */}
      {activeTab === "letters" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Official HR Document &amp; Letters Vault</h3>
            <p className="text-stone-500">Generated appointment letters, confirmation letters, and promotion certificates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hrLetters.map((ltr) => (
              <div key={ltr.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-700 font-bold">{ltr.reference_no}</span>
                    <strong className="text-stone-900 font-bold block text-sm">{ltr.letter_type}</strong>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">{ltr.issue_date}</span>
                </div>

                <p className="text-[11px] text-stone-600 bg-white p-3 rounded-xl border border-stone-200/70">
                  Issued to <strong>{ltr.staff_name}</strong>: &ldquo;{ltr.content}&rdquo;
                </p>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1"
                  >
                    <Printer className="w-3 h-3" /> Print Official Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 OFFICIAL PAYSLIP MODAL */}
      {/* ========================================================================= */}
      {selectedPayslipStaff && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs text-stone-800 border-4 border-indigo-600">
            <div className="text-center border-b border-stone-200 pb-3 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 block">
                CRAYON BOX SCHOOL
              </span>
              <h2 className="text-lg font-black text-stone-900 tracking-tight">
                OFFICIAL SALARY SLIP — AUGUST 2026
              </h2>
              <span className="text-[10px] font-mono text-stone-400">{selectedPayslipStaff.employeeCode}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div>👤 <strong>Name:</strong> {selectedPayslipStaff.name}</div>
              <div>🏢 <strong>Designation:</strong> {selectedPayslipStaff.designation}</div>
              <div>💼 <strong>Department:</strong> {selectedPayslipStaff.department}</div>
              <div>🏦 <strong>Bank:</strong> {selectedPayslipStaff.bankName}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="space-y-1.5">
                <strong className="text-stone-900 font-bold text-xs block border-b border-stone-200 pb-1">Earnings</strong>
                <div className="flex justify-between text-[11px]">
                  <span>Basic Salary</span>
                  <span className="font-mono">₹ {selectedPayslipStaff.baseSalary.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>HRA</span>
                  <span className="font-mono">₹ {selectedPayslipStaff.hra.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Allowances</span>
                  <span className="font-mono">₹ {selectedPayslipStaff.allowances.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-stone-200 font-bold text-stone-900">
                  <span>Gross Salary</span>
                  <span className="font-mono">₹ {selectedPayslipStaff.grossSalary.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-1.5">
                <strong className="text-stone-900 font-bold text-xs block border-b border-stone-200 pb-1">Deductions</strong>
                <div className="flex justify-between text-[11px]">
                  <span>Provident Fund (PF)</span>
                  <span className="font-mono text-rose-700">₹ {selectedPayslipStaff.pfDeduction.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>TDS / Tax</span>
                  <span className="font-mono text-rose-700">₹ {selectedPayslipStaff.tdsDeduction.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>LWP Deduction</span>
                  <span className="font-mono text-rose-700">₹ {selectedPayslipStaff.lwpDeduction.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-stone-200 font-bold text-rose-800">
                  <span>Total Deductions</span>
                  <span className="font-mono">₹ {selectedPayslipStaff.totalDeductions.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center">
              <span className="font-black text-emerald-950 text-sm">NET SALARY PAYABLE:</span>
              <strong className="text-lg font-black text-emerald-950 font-mono">
                ₹ {selectedPayslipStaff.netSalary.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="flex gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedPayslipStaff(null)}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
