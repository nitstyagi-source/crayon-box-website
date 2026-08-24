import pg from 'pg';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function seedBatchB() {
  const client = await pool.connect();
  console.log('⏳ Seeding Visitor Gate Logs and Student Medical Infirmary Visits in PostgreSQL...');

  const stuRes = await client.query(`SELECT id, first_name, last_name FROM public.students LIMIT 5;`);
  const students = stuRes.rows;

  // 1. Visitors & Logs
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.campus_visitors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      badge_number VARCHAR(50) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      phone_number VARCHAR(50) NOT NULL,
      visitor_type VARCHAR(50) DEFAULT 'PARENT',
      host_person VARCHAR(100) NOT NULL,
      purpose VARCHAR(200) NOT NULL,
      id_proof_type VARCHAR(50) DEFAULT 'Aadhaar Card',
      vehicle_number VARCHAR(50),
      check_in_time TIMESTAMPTZ DEFAULT NOW(),
      check_out_time TIMESTAMPTZ,
      status VARCHAR(30) DEFAULT 'CHECKED_IN',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`DELETE FROM public.campus_visitors;`);

  const mockVisitors = [
    { badge: 'VIS-2026-081', name: 'Dr. Alok Nath (CBSE Inspector)', phone: '+91 98101 22334', type: 'INSPECTOR', host: 'Principal Dr. Meenakshi Sunder', purpose: 'Annual CBSE Affiliation Review & Infrastructure Inspection', veh: 'DL-01-AB-1234', stat: 'CHECKED_IN' },
    { badge: 'VIS-2026-082', name: 'Mrs. Sangeeta Rao (Parent)', phone: '+91 98202 33445', type: 'PARENT', host: 'Academic Coordinator', purpose: 'Admissions Inquiry for Grade 1 (Academic Session 2027)', veh: 'DL-03-XY-5678', stat: 'CHECKED_IN' },
    { badge: 'VIS-2026-083', name: 'Mr. Pradeep Tyagi (Dell Engineer)', phone: '+91 98303 44556', type: 'VENDOR', host: 'IT Lab Administrator', purpose: 'Smartboard Firmware Upgrade & AI Server Maintenance', veh: 'UP-16-CD-9012', stat: 'CHECKED_OUT' }
  ];

  for (const v of mockVisitors) {
    await client.query(`
      INSERT INTO public.campus_visitors (
        badge_number, full_name, phone_number, visitor_type,
        host_person, purpose, id_proof_type, vehicle_number,
        check_in_time, status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'Aadhaar Card', $7, NOW(), $8, NOW()
      )
    `, [v.badge, v.name, v.phone, v.type, v.host, v.purpose, v.veh, v.stat]);
  }

  // 2. Student Health Infirmary Logs
  await client.query(`DELETE FROM public.medical_logs;`);

  const mockMedical = [
    {
      student: students[0],
      sym: 'Minor scratch on left elbow during lunch break football match',
      diag: 'Superficial Abrasion',
      act: 'Cleaned with Betadine antiseptic solution and Band-Aid applied.',
      med: 'Neosporin Ointment',
      temp: 98.4
    },
    {
      student: students[1],
      sym: 'Complaint of frontal headache and mild nausea after PT period',
      diag: 'Dehydration / Sun Exposure',
      act: 'Rested in air-conditioned Infirmary Bed #1 for 30 minutes with Electrolyte ORS solution.',
      med: 'Electral ORS 200ml',
      temp: 98.6
    }
  ];

  const staffRes = await client.query(`SELECT id FROM public.staff LIMIT 1;`);
  const nurseId = staffRes.rows[0]?.id;

  for (const m of mockMedical) {
    await client.query(`
      INSERT INTO public.medical_logs (
        student_id, logged_by, incident_date, symptoms,
        diagnosis, action_taken, medication_administered,
        temperature, emergency_contact_notified, status, created_at
      ) VALUES (
        $1, $2, CURRENT_DATE, $3,
        $4, $5, $6, $7, true, 'RESOLVED', NOW()
      )
    `, [m.student.id, nurseId, m.sym, m.diag, m.act, m.med, m.temp]);
  }

  console.log(`✅ Successfully seeded ${mockVisitors.length} Campus Visitors and ${mockMedical.length} Infirmary Medical Records in PostgreSQL!`);
  client.release();
  await pool.end();
}

seedBatchB().catch(console.error);
