import { NextRequest, NextResponse } from "next/server";
import pg from "pg";

function getPool() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  return new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}

export async function GET(request: NextRequest) {
  const pool = getPool();
  try {
    const res = await pool.query(`
      SELECT 
        id,
        tracking_token,
        student_first_name,
        student_last_name,
        CONCAT(student_first_name, ' ', COALESCE(student_last_name, '')) as student_name,
        date_of_birth,
        grade_applied,
        previous_school,
        transport_required,
        status,
        created_at
      FROM public.admissions_applications
      ORDER BY created_at DESC
      LIMIT 100;
    `);

    return NextResponse.json({
      success: true,
      data: {
        total: res.rows.length,
        applications: res.rows
      }
    });
  } catch (error: any) {
    console.error("Error fetching admissions:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}

export async function POST(request: NextRequest) {
  const pool = getPool();
  try {
    const body = await request.json();
    const {
      student_first_name,
      student_last_name,
      grade_applied,
      date_of_birth,
      previous_school,
      transport_required,
      status = 'SUBMITTED'
    } = body;

    if (!student_first_name || !grade_applied) {
      return NextResponse.json({ success: false, error: "Student first name and grade are required." }, { status: 400 });
    }

    const tracking_token = `APP-${Date.now().toString().slice(-4)}`;

    const insertRes = await pool.query(`
      INSERT INTO public.admissions_applications (
        tracking_token,
        student_first_name,
        student_last_name,
        grade_applied,
        date_of_birth,
        previous_school,
        transport_required,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `, [
      tracking_token,
      student_first_name,
      student_last_name || '',
      grade_applied,
      date_of_birth || null,
      previous_school || '',
      Boolean(transport_required),
      status
    ]);

    return NextResponse.json({
      success: true,
      data: insertRes.rows[0]
    });
  } catch (error: any) {
    console.error("Error creating admission enquiry:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
