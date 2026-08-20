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

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function resolveCampusId(supabase: any, campusId?: string): Promise<string> {
  if (campusId && isValidUUID(campusId)) return campusId;
  const { data } = await supabase.from('campuses').select('id').limit(1).single();
  if (!data?.id) throw new Error("No campus found in database.");
  return data.id;
}

/**
 * High-precision Haversine formula to calculate distance between two GPS coordinates in meters
 */
export async function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Distance in meters
}

// -------------------------------------------------------------
// 1. GEOFENCE CONFIGURATION
// -------------------------------------------------------------
export async function getGeofenceConfig(campusId?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    const { data, error } = await supabase
      .from('attendance_settings')
      .select('*')
      .eq('campus_id', resolvedCampusId)
      .maybeSingle();

    if (error) throw error;

    // Default fallback if not customized yet
    const config = data || {
      school_name: "Crayon Box School - Main Campus, Burari",
      latitude: 28.7533150,
      longitude: 77.2024180,
      geofence_radius_meters: 120,
      gps_accuracy_threshold_meters: 35,
      shift_start_time: "08:00",
      shift_end_time: "13:30",
      grace_period_minutes: 10,
      late_threshold_time: "08:10",
      half_day_threshold_minutes: 240,
      early_departure_threshold_time: "13:15",
      face_verification_enabled: true,
      device_restriction_enabled: true,
      allow_official_duty_override: true
    };

    return { success: true, data: config };
  } catch (error: any) {
    console.error("Error fetching geofence config:", error);
    return { success: false, error: error.message };
  }
}

export async function saveGeofenceConfig(campusId: string, payload: any) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    const dataToSave = {
      campus_id: resolvedCampusId,
      school_name: payload.school_name || "Crayon Box School",
      latitude: Number(payload.latitude) || 28.7533150,
      longitude: Number(payload.longitude) || 77.2024180,
      geofence_radius_meters: Number(payload.geofence_radius_meters) || 120,
      gps_accuracy_threshold_meters: Number(payload.gps_accuracy_threshold_meters) || 35,
      shift_start_time: payload.shift_start_time || "08:00",
      shift_end_time: payload.shift_end_time || "13:30",
      grace_period_minutes: Number(payload.grace_period_minutes) || 10,
      late_threshold_time: payload.late_threshold_time || "08:10",
      half_day_threshold_minutes: Number(payload.half_day_threshold_minutes) || 240,
      early_departure_threshold_time: payload.early_departure_threshold_time || "13:15",
      face_verification_enabled: Boolean(payload.face_verification_enabled),
      device_restriction_enabled: Boolean(payload.device_restriction_enabled),
      allow_official_duty_override: Boolean(payload.allow_official_duty_override),
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase
      .from('attendance_settings')
      .select('id')
      .eq('campus_id', resolvedCampusId)
      .maybeSingle();

    let result;
    if (existing?.id) {
      result = await supabase
        .from('attendance_settings')
        .update(dataToSave)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('attendance_settings')
        .insert([dataToSave])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    revalidatePath('/admin/attendance');
    revalidatePath('/admin/attendance/settings');
    revalidatePath('/admin/attendance/checkin');

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Error saving geofence settings:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 2. CHECK-IN WORKFLOW
// -------------------------------------------------------------
export async function recordStaffCheckIn(payload: {
  staffId: string;
  campusId?: string;
  lat: number;
  lng: number;
  accuracy: number;
  selfieUrl?: string;
  deviceId?: string;
  ipAddress?: string;
  isOfficialDuty?: boolean;
}) {
  try {
    const { staffId, lat, lng, accuracy, selfieUrl, deviceId, ipAddress, isOfficialDuty } = payload;
    if (!staffId) throw new Error("Staff ID required.");

    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    // 1. Fetch Geofence Config
    const configRes = await getGeofenceConfig(resolvedCampusId);
    const config = configRes.data;

    // 2. Calculate Distance Server-Side (Anti-Spoof)
    const distanceMeters = await calculateHaversineDistance(
      lat,
      lng,
      Number(config.latitude),
      Number(config.longitude)
    );

    const isInsideGeofence = distanceMeters <= Number(config.geofence_radius_meters);

    // If outside geofence and NOT official duty, block attendance
    if (!isInsideGeofence && !isOfficialDuty) {
      return {
        success: false,
        error: `Outside school geofence! You are ${distanceMeters}m away (Geofence radius: ${config.geofence_radius_meters}m). Attendance blocked.`,
        distanceMeters,
        isInsideGeofence: false
      };
    }

    // 3. Determine Attendance Status (Present vs Late)
    const now = new Date();
    const currentTimeStr = now.toTimeString().split(' ')[0]; // "07:54:12"
    const todayStr = now.toISOString().split('T')[0];

    let status = "Present";
    if (isOfficialDuty) {
      status = "Official Duty";
    } else {
      // Compare current time with late threshold (e.g. 08:10)
      const lateTimeParts = (config.late_threshold_time || "08:10").split(':').map(Number);
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      if (currentHours > lateTimeParts[0] || (currentHours === lateTimeParts[0] && currentMinutes > lateTimeParts[1])) {
        status = "Late";
      }
    }

    // 4. Save to staff_attendance_logs
    const logPayload = {
      staff_id: staffId,
      campus_id: resolvedCampusId,
      date: todayStr,
      check_in_time: currentTimeStr,
      check_in_lat: lat,
      check_in_lng: lng,
      check_in_accuracy: accuracy,
      check_in_distance_meters: distanceMeters,
      is_inside_geofence_checkin: isInsideGeofence,
      verification_method: isOfficialDuty ? 'Official Duty' : 'Geofence GPS + Selfie',
      status,
      check_in_selfie_url: selfieUrl || null,
      device_id: deviceId || 'MOBILE_DEVICE',
      ip_address: ipAddress || '127.0.0.1'
    };

    const { data: logData, error: logErr } = await supabase
      .from('staff_attendance_logs')
      .upsert(logPayload, { onConflict: 'staff_id,date' })
      .select()
      .single();

    if (logErr) throw logErr;

    // 5. Also Sync to public.staff_attendance for general ERP compatibility
    await supabase.from('staff_attendance').upsert({
      staff_id: staffId,
      campus_id: resolvedCampusId,
      date: todayStr,
      in_time: currentTimeStr,
      status,
      working_hours: 0,
      remarks: isOfficialDuty ? 'Official Duty' : `Checked in via Geofence GPS (${distanceMeters}m)`
    }, { onConflict: 'staff_id,date' });

    revalidatePath('/admin/attendance');
    revalidatePath(`/admin/faculty/${staffId}`);

    return {
      success: true,
      message: `Checked in successfully at ${currentTimeStr}! Status: ${status}`,
      data: logData,
      distanceMeters,
      isInsideGeofence: true
    };
  } catch (error: any) {
    console.error("Check-in error:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 3. CHECK-OUT WORKFLOW
// -------------------------------------------------------------
export async function recordStaffCheckOut(payload: {
  staffId: string;
  campusId?: string;
  lat: number;
  lng: number;
  accuracy: number;
  selfieUrl?: string;
  deviceId?: string;
  earlyReason?: string;
}) {
  try {
    const { staffId, lat, lng, accuracy, selfieUrl, earlyReason } = payload;
    if (!staffId) throw new Error("Staff ID required.");

    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    const configRes = await getGeofenceConfig(resolvedCampusId);
    const config = configRes.data;

    const distanceMeters = await calculateHaversineDistance(
      lat,
      lng,
      Number(config.latitude),
      Number(config.longitude)
    );

    const now = new Date();
    const currentTimeStr = now.toTimeString().split(' ')[0];
    const todayStr = now.toISOString().split('T')[0];

    // Fetch check-in log
    const { data: existingLog } = await supabase
      .from('staff_attendance_logs')
      .select('*')
      .eq('staff_id', staffId)
      .eq('date', todayStr)
      .single();

    if (!existingLog?.check_in_time) {
      throw new Error("No check-in record found for today. Please check in first.");
    }

    // Calculate working hours
    const checkInParts = existingLog.check_in_time.split(':').map(Number);
    const checkInDate = new Date();
    checkInDate.setHours(checkInParts[0], checkInParts[1], checkInParts[2] || 0);

    const diffMs = Math.max(0, now.getTime() - checkInDate.getTime());
    const workingHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
    const workingMinutes = Math.round(diffMs / (1000 * 60));

    let finalStatus = existingLog.status;
    if (workingMinutes < Number(config.half_day_threshold_minutes || 240)) {
      finalStatus = "Half Day";
    }

    const { data: updatedLog, error: updateErr } = await supabase
      .from('staff_attendance_logs')
      .update({
        check_out_time: currentTimeStr,
        working_hours: workingHours,
        check_out_lat: lat,
        check_out_lng: lng,
        check_out_accuracy: accuracy,
        check_out_distance_meters: distanceMeters,
        check_out_selfie_url: selfieUrl || null,
        early_leaving_reason: earlyReason || null,
        status: finalStatus
      })
      .eq('id', existingLog.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Sync to staff_attendance
    await supabase.from('staff_attendance').update({
      out_time: currentTimeStr,
      working_hours: workingHours,
      status: finalStatus
    }).eq('staff_id', staffId).eq('date', todayStr);

    revalidatePath('/admin/attendance');
    revalidatePath(`/admin/faculty/${staffId}`);

    return {
      success: true,
      message: `Checked out successfully! Total working hours: ${workingHours} hrs`,
      data: updatedLog,
      workingHours
    };
  } catch (error: any) {
    console.error("Check-out error:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 4. ATTENDANCE CORRECTIONS
// -------------------------------------------------------------
export async function requestAttendanceCorrection(payload: {
  staffId: string;
  date: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reasonType: string;
  reasonDescription: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('attendance_corrections')
      .insert([{
        staff_id: payload.staffId,
        date: payload.date,
        requested_check_in: payload.requestedCheckIn || '07:55:00',
        requested_check_out: payload.requestedCheckOut || '13:30:00',
        reason_type: payload.reasonType,
        reason_description: payload.reasonDescription,
        status: 'Pending'
      }])
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/attendance');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reviewAttendanceCorrection(
  correctionId: string,
  status: 'Approved' | 'Rejected',
  approvedBy: string,
  adminNotes?: string
) {
  try {
    const supabase = getSupabaseAdmin();

    const { data: correction, error: fetchErr } = await supabase
      .from('attendance_corrections')
      .select('*')
      .eq('id', correctionId)
      .single();

    if (fetchErr) throw fetchErr;

    // 1. Update Correction Record
    const { error: updateErr } = await supabase
      .from('attendance_corrections')
      .update({
        status,
        approved_by: approvedBy,
        approval_date: new Date().toISOString().split('T')[0],
        admin_notes: adminNotes || ''
      })
      .eq('id', correctionId);

    if (updateErr) throw updateErr;

    // 2. If Approved, update staff_attendance_logs and staff_attendance
    if (status === 'Approved') {
      await supabase.from('staff_attendance_logs').upsert({
        staff_id: correction.staff_id,
        date: correction.date,
        check_in_time: correction.requested_check_in,
        check_out_time: correction.requested_check_out,
        status: 'Present',
        verification_method: 'Admin Correction Approved',
        remarks: `Correction Approved: ${correction.reason_type}`
      }, { onConflict: 'staff_id,date' });

      await supabase.from('staff_attendance').upsert({
        staff_id: correction.staff_id,
        date: correction.date,
        in_time: correction.requested_check_in,
        out_time: correction.requested_check_out,
        status: 'Present',
        working_hours: 5.5,
        remarks: 'Admin Approved Correction'
      }, { onConflict: 'staff_id,date' });
    }

    revalidatePath('/admin/attendance');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 5. REAL-TIME ATTENDANCE COMMAND DASHBOARD
// -------------------------------------------------------------
export async function getAttendanceLiveDashboard(campusId?: string, date?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [staffRes, logsRes, correctionsRes, configRes] = await Promise.all([
      supabase.from('staff').select('id, first_name, last_name, photo_url, designation, department, employee_category').eq('campus_id', resolvedCampusId),
      supabase.from('staff_attendance_logs').select('*, staff:staff_id(first_name, last_name, photo_url, designation, department)').eq('date', targetDate),
      supabase.from('attendance_corrections').select('*, staff:staff_id(first_name, last_name, photo_url)').eq('status', 'Pending'),
      getGeofenceConfig(resolvedCampusId)
    ]);

    const allStaff = staffRes.data || [];
    const logs = logsRes.data || [];
    const corrections = correctionsRes.data || [];
    const config = configRes.data;

    const loggedStaffIds = new Set(logs.map((l: any) => l.staff_id));
    const pendingStaff = allStaff.filter(s => !loggedStaffIds.has(s.id));

    const totalStaff = allStaff.length;
    const presentCount = logs.filter((l: any) => l.status === 'Present').length;
    const lateCount = logs.filter((l: any) => l.status === 'Late').length;
    const onLeaveCount = logs.filter((l: any) => l.status === 'On Leave').length;
    const officialDutyCount = logs.filter((l: any) => l.status === 'Official Duty').length;
    const notCheckedOutCount = logs.filter((l: any) => l.check_in_time && !l.check_out_time).length;
    const outsideAttemptsCount = logs.filter((l: any) => !l.is_inside_geofence_checkin && l.status !== 'Official Duty').length;

    return {
      success: true,
      data: {
        date: targetDate,
        totalStaff,
        presentCount,
        lateCount,
        onLeaveCount,
        officialDutyCount,
        absentCount: Math.max(0, totalStaff - (presentCount + lateCount + onLeaveCount + officialDutyCount)),
        notCheckedOutCount,
        outsideAttemptsCount,
        pendingCorrectionsCount: corrections.length,
        logs,
        pendingStaff,
        corrections,
        config
      }
    };
  } catch (error: any) {
    console.error("Error fetching live attendance dashboard:", error);
    return { success: false, error: error.message };
  }
}
