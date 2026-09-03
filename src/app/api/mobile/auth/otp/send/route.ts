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
    const { mobileNumber, email } = body;

    // Clean phone number (strip +91, spaces, hyphens)
    const rawNumber = (mobileNumber || '').replace(/[^0-9]/g, '');
    const cleanNumber = rawNumber.length === 12 && rawNumber.startsWith('91') 
      ? rawNumber.slice(2) 
      : rawNumber.length === 10 
        ? rawNumber 
        : rawNumber.slice(-10);

    if (!/^\d{10}$/.test(cleanNumber)) {
      return NextResponse.json({ success: false, error: 'A valid 10-digit mobile number is required.' }, { status: 400 });
    }

    console.log(`[MSG91 OTP] Looking up profile for mobile: ${cleanNumber}`);

    // 1. Identify User in Database
    let identifiedUser: any = null;

    // A. Check User Accounts
    const userRes = await client.query(`
      SELECT id, full_name as "fullName", email, phone_number as "phoneNumber", primary_role as role
      FROM public.user_accounts
      WHERE phone_number LIKE $1 OR email ILIKE $2
      LIMIT 1;
    `, [`%${cleanNumber}%`, email || '']);
    if (userRes.rows.length > 0) {
      identifiedUser = userRes.rows[0];
    }

    // B. Check Staff / Faculty
    if (!identifiedUser) {
      const staffRes = await client.query(`
        SELECT id, CONCAT(first_name, ' ', COALESCE(last_name, '')) as "fullName", 
               COALESCE(official_email, email, personal_email) as email, 
               COALESCE(phone_number, personal_mobile, whatsapp_no) as "phoneNumber", 
               COALESCE(role, 'Faculty') as role
        FROM public.staff
        WHERE phone_number LIKE $1 OR personal_mobile LIKE $1 OR whatsapp_no LIKE $1 OR email ILIKE $2 OR official_email ILIKE $2
        LIMIT 1;
      `, [`%${cleanNumber}%`, email || '']);
      if (staffRes.rows.length > 0) {
        identifiedUser = staffRes.rows[0];
      }
    }

    // C. Check Transport Drivers
    if (!identifiedUser) {
      const driverRes = await client.query(`
        SELECT id, driver_name as "fullName", driver_phone as "phoneNumber", 'Driver' as role, bus_number as "busNumber"
        FROM public.transport_buses
        WHERE driver_phone LIKE $1
        LIMIT 1;
      `, [`%${cleanNumber}%`]);
      if (driverRes.rows.length > 0) {
        identifiedUser = driverRes.rows[0];
      }
    }

    // D. Check Parents & Students
    if (!identifiedUser) {
      const parentRes = await client.query(`
        SELECT p.id, CONCAT(p.first_name, ' ', COALESCE(p.last_name, '')) as "fullName", 
               p.phone_number as "phoneNumber", 'Parent' as role
        FROM public.parents p
        WHERE p.phone_number LIKE $1 OR p.email ILIKE $2
        LIMIT 1;
      `, [`%${cleanNumber}%`, email || '']);
      if (parentRes.rows.length > 0) {
        identifiedUser = parentRes.rows[0];
      }
    }

    if (!identifiedUser) {
      const studentRes = await client.query(`
        SELECT id, COALESCE(father_name, mother_name, CONCAT(first_name, ' Parent')) as "fullName",
               parent_phone as "phoneNumber", 'Parent' as role
        FROM public.students
        WHERE parent_phone LIKE $1 OR emergency_contact LIKE $1 OR parent_email ILIKE $2
        LIMIT 1;
      `, [`%${cleanNumber}%`, email || '']);
      if (studentRes.rows.length > 0) {
        identifiedUser = studentRes.rows[0];
      }
    }

    if (!identifiedUser) {
      return NextResponse.json({ success: false, error: 'This mobile number is not registered.' }, { status: 404 });
    }

    // 2. Dispatch OTP via MSG91 API. These credentials are server-only.
    const authKey = requireServerEnv('MSG91_AUTH_KEY');
    const templateId = requireServerEnv('MSG91_OTP_TEMPLATE_ID');
    const formattedPhone = `91${cleanNumber}`;
    const msg91Url = `https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(templateId)}&mobile=${formattedPhone}`;
    const apiRes = await fetch(msg91Url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey: authKey }
    });
    const msg91Response = await apiRes.json();

    if (!apiRes.ok || msg91Response?.type !== 'success') {
      console.error('MSG91 OTP dispatch failed', { status: apiRes.status, type: msg91Response?.type });
      return NextResponse.json({ success: false, error: 'Unable to send a verification code.' }, { status: 502 });
    }

    // Log OTP Audit in Database
    await client.query(`
      INSERT INTO public.auth_otp_logs (
        phone_number, otp_code_hash, purpose, expires_at, is_verified, created_at
      ) VALUES (
        $1, 'MSG91_SECURE_HASH', 'MOBILE_LOGIN', NOW() + INTERVAL '10 minutes', false, NOW()
      );
    `, [cleanNumber]);

    return NextResponse.json({
      success: true,
      message: `✓ MSG91 OTP dispatched to +91 ${cleanNumber}`,
      reqId: msg91Response?.request_id || null,
      profile: {
        id: identifiedUser.id,
        fullName: identifiedUser.fullName,
        email: identifiedUser.email || null,
        phoneNumber: identifiedUser.phoneNumber,
        role: identifiedUser.role,
      }
    });

  } catch (error: any) {
    console.error("Error sending MSG91 OTP:", error);
    return NextResponse.json({ success: false, error: 'Verification service is unavailable.' }, { status: 503 });
  } finally {
    client?.release();
  }
}
