"use server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function sendOtp(phone: string, role: 'parent' | 'staff') {
  // In a real application, this would:
  // 1. Query the 'parents' or 'staff' table in Supabase.
  // 2. Throw an error if the phone number is not enrolled.
  // 3. Call the Supabase Auth API to send an SMS OTP.
  
  // Simulated Network Delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  console.log(`[AUTH SERVER ACTION] Simulating OTP dispatch to ${phone} for role: ${role}`);

  // We assume success for the UI prototype.
  // In production: return { success: false, error: 'Phone number not found.' }
  return { success: true };
}

export async function verifyOtp(phone: string, otp: string, role: 'parent' | 'staff') {
  // Simulated Network Delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log(`[AUTH SERVER ACTION] Verifying OTP ${otp} for ${phone}`);

  // Hardcoded mock check: Any 6-digit OTP works except '000000'
  if (otp === '000000') {
    return { success: false, error: 'Invalid verification code.' };
  }

  // Determine redirection path based on role
  // Parents go to Parent Portal, Staff goes to Admin Dashboard
  const redirectPath = role === 'parent' ? '/family/dashboard' : '/admin/dashboard';

  return { success: true, redirectPath };
}

// Initialize a Supabase Admin client for secure server-side operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key is missing. Check your .env.local file.');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Super Admin Action to invite a new staff member or parent.
 * This utilizes the Supabase Admin API to create the user account and dispatch an invite email.
 * The email will be sent via the custom SMTP configuration (Gmail) set in the Supabase Dashboard.
 */
export async function inviteAdminUser(email: string, role: 'staff' | 'parent', metadata: Record<string, any> = {}) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        role: role,
        ...metadata
      }
    });

    if (error) {
      console.error(`[AUTH SERVER ACTION] Failed to invite ${email}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[AUTH SERVER ACTION] Successfully sent invite to ${email} (Role: ${role}) via Supabase Auth Admin`);
    return { success: true, data };
  } catch (err: any) {
    console.error(`[AUTH SERVER ACTION] Error invoking Admin API:`, err.message);
    return { success: false, error: err.message };
  }
}
