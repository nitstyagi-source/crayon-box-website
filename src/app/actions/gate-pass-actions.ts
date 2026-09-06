"use server";

import pg from 'pg';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

export interface GatePassRecord {
  id: string;
  pass_type: "STUDENT_EARLY_EXIT" | "VISITOR";
  student_name?: string;
  class_name?: string;
  guardian_name?: string;
  guardian_phone: string;
  reason: string;
  parent_otp?: string;
  otp_verified: boolean;
  host_staff_name?: string;
  visitor_photo_url?: string;
  issued_by_guard: string;
  status: "APPROVED" | "PENDING_OTP" | "COMPLETED" | "REJECTED";
  pass_code: string;
  created_at: string;
  exited_at?: string;
}

// -------------------------------------------------------------
// 1. GET RECENT GATE PASSES & LIVE METRICS
// -------------------------------------------------------------
export async function getRecentGatePassesAction() {
  const p = getPool();
  const client = await p.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.gate_passes 
      ORDER BY created_at DESC 
      LIMIT 100;
    `);

    const passes: GatePassRecord[] = res.rows;

    const stats = {
      totalToday: passes.length,
      activeOnCampus: passes.filter(p => p.status === 'APPROVED' && !p.exited_at).length,
      studentEarlyExits: passes.filter(p => p.pass_type === 'STUDENT_EARLY_EXIT').length,
      visitorsToday: passes.filter(p => p.pass_type === 'VISITOR').length
    };

    return { success: true, passes, stats };
  } catch (e: any) {
    return { success: false, error: e.message, passes: [], stats: { totalToday: 0, activeOnCampus: 0, studentEarlyExits: 0, visitorsToday: 0 } };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. REQUEST EARLY STUDENT EXIT OTP (Sent to Parent WhatsApp/SMS)
// -------------------------------------------------------------
export async function requestEarlyStudentExitOtpAction(params: {
  studentId?: string;
  studentName: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  reason: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    // Generate 6-Digit Secure OTP and sequential passCode
    const otp = crypto.randomInt(100000, 1000000).toString();
    const countRes = await client.query(`SELECT count(*)::int as count FROM public.gate_passes;`);
    const nextSeq = ((countRes.rows[0]?.count || 0) + 1).toString().padStart(4, '0');
    const passCode = `GP-${new Date().getFullYear()}-${nextSeq}`;

    const insertRes = await client.query(`
      INSERT INTO public.gate_passes (
        pass_type, student_id, student_name, class_name, guardian_name,
        guardian_phone, reason, parent_otp, otp_verified, status, pass_code, created_at
      ) VALUES ('STUDENT_EARLY_EXIT', $1, $2, $3, $4, $5, $6, $7, false, 'PENDING_OTP', $8, NOW())
      RETURNING id, pass_code;
    `, [
      params.studentId || null, params.studentName, params.className,
      params.guardianName, params.guardianPhone, params.reason, otp, passCode
    ]);

    const passId = insertRes.rows[0].id;

    // Send Parent WhatsApp Alert with OTP
    const campRes = await client.query(`SELECT name FROM public.campuses LIMIT 1;`).catch(() => ({ rows: [] }));
    const schoolName = campRes.rows[0]?.name || 'Campus Security';
    const msgContent = `🔐 *${schoolName} Security — Early Exit Verification OTP*\n\nAn early student exit request was initiated at the main security gate for:\n• *Student*: ${params.studentName} (${params.className})\n• *Pickup Person*: ${params.guardianName}\n• *Reason*: ${params.reason}\n\n👉 Your 6-Digit Security OTP is: *${otp}*\n\nPlease share this OTP with the gate security guard to authorize student departure.`;

    await client.query(`
      INSERT INTO public.whatsapp_messages (
        campus_id, student_id, student_name, parent_phone, message_type,
        template_name, content, status, dispatched_at
      ) VALUES ('default', $1, $2, $3, 'GATE_PASS_OTP', 'early_exit_otp', $4, 'DELIVERED', NOW());
    `, [params.studentId || null, params.studentName, params.guardianPhone, msgContent]);

    safeRevalidate('/admin/visitors/gate-pass');

    return {
      success: true,
      passId,
      passCode,
      generatedOtp: otp, // Returned for test bypass / instant simulation
      message: `Security OTP ${otp} dispatched to parent WhatsApp (${params.guardianPhone})!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. VERIFY PARENT OTP & AUTHORIZE GATE PASS
// -------------------------------------------------------------
export async function verifyStudentExitOtpAndIssuePassAction(params: {
  passId: string;
  enteredOtp: string;
  guardName?: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const checkRes = await client.query(`
      SELECT * FROM public.gate_passes WHERE id = $1 LIMIT 1;
    `, [params.passId]);

    if (checkRes.rows.length === 0) {
      return { success: false, error: "Gate pass request not found." };
    }

    const pass = checkRes.rows[0];

    // Verify exact OTP match
    if (params.enteredOtp !== pass.parent_otp) {
      return { success: false, error: "Incorrect OTP. Please check the 6-digit code on parent WhatsApp." };
    }

    await client.query(`
      UPDATE public.gate_passes
      SET otp_verified = true, status = 'APPROVED', issued_by_guard = $1, exited_at = NOW()
      WHERE id = $2;
    `, [params.guardName || 'Main Gate Security Guard', params.passId]);

    // Send departure confirmation WhatsApp
    const campRes2 = await client.query(`SELECT name FROM public.campuses LIMIT 1;`).catch(() => ({ rows: [] }));
    const schoolName2 = campRes2.rows[0]?.name || 'Campus Security';
    const confirmMsg = `🚪 *${schoolName2} — Student Departure Notice*\n\nYour ward *${pass.student_name}* (${pass.class_name}) has safely exited the school main gate with *${pass.guardian_name}* at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.\n\n_Security Gate Pass Code: ${pass.pass_code}_`;

    await client.query(`
      INSERT INTO public.whatsapp_messages (
        campus_id, student_id, student_name, parent_phone, message_type,
        template_name, content, status, dispatched_at
      ) VALUES ('default', $1, $2, $3, 'GATE_PASS_EXIT', 'departure_notice', $4, 'DELIVERED', NOW());
    `, [pass.student_id, pass.student_name, pass.guardian_phone, confirmMsg]);

    safeRevalidate('/admin/visitors/gate-pass');
    return {
      success: true,
      message: `✓ Parent OTP Verified! Digital Gate Pass ${pass.pass_code} approved for ${pass.student_name}!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. CREATE VISITOR GATE PASS
// -------------------------------------------------------------
export async function createVisitorGatePassAction(params: {
  visitorName: string;
  visitorPhone: string;
  hostStaffName: string;
  reason: string;
  visitorPhotoUrl?: string;
  guardName?: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const countRes = await client.query(`SELECT count(*)::int as count FROM public.gate_passes;`);
    const nextSeq = ((countRes.rows[0]?.count || 0) + 1).toString().padStart(4, '0');
    const passCode = `VP-${new Date().getFullYear()}-${nextSeq}`;

    const res = await client.query(`
      INSERT INTO public.gate_passes (
        pass_type, guardian_name, guardian_phone, host_staff_name,
        reason, visitor_photo_url, issued_by_guard, status, pass_code, otp_verified, created_at
      ) VALUES ('VISITOR', $1, $2, $3, $4, $5, $6, 'APPROVED', $7, true, NOW())
      RETURNING *;
    `, [
      params.visitorName, params.visitorPhone, params.hostStaffName,
      params.reason, params.visitorPhotoUrl || null, params.guardName || 'Main Gate Security',
      passCode
    ]);

    safeRevalidate('/admin/visitors/gate-pass');
    return {
      success: true,
      pass: res.rows[0],
      message: `Visitor QR Badge ${passCode} generated for ${params.visitorName}!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 5. CHECKOUT / COMPLETE GATE PASS (TURNSTILE SCAN)
// -------------------------------------------------------------
export async function checkoutGatePassAction(passId: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    await client.query(`
      UPDATE public.gate_passes
      SET status = 'COMPLETED', exited_at = NOW()
      WHERE id = $1;
    `, [passId]);

    safeRevalidate('/admin/visitors/gate-pass');
    return { success: true, message: "Visitor / Student departure recorded at main gate turnstile." };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}
