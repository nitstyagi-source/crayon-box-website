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

export async function POST(request: Request) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { grade, section, date, period, attendanceList, teacherId } = body;

    const targetDate = date || new Date().toISOString().split('T')[0];
    const records = Array.isArray(attendanceList) ? attendanceList : [];

    let insertedCount = 0;
    for (const item of records) {
      const studentId = item.id || item.studentId;
      const status = item.status || 'Present';
      const remarks = item.remarks || null;

      if (studentId) {
        // Resolve student UUID if given custom string code
        const stuRes = await client.query(`
          SELECT id FROM public.students 
          WHERE id::text = $1 OR admission_no ILIKE $1 
          LIMIT 1;
        `, [studentId]);
        const resolvedId = stuRes.rows[0]?.id || (studentId.includes('-') && studentId.length === 36 ? studentId : null);

        if (resolvedId) {
          await client.query(`
            INSERT INTO public.student_attendance_records (
              institution_code, student_id, date, status, remarks, class_name, section_name, event_type, verification_method, created_at
            ) VALUES (
              'CBS', $1, $2, $3, $4, $5, $6, 'Classroom', 'Mobile App', NOW()
            )
            ON CONFLICT (student_id, date, event_type) DO UPDATE
            SET status = EXCLUDED.status, 
                remarks = EXCLUDED.remarks, 
                verification_method = EXCLUDED.verification_method;
          `, [resolvedId, targetDate, status, remarks, grade || 'Grade 5', section || 'A']);
          insertedCount++;
        }
      }
    }

    const presentCount = records.filter((s: any) => s.status === 'Present').length;
    const absentCount = records.filter((s: any) => s.status === 'Absent').length;
    const lateCount = records.filter((s: any) => s.status === 'Late').length;

    return NextResponse.json({
      success: true,
      message: `✓ Vaani synchronized ${insertedCount} student attendance records to central PostgreSQL ERP.`,
      timestamp: new Date().toISOString(),
      summary: {
        total: insertedCount,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
      }
    });
  } catch (error: any) {
    console.error("Error in mobile attendance register:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
