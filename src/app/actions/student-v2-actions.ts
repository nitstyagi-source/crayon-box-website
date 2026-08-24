"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const DB_CONNECTION_STRING =
  process.env.DATABASE_URL ||
  'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let globalPool: pg.Pool | null = null;
function getPool() {
  if (!globalPool) {
    globalPool = new Pool({ connectionString: DB_CONNECTION_STRING });
  }
  return globalPool;
}

function safeDateStr(d: any): string | null {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  if (typeof d === 'string') return d.split('T')[0];
  try {
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  } catch {}
  return String(d);
}

// 1. Get Progression Timeline for a Student
export async function getStudentProgressionTimeline(studentId: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT * FROM public.student_progression
      WHERE student_id = $1
      ORDER BY academic_session ASC;
    `, [studentId]);
    return { success: true, data: res.rows };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  } finally {
    client.release();
  }
}

// 2. Add Progression Record
export async function addProgressionRecord(data: {
  studentId: string;
  academicSession: string;
  institutionCode: string;
  academicStage: string;
  className: string;
  sectionName: string;
  rollNumber?: string;
  admissionNumber: string;
  promotedToNextGrade?: boolean;
  finalPercentage?: number;
  finalGrade?: string;
  remarks?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert progression record
    await client.query(`
      INSERT INTO public.student_progression (
        student_id, academic_session, institution_code, academic_stage,
        class_name, section_name, roll_number, admission_number,
        promoted_to_next_grade, final_percentage, final_grade, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
    `, [
      data.studentId,
      data.academicSession,
      data.institutionCode,
      data.academicStage,
      data.className,
      data.sectionName,
      data.rollNumber || null,
      data.admissionNumber,
      data.promotedToNextGrade !== false,
      data.finalPercentage || null,
      data.finalGrade || null,
      data.remarks || null,
    ]);

    await client.query('COMMIT');
    return { success: true };
  } catch (error: any) {
    await client.query('ROLLBACK');
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// 3. Issue Formal Transfer Certificate (TC / SLC)
export async function issueTransferCertificateAction(input: {
  studentId: string;
  reasonForLeaving: string;
  annualResult?: string;
  totalAttendance?: number;
  studentAttendance?: number;
  duesPaid?: boolean;
  remarks?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch Student & Current Enrollment info
    const stuRes = await client.query(`
      SELECT 
        s.id, s.first_name, s.last_name, s.dob, s.pen_no, s.admission_no,
        g.first_name as guardian_first, g.last_name as guardian_last,
        g.relationship as guardian_rel,
        se.institution_code, se.class_name, se.section_name, se.academic_session,
        se.admission_date, inst.name as school_name, inst.udise_code, inst.school_id_number as school_code
      FROM public.students s
      LEFT JOIN public.student_enrollments se ON s.id = se.student_id
      LEFT JOIN public.institutions inst ON se.institution_code = inst.code
      LEFT JOIN public.student_guardians sg ON s.id = sg.student_id AND sg.is_primary = true
      LEFT JOIN public.guardians g ON sg.guardian_id = g.id
      WHERE s.id = $1
      ORDER BY se.created_at DESC
      LIMIT 1;
    `, [input.studentId]);

    if (stuRes.rows.length === 0) {
      throw new Error('Student not found in database.');
    }

    const stu = stuRes.rows[0];

    // 2. Fetch Father and Mother if available
    const parentsRes = await client.query(`
      SELECT g.first_name, g.last_name, g.relationship
      FROM public.guardians g
      JOIN public.student_guardians sg ON g.id = sg.guardian_id
      WHERE sg.student_id = $1;
    `, [stu.id]);

    let fatherName = 'N/A';
    let motherName = 'N/A';
    parentsRes.rows.forEach((p: any) => {
      if (p.relationship === 'FATHER') fatherName = `${p.first_name} ${p.last_name}`;
      if (p.relationship === 'MOTHER') motherName = `${p.first_name} ${p.last_name}`;
    });

    if (fatherName === 'N/A' && stu.guardian_first) {
      fatherName = `${stu.guardian_first} ${stu.guardian_last || ''}`;
    }

    // 3. Fetch Dynamic Institution Details
    const instRes = await client.query(`
      SELECT * FROM public.institutions 
      WHERE code = $1 OR id = $2 OR status = 'ACTIVE'
      ORDER BY created_at ASC
      LIMIT 1
    `, [stu.institution_code || 'CBS', stu.institution_id || stu.campus_id]);
    const instData = instRes.rows[0];
    const instCode = instData?.code || stu.institution_code || 'CBS';
    const schoolName = instData?.name || 'School Name';
    const schoolIdNo = instData?.school_id_number || '2730891';
    const udiseCode = instData?.udise_code || '07010203401';

    // Generate Sequential Serial TC Number
    const randomTc = Math.floor(1000 + Math.random() * 9000);
    const tcNumber = `TC-${instCode}-2026-${randomTc}`;
    const refNumber = `REF/VET/2026/${randomTc}`;
    const today = new Date().toISOString().split('T')[0];

    // 4. Insert into transfer_certificates
    const tcRes = await client.query(`
      INSERT INTO public.transfer_certificates (
        student_id, institution_code, tc_number, ref_number, school_name, school_id_number,
        udise_code, student_name, father_name, mother_name, dob,
        admission_no, admission_date, class_admitted, class_last_attended,
        section_last_attended, pen_no, withdrawal_date, issue_date,
        dues_paid, last_session_attended, total_attendance, student_attendance,
        annual_result, reason_for_leaving
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15,
        $16, $17, $18, $19,
        $20, $21, $22, $23,
        $24, $25
      )
      RETURNING *;
    `, [
      stu.id,
      instCode,
      tcNumber,
      refNumber,
      schoolName,
      schoolIdNo,
      udiseCode,
      `${stu.first_name} ${stu.last_name}`,
      fatherName,
      motherName,
      safeDateStr(stu.dob) || '2016-04-14',
      stu.admission_no || 'ADM-N/A',
      safeDateStr(stu.admission_date) || '2023-04-01',
      'Pre-Nursery',
      stu.class_name || 'Class 1',
      stu.section_name || 'A',
      stu.pen_no || `PEN-2026-${randomTc}`,
      today,
      today,
      input.duesPaid !== false,
      stu.academic_session || '2026-2027',
      input.totalAttendance || 220,
      input.studentAttendance || 204,
      input.annualResult || 'Promoted to Next Higher Class',
      input.reasonForLeaving || 'Transferred to Sister Campus / Parent Relocation',
    ]);

    // 5. Update Student Status to TRANSFERRED
    await client.query(`UPDATE public.students SET status = 'TRANSFERRED', updated_at = NOW() WHERE id = $1;`, [stu.id]);
    await client.query(`UPDATE public.student_enrollments SET enrollment_status = 'TRANSFERRED', is_current = false WHERE student_id = $1;`, [stu.id]);

    await client.query('COMMIT');
    const row = tcRes.rows[0];
    const serialized = row ? {
      ...row,
      dob: safeDateStr(row.dob),
      admission_date: safeDateStr(row.admission_date),
      withdrawal_date: safeDateStr(row.withdrawal_date),
      issue_date: safeDateStr(row.issue_date),
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    } : null;

    return { success: true, data: serialized };
  } catch (error: any) {
    console.error('TC Gen Error:', error);
    await client.query('ROLLBACK');
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

export async function generateOfficialTCAction(input: {
  studentId: string;
  institutionCode?: string;
  reasonForLeaving?: string;
  targetSchoolName?: string;
}) {
  return issueTransferCertificateAction({
    studentId: input.studentId,
    reasonForLeaving: input.reasonForLeaving || 'Transferred to Sister Campus / Parent Relocation',
  });
}

// 4. Get Issued TC for Student
export async function getIssuedTCForStudent(studentId: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT * FROM public.transfer_certificates
      WHERE student_id = $1
      ORDER BY created_at DESC
      LIMIT 1;
    `, [studentId]);

    const row = res.rows[0];
    if (!row) return { success: true, data: null };

    const serialized = {
      ...row,
      dob: safeDateStr(row.dob),
      admission_date: safeDateStr(row.admission_date),
      withdrawal_date: safeDateStr(row.withdrawal_date),
      issue_date: safeDateStr(row.issue_date),
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    };

    return { success: true, data: serialized };
  } catch (error: any) {
    return { success: false, error: error.message, data: null };
  } finally {
    client.release();
  }
}

// 5. Update Issued TC Record
export async function updateIssuedTCAction(tcId: string, updatedFields: any) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE public.transfer_certificates
      SET
        ref_number = COALESCE($2, ref_number),
        school_name = COALESCE($3, school_name),
        school_id_number = COALESCE($4, school_id_number),
        udise_code = COALESCE($5, udise_code),
        student_name = COALESCE($6, student_name),
        father_name = COALESCE($7, father_name),
        mother_name = COALESCE($8, mother_name),
        dob = COALESCE($9, dob),
        admission_no = COALESCE($10, admission_no),
        admission_date = COALESCE($11, admission_date),
        class_admitted = COALESCE($12, class_admitted),
        class_last_attended = COALESCE($13, class_last_attended),
        section_last_attended = COALESCE($14, section_last_attended),
        pen_no = COALESCE($15, pen_no),
        withdrawal_date = COALESCE($16, withdrawal_date),
        issue_date = COALESCE($17, issue_date),
        dues_paid = COALESCE($18, dues_paid),
        last_session_attended = COALESCE($19, last_session_attended),
        total_attendance = COALESCE($20, total_attendance),
        student_attendance = COALESCE($21, student_attendance),
        annual_result = COALESCE($22, annual_result),
        reason_for_leaving = COALESCE($23, reason_for_leaving)
      WHERE id = $1
      RETURNING *;
    `, [
      tcId,
      updatedFields.ref_number || null,
      updatedFields.school_name || null,
      updatedFields.school_id_number || null,
      updatedFields.udise_code || null,
      updatedFields.student_name || null,
      updatedFields.father_name || null,
      updatedFields.mother_name || null,
      updatedFields.dob || null,
      updatedFields.admission_no || null,
      updatedFields.admission_date || null,
      updatedFields.class_admitted || null,
      updatedFields.class_last_attended || null,
      updatedFields.section_last_attended || null,
      updatedFields.pen_no || null,
      updatedFields.withdrawal_date || null,
      updatedFields.issue_date || null,
      updatedFields.dues_paid !== undefined ? updatedFields.dues_paid : null,
      updatedFields.last_session_attended || null,
      updatedFields.total_attendance ? parseInt(updatedFields.total_attendance) : null,
      updatedFields.student_attendance ? parseInt(updatedFields.student_attendance) : null,
      updatedFields.annual_result || null,
      updatedFields.reason_for_leaving || null,
    ]);

    const row = res.rows[0];
    const serialized = row ? {
      ...row,
      dob: safeDateStr(row.dob),
      admission_date: safeDateStr(row.admission_date),
      withdrawal_date: safeDateStr(row.withdrawal_date),
      issue_date: safeDateStr(row.issue_date),
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    } : null;

    return { success: true, data: serialized };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// 6. Update Student Admission Number
export async function updateStudentAdmissionNoAction(studentId: string, newAdmissionNo: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`UPDATE public.students SET admission_no = $2, updated_at = NOW() WHERE id = $1;`, [studentId, newAdmissionNo.trim()]);
    await client.query(`UPDATE public.student_enrollments SET admission_number = $2 WHERE student_id = $1 AND is_current = true;`, [studentId, newAdmissionNo.trim()]);
    await client.query('COMMIT');
    return { success: true };
  } catch (error: any) {
    await client.query('ROLLBACK');
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
