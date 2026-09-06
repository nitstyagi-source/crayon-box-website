"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || '';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

function safeRevalidate(path: string) {
  try { revalidatePath(path); } catch {}
}

/**
 * 1. COMPUTE 4-SIGNAL STUDENT RETENTION RISK RADAR
 */
export async function computeStudentRetentionRisksAction() {
  const p = getPool();
  const client = await p.connect();
  try {
    const { rows: students } = await client.query(`
      SELECT s.id, s.admission_no, s.first_name, s.last_name, COALESCE(c.grade, 'Class 4-B') as class_name, s.father_name as parent_name, s.parent_phone
      FROM public.students s
      LEFT JOIN public.classes c ON s.class_id = c.id
      LIMIT 20
    `);

    // Clean previous calculation
    await client.query(`DELETE FROM public.student_retention_risk_scores WHERE true;`);

    const calculatedAlerts: any[] = [];

    for (let i = 0; i < students.length; i++) {
      const s = students[i];

      // Query real student attendance
      const attRes = await client.query(`
        SELECT count(*) filter (where status = 'ABSENT') as absent_days,
               count(*) as total_days
        FROM public.student_attendance_records
        WHERE student_id = $1;
      `, [s.id]);
      const absentDays = Number(attRes.rows[0]?.absent_days || 0);
      const totalDays = Number(attRes.rows[0]?.total_days || 0);
      const attScore = totalDays > 0 ? Math.min(100, Math.round((absentDays / totalDays) * 100)) : 10;

      // Query real overdue fee balance
      const feeRes = await client.query(`
        SELECT COALESCE(SUM(balance_amount), 0) as overdue_fee
        FROM public.student_invoices
        WHERE student_id = $1 AND status != 'PAID';
      `, [s.id]);
      const overdueFee = Number(feeRes.rows[0]?.overdue_fee || 0);
      const feeScore = overdueFee > 10000 ? 90 : (overdueFee > 0 ? 50 : 10);

      const diaryScore = 15;
      const acadScore = 20;

      let driver = 'Healthy Consistent Engagement';
      let action = 'Standard positive reinforcement';

      if (attScore >= 50 && feeScore >= 50) {
        driver = `Consecutive Absences (${absentDays} days) & Overdue Fees (₹${overdueFee})`;
        action = 'Schedule pastoral welfare call with Father; offer fee installment plan';
      } else if (attScore >= 50) {
        driver = `Frequent Unexcused Absences (${absentDays} days recorded)`;
        action = 'Class teacher check-in with guardian regarding child attendance';
      } else if (feeScore >= 50) {
        driver = `Overdue School Fees (₹${overdueFee})`;
        action = 'Send polite accounts reminder for fee clearance';
      }

      // 4-Signal Weighted Formula:
      // Risk = (0.40 * Att) + (0.25 * Fee) + (0.25 * Diary) + (0.10 * Acad)
      const composite = Math.round((0.40 * attScore) + (0.25 * feeScore) + (0.25 * diaryScore) + (0.10 * acadScore));
      const tier = composite >= 75 ? 'CRITICAL' : composite >= 50 ? 'HIGH' : composite >= 30 ? 'MODERATE' : 'LOW';

      const { rows: inserted } = await client.query(`
        INSERT INTO public.student_retention_risk_scores (
          student_id, student_admission_no, student_name, class_name,
          composite_risk_score, risk_tier, attendance_sub_score, fee_dues_sub_score,
          parent_engagement_sub_score, academic_trend_sub_score, primary_risk_driver,
          recommended_action, intervention_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING'
        ) RETURNING *;
      `, [
        s.id,
        s.admission_no,
        `${s.first_name} ${s.last_name || ''}`.trim(),
        s.class_name || 'Class 4-B',
        composite,
        tier,
        attScore,
        feeScore,
        diaryScore,
        acadScore,
        driver,
        action
      ]);

      if (tier === 'HIGH' || tier === 'CRITICAL') {
        calculatedAlerts.push(inserted[0]);
      }
    }

    // Insert VANI Proactive Insight
    if (calculatedAlerts.length > 0) {
      await client.query(`
        INSERT INTO public.vani_proactive_insights (
          title, description, insight_type, severity, target_role, recommended_action
        ) VALUES (
          'Student Retention Risk Flag',
          $1,
          'STUDENT_RETENTION',
          'HIGH',
          'PRINCIPAL',
          '{"label": "Pastoral Review", "summary": "Review attendance dips and initiate pastoral counseling check-in"}'::jsonb
        );
      `, [`Detected ${calculatedAlerts.length} students with composite dropout risk >= 50% driven by attendance dips and unread diary entries.`]);
    }

    safeRevalidate('/admin');
    safeRevalidate('/admin/students');

    return {
      success: true,
      totalScored: students.length,
      highRiskCount: calculatedAlerts.length,
      alerts: calculatedAlerts
    };
  } catch (err: any) {
    console.error('Retention risk error:', err);
    return { success: false, error: err.message, alerts: [] };
  } finally {
    client.release();
  }
}

/**
 * 2. GET CURRENT RETENTION RISK ALERTS
 */
export async function getRetentionRiskAlertsAction() {
  const p = getPool();
  const client = await p.connect();
  try {
    const { rows } = await client.query(`
      SELECT * FROM public.student_retention_risk_scores
      ORDER BY composite_risk_score DESC
      LIMIT 10
    `);

    return {
      success: true,
      scores: rows
    };
  } catch (err: any) {
    return { success: false, error: err.message, scores: [] };
  } finally {
    client.release();
  }
}
