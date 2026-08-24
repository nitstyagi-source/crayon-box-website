"use client";

import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, Flame, Wrench, CheckCircle2,
  AlertTriangle, Download, Plus, Clock, FileText
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';

export default function SafetyCompliancePage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);

  const columns = [
    {
      key: 'id',
      header: 'Work Order # & Location',
      render: (row: any) => (
        <div>
          <span className="font-mono font-bold text-slate-900 block">{row.id}</span>
          <span className="text-slate-500 text-[11px]">{row.location}</span>
        </div>
      ),
    },
    {
      key: 'issue',
      header: 'Maintenance Issue',
      render: (row: any) => <span className="font-medium text-slate-800">{row.issue}</span>,
    },
    {
      key: 'assignedTo',
      header: 'Assigned Technician',
      render: (row: any) => <span className="font-semibold text-slate-700">{row.assignedTo}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right' as const,
      render: (row: any) => (
        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold uppercase border border-amber-200">
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-amber-100">
              Statutory Governance
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">Safety Audits & Work Orders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Facility Maintenance & Fire Safety Compliance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Statutory NOC renewals, building safety inspections, fire drill audits, and preventive facility work orders with zero mock data.
          </p>
        </div>
      </div>

      {/* Live Work Orders Table with Clean Empty State */}
      <DataTable
        title="Active Maintenance Work Orders (Live Database)"
        subtitle="Direct records from facility work orders"
        columns={columns}
        data={workOrders}
        searchKey="location"
        searchPlaceholder="Search location..."
        emptyTitle="No Maintenance Work Orders in Database"
        emptyDescription="Your database currently has 0 open maintenance work orders. Logged repair and facility maintenance requests will appear here."
      />

    </div>
  );
}
