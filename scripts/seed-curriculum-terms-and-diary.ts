import pg from 'pg';

const pool = new pg.Pool({ 
  connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function seedTermsAndDiary() {
  console.log('🔍 ========================================================');
  console.log('🔍 SEEDING STANDARD CBSE / NEP TERMS & LESSON DIARY');
  console.log('🔍 ========================================================\n');

  const client = await pool.connect();
  try {
    // 1. Seed standard curriculum_terms
    await client.query(`DELETE FROM public.curriculum_terms WHERE institution_code = 'CBS' OR institution_code = 'ALL';`);

    const standardTerms = [
      {
        term_name: 'Term 1',
        term_code: 'T1_FA1',
        assessment_type: 'FORMATIVE',
        milestone_label: 'Formative Assessment 1 (FA-1 / Periodic Test 1)',
        start_date: '2026-04-01',
        target_completion_date: '2026-07-15',
        weightage_percentage: 10.00
      },
      {
        term_name: 'Term 1',
        term_code: 'T1_FA2',
        assessment_type: 'FORMATIVE',
        milestone_label: 'Formative Assessment 2 (FA-2 / Periodic Test 2)',
        start_date: '2026-07-16',
        target_completion_date: '2026-09-10',
        weightage_percentage: 10.00
      },
      {
        term_name: 'Term 1',
        term_code: 'T1_SA1',
        assessment_type: 'SUMMATIVE',
        milestone_label: 'Summative Assessment 1 (SA-1 / Half-Yearly Exam)',
        start_date: '2026-09-11',
        target_completion_date: '2026-09-30',
        weightage_percentage: 30.00
      },
      {
        term_name: 'Term 2',
        term_code: 'T2_FA3',
        assessment_type: 'FORMATIVE',
        milestone_label: 'Formative Assessment 3 (FA-3 / Periodic Test 3)',
        start_date: '2026-10-01',
        target_completion_date: '2026-11-30',
        weightage_percentage: 10.00
      },
      {
        term_name: 'Term 2',
        term_code: 'T2_FA4',
        assessment_type: 'FORMATIVE',
        milestone_label: 'Formative Assessment 4 (FA-4 / Periodic Test 4)',
        start_date: '2026-12-01',
        target_completion_date: '2027-01-31',
        weightage_percentage: 10.00
      },
      {
        term_name: 'Term 2',
        term_code: 'T2_SA2',
        assessment_type: 'SUMMATIVE',
        milestone_label: 'Summative Assessment 2 (SA-2 / Annual Final Exam)',
        start_date: '2027-02-01',
        target_completion_date: '2027-03-25',
        weightage_percentage: 30.00
      }
    ];

    for (const t of standardTerms) {
      await client.query(`
        INSERT INTO public.curriculum_terms (
          institution_code, academic_session, term_name, term_code,
          assessment_type, milestone_label, start_date, target_completion_date,
          weightage_percentage, status
        ) VALUES (
          'CBS', '2026-2027', $1, $2, $3, $4, $5, $6, $7, 'Active'
        );
      `, [
        t.term_name, t.term_code, t.assessment_type, t.milestone_label,
        t.start_date, t.target_completion_date, t.weightage_percentage
      ]);
    }
    console.log('✅ Seeded 6 Standard Terms & Assessment Milestones (FA-1, FA-2, SA-1, FA-3, FA-4, SA-2)');

    // 2. Instant Bulk Map all chapters in syllabus_chapters to Terms & Milestones
    const updRes = await client.query(`
      UPDATE public.syllabus_chapters
      SET 
        term_name = CASE 
          WHEN chapter_number <= 6 THEN 'Term 1'
          ELSE 'Term 2'
        END,
        assessment_milestone = CASE
          WHEN chapter_number IN (1, 2) THEN 'Formative Assessment 1 (FA-1 / Periodic Test 1)'
          WHEN chapter_number IN (3, 4) THEN 'Formative Assessment 2 (FA-2 / Periodic Test 2)'
          WHEN chapter_number IN (5, 6) THEN 'Summative Assessment 1 (SA-1 / Half-Yearly Exam)'
          WHEN chapter_number IN (7, 8) THEN 'Formative Assessment 3 (FA-3 / Periodic Test 3)'
          WHEN chapter_number IN (9, 10) THEN 'Formative Assessment 4 (FA-4 / Periodic Test 4)'
          ELSE 'Summative Assessment 2 (SA-2 / Annual Final Exam)'
        END,
        target_month = CASE
          WHEN chapter_number IN (1, 2) THEN 'April - July'
          WHEN chapter_number IN (3, 4) THEN 'July - September'
          WHEN chapter_number IN (5, 6) THEN 'September'
          WHEN chapter_number IN (7, 8) THEN 'October - November'
          WHEN chapter_number IN (9, 10) THEN 'December - January'
          ELSE 'February - March'
        END;
    `);
    console.log(`✅ Bulk updated ${updRes.rowCount} syllabus chapters to Term 1 & Term 2.`);

    // 3. Seed initial Teacher Lesson Diary Entries
    const sampleChapters = await client.query(`
      SELECT sc.id as chapter_id, sc.chapter_name, sc.term_name, sc.assessment_milestone,
             s.id as subject_id, s.name as subject_name, s.class_name, s.teacher_name, s.campus_id
      FROM public.syllabus_chapters sc
      JOIN public.academic_subjects s ON s.id = sc.subject_id
      LIMIT 15;
    `);

    const diaryEntriesCount = await client.query(`SELECT count(*) as total FROM public.teacher_lesson_diary;`);
    if (parseInt(diaryEntriesCount.rows[0].total, 10) === 0) {
      for (let i = 0; i < sampleChapters.rows.length; i++) {
        const row = sampleChapters.rows[i];
        const obj = `Master core concepts of ${row.chapter_name}, solve analytical problem sets.`;
        const topic = `Concept Fundamentals & Practice Set ${i + 1}`;
        const hw = `Solve practice worksheet problems on page ${20 + i}`;
        const periodNum = (i % 6) + 1;

        await client.query(`
          INSERT INTO public.teacher_lesson_diary (
            institution_code, campus_id, academic_session, lesson_date,
            class_name, section_name, subject_id, subject_name,
            chapter_id, chapter_name, term_name, assessment_milestone,
            period_number, teacher_name, topic_title, learning_objectives,
            teaching_pedagogy, teaching_aids, classwork_summary, homework_assigned,
            real_world_application, coordinator_status
          ) VALUES (
            'CBS', $1, '2026-2027', CURRENT_DATE - INTERVAL '${i} days',
            $2, 'A', $3, $4,
            $5, $6, $7, $8,
            $9, $10, $11, $12,
            'Smartboard & Concept Discussion', 'Smartboard, Workbook, Manipulatives',
            'Completed textbook exercises Q1-Q10 and group discussion.',
            $13,
            'Demonstrated practical real-world application in daily life.',
            'Approved'
          );
        `, [
          row.campus_id, row.class_name, row.subject_id, row.subject_name,
          row.chapter_id, row.chapter_name, row.term_name, row.assessment_milestone,
          periodNum, row.teacher_name || 'Dr. Sunita Sharma',
          topic, obj, hw
        ]);
      }
      console.log(`✅ Seeded ${sampleChapters.rows.length} initial Teacher Lesson Diary records.`);
    }

  } catch (err: any) {
    console.error('Seeding error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedTermsAndDiary();
