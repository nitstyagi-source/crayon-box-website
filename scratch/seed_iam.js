const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initIam() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS user_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(150) UNIQUE NOT NULL,
      email VARCHAR(150),
      phone_number VARCHAR(50),
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      primary_role VARCHAR(50) NOT NULL,
      linked_roles JSONB DEFAULT '[]'::jsonb,
      account_status VARCHAR(50) DEFAULT 'Active',
      must_change_password BOOLEAN DEFAULT false,
      force_2fa BOOLEAN DEFAULT false,
      two_factor_secret VARCHAR(100),
      failed_login_attempts INTEGER DEFAULT 0,
      last_login_at TIMESTAMPTZ DEFAULT NOW(),
      last_login_ip VARCHAR(50) DEFAULT '192.168.1.10',
      last_login_device VARCHAR(150) DEFAULT 'MacBook Pro / Chrome',
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_account_id UUID REFERENCES user_accounts(id) ON DELETE CASCADE,
      session_token VARCHAR(255) UNIQUE NOT NULL,
      device_type VARCHAR(50) DEFAULT 'Chrome on MacOS',
      ip_address VARCHAR(50) DEFAULT '192.168.1.45',
      location VARCHAR(100) DEFAULT 'Delhi, India',
      last_active_at TIMESTAMPTZ DEFAULT NOW(),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS auth_otp_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      phone_number VARCHAR(50) NOT NULL,
      otp_code_hash VARCHAR(255) NOT NULL,
      purpose VARCHAR(50) NOT NULL,
      attempts INTEGER DEFAULT 0,
      is_verified BOOLEAN DEFAULT false,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS login_audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(150) NOT NULL,
      user_account_id UUID,
      auth_method VARCHAR(50) NOT NULL,
      device_info VARCHAR(150) NOT NULL,
      ip_address VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL,
      failure_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_usr_acc_uname ON user_accounts(username);
    CREATE INDEX IF NOT EXISTS idx_usr_acc_phone ON user_accounts(phone_number);
    CREATE INDEX IF NOT EXISTS idx_log_audit_u ON login_audit_logs(username, created_at);
  `);

  console.log('✅ Created user_accounts, user_sessions, auth_otp_logs, and login_audit_logs tables!');

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  const stuRes = await client.query('SELECT id, first_name, last_name FROM students LIMIT 2;');
  const stuIds = stuRes.rows.map(r => r.id);

  // 1. Seed Accounts
  const users = [
    {
      username: 'admin@crayonboxschool.com',
      email: 'admin@crayonboxschool.com',
      phone: '+919818000001',
      name: 'Super Administrator',
      role: 'Super Admin',
      linked: [
        { role: 'Super Admin', title: 'Institutional Superuser', dashboardUrl: '/admin/dashboard' }
      ],
      mustChange: false,
      force2fa: true,
      pass: 'admin123'
    },
    {
      username: 'principal@crayonboxschool.com',
      email: 'principal@crayonboxschool.com',
      phone: '+919818000002',
      name: 'Dr. Meenakshi Sundaram',
      role: 'Principal',
      linked: [
        { role: 'Principal', title: 'Head of Institution', dashboardUrl: '/admin/dashboard' }
      ],
      mustChange: false,
      force2fa: true,
      pass: 'principal123'
    },
    {
      username: 'neha.sharma@crayonboxschool.com',
      email: 'neha.sharma@crayonboxschool.com',
      phone: '+919876543452',
      name: 'Neha Sharma',
      role: 'Faculty',
      linked: [
        {
          role: 'Faculty',
          title: 'PRT Mathematics & Mentor',
          employeeId: 'EMP-00102',
          department: 'Academics',
          dashboardUrl: '/staff/dashboard'
        },
        {
          role: 'Parent',
          title: 'Parent of Aarav & Ananya',
          studentIds: stuIds,
          children: [
            { name: 'Aarav Sharma', class: 'Grade 5-A', id: stuIds[0] || 'STU-01' },
            { name: 'Ananya Sharma', class: 'Grade 2-B', id: stuIds[1] || 'STU-02' }
          ],
          dashboardUrl: '/parent/dashboard'
        }
      ],
      mustChange: false,
      force2fa: false,
      pass: 'neha123'
    },
    {
      username: 'CB2605421',
      email: 'aarav.sharma@student.crayonboxschool.com',
      phone: '+919876543452',
      name: 'Aarav Sharma & Family',
      role: 'Student',
      linked: [
        {
          role: 'Student',
          title: 'Student (CB2605421)',
          studentId: stuIds[0] || 'STU-01',
          class: 'Grade 5-A',
          dashboardUrl: '/parent/dashboard'
        },
        {
          role: 'Parent',
          title: 'Parent Portal (Nitin Sharma)',
          phone: '+919876543452',
          children: [
            { name: 'Aarav Sharma', class: 'Grade 5-A', id: stuIds[0] || 'STU-01' },
            { name: 'Ananya Sharma', class: 'Grade 2-B', id: stuIds[1] || 'STU-02' }
          ],
          dashboardUrl: '/parent/dashboard'
        }
      ],
      mustChange: false,
      force2fa: false,
      pass: 'student123'
    },
    {
      username: '+919876543452',
      email: 'nitin.sharma@gmail.com',
      phone: '+919876543452',
      name: 'Nitin Sharma (Parent)',
      role: 'Parent',
      linked: [
        {
          role: 'Parent',
          title: 'Parent of Aarav & Ananya',
          children: [
            { name: 'Aarav Sharma', class: 'Grade 5-A', id: stuIds[0] || 'STU-01' },
            { name: 'Ananya Sharma', class: 'Grade 2-B', id: stuIds[1] || 'STU-02' }
          ],
          dashboardUrl: '/parent/dashboard'
        }
      ],
      mustChange: false,
      force2fa: false,
      pass: 'parent123'
    }
  ];

  for (const u of users) {
    const res = await client.query(`
      INSERT INTO user_accounts (
        campus_id, username, email, phone_number, password_hash, full_name,
        primary_role, linked_roles, account_status, must_change_password, force_2fa
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active', $9, $10)
      ON CONFLICT (username) DO UPDATE SET
        linked_roles = EXCLUDED.linked_roles,
        phone_number = EXCLUDED.phone_number
      RETURNING id, username;
    `, [
      campusId, u.username, u.email, u.phone, u.pass, u.name,
      u.role, JSON.stringify(u.linked), u.mustChange, u.force2fa
    ]);

    const accId = res.rows[0].id;

    // Seed Active Session
    await client.query(`
      INSERT INTO user_sessions (user_account_id, session_token, device_type, ip_address, location)
      VALUES ($1, $2, 'Chrome / macOS (Desktop)', '192.168.1.10', 'New Delhi, India')
      ON CONFLICT DO NOTHING;
    `, [accId, `SESS-TOKEN-${accId.slice(0, 8)}`]);
  }

  // Seed sample Login Audit Logs
  const audits = [
    { u: 'neha.sharma@crayonboxschool.com', m: 'Password', d: 'Chrome / macOS', ip: '192.168.1.10', s: 'Success' },
    { u: 'CB2605421', m: 'MSG91 OTP', d: 'Safari / iPhone 15 Pro', ip: '122.160.42.15', s: 'Success' },
    { u: 'admin@crayonboxschool.com', m: 'Password + 2FA', d: 'Chrome / macOS', ip: '192.168.1.2', s: 'Success' },
    { u: 'admin@crayonboxschool.com', m: 'Password', d: 'Unknown Firefox / Linux', ip: '45.112.20.1', s: 'Failed - Bad Password', r: 'Invalid credentials attempted' },
    { u: '+919876543452', m: 'MSG91 OTP', d: 'Mobile App / Android', ip: '122.160.42.18', s: 'Success' }
  ];

  for (const a of audits) {
    await client.query(`
      INSERT INTO login_audit_logs (username, auth_method, device_info, ip_address, status, failure_reason)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [a.u, a.m, a.d, a.ip, a.s, a.r || null]);
  }

  console.log('✅ Seeded IAM user accounts, multi-role profile switchers, active sessions, and login audits!');
  await client.end();
}

initIam().catch(console.error);
