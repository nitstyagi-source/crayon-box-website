"use client";

import { useState } from "react";
import { FileBarChart, Filter, Download, Plus, LayoutGrid, CheckCircle2 } from "lucide-react";

export default function DynamicReportBuilder() {
  const [selectedColumns, setSelectedColumns] = useState(["Student Name", "Grade", "Status"]);

  const allColumns = [
    "Student Name", "Grade", "Section", "Status", "Transport Route", 
    "Wallet Balance", "Allergies", "Enrollment Date", "Parent Name", "Parent Email"
  ];

  const toggleColumn = (col: string) => {
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter(c => c !== col));
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-blue-600" /> Dynamic Report Builder
          </h1>
          <p className="text-sm text-slate-500">Drag-and-drop query generator to extract custom datasets.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
            Save Template
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left: Column Selector (Drag & Drop source logic simulated) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><LayoutGrid className="w-5 h-5 text-slate-400" /> Available Fields</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {allColumns.map(col => {
                const isSelected = selectedColumns.includes(col);
                return (
                  <button 
                    key={col}
                    onClick={() => toggleColumn(col)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-sm font-bold transition-all ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    {col}
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    {!isSelected && <Plus className="w-4 h-4 text-slate-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Data Preview */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <div className="flex-1 relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Add logical filters (e.g., Grade = 4A AND Status = Active)..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <button className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
              Run Query
            </button>
          </div>

          <div className="overflow-x-auto p-4 flex-1">
            {selectedColumns.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm font-bold">
                Select columns from the left panel to build your report.
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr>
                    {selectedColumns.map(col => (
                      <th key={col} className="p-4 font-bold text-slate-800 border-b-2 border-slate-200 whitespace-nowrap bg-slate-50">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    {selectedColumns.map(col => (
                      <td key={col} className="p-4 text-slate-600">
                        {col === "Student Name" ? "Leo Carter" : col === "Grade" ? "4A" : "Data..."}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50">
                    {selectedColumns.map(col => (
                      <td key={col} className="p-4 text-slate-600">
                        {col === "Student Name" ? "Mia Johnson" : col === "Grade" ? "4A" : "Data..."}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-right">
            Showing preview of 2 rows. Export to view all 450 results.
          </div>
        </div>

      </div>
    </div>
  );
}
