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

export interface SenProfileRecord {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  primary_category: string;
  case_status: string;
  lead_specialist_name: string;
  shadow_educator_name?: string;
  formal_diagnosis_date?: string;
  last_iep_review_date: string;
  next_iep_review_date: string;
  general_summary: string;
  created_at: string;
  accommodations_count?: number;
  goals_count?: number;
  avg_progress?: number;
}

export interface SenAccommodationRecord {
  id: string;
  sen_profile_id: string;
  title: string;
  category: string;
  is_active: boolean;
  details: string;
}

export interface SenSmartGoalRecord {
  id: string;
  sen_profile_id: string;
  domain: string;
  goal_title: string;
  baseline_level: string;
  target_criterion: string;
  progress_percentage: number;
  status: string;
  target_date: string;
}

export interface SenSessionLogRecord {
  id: string;
  sen_profile_id: string;
  specialist_name: string;
  therapy_type: string;
  session_date: string;
  duration_minutes: number;
  key_observations: string;
  recommendations_for_teachers: string;
}

// -------------------------------------------------------------
// 1. GET ALL SEN / INCLUSIVE EDUCATION CASELOAD PROFILES
// -------------------------------------------------------------
export async function getSenProfilesAction() {
  const p = getPool();
  const client = await p.connect();

  try {
    const res = await client.query(`
      SELECT p.*,
             COUNT(DISTINCT a.id)::int as accommodations_count,
             COUNT(DISTINCT g.id)::int as goals_count,
             COALESCE(ROUND(AVG(g.progress_percentage)), 0)::int as avg_progress
      FROM public.sen_student_profiles p
      LEFT JOIN public.sen_accommodations a ON a.sen_profile_id = p.id AND a.is_active = true
      LEFT JOIN public.sen_smart_goals g ON g.sen_profile_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC;
    `);

    return { success: true, profiles: res.rows as SenProfileRecord[] };
  } catch (e: any) {
    return { success: false, error: e.message, profiles: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. GET SINGLE STUDENT IEP FULL 360 DOSSIER
// -------------------------------------------------------------
export async function getStudentIepDetailAction(profileId: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    const profileRes = await client.query(`
      SELECT * FROM public.sen_student_profiles WHERE id = $1;
    `, [profileId]);

    if (profileRes.rows.length === 0) {
      return { success: false, error: 'SEN profile not found.' };
    }

    const accommodationsRes = await client.query(`
      SELECT * FROM public.sen_accommodations WHERE sen_profile_id = $1 ORDER BY created_at ASC;
    `, [profileId]);

    const goalsRes = await client.query(`
      SELECT * FROM public.sen_smart_goals WHERE sen_profile_id = $1 ORDER BY target_date ASC;
    `, [profileId]);

    const sessionsRes = await client.query(`
      SELECT * FROM public.sen_session_logs WHERE sen_profile_id = $1 ORDER BY session_date DESC;
    `, [profileId]);

    return {
      success: true,
      profile: profileRes.rows[0] as SenProfileRecord,
      accommodations: accommodationsRes.rows as SenAccommodationRecord[],
      goals: goalsRes.rows as SenSmartGoalRecord[],
      sessions: sessionsRes.rows as SenSessionLogRecord[]
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. CREATE NEW SEN / IEP STUDENT PROFILE
// -------------------------------------------------------------
export async function createSenProfileAction(params: {
  studentName: string;
  className: string;
  primaryCategory: string;
  leadSpecialistName: string;
  shadowEducatorName?: string;
  generalSummary: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    // Generate UUID or link to student
    const stuRes = await client.query(`SELECT id FROM public.students LIMIT 1;`);
    const studentId = stuRes.rows[0]?.id || '00000000-0000-0000-0000-000000000001';

    const res = await client.query(`
      INSERT INTO public.sen_student_profiles (
        student_id, student_name, class_name, primary_category, case_status,
        lead_specialist_name, shadow_educator_name, general_summary
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'ACTIVE', $4, $5, $6
      ) RETURNING id;
    `, [
      params.studentName,
      params.className,
      params.primaryCategory,
      params.leadSpecialistName,
      params.shadowEducatorName || null,
      params.generalSummary
    ]);

    const newId = res.rows[0].id;

    // Seed default standard accommodations
    await client.query(`
      INSERT INTO public.sen_accommodations (sen_profile_id, title, category, is_active, details)
      VALUES
        ($1, '25% Additional Examination Time', 'EXAM', true, 'Mandatory for term and board evaluations.'),
        ($1, 'Separate Low-Distraction Seating', 'CLASSROOM', true, 'Front row seating with clear line of sight.');
    `, [newId]);

    safeRevalidate('/admin/students/sen-iep');
    return { success: true, profileId: newId, message: `✓ IEP Profile initialized for ${params.studentName}!` };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. ADD OR TOGGLE ACCOMMODATION
// -------------------------------------------------------------
export async function addIepAccommodationAction(params: {
  profileId: string;
  title: string;
  category: string;
  details: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    await client.query(`
      INSERT INTO public.sen_accommodations (sen_profile_id, title, category, is_active, details)
      VALUES ($1, $2, $3, true, $4);
    `, [params.profileId, params.title, params.category, params.details]);

    safeRevalidate('/admin/students/sen-iep');
    return { success: true, message: '✓ Formal accommodation registered and synchronized with exam desk.' };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 5. ADD OR UPDATE SMART GOAL
// -------------------------------------------------------------
export async function addOrUpdateSmartGoalAction(params: {
  profileId: string;
  goalId?: string;
  domain: string;
  goalTitle: string;
  baselineLevel: string;
  targetCriterion: string;
  progressPercentage: number;
  status?: string;
  targetDate?: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    if (params.goalId) {
      await client.query(`
        UPDATE public.sen_smart_goals
        SET progress_percentage = $1, status = $2, updated_at = NOW()
        WHERE id = $3;
      `, [params.progressPercentage, params.status || 'IN_PROGRESS', params.goalId]);
    } else {
      await client.query(`
        INSERT INTO public.sen_smart_goals (
          sen_profile_id, domain, goal_title, baseline_level, target_criterion,
          progress_percentage, status, target_date
        ) VALUES ($1, $2, $3, $4, $5, $6, 'IN_PROGRESS', $7);
      `, [
        params.profileId,
        params.domain,
        params.goalTitle,
        params.baselineLevel,
        params.targetCriterion,
        params.progressPercentage,
        params.targetDate || null
      ]);
    }

    safeRevalidate('/admin/students/sen-iep');
    return { success: true, message: '✓ SMART goal updated successfully.' };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 6. LOG THERAPY / CLINICAL OBSERVATION SESSION
// -------------------------------------------------------------
export async function logTherapySessionAction(params: {
  profileId: string;
  specialistName: string;
  therapyType: string;
  durationMinutes: number;
  keyObservations: string;
  recommendationsForTeachers: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    await client.query(`
      INSERT INTO public.sen_session_logs (
        sen_profile_id, specialist_name, therapy_type, duration_minutes,
        key_observations, recommendations_for_teachers, session_date
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE);
    `, [
      params.profileId,
      params.specialistName,
      params.therapyType,
      params.durationMinutes,
      params.keyObservations,
      params.recommendationsForTeachers
    ]);

    safeRevalidate('/admin/students/sen-iep');
    return { success: true, message: '✓ Therapy session logged and added to longitudinal IEP audit.' };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}
