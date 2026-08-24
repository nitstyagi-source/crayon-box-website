import pg from 'pg';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function seedPhase6Comms() {
  const client = await pool.connect();
  console.log('⏳ Seeding Phase 6 Communication Campaigns, Parent Consents, PTM & Early Departures in PostgreSQL...');

  const stuRes = await client.query(`
    SELECT s.id, s.first_name, s.last_name, s.admission_no, s.universal_id,
           COALESCE(c.grade, 'Class 1') as class_name,
           f.family_name
    FROM public.students s
    LEFT JOIN public.classes c ON c.id = s.class_id
    LEFT JOIN public.families f ON f.id = s.family_id
    WHERE s.status = 'ACTIVE' LIMIT 10;
  `);
  const students = stuRes.rows;

  await client.query(`
    DELETE FROM public.communication_campaigns;
    DELETE FROM public.parent_consent_forms;
    DELETE FROM public.ptm_schedules;
    DELETE FROM public.student_early_departures;
  `);

  // 1. Broadcast Campaigns
  const mockCampaigns = [
    {
      code: 'CMP-2026-0801',
      title: 'Monsoon Seasonal Safety & School Bus Transit Advisory',
      chan: 'OMNICHANNEL',
      aud: 'ALL_PARENTS',
      body: 'Dear Parents, due to continuous monsoon rainfall, all school buses will operate with strict GPS speed limit controls (35 km/h). Live tracking is active in the Parent App.',
      rec: 220, del: 218, read: 204
    },
    {
      code: 'CMP-2026-0802',
      title: 'Term 1 Scholastic Assessment Examination Schedule Released',
      chan: 'WHATSAPP',
      aud: 'CLASS_1_TO_10',
      body: 'Official Term 1 Examination Date Sheet for Academic Session 2026–2027 is now published. Please review subject blueprints in the Parent Portal.',
      rec: 220, del: 220, read: 215
    },
    {
      code: 'CMP-2026-0803',
      title: 'Quarter 2 Tuition Fee Demand Notice & Sibling Concession Grants',
      chan: 'EMAIL',
      aud: 'ALL_PARENTS',
      body: 'Quarter 2 Fee Invoices have been generated. Households with 2+ children have automated 20%–30% sibling discounts reflected on their invoices.',
      rec: 220, del: 215, read: 188
    },
    {
      code: 'CMP-2026-0804',
      title: 'Urgent Staff Advisory: Friday Academic Moderation Board Meeting',
      chan: 'SMS',
      aud: 'FACULTY',
      body: 'All HODs and Class Teachers to assemble in Conference Room 1 at 03:15 PM for Term 1 grade moderation review.',
      rec: 64, del: 64, read: 62
    }
  ];

  for (const cmp of mockCampaigns) {
    await client.query(`
      INSERT INTO public.communication_campaigns (
        campaign_code, title, channel, target_audience,
        message_body, recipient_count, delivered_count, read_count,
        status, sent_by, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 'DISPATCHED', 'Principal Secretariat', NOW()
      )
    `, [cmp.code, cmp.title, cmp.chan, cmp.aud, cmp.body, cmp.rec, cmp.del, cmp.read]);
  }

  // 2. Parent Consent Forms
  const mockConsents = [
    {
      code: 'CNS-2026-001',
      title: 'National Science Centre Planetarium & Robotics Excursion 2026',
      desc: 'Full-day educational excursion to National Science Centre, Pragati Maidan with lunch and luxury AC bus transport provided.',
      due: '2026-09-02',
      classes: 'Class 4 to 10',
      tot: 150, app: 138, dec: 4, pend: 8
    },
    {
      code: 'CNS-2026-002',
      title: 'Inter-School Sports Olympiad & Athletic Training Camp Authorization',
      desc: 'Parental medical fitness authorization and sports participation consent for Delhi State Inter-School Athletic Meet.',
      due: '2026-09-10',
      classes: 'Class 6 to 10',
      tot: 80, app: 72, dec: 2, pend: 6
    },
    {
      code: 'CNS-2026-003',
      title: 'Annual Institutional Photo, Video & Media Release Consent',
      desc: 'Authorization to feature student academic accomplishments in annual school magazine, brochure, and official portal.',
      due: '2026-09-15',
      classes: 'Pre-Nursery to Class 10',
      tot: 220, app: 210, dec: 3, pend: 7
    }
  ];

  for (const cns of mockConsents) {
    const res = await client.query(`
      INSERT INTO public.parent_consent_forms (
        consent_code, title, description, due_date,
        target_classes, total_requests, approved_count, declined_count,
        pending_count, status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE', NOW()
      ) RETURNING id
    `, [cns.code, cns.title, cns.desc, cns.due, cns.classes, cns.tot, cns.app, cns.dec, cns.pend]);

    const formId = res.rows[0].id;

    // Seed approved records for sample students
    for (let i = 0; i < Math.min(5, students.length); i++) {
      const st = students[i];
      await client.query(`
        INSERT INTO public.student_parent_consents (
          consent_form_id, student_id, parent_name, status,
          digital_signature_hash, signed_at, created_at
        ) VALUES (
          $1, $2, $3, 'APPROVED', $4, NOW(), NOW()
        ) ON CONFLICT DO NOTHING
      `, [formId, st.id, `Parent of ${st.first_name}`, `SIG-SHA256-${st.admission_no || '001'}`]);
    }
  }

  // 3. PTM Schedules
  await client.query(`
    INSERT INTO public.ptm_schedules (
      ptm_title, event_date, slot_duration_minutes, total_slots, booked_slots, status, created_at
    ) VALUES 
      ('Term 1 Mid-Session Parent-Teacher Conference', '2026-09-05', 15, 60, 54, 'OPEN_FOR_BOOKING', NOW()),
      ('Pre-Primary & Montessori Early Development Review Meet', '2026-09-12', 20, 40, 32, 'OPEN_FOR_BOOKING', NOW());
  `);

  // 4. Early Departures Gate Passes
  const mockEarlyDepartures = [
    {
      pass: 'GP-ED-2026-019',
      student: students[0],
      reason: 'Infirmary Medical Referral (Sudden Fever)',
      escort: 'Mrs. Pooja Verma (Mother)',
      relation: 'Mother',
      approved: 'Dr. Anita Joshi (Campus Medical Officer)'
    },
    {
      pass: 'GP-ED-2026-020',
      student: students[1],
      reason: 'Urgent Family Event / Passport Appointment',
      escort: 'Mr. Rajesh Malhotra (Father)',
      relation: 'Father',
      approved: 'Vice Principal / Headmistress'
    },
    {
      pass: 'GP-ED-2026-021',
      student: students[2],
      reason: 'State Level Chess Championship Match at Talkatora Stadium',
      escort: 'Coach Jaswant Singh (Sports Faculty)',
      relation: 'Authorized Faculty Escort',
      approved: 'Head of Physical Education'
    }
  ];

  for (const ed of mockEarlyDepartures) {
    await client.query(`
      INSERT INTO public.student_early_departures (
        gate_pass_number, student_id, student_name, admission_no,
        class_name, reason, departure_time, authorized_escort_name,
        escort_relation, escort_id_verified, approved_by,
        parent_sms_alert_dispatched, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW(), $7, $8, true, $9, true, NOW()
      )
    `, [
      ed.pass, ed.student.id, `${ed.student.first_name} ${ed.student.last_name}`,
      ed.student.admission_no || ed.student.universal_id, ed.student.class_name,
      ed.reason, ed.escort, ed.relation, ed.approved
    ]);
  }

  console.log(`✅ Successfully seeded Phase 6 Communication Campaigns, Consents, PTM & Early Departure Passes in PostgreSQL!`);
  client.release();
  await pool.end();
}

seedPhase6Comms().catch(console.error);
