import { NextResponse } from "next/server";
import pg from "pg";

let globalPool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    globalPool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
}

export async function GET(request: Request) {
  const pool = getPool();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const dept = searchParams.get("department") || "";
    const category = searchParams.get("category") || "";
    const institutionCode = searchParams.get("institutionCode") || searchParams.get("institution_code") || searchParams.get("school") || "";
    let campusId = searchParams.get("campusId") || searchParams.get("campus_id") || "";

    if (!campusId && institutionCode && institutionCode !== "ALL") {
      const cRes = await pool.query(`
        SELECT c.id FROM public.campuses c
        JOIN public.institutions i ON (LOWER(TRIM(c.name)) = LOWER(TRIM(i.name)) OR LOWER(TRIM(c.name)) = LOWER(TRIM(i.short_name)))
        WHERE i.code = $1 OR c.id::text = $1
        LIMIT 1;
      `, [institutionCode]);
      if (cRes.rows.length > 0) {
        campusId = cRes.rows[0].id;
      }
    }

    let query = `
      SELECT s.id, s.first_name, s.middle_name, s.last_name, s.employee_id, s.employee_code,
             s.campus_id as "campusId", s.campus_id,
             c.name as "campusName",
             s.role, s.designation, s.department, s.wing, s.qualification, s.experience_years,
             s.phone_number, s.personal_mobile, s.whatsapp_no, s.email, s.personal_email, s.official_email,
             s.status, s.is_active, s.photo_url, s.gender, s.dob, s.blood_group,
             s.is_class_teacher, s.class_teacher_for, s.subjects_taught,
             s.police_verification_status, s.emergency_contact, s.bio, s.created_at
      FROM public.staff s
      LEFT JOIN public.campuses c ON c.id = s.campus_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (campusId && campusId !== "ALL") {
      params.push(campusId);
      // Filter staff by selected school's campus, plus universal trust leadership (Nitin Tyagi)
      query += ` AND (s.campus_id = $${params.length} OR (s.campus_id IS NULL AND (s.role ILIKE '%SUPER%' OR s.role ILIKE '%CHAIRMAN%' OR s.designation ILIKE '%CHAIRMAN%')))`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      query += ` AND (LOWER(s.first_name) LIKE $${params.length} OR LOWER(s.last_name) LIKE $${params.length} OR LOWER(s.designation) LIKE $${params.length} OR LOWER(s.employee_id) LIKE $${params.length})`;
    }

    if (dept && dept !== "All") {
      params.push(dept);
      query += ` AND s.department = $${params.length}`;
    }

    if (category && category !== "All") {
      params.push(category);
      query += ` AND s.employee_category = $${params.length}`;
    }

    query += ` ORDER BY s.created_at DESC, s.first_name ASC`;

    const res = await pool.query(query, params);
    return NextResponse.json({ success: true, staff: res.rows });
  } catch (error: any) {
    console.error("Error fetching faculty:", error);
    return NextResponse.json({ success: false, error: error.message, staff: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const pool = getPool();
  try {
    const body = await request.json();
    const {
      first_name,
      last_name = "",
      middle_name = "",
      role = "Faculty",
      designation = "",
      department = "",
      wing = "",
      phone_number = "",
      email = "",
      qualification = "",
      experience_years = "",
      gender = "",
      blood_group = "",
      employee_id,
      status = "Active",
      is_active = true,
      police_verification_status = "PENDING",
      emergency_contact = "",
      bio = "",
      campus_id,
      campusId,
      institution_code,
      institutionCode,
    } = body;

    if (!first_name) {
      return NextResponse.json({ success: false, error: "First name is required" }, { status: 400 });
    }

    let finalCampusId = campus_id || campusId || null;
    const instCode = institution_code || institutionCode || "";
    if (!finalCampusId && instCode && instCode !== "ALL") {
      const cRes = await pool.query(`
        SELECT c.id FROM public.campuses c
        JOIN public.institutions i ON (LOWER(TRIM(c.name)) = LOWER(TRIM(i.name)) OR LOWER(TRIM(c.name)) = LOWER(TRIM(i.short_name)))
        WHERE i.code = $1
        LIMIT 1;
      `, [instCode]);
      if (cRes.rows.length > 0) finalCampusId = cRes.rows[0].id;
    }

    let finalEmpId = employee_id;
    if (!finalEmpId) {
      const staffCount = await pool.query(`SELECT count(*)::int as count FROM public.staff;`);
      const seq = ((staffCount.rows[0]?.count || 0) + 1).toString().padStart(4, '0');
      finalEmpId = `CB-EMP-${seq}`;
    }

    const insertQuery = `
      INSERT INTO public.staff (
        first_name, last_name, middle_name, role, designation, department, wing,
        phone_number, personal_mobile, email, official_email, qualification,
        experience_years, gender, blood_group, employee_id, employee_code,
        status, is_active, police_verification_status, emergency_contact, bio,
        campus_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $8, $9, $9, $10,
        $11, $12, $13, $14, $14,
        $15, $16, $17, $18, $19,
        $20
      ) RETURNING *;
    `;

    const values = [
      first_name,
      last_name,
      middle_name,
      role,
      designation,
      department,
      wing,
      phone_number,
      email,
      qualification,
      experience_years,
      gender,
      blood_group,
      finalEmpId,
      status,
      is_active,
      police_verification_status,
      emergency_contact,
      bio,
      finalCampusId,
    ];

    const res = await pool.query(insertQuery, values);
    return NextResponse.json({ success: true, member: res.rows[0] });
  } catch (error: any) {
    console.error("Error creating faculty:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const pool = getPool();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Staff ID is required" }, { status: 400 });
    }

    const fields = Object.keys(updates);
    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    const setClauses = fields.map((f, i) => `"${f}" = $${i + 2}`).join(", ");
    const values = [id, ...Object.values(updates)];

    const query = `
      UPDATE public.staff
      SET ${setClauses}
      WHERE id = $1
      RETURNING *;
    `;

    const res = await pool.query(query, values);
    return NextResponse.json({ success: true, member: res.rows[0] });
  } catch (error: any) {
    console.error("Error updating faculty:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const pool = getPool();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Staff ID is required" }, { status: 400 });
    }

    await pool.query("DELETE FROM public.staff WHERE id = $1", [id]);
    return NextResponse.json({ success: true, message: "Faculty member removed successfully" });
  } catch (error: any) {
    console.error("Error deleting faculty:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
