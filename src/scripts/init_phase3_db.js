const pg = require("pg");
const { Pool } = pg;
const connectionString = "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function initPhase3Schema() {
  const client = await pool.connect();
  try {
    console.log("Initializing Phase 3 Database Tables...");

    const checkTt = await client.query("SELECT count(*) FROM public.school_timetable WHERE class_name = 'Class 1';");
    if (Number(checkTt.rows[0]?.count || 0) === 0) {
      console.log("Seeding timetable slots for Class 1...");
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const subjects = [
        { name: 'Mathematics', teacher: 'Ms. Pooja Sharma', room: 'Room 101' },
        { name: 'English Literature', teacher: 'Mrs. Neha Gupta', room: 'Room 101' },
        { name: 'Environmental Science (EVS)', teacher: 'Dr. Rajesh Verma', room: 'Science Lab' },
        { name: 'Hindi Core', teacher: 'Mrs. Kavita Kumari', room: 'Room 101' },
        { name: 'Computer Applications', teacher: 'Mr. Amit Kumar', room: 'Computer Lab' },
        { name: 'Art & Craft / SUPW', teacher: 'Ms. Ritu Roy', room: 'Activity Room' },
        { name: 'Physical Education & Games', teacher: 'Mr. Vikram Singh', room: 'Playground' },
        { name: 'Library & Reading Club', teacher: 'Mrs. Meenakshi S.', room: 'Central Library' }
      ];

      const periodTimes = [
        { start: '08:30', end: '09:15' },
        { start: '09:15', end: '10:00' },
        { start: '10:00', end: '10:45' },
        { start: '11:00', end: '11:45' },
        { start: '11:45', end: '12:30' },
        { start: '12:30', end: '01:15' },
        { start: '01:30', end: '02:15' },
        { start: '02:15', end: '03:00' }
      ];

      for (const day of days) {
        for (let p = 1; p <= 8; p++) {
          const sub = subjects[(p - 1 + days.indexOf(day)) % subjects.length];
          const time = periodTimes[p - 1];
          await client.query(`
            INSERT INTO public.school_timetable (
              class_name, section_name, academic_session, day_of_week,
              period_number, period_label, start_time, end_time, subject_name,
              teacher_name, room_number, status
            ) VALUES (
              'Class 1', 'A', '2026–2027', $1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE'
            );
          `, [day, p, `Period ${p}`, time.start, time.end, sub.name, sub.teacher, sub.room]);
        }
      }
      console.log("✓ Seeded Class 1 weekly timetable matrix!");
    }

    // 2. Populate Library Circulation Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.library_circulation (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id TEXT,
        student_name VARCHAR(150) NOT NULL,
        class_name VARCHAR(50) NOT NULL,
        parent_phone VARCHAR(25),
        book_isbn VARCHAR(50) NOT NULL,
        book_title VARCHAR(200) NOT NULL,
        issued_date DATE DEFAULT CURRENT_DATE,
        due_date DATE DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
        returned_date DATE,
        status VARCHAR(30) DEFAULT 'ISSUED',
        fine_amount INT DEFAULT 0,
        fine_status VARCHAR(20) DEFAULT 'NONE',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insert sample active & overdue loans
    const checkCirc = await client.query("SELECT count(*) FROM public.library_circulation;");
    if (Number(checkCirc.rows[0]?.count || 0) === 0) {
      await client.query(`
        INSERT INTO public.library_circulation (
          student_name, class_name, parent_phone, book_isbn, book_title,
          issued_date, due_date, status, fine_amount, fine_status
        ) VALUES 
          ('Aarav Sharma', 'Class 1-B', '+919810081008', '978-0143330837', 'Malgudi Days by R.K. Narayan', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '4 days', 'OVERDUE', 20, 'PENDING'),
          ('Ananya Verma', 'Class 3-A', '+919876500112', '978-0195628586', 'The Blue Umbrella by Ruskin Bond', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '8 days', 'ISSUED', 0, 'NONE'),
          ('Kabir Mehta', 'Class 5', '+919876500113', '978-0141321189', 'Gitanjali by Rabindranath Tagore', CURRENT_DATE - INTERVAL '22 days', CURRENT_DATE - INTERVAL '8 days', 'OVERDUE', 40, 'PENDING'),
          ('Riya Kapoor', 'Class 2-A', '+919876500114', '978-0747532743', 'Harry Potter & the Philosopher Stone', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '12 days', 'ISSUED', 0, 'NONE');
      `);
      console.log("✓ Initialized library circulation loans & overdue records!");
    }

    console.log("✓ All Phase 3 Database Tables verified and ready!");
  } finally {
    client.release();
    pool.end();
  }
}
initPhase3Schema().catch(console.error);
