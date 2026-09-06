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

function safeRevalidate(path: string) {
  try { revalidatePath(path); } catch {}
}

/**
 * 1. GET DYNAMIC SEAT INVENTORY MATRIX
 */
export async function getSeatInventoryMatrixAction(session?: string) {
  const currentSession = session || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  const p = getPool();
  const client = await p.connect();
  try {
    const { rows } = await client.query(`
      SELECT * FROM public.seat_inventory_matrices
      WHERE academic_session = $1
      ORDER BY class_name ASC, quota_type ASC
    `, [currentSession]);

    const mapped = rows.map((r: any) => {
      const remaining = Math.max(0, r.total_seats - r.admitted_seats);
      const fillRate = r.total_seats > 0 ? Math.round((r.admitted_seats / r.total_seats) * 100) : 100;
      return {
        id: r.id,
        className: r.class_name,
        academicSession: r.academic_session,
        quotaType: r.quota_type,
        totalSeats: r.total_seats,
        admittedSeats: r.admitted_seats,
        availableSeats: remaining,
        waitlistedCount: r.waitlisted_count,
        fillRatePercentage: Math.min(100, fillRate),
        status: remaining === 0 ? 'WAITLIST_ONLY' : fillRate >= 85 ? 'FAST_FILLING' : 'OPEN'
      };
    });

    const totalSeatsConsolidated = mapped.reduce((a: number, b: any) => a + b.totalSeats, 0);
    const totalAdmittedConsolidated = mapped.reduce((a: number, b: any) => a + b.admittedSeats, 0);
    const totalWaitlistedConsolidated = mapped.reduce((a: number, b: any) => a + b.waitlistedCount, 0);

    return {
      success: true,
      totalSeats: totalSeatsConsolidated,
      totalAdmitted: totalAdmittedConsolidated,
      totalWaitlisted: totalWaitlistedConsolidated,
      overallFillRate: totalSeatsConsolidated > 0 ? Math.round((totalAdmittedConsolidated / totalSeatsConsolidated) * 100) : 0,
      matrices: mapped
    };
  } catch (err: any) {
    return { success: false, error: err.message, matrices: [] };
  } finally {
    client.release();
  }
}

/**
 * 2. LIVE CHECK SEAT AVAILABILITY DURING APPLICATION INTAKE
 */
export async function checkSeatAvailabilityAndReserveAction(className: string, quotaType: string = 'GENERAL', session?: string) {
  const currentSession = session || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  const p = getPool();
  const client = await p.connect();
  try {
    const { rows } = await client.query(`
      SELECT * FROM public.seat_inventory_matrices
      WHERE class_name = $1 AND quota_type = $2 AND academic_session = $3
      FOR UPDATE
    `, [className, quotaType, currentSession]);

    if (rows.length === 0) {
      return { success: true, isWaitlisted: false, message: 'Seats open' };
    }

    const m = rows[0];
    const remaining = m.total_seats - m.admitted_seats;

    if (remaining <= 0) {
      // Seat quota full! Auto increment waitlist
      const newWaitlist = m.waitlisted_count + 1;
      await client.query(`
        UPDATE public.seat_inventory_matrices
        SET waitlisted_count = $1, status = 'WAITLIST_ONLY', updated_at = NOW()
        WHERE id = $2
      `, [newWaitlist, m.id]);

      safeRevalidate('/admin/admissions');

      return {
        success: true,
        isWaitlisted: true,
        waitlistPosition: newWaitlist,
        message: `Quota full for ${className} (${quotaType}). Application tagged as WAITLISTED #${newWaitlist}.`
      };
    }

    return {
      success: true,
      isWaitlisted: false,
      remainingSeats: remaining,
      message: `${remaining} seats remaining in ${className} (${quotaType}).`
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}
