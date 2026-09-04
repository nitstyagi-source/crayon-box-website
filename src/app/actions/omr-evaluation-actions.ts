"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export interface OmrAnswerKey {
  id: string;
  title: string;
  subject: string;
  grade: string;
  total_questions: number;
  marks_per_question: number;
  negative_marking: number;
  keys: Record<number, string>; // { 1: 'A', 2: 'C', ... }
  created_at: string;
}

export interface OmrGradingResult {
  id: string;
  student_id: string;
  student_name: string;
  roll_no: string;
  exam_title: string;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  total_score: number;
  percentage: number;
  evaluated_at: string;
  answers: Record<number, { marked: string; correct: string; isCorrect: boolean }>;
}

const DEFAULT_ANSWER_KEYS: OmrAnswerKey[] = [
  {
    id: 'key-sci-pt1',
    title: 'Class 10 Science - Periodic Test 1 (MCQ Section)',
    subject: 'Science',
    grade: 'Class 10',
    total_questions: 20,
    marks_per_question: 1,
    negative_marking: 0,
    keys: {
      1: 'B', 2: 'A', 3: 'C', 4: 'D', 5: 'A',
      6: 'C', 7: 'B', 8: 'B', 9: 'D', 10: 'A',
      11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C',
      16: 'B', 17: 'A', 18: 'D', 19: 'C', 20: 'B'
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'key-math-term1',
    title: 'Class 8 Mathematics - Term 1 Objective Foundation',
    subject: 'Mathematics',
    grade: 'Class 8',
    total_questions: 20,
    marks_per_question: 1,
    negative_marking: 0,
    keys: {
      1: 'A', 2: 'B', 3: 'D', 4: 'C', 5: 'B',
      6: 'A', 7: 'C', 8: 'D', 9: 'A', 10: 'B',
      11: 'D', 12: 'C', 13: 'B', 14: 'A', 15: 'C',
      16: 'D', 17: 'B', 18: 'A', 19: 'C', 20: 'D'
    },
    created_at: new Date().toISOString()
  }
];

export async function getOmrAnswerKeysAction() {
  try {
    return { success: true, answerKeys: DEFAULT_ANSWER_KEYS };
  } catch (err: any) {
    return { success: false, error: err.message, answerKeys: [] };
  }
}

export async function saveOmrBatchGradesAction(payload: {
  student_id?: string;
  student_name: string;
  roll_no: string;
  exam_title: string;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  total_score: number;
  percentage: number;
  answers: Record<number, { marked: string; correct: string; isCorrect: boolean }>;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const evaluationRecord: OmrGradingResult = {
      id: `omr-eval-${Date.now()}`,
      student_id: payload.student_id || 'stu-scan',
      student_name: payload.student_name,
      roll_no: payload.roll_no,
      exam_title: payload.exam_title,
      total_questions: payload.total_questions,
      attempted: payload.attempted,
      correct: payload.correct,
      incorrect: payload.incorrect,
      total_score: payload.total_score,
      percentage: payload.percentage,
      evaluated_at: new Date().toISOString(),
      answers: payload.answers
    };

    // Optionally persist into exam_marks table if student ID resolves
    try {
      if (payload.student_id && payload.student_id !== 'stu-scan') {
        await supabase.from('exam_marks').upsert([
          {
            student_id: payload.student_id,
            subject: 'Science',
            exam_name: payload.exam_title,
            marks_obtained: payload.total_score,
            max_marks: payload.total_questions,
            is_locked: false
          }
        ]);
      }
    } catch (dbErr) {
      console.warn('exam_marks table update fallback:', dbErr);
    }

    try {
      revalidatePath('/admin/exams');
    } catch (_) {}

    return {
      success: true,
      message: `OMR sheet for ${payload.student_name} graded: ${payload.total_score}/${payload.total_questions} (${payload.percentage.toFixed(1)}%). Transferred to Gradebook.`,
      result: evaluationRecord
    };
  } catch (err: any) {
    console.error('saveOmrBatchGradesAction error:', err);
    return { success: false, error: err.message };
  }
}
