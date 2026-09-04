"use client";

import { useState, useEffect, useRef } from "react";
import { 
  BarChart2, Download, Printer, Filter, 
  CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, BookOpen
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { getSyllabusDashboard } from "@/app/actions/syllabus-core";

export default function SyllabusReportsPage() {
  const { activeCampusId } = useCampusContext();
  const { selectedInstitutionObj } = useInstitution();
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReport();
  }, [activeCampusId, selectedClass, selectedSession]);

  async function loadReport() {
    setIsLoading(true);
    try {
      const res = await getSyllabusDashboard(activeCampusId, selectedSession, selectedClass);
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (e) {
      console.error("Error loading reports:", e);
    } finally {
      setIsLoading(false);
    }
  }

  function handleExportCSV() {
    const subjects = reportData?.subjects || [];
    if (subjects.length === 0) return;

    const headers = [
      "Class", "Subject", "Category", "Teacher", 
      "Total Chapters", "Completed Chapters", 
      "Estimated Periods", "Completed Periods", 
      "Completion Percentage", "Pacing Status"
    ];

    const rows = subjects.map((s: any) => [
      `"${s.class_name}"`,
      `"${s.name}"`,
      `"${s.category}"`,
      `"${s.teacher_name || 'Unassigned'}"`,
      s.totalChapters,
      s.completedChapters,
      s.totalEstimatedPeriods,
      s.totalCompletedPeriods,
      `${s.completionPercentage}%`,
      `"${s.pacingStatus}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Syllabus_Completion_Report_${selectedClass}_${selectedSession}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePrint() {
    window.print();
  }

  const subjects = reportData?.subjects || [];
  const stats = reportData?.stats || { totalSubjects: 0, avgCompletion: 0, onScheduleCount: 0, delayedCount: 0 };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Academic Analytics
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Planned vs. Actual Variance</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-blue-600" />
            Syllabus Delivery & Variance Reports
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Audit curriculum delivery velocity across subjects, track teacher pacing variances, and export reports for academic review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-stone-400 font-bold">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-xs font-black text-stone-800 focus:outline-none"
            >
              <option value="All">All Grades</option>
              {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Variance Table Card */}
      <div ref={printRef} className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
        
        {/* Print Header */}
        <div className="border-b border-stone-200 pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
              {selectedInstitutionObj?.name || "ACADEMIC INSTITUTION"}
            </h2>
            <p className="text-xs text-stone-500 font-bold">
              Curriculum Variance & Syllabus Pacing Audit Report • Session {selectedSession}
            </p>
          </div>
          <div className="text-right text-xs font-mono text-stone-500">
            Cohort: {selectedClass === 'All' ? 'All Classes' : selectedClass} | Avg Delivery: {stats.avgCompletion}%
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
              <tr>
                <th className="p-3">Class</th>
                <th className="p-3">Subject Name</th>
                <th className="p-3">Assigned Faculty</th>
                <th className="p-3 font-mono">Chapters</th>
                <th className="p-3 font-mono">Periods (Done/Est)</th>
                <th className="p-3 font-mono text-right">Completion %</th>
                <th className="p-3 text-center">Pacing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {subjects.map((sub: any) => {
                const isDelayed = sub.pacingStatus !== 'On Schedule';
                return (
                  <tr key={sub.id} className="hover:bg-stone-50/60 transition">
                    <td className="p-3 font-bold text-stone-800">{sub.class_name}</td>
                    <td className="p-3 font-bold text-stone-900">{sub.name}</td>
                    <td className="p-3 text-stone-600">{sub.teacher_name || 'Unassigned'}</td>
                    <td className="p-3 font-mono font-bold text-stone-700">
                      {sub.completedChapters} / {sub.totalChapters}
                    </td>
                    <td className="p-3 font-mono font-bold text-stone-700">
                      {sub.totalCompletedPeriods} / {sub.totalEstimatedPeriods}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-stone-900">
                      {sub.completionPercentage}%
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        sub.pacingStatus === 'On Schedule' ? 'bg-emerald-100 text-emerald-800' :
                        sub.pacingStatus === 'Slightly Behind' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {sub.healthTag} {sub.pacingStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-stone-500">
          <div>
            Total Subjects Audited: <strong className="text-stone-900">{subjects.length}</strong> | 
            On Schedule: <strong className="text-emerald-700">{stats.onScheduleCount}</strong> | 
            Under Review: <strong className="text-red-700">{stats.delayedCount}</strong>
          </div>
          <div className="italic">
            Authorized Signatory: <strong className="text-stone-800">Academic Dean & Principal</strong>
          </div>
        </div>

      </div>

    </div>
  );
}
