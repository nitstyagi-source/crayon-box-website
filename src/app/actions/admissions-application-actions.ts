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

// -------------------------------------------------------------------
// 1. ENQUIRY LOOKUP FOR INSTANT PRE-FILL
// -------------------------------------------------------------------
export async function getEnquiryForPrefillAction(identifier: string) {
  const p = getPool();
  const client = await p.connect();
  try {
    const raw = identifier.trim();
    if (!raw) return { success: false, message: 'Please enter an Enquiry Number or Mobile Number.' };

    const { rows } = await client.query(`
      SELECT * FROM public.enquiries
      WHERE enquiry_no ILIKE $1 OR parent_phone ILIKE $1 OR parent_phone ILIKE $2
      ORDER BY created_at DESC LIMIT 1
    `, [raw, `%${raw.replace(/\D/g, '')}%`]);

    if (rows.length === 0) {
      return { success: false, message: `No enquiry found for "${raw}". You can fill the form directly.` };
    }

    const enq = rows[0];
    return {
      success: true,
      enquiry: {
        enquiry_no: enq.enquiry_no,
        child_name: enq.child_name || '',
        parent_name: enq.parent_name || '',
        parent_phone: enq.parent_phone || '',
        parent_email: enq.parent_email || '',
        grade_interested: enq.grade_interested || 'Nursery',
        locality: enq.locality || '',
        transport_required: Boolean(enq.transport_required),
        campus_id: enq.campus_id || null,
        academic_year: enq.academic_year || '2026-2027'
      }
    };
  } catch (err: any) {
    console.error('Prefill lookup error:', err);
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------------
// 2. LIVE SIBLING DIRECTORY SEARCH
// -------------------------------------------------------------------
export async function searchEnrolledSiblingsAction(query: string) {
  const p = getPool();
  const client = await p.connect();
  try {
    const q = query.trim();
    if (!q || q.length < 2) return { success: true, students: [] };

    const { rows } = await client.query(`
      SELECT id, admission_no, first_name, last_name, class_name, roll_no, parent_phone
      FROM public.students
      WHERE is_active = true AND (
        first_name ILIKE $1 OR last_name ILIKE $1 OR admission_no ILIKE $1 OR parent_phone ILIKE $1
      )
      LIMIT 6
    `, [`%${q}%`]);

    return {
      success: true,
      students: rows.map((s: any) => ({
        id: s.id,
        admission_no: s.admission_no,
        name: `${s.first_name} ${s.last_name || ''}`.trim(),
        class_name: s.class_name || 'Standard',
        parent_phone: s.parent_phone
      }))
    };
  } catch (err: any) {
    return { success: false, error: err.message, students: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------------
// 3. GET LIVE CAMPUSES, BUSES & FEE PLANS
// -------------------------------------------------------------------
export async function getAdmissionsMasterDataAction() {
  const p = getPool();
  const client = await p.connect();
  try {
    const [campusesRes, busesRes, feesRes] = await Promise.all([
      client.query(`SELECT id, name, code, city, board_affiliation FROM public.campuses WHERE is_active = true`),
      client.query(`SELECT id, bus_number, route_name, driver_name FROM public.transport_buses`),
      client.query(`SELECT id, grade_level, name, total_annual_amount, amount FROM public.fee_structures WHERE is_active = true`)
    ]);

    return {
      success: true,
      campuses: campusesRes.rows,
      buses: busesRes.rows,
      feeStructures: feesRes.rows
    };
  } catch (err: any) {
    return { success: false, error: err.message, campuses: [], buses: [], feeStructures: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------------
// 4. SAVE MASTER ADMISSION APPLICATION (12 SECTIONS)
// -------------------------------------------------------------------
export async function saveMasterAdmissionApplicationAction(data: any) {
  const p = getPool();
  const client = await p.connect();
  try {
    const appNo = data.application_no || `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullName = `${data.first_name || ''} ${data.middle_name || ''} ${data.last_name || ''}`.trim().replace(/\s+/g, ' ');

    const { rows } = await client.query(`
      INSERT INTO public.admission_applications (
        application_no, enquiry_no, campus_id, academic_year, class_applied, admission_type,
        first_name, middle_name, last_name, full_name, name_as_per_birth_cert,
        dob, gender, blood_group, nationality, mother_tongue, category, aadhaar_number, student_photo_url, id_mark_1, id_mark_2,
        birth_place, birth_city, birth_district, birth_state, birth_country, birth_certificate_no, birth_cert_issuing_authority, birth_cert_issue_date, birth_cert_url,
        father_name, father_dob, father_aadhaar, father_qualification, father_occupation, father_designation, father_organization, father_office_address, father_phone, father_whatsapp, father_email, father_annual_income, is_father_primary,
        mother_name, mother_dob, mother_aadhaar, mother_qualification, mother_occupation, mother_designation, mother_organization, mother_office_address, mother_phone, mother_whatsapp, mother_email, mother_annual_income, is_mother_primary,
        has_legal_guardian, guardian_name, guardian_relationship, guardian_phone, guardian_email, guardian_address, guardian_doc_url,
        current_address_line1, current_locality, current_landmark, current_city, current_district, current_state, current_pincode, is_permanent_same, permanent_address_line1, permanent_city, permanent_state, permanent_pincode, distance_from_campus_km, family_marital_status, child_lives_with, primary_custodian,
        previous_school_name, previous_school_address, previous_school_board, previous_school_medium, previous_class_attended, previous_academic_year, previous_tc_number, previous_tc_date, previous_tc_url, previous_marks_percentage, previous_report_card_url, previous_reason_for_leaving,
        first_language, second_language, languages_known, has_sibling_in_school, sibling_student_id, sibling_admission_no, sibling_name, sibling_class,
        medical_allergies, medical_conditions, doctor_name, doctor_phone, preferred_hospital, emergency_contact_1_name, emergency_contact_1_relation, emergency_contact_1_phone, emergency_contact_2_name, emergency_contact_2_relation, emergency_contact_2_phone,
        transport_required, transport_type, bus_route_id, pickup_point, drop_point, authorized_escort_1_name, authorized_escort_1_phone, authorized_escort_1_photo_url,
        sports_talents, arts_talents, special_learning_support_needed, special_support_details,
        documents_checklist, parent_declaration_accepted, parent_declaration_date, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43,
        $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56,
        $57, $58, $59, $60, $61, $62, $63,
        $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79,
        $80, $81, $82, $83, $84, $85, $86, $87, $88, $89, $90, $91,
        $92, $93, $94, $95, $96, $97, $98, $99,
        $100, $101, $102, $103, $104, $105, $106, $107, $108, $109, $110,
        $111, $112, $113, $114, $115, $116, $117, $118,
        $119, $120, $121, $122,
        $123, $124, NOW(), 'SUBMITTED'
      )
      ON CONFLICT (application_no) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        full_name = EXCLUDED.full_name,
        dob = EXCLUDED.dob,
        gender = EXCLUDED.gender,
        father_phone = EXCLUDED.father_phone,
        updated_at = NOW()
      RETURNING id, application_no, full_name, class_applied;
    `, [
      appNo, data.enquiry_no || null, data.campus_id || null, data.academic_year || '2026-2027', data.class_applied || 'Nursery', data.admission_type || 'NEW_ADMISSION',
      data.first_name, data.middle_name || null, data.last_name, fullName, data.name_as_per_birth_cert || fullName,
      data.dob || '2022-01-01', data.gender || 'MALE', data.blood_group || null, data.nationality || 'Indian', data.mother_tongue || 'Hindi', data.category || 'GENERAL', data.aadhaar_number || null, data.student_photo_url || null, data.id_mark_1 || null, data.id_mark_2 || null,
      data.birth_place || null, data.birth_city || null, data.birth_district || null, data.birth_state || null, data.birth_country || 'India', data.birth_certificate_no || null, data.birth_cert_issuing_authority || null, data.birth_cert_issue_date || null, data.birth_cert_url || null,
      data.father_name || null, data.father_dob || null, data.father_aadhaar || null, data.father_qualification || null, data.father_occupation || null, data.father_designation || null, data.father_organization || null, data.father_office_address || null, data.father_phone || null, data.father_whatsapp || null, data.father_email || null, data.father_annual_income || null, Boolean(data.is_father_primary),
      data.mother_name || null, data.mother_dob || null, data.mother_aadhaar || null, data.mother_qualification || null, data.mother_occupation || null, data.mother_designation || null, data.mother_organization || null, data.mother_office_address || null, data.mother_phone || null, data.mother_whatsapp || null, data.mother_email || null, data.mother_annual_income || null, Boolean(data.is_mother_primary),
      Boolean(data.has_legal_guardian), data.guardian_name || null, data.guardian_relationship || null, data.guardian_phone || null, data.guardian_email || null, data.guardian_address || null, data.guardian_doc_url || null,
      data.current_address_line1 || null, data.current_locality || null, data.current_landmark || null, data.current_city || 'Delhi', data.current_district || null, data.current_state || 'Delhi', data.current_pincode || null, Boolean(data.is_permanent_same), data.permanent_address_line1 || null, data.permanent_city || null, data.permanent_state || null, data.permanent_pincode || null, data.distance_from_campus_km || null, data.family_marital_status || null, data.child_lives_with || 'Parents', data.primary_custodian || 'Parents',
      data.previous_school_name || null, data.previous_school_address || null, data.previous_school_board || null, data.previous_school_medium || null, data.previous_class_attended || null, data.previous_academic_year || null, data.previous_tc_number || null, data.previous_tc_date || null, data.previous_tc_url || null, data.previous_marks_percentage || null, data.previous_report_card_url || null, data.previous_reason_for_leaving || null,
      data.first_language || 'English', data.second_language || 'Hindi', data.languages_known || ['English', 'Hindi'], Boolean(data.has_sibling_in_school), data.sibling_student_id || null, data.sibling_admission_no || null, data.sibling_name || null, data.sibling_class || null,
      data.medical_allergies || null, data.medical_conditions || null, data.doctor_name || null, data.doctor_phone || null, data.preferred_hospital || null, data.emergency_contact_1_name || 'Emergency Contact', data.emergency_contact_1_relation || 'Parent', data.emergency_contact_1_phone || data.father_phone || '9999999999', data.emergency_contact_2_name || null, data.emergency_contact_2_relation || null, data.emergency_contact_2_phone || null,
      Boolean(data.transport_required), data.transport_type || 'TWO_WAY', data.bus_route_id || null, data.pickup_point || null, data.drop_point || null, data.authorized_escort_1_name || null, data.authorized_escort_1_phone || null, data.authorized_escort_1_photo_url || null,
      data.sports_talents || [], data.arts_talents || [], Boolean(data.special_learning_support_needed), data.special_support_details || null,
      JSON.stringify(data.documents_checklist || []), Boolean(data.parent_declaration_accepted)
    ]);

    // If enquiry_no linked, update enquiry status in CRM
    if (data.enquiry_no) {
      await client.query(`
        UPDATE public.enquiries
        SET status = 'APPLICATION_SUBMITTED'
        WHERE enquiry_no = $1;
      `, [data.enquiry_no]);
    }

    safeRevalidate('/admin/admissions');
    safeRevalidate('/admissions/apply');

    return {
      success: true,
      applicationId: rows[0].id,
      applicationNo: rows[0].application_no,
      fullName: rows[0].full_name,
      classApplied: rows[0].class_applied
    };
  } catch (err: any) {
    console.error('Save admission application error:', err);
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------------
// 5. GET ALL ADMISSION APPLICATIONS (ADMIN ONBOARDING DESK)
// -------------------------------------------------------------------
export async function getAdmissionApplicationsListAction(filter?: { status?: string; search?: string }) {
  const p = getPool();
  const client = await p.connect();
  try {
    let sql = `SELECT * FROM public.admission_applications ORDER BY created_at DESC LIMIT 50`;
    const { rows } = await client.query(sql);

    return {
      success: true,
      applications: rows
    };
  } catch (err: any) {
    return { success: false, error: err.message, applications: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------------
// 6. GET SINGLE APPLICATION DETAILS (12 SECTIONS)
// -------------------------------------------------------------------
export async function getAdmissionApplicationDetailsAction(idOrNo: string) {
  const p = getPool();
  const client = await p.connect();
  try {
    const { rows } = await client.query(`
      SELECT a.*, c.name as campus_name, b.route_name, b.bus_number
      FROM public.admission_applications a
      LEFT JOIN public.campuses c ON a.campus_id = c.id
      LEFT JOIN public.transport_buses b ON a.bus_route_id = b.id
      WHERE a.id::text = $1 OR a.application_no = $1
      LIMIT 1
    `, [idOrNo]);

    if (rows.length === 0) return { success: false, error: 'Application not found' };

    return {
      success: true,
      application: rows[0]
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------------
// 7. APPROVE ADMISSION & COMMIT TO PERMANENT STUDENT MASTER RECORD
// -------------------------------------------------------------------
export async function approveAdmissionAndCreateStudentMasterAction(params: {
  applicationId: string;
  section: string;
  rollNo?: number;
  feePlanId?: string;
  siblingConcessionApplied?: boolean;
  approvedBy: string;
  remarks?: string;
}) {
  const p = getPool();
  const client = await p.connect();
  try {
    // 1. Fetch application details
    const { rows: apps } = await client.query(`SELECT * FROM public.admission_applications WHERE id = $1`, [params.applicationId]);
    if (apps.length === 0) return { success: false, error: 'Application not found.' };

    const app = apps[0];
    const admNo = `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Commit into public.students (The Single System of Record)
    const { rows: studentRows } = await client.query(`
      INSERT INTO public.students (
        admission_no, first_name, last_name, dob, gender, blood_group,
        class_name, section, roll_no, parent_name, parent_phone, parent_email,
        address, city, is_active, fee_concession_type
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, true, $15
      ) RETURNING id, admission_no, first_name, last_name;
    `, [
      admNo,
      app.first_name,
      app.last_name,
      app.dob,
      app.gender,
      app.blood_group,
      app.class_applied,
      params.section || 'A',
      params.rollNo || 1,
      app.father_name || app.mother_name || 'Parent',
      app.father_phone || app.mother_phone || '9999999999',
      app.father_email || app.mother_email || null,
      app.current_address_line1 || 'Delhi',
      app.current_city || 'Delhi',
      params.siblingConcessionApplied ? 'SIBLING_10_PERCENT' : 'NONE'
    ]);

    // 3. Update application status
    await client.query(`
      UPDATE public.admission_applications
      SET
        admission_no = $1,
        status = 'APPROVED',
        allocated_section = $2,
        allocated_roll_no = $3,
        fee_plan_id = $4,
        sibling_concession_applied = $5,
        approved_by = $6,
        approved_at = NOW(),
        office_remarks = $7
      WHERE id = $8;
    `, [
      admNo,
      params.section || 'A',
      params.rollNo || 1,
      params.feePlanId || null,
      Boolean(params.siblingConcessionApplied),
      params.approvedBy,
      params.remarks || 'Approved by Admissions Committee',
      params.applicationId
    ]);

    // 4. Update linked enquiry status if exists
    if (app.enquiry_no) {
      await client.query(`
        UPDATE public.enquiries
        SET status = 'ADMISSION_APPROVED'
        WHERE enquiry_no = $1;
      `, [app.enquiry_no]);
    }

    safeRevalidate('/admin/admissions');
    safeRevalidate('/admin/students');

    return {
      success: true,
      admissionNo: admNo,
      studentId: studentRows[0].id,
      studentName: `${studentRows[0].first_name} ${studentRows[0].last_name}`
    };
  } catch (err: any) {
    console.error('Approve admission error:', err);
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}
