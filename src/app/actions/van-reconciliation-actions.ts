"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch (_) {}
}

export interface StudentVirtualAccount {
  id: string;
  student_id: string;
  student_name: string;
  admission_no: string;
  grade_section: string;
  parent_name: string;
  parent_phone: string;
  van_account_number: string;
  ifsc_code: string;
  bank_name: string;
  upi_vpa: string;
  outstanding_balance: number;
  last_reconciled_at?: string;
  is_active: boolean;
}

export interface BankWebhookLog {
  id: string;
  provider: string;
  transaction_ref: string;
  van_account_number: string;
  student_name?: string;
  amount_received: number;
  remitter_name: string;
  remitter_account: string;
  status: 'PROCESSED' | 'PENDING' | 'MANUAL_REVIEW';
  created_at: string;
  raw_payload?: any;
}

export async function getVirtualAccountsListAction(params?: { campusId?: string; search?: string }) {
  try {
    const supabase = getSupabaseAdmin();

    // Fetch students with active enrollment
    let studentsQuery = supabase
      .from('students')
      .select(`
        id,
        first_name,
        last_name,
        admission_no,
        enrollment_number,
        current_grade,
        current_section,
        father_name,
        emergency_contact
      `)
      .order('first_name', { ascending: true })
      .limit(100);

    const { data: students, error: sErr } = await studentsQuery;

    if (sErr) {
      console.error("Error querying students for VAN:", sErr);
      return { success: false, error: sErr.message, accounts: [] };
    }

    if (!students || students.length === 0) {
      return { success: true, accounts: [] };
    }

    // Fetch invoices to calculate real outstanding balance per student
    const studentIds = students.map((s) => s.id);
    const { data: invoices } = await supabase
      .from('student_invoices')
      .select('student_id, total_amount, amount_paid, status')
      .in('student_id', studentIds);

    const balanceMap = new Map<string, number>();
    (invoices || []).forEach((inv: any) => {
      if (inv.status !== 'PAID') {
        const remaining = Math.max(0, (Number(inv.total_amount) || 0) - (Number(inv.amount_paid) || 0));
        balanceMap.set(inv.student_id, (balanceMap.get(inv.student_id) || 0) + remaining);
      }
    });

    // Map real students to Virtual Account records
    const accounts: StudentVirtualAccount[] = students.map((s) => {
      const adm = s.admission_no || s.enrollment_number || `CBS${s.id.slice(0, 6).toUpperCase()}`;
      const cleanAdm = adm.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const van = cleanAdm.startsWith('CBS') ? cleanAdm : `CBS${cleanAdm}`;
      const outstandingBalance = balanceMap.get(s.id) || 0;

      return {
        id: s.id,
        student_id: s.id,
        student_name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Student Record',
        admission_no: adm,
        grade_section: `${s.current_grade || 'Class 1'}${s.current_section ? `-${s.current_section}` : ''}`,
        parent_name: s.father_name || 'Primary Guardian',
        parent_phone: s.emergency_contact || '',
        van_account_number: van,
        ifsc_code: 'ICIC0000104',
        bank_name: 'ICICI Bank (e-Collect)',
        upi_vpa: `${van.toLowerCase()}@icici`,
        outstanding_balance: outstandingBalance,
        last_reconciled_at: undefined,
        is_active: true
      };
    });

    if (params?.search) {
      const q = params.search.toLowerCase();
      return {
        success: true,
        accounts: accounts.filter(
          (a) =>
            a.student_name.toLowerCase().includes(q) ||
            a.admission_no.toLowerCase().includes(q) ||
            a.van_account_number.toLowerCase().includes(q)
        )
      };
    }

    return { success: true, accounts };
  } catch (err: any) {
    console.error('getVirtualAccountsListAction error:', err);
    return { success: false, error: err.message, accounts: [] };
  }
}

export async function getBankWebhookAuditLogsAction(limit: number = 20) {
  try {
    const supabase = getSupabaseAdmin();
    const { data: logs, error } = await supabase
      .from('bank_webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching bank webhook logs:", error);
      return { success: false, error: error.message, logs: [] };
    }

    return { success: true, logs: logs || [] };
  } catch (err: any) {
    console.error('getBankWebhookAuditLogsAction error:', err);
    return { success: false, error: err.message, logs: [] };
  }
}

export async function simulateInboundBankTransferAction(payload: {
  van_account_number: string;
  amount: number;
  remitter_name: string;
  remitter_account?: string;
  provider?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const { count: webhookCount } = await supabase
      .from('bank_webhook_logs')
      .select('*', { count: 'exact', head: true });
    const nextSeq = String((webhookCount || 0) + 1).padStart(6, '0');
    const transRef = `CMS${Date.now()}${nextSeq}`;

    const logEntry = {
      provider: payload.provider || 'ICICI_ECOLLECT',
      transaction_ref: transRef,
      van_account_number: payload.van_account_number,
      amount_received: payload.amount,
      remitter_name: payload.remitter_name || 'PARENT NETBANKING IMPS',
      remitter_account: payload.remitter_account || 'N/A',
      status: 'PROCESSED',
      raw_payload: {
        ClientCode: 'CRAYONBOX',
        VirtualAccountNumber: payload.van_account_number,
        UTR: transRef,
        Mode: 'IMPS',
        Amount: payload.amount,
        SenderBank: 'HDFC BANK LTD',
        Timestamp: new Date().toISOString()
      }
    };

    // Attempt to write to database table
    try {
      await supabase.from('bank_webhook_logs').insert([logEntry]);
    } catch (e) {
      console.warn('Direct bank_webhook_logs insert fallback:', e);
    }

    safeRevalidate('/admin/finance');

    return {
      success: true,
      message: `Successfully processed incoming bank transfer of ₹${payload.amount.toLocaleString('en-IN')} via ${payload.provider || 'ICICI e-Collect'}.`,
      transaction_ref: transRef,
      van_account_number: payload.van_account_number,
      receipt_number: `RCP-VAN-${nextSeq}`
    };
  } catch (err: any) {
    console.error('simulateInboundBankTransferAction error:', err);
    return { success: false, error: err.message };
  }
}
