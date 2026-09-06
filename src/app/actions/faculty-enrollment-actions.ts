"use server";

import { Client } from 'pg';

const DB_CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

function getPgClient() {
  return new Client({ connectionString: DB_CONNECTION_STRING, ssl: { rejectUnauthorized: false } });
}

export interface FacultyEnrollmentInput {
  // Step 1: Personal Demographics
  firstName: string;
  middleName?: string;
  lastName: string;
  dob?: string;
  gender: string;
  bloodGroup?: string;
  panNo?: string;
  aadhaarNo?: string;
  photoUrl?: string;

  // Step 2: Institutional Assignment
  institutionCode: string; // 'CBS' | 'AVM' | 'AS' | 'CBPS'
  academicSession: string; // e.g. "YYYY-YYYY" (dynamic)
  department: string;
  designation: string;
  workloadPercentage: number;
  joiningDate: string;
  employmentType?: string; // 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'

  // Step 3: Contact & Address
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;

  // Step 4: Statutory & Payroll
  epfUanNo?: string;
  esicNo?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  salaryGrade?: string;
}

export async function enrollFacultyTransactionalAction(input: FacultyEnrollmentInput) {
  const client = getPgClient();
  let inTransaction = false;
  try {
    await client.connect();

    // 0. Resolve Campus ID from institutionCode or first campus
    const campusRes = await client.query(`
      SELECT id, code FROM public.campuses
      WHERE id::text = $1 OR code = $1
      LIMIT 1;
    `, [input.institutionCode]);
    
    let resolvedCampusId = campusRes.rows[0]?.id;
    if (!resolvedCampusId) {
      const fallbackCampus = await client.query(`SELECT id, code FROM public.campuses LIMIT 1;`);
      resolvedCampusId = fallbackCampus.rows[0]?.id || null;
    }

    await client.query('BEGIN');
    inTransaction = true;

    // 1. Check if email already exists
    const checkRes = await client.query(`
      SELECT id, first_name, last_name FROM public.staff WHERE LOWER(email) = LOWER($1);
    `, [input.email.trim()]);

    if (checkRes.rows.length > 0) {
      throw new Error(`A faculty member with email "${input.email}" is already registered (${checkRes.rows[0].first_name} ${checkRes.rows[0].last_name}).`);
    }

    const staffCountRes = await client.query(`SELECT count(*)::int as count FROM public.staff;`);
    const nextSeq = ((staffCountRes.rows[0]?.count || 0) + 1).toString().padStart(4, '0');
    const employeeCode = `FAC-${nextSeq}`;

    // 2. Insert into public.staff with campus_id foreign key
    const staffRes = await client.query(`
      INSERT INTO public.staff (
        first_name, last_name, email, phone_number, designation, department,
        campus_id, institution_code, employee_id,
        status, is_active, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE', true, NOW())
      RETURNING id;
    `, [
      input.firstName.trim(),
      input.lastName.trim(),
      input.email.trim().toLowerCase(),
      input.phone.trim(),
      input.designation,
      input.department,
      resolvedCampusId,
      input.institutionCode,
      employeeCode
    ]);
    const staffId = staffRes.rows[0].id;

    // 3. Insert into public.employee_assignments
    await client.query(`
      INSERT INTO public.employee_assignments (
        staff_id, institution_code, academic_session, designation, department,
        workload_percentage, is_primary_assignment, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, true, 'ACTIVE');
    `, [
      staffId,
      input.institutionCode,
      input.academicSession || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      input.designation,
      input.department,
      input.workloadPercentage || 100.00,
    ]);

    await client.query('COMMIT');
    inTransaction = false;

    return {
      success: true,
      staffId,
      employeeCode,
      campusId: resolvedCampusId,
      name: `${input.firstName} ${input.lastName}`,
      institutionCode: input.institutionCode,
      designation: input.designation,
    };
  } catch (error: any) {
    if (inTransaction) {
      try {
        await client.query('ROLLBACK');
      } catch (_) {}
    }
    return { success: false, error: error.message };
  } finally {
    try {
      await client.end();
    } catch (_) {}
  }
}
