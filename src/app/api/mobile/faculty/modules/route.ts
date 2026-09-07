import { NextResponse } from 'next/server';
import pg from 'pg';
import { getFacultyAuthorizedMobileModulesAction } from '@/app/actions/rbac-actions';

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
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'FACULTY';
    const teacherId = searchParams.get('teacher_id') || '';
    const email = searchParams.get('email') || '';

    // Fetch dynamic modules for this role
    const result = await getFacultyAuthorizedMobileModulesAction(role);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Query real staff profile from PostgreSQL database
    let facultyProfile = {
      id: teacherId || 'FAC-STAFF',
      role: role,
      name: 'Faculty Member',
      designation: 'Teacher',
      department: 'Academics',
      campus_name: '',
      contact_phone: ''
    };

    try {
      const pool = getPool();
      let staffRow: any = null;

      if (teacherId && teacherId.length > 10) {
        const res = await pool.query(`
          SELECT s.id, s.first_name, s.last_name, s.designation, s.department, s.role, s.email,
                 c.name as campus_name, c.contact_phone as campus_phone,
                 i.name as institution_name, i.phone_number as institution_phone
          FROM public.staff s
          LEFT JOIN public.campuses c ON s.campus_id = c.id
          LEFT JOIN public.institutions i ON 1=1
          WHERE s.id = $1
          LIMIT 1;
        `, [teacherId]);
        if (res.rows.length > 0) staffRow = res.rows[0];
      }

      if (!staffRow && email) {
        const res = await pool.query(`
          SELECT s.id, s.first_name, s.last_name, s.designation, s.department, s.role, s.email,
                 c.name as campus_name, c.contact_phone as campus_phone,
                 i.name as institution_name, i.phone_number as institution_phone
          FROM public.staff s
          LEFT JOIN public.campuses c ON s.campus_id = c.id
          LEFT JOIN public.institutions i ON 1=1
          WHERE s.email ILIKE $1 OR s.official_email ILIKE $1
          LIMIT 1;
        `, [email.trim()]);
        if (res.rows.length > 0) staffRow = res.rows[0];
      }

      if (staffRow) {
        const fullName = `${staffRow.first_name || ''} ${staffRow.last_name || ''}`.trim() || 'Faculty Member';
        facultyProfile = {
          id: staffRow.id,
          role: staffRow.role || role,
          name: fullName,
          designation: staffRow.designation || 'Teacher',
          department: staffRow.department || 'Academics',
          campus_name: staffRow.campus_name || staffRow.institution_name || 'AVINYA SCHOOL',
          contact_phone: staffRow.campus_phone || staffRow.institution_phone || '+91 9911102005'
        };
      }
    } catch (dbErr) {
      console.error('[FACULTY API] Staff query error:', dbErr);
    }

    return NextResponse.json({
      success: true,
      faculty: facultyProfile,
      authorized_modules: (result.modules || []).map((m: any) => ({
        code: m.module_code,
        name: m.name,
        category: m.category,
        icon: m.mobile_icon || 'BookOpen',
        route: m.mobile_route || 'Dashboard',
        persona: m.mobile_persona || 'FACULTY',
        permissions: {
          can_view: m.can_view,
          can_create: m.can_create,
          can_edit: m.can_edit
        }
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

