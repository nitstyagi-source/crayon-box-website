import pg from 'pg';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function seedFastTimetable() {
  const client = await pool.connect();
  console.log('⏳ Fast Seeding School Timetable...');

  await client.query(`
    ALTER TABLE public.school_timetable ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE public.staff_substitutions ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE public.staff_timetable ALTER COLUMN id SET DEFAULT gen_random_uuid();
    DELETE FROM public.school_timetable;
  `);

  const staffRes = await client.query(`
    SELECT s.id, s.first_name, s.last_name, s.department, s.designation,
           COALESCE(ea.institution_code, 'CBS') as institution_code
    FROM public.staff s
    LEFT JOIN public.employee_assignments ea ON ea.staff_id = s.id
    WHERE s.status = 'ACTIVE'
  `);
  const allStaff = staffRes.rows;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { num: 1, label: 'Period 1', start: '08:00', end: '08:45' },
    { num: 2, label: 'Period 2', start: '08:45', end: '09:30' },
    { num: 3, label: 'Period 3', start: '09:30', end: '10:15' },
    { num: 4, label: 'Period 4', start: '10:45', end: '11:30' },
    { num: 5, label: 'Period 5', start: '11:30', end: '12:15' },
    { num: 6, label: 'Period 6', start: '12:15', end: '13:00' },
    { num: 7, label: 'Period 7', start: '13:30', end: '14:15' },
    { num: 8, label: 'Period 8', start: '14:15', end: '15:00' },
  ];

  const subjects = ['Mathematics', 'Science & Physics', 'English Literature', 'Social Studies', 'Computer Science & AI', 'Hindi Language', 'Physical Education', 'Art & Craft'];

  const classes = [
    { name: 'Class 1', section: 'A' }, { name: 'Class 2', section: 'A' },
    { name: 'Class 3', section: 'A' }, { name: 'Class 4', section: 'A' },
    { name: 'Class 5', section: 'A' }, { name: 'Class 6', section: 'A' },
    { name: 'Class 7', section: 'A' }, { name: 'Class 8', section: 'A' },
    { name: 'Class 9', section: 'A' }, { name: 'Class 10', section: 'A' },
    { name: 'Pre-Nursery', section: 'A' }, { name: 'Nursery', section: 'A' }, { name: 'UKG', section: 'A' }
  ];

  const valuesClauses: string[] = [];
  const params: any[] = [];
  let count = 0;

  for (const day of days) {
    for (const cls of classes) {
      for (const p of periods) {
        const staffIndex = (count + p.num) % allStaff.length;
        const teacher = allStaff[staffIndex];
        const subject = subjects[(p.num + count) % subjects.length];
        const room = 'Room ' + (100 + (count % 20));
        const teacherName = teacher.first_name + ' ' + teacher.last_name;

        const baseIdx = params.length;
        valuesClauses.push(
          `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4}, $${baseIdx + 5}, $${baseIdx + 6}, $${baseIdx + 7}, $${baseIdx + 8}, $${baseIdx + 9}, $${baseIdx + 10}, $${baseIdx + 11}, $${baseIdx + 12}, $${baseIdx + 13}, $${baseIdx + 14})`
        );

        params.push(
          '2026–2027', day, p.num, p.label, p.start, p.end, 45,
          cls.name, cls.section, subject, teacher.id, teacherName, room, 'SCHEDULED'
        );

        count++;
      }
    }
  }

  const batchQuery = `
    INSERT INTO public.school_timetable (
      academic_session, day_of_week, period_number, period_label,
      start_time, end_time, duration_minutes, class_name, section_name,
      subject_name, teacher_id, teacher_name, room_number, status
    ) VALUES ${valuesClauses.join(', ')}
  `;

  await client.query(batchQuery, params);
  console.log(`✅ Successfully seeded all ${count} timetable slots in a single fast batch!`);
  client.release();
  await pool.end();
}

seedFastTimetable().catch(console.error);
