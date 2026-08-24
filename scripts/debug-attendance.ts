import pg from 'pg';
import { recordStudentGateScanAction } from '../src/app/actions/gate-attendance-actions';

const pool = new pg.Pool({ 
  connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testGateEntryExit() {
  console.log('🔍 ========================================================');
  console.log('🔍 TESTING DUAL CHECKPOINT ENTRY & EXIT ATTENDANCE + NOTIFICATIONS');
  console.log('🔍 ========================================================\n');

  const client = await pool.connect();
  try {
    // 1. Check if public.student_gate_attendance_logs table exists
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'student_gate_attendance_logs';
    `);
    console.log(`📌 1. Table student_gate_attendance_logs exists: ${tableRes.rows.length > 0}`);

    if (tableRes.rows.length === 0) {
      console.log('   Creating table public.student_gate_attendance_logs...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.student_gate_attendance_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
          institution_code VARCHAR(20) DEFAULT 'CBS',
          academic_session VARCHAR(20) DEFAULT '2026-2027',
          class_name VARCHAR(50) NOT NULL,
          section_name VARCHAR(20) NOT NULL,
          date DATE NOT NULL,
          status VARCHAR(30) DEFAULT 'PRESENT',
          gate_status VARCHAR(30) DEFAULT 'IN_CAMPUS',
          entry_time TIMESTAMPTZ,
          exit_time TIMESTAMPTZ,
          entry_gate VARCHAR(255) DEFAULT 'Gate 1 — Main Campus Entrance',
          exit_gate VARCHAR(255),
          entry_method VARCHAR(50) DEFAULT 'QR_SCAN',
          exit_method VARCHAR(50),
          qr_token TEXT,
          parent_sms_alert BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      console.log('   ✅ Table created successfully!');
    }

    // 2. Fetch a sample active student
    const sampleStu = await client.query(`
      SELECT s.id, s.first_name, s.last_name, s.universal_id, s.admission_no
      FROM public.students s
      WHERE s.status = 'Active' OR s.status = 'ACTIVE'
      LIMIT 1;
    `);

    if (sampleStu.rows.length > 0) {
      const student = sampleStu.rows[0];
      console.log(`\n📌 2. Testing Entry Scan for student: ${student.first_name} ${student.last_name} (${student.admission_no})...`);
      
      // Test ENTRY scan
      const entryRes = await recordStudentGateScanAction({
        studentId: student.id,
        scanType: 'ENTRY',
        gateName: 'Gate 1 — Main Campus Entrance'
      });
      console.log('   Entry Result Action:', entryRes.action);
      console.log('   Entry Message:', entryRes.message);
      console.log('   Entry Timestamp:', entryRes.attendance?.entryTime);

      // Test EXIT scan
      console.log(`\n📌 3. Testing Exit Scan for student: ${student.first_name} ${student.last_name}...`);
      const exitRes = await recordStudentGateScanAction({
        studentId: student.id,
        scanType: 'EXIT',
        gateName: 'Gate 2 — Campus Exit Turnstile'
      });
      console.log('   Exit Result Action:', exitRes.action);
      console.log('   Exit Message:', exitRes.message);
      console.log('   Exit Timestamp:', exitRes.attendance?.exitTime);
      console.log('   Gate Status:', exitRes.attendance?.gateStatus);

      // Verify records in student_attendance_records
      const attRecords = await client.query(`
        SELECT event_type, status, time, verification_method, parent_notified
        FROM public.student_attendance_records
        WHERE student_id = $1 AND date = CURRENT_DATE
        ORDER BY created_at DESC;
      `, [student.id]);
      console.log('\n📌 4. Verified records in public.student_attendance_records:');
      attRecords.rows.forEach((r: any) => {
        console.log(`   - [${r.event_type}] Status: ${r.status}, Time: ${r.time}, Method: ${r.verification_method}, Parent Notified: ${r.parent_notified}`);
      });
    }

  } catch (err: any) {
    console.error('Error testing gate entry/exit:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

testGateEntryExit();
