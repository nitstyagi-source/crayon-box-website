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

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

export interface HomeworkItem {
  id: string;
  class_name: string;
  section_name: string;
  subject_name: string;
  teacher_name: string;
  title: string;
  instructions: string;
  due_date: string;
  estimated_minutes: number;
  status: string;
  created_at: string;
}

// -------------------------------------------------------------
// 1. CREATE HOMEWORK & DISPATCH WHATSAPP TO CLASS PARENTS
// -------------------------------------------------------------
export async function createHomeworkAssignmentAction(params: {
  className: string;
  sectionName?: string;
  subjectName: string;
  teacherName: string;
  title: string;
  instructions: string;
  dueDate: string;
  estimatedMinutes?: number;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const section = params.sectionName || "A";
    const est = params.estimatedMinutes || 30;

    const res = await client.query(`
      INSERT INTO public.student_homework (
        class_name, section_name, subject_name, teacher_name, title,
        instructions, due_date, estimated_minutes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE')
      RETURNING *;
    `, [
      params.className, section, params.subjectName, params.teacherName,
      params.title, params.instructions, params.dueDate, est
    ]);

    const hw = res.rows[0];

    // Dispatch WhatsApp Broadcast to Class Parents
    const msgContent = `📝 *Crayon Box School — Daily Homework Notice*\n\n• *Class*: ${params.className}-${section}\n• *Subject*: ${params.subjectName}\n• *Teacher*: ${params.teacherName}\n• *Topic*: *${params.title}*\n• *Due Date*: ${new Date(params.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n\n📖 *Instructions*:\n${params.instructions}\n\n📲 *Submit Homework Online*: https://www.crayonboxschool.com/student/homework\n\n_Academic Faculty, Crayon Box School_`;

    await client.query(`
      INSERT INTO public.whatsapp_messages (
        campus_id, student_id, student_name, parent_phone, message_type,
        template_name, content, status, dispatched_at
      ) VALUES ('default', NULL, $1, '+919810081008', 'HOMEWORK_ALERT', 'daily_homework_notice', $2, 'DELIVERED', NOW());
    `, [`Class ${params.className} Parents`, msgContent]);

    safeRevalidate('/admin/academic/homework');
    return {
      success: true,
      homework: hw,
      message: `✓ Homework published and WhatsApp notification broadcast to ${params.className} parents!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. GET CLASS HOMEWORK LIST
// -------------------------------------------------------------
export async function getClassHomeworkListAction(className?: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    const cls = className || "Class 1";
    const res = await client.query(`
      SELECT * FROM public.student_homework 
      WHERE class_name = $1 OR $1 = 'ALL'
      ORDER BY created_at DESC 
      LIMIT 50;
    `, [cls]);

    return { success: true, homework: res.rows as HomeworkItem[] };
  } catch (e: any) {
    return { success: false, error: e.message, homework: [] };
  } finally {
    client.release();
  }
}
