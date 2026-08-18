"use server";

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
  const redirectPath = role === 'parent' ? '/parent/dashboard' : '/admin/dashboard';

  return { success: true, redirectPath };
}
