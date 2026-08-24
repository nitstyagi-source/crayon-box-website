"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let globalPool: pg.Pool | null = null;
function getPool() {
  if (!globalPool) {
    globalPool = new Pool({ 
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

function safeDateStr(d: any): string {
  if (!d) return new Date().toISOString().split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  if (typeof d === 'string') return d.split('T')[0];
  return String(d);
}

// -------------------------------------------------------------
// 1. GET INCIDENTS DASHBOARD & METRICS
// -------------------------------------------------------------
export async function getIncidentsDashboardAction(params: {
  incidentType?: string;
  severity?: string;
  status?: string;
  searchQuery?: string;
} = {}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    let query = `
      SELECT inc.*, 
             s.universal_id, 
             s.photo_url,
             s.father_name,
             s.mother_name,
             COALESCE(p.phone_number, '+91 98765 43210') as emergency_contact_phone,
             s.gender,
             COALESCE(s.date_of_birth, s.dob) as date_of_birth
      FROM public.school_incidents inc
      LEFT JOIN public.students s ON s.id = inc.student_id
      LEFT JOIN public.parents p ON p.id = s.parent_id
      WHERE 1=1
    `;
    const values: any[] = [];

    if (params.incidentType && params.incidentType !== 'ALL') {
      values.push(params.incidentType);
      query += ` AND inc.incident_type = $${values.length}`;
    }

    if (params.status && params.status !== 'ALL') {
      values.push(params.status);
      query += ` AND inc.status = $${values.length}`;
    }

    if (params.severity && params.severity !== 'ALL') {
      values.push(params.severity);
      query += ` AND inc.severity = $${values.length}`;
    }

    if (params.searchQuery && params.searchQuery.trim()) {
      values.push(`%${params.searchQuery.trim()}%`);
      query += ` AND (
        inc.person_name ILIKE $${values.length} OR 
        inc.admission_no ILIKE $${values.length} OR 
        inc.incident_code ILIKE $${values.length} OR 
        inc.category ILIKE $${values.length} OR 
        inc.location ILIKE $${values.length}
      )`;
    }

    query += ` ORDER BY inc.created_at DESC`;

    const res = await client.query(query, values);
    const incidents = res.rows.map((r: any) => ({
      ...r,
      incident_date: safeDateStr(r.incident_date),
      created_at: safeDateStr(r.created_at),
      investigation_notes: Array.isArray(r.investigation_notes) ? r.investigation_notes : []
    }));

    const counts = {
      totalIncidents: incidents.length,
      disciplineCount: incidents.filter((i: any) => i.incident_type === 'DISCIPLINE').length,
      medicalCount: incidents.filter((i: any) => i.incident_type === 'MEDICAL_INFIRMARY').length,
      safeguardingCount: incidents.filter((i: any) => i.incident_type === 'POCSO_SAFEGUARDING' || i.incident_type === 'SAFEGUARDING').length,
      pocsoCount: incidents.filter((i: any) => i.incident_type === 'POCSO_SAFEGUARDING' || i.incident_type === 'SAFEGUARDING').length,
      openCases: incidents.filter((i: any) => i.status === 'UNDER_INVESTIGATION' || i.status === 'LOGGED' || i.status === 'PARENT_CONFERENCE_HELD' || i.status === 'ACTION_TAKEN').length,
      resolvedCases: incidents.filter((i: any) => i.status === 'RESOLVED' || i.status === 'CLOSED').length,
      criticalCases: incidents.filter((i: any) => i.severity === 'CRITICAL').length
    };

    return { success: true, incidents, counts };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      incidents: [],
      counts: { totalIncidents: 0, disciplineCount: 0, medicalCount: 0, safeguardingCount: 0, pocsoCount: 0, openCases: 0, resolvedCases: 0, criticalCases: 0 }
    };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. GET ENROLLED STUDENTS FOR INSTANT AUTOCOMPLETE
// -------------------------------------------------------------
export async function getEnrolledStudentsForIncidentLookupAction(query: string = "") {
  const pool = getPool();
  const client = await pool.connect();

  try {
    let sql = `
      SELECT s.id, s.first_name, s.last_name, s.admission_no, s.universal_id,
             s.gender, COALESCE(s.date_of_birth, s.dob) as date_of_birth, s.father_name, s.mother_name,
             COALESCE(p.phone_number, '+91 98765 43210') as emergency_contact_phone,
             COALESCE(c.grade, 'Class 1') as class_name,
             COALESCE(c.section, 'A') as section_name,
             s.campus_id
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      LEFT JOIN public.parents p ON p.id = s.parent_id
      WHERE (s.status = 'ACTIVE' OR s.status IS NULL)
    `;
    const values: any[] = [];

    if (query && query.trim()) {
      values.push(`%${query.trim()}%`);
      sql += ` AND (
        s.first_name ILIKE $1 OR 
        s.last_name ILIKE $1 OR 
        s.admission_no ILIKE $1 OR 
        s.universal_id ILIKE $1
      )`;
    }

    sql += ` ORDER BY s.first_name ASC LIMIT 50`;

    const res = await client.query(sql, values);
    const students = res.rows.map((r: any) => ({
      id: r.id,
      name: `${r.first_name} ${r.last_name}`.trim(),
      admission_no: r.admission_no || r.universal_id,
      universal_id: r.universal_id,
      class_name: r.class_name,
      section_name: r.section_name,
      full_class: `${r.class_name}-${r.section_name}`,
      parent_name: r.father_name || r.mother_name || "Parent/Guardian",
      phone: r.emergency_contact_phone || "+91 98765 43210",
      campus_id: r.campus_id
    }));

    return { success: true, students };
  } catch (error: any) {
    return { success: false, error: error.message, students: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. LOG NEW INCIDENT / SAFEGUARDING CONCERN (REGISTRATION)
// -------------------------------------------------------------
export async function logSchoolIncidentAction(params: {
  incidentType: 'DISCIPLINE' | 'MEDICAL_INFIRMARY' | 'POCSO_SAFEGUARDING';
  studentId?: string;
  studentAdmissionNoOrName: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  incidentDate?: string;
  incidentTime?: string;
  description: string;
  immediateAction: string;
  witnesses?: string;
  otherPersonsInvolved?: string;
  reportedBy: string;
  reportedByRole?: string;
  parentInformed?: boolean;
  parentNotificationChannel?: string;
  parentContactedBy?: string;
  parentResponse?: string;
  studentDisposition?: string;
  counsellingRequired?: boolean;
  followUpRequired?: boolean;
  followUpDate?: string;
  attachments?: string[];
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const {
      incidentType,
      studentId: providedStudentId,
      studentAdmissionNoOrName,
      category,
      severity,
      location,
      incidentDate = new Date().toISOString().split('T')[0],
      incidentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      description,
      immediateAction,
      witnesses = "",
      otherPersonsInvolved = "",
      reportedBy,
      reportedByRole = "Designated Staff",
      parentInformed = true,
      parentNotificationChannel = "Phone Call",
      parentContactedBy = reportedBy,
      parentResponse = "Parent informed and acknowledged initial notice.",
      studentDisposition = "Returned to Class",
      counsellingRequired = false,
      followUpRequired = false,
      followUpDate = null,
      attachments = []
    } = params;

    // Lookup Student if not provided
    let studentId = providedStudentId || null;
    let personName = studentAdmissionNoOrName;
    let admissionNo = 'CBS-2026-0001';
    let className = 'Class 1';
    let sectionName = 'A';
    let campusId = 'c3d782a9-a50b-4708-a3fc-6b146f456662';

    if (providedStudentId) {
      const stuRes = await client.query(`
        SELECT s.id, s.first_name, s.last_name, s.admission_no, s.universal_id,
               COALESCE(c.grade, 'Class 1') as class_name,
               COALESCE(c.section, 'A') as section_name, s.campus_id
        FROM public.students s
        LEFT JOIN public.classes c ON c.id = s.class_id
        WHERE s.id = $1
        LIMIT 1
      `, [providedStudentId]);
      if (stuRes.rows.length > 0) {
        const stu = stuRes.rows[0];
        studentId = stu.id;
        personName = `${stu.first_name} ${stu.last_name}`;
        admissionNo = stu.admission_no || stu.universal_id;
        className = stu.class_name;
        sectionName = stu.section_name;
        campusId = stu.campus_id || campusId;
      }
    } else {
      const stuRes = await client.query(`
        SELECT s.id, s.first_name, s.last_name, s.admission_no, s.universal_id,
               COALESCE(c.grade, 'Class 1') as class_name,
               COALESCE(c.section, 'A') as section_name, s.campus_id
        FROM public.students s
        LEFT JOIN public.classes c ON c.id = s.class_id
        WHERE s.admission_no ILIKE $1 OR s.universal_id ILIKE $1 OR (s.first_name || ' ' || s.last_name) ILIKE $1
        LIMIT 1
      `, [studentAdmissionNoOrName]);

      if (stuRes.rows.length > 0) {
        const stu = stuRes.rows[0];
        studentId = stu.id;
        personName = `${stu.first_name} ${stu.last_name}`;
        admissionNo = stu.admission_no || stu.universal_id;
        className = stu.class_name;
        sectionName = stu.section_name;
        campusId = stu.campus_id || campusId;
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = incidentType === 'POCSO_SAFEGUARDING' ? 'SAFE' : incidentType === 'MEDICAL_INFIRMARY' ? 'MED' : 'DISC';
    const incidentCode = `INC-${prefix}-2026-${randomSuffix}`;

    const initialAuditNote = {
      timestamp: new Date().toISOString(),
      author: reportedBy,
      role: reportedByRole,
      action: 'CASE_REGISTERED',
      note: `Initial incident reported under ${category} at ${location}. Immediate action: ${immediateAction}`
    };

    const insertRes = await client.query(`
      INSERT INTO public.school_incidents (
        campus_id, incident_code, incident_type, incident_date, incident_time,
        location, person_type, student_id, person_name, admission_no,
        class_name, section_name, reported_by, reported_by_role, category, severity,
        description, immediate_action, witnesses, other_persons_involved,
        parent_informed, parent_notification_channel, parent_contacted_by, parent_contacted_at, parent_response,
        student_disposition, counselling_required, follow_up_required, follow_up_date,
        attachments, investigation_notes, status,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, 'STUDENT', $7, $8, $9,
        $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19,
        $20, $21, $22, NOW(), $23,
        $24, $25, $26, $27,
        $28::jsonb, $29::jsonb, 'UNDER_INVESTIGATION',
        NOW(), NOW()
      )
      RETURNING *
    `, [
      campusId, incidentCode, incidentType, incidentDate, incidentTime,
      location, studentId, personName, admissionNo,
      className, sectionName, reportedBy, reportedByRole, category, severity,
      description, immediateAction, witnesses, otherPersonsInvolved,
      parentInformed, parentNotificationChannel, parentContactedBy, parentResponse,
      studentDisposition, counsellingRequired, followUpRequired, followUpDate,
      JSON.stringify(attachments), JSON.stringify([initialAuditNote])
    ]);

    safeRevalidate('/admin/incidents');

    return {
      success: true,
      message: `✓ Case ${incidentCode} registered successfully in the Safeguarding & Incident Vault!`,
      incident: insertRes.rows[0]
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. ADD PROGRESS / INVESTIGATION NOTE TO CASE DOSSIER
// -------------------------------------------------------------
export async function addIncidentInvestigationNoteAction(params: {
  incidentId: string;
  author: string;
  role?: string;
  note: string;
  actionTaken?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { incidentId, author, role = 'Safeguarding Officer', note, actionTaken } = params;

    const currentRes = await client.query(`
      SELECT investigation_notes FROM public.school_incidents WHERE id = $1
    `, [incidentId]);

    if (currentRes.rows.length === 0) {
      return { success: false, error: "Incident record not found" };
    }

    const currentNotes = Array.isArray(currentRes.rows[0].investigation_notes) 
      ? currentRes.rows[0].investigation_notes 
      : [];

    const newNote = {
      id: `NOTE-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author,
      role,
      action: actionTaken || 'INVESTIGATION_NOTE',
      note
    };

    currentNotes.push(newNote);

    await client.query(`
      UPDATE public.school_incidents
      SET investigation_notes = $1::jsonb, updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(currentNotes), incidentId]);

    safeRevalidate('/admin/incidents');

    return {
      success: true,
      message: "✓ Investigation note added to case file.",
      notes: currentNotes
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 5. UPDATE INCIDENT WORKFLOW STATUS & ACTION PLAN
// -------------------------------------------------------------
export async function updateIncidentStatusAction(params: {
  incidentId: string;
  newStatus: 'UNDER_INVESTIGATION' | 'PARENT_CONFERENCE_HELD' | 'ACTION_TAKEN' | 'RESOLVED' | 'CLOSED';
  actionPlan?: string;
  parentUndertaking?: string;
  notes?: string;
  updatedBy?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { 
      incidentId, 
      newStatus, 
      actionPlan, 
      parentUndertaking, 
      notes = "Status updated during case review", 
      updatedBy = 'Designated Safeguarding Lead' 
    } = params;

    const currentRes = await client.query(`
      SELECT investigation_notes FROM public.school_incidents WHERE id = $1
    `, [incidentId]);

    const currentNotes = Array.isArray(currentRes.rows[0]?.investigation_notes) 
      ? currentRes.rows[0].investigation_notes 
      : [];

    currentNotes.push({
      timestamp: new Date().toISOString(),
      author: updatedBy,
      role: 'Designated Safeguarding Lead',
      action: `STATUS_CHANGED_${newStatus}`,
      note: `Case status progressed to ${newStatus}. ${notes}`
    });

    let updateSql = `
      UPDATE public.school_incidents
      SET status = $1, 
          investigation_notes = $2::jsonb,
          updated_at = NOW()
    `;
    const values: any[] = [newStatus, JSON.stringify(currentNotes)];

    if (actionPlan !== undefined) {
      values.push(actionPlan);
      updateSql += `, action_plan = $${values.length}`;
    }
    if (parentUndertaking !== undefined) {
      values.push(parentUndertaking);
      updateSql += `, parent_undertaking = $${values.length}`;
    }

    values.push(incidentId);
    updateSql += ` WHERE id = $${values.length}`;

    await client.query(updateSql, values);

    safeRevalidate('/admin/incidents');

    return {
      success: true,
      message: `✓ Case record progressed to status: ${newStatus.replace('_', ' ')}`
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 6. RESOLVE AND FINALIZE INCIDENT (FINAL REPORT SIGN-OFF)
// -------------------------------------------------------------
export async function resolveAndFinalizeIncidentAction(params: {
  incidentId: string;
  finalResolution: string;
  actionPlan: string;
  parentUndertaking?: string;
  closedBy: string;
  closedByRole?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { 
      incidentId, 
      finalResolution, 
      actionPlan, 
      parentUndertaking = "Parent signed undertaking on record.",
      closedBy,
      closedByRole = "Principal / Head of Institution"
    } = params;

    const currentRes = await client.query(`
      SELECT investigation_notes, incident_code FROM public.school_incidents WHERE id = $1
    `, [incidentId]);

    if (currentRes.rows.length === 0) {
      return { success: false, error: "Incident record not found" };
    }

    const currentNotes = Array.isArray(currentRes.rows[0].investigation_notes) 
      ? currentRes.rows[0].investigation_notes 
      : [];

    currentNotes.push({
      timestamp: new Date().toISOString(),
      author: closedBy,
      role: closedByRole,
      action: 'CASE_RESOLVED_AND_CLOSED',
      note: `Final Resolution: ${finalResolution}. Corrective Action Plan: ${actionPlan}`
    });

    const res = await client.query(`
      UPDATE public.school_incidents
      SET status = 'RESOLVED',
          final_resolution = $1,
          action_plan = $2,
          parent_undertaking = $3,
          closed_by = $4,
          closed_at = NOW(),
          report_generated_at = NOW(),
          investigation_notes = $5::jsonb,
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [finalResolution, actionPlan, parentUndertaking, closedBy, JSON.stringify(currentNotes), incidentId]);

    safeRevalidate('/admin/incidents');

    return {
      success: true,
      message: `✓ Case ${currentRes.rows[0].incident_code} successfully resolved, sealed, and official final report generated!`,
      incident: res.rows[0]
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 7. GET COMPLETE INCIDENT CASE DOSSIER FOR OFFICIAL REPORT
// -------------------------------------------------------------
export async function getIncidentFullDossierAction(incidentId: string) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(`
      SELECT inc.*, 
             s.universal_id, 
             s.photo_url,
             s.father_name,
             s.mother_name,
             COALESCE(p.phone_number, '+91 98765 43210') as emergency_contact_phone,
             s.gender,
             COALESCE(s.date_of_birth, s.dob) as date_of_birth,
             s.blood_group
      FROM public.school_incidents inc
      LEFT JOIN public.students s ON s.id = inc.student_id
      LEFT JOIN public.parents p ON p.id = s.parent_id
      WHERE inc.id = $1
    `, [incidentId]);

    if (res.rows.length === 0) {
      return { success: false, error: "Incident not found" };
    }

    const r = res.rows[0];
    const dossier = {
      ...r,
      incident_date: safeDateStr(r.incident_date),
      created_at: safeDateStr(r.created_at),
      closed_at: r.closed_at ? safeDateStr(r.closed_at) : null,
      investigation_notes: Array.isArray(r.investigation_notes) ? r.investigation_notes : [],
      attachments: Array.isArray(r.attachments) ? r.attachments : []
    };

    return { success: true, dossier };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
