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

const MOCK_QUESTIONS: CbtQuestion[] = [
  {
    id: 'q1',
    question_number: 1,
    section: 'Section A (Multiple Choice)',
    question_text: 'A spherical mirror and a thin spherical lens have each a focal length of -15 cm. The mirror and the lens are likely to be:',
    options: ['Both concave', 'Both convex', 'The mirror is concave and the lens is convex', 'The mirror is convex, but the lens is concave'],
    correct_option: 0,
    marks: 1
  },
  {
    id: 'q2',
    question_number: 2,
    section: 'Section A (Multiple Choice)',
    question_text: 'Which of the following represents the balanced chemical equation for the reaction of iron with steam?',
    options: [
      '2Fe + 3H2O -> Fe2O3 + 3H2',
      '3Fe + 4H2O -> Fe3O4 + 4H2',
      'Fe + H2O -> FeO + H2',
      '3Fe + 2H2O -> Fe3O2 + 2H2'
    ],
    correct_option: 1,
    marks: 1
  },
  {
    id: 'q3',
    question_number: 3,
    section: 'Section A (Multiple Choice)',
    question_text: 'The electrical resistivity of a given metallic wire depends upon:',
    options: ['Its length', 'Its thickness', 'Its shape', 'Nature of the material'],
    correct_option: 3,
    marks: 1
  },
  {
    id: 'q4',
    question_number: 4,
    section: 'Section B (Assertion & Reasoning)',
    question_text: 'Assertion (A): The inner lining of the small intestine has numerous finger-like projections called villi.\nReason (R): The villi increase the surface area for absorption of digested food.',
    options: [
      'Both (A) and (R) are true and (R) is the correct explanation of (A)',
      'Both (A) and (R) are true but (R) is NOT the correct explanation of (A)',
      '(A) is true but (R) is false',
      '(A) is false but (R) is true'
    ],
    correct_option: 0,
    marks: 2
  },
  {
    id: 'q5',
    question_number: 5,
    section: 'Section B (Assertion & Reasoning)',
    question_text: 'A wire of resistance R is cut into five equal pieces. These pieces are then connected in parallel. If the equivalent resistance is R\', the ratio R/R\' is:',
    options: ['1/25', '1/5', '5', '25'],
    correct_option: 3,
    marks: 2
  }
];

const MOCK_EXAM_TEMPLATES: CbtExamTemplate[] = [
  {
    id: 'cbt-board-10-sci',
    title: 'Class 10 Science Term-2 Standard CBT Mock',
    subject: 'Science',
    grade: 'Class 10',
    exam_type: 'BOARD_MOCK',
    duration_minutes: 120,
    total_marks: 80,
    is_lockdown_enabled: true,
    questions: MOCK_QUESTIONS
  },
  {
    id: 'cbt-jee-main-phy',
    title: 'JEE Main All India CBT Diagnostic Assessment - Mechanics & Optics',
    subject: 'Physics',
    grade: 'Class 12',
    exam_type: 'JEE_MAIN',
    duration_minutes: 180,
    total_marks: 100,
    is_lockdown_enabled: true,
    questions: MOCK_QUESTIONS
  },
  {
    id: 'cbt-board-10-math',
    title: 'Class 10 Standard Mathematics Digital Benchmark',
    subject: 'Mathematics',
    grade: 'Class 10',
    exam_type: 'BOARD_MOCK',
    duration_minutes: 120,
    total_marks: 80,
    is_lockdown_enabled: true,
    questions: MOCK_QUESTIONS
  }
];

const MOCK_PROCTOR_SESSIONS: CbtProctorSession[] = [
  {
    id: 'sess-1',
    student_name: 'Aarav Sharma',
    admission_no: 'CBS-2024-0012',
    status: 'IN_PROGRESS',
    answered_count: 4,
    total_questions: 5,
    tab_switch_violations: 0,
    fullscreen_violations: 0,
    time_remaining_sec: 4320
  },
  {
    id: 'sess-2',
    student_name: 'Ananya Verma',
    admission_no: 'CBS-2024-0018',
    status: 'FLAGGED',
    answered_count: 2,
    total_questions: 5,
    tab_switch_violations: 2,
    fullscreen_violations: 1,
    time_remaining_sec: 4100
  },
  {
    id: 'sess-3',
    student_name: 'Ishaan Patel',
    admission_no: 'CBS-2024-0024',
    status: 'SUBMITTED',
    answered_count: 5,
    total_questions: 5,
    tab_switch_violations: 0,
    fullscreen_violations: 0,
    time_remaining_sec: 0,
    current_score: 7
  },
  {
    id: 'sess-4',
    student_name: 'Priya Nair',
    admission_no: 'CBS-2024-0031',
    status: 'IN_PROGRESS',
    answered_count: 5,
    total_questions: 5,
    tab_switch_violations: 0,
    fullscreen_violations: 0,
    time_remaining_sec: 3950
  }
];

export async function getCbtTemplatesAction(): Promise<{
  success: boolean;
  templates: CbtExamTemplate[];
}> {
  return {
    success: true,
    templates: MOCK_EXAM_TEMPLATES
  };
}

export async function getCbtProctorStreamAction(templateId: string): Promise<{
  success: boolean;
  sessions: CbtProctorSession[];
}> {
  return {
    success: true,
    sessions: MOCK_PROCTOR_SESSIONS
  };
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
  return {
    success: true,
    warningMessage: `Integrity Alert: ${violationType} detected by proctor engine. Test session flagged for review.`,
    violationsCount: 1,
    autoDisqualified: false
  };
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
  let earnedScore = 0;
  let maxMarks = 0;

  MOCK_QUESTIONS.forEach((q) => {
    maxMarks += q.marks;
    if (answers[q.id] !== undefined && answers[q.id] === q.correct_option) {
      earnedScore += q.marks;
    }
  });

  const percentage = Number(((earnedScore / (maxMarks || 1)) * 100).toFixed(1));

  return {
    success: true,
    totalScore: earnedScore,
    maxScore: maxMarks,
    percentage,
    passed: percentage >= 33
  };
}
