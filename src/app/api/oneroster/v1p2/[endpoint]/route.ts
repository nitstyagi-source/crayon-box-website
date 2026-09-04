import { NextRequest, NextResponse } from 'next/server';
import pg from 'pg';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  return pool;
}

/**
 * OneRoster v1.2 Specification REST Controller
 * Supported Endpoints:
 * - /api/oneroster/v1p2/orgs
 * - /api/oneroster/v1p2/academicSessions
 * - /api/oneroster/v1p2/classes
 * - /api/oneroster/v1p2/courses
 * - /api/oneroster/v1p2/users
 * - /api/oneroster/v1p2/enrollments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ endpoint: string }> }
) {
  const { endpoint } = await params;
  const p = getPool();
  const client = await p.connect();

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

  try {
    switch (endpoint.toLowerCase()) {
      // 1. ORGS (Institutions & Campuses)
      case 'orgs': {
        const res = await client.query(`
          SELECT id as sourcedId, 'active' as status, created_at as dateLastModified,
                 name, 'school' as type, code as identifier
          FROM public.institutions
          LIMIT $1 OFFSET $2;
        `, [limit, offset]);

        return NextResponse.json({
          orgs: res.rows.map((r: any) => ({
            sourcedId: r.sourcedid,
            status: r.status,
            dateLastModified: r.datelastmodified,
            name: r.name,
            type: r.type,
            identifier: r.identifier
          }))
        }, {
          headers: { 'Content-Type': 'application/json', 'X-Total-Count': String(res.rows.length) }
        });
      }

      // 2. ACADEMIC SESSIONS (Terms & School Years)
      case 'academicsessions': {
        return NextResponse.json({
          academicSessions: [
            {
              sourcedId: 'session-2026-2027',
              status: 'active',
              dateLastModified: new Date().toISOString(),
              title: 'Academic Session 2026-2027',
              startDate: '2026-04-01',
              endDate: '2027-03-31',
              type: 'schoolYear'
            },
            {
              sourcedId: 'term-1-2026',
              status: 'active',
              dateLastModified: new Date().toISOString(),
              title: 'Term 1 (Half Yearly)',
              startDate: '2026-04-01',
              endDate: '2026-09-30',
              type: 'term'
            }
          ]
        });
      }

      // 3. CLASSES (Class Sections)
      case 'classes': {
        const res = await client.query(`
          SELECT c.id as sourcedId, 'active' as status,
                 c.name as title, c.grade as classCode,
                 'CBS-CAMPUS-01' as schoolSourcedId
          FROM public.classes c
          LIMIT $1 OFFSET $2;
        `, [limit, offset]);

        return NextResponse.json({
          classes: res.rows.map((r: any) => ({
            sourcedId: r.sourcedid,
            status: r.status,
            title: r.title || r.classcode,
            classCode: r.classcode,
            classType: 'homeroom',
            schoolSourcedId: r.schoolsourcedid
          }))
        });
      }

      // 4. COURSES (Subjects)
      case 'courses': {
        const courses = [
          { sourcedId: 'crs-math', title: 'Mathematics', courseCode: 'MATH-041', grade: 'All' },
          { sourcedId: 'crs-eng', title: 'English Language & Literature', courseCode: 'ENG-184', grade: 'All' },
          { sourcedId: 'crs-sci', title: 'General Science & EVS', courseCode: 'SCI-086', grade: 'All' },
          { sourcedId: 'crs-hin', title: 'Hindi Course-B', courseCode: 'HIN-085', grade: 'All' },
          { sourcedId: 'crs-ai', title: 'Computer Science & AI', courseCode: 'AI-417', grade: 'All' }
        ];

        return NextResponse.json({ courses });
      }

      // 5. USERS (Students, Faculty, Staff)
      case 'users': {
        const role = searchParams.get('role'); // 'student', 'teacher'
        let query = `
          SELECT s.id as sourcedId, 'active' as status, s.first_name as givenName,
                 s.last_name as familyName, 'student' as role,
                 COALESCE(s.admission_no, s.universal_id) as identifier,
                 'student@crayonbox.test' as email,
                 s.parent_phone as phone
          FROM public.students s
          WHERE s.status = 'ACTIVE'
        `;
        const values: any[] = [];
        query += ` LIMIT $1 OFFSET $2;`;
        values.push(limit, offset);

        const res = await client.query(query, values);

        return NextResponse.json({
          users: res.rows.map((r: any) => ({
            sourcedId: r.sourcedid,
            status: r.status,
            dateLastModified: new Date().toISOString(),
            enabledUser: true,
            givenName: r.givenname,
            familyName: r.familyname,
            role: r.role,
            identifier: r.identifier,
            email: r.email,
            phone: r.phone
          }))
        });
      }

      // 6. ENROLLMENTS (Roster mapping)
      case 'enrollments': {
        const res = await client.query(`
          SELECT s.id as userSourcedId, s.class_id as classSourcedId,
                 'student' as role, true as primary
          FROM public.students s
          WHERE s.status = 'ACTIVE' AND s.class_id IS NOT NULL
          LIMIT $1 OFFSET $2;
        `, [limit, offset]);

        return NextResponse.json({
          enrollments: res.rows.map((r: any) => ({
            sourcedId: `enr-${r.usersourcedid}`,
            status: 'active',
            dateLastModified: new Date().toISOString(),
            userSourcedId: r.usersourcedid,
            classSourcedId: r.classsourcedid,
            schoolSourcedId: '00000000-0000-0000-0000-000000000001',
            role: r.role,
            primary: r.primary
          }))
        });
      }

      default:
        return NextResponse.json({
          error: `OneRoster endpoint '${endpoint}' is not supported. Valid endpoints: orgs, academicSessions, classes, courses, users, enrollments.`
        }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`[OneRoster API Error] /${endpoint}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
