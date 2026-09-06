import { NextRequest, NextResponse } from "next/server";
import pg from "pg";

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const grade = searchParams.get('grade');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const pool = getPool();
  try {
    let query = `
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) as full_name,
        s.admission_no,
        s.roll_no,
        s.status,
        s.gender,
        s.blood_group,
        s.dob,
        s.photo_url,
        s.transport_mode,
        s.universal_id,
        s.class_id,
        s.father_name,
        s.mother_name,
        s.parent_phone,
        c.grade,
        c.section,
        c.room_number
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (classId) {
      params.push(classId);
      query += ` AND s.class_id = $${params.length}`;
    }

    if (grade) {
      params.push(grade);
      query += ` AND c.grade = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (
        s.first_name ILIKE $${params.length} OR 
        s.last_name ILIKE $${params.length} OR 
        s.admission_no ILIKE $${params.length} OR 
        s.universal_id ILIKE $${params.length}
      )`;
    }

    query += ` ORDER BY c.grade ASC NULLS LAST, s.roll_no ASC NULLS LAST, s.first_name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2};`;
    params.push(limit, offset);

    const res = await pool.query(query, params);

    const students = res.rows.map((s: any) => ({
      id: s.id,
      name: s.full_name,
      firstName: s.first_name,
      lastName: s.last_name || '',
      admissionNo: s.admission_no || '',
      rollNo: s.roll_no || '',
      grade: s.grade || '',
      section: s.section || '',
      room: s.room_number || '',
      status: s.status || 'ACTIVE',
      gender: s.gender || '',
      bloodGroup: s.blood_group || '',
      dob: s.dob ? String(s.dob).split('T')[0] : '',
      transportMode: s.transport_mode || '',
      universalId: s.universal_id || '',
      avatar: s.photo_url || '',
      attendancePct: 0,
      feeStatus: 'PAID',
      fatherName: s.father_name || '',
      motherName: s.mother_name || '',
      parentPhone: s.parent_phone || ''
    }));

    return NextResponse.json({
      success: true,
      data: {
        total: students.length,
        students
      }
    });
  } catch (error: any) {
    console.error("Error in students API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const pool = getPool();
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      dob,
      gender = 'Male',
      blood_group = 'O+',
      father_name,
      mother_name,
      transport_mode = 'Self Pickup',
      status = 'ACTIVE'
    } = body;

    if (!first_name) {
      return NextResponse.json({ success: false, error: "First name is required." }, { status: 400 });
    }

    const instCode = body.institution_code || body.campus_code || 'CBS';
    const currentYear = new Date().getFullYear();
    const admission_no = `${instCode}-${currentYear}-${Date.now().toString().slice(-4)}`;
    const universal_id = `STU-${currentYear}-${Date.now().toString().slice(-6)}`;

    const insertRes = await pool.query(`
      INSERT INTO public.students (
        first_name,
        last_name,
        admission_no,
        universal_id,
        dob,
        gender,
        blood_group,
        father_name,
        mother_name,
        transport_mode,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `, [
      first_name,
      last_name || '',
      admission_no,
      universal_id,
      dob || null,
      gender,
      blood_group,
      father_name || '',
      mother_name || '',
      transport_mode,
      status
    ]);

    return NextResponse.json({
      success: true,
      data: insertRes.rows[0]
    });
  } catch (error: any) {
    console.error("Error enrolling student:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
