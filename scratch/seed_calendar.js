const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initCalendar() {
  await client.connect();
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS school_calendar_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      academic_session VARCHAR(50) DEFAULT '2026-2027',
      title VARCHAR(250) NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      start_time VARCHAR(20),
      end_time VARCHAR(20),
      target_audience VARCHAR(50) DEFAULT 'All',
      applicable_classes JSONB DEFAULT '["All"]'::jsonb,
      venue VARCHAR(200),
      description TEXT,
      attachment_url TEXT,
      attachment_name VARCHAR(250),
      attachment_type VARCHAR(50),
      is_holiday BOOLEAN DEFAULT false,
      is_exam BOOLEAN DEFAULT false,
      holiday_type VARCHAR(50) DEFAULT 'Full Day',
      reminder_days_before JSONB DEFAULT '[7, 3, 1, 0]'::jsonb,
      notification_channels JSONB DEFAULT '["App", "WhatsApp"]'::jsonb,
      created_by VARCHAR(150) DEFAULT 'School Admin',
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_calendar_dates ON school_calendar_events(start_date, end_date);
    CREATE INDEX IF NOT EXISTS idx_calendar_type ON school_calendar_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_calendar_campus ON school_calendar_events(campus_id);
  `);

  console.log('✅ Created school_calendar_events table!');

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  const sampleEvents = [
    {
      title: 'Session 2026-27 Grand Re-opening & Orientation',
      event_type: '🏫 School Event',
      start_date: '2026-08-01',
      end_date: '2026-08-01',
      start_time: '08:00 AM',
      end_time: '01:30 PM',
      target_audience: 'All',
      applicable_classes: JSON.stringify(['All']),
      venue: 'Main Auditorium & Classrooms',
      description: 'Welcome back assembly, class teacher allocations, and academic starter kits distribution.',
      is_holiday: false,
      is_exam: false
    },
    {
      title: 'Independence Day & Investiture Ceremony',
      event_type: '🎉 Celebration',
      start_date: '2026-08-15',
      end_date: '2026-08-15',
      start_time: '08:30 AM',
      end_time: '11:30 AM',
      target_audience: 'All',
      applicable_classes: JSON.stringify(['All']),
      venue: 'School Amphitheatre & Sports Ground',
      description: 'Flag hoisting ceremony, cultural dance performances, and Student Council badge pinning.',
      is_holiday: false,
      is_exam: false
    },
    {
      title: 'Class 5A Mathematics Diagnostic Test',
      event_type: '📝 Assessment',
      start_date: '2026-08-24',
      end_date: '2026-08-24',
      start_time: '08:30 AM',
      end_time: '09:30 AM',
      target_audience: 'Class',
      applicable_classes: JSON.stringify(['Grade 5']),
      venue: 'Room 301 (Grade 5A)',
      description: 'Covers Chapter 1 to 4: Numbers, Operations, Factors, and Fractions.',
      is_holiday: false,
      is_exam: true
    },
    {
      title: 'Parent-Teacher Meeting (Term 1 PTM)',
      event_type: '👨‍👩‍👧 Parent Meeting',
      start_date: '2026-08-29',
      end_date: '2026-08-29',
      start_time: '09:00 AM',
      end_time: '01:00 PM',
      target_audience: 'Parents',
      applicable_classes: JSON.stringify(['All']),
      venue: 'Respective Classrooms',
      description: 'One-on-one parent-educator discussion on student progress, attendance, and digital diary review.',
      is_holiday: false,
      is_exam: false
    },
    {
      title: 'Janmashtami Holiday',
      event_type: '🏖 Holiday',
      start_date: '2026-09-04',
      end_date: '2026-09-04',
      start_time: 'Full Day',
      end_time: 'Full Day',
      target_audience: 'All',
      applicable_classes: JSON.stringify(['All']),
      venue: 'School Closed',
      description: 'Gazetted festival holiday for all students and teaching staff.',
      is_holiday: true,
      is_exam: false,
      holiday_type: 'Gazetted'
    },
    {
      title: 'Mid-Term Examination: Mathematics (Grades 1-5)',
      event_type: '📚 Exam',
      start_date: '2026-09-10',
      end_date: '2026-09-10',
      start_time: '09:00 AM',
      end_time: '11:30 AM',
      target_audience: 'Class',
      applicable_classes: JSON.stringify(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']),
      venue: 'Examination Wing',
      description: 'Term 1 Mid-Term Summative Assessment. Reporting time: 08:15 AM.',
      is_holiday: false,
      is_exam: true
    },
    {
      title: 'Mid-Term Examination: English Literature & Language',
      event_type: '📚 Exam',
      start_date: '2026-09-12',
      end_date: '2026-09-12',
      start_time: '09:00 AM',
      end_time: '11:30 AM',
      target_audience: 'Class',
      applicable_classes: JSON.stringify(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']),
      venue: 'Examination Wing',
      description: 'Grammar, Reading Comprehension, and Creative Writing evaluation.',
      is_holiday: false,
      is_exam: true
    },
    {
      title: 'Mid-Term Examination: Science & Environmental Studies',
      event_type: '📚 Exam',
      start_date: '2026-09-15',
      end_date: '2026-09-15',
      start_time: '09:00 AM',
      end_time: '11:30 AM',
      target_audience: 'Class',
      applicable_classes: JSON.stringify(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']),
      venue: 'Examination Wing',
      description: 'Summative science evaluation including laboratory practical concepts.',
      is_holiday: false,
      is_exam: true
    },
    {
      title: 'Faculty Academic Review & Staff Development Meeting',
      event_type: '👩‍🏫 Teacher Meeting',
      start_date: '2026-09-19',
      end_date: '2026-09-19',
      start_time: '02:00 PM',
      end_time: '04:00 PM',
      target_audience: 'Teachers',
      applicable_classes: JSON.stringify(['All']),
      venue: 'Conference Room 1',
      description: 'Curriculum coverage audit, question paper grading standards, and remedial planning.',
      is_holiday: false,
      is_exam: false
    },
    {
      title: 'Annual Inter-House Athletics & Sports Carnival',
      event_type: '🏆 Sports',
      start_date: '2026-10-16',
      end_date: '2026-10-17',
      start_time: '08:00 AM',
      end_time: '02:00 PM',
      target_audience: 'All',
      applicable_classes: JSON.stringify(['All']),
      venue: 'Olympic Sports Arena & Track',
      description: 'Track and field events, relay races, march past, and house trophy awards.',
      is_holiday: false,
      is_exam: false
    },
    {
      title: 'Diwali & Autumn Vacation',
      event_type: '🏖 Holiday',
      start_date: '2026-11-06',
      end_date: '2026-11-12',
      start_time: 'Full Day',
      end_time: 'Full Day',
      target_audience: 'All',
      applicable_classes: JSON.stringify(['All']),
      venue: 'School Closed',
      description: 'Diwali and Bhai Dooj autumn festival break. School reopens on 13 November.',
      is_holiday: true,
      is_exam: false,
      holiday_type: 'Vacation'
    },
    {
      title: 'Grand Annual Function & Cultural Odyssey 2026',
      event_type: '🎭 Annual Function',
      start_date: '2026-12-19',
      end_date: '2026-12-19',
      start_time: '04:30 PM',
      end_time: '08:30 PM',
      target_audience: 'All',
      applicable_classes: JSON.stringify(['All']),
      venue: 'Open Air Theatre & Central Lawns',
      description: 'Annual cultural extravaganza, musical plays, dance recitals, and prize distribution.',
      is_holiday: false,
      is_exam: false
    },
    {
      title: 'Winter Break',
      event_type: '🏖 Holiday',
      start_date: '2026-12-25',
      end_date: '2027-01-05',
      start_time: 'Full Day',
      end_time: 'Full Day',
      target_audience: 'All',
      applicable_classes: JSON.stringify(['All']),
      venue: 'School Closed',
      description: 'Annual winter vacation for students and faculty. School resumes on 6 January 2027.',
      is_holiday: true,
      is_exam: false,
      holiday_type: 'Vacation'
    },
    {
      title: 'Annual Examination 2027 (Finals)',
      event_type: '📚 Exam',
      start_date: '2027-03-01',
      end_date: '2027-03-15',
      start_time: '09:00 AM',
      end_time: '12:00 PM',
      target_audience: 'Class',
      applicable_classes: JSON.stringify(['All']),
      venue: 'Examination Centers',
      description: 'End of academic session cumulative examinations for promotion to next grade.',
      is_holiday: false,
      is_exam: true
    },
    {
      title: 'Annual Result Declaration & Report Card Day',
      event_type: '📢 Important Notice',
      start_date: '2027-03-27',
      end_date: '2027-03-27',
      start_time: '09:00 AM',
      end_time: '01:00 PM',
      target_audience: 'Parents',
      applicable_classes: JSON.stringify(['All']),
      venue: 'Respective Classrooms',
      description: 'Final academic session results, report cards distribution, and graduation ceremony.',
      is_holiday: false,
      is_exam: false
    },
    {
      title: 'Last Working Day (Academic Session 2026-27)',
      event_type: '🏫 School Event',
      start_date: '2027-03-31',
      end_date: '2027-03-31',
      start_time: '08:00 AM',
      end_time: '12:00 PM',
      target_audience: 'All',
      applicable_classes: JSON.stringify(['All']),
      venue: 'School Campus',
      description: 'Conclusion of Academic Session 2026-2027.',
      is_holiday: false,
      is_exam: false
    }
  ];

  for (const ev of sampleEvents) {
    await client.query(`
      INSERT INTO school_calendar_events (
        campus_id, academic_session, title, event_type, start_date, end_date,
        start_time, end_time, target_audience, applicable_classes, venue,
        description, is_holiday, is_exam, holiday_type
      ) VALUES ($1, '2026-2027', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      campusId, ev.title, ev.event_type, ev.start_date, ev.end_date,
      ev.start_time, ev.end_time, ev.target_audience, ev.applicable_classes,
      ev.venue, ev.description, ev.is_holiday, ev.is_exam, ev.holiday_type || 'Full Day'
    ]);
  }

  console.log('✅ Seeded Academic Calendar 2026-2027 with ' + sampleEvents.length + ' events!');
  await client.end();
}

initCalendar().catch(console.error);
