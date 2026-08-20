"use server";

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

/**
 * Returns the primary campus ID from the database.
 * This replaces the mock CampusProvider system.
 */
export async function getPrimaryCampusId(): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('campuses')
      .select('id')
      .limit(1)
      .single();
    return data?.id || null;
  } catch {
    return null;
  }
}

export async function getCampuses() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('campuses')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}
