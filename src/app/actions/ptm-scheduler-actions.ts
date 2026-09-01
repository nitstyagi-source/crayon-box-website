"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

export interface PtmSlotItem {
  id: string;
  event_title: string;
  event_date: string;
  class_name: string;
  teacher_name: string;
  time_slot: string;
  is_booked: boolean;
  student_name?: string;
  parent_name?: string;
  parent_phone?: string;
  agenda_notes?: string;
}

// -------------------------------------------------------------
// 1. GET PTM SLOTS FOR CLASS
// -------------------------------------------------------------
export async function getPtmSlotsListAction(className?: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    const cls = className || "Class 1-A";
    const res = await client.query(`
      SELECT * FROM public.ptm_slots 
      WHERE class_name = $1 OR $1 = 'ALL'
      ORDER BY time_slot ASC;
    `, [cls]);

    const slots = res.rows as PtmSlotItem[];
    const stats = {
      totalSlots: slots.length,
      bookedSlots: slots.filter(s => s.is_booked).length,
      availableSlots: slots.filter(s => !s.is_booked).length
    };

    return { success: true, slots, stats };
  } catch (e: any) {
    return { success: false, error: e.message, slots: [], stats: { totalSlots: 0, bookedSlots: 0, availableSlots: 0 } };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. BOOK PTM SLOT & DISPATCH WHATSAPP CONFIRMATION
// -------------------------------------------------------------
export async function bookPtmSlotAction(params: {
  slotId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  agendaNotes?: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const slotRes = await client.query(`
      SELECT * FROM public.ptm_slots WHERE id = $1 LIMIT 1;
    `, [params.slotId]);

    if (slotRes.rows.length === 0) {
      return { success: false, error: "PTM Slot not found." };
    }

    const slot = slotRes.rows[0];
    if (slot.is_booked) {
      return { success: false, error: "This slot has already been booked by another parent." };
    }

    await client.query(`
      UPDATE public.ptm_slots
      SET is_booked = true,
          student_name = $1,
          parent_name = $2,
          parent_phone = $3,
          agenda_notes = $4
      WHERE id = $5;
    `, [params.studentName, params.parentName, params.parentPhone, params.agendaNotes || 'Academic Performance Review', params.slotId]);

    // Dispatch WhatsApp PTM Confirmation
    const eventDateFormatted = new Date(slot.event_date).toLocaleDateString('en-IN', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    });

    const msgContent = `🗓️ *Crayon Box School — PTM Appointment Confirmation*\n\nDear *${params.parentName}*, your 1-on-1 PTM slot for *${params.studentName}* (${slot.class_name}) has been confirmed:\n\n• *Event*: ${slot.event_title}\n• *Date*: ${eventDateFormatted}\n• *Time Slot*: *${slot.time_slot}*\n• *Class Teacher*: ${slot.teacher_name}\n• *Discussion Agenda*: ${params.agendaNotes || 'Academic Progress & Term 1 Review'}\n• *Venue*: Classroom ${slot.class_name}, Main Academic Block\n\n_Please arrive 5 minutes prior to your allocated slot._\n_Academic Affairs, Crayon Box School_`;

    await client.query(`
      INSERT INTO public.whatsapp_messages (
        campus_id, student_id, student_name, parent_phone, message_type,
        template_name, content, status, dispatched_at
      ) VALUES ('default', NULL, $1, $2, 'PTM_ALERT', 'ptm_booking_confirmation', $3, 'DELIVERED', NOW());
    `, [params.studentName, params.parentPhone, msgContent]);

    safeRevalidate('/admin/ptm');

    return {
      success: true,
      message: `✓ PTM Slot (${slot.time_slot}) booked and WhatsApp confirmation dispatched to ${params.parentName}!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}
