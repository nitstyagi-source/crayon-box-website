"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

export interface TcRecord {
  id: string;
  tc_number: string;
  ref_number?: string;
  student_name: string;
  father_name: string;
  mother_name: string;
  dob: string;
  admission_no: string;
  admission_date: string;
  class_last_attended: string;
  section_last_attended: string;
  pen_no?: string;
  withdrawal_date: string;
  issue_date: string;
  dues_paid: boolean;
  annual_result?: string;
  reason_for_leaving: string;
  status: string;
  created_at: string;
}

// -------------------------------------------------------------
// 1. GENERATE OFFICIAL CBSE TRANSFER CERTIFICATE
// -------------------------------------------------------------
export async function generateTransferCertificateAction(params: {
  studentName: string;
  admissionNo: string;
  fatherName: string;
  motherName: string;
  dob: string;
  admissionDate: string;
  classLastAttended: string;
  reasonForLeaving: string;
  annualResult?: string;
  penNo?: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const tcNumber = `TC/CBS/2026/${randomSuffix}`;
    const refNumber = `REF/CBSE/DEL/${randomSuffix}`;
    const result = params.annualResult || "Promoted to Higher Class (Passed)";
    const pen = params.penNo || `PEN-2026-${randomSuffix}`;

    const res = await client.query(`
      INSERT INTO public.transfer_certificates (
        tc_number, ref_number, student_name, father_name, mother_name,
        dob, admission_no, admission_date, class_last_attended,
        section_last_attended, pen_no, withdrawal_date, issue_date,
        dues_paid, annual_result, reason_for_leaving, status,
        accounts_clearance, library_clearance, transport_clearance, academic_clearance
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, 'A', $10, CURRENT_DATE,
        CURRENT_DATE, true, $11, $12, 'ISSUED', true, true, true, true
      ) RETURNING *;
    `, [
      tcNumber, refNumber, params.studentName, params.fatherName,
      params.motherName, params.dob, params.admissionNo,
      params.admissionDate, params.classLastAttended, pen,
      result, params.reasonForLeaving
    ]);

    const tc = res.rows[0];

    safeRevalidate('/admin/students/tc');

    return {
      success: true,
      tc,
      message: `✓ Official CBSE Transfer Certificate (${tcNumber}) generated and registered!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. GET RECENT TRANSFER CERTIFICATES
// -------------------------------------------------------------
export async function getTransferCertificatesListAction() {
  const p = getPool();
  const client = await p.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.transfer_certificates 
      ORDER BY created_at DESC 
      LIMIT 50;
    `);

    return { success: true, certificates: res.rows as TcRecord[] };
  } catch (e: any) {
    return { success: false, error: e.message, certificates: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. PUBLIC TC VERIFICATION TOKEN LOOKUP
// -------------------------------------------------------------
export async function verifyTransferCertificateTokenAction(tcNumberOrToken: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.transfer_certificates 
      WHERE tc_number = $1 OR ref_number = $1 OR id::text = $1
      LIMIT 1;
    `, [tcNumberOrToken]);

    if (res.rows.length === 0) {
      return { success: false, error: "Transfer Certificate record not found on official CBSE registry." };
    }

    return { success: true, certificate: res.rows[0] as TcRecord };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}
