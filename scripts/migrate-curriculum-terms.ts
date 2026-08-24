import pg from 'pg';

const pool = new pg.Pool({ 
  connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function inspectAndMigrateCurriculumTerms() {
  console.log('🔍 ========================================================');
  console.log('🔍 INSPECTING CURRICULUM TERMS, ASSESSMENTS & LESSON DIARY');
  console.log('🔍 ========================================================\n');

  const client = await pool.connect();
  try {
    // 1. Check syllabus_chapters columns
    const chapCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'syllabus_chapters'
      ORDER BY ordinal_position;
    `);
    console.log('📌 1. syllabus_chapters columns:');
    chapCols.rows.forEach((c: any) => console.log(`   - ${c.column_name} (${c.data_type})`));

    // 2. Check lesson diary / lesson logs tables
    const logTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%lesson%' OR table_name LIKE '%diary%' OR table_name LIKE '%term%';
    `);
    console.log('\n📌 2. Related tables in public schema:');
    logTables.rows.forEach((t: any) => console.log(`   - ${t.table_name}`));

    // 3. Add term_name and assessment_milestone to syllabus_chapters if missing
    await client.query(`
      ALTER TABLE public.syllabus_chapters 
      ADD COLUMN IF NOT EXISTS term_name VARCHAR(100) DEFAULT 'Term 1',
      ADD COLUMN IF NOT EXISTS assessment_milestone VARCHAR(100) DEFAULT 'FA-1 (Periodic Test 1)',
      ADD COLUMN IF NOT EXISTS target_month VARCHAR(50),
      ADD COLUMN IF NOT EXISTS blooms_taxonomy_level VARCHAR(100) DEFAULT 'Application & Analysis',
      ADD COLUMN IF NOT EXISTS competency_indicators JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('\n✅ Added term_name, assessment_milestone, target_month, blooms_taxonomy_level, competency_indicators to public.syllabus_chapters');

    // 4. Create public.curriculum_terms table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.curriculum_terms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        institution_code VARCHAR(50) DEFAULT 'CBS',
        academic_session VARCHAR(50) DEFAULT '2026-2027',
        term_name VARCHAR(100) NOT NULL,
        term_code VARCHAR(50) NOT NULL,
        assessment_type VARCHAR(100) NOT NULL, -- 'FORMATIVE' (FA-1, FA-2, FA-3, FA-4) or 'SUMMATIVE' (SA-1, SA-2)
        milestone_label VARCHAR(150) NOT NULL,
        start_date DATE,
        target_completion_date DATE,
        weightage_percentage NUMERIC(5,2) DEFAULT 25.00,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Created / verified public.curriculum_terms table');

    // 5. Create / enhance public.teacher_lesson_diary table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.teacher_lesson_diary (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        institution_code VARCHAR(50) DEFAULT 'CBS',
        campus_id UUID,
        academic_session VARCHAR(50) DEFAULT '2026-2027',
        lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,
        class_name VARCHAR(100) NOT NULL,
        section_name VARCHAR(50) NOT NULL DEFAULT 'A',
        subject_id UUID NOT NULL,
        subject_name VARCHAR(150) NOT NULL,
        chapter_id UUID,
        chapter_name VARCHAR(200) NOT NULL,
        term_name VARCHAR(100) DEFAULT 'Term 1',
        assessment_milestone VARCHAR(100) DEFAULT 'FA-1 (Periodic Test 1)',
        period_number INT DEFAULT 1,
        teacher_id UUID,
        teacher_name VARCHAR(150) NOT NULL,
        topic_title VARCHAR(255) NOT NULL,
        learning_objectives TEXT,
        teaching_pedagogy VARCHAR(150) DEFAULT 'Smartboard & Concept Discussion',
        teaching_aids TEXT DEFAULT 'Smartboard, Flashcards, Manipulatives',
        classwork_summary TEXT,
        homework_assigned TEXT,
        real_world_application TEXT,
        student_engagement_level VARCHAR(50) DEFAULT 'High',
        coordinator_status VARCHAR(50) DEFAULT 'Approved',
        coordinator_remarks TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Created / verified public.teacher_lesson_diary table');

    // 6. Check existing curriculum_terms count
    const termsCount = await client.query(`SELECT count(*) as total FROM public.curriculum_terms;`);
    console.log(`📌 6. Existing curriculum_terms count: ${termsCount.rows[0].total}`);

  } catch (err: any) {
    console.error('Migration error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspectAndMigrateCurriculumTerms();
