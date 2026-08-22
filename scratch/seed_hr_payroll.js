const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initHrPayroll() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS staff_salary_advances (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
      staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
      staff_name VARCHAR(150) NOT NULL,
      advance_amount NUMERIC(10,2) NOT NULL,
      monthly_deduction NUMERIC(10,2) NOT NULL,
      total_installments INTEGER DEFAULT 4,
      remaining_balance NUMERIC(10,2) NOT NULL,
      reason VARCHAR(250),
      disbursement_date DATE DEFAULT CURRENT_DATE,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS staff_increments_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
      staff_name VARCHAR(150) NOT NULL,
      effective_date DATE NOT NULL,
      previous_designation VARCHAR(100),
      new_designation VARCHAR(100),
      previous_salary NUMERIC(10,2),
      new_salary NUMERIC(10,2),
      increment_type VARCHAR(50) DEFAULT 'Annual Appraisal',
      approved_by VARCHAR(150) DEFAULT 'Principal & Management',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS staff_hr_letters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
      staff_name VARCHAR(150) NOT NULL,
      letter_type VARCHAR(50) NOT NULL,
      issue_date DATE DEFAULT CURRENT_DATE,
      reference_no VARCHAR(50) UNIQUE NOT NULL,
      content TEXT,
      issued_by VARCHAR(150) DEFAULT 'HR Director',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('✅ Created HR extensions tables!');

  // Seed sample Payroll Ledgers for August 2026
  const staffRes = await client.query('SELECT id, first_name, last_name, designation, basic_salary, gross_salary FROM staff LIMIT 6;');
  const sampleStaff = staffRes.rows;

  for (const s of sampleStaff) {
    const base = Number(s.basic_salary || s.gross_salary || 35000);
    const lwp = 1;
    const lwpDed = Math.round((base / 30) * lwp);
    const pf = Math.round(base * 0.12);
    const net = base - lwpDed - pf;

    await client.query(`
      INSERT INTO payroll_ledgers (
        staff_id, month, base_salary, lwp_days, lwp_deduction, allowances, net_payable, payment_status, processed_at
      ) VALUES ($1, '2026-08', $2, $3, $4, 4000, $5, 'Paid', NOW())
      ON CONFLICT DO NOTHING;
    `, [s.id, base, lwp, lwpDed, net]);
  }

  // Seed Salary Advance
  if (sampleStaff.length > 0) {
    const s1 = sampleStaff[0];
    await client.query(`
      INSERT INTO staff_salary_advances (
        campus_id, staff_id, staff_name, advance_amount, monthly_deduction, total_installments, remaining_balance, reason
      ) VALUES (
        (SELECT id FROM campuses LIMIT 1), $1, $2, 20000.00, 5000.00, 4, 15000.00, 'Medical emergency support for family'
      ) ON CONFLICT DO NOTHING;
    `, [s1.id, s1.first_name + ' ' + (s1.last_name || '')]);

    // Seed Increment History
    await client.query(`
      INSERT INTO staff_increments_history (
        staff_id, staff_name, effective_date, previous_designation, new_designation, previous_salary, new_salary, increment_type
      ) VALUES (
        $1, $2, '2026-04-01', 'PRT Mathematics', 'TGT Mathematics & Olympiad Mentor', 35000.00, 42000.00, 'Promotion'
      ) ON CONFLICT DO NOTHING;
    `, [s1.id, s1.first_name + ' ' + (s1.last_name || '')]);

    // Seed HR Letter
    await client.query(`
      INSERT INTO staff_hr_letters (
        staff_id, staff_name, letter_type, reference_no, content
      ) VALUES (
        $1, $2, 'Promotion Letter', 'HR-LTR-2026-0041',
        'Congratulations on your promotion to TGT Mathematics & Olympiad Mentor with revised CTC of ₹42,000/month.'
      ) ON CONFLICT (reference_no) DO NOTHING;
    `, [s1.id, s1.first_name + ' ' + (s1.last_name || '')]);
  }

  console.log('✅ Seeded HR payroll ledgers, advances, increments, and HR letters!');
  await client.end();
}

initHrPayroll().catch(console.error);
