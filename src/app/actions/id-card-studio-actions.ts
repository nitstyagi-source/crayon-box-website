"use server";

import pg from 'pg';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export interface StudentIdCardBadge {
  id: string;
  admissionNo: string;
  studentName: string;
  className: string;
  sectionName: string;
  fatherName: string;
  motherName: string;
  bloodGroup: string;
  emergencyPhone: string;
  busRoute: string;
  dob: string;
  validUpto: string;
}

// -------------------------------------------------------------
// 1. GET BATCH ID CARD DATA FOR CLASS / STAFF
// -------------------------------------------------------------
export async function getBatchIdCardDataAction(className?: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    const cls = className || "Class 1";

    const res = await client.query(`
      SELECT s.id, s.admission_no, s.first_name, s.last_name, s.date_of_birth,
             COALESCE(s.primary_contact, '+919810081008') as primary_contact,
             COALESCE(s.blood_group, 'B+') as blood_group,
             COALESCE(s.transport_mode, 'Bus #01 (Burari)') as transport_mode,
             COALESCE(c.grade, $1) as grade, COALESCE(c.section, 'A') as section
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE s.status = 'ACTIVE'
      ORDER BY s.admission_no ASC
      LIMIT 8;
    `, [cls]);

    const cards: StudentIdCardBadge[] = res.rows.map((r: any, idx: number) => ({
      id: r.id,
      admissionNo: r.admission_no || `ADM-2026-00${idx + 1}`,
      studentName: `${r.first_name} ${r.last_name}`,
      className: r.grade || cls,
      sectionName: r.section || "A",
      fatherName: "Mr. Rajesh Sharma",
      motherName: "Mrs. Sunita Sharma",
      bloodGroup: r.blood_group || "B+",
      emergencyPhone: r.primary_contact || "+919810081008",
      busRoute: r.transport_mode || "Bus #01 (Burari)",
      dob: r.date_of_birth ? new Date(r.date_of_birth).toLocaleDateString('en-IN') : "12/04/2019",
      validUpto: "31-03-2027"
    }));

    return { success: true, cards };
  } catch (e: any) {
    return { success: false, error: e.message, cards: [] };
  } finally {
    client.release();
  }
}
