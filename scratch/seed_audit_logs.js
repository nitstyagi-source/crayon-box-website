const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initAuditLogs() {
  await client.connect();

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  const stuRes = await client.query('SELECT id FROM students LIMIT 1');
  const studentId = stuRes.rows[0]?.id;

  const staffRes = await client.query('SELECT id FROM staff LIMIT 1');
  const staffId = staffRes.rows[0]?.id;

  const authRes = await client.query('SELECT id FROM auth.users LIMIT 1;');
  const userId = authRes.rows[0]?.id || '3e7a6538-17db-4cb4-8ffe-1a2ebb022091';

  if (studentId && staffId) {
    const sampleLogs = [
      {
        action: 'UPDATE_FEE_ALLOCATION',
        entity_type: 'fee_payment_allocations',
        entity_id: studentId,
        old_val: JSON.stringify({ tuition_fee: 2500, transport_fee: 1200, total: 3700 }),
        new_val: JSON.stringify({ tuition_fee: 3000, transport_fee: 1200, total: 4200 }),
        ip: '192.168.1.45'
      },
      {
        action: 'APPROVE_LEAVE_AND_GENERATE_SUBSTITUTION',
        entity_type: 'leave_requests',
        entity_id: staffId,
        old_val: JSON.stringify({ status: 'Pending', substitute: null }),
        new_val: JSON.stringify({ status: 'Approved', substitute: 'Sunita Sharma (PRT Maths)', periods_reassigned: ['Period 2 (5-A)', 'Period 4 (5-B)'] }),
        ip: '192.168.1.10'
      },
      {
        action: 'STUDENT_ROUTE_MODIFIED',
        entity_type: 'student_transport_assignments',
        entity_id: studentId,
        old_val: JSON.stringify({ route: 'Route R-02', stop: 'Sant Nagar', fee_monthly: 1200 }),
        new_val: JSON.stringify({ route: 'Route R-05 (Burari)', stop: 'Phool Bagh', fee_monthly: 1500, effective_date: '2026-09-01' }),
        ip: '192.168.1.22'
      }
    ];

    for (const l of sampleLogs) {
      await client.query(`
        INSERT INTO audit_logs (campus_id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [campusId, userId, l.action, l.entity_type, l.entity_id, l.old_val, l.new_val, l.ip]);
    }

    console.log('✅ Seeded central audit trail logs successfully with valid user_id!');
  }

  await client.end();
}

initAuditLogs().catch(console.error);
