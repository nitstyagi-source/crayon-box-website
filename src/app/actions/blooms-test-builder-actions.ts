"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  return pool;
}

function safeRevalidate(path: string) {
  try { revalidatePath(path); } catch {}
}

/**
 * 1. GET QUESTION BANK FILTERED BY BLOOM'S TAXONOMY
 */
export async function getBloomsQuestionBankAction(grade?: string, subject?: string) {
  const p = getPool();
  const client = await p.connect();
  try {
    const { rows } = await client.query(`
      SELECT * FROM public.question_bank
      WHERE ($1::text IS NULL OR grade_level ILIKE $1)
        AND ($2::text IS NULL OR subject_name ILIKE $2)
      ORDER BY blooms_level ASC, marks ASC
    `, [grade ? `%${grade}%` : null, subject ? `%${subject}%` : null]);

    return {
      success: true,
      count: rows.length,
      questions: rows
    };
  } catch (err: any) {
    return { success: false, error: err.message, questions: [] };
  } finally {
    client.release();
  }
}

/**
 * 2. AUTO-GENERATE BLOOM'S TAXONOMY EXAM QUESTION PAPER
 */
export async function generateBloomsExamPaperAction(params: {
  title: string;
  gradeLevel: string;
  subjectName: string;
  totalMarks?: number;
  durationMinutes?: number;
  distribution?: {
    remembering: number; // e.g. 20%
    understanding: number; // e.g. 30%
    applying: number; // e.g. 30%
    analyzing: number; // e.g. 20%
  };
}) {
  const p = getPool();
  const client = await p.connect();
  try {
    const targetMarks = params.totalMarks || 50;
    const duration = params.durationMinutes || 60;
    const dist = params.distribution || { remembering: 20, understanding: 30, applying: 30, analyzing: 20 };

    // Fetch candidate questions from Question Bank
    const { rows: allQuestions } = await client.query(`
      SELECT * FROM public.question_bank
      WHERE grade_level ILIKE $1 AND subject_name ILIKE $2
    `, [`%${params.gradeLevel}%`, `%${params.subjectName}%`]);

    const questionsByLevel: { [key: string]: any[] } = {
      REMEMBERING: [],
      UNDERSTANDING: [],
      APPLYING: [],
      ANALYZING: []
    };

    allQuestions.forEach((q: any) => {
      const lvl = q.blooms_level.toUpperCase();
      if (questionsByLevel[lvl]) {
        questionsByLevel[lvl].push(q);
      }
    });

    const selectedQuestions: any[] = [];
    let accumulatedMarks = 0;

    // Pick questions across Bloom's levels
    for (const [level, qList] of Object.entries(questionsByLevel)) {
      if (qList.length > 0) {
        // Take questions from this level
        const sample = qList.slice(0, 2);
        for (const q of sample) {
          selectedQuestions.push(q);
          accumulatedMarks += q.marks;
        }
      }
    }

    // Save generated paper to database
    const { rows: paper } = await client.query(`
      INSERT INTO public.question_papers (
        title, grade_level, subject_name, total_marks, duration_minutes,
        generated_blueprint, questions_json, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, 'PUBLISHED'
      ) RETURNING id;
    `, [
      params.title,
      params.gradeLevel,
      params.subjectName,
      accumulatedMarks || targetMarks,
      duration,
      JSON.stringify(dist),
      JSON.stringify(selectedQuestions)
    ]);

    safeRevalidate('/admin/academics');

    return {
      success: true,
      paperId: paper[0].id,
      title: params.title,
      totalQuestions: selectedQuestions.length,
      totalMarks: accumulatedMarks || targetMarks,
      questions: selectedQuestions,
      blueprint: dist
    };
  } catch (err: any) {
    console.error('Bloom test generator error:', err);
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

/**
 * 3. GET PUBLISHED QUESTION PAPERS
 */
export async function getPublishedQuestionPapersAction() {
  const p = getPool();
  const client = await p.connect();
  try {
    const { rows } = await client.query(`
      SELECT * FROM public.question_papers ORDER BY created_at DESC LIMIT 10
    `);

    return {
      success: true,
      papers: rows
    };
  } catch (err: any) {
    return { success: false, error: err.message, papers: [] };
  } finally {
    client.release();
  }
}
