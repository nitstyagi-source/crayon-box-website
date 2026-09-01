const pg = require("pg");
const { Pool } = pg;
const connectionString = "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function initPhase5Schema() {
  const client = await pool.connect();
  try {
    console.log("Initializing Phase 5 Database Tables...");

    // 1. Student Homework Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.student_homework (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_name VARCHAR(50) NOT NULL,
        section_name VARCHAR(20) DEFAULT 'A',
        subject_name VARCHAR(100) NOT NULL,
        teacher_name VARCHAR(150) NOT NULL,
        title VARCHAR(200) NOT NULL,
        instructions TEXT NOT NULL,
        due_date DATE DEFAULT (CURRENT_DATE + INTERVAL '2 days'),
        estimated_minutes INT DEFAULT 30,
        status VARCHAR(30) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. AI Admissions Inquiries Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ai_admission_inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_name VARCHAR(150) NOT NULL,
        parent_phone VARCHAR(25) NOT NULL,
        target_grade VARCHAR(50) NOT NULL,
        user_query TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        inquiry_intent VARCHAR(50) DEFAULT 'GENERAL_INQUIRY',
        lead_status VARCHAR(30) DEFAULT 'HOT_LEAD',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("✓ All Phase 5 Database Tables verified and ready!");
  } finally {
    client.release();
    pool.end();
  }
}
initPhase5Schema().catch(console.error);
