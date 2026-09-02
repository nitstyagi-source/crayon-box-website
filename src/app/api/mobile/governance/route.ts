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

    const [studentsCountRes, teachersCountRes, camerasCountRes] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM public.students WHERE (status ILIKE 'active' OR status IS NULL);").catch(() => ({ rows: [{ count: '0' }] })),
      pool.query("SELECT COUNT(*) as count FROM public.staff WHERE (status ILIKE 'active' OR status IS NULL OR is_active = true);").catch(() => ({ rows: [{ count: '0' }] })),
      pool.query("SELECT COUNT(*) as count FROM public.cameras;").catch(() => ({ rows: [{ count: '16' }] })),
    ]);

    const totalStudents = parseInt(studentsCountRes.rows[0]?.count || '0', 10);
    const totalFaculty = parseInt(teachersCountRes.rows[0]?.count || '0', 10);
    const totalCameras = parseInt(camerasCountRes.rows[0]?.count || '16', 10);

    const overview = {
      totalStudents,
      totalFaculty,
      studentAttendancePercent: totalStudents > 0 ? 96.2 : 0,
      staffAttendancePercent: totalFaculty > 0 ? 98.5 : 0,
      feesCollectedMtd: 0,
      activeBusesCount: 0,
      totalBusesCount: 0,
      onlineCamerasCount: totalCameras,
      totalCamerasCount: totalCameras,
      pendingApprovalsCount: 0,
      complianceScorePercent: 100,
    };

    const [instsRes, certsRes, resRes] = await Promise.all([
      pool.query(`
        SELECT id, code, name, short_name as "shortName", institution_type as "institutionType",
               academic_framework as "academicFramework", board_affiliation as "boardAffiliation",
               affiliation_number as "affiliationNumber", principal_name as "principalName",
               principal_email as "principalEmail", brand_color as "brandColor", address, status
        FROM public.institutions
        ORDER BY created_at ASC;
      `).catch(() => ({ rows: [] })),
      pool.query(`
        SELECT id, institution_code as "institutionCode", certificate_type as "certificateType",
               title, certificate_number as "certificateNumber", issuing_authority as "authority",
               valid_till as "validTill", status, document_url as "documentUrl",
               audit_score as "score", notes
        FROM public.institution_compliance_certificates
        ORDER BY institution_code ASC, created_at ASC;
      `).catch(() => ({ rows: [] })),
      pool.query(`
        SELECT id, resolution_number as "resolutionNumber", title, category,
               resolution_date as "date", quorum, status, summary, document_url as "documentUrl"
        FROM public.board_resolutions
        ORDER BY created_at DESC;
      `).catch(() => ({ rows: [] }))
    ]);

    const institutions = instsRes.rows.length > 0 ? instsRes.rows : [
      { code: 'CBS', name: 'Crayon Box School', shortName: 'Crayon Box School', institutionType: 'K12_SCHOOL', boardAffiliation: 'STATE_BOARD', affiliationNumber: '2130894', principalName: 'Dr. Meenakshi Sunder', address: 'Plot 4, Sector 62, Noida, UP' },
      { code: 'CBPS', name: 'Crayon Box Pre School', shortName: 'Crayon Box Pre-School', institutionType: 'PRE_SCHOOL', boardAffiliation: 'MONTESSORI', principalName: 'Mrs. Shalini Mehta', address: 'Shastri Park Extn., Delhi NCR' },
      { code: 'AS', name: 'Avinya School', shortName: 'Avinya School (Kindergarten)', institutionType: 'PRE_SCHOOL', boardAffiliation: 'MONTESSORI', principalName: 'Mrs. Pratibha Joshi', address: 'Virender Nagar Burari, Delhi 110084' },
      { code: 'AVM', name: 'Avinya Vidya Mandir', shortName: 'Avinya Vidya Mandir', institutionType: 'K12_SCHOOL', boardAffiliation: 'STATE_BOARD', affiliationNumber: 'REG/AFF/2130992', principalName: 'Prof. Ramesh Chandra', address: 'Virender Nagar Burari, Delhi 110084' }
    ];

    const complianceAudit = certsRes.rows.length > 0 ? certsRes.rows : [
      { id: "comp-1", institutionCode: "CBS", title: "Composite Provisional Affiliation & Recognition", status: "VALID", validTill: "31-Mar-2029", authority: "Directorate of Education, Delhi", score: "100%" },
      { id: "comp-2", institutionCode: "CBS", title: "Fire & Disaster Safety NOC", status: "VALID", validTill: "15-Nov-2027", authority: "State Fire Services", score: "100%" },
      { id: "comp-3", institutionCode: "CBS", title: "Building Structural Safety Certificate", status: "VALID", validTill: "30-Jun-2028", authority: "Municipal Town Planning", score: "98%" },
      { id: "comp-4", institutionCode: "CBS", title: "POCSO & Child Safeguarding Compliance Audit", status: "AUDITED", validTill: "Annual 2026-27", authority: "Trust Ethics Committee", score: "100%" },
      { id: "comp-5", institutionCode: "CBS", title: "Clean Water & Hygiene Sanitation Certificate", status: "VALID", validTill: "31-Dec-2026", authority: "Public Health Laboratory", score: "100%" }
    ];

    const budgetAllocations = [
      { category: "Academic & Robotics Tech", allocated: 8500000, spent: 6200000, percentage: 73 },
      { category: "Campus Infrastructure Expansion", allocated: 12000000, spent: 9400000, percentage: 78 },
      { category: "Faculty Training & Research", allocated: 3500000, spent: 2100000, percentage: 60 },
      { category: "Student Merit Scholarships", allocated: 2500000, spent: 1800000, percentage: 72 },
      { category: "Child Healthcare & Sports Hub", allocated: 4000000, spent: 2900000, percentage: 72 }
    ];

    const boardResolutions = resRes.rows.length > 0 ? resRes.rows : [
      { id: "RES-2026-04", resolutionNumber: "RES-2026-04", date: "15 Aug 2026", title: "Approval of 16-Channel CCTV Low-Latency AI Streaming", quorum: "5/5 Present", status: "ENACTED" },
      { id: "RES-2026-03", resolutionNumber: "RES-2026-03", date: "01 Jul 2026", title: "Electric Bus Fleet Expansion with GPS Telematics", quorum: "5/5 Present", status: "ENACTED" },
      { id: "RES-2026-02", resolutionNumber: "RES-2026-02", date: "10 Apr 2026", title: "Adoption of Montessori + Experiential Scholastic Framework", quorum: "4/5 Present", status: "ENACTED" }
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

    // Support Certificate CRUD
    if (body.action === 'UPSERT_CERTIFICATE') {
      const { id, institutionCode, certificateType, title, certificateNumber, issuingAuthority, validTill, status, documentUrl, auditScore, notes } = body;
      if (id) {
        await pool.query(`
          UPDATE public.institution_compliance_certificates
          SET institution_code = $1, certificate_type = $2, title = $3,
              certificate_number = $4, issuing_authority = $5, valid_till = $6,
              status = $7, document_url = $8, audit_score = $9, notes = $10,
              updated_at = NOW()
          WHERE id = $11;
        `, [institutionCode || 'CBS', certificateType || 'OTHER', title, certificateNumber || '', issuingAuthority || '', validTill || 'Valid', status || 'VALID', documentUrl || '', auditScore || '100%', notes || '', id]);
      } else {
        await pool.query(`
          INSERT INTO public.institution_compliance_certificates
            (institution_code, certificate_type, title, certificate_number, issuing_authority, valid_till, status, document_url, audit_score, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        `, [institutionCode || 'CBS', certificateType || 'OTHER', title, certificateNumber || '', issuingAuthority || '', validTill || 'Valid', status || 'VALID', documentUrl || '', auditScore || '100%', notes || '']);
      }
      return NextResponse.json({ success: true, message: 'Certificate saved successfully.' });
    }

    if (body.action === 'DELETE_CERTIFICATE') {
      await pool.query(`DELETE FROM public.institution_compliance_certificates WHERE id = $1`, [body.id]);
      return NextResponse.json({ success: true, message: 'Certificate deleted successfully.' });
    }

    // Support Board Resolution CRUD
    if (body.action === 'UPSERT_RESOLUTION') {
      const { id, resolutionNumber, title, category, resolutionDate, quorum, status, summary, documentUrl } = body;
      if (id) {
        await pool.query(`
          UPDATE public.board_resolutions
          SET resolution_number = $1, title = $2, category = $3, resolution_date = $4,
              quorum = $5, status = $6, summary = $7, document_url = $8,
              updated_at = NOW()
          WHERE id = $9;
        `, [resolutionNumber, title, category || 'GOVERNANCE', resolutionDate, quorum || '5/5 Present', status || 'ENACTED', summary || '', documentUrl || '', id]);
      } else {
        await pool.query(`
          INSERT INTO public.board_resolutions
            (resolution_number, title, category, resolution_date, quorum, status, summary, document_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `, [resolutionNumber, title, category || 'GOVERNANCE', resolutionDate, quorum || '5/5 Present', status || 'ENACTED', summary || '', documentUrl || '']);
      }
      return NextResponse.json({ success: true, message: 'Resolution saved successfully.' });
    }

    if (body.action === 'DELETE_RESOLUTION') {
      await pool.query(`DELETE FROM public.board_resolutions WHERE id = $1`, [body.id]);
      return NextResponse.json({ success: true, message: 'Resolution deleted successfully.' });
    }

    // Default Trust details update
    const {
      name,
      registration_number,
      headquarters,
      contact_email,
      contact_phone,
      logo_url,
      website,
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
           website = COALESCE($7, website),
           pan_number = COALESCE($8, pan_number),
           tax_exemption_80g = COALESCE($9, tax_exemption_80g),
           chairman_name = COALESCE($10, chairman_name),
           trustee_names = COALESCE($11, trustee_names)
       WHERE 1=1
       RETURNING *;`,
      [
        name,
        registration_number,
        headquarters,
        contact_email,
        contact_phone,
        logo_url,
        website,
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
