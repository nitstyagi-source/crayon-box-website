"use client";

import React, { useState, useEffect } from 'react';
import {
  CreditCard, IndianRupee, ArrowUpRight, TrendingUp,
  Receipt, Download, ShieldCheck, CheckCircle2, AlertCircle,
  Building2, Layers, RefreshCw, BarChart3, Plus
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DataTable } from '@/components/ui/DataTable';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';

export default function ExecutiveFinancePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentInstitution } = useInstitution();

  const fetchInvoices = async () => {
    setIsLoading(true);
    const supabase = createClient();
    
    let query = supabase
      .from('student_invoices')
      .select(`
        id,
        invoice_number,
        total_amount,
        amount_paid,
        status,
        due_date,
        created_at,
        students (first_name, last_name, admission_no)
      `)
      .order('created_at', { ascending: false });
      
    if (currentInstitution !== 'ALL') {
      query = query.eq('institution_code', currentInstitution);
    }

    const { data } = await query;

    setInvoices(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentInstitution]);

  const totalBilled = invoices.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + (Number(inv.amount_paid) || 0), 0);
  const totalOutstanding = totalBilled - totalCollected;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const columns = [
    {
      key: 'invoice_number',
      header: 'Invoice #',
      render: (row: any) => (
        <span className="font-mono font-bold text-slate-900">{row.invoice_number}</span>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      render: (row: any) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {row.students?.first_name} {row.students?.last_name}
          </span>
          <span className="text-slate-400 font-mono text-[10px]">{row.students?.admission_no}</span>
        </div>
      ),
    },
    {
      key: 'total_amount',
      header: 'Billed Amount',
      align: 'right' as const,
      render: (row: any) => <span className="font-bold text-slate-900">{formatCurrency(row.total_amount || 0)}</span>,
    },
    {
      key: 'amount_paid',
      header: 'Paid Amount',
      align: 'right' as const,
      render: (row: any) => <span className="font-bold text-emerald-600">{formatCurrency(row.amount_paid || 0)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right' as const,
      render: (row: any) => (
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
            row.status === 'PAID'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {row.status || 'UNPAID'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Option 6 Sattva-Digital Header Banner */}
      <VastuModuleBanner
        badgeText="Live PostgreSQL Fee Ledgers (`student_invoices`)"
        badgeIcon={<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        institutionText={`${invoices.length} Invoices in Database`}
        title="Executive Finance & Fee Ledgers"
        titleIcon={<IndianRupee className="w-7 h-7 text-amber-300" />}
        description="Real-time financial telemetry calculated from live database invoice records with Vastu Dhan/Lakshmi balance."
        actions={
          <Button
            variant="saffron"
            size="sm"
            onClick={fetchInvoices}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Live DB
          </Button>
        }
      />

      {/* Live Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Total Billed (Live DB)"
          value={isLoading ? '...' : formatCurrency(totalBilled)}
          subtext={`${invoices.length} Invoices Generated`}
          icon={<CreditCard className="w-4 h-4" />}
          iconBgColor="bg-slate-100 text-slate-700"
        />
        <StatCard
          label="Total Collected"
          value={isLoading ? '...' : formatCurrency(totalCollected)}
          subtext={totalBilled > 0 ? `${Math.round((totalCollected / totalBilled) * 100)}% Collection Yield` : '0% Collection Yield'}
          icon={<IndianRupee className="w-4 h-4" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Total Outstanding"
          value={isLoading ? '...' : formatCurrency(totalOutstanding)}
          subtext="Pending Student Ledger Balance"
          icon={<AlertCircle className="w-4 h-4" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Live Invoices Table */}
      <DataTable
        title="Student Fee Invoices (Live Database)"
        subtitle="Direct records from PostgreSQL `student_invoices` table"
        columns={columns}
        data={invoices}
        searchKey="invoice_number"
        searchPlaceholder="Search invoice #..."
        emptyTitle="No Invoices in Database"
        emptyDescription="Your database currently has 0 fee invoice records. Invoices generated for enrolled students will appear here automatically."
      />

    </div>
  );
}
