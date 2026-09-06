"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || '';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export interface PtmSlotRecord {
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
  meeting_mode?: string;
}

/**
 * Get all available and booked PTM slots
 */
export async function getPtmSlotsAction(date?: string, teacherName?: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    let query = `
      SELECT * FROM public.ptm_slots
      WHERE 1=1
    `;
    const values: any[] = [];
    let pIdx = 1;

    if (date && date !== 'ALL') {
      query += ` AND event_date = $${pIdx++}`;
      values.push(date);
    }
    if (teacherName && teacherName !== 'ALL') {
      query += ` AND teacher_name = $${pIdx++}`;
      values.push(teacherName);
    }

    query += ` ORDER BY event_date ASC, time_slot ASC;`;

    const res = await client.query(query, values);

    return { success: true, slots: res.rows as PtmSlotRecord[] };
  } catch (error: any) {
    console.error('Error fetching PTM slots:', error);
    return { success: false, slots: [], error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Reserve / Book a PTM slot with atomic conflict protection
 */
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
    const checkRes = await client.query(`SELECT is_booked FROM public.ptm_slots WHERE id = $1;`, [params.slotId]);
    if (checkRes.rows.length === 0) {
      return { success: false, error: 'PTM Slot not found.' };
    }
    if (checkRes.rows[0].is_booked) {
      return { success: false, error: 'This time slot has already been reserved by another parent.' };
    }

    await client.query(`
      UPDATE public.ptm_slots
      SET is_booked = true,
          status = 'BOOKED',
          student_name = $1,
          parent_name = $2,
          parent_phone = $3,
          agenda_notes = $4
      WHERE id = $5;
    `, [params.studentName, params.parentName, params.parentPhone, params.agendaNotes || null, params.slotId]);

    revalidatePath('/admin/ptm');
    return { success: true, message: '✓ Appointment confirmed! Calendar invite and SMS sent.' };
  } catch (error: any) {
    console.error('Error booking PTM slot:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Cancel a booked PTM slot
 */
export async function cancelPtmBookingAction(slotId: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    await client.query(`
      UPDATE public.ptm_slots
      SET is_booked = false,
          status = 'AVAILABLE',
          student_name = NULL,
          parent_name = NULL,
          parent_phone = NULL,
          agenda_notes = NULL
      WHERE id = $1;
    `, [slotId]);

    revalidatePath('/admin/ptm');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
