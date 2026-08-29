"use server";

import { revalidatePath } from "next/cache";
import pg from 'pg';

type Admission = { id: string; parentName: string; email: string; phone: string; childName: string; grade: string; date: string; status: string };
type Payment = { id: string; studentId: string; parentName: string; amount: number; date: string; status: string };
type Enquiry = { id: string; name: string; email: string; phone: string; department: string; nature: string; message: string; date: string; status: string };

const MOCK_FORM_DB: {
  admissions: Admission[];
  payments: Payment[];
  enquiries: Enquiry[];
} = {
  admissions: [],
  payments: [],
  enquiries: []
};

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

function getPool() {
  return new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
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

  const pool = getPool();
  try {
    const client = await pool.connect();
    const campusRes = await client.query(`SELECT id FROM public.campuses LIMIT 1;`);
    const campusId = campusRes.rows[0]?.id || 'c3d782a9-a50b-4708-a3fc-6b146f456662';

    const yearRes = await client.query(`SELECT id FROM public.academic_years LIMIT 1;`);
    const yearId = yearRes.rows[0]?.id || '27438acf-7afd-4b12-a6c8-a059ab39b26a';

    const payloadKits = JSON.stringify({
      parent_name: parentName,
      parent_email: email,
      parent_phone: phone,
      document_url: documentUrl,
      submission_channel: 'Online Public Portal'
    });

    const appInsert = await client.query(`
      INSERT INTO public.admissions_applications (
        campus_id, academic_year_id, tracking_token, student_first_name, student_last_name,
        date_of_birth, grade_applied, co_curricular_kits, status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8::jsonb, 'SUBMITTED', NOW()
      ) RETURNING id;
    `, [campusId, yearId, trackingToken, firstName, lastName, dob, grade, payloadKits]);

    const applicationId = appInsert.rows[0]?.id;

    if (applicationId && documentUrl) {
      await client.query(`
        INSERT INTO public.application_documents (
          application_id, document_type, file_url, verification_status, uploaded_at
        ) VALUES ($1, 'Birth Certificate / Aadhaar', $2, 'PENDING', NOW());
      `, [applicationId, documentUrl]);
    }

    client.release();
  } catch (e: any) {
    console.error("DB admission save error:", e.message);
  }

  const application: Admission = {
    id: trackingToken,
    parentName,
    email,
    phone,
    childName: `${firstName} ${lastName}`,
    grade: grade,
    date: new Date().toISOString(),
    status: "Pending"
  };

  MOCK_FORM_DB.admissions.unshift(application);
  safeRevalidate("/admin/admissions");
  safeRevalidate("/admin/admissions/pipeline");
  safeRevalidate("/admin/admissions/crm");
  return { success: true, applicationId: trackingToken };
}

export async function submitFeePayment(formData: FormData) {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const payment: Payment = {
    id: `PAY-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    studentId: formData.get("studentId") as string,
    parentName: formData.get("parentName") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: new Date().toISOString(),
    status: "Completed"
  };

  MOCK_FORM_DB.payments.unshift(payment);
  safeRevalidate("/admin/finance");
  return { success: true, transactionId: payment.id };
}

export async function submitContactEnquiry(formData: FormData) {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const enquiry: Enquiry = {
    id: `ENQ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    department: formData.get("department") as string,
    nature: formData.get("nature") as string,
    message: formData.get("message") as string,
    date: new Date().toISOString(),
    status: "Unread"
  };

  MOCK_FORM_DB.enquiries.unshift(enquiry);
  safeRevalidate("/admin/enquiries");
  return { success: true, enquiryId: enquiry.id };
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
  return [];
}

export async function getContactEnquiries() {
  return [];
}
