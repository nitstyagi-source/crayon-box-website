"use server";

import pg from 'pg';
import { erpAuditEngine } from '@/lib/core/audit/audit-engine';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export async function getStudentMasterWithEnrollments(studentUuid: string) {
  const p = getPool();
  const client = await p.connect();
  try {
    const stuRes = await client.query(`
      SELECT * FROM public.students 
      WHERE id::text = $1 OR universal_id = $1
      LIMIT 1;
    `, [studentUuid]);

    if (stuRes.rows.length === 0) {
      return { success: false, message: 'Student master record not found' };
    }

    const stu = stuRes.rows[0];
    const enrRes = await client.query(`
      SELECT * FROM public.student_enrollments
      WHERE student_id = $1
      ORDER BY created_at DESC;
    `, [stu.id]);

    const enrollments = enrRes.rows.map((e: any) => ({
      id: e.id,
      studentUuid: stu.id,
      legalEntityId: 'leg-vet-main',
      institutionId: e.institution_id || e.institution_code,
      institutionCode: e.institution_code || 'CBS',
      campusId: e.campus_id || 'cmp-cbs-spe',
      academicSessionId: e.academic_session || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      admissionNumber: e.admission_number || stu.admission_no || '',
      gradeLevel: e.class_name,
      section: e.section_name,
      rollNumber: e.roll_number || '',
      enrollmentDate: e.enrollment_date || e.created_at,
      status: e.status === 'ACTIVE' ? 'ENROLLED_ACTIVE' : (e.status || 'ENROLLED_ACTIVE')
    }));

    const master = {
      uuid: stu.id,
      firstName: stu.first_name,
      lastName: stu.last_name || '',
      dob: stu.dob ? (stu.dob instanceof Date ? stu.dob.toISOString().split('T')[0] : stu.dob) : '',
      gender: stu.gender || 'Not Specified',
      bloodGroup: stu.blood_group || '',
      aadhaarNumberMasked: stu.aadhaar_no ? `XXXX-XXXX-${stu.aadhaar_no.slice(-4)}` : '',
      parentFamilyId: stu.family_id || '',
      createdAt: stu.created_at
    };

    const activeEnrollment = enrollments.find((e: any) => e.status === 'ENROLLED_ACTIVE' || e.status === 'ACTIVE') || enrollments[0] || null;

    return {
      success: true,
      data: {
        master,
        activeEnrollment,
        enrollmentHistory: enrollments
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

export async function executeInternalTrustTransferAction(params: {
  studentUuid: string;
  targetInstitutionId: string;
  targetInstitutionCode: string;
  targetCampusId: string;
  targetGrade: string;
  targetSection: string;
  transferReason: string;
  actor: { userId: string; name: string; role: string };
}) {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch Student & Current Active Enrollment
    const stuRes = await client.query(`
      SELECT * FROM public.students WHERE id::text = $1 OR universal_id = $1 LIMIT 1;
    `, [params.studentUuid]);
    if (stuRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, message: 'Student record not found for transfer' };
    }
    const student = stuRes.rows[0];

    const enrRes = await client.query(`
      SELECT * FROM public.student_enrollments 
      WHERE student_id = $1 AND (status = 'ACTIVE' OR status = 'ENROLLED_ACTIVE')
      ORDER BY created_at DESC LIMIT 1;
    `, [student.id]);

    const currentEnrollment = enrRes.rows[0];

    // 2. Mark previous enrollment as TRANSFERRED_OUT if exists
    if (currentEnrollment) {
      await client.query(`
        UPDATE public.student_enrollments
        SET status = 'TRANSFERRED_OUT', updated_at = NOW()
        WHERE id = $1;
      `, [currentEnrollment.id]);
    }

    // 3. Generate new admission number
    const enrCountRes = await client.query(`SELECT count(*)::int as count FROM public.student_enrollments;`);
    const curYear = new Date().getFullYear();
    const curSession = `${curYear}-${curYear + 1}`;
    const nextEnrSeq = String((enrCountRes.rows[0]?.count || 0) + 1).padStart(4, '0');
    const newAdmNo = `${params.targetInstitutionCode}-${curYear}-${nextEnrSeq}`;

    // 4. Insert new enrollment
    const newEnrRes = await client.query(`
      INSERT INTO public.student_enrollments (
        student_id, institution_code, academic_session, class_name, 
        section_name, admission_number, status, remarks
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'ACTIVE', $7
      ) RETURNING *;
    `, [
      student.id,
      params.targetInstitutionCode,
      curSession,
      params.targetGrade,
      params.targetSection,
      newAdmNo,
      `Internal Trust Transfer: ${params.transferReason}`
    ]);

    const newEnrollment = newEnrRes.rows[0];

    // 5. Update student master status & admission_no
    await client.query(`
      UPDATE public.students
      SET status = 'ACTIVE', admission_no = $1, updated_at = NOW()
      WHERE id = $2;
    `, [newAdmNo, student.id]);

    await client.query('COMMIT');

    // Audit the internal transfer
    erpAuditEngine.log({
      trustId: 'org-vani-trust',
      legalEntityId: 'leg-vet-main',
      institutionId: currentEnrollment?.institution_code || 'CBS',
      campusId: params.targetCampusId || 'cmp-cbs-spe',
      sessionId: curSession,
      actor: {
        userId: params.actor.userId,
        name: params.actor.name,
        role: params.actor.role,
        scope: 'TRUST',
        ipAddress: '127.0.0.1',
      },
      action: 'TRANSFER',
      entityType: 'STUDENT_ENROLLMENT',
      entityId: newEnrollment.id,
      description: `Internal Trust Transfer executed from ${currentEnrollment?.institution_code || 'Previous Campus'} to ${params.targetInstitutionCode} (${params.transferReason})`,
      previousState: currentEnrollment,
      newState: newEnrollment,
    });

    return {
      success: true,
      message: `Student successfully transferred to ${params.targetInstitutionCode} with Admission #${newAdmNo}`,
      data: { previousEnrollment: currentEnrollment, newEnrollment }
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
