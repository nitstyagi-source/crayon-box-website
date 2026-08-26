import { NextResponse } from 'next/server';
import pg from 'pg';
import { requireServerEnv } from '@/lib/server-env';

const { Pool } = pg;

let globalPool: pg.Pool | null = null;
function getPool() {
  if (!globalPool) {
    globalPool = new Pool({
      connectionString: requireServerEnv('DATABASE_URL'),
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
}

export async function POST(request: Request) {
  let client: any = null;

  try {
    const pool = getPool();
    client = await pool.connect();
    const body = await request.json();
    const { mobileNumber, otp, reqId, deviceInfo = 'Vaani Mobile Super App (iOS/Android)' } = body;

    const rawNumber = (mobileNumber || '').replace(/[^0-9]/g, '');
    const cleanNumber = rawNumber.length === 12 && rawNumber.startsWith('91') 
      ? rawNumber.slice(2) 
      : rawNumber.length === 10 
        ? rawNumber 
        : rawNumber.slice(-10);

    if (!/^\d{10}$/.test(cleanNumber) || !/^\d{4,6}$/.test(otp || '')) {
      return NextResponse.json({ success: false, error: 'Mobile number and OTP are required.' }, { status: 400 });
    }

    // 1. Verify only with MSG91; never accept locally generated test codes.
    const authKey = requireServerEnv('MSG91_AUTH_KEY');
    const formattedPhone = `91${cleanNumber}`;
    const verifyUrl = `https://control.msg91.com/api/v5/otp/verify?otp=${encodeURIComponent(otp)}&mobile=${formattedPhone}`;
    const apiRes = await fetch(verifyUrl, { method: 'POST', headers: { authkey: authKey } });
    const verification = await apiRes.json();
    if (!apiRes.ok || (verification.type !== 'success' && verification.message !== 'OTP verified success')) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP. Please try again.' }, { status: 401 });
    }

    // 2. Fetch User Profile from Database
    let profile: any = null;

    // User Accounts check
    const userRes = await client.query(`
      SELECT id, full_name as "fullName", email, phone_number as "phoneNumber", primary_role as role
      FROM public.user_accounts
      WHERE phone_number LIKE $1
      LIMIT 1;
    `, [`%${cleanNumber}%`]);
    if (userRes.rows.length > 0) profile = userRes.rows[0];

    // Staff check
    if (!profile) {
      const staffRes = await client.query(`
        SELECT id, CONCAT(first_name, ' ', COALESCE(last_name, '')) as "fullName", email, phone as "phoneNumber", 
               COALESCE(role, 'Faculty') as role
        FROM public.staff
        WHERE phone LIKE $1
        LIMIT 1;
      `, [`%${cleanNumber}%`]);
      if (staffRes.rows.length > 0) profile = staffRes.rows[0];
    }

    // Driver check
    if (!profile) {
      const driverRes = await client.query(`
        SELECT id, driver_name as "fullName", driver_phone as "phoneNumber", 'Driver' as role, bus_number as "busNumber"
        FROM public.transport_buses
        WHERE driver_phone LIKE $1
        LIMIT 1;
      `, [`%${cleanNumber}%`]);
      if (driverRes.rows.length > 0) profile = driverRes.rows[0];
    }

    // Parent check
    if (!profile) {
      const parentRes = await client.query(`
        SELECT p.id, CONCAT(p.first_name, ' ', COALESCE(p.last_name, '')) as "fullName", 
               p.phone_number as "phoneNumber", 'Parent' as role
        FROM public.parents p
        WHERE p.phone_number LIKE $1
        LIMIT 1;
      `, [`%${cleanNumber}%`]);
      if (parentRes.rows.length > 0) profile = parentRes.rows[0];
    }

    if (!profile) {
      return NextResponse.json({ success: false, error: 'No account is associated with this mobile number.' }, { status: 404 });
    }

    // Map role to app standard
    let mappedRole: 'Admin' | 'Faculty' | 'Parent' | 'Student' | 'Driver' = 'Parent';
    if (profile.role === 'Super Admin' || profile.role === 'Admin' || profile.role === 'Principal') {
      mappedRole = 'Admin';
    } else if (profile.role === 'Faculty' || profile.role === 'Teacher') {
      mappedRole = 'Faculty';
    } else if (profile.role === 'Driver') {
      mappedRole = 'Driver';
    } else if (profile.role === 'Student') {
      mappedRole = 'Student';
    } else {
      mappedRole = 'Parent';
    }

    // Log Login Audit with device_info
    const userAccId = profile.id.includes('-') && profile.id.length === 36 ? profile.id : null;
    await client.query(`
      INSERT INTO public.login_audit_logs (
        username, user_account_id, auth_method, device_info, ip_address, status, created_at
      ) VALUES (
        $1, $2, 'MSG91_OTP', $3, '127.0.0.1', 'SUCCESS', NOW()
      );
    `, [profile.fullName, userAccId, deviceInfo]);

    return NextResponse.json({
      success: true,
      message: `✓ Phone verified via MSG91! Welcome, ${profile.fullName}.`,
      user: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email || null,
        phoneNumber: profile.phoneNumber,
        role: mappedRole,
        originalRole: profile.role
      }
    });

  } catch (error: any) {
    console.error("Error verifying MSG91 OTP:", error);
    return NextResponse.json({ success: false, error: 'Verification service is unavailable.' }, { status: 503 });
  } finally {
    client?.release();
  }
}
