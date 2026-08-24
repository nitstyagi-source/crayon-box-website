import pg from 'pg';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function seedPtm() {
  const client = await pool.connect();
  console.log('⏳ Seeding PTM Events & Teacher Slot Schedule in PostgreSQL...');

  const stuRes = await client.query(`
    SELECT s.id, s.first_name, s.last_name, s.admission_no,
           COALESCE(c.grade, 'Class 1') as class_name,
           COALESCE(s.father_name, s.mother_name, 'Parent') as primary_contact_name
    FROM public.students s
    LEFT JOIN public.classes c ON c.id = s.class_id
    WHERE s.status = 'ACTIVE' LIMIT 10;
  `);
  const students = stuRes.rows;

  const staffRes = await client.query(`
    SELECT id, first_name, last_name, designation, department
    FROM public.staff
    WHERE status = 'ACTIVE' AND (designation ILIKE '%Teacher%' OR department ILIKE '%Academic%')
    LIMIT 6;
  `);
  const teachers = staffRes.rows;

  await client.query(`DELETE FROM public.ptm_events;`);
  await client.query(`DELETE FROM public.ptm_teacher_slots;`);

  const eventRes = await client.query(`
    INSERT INTO public.ptm_events (
      event_code, title, event_date, start_time, end_time,
      slot_duration_minutes, meeting_mode, target_classes, status, created_at
    ) VALUES (
      'PTM-2026-T1', 'Term 1 Mid-Session Parent-Teacher Conference', '2026-09-05',
      '09:00 AM', '01:00 PM', 15, 'OFFLINE_CAMPUS', 'Pre-Nursery to Class 10', 'OPEN_FOR_BOOKING', NOW()
    ) RETURNING id;
  `);
  const eventId = eventRes.rows[0].id;

  const timeSlots = [
    '09:00 AM – 09:15 AM',
    '09:15 AM – 09:30 AM',
    '09:30 AM – 09:45 AM',
    '09:45 AM – 10:00 AM',
    '10:00 AM – 10:15 AM',
    '10:15 AM – 10:30 AM',
    '10:45 AM – 11:00 AM',
    '11:00 AM – 11:15 AM'
  ];

  let studentIdx = 0;
  for (let tIdx = 0; tIdx < teachers.length; tIdx++) {
    const teacher = teachers[tIdx];
    const room = `Academic Block - Room ${101 + tIdx}`;

    for (let sIdx = 0; sIdx < timeSlots.length; sIdx++) {
      const slotTime = timeSlots[sIdx];
      const isBooked = sIdx < 5 && studentIdx < students.length;

      if (isBooked) {
        const student = students[studentIdx % students.length];
        await client.query(`
          INSERT INTO public.ptm_teacher_slots (
            ptm_event_id, staff_id, teacher_name, subject_or_class,
            room_number, slot_time, student_id, student_name,
            parent_name, parent_phone, booking_status,
            discussion_notes, follow_up_action, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'BOOKED',
            'Discussed Term 1 scholastic progress, mental mathematics focus, and classroom participation.',
            'Share weekly remedial worksheet for fractions.', NOW()
          )
        `, [
          eventId, teacher.id, `${teacher.first_name} ${teacher.last_name}`,
          teacher.designation || 'Class Teacher', room, slotTime,
          student.id, `${student.first_name} ${student.last_name} (${student.class_name})`,
          student.primary_contact_name || `Parent of ${student.first_name}`,
          student.primary_contact_phone || '+91 98112 34567'
        ]);
        studentIdx++;
      } else {
        await client.query(`
          INSERT INTO public.ptm_teacher_slots (
            ptm_event_id, staff_id, teacher_name, subject_or_class,
            room_number, slot_time, booking_status, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, 'AVAILABLE', NOW()
          )
        `, [
          eventId, teacher.id, `${teacher.first_name} ${teacher.last_name}`,
          teacher.designation || 'Class Teacher', room, slotTime
        ]);
      }
    }
  }

  console.log(`✅ Successfully seeded PTM Event & ${teachers.length * timeSlots.length} teacher time slots in PostgreSQL!`);
  client.release();
  await pool.end();
}

seedPtm().catch(console.error);
