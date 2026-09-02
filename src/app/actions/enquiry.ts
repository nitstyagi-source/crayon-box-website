"use server";

import pg from "pg";
import { revalidatePath } from "next/cache";

const { Pool } = pg;
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

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

// -------------------------------------------------------------
// TYPES & INTERFACES
// -------------------------------------------------------------
export interface PublicEnquiryInput {
  academicSession: string; // "2026-2027"
  institutionCode: string; // "CBS" | "AVM" | "AS" | "CBPS"
  admissionClass: string; // "Nursery", "Class 1", etc.
  childFirstName: string;
  childMiddleName?: string;
  childLastName: string;
  childDob: string;
  childGender: string;
  currentClass?: string;
  currentSchool?: string;
  currentBoard?: string;
  primaryGuardianName: string;
  primaryGuardianRelation: string;
  primaryGuardianPhone: string;
  primaryGuardianWhatsapp?: string;
  primaryGuardianEmail: string;
  localityArea: string;
  pincode: string;
  transportRequired?: boolean;
  visitRequested?: boolean;
  visitDate?: string;
  visitSlot?: string;
  interestAreas?: string[];
  enquirySource: string;
  referralDetails?: string;
  parentMessage?: string;
  hasSibling?: boolean;
  siblingAdmissionNo?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingPage?: string;
  referrerUrl?: string;
  deviceType?: string;
}

export interface InternalEnquiryInput extends PublicEnquiryInput {
  admissionType?: string; // "NEW" | "TRANSFER" | "SIBLING" | "READMISSION"
  leadPriority?: string; // "HOT" | "WARM" | "COLD"
  primaryGuardianOccupation?: string;
  primaryGuardianCompany?: string;
  primaryGuardianDesignation?: string;
  secondaryGuardianName?: string;
  secondaryGuardianRelation?: string;
  secondaryGuardianPhone?: string;
  secondaryGuardianEmail?: string;
  secondaryGuardianOccupation?: string;
  secondaryGuardianCompany?: string;
  secondaryGuardianDesignation?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  landmark?: string;
  reasonForChange?: string;
  specialTalents?: string;
  streamPreference?: string;
  secondLanguagePreference?: string;
  preferredContactChannel?: string;
  preferredContactTime?: string;
  counsellorNotes?: string;
  assignedCounsellorName?: string;
}

export interface EnquiryFollowupInput {
  enquiryId: string;
  counsellorName?: string;
  channel: string; // "PHONE" | "WHATSAPP" | "IN_PERSON" | "EMAIL" | "SMS"
  contactedPerson?: string;
  outcome: string; // "CONNECTED" | "NO_ANSWER" | "CALLBACK_REQUESTED" | "VISIT_SCHEDULED" | "APPLICATION_REQUESTED" | "APPLICATION_SUBMITTED" | "LOST" | "INTERESTED"
  parentFeedback?: string;
  internalNotes: string;
  nextAction?: string;
  nextActionDate?: string;
  advanceStatusTo?: string;
}

// -------------------------------------------------------------
// 1. GET ALL ENQUIRIES (WITH METRICS & PIPELINE BREAKDOWN)
// -------------------------------------------------------------
export async function getEnquiries(
  campusOrInstCode?: string,
  filters?: { status?: string; priority?: string; search?: string; session?: string }
) {
  const p = getPool();
  const client = await p.connect();

  try {
    let query = `
      SELECT 
        e.*,
        COALESCE(e.child_first_name || ' ' || COALESCE(e.child_last_name, ''), e.child_name) as full_child_name,
        COALESCE(e.primary_guardian_name, e.parent_name) as full_parent_name,
        COALESCE(e.primary_guardian_phone, e.parent_phone) as full_parent_phone,
        COALESCE(e.primary_guardian_email, e.parent_email) as full_parent_email,
        COALESCE(e.admission_class, e.grade_interested) as target_class,
        (
          SELECT COUNT(*)
          FROM public.enquiry_followups ef
          WHERE ef.enquiry_id = e.id
        ) as followups_count,
        (
          SELECT json_build_object(
            'created_at', ef.created_at,
            'outcome', ef.outcome,
            'channel', ef.channel,
            'notes', ef.internal_notes
          )
          FROM public.enquiry_followups ef
          WHERE ef.enquiry_id = e.id
          ORDER BY ef.created_at DESC
          LIMIT 1
        ) as last_followup
      FROM public.enquiries e
      WHERE 1=1
    `;

    const sqlParams: any[] = [];
    let pIdx = 1;

    if (campusOrInstCode && campusOrInstCode !== 'all' && campusOrInstCode !== 'ALL') {
      query += ` AND (e.institution_code = $${pIdx} OR e.campus_id::text = $${pIdx} OR (e.institution_code IS NULL AND $${pIdx} = 'CBS'))`;
      sqlParams.push(campusOrInstCode);
      pIdx++;
    }

    if (filters?.session && filters.session !== 'ALL') {
      query += ` AND (e.academic_session = $${pIdx} OR e.academic_session IS NULL)`;
      sqlParams.push(filters.session);
      pIdx++;
    }

    if (filters?.status && filters.status !== 'All' && filters.status !== 'ALL') {
      query += ` AND LOWER(e.status) = LOWER($${pIdx})`;
      sqlParams.push(filters.status);
      pIdx++;
    }

    if (filters?.priority && filters.priority !== 'All' && filters.priority !== 'ALL') {
      query += ` AND LOWER(e.lead_priority) = LOWER($${pIdx})`;
      sqlParams.push(filters.priority);
      pIdx++;
    }

    if (filters?.search && filters.search.trim() !== '') {
      const term = `%${filters.search.trim()}%`;
      query += ` AND (
        e.enquiry_number ILIKE $${pIdx} OR
        e.child_name ILIKE $${pIdx} OR
        e.child_first_name ILIKE $${pIdx} OR
        e.child_last_name ILIKE $${pIdx} OR
        e.parent_name ILIKE $${pIdx} OR
        e.primary_guardian_name ILIKE $${pIdx} OR
        e.parent_phone ILIKE $${pIdx} OR
        e.primary_guardian_phone ILIKE $${pIdx} OR
        e.parent_email ILIKE $${pIdx} OR
        e.locality_area ILIKE $${pIdx}
      )`;
      sqlParams.push(term);
      pIdx++;
    }

    query += ` ORDER BY e.created_at DESC;`;

    const res = await client.query(query, sqlParams);
    const list = res.rows || [];

    // Calculate Pipeline Breakdown Counts
    const counts = {
      total: list.length,
      new: list.filter((e: any) => !e.status || e.status.toUpperCase() === 'NEW').length,
      contacted: list.filter((e: any) => e.status?.toUpperCase() === 'CONTACTED').length,
      counselling: list.filter((e: any) => e.status?.toUpperCase() === 'COUNSELLING').length,
      visitScheduled: list.filter((e: any) => e.status?.toUpperCase() === 'CAMPUS_VISIT' || e.visit_requested).length,
      applicationStarted: list.filter((e: any) => e.status?.toUpperCase() === 'APPLICATION_STARTED').length,
      applicationSubmitted: list.filter((e: any) => e.status?.toUpperCase() === 'APPLICATION_SUBMITTED').length,
      admitted: list.filter((e: any) => e.status?.toUpperCase() === 'ADMITTED' || e.status?.toUpperCase() === 'CONVERTED').length,
      lost: list.filter((e: any) => e.status?.toUpperCase() === 'LOST' || e.status?.toUpperCase() === 'DROPPED').length,
      hotPriority: list.filter((e: any) => e.lead_priority?.toUpperCase() === 'HOT').length,
    };

    return { success: true, data: list, counts };
  } catch (error: any) {
    console.error("Error in getEnquiries:", error);
    return { success: false, error: error.message, data: [], counts: { total: 0 } };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. GET SINGLE ENQUIRY DOSSIER WITH FULL TIMELINE (~90 FIELDS)
// -------------------------------------------------------------
export async function getEnquiryDetails(id: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    const enqRes = await client.query(
      `SELECT e.*, 
              COALESCE(e.child_first_name || ' ' || COALESCE(e.child_last_name, ''), e.child_name) as full_child_name,
              COALESCE(e.primary_guardian_name, e.parent_name) as full_parent_name,
              COALESCE(e.primary_guardian_phone, e.parent_phone) as full_parent_phone,
              COALESCE(e.primary_guardian_email, e.parent_email) as full_parent_email,
              COALESCE(e.admission_class, e.grade_interested) as target_class,
              s.first_name as linked_sibling_first,
              s.last_name as linked_sibling_last,
              s.admission_no as linked_sibling_adm_no
       FROM public.enquiries e
       LEFT JOIN public.students s ON e.linked_sibling_student_id = s.id
       WHERE e.id = $1 LIMIT 1;`,
      [id]
    );

    if (enqRes.rows.length === 0) {
      return { success: false, error: "Enquiry not found" };
    }

    const enq = enqRes.rows[0];

    const followupsRes = await client.query(
      `SELECT * FROM public.enquiry_followups WHERE enquiry_id = $1 ORDER BY created_at DESC;`,
      [id]
    );

    return {
      success: true,
      data: {
        ...enq,
        followups: followupsRes.rows || [],
        timeline: followupsRes.rows || []
      }
    };
  } catch (error: any) {
    console.error("Error in getEnquiryDetails:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. PUBLIC ENQUIRY INTAKE (PARENT FACING 20-25 FIELDS)
// -------------------------------------------------------------
export async function createPublicEnquiryAction(input: PublicEnquiryInput) {
  const p = getPool();
  const client = await p.connect();

  try {
    // 1. Generate unique Enquiry Number
    const seqRes = await client.query(`SELECT nextval('public.enquiry_number_seq') as seq;`);
    const seqNum = seqRes.rows[0].seq;
    const year = new Date().getFullYear();
    const enquiryNumber = `ENQ-${year}-${String(seqNum).padStart(4, '0')}`;

    // 2. Resolve Sibling Link if admission no provided
    let linkedSiblingId: string | null = null;
    let linkedSiblingName: string | null = null;
    if (input.hasSibling && input.siblingAdmissionNo && input.siblingAdmissionNo.trim() !== '') {
      const sibRes = await client.query(
        `SELECT id, first_name, last_name, admission_no FROM public.students WHERE LOWER(TRIM(admission_no)) = LOWER(TRIM($1)) LIMIT 1;`,
        [input.siblingAdmissionNo.trim()]
      );
      if (sibRes.rows.length > 0) {
        linkedSiblingId = sibRes.rows[0].id;
        linkedSiblingName = `${sibRes.rows[0].first_name} ${sibRes.rows[0].last_name} (${sibRes.rows[0].admission_no})`;
      }
    }

    const childFullName = `${input.childFirstName.trim()} ${input.childMiddleName ? input.childMiddleName.trim() + ' ' : ''}${input.childLastName.trim()}`;

    const insertRes = await client.query(
      `INSERT INTO public.enquiries (
        enquiry_number,
        academic_session,
        institution_code,
        admission_type,
        lead_priority,
        child_name,
        child_first_name,
        child_middle_name,
        child_last_name,
        child_dob,
        child_gender,
        grade_interested,
        admission_class,
        current_class,
        current_school,
        current_board,
        parent_name,
        primary_guardian_name,
        primary_guardian_relation,
        parent_phone,
        primary_guardian_phone,
        primary_guardian_whatsapp,
        parent_email,
        primary_guardian_email,
        locality_area,
        pincode,
        transport_required,
        visit_requested,
        visit_date,
        visit_slot,
        visit_status,
        interest_areas,
        source,
        parent_message,
        has_sibling,
        linked_sibling_student_id,
        linked_sibling_admission_no,
        linked_sibling_name,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        landing_page,
        referrer_url,
        device_type,
        consent_given,
        consent_timestamp,
        status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
        $41, $42, $43, $44, $45, $46, $47, NOW(), 'NEW'
      )
      RETURNING id, enquiry_number;`,
      [
        enquiryNumber,
        input.academicSession || '2026-2027',
        input.institutionCode || 'CBS',
        input.hasSibling && linkedSiblingId ? 'SIBLING' : 'NEW',
        input.visitRequested ? 'HOT' : 'WARM',
        childFullName,
        input.childFirstName.trim(),
        input.childMiddleName?.trim() || null,
        input.childLastName.trim(),
        input.childDob || null,
        input.childGender || 'Male',
        input.admissionClass,
        input.admissionClass,
        input.currentClass || null,
        input.currentSchool || null,
        input.currentBoard || null,
        input.primaryGuardianName.trim(),
        input.primaryGuardianName.trim(),
        input.primaryGuardianRelation || 'FATHER',
        input.primaryGuardianPhone.trim(),
        input.primaryGuardianPhone.trim(),
        input.primaryGuardianWhatsapp?.trim() || input.primaryGuardianPhone.trim(),
        input.primaryGuardianEmail.trim(),
        input.primaryGuardianEmail.trim(),
        input.localityArea.trim(),
        input.pincode.trim(),
        Boolean(input.transportRequired),
        Boolean(input.visitRequested),
        input.visitDate || null,
        input.visitSlot || null,
        input.visitRequested ? 'SCHEDULED' : 'NONE',
        input.interestAreas || [],
        input.enquirySource || 'Website',
        input.parentMessage || null,
        Boolean(input.hasSibling),
        linkedSiblingId,
        input.siblingAdmissionNo || null,
        linkedSiblingName,
        input.utmSource || null,
        input.utmMedium || null,
        input.utmCampaign || null,
        input.utmTerm || null,
        input.utmContent || null,
        input.landingPage || null,
        input.referrerUrl || null,
        input.deviceType || 'Desktop',
        true
      ]
    );

    const enq = insertRes.rows[0];

    // Log initial ingestion event
    await client.query(
      `INSERT INTO public.enquiry_followups (
        enquiry_id, counsellor_name, channel, outcome, internal_notes
      ) VALUES ($1, 'Website Portal', 'WEB', 'CONNECTED', 'Online enquiry submitted by parent via public admission portal.');`,
      [enq.id]
    );

    safeRevalidate('/admin/enquiries');
    safeRevalidate('/admin/admissions');

    return {
      success: true,
      enquiryId: enq.id,
      enquiryNumber: enq.enquiry_number,
      message: `Enquiry ${enq.enquiry_number} has been successfully recorded! Our admissions desk will contact you within 24 hours.`
    };
  } catch (error: any) {
    console.error("Error in createPublicEnquiryAction:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. INTERNAL ENQUIRY INTAKE (COUNSELLOR 90-FIELD DESK)
// -------------------------------------------------------------
export async function createInternalEnquiryAction(input: InternalEnquiryInput) {
  const p = getPool();
  const client = await p.connect();

  try {
    const seqRes = await client.query(`SELECT nextval('public.enquiry_number_seq') as seq;`);
    const seqNum = seqRes.rows[0].seq;
    const year = new Date().getFullYear();
    const enquiryNumber = `ENQ-${year}-${String(seqNum).padStart(4, '0')}`;

    const childFullName = `${input.childFirstName.trim()} ${input.childMiddleName ? input.childMiddleName.trim() + ' ' : ''}${input.childLastName.trim()}`;

    const insertRes = await client.query(
      `INSERT INTO public.enquiries (
        enquiry_number, academic_session, institution_code, admission_type, lead_priority,
        child_name, child_first_name, child_middle_name, child_last_name, child_dob, child_gender,
        grade_interested, admission_class, current_class, current_school, current_board,
        reason_for_change, special_talents, stream_preference, second_language_preference,
        parent_name, primary_guardian_name, primary_guardian_relation, parent_phone,
        primary_guardian_phone, primary_guardian_whatsapp, parent_email, primary_guardian_email,
        primary_guardian_occupation, primary_guardian_company, primary_guardian_designation,
        secondary_guardian_name, secondary_guardian_relation, secondary_guardian_phone,
        secondary_guardian_email, secondary_guardian_occupation,
        address_line1, locality_area, city, state, pincode, landmark,
        transport_required, visit_requested, visit_date, visit_slot, visit_status,
        interest_areas, source, parent_message, counsellor_notes,
        preferred_contact_channel, preferred_contact_time,
        status
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19, $20,
        $21, $22, $23, $24,
        $25, $26, $27, $28,
        $29, $30, $31,
        $32, $33, $34,
        $35, $36,
        $37, $38, $39, $40, $41, $42,
        $43, $44, $45, $46, $47,
        $48, $49, $50, $51,
        $52, $53,
        'NEW'
      ) RETURNING id, enquiry_number;`,
      [
        enquiryNumber,
        input.academicSession || '2026-2027',
        input.institutionCode || 'CBS',
        input.admissionType || 'NEW',
        input.leadPriority || 'WARM',
        childFullName,
        input.childFirstName.trim(),
        input.childMiddleName?.trim() || null,
        input.childLastName.trim(),
        input.childDob || null,
        input.childGender || 'Male',
        input.admissionClass,
        input.admissionClass,
        input.currentClass || null,
        input.currentSchool || null,
        input.currentBoard || null,
        input.reasonForChange || null,
        input.specialTalents || null,
        input.streamPreference || null,
        input.secondLanguagePreference || null,
        input.primaryGuardianName.trim(),
        input.primaryGuardianName.trim(),
        input.primaryGuardianRelation || 'FATHER',
        input.primaryGuardianPhone.trim(),
        input.primaryGuardianPhone.trim(),
        input.primaryGuardianWhatsapp?.trim() || null,
        input.primaryGuardianEmail.trim(),
        input.primaryGuardianEmail.trim(),
        input.primaryGuardianOccupation || null,
        input.primaryGuardianCompany || null,
        input.primaryGuardianDesignation || null,
        input.secondaryGuardianName || null,
        input.secondaryGuardianRelation || null,
        input.secondaryGuardianPhone || null,
        input.secondaryGuardianEmail || null,
        input.secondaryGuardianOccupation || null,
        input.addressLine1 || null,
        input.localityArea?.trim() || 'Delhi',
        'Delhi',
        'Delhi',
        input.pincode || '110084',
        input.landmark || null,
        Boolean(input.transportRequired),
        Boolean(input.visitRequested),
        input.visitDate || null,
        input.visitSlot || null,
        input.visitRequested ? 'SCHEDULED' : 'NONE',
        input.interestAreas || [],
        input.enquirySource || 'Walk-in',
        input.parentMessage || null,
        input.counsellorNotes || null,
        input.preferredContactChannel || 'PHONE',
        input.preferredContactTime || null
      ]
    );

    const enq = insertRes.rows[0];

    // Log initial counsellor note if provided
    if (input.counsellorNotes) {
      await client.query(
        `INSERT INTO public.enquiry_followups (
          enquiry_id, counsellor_name, channel, outcome, internal_notes
        ) VALUES ($1, $2, 'IN_PERSON', 'CONNECTED', $3);`,
        [enq.id, input.assignedCounsellorName || 'Admissions Desk', input.counsellorNotes]
      );
    }

    safeRevalidate('/admin/enquiries');
    safeRevalidate('/admin/admissions');

    return {
      success: true,
      enquiryId: enq.id,
      enquiryNumber: enq.enquiry_number,
      message: `Enquiry ${enq.enquiry_number} created successfully!`
    };
  } catch (error: any) {
    console.error("Error in createInternalEnquiryAction:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 5. LOG FOLLOW-UP ACTIVITY & AUTO-ADVANCE STATUS
// -------------------------------------------------------------
export async function logEnquiryFollowupAction(input: EnquiryFollowupInput) {
  const p = getPool();
  const client = await p.connect();

  try {
    // 1. Insert activity log
    await client.query(
      `INSERT INTO public.enquiry_followups (
        enquiry_id, counsellor_name, channel, contacted_person,
        outcome, parent_feedback, internal_notes, next_action, next_action_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'COMPLETED');`,
      [
        input.enquiryId,
        input.counsellorName || 'Admissions Counsellor',
        input.channel,
        input.contactedPerson || 'Parent',
        input.outcome,
        input.parentFeedback || null,
        input.internalNotes,
        input.nextAction || null,
        input.nextActionDate || null
      ]
    );

    // 2. Update Enquiry Master
    let newStatus = input.advanceStatusTo;
    if (!newStatus) {
      if (input.outcome === 'VISIT_SCHEDULED') newStatus = 'CAMPUS_VISIT';
      else if (input.outcome === 'APPLICATION_REQUESTED') newStatus = 'APPLICATION_STARTED';
      else if (input.outcome === 'APPLICATION_SUBMITTED') newStatus = 'APPLICATION_SUBMITTED';
      else if (input.outcome === 'LOST') newStatus = 'LOST';
      else newStatus = 'CONTACTED';
    }

    await client.query(
      `UPDATE public.enquiries
       SET status = $1,
           follow_up_date = $2,
           updated_at = NOW()
       WHERE id = $3;`,
      [newStatus, input.nextActionDate || null, input.enquiryId]
    );

    safeRevalidate('/admin/enquiries');
    safeRevalidate('/admin/admissions');

    return {
      success: true,
      message: `Follow-up logged successfully! Lead status updated to ${newStatus}.`
    };
  } catch (error: any) {
    console.error("Error in logEnquiryFollowupAction:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 6. SEARCH EXISTING SIBLING STUDENT
// -------------------------------------------------------------
export async function searchExistingSiblingStudentAction(searchTerm: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    const term = `%${searchTerm.trim()}%`;
    const res = await client.query(
      `SELECT s.id, s.first_name, s.last_name, s.admission_no, s.dob, s.photo_url,
              se.class_name, se.section_name, se.institution_code
       FROM public.students s
       LEFT JOIN public.student_enrollments se ON s.id = se.student_id AND se.is_current = true
       WHERE (
         s.first_name ILIKE $1 OR
         s.last_name ILIKE $1 OR
         s.admission_no ILIKE $1 OR
         s.universal_id ILIKE $1
       )
       LIMIT 10;`,
      [term]
    );

    return { success: true, students: res.rows || [] };
  } catch (error: any) {
    console.error("Error in searchExistingSiblingStudentAction:", error);
    return { success: false, error: error.message, students: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 7. 1-CLICK CONVERT ENQUIRY TO ADMISSION APPLICATION
// -------------------------------------------------------------
export async function convertEnquiryToApplicationAction(enquiryId: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    await client.query('BEGIN');

    const enqRes = await client.query(`SELECT * FROM public.enquiries WHERE id = $1 LIMIT 1;`, [enquiryId]);
    if (enqRes.rows.length === 0) throw new Error("Enquiry not found");
    const enq = enqRes.rows[0];

    // Check if already converted
    if (enq.converted_application_id) {
      return {
        success: true,
        alreadyConverted: true,
        applicationId: enq.converted_application_id,
        message: "Enquiry already converted to an application."
      };
    }

    // Generate Application Number
    const appSeq = Math.floor(1000 + Math.random() * 9000);
    const appNo = `APP-2026-${appSeq}`;

    const appInsert = await client.query(
      `INSERT INTO public.admissions_applications (
        enquiry_id, application_number, student_name, first_name, last_name,
        dob, gender, grade_applying_for, academic_year,
        father_name, father_mobile, father_email,
        mother_name, address, status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12,
        $13, $14, 'SUBMITTED', NOW()
      ) RETURNING id, application_number;`,
      [
        enq.id,
        appNo,
        enq.child_name || `${enq.child_first_name} ${enq.child_last_name}`,
        enq.child_first_name || enq.child_name?.split(' ')[0] || 'Student',
        enq.child_last_name || enq.child_name?.split(' ').slice(1).join(' ') || '',
        enq.child_dob || '2020-01-01',
        enq.child_gender || 'Male',
        enq.admission_class || enq.grade_interested || 'Class 1',
        enq.academic_session || '2026-2027',
        enq.primary_guardian_name || enq.parent_name,
        enq.primary_guardian_phone || enq.parent_phone,
        enq.primary_guardian_email || enq.parent_email,
        enq.secondary_guardian_name || 'Mother',
        enq.address_line1 || enq.locality_area || 'Delhi NCR',
      ]
    );

    const appId = appInsert.rows[0].id;

    // Update enquiry conversion status
    await client.query(
      `UPDATE public.enquiries
       SET conversion_status = 'CONVERTED',
           converted_application_id = $1,
           conversion_date = NOW(),
           status = 'APPLICATION_SUBMITTED'
       WHERE id = $2;`,
      [appId, enquiryId]
    );

    // Log followup
    await client.query(
      `INSERT INTO public.enquiry_followups (
        enquiry_id, counsellor_name, channel, outcome, internal_notes
      ) VALUES ($1, 'Admissions CRM', 'SYSTEM', 'APPLICATION_SUBMITTED', 'Enquiry converted to official Admission Application #' || $2 || '.');`,
      [enquiryId, appNo]
    );

    await client.query('COMMIT');

    safeRevalidate('/admin/enquiries');
    safeRevalidate('/admin/admissions');

    return {
      success: true,
      applicationId: appId,
      applicationNumber: appNo,
      message: `Enquiry converted successfully! Generated Official Application #${appNo}.`
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("Error in convertEnquiryToApplicationAction:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 8. UPDATE ENQUIRY STATUS / PRIORITY DIRECT
// -------------------------------------------------------------
export async function updateEnquiryStatusAction(enquiryId: string, status: string, notes?: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    await client.query(
      `UPDATE public.enquiries SET status = $1, updated_at = NOW() WHERE id = $2;`,
      [status, enquiryId]
    );

    if (notes) {
      await client.query(
        `INSERT INTO public.enquiry_followups (
          enquiry_id, channel, outcome, internal_notes
        ) VALUES ($1, 'SYSTEM', $2, $3);`,
        [enquiryId, status, notes]
      );
    }

    safeRevalidate('/admin/enquiries');
    safeRevalidate('/admin/admissions');

    return { success: true, message: `Status updated to ${status}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 9. BACKWARD COMPATIBILITY ALIASES
// -------------------------------------------------------------
export async function createAdmissionEnquiry(data: any) {
  const res = await createInternalEnquiryAction({
    academicSession: data.academic_session || "2026-2027",
    institutionCode: data.institution_code || "CBS",
    admissionClass: data.class_applying_for || data.grade_interested || "Class 1",
    childFirstName: data.first_name || data.child_name?.split(' ')[0] || "Child",
    childMiddleName: data.middle_name || "",
    childLastName: data.last_name || data.child_name?.split(' ').slice(1).join(' ') || "Student",
    childDob: data.dob || "2020-01-01",
    childGender: data.gender || "Male",
    primaryGuardianName: data.father_name || data.parent_name || data.mother_name || "Parent",
    primaryGuardianRelation: data.primary_contact?.toUpperCase() || "FATHER",
    primaryGuardianPhone: data.father_mobile || data.parent_phone || data.mother_mobile || "9811102008",
    primaryGuardianWhatsapp: data.father_whatsapp || data.mother_whatsapp,
    primaryGuardianEmail: data.father_email || data.parent_email || data.mother_email || "parent@gmail.com",
    localityArea: data.locality || data.address || "Delhi",
    pincode: data.pincode || "110084",
    enquirySource: data.source || "Walk-in",
    counsellorNotes: data.counselling_notes || data.notes || ""
  });

  if (res.success) {
    return {
      success: true,
      enquiryId: res.enquiryId,
      enquiryNo: res.enquiryNumber,
      enquiryNumber: res.enquiryNumber,
      message: res.message
    };
  }
  return res;
}

export async function submitPublicEnquiry(data: any) {
  return createPublicEnquiryAction({
    academicSession: data.academic_session || "2026-2027",
    institutionCode: data.campus || data.institution_code || "CBS",
    admissionClass: data.grade_interested || data.admissionClass || "Class 1",
    childFirstName: data.child_name?.split(' ')[0] || "Student",
    childLastName: data.child_name?.split(' ').slice(1).join(' ') || "",
    childDob: data.dob || "2020-01-01",
    childGender: data.gender || "Male",
    primaryGuardianName: data.parent_name || "Parent",
    primaryGuardianRelation: "FATHER",
    primaryGuardianPhone: data.parent_phone || "9811102008",
    primaryGuardianEmail: data.parent_email || "parent@gmail.com",
    localityArea: data.locality || "Delhi",
    pincode: "110084",
    enquirySource: data.source || "Website",
    parentMessage: data.notes || ""
  });
}

export async function updateAdmissionEnquiry(enquiryId: string, data: any) {
  return updateEnquiryStatusAction(enquiryId, data.status || "CONTACTED", data.notes);
}

export async function addEnquiryTimelineLog(enquiryId: string, logData: any) {
  return logEnquiryFollowupAction({
    enquiryId,
    counsellorName: logData.staff_name || "Admissions Counsellor",
    channel: logData.interaction_type || "PHONE",
    outcome: logData.stage || "CONNECTED",
    internalNotes: logData.notes || logData.remarks || "Follow-up interaction logged."
  });
}

export async function convertEnquiryToStudent(enquiryId: string, _classId?: string, _secId?: string) {
  return convertEnquiryToApplicationAction(enquiryId);
}


