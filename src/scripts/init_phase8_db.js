const pg = require("pg");
const { Pool } = pg;
const connectionString = "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function initPhase8Schema() {
  const client = await pool.connect();
  try {
    console.log("Initializing Phase 8 Database Tables...");

    // 1. Transfer Certificates Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.transfer_certificates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tc_number VARCHAR(50) UNIQUE NOT NULL,
        admission_no VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        father_name VARCHAR(150) NOT NULL,
        mother_name VARCHAR(150) NOT NULL,
        nationality VARCHAR(50) DEFAULT 'Indian',
        date_of_birth DATE NOT NULL,
        date_of_admission DATE NOT NULL,
        class_left VARCHAR(50) NOT NULL,
        school_board VARCHAR(50) DEFAULT 'CBSE',
        dues_cleared BOOLEAN DEFAULT true,
        reason_for_leaving TEXT NOT NULL,
        general_conduct VARCHAR(50) DEFAULT 'Good / Exemplary',
        date_of_issue DATE DEFAULT CURRENT_DATE,
        verification_token VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insert sample TC if empty
    const checkTc = await client.query("SELECT count(*) FROM public.transfer_certificates;");
    if (Number(checkTc.rows[0]?.count || 0) === 0) {
      await client.query(`
        INSERT INTO public.transfer_certificates (
          tc_number, admission_no, student_name, father_name, mother_name,
          date_of_birth, date_of_admission, class_left, dues_cleared,
          reason_for_leaving, general_conduct, verification_token
        ) VALUES (
          'TC/CBS/2026/0142',
          'ADM-2024-0089',
          'Rohan Singhal',
          'Mr. Vikram Singhal',
          'Mrs. Anita Singhal',
          '2014-08-15',
          '2024-04-01',
          'Class 6-A',
          true,
          'Parents relocated to Bangalore for employment',
          'Exemplary & Courteous',
          'tc_token_rohan_2026'
        );
      `);
      console.log("✓ Initialized sample Transfer Certificate!");
    }

    // 2. PTM Slots Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ptm_slots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_title VARCHAR(150) NOT NULL,
        event_date DATE NOT NULL,
        class_name VARCHAR(50) NOT NULL,
        teacher_name VARCHAR(150) NOT NULL,
        time_slot VARCHAR(50) NOT NULL,
        is_booked BOOLEAN DEFAULT false,
        student_name VARCHAR(150),
        parent_name VARCHAR(150),
        parent_phone VARCHAR(25),
        agenda_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insert sample PTM slots if empty
    const checkPtm = await client.query("SELECT count(*) FROM public.ptm_slots;");
    if (Number(checkPtm.rows[0]?.count || 0) === 0) {
      await client.query(`
        INSERT INTO public.ptm_slots (
          event_title, event_date, class_name, teacher_name, time_slot,
          is_booked, student_name, parent_name, parent_phone, agenda_notes
        ) VALUES 
          ('Term 1 Academic Progress PTM', CURRENT_DATE + INTERVAL '5 days', 'Class 1-A', 'Ms. Pooja Sharma', '09:00 AM - 09:15 AM', true, 'Aarav Sharma', 'Mr. Rajesh Sharma', '+919810081008', 'Discuss mathematics speed and reading phonics'),
          ('Term 1 Academic Progress PTM', CURRENT_DATE + INTERVAL '5 days', 'Class 1-A', 'Ms. Pooja Sharma', '09:15 AM - 09:30 AM', false, NULL, NULL, NULL, NULL),
          ('Term 1 Academic Progress PTM', CURRENT_DATE + INTERVAL '5 days', 'Class 1-A', 'Ms. Pooja Sharma', '09:30 AM - 09:45 AM', false, NULL, NULL, NULL, NULL),
          ('Term 1 Academic Progress PTM', CURRENT_DATE + INTERVAL '5 days', 'Class 1-A', 'Ms. Pooja Sharma', '09:45 AM - 10:00 AM', false, NULL, NULL, NULL, NULL);
      `);
      console.log("✓ Initialized sample PTM slots!");
    }

    console.log("✓ All Phase 8 Database Tables verified and ready!");
  } finally {
    client.release();
    pool.end();
  }
}
initPhase8Schema().catch(console.error);
