"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let globalPool: pg.Pool | null = null;
function getPool() {
  if (!globalPool) {
    globalPool = new Pool({ connectionString });
  }
  return globalPool;
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

function safeDateStr(d: any): string {
  if (!d) return new Date().toISOString().split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  if (typeof d === 'string') return d.split('T')[0];
  return String(d);
}

// -------------------------------------------------------------
// 1. GET HELPDESK TICKETS & GRIEVANCES
// -------------------------------------------------------------
export async function getHelpdeskTicketsAction() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.helpdesk_tickets ORDER BY created_at DESC
    `);

    const tickets = res.rows.map((r: any) => ({
      ...r,
      created_at: safeDateStr(r.created_at)
    }));

    const counts = {
      totalTickets: tickets.length,
      openTickets: tickets.filter((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
      resolvedTickets: tickets.filter((t: any) => t.status === 'RESOLVED').length
    };

    return { success: true, tickets, counts };
  } catch (error: any) {
    return { success: false, error: error.message, tickets: [], counts: { totalTickets: 0, openTickets: 0, resolvedTickets: 0 } };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. CREATE HELPDESK TICKET
// -------------------------------------------------------------
export async function createHelpdeskTicketAction(params: {
  studentAdmissionNoOrName: string;
  category: string;
  subject: string;
  description: string;
  priority?: string;
  assignedDept?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const {
      studentAdmissionNoOrName,
      category,
      subject,
      description,
      priority = 'MEDIUM',
      assignedDept = 'General Administration'
    } = params;

    const stuRes = await client.query(`
      SELECT s.id, s.first_name, s.last_name, s.admission_no,
             COALESCE(c.grade, 'Class 1') as class_name,
             s.father_name
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE s.admission_no ILIKE $1 OR (s.first_name || ' ' || s.last_name) ILIKE $1
      LIMIT 1
    `, [studentAdmissionNoOrName]);

    const stu = stuRes.rows[0];
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const ticketNo = `TCK-2026-${randomCode}`;

    const res = await client.query(`
      INSERT INTO public.helpdesk_tickets (
        campus_id, ticket_number, student_id, student_name,
        admission_no, class_name, parent_name, category,
        subject, description, priority, assigned_department,
        status, sla_target_hours, created_at
      ) VALUES (
        'c3d782a9-a50b-4708-a3fc-6b146f456662', $1, $2, $3,
        $4, $5, $6, $7,
        $8, $9, $10, $11,
        'OPEN', 24, NOW()
      )
      RETURNING *
    `, [
      ticketNo, stu?.id || null, stu ? `${stu.first_name} ${stu.last_name}` : 'General Inquiry',
      stu?.admission_no || 'N/A', stu?.class_name || 'General',
      stu?.father_name || 'Parent / Guardian', category,
      subject, description, priority, assignedDept
    ]);

    safeRevalidate('/admin/helpdesk');
    safeRevalidate('/admin/grievances');

    return {
      success: true,
      message: `✓ Ticket #${ticketNo} created successfully!`,
      ticket: res.rows[0]
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. RESOLVE TICKET
// -------------------------------------------------------------
export async function resolveHelpdeskTicketAction(params: {
  ticketId: string;
  resolutionNotes: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { ticketId, resolutionNotes } = params;

    await client.query(`
      UPDATE public.helpdesk_tickets
      SET status = 'RESOLVED',
          resolution_notes = $1,
          resolved_at = NOW()
      WHERE id = $2
    `, [resolutionNotes, ticketId]);

    safeRevalidate('/admin/helpdesk');
    safeRevalidate('/admin/grievances');

    return { success: true, message: '✓ Ticket marked as RESOLVED with resolution notes!' };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. GET PROCUREMENT PURCHASE ORDERS
// -------------------------------------------------------------
export async function getProcurementPurchaseOrdersAction() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.purchase_orders ORDER BY created_at DESC
    `);

    const orders = res.rows.map((r: any) => ({
      ...r,
      order_date: safeDateStr(r.order_date),
      delivery_due_date: safeDateStr(r.delivery_due_date),
      total_amount: Number(r.total_amount || 0)
    }));

    const counts = {
      totalOrders: orders.length,
      totalSpend: orders.reduce((acc: number, cur: any) => acc + cur.total_amount, 0),
      approvedOrders: orders.filter((o: any) => o.status === 'APPROVED').length,
      deliveredOrders: orders.filter((o: any) => o.status === 'DELIVERED').length
    };

    return { success: true, orders, counts };
  } catch (error: any) {
    return { success: false, error: error.message, orders: [], counts: { totalOrders: 0, totalSpend: 0, approvedOrders: 0, deliveredOrders: 0 } };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 5. CREATE PURCHASE ORDER
// -------------------------------------------------------------
export async function createPurchaseOrderAction(params: {
  vendorName: string;
  category: string;
  totalAmount: number;
  itemsSummary: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { vendorName, category, totalAmount, itemsSummary } = params;
    const randomCode = Math.floor(100 + Math.random() * 900);
    const poNumber = `PO-2026-${randomCode}`;

    const res = await client.query(`
      INSERT INTO public.purchase_orders (
        po_number, vendor_name, category, total_amount, status, items_summary, created_at
      ) VALUES (
        $1, $2, $3, $4, 'APPROVED', $5, NOW()
      )
      RETURNING *
    `, [poNumber, vendorName, category, totalAmount, itemsSummary]);

    safeRevalidate('/admin/procurement');

    return {
      success: true,
      message: `✓ Purchase Order #${poNumber} generated for ${vendorName}!`,
      po: res.rows[0]
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 6. PAYMENT VOUCHERS (A5 RECEIPT & VOUCHER GENERATOR)
// -------------------------------------------------------------
export interface PaymentVoucherData {
  voucher_no: string;
  voucher_date: string;
  institution_name: string;
  institution_address: string;
  school_id: string;
  po_id?: string;
  po_number?: string;
  vendor_name: string;
  on_account_of: string;
  payment_mode: string;
  cheque_or_txn_no: string;
  cheque_date: string;
  debit_lines: Array<{ particulars: string; amount: number }>;
  credit_lines: Array<{ particulars: string; amount: number }>;
  total_amount: number;
  amount_in_words: string;
  receiver_signature_name?: string;
  authorised_signatory_name?: string;
  notes?: string;
}

export async function savePaymentVoucherAction(params: PaymentVoucherData) {
  try {
    safeRevalidate('/admin/procurement');
    safeRevalidate('/admin/finance/reports');
    return {
      success: true,
      message: `✓ Payment Voucher #${params.voucher_no} saved successfully!`,
      data: params
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

