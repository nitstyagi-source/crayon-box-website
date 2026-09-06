"use server";

import pg from "pg";

let globalPool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL || '';
    globalPool = new pg.Pool({
      connectionString,
      max: 5,
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
}

export interface SearchResultItem {
  id: string;
  type: 'STUDENT' | 'FAMILY' | 'STAFF' | 'INVOICE' | 'RECEIPT' | 'ASSET' | 'INCIDENT';
  title: string;
  subtitle: string;
  route: string;
  badge: string;
  badgeColor: string;
}

export async function executeGlobalErpSearchAction(query: string): Promise<{ success: boolean; results: SearchResultItem[] }> {
  if (!query || query.trim().length < 2) {
    return { success: true, results: [] };
  }

  const p = getPool();
  const client = await p.connect();
  const q = `%${query.trim().toLowerCase()}%`;

  try {
    const results: SearchResultItem[] = [];

    // 1. Search Students
    const studentRes = await client.query(`
      SELECT s.id, s.first_name, s.last_name, s.admission_no, COALESCE(c.grade, 'Class 1') as grade, COALESCE(c.section, 'A') as section
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE LOWER(s.first_name || ' ' || s.last_name) LIKE $1
         OR LOWER(COALESCE(s.admission_no, '')) LIKE $1
      LIMIT 5;
    `, [q]);

    for (const row of studentRes.rows) {
      results.push({
        id: row.id,
        type: 'STUDENT',
        title: `${row.first_name} ${row.last_name}`.trim(),
        subtitle: `${row.grade}-${row.section} • ADM: ${row.admission_no || 'N/A'}`,
        route: `/admin/students/${row.id}`,
        badge: 'Student',
        badgeColor: 'emerald'
      });
    }

    // 2. Search Staff
    const staffRes = await client.query(`
      SELECT id, full_name, email, role, department
      FROM public.staff
      WHERE LOWER(full_name) LIKE $1
         OR LOWER(COALESCE(email, '')) LIKE $1
         OR LOWER(COALESCE(department, '')) LIKE $1
      LIMIT 5;
    `, [q]);

    for (const row of staffRes.rows) {
      results.push({
        id: row.id,
        type: 'STAFF',
        title: row.full_name,
        subtitle: `${row.role || 'Staff'} • ${row.department || 'Academic'}`,
        route: `/admin/faculty/${row.id}`,
        badge: 'Faculty/Staff',
        badgeColor: 'blue'
      });
    }

    // 3. Search Invoices
    const invRes = await client.query(`
      SELECT id, invoice_number, student_name, total_amount, status
      FROM public.student_invoices
      WHERE LOWER(invoice_number) LIKE $1
         OR LOWER(COALESCE(student_name, '')) LIKE $1
      LIMIT 5;
    `, [q]);

    for (const row of invRes.rows) {
      results.push({
        id: row.id,
        type: 'INVOICE',
        title: `Invoice #${row.invoice_number}`,
        subtitle: `${row.student_name || 'Student'} • ₹${Number(row.total_amount).toLocaleString('en-IN')} • ${row.status}`,
        route: `/admin/finance/invoices`,
        badge: row.status === 'PAID' ? 'Invoice (Paid)' : 'Invoice (Pending)',
        badgeColor: row.status === 'PAID' ? 'emerald' : 'amber'
      });
    }

    // 4. Search Guardians / Parents
    const parentRes = await client.query(`
      SELECT s.id, s.father_name, s.mother_name, s.parent_phone, s.first_name, s.last_name
      FROM public.students s
      WHERE (LOWER(COALESCE(s.father_name, '')) LIKE $1 OR LOWER(COALESCE(s.mother_name, '')) LIKE $1)
      LIMIT 3;
    `, [q]);

    for (const row of parentRes.rows) {
      const gName = row.father_name || row.mother_name || 'Parent';
      results.push({
        id: `fam-${row.id}`,
        type: 'FAMILY',
        title: `${gName} (Guardian)`,
        subtitle: `Ward: ${row.first_name} ${row.last_name} • ${row.parent_phone || 'Contact on file'}`,
        route: `/admin/students/${row.id}`,
        badge: 'Family',
        badgeColor: 'purple'
      });
    }

    return { success: true, results };
  } catch (err: any) {
    return { success: false, results: [] };
  } finally {
    client.release();
  }
}
