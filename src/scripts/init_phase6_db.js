const pg = require("pg");
const { Pool } = pg;
const connectionString = "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function initPhase6Schema() {
  const client = await pool.connect();
  try {
    console.log("Initializing Phase 6 Database Tables...");

    // 1. Quizzes Master Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.student_quizzes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_name VARCHAR(50) NOT NULL,
        subject_name VARCHAR(100) NOT NULL,
        chapter_name VARCHAR(200) NOT NULL,
        title VARCHAR(200) NOT NULL,
        duration_minutes INT DEFAULT 15,
        total_questions INT DEFAULT 5,
        questions_data JSONB NOT NULL,
        status VARCHAR(30) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insert sample quiz if empty
    const checkQz = await client.query("SELECT count(*) FROM public.student_quizzes;");
    if (Number(checkQz.rows[0]?.count || 0) === 0) {
      await client.query(`
        INSERT INTO public.student_quizzes (class_name, subject_name, chapter_name, title, duration_minutes, total_questions, questions_data)
        VALUES (
          'Class 4',
          'Science & Nature',
          'Plants & Photosynthesis',
          'Photosynthesis & Plant Life Quiz',
          10,
          3,
          '[
            {"id": 1, "q": "Which green pigment in leaves absorbs sunlight for photosynthesis?", "options": ["Chlorophyll", "Hemoglobin", "Carotene", "Melanin"], "correct": 0, "exp": "Chlorophyll gives plants their green color and captures light energy."},
            {"id": 2, "q": "What gas do plants release into the atmosphere during photosynthesis?", "options": ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"], "correct": 1, "exp": "Plants take in carbon dioxide and release oxygen as a byproduct."},
            {"id": 3, "q": "Tiny pores on the underside of leaves used for gas exchange are called:", "options": ["Roots", "Stomata", "Veins", "Petals"], "correct": 1, "exp": "Stomata are microscopic pores that regulate gas exchange and transpiration."}
          ]'
        );
      `);
      console.log("✓ Initialized sample chapter quiz!");
    }

    // 2. Staff Payroll Records Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.staff_payroll_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        staff_name VARCHAR(150) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        month_year VARCHAR(30) NOT NULL,
        phone_number VARCHAR(25) NOT NULL,
        basic_pay NUMERIC(10,2) NOT NULL,
        hra NUMERIC(10,2) NOT NULL,
        da NUMERIC(10,2) NOT NULL,
        special_allowance NUMERIC(10,2) DEFAULT 0,
        gross_salary NUMERIC(10,2) NOT NULL,
        epf_deduction NUMERIC(10,2) NOT NULL,
        esi_deduction NUMERIC(10,2) DEFAULT 0,
        tds_deduction NUMERIC(10,2) DEFAULT 0,
        total_deductions NUMERIC(10,2) NOT NULL,
        net_salary NUMERIC(10,2) NOT NULL,
        payment_status VARCHAR(30) DEFAULT 'PAID',
        whatsapp_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insert sample payroll records
    const checkPay = await client.query("SELECT count(*) FROM public.staff_payroll_records;");
    if (Number(checkPay.rows[0]?.count || 0) === 0) {
      await client.query(`
        INSERT INTO public.staff_payroll_records (
          staff_name, designation, department, month_year, phone_number,
          basic_pay, hra, da, gross_salary, epf_deduction, esi_deduction,
          total_deductions, net_salary, payment_status
        ) VALUES 
          ('Mrs. Neha Gupta', 'Senior PRT English Teacher', 'Primary Academic Wing', 'September 2026', '+919876543201', 28000, 11200, 5600, 44800, 3360, 336, 3696, 41104, 'PAID'),
          ('Ms. Pooja Sharma', 'TGT Mathematics Faculty', 'Middle School Wing', 'September 2026', '+919876543202', 32000, 12800, 6400, 51200, 3840, 384, 4224, 46976, 'PAID'),
          ('Dr. Rajesh Verma', 'PGT Science & Coordinator', 'Senior Academic Wing', 'September 2026', '+919876543203', 40000, 16000, 8000, 64000, 4800, 480, 5280, 58720, 'PAID');
      `);
      console.log("✓ Initialized staff payroll records!");
    }

    console.log("✓ All Phase 6 Database Tables verified and ready!");
  } finally {
    client.release();
    pool.end();
  }
}
initPhase6Schema().catch(console.error);
