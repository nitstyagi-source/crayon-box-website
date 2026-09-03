"use server";

import { revalidatePath } from "next/cache";
import pg from 'pg';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
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
  const dob = (formData.get("dob") as string) || "2020-01-01";
  const parentName = (formData.get("parentName") as string) || (formData.get("parent_name") as string) || "Guardian";
  const email = (formData.get("email") as string) || (formData.get("parent_email") as string) || "parent@example.com";
  const phone = (formData.get("phone") as string) || (formData.get("parent_phone") as string) || "+91 98765 43210";
  const documentUrl = (formData.get("document_url") as string) || "";
  
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const trackingToken = `APP-2026-${randomDigits}`;

  const p = getPool();
  try {
    const client = await p.connect();
    const campusRes = await client.query(`SELECT id FROM public.campuses LIMIT 1;`);
    const campusId = campusRes.rows[0]?.id || 'c3d782a9-a50b-4708-a3fc-6b146f456662';

    const yearRes = await client.query(`SELECT id FROM public.academic_years LIMIT 1;`);
    const yearId = yearRes.rows[0]?.id || '27438acf-7afd-4b12-a6c8-a059ab39b26a';

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
    const utr = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;

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
    const phone = (formData.get("phone") as string) || "+91 9811102008";
    const grade = (formData.get("department") as string) || "General";
    const message = (formData.get("message") as string) || "";
    const enqNo = `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

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
        const pEmail = kits.parent_email || 'parent@example.com';
        const pPhone = kits.parent_phone || '+91 98765 43210';
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
