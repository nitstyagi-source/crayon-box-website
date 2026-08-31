import { NextResponse } from "next/server";
import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

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
  const pool = getPool();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const dept = searchParams.get("department") || "";
    const category = searchParams.get("category") || "";

    let query = `
      SELECT id, first_name, middle_name, last_name, employee_id, employee_code,
             role, designation, department, wing, qualification, experience_years,
             phone_number, personal_mobile, whatsapp_no, email, personal_email, official_email,
             status, is_active, photo_url, gender, dob, blood_group,
             is_class_teacher, class_teacher_for, subjects_taught,
             police_verification_status, emergency_contact, bio, created_at
      FROM public.staff
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      query += ` AND (LOWER(first_name) LIKE $${params.length} OR LOWER(last_name) LIKE $${params.length} OR LOWER(designation) LIKE $${params.length} OR LOWER(employee_id) LIKE $${params.length})`;
    }

    if (dept && dept !== "All") {
      params.push(dept);
      query += ` AND department = $${params.length}`;
    }

    if (category && category !== "All") {
      params.push(category);
      query += ` AND employee_category = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC, first_name ASC`;

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
      role = "Teacher",
      designation = "PRT Teacher",
      department = "Sciences & Robotics",
      wing = "Primary (1-5)",
      phone_number = "",
      email = "",
      qualification = "B.Ed, Graduate",
      experience_years = "2 Years",
      gender = "Female",
      blood_group = "O+",
      employee_id = "CB-EMP-" + Math.floor(1000 + Math.random() * 9000),
      status = "Active",
      is_active = true,
      police_verification_status = "VERIFIED",
      emergency_contact = "",
      bio = "",
    } = body;

    if (!first_name) {
      return NextResponse.json({ success: false, error: "First name is required" }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO public.staff (
        first_name, last_name, middle_name, role, designation, department, wing,
        phone_number, personal_mobile, email, official_email, qualification,
        experience_years, gender, blood_group, employee_id, employee_code,
        status, is_active, police_verification_status, emergency_contact, bio
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $8, $9, $9, $10,
        $11, $12, $13, $14, $14,
        $15, $16, $17, $18, $19
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
      employee_id,
      status,
      is_active,
      police_verification_status,
      emergency_contact,
      bio,
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
