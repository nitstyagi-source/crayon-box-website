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

export async function getFeeHeads(campusId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('fee_heads')
      .select('*')
      .eq('campus_id', campusId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createFeeHead(campusId: string, name: string, is_mandatory: boolean, is_refundable: boolean) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('fee_heads')
      .insert([{ campus_id: campusId, name, is_mandatory, is_refundable }])
      .select()
      .single();

    if (error) throw error;
    
    revalidatePath('/admin/finance/structure');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteFeeHead(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('fee_heads')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    revalidatePath('/admin/finance/structure');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetFinanceData(campusId: string) {
  try {
    const supabase = getSupabaseAdmin();
    // Delete in correct order to respect foreign key constraints
    await supabase.from('audit_logs').delete().eq('campus_id', campusId);
    await supabase.from('refunds').delete().eq('campus_id', campusId);
    await supabase.from('student_fee_ledgers').delete().eq('campus_id', campusId);
    await supabase.from('discounts_and_waivers').delete().eq('campus_id', campusId);
    await supabase.from('fee_late_rules').delete().eq('campus_id', campusId);
    await supabase.from('fee_template_items').delete().not('id', 'is', null);
    await supabase.from('fee_templates').delete().eq('campus_id', campusId);
    await supabase.from('fee_heads').delete().eq('campus_id', campusId);

    revalidatePath('/admin/finance');
    return { success: true, message: "Finance data reset successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
