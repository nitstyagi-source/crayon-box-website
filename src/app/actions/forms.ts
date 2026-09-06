"use server";

import { revalidatePath } from "next/cache";
import pg from 'pg';

let pool: pg.Pool | null = null;
function getPool() {
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

export async function submitAdmission(formData: FormData) {
  const childName = (formData.get("childName") as string) || (formData.get("first_name") as string) || "Applicant";
  const nameParts = childName.trim().split(" ");
  const firstName = nameParts[0] || "Applicant";
  const lastName = nameParts.slice(1).join(" ") || "Student";
  const grade = (formData.get("grade") as string) || "Grade 1";
  const dob = (formData.get("dob") as string) || "";
  const parentName = (formData.get("parentName") as string) || (formData.get("parent_name") as string) || "Guardian";
  const email = (formData.get("email") as string) || (formData.get("parent_email") as string) || "";
  const phone = (formData.get("phone") as string) || (formData.get("parent_phone") as string) || "";
  const documentUrl = (formData.get("document_url") as string) || "";
  
  const p = getPool();
  try {
    const client = await p.connect();
    const countRes = await client.query(`SELECT count(*)::int as count FROM public.admissions_applications;`);
    const nextSeq = String((countRes.rows[0]?.count || 0) + 1).padStart(4, '0');
    const trackingToken = `APP-2026-${nextSeq}`;

    const campusRes = await client.query(`SELECT id FROM public.campuses LIMIT 1;`);
    const campusId = campusRes.rows[0]?.id || null;

    const yearRes = await client.query(`SELECT id FROM public.academic_years ORDER BY created_at DESC LIMIT 1;`);
    const yearId = yearRes.rows[0]?.id || null;

    const payloadKits = JSON.stringify({
      parent_name: parentName,
      parent_email: email,
      parent_phone: phone,
      document_url: documentUrl,
      source: 'PUBLIC_PORTAL'
    });

    await client.query(`
      INSERT INTO public.admissions_applications (
        campus_id,
        academic_year_id,
        tracking_token,
        student_first_name,
        student_last_name,
        date_of_birth,
        grade_applied,
        status,
        payment_status,
        co_curricular_kits
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
    `, [
      campusId,
      yearId,
      trackingToken,
      firstName,
      lastName,
      dob,
      grade,
      'Pending',
      'UNPAID',
      payloadKits
    ]);

    client.release();
    safeRevalidate("/admin/admissions");
    return { success: true, applicationId: trackingToken };
  } catch (err: any) {
    console.error("Database insert error in submitAdmission:", err.message);
    return { success: false, error: err.message };
  }
}

export async function submitFeePayment(formData: FormData) {
  const p = getPool();
  const client = await p.connect();
  try {
    const studentId = formData.get("studentId") as string;
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const countRes = await client.query(`SELECT count(*)::int as count FROM public.fee_payment_transactions;`);
    const nextSeq = String((countRes.rows[0]?.count || 0) + 1).padStart(4, '0');
    const utr = `PAY-2026-${nextSeq}`;

    const { rows } = await client.query(`
      INSERT INTO public.fee_payment_transactions (
        student_id, amount, payment_mode, transaction_reference, status
      ) VALUES (
        $1, $2, 'ONLINE_UPI', $3, 'SUCCESS'
      ) RETURNING id;
    `, [studentId || null, amount, utr]);

    safeRevalidate("/admin/finance");
    return { success: true, transactionId: utr };
  } catch (err: any) {
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

export async function submitContactEnquiry(formData: FormData) {
  const p = getPool();
  const client = await p.connect();
  try {
    const name = (formData.get("name") as string) || "Prospective Parent";
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || "";
    const grade = (formData.get("department") as string) || "General";
    const message = (formData.get("message") as string) || "";
    const enqCountRes = await client.query(`SELECT count(*)::int as count FROM public.enquiries;`);
    const nextEnqSeq = String((enqCountRes.rows[0]?.count || 0) + 1).padStart(4, '0');
    const enqNo = `ENQ-2026-${nextEnqSeq}`;

    await client.query(`
      INSERT INTO public.enquiries (
        enquiry_no, parent_name, parent_email, parent_phone,
        class_applying_for, message, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'NEW'
      );
    `, [enqNo, name, email, phone, grade, message]);

    safeRevalidate("/admin/enquiries");
    safeRevalidate("/admin/admissions");
    return { success: true, enquiryId: enqNo };
  } catch (err: any) {
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

export async function getAdmissions() {
  const pool = getPool();
  try {
    const client = await pool.connect();
    const res = await client.query(`
      SELECT 
        id,
        tracking_token,
        student_first_name,
        student_last_name,
        date_of_birth,
        grade_applied,
        status,
        co_curricular_kits,
        created_at
      FROM public.admissions_applications
      ORDER BY created_at DESC;
    `);
    client.release();

    if (res.rows && res.rows.length > 0) {
      return res.rows.map((row: any) => {
        const kits = typeof row.co_curricular_kits === 'object' && row.co_curricular_kits !== null ? row.co_curricular_kits : {};
        const pName = kits.parent_name || 'Guardian';
        const pEmail = kits.parent_email || '';
        const pPhone = kits.parent_phone || '';
        return {
          id: row.tracking_token || row.id.substring(0, 8),
          parentName: pName,
          email: pEmail,
          phone: pPhone,
          childName: `${row.student_first_name || ''} ${row.student_last_name || ''}`.trim() || 'Applicant',
          grade: row.grade_applied || 'Grade 1',
          date: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          status: row.status || 'Pending'
        };
      });
    }
  } catch (e: any) {
    console.error("Error in getAdmissions from DB:", e.message);
  }
  return [];
}

export async function getFeePayments() {
  const pool = getPool();
  try {
    const client = await pool.connect();
    const res = await client.query(`
      SELECT id, student_id, amount, payment_mode, transaction_reference, status, created_at
      FROM public.fee_payment_transactions
      ORDER BY created_at DESC LIMIT 50;
    `);
    client.release();
    return res.rows.map((r: any) => ({
      id: r.transaction_reference || r.id,
      studentId: r.student_id,
      parentName: 'School Parent',
      amount: parseFloat(r.amount || 0),
      date: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      status: r.status || 'Completed'
    }));
  } catch (e: any) {
    return [];
  }
}

export async function getContactEnquiries() {
  const pool = getPool();
  try {
    const client = await pool.connect();
    const res = await client.query(`
      SELECT id, enquiry_no, parent_name, parent_email, parent_phone, class_applying_for, message, status, created_at
      FROM public.enquiries
      ORDER BY created_at DESC LIMIT 50;
    `);
    client.release();
    return res.rows.map((r: any) => ({
      id: r.enquiry_no || r.id,
      name: r.parent_name,
      email: r.parent_email,
      phone: r.parent_phone,
      department: r.class_applying_for || 'General',
      nature: 'Admission Query',
      message: r.message,
      date: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      status: r.status || 'Unread'
    }));
  } catch (e: any) {
    return [];
  }
}
