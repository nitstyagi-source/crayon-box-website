const pg = require("pg");
const { Pool } = pg;
const connectionString = "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function initPhase4Schema() {
  const client = await pool.connect();
  try {
    console.log("Initializing Phase 4 Database Tables...");

    // 1. Question Papers Central Repository Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.question_papers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campus_id TEXT DEFAULT 'default',
        title VARCHAR(200) NOT NULL,
        class_name VARCHAR(50) NOT NULL,
        subject_name VARCHAR(100) NOT NULL,
        exam_term VARCHAR(80) NOT NULL,
        total_marks INT NOT NULL,
        duration_minutes INT DEFAULT 90,
        chapters TEXT,
        sections_data JSONB NOT NULL,
        solution_key_data JSONB,
        created_by_teacher VARCHAR(150) DEFAULT 'AI Academic Board',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insert sample generated question paper if empty
    const checkQp = await client.query("SELECT count(*) FROM public.question_papers;");
    if (Number(checkQp.rows[0]?.count || 0) === 0) {
      await client.query(`
        INSERT INTO public.question_papers (
          title, class_name, subject_name, exam_term, total_marks, duration_minutes, chapters, sections_data
        ) VALUES (
          'Grade 8 Science Mid-Term Examination 2026',
          'Class 8',
          'Science & Technology',
          'Term 1 (Half Yearly Examination)',
          50,
          90,
          'Cell Structure, Force & Pressure, Microorganisms, Synthetic Fibres',
          '{"sectionA": [{"q": "Which organelle is known as the powerhouse of the cell?", "marks": 1, "ans": "Mitochondria"}, {"q": "State whether true or false: Friction always opposes motion.", "marks": 1, "ans": "True"}], "sectionB": [{"q": "Differentiate between Plant Cell and Animal Cell with two key points.", "marks": 2, "ans": "Plant cells have a cell wall and chloroplasts, whereas animal cells do not."}], "sectionC": [{"q": "Explain atmospheric pressure and describe one daily life application.", "marks": 3, "ans": "Atmospheric pressure is the force exerted per unit area by the weight of air. Example: Drinking straw or suction cups."}], "sectionD": [{"q": "Case Study: In an experiment on microorganisms in bread mould, analyze the conditions required for fungal spore germination.", "marks": 5, "ans": "Requires moisture, optimal warmth (25-30°C), and organic nutrient substrate."}]}'
        );
      `);
      console.log("✓ Initialized central question paper bank!");
    }

    console.log("✓ Phase 4 Database Tables initialized successfully!");
  } finally {
    client.release();
    pool.end();
  }
}
initPhase4Schema().catch(console.error);
