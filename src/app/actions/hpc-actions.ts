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
 * Seed or retrieve NEP 2020 Rubrics
 */
export async function getAssessmentRubricsAction() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.assessment_rubrics WHERE is_active = true ORDER BY domain, competency_name;
    `);

    if (res.rows.length === 0) {
      // Seed standard NEP 2020 competencies
      const defaultRubrics = [
        {
          name: 'NEP 2020 Holistic Rubric',
          grade: 'Primary & Middle',
          domain: 'COGNITIVE',
          comp: 'Critical Inquiry & Scientific Reasoning'
        },
        {
          name: 'NEP 2020 Holistic Rubric',
          grade: 'Primary & Middle',
          domain: 'AFFECTIVE',
          comp: 'Empathy, Inclusivity & Respect for Diversity'
        },
        {
          name: 'NEP 2020 Holistic Rubric',
          grade: 'Primary & Middle',
          domain: 'PSYCHOMOTOR',
          comp: 'Fine Motor Agility & Kinesthetic Health'
        },
        {
          name: 'NEP 2020 Holistic Rubric',
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
 * Create or Update a Rubric
 */
export async function saveAssessmentRubricAction(rubric: {
  id?: string;
  name: string;
  grade_level: string;
  domain: string;
  competency_name: string;
  descriptors: Array<{ level: number; title: string; description: string }>;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    if (rubric.id) {
      await client.query(`
        UPDATE public.assessment_rubrics
        SET name = $1, grade_level = $2, domain = $3, competency_name = $4, descriptors = $5
        WHERE id = $6;
      `, [rubric.name, rubric.grade_level, rubric.domain, rubric.competency_name, JSON.stringify(rubric.descriptors), rubric.id]);
    } else {
      await client.query(`
        INSERT INTO public.assessment_rubrics (name, grade_level, domain, competency_name, descriptors)
        VALUES ($1, $2, $3, $4, $5);
      `, [rubric.name, rubric.grade_level, rubric.domain, rubric.competency_name, JSON.stringify(rubric.descriptors)]);
    }

    revalidatePath('/admin/academics/rubrics');
    revalidatePath('/admin/exams');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save assessment rubric:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Delete a rubric
 */
export async function deleteAssessmentRubricAction(id: string) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query(`DELETE FROM public.assessment_rubrics WHERE id = $1;`, [id]);
    revalidatePath('/admin/academics/rubrics');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete rubric:', error);
    return { success: false, error: error.message };
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
    revalidatePath('/teacher/evaluations/hpc');
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
    const [evalRes, portRes, stuRes] = await Promise.all([
      client.query(`
        SELECT * FROM public.student_competency_evaluations
        WHERE student_id = $1 AND term = $2
        ORDER BY created_at DESC;
      `, [studentId, term]),
      client.query(`
        SELECT * FROM public.student_learning_portfolios
        WHERE student_id = $1
        ORDER BY created_at DESC;
      `, [studentId]),
      client.query(`
        SELECT s.id, s.first_name || ' ' || s.last_name as full_name,
               COALESCE(s.admission_no, s.universal_id) as admission_no,
               COALESCE(c.grade, 'Class 1') as class_name,
               s.dob, s.gender, s.father_name, s.mother_name
        FROM public.students s
        LEFT JOIN public.classes c ON c.id = s.class_id
        WHERE s.id = $1 LIMIT 1;
      `, [studentId])
    ]);

    return {
      success: true,
      student: stuRes.rows[0] || null,
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

/**
 * Get roster of students for evaluation interfaces
 */
export async function getStudentsForEvaluationAction(className?: string) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    let query = `
      SELECT s.id, s.first_name || ' ' || s.last_name as name,
             COALESCE(s.admission_no, s.universal_id) as admission_no,
             COALESCE(c.grade, 'Class 1') as class_name
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE s.status = 'ACTIVE'
    `;
    const values: any[] = [];
    if (className && className !== 'ALL') {
      query += ` AND c.grade = $1`;
      values.push(className);
    }
    query += ` ORDER BY s.first_name ASC LIMIT 50;`;

    const res = await client.query(query, values);
    return { success: true, students: res.rows };
  } catch (error: any) {
    console.error('Failed to get students for evaluation:', error);
    return { success: false, students: [], error: error.message };
  } finally {
    client.release();
  }
}
