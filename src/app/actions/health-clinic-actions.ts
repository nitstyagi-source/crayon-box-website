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

export interface InfirmaryVisit {
  id: string;
  student_name: string;
  class_name: string;
  parent_phone: string;
  symptoms: string;
  body_temperature_f: number;
  treatment_given: string;
  medicine_administered?: string;
  nurse_name: string;
  action_status: string;
  visited_at: string;
}

// -------------------------------------------------------------
// 1. LOG INFIRMARY VISIT & DISPATCH WHATSAPP ALERT
// -------------------------------------------------------------
export async function logInfirmaryVisitAction(params: {
  studentName: string;
  className: string;
  parentPhone: string;
  symptoms: string;
  bodyTemperatureF?: number;
  treatmentGiven: string;
  medicineAdministered?: string;
  actionStatus: "RESTING_IN_CLINIC" | "SENT_BACK_TO_CLASS" | "SENT_HOME";
  nurseName?: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const temp = params.bodyTemperatureF || 98.6;
    const nurse = params.nurseName || "Nurse Mary (RN)";

    const res = await client.query(`
      INSERT INTO public.infirmary_visit_logs (
        student_name, class_name, parent_phone, symptoms, body_temperature_f,
        treatment_given, medicine_administered, action_status, nurse_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `, [
      params.studentName, params.className, params.parentPhone,
      params.symptoms, temp, params.treatmentGiven,
      params.medicineAdministered || 'None', params.actionStatus, nurse
    ]);

    const visit = res.rows[0];

    // Dispatch WhatsApp Medical Notice to Parent
    const msgContent = `🏥 *Crayon Box School — Infirmary Medical Care Notice*\n\nDear Parent, your ward *${params.studentName}* (${params.className}) visited the school health clinic today:\n\n• *Time*: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n• *Symptoms Reported*: ${params.symptoms}\n• *Temperature*: ${temp}°F\n• *Treatment / Care*: ${params.treatmentGiven}\n• *Medicine Administered*: ${params.medicineAdministered || 'None'}\n• *Status*: ${params.actionStatus.replace(/_/g, ' ')}\n• *Attended by*: ${nurse}\n\n_Your child is being monitored with utmost care._\n_Health Clinic & Infirmary, Crayon Box School_`;

    await client.query(`
      INSERT INTO public.whatsapp_messages (
        campus_id, student_id, student_name, parent_phone, message_type,
        template_name, content, status, dispatched_at
      ) VALUES ('default', NULL, $1, $2, 'HEALTH_ALERT', 'infirmary_visit_notice', $3, 'DELIVERED', NOW());
    `, [params.studentName, params.parentPhone, msgContent]);

    safeRevalidate('/admin/health/clinic');

    return {
      success: true,
      visit,
      message: `✓ Medical visit logged and WhatsApp alert dispatched to parent (${params.parentPhone})!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. GET RECENT INFIRMARY VISITS
// -------------------------------------------------------------
export async function getRecentInfirmaryVisitsAction() {
  const p = getPool();
  const client = await p.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.infirmary_visit_logs 
      ORDER BY visited_at DESC 
      LIMIT 50;
    `);

    const visits = res.rows.map((v: any) => ({
      ...v,
      body_temperature_f: Number(v.body_temperature_f)
    }));

    const stats = {
      totalToday: visits.length,
      restingInClinic: visits.filter((v: any) => v.action_status === 'RESTING_IN_CLINIC').length,
      sentHome: visits.filter((v: any) => v.action_status === 'SENT_HOME').length,
      backToClass: visits.filter((v: any) => v.action_status === 'SENT_BACK_TO_CLASS').length
    };

    return { success: true, visits: visits as InfirmaryVisit[], stats };
  } catch (e: any) {
    return { success: false, error: e.message, visits: [], stats: { totalToday: 0, restingInClinic: 0, sentHome: 0, backToClass: 0 } };
  } finally {
    client.release();
  }
}
