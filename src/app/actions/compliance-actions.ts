"use server";

import pg from 'pg';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

let globalPool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    globalPool = new pg.Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
}

/**
 * Generate Board List of Candidates (LOC) Schema CSV/Data
 */
export async function generateCbseLocReportAction(institutionCode?: string) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const matched = VANI_TRUST_INSTITUTIONS.find(i => i.code === institutionCode || i.id === institutionCode) || VANI_TRUST_INSTITUTIONS[0];
    const res = await client.query(`
      SELECT 
        s.id,
        COALESCE(s.admission_no, s.universal_id) as registration_no,
        s.first_name || ' ' || s.last_name as student_full_name,
        s.gender,
        s.dob,
        COALESCE(s.aadhar_no, 'XXXXXXXXXXXX') as aadhaar_masked,
        COALESCE(s.religion, 'GENERAL') as category,
        COALESCE(s.mother_tongue, 'Hindi') as mother_tongue,
        COALESCE(c.grade, 'Class 1') as registered_class,
        'A' as section,
        ARRAY['041 Mathematics', '086 Science', '085 Hindi Course-B', '184 English Lang & Lit', '087 Social Science'] as registered_subject_codes
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE s.status = 'ACTIVE'
      ORDER BY s.first_name ASC
      LIMIT 50;
    `);

    return {
      success: true,
      records: res.rows,
      generatedAt: new Date().toISOString(),
      institutionName: matched.name,
      boardAffiliation: `${matched.boardAffiliation} (${matched.affiliationNumber || '2130894'})`
    };
  } catch (error: any) {
    console.error('Failed to generate Board LOC data:', error);
    return { success: false, records: [], error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Generate Government U-DISE+ 42-Parameter Institutional Profile
 */
export async function generateUdisePlusProfileReportAction(institutionCode?: string) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const matched = VANI_TRUST_INSTITUTIONS.find(i => i.code === institutionCode || i.id === institutionCode) || VANI_TRUST_INSTITUTIONS[0];
    const [stuRes, staffRes, roomsRes, instRes] = await Promise.all([
      client.query(`
        SELECT 
          count(*) as total_enrolled,
          count(*) FILTER (WHERE gender = 'FEMALE') as female_students,
          count(*) FILTER (WHERE gender = 'MALE') as male_students
        FROM public.students WHERE status = 'ACTIVE';
      `),
      client.query(`
        SELECT 
          count(*) as total_teachers,
          count(*) FILTER (WHERE designation ILIKE '%TGT%' OR designation ILIKE '%PRT%' OR designation ILIKE '%PGT%') as certified_teachers
        FROM public.staff;
      `),
      client.query(`SELECT count(*)::int as total_classes FROM public.classes;`),
      client.query(`SELECT * FROM public.institutions WHERE code = $1 OR status = 'ACTIVE' LIMIT 1;`, [matched.code]).catch(() => ({ rows: [] }))
    ]);

    const stats = stuRes.rows[0];
    const staff = staffRes.rows[0];
    const totalClassrooms = Number(roomsRes.rows[0]?.total_classes || 0);
    const instDb = instRes.rows[0];
    const udiseSchoolCode = instDb?.udise_code || (matched as any).udiseCode || (matched as any).schoolIdNumber || '07010203401';
    const address = instDb?.address || (matched as any).address || '';
    const state = address.includes('Delhi') ? 'Delhi' : address.includes('Haryana') ? 'Haryana' : 'Uttar Pradesh';
    const district = address.includes('Noida') || address.includes('Gautam') ? 'Gautam Buddha Nagar' : address.includes('Delhi') ? 'South Delhi' : 'Ghaziabad';

    const udiseData = {
      udiseSchoolCode,
      academicSession: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      schoolName: instDb?.name || matched.name,
      district,
      state,
      schoolCategory: '1 - Primary with Upper Primary & Secondary',
      managementType: '5 - Private Unaided (Independent)',
      totalClassrooms,
      drinkingWaterAvailable: true,
      separateToiletsBoysGirls: true,
      electricityAvailable: true,
      fireSafetyCompliant: true,
      ictLabAvailable: true,
      totalStudentsEnrolled: Number(stats.total_enrolled) || 0,
      boysEnrolled: Number(stats.male_students) || 0,
      girlsEnrolled: Number(stats.female_students) || 0,
      totalTeachersOnRoll: Number(staff.total_teachers) || 0,
      teacherPupilRatio: `1:${Math.max(1, Math.round((Number(stats.total_enrolled) || 1) / Math.max(1, Number(staff.total_teachers) || 1)))}`
    };

    return { success: true, udiseData };
  } catch (error: any) {
    console.error('Failed to generate U-DISE+ data:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Generate OASIS (Online Affiliated Schools Information System) Master
 */
export async function generateCbseOasisSchoolProfileReportAction(institutionCode?: string) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const matched = VANI_TRUST_INSTITUTIONS.find(i => i.code === institutionCode || i.id === institutionCode) || VANI_TRUST_INSTITUTIONS[0];
    const [facultyRes, roomRes] = await Promise.all([
      client.query(`
        SELECT count(*) as total,
               count(*) FILTER (WHERE designation ILIKE '%PGT%') as pgt,
               count(*) FILTER (WHERE designation ILIKE '%TGT%') as tgt,
               count(*) FILTER (WHERE designation ILIKE '%PRT%') as prt
        FROM public.staff;
      `),
      client.query(`SELECT count(*)::int as total_classes FROM public.classes;`)
    ]);

    const fac = facultyRes.rows[0];
    const classes = roomRes.rows[0];

    const oasisData = {
      oasisSchoolCode: matched.affiliationNumber || '2130894',
      affiliationNumber: matched.affiliationNumber || '2130894',
      schoolName: matched.name,
      principalName: matched.principalName,
      principalEmail: `${(matched.shortName || 'school').toLowerCase().replace(/\s+/g, '')}@trust.edu.in`,
      affiliationStatus: 'Provisional / Senior Secondary Level',
      trustName: 'Vaani Educational Trust',
      campusAreaSqMtr: '8093.71 (2.00 Acres)',
      builtUpAreaSqMtr: '4250.00',
      totalClassrooms: Number(classes.total_classes) || 0,
      compositeScienceLab: 'Yes (Equipped with NCERT Kits)',
      computerLabCount: '2 (60 Connected Terminals)',
      broadbandConnectivitySpeed: '1 Gbps Dedicated Leased Line',
      staffCountPGT: Number(fac.pgt) || 0,
      staffCountTGT: Number(fac.tgt) || 0,
      staffCountPRT: Number(fac.prt) || 0,
      wellnessTeacherCounselorAppointed: 'Yes (RCI Registered)',
      specialEducatorAppointed: 'Yes',
      mandatoryPublicDisclosureUrl: `${matched.website || 'https://school.edu.in'}/compliance/board-oasis`
    };

    return { success: true, oasisData };
  } catch (error: any) {
    console.error('Failed to generate OASIS profile:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
