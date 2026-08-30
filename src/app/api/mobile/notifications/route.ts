import { NextRequest, NextResponse } from "next/server";
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export async function GET(req: NextRequest) {
  try {
    const client = await getPool().connect();
    try {
      const res = await client.query(`
        SELECT id, channel as type, subject as title, message,
               to_char(sent_at, 'DD Mon, YYYY') as date,
               target_audience as category, false as unread
        FROM public.communications
        ORDER BY sent_at DESC
        LIMIT 50;
      `);

      return NextResponse.json({
        success: true,
        totalUnread: 0,
        notifications: res.rows
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      totalUnread: 0,
      notifications: []
    });
  }
}
