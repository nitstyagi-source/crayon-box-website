import { NextRequest, NextResponse } from "next/server";
import pg from 'pg';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export const dynamic = "force-dynamic";

/**
 * Automated Morning School Pulse Cron Trigger (Scheduled daily at 08:00 AM)
 * Compiles real-time attendance rate, staff leave substitutes, fee velocity, and bus telemetry.
 * Automatically dispatches official digest into communications & notification feeds for the Principal.
 */
export async function GET(req: NextRequest) {
  const p = getPool();
  const client = await p.connect();

  try {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // 1. Calculate Real Student Attendance Metrics
    const stuCountRes = await client.query(`SELECT count(*)::int as count FROM public.students WHERE status = 'ACTIVE'`);
    const totalStudents = parseInt(stuCountRes.rows[0]?.count || '0', 10);

    const attTodayRes = await client.query(`
      SELECT 
        COUNT(CASE WHEN status IN ('PRESENT', 'LATE', 'HALF_DAY') THEN 1 END)::int as present_count,
        COUNT(CASE WHEN status = 'ABSENT' THEN 1 END)::int as absent_count
      FROM public.student_attendance_records
      WHERE date = CURRENT_DATE
    `).catch(() => ({ rows: [{ present_count: 0, absent_count: 0 }] }));
    const presentToday = attTodayRes.rows[0]?.present_count || 0;
    const absentCount = attTodayRes.rows[0]?.absent_count || (totalStudents > presentToday ? totalStudents - presentToday : 0);
    const attendanceRateStr = totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(1) + "%" : "0.0%";

    // 2. Query Absent Faculty on Leave Today
    const staffLeavesRes = await client.query(`
      SELECT count(*)::int as count FROM public.staff_attendance_logs 
      WHERE date = CURRENT_DATE AND status IN ('LEAVE', 'ABSENT')
    `).catch(() => ({ rows: [{ count: 0 }] }));
    const absentStaff = parseInt(staffLeavesRes.rows[0]?.count || '0', 10);

    // 3. Query Fee Collections for the current day
    const feeRes = await client.query(`
      SELECT COALESCE(SUM(amount), 0)::numeric as today_coll
      FROM public.fee_payment_transactions
      WHERE created_at >= CURRENT_DATE
    `).catch(async () => {
      return client.query(`
        SELECT COALESCE(SUM(amount), 0)::numeric as today_coll
        FROM public.fee_payments
        WHERE created_at >= CURRENT_DATE
      `).catch(() => ({ rows: [{ today_coll: 0 }] }));
    });
    const todayCollections = Number(feeRes.rows[0]?.today_coll || 0);

    // 4. Fleet and At-Risk Watchlist
    const busRes = await client.query(`
      SELECT 
        COUNT(*)::int as total_buses,
        COUNT(CASE WHEN status = 'ACTIVE' OR status = 'IN_TRANSIT' THEN 1 END)::int as active_buses
      FROM public.transport_buses
    `).catch(() => ({ rows: [{ total_buses: 0, active_buses: 0 }] }));
    const totalBuses = busRes.rows[0]?.total_buses || 0;
    const activeBuses = busRes.rows[0]?.active_buses || 0;

    const atRiskRes = await client.query(`
      SELECT COUNT(*)::int as count FROM (
        SELECT student_id, 
               COUNT(CASE WHEN status IN ('PRESENT', 'LATE') THEN 1 END)::float / NULLIF(COUNT(*), 0) as rate
        FROM public.student_attendance_records
        GROUP BY student_id
        HAVING COUNT(*) >= 10 AND (COUNT(CASE WHEN status IN ('PRESENT', 'LATE') THEN 1 END)::float / COUNT(*)) < 0.75
      ) sub
    `).catch(() => ({ rows: [{ count: 0 }] }));
    const atRiskCount = atRiskRes.rows[0]?.count || 0;

    const adminCountRes = await client.query(`SELECT count(*)::int as count FROM public.super_admin_users;`).catch(() => ({ rows: [{ count: 1 }] }));
    const adminRecipients = adminCountRes.rows[0]?.count || 1;

    // 5. Construct Pulse Message
    const pulseTitle = `🌅 Executive School Pulse (${todayStr})`;
    const pulseMessage = [
      `• Student Attendance: ${attendanceRateStr} (${presentToday} Present, ${absentCount} Absent of ${totalStudents} enrolled)`,
      `• Faculty Deployment: ${absentStaff} teachers on leave today`,
      `• Fee Realization: ₹${todayCollections.toLocaleString('en-IN')} collected today`,
      `• Fleet Telematics: ${activeBuses}/${totalBuses} School Buses active on GPS radar`,
      `• At-Risk Watchlist: ${atRiskCount} students below statutory 75% attendance threshold flagged`
    ].join('\n');

    // 6. Store in communications & communication_campaigns for Admin
    await client.query(`
      INSERT INTO public.communications (subject, channel, target_audience, message, status, sent_at)
      VALUES ($1, 'PUSH', 'ADMIN', $2, 'DELIVERED', NOW());
    `, [pulseTitle, pulseMessage]);

    await client.query(`
      INSERT INTO public.communication_campaigns
        (campaign_code, title, channel, target_audience, message_body, status, recipient_count, delivered_count, read_count)
      VALUES ($1, $2, 'PUSH', 'ADMIN', $3, 'SENT', $4, $4, 1);
    `, [`PULSE-${Date.now()}`, pulseTitle, pulseMessage, adminRecipients]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      digest: {
        title: pulseTitle,
        attendanceRate: attendanceRateStr,
        totalStudents,
        presentStudents: presentToday,
        absentStudents: absentCount,
        absentFaculty: absentStaff,
        collectionsToday: todayCollections,
        fleetStatus: `${activeBuses}/${totalBuses} Buses Active`,
        atRiskStudents: atRiskCount,
        publishedToFeed: true
      }
    });

  } catch (error: any) {
    console.error('Morning School Pulse error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
