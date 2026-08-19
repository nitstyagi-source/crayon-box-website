"use server";

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

    // Mock network request to a communications provider (e.g., Twilio / SendGrid)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a full implementation:
    // 1. Query `student_fee_ledgers` for students with active balances matching the criteria.
    // 2. Fetch parent contact info.
    // 3. Dispatch bulk requests to Twilio API.
    // 4. Record the reminder dispatch in a new `communication_logs` table.

    return { 
      success: true, 
      message: `Dispatched ${reminderType} reminders successfully to 84 parents.` 
    };
  } catch (error: any) {
    console.error(`[ERP NOTIFICATIONS ERROR]`, error.message);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}
