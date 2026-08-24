import pg from 'pg';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

function calculateGrade(pct: number): { grade: string; gp: number } {
  if (pct >= 91) return { grade: 'A1', gp: 10.0 };
  if (pct >= 81) return { grade: 'A2', gp: 9.0 };
  if (pct >= 71) return { grade: 'B1', gp: 8.0 };
  if (pct >= 61) return { grade: 'B2', gp: 7.0 };
  if (pct >= 51) return { grade: 'C1', gp: 6.0 };
  if (pct >= 41) return { grade: 'C2', gp: 5.0 };
  if (pct >= 33) return { grade: 'D', gp: 4.0 };
  return { grade: 'E', gp: 0.0 };
}

async function seedFastExamMarks() {
  const client = await pool.connect();
  console.log('⏳ Fast Seeding Multi-Curriculum Examination Marks in PostgreSQL...');

  const stuRes = await client.query(`
    SELECT s.id, s.first_name, s.last_name, s.admission_no, s.universal_id,
           COALESCE(c.grade, 'Class 1') as class_name
    FROM public.students s
    LEFT JOIN public.classes c ON c.id = s.class_id
    WHERE s.status = 'ACTIVE'
  `);
  const students = stuRes.rows;

  const subjects = [
    'English Literature',
    'Mathematics',
    'Science & Physics',
    'Social Science & History',
    'Hindi Language',
    'Computer Science & AI'
  ];

  const terms = ['Term 1 (Half Yearly Examination)', 'Term 2 (Annual Final Examination)'];

  await client.query(`
    DELETE FROM public.student_exam_marks;
    DELETE FROM public.student_coscholastic_evaluations;
    DELETE FROM public.montessori_milestone_evaluations;
  `);

  const markValuesClauses: string[] = [];
  const markParams: any[] = [];

  const coschValuesClauses: string[] = [];
  const coschParams: any[] = [];

  const montValuesClauses: string[] = [];
  const montParams: any[] = [];

  for (let sIdx = 0; sIdx < students.length; sIdx++) {
    const stu = students[sIdx];
    const isMontessori = stu.class_name.toLowerCase().includes('nursery') || stu.class_name.toLowerCase().includes('kg');
    const instCode = stu.admission_no?.startsWith('CBPS') ? 'CBPS' : stu.admission_no?.startsWith('AS') ? 'AS' : stu.admission_no?.startsWith('AVM') ? 'AVM' : 'CBS';

    for (const term of terms) {
      if (isMontessori) {
        const baseIdx = montParams.length;
        montValuesClauses.push(
          `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4}, $${baseIdx + 5}, $${baseIdx + 6}, $${baseIdx + 7}, $${baseIdx + 8}, $${baseIdx + 9}, $${baseIdx + 10})`
        );
        montParams.push(
          stu.id, '2026–2027', term.includes('Term 1') ? 'Term 1' : 'Term 2',
          'MASTERED', 'MASTERED', 'PRACTICING', 'PRACTICING', 'PRESENTED', 'MASTERED',
          'Demonstrates natural curiosity, joyful collaboration with peers, and fine motor precision.'
        );
      } else {
        // CBSE Scholastic 6 Subjects
        for (let subIdx = 0; subIdx < subjects.length; subIdx++) {
          const sub = subjects[subIdx];
          
          const baseSeed = (sIdx * 7 + subIdx * 11) % 25;
          const pt = 8.0 + (baseSeed % 3) * 0.5;
          const ma = 4.0 + (baseSeed % 2) * 0.5;
          const pf = 4.5 + (baseSeed % 2) * 0.5;
          const se = 4.5 + (baseSeed % 2) * 0.5;
          const th = 62.0 + (baseSeed % 18);

          const total = Math.min(100, Math.round((pt + ma + pf + se + th) * 10) / 10);
          const { grade, gp } = calculateGrade(total);

          const baseIdx = markParams.length;
          markValuesClauses.push(
            `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4}, $${baseIdx + 5}, $${baseIdx + 6}, $${baseIdx + 7}, $${baseIdx + 8}, $${baseIdx + 9}, $${baseIdx + 10}, $${baseIdx + 11}, $${baseIdx + 12}, $${baseIdx + 13}, $${baseIdx + 14}, $${baseIdx + 15}, $${baseIdx + 16}, $${baseIdx + 17})`
          );
          markParams.push(
            stu.id, '2026–2027', instCode, stu.class_name, 'A', term, sub,
            pt, ma, pf, se, th, total, 100, grade, gp, 'APPROVED'
          );
        }

        // Co-Scholastic
        const coschBaseIdx = coschParams.length;
        coschValuesClauses.push(
          `($${coschBaseIdx + 1}, $${coschBaseIdx + 2}, $${coschBaseIdx + 3}, $${coschBaseIdx + 4}, $${coschBaseIdx + 5}, $${coschBaseIdx + 6}, $${coschBaseIdx + 7}, $${coschBaseIdx + 8}, $${coschBaseIdx + 9})`
        );
        coschParams.push(
          stu.id, '2026–2027', term, 'A', 'A', 'A', 'A', 96.2,
          'Consistent academic performer with strong analytical reasoning and leadership in group projects.'
        );
      }
    }
  }

  // Execute Batch Inserts
  if (markValuesClauses.length > 0) {
    await client.query(`
      INSERT INTO public.student_exam_marks (
        student_id, academic_session, institution_code, class_name, section_name,
        exam_term, subject_name, periodic_test_marks, multiple_assessment_marks,
        portfolio_marks, subject_enrichment_marks, theory_exam_marks,
        total_marks_obtained, max_marks, grade, grade_point, status
      ) VALUES ${markValuesClauses.join(', ')}
      ON CONFLICT DO NOTHING;
    `, markParams);
  }

  if (coschValuesClauses.length > 0) {
    await client.query(`
      INSERT INTO public.student_coscholastic_evaluations (
        student_id, academic_session, exam_term,
        work_education_grade, art_education_grade,
        health_physical_education_grade, discipline_grade,
        attendance_percentage, class_teacher_remarks
      ) VALUES ${coschValuesClauses.join(', ')}
      ON CONFLICT DO NOTHING;
    `, coschParams);
  }

  if (montValuesClauses.length > 0) {
    await client.query(`
      INSERT INTO public.montessori_milestone_evaluations (
        student_id, academic_session, evaluation_term,
        practical_life_status, sensorial_refinement_status,
        language_phonetics_status, mathematical_mind_status,
        cultural_cosmic_status, socio_emotional_status,
        guide_observation_notes
      ) VALUES ${montValuesClauses.join(', ')}
      ON CONFLICT DO NOTHING;
    `, montParams);
  }

  console.log(`✅ Successfully batch-seeded ${markValuesClauses.length} scholastic marks, ${coschValuesClauses.length} co-scholastic entries, and ${montValuesClauses.length} Montessori portfolios in < 1 second!`);
  client.release();
  await pool.end();
}

seedFastExamMarks().catch(console.error);
