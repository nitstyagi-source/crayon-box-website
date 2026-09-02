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

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

export interface UniversalStudentEnrollmentInput {
  // Step 1: Student Demographics
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodGroup?: string;
  nationality?: string;
  category?: string;
  aadhaarNo?: string;
  photoUrl?: string;
  isTestRecord?: boolean;

  // Step 2: Institutional Enrollment
  institutionCode: string; // 'CBS' | 'AVM' | 'AS' | 'CBPS'
  campusId?: string;
  academicSession: string; // '2026-2027'
  academicStage: string; // 'FOUNDATION' | 'PRIMARY' | 'MIDDLE' | 'SECONDARY' | 'SENIOR_SECONDARY'
  className: string;
  sectionName: string;
  rollNumber?: string;
  admissionNumber?: string;
  admissionDate: string;

  // Step 3: Guardian & Family
  parentName: string;
  parentRelationship: string; // 'FATHER' | 'MOTHER' | 'LEGAL_GUARDIAN'
  parentPhone: string;
  parentEmail?: string;
  parentOccupation?: string;
  parentAddress?: string;

  // Optional Secondary Guardian
  secondaryGuardianName?: string;
  secondaryGuardianRelationship?: string;
  secondaryGuardianPhone?: string;
}

// 1. Duplicate Pre-Check
export async function checkStudentDuplicateAction(firstName: string, lastName: string, dob: string, parentPhone: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    // Check existing student with same Name + DOB
    const stuRes = await client.query(`
      SELECT s.id, s.universal_id, s.first_name, s.last_name, s.dob, se.institution_code, se.class_name, se.section_name, se.admission_number
      FROM public.students s
      LEFT JOIN public.student_enrollments se ON s.id = se.student_id AND se.is_current = true
      WHERE LOWER(TRIM(s.first_name)) = LOWER(TRIM($1))
        AND LOWER(TRIM(s.last_name)) = LOWER(TRIM($2))
        AND s.dob = $3
      LIMIT 1;
    `, [firstName, lastName, dob]);

    // Check existing family / guardian by phone
    const guardRes = await client.query(`
      SELECT g.id as guardian_id, g.first_name, g.last_name, g.phone, f.id as family_id, f.family_name, f.family_code
      FROM public.guardians g
      LEFT JOIN public.families f ON g.family_id = f.id
      WHERE g.phone = $1
      LIMIT 1;
    `, [parentPhone.trim()]);

    let existingStudent = stuRes.rows.length > 0 ? stuRes.rows[0] : null;
    let existingFamily = guardRes.rows.length > 0 ? guardRes.rows[0] : null;

    return {
      success: true,
      hasDuplicateStudent: Boolean(existingStudent),
      existingStudent,
      hasExistingFamily: Boolean(existingFamily),
      existingFamily,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// 2. Transactional Universal Enrollment
export async function enrollUniversalStudentTransactionalAction(input: UniversalStudentEnrollmentInput) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start ACID Transaction

    // 1. Check or Create Family
    let familyId: string | null = null;
    let familyCode = '';
    const cleanPhone = input.parentPhone.trim();

    const existingGuardRes = await client.query(
      `SELECT g.id, g.family_id FROM public.guardians g WHERE g.phone = $1 LIMIT 1;`,
      [cleanPhone]
    );

    if (existingGuardRes.rows.length > 0 && existingGuardRes.rows[0].family_id) {
      familyId = existingGuardRes.rows[0].family_id;
    } else {
      // Create new family
      const famSeqRes = await client.query(`SELECT nextval('public.family_code_seq') as seq;`);
      const famSeq = String(famSeqRes.rows[0].seq).padStart(5, '0');
      familyCode = `FAM-VET-${famSeq}`;
      const familyName = `${input.lastName.trim()} Family`;

      const newFamRes = await client.query(`
        INSERT INTO public.families (family_code, family_name, primary_address)
        VALUES ($1, $2, $3)
        RETURNING id;
      `, [familyCode, familyName, input.parentAddress || null]);
      familyId = newFamRes.rows[0].id;
    }

    // 2. Create or Update Primary Guardian
    let primaryGuardianId: string;
    const names = input.parentName.trim().split(' ');
    const pFirst = names[0];
    const pLast = names.slice(1).join(' ') || 'Guardian';

    const guardCheck = await client.query(`SELECT id FROM public.guardians WHERE phone = $1 LIMIT 1;`, [cleanPhone]);
    if (guardCheck.rows.length > 0) {
      primaryGuardianId = guardCheck.rows[0].id;
      // Update family_id if missing
      await client.query(`UPDATE public.guardians SET family_id = $1 WHERE id = $2;`, [familyId, primaryGuardianId]);
    } else {
      const newGuardRes = await client.query(`
        INSERT INTO public.guardians (family_id, first_name, last_name, relationship, phone, email, occupation, address, is_primary_contact)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
        RETURNING id;
      `, [
        familyId,
        pFirst,
        pLast,
        input.parentRelationship || 'FATHER',
        cleanPhone,
        input.parentEmail || null,
        input.parentOccupation || null,
        input.parentAddress || null,
      ]);
      primaryGuardianId = newGuardRes.rows[0].id;
    }

    // 3. Generate Universal Student ID (STU-VET-XXXXXX)
    const stuSeqRes = await client.query(`SELECT nextval('public.student_universal_id_seq') as seq;`);
    const stuSeq = String(stuSeqRes.rows[0].seq).padStart(6, '0');
    const universalId = `STU-VET-${stuSeq}`;

    // 4. Admission Number (Manual or Auto-generated)
    const admissionNo =
      input.admissionNumber && input.admissionNumber.trim() !== ''
        ? input.admissionNumber.trim()
        : `${input.institutionCode}-${input.academicSession.split('-')[0]}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Insert Permanent Student Master
    const newStuRes = await client.query(`
      INSERT INTO public.students (
        universal_id, admission_no, first_name, middle_name, last_name,
        dob, gender, blood_group, nationality, category,
        aadhaar_no, photo_url, family_id, is_test_record, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'ACTIVE')
      RETURNING id;
    `, [
      universalId,
      admissionNo,
      input.firstName.trim(),
      input.middleName?.trim() || null,
      input.lastName.trim(),
      input.dob,
      input.gender,
      input.bloodGroup || 'O+',
      input.nationality || 'Indian',
      input.category || 'General',
      input.aadhaarNo || null,
      input.photoUrl || null,
      familyId,
      Boolean(input.isTestRecord),
    ]);
    const studentId = newStuRes.rows[0].id;

    // 6. Insert Contextual Student Enrollment
    await client.query(`
      INSERT INTO public.student_enrollments (
        student_id, institution_code, academic_session, academic_stage,
        class_name, section_name, admission_number, roll_number,
        admission_date, enrollment_status, is_current
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
    `, [
      studentId,
      input.institutionCode,
      input.academicSession,
      input.academicStage,
      input.className,
      input.sectionName,
      admissionNo,
      input.rollNumber || '1',
      input.admissionDate || new Date().toISOString().split('T')[0],
      'ACTIVE',
      true,
    ]);

    // 7. Link Guardian ↔ Student
    await client.query(`
      INSERT INTO public.student_guardians (student_id, guardian_id, is_primary)
      VALUES ($1, $2, true)
      ON CONFLICT (student_id, guardian_id) DO NOTHING;
    `, [studentId, primaryGuardianId]);

    // Commit Transaction
    await client.query('COMMIT');
    safeRevalidate('/admin/students');

    return {
      success: true,
      studentId,
      universalId,
      admissionNo,
      familyCode,
    };
  } catch (error: any) {
    await client.query('ROLLBACK'); // Rollback on any failure
    return {
      success: false,
      error: error.message,
    };
  } finally {
    client.release();
  }
}

// 3. Multi-Dimensional Filtered Query
export interface StudentFilterQuery {
  institutionCode?: string; // 'CBS' | 'AVM' | 'AS' | 'CBPS' | 'ALL'
  academicSession?: string;
  academicStage?: string;
  className?: string;
  sectionName?: string;
  status?: string; // 'ACTIVE' | 'ARCHIVED_HUB' | 'TRANSFERRED' | 'WITHDRAWN' | 'ARCHIVED' | 'ALL'
  search?: string;
  showTestRecords?: boolean;
}

export async function getFilteredUniversalStudentsAction(filters: StudentFilterQuery) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    let query = `
      SELECT 
        s.id,
        s.universal_id,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.dob,
        s.gender,
        s.blood_group,
        s.photo_url,
        s.is_test_record,
        COALESCE(s.status, se.enrollment_status, 'ACTIVE') as student_status,
        s.created_at,
        se.id as enrollment_id,
        COALESCE(se.institution_code, 'CBS') as institution_code,
        COALESCE(se.academic_session, '2026-2027') as academic_session,
        COALESCE(se.academic_stage, 'PRIMARY') as academic_stage,
        COALESCE(se.class_name, 'Class 1') as class_name,
        COALESCE(se.section_name, 'A') as section_name,
        COALESCE(se.admission_number, s.admission_no, 'N/A') as admission_number,
        COALESCE(se.roll_number, '1') as roll_number,
        COALESCE(se.enrollment_status, s.status, 'ACTIVE') as enrollment_status,
        g.first_name as guardian_first,
        g.last_name as guardian_last,
        g.phone as guardian_phone,
        f.family_name,
        tc.tc_number,
        tc.issue_date as tc_issue_date,
        tc.reason_for_leaving as tc_reason,
        COALESCE(led.total_debit, 0) - COALESCE(led.total_credit, 0) as pending_balance
      FROM public.students s
      LEFT JOIN LATERAL (
        SELECT *
        FROM public.student_enrollments
        WHERE student_id = s.id
        ORDER BY is_current DESC, created_at DESC
        LIMIT 1
      ) se ON true
      LEFT JOIN public.student_guardians sg ON s.id = sg.student_id AND sg.is_primary = true
      LEFT JOIN public.guardians g ON sg.guardian_id = g.id
      LEFT JOIN public.families f ON s.family_id = f.id
      LEFT JOIN LATERAL (
        SELECT tc_number, issue_date, reason_for_leaving
        FROM public.transfer_certificates
        WHERE student_id = s.id
        ORDER BY created_at DESC
        LIMIT 1
      ) tc ON true
      LEFT JOIN LATERAL (
        SELECT 
          SUM(debit) as total_debit,
          SUM(credit) as total_credit
        FROM public.student_fee_ledgers
        WHERE student_id = s.id
      ) led ON true
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by School
    if (filters.institutionCode && filters.institutionCode !== 'ALL') {
      query += ` AND (se.institution_code = $${paramIndex++} OR (se.institution_code IS NULL AND $${paramIndex - 1} = 'CBS'))`;
      params.push(filters.institutionCode);
    }

    // Filter by Session
    if (filters.academicSession && filters.academicSession !== 'ALL') {
      query += ` AND (se.academic_session = $${paramIndex++} OR se.academic_session IS NULL)`;
      params.push(filters.academicSession);
    }

    // Filter by Stage
    if (filters.academicStage && filters.academicStage !== 'ALL') {
      query += ` AND se.academic_stage = $${paramIndex++}`;
      params.push(filters.academicStage);
    }

    // Filter by Class
    if (filters.className && filters.className !== 'ALL') {
      query += ` AND (se.class_name = $${paramIndex++} OR se.class_name ILIKE $${paramIndex - 1})`;
      params.push(filters.className);
    }

    // Filter by Section
    if (filters.sectionName && filters.sectionName !== 'ALL') {
      query += ` AND se.section_name = $${paramIndex++}`;
      params.push(filters.sectionName);
    }

    // Filter by Status
    if (filters.status === 'ACTIVE' || !filters.status) {
      // Strictly exclude transferred, archived, or inactive students from the active list
      query += ` AND (UPPER(TRIM(COALESCE(s.status, 'ACTIVE'))) = 'ACTIVE' OR (s.status IS NULL AND (UPPER(TRIM(COALESCE(se.enrollment_status, 'ACTIVE'))) = 'ACTIVE' OR se.enrollment_status IS NULL)))
                 AND (UPPER(TRIM(COALESCE(s.status, 'ACTIVE'))) NOT IN ('TRANSFERRED', 'ARCHIVED', 'WITHDRAWN', 'INACTIVE') OR s.status IS NULL)`;
    } else if (filters.status === 'ARCHIVED_HUB') {
      // Unified head for all inactive / departed students
      query += ` AND (
        UPPER(TRIM(s.status)) IN ('TRANSFERRED', 'ARCHIVED', 'WITHDRAWN', 'INACTIVE') 
        OR (UPPER(TRIM(s.status)) != 'ACTIVE' AND (UPPER(TRIM(se.enrollment_status)) IN ('TRANSFERRED', 'ARCHIVED', 'WITHDRAWN', 'INACTIVE') OR tc.tc_number IS NOT NULL))
      )`;
    } else if (filters.status === 'TRANSFERRED') {
      query += ` AND (UPPER(TRIM(s.status)) = 'TRANSFERRED' OR (UPPER(TRIM(s.status)) != 'ACTIVE' AND (UPPER(TRIM(se.enrollment_status)) = 'TRANSFERRED' OR tc.tc_number IS NOT NULL)))`;
    } else if (filters.status === 'ARCHIVED') {
      query += ` AND (UPPER(TRIM(s.status)) = 'ARCHIVED' OR (UPPER(TRIM(s.status)) != 'ACTIVE' AND UPPER(TRIM(se.enrollment_status)) = 'ARCHIVED'))`;
    } else if (filters.status === 'WITHDRAWN') {
      query += ` AND (UPPER(TRIM(s.status)) = 'WITHDRAWN' OR (UPPER(TRIM(s.status)) != 'ACTIVE' AND UPPER(TRIM(se.enrollment_status)) = 'WITHDRAWN'))`;
    } else if (filters.status !== 'ALL') {
      query += ` AND (UPPER(TRIM(se.enrollment_status)) = UPPER(TRIM($${paramIndex})) OR UPPER(TRIM(s.status)) = UPPER(TRIM($${paramIndex})))`;
      params.push(filters.status);
      paramIndex++;
    }

    // Filter Test Records
    if (!filters.showTestRecords) {
      query += ` AND (s.is_test_record = false OR s.is_test_record IS NULL)`;
    }

    // Search Query (Name, Universal ID, Admission No, Parent Phone, TC No)
    if (filters.search && filters.search.trim() !== '') {
      const term = `%${filters.search.trim()}%`;
      query += ` AND (
        s.first_name ILIKE $${paramIndex}
        OR s.last_name ILIKE $${paramIndex}
        OR (s.first_name || ' ' || s.last_name) ILIKE $${paramIndex}
        OR s.universal_id ILIKE $${paramIndex}
        OR s.admission_no ILIKE $${paramIndex}
        OR se.admission_number ILIKE $${paramIndex}
        OR g.phone ILIKE $${paramIndex}
        OR tc.tc_number ILIKE $${paramIndex}
      )`;
      params.push(term);
      paramIndex++;
    }

    query += ` ORDER BY s.created_at DESC, s.first_name ASC;`;

    const res = await client.query(query, params);

    // Compute Summary Counts across the scope
    const countsRes = await client.query(`
      SELECT 
        COUNT(*) as total_all,
        COUNT(*) FILTER (WHERE (UPPER(TRIM(COALESCE(status, 'ACTIVE'))) = 'ACTIVE' OR status IS NULL) AND UPPER(TRIM(COALESCE(status, 'ACTIVE'))) NOT IN ('TRANSFERRED', 'ARCHIVED', 'WITHDRAWN')) as total_active,
        COUNT(*) FILTER (WHERE UPPER(TRIM(status)) IN ('TRANSFERRED', 'ARCHIVED', 'WITHDRAWN') OR id IN (SELECT student_id FROM public.transfer_certificates)) as total_archived_hub,
        COUNT(*) FILTER (WHERE UPPER(TRIM(status)) = 'TRANSFERRED' OR id IN (SELECT student_id FROM public.transfer_certificates)) as total_transferred,
        COUNT(*) FILTER (WHERE UPPER(TRIM(status)) = 'WITHDRAWN') as total_withdrawn,
        COUNT(*) FILTER (WHERE UPPER(TRIM(status)) = 'ARCHIVED') as total_archived
      FROM public.students;
    `);

    const counts = countsRes.rows[0] ? {
      totalAll: parseInt(countsRes.rows[0].total_all, 10) || 0,
      totalActive: parseInt(countsRes.rows[0].total_active, 10) || 0,
      totalArchivedHub: parseInt(countsRes.rows[0].total_archived_hub, 10) || 0,
      totalTransferred: parseInt(countsRes.rows[0].total_transferred, 10) || 0,
      totalWithdrawn: parseInt(countsRes.rows[0].total_withdrawn, 10) || 0,
      totalArchived: parseInt(countsRes.rows[0].total_archived, 10) || 0,
    } : {
      totalAll: 0, totalActive: 0, totalArchivedHub: 0, totalTransferred: 0, totalWithdrawn: 0, totalArchived: 0
    };

    const serializedRows = res.rows.map((row: any) => {
      let subStatus = 'ACTIVE';
      if (row.student_status === 'ACTIVE' || (row.student_status !== 'TRANSFERRED' && row.student_status !== 'WITHDRAWN' && row.student_status !== 'ARCHIVED' && row.enrollment_status === 'ACTIVE')) {
        subStatus = 'ACTIVE';
      } else if (row.student_status === 'TRANSFERRED' || row.enrollment_status === 'TRANSFERRED' || row.tc_number) {
        subStatus = 'TRANSFERRED';
      } else if (row.student_status === 'WITHDRAWN' || row.enrollment_status === 'WITHDRAWN') {
        subStatus = 'WITHDRAWN';
      } else if (row.student_status === 'ARCHIVED' || row.enrollment_status === 'ARCHIVED') {
        subStatus = 'ARCHIVED';
      }

      return {
        ...row,
        subStatus,
        pending_balance: Number(row.pending_balance || 0),
        dob: row.dob instanceof Date ? row.dob.toISOString().split('T')[0] : (row.dob ? String(row.dob).split('T')[0] : null),
        admission_date: row.admission_date instanceof Date ? row.admission_date.toISOString().split('T')[0] : (row.admission_date ? String(row.admission_date).split('T')[0] : null),
        tc_issue_date: row.tc_issue_date instanceof Date ? row.tc_issue_date.toISOString().split('T')[0] : (row.tc_issue_date ? String(row.tc_issue_date).split('T')[0] : null),
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
        updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
      };
    });

    return { success: true, data: serializedRows, counts };
  } catch (error: any) {
    return { success: false, error: error.message, data: [], counts: { totalAll: 0, totalActive: 0, totalArchivedHub: 0, totalTransferred: 0, totalWithdrawn: 0, totalArchived: 0 } };
  } finally {
    client.release();
  }
}

// 4. Delete Test Student with Transactional Cleanup
export async function deleteTestStudentTransactionalAction(studentId: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get linked family and guardian
    const stuRes = await client.query(`SELECT family_id FROM public.students WHERE id = $1;`, [studentId]);
    const familyId = stuRes.rows[0]?.family_id;

    // Delete student (cascades to enrollments, attendance, student_guardians)
    await client.query(`DELETE FROM public.students WHERE id = $1;`, [studentId]);

    // Check if family has any other students
    if (familyId) {
      const famCheck = await client.query(`SELECT count(*) FROM public.students WHERE family_id = $1;`, [familyId]);
      if (parseInt(famCheck.rows[0].count, 10) === 0) {
        await client.query(`DELETE FROM public.guardians WHERE family_id = $1;`, [familyId]);
        await client.query(`DELETE FROM public.families WHERE id = $1;`, [familyId]);
      }
    }

    await client.query('COMMIT');
    safeRevalidate('/admin/students');
    return { success: true };
  } catch (error: any) {
    await client.query('ROLLBACK');
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// 5. Archive / Deactivate Student (Production Safe)
export async function archiveStudentAction(studentId: string, reason: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE public.students SET status = 'ARCHIVED', updated_at = NOW() WHERE id = $1;
      UPDATE public.student_enrollments SET enrollment_status = 'ARCHIVED', is_current = false WHERE student_id = $1;
    `, [studentId]);
    safeRevalidate('/admin/students');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// 6. Re-Admit / Restore Departed Student with Multi-Period Enrollment Tracking
export async function readmitStudentAction(params: {
  studentId: string;
  institutionCode: string;
  academicSession: string;
  className: string;
  sectionName?: string;
  academicStage?: string;
  admissionNumber?: string;
  admissionDate?: string;
  remarks?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const {
      studentId,
      institutionCode,
      academicSession,
      className,
      sectionName = 'A',
      academicStage = 'PRIMARY',
      admissionNumber,
      admissionDate = new Date().toISOString().split('T')[0],
      remarks = 'Student re-admitted to active roster.'
    } = params;

    await client.query('BEGIN');

    // 1. Fetch current student record
    const stuRes = await client.query(`
      SELECT id, first_name, last_name, admission_no, status
      FROM public.students
      WHERE id = $1;
    `, [studentId]);

    if (stuRes.rows.length === 0) {
      throw new Error(`Student not found with ID ${studentId}`);
    }

    const student = stuRes.rows[0];
    const finalAdmissionNo = admissionNumber?.trim() || student.admission_no || `${institutionCode}-${academicSession.slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Mark all existing enrollment records for this student as historical (is_current = false)
    await client.query(`
      UPDATE public.student_enrollments
      SET is_current = false
      WHERE student_id = $1;
    `, [studentId]);

    // 3. Create a NEW enrollment record for this new enrollment period
    await client.query(`
      INSERT INTO public.student_enrollments (
        student_id, institution_code, academic_session, academic_stage,
        class_name, section_name, admission_number, admission_date,
        enrollment_status, is_current, created_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        'ACTIVE', true, NOW()
      );
    `, [
      studentId,
      institutionCode.trim(),
      academicSession.trim(),
      academicStage.trim(),
      className.trim(),
      sectionName.trim(),
      finalAdmissionNo,
      admissionDate
    ]);

    // 4. Update student master record to ACTIVE status with new admission number
    await client.query(`
      UPDATE public.students
      SET status = 'ACTIVE',
          admission_no = $2,
          updated_at = NOW()
      WHERE id = $1;
    `, [studentId, finalAdmissionNo]);

    // 5. Record the progression event in student_progression timeline
    await client.query(`
      INSERT INTO public.student_progression (
        student_id, academic_session, institution_code, academic_stage,
        class_name, section_name, admission_number, start_date,
        promotion_status, remarks, created_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        'RE_ADMITTED', $9, NOW()
      );
    `, [
      studentId,
      academicSession.trim(),
      institutionCode.trim(),
      academicStage.trim(),
      className.trim(),
      sectionName.trim(),
      finalAdmissionNo,
      admissionDate,
      remarks.trim()
    ]);

    await client.query('COMMIT');

    safeRevalidate('/admin/students');
    safeRevalidate(`/admin/students/${studentId}`);
    safeRevalidate('/admin/finance/collections');
    safeRevalidate('/admin/finance/pending');
    safeRevalidate('/admin/dashboard');

    return {
      success: true,
      message: `🎉 ${student.first_name} ${student.last_name} has been successfully re-admitted to ${className} (${sectionName}) for Session ${academicSession}! Previous enrollment history is safely preserved.`,
      admissionNumber: finalAdmissionNo
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// 7. Get All Enrollment Periods with TC and Departure details
export async function getStudentEnrollmentPeriodsAction(studentId: string) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(`
      SELECT se.id, se.student_id, se.institution_code, se.academic_session,
             se.academic_stage, se.class_name, se.section_name, se.admission_number,
             se.roll_number, se.enrollment_status, se.admission_date, se.is_current,
             se.created_at,
             tc.tc_number, tc.issue_date as tc_issue_date, tc.reason_for_leaving as leaving_reason, tc.status as tc_status
      FROM public.student_enrollments se
      LEFT JOIN public.transfer_certificates tc
        ON tc.student_id = se.student_id AND tc.last_session_attended = se.academic_session
      WHERE se.student_id = $1
      ORDER BY se.created_at ASC;
    `, [studentId]);

    const periods = res.rows.map((row: any, index: number) => ({
      periodIndex: index + 1,
      ...row,
      admission_date: row.admission_date instanceof Date ? row.admission_date.toISOString().split('T')[0] : (row.admission_date ? String(row.admission_date).split('T')[0] : null),
      tc_issue_date: row.tc_issue_date instanceof Date ? row.tc_issue_date.toISOString().split('T')[0] : (row.tc_issue_date ? String(row.tc_issue_date).split('T')[0] : null),
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
    }));

    return { success: true, periods };
  } catch (error: any) {
    return { success: false, error: error.message, periods: [] };
  } finally {
    client.release();
  }
}

// 8. Get All Family Households with Linked Children
export async function getFamilyHouseholdsAction(params?: {
  search?: string;
  institutionCode?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    let query = `
      SELECT 
        g.id,
        g.first_name,
        g.last_name,
        g.relationship,
        g.phone,
        g.email,
        g.occupation,
        g.address,
        g.is_primary_contact,
        g.created_at,
        f.id as family_id,
        f.family_code,
        f.family_name,
        f.primary_address,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'universal_id', s.universal_id,
              'first_name', s.first_name,
              'last_name', s.last_name,
              'dob', s.dob,
              'photo_url', s.photo_url,
              'status', s.status,
              'admission_no', COALESCE(se.admission_number, s.admission_no),
              'class_name', se.class_name,
              'section_name', se.section_name,
              'institution_code', COALESCE(se.institution_code, 'CBS'),
              'academic_stage', se.academic_stage
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) as children
      FROM public.guardians g
      LEFT JOIN public.families f ON g.family_id = f.id
      LEFT JOIN public.student_guardians sg ON g.id = sg.guardian_id
      LEFT JOIN public.students s ON sg.student_id = s.id
      LEFT JOIN LATERAL (
        SELECT institution_code, class_name, section_name, academic_stage, admission_number
        FROM public.student_enrollments
        WHERE student_id = s.id AND is_current = true
        ORDER BY created_at DESC
        LIMIT 1
      ) se ON true
      WHERE 1=1
    `;

    const sqlParams: any[] = [];
    let pIdx = 1;

    if (params?.search && params.search.trim() !== '') {
      const term = `%${params.search.trim()}%`;
      query += ` AND (
        g.first_name ILIKE $${pIdx} OR 
        g.last_name ILIKE $${pIdx} OR 
        g.phone ILIKE $${pIdx} OR 
        g.email ILIKE $${pIdx} OR 
        f.family_name ILIKE $${pIdx} OR 
        f.family_code ILIKE $${pIdx} OR
        s.first_name ILIKE $${pIdx} OR
        s.last_name ILIKE $${pIdx}
      )`;
      sqlParams.push(term);
      pIdx++;
    }

    if (params?.institutionCode && params.institutionCode !== 'ALL') {
      query += ` AND (se.institution_code = $${pIdx} OR se.institution_code IS NULL)`;
      sqlParams.push(params.institutionCode);
      pIdx++;
    }

    query += `
      GROUP BY g.id, f.id
      ORDER BY g.created_at DESC;
    `;

    const res = await client.query(query, sqlParams);

    return {
      success: true,
      data: res.rows || [],
      totalCount: res.rows.length,
    };
  } catch (error: any) {
    console.error('Error in getFamilyHouseholdsAction:', error);
    return { success: false, error: error.message, data: [] };
  } finally {
    client.release();
  }
}

