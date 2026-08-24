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

import { calculateDistanceMeters } from '@/lib/geo-utils';

// Safe Date to ISO string
function safeDateStr(d: any): string {
  if (!d) return new Date().toISOString().split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  if (typeof d === 'string') return d.split('T')[0];
  return String(d);
}

// -------------------------------------------------------------
// 1. TEACHER APP GEOFENCE PUNCH ACTION (Mobile & App)
// -------------------------------------------------------------
export interface TeacherGeofencePunchParams {
  staffId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  punchType?: 'AUTO' | 'IN' | 'OUT';
  selfieUrl?: string;
  deviceId?: string;
}

export async function punchTeacherGeofenceAttendanceAction(params: TeacherGeofencePunchParams) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { staffId, latitude, longitude, accuracy = 10, punchType = 'AUTO', selfieUrl, deviceId } = params;

    // 1. Fetch Staff info & Assigned Institution
    const staffRes = await client.query(`
      SELECT s.id, s.first_name, s.last_name, s.email, s.designation, s.department,
             COALESCE(ea.institution_code, 'CBS') as institution_code
      FROM public.staff s
      LEFT JOIN public.employee_assignments ea ON ea.staff_id = s.id
      WHERE s.id = $1
      LIMIT 1
    `, [staffId]);

    if (staffRes.rows.length === 0) {
      return { success: false, error: 'Teacher/Staff profile not found in master records.' };
    }

    const staff = staffRes.rows[0];
    const instCode = staff.institution_code || 'CBS';

    // 2. Fetch Campus Geofence Config
    const geofenceRes = await client.query(`
      SELECT * FROM public.campus_geofence_configs
      WHERE institution_code = $1 AND is_active = true
      LIMIT 1
    `, [instCode]);

    let campus = geofenceRes.rows[0];
    if (!campus) {
      // Fallback default CBS campus config
      campus = {
        campus_name: 'Crayon Box School — Main Campus',
        latitude: 28.7183200,
        longitude: 77.2144500,
        radius_meters: 250
      };
    }

    // 3. Compute Distance
    const targetLat = Number(campus.latitude);
    const targetLng = Number(campus.longitude);
    const radiusMeters = Number(campus.radius_meters) || 250;

    const distanceMeters = calculateDistanceMeters(latitude, longitude, targetLat, targetLng);
    const isInside = distanceMeters <= radiusMeters;

    if (!isInside) {
      return {
        success: false,
        error: `Geofence Perimeter Breach: You are ${distanceMeters}m away from ${campus.campus_name}. Allowed perimeter is ${radiusMeters}m. Please move inside campus to punch attendance.`,
        distanceMeters,
        allowedRadius: radiusMeters,
        campusName: campus.campus_name
      };
    }

    // 4. Check Today's Attendance Record
    const todayStr = new Date().toISOString().split('T')[0];
    const existingRes = await client.query(`
      SELECT * FROM public.staff_attendance_logs
      WHERE staff_id = $1 AND date = $2
    `, [staffId, todayStr]);

    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const nowDisplayTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let actionTaken = 'CHECK_IN';
    let record: any = null;

    if (existingRes.rows.length === 0) {
      // First punch of the day -> MORNING CHECK-IN
      const insertRes = await client.query(`
        INSERT INTO public.staff_attendance_logs (
          staff_id, date, check_in_time, check_in_lat, check_in_lng,
          check_in_accuracy, check_in_distance_meters, is_inside_geofence_checkin,
          verification_method, status, check_in_selfie_url, device_id, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, true, 'TEACHER_APP_GEOFENCE', 'PRESENT', $8, $9, NOW()
        )
        RETURNING *
      `, [staffId, todayStr, nowTimeStr, latitude, longitude, accuracy, distanceMeters, selfieUrl, deviceId]);

      record = insertRes.rows[0];
      actionTaken = 'CHECK_IN';
    } else {
      // Already checked in -> CHECK-OUT (Afternoon Punch)
      const existing = existingRes.rows[0];

      // Calculate working hours if check_in_time exists
      let workingHours = 0;
      if (existing.check_in_time) {
        const [inH, inM] = existing.check_in_time.split(':').map(Number);
        const [outH, outM] = nowTimeStr.split(':').map(Number);
        const diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
        workingHours = Math.max(0, Number((diffMinutes / 60).toFixed(2)));
      }

      const updateRes = await client.query(`
        UPDATE public.staff_attendance_logs
        SET check_out_time = $1,
            check_out_lat = $2,
            check_out_lng = $3,
            check_out_accuracy = $4,
            check_out_distance_meters = $5,
            is_inside_geofence_checkout = true,
            working_hours = $6,
            check_out_selfie_url = COALESCE($7, check_out_selfie_url)
        WHERE id = $8
        RETURNING *
      `, [nowTimeStr, latitude, longitude, accuracy, distanceMeters, workingHours, selfieUrl, existing.id]);

      record = updateRes.rows[0];
      actionTaken = 'CHECK_OUT';
    }

    safeRevalidate('/admin/attendance');
    safeRevalidate('/admin/hr');

    return {
      success: true,
      action: actionTaken,
      message: actionTaken === 'CHECK_IN'
        ? `✓ Geofence Check-In Verified! In Time: ${nowDisplayTime} (${distanceMeters}m from campus center)`
        : `✓ Geofence Check-Out Verified! Out Time: ${nowDisplayTime}. Total: ${record.working_hours || 0} hrs`,
      staff: {
        name: `${staff.first_name} ${staff.last_name}`,
        designation: staff.designation,
        department: staff.department,
      },
      log: {
        id: record.id,
        date: safeDateStr(record.date),
        checkInTime: record.check_in_time,
        checkOutTime: record.check_out_time,
        workingHours: record.working_hours,
        distanceMeters,
        campusName: campus.campus_name
      }
    };
  } catch (error: any) {
    console.error('Error in punchTeacherGeofenceAttendanceAction:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. ADMIN DIRECT ATTENDANCE MARKING & OVERRIDE
// -------------------------------------------------------------
export interface AdminMarkStaffAttendanceParams {
  staffId: string;
  date?: string;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE' | 'ABSENT' | 'ON_DUTY';
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
  overrideGeofence?: boolean;
}

export async function adminMarkStaffAttendanceAction(params: AdminMarkStaffAttendanceParams) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const {
      staffId,
      date = new Date().toISOString().split('T')[0],
      status,
      checkInTime = '08:00:00',
      checkOutTime,
      remarks,
      overrideGeofence = true
    } = params;

    const upsertRes = await client.query(`
      INSERT INTO public.staff_attendance_logs (
        staff_id, date, status, check_in_time, check_out_time,
        verification_method, is_inside_geofence_checkin, remarks, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, 'ADMIN_MANUAL_OVERRIDE', $6, $7, NOW()
      )
      ON CONFLICT (staff_id, date) DO UPDATE SET
        status = EXCLUDED.status,
        check_in_time = COALESCE(EXCLUDED.check_in_time, staff_attendance_logs.check_in_time),
        check_out_time = COALESCE(EXCLUDED.check_out_time, staff_attendance_logs.check_out_time),
        verification_method = 'ADMIN_MANUAL_OVERRIDE',
        remarks = EXCLUDED.remarks
      RETURNING *
    `, [staffId, date, status, checkInTime, checkOutTime || null, overrideGeofence, remarks || 'Marked by Administrator']);

    safeRevalidate('/admin/attendance');
    safeRevalidate('/admin/hr');

    return {
      success: true,
      message: `✓ Staff attendance updated to ${status} for ${date}`,
      data: {
        ...upsertRes.rows[0],
        date: safeDateStr(upsertRes.rows[0].date)
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. ADMIN BULK MARK STAFF ATTENDANCE
// -------------------------------------------------------------
export async function adminBulkMarkStaffAttendanceAction(params: {
  staffIds: string[];
  date?: string;
  status: string;
  remarks?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { staffIds, date = new Date().toISOString().split('T')[0], status, remarks } = params;

    for (const sId of staffIds) {
      await client.query(`
        INSERT INTO public.staff_attendance_logs (
          staff_id, date, status, check_in_time,
          verification_method, is_inside_geofence_checkin, remarks, created_at
        ) VALUES (
          $1, $2, $3, '08:00:00', 'ADMIN_BULK_ACTION', true, $4, NOW()
        )
        ON CONFLICT (staff_id, date) DO UPDATE SET
          status = EXCLUDED.status,
          verification_method = 'ADMIN_BULK_ACTION',
          remarks = EXCLUDED.remarks
      `, [sId, date, status, remarks || 'Bulk marked by Admin']);
    }

    safeRevalidate('/admin/attendance');
    safeRevalidate('/admin/hr');

    return { success: true, count: staffIds.length, message: `✓ Successfully marked ${staffIds.length} staff members as ${status}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. GET DAILY STAFF ATTENDANCE ROSTER & TELEMETRY
// -------------------------------------------------------------
export async function getStaffDailyAttendanceRosterAction(params: {
  date?: string;
  institutionCode?: string;
  department?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const date = params.date || new Date().toISOString().split('T')[0];
    const instCode = params.institutionCode && params.institutionCode !== 'ALL' ? params.institutionCode : null;
    const dept = params.department && params.department !== 'ALL' ? params.department : null;

    let query = `
      SELECT 
        s.id as staff_id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone_number,
        s.designation,
        s.department,
        s.photo_url,
        COALESCE(ea.institution_code, 'CBS') as institution_code,
        sal.id as log_id,
        sal.date,
        sal.check_in_time,
        sal.check_out_time,
        sal.working_hours,
        sal.check_in_distance_meters,
        sal.is_inside_geofence_checkin,
        sal.verification_method,
        COALESCE(sal.status, 'NOT_RECORDED') as attendance_status,
        sal.remarks
      FROM public.staff s
      LEFT JOIN public.employee_assignments ea ON ea.staff_id = s.id
      LEFT JOIN public.staff_attendance_logs sal ON sal.staff_id = s.id AND sal.date = $1
      WHERE s.status = 'ACTIVE'
    `;

    const values: any[] = [date];

    if (instCode) {
      values.push(instCode);
      query += ` AND ea.institution_code = $${values.length}`;
    }

    if (dept) {
      values.push(dept);
      query += ` AND s.department = $${values.length}`;
    }

    query += ` ORDER BY s.first_name ASC`;

    const res = await client.query(query, values);

    const rows = res.rows.map((r: any) => ({
      ...r,
      date: safeDateStr(r.date || date),
      check_in_time_fmt: r.check_in_time ? r.check_in_time.slice(0, 5) : '--:--',
      check_out_time_fmt: r.check_out_time ? r.check_out_time.slice(0, 5) : '--:--',
    }));

    const counts = {
      totalStaff: rows.length,
      present: rows.filter((r: any) => r.attendance_status === 'PRESENT').length,
      late: rows.filter((r: any) => r.attendance_status === 'LATE').length,
      halfDay: rows.filter((r: any) => r.attendance_status === 'HALF_DAY').length,
      onLeave: rows.filter((r: any) => r.attendance_status === 'ON_LEAVE').length,
      absent: rows.filter((r: any) => r.attendance_status === 'ABSENT').length,
      notRecorded: rows.filter((r: any) => r.attendance_status === 'NOT_RECORDED').length,
      geofenceVerified: rows.filter((r: any) => r.is_inside_geofence_checkin === true).length
    };

    return { success: true, data: rows, counts, date };
  } catch (error: any) {
    return { success: false, error: error.message, data: [], counts: { totalStaff: 0, present: 0, late: 0, halfDay: 0, onLeave: 0, absent: 0, notRecorded: 0, geofenceVerified: 0 } };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 5. GET & UPDATE CAMPUS GEOFENCE CONFIGS
// -------------------------------------------------------------
export async function getCampusGeofenceConfigsAction() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.campus_geofence_configs
      ORDER BY institution_code ASC
    `);

    const rows = res.rows.map((r: any) => ({
      ...r,
      created_at: safeDateStr(r.created_at),
      updated_at: safeDateStr(r.updated_at),
    }));

    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  } finally {
    client.release();
  }
}

export async function saveCampusGeofenceConfigAction(params: {
  institutionCode: string;
  campusName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address?: string;
  isActive?: boolean;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { institutionCode, campusName, latitude, longitude, radiusMeters, address, isActive = true } = params;

    const res = await client.query(`
      INSERT INTO public.campus_geofence_configs (
        institution_code, campus_name, latitude, longitude, radius_meters, address, is_active, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, NOW()
      )
      ON CONFLICT (institution_code) DO UPDATE SET
        campus_name = EXCLUDED.campus_name,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        radius_meters = EXCLUDED.radius_meters,
        address = EXCLUDED.address,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
      RETURNING *
    `, [institutionCode, campusName, latitude, longitude, radiusMeters, address || null, isActive]);

    safeRevalidate('/admin/attendance');
    safeRevalidate('/teacher/attendance');

    return { success: true, message: `✓ Geofence updated for ${campusName}`, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
