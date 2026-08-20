"use client";

import { useState, useEffect } from "react";
import { BarChart, FileSpreadsheet, Download, Filter, Search, AlertCircle, Users, IndianRupee } from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getDefaultersReport, getPendingFees } from "@/app/actions/finance-core";

export default function ReportsModule() {
  const { activeCampusId } = useCampusContext();
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");

  useEffect(() => {
    loadData();
  }, [activeCampusId]);

  async function loadData() {
    setIsLoading(true);
    const res = await getDefaultersReport(activeCampusId);
    if (res.success) setDefaulters(res.data || []);
    setIsLoading(false);
  }

  const classes = ["All", ...Array.from(new Set(defaulters.map(d => d.className).filter(Boolean)))];

  const filtered = defaulters.filter(d => {
    const matchSearch = d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = selectedClass === "All" || d.className === selectedClass;
    return matchSearch && matchClass;
  });

  const totalOutstanding = filtered.reduce((acc, d) => acc + Number(d.balanceDue || 0), 0);

  function exportCSV() {
    if (filtered.length === 0) return;
    const headers = ["Admission No", "Student Name", "Class", "Parent Name", "Parent Mobile", "Invoice No", "Term", "Total Fee", "Paid", "Balance Due", "Status"];
    const rows = filtered.map(d => [
      d.admissionNo,
      `"${d.studentName}"`,
      `"${d.className}"`,
      `"${d.parentName}"`,
      d.parentMobile,
      d.invoiceNumber,
      `"${d.billingPeriod}"`,
      d.totalAmount,
      d.amountPaid,
      d.balanceDue,
      d.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fee_Defaulters_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <BarChart className="w-8 h-8 text-blue-600" />
             Financial & Defaulter Reports
          </h1>
          <p className="text-stone-500 mt-1">Real-time outstanding balances, class-wise dues analysis, and audit exports.</p>
        </div>
        <div>
          <button 
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="bg-stone-900 text-white font-bold py-3 px-5 rounded-2xl hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" /> Export Defaulters (CSV)
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Defaulters</p>
          <h3 className="text-3xl font-black text-stone-900 mt-1">{filtered.length}</h3>
          <p className="text-xs text-stone-500 mt-1">Students with unpaid term invoices</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Outstanding Balance</p>
          <h3 className="text-3xl font-black text-orange-600 mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-stone-500 mt-1">Class-filtered recoverable balance</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Recovery Rate</p>
          <h3 className="text-3xl font-black text-green-700 mt-1">
            {defaulters.length > 0 
              ? Math.round((defaulters.filter(d => d.amountPaid > 0).length / defaulters.length) * 100)
              : 100}%
          </h3>
          <p className="text-xs text-stone-500 mt-1">Partially settled student ratio</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search student, adm no..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-stone-500">Filter Class:</span>
          <select 
            value={selectedClass} 
            onChange={e => setSelectedClass(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-bold text-stone-700 focus:outline-none"
          >
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Defaulters Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Student</th>
                <th className="p-4 font-bold">Class</th>
                <th className="p-4 font-bold">Guardian Contact</th>
                <th className="p-4 font-bold">Invoice Ref</th>
                <th className="p-4 font-bold">Total Invoiced</th>
                <th className="p-4 font-bold">Paid</th>
                <th className="p-4 font-bold text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr><td colSpan={7} className="p-10 text-center font-bold text-stone-400">Loading audit records...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center font-bold text-stone-400">No overdue fee defaulters found! All enrolled students have settled their invoices.</td></tr>
              ) : (
                filtered.map(d => (
                  <tr key={d.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-stone-900">{d.studentName}</p>
                      <p className="text-xs text-stone-400 font-mono">{d.admissionNo}</p>
                    </td>
                    <td className="p-4 font-bold text-stone-700">{d.className}</td>
                    <td className="p-4">
                      <p className="text-stone-800 text-xs font-medium">{d.parentName}</p>
                      <p className="text-stone-400 text-xs font-mono">{d.parentMobile}</p>
                    </td>
                    <td className="p-4 font-mono text-xs text-stone-600">{d.invoiceNumber}</td>
                    <td className="p-4 text-stone-700">₹{d.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-green-700 font-medium">₹{d.amountPaid.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right font-black text-orange-600">
                      ₹{d.balanceDue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
