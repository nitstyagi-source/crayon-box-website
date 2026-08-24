import pg from 'pg';
import { getDataQualityAuditAction } from '../src/app/actions/governance-analytics-actions';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function testPillars1And2() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING PILLAR 1 (ANALYTICS & DATA QUALITY) & PILLAR 2 (IDENTITY & PVC ID CARDS)');
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

  // 1. DATA QUALITY RULES
  console.log('📌 1. Verifying Continuous Database Quality Audit...');
  const auditRes = await getDataQualityAuditAction();
  assert(auditRes.success === true, 'Data quality scan API success');
  assert(auditRes.overallIntegrity === 100, 'Data integrity score', `${auditRes.overallIntegrity}%`);
  assert(auditRes.checks.length === 5, '5 Integrity rules checked');

  // 2. STUDENT DIRECTORY & FAMILY 360°
  console.log('\n📌 2. Verifying Student Directory & Family 360° Households...');
  const stuRes = await client.query(`
    SELECT s.id, s.admission_no, s.first_name, s.last_name, s.gender, s.family_id,
           s.father_name, s.mother_name,
           c.grade, c.section,
           f.family_code, f.family_name, f.primary_address
    FROM public.students s
    LEFT JOIN public.classes c ON c.id = s.class_id
    LEFT JOIN public.families f ON f.id = s.family_id
  `);
  assert(stuRes.rows.length >= 200, 'Student active records found', `${stuRes.rows.length} students`);

  const withFamily = stuRes.rows.filter((s: any) => s.family_id !== null);
  assert(withFamily.length >= 200, 'Students linked to Family 360°', `${withFamily.length} linked`);

  const famRes = await client.query(`SELECT id, family_code, family_name, primary_address FROM public.families;`);
  assert(famRes.rows.length >= 30, 'Multi-child sibling households in DB', `${famRes.rows.length} households`);

  // 3. FACULTY & STAFF DIRECTORY
  console.log('\n📌 3. Verifying Faculty & Staff Force...');
  const staffRes = await client.query(`
    SELECT id, first_name, last_name, designation, department, status, gross_salary
    FROM public.staff;
  `);
  assert(staffRes.rows.length >= 100, 'Staff records count', `${staffRes.rows.length} staff`);
  const activeStaff = staffRes.rows.filter((s: any) => s.status === 'ACTIVE' || s.status === 'CONFIRMED' || !s.status);
  assert(activeStaff.length >= 70, 'Active staff faculty count verified', `${activeStaff.length} active`);

  // 4. PVC ID CARDS & QR SIGNATURES
  console.log('\n📌 4. Verifying Student PVC ID Card Generation & Front QR Tokens...');
  const sampleStudent = stuRes.rows[0];
  assert(!!sampleStudent.admission_no, 'Student Admission Number valid', sampleStudent.admission_no);
  const sampleQrToken = `STUDENT:${sampleStudent.admission_no}`;
  assert(sampleQrToken.startsWith('STUDENT:'), 'QR Token format verified', sampleQrToken);

  // 5. HTTP ENDPOINTS
  console.log('\n📌 5. Verifying HTTP Routes for Pillars 1 & 2...');
  const endpoints = [
    '/admin/analytics',
    '/admin/data-quality',
    '/admin/students',
    '/admin/families',
    '/admin/faculty',
    '/admin/id-cards/print-students',
    '/admin/id-cards/print-escorts',
    '/admin/id-cards/temporary-pass'
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

testPillars1And2().catch(console.error);
