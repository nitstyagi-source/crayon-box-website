"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

function getPool() {
  return new Pool({ connectionString });
}

export interface RubricDefinition {
  id: string;
  name: string;
  grade_level: string;
  domain: string;
  competency_name: string;
  descriptors: Array<{ level: number; title: string; description: string }>;
}

export interface Student360Evaluation {
  id: string;
  student_id: string;
  student_name: string;
  academic_year: string;
  term: string;
  evaluator_type: 'TEACHER' | 'SELF' | 'PEER' | 'PARENT';
  evaluator_name: string;
  domain: 'COGNITIVE' | 'AFFECTIVE' | 'PSYCHOMOTOR' | 'SOCIO_EMOTIONAL';
  competency: string;
  score: number;
  evidence_notes?: string;
  created_at: string;
}

/**
 * Seed or retrieve CBSE NEP 2020 Rubrics
 */
export async function getAssessmentRubricsAction() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.assessment_rubrics WHERE is_active = true ORDER BY domain, competency_name;
    `);

    if (res.rows.length === 0) {
      // Seed standard CBSE NEP 2020 competencies
      const defaultRubrics = [
        {
          name: 'CBSE NEP 2020 Holistic Rubric',
          grade: 'Primary & Middle',
          domain: 'COGNITIVE',
          comp: 'Critical Inquiry & Scientific Reasoning'
        },
        {
          name: 'CBSE NEP 2020 Holistic Rubric',
          grade: 'Primary & Middle',
          domain: 'AFFECTIVE',
          comp: 'Empathy, Inclusivity & Respect for Diversity'
        },
        {
          name: 'CBSE NEP 2020 Holistic Rubric',
          grade: 'Primary & Middle',
          domain: 'PSYCHOMOTOR',
          comp: 'Fine Motor Agility & Kinesthetic Health'
        },
        {
          name: 'CBSE NEP 2020 Holistic Rubric',
          grade: 'Primary & Middle',
          domain: 'SOCIO_EMOTIONAL',
          comp: 'Self-Regulation, Team Collaboration & Conflict Resolution'
        }
      ];

      for (const r of defaultRubrics) {
        await client.query(`
          INSERT INTO public.assessment_rubrics (name, grade_level, domain, competency_name)
          VALUES ($1, $2, $3, $4);
        `, [r.name, r.grade, r.domain, r.comp]);
      }

      const refreshed = await client.query(`SELECT * FROM public.assessment_rubrics WHERE is_active = true;`);
      return { success: true, rubrics: refreshed.rows as RubricDefinition[] };
    }

    return { success: true, rubrics: res.rows as RubricDefinition[] };
  } catch (error: any) {
    console.error('Failed to get assessment rubrics:', error);
    return { success: false, rubrics: [], error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Record a 360-degree evaluation (Self, Peer, Teacher, Parent)
 */
export async function record360EvaluationAction(data: {
  student_id: string;
  student_name: string;
  term?: string;
  evaluator_type: 'TEACHER' | 'SELF' | 'PEER' | 'PARENT';
  evaluator_name: string;
  domain: 'COGNITIVE' | 'AFFECTIVE' | 'PSYCHOMOTOR' | 'SOCIO_EMOTIONAL';
  competency: string;
  score: number;
  evidence_notes?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(`
      INSERT INTO public.student_competency_evaluations (
        student_id, student_name, term, evaluator_type, evaluator_name,
        domain, competency, score, evidence_notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id;
    `, [
      data.student_id,
      data.student_name,
      data.term || 'Term 1',
      data.evaluator_type,
      data.evaluator_name,
      data.domain,
      data.competency,
      data.score,
      data.evidence_notes || null
    ]);

    revalidatePath('/admin/exams');
    return { success: true, id: res.rows[0].id };
  } catch (error: any) {
    console.error('Failed to record 360 evaluation:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Get 360 Holistic Card for a specific student
 */
export async function getStudentHolisticCardDataAction(studentId: string, term: string = 'Term 1') {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const [evalRes, portRes] = await Promise.all([
      client.query(`
        SELECT * FROM public.student_competency_evaluations
        WHERE student_id = $1 AND term = $2
        ORDER BY created_at DESC;
      `, [studentId, term]),
      client.query(`
        SELECT * FROM public.student_learning_portfolios
        WHERE student_id = $1
        ORDER BY created_at DESC;
      `, [studentId])
    ]);

    return {
      success: true,
      evaluations: evalRes.rows as Student360Evaluation[],
      portfolios: portRes.rows
    };
  } catch (error: any) {
    console.error('Failed to get student holistic card data:', error);
    return { success: false, evaluations: [], portfolios: [], error: error.message };
  } finally {
    client.release();
  }
}
