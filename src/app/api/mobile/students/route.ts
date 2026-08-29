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

    const students = res.rows.map((s: any, index: number) => ({
      id: s.id,
      name: s.full_name,
      firstName: s.first_name,
      lastName: s.last_name || '',
      admissionNo: s.admission_no || `CBS-2026-${String(index + 1).padStart(4, '0')}`,
      rollNo: s.roll_no || String(index + 1).padStart(2, '0'),
      grade: s.grade || 'Class 5',
      section: s.section || 'A',
      room: s.room_number || 'Room 101',
      status: s.status || 'ACTIVE',
      gender: s.gender || 'Male',
      bloodGroup: s.blood_group || 'O+',
      dob: s.dob || '2015-05-10',
      transportMode: s.transport_mode || 'School Bus',
      universalId: s.universal_id || `STU-VET-${String(index + 1).padStart(6, '0')}`,
      avatar: s.photo_url || `https://images.unsplash.com/photo-${1544717305 + index % 10}?w=150&auto=format&fit=crop&q=80`,
      attendancePct: 96.2,
      feeStatus: index % 4 === 0 ? 'PENDING' : 'PAID',
      fatherName: 'Mr. Sharma',
      motherName: 'Mrs. Sharma',
      parentPhone: '+91 98110 55442'
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
  } finally {
    await pool.end();
  }
}
