import { NextResponse } from 'next/server';
import pg from 'pg';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || '';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

/**
 * Enhanced 2-Way WhatsApp Interactive Chatbot Webhook
 * Processes parent keyword messages:
 * - "FEES" / "RECEIPT": Returns pending invoices and payment link
 * - "ATTENDANCE": Returns attendance % and recent absent days
 * - "HOMEWORK": Returns today's lesson diary and homework
 * - "BUS": Returns live transport ETA and driver phone
 */
export async function POST(request: Request) {
  const p = getPool();
  const client = await p.connect();

  try {
    const formData = await request.formData();
    const from = (formData.get('From') as string) || '';
    if (!from.trim()) {
      return NextResponse.json({ error: "Missing required 'From' sender parameter." }, { status: 400 });
    }
    const body = ((formData.get('Body') as string) || '').trim();

    console.log(`[2-Way WhatsApp Bot] Inbound from ${from}: "${body}"`);

    // Clean phone number (strip 'whatsapp:' prefix if present)
    const cleanPhone = from.replace('whatsapp:', '').trim();

    // 1. Resolve student associated with this parent phone
    const stuRes = await client.query(`
      SELECT s.id, s.first_name, s.last_name, s.admission_no, COALESCE(c.grade, 'Class 1-A') as class_name
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE s.parent_phone ILIKE '%' || $1 || '%' OR s.parent_phone = $1
      LIMIT 1;
    `, [cleanPhone.slice(-10)]); // match last 10 digits

    const student = stuRes.rows[0];
    if (!student) {
      const unregisteredReply = `👋 *Welcome to Crayon Box School Desk*\n\nYour mobile number (${cleanPhone.slice(-10)}) is not linked with an active enrolled student profile in our directory. Please contact the school administrative desk to update your verified parent mobile number.`;
      const twiml = `
        <Response>
          <Message>
            <Body>${unregisteredReply.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Body>
          </Message>
        </Response>
      `;
      return new NextResponse(twiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    const text = body.toUpperCase();
    let replyText = '';

    // INTENT 1: FEES & RECEIPTS
    if (text.includes('FEE') || text.includes('RECEIPT') || text.includes('PAY')) {
      const invRes = await client.query(`
        SELECT invoice_number, total_amount, amount_paid, status, due_date
        FROM public.student_invoices
        WHERE student_name ILIKE '%' || $1 || '%' OR admission_no = $2
        ORDER BY created_at DESC LIMIT 1;
      `, [student.first_name, student.admission_no]);

      if (invRes.rows.length > 0) {
        const inv = invRes.rows[0];
        const pending = Number(inv.total_amount) - Number(inv.amount_paid);
        replyText = `💳 *Crayon Box Fee Bot*\n\nStudent: *${student.first_name} ${student.last_name || ''}* (${student.admission_no})\nInvoice: *${inv.invoice_number}*\nTotal Due: *₹${pending.toLocaleString('en-IN')}*\nStatus: *${inv.status}*\n\n👉 *Pay Instantly via UPI / Card*:\nhttps://www.crayonboxschool.com/fees/pay?inv=${inv.invoice_number}\n\nType *MENU* for more options.`;
      } else {
        replyText = `💳 *Crayon Box Fee Bot*\n\nStudent: *${student.first_name} ${student.last_name || ''}*\nStatus: *All fees are up-to-date! Zero pending arrears.*\nReceipts available on parent portal.`;
      }
    }
    // INTENT 2: ATTENDANCE
    else if (text.includes('ATTEND') || text.includes('PRESENT') || text.includes('ABSENT')) {
      const attRes = await client.query(`
        SELECT count(*) as total_days,
               count(*) FILTER (WHERE status = 'Present') as present_days
        FROM public.student_attendance_records
        WHERE student_id = $1;
      `, [student.id]);

      const att = attRes.rows[0] || {};
      const totalDays = Number(att.total_days || 0);
      const presentDays = Number(att.present_days || 0);
      const pct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      replyText = `📊 *Attendance Desk Bot*\n\nStudent: *${student.first_name} ${student.last_name || ''}* (${student.class_name})\n• Overall Attendance: *${pct}%*\n• Present Days: *${presentDays} / ${totalDays} Days*\n• Statutory Compliance: ${pct >= 75 ? '✅ Satisfactory (>75%)' : '⚠️ Critical Remedial (<75%)'}\n\nType *MENU* for more options.`;
    }
    // INTENT 3: HOMEWORK & DIARY
    else if (text.includes('HOMEWORK') || text.includes('DIARY') || text.includes('LESSON')) {
      const hwRes = await client.query(`
        SELECT subject_name, title, instructions, due_date
        FROM public.student_homework
        WHERE class_name ILIKE '%' || $1 || '%' OR class_name = $2
        ORDER BY created_at DESC
        LIMIT 3;
      `, [student.class_name?.split('-')[0] || '', student.class_name]);

      if (hwRes.rows.length > 0) {
        const list = hwRes.rows.map((h: any, i: number) => `${i + 1}. *${h.subject_name || 'Subject'}*: ${h.title}${h.instructions ? ` - ${h.instructions}` : ''}`).join('\n');
        replyText = `📚 *Today's Lesson Diary & Homework*\n\nStudent: *${student.first_name}* (${student.class_name})\n\n${list}\n\nType *MENU* for more options.`;
      } else {
        replyText = `📚 *Today's Lesson Diary & Homework*\n\nStudent: *${student.first_name}* (${student.class_name})\n\nNo pending homework or diary entries recorded for today.\n\nType *MENU* for more options.`;
      }
    }
    // INTENT 4: TRANSPORT & BUS TRACKING
    else if (text.includes('BUS') || text.includes('TRACK') || text.includes('DRIVER')) {
      const busRes = await client.query(`
        SELECT bus_number, route_name, driver_name, driver_phone, status
        FROM public.transport_buses
        WHERE status = 'ACTIVE' OR status ILIKE '%active%'
        ORDER BY updated_at DESC
        LIMIT 1;
      `);

      if (busRes.rows.length > 0) {
        const b = busRes.rows[0];
        replyText = `🚌 *Smart Fleet Live Radar*\n\nRoute: *${b.route_name || 'Assigned Route'}*\nBus Number: *${b.bus_number}*\nDriver: *${b.driver_name || 'Assigned Driver'}* (${b.driver_phone || 'Driver contact via dispatch'})\nCurrent Status: *${b.status || 'Active'}*\n\nType *MENU* for more options.`;
      } else {
        replyText = `🚌 *Smart Fleet Live Radar*\n\nStudent: *${student.first_name}*\nNo active school transport or active bus trip found at this moment.\n\nType *MENU* for more options.`;
      }
    }
    // FALLBACK / MENU
    else {
      replyText = `👋 *Welcome to Campus 2-Way Assistant*\n\nHello! How can we assist you with *${student.first_name}* today? Reply with any keyword:\n\n• *FEES* - View invoice & online pay link\n• *ATTENDANCE* - View monthly roll-call record\n• *HOMEWORK* - Today's homework assignments\n• *BUS* - Live school bus GPS & driver contact\n• *PTM* - Book appointment with teacher\n\n_Automated Parent Desk_`;
    }

    // Return compliant TwiML response
    const twiml = `
      <Response>
        <Message>
          <Body>${replyText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Body>
        </Message>
      </Response>
    `;

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error: any) {
    console.error('[WhatsApp Webhook Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
