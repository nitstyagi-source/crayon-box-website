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

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function resolveCampusId(supabase: any, campusId: string): Promise<string> {
  if (campusId && isValidUUID(campusId)) return campusId;
  const { data } = await supabase.from('campuses').select('id').limit(1).single();
  if (!data?.id) throw new Error("No campuses found in database.");
  return data.id;
}

export async function getInvoices(campusId: string) {
  try {
    if (!campusId) return { success: true, data: [] };
    const supabase = getSupabaseAdmin();
    const resolvedId = await resolveCampusId(supabase, campusId);
    
    // 1. Fetch invoices
    const { data: invoices, error } = await supabase
      .from('student_invoices')
      .select('*')
      .eq('campus_id', resolvedId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!invoices || invoices.length === 0) return { success: true, data: [] };

    // 2. Fetch associated student data gracefully without relying on FK relations
    const studentIds = Array.from(new Set(invoices.map((i: any) => i.student_id).filter(Boolean)));
    let studentMap: Record<string, any> = {};

    if (studentIds.length > 0) {
      const { data: students } = await supabase
        .from('students')
        .select('id, first_name, last_name, admission_no')
        .in('id', studentIds);

      if (students) {
        studentMap = students.reduce((acc: any, s: any) => {
          acc[s.id] = s;
          return acc;
        }, {});
      }
    }

    const enrichedInvoices = invoices.map((inv: any) => ({
      ...inv,
      students: studentMap[inv.student_id] || {
        first_name: "Student",
        last_name: "Record",
        admission_no: "ADM-N/A"
      }
    }));

    return { success: true, data: enrichedInvoices };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function getPendingFees(campusId: string) {
  try {
    if (!campusId) return { success: true, totalPending: 0 };
    const supabase = getSupabaseAdmin();
    const resolvedId = await resolveCampusId(supabase, campusId);
    const { data, error } = await supabase
      .from('student_invoices')
      .select('total_amount, amount_paid')
      .eq('campus_id', resolvedId)
      .in('status', ['Unpaid', 'Partial', 'Overdue']);

    if (error) throw error;
    
    let totalPending = 0;
    data?.forEach(inv => {
      totalPending += (Number(inv.total_amount || 0) - Number(inv.amount_paid || 0));
    });

    return { success: true, totalPending };
  } catch (error: any) {
    return { success: false, error: error.message, totalPending: 0 };
  }
}

export async function recordManualPayment(campusId: string, invoiceId: string, amount: number, mode: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data: invoice, error: fetchErr } = await supabase
      .from('student_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
      
    if (fetchErr) throw fetchErr;

    const newPaid = Number(invoice.amount_paid || 0) + Number(amount);
    let newStatus = invoice.status;
    
    if (newPaid >= Number(invoice.total_amount)) {
      newStatus = 'Paid';
    } else if (newPaid > 0) {
      newStatus = 'Partial';
    }

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
