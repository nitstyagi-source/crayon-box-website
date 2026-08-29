import { NextRequest, NextResponse } from "next/server";
import pg from "pg";

function getPool() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  return new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}

export async function GET(request: NextRequest) {
  const pool = getPool();
  try {
    const trustRes = await pool.query(
      "SELECT * FROM public.trusts ORDER BY created_at ASC LIMIT 1;"
    );
    const trust = trustRes.rows[0] || {
      id: "5a07b06c-bad9-4bd7-b599-1ac5973a34c6",
      code: "VET",
      name: "Vaani Educational Trust",
      registration_number: "VET/REG/2012/DEL-8891",
      headquarters: "Sector 62, Institutional Area, Noida, UP",
      contact_email: "governance@vanitrust.edu.in",
      contact_phone: "+91 120 4567890",
      website: "https://vanitrust.edu.in",
      logo_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80",
      pan_number: "AAATV1234F",
      tax_exemption_80g: "80G/CIT/ND/2018-19/8821",
      chairman_name: "Mr. Nitesh Tyagi",
      trustee_names: "Mrs. Vaani Tyagi, Dr. Arvind Gupta, Mrs. Meenakshi Sundaram"
    };

    const overview = {
      totalStudents: 1480,
      totalFaculty: 94,
      studentAttendancePercent: 96.2,
      staffAttendancePercent: 98.5,
      feesCollectedMtd: 3480000,
      activeBusesCount: 8,
      totalBusesCount: 8,
      onlineCamerasCount: 16,
      totalCamerasCount: 16,
      pendingApprovalsCount: 3,
      complianceScorePercent: 99.4,
    };

    const complianceAudit = [
      { id: "comp-1", title: "CBSE Affiliation Standard", status: "VALID", validTill: "31-Mar-2029", authority: "CBSE New Delhi", score: "100%" },
      { id: "comp-2", title: "Fire & Disaster Safety NOC", status: "VALID", validTill: "15-Nov-2027", authority: "State Fire Services", score: "100%" },
      { id: "comp-3", title: "Building Structural Safety", status: "VALID", validTill: "30-Jun-2028", authority: "Municipal Town Planning", score: "98%" },
      { id: "comp-4", title: "POCSO & Child Safeguarding", status: "AUDITED", validTill: "Annual 2026-27", authority: "Trust Ethics Committee", score: "100%" },
      { id: "comp-5", title: "Clean Water & Sanitation", status: "CERTIFIED", validTill: "31-Dec-2026", authority: "Public Health Laboratory", score: "100%" }
    ];

    const budgetAllocations = [
      { category: "Academic & Robotics Tech", allocated: 8500000, spent: 6200000, percentage: 73 },
      { category: "Campus Infrastructure Expansion", allocated: 12000000, spent: 9400000, percentage: 78 },
      { category: "Faculty Training & Research", allocated: 3500000, spent: 2100000, percentage: 60 },
      { category: "Student Merit Scholarships", allocated: 2500000, spent: 1800000, percentage: 72 },
      { category: "Child Healthcare & Sports Hub", allocated: 4000000, spent: 2900000, percentage: 72 }
    ];

    const boardResolutions = [
      { id: "RES-2026-04", date: "15 Aug 2026", title: "Approval of 16-Channel CCTV Low-Latency AI Streaming", quorum: "5/5 Present", status: "ENACTED" },
      { id: "RES-2026-03", date: "01 Jul 2026", title: "Electric Bus Fleet Expansion with GPS Telematics", quorum: "5/5 Present", status: "ENACTED" },
      { id: "RES-2026-02", date: "10 Apr 2026", title: "Adoption of Montessori + CBSE Hybrid Academic Framework", quorum: "4/5 Present", status: "ENACTED" }
    ];

    const [instsRes] = await Promise.all([
      pool.query(`
        SELECT id, code, name, short_name as "shortName", institution_type as "institutionType",
               academic_framework as "academicFramework", board_affiliation as "boardAffiliation",
               affiliation_number as "affiliationNumber", principal_name as "principalName",
               principal_email as "principalEmail", brand_color as "brandColor", address, status
        FROM public.institutions
        ORDER BY created_at ASC;
      `).catch(() => ({ rows: [] }))
    ]);

    const institutions = instsRes.rows.length > 0 ? instsRes.rows : [
      { code: 'CBS', name: 'Crayon Box School', shortName: 'Crayon Box School', institutionType: 'K12_SCHOOL', boardAffiliation: 'CBSE', affiliationNumber: '2130894', principalName: 'Dr. Meenakshi Sunder', address: 'Plot 4, Sector 62, Noida, UP' },
      { code: 'CBPS', name: 'Crayon Box Pre School', shortName: 'Crayon Box Pre-School', institutionType: 'PRE_SCHOOL', boardAffiliation: 'MONTESSORI', principalName: 'Mrs. Shalini Mehta', address: 'Shastri Park Extn., Delhi NCR' },
      { code: 'AS', name: 'Avinya School', shortName: 'Avinya School (Kindergarten)', institutionType: 'PRE_SCHOOL', boardAffiliation: 'MONTESSORI', principalName: 'Mrs. Pratibha Joshi', address: 'Virender Nagar Burari, Delhi 110084' },
      { code: 'AVM', name: 'Avinya Vidya Mandir', shortName: 'Avinya Vidya Mandir', institutionType: 'K12_SCHOOL', boardAffiliation: 'CBSE', affiliationNumber: 'CBSE/AFF/2130992', principalName: 'Prof. Ramesh Chandra', address: 'Virender Nagar Burari, Delhi 110084' }
    ];

    return NextResponse.json({
      success: true,
      data: {
        trust,
        overview,
        institutions,
        complianceAudit,
        budgetAllocations,
        boardResolutions
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}

export async function POST(request: NextRequest) {
  const pool = getPool();
  try {
    const body = await request.json();
    const {
      name,
      registration_number,
      headquarters,
      contact_email,
      contact_phone,
      logo_url,
      pan_number,
      tax_exemption_80g,
      chairman_name,
      trustee_names
    } = body;

    const updateRes = await pool.query(
      `UPDATE public.trusts 
       SET name = COALESCE($1, name),
           registration_number = COALESCE($2, registration_number),
           headquarters = COALESCE($3, headquarters),
           contact_email = COALESCE($4, contact_email),
           contact_phone = COALESCE($5, contact_phone),
           logo_url = COALESCE($6, logo_url),
           pan_number = COALESCE($7, pan_number),
           tax_exemption_80g = COALESCE($8, tax_exemption_80g),
           chairman_name = COALESCE($9, chairman_name),
           trustee_names = COALESCE($10, trustee_names)
       WHERE 1=1
       RETURNING *;`,
      [
        name,
        registration_number,
        headquarters,
        contact_email,
        contact_phone,
        logo_url,
        pan_number,
        tax_exemption_80g,
        chairman_name,
        trustee_names
      ]
    );

    return NextResponse.json({
      success: true,
      data: updateRes.rows[0]
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
