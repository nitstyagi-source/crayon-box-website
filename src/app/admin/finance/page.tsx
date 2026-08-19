"use client";

import { useState } from "react";
import { 
  Download, 
  Receipt, 
  TrendingUp, 
  AlertCircle, 
  Search, 
  Bell, 
  FileSpreadsheet
} from "lucide-react";
import { generateQ3Invoices } from "@/app/actions/billing";

export default function AdminFinanceDashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Mock data for the table
  const defaulters = [
    { id: "STU-26-0102", name: "Aarav Sharma", grade: "Grade 5", pending: 45000, daysOverdue: 15 },
    { id: "STU-26-0345", name: "Riya Patel", grade: "Grade 8", pending: 52000, daysOverdue: 30 },
    { id: "STU-26-0891", name: "Vihaan Gupta", grade: "Grade 3", pending: 38000, daysOverdue: 5 },
    { id: "STU-26-1122", name: "Ananya Desai", grade: "Grade 10", pending: 65000, daysOverdue: 45 },
  ];

  const filteredDefaulters = defaulters.filter(d => d.id.toLowerCase().includes(searchQuery.toLowerCase()) || d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  async function handleGenerateInvoices() {
    setIsGenerating(true);
    setMessage(null);
    try {
      // Hardcoded campus ID for demo purposes
      const result = await generateQ3Invoices("campus-001");
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Invoices generated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to generate invoices.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Revenue Command Center</h1>
          <p className="text-stone-500 mt-1">Manage fee collections, invoices, and track outstanding dues.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={handleGenerateInvoices}
            disabled={isGenerating}
            className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
          >
            <Receipt className="w-4 h-4" /> {isGenerating ? "Generating..." : "Generate Q3 Invoices"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Collected Today</p>
            <h3 className="text-2xl font-black text-stone-900">₹ 1,45,000</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Outstanding Dues</p>
            <h3 className="text-2xl font-black text-stone-900">₹ 8,24,500</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Defaulter Accounts</p>
            <h3 className="text-2xl font-black text-stone-900">42</h3>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-stone-900">Pending Dues & Defaulters</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Student ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Student ID</th>
                <th className="p-4 font-bold">Grade</th>
                <th className="p-4 font-bold">Pending Amount</th>
                <th className="p-4 font-bold">Days Overdue</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDefaulters.map((student, idx) => (
                <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 font-bold text-stone-900">{student.name}</td>
                  <td className="p-4 text-stone-500 font-mono text-sm">{student.id}</td>
                  <td className="p-4 text-stone-600">{student.grade}</td>
                  <td className="p-4 font-bold text-stone-900">₹{student.pending.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      student.daysOverdue > 30 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {student.daysOverdue} Days
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-3 py-1.5 rounded-lg text-sm transition-colors">
                      <Bell className="w-3.5 h-3.5" /> Remind
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDefaulters.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">No matching defaulters found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
