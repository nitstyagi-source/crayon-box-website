import pg from 'pg';
import { submitAdmission } from '../src/app/actions/forms';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function testPillar3Admissions() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING PILLAR 3: ADMISSIONS CRM & ENROLLMENT LIFECYCLE');
  console.log('🧪 ========================================================\n');

  let passCount = 0;
  let testCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    testCount++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}${detail ? ` (${detail})` : ''}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
    }
  }

  const client = await pool.connect();

  // 1. ADMISSIONS PIPELINE & LEADS
  console.log('📌 1. Verifying Admissions Pipeline & Application Records...');
  const appRes = await client.query(`
    SELECT id, tracking_token, student_first_name, student_last_name, grade_applied, status, created_at
    FROM public.admissions_applications;
  `);
  console.log(`Found ${appRes.rows.length} applications in PostgreSQL.`);

  // 2. SUBMITTING A NEW ONLINE ADMISSION APPLICATION
  console.log('\n📌 2. Testing Public 3-Step Admission Wizard Submission...');
  const formData = new FormData();
  formData.append('first_name', 'Aarav');
  formData.append('last_name', 'Kapoor');
  formData.append('parent_name', 'Mr. Vikram Kapoor');
  formData.append('parent_email', 'vikram.kapoor@example.com');
  formData.append('parent_phone', '+91 98111 22334');
  formData.append('grade', 'Grade 1');
  formData.append('dob', '2020-05-15');
  formData.append('document_url', 'https://example.com/birth_cert.pdf');

  const subRes = await submitAdmission(formData);
  assert(subRes.success === true, 'Public admission submitted successfully');
  assert(!!subRes.applicationId, 'Generated Application Reference Token', subRes.applicationId);

  // Verify in PostgreSQL
  const savedApp = (await client.query(`SELECT * FROM public.admissions_applications WHERE tracking_token = $1;`, [subRes.applicationId])).rows[0];
  assert(!!savedApp, 'Application saved in PostgreSQL', savedApp?.tracking_token);
  assert(savedApp.student_first_name === 'Aarav', 'Student first name verified', savedApp?.student_first_name);
  assert(savedApp.status === 'SUBMITTED', 'Initial stage status SUBMITTED', savedApp?.status);

  // 3. HTTP ENDPOINTS
  console.log('\n📌 3. Verifying HTTP Routes for Admissions CRM...');
  const endpoints = [
    '/admin/admissions/pipeline',
    '/admin/admissions',
    '/admin/enquiries',
    '/admissions/apply',
    `/admissions/track?token=${subRes.applicationId}`
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch('http://localhost:3000' + ep);
      assert(res.status === 200, `Route ${ep} returns HTTP 200 OK`);
    } catch (e: any) {
      assert(false, `Route ${ep} failed`, e.message);
    }
  }

  client.release();
  await pool.end();

  console.log('\n========================================================');
  console.log(`📊 FINAL RESULT: ${passCount} / ${testCount} Tests PASSED (${((passCount / testCount) * 100).toFixed(1)}% Success Rate)`);
  console.log('========================================================\n');
}

testPillar3Admissions().catch(console.error);
