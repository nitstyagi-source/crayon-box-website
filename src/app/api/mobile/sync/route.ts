import { NextResponse } from 'next/server';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let globalPool: pg.Pool | null = null;
function getPool() {
  if (!globalPool) {
    globalPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
}

export async function GET(request: Request) {
  const pool = getPool();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    const role = searchParams.get('role') || 'Parent';
    const childId = searchParams.get('childId') || '';

    // 1. Live Campus CCTV Channels
    let liveCameras: any[] = [];
    try {
      const camsRes = await pool.query(`
        SELECT id, camera_name as name, room_number as room, classroom_name as "classroomName",
               institution_code as "institutionCode", institution_code as "institution_code",
               status, NOT kill_switch_active as "isStreaming", 
               stream_url as "streamUrl", 25 as fps, '720p HD' as quality
        FROM public.cameras
        ORDER BY created_at ASC;
      `);
      liveCameras = camsRes.rows;
    } catch (e) {
      console.error("Failed to query cameras:", e);
    }

    // 2. Real Telematics Bus Data
    let busTelemetry = {
      busNumber: 'Bus 01 (Route 1)',
      driverName: 'Assigned Driver',
      driverPhone: '+91 98110 44321',
      speedKmH: 0,
      status: 'Parked',
      currentLocation: 'School Campus',
      nextStop: 'Campus Gate',
      etaMinutes: 0,
      latitude: 28.6295,
      longitude: 77.3725,
      stops: []
    };

    try {
      const busRes = await pool.query(`
        SELECT bus_number, driver_name, driver_phone, speed_kmh as "speedKmH",
               status, current_location as "currentLocation", latitude, longitude
        FROM public.transport_buses
        ORDER BY created_at ASC
        LIMIT 1;
      `);
      if (busRes.rows.length > 0) {
        const busRow = busRes.rows[0];
        busTelemetry = {
          ...busTelemetry,
          busNumber: busRow.bus_number || 'Bus 01',
          driverName: busRow.driver_name || 'Driver',
          driverPhone: busRow.driver_phone || '',
          speedKmH: Number(busRow.speedKmH || 0),
          status: busRow.status || 'Active',
          currentLocation: busRow.currentLocation || 'Route Active',
          latitude: Number(busRow.latitude || 28.6295),
          longitude: Number(busRow.longitude || 77.3725),
        };
      }
    } catch {}

    // 3. Real Student Fee Invoices
    let studentFees: any = {
      studentId: childId || '',
      studentName: '',
      totalDues: 0,
      currency: 'INR',
      invoices: []
    };

    try {
      const invoicesRes = await pool.query(`
        SELECT id, invoice_number as "invoiceNo", billing_period as term, total_amount as amount, 
               amount_paid as "amountPaid", status, due_date as "dueDate", created_at as "paidOn"
        FROM public.student_invoices
        ORDER BY created_at DESC
        LIMIT 10;
      `);

      studentFees.invoices = invoicesRes.rows;
      studentFees.totalDues = invoicesRes.rows
        .filter((inv: any) => inv.status !== 'PAID')
        .reduce((sum: number, inv: any) => sum + Number(inv.amount || 0) - Number(inv.amountPaid || 0), 0);
    } catch {}

    // 4. Digital Diary & Homework
    let digitalDiary: any[] = [];
    try {
      const diaryRes = await pool.query(`
        SELECT id, subject_name as subject, homework_title as title, homework_due_date as "dueDate",
               teacher_name as teacher, 'Active' as status, homework_description as description,
               date as "assignedDate"
        FROM public.digital_diary_entries
        WHERE homework_title IS NOT NULL AND homework_title != ''
        ORDER BY date DESC
        LIMIT 10;
      `);
      digitalDiary = diaryRes.rows;
    } catch {}

    // 5. Approvals & Leave Requests
    let approvals: any[] = [];
    try {
      const leaveRes = await pool.query(`
        SELECT lr.id, lr.leave_type as type, 
               CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) as requester,
               lr.reason as details, lr.status, lr.created_at::text as date
        FROM public.leave_requests lr
        LEFT JOIN public.staff s ON s.id = lr.staff_id
        ORDER BY lr.created_at DESC
        LIMIT 10;
      `);
      approvals = leaveRes.rows;
    } catch {}

    // 6. Real Institutions and Trust Hierarchy
    let institutions: any[] = [];
    let trustInfo: any = null;

    try {
      const [instsRes, trustRes] = await Promise.all([
        pool.query(`
          SELECT id, code, name, short_name as "shortName", institution_type as "institutionType",
                 academic_framework as "academicFramework", board_affiliation as "boardAffiliation",
                 affiliation_number as "affiliationNumber", principal_name as "principalName",
                 principal_email as "principalEmail", brand_color as "brandColor", address, status
          FROM public.institutions
          ORDER BY created_at ASC;
        `),
        pool.query(`SELECT * FROM public.trusts ORDER BY created_at ASC LIMIT 1;`)
      ]);

      institutions = instsRes.rows;
      if (trustRes.rows.length > 0) {
        trustInfo = trustRes.rows[0];
      }
    } catch {}

    // 7. Real-time Attendance & KPI Summary
    let totalRecords = 0;
    let presentRecords = 0;
    try {
      const [attTotal, attPresent] = await Promise.all([
        pool.query(`SELECT COUNT(*) FROM public.attendance_logs WHERE log_date = CURRENT_DATE;`),
        pool.query(`SELECT COUNT(*) FROM public.attendance_logs WHERE log_date = CURRENT_DATE AND status = 'PRESENT';`)
      ]);
      totalRecords = Number(attTotal.rows[0]?.count || 0);
      presentRecords = Number(attPresent.rows[0]?.count || 0);
    } catch {}

    const attPct = totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(1) : "0.0";

    const syncPayload = {
      appName: "Crayon Box",
      appVersion: "2.2.0",
      serverTimestamp: new Date().toISOString(),
      status: 'synchronized',
      userContext: {
        userId,
        role,
        activeChildId: childId
      },
      institutions,
      trust: trustInfo,
      syncModules: {
        kpiOverview: {
          totalRevenueCollected: '₹0',
          feeCollectionRate: '0%',
          studentAttendanceToday: `${attPct}%`,
          staffAttendanceToday: '0%',
          activeBusesCount: 0,
          activeCamerasCount: liveCameras.filter((c: any) => c.isStreaming).length,
          pendingApprovalsCount: approvals.filter((a: any) => a.status === 'PENDING').length,
          admissionsPipelineCount: 0
        },
        liveCameras,
        busTelemetry,
        fees: studentFees,
        digitalDiary,
        attendanceSummary: {
          percentage: Number(attPct),
          totalDays: totalRecords,
          presentDays: presentRecords,
          absentDays: totalRecords - presentRecords,
          lateDays: 0,
          streak: 0
        },
        approvals
      }
    };

    return NextResponse.json({ success: true, data: syncPayload });
  } catch (error: any) {
    console.error("Error in mobile sync API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
