const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initHelpdesk() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS helpdesk_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      ticket_number VARCHAR(50) UNIQUE NOT NULL,
      student_id UUID REFERENCES students(id) ON DELETE SET NULL,
      student_name VARCHAR(150) NOT NULL,
      admission_no VARCHAR(50),
      class_name VARCHAR(100) NOT NULL,
      parent_name VARCHAR(150) NOT NULL,
      parent_email VARCHAR(150),
      parent_phone VARCHAR(50),
      category VARCHAR(100) NOT NULL,
      subject VARCHAR(250) NOT NULL,
      description TEXT NOT NULL,
      priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
      assigned_department VARCHAR(100) NOT NULL DEFAULT 'Help Desk',
      assigned_to_name VARCHAR(150),
      status VARCHAR(50) NOT NULL DEFAULT 'Submitted',
      preferred_contact_method VARCHAR(50) DEFAULT 'App Notification',
      attachment_url TEXT,
      action_taken TEXT,
      resolution_notes TEXT,
      sla_target_hours INTEGER DEFAULT 24,
      sla_breached BOOLEAN DEFAULT false,
      escalated_to VARCHAR(100),
      satisfaction_rating INTEGER,
      parent_feedback TEXT,
      resolved_at TIMESTAMPTZ,
      closed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS helpdesk_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id UUID REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
      sender_type VARCHAR(50) NOT NULL,
      sender_name VARCHAR(150) NOT NULL,
      sender_role VARCHAR(100) DEFAULT 'Parent',
      message TEXT NOT NULL,
      is_internal_note BOOLEAN DEFAULT false,
      attachment_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_tickets_status ON helpdesk_tickets(status);
    CREATE INDEX IF NOT EXISTS idx_tickets_cat ON helpdesk_tickets(category);
    CREATE INDEX IF NOT EXISTS idx_tickets_prio ON helpdesk_tickets(priority);
    CREATE INDEX IF NOT EXISTS idx_messages_tid ON helpdesk_messages(ticket_id);
  `);

  console.log('✅ Created helpdesk_tickets and helpdesk_messages tables!');

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  // 1. Seed Sample Tickets
  const sampleTickets = [
    {
      num: 'TKT-2026-00458',
      stuName: 'Aarav Sharma',
      admNo: 'CBS-2026-0129',
      cls: 'Grade 5-A',
      parentName: 'Nitin Tyagi',
      parentPhone: '+919871122334',
      parentEmail: 'nitin.tyagi@example.com',
      cat: 'Transport',
      sub: 'Morning Bus Route 05 delay at Burari Chowk',
      desc: 'Bus arrived 25 minutes late for the last three consecutive days causing student to miss morning assembly.',
      prio: 'High',
      dept: 'Transport Manager',
      assignee: 'Jaswant Singh (Transport Head)',
      status: 'In Progress',
      action: 'Route timing and traffic bottleneck at Burari intersection reviewed with driver.',
      resNotes: 'Pickup schedule adjusted by 10 minutes from tomorrow morning.',
      sla: 24,
      breached: false
    },
    {
      num: 'TKT-2026-00421',
      stuName: 'Ananya Gupta',
      admNo: 'CBS-2026-0188',
      cls: 'Grade 4-B',
      parentName: 'Rekha Gupta',
      parentPhone: '+919811002233',
      parentEmail: 'rekha.gupta@example.com',
      cat: 'Fees',
      sub: 'Term 2 Fee Receipt duplicate copy request',
      desc: 'Paid online via Razorpay but receipt download showed a gateway timeout.',
      prio: 'Medium',
      dept: 'Accounts',
      assignee: 'Senior Accountant',
      status: 'Resolved',
      action: 'Transaction verified against bank settlement statement.',
      resNotes: 'Official fee receipt generated and synced directly to Parent Portal.',
      sla: 48,
      breached: false,
      rating: 5,
      feedback: 'Very prompt resolution within 2 hours. Downloaded the receipt from portal.'
    },
    {
      num: 'TKT-2026-00462',
      stuName: 'Kabir Saxena',
      admNo: 'CBS-2026-0195',
      cls: 'Grade 5-A',
      parentName: 'Meenakshi Saxena',
      parentPhone: '+919988776655',
      parentEmail: 'meenakshi@example.com',
      cat: 'Academics',
      sub: 'Maths Unit 4 homework clarification and worksheet access',
      desc: 'Digital diary worksheet link for Fractions is giving a 404 error.',
      prio: 'Medium',
      dept: 'Academic Coordinator',
      assignee: 'Rahul Sharma (Maths PRT)',
      status: 'In Progress',
      action: 'Re-uploaded PDF to student portal.',
      resNotes: null,
      sla: 24,
      breached: false
    },
    {
      num: 'TKT-2026-00465',
      stuName: 'Advik Nair',
      admNo: 'CBS-2026-0210',
      cls: 'Grade 5-A',
      parentName: 'Sanjay Nair',
      parentPhone: '+919811998877',
      parentEmail: 'sanjay.nair@example.com',
      cat: 'Medical',
      sub: 'Peanut allergy alert and medication storage at school clinic',
      desc: 'Advik has a diagnosed peanut allergy. Requesting emergency epinephrine pen storage at the clinic.',
      prio: 'Critical',
      dept: 'Medical Staff',
      assignee: 'Sister Anjali (School Nurse)',
      status: 'Resolved',
      action: 'Medical profile updated in Health Clinic master and canteen supervisors alerted.',
      resNotes: 'EpiPen securely stored in climate-controlled clinic emergency kit.',
      sla: 4,
      breached: false,
      rating: 5,
      feedback: 'Thank you for taking child medical safety so seriously.'
    }
  ];

  for (const t of sampleTickets) {
    const res = await client.query(`
      INSERT INTO helpdesk_tickets (
        campus_id, ticket_number, student_name, admission_no, class_name,
        parent_name, parent_phone, parent_email, category, subject, description,
        priority, assigned_department, assigned_to_name, status, action_taken,
        resolution_notes, sla_target_hours, sla_breached, satisfaction_rating, parent_feedback
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      ON CONFLICT (ticket_number) DO UPDATE SET status = EXCLUDED.status
      RETURNING id, ticket_number;
    `, [
      campusId, t.num, t.stuName, t.admNo, t.cls, t.parentName, t.parentPhone,
      t.parentEmail, t.cat, t.sub, t.desc, t.prio, t.dept, t.assignee,
      t.status, t.action, t.resNotes, t.sla, t.breached, t.rating || null, t.feedback || null
    ]);

    const ticketId = res.rows[0].id;

    // Seed conversation for Ticket 458 (Transport)
    if (t.num === 'TKT-2026-00458') {
      await client.query(`
        INSERT INTO helpdesk_messages (ticket_id, sender_type, sender_name, sender_role, message, is_internal_note, created_at)
        VALUES 
          ($1, 'Parent', 'Nitin Tyagi', 'Parent', 'Bus arrived 25 minutes late for the last three consecutive days at Burari Chowk.', false, NOW() - INTERVAL '5 hours'),
          ($1, 'Staff', 'Help Desk Command', 'Help Desk', 'We have acknowledged your complaint and routed it directly to Jaswant Singh (Transport Head).', false, NOW() - INTERVAL '4 hours 30 minutes'),
          ($1, 'Staff', 'Jaswant Singh', 'Transport Manager', 'INTERNAL NOTE: Checked GPS replay of Bus 01 for Aug 19-21. Heavy road digging on Burari bypass caused a 20-min choke. Diverting route via outer ring.', true, NOW() - INTERVAL '3 hours'),
          ($1, 'Staff', 'Jaswant Singh', 'Transport Manager', 'Dear Parent, we have reviewed the route GPS log and shifted the morning departure 10 minutes earlier. Bus will arrive promptly at 07:20 AM tomorrow.', false, NOW() - INTERVAL '1 hour')
      `, [ticketId]);
    }
  }

  console.log('✅ Seeded help desk tickets and message threads successfully!');
  await client.end();
}

initHelpdesk().catch(console.error);
