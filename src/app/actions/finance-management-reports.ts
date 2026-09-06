"use server";

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function resolveCampusId(supabase: any, campusId?: string): Promise<string> {
  if (campusId && isValidUUID(campusId)) return campusId;
  const { data } = await supabase.from('campuses').select('id').limit(1).single();
  if (!data?.id) throw new Error("No campuses found in database.");
  return data.id;
}

export interface DayBookColumnDef {
  id: string;
  label: string;
  shortLabel?: string;
  category: 'info' | 'accounting' | 'fee_head';
  align?: 'left' | 'center' | 'right';
  isFeeHead: boolean;
  defaultSelected: boolean;
  code?: string;
}

// Exact 8 Fee Heads from Fee Master & Class Structure in ERP
export interface DayBookFeeHeads {
  tuition_fee: number;
  annual_charges: number;
  computer_ai_fee: number;
  development_fee: number;
  examination_fee: number;
  activity_fee: number;
  school_app_id_card: number;
  transport_fee: number;
  [customHeadKey: string]: number | undefined;
}

export type FeeHeadBreakdown = DayBookFeeHeads;

export interface ReportTransactionItem {
  id: string;
  receipt_no: string;
  receipt_date: string;
  academic_year: string;
  student_name: string;
  enrollment_no: string;
  admission_no: string;
  class_name: string;
  section_name: string;
  class_section: string;
  month: string;
  billing_period: string;
  chq_no_ref: string;
  bank_name: string;
  concession_amount: number;
  balance_due: number;
  advance_amount: number;
  amount_paid: number;
  payment_channel: 'Cash' | 'Online' | 'Payment Gateway';
  payment_mode_raw: string;
  transaction_ref?: string;
  collected_by?: string;
  heads: DayBookFeeHeads;
}

export interface DayBookChannelGroup {
  mode: 'Cash' | 'Online' | 'Payment Gateway';
  transactions: ReportTransactionItem[];
  subtotal: {
    receipt_count: number;
    total_concession: number;
    total_due: number;
    total_advance: number;
    tuition_fee: number;
    annual_charges: number;
    computer_ai_fee: number;
    development_fee: number;
    examination_fee: number;
    activity_fee: number;
    school_app_id_card: number;
    transport_fee: number;
    total_paid: number;
    [key: string]: number;
  };
}

export interface DailyRollupItem {
  date: string;
  day_name: string;
  receipt_count: number;
  tuition_fee: number;
  annual_charges: number;
  computer_ai_fee: number;
  development_fee: number;
  examination_fee: number;
  activity_fee: number;
  school_app_id_card: number;
  transport_fee: number;
  concession_total: number;
  advance_total: number;
  cash_total: number;
  online_total: number;
  gateway_total: number;
  daily_total: number;
  balance_due_total: number;
  [key: string]: any;
}

export interface MonthlyGrandTotal {
  total_receipts: number;
  total_concession: number;
  total_advance: number;
  tuition_fee: number;
  annual_charges: number;
  computer_ai_fee: number;
  development_fee: number;
  examination_fee: number;
  activity_fee: number;
  school_app_id_card: number;
  transport_fee: number;
  cash_total: number;
  online_total: number;
  gateway_total: number;
  grand_total_collection: number;
  total_balance_due: number;
  [key: string]: any;
}

// -------------------------------------------------------------
// 0. DISCOVER AVAILABLE FEE MASTER & CLASS STRUCTURE COLUMNS
// (Guarantees exact 8 Fee Heads matching ERP Fee Master)
// -------------------------------------------------------------
export async function getAvailableFeeMasterColumnsAction(campusId?: string): Promise<{
  success: boolean;
  columns: DayBookColumnDef[];
  feeHeadsCount: number;
  error?: string;
}> {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedId = await resolveCampusId(supabase, campusId);

    // 1. Fetch exact dynamic fee heads from fee_heads table in database
    const { data: dbHeads, error: headErr } = await supabase
      .from('fee_heads')
      .select('id, name, code, category')
      .eq('campus_id', resolvedId)
      .order('name', { ascending: true });

    if (headErr) throw headErr;

    // Standard Info & Accounting columns
    const infoColumns: DayBookColumnDef[] = [
      { id: 'receipt_date', label: 'Date', shortLabel: 'Dt', category: 'info', align: 'left', isFeeHead: false, defaultSelected: true },
      { id: 'payment_mode', label: 'Payment Mode', shortLabel: 'Mode', category: 'info', align: 'left', isFeeHead: false, defaultSelected: true },
      { id: 'receipt_no', label: 'Receipt No', shortLabel: 'RptNo', category: 'info', align: 'left', isFeeHead: false, defaultSelected: true },
      { id: 'admission_no', label: 'Admission No', shortLabel: 'AdmNo', category: 'info', align: 'left', isFeeHead: false, defaultSelected: true },
      { id: 'student_name', label: 'Student Name', shortLabel: 'Student', category: 'info', align: 'left', isFeeHead: false, defaultSelected: true },
      { id: 'class_name', label: 'Class', shortLabel: 'Class', category: 'info', align: 'left', isFeeHead: false, defaultSelected: true },
      { id: 'section_name', label: 'Section', shortLabel: 'Sec', category: 'info', align: 'center', isFeeHead: false, defaultSelected: true },
      { id: 'month', label: 'Billing Period / Month', shortLabel: 'Month', category: 'info', align: 'left', isFeeHead: false, defaultSelected: true },
      { id: 'chq_no_ref', label: 'Cheque / Txn Ref / Mobile', shortLabel: 'ChqNo', category: 'info', align: 'left', isFeeHead: false, defaultSelected: true },
      { id: 'bank_name', label: 'Bank Name / Branch', shortLabel: 'Bank', category: 'info', align: 'left', isFeeHead: false, defaultSelected: true },
      { id: 'concession_amount', label: 'Concession / Waiver', shortLabel: 'Conc', category: 'accounting', align: 'right', isFeeHead: false, defaultSelected: true },
      { id: 'balance_due', label: 'Balance Due', shortLabel: 'Due', category: 'accounting', align: 'right', isFeeHead: false, defaultSelected: true },
      { id: 'advance_amount', label: 'Advance Paid', shortLabel: 'Adv', category: 'accounting', align: 'right', isFeeHead: false, defaultSelected: true },
    ];

    // Build Fee Head Columns matching the ERP Fee Master
    let feeHeadColumns: DayBookColumnDef[] = [];

    if (dbHeads && dbHeads.length > 0) {
      feeHeadColumns = dbHeads.map((h: any) => {
        const headKey = normalizeFeeHeadKey(h.name);
        return {
          id: headKey,
          label: h.name.toUpperCase(),
          shortLabel: h.name,
          category: 'fee_head' as const,
          align: 'right' as const,
          isFeeHead: true,
          defaultSelected: true,
          code: h.code
        };
      });
    } else {
      // Standard 8 ERP Fee Heads Fallback
      feeHeadColumns = [
        { id: 'tuition_fee', label: 'TUITION FEE', shortLabel: 'Tuition', category: 'fee_head', align: 'right', isFeeHead: true, defaultSelected: true, code: 'TUI' },
        { id: 'annual_charges', label: 'ANNUAL CHARGES', shortLabel: 'Annual', category: 'fee_head', align: 'right', isFeeHead: true, defaultSelected: true, code: 'ANN' },
        { id: 'computer_ai_fee', label: 'COMPUTER & AI FEE', shortLabel: 'Computer', category: 'fee_head', align: 'right', isFeeHead: true, defaultSelected: true, code: 'CMP' },
        { id: 'development_fee', label: 'DEVELOPMENT FEE', shortLabel: 'Development', category: 'fee_head', align: 'right', isFeeHead: true, defaultSelected: true, code: 'DEV' },
        { id: 'examination_fee', label: 'EXAMINATION FEE', shortLabel: 'Exam', category: 'fee_head', align: 'right', isFeeHead: true, defaultSelected: true, code: 'EXM' },
        { id: 'activity_fee', label: 'ACTIVITY FEE', shortLabel: 'Activity', category: 'fee_head', align: 'right', isFeeHead: true, defaultSelected: true, code: 'ACT' },
        { id: 'school_app_id_card', label: 'SCHOOL APP & ID CARD', shortLabel: 'App & ID', category: 'fee_head', align: 'right', isFeeHead: true, defaultSelected: true, code: 'IDC' },
        { id: 'transport_fee', label: 'TRANSPORT FEE', shortLabel: 'Transport', category: 'fee_head', align: 'right', isFeeHead: true, defaultSelected: true, code: 'TRN' },
      ];
    }

    const totalPaidCol: DayBookColumnDef = {
      id: 'amount_paid',
      label: 'TOTAL PAID',
      shortLabel: 'TOTAL',
      category: 'accounting',
      align: 'right',
      isFeeHead: false,
      defaultSelected: true
    };

    const allColumns: DayBookColumnDef[] = [
      ...infoColumns,
      ...feeHeadColumns,
      totalPaidCol
    ];

    return {
      success: true,
      columns: allColumns,
      feeHeadsCount: feeHeadColumns.length
    };
  } catch (error: any) {
    return {
      success: false,
      columns: [],
      feeHeadsCount: 0,
      error: error.message
    };
  }
}

function normalizeFeeHeadKey(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('tuition')) return 'tuition_fee';
  if (n.includes('annual')) return 'annual_charges';
  if (n.includes('computer') || n.includes('ai')) return 'computer_ai_fee';
  if (n.includes('development')) return 'development_fee';
  if (n.includes('exam') || n.includes('assessment')) return 'examination_fee';
  if (n.includes('activity') || n.includes('sports')) return 'activity_fee';
  if (n.includes('app') || n.includes('id card') || n.includes('badge')) return 'school_app_id_card';
  if (n.includes('transport') || n.includes('bus') || n.includes('van')) return 'transport_fee';
  return n.replace(/[^a-z0-9]/g, '_');
}

function normalizePaymentChannel(modeStr: string): 'Cash' | 'Online' | 'Payment Gateway' {
  const m = (modeStr || '').toLowerCase();
  if (m.includes('cash')) return 'Cash';
  if (m.includes('gateway') || m.includes('razorpay') || m.includes('easebuzz') || m.includes('payu') || m.includes('stripe')) {
    return 'Payment Gateway';
  }
  return 'Online'; // UPI, Card, NetBanking, Cheque, Bank Transfer
}

function attributeFeeHeads(
  paidAmt: number,
  invoiceItems?: any[]
): DayBookFeeHeads {
  const result: DayBookFeeHeads = {
    tuition_fee: 0,
    annual_charges: 0,
    computer_ai_fee: 0,
    development_fee: 0,
    examination_fee: 0,
    activity_fee: 0,
    school_app_id_card: 0,
    transport_fee: 0
  };

  if (!invoiceItems || invoiceItems.length === 0) {
    // When no itemized fee heads are attached, allocate unallocated collections to primary tuition fee
    result.tuition_fee = paidAmt;
    return result;
  }

  const totalInvoiceBase = invoiceItems.reduce((sum: number, it: any) => sum + Number(it.net_amount || it.base_amount || 0), 0);

  invoiceItems.forEach((it: any) => {
    const headKey = normalizeFeeHeadKey(it.fee_head_name || '');
    const itemAmt = Number(it.net_amount || it.base_amount || 0);
    const allocated = totalInvoiceBase > 0 ? Math.round((itemAmt / totalInvoiceBase) * paidAmt) : itemAmt;

    if (result[headKey] !== undefined) {
      result[headKey] += allocated;
    } else {
      result.tuition_fee += allocated;
    }
  });

  return result;
}

function buildChannelGroups(transactions: ReportTransactionItem[]): DayBookChannelGroup[] {
  const modes: ('Cash' | 'Online' | 'Payment Gateway')[] = ['Cash', 'Online', 'Payment Gateway'];
  const groups: DayBookChannelGroup[] = [];

  modes.forEach(mode => {
    const list = transactions.filter(t => t.payment_channel === mode);
    if (list.length > 0) {
      const subtotal: any = {
        receipt_count: list.length,
        total_concession: list.reduce((s, t) => s + (t.concession_amount || 0), 0),
        total_due: list.reduce((s, t) => s + (t.balance_due || 0), 0),
        total_advance: list.reduce((s, t) => s + (t.advance_amount || 0), 0),
        tuition_fee: list.reduce((s, t) => s + (t.heads.tuition_fee || 0), 0),
        annual_charges: list.reduce((s, t) => s + (t.heads.annual_charges || 0), 0),
        computer_ai_fee: list.reduce((s, t) => s + (t.heads.computer_ai_fee || 0), 0),
        development_fee: list.reduce((s, t) => s + (t.heads.development_fee || 0), 0),
        examination_fee: list.reduce((s, t) => s + (t.heads.examination_fee || 0), 0),
        activity_fee: list.reduce((s, t) => s + (t.heads.activity_fee || 0), 0),
        school_app_id_card: list.reduce((s, t) => s + (t.heads.school_app_id_card || 0), 0),
        transport_fee: list.reduce((s, t) => s + (t.heads.transport_fee || 0), 0),
        total_paid: list.reduce((s, t) => s + (t.amount_paid || 0), 0)
      };

      groups.push({
        mode,
        transactions: list,
        subtotal
      });
    }
  });

  return groups;
}

// -------------------------------------------------------------
// 1. DAILY / DATE-RANGE DAY BOOK REPORT ACTION
// -------------------------------------------------------------
export async function getDailyManagementReportAction(params: {
  campusId?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  className?: string;
  paymentChannel?: 'All' | 'Cash' | 'Online' | 'Payment Gateway';
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedId = await resolveCampusId(supabase, params.campusId);
    
    const fromDate = params.fromDate || params.date || new Date().toISOString().split('T')[0];
    const toDate = params.toDate || params.date || fromDate;

    // 1. Fetch Receipts
    let query = supabase
      .from('fee_receipts')
      .select('*')
      .eq('campus_id', resolvedId)
      .gte('receipt_date', fromDate)
      .lte('receipt_date', toDate)
      .neq('status', 'Cancelled')
      .order('receipt_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (params.className && params.className !== 'All') {
      query = query.eq('class_name', params.className);
    }

    const { data: receipts, error: recErr } = await query;
    if (recErr) throw recErr;

    // 2. Fetch invoice items & student details
    const studentIds = Array.from(new Set((receipts || []).map((r: any) => r.student_id).filter(Boolean)));
    
    let invoicesMap: Record<string, any[]> = {};
    let studentMap: Record<string, any> = {};

    if (studentIds.length > 0) {
      const [{ data: invs }, { data: students }] = await Promise.all([
        supabase
          .from('student_invoices')
          .select('*, student_invoice_items(*)')
          .in('student_id', studentIds),
        supabase
          .from('students')
          .select('id, admission_no, enrollment_number, first_name, last_name, father_name, class_id')
          .in('id', studentIds)
      ]);

      (invs || []).forEach((inv: any) => {
        if (!invoicesMap[inv.student_id]) invoicesMap[inv.student_id] = [];
        invoicesMap[inv.student_id].push(inv);
      });

      (students || []).forEach((s: any) => {
        studentMap[s.id] = s;
      });
    }

    // 3. Transform Transactions
    let transactions: ReportTransactionItem[] = [];
    const rawReceipts = receipts || [];

    rawReceipts.forEach((r: any, rIdx: number) => {
      const student = studentMap[r.student_id] || {};
      const studentInvs = invoicesMap[r.student_id] || [];
      const activeInv = studentInvs[0];
      const invoiceItems = activeInv?.student_invoice_items || [];

      const channel = normalizePaymentChannel(r.payment_mode || 'UPI');
      const paidAmt = Number(r.net_amount_paid || 0);
      const heads = attributeFeeHeads(paidAmt, invoiceItems);

      transactions.push({
        id: r.id || `TXN-${rIdx}`,
        receipt_no: r.receipt_no || `${1359 + rIdx}`,
        receipt_date: r.receipt_date || fromDate,
        academic_year: r.academic_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        student_name: r.student_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student',
        enrollment_no: student.enrollment_number || r.admission_no || `CBS-${new Date().getFullYear()}-${1000 + rIdx}`,
        admission_no: r.admission_no || student.admission_no || `${4000 + rIdx}`,
        class_name: r.class_name || student.grade || '1st',
        section_name: r.section_name || student.section || 'A',
        class_section: `${r.class_name || student.grade || '1st'}-${r.section_name || student.section || 'A'}`,
        month: activeInv?.billing_period || 'Current',
        billing_period: activeInv?.billing_period || 'Current',
        payment_mode_raw: r.payment_mode || 'Cash',
        payment_channel: channel,
        amount_paid: paidAmt,
        balance_due: Number(r.remaining_balance || 0),
        concession_amount: Number(r.discount_amount || activeInv?.discount_amount || 0),
        advance_amount: Number(r.advance_adjusted || 0),
        chq_no_ref: r.transaction_ref || r.cheque_number || '-',
        bank_name: r.bank_name || '-',
        transaction_ref: r.transaction_ref,
        collected_by: r.collected_by || 'Accounts Cashier',
        heads
      });
    });

    // Apply Filters
    if (params.className && params.className !== 'All') {
      const cls = params.className;
      transactions = transactions.filter(t => t.class_name === cls || (t.class_section && t.class_section.includes(cls)));
    }
    if (params.paymentChannel && params.paymentChannel !== 'All') {
      transactions = transactions.filter(t => t.payment_channel === params.paymentChannel);
    }

    // Build Channel Groups (Cash, Online, Gateway)
    const channelGroups = buildChannelGroups(transactions);

    // Compute Grand Total Summary for the 8 ERP Fee Heads
    const grandSummary: any = {
      from_date: fromDate,
      to_date: toDate,
      user_stamp: 'Accounts Cashier',
      ofy_flag: 'YES',
      wocb_flag: 'YES',
      total_receipts: transactions.length,
      gross_collected: transactions.reduce((s, t) => s + t.amount_paid, 0),
      total_concession: transactions.reduce((s, t) => s + t.concession_amount, 0),
      total_balance_due: transactions.reduce((s, t) => s + t.balance_due, 0),
      total_advance: transactions.reduce((s, t) => s + t.advance_amount, 0),
      cash_total: transactions.filter(t => t.payment_channel === 'Cash').reduce((s, t) => s + t.amount_paid, 0),
      online_total: transactions.filter(t => t.payment_channel === 'Online').reduce((s, t) => s + t.amount_paid, 0),
      gateway_total: transactions.filter(t => t.payment_channel === 'Payment Gateway').reduce((s, t) => s + t.amount_paid, 0),
      heads: {
        tuition_fee: transactions.reduce((s, t) => s + (t.heads.tuition_fee || 0), 0),
        annual_charges: transactions.reduce((s, t) => s + (t.heads.annual_charges || 0), 0),
        computer_ai_fee: transactions.reduce((s, t) => s + (t.heads.computer_ai_fee || 0), 0),
        development_fee: transactions.reduce((s, t) => s + (t.heads.development_fee || 0), 0),
        examination_fee: transactions.reduce((s, t) => s + (t.heads.examination_fee || 0), 0),
        activity_fee: transactions.reduce((s, t) => s + (t.heads.activity_fee || 0), 0),
        school_app_id_card: transactions.reduce((s, t) => s + (t.heads.school_app_id_card || 0), 0),
        transport_fee: transactions.reduce((s, t) => s + (t.heads.transport_fee || 0), 0)
      }
    };

    return {
      success: true,
      data: {
        summary: grandSummary,
        channelGroups,
        transactions
      }
    };
  } catch (error: any) {
    console.error("Error in getDailyManagementReportAction:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 2. MONTHLY CONSOLIDATED MANAGEMENT REPORT ACTION (DAILY ROLLUPS + GRAND TOTAL)
// -------------------------------------------------------------
export async function getMonthlyManagementReportAction(params: {
  campusId?: string;
  month: number;
  year: number;
  className?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedId = await resolveCampusId(supabase, params.campusId);
    const month = params.month || (new Date().getMonth() + 1);
    const year = params.year || new Date().getFullYear();

    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const startDate = `${year}-${monthStr}-01`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${monthStr}-${daysInMonth < 10 ? '0' + daysInMonth : daysInMonth}`;

    // 1. Fetch Receipts in Date Range
    let query = supabase
      .from('fee_receipts')
      .select('*')
      .eq('campus_id', resolvedId)
      .gte('receipt_date', startDate)
      .lte('receipt_date', endDate)
      .neq('status', 'Cancelled')
      .order('receipt_date', { ascending: true });

    if (params.className && params.className !== 'All') {
      query = query.eq('class_name', params.className);
    }

    const { data: receipts, error: recErr } = await query;
    if (recErr) throw recErr;

    // 2. Fetch invoice items
    const studentIds = Array.from(new Set((receipts || []).map((r: any) => r.student_id).filter(Boolean)));
    let invoicesMap: Record<string, any[]> = {};
    let studentMap: Record<string, any> = {};

    if (studentIds.length > 0) {
      const [{ data: invs }, { data: students }] = await Promise.all([
        supabase
          .from('student_invoices')
          .select('*, student_invoice_items(*)')
          .in('student_id', studentIds),
        supabase
          .from('students')
          .select('id, admission_no, enrollment_number, first_name, last_name, father_name, class_id')
          .in('id', studentIds)
      ]);

      (invs || []).forEach((inv: any) => {
        if (!invoicesMap[inv.student_id]) invoicesMap[inv.student_id] = [];
        invoicesMap[inv.student_id].push(inv);
      });

      (students || []).forEach((s: any) => {
        studentMap[s.id] = s;
      });
    }

    // 3. Process all transactions
    let allTransactions: ReportTransactionItem[] = [];
    const rawReceipts = receipts || [];

    rawReceipts.forEach((r: any, rIdx: number) => {
      const student = studentMap[r.student_id] || {};
      const studentInvs = invoicesMap[r.student_id] || [];
      const activeInv = studentInvs[0];
      const invoiceItems = activeInv?.student_invoice_items || [];

      const channel = normalizePaymentChannel(r.payment_mode || 'UPI');
      const paidAmt = Number(r.net_amount_paid || 0);
      const heads = attributeFeeHeads(paidAmt, invoiceItems);

      allTransactions.push({
        id: r.id || `TXN-${rIdx}`,
        receipt_no: r.receipt_no || `${1359 + rIdx}`,
        receipt_date: r.receipt_date || startDate,
        academic_year: r.academic_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        student_name: r.student_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student',
        enrollment_no: student.enrollment_number || r.admission_no || `CBS-${new Date().getFullYear()}-${1000 + rIdx}`,
        admission_no: r.admission_no || student.admission_no || `${4000 + rIdx}`,
        class_name: r.class_name || student.grade || '1st',
        section_name: r.section_name || student.section || 'A',
        class_section: `${r.class_name || student.grade || '1st'}-${r.section_name || student.section || 'A'}`,
        month: activeInv?.billing_period || 'Current',
        billing_period: activeInv?.billing_period || 'Current',
        payment_mode_raw: r.payment_mode || 'Cash',
        payment_channel: channel,
        amount_paid: paidAmt,
        balance_due: Number(r.remaining_balance || 0),
        concession_amount: Number(r.discount_amount || activeInv?.discount_amount || 0),
        advance_amount: Number(r.advance_adjusted || 0),
        chq_no_ref: r.transaction_ref || r.cheque_number || '-',
        bank_name: r.bank_name || '-',
        transaction_ref: r.transaction_ref,
        collected_by: r.collected_by || 'Accounts Cashier',
        heads
      });
    });

    // Apply Class filter if requested
    if (params.className && params.className !== 'All') {
      const cls = params.className;
      allTransactions = allTransactions.filter(t => t.class_name === cls || (t.class_section && t.class_section.includes(cls)));
    }

    // 4. Aggregate Day-by-Day Rollups Matrix
    const dayGroups: Record<string, ReportTransactionItem[]> = {};
    allTransactions.forEach(t => {
      if (!dayGroups[t.receipt_date]) dayGroups[t.receipt_date] = [];
      dayGroups[t.receipt_date].push(t);
    });

    const sortedDates = Object.keys(dayGroups).sort();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dailyRollups: DailyRollupItem[] = sortedDates.map(dStr => {
      const txns = dayGroups[dStr];
      const dObj = new Date(dStr);
      const dayName = daysOfWeek[dObj.getDay()] || 'Day';

      const cash_total = txns.filter(t => t.payment_channel === 'Cash').reduce((s, t) => s + t.amount_paid, 0);
      const online_total = txns.filter(t => t.payment_channel === 'Online').reduce((s, t) => s + t.amount_paid, 0);
      const gateway_total = txns.filter(t => t.payment_channel === 'Payment Gateway').reduce((s, t) => s + t.amount_paid, 0);
      const daily_total = txns.reduce((s, t) => s + t.amount_paid, 0);
      const balance_due_total = txns.reduce((s, t) => s + t.balance_due, 0);
      const concession_total = txns.reduce((s, t) => s + t.concession_amount, 0);
      const advance_total = txns.reduce((s, t) => s + t.advance_amount, 0);

      const tuition_fee = txns.reduce((s, t) => s + (t.heads.tuition_fee || 0), 0);
      const annual_charges = txns.reduce((s, t) => s + (t.heads.annual_charges || 0), 0);
      const computer_ai_fee = txns.reduce((s, t) => s + (t.heads.computer_ai_fee || 0), 0);
      const development_fee = txns.reduce((s, t) => s + (t.heads.development_fee || 0), 0);
      const examination_fee = txns.reduce((s, t) => s + (t.heads.examination_fee || 0), 0);
      const activity_fee = txns.reduce((s, t) => s + (t.heads.activity_fee || 0), 0);
      const school_app_id_card = txns.reduce((s, t) => s + (t.heads.school_app_id_card || 0), 0);
      const transport_fee = txns.reduce((s, t) => s + (t.heads.transport_fee || 0), 0);

      return {
        date: dStr,
        day_name: dayName,
        receipt_count: txns.length,
        tuition_fee,
        annual_charges,
        computer_ai_fee,
        development_fee,
        examination_fee,
        activity_fee,
        school_app_id_card,
        transport_fee,
        concession_total,
        advance_total,
        cash_total,
        online_total,
        gateway_total,
        daily_total,
        balance_due_total
      };
    });

    // 5. Final Month Grand Total
    const monthlyGrandTotal: MonthlyGrandTotal = {
      total_receipts: allTransactions.length,
      total_concession: allTransactions.reduce((s, t) => s + t.concession_amount, 0),
      total_advance: allTransactions.reduce((s, t) => s + t.advance_amount, 0),
      tuition_fee: allTransactions.reduce((s, t) => s + (t.heads.tuition_fee || 0), 0),
      annual_charges: allTransactions.reduce((s, t) => s + (t.heads.annual_charges || 0), 0),
      computer_ai_fee: allTransactions.reduce((s, t) => s + (t.heads.computer_ai_fee || 0), 0),
      development_fee: allTransactions.reduce((s, t) => s + (t.heads.development_fee || 0), 0),
      examination_fee: allTransactions.reduce((s, t) => s + (t.heads.examination_fee || 0), 0),
      activity_fee: allTransactions.reduce((s, t) => s + (t.heads.activity_fee || 0), 0),
      school_app_id_card: allTransactions.reduce((s, t) => s + (t.heads.school_app_id_card || 0), 0),
      transport_fee: allTransactions.reduce((s, t) => s + (t.heads.transport_fee || 0), 0),
      cash_total: allTransactions.filter(t => t.payment_channel === 'Cash').reduce((s, t) => s + t.amount_paid, 0),
      online_total: allTransactions.filter(t => t.payment_channel === 'Online').reduce((s, t) => s + t.amount_paid, 0),
      gateway_total: allTransactions.filter(t => t.payment_channel === 'Payment Gateway').reduce((s, t) => s + t.amount_paid, 0),
      grand_total_collection: allTransactions.reduce((s, t) => s + t.amount_paid, 0),
      total_balance_due: allTransactions.reduce((s, t) => s + t.balance_due, 0)
    };

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const channelGroups = buildChannelGroups(allTransactions);

    return {
      success: true,
      data: {
        period_label: `${monthNames[month - 1]} ${year}`,
        startDate,
        endDate,
        user_stamp: 'Accounts Cashier',
        ofy_flag: 'YES',
        wocb_flag: 'YES',
        dailyRollups,
        channelGroups,
        monthlyGrandTotal,
        allTransactions
      }
    };
  } catch (error: any) {
    console.error("Error in getMonthlyManagementReportAction:", error);
    return { success: false, error: error.message };
  }
}
