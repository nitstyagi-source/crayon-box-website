const pg = require("pg");
const { Pool } = pg;
const connectionString = "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function initPhase7Schema() {
  const client = await pool.connect();
  try {
    console.log("Initializing Phase 7 Database Tables...");

    // 1. Infirmary Visit Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.infirmary_visit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id TEXT,
        student_name VARCHAR(150) NOT NULL,
        class_name VARCHAR(50) NOT NULL,
        parent_phone VARCHAR(25) NOT NULL,
        symptoms TEXT NOT NULL,
        body_temperature_f NUMERIC(4,1) DEFAULT 98.6,
        treatment_given TEXT NOT NULL,
        medicine_administered VARCHAR(150),
        nurse_name VARCHAR(100) DEFAULT 'Nurse Mary (RN)',
        action_status VARCHAR(30) DEFAULT 'RESTING_IN_CLINIC', -- RESTING_IN_CLINIC, SENT_BACK_TO_CLASS, SENT_HOME
        parent_alerted BOOLEAN DEFAULT true,
        visited_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insert sample infirmary visits if empty
    const checkInf = await client.query("SELECT count(*) FROM public.infirmary_visit_logs;");
    if (Number(checkInf.rows[0]?.count || 0) === 0) {
      await client.query(`
        INSERT INTO public.infirmary_visit_logs (
          student_name, class_name, parent_phone, symptoms, body_temperature_f,
          treatment_given, medicine_administered, action_status
        ) VALUES 
          ('Aarav Sharma', 'Class 1-B', '+919810081008', 'Mild headache and low-grade warmth', 99.2, 'Rest on infirmary bed for 20 mins, cool compress applied to forehead.', 'Paracetamol 250mg syrup', 'RESTING_IN_CLINIC'),
          ('Ananya Verma', 'Class 3-A', '+919876500112', 'Minor knee scrape during playground recess', 98.6, 'Cleaned with antiseptic Betadine solution, sterile adhesive bandage applied.', 'None', 'SENT_BACK_TO_CLASS');
      `);
      console.log("✓ Initialized infirmary visit logs!");
    }

    // 2. Student Medical Records Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.student_medical_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_name VARCHAR(150) NOT NULL,
        class_name VARCHAR(50) NOT NULL,
        blood_group VARCHAR(10) DEFAULT 'B+',
        allergies TEXT DEFAULT 'None Known',
        chronic_conditions TEXT DEFAULT 'None',
        height_cm NUMERIC(5,1) DEFAULT 115.0,
        weight_kg NUMERIC(5,1) DEFAULT 21.5,
        bmi NUMERIC(4,1) DEFAULT 16.2,
        emergency_contact VARCHAR(25) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insert sample medical record if empty
    const checkMed = await client.query("SELECT count(*) FROM public.student_medical_records;");
    if (Number(checkMed.rows[0]?.count || 0) === 0) {
      await client.query(`
        INSERT INTO public.student_medical_records (
          student_name, class_name, blood_group, allergies, height_cm, weight_kg, bmi, emergency_contact
        ) VALUES 
          ('Aarav Sharma', 'Class 1-B', 'O+', 'Peanut / Mild Dust Allergy', 118.0, 22.0, 15.8, '+919810081008'),
          ('Ananya Verma', 'Class 3-A', 'B+', 'None Known', 126.0, 26.5, 16.7, '+919876500112');
      `);
      console.log("✓ Initialized student medical records!");
    }

    console.log("✓ All Phase 7 Database Tables verified and ready!");
  } finally {
    client.release();
    pool.end();
  }
}
initPhase7Schema().catch(console.error);
