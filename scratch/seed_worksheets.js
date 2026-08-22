const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function seed() {
  await client.connect();
  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  const subRes = await client.query(`
    SELECT id, class_name, name FROM academic_subjects 
    WHERE class_name IN ('Nursery', 'LKG', 'UKG', 'Grade 1', 'Grade 2')
  `);
  
  const nurserySub = subRes.rows.find(s => s.class_name === 'Nursery') || subRes.rows[0];
  const ukgSub = subRes.rows.find(s => s.class_name === 'UKG') || subRes.rows[0];
  const g1Sub = subRes.rows.find(s => s.class_name === 'Grade 1') || subRes.rows[0];

  const nurserySections = [
    {
      section_name: 'ACTIVITY 1: Tracing & Fine Motor Skills',
      instructions: 'Trace the dotted lines neatly with your favorite crayon.',
      marks_per_question: 5,
      questions: [
        {
          q_num: 1,
          text: 'Trace the straight and wavy lines to help the honeybee reach the flower: 🐝 ~ ~ ~ ~ 🌸',
          marks: 5,
          marking_scheme: 'Full marks for proper crayon hold and steady line tracing.'
        }
      ]
    },
    {
      section_name: 'ACTIVITY 2: Picture & Phonics Sound Match',
      instructions: 'Look at the picture and match with its starting letter.',
      marks_per_question: 5,
      questions: [
        {
          q_num: 2,
          text: 'Match Column A with Column B:\n(a) 🍎 Apple  ➔  [  ] B\n(b) ⚽ Ball   ➔  [  ] A\n(c) 🐱 Cat    ➔  [  ] D\n(d) 🦆 Duck   ➔  [  ] C',
          marks: 5,
          marking_scheme: '1 mark per correct match.'
        }
      ]
    },
    {
      section_name: 'ACTIVITY 3: Count & Circle the Number',
      instructions: 'Count the smiling balloons and circle the correct number.',
      marks_per_question: 5,
      questions: [
        {
          q_num: 3,
          text: 'Count the balloons: 🎈 🎈 🎈 🎈\nOptions: ( 2 )   ( 3 )   ( 4 )   ( 5 )',
          marks: 5,
          options: ['2', '3', '4', '5'],
          correct_answer: '4',
          marking_scheme: 'Correct count = 4.'
        }
      ]
    },
    {
      section_name: 'ACTIVITY 4: Color & Shape Identification',
      instructions: 'Color the circle in Yellow and square in Blue.',
      marks_per_question: 5,
      questions: [
        {
          q_num: 4,
          text: 'Color: [ ⭕ Circle ] in Yellow  and  [ ⬛ Square ] in Blue.',
          marks: 5,
          marking_scheme: 'Correct color inside proper shape outline.'
        }
      ]
    }
  ];

  await client.query(`
    INSERT INTO syllabus_generated_papers (
      campus_id, academic_session, class_name, subject_id, exam_title,
      max_marks, duration_minutes, general_instructions, sections,
      status, created_by
    ) VALUES (
      '${campusId}', '2026-2027', 'Nursery', '${nurserySub.id}',
      'Term 1 Fun Activity & Skill Evaluation Worksheet',
      20, 45,
      $1::jsonb,
      $2::jsonb,
      'Published', 'Mother Teacher (Mrs. Ananya Sen)'
    )
  `, [
    JSON.stringify([
      'Dear Teacher: Read each instruction with a cheerful voice.',
      'Encourage the child to hold the crayon/pencil independently.',
      'Stars and smileys awarded for enthusiasm and fine-motor coordination.'
    ]),
    JSON.stringify(nurserySections)
  ]);

  const ukgSections = [
    {
      section_name: 'SECTION A: Alphabet Phonics & Missing Vowels',
      instructions: 'Fill in the missing vowels and write the 3-letter word.',
      marks_per_question: 5,
      questions: [
        {
          q_num: 1,
          text: 'Look at the pictures and complete the CVC words:\n(i) S _ N  (☀️)\n(ii) C _ T  (🐱)\n(iii) P _ N  (🖊️)\n(iv) H _ T  (🎩)',
          marks: 5,
          marking_scheme: 'Vowels: (i) U (ii) A (iii) E (iv) A'
        }
      ]
    },
    {
      section_name: 'SECTION B: Foundational Numeracy & Number Trains',
      instructions: 'Complete the numbers in the train carriages.',
      marks_per_question: 5,
      questions: [
        {
          q_num: 2,
          text: 'Write the missing numbers in the train carriages:\n[ 11 ] ➔ [  ] ➔ [ 13 ] ➔ [  ] ➔ [ 15 ] ➔ [  ] ➔ [ 17 ]',
          marks: 5,
          marking_scheme: '12, 14, 16'
        }
      ]
    },
    {
      section_name: 'SECTION C: Rhyming Words Match',
      instructions: 'Draw a line to match words that sound the same.',
      marks_per_question: 5,
      questions: [
        {
          q_num: 3,
          text: 'Match Rhyming Words:\n(a) CAT  ➔  [  ] PIN\n(b) BIN  ➔  [  ] HOP\n(c) TOP  ➔  [  ] BAT\n(d) SUN  ➔  [  ] RUN',
          marks: 5,
          marking_scheme: 'CAT-BAT, BIN-PIN, TOP-HOP, SUN-RUN'
        }
      ]
    }
  ];

  await client.query(`
    INSERT INTO syllabus_generated_papers (
      campus_id, academic_session, class_name, subject_id, exam_title,
      max_marks, duration_minutes, general_instructions, sections,
      status, created_by
    ) VALUES (
      '${campusId}', '2026-2027', 'UKG', '${ukgSub.id}',
      'Foundational Skill & Activity Evaluation Worksheet',
      25, 60,
      $1::jsonb,
      $2::jsonb,
      'Published', 'Mother Teacher (Ms. Priya Rawat)'
    )
  `, [
    JSON.stringify([
      'Read questions clearly to the student.',
      'Use four-line guidelines for writing practice.',
      'Evaluation covers concept mastery and pencil control.'
    ]),
    JSON.stringify(ukgSections)
  ]);

  const g1Sections = [
    {
      section_name: 'SECTION A: Visual Picture Addition & Subtraction',
      instructions: 'Count the pictures and write the total in the box.',
      marks_per_question: 5,
      questions: [
        {
          q_num: 1,
          text: 'Add the items:\n(a) 🍎🍎🍎 + 🍎🍎 = [      ] Apples\n(b) 🚗🚗🚗🚗 + 🚗🚗🚗 = [      ] Cars\n(c) 8 - 3 = [      ]',
          marks: 5,
          marking_scheme: '(a) 5 (b) 7 (c) 5'
        }
      ]
    },
    {
      section_name: 'SECTION B: Number Names & Place Values',
      instructions: 'Write the number names and place value expansions.',
      marks_per_question: 5,
      questions: [
        {
          q_num: 2,
          text: 'Write in words:\n(a) 15 = ________________________\n(b) 20 = ________________________\n(c) 43 = ______ Tens + ______ Ones',
          marks: 5,
          marking_scheme: 'Fifteen, Twenty, 4 Tens + 3 Ones'
        }
      ]
    }
  ];

  await client.query(`
    INSERT INTO syllabus_generated_papers (
      campus_id, academic_session, class_name, subject_id, exam_title,
      max_marks, duration_minutes, general_instructions, sections,
      status, created_by
    ) VALUES (
      '${campusId}', '2026-2027', 'Grade 1', '${g1Sub.id}',
      'Grade 1 Formative Worksheet Evaluation',
      30, 60,
      $1::jsonb,
      $2::jsonb,
      'Published', 'Mother Teacher (Mrs. Sarah Newton)'
    )
  `, [
    JSON.stringify([
      'All questions are compulsory.',
      'Write neatly in the answer boxes provided.',
      'Use ruler for matching lines.'
    ]),
    JSON.stringify(g1Sections)
  ]);

  console.log('✅ Successfully seeded Early Years Worksheets in Database!');
  await client.end();
}

seed().catch(console.error);
