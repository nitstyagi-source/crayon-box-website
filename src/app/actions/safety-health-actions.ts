"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

let globalPool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    globalPool = new pg.Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

function safeDateStr(d: any): string {
  if (!d) return new Date().toISOString().split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  if (typeof d === 'string') return d.split('T')[0];
  return String(d);
}

// -------------------------------------------------------------
// 1. GET CAMPUS VISITORS LOG
// -------------------------------------------------------------
export async function getCampusVisitorsAction(institutionCode?: string) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    let query = `SELECT * FROM public.campus_visitors`;
    const params: any[] = [];

    if (institutionCode && institutionCode !== 'ALL') {
      query += ` WHERE (campus_id::text = $1 OR institution_code = $1 OR $1 IS NULL)`;
      params.push(institutionCode);
    }

    query += ` ORDER BY check_in_time DESC`;

    const res = await client.query(query, params);

    const visitors = res.rows.map((v: any) => ({
      ...v,
      check_in_time: safeDateStr(v.check_in_time),
      check_out_time: v.check_out_time ? safeDateStr(v.check_out_time) : null
    }));

    const counts = {
      totalVisitors: visitors.length,
      currentlyCheckedIn: visitors.filter((v: any) => v.status === 'CHECKED_IN').length,
      checkedOutToday: visitors.filter((v: any) => v.status === 'CHECKED_OUT').length
    };

    return { success: true, visitors, counts };
  } catch (error: any) {
    return { success: false, error: error.message, visitors: [], counts: { totalVisitors: 0, currentlyCheckedIn: 0, checkedOutToday: 0 } };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. CHECK-IN NEW VISITOR
// -------------------------------------------------------------
export async function checkInCampusVisitorAction(params: {
  fullName: string;
  phoneNumber: string;
  visitorType: string;
  hostPerson: string;
  purpose: string;
  vehicleNumber?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { fullName, phoneNumber, visitorType, hostPerson, purpose, vehicleNumber } = params;
    const countRes = await client.query(`SELECT count(*)::int as count FROM public.campus_visitors;`);
    const nextSeq = ((countRes.rows[0]?.count || 0) + 1).toString().padStart(4, '0');
    const badgeNumber = `VIS-${new Date().getFullYear()}-${nextSeq}`;

    const res = await client.query(`
      INSERT INTO public.campus_visitors (
        badge_number, full_name, phone_number, visitor_type,
        host_person, purpose, id_proof_type, vehicle_number,
        check_in_time, status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'Aadhaar Card', $7, NOW(), 'CHECKED_IN', NOW()
      )
      RETURNING *
    `, [badgeNumber, fullName, phoneNumber, visitorType, hostPerson, purpose, vehicleNumber || 'N/A']);

    safeRevalidate('/admin/visitors');
    safeRevalidate('/admin/safety');

    return {
      success: true,
      message: `✓ Visitor "${fullName}" checked in with Badge #${badgeNumber}!`,
      visitor: res.rows[0]
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. CHECK-OUT VISITOR
// -------------------------------------------------------------
export async function checkOutCampusVisitorAction(visitorId: string) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query(`
      UPDATE public.campus_visitors
      SET check_out_time = NOW(), status = 'CHECKED_OUT'
      WHERE id = $1
    `, [visitorId]);

    safeRevalidate('/admin/visitors');
    safeRevalidate('/admin/safety');

    return { success: true, message: '✓ Visitor checked out successfully!' };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. GET STUDENT MEDICAL INFIRMARY LOGS
// -------------------------------------------------------------
export async function getStudentHealthMedicalDashboardAction(institutionCode?: string) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    let whereClause = '';
    const params: any[] = [];

    if (institutionCode && institutionCode !== 'ALL') {
      whereClause = `WHERE (s.institution_code = $1 OR s.campus_id::text = $1 OR $1 IS NULL)`;
      params.push(institutionCode);
    }

    const res = await client.query(`
      SELECT m.*, s.first_name, s.last_name, s.admission_no,
             COALESCE(c.grade, 'Class 1') as class_name,
             st.first_name as nurse_first, st.last_name as nurse_last
      FROM public.medical_logs m
      JOIN public.students s ON s.id = m.student_id
      LEFT JOIN public.classes c ON c.id = s.class_id
      LEFT JOIN public.staff st ON st.id = m.logged_by
      ${whereClause}
      ORDER BY m.created_at DESC
    `, params);

    const logs = res.rows.map((r: any) => ({
      ...r,
      incident_date: safeDateStr(r.incident_date),
      created_at: safeDateStr(r.created_at),
      student_name: `${r.first_name} ${r.last_name}`,
      logged_by_name: r.nurse_first ? `${r.nurse_first} ${r.nurse_last}` : 'Campus Nurse'
    }));

    const counts = {
      totalVisits: logs.length,
      resolvedVisits: logs.filter((l: any) => l.status === 'RESOLVED').length,
      referredVisits: logs.filter((l: any) => l.status === 'REFERRED').length
    };

    return { success: true, logs, counts };
  } catch (error: any) {
    return { success: false, error: error.message, logs: [], counts: { totalVisits: 0, resolvedVisits: 0, referredVisits: 0 } };
  } finally {
    client.release();
  }
}
