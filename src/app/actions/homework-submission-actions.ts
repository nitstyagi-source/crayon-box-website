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
 * 1. SUBMIT PARENT HANDWRITTEN HOMEWORK PHOTO
 */
export async function submitHomeworkPhotoAction(payload: {
  studentId: string;
  diaryEntryId?: string;
  photoUrl: string;
  studentNotes?: string;
}) {
  const p = getPool();
  const client = await p.connect();
  try {
    // Ensure column exists
    await client.query(`ALTER TABLE public.homework_submissions ADD COLUMN IF NOT EXISTS teacher_annotations JSONB;`);

    const { rows } = await client.query(`
      INSERT INTO public.homework_submissions (
        student_id, diary_entry_id, attachment_url, student_notes,
        status, submission_date
      ) VALUES (
        $1, $2, $3, $4, 'SUBMITTED', NOW()
      ) RETURNING id;
    `, [
      payload.studentId,
      payload.diaryEntryId || null,
      payload.photoUrl,
      payload.studentNotes || 'Completed by student'
    ]);

    safeRevalidate('/parent');
    safeRevalidate('/teacher/homework');

    return { success: true, submissionId: rows[0].id };
  } catch (err: any) {
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

/**
 * 2. TEACHER DIGITAL ANNOTATION & GRADING
 */
export async function gradeHomeworkSubmissionAction(payload: {
  submissionId: string;
  marksObtained: number;
  teacherFeedback: string;
  teacherName: string;
  annotations?: any[];
}) {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query(`
      UPDATE public.homework_submissions
      SET marks_obtained = $1,
          teacher_feedback = $2,
          graded_by = $3,
          teacher_annotations = $4::jsonb,
          status = 'GRADED',
          graded_at = NOW()
      WHERE id = $5
    `, [
      payload.marksObtained,
      payload.teacherFeedback,
      payload.teacherName,
      JSON.stringify(payload.annotations || []),
      payload.submissionId
    ]);

    safeRevalidate('/teacher/homework');
    safeRevalidate('/parent');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

/**
 * 3. GET HOMEWORK SUBMISSIONS FOR TEACHER ANNOTATION DESK
 */
export async function getHomeworkSubmissionsAction() {
  const p = getPool();
  const client = await p.connect();
  try {
    const { rows } = await client.query(`
      SELECT 
        h.*,
        s.first_name,
        s.last_name,
        s.admission_no
      FROM public.homework_submissions h
      JOIN public.students s ON h.student_id = s.id
      ORDER BY h.submission_date DESC
      LIMIT 20
    `);

    return {
      success: true,
      submissions: rows.map((r: any) => ({
        id: r.id,
        studentId: r.student_id,
        studentName: `${r.first_name} ${r.last_name || ''}`.trim(),
        admissionNo: r.admission_no,
        photoUrl: r.attachment_url,
        notes: r.student_notes,
        status: r.status || 'SUBMITTED',
        marksObtained: r.marks_obtained,
        teacherFeedback: r.teacher_feedback,
        gradedBy: r.graded_by,
        gradedAt: r.graded_at,
        submissionDate: r.submission_date,
        annotations: r.teacher_annotations || []
      }))
    };
  } catch (err: any) {
    return { success: false, error: err.message, submissions: [] };
  } finally {
    client.release();
  }
}
