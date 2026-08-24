import pg from 'pg';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function seedBatchC() {
  const client = await pool.connect();
  console.log('⏳ Seeding Helpdesk Grievances, Purchase Orders, and Vendors in PostgreSQL...');

  const stuRes = await client.query(`
    SELECT s.id, s.first_name, s.last_name, s.admission_no,
           COALESCE(c.grade, 'Class 1') as class_name,
           s.father_name
    FROM public.students s
    LEFT JOIN public.classes c ON c.id = s.class_id
    LIMIT 4;
  `);
  const students = stuRes.rows;

  // 1. Seed Helpdesk Tickets & Grievances
  await client.query(`DELETE FROM public.helpdesk_tickets;`);

  const mockTickets = [
    {
      num: 'TCK-2026-0104',
      student: students[0],
      cat: 'TRANSPORT',
      sub: 'Bus Route 02 Morning Pickup Delay Notification Request',
      desc: 'Requesting real-time SMS ping 5 minutes prior to bus arrival at Sector 62 stop.',
      pri: 'MEDIUM',
      dept: 'Transport Operations',
      stat: 'RESOLVED',
      res: 'GPS geofence radius adjusted to 800m. Automated SMS trigger confirmed active.'
    },
    {
      num: 'TCK-2026-0105',
      student: students[1],
      cat: 'FINANCE',
      sub: 'Sibling Concession Discount Reflection on Term 2 Invoice',
      desc: 'Inquiring if the 20% second child concession is applied for younger sibling in Nursery.',
      pri: 'HIGH',
      dept: 'Accounts & Billing',
      stat: 'RESOLVED',
      res: 'Sibling Concession rule applied. ₹8,000 credit adjustment processed in double-entry ledger.'
    },
    {
      num: 'TCK-2026-0106',
      student: students[2],
      cat: 'ACADEMICS',
      sub: 'Request for Extra Remedial Mathematics Worksheets',
      desc: 'Student requires additional practice for Term 1 algebraic fractions before final moderation.',
      pri: 'LOW',
      dept: 'Academic Coordinator',
      stat: 'OPEN',
      res: null
    }
  ];

  for (const t of mockTickets) {
    await client.query(`
      INSERT INTO public.helpdesk_tickets (
        campus_id, ticket_number, student_id, student_name,
        admission_no, class_name, parent_name, category,
        subject, description, priority, assigned_department,
        status, resolution_notes, sla_target_hours, created_at
      ) VALUES (
        'c3d782a9-a50b-4708-a3fc-6b146f456662', $1, $2, $3,
        $4, $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, 24, NOW()
      )
    `, [
      t.num, t.student.id, `${t.student.first_name} ${t.student.last_name}`,
      t.student.admission_no || 'CBS-2026-0001', t.student.class_name,
      t.student.father_name || 'Parent', t.cat,
      t.sub, t.desc, t.pri, t.dept,
      t.stat, t.res
    ]);
  }

  // 2. Vendors & Purchase Orders
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.purchase_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      po_number VARCHAR(50) NOT NULL,
      vendor_name VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      order_date DATE DEFAULT CURRENT_DATE,
      delivery_due_date DATE DEFAULT CURRENT_DATE + INTERVAL '14 days',
      total_amount NUMERIC(12,2) NOT NULL,
      status VARCHAR(30) DEFAULT 'APPROVED',
      approved_by VARCHAR(100) DEFAULT 'Finance Director',
      items_summary TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`DELETE FROM public.purchase_orders;`);

  const mockPOs = [
    { po: 'PO-2026-091', vendor: 'Dell India Pvt Ltd', cat: 'IT Infrastructure', amt: 650000, stat: 'DELIVERED', items: '10x Dell OptiPlex Core-i7 AI Workstations for Robotics Lab' },
    { po: 'PO-2026-092', vendor: 'Olympus Scientific India', cat: 'Science Labs', amt: 210000, stat: 'APPROVED', items: '12x Binocular Research Microscopes for Senior Biology Lab' },
    { po: 'PO-2026-093', vendor: 'National Paper Mills Ltd', cat: 'Stationery', amt: 145000, stat: 'DELIVERED', items: '500x Reams 75 GSM Copier Paper & 450x CBSE Exam Answer Booklets' }
  ];

  for (const p of mockPOs) {
    await client.query(`
      INSERT INTO public.purchase_orders (
        po_number, vendor_name, category, total_amount, status, items_summary, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW()
      )
    `, [p.po, p.vendor, p.cat, p.amt, p.stat, p.items]);
  }

  console.log(`✅ Successfully seeded Helpdesk Tickets and Purchase Orders in PostgreSQL!`);
  client.release();
  await pool.end();
}

seedBatchC().catch(console.error);
