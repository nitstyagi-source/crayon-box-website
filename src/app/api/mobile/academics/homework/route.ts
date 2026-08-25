import { NextResponse } from 'next/server';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let globalPool: pg.Pool | null = null;
function getPool() {
  if (!globalPool) {
    globalPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const grade = searchParams.get('grade') || '';

  const pool = getPool();
  try {
    let sql = `
      SELECT id, subject_name as subject, homework_title as title, homework_due_date as "dueDate",
             teacher_name as teacher, 'Active' as status, homework_description as description,
             date as "assignedDate"
      FROM public.digital_diary_entries
      WHERE homework_title IS NOT NULL AND homework_title != ''
    `;
    const params: any[] = [];
    if (grade) {
      params.push(`%${grade}%`);
      sql += ` AND (class_name ILIKE $1 OR homework_title ILIKE $1)`;
    }
    sql += ` ORDER BY date DESC LIMIT 20;`;

    const res = await pool.query(sql, params);
    return NextResponse.json({ success: true, data: res.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { title, subject, description, dueDate, teacherName, targetClass, periodNumber = 1, campusId = 'c3d782a9-a50b-4708-a3fc-6b146f456662' } = body;

    const res = await client.query(`
      INSERT INTO public.digital_diary_entries (
        campus_id, academic_session, date, day_of_week, period_number, period_label, class_name, section_name, subject_name,
        teacher_name, homework_title, homework_description, homework_due_date, created_at, updated_at
      ) VALUES (
        $1, '2026-27', CURRENT_DATE, TO_CHAR(CURRENT_DATE, 'Day'), $2, 'Period 1', $3, 'A', $4,
        $5, $6, $7, $8, NOW(), NOW()
      )
      ON CONFLICT (campus_id, date, class_name, section_name, period_number) DO UPDATE
      SET homework_title = EXCLUDED.homework_title,
          homework_description = EXCLUDED.homework_description,
          homework_due_date = EXCLUDED.homework_due_date,
          subject_name = EXCLUDED.subject_name,
          teacher_name = EXCLUDED.teacher_name,
          updated_at = NOW()
      RETURNING id, subject_name as subject, homework_title as title, homework_due_date as "dueDate", teacher_name as teacher, homework_description as description;
    `, [campusId, periodNumber, targetClass || 'Grade 5', subject || 'General', teacherName || 'Faculty', title, description || '', dueDate ? new Date(dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]]);

    return NextResponse.json({
      success: true,
      message: `✓ Vaani published '${title}' to student & parent digital diaries!`,
      data: res.rows[0]
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
