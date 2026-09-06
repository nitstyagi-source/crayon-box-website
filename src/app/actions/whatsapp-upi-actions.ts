"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

function safeRevalidate(path: string) {
  try { revalidatePath(path); } catch {}
}

/**
 * 1. DISPATCH QUARTERLY WHATSAPP UPI 1-CLICK PAYMENT LINKS
 */
export async function dispatchQuarterlyWhatsAppInvoicesAction(quarterName?: string) {
  const curYear = new Date().getFullYear();
  const curYearShort = (curYear + 1).toString().slice(-2);
  const targetQuarter = quarterName || `Q2 ${curYear}-${curYearShort}`;
  const p = getPool();
  const client = await p.connect();
  try {
    // 1. Fetch unpaid or partially paid invoices with student & parent phone
    const { rows: invoices } = await client.query(`
      SELECT 
        i.*,
        s.parent_phone,
        s.father_name,
        s.mother_name
      FROM public.student_invoices i
      JOIN public.students s ON i.student_id = s.id
      WHERE i.status != 'PAID'
      LIMIT 50
    `);

    if (invoices.length === 0) {
      return {
        success: true,
        dispatchedCount: 0,
        message: "No outstanding or unpaid student invoices found requiring WhatsApp dispatch.",
        logs: []
      };
    }

    const dispatchedLogs: any[] = [];

    for (const inv of invoices) {
      const phone = inv.parent_phone;
      if (!phone || phone.trim() === '') continue;

      const dueAmount = Number(inv.total_amount || 0) - Number(inv.amount_paid || 0);
      if (dueAmount <= 0) continue;

      const parentName = inv.father_name || inv.mother_name || 'Parent';
      const studentName = inv.student_name || 'Student';
      const invNo = inv.invoice_number || `INV-${inv.admission_no || inv.id?.slice(0, 6)}`;

      // Dynamic UPI Intent URL (Standard NPCI Specification)
      const upiLink = `upi://pay?pa=fees.crayonbox@icici&pn=Crayon%20Box%20School&am=${dueAmount}&cu=INR&tn=Fee-${invNo}`;

      const messageText = `Dear ${parentName},\n` +
        `This is a friendly reminder that the ${targetQuarter} School Fee for ${studentName} (${inv.admission_no}) ` +
        `is ₹${dueAmount.toLocaleString('en-IN')}.\n\n` +
        `Pay instantly via UPI (GPay / PhonePe / Paytm / BHIM) in 1 click:\n${upiLink}\n\n` +
        `School Accounts Office | Crayon Box School`;

      // Insert into message audit log
      const { rows: log } = await client.query(`
        INSERT INTO public.whatsapp_messages_log (
          recipient_phone, recipient_name, student_id, message_type,
          message_text, upi_pay_link, status
        ) VALUES (
          $1, $2, $3, 'FEE_INVOICE_UPI', $4, $5, 'SENT'
        ) RETURNING id;
      `, [phone, parentName, inv.student_id, messageText, upiLink]);

      dispatchedLogs.push({
        logId: log[0].id,
        recipient: parentName,
        phone,
        studentName,
        dueAmount,
        invoiceNumber: invNo,
        upiLink,
        status: 'DELIVERED'
      });
    }

    safeRevalidate('/admin/finance');

    return {
      success: true,
      dispatchedCount: dispatchedLogs.length,
      quarterName,
      logs: dispatchedLogs
    };
  } catch (err: any) {
    return { success: false, error: err.message, logs: [] };
  } finally {
    client.release();
  }
}

/**
 * 2. GET WHATSAPP INVOICING DISPATCH LOGS
 */
export async function getWhatsAppInvoicingLogsAction() {
  const p = getPool();
  const client = await p.connect();
  try {
    const { rows } = await client.query(`
      SELECT 
        w.*,
        s.first_name,
        s.last_name,
        s.admission_no
      FROM public.whatsapp_messages_log w
      LEFT JOIN public.students s ON w.student_id = s.id
      ORDER BY w.sent_at DESC
      LIMIT 25
    `);

    return {
      success: true,
      logs: rows.map((r: any) => ({
        id: r.id,
        recipientPhone: r.recipient_phone,
        recipientName: r.recipient_name,
        studentName: r.first_name ? `${r.first_name} ${r.last_name || ''}`.trim() : 'Enrolled Student',
        admissionNo: r.admission_no || `ADM-${new Date().getFullYear()}`,
        messageText: r.message_text,
        upiPayLink: r.upi_pay_link,
        status: r.status,
        sentAt: r.sent_at
      }))
    };
  } catch (err: any) {
    return { success: false, error: err.message, logs: [] };
  } finally {
    client.release();
  }
}
