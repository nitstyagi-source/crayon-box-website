"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  return pool;
}

function safeRevalidate(path: string) {
  try { revalidatePath(path); } catch {}
}

/**
 * 1. GET AVAILABLE ASSESSMENT INTERVIEW SLOTS (OPENAPPLY STYLE)
 */
export async function getAvailableAssessmentSlotsAction(params?: { date?: string }) {
  const p = getPool();
  const client = await p.connect();
  try {
    const { rows: slots } = await client.query(`
      SELECT s.*, 
        (s.max_capacity - s.booked_count) as available_seats
      FROM public.admissions_interview_slots s
      WHERE ($1::date IS NULL OR s.slot_date = $1::date)
        AND s.status = 'AVAILABLE'
      ORDER BY s.slot_date ASC, s.start_time ASC
      LIMIT 15
    `, [params?.date || null]);

    return {
      success: true,
      slots: slots.map((s: any) => ({
        id: s.id,
        slotDate: s.slot_date instanceof Date ? s.slot_date.toISOString().split('T')[0] : s.slot_date,
        startTime: s.start_time,
        endTime: s.end_time,
        interviewerName: s.interviewer_name,
        interviewerRole: s.interviewer_role,
        roomLocation: s.room_location,
        maxCapacity: s.max_capacity,
        bookedCount: s.booked_count,
        availableSeats: Math.max(0, parseInt(s.available_seats, 10) || 0),
        status: s.booked_count >= s.max_capacity ? 'FULL' : 'AVAILABLE'
      }))
    };
  } catch (err: any) {
    return { success: false, error: err.message, slots: [] };
  } finally {
    client.release();
  }
}

/**
 * 2. SELF-SERVICE PARENT ASSESSMENT BOOKING CONFIRMATION
 */
export async function bookAssessmentSlotAction(payload: {
  applicationId?: string;
  applicationNo: string;
  slotId: string;
  candidateName: string;
  classApplied: string;
  parentPhone: string;
  parentEmail?: string;
}) {
  const p = getPool();
  const client = await p.connect();
  try {
    // 1. Verify slot capacity
    const { rows: slots } = await client.query(`
      SELECT * FROM public.admissions_interview_slots WHERE id = $1 FOR UPDATE
    `, [payload.slotId]);

    if (slots.length === 0) return { success: false, error: 'Interview slot not found' };
    const slot = slots[0];

    if (slot.booked_count >= slot.max_capacity) {
      return { success: false, error: 'Selected slot is already at maximum capacity. Please pick an alternative time.' };
    }

    // 2. Insert booking record
    const { rows: booking } = await client.query(`
      INSERT INTO public.admissions_assessments (
        application_id, application_no, slot_id, candidate_name,
        class_applied, parent_phone, parent_email, booking_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 'CONFIRMED'
      ) RETURNING id;
    `, [
      payload.applicationId || null,
      payload.applicationNo,
      payload.slotId,
      payload.candidateName,
      payload.classApplied,
      payload.parentPhone,
      payload.parentEmail || null
    ]);

    // 3. Increment slot booked count
    const newBooked = slot.booked_count + 1;
    await client.query(`
      UPDATE public.admissions_interview_slots
      SET booked_count = $1, status = CASE WHEN $1 >= max_capacity THEN 'FULL' ELSE 'AVAILABLE' END
      WHERE id = $2
    `, [newBooked, payload.slotId]);

    // 4. Update application status to ASSESSMENT_SCHEDULED
    await client.query(`
      UPDATE public.admission_applications
      SET status = 'ASSESSMENT_SCHEDULED'
      WHERE application_no = $1
    `, [payload.applicationNo]);

    safeRevalidate('/admin/admissions');
    safeRevalidate('/admissions/apply');

    return {
      success: true,
      bookingId: booking[0].id,
      applicationNo: payload.applicationNo,
      slotDate: slot.slot_date instanceof Date ? slot.slot_date.toISOString().split('T')[0] : slot.slot_date,
      startTime: slot.start_time,
      interviewer: slot.interviewer_name,
      location: slot.room_location
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

/**
 * 3. GET ASSESSMENTS LEDGER FOR ADMIN DESK
 */
export async function getAssessmentsListAction() {
  const p = getPool();
  const client = await p.connect();
  try {
    const { rows } = await client.query(`
      SELECT a.*, s.slot_date, s.start_time, s.end_time, s.interviewer_name, s.room_location
      FROM public.admissions_assessments a
      JOIN public.admissions_interview_slots s ON a.slot_id = s.id
      ORDER BY s.slot_date ASC, s.start_time ASC
    `);

    return {
      success: true,
      assessments: rows
    };
  } catch (err: any) {
    return { success: false, error: err.message, assessments: [] };
  } finally {
    client.release();
  }
}
