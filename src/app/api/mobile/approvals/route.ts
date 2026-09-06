import { NextResponse } from 'next/server';
import pg from 'pg';

let globalPool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    globalPool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
}

export async function GET() {
  const pool = getPool();
  try {
    const res = await pool.query(`
      SELECT lr.id, lr.leave_type as type, 
             CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) as requester,
             lr.reason as details, lr.status, lr.created_at::text as date
      FROM public.leave_requests lr
      LEFT JOIN public.staff s ON s.id = lr.staff_id
      ORDER BY lr.created_at DESC
      LIMIT 20;
    `);

    return NextResponse.json({ success: true, data: res.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { id, action, remarks } = body;

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await client.query(`
      UPDATE public.leave_requests
      SET status = $1, reason = COALESCE($2, reason)
      WHERE id = $3;
    `, [newStatus, remarks || null, id]);

    return NextResponse.json({
      success: true,
      message: `✓ Vaani: Approval #${id} marked as ${newStatus}.`,
      status: newStatus
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
