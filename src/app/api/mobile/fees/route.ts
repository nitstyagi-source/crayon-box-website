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
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId') || '';

  const pool = getPool();
  try {
    const invoicesRes = await pool.query(`
      SELECT id, invoice_number as "invoiceNo", billing_period as term, total_amount as amount, 
             amount_paid as "amountPaid", status, due_date as "dueDate", created_at as "paidOn"
      FROM public.student_invoices
      ORDER BY created_at DESC
      LIMIT 10;
    `);

    const invoices = invoicesRes.rows;
    const totalDues = invoices
      .filter((inv: any) => inv.status !== 'PAID')
      .reduce((sum: number, inv: any) => sum + Number(inv.amount || 0) - Number(inv.amountPaid || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        studentId,
        currency: 'INR',
        totalDues,
        invoices
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { studentId, invoiceNo, amount, paymentMode = 'UPI', className = 'Grade 5', sectionName = 'A' } = body;

    const receiptNo = `REC-VAANI-${Date.now().toString().slice(-5)}`;
    const payAmount = Number(amount) || 45000;

    // 1. Update invoice in student_invoices
    await client.query(`
      UPDATE public.student_invoices
      SET status = 'PAID', amount_paid = total_amount
      WHERE invoice_number = $1 OR id::text = $1;
    `, [invoiceNo]);

    // 2. Insert into fee_receipts
    const stuRes = await client.query(`
      SELECT s.id, s.first_name, s.last_name, s.admission_no, 
             COALESCE(c.grade, 'Grade 5') as grade, COALESCE(c.section, 'A') as section
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE s.id::text = $1 OR s.admission_no ILIKE $1 
      LIMIT 1;
    `, [studentId]);
    const stu = stuRes.rows[0];

    await client.query(`
      INSERT INTO public.fee_receipts (
        receipt_no, receipt_date, student_id, admission_no, student_name,
        class_name, section_name, total_amount_due, concession_amount, late_fee_amount,
        net_amount_paid, remaining_balance, payment_mode, status, created_at
      ) VALUES (
        $1, CURRENT_DATE, $2, $3, $4,
        $5, $6, $7, 0, 0,
        $7, 0, $8, 'Completed', NOW()
      );
    `, [receiptNo, stu?.id || null, stu?.admission_no || 'CBS-2026-0001', `${stu?.first_name || 'Aarav'} ${stu?.last_name || 'Sharma'}`, stu?.grade || className, stu?.section || sectionName, payAmount, paymentMode]);

    return NextResponse.json({
      success: true,
      message: `✓ Fee payment of ₹${payAmount} processed successfully! Receipt #${receiptNo} generated.`,
      receiptNo,
      invoiceNo,
      status: 'PAID',
      paidOn: new Date().toISOString().split('T')[0]
    });
  } catch (error: any) {
    console.error("Error in mobile fee payment API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
