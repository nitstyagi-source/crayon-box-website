const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initExpenses() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS school_expenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      expense_date DATE NOT NULL,
      department VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      expense_head VARCHAR(150) NOT NULL,
      vendor_payee VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      particulars JSONB DEFAULT '[]'::jsonb,
      amount NUMERIC(12,2) NOT NULL,
      payment_mode VARCHAR(50) DEFAULT 'Cash',
      payment_ref_no VARCHAR(100),
      bill_no VARCHAR(100),
      bill_date DATE,
      bank_name VARCHAR(150),
      cheque_no VARCHAR(100),
      attachment_url TEXT,
      entered_by VARCHAR(150) DEFAULT 'Accounts Team',
      remarks TEXT,
      status VARCHAR(50) DEFAULT 'Paid',
      approved_by VARCHAR(150),
      approved_at TIMESTAMPTZ,
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS school_vendors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      vendor_name VARCHAR(200) NOT NULL,
      contact_person VARCHAR(150),
      mobile VARCHAR(50),
      email VARCHAR(150),
      address TEXT,
      gst_number VARCHAR(50),
      bank_account_no VARCHAR(100),
      bank_name VARCHAR(100),
      ifsc_code VARCHAR(50),
      category VARCHAR(100),
      payment_terms VARCHAR(100) DEFAULT 'Net 15',
      total_paid NUMERIC(14,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS petty_cash_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      log_date DATE NOT NULL,
      transaction_type VARCHAR(50) NOT NULL,
      particulars VARCHAR(250) NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      running_balance NUMERIC(10,2) NOT NULL,
      cashier_name VARCHAR(150) DEFAULT 'Accountant',
      expense_id UUID REFERENCES school_expenses(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS expense_budgets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      academic_session VARCHAR(50) DEFAULT '2026-2027',
      expense_head VARCHAR(150) NOT NULL,
      allocated_budget NUMERIC(12,2) NOT NULL,
      actual_spent NUMERIC(12,2) DEFAULT 0,
      alert_threshold_percentage INTEGER DEFAULT 80,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_date ON school_expenses(expense_date);
    CREATE INDEX IF NOT EXISTS idx_expenses_cat ON school_expenses(category);
    CREATE INDEX IF NOT EXISTS idx_expenses_status ON school_expenses(status);
  `);

  console.log('✅ Created school_expenses, school_vendors, petty_cash_logs, and expense_budgets tables!');

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  // 1. Seed Sample Vendors
  const sampleVendors = [
    {
      name: 'ABC Stationers & Book Depot',
      person: 'Ramesh Gupta',
      mobile: '+919811223344',
      email: 'abcstationers.delhi@gmail.com',
      address: 'Shop 14, Main Market, Burari, Delhi - 110084',
      gst: '07AAAAA0000A1Z5',
      cat: 'Stationery',
      paid: 45000.00
    },
    {
      name: 'Bright Power Electricals & Solar',
      person: 'Suresh Verma',
      mobile: '+919871100223',
      email: 'brightpower.services@gmail.com',
      address: 'Industrial Area, GT Karnal Road, Delhi',
      gst: '07BBBBB1111B2Z6',
      cat: 'Electricity & Maintenance',
      paid: 85000.00
    },
    {
      name: 'Royal Transport Logistics Fleet',
      person: 'Jaswant Singh',
      mobile: '+919810556677',
      email: 'royaltrans.cbs@gmail.com',
      address: 'Transport Nagar, Outer Ring Road, Delhi',
      gst: '07CCCCC2222C3Z7',
      cat: 'Transport & Fuel',
      paid: 120000.00
    },
    {
      name: 'CleanPro Facility & Hygiene Services',
      person: 'Vikas Sharma',
      mobile: '+919910334455',
      email: 'cleanpro.hygiene@gmail.com',
      address: 'Shastri Park Ext, Burari, Delhi',
      gst: '07DDDDD3333D4Z8',
      cat: 'Cleaning & Housekeeping',
      paid: 36000.00
    }
  ];

  for (const v of sampleVendors) {
    await client.query(`
      INSERT INTO school_vendors (
        campus_id, vendor_name, contact_person, mobile, email, address,
        gst_number, category, total_paid, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Active')
    `, [campusId, v.name, v.person, v.mobile, v.email, v.address, v.gst, v.cat, v.paid]);
  }

  // 2. Seed Sample Expenses
  const todayStr = new Date().toISOString().split('T')[0];
  const sampleExpenses = [
    {
      date: todayStr,
      dept: 'Academics & Examination',
      cat: 'Stationery',
      head: 'Stationery & Printing Material',
      vendor: 'ABC Stationers & Book Depot',
      desc: 'Class notebooks, student attendance registers and examination printing sheets',
      particulars: JSON.stringify([
        { item: 'Class Notebooks (Pack of 50)', amount: 4500.00 },
        { item: 'Teacher Attendance Registers', amount: 1500.00 }
      ]),
      amount: 6000.00,
      mode: 'Cash',
      billNo: 'INV-2548',
      billDate: todayStr,
      status: 'Paid',
      approvedBy: 'Managing Trustee',
      remarks: 'Purchased for primary and kindergarten wings.'
    },
    {
      date: todayStr,
      dept: 'Campus Infrastructure',
      cat: 'Maintenance',
      head: 'Electrical Maintenance & Light Fitting Repairs',
      vendor: 'Bright Power Electricals & Solar',
      desc: 'LED tube light replacements in Ground Floor Corridors and AC servicing in Lab',
      particulars: JSON.stringify([
        { item: 'LED Batten 20W (20 units)', amount: 6500.00 },
        { item: 'Science Lab Air Conditioner Servicing & Gas Top-up', amount: 6000.00 }
      ]),
      amount: 12500.00,
      mode: 'Bank Transfer',
      paymentRef: 'NEFT-AXIS-992014',
      bankName: 'Axis Bank - Burari Branch',
      billNo: 'BPE/2026/89',
      billDate: todayStr,
      status: 'Paid',
      approvedBy: 'Campus Manager',
      remarks: 'Approved under annual electrical maintenance contract.'
    },
    {
      date: todayStr,
      dept: 'Student Transport',
      cat: 'Transport',
      head: 'CNG Fuel & Bus Routine Inspection',
      vendor: 'Royal Transport Logistics Fleet',
      desc: 'CNG fuel filling for Bus Fleet Route 1, 2, and 3',
      particulars: JSON.stringify([
        { item: 'Bus Route 1 CNG Fuel (DL 1VA 8921)', amount: 2800.00 },
        { item: 'Bus Route 2 CNG Fuel (DL 1VA 8922)', amount: 2600.00 },
        { item: 'Bus Route 3 CNG Fuel (DL 1VA 8923)', amount: 2400.00 }
      ]),
      amount: 7800.00,
      mode: 'UPI',
      paymentRef: 'UPI-HDFC-88291029',
      billNo: 'CNG-RECEIPT-901',
      billDate: todayStr,
      status: 'Paid',
      approvedBy: 'Transport In-charge',
      remarks: 'Daily morning and afternoon shift transit fuel.'
    },
    {
      date: todayStr,
      dept: 'Housekeeping & Sanitation',
      cat: 'Cleaning',
      head: 'Sanitation Supplies & Floor Disinfectants',
      vendor: 'CleanPro Facility & Hygiene Services',
      desc: 'Monthly hygiene package including hand washes, sanitizers, and floor cleaners',
      particulars: JSON.stringify([
        { item: 'Floor Disinfectant (50 Litres)', amount: 3200.00 },
        { item: 'Automated Hand Sanitizer Refills', amount: 1800.00 }
      ]),
      amount: 5000.00,
      mode: 'Cash',
      billNo: 'CP-AUG-44',
      billDate: todayStr,
      status: 'Paid',
      approvedBy: 'Admin Supervisor',
      remarks: 'Stock replenished for restroom hygiene compliance.'
    },
    {
      date: todayStr,
      dept: 'Administration',
      cat: 'Electricity',
      head: 'BSES Electricity Bill (Primary Wing)',
      vendor: 'BSES Yamuna Power Limited',
      desc: 'Monthly grid electricity tariff for school premises',
      particulars: JSON.stringify([
        { item: 'Energy Charges (CA No. 10082910)', amount: 42000.00 }
      ]),
      amount: 42000.00,
      mode: 'Bank Transfer',
      paymentRef: 'RTGS-HDFC-991204',
      bankName: 'HDFC Bank - Current A/c',
      billNo: 'BSES-2026-AUG-892',
      billDate: todayStr,
      status: 'Approved',
      approvedBy: 'Principal',
      remarks: 'Scheduled for immediate online settlement.'
    }
  ];

  for (const exp of sampleExpenses) {
    await client.query(`
      INSERT INTO school_expenses (
        campus_id, expense_date, department, category, expense_head,
        vendor_payee, description, particulars, amount, payment_mode,
        payment_ref_no, bill_no, bill_date, bank_name, status, approved_by, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `, [
      campusId, exp.date, exp.dept, exp.cat, exp.head, exp.vendor,
      exp.desc, exp.particulars, exp.amount, exp.mode, exp.paymentRef || null,
      exp.billNo, exp.billDate, exp.bankName || null, exp.status, exp.approvedBy, exp.remarks
    ]);
  }

  // 3. Seed Sample Budgets
  const sampleBudgets = [
    { head: 'Electricity & Grid Utilities', budget: 1500000.00, spent: 1120000.00 },
    { head: 'Campus Maintenance & Repairs', budget: 1000000.00, spent: 780000.00 },
    { head: 'Stationery & Examination Material', budget: 600000.00, spent: 450000.00 },
    { head: 'Student Transport & Fuel Fleet', budget: 1200000.00, spent: 890000.00 },
    { head: 'Events, Annual Day & Celebrations', budget: 800000.00, spent: 340000.00 }
  ];

  for (const b of sampleBudgets) {
    await client.query(`
      INSERT INTO expense_budgets (
        campus_id, academic_session, expense_head, allocated_budget, actual_spent
      ) VALUES ($1, '2026-2027', $2, $3, $4)
    `, [campusId, b.head, b.budget, b.spent]);
  }

  // 4. Seed Petty Cash
  await client.query(`
    INSERT INTO petty_cash_logs (
      campus_id, log_date, transaction_type, particulars, amount, running_balance, cashier_name
    ) VALUES 
      ($1, $2, 'Opening', 'Opening Petty Cash Balance for August', 20000.00, 20000.00, 'Chief Cashier'),
      ($1, $2, 'Expense', 'Stationery purchases (ABC Stationers)', 6000.00, 14000.00, 'Chief Cashier'),
      ($1, $2, 'Expense', 'Emergency sanitation supplies', 1500.00, 12500.00, 'Chief Cashier')
  `, [campusId, todayStr]);

  console.log('✅ Seeded vendors, expenses, budgets, and petty cash logs successfully!');
  await client.end();
}

initExpenses().catch(console.error);
