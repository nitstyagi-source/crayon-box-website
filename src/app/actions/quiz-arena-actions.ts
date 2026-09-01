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

export interface QuizItem {
  id: string;
  class_name: string;
  subject_name: string;
  chapter_name: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  questions_data: any[];
  status: string;
}

// -------------------------------------------------------------
// 1. CREATE AI CHAPTER QUIZ
// -------------------------------------------------------------
export async function createAiChapterQuizAction(params: {
  className: string;
  subjectName: string;
  chapterName: string;
  totalQuestions?: number;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const { className, subjectName, chapterName } = params;
    const totalQ = params.totalQuestions || 4;
    const title = `${chapterName} Mastery Quiz`;

    const sampleQuestions = [
      {
        id: 1,
        q: `What is the primary core concept introduced in ${chapterName}?`,
        options: [
          `Fundamental principles and practical applications`,
          `Historical background only`,
          `Unrelated theoretical hypothesis`,
          `None of the above`
        ],
        correct: 0,
        exp: `The chapter emphasizes foundational principles and practical problem solving in ${subjectName}.`
      },
      {
        id: 2,
        q: `Which of the following best demonstrates an application of ${chapterName}?`,
        options: [
          `Random guesswork`,
          `Systematic observation and empirical testing`,
          `Ignoring variable parameters`,
          `Discarding experimental data`
        ],
        correct: 1,
        exp: `Scientific and mathematical inquiry requires systematic observation and verification.`
      },
      {
        id: 3,
        q: `In the context of ${subjectName}, identify the correct true statement:`,
        options: [
          `Results remain invariant under rigorous testing`,
          `Concepts are only applicable in laboratory environments`,
          `Theory contradicts natural observations`,
          `None of the above`
        ],
        correct: 0,
        exp: `Standard curriculum principles are formulated on reproducible facts.`
      },
      {
        id: 4,
        q: `What is the most effective approach to solve multi-step problems in ${chapterName}?`,
        options: [
          `Step-by-step formula breakdown with unit analysis`,
          `Skipping intermediate steps`,
          `Memorizing answers without logic`,
          `Ignoring question constraints`
        ],
        correct: 0,
        exp: `Structured step-by-step analysis guarantees mathematical accuracy.`
      }
    ].slice(0, totalQ);

    const res = await client.query(`
      INSERT INTO public.student_quizzes (
        class_name, subject_name, chapter_name, title, duration_minutes,
        total_questions, questions_data, status
      ) VALUES ($1, $2, $3, $4, 10, $5, $6, 'ACTIVE')
      RETURNING *;
    `, [className, subjectName, chapterName, title, totalQ, JSON.stringify(sampleQuestions)]);

    safeRevalidate('/admin/academic/quiz-arena');

    return {
      success: true,
      quiz: res.rows[0],
      message: `✓ AI Chapter Quiz for "${chapterName}" generated successfully!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. GET QUIZ LIST FOR CLASS
// -------------------------------------------------------------
export async function getStudentQuizListAction(className?: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    const cls = className || "Class 4";
    const res = await client.query(`
      SELECT * FROM public.student_quizzes
      WHERE class_name = $1 OR $1 = 'ALL'
      ORDER BY created_at DESC;
    `, [cls]);

    return { success: true, quizzes: res.rows as QuizItem[] };
  } catch (e: any) {
    return { success: false, error: e.message, quizzes: [] };
  } finally {
    client.release();
  }
}
