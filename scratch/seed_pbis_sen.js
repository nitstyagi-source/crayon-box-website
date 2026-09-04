const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function seedDemo() {
  const stus = await pool.query("SELECT id, first_name, last_name FROM public.students WHERE status = 'ACTIVE' LIMIT 10");
  console.log('Sample students count:', stus.rows.length);

  const houses = ['PHOENIX', 'PEGASUS', 'GRIFFIN', 'DRAGON'];
  for (let i = 0; i < stus.rows.length; i++) {
    const h = houses[i % 4];
    await pool.query("UPDATE public.students SET house = $1 WHERE id = $2", [h, stus.rows[i].id]);
  }

  const s1 = stus.rows[0];
  const s2 = stus.rows[1];
  const s3 = stus.rows[2];

  const hDrag = await pool.query("SELECT id FROM public.school_houses WHERE code='DRAGON'");
  const hPeg = await pool.query("SELECT id FROM public.school_houses WHERE code='PEGASUS'");
  const hPho = await pool.query("SELECT id FROM public.school_houses WHERE code='PHOENIX'");

  await pool.query(`
    INSERT INTO public.pbis_point_transactions (student_id, student_name, class_name, house_id, house_code, awarded_by_name, merit_name, category, points, reason)
    VALUES
      ($1, $2, 'Class 10A', $3, 'DRAGON', 'Ms. Pooja Sharma', 'Exemplary Subject Diligence & Curiosity', 'ACADEMIC', 15, 'Led an outstanding physics project on solar photovoltaics.'),
      ($4, $5, 'Class 9B', $6, 'PEGASUS', 'Dr. Rajesh Verma', 'Outstanding Empathy & Inclusion of Peer', 'KINDNESS', 15, 'Supported new student during lab rotation with remarkable patience.'),
      ($7, $8, 'Class 8A', $9, 'PHOENIX', 'Mr. Amit Kumar', 'Proactive Assembly or Event Leadership', 'LEADERSHIP', 20, 'Anchored the National Science Day symposium flawlessly.')
  `, [
    s1.id, s1.first_name + ' ' + s1.last_name, hDrag.rows[0].id,
    s2.id, s2.first_name + ' ' + s2.last_name, hPeg.rows[0].id,
    s3.id, s3.first_name + ' ' + s3.last_name, hPho.rows[0].id
  ]);

  const p1 = await pool.query(`
    INSERT INTO public.sen_student_profiles (student_id, student_name, class_name, primary_category, case_status, lead_specialist_name, shadow_educator_name, formal_diagnosis_date, general_summary)
    VALUES ($1, $2, 'Class 9B', 'Dyslexia & Phonological Processing', 'ACTIVE', 'Dr. Sunita Rao (SEN Specialist)', 'Ms. Vandana Seth', '2025-08-15', 'Mild-to-moderate phonological decoding challenge with high verbal reasoning and spatial intelligence.')
    ON CONFLICT (student_id) DO UPDATE SET updated_at = NOW()
    RETURNING id;
  `, [s2.id, s2.first_name + ' ' + s2.last_name]);

  const prof1Id = p1.rows[0].id;
  await pool.query(`
    INSERT INTO public.sen_accommodations (sen_profile_id, title, category, is_active, details)
    VALUES
      ($1, '25% Additional Examination Time', 'EXAM', true, 'Applicable for all written exams exceeding 1 hour duration.'),
      ($1, 'Digital Text-to-Speech & Font Sizing', 'CLASSROOM', true, 'Permitted to use school tablet with OpenDyslexic font.'),
      ($1, 'Separate Low-Distraction Test Room', 'EXAM', true, 'Allocated to Resource Room B during term examinations.')
    ON CONFLICT DO NOTHING;
  `, [prof1Id]);

  await pool.query(`
    INSERT INTO public.sen_smart_goals (sen_profile_id, domain, goal_title, baseline_level, target_criterion, progress_percentage, status, target_date)
    VALUES
      ($1, 'ACADEMIC_LITERACY', 'Decoding Multisyllabic Academic Text', 'Reads at 65 wpm with 12% phonetic errors', 'Achieve 95+ wpm at 95% accuracy on grade-level comprehension', 70, 'IN_PROGRESS', '2026-11-30'),
      ($1, 'FOCUS_AND_EXECUTIVE', 'Self-Editing with Structured Checklists', 'Submits draft assignments with missing punctuation/syntax', 'Independently applies 4-step proofreading rubric before turning in', 85, 'IN_PROGRESS', '2026-10-15')
    ON CONFLICT DO NOTHING;
  `, [prof1Id]);

  await pool.query(`
    INSERT INTO public.sen_session_logs (sen_profile_id, specialist_name, therapy_type, session_date, duration_minutes, key_observations, recommendations_for_teachers)
    VALUES
      ($1, 'Dr. Sunita Rao', 'Remedial Reading & Phonology', CURRENT_DATE, 45, 'Strong mastery of Greek/Latin root morphology. Confidence visibly improving.', 'Allow verbal oral summaries when written homework load is heavy.')
    ON CONFLICT DO NOTHING;
  `, [prof1Id]);

  console.log('Seed executed successfully!');
  pool.end();
}

seedDemo().catch(err => { console.error('Seed error:', err); pool.end(); });
