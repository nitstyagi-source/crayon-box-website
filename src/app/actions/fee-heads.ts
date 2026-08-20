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

export async function getFeeHeads(campusId: string) {
  try {
    if (!campusId) return { success: true, data: [] };
    const supabase = getSupabaseAdmin();
    const resolvedId = await resolveCampusId(supabase, campusId);
    const { data, error } = await supabase
      .from('fee_heads')
      .select('*')
      .eq('campus_id', resolvedId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function createFeeHead(campusId: string, name: string, is_mandatory: boolean, is_refundable: boolean) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedId = await resolveCampusId(supabase, campusId);
    const { data, error } = await supabase
      .from('fee_heads')
      .insert([{ campus_id: resolvedId, name, is_mandatory, is_refundable }])
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
    const resolvedId = await resolveCampusId(supabase, campusId);

    await supabase.from('student_invoice_items').delete().not('id', 'is', null);
    await supabase.from('student_invoices').delete().eq('campus_id', resolvedId);
    await supabase.from('fee_template_items').delete().not('id', 'is', null);
    await supabase.from('fee_templates').delete().eq('campus_id', resolvedId);
    await supabase.from('fee_heads').delete().eq('campus_id', resolvedId);

    revalidatePath('/admin/finance');
    return { success: true, message: "Finance data reset successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
