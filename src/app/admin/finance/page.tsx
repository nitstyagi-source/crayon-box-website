"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CreditCard, IndianRupee, ArrowUpRight, TrendingUp,
  Receipt, Download, ShieldCheck, CheckCircle2, AlertCircle,
  Building2, Layers, RefreshCw, BarChart3, Plus, Users,
  QrCode, Sparkles, Filter, Search, Clock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DataTable } from '@/components/ui/DataTable';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { useCampusContext } from '@/components/providers/CampusProvider';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';

import { FeeCollectionsPOSDesk } from '@/components/finance/FeeCollectionsPOSDesk';
import { FeeMasterStructureDesk } from '@/components/finance/FeeMasterStructureDesk';
import { MultiChildFeePaymentDesk } from '@/components/finance/MultiChildFeePaymentDesk';

type FeeHubTab = 'pos' | 'slabs' | 'family-cart' | 'ledgers';

function StudentFeesHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') as FeeHubTab | null;

  const validTabs: FeeHubTab[] = ['pos', 'slabs', 'family-cart', 'ledgers'];
  const [activeTab, setActiveTab] = useState<FeeHubTab>(
    rawTab && validTabs.includes(rawTab) ? rawTab : 'pos'
  );

  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();
  const { activeCampusId } = useCampusContext();
  const activeInst = currentInstitution || activeCampusId || 'CBS';

  // Ledgers Tab State
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);

  useEffect(() => {
    if (rawTab && validTabs.includes(rawTab) && rawTab !== activeTab) {
      setActiveTab(rawTab);
    }
  }, [rawTab]);

  const handleTabChange = (tab: FeeHubTab) => {
    setActiveTab(tab);
    router.push(`/admin/finance?tab=${tab}`, { scroll: false });
  };

  const fetchInvoices = async () => {
    setIsLoadingInvoices(true);
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
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (activeInst !== 'ALL') {
      query = query.eq('institution_code', activeInst);
    }

    const { data } = await query;
    setInvoices(data || []);
    setIsLoadingInvoices(false);
  };

  useEffect(() => {
    if (activeTab === 'ledgers') {
      fetchInvoices();
    }
  }, [activeTab, activeInst]);

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
          className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase border ${
            row.status === 'PAID'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {row.status || 'UNPAID'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-20">
      
      {/* Option 6 Sattva-Digital Sandalwood Vastu Banner */}
      <VastuModuleBanner
        badgeText="Statutory Tuition & Fee Accounts"
        badgeIcon={<IndianRupee className="w-3.5 h-3.5 text-[#D97706]" />}
        institutionText={`Campus: ${activeInst} • Student Fees & Collections Hub`}
        title="Student Fees, Collections & Ledger Hub"
        titleIcon={<IndianRupee className="w-7 h-7 text-[#D97706]" />}
        description="Unified tuition lifecycle uniting Counter POS Collections, Fee Slabs & Sibling Concession Policies, Family Combined UPI Cart, and Statutory Audit Ledgers."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInvoices}
              isLoading={isLoadingInvoices}
              className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-[#FAF7F2] text-xs font-bold shadow-2xs"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-stone-500" />}
            >
              Sync Live DB
            </Button>
            <Button
              variant="saffron"
              size="sm"
              onClick={() => handleTabChange('pos')}
              className="text-xs font-black shadow-xs bg-[#D97706] hover:bg-[#B45309] text-white"
              leftIcon={<Receipt className="w-3.5 h-3.5" />}
            >
              Counter POS Quick-Collect
            </Button>
          </>
        }
      />

      {/* 4 CONSOLIDATED NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('pos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'pos'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <Receipt className="w-4 h-4 text-[#D97706]" />
          <span>1. Counter POS &amp; Collections</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
            Live Counter
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('slabs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'slabs'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#D97706]" />
          <span>2. Fee Slabs, Heads &amp; Concessions</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-bold">
            Policy &amp; Sibling
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('family-cart')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'family-cart'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <Users className="w-4 h-4 text-[#D97706]" />
          <span>3. Sibling Family UPI Cart</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold">
            Multi-Child UPI
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('ledgers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'ledgers'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#D97706]" />
          <span>4. Executive Ledgers &amp; Defaulter Radar</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-bold">
            Audit GL
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COUNTER POS & DAILY COLLECTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'pos' && (
        <div className="space-y-6">
          <FeeCollectionsPOSDesk embedded={true} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FEE SLABS, HEADS & CONCESSIONS */}
      {/* ========================================================================= */}
      {activeTab === 'slabs' && (
        <div className="space-y-6">
          <FeeMasterStructureDesk embedded={true} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SIBLING FAMILY UPI CART */}
      {/* ========================================================================= */}
      {activeTab === 'family-cart' && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#E8DFC8] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-black text-[10px] uppercase rounded-md">
                Parent Gateway Desk
              </span>
              <h3 className="text-base font-black text-slate-900">
                Sibling Combined Fee Cart &amp; Instant UPI QR
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Integrated with the Family 360 Household Master: Parents can pay fees for multiple enrolled siblings in a single checkout session with automated 20% sibling discount deduction.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/fees/pay"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                Open Standalone Parent Gateway ↗
              </a>
            </div>
          </div>

          <MultiChildFeePaymentDesk embedded={true} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EXECUTIVE LEDGERS & DEFAULTER RADAR */}
      {/* ========================================================================= */}
      {activeTab === 'ledgers' && (
        <div className="space-y-6">
          
          {/* Telematics Counters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Billed Demands</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block font-mono">{formatCurrency(totalBilled)}</span>
              <span className="text-[11px] text-slate-500 font-semibold">{invoices.length} Registered Invoices</span>
            </div>

            <div className="p-5 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Collections Realized</span>
              <span className="text-3xl font-black text-emerald-700 mt-1 block font-mono">{formatCurrency(totalCollected)}</span>
              <span className="text-[11px] text-emerald-800 font-bold">Bank &amp; Cash Counter Realized</span>
            </div>

            <div className="p-5 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Outstanding Defaulter Receivables</span>
              <span className="text-3xl font-black text-rose-700 mt-1 block font-mono">{formatCurrency(totalOutstanding)}</span>
              <span className="text-[11px] text-rose-800 font-bold">Aging Dues Recovery Radar</span>
            </div>
          </div>

          {/* Invoices Ledger Table */}
          <div className="bg-white rounded-3xl border border-[#E8DFC8] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E8DFC8] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Fee Invoice Demands &amp; Receipts Ledger ({activeInst})
                </h3>
                <p className="text-xs text-slate-500">
                  Live database records from <code className="font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">public.student_invoices</code>.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchInvoices}
                isLoading={isLoadingInvoices}
                className="border-[#E8DFC8] text-xs font-bold"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh
              </Button>
            </div>

            <DataTable
              data={invoices}
              columns={columns}
              emptyTitle="No Fee Invoices Found"
              emptyDescription="No fee invoices recorded in this institutional campus."
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentFeesHubPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-slate-500 font-bold text-xs flex flex-col items-center justify-center space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
        <span>Loading Student Fees, Collections &amp; Ledger Hub...</span>
      </div>
    }>
      <StudentFeesHubContent />
    </Suspense>
  );
}
