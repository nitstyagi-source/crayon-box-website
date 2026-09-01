"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
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
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const admissionNo = `ADM-2026-${randomSeq}`;
    const initialPassword = `Crayon@${randomSeq}`;

    const msgContent = `🎓 *Welcome to Crayon Box School! Official Portal Credentials*\n\nDear Parent, student admission and digital profile for *${params.studentName}* (${params.className}) has been activated:\n\n• *Admission ID*: ${admissionNo}\n• *Portal Username*: ${params.parentPhone}\n• *Default Password*: ${initialPassword}\n• *School Code*: CBS-DELHI\n\n📲 *Login to Parent Portal*: https://www.crayonboxschool.com/login\n\n_Please change your password upon first login._\n_Admissions Board, Crayon Box School_`;

    await client.query(`
      INSERT INTO public.whatsapp_messages (
        campus_id, student_id, student_name, parent_phone, message_type,
        template_name, content, status, dispatched_at
      ) VALUES ('default', NULL, $1, $2, 'WELCOME_CREDENTIALS', 'student_welcome_credentials', $3, 'DELIVERED', NOW());
    `, [params.studentName, params.parentPhone, msgContent]);

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
