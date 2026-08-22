const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initSurveys() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS survey_forms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      form_code VARCHAR(50) UNIQUE NOT NULL,
      title VARCHAR(250) NOT NULL,
      form_type VARCHAR(50) NOT NULL DEFAULT 'Feedback',
      description TEXT,
      target_audience VARCHAR(100) DEFAULT 'All Parents',
      start_date DATE NOT NULL DEFAULT CURRENT_DATE,
      end_date DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'Active',
      is_anonymous BOOLEAN DEFAULT false,
      allow_multiple_responses BOOLEAN DEFAULT false,
      require_login BOOLEAN DEFAULT true,
      qr_code_token VARCHAR(100) UNIQUE NOT NULL,
      total_responses INTEGER DEFAULT 0,
      average_rating NUMERIC(3,2) DEFAULT 4.7,
      questions JSONB DEFAULT '[]'::jsonb,
      created_by VARCHAR(150) DEFAULT 'Principal & Academic Head',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS survey_responses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      form_id UUID REFERENCES survey_forms(id) ON DELETE CASCADE,
      form_code VARCHAR(50) NOT NULL,
      responder_id UUID,
      responder_name VARCHAR(150),
      responder_role VARCHAR(50) DEFAULT 'Parent',
      class_name VARCHAR(50),
      overall_rating INTEGER,
      answers JSONB NOT NULL,
      written_feedback TEXT,
      action_status VARCHAR(50) DEFAULT 'New',
      action_notes TEXT,
      escalated_to_ticket BOOLEAN DEFAULT false,
      ticket_number VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS survey_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_name VARCHAR(150) NOT NULL,
      category VARCHAR(50) NOT NULL,
      description TEXT,
      questions JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_surv_status ON survey_forms(status);
    CREATE INDEX IF NOT EXISTS idx_surv_resp_fid ON survey_responses(form_id);
  `);

  console.log('✅ Created survey_forms, survey_responses, and survey_templates tables!');

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  // 1. Seed Active Forms
  const forms = [
    {
      code: 'SURV-2026-0041',
      title: 'Term 1 Parent Satisfaction & Academic Quality Survey',
      type: 'Feedback',
      desc: 'Annual evaluation of teaching standards, school safety, homework load, digital diary, and communication.',
      audience: 'All Parents',
      start: '2026-08-15',
      end: '2026-08-30',
      status: 'Active',
      anon: false,
      token: 'QR-SURV-TERM1-2026',
      totalResp: 420,
      avgRating: 4.72,
      questions: [
        { id: 'q1', type: 'star_rating', title: 'How satisfied are you with overall academic progress this term?', required: true },
        { id: 'q2', type: 'star_rating', title: 'How would you rate the class teacher engagement and communication?', required: true },
        { id: 'q3', type: 'checkboxes', title: 'Which school facilities does your child enjoy the most?', options: ['Robotics & AI Lab', 'Sports & Swimming', 'Smart Digital Library', 'Music & Theater', 'Canteen Meals'], required: true },
        { id: 'q4', type: 'conditional_yes_no', title: 'Have all your school queries/complaints been resolved promptly?', followUpPrompt: 'Please explain what is still pending resolution:', required: true },
        { id: 'q5', type: 'long_text', title: 'Any suggestions or improvements for the upcoming term?', required: false }
      ]
    },
    {
      code: 'SURV-2026-0042',
      title: 'Abacus & Vedic Mathematics Program Feasibility Survey',
      type: 'Survey',
      desc: 'Exploring parent demand and preferred schedule for introducing certified Abacus mental math classes.',
      audience: 'Grade 1–5 Parents',
      start: '2026-08-20',
      end: '2026-09-05',
      status: 'Active',
      anon: false,
      token: 'QR-SURV-ABACUS-2026',
      totalResp: 185,
      avgRating: 4.80,
      questions: [
        { id: 'q1', type: 'multiple_choice', title: 'Would you like the school to introduce certified Abacus & Mental Math classes?', options: ['Yes, highly interested', 'Maybe / Depends on timing', 'No, not required'], required: true },
        { id: 'q2', type: 'multiple_choice', title: 'What monthly fee bracket would you prefer for weekly twice 45-min sessions?', options: ['₹ 150 / month', '₹ 200 / month', '₹ 250 / month', '₹ 300 / month'], required: true },
        { id: 'q3', type: 'checkboxes', title: 'Which days would be most convenient for your child?', options: ['Monday & Wednesday (Post-School 2:30 PM)', 'Tuesday & Thursday (Post-School 2:30 PM)', 'Saturday Morning (9:00 AM)'], required: true }
      ]
    },
    {
      code: 'SURV-2026-0043',
      title: 'Annual Sports Day & Cultural Fest Venue Feedback',
      type: 'Feedback',
      desc: 'Visitor and parent review of event organization, stage performances, seating, and refreshments.',
      audience: 'All Parents & Visitors',
      start: '2026-08-10',
      end: '2026-08-25',
      status: 'Active',
      anon: true,
      token: 'QR-SURV-SPORTSFEST-2026',
      totalResp: 235,
      avgRating: 4.88,
      questions: [
        { id: 'q1', type: 'star_rating', title: 'Rate the overall student performance and drill synchronization:', required: true },
        { id: 'q2', type: 'emoji_rating', title: 'How was the guest hospitality and seating arrangement?', options: ['😍 Excellent', '😊 Good', '😐 Average', '😞 Needs Improvement'], required: true },
        { id: 'q3', type: 'long_text', title: 'Share your favorite highlight of the day:', required: false }
      ]
    }
  ];

  for (const f of forms) {
    const res = await client.query(`
      INSERT INTO survey_forms (
        campus_id, form_code, title, form_type, description, target_audience,
        start_date, end_date, status, is_anonymous, qr_code_token, total_responses,
        average_rating, questions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (form_code) DO UPDATE SET total_responses = EXCLUDED.total_responses
      RETURNING id;
    `, [
      campusId, f.code, f.title, f.type, f.desc, f.audience, f.start,
      f.end, f.status, f.anon, f.token, f.totalResp, f.avgRating, JSON.stringify(f.questions)
    ]);

    const formId = res.rows[0].id;

    // Seed sample responses for Term 1 survey
    if (f.code === 'SURV-2026-0041') {
      const sampleAnswers = [
        {
          name: 'Nitin Tyagi',
          role: 'Parent',
          cls: 'Grade 5-A',
          rating: 5,
          ans: { q1: 5, q2: 5, q3: ['Robotics & AI Lab', 'Sports & Swimming'], q4: 'Yes' },
          fb: 'The digital diary updates every evening are extremely helpful. Teachers are very attentive.',
          status: 'Action Taken',
          notes: 'Feedback acknowledged. Teacher appreciated in staff meeting.'
        },
        {
          name: 'Rekha Gupta',
          role: 'Parent',
          cls: 'Grade 3-B',
          rating: 4,
          ans: { q1: 4, q2: 5, q3: ['Smart Digital Library', 'Canteen Meals'], q4: 'Yes' },
          fb: 'Would love more inter-house sports competitions for grade 3 students.',
          status: 'Under Review',
          notes: 'Passed to Sports Department for Term 2 sports calendar inclusion.'
        },
        {
          name: 'Rohan Mehra (Parent)',
          role: 'Parent',
          cls: 'Grade 4-B',
          rating: 2,
          ans: { q1: 2, q2: 3, q3: ['Music & Theater'], q4: 'No', q4_followup: 'Bus timing delay on route 2 morning route' },
          fb: 'Bus route 2 has been delayed by 15 minutes twice this week.',
          status: 'New',
          notes: 'Auto-escalated to Helpdesk Ticket #TKT-2026-00458 for Transport Manager resolution.',
          ticket: true,
          tNum: 'TKT-2026-00458'
        }
      ];

      for (const a of sampleAnswers) {
        await client.query(`
          INSERT INTO survey_responses (
            form_id, form_code, responder_name, responder_role, class_name,
            overall_rating, answers, written_feedback, action_status, action_notes,
            escalated_to_ticket, ticket_number
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          formId, f.code, a.name, a.role, a.cls, a.rating,
          JSON.stringify(a.ans), a.fb, a.status, a.notes, a.ticket || false, a.tNum || null
        ]);
      }
    }
  }

  // Seed Form Templates
  const templates = [
    {
      name: 'Parent Satisfaction Annual Survey',
      cat: 'Parent',
      desc: 'Standard CBSE/CISCE parent satisfaction survey template with 5-star scoring across academics, safety, and infra.',
      questions: [
        { id: 'q1', type: 'star_rating', title: 'Overall academic instruction and homework pacing:' },
        { id: 'q2', type: 'star_rating', title: 'Campus safety, security and transport hygiene:' },
        { id: 'q3', type: 'star_rating', title: 'Teacher responsiveness and parent-teacher communication:' },
        { id: 'q4', type: 'long_text', title: 'Specific suggestions for improvement:' }
      ]
    },
    {
      name: 'PTM Follow-up & Teacher Feedback',
      cat: 'Parent',
      desc: 'Quick 2-minute feedback collected immediately after Parent-Teacher Meetings via QR code at classroom doors.',
      questions: [
        { id: 'q1', type: 'star_rating', title: 'Was the discussion on child progress fruitful and constructive?' },
        { id: 'q2', type: 'multiple_choice', title: 'Were all subject teachers accessible without long queues?', options: ['Yes, seamless', 'Moderate wait time', 'No, had to wait too long'] },
        { id: 'q3', type: 'long_text', title: 'Additional remarks or special attention required in subjects:' }
      ]
    },
    {
      name: 'Field Trip Consent & Medical Declaration',
      cat: 'Consent',
      desc: 'Parent authorization for external educational excursions with emergency contact and dietary declaration.',
      questions: [
        { id: 'q1', type: 'multiple_choice', title: 'Do you give consent for your child to participate in the Science Center excursion?', options: ['Yes, I grant full permission', 'No, I decline'] },
        { id: 'q2', type: 'multiple_choice', title: 'Dietary Preference for packed lunch:', options: ['Vegetarian', 'Jain Meal', 'Non-Vegetarian'] },
        { id: 'q3', type: 'short_text', title: 'Emergency Parent Contact Mobile:' }
      ]
    }
  ];

  for (const t of templates) {
    await client.query(`
      INSERT INTO survey_templates (template_name, category, description, questions)
      VALUES ($1, $2, $3, $4)
    `, [t.name, t.cat, t.desc, JSON.stringify(t.questions)]);
  }

  console.log('✅ Seeded survey forms, responses, and reusable templates successfully!');
  await client.end();
}

initSurveys().catch(console.error);
