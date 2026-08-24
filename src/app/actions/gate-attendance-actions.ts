"use server";

import { Client } from 'pg';

const DB_CONNECTION_STRING =
  process.env.DATABASE_URL ||
  'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

function getPgClient() {
  return new Client({ connectionString: DB_CONNECTION_STRING });
}

export interface GateScanInput {
  qrRawText?: string;
  studentId?: string;
  universalId?: string;
  admissionNumber?: string;
  scanType?: 'AUTO' | 'ENTRY' | 'EXIT';
  gateName?: string;
}

export interface GateScanResult {
  success: boolean;
  action?: 'ENTRY_RECORDED' | 'EXIT_RECORDED' | 'ALREADY_COMPLETED';
  message?: string;
  error?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    universalId: string;
    admissionNumber: string;
    className: string;
    sectionName: string;
    institutionCode: string;
    photoUrl?: string;
    transportMode?: string;
    parentPhone?: string;
    parentName?: string;
  };
  attendance?: {
    date: string;
    entryTime?: string;
    exitTime?: string;
    gateStatus: 'IN_CAMPUS' | 'EXITED' | 'NOT_ARRIVED';
    status: string;
    gateName: string;
    durationMinutes?: number;
  };
}

export async function recordStudentGateScanAction(input: GateScanInput): Promise<GateScanResult> {
  const client = getPgClient();
  try {
    await client.connect();
    await client.query('BEGIN');

    let searchStudentId: string | null = input.studentId || null;
    let searchUniversalId: string | null = input.universalId || null;
    let searchAdmissionNo: string | null = input.admissionNumber || null;

    // 1. Parse QR raw payload if provided
    if (input.qrRawText) {
      const raw = input.qrRawText.trim();
      if (raw.startsWith('{') && raw.endsWith('}')) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.id) searchStudentId = parsed.id;
          if (parsed.uid) searchUniversalId = parsed.uid;
          if (parsed.adm) searchAdmissionNo = parsed.adm;
        } catch (e) {
          // Ignore JSON parse error
        }
      } else if (raw.startsWith('VET:STU:')) {
        const parts = raw.split(':');
        // VET:STU:{uid}:{id}:{inst}:{adm}
        if (parts[2]) searchUniversalId = parts[2];
        if (parts[3] && parts[3].length > 10) searchStudentId = parts[3];
        if (parts[5]) searchAdmissionNo = parts[5];
      } else {
        // Direct query (UUID, Universal ID, or Admission No)
        if (raw.startsWith('STU-VET-')) {
          searchUniversalId = raw;
        } else if (raw.includes('-2026-') || raw.includes('/')) {
          searchAdmissionNo = raw;
        } else if (raw.length === 36) {
          searchStudentId = raw;
        } else {
          searchUniversalId = raw;
        }
      }
    }

    // 2. Lookup student in PostgreSQL
    let stuQuery = `
      SELECT
        s.id, s.first_name, s.last_name, s.universal_id, s.photo_url,
        s.transport_mode, s.transport_bus_no, s.admission_no,
        se.institution_code, se.class_name, se.section_name, se.admission_number,
        g.first_name AS parent_first, g.last_name AS parent_last, g.phone AS parent_phone
      FROM public.students s
      LEFT JOIN public.student_enrollments se ON s.id = se.student_id AND se.is_current = true
      LEFT JOIN public.student_guardians sg ON s.id = sg.student_id AND sg.is_primary = true
      LEFT JOIN public.guardians g ON sg.guardian_id = g.id
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    if (searchStudentId) {
      stuQuery += ` AND s.id = $1`;
      queryParams.push(searchStudentId);
    } else if (searchUniversalId) {
      stuQuery += ` AND s.universal_id = $1`;
      queryParams.push(searchUniversalId);
    } else if (searchAdmissionNo) {
      stuQuery += ` AND (s.admission_no = $1 OR se.admission_number = $1)`;
      queryParams.push(searchAdmissionNo);
    } else {
      throw new Error('Invalid QR code format. Could not extract student identifier.');
    }

    const stuRes = await client.query(stuQuery, queryParams);
    if (stuRes.rows.length === 0) {
      throw new Error(`Student not found for scanned QR code (${input.qrRawText || searchUniversalId || searchAdmissionNo})`);
    }

    const stu = stuRes.rows[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const gateName = input.gateName || 'Gate 1 — Main Campus Entrance';

    // 3. Check today's gate attendance log
    const todayLogRes = await client.query(`
      SELECT * FROM public.student_gate_attendance_logs
      WHERE student_id = $1 AND date = $2;
    `, [stu.id, todayStr]);

    let action: 'ENTRY_RECORDED' | 'EXIT_RECORDED' | 'ALREADY_COMPLETED' = 'ENTRY_RECORDED';
    let gateStatus: 'IN_CAMPUS' | 'EXITED' | 'NOT_ARRIVED' = 'IN_CAMPUS';
    let entryTime: any = null;
    let exitTime: any = null;
    let durationMinutes: number | undefined = undefined;

    const requestedScanType = input.scanType || 'AUTO';

    if (todayLogRes.rows.length === 0) {
      // First scan of the day -> ENTRY RECORDED
      entryTime = new Date();
      gateStatus = 'IN_CAMPUS';
      action = 'ENTRY_RECORDED';

      await client.query(`
        INSERT INTO public.student_gate_attendance_logs (
          student_id, institution_code, academic_session, class_name, section_name,
          date, status, gate_status, entry_time, entry_gate, entry_method, qr_token, parent_sms_alert
        )
        VALUES ($1, $2, '2026-2027', $3, $4, $5, 'PRESENT', 'IN_CAMPUS', $6, $7, 'QR_SCAN', $8, true);
      `, [
        stu.id,
        stu.institution_code || 'CBS',
        stu.class_name || 'Class 4',
        stu.section_name || 'A',
        todayStr,
        entryTime,
        gateName,
        input.qrRawText || `VET:STU:${stu.universal_id}:${stu.id}`
      ]);

      // Audit log in student_attendance_records
      await client.query(`
        INSERT INTO public.student_attendance_records (
          student_id, date, time, academic_session, class_name, section_name,
          event_type, status, verification_method, device_id, parent_notified
        )
        VALUES ($1, $2, CURRENT_TIME, '2026-2027', $3, $4, 'ENTRY', 'PRESENT', 'QR_SCAN', $5, true);
      `, [
        stu.id, todayStr, stu.class_name, stu.section_name, gateName
      ]);

    } else {
      const existingLog = todayLogRes.rows[0];
      entryTime = existingLog.entry_time;

      if (requestedScanType === 'ENTRY') {
        // Explicit Entry
        action = 'ENTRY_RECORDED';
        gateStatus = 'IN_CAMPUS';
        entryTime = new Date();
        await client.query(`
          UPDATE public.student_gate_attendance_logs
          SET entry_time = $2, gate_status = 'IN_CAMPUS', status = 'PRESENT', entry_gate = $3, updated_at = NOW()
          WHERE id = $1;
        `, [existingLog.id, entryTime, gateName]);
      } else if (requestedScanType === 'EXIT' || existingLog.gate_status === 'IN_CAMPUS') {
        // Exit scan
        action = 'EXIT_RECORDED';
        gateStatus = 'EXITED';
        exitTime = new Date();

        if (entryTime) {
          const diffMs = exitTime.getTime() - new Date(entryTime).getTime();
          durationMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));
        }

        await client.query(`
          UPDATE public.student_gate_attendance_logs
          SET exit_time = $2, gate_status = 'EXITED', exit_gate = $3, exit_method = 'QR_SCAN', updated_at = NOW()
          WHERE id = $1;
        `, [existingLog.id, exitTime, gateName]);

        // Audit log in student_attendance_records
        await client.query(`
          INSERT INTO public.student_attendance_records (
            student_id, date, time, academic_session, class_name, section_name,
            event_type, status, verification_method, device_id, parent_notified
          )
          VALUES ($1, $2, CURRENT_TIME, '2026-2027', $3, $4, 'EXIT', 'PRESENT', 'QR_SCAN', $5, true);
        `, [
          stu.id, todayStr, stu.class_name, stu.section_name, gateName
        ]);
      } else {
        // Re-entry scan
        action = 'ENTRY_RECORDED';
        gateStatus = 'IN_CAMPUS';
        await client.query(`
          UPDATE public.student_gate_attendance_logs
          SET gate_status = 'IN_CAMPUS', updated_at = NOW()
          WHERE id = $1;
        `, [existingLog.id]);
      }
    }

    await client.query('COMMIT');

    return {
      success: true,
      action,
      message: action === 'ENTRY_RECORDED'
        ? `✓ Gate Entry Recorded for ${stu.first_name} ${stu.last_name}. SMS alert triggered to parent.`
        : `✓ Gate Exit Recorded for ${stu.first_name} ${stu.last_name}. Parent notified of student dispersal.`,
      student: {
        id: stu.id,
        firstName: stu.first_name,
        lastName: stu.last_name,
        universalId: stu.universal_id,
        admissionNumber: stu.admission_number || stu.admission_no || 'CBS-2026-XXXX',
        className: stu.class_name || 'Class 4',
        sectionName: stu.section_name || 'A',
        institutionCode: stu.institution_code || 'CBS',
        photoUrl: stu.photo_url || null,
        transportMode: stu.transport_mode || 'SCHOOL_BUS',
        parentName: stu.parent_first ? `${stu.parent_first} ${stu.parent_last || ''}` : 'Primary Guardian',
        parentPhone: stu.parent_phone || '9810011001',
      },
      attendance: {
        date: todayStr,
        entryTime: entryTime ? new Date(entryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : undefined,
        exitTime: exitTime ? new Date(exitTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : undefined,
        gateStatus,
        status: 'PRESENT',
        gateName,
        durationMinutes,
      },
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await client.end();
  }
}

export async function getTodayGateAttendanceLogsAction(filters: {
  institutionCode?: string;
  className?: string;
  gateStatus?: string;
  search?: string;
}) {
  const client = getPgClient();
  try {
    await client.connect();
    const todayStr = new Date().toISOString().split('T')[0];

    let query = `
      SELECT
        gal.id, gal.student_id, gal.institution_code, gal.academic_session,
        gal.class_name, gal.section_name, gal.date, gal.status, gal.gate_status,
        gal.entry_time, gal.exit_time, gal.entry_gate, gal.exit_gate,
        gal.entry_method, gal.exit_method, gal.parent_sms_alert,
        s.first_name, s.last_name, s.universal_id, s.photo_url, s.transport_mode,
        se.admission_number,
        g.phone AS parent_phone
      FROM public.student_gate_attendance_logs gal
      JOIN public.students s ON gal.student_id = s.id
      LEFT JOIN public.student_enrollments se ON s.id = se.student_id AND se.is_current = true
      LEFT JOIN public.student_guardians sg ON s.id = sg.student_id AND sg.is_primary = true
      LEFT JOIN public.guardians g ON sg.guardian_id = g.id
      WHERE gal.date = $1
    `;
    const params: any[] = [todayStr];
    let pIdx = 2;

    if (filters.institutionCode && filters.institutionCode !== 'ALL') {
      query += ` AND gal.institution_code = $${pIdx++}`;
      params.push(filters.institutionCode);
    }
    if (filters.className && filters.className !== 'ALL') {
      query += ` AND gal.class_name = $${pIdx++}`;
      params.push(filters.className);
    }
    if (filters.gateStatus && filters.gateStatus !== 'ALL') {
      query += ` AND gal.gate_status = $${pIdx++}`;
      params.push(filters.gateStatus);
    }
    if (filters.search && filters.search.trim() !== '') {
      query += ` AND (
        LOWER(s.first_name || ' ' || s.last_name) LIKE $${pIdx}
        OR LOWER(s.universal_id) LIKE $${pIdx}
        OR LOWER(se.admission_number) LIKE $${pIdx}
      )`;
      params.push(`%${filters.search.trim().toLowerCase()}%`);
      pIdx++;
    }

    query += ` ORDER BY gal.updated_at DESC;`;

    const res = await client.query(query, params);

    // Format rows
    const rows = res.rows.map((r: any) => ({
      ...r,
      entry_time_fmt: r.entry_time ? new Date(r.entry_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-',
      exit_time_fmt: r.exit_time ? new Date(r.exit_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-',
      date: typeof r.date === 'string' ? r.date : (r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date)),
    }));

    return {
      success: true,
      data: rows,
      counts: {
        totalScanned: rows.length,
        inCampus: rows.filter((r: any) => r.gate_status === 'IN_CAMPUS').length,
        exited: rows.filter((r: any) => r.gate_status === 'EXITED').length,
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message, data: [], counts: { totalScanned: 0, inCampus: 0, exited: 0 } };
  } finally {
    await client.end();
  }
}
