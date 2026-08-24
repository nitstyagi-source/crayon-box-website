import pg from 'pg';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function seedClassesAndTc() {
  const client = await pool.connect();
  console.log('⏳ Seeding Academic Classes, Sections, and Official Transfer Certificates in PostgreSQL...');

  const teachersRes = await client.query(`
    SELECT id, first_name, last_name, designation FROM public.staff WHERE status = 'ACTIVE' LIMIT 12;
  `);
  const teachers = teachersRes.rows;

  const grades = [
    { grade: 'Pre-Nursery', sec: 'A', room: 'Early Years Wing 101', cap: 25 },
    { grade: 'Nursery', sec: 'A', room: 'Early Years Wing 102', cap: 25 },
    { grade: 'KG', sec: 'A', room: 'Early Years Wing 103', cap: 30 },
    { grade: 'Class 1', sec: 'A', room: 'Junior Wing 201', cap: 35 },
    { grade: 'Class 2', sec: 'A', room: 'Junior Wing 202', cap: 35 },
    { grade: 'Class 3', sec: 'A', room: 'Junior Wing 203', cap: 35 },
    { grade: 'Class 4', sec: 'A', room: 'Middle Wing 301', cap: 35 },
    { grade: 'Class 5', sec: 'A', room: 'Middle Wing 302', cap: 35 },
    { grade: 'Class 6', sec: 'A', room: 'Middle Wing 303', cap: 40 },
    { grade: 'Class 7', sec: 'A', room: 'Senior Wing 401', cap: 40 },
    { grade: 'Class 8', sec: 'A', room: 'Senior Wing 402', cap: 40 },
    { grade: 'Class 9', sec: 'A', room: 'Senior Wing 403', cap: 40 },
    { grade: 'Class 10', sec: 'A', room: 'Senior Wing 404', cap: 40 }
  ];

  await client.query(`DELETE FROM public.classes;`);

  const classMap = new Map();
  for (let i = 0; i < grades.length; i++) {
    const g = grades[i];
    const teacher = teachers[i % teachers.length];
    const res = await client.query(`
      INSERT INTO public.classes (
        campus_id, teacher_id, grade, section, room_number, capacity, created_at
      ) VALUES (
        'c3d782a9-a50b-4708-a3fc-6b146f456662', $1, $2, $3, $4, $5, NOW()
      ) RETURNING id;
    `, [teacher?.id || null, g.grade, g.sec, g.room, g.cap]);
    classMap.set(g.grade, res.rows[0].id);
  }

  // Link active students to classes evenly
  const stuRes = await client.query(`SELECT id FROM public.students ORDER BY id;`);
  const classIds = Array.from(classMap.values());
  for (let idx = 0; idx < stuRes.rows.length; idx++) {
    const stu = stuRes.rows[idx];
    const assignedClassId = classIds[idx % classIds.length];
    await client.query(`UPDATE public.students SET class_id = $1 WHERE id = $2`, [assignedClassId, stu.id]);
  }

  // Seed Official Transfer Certificates (TCs)
  await client.query(`DELETE FROM public.transfer_certificates;`);

  const mockTCs = [
    {
      tcNo: 'TC-CBS-2026-0041',
      refNo: 'REF/VET/2026/891',
      name: 'Aditya Raj Sharma',
      father: 'Ramesh Sharma',
      mother: 'Sunita Sharma',
      admNo: 'CBS-2024-1189',
      classLast: 'Class 8',
      reason: 'Parent Relocation / Father Transferred to Bengaluru HQ',
      status: 'ISSUED',
      approvedBy: 'Principal Dr. Meenakshi Sunder'
    },
    {
      tcNo: 'TC-CBS-2026-0042',
      refNo: 'REF/VET/2026/892',
      name: 'Ananya Deshmukh',
      father: 'Nitin Deshmukh',
      mother: 'Priyanka Deshmukh',
      admNo: 'CBS-2023-0941',
      classLast: 'Class 5',
      reason: 'Admission to State Sports Authority Boarding Academy',
      status: 'ISSUED',
      approvedBy: 'Principal Dr. Meenakshi Sunder'
    },
    {
      tcNo: 'TC-CBS-2026-0043',
      refNo: 'REF/VET/2026/893',
      name: 'Kabir Singhania',
      father: 'Vikram Singhania',
      mother: 'Neha Singhania',
      admNo: 'CBS-2025-2011',
      classLast: 'Class 3',
      reason: 'Overseas Emigration to United Kingdom',
      status: 'PENDING_CLEARANCE',
      approvedBy: 'Vice Principal'
    }
  ];

  for (const tc of mockTCs) {
    await client.query(`
      INSERT INTO public.transfer_certificates (
        tc_number, ref_number, institution_code, school_name,
        school_id_number, udise_code, student_name, father_name,
        mother_name, dob, admission_no, admission_date,
        class_admitted, class_last_attended, section_last_attended,
        pen_no, withdrawal_date, issue_date, dues_paid,
        last_session_attended, total_attendance, student_attendance,
        annual_result, reason_for_leaving, status, accounts_clearance,
        library_clearance, transport_clearance, academic_clearance,
        approved_by, created_at
      ) VALUES (
        $1, $2, 'CBS', 'Crayon Box International School',
        '2730891', '07010203401', $3, $4,
        $5, '2012-05-14', $6, '2023-04-01',
        'Class 1', $7, 'A',
        'PEN-2026-9901', '2026-08-15', '2026-08-20', true,
        '2026-2027', 180, 172,
        'Passed & Promoted with Grade A1', $8, $9, true,
        true, true, true,
        $10, NOW()
      )
    `, [tc.tcNo, tc.refNo, tc.name, tc.father, tc.mother, tc.admNo, tc.classLast, tc.reason, tc.status, tc.approvedBy]);
  }

  console.log(`✅ Successfully seeded ${grades.length} Academic Classes and ${mockTCs.length} Official Transfer Certificates in PostgreSQL!`);
  client.release();
  await pool.end();
}

seedClassesAndTc().catch(console.error);
