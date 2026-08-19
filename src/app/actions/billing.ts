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

/**
 * Generate invoices for multiple students based on a Fee Template.
 * Now supports per-head due dates, discounts, and auto-late fees.
 */
export async function generateInvoiceWizard(
  campusId: string, 
  studentIds: string[], 
  templateId: string,
  billingPeriod: string,
  dueDate: string,
  discountPerHead: number, // Simplified: apply a fixed discount amount to every head for now
  lateFeePerDay: number // Simplified: daily late fee applied to every head after due date
) {
  try {
    const supabase = getSupabaseAdmin();
    
    // 1. Fetch Template Items
    const { data: items, error: itemsError } = await supabase
      .from('fee_template_items')
      .select('*')
      .eq('template_id', templateId);
      
    if (itemsError || !items) throw new Error("Failed to fetch template items.");

    // 2. Loop through each student and create an invoice
    for (const studentId of studentIds) {
      
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`;
      
      let totalAmount = 0;
      let totalDiscount = 0;
      
      const invoiceItems = items.map(item => {
        totalAmount += item.amount;
        totalDiscount += discountPerHead; // Example simplified logic
        return {
          fee_head_id: item.fee_head_id,
          base_amount: item.amount,
          discount_amount: discountPerHead,
          due_date: dueDate,
          auto_late_fee_daily_rate: lateFeePerDay
        };
      });

      // Insert Invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('student_invoices')
        .insert([{
          campus_id: campusId,
          student_id: studentId,
          invoice_number: invoiceNumber,
          billing_period: billingPeriod,
          total_amount: totalAmount,
          total_discount: totalDiscount
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
    return { success: true, message: `Invoices generated successfully for ${studentIds.length} student(s).` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
