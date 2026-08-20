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

/**
 * Generate invoices for multiple students based on a Fee Template.
 * Supports per-head due dates and discounts.
 */
export async function generateInvoiceWizard(
  campusId: string, 
  studentIds: string[], 
  templateId: string,
  billingPeriod: string,
  dueDate: string,
  discountPerHead: number,
  lateFeePerDay: number
) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);
    
    // 1. Fetch Template Items
    const { data: items, error: itemsError } = await supabase
      .from('fee_template_items')
      .select('*')
      .eq('template_id', templateId);
      
    if (itemsError || !items || items.length === 0) throw new Error("Failed to fetch template items or template is empty.");

    // 2. Loop through each student and create an invoice
    for (const studentId of studentIds) {
      
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      
      let totalAmount = 0;
      let totalDiscount = 0;
      
      const invoiceItems = items.map(item => {
        totalAmount += Number(item.amount);
        totalDiscount += Number(discountPerHead);
        return {
          fee_head_id: item.fee_head_id,
          base_amount: item.amount,
          discount_amount: discountPerHead,
          due_date: dueDate,
          auto_late_fee_daily_rate: lateFeePerDay
        };
      });

      const finalTotal = Math.max(0, totalAmount - totalDiscount);

      // Insert Invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('student_invoices')
        .insert([{
          campus_id: resolvedCampusId,
          student_id: studentId,
          invoice_number: invoiceNumber,
          billing_period: billingPeriod,
          total_amount: finalTotal,
          total_discount: totalDiscount,
          total_late_fee: 0,
          amount_paid: 0,
          status: 'Unpaid'
        }])
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;

      // Insert Invoice Items
      const invoiceItemsWithId = invoiceItems.map(i => ({ ...i, invoice_id: invoice.id }));
      const { error: insertItemsError } = await supabase
        .from('student_invoice_items')
        .insert(invoiceItemsWithId);

      if (insertItemsError) throw insertItemsError;
    }

    revalidatePath('/admin/finance/invoices');
    return { success: true, message: `Invoices generated for ${studentIds.length} student(s).` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
