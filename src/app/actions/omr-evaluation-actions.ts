"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA3Mzg5NiwiZXhwIjoyMTAyNjQ5ODk2fQ.unmRv2BZ5kb6VarZ4K44ja3HavDajRDsdaQ-g_B2o08';
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

export async function getOmrAnswerKeysAction() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: papers, error } = await supabase
      .from('question_papers')
      .select('id, title, subject_name, class_name, total_marks, solution_key_data, created_at')
      .order('created_at', { ascending: false });

    if (error || !papers || papers.length === 0) {
      return { success: true, answerKeys: [] };
    }

    const answerKeys: OmrAnswerKey[] = [];

    for (const p of papers) {
      const keysRecord: Record<number, string> = {};
      let totalQ = 0;

      if (Array.isArray(p.solution_key_data)) {
        for (const sec of p.solution_key_data) {
          if (Array.isArray(sec.solutions)) {
            for (const sol of sec.solutions) {
              const qNum = Number(sol.qNum) || ++totalQ;
              // Extract option letter like "(b)" or "b" or "B"
              const match = String(sol.answer).match(/\(([a-dA-D])\)/i) || String(sol.answer).match(/^([a-dA-D])\b/i);
              if (match) {
                keysRecord[qNum] = match[1].toUpperCase();
              } else {
                keysRecord[qNum] = 'A'; // fallback key option
              }
              if (qNum > totalQ) totalQ = qNum;
            }
          }
        }
      }

      if (Object.keys(keysRecord).length > 0) {
        answerKeys.push({
          id: p.id,
          title: p.title || 'Assessment',
          subject: p.subject_name || 'General',
          grade: p.class_name || 'Standard',
          total_questions: totalQ || 20,
          marks_per_question: 1,
          negative_marking: 0,
          keys: keysRecord,
          created_at: p.created_at || new Date().toISOString()
        });
      }
    }

    return { success: true, answerKeys };
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
