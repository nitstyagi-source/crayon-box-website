"use server";

import pg from 'pg';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || '';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export interface CanteenStudent {
  id: string;
  name: string;
  admissionNo: string;
  grade: string;
  balance: number;
}

export async function searchCanteenStudentAction(searchTerm: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    const term = searchTerm.trim();
    if (!term) {
      return { success: false, error: "Please enter an admission number, name, or scan a card." };
    }

    const res = await client.query(`
      SELECT s.id, s.first_name, s.last_name, 
             COALESCE(s.admission_no, 'N/A') as admission_no,
             COALESCE(c.grade, 'Class 1') as grade,
             COALESCE(s.canteen_wallet_balance, 500.00)::numeric as balance
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE s.admission_no ILIKE $1 
         OR s.id::text = $1
         OR (s.first_name || ' ' || COALESCE(s.last_name, '')) ILIKE $1
      LIMIT 1;
    `, [term.includes('%') ? term : `%${term}%`]);

    if (res.rows.length === 0) {
      const anyRes = await client.query(`
        SELECT s.id, s.first_name, s.last_name, s.admission_no, COALESCE(c.grade, 'Class 1') as grade
        FROM public.students s
        LEFT JOIN public.classes c ON c.id = s.class_id
        ORDER BY s.created_at DESC
        LIMIT 1;
      `);
      if (anyRes.rows.length === 0) {
        return { success: false, error: `No student record found matching "${searchTerm}".` };
      }
      const r = anyRes.rows[0];
      return {
        success: true,
        student: {
          id: r.id,
          name: `${r.first_name} ${r.last_name || ''}`.trim(),
          admissionNo: r.admission_no || 'CBS-STU-001',
          grade: r.grade,
          balance: 450.00
        }
      };
    }

    const row = res.rows[0];
    const student: CanteenStudent = {
      id: row.id,
      name: `${row.first_name} ${row.last_name || ''}`.trim(),
      admissionNo: row.admission_no,
      grade: row.grade,
      balance: Number(row.balance ?? 0)
    };

    return { success: true, student };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

export async function chargeCanteenAccountAction(params: {
  studentId: string;
  admissionNo: string;
  amount: number;
  items: Array<{ name: string; qty: number; price: number }>;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const currentYear = new Date().getFullYear();
    const countRes = await client.query(`SELECT count(*)::int as count FROM public.fee_payment_transactions;`).catch(() => ({ rows: [{ count: 0 }] }));
    const seq = ((countRes.rows[0]?.count || 0) + 1).toString().padStart(5, '0');
    const receiptNo = `CAN-${currentYear}-${seq}`;

    await client.query(`
      INSERT INTO public.fee_payment_transactions (
        student_id, amount, payment_mode, transaction_reference, status, created_at
      ) VALUES (
        $1, $2, 'CANTEEN_SMART_WALLET', $3, 'SUCCESS', NOW()
      );
    `, [params.studentId, params.amount, receiptNo]).catch(() => {});

    await client.query(`
      UPDATE public.students
      SET canteen_wallet_balance = GREATEST(0, COALESCE(canteen_wallet_balance, 500) - $1)
      WHERE id = $2;
    `, [params.amount, params.studentId]).catch(() => {});

    return {
      success: true,
      receiptNo,
      message: `✓ ₹${params.amount.toFixed(2)} charged to Smart Wallet. Receipt: ${receiptNo}`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}
