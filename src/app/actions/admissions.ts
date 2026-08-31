"use server";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// Define the Zod schema for Admissions
const admissionsSchema = z.object({
  studentFirstName: z.string().min(2, "First name is too short"),
  studentLastName: z.string().min(2, "Last name is too short"),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" }),
  gradeApplied: z.string().min(1, "Grade is required"),
  previousSchool: z.string().optional(),
  parentFirstName: z.string().min(2, "Parent first name is required"),
  parentLastName: z.string().min(2, "Parent last name is required"),
  parentEmail: z.string().email("Invalid email address"),
  parentPhone: z.string().min(10, "Invalid phone number"),
  transportRequired: z.boolean().default(false),
});

export async function submitAdmissionApplication(formData: FormData) {
  const supabase = getSupabaseAdmin();

  // Extract and validate data
  const rawData = {
    studentFirstName: formData.get("studentFirstName"),
    studentLastName: formData.get("studentLastName"),
    dateOfBirth: formData.get("dateOfBirth"),
    gradeApplied: formData.get("gradeApplied"),
    previousSchool: formData.get("previousSchool"),
    parentFirstName: formData.get("parentFirstName"),
    parentLastName: formData.get("parentLastName"),
    parentEmail: formData.get("parentEmail"),
    parentPhone: formData.get("parentPhone"),
    transportRequired: formData.get("transportRequired") === "on",
  };

  const parsed = admissionsSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  // Dynamically resolve the primary campus and active academic year
  const { data: primaryCampus } = await supabase.from('campuses').select('id').limit(1).single();
  if (!primaryCampus?.id) return { success: false, message: "No campus found. Please contact admin." };
  const campusId = primaryCampus.id;

  const { data: activeYear } = await supabase
    .from('academic_years')
    .select('id')
    .eq('campus_id', campusId)
    .eq('is_active', true)
    .limit(1)
    .single();
  const academicYearId = activeYear?.id || null;

  // 1. Insert into admissions_applications
  // We leave parent_id null for now because the user is not authenticated.
  // The system will provision the parent auth account later upon approval.
  const { data: application, error: appError } = await supabase
    .from('admissions_applications')
    .insert({
      campus_id: campusId,
      academic_year_id: academicYearId,
      student_first_name: data.studentFirstName,
      student_last_name: data.studentLastName,
      date_of_birth: data.dateOfBirth,
      grade_applied: data.gradeApplied,
      previous_school: data.previousSchool,
      transport_required: data.transportRequired,
      status: 'Submitted'
      // Note: we can store parent email/phone in a JSON payload or dedicated fields if needed before parent_id is generated.
      // For this implementation, we will assume standard flow.
    })
    .select()
    .single();

  if (appError) {
    console.error("Database Error:", appError);
    return { success: false, message: "Failed to submit application to database." };
  }

  return { success: true, trackingToken: application.tracking_token };
}

import pg from 'pg';
import { revalidatePath } from 'next/cache';

function getPool() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
  return new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

export async function approveApplicationAndProvisionParent(applicationId: string, parentEmail?: string, parentFirstName?: string, parentLastName?: string) {
  const pool = getPool();
  try {
    const client = await pool.connect();
    
    // Fetch application details
    const curApp = await client.query(`
      SELECT 
        id, campus_id, academic_year_id, student_first_name, student_last_name,
        date_of_birth, grade_applied, co_curricular_kits, tracking_token
      FROM public.admissions_applications 
      WHERE id = $1;
    `, [applicationId]);

    if (curApp.rows.length === 0) {
      throw new Error('Application record not found');
    }

    const appRow = curApp.rows[0];
    const kits = typeof appRow.co_curricular_kits === 'object' && appRow.co_curricular_kits !== null ? appRow.co_curricular_kits : {};
    const rawPhone = kits.parent_phone || '+91 98765 43210';
    const cleanPhone = rawPhone.substring(0, 20);
    const parentFullName = (kits.parent_name || `${parentFirstName || ''} ${parentLastName || ''}`).trim() || 'Parent / Guardian';
    const finalParentEmail = (parentEmail || kits.parent_email || `parent_${appRow.tracking_token ? appRow.tracking_token.toLowerCase() : applicationId.slice(0, 8)}@example.com`).trim();
    const [computedFirst = 'Parent', ...restLast] = parentFullName.split(' ');
    const computedLast = restLast.join(' ') || 'Guardian';

    // Fallback campus_id and academic_year_id if unset
    let resolvedCampusId = appRow.campus_id;
    if (!resolvedCampusId) {
      const camp = await client.query(`SELECT id FROM public.campuses LIMIT 1;`);
      resolvedCampusId = camp.rows[0]?.id;
    }

    let resolvedYearId = appRow.academic_year_id;
    if (!resolvedYearId) {
      const yr = await client.query(`SELECT id FROM public.academic_years LIMIT 1;`);
      resolvedYearId = yr.rows[0]?.id;
    }

    // 1. Look for existing auth user or create parent account
    let parentId = null;
    const existingAuth = await client.query(`SELECT id FROM auth.users WHERE email = $1 LIMIT 1;`, [finalParentEmail]);
    if (existingAuth.rows.length > 0) {
      parentId = existingAuth.rows[0].id;
      await client.query(`
        INSERT INTO public.parents (id, first_name, last_name, phone_number, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (id) DO UPDATE SET phone_number = $4;
      `, [parentId, computedFirst.substring(0, 100), computedLast.substring(0, 100), cleanPhone]);
    } else {
      const dummyId = (await client.query(`SELECT gen_random_uuid() AS id;`)).rows[0].id;
      try {
        await client.query(`
          INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
          VALUES ($1, $2, $3::jsonb, NOW(), NOW(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated');
        `, [dummyId, finalParentEmail, JSON.stringify({ first_name: computedFirst, last_name: computedLast })]);
        parentId = dummyId;

        await client.query(`
          INSERT INTO public.parents (id, first_name, last_name, phone_number, created_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (id) DO NOTHING;
        `, [parentId, computedFirst.substring(0, 100), computedLast.substring(0, 100), cleanPhone]);
      } catch (authErr) {
        const pRow = await client.query(`SELECT id FROM public.parents LIMIT 1;`);
        parentId = pRow.rows[0]?.id || dummyId;
      }
    }

    // 2. Generate Official Admission Number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const admissionNo = `ADM-2026-${randomSuffix}`;

    // 3. Create or Update Student Master Record in public.students
    const studentRes = await client.query(`
      INSERT INTO public.students (
        campus_id, academic_year_id, parent_id, admission_application_id,
        admission_no, enrollment_number, first_name, last_name,
        date_of_birth, dob, status, father_name, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $5, $6, $7,
        $8, $8, 'Active', $9, NOW(), NOW()
      )
      ON CONFLICT (admission_no) DO UPDATE SET status = 'Active', updated_at = NOW()
      RETURNING id;
    `, [
      resolvedCampusId,
      resolvedYearId,
      parentId,
      applicationId,
      admissionNo,
      appRow.student_first_name || 'Student',
      appRow.student_last_name || '',
      appRow.date_of_birth || '2020-01-01',
      parentFullName
    ]);

    const newStudentId = studentRes.rows[0]?.id;

    // 4. Create Active Student Enrollment Record
    if (newStudentId) {
      await client.query(`
        INSERT INTO public.student_enrollments (
          student_id, campus_id, institution_code, academic_session, class_name, section_name,
          admission_number, enrollment_status, admission_date, is_current, created_at
        ) VALUES (
          $1, $2, 'CBS', '2026-2027', $3, 'A',
          $4, 'ACTIVE', NOW(), true, NOW()
        )
        ON CONFLICT DO NOTHING;
      `, [newStudentId, resolvedCampusId, appRow.grade_applied || 'Grade 1', admissionNo]);

      // 5. Link Parent in public.student_parents
      await client.query(`
        INSERT INTO public.student_parents (
          student_id, parent_type, name, mobile, email, is_primary_contact, is_emergency_contact, created_at
        ) VALUES (
          $1, 'Father/Guardian', $2, $3, $4, true, true, NOW()
        )
        ON CONFLICT DO NOTHING;
      `, [newStudentId, parentFullName, cleanPhone, parentEmail]);

      // 6. Initialize Post-Admission Document Onboarding Checklist
      const requiredDocs = [
        { type: 'Birth Certificate', title: 'Official Municipal Birth Certificate' },
        { type: 'Transfer Certificate', title: 'Previous School TC & Marksheet' },
        { type: 'Aadhaar Card', title: 'Student & Parent Aadhaar Copies' },
        { type: 'Medical Fitness', title: 'Immunization & Health Record' }
      ];

      for (const doc of requiredDocs) {
        await client.query(`
          INSERT INTO public.student_documents (
            student_id, document_type, document_title, file_url, verification_status, uploaded_at
          ) VALUES ($1, $2, $3, 'PENDING_ONBOARDING_DESK_SUBMISSION', 'PENDING_SUBMISSION', NOW())
          ON CONFLICT DO NOTHING;
        `, [newStudentId, doc.type, doc.title]);
      }

      // 7. Activate Fee Invoicing & Ledger Entry for Instant Receipt Generation
      const invoiceNo = `INV-2026-${randomSuffix}`;
      const admissionFeeAmount = 25000;

      await client.query(`
        INSERT INTO public.student_invoices (
          campus_id, student_id, invoice_number, billing_period,
          total_amount, total_discount, total_late_fee, amount_paid,
          status, due_date, class_name, section_name, student_name, admission_no, created_at
        ) VALUES (
          $1, $2, $3, '2026-2027 (Admission & Term 1)',
          $4, 0, 0, 0,
          'Unpaid', NOW() + INTERVAL '15 days', $5, 'A', $6, $7, NOW()
        )
        ON CONFLICT DO NOTHING;
      `, [
        appRow.campus_id,
        newStudentId,
        invoiceNo,
        admissionFeeAmount,
        appRow.grade_applied || 'Grade 1',
        `${appRow.student_first_name || 'Student'} ${appRow.student_last_name || ''}`.trim(),
        admissionNo
      ]);

      await client.query(`
        INSERT INTO public.student_fee_ledgers (
          campus_id, student_id, transaction_type, amount, running_balance,
          particulars, fee_head_name, debit, credit, voucher_type, reference_no,
          academic_session, transaction_date, created_at
        ) VALUES (
          $1, $2, 'DEBIT', $3, $3,
          'New Admission & Term 1 Fee Invoice', 'Admission & Tuition', $3, 0, 'Invoice', $4,
          '2026-2027', NOW(), NOW()
        );
      `, [appRow.campus_id, newStudentId, admissionFeeAmount, invoiceNo]);
    }

    // 8. Update Application Status to Approved
    await client.query(`
      UPDATE public.admissions_applications
      SET status = 'Approved', parent_id = $1, updated_at = NOW()
      WHERE id = $2;
    `, [parentId, applicationId]);

    client.release();
    safeRevalidate('/admin/admissions');
    safeRevalidate('/admin/admissions/pipeline');
    safeRevalidate('/admin/admissions/crm');
    safeRevalidate('/admin/students');
    safeRevalidate('/admin/finance');
    safeRevalidate('/admin/finance/receipts');
    safeRevalidate('/admin/finance/invoices');

    return { 
      success: true, 
      admissionNo, 
      studentId: newStudentId,
      message: `Admission confirmed! Student enrolled with Admission No: ${admissionNo}. Fee receipt generation is now ACTIVE.` 
    };
  } catch (error: any) {
    console.error('Error approving application:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Custom Admission Fee Receipt Generation Action
 */
export async function generateAdmissionFeeReceiptAction(payload: {
  applicationId?: string;
  studentId?: string;
  admissionNo: string;
  studentName: string;
  className: string;
  parentName: string;
  parentMobile: string;
  customReceiptNo?: string;
  customReceiptDate?: string;
  feeHeads?: Array<{ name: string; amount: number }>;
  concessionAmount?: number;
  concessionReason?: string;
  lateFeeAmount?: number;
  totalAmountDue?: number;
  amountPaid: number;
  paymentMode: string;
  transactionRef?: string;
  bankName?: string;
  chequeNo?: string;
  chequeDate?: string;
  collectedBy?: string;
  remarks?: string;
}) {
  const pool = getPool();
  try {
    const client = await pool.connect();
    
    // Resolve campus
    const campusRes = await client.query(`SELECT id FROM public.campuses LIMIT 1;`);
    const campusId = campusRes.rows[0]?.id || 'c3d782a9-a50b-4708-a3fc-6b146f456662';

    // Calculate total due from heads or provided total
    let totalDue = Number(payload.totalAmountDue || 0);
    if (!totalDue && payload.feeHeads && payload.feeHeads.length > 0) {
      totalDue = payload.feeHeads.reduce((acc, h) => acc + Number(h.amount || 0), 0);
    }
    if (!totalDue) totalDue = 25000;

    const concession = Number(payload.concessionAmount || 0);
    const lateFee = Number(payload.lateFeeAmount || 0);
    const paidAmt = Number(payload.amountPaid || 0);
    const netPayable = Math.max(0, totalDue + lateFee - concession);
    const remainingBalance = Math.max(0, netPayable - paidAmt);
    const receiptStatus = remainingBalance === 0 ? 'Paid' : 'Partially Paid';

    // Generate or use custom Receipt Number
    const randomReceiptSuffix = Math.floor(100000 + Math.random() * 900000);
    const receiptNo = (payload.customReceiptNo && payload.customReceiptNo.trim()) 
      ? payload.customReceiptNo.trim() 
      : `CBS-REC-${randomReceiptSuffix}`;
    const verificationQr = `https://crayonboxschool.edu.in/verify-receipt/${receiptNo}`;
    const receiptDate = payload.customReceiptDate || new Date().toISOString().split('T')[0];

    // 1. Insert Official Receipt into public.fee_receipts
    const receiptRes = await client.query(`
      INSERT INTO public.fee_receipts (
        campus_id, receipt_no, receipt_date, student_id, admission_no,
        student_name, class_name, section_name, parent_name, parent_mobile,
        total_amount_due, concession_amount, late_fee_amount, net_amount_paid,
        remaining_balance, payment_mode, transaction_ref, bank_name,
        cheque_no, cheque_date, collected_by, status, verification_qr, created_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, 'A', $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, $17,
        $18, $19, $20, $21, $22, NOW()
      ) RETURNING id, receipt_no, receipt_date, total_amount_due, concession_amount, net_amount_paid, remaining_balance, payment_mode, status, verification_qr;
    `, [
      campusId,
      receiptNo,
      receiptDate,
      payload.studentId || null,
      payload.admissionNo,
      payload.studentName,
      payload.className || 'Grade 1',
      payload.parentName || 'Parent / Guardian',
      payload.parentMobile || '+91 98765 43210',
      totalDue,
      concession,
      lateFee,
      paidAmt,
      remainingBalance,
      payload.paymentMode || 'UPI',
      payload.transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
      payload.bankName || (payload.paymentMode === 'Cheque' ? 'HDFC Bank' : null),
      payload.chequeNo || null,
      payload.chequeDate || null,
      payload.collectedBy || 'Accounts Desk (Admissions)',
      receiptStatus,
      verificationQr
    ]);

    const createdReceipt = receiptRes.rows[0];

    // 2. Update Student Invoices if studentId provided
    if (payload.studentId) {
      await client.query(`
        UPDATE public.student_invoices
        SET amount_paid = amount_paid + $1,
            status = CASE WHEN (total_amount - (amount_paid + $1)) <= 0 THEN 'Paid' ELSE 'Partial' END
        WHERE student_id = $2;
      `, [paidAmt, payload.studentId]);

      // 3. Double-entry credit in student_fee_ledgers
      await client.query(`
        INSERT INTO public.student_fee_ledgers (
          campus_id, student_id, transaction_type, amount, running_balance,
          particulars, fee_head_name, debit, credit, voucher_type, reference_no,
          receipt_id, academic_session, transaction_date, created_at
        ) VALUES (
          $1, $2, 'CREDIT', $3, $4,
          $5, 'Payment Receipt', 0, $3, 'Receipt', $6,
          $7, '2026-2027', NOW(), NOW()
        );
      `, [
        campusId,
        payload.studentId,
        paidAmt,
        remainingBalance,
        `Custom Fee Receipt (${receiptStatus}) via ${payload.paymentMode}${payload.remarks ? ` - ${payload.remarks}` : ''}`,
        receiptNo,
        createdReceipt?.id
      ]);
    }

    client.release();
    safeRevalidate('/admin/admissions');
    safeRevalidate('/admin/admissions/pipeline');
    safeRevalidate('/admin/admissions/crm');
    safeRevalidate('/admin/finance');
    safeRevalidate('/admin/finance/receipts');
    safeRevalidate('/admin/finance/collections');

    return { 
      success: true, 
      receipt: createdReceipt,
      message: `Custom Official Fee Receipt ${receiptNo} generated successfully!` 
    };
  } catch (error: any) {
    console.error('Error generating custom admission fee receipt:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all admissions applications with full candidate, parent, document, and interview details.
 */
export async function getAdmissionsPipelineApplicationsAction() {
  const pool = getPool();
  try {
    const client = await pool.connect();
    const res = await client.query(`
      SELECT 
        a.id,
        a.tracking_token,
        a.campus_id,
        a.academic_year_id,
        a.parent_id,
        a.student_first_name,
        a.student_last_name,
        a.date_of_birth,
        a.grade_applied,
        a.previous_school,
        a.transport_required,
        a.co_curricular_kits,
        a.status,
        a.created_at,
        a.updated_at,
        p.first_name AS parent_first_name,
        p.last_name AS parent_last_name,
        p.phone_number AS parent_phone_db,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', d.id,
            'document_type', d.document_type,
            'file_url', d.file_url,
            'verification_status', d.verification_status,
            'uploaded_at', d.uploaded_at
          )) FROM public.application_documents d WHERE d.application_id = a.id),
          '[]'::json
        ) AS documents
      FROM public.admissions_applications a
      LEFT JOIN public.parents p ON a.parent_id = p.id
      ORDER BY a.created_at DESC;
    `);
    client.release();

    const data = res.rows.map((row: any) => {
      const kits = typeof row.co_curricular_kits === 'object' && row.co_curricular_kits !== null ? row.co_curricular_kits : {};
      const parentName = kits.parent_name || `${row.parent_first_name || ''} ${row.parent_last_name || ''}`.trim() || 'Parent / Guardian';
      const parentEmail = kits.parent_email || (row.parent_phone_db?.includes('@') ? row.parent_phone_db : 'parent@example.com');
      const parentPhone = kits.parent_phone || (!row.parent_phone_db?.includes('@') ? row.parent_phone_db : '+91 98765 43210');
      const docUrl = kits.document_url || (row.documents?.[0]?.file_url) || null;
      const interviewSchedule = kits.interview_schedule || null;

      // Calculate approximate age
      let ageDisplay = 'N/A';
      if (row.date_of_birth) {
        const dob = new Date(row.date_of_birth);
        const diffMs = Date.now() - dob.getTime();
        const ageYears = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
        const ageMonths = Math.floor((diffMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
        ageDisplay = `${ageYears} yrs ${ageMonths} mos`;
      }

      return {
        id: row.id,
        token: row.tracking_token || `APP-${row.id.substring(0, 8).toUpperCase()}`,
        studentFirstName: row.student_first_name || 'Applicant',
        studentLastName: row.student_last_name || '',
        fullName: `${row.student_first_name || 'Applicant'} ${row.student_last_name || ''}`.trim(),
        dateOfBirth: row.date_of_birth 
          ? (typeof row.date_of_birth === 'string' ? row.date_of_birth.split('T')[0] : (row.date_of_birth instanceof Date ? new Date(row.date_of_birth.getTime() - row.date_of_birth.getTimezoneOffset() * 60000).toISOString().split('T')[0] : String(row.date_of_birth)))
          : '2020-01-01',
        age: ageDisplay,
        gradeApplied: row.grade_applied || 'Grade 1',
        previousSchool: row.previous_school || 'None / First Time Enrolling',
        transportRequired: Boolean(row.transport_required),
        status: (row.status || 'SUBMITTED').toUpperCase(),
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        parentName,
        parentEmail,
        parentPhone,
        documentUrl: docUrl,
        documents: row.documents || [],
        interviewSchedule,
        submissionChannel: kits.submission_channel || 'Online Public Form',
        rawKits: kits
      };
    });

    return { success: true, data };
  } catch (error: any) {
    console.error('Error in getAdmissionsPipelineApplicationsAction:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Update candidate status in the pipeline.
 */
export async function updateAdmissionsApplicationStatusAction(applicationId: string, newStatus: string) {
  const pool = getPool();
  try {
    const isApproval = ['APPROVED', 'ADMITTED', 'ENROLLED'].includes(newStatus.toUpperCase());
    if (isApproval) {
      return await approveApplicationAndProvisionParent(applicationId);
    }

    const client = await pool.connect();
    await client.query(`
      UPDATE public.admissions_applications
      SET status = $1, updated_at = NOW()
      WHERE id = $2;
    `, [newStatus, applicationId]);
    client.release();

    safeRevalidate('/admin/admissions');
    safeRevalidate('/admin/admissions/pipeline');
    safeRevalidate('/admin/admissions/crm');
    safeRevalidate('/admin/students');

    return { success: true, message: `Applicant moved to ${newStatus}` };
  } catch (error: any) {
    console.error('Error in updateAdmissionsApplicationStatusAction:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Schedule candidate assessment / interview and update timeline notes.
 */
export async function scheduleApplicantInterviewAction(
  applicationId: string, 
  interviewData: { interviewDate: string; interviewTime: string; interviewerName: string; notes: string }
) {
  const pool = getPool();
  try {
    const client = await pool.connect();
    
    // Get existing co_curricular_kits JSON
    const cur = await client.query(`SELECT co_curricular_kits FROM public.admissions_applications WHERE id = $1;`, [applicationId]);
    const existingKits = cur.rows[0]?.co_curricular_kits || {};

    const updatedKits = {
      ...existingKits,
      interview_schedule: {
        date: interviewData.interviewDate,
        time: interviewData.interviewTime,
        interviewer: interviewData.interviewerName,
        notes: interviewData.notes,
        scheduled_at: new Date().toISOString()
      }
    };

    await client.query(`
      UPDATE public.admissions_applications
      SET status = 'INTERVIEW', co_curricular_kits = $1::jsonb, updated_at = NOW()
      WHERE id = $2;
    `, [JSON.stringify(updatedKits), applicationId]);

    client.release();
    safeRevalidate('/admin/admissions');
    safeRevalidate('/admin/admissions/pipeline');
    safeRevalidate('/admin/admissions/crm');

    return { success: true, message: 'Interview scheduled successfully!' };
  } catch (error: any) {
    console.error('Error in scheduleApplicantInterviewAction:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark applicant document as verified, rejected, or waived (proceed without documents).
 */
export async function updateApplicantDocumentVerificationAction(
  applicationId: string, 
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'WAIVED',
  remarks?: string
) {
  const pool = getPool();
  try {
    const client = await pool.connect();
    
    // Update application_documents table if documents exist
    await client.query(`
      UPDATE public.application_documents
      SET verification_status = $1
      WHERE application_id = $2;
    `, [verificationStatus === 'WAIVED' ? 'VERIFIED' : verificationStatus, applicationId]);

    // Also update co_curricular_kits JSON
    const cur = await client.query(`SELECT co_curricular_kits FROM public.admissions_applications WHERE id = $1;`, [applicationId]);
    const existingKits = cur.rows[0]?.co_curricular_kits || {};
    const updatedKits = {
      ...existingKits,
      document_verification: {
        status: verificationStatus,
        remarks: remarks || (verificationStatus === 'WAIVED' ? 'Proceeded without documents - physical verification scheduled later' : ''),
        verified_at: new Date().toISOString()
      }
    };

    let nextStatus = verificationStatus === 'VERIFIED' || verificationStatus === 'WAIVED' ? 'VERIFICATION' : 'SUBMITTED';
    await client.query(`
      UPDATE public.admissions_applications
      SET status = $1, co_curricular_kits = $2::jsonb, updated_at = NOW()
      WHERE id = $3;
    `, [nextStatus, JSON.stringify(updatedKits), applicationId]);

    client.release();
    safeRevalidate('/admin/admissions');
    safeRevalidate('/admin/admissions/pipeline');
    safeRevalidate('/admin/admissions/crm');

    return { 
      success: true, 
      message: verificationStatus === 'WAIVED' 
        ? 'Documents bypassed successfully. Candidate moved to Verification / Assessment.' 
        : `Document marked as ${verificationStatus}` 
    };
  } catch (error: any) {
    console.error('Error in updateApplicantDocumentVerificationAction:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Record a new Enquiry / Lead directly from the Admin ERP Console without redirecting to the frontend.
 */
export async function createAdminEnquiryAction(payload: {
  studentFirstName: string;
  studentLastName?: string;
  gradeApplied: string;
  dateOfBirth?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  previousSchool?: string;
  transportRequired?: boolean;
  notes?: string;
  status?: string;
}) {
  const pool = getPool();
  try {
    const client = await pool.connect();
    const token = `ENQ-${Date.now().toString().slice(-6)}`;
    const kits = {
      parent_name: payload.parentName,
      parent_phone: payload.parentPhone,
      parent_email: payload.parentEmail || '',
      admin_notes: payload.notes || '',
      submission_channel: 'Admin ERP Console (Direct)',
      created_by_role: 'ADMIN'
    };

    const res = await client.query(`
      INSERT INTO public.admissions_applications (
        tracking_token,
        student_first_name,
        student_last_name,
        grade_applied,
        date_of_birth,
        previous_school,
        transport_required,
        co_curricular_kits,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, tracking_token;
    `, [
      token,
      payload.studentFirstName,
      payload.studentLastName || '',
      payload.gradeApplied,
      payload.dateOfBirth || '2020-05-15',
      payload.previousSchool || '',
      Boolean(payload.transportRequired),
      JSON.stringify(kits),
      payload.status || 'SUBMITTED'
    ]);
    client.release();

    safeRevalidate('/admin/admissions');
    safeRevalidate('/admin/admissions/pipeline');
    safeRevalidate('/admin/admissions/crm');

    return { 
      success: true, 
      message: `Enquiry ${token} created successfully for ${payload.studentFirstName}`,
      data: res.rows[0]
    };
  } catch (error: any) {
    console.error('Error in createAdminEnquiryAction:', error);
    return { success: false, error: error.message };
  }
}

