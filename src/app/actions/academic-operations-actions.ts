"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

function getPool() {
  return new Pool({ connectionString });
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

function safeDateStr(d: any): string {
  if (!d) return new Date().toISOString().split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  if (typeof d === 'string') return d.split('T')[0];
  return String(d);
}

// -------------------------------------------------------------
// 1. GET ACADEMIC CLASSES & SECTION ROSTER
// -------------------------------------------------------------
export async function getAcademicClassesDashboardAction() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(`
      SELECT c.*,
             st.first_name as teacher_first, st.last_name as teacher_last,
             count(s.id) as enrolled_students
      FROM public.classes c
      LEFT JOIN public.staff st ON st.id = c.teacher_id
      LEFT JOIN public.students s ON s.class_id = c.id
      GROUP BY c.id, st.id
      ORDER BY c.grade ASC, c.section ASC
    `);

    const classes = res.rows.map((r: any) => ({
      ...r,
      enrolled_students: Number(r.enrolled_students || 0),
      capacity: Number(r.capacity || 35),
      utilizationRate: Number(r.capacity) > 0 ? Math.round((Number(r.enrolled_students || 0) / Number(r.capacity || 35)) * 100) : 0,
      classTeacher: r.teacher_first ? `${r.teacher_first} ${r.teacher_last}` : 'To Be Assigned'
    }));

    const counts = {
      totalClasses: classes.length,
      totalEnrolled: classes.reduce((acc: number, cur: any) => acc + cur.enrolled_students, 0),
      totalCapacity: classes.reduce((acc: number, cur: any) => acc + cur.capacity, 0),
      avgUtilization: classes.length > 0
        ? Math.round(classes.reduce((acc: number, cur: any) => acc + cur.utilizationRate, 0) / classes.length)
        : 0
    };

    return { success: true, classes, counts };
  } catch (error: any) {
    return { success: false, error: error.message, classes: [], counts: { totalClasses: 0, totalEnrolled: 0, totalCapacity: 0, avgUtilization: 0 } };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. GET MASTER TIMETABLE GRID
// -------------------------------------------------------------
export async function getMasterTimetableGridAction(params?: {
  grade?: string;
  section?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const grade = params?.grade || 'Class 1';
    const section = params?.section || 'A';

    const res = await client.query(`
      SELECT tt.*, st.first_name as teacher_first, st.last_name as teacher_last
      FROM public.school_timetable tt
      LEFT JOIN public.staff st ON st.id = tt.teacher_id
      WHERE tt.class_name = $1 AND tt.section_name = $2
      ORDER BY tt.period_number ASC
    `, [grade, section]);

    const slots = res.rows.map((r: any) => ({
      ...r,
      teacher_name: r.teacher_first ? `${r.teacher_first} ${r.teacher_last}` : r.teacher_name
    }));

    // Group by Day of Week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    return {
      success: true,
      grade,
      section,
      totalSlots: slots.length,
      slots,
      days,
      periods
    };
  } catch (error: any) {
    return { success: false, error: error.message, slots: [], days: [], periods: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. GET TRANSFER CERTIFICATES ROSTER
// -------------------------------------------------------------
export async function getTransferCertificatesAction() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.transfer_certificates ORDER BY created_at DESC
    `);

    const certificates = res.rows.map((r: any) => ({
      ...r,
      dob: safeDateStr(r.dob),
      admission_date: safeDateStr(r.admission_date),
      withdrawal_date: safeDateStr(r.withdrawal_date),
      issue_date: safeDateStr(r.issue_date),
      created_at: safeDateStr(r.created_at)
    }));

    const counts = {
      totalIssued: certificates.filter((c: any) => c.status === 'ISSUED').length,
      totalPending: certificates.filter((c: any) => c.status === 'PENDING_CLEARANCE').length,
      totalCount: certificates.length
    };

    return { success: true, certificates, counts };
  } catch (error: any) {
    return { success: false, error: error.message, certificates: [], counts: { totalIssued: 0, totalPending: 0, totalCount: 0 } };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. ISSUE NEW TRANSFER CERTIFICATE
// -------------------------------------------------------------
export async function generateOfficialTransferCertificateAction(params: {
  studentAdmissionNoOrName: string;
  reasonForLeaving: string;
  approvedBy?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { studentAdmissionNoOrName, reasonForLeaving, approvedBy = 'Principal Dr. Meenakshi Sunder' } = params;

    const stuRes = await client.query(`
      SELECT s.id, s.first_name, s.last_name, 
             COALESCE(se.admission_number, s.admission_no, 'N/A') as admission_no, 
             s.dob,
             COALESCE(se.class_name, c.grade, 'Class 1') as class_name,
             COALESCE(s.father_name, g.first_name, 'Father') as father_name,
             COALESCE(s.mother_name, 'Mother') as mother_name
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      LEFT JOIN public.student_enrollments se ON se.student_id = s.id
      LEFT JOIN public.student_guardians sg ON sg.student_id = s.id AND sg.is_primary = true
      LEFT JOIN public.guardians g ON g.id = sg.guardian_id
      WHERE s.admission_no ILIKE $1 
         OR se.admission_number ILIKE $1 
         OR s.universal_id ILIKE $1 
         OR (s.first_name || ' ' || s.last_name) ILIKE $1
      ORDER BY se.is_current DESC NULLS LAST
      LIMIT 1
    `, [studentAdmissionNoOrName]);

    if (stuRes.rows.length === 0) {
      return { success: false, error: `Student "${studentAdmissionNoOrName}" not found.` };
    }

    const stu = stuRes.rows[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const today = new Date().toISOString().split('T')[0];

    // Fetch Dynamic Institution Information
    const instRes = await client.query(`
      SELECT * FROM public.institutions
      WHERE code = $1 OR status = 'ACTIVE'
      ORDER BY created_at ASC
      LIMIT 1
    `, [stu.admission_no?.startsWith('AS') ? 'AS' : stu.admission_no?.startsWith('AVM') ? 'AVM' : stu.admission_no?.startsWith('CBPS') ? 'CBPS' : 'CBS']);
    const instData = instRes.rows[0];
    const instCode = instData?.code || 'CBS';
    const schoolName = instData?.name || 'School Name';
    const schoolIdNo = instData?.school_id_number || '2730891';
    const udiseCode = instData?.udise_code || '07010203401';

    const tcNo = `TC-${instCode}-2026-${randomSuffix}`;
    const refNo = `REF/VET/2026/${randomSuffix}`;

    const insertRes = await client.query(`
      INSERT INTO public.transfer_certificates (
        student_id, tc_number, ref_number, institution_code, school_name,
        school_id_number, udise_code, student_name, father_name,
        mother_name, dob, admission_no, admission_date,
        class_admitted, class_last_attended, section_last_attended,
        pen_no, withdrawal_date, issue_date, dues_paid,
        last_session_attended, total_attendance, student_attendance,
        annual_result, reason_for_leaving, status, accounts_clearance,
        library_clearance, transport_clearance, academic_clearance,
        approved_by, created_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, '2023-04-01',
        'Class 1', $13, 'A',
        'PEN-2026-9901', $14, $14, true,
        '2026-2027', 180, 175,
        'Passed & Promoted with Grade A1', $15, 'ISSUED', true,
        true, true, true,
        $16, NOW()
      )
      RETURNING *
    `, [
      stu.id, tcNo, refNo, instCode, schoolName,
      schoolIdNo, udiseCode, `${stu.first_name} ${stu.last_name}`, stu.father_name,
      stu.mother_name, safeDateStr(stu.dob), stu.admission_no, stu.class_name,
      today, reasonForLeaving, approvedBy
    ]);

    // Update Student Status to TRANSFERRED and deactivate current enrollment
    await client.query(`
      UPDATE public.students
      SET status = 'TRANSFERRED', updated_at = NOW()
      WHERE id = $1
    `, [stu.id]);

    await client.query(`
      UPDATE public.student_enrollments
      SET enrollment_status = 'TRANSFERRED', is_current = false
      WHERE student_id = $1
    `, [stu.id]);

    safeRevalidate('/admin/transfers');
    safeRevalidate('/admin/students');

    return {
      success: true,
      message: `✓ Official Transfer Certificate #${tcNo} generated for ${stu.first_name} ${stu.last_name}! Student moved to Transferred status.`,
      tc: insertRes.rows[0]
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
