"use server";

import { createClient } from '@/lib/supabase/server';

export interface CbtQuestion {
  id: string;
  question_number: number;
  section: string;
  question_text: string;
  options: string[];
  correct_option: number; // 0-indexed
  marks: number;
}

export interface CbtAssessment {
  id: string;
  title: string;
  grade_section: string;
  subject: string;
  total_marks: number;
  duration_minutes: number;
  exam_type: 'BOARD_MOCK' | 'CBSE_BOARD_MOCK' | 'JEE_MAIN' | 'NEET';
  questions_count: number;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
  start_window: string;
}

export interface CbtExamTemplate {
  id: string;
  title: string;
  subject: string;
  grade: string;
  exam_type: 'BOARD_MOCK' | 'CBSE_BOARD_MOCK' | 'JEE_MAIN' | 'NEET';
  duration_minutes: number;
  total_marks: number;
  is_lockdown_enabled: boolean;
  questions: CbtQuestion[];
}

export interface CbtProctorSession {
  id: string;
  student_name: string;
  admission_no: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'FLAGGED';
  answered_count: number;
  total_questions: number;
  tab_switch_violations: number;
  fullscreen_violations: number;
  time_remaining_sec: number;
  current_score?: number;
}

export async function getCbtTemplatesAction(): Promise<{
  success: boolean;
  templates: CbtExamTemplate[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: papers, error } = await supabase
      .from('question_papers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching question papers for CBT:", error);
      return { success: false, templates: [], error: error.message };
    }

    if (!papers || papers.length === 0) {
      return { success: true, templates: [] };
    }

    const templates: CbtExamTemplate[] = papers.map((p: any) => {
      let questions: CbtQuestion[] = [];
      if (Array.isArray(p.sections_data)) {
        let qNum = 1;
        p.sections_data.forEach((sec: any) => {
          if (Array.isArray(sec.questions)) {
            sec.questions.forEach((q: any) => {
              questions.push({
                id: q.id || `q-${qNum}`,
                question_number: qNum++,
                section: sec.section_name || sec.title || 'General',
                question_text: q.question_text || q.text || '',
                options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
                correct_option: typeof q.correct_option === 'number' ? q.correct_option : 0,
                marks: q.marks || 1
              });
            });
          }
        });
      }

      return {
        id: p.id,
        title: p.title || 'Assessment',
        subject: p.subject_name || 'General',
        grade: p.class_name || 'Standard',
        exam_type: 'BOARD_MOCK',
        duration_minutes: p.duration_minutes || 60,
        total_marks: p.total_marks || 100,
        is_lockdown_enabled: true,
        questions
      };
    });

    return { success: true, templates };
  } catch (err: any) {
    return { success: false, templates: [], error: err.message };
  }
}

export async function getCbtProctorStreamAction(templateId: string): Promise<{
  success: boolean;
  sessions: CbtProctorSession[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cbt_proctor_sessions')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, sessions: [], error: error.message };
    }

    const sessions: CbtProctorSession[] = (data || []).map((s: any) => ({
      id: s.id,
      student_name: s.student_name || 'Candidate',
      admission_no: s.admission_no || '',
      status: s.status || 'IN_PROGRESS',
      answered_count: s.answered_count || 0,
      total_questions: s.total_questions || 0,
      tab_switch_violations: s.tab_switch_violations || 0,
      fullscreen_violations: s.fullscreen_violations || 0,
      time_remaining_sec: s.time_remaining_sec || 0,
      current_score: s.current_score !== null ? Number(s.current_score) : undefined
    }));

    return { success: true, sessions };
  } catch (err: any) {
    return { success: false, sessions: [], error: err.message };
  }
}

export async function recordCbtViolationAction(
  sessionId: string,
  violationType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'BLUR_EVENT'
): Promise<{
  success: boolean;
  warningMessage: string;
  violationsCount: number;
  autoDisqualified: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data: current } = await supabase
      .from('cbt_proctor_sessions')
      .select('tab_switch_violations, fullscreen_violations, status')
      .eq('id', sessionId)
      .maybeSingle();

    let tabCount = current?.tab_switch_violations || 0;
    let fsCount = current?.fullscreen_violations || 0;

    if (violationType === 'TAB_SWITCH') tabCount++;
    if (violationType === 'FULLSCREEN_EXIT') fsCount++;

    const totalViolations = tabCount + fsCount;
    const shouldDisqualify = totalViolations >= 3;

    await supabase
      .from('cbt_proctor_sessions')
      .update({
        tab_switch_violations: tabCount,
        fullscreen_violations: fsCount,
        status: shouldDisqualify ? 'FLAGGED' : current?.status || 'IN_PROGRESS',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    return {
      success: true,
      warningMessage: `Integrity Alert: ${violationType} detected by proctor engine. (${totalViolations} logged)`,
      violationsCount: totalViolations,
      autoDisqualified: shouldDisqualify
    };
  } catch {
    return {
      success: true,
      warningMessage: `Integrity Alert: ${violationType} logged.`,
      violationsCount: 1,
      autoDisqualified: false
    };
  }
}

export async function submitCbtExamAction(
  templateId: string,
  answers: Record<string, number>
): Promise<{
  success: boolean;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data: paper } = await supabase
      .from('question_papers')
      .select('solution_key_data, sections_data, total_marks')
      .eq('id', templateId)
      .maybeSingle();

    let earnedScore = 0;
    let maxMarks = paper?.total_marks || 0;

    if (paper?.solution_key_data && typeof paper.solution_key_data === 'object' && !Array.isArray(paper.solution_key_data)) {
      const sol = paper.solution_key_data as Record<string, number>;
      Object.keys(answers).forEach((qId) => {
        if (sol[qId] !== undefined && sol[qId] === answers[qId]) {
          earnedScore += 1;
        }
      });
      if (maxMarks === 0) maxMarks = Object.keys(sol).length || Object.keys(answers).length;
    } else if (Array.isArray(paper?.sections_data)) {
      let totalQuestions = 0;
      paper.sections_data.forEach((sec: any) => {
        if (Array.isArray(sec.questions)) {
          sec.questions.forEach((q: any, idx: number) => {
            totalQuestions++;
            const qId = q.id || `q-${totalQuestions}`;
            const correctOpt = typeof q.correct_option === 'number' ? q.correct_option : 0;
            const qMarks = Number(q.marks) || 1;
            if (answers[qId] !== undefined && answers[qId] === correctOpt) {
              earnedScore += qMarks;
            }
          });
        }
      });
      if (maxMarks === 0) maxMarks = totalQuestions || Object.keys(answers).length;
    } else {
      maxMarks = maxMarks || Object.keys(answers).length;
      earnedScore = 0;
    }

    const percentage = maxMarks > 0 ? Number(((earnedScore / maxMarks) * 100).toFixed(1)) : 0;

    return {
      success: true,
      totalScore: earnedScore,
      maxScore: maxMarks,
      percentage,
      passed: percentage >= 33
    };
  } catch {
    return {
      success: false,
      totalScore: 0,
      maxScore: 0,
      percentage: 0,
      passed: false
    };
  }
}
