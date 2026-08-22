"use client";

import React, { useState } from 'react';
import {
  Users, UserCheck, CreditCard, ShieldCheck, Download,
  Plus, Search, Filter, Calendar, Award, ArrowRight
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function HumanResourcesPayrollPage() {
  const [selectedInst, setSelectedInst] = useState<string>('ALL');

  const employees = [
    {
      uuid: 'EMP-VET-1042',
      employeeCode: 'CBS-EMP-042',
      name: 'Dr. Meenakshi Sundaram',
      designation: 'Senior PGT Mathematics & HOD',
      primaryInstitution: 'CBS (70%)',
      secondaryInstitution: 'AS (30%)',
      grossSalary: '₹80,000',
      epfDeduction: '₹6,669',
      esiDeduction: '₹0 (Exempt)',
      ptDeduction: '₹200',
      tdsDeduction: '₹1,500',
      netPay: '₹67,631',
      leaveBalance: '8 CL • 10 SL • 15 EL',
      status: 'ACTIVE',
    },
    {
      uuid: 'EMP-VET-1043',
      employeeCode: 'CBPS-EMP-012',
      name: 'Mrs. Shalini Mehta',
      designation: 'Montessori Headmistress',
      primaryInstitution: 'CBPS (100%)',
      grossSalary: '₹65,000',
      epfDeduction: '₹5,418',
      esiDeduction: '₹0 (Exempt)',
      ptDeduction: '₹200',
      tdsDeduction: '₹1,000',
      netPay: '₹58,382',
      leaveBalance: '6 CL • 8 SL • 12 EL',
      status: 'ACTIVE',
    },
    {
      uuid: 'EMP-VET-1044',
      employeeCode: 'CBS-EMP-088',
      name: 'Ramesh Kumar',
      designation: 'Junior Science Lab Assistant',
      primaryInstitution: 'CBS (100%)',
      grossSalary: '₹20,000',
      epfDeduction: '₹1,872',
      esiDeduction: '₹150 (0.75%)',
      ptDeduction: '₹0',
      tdsDeduction: '₹0',
      netPay: '₹17,978',
      leaveBalance: '4 CL • 6 SL • 10 EL',
      status: 'ACTIVE',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Universal Employee Master
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">240 Active Faculty & Staff</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">HR, Faculty Workload & Statutory Indian Payroll</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Universal employee identities, cross-institution assignments, biometric attendance, and statutory EPF/ESI/TDS payroll.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Bank Salary Disbursal (TXT/Excel)
          </button>
        </div>
      </div>

      {/* Staff Payroll & Assignment Ledger */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" /> Faculty & Staff Payroll Matrix (August 2026)
          </h2>
          <span className="text-xs text-stone-400 font-semibold">Statutory Deductions Computed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Employee & Code</th>
                <th className="p-3.5">Designation & Workload</th>
                <th className="p-3.5 text-right">Gross Salary</th>
                <th className="p-3.5 text-right">EPF (12%)</th>
                <th className="p-3.5 text-right">ESI (0.75%)</th>
                <th className="p-3.5 text-right">TDS & PT</th>
                <th className="p-3.5 text-right">Net Take-Home</th>
                <th className="p-3.5 text-right">Leave Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {employees.map((emp) => (
                <tr key={emp.uuid} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-black text-stone-900 block text-sm">{emp.name}</span>
                    <span className="font-mono text-stone-400 text-[10px]">{emp.employeeCode} • {emp.uuid}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-stone-800 block">{emp.designation}</span>
                    <span className="text-indigo-600 font-semibold text-[11px]">
                      {emp.primaryInstitution} {emp.secondaryInstitution && `+ ${emp.secondaryInstitution}`}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-bold text-stone-900">{emp.grossSalary}</td>
                  <td className="p-3.5 text-right text-rose-600 font-semibold">-{emp.epfDeduction}</td>
                  <td className="p-3.5 text-right text-stone-600 font-medium">{emp.esiDeduction}</td>
                  <td className="p-3.5 text-right text-rose-600 font-semibold">-{emp.tdsDeduction}</td>
                  <td className="p-3.5 text-right font-black text-emerald-600 text-sm">{emp.netPay}</td>
                  <td className="p-3.5 text-right text-stone-500 font-semibold">{emp.leaveBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
