"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

function getPool() {
  return new Pool({ connectionString });
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
// 1. GET PTM DASHBOARD & SLOTS ROSTER
// -------------------------------------------------------------
export async function getPtmDashboardAction(params?: {
  eventId?: string;
  teacherId?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // 1. Fetch Events
    const eventsRes = await client.query(`
      SELECT * FROM public.ptm_events ORDER BY event_date ASC
    `);
    const events = eventsRes.rows.map((e: any) => ({
      ...e,
      event_date: safeDateStr(e.event_date),
      created_at: safeDateStr(e.created_at)
    }));

    if (events.length === 0) {
      return { success: true, events: [], slots: [], counts: { totalSlots: 0, bookedSlots: 0, availableSlots: 0, bookingRate: 0 } };
    }

    const currentEventId = params?.eventId || events[0].id;

    // 2. Fetch Slots for current event
    let slotQuery = `
      SELECT s.*, st.first_name as teacher_first, st.last_name as teacher_last
      FROM public.ptm_teacher_slots s
      LEFT JOIN public.staff st ON st.id = s.staff_id
      WHERE s.ptm_event_id = $1
    `;
    const values: any[] = [currentEventId];

    if (params?.teacherId && params.teacherId !== 'ALL') {
      values.push(params.teacherId);
      slotQuery += ` AND s.staff_id = $${values.length}`;
    }

    slotQuery += ` ORDER BY s.teacher_name ASC, s.slot_time ASC`;

    const slotsRes = await client.query(slotQuery, values);
    const slots = slotsRes.rows.map((s: any) => ({
      ...s,
      created_at: safeDateStr(s.created_at)
    }));

    const totalSlots = slots.length;
    const bookedSlots = slots.filter((s: any) => s.booking_status === 'BOOKED' || s.booking_status === 'COMPLETED').length;
    const availableSlots = slots.filter((s: any) => s.booking_status === 'AVAILABLE').length;
    const bookingRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    const counts = {
      totalSlots,
      bookedSlots,
      availableSlots,
      bookingRate
    };

    return {
      success: true,
      currentEvent: events.find((e: any) => e.id === currentEventId) || events[0],
      events,
      slots,
      counts
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      events: [],
      slots: [],
      counts: { totalSlots: 0, bookedSlots: 0, availableSlots: 0, bookingRate: 0 }
    };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. BOOK PTM SLOT
// -------------------------------------------------------------
export async function bookPtmSlotAction(params: {
  slotId: string;
  studentAdmissionNoOrName: string;
  parentName: string;
  parentPhone: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { slotId, studentAdmissionNoOrName, parentName, parentPhone } = params;

    // Lookup Student
    const stuRes = await client.query(`
      SELECT s.id, s.first_name, s.last_name, s.admission_no,
             COALESCE(c.grade, 'Class 1') as class_name
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE s.admission_no ILIKE $1 OR (s.first_name || ' ' || s.last_name) ILIKE $1
      LIMIT 1
    `, [studentAdmissionNoOrName]);

    if (stuRes.rows.length === 0) {
      return { success: false, error: `Student "${studentAdmissionNoOrName}" not found.` };
    }

    const stu = stuRes.rows[0];

    await client.query(`
      UPDATE public.ptm_teacher_slots
      SET student_id = $1,
          student_name = $2,
          parent_name = $3,
          parent_phone = $4,
          booking_status = 'BOOKED'
      WHERE id = $5
    `, [
      stu.id,
      `${stu.first_name} ${stu.last_name} (${stu.class_name})`,
      parentName,
      parentPhone,
      slotId
    ]);

    safeRevalidate('/admin/ptm');

    return {
      success: true,
      message: `✓ PTM slot successfully confirmed for ${stu.first_name} with parent ${parentName}!`
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. RECORD CONSULTATION NOTES & REMEDIAL ACTIONS
// -------------------------------------------------------------
export async function recordPtmConsultationNotesAction(params: {
  slotId: string;
  discussionNotes: string;
  followUpAction?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { slotId, discussionNotes, followUpAction = 'Follow-up via Parent Portal' } = params;

    await client.query(`
      UPDATE public.ptm_teacher_slots
      SET discussion_notes = $1,
          follow_up_action = $2,
          booking_status = 'COMPLETED'
      WHERE id = $3
    `, [discussionNotes, followUpAction, slotId]);

    safeRevalidate('/admin/ptm');

    return {
      success: true,
      message: `✓ Consultation notes recorded and consultation marked as COMPLETED!`
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
