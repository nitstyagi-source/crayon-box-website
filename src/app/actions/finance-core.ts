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
    
    const { data: invoices, error } = await supabase
      .from('student_invoices')
      .select('*')
      .eq('campus_id', resolvedId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!invoices || invoices.length === 0) return { success: true, data: [] };

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

    // Record ledger entry
    await supabase
      .from('student_fee_ledgers')
      .insert([{
        campus_id: invoice.campus_id,
        student_id: invoice.student_id,
        transaction_type: 'Payment',
        amount: -amount,
        running_balance: Math.max(0, Number(invoice.total_amount) - newPaid),
        reference_id: invoice.id,
        remarks: `Manual ${mode} Payment Collection`
      }]);
    
    revalidatePath('/admin/finance/collections');
    revalidatePath('/admin/finance/invoices');
    revalidatePath('/admin/finance/receipts');
    return { success: true, message: 'Payment recorded successfully.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getReceipts(campusId: string) {
  try {
    if (!campusId) return { success: true, data: [] };
    const supabase = getSupabaseAdmin();
    const resolvedId = await resolveCampusId(supabase, campusId);

    // Fetch invoices with paid amount > 0
    const { data: invoices, error } = await supabase
      .from('student_invoices')
      .select('*')
      .eq('campus_id', resolvedId)
      .gt('amount_paid', 0)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!invoices || invoices.length === 0) return { success: true, data: [] };

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

    const receipts = invoices.map((inv: any) => ({
      id: inv.id,
      receiptNumber: `REC-${inv.invoice_number.replace('INV-', '')}`,
      invoiceNumber: inv.invoice_number,
      billingPeriod: inv.billing_period,
      amountPaid: Number(inv.amount_paid || 0),
      totalAmount: Number(inv.total_amount || 0),
      status: inv.status,
      paidDate: inv.created_at,
      student: studentMap[inv.student_id] || { first_name: "Student", last_name: "", admission_no: "ADM" }
    }));

    return { success: true, data: receipts };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function getDefaultersReport(campusId: string) {
  try {
    if (!campusId) return { success: true, data: [] };
    const supabase = getSupabaseAdmin();
    const resolvedId = await resolveCampusId(supabase, campusId);

    const { data: invoices, error } = await supabase
      .from('student_invoices')
      .select('*')
      .eq('campus_id', resolvedId)
      .in('status', ['Unpaid', 'Partial', 'Overdue'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!invoices || invoices.length === 0) return { success: true, data: [] };

    const studentIds = Array.from(new Set(invoices.map((i: any) => i.student_id).filter(Boolean)));
    let studentMap: Record<string, any> = {};
    let academicMap: Record<string, any> = {};
    let parentMap: Record<string, any> = {};

    if (studentIds.length > 0) {
      const [
        { data: students },
        { data: academics },
        { data: parents }
      ] = await Promise.all([
        supabase.from('students').select('id, first_name, last_name, admission_no').in('id', studentIds),
        supabase.from('student_academic_history').select('student_id, class_name, section_name').in('student_id', studentIds),
        supabase.from('student_parents').select('student_id, name, mobile').in('student_id', studentIds)
      ]);

      if (students) studentMap = students.reduce((acc: any, s: any) => { acc[s.id] = s; return acc; }, {});
      if (academics) academicMap = academics.reduce((acc: any, a: any) => { acc[a.student_id] = a; return acc; }, {});
      if (parents) parentMap = parents.reduce((acc: any, p: any) => { acc[p.student_id] = p; return acc; }, {});
    }

    const defaulters = invoices.map((inv: any) => {
      const balance = Number(inv.total_amount || 0) - Number(inv.amount_paid || 0);
      const student = studentMap[inv.student_id] || {};
      const academic = academicMap[inv.student_id] || {};
      const parent = parentMap[inv.student_id] || {};

      return {
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        studentName: `${student.first_name || 'Student'} ${student.last_name || ''}`.trim(),
        admissionNo: student.admission_no || 'N/A',
        className: academic.class_name ? `${academic.class_name} ${academic.section_name || ''}`.trim() : 'General',
        parentName: parent.name || 'Guardian',
        parentMobile: parent.mobile || 'N/A',
        billingPeriod: inv.billing_period,
        totalAmount: Number(inv.total_amount || 0),
        amountPaid: Number(inv.amount_paid || 0),
        balanceDue: balance,
        status: inv.status
      };
    });

    return { success: true, data: defaulters };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}
