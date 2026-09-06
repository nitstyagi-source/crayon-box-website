"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || '';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
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
// 1. GENERATE OFFICIAL TRANSFER CERTIFICATE
// -------------------------------------------------------------
export async function generateTransferCertificateAction(params: {
  institutionCode?: string;
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
    const instCode = (params.institutionCode || 'CBS').toUpperCase();
    const tcCountRes = await client.query(`SELECT count(*)::int as count FROM public.transfer_certificates;`);
    const nextTcNum = ((tcCountRes.rows[0]?.count || 0) + 1).toString().padStart(4, '0');
    const tcNumber = `TC/${instCode}/${new Date().getFullYear()}/${nextTcNum}`;
    const refNumber = `REF/${instCode}/${nextTcNum}`;
    const result = params.annualResult || "Promoted to Higher Class (Passed)";
    const pen = params.penNo || `PEN-${new Date().getFullYear()}-${nextTcNum}`;

    // Verify real student record & dues in database
    const stuRes = await client.query(`
      SELECT s.id, s.section, c.section as class_section
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE s.admission_no = $1 OR s.universal_id = $1
      LIMIT 1;
    `, [params.admissionNo]);

    const studentRecord = stuRes.rows[0];
    const sectionLastAttended = studentRecord?.section || studentRecord?.class_section || 'A';
    const studentId = studentRecord?.id;

    // Check actual unpaid fee balance
    let duesPaid = true;
    let pendingDuesAmount = 0;
    if (studentId) {
      const invRes = await client.query(`
        SELECT COALESCE(SUM(balance_amount), 0) as total_unpaid
        FROM public.student_invoices
        WHERE student_id = $1 AND status != 'PAID';
      `, [studentId]);
      pendingDuesAmount = Number(invRes.rows[0]?.total_unpaid || 0);
      duesPaid = pendingDuesAmount === 0;
    }

    const accountsClearance = duesPaid;

    const res = await client.query(`
      INSERT INTO public.transfer_certificates (
        tc_number, ref_number, student_name, father_name, mother_name,
        dob, admission_no, admission_date, class_last_attended,
        section_last_attended, pen_no, withdrawal_date, issue_date,
        dues_paid, annual_result, reason_for_leaving, status,
        accounts_clearance, library_clearance, transport_clearance, academic_clearance
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE,
        CURRENT_DATE, $12, $13, $14, 'ISSUED', $15, true, true, true
      ) RETURNING *;
    `, [
      tcNumber, refNumber, params.studentName, params.fatherName,
      params.motherName, params.dob, params.admissionNo,
      params.admissionDate, params.classLastAttended, sectionLastAttended, pen,
      duesPaid, result, params.reasonForLeaving, accountsClearance
    ]);

    const tc = res.rows[0];

    safeRevalidate('/admin/students/tc');

    return {
      success: true,
      tc,
      message: `✓ Official Transfer Certificate (${tcNumber}) generated and registered!`
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
      return { success: false, error: "Transfer Certificate record not found on official registry." };
    }

    const tc = res.rows[0] as TcRecord;
    // Extract school code from TC number like TC/CBS/2026/...
    const parts = (tc.tc_number || '').split('/');
    const codeCandidate = parts.length >= 2 ? parts[1].toUpperCase() : 'CBS';
    const matchedInst = VANI_TRUST_INSTITUTIONS.find(i => i.code.toUpperCase() === codeCandidate || i.id === codeCandidate) || VANI_TRUST_INSTITUTIONS[0];

    return { 
      success: true, 
      certificate: tc,
      institution: {
        name: matchedInst.name,
        shortName: matchedInst.shortName,
        code: matchedInst.code,
        address: matchedInst.address,
        affiliation: matchedInst.affiliationNumber ? `Affiliation No: ${matchedInst.affiliationNumber} (${matchedInst.boardAffiliation})` : (matchedInst.boardAffiliation || 'Recognized Academic Institution'),
        logoUrl: matchedInst.logoUrl,
        principalName: matchedInst.principalName,
        website: matchedInst.website,
        phone: matchedInst.phone
      }
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}
