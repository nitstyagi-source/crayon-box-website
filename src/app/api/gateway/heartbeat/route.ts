import { NextRequest, NextResponse } from "next/server";
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

const CAM_MAPPING: Record<string, string> = {
  "Nursery Play Wing": "nursery_cam",
  "LKG Activity Room": "lkg_cam",
  "UKG Classroom": "ukg_cam",
  "Grade 1 Classroom": "grade1_cam",
  "Grade 2 Classroom": "grade2_cam",
  "Grade 3 Classroom": "grade3_cam",
  "Grade 4 Classroom": "grade4_cam",
  "Grade 5 Classroom": "grade5_cam",
  "Grade 6 Classroom": "grade6_cam",
  "Grade 7 Classroom": "grade7_cam",
  "Grade 8 Classroom": "grade8_cam",
  "Grade 9 Classroom": "grade9_cam",
  "Grade 10 Board Room": "grade10_cam",
  "Science & Bio Laboratory": "science_lab",
  "AI & Robotics Tech Hub": "computer_lab",
  "Indoor Sports & Activity Hall": "activity_hall"
};

export async function POST(req: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { gatewayUrl, dvrIp, dvrPort } = body;

    if (!gatewayUrl || !gatewayUrl.startsWith("http")) {
      return NextResponse.json({ error: "Invalid gatewayUrl provided" }, { status: 400 });
    }

    const cleanGateway = gatewayUrl.replace(/\/+$/, "");

    // 1. Update all 16 cameras in PostgreSQL
    for (const [classroomName, pathKey] of Object.entries(CAM_MAPPING)) {
      const streamUrl = `${cleanGateway}/${pathKey}/`;
      await client.query(`
        UPDATE public.cameras
        SET stream_url = $1, status = 'Online', is_active = true, kill_switch_active = false, updated_at = NOW()
        WHERE classroom_name = $2 OR classroom_name ILIKE $3;
      `, [streamUrl, classroomName, `%${pathKey.replace('_cam', '')}%`]);
    }

    // 2. Update global settings in PostgreSQL
    await client.query(`
      UPDATE public.live_stream_settings
      SET gateway_url = $1, 
          global_kill_switch = false,
          dvr_ip = COALESCE($2, dvr_ip, '192.168.1.90'),
          dvr_port = COALESCE($3, dvr_port, '10554'),
          updated_at = NOW()
      WHERE 1=1;
    `, [cleanGateway, dvrIp || null, dvrPort || null]);

    return NextResponse.json({
      success: true,
      message: "Gateway heartbeat received and all 16 cameras synchronized with live HTTPS stream.",
      gatewayUrl: cleanGateway,
      totalCamerasSynced: Object.keys(CAM_MAPPING).length,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Gateway heartbeat error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const settingsRes = await client.query(`SELECT * FROM public.live_stream_settings LIMIT 1;`);
    const camerasRes = await client.query(`SELECT count(*) as total, count(CASE WHEN status = 'Online' THEN 1 END) as online FROM public.cameras;`);

    return NextResponse.json({
      status: "operational",
      settings: settingsRes.rows[0] || null,
      cameras: camerasRes.rows[0] || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}
