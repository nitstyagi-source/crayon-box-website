"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

function getPool() {
  return new Pool({ connectionString });
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

export interface AttendanceEntry {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  remarks?: string;
}

/**
 * Fetch distinct classes and sections available for a specific institution
 */
export async function getInstitutionClassesAction(institutionCode?: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const inst = institutionCode && institutionCode !== 'ALL' ? institutionCode : 'CBS';
    const res = await client.query(`
      SELECT DISTINCT class_name, section_name
      FROM public.student_enrollments
      WHERE (institution_code = $1 OR $1 = 'ALL')
        AND (enrollment_status = 'ACTIVE' OR is_current = true)
      ORDER BY class_name ASC, section_name ASC;
    `, [inst]);

    const distinctClasses = Array.from(new Set(res.rows.map((r: any) => r.class_name)));
    const distinctSections = Array.from(new Set(res.rows.map((r: any) => r.section_name)));

    return {
      success: true,
      classes: distinctClasses.length > 0 ? distinctClasses : [
        'Pre-Nursery', 'Nursery', 'LKG', 'UKG',
        'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
        'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
      ],
      sections: distinctSections.length > 0 ? distinctSections : ['A', 'B', 'C']
    };
  } catch (error: any) {
    console.error('Error fetching institution classes:', error);
    return {
      success: false,
      classes: [
        'Pre-Nursery', 'Nursery', 'LKG', 'UKG',
        'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
        'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
      ],
      sections: ['A', 'B', 'C']
    };
  } finally {
    client.release();
  }
}

/**
 * Fetch student roster and existing attendance status for a specific class section on a given date
 */
export async function getSectionAttendanceRoster(
  institutionCode: string,
  className: string,
  sectionName: string,
  date: string
) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const inst = institutionCode && institutionCode !== 'ALL' ? institutionCode : 'CBS';
    const targetDate = date || new Date().toISOString().split('T')[0];
    const sec = sectionName || 'A';

    // Normalize class name for flexible matching (e.g. "Grade 4" <-> "Class 4")
    let altClassName = className;
    if (className.startsWith('Grade ')) {
      altClassName = className.replace('Grade ', 'Class ');
    } else if (className.startsWith('Class ')) {
      altClassName = className.replace('Class ', 'Grade ');
    }

    // 1. Fetch active students enrolled in this section
    const stuRes = await client.query(`
      SELECT 
        s.id as student_id,
        s.first_name,
        s.last_name,
        s.gender,
        s.photo_url,
        s.admission_no,
        COALESCE(se.admission_number, s.admission_no) as admission_number,
        COALESCE(se.roll_number, '1') as roll_number,
        se.class_name,
        se.section_name,
        se.campus_id
      FROM public.students s
      JOIN public.student_enrollments se ON s.id = se.student_id
      WHERE (se.institution_code = $1 OR $1 = 'ALL')
        AND (se.class_name = $2 OR se.class_name = $3)
        AND (se.section_name = $4 OR $4 = 'ALL')
        AND (s.status = 'Active' OR s.status = 'ACTIVE')
      ORDER BY 
        CASE WHEN se.roll_number ~ '^[0-9]+$' THEN CAST(se.roll_number AS INTEGER) ELSE 999 END ASC,
        s.first_name ASC,
        s.last_name ASC;
    `, [inst, className, altClassName, sec]);

    if (stuRes.rows.length === 0) {
      return { success: true, students: [] };
    }

    const studentIds = stuRes.rows.map((r: any) => r.student_id);

    // 2. Fetch existing attendance records for these students on this target date
    const attRes = await client.query(`
      SELECT student_id, status, remarks, time, event_type, verification_method, created_at
      FROM public.student_attendance_records
      WHERE student_id = ANY($1::uuid[])
        AND date = $2
        AND (institution_code = $3 OR $3 = 'ALL');
    `, [studentIds, targetDate, inst]);

    const attMap: Record<string, any> = {};
    attRes.rows.forEach((att: any) => {
      attMap[att.student_id] = att;
    });

    const roster = stuRes.rows.map((r: any, idx: number) => {
      const att = attMap[r.student_id];
      const fullName = `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Student';
      const rollNo = r.roll_number && r.roll_number !== '0' ? r.roll_number : String(idx + 1);

      return {
        studentId: r.student_id,
        name: fullName,
        firstName: r.first_name,
        lastName: r.last_name,
        gender: r.gender || 'Unknown',
        photoUrl: r.photo_url || '',
        admissionNo: r.admission_number || r.admission_no || `ADM-${r.student_id.slice(0, 6)}`,
        rollNo: rollNo,
        className: r.class_name,
        sectionName: r.section_name,
        status: att ? att.status : 'PRESENT',
        remarks: att ? (att.remarks || '') : '',
        time: att ? att.time : null,
        isSaved: Boolean(att)
      };
    });

    return { success: true, students: roster };
  } catch (error: any) {
    console.error('Error fetching section attendance roster:', error);
    return { success: false, error: error.message, students: [] };
  } finally {
    client.release();
  }
}

/**
 * Submit / Update daily classroom roll call attendance for a section
 */
export async function submitDailyAttendanceAction(
  institutionCode: string,
  className: string,
  sectionName: string,
  date: string,
  entries: AttendanceEntry[]
) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    if (!entries || entries.length === 0) {
      return { success: false, error: 'No student attendance entries provided' };
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const inst = institutionCode && institutionCode !== 'ALL' ? institutionCode : 'CBS';

    // Resolve campus ID
    const campusRes = await client.query(`SELECT id FROM public.campuses LIMIT 1;`);
    const campusId = campusRes.rows[0]?.id || 'c3d782a9-a50b-4708-a3fc-6b146f456662';

    await client.query('BEGIN');

    for (const entry of entries) {
      const status = entry.status || 'PRESENT';
      const remarks = entry.remarks || null;
      const parentNotified = status === 'ABSENT';

      // Check if record exists for student on this date
      const checkRes = await client.query(`
        SELECT id FROM public.student_attendance_records
        WHERE student_id = $1 AND date = $2 AND (institution_code = $3 OR $3 = 'ALL');
      `, [entry.studentId, targetDate, inst]);

      if (checkRes.rows.length > 0) {
        // Update existing record
        await client.query(`
          UPDATE public.student_attendance_records
          SET 
            status = $1,
            remarks = $2,
            class_name = $3,
            section_name = $4,
            parent_notified = $5,
            time = CURRENT_TIME
          WHERE id = $6;
        `, [status, remarks, className, sectionName, parentNotified, checkRes.rows[0].id]);
      } else {
        // Insert new record with all required non-null constraints satisfied
        await client.query(`
          INSERT INTO public.student_attendance_records (
            institution_code, student_id, campus_id, date, time, academic_session,
            class_name, section_name, event_type, status,
            verification_method, remarks, parent_notified, created_at
          ) VALUES (
            $1, $2, $3, $4, CURRENT_TIME, '2026-2027',
            $5, $6, 'Classroom', $7,
            'Manual', $8, $9, NOW()
          );
        `, [
          inst === 'ALL' ? 'CBS' : inst,
          entry.studentId,
          campusId,
          targetDate,
          className,
          sectionName,
          status,
          remarks,
          parentNotified
        ]);
      }
    }

    await client.query('COMMIT');

    safeRevalidate('/admin/attendance');
    safeRevalidate('/admin/students/attendance');
    safeRevalidate('/admin/dashboard');

    return { 
      success: true, 
      count: entries.length,
      message: `Daily attendance marked successfully for ${entries.length} students.` 
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error submitting daily attendance:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Delete / Clear an attendance record for a student on a specific date
 */
export async function deleteAttendanceRecordAction(studentId: string, date: string, institutionCode?: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const inst = institutionCode && institutionCode !== 'ALL' ? institutionCode : 'CBS';
    await client.query(`
      DELETE FROM public.student_attendance_records
      WHERE student_id = $1 AND date = $2 AND (institution_code = $3 OR $3 = 'ALL');
    `, [studentId, date, inst]);

    safeRevalidate('/admin/attendance');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting attendance record:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Fetch Academic Stages metadata
 */
export async function getAcademicStages() {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT * FROM public.academic_stages
      ORDER BY order_index ASC;
    `);
    return { success: true, data: res.rows || [] };
  } catch (error: any) {
    return { success: false, data: [] };
  } finally {
    client.release();
  }
}
