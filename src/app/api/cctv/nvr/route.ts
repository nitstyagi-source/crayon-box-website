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

const CAM_PATH_MAP: Record<string, string> = {
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

export async function GET() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const settingsRes = await client.query(`
      SELECT dvr_ip, dvr_port, dvr_username, dvr_password, gateway_url,
             streaming_start_time, streaming_end_time, global_kill_switch,
             require_student_present, watermark_enabled
      FROM public.live_stream_settings
      LIMIT 1;
    `);

    const camerasRes = await client.query(`
      SELECT id, camera_name, classroom_name, room_number, stream_url, status, is_active
      FROM public.cameras
      ORDER BY id ASC;
    `);

    return NextResponse.json({
      success: true,
      data: {
        nvr: settingsRes.rows[0] || {
          dvr_ip: '192.168.1.90',
          dvr_port: '10554',
          dvr_username: 'admin',
          dvr_password: 'master123',
          gateway_url: 'https://soma-routing-rider-generic.trycloudflare.com',
          streaming_start_time: '08:30',
          streaming_end_time: '14:30',
        },
        cameras: camerasRes.rows
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(request: Request) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const body = await request.json();
    const {
      dvr_ip = '192.168.1.90',
      dvr_port = '10554',
      dvr_username = 'admin',
      dvr_password = 'master123',
      gateway_url = 'https://soma-routing-rider-generic.trycloudflare.com',
      streaming_start_time = '08:30',
      streaming_end_time = '14:30',
      global_kill_switch = false,
      require_student_present = true,
      watermark_enabled = true
    } = body;

    const cleanGateway = gateway_url.replace(/\/$/, '');

    // 1. Update live_stream_settings
    await client.query(`
      UPDATE public.live_stream_settings
      SET dvr_ip = $1,
          dvr_port = $2,
          dvr_username = $3,
          dvr_password = $4,
          gateway_url = $5,
          streaming_start_time = $6,
          streaming_end_time = $7,
          global_kill_switch = $8,
          require_student_present = $9,
          watermark_enabled = $10,
          updated_at = NOW();
    `, [
      dvr_ip, dvr_port, dvr_username, dvr_password, cleanGateway,
      streaming_start_time, streaming_end_time, global_kill_switch,
      require_student_present, watermark_enabled
    ]);

    // 2. Update all 16 cameras stream URLs
    for (const [classroomName, pathKey] of Object.entries(CAM_PATH_MAP)) {
      const streamUrl = `${cleanGateway}/${pathKey}/`;
      await client.query(`
        UPDATE public.cameras
        SET stream_url = $1, status = 'Online', is_active = true, updated_at = NOW()
        WHERE classroom_name = $2 OR classroom_name ILIKE $3;
      `, [streamUrl, classroomName, `%${pathKey.replace('_cam', '')}%`]);
    }

    return NextResponse.json({
      success: true,
      message: '✓ NVR configuration updated and all cameras synchronized successfully!',
      data: {
        dvr_ip,
        dvr_port,
        dvr_username,
        cleanGateway
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
