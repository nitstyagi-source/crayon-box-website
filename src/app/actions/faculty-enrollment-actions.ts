"use server";

import { Client } from 'pg';

const DB_CONNECTION_STRING =
  process.env.DATABASE_URL ||
  'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

function getPgClient() {
  return new Client({ connectionString: DB_CONNECTION_STRING });
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
  academicSession: string; // '2026-2027'
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
  try {
    await client.connect();
    await client.query('BEGIN');

    // 1. Check if email already exists
    const checkRes = await client.query(`
      SELECT id, first_name, last_name FROM public.staff WHERE LOWER(email) = LOWER($1);
    `, [input.email.trim()]);

    if (checkRes.rows.length > 0) {
      throw new Error(`A faculty member with email "${input.email}" is already registered (${checkRes.rows[0].first_name} ${checkRes.rows[0].last_name}).`);
    }

    // 2. Insert into public.staff
    const staffRes = await client.query(`
      INSERT INTO public.staff (
        first_name, last_name, email, phone_number, designation, department,
        status, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', true)
      RETURNING id;
    `, [
      input.firstName.trim(),
      input.lastName.trim(),
      input.email.trim().toLowerCase(),
      input.phone.trim(),
      input.designation,
      input.department,
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
      input.academicSession || '2026-2027',
      input.designation,
      input.department,
      input.workloadPercentage || 100.00,
    ]);

    await client.query('COMMIT');
    return {
      success: true,
      staffId,
      name: `${input.firstName} ${input.lastName}`,
      institutionCode: input.institutionCode,
      designation: input.designation,
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}
