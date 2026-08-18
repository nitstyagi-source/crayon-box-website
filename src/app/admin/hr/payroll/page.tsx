"use client";

import { useState } from "react";
import { Wallet, Calculator, FileText, Download, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function PayrollEngine() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(4); // Completed
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Wallet className="w-6 h-6 text-emerald-600" /> Payroll Engine</h1>
          <p className="text-sm text-slate-500">August 2026 Financial Processing & Payslip Generation</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-bold cursor-not-allowed">Bank CSV Setup</button>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex justify-between relative">
        <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
        <div className="absolute top-1/2 left-10 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
        
        {[
          { num: 1, title: "Leave Reconciliation" },
          { num: 2, title: "Deductions & Ledger" },
          { num: 3, title: "Generate & Dispatch" }
        ].map((s) => (
          <div key={s.num} className="relative z-10 flex flex-col items-center bg-white px-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${step >= s.num ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
              {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : s.num}
            </div>
            <span className={`text-xs font-bold ${step >= s.num ? 'text-slate-800' : 'text-slate-400'}`}>{s.title}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Leave Reconciliation */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Auto-Calculated LWP (Leave Without Pay)</h2>
            <button onClick={() => setStep(2)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-colors flex items-center gap-2">Approve Days <ArrowRight className="w-4 h-4" /></button>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-4 bg-slate-50 font-bold text-slate-800 border-b border-slate-200">Staff Member</th>
                <th className="p-4 bg-slate-50 font-bold text-slate-800 border-b border-slate-200 text-center">Working Days</th>
                <th className="p-4 bg-slate-50 font-bold text-emerald-600 border-b border-slate-200 text-center">Present / Paid Leave</th>
                <th className="p-4 bg-red-50 font-bold text-red-600 border-b border-red-100 text-center">LWP (Unpaid)</th>
                <th className="p-4 bg-slate-50 font-bold text-slate-800 border-b border-slate-200 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-4 font-bold text-slate-800">Sarah Newton</td>
                <td className="p-4 text-center font-mono">22</td>
                <td className="p-4 text-center font-mono text-emerald-600 font-bold">20</td>
                <td className="p-4 text-center font-mono text-red-600 font-bold bg-red-50/50">2</td>
                <td className="p-4 text-center"><button className="text-xs font-bold text-indigo-600 hover:underline">Edit LWP</button></td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-800">Michael Ross</td>
                <td className="p-4 text-center font-mono">22</td>
                <td className="p-4 text-center font-mono text-emerald-600 font-bold">22</td>
                <td className="p-4 text-center font-mono text-slate-400">0</td>
                <td className="p-4 text-center"><button className="text-xs font-bold text-indigo-600 hover:underline">Edit LWP</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Step 2: Ledger */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center gap-2"><Calculator className="w-5 h-5 text-indigo-500" /> Dynamic Ledger Preview</h2>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-50">Back</button>
              <button onClick={() => setStep(3)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-colors flex items-center gap-2">Review Totals <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-4 bg-slate-50 font-bold text-slate-800 border-b border-slate-200">Staff Member</th>
                <th className="p-4 bg-slate-50 font-bold text-slate-600 border-b border-slate-200 text-right">Base Salary</th>
                <th className="p-4 bg-slate-50 font-bold text-emerald-600 border-b border-slate-200 text-right">+ Allowances</th>
                <th className="p-4 bg-red-50 font-bold text-red-600 border-b border-red-100 text-right">- Deductions (PF/LWP)</th>
                <th className="p-4 bg-slate-900 font-bold text-white border-b border-slate-900 text-right">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-4 font-bold text-slate-800">Sarah Newton</td>
                <td className="p-4 text-right font-mono text-slate-600">₹45,000.00</td>
                <td className="p-4 text-right font-mono text-emerald-600">₹5,000.00</td>
                <td className="p-4 text-right font-mono text-red-600 bg-red-50/50">-₹6,000.00</td>
                <td className="p-4 text-right font-mono font-black text-slate-900 bg-slate-50/50">₹44,000.00</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-800">Michael Ross</td>
                <td className="p-4 text-right font-mono text-slate-600">₹60,000.00</td>
                <td className="p-4 text-right font-mono text-emerald-600">₹8,000.00</td>
                <td className="p-4 text-right font-mono text-red-600">-₹2,000.00</td>
                <td className="p-4 text-right font-mono font-black text-slate-900 bg-slate-50/50">₹66,000.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Step 3: Dispatch */}
      {step === 3 && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 text-white p-12 text-center max-w-2xl mx-auto">
          <FileText className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-2">Ready to Process Payroll</h2>
          <p className="text-slate-400 mb-8">This action will permanently lock the August 2026 ledger, email password-protected PDF payslips to 142 staff members, and generate the unified Bank Transfer CSV.</p>
          
          <div className="bg-slate-800 p-6 rounded-2xl flex justify-between items-center mb-8 border border-slate-700 text-left">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Total Net Payable</p>
              <p className="text-4xl font-black font-mono text-emerald-400">₹8,450,000.00</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Staff Count</p>
              <p className="text-2xl font-bold">142</p>
            </div>
          </div>

          <div className="flex gap-4">
             <button onClick={() => setStep(2)} disabled={isProcessing} className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors">Cancel</button>
             <button onClick={processPayroll} disabled={isProcessing} className="flex-[2] py-4 bg-emerald-500 text-white rounded-xl font-black text-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50">
               {isProcessing ? "Processing..." : "Generate Payroll"}
             </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl shadow-sm p-12 text-center animate-in zoom-in max-w-2xl mx-auto">
          <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-emerald-900 mb-2">Payroll Processed!</h2>
          <p className="text-emerald-700 mb-8">142 PDF payslips dispatched. The Bank CSV is ready for download.</p>
          <button className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-md flex items-center gap-2 mx-auto">
             <Download className="w-5 h-5" /> Download Bank CSV
          </button>
        </div>
      )}

    </div>
  );
}
