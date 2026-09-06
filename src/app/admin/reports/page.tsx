"use client";

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Filter,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  Building2,
  Calendar,
  Layers,
  ArrowUpDown,
  FileText,
  DollarSign,
  Users,
  UserCheck,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import {
  generateUniversalReportAction,
  UniversalReportResult,
  ReportColumnDef
} from '@/app/actions/report-studio-actions';
import { formatINR, formatDisplayDate } from '@/lib/utils/formatters';

type DomainType = 'STUDENTS' | 'FEES' | 'ADMISSIONS' | 'FACULTY' | 'ATTENDANCE';

export default function UniversalReportStudioPage() {
  const { currentInstitution, currentSession } = useInstitution();
  const [selectedDomain, setSelectedDomain] = useState<DomainType>('STUDENTS');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportResult, setReportResult] = useState<UniversalReportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const loadReport = async () => {
    setIsLoading(true);
    const res = await generateUniversalReportAction({
      domain: selectedDomain,
      institutionCode: currentInstitution,
      academicSession: currentSession,
      status: selectedStatus,
      className: selectedClass,
      limit: 300
    });
    setReportResult(res);
    setIsLoading(false);
  };

  useEffect(() => {
    loadReport();
  }, [selectedDomain, selectedStatus, selectedClass, currentInstitution]);

  // Export CSV helper
  const handleExportCSV = () => {
    if (!reportResult || !reportResult.data.length) return;
    const cols = reportResult.columns;
    const header = cols.map(c => '"' + c.label + '"').join(',');
    const rows = reportResult.data.map(row =>
      cols.map(c => '"' + String(row[c.key] || '').replace(/"/g, '""') + '"').join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CrayonBox_${selectedDomain}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sort helper
  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const filteredData = (reportResult?.data || []).filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(item).some(val => String(val).toLowerCase().includes(q));
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const valA = a[sortColumn];
    const valB = b[sortColumn];
    if (valA === valB) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;
    return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <VastuModuleBanner
        title="Universal Report Studio (Section 57)"
        badgeText="CONFIGURABLE REPORTING & AUDIT EXPORT"
        description="Generate live, customizable institutional reports across Students, Fees, Admissions, Staff, and Attendance with CSV/Print export and zero hardcoding."
      />

      {/* Control Strip */}
      <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        {/* Domain Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {[
            { id: 'STUDENTS', label: 'Students Roster', icon: GraduationCap },
            { id: 'FEES', label: 'Fee Invoices & Dues', icon: DollarSign },
            { id: 'ADMISSIONS', label: 'Admissions Pipeline', icon: Users },
            { id: 'FACULTY', label: 'Staff & Faculty', icon: UserCheck },
            { id: 'ATTENDANCE', label: 'Attendance Ledger', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = selectedDomain === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedDomain(tab.id as DomainType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter results..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-amber-500 outline-none w-48 sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Paid">Paid (Fees)</option>
              <option value="Pending">Pending / Due</option>
              <option value="SUBMITTED">Submitted</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadReport}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleExportCSV}
              disabled={!reportResult?.data.length}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary KPI Cards */}
      {reportResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Records</span>
            <span className="text-xl font-black text-slate-800">{reportResult.totalRecords}</span>
          </div>
          {reportResult.summary.totalAmount !== undefined && reportResult.summary.totalAmount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider">Total Sum Amount</span>
              <span className="text-xl font-black text-amber-950">{formatINR(reportResult.summary.totalAmount)}</span>
            </div>
          )}
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtered View</span>
            <span className="text-xl font-black text-slate-800">{sortedData.length}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Session</span>
            <span className="text-sm font-bold text-slate-700 truncate">{reportResult.summary.session}</span>
          </div>
        </div>
      )}

      {/* Report Table */}
      <Card className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
            Compiling live database report...
          </div>
        ) : sortedData.length === 0 ? (
          <EmptyState
            icon={<FileSpreadsheet className="w-8 h-8 text-amber-600" />}
            title="No Report Data Found"
            description="No database records matched your active filter parameters. Adjust your filters or switch domain."
            actionLabel="Reset Filters"
            onAction={() => {
              setSelectedStatus('ALL');
              setSelectedClass('ALL');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3 px-4 w-12">#</th>
                  {reportResult?.columns.map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="py-3 px-4 cursor-pointer hover:text-slate-900 transition select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sortedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/40 transition">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                    {reportResult?.columns.map(col => {
                      const val = row[col.key];
                      return (
                        <td key={col.key} className="py-2.5 px-4 font-medium">
                          {col.type === 'currency' ? (
                            <span className="font-mono font-bold text-slate-900">{formatINR(Number(val) || 0)}</span>
                          ) : col.type === 'date' ? (
                            <span className="text-slate-600">{formatDisplayDate(val)}</span>
                          ) : col.type === 'badge' ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                              String(val).toLowerCase().includes('paid') || String(val).toLowerCase().includes('active')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : String(val).toLowerCase().includes('pending')
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {String(val || '—')}
                            </span>
                          ) : (
                            <span>{String(val || '—')}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
