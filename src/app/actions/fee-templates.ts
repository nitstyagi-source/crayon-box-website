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

export async function getFeeTemplates(campusId: string) {
  try {
    const supabase = getSupabaseAdmin();
    // We want templates and their associated items
    const { data: templates, error: templatesError } = await supabase
      .from('fee_templates')
      .select('*')
      .eq('campus_id', campusId)
      .order('created_at', { ascending: false });

    if (templatesError) throw templatesError;

    if (!templates || templates.length === 0) return { success: true, data: [] };

    const { data: items, error: itemsError } = await supabase
      .from('fee_template_items')
      .select('*, fee_heads(name)')
      .in('template_id', templates.map(t => t.id));

    if (itemsError) throw itemsError;

    // Map items to templates
    const mappedTemplates = templates.map(t => ({
      ...t,
      items: items.filter(i => i.template_id === t.id)
    }));

    return { success: true, data: mappedTemplates };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createFeeTemplate(campusId: string, name: string, academic_year: string, items: any[]) {
  try {
    const supabase = getSupabaseAdmin();
    
    // 1. Insert Template
    const { data: template, error: templateError } = await supabase
      .from('fee_templates')
      .insert([{ campus_id: campusId, name, academic_year }])
      .select()
      .single();

    if (templateError) throw templateError;

    // 2. Insert Items (including discount and auto_late_fee_daily_rate if requested by the user, but for now template items just map heads to amounts)
    if (items.length > 0) {
      const templateItems = items.map(item => ({
        template_id: template.id,
        fee_head_id: item.fee_head_id,
        amount: item.amount,
        frequency: item.frequency
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
    const { error } = await supabase
      .from('fee_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    revalidatePath('/admin/finance/templates');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
