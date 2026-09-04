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

export interface HouseRecord {
  id: string;
  code: string;
  name: string;
  color: string;
  accent_color: string;
  motto: string;
  crest_emoji: string;
  total_points: number;
  weekly_velocity: number;
  house_master_name: string;
  captain_student_name: string;
}

export interface MeritTypeRecord {
  id: string;
  category: string;
  name: string;
  default_points: number;
  tier: string;
  icon_name: string;
  is_positive: boolean;
}

export interface PointTransactionRecord {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  house_code: string;
  awarded_by_name: string;
  merit_name: string;
  category: string;
  points: number;
  reason: string;
  created_at: string;
}

export interface PastoralInterventionRecord {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  tier: string;
  trigger_reason: string;
  assigned_counselor_name: string;
  support_strategy: string;
  status: string;
  review_date: string;
  parent_notified: boolean;
  notes: string;
  created_at: string;
}

// -------------------------------------------------------------
// 1. GET HOUSE STANDINGS & LEADERBOARD
// -------------------------------------------------------------
export async function getHouseLeaderboardAction() {
  const p = getPool();
  const client = await p.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.school_houses
      ORDER BY total_points DESC;
    `);

    return { success: true, houses: res.rows as HouseRecord[] };
  } catch (e: any) {
    return { success: false, error: e.message, houses: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. GET PBIS MERIT RECOGNITION TYPES
// -------------------------------------------------------------
export async function getPbisMeritTypesAction() {
  const p = getPool();
  const client = await p.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.pbis_merit_types
      ORDER BY is_positive DESC, default_points DESC;
    `);

    return { success: true, meritTypes: res.rows as MeritTypeRecord[] };
  } catch (e: any) {
    return { success: false, error: e.message, meritTypes: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. AWARD MERIT OR DEMERIT POINTS TO A STUDENT & HOUSE
// -------------------------------------------------------------
export async function awardHousePointsAction(params: {
  studentId: string;
  studentName: string;
  className?: string;
  houseCode: string;
  awardedByName: string;
  meritName: string;
  category: string;
  points: number;
  reason: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    await client.query('BEGIN');

    // 1. Find house id
    const houseRes = await client.query(`
      SELECT id FROM public.school_houses WHERE code = $1;
    `, [params.houseCode]);
    const houseId = houseRes.rows[0]?.id || null;

    // 2. Insert transaction
    await client.query(`
      INSERT INTO public.pbis_point_transactions (
        student_id, student_name, class_name, house_id, house_code,
        awarded_by_name, merit_name, category, points, reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
    `, [
      params.studentId,
      params.studentName,
      params.className || 'Class 9',
      houseId,
      params.houseCode,
      params.awardedByName,
      params.meritName,
      params.category,
      params.points,
      params.reason
    ]);

    // 3. Increment house total_points and weekly_velocity
    if (houseId) {
      await client.query(`
        UPDATE public.school_houses
        SET total_points = total_points + $1,
            weekly_velocity = weekly_velocity + $1,
            updated_at = NOW()
        WHERE id = $2;
      `, [params.points, houseId]);
    }

    await client.query('COMMIT');

    safeRevalidate('/admin/pastoral/house-points');
    safeRevalidate('/admin/students');

    return {
      success: true,
      message: `✓ Awarded ${params.points > 0 ? '+' + params.points : params.points} points to ${params.studentName} (${params.houseCode} House)!`
    };
  } catch (e: any) {
    await client.query('ROLLBACK');
    console.error('Award points error:', e);
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. GET RECENT PRAISE & MERIT FEED
// -------------------------------------------------------------
export async function getPastoralFeedAction(limit = 25) {
  const p = getPool();
  const client = await p.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.pbis_point_transactions
      ORDER BY created_at DESC
      LIMIT $1;
    `, [limit]);

    return { success: true, feed: res.rows as PointTransactionRecord[] };
  } catch (e: any) {
    return { success: false, error: e.message, feed: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 5. GET MTSS PASTORAL INTERVENTIONS
// -------------------------------------------------------------
export async function getPastoralInterventionsAction() {
  const p = getPool();
  const client = await p.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.pastoral_interventions
      ORDER BY 
        CASE tier
          WHEN 'TIER_3' THEN 1
          WHEN 'TIER_2' THEN 2
          ELSE 3
        END,
        created_at DESC;
    `);

    return { success: true, interventions: res.rows as PastoralInterventionRecord[] };
  } catch (e: any) {
    return { success: false, error: e.message, interventions: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 6. CREATE PASTORAL INTERVENTION PLAN
// -------------------------------------------------------------
export async function createPastoralInterventionAction(params: {
  studentId: string;
  studentName: string;
  className?: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  triggerReason: string;
  assignedCounselorName: string;
  supportStrategy: string;
  reviewDate?: string;
  notes?: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    await client.query(`
      INSERT INTO public.pastoral_interventions (
        student_id, student_name, class_name, tier, trigger_reason,
        assigned_counselor_name, support_strategy, status, review_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', $8, $9);
    `, [
      params.studentId,
      params.studentName,
      params.className || 'Class 9',
      params.tier,
      params.triggerReason,
      params.assignedCounselorName,
      params.supportStrategy,
      params.reviewDate || null,
      params.notes || null
    ]);

    safeRevalidate('/admin/pastoral/house-points');
    return { success: true, message: `✓ MTSS ${params.tier} Pastoral Support Plan initiated for ${params.studentName}!` };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}
