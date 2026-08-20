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

export async function getFeeTemplates(campusId: string) {
  try {
    if (!campusId) return { success: true, data: [] };
    const supabase = getSupabaseAdmin();
    const resolvedId = await resolveCampusId(supabase, campusId);

    const { data: templates, error: templatesError } = await supabase
      .from('fee_templates')
      .select('*')
      .eq('campus_id', resolvedId)
      .order('created_at', { ascending: false });

    if (templatesError) throw templatesError;
    if (!templates || templates.length === 0) return { success: true, data: [] };

    const { data: items, error: itemsError } = await supabase
      .from('fee_template_items')
      .select('*, fee_heads(name)')
      .in('template_id', templates.map(t => t.id));

    if (itemsError) throw itemsError;

    const mappedTemplates = templates.map(t => ({
      ...t,
      items: (items || []).filter(i => i.template_id === t.id)
    }));

    return { success: true, data: mappedTemplates };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function createFeeTemplate(campusId: string, name: string, academic_year: string, items: any[]) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedId = await resolveCampusId(supabase, campusId);
    
    const { data: template, error: templateError } = await supabase
      .from('fee_templates')
      .insert([{ campus_id: resolvedId, name, academic_year }])
      .select()
      .single();

    if (templateError) throw templateError;

    if (items.length > 0) {
      const templateItems = items.map(item => ({
        template_id: template.id,
        fee_head_id: item.fee_head_id,
        amount: item.amount,
        frequency: item.frequency || 'Annual'
      }));

      const { error: itemsError } = await supabase
        .from('fee_template_items')
        .insert(templateItems);

      if (itemsError) throw itemsError;
    }

    revalidatePath('/admin/finance/templates');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteFeeTemplate(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('fee_template_items').delete().eq('template_id', id);
    const { error } = await supabase.from('fee_templates').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/finance/templates');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
