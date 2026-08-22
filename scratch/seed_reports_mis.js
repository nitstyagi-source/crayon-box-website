const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initReportsMis() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS fee_payment_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      receipt_number VARCHAR(50) UNIQUE NOT NULL,
      invoice_id VARCHAR(50) NOT NULL,
      student_id UUID REFERENCES students(id) ON DELETE SET NULL,
      student_name VARCHAR(150) NOT NULL,
      admission_no VARCHAR(50),
      class_name VARCHAR(50) NOT NULL,
      section_name VARCHAR(50) NOT NULL,
      fee_month VARCHAR(50) NOT NULL,
      academic_session VARCHAR(50) DEFAULT '2026-27',
      payment_date DATE NOT NULL,
      payment_time VARCHAR(20) DEFAULT '10:30 AM',
      payment_mode VARCHAR(50) NOT NULL,
      transaction_id VARCHAR(150) NOT NULL,
      gateway_order_id VARCHAR(100),
      gateway_payment_id VARCHAR(100),
      bank_reference VARCHAR(100),
      cheque_number VARCHAR(100),
      amount_received NUMERIC(12,2) NOT NULL,
      payment_status VARCHAR(50) DEFAULT 'Success',
      collected_by VARCHAR(150) DEFAULT 'Main Accounts Counter',
      counter VARCHAR(50) DEFAULT 'Counter 1',
      remarks TEXT,
      is_reconciled BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS fee_payment_allocations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      payment_transaction_id UUID REFERENCES fee_payment_transactions(id) ON DELETE CASCADE,
      fee_head_id UUID REFERENCES fee_heads(id) ON DELETE SET NULL,
      fee_head_name VARCHAR(150) NOT NULL,
      amount_allocated NUMERIC(12,2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved_custom_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
      report_name VARCHAR(150) NOT NULL,
      module VARCHAR(50) NOT NULL,
      report_type VARCHAR(100) NOT NULL,
      filters_config JSONB NOT NULL,
      selected_columns JSONB NOT NULL,
      created_by VARCHAR(150) DEFAULT 'Admin',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_fpt_date ON fee_payment_transactions(payment_date);
    CREATE INDEX IF NOT EXISTS idx_fpt_mode ON fee_payment_transactions(payment_mode);
    CREATE INDEX IF NOT EXISTS idx_fpa_ptid ON fee_payment_allocations(payment_transaction_id);
    CREATE INDEX IF NOT EXISTS idx_fpa_fhname ON fee_payment_allocations(fee_head_name);
  `);

  console.log('✅ Created fee_payment_transactions, fee_payment_allocations, saved_custom_reports tables!');

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  // Fetch Fee Heads
  const fhRes = await client.query('SELECT id, name FROM fee_heads;');
  const feeHeadMap = {};
  fhRes.rows.forEach(r => { feeHeadMap[r.name] = r.id; });

  // Today Date & August sample data
  const todayStr = '2026-08-21';

  // Sample transactions for 21 August 2026
  const sampleTransactions = [
    {
      rec: 'REC-2026-08125',
      inv: 'INV-00125',
      name: 'Aarav Sharma',
      adm: 'CBS-2026-0129',
      cls: 'Grade 5',
      sec: 'A',
      month: 'Aug-26',
      date: '2026-08-21',
      time: '09:15 AM',
      mode: 'UPI',
      txId: 'UPI87452912',
      gwOrder: null,
      gwPay: null,
      bankRef: 'HDFC-UPI-88192',
      amount: 4950.00,
      allocations: [
        { name: 'Tuition Fee', amt: 3000.00 },
        { name: 'Annual Charges', amt: 500.00 },
        { name: 'Transport Fee', amt: 1200.00 },
        { name: 'Activity Fee', amt: 250.00 }
      ]
    },
    {
      rec: 'REC-2026-08126',
      inv: 'INV-00126',
      name: 'Ananya Gupta',
      adm: 'CBS-2026-0188',
      cls: 'Grade 3',
      sec: 'B',
      month: 'Aug-26',
      date: '2026-08-21',
      time: '10:05 AM',
      mode: 'Cash',
      txId: 'CASH-458',
      gwOrder: null,
      gwPay: null,
      bankRef: null,
      amount: 3850.00,
      allocations: [
        { name: 'Tuition Fee', amt: 3000.00 },
        { name: 'Annual Charges', amt: 500.00 },
        { name: 'Activity Fee', amt: 250.00 },
        { name: 'Late Fee', amt: 100.00 }
      ]
    },
    {
      rec: 'REC-2026-08127',
      inv: 'INV-00127',
      name: 'Rohan Verma',
      adm: 'CBS-2026-0199',
      cls: 'Grade 6',
      sec: 'A',
      month: 'Aug-26',
      date: '2026-08-21',
      time: '11:20 AM',
      mode: 'Razorpay',
      txId: 'pay_RZP7854291',
      gwOrder: 'order_RZP882910',
      gwPay: 'pay_RZP7854291',
      bankRef: 'AXIS-PG-9901',
      amount: 5700.00,
      allocations: [
        { name: 'Tuition Fee', amt: 3500.00 },
        { name: 'Annual Charges', amt: 500.00 },
        { name: 'Transport Fee', amt: 1500.00 },
        { name: 'Examination Fee', amt: 200.00 }
      ]
    },
    {
      rec: 'REC-2026-08128',
      inv: 'INV-00128',
      name: 'Kabir Saxena',
      adm: 'CBS-2026-0195',
      cls: 'Grade 5',
      sec: 'A',
      month: 'Aug-26',
      date: '2026-08-21',
      time: '12:10 PM',
      mode: 'Bank Transfer',
      txId: 'NEFT-SBIN260812',
      gwOrder: null,
      gwPay: null,
      bankRef: 'SBI-NEFT-99120',
      amount: 5200.00,
      allocations: [
        { name: 'Tuition Fee', amt: 3000.00 },
        { name: 'Annual Charges', amt: 500.00 },
        { name: 'Transport Fee', amt: 1200.00 },
        { name: 'Computer & AI Fee', amt: 500.00 }
      ]
    },
    {
      rec: 'REC-2026-08129',
      inv: 'INV-00129',
      name: 'Advik Nair',
      adm: 'CBS-2026-0210',
      cls: 'Grade 5',
      sec: 'A',
      month: 'Aug-26',
      date: '2026-08-21',
      time: '01:45 PM',
      mode: 'Cheque',
      txId: 'CHQ-882910',
      gwOrder: null,
      gwPay: null,
      bankRef: 'ICICI-CHQ-00812',
      amount: 4750.00,
      allocations: [
        { name: 'Tuition Fee', amt: 3000.00 },
        { name: 'Annual Charges', amt: 500.00 },
        { name: 'Transport Fee', amt: 1000.00 },
        { name: 'Activity Fee', amt: 250.00 }
      ]
    },
    {
      rec: 'REC-2026-08130',
      inv: 'INV-00130',
      name: 'Diya Mehra',
      adm: 'CBS-2026-0245',
      cls: 'Grade 2',
      sec: 'A',
      month: 'Aug-26',
      date: '2026-08-21',
      time: '02:30 PM',
      mode: 'UPI',
      txId: 'UPI99201827',
      gwOrder: null,
      gwPay: null,
      bankRef: 'PAYTM-UPI-7712',
      amount: 4250.00,
      allocations: [
        { name: 'Tuition Fee', amt: 2800.00 },
        { name: 'Annual Charges', amt: 500.00 },
        { name: 'Activity Fee', amt: 250.00 },
        { name: 'School App & ID Card', amt: 700.00 }
      ]
    }
  ];

  for (const t of sampleTransactions) {
    const res = await client.query(`
      INSERT INTO fee_payment_transactions (
        campus_id, receipt_number, invoice_id, student_name, admission_no,
        class_name, section_name, fee_month, academic_session, payment_date,
        payment_time, payment_mode, transaction_id, gateway_order_id,
        gateway_payment_id, bank_reference, amount_received, payment_status,
        collected_by, counter, remarks
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, '2026-27', $9, $10, $11, $12, $13, $14, $15, $16, 'Success', 'Main Accounts', 'Counter 1', 'Fee Collection'
      )
      ON CONFLICT (receipt_number) DO UPDATE SET amount_received = EXCLUDED.amount_received
      RETURNING id;
    `, [
      campusId, t.rec, t.inv, t.name, t.adm, t.cls, t.sec, t.month,
      t.date, t.time, t.mode, t.txId, t.gwOrder, t.gwPay, t.bankRef, t.amount
    ]);

    const txId = res.rows[0].id;

    // Insert Allocations
    for (const alloc of t.allocations) {
      await client.query(`
        INSERT INTO fee_payment_allocations (
          payment_transaction_id, fee_head_id, fee_head_name, amount_allocated
        ) VALUES ($1, $2, $3, $4)
      `, [txId, feeHeadMap[alloc.name] || null, alloc.name, alloc.amt]);
    }
  }

  // Seed default Saved Custom Reports
  const savedReports = [
    {
      name: 'Daily Cash Collection',
      mod: 'Finance',
      type: 'Fee Collection',
      filters: { paymentMode: 'Cash', dateRange: 'Today' },
      cols: ['Invoice No.', 'Student Name', 'Class', 'Tuition Fee', 'Total Received']
    },
    {
      name: 'Monthly Fee Collection',
      mod: 'Finance',
      type: 'Fee Collection',
      filters: { month: 'August 2026', paymentMode: 'All' },
      cols: ['Invoice No.', 'Student Name', 'Class', 'Tuition Fee', 'Annual Charges', 'Transport Fee', 'Activity Fee', 'Total Received']
    },
    {
      name: 'Transport Fee Collection',
      mod: 'Transport',
      type: 'Transport Collection',
      filters: { feeHead: 'Transport Fee' },
      cols: ['Student Name', 'Class', 'Route', 'Transport Fee', 'Payment Mode']
    },
    {
      name: 'Student Strength by Gender & Class',
      mod: 'Students',
      type: 'Class-wise Strength',
      filters: { session: '2026-27' },
      cols: ['Class', 'Section', 'Boys', 'Girls', 'Total Students']
    }
  ];

  for (const sr of savedReports) {
    await client.query(`
      INSERT INTO saved_custom_reports (
        campus_id, report_name, module, report_type, filters_config, selected_columns
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [campusId, sr.name, sr.mod, sr.type, JSON.stringify(sr.filters), JSON.stringify(sr.cols)]);
  }

  console.log('✅ Seeded fee transactions, dynamic fee-head allocations, and saved custom reports!');
  await client.end();
}

initReportsMis().catch(console.error);
