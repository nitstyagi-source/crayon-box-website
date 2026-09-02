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

export interface AiInquiryRecord {
  id: string;
  parent_name: string;
  parent_phone: string;
  target_grade: string;
  user_query: string;
  ai_response: string;
  inquiry_intent: string;
  lead_status: string;
  created_at: string;
}

// -------------------------------------------------------------
// 1. ASK 24/7 AI ADMISSIONS RECEPTIONIST BOT
// -------------------------------------------------------------
export async function askAdmissionsAiBotAction(params: {
  userQuery: string;
  parentName?: string;
  parentPhone?: string;
  targetGrade?: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const query = params.userQuery.toLowerCase();
    const parentName = params.parentName || "Valued Parent";
    const phone = params.parentPhone || "+919876500000";
    const grade = params.targetGrade || "Nursery";

    let aiResponse = "";
    let intent = "GENERAL_INQUIRY";

    if (query.includes("fee") || query.includes("fees") || query.includes("cost") || query.includes("charge") || query.includes("fees structure")) {
      intent = "FEE_STRUCTURE";
      aiResponse = `Namaste ${parentName}! For Academic Session 2026–2027, our fee structure is highly transparent with zero hidden charges:\n\n• **Quarterly Tuition Fee**: ₹13,500 / Quarter (₹4,500/month)\n• **Annual Activity & Digital LMS Fee**: ₹6,000 / year\n• **Sibling Concession**: 10% discount for the 2nd child\n• **Payment Modes**: 1-Click UPI, Net Banking, or Card via our Parent Portal.\n\nWould you like us to send the complete detailed fee breakdown PDF to your WhatsApp?`;
    } else if (query.includes("age") || query.includes("eligibility") || query.includes("criteria") || query.includes("class 1") || query.includes("nursery")) {
      intent = "AGE_ELIGIBILITY";
      aiResponse = `For admission in Session 2026–2027, the NEP 2020 age eligibility criteria as of 31st March 2026 are:\n\n• **Nursery**: 3+ years\n• **LKG**: 4+ years\n• **UKG**: 5+ years\n• **Class 1**: 6+ years\n\nAdmissions are granted on a first-come, first-served basis following document verification.`;
    } else if (query.includes("bus") || query.includes("transport") || query.includes("route") || query.includes("burari") || query.includes("sant nagar")) {
      intent = "TRANSPORT_FACILITY";
      aiResponse = `Yes! We provide safe GPS-tracked AC school bus transport with female attendants and live 500m parent proximity tracking across Delhi:\n\n• **Key Routes**: Burari Main, Sant Nagar Chowk, Kamalpur, Milan Vihar, Nathupura, Shastri Park, and Jahangirpuri.\n• **Safety**: Real-time GPS tracking on parent mobile app + CCTV surveillance inside all buses.`;
    } else if (query.includes("timing") || query.includes("hours") || query.includes("schedule") || query.includes("time")) {
      intent = "SCHOOL_TIMINGS";
      aiResponse = `Our regular school timings are:\n\n• **Pre-Primary (Nursery, LKG, UKG)**: 09:00 AM – 12:30 PM (Mon–Fri)\n• **Primary & Middle School (Class 1 to 10)**: 08:30 AM – 03:00 PM (Mon–Sat)\n• **Second Saturdays**: Academic Activity & PTM day.`;
    } else if (query.includes("document") || query.includes("require") || query.includes("form") || query.includes("birth certificate")) {
      intent = "DOCUMENTATION_CHECKLIST";
      aiResponse = `Here is the required document checklist for admission:\n\n1. Municipal Birth Certificate of the child\n2. 4 Passport-size photographs of the student\n3. 2 Photographs of each parent/guardian\n4. Address proof (Aadhaar Card / Voter ID / Electricity Bill)\n5. Transfer Certificate (TC) & previous report card (for Class 2 onwards)\n6. Immunization / Vaccination medical record.`;
    } else {
      intent = "PROSPECTUS_AND_VISIT";
      aiResponse = `Thank you for your interest in Crayon Box School! We are a premier educational institution focused on experiential learning, robotics labs, smart classrooms, and 360° NEP holistic development.\n\nOur Admissions Desk is open from **08:30 AM to 04:00 PM (Monday to Saturday)**. We cordially invite you for a campus tour with our Principal & Academic Coordinators.`;
    }

    // Record inquiry to database
    await client.query(`
      INSERT INTO public.ai_admission_inquiries (
        parent_name, parent_phone, target_grade, user_query,
        ai_response, inquiry_intent, lead_status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'HOT_LEAD');
    `, [parentName, phone, grade, params.userQuery, aiResponse, intent]);

    safeRevalidate('/admin/admissions/ai-bot');

    return {
      success: true,
      aiResponse,
      intent,
      message: "AI Admissions response generated & lead captured in CRM!"
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. GET RECENT AI ADMISSIONS INQUIRIES
// -------------------------------------------------------------
export async function getAdmissionsAiInquiriesAction() {
  const p = getPool();
  const client = await p.connect();

  try {
    const res = await client.query(`
      SELECT * FROM public.ai_admission_inquiries ORDER BY created_at DESC LIMIT 50;
    `);
    return { success: true, inquiries: res.rows as AiInquiryRecord[] };
  } catch (e: any) {
    return { success: false, error: e.message, inquiries: [] };
  } finally {
    client.release();
  }
}
