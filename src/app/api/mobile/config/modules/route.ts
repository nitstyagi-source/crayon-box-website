import { NextResponse } from 'next/server';
import pg from 'pg';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export async function GET(request: Request) {
  const p = getPool();
  const client = await p.connect();

  try {
    const { searchParams } = new URL(request.url);
    const persona = searchParams.get('persona'); // e.g. 'FAMILY_STUDENT', 'FACULTY', 'LOGISTICS_SECURITY'
    const institution = searchParams.get('institution') || searchParams.get('institutionCode') || searchParams.get('school');

    let query: string;
    const params: any[] = [];

    if (institution && institution !== 'ALL') {
      params.push(institution);
      query = `
        SELECT 
          ems.code, 
          ems.name, 
          ems.category, 
          ems.mobile_icon, 
          ems.mobile_route, 
          ems.mobile_persona, 
          ems.description
        FROM public.erp_module_statuses ems
        LEFT JOIN public.institution_module_statuses ims 
          ON ims.module_code = ems.code AND ims.institution_code = $1
        WHERE COALESCE(ims.is_enabled, ems.is_enabled) = true 
          AND ems.mobile_enabled = true
      `;

      if (persona && persona !== 'ALL') {
        params.push(persona);
        query += ` AND (ems.mobile_persona = $2 OR ems.mobile_persona = 'ALL' OR ems.mobile_persona = 'ADMIN_ALL')`;
      }

      query += ` ORDER BY ems.category ASC, ems.name ASC`;
    } else {
      query = `
        SELECT code, name, category, mobile_icon, mobile_route, mobile_persona, description
        FROM public.erp_module_statuses
        WHERE is_enabled = true AND mobile_enabled = true
      `;

      if (persona && persona !== 'ALL') {
        params.push(persona);
        query += ` AND (mobile_persona = $1 OR mobile_persona = 'ALL' OR mobile_persona = 'ADMIN_ALL')`;
      }

      query += ` ORDER BY category ASC, name ASC`;
    }

    const res = await client.query(query, params);

    return NextResponse.json({
      success: true,
      count: res.rows.length,
      persona: persona || 'ALL',
      institution: institution || 'GLOBAL',
      modules: res.rows
    });
  } catch (error: any) {
    console.error('Error fetching mobile config modules:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
