const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initVisitors() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS school_gate_passes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      pass_number VARCHAR(50) UNIQUE NOT NULL,
      visitor_name VARCHAR(150) NOT NULL,
      mobile_number VARCHAR(50) NOT NULL,
      photo_url TEXT,
      id_type VARCHAR(50) DEFAULT 'Aadhaar Card',
      id_number_masked VARCHAR(50) DEFAULT 'XXXX-XXXX-8921',
      visitor_type VARCHAR(50) NOT NULL,
      purpose VARCHAR(200) NOT NULL,
      person_to_meet VARCHAR(150) NOT NULL,
      department VARCHAR(100) DEFAULT 'Administration',
      entry_date DATE NOT NULL,
      entry_time VARCHAR(20) NOT NULL,
      expected_exit_time VARCHAR(20) DEFAULT '11:30 AM',
      exit_time VARCHAR(20),
      gate_number VARCHAR(50) DEFAULT 'Gate 1 (Main Gate)',
      security_guard_name VARCHAR(150) DEFAULT 'Inspector Deshmukh',
      vehicle_number VARCHAR(50),
      number_of_persons INTEGER DEFAULT 1,
      status VARCHAR(50) DEFAULT 'Inside',
      is_pre_registered BOOLEAN DEFAULT false,
      host_approval_status VARCHAR(50) DEFAULT 'Approved',
      host_response_time TIMESTAMPTZ,
      linked_student_id UUID REFERENCES students(id) ON DELETE SET NULL,
      linked_student_name VARCHAR(150),
      linked_student_class VARCHAR(50),
      escort_verified BOOLEAN DEFAULT false,
      delivery_item_details TEXT,
      pass_returned BOOLEAN DEFAULT false,
      remarks TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS restricted_visitors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
      visitor_name VARCHAR(150) NOT NULL,
      mobile_number VARCHAR(50) UNIQUE NOT NULL,
      id_number VARCHAR(50),
      reason_internal TEXT NOT NULL,
      effective_date DATE DEFAULT CURRENT_DATE,
      approved_by VARCHAR(150) DEFAULT 'Principal & Head of Security',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_passes_status ON school_gate_passes(status);
    CREATE INDEX IF NOT EXISTS idx_passes_date ON school_gate_passes(entry_date);
    CREATE INDEX IF NOT EXISTS idx_passes_mob ON school_gate_passes(mobile_number);
  `);

  console.log('✅ Created school_gate_passes and restricted_visitors tables!');

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  const todayStr = new Date().toISOString().split('T')[0];

  const samplePasses = [
    {
      pass: 'VIS-2026-00452',
      name: 'Rajesh Kumar',
      mob: '+919876543452',
      type: 'Parent',
      purpose: 'Meeting Academic Coordinator regarding Term 2 Olympiad Registration',
      host: 'Bhawna Tyagi (Coordinator)',
      dept: 'Academics',
      date: todayStr,
      time: '10:32 AM',
      expExit: '11:30 AM',
      exit: null,
      gate: 'Gate 1 (Main Gate)',
      vehicle: 'DL-3C-AZ-1120',
      persons: 1,
      status: 'Inside',
      preReg: false,
      hostApproval: 'Approved',
      stuName: 'Aarav Sharma',
      stuClass: 'Grade 5-A',
      escort: false,
      delivery: null,
      passRet: false,
      remarks: 'Signed in at reception'
    },
    {
      pass: 'VIS-2026-00453',
      name: 'ABC Science Services (Sunil Mehta)',
      mob: '+919811223399',
      type: 'Vendor',
      purpose: 'Robotics Lab Equipment Installation & Sensor Calibration',
      host: 'Admin Office',
      dept: 'Infrastructure & IT',
      date: todayStr,
      time: '11:05 AM',
      expExit: '01:00 PM',
      exit: null,
      gate: 'Gate 2 (Service Gate)',
      vehicle: 'DL-1L-CC-8821',
      persons: 2,
      status: 'Inside',
      preReg: true,
      hostApproval: 'Approved',
      stuName: null,
      stuClass: null,
      escort: false,
      delivery: 'Robotics sensor kits x 12 (Challan #8812)',
      passRet: false,
      remarks: 'Admin verified work order'
    },
    {
      pass: 'VIS-2026-00454',
      name: 'Sunita Sharma',
      mob: '+919871122334',
      type: 'Authorized Escort',
      purpose: 'Early Student Pickup for Dental Appointment',
      host: 'Sister Anjali (School Clinic)',
      dept: 'Health Clinic',
      date: todayStr,
      time: '11:45 AM',
      expExit: '12:15 PM',
      exit: '12:10 PM',
      gate: 'Gate 1 (Main Gate)',
      vehicle: 'DL-8C-BK-9901',
      persons: 1,
      status: 'Checked Out',
      preReg: false,
      hostApproval: 'Approved',
      stuName: 'Aarav Sharma',
      stuClass: 'Grade 5-A',
      escort: true,
      delivery: null,
      passRet: true,
      remarks: 'Escort QR card scanned and verified'
    },
    {
      pass: 'VIS-2026-00455',
      name: 'Amazon Logistics (Ramesh Yadav)',
      mob: '+919911002244',
      type: 'Delivery',
      purpose: 'Library Reference Books Parcel Delivery',
      host: 'Library / Accounts',
      dept: 'Administration',
      date: todayStr,
      time: '01:15 PM',
      expExit: '01:30 PM',
      exit: '01:25 PM',
      gate: 'Gate 1 (Main Gate)',
      vehicle: 'Two Wheeler DL-4S-7721',
      persons: 1,
      status: 'Checked Out',
      preReg: false,
      hostApproval: 'Approved',
      stuName: null,
      stuClass: null,
      escort: false,
      delivery: '3 Cartons - Library Books (Inv #AZ-8812)',
      passRet: true,
      remarks: 'Package received at gate security'
    },
    {
      pass: 'VIS-2026-00456',
      name: 'Dr. Vivek Mehra (DOE Inspection)',
      mob: '+919810445566',
      type: 'Government Official',
      purpose: 'Annual CBSE Affiliation Compliance Document Review',
      host: 'Principal Office',
      dept: 'Leadership',
      date: todayStr,
      time: '02:00 PM',
      expExit: '04:00 PM',
      exit: null,
      gate: 'Gate 1 (VIP Entry)',
      vehicle: 'DL-1C-GOV-001',
      persons: 2,
      status: 'Inside',
      preReg: true,
      hostApproval: 'Approved',
      stuName: null,
      stuClass: null,
      escort: false,
      delivery: null,
      passRet: false,
      remarks: 'Escorted by Vice Principal'
    }
  ];

  for (const p of samplePasses) {
    await client.query(`
      INSERT INTO school_gate_passes (
        campus_id, pass_number, visitor_name, mobile_number, visitor_type,
        purpose, person_to_meet, department, entry_date, entry_time,
        expected_exit_time, exit_time, gate_number, vehicle_number,
        number_of_persons, status, is_pre_registered, host_approval_status,
        linked_student_name, linked_student_class, escort_verified,
        delivery_item_details, pass_returned, remarks
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
      )
      ON CONFLICT (pass_number) DO UPDATE SET status = EXCLUDED.status;
    `, [
      campusId, p.pass, p.name, p.mob, p.type, p.purpose, p.host,
      p.dept, p.date, p.time, p.expExit, p.exit, p.gate, p.vehicle,
      p.persons, p.status, p.preReg, p.hostApproval, p.stuName,
      p.stuClass, p.escort, p.delivery, p.passRet, p.remarks
    ]);
  }

  // Seed sample Blacklisted / Restricted record
  await client.query(`
    INSERT INTO restricted_visitors (campus_id, visitor_name, mobile_number, id_number, reason_internal)
    VALUES ($1, 'Kishore Aggarwal', '+919999000011', 'XXXX-XXXX-0091', 'Restrained under court order / Unauthorized photography attempt')
    ON CONFLICT (mobile_number) DO NOTHING;
  `, [campusId]);

  console.log('✅ Seeded sample visitor passes and security blacklist records!');
  await client.end();
}

initVisitors().catch(console.error);
