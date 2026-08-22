const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initRecruitment() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS job_vacancies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      job_code VARCHAR(50) UNIQUE NOT NULL,
      title VARCHAR(200) NOT NULL,
      department VARCHAR(100) NOT NULL,
      category VARCHAR(50) DEFAULT 'Teaching',
      subject VARCHAR(150),
      classes VARCHAR(100),
      branch VARCHAR(100) DEFAULT 'Main Campus',
      vacancies_count INTEGER DEFAULT 1,
      min_qualification VARCHAR(200) NOT NULL,
      experience_required VARCHAR(100) NOT NULL,
      salary_range VARCHAR(100),
      job_description TEXT,
      skills_required TEXT,
      application_deadline DATE,
      status VARCHAR(50) DEFAULT 'Open',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS job_applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      vacancy_id UUID REFERENCES job_vacancies(id) ON DELETE SET NULL,
      candidate_code VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL,
      mobile VARCHAR(50) NOT NULL,
      dob DATE,
      gender VARCHAR(20),
      current_location VARCHAR(150),
      position_applied VARCHAR(200) NOT NULL,
      highest_qualification VARCHAR(200) NOT NULL,
      experience_years NUMERIC(4,1) DEFAULT 0,
      current_employer VARCHAR(200),
      current_salary VARCHAR(100),
      expected_salary VARCHAR(100),
      notice_period_days INTEGER DEFAULT 30,
      resume_url TEXT,
      photo_url TEXT,
      certificates_url TEXT,
      source VARCHAR(100) DEFAULT 'School Website',
      status VARCHAR(50) DEFAULT 'Applied',
      rating INTEGER DEFAULT 4,
      hr_notes TEXT,
      assigned_hr VARCHAR(150) DEFAULT 'HR Command',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS job_interviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
      round_type VARCHAR(100) DEFAULT 'HR Round',
      scheduled_date DATE NOT NULL,
      scheduled_time VARCHAR(20) NOT NULL,
      interviewer_name VARCHAR(150) NOT NULL,
      venue_or_link VARCHAR(250) DEFAULT 'Main Campus - HR Boardroom',
      demo_subject VARCHAR(100),
      demo_class VARCHAR(50),
      demo_topic VARCHAR(200),
      evaluation_score NUMERIC(4,2),
      evaluation_criteria JSONB DEFAULT '{"subjectKnowledge": 4, "communication": 5, "teachingSkills": 4, "classroomManagement": 4, "confidence": 5}'::jsonb,
      recommendation VARCHAR(50) DEFAULT 'Recommended',
      remarks TEXT,
      status VARCHAR(50) DEFAULT 'Scheduled',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS job_offers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
      offer_letter_number VARCHAR(100) UNIQUE NOT NULL,
      designation VARCHAR(150) NOT NULL,
      department VARCHAR(100) NOT NULL,
      joining_date DATE NOT NULL,
      offered_salary_monthly NUMERIC(10,2) NOT NULL,
      offered_ctc_annual NUMERIC(12,2) NOT NULL,
      reporting_manager VARCHAR(150) DEFAULT 'Principal & Managing Director',
      work_location VARCHAR(150) DEFAULT 'Crayon Box School Main Campus',
      terms_and_conditions TEXT,
      status VARCHAR(50) DEFAULT 'Offer Sent',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_vacancies_status ON job_vacancies(status);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);
    CREATE INDEX IF NOT EXISTS idx_applications_vac ON job_applications(vacancy_id);
  `);

  console.log('✅ Created job_vacancies, job_applications, job_interviews, job_offers tables!');

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  // 1. Seed Sample Vacancies
  const vacancies = [
    {
      code: 'CBS-JOB-2026-01',
      title: 'PRT Mathematics Teacher',
      department: 'Mathematics & STEM',
      category: 'Teaching',
      subject: 'Mathematics',
      classes: 'Grade 1 to 5',
      branch: 'Main Campus',
      count: 2,
      qual: 'B.Sc / M.Sc in Mathematics with B.Ed & CTET',
      exp: '2+ Years in reputed CBSE/ICSE school',
      salary: '₹40,000 - ₹55,000 / month',
      desc: 'Responsible for delivering conceptual mathematics instruction for primary classes using activity-based learning and smart board tools.',
      skills: 'Lesson Planning, Singapore Math Techniques, Child Psychology, Smart Class Operation',
      deadline: '2026-09-15'
    },
    {
      code: 'CBS-JOB-2026-02',
      title: 'TGT English Educator',
      department: 'Languages & Humanities',
      category: 'Teaching',
      subject: 'English Literature & Grammar',
      classes: 'Grade 6 to 8',
      branch: 'Main Campus',
      count: 2,
      qual: 'B.A / M.A in English Literature with B.Ed',
      exp: '3+ Years teaching middle school English',
      salary: '₹45,000 - ₹60,000 / month',
      desc: 'Guide students through creative writing, communicative English, phonetics, and CBSE curriculum literature.',
      skills: 'Fluency in English, Debate Coaching, Creative Writing, Phonics',
      deadline: '2026-09-20'
    },
    {
      code: 'CBS-JOB-2026-03',
      title: 'Senior Kindergarten / Pre-Primary Educator',
      department: 'Early Childhood Education',
      category: 'Teaching',
      subject: 'Early Childhood Foundations',
      classes: 'Nursery, LKG, UKG',
      branch: 'Main Campus',
      count: 3,
      qual: 'NTT / ECCE Diploma or B.Ed (Nursery)',
      exp: '1-3 Years in early childhood pedagogy',
      salary: '₹30,000 - ₹42,000 / month',
      desc: 'Nurture kindergarten learners through Montessori activities, sensory play, storytelling, and phonics foundation.',
      skills: 'Montessori Methods, Patience, Puppet Theatre, Rhymes & Art',
      deadline: '2026-09-30'
    },
    {
      code: 'CBS-JOB-2026-04',
      title: 'Senior School Accountant & ERP Administrator',
      department: 'Finance & Accounts',
      category: 'Non-Teaching',
      subject: 'Accounting & Payroll',
      classes: 'Administration',
      branch: 'Main Campus',
      count: 1,
      qual: 'B.Com / M.Com with Tally Prime & ERP expertise',
      exp: '3+ Years handling school fee collections & payroll',
      salary: '₹35,000 - ₹50,000 / month',
      desc: 'Manage fee reconciliation, staff payroll calculations, vendor invoices, and compliance audits.',
      skills: 'Tally Prime, GST Compliance, Excel Advanced, School ERP',
      deadline: '2026-09-10'
    }
  ];

  const vacMap = {};
  for (const v of vacancies) {
    const res = await client.query(`
      INSERT INTO job_vacancies (
        campus_id, job_code, title, department, category, subject, classes,
        branch, vacancies_count, min_qualification, experience_required, salary_range,
        job_description, skills_required, application_deadline, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'Open')
      ON CONFLICT (job_code) DO UPDATE SET title = EXCLUDED.title
      RETURNING id, job_code;
    `, [
      campusId, v.code, v.title, v.department, v.category, v.subject, v.classes,
      v.branch, v.count, v.qual, v.exp, v.salary, v.desc, v.skills, v.deadline
    ]);
    vacMap[v.code] = res.rows[0].id;
  }

  // 2. Seed Sample Candidates & Applications
  const candidates = [
    {
      code: 'CBS-CAN-2026-0101',
      vacCode: 'CBS-JOB-2026-01',
      name: 'Sunita Mehra',
      email: 'sunita.mehra@example.com',
      mobile: '+919871122334',
      dob: '1993-04-12',
      gender: 'Female',
      location: 'Rohini, New Delhi',
      pos: 'PRT Mathematics Teacher',
      qual: 'M.Sc (Maths), B.Ed, CTET Paper 1 & 2 Cleared',
      exp: 4.5,
      employer: 'Delhi Public School (Rohini)',
      currSal: '₹42,000 / month',
      expSal: '₹52,000 / month',
      notice: 15,
      source: 'School Website',
      status: 'Interview',
      rating: 5,
      notes: 'Exceptional conceptual clarity in Fractions and Geometry.'
    },
    {
      code: 'CBS-CAN-2026-0102',
      vacCode: 'CBS-JOB-2026-01',
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@example.com',
      mobile: '+919810998877',
      dob: '1995-08-22',
      gender: 'Male',
      location: 'Noida Sector 62',
      pos: 'PRT Mathematics Teacher',
      qual: 'B.Sc (Maths), B.Ed',
      exp: 3.0,
      employer: 'Amity International School',
      currSal: '₹38,000 / month',
      expSal: '₹48,000 / month',
      notice: 30,
      source: 'LinkedIn',
      status: 'Shortlisted',
      rating: 4,
      notes: 'Good experience with smart boards and olympiad training.'
    },
    {
      code: 'CBS-CAN-2026-0103',
      vacCode: 'CBS-JOB-2026-02',
      name: 'Priyanka Sen',
      email: 'priyanka.sen@example.com',
      mobile: '+919955443322',
      dob: '1991-11-05',
      gender: 'Female',
      location: 'Indirapuram, Ghaziabad',
      pos: 'TGT English Educator',
      qual: 'M.A (English Lit), B.Ed',
      exp: 6.0,
      employer: 'Cambridge School',
      currSal: '₹48,000 / month',
      expSal: '₹58,000 / month',
      notice: 15,
      source: 'Naukri',
      status: 'Offer Sent',
      rating: 5,
      notes: 'Selected after demo class with Grade 7. Outstanding command of grammar and literature.'
    },
    {
      code: 'CBS-CAN-2026-0104',
      vacCode: 'CBS-JOB-2026-03',
      name: 'Kavita Rawat',
      email: 'kavita.rawat@example.com',
      mobile: '+919711002233',
      dob: '1998-02-14',
      gender: 'Female',
      location: 'Dwarka, New Delhi',
      pos: 'Senior Kindergarten / Pre-Primary Educator',
      qual: 'NTT & B.A (Psychology)',
      exp: 2.5,
      employer: 'Kidzee Preschool',
      currSal: '₹28,000 / month',
      expSal: '₹36,000 / month',
      notice: 7,
      source: 'Employee Referral',
      status: 'Joined',
      rating: 5,
      notes: 'Completed joining formalities. Onboarded to Faculty Master.'
    },
    {
      code: 'CBS-CAN-2026-0105',
      vacCode: 'CBS-JOB-2026-04',
      name: 'Manish Aggarwal',
      email: 'manish.aggarwal@example.com',
      mobile: '+919811224466',
      dob: '1989-09-18',
      gender: 'Male',
      location: 'Pitampura, New Delhi',
      pos: 'Senior School Accountant & ERP Administrator',
      qual: 'M.Com, Tally Certified Professional',
      exp: 5.0,
      employer: 'Modern School',
      currSal: '₹40,000 / month',
      expSal: '₹48,000 / month',
      notice: 30,
      source: 'Indeed',
      status: 'Applied',
      rating: 4,
      notes: 'Strong knowledge of student billing modules and PF/ESI compliance.'
    }
  ];

  for (const c of candidates) {
    const vacId = vacMap[c.vacCode];
    const appRes = await client.query(`
      INSERT INTO job_applications (
        campus_id, vacancy_id, candidate_code, full_name, email, mobile, dob,
        gender, current_location, position_applied, highest_qualification,
        experience_years, current_employer, current_salary, expected_salary,
        notice_period_days, source, status, rating, hr_notes, assigned_hr
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'HR Command')
      ON CONFLICT (candidate_code) DO UPDATE SET status = EXCLUDED.status
      RETURNING id, candidate_code;
    `, [
      campusId, vacId, c.code, c.name, c.email, c.mobile, c.dob,
      c.gender, c.location, c.pos, c.qual, c.exp, c.employer,
      c.currSal, c.expSal, c.notice, c.source, c.status, c.rating, c.notes
    ]);

    const appId = appRes.rows[0].id;

    // Seed Interview for Sunita
    if (c.name === 'Sunita Mehra') {
      await client.query(`
        INSERT INTO job_interviews (
          application_id, round_type, scheduled_date, scheduled_time,
          interviewer_name, venue_or_link, demo_subject, demo_class, demo_topic,
          evaluation_score, evaluation_criteria, recommendation, remarks, status
        ) VALUES (
          $1, 'Demo Class', '2026-08-25', '10:30 AM',
          'Academic Coordinator & HOD Maths', 'Room 302 (Grade 5A)', 'Mathematics',
          'Grade 5', 'Fractions & Geometric Shapes', 4.8,
          '{"subjectKnowledge": 5, "communication": 5, "teachingSkills": 5, "classroomManagement": 4, "confidence": 5}'::jsonb,
          'Recommended', 'Very dynamic teaching style with hands-on activity.', 'Scheduled'
        );
      `, [appId]);
    }

    // Seed Offer Letter for Priyanka Sen
    if (c.name === 'Priyanka Sen') {
      await client.query(`
        INSERT INTO job_offers (
          application_id, offer_letter_number, designation, department,
          joining_date, offered_salary_monthly, offered_ctc_annual, reporting_manager,
          work_location, terms_and_conditions, status
        ) VALUES (
          $1, 'CBS/HR/OFFER/2026-024', 'TGT English Educator', 'Languages & Humanities',
          '2026-09-01', 55000.00, 660000.00, 'Principal & Managing Director',
          'Crayon Box School Main Campus',
          'Probation period of 6 months. Entitled to standard school health benefits and term vacations.',
          'Offer Sent'
        );
      `, [appId]);
    }
  }

  console.log('✅ Seeded recruitment vacancies, candidates, interviews, and offer letters successfully!');
  await client.end();
}

initRecruitment().catch(console.error);
