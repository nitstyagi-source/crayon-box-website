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

export async function submitStudentLeaveRequest(
  institutionCode: string,
  studentId: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  reason: string
) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const inst = institutionCode && institutionCode !== 'ALL' ? institutionCode : 'CBS';
    
    await client.query(`
      INSERT INTO public.student_leave_requests (
        institution_code, student_id, leave_type, start_date, end_date, reason, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'PENDING', NOW(), NOW()
      );
    `, [inst, studentId, leaveType, startDate, endDate, reason]);

    safeRevalidate('/admin/attendance/leaves');
    safeRevalidate('/mobile/attendance'); // if applicable
    return { success: true };
  } catch (error: any) {
    console.error('Error submitting leave request:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

export async function getStudentLeaveRequests(institutionCode: string, status?: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const inst = institutionCode && institutionCode !== 'ALL' ? institutionCode : 'CBS';
    
    let query = `
      SELECT 
        l.id, l.institution_code, l.leave_type, l.start_date, l.end_date, l.reason, l.status, l.created_at,
        s.first_name, s.last_name, s.admission_no,
        en.class_name, en.section_name
      FROM public.student_leave_requests l
      JOIN public.students s ON l.student_id = s.id
      LEFT JOIN public.student_enrollments en ON s.id = en.student_id AND en.institution_code = l.institution_code
      WHERE (l.institution_code = $1 OR $1 = 'ALL')
    `;
    const params: any[] = [inst];

    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND l.status = $2`;
    }

    query += ` ORDER BY l.created_at DESC LIMIT 100;`;

    const res = await client.query(query, params);
    return { success: true, data: res.rows };
  } catch (error: any) {
    console.error('Error fetching leave requests:', error);
    return { success: false, error: error.message, data: [] };
  } finally {
    client.release();
  }
}

export async function approveStudentLeaveRequest(
  leaveId: string,
  status: 'APPROVED' | 'REJECTED',
  approvedByStaffId: string
) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE public.student_leave_requests
      SET status = $1, approved_by = $2, updated_at = NOW()
      WHERE id = $3;
    `, [status, approvedByStaffId, leaveId]);

    safeRevalidate('/admin/attendance/leaves');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating leave request:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
