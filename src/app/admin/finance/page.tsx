"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit2, AlertTriangle, Building2, CheckCircle2, CreditCard } from "lucide-react";
import { getFeePayments } from "@/app/actions/forms";

type FeeStructure = {
  id: string;
  category: string;
  amount: number;
  period: "Monthly" | "Quarterly" | "Annual";
};

const defaultTuition: FeeStructure[] = [
  { id: "t1", category: "Pre-K & Kindergarten", amount: 15000, period: "Quarterly" },
  { id: "t2", category: "Grade 1 - 5", amount: 18000, period: "Quarterly" },
  { id: "t3", category: "Grade 6 - 8", amount: 20000, period: "Quarterly" },
];

const defaultTransport: FeeStructure[] = [
  { id: "tr1", category: "Zone 1 (0-5 km)", amount: 4500, period: "Quarterly" },
  { id: "tr2", category: "Zone 2 (5-10 km)", amount: 6000, period: "Quarterly" },
  { id: "tr3", category: "Zone 3 (10+ km)", amount: 8000, period: "Quarterly" },
];

const defaultOther: FeeStructure[] = [
  { id: "o1", category: "IT & Digital Activity Fee", amount: 2000, period: "Quarterly" },
  { id: "o2", category: "Annual Subscription (Library)", amount: 1500, period: "Annual" },
];

export default function FeeManagement() {
  const [tuition, setTuition] = useState(defaultTuition);
  const [transport, setTransport] = useState(defaultTransport);
  const [other, setOther] = useState(defaultOther);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    getFeePayments().then(setTransactions);
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const renderTable = (title: string, data: FeeStructure[], setter: React.Dispatch<React.SetStateAction<FeeStructure[]>>) => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800">{title}</h3>
        {isEditing && (
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add Tier
          </button>
        )}
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-xs border-b border-slate-200">
          <tr>
            <th className="px-5 py-3 font-medium">Category / Grade</th>
            <th className="px-5 py-3 font-medium">Amount (₹)</th>
            <th className="px-5 py-3 font-medium">Billing Period</th>
            {isEditing && <th className="px-5 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item, index) => (
            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-5 py-3">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={item.category} 
                    onChange={(e) => {
                      const newData = [...data];
                      newData[index].category = e.target.value;
                      setter(newData);
                    }}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-blue-500"
                  />
                ) : (
                  <span className="font-medium text-slate-700">{item.category}</span>
                )}
              </td>
              <td className="px-5 py-3">
                {isEditing ? (
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-slate-400">₹</span>
                    <input 
                      type="number" 
                      value={item.amount} 
                      onChange={(e) => {
                        const newData = [...data];
                        newData[index].amount = Number(e.target.value);
                        setter(newData);
                      }}
                      className="w-full pl-6 pr-2 py-1 border border-slate-300 rounded text-sm focus:ring-blue-500 font-medium"
                    />
                  </div>
                ) : (
                  <span className="font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                )}
              </td>
              <td className="px-5 py-3">
                {isEditing ? (
                  <select 
                    value={item.period}
                    onChange={(e) => {
                      const newData = [...data];
                      newData[index].period = e.target.value as "Monthly" | "Quarterly" | "Annual";
                      setter(newData);
                    }}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-blue-500 bg-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                ) : (
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                    {item.period}
                  </span>
                )}
              </td>
              {isEditing && (
                <td className="px-5 py-3 text-right">
                  <button className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fee Structure Configuration</h1>
          <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
            <Building2 className="w-4 h-4 text-slate-400" />
            Editing master structure for <strong className="text-slate-700">Delhi Main Branch</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="flex items-center gap-1 text-sm font-bold text-green-600 animate-in fade-in duration-300">
              <CheckCircle2 className="w-4 h-4" /> Changes Published
            </span>
          )}
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" /> Publish Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Edit2 className="w-4 h-4" /> Edit Master Fees
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Warning:</strong> Modifying the base fee structure will automatically recalculate the pending dues for the upcoming billing cycle for all enrolled students in this campus. Ensure appropriate communication is sent to parents.
          </p>
        </div>
      )}

      {/* Tables */}
      <div className="pt-4">
        {renderTable("Tuition Fees (By Grade)", tuition, setTuition)}
        {renderTable("Transport Fees (By Zone)", transport, setTransport)}
        {renderTable("Mandatory IT & Activity Fees", other, setOther)}
      </div>

      {/* Transactions */}
      <div className="pt-8">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-slate-600" /> Recent Fee Payments
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-bold">Transaction ID</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Student ID</th>
                <th className="px-6 py-4 font-bold">Parent Name</th>
                <th className="px-6 py-4 font-bold">Amount (₹)</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No transactions recorded yet.</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">{tx.id}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{tx.studentId}</td>
                    <td className="px-6 py-4 text-slate-700">{tx.parentName}</td>
                    <td className="px-6 py-4 font-bold text-green-700">₹{tx.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
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
