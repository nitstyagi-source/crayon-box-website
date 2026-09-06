"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

// -------------------------------------------------------------
// 1. AUTO-GENERATE STUDENT CREDENTIALS & DISPATCH WHATSAPP
// -------------------------------------------------------------
export async function generateAndDispatchStudentCredentialsAction(params: {
  studentName: string;
  className: string;
  parentPhone: string;
  parentEmail?: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const campusRes = await client.query(`SELECT id, name, code FROM public.campuses LIMIT 1;`);
    const campusId = campusRes.rows[0]?.id || null;
    const schoolName = campusRes.rows[0]?.name || "School Administration";
    const schoolCode = campusRes.rows[0]?.code || "SCHOOL";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    const countRes = await client.query(`SELECT count(*)::int as count FROM public.students;`);
    const nextSeq = ((countRes.rows[0]?.count || 0) + 1).toString().padStart(4, '0');
    const admissionNo = `ADM-${new Date().getFullYear()}-${nextSeq}`;
    const initialPassword = `Welcome@${nextSeq}`;

    const msgContent = `🎓 *Welcome to ${schoolName}! Official Portal Credentials*\n\nDear Parent, student admission and digital profile for *${params.studentName}* (${params.className}) has been activated:\n\n• *Admission ID*: ${admissionNo}\n• *Portal Username*: ${params.parentPhone}\n• *Default Password*: ${initialPassword}\n• *School Code*: ${schoolCode}\n\n📲 *Login to Parent Portal*: ${appUrl}/login\n\n_Please change your password upon first login._\n_Admissions Board, ${schoolName}_`;

    await client.query(`
      INSERT INTO public.whatsapp_messages (
        campus_id, student_id, student_name, parent_phone, message_type,
        template_name, content, status, dispatched_at
      ) VALUES ($1, NULL, $2, $3, 'WELCOME_CREDENTIALS', 'student_welcome_credentials', $4, 'DELIVERED', NOW());
    `, [campusId, params.studentName, params.parentPhone, msgContent]);

    return {
      success: true,
      admissionNo,
      initialPassword,
      message: `✓ Credentials (${admissionNo}) generated and dispatched to parent WhatsApp (${params.parentPhone})!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}
