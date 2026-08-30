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
        co_curricular_kits,
        status,
        created_at
      FROM public.admissions_applications
      ORDER BY created_at DESC
      LIMIT 200;
    `);

    const formattedApplications = res.rows.map((row: any) => {
      const kits = typeof row.co_curricular_kits === 'object' && row.co_curricular_kits !== null ? row.co_curricular_kits : {};
      return {
        id: row.id,
        tracking_token: row.tracking_token || `APP-${row.id.substring(0, 8).toUpperCase()}`,
        student_name: row.student_name ? row.student_name.trim() : `${row.student_first_name || ''} ${row.student_last_name || ''}`.trim() || 'Applicant',
        student_first_name: row.student_first_name || '',
        student_last_name: row.student_last_name || '',
        grade_applied: row.grade_applied || 'Class 1',
        date_of_birth: row.date_of_birth,
        previous_school: row.previous_school || '',
        transport_required: Boolean(row.transport_required),
        status: (row.status || 'SUBMITTED').toUpperCase(),
        parent_name: kits.parent_name || 'Guardian',
        parent_phone: kits.parent_phone || '',
        parent_email: kits.parent_email || '',
        submission_channel: kits.submission_channel || 'Mobile App Admissions CRM',
        created_at: row.created_at
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        total: formattedApplications.length,
        applications: formattedApplications
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
      student_last_name = '',
      grade_applied,
      parent_name = '',
      parent_phone = '',
      parent_email = '',
      date_of_birth = '2021-01-01',
      previous_school = '',
      transport_required = false,
      status = 'SUBMITTED'
    } = body;

    if (!student_first_name || !grade_applied) {
      return NextResponse.json({ success: false, error: "Student first name and grade are required." }, { status: 400 });
    }

    // Resolve valid campus_id and academic_year_id from DB
    const campusRes = await pool.query(`SELECT id FROM public.campuses LIMIT 1;`);
    const campusId = campusRes.rows[0]?.id || '362d2f45-c1d2-4974-9207-559ac54051a6';

    const yearRes = await pool.query(`SELECT id FROM public.academic_years LIMIT 1;`);
    const yearId = yearRes.rows[0]?.id || '27438acf-7afd-4b12-a6c8-a059ab39b26a';

    const tracking_token = `APP-${Date.now().toString().slice(-5)}`;

    const kitsPayload = JSON.stringify({
      parent_name: parent_name || 'Guardian',
      parent_phone: parent_phone || '',
      parent_email: parent_email || '',
      submission_channel: 'Mobile App Admissions CRM',
      created_at: new Date().toISOString()
    });

    const insertRes = await pool.query(`
      INSERT INTO public.admissions_applications (
        campus_id,
        academic_year_id,
        tracking_token,
        student_first_name,
        student_last_name,
        grade_applied,
        date_of_birth,
        previous_school,
        transport_required,
        co_curricular_kits,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)
      RETURNING *;
    `, [
      campusId,
      yearId,
      tracking_token,
      student_first_name,
      student_last_name,
      grade_applied,
      date_of_birth,
      previous_school,
      Boolean(transport_required),
      kitsPayload,
      status
    ]);

    const createdApp = insertRes.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        ...createdApp,
        student_name: `${createdApp.student_first_name} ${createdApp.student_last_name}`.trim(),
        parent_name,
        parent_phone,
        parent_email
      }
    });
  } catch (error: any) {
    console.error("Error creating admission enquiry:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}

