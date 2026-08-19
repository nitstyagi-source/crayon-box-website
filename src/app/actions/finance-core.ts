"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function getInvoices(campusId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('student_invoices')
      .select('*')
      .eq('campus_id', campusId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPendingFees(campusId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('student_invoices')
      .select('total_amount, amount_paid')
      .eq('campus_id', campusId)
      .in('status', ['Unpaid', 'Partial', 'Overdue']);

    if (error) throw error;
    
    let totalPending = 0;
    data?.forEach(inv => {
      totalPending += (inv.total_amount - inv.amount_paid);
    });

    return { success: true, totalPending };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recordManualPayment(campusId: string, invoiceId: string, amount: number, mode: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    // 1. Fetch current invoice
    const { data: invoice, error: fetchErr } = await supabase
      .from('student_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
      
    if (fetchErr) throw fetchErr;

    const newPaid = invoice.amount_paid + amount;
    let newStatus = invoice.status;
    
    if (newPaid >= invoice.total_amount) {
      newStatus = 'Paid';
    } else if (newPaid > 0) {
      newStatus = 'Partial';
    }

    // 2. Update Invoice
    const { error: updateErr } = await supabase
      .from('student_invoices')
      .update({ amount_paid: newPaid, status: newStatus })
      .eq('id', invoiceId);

    if (updateErr) throw updateErr;
    
    revalidatePath('/admin/finance/collections');
    revalidatePath('/admin/finance/invoices');
    return { success: true, message: 'Payment recorded successfully.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
