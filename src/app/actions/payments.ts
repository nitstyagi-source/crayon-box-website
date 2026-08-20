"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

/**
 * Looks up student by Admission Number and Date of Birth,
 * and fetches any unpaid or partially paid fee invoices.
 */
export async function lookupStudentDues(admissionNo: string, dob?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const cleanAdm = admissionNo.trim().toUpperCase();

    // 1. Query student
    let studentQuery = supabase
      .from('students')
      .select('id, first_name, last_name, admission_no, dob, campus_id')
      .ilike('admission_no', cleanAdm);

    const { data: students, error: sErr } = await studentQuery;
    if (sErr) throw sErr;
    if (!students || students.length === 0) {
      return { success: false, error: "No student found with admission number: " + cleanAdm };
    }

    const student = students[0];

    // Optional DOB validation if provided
    if (dob && student.dob && student.dob !== dob) {
      return { success: false, error: "Date of Birth does not match student record." };
    }

    // 2. Fetch active/unpaid invoices
    const { data: invoices, error: invErr } = await supabase
      .from('student_invoices')
      .select('*')
      .eq('student_id', student.id)
      .in('status', ['Unpaid', 'Partial', 'Overdue'])
      .order('created_at', { ascending: false });

    if (invErr) throw invErr;

    // 3. Fetch invoice items breakdown if an invoice exists
    let invoiceItems: any[] = [];
    if (invoices && invoices.length > 0) {
      const activeInvoice = invoices[0];
      const { data: items } = await supabase
        .from('student_invoice_items')
        .select('*, fee_heads(name)')
        .eq('invoice_id', activeInvoice.id);
      invoiceItems = items || [];
    }

    // 4. Fetch academic info for class name
    const { data: academic } = await supabase
      .from('student_academic_history')
      .select('class_name, section_name')
      .eq('student_id', student.id)
      .limit(1)
      .maybeSingle();

    return {
      success: true,
      data: {
        student: {
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          admissionNo: student.admission_no,
          dob: student.dob,
          className: academic ? `${academic.class_name} ${academic.section_name || ''}`.trim() : 'General Grade'
        },
        hasPendingDues: invoices && invoices.length > 0,
        invoice: invoices && invoices.length > 0 ? invoices[0] : null,
        items: invoiceItems
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Processes online fee payment for an invoice (Razorpay / Gateway success).
 * Updates invoice status to 'Paid' and records receipt.
 */
export async function processInvoiceOnlinePayment(invoiceId: string, paymentMethod: string = 'Razorpay / Online', transactionRef?: string) {
  try {
    const supabase = getSupabaseAdmin();

    const { data: invoice, error: fetchErr } = await supabase
      .from('student_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchErr || !invoice) throw new Error("Invoice not found");

    const totalAmount = Number(invoice.total_amount || 0);
    const txnId = transactionRef || `TXN-ONL-${Date.now()}`;

    // 1. Update invoice to Paid
    const { error: updateErr } = await supabase
      .from('student_invoices')
      .update({
        amount_paid: totalAmount,
        status: 'Paid',
        total_late_fee: invoice.total_late_fee || 0
      })
      .eq('id', invoiceId);

    if (updateErr) throw updateErr;

    // 2. Insert into student fee ledgers
    await supabase
      .from('student_fee_ledgers')
      .insert([{
        campus_id: invoice.campus_id,
        student_id: invoice.student_id,
        transaction_type: 'Payment',
        amount: -totalAmount,
        running_balance: 0,
        reference_id: invoice.id,
        remarks: `Online Payment via ${paymentMethod} (Ref: ${txnId})`
      }]);

    revalidatePath('/admin/finance/invoices');
    revalidatePath('/admin/finance/collections');
    revalidatePath('/pay-fees');
    revalidatePath('/parent/fees');

    return {
      success: true,
      transactionId: txnId,
      receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      amountPaid: totalAmount,
      invoiceNumber: invoice.invoice_number,
      paidAt: new Date().toISOString()
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
