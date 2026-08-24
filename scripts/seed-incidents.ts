import pg from 'pg';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function seedIncidents() {
  const client = await pool.connect();
  console.log('⏳ Seeding Realistic Discipline, Infirmary, and POCSO Incidents in PostgreSQL...');

  const stuRes = await client.query(`
    SELECT s.id, s.first_name, s.last_name, s.admission_no, s.universal_id,
           COALESCE(c.grade, 'Class 1') as class_name
    FROM public.students s
    LEFT JOIN public.classes c ON c.id = s.class_id
    WHERE s.status = 'ACTIVE' LIMIT 6;
  `);
  const students = stuRes.rows;

  await client.query(`DELETE FROM public.school_incidents;`);

  const mockIncidents = [
    {
      type: 'DISCIPLINE',
      code: 'INC-DISC-2026-1042',
      student: students[0],
      cat: 'Classroom Disruption & Electronic Gadget Possession',
      sev: 'MEDIUM',
      loc: 'Senior Physics Laboratory (Room 302)',
      desc: 'Student was found using a non-approved gaming console during the practical optics session.',
      action: 'Device confiscated and kept in safe locker. Student attended counseling with Academic Coordinator.',
      status: 'RESOLVED',
      resolution: 'Parent meeting conducted on 18th August 2026. Device returned with written undertaking.'
    },
    {
      type: 'MEDICAL_INFIRMARY',
      code: 'INC-MED-2026-2184',
      student: students[1],
      cat: 'Sports Injury / Sprained Ankle',
      sev: 'LOW',
      loc: 'Main Campus Basketball Court',
      desc: 'Twisted right ankle while rebounding during Physical Education period.',
      action: 'Ice compression applied in School Infirmary, crepe bandage tied, and pain reliever administered by Campus Nurse.',
      status: 'RESOLVED',
      resolution: 'Student rested for 45 minutes; parent informed and student walked comfortably to school bus.'
    },
    {
      type: 'POCSO_SAFEGUARDING',
      code: 'INC-POCSO-2026-9011',
      student: students[2],
      cat: 'Confidential Child Protection Concern / Off-Campus Bullying',
      sev: 'HIGH',
      loc: 'Designated Safeguarding Office (DSO Vault)',
      desc: 'Class teacher noticed withdrawal behavior and reported distressing peer messages outside school hours.',
      action: 'Immediate trauma-informed conversation by Child Psychologist. Designated Safeguarding Lead initiated confidential case notes.',
      status: 'UNDER_INVESTIGATION',
      resolution: 'Case review scheduled with School Internal Complaints Committee and Parent Counselor on 24th August.'
    },
    {
      type: 'DISCIPLINE',
      code: 'INC-DISC-2026-3401',
      student: students[3],
      cat: 'Unauthorized Absence from Afternoon Period',
      sev: 'LOW',
      loc: 'Junior Library Wing',
      desc: 'Missed 6th Period Hindi class without prior gate pass.',
      action: 'Located in library reading historical fiction; advised on timetable adherence.',
      status: 'RESOLVED',
      resolution: 'Class teacher signed pass slip.'
    },
    {
      type: 'MEDICAL_INFIRMARY',
      code: 'INC-MED-2026-4412',
      student: students[4],
      cat: 'Mild Fever & Headache',
      sev: 'LOW',
      loc: 'School Infirmary (Bed #2)',
      desc: 'Reported temperature of 99.8°F after morning assembly.',
      action: 'Oral hydration and ORS given; temperature monitored hourly.',
      status: 'RESOLVED',
      resolution: 'Temperature normalized to 98.4°F by lunch.'
    }
  ];

  for (const inc of mockIncidents) {
    await client.query(`
      INSERT INTO public.school_incidents (
        campus_id, incident_code, incident_type, incident_date, incident_time,
        location, person_type, student_id, person_name, admission_no,
        class_name, section_name, reported_by, category, severity,
        description, immediate_action, parent_informed, status, final_resolution,
        created_at, updated_at
      ) VALUES (
        'c3d782a9-a50b-4708-a3fc-6b146f456662', $1, $2, '2026-08-20', '10:30 AM',
        $3, 'STUDENT', $4, $5, $6,
        $7, 'A', 'Designated Faculty Lead', $8, $9,
        $10, $11, true, $12, $13,
        NOW(), NOW()
      )
    `, [
      inc.code, inc.type, inc.loc, inc.student.id,
      `${inc.student.first_name} ${inc.student.last_name}`,
      inc.student.admission_no || inc.student.universal_id,
      inc.student.class_name, inc.cat, inc.sev,
      inc.desc, inc.action, inc.status, inc.resolution
    ]);
  }

  console.log(`✅ Successfully seeded ${mockIncidents.length} realistic incident and POCSO cases in PostgreSQL!`);
  client.release();
  await pool.end();
}

seedIncidents().catch(console.error);
