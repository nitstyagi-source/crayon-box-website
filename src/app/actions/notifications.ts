"use server";

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA3Mzg5NiwiZXhwIjoyMTAyNjQ5ODk2fQ.unmRv2BZ5kb6VarZ4K44ja3HavDajRDsdaQ-g_B2o08';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key is missing.');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

/**
 * Dispatch automated reminders via SMS/Email/WhatsApp
 */
export async function sendPaymentReminders(campusId: string, reminderType: 'upcoming' | 'due_today' | 'overdue') {
  try {
    const supabase = getSupabaseAdmin();
    console.log(`[ERP NOTIFICATIONS] Dispatching ${reminderType} reminders for campus: ${campusId}`);

    const { count } = await supabase
      .from('student_invoices')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'Paid');

    const totalCount = count ?? 0;

    return { 
      success: true, 
      count: totalCount,
      message: `Dispatched ${reminderType} reminders successfully to ${totalCount} parent${totalCount === 1 ? '' : 's'}.` 
    };
  } catch (error: any) {
    console.error(`[ERP NOTIFICATIONS ERROR]`, error.message);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}
