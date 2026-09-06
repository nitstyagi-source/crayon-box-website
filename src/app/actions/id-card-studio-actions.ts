"use server";

import pg from 'pg';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || '';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
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
  address?: string;
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
             COALESCE(s.father_name, 'Parent/Guardian') as father_name,
             COALESCE(s.mother_name, 'Parent/Guardian') as mother_name,
             COALESCE(s.parent_phone, s.primary_contact, 'N/A') as contact_phone,
             COALESCE(s.blood_group, 'O+') as blood_group,
             COALESCE(s.transport_route, s.transport_bus_no, 'Own Transport') as transport_info,
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
      studentName: `${r.first_name} ${r.last_name}`.trim(),
      className: r.grade || cls,
      sectionName: r.section || "A",
      fatherName: r.father_name,
      motherName: r.mother_name,
      bloodGroup: r.blood_group,
      emergencyPhone: r.contact_phone,
      busRoute: r.transport_info,
      dob: r.date_of_birth ? new Date(r.date_of_birth).toLocaleDateString('en-IN') : "N/A",
      validUpto: "31-03-2027"
    }));

    return { success: true, cards };
  } catch (e: any) {
    return { success: false, error: e.message, cards: [] };
  } finally {
    client.release();
  }
}
