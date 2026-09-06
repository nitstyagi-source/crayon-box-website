import { NextResponse } from 'next/server';
import pg from 'pg';

let globalPool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL || '';
    globalPool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  const pool = getPool();
  try {
    let sql = `
      SELECT id, title, author, isbn, category, total_copies as "totalCopies", available_copies as "availableCopies"
      FROM public.library_books
    `;
    const params: any[] = [];
    if (search) {
      params.push(`%${search}%`);
      sql += ` WHERE title ILIKE $1 OR author ILIKE $1 OR category ILIKE $1`;
    }
    sql += ` ORDER BY title ASC LIMIT 20;`;

    const res = await pool.query(sql, params);
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
    const { loanId } = body;

    // +7 days renewal in library_transactions
    await client.query(`
      UPDATE public.library_transactions
      SET due_date = due_date + INTERVAL '7 days', 
          renewal_count = COALESCE(renewal_count, 0) + 1,
          updated_at = NOW()
      WHERE id = $1;
    `, [loanId]);

    return NextResponse.json({
      success: true,
      message: "✓ Vaani: Book loan successfully renewed for +7 additional days!"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
