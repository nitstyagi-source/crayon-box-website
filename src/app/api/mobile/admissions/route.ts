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

    // Dual-write into public.enquiries for CRM synchronization
    try {
      await pool.query(`
        INSERT INTO public.enquiries (
          campus_id, enquiry_no, first_name, last_name, child_name,
          grade_interested, current_class, dob, father_name, father_mobile,
          father_email, parent_name, parent_phone, parent_email,
          status, priority, previous_school, transport_required, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, 'Hot', $16, $17, NOW(), NOW()
        )
        ON CONFLICT DO NOTHING;
      `, [
        campusId,
        tracking_token,
        student_first_name,
        student_last_name,
        `${student_first_name} ${student_last_name}`.trim(),
        grade_applied,
        grade_applied,
        date_of_birth,
        parent_name || 'Guardian',
        parent_phone,
        parent_email,
        parent_name || 'Guardian',
        parent_phone,
        parent_email,
        status === 'ADMITTED' || status === 'APPROVED' ? 'Converted' : 'New',
        previous_school,
        Boolean(transport_required)
      ]);
    } catch (enqSyncErr: any) {
      console.warn("Enquiries sync note:", enqSyncErr.message);
    }

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

export async function PATCH(request: NextRequest) {
  const pool = getPool();
  try {
    const body = await request.json();
    const {
      id,
      status,
      student_first_name,
      student_last_name,
      grade_applied,
      parent_name,
      parent_phone,
      parent_email,
      date_of_birth,
      previous_school,
      transport_required,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Application ID is required." }, { status: 400 });
    }

    // Get current record to merge kits
    const cur = await pool.query(`SELECT * FROM public.admissions_applications WHERE id = $1;`, [id]);
    if (cur.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
    }

    const currentApp = cur.rows[0];
    const existingKits = typeof currentApp.co_curricular_kits === 'object' && currentApp.co_curricular_kits !== null ? currentApp.co_curricular_kits : {};

    const updatedKits = {
      ...existingKits,
      parent_name: parent_name !== undefined ? parent_name : existingKits.parent_name,
      parent_phone: parent_phone !== undefined ? parent_phone : existingKits.parent_phone,
      parent_email: parent_email !== undefined ? parent_email : existingKits.parent_email,
      last_edited_at: new Date().toISOString()
    };

    const newFirstName = student_first_name !== undefined ? student_first_name : currentApp.student_first_name;
    const newLastName = student_last_name !== undefined ? student_last_name : currentApp.student_last_name;
    const newGrade = grade_applied !== undefined ? grade_applied : currentApp.grade_applied;
    const newDob = date_of_birth !== undefined ? date_of_birth : currentApp.date_of_birth;
    const newPrevSchool = previous_school !== undefined ? previous_school : currentApp.previous_school;
    const newTransport = transport_required !== undefined ? Boolean(transport_required) : currentApp.transport_required;
    const newStatus = status !== undefined ? status : currentApp.status;

    const res = await pool.query(`
      UPDATE public.admissions_applications
      SET 
        student_first_name = $1,
        student_last_name = $2,
        grade_applied = $3,
        date_of_birth = $4,
        previous_school = $5,
        transport_required = $6,
        status = $7,
        co_curricular_kits = $8::jsonb,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *;
    `, [
      newFirstName,
      newLastName,
      newGrade,
      newDob,
      newPrevSchool,
      newTransport,
      newStatus,
      JSON.stringify(updatedKits),
      id
    ]);

    const updatedRow = res.rows[0];

    // If status is APPROVED, ADMITTED, or ENROLLED, auto-provision student record into public.students (with duplicate check)
    if (['APPROVED', 'ADMITTED', 'ENROLLED'].includes((newStatus || '').toUpperCase())) {
      try {
        const campRes = await pool.query(`SELECT id FROM public.campuses LIMIT 1;`);
        const campusId = updatedRow.campus_id || campRes.rows[0]?.id;
        const parentFullName = updatedKits.parent_name || 'Parent / Guardian';

        // Check if student record already exists
        const existingStuRes = await pool.query(`
          SELECT id, admission_no FROM public.students
          WHERE admission_application_id = $1
             OR (LOWER(TRIM(first_name)) = LOWER(TRIM($2)) AND LOWER(TRIM(last_name)) = LOWER(TRIM($3)) AND dob = $4)
          LIMIT 1;
        `, [
          id,
          updatedRow.student_first_name || 'Student',
          updatedRow.student_last_name || '',
          updatedRow.date_of_birth || '2020-01-01'
        ]);

        let newStudentId = existingStuRes.rows[0]?.id;
        let admissionNo = existingStuRes.rows[0]?.admission_no;

        if (!newStudentId) {
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          admissionNo = `ADM-2026-${randomSuffix}`;

          const studRes = await pool.query(`
            INSERT INTO public.students (
              campus_id, admission_application_id, admission_no, enrollment_number,
              first_name, last_name, date_of_birth, dob, status, father_name, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $3,
              $4, $5, $6, $6, 'Active', $7, NOW(), NOW()
            )
            ON CONFLICT (admission_no) DO UPDATE SET status = 'Active', updated_at = NOW()
            RETURNING id;
          `, [
            campusId,
            id,
            admissionNo,
            updatedRow.student_first_name || 'Student',
            updatedRow.student_last_name || '',
            updatedRow.date_of_birth || '2020-01-01',
            parentFullName
          ]);
          newStudentId = studRes.rows[0]?.id;
        } else {
          await pool.query(`
            UPDATE public.students
            SET status = 'Active', admission_application_id = $1, updated_at = NOW()
            WHERE id = $2;
          `, [id, newStudentId]);
        }

        if (newStudentId) {
          await pool.query(`
            INSERT INTO public.student_enrollments (
              student_id, campus_id, institution_code, academic_session, class_name, section_name,
              admission_number, enrollment_status, admission_date, is_current, created_at
            ) VALUES (
              $1, $2, 'CBS', '2026-2027', $3, 'A',
              $4, 'ACTIVE', NOW(), true, NOW()
            )
            ON CONFLICT DO NOTHING;
          `, [newStudentId, campusId, updatedRow.grade_applied || 'Grade 1', admissionNo]);
        }
      } catch (provErr: any) {
        console.error("Student auto-provision note:", provErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedRow,
        student_name: `${updatedRow.student_first_name} ${updatedRow.student_last_name || ''}`.trim(),
        parent_name: updatedKits.parent_name,
        parent_phone: updatedKits.parent_phone,
        parent_email: updatedKits.parent_email,
      }
    });
  } catch (error: any) {
    console.error("Error updating admission enquiry:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}

export async function DELETE(request: NextRequest) {
  const pool = getPool();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required." }, { status: 400 });
    }

    await pool.query(`DELETE FROM public.admissions_applications WHERE id = $1;`, [id]);

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully."
    });
  } catch (error: any) {
    console.error("Error deleting admission enquiry:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}

