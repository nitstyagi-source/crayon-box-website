"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';
import { generateQuestionPaperWithKey } from '@/lib/services/ai/pedagogical-engine';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

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

export interface QuestionPaperItem {
  id: string;
  title: string;
  class_name: string;
  subject_name: string;
  exam_term: string;
  total_marks: number;
  duration_minutes: number;
  chapters: string;
  sections_data: any;
  solution_key_data?: any;
  created_at: string;
}

// -------------------------------------------------------------
// 1. GENERATE AI CBSE QUESTION PAPER WITH SOLUTION KEY (GEMINI 3.8 FLASH)
// -------------------------------------------------------------
export async function generateAiQuestionPaperAction(params: {
  className: string;
  subjectName: string;
  examTerm: string;
  totalMarks: number;
  chapters: string;
}) {
  try {
    const { className, subjectName, examTerm, totalMarks, chapters } = params;

    const res = await generateQuestionPaperWithKey({
      className,
      subject: subjectName,
      chapters,
      totalMarks,
      examTerm,
      difficulty: 'BALANCED'
    });

    safeRevalidate('/admin/exams/question-paper-generator');

    // Fetch the inserted paper row
    const p = getPool();
    const client = await p.connect();
    try {
      const { rows } = await client.query('SELECT * FROM public.question_papers WHERE id = $1', [res.paperId]);
      return {
        success: true,
        paper: rows[0],
        message: `✓ AI Examination Paper successfully generated for ${rows[0]?.title || className} with full answer key & marking scheme! (Engine: ${res.modelUsed})`
      };
    } finally {
      client.release();
    }
  } catch (e: any) {
    console.error('generateAiQuestionPaperAction error:', e);
    return { success: false, error: e.message };
  }
}

// -------------------------------------------------------------
// 2. GET RECENT QUESTION PAPERS
// -------------------------------------------------------------
export async function getQuestionBankListAction() {
  const p = getPool();
  const client = await p.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.question_papers ORDER BY created_at DESC LIMIT 50;
    `);
    return { success: true, papers: res.rows as QuestionPaperItem[] };
  } catch (e: any) {
    return { success: false, error: e.message, papers: [] };
  } finally {
    client.release();
  }
}
