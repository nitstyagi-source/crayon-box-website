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

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function resolveCampusId(supabase: any, campusId?: string): Promise<string> {
  if (campusId && isValidUUID(campusId)) return campusId;
  const { data } = await supabase.from('campuses').select('id').limit(1).single();
  if (!data?.id) throw new Error("No campus found in database.");
  return data.id;
}

// -------------------------------------------------------------
// 1. PRINCIPAL & ADMIN STUDENT ATTENDANCE DASHBOARD
// -------------------------------------------------------------
export async function getStudentAttendanceDashboard(campusId?: string, date?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);
    const targetDate = date || new Date().toISOString().split('T')[0];

    // 1. Fetch all active students
    const { data: allStudents } = await supabase
      .from('students')
      .select('id, admission_no, first_name, last_name, gender, status, photo_url')
      .eq('campus_id', resolvedCampusId)
      .eq('status', 'Active');

    // 2. Fetch academic classes
    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .eq('campus_id', resolvedCampusId)
      .order('grade', { ascending: true });

    // 3. Fetch academic history to map students to classes
    const { data: academicHistory } = await supabase
      .from('student_academic_history')
      .select('student_id, class_name, section_name, roll_no')
      .eq('is_current_session', true);

    const studentClassMap: Record<string, { class_name: string; section_name: string; roll_no?: string }> = {};
    (academicHistory || []).forEach((h: any) => {
      studentClassMap[h.student_id] = {
        class_name: h.class_name || 'Grade 1',
        section_name: h.section_name || 'A',
        roll_no: h.roll_no
      };
    });

    // 4. Fetch today's attendance records (Classroom event)
    const { data: todayAttendance } = await supabase
      .from('student_attendance_records')
      .select('*')
      .eq('date', targetDate)
      .eq('event_type', 'Classroom');

    const attendanceMap: Record<string, any> = {};
    (todayAttendance || []).forEach((att: any) => {
      attendanceMap[att.student_id] = att;
    });

    // 5. Fetch Pending Corrections
    const { count: pendingCorrectionsCount } = await supabase
      .from('student_attendance_corrections')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Pending');

    // Calculate Class-by-Class Attendance Matrix
    const classList = classes && classes.length > 0 ? classes : [];

    const classMatrix = classList.map((c: any) => {
      const classStudents = (allStudents || []).filter(s => {
        const mapping = studentClassMap[s.id];
        return mapping && mapping.class_name === c.grade && (mapping.section_name === c.section || !c.section);
      });

      const total = classStudents.length;
      const present = classStudents.filter(s => attendanceMap[s.id]?.status === 'Present').length;
      const absent = classStudents.filter(s => attendanceMap[s.id]?.status === 'Absent').length;
      const late = classStudents.filter(s => attendanceMap[s.id]?.status === 'Late').length;
      const leave = classStudents.filter(s => attendanceMap[s.id]?.status === 'Leave').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        grade: c.grade,
        section: c.section || 'A',
        totalStudents: total,
        presentCount: present,
        absentCount: absent,
        lateCount: late,
        leaveCount: leave,
        percentage,
        isCompleted: total > 0 ? (present + absent + late + leave >= total) : false
      };
    });

    const totalStudents = classMatrix.reduce((acc, c) => acc + c.totalStudents, 0);
    const presentTotal = classMatrix.reduce((acc, c) => acc + c.presentCount, 0);
    const absentTotal = classMatrix.reduce((acc, c) => acc + c.absentCount, 0);
    const lateTotal = classMatrix.reduce((acc, c) => acc + c.lateCount, 0);
    const leaveTotal = classMatrix.reduce((acc, c) => acc + c.leaveCount, 0);
    const overallPercentage = totalStudents > 0 ? Math.round((presentTotal / totalStudents) * 100) : 0;

    // 6. Low Attendance Watchlist (< 75%)
    const { data: recentRecords } = await supabase
      .from('student_attendance_records')
      .select('student_id, status')
      .eq('event_type', 'Classroom')
      .limit(500);

    const studentStats: Record<string, { total: number; present: number }> = {};
    (recentRecords || []).forEach((r: any) => {
      if (!studentStats[r.student_id]) studentStats[r.student_id] = { total: 0, present: 0 };
      studentStats[r.student_id].total += 1;
      if (r.status === 'Present' || r.status === 'Late') {
        studentStats[r.student_id].present += 1;
      }
    });

    const lowAttendanceStudents: any[] = [];
    (allStudents || []).forEach((s: any) => {
      const stats = studentStats[s.id];
      if (stats && stats.total >= 3) {
        const pct = Math.round((stats.present / stats.total) * 100);
        if (pct < 75) {
          lowAttendanceStudents.push({
            id: s.id,
            name: `${s.first_name} ${s.last_name || ''}`.trim(),
            admission_no: s.admission_no || '',
            class_name: studentClassMap[s.id]?.class_name || 'N/A',
            section_name: studentClassMap[s.id]?.section_name || 'A',
            photo_url: s.photo_url || null,
            attendancePercentage: pct,
            totalClasses: stats.total,
            attendedClasses: stats.present,
            consecutiveAbsences: 0
          });
        }
      }
    });

    return {
      success: true,
      data: {
        date: targetDate,
        totalStudents,
        presentTotal,
        absentTotal,
        lateTotal,
        leaveTotal,
        overallPercentage,
        classMatrix,
        lowAttendanceStudents,
        pendingCorrectionsCount: pendingCorrectionsCount || 0
      }
    };
  } catch (error: any) {
    console.error("Error fetching student attendance dashboard:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 2. CLASS STUDENT ROSTER WITH QR TOKENS & STATUS
// -------------------------------------------------------------
export async function getClassStudentRosterForAttendance(className: string, sectionName: string, date?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const targetDate = date || new Date().toISOString().split('T')[0];

    // 1. Fetch Students enrolled in this class
    const { data: history } = await supabase
      .from('student_academic_history')
      .select('student_id, roll_no, class_name, section_name, students:student_id(id, admission_no, first_name, last_name, photo_url, gender, dob)')
      .eq('class_name', className)
      .eq('section_name', sectionName)
      .eq('is_current_session', true);

    const studentList: any[] = [];
    (history || []).forEach((h: any) => {
      if (h.students) {
        studentList.push({
          ...h.students,
          roll_no: h.roll_no || '1',
          class_name: h.class_name,
          section_name: h.section_name
        });
      }
    });

    // Fallback query if history is not populated
    if (studentList.length === 0) {
      const { data: defaultStudents } = await supabase
        .from('students')
        .select('id, admission_no, first_name, last_name, photo_url, gender, dob')
        .eq('status', 'Active')
        .limit(15);

      (defaultStudents || []).forEach((s: any, idx: number) => {
        studentList.push({
          ...s,
          roll_no: `${idx + 1}`,
          class_name: className,
          section_name: sectionName
        });
      });
    }

    // 2. Fetch QR Tokens
    const studentIds = studentList.map(s => s.id);
    const { data: qrTokens } = await supabase
      .from('student_qr_tokens')
      .select('*')
      .in('student_id', studentIds);

    const qrMap: Record<string, string> = {};
    (qrTokens || []).forEach((q: any) => {
      qrMap[q.student_id] = q.secure_token;
    });

    // 3. Fetch Today's Attendance for these students
    const { data: attendanceRecords } = await supabase
      .from('student_attendance_records')
      .select('*')
      .in('student_id', studentIds)
      .eq('date', targetDate)
      .eq('event_type', 'Classroom');

    const attRecordMap: Record<string, any> = {};
    (attendanceRecords || []).forEach((r: any) => {
      attRecordMap[r.student_id] = r;
    });

    // Merge and enrich
    const roster = studentList.map(student => {
      const cleanAdm = student.admission_no || `ADM-${student.id.substring(0, 4).toUpperCase()}`;
      const token = qrMap[student.id] || `CBS-QR-${cleanAdm}-${student.id.substring(0, 4).toUpperCase()}`;
      const record = attRecordMap[student.id];

      return {
        ...student,
        qrToken: token,
        status: record?.status || 'Unmarked',
        time: record?.time || null,
        verification_method: record?.verification_method || null
      };
    });

    // Sort by roll number ascending
    roster.sort((a, b) => parseInt(a.roll_no || '0') - parseInt(b.roll_no || '0'));

    return { success: true, data: roster };
  } catch (error: any) {
    console.error("Error fetching class roster:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// -------------------------------------------------------------
// 3. HIGH-SPEED SCANNER ENDPOINT
// -------------------------------------------------------------
export async function recordSingleStudentQRScan(payload: {
  qrToken: string;
  className?: string;
  sectionName?: string;
  eventType?: string;
  teacherId?: string;
  date?: string;
}) {
  try {
    const { qrToken, eventType = 'Classroom', date, teacherId } = payload;
    if (!qrToken) throw new Error("QR Token is required.");

    const supabase = getSupabaseAdmin();
    const targetDate = date || new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTimeStr = now.toTimeString().split(' ')[0];

    // 1. Match QR Token to Student
    const { data: tokenRecord, error: tokenErr } = await supabase
      .from('student_qr_tokens')
      .select('student_id, admission_no, students:student_id(id, first_name, last_name, photo_url, campus_id)')
      .eq('secure_token', qrToken.trim())
      .single();

    if (tokenErr || !tokenRecord?.students) {
      throw new Error(`Invalid or unrecognized QR token: "${qrToken}"`);
    }

    const student: any = tokenRecord.students;

    // 2. Fetch Class Details
    const { data: hist } = await supabase
      .from('student_academic_history')
      .select('class_name, section_name')
      .eq('student_id', student.id)
      .eq('is_current_session', true)
      .maybeSingle();

    const className = payload.className || hist?.class_name || 'Grade 1';
    const sectionName = payload.sectionName || hist?.section_name || 'A';

    // 3. Determine Status (Present vs Late after 8:10 AM)
    let status = 'Present';
    if (now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 10)) {
      status = 'Late';
    }

    // 4. Save/Upsert Attendance Record
    const { data: recordData, error: recordErr } = await supabase
      .from('student_attendance_records')
      .upsert({
        student_id: student.id,
        campus_id: student.campus_id,
        date: targetDate,
        time: currentTimeStr,
        class_name: className,
        section_name: sectionName,
        teacher_id: teacherId || null,
        event_type: eventType,
        status,
        verification_method: 'Teacher QR Scan',
        parent_notified: true
      }, { onConflict: 'student_id,date,event_type' })
      .select()
      .single();

    if (recordErr) throw recordErr;

    revalidatePath('/admin/students/attendance');
    revalidatePath('/admin/students/attendance/scan');

    return {
      success: true,
      message: `${student.first_name} ${student.last_name || ''} marked ${status} at ${currentTimeStr}!`,
      student: {
        id: student.id,
        name: `${student.first_name} ${student.last_name || ''}`,
        photo_url: student.photo_url,
        admission_no: tokenRecord.admission_no,
        class_name: className,
        section_name: sectionName,
        status,
        time: currentTimeStr
      }
    };
  } catch (error: any) {
    console.error("QR Scan error:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 4. BATCH FINALIZE CLASS ATTENDANCE
// -------------------------------------------------------------
export async function batchSubmitClassAttendance(payload: {
  className: string;
  sectionName: string;
  date: string;
  attendanceMap: Record<string, string>; // studentId -> status (Present, Absent, Late, Leave)
  teacherId?: string;
}) {
  try {
    const { className, sectionName, date, attendanceMap, teacherId } = payload;
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const currentTimeStr = now.toTimeString().split(' ')[0];

    const recordsToUpsert = Object.entries(attendanceMap).map(([studentId, status]) => ({
      student_id: studentId,
      date,
      time: currentTimeStr,
      class_name: className,
      section_name: sectionName,
      teacher_id: teacherId || null,
      event_type: 'Classroom',
      status: status || 'Present',
      verification_method: 'Teacher QR / Manual Roll Call',
      parent_notified: true
    }));

    if (recordsToUpsert.length > 0) {
      const { error } = await supabase
        .from('student_attendance_records')
        .upsert(recordsToUpsert, { onConflict: 'student_id,date,event_type' });

      if (error) throw error;
    }

    revalidatePath('/admin/students/attendance');
    return { success: true, count: recordsToUpsert.length };
  } catch (error: any) {
    console.error("Batch submit attendance error:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 5. ATTENDANCE CORRECTIONS
// -------------------------------------------------------------
export async function requestStudentAttendanceCorrection(payload: {
  studentId: string;
  date: string;
  className: string;
  sectionName: string;
  originalStatus: string;
  newStatus: string;
  reason: string;
  requestedBy: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('student_attendance_corrections')
      .insert([{
        student_id: payload.studentId,
        date: payload.date,
        class_name: payload.className,
        section_name: payload.sectionName,
        original_status: payload.originalStatus,
        new_status: payload.newStatus,
        reason: payload.reason,
        requested_by: payload.requestedBy,
        status: 'Pending'
      }])
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/admin/students/attendance');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reviewStudentAttendanceCorrection(
  correctionId: string,
  status: 'Approved' | 'Rejected',
  approvedBy: string
) {
  try {
    const supabase = getSupabaseAdmin();

    const { data: correction, error: fetchErr } = await supabase
      .from('student_attendance_corrections')
      .select('*')
      .eq('id', correctionId)
      .single();

    if (fetchErr) throw fetchErr;

    // 1. Update correction record
    await supabase
      .from('student_attendance_corrections')
      .update({
        status,
        approved_by: approvedBy,
        approval_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', correctionId);

    // 2. If approved, update student_attendance_records
    if (status === 'Approved') {
      await supabase
        .from('student_attendance_records')
        .upsert({
          student_id: correction.student_id,
          date: correction.date,
          class_name: correction.class_name,
          section_name: correction.section_name,
          event_type: 'Classroom',
          status: correction.new_status,
          verification_method: 'Correction Approved',
          remarks: `Corrected from ${correction.original_status}: ${correction.reason}`
        }, { onConflict: 'student_id,date,event_type' });
    }

    revalidatePath('/admin/students/attendance');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 6. MULTI-POINT JOURNEY LOGS
// -------------------------------------------------------------
export async function getStudentJourneyLogs(studentId: string, date?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('student_attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', targetDate)
      .order('time', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}
